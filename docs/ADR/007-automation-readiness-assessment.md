# ADR-007: Automation Readiness Assessment

## Status

Implemented

## Context

Users have ideas for automation and AI but no structured way to evaluate whether an idea is ready for implementation. Currently, the only path is to create a use case — but use cases represent completed implementations, not ideas under evaluation.

We need a lightweight self-assessment tool that lets users:
1. Log an idea for automation or AI
2. Evaluate it against five structured checkpoints
3. Estimate the potential impact and cost
4. Decide whether to proceed — and if so, promote it to a use case

This is explicitly **not** a formal review or approval process. It's a self-check that helps users think through their idea before investing time in building it. It also gives leadership visibility into the pipeline of ideas being explored across teams.

Critically, many users evaluating automation ideas will not be deeply technical. The assessment must **guide users through the process** — not just present a form to fill out. Each checkpoint should explain what it is, why it matters, and walk the user through evaluation with plain-language explanations, examples, and contextual help. This is a teaching tool as much as an evaluation tool.

## Decision

### The Assessment Model

An assessment is an idea with estimated metrics and five evaluation checkpoints. It is owned by the user who creates it and can be in one of four statuses: `draft`, `in_progress`, `completed`, or `promoted` (promoted to a use case).

**New table: `assessments`**
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK, UUID |
| title | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| category | TEXT | NOT NULL (same enum as use cases) |
| aiTool | TEXT | NOT NULL (same enum as use cases) |
| department | TEXT | NOT NULL (same enum as use cases) |
| status | TEXT | NOT NULL, default 'draft' |
| tags | TEXT | NOT NULL, JSON array |
| estimatedMetrics | TEXT | NOT NULL, JSON (same structure as use case metrics) |
| estimatedCosts | TEXT | NOT NULL, JSON (see cost model below) |
| submittedBy | TEXT | NOT NULL |
| submitterTeam | TEXT | NOT NULL |
| submittedById | TEXT | FK → users.id, NOT NULL |
| promotedToUseCaseId | TEXT | FK → use_cases.id, NULLABLE |
| createdAt | TEXT | NOT NULL, ISO 8601 |
| updatedAt | TEXT | NOT NULL, ISO 8601 |

### The Five Checkpoints

Each checkpoint is a structured evaluation, not free text. Users assess their idea against each checkpoint, providing a status, score, and notes. This structure makes assessments comparable and dashboardable.

**New table: `assessment_checkpoints`**
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PK, UUID |
| assessmentId | TEXT | FK → assessments.id, NOT NULL, CASCADE delete |
| checkpoint | TEXT | NOT NULL (enum, see below) |
| status | TEXT | NOT NULL, default 'not_started' |
| score | INTEGER | NULLABLE, 1-5 |
| notes | TEXT | NOT NULL, default '' |
| updatedAt | TEXT | NOT NULL, ISO 8601 |

- Unique constraint on `(assessmentId, checkpoint)`
- Status enum: `not_started`, `pass`, `concern`, `fail`

**The five checkpoints:**

Each checkpoint below defines its purpose, scoring rubric, and guided experience. The scoring rubric is consistent across all checkpoints (1-5 scale) but the criteria are specific to each checkpoint's domain.

#### 1. Documentation & Measurement (`documentation`)

**Purpose**: Does the process have documentation? Are there existing measurements (time, cost, error rates)? Without baseline measurements, you can't prove automation improved anything.

**Guided experience**:
- **Introduction panel**: Explains why documentation matters in plain language. Example: *"Before you automate something, you need to understand how it works today. Think of it like getting directions — you need to know where you're starting from, not just where you want to go."*
- **Walk-through prompts**: Each guiding question is presented one at a time with an explanation of what "good" looks like and examples.

