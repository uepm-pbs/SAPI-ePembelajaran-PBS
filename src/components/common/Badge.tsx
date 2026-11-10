import React from 'react';
import clsx from 'clsx';
import { RegistrationStatus } from '../../types/product';
import { AchievementVerificationStatus } from '../../types/achievement';
import { UserRole } from '../../types/auth';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const variantClasses = {
    primary: 'bg-navy-100 text-navy-800 border border-navy-200',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const RegistrationStatusBadge: React.FC<{ status: RegistrationStatus }> = ({ status }) => {
  switch (status) {
    case 'Diluluskan':
      return <Badge variant="success">Diluluskan</Badge>;
    case 'Dihantar untuk Semakan':
      return <Badge variant="info">Dihantar untuk Semakan</Badge>;
    case 'Dalam Semakan':
      return <Badge variant="warning">Dalam Semakan</Badge>;
    case 'Memerlukan Pembetulan':
      return <Badge variant="warning">Perlu Pembetulan</Badge>;
    case 'Ditolak':
      return <Badge variant="danger">Ditolak</Badge>;
    case 'Diarkibkan':
      return <Badge variant="primary">Diarkibkan</Badge>;
    case 'Draf':
    default:
      return <Badge variant="neutral">Draf</Badge>;
  }
};

export const AchievementStatusBadge: React.FC<{ status: AchievementVerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'Disahkan':
      return <Badge variant="success">Disahkan</Badge>;
    case 'Dalam Semakan':
    case 'Dihantar':
      return <Badge variant="info">Dalam Semakan</Badge>;
    case 'Memerlukan Pembetulan':
      return <Badge variant="warning">Perlu Pembetulan</Badge>;
    case 'Ditolak':
      return <Badge variant="danger">Ditolak</Badge>;
    case 'Draf':
    default:
      return <Badge variant="neutral">Draf</Badge>;
  }
};

export const UserRoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'super_admin':
      return <Badge variant="danger">Super Admin</Badge>;
    case 'admin':
      return <Badge variant="danger">Admin</Badge>;
    case 'pentadbir_uepm':
      return <Badge variant="primary">Pentadbir UePM</Badge>;
    case 'ketua_unit_uepm':
      return <Badge variant="primary">Ketua Unit UePM</Badge>;
    case 'pegawai_pbs':
      return <Badge variant="info">Pegawai ePembelajaran PBS</Badge>;
    case 'pegawai_maro':
      return <Badge variant="info">Pegawai Multimedia & Sumber (MARO)</Badge>;
    case 'pegawai_jpp':
      return <Badge variant="info">Pegawai ePembelajaran JPP</Badge>;
    case 'pegawai_jabatan':
      return <Badge variant="info">Pegawai Jabatan</Badge>;
    case 'pegawai_jkm':
      return <Badge variant="info">Pegawai ePembelajaran JKM</Badge>;
    case 'pegawai_jmsk':
      return <Badge variant="info">Pegawai ePembelajaran JMSK</Badge>;
    case 'pegawai_jpa':
      return <Badge variant="info">Pegawai ePembelajaran JPA</Badge>;
    case 'timbalan_pengarah':
      return <Badge variant="warning">Timbalan Pengarah Akademik</Badge>;
    case 'pensyarah':
      return <Badge variant="success">Pensyarah / Pencipta</Badge>;
    case 'pengurusan':
      return <Badge variant="secondary">Pengurusan</Badge>;
    default:
      return <Badge variant="neutral">{role}</Badge>;
  }
};
