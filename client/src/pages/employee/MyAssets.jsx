import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../../services/assetService';
import { useAuth } from '../../context/AuthContext';
import { AssetStatusBadge } from '../../components/assets/AssetStatusBadge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Box, ShieldCheck, Plus, ArrowRight, Laptop } from 'lucide-react';

export const MyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMyAssets = () => {
    if (user?._id) {
      setLoading(true);
      setError('');
      assetService
        .getAssets({ assignedTo: user._id })
        .then((res) => setAssets(res.assets || []))
        .catch((err) => {
          console.error('Failed to load my assets:', err);
          setError('Unable to load assigned devices. Please try again.');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          My Assigned Hardware & Devices
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Equipment allocated to your workstation and employee identity.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchMyAssets}
            className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium px-3 py-1.5 rounded border border-rose-300 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Laptop}
          title="No assigned hardware"
          description="There is currently no corporate hardware or device registered under your custody."
          actionLabel="Request Equipment"
          onAction={() => navigate('/tickets/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => {
            const warrantyDate = asset.warrantyEnd ? new Date(asset.warrantyEnd) : null;
            const isWarrantyValid = warrantyDate ? warrantyDate > new Date() : false;

            return (
              <div
                key={asset._id}
                className="bg-white border border-slate-200 rounded p-5 space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {asset.assetTag}
                      </span>
                      <AssetStatusBadge status={asset.status} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {asset.name}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {asset.brand} {asset.model} · SN: {asset.serialNumber || 'N/A'}
                    </div>
                  </div>

                  <span className="capitalize text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {asset.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Date</span>
                    <span className="font-medium text-slate-800">
                      {asset.assignedAt
                        ? new Date(asset.assignedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Active deployment'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Warranty Status</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        isWarrantyValid ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {isWarrantyValid ? 'Valid Coverage' : 'Standard Support'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/assets/${asset._id}`)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    View Details
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => navigate(`/tickets/create?asset=${asset._id}`)}
                  >
                    Report Issue on Device
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
