# Prompt SIAP SALIN — Nano Banana (versi 3)

Setiap bagian di bawah = **1 gambar**. Untuk tiap gambar:

1. Buka chat baru di Gemini (Nano Banana).
2. **Unggah gambar referensi** persis sesuai daftar "Unggah dulu", **dengan urutan yang sama** (gambar 1, gambar 2, …).
3. **Salin seluruh isi kotak prompt** (klik ikon salin di pojok kotak) → tempel → kirim.
4. Pilih hasil terbaik, **simpan dengan nama file yang tertulis**, lalu lanjut ke nomor berikutnya.

> Gambar referensi tokoh & gerbang ada di repo: `bahan web 3d/` dan `bahan web 3d/v2/bahan1|bahan2/`.
> Buat **berurutan**: hasil nomor sebelumnya dipakai sebagai referensi nomor berikutnya.

## Opsi praktis: buat Gem khusus (agar tidak mengulang blok gaya)

1. Gemini → **Explore Gems → New Gem**. Nama: `Undangan Syaif & Sasti`.
2. Di **Instructions**, tempel teks di bawah.
3. Di **Knowledge**, tambahkan `Javanese_royal_palace_hero_image_73da2734_2K.jpg` dan `Javanese_traditional_wedding_cou…_84a5ac03_2K.jpg`.
4. Simpan. Setiap gambar baru: buka Gem ini (chat baru), aktifkan pembuatan gambar, unggah **gambar sebelumnya** (+ gambar pose tokoh bila ada), lalu kirim **hanya bagian `Scene:`** dari nomor yang dikerjakan.
5. **Uji sekali di nomor 1–2.** Bila gaya/wajah mulai melenceng, unggah juga gambar gerbang & wajah secara manual seperti cara biasa — gambar yang diunggah langsung di chat selalu paling kuat pengaruhnya.

```
You create images for a Javanese royal wedding invitation of Syaif & Sasti.
Every image is one scene of ONE continuous journey through the same Javanese village and keraton.

STYLE (always): match the attached knowledge image "Javanese_royal_palace_hero_image" exactly:
stylized 3D animated feature film look (Pixar/Disney style), soft global illumination, rich
hand-crafted detail, warm palette of deep maroon, gold, terracotta, cream and emerald green.
If I upload an image of the previous scene, continue from it: same world, same architecture,
same art style, natural continuation of its light and time of day.

CAMERA (always, unless the scene says otherwise): eye level (about 1.6 m), 35mm lens, looking straight
ahead, a clear opening or focal object in the exact center of the frame leading deeper into the scene,
bottom 35% of the image is open foreground ground/floor.

CHARACTERS (only when the scene mentions the couple): the man and the woman from the knowledge image
"Javanese_traditional_wedding_couple" (he wears round black glasses, thin mustache, short black hair;
she has a round face, big brown eyes, black hair). Use any uploaded pose image for pose and outfit.
Place them naturally inside the scene, full body, large in the foreground (55-65% of image height),
lit by the scene light with matching ground shadows and perspective. Keep faces identical.

OUTPUT: always a vertical 9:16 image, highest resolution, no text, no letters, no logo, no watermark.
```

---

## 1. `S01_kampung.png` — fajar

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: standing on a hilltop, 35mm lens, looking forward and slightly down over the village.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Scene: high view over a peaceful Javanese village at dawn, as if standing at the top of a hill
just after passing through the keraton gate of image 1. A winding dirt path starts at the bottom
center and leads down into the village in the exact center of the frame. Terraced rice fields,
joglo houses with terracotta roofs, coconut palms, soft layers of morning mist, a majestic volcano
in the far background, pink and gold sunrise sky in the upper third.
```

---

## 2. `S02_jalan_desa.png` — pagi

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S01_kampung` (gambar sebelumnya — hasil Anda)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Scene: we have walked down the path from image 2 into the village. Eye-level view of a charming
village lane that goes straight ahead to a bright sunlit opening at the exact center of the frame.
Both sides: wooden joglo houses with terracotta roofs, woven bamboo fences, banana trees,
frangipani trees, clay pots. The same volcano is faintly visible far behind the opening.
Morning sunbeams through light mist.
```

---

## 3. `S03_gerbang_klinik.png` — opsional, pagi

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S02_jalan_desa` (gambar sebelumnya — hasil Anda)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Scene: at the end of the village lane from image 2 stands a small, warm, friendly pediatric therapy
clinic built in Javanese limasan style with carved wooden doors. The double doors in the exact
center of the frame are open, showing a bright colorful room inside. Potted plants and a small
garden in front. No sign, no name, no text.
```

---

## 4. `S04_klinik.png` — bertokoh — terapis, 2023

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S02_jalan_desa (atau S03 bila dibuat)` (gambar sebelumnya — hasil Anda)
3. `Pediatric_therapists_meeting_at_…_f17b1894.jpg` (pose & busana tokoh)
4. `Javanese_traditional_wedding_cou…_84a5ac03_2K.jpg` (wajah tokoh)

