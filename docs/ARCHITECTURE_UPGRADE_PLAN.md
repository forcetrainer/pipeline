# Architecture Upgrade Plan

## Overview

Migrate the ai-usecase-app from a client-side localStorage app to an enterprise-grade full-stack application with a real database, proper auth, and Docker deployment.

**Current State**: React 19 SPA using localStorage for all persistence. Auth is client-side with base64 passwords. Service layer (`storage.ts` → `*Service.ts` → pages) is well-structured for migration.

**Target State**: React SPA + Fastify API server + SQLite (dev) / PostgreSQL (prod) + JWT auth with SSO hooks + Docker deployment.

---

## Phase 1: Backend Foundation (No Frontend Changes)

**Goal**: Stand up the server with SQLite, API routes, and proper auth. Frontend stays on localStorage. Verify everything with curl before touching UI.

### 1.1 Project Scaffolding
- [ ] Create `server/` directory with its own `package.json`
  - Dependencies: fastify, better-sqlite3, drizzle-orm, bcrypt, jsonwebtoken, tsx
- [ ] Create `server/tsconfig.json` targeting Node with ESM
- [ ] Update root `package.json`:
  - Add `concurrently` as devDependency
  - `"dev"` → `concurrently "npm run dev:client" "npm run dev:server"`
  - `"dev:client": "vite"`
  - `"dev:server": "cd server && tsx watch src/index.ts"`
- [ ] Update `vite.config.ts` to proxy `/api` → `http://localhost:3001`
- [ ] Add `server/data/` and `*.db` to `.gitignore`

### 1.2 Database Layer
- [ ] Create `server/src/db/connection.ts`: singleton that opens `server/data/dev.db`, runs WAL mode
- [ ] Create `server/src/db/schema.ts`: Drizzle schema definitions for `users`, `use_cases`, `prompts`
  - Mirror existing TypeScript types from `src/types/index.ts`
  - TEXT for JSON arrays, TEXT for ISO dates, TEXT for UUIDs as primary keys
- [ ] Create `server/src/db/seed.ts`: port `src/data/seed.ts` with bcrypt-hashed passwords
  - Run only when tables are empty, use INSERT OR IGNORE for idempotency
- [ ] Create `server/src/db/migrations/` with `001_initial.sql`

### 1.3 Auth Infrastructure
- [ ] Create `server/src/services/authService.ts`:
  - `hashPassword(plain)` — bcrypt, cost factor 12
  - `verifyPassword(plain, hash)` — bcrypt.compare
  - `generateToken(user)` — JWT with `{ userId, email, role }`, 8hr expiry, `JWT_SECRET` env var
  - `verifyToken(token)` — returns decoded payload or throws
- [ ] Create `server/src/middleware/authenticate.ts`: extract Bearer token, verify JWT, attach `request.user`
- [ ] Create `server/src/middleware/authorize.ts`: `requireRole('admin')` factory
- [ ] Create `server/src/auth/strategies.ts`: `AuthStrategy` interface, `LocalStrategy` implementation
- [ ] Create `server/src/auth/sso.ts`: placeholder with documented Entra ID / MSAL integration points

### 1.4 API Routes
- [ ] `server/src/routes/auth.ts`:
  - `POST /api/auth/login` — validate credentials, return JWT + user (no password)
  - `POST /api/auth/logout` — client-side only for now
  - `GET /api/auth/me` — return current user from JWT
- [ ] `server/src/routes/useCases.ts`:
  - `GET /api/use-cases` — list all (query params for filters)
  - `GET /api/use-cases/:id` — get by ID
  - `POST /api/use-cases` — create (authenticated)
  - `PUT /api/use-cases/:id` — update (owner or admin)
  - `DELETE /api/use-cases/:id` — delete (admin only)
  - `PUT /api/use-cases/:id/review` — approve/deny (admin only)
- [ ] `server/src/routes/prompts.ts`:
  - Same CRUD pattern as use cases
  - `POST /api/prompts/:id/rate` — rate a prompt
