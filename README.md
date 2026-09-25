# Courier Nepal frontend

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

Admin settings no longer pretend to persist unsupported configuration. Deployment settings are managed on the server. The user directory is read-only; account mutations remain available through the backend API. Online estimates require pricing rules. Password-reset email requires SMTP. External carriers and production services were not tested locally.

Legacy unused components retain image-optimization warnings; the legacy EditorJS component retains a hook-dependency warning. Lint has no errors. The rich-text image-upload tool is omitted because the backend has no upload endpoint.
