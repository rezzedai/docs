---
title: Dream Sessions
sidebar_position: 6
description: Overnight autonomous execution — schedule work, sleep, wake up to results.
---

# Dream Sessions

Dream sessions are CacheBash's overnight batch processing mode. You define a batch of work before bed, go AFK, and wake up to completed tasks. The agent works autonomously while you sleep, within strict safety boundaries.

## What dream sessions are

A dream session is a scheduled batch of work assigned to an AI agent for overnight execution. You create the dream session with a list of tasks or goals. The agent activates the session, works through the queue, and reports results when done or when the budget cap is hit.

**Key properties:**
- Autonomous execution (no human in the loop)
- Budget caps (dollar limit, token limit, time limit)
- Git isolation (separate branch, draft PRs only)
- Safety guardrails (no deploys, no destructive operations)

**Use cases:**
- Code reviews across multiple PRs
- Refactoring tasks with large surface area
- Test writing for untested modules
- Documentation updates
- Security audits

## How it works

```
1. Create dream session
   ↓
2. Define budget + safety constraints
   ↓
3. Go AFK
   ↓
4. Agent calls dream_peek (finds pending dream)
   ↓
5. Agent calls dream_activate (atomically claims it)
   ↓
6. Agent works through the task queue
   ↓
7. Agent respects budget caps + safety rules
   ↓
8. Agent reports results (summary, logs, artifacts)
```

Dream sessions are **atomic**. If two agents call `dream_activate` on the same dream simultaneously, only one succeeds. No double-execution.

## MCP tools

### dream_peek

Lightweight check for pending dreams. Used in shell hooks or boot scripts to detect overnight work.

**Parameters:** None

**Example:**

```json
{
  "name": "dream_peek",
  "arguments": {}
}
```

**Response:**

```json
{
  "hasDream": true,
  "dreamId": "dream-abc123",
  "title": "Refactor auth module",
  "taskCount": 12,
  "budgetUSD": 5.00
}
```

**Usage notes:**
- Returns quickly (no heavy queries)
- Safe to call every 5 minutes in a background loop
- Multiple agents can peek without contention

### dream_activate

