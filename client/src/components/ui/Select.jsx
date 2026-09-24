import React from 'react';

export const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full text-sm bg-white border rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition-colors appearance-none pr-8 disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
          }`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const labelText = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
