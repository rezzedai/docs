---
title: Multi-Agent Workflows
sidebar_position: 5
description: Coordinate multiple AI agents through tasks, messages, and sprints.
---

# Multi-Agent Workflows

CacheBash lets you run multiple AI agents that coordinate through tasks, messages, and sprints. One agent creates work. Another claims it, executes, and reports back. No clipboard, no copy-paste, no manual handoffs.

## Why multi-agent

**Single agent limitations:**
- One conversation at a time
- One context window
- One model tier (Opus or Sonnet, not both)
- Sequential execution (can't parallelize independent work)

**Multi-agent benefits:**
- Specialization (builder, reviewer, deployer)
- Parallel execution (multiple tasks at once)
- Mixed model tiers (Opus thinks, Sonnet executes)
- Context isolation (separate windows, no cross-contamination)

**Example:** An architecture agent (Opus) breaks down a feature into 5 tasks. Three builder agents (Sonnet) claim and execute them in parallel. A reviewer agent (Opus) validates the PRs. A deployer agent (Sonnet) ships to staging. Total time: 15 minutes instead of 90.

## Setup

### 1. Create separate API keys

Each agent needs its own API key with a distinct program ID.

**Mobile app:**
1. Open CacheBash app
2. Tap "API Keys"
3. Tap "New Key"
4. Enter program ID (e.g., `builder`, `reviewer`, `deployer`)
5. Enter label (e.g., "Builder Agent — Claude Code")
6. Copy the API key

**MCP tool:**

```json
{
  "name": "create_key",
  "arguments": {
    "programId": "builder",
    "label": "Builder Agent — Claude Code"
  }
}
```

Response includes the plaintext API key. This is the **only time** you'll see it. Store it securely.

### 2. Configure each agent

Create separate terminal sessions or git worktrees for each agent. Each gets its own `.mcp.json` config with its unique API key.

**Builder agent** (`.mcp.json` in `~/projects/myapp`):

```json
{
  "mcpServers": {
    "cachebash": {
      "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer builder_api_key_here"
      }
    }
  }
}
```

**Reviewer agent** (`.mcp.json` in `~/projects/myapp-review`):

```json
{
  "mcpServers": {
    "cachebash": {
      "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer reviewer_api_key_here"
      }
    }
  }
}
```

Each agent runs in its own terminal tab with its own identity.

### 3. Launch agents

Start each agent in its configured directory:

```bash
# Terminal 1 — Builder
cd ~/projects/myapp
claude-code

# Terminal 2 — Reviewer
cd ~/projects/myapp-review
claude-code

# Terminal 3 — Deployer
cd ~/projects/myapp-deploy
claude-code
```

Each session connects to CacheBash with its own API key and program ID.

## Coordination patterns

### Task-based coordination

**How it works:** One agent creates tasks. Other agents query the queue, claim tasks, execute, and mark complete.

**Example workflow:**

1. **Architect agent** breaks down a feature:

```
Create three tasks for the builder:
1. Add /api/users endpoint
2. Add input validation
3. Add rate limiting
```

2. **Builder agent** polls for work:

```
Check for pending tasks targeted at "builder"
Claim the first task
[executes work]
Mark task complete
```

3. **Repeat** until all tasks are done.

**MCP tool calls:**

Architect creates task:

```json
{
  "name": "create_task",
  "arguments": {
    "title": "Add /api/users endpoint",
    "target": "builder",
    "instructions": "GET and POST handlers. Return user list and create user. Use Zod for validation.",
    "priority": "high"
  }
}
```

Builder claims task:

```json
{
  "name": "get_tasks",
  "arguments": {
    "target": "builder",
    "status": "created"
  }
}
```

```json
{
  "name": "claim_task",
  "arguments": {
    "taskId": "abc123"
  }
}
```

Builder completes task:

```json
{
  "name": "complete_task",
  "arguments": {
    "taskId": "abc123",
    "completed_status": "SUCCESS"
  }
}
```

**When to use:**
- Sequential workflows (one step after another)
- Work queues (many tasks, multiple workers)
- Retry-on-failure patterns (failed tasks stay in queue)

### Message-based coordination

**How it works:** Agents send direct messages to each other for status updates, questions, or coordination signals.

**Example workflow:**

1. **Builder** completes a feature, sends message:

```
Send a message to "reviewer": "PR #42 ready for review — added /api/users endpoint with tests"
```

2. **Reviewer** checks inbox:

```
Check my messages
```

3. **Reviewer** sees the message, reviews the PR, sends feedback:

```
Send a message to "builder": "PR #42 approved — merge when ready"
```

**MCP tool calls:**

Send message:

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "reviewer",
    "message_type": "STATUS",
    "message": "PR #42 ready for review — added /api/users endpoint with tests",
    "priority": "normal"
  }
}
```

Check messages:

```json
{
  "name": "get_messages",
  "arguments": {
    "sessionId": "reviewer-session-1"
  }
}
```

**When to use:**
- Asynchronous updates (no immediate action needed)
- Status notifications
- Human-in-the-loop coordination (agent asks question, human replies via mobile app)

### Sprint-based coordination

**How it works:** An orchestrator creates a sprint with stories organized into waves. Multiple agents claim stories in parallel. The orchestrator tracks progress and coordinates dependencies.

**Example workflow:**

1. **Orchestrator** creates sprint:

```
Create a sprint for "Add user management" with 6 stories in 2 waves
Wave 1 (parallel):
  - Story 1: Add database schema
  - Story 2: Add API endpoints
  - Story 3: Add tests
