import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, User, Calendar, MessageSquare } from 'lucide-react';
import { Badge, Button, Card } from '../components/ui';
import { StarButton } from '../components/prompts/StarButton';
import { CommentSection } from '../components/prompts/CommentSection';
import { useAuth } from '../contexts/AuthContext';
import * as promptService from '../services/promptService';
import { format } from 'date-fns';
import type { Prompt } from '../types';

function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await promptService.getPromptById(id);
        setPrompt(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load prompt');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadStarred() {
      if (!id || !isAuthenticated) return;
      try {
        const result = await promptService.checkStarred(id);
        setStarred(result.starred);
      } catch {
        // ignore
      }
    }
    loadStarred();
  }, [id, isAuthenticated]);

  function handleCopy() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

  if (!prompt) {
    return (
      <div className="text-center py-20">
        <h2 style={{ color: 'var(--nx-text-secondary)' }} className="text-xl font-semibold mb-2">Prompt not found</h2>
        <p style={{ color: 'var(--nx-text-tertiary)' }} className="mb-4">The prompt you're looking for doesn't exist.</p>
        <Link to="/prompts">
          <Button variant="secondary">Back to Prompts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--nx-text-tertiary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nx-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nx-text-tertiary)')}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="max-w-3xl">
        <div className="flex items-start justify-between mb-4">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: 'var(--nx-text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            {prompt.title}
          </h1>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <StarButton
                promptId={prompt.id}
                initialStarred={starred}
                initialCount={prompt.starCount}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 text-sm" style={{ color: 'var(--nx-text-tertiary)' }}>
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {prompt.submittedBy}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {format(new Date(prompt.createdAt), 'MMM d, yyyy')}
          </span>
          <Badge variant="neutral" size="sm">{prompt.category}</Badge>
          <span style={{ color: 'var(--nx-text-tertiary)' }} className="text-xs">{prompt.aiTool}</span>
          {prompt.commentCount > 0 && (
            <span className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              {prompt.commentCount} {prompt.commentCount === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>

        <p style={{ color: 'var(--nx-text-secondary)' }} className="leading-relaxed mb-6">{prompt.description}</p>

        {/* Prompt content */}
        <Card padding="none" className="mb-6 overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              backgroundColor: 'var(--nx-void-surface)',
              borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
            }}
          >
            <span
              style={{
                color: 'var(--nx-text-secondary)',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: "'Exo 2', sans-serif",
              }}
            >
              Prompt
            </span>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={14} style={{ color: 'var(--nx-green-base)' }} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre
            className="p-4 text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              backgroundColor: 'var(--nx-void-deep)',
              color: 'var(--nx-cyan-bright)',
            }}
          >
            {prompt.content}
          </pre>
        </Card>

        {/* Problem being solved */}
        {prompt.problemBeingSolved && (
          <section className="mb-6">
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '16px', letterSpacing: '0.03em' }}
            >
              Problem Being Solved
            </h2>
            <p style={{ color: 'var(--nx-text-secondary)' }} className="leading-relaxed whitespace-pre-wrap">{prompt.problemBeingSolved}</p>
          </section>
        )}

        {/* Tips */}
        {prompt.tips && (
          <section className="mb-6">
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '16px', letterSpacing: '0.03em' }}
            >
              Tips for Usage
            </h2>
            <p style={{ color: 'var(--nx-text-secondary)' }} className="leading-relaxed whitespace-pre-wrap">{prompt.tips}</p>
          </section>
        )}

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div
            className="flex gap-2 flex-wrap pt-4"
            style={{ borderTop: '1px solid rgba(0, 212, 255, 0.1)' }}
          >
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-sm"
                style={{ backgroundColor: 'var(--nx-void-elevated)', color: 'var(--nx-text-tertiary)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments */}
        <CommentSection promptId={prompt.id} />
      </div>
    </div>
  );
}

export default PromptDetailPage;
