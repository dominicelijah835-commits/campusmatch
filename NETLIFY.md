# Deploying CampMatch to Netlify

This project ships with three build targets:

| Target | Config | Used by |
| --- | --- | --- |
| Cloudflare Workers (default) | `vite.config.ts` | Lovable hosting (`*.lovable.app`) |
| Node web service | `vite.config.render.ts` | Render |
| Netlify (SSR + Edge) | `vite.config.netlify.ts` | Netlify |

All three coexist — Netlify uses its own config and does not affect Lovable or Render builds.

## 1. Push the repo to GitHub / GitLab / Bitbucket

Netlify deploys from a Git repo. Connect this repo via Netlify → **Add new site → Import an existing project**.

## 2. Configure environment variables

In **Netlify → Site settings → Environment variables**, add the following. Copy values from your Lovable Cloud project (Connectors → Lovable Cloud → "View Backend"):

### Public (exposed to the browser at build time)
- `VITE_SUPABASE_URL` — `https://<project-ref>.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` — your anon/publishable key
- `VITE_SUPABASE_PROJECT_ID` — your Supabase project ref

### Server-only (used by SSR — never exposed to the client bundle)
- `SUPABASE_URL` — same as `VITE_SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` — same as `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (admin operations only)
- `LOVABLE_API_KEY` — for Lovable AI Gateway calls (optional)

> ⚠ `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Never put it in a `VITE_*` variable.

Set each variable's scope to **All scopes** (Builds + Functions + Runtime) so SSR functions can read them.

## 3. Build settings

These come from `netlify.toml`:

```
Build command:    npm install && npm run build:netlify
Publish directory: dist/client
Node version:     20
```

The `@netlify/vite-plugin-tanstack-start` plugin automatically wires up:
- The static client assets (`dist/client/`)
- An SSR Netlify Function that serves all dynamic routes
- All routing — refresh on `/discover/123` or any deep link works without 404s

You do **not** need `public/_redirects` or a SPA fallback. TanStack Start's server entry handles every request.

Locally:

```bash
bun install
bun run build:netlify
npx netlify deploy --build      # preview
npx netlify deploy --prod       # production
```

## 4. Notes & caveats

- **Auth redirect URLs:** After deploying, add your Netlify URL (e.g. `https://campmatch.netlify.app`) to your Supabase **Auth → URL Configuration → Redirect URLs**, otherwise OAuth / email confirmation links break.
- **Custom domain:** Add it under the Netlify site → **Domain management**, then add the same domain to Supabase redirect URLs.
- **Functions region:** Netlify Functions run in `us-east-2` by default. Switch under **Site settings → Functions → Region** if you need lower latency to your Supabase region.
- **Cloudflare/Lovable build is untouched** — `vite.config.ts`, `wrangler.jsonc`, and `src/server.ts` continue to power `*.lovable.app` deploys.
- **Render build is untouched** — `vite.config.render.ts` and `src/server.node.ts` continue to power Render deploys.
