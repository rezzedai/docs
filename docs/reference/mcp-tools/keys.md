---
title: API Keys
sidebar_position: 5
description: Keys module — create, list, and revoke per-program API keys.
---

# API Keys

The Keys module manages per-program API keys. Each key is SHA-256 hashed before storage — raw keys are never persisted. Keys carry a program identity and label for audit trail purposes.

## create_key

Generate a new API key for a program. Returns the raw key exactly once. After this response, the raw key is never retrievable — only the hash is stored.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `programId` | string | Yes | — | Program this key authenticates as |
| `label` | string | Yes | — | Human-readable label (e.g., "builder-production") |

**Example:**

```json
{
  "name": "create_key",
  "arguments": {
    "programId": "builder",
    "label": "builder-laptop"
  }
}
```

**Response:**

```json
{
  "success": true,
  "key": "cb_a1b2c3d4e5f6...",
  "keyHash": "sha256:...",
  "programId": "builder",
  "label": "builder-laptop"
}
```

**Usage notes:**
- Save the raw key immediately. It cannot be retrieved later.
- One program can have multiple keys (e.g., one per machine or client).
- The `cb_` prefix identifies CacheBash keys in config files.

---

## list_keys

List all API keys for the authenticated user. Returns metadata only — never raw keys.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includeRevoked` | boolean | No | `false` | Include revoked keys in the list |

**Example:**

```json
{
  "name": "list_keys",
  "arguments": {
    "includeRevoked": false
  }
}
```

**Response:**

```json
{
  "keys": [
    {
      "keyHash": "sha256:...",
      "programId": "builder",
      "label": "builder-laptop",
      "createdAt": "2026-02-20T10:00:00Z",
      "lastUsedAt": "2026-02-24T14:30:00Z",
      "revoked": false
    },
    {
      "keyHash": "sha256:...",
      "programId": "orchestrator",
      "label": "orchestrator-main",
      "createdAt": "2026-02-18T08:00:00Z",
      "lastUsedAt": "2026-02-24T14:28:00Z",
      "revoked": false
    }
  ]
}
```

**Usage notes:**
- `lastUsedAt` helps identify stale keys that should be revoked.
- Use labels to track which machine or client uses which key.

---

## revoke_key

Revoke an API key by its hash. Soft revoke — the key record stays in the database for audit purposes but authentication is immediately rejected.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `keyHash` | string | Yes | — | SHA-256 hash of the key to revoke |

**Example:**

```json
{
  "name": "revoke_key",
  "arguments": {
    "keyHash": "sha256:..."
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Key revoked"
}
```

**Usage notes:**
- Revocation is immediate. Any agent using the revoked key will get a 401 on the next request.
- Revoked keys are still visible in `list_keys` with `includeRevoked: true` for audit trail.
- To rotate a key: `create_key` with the same program and label, update the client config, then `revoke_key` the old hash.

## Next steps

- [Concepts: Authentication](/concepts/authentication) — How keys work in the auth model
- [Installation](/getting-started/installation) — Where keys go in your MCP config
- [CLI Reference](/reference/cli) — `cachebash init --key` for key setup
