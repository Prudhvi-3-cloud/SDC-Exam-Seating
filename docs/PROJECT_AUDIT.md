# Project Audit – SDC-Exam-Seating
## 1. Quick Summary (5–10 bullets)
- Single Next.js App Router app that bundles a public college marketing SPA and an admin exam-seating tool in the same codebase. Evidence: src/app/page.tsx, src/app/admin/page.tsx
- Backend uses Next.js route handlers under `src/app/api` with Prisma + Postgres for data persistence. Evidence: src/app/api/*, prisma/schema.prisma
- Admin authentication is client-side only (localStorage + hardcoded credentials), no server-side auth. Evidence: src/app/admin/login/page.tsx, src/app/admin/page.tsx
- Seating plan generation is deterministic per plan using seeded shuffles + round-robin interleaving, with capacity checks. Evidence: src/lib/seating.ts
- Outbox emails are stored as DB rows only (dry run). Evidence: src/app/api/plans/[planId]/outbox/route.ts, prisma/schema.prisma
- Root route is a client-side “page switcher” (home/about/departments/admissions/login) instead of true routes. Evidence: src/app/page.tsx
- Tailwind v4 utilities + custom CSS coexist; admin UI mainly uses custom CSS, public site uses Tailwind classes. Evidence: src/styles/tailwind.css, src/app/globals.css, src/app/components/*.tsx
- Prisma schema defines Students/Rooms/Sessions/Plans/Assignments/OutboxEmail with migrations and seed data. Evidence: prisma/schema.prisma, prisma/migrations/*, prisma/seed.ts

## 2. Tech Stack
- Framework: Next.js (App Router). Evidence: package.json, src/app/*
- Language: TypeScript + React. Evidence: package.json, tsconfig.json, src/**/*.tsx
- Styling: Tailwind CSS v4 + custom CSS. Evidence: package.json, postcss.config.mjs, src/styles/tailwind.css, src/app/globals.css
- UI libraries: lucide-react (icons), clsx (utility). Evidence: package.json
- Forms/validation: Zod on API inputs. Evidence: src/app/api/**/route.ts
- State management: React useState/useEffect only (no external store). Evidence: src/app/**/*.tsx
- Backend/API approach: Next.js route handlers in App Router. Evidence: src/app/api/**/route.ts
- DB/ORM: Prisma + PostgreSQL. Evidence: prisma/schema.prisma, src/lib/db.ts
- Email/PDF libs: Not found in repo. Evidence: package.json
- Tooling (lint, format, test, build): ESLint config, Next build scripts; no test runner configured. Evidence: package.json, eslint.config.mjs

