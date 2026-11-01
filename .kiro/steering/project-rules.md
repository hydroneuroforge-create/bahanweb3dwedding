---
inclusion: always
---
# Aturan proyek undangan Syaif & Sasti

Aturan lengkap ada di #[[file:AGENTS.md]]. Ringkasan wajib:
- Dua versi: sinematik (`index.html` + `js/sinema/`) dan klasik (`klasik.html`). Data berubah → ubah keduanya.
- Alur 3D, kamera, latar, efek, suara, galeri versi sinematik diatur di `js/sinema/cerita.js`.
- Website statis tanpa build step. Jangan tambahkan framework atau npm.
- Jangan ubah teks QS. Ar-Rum (30):21 tanpa verifikasi mushaf.
- Jangan tampilkan nama klinik (baik dari Google Maps maupun klinik tempat kerja di kisah).
- Gambar baru: latar lewat `tools/prepare_scene_assets.py depth`, potongan lewat `... cutout --white`, foto galeri lewat `tools/optimize_images.py`. Jangan hapus `bahan web 3d/`.
- Kredit musik & suara (CC BY / CC BY-SA) wajib tetap ada.
- Uji di lebar 390px; komentar kode Bahasa Indonesia; kerjakan di branch + PR.
