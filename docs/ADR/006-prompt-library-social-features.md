# ADR-006: Prompt Library Social Features

## Status

Implemented

## Context

The prompt library is a standalone knowledge-sharing tool where users contribute and discover AI prompts. Currently, users can rate prompts (1-5 stars) and browse/filter them, but there's no way to:
- Save prompts for quick access (favorites/stars)
- Discuss prompts — ask questions, share variations, report issues
- Have threaded conversations around specific prompts

These social features increase engagement and surface quality signals organically. A prompt that's heavily starred and actively discussed is visibly valuable. Combined with the existing `useCaseId` link (prompts can be associated with use cases), this creates a natural quality indicator: starred prompts tied to successful use cases demonstrate real-world utility.

## Decision

Add three social capabilities to the prompt library: stars (favorites), comments, and threaded replies. These are independent of the readiness assessment and use case features — the prompt library remains a standalone tool.

### Stars (Favorites)

Users can star/unstar prompts. Starred prompts appear on the user's dashboard for quick access.

**New table: `prompt_stars`**
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK, UUID |
| promptId | TEXT | FK → prompts.id, NOT NULL, CASCADE delete |
| userId | TEXT | FK → users.id, NOT NULL, CASCADE delete |
| createdAt | TEXT | NOT NULL, ISO 8601 |

- Unique constraint on `(promptId, userId)` — one star per user per prompt
- Star count can be derived via `COUNT(*)` or cached on the prompts table as `starCount` for performance

**API endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/prompts/:id/star | Yes | Star a prompt (toggle — stars if unstarred, unstars if starred) |
| GET | /api/prompts/starred | Yes | Get current user's starred prompts |

**Dashboard integration:**
- "My Starred Prompts" section on the user dashboard
- Star count visible on prompt cards in browse view
- Sort/filter by star count

### Comments

Users can leave comments on prompts. Comments support threading via a `parentId` self-reference.

**New table: `prompt_comments`**
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK, UUID |
| promptId | TEXT | FK → prompts.id, NOT NULL, CASCADE delete |
| userId | TEXT | FK → users.id, NOT NULL, CASCADE delete |
| parentId | TEXT | FK → prompt_comments.id, NULLABLE (null = top-level) |
| content | TEXT | NOT NULL, max 5000 chars |
| createdAt | TEXT | NOT NULL, ISO 8601 |
| updatedAt | TEXT | NOT NULL, ISO 8601 |

**API endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/prompts/:id/comments | No | List comments for a prompt (nested/threaded) |
| POST | /api/prompts/:id/comments | Yes | Add a comment (include `parentId` for replies) |
| PUT | /api/prompts/:id/comments/:commentId | Yes | Edit own comment (owner or admin) |
| DELETE | /api/prompts/:id/comments/:commentId | Yes | Delete comment (owner or admin) |

**Threading approach:**
- Single level of nesting only (replies to top-level comments, no replies to replies). This keeps the UI simple and avoids deeply nested threads that are hard to follow.
- Comments returned as a flat list with `parentId`; frontend groups them for display.
- Comment count visible on prompt cards.

### Permissions

New permissions to add to the RBAC system:
- `prompts:comment` — create/edit own comments (granted to `user` and `admin` roles)
- `prompts:comment:delete` — delete any comment (granted to `admin` role only)
- `prompts:star` — star/unstar prompts (granted to `user` and `admin` roles)

## Consequences

### Positive
- **Engagement signals**: Star counts and comment activity surface prompt quality organically
- **Quick access**: Starred prompts reduce friction for returning users
- **Knowledge sharing**: Threaded comments let users share tips, variations, and gotchas
- **Lightweight**: Two new tables, no changes to existing tables (beyond optional cached counts)
- **Independent**: No coupling to readiness assessment or use case features

### Negative
- **Moderation**: Comments need moderation — admin delete capability addresses this but adds review burden
- **Notification gap**: No notification system yet; users won't know when someone replies to their comment (future consideration)
- **Single-level threading**: Some conversations may want deeper nesting; this is an intentional simplicity trade-off

### Mitigations
- Admin comment deletion provides basic moderation
- Comment count on prompt cards helps admins spot active discussions
- Single-level threading covers the vast majority of discussion patterns; deeper conversations can happen in top-level comments with @mentions as a convention
- Notifications can be added as a separate feature later without schema changes
