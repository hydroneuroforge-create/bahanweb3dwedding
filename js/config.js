/* =========================================================================
   KONFIGURASI UNDANGAN — Syaif & Sasti
   -------------------------------------------------------------------------
   File ini adalah SATU-SATUNYA tempat untuk data yang dipakai JavaScript:
   tanggal, path aset, galeri, rekening, musik, dan penyimpanan ucapan.
   Teks yang tampil di halaman (nama, orang tua, kisah, dll.) ada di index.html.
   Lihat AGENTS.md sebelum mengubah apa pun.
   ========================================================================= */

/* === GANTI DENGAN FOTO / ASET ANDA ===
   Semua path relatif terhadap index.html. Format WebP dipakai agar ringan.
   Jalankan tools/optimize_images.py untuk menyiapkan foto baru. */
const ASSETS = {
  palaceBg: 'assets/images/palace_bg.webp',              // latar 3D hero (2048px)
  palaceBgMobile: 'assets/images/palace_bg_mobile.webp', // latar hero layar kecil / fallback
  gateLeft: 'assets/images/gate_left.webp',              // gapura kiri (PNG/WebP transparan)
  gateRight: 'assets/images/gate_right.webp',            // gapura kanan (PNG/WebP transparan)
  batikPattern: 'assets/images/batik_pattern.webp',      // tile batik seamless
  groomPhoto: 'assets/images/groom.webp',
  bridePhoto: 'assets/images/bride.webp',
  // Musik: browser memilih format pertama yang didukung (OGG lebih kecil, MP3 untuk Safari lama)
  music: [
    { src: 'assets/audio/gamelan-kraton.ogg', type: 'audio/ogg' },
    { src: 'assets/audio/gamelan-kraton.mp3', type: 'audio/mpeg' }
  ]
};

/* === GALERI ===
   Tambah foto: taruh file di assets/images/gallery/, lalu tambahkan satu objek.
   - full  : versi besar untuk lightbox (lebar maks 1600px)
   - thumb : versi kecil untuk grid (lebar maks 720px)
   - w, h  : ukuran asli rasio foto (dipakai agar grid tidak "loncat" saat memuat)
   - alt   : deskripsi singkat foto (wajib, untuk aksesibilitas) */
const GALLERY = [
  { full: 'assets/images/gallery/g01.webp', thumb: 'assets/images/gallery/g01_thumb.webp', w: 1600, h: 893, alt: 'Syaif dan Sasti berbusana pengantin Jawa hitam dan merah di pendopo keraton' },
  { full: 'assets/images/gallery/g02.webp', thumb: 'assets/images/gallery/g02_thumb.webp', w: 1600, h: 893, alt: 'Syaif dan Sasti bergandengan tangan berbusana beludru biru dan kebaya krem' },
  { full: 'assets/images/gallery/g03.webp', thumb: 'assets/images/gallery/g03_thumb.webp', w: 1600, h: 893, alt: 'Pendopo joglo dengan lampion menyala di taman keraton saat senja' },
  { full: 'assets/images/gallery/g04.webp', thumb: 'assets/images/gallery/g04_thumb.webp', w: 1600, h: 893, alt: 'Kompleks istana Jawa berselimut kabut pagi' },
  { full: 'assets/images/gallery/g05.webp', thumb: 'assets/images/gallery/g05_thumb.webp', w: 1600, h: 893, alt: 'Gapura bentar keraton dengan patung penjaga saat matahari terbenam' }
];

/* === DATA ACARA === */
const WEDDING = {
  coupleShort: 'Syaif & Sasti',
  // Waktu mulai akad (WIB = UTC+7). Dipakai oleh hitung mundur.
  countdownTarget: '2026-12-26T09:00:00+07:00',
  // Link Google Maps lokasi acara (akad & resepsi di tempat yang sama)
  mapsUrl: 'https://maps.app.goo.gl/T7Qgc8HXHPjVvXiM7',
  // Data untuk tombol "Simpan ke Kalender" (waktu dalam UTC: 09.00–13.00 WIB)
  calendar: {
    title: 'Pernikahan Syaif & Sasti',
    startUtc: '20261226T020000Z',
    endUtc: '20261226T060000Z',
    location: 'Jl. Bedahan RT 05 RW 01, Pabuaran Mekar, Cibinong, Kabupaten Bogor',
    details: 'Akad Nikah pukul 09.00 WIB, Resepsi pukul 11.00–13.00 WIB. Peta: https://maps.app.goo.gl/T7Qgc8HXHPjVvXiM7'
  }
};

/* === PENYIMPANAN RSVP & UCAPAN ===
   apiEndpoint = null  -> data disimpan di localStorage browser tamu (mode demo).
   Untuk backend sungguhan, isi dengan URL yang menerima:
     GET  {apiEndpoint}            -> [{ name, attendance, guests, message, createdAt }]
     POST {apiEndpoint} (JSON body) -> objek yang sama, mengembalikan objek tersimpan
   Lihat bagian "RSVP & Ucapan" di AGENTS.md. */
const STORAGE = {
  apiEndpoint: null,
  localKey: 'undangan-syaif-sasti:ucapan:v1',
  maxNameLength: 50,
  maxMessageLength: 300
};

// Ekspos ke file lain (script klasik, tanpa build step)
window.WEDDING_CONFIG = Object.freeze({ ASSETS, GALLERY, WEDDING, STORAGE });
