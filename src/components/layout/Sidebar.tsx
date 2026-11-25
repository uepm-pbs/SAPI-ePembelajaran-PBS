import React, { useState } from 'react';
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
  BookOpen,
  X,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Printer,
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

export const UserGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'peranan' | 'daftar' | 'semakan' | 'dokumen' | 'faq'>('peranan');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-gray-800">
        {/* Modal Header */}
        <div className="bg-navy-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-navy-700 flex items-center justify-center border border-navy-600">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Buku Panduan Penggunaan Sistem SAPIe
              </h3>
              <p className="text-xs text-navy-200">
                Unit ePembelajaran (UePM) — Politeknik Banting Selangor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-xs font-medium text-white transition-colors"
              title="Cetak Panduan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-navy-700/60 hover:bg-navy-700 text-navy-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 text-xs font-semibold">
          {[
            { id: 'peranan', label: '1. Peranan & Log Masuk' },
            { id: 'daftar', label: '2. Pendaftaran Produk' },
            { id: 'semakan', label: '3. Semakan & Kelulusan' },
            { id: 'dokumen', label: '4. Dokumen & Pencapaian' },
            { id: 'faq', label: '5. Soalan Lazim (FAQ)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'px-3 py-2 rounded-lg whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-navy-800 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed">
          {activeTab === 'peranan' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <h4 className="font-bold text-sm mb-1">Pengenalan Sistem SAPIe</h4>
                <p>
                  <strong>Sistem Arkib Produk Inovasi ePembelajaran (SAPIe)</strong> ialah repositori digital berpusat Politeknik Banting Selangor bagi merekod, mengesahkan, dan memelihara produk inovasi PdP digital pensyarah PBS dari tahun <strong>2018 hingga 2050</strong>.
                </p>
              </div>

              <h4 className="font-bold text-sm text-navy-900">Senarai 13 Peranan Pengguna Rasmi</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                      <th className="p-2.5 font-bold">Peranan</th>
                      <th className="p-2.5 font-bold">Nama Pegawai</th>
                      <th className="p-2.5 font-bold">Skop</th>
                      <th className="p-2.5 font-bold">Tugas Utama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-2.5 font-semibold">Super Admin / Admin / Pentadbir & Ketua Unit UePM</td>
                      <td className="p-2.5">Aishah binti Saim</td>
                      <td className="p-2.5">SEMUA</td>
                      <td className="p-2.5">Kawalan penuh sistem, pengguna, tetapan & kelulusan produk inovasi.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Pegawai ePembelajaran PBS</td>
                      <td className="p-2.5">Normala binti Sulliaman</td>
                      <td className="p-2.5">SEMUA</td>
                      <td className="p-2.5">Penyelaras institusi — mendaftar & memantau produk semua jabatan.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Pegawai Multimedia & Sumber (MARO)</td>
                      <td className="p-2.5">Dehl Affie Abang Kassim</td>
                      <td className="p-2.5">SEMUA</td>
                      <td className="p-2.5">Penyelaras multimedia & sumber — mendaftar produk, media/dokumen & analitik.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Pegawai ePembelajaran JPP</td>
                      <td className="p-2.5">Mohd Aswad bin Othman</td>
                      <td className="p-2.5">JPP</td>
                      <td className="p-2.5">Penyelaras produk inovasi Jabatan Kejuruteraan Penyelenggaraan Pesawat.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Pegawai ePembelajaran JKM</td>
                      <td className="p-2.5">Dr. Lim Yee Kai</td>
                      <td className="p-2.5">JKM</td>
                      <td className="p-2.5">Penyelaras produk inovasi Jabatan Kejuruteraan Mekanikal.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Pegawai ePembelajaran JMSK</td>
                      <td className="p-2.5">Nurul Izzati binti Mohd Zaki</td>
                      <td className="p-2.5">JMSK</td>
                      <td className="p-2.5">Penyelaras produk inovasi Jabatan Matematik, Sains & Komputer.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Pegawai ePembelajaran JPA</td>
                      <td className="p-2.5">Huwaina Jasmin binti Hussin</td>
                      <td className="p-2.5">JPA</td>
                      <td className="p-2.5">Penyelaras produk inovasi Jabatan Pengajian Am.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Timbalan Pengarah / Pengurusan</td>
                      <td className="p-2.5">Roswady bin Abdul Wahab / Pengurusan</td>
                      <td className="p-2.5">SEMUA</td>
                      <td className="p-2.5">Pemantauan eksekutif, laporan, analitik & pencapaian institusi.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-emerald-800">Pensyarah / Pencipta</td>
                      <td className="p-2.5 text-emerald-800">Terbuka kepada semua pensyarah PBS</td>
                      <td className="p-2.5">Ikut Jabatan</td>
                      <td className="p-2.5">Mendaftar produk baharu, simpan draf, hantar semakan, dokumen & pencapaian.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                <h5 className="font-bold text-amber-900">💡 Panduan Log Masuk & Tukar Kata Laluan:</h5>
                <ul className="list-disc pl-4 space-y-1 text-amber-900">
                  <li><strong>Pensyarah PBS:</strong> Klik kad <em>PENSYARAH</em> di halaman Log Masuk, taip <strong>Nama Penuh</strong>, <strong>E-mel</strong>, <strong>No. Staf</strong>, dan pilih <strong>Jabatan (JKM / JPP / JMSK / JPA)</strong> anda sendiri sebelum klik Log Masuk.</li>
                  <li><strong>Kata Laluan Asal:</strong> <code>password123</code>. Anda boleh menukar kata laluan atau klik <strong>Reset ke Asal</strong> melalui pautan <em>"Lupa / Tukar Kata Laluan?"</em> di halaman Log Masuk.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'daftar' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-navy-900">Panduan Mendaftar Produk Inovasi (6 Bahagian A – F)</h4>
              <p>
                Klik butang <strong>+ Daftar Produk</strong> di Dashboard Utama atau menu <strong>Pendaftaran Produk</strong>. Lengkapkan ruangan bertanda <span className="text-rose-600 font-bold">*</span>:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60">
                  <p className="font-bold text-navy-900 mb-1">Bahagian A: Maklumat Asas</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li><strong>Tajuk Produk:</strong> Minimum 3 aksara.</li>
                    <li><strong>Ringkasan Eksekutif:</strong> Minimum 5 aksara (Maks 500).</li>
                    <li><strong>Penerangan, Objektif & Pernyataan Masalah:</strong> Minimum 5 aksara setiap satu.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60">
                  <p className="font-bold text-navy-900 mb-1">Bahagian B: Maklumat Akademik</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Pilih <strong>Jabatan (JKM / JPP / JMSK / JPA)</strong>.</li>
                    <li>Isi <strong>Program Pengajian</strong> (min 2 aksara, cth: DKM) & <strong>Nama Kursus</strong>.</li>
                    <li>Isi <strong>Sasaran Pengguna</strong> & <strong>Kaedah PdP</strong> (min 3 aksara).</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60">
                  <p className="font-bold text-navy-900 mb-1">Bahagian C & D: Kategori & Pasukan</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Pilih <strong>Kategori Utama Produk</strong> dan klik sekurang-kurangnya <strong>1 Teknologi</strong>.</li>
                    <li>Semak maklumat <strong>Pencipta Utama</strong> dan klik <strong>+ Tambah Ahli</strong> jika ada rakan pembangun.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60">
                  <p className="font-bold text-navy-900 mb-1">Bahagian E & F: Pembangunan & Hantar</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Masukkan <strong>Tahun Pembangunan (2018 – 2050)</strong>, Status & Versi.</li>
                    <li>Klik <strong>Simpan Draf</strong> (untuk sambung kemudian) atau <strong>Hantar untuk Semakan</strong> (untuk kelulusan UePM).</li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Petunjuk Lencana Aksara:</strong> Setiap ruangan mempunyai pengira aksara di penjuru kanan atas. Apabila lencana bertukar <strong>Hijau</strong>, ruangan tersebut sudah mencukupi syarat!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'semakan' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-navy-900">Aliran Kerja Semakan & Kelulusan (Pentadbir UePM)</h4>
              <p>
                Produk yang dihantar melalui butang <strong>Hantar untuk Semakan</strong> akan menerima kod arkib rasmi (contoh: <code>PBS-EP-2026-0001</code>) dan berstatus <strong>DIHANTAR UNTUK SEMAKAN</strong>.
              </p>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-navy-200 bg-navy-50/50">
                  <p className="font-bold text-navy-900">Siapa yang menyemak?</p>
                  <p className="text-gray-700 mt-0.5">
                    <strong>Super Admin</strong>, <strong>Admin</strong>, <strong>Pentadbir UePM</strong>, atau <strong>Ketua Unit UePM</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                  <p className="font-bold text-gray-900">Langkah Semakan:</p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-gray-700">
                    <li>Log masuk sebagai <strong>Pentadbir UePM</strong> (<code>uepm@polibanting.edu.my</code>).</li>
                    <li>Pada <strong>Dashboard Utama</strong> (bahagian <em>Tindakan Diperlukan</em>) atau menu <strong>Arkib Produk</strong>, klik pada produk berstatus <strong>Dihantar untuk Semakan</strong>.</li>
                    <li>Semak butiran produk, kemudian pilih keputusan semakan berserta ulasan:
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li><span className="text-emerald-700 font-bold">Luluskan Produk:</span> Status bertukar kepada <strong>Diluluskan</strong> (rasmi dalam arkib).</li>
                        <li><span className="text-amber-700 font-bold">Minta Pembetulan:</span> Produk dipulangkan kepada pencipta untuk dikemas kini dan dihantar semula.</li>
                        <li><span className="text-rose-700 font-bold">Tolak Pendaftaran:</span> Status bertukar kepada <strong>Ditolak</strong>.</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dokumen' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-navy-900">Panduan Muat Naik Dokumen Arkib & Kapasiti Fail</h4>
              <p>
                Di menu <strong>Dokumen Arkib</strong>, klik butang <strong>Muat Naik Dokumen</strong>. Sistem menyediakan <strong>2 Kaedah Simpanan</strong>:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <h5 className="font-bold text-navy-900 mb-1">1. Fail Komputer (Maksimum 25 MB)</h5>
                  <p className="text-gray-600">
                    Sesuai untuk dokumen rasmi bersaiz sederhana seperti kertas cadangan, manual pengguna, sijil, dan gambar (<code>.pdf</code>, <code>.docx</code>, <code>.xlsx</code>, <code>.pptx</code>, <code>.jpg</code>, <code>.png</code>, <code>.zip</code>).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60">
                  <h5 className="font-bold text-blue-900 mb-1">2. Pautan Google Drive / Cloud (Tanpa Had Saiz!)</h5>
                  <p className="text-blue-800">
                    Sesuai untuk fail bersaiz besar (melebihi 25 MB hingga beratus-ratus MB/GB) seperti rakaman video PdP penuh, fail ZIP pakej SCORM/AR/VR, atau folder Google Drive / OneDrive / SharePoint.
                  </p>
                </div>
              </div>

              <h4 className="font-bold text-sm text-navy-900 pt-2">Pencapaian, Anugerah & Laporan</h4>
              <ul className="list-disc pl-4 space-y-1 text-gray-700">
                <li><strong>Pencapaian & Anugerah:</strong> Rekodkan kemenangan pertandingan inovasi atau pengiktirafan peringkat Institusi, Negeri, Kebangsaan & Antarabangsa.</li>
                <li><strong>Pengurusan Laporan & Analitik:</strong> Tapis statistik mengikut <strong>Tahun (2018 – 2050)</strong> dan <strong>Jabatan</strong> untuk cetakan laporan eksekutif.</li>
              </ul>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-navy-900">Soalan Lazim (FAQ)</h4>

              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                <p className="font-bold text-navy-900">1. Mengapa saya tidak dapat menekan Hantar pada borang pendaftaran produk?</p>
                <p className="text-gray-600">
                  Pastikan semua ruangan bertanda (*) di Bahagian A hingga E telah diisi dan lencana bilangan aksara di penjuru kanan atas setiap ruangan telah bertukar menjadi warna <strong>Hijau</strong>. Jika ada ruangan yang tertinggal, sistem akan membawa anda terus ke bahagian tersebut.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                <p className="font-bold text-navy-900">2. Bagaimana jika saya terlupa kata laluan?</p>
                <p className="text-gray-600">
                  Di halaman Log Masuk, pilih kad peranan anda, klik pautan <strong>"Lupa / Tukar Kata Laluan?"</strong> dan klik butang <strong>"Reset ke Asal"</strong>. Kata laluan akan kembali kepada <code>password123</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                <p className="font-bold text-navy-900">3. Bolehkah nama pegawai penyelaras ditukar jika berlaku pertukaran jawatan?</p>
                <p className="text-gray-600">
                  Ya! Nama dan alamat e-mel boleh disunting terus pada kad peranan di halaman Log Masuk atau melalui menu <strong>Pengurusan Pengguna</strong> oleh Super Admin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500">
            Sistem Arkib Produk Inovasi ePembelajaran (SAPIe) • Politeknik Banting Selangor
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      label: 'Dashboard Utama',
      to: '/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'timbalan_pengarah', 'pegawai_jabatan', 'pegawai_pbs', 'pegawai_maro', 'pegawai_jpp', 'pegawai_jkm', 'pegawai_jmsk', 'pegawai_jpa', 'pensyarah', 'pengurusan'],
    },
    {
      label: 'Arkib Produk',
      to: '/arkib-produk',
      icon: Archive,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'timbalan_pengarah', 'pegawai_jabatan', 'pegawai_pbs', 'pegawai_maro', 'pegawai_jpp', 'pegawai_jkm', 'pegawai_jmsk', 'pegawai_jpa', 'pensyarah', 'pengurusan'],
    },
    {
      label: 'Pendaftaran Produk',
      to: '/pendaftaran-produk',
      icon: FilePlus,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'pegawai_jabatan', 'pegawai_pbs', 'pegawai_maro', 'pegawai_jpp', 'pegawai_jkm', 'pegawai_jmsk', 'pegawai_jpa', 'pensyarah'],
    },
    {
      label: 'Pencapaian & Anugerah',
      to: '/pencapaian',
      icon: Trophy,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'timbalan_pengarah', 'pegawai_jabatan', 'pegawai_pbs', 'pegawai_maro', 'pegawai_jpp', 'pegawai_jkm', 'pegawai_jmsk', 'pegawai_jpa', 'pensyarah', 'pengurusan'],
    },
    {
      label: 'Pengurusan Laporan',
      to: '/laporan',
      icon: FileText,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'timbalan_pengarah', 'pegawai_jabatan', 'pegawai_pbs', 'pegawai_maro', 'pegawai_jpp', 'pegawai_jkm', 'pegawai_jmsk', 'pegawai_jpa', 'pengurusan'],
    },
    {
      label: 'Dokumen Arkib',
      to: '/dokumen',
      icon: FolderArchive,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'timbalan_pengarah', 'pegawai_jabatan', 'pegawai_pbs', 'pegawai_maro', 'pegawai_jpp', 'pegawai_jkm', 'pegawai_jmsk', 'pegawai_jpa', 'pensyarah', 'pengurusan'],
    },
    {
      label: 'Analitik & Statistik',
      to: '/analitik',
      icon: BarChart3,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'timbalan_pengarah', 'pegawai_jabatan', 'pegawai_pbs', 'pegawai_maro', 'pengurusan'],
    },
    {
      label: 'Pengurusan Pengguna',
      to: '/pengguna',
      icon: Users,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm'],
    },
    {
      label: 'Tetapan Sistem',
      to: '/tetapan',
      icon: Settings,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm'],
    },
    {
      label: 'Log Aktiviti',
      to: '/audit-log',
      icon: History,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'timbalan_pengarah'],
    },
    {
      label: 'Profil Saya',
      to: '/profil',
      icon: UserCircle,
      roles: ['super_admin', 'admin', 'pentadbir_uepm', 'ketua_unit_uepm', 'timbalan_pengarah', 'pegawai_jabatan', 'pegawai_pbs', 'pegawai_maro', 'pegawai_jpp', 'pegawai_jkm', 'pegawai_jmsk', 'pegawai_jpa', 'pensyarah', 'pengurusan'],
    },
  ];

  const filteredItems = navigationItems.filter(item =>
    !role || item.roles.includes(role)
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

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

        {/* User Card */}
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

        {/* Footer / Panduan Pengguna & Logout */}
        <div className="p-3 border-t border-navy-700/80 shrink-0 space-y-1">
          <button
            onClick={() => setShowGuideModal(true)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-300 hover:bg-navy-700/70 hover:text-amber-200 transition-colors',
              collapsed && 'justify-center px-2'
            )}
            title="Buku Panduan Pengguna"
          >
            <BookOpen className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Panduan Pengguna</span>}
          </button>

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

      <UserGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
    </>
  );
};
