# Pipeline — From Idea to Impact

An internal platform for managing AI initiatives across the organization. Track use cases with real business metrics, share effective prompts, and measure AI adoption — backed by a real database with proper auth and role-based access control.

## Getting Started

### Prerequisites

- Node.js 20+

### Install and Run

```bash
npm install
cd server && npm install && cd ..
npm run dev
```

This starts both the frontend (http://localhost:5173) and the API server (port 3001) concurrently.

### Default Accounts

The database is seeded on first run with demo users:

| Email | Password | Role |
|-------|----------|------|
| `admin@company.com` | `admin123` | Admin |
| `sarah@company.com` | `password123` | User |

## What's Inside

- **Dashboard** — Aggregate stats, charts for time/money saved over time, breakdowns by category and department, scoring system (S–D grades)
- **Use Case Tracker** — Submit, browse, search, and filter AI use cases with business metrics (time saved, money saved), impact/effort levels, and approval workflows
- **Prompt Library** — Share and discover AI prompts with ratings, effectiveness scores, categories, and copy-to-clipboard
- **My Submissions** — View your own submitted use cases and prompts with their approval status
- **Admin Panel** — User management, pending review queue, denied items (admin role only)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v7 |
| Backend | Fastify 5 |
| Database | SQLite (better-sqlite3) |
| ORM | Drizzle ORM |
| Auth | JWT + bcrypt + refresh tokens |
| Charts | Recharts |
| Search | Fuse.js |

## Routes

| Path | Page | Access |
|------|------|--------|
| `/login` | Login | Public |
| `/` | Dashboard | Authenticated |
| `/use-cases` | Use Case Browser | Authenticated |
| `/use-cases/new` | Submit Use Case | Authenticated |
| `/use-cases/:id` | Use Case Detail | Authenticated |
| `/prompts` | Prompt Library | Authenticated |
| `/prompts/new` | Submit Prompt | Authenticated |
| `/prompts/:id` | Prompt Detail | Authenticated |
| `/my-submissions` | My Submissions | Authenticated |
| `/admin` | Admin Dashboard | Admin |
| `/admin/users` | User Management | Admin |
| `/admin/pending` | Pending Reviews | Admin |
| `/admin/denied` | Denied Items | Admin |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend dev servers |
| `npm run build` | Type-check and build frontend for production |
| `npm run lint` | Run ESLint |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Start Docker container |
| `npm run docker:down` | Stop Docker container |

Server-specific (run from `server/`):

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio GUI |

## Docker

```bash
npm run docker:build
npm run docker:up
```

The app runs on port 3001 in production mode, serving the built frontend via Fastify. Data persists via a Docker volume.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture, data flow, API routes, auth flow, RBAC model, database schema
- [`docs/FEATURES.md`](docs/FEATURES.md) — Feature tracking with status
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) — Version history
- [`docs/DESIGN.md`](docs/DESIGN.md) — Design system (colors, typography, spacing, components)
- [`docs/ADR/`](docs/ADR/) — Architecture Decision Records
