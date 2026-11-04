# Moonlight Freight / Courier Nepal frontend

Next.js 15 and React frontend for **couriernepal.com**, using the Moonlight Freight navy, teal and yellow identity.

## Setup and deployment

Start with [DEPLOYMENT.md](DEPLOYMENT.md). It includes Windows local setup, administrator creation, cPanel Node/Python configuration, MySQL migrations, Redis rate limits, SMTP, SEO, visit measurement and rollback.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Start the backend on port 5000 first. Open http://localhost:3000. Browser requests use the same-origin `/api` proxy; configure the server-only `BACKEND_URL` before build and start. cPanel uses `app.js` with the production variables documented in the guide. This app requires a Node server and does not support static export.

## Features

- Responsive public pages and customer/admin workspaces.
- Public page text, service descriptions and SEO fields from the database; edit at `/admin/content` with stale-edit conflict protection.
- Shipment booking, paginated history, tracking, profile and revocable sessions connected to Flask.
- Admin pricing and account controls; server-calculated shipping estimates.
- Server-rendered articles and sanitized rich text, canonical links, sitemap, robots and organization metadata.
- First-party visit measurement behind a GDPR-shaped consent banner; the decision is stored and audited server-side, never in the browser.
- HttpOnly cookie authentication, CSRF protection, server-only backend key, CSP nonces and security headers.

## Verification

```powershell
npm run lint
npm run build
npm run typecheck
npm audit --omit=dev
```

GitHub Actions runs lint, build and type checks. On constrained Windows hosts, set `NEXT_LOW_MEMORY_BUILD=1`. Set `NEXT_DIST_DIR` consistently for both build and start when using an alternate build directory.

The lockfile includes compatible security updates. Targeted overrides keep Next.js on its current major while updating PostCSS and the typography selector parser. Revisit these overrides when upgrading their parent packages. As of 2026-11-02, the production dependency audit is clean. The full audit reports a moderate minimatch denial-of-service advisory in lint tooling; its available fix changes the major API, so it is not forced into ESLint. Lint only trusted project sources and update the tooling when compatible releases are available.

## Launch requirements

Review starter content and privacy wording, configure real rates, confirm cPanel runtime support, and verify HTTPS, SMTP and live carrier integrations. Production hosting credentials are not included. Account form labels and operational interface structure remain code-managed; business records and public editorial content are database-managed.
