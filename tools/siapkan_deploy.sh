#!/usr/bin/env bash
# Menyiapkan folder _deploy/ berisi HANYA file yang dibutuhkan website (untuk Cloudflare Pages / hosting statis lain).
# Folder bahan mentah (bahan web 3d/), tools/, docs/, dan file agent TIDAK ikut diunggah.
#
# Pakai (dari root repo):  bash tools/siapkan_deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="_deploy"
rm -rf "$OUT"
mkdir -p "$OUT"
cp index.html klasik.html "$OUT"/
cp -R css js assets "$OUT"/
[ -f CNAME ] && cp CNAME "$OUT"/

# Header keamanan dasar untuk Cloudflare Pages
cat > "$OUT/_headers" <<'EOF'
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
EOF

# Pemeriksaan: tidak ada file > 25 MiB (batas Cloudflare Pages) dan file wajib ada
besar=$(find "$OUT" -type f -size +25M)
if [ -n "$besar" ]; then echo "GAGAL: file lebih dari 25 MiB:"; echo "$besar"; exit 1; fi
for f in index.html klasik.html js/sinema/main.js js/sinema/dunia.js js/sinema/cerita.js css/sinema.css assets/audio/lagu-utama.mp3; do
  [ -f "$OUT/$f" ] || { echo "GAGAL: $f tidak ada"; exit 1; }
done
n=$(ls "$OUT"/assets/video/transisi/*.mp4 | wc -l)
echo "OK  $OUT siap: $(find "$OUT" -type f | wc -l) file, $(du -sh "$OUT" | cut -f1), $n klip transisi"
