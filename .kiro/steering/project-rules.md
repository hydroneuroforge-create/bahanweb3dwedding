---
inclusion: always
---
# Aturan proyek undangan Syaif & Sasti

Aturan lengkap ada di #[[file:AGENTS.md]]. Ringkasan wajib:
- Website statis tanpa build step. Jangan tambahkan framework atau npm.
- Data JavaScript (galeri, tanggal, maps, musik, penyimpanan) di `js/config.js`; teks tampilan di `index.html`.
- Jangan ubah teks QS. Ar-Rum (30):21 tanpa verifikasi mushaf.
- Jangan tampilkan nama klinik dari Google Maps; hanya alamat + tombol "Lihat Lokasi".
- Foto baru wajib lewat `tools/optimize_images.py`; jangan hapus `bahan web 3d/`.
- Kredit musik CC BY 4.0 di footer wajib tetap ada.
- Komentar kode dalam Bahasa Indonesia, tanpa inline style, kerjakan di branch + PR.
