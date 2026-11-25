import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, Link2, HardDrive } from 'lucide-react';
import { documentUploadSchema, DocumentUploadFormData } from '../../schemas/documentSchema';
import { dbService } from '../../services/storage/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { validateUploadedFile, formatFileSize } from '../../utils/fileValidator';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productTitle?: string;
  onSuccess: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  productId: defaultProductId,
  productTitle: defaultProductTitle,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const settings = dbService.getSystemSettings();
  const allowedExtensions = settings.allowedFileTypes || ['.pdf', '.docx', '.xlsx', '.pptx', '.jpg', '.png'];
  const maxFileSizeMB = settings.maxFileSizeMB || 25;
  const availableProducts = dbService.getProducts();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      productId: defaultProductId || '',
      title: '',
      category: 'Pembangunan Produk',
      description: '',
      reportingYear: new Date().getFullYear(),
      accessClassification: 'Dalaman',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const result = validateUploadedFile(file, maxFileSizeMB, allowedExtensions);
      if (!result.valid) {
        setValidationError(result.error || 'Fail tidak sah.');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const onSubmit = async (data: DocumentUploadFormData) => {
    if (!user) return;

    if (uploadMode === 'file' && !selectedFile) {
      setValidationError('Sila pilih fail dari komputer untuk dimuat naik.');
      return;
    }

    if (uploadMode === 'link' && !externalUrl.trim()) {
      setValidationError('Sila masukkan pautan URL dokumen (contoh: Google Drive / OneDrive).');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      let fileToUpload: File;

      if (uploadMode === 'file' && selectedFile) {
        fileToUpload = selectedFile;
      } else {
        // Cipta objek File maya untuk pautan Cloud
        const safeName = (data.title || 'Dokumen_Cloud').replace(/[^a-zA-Z0-9_-]/g, '_') + ' (Pautan Cloud)';
        fileToUpload = new File([externalUrl.trim()], safeName, { type: 'text/uri-list' });
      }

      const createdDoc = dbService.uploadDocument(
        {
          ...data,
          productId: data.productId || defaultProductId || '',
          accessClassification: data.accessClassification as any,
          category: data.category as any,
          verificationStatus: 'Disahkan',
          uploadedBy: user.uid,
          uploadedByName: user.fullName,
        },
        fileToUpload,
        user
      );

      // Jika mod pautan Cloud, simpan URL sebenar ke dalam rekod dokumen
      if (uploadMode === 'link' && createdDoc && createdDoc.documentId) {
        try {
          const rawDocs = localStorage.getItem('sapie_documents_v1');
          if (rawDocs) {
            const parsedDocs = JSON.parse(rawDocs);
            const updatedDocs = parsedDocs.map((d: any) =>
              d.documentId === createdDoc.documentId
                ? { ...d, fileUrl: externalUrl.trim(), originalFilename: 'Pautan Storan Awan (Google Drive / Cloud)' }
                : d
            );
            localStorage.setItem('sapie_documents_v1', JSON.stringify(updatedDocs));
          }
        } catch (e) {
          console.error('Update link url error:', e);
        }
      }

      reset();
      setSelectedFile(null);
      setExternalUrl('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Ralat semasa memuat naik dokumen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Muat Naik Dokumen Arkib"
      subtitle={defaultProductTitle ? `Produk: ${defaultProductTitle}` : 'Tambah fail laporan, manual atau pautan storan awan ke dalam arkib'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {validationError && <Alert type="danger">{validationError}</Alert>}

        {!defaultProductId && (
          <div>
            <label className="label-base">
              Produk Berkaitan <span className="text-rose-500">*</span>
            </label>
            <select className="input-base" {...register('productId')}>
              <option value="">-- Pilih Produk Inovasi --</option>
              {availableProducts.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.archiveCode} - {p.title}
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-xs text-rose-600 mt-1">{errors.productId.message}</p>}
          </div>
        )}

        <div>
          <label className="label-base">
            Tajuk Dokumen <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Kertas Cadangan & Manual Pengguna Modul AR"
            className="input-base"
            {...register('title')}
          />
          {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label-base">
              Kategori Dokumen <span className="text-rose-500">*</span>
            </label>
            <select className="input-base" {...register('category')}>
              <option value="Pendaftaran">Pendaftaran</option>
              <option value="Pembangunan Produk">Pembangunan Produk</option>
              <option value="Laporan Penggunaan">Laporan Penggunaan</option>
              <option value="Laporan Tahunan">Laporan Tahunan</option>
              <option value="Pencapaian dan Sijil">Pencapaian dan Sijil</option>
              <option value="Penilaian dan Impak">Penilaian dan Impak</option>
              <option value="Dokumentasi Media">Dokumentasi Media</option>
              <option value="Manual Pengguna">Manual Pengguna</option>
              <option value="Dokumen Pentadbiran">Dokumen Pentadbiran</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="label-base">
              Klasifikasi Akses <span className="text-rose-500">*</span>
            </label>
            <select className="input-base" {...register('accessClassification')}>
              <option value="Awam">Awam (Boleh diakses semua)</option>
              <option value="Dalaman">Dalaman (Staf PBS sahaja)</option>
              <option value="Terhad">Terhad (Jabatan sahaja)</option>
              <option value="Sulit">Sulit (Pemilik & Pentadbir)</option>
            </select>
          </div>

          <div>
            <label className="label-base">Tahun Laporan (2018 - 2050)</label>
            <input
              type="number"
              min={2018}
              max={2050}
              className="input-base"
              {...register('reportingYear', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Pilihan Kaedah Muat Naik */}
        <div>
          <label className="label-base">
            Kaedah Simpanan Dokumen <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => {
                setUploadMode('file');
                setValidationError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                uploadMode === 'file'
                  ? 'bg-navy-800 text-white border-navy-800 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Fail Komputer (Maks {maxFileSizeMB} MB)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadMode('link');
                setValidationError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                uploadMode === 'link'
                  ? 'bg-navy-800 text-white border-navy-800 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Pautan Google Drive / Cloud (Tanpa Had Saiz)</span>
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-navy-500 transition-colors bg-gray-50/50">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <div className="text-xs text-gray-600">
                <label className="font-semibold text-navy-800 hover:text-navy-900 cursor-pointer underline">
                  <span>Pilih fail dari komputer</span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept={allowedExtensions.join(',')}
                  />
                </label>
                <p className="text-[11px] text-gray-500 mt-1">
                  Format dibenarkan: {allowedExtensions.join(', ')} (Maksimum {maxFileSizeMB} MB setiap fail)
                </p>
              </div>
              {selectedFile && (
                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>
                    <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
              <label className="text-xs font-semibold text-navy-900 block">
                Pautan URL Google Drive / OneDrive / SharePoint / YouTube
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="input-base text-xs bg-white"
              />
              <p className="text-[11px] text-blue-800">
                💡 Sesuai untuk fail bersaiz besar (melebihi {maxFileSizeMB} MB seperti video PdP penuh, fail ZIP SCORM atau folder dokumentasi). Tiada had kapasiti saiz!
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="label-base">Penerangan / Catatan Dokumen (Pilihan)</label>
          <textarea
            rows={2}
            placeholder="Catatan mengenai kandungan fail..."
            className="input-base"
            {...register('description')}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting} icon={<Upload className="w-4 h-4" />}>
            Simpan Dokumen Arkib
          </Button>
        </div>
      </form>
    </Modal>
  );
};
