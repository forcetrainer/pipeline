# Architecture Overview

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.2 |
| Build tool | Vite | 7.x |
| Styling | Tailwind CSS | 4.x |
| Backend | Fastify | 5.x |
| Database | SQLite | via better-sqlite3 |
| ORM | Drizzle ORM | 0.38.x |
| Auth | jsonwebtoken + bcryptjs | JWT RS256 |
| Charts | Recharts | 3.x |
| Search | Fuse.js | 7.x |
| Icons | Lucide React | 0.563.x |

## Project Structure

```
ai-usecase-app/
  src/                      # Frontend (React SPA)
    components/
      auth/                 # ProtectedRoute, AdminRoute
      dashboard/            # StatsOverview, Charts
      layout/               # AppLayout, Sidebar
      prompts/              # PromptCard, PromptList, PromptForm
      ui/                   # Button, Card, Input, Modal, etc.
      use-cases/            # UseCaseCard, UseCaseList, UseCaseForm, MetricsCalculator
    contexts/
      AuthContext.tsx        # React context for JWT auth state
    pages/
      admin/                # AdminDashboardPage, UserManagementPage, PendingReviewsPage, DeniedItemsPage
      DashboardPage.tsx
      LoginPage.tsx
      UseCasesPage.tsx, NewUseCasePage.tsx, UseCaseDetailPage.tsx
      PromptsPage.tsx, NewPromptPage.tsx, PromptDetailPage.tsx
      MySubmissionsPage.tsx
    services/
      api.ts                # Fetch wrapper with auth headers and token refresh
      authService.ts        # Login/logout/register client calls
      useCaseService.ts     # Use case CRUD client calls
      promptService.ts      # Prompt CRUD client calls
      userService.ts        # User management client calls
    hooks/
      useSearch.ts          # Fuse.js search hook
    utils/
      metricsCalculator.ts  # Scoring system (S-D grades)
    types/index.ts          # Shared TypeScript types
    App.tsx                 # Router and layout
    main.tsx                # Entry point
  server/                   # Backend (Fastify + SQLite)
    src/
      auth/
        permissions.ts      # Permission type, rolePermissions map, hasPermission()
        strategies.ts       # AuthStrategy interface, LocalStrategy, getStrategy()
        sso.ts              # SSOStrategy stub, Entra ID integration docs
      db/
        schema.ts           # Drizzle table definitions (users, use_cases, prompts, refresh_tokens)
        connection.ts       # better-sqlite3 connection setup
        index.ts            # Drizzle instance export
        seed.ts             # Database seeding on startup
        repositories/
          interfaces.ts     # IUserRepository, IUseCaseRepository, IPromptRepository, IRefreshTokenRepository
          sqlite.ts         # SQLite implementations
          index.ts          # Factory functions (getUserRepository, etc.)
      middleware/
        authenticate.ts     # JWT Bearer token validation
        authorize.ts        # requireRole(), requirePermission() middleware
      routes/
        auth.ts             # Login, logout, refresh, me, SSO stubs
        useCases.ts         # Use case CRUD + review
        prompts.ts          # Prompt CRUD + review + rate
        users.ts            # User management (admin)
        aiReadiness.ts      # AI readiness stub endpoint
      services/
        authService.ts      # hashPassword, verifyPassword, generateToken, refresh token management
      index.ts              # Fastify server setup and startup
  docs/                     # Project documentation
  Dockerfile                # Multi-stage production build
  docker-compose.yml        # Docker Compose with volume persistence
  vite.config.ts            # Vite config with /api proxy
  package.json              # Root package (frontend + dev scripts)
```

## Data Flow

```
Browser (React SPA)
    |
    v
Vite Dev Server (port 5173)
    | proxy /api/*
    v
Fastify Server (port 3001)
    |
    v
Route Handler (routes/*.ts)
    | preHandler: [authenticate, requirePermission()]
    v
Repository Interface (IUserRepository, etc.)
    |
    v
SQLite Implementation (SqliteUserRepository, etc.)
    |
    v
Drizzle ORM
    |
    v
SQLite (better-sqlite3) -> data/app.db
```

In production, Fastify serves the built frontend static files via `@fastify/static` and handles SPA fallback routing.

## Authentication Flow

### Login

1. Client sends `POST /api/auth/login` with `{ email, password }`
2. `getStrategy()` selects `LocalStrategy` (based on `AUTH_MODE` env var)
3. `LocalStrategy.authenticate()` looks up user by email, verifies password with bcrypt
4. Server generates JWT access token (15-minute expiry) and refresh token (7-day expiry)
5. Access token returned in response body; refresh token set as httpOnly cookie (`path: /api/auth`, `sameSite: strict`)
6. Client stores access token in memory (AuthContext) and attaches as `Authorization: Bearer <token>` header

