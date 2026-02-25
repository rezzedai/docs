---
title: Self-Hosting
sidebar_position: 7
description: Run CacheBash on your own Google Cloud infrastructure.
---

# Self-Hosting

CacheBash is open source under MIT. You can run it on your own Google Cloud Platform infrastructure for full control over data, security, and costs.

## Prerequisites

- **Node.js 18+** — Required for building and running the MCP server
- **Google Cloud project** — You'll deploy to Cloud Run and Firestore
- **Firebase project** — Linked to your GCP project
- **gcloud CLI** — For deployments
- **Firebase CLI** — For Firestore rules and indexes

Install the CLIs if you don't have them:

```bash
# Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Firebase CLI
npm install -g firebase-tools
```

## Clone the repository

```bash
git clone https://github.com/rezzedai/cachebash.git
cd cachebash
```

## Repository structure

CacheBash is a Turborepo monorepo with npm workspaces:

```
cachebash/
  apps/
    mobile/          # React Native + Expo mobile app
  services/
    mcp-server/      # MCP server (Express + TypeScript)
    functions/       # Firebase Functions
  packages/
    cli/             # Command-line tools
    types/           # Shared TypeScript types
    dreamwatch/      # Dream orchestrator
  firestore.rules    # Firestore security rules
  firestore.indexes.json  # Firestore indexes
  package.json       # Workspace root
```

## Install dependencies

At the repository root:

```bash
npm install
```

This installs dependencies for all workspaces (monorepo setup).

## Configure environment variables

Create `.env` in `services/mcp-server/`:

```bash
cd services/mcp-server
cp .env.example .env
```

Edit `.env`:

```bash
# Google Cloud project ID
GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# Firebase project ID (usually same as GCP project)
FIREBASE_PROJECT_ID=your-firebase-project-id

# Optional: rate limit overrides
RATE_LIMIT_READS_PER_MINUTE=120
RATE_LIMIT_WRITES_PER_MINUTE=60

# Optional: enable debug logging
DEBUG=cachebash:*
```

## Set up Firestore

### Enable Firestore

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select your existing project
3. Navigate to **Firestore Database**
4. Click **Create Database**
5. Choose **Production mode** (rules will be deployed separately)
6. Select a region (recommend `us-central1`)

### Deploy Firestore rules

From the repository root:

```bash
firebase deploy --only firestore:rules
```

This deploys the security rules from `firestore.rules`. Rules enforce multi-tenant isolation at the database layer.

### Deploy Firestore indexes

```bash
firebase deploy --only firestore:indexes
```

This creates composite indexes for common queries. Without these, many queries will fail.

## Build the MCP server

From `services/mcp-server/`:

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Deploy to Cloud Run

From `services/mcp-server/`:

```bash
gcloud run deploy cachebash-mcp \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-gcp-project-id,FIREBASE_PROJECT_ID=your-firebase-project-id
```

This:
- Builds a container image using Cloud Build
- Deploys the container to Cloud Run
- Returns a public URL (e.g., `https://cachebash-mcp-abc123.run.app`)

**Important:** Cloud Run requires `--allow-unauthenticated` because authentication is handled via Bearer tokens in the `Authorization` header, not through Cloud Run's built-in auth.

## Deploy Firebase Functions

Firebase Functions handle background tasks (session cleanup, telemetry aggregation, push notifications).

From the repository root:

```bash
firebase deploy --only functions
```

Functions are defined in `services/functions/src/`:

- `onTaskCreated` — Push notifications for high-priority tasks
- `onSessionTimeout` — Clean up stale sessions
- `dailyCleanup` — Archive old tasks
- `telemetryAggregation` — Roll up metrics

## Verify deployment

Your self-hosted CacheBash instance is now running. Test the connection:

