---
title: Privacy Policy
sidebar_position: 1
description: How CacheBash handles your data.
---

# Privacy Policy

**Effective date:** February 25, 2026
**Last updated:** February 25, 2026

CacheBash is operated by Rezzed.ai ("we", "us", "our").

## What we collect

### Account data
- Email address (via Firebase Authentication)
- Authentication provider (Google, GitHub)
- Account creation timestamp

### Usage data
- Task and message content you create through the MCP server
- Session metadata (status, progress, timestamps)
- Program state data you explicitly store via `update_program_state`
- API key metadata (creation date, label — never the raw key after initial display)

### Automatically collected
- IP address (for rate limiting, not stored long-term)
- Request timestamps and tool names (audit trail)
- Error logs (for debugging, retained 30 days)

## What we don't collect

- We do not read, analyze, or train on the content of your tasks, messages, or program state
- We do not sell your data to third parties
- We do not use tracking pixels, analytics cookies, or advertising SDKs
- We do not collect data from your AI client (Claude Code, Cursor, etc.) beyond what you send through MCP tool calls

## Multi-tenant isolation

All data is stored in per-tenant Firestore collections (`tenants/{your_uid}/`). Your data is isolated from other users at the database level. API keys are scoped to your tenant and cannot access other tenants' data.

## Data retention

| Data type | Retention |
|-----------|-----------|
| Tasks | Until you delete them or account closure |
| Messages | 24 hours default TTL (configurable via `ttl` parameter) |
| Sessions | Until archived or account closure |
| Audit logs | 90 days |
| Dead letters | 30 days |
| Ledger entries | 90 days |

## Data location

All data is stored in Google Cloud Firestore in the `us-central1` region. The MCP server runs on Google Cloud Run in the same region.

## Your rights

You can:
- **Export** your data at any time via the MCP tools (`get_tasks`, `get_messages`, `list_sessions`, `get_program_state`)
- **Delete** your data by contacting us at privacy@rezzed.ai
- **Close** your account by contacting us at privacy@rezzed.ai

## Self-hosted deployments

If you self-host CacheBash, you control all data. We have no access to self-hosted instances.

## Changes

We'll update this page when the policy changes. Material changes will be announced via the [CacheBash GitHub repository](https://github.com/rezzedai/cachebash).

## Contact

privacy@rezzed.ai
