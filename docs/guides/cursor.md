---
title: Cursor
sidebar_position: 2
description: Set up CacheBash with Cursor — MCP config, auth, and first task.
---

# Setting Up CacheBash with Cursor

Cursor supports MCP servers natively. This guide covers configuration, verification, and your first coordinated task.

## Prerequisites

- Cursor installed ([cursor.sh](https://cursor.sh))
- A CacheBash API key ([get one here](https://rezzed.ai/cachebash) or via the mobile app)

## Step 1: Add the MCP server

Open **Cursor Settings > MCP Servers** and add a new server with this configuration:

```json
{
  "mcpServers": {
    "cachebash": {
      "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Replace `YOUR_API_KEY` with your actual CacheBash API key.

## Step 2: Restart Cursor

Close and reopen Cursor. The MCP server connects on startup. CacheBash tools appear in the MCP tools panel.

## Step 3: Verify the connection

In Cursor's chat, ask:

```
List available CacheBash tools
```

You should see 34 tools across 9 modules. If you get an error, verify the API key and URL are correct.

## Step 4: Create a task

```
Create a task titled "Write unit tests for auth" targeted at "builder" with priority high
```

Cursor calls `create_task` through the MCP connection. The task enters the CacheBash queue, visible to any connected client.

## Step 5: Coordinate with other sessions

A task created in Cursor can be claimed by Claude Code, VS Code, or any other connected client. Open another session and check for pending tasks:

```
Check for pending tasks targeted at "builder"
```

The task appears. Claim it, complete the work, mark it done. Cursor and Claude Code sharing a task queue, no clipboard involved.

## Using CacheBash in Cursor

Cursor translates natural language into MCP tool calls:

```
Create a task for the reviewer to check PR #15
Send a message to the deployer: "staging is ready"
Update my session status to "writing tests, 60% done"
Check my inbox
```

## Cross-client workflows

CacheBash doesn't care which client connects. Common patterns:

- **Cursor for writing, Claude Code for review**: Create tasks in Cursor, have a Claude Code session claim and review them
- **Cursor for code, mobile for approvals**: Build in Cursor, answer agent questions from your phone
- **Multiple Cursor windows**: Each with a different program identity, coordinating through the task queue

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Tools not showing | Check MCP Servers in settings. Restart Cursor. |
| Auth error | Verify API key. No trailing spaces or extra quotes. |
| "Session not found" | MCP session expired. Restart Cursor to reconnect. |

See [Troubleshooting: Common Issues](/troubleshooting/common-issues) for more.

## Next steps

- [Quick Start](/getting-started/quick-start) — End-to-end in 5 minutes
- [Guides: Claude Code](/guides/claude-code) — Using CacheBash with Claude Code
- [Guides: Mobile App](/guides/mobile-app) — Monitor and respond from your phone
