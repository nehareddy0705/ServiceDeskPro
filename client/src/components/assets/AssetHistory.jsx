import React from 'react';
import { Clock, CheckCircle2, Wrench, ShieldAlert, ArrowRight } from 'lucide-react';

export const AssetHistory = ({ history = [] }) => {
  if (history.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded">
        No lifecycle events recorded for this asset yet.
      </div>
    );
  }

  const formatAction = (action) => {
    switch (action) {
      case 'procured':
        return 'Purchased & Tagged';
      case 'assigned':
        return 'Assigned to Custodian';
      case 'unassigned':
        return 'Returned / Unassigned';
      case 'repair_started':
        return 'Dispatched to Repair';
      case 'repair_completed':
        return 'Repair Completed & Certified';
      case 'transferred':
        return 'Department Transfer';
      case 'retired':
        return 'Retired from Active Fleet';
      case 'disposed':
        return 'Asset Disposed';
      default:
        return action?.replace('_', ' ') || 'Lifecycle Event';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, idx) => {
          const isLast = idx === history.length - 1;

          return (
            <li key={event._id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-3.5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
                    {event.action?.includes('repair') ? (
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    ) : event.action?.includes('assign') ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 capitalize">
                        {formatAction(event.action)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(event.timestamp || event.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {event.toUser && (
                      <div className="text-xs text-slate-700 mt-0.5">
                        Custodian: <strong className="font-medium text-slate-900">{event.toUser.name || 'User'}</strong>
                      </div>
                    )}

                    {event.notes && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {event.notes}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 mt-1">
                      Logged by {event.performedBy?.name || 'Asset Manager'}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
