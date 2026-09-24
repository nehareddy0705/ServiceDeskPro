import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeService } from '../../services/knowledgeService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { ArticleCard } from '../../components/knowledge/ArticleCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Search, BookOpen, Plus, Tag } from 'lucide-react';

export const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isTechnician, isManager, isAdmin } = useAuth();
  const canPublish = isTechnician || isManager || isAdmin;
  const navigate = useNavigate();

  useEffect(() => {
    categoryService
      .getCategories({ isActive: true })
      .then((c) => setCategories(c || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { status: 'published', limit: 30 };
      if (selectedCategory) params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await knowledgeService.getArticles(params);
      setArticles(res.articles || []);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError('Unable to load knowledge articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(fetchArticles, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal IT documentation, troubleshooting guides, and self-service procedures
          </p>
        </div>

        {canPublish && (
          <Button size="sm" icon={Plus} onClick={() => navigate('/knowledge/new')}>
            New Article
          </Button>
        )}
      </div>

      {/* Search Header (Section 14 Specs) */}
      <div className="bg-white border border-slate-200 rounded p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search troubleshooting articles, VPN guides, hardware setup..."
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded pl-10 pr-4 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Chips (Section 14 Specs) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id === selectedCategory ? '' : cat._id)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCategory === cat._id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article Grid / Empty State / Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchArticles}
            className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No knowledge articles available."
          description="Articles published by the IT team will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((art) => (
            <ArticleCard key={art._id} article={art} />
          ))}
        </div>
      )}
    </div>
  );
};