### Token Refresh

1. When an API call returns 401, the frontend API client (`src/services/api.ts`) calls `POST /api/auth/refresh`
2. Server reads refresh token from httpOnly cookie
3. Server validates token exists in `refresh_tokens` table and is not expired
4. Old refresh token is revoked (deleted from DB) -- token rotation
5. New access token + new refresh token issued
6. If refresh fails, user is redirected to login

### Logout

1. Client calls `POST /api/auth/logout`
2. Server revokes refresh token from DB and clears the cookie

## RBAC Model

Authorization uses a **permission-based** system defined in `server/src/auth/permissions.ts`.

### Permissions

```typescript
type Permission =
  | 'use-cases:read' | 'use-cases:create' | 'use-cases:update'
  | 'use-cases:delete' | 'use-cases:review'
  | 'prompts:read' | 'prompts:create' | 'prompts:update'
  | 'prompts:delete' | 'prompts:review' | 'prompts:rate'
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete'
  | 'admin:dashboard';
```

### Role Mappings

| Permission | user | admin |
|-----------|------|-------|
| use-cases:read | Y | Y |
| use-cases:create | Y | Y |
| use-cases:update | Y (own only) | Y |
| use-cases:delete | - | Y |
| use-cases:review | - | Y |
| prompts:read | Y | Y |
| prompts:create | Y | Y |
| prompts:update | Y (own only) | Y |
| prompts:delete | - | Y |
| prompts:review | - | Y |
| prompts:rate | Y | Y |
| users:* | - | Y |
| admin:dashboard | - | Y |

Ownership enforcement (own items only) is handled at the route level, not in the permission system.

### Middleware

- `authenticate`: Validates JWT from `Authorization: Bearer` header, populates `request.user`
- `requirePermission(...permissions)`: Checks `hasPermission(request.user.role, permission)` for all listed permissions
- `requireRole(...roles)`: Checks if `request.user.role` is in the allowed list

## Database Schema

Four tables defined in `server/src/db/schema.ts` using Drizzle's SQLite helpers:

### users
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| email | TEXT UNIQUE NOT NULL | |
| first_name | TEXT NOT NULL | |
| last_name | TEXT NOT NULL | |
| role | TEXT NOT NULL | 'user' or 'admin', default 'user' |
| password | TEXT NOT NULL | bcrypt hash |
| created_at | TEXT NOT NULL | ISO 8601 |
| updated_at | TEXT NOT NULL | ISO 8601 |

### use_cases
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| title, description, what_was_built, key_learnings | TEXT NOT NULL | |
| metrics | TEXT NOT NULL | JSON string |
| category, ai_tool, department, impact, effort, status | TEXT NOT NULL | |
| tags | TEXT NOT NULL | JSON string array |
| submitted_by, submitter_team | TEXT NOT NULL | Display names |
| submitted_by_id | TEXT NOT NULL FK -> users.id | |
| approval_status | TEXT NOT NULL | draft, pending, approved, denied |
| reviewed_by, review_notes, reviewed_at | TEXT | Nullable |
| ai_readiness_score | INTEGER | Nullable |
| created_at, updated_at | TEXT NOT NULL | ISO 8601 |

### prompts
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| title, content, description, problem_being_solved, tips | TEXT NOT NULL | |
| effectiveness_rating | INTEGER NOT NULL | |
| category, ai_tool | TEXT NOT NULL | |
| use_case_id | TEXT FK -> use_cases.id | Nullable |
| tags | TEXT NOT NULL | JSON string array |
| submitted_by | TEXT NOT NULL | Display name |
| submitted_by_id | TEXT NOT NULL FK -> users.id | |
| approval_status | TEXT NOT NULL | draft, pending, approved, denied |
| reviewed_by, review_notes, reviewed_at | TEXT | Nullable |
| rating | REAL NOT NULL | Default 0 |
| rating_count | INTEGER NOT NULL | Default 0 |
| created_at, updated_at | TEXT NOT NULL | ISO 8601 |

### refresh_tokens
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| token | TEXT UNIQUE NOT NULL | |
| user_id | TEXT NOT NULL FK -> users.id | CASCADE delete |
| expires_at | TEXT NOT NULL | ISO 8601 |
| created_at | TEXT NOT NULL | ISO 8601 |

## Repository Pattern

Database access is abstracted behind interfaces in `server/src/db/repositories/interfaces.ts`:

