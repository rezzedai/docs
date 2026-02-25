---
title: Sessions
sidebar_position: 3
description: Pulse and Program State modules — session tracking, heartbeats, and persistent state.
---

# Sessions

Two modules manage agent lifecycle. **Pulse** tracks active sessions with heartbeats and progress. **Program State** persists operational memory across sessions for zero-cost handoffs.

## Pulse

### create_session

Register a new session. Sessions track active work and are visible in the mobile app.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | — | Display name for the session |
| `sessionId` | string | No | auto | Custom session ID. Upserts if exists. |
| `programId` | string | No | — | Associated program identity |
| `status` | string | No | — | Initial status message |
| `state` | string | No | `working` | `working`, `blocked`, `complete`, `pinned` |
| `progress` | number | No | — | Progress percentage (0–100) |
| `projectName` | string | No | — | Associated project |

**Example:**

```json
{
  "name": "create_session",
  "arguments": {
    "name": "Auth refactor",
    "sessionId": "builder-session-1",
    "programId": "builder",
    "status": "Starting auth module review",
    "state": "working"
  }
}
```

**Usage notes:**
- Sessions appear in the mobile app dashboard. Give them descriptive names.
- If you pass an existing `sessionId`, the session is upserted (updated, not duplicated).
- Subject to concurrent session limits per tier (Free: 1, Pro: 5, Team: 10).

---

### update_session

Update session status, progress, and heartbeat. This is the primary tool for keeping the mobile app informed of agent activity.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | Yes | — | Current status message |
| `sessionId` | string | No | — | Session to update |
| `state` | string | No | — | `working`, `blocked`, `complete`, `pinned` |
| `progress` | number | No | — | Progress percentage (0–100) |
| `projectName` | string | No | — | Associated project |
| `lastHeartbeat` | boolean | No | — | Set `true` to update the heartbeat timestamp |
| `contextBytes` | number | No | — | Current context window usage in bytes |
| `handoffRequired` | boolean | No | — | Flag when context rotation threshold exceeded |

**Example — status update:**

```json
{
  "name": "update_session",
  "arguments": {
    "sessionId": "builder-session-1",
    "status": "Auth fix implemented. Running tests.",
    "progress": 75,
    "lastHeartbeat": true
  }
}
```

**Example — heartbeat only:**

```json
{
  "name": "update_session",
  "arguments": {
    "sessionId": "builder-session-1",
    "status": "Idle. Waiting for tasks.",
    "lastHeartbeat": true
  }
}
```

**Usage notes:**
- Send heartbeats every 10 minutes during idle periods to prevent session staleness.
- `contextBytes` and `handoffRequired` support automated session rotation. Set `handoffRequired: true` when your context window exceeds 60% capacity.
- `state: "blocked"` signals that the session needs external input to proceed.
- `state: "pinned"` prevents automatic archival.

---

### list_sessions

List active sessions for the authenticated user.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `state` | string | No | `all` | Filter: `working`, `blocked`, `pinned`, `complete`, `all` |
| `programId` | string | No | — | Filter by program |
| `limit` | number | No | 10 | Results (1–50) |
| `includeArchived` | boolean | No | — | Include archived sessions |

**Example:**

```json
{
  "name": "list_sessions",
  "arguments": {
    "state": "working",
    "limit": 20
  }
}
```

---

### get_fleet_health

Get health status of all programs. Shows heartbeat age, pending messages, and pending tasks per program. Admin only.

**Parameters:** None.

**Example response:**

```json
{
  "programs": [
    {
      "programId": "builder",
      "lastHeartbeat": "2026-02-24T10:30:00Z",
      "heartbeatAge": "2m",
      "pendingMessages": 0,
      "pendingTasks": 1,
      "state": "working"
    },
    {
      "programId": "reviewer",
      "lastHeartbeat": "2026-02-24T10:15:00Z",
      "heartbeatAge": "17m",
      "pendingMessages": 2,
      "pendingTasks": 0,
      "state": "blocked"
    }
  ]
}
```

**Usage notes:**
- Use to detect stale or unresponsive agents.
- Heartbeat age over 15 minutes usually means the session died without cleanup.
- High pending message counts may indicate a stuck or crashed agent.

---

## Program State

### get_program_state

Read a program's persistent operational state. Programs can read their own state. Admin and auditor roles can read any program's state.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `programId` | string | Yes | — | Program to read |

**Example:**

```json
{
  "name": "get_program_state",
  "arguments": {
    "programId": "builder"
  }
}
```

**Response:**

```json
{
  "programId": "builder",
  "sessionId": "builder-session-3",
  "contextSummary": {
    "lastTask": "Fix auth type error",
    "activeWorkItems": [],
    "handoffNotes": "PR #42 merged. Auth module stable.",
    "openQuestions": []
  },
  "learnedPatterns": [
    {
      "id": "p-1",
      "domain": "auth",
      "pattern": "Always validate JWT expiry before role check",
      "confidence": 0.9
    }
  ]
}
```

**Usage notes:**
- Call on boot to restore context from the previous session.
- State persists indefinitely. It survives session rotation, crashes, and restarts.

---

### update_program_state

Write a program's persistent operational state. Partial updates merge with existing state — you don't need to send the full object every time.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `programId` | string | Yes | — | Program to update |
| `sessionId` | string | No | — | Current session |
| `contextSummary` | object | No | — | `lastTask`, `activeWorkItems`, `handoffNotes`, `openQuestions` |
| `learnedPatterns` | array | No | — | Array of pattern objects with `id`, `domain`, `pattern`, `confidence`, `evidence` |
| `config` | object | No | — | `preferredOutputFormat`, `toolPreferences`, `knownQuirks`, `customSettings` |
| `baselines` | object | No | — | `avgTaskDurationMinutes`, `commonFailureModes`, `sessionsCompleted`, `lastSessionDurationMinutes` |
| `decay` | object | No | — | `contextSummaryTTLDays`, `learnedPatternMaxAge`, `maxUnpromotedPatterns` |

**Example:**

```json
{
  "name": "update_program_state",
  "arguments": {
    "programId": "builder",
    "sessionId": "builder-session-4",
    "contextSummary": {
      "lastTask": "Add input validation to /api/users",
      "activeWorkItems": ["validation-pr"],
      "handoffNotes": "PR #45 in review. Validation covers email, name, role fields.",
      "openQuestions": ["Should we validate phone number format?"]
    }
  }
}
```

**Usage notes:**
- Write state after every significant task or decision. This is the mechanism that makes session handoff near-zero-cost.
- Partial writes merge. Sending only `contextSummary` doesn't overwrite `learnedPatterns`.
- Programs can only write their own state. Attempting to write another program's state returns an error.

## Next steps

- [Concepts: Sessions](/concepts/sessions) — Session lifecycle and health model
- [Concepts: Programs](/concepts/programs) — Program identity and state
- [Mobile App Guide](/guides/mobile-app) — Monitoring sessions from your phone
