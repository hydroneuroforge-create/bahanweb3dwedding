/* =========================================================================
   NASKAH SINEMATIK — Syaif & Sasti
   -------------------------------------------------------------------------
   File ini mengatur SELURUH alur perjalanan 3D:
     - WAKTU  : suasana langit/kabut/cahaya (fajar, pagi, senja, malam, …)
     - BAB    : daftar adegan berurutan. Tiap bab punya latar, lapisan,
                gerak kamera, efek, suara, dan transisi ke bab berikutnya.
     - GALERI : foto yang melayang di bab galeri
     - DATA   : tanggal, maps, kalender, penyimpanan ucapan

   Teks yang tampil (nama, ayat, acara, dll.) ada di index.html, di dalam
   <section class="bab" data-bab="ID"> yang ID-nya sama dengan BAB di sini.

   SATUAN & KOORDINAT
   - "durasi" bab dihitung dalam satuan gulir (1 satuan ≈ satu kali usap layar).
   - "t" adalah waktu lokal bab: 0 = awal bab, 1 = akhir bab.
   - Koordinat lapisan & kamera bersifat lokal terhadap bab:
       x: kiri(-)/kanan(+),  y: bawah(-)/atas(+),  z: jauh(-)/dekat(+).
     Latar diletakkan di z = -40. Kamera biasanya di z antara +14 dan -8.
   - Kamera bisa ditulis dengan:
       { t, pos:[x,y,z], lihat:[x,y,z] }               -> koordinat langsung
       { t, uv:[u,v], jarak, geser:[dx,dy] }           -> melihat titik (u,v)
         pada gambar latar (u: 0 kiri..1 kanan, v: 0 atas..1 bawah) dari jarak tertentu.
   Lihat AGENTS.md bagian "Versi sinematik" sebelum mengubah.
   ========================================================================= */

export const SUSUNAN = {
  jarakBab: 150,      // jarak antar bab di ruang 3D
  lebarTransisi: 0.5, // panjang transisi antar bab (satuan gulir, di tiap sisi batas)
  fov: 45,
  satuanGulir: 0.85   // 1 satuan = 0.85 × tinggi layar
};

/* === ASET ===
   Latar: gambar 16:9 atau 9:16 + peta kedalaman (_depth) dari tools/prepare_scene_assets.py */
const S = 'assets/scenes/';
export const LATAR = {
  gerbang:          { src: S + 'gerbang.webp',          depth: S + 'gerbang_depth.webp' },
  istanaKabut:      { src: S + 'istana_kabut.webp',     depth: S + 'istana_kabut_depth.webp' },
  ruangEmas:        { src: S + 'ruang_emas.webp',       depth: S + 'ruang_emas_depth.webp' },
  pendopoMempelai:  { src: S + 'pendopo_mempelai.webp', depth: S + 'pendopo_mempelai_depth.webp' },
  pendopoTaman:     { src: S + 'pendopo_taman.webp',    depth: S + 'pendopo_taman_depth.webp' }
};

export const POTONGAN = {
  gerbangKiri:   'assets/images/gate_left.webp',
  gerbangKanan:  'assets/images/gate_right.webp',
  mempelaiMerah: S + 'c_mempelai_merah.webp',
  mempelaiNavy:  S + 'c_mempelai_navy.webp'
};

export const SUARA = {
  musik: [
    { src: 'assets/audio/gamelan-kraton.mp3', type: 'audio/mpeg' },
    { src: 'assets/audio/gamelan-kraton.ogg', type: 'audio/ogg' }
  ],
  gong: 'assets/audio/sfx/gong.mp3',
  suasana: {
    burung: 'assets/audio/sfx/amb-burung.mp3',
    air: 'assets/audio/sfx/amb-air.mp3',
    jangkrik: 'assets/audio/sfx/amb-jangkrik.mp3'
  }
};

/* === SUASANA WAKTU ===
   Warna dalam hex sRGB. "matahari" = arah [x,y,z]. Nilai di-campur halus saat transisi. */
