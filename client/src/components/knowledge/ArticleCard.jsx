import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ThumbsUp, ArrowRight } from 'lucide-react';

export const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const formatUpdated = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      onClick={() => navigate(`/knowledge/${article._id}`)}
      className="p-4 bg-white border border-slate-200 rounded hover:border-slate-400 hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-700">
            {article.category?.name || 'General Support'}
          </span>
          <span className="text-[11px] text-slate-400">
            Updated {formatUpdated(article.updatedAt || article.createdAt)}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
          {article.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {article.content?.replace(/[#*`]/g, '').slice(0, 140)}...
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>{article.category?.name || 'Network'} · 4 min read</span>
          {article.upvotes > 0 && (
            <span className="flex items-center gap-1 text-slate-500">
              <ThumbsUp className="w-3 h-3" /> {article.upvotes}
            </span>
          )}
        </div>
        <span className="text-blue-600 font-medium flex items-center gap-1 text-xs">
          Read <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
