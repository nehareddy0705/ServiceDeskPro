import React from 'react';
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export const TicketSLA = ({ sla, status }) => {
  if (!sla) {
    return <div className="text-xs text-slate-400">No active SLA policy assigned.</div>;
  }

  const isResolved = status === 'resolved' || status === 'closed';

  const formatRemaining = (targetDateStr, breached) => {
    if (isResolved) return { text: 'Target Met', variant: 'success' };
    if (breached) return { text: 'SLA Breached', variant: 'danger' };
    if (!targetDateStr) return { text: 'N/A', variant: 'neutral' };

    const targetDate = new Date(targetDateStr);
    const diffMs = targetDate.getTime() - Date.now();
    if (diffMs <= 0) return { text: 'SLA Breached', variant: 'danger' };

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    const formatted = hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
    const isAtRisk = diffMinutes <= 60;

    return {
      text: formatted,
      variant: isAtRisk ? 'warning' : 'normal',
    };
  };

  const responseStatus = formatRemaining(sla.responseDueAt, sla.responseBreached);
  const resolutionStatus = formatRemaining(sla.resolutionDueAt, sla.resolutionBreached);

  return (
    <div className="space-y-3 text-xs">
      {/* Policy Name */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-slate-500 font-medium">Policy</span>
        <span className="font-semibold text-slate-800">
          {sla.policy?.name || 'Standard SLA'}
        </span>
      </div>

      {/* Response Target */}
      <div className="flex items-center justify-between">
        <span className="text-slate-500">First Response Target</span>
        <div className="text-right">
          <div
            className={`font-medium ${
              responseStatus.variant === 'danger'
                ? 'text-rose-600'
                : responseStatus.variant === 'warning'
                ? 'text-amber-600'
                : responseStatus.variant === 'success'
                ? 'text-emerald-600'
                : 'text-slate-800'
            }`}
          >
            {sla.responseAt ? (
              <span className="text-emerald-600 font-medium">Responded</span>
            ) : (
              responseStatus.text
            )}
          </div>
          {sla.responseDueAt && (
            <div className="text-[10px] text-slate-400">
              Due: {new Date(sla.responseDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* Resolution Target */}
      <div className="flex items-center justify-between">
        <span className="text-slate-500">Resolution Deadline</span>
        <div className="text-right">
          <div
            className={`font-semibold ${
              resolutionStatus.variant === 'danger'
                ? 'text-rose-600'
                : resolutionStatus.variant === 'warning'
                ? 'text-amber-600'
                : resolutionStatus.variant === 'success'
                ? 'text-emerald-600'
                : 'text-slate-800'
            }`}
          >
            {resolutionStatus.text}
          </div>
          {sla.resolutionDueAt && (
            <div className="text-[10px] text-slate-400">
              Due: {new Date(sla.resolutionDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* Escalation Warning if applicable */}
      {sla.escalated && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-center gap-1.5 mt-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Ticket escalated to Level {sla.escalationLevel || 1} management</span>
        </div>
      )}
    </div>
  );
};
