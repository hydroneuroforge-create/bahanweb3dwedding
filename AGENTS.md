# AGENTS.md — Aturan untuk Agent (Hermes & lainnya)

Dokumen ini berisi aturan wajib bagi AI agent yang mengedit, menambah konten, atau men-deploy
website undangan pernikahan **Syaif & Sasti**. Baca seluruh dokumen sebelum mengubah file apa pun.
Untuk konteks umum, lihat juga `README.md`.

---

## 1. Gambaran proyek

Ada **dua versi** undangan dalam satu repo:

| Versi | File utama | Keterangan |
|---|---|---|
| **Sinematik (utama)** | `index.html`, `css/sinema.css`, `js/sinema/*.js` | Perjalanan 3D penuh yang dikendalikan gulir, dioptimalkan untuk HP (portrait). Lihat **bagian 9**. |
| Klasik (cadangan) | `klasik.html`, `css/style.css`, `js/config.js`, `js/scene.js`, `js/main.js` | Halaman gulir biasa dengan hero 3D. Dibuka otomatis bila WebGL tidak tersedia, dan lewat menu "versi ringan". |

- Website statis. **Tanpa build step, tanpa framework, tanpa npm.**
- Library dimuat dari CDN jsDelivr dengan versi terkunci:
  - Three.js `0.187.0`. Versi sinematik memakai *import map* di `index.html` (termasuk `three/addons/` untuk efek bloom). Versi klasik memakai konstanta `THREE_URL` di `js/scene.js`.
  - Versi klasik juga memakai GSAP + ScrollTrigger `3.15.0` dan Lenis `1.3.27` (tag `<script>` di `klasik.html`, dengan atribut `integrity`).
- Target hosting: **GitHub Pages** dari root repo. File `.nojekyll` wajib tetap ada.
- **Data yang sama ada di dua versi** (teks di `index.html` & `klasik.html`; data JS di `js/sinema/cerita.js` & `js/config.js`). Jika data mempelai/acara/hadiah/galeri berubah, **ubah keduanya**.

### Peta file

| File | Isi | Boleh diubah? |
|---|---|---|
| `index.html` | Versi sinematik: teks tiap adegan (`<section class="bab">`), sampul, dialog RSVP | Ya, isinya. Jangan ubah struktur class/id/atribut `data-*` |
| `js/sinema/cerita.js` | **Naskah**: urutan bab, latar, lapisan, gerak kamera, suasana waktu, efek, suara, galeri, data acara | Ya. **Tempat utama mengubah alur & data versi sinematik** |
| `js/sinema/dunia.js` | Mesin Three.js (langit, latar 2.5D, partikel, transisi, kualitas adaptif) | Hanya bila diminta |
| `js/sinema/main.js` | Gulir, teks adegan, suara, menu, countdown, galeri, RSVP, salin | Hanya bila diminta |
| `css/sinema.css` | Gaya versi sinematik | Hanya bila diminta |
| `klasik.html`, `js/config.js`, `css/style.css`, `js/scene.js`, `js/main.js` | Versi klasik | Samakan data bila data berubah |
| `assets/scenes/` | Latar adegan + peta kedalaman (`*_depth.webp`) + potongan tokoh/objek transparan | Lewat `tools/prepare_scene_assets.py` |
| `assets/images/` | Gambar teroptimasi (galeri, gapura, foto mempelai versi klasik, og-image) | Lewat `tools/optimize_images.py` |
| `assets/audio/` | Musik gamelan + `sfx/` (gong & suara alam) | Lihat bagian 5 |
| `bahan web 3d/` dan `bahan web 3d/v2/` | **Aset asli resolusi penuh. JANGAN dihapus/diubah.** | Tidak |
| `docs/PROMPT_GAMBAR.md` | Daftar prompt Nano Banana untuk gambar adegan baru | Ya |
| `tools/siapkan_deploy.sh` | Menyiapkan folder `_deploy/` (website saja) untuk Cloudflare Pages, lihat bagian 7b | Jangan diubah tanpa diminta |

---

## 2. Aturan wajib (jangan dilanggar)

