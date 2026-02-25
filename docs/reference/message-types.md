---
title: Message Types
sidebar_position: 8
description: All 8 CacheBash message types — when to use each, with example payloads.
---

# Message Types

CacheBash relay messages carry a `message_type` field that signals intent. The server doesn't enforce behavior based on type — your agents decide how to handle each one. But consistent usage across your fleet makes communication predictable.

## Overview

| Type | Direction | Purpose |
|------|-----------|---------|
| `PING` | Any → Any | Check if an agent is alive |
| `PONG` | Any → Any | Respond to a PING |
| `HANDSHAKE` | Any → Any | Announce presence on startup |
| `DIRECTIVE` | Orchestrator → Agent | Assign work or give instructions |
| `STATUS` | Agent → Orchestrator | Report progress or state changes |
| `ACK` | Any → Any | Confirm receipt of a message |
| `QUERY` | Any → Any | Ask a question |
| `RESULT` | Any → Any | Deliver an answer or outcome |

## PING

Check if an agent is online and responsive.

```json
{
  "name": "send_message",
  "arguments": {
    "source": "orchestrator",
    "target": "builder",
    "message_type": "PING",
    "message": "Health check"
  }
}
```

**When to use:** Before dispatching work to an agent. After a period of silence. When the fleet health dashboard shows a stale heartbeat.

**Expected response:** `PONG`

## PONG

Respond to a PING to confirm you're alive.

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "orchestrator",
    "message_type": "PONG",
    "message": "Online. Working on task abc123.",
    "reply_to": "original-ping-id"
  }
}
```

**When to use:** Always respond to a PING. Include current status in the message body.

## HANDSHAKE

Announce that an agent has started and is ready for work.

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "orchestrator",
    "message_type": "HANDSHAKE",
    "message": "Builder online. Session started. Ready for tasks."
  }
}
```

**When to use:** On agent startup, after the boot sequence completes (restore state, check tasks, check messages). Send to the orchestrator or broadcast to `all`.

**Expected response:** `ACK` from the orchestrator, optionally followed by a `DIRECTIVE` with initial work.

## DIRECTIVE

Assign work or give instructions to another agent.

```json
{
  "name": "send_message",
  "arguments": {
    "source": "orchestrator",
    "target": "builder",
    "message_type": "DIRECTIVE",
    "message": "Priority shift. Drop current task. Fix the auth regression in PR #42 before merging.",
    "priority": "high",
    "action": "interrupt"
  }
}
```

**When to use:** When an orchestrator or lead agent needs another agent to do something. For task assignments, priority changes, process instructions, or behavioral adjustments.

**Expected response:** `ACK` to confirm receipt, followed by `STATUS` updates as work progresses, and a `RESULT` when done.

**Conventions:**
- Directives from an orchestrator carry authority. The receiving agent should act on them.
- Use `action: "interrupt"` for urgent directives that should preempt current work.
- Use `priority: "high"` to signal importance in the inbox.

## STATUS

Report progress, state changes, or situational updates.

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "orchestrator",
    "message_type": "STATUS",
    "message": "Auth module 80% complete. JWT validation passing. Refresh token edge case remaining."
  }
}
```

**When to use:** At natural breakpoints during task execution. When state changes (blocked, unblocked, rotating sessions). When completing a phase of work. After every significant action that changes the agent's situation.

**Expected response:** Usually none. The orchestrator reads statuses to track fleet progress. Optionally, the orchestrator sends an `ACK` or a follow-up `DIRECTIVE`.

## ACK

Confirm that you received and understood a message.

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "orchestrator",
    "message_type": "ACK",
    "message": "Received directive. Claiming task now.",
    "reply_to": "original-directive-id"
  }
}
```

**When to use:** After receiving a `DIRECTIVE` or any message that expects confirmation. Use `reply_to` to link the ACK to the original message.

**Conventions:**
- Always ACK directives. Silence after a directive means the orchestrator doesn't know if the agent received it.
- Keep ACK messages short. The sender just needs to know you got it.

## QUERY

Ask a question that needs an answer.

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "reviewer",
    "message_type": "QUERY",
    "message": "The type error in auth.ts can be fixed with a generic constraint or a type cast. Which approach do you prefer?",
    "threadId": "auth-fix-discussion"
  }
}
```

**When to use:** When an agent needs input from another agent or a human before proceeding. For architectural decisions, clarifications, and approval requests.

**Expected response:** `RESULT` with the answer.

**Conventions:**
- Include enough context for the recipient to answer without reading the full codebase.
- Use `threadId` to group a question and its answer into a traceable conversation.
- For questions that need a human answer, use `ask_question` (Signal module) instead — it pushes to the mobile app.

## RESULT

Deliver an answer, outcome, or deliverable.

```json
{
  "name": "send_message",
  "arguments": {
    "source": "reviewer",
    "target": "builder",
    "message_type": "RESULT",
    "message": "Use the generic constraint. Type casts hide bugs. PR the fix and I'll review.",
    "reply_to": "original-query-id",
    "threadId": "auth-fix-discussion"
  }
}
```

**When to use:** In response to a `QUERY`. When reporting the outcome of a completed task. When delivering a deliverable (PR URL, file path, test results).

**Conventions:**
- Always use `reply_to` to link the result to the original query.
- Include actionable information, not just "done." What was the outcome? Where's the artifact?

## Common patterns

### Task dispatch flow

```
Orchestrator → Builder:  DIRECTIVE  "Fix auth bug. Task abc123."
Builder → Orchestrator:  ACK        "Received. Claiming now."
Builder → Orchestrator:  STATUS     "Found the issue. Line 42 type mismatch."
Builder → Orchestrator:  STATUS     "Fix implemented. Running tests."
Builder → Orchestrator:  RESULT     "Fixed. PR #42 open. Tests passing."
```

### Cross-agent question

```
Builder → Reviewer:   QUERY   "Generic constraint or type cast?"
Reviewer → Builder:   RESULT  "Generic constraint. Type casts hide bugs."
Builder → Reviewer:   ACK     "Got it. Using generic constraint."
```

### Fleet startup

```
Builder → all:          HANDSHAKE  "Builder online."
Reviewer → all:         HANDSHAKE  "Reviewer online."
Orchestrator → all:     STATUS     "Sprint 3 starting. Check task queues."
```

## Next steps

- [Concepts: Messages](/concepts/messages) — Messaging fundamentals
- [Reference: Messaging Tools](/reference/mcp-tools/messaging) — Full send/receive tool reference
- [Concepts: Programs](/concepts/programs) — Agent identities
