import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  Clock,
  Hammer,
  Trophy,
  FolderArchive,
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Filter,
  RefreshCw,
  PlusCircle,
  FileCheck2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { dbService } from '../../services/storage/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge, RegistrationStatusBadge, AchievementStatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateMs, formatRelativeTimeMs } from '../../utils/dateFormatter';
import { canApproveProduct, canRegisterProduct } from '../../utils/permissionHelper';

const CHART_COLORS = ['#163A5F', '#245B8F', '#3977B9', '#627D98', '#21865B', '#B7791F', '#8C52FF', '#00A896'];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dashboard Filters
  const [selectedYear, setSelectedYear] = useState<number | 'SEMUA'>('SEMUA');
  const [selectedDept, setSelectedDept] = useState<string>('SEMUA');

  const settings = dbService.getSystemSettings();
  const departments = settings.departments || [];

  // Compute metrics with filters
  const stats = useMemo(() => {
    return dbService.getDashboardStats({
      year: selectedYear === 'SEMUA' ? undefined : selectedYear,
      departmentId: selectedDept === 'SEMUA' ? undefined : selectedDept,
    });
  }, [selectedYear, selectedDept]);

  // Products for charts
  const allProducts = useMemo(() => {
    return dbService.getProducts({
      year: selectedYear === 'SEMUA' ? undefined : selectedYear,
      departmentId: selectedDept === 'SEMUA' ? undefined : selectedDept,
    });
  }, [selectedYear, selectedDept]);

  // Achievements for charts
  const allAchievements = useMemo(() => {
    return dbService.getAchievements({
      year: selectedYear === 'SEMUA' ? undefined : selectedYear,
      departmentId: selectedDept === 'SEMUA' ? undefined : selectedDept,
    });
  }, [selectedYear, selectedDept]);

  // Recent audit logs
  const recentLogs = useMemo(() => {
    return dbService.getAuditLogs().slice(0, 7);
  }, []);

  // Actionable items
  const pendingApprovals = useMemo(() => {
    return dbService.getProducts({ status: 'Dihantar untuk Semakan' });
  }, []);

  const returnedCorrections = useMemo(() => {
    return dbService.getProducts({ status: 'Memerlukan Pembetulan' });
  }, []);

  const pendingAchievements = useMemo(() => {
    return dbService.getAchievements({ status: 'Dalam Semakan' });
  }, []);

  // Chart Data: Registrations by Department
  const deptChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    departments.forEach(d => { counts[d.code] = 0; });
    allProducts.forEach(p => {
      counts[p.departmentId] = (counts[p.departmentId] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [allProducts, departments]);

  // Chart Data: Status Distribution
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach(p => {
      counts[p.registrationStatus] = (counts[p.registrationStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allProducts]);

  // Chart Data: Achievements by Recognition Level
  const levelChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    allAchievements.filter(a => a.verificationStatus === 'Disahkan').forEach(a => {
      counts[a.recognitionLevel] = (counts[a.recognitionLevel] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [allAchievements]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Dashboard Utama SAPIe
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Arkib Digital Produk Inovasi ePembelajaran Politeknik Banting Selangor
          </p>
        </div>

        {/* Global Dashboard Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'SEMUA' ? 'SEMUA' : parseInt(e.target.value))}
              className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="SEMUA">Semua Tahun</option>
{Array.from({ length: 2050 - 2018 + 1 }, (_, i) => 2050 - i).map((yr) => (
  <option key={yr} value={yr}>Tahun {yr}</option>
))}

            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="SEMUA">Semua Jabatan</option>
              {departments.map(d => (
                <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>

          {canRegisterProduct(user) && (
            <Button
              onClick={() => navigate('/pendaftaran-produk/baharu')}
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Daftar Produk
            </Button>
          )}
        </div>
      </div>

      {/* 8 Primary Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <Card
          hoverable
          onClick={() => navigate('/arkib-produk')}
          className="border-l-4 border-l-navy-800"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Produk Berdaftar</p>
              <h3 className="text-2xl font-black text-navy-900 mt-1">{stats.totalProducts}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Keseluruhan pendaftaran</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Card 2: Approved Products */}
        <Card
          hoverable
          onClick={() => navigate('/arkib-produk?status=Diluluskan')}
          className="border-l-4 border-l-emerald-600"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Produk Diluluskan</p>
              <h3 className="text-2xl font-black text-emerald-800 mt-1">{stats.approvedProducts}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Rasmi dalam arkib</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Card 3: In Review */}
        <Card
          hoverable
          onClick={() => navigate('/pendaftaran-produk?status=Dalam Semakan')}
          className="border-l-4 border-l-amber-500"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dalam Semakan</p>
              <h3 className="text-2xl font-black text-amber-800 mt-1">{stats.inReviewProducts}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">Menunggu kelulusan</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Card 4: In Development */}
        <Card
          hoverable
          onClick={() => navigate('/arkib-produk')}
          className="border-l-4 border-l-blue-600"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dalam Pembangunan</p>
              <h3 className="text-2xl font-black text-blue-800 mt-1">{stats.inDevelopmentProducts}</h3>
              <p className="text-[11px] text-blue-600 mt-0.5">Prototaip & ujian</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Card 5: Achievements (Verified vs distinct) */}
        <Card
          hoverable
          onClick={() => navigate('/pencapaian')}
          className="border-l-4 border-l-amber-600"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Pencapaian</p>
              <h3 className="text-2xl font-black text-amber-900 mt-1">{stats.totalAchievements}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {stats.distinctProductsWithAchievements} produk beranugerah
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Card 6: Archive Documents */}
        <Card
          hoverable
          onClick={() => navigate('/dokumen')}
          className="border-l-4 border-l-slate-700"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dokumen Arkib</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.totalDocuments}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Manual, laporan & sijil</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <FolderArchive className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Card 7: Departments Involved */}
        <Card
          hoverable
          onClick={() => navigate('/arkib-produk')}
          className="border-l-4 border-l-navy-600"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jabatan Terlibat</p>
              <h3 className="text-2xl font-black text-navy-800 mt-1">{stats.distinctDepartments}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">JKM, JPP, JMSK, JPA</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Card 8: Product Creators */}
        <Card
          hoverable
          onClick={() => navigate('/pengguna')}
          className="border-l-4 border-l-purple-600"
        >
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bil. Pencipta Produk</p>
              <h3 className="text-2xl font-black text-purple-900 mt-1">{stats.distinctCreators}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Pensyarah berdaftar</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Actionable Tasks (Tindakan Diperlukan) */}
      {(pendingApprovals.length > 0 || returnedCorrections.length > 0 || pendingAchievements.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <h3 className="text-sm font-bold text-amber-900">
              Tindakan Diperlukan ({pendingApprovals.length + returnedCorrections.length + pendingAchievements.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingApprovals.length > 0 && (
              <div
                onClick={() => navigate('/arkib-produk?status=Dihantar untuk Semakan')}
                className="p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800">Pendaftaran Baru Menunggu Kelulusan</span>
                  <Badge variant="warning">{pendingApprovals.length}</Badge>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Perlu disemak oleh Pentadbir UePM</p>
              </div>
            )}

            {returnedCorrections.length > 0 && (
              <div
                onClick={() => navigate('/pendaftaran-produk?status=Memerlukan Pembetulan')}
                className="p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800">Produk Memerlukan Pembetulan</span>
                  <Badge variant="danger">{returnedCorrections.length}</Badge>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Menunggu kemas kini daripada pencipta</p>
              </div>
            )}

            {pendingAchievements.length > 0 && (
              <div
                onClick={() => navigate('/pencapaian?status=Dalam Semakan')}
                className="p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800">Pencapaian Menunggu Pengesahan</span>
                  <Badge variant="info">{pendingAchievements.length}</Badge>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Sijil & bukti menanti semakan rasmi</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Produk Mengikut Jabatan */}
        <Card>
          <CardHeader
            title="Taburan Produk Inovasi Mengikut Jabatan"
            subtitle="Bilangan produk berdaftar merentasi jabatan akademik PBS"
          />
          <CardBody>
            {deptChartData.some(d => d.count > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: number) => [`${val} Produk`, 'Jumlah']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#163A5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="Tiada Rekod Produk"
                description="Tiada data produk inovasi bagi tahun atau jabatan yang dipilih."
              />
            )}
          </CardBody>
        </Card>

        {/* Chart B: Status Pendaftaran Produk */}
        <Card>
          <CardHeader
            title="Pecahan Status Pendaftaran Produk"
            subtitle="Nisbah status aliran kerja dalam sistem arkib"
          />
          <CardBody>
            {statusChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} Produk`, 'Jumlah']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="Tiada Data Status"
                description="Daftar produk inovasi baharu untuk melihat pecahan status aliran kerja."
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Bottom Section: Recent Activity & Latest Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card>
          <CardHeader
            title="Produk Inovasi Terkini"
            subtitle="Pendaftaran produk paling akhir dalam sistem SAPIe"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/arkib-produk')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Semua Arkib
              </Button>
            }
          />
          <CardBody className="p-0">
            {allProducts.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Arkib Masih Kosong"
                  description="Belum ada produk inovasi yang didaftarkan. Gunakan butang di atas untuk menambah data atau mengisi data sintetik ujian."
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {allProducts.slice(0, 5).map((p) => (
                  <div
                    key={p.productId}
                    onClick={() => navigate(`/arkib-produk/${p.productId}`)}
                    className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-navy-800">{p.archiveCode}</span>
                        <RegistrationStatusBadge status={p.registrationStatus} />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 truncate mt-1">{p.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.departmentName || p.departmentId} • {p.primaryCreatorName} • Thn {p.developmentYear}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[11px] font-medium text-gray-400">
                        {formatDateMs(p.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Audit Activities */}
        <Card>
          <CardHeader
            title="Log Aktiviti Terkini (Audit Trail)"
            subtitle="Rekod tindakan dan transaksi rasmi pengguna"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/audit-log')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Semua Log
              </Button>
            }
          />
          <CardBody className="p-0">
            {recentLogs.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Tiada Log Aktiviti"
                  description="Aktiviti pendaftaran, kelulusan dan muat naik akan direkodkan di sini secara automatik."
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentLogs.map((log) => (
                  <div key={log.auditId} className="p-3.5 text-xs flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {log.actorName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900">{log.actorName}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatRelativeTimeMs(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