1. **Jangan tambahkan framework, bundler, atau `package.json`.** Website harus bisa jalan dengan server statis biasa.
2. **Jangan ubah teks ayat QS. Ar-Rum (30):21** (bab `nama` di `index.html` dan section `#salam` di `klasik.html`). Teks Arab diambil dari mushaf Utsmani dan terjemahan dari Kemenag RI. Jika diminta menggantinya, verifikasi dulu ke sumber resmi (misalnya https://quran.kemenag.go.id/quran/per-ayat/surah/30?from=21).
3. **Jangan tampilkan nama tempat dari Google Maps.** Link maps (`https://maps.app.goo.gl/T7Qgc8HXHPjVvXiM7`) mengarah ke sebuah klinik. Atas permintaan mempelai, nama klinik **tidak boleh** muncul di halaman. Yang tampil hanya alamat jalan dan tombol "Lihat Lokasi". Jangan pasang iframe/embed peta.
4. **Jangan masukkan foto mentah** (JPG besar dari HP/kamera) langsung ke halaman. Selalu jalankan `tools/optimize_images.py` (bagian 4).
5. **Jangan hapus atau ubah id/class** yang dipakai JavaScript. Versi sinematik: `#dunia`, `#sampul`, `#buka`, `#naskah`, `.bab[data-bab]`, `.adegan[data-t]`, `#ruang-gulir`, `#kontrol`, `#menu*`, `#tombol-*`, `#hitung`, `#galeri-akses`, `#lembar-*`, `[data-buka]`, `[data-tutup]`, `#tautan-*`, `#ulang`, `#stat-*`, `#ucapan-cuplikan`. Versi klasik: `#loader`, `#scene-canvas`, `#open-invitation`, `#gallery`, `#lightbox*`, `#rsvp-*`, `#wishes-list`, `#countdown`, `[data-unit]`, `[data-copy]`, `[data-reveal]`, `[data-reveal-group]`, `[data-reveal-stagger]`, `[data-hero-item]`, `#dock`, `#music-toggle`, `#bg-music`, `#maps-link`, `#calendar-link`, `#toast`.
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
  Tempat kerja = **klinik terapi anak** (ayunan sensori, gym ball, alat terapi sensori). Keduanya bekerja di sana. **Nama klinik tidak ditampilkan.**
- Undangan bersifat umum (tidak ada nama tamu dari parameter URL).

Jika data berubah, ubah **di semua tempat** (versi sinematik `index.html` + `js/sinema/cerita.js` → `DATA`, dan versi klasik):
- Tanggal/jam: teks & atribut `datetime` di `index.html` dan `klasik.html`, **serta** `countdownTarget` + data kalender di `js/sinema/cerita.js` dan `js/config.js`.
- Nomor rekening: teks nomor **dan** atribut `data-copy` tombolnya, di `index.html` dan `klasik.html`.
- Alamat kado: teks alamat **dan** atribut `data-copy` tombolnya, di kedua file HTML.

---

## 4. Cara menambah / mengganti foto galeri

1. Siapkan foto (JPG/PNG). Disarankan landscape, minimal 1600px sisi panjang.
2. Dari root repo:
   ```bash
   pip install pillow
   python3 tools/optimize_images.py /path/foto1.jpg /path/foto2.jpg
   ```
   Skrip membuat `assets/images/gallery/gNN.webp` + `gNN_thumb.webp` dan mencetak baris objek.
3. Tempel baris tersebut ke array **`GALERI` di `js/sinema/cerita.js`** dan array **`GALLERY` di `js/config.js`**, lalu **ganti `alt`** dengan deskripsi foto dalam Bahasa Indonesia.
   Di versi sinematik, setiap foto otomatis menjadi bingkai emas yang dilewati kamera di bab `galeri`. Durasi bab `galeri` sebaiknya ±0,6 × jumlah foto (minimal 3).
4. Urutan di array = urutan tampil.
5. Untuk mengganti foto lama, timpa file `gNN.webp`/`gNN_thumb.webp` dengan nomor yang sama (pakai `--start NN`) dan perbarui `w`, `h`, `alt`.
6. Batas wajar: ≤ 12 foto di versi sinematik (semua thumbnail dimuat sebagai tekstur 3D).

**Foto mempelai** (`assets/images/groom.webp`, `bride.webp`): potret rasio **3:4**, wajah di sepertiga atas, ±660×880px, WebP kualitas ~84.

**Latar 3D hero** (`palace_bg.webp` 2048px dan `palace_bg_mobile.webp` 1280px): rasio ~16:9. Gapura (`gate_left.webp`, `gate_right.webp`) harus **berlatar transparan**.

---

## 5. Musik

- Lagu utama: `assets/audio/lagu-utama.mp3` — “When You Tell Me That You Love Me” (Diana Ross), piano cover oleh Riyandi Kusuma, **dipilih & diunggah oleh pemilik** (sumber asli di `bahan web 3d/v3/`). Kredit tampil di bab penutup & footer klasik. Volume di `SUARA.volumeMusik` (`cerita.js`).
- Efek & suasana (versi sinematik) di `assets/audio/sfx/`: `gong.mp3`, `amb-burung.mp3`, `amb-air.mp3`, `amb-jangkrik.mp3`. Volume suasana diatur per bab lewat properti `suara` di `js/sinema/cerita.js`. Sumber & lisensinya ada di `README.md` bagian Kredit.
- Mengganti musik: taruh file baru di `assets/audio/`, ubah `SUARA.musik` di `js/sinema/cerita.js` dan `ASSETS.music` di `js/config.js`, lalu **perbarui kredit** (bab `penutup` di `index.html` dan footer `klasik.html`).
  Hanya gunakan musik yang lisensinya mengizinkan (milik sendiri, CC BY/CC0, atau sudah berlisensi). Jangan pakai lagu komersial tanpa izin.
- Musik baru diputar setelah tombol "Buka Undangan" ditekan (aturan autoplay browser). Jangan ubah ini menjadi autoplay.

---

## 6. RSVP & Ucapan

- Mode saat ini: **localStorage** (`STORAGE.apiEndpoint = null`). Ucapan hanya tersimpan di browser tamu masing-masing.
- Untuk menyambungkan backend, isi `DATA.penyimpanan.apiEndpoint` di `js/sinema/cerita.js` **dan** `STORAGE.apiEndpoint` di `js/config.js` dengan URL yang mendukung:
  - `GET  {endpoint}` → JSON array `[{ name, attendance: "hadir"|"tidak", guests, message, createdAt }]`
  - `POST {endpoint}` dengan body JSON objek di atas → mengembalikan objek yang tersimpan
  - Header CORS harus mengizinkan domain website.
- Validasi & batasi panjang input juga **di sisi server** (nama ≤ 50, pesan ≤ 300 karakter). Jangan simpan kredensial/API key di file frontend.
- Jika memakai Google Apps Script: perhatikan bahwa Apps Script tidak menerima `Content-Type: application/json` tanpa preflight. Sesuaikan objek `toko` di `js/sinema/main.js` dan `wishStore` di `js/main.js` (misalnya kirim `text/plain`), lalu uji.

---

## 7. Deploy (GitHub Pages)

1. Pastikan perubahan sudah di-merge ke `main` lewat Pull Request.
2. GitHub → **Settings → Pages → Build and deployment** → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)`.
3. Tunggu 1–2 menit. URL: `https://hydroneuroforge-create.github.io/bahanweb3dwedding/`.
4. Semua path di proyek bersifat **relatif** (tanpa `/` di depan). Pertahankan ini agar bekerja di subfolder Pages.
5. Jika memakai domain sendiri, tambahkan file `CNAME` berisi nama domain, lalu ubah `og:image` di `index.html` menjadi URL absolut agar pratinjau WhatsApp muncul.

