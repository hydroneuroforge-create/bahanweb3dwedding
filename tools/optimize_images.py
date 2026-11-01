#!/usr/bin/env python3
"""
Optimasi foto untuk galeri undangan.

Mengubah foto mentah (JPG/PNG, berapa pun ukurannya) menjadi dua file WebP:
  gNN.webp        -> versi besar untuk lightbox  (lebar maks 1600px, ~100-250 KB)
  gNN_thumb.webp  -> versi kecil untuk grid       (lebar maks 720px,  ~20-60 KB)
lalu mencetak baris objek siap tempel untuk array GALLERY di js/config.js.

Pemakaian (dari root repo):
  pip install pillow
  python3 tools/optimize_images.py foto1.jpg foto2.jpg ...
  python3 tools/optimize_images.py --start 6 folder_foto/*.jpg

Nomor file otomatis dilanjutkan dari file gNN yang sudah ada,
kecuali --start diberikan. File asli TIDAK diubah.
"""
import argparse
import re
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow belum terpasang. Jalankan: pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
GALLERY_DIR = ROOT / "assets" / "images" / "gallery"


def next_index() -> int:
    nums = [int(m.group(1)) for p in GALLERY_DIR.glob("g*.webp")
            if (m := re.fullmatch(r"g(\d+)\.webp", p.name))]
    return max(nums, default=0) + 1


def save(img: Image.Image, path: Path, max_w: int, quality: int) -> Image.Image:
    out = img.copy()
    out.thumbnail((max_w, max_w * 3), Image.LANCZOS)
    out.save(path, "WEBP", quality=quality, method=6)
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+", type=Path)
    ap.add_argument("--start", type=int, help="nomor awal file (default: lanjut otomatis)")
    args = ap.parse_args()

    GALLERY_DIR.mkdir(parents=True, exist_ok=True)
    idx = args.start or next_index()
    lines = []
    for f in args.files:
        if not f.is_file():
            print(f"Lewati (bukan file): {f}", file=sys.stderr)
            continue
        img = ImageOps.exif_transpose(Image.open(f)).convert("RGB")  # perbaiki rotasi foto HP
        name = f"g{idx:02d}"
        full = save(img, GALLERY_DIR / f"{name}.webp", 1600, 80)
        save(img, GALLERY_DIR / f"{name}_thumb.webp", 720, 76)
        lines.append(
            f"  {{ full: 'assets/images/gallery/{name}.webp', thumb: 'assets/images/gallery/{name}_thumb.webp', "
            f"w: {full.width}, h: {full.height}, alt: 'TULIS DESKRIPSI FOTO' }},"
        )
        print(f"OK  {f.name} -> {name}.webp ({full.width}x{full.height})")
        idx += 1

    if lines:
        print("\nTempel baris berikut ke array GALLERY di js/config.js, lalu ganti teks alt:\n")
        print("\n".join(lines))


if __name__ == "__main__":
    main()
