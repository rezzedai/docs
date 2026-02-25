---
title: CLI Reference
sidebar_position: 1
description: CacheBash CLI commands — init, ping, and feedback.
---

# CLI Reference

The CacheBash CLI handles setup and diagnostics. Three commands: `init` configures your MCP client, `ping` tests the connection, `feedback` files bug reports and feature requests.

## Installation

```bash
npm install -g cachebash
```

Or run without installing:

```bash
npx cachebash <command>
```

## Commands

### `cachebash init`

Configure CacheBash for your AI client. Detects your MCP config, writes the server entry, and verifies the connection.

```bash
cachebash init
```

**What it does:**

1. Opens your browser to authenticate and get an API key
2. Detects installed MCP clients (Claude Code, Cursor, VS Code, Gemini CLI)
3. If multiple clients found, prompts you to choose one
4. Writes the CacheBash server entry to that client's MCP config
5. Verifies the connection

If you already have an API key, skip the browser flow:

```bash
cachebash init --key YOUR_API_KEY
```

**Options:**

| Flag | Description |
|------|-------------|
| `--key <API_KEY>` | Use an existing API key instead of browser auth |

**Config locations detected:**

| Client | Config path |
|--------|------------|
| Claude Code | `~/.claude.json` |
| Claude Desktop | `~/.claude/claude_desktop_config.json` |
| Cursor | `~/.cursor/mcp.json` |
| VS Code | `~/.vscode/settings.json` |

If no MCP config is found, `init` defaults to creating a Claude Code config.

**Example output:**

```
→ Opening browser for authentication...
→ Waiting for approval...
✓ Authenticated
→ Detected: Claude Code (~/.claude.json), Cursor (~/.cursor/mcp.json)
→ Select config to update: [1] Claude Code  [2] Cursor
→ Writing CacheBash config to ~/.claude.json
✓ Config written
→ Verifying connection...
✓ Connected to CacheBash MCP

Next step: cachebash ping
```

**Idempotent.** Running `init` again updates the existing config entry. Safe to re-run after key rotation.

---

### `cachebash ping`

Test your connection to the CacheBash MCP server.

```bash
cachebash ping
```

**What it does:**

1. Reads your MCP config to find the API key
2. Sends an `initialize` request to the MCP server
3. Reports success with round-trip latency

**Example output:**

```
✓ Connected to CacheBash MCP (127ms)
```

**Error cases:**

| Error | Meaning | Fix |
|-------|---------|-----|
| No MCP config found | No client configured | Run `cachebash init` |
| No CacheBash API key found | Config exists but missing auth | Run `cachebash init --key YOUR_KEY` |
| 401 Unauthorized | API key invalid or revoked | Generate a new key and re-run `init` |
| Connection failed | Network or server issue | Check your internet connection, retry |

Use `ping` after initial setup, after key rotation, or when debugging connectivity issues.

---

### `cachebash feedback`

Submit bug reports, feature requests, or general feedback. Creates a GitHub issue in the CacheBash repository.

```bash
cachebash feedback "your message here"
```

**Options:**

| Flag | Description | Values |
|------|-------------|--------|
| `--type` or `-t` | Feedback category | `bug`, `feature`, `general` (default: `general`) |

**Examples:**

```bash
# General feedback
cachebash feedback "Love the sprint orchestration module"

# Bug report
cachebash feedback --type bug "Session heartbeat stops after 20 minutes of idle"

# Feature request
cachebash feedback -t feature "Add webhook support for task completion events"
```

**Constraints:**

- Message is required (non-empty)
- Maximum 2,000 characters

**Metadata included automatically:** Platform (`cli`), CLI version, OS, hostname. You don't need to provide system information — it's attached to the issue.

**Example output:**

```
✓ Feedback submitted
→ Track at: https://github.com/rezzedai/cachebash/issues/42
```

---

### `cachebash --help`

Display available commands and usage examples.

```bash
cachebash --help
```

```
Usage: cachebash <command>

Commands:
  init          Set up CacheBash MCP connection
  init --key    Use an existing API key
  ping          Test MCP connectivity
  feedback      Submit feedback (bug report, feature request, or general)

Feedback:
  cachebash feedback "your message"
  cachebash feedback --type bug "description of the issue"
  cachebash feedback -t feature "I'd like to see..."

Options:
  --help        Show this help message
```

## Environment variables

| Variable | Effect |
|----------|--------|
| `NO_COLOR=1` | Disables colored output (useful for CI/CD or piping) |

## Next steps

- [Installation](/getting-started/installation) — Manual MCP config for each client
- [Quick Start](/getting-started/quick-start) — Create your first task
- [Troubleshooting: Common Issues](/troubleshooting/common-issues) — Connection and auth problems
