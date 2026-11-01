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
  lebarTransisi: 0.55, // panjang transisi antar bab (satuan gulir, di tiap sisi batas)
  fov: 45,
  satuanGulir: 0.85   // 1 satuan = 0.85 × tinggi layar
};

/* === ASET ===
   Latar v3: gambar adegan bersambung (tokoh sudah tergambar di dalamnya) + peta kedalaman.
   Dibuat dengan: python3 tools/prepare_scene_assets.py depth <gambar> assets/scenes/v3/<nama> --width 1440 */
const S = 'assets/scenes/';
const V3 = 'assets/scenes/v3/';
const latar = (nama, dir = V3) => ({ src: dir + nama + '.webp', depth: dir + nama + '_depth.webp' });
export const LATAR = {
  gerbang:     latar('gerbang', S),           // gerbang keraton (gambar awal)
  ruangEmas:   latar('ruang_emas', S),        // potret mempelai berbusana navy-krem
  kampung:     latar('s01_kampung'),
  desa:        latar('s02_desa'),
  pintuKlinik: latar('s03_pintu_klinik'),
  klinik:      latar('s04_klinik'),
  sawah:       latar('s05_sawah'),
  lamaran:     latar('s06_lamaran'),
  alun:        latar('s07_alun'),
  pelaminan:   latar('s08_pelaminan'),
  lorong:      latar('s09_lorong'),
  teratai:     latar('s10_teratai'),
  malam:       latar('s11_malam')
};

export const POTONGAN = {
  gerbangKiri:  'assets/images/gate_left.webp',
  gerbangKanan: 'assets/images/gate_right.webp',
  kuntul:       S + 'l10_kuntul.webp',
  gong:         S + 'l6_gong.webp',
  lampion:      S + 'l5_lampion.webp'   // juga dipakai sebagai partikel lampion terbang
};

