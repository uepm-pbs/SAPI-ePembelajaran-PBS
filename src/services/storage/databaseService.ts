import { InnovationProduct, RegistrationStatus } from '../../types/product';
import { Achievement, AchievementVerificationStatus } from '../../types/achievement';
import { ArchiveDocument } from '../../types/document';
import { UserProfile } from '../../types/auth';
import { SystemSettings } from '../../types/settings';
import { AuditLogEntry, AuditAction } from '../../types/audit';
import { AppNotification } from '../../types/notification';
import { INITIAL_DEPARTMENTS, INITIAL_CATEGORIES, INITIAL_SYSTEM_SETTINGS, INITIAL_USERS } from './initialData';
import { formatArchiveCode } from '../../utils/archiveCode';

// URL Rasmi Firebase Realtime Database SAPIe Politeknik Banting Selangor
const FIREBASE_RTDB_URL = 'https://sapie-pbs-default-rtdb.asia-southeast1.firebasedatabase.app';

const STORAGE_KEYS = {
  PRODUCTS: 'sapie_products_v1',
  ACHIEVEMENTS: 'sapie_achievements_v1',
  DOCUMENTS: 'sapie_documents_v1',
  USERS: 'sapie_users_v1',
  SETTINGS: 'sapie_settings_v1',
  AUDIT: 'sapie_audit_logs_v1',
  NOTIFICATIONS: 'sapie_notifications_v1',
  COUNTERS: 'sapie_counters_v1',
};

