# Panduan Prompt Gambar BERSAMBUNG — Gemini Nano Banana (versi 3)

> **Ingin langsung pakai?** Buka [`PROMPT_SIAP_SALIN.md`](PROMPT_SIAP_SALIN.md): semua blok sudah digabung, tinggal unggah referensi lalu salin satu kotak prompt per gambar.

Tujuan: semua adegan terasa **satu perjalanan** — satu kampung, satu gaya, cahaya yang berganti wajar dari fajar
ke malam, dan setiap akhir adegan "menyambung" ke awal adegan berikutnya.

Versi sebelumnya membuat setiap gambar **terpisah**, sehingga sudut kamera, cahaya, dan lokasinya melompat.
Kuncinya sekarang: **setiap gambar dibuat dengan gambar sebelumnya sebagai referensi**, dan tokoh langsung
digambar **di dalam** adegannya (bukan ditempel).

---

## Aturan emas

1. **Buat berurutan**, nomor 1 → 12. Jangan lompat; setiap gambar menjadi referensi gambar berikutnya.
2. Setiap kali membuat gambar, **unggah referensi** (bisa beberapa gambar sekaligus di Nano Banana):
   - **R-GAYA** — selalu: `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gerbang keraton). Penjaga gaya & warna.
   - **R-SEBELUM** — gambar nomor sebelumnya yang sudah Anda pilih.
   - **R-TOKOH** — bila ada Syaif & Sasti: `Javanese_traditional_wedding_cou…_84a5ac03_2K.jpg` (wajah jelas)
     dan foto tokoh dengan busana yang sesuai adegan.
3. Salin **BLOK GAYA** + **BLOK KAMERA** + prompt adegan. Jangan ubah blok gaya & kamera antar gambar.
4. Format **vertikal 9:16**, resolusi tertinggi yang tersedia. Tanpa teks/huruf/watermark.
5. **Simpan dengan nama file sesuai kolom "Nama file"** (misalnya `S04_klinik.png`) — ini memudahkan pemasangan.
6. Periksa orientasi: gambar harus **tegak** (beberapa hasil sebelumnya tersimpan miring 90°).
7. Bila wajah tokoh berubah, ulangi dengan kalimat: *"Keep the faces exactly like the reference characters."*

---

## BLOK GAYA (tempel di awal setiap prompt)

```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.
```

## BLOK KAMERA (tempel setelah blok gaya)

```
Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.
```

## BLOK TOKOH (hanya untuk adegan bertokoh — tempel setelah blok kamera)

```
Also use the attached character images. Place the man and the woman NATURALLY INSIDE this scene,
full body, standing on the ground in the lower-middle part of the frame, large in the foreground
(their height about 55-65% of the image height), lit by the same light as the scene with matching
shadows on the ground and matching perspective.
Keep their faces, glasses, mustache, hairstyle and proportions exactly like the reference characters.
```

> **Penting:** mulai versi ini, tokoh **digambar di dalam adegan** oleh Nano Banana (satu gambar utuh).
> Hasilnya jauh lebih menyatu daripada tokoh yang ditempel terpisah.

---

## Urutan adegan & prompt

Kolom **Jembatan** = benda/bentuk di tengah gambar tempat kamera "menembus" ke adegan berikutnya.
Pastikan benda itu memang ada **di tengah** gambar.

| No | Nama file | Waktu | Referensi yang diunggah | Jembatan (di tengah gambar) |
|---|---|---|---|---|
| 1 | `S01_kampung.png` | fajar | R-GAYA | jalan setapak turun ke desa |
| 2 | `S02_jalan_desa.png` | pagi | R-GAYA + S01 | ujung lorong desa yang bercahaya |
| 3 | `S03_gerbang_klinik.png` *(opsional)* | pagi | R-GAYA + S02 | pintu klinik terbuka |
| 4 | `S04_klinik.png` | pagi menjelang siang | R-GAYA + S02/S03 + R-TOKOH (terapis) | jendela besar terang |
| 5 | `S05_sawah.png` | siang | R-GAYA + S04 + R-TOKOH (busana pengantin) | rumah joglo di ujung pematang |
| 6 | `S06_lamaran.png` | sore keemasan | R-GAYA + S05 + R-TOKOH (busana lamaran) | pintu rumah berhias janur |
| 7 | `S07_alun_alun.png` | sore cerah | R-GAYA + S06 | gerbang keraton di antara beringin |
| 8 | `S08_pelaminan.png` | sore, dalam ruang | R-GAYA + S07 + R-TOKOH (busana pengantin) | pintu tengah gebyok |
| 9 | `S09_lorong_lampion.png` | senja | R-GAYA + S08 | ujung lorong lampion |
| 10 | `S10_teratai.png` | senja ungu | R-GAYA + S09 | langit senja di atas paviliun |
| 11 | `S11_malam.png` | malam | R-GAYA + S10 + R-TOKOH (melepas lampion) | lampion naik ke langit |

### 1 — `S01_kampung.png` (fajar)
```
Scene: high view over a peaceful Javanese village at dawn, as if standing at the top of a hill
just after passing through the keraton gate of image 1. A winding dirt path starts at the bottom
center and leads down into the village in the exact center of the frame. Terraced rice fields,
joglo houses with terracotta roofs, coconut palms, soft layers of morning mist, a majestic volcano
in the far background, pink and gold sunrise sky in the upper third.
```

### 2 — `S02_jalan_desa.png` (pagi)
```
Scene: we have walked down the path from image 2 into the village. Eye-level view of a charming
village lane that goes straight ahead to a bright sunlit opening at the exact center of the frame.
Both sides: wooden joglo houses with terracotta roofs, woven bamboo fences, banana trees,
frangipani trees, clay pots. The same volcano is faintly visible far behind the opening.
Morning sunbeams through light mist.
```

### 3 — `S03_gerbang_klinik.png` (opsional, pagi)
```
Scene: at the end of the village lane from image 2 stands a small, warm, friendly pediatric therapy
clinic built in Javanese limasan style with carved wooden doors. The double doors in the exact
center of the frame are open, showing a bright colorful room inside. Potted plants and a small
garden in front. No sign, no name, no text.
```

### 4 — `S04_klinik.png` (bertokoh — terapis, 2023)
Referensi tokoh: `Pediatric_therapists_meeting_at_…_f17b1894.jpg` (busana kerja) + foto wajah.
```
Scene: inside the bright pediatric sensory therapy room behind the doors of the previous image.
A hanging sensory swing and hammock swing, colorful gym balls, foam mats, a ball pit,
tactile wall panels, Javanese carved wooden window frames and batik cushions.
A large bright window in the exact center of the back wall with warm daylight pouring in.
The two characters stand in the foreground as young pediatric therapists meeting for the first time,
shy friendly smiles, he holds a colorful gym ball, she holds a clipboard.
```
> Catatan busana Sasti: tulis *"with hijab"* atau *"without hijab, black hair in a neat bun"* sesuai keseharian Sasti.

### 5 — `S05_sawah.png` (bertokoh — berjalan, 2023–2026)
Referensi tokoh: `Couple_walking_in_wedding_attire_d76b3ab9.jpg`.
```
Scene: through the bright window of the previous image we arrive at lush green rice paddies under
a warm late-morning sun. A narrow dirt path between the paddies leads from the bottom center to a
small joglo house in the exact center of the frame. Egrets in the water, colorful scarecrow ribbons,
coconut palms, the same volcano in the far background.
The two characters walk hand in hand along the path away from the camera, seen from behind at a
slight three-quarter angle, looking at each other, large in the foreground.
```

### 6 — `S06_lamaran.png` (bertokoh — lamaran, 15 Agustus 2026)
Referensi tokoh: `Couple_during_marriage_proposal_2c706cdb.jpg`.
```
Scene: we arrive at the joglo house from the previous image; its front terrace is decorated for a
Javanese marriage proposal (lamaran): rows of seserahan gift trays with gold decorations, janur kuning
(yellow coconut leaf) arches, jasmine and rose arrangements, batik carpet, warm golden late-afternoon
light. The decorated front door is in the exact center of the frame.
In the foreground he kneels on one knee offering an open ring box, she covers her mouth in happy surprise.
```

### 7 — `S07_alun_alun.png` (sore cerah)
```
Scene: the grand alun-alun square of the keraton from image 1, now in the warm afternoon.
Two giant twin banyan trees (beringin kembar) with low white fences on the left and right,
a wide sandy field in the foreground, and the keraton gate exactly in the center between the trees.
Flocks of white egrets flying. Same architecture style and colors as image 1.
```

### 8 — `S08_pelaminan.png` (bertokoh — pengantin)
Referensi tokoh: `Couple_standing_holding_hands_c3e0083d.jpg`.
```
Scene: inside the keraton through the gate of the previous image: a grand pendopo prepared for the
royal wedding. Carved teak soko guru pillars with gold, a magnificent carved gebyok wedding backdrop
with a central doorway in the exact center of the frame, cascades of jasmine garlands, gold and maroon
decorations, warm golden light. The bride and groom stand proudly in front of the gebyok, holding hands,
smiling at the viewer.
```

### 9 — `S09_lorong_lampion.png` (senja)
```
Scene: behind the central doorway of the gebyok in the previous image: a long covered palace corridor
at dusk, receding straight to a glowing opening in the exact center of the frame. Rows of hanging lanterns,
carved teak columns, warm light reflecting on a polished stone floor, empty ornate golden frames on both
walls. Through the far opening a purple-orange sunset sky is visible.
```

### 10 — `S10_teratai.png` (senja ungu)
```
Scene: we step out of the corridor of the previous image into the royal palace garden at sunset.
A calm lotus pond in the foreground with pink and white lotus flowers, reflecting a purple, orange and
gold sky; an elegant pavilion in the center; frangipani trees; the first fireflies glowing.
The brightest part of the sky is in the exact center above the pavilion.
```

### 11 — `S11_malam.png` (bertokoh — melepas lampion)
Referensi tokoh: `Couple_releasing_sky_lantern_tog…_6c5351d3.jpg`.
```
Scene: the same palace garden and pavilion of the previous image, now at night under a deep blue starry
sky with the Milky Way. Hundreds of glowing sky lanterns rise into the sky from the center of the frame.
Warm lights from the pavilions, gentle reflections on the stone floor.
In the foreground the couple, seen from behind, releases one glowing sky lantern together.
Keep the upper half mostly sky.
```

---

## Setelah selesai

1. Unggah ke `bahan web 3d/v3/` (GitHub → **Add file → Upload files**, bertahap maksimal ±20 MB per unggahan,
   branch `feature/undangan-sinematik`).
2. Beri tahu agent: **"gambar v3 sudah diunggah"**.
3. Agent akan: membuat peta kedalaman (tokoh ikut punya kedalaman 3D), menyamakan warna dengan filter film,
   lalu memasang **jembatan** (`transisi: { jenis: 'tembus', ke: [u, v] }`) tepat di benda tengah tiap gambar.
   Lihat `AGENTS.md` bagian 9.

Gambar lama di `bahan web 3d/v2/` tetap disimpan sebagai cadangan.
