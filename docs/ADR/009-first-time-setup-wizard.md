# ADR-009: First-Time Setup Wizard

## Status

Implemented

## Context

When the app starts in production with an empty database (e.g., fresh Docker deployment), there is no way to create the first admin user. The seed function is intentionally skipped in production (`NODE_ENV=production`), and the only user creation endpoint (`POST /api/users`) requires admin authentication — a chicken-and-egg problem.

The current workaround is manually running SQLite commands inside the Docker container, which is error-prone, undiscoverable, and inappropriate for a tool aimed at non-technical users.

## Decision

### Setup Detection

The server exposes an unauthenticated endpoint to check whether initial setup is needed:

```
GET /api/setup/status → { needsSetup: boolean }
```

Returns `true` when the `users` table has zero rows. This is the only condition — once any user exists, setup is complete forever.

### Setup Endpoint

```
POST /api/setup/init
Body: { email, firstName, lastName, password }
Response: { success: true, user: { id, email, firstName, lastName, role: 'admin' } }
```

**Security constraints:**
- Only works when user count is 0. Returns `403` if any users exist.
- Creates the user with `role: 'admin'` and `status: 'active'`
- Hashes password with bcrypt (same salt rounds as existing auth)
- Triggers `welcome` email notification (ADR-011 stub)

### Frontend Flow

1. `App.tsx` calls `GET /api/setup/status` on mount (before auth check)
2. If `needsSetup: true`, renders `SetupPage` and blocks all other routes
3. `SetupPage.tsx` — guided single-page form:
   - Welcome message explaining this is first-time setup
   - Fields: first name, last name, email, password, confirm password
   - Password strength indicator
   - Submit creates the admin account
4. On success, redirects to `/login` with a success message
5. Setup page is never accessible again once a user exists

### Route Registration

New route file: `server/src/routes/setup.ts`
- `GET /api/setup/status` — no auth required
- `POST /api/setup/init` — no auth required, guarded by user count check

### Files Changed

- `server/src/routes/setup.ts` — new route file
- `server/src/index.ts` — register setup routes
- `src/pages/SetupPage.tsx` — new setup wizard page
- `src/services/setupService.ts` — new frontend service
- `src/App.tsx` — setup status check and routing guard

## Consequences

### Positive
- **Zero-config production start**: First user walks through a guided setup, no CLI commands needed
- **Secure**: Endpoint self-disables after first use (user count > 0 guard)
- **Simple**: Single page, single form, one-time flow
- **Non-technical friendly**: Guided UX matches the app's target audience

### Negative
- **No recovery**: If the admin forgets their password and there's no other admin, recovery requires database access
- **Single admin**: Only creates one admin — additional admins must be promoted via the admin panel

### Mitigations
- Password reset flow (future, ADR-010/011) will address the recovery gap
- Admin panel already supports changing user roles, so promoting additional admins is straightforward
