---
title: VS Code Copilot
sidebar_position: 3
description: Connect CacheBash to VS Code Copilot for multi-agent coordination.
---

# VS Code Copilot

VS Code supports MCP servers through GitHub Copilot. Connect CacheBash to enable task queues, messaging, and persistent state for your Copilot sessions.

## Important: VS Code config format

VS Code uses the `"servers"` key for MCP configuration, **not** `"mcpServers"`. This is different from Claude Code and other clients.

```json
{
  "servers": {
    "cachebash": {
      ...
    }
  }
}
```

If you use `"mcpServers"` (Claude Code format), VS Code will not recognize the configuration.

## Prerequisites

- **VS Code** with GitHub Copilot extension installed
- **CacheBash API key** ([get one here](https://rezzed.ai/cachebash) or via the mobile app)

## Setup

### Option A: Workspace-level (recommended)

Create `.vscode/mcp.json` in your project root:

```json
{
  "servers": {
    "cachebash": {
      "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

This config applies only to this workspace. Other workspaces won't see CacheBash unless they have their own `.vscode/mcp.json`.

Add `.vscode/mcp.json` to `.gitignore` to keep API keys out of version control:

```bash
echo ".vscode/mcp.json" >> .gitignore
```

### Option B: User-level (applies to all workspaces)

Add to your VS Code `settings.json`:

1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "Preferences: Open User Settings (JSON)"
3. Add the MCP configuration:

```json
{
  "mcp": {
    "servers": {
      "cachebash": {
        "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
        "headers": {
          "Authorization": "Bearer YOUR_API_KEY"
        }
      }
    }
  }
}
```

Replace `YOUR_API_KEY` with your actual CacheBash API key.

## Restart VS Code

Close and reopen VS Code, or reload the window:

1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "Developer: Reload Window"

This initializes the MCP connection.

## Verify the connection

Open GitHub Copilot Chat and ask:

```
List all available CacheBash tools
```

You should see 34 tools across 10 modules (Dispatch, Relay, Pulse, Sprint, Signal, Dream, Program State, Keys, Metrics, Trace).

If you see an error:
- Check the API key is correct (no extra spaces)
- Verify you used `"servers"` not `"mcpServers"`
- Confirm the URL is exactly `https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp`
- Restart VS Code

## Using CacheBash in Copilot

Once connected, interact with CacheBash through Copilot Chat. Copilot translates your requests into MCP tool calls.

**Task management:**
```
Create a task for the builder: "Fix type error in auth.ts line 42"
Check my pending tasks
Claim task abc123
Mark task abc123 as complete
```

**Messaging:**
```
Send a message to the reviewer: "PR ready for review"
Check my messages
```

**Session tracking:**
```
Create a session named "Fixing auth bug"
Update my session progress to 80%
List active sessions
```

**Program state:**
```
Save my current state: working on auth bug, fixed type error, tests passing
Read my program state from the last session
```

## Multi-agent setup with VS Code

Run multiple VS Code windows as different agents:

1. Create separate API keys for each agent (`builder`, `reviewer`, `deployer`)
2. Use workspace-level `.vscode/mcp.json` in separate directories or git worktrees
3. Each VS Code window becomes a distinct agent
4. Tasks and messages flow between them through CacheBash

**Example:**

**Builder workspace** (`~/projects/myapp/.vscode/mcp.json`):
```json
{
  "servers": {
    "cachebash": {
      "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer builder_api_key"
      }
    }
  }
}
```

**Reviewer workspace** (`~/projects/myapp-review/.vscode/mcp.json`):
```json
{
  "servers": {
    "cachebash": {
      "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer reviewer_api_key"
      }
    }
  }
}
```

Open both workspaces in separate VS Code windows. The builder creates tasks. The reviewer claims and executes them.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Tools not appearing | Check you used `"servers"` not `"mcpServers"`. Restart VS Code. |
| "Session not found" error | MCP session expired. Reload the window to reconnect. |
| Auth error | Verify API key is correct. Check for trailing whitespace. |
| Rate limited | Reduce tool call frequency. Reads: 120/min, Writes: 60/min. |

## Rate limits

CacheBash enforces rate limits per user (not per program):

| Operation | Limit |
|-----------|-------|
| Reads | 120/min |
| Writes | 60/min |
| Admin | 20/min |

Multiple Copilot sessions under the same API key share the same rate limit pool.

## Known limitations

**VS Code MCP support is newer than Claude Code.** Some features may behave differently:

- **Session management** — VS Code Copilot sessions are shorter-lived than Claude Code sessions. Save state frequently with `update_program_state`.
- **Tool call visibility** — Copilot doesn't show raw MCP tool calls in the UI. Check the Output panel for details.
- **Streaming responses** — Some tools return large responses. Copilot may truncate them in the chat window.

## Next steps

- [Quick Start](/getting-started/quick-start) — Create your first task in 5 minutes
- [Guides: Multi-Agent](/guides/multi-agent) — Coordinate multiple agents
- [Concepts: Tasks](/concepts/tasks) — Task lifecycle and priority model
- [Troubleshooting: Common Issues](/troubleshooting/common-issues) — Debug connection problems
