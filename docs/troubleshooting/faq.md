---
title: FAQ
sidebar_position: 3
description: Frequently asked questions about CacheBash.
---

# FAQ

## General

### What is CacheBash?

An MCP server for coordinating AI coding agents. You connect your AI clients (Claude Code, Cursor, VS Code, Gemini CLI) to CacheBash, and your agents gain the ability to create tasks for each other, send messages, track sessions, and persist state between conversations.

### Does CacheBash run my AI models?

No. CacheBash never touches your model API keys or routes your prompts. Your AI clients talk to their models directly. CacheBash handles coordination between agents — task queues, messaging, sessions — not the agents themselves.

### What AI clients are supported?

Any MCP client that supports Streamable HTTP transport with Bearer token auth. Currently tested with Claude Code, Cursor, VS Code with Copilot, and Gemini CLI. ChatGPT Desktop support is pending their OAuth 2.1 implementation.

### Is CacheBash open source?

Yes. MIT license. The MCP server is self-hostable on GCP with Firestore. [View on GitHub](https://github.com/rezzedai/cachebash).

---

## Pricing

### Is the free tier actually free?

Yes. No credit card. No trial period. 3 programs, 500 tasks/month, 1 concurrent session. That's enough to run a real multi-agent workflow daily.

### What happens when I hit the free tier limit?

Task creation is blocked for the rest of the calendar month. Everything else keeps working — messages, sessions, reads. You'll see warnings at 80% and 95% usage before the hard limit.

### Can I self-host to avoid limits?

Yes. Self-hosted deployments have no tier limits. You control the configuration. See [Self-Hosting Guide](/guides/self-hosting).

---

## Technical

### How do agents discover each other?

They don't need to. Agents communicate through CacheBash, not directly. Agent A creates a task targeting "builder." Any agent checking for tasks as "builder" will find it. Identity is label-based, not connection-based.

### Can I use the same API key for multiple clients?

Yes. A task created in Claude Code is visible in Cursor with the same key. For multi-agent setups where each agent has a distinct identity, use separate keys per program. See [API Keys](/reference/mcp-tools/keys).

### Is data encrypted?

API keys are SHA-256 hashed before storage — raw keys are never persisted. Mobile app questions use end-to-end encryption by default. All transport is HTTPS. Data at rest is stored in Firestore, which encrypts at rest by default.

### How long is data retained?

Tasks, messages, and sessions persist indefinitely on the hosted service. Program state persists until explicitly overwritten. Audit logs and traces are retained for the billing period.

### What's the latency?

Typical tool calls complete in 50-200ms depending on your location relative to `us-central1` (Iowa). The MCP server runs on Cloud Run with automatic scaling.

### Is there a WebSocket or SSE option?

CacheBash uses Streamable HTTP transport per the MCP specification. Agents poll for new messages using `get_messages`. There's no persistent push channel to AI clients — the mobile app uses FCM for push notifications.

---

## Mobile App

### What can I do from the mobile app?

Monitor active sessions, answer questions from agents (via `ask_question`), receive push notifications for alerts, and manage API keys. You can't create tasks or send messages from the mobile app — that's agent-side functionality.

### Is the mobile app required?

No. The mobile app is optional. All core functionality (tasks, messages, sessions) works through MCP tools alone. The app adds monitoring and human-in-the-loop approvals.

---

## Security

### Who can see my tasks and messages?

Only agents authenticated with your API keys. CacheBash is single-tenant per API key set. Your data is isolated from other users.

### Can agents access each other's state?

Programs can only read and write their own program state. Admin role can read any program's state for debugging. Task and message visibility is scoped to your tenant.

### What happens if an API key is compromised?

Revoke it immediately using `revoke_key` or the mobile app. Revocation is instant. Then generate a new key with `create_key` and update your client configs.

## Next steps

- [Common Issues](/troubleshooting/common-issues) — Troubleshooting specific problems
- [MCP Errors](/troubleshooting/mcp-errors) — Error code reference
- [Concepts: Overview](/concepts/overview) — How CacheBash works
