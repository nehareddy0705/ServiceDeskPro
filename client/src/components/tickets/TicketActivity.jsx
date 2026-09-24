import React, { useState } from 'react';
import { Send, Lock, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { useToast } from '../../context/ToastContext';

export const TicketActivity = ({ ticketId, comments = [], onCommentAdded }) => {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isEmployee } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await ticketService.addComment(ticketId, {
        message: message.trim(),
        isInternal: isEmployee ? false : isInternal,
      });
      setMessage('');
      setIsInternal(false);
      toast.success(isInternal ? 'Internal note added.' : 'Comment posted.');
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Activity Timeline List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded">
            No activity or comments recorded yet.
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className={`p-3.5 rounded border text-xs ${
                c.isInternal
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                    {c.user?.name ? c.user.name.charAt(0) : 'U'}
                  </div>
                  <span className="font-semibold text-slate-900">{c.user?.name || 'User'}</span>
                  <span className="text-[10px] text-slate-500 capitalize bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {c.user?.role?.replace('_', ' ') || 'Staff'}
                  </span>
                  {c.isInternal && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      <Lock className="w-2.5 h-2.5" /> Internal Note
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(c.createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="text-slate-800 whitespace-pre-line leading-relaxed">
                {c.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Composer */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded p-3.5 space-y-2.5 shadow-2xs">
        <label htmlFor="comment-input" className="block text-xs font-semibold text-slate-700">
          Add to Ticket Activity
        </label>
        <textarea
          id="comment-input"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type an update, response to requester, or internal note..."
          className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-500 placeholder:text-slate-400"
        />

        <div className="flex items-center justify-between pt-1">
          {!isEmployee ? (
            <label className="flex items-center gap-2 text-xs text-slate-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Internal note (hidden from employee)
              </span>
            </label>
          ) : (
            <div />
          )}

          <Button type="submit" size="sm" icon={Send} loading={submitting}>
            Post {isInternal ? 'Internal Note' : 'Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
};
