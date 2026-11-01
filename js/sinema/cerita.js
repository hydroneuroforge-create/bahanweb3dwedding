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
   Latar: gambar + peta kedalaman (_depth) dari tools/prepare_scene_assets.py depth
   Potongan: gambar transparan dari tools/prepare_scene_assets.py cutout --white */
const S = 'assets/scenes/';
export const LATAR = {
  gerbang:          { src: S + 'gerbang.webp',          depth: S + 'gerbang_depth.webp' },
  ruangEmas:        { src: S + 'ruang_emas.webp',       depth: S + 'ruang_emas_depth.webp' },
  kampung:          { src: S + 'b1_kampung.webp',       depth: S + 'b1_kampung_depth.webp' },
  desa:             { src: S + 'b2_desa.webp',          depth: S + 'b2_desa_depth.webp' },
  klinik:           { src: S + 'b3_klinik.webp',        depth: S + 'b3_klinik_depth.webp' },
  lamaran:          { src: S + 'b4_lamaran.webp',       depth: S + 'b4_lamaran_depth.webp' },
  alun:             { src: S + 'b5_alun.webp',          depth: S + 'b5_alun_depth.webp' },
  pelaminan:        { src: S + 'b6_pelaminan.webp',     depth: S + 'b6_pelaminan_depth.webp' },
  lorong:           { src: S + 'b7_lorong.webp',        depth: S + 'b7_lorong_depth.webp' },
  teratai:          { src: S + 'b8_teratai.webp',       depth: S + 'b8_teratai_depth.webp' },
  malam:            { src: S + 'b9_malam.webp',         depth: S + 'b9_malam_depth.webp' },
  sawah:            { src: S + 'b10_sawah.webp',        depth: S + 'b10_sawah_depth.webp' }
};