> **Ganti dulu** kata `[HIJAB]` di akhir prompt dengan salah satu: `with hijab` atau `without hijab, black hair in a neat bun` — sesuai keseharian Sasti.

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Use image 3 for the pose and outfit and image 4 for the faces of the two characters. Place the man and the woman NATURALLY INSIDE this scene,
full body, standing on the ground in the lower-middle part of the frame, large in the foreground
(their height about 55-65% of the image height), lit by the same light as the scene with matching
shadows on the ground and matching perspective.
Keep their faces, glasses, mustache, hairstyle and proportions exactly like the reference characters.

Scene: inside the bright pediatric sensory therapy room behind the doors of the previous image.
A hanging sensory swing and hammock swing, colorful gym balls, foam mats, a ball pit,
tactile wall panels, Javanese carved wooden window frames and batik cushions.
A large bright window in the exact center of the back wall with warm daylight pouring in.
The two characters stand in the foreground as young pediatric therapists meeting for the first time,
shy friendly smiles, he holds a colorful gym ball, she holds a clipboard.

The woman is wearing [HIJAB].
```

---

## 5. `S05_sawah.png` — bertokoh — berjalan, 2023–2026

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S04_klinik` (gambar sebelumnya — hasil Anda)
3. `Couple_walking_in_wedding_attire_d76b3ab9.jpg` (pose & busana tokoh)
4. `Javanese_traditional_wedding_cou…_84a5ac03_2K.jpg` (wajah tokoh)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Use image 3 for the pose and outfit and image 4 for the faces of the two characters. Place the man and the woman NATURALLY INSIDE this scene,
full body, standing on the ground in the lower-middle part of the frame, large in the foreground
(their height about 55-65% of the image height), lit by the same light as the scene with matching
shadows on the ground and matching perspective.
Keep their faces, glasses, mustache, hairstyle and proportions exactly like the reference characters.

Scene: through the bright window of the previous image we arrive at lush green rice paddies under
a warm late-morning sun. A narrow dirt path between the paddies leads from the bottom center to a
small joglo house in the exact center of the frame. Egrets in the water, colorful scarecrow ribbons,
coconut palms, the same volcano in the far background.
The two characters walk hand in hand along the path away from the camera, seen from behind at a
slight three-quarter angle, looking at each other, large in the foreground.
```

---

## 6. `S06_lamaran.png` — bertokoh — lamaran, 15 Agustus 2026

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S05_sawah` (gambar sebelumnya — hasil Anda)
3. `Couple_during_marriage_proposal_2c706cdb.jpg` (pose & busana tokoh)
4. `Javanese_traditional_wedding_cou…_84a5ac03_2K.jpg` (wajah tokoh)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Use image 3 for the pose and outfit and image 4 for the faces of the two characters. Place the man and the woman NATURALLY INSIDE this scene,
full body, standing on the ground in the lower-middle part of the frame, large in the foreground
(their height about 55-65% of the image height), lit by the same light as the scene with matching
shadows on the ground and matching perspective.
Keep their faces, glasses, mustache, hairstyle and proportions exactly like the reference characters.