### 7b. Deploy sementara ke Cloudflare Pages (pratinjau di HP)

Dipakai pemilik untuk mencoba versi terbaru di HP **sebelum** merge ke `main`. Versi yang di-deploy diambil dari
branch kerja (saat ini `feature/undangan-sinematik`), **bukan** dari `main`. Deploy ini **mengganti** versi lama
di project Cloudflare yang sama, sehingga URL tetap sama.

**Aturan:**
1. **Jangan merge, jangan commit ke `main`, dan jangan mengubah file website** untuk keperluan deploy. Deploy hanya membaca isi branch.
2. Kredensial Cloudflare (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) hanya lewat environment variable / secret.
   **Jangan pernah** menulisnya ke file, commit, atau menampilkannya di log/chat. Token cukup berizin *Cloudflare Pages: Edit*.
3. Yang diunggah **hanya** isi folder `_deploy/` hasil `tools/siapkan_deploy.sh` (website saja).
   Jangan unggah root repo: `bahan web 3d/`, `tools/`, `docs/`, `.git`, `AGENTS.md` tidak boleh ikut publik.
4. **Pakai project Cloudflare Pages yang sudah ada** (yang dulu dipakai untuk versi lama). Jangan membuat project baru
   kecuali pemilik memintanya atau memang belum ada project sama sekali. Jangan menghapus project/deployment lama.