export const POTONGAN = {
  gerbangKiri:   'assets/images/gate_left.webp',
  gerbangKanan:  'assets/images/gate_right.webp',
  jalan:         S + 'c1_jalan.webp',        // berjalan bergandengan (tampak belakang)
  terapis:       S + 'c2_terapis.webp',      // terapis anak 2023
  lamaran:       S + 'c3_lamaran.webp',      // memberi cincin
  pelaminan:     S + 'c4_pelaminan.webp',    // berdiri bergandengan
  lepasLampion:  S + 'c5_lampion.webp',      // melepas lampion
  melambai:      S + 'c6_melambai.webp',
  kelapa:        S + 'l3_kelapa.webp',
  daun:          S + 'l2_daun.webp',
  kuntul:        S + 'l10_kuntul.webp',
  gong:          S + 'l6_gong.webp',
  lampion:       S + 'l5_lampion.webp'       // juga dipakai sebagai partikel lampion terbang
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

/* Pewarnaan ulang gambar latar (untuk memakai gambar yang sama di waktu berbeda) */
const NORMAL = { tint: [1, 1, 1], lift: [0, 0, 0], saturasi: 1 };
const HANGAT = { tint: [1.04, 0.98, 0.9], lift: [0.01, 0, 0], saturasi: 1.02 };

/* === DAFTAR BAB ===
   Lapisan "potongan" bisa diletakkan dengan:
     pos:[x,y,z]                -> koordinat langsung; gerak memakai nilai mutlak
     uv:[u,v] (+ maju)          -> kaki objek berdiri tepat di titik (u,v) gambar latar
                                   (kedalaman diambil dari peta kedalaman); gerak memakai
                                   nilai RELATIF (x/y/z = geseran dari posisi itu)
   tinggi: tinggi objek dalam satuan dunia (gambar latar portrait tingginya 60)
   cermin: true -> dibalik kiri-kanan
   efek  : kelopak, kilau, kunang, lampion, burung, kembangApi (0..1)
   suara : burung, air, jangkrik (0..1)
   transisi: 'kabut' | 'cahaya' | 'malam' */
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
      { t: 0.0, pos: [0, -1.2, 12], lihat: [0, -1.2, -40] },
      { t: 0.38, pos: [0, -1.6, 6], lihat: [0, -2.5, -40] },
      { t: 0.82, pos: [0, -5.5, -12], lihat: [0, -9, -40] }
    ],
    efek: { kelopak: 0.9, kilau: 0.6, burung: 0.4 },
    suara: { burung: 0.8, air: 0.2 },
    transisi: { jenis: 'cahaya', warna: '#FFE6B4' }
  },
  {
    // Fajar di kampung: kamera turun dari langit menuju desa, nama mempelai di langit
    id: 'kampung', judul: 'Kampung Halaman', durasi: 2.8, waktu: 'fajarKampung',
    latar: { gambar: 'kampung', z: -40, tinggi: 60, kedalaman: 14, warna: NORMAL },
    lapisan: [
      { potongan: 'kuntul', pos: [-18, 4, -28], tinggi: 5,
        gerak: [{ t: [0.0, 1.0], ke: { x: 16, y: 8 } }] },
      { potongan: 'kelapa', pos: [-7.5, -26, -8], tinggi: 26, cermin: true,
        gerak: [{ t: [0.4, 1.0], ke: { y: -22 } }] },
      { jenis: 'kabut', pos: [6, -6, -20], ukuran: [40, 10], kekuatan: 0.6, gerakAngin: 0.5 },
      { jenis: 'kabut', pos: [-8, -12, -12], ukuran: [36, 9], kekuatan: 0.5, gerakAngin: -0.4 }
    ],
    kamera: [
      { t: 0.08, uv: [0.5, 0.16], jarak: 56 },
      { t: 0.5, uv: [0.47, 0.34], jarak: 52 },
      { t: 0.92, uv: [0.52, 0.66], jarak: 40 }
    ],
    efek: { kelopak: 0.5, burung: 0.9, kilau: 0.35 },
    suara: { burung: 1, air: 0.45 },
    transisi: { jenis: 'kabut', warna: '#FFF3E6' }
  },
  {
    // Jalan desa: kamera berjalan menyusuri lorong kampung, ayat suci muncul
    id: 'desa', judul: 'Jalan Desa', durasi: 3, waktu: 'pagi',
    latar: { gambar: 'desa', z: -40, tinggi: 46, kedalaman: 14, warna: NORMAL },
    lapisan: [
      { potongan: 'daun', pos: [-3.6, -6.5, 4], tinggi: 7,
        gerak: [{ t: [0.55, 0.85], ke: { x: -6, o: 0 } }] },
      { potongan: 'daun', pos: [3.6, -6.5, 3], tinggi: 6.5, cermin: true,
        gerak: [{ t: [0.55, 0.85], ke: { x: 6, o: 0 } }] },
      { jenis: 'sinar', pos: [5, 8, -26], ukuran: [18, 34], kekuatan: 0.5, rz: -0.3 }
    ],
    kamera: [
      { t: 0.06, uv: [0.5, 0.62], jarak: 50 },
      { t: 0.5, uv: [0.5, 0.64], jarak: 40 },
      { t: 0.94, uv: [0.5, 0.66], jarak: 26 }
    ],
    efek: { kelopak: 0.8, kilau: 0.4 },
    suara: { burung: 0.9, air: 0.2 },
    transisi: { jenis: 'kabut', warna: '#FFF6EC' }
  },
  {
    // Kisah 2023: klinik terapi anak tempat mereka bertemu
    id: 'klinik', judul: 'Awal Bertemu', durasi: 2.8, waktu: 'ruangTerang',
    latar: { gambar: 'klinik', z: -40, tinggi: 60, kedalaman: 10, warna: HANGAT },
    lapisan: [
      { potongan: 'terapis', uv: [0.52, 0.86], maju: 3, tinggi: 15,
        gerak: [{ t: [0.12, 0.34], dari: { o: 0, y: -1.5 }, ke: { o: 1, y: 0 } }] },
      { jenis: 'sinar', pos: [-8, 12, -30], ukuran: [20, 40], kekuatan: 0.42, rz: 0.4 }
    ],
    kamera: [
      { t: 0.08, uv: [0.5, 0.3], jarak: 54 },
      { t: 0.5, uv: [0.5, 0.56], jarak: 46 },
      { t: 0.92, uv: [0.5, 0.7], jarak: 40 }
    ],
    efek: { kilau: 0.5, kelopak: 0.2 },
    suara: { burung: 0.25 },
    transisi: { jenis: 'cahaya', warna: '#FFF0D8' }
  },
  {
    // 2023–2026: berjalan bersama di pematang sawah
    id: 'sawah', judul: 'Saling Menguatkan', durasi: 2.6, waktu: 'siangHangat',
    latar: { gambar: 'sawah', z: -40, tinggi: 60, kedalaman: 14, warna: NORMAL },
    lapisan: [
      { potongan: 'jalan', uv: [0.47, 0.72], maju: 2, tinggi: 9,
        gerak: [{ t: [0.05, 0.25], dari: { o: 0 }, ke: { o: 1 } }, { t: [0.25, 1], ke: { y: 2.5, z: -6 } }] }
    ],
    kamera: [
      { t: 0.06, uv: [0.5, 0.5], jarak: 56 },
      { t: 0.94, uv: [0.5, 0.56], jarak: 44 }
    ],
    efek: { kelopak: 0.5, burung: 1, kilau: 0.3 },
    suara: { burung: 1, air: 0.6 },
    transisi: { jenis: 'kabut', warna: '#FFF0DC' }
  },
  {
    // 15 Agustus 2026: lamaran di teras rumah keluarga
    id: 'lamaran', judul: 'Lamaran', durasi: 2.8, waktu: 'emasSore',
    latar: { gambar: 'lamaran', z: -40, tinggi: 60, kedalaman: 12, warna: NORMAL },
    lapisan: [
      { potongan: 'lamaran', uv: [0.5, 0.88], maju: 3, tinggi: 15,
        gerak: [{ t: [0.12, 0.34], dari: { o: 0, x: -1.5 }, ke: { o: 1, x: 0 } }] }
    ],
    kamera: [
      { t: 0.08, uv: [0.5, 0.32], jarak: 54 },
      { t: 0.5, uv: [0.5, 0.58], jarak: 46 },
      { t: 0.92, uv: [0.5, 0.66], jarak: 40 }
    ],
    efek: { kelopak: 0.9, kilau: 0.7 },
    suara: { burung: 0.4 },
    transisi: { jenis: 'cahaya', warna: '#FFE2A6' }
  },
  {
    // Menuju halal: alun-alun keraton dengan beringin kembar
    id: 'alun', judul: 'Menuju Halal', durasi: 2.2, waktu: 'siangCerah',
    latar: { gambar: 'alun', z: -40, tinggi: 60, kedalaman: 12, warna: NORMAL },
    lapisan: [
      { potongan: 'kuntul', pos: [14, 9, -28], tinggi: 5, cermin: true,
        gerak: [{ t: [0.0, 1.0], ke: { x: -14, y: 12 } }] }
    ],
    kamera: [
      { t: 0.08, uv: [0.5, 0.22], jarak: 54 },
      { t: 0.92, uv: [0.5, 0.48], jarak: 42 }
    ],
    efek: { burung: 1, kelopak: 0.5, kilau: 0.4 },
    suara: { burung: 0.8 },
    transisi: { jenis: 'cahaya', warna: '#FFF0D0' }
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
    // Pelaminan: mempelai berdiri di depan gebyok, gong muncul saat hitung mundur
    id: 'acara', judul: 'Hari Bahagia', durasi: 3.6, waktu: 'emasDalam',
    latar: { gambar: 'pelaminan', z: -40, tinggi: 60, kedalaman: 12, warna: NORMAL },
    lapisan: [
      { potongan: 'pelaminan', uv: [0.5, 0.8], maju: 2, tinggi: 13,
        gerak: [{ t: [0.04, 0.2], dari: { o: 0 }, ke: { o: 1 } }, { t: [0.52, 0.6], ke: { o: 0 } }] },
      { potongan: 'gong', uv: [0.5, 0.86], maju: 4, tinggi: 11,
        gerak: [{ t: [0.54, 0.62], dari: { o: 0, y: -1 }, ke: { o: 1, y: 0 } }, { t: [0.76, 0.82], ke: { o: 0 } }] },
      { jenis: 'sinar', pos: [6, 14, -28], ukuran: [20, 44], kekuatan: 0.4, rz: -0.35 }
    ],
    kamera: [
      { t: 0.06, uv: [0.5, 0.42], jarak: 56 },
      { t: 0.3, uv: [0.5, 0.6], jarak: 44, geser: [-1.5, 0] },
      { t: 0.55, uv: [0.5, 0.62], jarak: 44, geser: [1.5, 0] },
      { t: 0.75, uv: [0.5, 0.72], jarak: 40 },
      { t: 0.94, uv: [0.5, 0.36], jarak: 50 }
    ],
    efek: { kelopak: 0.7, kilau: 0.8 },
    suara: { burung: 0.2 },
    transisi: { jenis: 'kabut', warna: '#FFD9B0' }
  },
  {
    // Galeri: lorong lampion keraton, foto berbingkai emas melayang di sepanjang lorong
    id: 'galeri', judul: 'Galeri', durasi: 3, waktu: 'lorongSenja',
    latar: { gambar: 'lorong', z: -100, tinggi: 120, kedalaman: 20, warna: NORMAL },
    lapisan: [],
    bingkaiGaleri: { mulaiZ: -6, jarak: 12, lebar: 1.8, air: false },
    kamera: [
      { t: 0.08, pos: [0, 0.3, 10], lihat: [0, 0.2, -30] },
      { t: 0.92, pos: [0, 0.3, -58], lihat: [0, 0.2, -100] }
    ],
    efek: { kelopak: 0.4, lampion: 0.25, kilau: 0.6 },
    suara: { air: 0.15 },
    transisi: { jenis: 'kabut', warna: '#E6A88C' }
  },
  {
    id: 'senja', judul: 'Doa & Tanda Kasih', durasi: 3.6, waktu: 'senjaUngu',
    latar: { gambar: 'teratai', z: -40, tinggi: 60, kedalaman: 12, warna: NORMAL },
    lapisan: [
      { jenis: 'kabut', pos: [0, -16, -14], ukuran: [50, 9], kekuatan: 0.35, gerakAngin: 0.3 }
    ],
    kamera: [
      { t: 0.1, uv: [0.5, 0.3], jarak: 56 },
      { t: 0.5, uv: [0.5, 0.5], jarak: 50 },
      { t: 0.9, uv: [0.5, 0.66], jarak: 42 }
    ],
    efek: { kunang: 1, kilau: 0.3, lampion: 0.12 },
    suara: { jangkrik: 0.7, air: 0.7 },
    transisi: { jenis: 'malam', warna: '#141936' }
  },
  {
    // Penutup: malam penuh lampion, mempelai melepas lampion bersama
    id: 'penutup', judul: 'Terima Kasih', durasi: 3.4, waktu: 'malam',
    latar: { gambar: 'malam', z: -40, tinggi: 60, kedalaman: 12, warna: NORMAL },
    lapisan: [
      { potongan: 'lepasLampion', uv: [0.5, 0.9], maju: 3, tinggi: 14, cahaya: 0.85,
        gerak: [{ t: [0.06, 0.3], dari: { o: 0, y: -1.5 }, ke: { o: 1, y: 0 } }] }
    ],
    kamera: [
      { t: 0.06, uv: [0.5, 0.18], jarak: 56 },
      { t: 0.45, uv: [0.5, 0.56], jarak: 50 },
      { t: 1.0, uv: [0.5, 0.42], jarak: 52 }
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
