import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui';
import { useToast } from '../../components/ui/ToastContainer';
import * as assessmentService from '../../services/assessmentService';
import type { Assessment, AssessmentCheckpoint, CheckpointName, CheckpointStatus } from '../../types';

const CHECKPOINT_ORDER: CheckpointName[] = [
  'documentation',
  'squint_check',
  'auto_manual_switches',
  'automation_pyramid',
  'risk_governance',
];

const CHECKPOINT_DATA: Record<CheckpointName, {
  title: string;
  intro: string;
  questions: { question: string; helper: string }[];
  rubric: { score: number; criteria: string }[];
}> = {
  documentation: {
    title: 'Documentation & Measurement',
    intro: "Before you automate something, you need to understand how it works today. Think of it like getting directions \u2014 you need to know where you're starting from, not just where you want to go.",
    questions: [
      { question: 'Is the current process documented?', helper: 'Even informal notes count. If only one person knows how it works, that\'s a risk.' },
      { question: 'Do you have baseline metrics \u2014 time per task, error rate, cost?', helper: 'You don\'t need exact numbers. Rough estimates like "about 20 minutes per report" are a fine starting point.' },
      { question: 'Can you measure the output quality of the automated version?', helper: 'How will you know if the automation is doing a good job? What does "correct" look like?' },
    ],
    rubric: [
      { score: 1, criteria: 'No documentation exists. No one has measured how the process performs today.' },
      { score: 2, criteria: 'Informal/tribal knowledge only. Someone could describe it verbally but nothing is written down. No metrics.' },
      { score: 3, criteria: 'Basic documentation exists. Some metrics are available but incomplete.' },
      { score: 4, criteria: 'Process is well-documented. Baseline metrics exist for key dimensions (time, quality, cost).' },
      { score: 5, criteria: 'Comprehensive documentation with detailed baseline measurements. Clear definition of success.' },
    ],
  },
  squint_check: {
    title: 'The Squint Check',
    intro: "Imagine drawing this process on a whiteboard for someone who's never seen it. If the diagram looks like a tangled mess of arrows, the process itself is probably too complex to automate as-is. Simplify first, then automate.",
    questions: [
      { question: 'Can you describe the process in 3-5 steps at a high level?', helper: 'Try it right now. If you need more than 5 steps, the process may need simplifying.' },
      { question: 'Does the process have clear inputs and outputs?', helper: 'What goes in? What comes out? If the answer is "it depends," that\'s a flag.' },
      { question: 'Would someone unfamiliar with the process understand the flow?', helper: 'Think of a new team member. Could they follow along?' },
    ],
    rubric: [
      { score: 1, criteria: 'Process is highly complex, difficult to describe, no clear flow.' },
      { score: 2, criteria: 'Process can be described but requires many steps and significant branching.' },
      { score: 3, criteria: 'Process is understandable but has some complexity \u2014 a few branches or conditional paths.' },
      { score: 4, criteria: 'Process is clear and mostly linear. Can be described in 3-5 steps with minor exceptions.' },
      { score: 5, criteria: 'Process is simple, well-defined, linear. Clear inputs, clear outputs, minimal branching.' },
    ],
  },
  auto_manual_switches: {
    title: 'Automation-to-Manual Switches',
    intro: "Think of an assembly line. If a human has to step in at step 3, step 7, and step 12, the line stops three times. But if the human does their part at steps 1-3 and then the machine handles 4-12 uninterrupted, everything flows. The same applies to your process.",
    questions: [
      { question: 'How many times does the process switch between manual and automated steps?', helper: 'List your steps and mark each M or A. Count the switches.' },
      { question: 'Can manual steps be moved to the beginning of the process?', helper: 'Front-loading human work means the automated portion runs without interruption.' },
      { question: 'Can any manual steps be eliminated entirely?', helper: 'Sometimes a manual step exists because "we\'ve always done it that way," not because it\'s necessary.' },
      { question: 'After the last manual step, can the rest run unattended?', helper: 'This is the goal: humans set things up, then automation takes it home.' },
    ],
    rubric: [
      { score: 1, criteria: 'Process constantly alternates between manual and automated steps throughout.' },
      { score: 2, criteria: 'Multiple manual interruptions. Some could be moved but requires significant redesign.' },
      { score: 3, criteria: 'A few manual steps interrupt the flow, but there\'s a clear path to consolidating them.' },
      { score: 4, criteria: 'Manual steps are mostly front-loaded. One or two minor touchpoints remain.' },
      { score: 5, criteria: 'Manual steps are fully front-loaded or eliminated. Automation runs to completion unattended.' },
    ],
  },
  automation_pyramid: {
    title: 'Automation Pyramid Level',
    intro: "Not every problem needs AI. In fact, most automation is just 'if this, then that' \u2014 simple rules that a computer follows. AI adds power but also cost and complexity. Pick the simplest level that gets the job done.",
    questions: [
      { question: 'Can this be solved with simple rules/logic?', helper: 'Example: "If an email contains keyword X, route it to folder Y." That\'s a workflow \u2014 no AI needed.' },
      { question: 'Does it require AI judgment but only one step?', helper: 'Example: "Summarize this document." One input, one output, one AI call.' },
      { question: 'Does it require multi-step AI reasoning and action-taking?', helper: 'Example: "Research this topic, draft a report, get feedback, revise, and publish."' },
      { question: 'Is the chosen level justified by the value it delivers?', helper: 'Agentic AI is powerful but expensive. Is the ROI there?' },
    ],
    rubric: [
      { score: 1, criteria: 'Proposed level is significantly over-engineered, or the level needed makes this impractical.' },
      { score: 2, criteria: 'Level is probably higher than necessary. Could likely be solved simpler.' },
      { score: 3, criteria: 'Level is appropriate but the cost/complexity trade-off is borderline.' },
      { score: 4, criteria: 'Level is well-matched to the problem. Good balance of capability and cost.' },
      { score: 5, criteria: 'Level is clearly the right fit. Simplest possible approach that fully solves the problem.' },
    ],
  },
  risk_governance: {
    title: 'Risk & Governance',
    intro: "Automation is powerful, but it needs guardrails. An automated process that sends wrong data to customers or violates privacy rules can cause more damage faster than a manual mistake \u2014 because it happens at scale. Let's make sure the right protections are in place.",
    questions: [
      { question: 'Does the process handle sensitive or regulated data \u2014 PII, PHI, financial?', helper: 'If yes, extra care is needed. What data classification does this fall under?' },
      { question: 'Are AI outputs validated before action is taken?', helper: 'Never trust AI output blindly. What\'s the validation step?' },
      { question: 'Is there a human-in-the-loop for high-stakes decisions?', helper: 'For low-risk outputs, full automation is fine. For high-stakes \u2014 a human should review.' },
      { question: 'How will the automation be monitored for failures or drift?', helper: 'Things break. Models drift. Who\'s watching, and how will you know?' },
      { question: 'Does this comply with organizational AI usage policies?', helper: 'Check your org\'s AI policy. If unsure whether one exists, find out before proceeding.' },
    ],
    rubric: [
      { score: 1, criteria: 'Significant unaddressed risks. No protections planned. No validation or monitoring.' },
      { score: 2, criteria: 'Some risks identified but mitigation plans are vague. Validation is ad-hoc.' },
      { score: 3, criteria: 'Key risks identified with reasonable mitigation. Some validation. Monitoring planned.' },
      { score: 4, criteria: 'Risks well-understood with clear mitigation. Validation built in. Monitoring defined.' },
      { score: 5, criteria: 'Comprehensive risk assessment. Strong validation and monitoring. Full compliance confirmed.' },
    ],
  },
};

