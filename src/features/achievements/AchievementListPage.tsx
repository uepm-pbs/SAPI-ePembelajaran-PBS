import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  PlusCircle,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  FileSpreadsheet,
  FileDown,
  RotateCcw,
  Search,
} from 'lucide-react';
import { dbService } from '../../services/storage/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, AchievementStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateMs } from '../../utils/dateFormatter';
import { canVerifyAchievement } from '../../utils/permissionHelper';
import { exportAchievementsToExcel, exportAchievementsToPDF } from '../../services/export/exportServices';
import { AchievementFormModal } from './AchievementFormModal';
import { Achievement, AchievementVerificationStatus } from '../../types/achievement';

export const AchievementListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [selectedLevel, setSelectedLevel] = useState<string>('SEMUA');
  const [selectedYear, setSelectedYear] = useState<string>('SEMUA');

  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyingAchievement, setVerifyingAchievement] = useState<Achievement | null>(null);
  const [verifyStatusChoice, setVerifyStatusChoice] = useState<'Disahkan' | 'Memerlukan Pembetulan' | 'Ditolak'>('Disahkan');
  const [adminNotes, setAdminNotes] = useState('');

  const [reloadKey, setReloadKey] = useState(0);

  // Fetch achievements
  const achievements = useMemo(() => {
    let list = dbService.getAchievements({
      status: selectedStatus === 'SEMUA' ? undefined : (selectedStatus as AchievementVerificationStatus),
      recognitionLevel: selectedLevel === 'SEMUA' ? undefined : selectedLevel,
      year: selectedYear === 'SEMUA' ? undefined : parseInt(selectedYear),
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.eventName.toLowerCase().includes(q) ||
          (a.productArchiveCode && a.productArchiveCode.toLowerCase().includes(q)) ||
          (a.productTitle && a.productTitle.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedStatus, selectedLevel, selectedYear, searchQuery, reloadKey]);

  const userCanVerify = canVerifyAchievement(user);

  const handleVerifySubmit = () => {
    if (!user || !verifyingAchievement) return;
    dbService.verifyAchievement(
      verifyingAchievement.achievementId,
      verifyStatusChoice,
      adminNotes,
      user
    );
    setVerifyingAchievement(null);
    setAdminNotes('');
    setReloadKey((prev) => prev + 1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('SEMUA');
    setSelectedLevel('SEMUA');
    setSelectedYear('SEMUA');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pencapaian dan Pengiktirafan"
        subtitle="Pengurusan anugerah, pingat inovasi dan pengesahan sijil pencapaian institusi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Pencapaian' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAchievementsToExcel(achievements)}
              icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportAchievementsToPDF(achievements, {
                  title: 'Laporan Pencapaian dan Pengiktirafan Produk Inovasi',
                  generatedByName: user?.fullName || 'Pengguna',
                  generatedDate: new Date().toISOString(),
                  yearFilter: selectedYear,
                })
              }
              icon={<FileDown className="w-3.5 h-3.5 text-rose-600" />}
            >
              PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Daftar Pencapaian
            </Button>
          </div>
        }
      />

      {/* Filters Bar */}
      <Card>
        <CardBody className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari mengikut tajuk pencapaian, pertandingan, atau kod produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-9 text-xs py-2"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-base text-xs py-1.5 w-auto"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="Disahkan">Disahkan</option>
                <option value="Dalam Semakan">Dalam Semakan</option>
                <option value="Memerlukan Pembetulan">Memerlukan Pembetulan</option>
                <option value="Ditolak">Ditolak</option>
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="input-base text-xs py-1.5 w-auto"
              >
                <option value="SEMUA">Semua Peringkat</option>
                <option value="Institusi">Institusi</option>
                <option value="Zon / Wilayah">Zon / Wilayah</option>
                <option value="Negeri">Negeri</option>
                <option value="Kebangsaan">Kebangsaan</option>
                <option value="Antarabangsa">Antarabangsa</option>
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="input-base text-xs py-1.5 w-auto"
              >
                <option value="SEMUA">Semua Tahun</option>
{Array.from({ length: 2050 - 2018 + 1 }, (_, i) => 2050 - i).map((yr) => (
  <option key={yr} value={yr}>{yr}</option>
))}
              </select>

              <Button variant="outline" size="sm" onClick={handleResetFilters} title="Set Semula">
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      <Card>
        <CardBody className="p-0">
          {achievements.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Tiada Rekod Pencapaian"
                description="Tiada maklumat anugerah ditemui bagi penapis yang dipilih."
                actionText="Daftar Pencapaian Baharu"
                onAction={() => setShowAddModal(true)}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {achievements.map((ach) => (
                <div
                  key={ach.achievementId}
                  className="p-4 hover:bg-gray-50/70 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{ach.title}</span>
                      <AchievementStatusBadge status={ach.verificationStatus} />
                      <Badge variant="primary" size="sm">{ach.recognitionLevel}</Badge>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                        {ach.resultType}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600">
                      <strong>Program:</strong> {ach.eventName} ({ach.organizer}) • Tarikh: {formatDateMs(ach.achievementDate)}
                    </p>

                    {ach.productTitle && (
                      <p className="text-xs text-navy-800">
                        <strong>Produk Berkaitan:</strong>{' '}
                        <span
                          onClick={() => navigate(`/arkib-produk/${ach.productId}`)}
                          className="hover:underline font-medium cursor-pointer"
                        >
                          {ach.productArchiveCode} - {ach.productTitle}
                        </span>
                      </p>
                    )}

                    <p className="text-xs text-gray-500">{ach.description}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {ach.referenceUrl && (
                      <a
                        href={ach.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs py-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Pautan</span>
                      </a>
                    )}

                    {userCanVerify && ach.verificationStatus !== 'Disahkan' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setVerifyingAchievement(ach);
                          setVerifyStatusChoice('Disahkan');
                          setAdminNotes('');
                        }}
                      >
                        Sahkan Pencapaian
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Modal */}
      <AchievementFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />

      {/* Verification Modal for Admins */}
      {verifyingAchievement && (
        <Modal
          isOpen={Boolean(verifyingAchievement)}
          onClose={() => setVerifyingAchievement(null)}
          title="Pengesahan Rekod Pencapaian Rasmi"
          subtitle={verifyingAchievement.title}
          footer={
            <>
              <Button variant="outline" onClick={() => setVerifyingAchievement(null)}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleVerifySubmit}>
                Simpan Keputusan
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs text-gray-700">
            <p>
              Sila semak dokumen bukti/sijil pertandingan sebelum mengesahkan pencapaian bagi produk{' '}
              <strong>{verifyingAchievement.productArchiveCode}</strong>.
            </p>

            <div>
              <label className="label-base">Keputusan Status Pengesahan:</label>
              <select
                className="input-base"
                value={verifyStatusChoice}
                onChange={(e) => setVerifyStatusChoice(e.target.value as any)}
              >
                <option value="Disahkan">Disahkan (Sah untuk Laporan Rasmi)</option>
                <option value="Memerlukan Pembetulan">Memerlukan Pembetulan (Kembalikan ke Pencipta)</option>
                <option value="Ditolak">Ditolak (Tidak Layak)</option>
              </select>
            </div>

            <div>
              <label className="label-base">Catatan Pentadbir UePM:</label>
              <textarea
                rows={3}
                placeholder="Catatan pengesahan atau maklum balas penambahbaikan..."
                className="input-base"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
