import React from 'react';

export const Table = ({
  columns = [],
  children,
  className = '',
  stickyHeader = false,
}) => {
  return (
    <div className={`w-full overflow-x-auto border border-slate-200 rounded bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        {columns.length > 0 && (
          <thead className={`bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-4 py-3 whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-slate-50/80 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-4 py-3 text-slate-700 whitespace-nowrap text-sm ${className}`}>
      {children}
    </td>
  );
};