| Tech | Evidence (file paths) |
| --- | --- |
| Next.js App Router | package.json, src/app/layout.tsx, src/app/page.tsx |
| React 19 + TypeScript | package.json, tsconfig.json, src/**/*.tsx |
| Tailwind CSS v4 | package.json, postcss.config.mjs, src/styles/tailwind.css |
| Custom CSS | src/app/globals.css, src/styles/theme.css |
| Prisma + Postgres | prisma/schema.prisma, src/lib/db.ts |
| Zod validation | src/app/api/sessions/route.ts, src/app/api/sessions/[id]/generate/route.ts |
| Icons (lucide-react) | src/app/components/*.tsx, src/app/admin/login/page.tsx |

## 3. Folder Structure
Top-level tree (2–3 levels):
```
.
+-- prisma/
¦   +-- migrations/
¦   +-- schema.prisma
¦   +-- seed.ts
+-- public/
+-- src/
¦   +-- app/
¦   ¦   +-- admin/
¦   ¦   +-- api/
¦   ¦   +-- components/
¦   ¦   +-- globals.css
¦   ¦   +-- layout.tsx
¦   ¦   +-- page.tsx
¦   +-- components/
¦   +-- lib/
¦   +-- styles/
+-- package.json
+-- next.config.ts
+-- README.md
```

Key folders/files and purpose:
- `src/app` holds Next.js App Router pages, layouts, and route handlers. Evidence: src/app/layout.tsx, src/app/page.tsx, src/app/admin/*, src/app/api/*
- `src/app/admin` contains the admin workflow screens (create session, manage session, view plan, print). Evidence: src/app/admin/page.tsx, src/app/admin/session/[id]/page.tsx, src/app/admin/plan/[planId]/page.tsx
- `src/app/api` implements backend endpoints for sessions, students, rooms, plans, outbox. Evidence: src/app/api/**/route.ts
- `src/app/components` contains public marketing site sections and helpers (home/about/admissions/departments/login). Evidence: src/app/components/*.tsx
- `src/components` hosts shared shell for the admin UI. Evidence: src/components/SritShell.tsx
- `src/lib` contains Prisma client singleton and seating generation logic. Evidence: src/lib/db.ts, src/lib/seating.ts
- `src/styles` includes Tailwind v4 setup and theme variables. Evidence: src/styles/tailwind.css, src/styles/theme.css
- `prisma` defines DB schema, migrations, and seed script. Evidence: prisma/schema.prisma, prisma/migrations/*, prisma/seed.ts

## 4. Routes / Pages / Screens

Public site (single-page “tabs”):
| Route | Purpose | Key components | Data source/API | Mobile status | Evidence paths |
| --- | --- | --- | --- | --- | --- |
| `/` | Client-side SPA switching between home/about/departments/admissions/login. | Header, Footer, HomePage, AboutPage, DepartmentsPage, AdmissionsPage, LoginPage | None (static content) | Tailwind responsive grids; header nav lacks mobile menu (risk). | src/app/page.tsx, src/app/components/*.tsx |
| `#home/#about/#departments/#admissions/#login` | In-page state switches (not real routes). | Same as above | None | Works for listed anchors; other header anchors are blocked. | src/app/page.tsx |

Admin app (real routes):
| Route | Purpose | Key components | Data source/API | Mobile status | Evidence paths |
| --- | --- | --- | --- | --- | --- |
| `/admin` | Create an exam session (exam type, days). | SritShell | POST `/api/sessions` | Custom CSS with some mobile breakpoint; layout grid stacks at 768px. | src/app/admin/page.tsx, src/app/globals.css |
| `/admin/login` | Client-side admin login (hardcoded credentials). | Login form | None | Tailwind classes; likely responsive. | src/app/admin/login/page.tsx |
| `/admin/session/[id]` | 3-step workflow: select students, select rooms, generate plans. | SritShell, selection lists | GET `/api/sessions/[id]`, `/api/students`, `/api/rooms`, `/api/plans`; POST `/api/sessions/[id]/students`, `/api/sessions/[id]/rooms`, `/api/sessions/[id]/generate` | Sidebar collapses at 768px; lists use fixed max-height, tables absent. | src/app/admin/session/[id]/page.tsx, src/app/globals.css |
| `/admin/plan/[planId]` | View seating grid, create outbox emails, filter outbox, print link. | SritShell | GET `/api/plans/[planId]`, `/api/plans/[planId]/outbox`; POST `/api/plans/[planId]/outbox` | Seating tables likely overflow on small screens. | src/app/admin/plan/[planId]/page.tsx, src/app/globals.css |
| `/admin/plan/[planId]/print` | Print-friendly room sheets. | Print layout | GET `/api/plans/[planId]` | Print-only; minimal responsiveness. | src/app/admin/plan/[planId]/print/page.tsx, src/app/globals.css |

API routes:
- `POST /api/sessions` create session. Evidence: src/app/api/sessions/route.ts
- `GET /api/sessions/[id]` session summary + selected IDs. Evidence: src/app/api/sessions/[id]/route.ts
- `POST /api/sessions/[id]/students` save selected students. Evidence: src/app/api/sessions/[id]/students/route.ts
- `POST /api/sessions/[id]/rooms` save selected rooms. Evidence: src/app/api/sessions/[id]/rooms/route.ts
- `POST /api/sessions/[id]/generate` generate plans. Evidence: src/app/api/sessions/[id]/generate/route.ts
- `GET /api/students` list/filter students. Evidence: src/app/api/students/route.ts
- `GET /api/rooms` list active rooms. Evidence: src/app/api/rooms/route.ts
- `GET /api/plans` list plans for session. Evidence: src/app/api/plans/route.ts
- `GET /api/plans/[planId]` plan + room assignments. Evidence: src/app/api/plans/[planId]/route.ts
- `GET/POST /api/plans/[planId]/outbox` outbox create/list. Evidence: src/app/api/plans/[planId]/outbox/route.ts

## 5. Implemented Functionality
Seating generation:
- How it works: loads session, students, rooms; checks capacity; groups by year+dept; seeded shuffle per group; interleaves round-robin; assigns seats by room/bench/seat. Evidence: src/lib/seating.ts
- Where in code: generation API triggers `generatePlan`. Evidence: src/app/api/sessions/[id]/generate/route.ts, src/lib/seating.ts
- Known limitations: regenerating the same day/version will fail due to unique constraint (no cleanup). Evidence: prisma/schema.prisma (unique on sessionId/dayIndex/version), src/app/api/sessions/[id]/generate/route.ts

Student dataset handling:
- How it works: list/filter students by dept/year; select and save for session via join table. Evidence: src/app/api/students/route.ts, src/app/api/sessions/[id]/students/route.ts, src/app/admin/session/[id]/page.tsx
- Known limitations: no pagination; all matching rows loaded into client list. Evidence: src/app/admin/session/[id]/page.tsx

Class/room layout rendering:
- How it works: seating plan API groups assignments by room; UI renders bench rows and seat columns. Evidence: src/app/api/plans/[planId]/route.ts, src/app/admin/plan/[planId]/page.tsx
- Known limitations: large tables can overflow on small screens; no horizontal scroll wrapper. Evidence: src/app/admin/plan/[planId]/page.tsx, src/app/globals.css

Admin tooling:
- How it works: create session, pick students/rooms, generate plans, view plan, print. Evidence: src/app/admin/page.tsx, src/app/admin/session/[id]/page.tsx, src/app/admin/plan/[planId]/page.tsx
- Known limitations: client-only auth, no roles or server checks. Evidence: src/app/admin/login/page.tsx, src/app/admin/page.tsx

Email sending:
- How it works: creates OutboxEmail rows per assignment (dry run). Evidence: src/app/api/plans/[planId]/outbox/route.ts, prisma/schema.prisma
- Known limitations: no real email service integration. Evidence: README.md, src/app/api/plans/[planId]/outbox/route.ts

PDF export:
- How it works: print-friendly HTML page. Evidence: src/app/admin/plan/[planId]/print/page.tsx
- Known limitations: not true PDF generation. Evidence: README.md

## 6. Database & Data Flow
- DB used or mock strategy: PostgreSQL via Prisma (no mocks). Evidence: prisma/schema.prisma, src/lib/db.ts
- Connection/config location: `DATABASE_URL` env var in Prisma datasource; Prisma client singleton in `src/lib/db.ts`. Evidence: prisma/schema.prisma, src/lib/db.ts
- Schema/models (table/collection + fields):
  - Student(id, rollNo, name, dept, year, email, createdAt). Evidence: prisma/schema.prisma
  - Room(id, block, roomNo, benches, seatsPerBench, isActive, createdAt). Evidence: prisma/schema.prisma
  - ExamSession(id, examType, daysCount, createdAt). Evidence: prisma/schema.prisma
  - SessionStudent(id, sessionId, studentId). Evidence: prisma/schema.prisma
  - SessionRoom(id, sessionId, roomId). Evidence: prisma/schema.prisma
  - SeatingPlan(id, sessionId, dayIndex, version, seed, createdAt). Evidence: prisma/schema.prisma
  - SeatingAssignment(id, planId, studentId, roomId, benchNo, seatNo). Evidence: prisma/schema.prisma
  - OutboxEmail(id, planId, studentId, toEmail, subject, body, createdAt). Evidence: prisma/schema.prisma
- CRUD paths (UI ? API ? DB):
  - Create session: `/admin` form ? POST `/api/sessions` ? `prisma.examSession.create`. Evidence: src/app/admin/page.tsx, src/app/api/sessions/route.ts
  - Select students: `/admin/session/[id]` ? POST `/api/sessions/[id]/students` ? `sessionStudent` upsert via delete+createMany. Evidence: src/app/admin/session/[id]/page.tsx, src/app/api/sessions/[id]/students/route.ts
  - Select rooms: `/admin/session/[id]` ? POST `/api/sessions/[id]/rooms` ? `sessionRoom` delete+createMany. Evidence: src/app/admin/session/[id]/page.tsx, src/app/api/sessions/[id]/rooms/route.ts
  - Generate plans: `/admin/session/[id]` ? POST `/api/sessions/[id]/generate` ? `generatePlan` writes `SeatingPlan` + `SeatingAssignment`. Evidence: src/app/api/sessions/[id]/generate/route.ts, src/lib/seating.ts
  - Outbox: `/admin/plan/[planId]` ? POST `/api/plans/[planId]/outbox` ? `outboxEmail.createMany`. Evidence: src/app/admin/plan/[planId]/page.tsx, src/app/api/plans/[planId]/outbox/route.ts

## 7. Mobile Responsiveness Review
What works well:
- Public marketing sections use responsive Tailwind grids (`md:grid-cols-*`, `lg:grid-cols-*`). Evidence: src/app/components/*.tsx
- Admin layout collapses from two columns to one at <=768px. Evidence: src/app/globals.css

What breaks / risks:
- Admin seating tables are wide and not wrapped in horizontal scroll containers, likely overflowing on phones. Evidence: src/app/admin/plan/[planId]/page.tsx, src/app/globals.css
- Public header has many nav links with no mobile menu; likely wraps/overflows on small screens. Evidence: src/app/components/header.tsx
- SPA navigation intercepts all `#` links; links like `#academics` or `#placements` are prevented but not handled. Evidence: src/app/page.tsx, src/app/components/header.tsx

Quick fixes (code-level suggestions):
- Wrap plan tables in `overflow-x-auto` containers or add `.plan-grid { overflow-x: auto; }`. Evidence: src/app/admin/plan/[planId]/page.tsx, src/app/globals.css
- Add a mobile nav drawer or collapse nav links below `md`. Evidence: src/app/components/header.tsx
- Only prevent default for known anchors or add sections for remaining anchors. Evidence: src/app/page.tsx

## 8. Potential Errors / Bugs / Risks
Build/runtime risks:
- Mixed font systems: `next/font` variables plus global `body` font override in `fonts.css` may lead to inconsistent typography. Evidence: src/app/layout.tsx, src/styles/fonts.css
- Client pages use `use(params)` with `params: Promise<...>`; if params is not a promise in this Next version, runtime may break. Evidence: src/app/admin/session/[id]/page.tsx, src/app/admin/plan/[planId]/page.tsx, src/app/admin/plan/[planId]/print/page.tsx
- Missing `/srit-logo.png` in `public` causes broken image. Evidence: src/components/SritShell.tsx, public/*

Env/config risks:
- `DATABASE_URL` is required but no `.env.example` is present. Evidence: prisma/schema.prisma, README.md

Security risks:
- Hardcoded admin credentials in client code; anyone can see them and bypass login. Evidence: src/app/admin/login/page.tsx
- Auth is only client-side localStorage with no API protection; API routes are open. Evidence: src/app/admin/page.tsx, src/app/api/**/route.ts

