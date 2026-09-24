import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { useToast } from '../../context/ToastContext';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Building2, Plus, Edit } from 'lucide-react';

export const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data || []);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingDept(d);
    setName(d.name || '');
    setCode(d.code || '');
    setDescription(d.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
      };

      if (editingDept) {
        await departmentService.updateDepartment(editingDept._id, payload);
        toast.success('Department updated successfully.');
      } else {
        await departmentService.createDepartment(payload);
        toast.success('Department created successfully.');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Department Name' },
    { header: 'Code', className: 'w-24' },
    { header: 'Description' },
    { header: 'Actions', className: 'w-24 text-right' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Departments & Cost Centers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure organizational divisions for ticket routing and asset custody.
          </p>
        </div>

        <Button size="sm" icon={Plus} onClick={openCreateModal}>
          Add Department
        </Button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Create your organization's business and engineering units."
          actionLabel="Add Department"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <Table columns={columns}>
            {departments.map((d) => (
              <TableRow key={d._id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{d.name}</div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {d.code}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-600">{d.description || '—'}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Edit}
                    onClick={() => openEditModal(d)}
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
        title={editingDept ? `Edit Department ${editingDept.name}` : 'Create Department'}
        description="Add a functional business unit for incident dispatch."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={submitting} onClick={handleSubmit}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Department Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Information Technology"
                required
              />
            </div>
            <Input
              label="Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="IT"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Mandate
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational responsibilities and scope..."
              className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