5. `_deploy/` dan `.wrangler/` sudah di-`.gitignore`. Jangan di-commit.

**Langkah:**
```bash
git fetch origin
git checkout feature/undangan-sinematik
git pull --ff-only
git log --oneline -1                  # catat hash commit yang di-deploy

bash tools/siapkan_deploy.sh          # harus berakhir "OK  _deploy siap: ... 11 klip transisi"

npx wrangler@latest pages project list
# Pilih project undangan yang sudah ada (nama & domain *.pages.dev-nya). Lalu cari branch produksinya:
npx wrangler@latest pages deployment list --project-name <NAMA_PROJECT>
# Lihat baris Environment "Production" → kolom Branch (biasanya "main").

npx wrangler@latest pages deploy _deploy --project-name <NAMA_PROJECT> --branch <BRANCH_PRODUKSI> \
  --commit-hash "$(git rev-parse HEAD)" --commit-message "Pratinjau versi sinematik terbaru" --commit-dirty=true
```
- `--branch` **harus sama** dengan branch produksi project, agar URL utama (`https://<NAMA_PROJECT>.pages.dev`) langsung
  menampilkan versi baru. Branch lain hanya menghasilkan URL pratinjau dan versi lama tetap tampil di URL utama.
- Cara ini juga berlaku bila project dulu dibuat lewat Git integration (wrangler boleh membuat deployment manual).
- Jika belum ada project sama sekali: `npx wrangler@latest pages project create undangan-syaif-sasti --production-branch main`, lalu deploy dengan `--branch main`.

**Verifikasi setelah deploy (wajib, laporkan hasilnya ke pemilik):**
```bash
URL=https://<NAMA_PROJECT>.pages.dev
for p in "" klasik.html js/sinema/main.js assets/video/transisi/t01.mp4 assets/video/transisi/t12.mp4 assets/audio/lagu-utama.mp3; do
  printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$URL/$p")" "/$p"
done                                                   # semua harus 200
curl -s "$URL/js/sinema/main.js" | grep -c tertutupKlip  # harus ≥ 1 (tanda versi terbaru)
curl -s -o /dev/null -w '%{http_code}\n' "$URL/bahan%20web%203d/"   # harus 404 (bahan mentah tidak ikut)
```
Laporkan ke pemilik: URL utama, hash commit yang di-deploy, hasil verifikasi. Ingatkan pemilik membuka URL di HP
lewat **tab penyamaran / setelah menghapus cache**, karena browser bisa masih menyimpan versi lama.

---

## 8. Checklist wajib sebelum commit / PR

Jalankan server lokal dari root repo:
```bash
python3 -m http.server 8000
# buka http://localhost:8000 (sinematik) dan http://localhost:8000/klasik.html
```
Uji di mode HP (DevTools → Toggle device toolbar, lebar 390px) **dan** desktop. Periksa:
- [ ] Console browser **tanpa error**.
- [ ] Loading selesai, sampul gunungan tampil, "Buka Undangan" membelah gunungan, gong berbunyi, gapura terbuka.
- [ ] Gulir dari awal sampai akhir: setiap bab tampil, teks muncul/hilang dengan mulus, tidak ada teks yang saling tumpuk atau terpotong.
- [ ] Menu (ikon ☰) bisa melompat ke setiap bab. Tombol suara mematikan/menyalakan semua suara.
- [ ] Countdown berjalan. Galeri: mengetuk foto 3D atau thumbnail membuka lightbox.
- [ ] RSVP: validasi muncul bila kosong, ucapan tampil di cuplikan & daftar, tetap ada setelah reload.
- [ ] "Salin Nomor"/"Salin Alamat" menampilkan toast.
- [ ] `klasik.html` juga masih berfungsi.
- [ ] Tidak ada nama klinik yang tampil; ayat tidak berubah.

Format commit: kalimat perintah singkat dalam Bahasa Indonesia, contoh `Tambah 6 foto prewedding ke galeri`.

---

## 9. Versi sinematik — cara kerja & cara mengedit