export const WAKTU = {
  fajarEmas: {
    langitAtas: '#D9B48F', cakrawala: '#FFE3B0', bawah: '#E9C49A',
    matahari: [-0.55, 0.18, -1], warnaMatahari: '#FFE6B0', besarMatahari: 0.55,
    kabut: '#F1D3AC', kepadatanKabut: 0.0055, awan: 0.55, warnaAwan: '#FFF0D8',
    bintang: 0, bloom: 0.5, eksposur: 1.0
  },
  pagi: {
    langitAtas: '#B9B6DA', cakrawala: '#FAE0D3', bawah: '#EFD4C8',
    matahari: [0.45, 0.22, -1], warnaMatahari: '#FFF0DA', besarMatahari: 0.45,
    kabut: '#F2E0DA', kepadatanKabut: 0.0065, awan: 0.6, warnaAwan: '#FFFFFF',
    bintang: 0, bloom: 0.42, eksposur: 1.0
  },
  siangHangat: {
    langitAtas: '#6FA6DE', cakrawala: '#FFE6C0', bawah: '#F6D2A6',
    matahari: [0.25, 0.32, -1], warnaMatahari: '#FFF4DD', besarMatahari: 0.6,
    kabut: '#F6E2C8', kepadatanKabut: 0.0035, awan: 0.9, warnaAwan: '#FFF9F0',
    bintang: 0, bloom: 0.5, eksposur: 1.02
  },
  emasDalam: {
    langitAtas: '#7A4A2E', cakrawala: '#F0CF9C', bawah: '#6B3A26',
    matahari: [0, 0.3, -1], warnaMatahari: '#FFE2A8', besarMatahari: 0.0,
    kabut: '#EBCB9C', kepadatanKabut: 0.004, awan: 0.0, warnaAwan: '#FFF0D8',
    bintang: 0, bloom: 0.48, eksposur: 1.0
  },
  emasSore: {
    langitAtas: '#D49260', cakrawala: '#FFD392', bawah: '#B8703F',
    matahari: [0.6, 0.1, -1], warnaMatahari: '#FFD08A', besarMatahari: 0.5,
    kabut: '#F0C48E', kepadatanKabut: 0.0045, awan: 0.5, warnaAwan: '#FFE0B8',
    bintang: 0, bloom: 0.55, eksposur: 1.0
  },
  senja: {
    langitAtas: '#3A2D6A', cakrawala: '#FF9E6E', bawah: '#7C3F5E',
    matahari: [0, 0.035, -1], warnaMatahari: '#FFB27A', besarMatahari: 1.0,
    kabut: '#D98C7C', kepadatanKabut: 0.004, awan: 0.75, warnaAwan: '#FFB79C',
    bintang: 0.18, bloom: 0.72, eksposur: 1.0
  },
  senjaUngu: {
    langitAtas: '#231B4C', cakrawala: '#C46F80', bawah: '#382144',
    matahari: [-0.35, -0.02, -1], warnaMatahari: '#FF8F6C', besarMatahari: 0.8,
    kabut: '#6D4565', kepadatanKabut: 0.006, awan: 0.4, warnaAwan: '#B6749B',
    bintang: 0.5, bloom: 0.85, eksposur: 1.0
  },
  malam: {
    langitAtas: '#050A22', cakrawala: '#232A5E', bawah: '#090D24',
    matahari: [0.35, 0.55, -1], warnaMatahari: '#DCE6FF', besarMatahari: 0.12,
    kabut: '#181D44', kepadatanKabut: 0.0055, awan: 0.18, warnaAwan: '#3A4382',
    bintang: 1, bloom: 1.0, eksposur: 1.0
  }
};

/* Pewarnaan ulang gambar latar (untuk memakai gambar yang sama di waktu berbeda) */
const NORMAL = { tint: [1, 1, 1], lift: [0, 0, 0], saturasi: 1 };
const SENJA = { tint: [0.66, 0.56, 0.82], lift: [0.05, 0.0, 0.05], saturasi: 0.85 };
const MALAM = { tint: [0.3, 0.35, 0.66], lift: [0.0, 0.01, 0.045], saturasi: 0.7 };

/* === DAFTAR BAB ===
   efek  : tingkat 0..1 tiap efek (kelopak, kilau, kunang, lampion, burung, kembangApi)
   suara : volume suasana 0..1 (burung, air, jangkrik)
   transisi: cara berpindah ke bab berikutnya
     jenis 'kabut'  = awan lembut menutup layar
     jenis 'cahaya' = kilatan cahaya keemasan
     jenis 'malam'  = gelap perlahan */
