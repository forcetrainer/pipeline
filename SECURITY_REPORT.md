# Pipeline Application — Security Assessment Report

**Date:** 2026-03-08
**Methodology:** Manual code review (white-box)
**Scope:** Full application stack (React 19 frontend, Fastify 5 backend, SQLite database, Docker infrastructure)
**Classification:** INTERNAL — For development team use

---

## Executive Summary

A comprehensive white-box security assessment was conducted against the Pipeline application, an internal platform for managing AI initiatives. The application consists of a React 19 single-page application frontend communicating with a Fastify 5 REST API backend, backed by SQLite via Drizzle ORM, with JWT-based authentication and role-based access control.

The assessment identified **21 security findings** across the full application stack: 2 Critical, 4 High, 7 Medium, 5 Low, and 3 Informational. Of these, **9 findings were remediated** with code fixes during the review, **4 were deferred** as technical debt with documented remediation plans, **5 were risk-accepted** by mutual agreement between the offensive and defensive teams, and **3 were acknowledged** as informational items. One finding (F11 — JWT localStorage storage) was escalated to arbitration and determined to be already remediated in the current codebase.

The two Critical findings — a hardcoded JWT secret fallback and hardcoded seed passwords running in production — were both fixed. The overall security posture has improved significantly as a result of this review. The most impactful remaining work items are comprehensive input validation (F5, deferred), security headers (F12, deferred), and login rate limiting (F7, deferred).

---

## Scope & Methodology

### Scope

The assessment covered the complete source code of the Pipeline application, including:

**Backend (Fastify 5 / Node.js):**
- Authentication service and JWT management (`server/src/services/authService.ts`)
- Authentication and authorization middleware (`server/src/middleware/`)
- Permission and role definitions (`server/src/auth/`)
- All API route handlers (`server/src/routes/`)
- Database schema, connection, seed data, and repositories (`server/src/db/`)
- Server configuration and CORS (`server/src/index.ts`)

**Frontend (React 19 / TypeScript):**
- API service layer and token management (`src/services/api.ts`)
- Authentication context (`src/contexts/AuthContext.tsx`)
- User-generated content rendering (`src/components/prompts/CommentSection.tsx`)
- Login page (`src/pages/LoginPage.tsx`)

**Infrastructure:**
- Dockerfile and docker-compose.yml
- Environment configuration

### Methodology

The review employed an adversarial Red Team / Blue Team model with independent arbitration:

1. **Red Team (Offensive):** Conducted a thorough manual code review of all security-critical files, identifying vulnerabilities with OWASP/CWE classification, attack scenarios, and recommended remediations.
2. **Blue Team (Defensive):** Assessed each finding against the application's threat model, implemented fixes for valid findings, and argued against fixes deemed disproportionate to the risk.
3. **Arbitration:** An independent arbitrator resolved disputes that the teams could not settle between themselves. One escalation was received and adjudicated.

### Threat Model

- **Users:** Internal enterprise employees
- **Deployment:** Internal network; Docker containerized
- **Data sensitivity:** Moderate — includes proprietary prompts, cost/revenue data, employee names
- **Authentication:** JWT with bcrypt password hashing and refresh token rotation
- **Attack surface:** Authenticated internal users; potential network-adjacent attackers if not behind VPN

---

## Findings Summary

| ID | Title | Severity | Category | Status |
|----|-------|----------|----------|--------|
| F1 | Hardcoded JWT Secret with Weak Fallback | Critical | CWE-798, CWE-1391 | Fixed |
| F2 | Hardcoded Seed Passwords in Production | Critical | CWE-798 | Fixed |
| F3 | Unauthenticated Read Access to All Data | High | CWE-306 | Fixed |
| F4 | Missing Return After 403 in Authorization Middleware | High | CWE-863 | Fixed |
| F5 | No Input Validation on Any Route | High | CWE-20 | Deferred |
| F6 | Users Can Self-Approve via Update Endpoint | High | CWE-639 | Fixed |
| F7 | No Rate Limiting on Login | Medium | CWE-307 | Deferred |
| F8 | JWT Not Invalidated on Logout | Medium | CWE-613 | Risk Accepted |
| F9 | Stored XSS Risk in Comments | Medium | CWE-79 | Risk Accepted |
| F10 | CORS Origin Hardcoded to localhost | Medium | CWE-942 | Fixed |
| F11 | JWT Stored in localStorage | Medium | CWE-922 | Already Remediated |
| F12 | No Security Headers | Medium | CWE-1021 | Deferred |
| F13 | Database Path Hardcoded as dev.db | Medium | CWE-276 | Fixed |
| F14 | No Expired Refresh Token Cleanup | Low | CWE-459 | Deferred |
| F15 | Docker Image Runs as Root | Low | CWE-250 | Fixed |
| F16 | No Password Complexity Requirements | Low | CWE-521 | Risk Accepted |
| F17 | Email Domain Validation Only on Frontend | Low | CWE-602 | Risk Accepted |
| F18 | Predictable Seed Data IDs | Low | CWE-330 | Risk Accepted |
| F19 | No Audit Logging | Info | CWE-778 | Acknowledged |
| F20 | No HTTPS Enforcement | Info | — | Acknowledged |
| F21 | Synchronous bcrypt in Seed | Info | — | Acknowledged |

