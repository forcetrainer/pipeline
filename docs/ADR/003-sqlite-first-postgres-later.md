# ADR-003: SQLite First, PostgreSQL Later

## Status

Accepted

## Context

The project needed a persistent database to replace localStorage. Requirements:
- Zero-configuration local development (no Docker dependency for DB)
- Fast startup for development and testing
- Path to PostgreSQL for production deployment
- Type-safe query building

## Decision

We chose SQLite via `better-sqlite3` as the initial database, with a repository pattern to enable a future PostgreSQL migration.

The architecture has three layers:
1. **Repository interfaces** (`IUserRepository`, `IUseCaseRepository`, etc.) define the data access contract
2. **SQLite implementations** (`SqliteUserRepository`, etc.) implement the interfaces using Drizzle ORM with SQLite
3. **Factory functions** (`getUserRepository()`, etc.) return the appropriate implementation based on configuration

To add PostgreSQL, create new repository implementations and update the factory functions to check a `DB_DRIVER` environment variable.

## Consequences

### Positive
- **Zero setup**: SQLite requires no external services; the database file is created automatically
- **Fast**: No network overhead; synchronous reads with `better-sqlite3`
- **Portable**: Database is a single file, easy to backup, copy, or reset
- **Clean abstraction**: Repository interfaces make the database engine swappable
- **Drizzle ORM**: Supports both SQLite and PostgreSQL with similar API

### Negative
- **SQL dialect differences**: Some SQLite-specific behaviors (e.g., text-based dates, no native JSONB) will need adjustment for PostgreSQL
- **Concurrency**: SQLite has limited write concurrency (WAL mode helps but is not equivalent to PostgreSQL)
- **No network access**: SQLite is embedded; multiple services cannot share the same database

### Mitigations
- Repository pattern isolates all SQL dialect differences behind interfaces
- The application is single-instance (one Fastify server), so SQLite concurrency limits are acceptable
- Docker volume persistence ensures data survives container restarts
- `DB_DRIVER` env var is already referenced in `docker-compose.yml`
