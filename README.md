# AI Use Case & Prompt Library

A React web application for logging and sharing AI use cases and prompts within an organization. Track time and money saved, share effective prompts, and visualize AI adoption across departments -- all running locally with no cloud dependencies.

## Key Pages

- **Dashboard** (`/`) -- At-a-glance overview with total use cases, prompts submitted, time saved, and money saved. Includes charts for trends over time and breakdowns by category and department.
- **Use Case Browser** (`/use-cases`) -- Searchable, filterable list of all submitted use cases. Filter by category, department, AI tool, or status. Sort by date, impact, or savings.
- **Submit Use Case** (`/use-cases/new`) -- Form to log a new AI use case including title, description, category, department, AI tool used, time/money saved, impact level, effort level, and status.
- **Prompt Browser** (`/prompts`) -- Browse and search shared prompts. Filter by category and sort by rating or effectiveness.
- **Submit Prompt** (`/prompts/new`) -- Form to share a new prompt with the team, including the prompt text, category, tips for use, and effectiveness score.
- **Detail Pages** (`/use-cases/:id`, `/prompts/:id`) -- Full view of a single use case or prompt with all details and metrics.

## Getting Started

### Prerequisites

- Node.js 18+

### Install and Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Features

- **Use Case Logger** -- Submit, browse, search, and filter AI use cases with metrics (time and money saved), categories, departments, impact/effort levels, and status tracking.
- **Prompt Library** -- Share and discover AI prompts with ratings, effectiveness scores, categories, usage tips, and copy-to-clipboard.
- **Dashboard** -- Overview stats, charts showing time and money saved over time, category breakdowns, and department usage.
- **Search & Filtering** -- Full-text fuzzy search, filters by category, department, status, and AI tool, with sorting by multiple fields.
- **Responsive Design** -- Mobile-friendly sidebar with hamburger menu, responsive card grids, and page transition animations.
- **Warm Design System** -- Coral/amber color palette with earthy warm grays, accessible focus states, toast notifications, and reduced motion support.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v7 |
| Charts | Recharts |
| Search | Fuse.js |
| Icons | Lucide React |
| IDs | uuid |
| Dates | date-fns |

## Project Structure

```
src/
  App.tsx                        # Root component with routing and seed data initialization
  main.tsx                       # Application entry point
  index.css                      # Tailwind CSS v4 imports and theme configuration
  components/
    layout/
      AppLayout.tsx              # Main layout with sidebar and content area
      Sidebar.tsx                # Navigation sidebar with mobile hamburger menu
    ui/                          # Shared UI component library
      Button.tsx                 # Button (primary, secondary, ghost, danger variants)
      Card.tsx                   # Card with optional hover effects
      Input.tsx                  # Text input with label, error, helper text
      Textarea.tsx               # Textarea with validation
      Select.tsx                 # Select dropdown with custom styling
      Badge.tsx                  # Color-coded status badges
      Tag.tsx                    # Removable tag chips
      Modal.tsx                  # Dialog modal (native dialog element)
      StarRating.tsx             # Interactive star rating
      SearchBar.tsx              # Search input with icon
      EmptyState.tsx             # Empty state with icon and action
      Toast.tsx / ToastContainer.tsx  # Toast notification system
    use-cases/                   # Use case-specific components
    prompts/                     # Prompt-specific components
    dashboard/                   # Dashboard charts and stats
  pages/                         # Route-level page components (7 pages)
  hooks/
    useSearch.ts                 # Fuse.js fuzzy search hook
    useUseCases.ts               # Use case state management
    usePrompts.ts                # Prompt state management
  services/
    storage.ts                   # localStorage CRUD abstraction
    useCaseService.ts            # Use case business logic and filtering
    promptService.ts             # Prompt business logic, filtering, and rating
  data/
    seed.ts                      # Demo seed data (8 use cases, 8 prompts)
  types/
    index.ts                     # TypeScript interfaces, types, and constants
  styles/
    design-system.css            # CSS custom properties and base styles
    tailwind-extend.ts           # Tailwind theme extension values
```

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/use-cases` | Browse use cases |
| `/use-cases/new` | Submit new use case |
| `/use-cases/:id` | Use case details |
| `/prompts` | Browse prompts |
| `/prompts/new` | Submit new prompt |
| `/prompts/:id` | Prompt details |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Usage Guide

1. **Start the app** -- Run `npm install && npm run dev` and open `http://localhost:5173`.
2. **Explore the dashboard** -- The home page shows aggregate stats and charts. Sample seed data is loaded on first run.
3. **Log a use case** -- Navigate to Use Cases and click "New Use Case." Fill in details about how you used AI, the tool you used, and the time or money saved.
4. **Share a prompt** -- Navigate to Prompts and click "New Prompt." Paste your prompt text, add a category and tips, then submit.
5. **Browse and search** -- Use the search bar for fuzzy full-text search. Apply filters (category, department, status, AI tool) to narrow results. Click any item to see its full details.
6. **Copy prompts** -- On any prompt detail page, use the copy button to copy the prompt text to your clipboard.

## How It Works

All data is persisted in the browser's **localStorage**. There is no backend or database -- the app runs entirely in the browser.

On first launch, sample seed data is loaded automatically so the app is not empty. You can add, edit, and browse use cases and prompts from there. Clearing localStorage will reset the app to the initial seed data.
