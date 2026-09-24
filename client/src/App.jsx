import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { Login } from './pages/auth/Login';

// Main Application Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { Tickets } from './pages/tickets/Tickets';
import { TicketDetails } from './pages/tickets/TicketDetails';
import { CreateTicket } from './pages/tickets/CreateTicket';
import { Assets } from './pages/assets/Assets';
import { AssetDetails } from './pages/assets/AssetDetails';
import { AssetForm } from './pages/assets/AssetForm';
import { Vendors } from './pages/assets/Vendors';
import { MyAssets } from './pages/employee/MyAssets';
import { KnowledgeBase } from './pages/knowledge/KnowledgeBase';
import { ArticleDetails } from './pages/knowledge/ArticleDetails';
import { ArticleForm } from './pages/knowledge/ArticleForm';
import { TechnicianWorkload } from './pages/manager/TechnicianWorkload';
import { SLAMonitoring } from './pages/manager/SLAMonitoring';
import { Reports } from './pages/manager/Reports';
import { WorkLogs } from './pages/technician/WorkLogs';

// Admin Pages
import { Users } from './pages/admin/Users';
import { Departments } from './pages/admin/Departments';
import { Categories } from './pages/admin/Categories';
import { SLAPolicies } from './pages/admin/SLAPolicies';
import { AuditLogs } from './pages/admin/AuditLogs';
import { Settings } from './pages/admin/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Application Workspace */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Tickets */}
              <Route path="tickets" element={<Tickets />} />
              <Route path="tickets/create" element={<CreateTicket />} />
              <Route path="tickets/:id" element={<TicketDetails />} />

              {/* Assets */}
              <Route path="my-assets" element={<MyAssets />} />
              <Route path="assets" element={<Assets />} />
              <Route
                path="assets/new"
                element={
                  <ProtectedRoute allowedRoles={['asset_manager', 'system_admin']}>
                    <AssetForm />
                  </ProtectedRoute>
                }
              />
              <Route path="assets/vendors" element={<Vendors />} />
              <Route path="assets/:id" element={<AssetDetails />} />
              <Route
                path="assets/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['asset_manager', 'system_admin']}>
                    <AssetForm />
                  </ProtectedRoute>
                }
              />

              {/* Knowledge Base */}
              <Route path="knowledge" element={<KnowledgeBase />} />
              <Route
                path="knowledge/new"
                element={
                  <ProtectedRoute allowedRoles={['technician', 'it_manager', 'system_admin']}>
                    <ArticleForm />
                  </ProtectedRoute>
                }
              />
              <Route path="knowledge/:id" element={<ArticleDetails />} />
              <Route
                path="knowledge/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['technician', 'it_manager', 'system_admin']}>
                    <ArticleForm />
                  </ProtectedRoute>
                }
              />

              {/* Technician Specific */}
              <Route
                path="work-logs"
                element={
                  <ProtectedRoute allowedRoles={['technician', 'it_manager', 'system_admin']}>
                    <WorkLogs />
                  </ProtectedRoute>
                }
              />

              {/* Manager & Reports */}
              <Route
                path="manager/workload"
                element={
                  <ProtectedRoute allowedRoles={['it_manager', 'system_admin']}>
                    <TechnicianWorkload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manager/sla"
                element={
                  <ProtectedRoute allowedRoles={['it_manager', 'system_admin']}>
                    <SLAMonitoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={['it_manager', 'system_admin', 'asset_manager']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* System Admin */}
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={['system_admin', 'it_manager']}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['system_admin']}>
                    <Departments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['system_admin', 'it_manager']}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/sla"
                element={
                  <ProtectedRoute allowedRoles={['system_admin']}>
                    <SLAPolicies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['system_admin']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['system_admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
