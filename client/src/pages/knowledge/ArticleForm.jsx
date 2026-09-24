import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { knowledgeService } from '../../services/knowledgeService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Save } from 'lucide-react';

export const ArticleForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    categoryService.getCategories({ isActive: true }).then((cats) => {
      setCategories(cats || []);
      if (!isEdit && cats && cats.length > 0) setCategory(cats[0]._id);
    });

    if (isEdit) {
      knowledgeService
        .getArticleById(id)
        .then((a) => {
          setTitle(a.title || '');
          setContent(a.content || '');
          setCategory(a.category?._id || a.category || '');
          setTags(a.tags ? a.tags.join(', ') : '');
          setStatus(a.status || 'published');
        })
        .catch((err) => toast.error(err.message || 'Failed to load article'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Article title is required';
    if (!content.trim()) errs.content = 'Article content is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category: category || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        status,
      };

      if (isEdit) {
        await knowledgeService.updateArticle(id, payload);
        toast.success('Knowledge article updated.');
        navigate(`/knowledge/${id}`);
      } else {
        const created = await knowledgeService.createArticle(payload);
        toast.success('Knowledge article published.');
        navigate(`/knowledge/${created._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save article.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading documentation editor...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Documentation Article' : 'Publish Knowledge Article'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal IT troubleshooting guide and self-service documentation.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded p-6 space-y-5">
        <Input
          label="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. VPN Setup and Troubleshooting Guide"
          error={errors.title}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            placeholder="Select Category..."
          />

          <Select
            label="Publication Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'published', label: 'Published (Visible to all staff)' },
              { value: 'draft', label: 'Draft (Internal engineering review)' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>

        <Input
          label="Tags (Comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="vpn, network, dns, remote-work"
          helperText="Helps the search index and directory locate this guide."
        />

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Documentation Content (Markdown supported) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="## Overview&#10;Describe the issue...&#10;&#10;## Troubleshooting Steps&#10;1. Step one&#10;2. Step two"
            className="w-full text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          {errors.content && <p className="mt-1 text-xs text-rose-600">{errors.content}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Save}>
            {isEdit ? 'Update Article' : 'Publish Article'}
          </Button>
        </div>
      </form>
    </div>
  );
};