export const BAB = [
  {
    id: 'gerbang', judul: 'Gerbang Keraton', durasi: 2.4, waktu: 'fajarEmas',
    latar: { gambar: 'gerbang', z: -40, tinggi: 46, kedalaman: 11, warna: NORMAL },
    lapisan: [
      // Dua sisi gapura di depan kamera: tertutup di sampul, terbuka saat undangan dibuka
      { potongan: 'gerbangKiri', pos: [0.05, -5.9, 2], tinggi: 7.6, jangkar: 'kanan',
        gerak: [{ t: [0.06, 0.46], ke: { x: -6.5, ry: 0.9, z: 2.5 } }] },
      { potongan: 'gerbangKanan', pos: [-0.05, -5.9, 2], tinggi: 7.6, jangkar: 'kiri',
        gerak: [{ t: [0.06, 0.46], ke: { x: 6.5, ry: -0.9, z: 2.5 } }] },
      { jenis: 'sinar', pos: [0, 4, -24], ukuran: [26, 34], kekuatan: 0.55, rz: 0.25 },
      { jenis: 'kabut', pos: [0, -12, -22], ukuran: [70, 14], kekuatan: 0.55 }
    ],
    kamera: [
      { t: 0.0, pos: [0, -1.2, 12], lihat: [0, -1.2, -40] },
      { t: 0.38, pos: [0, -1.6, 6], lihat: [0, -2.5, -40] },
      { t: 0.82, pos: [0, -5.5, -12], lihat: [0, -9, -40] }
    ],
    efek: { kelopak: 0.9, kilau: 0.6, burung: 0.4 },
    suara: { burung: 0.8, air: 0.2 },
    transisi: { jenis: 'cahaya', warna: '#FFE6B4' }
  },
  {
    id: 'nama', judul: 'Undangan', durasi: 3.2, waktu: 'pagi',
    latar: { gambar: 'istanaKabut', z: -40, tinggi: 46, kedalaman: 12, warna: NORMAL },
    lapisan: [
      { jenis: 'kabut', pos: [-10, -9, -18], ukuran: [60, 12], kekuatan: 0.7, gerakAngin: 0.6 },
      { jenis: 'kabut', pos: [12, -12, -8], ukuran: [50, 10], kekuatan: 0.6, gerakAngin: -0.5 }
    ],
    kamera: [
      { t: 0.12, uv: [0.32, 0.38], jarak: 50 },
      { t: 0.48, uv: [0.42, 0.42], jarak: 44, geser: [-1, 0.5] },
      { t: 0.86, uv: [0.66, 0.5], jarak: 34, geser: [1.5, 0] }
    ],
    efek: { kelopak: 0.6, burung: 0.8, kilau: 0.3 },
    suara: { burung: 1, air: 0.35 },
    transisi: { jenis: 'kabut', warna: '#FFF6EC' }
  },
  {
    // === GANTI SETELAH GAMBAR V2 ADA ===
    // Saat ini bab kisah memakai langit berawan. Dengan gambar B3_klinik_terapi & B4_lamaran,
    // bab ini akan dipecah menjadi adegan klinik dan adegan lamaran (lihat AGENTS.md).
    id: 'kisah', judul: 'Kisah Kami', durasi: 4, waktu: 'siangHangat',
    lapisan: [
      { jenis: 'kabut', pos: [-9, -6, -6], ukuran: [26, 12], kekuatan: 0.9, gerakAngin: 0.4 },
      { jenis: 'kabut', pos: [10, -3, -20], ukuran: [26, 12], kekuatan: 0.85, gerakAngin: -0.3 },
      { jenis: 'kabut', pos: [-8, 1, -34], ukuran: [28, 13], kekuatan: 0.85, gerakAngin: 0.3 },
      { jenis: 'kabut', pos: [9, 5, -48], ukuran: [28, 13], kekuatan: 0.85, gerakAngin: -0.4 },
      { jenis: 'kabut', pos: [0, -4, -62], ukuran: [40, 16], kekuatan: 0.9, gerakAngin: 0.2 },
      { jenis: 'kabut', pos: [-6, 9, -76], ukuran: [30, 12], kekuatan: 0.8, gerakAngin: 0.3 },
      { jenis: 'sinar', pos: [6, 14, -70], ukuran: [30, 46], kekuatan: 0.5, rz: -0.35 },
      { potongan: 'mempelaiNavy', pos: [0, 2.5, -92], tinggi: 9,
        gerak: [{ t: [0.72, 0.9], dari: { y: -4, o: 0 }, ke: { y: 0, o: 1 } }] }
    ],
    kamera: [
      { t: 0.1, pos: [0, -2, 18], lihat: [0, 0, -40] },
      { t: 0.35, pos: [2, 0, -6], lihat: [-1, 2, -60] },
      { t: 0.6, pos: [-2, 3, -30], lihat: [1, 5, -90] },
      { t: 0.9, pos: [0, 6.5, -76], lihat: [0, 7, -110] }
    ],
    efek: { kelopak: 0.8, burung: 1, kilau: 0.4 },
    suara: { burung: 0.7, air: 0 },
    transisi: { jenis: 'kabut', warna: '#FFEBD2' }
  },
  {
    id: 'mempelai', judul: 'Mempelai', durasi: 3.2, waktu: 'emasDalam',
    latar: { gambar: 'ruangEmas', z: -40, tinggi: 46, kedalaman: 12, warna: NORMAL },
    lapisan: [],
    kamera: [
      { t: 0.1, uv: [0.5, 0.42], jarak: 52 },
      { t: 0.38, uv: [0.405, 0.4], jarak: 40, geser: [1.2, 0] },
      { t: 0.72, uv: [0.6, 0.42], jarak: 40, geser: [-1.2, 0] },
      { t: 0.9, uv: [0.52, 0.45], jarak: 46 }
    ],
    efek: { kilau: 0.9, kelopak: 0.3 },
    suara: { burung: 0.2 },
    transisi: { jenis: 'cahaya', warna: '#FFE2A6' }
  },
  {
    id: 'acara', judul: 'Hari Bahagia', durasi: 3.6, waktu: 'emasSore',
    latar: { gambar: 'pendopoMempelai', z: -40, tinggi: 46, kedalaman: 12, warna: NORMAL },
    lapisan: [
      { jenis: 'sinar', pos: [8, 8, -26], ukuran: [20, 40], kekuatan: 0.45, rz: -0.4 }
    ],
    kamera: [
      { t: 0.08, uv: [0.5, 0.45], jarak: 54 },
      { t: 0.3, uv: [0.44, 0.42], jarak: 46, geser: [-2, 0] },
      { t: 0.55, uv: [0.57, 0.46], jarak: 44, geser: [2, 0] },
      { t: 0.75, uv: [0.5, 0.6], jarak: 46 },
      { t: 0.92, uv: [0.5, 0.2], jarak: 48 }
    ],
    efek: { kelopak: 0.7, kilau: 0.7 },
    suara: { burung: 0.5, air: 0.2 },
    transisi: { jenis: 'kabut', warna: '#FFD6B4' }
  },
  {
    id: 'galeri', judul: 'Galeri', durasi: 3, waktu: 'senja',
    lapisan: [
      { jenis: 'kabut', pos: [0, -7, -20], ukuran: [70, 14], kekuatan: 0.7, gerakAngin: 0.3 },
      { jenis: 'kabut', pos: [0, -8, -55], ukuran: [70, 14], kekuatan: 0.7, gerakAngin: -0.3 }
    ],
    // Bingkai foto dibuat otomatis dari daftar GALERI (lihat di bawah)
    bingkaiGaleri: { mulaiZ: -6, jarak: 12, lebar: 2.2 },
    kamera: [
      { t: 0.08, pos: [0, 0.3, 10], lihat: [0, 0.2, -30] },
      { t: 0.92, pos: [0, 0.3, -58], lihat: [0, 0.2, -100] }
    ],
    efek: { kelopak: 0.5, lampion: 0.35, kilau: 0.5 },
    suara: { burung: 0.15, air: 0.3 },
    transisi: { jenis: 'kabut', warna: '#E4A49C' }
  },
  {
    id: 'senja', judul: 'Doa & Tanda Kasih', durasi: 3.6, waktu: 'senjaUngu',
    latar: { gambar: 'pendopoTaman', z: -40, tinggi: 46, kedalaman: 11, warna: SENJA },
    lapisan: [
      { jenis: 'kabut', pos: [0, -12, -16], ukuran: [60, 10], kekuatan: 0.4, gerakAngin: 0.3 }
    ],
    kamera: [
      { t: 0.1, uv: [0.5, 0.5], jarak: 52 },
      { t: 0.5, uv: [0.45, 0.55], jarak: 42, geser: [-2, 0] },
      { t: 0.9, uv: [0.58, 0.6], jarak: 34, geser: [2, -0.5] }
    ],
    efek: { kunang: 1, kilau: 0.3, lampion: 0.15 },
    suara: { jangkrik: 0.7, air: 0.6 },
    transisi: { jenis: 'malam', warna: '#141936' }
  },
  {
    id: 'penutup', judul: 'Terima Kasih', durasi: 3.4, waktu: 'malam',
    latar: { gambar: 'gerbang', z: -40, tinggi: 46, kedalaman: 11, warna: MALAM },
    lapisan: [
      { potongan: 'mempelaiMerah', pos: [0, -6.4, 2], tinggi: 6.2, cahaya: 0.6,
        gerak: [{ t: [0.12, 0.4], dari: { o: 0, y: -7.2 }, ke: { o: 1, y: -6.4 } }] }
    ],
    kamera: [
      { t: 0.12, pos: [0, 5, 14], lihat: [0, 8, -40] },
      { t: 0.5, pos: [0, -0.6, 12], lihat: [0, 1.2, -40] },
      { t: 1.0, pos: [0, 0.6, 11.5], lihat: [0, 6, -40] }
    ],
    efek: { lampion: 1, kembangApi: 1, kunang: 0.5, kilau: 0.4 },
    suara: { jangkrik: 1 },
    transisi: null
  }
];

