import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { useToast } from '../../context/ToastContext';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Search, Plus, UserX, UserCheck, Edit, ShieldAlert } from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('employee');
  const [formDept, setFormDept] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter !== '') params.isActive = statusFilter === 'active';

      const res = await userService.getUsers(params);
      setUsers(res.users || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentService.getDepartments({ isActive: true }).then((d) => setDepartments(d || []));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, deptFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async () => {
    if (!targetUser) return;
    setSubmitting(true);
    try {
      const nextStatus = !targetUser.isActive;
      await userService.updateUserStatus(targetUser._id, nextStatus);
      toast.success(
        `User ${targetUser.name} has been ${nextStatus ? 'activated' : 'deactivated'}.`
      );
      setConfirmModalOpen(false);
      setTargetUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword) return;

    setSubmitting(true);
    try {
      await userService.createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
        department: formDept || undefined,
        employeeId: formEmpId.trim() || undefined,
      });
      toast.success('User registered successfully.');
      setCreateModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormEmpId('');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Name' },
    { header: 'Email & Employee ID' },
    { header: 'Role' },
    { header: 'Department' },
    { header: 'Status' },
    { header: 'Actions', className: 'w-24 text-right' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            User Accounts & Access Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {pagination.total} registered employees, technicians, and system administrators
          </p>
        </div>

        <Button size="sm" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          Add User
        </Button>
      </div>

      {/* Filter Bar (Section 16 Specs) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full text-xs bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All Roles</option>
          <option value="system_admin">System Admin</option>
          <option value="it_manager">IT Manager</option>
          <option value="technician">Technician</option>
          <option value="asset_manager">Asset Manager</option>
          <option value="employee">Employee</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="No users found"
          description="Try adjusting your role or department filter, or create a new user account."
          actionLabel="Create User"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
          <Table columns={columns}>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{u.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-slate-800">{u.email}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {u.employeeId || '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {u.role?.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-600">
                    {u.department?.name || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? 'green' : 'red'} dot>
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetUser(u);
                      setConfirmModalOpen(true);
                    }}
                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                      u.isActive
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>

          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Confirmation Modal for Destructive Action (Section 16 Specs) */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={targetUser?.isActive ? 'Deactivate User Account' : 'Reactivate User Account'}
        description="Confirm operational account status update."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={targetUser?.isActive ? 'danger' : 'primary'}
              loading={submitting}
              onClick={handleToggleStatus}
            >
              Confirm {targetUser?.isActive ? 'Deactivation' : 'Activation'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to {targetUser?.isActive ? 'deactivate' : 'reactivate'} account for{' '}
          <strong className="text-slate-900">{targetUser?.name}</strong> ({targetUser?.email})?
          {targetUser?.isActive && ' They will be immediately blocked from signing in to ServiceDesk Pro.'}
        </p>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add User Account"
        description="Register a new employee, technician, or administrator."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={submitting} onClick={handleCreateUser}>
              Create User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-3">
          <Input
            label="Full Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Maya Patel"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="maya.patel@company.com"
              required
            />
            <Input
              label="Employee ID"
              value={formEmpId}
              onChange={(e) => setFormEmpId(e.target.value)}
              placeholder="EMP-1049"
            />
          </div>

          <Input
            label="Initial Password"
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Role"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'technician', label: 'Technician' },
                { value: 'it_manager', label: 'IT Manager' },
                { value: 'asset_manager', label: 'Asset Manager' },
                { value: 'system_admin', label: 'System Admin' },
              ]}
              required
            />

            <Select
              label="Department"
              value={formDept}
              onChange={(e) => setFormDept(e.target.value)}
              options={departments.map((d) => ({ value: d._id, label: d.name }))}
              placeholder="Select Department..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
