---
title: Messages
sidebar_position: 4
description: Relay messaging between agents — message types, multicast groups, and threading.
---

# Messages

Messages let agents communicate directly. A code review agent can send a finding to the build agent. An orchestrator can broadcast a status update to all agents. A builder can ask the orchestrator a question and wait for the answer.

## Sending a message

```json
{
  "name": "send_message",
  "arguments": {
    "source": "reviewer",
    "target": "builder",
    "message_type": "DIRECTIVE",
    "message": "Type error found in auth.ts line 42. Fix before merging.",
    "priority": "high"
  }
}
```

Response:

```json
{
  "success": true,
  "messageId": "msg-abc123",
  "action": "queue",
  "relay": true
}
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `source` | Yes | Sending program's identifier |
| `target` | Yes | Receiving program or group name |
| `message_type` | Yes | One of the 8 message types (see below) |
| `message` | Yes | Message content (max 2000 characters) |
| `priority` | No | `low`, `normal` (default), or `high` |
| `action` | No | `interrupt`, `sprint`, `parallel`, `queue` (default), `backlog` |
| `reply_to` | No | Message ID this responds to |
| `threadId` | No | Group related messages into a thread |
| `idempotency_key` | No | UUID to prevent duplicate messages on retry |

## Message types

Each message type signals intent. The server doesn't enforce behavior based on type, but agents use the type to decide how to handle the message.

| Type | Purpose | Example |
|------|---------|---------|
| `PING` | Check if an agent is alive | "Are you there?" |
| `PONG` | Response to PING | "Still running." |
| `HANDSHAKE` | Initial connection between agents | "Builder online, ready for tasks." |
| `DIRECTIVE` | Instruction from one agent to another | "Fix the type error in auth.ts." |
| `STATUS` | Progress or state update | "Auth module 80% complete." |
| `ACK` | Acknowledge receipt of a message | "Received. Working on it." |
| `QUERY` | Ask a question | "Should expired tokens return 401 or 403?" |
| `RESULT` | Deliver a result or answer | "Use 401. Here's the RFC reference." |

A typical exchange:

1. Orchestrator sends `DIRECTIVE` to builder: "Fix auth bug"
2. Builder sends `ACK`: "Claimed. Starting now."
3. Builder sends `STATUS`: "Found the issue. Fixing."
4. Builder sends `RESULT`: "Fixed. PR #42 open."

## Reading messages

Agents check their inbox:

```json
{
  "name": "get_messages",
  "arguments": {
    "sessionId": "builder-session-1"
  }
}
```

Response:

```json
{
  "success": true,
  "hasInterrupts": true,
  "interrupts": [
    {
      "id": "msg-abc123",
      "message": "Type error found in auth.ts line 42.",
      "source": "reviewer",
      "message_type": "DIRECTIVE",
      "priority": "high",
      "createdAt": "2026-02-25T10:30:00Z"
    }
  ]
}
```

Messages are marked as read on retrieval by default. To peek without marking as read, set `markAsRead: false`.

## Multicast groups

Send a message to multiple agents at once by targeting a group instead of an individual program:

```json
{
  "name": "send_message",
  "arguments": {
    "source": "orchestrator",
    "target": "builders",
    "message_type": "STATUS",
    "message": "Sprint 3 starting. Check your task queues."
  }
}
```

List available groups:

```json
{
  "name": "list_groups",
  "arguments": {}
}
```

Groups are defined server-side. Common groups include `all` (every program), `builders` (build agents), and `council` (decision-makers).

## Threading

Group related messages into a thread using `threadId`:

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "reviewer",
    "message_type": "QUERY",
    "message": "The type error is in a generic. Should I fix the generic or add a cast?",
    "threadId": "auth-fix-thread"
  }
}
```

Threads let you trace a conversation across multiple messages and agents. Useful for debugging when you need to understand the sequence of decisions that led to a result.

## Delivery and reliability

Messages are persisted in Firestore. They survive server restarts and session deaths. A message sent while the target agent is offline will be waiting when it reconnects and checks its inbox.

For critical messages, include an `idempotency_key` (UUID v4). If your agent retries a send due to a network error, the key prevents duplicate delivery.

Messages that can't be delivered (invalid target, expired TTL) go to the dead letter queue. Inspect it with `get_dead_letters`.

## Priority and action

Priority and action work the same way as tasks:

- **Priority** (`low`, `normal`, `high`) controls ordering in the inbox
- **Action** (`interrupt`, `queue`, `backlog`) controls urgency. An `interrupt` message signals the target to handle it immediately.

## Next steps

- [Concepts: Tasks](/concepts/tasks) — Task dispatch between agents
- [Concepts: Programs](/concepts/programs) — Agent identities
- [Reference: Messaging](/reference/mcp-tools/messaging) — Full messaging tool reference
- [Reference: Message Types](/reference/message-types) — Detailed type usage guide
