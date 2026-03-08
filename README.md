# VitalCache Client (Next.js 14 + TS)

MVP client matching the VitalCache backend API.

## Quickstart

```bash
pnpm i
pnpm dev
```

Set API base in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Notes
- Access token is stored in memory (`tokenStore`), refresh cookie is HttpOnly on backend.
- 401 auto-refresh via Axios interceptor, then retries the original request.
- Protected routes live under `app/(protected)` and are gated by a client layout.
- UI components are minimal Tailwind stubs named like shadcn components. You can later replace them by running shadcn generator.