- `IUserRepository` -- findAll, findById, findByEmail, create, update, delete, count
- `IUseCaseRepository` -- findAll (with filters), findById, create, update, delete, count
- `IPromptRepository` -- findAll (with filters), findById, create, update, delete, count
- `IRefreshTokenRepository` -- create, findByToken, deleteByToken, deleteByUserId

Factory functions in `server/src/db/repositories/index.ts` return the SQLite implementations. To add PostgreSQL support, create `postgres.ts` implementations and switch the factory based on a `DB_DRIVER` environment variable.

## API Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/health | No | - | Health check |
| POST | /api/auth/login | No | - | Authenticate and get tokens |
| GET | /api/auth/me | Yes | - | Get current user profile |
| POST | /api/auth/refresh | No | - | Refresh access token (uses cookie) |
| POST | /api/auth/logout | No | - | Revoke refresh token |
| GET | /api/auth/sso/login | No | - | SSO redirect (stub, returns 501) |
| GET | /api/auth/sso/callback | No | - | SSO callback (stub, returns 501) |
| GET | /api/use-cases | No | - | List use cases (with query filters) |
| GET | /api/use-cases/:id | No | - | Get use case by ID |
| POST | /api/use-cases | Yes | - | Create use case |
| PUT | /api/use-cases/:id | Yes | - | Update use case (owner or admin) |
| DELETE | /api/use-cases/:id | Yes | use-cases:delete | Delete use case (admin) |
| PUT | /api/use-cases/:id/review | Yes | use-cases:review | Review use case (admin) |
| GET | /api/prompts | No | - | List prompts (with query filters) |
| GET | /api/prompts/:id | No | - | Get prompt by ID |
| POST | /api/prompts | Yes | - | Create prompt |
| PUT | /api/prompts/:id | Yes | - | Update prompt (owner or admin) |
| DELETE | /api/prompts/:id | Yes | prompts:delete | Delete prompt (admin) |
| PUT | /api/prompts/:id/review | Yes | prompts:review | Review prompt (admin) |
| POST | /api/prompts/:id/rate | Yes | - | Rate a prompt (1-5) |
| GET | /api/users | Yes | users:read | List all users (admin) |
| POST | /api/users | Yes | users:create | Create user (admin) |
| PUT | /api/users/:id | Yes | users:update | Update user (admin) |
| DELETE | /api/users/:id | Yes | users:delete | Delete user (admin) |
| GET | /api/ai-readiness/:useCaseId | No | - | AI readiness check (stub) |

## Deployment

### Local Development

```bash
npm install
cd server && npm install && cd ..
npm run dev
```

Runs concurrently:
- Vite dev server on port 5173 (proxies `/api` to 3001)
- Fastify server on port 3001 (with tsx watch for hot reload)

### Docker (Production)

```bash
# Build and run
docker compose up -d

# Or step by step
npm run docker:build
npm run docker:up

# Stop
npm run docker:down
```

The Dockerfile uses a 3-stage multi-stage build:
1. **frontend-build**: Installs deps and runs `vite build`
2. **server-build**: Installs deps and runs `tsc`
3. **production**: Copies compiled server + built frontend, serves on port 3001

Data is persisted via a Docker volume (`app-data`) mounted at `/app/server/data`.

Environment variables (set in docker-compose.yml or `.env`):
- `JWT_SECRET` -- Secret for signing JWTs (required in production)
- `AUTH_MODE` -- `local` (default), `sso`, or `hybrid`
- `DB_DRIVER` -- `sqlite` (default), future: `postgres`
- `NODE_ENV` -- `production` enables static file serving

### Database Migrations

```bash
cd server
npm run db:generate   # Generate migration files from schema changes
npm run db:migrate    # Apply pending migrations
npm run db:studio     # Open Drizzle Studio GUI
```

## SSO Integration Points

The system is prepared for Microsoft Entra ID (Azure AD) SSO integration:

- **AUTH_MODE** env var switches between `local`, `sso`, and `hybrid` modes
- **AuthStrategy interface** (`server/src/auth/strategies.ts`) -- `getStrategy()` returns the appropriate strategy
- **SSOStrategy** (`server/src/auth/sso.ts`) -- Stub implementation with documented OIDC flow
- **Stub routes** -- `GET /api/auth/sso/login` and `GET /api/auth/sso/callback` return 501

Required env vars for SSO (when implemented):
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_REDIRECT_URI`

## Future Considerations

- **PostgreSQL support**: Repository pattern is ready; implement `PostgresUserRepository`, etc. and switch factory via `DB_DRIVER`
- **Entra ID SSO**: Stubs and strategy pattern in place; add `@azure/msal-node` dependency
- **Testing**: Vitest for unit/integration tests
- **CI/CD**: Pipeline for lint, test, build, deploy
