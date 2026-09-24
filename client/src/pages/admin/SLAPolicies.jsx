import React, { useState, useEffect } from 'react';
import { slaService } from '../../services/slaService';
import { useToast } from '../../context/ToastContext';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { TicketPriorityBadge } from '../../components/tickets/TicketPriorityBadge';
import { ShieldAlert, Plus, Edit, Clock } from 'lucide-react';

export const SLAPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [responseTimeMinutes, setResponseTimeMinutes] = useState(60);
  const [resolutionTimeMinutes, setResolutionTimeMinutes] = useState(480);
  const [escalationThresholdMinutes, setEscalationThresholdMinutes] = useState(240);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchPolicies = async () => {
    try {
      const data = await slaService.getPolicies();
      setPolicies(data || []);
    } catch (err) {
      toast.error('Failed to load SLA policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openCreateModal = () => {
    setEditingPolicy(null);
    setName('');
    setDescription('');
    setPriority('medium');
    setResponseTimeMinutes(60);
    setResolutionTimeMinutes(480);
    setEscalationThresholdMinutes(240);
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPolicy(p);
    setName(p.name || '');
    setDescription(p.description || '');
    setPriority(p.priority || 'medium');
    setResponseTimeMinutes(p.responseTimeMinutes || 60);
    setResolutionTimeMinutes(p.resolutionTimeMinutes || 480);
    setEscalationThresholdMinutes(p.escalationThresholdMinutes || 240);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        priority,
        responseTimeMinutes: Number(responseTimeMinutes),
        resolutionTimeMinutes: Number(resolutionTimeMinutes),
        escalationThresholdMinutes: Number(escalationThresholdMinutes),
      };

      if (editingPolicy) {
        await slaService.updatePolicy(editingPolicy._id, payload);
        toast.success('SLA Policy updated successfully.');
      } else {
        await slaService.createPolicy(payload);
        toast.success('SLA Policy created successfully.');
      }
      setModalOpen(false);
      fetchPolicies();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatMinutes = (mins) => {
    if (!mins) return '—';
    if (mins < 60) return `${mins} min`;
    const hours = (mins / 60).toFixed(1).replace('.0', '');
    return `${hours} hr${hours === '1' ? '' : 's'} (${mins}m)`;
  };

  const columns = [
    { header: 'Policy Name' },
    { header: 'Priority', className: 'w-28' },
    { header: 'First Response Target' },
    { header: 'Resolution Deadline' },
    { header: 'Escalation Alert' },
    { header: 'Actions', className: 'w-24 text-right' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Service Level Agreement (SLA) Policies
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure response windows, resolution deadlines, and automatic escalation thresholds.
          </p>
        </div>

        <Button size="sm" icon={Plus} onClick={openCreateModal}>
          Add SLA Policy
        </Button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={6} />
      ) : policies.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No SLA policies found"
          description="Define response and resolution SLA objectives for incidents and requests."
          actionLabel="Add SLA Policy"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <Table columns={columns}>
            {policies.map((p) => (
              <TableRow key={p._id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-[11px] text-slate-400">{p.description || '—'}</div>
                </TableCell>
                <TableCell>
                  <TicketPriorityBadge priority={p.priority} />
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-800 text-xs">
                    {formatMinutes(p.responseTimeMinutes)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-800 text-xs">
                    {formatMinutes(p.resolutionTimeMinutes)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                    At {formatMinutes(p.escalationThresholdMinutes)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Edit}
                    onClick={() => openEditModal(p)}
                    className="p-1 h-7"
                  />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPolicy ? `Edit SLA Policy ${editingPolicy.name}` : 'Create SLA Policy'}
        description="Configure target resolution deadlines for service tickets."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={submitting} onClick={handleSubmit}>
              {editingPolicy ? 'Save Changes' : 'Create Policy'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Policy Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Critical Incident SLA"
            required
          />

          <Select
            label="Priority Tier"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'low', label: 'Low Urgency' },
              { value: 'medium', label: 'Medium — Standard' },
              { value: 'high', label: 'High Priority' },
              { value: 'critical', label: 'Critical Incident' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Response Time (Minutes)"
              type="number"
              min="1"
              value={responseTimeMinutes}
              onChange={(e) => setResponseTimeMinutes(e.target.value)}
              required
            />
            <Input
              label="Resolution Deadline (Minutes)"
              type="number"
              min="1"
              value={resolutionTimeMinutes}
              onChange={(e) => setResolutionTimeMinutes(e.target.value)}
              required
            />
          </div>

          <Input
            label="Escalation Alert Threshold (Minutes)"
            type="number"
            min="1"
            value={escalationThresholdMinutes}
            onChange={(e) => setEscalationThresholdMinutes(e.target.value)}
            helperText="Manager is notified when remaining time hits this threshold."
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Policy Rules
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 24x7 coverage with automated escalation alert..."
              className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
