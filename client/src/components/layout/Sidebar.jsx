import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  BookOpen,
  Box,
  Clock,
  Users,
  ShieldAlert,
  BarChart3,
  Layers,
  Tag,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Wrench,
  Building2,
  FolderGit2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { user, role, isEmployee, isTechnician, isManager, isAssetManager, isAdmin } = useAuth();

  // Define role-specific navigation menus
  const getNavItems = () => {
    if (isEmployee) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'My Tickets', path: '/tickets', icon: Ticket },
        { label: 'Create Ticket', path: '/tickets/create', icon: PlusCircle },
        { label: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
        { label: 'My Assets', path: '/my-assets', icon: Box },
      ];
    }

    if (isTechnician) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'My Tickets', path: '/tickets?scope=assigned', icon: Ticket },
        { label: 'All Assigned Tickets', path: '/tickets', icon: Headphones },
        { label: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
        { label: 'Assets', path: '/assets', icon: Box },
        { label: 'Work Logs', path: '/work-logs', icon: Clock },
      ];
    }

    if (isManager) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Tickets', path: '/tickets', icon: Ticket },
        { label: 'Technicians', path: '/manager/workload', icon: Users },
        { label: 'SLA Monitoring', path: '/manager/sla', icon: ShieldAlert },
        { label: 'Assets', path: '/assets', icon: Box },
        { label: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
      ];
    }

    if (isAssetManager) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Assets', path: '/assets', icon: Box },
        { label: 'Asset Assignments', path: '/assets?filter=assigned', icon: Layers },
        { label: 'Repairs', path: '/assets?status=under_repair', icon: Wrench },
        { label: 'Vendors', path: '/assets/vendors', icon: Building2 },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
      ];
    }

    if (isAdmin) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Tickets', path: '/tickets', icon: Ticket },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Departments', path: '/admin/departments', icon: Building2 },
        { label: 'Categories', path: '/admin/categories', icon: Tag },
        { label: 'SLA Policies', path: '/admin/sla', icon: ShieldAlert },
        { label: 'Assets', path: '/assets', icon: Box },
        { label: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ];
    }

    return [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
            SP
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-semibold text-slate-900 text-sm tracking-tight block leading-none">
                ServiceDesk <span className="text-blue-600 font-medium text-xs">PRO</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-1 leading-none font-medium">
                ITSM Operations
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {!isCollapsed && (
          <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 text-sm rounded font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Workspace Role Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          {!isCollapsed && (
            <div className="truncate text-left flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-500 capitalize truncate">
                {role ? role.replace('_', ' ') : 'Employee'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ease-in-out h-screen sticky top-0 z-20 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-200 ease-in-out md:hidden shadow-xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
