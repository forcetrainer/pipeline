import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { Badge, Card, Select, EmptyState, Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import * as useCaseService from '../services/useCaseService';
import * as promptService from '../services/promptService';
import type { ApprovalStatus } from '../types';

type ItemType = 'all' | 'usecase' | 'prompt';

const approvalVariant: Record<ApprovalStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  approved: 'success',
  pending: 'warning',
  denied: 'error',
  draft: 'neutral',
};

const approvalLabel: Record<ApprovalStatus, string> = {
  approved: 'Approved',
  pending: 'Pending Review',
  denied: 'Denied',
  draft: 'Draft',
};

interface SubmissionItem {
  id: string;
  type: 'usecase' | 'prompt';
  title: string;
  category: string;
  approvalStatus: ApprovalStatus;
  reviewNotes?: string;
  createdAt: string;
  linkTo: string;
}

function MySubmissionsPage() {
  const { currentUser } = useAuth();
  const [typeFilter, setTypeFilter] = useState<ItemType>('all');
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const [useCases, prompts] = await Promise.all([
          useCaseService.getAllUseCases(),
          promptService.getAllPrompts(),
        ]);

        const items: SubmissionItem[] = [];

        for (const uc of useCases.filter((uc) => uc.submittedById === currentUser.id)) {
          items.push({
            id: uc.id,
            type: 'usecase',
            title: uc.title,
            category: uc.category,
            approvalStatus: uc.approvalStatus,
            reviewNotes: uc.reviewNotes,
            createdAt: uc.createdAt,
            linkTo: `/use-cases/${uc.id}`,
          });
        }

        for (const p of prompts.filter((p) => p.submittedById === currentUser.id)) {
          items.push({
            id: p.id,
            type: 'prompt',
            title: p.title,
            category: p.category,
            approvalStatus: p.approvalStatus,
            reviewNotes: p.reviewNotes,
            createdAt: p.createdAt,
            linkTo: `/prompts/${p.id}`,
          });
        }

        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSubmissions(items);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return submissions;
    return submissions.filter((item) => item.type === typeFilter);
  }, [submissions, typeFilter]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'usecase', label: 'Use Cases' },
    { value: 'prompt', label: 'Prompts' },
  ];

  // Count by status
  const pendingCount = submissions.filter((s) => s.approvalStatus === 'pending').length;
  const approvedCount = submissions.filter((s) => s.approvalStatus === 'approved').length;
  const deniedCount = submissions.filter((s) => s.approvalStatus === 'denied').length;

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
              fontFamily: "'Orbitron', sans-serif",
              color: 'var(--nx-text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            My Submissions
          </h1>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">
            Track the status of your submitted use cases and prompts.
          </p>
        </div>
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ItemType)}
          className="w-40"
        />
      </div>

      {/* Status summary */}
      {submissions.length > 0 && (
        <div className="flex gap-4 mb-6">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md"
            style={{ backgroundColor: 'rgba(255, 170, 0, 0.08)', border: '1px solid rgba(255, 170, 0, 0.2)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'rgba(255, 170, 0, 0.9)' }}>{pendingCount}</span>
            <span className="text-xs" style={{ color: 'var(--nx-text-tertiary)' }}>Pending</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md"
            style={{ backgroundColor: 'rgba(0, 255, 136, 0.08)', border: '1px solid rgba(0, 255, 136, 0.2)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'rgba(0, 255, 136, 0.9)' }}>{approvedCount}</span>
            <span className="text-xs" style={{ color: 'var(--nx-text-tertiary)' }}>Approved</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md"
            style={{ backgroundColor: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.2)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'rgba(255, 51, 102, 0.9)' }}>{deniedCount}</span>
            <span className="text-xs" style={{ color: 'var(--nx-text-tertiary)' }}>Denied</span>
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Link key={`${item.type}-${item.id}`} to={item.linkTo}>
              <Card hoverable padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{ color: 'var(--nx-text-primary)' }} className="text-base font-semibold truncate">
                        {item.title}
                      </h3>
                      <Badge variant={item.type === 'usecase' ? 'primary' : 'info'} size="sm">
                        {item.type === 'usecase' ? 'Use Case' : 'Prompt'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs">
                        {formatDate(item.createdAt)}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: 'var(--nx-void-surface)', color: 'var(--nx-text-secondary)' }}
                      >
                        {item.category}
                      </span>
                    </div>
                    {item.approvalStatus === 'denied' && item.reviewNotes && (
                      <div
                        className="rounded-md px-3 py-2 mt-2"
                        style={{
                          backgroundColor: 'rgba(255, 51, 102, 0.05)',
                          border: '1px solid rgba(255, 51, 102, 0.15)',
                        }}
                      >
                        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--nx-text-tertiary)' }}>
                          Review notes:
                        </span>
                        <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm mt-0.5">
                          {item.reviewNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  <Badge variant={approvalVariant[item.approvalStatus]} size="md">
                    {approvalLabel[item.approvalStatus]}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText size={48} />}
          title="No submissions yet"
          description="You haven't submitted any use cases or prompts yet. Get started by sharing your AI experience."
          action={
            <div className="flex gap-3">
              <Link to="/use-cases/new">
                <Button>
                  <Plus size={18} />
                  New Use Case
                </Button>
              </Link>
              <Link to="/prompts/new">
                <Button variant="secondary">
                  <Plus size={18} />
                  New Prompt
                </Button>
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
}

export default MySubmissionsPage;
