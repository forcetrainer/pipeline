# Feature Tracking

## Current Features

| Feature | Status | Version | Notes |
|---------|--------|---------|-------|
| Use Case Logger (CRUD) | Done | 0.0.1 | Submit, browse, filter, search use cases |
| Prompt Library (CRUD) | Done | 0.0.1 | Submit, browse, rate, copy prompts |
| Dashboard and Charts | Done | 0.1.0 | Metrics visualization, scoring system (S-D grades) |
| Backend API (Fastify + SQLite) | Done | 0.2.0 | Full REST API with 24 endpoints |
| JWT Auth + bcrypt | Done | 0.2.0 | Proper password security, 12-round bcrypt |
| Auth Strategy Pattern | Done | 0.2.0 | Pluggable auth via AuthStrategy interface |
| Frontend API Client | Done | 0.2.0 | Fetch wrapper with auth headers, error handling |
| Refresh Tokens | Done | 0.3.0 | httpOnly cookies, 7-day expiry, automatic rotation |
| Permission-based RBAC | Done | 0.3.0 | 16 granular permissions, role-to-permission mapping |
| SSO Stubs (Entra ID) | Done | 0.3.0 | AUTH_MODE env var, stub routes, SSOStrategy class |
| Repository Pattern | Done | 0.4.0 | DB-agnostic interfaces, factory functions |
| Docker Deployment | Done | 0.4.0 | Multi-stage Dockerfile, docker-compose with volumes |
| Migration Tooling | Done | 0.4.0 | drizzle-kit generate/migrate/studio |
| Admin Dashboard | Done | 0.3.0 | Pending reviews, denied items, user management pages |
| Approval Workflow | Done | 0.2.0 | draft/pending/approved/denied statuses with admin review |
| Prompt Rating | Done | 0.2.0 | Running average rating system (1-5 stars) |
| Fuzzy Search | Done | 0.0.1 | Fuse.js-powered search across use cases and prompts |

## In Progress

| Feature | Status | ADR | Notes |
|---------|--------|-----|-------|
| Use Case Cost Tracking | In Progress | [ADR-008](ADR/008-use-case-cost-tracking.md) | One-time + recurring costs, true ROI calculations, payback period |
| Prompt Library Social Features | Planned | [ADR-006](ADR/006-prompt-library-social-features.md) | Stars/favorites, comments, threaded conversations |
| Automation Readiness Assessment | Planned | [ADR-007](ADR/007-automation-readiness-assessment.md) | Guided self-assessment with 5 checkpoints, scoring, promote-to-use-case |

## Planned Features

| Feature | Status | Notes |
|---------|--------|-------|
| PostgreSQL Support | Planned | Repository pattern ready; implement Postgres repositories, switch via `DB_DRIVER` |
| Entra ID SSO | Planned | Strategy pattern + stubs in place; add `@azure/msal-node` |
| CI/CD Pipeline | Planned | Lint, test, build, deploy automation |
| Testing (Vitest) | Planned | Unit and integration test suite |
| Rate Limiting | Planned | Protect auth endpoints from brute force |
| Audit Logging | Planned | Track admin actions and data changes |
| File Attachments | Planned | Attach screenshots/docs to use cases |
| Export/Import | Planned | CSV/JSON export of use cases and prompts |
