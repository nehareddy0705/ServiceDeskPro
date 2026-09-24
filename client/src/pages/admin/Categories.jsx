import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
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
import { Tag, Plus, Edit } from 'lucide-react';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [slaPolicies, setSlaPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPriority, setDefaultPriority] = useState('medium');
  const [defaultSLAPolicy, setDefaultSLAPolicy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchCategories = async () => {
    try {
      const [cats, slas] = await Promise.all([
        categoryService.getCategories(),
        slaService.getPolicies({ isActive: true }),
      ]);
      setCategories(cats || []);
      setSlaPolicies(slas || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setDefaultPriority('medium');
    setDefaultSLAPolicy('');
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCategory(c);
    setName(c.name || '');
    setDescription(c.description || '');
    setDefaultPriority(c.defaultPriority || 'medium');
    setDefaultSLAPolicy(c.defaultSLAPolicy?._id || c.defaultSLAPolicy || '');
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
        defaultPriority,
        defaultSLAPolicy: defaultSLAPolicy || undefined,
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, payload);
        toast.success('Category updated successfully.');
      } else {
        await categoryService.createCategory(payload);
        toast.success('Category created successfully.');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Category Name' },
    { header: 'Default Priority', className: 'w-36' },
    { header: 'Associated SLA', className: 'w-48' },
    { header: 'Description' },
    { header: 'Actions', className: 'w-24 text-right' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Service Request & Incident Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure classification taxonomy, priority mapping, and routing defaults.
          </p>
        </div>

        <Button size="sm" icon={Plus} onClick={openCreateModal}>
          Add Category
        </Button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description="Create ticket categories to organize support requests."
          actionLabel="Add Category"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <Table columns={columns}>
            {categories.map((c) => (
              <TableRow key={c._id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                </TableCell>
                <TableCell>
                  <TicketPriorityBadge priority={c.defaultPriority} />
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-700 font-medium">
                    {c.defaultSLAPolicy?.name || 'Standard SLA'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-500 line-clamp-1">
                    {c.description || '—'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Edit}
                    onClick={() => openEditModal(c)}
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
        title={editingCategory ? `Edit Category ${editingCategory.name}` : 'Create Category'}
        description="Define a ticket classification category."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={submitting} onClick={handleSubmit}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Network & Connectivity"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Default Priority"
              value={defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />

            <Select
              label="Default SLA Policy"
              value={defaultSLAPolicy}
              onChange={(e) => setDefaultSLAPolicy(e.target.value)}
              options={slaPolicies.map((s) => ({ value: s._id, label: s.name }))}
              placeholder="Select SLA Policy..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Common Keywords
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. VPN, WiFi, router, firewall, DNS, connection timeouts..."
              className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