UX/accessibility risks:
- SPA anchor handling blocks unknown anchors, so many header/footer links do nothing. Evidence: src/app/page.tsx, src/app/components/header.tsx, src/app/components/footer.tsx
- Encoding artifacts ("Ã—", "â‚¹", "â†’") may display incorrectly in UI. Evidence: src/app/admin/session/[id]/page.tsx, src/app/components/home-page.tsx, src/app/components/departments-page.tsx

Performance risks:
- Student list renders all matching rows with no pagination/virtualization. Evidence: src/app/admin/session/[id]/page.tsx

## 9. How to Run Locally
Prereqs:
- Node.js + npm (version not specified). Evidence: README.md
- PostgreSQL database accessible via `DATABASE_URL`. Evidence: README.md, prisma/schema.prisma

Install:
- `npm install`. Evidence: README.md

Database setup:
- Create `.env` with `DATABASE_URL`. Evidence: README.md
- Run `npx prisma migrate dev --name init` and `npx prisma db seed`. Evidence: README.md, prisma/seed.ts

Run:
- `npm run dev` for development. Evidence: package.json, README.md
- `npm run build` / `npm run start` for production build and start. Evidence: package.json

Env vars needed:
- `DATABASE_URL` (Postgres). Evidence: prisma/schema.prisma, README.md

