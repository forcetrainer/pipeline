import { useState, useEffect, useMemo } from 'react';
import { Ban, RotateCcw, CheckCircle } from 'lucide-react';
import { Button, Badge, Card, Select, EmptyState } from '../../components/ui';
import { useToast } from '../../components/ui/ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import * as useCaseService from '../../services/useCaseService';
import * as promptService from '../../services/promptService';
import type { UseCase, Prompt } from '../../types';

type ItemType = 'all' | 'usecase' | 'prompt';

interface DeniedItem {
  id: string;
  type: 'usecase' | 'prompt';
  title: string;
  submittedBy: string;
  category: string;
  reviewNotes: string;
  reviewedAt: string;
  data: UseCase | Prompt;
}

function DeniedItemsPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [typeFilter, setTypeFilter] = useState<ItemType>('all');
  const [deniedItems, setDeniedItems] = useState<DeniedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    try {
      const [useCases, prompts] = await Promise.all([
        useCaseService.getAllUseCases(),
        promptService.getAllPrompts(),
      ]);

      const items: DeniedItem[] = [];

      for (const uc of useCases.filter((uc) => uc.approvalStatus === 'denied')) {
        items.push({
          id: uc.id,
          type: 'usecase',
          title: uc.title,
          submittedBy: uc.submittedBy,
          category: uc.category,
          reviewNotes: uc.reviewNotes ?? '',
          reviewedAt: uc.reviewedAt ?? uc.updatedAt,
          data: uc,
        });
      }

      for (const p of prompts.filter((p) => p.approvalStatus === 'denied')) {
        items.push({
          id: p.id,
          type: 'prompt',
          title: p.title,
          submittedBy: p.submittedBy,
          category: p.category,
          reviewNotes: p.reviewNotes ?? '',
          reviewedAt: p.reviewedAt ?? p.updatedAt,
          data: p,
        });
      }

      items.sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
      setDeniedItems(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load denied items');
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
    if (typeFilter === 'all') return deniedItems;
    return deniedItems.filter((item) => item.type === typeFilter);
  }, [deniedItems, typeFilter]);

  async function handleReconsider(item: DeniedItem) {
    if (item.type === 'usecase') {
      await useCaseService.updateUseCase(item.id, {
        approvalStatus: 'pending',
        reviewedBy: undefined,
        reviewNotes: undefined,
        reviewedAt: undefined,
      });
    } else {
      await promptService.updatePrompt(item.id, {
        approvalStatus: 'pending',
        reviewedBy: undefined,
        reviewNotes: undefined,
        reviewedAt: undefined,
      });
    }
    addToast(`"${item.title}" moved back to pending review.`, 'info');
    await loadItems();
  }

  async function handleApprove(item: DeniedItem) {
    const now = new Date().toISOString();
    if (item.type === 'usecase') {
      await useCaseService.updateUseCase(item.id, {
        approvalStatus: 'approved',
        reviewedBy: currentUser?.id,
        reviewNotes: undefined,
        reviewedAt: now,
      });
    } else {
      await promptService.updatePrompt(item.id, {
        approvalStatus: 'approved',
        reviewedBy: currentUser?.id,
        reviewNotes: undefined,
        reviewedAt: now,
      });
    }
    addToast(`"${item.title}" has been approved.`, 'success');
    await loadItems();
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
              fontFamily: 'var(--font-display)',
              color: 'var(--nx-text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            Denied Items
          </h1>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">
            {filtered.length} denied submission{filtered.length !== 1 ? 's' : ''}
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
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 style={{ color: 'var(--nx-text-primary)' }} className="text-base font-semibold truncate">
                      {item.title}
                    </h3>
                    <Badge variant={item.type === 'usecase' ? 'primary' : 'info'} size="sm">
                      {item.type === 'usecase' ? 'Use Case' : 'Prompt'}
                    </Badge>
                    <Badge variant="error" size="sm">denied</Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ color: 'var(--nx-text-secondary)' }} className="text-sm">
                      by {item.submittedBy}
                    </span>
                    <span style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs">
                      Denied {formatDate(item.reviewedAt)}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-sm"
                      style={{ backgroundColor: 'var(--nx-void-surface)', color: 'var(--nx-text-secondary)' }}
                    >
                      {item.category}
                    </span>
                  </div>
                  {item.reviewNotes && (
                    <div
                      className="rounded-md px-3 py-2 mt-1"
                      style={{
                        backgroundColor: 'var(--nx-red-aura)',
                        border: '1px solid var(--nx-red-glow)',
                      }}
                    >
                      <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--nx-text-tertiary)' }}>
                        Denial reason:
                      </span>
                      <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm mt-0.5">
                        {item.reviewNotes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => handleReconsider(item)}>
                    <RotateCcw size={14} />
                    Reconsider
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(item)}>
                    <CheckCircle size={14} />
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Ban size={48} />}
          title="No denied items"
          description="There are no denied submissions to display."
        />
      )}
    </div>
  );
}

export default DeniedItemsPage;