```bash
curl -X POST https://your-cloud-run-url.run.app/v1/mcp \
  -H "Authorization: Bearer test-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

You should see a list of 34 MCP tools in the response.

## Create your first API key

API keys are managed through the MCP server. Use the `create_key` tool:

```bash
curl -X POST https://your-cloud-run-url.run.app/v1/mcp \
  -H "Authorization: Bearer admin-bootstrap-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_key",
      "arguments": {
        "programId": "builder",
        "label": "Builder Agent"
      }
    }
  }'
```

Response includes the plaintext API key. Save it — you won't see it again.

**Bootstrap key:** The first API key must be created with an admin bootstrap key or through Firebase Auth. See `services/mcp-server/src/auth.ts` for bootstrap configuration.

## Configure AI clients

Point your AI clients (Claude Code, Cursor, VS Code) at your self-hosted instance.

**Claude Code** (`.mcp.json`):

```json
{
  "mcpServers": {
    "cachebash": {
      "url": "https://your-cloud-run-url.run.app/v1/mcp",
      "headers": {
        "Authorization": "Bearer your-api-key-here"
      }
    }
  }
}
```

Restart Claude Code. Your agents now connect to your self-hosted CacheBash instance.

## Deploy the mobile app (optional)

The mobile app is built with React Native + Expo. Deploy it to provide mobile visibility into agent activity.

### Build the app

From `apps/mobile/`:

```bash
npm run build
```

### Configure Firebase

Update `apps/mobile/app.json` with your Firebase project details:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

Download `google-services.json` and `GoogleService-Info.plist` from the Firebase Console.

### Deploy with Expo

```bash
eas build --platform all
eas submit --platform all
```

This builds and submits the app to the App Store and Google Play. Requires an Expo account and app store developer accounts.

## Monitoring and observability

### Cloud Run logs

View MCP server logs:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=cachebash-mcp" --limit 50 --format json
```

### Firestore metrics

View database metrics in the [Firebase Console](https://console.firebase.google.com) → **Firestore Database** → **Usage**.

### Firebase Functions logs

```bash
firebase functions:log
```

## Updating your instance

When new versions of CacheBash are released:

```bash
git pull origin main
npm install
cd services/mcp-server
npm run build
gcloud run deploy cachebash-mcp --source .
```

This pulls the latest code, installs dependencies, rebuilds, and redeploys.

## Cost estimates

Self-hosting costs vary based on usage. Estimates for a team of 5 agents:

| Service | Usage | Monthly cost |
|---------|-------|--------------|
| Cloud Run | 10M requests | ~$5 |
| Firestore | 50M reads, 25M writes | ~$30 |
| Firebase Functions | 5M invocations | ~$2 |
| Cloud Build | 10 builds | Free tier |
| **Total** | | **~$37/month** |

Costs scale linearly with request volume. Free tier covers light usage (1–2 agents).

## Security considerations

- **API keys** — SHA-256 hashed before storage. Never logged.
- **Firestore rules** — Enforce multi-tenancy. Deploy with `firebase deploy --only firestore:rules`.
- **Cloud Run** — Use `--allow-unauthenticated` but validate Bearer tokens in the handler.
- **Environment variables** — Store sensitive values in Google Secret Manager, not `.env` files.
- **Rate limiting** — Enabled by default. Configure in `.env` if needed.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Firestore permission denied | Deploy `firestore.rules` with `firebase deploy --only firestore:rules` |
| Queries failing | Deploy indexes with `firebase deploy --only firestore:indexes` |
| Cloud Run 503 errors | Check logs with `gcloud logging read`. Verify env vars are set. |
| API key not working | Verify key is created and not revoked. Check `keys` collection in Firestore. |
| Functions not triggering | Verify functions deployed with `firebase deploy --only functions` |

## Next steps

- [Concepts: Architecture](/concepts/architecture) — Deep dive into system components
- [Guides: Claude Code](/guides/claude-code) — Connect Claude Code to your instance
- [Reference: MCP Tools](/reference/mcp-tools/task-management) — Full tool reference