function scoreToStatus(score: number): CheckpointStatus {
  if (score <= 2) return 'fail';
  if (score === 3) return 'concern';
  return 'pass';
}

function getGrade(score: number): string {
  if (score >= 4.5) return 'S';
  if (score >= 4.0) return 'A';
  if (score >= 3.0) return 'B';
  if (score >= 2.0) return 'C';
  return 'D';
}

const gradeColors: Record<string, string> = {
  S: 'var(--nx-cyan-glow)',
  A: 'var(--nx-green-glow)',
  B: '#3b82f6',
  C: 'var(--nx-amber-glow)',
  D: 'var(--nx-red-glow)',
};

const statusColors: Record<CheckpointStatus, string> = {
  not_started: 'var(--color-border-strong)',
  pass: 'var(--nx-green-glow)',
  concern: 'var(--nx-amber-glow)',
  fail: 'var(--nx-red-glow)',
};

interface StepData {
  score: number | null;
  status: CheckpointStatus;
  notes: string;
  statusOverride: boolean;
}

function AssessmentEvaluatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [assessment, setAssessment] = useState<(Assessment & { checkpoints: AssessmentCheckpoint[] }) | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<CheckpointName, StepData>>(() => {
    const init: Record<string, StepData> = {};
    for (const name of CHECKPOINT_ORDER) {
      init[name] = { score: null, status: 'not_started', notes: '', statusOverride: false };
    }
    return init as Record<CheckpointName, StepData>;
  });
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) { setLoading(false); return; }
      try {
        const data = await assessmentService.getAssessmentById(id);
        if (data) {
          setAssessment(data);
          // Initialize step data from existing checkpoints
          const newStepData = { ...stepData };
          for (const cp of data.checkpoints || []) {
            if (cp.checkpoint in newStepData) {
              const name = cp.checkpoint as CheckpointName;
              newStepData[name] = {
                score: cp.score,
                status: cp.status,
                notes: cp.notes || '',
                statusOverride: cp.score !== null && scoreToStatus(cp.score) !== cp.status,
              };
            }
          }
          setStepData(newStepData as Record<CheckpointName, StepData>);

          // Start at first incomplete checkpoint
          const firstIncomplete = CHECKPOINT_ORDER.findIndex((name) => {
            const cp = (data.checkpoints || []).find((c) => c.checkpoint === name);
            return !cp || cp.score === null;
          });
          if (firstIncomplete >= 0) setCurrentStep(firstIncomplete);
        }
      } catch (e) {
        addToast('Failed to load assessment', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const saveCheckpoint = useCallback(async (checkpointName: CheckpointName) => {
    if (!id) return;
    const data = stepData[checkpointName];
    if (data.score === null) return;

    setSaving(true);
    try {
      await assessmentService.updateCheckpoint(id, checkpointName, {
        score: data.score,
        status: data.status,
        notes: data.notes,
      });
    } catch {
      addToast('Failed to save checkpoint', 'error');
    } finally {
      setSaving(false);
    }
  }, [id, stepData, addToast]);

  function updateStepData(name: CheckpointName, updates: Partial<StepData>) {
    setStepData((prev) => {
      const current = prev[name];
      const updated = { ...current, ...updates };
      // Auto-derive status from score unless overridden
      if ('score' in updates && updates.score != null && !updated.statusOverride) {
        updated.status = scoreToStatus(updates.score as number);
      }
      return { ...prev, [name]: updated };
    });
  }

  async function handleSaveAndContinue() {
    if (currentStep < 5) {
      const checkpointName = CHECKPOINT_ORDER[currentStep];
      if (stepData[checkpointName].score !== null) {
        await saveCheckpoint(checkpointName);
      }
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handlePrevious() {
    if (currentStep > 0) {
      // Auto-save current step if it has a score
      if (currentStep < 5) {
        const checkpointName = CHECKPOINT_ORDER[currentStep];
        if (stepData[checkpointName].score !== null) {
          await saveCheckpoint(checkpointName);
        }
      }
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleStepClick(index: number) {
    if (index === currentStep) return;
    // Save current step before jumping
    if (currentStep < 5) {
      const checkpointName = CHECKPOINT_ORDER[currentStep];
      if (stepData[checkpointName].score !== null) {
        await saveCheckpoint(checkpointName);
      }
    }
    setCurrentStep(index);
  }

  async function handlePromote() {
    if (!id) return;
    setIsPromoting(true);
    try {
      const result = await assessmentService.promoteToUseCase(id);
      if (result) {
        addToast('Assessment promoted to use case! Review and confirm the details.', 'success');
        navigate(`/use-cases/${result.useCase.id}/edit`);
      } else {
        addToast('Failed to promote assessment', 'error');
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to promote', 'error');
    } finally {
      setIsPromoting(false);
    }
  }

  function toggleQuestion(key: string) {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
    </div>
  );

  if (!assessment) {
    return (
      <div className="text-center py-20">
        <h2 style={{ color: 'var(--nx-text-secondary)' }} className="text-xl font-semibold mb-2">Assessment not found</h2>
        <Link to="/assessments">
          <Button variant="secondary">Back to Assessments</Button>
        </Link>
      </div>
    );
  }

  const isSummary = currentStep === 5;

  // Calculate summary data
  const allScored = CHECKPOINT_ORDER.every((name) => stepData[name].score !== null);
  const scoredEntries = CHECKPOINT_ORDER.filter((name) => stepData[name].score !== null);
  const avgScore = scoredEntries.length > 0
    ? scoredEntries.reduce((sum, name) => sum + (stepData[name].score ?? 0), 0) / scoredEntries.length
    : 0;
  const grade = avgScore > 0 ? getGrade(avgScore) : null;
  const hasBlocker = CHECKPOINT_ORDER.some((name) => stepData[name].status === 'fail');

  return (
    <div>
      <Link
        to={`/assessments/${assessment.id}`}
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--nx-text-tertiary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nx-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nx-text-tertiary)')}
      >
        <ArrowLeft size={16} />
        Back to Assessment
      </Link>

      <div className="max-w-3xl">
        <h1
          className="text-2xl font-bold tracking-tight mb-1"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--nx-text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          Evaluate: {assessment.title}
        </h1>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mb-6 text-sm">
          Work through each checkpoint to assess automation readiness.
        </p>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {CHECKPOINT_ORDER.map((name, i) => {
            const data = stepData[name];
            let color = 'var(--nx-cyan-aura)';
            if (i === currentStep && !isSummary) {
              color = 'var(--nx-cyan-base)';
            } else if (data.score !== null) {
              color = statusColors[data.status];
            }

            return (
              <button
                key={name}
                onClick={() => handleStepClick(i)}
                title={CHECKPOINT_DATA[name].title}
                style={{
                  flex: 1,
                  height: '6px',
                  backgroundColor: color,
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: i === currentStep && !isSummary ? `0 0 8px ${color}` : undefined,
                }}
              />
            );
          })}
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {CHECKPOINT_ORDER.map((name, i) => {
            const data = stepData[name];
            const isActive = i === currentStep && !isSummary;
            const isCompleted = data.score !== null;

            return (
              <button
                key={name}
                onClick={() => handleStepClick(i)}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                style={{
                  background: isActive ? 'var(--color-border-default)' : 'transparent',
                  border: isActive ? '1px solid var(--nx-cyan-glow)' : '1px solid var(--color-border-subtle)',
                  color: isActive
                    ? 'var(--nx-cyan-base)'
                    : isCompleted
                      ? statusColors[data.status]
                      : 'var(--nx-text-ghost)',
                  cursor: 'pointer',
                }}
              >
                {CHECKPOINT_DATA[name].title}
              </button>
            );
          })}
          <button
            onClick={() => handleStepClick(5)}
            className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
            style={{
              background: isSummary ? 'var(--color-border-default)' : 'transparent',
              border: isSummary ? '1px solid var(--nx-cyan-glow)' : '1px solid var(--color-border-subtle)',
              color: isSummary ? 'var(--nx-cyan-base)' : 'var(--nx-text-ghost)',
              cursor: 'pointer',
            }}
          >
            Summary
          </button>
        </div>

        {/* Checkpoint Content */}
        {!isSummary && currentStep < 5 && (
          <CheckpointStep
            checkpointName={CHECKPOINT_ORDER[currentStep]}
            data={stepData[CHECKPOINT_ORDER[currentStep]]}
            onUpdate={(updates) => updateStepData(CHECKPOINT_ORDER[currentStep], updates)}
            expandedQuestions={expandedQuestions}
            onToggleQuestion={toggleQuestion}
          />
        )}

        {/* Summary */}
        {isSummary && (
          <SummaryStep
            stepData={stepData}
            avgScore={avgScore}
            grade={grade}
            hasBlocker={hasBlocker}
            allScored={allScored}
            onPromote={handlePromote}
            isPromoting={isPromoting}
            assessmentId={assessment.id}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4" style={{ borderTop: '1px solid var(--nx-cyan-aura)' }}>
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <div className="flex gap-3">
            {!isSummary && (
              <Button onClick={handleSaveAndContinue} isLoading={saving}>
                {currentStep === 4 ? 'Save & View Summary' : 'Save & Continue'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckpointStep({
  checkpointName,
  data,
  onUpdate,
  expandedQuestions,
  onToggleQuestion,
}: {
  checkpointName: CheckpointName;
  data: StepData;
  onUpdate: (updates: Partial<StepData>) => void;
  expandedQuestions: Set<string>;
  onToggleQuestion: (key: string) => void;
}) {
  const checkpoint = CHECKPOINT_DATA[checkpointName];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div
        style={{
          background: 'var(--nx-glass-medium)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: '12px',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h2
          style={{
            color: 'var(--nx-text-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            letterSpacing: '0.03em',
            marginBottom: '0.75rem',
          }}
        >
          {checkpoint.title}
        </h2>
        <p style={{ color: 'var(--nx-text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
          {checkpoint.intro}
        </p>
      </div>

      {/* Guiding Questions */}
      <div
        style={{
          background: 'var(--nx-glass-medium)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: '12px',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h3
          style={{
            color: 'var(--nx-text-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            letterSpacing: '0.03em',
            marginBottom: '1rem',
          }}
        >
          Questions to Consider
        </h3>
        <div className="space-y-2">
          {checkpoint.questions.map((q, i) => {
            const key = `${checkpointName}-${i}`;
            const isExpanded = expandedQuestions.has(key);
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => onToggleQuestion(key)}
                  className="flex items-start gap-2 w-full text-left py-2"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} style={{ color: 'var(--nx-cyan-base)', marginTop: '2px', flexShrink: 0 }} />
                  ) : (
                    <ChevronRight size={16} style={{ color: 'var(--nx-text-tertiary)', marginTop: '2px', flexShrink: 0 }} />
                  )}
                  <span style={{ color: 'var(--nx-text-primary)', fontSize: '14px', fontWeight: 500 }}>
                    {q.question}
                  </span>
                </button>
                {isExpanded && (
                  <div
                    className="ml-6 mb-2 px-3 py-2 rounded-md"
                    style={{
                      background: 'var(--nx-void-surface)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <p style={{ color: 'var(--nx-text-tertiary)', fontSize: '13px', lineHeight: 1.6 }}>
                      {q.helper}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring Rubric */}
      <div
        style={{
          background: 'var(--nx-glass-medium)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: '12px',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h3
          style={{
            color: 'var(--nx-text-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            letterSpacing: '0.03em',
            marginBottom: '1rem',
          }}
        >
          Score This Checkpoint
        </h3>
        <div className="space-y-2">
          {checkpoint.rubric.map((r) => {
            const isSelected = data.score === r.score;
            const derivedStatus = scoreToStatus(r.score);
            const borderColor = isSelected ? statusColors[derivedStatus] : 'var(--color-border-subtle)';

            return (
              <button
                key={r.score}
                type="button"
                onClick={() => onUpdate({ score: r.score })}
                className="flex items-start gap-3 w-full text-left p-3 rounded-lg transition-all"
                style={{
                  background: isSelected ? `${statusColors[derivedStatus]}11` : 'var(--nx-void-surface)',
                  border: `1px solid ${borderColor}`,
                  cursor: 'pointer',
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: isSelected ? statusColors[derivedStatus] : 'var(--nx-text-tertiary)',
                    background: isSelected ? `${statusColors[derivedStatus]}22` : 'var(--color-border-subtle)',
                    border: isSelected ? `1px solid ${statusColors[derivedStatus]}44` : '1px solid var(--color-border-subtle)',
                  }}
                >
                  {r.score}
                </div>
                <p style={{ color: isSelected ? 'var(--nx-text-primary)' : 'var(--nx-text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                  {r.criteria}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status override and notes */}
      <div
        style={{
          background: 'var(--nx-glass-medium)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: '12px',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Status override */}
        {data.score !== null && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontSize: '13px', color: 'var(--nx-text-secondary)' }}>Status:</span>
              <span
                className="text-xs px-2 py-0.5 rounded-sm font-medium"
                style={{
                  backgroundColor: `${statusColors[data.status]}22`,
                  color: statusColors[data.status],
                }}
              >
                {data.status.replace('_', ' ')}
              </span>
              {!data.statusOverride && (
                <button
                  type="button"
                  onClick={() => onUpdate({ statusOverride: true })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--nx-text-ghost)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Override
                </button>
              )}
            </div>
            {data.statusOverride && (
              <div className="flex gap-2">
                {(['pass', 'concern', 'fail'] as CheckpointStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onUpdate({ status: s })}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: data.status === s ? `${statusColors[s]}22` : 'var(--nx-void-surface)',
                      border: `1px solid ${data.status === s ? statusColors[s] : 'var(--color-border-subtle)'}`,
                      color: data.status === s ? statusColors[s] : 'var(--nx-text-tertiary)',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label
            style={{ color: 'var(--nx-text-secondary)', fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}
          >
            Notes & Reasoning
          </label>
          <textarea
            placeholder="Capture your reasoning, observations, or follow-up items..."
            value={data.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2.5 rounded-md transition-colors duration-200"
            style={{
              backgroundColor: 'var(--nx-void-elevated)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--nx-text-primary)',
              outline: 'none',
              fontSize: '14px',
              resize: 'vertical',
              lineHeight: 1.6,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--nx-cyan-base)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-default)')}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryStep({
  stepData,
  avgScore,
  grade,
  hasBlocker,
  allScored,
  onPromote,
  isPromoting,
  assessmentId,
}: {
  stepData: Record<CheckpointName, StepData>;
  avgScore: number;
  grade: string | null;
  hasBlocker: boolean;
  allScored: boolean;
  onPromote: () => void;
  isPromoting: boolean;
  assessmentId: string;
}) {
  const encouragement = grade
    ? grade === 'S'
      ? 'Outstanding! This process is an excellent candidate for automation.'
      : grade === 'A'
        ? 'Great readiness! This looks like a strong candidate with minor areas to refine.'
        : grade === 'B'
          ? 'Solid foundation. A few areas need attention before moving forward.'
          : grade === 'C'
            ? 'Some groundwork is needed. Focus on the lower-scoring checkpoints before automating.'
            : 'This process needs significant preparation before automation is viable. Focus on the fundamentals first.'
    : 'Complete all checkpoints to see your readiness score.';

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div
        style={{
          background: 'var(--nx-glass-medium)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: '12px',
          padding: '2rem',
          backdropFilter: 'blur(8px)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            color: 'var(--nx-text-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            letterSpacing: '0.03em',
            marginBottom: '1.5rem',
          }}
        >
          Readiness Summary
        </h2>

        {grade && (
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '4rem',
                fontWeight: 700,
                lineHeight: 1,
                color: gradeColors[grade],
                textShadow: `0 0 30px ${gradeColors[grade]}88, 0 0 60px ${gradeColors[grade]}44`,
              }}
            >
              {grade}
            </div>
            <div
              style={{
                fontSize: '18px',
                fontFamily: 'var(--font-mono)',
                color: gradeColors[grade],
                marginTop: '0.5rem',
                fontWeight: 500,
              }}
            >
              {avgScore.toFixed(1)} / 5.0
            </div>
          </div>
        )}

        <p style={{ color: 'var(--nx-text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          {encouragement}
        </p>

        {hasBlocker && (
          <div
            className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-md"
            style={{ background: 'var(--nx-red-aura)', border: '1px solid var(--nx-red-glow)', display: 'inline-flex' }}
          >
            <AlertTriangle size={14} style={{ color: 'var(--nx-red-glow)' }} />
            <span style={{ color: 'var(--nx-red-glow)', fontSize: '13px', fontWeight: 500 }}>
              Blockers detected. Address failing checkpoints before proceeding.
            </span>
          </div>
        )}
      </div>

      {/* Checkpoint Score Bars */}
      <div
        style={{
          background: 'var(--nx-glass-medium)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: '12px',
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h3
          style={{
            color: 'var(--nx-text-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            letterSpacing: '0.03em',
            marginBottom: '1rem',
          }}
        >
          Checkpoint Scores
        </h3>
        <div className="space-y-3">
          {CHECKPOINT_ORDER.map((name) => {
            const data = stepData[name];
            const score = data.score;
            const barColor = statusColors[data.status];

            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: '13px', color: 'var(--nx-text-secondary)' }}>
                    {CHECKPOINT_DATA[name].title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-sm"
                      style={{
                        backgroundColor: `${statusColors[data.status]}22`,
                        color: statusColors[data.status],
                        fontWeight: 500,
                      }}
                    >
                      {data.status.replace('_', ' ')}
                    </span>
                    {score !== null && (
                      <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: barColor, fontWeight: 500 }}>
                        {score}/5
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--nx-void-deep)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: score !== null ? `${(score / 5) * 100}%` : '0%',
                      backgroundColor: barColor,
                      borderRadius: '9999px',
                      boxShadow: score !== null ? `0 0 8px ${barColor}44` : undefined,
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
                {data.notes && (
                  <p style={{ color: 'var(--nx-text-tertiary)', fontSize: '12px', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {data.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        {allScored && (
          <Button onClick={onPromote} isLoading={isPromoting}>
            {hasBlocker ? 'Promote to Use Case (with blockers)' : 'Promote to Use Case'}
          </Button>
        )}
        <Link to={`/assessments/${assessmentId}`}>
          <Button variant="secondary">Back to Assessment</Button>
        </Link>
      </div>
    </div>
  );
}

export default AssessmentEvaluatePage;
