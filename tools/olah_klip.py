#!/usr/bin/env python3
"""Mengolah klip transisi Google Flow menjadi video siap pakai di website.

Langkah:
  1. Potong / balik / sambung beberapa segmen (sambungan memakai xfade di momen layar tertutup benda).
  2. Opsional: cari frame yang paling mirip gambar acuan lalu potong awal/akhir klip di sana.
  3. Rapikan: kurangi kedip (deflicker) & bintik halus AI (hqdn3d), pertajam tipis (unsharp).
  4. Samakan warna dengan render 3D di kedua batas (acuan awal & akhir). Koreksi berubah halus
     dari awal ke akhir klip, sehingga video menyatu dengan adegan sebelum dan sesudahnya.
  5. Encode H.264 720x1280 tanpa audio, GOP pendek agar lancar di-seek mengikuti gulir.

Contoh:
  python3 tools/olah_klip.py --segmen "bahan web 3d/flow-transisi/T02A.mp4:0:6" \
      --segmen "bahan web 3d/flow-transisi/T02B.mp4:0:6:balik" --silang 0.6 \
      --acuan-awal batas/t02_awal.png --acuan-akhir batas/t02_akhir.png \
      --keluar assets/video/transisi/t02.mp4

Butuh: pillow, numpy, imageio-ffmpeg (pip install pillow numpy imageio-ffmpeg).
"""
import argparse
import subprocess
import sys

import numpy as np
from PIL import Image

try:
    import imageio_ffmpeg
except ImportError:  # pragma: no cover
    sys.exit('Pasang dulu: pip install imageio-ffmpeg')

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 720, 1280, 24


def durasi(path):
    """Durasi video (detik) dari keluaran ffmpeg."""
    out = subprocess.run([FFMPEG, '-hide_banner', '-i', path], capture_output=True, text=True).stderr
    for baris in out.splitlines():
        if 'Duration:' in baris:
            h, m, s = baris.split('Duration:')[1].split(',')[0].strip().split(':')
            return int(h) * 3600 + int(m) * 60 + float(s)
    raise RuntimeError(f'Durasi tidak terbaca: {path}')


def baca_segmen(teks):
    """"file[:dari[:sampai[:balik]]]" -> dict. Nama file boleh mengandung spasi."""
    bagian = teks.split(':')
    seg = {'file': bagian[0], 'dari': 0.0, 'sampai': None, 'balik': False}
    if len(bagian) > 1 and bagian[1]:
        seg['dari'] = float(bagian[1])
    if len(bagian) > 2 and bagian[2]:
        seg['sampai'] = float(bagian[2])
    if len(bagian) > 3:
        seg['balik'] = bagian[3] == 'balik'
    if seg['sampai'] is None:
        seg['sampai'] = durasi(seg['file'])
    return seg


def grafik_filter(segmen, silang):
    """Filtergraph ffmpeg: tiap segmen dipotong/dibalik lalu disambung dengan xfade."""
    rantai, label = [], []
    for i, s in enumerate(segmen):
        f = f'[{i}:v]trim={s["dari"]}:{s["sampai"]},setpts=PTS-STARTPTS'
        if s['balik']:
            f += ',reverse,setpts=PTS-STARTPTS'
        f += f',fps={FPS},scale={W}:{H}:flags=lanczos,format=yuv420p[s{i}]'
        rantai.append(f)
        label.append(f's{i}')
    akhir, panjang = label[0], segmen[0]['sampai'] - segmen[0]['dari']
    for i in range(1, len(segmen)):
        offset = panjang - silang
        rantai.append(f'[{akhir}][{label[i]}]xfade=transition=fade:duration={silang}:offset={offset:.3f}[x{i}]')
        akhir = f'x{i}'
        panjang = offset + (segmen[i]['sampai'] - segmen[i]['dari'])
    # rapikan kedip & bintik halus khas video AI, lalu pertajam tipis
    rantai.append(f'[{akhir}]deflicker=mode=pm:size=5,hqdn3d=1.2:1.2:4:4,unsharp=5:5:0.35:5:5:0,format=rgb24[v]')
    return ';'.join(rantai)


