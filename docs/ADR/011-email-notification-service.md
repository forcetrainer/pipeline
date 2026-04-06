# ADR-011: Email Notification Service

## Status

Implemented

## Context

Multiple features need to notify users: registration confirmation, account approval, content review decisions, comment activity, and more. Currently there is no notification infrastructure — all state changes happen silently.

Building a full email system is premature (no SMTP server configured, no email verification requirement yet), but the notification *trigger points* exist today. We need an abstraction that captures these triggers now, logs them for development/debugging, and can be swapped for real email delivery later.

## Decision

### Service Interface

```typescript
interface IEmailService {
  send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void>;
}
```

The interface is intentionally minimal — one method, one responsibility. The `template` parameter selects the email type; `data` provides template-specific variables.

### Email Templates

| Template | Trigger Point | Recipient | Route File |
|----------|--------------|-----------|------------|
| `welcome` | User registers or admin creates account | New user | `auth.ts`, `users.ts` |
| `email_verification` | Registration (future, when SMTP enabled) | New user | `auth.ts` |
| `account_approved` | Admin changes status to active | User | `users.ts` |
| `account_disabled` | Admin changes status to disabled | User | `users.ts` |
| `password_reset` | Password reset requested (future) | User | `auth.ts` |
| `prompt_approved` | Admin approves a prompt | Submitter | `prompts.ts` |
| `prompt_denied` | Admin denies a prompt | Submitter | `prompts.ts` |
| `usecase_approved` | Admin approves a use case | Submitter | `useCases.ts` |
| `usecase_denied` | Admin denies a use case | Submitter | `useCases.ts` |
| `usecase_status_change` | Use case status changes (e.g., pilot → active) | Submitter | `useCases.ts` |
| `comment_reply` | Reply to a user's comment | Original commenter | `prompts.ts` |
| `comment_mention` | @mentioned in a comment | Mentioned user | `prompts.ts` |
| `assessment_complete` | All 5 checkpoints scored | Assessment owner | `assessments.ts` |

### Template Definitions

Each template specifies a subject line and body with variable interpolation:

```typescript
interface EmailTemplateDefinition {
  subject: string;                    // e.g., "Welcome to Pipeline!"
  body: (data: Record<string, unknown>) => string;  // Plain text body
}

const templates: Record<EmailTemplate, EmailTemplateDefinition> = {
  welcome: {
    subject: 'Welcome to Pipeline!',
    body: (data) => `Hi ${data.firstName},\n\nYour account has been created...`,
  },
  // ... etc
};
```

### Implementations

**ConsoleEmailService** (default):
- Logs emails to `server.log` with `[EMAIL]` prefix
- Includes: to, subject, body (fully rendered)
- Useful for development and verifying trigger points work

**Future: SmtpEmailService**:
- Uses `nodemailer` or similar
- Configured via env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- HTML templates with the app's visual style

### Factory

```typescript
function getEmailService(): IEmailService {
  if (process.env.SMTP_HOST) {
    return new SmtpEmailService();  // future
  }
  return new ConsoleEmailService();
}
```

### Integration Points

The email service is called as a fire-and-forget side effect — it never blocks the request. Failures are logged but don't cause the API request to fail:

```typescript
// Example in a review endpoint
getEmailService().send(user.email, 'prompt_approved', {
  firstName: user.firstName,
  promptTitle: prompt.title,
}).catch(err => server.log.error(err, 'Failed to send notification'));
```

### Comment Mention Parsing

For `comment_mention` notifications, the comment content is scanned for `@firstName.lastName` patterns. This matches the existing @mention convention documented in ADR-006. The mention parser:
1. Extracts `@word.word` patterns from comment text
2. Looks up matching users by `firstName.lastName` (case-insensitive)
3. Sends `comment_mention` notification to each matched user
4. Does not fail if a mention doesn't match any user

### Files

- `server/src/services/emailService.ts` — `IEmailService` interface, `ConsoleEmailService`, factory
- `server/src/services/emailTemplates.ts` — template definitions for all 13 templates
- `server/src/routes/auth.ts` — welcome email on register
- `server/src/routes/users.ts` — welcome, account_approved, account_disabled
- `server/src/routes/prompts.ts` — prompt_approved, prompt_denied, comment_reply, comment_mention
- `server/src/routes/useCases.ts` — usecase_approved, usecase_denied, usecase_status_change
- `server/src/routes/assessments.ts` — assessment_complete
- `server/src/routes/setup.ts` — welcome email on first admin setup (ADR-009)

### Environment Variables (Future)

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=secret
SMTP_FROM="Pipeline <noreply@example.com>"
```

When none are set, `ConsoleEmailService` is used automatically.

## Consequences

### Positive
- **Zero-config**: Works immediately with console logging, no SMTP setup needed
- **Full coverage**: All meaningful state changes have notification hooks from day one
- **Swappable**: Interface pattern means SMTP, SendGrid, SES, etc. can be plugged in without changing call sites
- **Debuggable**: Console output shows exactly what emails would be sent, useful for testing workflows
- **Non-blocking**: Email failures never break API requests

### Negative
- **No real delivery**: Until SMTP is configured, users don't actually receive notifications
- **Template maintenance**: 13 templates to keep in sync with feature changes
- **Mention parsing**: Simple pattern matching may have false positives in comment text

### Mitigations
- Console logging provides immediate value for development and demo purposes
- Templates are plain text with simple interpolation — low maintenance burden
- Mention parsing is best-effort and non-blocking — false positives just log an extra email attempt
- When SMTP is added, all trigger points are already wired — just configure env vars
