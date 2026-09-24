import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Clock, ExternalLink } from 'lucide-react';

export const WorkLogs = () => {
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTechnicianWorkLogs = async () => {
    setLoading(true);
    setError('');
    try {
      // Query assigned tickets to gather all work logs
      const res = await ticketService.getTickets({ limit: 50 });
      const allTickets = res.tickets || [];

      const logList = [];
      for (const t of allTickets) {
        try {
          const logs = await ticketService.getWorkLogs(t._id);
          if (logs && logs.length > 0) {
            logs.forEach((l) => {
              logList.push({
                ...l,
                ticket: { _id: t._id, ticketNumber: t.ticketNumber, title: t.title },
              });
            });
          }
        } catch {
          // ignore individual ticket log fetch errors
        }
      }

      // Sort descending by date
      logList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setWorkLogs(logList);
    } catch (err) {
      console.error('Failed to load work logs:', err);
      setError('Unable to load work logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianWorkLogs();
  }, []);

  const totalMinutes = workLogs.reduce((acc, log) => acc + (log.timeSpentMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const columns = [
    { header: 'Ticket', className: 'w-32' },
    { header: 'Work Description' },
    { header: 'Technician', className: 'w-36' },
    { header: 'Work Type', className: 'w-28' },
    { header: 'Time Spent', className: 'w-24' },
    { header: 'Logged At', className: 'w-36' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Technician Work Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total effort recorded: <strong className="text-slate-800">{totalHours} hours</strong> ({totalMinutes} minutes across {workLogs.length} logs)
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchTechnicianWorkLogs}
            className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : workLogs.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No work logs available."
          description="Log time spent troubleshooting directly inside ticket details."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <Table columns={columns}>
            {workLogs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  <button
                    onClick={() => navigate(`/tickets/${log.ticket._id}`)}
                    className="font-mono text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center gap-1"
                  >
                    <span>{log.ticket.ticketNumber}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-800 text-xs line-clamp-1">
                    {log.description}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">
                    {log.ticket.title}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-slate-800">
                    {log.technician?.name || 'Technician'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {log.workType}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900 text-xs">
                    {log.timeSpentMinutes}m
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] text-slate-500">
                    {new Date(log.createdAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
};
