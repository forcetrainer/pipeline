# ADR-004: JWT Auth with SSO Hooks

## Status

Implemented

## Context

The application needs authentication for:
- Identifying who submitted use cases and prompts
- Protecting admin operations (user management, content review)
- Supporting future Microsoft Entra ID (Azure AD) single sign-on

We needed an auth system that works locally today but can integrate with enterprise SSO later without a rewrite.

## Decision

We implemented JWT-based authentication with a strategy pattern that supports future SSO integration.

### Token Architecture
- **Access tokens**: 15-minute expiry, signed with HS256 via `jsonwebtoken`, sent as `Authorization: Bearer` header
- **Refresh tokens**: 7-day expiry, stored in `refresh_tokens` database table, delivered as httpOnly cookies with `sameSite: strict` and `path: /api/auth`
- **Token rotation**: Each refresh request revokes the old token and issues a new one

### Strategy Pattern
- `AuthStrategy` interface defines `authenticate(email, password): Promise<AuthResult>`
- `LocalStrategy` implements email/password auth with bcrypt
- `SSOStrategy` is a stub with documented methods for Entra ID OIDC flow
- `getStrategy()` factory selects the strategy based on `AUTH_MODE` env var (`local`, `sso`, `hybrid`)

### AUTH_MODE Values
- `local`: Email/password authentication only (default)
- `sso`: Entra ID redirect flow only
- `hybrid`: Tries local auth first (for admin/service accounts), with SSO as the primary path

## Consequences

### Positive
- **Works now**: Local auth is fully functional with secure password hashing
- **Clean SSO path**: Strategy pattern means SSO is additive, not a rewrite
- **Token security**: Short-lived access tokens limit exposure; httpOnly refresh cookies prevent XSS theft; rotation limits replay attacks
- **Stateless API**: JWT access tokens require no server-side lookup for validation

### Negative
- **Token management complexity**: Refresh flow, rotation, and cookie handling add implementation surface area
- **No token revocation for access tokens**: A compromised access token is valid until expiry (15 minutes)
- **Secret management**: `JWT_SECRET` must be configured in production

### Mitigations
- 15-minute access token expiry limits the window for compromised tokens
- Refresh token rotation ensures old tokens cannot be reused
- `JWT_SECRET` defaults to a dev value and is documented as requiring change in production
- SSO stub includes detailed inline documentation for the implementation steps
