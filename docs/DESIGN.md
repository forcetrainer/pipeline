# Pipeline - Design System

## Design Philosophy

A **dark, techy, sci-fi** aesthetic built around void backgrounds, cyan accents, and glass surfaces. Inspired by nexus-ui component aesthetics. The interface communicates precision and capability — fitting for a platform that tracks AI adoption and automation initiatives.

---

## Color Palette

### Primary: Cyan (`#00d4ff`)
- **Usage**: Primary buttons, active navigation, key CTAs, links, focus rings
- **Meaning**: Technology, precision, signal
- **Variants**: dim (`#0d4f5c`), base (`#00d4ff`), bright (`#4df0ff`), glow, aura

### Secondary: Blue (`#3b82f6`)
- **Usage**: Secondary accents, supporting information
- **Variants**: dim (`#1a3a5c`), base (`#3b82f6`), bright (`#60a5fa`)

### Accent: Violet (`#a855f7`)
- **Usage**: Special highlights, revenue indicators (purple `#a78bfa`)
- **Variants**: dim (`#3b1a5c`), base (`#a855f7`), bright (`#c084fc`)

### Backgrounds: Void Scale
Dark backgrounds progressing from pure black to dark panel surfaces:

| Token | Hex | Usage |
|-------|-----|-------|
| `--nx-void-pure` | `#000000` | Deepest background |
| `--nx-void-deep` | `#030508` | Sidebar background |
| `--nx-void-base` | `#0a0e14` | Page background |
| `--nx-void-panel` | `#0d1117` | Card/panel background |
| `--nx-void-elevated` | `#161b22` | Elevated surfaces |
| `--nx-void-surface` | `#1c2128` | Highest surface |

### Glass Surfaces
Translucent panels with backdrop blur for layered depth:
- `--nx-glass-heavy`: 85% opacity (modal overlays)
- `--nx-glass-medium`: 75% opacity (floating panels)
- `--nx-glass-light`: 65% opacity (subtle overlays)
- `--nx-glass-subtle`: 45% opacity (hover states)

### Semantic Colors

| Color | Base Hex | Usage |
|-------|----------|-------|
| Green | `#00ff88` | Success states, approved status, positive metrics |
| Amber | `#ffaa00` | Warning states, pilot status, attention needed |
| Red | `#ff3366` | Error states, denied status, destructive actions |
| Cyan | `#00d4ff` | Info, primary accents, links |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--nx-text-primary` | `#e6edf3` | Headings, important text |
| `--nx-text-secondary` | `#d4dae0` | Body text |
| `--nx-text-tertiary` | `#bbc3cc` | Supporting text, labels |
| `--nx-text-ghost` | `#9ca5af` | Placeholders, disabled text |
| `--nx-text-on-primary` | `#ffffff` | Text on colored backgrounds |

### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-border-default` | `rgba(0, 212, 255, 0.15)` | Standard borders |
| `--color-border-subtle` | `rgba(255, 255, 255, 0.05)` | Dividers, separators |
| `--color-border-strong` | `rgba(0, 212, 255, 0.3)` | Active/focused borders |
| `--color-border-focus` | `#00d4ff` | Focus ring color |

### Color Usage Rules
1. **Cyan accents** for interactive elements and emphasis — not for large background fills
2. **Text contrast** must meet WCAG AA (4.5:1 body, 3:1 large text)
3. **Semantic colors** only for their intended meaning
4. **Void backgrounds** are the foundation — most surfaces are void-scale with cyan accents
5. Each color has a `glow` variant (60% opacity) and `aura` variant (15% opacity) for shadow/highlight effects

---

## Typography

### Font Stack
- **Sans** (`--font-sans`): Exo 2 — body text, form labels, navigation
- **Display** (`--font-display`): Orbitron — page titles, headings, brand text
- **Mono** (`--font-mono`): JetBrains Mono — prompt content, code snippets, metrics

