---
title: Installation
sidebar_position: 2
description: Set up CacheBash with Claude Code, Cursor, VS Code, or Gemini CLI.
---

# Installation

CacheBash connects to your AI client as an MCP server. You add it to your client's MCP configuration, provide an API key, and restart. No package to install. No Docker container. No account creation flow.

## What you need

- A CacheBash API key (get one at [rezzed.ai/cachebash](https://rezzed.ai/cachebash) or via the mobile app)
- An MCP-compatible AI client

## Claude Code

Claude Code supports MCP servers in two locations:

**Project-level** (`.mcp.json` in your project root — recommended for team setups):

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

**User-level** (`~/.claude.json` — applies to all projects):

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

Restart Claude Code after adding the config. Your agent now has access to all 34 CacheBash tools.

## Cursor

Open **Settings > MCP Servers > Add Server** and enter:

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

Restart Cursor. CacheBash tools appear in the MCP tools panel.

## VS Code with Copilot

Add to your VS Code `settings.json` or workspace `.vscode/mcp.json`:

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

Restart VS Code. CacheBash tools are available through Copilot's MCP integration.

## Gemini CLI

Add to your Gemini CLI MCP configuration:

```json
{
  "mcpServers": {
    "cachebash": {
      "url": "https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer ${CACHEBASH_API_KEY}"
      }
    }
  }
}
```

Gemini CLI supports environment variable expansion. Set `CACHEBASH_API_KEY` in your shell profile instead of hardcoding the key in the config file.

## ChatGPT Desktop

Not yet supported. ChatGPT Desktop requires OAuth 2.1 for MCP server authentication. CacheBash uses Bearer token auth. OAuth 2.1 support is on the roadmap.

## Transport details

CacheBash uses **Streamable HTTP** transport with **Bearer token** authentication. This is the MCP standard for remote servers. Any MCP client that supports Streamable HTTP with custom headers will work.

| Detail | Value |
|--------|-------|
| Transport | Streamable HTTP |
| Endpoint | `https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp` |
| Auth | `Authorization: Bearer {API_KEY}` |
| Rate limit (reads) | 120/min per user |
| Rate limit (writes) | 60/min per user |

## Verifying the connection

After restarting your client, ask your agent:

```
List all available CacheBash tools
```

You should see 34 tools across 10 modules. If you see an error, check [Troubleshooting: Common Issues](/troubleshooting/common-issues).

## Multiple clients, one server

You can connect multiple clients to the same CacheBash instance with the same API key. A task created in Claude Code is visible in Cursor. A message sent from VS Code arrives in Gemini CLI. The server doesn't care which client connects. It speaks MCP.

For multi-agent setups where each agent has a distinct identity, use separate API keys per program. See [Concepts: Programs](/concepts/programs).

## Next steps

- [Quick Start](/getting-started/quick-start) — Create your first task in 5 minutes
- [Concepts: Overview](/concepts/overview) — What CacheBash is and how it fits
- [Concepts: Authentication](/concepts/authentication) — API key management and security
