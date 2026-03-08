# ADR-008: Use Case Cost Tracking & Assessment Integration

## Status

Accepted

## Context

Use cases currently track savings (time and money) but not costs. Without cost data, true ROI is impossible to calculate — a use case that saves $10,000/year but costs $12,000/year to run is a net loss, not a win.

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

### Enhanced ROI Calculations

The existing metrics calculator will be extended to include cost-aware calculations:

| Metric | Formula |
|--------|---------|
| Gross annual savings | (existing) from metrics projections |
| Net annual savings | Gross annual savings − totalAnnualRecurring |
| Total investment | totalOneTime |
| Monthly net benefit | Monthly savings − totalMonthlyRecurring |
| Payback period (months) | totalOneTime ÷ monthly net benefit |
| First-year ROI | ((Net annual savings − totalOneTime) ÷ totalOneTime) × 100 |
| Ongoing ROI | (Net annual savings ÷ totalAnnualRecurring) × 100 |

When `actualCosts` is null, the dashboard falls back to showing gross savings only (current behavior). No data is lost or hidden.

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

**Use case form** — new "Cost Tracking" section (collapsible, optional):
- Input fields for each cost category
- Auto-calculated totals
- If created from assessment, shows estimated costs for comparison

**Use case detail page** — new "ROI Summary" panel:
- Net annual savings, payback period, first-year ROI
- If linked to assessment: estimated vs. actual cost comparison
- Link to originating assessment (if applicable)

**Dashboard** — enhanced metrics:
- Total net savings across all use cases (not just gross)
- Average payback period
- ROI distribution
- Estimated vs. actual cost variance (for promoted assessments)

### Migration Strategy

This is an additive change — two new nullable columns on `use_cases`:
- `actual_costs` (TEXT, nullable)
- `assessment_id` (TEXT, nullable, FK → assessments.id)

No data migration needed. Existing use cases continue to work with null values in both fields. The frontend gracefully handles missing cost data by showing gross savings only.

**Migration dependency**: The `assessments` table (ADR-007) must be created before the `assessment_id` foreign key can reference it. The migration should create the assessments table and assessment_checkpoints table first, then alter use_cases.

## Consequences

### Positive
- **True ROI**: Cost tracking enables net savings, payback period, and ROI calculations — the metrics executives actually need
- **Estimate vs. actual**: Promoted assessments create a feedback loop showing how accurate cost estimates were
- **Backward compatible**: All new fields are nullable; existing data and workflows are unaffected
- **Shared structure**: Same `CostTracking` type used in assessments and use cases reduces cognitive overhead
- **Reporting**: Cost data unlocks portfolio-level reporting (total investment, aggregate ROI, cost efficiency trends)

### Negative
- **User effort**: Cost data adds fields to the use case form — users may not know or want to fill them in
- **Estimation accuracy**: Estimated costs in assessments will often be rough guesses, especially for recurring costs
- **JSON storage**: Cost data as JSON means it can't be queried directly in SQL without JSON functions

### Mitigations
- Cost section is collapsible and clearly optional — the form doesn't feel heavier unless the user expands it
- Cost fields include placeholder text with examples to guide estimation
- SQLite supports `json_extract()` for reporting queries if needed; the repository pattern can abstract this
- Dashboard gracefully degrades: shows gross savings when costs are absent, net savings when present
