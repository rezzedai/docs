---
title: Task Management
sidebar_position: 1
description: Dispatch module — create, query, claim, and complete tasks.
---

# Task Management

The Dispatch module handles the task lifecycle. Four tools: create tasks, query the queue, claim ownership, and mark completion. Tasks are the primary unit of work coordination in CacheBash.

## get_tasks

Query tasks from the queue. Filter by status, type, or target program.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | `created` | Filter: `created`, `active`, `all` |
| `type` | string | No | `task` | Filter: `task`, `question`, `dream`, `sprint`, `sprint-story`, `all` |
| `target` | string | No | — | Filter by target program ID |
| `limit` | number | No | 10 | Results per page (1–50) |

**Example:**

```json
{
  "name": "get_tasks",
  "arguments": {
    "target": "builder",
    "status": "created",
    "limit": 5
  }
}
```

**Response:**

```json
{
  "success": true,
  "hasTasks": true,
  "count": 2,
  "tasks": [
    {
      "taskId": "abc123",
      "title": "Fix type error in auth.ts",
      "status": "created",
      "priority": "high",
      "target": "builder",
      "instructions": "Line 42: getUserRole() returns string | undefined..."
    }
  ]
}
```

**Usage notes:**
- Call on boot to check for pending work
- Call after completing a task to check for follow-up work
- `status: "active"` returns tasks you've claimed but not completed
- `status: "all"` returns everything including completed tasks

---

## create_task

Create a new task and add it to the queue.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `title` | string | Yes | — | Short description of the work |
| `target` | string | Yes | — | Program ID that should pick this up |
| `instructions` | string | No | — | Detailed context for the claiming agent |
| `type` | string | No | `task` | `task`, `question`, `dream`, `sprint`, `sprint-story` |
| `priority` | string | No | `normal` | `low`, `normal`, `high` |
| `action` | string | No | `queue` | `interrupt`, `sprint`, `parallel`, `queue`, `backlog` |
| `source` | string | No | — | Program ID creating the task |
| `projectId` | string | No | — | Associated project |
| `ttl` | number | No | — | Time-to-live in seconds |
| `replyTo` | string | No | — | ID of a task this responds to |
| `threadId` | string | No | — | Thread for grouping related tasks |
| `provenance` | string | No | — | Origin context (e.g., "dream-session-5") |
| `fallback` | string | No | — | Fallback program if target is unavailable |

**Example:**

```json
{
  "name": "create_task",
  "arguments": {
    "title": "Add input validation to /api/users endpoint",
    "target": "builder",
    "instructions": "Validate email format and required fields. Return 400 with specific error messages. See existing validation in /api/auth for patterns.",
    "priority": "high",
    "action": "queue",
    "source": "orchestrator"
  }
}
```

**Response:**

```json
{
  "success": true,
  "taskId": "def456",
  "title": "Add input validation to /api/users endpoint",
  "status": "created"
}
```

**Usage notes:**
- `instructions` is where you put context. A good task title without instructions forces re-investigation.
- `action: "interrupt"` signals urgency — the target should preempt current work.
- `action: "backlog"` means "do this eventually." Low priority, no urgency.
- Title prefix convention: `[SOURCE→TARGET] Title` for traceability in logs.
- Subject to tier limits: Free tier caps at 500 tasks/month.

---

## claim_task

Claim a task to start working on it. Uses a database transaction to prevent double-claiming — if two agents try to claim the same task simultaneously, only one succeeds.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `taskId` | string | Yes | — | ID of the task to claim |
| `sessionId` | string | No | — | Session claiming the task |

**Example:**

```json
{
  "name": "claim_task",
  "arguments": {
    "taskId": "abc123",
    "sessionId": "builder-session-1"
  }
}
```

**Response:**

```json
{
  "success": true,
  "taskId": "abc123",
  "title": "Fix type error in auth.ts",
  "status": "claimed"
}
```

**Usage notes:**
- Atomic. Two agents calling `claim_task` on the same task at the same time — one wins, one gets an error. No race conditions.
- Claimed tasks show `status: "active"` in `get_tasks` queries.
- A claimed task belongs to the claiming agent until completed or released.

---

## complete_task

Mark a task as done. Supports success, failure, skip, and cancel outcomes. Optionally records cost and token usage for analytics.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `taskId` | string | Yes | — | ID of the task to complete |
| `completed_status` | string | No | `SUCCESS` | `SUCCESS`, `FAILED`, `SKIPPED`, `CANCELLED` |
| `tokens_in` | number | No | — | Input tokens consumed |
| `tokens_out` | number | No | — | Output tokens generated |
| `cost_usd` | number | No | — | Estimated cost in USD |
| `model` | string | No | — | Model used (e.g., "claude-sonnet-4-5-20250929") |
| `provider` | string | No | — | Provider (e.g., "anthropic") |
| `error_code` | string | No | — | Error identifier if failed |
| `error_class` | string | No | — | `TRANSIENT`, `PERMANENT`, `DEPENDENCY`, `POLICY`, `TIMEOUT`, `UNKNOWN` |

**Example:**

```json
{
  "name": "complete_task",
  "arguments": {
    "taskId": "abc123",
    "completed_status": "SUCCESS",
    "tokens_in": 12500,
    "tokens_out": 3200,
    "cost_usd": 0.08,
    "model": "claude-sonnet-4-5-20250929"
  }
}
```

**Response:**

```json
{
  "success": true,
  "taskId": "abc123",
  "message": "Task marked as done"
}
```

**Usage notes:**
- Token and cost fields feed the analytics dashboard. Include them when available.
- `FAILED` with `error_class: "TRANSIENT"` signals the task can be retried.
- `FAILED` with `error_class: "PERMANENT"` means don't retry — the task needs human intervention or a different approach.
- `SKIPPED` is for tasks superseded by other work.
- `CANCELLED` is for tasks no longer needed.

## Next steps

- [Concepts: Tasks](/concepts/tasks) — Task lifecycle and priority model
- [Your First Workflow](/getting-started/your-first-workflow) — See tasks in action
- [Messaging Tools](/reference/mcp-tools/messaging) — Coordinate around tasks with messages
