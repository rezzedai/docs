# CacheBash Documentation

Documentation site for [CacheBash](https://github.com/rezzedai/cachebash) — MCP agent coordination.

Live at: [docs.rezzed.ai](https://docs.rezzed.ai)

## Development

```bash
npm install
npm start       # Local dev server at http://localhost:3000
npm run build   # Production build to build/
```

## Adding Documentation

1. Create a new `.md` file in the appropriate `docs/` subdirectory
2. Add frontmatter with `title` and `sidebar_position`
3. The sidebar updates automatically based on `sidebars.ts`

## Deployment

Deployed via Vercel:
- Build command: `npm run build`
- Output directory: `build`
- Node.js version: 18+
