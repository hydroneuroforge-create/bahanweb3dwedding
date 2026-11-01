# Daftar Prompt Gambar — Gemini Nano Banana

Gambar-gambar ini dipakai untuk membangun dunia 2.5D undangan sinematik (kamera terbang menembus lapisan gambar).
Gaya harus **sama** dengan 7 gambar di `bahan web 3d/` (3D kartun ala Pixar, cahaya hangat).

## Cara membuat

1. Buka Gemini (gemini.google.com), pilih model gambar **Nano Banana**.
2. Untuk gambar yang ada tokoh **Syaif & Sasti** (kode `C`), **unggah 2 foto referensi** dulu:
   `Javanese_traditional_wedding_cou…_84a5ac03_2K.jpg` dan `Couple_wearing_royal_Javanese_at…_f888bc74_2K.jpg`.
3. Salin **GAYA DASAR** + prompt gambar, lalu kirim. Prompt sengaja dalam bahasa Inggris (hasil Nano Banana lebih konsisten).
4. Pilih hasil terbaik. Jika ada teks/huruf/watermark di gambar, minta ulang: *"same image but remove all text"*.
5. Simpan dengan **nama file persis seperti kode** (misal `B1_fajar_kampung.png`).
6. Unggah ke repo GitHub folder `bahan web 3d/v2/` (GitHub → buka folder → **Add file → Upload files**).

## Aturan penting

- **Latar (kode `B`)**: format **portrait 9:16** (tulis "vertical 9:16 portrait" di prompt). Tanpa tokoh, tanpa teks.
- **Lapisan & tokoh (kode `L` dan `C`)**: objek **berdiri sendiri di atas latar polos putih bersih**, tidak terpotong tepi gambar. Saya akan menghapus latarnya.
- Resolusi setinggi mungkin (2K). Format PNG atau JPG.
- Prioritas: ⭐ = wajib, ○ = opsional (menambah keindahan).

---

## GAYA DASAR (tempel di awal setiap prompt)

```
Stylized 3D animated feature film still, Pixar and Disney style, soft global illumination,
warm cinematic lighting, rich hand-crafted detail, traditional Javanese culture and architecture,
color palette of deep maroon, gold, terracotta, cream and emerald green.
No text, no letters, no logo, no watermark.
```

## TAMBAHAN UNTUK TOKOH (tempel setelah gaya dasar, khusus kode `C`)

```
The man and woman are the exact same characters from the reference images:
the man wears round black glasses, has a thin mustache and short black hair;
the woman has a round face, big brown eyes and black hair in a Javanese sanggul.
Keep their faces, proportions and art style identical to the references.
```

---

## A. Latar adegan (portrait 9:16)

| Kode | Prioritas | Prompt |
|---|---|---|
| `B1_fajar_kampung` | ⭐ | Vertical 9:16 portrait. High aerial view of a peaceful Javanese village at dawn. Terraced green rice fields curving down the hills, a majestic volcano in the far distance, layers of soft morning mist between the valleys, clusters of joglo houses with terracotta roofs, tall coconut palms, a winding river reflecting the pink and gold sunrise sky. Keep the upper third of the image as open sky with soft clouds. |
| `B2_jalan_desa` | ⭐ | Vertical 9:16 portrait, eye-level view. A charming Javanese village lane leading straight forward to a vanishing point in the center. Both sides lined with wooden joglo houses with terracotta roof tiles, woven bamboo fences, banana trees, frangipani trees with white-pink flowers, clay pots with plants, morning sunbeams through light mist. |
| `B3_klinik_terapi` | ⭐ | Vertical 9:16 portrait. Interior of a bright, cheerful pediatric sensory therapy room. A hanging sensory swing and a hammock swing from the ceiling, colorful gym balls, a ball pit, soft foam mats and foam blocks, a balance beam, a small trampoline, tactile sensory panels on the wall, a climbing wall corner, large windows with warm afternoon light, small Javanese touches such as carved wooden window frames and batik cushions. No people, no text on the walls. |
| `B4_lamaran` | ⭐ | Vertical 9:16 portrait. Front terrace of a traditional Javanese limasan family house decorated for a marriage proposal ceremony (lamaran). Rows of seserahan gift trays decorated with gold, janur kuning (yellow coconut leaf decorations) at the entrance, jasmine and rose flower arrangements, batik carpet, warm golden late-afternoon light. No people. |
| `B5_alun_alun` | ⭐ | Vertical 9:16 portrait. The grand alun-alun square of a Javanese keraton palace. Two giant twin banyan trees (beringin kembar) each surrounded by a low white fence in the middle of a wide sandy field, the keraton palace gate and pavilions in the background, flocks of white egrets flying, bright clear morning sky. |
| `B6_pendopo_pelaminan` | ⭐ | Vertical 9:16 portrait. Interior of a grand Javanese pendopo prepared for a royal wedding. Carved teak soko guru pillars with gold accents, a magnificent carved gebyok wedding backdrop (pelaminan) with two empty ornate chairs in the center, cascades of jasmine garlands, gold and maroon decorations, flower arrangements, warm golden light. No people. |
| `B7_lorong_lampion` | ⭐ | Vertical 9:16 portrait. A long covered corridor of a Javanese palace at dusk, receding to a vanishing point in the center. Rows of glowing hanging lanterns, carved teak columns, warm lantern light reflecting on a polished stone floor, empty ornate golden picture frames hanging on both walls. |
| `B8_senja_teratai` | ⭐ | Vertical 9:16 portrait. A royal Javanese palace garden at sunset with a calm lotus pond in the foreground, pink and white lotus flowers and lily pads, the water reflecting a purple, orange and gold sky, an elegant pavilion and frangipani trees in silhouette, fireflies starting to glow. |
| `B9_malam_lampion` | ⭐ | Vertical 9:16 portrait. A Javanese palace courtyard at night under a deep blue starry sky with the Milky Way, hundreds of glowing sky lanterns rising into the sky, warm lights from the pavilions, gentle reflections on the stone floor, magical and romantic mood. Keep the upper half mostly sky. |
| `B10_sawah_siang` | ○ | Vertical 9:16 portrait, low eye-level view across lush green rice paddies with a narrow dirt path between them, scarecrows with colorful ribbons, egrets standing in the water, distant coconut palms and blue mountains, bright late-morning sun. |

