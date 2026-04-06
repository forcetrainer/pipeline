# Feature Tracking

## Current Features

| Feature | Status | Version | Notes |
|---------|--------|---------|-------|
| Use Case Logger (CRUD) | Done | 0.0.1 | Submit, browse, filter, search use cases |
| Prompt Library (CRUD) | Done | 0.0.1 | Submit, browse, rate, copy prompts |
| Dashboard and Charts | Done | 0.1.0 | Metrics visualization, scoring system (S-D grades) |
| Backend API (Fastify + SQLite) | Done | 0.2.0 | Full REST API with 24+ endpoints |
| JWT Auth + bcrypt | Done | 0.2.0 | Proper password security, 12-round bcrypt |
| Auth Strategy Pattern | Done | 0.2.0 | Pluggable auth via AuthStrategy interface |
| Frontend API Client | Done | 0.2.0 | Fetch wrapper with auth headers, error handling |
| Approval Workflow | Done | 0.2.0 | draft/pending/approved/denied statuses with admin review |
| Refresh Tokens | Done | 0.3.0 | httpOnly cookies, 7-day expiry, automatic rotation |
| Permission-based RBAC | Done | 0.3.0 | 16 granular permissions, role-to-permission mapping |
| SSO Stubs (Entra ID) | Done | 0.3.0 | AUTH_MODE env var, stub routes, SSOStrategy class |
| Admin Dashboard | Done | 0.3.0 | Pending reviews, denied items, user management pages |
| Repository Pattern | Done | 0.4.0 | DB-agnostic interfaces, factory functions |
| Docker Deployment | Done | 0.4.0 | Multi-stage Dockerfile, docker-compose with volumes |
| Migration Tooling | Done | 0.4.0 | drizzle-kit generate/migrate/studio |
| Use Case Cost Tracking & Revenue | Done | 0.5.0 | One-time + recurring costs, revenue per use, true ROI ([ADR-008](ADR/008-use-case-cost-tracking.md)) |
| Prompt Library Social Features | Done | 0.6.0 | Stars/favorites, comments with single-level threading ([ADR-006](ADR/006-prompt-library-social-features.md)) |
| Automation Readiness Assessment | Done | 0.7.0 | Guided 5-checkpoint wizard, scoring (S-D grades), promote-to-use-case ([ADR-007](ADR/007-automation-readiness-assessment.md)) |
| Use Case Editing | Done | 0.7.0 | Edit existing use cases (owner or admin), linked from detail page |
| Dev/Prod Docker Pipeline | Done | 0.8.0 | Separate containers, isolated DB volumes, backup sidecar, promote workflow |
| First-Time Setup Wizard | Done | 0.9.0 | Guided admin creation on first launch ([ADR-009](ADR/009-first-time-setup-wizard.md)) |
| User Registration & Account Lifecycle | Done | 0.9.0 | Self-registration, user status (active/pending/disabled) ([ADR-010](ADR/010-user-registration-account-lifecycle.md)) |
| Email Notification Service | Done | 0.9.0 | Console-based stubs for 13 notification types, swappable for SMTP ([ADR-011](ADR/011-email-notification-service.md)) |
| Fuzzy Search | Done | 0.0.1 | Fuse.js-powered search across use cases and prompts |
| Prompt Rating | Removed | — | Replaced by GitHub-style star/unstar in v0.6.0 |

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
