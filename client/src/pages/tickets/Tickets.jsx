import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { TicketFilters } from '../../components/tickets/TicketFilters';
import { TicketTable } from '../../components/tickets/TicketTable';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Ticket as TicketIcon } from 'lucide-react';

export const Tickets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const scope = searchParams.get('scope') || '';

  const { isEmployee } = useAuth();
  const navigate = useNavigate();

  // Fetch categories for filtering
  useEffect(() => {
    categoryService
      .getCategories({ isActive: true })
      .then((cats) => setCategories(cats || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;
      if (scope) params.scope = scope;

      const res = await ticketService.getTickets(params);
      setTickets(res.tickets || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Unable to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, status, priority, category, scope]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      prev.set('page', newPage);
      return prev;
    });
  };

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEmployee ? 'My Tickets' : scope === 'assigned' ? 'My Assigned Tickets' : 'Tickets'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {pagination.total} incident{pagination.total !== 1 ? 's' : ''} and service requests registered in system
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setSearchParams((prev) => {
            if (val) prev.set('status', val);
            else prev.delete('status');
            prev.set('page', '1');
            return prev;
          });
        }}
        priority={priority}
        onPriorityChange={(val) => {
          setPriority(val);
          setSearchParams((prev) => {
            if (val) prev.set('priority', val);
            else prev.delete('priority');
            prev.set('page', '1');
            return prev;
          });
        }}
        category={category}
        onCategoryChange={(val) => {
          setCategory(val);
          setSearchParams((prev) => {
            if (val) prev.set('category', val);
            else prev.delete('category');
            prev.set('page', '1');
            return prev;
          });
        }}
        categories={categories}
        onCreateTicket={() => navigate('/tickets/create')}
        showCreate={true}
      />

      {/* Main Table / Skeleton / Empty State */}
      {loading ? (
        <TableSkeleton rows={7} cols={6} />
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchTickets}
            className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title={scope === 'assigned' ? 'No tickets assigned yet.' : 'No tickets found.'}
          description={
            scope === 'assigned'
              ? 'Assigned tickets will appear here when the IT Manager assigns them.'
              : 'Try changing your search term, adjusting filters, or submit a new service request.'
          }
          actionLabel={scope === 'assigned' ? undefined : 'Create Ticket'}
          onAction={scope === 'assigned' ? undefined : () => navigate('/tickets/create')}
        />
      ) : (
        <div className="space-y-0">
          <TicketTable tickets={tickets} />
          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};