### Type Scale (1.25 ratio)

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 12px | Timestamps, labels, badges |
| `--text-sm` | 14px | Metadata, secondary info, nav items |
| `--text-base` | 16px | Default body text |
| `--text-lg` | 18px | Lead paragraphs |
| `--text-xl` | 20px | Subsection headings |
| `--text-2xl` | 24px | Card titles |
| `--text-3xl` | 30px | Section titles |
| `--text-4xl` | 36px | Page titles |

### Typography Presets

| Class | Font | Size | Weight | Notes |
|-------|------|------|--------|-------|
| `.heading-1` | Orbitron | 4xl | Bold | Uppercase, wider tracking |
| `.heading-2` | Orbitron | 3xl | Semibold | Uppercase, wide tracking |
| `.heading-3` | Orbitron | 2xl | Semibold | Wide tracking |
| `.heading-4` | Exo 2 | xl | Semibold | Standard tracking |
| `.body-large` | Exo 2 | lg | Normal | Secondary color |
| `.body-base` | Exo 2 | base | Normal | Secondary color |
| `.body-small` | Exo 2 | sm | Normal | Tertiary color |
| `.caption` | Exo 2 | xs | Normal | Uppercase, widest tracking |

### Typography Rules
1. **Headings** use Orbitron with wide letter spacing (0.05em)
2. **Captions** use widest letter spacing (0.1em) and uppercase
3. **Maximum line length**: ~70 characters for readability
4. **Prompt content** always uses JetBrains Mono

---

## Spacing

Based on a **4px grid system** (`--space-*` tokens).

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight internal padding |
| space-2 | 8px | Between related elements |
| space-3 | 12px | Standard element gap |
| space-4 | 16px | Card padding, form gaps |
| space-6 | 24px | Section padding |
| space-8 | 32px | Between major sections |
| space-12 | 48px | Page section spacing |
| space-16 | 64px | Large layout gaps |

### Layout Constants
- **Sidebar width**: 256px (`--sidebar-width`)
- **Sidebar collapsed**: 64px (`--sidebar-collapsed`)
- **Navbar height**: 64px (`--navbar-height`)
- **Content max width**: 1152px (`--content-max-width`)

### Spacing Rules
1. **Card internal padding**: space-5 (20px) to space-6 (24px)
2. **Page margins**: space-6 on mobile, space-8 to space-12 on desktop
3. **Between cards in a grid**: space-4 (16px) to space-6 (24px)
4. **Form field spacing**: space-4 (16px) between fields

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, tags, small elements |
| `--radius-md` | 8px | Buttons, inputs, dropdowns |
| `--radius-lg` | 12px | Cards, modals, panels |
| `--radius-xl` | 16px | Large cards, hero sections |
| `--radius-2xl` | 24px | Feature panels |
| `--radius-full` | 9999px | Avatars, circular buttons, pills |

---

## Shadows & Glows

Shadows use pure black with varying opacity (dark environment). Accent glows use cyan for interactive feedback.

### Depth Shadows

| Token | Usage |
|-------|-------|
| `--shadow-xs` | Subtle elevation (badges, chips) |
| `--shadow-sm` | Default card elevation |
| `--shadow-md` | Elevated elements (dropdowns, popovers) |
| `--shadow-lg` | Modals, floating elements |
| `--shadow-xl` | Toast notifications |

### Glow Shadows

| Token | Usage |
|-------|-------|
| `--shadow-primary` | Cyan glow on primary button hover |
| `--shadow-card-hover` | Card hover glow + depth |
| `--nx-glow-cyan` | Cyan glow for active/focused elements |
| `--nx-glow-green` | Success state glow |
| `--nx-glow-amber` | Warning state glow |
| `--nx-glow-red` | Error state glow |

### Shadow Rules
1. **Cards at rest**: shadow-sm
2. **Cards on hover**: shadow-card-hover with cyan glow
3. **Primary buttons on hover**: shadow-primary for cyan glow
4. **Glass panels**: use `backdropFilter: blur(8px)` with `--nx-glass-medium` background

