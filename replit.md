# Scholarship Finder

Scholarship Finder helps students discover, understand, save, and track scholarships matched to their profile.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/scholarship-finder/src/pages/scholarship-pages.tsx` — responsive product shell and student-facing routes
- `artifacts/scholarship-finder/src/index.css` — product theme, typography, and motion utilities
- `lib/api-spec/openapi.yaml` — source of truth for the scholarship, profile, recommendation, save, application, notification, and dashboard APIs
- `artifacts/api-server/src/routes/scholarships.ts` — demo-mode API data, matching logic, and stateful CRUD flows

## Architecture decisions

- The first version uses a clearly separated in-memory demo mode so the app works immediately without external services or API keys.
- Scholarship matching is rule-based and explainable; it returns reasons and missing requirements instead of guaranteeing eligibility.
- The frontend is generated from the shared OpenAPI contract and uses typed React Query hooks for all server-backed flows.

## Product

Students can browse and filter scholarships, see explainable match scores, edit an eligibility profile, save opportunities, track application status and notes, and mark deadline notifications as read.

## User preferences

The product should feel like a real educational platform rather than a generic admin dashboard.

## Gotchas

Demo scholarship records are intentionally labeled through their provider names and descriptions. External links are placeholders and must be verified before real-world use.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
