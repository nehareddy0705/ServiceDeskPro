import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  CheckCheck,
  LogOut,
  User as UserIcon,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { Breadcrumbs } from './Breadcrumbs';

export const Topbar = ({ onOpenMobileMenu, onOpenSearch }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setShowNotifications(false);
    if (notif.ticket?._id || notif.ticket) {
      navigate(`/tickets/${notif.ticket._id || notif.ticket}`);
    } else if (notif.asset?._id || notif.asset) {
      navigate(`/assets/${notif.asset._id || notif.asset}`);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 md:hidden rounded focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors w-36 sm:w-60 focus:outline-none"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Search system...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded relative transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded shadow-lg overflow-hidden z-30 animate-in fade-in duration-100">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-2.5 items-start ${
                        !n.isRead ? 'bg-slate-50/70' : ''
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type?.includes('sla') ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : n.type?.includes('resolved') ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-medium truncate ${
                              !n.isRead ? 'text-slate-900 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="User account menu"
          >
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-medium text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-semibold text-slate-900 leading-none">
                {user?.name || 'User'}
              </span>
              <span className="block text-[10px] text-slate-500 capitalize leading-none mt-1">
                {role ? role.replace('_', ' ') : 'Employee'}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded shadow-lg overflow-hidden z-30 py-1 divide-y divide-slate-100 animate-in fade-in duration-100">
              <div className="px-3.5 py-2.5">
                <div className="text-xs font-semibold text-slate-900">{user?.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize border border-slate-200">
                    {role ? role.replace('_', ' ') : 'Employee'}
                  </span>
                  {user?.department?.name && (
                    <span className="text-[10px] text-slate-500 truncate">
                      {user.department.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dashboard</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
