import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Users,
  XCircle,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../../components/ui';
import { Badge } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import * as useCaseService from '../../services/useCaseService';
import * as promptService from '../../services/promptService';
import * as userService from '../../services/userService';
import { format, parseISO } from 'date-fns';
import type { UseCase, Prompt, User } from '../../types';

function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [uc, p, u] = await Promise.all([
          useCaseService.getAllUseCases(),
          promptService.getAllPrompts(),
          userService.getAllUsers(),
        ]);
        setUseCases(uc);
        setPrompts(p);
        setUsers(u);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const pendingUseCases = useCases.filter(
      (uc) => uc.approvalStatus === 'pending'
    );
    const pendingPrompts = prompts.filter(
      (p) => p.approvalStatus === 'pending'
    );
    const deniedUseCases = useCases.filter(
      (uc) => uc.approvalStatus === 'denied'
    );
    const deniedPrompts = prompts.filter(
      (p) => p.approvalStatus === 'denied'
    );
    const approvedUseCases = useCases.filter(
      (uc) => uc.approvalStatus === 'approved'
    );
    const approvedPrompts = prompts.filter(
      (p) => p.approvalStatus === 'approved'
    );

    return {
      pendingCount: pendingUseCases.length + pendingPrompts.length,
      deniedCount: deniedUseCases.length + deniedPrompts.length,
      approvedCount: approvedUseCases.length + approvedPrompts.length,
      totalUsers: users.length,
      pendingUseCases,
      pendingPrompts,
    };
  }, [useCases, prompts, users]);

  const recentActivity = useMemo(() => {
    const allItems = [
      ...useCases.map((uc) => ({
        id: uc.id,
        title: uc.title,
        type: 'Use Case' as const,
        submittedBy: uc.submittedBy,
        approvalStatus: uc.approvalStatus,
        createdAt: uc.createdAt,
        link: `/use-cases/${uc.id}`,
      })),
      ...prompts.map((p) => ({
        id: p.id,
        title: p.title,
        type: 'Prompt' as const,
        submittedBy: p.submittedBy,
        approvalStatus: p.approvalStatus,
        createdAt: p.createdAt,
        link: `/prompts/${p.id}`,
      })),
    ];
    return allItems
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);
  }, [useCases, prompts]);

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'denied':
        return 'error';
      default:
        return 'neutral';
    }
  };

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

  const statCards = [
    {
      label: 'Pending Reviews',
      value: stats.pendingCount,
      icon: Clock,
      color: 'var(--nx-yellow-base, #ffaa00)',
      bgColor: 'rgba(255, 170, 0, 0.1)',
      borderColor: 'rgba(255, 170, 0, 0.25)',
      link: '/admin/pending',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'var(--nx-cyan-base)',
      bgColor: 'rgba(0, 212, 255, 0.1)',
      borderColor: 'rgba(0, 212, 255, 0.25)',
      link: '/admin/users',
    },
    {
      label: 'Denied Items',
      value: stats.deniedCount,
      icon: XCircle,
      color: 'var(--nx-red-base, #ff3366)',
      bgColor: 'rgba(255, 51, 102, 0.1)',
      borderColor: 'rgba(255, 51, 102, 0.25)',
      link: '/admin/denied',
    },
    {
      label: 'Approved Items',
      value: stats.approvedCount,
      icon: CheckCircle,
      color: 'var(--nx-green-base, #00ff88)',
      bgColor: 'rgba(0, 255, 136, 0.1)',
      borderColor: 'rgba(0, 255, 136, 0.25)',
      link: '/admin/pending',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} style={{ color: 'var(--nx-cyan-base)' }} />
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: 'var(--nx-text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            Admin Dashboard
          </h1>
        </div>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">
          Welcome back, {currentUser?.firstName}. Here is your admin overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card hoverable padding="md">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: stat.bgColor,
                    border: `1px solid ${stat.borderColor}`,
                  }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--nx-text-tertiary)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick-link cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/pending">
          <Card hoverable padding="md">
            <div className="flex items-center gap-3">
              <Clock size={18} style={{ color: 'rgba(255, 170, 0, 0.8)' }} />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--nx-text-primary)' }}
                >
                  Pending Reviews
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--nx-text-tertiary)' }}
                >
                  Review submissions
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/admin/users">
          <Card hoverable padding="md">
            <div className="flex items-center gap-3">
              <Users size={18} style={{ color: 'var(--nx-cyan-base)' }} />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--nx-text-primary)' }}
                >
                  User Management
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--nx-text-tertiary)' }}
                >
                  Manage users & roles
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/admin/denied">
          <Card hoverable padding="md">
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={18}
                style={{ color: 'rgba(255, 51, 102, 0.8)' }}
              />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--nx-text-primary)' }}
                >
                  Denied Items
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--nx-text-tertiary)' }}
                >
                  View denied submissions
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/">
          <Card hoverable padding="md">
            <div className="flex items-center gap-3">
              <FileText
                size={18}
                style={{ color: 'rgba(0, 255, 136, 0.8)' }}
              />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--nx-text-primary)' }}
                >
                  Main Dashboard
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--nx-text-tertiary)' }}
                >
                  Back to analytics
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent activity feed */}
      <Card padding="lg">
        <h2
          className="font-semibold mb-4"
          style={{
            color: 'var(--nx-text-primary)',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '14px',
            letterSpacing: '0.05em',
          }}
        >
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p
            className="text-sm text-center py-8"
            style={{ color: 'var(--nx-text-tertiary)' }}
          >
            No submissions yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.link}
                className="flex items-center justify-between gap-4 px-3 py-2 rounded-md transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(0, 212, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--nx-text-secondary)' }}
                    >
                      {item.title}
                    </p>
                    <Badge variant="primary" size="sm">
                      {item.type}
                    </Badge>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--nx-text-tertiary)' }}
                  >
                    by {item.submittedBy} &middot;{' '}
                    {format(parseISO(item.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={statusBadgeVariant(item.approvalStatus) as 'success' | 'warning' | 'error' | 'neutral'}
                  size="sm"
                >
                  {item.approvalStatus}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminDashboardPage;
