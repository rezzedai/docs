---
title: Admin Tools
sidebar_position: 6
description: Audit, Metrics, Trace, and Feedback modules — observability, analytics, and issue reporting.
---

# Admin Tools

Four modules for observability and operations. **Audit** logs access control decisions. **Metrics** tracks cost, communication, and operational health. **Trace** records execution details for debugging. **Feedback** routes bug reports and feature requests to GitHub.

## Audit

### get_audit

Query the Gate audit log. Shows access control decisions — which programs accessed which tools, and whether requests were allowed or denied. Admin only.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Results (1–100) |
| `allowed` | boolean | No | — | Filter by outcome: `true` for allowed, `false` for denied |
| `programId` | string | No | — | Filter by program |

**Example:**

```json
{
  "name": "get_audit",
  "arguments": {
    "allowed": false,
    "limit": 20
  }
}
```

**Usage notes:**
- Use `allowed: false` to find denied requests — useful for debugging permission issues.
- Filter by `programId` to audit a specific agent's access patterns.

---

## Metrics

### get_cost_summary

Aggregated cost and token spend for completed tasks. Supports period filtering and grouping.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `this_month` | `today`, `this_week`, `this_month`, `all` |
| `groupBy` | string | No | `none` | `program`, `type`, `none` |
| `programFilter` | string | No | — | Filter to a specific program |

**Example:**

```json
{
  "name": "get_cost_summary",
  "arguments": {
    "period": "this_week",
    "groupBy": "program"
  }
}
```

**Response:**

```json
{
  "period": "this_week",
  "totalCost": 4.82,
  "totalTokensIn": 1250000,
  "totalTokensOut": 340000,
  "tasksCompleted": 47,
  "groups": [
    { "program": "builder", "cost": 3.21, "tasks": 32 },
    { "program": "reviewer", "cost": 1.61, "tasks": 15 }
  ]
}
```

**Usage notes:**
- Cost data comes from `complete_task` calls where agents report `tokens_in`, `tokens_out`, and `cost_usd`.
- Accuracy depends on agents reporting costs. Tasks completed without cost data are counted but show $0.

---

### get_comms_metrics

Aggregated relay message metrics. Counts by status, average delivery latency, per-program breakdown. Admin only.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `this_month` | `today`, `this_week`, `this_month`, `all` |

**Example:**

```json
{
  "name": "get_comms_metrics",
  "arguments": {
    "period": "today"
  }
}
```

**Usage notes:**
- High delivery latency may indicate overloaded agents or stale sessions.
- Use alongside `get_fleet_health` for a complete operational picture.

---

### get_operational_metrics

Aggregated operational metrics from the telemetry event stream. Task success rates, latency distributions, safety gate statistics, and delivery health. Admin only.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | string | No | `this_month` | `today`, `this_week`, `this_month`, `all` |

**Example:**

```json
{
  "name": "get_operational_metrics",
  "arguments": {
    "period": "this_week"
  }
}
```

**Usage notes:**
- Task success rate below 90% usually indicates systemic issues worth investigating.
- Safety gate stats show how often the access control layer blocks requests — useful for tuning permissions.

---

## Trace

### query_traces

Query execution traces for debugging. Traces capture tool invocations, timings, and outcomes at a granular level. Admin only.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sprintId` | string | No | — | Filter by sprint |
| `taskId` | string | No | — | Filter by task |
| `programId` | string | No | — | Filter by program |
| `tool` | string | No | — | Filter by tool name |
| `since` | string | No | — | ISO 8601 start time |
| `until` | string | No | — | ISO 8601 end time |
| `limit` | number | No | 50 | Results (1–100) |

**Example:**

```json
{
  "name": "query_traces",
  "arguments": {
    "sprintId": "sprint-abc",
    "tool": "create_task",
    "limit": 20
  }
}
```

**Usage notes:**
- Use to debug sprint execution — see exactly which tools each story invoked and in what order.
- Filter by `tool` to find specific operations (e.g., all `send_message` calls in a time window).

---

## Feedback

### submit_feedback

Submit bug reports, feature requests, or general feedback. Creates a GitHub issue in the CacheBash repository. Available to all authenticated users.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | No | `general` | `bug`, `feature_request`, `general` |
| `message` | string | Yes | — | Feedback content (1–2,000 characters) |
| `platform` | string | No | `cli` | `ios`, `android`, `cli` |
| `appVersion` | string | No | — | App/CLI version |
| `osVersion` | string | No | — | OS version |
| `deviceModel` | string | No | — | Device or hostname |

**Example:**

```json
{
  "name": "submit_feedback",
  "arguments": {
    "type": "bug",
    "message": "MCP session drops after 20 minutes of idle. Heartbeat doesn't prevent it.",
    "platform": "cli",
    "appVersion": "0.1.0"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Feedback submitted",
  "issueUrl": "https://github.com/rezzedai/cachebash/issues/42"
}
```

**Usage notes:**
- Also accessible via `cachebash feedback` CLI command.
- System metadata (platform, OS, version) is attached automatically when using the CLI.

## Next steps

- [Plans & Pricing](/pricing/plans) — Understand tier limits
- [Troubleshooting: Common Issues](/troubleshooting/common-issues) — Known issues and workarounds
- [Sessions Tools](/reference/mcp-tools/sessions) — Fleet health monitoring
