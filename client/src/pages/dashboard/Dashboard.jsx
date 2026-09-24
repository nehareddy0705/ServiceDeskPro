import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { TicketChart } from '../../components/dashboard/TicketChart';
import { SLAOverview } from '../../components/dashboard/SLAOverview';
import { WorkloadTable } from '../../components/dashboard/WorkloadTable';
import { TicketTable } from '../../components/tickets/TicketTable';
import { AssetTable } from '../../components/assets/AssetTable';
import { Button } from '../../components/ui/Button';
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { Plus, ArrowRight, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export const Dashboard = () => {
  const { user, role, isEmployee, isTechnician, isManager, isAssetManager, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const stats = await dashboardService.getStats();
      setData(stats);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Unable to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = data?.metrics || {};

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded p-8 text-center space-y-2">
        <p className="text-xs font-semibold text-rose-700">{error}</p>
        <button
          onClick={fetchDashboard}
          className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {getGreeting()}, <span className="font-semibold text-slate-800">{user?.name}</span> · {user?.department?.name || 'Enterprise IT'}
          </p>
        </div>

        {isEmployee && (
          <Button size="sm" icon={Plus} onClick={() => navigate('/tickets/create')}>
            Create Ticket
          </Button>
        )}
      </div>

      {/* 1. EMPLOYEE DASHBOARD */}
      {isEmployee && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              value={metrics.openTickets || 0}
              label="My Open Tickets"
              subtext="Awaiting IT resolution"
              variant="warning"
            />
            <MetricCard
              value={metrics.resolvedTickets || 0}
              label="Resolved Tickets"
              subtext="Completed cases"
              variant="success"
            />
            <MetricCard
              value={metrics.totalTickets || 0}
              label="Total Submitted"
              subtext="All-time requests"
            />
            <MetricCard
              value={metrics.assignedAssets || 0}
              label="Assigned Hardware"
              subtext="Laptops, displays & devices"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                My Recent Support Requests
              </h2>
              <button
                onClick={() => navigate('/tickets')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <span>View all my tickets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {data?.recentTickets && data.recentTickets.length > 0 ? (
              <TicketTable tickets={data.recentTickets} />
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                You have not submitted any support tickets yet.
              </div>
            )}
          </div>
        </>
      )}

      {/* 2. TECHNICIAN DASHBOARD */}
      {isTechnician && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              value={metrics.activeTickets || 0}
              label="Active Assigned"
              subtext="In progress or pending intake"
              changeText="Intake queue"
            />
            <MetricCard
              value={metrics.slaAtRisk || 0}
              label="SLA at Risk"
              subtext="Within 4 hours of target"
              variant="warning"
            />
            <MetricCard
              value={metrics.criticalCount || 0}
              label="Critical Incidents"
              subtext="Highest resolution priority"
              variant="danger"
            />
            <MetricCard
              value={metrics.resolvedToday || 0}
              label="Resolved Today"
              subtext="Completed tickets today"
              variant="success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Assigned Tickets Queue
                </h2>
                <button
                  onClick={() => navigate('/tickets?scope=assigned')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <span>View all assigned</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {data?.recentTickets && data.recentTickets.length > 0 ? (
                <TicketTable tickets={data.recentTickets} />
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">No tickets assigned yet.</p>
                  <p className="text-slate-400">Assigned tickets will appear here when the IT Manager assigns them.</p>
                </div>
              )}
            </div>

            <div>
              <SLAOverview
                withinSLA={data?.slaOverview?.withinSLA ?? 0}
                atRisk={data?.slaOverview?.atRisk ?? 0}
                breached={data?.slaOverview?.breached ?? 0}
                activePoliciesCount={data?.slaOverview?.activePoliciesCount}
              />
            </div>
          </div>
        </>
      )}

      {/* 3. IT MANAGER & SYSTEM ADMIN DASHBOARD (Section 7 Exact Layout) */}
      {(isManager || isAdmin) && (
        <>
          {/* Metric Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              value={metrics.openTickets ?? 0}
              label="Open Tickets"
              subtext="Awaiting resolution"
            />
            <MetricCard
              value={metrics.slaAtRisk ?? 0}
              label="SLA at Risk"
              subtext="Approaching deadline"
              variant="warning"
            />
            <MetricCard
              value={metrics.criticalTickets ?? 0}
              label="Critical Incidents"
              subtext="Severe business impact"
              variant="danger"
            />
            <MetricCard
              value={metrics.resolvedToday ?? 0}
              label="Resolved Today"
              subtext="Cases closed today"
              variant="success"
            />
          </div>

          {/* Recent Tickets + SLA Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Recent Incidents & Service Requests
                </h2>
                <button
                  onClick={() => navigate('/tickets')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <span>View all tickets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {data?.recentTickets && data.recentTickets.length > 0 ? (
                <TicketTable tickets={data.recentTickets} />
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No recent incidents recorded.
                </div>
              )}
            </div>

            <div>
              <SLAOverview
                withinSLA={data?.slaOverview?.withinSLA ?? 0}
                atRisk={data?.slaOverview?.atRisk ?? 0}
                breached={data?.slaOverview?.breached ?? 0}
                activePoliciesCount={data?.slaOverview?.activePoliciesCount}
              />
            </div>
          </div>

          {/* Ticket Volume Chart */}
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Weekly Ticket Intake & Resolution Volume
              </h2>
              <span className="text-xs text-slate-400">Past 7 Days</span>
            </div>
            <TicketChart data={data?.weeklyVolume || []} />
          </div>

          {/* Technician Workload Table */}
          {data?.technicianWorkload && (
            <WorkloadTable technicians={data.technicianWorkload} />
          )}
        </>
      )}

      {/* 4. ASSET MANAGER DASHBOARD */}
      {isAssetManager && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              value={metrics.totalAssets || 0}
              label="Total IT Assets"
              subtext="Hardware & Peripherals"
            />
            <MetricCard
              value={metrics.assignedAssets || 0}
              label="Assigned to Staff"
              subtext="In active deployment"
              variant="success"
            />
            <MetricCard
              value={metrics.availableAssets || 0}
              label="Available in Depot"
              subtext="Ready for allocation"
            />
            <MetricCard
              value={metrics.underRepairAssets || 0}
              label="Under Repair"
              subtext="Maintenance & warranty service"
              variant="warning"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Recently Updated IT Assets
              </h2>
              <button
                onClick={() => navigate('/assets')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <span>View all assets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {data?.recentAssets && data.recentAssets.length > 0 ? (
              <AssetTable assets={data.recentAssets} />
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No recent asset modifications found.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
