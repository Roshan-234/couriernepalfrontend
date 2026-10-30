# Moonlight Freight frontend

Next.js / React frontend for the Flask Courier Nepal backend.

## Run locally

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Start Flask on port 5000, then open http://localhost:3000.

```powershell
npm run lint
npm run typecheck
npm run build
npm start
```

BACKEND_URL is the server-only backend origin, without /api. Set it before building and running Next.js. Browser calls use /api; the rewrite forwards requests and cookies to Flask. Do not configure an absolute browser API URL. Deploy Next.js as a server, not a static export.

## Changes

- Responsive public website, consistent typography, accessible navigation, service, tracking, pricing and account screens.
- Shared HttpOnly cookie authentication, CSRF headers and single-flight refresh.
- Real shipment booking, history, details and tracking; no simulated success.
- Customer/admin workspaces backed by API data.
- Contact submissions, profile name updates and live pricing estimates.
- Fixed broken blog syntax, pagination, async route params and request contracts.
- Removed duplicate API handlers that shadowed the backend proxy.

## Limits

Admin settings no longer pretend to persist unsupported configuration. Deployment settings are managed on the server. The user directory supports account status changes with server-side authorization. Online estimates require pricing rules. Password-reset email requires SMTP. External carriers and production services were not tested locally.

Legacy unused components retain image-optimization warnings; EditorJS content is rendered through a sanitized block renderer. Lint has no errors. The rich-text image-upload tool is omitted because the backend has no upload endpoint.

## Functional update

- Next.js and eslint-config-next updated to 15.5.28; package-lock.json included.
- Admin shipping-rate editor at `/admin/pricing` connects to the public quote calculator.
- Customer session controls at `/dashboard/sessions`; account status controls at `/admin/users`.
- Profile changes update the shared account state immediately; login/logout clears account query caches.
- Blog content supports EditorJS JSON and sanitizes legacy HTML with DOMPurify.
- GitHub Actions run lint, production build, and TypeScript checks.

On constrained Windows environments, use `NEXT_LOW_MEMORY_BUILD=1` to build without the webpack worker and with one static generation worker. Optional `NEXT_DIST_DIR=.next-verified` isolates build output; use the same directory variable for build and start. Default hosting still uses `.next`.

Verified locally: production build, TypeScript, lint (no errors; five legacy image warnings), and HTTP integration through the production Next.js proxy to Flask. Production database, SMTP and carrier connections are separate deployment checks.
