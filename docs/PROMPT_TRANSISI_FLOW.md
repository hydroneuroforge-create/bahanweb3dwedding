# Prompt Transisi Video (Google Flow) — Siap Tempel

Klip transisi pendek yang menyambungkan satu adegan ke adegan berikutnya.
Website memutar klip ini saat tamu men-scroll melewati batas adegan.

## Bahan

Semua pasangan frame ada di `bahan web 3d/flow-transisi/`:

```
T01_gerbang_ke_kampung/
  1_AWAL.jpg    ← frame pertama (adegan sekarang)
  2_AKHIR.jpg   ← frame terakhir (adegan berikutnya)
T02_kampung_ke_desa/
...
T12_senja_ke_penutup/
```

Ukuran 1080×1920 (potret 9:16).

## Cara membuat di Google Flow (per klip)

1. Buka https://labs.google/flow lalu buat project baru, misalnya "Undangan Syaif Sasti".
2. Di kotak prompt bagian bawah, klik **nama model** (default tertulis "Nano Banana Pro"),
   lalu pilih **Video**, lalu pilih **Frames**. Pastikan tombol **Agent** di kotak prompt dalam keadaan mati.
3. Pengaturan:
   - Rasio: **9:16 (Portrait)**
   - Model: **Gemini Omni 1.1 Flash** (kalau tidak ada, pakai Veo 3.1 Fast)
   - Durasi: **pendek, 4–5 detik** (kalau tidak bisa diatur, biarkan default; nanti saya potong)
   - Resolusi: **720p** sudah cukup
4. Seret `1_AWAL.jpg` ke kotak **"+ Add start frame"** dan `2_AKHIR.jpg` ke kotak **"+ Add end frame"**.
5. Tempel prompt dari daftar di bawah (bagian **"Prompt"** untuk klip itu).
6. Generate. Kalau hasilnya ada potongan adegan (cut), wajah berubah, atau muncul teks aneh, generate ulang.
7. Download MP4, lalu beri nama sesuai kodenya: `T01.mp4`, `T02.mp4`, … `T12.mp4`.

Setelah selesai, upload semua MP4 ke folder `bahan web 3d/flow-transisi/hasil/` di repo
(lewat GitHub: buka folder → **Add file → Upload files**), atau kirim ke saya di chat.
Suara dari klip tidak dipakai (website memakai lagu sendiri), jadi audio boleh diabaikan.

Tidak harus 12 sekaligus. Mulai dari 1–2 klip dulu (misalnya T01 dan T05) supaya kita bisa cek hasilnya di website.

## Catatan penting

- **T08 dan T09 (Mempelai):** gambar close-up Mempelai masih gambar lama. Di gambar itu mempelai wanita
  **tidak berhijab**, padahal di semua adegan v3 ia berhijab. Sebaiknya buat ulang dulu gambar Mempelai
  (close-up berdua, mempelai wanita berhijab dengan siger/paes, latar ruang emas) di Gemini, lalu kirim ke saya.
  Saya ganti gambarnya dan buatkan ulang `1_AWAL`/`2_AKHIR` untuk T08–T09. Sebelum itu, lewati T08 dan T09.
- Setiap prompt sudah berisi "single continuous shot, no cuts". Bagian ini jangan dihapus, karena tanpa itu
  model cenderung membuat beberapa potongan adegan.

---

## T01 — Gerbang → Kampung

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation, warm golden dawn. The camera glides slowly forward through the open red-brick Javanese royal gate, passing between the two golden guardian statues, then rises gently above the gate to reveal a wide misty valley: a Javanese village with joglo houses, terraced rice fields, coconut palms and a volcano under a pink sunrise sky. Smooth, graceful, elegant camera motion. No text, no people, no dialogue, no music.
```

## T02 — Kampung → Jalan Desa

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation, soft morning light. The camera descends smoothly from the hilltop view of the Javanese village and glides down along the winding dirt path between the rice terraces, arriving at ground level in a quiet village lane lined with wooden houses, bamboo fences, banana trees and clay pots, sunlight glowing at the end of the lane. Gentle floating dust and mist. No text, no people, no dialogue, no music.
```

## T03 — Jalan Desa → Pintu Klinik

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation, warm morning light. The camera walks slowly forward along the village lane toward the glowing light at the end, the lane opens and the camera arrives in front of a beautiful Javanese joglo house with a tiled roof, carved wooden doors wide open, two small golden statues beside the steps, and potted plants. Smooth steady dolly forward. No text, no people, no dialogue, no music.
```

## T04 — Pintu Klinik → Ruang Klinik

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation, bright cheerful daylight. The camera glides forward up the steps and through the open carved wooden doors into a bright pediatric therapy room with a sensory swing, colorful gym balls and wooden toys. Inside, a young man with glasses in a maroon shirt holding a ball and a young woman in a white hijab and green skirt are standing together and smiling at each other. Keep both characters' faces, hijab and clothes exactly as in the last frame. No text, no dialogue, no music.
```

