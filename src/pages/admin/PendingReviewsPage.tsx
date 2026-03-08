import { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button, Badge, Card, Modal, Textarea, Select, EmptyState } from '../../components/ui';
import { useToast } from '../../components/ui/ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import * as useCaseService from '../../services/useCaseService';
import * as promptService from '../../services/promptService';
import type { UseCase, Prompt } from '../../types';

type ItemType = 'all' | 'usecase' | 'prompt';

interface PendingItem {
  id: string;
  type: 'usecase' | 'prompt';
  title: string;
  submittedBy: string;
  category: string;
  createdAt: string;
  data: UseCase | Prompt;
}

function PendingReviewsPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [typeFilter, setTypeFilter] = useState<ItemType>('all');
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'deny' | null>(null);
  const [denyNotes, setDenyNotes] = useState('');
  const [denyError, setDenyError] = useState('');
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    try {
      const [useCases, prompts] = await Promise.all([
        useCaseService.getAllUseCases(),
        promptService.getAllPrompts(),
      ]);

      const items: PendingItem[] = [];

      for (const uc of useCases.filter((uc) => uc.approvalStatus === 'pending')) {
        items.push({
          id: uc.id,
          type: 'usecase',
          title: uc.title,
          submittedBy: uc.submittedBy,
          category: uc.category,
          createdAt: uc.createdAt,
          data: uc,
        });
      }

      for (const p of prompts.filter((p) => p.approvalStatus === 'pending')) {
        items.push({
          id: p.id,
          type: 'prompt',
          title: p.title,
          submittedBy: p.submittedBy,
          category: p.category,
          createdAt: p.createdAt,
          data: p,
        });
      }

      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingItems(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pending items');
    }
  }

  useEffect(() => {
    async function load() {
      await loadItems();
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return pendingItems;
    return pendingItems.filter((item) => item.type === typeFilter);
  }, [pendingItems, typeFilter]);

  async function handleApprove(item: PendingItem) {
    const now = new Date().toISOString();
    if (item.type === 'usecase') {
      await useCaseService.updateUseCase(item.id, {
        approvalStatus: 'approved',
        reviewedBy: currentUser?.id,
        reviewedAt: now,
      });
    } else {
      await promptService.updatePrompt(item.id, {
        approvalStatus: 'approved',
        reviewedBy: currentUser?.id,
        reviewedAt: now,
      });
    }
    addToast(`"${item.title}" has been approved.`, 'success');
    setSelectedItem(null);
    setReviewAction(null);
    await loadItems();
  }

  async function handleDeny(item: PendingItem) {
    if (!denyNotes.trim()) {
      setDenyError('Please provide a reason for denying this submission.');
      return;
    }
    const now = new Date().toISOString();
    if (item.type === 'usecase') {
      await useCaseService.updateUseCase(item.id, {
        approvalStatus: 'denied',
        reviewedBy: currentUser?.id,
        reviewNotes: denyNotes.trim(),
        reviewedAt: now,
      });
    } else {
      await promptService.updatePrompt(item.id, {
        approvalStatus: 'denied',
        reviewedBy: currentUser?.id,
        reviewNotes: denyNotes.trim(),
        reviewedAt: now,
      });
    }
    addToast(`"${item.title}" has been denied.`, 'info');
    setSelectedItem(null);
    setReviewAction(null);
    setDenyNotes('');
    setDenyError('');
    await loadItems();
  }

  function openReview(item: PendingItem) {
    setSelectedItem(item);
    setReviewAction(null);
    setDenyNotes('');
    setDenyError('');
  }

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
            Pending Reviews
          </h1>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ItemType)}
          className="w-40"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={`${item.type}-${item.id}`} padding="md">
              <div className="flex items-center justify-between">
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
                    <span style={{ color: 'var(--nx-text-secondary)' }} className="text-sm">
                      by {item.submittedBy}
                    </span>
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
                </div>
                <Button size="sm" variant="secondary" onClick={() => openReview(item)}>
                  <Eye size={16} />
                  Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardCheck size={48} />}
          title="No pending reviews"
          description="All submissions have been reviewed. Check back later for new submissions."
        />
      )}

      {/* Review Detail Modal */}
      <Modal
        isOpen={selectedItem !== null}
        onClose={() => { setSelectedItem(null); setReviewAction(null); }}
        title={selectedItem?.title ?? ''}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Meta info */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={selectedItem.type === 'usecase' ? 'primary' : 'info'} size="sm">
                {selectedItem.type === 'usecase' ? 'Use Case' : 'Prompt'}
              </Badge>
              <span style={{ color: 'var(--nx-text-secondary)' }} className="text-sm">
                Submitted by {selectedItem.submittedBy}
              </span>
              <span style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs">
                {formatDate(selectedItem.createdAt)}
              </span>
            </div>

            {/* Content */}
            <div
              className="rounded-md p-4 max-h-60 overflow-y-auto"
              style={{ backgroundColor: 'var(--nx-void-elevated)', border: '1px solid rgba(0, 212, 255, 0.1)' }}
            >
              {selectedItem.type === 'usecase' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide" style={{ color: 'var(--nx-text-tertiary)' }}>Description</label>
                    <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm mt-1">
                      {(selectedItem.data as UseCase).description}
                    </p>
                  </div>
                  {(selectedItem.data as UseCase).whatWasBuilt && (
                    <div>
                      <label className="text-xs uppercase tracking-wide" style={{ color: 'var(--nx-text-tertiary)' }}>What Was Built</label>
                      <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm mt-1">
                        {(selectedItem.data as UseCase).whatWasBuilt}
                      </p>
                    </div>
                  )}
                  {(selectedItem.data as UseCase).keyLearnings && (
                    <div>
                      <label className="text-xs uppercase tracking-wide" style={{ color: 'var(--nx-text-tertiary)' }}>Key Learnings</label>
                      <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm mt-1">
                        {(selectedItem.data as UseCase).keyLearnings}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide" style={{ color: 'var(--nx-text-tertiary)' }}>Description</label>
                    <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm mt-1">
                      {(selectedItem.data as Prompt).description}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide" style={{ color: 'var(--nx-text-tertiary)' }}>Prompt Content</label>
                    <pre
                      className="text-sm mt-1 whitespace-pre-wrap font-mono"
                      style={{ color: 'var(--nx-text-secondary)' }}
                    >
                      {(selectedItem.data as Prompt).content}
                    </pre>
                  </div>
                  {(selectedItem.data as Prompt).problemBeingSolved && (
                    <div>
                      <label className="text-xs uppercase tracking-wide" style={{ color: 'var(--nx-text-tertiary)' }}>Problem Being Solved</label>
                      <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm mt-1">
                        {(selectedItem.data as Prompt).problemBeingSolved}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Deny notes section */}
            {reviewAction === 'deny' && (
              <div>
                <Textarea
                  label="Reason for denial"
                  placeholder="Explain why this submission is being denied..."
                  value={denyNotes}
                  onChange={(e) => { setDenyNotes(e.target.value); setDenyError(''); }}
                  error={denyError}
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {reviewAction === 'deny' ? (
                <>
                  <Button variant="danger" onClick={() => handleDeny(selectedItem)}>
                    <XCircle size={16} />
                    Confirm Denial
                  </Button>
                  <Button variant="secondary" onClick={() => { setReviewAction(null); setDenyNotes(''); setDenyError(''); }}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => handleApprove(selectedItem)}>
                    <CheckCircle size={16} />
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => setReviewAction('deny')}>
                    <XCircle size={16} />
                    Deny
                  </Button>
                  <Button variant="secondary" onClick={() => setSelectedItem(null)}>
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PendingReviewsPage;
