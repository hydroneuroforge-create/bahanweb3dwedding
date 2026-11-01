#!/usr/bin/env bash
# Membuat ulang semua klip transisi di assets/video/transisi/ dari video mentah Google Flow.
#
# Pakai: tools/buat_semua_klip.sh <folder_acuan> [lebar]
#   folder_acuan berisi tNN_awal.png & tNN_akhir.png: screenshot kanvas 3D (360x640, tanpa teks/vinyet/video)
#   tepat di akhir bab asal dan awal bab tujuan. Lihat AGENTS.md §9 "Klip transisi video".
#   lebar: 720 (bawaan, kualitas penuh) atau 540 (berkas ±1/3).
set -euo pipefail
cd "$(dirname "$0")/.."
B="${1:?folder acuan wajib diisi}"
L="${2:-720}"
PY="${PYTHON:-python3}"
S="bahan web 3d/flow-transisi"
O="assets/video/transisi"
f() { ls "$S"/"$1"_*.mp4 | head -1; }
olah() { local n="$1"; shift; echo "== t$n"; "$PY" tools/olah_klip.py "$@" --acuan-awal "$B/t${n}_awal.png" --acuan-akhir "$B/t${n}_akhir.png" --lebar "$L" --keluar "$O/t$n.mp4"; }

olah 01 --segmen "$(f T01)"
olah 02 --segmen "$(f T02A):0:6" --segmen "$(f T02B):0:6:balik" --silang 0.6
olah 03 --segmen "$(f T03)" --cahaya 4.0:6.2:0.35
olah 04 --segmen "$(f T04A):0:7.7" --segmen "$(f T04B):0:8:balik" --silang 0.7
olah 05 --segmen "$(f T05)"
olah 06 --segmen "$(f T06)" --cahaya 1.7:3.5:0.55
olah 07 --segmen "$(f T07)"
olah 08 --segmen "$(f T08)"
olah 10 --segmen "$(f T10)"
olah 11 --segmen "$(f T11)" --cari-awal "$B/t11_awal.png"
olah 12 --segmen "$(f T12)"
du -sh "$O"
