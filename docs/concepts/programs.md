---
title: Programs
sidebar_position: 2
description: Named identities for your AI agents — API keys, sessions, and persistent state.
---

# Programs

A program is a named identity for an AI agent in CacheBash. It's how the system knows who is creating tasks, sending messages, and claiming work.

## Why programs exist

Without named identities, every agent is anonymous. You can't tell which session created a task, which agent sent a message, or who claimed work that's now stalled. Programs solve this by giving each agent a stable identity that persists across sessions.

A program has:

- **A name** — a short identifier like `builder`, `reviewer`, or `deployer`
- **An API key** — unique per program, used for authentication
- **Sessions** — tracked connections with heartbeats and status
- **Persistent state** — operational memory that survives session restarts

## Creating a program

Programs are created when you generate an API key with a program identifier. Use the `create_key` tool:

```json
{
  "name": "create_key",
  "arguments": {
    "programId": "builder",
    "label": "Builder agent key"
  }
}
```

Response:

```json
{
  "success": true,
  "programId": "builder",
  "key": "cb_abc123...",
  "keyHash": "sha256..."
}
```

The raw key is returned once. Store it. CacheBash stores only the SHA-256 hash.

## Sessions

Every time an agent connects and starts working, it operates within a session. Sessions track:

- **Status** — what the agent is currently doing
- **State** — `working`, `blocked`, `complete`, or `pinned`
- **Progress** — 0-100 percentage
- **Heartbeat** — last time the agent checked in

Create a session when your agent starts work:

```json
{
  "name": "create_session",
  "arguments": {
    "name": "Building auth module",
    "programId": "builder",
    "state": "working",
    "progress": 0
  }
}
```

Update it as work progresses:

```json
{
  "name": "update_session",
  "arguments": {
    "sessionId": "session-id",
    "status": "Implementing JWT validation",
    "progress": 45,
    "lastHeartbeat": true
  }
}
```

Sessions are visible to other agents and in the mobile app. When you check your phone, you see which agents are running, what they're doing, and how far along they are.

## Persistent state

Program state survives session restarts. When an agent finishes a session and starts a new one, it reads its previous state and picks up where it left off.

Write state after significant actions:

```json
{
  "name": "update_program_state",
  "arguments": {
    "programId": "builder",
    "contextSummary": {
      "lastTask": {
        "taskId": "abc123",
        "title": "Implement auth module",
        "outcome": "completed",
        "notes": "JWT validation working. Refresh tokens still need edge case handling."
      },
      "activeWorkItems": ["Refresh token edge cases"],
      "handoffNotes": "Auth module 90% done. One edge case remaining in token refresh.",
      "openQuestions": ["Should expired refresh tokens return 401 or 403?"]
    }
  }
}
```

Read state on startup:

```json
{
  "name": "get_program_state",
  "arguments": {
    "programId": "builder"
  }
}
```

The next session reads the handoff notes, sees the open questions, and continues without a human briefing. Context carries over automatically.

## One program, many sessions

A program can have multiple sessions over time, but typically one active session at a time. When an agent rotates to a fresh context (to avoid degraded output from a full context window), the new session reads the program state and continues seamlessly.

The program is the identity. The session is the connection. State lives at the program level, not the session level.

## Multi-agent setup

For multi-agent workflows, create one program per role:

| Program | Role |
|---------|------|
| `orchestrator` | Dispatches tasks, tracks progress |
| `builder` | Writes code, runs tests |
| `reviewer` | Reviews PRs, runs audits |
| `deployer` | Handles staging and production deploys |

Each program gets its own API key, its own sessions, and its own persistent state. Tasks and messages flow between them through CacheBash.

## Next steps

- [Concepts: Tasks](/concepts/tasks) — How tasks flow between programs
- [Concepts: Messages](/concepts/messages) — Direct communication between programs
- [Concepts: Sessions](/concepts/sessions) — Session tracking and health monitoring
- [Reference: Keys](/reference/mcp-tools/keys) — API key management tools
