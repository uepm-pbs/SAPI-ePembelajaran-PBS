import { z } from 'zod';

export const productMemberSchema = z.object({
  membershipId: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  displayName: z.string().min(2, { message: 'Nama ahli pasukan sekurang-kurangnya 2 aksara' }),
  roleInProject: z.string().min(2, { message: 'Sila nyatakan peranan ahli dalam projek' }),
  email: z.string().email({ message: 'E-mel tidak sah' }).optional().or(z.literal('')),
  staffId: z.string().optional().or(z.literal('')),
  institution: z.string().optional().or(z.literal('')),
  contributionDescription: z.string().optional().or(z.literal('')),
});

export const productRegistrationSchema = z.object({
  // Bahagian A: Maklumat Asas (Had aksara telah dilonggarkan)
  title: z.string().min(3, { message: 'Tajuk produk inovasi sekurang-kurangnya 3 aksara' }),
  summary: z.string().min(5, { message: 'Ringkasan produk sekurang-kurangnya 5 aksara' }).max(500, { message: 'Ringkasan tidak boleh melebihi 500 aksara' }),
  description: z.string().min(5, { message: 'Penerangan lengkap produk sekurang-kurangnya 5 aksara' }),
  objectives: z.string().min(5, { message: 'Objektif pembangunan sekurang-kurangnya 5 aksara' }),
  problemStatement: z.string().min(5, { message: 'Pernyataan masalah pembelajaran sekurang-kurangnya 5 aksara' }),
  thumbnailUrl: z.string().optional().or(z.literal('')),

  // Bahagian B: Maklumat Akademik
  departmentId: z.string().min(1, { message: 'Sila pilih jabatan yang berkaitan' }),
  program: z.string().min(2, { message: 'Sila nyatakan program pengajian (cth: DKM, DAD, dll.)' }),
  courseCode: z.string().optional().or(z.literal('')),
  courseName: z.string().min(2, { message: 'Sila nyatakan nama kursus berkaitan' }),
  semester: z.string().optional().or(z.literal('')),
  targetAudience: z.string().min(2, { message: 'Sila nyatakan sasaran pengguna' }),
  pedagogicalMethod: z.string().min(3, { message: 'Sila nyatakan kaedah penggunaan dalam PdP (min 3 aksara)' }),

  // Bahagian C: Kategori & Teknologi
  categoryId: z.string().min(1, { message: 'Sila pilih kategori utama produk' }),
  tags: z.array(z.string()).default([]),
  technologies: z.array(z.string()).min(1, { message: 'Sila pilih sekurang-kurangnya satu teknologi yang digunakan' }),

  // Bahagian D: Maklumat Pencipta Utama & Pasukan
  primaryCreatorName: z.string().min(2, { message: 'Nama pencipta utama diperlukan (min 2 aksara)' }),
  primaryCreatorEmail: z.string().email({ message: 'E-mel rasmi pencipta utama tidak sah' }),
  primaryCreatorStaffId: z.string().optional().or(z.literal('')),
  teamMembers: z.array(productMemberSchema).default([]),

  // Bahagian E: Maklumat Pembangunan
  developmentYear: z.number().int().min(2018, { message: 'Tahun pembangunan mestilah antara 2018 hingga 2050' }).max(2050),
  registrationYear: z.number().int().default(() => new Date().getFullYear()),
  startDate: z.string().optional().or(z.literal('')),
  completionDate: z.string().optional().or(z.literal('')),
  developmentStatus: z.enum([
    'Perancangan',
    'Dalam Pembangunan',
    'Pengujian & Penilaian',
    'Sedia Digunakan',
    'Selesai & Diarkibkan',
  ]),
  version: z.string().min(1, { message: 'Sila nyatakan versi (cth: 1.0, 2.0)' }).default('1.0'),
  productUrl: z.string().optional().or(z.literal('')),
  demoUrl: z.string().optional().or(z.literal('')),
  implementationNotes: z.string().optional().or(z.literal('')),
});

export type ProductRegistrationFormData = z.infer<typeof productRegistrationSchema>;
