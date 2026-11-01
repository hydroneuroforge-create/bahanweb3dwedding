# Undangan Pernikahan 3D Sinematik — Syaif & Sasti

Undangan digital bertema **Kerajaan Jawa Kartun 3D**. Tamu menggulir layar, dan kamera bergerak menembus dunia 3D
dari fajar di gerbang keraton, melewati kisah cinta dan pendopo pernikahan, sampai malam penuh lampion terbang.
Dioptimalkan untuk dibuka dari **HP lewat WhatsApp**.

> **Agent/AI yang akan mengedit proyek ini wajib membaca [`AGENTS.md`](AGENTS.md).**

## Dua versi

| Halaman | Isi |
|---|---|
| `index.html` | **Versi sinematik** (utama): perjalanan 3D penuh, dikendalikan gulir |
| `klasik.html` | Versi ringan: halaman gulir biasa dengan hero 3D. Dipakai otomatis bila perangkat tidak mendukung WebGL |

## Alur versi sinematik

1. **Sampul**: gunungan wayang dengan tombol "Buka Undangan". Saat ditekan, gong berbunyi, gunungan terbelah, dan gapura terbuka.
2. **Gerbang Keraton** (fajar): Bismillah dan salam.
3. **Undangan** (pagi berkabut): ayat QS. Ar-Rum (30):21 pada lontar, lalu nama mempelai.
4. **Kisah Cinta**: awal bertemu di klinik terapi anak (2023), saling menguatkan, lamaran (15 Agustus 2026), menuju halal.
5. **Mempelai**: kamera menyorot Syaif lalu Sasti, dengan nama, orang tua, dan Instagram.
6. **Hari Bahagia**: akad, resepsi, hitung mundur, lokasi (tombol Maps & simpan ke kalender).
7. **Galeri** (senja di atas air): foto dalam bingkai emas. Ketuk foto untuk memperbesar.
8. **Doa & Tanda Kasih**: RSVP & ucapan (lembar dialog), rekening BCA, dan alamat kado.
9. **Terima Kasih** (malam): lampion terbang dan kembang api.

Efek: latar 2.5D dengan peta kedalaman (parallax nyata), langit dinamis (awan, matahari, bintang), kabut,
berkas sinar, kelopak bunga, kilau emas, kunang-kunang, burung kuntul, bloom, dan transisi kabut/cahaya.
Suara: lagu piano “When You Tell Me That You Love Me”, gong, kicau burung, gemericik air, dan jangkrik, dengan volume yang berganti mengikuti adegan.
Kualitas grafis turun otomatis bila HP kewalahan.

## Struktur file

```
.
├── index.html                  # versi sinematik: sampul + teks tiap adegan + dialog
├── css/sinema.css
├── js/sinema/
│   ├── cerita.js               # NASKAH: bab, kamera, latar, efek, suara, galeri, data acara
│   ├── dunia.js                # mesin Three.js
│   └── main.js                 # gulir, teks, suara, menu, RSVP, dll.
├── klasik.html, css/style.css, js/config.js, js/scene.js, js/main.js   # versi klasik
├── assets/
│   ├── scenes/                 # latar + peta kedalaman + potongan tokoh (WebP)
│   ├── images/                 # galeri, gapura, og-image, favicon
│   └── audio/                  # gamelan + sfx/ (gong, suara alam)
├── tools/
│   ├── prepare_scene_assets.py # peta kedalaman & hapus latar (model AI, offline)
│   └── optimize_images.py      # kompres foto galeri
├── docs/PROMPT_GAMBAR.md       # prompt Nano Banana untuk gambar adegan berikutnya
├── bahan web 3d/               # aset asli (arsip) — gambar baru diunggah ke bahan web 3d/v2/
└── AGENTS.md                   # aturan untuk AI agent
```

## Cara menjalankan

Perlu server lokal karena tekstur 3D tidak bisa dimuat dari `file://`.

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

Untuk melihat tampilan HP di laptop: Chrome → `Cmd/Ctrl + Option/Shift + I` → ikon ponsel → pilih iPhone 12/13/14.

## Menambah gambar adegan

1. Buat gambar dengan prompt di [`docs/PROMPT_GAMBAR.md`](docs/PROMPT_GAMBAR.md), lalu unggah ke `bahan web 3d/v2/`.
2. Proses dengan `tools/prepare_scene_assets.py` (`depth` untuk latar, `cutout --white` untuk tokoh/objek).
3. Daftarkan di `js/sinema/cerita.js`. Langkah lengkap ada di `AGENTS.md` bagian 9.

## Deploy

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**. Lihat `AGENTS.md` bagian 7.

## Kredit

- Lagu: “When You Tell Me That You Love Me” (Diana Ross, ciptaan Albert Hammond & John Bettis), piano cover oleh Riyandi Kusuma — disediakan oleh pemilik undangan.
- Gong: "Gong GAp (Casa da Musica's Javanese gamelan)" oleh Digitópia Casa da Música, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Gong_GAp_(Casa_da_Musica%27s_Javanese_gamelan).ogg), Artistic License 2.0.
- Kicau burung: "Bourne Woods 2020-04-26 0815a" oleh Robert EA Harvey, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Bourne_Woods_2020-04-26_0815a.mp3), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Gemericik air: "Shallow small river with stony riverbed" oleh stephan, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Shallow_small_river_with_stony_riverbed.ogg), domain publik.
- Jangkrik: "Night original format" oleh Fortunamarco2003, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Night_original_format.wav), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
  File suara diubah formatnya menjadi MP3 mono dan ujungnya disilang-pudar agar bisa diulang tanpa jeda.
- Model AI (hanya untuk menyiapkan aset, tidak dimuat di website): Depth Anything V2 Small (Apache-2.0), ISNet general-use dari rembg (MIT/Apache-2.0).
- Teks ayat & terjemahan: mushaf Utsmani dan terjemahan Kementerian Agama RI.
- Library: [Three.js](https://threejs.org) (MIT); versi klasik juga memakai [GSAP](https://gsap.com) dan [Lenis](https://github.com/darkroomengineering/lenis) (MIT).
- Font: Cinzel, Cormorant Garamond, Great Vibes, Poppins, Amiri Quran (Google Fonts, SIL OFL).
