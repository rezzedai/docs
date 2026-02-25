---
title: Messaging
sidebar_position: 2
description: Relay and Signal modules — send messages, push notifications, and mobile interactions.
---

# Messaging

Two modules handle communication. **Relay** provides program-to-program messaging with multicast groups and threading. **Signal** sends push notifications to the mobile app for human-in-the-loop decisions.

## Relay

### send_message

Send a message to another program or multicast group.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | — | Message content |
| `source` | string | Yes | — | Sender program ID |
| `target` | string | Yes | — | Recipient: program ID or group (`council`, `builders`, `intelligence`, `all`) |
| `message_type` | string | Yes | — | `PING`, `PONG`, `HANDSHAKE`, `DIRECTIVE`, `STATUS`, `ACK`, `QUERY`, `RESULT` |
| `priority` | string | No | — | `low`, `normal`, `high` |
| `action` | string | No | — | `interrupt`, `queue` |
| `context` | string | No | — | Additional structured context |
| `sessionId` | string | No | — | Associated session |
| `reply_to` | string | No | — | Message ID this replies to |
| `threadId` | string | No | — | Thread for grouping conversation |
| `ttl` | number | No | — | Time-to-live in seconds |
| `payload` | object | No | — | Structured data payload |
| `idempotency_key` | string | No | — | UUID v4 to prevent duplicate delivery on retry |

**Example — direct message:**

```json
{
  "name": "send_message",
  "arguments": {
    "source": "builder",
    "target": "orchestrator",
    "message_type": "STATUS",
    "message": "Auth fix complete. PR #42 open. Tests passing."
  }
}
```

**Example — multicast:**

```json
{
  "name": "send_message",
  "arguments": {
    "source": "orchestrator",
    "target": "all",
    "message_type": "STATUS",
    "message": "Sprint 3 starting. Check your task queues."
  }
}
```

**Usage notes:**
- Use `idempotency_key` on every call to prevent duplicate messages on network retry.
- Multicast targets (`all`, `builders`, `council`, `intelligence`) deliver to all group members. Use `list_groups` to see current membership.
- See [Message Types](/reference/message-types) for detailed guidance on when to use each type.

---

### get_messages

Check for pending messages. Returns unread messages for the specified session.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sessionId` | string | Yes | — | Session to check |
| `target` | string | No | — | Filter by target program |
| `markAsRead` | boolean | No | `true` | Mark returned messages as read |
| `message_type` | string | No | — | Filter by message type |
| `priority` | string | No | — | Filter by priority |

**Example:**

```json
{
  "name": "get_messages",
  "arguments": {
    "sessionId": "builder",
    "message_type": "DIRECTIVE"
  }
}
```

**Usage notes:**
- Call on boot and after every task completion.
- `markAsRead: false` lets you peek without consuming messages.
- Messages are delivered once. After reading, they won't appear in subsequent calls (unless `markAsRead: false`).

---

### get_sent_messages

Query your outbox. See messages you've sent, their delivery status, and thread context.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | — | Filter by delivery status |
| `target` | string | No | — | Filter by recipient |
| `threadId` | string | No | — | Filter by thread |
| `source` | string | No | — | Admin only: query another program's outbox |
| `limit` | number | No | 20 | Results (1–50) |

---

### list_groups

List available multicast groups and their current members.

**Parameters:** None.

**Example response:**

```json
{
  "groups": [
    { "name": "all", "members": ["orchestrator", "builder", "reviewer", "castor"] },
    { "name": "builders", "members": ["builder", "reviewer"] },
    { "name": "council", "members": ["orchestrator"] },
    { "name": "intelligence", "members": ["analyst"] }
  ]
}
```

**Usage notes:**
- Group membership is configured server-side.
- Use group names as the `target` in `send_message` for multicast.

---

### get_dead_letters

View messages that failed delivery. Admin only.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 20 | Results (1–50) |

**Usage notes:**
- Dead letters occur when a target program doesn't exist or messages expire before delivery.
- Useful for debugging communication failures in multi-agent setups.

---

### query_message_history

Query full message history with bodies. Admin only. Requires at least one filter.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `threadId` | string | No* | — | Filter by thread |
| `source` | string | No* | — | Filter by sender |
| `target` | string | No* | — | Filter by recipient |
| `message_type` | string | No | — | Filter by type |
| `status` | string | No | — | Filter by delivery status |
| `since` | string | No | — | ISO 8601 start time |
| `until` | string | No | — | ISO 8601 end time |
| `limit` | number | No | 50 | Results (1–100) |

*At least one of `threadId`, `source`, or `target` is required.

---

## Signal

### ask_question

Send a question to the user's mobile device and wait for a response. Supports free-text answers and multiple-choice options.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `question` | string | Yes | — | The question to ask |
| `options` | string[] | No | — | Multiple-choice options (max 5) |
| `context` | string | No | — | Background context for the user |
| `priority` | string | No | — | Notification priority |
| `encrypt` | boolean | No | `true` | End-to-end encrypt the question |
| `threadId` | string | No | — | Thread for follow-up questions |
| `inReplyTo` | string | No | — | Previous question this follows |
| `projectId` | string | No | — | Associated project |

**Example:**

```json
{
  "name": "ask_question",
  "arguments": {
    "question": "The auth refactor will change the JWT signing algorithm from HS256 to RS256. This is a breaking change for existing tokens. Proceed?",
    "options": ["Yes, proceed", "No, keep HS256", "Let me review first"],
    "context": "Working on task abc123. The current HS256 implementation has a known weakness.",
    "priority": "high"
  }
}
```

**Response:**

```json
{
  "success": true,
  "questionId": "q-789",
  "message": "Question sent to device"
}
```

**Usage notes:**
- The question appears as a push notification on the user's phone.
- Use `get_response` to poll for the answer.
- `encrypt: true` (default) means the question content is end-to-end encrypted. Only the mobile app can decrypt it.
- For agent-to-agent questions, use `send_message` with `message_type: "QUERY"` instead.

---

### get_response

Check if the user has responded to a question sent via `ask_question`.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `questionId` | string | Yes | — | ID returned by `ask_question` |

**Example:**

```json
{
  "name": "get_response",
  "arguments": {
    "questionId": "q-789"
  }
}
```

**Response (answered):**

```json
{
  "success": true,
  "answered": true,
  "response": "Yes, proceed"
}
```

**Response (pending):**

```json
{
  "success": true,
  "answered": false
}
```

**Usage notes:**
- Poll periodically until `answered: true`.
- If the user doesn't respond, the question stays pending until TTL expiry or cancellation.

---

### send_alert

Send a one-way notification to the mobile app. No response expected.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | Yes | — | Alert content |
| `alertType` | string | No | `info` | `error`, `warning`, `success`, `info` |
| `priority` | string | No | — | Notification priority |
| `context` | string | No | — | Additional context |
| `sessionId` | string | No | — | Associated session |

**Example:**

```json
{
  "name": "send_alert",
  "arguments": {
    "message": "Deploy to staging complete. 3 services updated. Zero errors.",
    "alertType": "success"
  }
}
```

**Usage notes:**
- Alerts are fire-and-forget. Use for status updates, completion notifications, and error reporting.
- For decisions that need human input, use `ask_question` instead.

## Next steps

- [Message Types](/reference/message-types) — Detailed guidance on all 8 message types
- [Concepts: Messages](/concepts/messages) — How the relay system works
- [Mobile App Guide](/guides/mobile-app) — Setting up push notifications
