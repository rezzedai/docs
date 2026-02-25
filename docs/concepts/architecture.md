---
title: Architecture
sidebar_position: 7
description: System components, data model, request flow, and security layers.
---

# Architecture

CacheBash is a multi-tenant MCP server built on Google Cloud Platform. The system has four main components: the MCP server, Firestore database, Firebase Functions, and the mobile app.

## System components

```
AI Clients (Claude Code, Cursor, VS Code, Gemini CLI)
          |
    MCP Protocol (Streamable HTTP + Bearer auth)
          |
  CacheBash MCP Server (Cloud Run, TypeScript, Node.js)
          |
  Security Layers (API key auth, rate limiting, capability gate)
          |
  Firestore (multi-tenant data store)
          |
  Firebase Functions (triggers, cleanup, background jobs)
          |
  Mobile App (React Native + Expo, iOS + Android)
```

### MCP Server

Runs on Google Cloud Run as a stateless service. Handles all MCP tool calls from connected AI clients. Written in TypeScript with Express. Scales automatically based on load.

**Key responsibilities:**
- MCP protocol handling (Streamable HTTP transport)
- Authentication and authorization
- Rate limiting
- Request routing to appropriate handlers
- Response formatting

**Deployment:**
- Region: `us-central1`
- Service: `cachebash-mcp`
- Endpoint: `https://cachebash-mcp-922749444863.us-central1.run.app/v1/mcp`

### Firestore

Multi-tenant NoSQL database. Each user gets isolated subcollections under `tenants/{uid}/`. Supports real-time subscriptions for the mobile app.

**Collections:**
- `tasks` — Task queue and lifecycle tracking
- `relay` — Message passing between agents
- `sessions` — Session health and progress monitoring
- `sprints` — Parallel work orchestration
- `programState` — Persistent agent memory
- `keys` — API key metadata (hashed, never plaintext)
- `ledger` — Cost and usage tracking
- `telemetry` — Operational metrics and audit trail

**Security:**
- Per-tenant isolation enforced at the data layer
- Firestore security rules restrict access to tenant data
- Indexes optimized for common query patterns

### Firebase Functions

Serverless functions for background processing and event-driven workflows.

**Functions:**
- `onTaskCreated` — Sends push notifications for high-priority tasks
- `onSessionTimeout` — Cleans up stale sessions after 2 hours of inactivity
- `dailyCleanup` — Archives completed tasks older than 30 days
- `telemetryAggregation` — Rolls up metrics for the analytics dashboard

### Mobile App

React Native + Expo app for iOS and Android. Provides visibility into agent activity and allows mobile task management.

**Features:**
- Real-time session monitoring
- Task queue visibility
- Push notifications for human-in-the-loop decisions
- API key management
- Sprint progress tracking

**Authentication:**
- Firebase JWT (Google Sign-In)
- API keys map to Firebase user IDs for tenant isolation

## Data model

CacheBash uses a multi-tenant architecture where each user's data lives under `tenants/{uid}/`.

```
tenants/
  {uid}/
    tasks/
      {taskId}
        - title, instructions, status, priority
        - target, source, createdAt, claimedAt, completedAt
        - tokens_in, tokens_out, cost_usd, model
    relay/
      {messageId}
        - message, message_type, source, target
        - priority, status, createdAt, readAt
    sessions/
      {sessionId}
        - name, programId, state, progress
        - status, lastHeartbeat, contextBytes
    sprints/
      {sprintId}
        - projectName, branch, status
        - stories (subcollection)
          - id, title, status, progress, wave
    programState/
      {programId}
        - contextSummary, learnedPatterns, config, baselines
    keys/
      {keyHash}
        - programId, label, createdAt, lastUsed, revoked
    ledger/
      {entryId}
        - taskId, tokens, cost, timestamp
    telemetry/
      {eventId}
        - event_type, payload, timestamp
```

Every document includes tenant ID in metadata for defense-in-depth security.

## Request flow

1. **Client request** — AI client calls an MCP tool (e.g., `create_task`)
2. **Transport** — Streamable HTTP delivers the request to Cloud Run
3. **Authentication** — Server validates `Authorization: Bearer {API_KEY}` header
   - Extracts API key from header
   - Hashes with SHA-256
   - Looks up in `keys` collection
   - Verifies key is not revoked
   - Retrieves tenant ID and program ID
4. **Rate limiting** — Sliding window rate limiter checks request frequency
   - Reads: 120/min per user
   - Writes: 60/min per user
   - Admin endpoints: 20/min per user
5. **Capability gate** — Validates the program has permission for this operation
   - Program can read its own tasks and messages
   - Program can write to its own state
   - Admin programs can read fleet health
6. **Handler** — Routes to the appropriate module (Dispatch, Relay, Pulse, etc.)
7. **Firestore** — Reads or writes data in the tenant's subcollection
8. **Response** — JSON response returned to the client
9. **Telemetry** — Event logged asynchronously for observability

## Security layers

### API key authentication

- Keys are SHA-256 hashed before storage
- Plaintext keys never stored in Firestore
- Each key maps to a specific program ID
- Keys can be revoked (soft delete preserves audit trail)

### Multi-tenancy

- Every Firestore operation scoped to `tenants/{uid}/`
- Tenant ID derived from API key, not user-provided
- Cross-tenant access prevented at the data layer

### Rate limiting

Sliding window algorithm tracks request frequency per tenant.

| Tier | Read limit | Write limit | Burst allowance |
|------|------------|-------------|-----------------|
| Free | 120/min | 60/min | 2x for 10 seconds |
| Pro | 300/min | 150/min | 3x for 30 seconds |

Limits are per tenant, not per program. Multiple programs under the same user share the same rate limit pool.

### Capability-based access control

Programs can only access resources they own or are explicitly granted. Enforced in the handler layer before Firestore access.

**Read access:**
- Own tasks (`target` matches program ID)
- Own messages (`target` matches program ID)
- Own state (`programId` matches)
- Fleet health (admin-only)

**Write access:**
- Create tasks for any target
- Send messages to any target
- Update own state
- Complete own tasks

### Firestore security rules

Defense-in-depth layer. Even if the application layer fails, Firestore rules prevent unauthorized access.

```javascript
match /tenants/{uid}/{document=**} {
  allow read, write: if request.auth.uid == uid;
}
```

## Observability

CacheBash emits telemetry events for every significant operation:

- Task lifecycle transitions
- Message delivery
- Session heartbeats
- API key usage
- Rate limit violations
- Error conditions

Events are stored in the `telemetry` collection and aggregated by Firebase Functions for the analytics dashboard.

## Deployment architecture

```
GitHub (rezzedai/cachebash)
    |
    | (CI/CD via GitHub Actions)
    |
Cloud Run (MCP Server)
    |
Firestore (data)
    |
Firebase Functions (triggers)
    |
Firebase Hosting (mobile app)
```

The monorepo uses Turborepo for build orchestration. Deployments are automated through GitHub Actions on push to `main`.

## Next steps

- [Concepts: Authentication](/concepts/authentication) — API key management details
- [Guides: Self-Hosting](/guides/self-hosting) — Run CacheBash on your own infrastructure
- [Troubleshooting: Common Issues](/troubleshooting/common-issues) — Debug connection problems
