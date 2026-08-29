/* ------------------------------------------------------------------ *
 * Generator PDF contoh — dipakai admin untuk melihat "isi" dokumen
 * yang diunggah UMKM pada prototipe (belum ada storage berkas nyata).
 *
 * Membuat PDF satu halaman yang valid (xref offset dihitung) berisi
 * beberapa baris teks, lalu mengembalikannya sebagai data URI.
 * ------------------------------------------------------------------ */

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Bangun PDF satu halaman dari judul + daftar baris teks. */
export function buildSamplePdf(judul: string, baris: string[]): string {
  const lines = [judul, "", ...baris];
  const content =
    "BT\n/F1 16 Tf\n40 780 Td\n18 TL\n" +
    lines
      .map((line, index) =>
        index === 0
          ? `(${escapePdfText(line)}) Tj`
          : `T* (${escapePdfText(line)}) Tj`,
      )
      .join("\n") +
    "\nET";

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