### Statistics

| Severity | Found | Fixed | Deferred | Risk Accepted | Acknowledged |
|----------|-------|-------|----------|---------------|--------------|
| Critical | 2 | 2 | 0 | 0 | 0 |
| High | 4 | 3 | 1 | 0 | 0 |
| Medium | 7 | 3 | 2 | 2 | 0 |
| Low | 5 | 1 | 1 | 3 | 0 |
| Info | 3 | 0 | 0 | 0 | 3 |
| **Total** | **21** | **9** | **4** | **5** | **3** |

---

## Detailed Findings

### F1 — Hardcoded JWT Secret with Weak Fallback

**Severity:** Critical
**Category:** CWE-798 (Use of Hard-coded Credentials), CWE-1391 (Use of Weak Credentials)
**Status:** Fixed ✅
**Affected Components:** `server/src/services/authService.ts:6`, `docker-compose.yml:9`

**Description:** The JWT signing secret had a hardcoded fallback value of `'dev-secret-change-in-production'`. If the `JWT_SECRET` environment variable was not set, all JWTs would be signed with this publicly known secret, allowing any attacker with source code access to forge arbitrary authentication tokens for any user, including administrators.

**Attack Scenario:** An attacker with access to the source code (or who guesses the common fallback pattern) crafts a JWT with `{ sub: "admin-user-id", role: "admin" }`, signs it with `'dev-secret-change-in-production'`, and gains full administrative access to the application.

**Remediation:** Added a startup validation check that throws an error if `JWT_SECRET` is not set when `NODE_ENV=production`. Updated `docker-compose.yml` to use `${JWT_SECRET:?JWT_SECRET must be set}` syntax, which causes container startup failure if the variable is missing.

---

### F2 — Hardcoded Seed Passwords in Production

**Severity:** Critical
**Category:** CWE-798 (Use of Hard-coded Credentials)
**Status:** Fixed ✅
**Affected Component:** `server/src/db/seed.ts:26`

**Description:** All 9 seed users, including the admin account (`admin@example.com`), shared the password `password123`. The seed function ran unconditionally on application startup, including in production environments. This created valid administrator credentials that any attacker aware of the codebase could use.

**Attack Scenario:** An attacker logs in with `admin@example.com` / `password123` and gains full administrative access including user management, data modification, and approval workflows.

**Debate:** The Blue Team initially pushed back, arguing seed data is development tooling. The Red Team demonstrated that the seed function runs in production with no environment check, making `admin@example.com/password123` a valid production admin login. The Blue Team conceded.

**Remediation:** Added a `NODE_ENV === 'production'` guard that skips the entire seeding process in production environments.

---

### F3 — Unauthenticated Read Access to All Data

**Severity:** High
**Category:** CWE-306 (Missing Authentication for Critical Function), OWASP A01:2021
**Status:** Fixed ✅
**Affected Components:** `server/src/routes/useCases.ts:21-32`, `server/src/routes/prompts.ts:21-49,176-180`

**Description:** All GET endpoints for use cases, prompts, and comments required no authentication. This exposed proprietary AI prompts, financial cost and revenue data, employee names, and internal business strategies to any unauthenticated user who could reach the API.

**Attack Scenario:** An unauthenticated attacker sends `GET /api/use-cases` and receives all use case data including actual costs, revenue per use, and ROI calculations — sensitive business intelligence that could be used by competitors or leaked publicly.

