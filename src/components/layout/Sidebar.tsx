import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Archive,
  FilePlus,
  Trophy,
  FileText,
  FolderArchive,
  BarChart3,
  Users,
  Settings,
  History,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { PBSLogo } from '../institution/PBSBranding';
import { UserRoleBadge } from '../common/Badge';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      label: 'Dashboard Utama',
      to: '/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'pentadbir_uepm', 'pegawai_jabatan', 'pensyarah', 'pengurusan'],
    },
    {
      label: 'Arkib Produk',
      to: '/arkib-produk',
      icon: Archive,
      roles: ['super_admin', 'pentadbir_uepm', 'pegawai_jabatan', 'pensyarah', 'pengurusan'],
    },
    {
      label: 'Pendaftaran Produk',
      to: '/pendaftaran-produk',
      icon: FilePlus,
      roles: ['super_admin', 'pentadbir_uepm', 'pegawai_jabatan', 'pensyarah'],
    },
    {
      label: 'Pencapaian & Anugerah',
      to: '/pencapaian',
      icon: Trophy,
      roles: ['super_admin', 'pentadbir_uepm', 'pegawai_jabatan', 'pensyarah', 'pengurusan'],
    },
    {
      label: 'Pengurusan Laporan',
      to: '/laporan',
      icon: FileText,
      roles: ['super_admin', 'pentadbir_uepm', 'pegawai_jabatan', 'pengurusan'],
    },
    {
      label: 'Dokumen Arkib',
      to: '/dokumen',
      icon: FolderArchive,
      roles: ['super_admin', 'pentadbir_uepm', 'pegawai_jabatan', 'pensyarah', 'pengurusan'],
    },
    {
      label: 'Analitik & Statistik',
      to: '/analitik',
      icon: BarChart3,
      roles: ['super_admin', 'pentadbir_uepm', 'pegawai_jabatan', 'pengurusan'],
    },
    {
      label: 'Pengurusan Pengguna',
      to: '/pengguna',
      icon: Users,
      roles: ['super_admin'],
    },
    {
      label: 'Tetapan Sistem',
      to: '/tetapan',
      icon: Settings,
      roles: ['super_admin'],
    },
    {
      label: 'Log Aktiviti',
      to: '/audit-log',
      icon: History,
      roles: ['super_admin', 'pentadbir_uepm'],
    },
    {
      label: 'Profil Saya',
      to: '/profil',
      icon: UserCircle,
      roles: ['super_admin', 'pentadbir_uepm', 'pegawai_jabatan', 'pensyarah', 'pengurusan'],
    },
  ];

  const filteredItems = navigationItems.filter(item =>
    !role || item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 bg-navy-800 text-white flex flex-col transition-all duration-300 ease-in-out shadow-xl border-r border-navy-700',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-700/80 shrink-0">
          {!collapsed ? (
            <PBSLogo size="sm" variant="dark" />
          ) : (
            <div className="w-full flex justify-center">
              <img
                src="./sapie-logo.png"
                alt="SAPIe"
                className="h-9 w-9 object-contain"
              />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center h-7 w-7 rounded-lg bg-navy-700/50 hover:bg-navy-700 text-navy-200 hover:text-white transition-colors"
            title={collapsed ? 'Kembangkan Menu' : 'Kuncupkan Menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Card (When expanded) */}
        {!collapsed && user && (
          <div className="px-4 py-3 mx-3 my-2.5 rounded-xl bg-navy-900/60 border border-navy-700/60">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-navy-700 text-navy-100 flex items-center justify-center font-bold text-sm shrink-0 border border-navy-600">
                {user.fullName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                <div className="mt-1">
                  <UserRoleBadge role={user.role} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group select-none',
                    isActive
                      ? 'bg-navy-600 text-white font-semibold shadow-sm'
                      : 'text-navy-200 hover:bg-navy-700/70 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0 text-navy-200 group-hover:text-white" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-navy-700/80 shrink-0">
          <button
            onClick={handleLogout}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors',
              collapsed && 'justify-center px-2'
            )}
            title="Log Keluar"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Log Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
