---
title: Claude Code
sidebar_position: 1
description: Set up CacheBash with Claude Code — from config to first task.
---

# Setting Up CacheBash with Claude Code

Claude Code is the primary development driver for CacheBash. This guide takes you from zero configuration to your first coordinated task.

## Prerequisites

- Claude Code installed ([claude.ai/code](https://claude.ai/code))
- A CacheBash API key ([get one here](https://rezzed.ai/cachebash) or via the mobile app)

## Step 1: Add the MCP config

You have two options for where to put the config:

### Option A: Project-level (recommended for teams)

Create `.mcp.json` in your project root:

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

This config applies only to Claude Code sessions opened in this project directory. Add `.mcp.json` to your `.gitignore` to keep keys out of version control.

### Option B: User-level (applies everywhere)

Add to `~/.claude.json`:

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

This config applies to all Claude Code sessions regardless of project.

Replace `YOUR_API_KEY` with your actual CacheBash API key.

## Step 2: Restart Claude Code

Close and reopen Claude Code, or start a new session. The MCP server connects automatically on startup.

## Step 3: Verify the connection

Ask Claude Code to check for available tools:

```
What CacheBash tools are available?
```

You should see 34 tools across 9 modules (Dispatch, Relay, Pulse, Sprint, Signal, Dream, Program State, Keys, Observability).

If you see an error, check:
- The API key is correct (no extra spaces or quotes)
- The URL is exactly `https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp`
- You restarted Claude Code after adding the config

## Step 4: Create your first task

```
Create a task titled "Review auth module" with priority high, targeted at "builder"
```

Claude Code calls `create_task` and returns the task ID. The task is now in the queue.

## Step 5: Verify from another session

Open a second terminal. Start a new Claude Code session (with the same MCP config). Ask:

```
Check for pending tasks targeted at "builder"
```

The second session sees the task you created in the first. Claim it, work it, mark it done. Two sessions, coordinated through CacheBash.

## Using CacheBash in Claude Code

Once connected, you interact with CacheBash through natural language. Claude Code translates your requests into MCP tool calls automatically.

**Task management:**
```
Create a high-priority task for the builder: "Fix type error in auth.ts line 42"
Check my pending tasks
Claim task abc123
Mark task abc123 as complete
```

**Messaging:**
```
Send a message to the reviewer: "PR is ready for review"
Check my inbox for new messages
```

**Session tracking:**
```
Create a session named "Working on auth module"
Update my session progress to 75%
List all active sessions
```

**Program state:**
```
Save my current state: working on auth module, JWT validation done, tests remaining
Read my program state from the last session
```

## Multi-agent setup

For running multiple Claude Code agents that coordinate through CacheBash:

1. Create a separate API key for each agent role (`builder`, `reviewer`, `deployer`)
2. Use project-level `.mcp.json` in separate directories or git worktrees
3. Each agent gets its own terminal tab with its own identity
4. Tasks and messages flow between them through the CacheBash server

See [Concepts: Programs](/concepts/programs) for details on agent identity.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Session not found" error | MCP session expired. Restart Claude Code to reconnect. |
| Tools not appearing | Check config location and restart. Run `/mcp` in Claude Code to verify. |
| Auth error | Verify API key is correct. Check for trailing whitespace. |
| Rate limited | Reduce tool call frequency. Reads: 120/min, Writes: 60/min. |

See [Troubleshooting: Common Issues](/troubleshooting/common-issues) for more.

## Next steps

- [Quick Start](/getting-started/quick-start) — End-to-end in 5 minutes
- [Guides: Mobile App](/guides/mobile-app) — Monitor from your phone
- [Concepts: Tasks](/concepts/tasks) — Task lifecycle details
- [Reference: MCP Tools](/reference/mcp-tools/task-management) — Full tool reference