Common issues and fixes:
- If build fails with missing DB, set `DATABASE_URL` and run migrations. Evidence: prisma/schema.prisma, README.md

## 10. Next Steps (Prioritized)
- P0: Replace client-only admin auth with server-side auth + API protection. Evidence: src/app/admin/login/page.tsx, src/app/api/**/route.ts
- P0: Remove hardcoded admin credentials; move to secure auth flow. Evidence: src/app/admin/login/page.tsx
- P0: Add `.env.example` with required `DATABASE_URL`. Evidence: prisma/schema.prisma, README.md
- P1: Add duplicate-plan handling or cleanup when regenerating plans. Evidence: src/app/api/sessions/[id]/generate/route.ts, prisma/schema.prisma
- P1: Add pagination or search for students list. Evidence: src/app/admin/session/[id]/page.tsx
- P1: Make plan tables horizontally scrollable on mobile. Evidence: src/app/admin/plan/[planId]/page.tsx, src/app/globals.css
- P1: Fix SPA anchor handling to avoid broken links. Evidence: src/app/page.tsx, src/app/components/header.tsx
- P1: Add actual email sending integration or explicit "dry run" UI copy. Evidence: src/app/api/plans/[planId]/outbox/route.ts, README.md
- P1: Add missing public assets (e.g., `/srit-logo.png`) or remove from UI. Evidence: src/components/SritShell.tsx
- P2: Align typography (remove conflicting `fonts.css` or use Next fonts consistently). Evidence: src/styles/fonts.css, src/app/layout.tsx
- P2: Add API input validation error details to UI. Evidence: src/app/admin/**/*.tsx, src/app/api/_shared.ts
- P2: Add tests (not configured). Evidence: package.json
- P2: Add production deploy guidance for migrations/seed as scripts. Evidence: package.json, README.md
- P2: Consider splitting public marketing pages into real routes or actual sections for anchors. Evidence: src/app/page.tsx

