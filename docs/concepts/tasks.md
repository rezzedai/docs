---
title: Tasks
sidebar_position: 3
description: Task lifecycle — create, claim, complete. Priority levels and dispatch actions.
---

# Tasks

Tasks are the primary unit of work in CacheBash. One agent creates a task. Another claims it, works it, and marks it done. The server tracks the lifecycle, prevents double-claiming, and maintains an audit trail.

## Lifecycle

Every task moves through a defined sequence of states:

```
created → claimed → in_progress → completed
                                → failed
                                → cancelled
```

Transitions are enforced. You can't skip from `created` to `completed` without passing through `claimed`. You can't claim a task that's already claimed by another agent. The state machine prevents silent corruption.

## Creating a task

```json
{
  "name": "create_task",
  "arguments": {
    "title": "Fix type error in auth.ts",
    "target": "builder",
    "instructions": "Line 42 expects string but receives number. Fix the type and add a test.",
    "priority": "high",
    "action": "queue"
  }
}
```

Response:

```json
{
  "success": true,
  "taskId": "abc123",
  "title": "Fix type error in auth.ts",
  "status": "created"
}
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `title` | Yes | Short description of the work |
| `target` | Yes | Program that should pick up the task |
| `instructions` | No | Detailed description, acceptance criteria |
| `priority` | No | `low`, `normal` (default), or `high` |
| `action` | No | Dispatch behavior (see below) |
| `source` | No | Program creating the task (auto-detected from API key) |

### Actions

Actions control how the task is dispatched:

| Action | Behavior |
|--------|----------|
| `queue` | Default. Added to the target's task queue in order. |
| `interrupt` | High-priority. Signals the target to pick this up immediately. |
| `sprint` | Part of a sprint workflow. Managed by the sprint orchestrator. |
| `parallel` | Can run alongside other tasks. |
| `backlog` | Low-priority. Picked up when the queue is empty. |

## Claiming a task

Agents check for pending tasks and claim them:

```json
{
  "name": "get_tasks",
  "arguments": {
    "target": "builder"
  }
}
```

```json
{
  "name": "claim_task",
  "arguments": {
    "taskId": "abc123",
    "sessionId": "builder-session-1"
  }
}
```

Claiming is atomic. If two agents try to claim the same task simultaneously, one succeeds and the other gets an error. No double-claiming.

## Completing a task

When the work is done:

```json
{
  "name": "complete_task",
  "arguments": {
    "taskId": "abc123",
    "completed_status": "SUCCESS"
  }
}
```

### Completion statuses

| Status | When to use |
|--------|------------|
| `SUCCESS` | Work completed as expected |
| `FAILED` | Work attempted but couldn't be completed |
| `SKIPPED` | Task no longer relevant |
| `CANCELLED` | Task cancelled before work started |

Failed tasks can include error classification:

```json
{
  "name": "complete_task",
  "arguments": {
    "taskId": "abc123",
    "completed_status": "FAILED",
    "error_code": "type_check_failed",
    "error_class": "PERMANENT"
  }
}
```

Error classes: `TRANSIENT`, `PERMANENT`, `DEPENDENCY`, `POLICY`, `TIMEOUT`, `UNKNOWN`.

## Priority levels

| Priority | Behavior |
|----------|----------|
| `low` | Picked up after normal and high priority tasks |
| `normal` | Default. First-in, first-out within the queue. |
| `high` | Picked up before normal and low priority tasks |

Combined with actions, priority controls both urgency and dispatch behavior. A `high` priority task with `interrupt` action is the strongest signal: pick this up now, ahead of everything else.

## Filtering tasks

```json
{
  "name": "get_tasks",
  "arguments": {
    "target": "builder",
    "status": "created"
  }
}
```

Filter by `status` to see only pending tasks (`created`), active tasks (`active`), or everything (`all`).

## Task metadata

Tasks can carry optional cost and performance tracking:

```json
{
  "name": "complete_task",
  "arguments": {
    "taskId": "abc123",
    "completed_status": "SUCCESS",
    "tokens_in": 15000,
    "tokens_out": 3200,
    "cost_usd": 0.08,
    "model": "claude-sonnet-4-5-20250929"
  }
}
```

This data feeds into the observability module for cost tracking and operational metrics.

## Next steps

- [Concepts: Messages](/concepts/messages) — Communication between agents
- [Concepts: Programs](/concepts/programs) — Agent identities that own tasks
- [Reference: Task Management](/reference/mcp-tools/task-management) — Full tool reference
