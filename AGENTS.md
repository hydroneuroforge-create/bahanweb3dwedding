# AGENTS.md — Aturan untuk Agent (Hermes & lainnya)

Dokumen ini berisi aturan wajib bagi AI agent yang mengedit, menambah konten, atau men-deploy
website undangan pernikahan **Syaif & Sasti**. Baca seluruh dokumen sebelum mengubah file apa pun.
Untuk konteks umum, lihat juga `README.md`.

---

## 1. Gambaran proyek

- Website statis satu halaman. **Tanpa build step, tanpa framework, tanpa npm.**
- Library dimuat dari CDN jsDelivr dengan versi terkunci:
  - Three.js `0.187.0` (dimuat di `js/scene.js`, konstanta `THREE_URL`)
  - GSAP + ScrollTrigger `3.15.0` dan Lenis `1.3.27` (tag `<script>` di `index.html`, dengan atribut `integrity`)
- Target hosting: **GitHub Pages** dari root repo. File `.nojekyll` wajib tetap ada.

### Peta file

| File | Isi | Boleh diubah? |
|---|---|---|
| `index.html` | Semua teks yang tampil (nama, orang tua, acara, kisah, hadiah, penutup) dan ikon SVG | Ya, isinya saja. Jangan ubah struktur class/id |
| `js/config.js` | Path aset, daftar **galeri**, tanggal countdown, link maps, kalender, penyimpanan ucapan | Ya. **Tempat utama untuk edit data** |
| `css/style.css` | Semua gaya. Warna & jarak ada di variabel `:root` | Hanya bila diminta |
| `js/scene.js` | Scene 3D Three.js (backdrop, gapura, kelopak, kamera) | Hanya bila diminta. Setelan ada di objek `SETTINGS` |
| `js/main.js` | Animasi, countdown, galeri, RSVP, salin, musik | Hanya bila diminta |
| `assets/images/` | Gambar hasil optimasi (WebP) | Ya, lewat `tools/optimize_images.py` |
| `assets/audio/` | Musik latar | Lihat bagian 5 |
| `bahan web 3d/` | **Aset asli resolusi penuh. JANGAN dihapus/diubah.** Tidak dipakai langsung oleh website | Tidak |
| `tools/optimize_images.py` | Skrip optimasi foto galeri | Tidak perlu |

---

## 2. Aturan wajib (jangan dilanggar)

