# AI Use Case & Prompt Library - Design System

## Design Philosophy

This app encourages teams to share how they use AI. The design should feel **warm, approachable, and human** -- like a well-organized workshop, not a sterile laboratory. We avoid generic AI aesthetics (blue-purple gradients, robot icons, circuit patterns) in favor of earthy, grounded tones that say "this is a practical tool made by real people."

---

## Color Palette

### Primary: Warm Coral (`#e85d3a`)
- **Usage**: Primary buttons, active navigation, key CTAs, links
- **Meaning**: Energy, creativity, action
- **Range**: 50-900 from light peach to deep terracotta

### Secondary: Amber (`#eca316`)
- **Usage**: Highlights, metric badges, star ratings, secondary actions
- **Meaning**: Value, achievement, warmth
- **Range**: 50-900 from cream to deep gold

### Neutral: Warm Grays (`#9e9688`)
- **Usage**: Text, backgrounds, borders, cards
- **Meaning**: Grounded, professional, calm
- **Key surfaces**:
  - `neutral-50` (#faf9f7): Page background
  - `neutral-100` (#f3f1ed): Secondary background, sidebar
  - `neutral-200` (#e8e4dd): Borders, dividers
  - `neutral-950` (#1f1d1a): Primary text, headings

### Semantic Colors

| Color    | Hex       | Usage                              |
|----------|-----------|------------------------------------|
| Success  | `#4a874e` | Saved metrics, active status, confirmations |
| Warning  | `#eaab08` | Pilot status, attention needed      |
| Error    | `#ec4343` | Form errors, destructive actions    |
| Info     | `#408388` | Tips, informational badges, help text |

### Color Usage Rules
1. **Never use primary-500 for large background areas** -- it's for accents and interactive elements only
2. **Text on colored backgrounds** must meet WCAG AA contrast (4.5:1 for body, 3:1 for large text)
3. **Semantic colors** should only be used for their intended meaning
4. **Neutral tones** are the foundation -- most of the interface should be neutral with color accents

---

## Typography

### Font Stack
- **Sans**: Inter (Google Fonts), falling back to system sans-serif
- **Mono**: JetBrains Mono (for prompt content, code snippets)

### Type Scale

| Name     | Size   | Weight   | Line Height | Usage                     |
|----------|--------|----------|-------------|---------------------------|
| Heading 1 | 36px  | Bold     | 1.25        | Page titles               |
| Heading 2 | 30px  | Semibold | 1.25        | Section titles            |
| Heading 3 | 24px  | Semibold | 1.375       | Card titles, subsections  |
| Heading 4 | 20px  | Semibold | 1.375       | Sidebar headings          |
| Body L   | 18px   | Normal   | 1.625       | Lead paragraphs           |
| Body     | 16px   | Normal   | 1.5         | Default body text         |
| Body S   | 14px   | Normal   | 1.5         | Metadata, secondary info  |
| Caption  | 12px   | Normal   | 1.5         | Timestamps, labels, tags  |

### Typography Rules
1. **Headings** use tight letter spacing (-0.025em), body text uses normal
2. **Captions** use slightly wide letter spacing (0.025em) for readability at small sizes
3. **Maximum line length**: ~70 characters for readability
4. **Prompt content** always uses the monospace font stack

---

## Spacing

Based on a **4px grid system**. All spacing values are multiples of 4px.

| Token     | Value  | Usage                        |
|-----------|--------|------------------------------|
| space-1   | 4px    | Tight internal padding       |
| space-2   | 8px    | Between related elements     |
| space-3   | 12px   | Standard element gap         |
| space-4   | 16px   | Card padding, form gaps      |
| space-6   | 24px   | Section padding              |
| space-8   | 32px   | Between major sections       |
| space-12  | 48px   | Page section spacing         |
| space-16  | 64px   | Large layout gaps            |

### Spacing Rules
1. **Card internal padding**: space-5 (20px) to space-6 (24px)
2. **Page margins**: space-6 on mobile, space-8 to space-12 on desktop
3. **Between cards in a grid**: space-4 (16px) to space-6 (24px)
4. **Form field spacing**: space-4 (16px) between fields
5. **Always use generous whitespace** -- when in doubt, add more space

---

## Border Radius

| Token      | Value | Usage                             |
|------------|-------|-----------------------------------|
| radius-sm  | 4px   | Badges, tags, small elements      |
| radius-md  | 8px   | Buttons, inputs, dropdowns        |
| radius-lg  | 12px  | Cards, modals, panels             |
| radius-xl  | 16px  | Large cards, hero sections        |
| radius-full| 9999px| Avatars, circular buttons, pills  |

### Radius Rules
1. **Buttons and inputs**: radius-md (8px) -- rounded but professional
2. **Cards**: radius-lg (12px) -- inviting without being bubbly
3. **Nested elements** should have slightly smaller radius than their parent

---

## Shadows

Shadows use warm-toned blacks (`rgb(31 29 26 / ...)`) instead of pure black for a softer feel.

| Token       | Usage                                     |
|-------------|-------------------------------------------|
| shadow-xs   | Subtle elevation (badges, chips)          |
| shadow-sm   | Default card elevation                    |
| shadow-md   | Elevated elements (dropdowns, popovers)   |
| shadow-lg   | Modals, floating elements                 |
| shadow-xl   | Toast notifications                       |
| shadow-primary | Primary button hover glow              |
| shadow-card-hover | Card hover lift effect              |

### Shadow Rules
1. **Cards at rest**: shadow-sm
2. **Cards on hover**: transition to shadow-card-hover with slight Y-axis lift
3. **Primary buttons on hover**: shadow-primary for a warm glow effect
4. **Never stack multiple shadows on one element** (except the defined composites)

---

## Transitions & Animation

### Duration Scale
| Token     | Value | Usage                        |
|-----------|-------|------------------------------|
| fast      | 100ms | Color changes, opacity       |
| base      | 200ms | Default for most transitions |
| slow      | 300ms | Layout shifts, transforms    |
| slower    | 500ms | Page transitions, reveals    |

### Easing Functions
| Name     | Value                          | Usage                    |
|----------|--------------------------------|--------------------------|
| ease-out | cubic-bezier(0, 0, 0.2, 1)    | Elements entering view   |
| ease-in  | cubic-bezier(0.4, 0, 1, 1)    | Elements leaving view    |
| ease-in-out | cubic-bezier(0.4, 0, 0.2, 1) | Default, hover states |
| bounce   | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful micro-interactions (star rating, badges) |

### Animation Principles
1. **Purposeful**: Every animation should communicate something (state change, feedback, hierarchy)
2. **Subtle**: Animations should be felt, not watched. Keep durations short.
3. **Consistent**: Same type of interaction = same animation
4. **Performant**: Only animate `transform` and `opacity` for smooth 60fps
5. **Respectful**: Honor `prefers-reduced-motion` -- disable non-essential animations

### Standard Interactions
- **Button hover**: Background color shift (200ms), primary buttons gain shadow-primary
- **Card hover**: Translate Y -2px + shadow-card-hover (200ms ease-in-out)
- **Form focus**: Border color transition to primary-500 (200ms)
- **Toast enter**: Slide in from right + fade in (300ms ease-out)
- **Toast exit**: Fade out (200ms ease-in)
- **Modal enter**: Fade in backdrop (200ms) + scale from 0.95 (300ms ease-out)
- **Star rating hover**: Scale 1.1 with bounce easing

---

## Component Visual Guidelines

### Navigation (Sidebar)
- Width: 256px (16rem), collapsible to 64px (4rem) on mobile
- Background: `neutral-100` (#f3f1ed)
- Active item: `primary-50` background with `primary-600` text and left border accent
- Hover: `neutral-200` background
- Icons: Lucide React, 20px, `neutral-600` default, `primary-500` when active

### Cards (Use Case & Prompt)
- Background: white (`bg-elevated`)
- Border: 1px `border-default`, radius-lg
- Padding: space-5 to space-6
- Hover: shadow-card-hover + translateY(-2px)
- **Use Case Card**: Title, 2-line description, impact/effort badges, department tag, status pill
- **Prompt Card**: Title, 1-line description, star rating, category badge, AI tool tag

### Badges & Tags
- **Impact/Effort badges**: Pill-shaped (radius-full), small text
  - High impact: `success-100` bg / `success-700` text
  - Medium impact: `secondary-100` bg / `secondary-700` text
  - Low impact: `neutral-200` bg / `neutral-700` text
- **Status pills**: Rounded, slightly larger
  - Idea: `info-100` bg / `info-700` text
  - Pilot: `warning-100` bg / `warning-700` text
  - Active: `success-100` bg / `success-700` text
  - Archived: `neutral-200` bg / `neutral-600` text
- **Category tags**: `neutral-100` bg, `neutral-700` text, radius-sm

### Buttons
- **Primary**: `primary-500` bg, white text, radius-md, hover: `primary-600` + shadow-primary
- **Secondary**: White bg, `neutral-300` border, `neutral-800` text, hover: `neutral-50` bg
- **Ghost**: Transparent bg, `neutral-700` text, hover: `neutral-100` bg
- **Danger**: `error-500` bg, white text, hover: `error-600`
- **All buttons**: height 40px (default), 36px (small), 48px (large), font-medium

### Form Inputs
- Height: 40px (default), 48px for textareas (auto-grow)
- Border: 1px `neutral-300`, radius-md
- Focus: `primary-500` border, `primary-100` ring (2px offset)
- Placeholder: `neutral-400` text
- Labels: `text-sm`, `font-medium`, `neutral-800`, space-1.5 margin bottom
- Error state: `error-500` border, `error-600` helper text below

### Star Rating
- Stars: Lucide `Star` icon, 20px
- Empty: `neutral-300` stroke
- Filled: `secondary-400` fill + stroke
- Hover: scale 1.1 with bounce easing
- Interactive click area: 28px for accessibility

### Charts (Recharts)
- Use the palette: primary-400, secondary-400, success-400, info-400
- Grid lines: `neutral-200`
- Axis labels: `neutral-500`, text-xs
- Tooltips: `neutral-950` bg, white text, radius-md, shadow-lg
- Bar charts: radius-sm on top corners

### Toast Notifications
- Position: bottom-right, 24px from edges
- Background: white, shadow-xl, radius-lg
- Left accent border: 4px colored stripe (success/error/warning/info)
- Auto-dismiss: 5 seconds
- Enter: slide from right (300ms)
- Exit: fade out (200ms)

---

## Responsive Breakpoints

| Name | Min Width | Usage                        |
|------|-----------|------------------------------|
| sm   | 640px     | Large phones                 |
| md   | 768px     | Tablets                      |
| lg   | 1024px    | Small desktops               |
| xl   | 1280px    | Standard desktops            |

### Responsive Behavior
- **< 768px**: Sidebar collapses to bottom tab bar or hamburger menu. Cards stack single column.
- **768-1024px**: Sidebar visible but narrower. Cards in 2-column grid.
- **> 1024px**: Full sidebar. Cards in 3-column grid. Dashboard shows full charts.

---

## Accessibility

1. **Color contrast**: All text meets WCAG AA (4.5:1 body, 3:1 large)
2. **Focus indicators**: Visible 2px outline using primary-500, 2px offset
3. **Touch targets**: Minimum 44x44px for mobile interactive elements
4. **Motion**: Wrap non-essential animations in `@media (prefers-reduced-motion: no-preference)`
5. **Semantic HTML**: Use proper heading hierarchy, landmark regions, ARIA labels
6. **Keyboard navigation**: All interactive elements reachable and operable via keyboard
