import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ customCrumbs }) => {
  const location = useLocation();

  if (customCrumbs) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-900 transition-colors flex items-center">
          <Home className="w-3.5 h-3.5" />
        </Link>
        {customCrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {crumb.path ? (
              <Link to={crumb.path} className="hover:text-slate-900 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-800 font-medium truncate max-w-[200px]">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500">
      <Link to="/dashboard" className="hover:text-slate-900 transition-colors flex items-center">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.map((segment, idx) => {
        const isLast = idx === segments.length - 1;
        const path = `/${segments.slice(0, idx + 1).join('/')}`;
        const label = decodeURIComponent(segment)
          .replace(/-/g, ' ')
          .replace(/^./, (str) => str.toUpperCase());

        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="text-slate-800 font-medium truncate max-w-[200px]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-slate-900 transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
