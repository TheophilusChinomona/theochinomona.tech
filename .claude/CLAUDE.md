# Portfolio Site - Project Memory

## Deployment Setup

### Infrastructure
- **Hosting**: Dokploy (self-hosted) at `panel.theochinomona.tech`
- **DNS/CDN**: Cloudflare (proxied) - Zone ID: `c70abaf9b5b02db2fbdf7e0911079e5d`
- **Domain**: `portfolio.theochinomona.tech` (no www prefix)
- **Cloudflare Tunnel**: All subdomains route through tunnel `3667fb58-5dff-48d1-9041-234b461840b7.cfargotunnel.com`

### Dokploy Configuration
- **App ID**: `CGF0EH7ZTPJfRPh9zgHjZ`
- **App Name**: `portfolio-portfolio-frontend-wcwusl`
- **Project**: Portfolio (`Tll1x2pgE4KfpZzoqwO29`)
- **Build Type**: `dockerfile` (uses the Dockerfile in repo root)
- **Source**: GitHub `TheophilusChinomona/theochinomona.tech`, branch `main`
- **Auto Deploy**: Enabled on push to main
- **Domain HTTPS**: `false` (Cloudflare handles SSL at the edge)
- **Certificate Type**: `none` (Cloudflare manages certs)

### Docker Build
- Multi-stage: Node 20 Alpine (build) -> Nginx Alpine (serve)
- Build args required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (set in Dokploy build args)
- `.env` is in `.dockerignore`, so env vars must be passed as Docker build args
- Nginx serves from `/usr/share/nginx/html` with SPA routing (`try_files $uri $uri/ /index.html`)

### API Keys (for reference)
- **Cloudflare DNS API**: Bearer token with `#dns_records:edit` permission
- **Dokploy API**: Uses `x-api-key` header (not `Authorization: Bearer`)

### Known Gotchas
1. **HTTPS redirect loop**: Dokploy domain must have `https: false` because Cloudflare terminates SSL and forwards HTTP to origin. If Dokploy has `https: true`, Traefik redirects HTTP->HTTPS creating an infinite loop.
2. **Build type must be `dockerfile`**: Using `static` build type only serves raw files from the repo — it does NOT run `npm install` or `npm run build`. The `/dist` folder doesn't exist in git.
3. **Vite env vars at build time**: Vite inlines `VITE_*` env vars during build. Since `.env` is dockerignored, the Dockerfile uses `ARG` declarations and Dokploy passes them as `buildArgs`.
4. **Wildcard DNS**: `*.theochinomona.tech` only matches one level deep. `www.portfolio.theochinomona.tech` won't resolve (two levels deep).
5. **Cloudflare beacon error**: `ERR_BLOCKED_BY_CLIENT` for `beacon.min.js` is just ad blockers — harmless.
