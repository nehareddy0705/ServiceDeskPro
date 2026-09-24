import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ticket, Box, BookOpen, User, X, Loader2, ArrowRight } from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { assetService } from '../../services/assetService';
import { knowledgeService } from '../../services/knowledgeService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tickets: [], assets: [], articles: [], users: [] });
  const [loading, setLoading] = useState(false);
  const { isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults({ tickets: [], assets: [], articles: [], users: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ tickets: [], assets: [], articles: [], users: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const promises = [
          ticketService.getTickets({ search: query, limit: 4 }).catch(() => ({ tickets: [] })),
          assetService.getAssets({ search: query, limit: 4 }).catch(() => ({ assets: [] })),
          knowledgeService.getArticles({ search: query, limit: 4 }).catch(() => ({ articles: [] })),
        ];

        if (isManager || isAdmin) {
          promises.push(userService.getUsers({ search: query, limit: 4 }).catch(() => ({ users: [] })));
        }

        const [ticketRes, assetRes, articleRes, userRes] = await Promise.all(promises);

        setResults({
          tickets: ticketRes.tickets || [],
          assets: assetRes.assets || [],
          articles: articleRes.articles || [],
          users: userRes?.users || [],
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isManager, isAdmin]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    navigate(url);
    onClose();
  };

  const hasAnyResults =
    results.tickets.length > 0 ||
    results.assets.length > 0 ||
    results.articles.length > 0 ||
    results.users.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center animate-in fade-in duration-100"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-white rounded border border-slate-200 shadow-xl overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets, assets, knowledge articles, or personnel..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 text-sm divide-y divide-slate-100">
          {query.trim().length >= 2 && !loading && !hasAnyResults && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching records found for "{query}".
            </div>
          )}

          {/* Tickets */}
          {results.tickets.length > 0 && (
            <div className="pb-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5" /> Tickets
              </div>
              <div className="space-y-1 mt-1">
                {results.tickets.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => handleSelect(`/tickets/${t._id}`)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 font-semibold">{t.ticketNumber}</span>
                        <span className="font-medium text-slate-900 line-clamp-1">{t.title}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Status: <span className="capitalize text-slate-600">{t.status}</span> · Priority: <span className="capitalize text-slate-600">{t.priority}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assets */}
          {results.assets.length > 0 && (
            <div className="py-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" /> Assets
              </div>
              <div className="space-y-1 mt-1">
                {results.assets.map((a) => (
                  <button
                    key={a._id}
                    onClick={() => handleSelect(`/assets/${a._id}`)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 font-semibold">{a.assetTag}</span>
                        <span className="font-medium text-slate-900">{a.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Type: <span className="capitalize text-slate-600">{a.type}</span> · Status: <span className="capitalize text-slate-600">{a.status}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Articles */}
          {results.articles.length > 0 && (
            <div className="py-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Knowledge Base
              </div>
              <div className="space-y-1 mt-1">
                {results.articles.map((art) => (
                  <button
                    key={art._id}
                    onClick={() => handleSelect(`/knowledge/${art._id}`)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-900 line-clamp-1">{art.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Category: <span className="text-slate-600">{art.category?.name || 'General'}</span> · {art.viewsCount} views
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <div className="pt-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Users
              </div>
              <div className="space-y-1 mt-1">
                {results.users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleSelect(`/admin/users`)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {u.email} · <span className="capitalize text-slate-600">{u.role?.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type at least 2 characters to search across tickets, assets, and articles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