// 4 Produk Inovasi Rasmi PBS (Sebagai asas kekal supaya sentiasa wujud di semua komputer)
const SEED_OFFICIAL_PRODUCTS: InnovationProduct[] = [
  {
    title: 'Apabila Sains Mengubah Sebuah Empayar: Kehebatan Teknologi Tamadun Uthmaniyyah',
    summary: 'Video AI: Apabila Sains Mengubah Sebuah Empayar: Kehebatan Teknologi Tamadun Uthmaniyyah',
    description:
      'Kejayaan Empayar Uthmaniyyah dalam memanfaatkan sains dan teknologi bagi memperkukuh ketenteraan, pentadbiran, serta kehidupan masyarakat. Daripada penciptaan meriam gergasi sewaktu penaklukan Constantinople hingga kemajuan pesat perubatan, seni bina, dan astronomi, inovasi saintifik menjadi pemacu kebangkitan empayar. Karya ini menyerlahkan bagaimana integrasi ilmu pengetahuan dan strategi teknologi mampu mengubah lanskap sejarah serta membentuk sebuah peradaban dunia yang gemilang.',
    objectives: 'Menghasilkan video AI yang menarik berkenaan sejarah tamadun Islam',
    problemStatement: 'Pelajar kurang didedahkan dengan aspek sejarah.',
    thumbnailUrl: '',
    departmentId: 'JPA',
    program: 'Semua Program',
    courseCode: 'MPU23182',
    courseName: 'SAINS TEKNOLOGI DAN KEJURUTERAAN DALAM ISLAM',
    semester: 'Semester 2',
    targetAudience: 'Pelajar Politeknik Banting Selangor',
    pedagogicalMethod: 'Pembelajaran Teradun',
    categoryId: 'cat-2',
    tags: [],
    technologies: ['AI Video (D-ID/HeyGen)', 'Lain-lain'],
    primaryCreatorName: 'Ahmad Rafieuddin bin Mohamad Najib',
    primaryCreatorEmail: 'rafieuddin@polibanting.edu.my',
    primaryCreatorStaffId: 'PBS-JPA-008',
    teamMembers: [],
    developmentYear: 2026,
    registrationYear: 2026,
    developmentStatus: 'Sedia Digunakan',
    version: '1.0',
    productUrl: 'https://youtu.be/fDprI4dpM9Y',
    demoUrl: 'https://youtu.be/fDprI4dpM9Y',
    implementationNotes: '',
    createdBy: 'user-pegawai-jpa',
    registrationStatus: 'Diluluskan',
    productId: 'prod-1795601122510-gaz8h',
    archiveCode: 'PBS-EP-2026-0004',
    normalizedTitle: 'apabila sains mengubah sebuah empayar: kehebatan teknologi tamadun uthmaniyyah',
    departmentName: 'Jabatan Pengajian Am',
    categoryName: 'Video PdP & Mikro-Pembelajaran',
    submittedAt: '2026-11-25T10:05:22.510Z',
    createdAt: '2026-11-25T10:05:22.510Z',
    updatedAt: '2026-11-25T10:07:51.702Z',
    achievementsCount: 0,
    documentsCount: 0,
    approvedAt: '2026-11-25T10:07:51.702Z',
    approvedBy: 'user-ketua-uepm',
    approvedByName: 'Aishah binti Saim',
  },
  {
    title: 'From Idea To Innovation : The Power of CNC Programming',
    summary: 'AI Video: From Idea To Innovation : The Power of CNC Programming',
    description:
      'From Idea to Innovation: The Power of CNC Programming is an innovative learning approach that transforms students’ ideas into real engineering products through CNC technology. Students develop product concepts, create CAD models, and convert designs into CNC programs using G-code. Through simulation, machining, inspection, and continuous improvement, students develop practical skills in precision manufacturing, problem-solving, creativity, and digital technology. This project bridges theoretical knowledge with industrial practice, enhances Industry 4.0 competencies, and empowers students to become confident, innovative, and future-ready manufacturing professionals.',
    objectives: 'Students develop product concepts, create CAD models, and convert designs into CNC programs using G-code.',
    problemStatement: 'The students are unable to understand the procedures for using the CNC machine.',
    thumbnailUrl: '',
    departmentId: 'JKM',
    program: 'DKM/DTP',
    courseCode: 'DJF42072',
    courseName: 'CAD CAM',
    semester: 'Semester 4',
    targetAudience: 'Pelajar Politeknik Banting Selangor',
    pedagogicalMethod: 'Pembelajaran Bersemuka',
    categoryId: 'cat-2',
    tags: [],
    technologies: ['AI Video (D-ID/HeyGen)'],
    primaryCreatorName: 'Dr. Lim Yee Kai',
    primaryCreatorEmail: 'pegawai.jkm@polibanting.edu.my',
    primaryCreatorStaffId: 'PBS-JKM-005',
    teamMembers: [],
    developmentYear: 2026,
    registrationYear: 2026,
    developmentStatus: 'Sedia Digunakan',
    version: '1.0',
    productUrl: 'https://youtu.be/FEUc2nSo0n8',
    demoUrl: 'https://youtu.be/FEUc2nSo0n8',
    implementationNotes: '',
    createdBy: 'user-pegawai-jkm',
    registrationStatus: 'Diluluskan',
    productId: 'prod-1795600489588-a55rx',
    archiveCode: 'PBS-EP-2026-0003',
    normalizedTitle: 'from idea to innovation : the power of cnc programming',
    departmentName: 'Jabatan Kejuruteraan Mekanikal',
    categoryName: 'Video PdP & Mikro-Pembelajaran',
    submittedAt: '2026-11-25T09:54:49.588Z',
    createdAt: '2026-11-25T09:54:49.588Z',
    updatedAt: '2026-11-25T09:56:56.710Z',
    achievementsCount: 0,
    documentsCount: 0,
    approvedAt: '2026-11-25T09:56:56.710Z',
    approvedBy: 'user-ketua-uepm',
    approvedByName: 'Aishah binti Saim',
  },
  {
    title: 'Non-Destructive Testing (NDT): Certification Schemes',
    summary:
      'This e-Book provides a comprehensive introduction to Non-Destructive Testing (NDT) certification schemes, with a focus on the standards, qualification requirements, and competency pathways that guide NDT personnel in the aviation and industrial sectors.',
    description:
      'This eBook, *Non-Destructive Testing (NDT): Certification Schemes*, provides a comprehensive overview of the various certification programs for NDT professionals. It explores internationally recognized standards such as ISO 9712, ASNT, PCN, and NAS 410, detailing their requirements, training processes, and qualification levels. The book highlights the importance of certification in ensuring the competency of NDT personnel and maintaining industry safety standards. Additionally, it discusses the differences between employer-based and central certification schemes, offering insights into career progression and industry best practices for NDT professionals.',
    objectives:
      'The content aims to support students, trainees, and industry practitioners in gaining a clear understanding of the certification pathways, levels of qualification, and responsibilities associated with each role.',
    problemStatement:
      'Contribute to the development of skilled NDT professionals who uphold the highest standards of inspection quality and safety.',
    thumbnailUrl: '',
    departmentId: 'JPP',
    program: 'Diploma Kejuruteraan Penyenggaraan Pesawat',
    courseCode: 'DWM50482',
    courseName: 'NON-DESTRUCTIVE TESTING',
    semester: 'Semester 5',
    targetAudience: 'Pelajar Politeknik Banting Selangor',
    pedagogicalMethod: 'Pembelajaran teradun',
    categoryId: 'cat-4',
    tags: [],
    technologies: ['Canva'],
    primaryCreatorName: 'Shazana binti Mustapa',
    primaryCreatorEmail: 'shazana@polibanting.edu.my',
    primaryCreatorStaffId: 'PBS-JPP-006',
    teamMembers: [
      {
        membershipId: 'mem-1795593971624',
        displayName: 'Muhammad Anas bin Ahmad Thani',
        roleInProject: 'Pembangun Bersama',
        email: 'muhammad.anas@polibanting.edu.my',
        staffId: '',
        institution: 'Politeknik Banting Selangor',
      },
      {
        membershipId: 'mem-1795594067322',
        displayName: 'Muhammad Iswan bin Mohamad Ayob',
        roleInProject: 'Editor',
        email: 'iswan@polibanting.edu.my',
        staffId: '',
        institution: 'Politeknik Banting Selangor',
      },
    ],
    developmentYear: 2026,
    registrationYear: 2026,
    developmentStatus: 'Sedia Digunakan',
    version: '1.0',
    productUrl: 'https://drive.google.com/file/d/18WeKdnNKygOGwfGE72U4i2VVilPP-Eg6/view?usp=sharing',
    demoUrl: 'https://drive.google.com/file/d/18WeKdnNKygOGwfGE72U4i2VVilPP-Eg6/view?usp=sharing',
    implementationNotes: '',
    createdBy: 'user-pegawai-jpp',
    registrationStatus: 'Diluluskan',
    productId: 'prod-1795594146291-doqzb',
    archiveCode: 'PBS-EP-2026-0002',
    normalizedTitle: 'non-destructive testing (ndt): certification schemes',
    departmentName: 'Jabatan Penyenggaraan Pesawat',
    categoryName: 'eBook & Panduan Digital',
    submittedAt: '2026-11-25T08:09:06.291Z',
    createdAt: '2026-11-25T08:09:06.291Z',
    updatedAt: '2026-11-25T08:58:18.570Z',
    achievementsCount: 0,
    documentsCount: 0,
    approvedAt: '2026-11-25T08:58:18.570Z',
    approvedBy: 'user-ketua-uepm',
    approvedByName: 'Aishah binti Saim',
  },
  {
    title: 'Ordinary Differential Equation (ODE)',
    summary: 'The interactive e-Book Engineering Mathematics 3: Ordinary Differential Equation (ODE) ',
    description:
      'The interactive e-Book Engineering Mathematics 3: Ordinary Differential Equation (ODE) is specially developed to assist engineering diploma students in understanding ODE concepts through a more visual, systematic, and application-based approach. The e-Book focuses on the construction of ordinary differential equations, first-order differential equations, and second-order differential equations, together with their applications in engineering contexts. Each topic is supported by interactive learning elements such as animations, graph visualizations, step-by-step solution guides, interactive exercises, and real-world engineering examples to strengthen students’ conceptual understanding and problem-solving skills. Through this interactive approach, students are encouraged not only to solve mathematical equations, but also to understand how ODEs are used to model and analyse engineering systems and phenomena encountered in real-life situations.',
    objectives:
      'To assist engineering diploma students in understanding ODE concepts through a more visual, systematic, and application-based approach.',
    problemStatement: 'Students hardly understand the ODE concepts',
    thumbnailUrl: '',
    departmentId: 'JMSK',
    program: 'Diploma Kejuruteraan Mekanikal',
    courseCode: 'DBM30183',
    courseName: 'Engineering Mathematics 3',
    semester: 'Semester 3',
    targetAudience: 'Pelajar Politeknik Banting Selangor',
    pedagogicalMethod: 'Pembelajaran teradun',
    categoryId: 'cat-4',
    tags: [],
    technologies: ['Canva'],
    primaryCreatorName: 'Ruhiyah Nazihah binti Zahkai',
    primaryCreatorEmail: 'ruhiyah@polibanting.edu.my',
    primaryCreatorStaffId: 'PBS-JMSK-007',
    teamMembers: [
      {
        membershipId: 'mem-1795592820356',
        displayName: "Rasyida binti A'alaf",
        roleInProject: 'Pembangun Bersama',
        email: 'rasyida@polibanting.edu.my',
        staffId: '',
        institution: 'Politeknik Banting Selangor',
      },
      {
        membershipId: 'mem-1795592854852',
        displayName: 'Sariah binti Ahmad',
        roleInProject: 'Editor',
        email: 'sariah@polibanting.edu.my',
        staffId: '',
        institution: 'Politeknik Banting Selangor',
      },
    ],
    developmentYear: 2026,
    registrationYear: 2026,
    developmentStatus: 'Sedia Digunakan',
    version: '1.0',
    productUrl: 'https://heyzine.com/flip-book/cf65cc144f.html#page/1',
    demoUrl: 'https://heyzine.com/flip-book/cf65cc144f.html#page/1',
    implementationNotes: '',
    createdBy: 'user-pegawai-jmsk',
    registrationStatus: 'Diluluskan',
    productId: 'prod-1795592913494-tbldi',
    archiveCode: 'PBS-EP-2026-0001',
    normalizedTitle: 'ordinary differential equation (ode)',
    departmentName: 'Jabatan Matematik, Sains & Komputer',
    categoryName: 'eBook & Panduan Digital',
    submittedAt: '2026-11-25T07:48:33.494Z',
    createdAt: '2026-11-25T07:48:33.494Z',
    updatedAt: '2026-11-25T07:50:15.430Z',
    achievementsCount: 0,
    documentsCount: 0,
    approvedAt: '2026-11-25T07:50:15.430Z',
    approvedBy: 'user-uepm',
    approvedByName: 'Aishah binti Saim',
  },
];

