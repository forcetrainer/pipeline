import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Lightbulb } from 'lucide-react';
import { SearchBar, Button, Badge, EmptyState, Card } from '../components/ui';
import { Select } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import * as useCaseService from '../services/useCaseService';
import { USE_CASE_CATEGORIES, DEPARTMENTS } from '../types';
import type { UseCase, UseCaseSortField, SortDirection } from '../types';

const impactVariant = {
  high: 'success' as const,
  medium: 'warning' as const,
  low: 'neutral' as const,
};

const statusVariant = {
  active: 'success' as const,
  pilot: 'warning' as const,
  idea: 'info' as const,
  archived: 'neutral' as const,
};

const approvalVariant = {
  approved: 'success' as const,
  pending: 'warning' as const,
  denied: 'error' as const,
  draft: 'neutral' as const,
};

function UseCaseCard({ useCase, showApproval }: { useCase: UseCase; showApproval?: boolean }) {
  return (
    <Link to={`/use-cases/${useCase.id}`}>
      <Card hoverable padding="md" className="h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 style={{ color: 'var(--nx-text-primary)' }} className="text-base font-semibold line-clamp-1 flex-1 mr-2">{useCase.title}</h3>
          <div className="flex gap-1.5 shrink-0">
            {showApproval && (
              <Badge variant={approvalVariant[useCase.approvalStatus]} size="sm">{useCase.approvalStatus}</Badge>
            )}
            <Badge variant={statusVariant[useCase.status]} size="sm">{useCase.status}</Badge>
          </div>
        </div>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm line-clamp-2 mb-3 flex-1">{useCase.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={impactVariant[useCase.impact]} size="sm">{useCase.impact} impact</Badge>
          <span
            className="text-xs px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: 'var(--nx-void-surface)', color: 'var(--nx-text-secondary)' }}
          >
            {useCase.category}
          </span>
          <span style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs ml-auto">{useCase.department}</span>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {useCase.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded-sm"
              style={{ backgroundColor: 'var(--nx-void-elevated)', color: 'var(--nx-text-tertiary)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </Card>
    </Link>
  );
}

function UseCasesPage() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortField, setSortField] = useState<UseCaseSortField>('date');
  const [sortDirection] = useState<SortDirection>('desc');
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await useCaseService.getAllUseCases();
        setUseCases(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load use cases');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...useCases];

    // Non-admin users only see approved items
    if (!isAdmin) {
      result = result.filter((uc) => uc.approvalStatus === 'approved');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (uc) =>
          uc.title.toLowerCase().includes(q) ||
          uc.description.toLowerCase().includes(q) ||
          uc.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (categoryFilter) {
      result = result.filter((uc) => uc.category === categoryFilter);
    }
    if (departmentFilter) {
      result = result.filter((uc) => uc.department === departmentFilter);
    }

    result.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'date':
          return dir * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'title':
          return dir * a.title.localeCompare(b.title);
        case 'timeSaved':
          return dir * ((b.metrics?.timeSavedHours ?? 0) - (a.metrics?.timeSavedHours ?? 0));
        case 'moneySaved':
          return dir * ((b.metrics?.moneySavedDollars ?? 0) - (a.metrics?.moneySavedDollars ?? 0));
        default:
          return 0;
      }
    });

    return result;
  }, [useCases, isAdmin, searchQuery, categoryFilter, departmentFilter, sortField, sortDirection]);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...USE_CASE_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  const departmentOptions = [
    { value: '', label: 'All Teams' },
    ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
  ];

  const sortOptions = [
    { value: 'date', label: 'Newest First' },
    { value: 'title', label: 'By Title' },
    { value: 'timeSaved', label: 'Most Time Saved' },
    { value: 'moneySaved', label: 'Most Money Saved' },
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
            Use Cases
          </h1>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">Browse AI use cases shared by your team.</p>
        </div>
        <Link to="/use-cases/new">
          <Button>
            <Plus size={18} />
            New Use Case
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            placeholder="Search use cases..."
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
          options={departmentOptions}
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full sm:w-40"
        />
        <Select
          options={sortOptions}
          value={sortField}
          onChange={(e) => setSortField(e.target.value as UseCaseSortField)}
          className="w-full sm:w-44"
        />
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((uc) => (
            <UseCaseCard key={uc.id} useCase={uc} showApproval={isAdmin} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Lightbulb size={48} />}
          title="No use cases found"
          description={searchQuery ? 'Try adjusting your search or filters.' : 'Be the first to share an AI use case with your team.'}
          action={
            <Link to="/use-cases/new">
              <Button>
                <Plus size={18} />
                Add Use Case
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}

export default UseCasesPage;
