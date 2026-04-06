import { useState, useEffect } from 'react';
import { MessageSquare, Reply, Edit2, Trash2, Send, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import * as promptService from '../../services/promptService';
import type { PromptComment } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  promptId: string;
  onCountChange?: (count: number) => void;
}

function CommentSection({ promptId, onCountChange }: CommentSectionProps) {
  const { currentUser, isAuthenticated, isAdmin } = useAuth();
  const [comments, setComments] = useState<PromptComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [promptId]);

  async function loadComments() {
    try {
      const data = await promptService.getComments(promptId);
      setComments(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await promptService.addComment(promptId, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
      onCountChange?.(comments.length + 1);
    } catch (err) {
      console.error('Comment operation failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string) {
    if (!replyContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await promptService.addComment(promptId, replyContent.trim(), parentId);
      setComments(prev => [...prev, comment]);
      setReplyTo(null);
      setReplyContent('');
      onCountChange?.(comments.length + 1);
    } catch (err) {
      console.error('Comment operation failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(commentId: string) {
    if (!editContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const updated = await promptService.updateComment(promptId, commentId, editContent.trim());
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Comment operation failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || submitting) return;
    setSubmitting(true);
    try {
      await promptService.deleteComment(promptId, deleteTarget);
      setComments(prev => prev.filter(c => c.id !== deleteTarget && c.parentId !== deleteTarget));
      onCountChange?.(comments.filter(c => c.id !== deleteTarget && c.parentId !== deleteTarget).length);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  }

  // Group comments: top-level and their replies
  const topLevel = comments.filter(c => !c.parentId);
  const repliesMap: Record<string, PromptComment[]> = {};
  comments.filter(c => c.parentId).forEach(c => {
    if (!repliesMap[c.parentId!]) repliesMap[c.parentId!] = [];
    repliesMap[c.parentId!].push(c);
  });

  function renderComment(comment: PromptComment, isReply = false) {
    const isOwner = currentUser?.id === comment.userId;
    const canEdit = isOwner;
    const canDelete = isOwner || isAdmin;
    const isEditing = editingId === comment.id;

    return (
      <div
        key={comment.id}
        style={{
          marginLeft: isReply ? '24px' : '0',
          padding: '12px 16px',
          borderLeft: isReply ? '2px solid var(--color-border-default)' : 'none',
          borderBottom: !isReply ? '1px solid var(--color-border-subtle)' : 'none',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--nx-text-secondary)' }}
            >
              {comment.userId}
            </span>
            <span className="text-xs" style={{ color: 'var(--nx-text-ghost)' }}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs" style={{ color: 'var(--nx-text-ghost)' }}>(edited)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {canEdit && !isEditing && (
              <button
                onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--nx-text-ghost)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--nx-text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--nx-text-ghost)'}
                aria-label="Edit comment"
              >
                <Edit2 size={12} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setDeleteTarget(comment.id)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--nx-text-ghost)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--nx-red-base)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--nx-text-ghost)'}
                aria-label="Delete comment"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full p-2 rounded text-sm"
              style={{
                backgroundColor: 'var(--nx-void-deep)',
                color: 'var(--nx-text-primary)',
                border: '1px solid var(--color-border-strong)',
                resize: 'vertical',
                minHeight: '60px',
                outline: 'none',
              }}
              maxLength={5000}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(comment.id)}
                disabled={submitting || !editContent.trim()}
                className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--nx-cyan-base)',
                  color: 'var(--nx-void-base)',
                  opacity: submitting || !editContent.trim() ? 0.5 : 1,
                }}
              >
                Save
              </button>
              <button
                onClick={() => { setEditingId(null); setEditContent(''); }}
                className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors"
                style={{ color: 'var(--nx-text-tertiary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--nx-text-secondary)' }}
          >
            {comment.content}
          </p>
        )}

        {/* Reply button (only on top-level comments) */}
        {!isReply && !isEditing && isAuthenticated && (
          <button
            onClick={() => { setReplyTo(replyTo === comment.id ? null : comment.id); setReplyContent(''); }}
            className="flex items-center gap-1 mt-2 text-xs transition-colors"
            style={{ color: 'var(--nx-text-ghost)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--nx-text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--nx-text-ghost)'}
          >
            <Reply size={12} />
            Reply
          </button>
        )}

        {/* Reply form */}
        {replyTo === comment.id && (
          <div style={{ marginTop: '8px', marginLeft: '24px' }}>
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 rounded text-sm"
              style={{
                backgroundColor: 'var(--nx-void-deep)',
                color: 'var(--nx-text-primary)',
                border: '1px solid var(--color-border-default)',
                resize: 'vertical',
                minHeight: '60px',
                outline: 'none',
              }}
              maxLength={5000}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleReply(comment.id)}
                disabled={submitting || !replyContent.trim()}
                className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--nx-cyan-base)',
                  color: 'var(--nx-void-base)',
                  opacity: submitting || !replyContent.trim() ? 0.5 : 1,
                }}
              >
                <Send size={10} />
                Reply
              </button>
              <button
                onClick={() => { setReplyTo(null); setReplyContent(''); }}
                className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors"
                style={{ color: 'var(--nx-text-tertiary)' }}
              >
                <X size={10} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2
        className="text-lg font-semibold mb-4 flex items-center gap-2"
        style={{
          color: 'var(--nx-text-primary)',
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          letterSpacing: '0.03em',
        }}
      >
        <MessageSquare size={18} />
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal" style={{ color: 'var(--nx-text-tertiary)' }}>
            ({comments.length})
          </span>
        )}
      </h2>

      {/* Add comment form */}
      {isAuthenticated && (
        <div
          className="mb-4 p-4 rounded-lg"
          style={{
            background: 'var(--nx-glass-medium)',
            border: '1px solid var(--color-border-default)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 rounded text-sm"
            style={{
              backgroundColor: 'var(--nx-void-deep)',
              color: 'var(--nx-text-primary)',
              border: '1px solid var(--nx-cyan-aura)',
              resize: 'vertical',
              minHeight: '80px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            maxLength={5000}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs" style={{ color: 'var(--nx-text-ghost)' }}>
              {newComment.length}/5000
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'var(--nx-cyan-base)',
                color: 'var(--nx-void-base)',
                opacity: submitting || !newComment.trim() ? 0.5 : 1,
                cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={14} />
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={32} style={{ color: 'var(--nx-text-ghost)', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: 'var(--nx-text-tertiary)' }}>
            No comments yet. {isAuthenticated ? 'Be the first to comment!' : 'Log in to leave a comment.'}
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--nx-cyan-aura)',
            background: 'var(--nx-void-surface)',
          }}
        >
          {topLevel.map(comment => (
            <div key={comment.id}>
              {renderComment(comment)}
              {repliesMap[comment.id]?.map(reply => renderComment(reply, true))}
            </div>
          ))}
        </div>
      )}
      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Comment" size="sm">
        <div className="flex items-start gap-3 mb-6">
          <div
            className="p-2 rounded-lg shrink-0"
            style={{ backgroundColor: 'var(--nx-red-aura, rgba(255, 51, 102, 0.1))' }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--nx-red-base)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--nx-text-secondary)' }}>
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={submitting} onClick={confirmDelete}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </Modal>
    </section>
  );
}

export { CommentSection };
