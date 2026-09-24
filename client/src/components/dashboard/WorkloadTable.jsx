import React from 'react';
import { Table, TableRow, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';

export const WorkloadTable = ({ technicians = [] }) => {
  const columns = [
    { header: 'Technician' },
    { header: 'Active Tickets' },
    { header: 'Critical' },
    { header: 'Capacity' },
    { header: 'Status' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          Technician Workload & Intake Capacity
        </h4>
        <span className="text-xs text-slate-500 font-medium">
          {technicians.length} Assigned Engineers
        </span>
      </div>

      <Table columns={columns}>
        {technicians.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-6 text-center text-xs text-slate-500">
              No technician activity logged.
            </td>
          </tr>
        ) : (
          technicians.map((t) => {
            const isBusy = t.activeTickets >= 7;
            const isModerate = t.activeTickets >= 4 && t.activeTickets < 7;
            const statusVariant = isBusy ? 'red' : isModerate ? 'amber' : 'green';
            const statusLabel = isBusy ? 'Busy' : isModerate ? 'Moderate' : 'Available';

            return (
              <TableRow key={t.id || t.email}>
                <TableCell>
                  <div className="font-medium text-slate-900">{t.name}</div>
                  <div className="text-[11px] text-slate-400">{t.email}</div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900">{t.activeTickets}</span>
                </TableCell>
                <TableCell>
                  {t.criticalTickets > 0 ? (
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                      {t.criticalTickets} critical
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, (t.activeTickets / (t.capacity || 8)) * 100)}%`,
                        }}
                        className={`h-full ${
                          isBusy ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {t.activeTickets}/{t.capacity || 8}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant} dot>
                    {statusLabel}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </Table>
    </div>
  );
};
