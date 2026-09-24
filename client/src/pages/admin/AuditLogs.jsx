import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import { useToast } from '../../context/ToastContext';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Search, FileText, Shield } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (entityFilter) params.entityType = entityFilter;

      const res = await auditService.getAuditLogs(params);
      setLogs(res.auditLogs || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const columns = [
    { header: 'Action Performed' },
    { header: 'Entity Type', className: 'w-28' },
    { header: 'Actor User', className: 'w-40' },
    { header: 'IP Address & Client' },
    { header: 'Timestamp', className: 'w-44' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Security & System Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking record of user authentication, ticket mutations, and administrative changes.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit actions, IP addresses..."
            className="w-full text-xs bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All Entities</option>
          <option value="ticket">Ticket</option>
          <option value="asset">Asset</option>
          <option value="user">User</option>
          <option value="category">Category</option>
          <option value="sla_policy">SLA Policy</option>
          <option value="department">Department</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No audit logs recorded"
          description="Security, authorization, and administrative events will appear here in real time."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <Table columns={columns}>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-xs font-medium text-slate-700">
                    {log.entityType?.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-slate-800">
                    {log.user?.name || 'System / Auto'}
                  </span>
                  {log.user?.role && (
                    <div className="text-[10px] text-slate-400 capitalize">
                      {log.user.role.replace('_', ' ')}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs font-mono text-slate-600">{log.ipAddress || 'Internal'}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-xs">
                    {log.userAgent || 'API Gateway'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-500">
                    {new Date(log.timestamp || log.createdAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </Table>

          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
