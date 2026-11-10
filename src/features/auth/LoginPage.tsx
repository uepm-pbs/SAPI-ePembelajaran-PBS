import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  User,
  Building2,
  BadgeCheck,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PBSLogo } from '../../components/institution/PBSBranding';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { INITIAL_USERS } from '../../services/storage/initialData';
import { dbService } from '../../services/storage/databaseService';

const PASSWORD_STORAGE_KEY = 'sapie_user_passwords_v1';
const USERS_STORAGE_KEY = 'sapie_users_v1';
const DEFAULT_PASSWORD = 'password123';

export const LoginPage: React.FC = () => {
  const { switchUserRoleForTesting, error } = useAuth();
  const navigate = useNavigate();

  // Pastikan mana-mana pengguna baharu dalam INITIAL_USERS (seperti Pegawai MARO) dimasukkan ke dalam localStorage secara automatik
  useEffect(() => {
    try {
      const currentUsers = dbService.getUsers();
      let hasNewUser = false;
      const mergedUsers = [...currentUsers];

      INITIAL_USERS.forEach((initUser) => {
        if (!mergedUsers.some((u) => u.uid === initUser.uid)) {
          mergedUsers.push(initUser);
          hasNewUser = true;
        }
      });

      if (hasNewUser) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mergedUsers));
      }
    } catch (e) {
      console.error('Sync users error:', e);
    }
  }, []);

  const storedUsers = dbService.getUsers();

  // Muatkan kata laluan setiap pengguna dari localStorage (default: password123)
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(PASSWORD_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      const map: Record<string, string> = {};
      INITIAL_USERS.forEach((u) => {
        map[u.uid] = parsed[u.uid] || DEFAULT_PASSWORD;
      });
      return map;
    } catch {
      const map: Record<string, string> = {};
      INITIAL_USERS.forEach((u) => {
        map[u.uid] = DEFAULT_PASSWORD;
      });
      return map;
    }
  });

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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>('user-superadmin');

  // State untuk panel Lupa / Tukar Kata Laluan
  const [showResetBox, setShowResetBox] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Pilihan tambahan khas untuk Pensyarah (Jabatan & No. Staf)
  const [lecturerDept, setLecturerDept] = useState(() => {
    const existing = storedUsers.find((su) => su.uid === 'user-pensyarah-jkm');
    return existing?.departmentId || 'JKM';
  });
  const [lecturerStaffId, setLecturerStaffId] = useState(() => {
    const existing = storedUsers.find((su) => su.uid === 'user-pensyarah-jkm');
    return existing?.staffId || 'PBS-STAF';
  });

  const savePasswordsToStorage = (updated: Record<string, string>) => {
    setUserPasswords(updated);
    localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(updated));
  };

  const resolveTargetUid = (): string | null => {
    if (selectedRole) return selectedRole;
    const trimmedEmail = email.trim().toLowerCase();
    const matchedEntry = Object.entries(userEmails).find(
      ([, em]) => em.trim().toLowerCase() === trimmedEmail
    );
    return matchedEntry ? matchedEntry[0] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const targetUid = resolveTargetUid();

      if (!targetUid) {
        setLocalError('Alamat e-mel tidak ditemui. Sila pilih peranan anda di bawah.');
        setIsSubmitting(false);
        return;
      }

      let existingUser = dbService.getUserById(targetUid);
      if (!existingUser) {
        const fallbackInit = INITIAL_USERS.find((u) => u.uid === targetUid);
        if (fallbackInit) {
          const all = dbService.getUsers();
          all.push(fallbackInit);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(all));
          existingUser = fallbackInit;
        }
      }

      if (!existingUser) {
        setLocalError('Rekod pengguna tidak ditemui dalam sistem.');
        setIsSubmitting(false);
        return;
      }

      // SEMAKAN KATA LALUAN KETAT
      const expectedPassword = userPasswords[targetUid] || DEFAULT_PASSWORD;
      if (password !== expectedPassword) {
        setLocalError(
          'Kata laluan tidak tepat bagi akaun ini. Sila cuba lagi atau klik "Lupa / Tukar Kata Laluan?" di bawah.'
        );
        setIsSubmitting(false);
        return;
      }

      const customName = (userNames[targetUid] || existingUser.fullName || '').trim();
      const customEmail = (email || userEmails[targetUid] || existingUser.email || '').trim();

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

      if (targetUid === 'user-pensyarah-jkm') {
        updates.departmentId = lecturerDept;
        updates.staffId = lecturerStaffId.trim() || 'PBS-STAF';
      }

      dbService.updateUser(targetUid, updates, existingUser);
      switchUserRoleForTesting(targetUid);
      setIsSubmitting(false);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Ralat semasa log masuk.');
      setIsSubmitting(false);
    }
  };

  const handleSaveNewPassword = () => {
    setLocalError(null);
    setSuccessMessage(null);

    const targetUid = resolveTargetUid();
    if (!targetUid) {
      setLocalError('Sila pilih peranan anda dalam senarai di bawah terlebih dahulu.');
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setLocalError('Kata laluan baharu mestilah sekurang-kurangnya 4 aksara.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setLocalError('Pengesahan kata laluan baharu tidak sepadan.');
      return;
    }

    const updated = { ...userPasswords, [targetUid]: newPasswordInput };
    savePasswordsToStorage(updated);
    setPassword(newPasswordInput);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setShowResetBox(false);
    setSuccessMessage(
      `Kata laluan bagi "${userNames[targetUid]}" berjaya dikemas kini! Sila klik Log Masuk.`
    );
  };

  const handleResetToDefaultPassword = () => {
    setLocalError(null);
    setSuccessMessage(null);

    const targetUid = resolveTargetUid();
    if (!targetUid) {
      setLocalError('Sila pilih peranan anda dalam senarai di bawah terlebih dahulu.');
      return;
    }

    const updated = { ...userPasswords, [targetUid]: DEFAULT_PASSWORD };
    savePasswordsToStorage(updated);
    setPassword(DEFAULT_PASSWORD);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setShowResetBox(false);
    setSuccessMessage(
      `Kata laluan bagi "${userNames[targetUid]}" telah di-reset semula kepada asal (${DEFAULT_PASSWORD}).`
    );
  };

  const handleSelectRole = (uid: string) => {
    setSelectedRole(uid);
    setEmail(userEmails[uid] || '');
    setLocalError(null);
    setSuccessMessage(null);
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

  const formatRole = (role: string) => {
    if (role === 'pegawai_maro') return 'Pegawai Multimedia & Sumber (MARO)';
    return role.split('_').join(' ');
  };

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

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
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
              <div className="flex items-center justify-between mb-1">
                <label className="label-base mb-0">Kata Laluan</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetBox(!showResetBox);
                    setLocalError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] font-semibold text-navy-700 hover:text-navy-900 underline"
                >
                  {showResetBox ? 'Tutup Panel Reset' : 'Lupa / Tukar Kata Laluan?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata laluan (asal: password123)"
                  className="input-base pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title={showPassword ? 'Sembunyikan' : 'Papar Kata Laluan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Kotak Reset / Tukar Kata Laluan */}
            {showResetBox && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  <span>
                    Tetapkan Semula Kata Laluan ({selectedRole ? userNames[selectedRole] : email})
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Masukkan kata laluan baharu di bawah, atau klik <strong>Reset ke Asal</strong> jika anda terlupa kata laluan.
                </p>

                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Kata laluan baharu (min 4 aksara)"
                  className="input-base text-xs bg-white"
                />
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Sahkan kata laluan baharu"
                  className="input-base text-xs bg-white"
                />

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSaveNewPassword}
                    className="flex-1 text-xs"
                  >
                    Simpan Kata Laluan Baharu
                  </Button>
                  <button
                    type="button"
                    onClick={handleResetToDefaultPassword}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-[11px] font-semibold text-amber-900 transition-colors"
                    title="Kembalikan kepada password123"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ke Asal</span>
                  </button>
                </div>
              </div>
            )}

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
              Pilih peranan di bawah, sunting <strong>Nama</strong> & <strong>E-mel</strong> jika perlu, dan masukkan kata laluan di atas:
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
                {'✅ Peranan dipilih — masukkan kata laluan dan klik '}
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