Scene: we arrive at the joglo house from the previous image; its front terrace is decorated for a
Javanese marriage proposal (lamaran): rows of seserahan gift trays with gold decorations, janur kuning
(yellow coconut leaf) arches, jasmine and rose arrangements, batik carpet, warm golden late-afternoon
light. The decorated front door is in the exact center of the frame.
In the foreground he kneels on one knee offering an open ring box, she covers her mouth in happy surprise.
```

---

## 7. `S07_alun_alun.png` — sore cerah

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S06_lamaran` (gambar sebelumnya — hasil Anda)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Scene: the grand alun-alun square of the keraton from image 1, now in the warm afternoon.
Two giant twin banyan trees (beringin kembar) with low white fences on the left and right,
a wide sandy field in the foreground, and the keraton gate exactly in the center between the trees.
Flocks of white egrets flying. Same architecture style and colors as image 1.
```

---

## 8. `S08_pelaminan.png` — bertokoh — pengantin

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S07_alun_alun` (gambar sebelumnya — hasil Anda)
3. `Couple_standing_holding_hands_c3e0083d.jpg` (pose & busana tokoh)
4. `Javanese_traditional_wedding_cou…_84a5ac03_2K.jpg` (wajah tokoh)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Use image 3 for the pose and outfit and image 4 for the faces of the two characters. Place the man and the woman NATURALLY INSIDE this scene,
full body, standing on the ground in the lower-middle part of the frame, large in the foreground
(their height about 55-65% of the image height), lit by the same light as the scene with matching
shadows on the ground and matching perspective.
Keep their faces, glasses, mustache, hairstyle and proportions exactly like the reference characters.

Scene: inside the keraton through the gate of the previous image: a grand pendopo prepared for the
royal wedding. Carved teak soko guru pillars with gold, a magnificent carved gebyok wedding backdrop
with a central doorway in the exact center of the frame, cascades of jasmine garlands, gold and maroon
decorations, warm golden light. The bride and groom stand proudly in front of the gebyok, holding hands,
smiling at the viewer.
```

---

## 9. `S09_lorong_lampion.png` — senja

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S08_pelaminan` (gambar sebelumnya — hasil Anda)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Scene: behind the central doorway of the gebyok in the previous image: a long covered palace corridor
at dusk, receding straight to a glowing opening in the exact center of the frame. Rows of hanging lanterns,
carved teak columns, warm light reflecting on a polished stone floor, empty ornate golden frames on both
walls. Through the far opening a purple-orange sunset sky is visible.
```

---

## 10. `S10_teratai.png` — senja ungu

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S09_lorong_lampion` (gambar sebelumnya — hasil Anda)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Scene: we step out of the corridor of the previous image into the royal palace garden at sunset.
A calm lotus pond in the foreground with pink and white lotus flowers, reflecting a purple, orange and
gold sky; an elegant pavilion in the center; frangipani trees; the first fireflies glowing.
The brightest part of the sky is in the exact center above the pavilion.
```

---

## 11. `S11_malam.png` — bertokoh — melepas lampion

**Unggah dulu (berurutan):**
1. `Javanese_royal_palace_hero_image_73da2734_2K.jpg` (gaya)
2. `S10_teratai` (gambar sebelumnya — hasil Anda)
3. `Couple_releasing_sky_lantern_tog…_6c5351d3.jpg` (pose & busana tokoh)
4. `Javanese_traditional_wedding_cou…_84a5ac03_2K.jpg` (wajah tokoh)

**Prompt (salin semua):**
```
Use image 1 as the STYLE reference: same stylized 3D animated feature film look
(Pixar/Disney style), same soft global illumination, same rich hand-crafted detail and
the same warm color palette of deep maroon, gold, terracotta, cream and emerald green.
Use image 2 as the PREVIOUS SCENE of the same continuous journey: keep the same world,
the same village architecture, the same art style and a natural continuation of its light.
Vertical 9:16. No text, no letters, no logo, no watermark.

Camera: eye level (about 1.6 m), 35mm lens, looking straight ahead.
Compose the scene with a clear OPENING in the exact center of the frame
(described below) that leads deeper into the scene.
Keep the bottom 35% of the image as open foreground ground/floor.

Use image 3 for the pose and outfit and image 4 for the faces of the two characters. Place the man and the woman NATURALLY INSIDE this scene,
full body, standing on the ground in the lower-middle part of the frame, large in the foreground
(their height about 55-65% of the image height), lit by the same light as the scene with matching
shadows on the ground and matching perspective.
Keep their faces, glasses, mustache, hairstyle and proportions exactly like the reference characters.

Scene: the same palace garden and pavilion of the previous image, now at night under a deep blue starry
sky with the Milky Way. Hundreds of glowing sky lanterns rise into the sky from the center of the frame.
Warm lights from the pavilions, gentle reflections on the stone floor.
In the foreground the couple, seen from behind, releases one glowing sky lantern together.
Keep the upper half mostly sky.
```

---

Setelah semua selesai: unggah ke `bahan web 3d/v3/` lalu beri tahu agent **"gambar v3 sudah diunggah"**.
