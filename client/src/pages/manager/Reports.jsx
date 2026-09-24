import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/ticketService';
import { departmentService } from '../../services/departmentService';
import { TicketChart } from '../../components/dashboard/TicketChart';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { Button } from '../../components/ui/Button';
import { Download, BarChart2, CheckCircle2, AlertOctagon, TrendingUp } from 'lucide-react';

export const Reports = () => {
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = () => {
    setLoading(true);
    setError('');
    Promise.all([
      ticketService.getTickets({ limit: 100 }),
      departmentService.getDepartments(),
    ])
      .then(([tRes, dRes]) => {
        setTickets(tRes.tickets || []);
        setDepartments(dRes || []);
      })
      .catch((err) => {
        console.error('Failed to load reports data:', err);
        setError('Unable to load report analytics. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const total = tickets.length || 1;
  const resolved = tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;
  const resolutionRate = Math.round((resolved / total) * 100);

  // Dynamic Mean Time to Resolution calculation
  const resolvedWithDates = tickets.filter(
    (t) => ['resolved', 'closed'].includes(t.status) && t.resolvedAt && t.createdAt
  );
  const totalResolutionTimeMs = resolvedWithDates.reduce(
    (acc, t) => acc + (new Date(t.resolvedAt) - new Date(t.createdAt)),
    0
  );
  const avgResolutionHours =
    resolvedWithDates.length > 0
      ? (totalResolutionTimeMs / (resolvedWithDates.length * 3600000)).toFixed(1)
      : '0.0';
  const mttrDisplay = `${avgResolutionHours} hrs`;

  // Dynamic First Contact SLA Met percentage
  const evaluatedResponseTickets = tickets.filter((t) => t.sla?.firstResponseDueAt);
  const metResponseSla = evaluatedResponseTickets.filter((t) => !t.sla?.responseBreached);
  const firstContactRate =
    evaluatedResponseTickets.length > 0
      ? `${Math.round((metResponseSla.length / evaluatedResponseTickets.length) * 100)}%`
      : '100%';

  // Dynamic Trailing 7-Day Volume
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyVolume = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const createdCount = tickets.filter((t) => {
      const c = new Date(t.createdAt);
      return c >= d && c < nextD;
    }).length;

    const resolvedCount = tickets.filter((t) => {
      if (!t.resolvedAt) return false;
      const r = new Date(t.resolvedAt);
      return r >= d && r < nextD;
    }).length;

    weeklyVolume.push({
      day: dayNames[d.getDay()],
      date: d.toISOString().slice(0, 10),
      created: createdCount,
      resolved: resolvedCount,
    });
  }

  const exportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Ticket Number,Title,Priority,Status,Requester,Created At']
        .concat(
          tickets.map(
            (t) =>
              `"${t.ticketNumber}","${t.title.replace(/"/g, '""')}","${t.priority}","${t.status}","${
                t.requester?.name || ''
              }","${t.createdAt}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ServiceDesk_Operations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            IT Service Desk Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational throughput, SLA adherence trends, and volume distribution metrics.
          </p>
        </div>

        <Button size="sm" variant="secondary" icon={Download} onClick={exportReport}>
          Export CSV Report
        </Button>
      </div>

      {error && (
        <div className="bg-white border border-rose-200 rounded p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchReports}
            className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard value={tickets.length} label="Total Ticket Intake" subtext="Evaluation period" />
        <MetricCard
          value={`${resolutionRate}%`}
          label="Resolution Success Rate"
          subtext="Target: > 85%"
          variant="success"
        />
        <MetricCard value={mttrDisplay} label="Mean Time to Resolution" subtext="Business operating hours" />
        <MetricCard value={firstContactRate} label="First Contact SLA Met" subtext="Under 30m response" />
      </div>

      {/* Weekly Intake and Resolution Graph */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Daily Ticket Throughput
          </h2>
          <span className="text-xs text-slate-400">Trailing 7 days</span>
        </div>
        <TicketChart data={weeklyVolume} />
      </div>

      {/* Department Volume Breakdown */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
        <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Ticket Volume by Department
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const count = tickets.filter(
              (t) => t.department?._id === dept._id || t.department === dept._id
            ).length;
            const pct = Math.round((count / total) * 100);

            return (
              <div key={dept._id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{dept.name}</span>
                  <span className="font-mono text-slate-500 font-bold">{count} cases</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div style={{ width: `${pct}%` }} className="h-full bg-slate-900" />
                </div>
                <div className="text-[10px] text-slate-400 text-right">{pct}% of total requests</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
