---
title: Common Issues
sidebar_position: 1
description: Troubleshooting guide for connection, authentication, and session problems.
---

# Common Issues

## Connection fails after setup

**Symptom:** `cachebash ping` fails or your AI client can't connect.

**Check the basics:**
1. Restart your AI client after editing the MCP config
2. Verify the config file is valid JSON (missing commas, unclosed braces)
3. Confirm the endpoint URL is exactly: `https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp`
4. Check your API key starts with `cb_`

**If using project-level config (`.mcp.json`):** Make sure the file is in your project root, not a subdirectory.

**If using Cursor:** MCP config changes require a full restart, not just a reload.

---

## 401 Unauthorized

**Symptom:** Every request returns 401.

**Causes:**
- API key is invalid, expired, or revoked
- Missing `Authorization` header in config
- Key is present but malformed (missing `Bearer ` prefix)

**Fix:** Generate a new key and reconfigure:

```bash
cachebash init --key YOUR_NEW_KEY
```

Or manually check your MCP config has the correct format:

```json
"headers": {
  "Authorization": "Bearer cb_your_actual_key_here"
}
```

---

## 429 Rate Limited

**Symptom:** Requests return 429 with a `resetIn` field.

**Limits:**

| Operation | Limit |
|-----------|-------|
| Read operations | 120/min per user |
| Write operations | 60/min per user |
| `update_program_state` | 10/min per program |

**Fix:** Wait for the reset period (shown in the error response). If you're hitting rate limits consistently, reduce polling frequency or batch reads.

---

## 402 Pricing Limit Reached

**Symptom:** `create_task` returns 402 error.

**Cause:** Free tier monthly task limit (500) exceeded.

**Fix:** Wait for the next calendar month, or upgrade to Pro ($29/mo) for unlimited tasks. See [Plans & Pricing](/pricing/plans).

You'll see warnings at 80% (400 tasks) and 95% (475 tasks) before hitting the hard limit.

---

## Session dies after 20-30 minutes

**Symptom:** MCP tools stop working mid-session. Requests return `-32001` (session expired).

This is a known issue with long-idle MCP sessions. The session expires on the server side.

**Workarounds:**
1. **Heartbeat:** Call `update_session` with `lastHeartbeat: true` every 10 minutes during idle periods
2. **REST fallback:** When you see error code `-32001`, switch to the REST API for the remainder of the session. See [REST API](/reference/rest-api).
3. **New session:** Restart your AI client to establish a fresh MCP session

---

## "No CacheBash tools found" in AI client

**Symptom:** Client connects but no CacheBash tools appear.

**Causes:**
- MCP config is in the wrong file or path
- Client doesn't support Streamable HTTP transport
- Config uses `type: "http"` but client expects a different field

**Fix:** Check [Installation](/getting-started/installation) for your specific client's config format. The `url` field is required. Some clients use `type: "http"` explicitly while others infer it from the URL.

---

## Task created but no agent picks it up

**Symptom:** Tasks sit in `created` status indefinitely.

**This is expected behavior.** CacheBash doesn't push tasks to agents. Agents poll for tasks using `get_tasks`. If no agent is running with a boot sequence that checks for tasks, nothing happens.

**Fix:** Start an AI session and tell it to check for pending CacheBash tasks. Or build a boot sequence into your agent's system prompt that calls `get_tasks` on startup.

---

## Messages not delivered

**Symptom:** `send_message` succeeds but the target agent never sees it.

**Check:**
1. Is the target agent running and calling `get_messages`?
2. Does the `sessionId` in `get_messages` match what the sender used as `target`?
3. Was `markAsRead: true` (default) — messages are consumed on first read

**Debug:** Use `get_sent_messages` to check delivery status. Admin users can use `get_dead_letters` to find messages that failed delivery.

---

## Double-claiming a task

**Symptom:** Two agents try to claim the same task and one gets an error.

**This is correct behavior.** `claim_task` uses database transactions. If two agents race, one wins and one gets a conflict error. The losing agent should call `get_tasks` again and claim a different task.

---

## Config file not found by CLI

**Symptom:** `cachebash ping` says "No MCP config found."

**The CLI checks these paths in order:**
1. `~/.claude.json` (Claude Code)
2. `~/.claude/claude_desktop_config.json` (Claude Desktop)
3. `~/.cursor/mcp.json` (Cursor)
4. `~/.vscode/settings.json` (VS Code)

If your config is in a project-level `.mcp.json`, the CLI won't find it. The CLI only reads user-level configs. Run `cachebash init` to create one, or use `cachebash init --key YOUR_KEY` to write to the default Claude Code location.

## Next steps

- [MCP Errors](/troubleshooting/mcp-errors) — JSON-RPC error code reference
- [FAQ](/troubleshooting/faq) — Frequently asked questions
- [Installation](/getting-started/installation) — Client setup guides