---

## Transitions & Animation

### Duration Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Color changes, opacity |
| `--duration-base` | 200ms | Default for most transitions |
| `--duration-slow` | 300ms | Layout shifts, transforms |
| `--duration-slower` | 500ms | Page transitions, reveals |

### Easing Functions
| Token | Usage |
|-------|-------|
| `--ease-out` | Elements entering view |
| `--ease-in` | Elements leaving view |
| `--ease-in-out` | Default, hover states |
| `--ease-bounce` | Playful micro-interactions (star toggle, badges) |

### Keyframe Animations
- `nx-pulse`: Soft opacity pulsing
- `nx-glow-pulse`: Cyan glow intensity breathing
- `nx-shimmer`: Loading highlight sweep
- `nx-float`: Gentle vertical hover
- `nx-flicker`: Subtle opacity flicker

### Animation Principles
1. **Purposeful**: Every animation communicates state change or feedback
2. **Subtle**: Short durations, felt not watched
3. **Performant**: Only animate `transform` and `opacity` for 60fps
4. **Respectful**: Honor `prefers-reduced-motion` via CSS media query

---

## Component Visual Guidelines

### Navigation (Sidebar)
- Width: 256px, collapsible on mobile
- Background: `--nx-void-deep`
- Active item: `--nx-cyan-aura` background with `--nx-cyan-base` text and 3px left border
- Brand: Orbitron font with cyan text-shadow glow
- Icons: Lucide React, 20px

### Cards (Use Case & Prompt)
- Background: `--nx-void-panel`
- Border: 1px `--color-border-default` (cyan 15% opacity)
- Padding: space-5 to space-6
- Hover: shadow-card-hover with cyan glow
- Glass variant: `--nx-glass-medium` background with `backdropFilter: blur(8px)`

### Badges & Status
- **Status pills**: Rounded, colored backgrounds
  - Approved: green aura background, green text
  - Pending: amber aura background, amber text
  - Denied: red aura background, red text
  - Draft: neutral background, ghost text
- **Impact/Effort badges**: Pill-shaped (radius-full)
- **Category tags**: Neutral background with subtle border

### Buttons
- **Primary**: Cyan background, dark text, hover: cyan glow shadow
- **Secondary**: Void background, cyan border, cyan text, hover: cyan aura
- **Ghost**: Transparent, secondary text, hover: void-elevated background
- **Danger**: Red background, white text, hover: red glow

### Form Inputs
- Background: `--nx-void-panel`
- Border: 1px `--color-border-default`
- Focus: cyan border with glow shadow
- Dollar inputs: `type="text"` + `inputMode="decimal"` with regex filtering
- Comma formatting on blur for numeric values

### Charts (Recharts)
- Palette: cyan, green, amber, blue, violet
- Grid lines: subtle (10% opacity)
- Axis labels: tertiary text color
- Tooltips: void-panel background with cyan border

### Toast Notifications
- Position: bottom-right
- Background: void-panel, shadow-xl
- Left accent border: 4px colored stripe (success/error/warning/info)
- Enter: slide from right (300ms)
- Exit: fade out (200ms)

---

## Responsive Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small desktops (sidebar visible) |
| xl | 1280px | Standard desktops |

### Responsive Behavior
- **< 1024px**: Sidebar collapses to hamburger menu with overlay
- **>= 1024px**: Full sidebar always visible
- Cards use responsive grid columns

---

## Accessibility

1. **Color contrast**: All text meets WCAG AA (4.5:1 body, 3:1 large)
2. **Focus indicators**: 2px cyan outline with glow shadow, 2px offset (`.focus-ring`)
3. **Touch targets**: Minimum 44x44px for mobile interactive elements
4. **Motion**: Non-essential animations disabled via `@media (prefers-reduced-motion: reduce)`
5. **Semantic HTML**: Proper heading hierarchy, landmark regions, ARIA labels
6. **Keyboard navigation**: All interactive elements reachable and operable via keyboard
