import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetService } from '../../services/assetService';
import { departmentService } from '../../services/departmentService';
import { vendorService } from '../../services/vendorService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Save } from 'lucide-react';

export const AssetForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('laptop');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [vendor, setVendor] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [warrantyStart, setWarrantyStart] = useState('');
  const [warrantyEnd, setWarrantyEnd] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [departments, setDepartments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    departmentService.getDepartments({ isActive: true }).then((d) => setDepartments(d || []));
    vendorService.getVendors({ isActive: true }).then((v) => setVendors(v || []));

    if (isEdit) {
      assetService
        .getAssetById(id)
        .then((a) => {
          setAssetTag(a.assetTag || '');
          setName(a.name || '');
          setType(a.type || 'laptop');
          setBrand(a.brand || '');
          setModel(a.model || '');
          setSerialNumber(a.serialNumber || '');
          setDepartment(a.department?._id || a.department || '');
          setVendor(a.vendor?._id || a.vendor || '');
          setPurchaseDate(a.purchaseDate ? a.purchaseDate.split('T')[0] : '');
          setPurchaseCost(a.purchaseCost || '');
          setWarrantyStart(a.warrantyStart ? a.warrantyStart.split('T')[0] : '');
          setWarrantyEnd(a.warrantyEnd ? a.warrantyEnd.split('T')[0] : '');
          setLocation(a.location || '');
          setNotes(a.notes || '');
        })
        .catch((err) => toast.error(err.message || 'Failed to load asset details'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const validate = () => {
    const errs = {};
    if (!assetTag.trim()) errs.assetTag = 'Asset Tag is required';
    if (!name.trim()) errs.name = 'Asset Name is required';
    if (!type) errs.type = 'Asset Type is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        assetTag: assetTag.trim(),
        name: name.trim(),
        type,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        department: department || undefined,
        vendor: vendor || undefined,
        purchaseDate: purchaseDate || undefined,
        purchaseCost: purchaseCost ? Number(purchaseCost) : undefined,
        warrantyStart: warrantyStart || undefined,
        warrantyEnd: warrantyEnd || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEdit) {
        await assetService.updateAsset(id, payload);
        toast.success('Asset updated successfully.');
        navigate(`/assets/${id}`);
      } else {
        const created = await assetService.createAsset(payload);
        toast.success(`Asset ${created.assetTag} created successfully.`);
        navigate(`/assets/${created._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save asset.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading asset record...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEdit ? `Edit Asset ${assetTag}` : 'Register New Asset'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain accurate corporate hardware and equipment catalog.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Asset Tag"
            value={assetTag}
            onChange={(e) => setAssetTag(e.target.value)}
            placeholder="e.g. AST-1040"
            error={errors.assetTag}
            disabled={isEdit}
            required
          />

          <Select
            label="Hardware Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'laptop', label: 'Laptop' },
              { value: 'desktop', label: 'Desktop' },
              { value: 'monitor', label: 'Monitor' },
              { value: 'printer', label: 'Printer' },
              { value: 'router', label: 'Router / Switch' },
              { value: 'server', label: 'Server' },
              { value: 'mobile', label: 'Mobile Device' },
              { value: 'software', label: 'Software / License' },
              { value: 'other', label: 'Other Equipment' },
            ]}
            required
          />
        </div>

        <Input
          label="Asset Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dell Latitude 5440"
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Brand / Manufacturer"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Dell, HP, Cisco..."
          />
          <Input
            label="Model Number"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Latitude 5440"
          />
          <Input
            label="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="e.g. SN-88210-A"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assigned Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
            placeholder="Select Department..."
          />

          <Select
            label="Procurement Vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            options={vendors.map((v) => ({ value: v._id, label: v.name }))}
            placeholder="Select Vendor..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
          <Input
            label="Purchase Cost ($)"
            type="number"
            min="0"
            step="0.01"
            value={purchaseCost}
            onChange={(e) => setPurchaseCost(e.target.value)}
            placeholder="1200.00"
          />
          <Input
            label="Depot Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Floor 2 - Room 204"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Warranty Start Date"
            type="date"
            value={warrantyStart}
            onChange={(e) => setWarrantyStart(e.target.value)}
          />
          <Input
            label="Warranty End Date"
            type="date"
            value={warrantyEnd}
            onChange={(e) => setWarrantyEnd(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Administrative Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Configuration details, OS version, or deployment guidelines..."
            className="w-full text-xs text-slate-900 border border-slate-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Save}>
            {isEdit ? 'Update Asset' : 'Register Asset'}
          </Button>
        </div>
      </form>
    </div>
  );
};