- [ ] `server/src/routes/users.ts`:
  - `GET /api/users` — admin only
  - `POST /api/users` — admin only
  - `PUT /api/users/:id` — admin only
  - `DELETE /api/users/:id` — admin only
- [ ] `server/src/routes/aiReadiness.ts`:
  - `GET /api/ai-readiness/:useCaseId` — placeholder returning `{ status: 'not_implemented' }`

### 1.5 Server Entry Point
- [ ] Create `server/src/index.ts`: Fastify instance, CORS, register route plugins, start on port 3001
- [ ] Error handling middleware

### 1.6 Verification
- [ ] `npm run dev` starts both Vite (5173) and Fastify (3001)
- [ ] `curl http://localhost:3001/api/auth/login` responds
- [ ] SQLite file created and seeded
- [ ] Frontend still works on localStorage (unchanged)

---

## Phase 2: Frontend Migration

**Goal**: Swap localStorage for API calls. Service function signatures stay the same, just become async.

### 2.1 API Client
- [ ] Create `src/services/api.ts`:
  - Fetch wrapper: prepends `/api`, adds `Authorization: Bearer <token>`
  - Handles 401 by clearing token, redirecting to `/login`
  - Exports: `api.get<T>(path)`, `api.post<T>(path, body)`, `api.put<T>(path, body)`, `api.delete(path)`

### 2.2 Update AuthContext
- [ ] `login()` calls `api.post('/auth/login', { email, password })`
- [ ] Store JWT in localStorage under `ai-usecase-app:token`
- [ ] `getCurrentUser()` calls `api.get('/auth/me')` on mount
- [ ] `logout()` clears JWT
- [ ] `AuthContextType` interface stays identical — pages don't change

### 2.3 Migrate Services (one at a time)
- [ ] `useCaseService.ts`: replace `storage.*` calls with `api.*` calls
  - Keep `filterUseCases()` and `sortUseCases()` as client-side pure functions
  - Remove `isSeeded()` and `seedUseCases()` — seeding is server-side now
  - Functions return `Promise<T>` instead of `T`
- [ ] `promptService.ts`: same pattern
- [ ] `userService.ts`: same pattern

### 2.4 Update Page Components
- [ ] Add loading/error states to data-fetching pages
- [ ] Wrap service calls in `useEffect` with async patterns
- [ ] Update form submission handlers to `await`
- [ ] Key files: UseCasesPage, PromptsPage, NewUseCasePage, NewPromptPage, DashboardPage, MySubmissionsPage, all admin pages

### 2.5 Cleanup
- [ ] Remove seeding logic from `App.tsx`
- [ ] Delete `src/services/storage.ts`
- [ ] Remove seed version tracking

### 2.6 Verification
- [ ] Full app works end-to-end through the API
- [ ] No localStorage used for data (JWT token in localStorage is expected)
- [ ] All CRUD operations work: create, read, update, delete for use cases, prompts, users
- [ ] Auth flow works: login, logout, protected routes, admin routes

---

## Phase 3: Auth Hardening and RBAC

**Goal**: Production-grade auth with refresh tokens and SSO preparation.

### 3.1 Refresh Token Flow
- [ ] Add `refresh_tokens` table (token, userId, expiresAt, createdAt)
- [ ] `POST /api/auth/login` returns access token (15 min) + refresh token (7 days, httpOnly cookie)
- [ ] `POST /api/auth/refresh` issues new access token from valid refresh token
- [ ] Update `src/services/api.ts` to auto-retry on 401 via refresh endpoint

### 3.2 RBAC Expansion
- [ ] Define `Permission` type: `'use-cases:create' | 'use-cases:review' | 'users:manage'` etc.
- [ ] Create `rolePermissions` mapping in server code
- [ ] Update `authorize.ts` to check permissions, not just roles
- [ ] No UI changes required — existing admin/user distinction maps cleanly

