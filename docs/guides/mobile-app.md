---
title: Mobile App
sidebar_position: 4
description: Monitor agents, create tasks, and respond to questions from your phone.
---

# Mobile App

The CacheBash mobile app gives you visibility and control when you're away from the terminal. See which agents are running, create tasks, and answer agent questions with a tap.

## Download

- **iOS**: [App Store](https://apps.apple.com/app/cachebash) *(coming soon)*
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=ai.rezzed.cachebash) *(coming soon)*

## First launch

1. Open the app and tap **Sign In with Google**
2. Use the same Google account associated with your CacheBash API keys
3. The app connects to your CacheBash instance automatically

Your tasks, messages, sessions, and agent state are all scoped to your Google account. The mobile app and your MCP clients share the same data.

## What you can do

### Monitor active sessions

The home screen shows all active agent sessions:

- **Agent name** and what it's working on
- **Progress** bar (0-100%)
- **State** indicator (working, blocked, complete)
- **Heartbeat** age — how recently the agent checked in

A stale heartbeat (no update in 15+ minutes) signals that something may have gone wrong.

### Create tasks

Tap the **+** button to create a task from your phone:

- Set a title, instructions, priority, and target program
- The task enters the CacheBash queue immediately
- Your terminal agents pick it up on their next inbox check

Use this when you think of something while away from your desk. The task will be waiting when your agents look for work.

### Respond to questions

When an agent uses the `ask_question` tool, your phone receives a push notification. Tap the notification to see the question and respond:

- Questions may include options to select from
- Type a freeform response if none of the options fit
- Your response is delivered to the waiting agent, which continues its work

The agent pauses until you respond. No terminal switching. No context loss.

### View alerts

Agents can send one-way alerts via `send_alert`. These appear as notifications on your phone. No response needed — they're informational.

Alert types:
- **Info** — Status updates, progress milestones
- **Success** — Task completed, PR merged
- **Warning** — Approaching budget cap, session degradation
- **Error** — Task failed, connection lost

## Notifications

### Setting up push notifications

Push notifications are enabled by default after sign-in. To configure:

1. Open the app
2. Go to **Settings > Notifications**
3. Choose which alert types trigger push notifications
4. Set quiet hours if you don't want overnight buzzes (unless you're running dream sessions)

### What triggers a notification

| Event | Notification |
|-------|-------------|
| `ask_question` | Push notification with question text and options |
| `send_alert` (error/warning) | Push notification with alert details |
| `send_alert` (info/success) | In-app only (unless configured otherwise) |
| Sprint completed | Push notification with summary |

## Security

- Authentication: Firebase JWT via Google Sign-In
- Questions are end-to-end encrypted between the MCP server and your device
- The app never sees your LLM API keys or model prompts
- All data is scoped to your authenticated account

## Offline behavior

The app requires an internet connection to fetch data and send responses. If you're offline when a question arrives, the push notification queues and delivers when you reconnect. The agent waits until it gets your response, regardless of how long that takes.

## Next steps

- [Quick Start](/getting-started/quick-start) — Set up your first terminal agent
- [Concepts: Sessions](/concepts/sessions) — How session tracking works
- [Concepts: Programs](/concepts/programs) — Agent identities and state
- [Guides: Claude Code](/guides/claude-code) — Connect your terminal agent
