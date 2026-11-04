import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  PlusCircle,
  Trophy,
  FolderArchive,
  ExternalLink,
  ChevronRight,
  Eye,
  Calendar,
  Building2,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';
import { dbService } from '../../services/storage/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RegistrationStatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateMs } from '../../utils/dateFormatter';
import { canRegisterProduct } from '../../utils/permissionHelper';
import { exportProductsToExcel, exportProductsToPDF, exportProductsToCSV } from '../../services/export/exportServices';
import { RegistrationStatus } from '../../types/product';

export const ProductArchivePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('dept') || 'SEMUA');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'SEMUA');
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get('year') || 'SEMUA');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const settings = dbService.getSystemSettings();
  const departments = settings.departments || [];
  const categories = settings.categories || [];

  // Fetch filtered products
  const products = useMemo(() => {
    return dbService.getProducts({
      searchQuery: searchQuery || undefined,
      departmentId: selectedDept === 'SEMUA' ? undefined : selectedDept,
      categoryId: selectedCategory === 'SEMUA' ? undefined : selectedCategory,
      status: selectedStatus === 'SEMUA' ? undefined : (selectedStatus as RegistrationStatus),
      year: selectedYear === 'SEMUA' ? undefined : parseInt(selectedYear),
    });
  }, [searchQuery, selectedDept, selectedCategory, selectedStatus, selectedYear]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('SEMUA');
    setSelectedCategory('SEMUA');
    setSelectedStatus('SEMUA');
    setSelectedYear('SEMUA');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Pagination slice
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

  // Export handlers
  const handleExportExcel = () => {
    exportProductsToExcel(products, {
      title: 'Laporan Arkib Produk Inovasi ePembelajaran',
      generatedByName: user?.fullName || 'Pengguna',
      generatedDate: new Date().toISOString(),
      departmentFilter: selectedDept,
      yearFilter: selectedYear,
    });
  };

  const handleExportPDF = () => {
    exportProductsToPDF(products, {
      title: 'Laporan Arkib Produk Inovasi ePembelajaran',
      generatedByName: user?.fullName || 'Pengguna',
      generatedDate: new Date().toISOString(),
      departmentFilter: selectedDept,
      yearFilter: selectedYear,
    });
  };

  const handleExportCSV = () => {
    exportProductsToCSV(products);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Arkib Produk Inovasi ePembelajaran"
        subtitle="Repositori digital berpusat bagi semua rekod inovasi pembelajaran Politeknik Banting Selangor"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Arkib Produk' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Eksport Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              icon={<FileDown className="w-3.5 h-3.5 text-rose-600" />}
            >
              PDF
            </Button>
            {canRegisterProduct(user) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/pendaftaran-produk/baharu')}
                icon={<PlusCircle className="w-4 h-4" />}
              >
                Daftar Produk
              </Button>
            )}
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="p-4 space-y-3">
          {/* Top Row: Search and View Mode */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari mengikut tajuk, kod arkib, pensyarah, atau kursus..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-base pl-9 text-xs py-2"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg border transition-colors ${
                  viewMode === 'card'
                    ? 'bg-navy-800 text-white border-navy-800'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                title="Paparan Kad"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg border transition-colors ${
                  viewMode === 'table'
                    ? 'bg-navy-800 text-white border-navy-800'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                title="Paparan Jadual"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Jabatan
              </label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-base text-xs py-1.5"
              >
                <option value="SEMUA">Semua Jabatan</option>
                {departments.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-base text-xs py-1.5"
              >
                <option value="SEMUA">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-base text-xs py-1.5"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="Diluluskan">Diluluskan</option>
                <option value="Dihantar untuk Semakan">Dihantar untuk Semakan</option>
                <option value="Dalam Semakan">Dalam Semakan</option>
                <option value="Memerlukan Pembetulan">Memerlukan Pembetulan</option>
                <option value="Ditolak">Ditolak</option>
                <option value="Draf">Draf</option>
              </select>
            </div>

            <div className="flex items-end gap-1.5">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Tahun
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-base text-xs py-1.5"
                >
                  <option value="SEMUA">Semua Tahun</option>
{Array.from({ length: 2050 - 2018 + 1 }, (_, i) => 2050 - i).map((yr) => (
  <option key={yr} value={yr}>{yr}</option>
))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="shrink-0 h-9"
                title="Set Semula Semua Penapis"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <p>
          Menunjukkan <strong>{paginatedProducts.length}</strong> daripada <strong>{products.length}</strong> rekod produk inovasi
        </p>
      </div>

      {/* Main Content Area */}
      {products.length === 0 ? (
        <EmptyState
          title="Tiada Produk Ditemui"
          description="Tiada rekod produk inovasi yang sepadan dengan kriteria carian atau penapis anda."
          actionText="Set Semula Penapis"
          onAction={handleResetFilters}
        />
      ) : viewMode === 'card' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {paginatedProducts.map((p) => (
            <Card
              key={p.productId}
              hoverable
              onClick={() => navigate(`/arkib-produk/${p.productId}`)}
              className="flex flex-col h-full group"
            >
              {/* Thumbnail Container */}
              <div className="h-36 bg-navy-900 relative overflow-hidden shrink-0">
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-navy-300 p-4 text-center">
                    <Building2 className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-[11px] font-mono opacity-60 font-semibold">{p.departmentName || p.departmentId}</span>
                  </div>
                )}
                {/* Archive Code Badge overlay */}
                <div className="absolute top-2.5 left-2.5 bg-navy-950/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                  {p.archiveCode}
                </div>
                {/* Status Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <RegistrationStatusBadge status={p.registrationStatus} />
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
                    <span className="font-semibold text-navy-800">{p.departmentId}</span>
                    <span>•</span>
                    <span className="truncate">{p.categoryName || p.categoryId}</span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-navy-700 transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 mt-1.5">
                    {p.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                  <div className="text-[11px] text-gray-600 truncate">
                    <strong>Pencipta:</strong> {p.primaryCreatorName}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold text-amber-700" title="Pencapaian Disahkan">
                        <Trophy className="w-3 h-3" />
                        {p.achievementsCount || 0}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700" title="Dokumen Sokongan">
                        <FolderArchive className="w-3 h-3" />
                        {p.documentsCount || 0}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-gray-400">
                      Thn {p.developmentYear}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy-800 text-white font-semibold border-b border-navy-700">
                  <th className="py-3 px-4">Kod Arkib</th>
                  <th className="py-3 px-4">Tajuk Produk</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Pencipta Utama</th>
                  <th className="py-3 px-4 text-center">Tahun</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Pencapaian</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((p) => (
                  <tr
                    key={p.productId}
                    className="hover:bg-navy-50/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/arkib-produk/${p.productId}`)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-navy-800 whitespace-nowrap">
                      {p.archiveCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 max-w-xs truncate">
                      {p.title}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {p.departmentId}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[140px] truncate">
                      {p.categoryName || p.categoryId}
                    </td>
                    <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                      {p.primaryCreatorName}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500 whitespace-nowrap">
                      {p.developmentYear}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <RegistrationStatusBadge status={p.registrationStatus} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-semibold text-amber-700">
                      {p.achievementsCount || 0}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/arkib-produk/${p.productId}`);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Sebelumnya
          </Button>

          <span className="text-xs text-gray-600">
            Halaman <strong>{currentPage}</strong> daripada <strong>{totalPages}</strong>
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Seterusnya
          </Button>
        </div>
      )}
    </div>
  );
};