export const SUARA = {
  // === GANTI LAGU DI SINI === (lihat AGENTS.md bagian 5)
  musik: [
    { src: 'assets/audio/lagu-utama.mp3', type: 'audio/mpeg' }
  ],
  volumeMusik: 0.7,
  gong: 'assets/audio/sfx/gong.mp3',
  volumeGong: 0.45,
  suasana: {
    burung: 'assets/audio/sfx/amb-burung.mp3',
    air: 'assets/audio/sfx/amb-air.mp3',
    jangkrik: 'assets/audio/sfx/amb-jangkrik.mp3'
  },
  volumeSuasana: 0.22   // suara alam dibuat tipis agar lagu tetap utama
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
  fajarKampung: {
    langitAtas: '#CDA9B4', cakrawala: '#FFE0C2', bawah: '#E8C7AE',
    matahari: [-0.3, 0.12, -1], warnaMatahari: '#FFE2B8', besarMatahari: 0.4,
    kabut: '#F6DDCB', kepadatanKabut: 0.005, awan: 0.5, warnaAwan: '#FFF1E2',
    bintang: 0, bloom: 0.45, eksposur: 1.0
  },
  ruangTerang: {
    langitAtas: '#E9D7BC', cakrawala: '#FFF2DC', bawah: '#E2C8A2',
    matahari: [0, 0.3, -1], warnaMatahari: '#FFF2D8', besarMatahari: 0.0,
    kabut: '#F5E6CF', kepadatanKabut: 0.0035, awan: 0.0, warnaAwan: '#FFFFFF',
    bintang: 0, bloom: 0.38, eksposur: 1.0
  },
  siangCerah: {
    langitAtas: '#78B2E6', cakrawala: '#EAF4FA', bawah: '#E8DCC6',
    matahari: [0.3, 0.4, -1], warnaMatahari: '#FFF8E8', besarMatahari: 0.5,
    kabut: '#E9EEF0', kepadatanKabut: 0.003, awan: 0.8, warnaAwan: '#FFFFFF',
    bintang: 0, bloom: 0.4, eksposur: 1.0
  },
  lorongSenja: {
    langitAtas: '#4A2618', cakrawala: '#D9935C', bawah: '#3A1C10',
    matahari: [0, 0.2, -1], warnaMatahari: '#FFC88A', besarMatahari: 0.0,
    kabut: '#B8703F', kepadatanKabut: 0.004, awan: 0.0, warnaAwan: '#FFE0B8',
    bintang: 0, bloom: 0.7, eksposur: 1.0
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

/* Pewarnaan ulang gambar latar */
const NORMAL = { tint: [1, 1, 1], lift: [0, 0, 0], saturasi: 1 };

/* Pola latar portrait v3 (gambar 9:16, tinggi 60 satuan dunia) */
const P9 = (gambar, extra = {}) => ({ gambar, z: -40, tinggi: 60, kedalaman: 10, warna: NORMAL, ...extra });

/* === DAFTAR BAB ===
   kamera: { t, uv:[u,v], jarak, geser, kabur }  -> melihat titik (u,v) gambar latar dari jarak tertentu
           (jarak 52–56 = seluruh gambar tampak; makin kecil makin dekat)
           { t, pos, lihat } -> koordinat langsung.  { t, fokus: N, isi, naik } -> menyorot lapisan ke-N.
   transisi: { jenis: 'tembus', ke: [u, v] } -> kamera menembus titik (u,v) lalu adegan berikutnya mekar dari sana.
             Jenis lain: 'tirai' | 'kabut' | 'cahaya' | 'malam' (jangan dipakai kecuali diminta).
   klip: { src, panjang } -> video transisi (Google Flow) diputar mengikuti gulir sesudah bab ini.
             "panjang" = ruang gulir tambahan (satuan gulir), kira-kira 0.3 × durasi video (detik).
             Bila video gagal/belum termuat, kedua adegan dicampur pelan sebagai cadangan.
   latar.samakan: false -> kecerahan gambar tidak disamakan (mis. malam).
   efek : kelopak, kilau, kunang, lampion, burung, kembangApi (0..1)
   suara: burung, air, jangkrik (0..1) */
export const BAB = [
  {
    id: 'gerbang', judul: 'Gerbang Keraton', durasi: 2.4, waktu: 'fajarEmas',
    latar: { gambar: 'gerbang', z: -40, tinggi: 46, kedalaman: 11, warna: NORMAL },
    lapisan: [
      { potongan: 'gerbangKiri', pos: [0.05, -5.9, 2], tinggi: 7.6, jangkar: 'kanan',
        gerak: [{ t: [0.06, 0.46], ke: { x: -6.5, ry: 0.9, z: 2.5 } }] },
      { potongan: 'gerbangKanan', pos: [-0.05, -5.9, 2], tinggi: 7.6, jangkar: 'kiri',
        gerak: [{ t: [0.06, 0.46], ke: { x: 6.5, ry: -0.9, z: 2.5 } }] },
      { jenis: 'sinar', pos: [0, 4, -24], ukuran: [26, 34], kekuatan: 0.55, rz: 0.25 },
      { jenis: 'kabut', pos: [0, -12, -22], ukuran: [70, 14], kekuatan: 0.55 }
    ],
    kamera: [
      // kamera tetap lebar: dorongan menembus gapura dilakukan oleh video klip T01
      { t: 0.0, pos: [0, -1.2, 12], lihat: [0, -1.2, -40] },
      { t: 0.45, pos: [0, -1.4, 9], lihat: [0, -1.6, -40] },
      { t: 1.0, pos: [0, -1.2, 12], lihat: [0, -1.2, -40] }
    ],
    efek: { kelopak: 0.9, kilau: 0.6, burung: 0.4 },
    suara: { burung: 0.8, air: 0.2 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.66] }, // menembus celah gapura
    klip: { src: 'assets/video/transisi/t01.mp4', panjang: 2.6 } // video Flow: gapura -> lembah kampung
  },
  {
    id: 'kampung', judul: 'Kampung Halaman', durasi: 3, waktu: 'fajarKampung',
    latar: P9('kampung', { kedalaman: 12 }),
    lapisan: [
      { potongan: 'kuntul', pos: [-18, 6, -26], tinggi: 5, gerak: [{ t: [0.0, 1.0], ke: { x: 16, y: 10 } }] },
      { jenis: 'kabut', pos: [6, -4, -22], ukuran: [40, 10], kekuatan: 0.5, gerakAngin: 0.5 },
      { jenis: 'sinar', pos: [-8, 14, -30], ukuran: [22, 40], kekuatan: 0.4, rz: 0.35 }
    ],
    kamera: [
      // awal & akhir = gambar utuh, sama dengan frame akhir klip T01 dan frame awal klip T02
      { t: 0.0, uv: [0.5, 0.5], jarak: 70 },
      { t: 0.5, uv: [0.5, 0.44], jarak: 60 },
      { t: 1.0, uv: [0.5, 0.5], jarak: 70 }
    ],
    efek: { kelopak: 0.5, burung: 0.9, kilau: 0.35 },
    suara: { burung: 1, air: 0.4 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.62] }, // menembus jalan setapak menuju desa
    klip: { src: 'assets/video/transisi/t02.mp4', panjang: 3.4 } // video Flow: turun bukit -> daun pisang -> lorong desa
  },
  {
    id: 'desa', judul: 'Jalan Desa', durasi: 3, waktu: 'pagi',
    latar: P9('desa'),
    lapisan: [
      { jenis: 'sinar', pos: [0, 6, -32], ukuran: [16, 36], kekuatan: 0.55, rz: 0 }
    ],
    kamera: [
      { t: 0.0, uv: [0.5, 0.5], jarak: 70 }, // = frame akhir klip T02
      { t: 0.5, uv: [0.5, 0.55], jarak: 46 },
      { t: 0.9, uv: [0.5, 0.54], jarak: 36 }
    ],
    efek: { kelopak: 0.8, kilau: 0.5 },
    suara: { burung: 0.9, air: 0.2 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.53] } // menembus cahaya di ujung lorong desa
  },
  {
    id: 'pintuKlinik', judul: 'Kisah Kami', durasi: 2, waktu: 'pagi',
    latar: P9('pintuKlinik'),
    lapisan: [],
    kamera: [
      { t: 0.05, uv: [0.5, 0.4], jarak: 56 },
      { t: 0.5, uv: [0.5, 0.48], jarak: 46 },
      { t: 1.0, uv: [0.5, 0.5], jarak: 70 } // = frame awal klip T04
    ],
    efek: { kelopak: 0.5, kilau: 0.4 },
    suara: { burung: 0.7 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.5] }, // masuk lewat pintu klinik yang terbuka
    klip: { src: 'assets/video/transisi/t04.mp4', panjang: 4.2 } // video Flow: naik tangga -> daun pintu ukir -> ruang klinik
  },
  {
    id: 'klinik', judul: 'Awal Bertemu', durasi: 3, waktu: 'ruangTerang',
    latar: P9('klinik'),
    lapisan: [
      { jenis: 'sinar', pos: [0, 10, -30], ukuran: [18, 40], kekuatan: 0.4, rz: 0.15 }
    ],
    kamera: [
      { t: 0.0, uv: [0.5, 0.5], jarak: 70 }, // = frame akhir klip T04
      { t: 0.5, uv: [0.56, 0.5], jarak: 50, geser: [-0.8, 0] },
      { t: 0.9, uv: [0.57, 0.52], jarak: 44, geser: [0.6, 0] }
    ],
    efek: { kilau: 0.6, kelopak: 0.25 },
    suara: { burung: 0.3 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.3] } // menembus jendela terang di belakang mereka
  },
  {
    id: 'sawah', judul: 'Saling Menguatkan', durasi: 3, waktu: 'siangHangat',
    latar: P9('sawah', { kedalaman: 12 }),
    lapisan: [],
    kamera: [
      { t: 0.05, uv: [0.5, 0.42], jarak: 56 },
      { t: 0.5, uv: [0.54, 0.55], jarak: 50 },
      { t: 0.9, uv: [0.52, 0.46], jarak: 44 }
    ],
    efek: { kelopak: 0.5, burung: 1, kilau: 0.3 },
    suara: { burung: 1, air: 0.7 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.38] } // menembus rumah joglo di ujung pematang
  },
  {
    id: 'lamaran', judul: 'Lamaran', durasi: 3, waktu: 'emasSore',
    latar: P9('lamaran'),
    lapisan: [],
    kamera: [
      { t: 0.05, uv: [0.5, 0.42], jarak: 56 },
      { t: 0.5, uv: [0.46, 0.6], jarak: 48, geser: [-0.6, 0] },
      { t: 0.9, uv: [0.48, 0.6], jarak: 42 }
    ],
    efek: { kelopak: 1, kilau: 0.8 },
    suara: { burung: 0.4 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.42] } // menembus pintu rumah berhias janur
  },
  {
    id: 'alun', judul: 'Menuju Halal', durasi: 2.4, waktu: 'siangCerah',
    latar: P9('alun'),
    lapisan: [
      { potongan: 'kuntul', pos: [14, 10, -28], tinggi: 5, cermin: true, gerak: [{ t: [0.0, 1.0], ke: { x: -14, y: 13 } }] }
    ],
    kamera: [
      { t: 0.05, uv: [0.5, 0.36], jarak: 56 },
      { t: 0.5, uv: [0.5, 0.5], jarak: 50 },
      { t: 1.0, uv: [0.5, 0.5], jarak: 70 } // = frame awal klip T08
    ],
    efek: { burung: 1, kelopak: 0.5, kilau: 0.5 },
    suara: { burung: 0.8 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.66] }, // menembus gerbang keraton di antara beringin
    klip: { src: 'assets/video/transisi/t08.mp4', panjang: 2.6 } // video Flow: alun-alun -> gerbang -> close-up mempelai
  },
  {
    id: 'mempelai', judul: 'Mempelai', durasi: 3.2, waktu: 'emasDalam',
    latar: { gambar: 'ruangEmas', z: -40, tinggi: 46, kedalaman: 12, warna: NORMAL },
    lapisan: [],
    kamera: [
      { t: 0.0, uv: [0.5, 0.5], jarak: 70 }, // = frame akhir klip T08
      { t: 0.38, uv: [0.405, 0.4], jarak: 40, geser: [1.2, 0] },
      { t: 0.72, uv: [0.6, 0.42], jarak: 40, geser: [-1.2, 0] },
      { t: 0.9, uv: [0.52, 0.48], jarak: 44 }
    ],
    efek: { kilau: 0.9, kelopak: 0.4 },
    suara: { burung: 0.2 },
    transisi: { jenis: 'tembus', ke: [0.53, 0.72] } // menembus genggaman tangan mereka
  },
  {
    id: 'acara', judul: 'Hari Bahagia', durasi: 3.8, waktu: 'emasDalam',
    latar: P9('pelaminan'),
    lapisan: [
      { jenis: 'sinar', pos: [6, 14, -28], ukuran: [20, 44], kekuatan: 0.35, rz: -0.35 }
    ],
    kamera: [
      { t: 0.05, uv: [0.5, 0.42], jarak: 56 },
      { t: 0.3, uv: [0.5, 0.5], jarak: 48, geser: [-1, 0] },
      { t: 0.55, uv: [0.5, 0.52], jarak: 46, geser: [1, 0] },
      { t: 0.75, uv: [0.5, 0.52], jarak: 48 },
      { t: 1.0, uv: [0.5, 0.5], jarak: 70 } // = frame awal klip T10
    ],
    efek: { kelopak: 0.8, kilau: 0.9 },
    suara: { burung: 0.15 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.3] }, // menembus pintu di balik pelaminan
    klip: { src: 'assets/video/transisi/t10.mp4', panjang: 2.6 } // video Flow: pelaminan -> lewat di samping mempelai -> lorong
  },
  {
    id: 'galeri', judul: 'Galeri', durasi: 3.4, waktu: 'lorongSenja',
    latar: { gambar: 'lorong', z: -100, tinggi: 120, kedalaman: 18, warna: NORMAL },
    lapisan: [],
    bingkaiGaleri: { mulaiZ: -6, jarak: 11, lebar: 1.6, air: false },
    kamera: [
      // (diganti otomatis oleh bangunGaleri di dunia.js: kamera berhenti di depan tiap foto)
      { t: 0.08, pos: [0, 0.3, 10], lihat: [0, 0.2, -30] },
      { t: 0.92, pos: [0, 0.3, -58], lihat: [0, 0.2, -100] }
    ],
    efek: { kelopak: 0.4, lampion: 0.2, kilau: 0.7 },
    suara: { air: 0.1 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.52] }, // menembus ujung lorong yang terbuka ke senja
    klip: { src: 'assets/video/transisi/t11.mp4', panjang: 1.6 } // video Flow: ujung lorong -> kolam teratai senja
  },
  {
    id: 'senja', judul: 'Doa & Tanda Kasih', durasi: 3.6, waktu: 'senjaUngu',
    latar: P9('teratai'),
    lapisan: [],
    kamera: [
      { t: 0.0, uv: [0.5, 0.5], jarak: 70 }, // = frame akhir klip T11
      { t: 0.5, uv: [0.5, 0.5], jarak: 50 },
      { t: 1.0, uv: [0.5, 0.5], jarak: 70 } // = frame awal klip T12
    ],
    efek: { kunang: 1, kilau: 0.4, lampion: 0.12, kelopak: 0.3 },
    suara: { jangkrik: 0.6, air: 0.7 },
    transisi: { jenis: 'tembus', ke: [0.5, 0.47] }, // menembus cahaya pintu paviliun
    klip: { src: 'assets/video/transisi/t12.mp4', panjang: 2.6 } // video Flow: senja -> malam lampion, mempelai muncul dari balik lampion
  },
  {
    // Penutup: mempelai melepas lampion, lalu kamera mengikuti lampion naik ke langit berbintang
    id: 'penutup', judul: 'Terima Kasih', durasi: 4.2, waktu: 'malam',
    latar: P9('malam', { samakan: false }),
    lapisan: [],
    kamera: [
      { t: 0.0, uv: [0.5, 0.5], jarak: 70 }, // = frame akhir klip T12
      { t: 0.32, uv: [0.45, 0.42], jarak: 46 },
      { t: 0.62, uv: [0.5, 0.08], jarak: 50 },
      { t: 1.0, uv: [0.5, -0.18], jarak: 54 }
    ],
    efek: { lampion: 1, kembangApi: 1, kunang: 0.5, kilau: 0.5 },
    suara: { jangkrik: 0.8 },
    transisi: null
  }
];

