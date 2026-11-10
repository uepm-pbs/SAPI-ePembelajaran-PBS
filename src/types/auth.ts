export type UserRole = 
  | 'super_admin'         // Super Admin: Kawalan penuh pentadbiran sistem
  | 'admin'               // Admin: Pentadbir sistem
  | 'pentadbir_uepm'      // Pentadbir UePM: Pengurusan arkib institusi & kelulusan
  | 'ketua_unit_uepm'     // Ketua Unit UePM: Ketua unit ePembelajaran
  | 'pegawai_pbs'         // Pegawai ePembelajaran PBS: Pegawai ePembelajaran Politeknik Banting
  | 'pegawai_maro'        // Pegawai Multimedia dan Sumber (MARO)
  | 'pegawai_jpp'         // Pegawai ePembelajaran JPP: Jabatan Penyelenggaraan Pesawat
  | 'pegawai_jabatan'     // Pegawai Jabatan: Kawalan & semakan peringkat jabatan
  | 'pegawai_jkm'         // Pegawai ePembelajaran JKM: Jabatan Kejuruteraan Mekanikal
  | 'pegawai_jmsk'        // Pegawai ePembelajaran JMSK: Jabatan Matematik, Sains & Komputer
  | 'pegawai_jpa'         // Pegawai ePembelajaran JPA: Jabatan Pengajian Am
  | 'timbalan_pengarah'   // Timbalan Pengarah Akademik: Pengurusan akademik
  | 'pensyarah'           // Pensyarah / Pencipta Produk: Pendaftaran, draf, pengemaskinian produk
  | 'pengurusan';         // Pengurusan / Pembaca: Paparan sahaja (read-only)

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  staffId?: string;
  role: UserRole;
  departmentId?: string; // e.g., 'JKM', 'JPP', or 'SEMUA'
  active: boolean;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Department {
  departmentId: string;
  code: string; // e.g. JKM, JPP, JMSK, JPA, JP
  name: string; // e.g. Jabatan Kejuruteraan Mekanikal
  active: boolean;
  createdAt: string;
  updatedAt: string;
  headName?: string;
  contactEmail?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
