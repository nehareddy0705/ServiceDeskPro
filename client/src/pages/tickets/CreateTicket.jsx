import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { assetService } from '../../services/assetService';
import { departmentService } from '../../services/departmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Send } from 'lucide-react';

export const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [asset, setAsset] = useState('');
  const [department, setDepartment] = useState('');

  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { user, isEmployee } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    categoryService
      .getCategories({ isActive: true })
      .then((cats) => {
        setCategories(cats || []);
        if (cats && cats.length > 0) setCategory(cats[0]._id);
      })
      .catch((err) => console.error(err));

    // Fetch assets (scoped to user's assigned assets if employee)
    const assetParams = isEmployee ? { assignedTo: user?._id } : {};
    assetService
      .getAssets(assetParams)
      .then((res) => setAssets(res.assets || []))
      .catch((err) => console.error(err));

    // Fetch departments
    departmentService
      .getDepartments({ isActive: true })
      .then((depts) => {
        setDepartments(depts || []);
        if (user?.department?._id) {
          setDepartment(user.department._id);
        } else if (depts && depts.length > 0) {
          setDepartment(depts[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, [user, isEmployee]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errs.description = 'Please provide sufficient detail (at least 10 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        priority,
        asset: asset || undefined,
        department: department || undefined,
      };

      const newTicket = await ticketService.createTicket(payload);
      toast.success(`Ticket ${newTicket.ticketNumber} created successfully.`);
      navigate(`/tickets/${newTicket._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
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
            Create Support Ticket
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a new IT incident or service request to the service desk.
          </p>
        </div>
      </div>

      {/* Main Form (Section 17 Clean Layout) */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded p-6 space-y-5">
        {/* Title */}
        <Input
          label="Subject / Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="e.g. VPN connection failure when switching from office WiFi to home broadband"
          error={errors.title}
          helperText="A concise summary of the issue or request."
          required
        />

        {/* Description */}
        <div>
          <label htmlFor="ticket-desc" className="block text-xs font-medium text-slate-700 mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="ticket-desc"
            rows={5}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Explain what happened, any error messages displayed, and steps you already tried..."
            className={`w-full text-sm bg-white border rounded px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
              errors.description
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
          )}
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            placeholder="Select Category..."
          />

          <Select
            label="Urgency / Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'low', label: 'Low — Non-blocking or minor inquiry' },
              { value: 'medium', label: 'Medium — Standard business request' },
              { value: 'high', label: 'High — Significant operational impact' },
              { value: 'critical', label: 'Critical — Complete outage or blocker' },
            ]}
          />
        </div>

        {/* Asset & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Related Asset (Optional)"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            options={assets.map((a) => ({
              value: a._id,
              label: `${a.assetTag} — ${a.name} (${a.type})`,
            }))}
            placeholder="Select associated device / workstation..."
            helperText="Link hardware or laptop experiencing the problem."
          />

          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={departments.map((d) => ({
              value: d._id,
              label: `${d.name} (${d.code})`,
            }))}
            placeholder="Select Department..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tickets')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Send}>
            Submit Ticket
          </Button>
        </div>
      </form>
    </div>
  );
};
