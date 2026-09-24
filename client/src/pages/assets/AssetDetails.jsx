import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetService } from '../../services/assetService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AssetStatusBadge } from '../../components/assets/AssetStatusBadge';
import { AssetHistory } from '../../components/assets/AssetHistory';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Box,
  User,
  Building2,
  Calendar,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Edit,
  ArrowLeft,
  Wrench,
  Clock,
} from 'lucide-react';

export const AssetDetails = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { isAssetManager, isAdmin, isTechnician } = useAuth();
  const canManage = isAssetManager || isAdmin;
  const canUpdateStatus = canManage || isTechnician;

  const toast = useToast();
  const navigate = useNavigate();

  const fetchAssetData = async () => {
    try {
      const [assetData, historyData] = await Promise.all([
        assetService.getAssetById(id),
        assetService.getAssetHistory(id),
      ]);
      setAsset(assetData);
      setHistory(historyData || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load asset details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetData();
    if (canManage) {
      userService
        .getUsers({ isActive: true, limit: 100 })
        .then((res) => setUsers(res.users || []))
        .catch((err) => console.error(err));
    }
  }, [id, canManage]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      await assetService.assignAsset(id, {
        toUserId: selectedUserId,
        notes: actionNotes.trim() || undefined,
      });
      toast.success('Asset assigned successfully.');
      setAssignModalOpen(false);
      setActionNotes('');
      fetchAssetData();
    } catch (err) {
      toast.error(err.message || 'Assignment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    setSubmitting(true);
    try {
      await assetService.unassignAsset(id, {
        notes: actionNotes.trim() || 'Returned to central depot',
      });
      toast.success('Asset unassigned and returned to inventory.');
      setUnassignModalOpen(false);
      setActionNotes('');
      fetchAssetData();
    } catch (err) {
      toast.error(err.message || 'Unassign failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setSubmitting(true);
    try {
      await assetService.updateStatus(id, {
        status: newStatus,
        reason: actionNotes.trim() || undefined,
      });
      toast.success(`Asset status updated to "${newStatus.replace('_', ' ')}".`);
      setStatusModalOpen(false);
      setActionNotes('');
      fetchAssetData();
    } catch (err) {
      toast.error(err.message || 'Status update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded">
        <h3 className="text-sm font-semibold text-slate-800">Asset not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">The requested asset record does not exist.</p>
        <Button size="sm" onClick={() => navigate('/assets')}>
          Return to Assets
        </Button>
      </div>
    );
  }

  const warrantyEndDate = asset.warrantyEnd ? new Date(asset.warrantyEnd) : null;
  const isWarrantyValid = warrantyEndDate ? warrantyEndDate > new Date() : false;

  return (
    <div className="space-y-6">
      {/* Top Banner (Section 13 Specs) */}
      <div className="bg-white border border-slate-200 rounded p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={() => navigate(-1)}
                className="p-1 -ml-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {asset.assetTag}
              </span>
              <AssetStatusBadge status={asset.status} />
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {asset.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span>
                Serial Number: <strong className="font-mono text-slate-800 font-semibold">{asset.serialNumber || 'N/A'}</strong>
              </span>
              <span>·</span>
              <span>
                Brand & Model: <strong className="text-slate-800">{asset.brand || ''} {asset.model || ''}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canUpdateStatus && (
              <Button
                size="sm"
                variant="outline"
                icon={Wrench}
                onClick={() => {
                  setNewStatus(asset.status);
                  setStatusModalOpen(true);
                }}
              >
                Update Status
              </Button>
            )}

            {canManage && asset.status === 'assigned' && (
              <Button
                size="sm"
                variant="outline"
                icon={UserMinus}
                onClick={() => setUnassignModalOpen(true)}
              >
                Unassign Asset
              </Button>
            )}

            {canManage && asset.status !== 'assigned' && (
              <Button
                size="sm"
                icon={UserPlus}
                onClick={() => setAssignModalOpen(true)}
              >
                Assign Asset
              </Button>
            )}

            {canManage && (
              <Button
                size="sm"
                variant="secondary"
                icon={Edit}
                onClick={() => navigate(`/assets/${asset._id}/edit`)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Information & History Layout (Section 13 Specs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Specifications & Lifecycle History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specifications Card */}
          <div className="bg-white border border-slate-200 rounded p-4 sm:p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Hardware Specifications & Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Device Type</span>
                <span className="font-semibold text-slate-800 capitalize mt-0.5 block">
                  {asset.type?.replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Physical Location</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {asset.location || 'Central Inventory Depot'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Procurement Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {asset.purchaseDate
                    ? new Date(asset.purchaseDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Purchase Value</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {asset.purchaseCost ? `$${asset.purchaseCost.toLocaleString()}` : '—'}
                </span>
              </div>
            </div>

            {/* Custom Specs map */}
            {asset.specifications && Object.keys(asset.specifications).length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-slate-400 block text-xs font-medium mb-2">Technical Profile</span>
                <div className="bg-slate-50 rounded border border-slate-200 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(asset.specifications).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-slate-500 capitalize">{key}: </span>
                      <strong className="text-slate-800 font-semibold">{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {asset.notes && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 block font-medium mb-1">Administrative Notes</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                  {asset.notes}
                </p>
              </div>
            )}
          </div>

          {/* Asset Lifecycle History (Section 13 Specs) */}
          <div className="bg-white border border-slate-200 rounded p-4 sm:p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Asset Lifecycle History
            </h2>
            <AssetHistory history={history} />
          </div>
        </div>

        {/* Right Column: Custodian & Warranty Information */}
        <div className="space-y-4">
          {/* Assignment Information */}
          <div className="bg-white border border-slate-200 rounded p-4 space-y-3.5">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Custody & Allocation
            </h2>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Assigned To</span>
              {asset.assignedTo ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {asset.assignedTo.name ? asset.assignedTo.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {asset.assignedTo.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {asset.assignedTo.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 mt-1 italic">
                  Not currently assigned to an employee.
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Department</span>
              <div className="text-xs font-medium text-slate-800 mt-0.5">
                {asset.department?.name || 'Central IT Depot'}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Associated Vendor</span>
              <div className="text-xs font-medium text-slate-800 mt-0.5">
                {asset.vendor?.name || 'Direct Enterprise Procurement'}
              </div>
            </div>
          </div>

          {/* Warranty Information Card */}
          <div className="bg-white border border-slate-200 rounded p-4 space-y-2.5">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Warranty Coverage
            </h2>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Coverage Status</span>
              <span
                className={`font-semibold ${
                  isWarrantyValid ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {isWarrantyValid ? 'Active Warranty' : 'Expired'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Warranty Expiration</span>
              <span className="font-medium text-slate-800">
                {warrantyEndDate
                  ? warrantyEndDate.toLocaleDateString([], {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Assign Asset */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Asset ${asset.assetTag}`}
        description="Allocate this hardware to an active employee."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={submitting} disabled={!selectedUserId} onClick={handleAssign}>
              Confirm Allocation
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssign} className="space-y-3">
          <Select
            label="Select Employee Custodian"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            options={users.map((u) => ({
              value: u._id,
              label: `${u.name} (${u.email}) — ${u.department?.name || u.role}`,
            }))}
            placeholder="Search employee by name..."
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Assignment Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Standard workstation deployment with charger and docking kit."
              className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Unassign Asset */}
      <Modal
        isOpen={unassignModalOpen}
        onClose={() => setUnassignModalOpen(false)}
        title={`Unassign Asset ${asset.assetTag}`}
        description="Return hardware to central available depot."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setUnassignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" loading={submitting} onClick={handleUnassign}>
              Confirm Return
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            This will remove custodian <strong>{asset.assignedTo?.name}</strong> and mark status as <strong>Available</strong>.
          </p>
          <textarea
            rows={2}
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            placeholder="Return reason or condition inspection note..."
            className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </Modal>

      {/* Modal: Update Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Asset Status"
        description="Change lifecycle status or send to maintenance."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={submitting} onClick={handleStatusUpdate}>
              Save Status
            </Button>
          </>
        }
      >
        <form onSubmit={handleStatusUpdate} className="space-y-3">
          <Select
            label="Operational Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'available', label: 'Available — In depot ready for deployment' },
              { value: 'assigned', label: 'Assigned — Active in field custody' },
              { value: 'under_repair', label: 'Under Repair — Sent for maintenance' },
              { value: 'retired', label: 'Retired — End of useful service life' },
              { value: 'lost', label: 'Lost — Missing or unrecovered' },
              { value: 'disposed', label: 'Disposed — E-waste recycling certified' },
            ]}
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Reason / Ticket Reference
            </label>
            <textarea
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Sent for keyboard warranty repair via vendor dispatch."
              className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
