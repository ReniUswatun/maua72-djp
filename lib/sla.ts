/* ------------------------------------------------------------------ *
 * SLA / aging indicator (fitur D2)
 *
 * Pengajuan yang menunggu tindakan officer lebih dari ambang hari akan
 * ditandai. Berguna untuk instansi dengan kapasitas review terbatas.
 * ------------------------------------------------------------------ */

import type { ApplicationCase, ReviewStage } from "./types";

/** Ambang hari sebelum sebuah pengajuan dianggap terlambat direview. */
export const SLA_LIMIT_DAYS = 3;
export const SLA_WARN_DAYS = 2;

/** Status yang masih "menunggu" tindakan officer. */
const WAITING_STATUSES: ReviewStage[] = ["baru", "direview", "membutuhkan_info"];

export type SlaLevel = "aman" | "mendekati" | "terlambat" | "selesai";

export interface SlaInfo {
  level: SlaLevel;
  days: number;
  label: string;
}

export function daysBetween(from: string, to: Date = new Date()): number {
  const start = new Date(from).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((to.getTime() - start) / 86_400_000));
}

export function slaInfo(caseItem: ApplicationCase, now: Date = new Date()): SlaInfo {
  if (!WAITING_STATUSES.includes(caseItem.status)) {
    return { level: "selesai", days: 0, label: "Selesai diproses" };
  }

  const days = daysBetween(caseItem.submittedAt, now);

  if (days >= SLA_LIMIT_DAYS) {
    return { level: "terlambat", days, label: `Terlambat · ${days} hari menunggu` };
  }
  if (days >= SLA_WARN_DAYS) {
    return { level: "mendekati", days, label: `Mendekati batas · ${days} hari` };
  }
  return { level: "aman", days, label: `${days} hari menunggu` };
}

export function slaTone(level: SlaLevel): "success" | "warning" | "danger" | "neutral" {
  if (level === "terlambat") return "danger";
  if (level === "mendekati") return "warning";
  if (level === "aman") return "success";
  return "neutral";
}

export function countOverdue(cases: ApplicationCase[], now: Date = new Date()): number {
  return cases.filter((item) => slaInfo(item, now).level === "terlambat").length;
}
