import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Copy, Check, Star } from 'lucide-react';
import { SearchBar, Button, Badge, EmptyState, Card, Select } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import * as promptService from '../services/promptService';
import { PROMPT_CATEGORIES } from '../types';
import type { Prompt, PromptSortField, SortDirection } from '../types';

const approvalVariant = {
  approved: 'success' as const,
  pending: 'warning' as const,
  denied: 'error' as const,
  draft: 'neutral' as const,
};

function PromptCard({ prompt, showApproval }: { prompt: Prompt; showApproval?: boolean }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Link to={`/prompts/${prompt.id}`}>
      <Card hoverable padding="md" className="h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 style={{ color: 'var(--nx-text-primary)' }} className="text-base font-semibold line-clamp-1 flex-1 mr-2">{prompt.title}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {showApproval && (
              <Badge variant={approvalVariant[prompt.approvalStatus]} size="sm">{prompt.approvalStatus}</Badge>
            )}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md transition-colors shrink-0"
              style={{ color: 'var(--nx-text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--nx-text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--nx-void-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--nx-text-tertiary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Copy prompt"
            >
              {copied ? <Check size={16} style={{ color: 'var(--nx-green-base)' }} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm line-clamp-2 mb-3 flex-1">{prompt.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">{prompt.category}</Badge>
            <span style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs">{prompt.aiTool}</span>
          </div>
          <div className="flex items-center gap-2">
            {prompt.starCount > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#fbbf24' }}>
                <Star size={12} fill="#fbbf24" strokeWidth={0} />
                {prompt.starCount}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function PromptsPage() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<PromptSortField>('date');
  const [sortDirection] = useState<SortDirection>('desc');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await promptService.getAllPrompts();
        setPrompts(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load prompts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...prompts];

    // Non-admin users only see approved items
    if (!isAdmin) {
      result = result.filter((p) => p.approvalStatus === 'approved');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }

    result.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'date':
          return dir * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'effectiveness':
          return dir * ((b.effectivenessRating ?? 0) - (a.effectivenessRating ?? 0));
        case 'stars':
          return dir * (b.starCount - a.starCount);
        case 'title':
          return dir * a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [prompts, isAdmin, searchQuery, categoryFilter, sortField, sortDirection]);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...PROMPT_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  const sortOptions = [
    { value: 'date', label: 'Newest First' },
    { value: 'stars', label: 'Most Starred' },
    { value: 'title', label: 'By Title' },
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
            Prompt Library
          </h1>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">Discover and share effective AI prompts.</p>
        </div>
        <Link to="/prompts/new">
          <Button>
            <Plus size={18} />
            New Prompt
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            placeholder="Search prompts..."
            onSearch={setSearchQuery}
          />
        </div>
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-44"
        />
        <Select
          options={sortOptions}
          value={sortField}
          onChange={(e) => setSortField(e.target.value as PromptSortField)}
          className="w-full sm:w-44"
        />
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <PromptCard key={p.id} prompt={p} showApproval={isAdmin} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No prompts found"
          description={searchQuery ? 'Try adjusting your search or filters.' : 'Be the first to share a prompt with your team.'}
          action={
            <Link to="/prompts/new">
              <Button>
                <Plus size={18} />
                Add Prompt
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

export default PromptsPage;
