import type { Article } from "./types";

export const KATEGORI_PANDUAN = [
  "Semua",
  "Legalitas",
  "HS Code",
  "Dokumen PEB",
  "Lartas",
  "Fasilitas Bea Cukai",
  "Logistik",
  "Pembayaran",
  "Sertifikasi",
];

export const ARTICLES: Article[] = [
  {
    slug: "memulai-ekspor-dari-nol",
    judul: "Memulai Ekspor dari Nol: Urutan Langkah yang Masuk Akal",
    kategori: "Legalitas",
    ringkas:
      "Peta jalan sederhana dari usaha rumahan sampai pengiriman pertama, disusun berdasarkan urutan yang paling sedikit membuang waktu.",
    bacaMenit: 6,
    istilahTerkait: ["NIB", "NPWP", "HS Code", "PEB"],
    isi: [
      {
        heading: "Kesalahan urutan adalah pemborosan terbesar",
        paragraf: [
          "Banyak pelaku usaha memulai dari mencari pembeli, lalu panik ketika pesanan datang dan ternyata legalitas belum siap. Urutan yang lebih aman adalah membereskan fondasi lebih dulu, karena hampir semua langkah berikutnya bergantung padanya.",
          "Fondasi itu terdiri dari tiga hal: identitas usaha yang sah, kejelasan produk yang akan dijual, dan pemahaman dasar tentang dokumen ekspor.",
        ],
      },
      {
        heading: "Enam langkah pertama",
        paragraf: [
          "Urutan di bawah ini bisa Anda kerjakan berurutan tanpa harus menunggu satu selesai sempurna.",
        ],
        list: [
          "Urus NIB melalui OSS. Gratis, online, dan menjadi syarat semua langkah berikutnya.",
          "Pastikan NPWP dan status badan usaha sudah tercatat rapi.",
          "Tentukan satu produk unggulan yang akan diekspor lebih dulu.",
          "Konsultasikan HS Code produk tersebut ke Klinik Ekspor Bea Cukai.",
          "Cek status Lartas dan persyaratan negara tujuan berdasarkan HS Code itu.",
          "Baru setelah itu, aktif mencari pembeli dengan penawaran yang sudah bisa Anda pertanggungjawabkan.",
        ],
      },
      {
        heading: "Mulai dari kiriman kecil",
        paragraf: [
          "Ekspor tidak harus dimulai dengan satu kontainer penuh. Pengiriman lewat pos atau kurir internasional dalam jumlah kecil tetap tercatat sebagai ekspor, dan menjadi cara belajar yang jauh lebih murah dibanding langsung bermain di volume besar.",
          "Pengiriman perdana yang kecil memberi Anda pengalaman nyata mengurus dokumen, menghitung ongkos, dan melihat bagaimana produk Anda bertahan dalam perjalanan.",
        ],
      },
    ],
  },
  {
    slug: "memahami-hs-code",
    judul: "Memahami HS Code: Satu Kode yang Menentukan Segalanya",
    kategori: "HS Code",
    ringkas:
      "Kenapa satu deret angka bisa menentukan tarif, izin, dan dokumen yang harus Anda siapkan.",
    bacaMenit: 5,
    istilahTerkait: ["HS Code", "Lartas", "SKA"],
    isi: [
      {
        heading: "Apa itu HS Code",
        paragraf: [
          "HS Code adalah sistem klasifikasi barang yang dipakai hampir seluruh negara. Setiap barang punya kode, dan kode itulah yang dibaca petugas bea cukai di negara mana pun untuk memahami barang apa yang Anda kirim.",
          "Karena dipakai secara internasional, HS Code menjadi bahasa bersama antara Anda, pembeli, forwarder, dan otoritas kepabeanan kedua negara.",
        ],
      },
      {
        heading: "Yang ditentukan oleh HS Code",
        paragraf: ["Kode ini bukan sekadar administrasi. Ia menentukan:"],
        list: [
          "Tarif bea masuk yang harus dibayar pembeli Anda di negara tujuan.",
          "Apakah produk Anda termasuk dalam daftar larangan dan pembatasan.",
          "Dokumen dan sertifikat tambahan yang diminta, misalnya sertifikat karantina.",
          "Apakah pembeli bisa memakai tarif preferensi lewat perjanjian dagang.",
        ],
      },
      {
        heading: "Perbedaan tipis yang mengubah kode",
        paragraf: [
          "Tingkat pengolahan sering menjadi pembeda. Biji kopi hijau, biji kopi sangrai, dan kopi bubuk berada pada pos tarif yang berbeda meski berasal dari bahan yang sama.",
          "Begitu pula produk kayu: barang setengah jadi dan produk furnitur jadi diperlakukan berbeda. Karena itu, deskripsi produk yang Anda bawa saat konsultasi harus sedetail mungkin.",
        ],
      },
      {
        heading: "Cara memastikannya",
        paragraf: [
          "Jangan menebak. Bawa deskripsi produk, foto, komposisi, dan proses produksi ke Klinik Ekspor Bea Cukai. Konsultasi ini tidak dipungut biaya dan hasilnya bisa Anda pakai sebagai acuan di semua dokumen berikutnya.",
        ],
      },
    ],
  },
  {
    slug: "alur-peb-sampai-npe",
    judul: "Alur PEB sampai NPE: Apa yang Terjadi Sebelum Barang Berangkat",
    kategori: "Dokumen PEB",
    ringkas:
      "Rangkaian dokumen dari pengajuan pemberitahuan ekspor hingga barang boleh dimuat ke kapal.",
    bacaMenit: 7,
    istilahTerkait: ["PEB", "NPE", "CEISA", "PPJK", "B/L"],
    isi: [
      {
        heading: "PEB adalah pemberitahuan, bukan permohonan izin",
        paragraf: [
          "Melalui PEB, Anda memberitahukan kepada Bea Cukai barang apa yang akan diekspor, berapa nilainya, ke mana tujuannya, dan dengan cara apa dikirim. Dokumen ini diajukan lewat portal CEISA sebelum barang dimuat.",
          "Karena sifatnya pemberitahuan, kebenaran data sepenuhnya menjadi tanggung jawab Anda sebagai eksportir — termasuk ketika pengurusannya diserahkan kepada PPJK.",
        ],
      },
      {
        heading: "Dokumen yang harus konsisten satu sama lain",
        paragraf: [
          "Penyebab paling umum tertahannya barang bukanlah dokumen yang kurang, melainkan angka yang tidak cocok antar dokumen.",
        ],
        list: [
          "Commercial Invoice — nilai transaksi dan syarat penyerahan barang.",
          "Packing List — jumlah, berat, dan dimensi tiap kemasan.",
          "Dokumen izin bila produk termasuk Lartas.",
          "Bukti pemesanan angkutan dari pelayaran atau maskapai.",
        ],
      },
      {
        heading: "Setelah PEB diterima",
        paragraf: [
          "Bila data lengkap dan tidak ada penolakan, Bea Cukai menerbitkan NPE. Dokumen inilah yang menjadi izin agar barang Anda boleh masuk kawasan pabean dan dimuat ke sarana pengangkut.",
          "Setelah barang berangkat, pihak pelayaran menerbitkan Bill of Lading, atau Airway Bill untuk pengiriman udara. Dokumen ini yang biasanya diminta pembeli untuk menebus barang di negara tujuan.",
        ],
      },
      {
        heading: "Simpan arsipnya",
        paragraf: [
          "Seluruh dokumen ekspor sebaiknya diarsipkan rapi. Selain untuk kebutuhan pelaporan, arsip ini menjadi bukti kinerja ekspor yang berguna saat mengajukan pembiayaan atau fasilitas kepabeanan.",
        ],
      },
    ],
  },
  {
    slug: "lartas-dan-izin-tambahan",
    judul: "Lartas: Kapan Produk Anda Butuh Izin Tambahan",
    kategori: "Lartas",
    ringkas:
      "Cara mengecek apakah produk Anda dibatasi ekspornya, dan apa yang harus dilakukan bila iya.",
    bacaMenit: 5,
    istilahTerkait: ["Lartas", "HS Code"],
    isi: [
      {
        heading: "Lartas bukan berarti dilarang",
        paragraf: [
          "Sebagian besar produk yang masuk kategori Lartas sebenarnya tetap boleh diekspor, hanya saja memerlukan izin dari kementerian atau lembaga teknis terkait. Yang berbahaya adalah tidak mengetahuinya sejak awal.",
        ],
      },
      {
        heading: "Produk yang sering terkena",
        paragraf: [
          "Beberapa kelompok produk yang umum diekspor UMKM memiliki persyaratan tambahan:",
        ],
        list: [
          "Produk kayu dan rotan — memerlukan bukti legalitas kayu.",
          "Hasil perikanan dan pertanian — memerlukan sertifikat karantina.",
          "Produk pangan olahan — memerlukan izin edar dan kadang sertifikat kesehatan.",
          "Produk yang mengandung bahan dari satwa atau tumbuhan yang dilindungi.",
        ],
      },
      {
        heading: "Kapan harus mengeceknya",
        paragraf: [
          "Sebelum menandatangani kontrak, bukan sesudahnya. Waktu pengurusan izin bisa berminggu-minggu, dan pembeli jarang mau menunggu tanpa kepastian.",
          "Pengecekan dilakukan berdasarkan HS Code, sehingga langkah ini selalu datang setelah kode produk Anda dipastikan.",
        ],
      },
    ],
  },
  {
    slug: "fasilitas-kepabeanan-umkm",
    judul: "Fasilitas Kepabeanan yang Bisa Dimanfaatkan UMKM",
    kategori: "Fasilitas Bea Cukai",
    ringkas:
      "Dari Klinik Ekspor sampai KITE IKM — layanan yang tersedia dan sering belum dimanfaatkan.",
    bacaMenit: 6,
    istilahTerkait: ["KITE IKM", "PPJK"],
    isi: [
      {
        heading: "Klinik Ekspor",
        paragraf: [
          "Layanan konsultasi gratis di kantor Bea dan Cukai. Anda bisa berkonsultasi tentang HS Code, status Lartas, dokumen yang perlu disiapkan, sampai simulasi pengisian PEB.",
          "Untuk banyak UMKM, satu sesi konsultasi menyelesaikan kebingungan yang sudah tertunda berbulan-bulan.",
        ],
      },
      {
        heading: "KITE IKM",
        paragraf: [
          "Fasilitas pembebasan bea masuk dan pajak atas bahan baku impor yang diolah lalu diekspor kembali. Ditujukan khusus bagi industri kecil dan menengah agar harga produknya bersaing.",
          "Konsekuensinya, Anda harus punya pencatatan bahan baku yang rapi karena penggunaannya diawasi. Siapkan sistem pencatatan sebelum mengajukan.",
        ],
      },
      {
        heading: "Pusat Logistik Berikat dan kemudahan lain",
        paragraf: [
          "Selain KITE, tersedia skema lain seperti kawasan berikat dan pusat logistik berikat yang bisa relevan ketika volume usaha Anda tumbuh. Diskusikan kelayakannya dengan petugas saat skala usaha sudah mendekati syaratnya.",
        ],
      },
    ],
  },
  {
    slug: "memilih-incoterms",
    judul: "Memilih Incoterms: Keputusan Harga yang Sering Dianggap Istilah Dokumen",
    kategori: "Logistik",
    ringkas:
      "EXW, FOB, atau CIF — perbedaannya menentukan berapa besar biaya yang Anda tanggung.",
    bacaMenit: 5,
    istilahTerkait: ["Incoterms", "FOB", "CIF", "EXW", "Freight Forwarder"],
    isi: [
      {
        heading: "Yang sebenarnya diatur",
        paragraf: [
          "Incoterms menentukan sampai titik mana penjual menanggung biaya dan risiko. Ia tidak mengatur pembayaran atau kepemilikan barang, tetapi langsung memengaruhi struktur harga penawaran Anda.",
        ],
      },
      {
        heading: "Tiga yang paling sering dipakai",
        paragraf: [],
        list: [
          "EXW — pembeli mengambil dari gudang Anda. Paling ringan, tetapi nilai transaksinya paling kecil.",
          "FOB — Anda menanggung biaya sampai barang naik ke kapal di pelabuhan asal. Paling umum untuk eksportir Indonesia.",
          "CIF — Anda menanggung sampai pelabuhan tujuan, termasuk asuransi dan ongkos angkut. Harga lebih tinggi, tetapi risikonya lebih besar bila perhitungan Anda meleset.",
        ],
      },
      {
        heading: "Saran untuk pemula",
        paragraf: [
          "Mulailah dengan FOB. Anda hanya perlu menguasai biaya sampai pelabuhan sendiri, dan itu jauh lebih mudah dihitung dengan akurat dibanding ongkos angkut internasional yang fluktuatif.",
          "Apa pun pilihannya, cantumkan secara eksplisit di setiap penawaran dan invoice, lengkap dengan nama pelabuhannya.",
        ],
      },
    ],
  },
  {
    slug: "metode-pembayaran-ekspor",
    judul: "Metode Pembayaran Ekspor dan Cara Menghindari Gagal Bayar",
    kategori: "Pembayaran",
    ringkas:
      "L/C, T/T, atau lewat marketplace — mana yang sesuai untuk transaksi pertama Anda.",
    bacaMenit: 6,
    istilahTerkait: ["L/C", "T/T", "DHE"],
    isi: [
      {
        heading: "Risiko terbesar ada di transaksi pertama",
        paragraf: [
          "Dengan buyer yang belum dikenal, risiko terbesar bukan pada dokumen, melainkan pada pembayaran. Karena itu pemilihan metode pembayaran perlu dibicarakan sejak awal negosiasi, bukan setelah barang siap.",
        ],
      },
      {
        heading: "Pilihan yang tersedia",
        paragraf: [],
        list: [
          "T/T dengan uang muka — pembeli membayar sebagian di muka, sisanya sebelum dokumen dikirim. Sederhana dan paling umum untuk nilai kecil sampai menengah.",
          "L/C — bank pembeli menjamin pembayaran sepanjang dokumen Anda sesuai persyaratan. Aman untuk nilai besar, tetapi menuntut ketelitian dokumen dan berbiaya.",
          "Pembayaran lewat marketplace B2B — dana ditahan platform sampai barang diterima. Praktis untuk memulai, dengan potongan biaya platform.",
        ],
      },
      {
        heading: "Jangan lupakan DHE",
        paragraf: [
          "Hasil ekspor wajib dimasukkan ke sistem keuangan dalam negeri sesuai ketentuan Bank Indonesia. Diskusikan mekanismenya dengan bank tempat rekening valas Anda sejak transaksi pertama agar tidak menjadi masalah di kemudian hari.",
        ],
      },
    ],
  },
  {
    slug: "sertifikasi-produk-ekspor",
    judul: "Sertifikasi Produk: Mana yang Wajib, Mana yang Menambah Nilai",
    kategori: "Sertifikasi",
    ringkas:
      "Halal, BPOM, SNI, SVLK, karantina — memilah mana yang benar-benar dibutuhkan produk Anda.",
    bacaMenit: 7,
    istilahTerkait: ["BPJPH", "BPOM", "SNI", "SVLK", "PIRT"],
    isi: [
      {
        heading: "Wajib menurut siapa",
        paragraf: [
          "Sertifikat bisa diwajibkan oleh tiga pihak berbeda: pemerintah Indonesia sebagai negara asal, pemerintah negara tujuan, atau pembeli Anda sendiri. Ketiganya perlu dipetakan terpisah.",
          "Sertifikat yang diminta pembeli sering justru yang paling menentukan, karena tanpa itu pembicaraan tidak berlanjut ke soal harga.",
        ],
      },
      {
        heading: "Petakan sesuai kategori produk",
        paragraf: [],
        list: [
          "Pangan olahan — izin edar PIRT atau BPOM, sertifikat halal, dan kadang Health Certificate.",
          "Kosmetik dan perawatan tubuh — izin edar BPOM dan sertifikat halal untuk sebagian pasar.",
          "Produk kayu, rotan, dan furnitur — SVLK, terutama untuk pasar Uni Eropa.",
          "Hasil pertanian dan perikanan — sertifikat karantina dari otoritas yang berwenang.",
          "Semua kategori — SNI atau standar internasional sebagai bukti mutu yang menambah daya tawar.",
        ],
      },
      {
        heading: "Urutan pengurusan",
        paragraf: [
          "Dahulukan izin edar dalam negeri, karena banyak sertifikasi lain menjadikannya prasyarat. Setelah itu baru sertifikat halal atau standar mutu, lalu sertifikat khusus yang diminta pasar tujuan.",
          "Sertifikasi memakan waktu berminggu-minggu sampai berbulan-bulan. Mulailah paralel dengan pencarian pembeli, jangan menunggu ada pesanan.",
        ],
      },
    ],
  },
  {
    slug: "menyiapkan-kemasan-ekspor",
    judul: "Menyiapkan Kemasan dan Label untuk Pengiriman Internasional",
    kategori: "Logistik",
    ringkas:
      "Kemasan pasar lokal jarang sanggup menghadapi perjalanan laut berminggu-minggu.",
    bacaMenit: 4,
    istilahTerkait: ["Packing List"],
    isi: [
      {
        heading: "Dua fungsi yang harus dipenuhi bersamaan",
        paragraf: [
          "Kemasan ekspor harus melindungi barang secara fisik sekaligus menyampaikan informasi yang diminta otoritas negara tujuan. Kegagalan pada salah satunya bisa membuat barang rusak atau tertahan.",
        ],
      },
      {
        heading: "Informasi wajib pada label",
        paragraf: [],
        list: [
          "Nama produk dalam bahasa Inggris atau bahasa negara tujuan.",
          "Komposisi atau bahan, terutama untuk produk konsumsi.",
          "Berat bersih dan isi kemasan.",
          "Negara asal — dicantumkan sebagai Made in Indonesia.",
          "Nama dan alamat produsen.",
        ],
      },
      {
        heading: "Uji sebelum produksi massal",
        paragraf: [
          "Simulasikan perjalanan: tumpukan, guncangan, dan perubahan kelembapan. Satu pengujian sederhana jauh lebih murah dibanding satu kontainer produk yang rusak di tengah jalan.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
