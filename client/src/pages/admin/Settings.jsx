import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Settings as SettingsIcon, Save, Shield, Bell, Database } from 'lucide-react';

export const Settings = () => {
  const [orgName, setOrgName] = useState('Acme Global IT Operations');
  const [supportEmail, setSupportEmail] = useState('servicedesk@company.com');
  const [sessionTimeout, setSessionTimeout] = useState('7');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slaWarningThreshold, setSlaWarningThreshold] = useState('60');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Workspace settings updated successfully.');
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          System & Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Global configuration for ServiceDesk Pro ITSM platform.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Org Settings */}
        <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-slate-500" />
            General Information
          </h2>

          <Input
            label="Organization / Workspace Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />

          <Input
            label="Default IT Support Dispatch Email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            helperText="Address displayed to employees on notification emails and ticket receipts."
            required
          />
        </div>

        {/* Security and Session Policy */}
        <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            Security & Authentication Policy
          </h2>

          <Select
            label="JWT User Session Lifespan"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            options={[
              { value: '1', label: '24 Hours (Strict security)' },
              { value: '3', label: '3 Days' },
              { value: '7', label: '7 Days (Standard)' },
              { value: '14', label: '14 Days' },
            ]}
            helperText="Duration after which inactive tokens expire and require fresh re-authentication."
          />

          <div className="flex items-center gap-2 pt-2 text-xs text-slate-700">
            <input
              type="checkbox"
              id="mfa-enforce"
              defaultChecked
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <label htmlFor="mfa-enforce" className="cursor-pointer">
              Enforce multi-factor verification on elevated administration routes
            </label>
          </div>
        </div>

        {/* Operational Notifications */}
        <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            Operational Alert Thresholds
          </h2>

          <Input
            label="SLA Early Warning Threshold (Minutes remaining)"
            type="number"
            value={slaWarningThreshold}
            onChange={(e) => setSlaWarningThreshold(e.target.value)}
            helperText="Generates in-app warning notification when ticket time remaining drops below this limit."
          />

          <div className="flex items-center gap-2 pt-1 text-xs text-slate-700">
            <input
              type="checkbox"
              id="email-alerts"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <label htmlFor="email-alerts" className="cursor-pointer">
              Send automatic dispatch notifications when tickets are assigned or resolved
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" loading={saving} icon={Save}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