/* === GALERI ===  Tambah foto: lihat AGENTS.md bagian 4. Foto portrait (9:16) paling cocok. */
export const GALERI = [
  { full: 'assets/images/gallery/g01.webp', thumb: 'assets/images/gallery/g01_thumb.webp', w: 1000, h: 1792, alt: 'Syaif dan Sasti pertama kali bertemu sebagai terapis anak di ruang terapi sensori' },
  { full: 'assets/images/gallery/g02.webp', thumb: 'assets/images/gallery/g02_thumb.webp', w: 1000, h: 1792, alt: 'Syaif dan Sasti berjalan bergandengan di pematang sawah' },
  { full: 'assets/images/gallery/g03.webp', thumb: 'assets/images/gallery/g03_thumb.webp', w: 1000, h: 1792, alt: 'Syaif berlutut melamar Sasti di teras rumah berhias seserahan' },
  { full: 'assets/images/gallery/g04.webp', thumb: 'assets/images/gallery/g04_thumb.webp', w: 1000, h: 1792, alt: 'Syaif dan Sasti berbusana pengantin Jawa di depan gebyok pelaminan' },
  { full: 'assets/images/gallery/g05.webp', thumb: 'assets/images/gallery/g05_thumb.webp', w: 1000, h: 1792, alt: 'Syaif dan Sasti melepas lampion bersama di bawah langit malam' },
  { full: 'assets/images/gallery/g06.webp', thumb: 'assets/images/gallery/g06_thumb.webp', w: 1000, h: 1792, alt: 'Kampung halaman Jawa saat fajar dengan gunung dan sawah terasering' },
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