// Helper: Push key to Firebase Realtime Database asynchronously
function pushToFirebaseCloud<T>(key: string, value: T): void {
  try {
    fetch(`${FIREBASE_RTDB_URL}/${key}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    }).catch((err) => console.warn(`Cloud sync push warning (${key}):`, err));
  } catch (e) {
    console.warn(`Cloud sync error (${key}):`, e);
  }
}

// Helper: Read from LocalStorage with fallback
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

// Helper: Save to LocalStorage AND Sync to Firebase Cloud
function setLocalItem<T>(key: string, value: T, syncToCloud: boolean = true): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (syncToCloud) {
      pushToFirebaseCloud(key, value);
    }
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Helper: Smart merge two arrays of objects by unique ID key
function mergeById<T extends Record<string, any>>(localArr: T[], remoteArr: T[], idKey: string): T[] {
  const map = new Map<string, T>();
  localArr.forEach((item) => {
    if (item && item[idKey]) map.set(String(item[idKey]), item);
  });
  remoteArr.forEach((remoteItem) => {
    if (remoteItem && remoteItem[idKey]) {
      const id = String(remoteItem[idKey]);
      const localItem = map.get(id);
      if (!localItem) {
        map.set(id, remoteItem);
      } else {
        const localTime = localItem.updatedAt ? new Date(localItem.updatedAt).getTime() : 0;
        const remoteTime = remoteItem.updatedAt ? new Date(remoteItem.updatedAt).getTime() : 0;
        if (remoteTime >= localTime) {
          map.set(id, remoteItem);
        }
      }
    }
  });
  return Array.from(map.values());
}

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.ensureInitialized();
    this.syncWithFirebaseCloud();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Ensure initial base configurations & official products exist
  private ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setLocalItem(STORAGE_KEYS.USERS, INITIAL_USERS, false);
    } else {
      // Pastikan pengguna baharu (cth: Pegawai MARO) sentiasa ada
      const currentUsers = getLocalItem<UserProfile[]>(STORAGE_KEYS.USERS, []);
      const mergedUsers = mergeById(INITIAL_USERS, currentUsers, 'uid');
      setLocalItem(STORAGE_KEYS.USERS, mergedUsers, false);
    }

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setLocalItem(STORAGE_KEYS.SETTINGS, INITIAL_SYSTEM_SETTINGS, false);
    }

    // Pastikan 4 produk rasmi PBS sentiasa ada di semua komputer
    const currentProducts = getLocalItem<InnovationProduct[]>(STORAGE_KEYS.PRODUCTS, []);
    const mergedSeedProducts = mergeById(SEED_OFFICIAL_PRODUCTS, currentProducts, 'productId').map((p) => ({
      ...p,
      departmentName: p.departmentId === 'JPP' ? 'Jabatan Penyenggaraan Pesawat' : p.departmentName,
      productUrl:
        p.productUrl ||
        (p.thumbnailUrl && p.thumbnailUrl.startsWith('http') ? p.thumbnailUrl : ''),
    }));
    setLocalItem(STORAGE_KEYS.PRODUCTS, mergedSeedProducts, false);

    if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
      setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, [], false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      setLocalItem(STORAGE_KEYS.DOCUMENTS, [], false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT)) {
      setLocalItem(STORAGE_KEYS.AUDIT, [], false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setLocalItem(STORAGE_KEYS.NOTIFICATIONS, [], false);
    }

    const counters = getLocalItem<Record<string, number>>(STORAGE_KEYS.COUNTERS, { 2026: 4 });
    if (!counters['2026'] || counters['2026'] < mergedSeedProducts.length) {
      counters['2026'] = Math.max(mergedSeedProducts.length, 4);
    }
    setLocalItem(STORAGE_KEYS.COUNTERS, counters, false);
  }

  // ==========================================
  // FIREBASE REALTIME CLOUD SYNC (2-WAY)
  // ==========================================
  public async syncWithFirebaseCloud(): Promise<void> {
    try {
      const response = await fetch(`${FIREBASE_RTDB_URL}/.json`);
      if (!response.ok) return;

      const cloudData = await response.json();
      let shouldReloadUI = false;

      // 1. Sync Products
      const localProducts = getLocalItem<InnovationProduct[]>(STORAGE_KEYS.PRODUCTS, SEED_OFFICIAL_PRODUCTS);
      const cloudProducts: InnovationProduct[] = Array.isArray(cloudData?.[STORAGE_KEYS.PRODUCTS])
        ? cloudData[STORAGE_KEYS.PRODUCTS]
        : [];
      const mergedProducts = mergeById(
        mergeById(SEED_OFFICIAL_PRODUCTS, localProducts, 'productId'),
        cloudProducts,
        'productId'
      ).map((p) => ({
        ...p,
        departmentName: p.departmentId === 'JPP' ? 'Jabatan Penyenggaraan Pesawat' : p.departmentName,
      }));

      if (JSON.stringify(mergedProducts) !== JSON.stringify(localProducts)) {
        shouldReloadUI = true;
      }
      setLocalItem(STORAGE_KEYS.PRODUCTS, mergedProducts, true);

      // 2. Sync Achievements
      const localAchievements = getLocalItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
      const cloudAchievements: Achievement[] = Array.isArray(cloudData?.[STORAGE_KEYS.ACHIEVEMENTS])
        ? cloudData[STORAGE_KEYS.ACHIEVEMENTS]
        : [];
      const mergedAchievements = mergeById(localAchievements, cloudAchievements, 'achievementId');
      if (JSON.stringify(mergedAchievements) !== JSON.stringify(localAchievements)) {
        shouldReloadUI = true;
      }
      setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, mergedAchievements, true);

      // 3. Sync Documents
      const localDocs = getLocalItem<ArchiveDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
      const cloudDocs: ArchiveDocument[] = Array.isArray(cloudData?.[STORAGE_KEYS.DOCUMENTS])
        ? cloudData[STORAGE_KEYS.DOCUMENTS]
        : [];
      const mergedDocs = mergeById(localDocs, cloudDocs, 'documentId');
      if (JSON.stringify(mergedDocs) !== JSON.stringify(localDocs)) {
        shouldReloadUI = true;
      }
      setLocalItem(STORAGE_KEYS.DOCUMENTS, mergedDocs, true);

      // 4. Sync Users
      const localUsers = getLocalItem<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
      const cloudUsers: UserProfile[] = Array.isArray(cloudData?.[STORAGE_KEYS.USERS])
        ? cloudData[STORAGE_KEYS.USERS]
        : [];
      const mergedUsers = mergeById(mergeById(INITIAL_USERS, localUsers, 'uid'), cloudUsers, 'uid');
      setLocalItem(STORAGE_KEYS.USERS, mergedUsers, true);

      // 5. Sync Counters
      const localCounters = getLocalItem<Record<string, number>>(STORAGE_KEYS.COUNTERS, { 2026: 4 });
      const cloudCounters: Record<string, number> = cloudData?.[STORAGE_KEYS.COUNTERS] || {};
      const max2026 = Math.max(
        localCounters['2026'] || 0,
        cloudCounters['2026'] || 0,
        mergedProducts.length,
        4
      );
      const mergedCounters = { ...localCounters, ...cloudCounters, 2026: max2026 };
      setLocalItem(STORAGE_KEYS.COUNTERS, mergedCounters, true);

      // Jika ada produk/dokumen/pencapaian baharu yang ditarik dari Cloud, segarkan paparan sekali
      if (shouldReloadUI && !sessionStorage.getItem('sapie_cloud_synced_once')) {
        sessionStorage.setItem('sapie_cloud_synced_once', 'true');
        window.location.reload();
      }
    } catch (e) {
      console.warn('Firebase Cloud Sync offline or unreachable, using local storage:', e);
    }
  }

  // ==========================================
  // ARCHIVE CODE GENERATOR (Concurrency-Safe)
  // ==========================================
  public generateNextArchiveCode(year: number = new Date().getFullYear()): string {
    const counters = getLocalItem<Record<string, number>>(STORAGE_KEYS.COUNTERS, {});
    const productsCountForYear = this.getProducts().filter((p) => p.registrationYear === year).length;
    const currentYearCount = Math.max(counters[year] || 0, productsCountForYear) + 1;
    counters[year] = currentYearCount;
    setLocalItem(STORAGE_KEYS.COUNTERS, counters);

    const settings = this.getSystemSettings();
    const prefix = settings.archiveCodePrefix || 'PBS-EP';
    return formatArchiveCode(prefix, year, currentYearCount);
  }

  // Check potential duplicate products
  public checkPotentialDuplicate(title: string, excludeProductId?: string): InnovationProduct | null {
    const products = this.getProducts();
    const normalized = title.trim().toLowerCase();
    return (
      products.find((p) => p.normalizedTitle === normalized && p.productId !== excludeProductId) || null
    );
  }

  // ==========================================
  // PRODUCTS
  // ==========================================
  public getProducts(filters?: {
    status?: RegistrationStatus | 'SEMUA';
    departmentId?: string;
    categoryId?: string;
    year?: number;
    searchQuery?: string;
    creatorUid?: string;
  }): InnovationProduct[] {
    let products = getLocalItem<InnovationProduct[]>(STORAGE_KEYS.PRODUCTS, SEED_OFFICIAL_PRODUCTS);

    if (!filters) {
      return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (filters.status && filters.status !== 'SEMUA') {
      products = products.filter((p) => p.registrationStatus === filters.status);
    }
    if (filters.departmentId && filters.departmentId !== 'SEMUA') {
      products = products.filter((p) => p.departmentId === filters.departmentId);
    }
    if (filters.categoryId && filters.categoryId !== 'SEMUA') {
      products = products.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters.year) {
      products = products.filter(
        (p) => p.registrationYear === filters.year || p.developmentYear === filters.year
      );
    }
    if (filters.creatorUid) {
      products = products.filter(
        (p) =>
          p.primaryCreatorUid === filters.creatorUid ||
          p.createdBy === filters.creatorUid ||
          p.teamMembers.some((m) => m.userId === filters.creatorUid)
      );
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.archiveCode.toLowerCase().includes(q) ||
          p.primaryCreatorName.toLowerCase().includes(q) ||
          p.courseName.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          (p.departmentName && p.departmentName.toLowerCase().includes(q))
      );
    }

    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getProductById(productId: string): InnovationProduct | null {
    const products = this.getProducts();
    return products.find((p) => p.productId === productId) || null;
  }

  public createProduct(
    productData: Omit<
      InnovationProduct,
      'productId' | 'archiveCode' | 'normalizedTitle' | 'createdAt' | 'updatedAt'
    >,
    actor: UserProfile,
    isDraft: boolean = false
  ): InnovationProduct {
    const products = this.getProducts();
    const productId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const regYear = productData.registrationYear || new Date().getFullYear();
    const archiveCode = this.generateNextArchiveCode(regYear);

    const department = INITIAL_DEPARTMENTS.find((d) => d.departmentId === productData.departmentId);
    const category = INITIAL_CATEGORIES.find((c) => c.categoryId === productData.categoryId);

    const initialStatus: RegistrationStatus = isDraft ? 'Draf' : 'Dihantar untuk Semakan';

    const newProduct: InnovationProduct = {
      ...productData,
      productId,
      archiveCode,
      normalizedTitle: productData.title.trim().toLowerCase(),
      departmentName: department?.name || productData.departmentId,
      categoryName: category?.name || productData.categoryId,
      registrationStatus: initialStatus,
      submittedAt: isDraft ? undefined : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      achievementsCount: 0,
      documentsCount: 0,
    };

    products.unshift(newProduct);
    setLocalItem(STORAGE_KEYS.PRODUCTS, products);

    this.createAuditLog({
      actorUid: actor.uid,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: isDraft ? 'PRODUCT_CREATE' : 'PRODUCT_SUBMIT',
      entityType: 'Product',
      entityId: productId,
      entityIdentifier: archiveCode,
      outcome: 'Berjaya',
      details: isDraft
        ? `Menyimpan draf produk inovasi: ${newProduct.title}`
        : `Menghantar pendaftaran produk untuk semakan: ${newProduct.title} (${archiveCode})`,
    });

    if (!isDraft) {
      this.createNotification({
        title: 'Pendaftaran Produk Baharu Diterima',
        message: `Produk "${newProduct.title}" (${archiveCode}) telah dihantar oleh ${actor.fullName} untuk semakan institusi.`,
        recipientUid: 'ALL_ADMINS',
        type: 'info',
        relatedRecordId: productId,
        relatedRecordType: 'product',
        destinationRoute: `/arkib-produk/${productId}`,
      });
    }

    return newProduct;
  }

  public updateProduct(
    productId: string,
    updates: Partial<InnovationProduct>,
    actor: UserProfile,
    actionReason?: string
  ): InnovationProduct {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.productId === productId);
    if (index === -1) throw new Error('Produk tidak dijumpai');

    const existing = products[index];
    const previousStatus = existing.registrationStatus;

    const updated: InnovationProduct = {
      ...existing,
      ...updates,
      normalizedTitle: updates.title ? updates.title.trim().toLowerCase() : existing.normalizedTitle,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    setLocalItem(STORAGE_KEYS.PRODUCTS, products);

    this.createAuditLog({
      actorUid: actor.uid,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'PRODUCT_UPDATE',
      entityType: 'Product',
      entityId: productId,
      entityIdentifier: existing.archiveCode,
      outcome: 'Berjaya',
      details: actionReason || `Mengemas kini maklumat produk ${existing.archiveCode} (${existing.title})`,
      metadata: { previousStatus, newStatus: updated.registrationStatus },
    });

    return updated;
  }

  public approveProduct(productId: string, actor: UserProfile, notes?: string): InnovationProduct {
    const product = this.getProductById(productId);
    if (!product) throw new Error('Produk tidak dijumpai');

    const updated = this.updateProduct(
      productId,
      {
        registrationStatus: 'Diluluskan',
        approvedAt: new Date().toISOString(),
        approvedBy: actor.uid,
        approvedByName: actor.fullName,
        rejectionReason: undefined,
        correctionNotes: undefined,
      },
      actor,
      `Meluluskan produk pendaftaran ${product.archiveCode} ke dalam arkib rasmi.${notes ? ` Catatan: ${notes}` : ''}`
    );

    this.createNotification({
      title: 'Pendaftaran Produk Diluluskan!',
      message: `Tahniah! Produk inovasi "${product.title}" (${product.archiveCode}) telah diluluskan dan kini rasmi diarkibkan.`,
      recipientUid: product.primaryCreatorUid,
      type: 'success',
      relatedRecordId: productId,
      relatedRecordType: 'product',
      destinationRoute: `/arkib-produk/${productId}`,
    });

    return updated;
  }

  public returnForCorrection(
    productId: string,
    correctionNotes: string,
    actor: UserProfile
  ): InnovationProduct {
    const product = this.getProductById(productId);
    if (!product) throw new Error('Produk tidak dijumpai');

    const updated = this.updateProduct(
      productId,
      {
        registrationStatus: 'Memerlukan Pembetulan',
        correctionNotes,
      },
      actor,
      `Memulangkan pendaftaran ${product.archiveCode} untuk pembetulan: ${correctionNotes}`
    );

    this.createNotification({
      title: 'Pembetulan Diperlukan untuk Produk',
      message: `Pendaftaran produk "${product.title}" memerlukan pembetulan oleh pihak pentadbir: "${correctionNotes}".`,
      recipientUid: product.primaryCreatorUid,
      type: 'warning',
      relatedRecordId: productId,
      relatedRecordType: 'product',
      destinationRoute: `/pendaftaran-produk/${productId}/edit`,
    });

    return updated;
  }

  public rejectProduct(productId: string, rejectionReason: string, actor: UserProfile): InnovationProduct {
    const product = this.getProductById(productId);
    if (!product) throw new Error('Produk tidak dijumpai');

    const updated = this.updateProduct(
      productId,
      {
        registrationStatus: 'Ditolak',
        rejectionReason,
      },
      actor,
      `Menolak pendaftaran ${product.archiveCode}. Sebab: ${rejectionReason}`
    );

    this.createNotification({
      title: 'Pendaftaran Produk Ditolak',
      message: `Dukacita dimaklumkan bahawa pendaftaran produk "${product.title}" telah ditolak. Sebab: ${rejectionReason}`,
      recipientUid: product.primaryCreatorUid,
      type: 'danger',
      relatedRecordId: productId,
      relatedRecordType: 'product',
      destinationRoute: `/arkib-produk/${productId}`,
    });

    return updated;
  }

  public deleteDraftProduct(productId: string, actor: UserProfile): boolean {
    const product = this.getProductById(productId);
    if (!product) return false;
    if (product.registrationStatus === 'Diluluskan') {
      throw new Error('Produk yang telah diluluskan tidak boleh dipadamkan secara kekal dari arkib.');
    }

    let products = this.getProducts();
    products = products.filter((p) => p.productId !== productId);
    setLocalItem(STORAGE_KEYS.PRODUCTS, products);

    this.createAuditLog({
      actorUid: actor.uid,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'PRODUCT_UPDATE',
      entityType: 'Product',
      entityId: productId,
      entityIdentifier: product.archiveCode,
      outcome: 'Berjaya',
      details: `Memadam draf produk inovasi: ${product.title} (${product.archiveCode})`,
    });

    return true;
  }

  // ==========================================
  // ACHIEVEMENTS & RECOGNITION
  // ==========================================
  public getAchievements(filters?: {
    productId?: string;
    status?: AchievementVerificationStatus | 'SEMUA';
    year?: number;
    recognitionLevel?: string;
    departmentId?: string;
  }): Achievement[] {
    let achievements = getLocalItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);

    if (!filters) return achievements;

    if (filters.productId) {
      achievements = achievements.filter((a) => a.productId === filters.productId);
    }
    if (filters.status && filters.status !== 'SEMUA') {
      achievements = achievements.filter((a) => a.verificationStatus === filters.status);
    }
    if (filters.year) {
      achievements = achievements.filter((a) => a.achievementYear === filters.year);
    }
    if (filters.recognitionLevel && filters.recognitionLevel !== 'SEMUA') {
      achievements = achievements.filter((a) => a.recognitionLevel === filters.recognitionLevel);
    }
    if (filters.departmentId && filters.departmentId !== 'SEMUA') {
      achievements = achievements.filter((a) => a.departmentId === filters.departmentId);
    }

    return achievements.sort(
      (a, b) => new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime()
    );
  }

  public createAchievement(
    achievementData: Omit<
      Achievement,
      'achievementId' | 'createdAt' | 'updatedAt' | 'verificationStatus'
    >,
    actor: UserProfile
  ): Achievement {
    const product = this.getProductById(achievementData.productId);
    const achievements = this.getAchievements();
    const achievementId = `ach-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newAchievement: Achievement = {
      ...achievementData,
      achievementId,
      productTitle: product?.title || achievementData.productTitle,
      productArchiveCode: product?.archiveCode || achievementData.productArchiveCode,
      departmentId: product?.departmentId || achievementData.departmentId,
      verificationStatus: 'Dalam Semakan',
      submittedBy: actor.uid,
      submittedByName: actor.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    achievements.unshift(newAchievement);
    setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);

    if (product) {
      this.refreshProductCounts(product.productId);
    }

    this.createAuditLog({
      actorUid: actor.uid,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'ACHIEVEMENT_CREATE',
      entityType: 'Achievement',
      entityId: achievementId,
      outcome: 'Berjaya',
      details: `Menghantar rekod pencapaian "${newAchievement.title}" (${newAchievement.resultType}) untuk produk ${product?.archiveCode || achievementData.productId}`,
    });

    this.createNotification({
      title: 'Pencapaian Baharu Dihantar',
      message: `Pencapaian "${newAchievement.title}" untuk produk ${product?.archiveCode} telah dihantar oleh ${actor.fullName} untuk pengesahan.`,
      recipientUid: 'ALL_ADMINS',
      type: 'info',
      relatedRecordId: achievementId,
      relatedRecordType: 'achievement',
      destinationRoute: `/pencapaian`,
    });

    return newAchievement;
  }

  public verifyAchievement(
    achievementId: string,
    status: 'Disahkan' | 'Memerlukan Pembetulan' | 'Ditolak',
    notes: string | undefined,
    actor: UserProfile
  ): Achievement {
    const achievements = this.getAchievements();
    const index = achievements.findIndex((a) => a.achievementId === achievementId);
    if (index === -1) throw new Error('Rekod pencapaian tidak dijumpai');

    const existing = achievements[index];
    const updated: Achievement = {
      ...existing,
      verificationStatus: status,
      verifiedBy: actor.uid,
      verifiedByName: actor.fullName,
      verifiedAt: new Date().toISOString(),
      administrativeNotes: notes,
      updatedAt: new Date().toISOString(),
    };

    achievements[index] = updated;
    setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);

    this.refreshProductCounts(existing.productId);

    this.createAuditLog({
      actorUid: actor.uid,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: status === 'Disahkan' ? 'ACHIEVEMENT_VERIFY' : 'ACHIEVEMENT_REJECT',
      entityType: 'Achievement',
      entityId: achievementId,
      outcome: 'Berjaya',
      details: `${status === 'Disahkan' ? 'Mengesahkan' : 'Mengemas kini'} pencapaian "${existing.title}": Status ${status}`,
    });

    this.createNotification({
      title: `Status Pencapaian: ${status}`,
      message: `Rekod pencapaian "${existing.title}" telah dikemas kini statusnya kepada "${status}" oleh pihak pentadbir.`,
      recipientUid: existing.submittedBy,
      type:
        status === 'Disahkan' ? 'success' : status === 'Memerlukan Pembetulan' ? 'warning' : 'danger',
      relatedRecordId: achievementId,
      relatedRecordType: 'achievement',
      destinationRoute: `/pencapaian`,
    });

    return updated;
  }

  // ==========================================
  // DOCUMENTS & STORAGE
  // ==========================================
  public getDocuments(filters?: {
    productId?: string;
    category?: string;
    year?: number;
    departmentId?: string;
  }): ArchiveDocument[] {
    let documents = getLocalItem<ArchiveDocument[]>(STORAGE_KEYS.DOCUMENTS, []);

    if (!filters) return documents;

    if (filters.productId) {
      documents = documents.filter((d) => d.productId === filters.productId);
    }
    if (filters.category && filters.category !== 'SEMUA') {
      documents = documents.filter((d) => d.category === filters.category);
    }
    if (filters.year) {
      documents = documents.filter((d) => d.reportingYear === filters.year);
    }
    if (filters.departmentId && filters.departmentId !== 'SEMUA') {
      documents = documents.filter((d) => d.departmentId === filters.departmentId);
    }

    return documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public uploadDocument(
    docMeta: Omit<
      ArchiveDocument,
      'documentId' | 'fileUrl' | 'storagePath' | 'version' | 'createdAt' | 'updatedAt' | 'versions'
    >,
    file: File | { name: string; size: number; type: string; url?: string },
    actor: UserProfile
  ): ArchiveDocument {
    const product = this.getProductById(docMeta.productId);
    const documents = this.getDocuments();
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const year = docMeta.reportingYear || new Date().getFullYear();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `archive/${year}/${docMeta.productId}/${documentId}_${cleanFileName}`;

    const fileUrl =
      'url' in file && file.url
        ? file.url
        : URL.createObjectURL
        ? URL.createObjectURL(file as File)
        : `https://polibanting.edu.my/sapie/files/${documentId}`;

    const newDoc: ArchiveDocument = {
      ...docMeta,
      documentId,
      productTitle: product?.title || docMeta.productTitle,
      productArchiveCode: product?.archiveCode || docMeta.productArchiveCode,
      departmentId: product?.departmentId || docMeta.departmentId,
      originalFilename: file.name,
      storagePath,
      fileUrl,
      mimeType: file.type || 'application/octet-stream',
      fileSize: file.size,
      version: 1,
      uploadedBy: actor.uid,
      uploadedByName: actor.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [
        {
          versionId: `ver-1-${documentId}`,
          documentId,
          versionNumber: 1,
          storagePath,
          fileUrl,
          originalFilename: file.name,
          fileSize: file.size,
          uploadedBy: actor.uid,
          uploadedByName: actor.fullName,
          changeNotes: 'Muat naik versi asal.',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    documents.unshift(newDoc);
    setLocalItem(STORAGE_KEYS.DOCUMENTS, documents);

    if (product) {
      this.refreshProductCounts(product.productId);
    }

    this.createAuditLog({
      actorUid: actor.uid,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'DOCUMENT_UPLOAD',
      entityType: 'Document',
      entityId: documentId,
      outcome: 'Berjaya',
      details: `Memuat naik dokumen "${newDoc.title}" (${file.name}, ${(file.size / 1024).toFixed(1)} KB) bagi produk ${product?.archiveCode || docMeta.productId}`,
    });

    return newDoc;
  }

  private refreshProductCounts(productId: string): void {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.productId === productId);
    if (idx !== -1) {
      const achievements = this.getAchievements({ productId });
      const documents = this.getDocuments({ productId });
      products[idx].achievementsCount = achievements.filter(
        (a) => a.verificationStatus === 'Disahkan'
      ).length;
      products[idx].documentsCount = documents.length;
      setLocalItem(STORAGE_KEYS.PRODUCTS, products);
    }
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  public getAuditLogs(filters?: {
    action?: AuditAction;
    actorUid?: string;
    entityType?: string;
  }): AuditLogEntry[] {
    let logs = getLocalItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT, []);
    if (!filters) return logs;

    if (filters.action) {
      logs = logs.filter((l) => l.action === filters.action);
    }
    if (filters.actorUid) {
      logs = logs.filter((l) => l.actorUid === filters.actorUid);
    }
    if (filters.entityType) {
      logs = logs.filter((l) => l.entityType === filters.entityType);
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public createAuditLog(entry: Omit<AuditLogEntry, 'auditId' | 'timestamp'>): void {
    const logs = getLocalItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT, []);
    const auditId = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullLog: AuditLogEntry = {
      ...entry,
      auditId,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(fullLog);
    if (logs.length > 500) {
      logs.splice(500);
    }
    setLocalItem(STORAGE_KEYS.AUDIT, logs);
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  public getNotifications(userUid?: string): AppNotification[] {
    const notifications = getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!userUid) return notifications;
    return notifications.filter(
      (n) =>
        n.recipientUid === userUid ||
        n.recipientUid === 'ALL_USERS' ||
        n.recipientUid === 'ALL_ADMINS'
    );
  }

  public createNotification(data: Omit<AppNotification, 'notificationId' | 'read' | 'createdAt'>): void {
    const notifications = getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif: AppNotification = {
      ...data,
      notificationId: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
    if (notifications.length > 100) notifications.splice(100);
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  public markNotificationAsRead(notificationId: string): void {
    const notifications = getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const item = notifications.find((n) => n.notificationId === notificationId);
    if (item) {
      item.read = true;
      setLocalItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }

  public markAllNotificationsAsRead(userUid: string): void {
    const notifications = getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifications.forEach((n) => {
      if (
        n.recipientUid === userUid ||
        n.recipientUid === 'ALL_USERS' ||
        n.recipientUid === 'ALL_ADMINS'
      ) {
        n.read = true;
      }
    });
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  // ==========================================
  // USERS & ROLES
  // ==========================================
  public getUsers(): UserProfile[] {
    return getLocalItem<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserById(uid: string): UserProfile | null {
    const users = this.getUsers();
    return users.find((u) => u.uid === uid) || null;
  }

  public getUserByEmail(email: string): UserProfile | null {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public createUser(
    userData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>,
    actor: UserProfile
  ): UserProfile {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error(`Alamat e-mel ${userData.email} telah didaftarkan dalam sistem.`);
    }

    const uid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: UserProfile = {
      ...userData,
      uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    setLocalItem(STORAGE_KEYS.USERS, users);

    this.createAuditLog({
      actorUid: actor.uid,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'USER_CREATE',
      entityType: 'User',
      entityId: uid,
      entityIdentifier: newUser.email,
      outcome: 'Berjaya',
      details: `Mendaftar pengguna baharu: ${newUser.fullName} (${newUser.email}) dengan peranan ${newUser.role}`,
    });

    return newUser;
  }

  public updateUser(uid: string, updates: Partial<UserProfile>, actor: UserProfile): UserProfile {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.uid === uid);
    if (index === -1) throw new Error('Pengguna tidak dijumpai');

    const previousRole = users[index].role;
    const previousStatus = users[index].active;

    const updatedUser: UserProfile = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    users[index] = updatedUser;
    setLocalItem(STORAGE_KEYS.USERS, users);

    if (updates.role && updates.role !== previousRole) {
      this.createAuditLog({
        actorUid: actor.uid,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'USER_ROLE_CHANGE',
        entityType: 'User',
        entityId: uid,
        entityIdentifier: updatedUser.email,
        outcome: 'Berjaya',
        details: `Menukar peranan pengguna ${updatedUser.fullName} dari ${previousRole} kepada ${updates.role}`,
      });
    }

    if (updates.active !== undefined && updates.active !== previousStatus) {
      this.createAuditLog({
        actorUid: actor.uid,
        actorName: actor.fullName,
        actorRole: actor.role,
        action: 'USER_STATUS_CHANGE',
        entityType: 'User',
        entityId: uid,
        entityIdentifier: updatedUser.email,
        outcome: 'Berjaya',
        details: `Menukar status keaktifan pengguna ${updatedUser.fullName} kepada ${updatedUser.active ? 'Aktif' : 'Tidak Aktif'}`,
      });
    }

    return updatedUser;
  }

  // ==========================================
  // SYSTEM SETTINGS
  // ==========================================
  public getSystemSettings(): SystemSettings {
    return getLocalItem<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SYSTEM_SETTINGS);
  }

  public updateSystemSettings(updates: Partial<SystemSettings>, actor: UserProfile): SystemSettings {
    const current = this.getSystemSettings();
    const updated: SystemSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.fullName,
    };

    setLocalItem(STORAGE_KEYS.SETTINGS, updated);

    this.createAuditLog({
      actorUid: actor.uid,
      actorName: actor.fullName,
      actorRole: actor.role,
      action: 'SETTINGS_UPDATE',
      entityType: 'Settings',
      outcome: 'Berjaya',
      details: `Mengemas kini tetapan pentadbiran sistem SAPIe oleh ${actor.fullName}`,
    });

    return updated;
  }

  // ==========================================
  // DASHBOARD COMPUTED METRICS
  // ==========================================
  public getDashboardStats(filters?: { year?: number; departmentId?: string }) {
    let products = this.getProducts();
    let achievements = this.getAchievements();
    let documents = this.getDocuments();

    if (filters?.year) {
      products = products.filter(
        (p) => p.registrationYear === filters.year || p.developmentYear === filters.year
      );
      achievements = achievements.filter((a) => a.achievementYear === filters.year);
      documents = documents.filter((d) => d.reportingYear === filters.year);
    }

    if (filters?.departmentId && filters.departmentId !== 'SEMUA') {
      products = products.filter((p) => p.departmentId === filters.departmentId);
      achievements = achievements.filter((a) => a.departmentId === filters.departmentId);
      documents = documents.filter((d) => d.departmentId === filters.departmentId);
    }

    const totalProducts = products.length;
    const approvedProducts = products.filter((p) => p.registrationStatus === 'Diluluskan').length;
    const inReviewProducts = products.filter(
      (p) =>
        p.registrationStatus === 'Dalam Semakan' || p.registrationStatus === 'Dihantar untuk Semakan'
    ).length;
    const inDevelopmentProducts = products.filter(
      (p) =>
        p.developmentStatus === 'Dalam Pembangunan' || p.developmentStatus === 'Perancangan'
    ).length;

    const verifiedAchievements = achievements.filter((a) => a.verificationStatus === 'Disahkan').length;
    const distinctProductsWithAchievements = new Set(
      achievements.filter((a) => a.verificationStatus === 'Disahkan').map((a) => a.productId)
    ).size;

    const totalDocuments = documents.length;
    const distinctDepartments = new Set(products.map((p) => p.departmentId)).size;
    const distinctCreators = new Set(products.map((p) => p.primaryCreatorEmail)).size;

    return {
      totalProducts,
      approvedProducts,
      inReviewProducts,
      inDevelopmentProducts,
      totalAchievements: verifiedAchievements,
      allAchievementRecords: achievements.length,
      distinctProductsWithAchievements,
      totalDocuments,
      distinctDepartments,
      distinctCreators,
    };
  }
}

export const dbService = DatabaseService.getInstance();
