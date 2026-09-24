import React from 'react';

export const MetricCard = ({
  value,
  label,
  subtext,
  changeText,
  isPositive,
  variant = 'default',
}) => {
  const valueColor =
    variant === 'danger'
      ? 'text-rose-600'
      : variant === 'warning'
      ? 'text-amber-600'
      : variant === 'success'
      ? 'text-emerald-600'
      : 'text-slate-900';

  return (
    <div className="bg-white border border-slate-200 rounded p-4 flex flex-col justify-between">
      <div>
        <div className={`text-2xl font-bold tracking-tight ${valueColor}`}>
          {value !== undefined && value !== null ? value : '—'}
        </div>
        <div className="text-xs font-medium text-slate-600 mt-1">{label}</div>
      </div>
      {(changeText || subtext) && (
        <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5">
          {changeText && (
            <span
              className={`font-medium ${
                isPositive === true
                  ? 'text-emerald-600'
                  : isPositive === false
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {changeText}
            </span>
          )}
          {subtext && <span className="text-slate-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
