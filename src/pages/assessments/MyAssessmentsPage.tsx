import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardCheck } from 'lucide-react';
import { SearchBar, Button, Badge, EmptyState, Card, Select } from '../../components/ui';
import * as assessmentService from '../../services/assessmentService';
import { USE_CASE_CATEGORIES, DEPARTMENTS } from '../../types';
import type { Assessment, AssessmentStatus, AssessmentCheckpoint } from '../../types';
import { format } from 'date-fns';

const statusVariant: Record<AssessmentStatus, 'neutral' | 'info' | 'success' | 'primary'> = {
  draft: 'neutral',
  in_progress: 'info',
  completed: 'success',
  promoted: 'primary',
};

const statusLabel: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  promoted: 'Promoted',
};

function getReadinessScore(checkpoints?: AssessmentCheckpoint[]): number | null {
  if (!checkpoints || checkpoints.length === 0) return null;
  const scored = checkpoints.filter((cp) => cp.score !== null);
  if (scored.length === 0) return null;
  return scored.reduce((sum, cp) => sum + (cp.score ?? 0), 0) / scored.length;
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

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const score = getReadinessScore(assessment.checkpoints);
  const grade = score !== null ? getGrade(score) : null;

  return (
    <Link to={`/assessments/${assessment.id}`}>
      <Card hoverable padding="md" className="h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3
            style={{ color: 'var(--nx-text-primary)' }}
            className="text-base font-semibold line-clamp-1 flex-1 mr-2"
          >
            {assessment.title}
          </h3>
          <div className="flex gap-1.5 shrink-0">
            <Badge variant={statusVariant[assessment.status]} size="sm">
              {statusLabel[assessment.status]}
            </Badge>
          </div>
        </div>
        <p
          style={{ color: 'var(--nx-text-secondary)' }}
          className="text-sm line-clamp-2 mb-3 flex-1"
        >
          {assessment.description}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: 'var(--nx-void-surface)', color: 'var(--nx-text-secondary)' }}
          >
            {assessment.category}
          </span>
          <span style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs">
            {assessment.department}
          </span>
          {grade && (
            <span
              className="text-xs font-bold ml-auto"
              style={{
                fontFamily: 'var(--font-display)',
                color: gradeColors[grade],
                textShadow: `0 0 8px ${gradeColors[grade]}66`,
              }}
            >
              {grade} ({score!.toFixed(1)})
            </span>
          )}
          {!grade && (
            <span style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs ml-auto">
              {format(new Date(assessment.createdAt), 'MMM d, yyyy')}
            </span>
          )}
        </div>
        {assessment.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {assessment.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded-sm"
                style={{ backgroundColor: 'var(--nx-void-elevated)', color: 'var(--nx-text-tertiary)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}

function MyAssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await assessmentService.getMyAssessments();
        setAssessments(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...assessments];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (statusFilter) {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (categoryFilter) {
      result = result.filter((a) => a.category === categoryFilter);
    }
    if (departmentFilter) {
      result = result.filter((a) => a.department === departmentFilter);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [assessments, searchQuery, statusFilter, categoryFilter, departmentFilter]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'promoted', label: 'Promoted' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...USE_CASE_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  const departmentOptions = [
    { value: '', label: 'All Teams' },
    ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <p style={{ color: 'var(--nx-red-base)' }}>{error}</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--nx-text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            My Assessments
          </h1>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">
            Evaluate automation readiness for your ideas.
          </p>
        </div>
        <Link to="/assessments/new">
          <Button>
            <Plus size={18} />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar placeholder="Search assessments..." onSearch={setSearchQuery} />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        />
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-44"
        />
        <Select
          options={departmentOptions}
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full sm:w-40"
        />
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((a) => (
            <AssessmentCard key={a.id} assessment={a} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardCheck size={48} />}
          title="No assessments found"
          description={
            searchQuery
              ? 'Try adjusting your search or filters.'
              : 'Start by creating your first automation readiness assessment.'
          }
          action={
            <Link to="/assessments/new">
              <Button>
                <Plus size={18} />
                New Assessment
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

export default MyAssessmentsPage;
