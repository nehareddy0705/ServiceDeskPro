import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assetService } from '../../services/assetService';
import { useAuth } from '../../context/AuthContext';
import { AssetFilters } from '../../components/assets/AssetFilters';
import { AssetTable } from '../../components/assets/AssetTable';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Box } from 'lucide-react';

export const Assets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { isAssetManager, isAdmin } = useAuth();
  const canAdd = isAssetManager || isAdmin;
  const navigate = useNavigate();

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (type) params.type = type;
      if (status) params.status = status;

      const res = await assetService.getAssets(params);
      setAssets(res.assets || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Unable to load assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, type, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
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
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            IT Asset Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {pagination.total} registered devices, workstations, and network hardware
          </p>
        </div>
      </div>

      <AssetFilters
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={(val) => {
          setType(val);
          setSearchParams((prev) => {
            if (val) prev.set('type', val);
            else prev.delete('type');
            prev.set('page', '1');
            return prev;
          });
        }}
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
        canAdd={canAdd}
        onAddAsset={() => navigate('/assets/new')}
      />

      {loading ? (
        <TableSkeleton rows={7} cols={6} />
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchAssets}
            className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No assets found"
          description="Try modifying your search query or clear active type/status filters."
          actionLabel={canAdd ? 'Add Asset' : undefined}
          onAction={canAdd ? () => navigate('/assets/new') : undefined}
        />
      ) : (
        <div className="space-y-0">
          <AssetTable assets={assets} />
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