**Guiding questions** (presented sequentially):
- Is the current process documented? *(Even informal notes count. If only one person knows how it works, that's a risk.)*
- Do you have baseline metrics — time per task, error rate, cost? *(You don't need exact numbers. Rough estimates like "about 20 minutes per report" are a fine starting point.)*
- Can you measure the output quality of the automated version? *(How will you know if the automation is doing a good job? What does "correct" look like?)*

**Scoring rubric (1-5)**:
| Score | Criteria |
|-------|----------|
| 1 | No documentation exists. No one has measured how the process performs today. |
| 2 | Informal/tribal knowledge only. Someone could describe it verbally but nothing is written down. No metrics. |
| 3 | Basic documentation exists. Some metrics are available but incomplete (e.g., you know time but not error rate). |
| 4 | Process is well-documented. Baseline metrics exist for the key dimensions (time, quality, cost). |
| 5 | Comprehensive documentation with detailed baseline measurements. Clear definition of what "success" looks like for the automated version. |

#### 2. The Squint Check (`squint_check`)

**Purpose**: Borrowed from "Extreme Presentations" — step back and look at the process from a distance. If it looks complex without knowing the details, it probably is. Complex processes need to be simplified before they're automated, or you're just automating chaos.

**Guided experience**:
- **Introduction panel**: *"Imagine drawing this process on a whiteboard for someone who's never seen it. If the diagram looks like a tangled mess of arrows, the process itself is probably too complex to automate as-is. Simplify first, then automate."*
- **Interactive exercise**: Ask the user to describe their process in 3-5 high-level steps in a text field. If they struggle to keep it under 5, that's a signal.

**Guiding questions** (presented sequentially):
- Can you describe the process in 3-5 steps at a high level? *(Try it right now. If you need more than 5 steps, the process may need simplifying.)*
- Does the process have clear inputs and outputs? *(What goes in? What comes out? If the answer is "it depends," that's a flag.)*
- Would someone unfamiliar with the process understand the flow? *(Think of a new team member. Could they follow along?)*

**Scoring rubric (1-5)**:
| Score | Criteria |
|-------|----------|
| 1 | Process is highly complex, difficult to describe, no clear flow. Multiple people disagree on how it works. |
| 2 | Process can be described but requires many steps and has significant branching/exceptions. |
| 3 | Process is understandable but has some complexity — a few branches or conditional paths. |
| 4 | Process is clear and mostly linear. Can be described in 3-5 steps with minor exceptions. |
| 5 | Process is simple, well-defined, linear. Clear inputs, clear outputs, minimal branching. |

#### 3. Automation-to-Manual Switches (`auto_manual_switches`)

**Purpose**: Processes that alternate between automated and manual steps are problematic. Each manual step halts the automation and introduces delay, errors, and dependency on availability. The goal is to front-load required manual steps and then switch to an automated finish.

**Guided experience**:
- **Introduction panel**: *"Think of an assembly line. If a human has to step in at step 3, step 7, and step 12, the line stops three times. But if the human does their part at steps 1-3 and then the machine handles 4-12 uninterrupted, everything flows. The same applies to your process."*
- **Visual exercise**: Present a simple diagram concept — ask users to list their steps and mark each as "manual" or "automated." Highlight the switches.

**Guiding questions** (presented sequentially):
- How many times does the process switch between manual and automated steps? *(List your steps and mark each M or A. Count the switches.)*
- Can manual steps be moved to the beginning of the process? *(Front-loading human work means the automated portion runs without interruption.)*
- Can any manual steps be eliminated entirely? *(Sometimes a manual step exists because "we've always done it that way," not because it's necessary.)*
- After the last manual step, can the rest run unattended? *(This is the goal: humans set things up, then automation takes it home.)*

**Scoring rubric (1-5)**:
| Score | Criteria |
|-------|----------|
| 1 | Process constantly alternates between manual and automated steps. Manual intervention is needed throughout. |
| 2 | Multiple manual interruptions in the automated flow. Some could potentially be moved but it would require significant redesign. |
| 3 | A few manual steps interrupt the flow, but there's a clear path to consolidating them. |
| 4 | Manual steps are mostly front-loaded. One or two minor manual touchpoints remain in the automated portion. |
| 5 | Manual steps are fully front-loaded (or eliminated). Once automation starts, it runs to completion unattended. |

#### 4. Automation Pyramid Level (`automation_pyramid`)

**Purpose**: Three levels of automation, structured as a pyramid. Users should identify which level their idea requires. Moving up the pyramid increases cost and complexity. Most ideas should start at the workflow level.

**Guided experience**:
- **Introduction panel**: *"Not every problem needs AI. In fact, most automation is just 'if this, then that' — simple rules that a computer follows. AI adds power but also cost and complexity. Pick the simplest level that gets the job done."*
- **Visual pyramid**: Display the three levels as a pyramid graphic with cost/complexity indicators.
- **Decision tree**: Walk the user through: "Can simple rules solve this?" → Yes → Workflow. No → "Does it need one AI judgment call?" → Yes → One-shot AI. No → "Does it need multi-step AI reasoning?" → Yes → Agentic AI.

**The three levels**:
- **Workflows** (base — most common, cheapest): Deterministic, rule-based automation. If X then Y. Tools often already exist and are low/no cost.
- **One-shot AI** (middle): Single prompt → single output. Simple AI systems that don't require multi-step reasoning.
- **Agentic AI** (top — least common, most expensive): Multi-step, autonomous workflows where AI makes decisions and takes actions across steps.

**Guiding questions** (presented sequentially):
- Can this be solved with simple rules/logic? *(Example: "If an email contains keyword X, route it to folder Y." That's a workflow — no AI needed.)*
- Does it require AI judgment but only one step? *(Example: "Summarize this document." One input, one output, one AI call.)*
- Does it require multi-step AI reasoning and action-taking? *(Example: "Research this topic, draft a report, get feedback, revise, and publish." Multiple decisions, multiple steps.)*
- Is the chosen level justified by the value it delivers? *(Agentic AI is powerful but expensive. Is the ROI there?)*

**Scoring rubric (1-5)**:
| Score | Criteria |
|-------|----------|
| 1 | Proposed level is significantly over-engineered for the problem, or the level needed makes this impractical (e.g., requires agentic AI for marginal value). |
| 2 | Level is probably higher than necessary. Could likely be solved at a simpler level with some rethinking. |
| 3 | Level is appropriate but the cost/complexity trade-off is borderline. Worth proceeding with awareness. |
| 4 | Level is well-matched to the problem. Good balance of capability and cost. |
| 5 | Level is clearly the right fit. Simplest possible approach that fully solves the problem. |

#### 5. Risk & Governance (`risk_governance`)

**Purpose**: Is the automation following rules for data privacy, security, and compliance? Are outputs validated? Is it monitored in production?

**Guided experience**:
- **Introduction panel**: *"Automation is powerful, but it needs guardrails. An automated process that sends wrong data to customers or violates privacy rules can cause more damage faster than a manual mistake — because it happens at scale. Let's make sure the right protections are in place."*
- **Checklist approach**: Present each question as a yes/no with follow-up. "Does this handle sensitive data?" → Yes → "What type? What protections are in place?"

**Guiding questions** (presented sequentially):
- Does the process handle sensitive or regulated data — PII, PHI, financial? *(If yes, extra care is needed. What data classification does this fall under?)*
- Are AI outputs validated before action is taken? *(Never trust AI output blindly. What's the validation step?)*
- Is there a human-in-the-loop for high-stakes decisions? *(For low-risk outputs, full automation is fine. For high-stakes decisions — hiring, spending, customer-facing content — a human should review.)*
- How will the automation be monitored for failures or drift? *(Things break. Models drift. Who's watching, and how will you know something went wrong?)*
- Does this comply with organizational AI usage policies? *(Check your org's AI policy. If you're not sure whether one exists, that's worth finding out before proceeding.)*

**Scoring rubric (1-5)**:
| Score | Criteria |
|-------|----------|
| 1 | Significant unaddressed risks. Handles sensitive data with no protections planned. No validation or monitoring strategy. |
| 2 | Some risks identified but mitigation plans are vague or incomplete. Validation is ad-hoc. |
| 3 | Key risks identified with reasonable mitigation plans. Some validation in place. Monitoring is planned but not detailed. |
| 4 | Risks well-understood with clear mitigation. Validation built into the process. Monitoring plan defined. Compliant with known policies. |
| 5 | Comprehensive risk assessment. Strong validation and monitoring. Human-in-the-loop where appropriate. Full policy compliance confirmed. |

### Cost Model

Both assessments (estimated) and use cases (actual) will track costs using the same structure. This is stored as a JSON field.

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

  // Calculated (by frontend, stored for reporting)
  totalOneTime: number;
  totalMonthlyRecurring: number;
  totalAnnualRecurring: number;

  // Optional context
  notes: string;
}
```

This enables true ROI calculation:
- **Net annual savings** = annual savings (from metrics) − annual recurring cost − (one-time cost amortized)
- **Payback period** = total one-time cost ÷ (monthly savings − monthly recurring cost)

### Scoring

Each checkpoint produces a score (1-5) and a status (`pass`, `concern`, `fail`). These combine into an overall readiness picture.

**Checkpoint-level scoring**:
- User assigns a 1-5 score using the rubric specific to each checkpoint
- Status is derived from the score: 1-2 = `fail`, 3 = `concern`, 4-5 = `pass`
- User can override the derived status (e.g., score a 3 but mark as `pass` if they've accepted the trade-off)
- Notes field captures context for the score

**Overall readiness score**:
- **Readiness score** = average of all completed checkpoint scores (1.0 - 5.0)
- **Readiness grade**: S (4.5+), A (4.0+), B (3.0+), C (2.0+), D (<2.0) — mirrors the use case grading system for familiarity
- **Blocker flag**: If any checkpoint has `fail` status, the assessment is flagged as "has blockers" regardless of overall score. This prevents a high average from masking a critical gap.
- **Completion indicator**: Progress bar showing checkpoints completed (0/5 → 5/5)
- **Visual summary**: Radar/spider chart showing the five checkpoint scores, making strengths and weaknesses immediately visible

This is deliberately simple — it's a self-assessment, not a formal scoring rubric. The guided experience and rubrics help users score consistently, but the scores are self-reported and directional.

### Promotion to Use Case

When a user completes an assessment and decides to proceed, they can "promote" it to a use case. This:
1. Creates a new use case pre-filled with assessment data (title, description, category, department, tags, estimated metrics → metrics, estimated costs → costs)
2. Sets the assessment status to `promoted`
3. Sets `promotedToUseCaseId` on the assessment for traceability
4. The use case fields `whatWasBuilt` and `keyLearnings` are left empty for the user to fill in after implementation

Promotion is optional. Not every assessment becomes a use case. Not every use case needs an assessment first.

### Visibility & Ownership

Assessments are **user-specific** — a user sees only their own assessments. This is intentional: assessments are personal working space for evaluating ideas. Half-finished assessments or low-scoring ideas shouldn't be visible to peers.

However, assessment data is **available for reporting and admin dashboarding**. Admins can view all assessments across users for aggregate reporting (how many ideas are in the pipeline, common checkpoint failures, promotion rates by department, etc.). This gives leadership visibility without exposing individual in-progress work to peers.

**Access model**:
| Actor | Can see | Can edit |
|-------|---------|----------|
| Owner (user) | Own assessments only | Own assessments |
| Admin | All assessments (for reporting) | Any assessment |
| Other users | None | None |

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/assessments | Yes | List own assessments; admins can pass `?all=true` for reporting |
| GET | /api/assessments/:id | Yes | Get assessment with checkpoints (owner or admin only) |
| POST | /api/assessments | Yes | Create assessment (initializes 5 empty checkpoints) |
| PUT | /api/assessments/:id | Yes | Update assessment (owner or admin) |
| DELETE | /api/assessments/:id | Yes | Delete assessment (owner or admin) |
| PUT | /api/assessments/:id/checkpoints/:checkpoint | Yes | Update a specific checkpoint (owner or admin) |
| POST | /api/assessments/:id/promote | Yes | Promote to use case (owner or admin) |

### Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| /assessments | MyAssessmentsPage | User's own assessments (not a shared browse view) |
| /assessments/new | NewAssessmentPage | Create new assessment |
| /assessments/:id | AssessmentDetailPage | View assessment with checkpoint progress and scores |
| /assessments/:id/evaluate | AssessmentEvaluatePage | Guided step-through of checkpoints (see Guided Experience below) |

### The Guided Experience

The evaluation page (`/assessments/:id/evaluate`) is the core of the assessment feature. It is a **wizard-style guided flow**, not a form dump. This is critical for adoption by non-technical users.

**Flow design**:
1. **Step-by-step progression**: One checkpoint per step. Users can navigate forward/back but the default flow is sequential.
2. **Introduction first**: Each checkpoint opens with a plain-language explanation panel — what this checkpoint is, why it matters, and what "good" looks like. This is educational, not just evaluative.
3. **Guided questions**: Questions are presented one at a time (not all at once). Each question includes helper text with examples and context.
4. **Score with rubric**: After answering the guiding questions, the user sees the 1-5 rubric table and selects their score. The rubric criteria are specific and concrete, not abstract.
5. **Status derivation**: The status (`pass`/`concern`/`fail`) is auto-derived from the score but can be overridden with a note explaining why.
6. **Notes field**: Open text for the user to capture their reasoning, caveats, or action items.
7. **Progress indicator**: Clear visual showing which checkpoints are done, current, and remaining.
8. **Save and resume**: Progress is saved per-checkpoint. Users can leave mid-assessment and pick up where they left off.
9. **Summary view**: After all five checkpoints, a summary page shows the radar chart, overall score/grade, any blockers, and the option to promote to a use case.

**Tone**: The guided text should be conversational, not corporate. It's coaching the user, not auditing them. Example: *"Don't worry if your score is low here — that just means there's work to do before automating. Better to know now than after you've built it."*

### Permissions

New permissions:
- `assessments:create` — create assessments (granted to `user` and `admin`)
- `assessments:update` — update own assessments (granted to `user` and `admin`)
- `assessments:delete` — delete any assessment (granted to `admin` only)
- `assessments:promote` — promote to use case (granted to `user` and `admin`)
- `assessments:read_all` — view all assessments for reporting (granted to `admin` only)

## Consequences

### Positive
- **Accessible to all skill levels**: Guided wizard experience with plain-language explanations, examples, and scoring rubrics makes the assessment usable by non-technical users
- **Idea pipeline**: Admin reporting gives visibility into what teams are exploring, without exposing individual in-progress work to peers
- **Structured thinking**: The five checkpoints with concrete scoring rubrics drive consistent, comparable evaluations
- **Lightweight**: Self-assessment, no approval workflow, no bottleneck
- **Traceability**: Promoted assessments link back to use cases, showing the idea-to-implementation journey
- **Cost visibility**: Estimated costs on assessments and actual costs on use cases enable true ROI reporting
- **Executive dashboarding**: Assessment volume, promotion rate, checkpoint pass/fail patterns, and cost estimates are all reportable at aggregate level

### Negative
- **Adoption risk**: Users may skip the assessment and go straight to use cases — this is acceptable by design
- **Subjectivity**: Checkpoint scores are self-reported; the rubrics help but scores are still directional, not precise
- **Schema growth**: Two new tables and a new JSON field on use cases
- **Guided UX investment**: The wizard-style evaluation flow requires more frontend effort than a simple form

### Mitigations
- Assessment is positioned as helpful, not mandatory — it's a tool, not a gate
- Scoring rubrics with concrete criteria reduce subjectivity significantly compared to unguided 1-5 scales
- The promotion flow provides a tangible payoff for completing an assessment
- Dashboard reporting on assessment-to-use-case conversion shows the tool's value over time
- The guided UX is the feature's differentiator — it's what makes this a teaching tool, not just another form. The investment is justified.
