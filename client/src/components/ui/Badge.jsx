import React from 'react';

export const Badge = ({
  children,
  variant = 'gray',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-slate-100 text-slate-800 border-slate-300', // restrained
  };

  const dotStyles = {
    gray: 'bg-slate-400',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  const sizeStyles = {
    xs: 'text-[11px] px-1.5 py-0.5 font-medium leading-none',
    sm: 'text-xs px-2 py-0.5 font-medium leading-normal',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded ${
        sizeStyles[size] || sizeStyles.sm
      } ${variantStyles[variant] || variantStyles.gray} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotStyles[variant] || dotStyles.gray
          }`}
        />
      )}
      {children}
    </span>
  );
};
