import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Shield, KeyRound, Mail, Lock } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      toast.success('Signed in successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
            SP
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            ServiceDesk <span className="text-blue-600 font-semibold">Pro</span>
          </span>
        </div>
        <h2 className="mt-4 text-center text-xl font-semibold text-slate-800 tracking-tight">
          Sign in to your workspace
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enterprise IT Helpdesk & Asset Management
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-xs rounded bg-rose-50 border border-rose-200 text-rose-700">
                {error}
              </div>
            )}

            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={Lock}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                Remember this device
              </label>
              <button
                type="button"
                onClick={() => toast.info('Contact your IT Administrator to reset credentials.')}
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full">
                Sign In
              </Button>
            </div>
          </form>

          {/* Demo Credentials (Testing) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Demo Credentials
              </span>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Password: Password123!
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Click any account below to autofill login credentials:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin@servicedesk.local')}
                className="p-2 border border-slate-200 rounded hover:border-slate-400 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 group-hover:text-blue-600">System Admin</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">Full Access</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">admin@servicedesk.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('manager@servicedesk.local')}
                className="p-2 border border-slate-200 rounded hover:border-slate-400 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 group-hover:text-blue-600">IT Manager</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">Management</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">manager@servicedesk.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('technician@servicedesk.local')}
                className="p-2 border border-slate-200 rounded hover:border-slate-400 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 group-hover:text-blue-600">Technician</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">Intake Queue</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">technician@servicedesk.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('assetmanager@servicedesk.local')}
                className="p-2 border border-slate-200 rounded hover:border-slate-400 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 group-hover:text-blue-600">Asset Manager</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">Hardware</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">assetmanager@servicedesk.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('employee@servicedesk.local')}
                className="sm:col-span-2 p-2 border border-slate-200 rounded hover:border-slate-400 hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 group-hover:text-blue-600">Employee</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">End User</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">employee@servicedesk.local</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