Atomically activate a dream session. Claims the dream and returns the full context.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dreamId` | string | Yes | ID of the dream to activate |

**Example:**

```json
{
  "name": "dream_activate",
  "arguments": {
    "dreamId": "dream-abc123"
  }
}
```

**Response:**

```json
{
  "success": true,
  "dreamId": "dream-abc123",
  "title": "Refactor auth module",
  "instructions": "Move all JWT logic into auth/jwt.ts. Extract validation into separate functions. Add tests.",
  "tasks": [
    { "taskId": "task-1", "title": "Extract JWT signing" },
    { "taskId": "task-2", "title": "Extract JWT verification" },
    { "taskId": "task-3", "title": "Add unit tests" }
  ],
  "constraints": {
    "maxCostUSD": 5.00,
    "maxTokens": 200000,
    "maxDurationMinutes": 240,
    "allowedOperations": ["read", "write", "git_branch", "git_commit"],
    "blockedOperations": ["deploy", "git_push_main", "delete"]
  }
}
```

**Usage notes:**
- Atomic. Two agents calling `dream_activate` on the same dream — one wins, one gets an error.
- Marks the dream as `active` in Firestore
- Returns full context (no need to call `get_tasks` separately)

## Creating a dream session

Dream sessions are created through the mobile app or via the `create_task` tool with `type: "dream"`.

**Mobile app:**
1. Open CacheBash mobile app
2. Tap "New Dream"
3. Enter title, instructions, budget constraints
4. Assign to a program (e.g., `builder`, `reviewer`)
5. Tap "Schedule"

**MCP tool:**

```json
{
  "name": "create_task",
  "arguments": {
    "title": "Refactor auth module",
    "type": "dream",
    "target": "builder",
    "instructions": "Move all JWT logic into auth/jwt.ts. Extract validation into separate functions. Add tests.",
    "action": "backlog"
  }
}
```

The dream enters the queue. The next agent that calls `dream_peek` sees it.

## Budget caps

Every dream session has three hard limits:

| Limit | Purpose | Enforcement |
|-------|---------|-------------|
| **Cost cap** | Max spend in USD | Agent tracks token usage, stops when cap hit |
| **Token cap** | Max tokens (in + out) | Agent tracks cumulative tokens, stops when exceeded |
| **Time cap** | Max wall-clock duration | Firebase Function terminates session after timeout |

When any limit is reached, the agent stops work, commits what it has, and reports status.

## Safety constraints

Dream sessions enforce strict safety rules to prevent destructive operations during autonomous execution.

**Allowed:**
- Reading code, files, documentation
- Writing code, tests, documentation
- Creating git branches
- Making commits on feature branches
- Opening draft PRs

**Blocked:**
- Deploying to any environment
- Pushing to `main` or `master`
- Deleting files or directories
- Running destructive bash commands (`rm -rf`, `DROP TABLE`, etc.)
- Modifying production databases
- Revoking API keys

Violations trigger an immediate stop and alert.

## Git isolation

All dream session work happens on a dedicated branch. The branch name follows the pattern: `dream/{dream-id}-{title}`.

**Example:** `dream/abc123-refactor-auth`

The agent:
1. Creates the branch from `main`
2. Makes commits as work progresses
3. Opens a draft PR when done
4. Never merges or pushes to `main`

You review the PR in the morning and merge if it looks good.

## Example workflow

1. **Before bed** — Create a dream session via the mobile app:
   - Title: "Add tests for user service"
   - Instructions: "Write unit tests for UserService. Aim for 80% coverage. Use existing test patterns in auth tests."
   - Budget: $3 USD, 150k tokens, 3 hours
   - Target: `builder`

2. **Overnight** — Builder agent wakes up, calls `dream_peek`, sees the dream, calls `dream_activate`, starts work:
   - Creates branch `dream/def456-add-tests-user-service`
   - Reads existing tests to learn patterns
   - Writes test files
   - Commits incrementally
   - Hits $2.80 spend, 140k tokens, stops
   - Opens draft PR

3. **Morning** — You wake up, check the mobile app:
   - Dream marked complete
   - Draft PR link provided
   - 12 test files written, 78% coverage achieved
   - Review PR, request one change, merge after fix

## Monitoring dream sessions

**Mobile app:**
- Real-time progress updates
- Current task being worked
- Budget remaining (cost, tokens, time)
- Logs and errors

**MCP tools:**
- `get_tasks(type: "dream", status: "active")` — Check active dreams
- `get_session({sessionId})` — See session progress
- `get_messages({target: "your-program"})` — Check for dream-related messages

## Dreamwatch orchestrator

For advanced dream orchestration (multi-agent dreams, wave-based execution, retry logic), use the `dreamwatch` package from the CacheBash monorepo.

**Dreamwatch** is an orchestrator that:
- Splits dreams into waves of parallel tasks
- Assigns tasks to multiple agents
- Retries failed tasks with backoff
- Aggregates results and reports completion

See the [cachebash/packages/dreamwatch](https://github.com/rezzedai/cachebash/tree/main/packages/dreamwatch) README for setup and usage.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Dream not activating | Check `dream_peek` returns the dream. Verify no other agent claimed it. |
| Budget exceeded immediately | Review token usage. Check if context window is too large. |
| Git operations failing | Verify agent has git configured. Check branch doesn't already exist. |
| Safety violation | Check agent isn't trying to deploy or push to main. Review instructions. |

## Next steps

- [Concepts: Tasks](/concepts/tasks) — Task lifecycle and priority model
- [Guides: Multi-Agent](/guides/multi-agent) — Coordinate multiple agents for parallel dreams
- [Reference: Admin Tools](/reference/mcp-tools/admin) — Advanced dream session management
