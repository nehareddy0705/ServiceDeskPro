import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-sm px-4 py-2.5 gap-2 h-10',
  };

  const variantStyles = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 active:bg-slate-950 shadow-xs',
    secondary:
      'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 active:bg-slate-100 shadow-xs',
    outline:
      'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-300 active:bg-slate-200',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 border border-rose-600 active:bg-rose-800 shadow-xs',
    dangerOutline:
      'bg-transparent text-rose-700 hover:bg-rose-50 border border-rose-200 active:bg-rose-100',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
    link:
      'bg-transparent text-blue-600 hover:underline p-0 h-auto border-none active:text-blue-800',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
