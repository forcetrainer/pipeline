# ADR-001: Server Directory Over Monorepo

## Status

Accepted

## Context

The project needed a backend server for authentication, database persistence, and API endpoints. We had to decide how to organize the backend code relative to the existing React frontend.

Options considered:
1. **Monorepo tooling** (Turborepo, Nx, or npm workspaces) with separate `packages/client` and `packages/server`
2. **Separate repositories** for frontend and backend
3. **Server directory** (`server/`) inside the existing project root

## Decision

We chose a `server/` directory within the same repository, with its own `package.json`, `tsconfig.json`, and `node_modules`. The root `package.json` uses `concurrently` to run both the Vite dev server and the Fastify server in a single `npm run dev` command.

## Consequences

### Positive
- **Simplicity**: No monorepo tooling to configure, learn, or maintain
- **Single clone**: Contributors get everything in one `git clone`
- **Easy extraction**: The `server/` directory can be moved to its own repo later with minimal friction since it has its own `package.json` and dependencies
- **Shared context**: Frontend and backend code are visible side-by-side, making it easier to keep API contracts in sync

### Negative
- **Type sharing**: TypeScript types cannot be directly shared between `src/` and `server/src/`; types are currently duplicated
- **No build orchestration**: No dependency graph between packages; build ordering is manual
- **Scaling limit**: If the backend grows significantly (multiple services, shared libraries), a proper monorepo may become necessary

### Mitigations
- Type duplication is minimal (shared types are simple interfaces)
- The project is small enough that build orchestration is not yet needed
- Migration to a monorepo is straightforward since `server/` is already self-contained
