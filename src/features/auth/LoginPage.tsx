import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, UserCheck, User, Building2, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PBSLogo } from '../../components/institution/PBSBranding';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { INITIAL_USERS } from '../../services/storage/initialData';
import { dbService } from '../../services/storage/databaseService';

export const LoginPage: React.FC = () => {
  const { login, switchUserRoleForTesting, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('superadmin@polibanting.edu.my');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>('user-superadmin');

  // State khas untuk Pensyarah Umum (mana-mana pensyarah boleh isi nama & jabatan sendiri)
  const [lecturerName, setLecturerName] = useState('Pn. Haslinawati binti Hassan');
  const [lecturerDept, setLecturerDept] = useState('JKM');
  const [lecturerStaffId, setLecturerStaffId] = useState('PBS-STAF');

  // Email boleh diedit untuk setiap pengguna dalam panel RBAC
  const [userEmails, setUserEmails] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    const storedUsers = dbService.getUsers();
    INITIAL_USERS.forEach((u) => {
      const existing = storedUsers.find((su) => su.uid === u.uid);
      map[u.uid] = existing ? existing.email : u.email;
    });
    return map;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      // Jika pengguna memilih kad daripada senarai RBAC
      if (selectedRole) {
        const existingUser = dbService.getUserById(selectedRole);

        if (existingUser) {
          // Jika peranan ialah Pensyarah, kemas kini nama, e-mel, jabatan & no staf mengikut input pensyarah
          if (selectedRole === 'user-pensyarah-jkm') {
            if (!lecturerName.trim() || lecturerName.trim().length < 2) {
              setLocalError('Sila masukkan Nama Penuh Pensyarah (sekurang-kurangnya 2 aksara).');
              setIsSubmitting(false);
              return;
            }
            dbService.updateUser(
              selectedRole,
              {
                fullName: lecturerName.trim(),
                email: email.trim(),
                departmentId: lecturerDept,
                staffId: lecturerStaffId.trim() || 'PBS-STAF',
              },
              existingUser
            );
          } else if (email.trim() !== existingUser.email) {
            // Jika peranan lain menukar e-mel dalam kotak RBAC, kemas kini e-mel tersebut
            dbService.updateUser(
              selectedRole,
              { email: email.trim() },
              existingUser
            );
          }

          switchUserRoleForTesting(selectedRole);
          setIsSubmitting(false);
          navigate('/dashboard');
          return;
        }
      }

      // Log masuk biasa melalui e-mel
      const success = await login(email.trim(), password);
      setIsSubmitting(false);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Ralat semasa log masuk.');
      setIsSubmitting(false);
    }
  };

  const handleSelectRole = (uid: string) => {
    setSelectedRole(uid);
    setEmail(userEmails[uid] || '');
    setLocalError(null);

    if (uid === 'user-pensyarah-jkm') {
      const storedLecturer = dbService.getUserById('user-pensyarah-jkm');
      if (storedLecturer) {
        setLecturerName(storedLecturer.fullName);
        setLecturerDept(storedLecturer.departmentId || 'JKM');
        setLecturerStaffId(storedLecturer.staffId || 'PBS-STAF');
      }
    }
  };

  const handleUserEmailChange = (uid: string, newEmail: string) => {
    setUserEmails((prev) => ({ ...prev, [uid]: newEmail }));
    if (selectedRole === uid) {
      setEmail(newEmail);
    }
  };

  const formatRole = (role: string) => role.split('_').join(' ');

  return (
    <div className="min-h-screen bg-appbg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <PBSLogo size="lg" variant="light" />
        </div>
        <h2 className="text-xl font-bold text-navy-900 tracking-tight">
          Sistem Arkib Produk Inovasi ePembelajaran (SAPIe)
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Portal Rasmi Pengurusan & Pemeliharaan Inovasi Digital Pembelajaran
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-200/80 rounded-2xl sm:px-10">
          {(error || localError) && (
            <div className="mb-4">
              <Alert type="danger" title="Ralat Log Masuk">
                {error || localError}
              </Alert>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-base">Alamat E-mel Institusi</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@polibanting.edu.my"
                  className="input-base pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label-base">Kata Laluan</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Log Masuk ke SAPIe
            </Button>
          </form>

          {/* Panel Ujian Akses Peranan (RBAC) */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4 text-navy-700" />
              <span>Pilihan Peranan Pengguna (RBAC)</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              Pilih peranan di bawah. Bagi <strong>Pensyarah</strong>, sesiapa sahaja boleh mengisi nama, e-mel & jabatan sendiri:
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {INITIAL_USERS.map((u) => {
                const isLecturerCard = u.uid === 'user-pensyarah-jkm';
                const isSelected = selectedRole === u.uid;

                return (
                  <div
                    key={u.uid}
                    onClick={() => handleSelectRole(u.uid)}
                    className={
                      'w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer text-xs ' +
                      (isSelected
                        ? 'border-navy-500 bg-navy-50 ring-1 ring-navy-400'
                        : 'border-gray-200 hover:border-navy-300 hover:bg-gray-50')
                    }
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-gray-900 truncate">
                        {isLecturerCard
                          ? `${lecturerName || 'Pensyarah PBS'} (Boleh Tukar Nama)`
                          : u.fullName}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-100 text-navy-800 shrink-0 ml-2 whitespace-nowrap">
                        {formatRole(u.role)}
                      </span>
                    </div>

                    {/* Ruangan Tambahan Khas Jika Kad Pensyarah Dipilih */}
                    {isLecturerCard && isSelected && (
                      <div
                        className="space-y-2 mb-2 pt-1.5 border-t border-navy-200/60"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-[10px] text-navy-800 font-medium">
                          ✏️ Masukkan maklumat anda sebagai Pensyarah / Pencipta Produk:
                        </p>

                        <div className="relative">
                          <User className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={lecturerName}
                            onChange={(e) => setLecturerName(e.target.value)}
                            placeholder="Nama Penuh Pensyarah (cth: Pn. Siti binti Ali)"
                            className="w-full pl-6 pr-2 py-1 text-[11px] border border-gray-300 rounded-md bg-white focus:outline-none focus:border-navy-500 text-gray-800 font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="relative">
                            <Building2 className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                            <select
                              value={lecturerDept}
                              onChange={(e) => setLecturerDept(e.target.value)}
                              className="w-full pl-6 pr-2 py-1 text-[11px] border border-gray-300 rounded-md bg-white focus:outline-none focus:border-navy-500 text-gray-700"
                            >
                              <option value="JKM">Jabatan: JKM</option>
                              <option value="JPP">Jabatan: JPP</option>
                              <option value="JMSK">Jabatan: JMSK</option>
                              <option value="JPA">Jabatan: JPA</option>
                            </select>
                          </div>

                          <div className="relative">
                            <BadgeCheck className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={lecturerStaffId}
                              onChange={(e) => setLecturerStaffId(e.target.value)}
                              placeholder="No. Staf (Pilihan)"
                              className="w-full pl-6 pr-2 py-1 text-[11px] border border-gray-300 rounded-md bg-white focus:outline-none focus:border-navy-500 text-gray-700"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={userEmails[u.uid] || ''}
                        onChange={(e) => handleUserEmailChange(u.uid, e.target.value)}
                        onClick={() => handleSelectRole(u.uid)}
                        placeholder="emel@polibanting.edu.my"
                        className="w-full pl-6 pr-2 py-1 text-[11px] border border-gray-200 rounded-md bg-white focus:outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-300 text-gray-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedRole && (
              <p className="text-[10px] text-navy-700 font-medium mt-2 text-center">
                {'✅ Peranan dipilih — klik '}
                <strong>Log Masuk ke SAPIe</strong>
                {' di atas untuk masuk'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          {'Hak Cipta Terpelihara © '}
          {new Date().getFullYear()}
          {' Politeknik Banting Selangor.'}
        </div>
      </div>
    </div>
  );
};
