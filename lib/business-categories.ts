import type { BusinessCategory } from "./types";

/**
 * Kategori bisnis UMKM (blueprint §6).
 * `traits` menentukan pertanyaan bercabang yang muncul di asesmen —
 * inilah mekanisme "assessment membedakan situasi" (rubrik 25%).
 */
export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: "fnb", label: "Makanan & Minuman (F&B)", traits: ["pangan"] },
  { id: "kopi", label: "Kopi, Teh & Rempah", traits: ["pangan", "hayati"] },
  { id: "handicraft", label: "Kerajinan Tangan & Handicraft", traits: ["kayu"] },
  { id: "fashion", label: "Fashion, Tekstil & Batik", traits: ["tekstil"] },
  { id: "furniture", label: "Furniture & Dekorasi Rumah", traits: ["kayu"] },
  { id: "kosmetik", label: "Kosmetik & Perawatan Tubuh", traits: ["kosmetik"] },
  { id: "herbal", label: "Produk Herbal & Jamu Tradisional", traits: ["herbal", "pangan"] },
  { id: "pertanian", label: "Hasil Pertanian & Perkebunan", traits: ["hayati", "pangan"] },
  { id: "perikanan", label: "Hasil Perikanan & Kelautan", traits: ["hayati", "pangan"] },
  { id: "perhiasan", label: "Aksesoris & Perhiasan", traits: [] },
  { id: "kayu", label: "Produk Kayu & Rotan", traits: ["kayu"] },
  { id: "alkes", label: "Alat Kesehatan / Medical Supplies", traits: ["kosmetik"] },
  { id: "digital", label: "Produk Digital / Software / IP", traits: ["digital"] },
  { id: "lainnya", label: "Lainnya", traits: [] },
];

export function getCategory(id: string | undefined) {
  return BUSINESS_CATEGORIES.find((c) => c.id === id);
}

export function categoryLabel(id: string | undefined, lainnya?: string) {
  if (id === "lainnya" && lainnya) return lainnya;
  return getCategory(id)?.label ?? "Belum dipilih";
}

export const PROVINSI = [
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Jawa Barat",
  "DKI Jakarta",
  "Banten",
  "Bali",
  "Sumatera Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Lampung",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Sulawesi Selatan",
  "Nusa Tenggara Barat",
  "Lainnya",
];

export const NEGARA_TUJUAN = [
  "Amerika Serikat",
  "Jepang",
  "Tiongkok",
  "Singapura",
  "Malaysia",
  "Korea Selatan",
  "Australia",
  "Belanda",
  "Jerman",
  "Uni Emirat Arab",
  "Arab Saudi",
  "India",
  "Lainnya",
];
