# Undangan Pernikahan 3D — Syaif & Sasti

Website undangan pernikahan satu halaman bertema **Kerajaan Jawa Kartun 3D**.
Dibuat dengan HTML, CSS, dan JavaScript murni, ditambah Three.js, GSAP, dan Lenis dari CDN. Tidak perlu build step.

> **Agent/AI yang akan mengedit proyek ini wajib membaca [`AGENTS.md`](AGENTS.md).**

## Fitur

| Section | Isi |
|---|---|
| Loading | Ornamen kawung & gunungan berputar, progress bar emas mengikuti aset yang termuat |
| Hero 3D | Latar istana di kanvas Three.js, gapura yang terbuka saat "Buka Undangan", kelopak mawar/melati & kilau emas, parallax mouse, kamera maju saat scroll |
| Ayat | QS. Ar-Rum (30):21 (teks Arab Utsmani + terjemahan Kemenag) |
| Mempelai | Foto dalam bingkai lengkung emas, nama, orang tua, Instagram |
| Acara | Akad & Resepsi, alamat, tombol "Lihat Lokasi" (Google Maps) & "Simpan ke Kalender" |
| Hitung mundur | Hari/jam/menit/detik ke 26 Des 2026 09.00 WIB, dengan efek flip |
| Kisah cinta | Timeline gaya gulungan naskah |
| Galeri | Grid responsif + lightbox (klik, panah keyboard, swipe, Esc) |
| RSVP & Ucapan | Form tervalidasi, daftar ucapan + statistik (localStorage, siap disambung API) |
| Hadiah | Rekening BCA & alamat kado, tombol salin + toast |
| Penutup | Ucapan terima kasih, gapura mini, kredit |

Tambahan: navigasi dock bawah, tombol musik gamelan, kursor emas (desktop), dukungan `prefers-reduced-motion`,
fallback gambar statis bila WebGL tidak tersedia, render 3D berhenti saat tab/hero tidak terlihat.

## Struktur file

```
.
├── index.html                 # struktur & semua teks halaman
├── css/style.css              # gaya (variabel warna di :root)
├── js/
│   ├── config.js              # DATA: aset, galeri, tanggal, maps, penyimpanan
│   ├── scene.js               # scene 3D Three.js
│   └── main.js                # animasi & fitur interaktif
├── assets/
│   ├── images/                # gambar teroptimasi (WebP)
│   │   └── gallery/           # foto galeri (gNN.webp + gNN_thumb.webp)
│   └── audio/                 # musik gamelan (OGG + MP3)
├── tools/optimize_images.py   # skrip optimasi foto
├── bahan web 3d/              # aset asli resolusi penuh (arsip, tidak dipakai langsung)
├── AGENTS.md                  # aturan untuk AI agent
└── .nojekyll                  # untuk GitHub Pages
```

## Cara menjalankan

Scene 3D memuat tekstur, jadi website **perlu dibuka lewat server lokal**.
Jika `index.html` dibuka dengan double-click (`file://`), website tetap berjalan tetapi hero memakai gambar statis tanpa efek 3D.

Pilih salah satu cara:

```bash
# Python (sudah ada di macOS/Linux)
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

- **VS Code**: pasang ekstensi *Live Server*, klik kanan `index.html` → *Open with Live Server*.
- **Node**: `npx serve .`

## Aset & ukuran rekomendasi

| File | Kegunaan | Rekomendasi |
|---|---|---|
| `assets/images/palace_bg.webp` | Latar 3D hero (desktop) | 2048×1143, 16:9, ≤ 250 KB |
| `assets/images/palace_bg_mobile.webp` | Latar hero (mobile & fallback) | 1280×714, ≤ 120 KB |
| `assets/images/gate_left.webp`, `gate_right.webp` | Gapura 3D & ornamen penutup | Latar **transparan**, tinggi ~1100px |
| `assets/images/batik_pattern.webp` | Tekstur batik (tile seamless) | 1024×1024 |
| `assets/images/groom.webp`, `bride.webp` | Foto mempelai | Potret 3:4, ~660×880 |
| `assets/images/gallery/gNN.webp` | Foto galeri (lightbox) | Lebar 1600px, ≤ 250 KB |
| `assets/images/gallery/gNN_thumb.webp` | Thumbnail galeri | Lebar 720px, ≤ 60 KB |
| `assets/images/pavilion_bg.webp`, `palace_building_bg.webp` | Latar section Acara & Penutup | Lebar 1600px |
| `assets/images/og-image.jpg` | Pratinjau saat link dibagikan | 1200×630 |
| `assets/audio/gamelan-kraton.ogg` / `.mp3` | Musik latar | OGG utama, MP3 cadangan |

Semua gambar di atas dihasilkan dari aset asli di `bahan web 3d/` (2752×1536). Total ukurannya turun dari ±19 MB menjadi ±2 MB.

### Menambah foto galeri

```bash
pip install pillow
python3 tools/optimize_images.py foto1.jpg foto2.jpg
```
Tempel baris yang dicetak ke array `GALLERY` di `js/config.js`, lalu tulis `alt` untuk tiap foto. Detail ada di `AGENTS.md` bagian 4.

## Mengubah data

- **Teks** (nama, orang tua, kisah, ucapan): edit `index.html`.
- **Tanggal countdown, link maps, kalender, galeri, musik, penyimpanan**: edit `js/config.js`.
- **Warna & font**: variabel di bagian atas `css/style.css`.
- **Suasana 3D** (jumlah kelopak, kabut, cahaya, parallax): objek `SETTINGS` di `js/scene.js`.

## Deploy

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**. Lihat `AGENTS.md` bagian 7.

## Kredit

- Musik: "Gamelan angka 2 Kraton Ngayogyakarta" oleh RTB45, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gamelan_angka_2_Kraton_Ngayogyakarta.ogg), lisensi [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Teks ayat & terjemahan: mushaf Utsmani dan terjemahan Kementerian Agama RI.
- Library: [Three.js](https://threejs.org) (MIT), [GSAP](https://gsap.com) (lisensi standar GSAP, gratis), [Lenis](https://github.com/darkroomengineering/lenis) (MIT).
- Font: Cinzel, Cormorant Garamond, Poppins, Amiri Quran (Google Fonts, SIL OFL).