/* === GALERI ===  Tambah foto: lihat AGENTS.md bagian 4. */
export const GALERI = [
  { full: 'assets/images/gallery/g01.webp', thumb: 'assets/images/gallery/g01_thumb.webp', w: 1600, h: 893, alt: 'Syaif dan Sasti berbusana pengantin Jawa hitam dan merah di pendopo keraton' },
  { full: 'assets/images/gallery/g02.webp', thumb: 'assets/images/gallery/g02_thumb.webp', w: 1600, h: 893, alt: 'Syaif dan Sasti bergandengan tangan berbusana beludru biru dan kebaya krem' },
  { full: 'assets/images/gallery/g03.webp', thumb: 'assets/images/gallery/g03_thumb.webp', w: 1600, h: 893, alt: 'Pendopo joglo dengan lampion menyala di taman keraton saat senja' },
  { full: 'assets/images/gallery/g04.webp', thumb: 'assets/images/gallery/g04_thumb.webp', w: 1600, h: 893, alt: 'Kompleks istana Jawa berselimut kabut pagi' },
  { full: 'assets/images/gallery/g05.webp', thumb: 'assets/images/gallery/g05_thumb.webp', w: 1600, h: 893, alt: 'Gapura bentar keraton dengan patung penjaga saat matahari terbenam' }
];

/* === DATA ACARA & PENYIMPANAN === */
export const DATA = {
  countdownTarget: '2026-12-26T09:00:00+07:00',
  mapsUrl: 'https://maps.app.goo.gl/T7Qgc8HXHPjVvXiM7',
  kalender: {
    title: 'Pernikahan Syaif & Sasti',
    startUtc: '20261226T020000Z',
    endUtc: '20261226T060000Z',
    location: 'Jl. Bedahan RT 05 RW 01, Pabuaran Mekar, Cibinong, Kabupaten Bogor',
    details: 'Akad Nikah pukul 09.00 WIB, Resepsi pukul 11.00–13.00 WIB. Peta: https://maps.app.goo.gl/T7Qgc8HXHPjVvXiM7'
  },
  // apiEndpoint null = ucapan disimpan di localStorage (lihat AGENTS.md bagian 6)
  penyimpanan: {
    apiEndpoint: null,
    localKey: 'undangan-syaif-sasti:ucapan:v1',
    maxNama: 50,
    maxPesan: 300
  }
};
