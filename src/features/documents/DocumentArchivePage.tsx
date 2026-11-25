import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Download,
  Search,
  FileText,
  Lock,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { dbService } from '../../services/storage/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateMs } from '../../utils/dateFormatter';
import { formatFileSize } from '../../utils/fileValidator';
import { canViewDocument } from '../../utils/permissionHelper';
import { DocumentUploadModal } from './DocumentUploadModal';

const YEAR_OPTIONS = Array.from({ length: 2050 - 2018 + 1 }, (_, i) => 2018 + i);

export const DocumentArchivePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [selectedYear, setSelectedYear] = useState<string>('SEMUA');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const settings = dbService.getSystemSettings();
  const docCategories = settings.documentCategories || [];

  const documents = useMemo(() => {
    let list = dbService.getDocuments({
      category: selectedCategory === 'SEMUA' ? undefined : selectedCategory,
      year: selectedYear === 'SEMUA' ? undefined : parseInt(selectedYear),
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.originalFilename.toLowerCase().includes(q) ||
          (d.productArchiveCode && d.productArchiveCode.toLowerCase().includes(q)) ||
          (d.productTitle && d.productTitle.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, selectedYear, searchQuery, reloadKey]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumen Arkib Digital"
        subtitle="Repositori fail rasmi, manual pengguna, laporan penilaian dan sijil produk inovasi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Dokumen Arkib' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            icon={<Upload className="w-4 h-4" />}
          >
            Muat Naik Dokumen
          </Button>
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
                placeholder="Cari mengikut tajuk dokumen, nama fail, atau kod produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-9 text-xs py-2"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-base text-xs py-1.5 w-auto"
              >
                <option value="SEMUA">Semua Kategori</option>
                {docCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="input-base text-xs py-1.5 w-auto"
              >
                <option value="SEMUA">Semua Tahun (2018 - 2050)</option>
                {YEAR_OPTIONS.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {yr}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('SEMUA');
                  setSelectedYear('SEMUA');
                }}
                title="Set Semula"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Documents List */}
      <Card>
        <CardBody className="p-0">
          {documents.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Tiada Dokumen Ditemui"
                description="Tiada fail arkib yang memenuhi penapis anda."
                actionText="Muat Naik Dokumen"
                onAction={() => setShowUploadModal(true)}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => {
                const canAccess = canViewDocument(user, doc);
                const isCloudLink = doc.fileUrl && (doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://'));
                return (
                  <div
                    key={doc.documentId}
                    className="p-4 hover:bg-gray-50/70 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-gray-900">{doc.title}</h4>
                          <Badge variant="primary" size="sm">{doc.category}</Badge>
                          <Badge
                            variant={
                              doc.accessClassification === 'Awam'
                                ? 'success'
                                : doc.accessClassification === 'Dalaman'
                                ? 'info'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {doc.accessClassification}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500">
                          {doc.originalFilename} {isCloudLink ? '' : `• ${formatFileSize(doc.fileSize)}`} • Tahun {doc.reportingYear}
                        </p>

                        {doc.productTitle && (
                          <p className="text-xs text-navy-800">
                            <strong>Produk:</strong>{' '}
                            <span
                              onClick={() => navigate(`/arkib-produk/${doc.productId}`)}
                              className="hover:underline font-medium cursor-pointer"
                            >
                              {doc.productArchiveCode} - {doc.productTitle}
                            </span>
                          </p>
                        )}

                        <p className="text-[11px] text-gray-400">
                          Dimuat naik oleh {doc.uploadedByName} pada {formatDateMs(doc.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {canAccess ? (
                        <a
                          href={doc.fileUrl}
                          download={isCloudLink ? undefined : doc.originalFilename}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary text-xs py-1.5"
                        >
                          {isCloudLink ? (
                            <>
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka Pautan Cloud</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Muat Turun Fail</span>
                            </>
                          )}
                        </a>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Akses Terhad Jabatan</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => setReloadKey((prev) => prev + 1)}
      />
    </div>
  );
};
