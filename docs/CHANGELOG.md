# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.4.0] - 2026-03-08

### Added
- Repository pattern abstracting database access (`IUserRepository`, `IUseCaseRepository`, `IPromptRepository`, `IRefreshTokenRepository`)
- Factory functions for repository instantiation (`getUserRepository()`, etc.)
- Dockerfile with multi-stage build (frontend-build, server-build, production)
- `docker-compose.yml` with volume persistence (`app-data`) and environment variable configuration
- Production static file serving via `@fastify/static` with SPA fallback
- Database migration tooling with `drizzle-kit` (`db:generate`, `db:migrate`, `db:studio`)
- `docker:build`, `docker:up`, `docker:down` npm scripts

## [0.3.0] - 2026-03-08

### Added
- Refresh token flow with httpOnly cookie, 7-day expiry, and automatic rotation on refresh
- Permission-based RBAC system (`Permission` type with 16 granular permissions)
- `rolePermissions` mapping for `user` and `admin` roles
- `requirePermission()` middleware for route-level authorization
- SSO stub routes (`GET /api/auth/sso/login`, `GET /api/auth/sso/callback`)
- `SSOStrategy` class with documented Entra ID OIDC flow and placeholder methods
- `AUTH_MODE` environment variable support (`local`, `sso`, `hybrid`)
- `env.example` with documented configuration variables

### Changed
- Access token expiry reduced from 8 hours to 15 minutes
- Frontend auto-refreshes tokens on 401 responses via API client interceptor

## [0.2.0] - 2026-03-08

### Added
- Fastify backend server (`server/`) with TypeScript and tsx hot-reload
- SQLite database via `better-sqlite3` with Drizzle ORM schema
- Database tables: `users`, `use_cases`, `prompts`
- JWT authentication with bcrypt password hashing (12 rounds)
- `AuthStrategy` interface with `LocalStrategy` implementation
- REST API endpoints: auth (login, me), use-cases (CRUD), prompts (CRUD + rate), users (CRUD), ai-readiness (stub)
- Frontend API client (`src/services/api.ts`) with Bearer token injection
- Vite proxy configuration for `/api` routes to port 3001
- Loading and error states on all data-fetching pages
- Database seeding on server startup
- `concurrently` for running client and server in parallel

### Changed
- Migrated all frontend services from localStorage to backend API calls
- Auth moved from client-side base64 sessions to JWT tokens

### Removed
- localStorage data persistence (`storage.ts`)
- Client-side seed logic in `App.tsx`

## [0.1.0] - 2026-03-08

### Added
- Metrics calculator with scoring system (S through D grades)
- Enhanced dashboard with charts and data visualizations (Recharts)
- Stats overview component with aggregate metrics

## [0.0.1] - 2026-03-08

### Added
- Initial React SPA with use case logger and prompt library
- Use case submission form with categories, departments, impact/effort ratings
- Prompt library with submission, browsing, rating, and copy-to-clipboard
- Dashboard page with basic statistics
- localStorage persistence for all data
- Basic authentication with base64 passwords
- Sidebar navigation with routing (React Router)
- Tailwind CSS styling with custom theme
- Fuzzy search via Fuse.js
