---
title: Authentication
sidebar_position: 6
description: API key management, Bearer token auth, and the CacheBash security model.
---

# Authentication

CacheBash uses API keys for MCP client authentication. Each key is tied to a program identity, hashed with SHA-256 before storage, and transmitted as a Bearer token in the Authorization header.

## How it works

1. You create an API key for a program (e.g., `builder`)
2. CacheBash returns the raw key once — store it securely
3. The server stores only the SHA-256 hash, never the plaintext
4. Your MCP client sends the key as `Authorization: Bearer {key}` on every request
5. The server hashes the incoming key and matches it against stored hashes

If you lose a key, it can't be recovered. Revoke the old one and create a new one.

## Creating a key

Use the `create_key` tool:

```json
{
  "name": "create_key",
  "arguments": {
    "programId": "builder",
    "label": "Builder agent - production"
  }
}
```

Response:

```json
{
  "success": true,
  "programId": "builder",
  "key": "cb_2a03bfe16cb94b9264aca30bf808b7e545272fc80f3b205d9e301099aaf97e06",
  "keyHash": "e3b0c44298fc1c149afb..."
}
```

The `key` field is the raw API key. This is the only time you'll see it. Copy it to your MCP config immediately.

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `programId` | Yes | Program this key authenticates as |
| `label` | Yes | Human-readable label for key management |

## Using the key

Add the key to your MCP client configuration:

```json
{
  "mcpServers": {
    "cachebash": {
      "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer cb_2a03bfe16cb94b9264aca30bf808b7e545272fc80f3b205d9e301099aaf97e06"
      }
    }
  }
}
```

Every MCP tool call from this client is now authenticated as the `builder` program.

## Listing keys

See all keys for your account:

```json
{
  "name": "list_keys",
  "arguments": {}
}
```

Response:

```json
{
  "success": true,
  "keys": [
    {
      "programId": "builder",
      "label": "Builder agent - production",
      "keyHash": "e3b0c44298fc1c149afb...",
      "createdAt": "2026-02-25T10:00:00Z",
      "revoked": false
    }
  ]
}
```

Keys are listed by metadata only. Raw key values are never stored or returned after creation.

## Revoking a key

If a key is compromised or no longer needed:

```json
{
  "name": "revoke_key",
  "arguments": {
    "keyHash": "e3b0c44298fc1c149afb..."
  }
}
```

Revocation is a soft delete. The key stops working immediately but remains in the database for audit purposes. Any agent using the revoked key will get authentication errors on the next request.

## Security model

**Keys are hashed at rest.** CacheBash stores SHA-256 hashes. A database breach doesn't expose raw keys.

**Keys are transmitted over HTTPS.** The MCP endpoint uses TLS. Bearer tokens are never sent in plaintext over the wire.

**One key per program.** Each program identity has its own key. If a builder agent's key is compromised, revoke it without affecting the reviewer or deployer.

**Tenant isolation.** All data is scoped by user. Your tasks, messages, and sessions are invisible to other CacheBash users. API keys authenticate both the user (tenant) and the program (identity within that tenant).

## Dual-layer auth

CacheBash has two authentication layers:

| Layer | Method | Used by |
|-------|--------|---------|
| MCP clients | API keys (Bearer token) | Claude Code, Cursor, VS Code, Gemini CLI |
| Mobile app | Firebase JWT (Google Sign-In) | iOS and Android apps |

Both layers authenticate against the same tenant. A task created via API key in Claude Code is visible in the mobile app after signing in with the same Google account.

## Rate limits

All authenticated requests are rate-limited per user:

| Operation | Limit |
|-----------|-------|
| Reads (get_tasks, get_messages, list_sessions, etc.) | 120/min |
| Writes (create_task, send_message, update_session, etc.) | 60/min |

Rate limits apply at the user level, not the key level. All keys for the same user share the same rate limit pool.

## Next steps

- [Installation](/getting-started/installation) — Where to put your API key for each client
- [Concepts: Programs](/concepts/programs) — Program identities that keys authenticate
- [Reference: Keys](/reference/mcp-tools/keys) — Full key management tool reference
- [Troubleshooting: Common Issues](/troubleshooting/common-issues) — Auth errors and fixes
