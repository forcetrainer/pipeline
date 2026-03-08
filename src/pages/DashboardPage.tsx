import { useState, useEffect, useMemo } from 'react';
import { Users, Star } from 'lucide-react';
import { Card } from '../components/ui';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import {
  ValueScaleScatterChart,
  ScoreDistributionChart,
  SavingsHorizonChart,
} from '../components/dashboard/Charts';
import type { ScatterDataPoint, ScoreDistributionData, SavingsHorizonData } from '../components/dashboard/Charts';
import type { UseCase, Prompt, ScoreGrade } from '../types';
import { calculateScore } from '../utils/metricsCalculator';
import * as useCaseService from '../services/useCaseService';
import * as promptService from '../services/promptService';
import { format, parseISO } from 'date-fns';

const CHART_COLORS = ['#00d4ff', '#a855f7', '#00ff88', '#3b82f6', '#ffaa00', '#ff3366'];

const GRADE_COLORS: Record<ScoreGrade, string> = {
  S: '#00d4ff',
  A: '#00ff88',
  B: '#3b82f6',
  C: '#ffaa00',
  D: '#ff3366',
};

function DashboardPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [starredPrompts, setStarredPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [uc, p, starred] = await Promise.all([
          useCaseService.getAllUseCases(),
          promptService.getAllPrompts(),
          promptService.getStarred().catch(() => [] as Prompt[]),
        ]);
        setUseCases(uc);
        setPrompts(p);
        setStarredPrompts(starred);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute scores for all use cases
  const useCaseScores = useMemo(() => {
    return useCases.map((uc) => ({
      useCase: uc,
      score: calculateScore(uc.metrics),
    }));
  }, [useCases]);

  // Stats for overview cards
  const stats = useMemo(() => {
    const annualTimeSavedHours = useCases.reduce(
      (sum, uc) => sum + (uc.metrics?.annualTimeSavedHours ?? 0),
      0
    );
    const annualMoneySaved = useCases.reduce(
      (sum, uc) => sum + (uc.metrics?.annualMoneySaved ?? 0),
      0
    );
    const averageScore =
      useCaseScores.length > 0
        ? useCaseScores.reduce((sum, s) => sum + s.score.overallScore, 0) / useCaseScores.length
        : 0;

    return { annualTimeSavedHours, annualMoneySaved, averageScore };
  }, [useCases, useCaseScores]);

  // Category distribution for use cases
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    useCases.forEach((uc) => {
      counts[uc.category] = (counts[uc.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [useCases]);

  // Department distribution
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    useCases.forEach((uc) => {
      counts[uc.department] = (counts[uc.department] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [useCases]);

  // Value vs Scale scatter data
  const scatterData = useMemo<ScatterDataPoint[]>(() => {
    return useCaseScores.map(({ useCase, score }) => ({
      name: useCase.title,
      valueScore: score.valuePerUse,
      scaleScore: score.scaleFactor,
      annualSavings: useCase.metrics?.annualMoneySaved ?? 0,
      grade: score.grade,
    }));
  }, [useCaseScores]);

  // Score distribution data
  const scoreDistData = useMemo<ScoreDistributionData[]>(() => {
    const counts: Record<ScoreGrade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    useCaseScores.forEach(({ score }) => {
      counts[score.grade]++;
    });
    return (['S', 'A', 'B', 'C', 'D'] as ScoreGrade[]).map((grade) => ({
      grade,
      count: counts[grade],
      color: GRADE_COLORS[grade],
    }));
  }, [useCaseScores]);

  // Savings by time horizon data
  const savingsHorizonData = useMemo<SavingsHorizonData[]>(() => {
    const totals = useCases.reduce(
      (acc, uc) => {
        const m = uc.metrics;
        if (!m) return acc;
        return {
          dailyHours: acc.dailyHours + (m.dailyTimeSavedMinutes ?? 0) / 60,
          dailyMoney: acc.dailyMoney + (m.dailyMoneySaved ?? 0),
          weeklyHours: acc.weeklyHours + (m.weeklyTimeSavedMinutes ?? 0) / 60,
          weeklyMoney: acc.weeklyMoney + (m.weeklyMoneySaved ?? 0),
          monthlyHours: acc.monthlyHours + (m.monthlyTimeSavedHours ?? 0),
          monthlyMoney: acc.monthlyMoney + (m.monthlyMoneySaved ?? 0),
          annualHours: acc.annualHours + (m.annualTimeSavedHours ?? 0),
          annualMoney: acc.annualMoney + (m.annualMoneySaved ?? 0),
        };
      },
      {
        dailyHours: 0,
        dailyMoney: 0,
        weeklyHours: 0,
        weeklyMoney: 0,
        monthlyHours: 0,
        monthlyMoney: 0,
        annualHours: 0,
        annualMoney: 0,
      }
    );

    return [
      { period: 'Daily', hours: Math.round(totals.dailyHours * 10) / 10, money: Math.round(totals.dailyMoney) },
      { period: 'Weekly', hours: Math.round(totals.weeklyHours * 10) / 10, money: Math.round(totals.weeklyMoney) },
      { period: 'Monthly', hours: Math.round(totals.monthlyHours * 10) / 10, money: Math.round(totals.monthlyMoney) },
      { period: 'Annual', hours: Math.round(totals.annualHours * 10) / 10, money: Math.round(totals.annualMoney) },
    ];
  }, [useCases]);

  // Submissions over time (monthly)
  const timelineData = useMemo(() => {
    const months: Record<string, { useCases: number; prompts: number }> = {};
    useCases.forEach((uc) => {
      const month = format(parseISO(uc.createdAt), 'MMM yyyy');
      if (!months[month]) months[month] = { useCases: 0, prompts: 0 };
      months[month].useCases += 1;
    });
    prompts.forEach((p) => {
      const month = format(parseISO(p.createdAt), 'MMM yyyy');
      if (!months[month]) months[month] = { useCases: 0, prompts: 0 };
      months[month].prompts += 1;
    });
    return Object.entries(months)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const da = new Date(a.month);
        const db = new Date(b.month);
        return da.getTime() - db.getTime();
      });
  }, [useCases, prompts]);

  // Top contributors
  const contributors = useMemo(() => {
    const counts: Record<string, number> = {};
    useCases.forEach((uc) => {
      counts[uc.submittedBy] = (counts[uc.submittedBy] || 0) + 1;
    });
    prompts.forEach((p) => {
      counts[p.submittedBy] = (counts[p.submittedBy] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, submissions]) => ({ name, submissions }))
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 5);
  }, [useCases, prompts]);

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--nx-void-panel)',
      border: '1px solid rgba(0, 212, 255, 0.15)',
      borderRadius: '8px',
      color: 'var(--nx-text-primary)',
      fontSize: '12px',
    },
    itemStyle: { color: 'var(--nx-text-primary)' },
    labelStyle: { color: 'var(--nx-text-secondary)' },
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

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            color: 'var(--nx-text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mt-1">
          Overview of your team's AI usage and shared prompts.
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-8">
        <StatsOverview
          totalUseCases={useCases.length}
          totalPrompts={prompts.length}
          annualTimeSavedHours={stats.annualTimeSavedHours}
          annualMoneySaved={stats.annualMoneySaved}
          averageScore={stats.averageScore}
        />
      </div>

      {/* Charts row - category & department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category distribution */}
        <Card padding="lg">
          <h2
            style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '0.05em' }}
            className="font-semibold mb-4"
          >
            Use Cases by Category
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--nx-text-tertiary)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--nx-text-secondary)' }} width={120} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" fill="var(--nx-cyan-base)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--nx-text-tertiary)' }} className="text-sm text-center py-10">No data yet</p>
          )}
        </Card>

        {/* Department pie chart */}
        <Card padding="lg">
          <h2
            style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '0.05em' }}
            className="font-semibold mb-4"
          >
            Use Cases by Team
          </h2>
          {departmentData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={240}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                  >
                    {departmentData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {departmentData.map((d, idx) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span style={{ color: 'var(--nx-text-secondary)' }} className="truncate">{d.name}</span>
                    <span style={{ color: 'var(--nx-text-tertiary)' }} className="ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--nx-text-tertiary)' }} className="text-sm text-center py-10">No data yet</p>
          )}
        </Card>
      </div>

      {/* NEW: Value vs Scale Scatter Chart (full width) */}
      <div className="mb-8">
        <ValueScaleScatterChart data={scatterData} />
      </div>

      {/* NEW: Score Distribution + Savings Horizon row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ScoreDistributionChart data={scoreDistData} />
        <SavingsHorizonChart data={savingsHorizonData} />
      </div>

      {/* Timeline chart */}
      {timelineData.length > 0 && (
        <Card padding="lg" className="mb-8">
          <h2
            style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '0.05em' }}
            className="font-semibold mb-4"
          >
            Submissions Over Time
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData} margin={{ left: 0, right: 16, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 212, 255, 0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--nx-text-tertiary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--nx-text-tertiary)' }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="useCases" name="Use Cases" stroke="var(--nx-cyan-base)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="prompts" name="Prompts" stroke="var(--nx-violet-base)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* My Starred Prompts */}
      {starredPrompts.length > 0 && (
        <Card padding="lg" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={18} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
              <h2
                style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '0.05em' }}
                className="font-semibold"
              >
                My Starred Prompts
              </h2>
            </div>
            <Link to="/prompts" style={{ color: 'var(--nx-cyan-base)', fontSize: '12px', fontWeight: 500 }} className="hover:opacity-80 transition-opacity">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {starredPrompts.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/prompts/${p.id}`} className="block group">
                <div
                  className="p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--nx-void-elevated)',
                    border: '1px solid rgba(0, 212, 255, 0.08)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                    e.currentTarget.style.background = 'var(--nx-void-surface)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.08)';
                    e.currentTarget.style.background = 'var(--nx-void-elevated)';
                  }}
                >
                  <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm font-medium truncate group-hover:text-[var(--nx-cyan-base)] transition-colors">{p.title}</p>
                  <p style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs mt-1">{p.category} &middot; {p.rating > 0 ? `${p.rating.toFixed(1)} stars` : 'No ratings'}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Bottom row: contributors + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top contributors */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} style={{ color: 'var(--nx-text-tertiary)' }} />
            <h2
              style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '0.05em' }}
              className="font-semibold"
            >
              Top Contributors
            </h2>
          </div>
          <div className="space-y-3">
            {contributors.map((c, idx) => (
              <div key={c.name} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: 'var(--nx-cyan-aura)',
                    color: 'var(--nx-cyan-base)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ color: 'var(--nx-text-secondary)' }} className="text-sm truncate flex-1">{c.name}</span>
                <span style={{ color: 'var(--nx-text-tertiary)', fontFamily: "'JetBrains Mono', monospace" }} className="text-sm font-medium">{c.submissions}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent use cases */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2
              style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '0.05em' }}
              className="font-semibold"
            >
              Recent Use Cases
            </h2>
            <Link to="/use-cases" style={{ color: 'var(--nx-cyan-base)', fontSize: '12px', fontWeight: 500 }} className="hover:opacity-80 transition-opacity">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {useCases.slice(0, 5).map((uc) => (
              <Link key={uc.id} to={`/use-cases/${uc.id}`} className="block group">
                <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm font-medium group-hover:text-[var(--nx-cyan-base)] transition-colors truncate">{uc.title}</p>
                <p style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs">{uc.department} &middot; {uc.category}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent prompts */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2
              style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '0.05em' }}
              className="font-semibold"
            >
              Recent Prompts
            </h2>
            <Link to="/prompts" style={{ color: 'var(--nx-cyan-base)', fontSize: '12px', fontWeight: 500 }} className="hover:opacity-80 transition-opacity">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {prompts.slice(0, 5).map((p) => (
              <Link key={p.id} to={`/prompts/${p.id}`} className="block group">
                <p style={{ color: 'var(--nx-text-secondary)' }} className="text-sm font-medium group-hover:text-[var(--nx-cyan-base)] transition-colors truncate">{p.title}</p>
                <p style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs">{p.category} &middot; {p.rating > 0 ? `${p.rating.toFixed(1)} stars` : 'No ratings'}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
