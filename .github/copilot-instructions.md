# Copilot instructions — MoonGazers

This file gives targeted, actionable guidance for AI coding agents working in this repository.

1) Big picture
- Next.js 15 App Router app with two concerns: public forecast UI and an Admin CMS at `/admin`.
- Forecast pipeline lives in `src/app/api/best-windows/route.ts` (geocode → weather → sky → scoring). Key data: `data/bright_stars.csv` and Astronomy Engine.

2) Where to make feature edits
- Public UI: `src/app/page.tsx`, `src/components/InlineResults.tsx`, `src/components/CurrentWeather.tsx`.
- Admin UI: `src/app/admin/page.tsx` + `src/components/AdminDashboard.tsx` (markdown editor dynamically imported).
- Server logic: `src/app/api/*` (public vs `src/app/api/admin/*` for authenticated admin endpoints).

3) Authentication & admin flows to respect
- Admin login endpoint: `src/app/api/admin/auth/route.ts`. On success it returns `token: process.env.ADMIN_SECRET`.
- Admin APIs validate by comparing client token to `process.env.ADMIN_SECRET` (set in Vercel or local `.env`).
- Admin users are stored in `users` table (see `prisma/schema.prisma`). Admin users are created via direct SQL in Neon (no runtime scripts).

4) Build / dev / deploy specifics (exact commands)
- Local dev (fast): `npm run dev` (uses Turbopack in package.json).
- Production build: `npm run build` (run with Turbopack). Recommended Vercel build command when using Prisma migrations:
  - `npx prisma migrate deploy && npm run build`
- Prisma: generate & migrations
  - Inspect `prisma/schema.prisma` and run `npx prisma migrate dev` locally during development.
  - For production, run `npx prisma migrate deploy` against the Neon DB before deploying or make it part of the Vercel build command.

5) Environment variables required (set in Vercel)
- `DATABASE_URL`, `ADMIN_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `ASTROSPHERIC_KEY`, `TIMEZONEDB_KEY`, `NEXT_PUBLIC_BASE_URL`.

6) Project conventions & important patterns
- Use TailwindCSS v4 and minimal white theme. Keep styles inline for a few components (consistent with existing code).
- Dynamic import for heavy client-only libraries: Admin markdown editor uses `dynamic(..., { ssr: false })` in `AdminDashboard.tsx`.
- API caching: `unstable_cache` used in `best-windows` route. Keep cache timeoffs when editing forecasting logic.
- Passwords: Prisma `User.password` may be plain or bcrypt hash; `auth/route.ts` checks both formats.

7) Quick code examples
- Return an admin token (auth route): `return NextResponse.json({ success: true, token: process.env.ADMIN_SECRET, user: { id: user.id } })`.
- POST to best-windows: client sends `{ location, country }` to `/api/best-windows`.

8) Testing & debugging tips
- If you see `relation "users" does not exist`, run Prisma migrations against Neon: `npx prisma migrate deploy`.
- For connection issues, verify `DATABASE_URL` and use `npx prisma studio` to inspect data.

9) When in doubt
- Read `prisma/schema.prisma` for the data shape.
- Check `src/app/api` routes for server-side entry points.

If any section is unclear or you want the agent to enforce extra rules (lint, arrange tests, or auto-run migrations), tell me which rules to add and I will merge them into this file.
