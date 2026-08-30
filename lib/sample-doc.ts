/* ------------------------------------------------------------------ *
 * Generator PDF contoh — dipakai admin untuk melihat "isi" dokumen
 * yang diunggah UMKM pada prototipe (belum ada storage berkas nyata).
 *
 * Membuat PDF satu halaman yang valid (xref offset dihitung) berisi
 * judul, garis, beberapa baris teks, dan footer, lalu mengembalikannya
 * sebagai data URI.
 * ------------------------------------------------------------------ */

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // sederhanakan karakter non-ASCII agar aman di PDF Type1 Helvetica
    .replace(/[^\x20-\x7E]/g, "-");
}

/** Bangun PDF satu halaman dari judul + daftar baris teks. */
export function buildSamplePdf(judul: string, baris: string[], subjudul?: string): string {
  const bodyLines = baris.length ? baris : ["(tidak ada rincian)"];

  const parts: string[] = [];
  // Judul
  parts.push("0.11 0.13 0.20 rg");
  parts.push(`BT /F1 20 Tf 40 792 Td (${escapePdfText(judul)}) Tj ET`);
  if (subjudul) {
    parts.push("0.45 0.45 0.45 rg");
    parts.push(`BT /F1 10 Tf 40 776 Td (${escapePdfText(subjudul)}) Tj ET`);
  }
  // Garis pemisah
  parts.push("0.75 0.75 0.75 RG 0.8 w");
  parts.push(`40 ${subjudul ? 766 : 780} m 555 ${subjudul ? 766 : 780} l S`);
  // Isi
  parts.push("0.12 0.12 0.12 rg");
  parts.push(`BT /F1 11.5 Tf 40 ${subjudul ? 742 : 756} Td 17 TL`);
  bodyLines.forEach((line, index) => {
    parts.push(`${index === 0 ? "" : "T* "}(${escapePdfText(line)}) Tj`);
  });
  parts.push("ET");
  // Footer
  parts.push("0.55 0.55 0.55 rg");
  parts.push(
    `BT /F1 8 Tf 40 36 Td (Dokumen contoh - SiapEkspor - dibuat otomatis untuk prototipe) Tj ET`,
  );

  const content = parts.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return `data:application/pdf;base64,${btoa(unescape(encodeURIComponent(pdf)))}`;
}
