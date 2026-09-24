import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export const AssetFilters = ({
  search,
  onSearchChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  onAddAsset,
  canAdd = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assets by tag, serial, or model..."
            className="w-full text-xs bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All Types</option>
          <option value="laptop">Laptop</option>
          <option value="desktop">Desktop</option>
          <option value="monitor">Monitor</option>
          <option value="printer">Printer</option>
          <option value="router">Router / Switch</option>
          <option value="server">Server</option>
          <option value="mobile">Mobile</option>
          <option value="software">Software</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="under_repair">Under Repair</option>
          <option value="retired">Retired</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {canAdd && onAddAsset && (
        <Button size="sm" icon={Plus} onClick={onAddAsset} className="shrink-0">
          Add Asset
        </Button>
      )}
    </div>
  );
};
