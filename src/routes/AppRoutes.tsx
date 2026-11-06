import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProductArchivePage } from '../features/products/ProductArchivePage';
import { ProductProfilePage } from '../features/products/ProductProfilePage';
import { ProductRegistrationPage } from '../features/registrations/ProductRegistrationPage';
import { AchievementListPage } from '../features/achievements/AchievementListPage';
import { DocumentArchivePage } from '../features/documents/DocumentArchivePage';
import { ReportsAnalyticsPage } from '../features/reports/ReportsAnalyticsPage';
import { UserManagementPage } from '../features/users/UserManagementPage';
import { SystemSettingsPage } from '../features/settings/SystemSettingsPage';
import { AuditLogPage } from '../features/audit/AuditLogPage';
import { ProfilePage } from '../features/profile/ProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Product Archive */}
          <Route path="/arkib-produk" element={<ProductArchivePage />} />
          <Route path="/arkib-produk/:productId" element={<ProductProfilePage />} />

          {/* Product Registration */}
          <Route path="/pendaftaran-produk" element={<ProductArchivePage />} />
          <Route path="/pendaftaran-produk/baharu" element={<ProductRegistrationPage />} />
          <Route path="/pendaftaran-produk/:productId/edit" element={<ProductRegistrationPage />} />

          {/* Achievements */}
          <Route path="/pencapaian" element={<AchievementListPage />} />
          <Route path="/pencapaian/baharu" element={<AchievementListPage />} />

          {/* Reports & Analytics */}
          <Route path="/laporan" element={<ReportsAnalyticsPage />} />
          <Route path="/analitik" element={<ReportsAnalyticsPage />} />

          {/* Documents */}
          <Route path="/dokumen" element={<DocumentArchivePage />} />

          {/* User Management */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm']}
              />
            }
          >
            <Route path="/pengguna" element={<UserManagementPage />} />
          </Route>

          {/* System Settings */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm']}
              />
            }
          >
            <Route path="/tetapan" element={<SystemSettingsPage />} />
          </Route>

          {/* Audit Logs */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  'super_admin',
                  'admin',
                  'pentadbir_uepm',
                  'ketua_unit_uepm',
                  'timbalan_pengarah',
                ]}
              />
            }
          >
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Route>

          {/* Profile */}
          <Route path="/profil" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
