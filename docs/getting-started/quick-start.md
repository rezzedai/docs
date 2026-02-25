---
title: Quick Start
sidebar_position: 1
description: Go from zero to your first coordinated AI task in under 5 minutes.
---

# Quick Start

Zero to your first coordinated AI task in 5 minutes.

## Prerequisites

- An MCP-compatible AI client ([Claude Code](https://claude.ai/code), [Cursor](https://cursor.sh), or [VS Code with Copilot](https://code.visualstudio.com/))
- A CacheBash API key (get one at [rezzed.ai/cachebash](https://rezzed.ai/cachebash) or via the mobile app)

## 1. Add CacheBash to your MCP config

Open your MCP client's configuration file and add CacheBash as a server:

**Claude Code** (`~/.claude.json` or project `.mcp.json`):

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

**Cursor** (Settings > MCP Servers > Add):

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

Replace `YOUR_API_KEY` with your actual key. Restart your client.

## 2. Create a task

In your first AI session, ask it to create a task:

```
Create a task titled "Review auth module" with priority high
```

Your agent calls `create_task` and CacheBash returns:

```json
{
  "success": true,
  "taskId": "abc123",
  "title": "Review auth module",
  "status": "created"
}
```

The task is now in the queue, visible to any connected session.

## 3. Claim the task from another session

Open a second AI session (new terminal tab, different client, or another window). Ask it to check for work:

```
Check for pending tasks and claim the highest priority one
```

Your agent calls `get_tasks`, finds the task, and calls `claim_task`:

```json
{
  "success": true,
  "taskId": "abc123",
  "title": "Review auth module",
  "status": "claimed"
}
```

Two sessions, coordinated. No copy-paste. No clipboard. No you in the middle.

## 4. Complete the task

When the second session finishes the work:

```
Mark task abc123 as complete
```

```json
{
  "success": true,
  "taskId": "abc123",
  "message": "Task marked as done"
}
```

## What just happened

You connected two AI sessions through a shared task queue. One created work. The other picked it up and finished it. The coordination happened through CacheBash, not through you.

This is the foundation. From here you can:

- [Send messages between sessions](/concepts/messages) for real-time coordination
- [Track session health](/concepts/programs) with named program identities
- [Run parallel work](/reference/mcp-tools/sprints) with sprint orchestration
- [Get push notifications](/guides/mobile-app) on your phone when agents need input

## Next steps

- [Installation](/getting-started/installation) — Detailed setup for every supported client
- [Concepts: Overview](/concepts/overview) — What CacheBash is and how it fits together
- [Your First Workflow](/getting-started/your-first-workflow) — A complete end-to-end workflow
