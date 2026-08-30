import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'file-testing-pdf');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function escapePdfText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfString(judul, baris) {
  const lines = [judul, "", ...baris];
  const content =
    "BT\n/F1 16 Tf\n40 780 Td\n18 TL\n" +
    lines
      .map((line, index) =>
        index === 0
          ? `(${escapePdfText(line)}) Tj`
          : `T* (${escapePdfText(line)}) Tj`
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
  const offsets = [];
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

  return pdf;
}

// 1. NIB
const nibPdf = buildPdfString("NOMOR INDUK BERUSAHA (NIB)", [
  "NIB: 1234567890123",
  "Nama Pelaku Usaha: PT TESTING SUKSES MAKMUR",
  "Alamat: Jl. Merdeka No 123",
  "KBLI: 46100",
  "Status Perizinan: Berizin / Aktif"
]);
fs.writeFileSync(path.join(outDir, 'dummy-nib.pdf'), Buffer.from(nibPdf, 'latin1'));

// 2. NPWP
const npwpPdf = buildPdfString("KARTU NOMOR POKOK WAJIB PAJAK (NPWP)", [
  "NPWP",
  "99.888.777.6-555.444",
  "Nama: PT TESTING SUKSES MAKMUR",
  "Alamat: Jl. Merdeka No 123, Jakarta",
  "Terdaftar di: KPP Pratama Jakarta Pusat"
]);
fs.writeFileSync(path.join(outDir, 'dummy-npwp.pdf'), Buffer.from(npwpPdf, 'latin1'));

// 3. Commercial Invoice
const invPdf = buildPdfString("COMMERCIAL INVOICE", [
  "Invoice No: INV-2026-001",
  "Date: 30 Aug 2026",
  "Shipper / Exporter: PT TESTING SUKSES MAKMUR",
  "Consignee / Buyer: GLOBAL IMPORTS LLC",
  "Description of Goods: Rattan Furniture",
  "HS Code: 4602.19.00",
  "Total Value: USD 15,000",
  "Incoterms: FOB Jakarta",
  "Authorized Signature: [TTD/Cap]"
]);
fs.writeFileSync(path.join(outDir, 'dummy-invoice.pdf'), Buffer.from(invPdf, 'latin1'));

// 4. Packing List
const packPdf = buildPdfString("PACKING LIST", [
  "Packing List No: PL-2026-001",
  "Date: 30 Aug 2026",
  "Shipper: PT TESTING SUKSES MAKMUR",
  "Consignee: GLOBAL IMPORTS LLC",
  "Total Quantity: 150 Cartons",
  "Gross Weight: 2500 KG",
  "Net Weight: 2300 KG",
  "Volume: 12 CBM"
]);
fs.writeFileSync(path.join(outDir, 'dummy-packing-list.pdf'), Buffer.from(packPdf, 'latin1'));

// 5. PEB
const pebPdf = buildPdfString("PEMBERITAHUAN EKSPOR BARANG (PEB)", [
  "Nomor PEB: PEB/2026/08/9991",
  "Tanggal: 30 Aug 2026",
  "Kantor Pabean: KPU Tanjung Priok",
  "Eksportir: PT TESTING SUKSES MAKMUR",
  "NPWP: 99.888.777.6-555.444",
  "Penerima: GLOBAL IMPORTS LLC",
  "HS Code: 4602.19.00",
  "Nilai FOB: USD 15,000",
  "Nomor Container: TGHU1234567",
  "Status: Nota Pelayanan Ekspor (NPE) Diterbitkan"
]);
fs.writeFileSync(path.join(outDir, 'dummy-peb.pdf'), Buffer.from(pebPdf, 'latin1'));

// 6. SKA
const skaPdf = buildPdfString("SERTIFIKAT KETERANGAN ASAL (SKA) / CERTIFICATE OF ORIGIN", [
  "Reference No: SKA-2026-ID-001",
  "Exporter / Produsen: PT TESTING SUKSES MAKMUR",
  "Consignee / Importer: GLOBAL IMPORTS LLC",
  "Country of Destination: United States",
  "Description of Goods: Rattan Furniture",
  "HS Code: 4602.19.00",
  "Origin Criterion: Wholly Obtained (WO)",
  "Authorized Signature / Instansi Penerbit: Kementerian Perdagangan RI"
]);
fs.writeFileSync(path.join(outDir, 'dummy-ska.pdf'), Buffer.from(skaPdf, 'latin1'));

console.log('Dummy PDFs generated in file-testing-pdf/');
