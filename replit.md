# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

### `artifacts/usale-homepage` (`@workspace/usale-homepage`)

React + Vite single-page recreation of the USale.com homepage. Served at `/` (root). All images are stored in `src/assets/` and imported as ES module assets.

Sections:
- Sticky nav with transparent→white scroll transition, "Who We Serve" hover dropdown
- Hero section with SOLD-sign background image, headline, subheading, and two CTA buttons
- Join Wait List form section (id="join-wait-list") with all 7 fields
- Marketplace cards section (Investors, Agents, Strategic Partners) using avif images
- Spotlight section (Jessica Nieto, eXp Realty)
- Industry Partners section (Kiavi, Stewart, eXp Realty)
- Footer with copyright, links

Brand colors: orange `#E8571A`, dark blue `#2C3E50`

Additional routes:
- `/broker/:slug` — Broker Presentation page (11-slide sales deck with demo data, keyboard nav, script panel, progress dots). Now dynamically loads contact name/company from the database if a matching slug exists; falls back to hardcoded Bondilyn/bCollective Agency data otherwise.
- `/admin` — Password-protected admin dashboard (password: `winwin`). Features: contact management with category-based link generation, bulk CSV upload, tracking stats, contacts table with status/progress/survey data.
- `/agent/:slug`, `/title/:slug`, `/escrow/:slug`, `/hard-money/:slug`, `/technology-partner/:slug`, `/service-provider/:slug` — Coming Soon placeholder pages for future category-specific presentations. Still records a "view" tracking event when accessed.

Database Schema (lib/db/src/schema/index.ts):
- `contacts` table — id, first_name, last_name, email, company, phone, category, slug (unique), created_at
- `presentation_events` table — id, contact_id (FK to contacts), event_type, slide_index, duration, metadata (jsonb), created_at

AI Conversation Features (integrated into Broker Presentation):
- **Audio On/Off** button triggers ElevenLabs TTS narration of the current slide's script
- **Ask AI** chat panel slides in from right, connects to ChatGPT for contextual Q&A about broker data
- **Voice input** via microphone button uses Whisper STT → ChatGPT
- **Realtime API** WebSocket proxy at `/api/ai/realtime/ws` for live bidirectional voice conversations via OpenAI Realtime API
- **Live Voice** button in top nav connects to WebSocket, streams PCM16 audio bidirectionally for real-time conversational AI

API Endpoints (Express server at `/api`):
- `POST /api/ai/chat` — ChatGPT text conversation with broker context
- `POST /api/ai/tts` — ElevenLabs text-to-speech (returns audio/mpeg stream)
- `POST /api/ai/stt` — Whisper speech-to-text (accepts multipart audio upload)
- `GET /api/ai/realtime/session` — Creates OpenAI Realtime API session token
- `WS /api/ai/realtime/ws` — WebSocket proxy to OpenAI Realtime API (bidirectional audio relay, server-side VAD)
- `POST /api/admin/verify` — Password verification for admin dashboard
- `GET /api/admin/contacts` — List all contacts
- `POST /api/admin/contacts` — Create a new contact (generates unique slug)
- `POST /api/admin/contacts/bulk` — Bulk create contacts from CSV upload
- `DELETE /api/admin/contacts/:id` — Delete a contact and its events
- `GET /api/contacts/by-slug/:slug` — Look up a contact by slug (used by presentation pages)
- `POST /api/tracking/event` — Record a presentation tracking event (view, slide_change, heartbeat, complete, survey)
- `GET /api/admin/stats` — Aggregate dashboard stats (total, viewed, completed, surveyed, avgTime, avgSlides)
- `GET /api/admin/contacts/:id/summary` — Per-contact tracking summary
- `GET /api/admin/contacts/:id/events` — Full event history for a contact

Required secrets: `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`
