# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Removed
- Oregon Trail theme and theme switching system (ThemeContext, ThemeToggle, theme CSS)

## [0.9.0] - 2026-04-06

### Added
- First-time setup wizard: guided admin creation on first launch ([ADR-009](ADR/009-first-time-setup-wizard.md))
  - `GET /api/setup/status` and `POST /api/setup/init` endpoints
  - SetupPage guards all routes until first admin is created
  - Self-disabling after first user created
- User registration and account lifecycle ([ADR-010](ADR/010-user-registration-account-lifecycle.md))
  - `POST /api/auth/register` for self-registration
  - User status field (active, pending, disabled) with login enforcement
  - Admin can disable/re-enable accounts from user management
  - RegisterPage with registration form
- Email notification service ([ADR-011](ADR/011-email-notification-service.md))
  - `IEmailService` interface with `send(to, template, data)` method
  - ConsoleEmailService implementation (logs to server for development)
  - 13 notification templates covering auth, content review, comments, and assessments
  - Factory pattern for future SMTP swap

## [0.8.0] - 2026-03-22

### Added
- Dev/Prod Docker pipeline with separate containers and isolated database volumes
- Build, deploy, promote, backup, and status scripts (`scripts/`)
- Automated daily backup sidecar for production database
- Dev environment on port 3001, prod on port 3000

### Changed
- Docker Compose split into dev and prod configurations
- Separate JWT secrets per environment (`DEV_JWT_SECRET`, `PROD_JWT_SECRET`)

## [0.7.0] - 2026-03-15

### Added
- Automation Readiness Assessment with guided 5-checkpoint wizard ([ADR-007](ADR/007-automation-readiness-assessment.md))
  - Five checkpoints: Documentation & Measurement, Squint Check, Automation Switches, Pyramid Level, Risk & Governance
  - Self-reported scoring (1-5) with rubrics, overall S-D grade
  - Promote-to-use-case workflow with cost tracking integration
  - User-specific assessments (peers can't see), admin reporting
  - New tables: `assessments`, `assessment_checkpoints`
  - Full CRUD API: assessments routes with evaluate endpoint
- Use case editing: edit existing use cases (owner or admin), linked from detail page
- Assessment detail and evaluation pages

## [0.6.0] - 2026-03-12

### Added
- Prompt Library social features ([ADR-006](ADR/006-prompt-library-social-features.md))
  - GitHub-style star/unstar (replaces old 5-star rating)
  - Comments with single-level threading
  - New tables: `prompt_stars`, `prompt_comments`
  - New permissions: `prompts:star`, `prompts:comment`
  - Star and comment counts cached on prompts table

### Removed
- 5-star rating system on prompts (replaced by star/unstar)

## [0.5.0] - 2026-03-10

### Added
- Use case cost tracking and revenue ([ADR-008](ADR/008-use-case-cost-tracking.md))
  - One-time costs (build, licensing) and recurring costs (licensing, compute, maintenance)
  - Revenue per use field with daily/weekly/monthly/annual projections
  - CostTracker component: collapsible form with dollar inputs
  - CostAndROIPanel: detail page panel showing costs, net value, payback, ROI %
  - True ROI: Net Annual Value = (savings + revenue) - costs
  - `actualCosts` (JSON) and `assessmentId` (FK) fields on use_cases table
- MetricsCalculator 3-column "Per-Use Value" layout (time saved, money saved, revenue generated)
- `formatTime` smart scaling (commas at 1K+, `K hrs` at 10K+)

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
- Admin dashboard with pending reviews, denied items, user management pages

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
- Approval workflow with draft/pending/approved/denied statuses and admin review

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