### Konsep
Halaman punya `#ruang-gulir` yang sangat tinggi. Posisi gulir diubah menjadi **posisi cerita** (satuan gulir).
Kamera Three.js bergerak menembus **bab-bab** yang disusun di `BAB` (`js/sinema/cerita.js`). Teks di `index.html`
muncul berdasarkan **waktu lokal bab** `t` (0 = awal bab, 1 = akhir bab) lewat atribut `data-t="muncul,hilang"`.

Setiap bab terdiri dari:
- `waktu` : nama suasana dari `WAKTU` (warna langit, matahari, kabut, awan, bintang, bloom).
- `latar` : gambar latar + peta kedalaman → mesh 3D (parallax nyata). `warna` bisa mewarnai ulang (mis. `MALAM`).
- `lapisan`: objek di depan latar: `potongan` (gambar transparan), `jenis: 'kabut'`, `jenis: 'sinar'`. Bisa diberi `gerak`.
- `kamera`: titik kunci `{ t, pos, lihat }` atau `{ t, uv, jarak, geser }` (lihat komentar di atas `cerita.js`).
  Untuk menyorot tokoh pakai `{ t, fokus: N, isi: 0.6, naik: 0.3 }` (N = indeks lapisan). `isi` = bagian tinggi layar yang diisi tokoh. **Mempelai minimal `isi` 0.6** agar tidak terlihat kecil (permintaan pemilik), dan wajah tidak boleh tertutup kartu teks (atur `naik`).
  Saat menyorot tokoh, beri `kabur: 1.5–2.2` (latar kabur seperti lensa kamera). Tokoh diberi `bayangan: true` (bayangan kaki), `rona` (0..1, seberapa kuat warna suasana mewarnai tokoh), dan `maju` 15–20 agar latar tidak diperbesar berlebihan.
- `efek` : `kelopak`, `kilau`, `kunang`, `lampion`, `burung`, `kembangApi` (0..1).
- `suara`: `burung`, `air`, `jangkrik` (0..1).
- `transisi`: **`{ jenis: 'tembus', ke: [u, v] }`** (bawaan, permintaan pemilik: "yang nyambung"). Kamera terbang masuk ke titik jembatan `(u,v)` di latar (pintu/jendela/jalan/langit) lalu adegan berikutnya mekar dari tengah bukaan. Pilih titik yang benar-benar berupa bukaan/benda di gambar. Jenis lama `tirai`, `kabut`, `cahaya`, `malam` masih ada, tetapi **jangan dipakai kecuali diminta** (pemilik menilai terlalu terang / kurang nyambung).
- Semua latar melewati **filter film seragam** + penyamaan kecerahan otomatis (`buatLatar` di `dunia.js`). Untuk adegan yang memang harus gelap/terang khusus, beri `latar.samakan: false`.

### Menambah gambar adegan baru (dari `docs/PROMPT_GAMBAR.md`)
Model AI diunduh otomatis (±280 MB, sekali). Pasang dulu: `pip install pillow numpy onnxruntime`.

1. **Latar (kode B)** → buat warna + peta kedalaman:
   ```bash
   python3 tools/prepare_scene_assets.py depth "bahan web 3d/v2/B3_klinik_terapi.png" assets/scenes/klinik
   ```
   Lalu daftarkan di `LATAR` (`cerita.js`): `klinik: { src: S + 'klinik.webp', depth: S + 'klinik_depth.webp' }`.
2. **Objek/tokoh (kode L dan C)** → hapus latar putih:
   ```bash
   python3 tools/prepare_scene_assets.py cutout "bahan web 3d/v2/C2_terapis_klinik.png" assets/scenes/c2_terapis.webp --white
   ```
   Lalu daftarkan di `POTONGAN`. **Selalu periksa hasil potongan secara visual** (tepi rambut/daun).
3. **Pakai di bab**: tambahkan/ubah objek di `BAB`. Pola yang disarankan untuk gambar portrait 9:16:
   `latar: { gambar: 'klinik', z: -40, tinggi: 60, kedalaman: 12, warna: NORMAL }` dan kamera `uv` berjarak 55–75.
   Tokoh diletakkan sebagai `potongan` dengan `pos: [x, y, z]` di antara kamera dan latar (z −10 … +3),
   `tinggi` 4–7, dan `gerak` muncul (`dari: { o: 0, y: … }, ke: { o: 1 }`).
