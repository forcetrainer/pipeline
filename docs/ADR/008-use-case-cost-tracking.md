# ADR-008: Use Case Cost Tracking, Revenue, & Assessment Integration

## Status

Implemented

## Context

Use cases currently track savings (time and money) but not costs or revenue. Without cost data, true ROI is impossible to calculate — a use case that saves $10,000/year but costs $12,000/year to run is a net loss, not a win. Similarly, some automations generate revenue (e.g., personalized sales outreach increasing conversion), and that value needs to be captured alongside savings.

Additionally, the new readiness assessment feature (ADR-007) introduces a promotion pathway where assessments can become use cases. Use cases need a lightweight integration point for this: a reference back to the originating assessment and cost fields that match the assessment's estimated costs.

## Decision

### Cost Tracking on Use Cases

Add an `actualCosts` JSON field to the `use_cases` table. This uses the same cost structure as the assessment's `estimatedCosts` (defined in ADR-007), enabling direct comparison between what was estimated and what was actually spent.

**Schema change: `use_cases` table**
| Column | Type | Constraints |
|--------|------|-------------|
| actualCosts | TEXT | NULLABLE, JSON (same CostTracking structure as ADR-007) |
| assessmentId | TEXT | FK → assessments.id, NULLABLE |

`actualCosts` is nullable because:
- Existing use cases don't have cost data (backward compatible)
- Some use cases may genuinely have zero cost (e.g., using free-tier tools)
- Cost data can be added after initial submission

`assessmentId` is nullable because:
- Most existing use cases weren't created from assessments
- Creating a use case directly (without an assessment) remains a valid path

### Cost Structure

```typescript
interface CostTracking {
  // One-time costs
  buildCostInternal: number;       // Internal labor hours × rate
  buildCostExternal: number;       // Vendor/contractor costs
  licensingOneTime: number;        // One-time license fees

  // Recurring costs (monthly)
  licensingRecurring: number;      // Monthly subscription/license costs
  computeRecurring: number;        // API calls, compute, hosting
  maintenanceRecurring: number;    // Ongoing maintenance labor

  // Calculated
  totalOneTime: number;
  totalMonthlyRecurring: number;
  totalAnnualRecurring: number;

  // Optional context
  notes: string;
}
```

### Revenue Per Use

The metrics model now captures revenue generated per use alongside time and money saved. This recognizes that some automations don't just save — they earn.

**New fields on `UseCaseMetrics`:**
- `revenuePerUse: number` — dollar revenue generated each time the automation runs
- `dailyRevenue`, `weeklyRevenue`, `monthlyRevenue`, `annualRevenue` — projected revenue at each horizon (calculated same way as savings projections)

Revenue is optional — defaults to 0 and the revenue row is hidden in the UI when zero. Most use cases will only have savings; revenue is for cases like AI-driven sales outreach, automated upsells, or lead generation.

### Enhanced ROI Calculations

The metrics calculator includes cost-aware and revenue-aware calculations:

| Metric | Formula |
|--------|---------|
| Gross annual savings | From savings projections (time + money) |
| Annual revenue | From revenue projections |
| **Gross annual value** | **Gross annual savings + annual revenue** |
| **Net annual value** | **Gross annual value − totalAnnualRecurring** |
| Total investment | totalOneTime |
| Monthly net benefit | (Monthly savings + monthly revenue) − totalMonthlyRecurring |
| Payback period (months) | totalOneTime ÷ monthly net benefit |
| First-year ROI | ((Net annual value − totalOneTime) ÷ totalOneTime) × 100 |
| Ongoing ROI | (Net annual value ÷ totalAnnualRecurring) × 100 |

When `actualCosts` is null, the dashboard falls back to showing gross savings only (current behavior). No data is lost or hidden.

**Scoring**: Revenue factors into the value score alongside savings:
```
dollarValuePerUse = (timeSavedMinutes × $50/hr) + moneySavedPerUse + revenuePerUse
```

### Assessment Integration

When a readiness assessment is promoted to a use case (per ADR-007):
1. The new use case's `assessmentId` is set, linking back to the originating assessment
2. `estimatedCosts` from the assessment pre-fill the use case form's cost section as a starting point
3. The user can adjust costs to reflect actuals vs. estimates
4. The assessment detail page shows the linked use case (if promoted)
5. Dashboard reporting can show estimated vs. actual cost variance

This is a **one-directional, optional link**. Use cases do not require assessments. Assessments do not require promotion.

### API Changes

No new endpoints needed. Existing endpoints are extended:

- `POST /api/use-cases` — accepts optional `actualCosts` and `assessmentId` fields
- `PUT /api/use-cases/:id` — can update `actualCosts`
- `GET /api/use-cases/:id` — returns `actualCosts` and `assessmentId` (both nullable)
- `GET /api/use-cases` — no filter changes needed initially; cost-based filtering can be added later if needed

### Frontend Changes

**Use case form** — "Per-Use Value" section (3 columns):
- Time saved per use (with min/hrs toggle)
- Money saved per use (dollar input with comma formatting)
- Revenue generated per use (dollar input with comma formatting)
- All dollar inputs use `type="text"` + `inputMode="decimal"` with regex filtering (no browser spinners)

