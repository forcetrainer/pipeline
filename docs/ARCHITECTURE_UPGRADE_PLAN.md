# Architecture Upgrade Plan

## Status: COMPLETE

All 5 phases completed on 2026-03-08. The app has been migrated from a client-side localStorage SPA to a full-stack enterprise application with Fastify backend, SQLite database, JWT auth with refresh tokens, permission-based RBAC, SSO hooks, Docker deployment, and comprehensive documentation.

---

## Overview

Migrate Pipeline (formerly ai-usecase-app) from a client-side localStorage app to an enterprise-grade full-stack application with a real database, proper auth, and Docker deployment.

**Original State**: React 19 SPA using localStorage for all persistence. Auth was client-side with base64 passwords.

**Final State**: React SPA + Fastify API server + SQLite (dev) / PostgreSQL (prod) + JWT auth with SSO hooks + Docker deployment.

---

## Phase 1: Backend Foundation (No Frontend Changes) ✓

**Goal**: Stand up the server with SQLite, API routes, and proper auth.

### 1.1 Project Scaffolding
- [x] Create `server/` directory with its own `package.json`
- [x] Create `server/tsconfig.json` targeting Node with ESM
- [x] Update root `package.json` with concurrently and dev scripts
- [x] Update `vite.config.ts` to proxy `/api` → `http://localhost:3001`
- [x] Add `server/data/` and `*.db` to `.gitignore`

### 1.2 Database Layer
- [x] Create `server/src/db/connection.ts`: SQLite singleton with WAL mode
- [x] Create `server/src/db/schema.ts`: Drizzle schema for users, use_cases, prompts
- [x] Create `server/src/db/seed.ts`: bcrypt-hashed seed data, idempotent
- [x] Create `server/src/db/index.ts`: Drizzle instance export

### 1.3 Auth Infrastructure
- [x] Create `server/src/services/authService.ts`: bcrypt + JWT
- [x] Create `server/src/middleware/authenticate.ts`: Bearer token verification
- [x] Create `server/src/middleware/authorize.ts`: `requireRole()` factory
- [x] Create `server/src/auth/strategies.ts`: AuthStrategy interface, LocalStrategy
- [x] Create `server/src/auth/sso.ts`: Entra ID placeholder

### 1.4 API Routes
- [x] `server/src/routes/auth.ts`: login, logout, me
- [x] `server/src/routes/useCases.ts`: full CRUD + filtering + review
- [x] `server/src/routes/prompts.ts`: full CRUD + rating
- [x] `server/src/routes/users.ts`: admin-only CRUD
- [x] `server/src/routes/aiReadiness.ts`: placeholder

### 1.5 Server Entry Point
- [x] Create `server/src/index.ts`: Fastify + CORS + route registration

### 1.6 Verification
- [x] `npm run dev` starts both Vite and Fastify
- [x] All API endpoints responding correctly
- [x] SQLite file created and seeded
- [x] Frontend unchanged and working

---

## Phase 2: Frontend Migration ✓

**Goal**: Swap localStorage for API calls.

### 2.1 API Client
- [x] Create `src/services/api.ts`: fetch wrapper with JWT management

### 2.2 Update AuthContext
- [x] Async login/logout/getCurrentUser via API
- [x] JWT token stored in localStorage
- [x] AuthContextType interface unchanged

### 2.3 Migrate Services
- [x] `useCaseService.ts`: API calls, kept filter/sort client-side
- [x] `promptService.ts`: API calls, kept filter/sort client-side
- [x] `userService.ts`: API calls

### 2.4 Update Page Components
- [x] All 13 pages updated with async data fetching, loading/error states

### 2.5 Cleanup
- [x] Removed seeding logic from `App.tsx`
- [x] Deleted `src/services/storage.ts`
- [x] Removed seed version tracking

### 2.6 Verification
- [x] Full app works end-to-end through the API
- [x] No localStorage used for data (only JWT token)
- [x] All CRUD operations verified
- [x] Auth flow verified

---

## Phase 3: Auth Hardening and RBAC ✓

**Goal**: Production-grade auth with refresh tokens and SSO preparation.

### 3.1 Refresh Token Flow
- [x] `refresh_tokens` table added
- [x] Short-lived access tokens (15 min) + refresh tokens (7 days, httpOnly cookie)
- [x] `POST /api/auth/refresh` with token rotation
- [x] Frontend auto-refresh on 401

### 3.2 RBAC Expansion
- [x] Permission type with granular permissions
- [x] `rolePermissions` mapping (user vs admin)
- [x] `requirePermission()` middleware
- [x] Routes updated to use permission-based auth

### 3.3 SSO Preparation
- [x] SSOStrategy class with stub methods
- [x] SSO stub routes: `/api/auth/sso/login`, `/api/auth/sso/callback`
- [x] `AUTH_MODE` env var (`local | sso | hybrid`)
- [x] `env.example` with documented config

---

## Phase 4: Docker and PostgreSQL ✓

**Goal**: Deployable in Docker with a clear path to PostgreSQL.

### 4.1 Repository Pattern
- [x] Repository interfaces: IUserRepository, IUseCaseRepository, IPromptRepository, IRefreshTokenRepository
- [x] SQLite implementations
- [x] Routes and services refactored to use repositories
- [x] Factory pattern ready for future PostgreSQL swap

### 4.2 Dockerization
- [x] Multi-stage Dockerfile (frontend build → server build → production)
- [x] `docker-compose.yml` with volume persistence
- [x] Production static file serving via @fastify/static with SPA fallback
- [x] `docker:build`, `docker:up`, `docker:down` scripts

### 4.3 Migration Tooling
- [x] drizzle-kit configured with `drizzle.config.ts`
- [x] Versioned migrations in `server/drizzle/`
- [x] `db:generate`, `db:migrate`, `db:studio` scripts

---

## Phase 5: Documentation and AI Readiness ✓

### 5.1 Documentation Structure
- [x] `docs/ARCHITECTURE.md` — full system overview
- [x] `docs/CHANGELOG.md` — Keep a Changelog format, all versions
- [x] `docs/FEATURES.md` — feature tracking with status
- [x] `docs/ADR/001-server-directory-over-monorepo.md`
- [x] `docs/ADR/002-fastify-over-express.md`
- [x] `docs/ADR/003-sqlite-first-postgres-later.md`
- [x] `docs/ADR/004-jwt-auth-with-sso-hooks.md`
- [x] `docs/ADR/005-drizzle-over-prisma.md`

### 5.2 AI Readiness Check (Placeholder)
- [x] `aiReadinessScore` field added to UseCase type and DB schema
- [x] `GET /api/ai-readiness/:useCaseId` returns mock assessment
- [x] Disabled "Check AI Readiness" button on use case detail page
- [x] Feature documented in `docs/FEATURES.md`
