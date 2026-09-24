import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { ticketService } from '../../services/ticketService';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Search, Users, ExternalLink } from 'lucide-react';

export const TechnicianWorkload = () => {
  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchWorkload = async () => {
    setLoading(true);
    setError('');
    try {
      const usersRes = await userService.getUsers({ role: 'technician', isActive: true });
      const techList = usersRes.users || [];

      // For each technician, query their active tickets
      const workloadData = await Promise.all(
        techList.map(async (tech) => {
          const ticketRes = await ticketService.getTickets({
            assignedTo: tech._id,
            limit: 50,
          });
          const tickets = ticketRes.tickets || [];
          const active = tickets.filter((t) =>
            ['open', 'assigned', 'in_progress', 'pending'].includes(t.status)
          );
          const critical = active.filter((t) => t.priority === 'critical');
          const capacity = 8;
          const status = active.length >= 7 ? 'Busy' : active.length >= 4 ? 'Moderate' : 'Available';

          return {
            _id: tech._id,
            name: tech.name,
            email: tech.email,
            employeeId: tech.employeeId,
            department: tech.department?.name || 'IT Support',
            activeCount: active.length,
            criticalCount: critical.length,
            capacity,
            status,
            tickets: active,
          };
        })
      );

      setTechnicians(workloadData);
    } catch (err) {
      console.error('Failed to load technician workloads:', err);
      setError('Unable to load technician workloads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, []);

  const filtered = technicians.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'Technician' },
    { header: 'Department' },
    { header: 'Active Tickets' },
    { header: 'Critical' },
    { header: 'Workload & Capacity' },
    { header: 'Intake Status' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Technician Workload Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor engineering capacity, ticket distribution, and intake availability.
          </p>
        </div>

        <div className="w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search technician by name..."
            icon={Search}
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={6} />
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchWorkload}
            className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded">
          <p className="font-semibold text-slate-700 mb-1">No technicians found.</p>
          <p className="text-slate-400">Active technicians will appear here when registered in the system.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <Table columns={columns}>
            {filtered.map((t) => {
              const isBusy = t.activeCount >= 7;
              const isModerate = t.activeCount >= 4 && t.activeCount < 7;
              const statusVariant = isBusy ? 'red' : isModerate ? 'amber' : 'green';

              return (
                <TableRow key={t._id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-400">{t.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{t.department}</span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/tickets?assignedTo=${t._id}`)}
                      className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 text-xs"
                      title="View technician tickets"
                    >
                      <span>{t.activeCount}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </TableCell>
                  <TableCell>
                    {t.criticalCount > 0 ? (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                        {t.criticalCount} critical
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-xs">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                        <div
                          style={{
                            width: `${Math.min(100, (t.activeCount / t.capacity) * 100)}%`,
                          }}
                          className={`h-full ${
                            isBusy ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        {t.activeCount} of {t.capacity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant} dot>
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </div>
      )}
    </div>
  );
};
