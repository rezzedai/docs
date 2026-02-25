---
title: MCP Errors
sidebar_position: 2
description: JSON-RPC and HTTP error code reference for the CacheBash MCP server.
---

# MCP Errors

CacheBash uses standard JSON-RPC 2.0 error codes for the MCP transport, and standard HTTP status codes for the REST API. This page covers both.

## JSON-RPC Error Codes (MCP transport)

These errors are returned when communicating via the MCP protocol at `/v1/mcp`.

| Code | Meaning | Common causes |
|------|---------|---------------|
| `-32700` | Parse Error | Invalid JSON in request body |
| `-32600` | Invalid Request | Missing `Content-Type: application/json`, missing `Mcp-Session-Id` header, or empty body |
| `-32601` | Method Not Allowed | Using a non-POST HTTP method (GET, PUT, etc.) on the MCP endpoint |
| `-32603` | Internal Server Error | Unhandled exception during tool execution |
| `-32001` | Session Expired | MCP session ID is no longer valid. Session timed out or server restarted. |

### -32600: Invalid Request

Most common. Usually means a missing header.

**Missing Mcp-Session-Id:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Mcp-Session-Id header is required"
  }
}
```

**Fix:** Every request after `initialize` must include the `Mcp-Session-Id` header returned during initialization. If your client doesn't send it, the session handshake didn't complete properly.

**Missing Content-Type:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Content-Type must be application/json"
  }
}
```

### -32001: Session Expired

The MCP session is no longer valid. This happens after idle periods (~20-30 minutes) or server deployments.

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Session expired or invalid"
  }
}
```

**Options:**
1. **Re-initialize:** Send a new `initialize` request to get a fresh session ID
2. **Switch to REST:** Use the REST API (`/v1/{endpoint}`) for the remainder of the session. See [REST API](/reference/rest-api).

---

## HTTP Status Codes (REST API and MCP transport)

These codes apply to both the REST API and the underlying HTTP transport for MCP.

| Status | Code | Meaning |
|--------|------|---------|
| **400** | `VALIDATION_ERROR` | Request body failed validation. Response includes an `issues` array with field paths and error messages. |
| **401** | `UNAUTHORIZED` | Missing or invalid API key |
| **402** | `PRICING_LIMIT_REACHED` | Monthly task limit exceeded (Free tier) |
| **403** | `COMPLIANCE_BLOCKED` | Session compliance check failed |
| **404** | `NOT_FOUND` | Route or resource not found |
| **410** | `SESSION_TERMINATED` | Session has been terminated (derezed). Create a new session. |
| **429** | `RATE_LIMITED` | Rate limit exceeded. Response includes `resetIn` seconds. |
| **500** | `INTERNAL_ERROR` | Unhandled server error |

### 400: Validation Error

Request body doesn't match the expected schema.

```json
{
  "error": "VALIDATION_ERROR",
  "issues": [
    { "path": "title", "message": "Required", "code": "invalid_type" },
    { "path": "target", "message": "Required", "code": "invalid_type" }
  ]
}
```

**Fix:** Check the parameter tables in the [MCP Tools Reference](/reference/mcp-tools/task-management). Required fields are marked.

**Note:** Request bodies larger than 64KB are rejected with a 400 error.

### 410: Session Terminated

The session was explicitly terminated (derezed) and can't be reused.

```json
{
  "error": "SESSION_TERMINATED",
  "message": "Session is DEREZED. Start a new session."
}
```

**Fix:** Call `create_session` to start a new session.

### 429: Rate Limited

```json
{
  "error": "RATE_LIMITED",
  "message": "Rate limit exceeded",
  "resetIn": 45
}
```

**`resetIn`** is the number of seconds until the limit resets. Wait that long before retrying.

**Rate limits:**

| Type | Limit | Scope |
|------|-------|-------|
| Read | 120/min | Per user |
| Write | 60/min | Per user |
| `update_program_state` | 10/min | Per program |
| Auth failures | 60/min | Per IP |

## Next steps

- [Common Issues](/troubleshooting/common-issues) — Symptom-based troubleshooting
- [REST API](/reference/rest-api) — REST fallback when MCP sessions expire
- [FAQ](/troubleshooting/faq) — Frequently asked questions