### 3.3 SSO Preparation
- [ ] Flesh out `server/src/auth/sso.ts` with `SSOStrategy` class
- [ ] Add stub routes: `GET /api/auth/sso/login`, `GET /api/auth/sso/callback`
- [ ] Document Azure AD app registration requirements (tenant ID, client ID, redirect URI)
- [ ] Add `AUTH_MODE` env var (`local | sso | hybrid`) to `getStrategy()`

---

## Phase 4: Docker and PostgreSQL

**Goal**: Deployable in Docker with a clear path to PostgreSQL.

### 4.1 Repository Pattern
- [ ] Create `server/src/db/repositories/` with interfaces: `IUseCaseRepository`, `IPromptRepository`, `IUserRepository`
- [ ] Create SQLite implementations in `server/src/db/repositories/sqlite/`
- [ ] Service layer uses interfaces, not concrete implementations
- [ ] (Future) Create PostgreSQL implementations in `server/src/db/repositories/postgres/`

### 4.2 Dockerization
- [ ] `Dockerfile` for server (Node 20 Alpine)
- [ ] `docker-compose.yml`:
  - `app` service: Fastify server
  - `db` service: PostgreSQL 16 (used when `DB_DRIVER=postgres`)
  - `DB_DRIVER=sqlite|postgres` env var
- [ ] Serve built frontend via Fastify static file plugin (or separate `Dockerfile.frontend`)
- [ ] Add `docker:up` and `docker:down` scripts to root `package.json`

### 4.3 Migration Tooling
- [ ] Adopt migration tool compatible with both SQLite and PostgreSQL (drizzle-kit)
- [ ] Move from ad-hoc `CREATE TABLE IF NOT EXISTS` to versioned migrations
- [ ] Add `npm run migrate` script

---

## Phase 5: Documentation and AI Readiness

### 5.1 Documentation Structure
- [ ] `docs/ARCHITECTURE.md` — system overview, component diagram, data flow, deployment
- [ ] `docs/CHANGELOG.md` — Keep a Changelog format, backfill entries
- [ ] `docs/FEATURES.md` — feature tracking with status (planned / in-progress / done)
- [ ] `docs/ADR/` — Architecture Decision Records:
  - `001-server-directory-over-monorepo.md`
  - `002-fastify-over-express.md`
  - `003-sqlite-first-postgres-later.md`
  - `004-jwt-auth-with-sso-hooks.md`
  - `005-drizzle-over-prisma.md`

### 5.2 AI Readiness Check (Placeholder)
- [ ] Add `aiReadinessScore` field to `UseCase` type (optional)
- [ ] Implement `GET /api/ai-readiness/:useCaseId` with mock assessment based on existing fields
- [ ] Add disabled "Check AI Readiness" button on use case detail page
- [ ] Document intended scoring model in `docs/FEATURES.md`

---

## Risk Notes

- **Phase 2 is highest risk** — every page changes from sync to async data fetching. Mitigated by: keeping service signatures identical (just async), migrating one service at a time, verifying backend independently first.
- **Phase 1 has zero risk to existing app** — frontend is completely untouched.
- **Phase 4 can be deferred** — the app runs fine on SQLite for a long time. Docker/Postgres is for production deployment readiness.

## Key Files (Current)

| File | Role | What happens to it |
|---|---|---|
| `src/services/storage.ts` | localStorage CRUD wrapper | Deleted in Phase 2 |
| `src/types/index.ts` | All domain types | Extended, password removed from API responses |
| `src/services/authService.ts` | Client-side auth | Replaced with API calls in Phase 2 |
| `src/contexts/AuthContext.tsx` | React auth provider | Updated to use API in Phase 2 |
| `src/data/seed.ts` | Seed data | Ported to server in Phase 1, removed from frontend in Phase 2 |
| `vite.config.ts` | Build config | Proxy added in Phase 1 |
| `src/App.tsx` | Routing + seed init | Seed logic removed in Phase 2 |
