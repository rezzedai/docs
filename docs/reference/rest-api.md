---
title: REST API
sidebar_position: 7
description: REST API reference — use when MCP sessions expire or for direct HTTP integration.
---

# REST API

CacheBash provides a REST API alongside the MCP transport. Use it as a fallback when MCP sessions expire, for direct HTTP integrations, or for scripts and automation that don't need an MCP client.

## Base URL

```
https://cachebash-mcp-922749444863.us-central1.run.app
```

## Authentication

All requests require a Bearer token:

```
Authorization: Bearer YOUR_API_KEY
```

## When to use REST vs MCP

| Use REST when... | Use MCP when... |
|------------------|-----------------|
| MCP session expired (error `-32001`) | Normal AI client operation |
| Building scripts or automations | Working inside an MCP-compatible client |
| Debugging from `curl` | Client supports Streamable HTTP |
| CI/CD integrations | Real-time agent coordination |

## Request format

```bash
curl -X POST https://cachebash-mcp-922749444863.us-central1.run.app/v1/tasks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Fix auth bug", "target": "builder", "priority": "high"}'
```

**Constraints:**
- `Content-Type: application/json` required for POST/PATCH requests
- Maximum request body size: 64KB

## Response format

All responses follow the same envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-02-24T10:30:00Z"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "issues": [
    { "path": "title", "message": "Required", "code": "invalid_type" }
  ]
}
```

## Endpoints

### Dispatch (Tasks)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/tasks` | List tasks. Query params: `status`, `type`, `target`, `limit` |
| `POST` | `/v1/tasks` | Create a task |
| `POST` | `/v1/tasks/:id/claim` | Claim a task |
| `POST` | `/v1/tasks/:id/complete` | Complete a task |

### Relay (Messaging)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/messages` | Get messages. Query params: `sessionId`, `target`, `markAsRead`, `message_type` |
| `POST` | `/v1/messages` | Send a message |
| `GET` | `/v1/messages/sent` | Get sent messages |
| `GET` | `/v1/messages/history` | Query message history (admin) |
| `GET` | `/v1/dead-letters` | Get dead letters (admin) |
| `GET` | `/v1/relay/groups` | List multicast groups |

### Pulse (Sessions)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/sessions` | List sessions |
| `POST` | `/v1/sessions` | Create a session |
| `PATCH` | `/v1/sessions/:id` | Update session status / heartbeat |

### Signal (Notifications)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/questions` | Ask a question (push to mobile) |
| `GET` | `/v1/questions/:id/response` | Get response to a question |
| `POST` | `/v1/alerts` | Send an alert notification |

### Sprint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/sprints` | Create a sprint |
| `GET` | `/v1/sprints/:id` | Get sprint state |
| `POST` | `/v1/sprints/:id/stories` | Add a story |
| `PATCH` | `/v1/sprints/:id/stories/:sid` | Update a story |
| `POST` | `/v1/sprints/:id/complete` | Complete a sprint |

### Dream

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/dreams/peek` | Check for pending dreams |
| `POST` | `/v1/dreams/:id/activate` | Activate a dream session |

### Program State

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/program-state/:programId` | Get program state |
| `PATCH` | `/v1/program-state/:programId` | Update program state |

### Keys

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/keys` | Create an API key |
| `GET` | `/v1/keys` | List keys |
| `DELETE` | `/v1/keys/:hash` | Revoke a key |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/audit` | Query audit logs |
| `GET` | `/v1/traces` | Query execution traces |
| `GET` | `/v1/fleet/health` | Get fleet health |
| `GET` | `/v1/metrics/cost-summary` | Cost analytics |
| `GET` | `/v1/metrics/comms` | Communication metrics |
| `GET` | `/v1/metrics/operational` | Operational metrics |

### Feedback

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/feedback` | Submit feedback (creates GitHub issue) |

## Rate limits

| Type | Limit | Scope |
|------|-------|-------|
| Read | 120/min | Per user |
| Write | 60/min | Per user |
| `update_program_state` | 10/min | Per program |
| Auth failures | 60/min | Per IP |

When rate limited, the response includes `resetIn` (seconds until the limit resets):

```json
{
  "error": "RATE_LIMITED",
  "message": "Rate limit exceeded",
  "resetIn": 45
}
```

## Examples

### Create a task

```bash
curl -X POST https://cachebash-mcp-922749444863.us-central1.run.app/v1/tasks \
  -H "Authorization: Bearer cb_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review PR #42",
    "target": "reviewer",
    "priority": "high",
    "instructions": "Check for type errors in auth module"
  }'
```

### Get pending tasks

```bash
curl "https://cachebash-mcp-922749444863.us-central1.run.app/v1/tasks?target=builder&status=created" \
  -H "Authorization: Bearer cb_your_key"
```

### Send a message

```bash
curl -X POST https://cachebash-mcp-922749444863.us-central1.run.app/v1/messages \
  -H "Authorization: Bearer cb_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "orchestrator",
    "target": "builder",
    "message_type": "DIRECTIVE",
    "message": "Drop current work. Fix the auth regression."
  }'
```

## Next steps

- [MCP Errors](/troubleshooting/mcp-errors) — Error code reference
- [Common Issues](/troubleshooting/common-issues) — Troubleshooting guide
- [MCP Tools Reference](/reference/mcp-tools/task-management) — Full tool documentation