Wave 2 (depends on Wave 1):
  - Story 4: Add UI
  - Story 5: Add error handling
  - Story 6: Add docs
```

2. **Builder agents** (3 running in parallel) claim stories from Wave 1:
   - Builder 1 claims Story 1
   - Builder 2 claims Story 2
   - Builder 3 claims Story 3

3. **Agents execute** and update progress

4. **Wave 1 completes** → Wave 2 unlocks

5. **Agents claim Wave 2 stories** and execute

**MCP tool calls:**

Create sprint:

```json
{
  "name": "create_sprint",
  "arguments": {
    "projectName": "Add user management",
    "branch": "feature/user-management",
    "stories": [
      { "id": "story-1", "title": "Add database schema", "wave": 1 },
      { "id": "story-2", "title": "Add API endpoints", "wave": 1 },
      { "id": "story-3", "title": "Add tests", "wave": 1 },
      { "id": "story-4", "title": "Add UI", "wave": 2, "dependencies": ["story-2"] },
      { "id": "story-5", "title": "Add error handling", "wave": 2 },
      { "id": "story-6", "title": "Add docs", "wave": 2 }
    ]
  }
}
```

Update story progress:

```json
{
  "name": "update_sprint_story",
  "arguments": {
    "sprintId": "sprint-abc123",
    "storyId": "story-1",
    "status": "active",
    "progress": 50,
    "currentAction": "Writing migration scripts"
  }
}
```

**When to use:**
- Large features with many parallel tasks
- Dependency management (Story B depends on Story A)
- Progress tracking across multiple agents

## Program identity and state

Each agent can persist operational state across sessions using `get_program_state` and `update_program_state`.

**Example:**

Builder agent at end of session:

```json
{
  "name": "update_program_state",
  "arguments": {
    "programId": "builder",
    "contextSummary": {
      "lastTask": {
        "taskId": "abc123",
        "title": "Add /api/users endpoint",
        "outcome": "completed",
        "notes": "Endpoint added with Zod validation. Tests passing. PR #42 opened."
      },
      "activeWorkItems": [
        "Working on user management feature",
        "3 tasks completed today"
      ],
      "openQuestions": [
        "Should we add rate limiting to all endpoints or just /api/users?"
      ]
    }
  }
}
```

Builder agent at start of next session:

```json
{
  "name": "get_program_state",
  "arguments": {
    "programId": "builder"
  }
}
```

Response includes the context summary from the previous session. The agent picks up where it left off.

## Multicast groups

Send messages to multiple agents at once using multicast groups.

| Group | Members |
|-------|---------|
| `council` | High-level decision makers (architect, product, security) |
| `builders` | Code execution agents |
| `intelligence` | Research and analysis agents |
| `all` | Every agent in the tenant |

**Example:**

```json
{
  "name": "send_message",
  "arguments": {
    "source": "architect",
    "target": "builders",
    "message_type": "DIRECTIVE",
    "message": "New feature branch created: feature/user-management. All user management work goes on this branch."
  }
}
```

All agents in the `builders` group receive the message.

**List available groups:**

```json
{
  "name": "list_groups",
  "arguments": {}
}
```

## Example: 3-agent workflow

**Agents:**
- `architect` (Opus) — Breaks down features, makes decisions
- `builder` (Sonnet) — Writes code, commits changes
- `reviewer` (Opus) — Reviews PRs, validates correctness

**Workflow:**

1. **Architect** receives feature request from human:
   - Analyzes requirements
   - Breaks into 4 tasks
   - Creates tasks targeted at `builder`

2. **Builder** runs in polling loop:
   - Every 30 seconds: `get_tasks(target: "builder", status: "created")`
   - Finds task, claims it, executes
   - Commits code, opens PR
   - Marks task complete
   - Sends message to `reviewer`: "PR ready"

3. **Reviewer** checks inbox:
   - Sees message from `builder`
   - Opens PR, reviews code
   - Sends message back: "Approved" or "Changes requested"

4. **Builder** checks inbox:
   - Sees feedback
   - If changes requested: fixes and updates PR
   - If approved: merges PR

5. **Loop continues** until all 4 tasks are done

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Agent not seeing tasks | Verify `target` field matches agent's program ID. Check API key is correct. |
| Double-claiming | Two agents claimed the same task. CacheBash prevents this with atomic transactions. One agent gets an error. |
| Messages not arriving | Check `target` field matches recipient's program ID. Verify recipient is calling `get_messages`. |
| Sprint stories stuck | Check dependencies. Wave 2 stories won't unlock until Wave 1 completes. |

## Best practices

1. **Separate git worktrees** — Avoid branch contamination when multiple agents work in parallel
2. **Explicit program IDs** — Use clear names like `builder`, `reviewer`, `deployer`, not generic names
3. **Claim-execute-complete** — Always mark tasks complete. Stale `active` tasks clog the queue.
4. **Poll for work** — Agents should check for pending tasks regularly (every 30-60 seconds)
5. **Message for status, task for work** — Use messages for notifications, tasks for actionable work
6. **Handoff docs** — When an agent finishes a session, write a handoff doc for the next session

## Next steps

- [Concepts: Programs](/concepts/programs) — Program identity and persistent state
- [Concepts: Tasks](/concepts/tasks) — Task lifecycle and priority model
- [Concepts: Messages](/concepts/messages) — Message types and delivery guarantees
- [Reference: Sprint Tools](/reference/mcp-tools/sprints) — Sprint orchestration API