## 11. AI Extension Guidelines
- Stable architecture decisions (DO NOT CHANGE):
  - Keep Next.js App Router structure under `src/app`. Evidence: src/app/layout.tsx
  - Keep Prisma as the DB layer with schema in `prisma/schema.prisma`. Evidence: prisma/schema.prisma
  - Keep seating generation logic centralized in `src/lib/seating.ts`. Evidence: src/lib/seating.ts

- Extension points (SAFE TO ADD NEW CODE HERE):
  - New admin pages in `src/app/admin/*` (App Router segments). Evidence: src/app/admin/*
  - New API routes in `src/app/api/*` using Next.js route handlers. Evidence: src/app/api/*
  - Shared UI for admin in `src/components` (e.g., extend `SritShell`). Evidence: src/components/SritShell.tsx
  - Public marketing sections in `src/app/components`. Evidence: src/app/components/*

- Patterns to follow:
  - Use `prisma` from `src/lib/db.ts` for DB access and wrap multi-step writes in transactions. Evidence: src/lib/db.ts, src/lib/seating.ts
  - Validate API inputs with Zod and return JSON errors via `jsonError`. Evidence: src/app/api/_shared.ts, src/app/api/sessions/route.ts
  - Keep admin workflow fetches in client components and call API routes. Evidence: src/app/admin/session/[id]/page.tsx

- When adding new pages, place them in:
  - `src/app` for real routes, or `src/app/components` for SPA sections on `/`. Evidence: src/app/page.tsx, src/app/components/*

- When adding new features, follow this pattern:
  - UI -> `fetch()` to `/api/...` -> Prisma operations in route handlers, with Zod validation. Evidence: src/app/admin/**/*.tsx, src/app/api/**/*.ts

- Avoid modifying:
  - `prisma/schema.prisma` without coordinated migrations. Evidence: prisma/schema.prisma, prisma/migrations/*
  - `src/lib/seating.ts` without validating plan generation logic changes. Evidence: src/lib/seating.ts

- Preferred way to add API / DB logic:
  - Create a new route under `src/app/api/<name>/route.ts`, validate inputs with Zod, and use `prisma` from `src/lib/db.ts`. Evidence: src/app/api/*, src/lib/db.ts
