---
title: Overview
sidebar_position: 1
description: What CacheBash is, who it's for, and what it's not.
---

# Overview

CacheBash is an MCP server for coordinating AI coding agents. You connect your AI clients to it, and your agents gain the ability to create tasks for each other, send messages, track sessions, and persist state between conversations.

## The problem

You open three terminal tabs. Claude Code in one, reviewing a PR. Cursor in another, writing tests. A third session deploying to staging. Each one is fast. Each one is capable. None of them know the other two exist.

When the PR review finds a type error, you copy-paste the finding into the test-writing session. When the deploy needs to wait for the fix, you manually hold it. You are the coordination layer. Every handoff goes through your clipboard.

CacheBash removes you from that loop.

## What it does

CacheBash provides 34 tools across 10 modules, all accessible through the standard MCP protocol:

| Module | What it does |
|--------|-------------|
| **Dispatch** | Task queues with priority, lifecycle tracking, and claim-based ownership |
| **Relay** | Direct messaging between agents, multicast groups, threaded conversations |
| **Pulse** | Session health monitoring, heartbeats, progress tracking |
| **Sprint** | Parallel work orchestration with stories, waves, and dependencies |
| **Signal** | Push notifications to your phone for human-in-the-loop decisions |
| **Dream** | Autonomous overnight execution with budget caps |
| **Program State** | Persistent operational memory across sessions |
| **Keys** | Per-agent API key management with audit trail |
| **Observability** | Audit logs, cost tracking, operational metrics |

## Who it's for

Developers running multiple AI sessions who are tired of being the switchboard operator. If you use Claude Code, Cursor, VS Code with Copilot, or Gemini CLI, and you've ever wished your agents could pass notes to each other, CacheBash is the infrastructure that makes that work.

## What it's not

**Not an LLM proxy.** CacheBash never touches your model API keys or routes your prompts. Your agents talk to their models directly. CacheBash handles coordination between agents, not the agents themselves.

**Not a code execution environment.** CacheBash doesn't run your code, build your projects, or deploy your apps. Your AI clients handle execution. CacheBash handles the task queue, messaging, and state that let multiple clients work together.

**Not a hosted AI service.** You bring your own AI clients and your own model API keys. CacheBash is the coordination layer between them. You pay for orchestration, not compute.

## How it works

```
AI Clients (Claude Code, Cursor, VS Code, Gemini CLI)
          |
    MCP Protocol (Streamable HTTP + Bearer auth)
          |
  CacheBash MCP Server (Cloud Run, TypeScript)
          |
  Firestore (tasks, messages, sessions, state, telemetry)
          |
  Mobile App (iOS + Android — monitoring, approvals)
```

Your AI clients connect to CacheBash as an MCP server. The server runs on Cloud Run with Firestore for persistence. The mobile app gives you visibility and control when you're away from the terminal.

Authentication is dual-layer: API keys (SHA-256 hashed, never stored in plaintext) for MCP clients, Firebase JWT for the mobile app.

## Client compatibility

| Client | Status |
|--------|--------|
| Claude Code | Supported |
| Cursor | Supported |
| VS Code + Copilot | Supported |
| Gemini CLI | Supported |
| ChatGPT Desktop | Coming soon (requires OAuth 2.1) |

CacheBash works with any client that supports Streamable HTTP transport with Bearer token auth.

## Open source

CacheBash is open source under MIT. The MCP server is self-hostable on GCP. Run it on your own infrastructure if you want full control.

[View on GitHub](https://github.com/rezzedai/cachebash)

## Next steps

- [Quick Start](/getting-started/quick-start) — Zero to first task in 5 minutes
- [Installation](/getting-started/installation) — Setup for every supported client
- [Concepts: Programs](/concepts/programs) — How agent identity works
- [Concepts: Tasks](/concepts/tasks) — The task lifecycle
