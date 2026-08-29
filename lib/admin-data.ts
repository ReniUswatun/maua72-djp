import { deriveDimensionInsight } from "./ai-insights";
import { getPillar } from "./assessment-config";
import { buatRekomendasi } from "./recommendations";
import { hitungHasil, LEVELS } from "./scoring";
import {
  DEMO_ANSWERS,
  DEMO_PROFILE,
  DEMO_USER,
  MOCK_DOCUMENTS,
  MOCK_TIMELINE,
  PETUGAS,
} from "./mock-data";
import type {
  AdminAccount,
  ApplicationCase,
  AuditLogEntry,
  BusinessProfile,
  DocumentPrecheckFinding,
  ReviewDimension,
  ReviewStage,
  TimelineEvent,
  User,
} from "./types";

function cloneTimeline(events: TimelineEvent[]) {
  return [...events].sort((a, b) => +new Date(a.tanggal) - +new Date(b.tanggal));
}

function buildAudit(action: string, officer: string, note?: string): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    officer,
    action,
    note,
  };
}

function buildDimensions(
  caseId: string,
  answers: ApplicationCase["rawAnswers"],
  assessment: ApplicationCase["assessment"],
  profile: BusinessProfile,
): ReviewDimension[] {
  const recommendations = buatRekomendasi(answers, assessment, profile);

  return assessment.pilar.map((pillar) => {
    const aiRecommendation =
      recommendations.find((item) => item.pillarId === pillar.pillarId)?.ringkas ??
      `Skor pilar ${pillar.pillarId} perlu ditinjau petugas.`;
    const insight = deriveDimensionInsight(pillar, answers, profile);
    const pillarName = getPillar(pillar.pillarId)?.nama ?? `Pilar ${pillar.pillarId}`;

    return {
      id: `${caseId}-pillar-${pillar.pillarId}`,
      label: pillarName,
      pillarId: pillar.pillarId,
      aiScore: pillar.skor,
      aiDraft: aiRecommendation,
      aiReason: insight.reason,
      aiConfidence: insight.confidence,
      confidenceReason: insight.confidenceReason,
      officerScore: pillar.skor,
      officerDraft: aiRecommendation,
      status: "baru" as ReviewStage,
    };
  });
}

function createCase(params: {
  id: string;
  user: User;
  profile: BusinessProfile;
  answers: ApplicationCase["rawAnswers"];
  submittedAt: string;
  status: ReviewStage;
  timeline: TimelineEvent[];
  documents?: ApplicationCase["documents"];
  precheckFindings?: DocumentPrecheckFinding[];
  internalNotes?: string[];
}): ApplicationCase {
  const assessment = hitungHasil(params.answers, params.profile, params.submittedAt);
  const timeline = cloneTimeline(params.timeline);
  const aiDraft = `AI menilai usaha pada Level ${assessment.level} dengan skor ${assessment.skorTotal}/100.`;

  return {
    id: params.id,
    businessName: params.profile.namaUsaha,
    ownerName: params.user.nama,
    email: params.user.email,
    phone: params.user.hp,
    city: params.profile.kota,
    province: params.profile.provinsi,
    status: params.status,
    readinessLevel: assessment.level,
    readinessScore: assessment.skorTotal,
    submittedAt: params.submittedAt,
    lastUpdatedAt: timeline.at(-1)?.tanggal ?? params.submittedAt,
    aiSummary: aiDraft,
    aiDraft,
    rawAnswers: params.answers,
    assessment,
    profile: params.profile,
    documents: params.documents ?? MOCK_DOCUMENTS,
    dimensions: buildDimensions(params.id, params.answers, assessment, params.profile),
    timeline,
    auditTrail: [
      buildAudit(
        "Pengajuan masuk ke dashboard officer",
        PETUGAS[0].nama,
        `Data awal dari ${params.user.nama} diterima untuk ditinjau.`,
      ),
    ],
    precheckFindings: params.precheckFindings,
    internalNotes: params.internalNotes,
  };
}

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: "off-001",
    nama: PETUGAS[0].nama,
    email: "ahmad.fauzi@beacukai.go.id",
    role: "officer",
    jabatan: PETUGAS[0].jabatan,
    aktif: true,
    lastLoginAt: "2026-08-29T08:10:00.000Z",
  },
  {
    id: "off-002",
    nama: PETUGAS[1].nama,
    email: "retno.wulandari@beacukai.go.id",
    role: "officer",
    jabatan: PETUGAS[1].jabatan,
    aktif: true,
    lastLoginAt: "2026-08-28T14:40:00.000Z",
  },
  {
    id: "sup-001",
    nama: "Dewi Lestari",
    email: "dewi.lestari@beacukai.go.id",
    role: "super_admin",
    jabatan: "Super Admin Sistem",
    aktif: true,
    lastLoginAt: "2026-08-29T07:55:00.000Z",
  },
];

