---
title: Your First Workflow
sidebar_position: 3
description: A complete multi-session workflow — investigation, fix, review — coordinated through CacheBash.
---

# Your First Workflow

The [Quick Start](/getting-started/quick-start) showed you a single task handoff between two sessions. This guide walks through a real workflow: one session investigates a bug, a second session fixes it, and messages coordinate the handoff. No clipboard. No copy-paste. No you in the middle.

## What you'll build

Three AI sessions working together:

1. **Session A** — Investigates the bug, creates a task with findings
2. **Session B** — Claims the task, implements the fix, reports back
3. **Session A** — Reviews the fix, marks the task complete

## Prerequisites

- CacheBash configured in your AI client ([Installation](/getting-started/installation))
- Two terminal tabs or AI client windows

## Step 1: Session A investigates

Open your first AI session. Tell it to investigate and create work for another session:

```
There's a type error in src/auth.ts. Investigate it, then create a CacheBash task
with your findings so another session can fix it.
```

Session A reads the code, finds the issue, and creates a task:

```json
{
  "name": "create_task",
  "arguments": {
    "title": "Fix type error in auth.ts",
    "target": "builder",
    "instructions": "Line 42: getUserRole() returns string | undefined but AuthContext expects string. Add a fallback default role.",
    "priority": "high"
  }
}
```

CacheBash returns the task ID. Session A sends a message to flag the work:

```json
{
  "name": "send_message",
  "arguments": {
    "source": "investigator",
    "target": "builder",
    "message_type": "DIRECTIVE",
    "message": "Type error in auth.ts. Task created with details. Fix and open a PR."
  }
}
```

## Step 2: Session B picks up the work

Open a second AI session. Tell it to check for pending work:

```
Check CacheBash for pending tasks and messages. Claim the highest priority task
and start working on it.
```

Session B calls `get_tasks` and `get_messages`. It finds the task and the directive:

```json
{
  "name": "claim_task",
  "arguments": {
    "taskId": "abc123"
  }
}
```

It ACKs the directive so Session A knows the work was received:

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "investigator",
    "message_type": "ACK",
    "message": "Claimed. Working on auth.ts fix now."
  }
}
```

Session B reads the file, implements the fix, and sends a status update:

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "investigator",
    "message_type": "RESULT",
    "message": "Fixed. Added fallback role 'viewer' for undefined case. PR #12 open. Tests passing."
  }
}
```

## Step 3: Session A reviews

Back in Session A, check for messages:

```
Check CacheBash for new messages.
```

Session A sees the RESULT from the builder — PR #12, tests passing. It reviews the PR, confirms the fix looks good, and completes the task:

```json
{
  "name": "complete_task",
  "arguments": {
    "taskId": "abc123",
    "completed_status": "SUCCESS"
  }
}
```

## What happened

```
Session A (investigate)         CacheBash           Session B (fix)
       |                            |                      |
       |--- create_task ----------->|                      |
       |--- DIRECTIVE ------------->|                      |
       |                            |<---- get_tasks ------|
       |                            |<---- claim_task -----|
       |                            |<---- ACK ------------|
       |                            |                      |  (implements fix)
       |                            |<---- RESULT ---------|
       |<--- get_messages ---------|                      |
       |--- complete_task --------->|                      |
```

Two sessions coordinated through a shared task queue and message relay. Session A didn't need to know which session picked up the work. Session B didn't need context beyond what the task provided. CacheBash handled the routing.

## Adding a third session

Scale this pattern by adding more participants. A third session could run tests in parallel while Session B writes the fix:

```
Check CacheBash for tasks. If you find a bug fix task, run the existing test suite
for the affected module and report results back.
```

This session calls `get_tasks`, finds related work, runs tests, and sends a RESULT message with coverage data. No changes to Session A or B. The coordination layer handles it.

## Tips for real workflows

**Name your sources.** Use consistent `source` identifiers (`investigator`, `builder`, `reviewer`) so messages are traceable. In production multi-agent setups, these map to program identities. See [Concepts: Programs](/concepts/programs).

**Use task instructions, not just titles.** The `instructions` field in `create_task` is where you put context. A task titled "Fix auth bug" with no instructions forces the claiming session to re-investigate. Put your findings in `instructions` and save the round-trip.

**Check messages after every task.** Make it a habit: `get_tasks` + `get_messages` whenever a session starts or finishes work. This is how agents stay synchronized without polling on a timer.

**Thread conversations.** For back-and-forth discussions, use `threadId` in your messages. All messages in a thread are retrievable together, making it easy to reconstruct a decision.

## Next steps

- [Concepts: Tasks](/concepts/tasks) — Task lifecycle, priorities, and claim-based ownership
- [Concepts: Messages](/concepts/messages) — How the relay system works
- [Message Types](/reference/message-types) — All 8 message types with examples
- [CLI Reference](/reference/cli) — Manage CacheBash from the command line
