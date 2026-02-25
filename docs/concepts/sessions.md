---
title: Sessions
sidebar_position: 5
description: Session tracking, heartbeats, state management, and fleet visibility.
---

# Sessions

A session represents an active connection between an AI agent and CacheBash. Sessions track what each agent is doing, how far along it is, and when it last checked in. They're the foundation for fleet monitoring and health checks.

## Why sessions matter

Without session tracking, you have no visibility into what your agents are doing. You can't tell if an agent is stuck, finished, or crashed. You can't see progress from your phone. You can't detect when a session has silently died.

Sessions solve this by giving each active agent a presence in the system. Other agents can see who's online. The mobile app shows real-time status. The fleet health dashboard flags agents that haven't sent a heartbeat.

## Creating a session

When your agent starts work, create a session:

```json
{
  "name": "create_session",
  "arguments": {
    "name": "Fixing auth module",
    "programId": "builder",
    "state": "working",
    "progress": 0
  }
}
```

Response:

```json
{
  "success": true,
  "sessionId": "abc123",
  "message": "Session created"
}
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `name` | Yes | Human-readable description of what the agent is doing |
| `programId` | No | Program identity (links session to a program) |
| `state` | No | `working` (default), `blocked`, `complete`, or `pinned` |
| `progress` | No | 0-100 percentage |
| `sessionId` | No | Custom session ID (upserts if it already exists) |
| `projectName` | No | Project this session is working on |

## Updating a session

As work progresses, update the session:

```json
{
  "name": "update_session",
  "arguments": {
    "sessionId": "abc123",
    "status": "JWT validation implemented. Writing tests.",
    "progress": 65,
    "state": "working",
    "lastHeartbeat": true
  }
}
```

The `status` field is a short text description visible in the mobile app and fleet dashboard. Update it at natural breakpoints so anyone watching knows what's happening.

Setting `lastHeartbeat: true` updates the agent's heartbeat timestamp alongside the status. This tells the system the agent is still alive.

### Session states

| State | Meaning |
|-------|---------|
| `working` | Actively executing a task |
| `blocked` | Waiting on a dependency, human input, or another agent |
| `complete` | Finished all work, ready for decommission |
| `pinned` | Kept alive for reference (won't be cleaned up automatically) |

## Heartbeats

A heartbeat is a timestamp that proves your agent is still running. Agents that stop sending heartbeats are assumed to be dead or disconnected.

Send heartbeats by including `lastHeartbeat: true` in your `update_session` calls. For agents that are idle (not actively updating status), send a standalone heartbeat every 10 minutes to prevent the system from flagging the session as stale.

The fleet health dashboard (`get_fleet_health`) shows heartbeat age for every program. An agent with a stale heartbeat (over 15 minutes) is a signal that something may have gone wrong.

## Listing sessions

See all active sessions:

```json
{
  "name": "list_sessions",
  "arguments": {
    "state": "working"
  }
}
```

Response:

```json
{
  "success": true,
  "sessions": [
    {
      "sessionId": "abc123",
      "name": "Fixing auth module",
      "programId": "builder",
      "state": "working",
      "progress": 65,
      "status": "JWT validation implemented. Writing tests."
    },
    {
      "sessionId": "def456",
      "name": "Reviewing PR #42",
      "programId": "reviewer",
      "state": "working",
      "progress": 30,
      "status": "Checking type safety in auth.ts"
    }
  ]
}
```

### Filter options

| Parameter | Values | Description |
|-----------|--------|-------------|
| `state` | `working`, `blocked`, `pinned`, `complete`, `all` | Filter by session state |
| `programId` | Any program name | Filter by program |
| `includeArchived` | `true` / `false` | Include completed sessions |
| `limit` | 1-50 | Max results (default 10) |

## Context tracking

Sessions can track context window utilization to support rotation policies:

```json
{
  "name": "update_session",
  "arguments": {
    "sessionId": "abc123",
    "contextBytes": 85000,
    "handoffRequired": true
  }
}
```

When `handoffRequired` is true, it signals that the agent's context window is filling up and a fresh session should take over. The agent writes its state to program state (`update_program_state`), and the next session picks up seamlessly.

## Session lifecycle

A typical session lifecycle:

1. **Create** — Agent starts, creates session with `state: "working"`
2. **Update** — Agent sends status and heartbeat updates as it works
3. **Block** — If waiting on input, set `state: "blocked"`
4. **Resume** — When unblocked, set `state: "working"` again
5. **Complete** — When done, set `state: "complete"` and `progress: 100`

Sessions aren't explicitly deleted. They transition to `complete` and are eventually archived. Use `includeArchived: true` in `list_sessions` to see historical sessions.

## Next steps

- [Concepts: Programs](/concepts/programs) — Program identity and persistent state
- [Concepts: Authentication](/concepts/authentication) — API keys and security
- [Guides: Mobile App](/guides/mobile-app) — Monitor sessions from your phone
- [Reference: Sessions](/reference/mcp-tools/sessions) — Full session tool reference