export const ADMIN_CREDENTIALS = [
  { email: "ahmad.fauzi@beacukai.go.id", password: "admin123", role: "officer" as const },
  { email: "retno.wulandari@beacukai.go.id", password: "admin123", role: "officer" as const },
  { email: "dewi.lestari@beacukai.go.id", password: "super123", role: "super_admin" as const },
];

export const ADMIN_CASES: ApplicationCase[] = [
  createCase({
    id: "case-kopi-merapi",
    user: DEMO_USER,
    profile: DEMO_PROFILE,
    answers: DEMO_ANSWERS,
    submittedAt: "2026-08-26T04:00:00.000Z",
    status: "direview",
    timeline: MOCK_TIMELINE,
    documents: MOCK_DOCUMENTS,
    precheckFindings: [
      {
        documentId: "doc-invoice",
        documentName: "Commercial Invoice",
        field: "Nilai barang",
        issue: "Nilai total belum konsisten dengan packing list pada draft terakhir.",
        severity: "warning",
      },
      {
        documentId: "doc-packing",
        documentName: "Packing List",
        field: "Jumlah karton",
        issue: "Jumlah karton belum diisi pada versi unggahan saat ini.",
        severity: "critical",
      },
    ],
    internalNotes: ["Buyer menunggu revisi dokumen komersial sebelum PO final."],
  }),
  createCase({
    id: "case-rotan-solo",
    user: {
      nama: "Budi Hartono",
      email: "budi@rotansolo.id",
      hp: "0812-7788-2200",
    },
    profile: {
      namaUsaha: "Rotan Solo Lestari",
      kota: "Sukoharjo",
      provinsi: "Jawa Tengah",
      tahunBerdiri: "2017",
      kategoriId: "furniture",
      nomorNib: "812250013455",
      nomorNpwp: "12.345.678.9-012.000",
    },
    answers: {
      ...DEMO_ANSWERS,
      p2_6: "b",
      p4_4: "b",
      p8_3: "c",
    },
    submittedAt: "2026-08-27T02:30:00.000Z",
    status: "baru",
    timeline: [
      {
        id: "tl-rotan-1",
        kind: "asesmen",
        judul: "Asesmen baru masuk",
        detail: "Skor awal 58 dari 100 dengan gap besar pada SVLK dan SOP mutu.",
        tanggal: "2026-08-27T02:30:00.000Z",
        aktor: "Budi Hartono",
      },
      ...MOCK_TIMELINE,
    ],
    internalNotes: ["Perlu konfirmasi SVLK dari pemasok utama."],
  }),
  createCase({
    id: "case-pangan-mandiri",
    user: {
      nama: "Nina Wulandari",
      email: "nina@panganmandiri.id",
      hp: "0813-4000-9000",
    },
    profile: {
      namaUsaha: "Pangan Mandiri Sejahtera",
      kota: "Klaten",
      provinsi: "Jawa Tengah",
      tahunBerdiri: "2020",
      kategoriId: "pangan",
      nomorNib: "812250091144",
      nomorNpwp: "11.222.333.4-555.000",
    },
    answers: {
      ...DEMO_ANSWERS,
      p2_4: ["a", "b", "c"],
      p3_2: "b",
      p5_1: "c",
      p7_1: "a",
      p8_4: "a",
    },
    submittedAt: "2026-08-25T09:20:00.000Z",
    status: "disetujui",
    timeline: [
      {
        id: "tl-pangan-1",
        kind: "asesmen",
        judul: "Asesmen awal selesai",
        detail: "Skor 71 dari 100 — Level 4, Hampir Siap.",
        tanggal: "2026-08-25T09:20:00.000Z",
        aktor: "Nina Wulandari",
      },
      {
        id: "tl-pangan-2",
        kind: "officer",
        judul: "Draf rekomendasi disetujui officer",
        detail: "Seluruh dimensi utama layak diteruskan ke UMKM tanpa koreksi besar.",
        tanggal: "2026-08-28T05:10:00.000Z",
        aktor: "Ahmad Fauzi",
      },
    ],
    internalNotes: ["Prioritas approval karena dokumen inti sudah lengkap."],
  }),
  createCase({
    id: "case-kosmetik-mulia",
    user: {
      nama: "Sinta Rahma",
      email: "sinta@muliabeauty.id",
      hp: "0812-9900-4400",
    },
    profile: {
      namaUsaha: "Mulia Beauty Lab",
      kota: "Surakarta",
      provinsi: "Jawa Tengah",
      tahunBerdiri: "2021",
      kategoriId: "kosmetik",
      nomorNib: "812250022900",
      nomorNpwp: "22.333.444.5-666.000",
    },
    answers: {
      ...DEMO_ANSWERS,
      p2_4: ["z"],
      p3_1: "c",
      p3_2: "e",
      p6_3: "c",
    },
    submittedAt: "2026-08-28T03:05:00.000Z",
    status: "membutuhkan_info",
    timeline: [
      {
        id: "tl-kosmetik-1",
        kind: "asesmen",
        judul: "Asesmen diselesaikan",
        detail: "Skor 49 dari 100 — Level 2, Tahap Awal.",
        tanggal: "2026-08-28T03:05:00.000Z",
        aktor: "Sinta Rahma",
      },
      {
        id: "tl-kosmetik-2",
        kind: "officer",
        judul: "Permintaan info tambahan dikirim",
        detail: "Officer meminta komposisi dan foto kemasan untuk verifikasi Lartas.",
        tanggal: "2026-08-29T01:10:00.000Z",
        aktor: "Retno Wulandari",
      },
    ],
    internalNotes: ["Perlu komposisi lengkap dan file label produk."],
  }),
  createCase({
    id: "case-herbal-bumi",
    user: {
      nama: "Agus Prasetyo",
      email: "agus@bumiherbal.id",
      hp: "0813-7070-2201",
    },
    profile: {
      namaUsaha: "Bumi Herbal Nusantara",
      kota: "Karanganyar",
      provinsi: "Jawa Tengah",
      tahunBerdiri: "2018",
      kategoriId: "herbal",
      nomorNib: "812250090900",
      nomorNpwp: "33.444.555.6-777.000",
    },
    answers: {
      ...DEMO_ANSWERS,
      p1_4: "c",
      p4_1: "c",
      p5_2: "c",
      p7_3: "c",
    },
    submittedAt: "2026-08-29T01:05:00.000Z",
    status: "baru",
    timeline: [
      {
        id: "tl-herbal-1",
        kind: "asesmen",
        judul: "Asesmen baru dibuat",
        detail: "Skor 62 dari 100 — fokus pada kepabeanan dan pemasaran.",
        tanggal: "2026-08-29T01:05:00.000Z",
        aktor: "Agus Prasetyo",
      },
    ],
    internalNotes: ["Menunggu giliran review officer."],
  }),
];

export function summarizeCases(cases: ApplicationCase[]) {
  const total = cases.length;
  const baru = cases.filter((item) => item.status === "baru").length;
  const direview = cases.filter((item) => item.status === "direview").length;
  const disetujui = cases.filter((item) => item.status === "disetujui").length;
  const membutuhkanInfo = cases.filter((item) => item.status === "membutuhkan_info").length;

  return { total, baru, direview, disetujui, membutuhkanInfo };
}

export function readinessBuckets(cases: ApplicationCase[]) {
  const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;

  for (const item of cases) buckets[item.readinessLevel] += 1;

  return buckets;
}

export function levelLabel(level: number) {
  return LEVELS[level as keyof typeof LEVELS]?.nama ?? `Level ${level}`;
}
