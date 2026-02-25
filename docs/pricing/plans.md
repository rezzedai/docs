---
title: Plans & Pricing
sidebar_position: 1
description: CacheBash pricing — Free, Pro, and Team tiers.
---

# Plans & Pricing

CacheBash charges for coordination, not compute. You bring your own AI clients and model API keys. CacheBash handles the task queue, messaging, sessions, and orchestration between them.

## Plans

|  | Free | Pro | Team |
|--|------|-----|------|
| **Price** | $0 | $29/mo | $99/mo |
| **Programs** | 3 | Unlimited | Unlimited |
| **Tasks / month** | 500 | Unlimited | Unlimited |
| **Concurrent sessions** | 1 | 5 | 10 |
| **Push notifications** | Basic | Full | Full |
| **Analytics** | Basic | Full | Full |
| **Multi-operator** | — | — | Yes |

## Free

No credit card. No trial timer. The free tier gives you 3 programs, 500 tasks per month, and 1 concurrent session. That's enough to run a real multi-agent workflow — one orchestrator, two builders — and ship actual work.

500 tasks per month covers most solo developer workflows. If you're running 3 AI sessions and coordinating tasks between them, you'll use 10-20 tasks per working session. That's roughly a month of daily use before you approach the limit.

**Limits are hard.** When you hit 500 tasks in a calendar month, task creation is blocked until the next month. You'll see a warning at 80% and 95% usage. Messages, sessions, and all other tools continue to work.

## Pro

$29/month. Unlimited programs, unlimited tasks, 5 concurrent sessions.

For developers running multi-agent fleets daily. Five concurrent sessions means you can have an orchestrator coordinating four builders simultaneously — or any combination that fits your workflow. Full push notifications through the mobile app. Full analytics dashboard.

**Limits are soft.** Pro tier warns but doesn't block. If you exceed 5 concurrent sessions, you see a warning. Your work continues uninterrupted.

## Team

$99/month. Everything in Pro, plus 10 concurrent sessions and multi-operator support.

Multi-operator means multiple users share a CacheBash instance with separate identities and shared task visibility. Your fleet, your teammate's fleet, same coordination layer.

Team is currently on waitlist. [Join the waitlist](https://rezzed.ai/cachebash).

## What's included in every tier

- **All 35 MCP tools** — Dispatch, Relay, Pulse, Signal, Sprint, Dream, Program State, Keys, Metrics, and more
- **Mobile app** — iOS and Android for monitoring and approvals
- **Open source server** — MIT licensed, self-hostable on GCP
- **Streamable HTTP transport** — Works with Claude Code, Cursor, VS Code, Gemini CLI
- **Firestore persistence** — Tasks, messages, sessions, and state persist across conversations
- **API key management** — Per-program keys with audit trail

## What you don't pay for

CacheBash never touches your model API keys. Your Claude, OpenAI, Google, or any other LLM costs are between you and your provider. CacheBash orchestrates the work between your agents. It doesn't run the agents.

No storage fees. No per-message charges. No bandwidth costs. One flat price for the coordination layer.

## Billing

- Monthly billing, cancel anytime
- Counters reset on the 1st of each calendar month
- Upgrade or downgrade takes effect immediately
- Self-service tier changes coming soon via Stripe

## Self-hosting

CacheBash is open source under MIT. You can run the MCP server on your own GCP infrastructure with your own Firestore instance. Self-hosted deployments have no tier limits — you control the configuration.

[Self-hosting guide](/guides/self-hosting) | [GitHub repository](https://github.com/rezzedai/cachebash)

## Next steps

- [Quick Start](/getting-started/quick-start) — Try CacheBash in 5 minutes
- [Installation](/getting-started/installation) — Set up your AI client
- [Concepts: Overview](/concepts/overview) — What CacheBash is and how it works