## B. Lapisan objek (latar putih polos, objek utuh)

| Kode | Prioritas | Prompt |
|---|---|---|
| `L1_gunungan` | ⭐ | A single ornate Javanese wayang kulit gunungan (kayon), perfectly symmetrical front view, intricate carved leather with gold leaf, deep red, emerald and gold colors, tree of life motif with animals and a gate at the bottom, standing upright, isolated on a plain pure white background, full object visible. |
| `L2_daun_depan` | ⭐ | A lush cluster of tropical foreground foliage: banana leaves, monstera, elephant ear leaves and a frangipani branch with flowers, arranged as a frame element from the bottom left corner, isolated on a plain pure white background. |
| `L3_kelapa` | ⭐ | Two tall slightly curved coconut palm trees with coconuts, full height from roots to crown, isolated on a plain pure white background. |
| `L4_joglo` | ○ | A single traditional Javanese joglo house with a tall pyramid terracotta roof, carved wooden walls, small front terrace and potted plants, three-quarter view, isolated on a plain pure white background. |
| `L5_lampion_terbang` | ⭐ | One glowing Javanese style sky lantern (paper lantern) with subtle batik pattern and a warm flame inside, isolated on a plain pure white background. |
| `L6_gong` | ⭐ | A large bronze gamelan gong hanging on an ornately carved teak stand with dragon (naga) carvings and gold accents, front view, isolated on a plain pure white background. |
| `L7_papan_ukir` | ⭐ | An ornate carved teak wooden signboard with gold leaf Javanese floral carvings on the border and a large smooth empty cream center panel, front view, isolated on a plain pure white background. |
| `L8_lontar` | ⭐ | An open ancient Javanese palm-leaf lontar scroll, wide horizontal, with wooden end pieces tied with red string, the surface completely blank and empty, isolated on a plain pure white background. |
| `L9_bingkai_emas` | ○ | An ornate carved golden picture frame in Javanese style, portrait orientation, completely empty transparent center, front view, isolated on a plain pure white background. |
| `L10_burung_kuntul` | ○ | A flock of five white egret birds flying with wings in different positions, side view, isolated on a plain pure white background. |

## C. Tokoh Syaif & Sasti (unggah 2 foto referensi, latar putih polos, seluruh badan)

| Kode | Prioritas | Prompt |
|---|---|---|
| `C1_jalan_bergandengan` | ⭐ | Full body, the couple walking hand in hand seen from behind at a slight three-quarter angle, looking at each other and smiling, wearing their royal Javanese wedding attire (black beskap with gold embroidery and batik; red and gold kebaya), isolated on a plain pure white background. |
| `C2_terapis_klinik` | ⭐ | Full body, the couple in 2023 as young pediatric therapists at work, wearing neat casual work clothes (polo shirt and trousers for him, modest blouse and long skirt with hijab-free sanggul hair for her), standing next to each other, meeting for the first time, shy friendly smiles, he holds a colorful gym ball, she holds a clipboard, isolated on a plain pure white background. |
| `C3_lamaran` | ⭐ | Full body, the couple at their marriage proposal: he wears a batik shirt and black peci and offers a small open ring box, she wears a soft pastel kebaya and covers her mouth in happy surprise, isolated on a plain pure white background. |
| `C4_pelaminan` | ⭐ | Full body front view, the couple standing proudly side by side in the navy velvet beskap and cream lace kebaya from the reference image, holding hands, smiling at the viewer, isolated on a plain pure white background. |
| `C5_lepas_lampion` | ⭐ | Full body, the couple seen from behind at night releasing one glowing sky lantern together, lifting it with both hands, wearing their wedding attire, warm light from the lantern on their faces, isolated on a plain pure white background. |
| `C6_melambai` | ○ | Full body front view, the couple waving happily at the viewer, he raises his hand, she leans on his shoulder, wearing their royal Javanese wedding attire, isolated on a plain pure white background. |

---

Setelah semua diunggah ke `bahan web 3d/v2/`, beri tahu agent: *"gambar v2 sudah diunggah"*.
Agent akan menghapus latar, mengompres, dan memasangnya ke adegan masing-masing (lihat `AGENTS.md`).