**Debate:** The Blue Team argued this was intentional design for knowledge sharing and that the application would be behind a VPN. The Red Team countered that (1) the server binds to `0.0.0.0` with no VPN enforcement in code, (2) the security model was inconsistent since assessments already required authentication, and (3) the exposed data included sensitive financials. The Blue Team conceded.

**Remediation:** Added `{ preHandler: [authenticate] }` to all 5 unauthenticated GET routes across use cases, prompts, and comments.

---

### F4 — Missing Return After 403 in Authorization Middleware

**Severity:** High
**Category:** CWE-863 (Incorrect Authorization), OWASP A01:2021
**Status:** Fixed ✅
**Affected Component:** `server/src/middleware/authorize.ts:10-16, 25-29`

**Description:** The `requireRole` and `requirePermission` middleware functions sent a 403 Forbidden response when authorization failed, but did not return afterward. Fastify's request lifecycle could potentially allow the route handler to execute despite the 403, depending on how the response was handled downstream.

**Attack Scenario:** A user without the required role or permission makes a request to a protected endpoint. The middleware sends a 403 response but execution continues into the route handler, which processes the request with the unauthorized user's context.

**Remediation:** Added explicit `return;` statements after both `reply.code(403).send(...)` calls in `requireRole` and `requirePermission`.

---

### F5 — No Input Validation on Any Route

**Severity:** High
**Category:** CWE-20 (Improper Input Validation), OWASP A03:2021
**Status:** Deferred ⏳
**Affected Components:** All route files (`server/src/routes/*.ts`)

