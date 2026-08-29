/* ------------------------------------------------------------------ *
 * Export laporan sederhana (fitur D8)
 * ------------------------------------------------------------------ */

function escapeCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const header = cols.map(escapeCell).join(",");
  const body = rows
    .map((row) => cols.map((col) => escapeCell(row[col])).join(","))
    .join("\n");
  // BOM agar Excel membaca UTF-8 dengan benar.
  return `﻿${header}\n${body}`;
}

export function downloadCsv(filename: string, csv: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}
