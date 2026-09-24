import React from 'react';

export const SLAOverview = ({
  withinSLA = 0,
  atRisk = 0,
  breached = 0,
  activePoliciesCount,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded p-4 flex flex-col justify-between h-full">
      <div>
        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
          SLA Compliance Overview
        </h4>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded overflow-hidden flex mb-4">
          <div
            style={{ width: `${withinSLA}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`Within SLA: ${withinSLA}%`}
          />
          <div
            style={{ width: `${atRisk}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`At Risk: ${atRisk}%`}
          />
          <div
            style={{ width: `${breached}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`Breached: ${breached}%`}
          />
        </div>

        {/* Legend / Metrics */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              Within SLA Target
            </span>
            <span className="font-semibold text-slate-900">{withinSLA}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              Approaching SLA Deadline
            </span>
            <span className="font-semibold text-slate-900">{atRisk}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              Breached SLA Threshold
            </span>
            <span className="font-semibold text-slate-900">{breached}%</span>
          </div>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
        {activePoliciesCount != null
          ? `Evaluated against ${activePoliciesCount} active department SLA policies.`
          : 'Evaluated against active department SLA policies.'}
      </div>
    </div>
  );
};
