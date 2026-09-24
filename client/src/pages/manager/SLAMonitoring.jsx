import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { TicketPriorityBadge } from '../../components/tickets/TicketPriorityBadge';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ShieldAlert, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const SLAMonitoring = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchSLATickets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ticketService.getTickets({ limit: 40 });
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets for SLA monitoring:', err);
      setError('Unable to load SLA tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSLATickets();
  }, []);

  // Compute metrics
  const activeTickets = tickets.filter(
    (t) => !['resolved', 'closed'].includes(t.status)
  );

  const breachedTickets = activeTickets.filter(
    (t) =>
      t.sla?.resolutionBreached ||
      (t.sla?.resolutionDueAt && new Date(t.sla.resolutionDueAt) < new Date())
  );

  const atRiskTickets = activeTickets.filter((t) => {
    if (breachedTickets.includes(t)) return false;
    if (!t.sla?.resolutionDueAt) return false;
    const diffHours = (new Date(t.sla.resolutionDueAt) - Date.now()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 4;
  });

  const withinSlaTickets = activeTickets.filter(
    (t) => !breachedTickets.includes(t) && !atRiskTickets.includes(t)
  );

  const totalActive = activeTickets.length;
  const withinSlaPercent = totalActive > 0 ? Math.round((withinSlaTickets.length / totalActive) * 100) : 0;
  const atRiskPercent = totalActive > 0 ? Math.round((atRiskTickets.length / totalActive) * 100) : 0;
  const breachedPercent = totalActive > 0 ? Math.max(0, 100 - withinSlaPercent - atRiskPercent) : 0;

  const getSLAStatusBadge = (t) => {
    if (
      t.sla?.resolutionBreached ||
      (t.sla?.resolutionDueAt && new Date(t.sla.resolutionDueAt) < new Date())
    ) {
      return (
        <Badge variant="red" dot>
          Breached
        </Badge>
      );
    }
    const diffHours = (new Date(t.sla?.resolutionDueAt) - Date.now()) / (1000 * 60 * 60);
    if (diffHours > 0 && diffHours <= 4) {
      return (
        <Badge variant="amber" dot>
          At Risk
        </Badge>
      );
    }
    return (
      <Badge variant="green" dot>
        Within SLA
      </Badge>
    );
  };

  const getRemainingTime = (t) => {
    if (
      t.sla?.resolutionBreached ||
      (t.sla?.resolutionDueAt && new Date(t.sla.resolutionDueAt) < new Date())
    ) {
      return <span className="text-rose-600 font-semibold text-xs">—</span>;
    }
    if (!t.sla?.resolutionDueAt) return <span className="text-slate-400 text-xs">—</span>;

    const diffMs = new Date(t.sla.resolutionDueAt) - Date.now();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) return `${hours} hr ${minutes > 0 ? `${minutes} min` : ''}`;
    return `${minutes} min`;
  };

  const columns = [
    { header: 'Ticket' },
    { header: 'Subject' },
    { header: 'Priority' },
    { header: 'Remaining Time' },
    { header: 'Assignee' },
    { header: 'SLA Status' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          SLA Compliance Monitoring
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time incident response deadlines and breach prevention tracker.
        </p>
      </div>

      {/* Progress & Stat Blocks (Section 15 Specs) */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded">
            <div className="text-xs text-emerald-800 font-medium">Within SLA Target</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{withinSlaPercent}%</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">{withinSlaTickets.length} active tickets</div>
          </div>

          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded">
            <div className="text-xs text-amber-800 font-medium">Approaching Deadline (At Risk)</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{atRiskPercent}%</div>
            <div className="text-[11px] text-amber-600 mt-0.5">{atRiskTickets.length} active tickets</div>
          </div>

          <div className="p-3 bg-rose-50/50 border border-rose-200 rounded">
            <div className="text-xs text-rose-800 font-medium">Breached SLA Deadline</div>
            <div className="text-2xl font-bold text-rose-700 mt-1">{breachedPercent}%</div>
            <div className="text-[11px] text-rose-600 mt-0.5">{breachedTickets.length} active tickets</div>
          </div>
        </div>

        {/* Subtle Linear Progress Bar */}
        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">Fleetwide SLA Target Distribution</div>
          <div className="w-full h-2.5 bg-slate-100 rounded overflow-hidden flex">
            <div style={{ width: `${withinSlaPercent}%` }} className="bg-emerald-500" />
            <div style={{ width: `${atRiskPercent}%` }} className="bg-amber-500" />
            <div style={{ width: `${breachedPercent}%` }} className="bg-rose-500" />
          </div>
        </div>
      </div>

      {/* SLA Ticket Table (Section 15 Specs) */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Active Incidents & SLA Status
          </h2>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchSLATickets}
              className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : activeTickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active incidents currently requiring SLA monitoring.
          </div>
        ) : (
          <Table columns={columns}>
            {activeTickets.map((t) => (
              <TableRow
                key={t._id}
                onClick={() => navigate(`/tickets/${t._id}`)}
                className="hover:bg-slate-50 transition-colors"
              >
                <TableCell>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {t.ticketNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900 line-clamp-1 max-w-sm">
                    {t.title}
                  </div>
                </TableCell>
                <TableCell>
                  <TicketPriorityBadge priority={t.priority} />
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-slate-800">
                    {getRemainingTime(t)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-700">
                    {t.assignedTo ? t.assignedTo.name : <em className="text-slate-400">Unassigned</em>}
                  </span>
                </TableCell>
                <TableCell>{getSLAStatusBadge(t)}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};
