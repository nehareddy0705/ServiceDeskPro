import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/vendorService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';

export const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { isAssetManager, isAdmin } = useAuth();
  const canManage = isAssetManager || isAdmin;
  const toast = useToast();

  const fetchVendors = async () => {
    try {
      const data = await vendorService.getVendors();
      setVendors(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const openCreateModal = () => {
    setEditingVendor(null);
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setCategory('');
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVendor(v);
    setName(v.name || '');
    setContactPerson(v.contactPerson || '');
    setEmail(v.email || '');
    setPhone(v.phone || '');
    setCategory(v.category || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        contactPerson: contactPerson.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        category: category.trim() || undefined,
      };

      if (editingVendor) {
        await vendorService.updateVendor(editingVendor._id, payload);
        toast.success('Vendor updated successfully.');
      } else {
        await vendorService.createVendor(payload);
        toast.success('Vendor registered successfully.');
      }
      setModalOpen(false);
      fetchVendors();
    } catch (err) {
      toast.error(err.message || 'Failed to save vendor.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Vendor Name' },
    { header: 'Contact Person' },
    { header: 'Email & Phone' },
    { header: 'Category' },
    { header: 'Actions', className: 'w-24 text-right' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Equipment & Service Vendors
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage procurement partners, maintenance agreements, and hardware suppliers.
          </p>
        </div>

        {canManage && (
          <Button size="sm" icon={Plus} onClick={openCreateModal}>
            Add Vendor
          </Button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No vendors found"
          description="Register suppliers and hardware maintenance vendors."
          actionLabel={canManage ? 'Add Vendor' : undefined}
          onAction={canManage ? openCreateModal : undefined}
        />
      ) : (
        <Table columns={columns}>
          {vendors.map((v) => (
            <TableRow key={v._id}>
              <TableCell>
                <div className="font-semibold text-slate-900">{v.name}</div>
              </TableCell>
              <TableCell>
                <span className="text-slate-800 text-xs font-medium">
                  {v.contactPerson || '—'}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-xs text-slate-700">{v.email || '—'}</div>
                <div className="text-[11px] text-slate-400">{v.phone || ''}</div>
              </TableCell>
              <TableCell>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs border border-slate-200 font-medium">
                  {v.category || 'General'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {canManage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Edit}
                    onClick={() => openEditModal(v)}
                    className="p-1 h-7"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Vendor Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVendor ? `Edit ${editingVendor.name}` : 'Register New Vendor'}
        description="Vendor partner for IT equipment procurement and warranty dispatch."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={submitting} onClick={handleSubmit}>
              {editingVendor ? 'Save Changes' : 'Register Vendor'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Vendor / Company Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dell Technologies"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Marcus Vance"
            />
            <Input
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Hardware, Printers"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Support Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="support@vendor.com"
            />
            <Input
              label="Support Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-800-456-3355"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