1. **Jangan tambahkan framework, bundler, atau `package.json`.** Website harus bisa jalan dengan server statis biasa.
2. **Jangan ubah teks ayat QS. Ar-Rum (30):21** di section `#salam` pada `index.html`. Teks Arab diambil dari mushaf Utsmani dan terjemahan dari Kemenag RI. Jika diminta menggantinya, verifikasi dulu ke sumber resmi (misalnya https://quran.kemenag.go.id/quran/per-ayat/surah/30?from=21).
3. **Jangan tampilkan nama tempat dari Google Maps.** Link maps (`https://maps.app.goo.gl/T7Qgc8HXHPjVvXiM7`) mengarah ke sebuah klinik. Atas permintaan mempelai, nama klinik **tidak boleh** muncul di halaman. Yang tampil hanya alamat jalan dan tombol "Lihat Lokasi". Jangan pasang iframe/embed peta.
4. **Jangan masukkan foto mentah** (JPG besar dari HP/kamera) langsung ke halaman. Selalu jalankan `tools/optimize_images.py` (bagian 4).
5. **Jangan hapus atau ubah id/class** yang dipakai JavaScript: `#loader`, `#scene-canvas`, `#open-invitation`, `#gallery`, `#lightbox*`, `#rsvp-*`, `#wishes-list`, `#countdown`, `[data-unit]`, `[data-copy]`, `[data-reveal]`, `[data-reveal-group]`, `[data-reveal-stagger]`, `[data-hero-item]`, `#dock`, `#music-toggle`, `#bg-music`, `#maps-link`, `#calendar-link`, `#toast`.
6. **Tidak boleh ada inline style** (`style="..."`) di HTML. Gaya baru masuk ke `css/style.css` memakai variabel `:root`.
7. **Komentar kode dalam Bahasa Indonesia**, mengikuti gaya yang sudah ada.
8. **Setiap gambar wajib punya `alt`** yang deskriptif (ornamen dekoratif boleh `alt=""`).
9. **Teks dari pengguna (ucapan tamu) selalu dirender dengan `textContent`**, tidak pernah dengan `innerHTML`.
10. **Jangan menaikkan versi library CDN** tanpa menguji ulang. Jika versi dinaikkan, hitung ulang hash `integrity` (sha384).
11. **Jangan commit ke `main` secara langsung.** Buat branch, lalu Pull Request.

---

## 3. Data mempelai (sumber kebenaran)

Jika ada perbedaan antara file dan daftar ini, tanyakan dulu ke pemilik sebelum mengubah.

- Mempelai pria: **Syaif Rahid Safauzan** (Syaif), putra pertama dari Bapak Ayi Ruswandi & Ibu Ririn Sulistyawati. Instagram `@syaifrs`.
- Mempelai wanita: **Prasasti** (Sasti), putri ketiga dari Bapak Suradi Harto & Ibu Sri Mulyani. Instagram `@saliciaa_`.
- Akad nikah: Sabtu, 26 Desember 2026, **pukul 09.00 WIB** (tanpa jam selesai).
- Resepsi: Sabtu, 26 Desember 2026, **pukul 11.00–13.00 WIB**.
- Lokasi (akad & resepsi sama): Jl. Bedahan RT 05 RW 01, Pabuaran Mekar, Kec. Cibinong, Kabupaten Bogor.
- Hadiah: BCA 6830631559 a.n. Prasasti. Alamat kado: Komplek IPB 4 Blok C No. 53, Tanah Baru, Bogor Utara 16154.
- Kisah: bertemu 2023 di tempat kerja → lamaran 15 Agustus 2026 → menikah 26 Desember 2026.
- Undangan bersifat umum (tidak ada nama tamu dari parameter URL).

Jika data berubah, ubah **di semua tempat**:
- Tanggal/jam: `index.html` (section `#acara`, `#hero`, `#penutup`, atribut `datetime`) **dan** `js/config.js` (`countdownTarget`, `calendar.startUtc/endUtc`).
- Nomor rekening: teks `#bank-number` **dan** atribut `data-copy` tombolnya di `index.html`.
- Alamat kado: teks `.gift__address` **dan** atribut `data-copy` tombolnya.

---

## 4. Cara menambah / mengganti foto galeri

1. Siapkan foto (JPG/PNG). Disarankan landscape, minimal 1600px sisi panjang.
2. Dari root repo:
   ```bash
   pip install pillow
   python3 tools/optimize_images.py /path/foto1.jpg /path/foto2.jpg
   ```
   Skrip membuat `assets/images/gallery/gNN.webp` + `gNN_thumb.webp` dan mencetak baris objek.
3. Tempel baris tersebut ke array `GALLERY` di `js/config.js`, lalu **ganti `alt`** dengan deskripsi foto dalam Bahasa Indonesia.
4. Urutan di array = urutan tampil. Dua foto pertama tampil besar di desktop; foto pertama tampil penuh di mobile.
5. Untuk mengganti foto lama, timpa file `gNN.webp`/`gNN_thumb.webp` dengan nomor yang sama (pakai `--start NN`) dan perbarui `w`, `h`, `alt`.
6. Batas wajar: ≤ 18 foto agar halaman tetap ringan.

**Foto mempelai** (`assets/images/groom.webp`, `bride.webp`): potret rasio **3:4**, wajah di sepertiga atas, ±660×880px, WebP kualitas ~84.

**Latar 3D hero** (`palace_bg.webp` 2048px dan `palace_bg_mobile.webp` 1280px): rasio ~16:9. Gapura (`gate_left.webp`, `gate_right.webp`) harus **berlatar transparan**.

---

## 5. Musik

- File: `assets/audio/gamelan-kraton.ogg` (utama) + `gamelan-kraton.mp3` (cadangan Safari).
- Sumber: "Gamelan angka 2 Kraton Ngayogyakarta" oleh RTB45, Wikimedia Commons, lisensi **CC BY 4.0**.
  Rekaman musisi istana Kraton Yogyakarta. **Kredit di footer wajib tetap ada** selama musik ini dipakai.
- Mengganti musik: taruh file baru di `assets/audio/`, ubah `ASSETS.music` di `js/config.js`, dan **perbarui kredit di footer**.
  Hanya gunakan musik yang lisensinya mengizinkan (milik sendiri, CC BY/CC0, atau sudah berlisensi). Jangan pakai lagu komersial tanpa izin.
- Musik baru diputar setelah tombol "Buka Undangan" ditekan (aturan autoplay browser). Jangan ubah ini menjadi autoplay.

---

## 6. RSVP & Ucapan

- Mode saat ini: **localStorage** (`STORAGE.apiEndpoint = null`). Ucapan hanya tersimpan di browser tamu masing-masing.
- Untuk menyambungkan backend, isi `STORAGE.apiEndpoint` di `js/config.js` dengan URL yang mendukung:
  - `GET  {endpoint}` → JSON array `[{ name, attendance: "hadir"|"tidak", guests, message, createdAt }]`
  - `POST {endpoint}` dengan body JSON objek di atas → mengembalikan objek yang tersimpan
  - Header CORS harus mengizinkan domain website.
- Validasi & batasi panjang input juga **di sisi server** (nama ≤ 50, pesan ≤ 300 karakter). Jangan simpan kredensial/API key di file frontend.
- Jika memakai Google Apps Script: perhatikan bahwa Apps Script tidak menerima `Content-Type: application/json` tanpa preflight. Sesuaikan fungsi `wishStore` di `js/main.js` (misalnya kirim `text/plain`), lalu uji.

---

## 7. Deploy (GitHub Pages)

1. Pastikan perubahan sudah di-merge ke `main` lewat Pull Request.
2. GitHub → **Settings → Pages → Build and deployment** → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)`.
3. Tunggu 1–2 menit. URL: `https://hydroneuroforge-create.github.io/bahanweb3dwedding/`.
4. Semua path di proyek bersifat **relatif** (tanpa `/` di depan). Pertahankan ini agar bekerja di subfolder Pages.
5. Jika memakai domain sendiri, tambahkan file `CNAME` berisi nama domain, lalu ubah `og:image` di `index.html` menjadi URL absolut agar pratinjau WhatsApp muncul.

---

## 8. Checklist wajib sebelum commit / PR

Jalankan server lokal dari root repo:
```bash
python3 -m http.server 8000
# buka http://localhost:8000
```
Periksa:
- [ ] Console browser **tanpa error** (DevTools → Console).
- [ ] Loading screen hilang, hero 3D tampil, tombol "Buka Undangan" membuka gapura dan menggulir ke ayat.
- [ ] Musik berputar setelah dibuka; tombol musik bisa jeda/putar.
- [ ] Countdown berjalan.
- [ ] Galeri: semua foto tampil, lightbox bisa dibuka, panah kiri/kanan dan Esc berfungsi.
- [ ] Form RSVP: validasi muncul bila kosong, ucapan baru tampil dan tetap ada setelah reload.
- [ ] Tombol "Salin Nomor"/"Salin Alamat" menampilkan toast.
- [ ] Tampilan mobile (lebar 390px) tidak ada scroll horizontal; tombol nyaman disentuh.
- [ ] Tidak ada nama klinik yang tampil; ayat tidak berubah.

Format commit: kalimat perintah singkat dalam Bahasa Indonesia, contoh `Tambah 6 foto prewedding ke galeri`.
