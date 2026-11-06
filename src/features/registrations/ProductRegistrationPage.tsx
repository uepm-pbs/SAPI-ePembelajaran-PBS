import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Save,
  Send,
  Plus,
  Trash2,
  FileCheck,
  Building,
  GraduationCap,
  Layers,
  Users,
  Calendar,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/storage/databaseService';
import { productRegistrationSchema, ProductRegistrationFormData } from '../../schemas/productSchema';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export const ProductRegistrationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId?: string }>();

  const isEditMode = Boolean(productId);
  const settings = dbService.getSystemSettings();
  const departments = settings.departments || [];
  const categories = settings.categories || [];
  const availableTechnologies = settings.technologies || [];

  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductRegistrationFormData>({
    resolver: zodResolver(productRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      objectives: '',
      problemStatement: '',
      thumbnailUrl: '',
      departmentId: user?.departmentId && user.departmentId !== 'SEMUA' ? user.departmentId : '',
      program: '',
      courseCode: '',
      courseName: '',
      semester: 'Semester 1',
      targetAudience: 'Pelajar Politeknik Banting Selangor',
      pedagogicalMethod: '',
      categoryId: '',
      tags: [],
      technologies: ['Canva'],
      primaryCreatorName: user?.fullName || '',
      primaryCreatorEmail: user?.email || '',
      primaryCreatorStaffId: user?.staffId || '',
      teamMembers: [],
      developmentYear: new Date().getFullYear(),
      registrationYear: new Date().getFullYear(),
      developmentStatus: 'Dalam Pembangunan',
      version: '1.0',
      productUrl: '',
      demoUrl: '',
      implementationNotes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'teamMembers',
  });

  // Load existing data if edit mode
  useEffect(() => {
    if (productId) {
      const existing = dbService.getProductById(productId);
      if (existing) {
        setValue('title', existing.title);
        setValue('summary', existing.summary);
        setValue('description', existing.description);
        setValue('objectives', existing.objectives);
        setValue('problemStatement', existing.problemStatement);
        setValue('thumbnailUrl', existing.thumbnailUrl || '');
        setValue('departmentId', existing.departmentId);
        setValue('program', existing.program);
        setValue('courseCode', existing.courseCode || '');
        setValue('courseName', existing.courseName);
        setValue('semester', existing.semester || '');
        setValue('targetAudience', existing.targetAudience);
        setValue('pedagogicalMethod', existing.pedagogicalMethod);
        setValue('categoryId', existing.categoryId);
        setValue('tags', existing.tags || []);
        setValue('technologies', existing.technologies || []);
        setValue('primaryCreatorName', existing.primaryCreatorName);
        setValue('primaryCreatorEmail', existing.primaryCreatorEmail);
        setValue('primaryCreatorStaffId', existing.primaryCreatorStaffId || '');
        setValue('teamMembers', existing.teamMembers || []);
        setValue('developmentYear', existing.developmentYear);
        setValue('registrationYear', existing.registrationYear);
        setValue('developmentStatus', existing.developmentStatus);
        setValue('version', existing.version);
        setValue('productUrl', existing.productUrl || '');
        setValue('demoUrl', existing.demoUrl || '');
        setValue('implementationNotes', existing.implementationNotes || '');
      }
    }
  }, [productId, setValue]);

  // Watch fields for live character count & duplicate detection
  const watchedTitle = watch('title') || '';
  const watchedSummary = watch('summary') || '';
  const watchedDescription = watch('description') || '';
  const watchedObjectives = watch('objectives') || '';
  const watchedProblemStatement = watch('problemStatement') || '';
  const watchedProgram = watch('program') || '';
  const watchedCourseName = watch('courseName') || '';
  const watchedTargetAudience = watch('targetAudience') || '';
  const watchedPedagogicalMethod = watch('pedagogicalMethod') || '';

  useEffect(() => {
    if (watchedTitle && watchedTitle.length > 5) {
      const dup = dbService.checkPotentialDuplicate(watchedTitle, productId);
      if (dup) {
        setDuplicateWarning(
          `Perhatian: Produk dengan tajuk serupa (${dup.archiveCode} - "${dup.title}") telah wujud dalam arkib.`
        );
      } else {
        setDuplicateWarning(null);
      }
    }
  }, [watchedTitle, productId]);

  const watchedTechnologies = watch('technologies') || [];
  const handleToggleTech = (tech: string) => {
    const current = [...watchedTechnologies];
    const idx = current.indexOf(tech);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(tech);
    }
    setValue('technologies', current, { shouldValidate: true });
  };

  // Navigate to the first section that has validation errors
  const handleValidationErrors = (formErrors: FieldErrors<ProductRegistrationFormData>) => {
    const sectionA = ['title', 'summary', 'description', 'objectives', 'problemStatement', 'thumbnailUrl'];
    const sectionB = ['departmentId', 'program', 'courseCode', 'courseName', 'semester', 'targetAudience', 'pedagogicalMethod'];
    const sectionC = ['categoryId', 'technologies', 'tags'];
    const sectionD = ['primaryCreatorName', 'primaryCreatorEmail', 'primaryCreatorStaffId', 'teamMembers'];
    const sectionE = ['developmentYear', 'developmentStatus', 'version', 'productUrl', 'demoUrl'];

    const errorKeys = Object.keys(formErrors);
    if (errorKeys.some((k) => sectionA.includes(k))) {
      setActiveSection('A');
      setServerError('Sila lengkapkan ruangan bertanda (*) di Bahagian A: Maklumat Asas.');
    } else if (errorKeys.some((k) => sectionB.includes(k))) {
      setActiveSection('B');
      setServerError('Sila lengkapkan ruangan bertanda (*) di Bahagian B: Maklumat Akademik.');
    } else if (errorKeys.some((k) => sectionC.includes(k))) {
      setActiveSection('C');
      setServerError('Sila pilih Kategori dan Teknologi di Bahagian C.');
    } else if (errorKeys.some((k) => sectionD.includes(k))) {
      setActiveSection('D');
      setServerError('Sila semak maklumat Pencipta & Pasukan di Bahagian D.');
    } else if (errorKeys.some((k) => sectionE.includes(k))) {
      setActiveSection('E');
      setServerError('Sila semak maklumat Pembangunan di Bahagian E.');
    } else {
      setServerError('Terdapat maklumat wajib yang belum lengkap. Sila semak semula borang.');
    }
  };

  const onSubmitForm = async (data: ProductRegistrationFormData, isDraft: boolean) => {
    if (!user) return;
    setIsSubmitting(true);
    setServerError(null);

    try {
      if (isEditMode && productId) {
        dbService.updateProduct(
          productId,
          {
            ...data,
            registrationStatus: isDraft ? 'Draf' : 'Dihantar untuk Semakan',
          },
          user,
          isDraft ? 'Mengemas kini draf produk' : 'Menghantar semula produk selepas pembetulan'
        );
        navigate(`/arkib-produk/${productId}`);
      } else {
        const newProd = dbService.createProduct(
          {
            ...data,
            createdBy: user.uid,
            teamMembers: data.teamMembers || [],
            registrationStatus: isDraft ? 'Draf' : 'Dihantar untuk Semakan',
          },
          user,
          isDraft
        );
        navigate(`/arkib-produk/${newProd.productId}`);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setServerError(err.message || 'Ralat berlaku semasa memproses pendaftaran produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCharBadge = (currentLength: number, minLength: number, maxLength?: number) => {
    const isMet = currentLength >= minLength && (!maxLength || currentLength <= maxLength);
    return (
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          isMet
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        {currentLength} {maxLength ? `/ ${maxLength}` : ''} aksara (Min: {minLength})
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={isEditMode ? 'Kemaskini Pendaftaran Produk' : 'Pendaftaran Produk Inovasi Baharu'}
        subtitle="Daftarkan produk inovasi digital pembelajaran bagi Politeknik Banting Selangor"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Arkib Produk', href: '/arkib-produk' },
          { label: isEditMode ? 'Kemaskini' : 'Pendaftaran Baharu' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali
          </Button>
        }
      />

      {/* Info Reminder Banner */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Panduan Pengisian Borang:</span> Ruangan bertanda{' '}
          <span className="text-rose-600 font-bold">*</span> adalah wajib diisi. Anda boleh mengisi dalam{' '}
          <strong>huruf besar atau huruf kecil</strong> mengikut kesesuaian. Pastikan bilangan aksara minimum dipenuhi (lencana bertukar hijau).
        </div>
      </div>

      {serverError && (
        <Alert type="danger" title="Perhatian: Maklumat Belum Lengkap">
          {serverError}
        </Alert>
      )}

      {duplicateWarning && (
        <Alert type="warning" title="Peringatan Kemungkinan Rekod Bertindih">
          {duplicateWarning}
        </Alert>
      )}

      {/* Section Navigation Pills */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'A', label: 'A. Maklumat Asas', icon: Layers },
          { id: 'B', label: 'B. Maklumat Akademik', icon: GraduationCap },
          { id: 'C', label: 'C. Kategori & Teknologi', icon: Building },
          { id: 'D', label: 'D. Pasukan & Pencipta', icon: Users },
          { id: 'E', label: 'E. Pembangunan', icon: Calendar },
          { id: 'F', label: 'F. Ringkasan & Hantar', icon: FileCheck },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-navy-800 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* ======================================================== */}
        {/* SEKSYEN A: MAKLUMAT ASAS PRODUK */}
        {/* ======================================================== */}
        {activeSection === 'A' && (
          <Card>
            <CardHeader
              title="Bahagian A: Maklumat Asas Produk Inovasi"
              subtitle="Maklumat tajuk, objektif, dan latar belakang produk"
            />
            <CardBody className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label-base mb-0">
                    Nama / Tajuk Produk Inovasi <span className="text-rose-500">*</span>
                  </label>
                  {renderCharBadge(watchedTitle.length, 3)}
                </div>
                <input
                  type="text"
                  placeholder="Contoh: Modul Interaktif Matematik Kejuruteraan"
                  className="input-base"
                  {...register('title')}
                />
                {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label-base mb-0">
                    Ringkasan Eksekutif Produk <span className="text-rose-500">*</span>
                  </label>
                  {renderCharBadge(watchedSummary.length, 5, 500)}
                </div>
                <textarea
                  rows={2}
                  placeholder="Ringkasan padat mengenai fungsi utama produk inovasi ini (sekurang-kurangnya 5 aksara)..."
                  className="input-base"
                  {...register('summary')}
                />
                {errors.summary && <p className="text-xs text-rose-600 mt-1">{errors.summary.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label-base mb-0">
                    Penerangan Lengkap Produk <span className="text-rose-500">*</span>
                  </label>
                  {renderCharBadge(watchedDescription.length, 5)}
                </div>
                <textarea
                  rows={4}
                  placeholder="Terangkan bagaimana produk ini dibangunkan dan diguna pakai (sekurang-kurangnya 5 aksara)..."
                  className="input-base"
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-base mb-0">
                      Objektif Pembangunan Produk <span className="text-rose-500">*</span>
                    </label>
                    {renderCharBadge(watchedObjectives.length, 5)}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Nyatakan objektif pembangunan produk ini (sekurang-kurangnya 5 aksara)..."
                    className="input-base"
                    {...register('objectives')}
                  />
                  {errors.objectives && <p className="text-xs text-rose-600 mt-1">{errors.objectives.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-base mb-0">
                      Pernyataan Masalah Pembelajaran <span className="text-rose-500">*</span>
                    </label>
                    {renderCharBadge(watchedProblemStatement.length, 5)}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Apakah isu pembelajaran yang ingin diselesaikan (sekurang-kurangnya 5 aksara)..."
                    className="input-base"
                    {...register('problemStatement')}
                  />
                  {errors.problemStatement && <p className="text-xs text-rose-600 mt-1">{errors.problemStatement.message}</p>}
                </div>
              </div>

              <div>
                <label className="label-base">Pautan Gambar Kulit / Thumbnail (Pilihan - Tidak Wajib)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... atau biarkan kosong"
                  className="input-base"
                  {...register('thumbnailUrl')}
                />
              </div>
            </CardBody>
            <CardFooter>
              <div className="text-xs text-gray-500">Langkah 1 daripada 6</div>
              <Button type="button" onClick={() => setActiveSection('B')}>
                Seterusnya: Maklumat Akademik
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ======================================================== */}
        {/* SEKSYEN B: MAKLUMAT AKADEMIK */}
        {/* ======================================================== */}
        {activeSection === 'B' && (
          <Card>
            <CardHeader
              title="Bahagian B: Maklumat Akademik & Kaedah PdP"
              subtitle="Hubung kait produk inovasi dengan jabatan dan kursus pengajian"
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">
                    Jabatan Terlibat <span className="text-rose-500">*</span>
                  </label>
                  <select className="input-base" {...register('departmentId')}>
                    <option value="">-- Pilih Jabatan --</option>
                    {departments.map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-xs text-rose-600 mt-1">{errors.departmentId.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-base mb-0">
                      Program Pengajian <span className="text-rose-500">*</span>
                    </label>
                    {renderCharBadge(watchedProgram.length, 2)}
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: DKM / Diploma Kejuruteraan Mekanikal"
                    className="input-base"
                    {...register('program')}
                  />
                  {errors.program && <p className="text-xs text-rose-600 mt-1">{errors.program.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-base">Kod Kursus (Pilihan)</label>
                  <input
                    type="text"
                    placeholder="Contoh: DJJ20053"
                    className="input-base"
                    {...register('courseCode')}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-base mb-0">
                      Nama Kursus <span className="text-rose-500">*</span>
                    </label>
                    {renderCharBadge(watchedCourseName.length, 2)}
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Engineering Mathematics"
                    className="input-base"
                    {...register('courseName')}
                  />
                  {errors.courseName && <p className="text-xs text-rose-600 mt-1">{errors.courseName.message}</p>}
                </div>

                <div>
                  <label className="label-base">Semester / Sesi Akademik</label>
                  <select className="input-base" {...register('semester')}>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Merentas Semester">Merentas Semester</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-base mb-0">
                      Sasaran Pengguna <span className="text-rose-500">*</span>
                    </label>
                    {renderCharBadge(watchedTargetAudience.length, 2)}
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Pelajar Semester 2"
                    className="input-base"
                    {...register('targetAudience')}
                  />
                  {errors.targetAudience && <p className="text-xs text-rose-600 mt-1">{errors.targetAudience.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-base mb-0">
                      Kaedah Penggunaan dalam PdP <span className="text-rose-500">*</span>
                    </label>
                    {renderCharBadge(watchedPedagogicalMethod.length, 3)}
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Pembelajaran Teradun / Amali / Kuiz"
                    className="input-base"
                    {...register('pedagogicalMethod')}
                  />
                  {errors.pedagogicalMethod && <p className="text-xs text-rose-600 mt-1">{errors.pedagogicalMethod.message}</p>}
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => setActiveSection('A')}>
                Sebelumnya
              </Button>
              <Button type="button" onClick={() => setActiveSection('C')}>
                Seterusnya: Kategori & Teknologi
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ======================================================== */}
        {/* SEKSYEN C: KATEGORI & TEKNOLOGI */}
        {/* ======================================================== */}
        {activeSection === 'C' && (
          <Card>
            <CardHeader
              title="Bahagian C: Kategori & Teknologi Digital"
              subtitle="Klasifikasi format produk inovasi dan platform perisian yang diaplikasikan"
            />
            <CardBody className="space-y-5">
              <div>
                <label className="label-base">
                  Kategori Utama Produk Inovasi <span className="text-rose-500">*</span> (Wajib pilih satu)
                </label>
                <select className="input-base" {...register('categoryId')}>
                  <option value="">-- Pilih Kategori Utama --</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-rose-600 mt-1">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="label-base">
                  Teknologi & Platform Yang Digunakan <span className="text-rose-500">*</span> (Pilih sekurang-kurangnya 1)
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableTechnologies.map((tech) => {
                    const isSelected = watchedTechnologies.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleToggleTech(tech)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          isSelected
                            ? 'bg-navy-800 text-white border-navy-800 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected && <span className="mr-1">✓</span>}
                        {tech}
                      </button>
                    );
                  })}
                </div>
                {errors.technologies && <p className="text-xs text-rose-600 mt-2">{errors.technologies.message}</p>}
              </div>
            </CardBody>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => setActiveSection('B')}>
                Sebelumnya
              </Button>
              <Button type="button" onClick={() => setActiveSection('D')}>
                Seterusnya: Maklumat Pencipta & Pasukan
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ======================================================== */}
        {/* SEKSYEN D: PENCIPTA & PASUKAN */}
        {/* ======================================================== */}
        {activeSection === 'D' && (
          <Card>
            <CardHeader
              title="Bahagian D: Maklumat Pencipta Utama & Ahli Pasukan"
              subtitle="Penetapan pemilik inovasi dan rakan pembangun"
            />
            <CardBody className="space-y-5">
              <div className="p-4 rounded-xl bg-navy-50/60 border border-navy-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                  Pencipta Utama (Product Owner)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="label-base">
                      Nama Penuh Pencipta Utama <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="input-base"
                      {...register('primaryCreatorName')}
                    />
                    {errors.primaryCreatorName && <p className="text-xs text-rose-600 mt-1">{errors.primaryCreatorName.message}</p>}
                  </div>

                  <div>
                    <label className="label-base">
                      E-mel Institusi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      className="input-base"
                      {...register('primaryCreatorEmail')}
                    />
                    {errors.primaryCreatorEmail && <p className="text-xs text-rose-600 mt-1">{errors.primaryCreatorEmail.message}</p>}
                  </div>

                  <div>
                    <label className="label-base">Nombor Staf (PBS) (Pilihan)</label>
                    <input
                      type="text"
                      placeholder="Contoh: PBS-JMSK-007"
                      className="input-base"
                      {...register('primaryCreatorStaffId')}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Team Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Ahli Pasukan Pembangun ({fields.length})
                    </h4>
                    <p className="text-xs text-gray-500">
                      Pensyarah bersama, staf teknikal atau pelajar yang terlibat dalam pembangunan (jika ada)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        membershipId: `mem-${Date.now()}`,
                        displayName: '',
                        roleInProject: 'Pembangun Bersama',
                        email: '',
                        institution: 'Politeknik Banting Selangor',
                        staffId: '',
                      })
                    }
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Tambah Ahli
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Tiada ahli tambahan didaftarkan. Anda boleh menambah ahli menggunakan butang di atas.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/40 flex flex-col md:flex-row items-center gap-3"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2.5 w-full">
                          <input
                            type="text"
                            placeholder="Nama Ahli Pasukan (min 2 aksara)"
                            className="input-base text-xs"
                            {...register(`teamMembers.${index}.displayName` as const)}
                          />
                          <input
                            type="text"
                            placeholder="Peranan (cth: Pereka / Penilai)"
                            className="input-base text-xs"
                            {...register(`teamMembers.${index}.roleInProject` as const)}
                          />
                          <input
                            type="email"
                            placeholder="E-mel Ahli (Pilihan)"
                            className="input-base text-xs"
                            {...register(`teamMembers.${index}.email` as const)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Padam Ahli"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => setActiveSection('C')}>
                Sebelumnya
              </Button>
              <Button type="button" onClick={() => setActiveSection('E')}>
                Seterusnya: Maklumat Pembangunan
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ======================================================== */}
        {/* SEKSYEN E: MAKLUMAT PEMBANGUNAN */}
        {/* ======================================================== */}
        {activeSection === 'E' && (
          <Card>
            <CardHeader
              title="Bahagian E: Maklumat Pembangunan & Pautan Produk"
              subtitle="Status versi produk, pautan digital, dan garis masa pembangunan"
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-base">
                    Tahun Pembangunan (2018 - 2050) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="input-base"
                    {...register('developmentYear', { valueAsNumber: true })}
                  />
                  {errors.developmentYear && <p className="text-xs text-rose-600 mt-1">{errors.developmentYear.message}</p>}
                </div>

                <div>
                  <label className="label-base">
                    Status Pembangunan <span className="text-rose-500">*</span>
                  </label>
                  <select className="input-base" {...register('developmentStatus')}>
                    <option value="Perancangan">Perancangan</option>
                    <option value="Dalam Pembangunan">Dalam Pembangunan</option>
                    <option value="Pengujian & Penilaian">Pengujian & Penilaian</option>
                    <option value="Sedia Digunakan">Sedia Digunakan</option>
                    <option value="Selesai & Diarkibkan">Selesai & Diarkibkan</option>
                  </select>
                </div>

                <div>
                  <label className="label-base">
                    Versi Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1.0"
                    className="input-base"
                    {...register('version')}
                  />
                  {errors.version && <p className="text-xs text-rose-600 mt-1">{errors.version.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Pautan Produk Digital (Pilihan)</label>
                  <input
                    type="text"
                    placeholder="https://... (boleh dibiarkan kosong)"
                    className="input-base"
                    {...register('productUrl')}
                  />
                  {errors.productUrl && <p className="text-xs text-rose-600 mt-1">{errors.productUrl.message}</p>}
                </div>

                <div>
                  <label className="label-base">Pautan Demo / Video (Pilihan)</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/... (boleh dibiarkan kosong)"
                    className="input-base"
                    {...register('demoUrl')}
                  />
                  {errors.demoUrl && <p className="text-xs text-rose-600 mt-1">{errors.demoUrl.message}</p>}
                </div>
              </div>

              <div>
                <label className="label-base">Catatan Pelaksanaan / Nota Tambahan (Pilihan)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan jika ada..."
                  className="input-base"
                  {...register('implementationNotes')}
                />
              </div>
            </CardBody>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => setActiveSection('D')}>
                Sebelumnya
              </Button>
              <Button type="button" onClick={() => setActiveSection('F')}>
                Seterusnya: Semakan & Hantar
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ======================================================== */}
        {/* SEKSYEN F: RINGKASAN & HANTAR */}
        {/* ======================================================== */}
        {activeSection === 'F' && (
          <Card>
            <CardHeader
              title="Bahagian F: Pengesahan & Penghantaran"
              subtitle="Semak maklumat produk sebelum disimpan sebagai draf atau dihantar untuk semakan rasmi"
            />
            <CardBody className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm mb-2">Ringkasan Pendaftaran Produk</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p><strong>Tajuk:</strong> {watch('title') || '-'}</p>
                  <p><strong>Jabatan:</strong> {watch('departmentId') || '-'}</p>
                  <p><strong>Program:</strong> {watch('program') || '-'}</p>
                  <p><strong>Kursus:</strong> {watch('courseName') || '-'}</p>
                  <p><strong>Kategori:</strong> {watch('categoryId') || '-'}</p>
                  <p><strong>Pencipta Utama:</strong> {watch('primaryCreatorName') || '-'}</p>
                  <p><strong>Tahun:</strong> {watch('developmentYear') || '-'}</p>
                  <p><strong>Status Pembangunan:</strong> {watch('developmentStatus') || '-'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900">
                <p className="font-semibold mb-1">Nota Aliran Kerja:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Simpan Draf:</strong> Rekod disimpan secara berterusan tanpa diserahkan kepada pihak pentadbir arkib. Anda boleh terus menyunting rekod ini pada bila-bila masa.</li>
                  <li><strong>Hantar untuk Semakan:</strong> Rekod diserahkan kepada Pentadbir UePM untuk kelulusan rasmi. Kod arkib institusi (PBS-EP-YYYY-XXXX) akan dijanakan secara kekal.</li>
                </ul>
              </div>
            </CardBody>
            <CardFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveSection('E')}>
                Kembali Sunting
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  loading={isSubmitting}
                  onClick={handleSubmit(
                    (data) => onSubmitForm(data, true),
                    (err) => handleValidationErrors(err)
                  )}
                  icon={<Save className="w-4 h-4" />}
                >
                  Simpan Draf
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  loading={isSubmitting}
                  onClick={handleSubmit(
                    (data) => onSubmitForm(data, false),
                    (err) => handleValidationErrors(err)
                  )}
                  icon={<Send className="w-4 h-4" />}
                >
                  Hantar untuk Semakan
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
};
