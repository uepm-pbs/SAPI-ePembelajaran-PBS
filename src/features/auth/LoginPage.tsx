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

  const storedUsers = dbService.getUsers();

  // Nama boleh diedit untuk setiap peranan dalam panel RBAC
  const [userNames, setUserNames] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    INITIAL_USERS.forEach((u) => {
      const existing = storedUsers.find((su) => su.uid === u.uid);
      map[u.uid] = existing ? existing.fullName : u.fullName;
    });
    return map;
  });

  // Email boleh diedit untuk setiap peranan dalam panel RBAC
  const [userEmails, setUserEmails] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    INITIAL_USERS.forEach((u) => {
      const existing = storedUsers.find((su) => su.uid === u.uid);
      map[u.uid] = existing ? existing.email : u.email;
    });
    return map;
  });

  const [email, setEmail] = useState(() => userEmails['user-superadmin'] || 'superadmin@polibanting.edu.my');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>('user-superadmin');

  // Pilihan tambahan khas untuk Pensyarah (Jabatan & No. Staf)
  const [lecturerDept, setLecturerDept] = useState(() => {
    const existing = storedUsers.find((su) => su.uid === 'user-pensyarah-jkm');
    return existing?.departmentId || 'JKM';
  });
  const [lecturerStaffId, setLecturerStaffId] = useState(() => {
    const existing = storedUsers.find((su) => su.uid === 'user-pensyarah-jkm');
    return existing?.staffId || 'PBS-STAF';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      if (selectedRole) {
        const existingUser = dbService.getUserById(selectedRole);

        if (existingUser) {
          const customName = (userNames[selectedRole] || '').trim();
          const customEmail = (email || userEmails[selectedRole] || '').trim();

          if (!customName || customName.length < 2) {
            setLocalError('Sila masukkan Nama Penuh pengguna (sekurang-kurangnya 2 aksara).');
            setIsSubmitting(false);
            return;
          }

          if (!customEmail || !customEmail.includes('@')) {
            setLocalError('Sila masukkan alamat e-mel yang sah.');
            setIsSubmitting(false);
            return;
          }

          const updates: Record<string, any> = {
            fullName: customName,
            email: customEmail,
          };

          if (selectedRole === 'user-pensyarah-jkm') {
            updates.departmentId = lecturerDept;
            updates.staffId = lecturerStaffId.trim() || 'PBS-STAF';
          }

          dbService.updateUser(selectedRole, updates, existingUser);
          switchUserRoleForTesting(selectedRole);
          setIsSubmitting(false);
          navigate('/dashboard');
          return;
        }
      }

      // Log masuk biasa melalui e-mel jika tidak memilih kad
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
  };

  const handleUserNameChange = (uid: string, newName: string) => {
    setUserNames((prev) => ({ ...prev, [uid]: newName }));
    setSelectedRole(uid);
  };

  const handleUserEmailChange = (uid: string, newEmail: string) => {
    setUserEmails((prev) => ({ ...prev, [uid]: newEmail }));
    setSelectedRole(uid);
    setEmail(newEmail);
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (selectedRole) {
                      setUserEmails((prev) => ({ ...prev, [selectedRole]: e.target.value }));
                    }
                  }}
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

          {/* Panel Pilihan Peranan (RBAC) */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4 text-navy-700" />
              <span>Pilihan Peranan Pengguna (RBAC)</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              Pilih peranan di bawah. Anda boleh menyunting <strong>Nama</strong> & <strong>E-mel</strong> sebelum klik Log Masuk:
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {INITIAL_USERS.map((u) => {
                const isLecturerCard = u.uid === 'user-pensyarah-jkm';
                const isSelected = selectedRole === u.uid;

                return (
                  <div
                    key={u.uid}
                    onClick={() => handleSelectRole(u.uid)}
                    className={
                      'w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer text-xs space-y-1.5 ' +
                      (isSelected
                        ? 'border-navy-500 bg-navy-50 ring-1 ring-navy-400'
                        : 'border-gray-200 hover:border-navy-300 hover:bg-gray-50')
                    }
                  >
                    {/* Baris Atas: Label Peranan */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-100 text-navy-800 whitespace-nowrap">
                        {formatRole(u.role)}
                      </span>
                      {isLecturerCard && (
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Terbuka kepada semua pensyarah
                        </span>
                      )}
                    </div>

                    {/* Input Nama Penuh (Boleh Edit untuk Semua Peranan) */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <User className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userNames[u.uid] || ''}
                        onChange={(e) => handleUserNameChange(u.uid, e.target.value)}
                        onClick={() => handleSelectRole(u.uid)}
                        placeholder="Nama Penuh Pegawai / Pensyarah"
                        className="w-full pl-6 pr-2 py-1 text-[11px] font-semibold border border-gray-200 rounded-md bg-white focus:outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-300 text-gray-900"
                      />
                    </div>

                    {/* Input E-mel (Boleh Edit untuk Semua Peranan) */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
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

                    {/* Pilihan Jabatan & No. Staf Khas untuk Pensyarah */}
                    {isLecturerCard && isSelected && (
                      <div
                        className="grid grid-cols-2 gap-1.5 pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                    )}
                  </div>
                );
              })}
            </div>

            {selectedRole && (
              <p className="text-[10px] text-navy-700 font-medium mt-2 text-center">
                {'✅ Peranan dipilih — semak nama/e-mel dan klik '}
                <strong>Log Masuk ke SAPIe</strong>
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