4. **Adegan kini memakai gambar v3** (`bahan web 3d/v3/bahan web baru 11 gambar/` → `assets/scenes/v3/sNN_*.webp`), di mana tokoh sudah tergambar di dalam latar. Peta lama v2 di bawah hanya sebagai arsip.

   **Peta gambar v2 (arsip)** (file asli di `bahan web 3d/v2/bahan1|bahan2/`):

   | Bab | Latar | Potongan | File asli (akhiran nama) |
   |---|---|---|---|
   | `kampung` | `b1_kampung` | `kuntul`, `kelapa` | `e39872d3` (B1), `55151a2b` (L10), `92d2136e` (L3) |
   | `desa` | `b2_desa` (diputar `--putar 90`) | `daun` | `5847db41` (B2), `411a0c89` (L2) |
   | `klinik` | `b3_klinik` | `terapis` | `c2e1d765` (B3), `f17b1894` (C2) |
   | `sawah` | `b10_sawah` | `jalan` | `03f0f6ec` (B10), `d76b3ab9` (C1) |
   | `lamaran` | `b4_lamaran` | `lamaran` | `7345b596` (B4), `2c706cdb` (C3) |
   | `alun` | `b5_alun` | `kuntul` | `db9a19c8` (B5) |
   | `acara` | `b6_pelaminan` | `pelaminan`, `gong` | `a459d81e` (B6), `c3e0083d` (C4), `d31d737d` (L6) |
   | `galeri` | `b7_lorong` | (lampion) | `16e8c1d9` (B7), `3c1881e8` (L5) |
   | `senja` | `b8_teratai` | – | `07c092e4` (B8) |
   | `penutup` | `b9_malam` | `lepasLampion` | `55791683` (B9), `6c5351d3` (C5) |

   Cadangan yang belum dipakai (boleh dipakai untuk variasi): `23` alternatif kampung (`f8de0ad3`), alun-alun lain (`7f04c97f`),
   sawah lain (`bb0fadaa`), lorong lain (`59da9b2b`), teratai lain (`9b36950c`), malam lain (`18c23926`), pelaminan lain (`ee4941be`),
   lamaran lain (`6522067b`, tersimpan miring → `--putar 90`), jalan desa lain (`5e9cb6ed`, miring → `--putar 90`),
   melambai (`418f78ae` → `c6_melambai.webp`), gunungan (`150e907e` → `l1_gunungan.webp`, `9e770558`),
   papan ukir (`d1e4bd37`, `31be4cbc`), lontar (`20cea75d`, `84f1c259`), joglo (`11c000bd`, `4dc71dee`), gong lain (`1eda886b`).
   **Beberapa gambar hasil generate tersimpan miring 90°**: selalu periksa orientasi sebelum memproses.
5. Setiap menambah bab baru: tambahkan juga `<section class="bab" data-bab="ID">` di `index.html` (boleh kosong).

### Aturan khusus versi sinematik
- **Uji di lebar 390px dulu.** Teks harus terbaca dan tidak menutupi wajah tokoh. Posisi teks: `adegan--atas`, `adegan--tengah`, `adegan--bawah`.
- Rentang `data-t` antar teks dalam satu bab **jangan tumpang tindih** lebih dari 0,02.
- Ukuran total aset `assets/` sebaiknya ≤ 20 MB. Latar maks 2048 px sisi panjang, potongan maks 1200 px.
- Jangan menambah jumlah partikel di `dunia.js` tanpa uji kinerja. Mesin otomatis menurunkan resolusi & mematikan bloom bila fps < 42.
- Formulir & daftar ucapan selalu di dalam `<dialog>`; gulir halaman dikunci saat dialog terbuka. Jangan pindahkan formulir ke luar dialog.
- Gambar baru dibuat **berurutan dengan gambar sebelumnya sebagai referensi**, mengikuti `docs/PROMPT_GAMBAR.md` versi 3 (gambar v3 → `bahan web 3d/v3/`). Bila tokoh sudah tergambar di dalam latar (v3), cukup pakai `depth` — tidak perlu potongan tokoh terpisah.
- Untuk latar yang memuat tokoh, buat peta kedalaman dengan `--ratakan-orang` agar wajah tidak tampak penyok/tertarik saat kamera bergerak.
  Opsi ini meratakan tokoh **dan** area ±3% lebar gambar di sekelilingnya, sehingga regangan mesh jatuh di latar, bukan di tepi wajah.
  Simpan hanya `_depth.webp` yang baru bila gambar warnanya tidak berubah.
