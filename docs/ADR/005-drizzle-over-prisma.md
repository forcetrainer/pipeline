# ADR-005: Drizzle Over Prisma

## Status

Accepted

## Context

We needed a type-safe ORM/query builder for database access. The primary requirements were:
- TypeScript type safety for queries and results
- Support for both SQLite and PostgreSQL (for future migration)
- Minimal setup and no code generation step
- SQL-like query syntax for readability
- Migration tooling

The main candidates were Prisma and Drizzle ORM.

## Decision

We chose Drizzle ORM (v0.38.x) with `drizzle-kit` for migrations.

Key factors:
- **No code generation**: Drizzle types are inferred directly from the schema definition; no `prisma generate` step needed
- **SQL-like API**: Queries read like SQL (`db.select().from(users).where(eq(users.email, email))`)
- **Lightweight**: Drizzle is a thin layer over the database driver; no query engine binary
- **Multi-dialect**: Same API works with `drizzle-orm/sqlite-core` and `drizzle-orm/pg-core`
- **Schema as code**: Tables defined as TypeScript objects in `schema.ts`, serving as both schema definition and type source

## Consequences

### Positive
- **Fast setup**: `npm install drizzle-orm` + schema file = working ORM
- **Type inference**: `InferSelectModel<typeof users>` provides full row types without codegen
- **Transparent SQL**: The query API closely mirrors SQL, making it easy to reason about generated queries
- **Small bundle**: No Prisma engine binary (~5MB savings in production image)
- **Migration tooling**: `drizzle-kit generate` creates SQL migration files from schema diffs; `drizzle-kit migrate` applies them; `drizzle-kit studio` provides a GUI
- **Synchronous reads**: With `better-sqlite3`, Drizzle supports synchronous `.get()` and `.all()` calls

### Negative
- **Smaller community**: Less documentation, fewer Stack Overflow answers, and fewer tutorials compared to Prisma
- **Less mature**: Drizzle is newer; API surface may change more frequently
- **Manual relations**: No automatic relation loading like Prisma's `include`; joins must be written explicitly

### Mitigations
- Drizzle's documentation has improved significantly and covers our use cases
- The repository pattern abstracts Drizzle usage, so a future ORM swap would only affect implementation files
- The application does not require complex relation loading; simple queries and manual joins are sufficient
