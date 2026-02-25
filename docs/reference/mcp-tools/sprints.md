---
title: Sprints
sidebar_position: 4
description: Sprint and Dream modules — parallel story execution, wave management, and autonomous sessions.
---

# Sprints

Two modules handle parallel work. **Sprint** orchestrates multiple stories in waves with dependency tracking. **Dream** enables autonomous overnight execution with budget caps.

## Sprint

### create_sprint

Create a sprint to orchestrate parallel story execution. Stories are grouped into waves. Stories within a wave run concurrently. Waves execute sequentially.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectName` | string | Yes | — | Project this sprint belongs to |
| `branch` | string | Yes | — | Git branch for the sprint |
| `stories` | array | Yes | — | Array of story objects (see below) |
| `sessionId` | string | No | — | Orchestrating session |
| `config` | object | No | — | Sprint configuration (see below) |

**Story object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique story ID |
| `title` | string | Yes | Short description |
| `wave` | number | Yes | Wave number (1-indexed). Same wave = parallel. |
| `dependencies` | string[] | No | Story IDs that must complete first |
| `complexity` | string | No | `normal` or `high` |
| `retryPolicy` | string | No | `none`, `auto_retry`, `escalate` |
| `maxRetries` | number | No | Retry limit (0–5) |

**Config object:**

| Field | Type | Description |
|-------|------|-------------|
| `orchestratorModel` | string | Model for orchestrator decisions |
| `subagentModel` | string | Model for story execution |
| `maxConcurrent` | number | Max parallel stories |

**Example:**

```json
{
  "name": "create_sprint",
  "arguments": {
    "projectName": "auth-refactor",
    "branch": "feat/auth-v2",
    "stories": [
      { "id": "s1", "title": "Add RS256 signing", "wave": 1 },
      { "id": "s2", "title": "Update token validation", "wave": 1 },
      { "id": "s3", "title": "Migrate existing tokens", "wave": 2, "dependencies": ["s1", "s2"] },
      { "id": "s4", "title": "Integration tests", "wave": 3, "dependencies": ["s3"] }
    ],
    "config": {
      "subagentModel": "claude-sonnet-4-5-20250929",
      "maxConcurrent": 3
    }
  }
}
```

**Usage notes:**
- Wave 1 stories start immediately. Wave 2 starts when all wave 1 stories complete. And so on.
- `dependencies` are enforced — a story won't start until all its dependencies are `complete`.
- `auto_retry` re-runs a failed story up to `maxRetries` times. `escalate` flags it for human review.
- Sprint creates a task of type `sprint` that tracks overall progress.

---

### update_sprint_story

Update a story's status and progress within a sprint.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sprintId` | string | Yes | — | Sprint containing the story |
| `storyId` | string | Yes | — | Story to update |
| `status` | string | No | — | `queued`, `active`, `complete`, `failed`, `skipped` |
| `progress` | number | No | — | Progress percentage (0–100) |
| `currentAction` | string | No | — | What the agent is doing right now |
| `model` | string | No | — | Model executing the story |

**Example:**

```json
{
  "name": "update_sprint_story",
  "arguments": {
    "sprintId": "sprint-abc",
    "storyId": "s1",
    "status": "active",
    "progress": 50,
    "currentAction": "Implementing RS256 signing in auth.service.ts"
  }
}
```

---

### add_story_to_sprint

Add a new story to a running sprint. Use this when scope expands mid-sprint.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sprintId` | string | Yes | — | Sprint to add to |
| `story` | object | Yes | — | Story object (`id`, `title`, `dependencies`, `complexity`) |
| `insertionMode` | string | No | `next_wave` | `current_wave`, `next_wave`, `backlog` |

**Example:**

```json
{
  "name": "add_story_to_sprint",
  "arguments": {
    "sprintId": "sprint-abc",
    "story": {
      "id": "s5",
      "title": "Update API documentation for new auth flow",
      "dependencies": ["s3"]
    },
    "insertionMode": "next_wave"
  }
}
```

**Usage notes:**
- `current_wave` adds the story to the currently executing wave (starts immediately if capacity allows).
- `next_wave` queues it for the next wave.
- `backlog` adds it to the end — runs after all planned waves.

---

### complete_sprint

Mark a sprint as complete. Records summary statistics.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sprintId` | string | Yes | — | Sprint to complete |
| `summary` | object | No | — | `completed`, `failed`, `skipped`, `duration` |

**Example:**

```json
{
  "name": "complete_sprint",
  "arguments": {
    "sprintId": "sprint-abc",
    "summary": {
      "completed": 4,
      "failed": 0,
      "skipped": 1,
      "duration": "23m"
    }
  }
}
```

---

### get_sprint

Get a sprint's full state including all stories, their statuses, and aggregate statistics.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sprintId` | string | Yes | — | Sprint to query |

**Usage notes:**
- Any authenticated program can read sprint state.
- Returns the full story list with per-story status, progress, and wave assignments.
- Useful for dashboards and progress monitoring.

---

## Dream

Dream sessions enable autonomous overnight execution with budget caps. Experimental.

### dream_peek

Lightweight check for pending dream sessions. Designed for shell hooks that need to detect queued dreams without heavy processing.

**Parameters:** None.

**Response:**

```json
{
  "hasDreams": true,
  "count": 1
}
```

**Usage notes:**
- Returns minimal data. Use to decide whether to spin up a full dream execution environment.
- Typically called from a shell hook or cron job.

---

### dream_activate

Atomically activate a dream session. Transitions it from queued to active. Only one agent can activate a given dream — uses a transaction to prevent double-activation.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dreamId` | string | Yes | — | Dream session to activate |

**Usage notes:**
- Atomic. Same transaction guarantee as `claim_task` — two agents racing to activate the same dream, only one wins.
- Budget caps are enforced at the infrastructure level. When `budget_consumed_usd >= budget_cap_usd`, further tool calls in the dream context are rejected.

## Next steps

- [Concepts: Overview](/concepts/overview) — Sprint module overview
- [Task Management](/reference/mcp-tools/task-management) — Stories create tasks under the hood
- [Admin Tools](/reference/mcp-tools/admin) — Cost tracking for sprint execution
