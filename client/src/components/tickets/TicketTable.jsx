import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableRow, TableCell } from '../ui/Table';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { Clock, AlertTriangle } from 'lucide-react';

export const TicketTable = ({ tickets = [], loading = false }) => {
  const navigate = useNavigate();

  const columns = [
    { header: 'ID', className: 'w-24' },
    { header: 'Title' },
    { header: 'Priority', className: 'w-24' },
    { header: 'Status', className: 'w-28' },
    { header: 'Assignee', className: 'w-36' },
    { header: 'SLA Remaining', className: 'w-32' },
  ];

  const calculateRemainingSLA = (ticket) => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return <span className="text-slate-400 text-xs">Resolved</span>;
    }

    if (ticket.sla?.resolutionBreached) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3" /> Breached
        </span>
      );
    }

    const targetDate = ticket.sla?.resolutionDueAt ? new Date(ticket.sla.resolutionDueAt) : null;
    if (!targetDate) return <span className="text-slate-400 text-xs">—</span>;

    const diffMs = targetDate.getTime() - Date.now();
    if (diffMs <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3" /> Breached
        </span>
      );
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    const formatted = hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;
    const isAtRisk = diffMinutes <= 60;

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium ${
          isAtRisk ? 'text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold' : 'text-slate-600'
        }`}
      >
        <Clock className="w-3 h-3 text-slate-400" />
        {formatted}
      </span>
    );
  };

  return (
    <Table columns={columns}>
      {tickets.map((t) => (
        <TableRow
          key={t._id}
          onClick={() => navigate(`/tickets/${t._id}`)}
          className="hover:bg-slate-50 transition-colors"
        >
          <TableCell>
            <span className="font-mono text-xs font-semibold text-slate-700">
              {t.ticketNumber}
            </span>
          </TableCell>
          <TableCell>
            <div className="font-medium text-slate-900 line-clamp-1 max-w-md">
              {t.title}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{t.category?.name || 'General Support'}</span>
              <span>·</span>
              <span>Req: {t.requester?.name || 'User'}</span>
            </div>
          </TableCell>
          <TableCell>
            <TicketPriorityBadge priority={t.priority} />
          </TableCell>
          <TableCell>
            <TicketStatusBadge status={t.status} />
          </TableCell>
          <TableCell>
            {t.assignedTo ? (
              <span className="text-slate-800 text-xs font-medium">
                {t.assignedTo.name}
              </span>
            ) : (
              <span className="text-slate-400 text-xs italic">Unassigned</span>
            )}
          </TableCell>
          <TableCell>{calculateRemainingSLA(t)}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
};