def baca_frame(segmen, silang):
    cmd = [FFMPEG, '-v', 'error']
    for s in segmen:
        cmd += ['-i', s['file']]
    cmd += ['-filter_complex', grafik_filter(segmen, silang), '-map', '[v]', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    ukuran = W * H * 3
    frame = []
    while True:
        buf = proc.stdout.read(ukuran)
        if len(buf) < ukuran:
            break
        frame.append(np.frombuffer(buf, np.uint8).reshape(H, W, 3))
    proc.wait()
    if proc.returncode:
        raise RuntimeError('ffmpeg gagal membaca segmen')
    return frame


def kecil(img, w=90, h=160):
    if isinstance(img, np.ndarray):
        img = Image.fromarray(img)
    return np.asarray(img.convert('RGB').resize((w, h), Image.BILINEAR), dtype=np.float32) / 255.0


def cari_frame(frame, acuan, rentang):
    """Indeks frame (dalam rentang) yang paling mirip gambar acuan (selisih rata-rata kuadrat)."""
    a = kecil(Image.open(acuan))
    a = (a - a.mean((0, 1))) / (a.std((0, 1)) + 1e-4)  # abaikan beda warna, bandingkan bentuk
    terbaik, skor = rentang[0], 1e9
    for i in range(*rentang):
        f = kecil(frame[i])
        f = (f - f.mean((0, 1))) / (f.std((0, 1)) + 1e-4)
        e = float(((f - a) ** 2).mean())
        if e < skor:
            terbaik, skor = i, e
    return terbaik, skor


def statistik(img):
    x = kecil(img).reshape(-1, 3)
    return x.mean(0), x.std(0)


def koreksi(frame0, acuan, kekuatan):
    """Gain & offset per kanal agar rata-rata & sebaran warna frame0 mendekati acuan."""
    if not acuan:
        return np.ones(3, np.float32), np.zeros(3, np.float32)
    m0, s0 = statistik(frame0)
    m1, s1 = statistik(Image.open(acuan))
    gain = np.clip(s1 / (s0 + 1e-4), 0.7, 1.35)
    off = m1 - m0 * gain
    gain = 1 + (gain - 1) * kekuatan
    off = off * kekuatan
    return gain.astype(np.float32), off.astype(np.float32)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--segmen', action='append', required=True, help='file[:dari[:sampai[:balik]]] (boleh berulang)')
    ap.add_argument('--silang', type=float, default=0.6, help='lama sambungan antar segmen (detik)')
    ap.add_argument('--acuan-awal', help='render 3D di akhir bab asal (PNG)')
    ap.add_argument('--acuan-akhir', help='render 3D di awal bab tujuan (PNG)')
    ap.add_argument('--cari-awal', help='potong awal klip di frame paling mirip gambar ini (cari di 60%% awal)')
    ap.add_argument('--cari-akhir', help='potong akhir klip di frame paling mirip gambar ini (cari di 40%% akhir)')
    ap.add_argument('--kekuatan', type=float, default=0.85, help='kekuatan penyamaan warna 0..1')
    ap.add_argument('--crf', type=int, default=26)
    ap.add_argument('--keluar', required=True)
    a = ap.parse_args()

    segmen = [baca_segmen(s) for s in a.segmen]
    frame = baca_frame(segmen, a.silang)
    n = len(frame)
    i0, i1 = 0, n - 1
    if a.cari_awal:
        i0, e = cari_frame(frame, a.cari_awal, (0, int(n * 0.6)))
        print(f'  awal dipotong di frame {i0} ({i0 / FPS:.2f} dtk), selisih {e:.3f}')
    if a.cari_akhir:
        i1, e = cari_frame(frame, a.cari_akhir, (max(i0 + 1, int(n * 0.6)), n))
        print(f'  akhir dipotong di frame {i1} ({i1 / FPS:.2f} dtk), selisih {e:.3f}')
    frame = frame[i0:i1 + 1]
    n = len(frame)

    g0, o0 = koreksi(frame[0], a.acuan_awal, a.kekuatan)
    g1, o1 = koreksi(frame[-1], a.acuan_akhir, a.kekuatan)
    print(f'  koreksi awal gain {g0.round(2)} offset {(o0 * 255).round(1)}')
    print(f'  koreksi akhir gain {g1.round(2)} offset {(o1 * 255).round(1)}')

    tulis = imageio_ffmpeg.write_frames(
        a.keluar, (W, H), fps=FPS, codec='libx264', pix_fmt_in='rgb24', pix_fmt_out='yuv420p', macro_block_size=16,
        output_params=['-preset', 'slow', '-crf', str(a.crf), '-g', '4', '-keyint_min', '4', '-sc_threshold', '0',
                       '-movflags', '+faststart', '-an'])
    tulis.send(None)
    for i, f in enumerate(frame):
        k = i / max(n - 1, 1)
        k = k * k * (3 - 2 * k)
        g = g0 + (g1 - g0) * k
        o = o0 + (o1 - o0) * k
        x = f.astype(np.float32) / 255.0 * g + o
        tulis.send((np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8))
    tulis.close()
    print(f'  {a.keluar}: {n} frame, {n / FPS:.2f} dtk')


if __name__ == '__main__':
    main()
