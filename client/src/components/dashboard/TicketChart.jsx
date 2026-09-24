import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const TicketChart = ({ data = [] }) => {
  const hasActivity = data && data.some((d) => (d.created || 0) > 0 || (d.resolved || 0) > 0);

  if (!data || data.length === 0 || !hasActivity) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded border border-slate-100">
        No ticket activity recorded for this period.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '4px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
            }}
          />
          <Bar dataKey="created" name="New Tickets" fill="#0f172a" radius={[2, 2, 0, 0]} />
          <Bar dataKey="resolved" name="Resolved" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
