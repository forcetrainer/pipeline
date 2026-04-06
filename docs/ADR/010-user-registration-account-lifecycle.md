# ADR-010: User Registration & Account Lifecycle

## Status

Implemented

## Context

Users can only be created by admins via the admin panel (`POST /api/users` requires `users:create` permission). There is no self-registration flow. For an internal tool, this creates an onboarding bottleneck — every new user must request access from an admin, who then manually creates the account.

Additionally, the `users` table has no concept of account state. A user either exists (can log in) or doesn't. There's no way to temporarily disable an account, gate access behind email verification, or implement an approval workflow for new signups.

## Decision

### Schema Change: User Status

Add a `status` field to the `users` table:

| Value | Meaning | Can log in? |
|-------|---------|-------------|
| `active` | Full access | Yes |
| `pending` | Awaiting approval or verification | No |
| `disabled` | Suspended by admin | No |

**Migration:** `ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`

Existing users receive `active` automatically. No data loss, fully backward compatible.

### Registration Endpoint

```
POST /api/auth/register
Body: { email, firstName, lastName, password }
Response: { success: true, message: "Account created" }
```

**Behavior:**
1. Validates required fields, email format, password strength (min 8 chars)
2. Checks email is not already registered (409 Conflict if duplicate)
3. Hashes password with bcrypt (salt=12, same as existing)
4. Creates user with `role: 'user'`, `status: 'active'` (auto-approved for now)
5. Triggers `welcome` email notification (ADR-011)

**Email verification stub:**
- The registration flow is structured to support email verification later
- When verification is enabled (future): user gets `status: 'pending'`, verification email sent, user must click link to activate
- For now: user is immediately `active` and can log in
- A comment in the code marks where the verification gate would be inserted

### Login Enforcement

`POST /api/auth/login` gains a status check after password verification:

```typescript
if (user.status === 'pending') {
  return reply.code(403).send({ error: 'Account is pending approval' });
}
if (user.status === 'disabled') {
  return reply.code(403).send({ error: 'Account has been disabled' });
}
```

### Registration Page

New `RegisterPage.tsx`:
- Linked from login page ("Don't have an account? Create one")
- Fields: first name, last name, email, password, confirm password
- Client-side validation: email format, password match, minimum length
- On success: redirect to `/login` with flash message "Account created! You can now log in."
- On duplicate email: show error inline

### Admin User Management Enhancements

The existing admin user management page gains:
- Status column in user table (with colored badges: green/yellow/red)
- Ability to change user status (active/pending/disabled)
- Admin-created users default to `active` (skip pending)
- Status change triggers email notification (ADR-011): `account_approved` or `account_disabled`

### Type Changes

```typescript
// src/types/index.ts
type UserStatus = 'active' | 'pending' | 'disabled';

interface User {
  // ...existing fields
  status: UserStatus;
}
```

### API Changes

| Method | Path | Auth | Change |
|--------|------|------|--------|
| POST | /api/auth/register | No | **New** — self-registration |
| POST | /api/auth/login | No | **Modified** — checks user status |
| GET | /api/auth/me | Yes | Returns status field |
| POST | /api/users | Yes (admin) | Creates with `status: 'active'` |
| PUT | /api/users/:id | Yes (admin) | Can update `status` field |

### Files Changed

- `server/src/db/schema.ts` — add `status` column to users table
- `server/drizzle/` — new migration for status column
- `server/src/routes/auth.ts` — add register endpoint, status check on login
- `server/src/auth/strategies.ts` — `LocalStrategy` returns status in auth result
- `server/src/routes/users.ts` — pass through status on create/update
- `server/src/db/repositories/interfaces.ts` — `NewUser` type includes status
- `src/types/index.ts` — `UserStatus` type, `status` on `User`
- `src/pages/RegisterPage.tsx` — new registration form
- `src/pages/LoginPage.tsx` — add "Create an account" link
- `src/services/authService.ts` — add `register()` function
- `src/App.tsx` — add `/register` route
- `src/pages/admin/UserManagementPage.tsx` — status column, status toggle

## Consequences

### Positive
- **Self-service onboarding**: Users register themselves, reducing admin bottleneck
- **Account lifecycle**: Status field enables disable/re-enable without deleting data
- **Verification-ready**: Flow is structured so email verification can be dropped in later without restructuring
- **Backward compatible**: Existing users default to `active`, no behavior change

### Negative
- **Open registration**: Anyone who can reach the app can create an account (acceptable for internal network)
- **No email verification yet**: Accounts are immediately active — no proof of email ownership
- **No password requirements UI**: Only minimum length enforced initially

### Mitigations
- App is deployed on internal network, limiting exposure
- Admin can disable any account immediately
- Email verification is stubbed and can be enabled when SMTP is configured (ADR-011)
- Password policy can be strengthened incrementally without schema changes
