# ADR-002: Fastify Over Express

## Status

Accepted

## Context

We needed a Node.js HTTP framework for the backend API. The primary requirements were:
- TypeScript support with good type inference
- Plugin system for modular route registration
- JSON schema validation capabilities
- Good performance for API serving
- Active maintenance and ecosystem

The main candidates were Express (v4/v5) and Fastify (v5).

## Decision

We chose Fastify v5 for the backend server.

Key factors:
- **Built-in TypeScript support** with typed request/reply objects and plugin system
- **Plugin architecture** allows clean separation of route modules (`authRoutes`, `useCaseRoutes`, etc.) via `server.register()`
- **Schema-based validation** available out of the box (not yet fully utilized but ready)
- **Cookie support** via `@fastify/cookie` for httpOnly refresh tokens
- **Static file serving** via `@fastify/static` for production builds
- **CORS handling** via `@fastify/cors`

## Consequences

### Positive
- Routes are cleanly organized as Fastify plugins, each in its own file
- TypeScript types work well with request augmentation (e.g., `request.user` via `declare module`)
- First-party plugins (`@fastify/cookie`, `@fastify/cors`, `@fastify/static`) cover all our needs
- Plugin encapsulation keeps route logic isolated
- Better async/await support than Express v4

### Negative
- Smaller ecosystem than Express -- fewer third-party middleware options
- Some team members may be less familiar with Fastify patterns
- Fastify v5 is relatively new; some community resources still reference v4

### Mitigations
- The official Fastify plugins cover all current middleware needs
- Fastify's documentation is thorough and well-maintained
- The codebase is small enough that framework familiarity is gained quickly