**Use case form** — "Cost Tracking" section (collapsible, optional):
- Input fields for each cost category
- Auto-calculated totals
- If created from assessment, shows estimated costs for comparison

**Projected Impact grid** (form and detail page):
- Time row (green) — daily through annual
- Money row (amber) — daily through annual
- Revenue row (purple, `#a78bfa`) — daily through annual, hidden when zero

**Use case detail page** — "Cost & ROI" panel:
- Row 1: One-time investment, monthly recurring, annual recurring (red)
- Row 2: Net annual value (or "Net annual savings" when no revenue), payback period, first-year ROI, ongoing ROI
- When revenue exists: breakdown math shown below net value (savings + revenue − costs)
- Expandable cost detail with all line items and notes

**Dashboard** — enhanced metrics:
- Total net savings across all use cases (not just gross)
- Average payback period
- ROI distribution
- Estimated vs. actual cost variance (for promoted assessments)

### Migration Strategy

This is an additive change — two new nullable columns on `use_cases`:
- `actual_costs` (TEXT, nullable)
- `assessment_id` (TEXT, nullable, FK → assessments.id)

Revenue fields are stored within the existing `metrics` JSON column — no schema migration needed for revenue. Existing metrics JSON without `revenuePerUse` gracefully defaults to 0 via `metrics.revenuePerUse || 0` in the frontend.

**Migration dependency**: The `assessments` table (ADR-007) must be created before the `assessment_id` foreign key can reference it. The migration should create the assessments table and assessment_checkpoints table first, then alter use_cases.

## Implementation Notes

### Input formatting
- Dollar inputs use `type="text"` with `inputMode="decimal"` to avoid browser number spinners
- Regex filtering: `e.target.value.replace(/[^0-9.]/g, '')` with single decimal enforcement
- Comma formatting on blur, raw value on focus for editing
- `formatMoney` scales: `$1,234` → `$12.5K` → `$1.2M`
- `formatTime` scales: `45m` → `2h 30m` → `2,600 hrs` → `48.8K hrs`
- ROI percentages use `.toLocaleString()` for comma formatting

### Color coding
- Time: green (`var(--nx-green-base)`)
- Money saved: amber (`var(--nx-amber-base)`)
- Revenue: purple (`#a78bfa`)
- Costs: red (`#ff6b6b`)
- Net value: green when positive, red when negative
- Payback: green < 12mo, amber 12-24mo, red > 24mo or N/A

### Files changed
- `src/types/index.ts` — `revenuePerUse` + revenue projections on `UseCaseMetrics`
- `src/utils/metricsCalculator.ts` — `calculateMetrics`, `calculateScore`, `calculateROI`, `ROISummary`
- `src/components/use-cases/MetricsCalculator.tsx` — 3-column per-use inputs, revenue projection row
- `src/components/use-cases/CostTracker.tsx` — collapsible cost input form
- `src/pages/UseCaseDetailPage.tsx` — `MetricsBreakdown` revenue row, `CostAndROIPanel` with revenue math
- `src/pages/NewUseCasePage.tsx` — initial metrics with `revenuePerUse: 0`
- `server/src/db/schema.ts` — `actualCosts` and `assessmentId` columns
- `server/src/routes/useCases.ts` — JSON serialization for costs on create/update/read
- `server/src/db/seed.ts` — cost data on all 8 use cases, revenue on Sales Email Personalization ($75/use)
- `server/drizzle/0002_free_supernaut.sql` — migration for new columns

## Consequences

### Positive
- **True ROI**: Cost tracking enables net savings, payback period, and ROI calculations — the metrics executives actually need
- **Revenue capture**: Automations that generate money are properly valued, not just those that save money
- **Combined value**: Gross Annual Value = savings + revenue gives a complete picture for ROI and payback calculations
- **Estimate vs. actual**: Promoted assessments create a feedback loop showing how accurate cost estimates were
- **Backward compatible**: All new fields are nullable or default to 0; existing data and workflows are unaffected
- **Shared structure**: Same `CostTracking` type used in assessments and use cases reduces cognitive overhead
- **Reporting**: Cost + revenue data unlocks portfolio-level reporting (total investment, aggregate ROI, cost efficiency trends)

### Negative
- **User effort**: Cost data adds fields to the use case form — users may not know or want to fill them in
- **Estimation accuracy**: Estimated costs in assessments will often be rough guesses, especially for recurring costs
- **JSON storage**: Cost data as JSON means it can't be queried directly in SQL without JSON functions
- **Revenue rarity**: Most IT use cases won't have revenue, so the field is often zero — but when it applies, it's significant

### Mitigations
- Cost section is collapsible and clearly optional — the form doesn't feel heavier unless the user expands it
- Revenue input is always visible but unobtrusive (third column in per-use row)
- Revenue row hidden in projections grid when zero — no visual noise for savings-only use cases
- Cost fields include placeholder text with examples to guide estimation
- SQLite supports `json_extract()` for reporting queries if needed; the repository pattern can abstract this
- Dashboard gracefully degrades: shows gross savings when costs are absent, net value when present
