import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { knowledgeService } from '../../services/knowledgeService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  BookOpen,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Share2,
  CheckCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const ArticleDetails = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(null); // 'yes' or 'no'
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await knowledgeService.getArticleById(id);
        setArticle(data);

        // Fetch related articles in same category
        if (data?.category?._id || data?.category) {
          const catId = data.category._id || data.category;
          const related = await knowledgeService.getArticles({
            category: catId,
            limit: 4,
          });
          setRelatedArticles(
            (related.articles || []).filter((a) => a._id !== id).slice(0, 3)
          );
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load article.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    setVoted(null);
  }, [id]);

  const handleVote = async (helpful) => {
    setSubmittingFeedback(true);
    try {
      await knowledgeService.submitFeedback(id, { helpful });
      setVoted(helpful ? 'yes' : 'no');
      toast.success('Thank you for your feedback.');
    } catch (err) {
      toast.error('Feedback failed to record.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white border border-slate-200 rounded">
        <h3 className="text-sm font-semibold text-slate-800">Article not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested documentation article could not be located.
        </p>
        <Button size="sm" onClick={() => navigate('/knowledge')}>
          Return to Knowledge Base
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate('/knowledge')}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Base
        </button>

        <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
          {article.category?.name || 'General Support'}
        </span>
      </div>

      {/* Main Article Container */}
      <article className="bg-white border border-slate-200 rounded p-6 sm:p-8 space-y-6">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Last updated:{' '}
              {new Date(article.updatedAt || article.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Author: {article.author?.name || 'IT Support Engineering'}
            </span>
            <span>·</span>
            <span>{article.viewsCount || 1} views</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="text-sm text-slate-800 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-4">
          {article.content}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Feedback Section (Helpful? Yes / No) */}
        <div className="pt-6 border-t border-slate-200 bg-slate-50 p-4 rounded text-center">
          <p className="text-xs font-semibold text-slate-800 mb-2">
            Was this article helpful?
          </p>

          {voted ? (
            <div className="text-xs text-emerald-700 font-medium flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Thank you for helping us improve our IT documentation!
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Button
                size="sm"
                variant="outline"
                icon={ThumbsUp}
                onClick={() => handleVote(true)}
                disabled={submittingFeedback}
              >
                Yes, helpful ({article.upvotes || 0})
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={ThumbsDown}
                onClick={() => handleVote(false)}
                disabled={submittingFeedback}
              >
                No
              </Button>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles (Section 14 Specs) */}
      {relatedArticles.length > 0 && (
        <div className="bg-white border border-slate-200 rounded p-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Related Troubleshooting Articles
          </h2>
          <div className="divide-y divide-slate-100">
            {relatedArticles.map((rel) => (
              <div
                key={rel._id}
                onClick={() => navigate(`/knowledge/${rel._id}`)}
                className="py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 px-2 rounded transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {rel.title}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
