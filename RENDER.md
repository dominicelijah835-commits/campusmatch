# Deploying CampMatch to Render

This project ships with two build targets:

| Target | Config | Used by |
| --- | --- | --- |
| Cloudflare Workers (default) | `vite.config.ts` | Lovable hosting (`*.lovable.app`) |
| Node web service | `vite.config.render.ts` | Render |

Both can coexist — Render uses its own config + scripts and does not affect the Lovable preview.

## 1. Push the repo to GitHub / GitLab

Render deploys from a Git repo. Connect this repo via Render → **New +** → **Blueprint** and point it at `render.yaml`.

## 2. Configure environment variables

Render will prompt for every `sync: false` variable in `render.yaml`. Copy these from your Lovable Cloud project (Connectors → Lovable Cloud → "View Backend"):

### Public (exposed to the browser at build time)
- `VITE_SUPABASE_URL` — `https://<project-ref>.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` — your anon/publishable key
- `VITE_SUPABASE_PROJECT_ID` — your Supabase project ref

### Server-only (never exposed to the client bundle)
- `SUPABASE_URL` — same as `VITE_SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` — same as `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (admin operations only)
- `LOVABLE_API_KEY` — for Lovable AI Gateway calls (optional)

> ⚠ `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Never put it in a `VITE_*` variable.

### Auto-set by Render
- `PORT` — Render injects this; the server binds to it automatically
- `NODE_ENV=production`
- `NODE_VERSION=20`

## 3. Build & start commands

These are defined in `render.yaml` and `package.json`:

```bash
# Render runs this on every deploy
npm install && npm run build:render

# Render runs this to start the service
npm run start
```

Locally:

```bash
bun install
bun run build:render
bun run start
# → http://localhost:3000
```

## 4. Notes & caveats

- **First deploy:** Render's free / starter tier cold-starts. Health check path is `/`.
- **Backend:** This app uses Lovable Cloud (Supabase) directly from the browser. No separate backend service is needed.
- **Auth redirect URLs:** After deploying, add your Render URL (e.g. `https://campmatch.onrender.com`) to your Supabase **Auth → URL Configuration → Redirect URLs**, otherwise OAuth / email confirmation links break.
- **Custom domain:** Add it under the Render service → **Settings → Custom Domains**, then add the same domain to Supabase redirect URLs.
- **Cloudflare/Lovable build is untouched** — `vite.config.ts`, `wrangler.jsonc`, and `src/server.ts` continue to work for `lovable.app` deploys.
