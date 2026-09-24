import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded ${className}`}
      {...props}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full border border-slate-200 rounded bg-white overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
};