- Partikel (kilau, kunang, lampion, kembang api) dibatasi ukurannya dan memudar bila terlalu dekat kamera. Jangan hapus batas ini:
  tanpa batas, satu partikel di depan lensa bisa menutupi layar dengan warna oranye polos.
- Semua shader & tekstur diunggah ke GPU saat loading (`siapkanGPU`). Tekstur baru harus lewat `this.tex` agar ikut diunggah.

### Klip transisi video (Google Flow)
- Prompt & pasangan frame: `docs/PROMPT_TRANSISI_FLOW.md` dan `bahan web 3d/flow-transisi/TNN_*/` (`1_AWAL.jpg`, `2_AKHIR.jpg`).
  Hasil mentah dari Flow diunggah ke `bahan web 3d/flow-transisi/` (tidak dipakai langsung oleh website).
- Klip siap pakai ada di `assets/video/transisi/tNN.mp4` (720×1280 = resolusi asli Flow, H.264 CRF 24 `-tune film`,
  keyframe tiap 6 frame, tanpa audio; total ±48 MB, dimuat dua bab sebelum dibutuhkan).
  Buat ulang semuanya sekaligus: `tools/buat_semua_klip.sh <folder_acuan> [720|540]` (resep tiap klip ada di skrip itu).
  Selama video menutup layar penuh, 3D tidak dirender (`dunia.tertutupKlip`) agar GPU bebas memutar video.
  Selalu olah lewat `tools/olah_klip.py`. Alat ini memotong/membalik/menyambung segmen, mengurangi kedip & bintik AI,
  dan **menyamakan warna klip dengan render 3D** di kedua batas (koreksi berubah halus dari awal ke akhir klip):
  ```bash
  python3 tools/olah_klip.py --segmen "bahan web 3d/flow-transisi/T04A_xxx.mp4:0:7.7" \
    --segmen "bahan web 3d/flow-transisi/T04B_xxx.mp4:0:8:balik" --silang 0.7 \
    --acuan-awal batas/t04_awal.png --acuan-akhir batas/t04_akhir.png --crf 27 --keluar assets/video/transisi/t04.mp4
  ```
  `batas/tNN_awal.png` & `tNN_akhir.png` = screenshot kanvas 3D (360×640, tanpa teks/vinyet/video) tepat di akhir bab asal
  dan di awal bab tujuan. `--cari-awal`/`--cari-akhir` memotong klip di frame yang paling mirip gambar acuan
  (dipakai di T11 agar mulai dari ujung lorong galeri).
  `--cahaya MULAI:SELESAI:KUAT` menambah kilau hangat lembut untuk menyamarkan momen morph (mis. baju berganti).
  Resep yang dipakai: T01, T05, T07, T08, T10, T12 utuh; T02 = T02A 0–6 + T02B 0–6 dibalik (silang 0,6);
  T03 `--cahaya 4.0:6.2:0.35`; T04 = T04A 0–7,7 + T04B 0–8 dibalik (silang 0,7); T06 `--cahaya 1.7:3.5:0.55`
  (kemeja mempelai pria berganti dari polos ke batik); T11 `--cari-awal t11_awal.png`.
- T09 sengaja tidak dipakai: di akhir klip mempelai wanita tidak berhijab, sedangkan di adegan pelaminan berhijab.
  Buat ulang gambar Mempelai (berhijab), lalu T08 & T09. Batas mempelai → acara memakai transisi `tembus`.
- Bila satu klip first/last frame selalu glitch (posisi kamera dua adegan terlalu berbeda), buat dua klip dengan start frame saja
  yang sama-sama berakhir di benda penutup layar (daun, kabut). Klip B dibalik lalu disambung (`reverse` + `xfade`), seperti `t02.mp4`.
- Pasang di bab asal: `klip: { src, panjang }` di `cerita.js`. `panjang` = ruang gulir tambahan ≈ 0,3 × durasi video (detik).
  Video diputar mengikuti gulir (`main.js` → `klip`), diunduh sebagai blob satu bab sebelum dibutuhkan.
  Bila gagal termuat, `dunia.js` mencampur kedua adegan sebagai cadangan. Transisi `tembus` di bab itu otomatis tidak dipakai.
- Kamera di akhir bab asal dan di awal bab tujuan harus memperlihatkan **gambar utuh** (`uv: [0.5, 0.5], jarak: 70`)
  agar sama dengan frame awal/akhir klip.