## T05 — Ruang Klinik → Sawah

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation. The young man with glasses and the young woman in a white hijab put down the ball, hold hands and walk together toward the bright window at the back of the therapy room; the camera follows them as warm sunlight fills the frame and they step outside into green rice fields with a volcano and palm trees, walking hand in hand away from the camera along a narrow path. Keep their faces, hijab and clothes consistent. Smooth, emotional, romantic. No text, no dialogue, no music.
```

## T06 — Sawah → Lamaran

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation, the light turns into warm golden late afternoon. The couple walks hand in hand along the rice field path; the camera follows them as the path leads to a decorated Javanese joglo pavilion with flowers, janur palm-leaf decorations and gift trays. The man in a batik shirt kneels on one knee and offers a ring box to the woman in a maroon kebaya and white hijab, who covers her mouth with joy. Keep their faces and hijab consistent. Tender, emotional. No text, no dialogue, no music.
```

## T07 — Lamaran → Alun-alun

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation, golden light. The camera rises slowly up and away from the proposal at the decorated joglo pavilion, gliding over the tiled roof and floating forward to reveal a wide sandy royal square (alun-alun) with two large banyan trees, a white low wall and a red-brick royal gate in the distance, a flock of white birds flying across the warm sky. The couple stays behind and leaves the frame naturally. Graceful sweeping camera. No text, no dialogue, no music.
```

## T08 — Alun-alun → Mempelai  *(tunda sampai gambar Mempelai diganti)*

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation. The camera flies smoothly across the sandy royal square toward the red-brick gate, passes through it into a warm golden palace room, and arrives at a close-up portrait of the bride and groom in royal Javanese wedding attire, the groom in a blangkon and glasses, the bride in a hijab with a golden siger crown, holding hands and smiling at the camera. Keep their faces exactly as in the last frame. Majestic, emotional. No text, no dialogue, no music.
```

## T09 — Mempelai → Pelaminan  *(tunda sampai gambar Mempelai diganti)*

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation, warm golden interior light. Starting from the close-up portrait of the bride and groom, the camera pulls back slowly and gracefully, revealing that they stand on the wedding stage (pelaminan) inside a carved teak Javanese palace hall with jasmine flower garlands, red curtains and golden ornaments; the couple turns to stand side by side in full royal batik wedding attire. Keep their faces, hijab and costumes consistent. Majestic. No text, no dialogue, no music.
```

## T10 — Pelaminan → Galeri (Lorong)

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation. The camera glides gently past the bride and groom on the wedding stage, moving through the jasmine-garland curtains behind them into a long, elegant carved teak palace corridor with golden lamps, framed paintings on the walls and a polished reflective floor, a soft pink-purple dusk light glowing at the far end. The couple leaves the frame naturally to the side. Smooth dolly forward. No text, no dialogue, no music.
```

## T11 — Galeri → Senja (Kolam Teratai)

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation. The camera flies slowly down the long golden palace corridor toward the glowing opening at the end and emerges through a carved wooden frame onto a terrace overlooking a lotus pond at purple dusk, pink lotus flowers floating in the foreground, frangipani trees and a small joglo pavilion with a warm glowing doorway across the water. Calm, dreamy, peaceful. No text, no people, no dialogue, no music.
```

## T12 — Senja → Penutup (Malam Lampion)

Prompt:
```
Single continuous shot, no scene cuts. 3D cartoon animation. The purple dusk sky slowly darkens into a starry night with the Milky Way; glowing paper lanterns begin to rise into the sky one by one. The camera moves forward over the lotus pond onto a stone path, where the bride and groom appear seen from behind, standing together and releasing a large glowing lantern into the sky, the groom in batik and blangkon, the bride in a hijab and maroon kebaya. Magical, emotional, peaceful ending. No text, no dialogue, no music.
```

---

## Kalau hasilnya kurang pas

| Masalah | Tambahkan ke akhir prompt |
|---|---|
| Ada potongan adegan (cut) | `One unbroken camera move from the first frame to the last frame.` |
| Wajah atau hijab berubah | `Keep the characters' faces, glasses, hijab and costumes identical to the reference frames.` |
| Gerakan terlalu cepat atau bergoyang | `Very slow, smooth, stable camera motion like a gimbal.` |
| Muncul teks atau tulisan | `Absolutely no text, letters or watermarks.` |
| Muncul orang lain | `Only the two characters, no other people.` |
