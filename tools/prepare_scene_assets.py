#!/usr/bin/env python3
"""
Pipeline aset untuk undangan sinematik 2.5D.

Perintah:
  depth   <gambar> <keluaran_prefix> [--width 1440]
          Membuat <prefix>.webp (warna) dan <prefix>_depth.webp (peta kedalaman,
          putih = dekat kamera) dengan model Depth Anything V2 Small.
          Dipakai untuk latar adegan (kode B) agar punya parallax 3D sungguhan.

  cutout  <gambar> <keluaran.webp> [--width 1200] [--white]
          Menghapus latar dengan model ISNet lalu memotong ke area objek.
          --white : gabungkan dengan kunci warna putih (untuk latar putih polos).
          Dipakai untuk lapisan objek & tokoh (kode L dan C).

Model diunduh otomatis ke ~/.cache/undangan-models (±280 MB, sekali saja).

Kebutuhan:  pip install pillow numpy onnxruntime
Contoh:
  python3 tools/prepare_scene_assets.py depth "bahan web 3d/v2/B1_fajar_kampung.png" assets/scenes/b1_fajar
  python3 tools/prepare_scene_assets.py cutout "bahan web 3d/v2/C1_jalan_bergandengan.png" assets/scenes/c1_jalan.webp --white
"""
import argparse
import os
import sys
import urllib.request
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageFilter, ImageOps
    import onnxruntime as ort
except ImportError:
    sys.exit("Pasang dulu: pip install pillow numpy onnxruntime")

CACHE = Path(os.environ.get("UNDANGAN_MODEL_DIR", Path.home() / ".cache" / "undangan-models"))
MODELS = {
    "depth": ("depth_v2_small.onnx",
              "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx"),
    "isnet": ("isnet.onnx",
              "https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx"),
}


def model_path(key: str) -> str:
    name, url = MODELS[key]
    path = CACHE / name
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        print(f"Mengunduh model {name} …")
        urllib.request.urlretrieve(url, path)
    return str(path)


def session(key: str) -> ort.InferenceSession:
    return ort.InferenceSession(model_path(key), providers=["CPUExecutionProvider"])


def load_rgb(path: str) -> Image.Image:
    return ImageOps.exif_transpose(Image.open(path)).convert("RGB")


# ---------------------------------------------------------------- kedalaman
def estimate_depth(img: Image.Image) -> np.ndarray:
    """Mengembalikan kedalaman relatif 0..1 (1 = paling dekat)."""
    sess = session("depth")
    w, h = img.size
    # sisi kelipatan 14 (patch ViT), sisi pendek 518
    scale = 518 / min(w, h)
    tw, th = int(round(w * scale / 14)) * 14, int(round(h * scale / 14)) * 14
    x = np.asarray(img.resize((tw, th), Image.BICUBIC), np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
    x = x.transpose(2, 0, 1)[None]
    out = sess.run(None, {sess.get_inputs()[0].name: x})[0]
    d = np.squeeze(out).astype(np.float32)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5)
    d = np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1)
    return d


def cmd_depth(args):
    img = load_rgb(args.src)
    w = min(args.width, img.width)
    img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    d = estimate_depth(img)
    dimg = Image.fromarray((d * 255).astype(np.uint8)).resize(img.size, Image.BICUBIC)
    # haluskan agar mesh tidak bergerigi, tetapi tepi objek tetap tegas
    # dilatasi: tepi objek depan "melebar" sedikit agar regangan jatuh di area latar (tidak terlihat)
    dimg = dimg.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.6))
    dsmall = dimg.resize((max(256, w // 3), max(256, round(img.height * max(256, w // 3) / w))), Image.LANCZOS)
    prefix = Path(args.out)
    prefix.parent.mkdir(parents=True, exist_ok=True)
    img.save(f"{prefix}.webp", quality=args.quality, method=6)
    dsmall.save(f"{prefix}_depth.webp", quality=90, method=6)
    print(f"OK  {prefix}.webp {img.size}  +  {prefix}_depth.webp {dsmall.size}")


# ---------------------------------------------------------------- potong latar
def isnet_mask(img: Image.Image) -> np.ndarray:
    sess = session("isnet")
    x = np.asarray(img.resize((1024, 1024), Image.LANCZOS), np.float32) / 255.0
    x = (x - 0.5) / 1.0
    x = x.transpose(2, 0, 1)[None]
    out = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
    out = (out - out.min()) / max(out.max() - out.min(), 1e-6)
    return np.asarray(Image.fromarray((out * 255).astype(np.uint8)).resize(img.size, Image.LANCZOS), np.float32) / 255


def white_key(img: Image.Image) -> np.ndarray:
    a = np.asarray(img, np.float32)
    light = a.mean(2)
    chroma = a.max(2) - a.min(2)
    t = lambda e0, e1, x: np.clip((x - e0) / (e1 - e0), 0, 1)
    bg = t(225, 247, light) * (1 - t(10, 30, chroma))
    return 1 - bg


def cmd_cutout(args):
    img = load_rgb(args.src)
    alpha = isnet_mask(img)
    if args.white:
        # gabungan: ISNet untuk bentuk utama, kunci putih untuk celah (mis. di antara daun)
        alpha = np.minimum(np.maximum(alpha, white_key(img) * (alpha > 0.05)), white_key(img) + 0.15)
        alpha = np.clip(alpha, 0, 1)
    m = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    al = np.asarray(m, np.float32) / 255
    rgb = np.asarray(img, np.float32)
    if args.white:  # buang pinggiran putih (dekontaminasi warna)
        safe = np.maximum(al, 0.2)[..., None]
        rgb = np.where(al[..., None] > 0.97, rgb, np.clip((rgb - (1 - safe) * 255) / safe, 0, 255))
    rgba = Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), "RGBA")
    box = Image.fromarray((al > 0.08).astype(np.uint8) * 255).getbbox()
    if box:
        rgba = rgba.crop(box)
    rgba.thumbnail((args.width, args.width * 3), Image.LANCZOS)
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    rgba.save(args.out, quality=args.quality, method=6)
    print(f"OK  {args.out} {rgba.size}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("depth")
    d.add_argument("src"); d.add_argument("out")
    d.add_argument("--width", type=int, default=1440); d.add_argument("--quality", type=int, default=80)
    d.set_defaults(fn=cmd_depth)
    c = sub.add_parser("cutout")
    c.add_argument("src"); c.add_argument("out")
    c.add_argument("--width", type=int, default=1200); c.add_argument("--quality", type=int, default=86)
    c.add_argument("--white", action="store_true")
    c.set_defaults(fn=cmd_cutout)
    args = ap.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
