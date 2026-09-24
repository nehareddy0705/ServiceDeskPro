import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
  className = '',
}) => {
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  if (totalItems === 0) return null;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-600 sm:px-6 ${className}`}
    >
      <div>
        Showing <span className="font-medium text-slate-900">{startItem}</span> to{' '}
        <span className="font-medium text-slate-900">{endItem}</span> of{' '}
        <span className="font-medium text-slate-900">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="px-2 text-slate-600 font-medium">
          {page} / {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
