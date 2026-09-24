import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TicketStatusBadge } from '../../components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '../../components/tickets/TicketPriorityBadge';
import { TicketSLA } from '../../components/tickets/TicketSLA';
import { TicketActivity } from '../../components/tickets/TicketActivity';
import { AssignTechnicianModal } from '../../components/tickets/AssignTechnicianModal';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  User,
  Building2,
  Tag,
  Box,
  Clock,
  UserCheck,
  CheckCircle2,
  RotateCcw,
  Plus,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, worklogs
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [workLogModalOpen, setWorkLogModalOpen] = useState(false);

  // Forms state
  const [resolutionText, setResolutionText] = useState('');
  const [workLogDesc, setWorkLogDesc] = useState('');
  const [workLogMinutes, setWorkLogMinutes] = useState(30);
  const [workLogType, setWorkLogType] = useState('troubleshooting');
  const [submitting, setSubmitting] = useState(false);

  const { user, isEmployee, isTechnician, isManager, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchTicket = async () => {
    try {
      const data = await ticketService.getTicketById(id);
      setTicket(data);
    } catch (err) {
      toast.error(err.message || 'Unable to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusChange = async (nextStatus, resolution = null) => {
    setSubmitting(true);
    try {
      const payload = { status: nextStatus };
      if (resolution) payload.resolution = resolution;

      const updated = await ticketService.updateTicket(id, payload);
      setTicket(updated);
      toast.success(`Ticket status updated to "${nextStatus.replace('_', ' ')}".`);
      setResolveModalOpen(false);
      setReopenModalOpen(false);
      setResolutionText('');
    } catch (err) {
      toast.error(err.message || 'Status transition failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddWorkLog = async (e) => {
    e.preventDefault();
    if (!workLogDesc.trim()) return;

    setSubmitting(true);
    try {
      await ticketService.addWorkLog(id, {
        description: workLogDesc.trim(),
        timeSpentMinutes: Number(workLogMinutes),
        workType: workLogType,
      });
      toast.success('Work log recorded.');
      setWorkLogModalOpen(false);
      setWorkLogDesc('');
      fetchTicket();
    } catch (err) {
      toast.error(err.message || 'Failed to add work log.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">Ticket not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested ticket does not exist or you lack authorization to inspect it.
        </p>
        <Button size="sm" onClick={() => navigate('/tickets')}>
          Return to Tickets
        </Button>
      </div>
    );
  }

  // Permitted status transitions based on current status and role
  const canResolve =
    !isEmployee &&
    ['open', 'assigned', 'in_progress', 'pending'].includes(ticket.status);
  const canStartProgress =
    !isEmployee && ['open', 'assigned', 'reopened'].includes(ticket.status);
  const canPending =
    !isEmployee && ['in_progress'].includes(ticket.status);
  const canClose = ticket.status === 'resolved';
  const canReopen = ['resolved', 'closed'].includes(ticket.status);
  const canAssign = !isEmployee;

  return (
    <div className="space-y-6">
      {/* Top Header Section (Section 10 Exact ITSM Header) */}
      <div className="bg-white border border-slate-200 rounded p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {ticket.ticketNumber}
              </span>
              <TicketPriorityBadge priority={ticket.priority} />
              <TicketStatusBadge status={ticket.status} />
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span>
                Assigned to:{' '}
                <strong className="text-slate-900 font-semibold">
                  {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
                </strong>
              </span>
              <span>·</span>
              <span>
                Created:{' '}
                <strong className="text-slate-700 font-medium">
                  {new Date(ticket.createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canAssign && (
              <Button
                size="sm"
                variant="outline"
                icon={UserCheck}
                onClick={() => setAssignModalOpen(true)}
              >
                {ticket.assignedTo ? 'Reassign' : 'Assign Technician'}
              </Button>
            )}

            {canStartProgress && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleStatusChange('in_progress')}
                loading={submitting}
              >
                Mark In Progress
              </Button>
            )}

            {canPending && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('pending')}
                loading={submitting}
              >
                Set Pending
              </Button>
            )}

            {canResolve && (
              <Button
                size="sm"
                icon={CheckCircle2}
                onClick={() => setResolveModalOpen(true)}
              >
                Resolve Ticket
              </Button>
            )}

            {canClose && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleStatusChange('closed')}
                loading={submitting}
              >
                Confirm & Close
              </Button>
            )}

            {canReopen && (
              <Button
                size="sm"
                variant="dangerOutline"
                icon={RotateCcw}
                onClick={() => setReopenModalOpen(true)}
              >
                Reopen Ticket
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-t border-slate-200 mt-4 pt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-1 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & Description
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Activity</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
              {ticket.comments?.length || 0}
            </span>
          </button>
          {!isEmployee && (
            <button
              onClick={() => setActiveTab('worklogs')}
              className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'worklogs'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Work Logs</span>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
                {ticket.workLogs?.length || 0}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Layout (Section 10 Specs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Description / Activity / WorkLogs / AI */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Ticket Description Block */}
              <div className="bg-white border border-slate-200 rounded p-4 sm:p-5">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Ticket Description
                </h2>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded border border-slate-100">
                  {ticket.description}
                </div>

                {/* Resolution Summary if resolved */}
                {ticket.resolution && (
                  <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Resolution Summary
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {ticket.resolution}
                    </p>
                  </div>
                )}
              </div>

              {/* Integrated Activity Section on Overview Tab */}
              <div className="bg-white border border-slate-200 rounded p-4 sm:p-5">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Recent Activity & Comments
                </h2>
                <TicketActivity
                  ticketId={ticket._id}
                  comments={ticket.comments || []}
                  onCommentAdded={(newComment) => {
                    setTicket((prev) => ({
                      ...prev,
                      comments: [...(prev.comments || []), newComment],
                    }));
                  }}
                />
              </div>
            </>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white border border-slate-200 rounded p-4 sm:p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Ticket Activity Thread
              </h2>
              <TicketActivity
                ticketId={ticket._id}
                comments={ticket.comments || []}
                onCommentAdded={(newComment) => {
                  setTicket((prev) => ({
                    ...prev,
                    comments: [...(prev.comments || []), newComment],
                  }));
                }}
              />
            </div>
          )}

          {activeTab === 'worklogs' && !isEmployee && (
            <div className="bg-white border border-slate-200 rounded p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Technician Work Logs
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total recorded time:{' '}
                    <strong>
                      {ticket.workLogs?.reduce((sum, w) => sum + (w.timeSpentMinutes || 0), 0) || 0} minutes
                    </strong>
                  </p>
                </div>
                <Button size="sm" icon={Plus} onClick={() => setWorkLogModalOpen(true)}>
                  Log Time
                </Button>
              </div>

              <div className="divide-y divide-slate-100">
                {!ticket.workLogs || ticket.workLogs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No work logs submitted for this incident yet.
                  </div>
                ) : (
                  ticket.workLogs.map((log) => (
                    <div key={log._id} className="py-3 flex items-start justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">
                            {log.technician?.name || 'Technician'}
                          </span>
                          <span className="capitalize text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                            {log.workType}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{log.description}</p>
                      </div>
                      <div className="text-right shrink-0 font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {log.timeSpentMinutes}m
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ticket Information Sidebar (Section 10 Specs) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded p-4 space-y-3.5">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Ticket Information
            </h2>

            {/* Requester */}
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Requester</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {ticket.requester?.name ? ticket.requester.name.charAt(0) : 'U'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {ticket.requester?.name || 'Requester'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {ticket.requester?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Department</span>
              <div className="text-xs font-medium text-slate-800 mt-0.5">
                {ticket.department?.name || 'Enterprise Operations'}
              </div>
            </div>

            {/* Category */}
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Category</span>
              <div className="text-xs font-medium text-slate-800 mt-0.5">
                {ticket.category?.name || 'General Support'}
              </div>
            </div>

            {/* Priority */}
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Priority</span>
              <div className="mt-1">
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
            </div>

            {/* Attached Asset */}
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Attached Asset</span>
              {ticket.asset ? (
                <button
                  type="button"
                  onClick={() => navigate(`/assets/${ticket.asset._id}`)}
                  className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded text-left w-full hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {ticket.asset.assetTag}
                    </span>
                    <span className="text-[10px] text-blue-600 group-hover:underline">
                      View Asset
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{ticket.asset.name}</div>
                </button>
              ) : (
                <div className="text-xs text-slate-400 mt-0.5 italic">
                  No asset linked to this ticket.
                </div>
              )}
            </div>
          </div>

          {/* SLA Tracking Block */}
          <div className="bg-white border border-slate-200 rounded p-4">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 mb-3">
              SLA Compliance
            </h2>
            <TicketSLA sla={ticket.sla} status={ticket.status} />
          </div>
        </div>
      </div>

      {/* Modal: Resolve Ticket */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Ticket"
        description="Provide a clear, detailed resolution summary for the requester."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={submitting}
              disabled={!resolutionText.trim()}
              onClick={() => handleStatusChange('resolved', resolutionText.trim())}
            >
              Confirm Resolution
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-700">
            Resolution Summary <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={resolutionText}
            onChange={(e) => setResolutionText(e.target.value)}
            placeholder="Describe the diagnosis, actions taken, and verification performed..."
            className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </Modal>

      {/* Modal: Reopen Ticket */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Reopen Ticket"
        description="Reopen this ticket to queue further troubleshooting."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setReopenModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={submitting}
              onClick={() => handleStatusChange('reopened')}
            >
              Confirm Reopen
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Reopening will return the ticket to the active intake queue and alert assigned technicians.
        </p>
      </Modal>

      {/* Modal: Log Work Time */}
      <Modal
        isOpen={workLogModalOpen}
        onClose={() => setWorkLogModalOpen(false)}
        title="Record Work Log"
        description="Log time spent on diagnosis, troubleshooting, or repair."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setWorkLogModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={submitting}
              disabled={!workLogDesc.trim()}
              onClick={handleAddWorkLog}
            >
              Save Log
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddWorkLog} className="space-y-3">
          <Input
            label="Work Summary / Description"
            value={workLogDesc}
            onChange={(e) => setWorkLogDesc(e.target.value)}
            placeholder="e.g. Flushed DNS and rebuilt split tunnel routes"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Time Spent (Minutes)"
              type="number"
              min="1"
              value={workLogMinutes}
              onChange={(e) => setWorkLogMinutes(e.target.value)}
              required
            />

            <Select
              label="Work Category"
              value={workLogType}
              onChange={(e) => setWorkLogType(e.target.value)}
              options={[
                { value: 'diagnosis', label: 'Diagnosis' },
                { value: 'troubleshooting', label: 'Troubleshooting' },
                { value: 'repair', label: 'Repair' },
                { value: 'installation', label: 'Installation' },
                { value: 'communication', label: 'Communication' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Technician */}
      <AssignTechnicianModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        ticketId={ticket._id}
        currentAssigneeId={ticket.assignedTo?._id}
        onAssigned={(updated) => setTicket(updated)}
      />
    </div>
  );
};
