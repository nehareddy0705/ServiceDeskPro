import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export const TicketFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  categories = [],
  onCreateTicket,
  showCreate = true,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tickets..."
            className="w-full text-xs bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 placeholder:text-slate-400"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="reopened">Reopened</option>
        </select>

        {/* Priority Dropdown */}
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Category Dropdown */}
        {categories.length > 0 && (
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Action Button */}
      {showCreate && onCreateTicket && (
        <Button size="sm" icon={Plus} onClick={onCreateTicket} className="shrink-0">
          Create Ticket
        </Button>
      )}
    </div>
  );
};
