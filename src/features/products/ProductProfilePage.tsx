import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  FolderArchive,
  FileText,
  Users,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  ExternalLink,
  Plus,
  Upload,
  Download,
  BookOpen,
  GraduationCap,
  Layers,
  Link2,
} from 'lucide-react';
import { dbService } from '../../services/storage/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Tabs, TabItem } from '../../components/common/Tabs';
import { Button } from '../../components/common/Button';
import { Badge, RegistrationStatusBadge, AchievementStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateMs, formatDateTimeMs } from '../../utils/dateFormatter';
import { formatFileSize } from '../../utils/fileValidator';
import {
  canApproveProduct,
  canEditProduct,
  canSubmitAchievement,
  canUploadDocument,
  canViewDocument,
} from '../../utils/permissionHelper';
import { AchievementFormModal } from '../achievements/AchievementFormModal';
import { DocumentUploadModal } from '../documents/DocumentUploadModal';

// Pastikan URL mempunyai http:// atau https:// supaya boleh dibuka dengan betul
const normalizeExternalUrl = (rawUrl?: string): string | null => {
  if (!rawUrl || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const ProductProfilePage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('ringkasan');
  const [product, setProduct] = useState(() => (productId ? dbService.getProductById(productId) : null));

  // Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Form Inputs in Modals
  const [adminNotes, setAdminNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Reload product data
  const reloadData = () => {
    if (productId) {
      setProduct(dbService.getProductById(productId));
    }
  };

  if (!product) {
    return (
      <div className="py-12">
        <EmptyState
          title="Produk Tidak Dijumpai"
          description="Rekod produk inovasi ini mungkin telah dialihkan atau tidak wujud dalam arkib."
          actionText="Kembali ke Arkib"
          onAction={() => navigate('/arkib-produk')}
        />
      </div>
    );
  }

  // Linked items
  const achievements = dbService.getAchievements({ productId: product.productId });
  const documents = dbService.getDocuments({ productId: product.productId });
  const auditLogs = dbService.getAuditLogs({ entityType: 'Product' }).filter(l => l.entityId === product.productId);

  // Permissions (Benarkan juga Pentadbir & Pemilik sunting pautan walaupun telah diluluskan)
  const userCanApprove = canApproveProduct(user) && product.registrationStatus !== 'Diluluskan';
  const userCanEdit =
    canEditProduct(user, product) ||
    canApproveProduct(user) ||
    (user && user.uid === product.createdBy);
  const userCanAddAchievement = canSubmitAchievement(user, product);
  const userCanAddDoc = canUploadDocument(user, product);

  // Kesan semua pautan yang mungkin telah dimasukkan oleh pengguna (Product URL, Demo URL, atau Thumbnail URL)
  const primaryProductLink =
    normalizeExternalUrl(product.productUrl) ||
    normalizeExternalUrl(product.demoUrl) ||
    normalizeExternalUrl(product.thumbnailUrl);

  // Handle Approve
  const handleApprove = () => {
    if (!user) return;
    try {
      dbService.approveProduct(product.productId, user, adminNotes);
      setShowApproveModal(false);
      setAdminNotes('');
      reloadData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  // Handle Correction
  const handleCorrection = () => {
    if (!user) return;
    if (!adminNotes.trim()) {
      setActionError('Sila nyatakan catatan pembetulan yang diperlukan.');
      return;
    }
    try {
      dbService.returnForCorrection(product.productId, adminNotes, user);
      setShowCorrectionModal(false);
      setAdminNotes('');
      reloadData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  // Handle Reject
  const handleReject = () => {
    if (!user) return;
    if (!adminNotes.trim()) {
      setActionError('Sila nyatakan sebab rasmi penolakan rekod.');
      return;
    }
    try {
      dbService.rejectProduct(product.productId, adminNotes, user);
      setShowRejectModal(false);
      setAdminNotes('');
      reloadData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  // 7 Tabs
  const profileTabs: TabItem[] = [
    { id: 'ringkasan', label: '1. Ringkasan', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'maklumat', label: '2. Maklumat Produk', icon: <Layers className="w-4 h-4" /> },
    { id: 'pasukan', label: '3. Pencipta & Pasukan', count: 1 + (product.teamMembers?.length || 0), icon: <Users className="w-4 h-4" /> },
    { id: 'pencapaian', label: '4. Pencapaian', count: achievements.length, icon: <Trophy className="w-4 h-4" /> },
    { id: 'laporan', label: '5. Laporan', icon: <FileText className="w-4 h-4" /> },
    { id: 'dokumen', label: '6. Dokumen Sokongan', count: documents.length, icon: <FolderArchive className="w-4 h-4" /> },
    { id: 'sejarah', label: '7. Sejarah Perubahan', count: auditLogs.length, icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title={product.title}
        subtitle={`${product.archiveCode} • ${product.departmentName || product.departmentId} • Versi ${product.version}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Arkib Produk', href: '/arkib-produk' },
          { label: product.archiveCode },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {userCanEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/pendaftaran-produk/${product.productId}/edit`)}
                icon={<Edit className="w-3.5 h-3.5" />}
              >
                Kemaskini Rekod / Pautan
              </Button>
            )}

            {userCanApprove && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setShowApproveModal(true)}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Luluskan Pendaftaran
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCorrectionModal(true)}
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                >
                  Minta Pembetulan
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowRejectModal(true)}
                  icon={<XCircle className="w-3.5 h-3.5" />}
                >
                  Tolak
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Top Notification for Corrections or Rejections */}
      {product.registrationStatus === 'Memerlukan Pembetulan' && product.correctionNotes && (
        <Alert type="warning" title="Perhatian: Produk Ini Memerlukan Pembetulan">
          <p className="font-medium text-amber-950">Catatan Pentadbir UePM:</p>
          <p className="mt-0.5">{product.correctionNotes}</p>
        </Alert>
      )}

      {product.registrationStatus === 'Ditolak' && product.rejectionReason && (
        <Alert type="danger" title="Pendaftaran Produk Ditolak">
          <p className="font-medium text-rose-950">Alasan Rasmi:</p>
          <p className="mt-0.5">{product.rejectionReason}</p>
        </Alert>
      )}

      {/* Profile Summary Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-navy-900 text-white p-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-amber-400 text-xl shrink-0">
                PBS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm tracking-wider font-extrabold text-amber-400">
                    {product.archiveCode}
                  </span>
                  <RegistrationStatusBadge status={product.registrationStatus} />
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{product.title}</h2>
                <p className="text-xs text-navy-200 mt-0.5">
                  Pencipta: <strong className="text-white">{product.primaryCreatorName}</strong> ({product.primaryCreatorEmail})
                </p>
              </div>
            </div>

            {primaryProductLink ? (
              <a
                href={primaryProductLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold shrink-0 shadow-md transition-all"
              >
                <span>Buka Pautan Produk / e-Book</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              userCanEdit && (
                <button
                  type="button"
                  onClick={() => navigate(`/pendaftaran-produk/${product.productId}/edit`)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs bg-navy-800 hover:bg-navy-700 text-amber-300 border border-navy-600 font-semibold shrink-0 transition-all"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>+ Tambah Pautan Produk / e-Book</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 bg-white border-b border-gray-200">
          <Tabs
            tabs={profileTabs}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
          />
        </div>
      </Card>

      {/* Tab 1: Ringkasan */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Kotak Pautan Akses Pantas Produk Digital */}
            <Card>
              <CardHeader
                title="Pautan Akses Produk Digital / e-Book / Bahan Inovasi"
                action={
                  userCanEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/pendaftaran-produk/${product.productId}/edit`)}
                      icon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Kemas Kini Pautan
                    </Button>
                  )
                }
              />
              <CardBody className="space-y-2.5 text-xs">
                {primaryProductLink ? (
                  <div className="space-y-2">
                    {product.productUrl && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="font-bold text-amber-950 block">Pautan Produk Digital:</span>
                          <span className="text-amber-800 truncate block">{product.productUrl}</span>
                        </div>
                        <a
                          href={normalizeExternalUrl(product.productUrl) || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white font-semibold shrink-0"
                        >
                          <span>Buka Pautan</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {product.demoUrl && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="font-bold text-blue-950 block">Pautan Demo / Video / Repositori:</span>
                          <span className="text-blue-800 truncate block">{product.demoUrl}</span>
                        </div>
                        <a
                          href={normalizeExternalUrl(product.demoUrl) || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white font-semibold shrink-0"
                        >
                          <span>Buka Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {product.thumbnailUrl && !product.productUrl && !product.demoUrl && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="font-bold text-emerald-950 block">Pautan Bahan / Produk:</span>
                          <span className="text-emerald-800 truncate block">{product.thumbnailUrl}</span>
                        </div>
                        <a
                          href={normalizeExternalUrl(product.thumbnailUrl) || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white font-semibold shrink-0"
                        >
                          <span>Buka Bahan</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-gray-600 flex items-center justify-between gap-3">
                    <span>
                      Tiada pautan URL produk digital dimasukkan lagi. Klik <strong>Kemas Kini Pautan</strong> (Bahagian E) untuk menambah pautan e-Book atau produk anda.
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Ringkasan Eksekutif" />
              <CardBody>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.summary}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Penerangan Lengkap & Kaedah Inovasi" />
              <CardBody className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Penerangan Produk:</h4>
                  <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1">Objektif Pembangunan:</h4>
                  <p className="whitespace-pre-line leading-relaxed">{product.objectives}</p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1">Pernyataan Masalah Pembelajaran:</h4>
                  <p className="whitespace-pre-line leading-relaxed">{product.problemStatement}</p>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Maklumat Pantas" />
              <CardBody className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Jabatan:</span>
                  <span className="font-semibold text-gray-900">{product.departmentName || product.departmentId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Program:</span>
                  <span className="font-medium text-gray-800">{product.program}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Kursus:</span>
                  <span className="font-medium text-gray-800">
                    {product.courseCode ? `${product.courseCode} - ` : ''}{product.courseName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Kategori:</span>
                  <span className="font-medium text-gray-800">{product.categoryName || product.categoryId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Tahun Pembangunan:</span>
                  <span className="font-medium text-gray-800">{product.developmentYear}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Status Pembangunan:</span>
                  <span className="font-medium text-gray-800">{product.developmentStatus}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Tarikh Pendaftaran:</span>
                  <span className="font-medium text-gray-800">{formatDateMs(product.createdAt)}</span>
                </div>
                {product.approvedAt && (
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">Tarikh Kelulusan Arkib:</span>
                    <span className="font-medium text-emerald-800">
                      {formatDateMs(product.approvedAt)} ({product.approvedByName || 'UePM'})
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>

            {product.technologies && product.technologies.length > 0 && (
              <Card>
                <CardHeader title="Teknologi Digunakan" />
                <CardBody>
                  <div className="flex flex-wrap gap-1.5">
                    {product.technologies.map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Maklumat Produk */}
      {activeTab === 'maklumat' && (
        <Card>
          <CardHeader title="Perincian Akademik & Kaedah Pedagogi" />
          <CardBody className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-navy-800" />
                  Konteks Kurikulum & Sesi PdP
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <p><strong>Jabatan:</strong> {product.departmentName || product.departmentId}</p>
                  <p><strong>Program:</strong> {product.program}</p>
                  <p><strong>Nama Kursus:</strong> {product.courseName}</p>
                  <p><strong>Kod Kursus:</strong> {product.courseCode || '-'}</p>
                  <p><strong>Semester:</strong> {product.semester || '-'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-navy-800" />
                  Kaedah Penggunaan & Sasaran
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <p><strong>Sasaran Pengguna:</strong> {product.targetAudience}</p>
                  <p><strong>Kaedah PdP:</strong> {product.pedagogicalMethod}</p>
                  <p><strong>Status Pembangunan:</strong> {product.developmentStatus}</p>
                  <p><strong>Versi:</strong> {product.version}</p>
                </div>
              </div>
            </div>

            {product.productUrl && (
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs">
                <strong>Pautan Produk Digital:</strong>{' '}
                <a href={normalizeExternalUrl(product.productUrl) || '#'} target="_blank" rel="noreferrer" className="text-navy-700 underline font-medium">
                  {product.productUrl}
                </a>
              </div>
            )}

            {product.demoUrl && (
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs">
                <strong>Pautan Demo / Repositori:</strong>{' '}
                <a href={normalizeExternalUrl(product.demoUrl) || '#'} target="_blank" rel="noreferrer" className="text-navy-700 underline font-medium">
                  {product.demoUrl}
                </a>
              </div>
            )}

            {product.implementationNotes && (
              <div className="pt-2">
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">
                  Nota Pelaksanaan & Pengalaman Pengguna:
                </h4>
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {product.implementationNotes}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Tab 3: Pencipta dan Pasukan */}
      {activeTab === 'pasukan' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Pencipta Utama (Ketua Inovasi)" />
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-lg">
                  {product.primaryCreatorName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">{product.primaryCreatorName}</h4>
                  <p className="text-xs text-gray-500">{product.primaryCreatorEmail}</p>
                  {product.primaryCreatorStaffId && (
                    <p className="text-xs font-mono text-navy-800 mt-0.5">No. Staf: {product.primaryCreatorStaffId}</p>
                  )}
                  <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Pemilik Produk (Primary Creator)
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={`Ahli Pasukan Pembangun (${product.teamMembers?.length || 0})`}
              subtitle="Rakan pembangun, staf sokongan teknikal dan pelajar yang menyumbang"
            />
            <CardBody>
              {(!product.teamMembers || product.teamMembers.length === 0) ? (
                <EmptyState
                  title="Tiada Ahli Pasukan Tambahan"
                  description="Produk ini didaftarkan di bawah pencipta utama secara individu."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.teamMembers.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold shrink-0">
                        {m.displayName.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 text-sm">{m.displayName}</h5>
                        <p className="text-xs font-medium text-navy-700">{m.roleInProject}</p>
                        {m.email && <p className="text-xs text-gray-500 mt-0.5">{m.email}</p>}
                        {m.institution && <p className="text-[11px] text-gray-400 mt-0.5">{m.institution}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 4: Pencapaian */}
      {activeTab === 'pencapaian' && (
        <Card>
          <CardHeader
            title="Rekod Pencapaian & Pengiktirafan"
            subtitle="Anugerah, pingat pertandingan inovasi, penerbitan, dan pengiktirafan rasmi"
            action={
              userCanAddAchievement && (
                <Button
                  size="sm"
                  onClick={() => setShowAchievementModal(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Daftar Pencapaian
                </Button>
              )
            }
          />
          <CardBody>
            {achievements.length === 0 ? (
              <EmptyState
                title="Belum Ada Pencapaian Didaftarkan"
                description="Produk inovasi ini belum mempunyai rekod anugerah atau sijil pengiktirafan rasmi."
                actionText={userCanAddAchievement ? 'Daftar Pencapaian Baharu' : undefined}
                onAction={userCanAddAchievement ? () => setShowAchievementModal(true) : undefined}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {achievements.map((ach) => (
                  <div key={ach.achievementId} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{ach.title}</span>
                        <AchievementStatusBadge status={ach.verificationStatus} />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Program / Pertandingan:</strong> {ach.eventName} ({ach.organizer})
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>Peringkat: <strong>{ach.recognitionLevel}</strong></span>
                        <span>•</span>
                        <span>Keputusan: <strong>{ach.resultType}</strong></span>
                        <span>•</span>
                        <span>Tarikh: {formatDateMs(ach.achievementDate)}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {ach.referenceUrl && (
                        <a
                          href={normalizeExternalUrl(ach.referenceUrl) || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary text-xs py-1"
                        >
                          <span>Rujukan Rasmi</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Tab 5: Laporan */}
      {activeTab === 'laporan' && (
        <Card>
          <CardHeader title="Pengurusan Laporan Penggunaan & Penilaian Impak" />
          <CardBody className="space-y-4">
            <p className="text-xs text-gray-600">
              Dokumen laporan pembangunan, laporan amali PdP, dan bukti impak pembelajaran bagi produk ini:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <h5 className="font-bold text-gray-900 text-xs uppercase mb-1">Status Penilaian PdP</h5>
                <p className="text-xs text-gray-600">
                  {product.developmentStatus === 'Sedia Digunakan'
                    ? 'Telah disahkan untuk kegagalan sifar dalam sesi amali.'
                    : 'Masih dalam fasa pengumpulan maklum balas pelajar.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <h5 className="font-bold text-gray-900 text-xs uppercase mb-1">Bilangan Dokumen Berkaitan</h5>
                <p className="text-2xl font-bold text-navy-900">{documents.length}</p>
                <p className="text-[11px] text-gray-500">Fail arkib digital</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <h5 className="font-bold text-gray-900 text-xs uppercase mb-1">Kelengkapan Profil</h5>
                <Badge variant={product.summary && product.description && product.objectives ? 'success' : 'warning'}>
                  {product.summary && product.description && product.objectives ? 'Lengkap' : 'Perlu Maklumat Tambahan'}
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab 6: Dokumen Sokongan */}
      {activeTab === 'dokumen' && (
        <Card>
          <CardHeader
            title={`Dokumen Arkib & Fail Sokongan (${documents.length})`}
            subtitle="Kertas konsep, manual pengguna, sijil pengiktirafan, dan laporan impak"
            action={
              userCanAddDoc && (
                <Button
                  size="sm"
                  onClick={() => setShowDocumentModal(true)}
                  icon={<Upload className="w-3.5 h-3.5" />}
                >
                  Muat Naik Dokumen
                </Button>
              )
            }
          />
          <CardBody>
            {documents.length === 0 ? (
              <EmptyState
                title="Tiada Dokumen Dimuat Naik"
                description="Muat naik fail sokongan seperti manual pengguna, kertas konsep, atau sijil dalam format PDF, DOCX, atau pautan Google Drive."
                actionText={userCanAddDoc ? 'Muat Naik Dokumen Pertama' : undefined}
                onAction={userCanAddDoc ? () => setShowDocumentModal(true) : undefined}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {documents.map((doc) => {
                  const hasAccess = canViewDocument(user, doc);
                  const isCloudLink = doc.fileUrl && (doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://'));
                  return (
                    <div key={doc.documentId} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-gray-900 text-sm">{doc.title}</h5>
                            <Badge variant="secondary" size="sm">{doc.category}</Badge>
                            <Badge variant={doc.accessClassification === 'Awam' ? 'success' : 'warning'} size="sm">
                              {doc.accessClassification}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {doc.originalFilename} {isCloudLink ? '' : `• ${formatFileSize(doc.fileSize)}`} • Dimuat naik oleh {doc.uploadedByName} pada {formatDateMs(doc.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {hasAccess ? (
                          <a
                            href={doc.fileUrl}
                            download={isCloudLink ? undefined : doc.originalFilename}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary text-xs py-1"
                          >
                            {isCloudLink ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                            <span>{isCloudLink ? 'Buka Pautan' : 'Muat Turun'}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Akses Terhad</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Tab 7: Sejarah Perubahan */}
      {activeTab === 'sejarah' && (
        <Card>
          <CardHeader
            title="Sejarah Perubahan & Aliran Kelulusan"
            subtitle="Jejak audit dan rekod perubahan status pendaftaran produk inovasi"
          />
          <CardBody>
            {auditLogs.length === 0 ? (
              <EmptyState
                title="Tiada Rekod Perubahan"
                description="Perubahan status produk akan direkodkan secara kronologi di sini."
              />
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-100">
                {auditLogs.map((log) => (
                  <div key={log.auditId} className="relative flex items-start gap-3">
                    <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-navy-800 border-2 border-white shadow-xs" />
                    <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 flex-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900">{log.action}</span>
                        <span className="text-gray-400 text-[10px]">{formatDateTimeMs(log.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{log.details}</p>
                      <p className="text-[11px] text-gray-500 mt-1">Oleh: <strong>{log.actorName}</strong> ({log.actorRole})</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Luluskan Pendaftaran Produk Inovasi"
        subtitle={`Kod Arkib: ${product.archiveCode}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Batal</Button>
            <Button variant="success" onClick={handleApprove}>Sahkan Kelulusan</Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-gray-700">
          <p>
            Adakah anda pasti ingin meluluskan produk inovasi ini? Rekod akan diarkibkan secara rasmi di bawah kod <strong>{product.archiveCode}</strong> dan dipaparkan dalam arkib terbuka Politeknik Banting Selangor.
          </p>
          <div>
            <label className="label-base">Catatan Kelulusan (Pilihan):</label>
            <textarea
              rows={3}
              placeholder="Contoh: Memenuhi standard penilaian inovasi ePembelajaran UePM..."
              className="input-base"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Correction Modal */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Minta Pembetulan Rekod Produk"
        subtitle={`Kod Arkib: ${product.archiveCode}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCorrectionModal(false)}>Batal</Button>
            <Button variant="warning" onClick={handleCorrection}>Hantar Maklum Balas</Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-gray-700">
          {actionError && <Alert type="danger">{actionError}</Alert>}
          <p>
            Rekod pendaftaran akan dikembalikan kepada <strong>{product.primaryCreatorName}</strong> untuk penambahbaikan sebelum dinilai semula.
          </p>
          <div>
            <label className="label-base">Catatan Pembetulan Diperlukan <span className="text-rose-500">*</span>:</label>
            <textarea
              rows={3}
              placeholder="Contoh: Sila kemas kini objektif PdP dan muat naik bukti penggunaan awal..."
              className="input-base"
              value={adminNotes}
              onChange={(e) => {
                setAdminNotes(e.target.value);
                setActionError(null);
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Tolak Pendaftaran Produk"
        subtitle={`Kod Arkib: ${product.archiveCode}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Batal</Button>
            <Button variant="danger" onClick={handleReject}>Sahkan Penolakan</Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-gray-700">
          {actionError && <Alert type="danger">{actionError}</Alert>}
          <p className="text-rose-800 font-medium">
            Perhatian: Menolak pendaftaran ini akan menghentikan proses kelulusan. Sila nyatakan alasan rasmi.
          </p>
          <div>
            <label className="label-base">Alasan Rasmi Penolakan <span className="text-rose-500">*</span>:</label>
            <textarea
              rows={3}
              placeholder="Sila nyatakan kriteria yang tidak dipenuhi..."
              className="input-base"
              value={adminNotes}
              onChange={(e) => {
                setAdminNotes(e.target.value);
                setActionError(null);
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Achievement Submission Modal */}
      <AchievementFormModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        productId={product.productId}
        productTitle={product.title}
        onSuccess={reloadData}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        productId={product.productId}
        productTitle={product.title}
        onSuccess={reloadData}
      />
    </div>
  );
};
