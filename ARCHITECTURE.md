# AI Use Case & Prompt Library - Architecture

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | React 18 + TypeScript | Industry standard, strong ecosystem, type safety |
| **Build Tool** | Vite 5 | Fast HMR, minimal config, excellent DX |
| **Styling** | Tailwind CSS 3 | Utility-first, rapid prototyping, consistent design |
| **Routing** | React Router v6 | Standard React routing, nested routes support |
| **Data Persistence** | localStorage + JSON | No server required, runs entirely locally |
| **Charts** | Recharts | React-native charting, lightweight, composable |
| **Icons** | Lucide React | Tree-shakable, clean design, MIT licensed |
| **ID Generation** | uuid (v4) | Unique IDs for use cases and prompts |
| **Date Handling** | date-fns | Lightweight, tree-shakable date utilities |
| **Search** | Fuse.js | Client-side fuzzy search, zero config |

## Project Structure

```
ai-usecase-app/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # App shell, nav, sidebar
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/              # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Tag.tsx
│   │   ├── use-cases/       # Use case specific components
│   │   │   ├── UseCaseForm.tsx
│   │   │   ├── UseCaseCard.tsx
│   │   │   └── UseCaseList.tsx
│   │   ├── prompts/         # Prompt library components
│   │   │   ├── PromptForm.tsx
│   │   │   ├── PromptCard.tsx
│   │   │   └── PromptList.tsx
│   │   └── dashboard/       # Dashboard & visualization
│   │       ├── StatsOverview.tsx
│   │       └── Charts.tsx
│   ├── pages/               # Route-level page components
│   │   ├── DashboardPage.tsx
│   │   ├── UseCasesPage.tsx
│   │   ├── UseCaseDetailPage.tsx
│   │   ├── NewUseCasePage.tsx
│   │   ├── PromptsPage.tsx
│   │   ├── PromptDetailPage.tsx
│   │   └── NewPromptPage.tsx
│   ├── services/            # Data access layer
│   │   ├── storage.ts       # localStorage wrapper with type safety
│   │   ├── useCaseService.ts
│   │   └── promptService.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useUseCases.ts
│   │   ├── usePrompts.ts
│   │   └── useSearch.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── helpers.ts
│   ├── data/                # Seed data / sample data
│   │   └── seed.ts
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles + Tailwind directives
├── ARCHITECTURE.md
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

## Data Models

### UseCase
```typescript
interface UseCase {
  id: string;              // UUID v4
  title: string;           // Short descriptive title
  description: string;     // Detailed description of the use case
  category: string;        // e.g., "Content Creation", "Code Review", "Data Analysis"
  aiTool: string;          // e.g., "ChatGPT", "Claude", "Copilot"
  department: string;      // e.g., "Engineering", "Marketing", "Sales"
  impact: 'low' | 'medium' | 'high';  // Business impact level
  effort: 'low' | 'medium' | 'high';  // Implementation effort
  status: 'idea' | 'pilot' | 'active' | 'archived';
  tags: string[];
  submittedBy: string;     // Name of the person
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}
```

### Prompt
```typescript
interface Prompt {
  id: string;              // UUID v4
  title: string;           // Short descriptive title
  content: string;         // The actual prompt text
  description: string;     // What this prompt does / when to use it
  category: string;        // e.g., "Writing", "Coding", "Analysis"
  aiTool: string;          // Which AI tool this is for
  useCaseId?: string;      // Optional link to a use case
  tags: string[];
  submittedBy: string;
  rating: number;          // 1-5 average rating
  ratingCount: number;     // Number of ratings
  createdAt: string;
  updatedAt: string;
}
```

## Data Persistence Strategy

All data stored in `localStorage` with these keys:
- `ai-usecase-app:usecases` - Array of UseCase objects
- `ai-usecase-app:prompts` - Array of Prompt objects

The storage service provides:
- **CRUD operations** for both data types
- **Type-safe** get/set with JSON serialization
- **Seed data** loading on first run
- **Export/Import** as JSON files for backup/sharing

## Routing

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Overview stats, recent items, charts |
| `/use-cases` | Use Cases List | Browse, search, filter use cases |
| `/use-cases/new` | New Use Case | Form to submit a use case |
| `/use-cases/:id` | Use Case Detail | View full use case details |
| `/prompts` | Prompt Library | Browse, search, filter prompts |
| `/prompts/new` | New Prompt | Form to submit a prompt |
| `/prompts/:id` | Prompt Detail | View full prompt details |

## Design Principles

1. **Local-first**: Everything runs in the browser, no server needed
2. **Type-safe**: Full TypeScript coverage for data models and services
3. **Component-driven**: Small, reusable components composed into pages
4. **Responsive**: Works on desktop and tablet (Tailwind responsive utilities)
5. **Accessible**: Semantic HTML, keyboard navigation, ARIA labels