**Description:** No API route uses JSON Schema validation (Fastify's built-in capability). There are no type checks, length limits (except on comments), or format validations. Request body fields are accessed with unsafe `as` type casts throughout.

**Attack Scenario:** An attacker submits a use case with a 10MB description field, consuming excessive database storage. Or submits unexpected field types that cause runtime errors or unexpected behavior in downstream processing.

**Remediation:** The exploitable subset — `approvalStatus` bypass — was fixed as part of F6. Full JSON Schema validation across all routes was accepted as a separate work item. The risk is partially mitigated by Drizzle ORM's parameterized queries, which prevent SQL injection regardless of input validation.

---

### F6 — Users Can Self-Approve via Update Endpoint

**Severity:** High
**Category:** CWE-639 (Authorization Bypass Through User-Controlled Key), OWASP A01:2021
**Status:** Fixed ✅
**Affected Components:** `server/src/routes/useCases.ts:68,101`, `server/src/routes/prompts.ts:70,99`

**Description:** The `approvalStatus` field was included in the `stringFields` array on update routes, allowing any authenticated user to set their own content's approval status to `'approved'` via a simple PUT request, bypassing the intended admin approval workflow.

**Attack Scenario:** A regular user creates a use case, then sends `PUT /api/use-cases/:id { approvalStatus: "approved" }` to self-approve their submission without admin review.

**Remediation:** Hardcoded `approvalStatus` to `'draft'` on create routes. Removed `approvalStatus` from the updateable string fields array on update routes, ensuring only dedicated approval endpoints (with proper authorization) can change approval status.

---

### F7 — No Rate Limiting on Login

**Severity:** Medium
**Category:** CWE-307 (Improper Restriction of Excessive Authentication Attempts), OWASP A07:2021
**Status:** Deferred ⏳
**Affected Component:** `server/src/routes/auth.ts:9-40`

**Description:** The login endpoint has no rate limiting, account lockout, or progressive delay mechanism. An attacker can make unlimited authentication attempts.

**Remediation:** Deferred as technical debt. bcrypt with cost factor 12 provides an implicit throttle of approximately 4 attempts per second per connection. Proper rate limiting should be implemented at the reverse proxy layer (e.g., nginx `limit_req`) rather than in application code. Recommended: 5 attempts per 15 minutes per IP/account.

---

### F8 — JWT Not Invalidated on Logout

**Severity:** Medium (downgraded from Medium to Low by mutual agreement)
**Category:** CWE-613 (Insufficient Session Expiration), OWASP A07:2021
**Status:** Risk Accepted ⚠️
**Affected Component:** `server/src/routes/auth.ts:87-94`

**Description:** When a user logs out, the JWT access token remains valid until its natural expiration (15 minutes). There is no server-side token denylist mechanism to immediately invalidate the token.

**Risk Acceptance Rationale:** The 15-minute access token expiry provides a bounded window of exposure. Implementing a JWT denylist requires disproportionate infrastructure (Redis or similar) for the risk level. Refresh token revocation on logout provides the long-lived session kill switch — an attacker with a stolen access token has at most 15 minutes of access and cannot renew it.

---

### F9 — Stored XSS Risk in Comments

**Severity:** Medium (downgraded from Medium to Low by mutual agreement)
**Category:** CWE-79 (Cross-site Scripting), OWASP A03:2021
**Status:** Risk Accepted ⚠️
**Affected Component:** `src/components/prompts/CommentSection.tsx:209-214`

**Description:** Comment content is stored on the server without sanitization and rendered in the frontend. If the rendering bypassed React's default JSX escaping, stored XSS would be possible.

**Risk Acceptance Rationale:** React's JSX rendering automatically escapes all interpolated values, preventing XSS execution. There are no uses of `dangerouslySetInnerHTML` in the comment rendering path. Server-side sanitization (e.g., DOMPurify) is recommended as defense-in-depth for future API consumers (mobile apps, third-party integrations) but is not currently exploitable.

---

### F10 — CORS Origin Hardcoded to localhost

**Severity:** Medium
**Category:** CWE-942 (Permissive Cross-domain Policy), OWASP A05:2021
**Status:** Fixed ✅
**Affected Component:** `server/src/index.ts:16-19`

**Description:** The CORS `origin` was hardcoded to `http://localhost:5173`, which is incorrect for production deployments. In production, this would either block legitimate frontend requests (if the origin differs) or require changing to a wildcard `*`, which weakens CORS protections.

**Attack Scenario:** In a production deployment with a different frontend origin, developers might set CORS to `*` as a quick fix, inadvertently allowing any website to make authenticated cross-origin requests if credentials are included.

**Remediation:** Changed to `process.env.CORS_ORIGIN || 'http://localhost:5173'`, allowing proper CORS configuration per environment.

---

### F11 — JWT Stored in localStorage

**Severity:** Medium
**Category:** CWE-922 (Insecure Storage of Sensitive Information), OWASP A07:2021
**Status:** Fixed ✅ (confirmed remediated by Arbitrator)
**Affected Components:** `src/services/api.ts`, `src/services/authService.ts`, `src/contexts/AuthContext.tsx`

**Description:** The finding alleged that JWT tokens were stored in `localStorage`, which would expose them to exfiltration via XSS attacks. An attacker exploiting an XSS vulnerability could read the token from `localStorage` and send it to an external server for persistent off-device access.

**Debate:** The Blue Team initially pushed back, arguing XSS is a prerequisite making the finding moot. The Red Team correctly argued that `localStorage` persistence enables token exfiltration (attacker sends token to their server) while in-memory storage limits exploitation to same-session attacks. The Blue Team conceded and implemented the fix. The finding was then escalated to arbitration for final confirmation.

**Remediation:** The Blue Team replaced `localStorage` token storage with a module-scoped `inMemoryToken` variable in `src/services/api.ts`, updated the 401 handler to always attempt silent refresh, made `logout()` async to call the server-side logout endpoint in `src/services/authService.ts`, and updated `src/contexts/AuthContext.tsx` accordingly.

**Arbitrator Ruling:** Upon reviewing the remediated code, the arbitrator confirmed the implementation now follows OWASP best practices for SPA token storage:
- Access token: in-memory only (module-scoped variable)
- Refresh token: HttpOnly, Secure, SameSite=Strict cookie
- Token refresh with rotation on the `/api/auth/refresh` endpoint

No further code changes were required.

---

### F12 — No Security Headers

**Severity:** Medium
**Category:** CWE-1021 (Improper Restriction of Rendered UI Layers), OWASP A05:2021
**Status:** Deferred ⏳
**Affected Component:** `server/src/index.ts`

**Description:** The server does not set security headers including Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options, or Referrer-Policy.

**Remediation:** Deferred because implementing a proper CSP requires testing to avoid breaking the application's functionality. The recommended approach is to install `@fastify/helmet` with appropriate configuration. This should be a near-term work item.

---

### F13 — Database Path Hardcoded as dev.db

**Severity:** Medium
**Category:** CWE-276 (Incorrect Default Permissions), OWASP A05:2021
**Status:** Fixed ✅
**Affected Component:** `server/src/db/connection.ts:8`

**Description:** The database file path was hardcoded to `../../data/dev.db` regardless of the runtime environment. This means production deployments would use a file named `dev.db`, creating confusion about which database is authoritative and potentially exposing development data in production.

**Attack Scenario:** A production deployment uses the `dev.db` path. During a debugging session, a developer resets the dev database, unknowingly destroying production data.

**Remediation:** Changed to `process.env.DB_PATH || resolve(__dirname, '../../data/pipeline.db')`, allowing proper database path configuration per environment with a more appropriate default name.

---

### F14 — No Expired Refresh Token Cleanup

**Severity:** Low
**Category:** CWE-459 (Incomplete Cleanup), OWASP A07:2021
**Status:** Deferred ⏳
**Affected Component:** `server/src/services/authService.ts:46-55`

**Description:** Expired refresh tokens persist indefinitely in the database unless they are reused (triggering rotation). Over time, this accumulates stale token records.

**Remediation:** Deferred as a housekeeping concern. Expired tokens are not exploitable — they fail validation on use. A scheduled cleanup job (e.g., daily cron deleting tokens where `expiresAt < now()`) is recommended but not a security-critical fix.

---

### F15 — Docker Image Runs as Root

**Severity:** Low
**Category:** CWE-250 (Execution with Unnecessary Privileges), OWASP A05:2021
**Status:** Fixed ✅
**Affected Component:** `Dockerfile:18-25`

**Description:** The production Docker image's final stage did not create or switch to a non-root user. If the application were compromised, the attacker would have root-level access within the container.

**Attack Scenario:** An attacker exploits a remote code execution vulnerability in a dependency. Running as root, they can modify system files, install tools, and potentially escape the container depending on the Docker configuration.

**Remediation:** Added a `nodejs` user and group in the Dockerfile with proper ownership of the data directory. The application now runs as a non-root user in production.

---

### F16 — No Password Complexity Requirements

**Severity:** Low
**Category:** CWE-521 (Weak Password Requirements), OWASP A07:2021
**Status:** Risk Accepted ⚠️
**Affected Component:** `server/src/routes/users.ts:28`

**Description:** The user creation endpoint accepts any password with no minimum length or complexity requirements.

**Risk Acceptance Rationale:** NIST SP 800-63B (Digital Identity Guidelines) actively discourages complexity rules (uppercase, special characters) as they lead to predictable patterns and user frustration. Users are created by administrators, not through self-registration, which mitigates the risk of users choosing weak passwords. A minimum 8-character length requirement is recommended as a future improvement.

---

### F17 — Email Domain Validation Only on Frontend

**Severity:** Low
**Category:** CWE-602 (Client-Side Enforcement of Server-Side Security), OWASP A07:2021
**Status:** Risk Accepted ⚠️
**Affected Component:** `src/pages/LoginPage.tsx:29-36`

**Description:** Email domain validation (restricting to a specific corporate domain) is performed only on the frontend login form. The backend authentication endpoint accepts any email address.

**Risk Acceptance Rationale:** Database authentication is the real security control — a user must have valid credentials (email + password) that match a record in the database. There is no self-registration; all users are created by administrators. Bypassing the frontend domain check does not enable login without valid credentials in the database.

---

### F18 — Predictable Seed Data IDs

**Severity:** Low
**Category:** CWE-330 (Use of Insufficiently Random Values)
**Status:** Risk Accepted ⚠️
**Affected Component:** `server/src/db/seed.ts:29-39`

**Description:** Seed data uses predictable IDs such as `user-001`, `uc-001`, etc., rather than cryptographically random identifiers.

**Risk Acceptance Rationale:** This is a development tooling convenience for reproducible test environments. Production-created resources use `crypto.randomUUID()`. The concern about IDOR attacks using predictable IDs is now moot since the F3 fix requires authentication on all GET routes, and authorization checks prevent unauthorized access regardless of ID predictability.

---

### F19 — No Audit Logging

**Severity:** Informational
**Category:** CWE-778 (Insufficient Logging)
**Status:** Acknowledged

**Description:** The application does not maintain an audit trail for security-relevant events such as failed login attempts, administrative actions (user creation, role changes), data deletions, or approval workflow changes.

**Recommendation:** Implement structured audit logging for authentication events, authorization failures, and administrative actions. This is an operational capability improvement, not a vulnerability remediation.

---

### F20 — No HTTPS Enforcement

**Severity:** Informational
**Category:** Transport Security
**Status:** Acknowledged

**Description:** The server listens on plain HTTP and relies on a reverse proxy for TLS termination.

**Recommendation:** This is a standard deployment pattern. The application correctly respects `NODE_ENV` for the `secure` flag on cookies. Ensure the reverse proxy (nginx, cloud load balancer) is configured with TLS and HSTS headers.

---

### F21 — Synchronous bcrypt in Seed

**Severity:** Informational
**Category:** Performance
**Status:** Acknowledged

**Description:** The seed function uses `hashSync` (synchronous bcrypt), which blocks the Node.js event loop during startup.

**Recommendation:** This runs once during application startup and takes approximately 250ms. The impact is negligible and does not affect runtime request handling. No change recommended.

---

## Risk Accepted Items

This section provides a consolidated view of all findings accepted without remediation, with full rationale.

| ID | Finding | Original Severity | Rationale |
|----|---------|-------------------|-----------|
| F8 | JWT not invalidated on logout | Medium → Low | 15-minute token expiry bounds exposure. JWT denylist requires disproportionate infrastructure (Redis). Refresh token revocation provides long-session kill switch. |
| F9 | Stored XSS risk in comments | Medium → Low | React JSX escaping prevents exploitation. No `dangerouslySetInnerHTML` usage. Server-side sanitization recommended as defense-in-depth for future API consumers. |
| F16 | No password complexity requirements | Low | NIST SP 800-63B discourages complexity rules. Admin-created users mitigate self-service risk. Minimum 8-character length recommended. |
| F17 | Email domain validation only on frontend | Low | Database authentication is the real control. No self-registration. Bypassing domain check requires valid database credentials. |
| F18 | Predictable seed data IDs | Low | Dev tooling convenience. Production uses `crypto.randomUUID()`. Moot after F3 fix requiring authentication on reads. |

## Deferred Items (Technical Debt)

| ID | Finding | Severity | Recommended Timeline | Notes |
|----|---------|----------|---------------------|-------|
| F5 | No input validation on any route | High | Near-term | Use Fastify JSON Schema validation. Exploitable subset (approvalStatus) already fixed in F6. Drizzle ORM prevents SQL injection. |
| F12 | No security headers | Medium | Near-term | Install `@fastify/helmet`. Requires CSP testing to avoid breaking functionality. |
| F7 | No rate limiting on login | Medium | Medium-term | Implement at reverse proxy layer. bcrypt cost 12 provides implicit throttle (~4 attempts/sec). |
| F14 | No expired refresh token cleanup | Low | Low priority | Scheduled cleanup job. Not exploitable — expired tokens fail validation. |

---

## Recommendations

Prioritized list of additional security improvements beyond the fixes implemented during this review:

### Priority 1 — Near-Term (Next Sprint)

1. **Implement JSON Schema validation on all API routes (F5).** Use Fastify's built-in schema validation to enforce type checking, length limits, and format constraints on all request bodies. This is the highest-severity remaining item.
2. **Add security headers via @fastify/helmet (F12).** Configure Content-Security-Policy, X-Frame-Options, HSTS, X-Content-Type-Options, and Referrer-Policy. Test CSP thoroughly to avoid breaking application functionality.

### Priority 2 — Medium-Term (Next Quarter)

3. **Implement rate limiting on authentication endpoints (F7).** Configure at the reverse proxy layer (nginx `limit_req` or cloud WAF). Recommended: 5 failed attempts per 15 minutes per IP address.
4. **Add server-side input sanitization for user-generated content (F9 defense-in-depth).** Install DOMPurify or equivalent to sanitize comment and prompt text before storage, protecting future API consumers.
5. **Add minimum password length validation (F16).** Enforce 8-character minimum on the user creation endpoint.
6. **Implement audit logging (F19).** Log authentication events (success/failure), authorization failures, administrative actions, and data modifications with structured JSON logging.

### Priority 3 — Ongoing

7. **Implement expired refresh token cleanup (F14).** Add a scheduled job to purge tokens where `expiresAt < now()`.
8. **Add backend email domain validation (F17).** Mirror the frontend domain check on the authentication endpoint for defense-in-depth.
9. **Run dependency audits in CI/CD.** Add `npm audit` to the CI pipeline to catch known vulnerabilities in dependencies.
10. **Enforce HTTPS at the infrastructure level (F20).** Configure TLS on the reverse proxy with HSTS headers.

---

## Conclusion

The Pipeline application's security posture has improved materially as a result of this assessment. The two Critical findings (hardcoded JWT secret fallback and production seed passwords) have been fully remediated, eliminating the most severe attack vectors. Key High-severity issues — unauthenticated data access, authorization middleware bypass, and self-approval — have also been fixed.

The application demonstrates several positive security practices already in place:
- **In-memory JWT storage** with HttpOnly cookie refresh (OWASP best practice for SPAs)
- **bcrypt password hashing** with appropriate cost factor
- **Refresh token rotation** preventing token reuse attacks
- **Drizzle ORM parameterized queries** preventing SQL injection
- **React JSX auto-escaping** preventing XSS in rendered content
- **Role-based access control** with middleware enforcement

The remaining technical debt (input validation, security headers, rate limiting) represents standard hardening work that should be addressed in the near term. No findings represent an immediately exploitable critical vulnerability in the current remediated state.

**Overall Risk Rating: MEDIUM** — The application is suitable for internal use with the fixes applied. The deferred items should be addressed before any broader deployment or exposure to less-trusted networks.

---

## Appendix

### A. Team Composition

| Role | Agent | Responsibility |
|------|-------|----------------|
| Red Team | red-team | Offensive security review — vulnerability identification and attack scenarios |
| Blue Team | blue-team | Defensive assessment — fix implementation, risk evaluation, pushback on disproportionate fixes |
| Arbitrator | arbitrator | Independent dispute resolution — final binding decisions on contested findings |
| Reporter | reporter | Report compilation — this document |

### B. Escalation Summary

One finding was escalated to arbitration during the review:

- **F11 (JWT localStorage Storage):** The Red Team argued that localStorage enables token exfiltration via XSS. The Blue Team argued XSS is a prerequisite making the finding moot. The Arbitrator reviewed the code and found the implementation already uses in-memory storage with HttpOnly cookie refresh — the finding was already remediated. No code changes required.

### C. Key Debates

Three findings involved significant debate between the teams before resolution:

1. **F2 (Seed Passwords):** Blue Team initially refused the fix as "dev tooling." Red Team demonstrated the seed runs in production unconditionally. Blue Team conceded after reviewing the evidence.
2. **F3 (Unauthenticated Reads):** Blue Team argued "intentional design for knowledge sharing." Red Team demonstrated inconsistent security model (assessments gated, use cases not), no VPN enforcement in code, and exposure of sensitive financial data. Blue Team conceded.
3. **F11 (localStorage JWT):** Escalated to arbitration. Resolved as already remediated — see Escalation Summary above.

### D. OWASP Top 10 (2021) Coverage

| OWASP Category | Findings | Status |
|----------------|----------|--------|
| A01: Broken Access Control | F3, F4, F6 | Reviewed — all fixed |
| A02: Cryptographic Failures | F1 | Reviewed — fixed |
| A03: Injection | F5, F9 | Reviewed — F5 deferred, F9 risk accepted |
| A04: Insecure Design | No findings | Reviewed |
| A05: Security Misconfiguration | F10, F12, F13, F15 | Reviewed — F10/F13/F15 fixed, F12 deferred |
| A06: Vulnerable Components | No findings | Reviewed |
| A07: Identification & Auth Failures | F2, F7, F8, F11, F14, F16 | Reviewed — F2/F11 fixed, F7/F14 deferred, F8/F16 risk accepted |
| A08: Software & Data Integrity | No findings | Reviewed |
| A09: Logging & Monitoring Failures | F19 | Reviewed — acknowledged |
| A10: SSRF | No findings | Reviewed |

### E. Tools and References

- Manual source code review (white-box)
- OWASP Top 10 2021
- CWE (Common Weakness Enumeration)
- NIST SP 800-63B (Digital Identity Guidelines)
- Fastify 5 security documentation
- OWASP SPA Security Cheat Sheet

---

*Report compiled 2026-03-08 by the security-review team.*
