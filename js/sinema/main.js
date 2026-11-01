/* =========================================================================
   MAIN SINEMATIK — penghubung gulir, dunia 3D, naskah, suara, dan fitur
   -------------------------------------------------------------------------
   Modul:
     1. Utilitas & toast
     2. Loading
     3. Gulir -> posisi cerita (ruang gulir, lompat bab, gulir otomatis)
     4. Naskah: menampilkan teks sesuai waktu lokal bab
     5. Suara (musik gamelan, gong, suasana alam per bab)
     6. Membuka undangan
     7. Menu, kemajuan, petunjuk
     8. Hitung mundur
     9. Galeri (ketuk foto 3D) + lightbox
     10. RSVP & ucapan
     11. Salin nomor/alamat, tautan peta & kalender
   ========================================================================= */
import { Dunia } from './dunia.js';
import { SUSUNAN, BAB, GALERI, DATA, SUARA } from './cerita.js';

const root = document.documentElement;
const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===================== 1. UTILITAS ===================== */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const el = (tag, cls, teks) => { const n = document.createElement(tag); if (cls) n.className = cls; if (teks != null) n.textContent = teks; return n; };

const toast = (() => {
  const n = $('#toast'); let t = null;
  return (pesan) => { n.textContent = pesan; n.classList.add('is-visible'); clearTimeout(t); t = setTimeout(() => n.classList.remove('is-visible'), 2600); };
})();

/* ===================== 2. LOADING ===================== */
const loading = (() => {
  const isi = $('#loader-fill'), persen = $('#loader-percent'), bar = $('.loader__bar');
  const mulai = performance.now();
  let tampil = 0;
  return {
    set(p) {
      tampil = Math.max(tampil, clamp(p));
      isi.style.transform = `scaleX(${tampil})`;
      persen.textContent = `${Math.round(tampil * 100)}%`;
      bar.setAttribute('aria-valuenow', String(Math.round(tampil * 100)));
    },
    async selesai() {
      this.set(1);
      const sisa = 1500 - (performance.now() - mulai);
      if (sisa > 0) await tunggu(sisa);
      $('#loader').classList.add('is-selesai');
      await tunggu(1000);
      $('#loader').remove();
    }
  };
})();

/* ===================== 3. GULIR ===================== */
const gulir = {
  unit: 1,
  lebar: 0,
  dunia: null,
  terkunci: true,

  pasang(dunia) {
    this.dunia = dunia;
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    this.ukur(true);
    window.addEventListener('resize', () => this.ukur(false), { passive: true });
    window.addEventListener('scroll', () => this.saatGulir(), { passive: true });
  },

  // Satuan gulir hanya dihitung ulang bila lebar layar berubah (rotasi),
  // agar bilah alamat HP yang muncul/hilang tidak menggeser cerita.
  ukur(paksa) {
    const w = window.innerWidth;
    if (!paksa && w === this.lebar) return;
    const s = this.posisi();
    this.lebar = w;
    this.unit = Math.max(window.innerHeight, 480) * SUSUNAN.satuanGulir;
    $('#ruang-gulir').style.height = `${this.dunia.total * this.unit + window.innerHeight}px`;
    if (!paksa) window.scrollTo(0, s * this.unit);
  },

  posisi() { return window.scrollY / this.unit; },
  saatGulir() { if (!this.terkunci) this.dunia.setGulir(this.posisi()); },

  // Gulir halus otomatis ke posisi cerita s (dipakai saat membuka undangan)
  async animasiKe(s, durasi = 2200) {
    const dari = window.scrollY, ke = s * this.unit;
    const t0 = performance.now();
    await new Promise((selesai) => {
      const langkah = (now) => {
        const k = clamp((now - t0) / durasi);
        const e = 1 - Math.pow(1 - k, 3);
        window.scrollTo(0, dari + (ke - dari) * e);
        if (k < 1) requestAnimationFrame(langkah); else selesai();
      };
      requestAnimationFrame(langkah);
    });
  },

  // Lompat jauh (menu): layar meredup, pindah, lalu terang kembali
  async lompat(s) {
    root.classList.add('is-lompat');
    await tunggu(320);
    window.scrollTo(0, s * this.unit);
    this.dunia.setGulir(s, true);
    await tunggu(80);
    root.classList.remove('is-lompat');
  }
};

/* ===================== 4. NASKAH ===================== */
const naskah = {
  pasang(dunia) {
    this.bab = new Map();
    $$('.bab').forEach((sec) => {
      const daftar = $$('.adegan', sec).map((n) => {
        const [a, b] = (n.dataset.t || '0,1').split(',').map(Number);
        return { n, a, b, k: -1 };
      });
      this.bab.set(sec.dataset.bab, { sec, daftar });
    });
    this.judul = $('#judul-bab');
    this.isiKemajuan = $('#kemajuan-isi');
    this.babAktif = null;
    dunia.padaFrame((s, P) => this.perbarui(s, P, dunia));
  },

  perbarui(s, P, dunia) {
    const id = P.b.id;
    const t = clamp((s - P.b.mulai) / P.b.durasi, 0, 1.2);
    // pudar keseluruhan saat tirai transisi menutup layar
    const redup = 1 - P.tirai;

    this.bab.forEach((bab, kunci) => {
      const aktif = kunci === id;
      bab.daftar.forEach((d) => {
        let k = 0, arah = -1;
        if (aktif) {
          const f = Math.min(0.08, (d.b - d.a) / 4);
          k = smooth(d.a, d.a + f, t) * (1 - smooth(d.b - f, d.b, t)) * redup;
          arah = t < (d.a + d.b) / 2 ? -1 : 1;
        }
        k = Math.round(k * 1000) / 1000;
        if (k === d.k) return;
        d.k = k;
        d.n.style.setProperty('--k', k);
        d.n.style.setProperty('--arah', arah);
        d.n.classList.toggle('is-tampil', k > 0.004);
        d.n.classList.toggle('is-aktif', k > 0.6);
      });
    });

    if (this.babAktif !== id) {
      this.babAktif = id;
      this.judul.textContent = P.b.judul;
      menu.tandai(id);
    }
    this.judul.classList.toggle('is-tampil', !gulir.terkunci && P.tirai < 0.3);
    this.isiKemajuan.style.transform = `scaleX(${clamp(s / dunia.total)})`;
    suara.atur(P);
    petunjuk.cek(s, dunia.total);
  }
};

/* ===================== 5. SUARA ===================== */
const suara = {
  nyala: true,
  ctx: null,
  pasang() {
    this.musik = new Audio();
    this.musik.loop = true;
    this.musik.preload = 'none';
    const dukung = SUARA.musik.find((m) => this.musik.canPlayType(m.type));
    this.musik.src = (dukung || SUARA.musik[0]).src;
    this.musik.volume = 0;
    this.tombol = $('#tombol-suara');
    this.tombol.addEventListener('click', () => this.alih());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.musik.pause(); this.ctx && this.ctx.suspend(); }
      else if (this.nyala && this.dimulai) { this.musik.play().catch(() => {}); this.ctx && this.ctx.resume(); }
    });
  },

  // Harus dipanggil langsung di dalam klik (aturan autoplay browser)
  async mulai() {
    this.dimulai = true;
    this.musik.play().then(() => this.naikkanMusik()).catch(() => { this.setNyala(false); });
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.ctx.resume();
    this.utama = this.ctx.createGain();
    this.utama.connect(this.ctx.destination);
    this.utama.gain.value = 1;
    this.lapisan = {};
    const muat = async (url) => {
      const r = await fetch(url);
      return this.ctx.decodeAudioData(await r.arrayBuffer());
    };
    // Gong dibunyikan sekali saat gunungan terbuka
    muat(SUARA.gong).then((buf) => {
      const src = this.ctx.createBufferSource(); src.buffer = buf;
      const g = this.ctx.createGain(); g.gain.value = 0.85;
      src.connect(g).connect(this.utama); src.start();
    }).catch(() => {});
    // Suasana alam: diulang tanpa jeda, volume mengikuti bab
    Object.entries(SUARA.suasana).forEach(async ([nama, url]) => {
      try {
        const buf = this.mulus(await muat(url));
        const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const g = this.ctx.createGain(); g.gain.value = 0;
        src.connect(g).connect(this.utama); src.start();
        this.lapisan[nama] = { g, v: 0 };
      } catch { /* suara suasana bersifat opsional */ }
    });
  },

  // Silang-pudar ujung & awal buffer agar pengulangan tidak berbunyi "klik"
  mulus(buf) {
    const n = Math.min(Math.floor(buf.sampleRate * 1.2), Math.floor(buf.length / 4));
    const out = this.ctx.createBuffer(buf.numberOfChannels, buf.length - n, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const i = buf.getChannelData(c), o = out.getChannelData(c);
      o.set(i.subarray(0, buf.length - n));
      for (let k = 0; k < n; k++) { const f = k / n; o[k] = i[k] * f + i[buf.length - n + k] * (1 - f); }
    }
    return out;
  },

  naikkanMusik() {
    const t0 = performance.now();
    const langkah = (now) => {
      const k = clamp((now - t0) / 3000);
      this.musik.volume = this.nyala ? 0.55 * k : 0;
      if (k < 1) requestAnimationFrame(langkah);
    };
    requestAnimationFrame(langkah);
  },

  // Dipanggil tiap frame: volume suasana mengikuti bab aktif (dan bab tetangga saat transisi)
  atur(P) {
    if (!this.lapisan) return;
    const dt = 1 / 60;
    Object.entries(this.lapisan).forEach(([nama, l]) => {
      const a = (P.b.suara || {})[nama] || 0;
      const b = P.lain ? ((P.lain.suara || {})[nama] || 0) : a;
      const target = (a + (b - a) * P.campur) * 0.42;
      l.v += (target - l.v) * (1 - Math.exp(-2 * dt));
      l.g.gain.value = l.v;
    });
  },

  setNyala(v) {
    this.nyala = v;
    this.tombol.setAttribute('aria-pressed', String(v));
    this.tombol.setAttribute('aria-label', v ? 'Matikan suara' : 'Nyalakan suara');
    if (this.utama) this.utama.gain.value = v ? 1 : 0;
    if (v) { this.musik.volume = 0.55; this.musik.play().catch(() => {}); } else this.musik.pause();
  },
  alih() { this.setNyala(!this.nyala); }
};

/* ===================== 6. MEMBUKA UNDANGAN ===================== */
function pasangPembuka(dunia) {
  const tombol = $('#buka');
  tombol.addEventListener('click', async () => {
    tombol.disabled = true;
    suara.mulai();
    $('#sampul').classList.add('is-terbuka');
    document.body.classList.remove('terkunci');
    gulir.ukur(true);
    gulir.terkunci = false;
    $('#kontrol').hidden = false;
    await tunggu(500);
    // Kamera maju melewati gapura yang terbuka
    const b = dunia.bab[0];
    await gulir.animasiKe(b.mulai + b.durasi * 0.42, kurangiGerak ? 10 : 2600);
    petunjuk.mulai();
  }, { once: true });
}

/* ===================== 7. MENU, PETUNJUK ===================== */
const menu = {
  pasang(dunia) {
    this.tombol = $('#tombol-menu');
    this.panel = $('#menu');
    const daftar = $('#menu-daftar');
    this.item = new Map();
    dunia.bab.forEach((b) => {
      const li = el('li');
      const btn = el('button', null, b.judul);
      btn.type = 'button';
      btn.addEventListener('click', () => { this.tutup(); gulir.lompat(b.mulai + b.durasi * 0.12); });
      li.append(btn); daftar.append(li);
      this.item.set(b.id, btn);
    });
    this.tombol.addEventListener('click', () => (this.panel.hidden ? this.buka() : this.tutup()));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !this.panel.hidden) this.tutup(); });
    document.addEventListener('pointerdown', (e) => {
      if (!this.panel.hidden && !this.panel.contains(e.target) && !this.tombol.contains(e.target)) this.tutup();
    });
  },
  buka() { this.panel.hidden = false; this.tombol.setAttribute('aria-expanded', 'true'); },
  tutup() { this.panel.hidden = true; this.tombol.setAttribute('aria-expanded', 'false'); },
  tandai(id) { this.item && this.item.forEach((btn, k) => btn.setAttribute('aria-current', String(k === id))); }
};

const petunjuk = {
  n: null, aktif: false, terakhir: 0, posisiTerakhir: 0,
  mulai() { this.n = $('#petunjuk'); this.aktif = true; this.terakhir = performance.now(); },
  cek(s, total) {
    if (!this.aktif) return;
    const now = performance.now();
    if (Math.abs(s - this.posisiTerakhir) > 0.01) { this.posisiTerakhir = s; this.terakhir = now; }
    const diam = now - this.terakhir > 3500;
    this.n.classList.toggle('is-tampil', diam && s < total - 0.5 && !document.querySelector('dialog[open]'));
  }
};

/* ===================== 8. HITUNG MUNDUR ===================== */
function pasangHitung() {
  const target = new Date(DATA.countdownTarget).getTime();
  const angka = Object.fromEntries($$('[data-unit]').map((n) => [n.dataset.unit, n]));
  const lalu = {};
  const set = (u, v) => {
    const t = String(v).padStart(2, '0');
    if (lalu[u] === t) return;
    lalu[u] = t;
    angka[u].textContent = t;
    if (!kurangiGerak) { angka[u].classList.remove('is-tick'); void angka[u].offsetWidth; angka[u].classList.add('is-tick'); }
  };
  const detik = () => {
    const sisa = target - Date.now();
    if (sisa <= 0) { ['days', 'hours', 'minutes', 'seconds'].forEach((u) => set(u, 0)); $('#hitung-selesai').hidden = false; return; }
    const s = Math.floor(sisa / 1000);
    set('days', Math.floor(s / 86400)); set('hours', Math.floor((s % 86400) / 3600));
    set('minutes', Math.floor((s % 3600) / 60)); set('seconds', s % 60);
    setTimeout(detik, 1000 - (Date.now() % 1000) + 5);
  };
  detik();
}

/* ===================== 9. GALERI + LIGHTBOX ===================== */
function pasangGaleri(dunia) {
  const dlg = $('#lightbox'), img = $('#lightbox-img'), cap = $('#lightbox-caption'), cnt = $('#lightbox-counter');
  let indeks = 0;
  const tampil = (i) => {
    indeks = (i + GALERI.length) % GALERI.length;
    const g = GALERI[indeks];
    img.style.opacity = '0';
    img.onload = () => { img.style.opacity = '1'; };
    img.src = g.full; img.alt = g.alt;
    cap.textContent = g.alt;
    cnt.textContent = `${indeks + 1} / ${GALERI.length}`;
  };
  const buka = (i) => { tampil(i); bukaDialog(dlg); };

  // Ketuk foto di dunia 3D (event click hanya muncul bila jari tidak menggeser)
  $('#dunia').addEventListener('click', (e) => {
    const i = dunia.ketuk(e.clientX, e.clientY);
    if (i >= 0) buka(i);
  });
  // Tombol kecil untuk aksesibilitas & sentuhan cepat
  const daftar = $('#galeri-akses');
  GALERI.forEach((g, i) => {
    const li = el('li'), btn = el('button'), t = el('img');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Perbesar foto ${i + 1}: ${g.alt}`);
    t.src = g.thumb; t.alt = ''; t.loading = 'lazy'; t.decoding = 'async';
    btn.append(t); btn.addEventListener('click', () => buka(i));
    li.append(btn); daftar.append(li);
  });

  dlg.addEventListener('click', (e) => {
    const aksi = e.target.closest('[data-lightbox]')?.dataset.lightbox;
    if (aksi === 'close') dlg.close();
    else if (aksi === 'prev') tampil(indeks - 1);
    else if (aksi === 'next') tampil(indeks + 1);
    else if (e.target === dlg || e.target.classList.contains('lightbox__figure')) dlg.close();
  });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') tampil(indeks - 1); if (e.key === 'ArrowRight') tampil(indeks + 1); });
  let x0 = null;
  dlg.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  dlg.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) tampil(indeks + (dx < 0 ? 1 : -1));
  });
}

// Dialog: kunci gulir halaman selama terbuka agar cerita tidak bergeser
function bukaDialog(dlg) {
  gulir.terkunci = true;
  root.classList.add('dialog-terbuka');
  dlg.showModal();
}
function pasangDialog() {
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('close', () => {
      if (document.querySelector('dialog[open]')) return;
      root.classList.remove('dialog-terbuka');
      gulir.terkunci = false;
    });
    dlg.addEventListener('click', (e) => {
      if (e.target.closest('[data-tutup]') || (e.target === dlg && dlg.classList.contains('lembar'))) dlg.close();
    });
  });
  $$('[data-buka]').forEach((btn) => btn.addEventListener('click', () => bukaDialog(document.getElementById(btn.dataset.buka))));
}

/* ===================== 10. RSVP & UCAPAN ===================== */
const P = DATA.penyimpanan;
const toko = {
  async daftar() {
    if (P.apiEndpoint) {
      const r = await fetch(P.apiEndpoint, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }
    try { const raw = JSON.parse(localStorage.getItem(P.localKey) || '[]'); return Array.isArray(raw) ? raw : []; } catch { return []; }
  },
  async tambah(e) {
    if (P.apiEndpoint) {
      const r = await fetch(P.apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }
    const semua = await this.daftar();
    semua.push(e);
    localStorage.setItem(P.localKey, JSON.stringify(semua.slice(-200)));
    return e;
  }
};

const rapikan = (w) => {
  if (!w || typeof w !== 'object') return null;
  const name = String(w.name ?? '').trim().slice(0, P.maxNama);
  const message = String(w.message ?? '').trim().slice(0, P.maxPesan);
  if (!name || !message) return null;
  const d = new Date(w.createdAt);
  return { name, message, attendance: w.attendance === 'hadir' ? 'hadir' : 'tidak', guests: clamp(parseInt(w.guests, 10) || 0, 0, 10), createdAt: Number.isNaN(d.getTime()) ? new Date() : d };
};

const waktuRelatif = (() => {
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
  const step = [[60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.35, 'week'], [12, 'month'], [Infinity, 'year']];
  return (d) => {
    let v = (d.getTime() - Date.now()) / 1000;
    for (const [n, u] of step) { if (Math.abs(v) < n) return u === 'second' && Math.abs(v) < 45 ? 'baru saja' : rtf.format(Math.round(v), u); v /= n; }
    return '';
  };
})();

function pasangRsvp() {
  const form = $('#rsvp-form'), daftar = $('#wishes-list'), kosong = $('#wishes-empty'), cuplikan = $('#ucapan-cuplikan');
  const tamu = $('#guests-field'), pesan = $('#rsvp-message'), hitung = $('#message-count');
  const kirim = $('button[type="submit"]', form);
  let semua = [];

  const kartu = (w) => {
    const li = el('li', 'wish'), kepala = el('div', 'wish__head');
    kepala.append(el('span', 'wish__name', w.name));
    kepala.append(el('span', `wish__badge${w.attendance === 'tidak' ? ' wish__badge--tidak' : ''}`, w.attendance === 'hadir' ? `Hadir${w.guests > 1 ? ` · ${w.guests} orang` : ''}` : 'Berhalangan'));
    const t = el('time', 'wish__time', waktuRelatif(w.createdAt));
    t.dateTime = w.createdAt.toISOString();
    li.append(kepala, el('p', 'wish__message', w.message), t);
    return li;
  };
  const tampil = () => {
    const urut = semua.slice().reverse();
    daftar.replaceChildren(...urut.map(kartu));
    cuplikan.replaceChildren(...urut.slice(0, 2).map(kartu));
    kosong.hidden = semua.length > 0;
    $('#stat-total').textContent = semua.length;
    $('#stat-hadir').textContent = semua.filter((w) => w.attendance === 'hadir').length;
    $('#stat-tidak').textContent = semua.filter((w) => w.attendance === 'tidak').length;
  };
  toko.daftar().then((r) => { semua = r.map(rapikan).filter(Boolean); tampil(); }).catch(() => { tampil(); toast('Gagal memuat ucapan.'); });

  form.addEventListener('change', (e) => { if (e.target.name === 'attendance') { tamu.hidden = e.target.value !== 'hadir'; galat('attendance', false); } });
  pesan.addEventListener('input', () => { hitung.textContent = pesan.value.length; });

  function galat(f, ada) {
    const n = $(`#rsvp-${f}-error`); n.hidden = !ada;
    const input = f === 'attendance' ? null : $(`#rsvp-${f}`);
    if (input) { input.setAttribute('aria-invalid', String(ada)); if (ada) input.setAttribute('aria-describedby', n.id); else input.removeAttribute('aria-describedby'); }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const name = String(d.get('name') || '').trim(), hadir = d.get('attendance'), teks = String(d.get('message') || '').trim();
    galat('name', !name); galat('attendance', !hadir); galat('message', !teks);
    if (!name) return $('#rsvp-name').focus();
    if (!hadir) return $('input[name="attendance"]', form).focus();
    if (!teks) return pesan.focus();
    const entri = { name: name.slice(0, P.maxNama), attendance: hadir, guests: hadir === 'hadir' ? Number(d.get('guests')) || 1 : 0, message: teks.slice(0, P.maxPesan), createdAt: new Date().toISOString() };
    kirim.disabled = true;
    try {
      semua.push(rapikan(await toko.tambah(entri)) || rapikan(entri));
      tampil();
      form.reset(); tamu.hidden = false; hitung.textContent = '0';
      $('#lembar-rsvp').close();
      toast('Terima kasih! Ucapan Anda telah terkirim.');
    } catch {
      toast('Maaf, ucapan gagal dikirim. Silakan coba lagi.');
    } finally { kirim.disabled = false; }
  });
}

/* ===================== 11. SALIN & TAUTAN ===================== */
async function salin(teks) {
  try { await navigator.clipboard.writeText(teks); return true; } catch {
    const a = el('textarea'); a.value = teks; a.setAttribute('readonly', ''); a.className = 'sprite';
    document.body.append(a); a.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
    a.remove(); return ok;
  }
}
function pasangTautan() {
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => toast((await salin(b.dataset.copy)) ? b.dataset.copyMessage : 'Gagal menyalin. Silakan salin manual.')));
  $('#tautan-peta').href = DATA.mapsUrl;
  const k = DATA.kalender;
  $('#tautan-kalender').href = `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: 'TEMPLATE', text: k.title, dates: `${k.startUtc}/${k.endUtc}`, details: k.details, location: k.location })}`;
  $('#ulang').addEventListener('click', () => gulir.lompat(0.45 * BAB[0].durasi));
}

/* ===================== INIT ===================== */
async function init() {
  let dunia;
  try {
    const font = (document.fonts ? document.fonts.ready : Promise.resolve());
    dunia = await Dunia.buat($('#dunia'), { kurangiGerak, onProgress: (p) => loading.set(p * 0.92) });
    await Promise.race([font, tunggu(3000)]);
  } catch (err) {
    console.warn('[Undangan] Dunia 3D gagal dimuat, beralih ke versi ringan:', err);
    location.replace('klasik.html');
    return;
  }
  window.__dunia = dunia; // untuk pengujian & debugging
  gulir.pasang(dunia);
  naskah.pasang(dunia);
  suara.pasang();
  menu.pasang(dunia);
  pasangPembuka(dunia);
  pasangHitung();
  pasangGaleri(dunia);
  pasangDialog();
  pasangRsvp();
  pasangTautan();
  await loading.selesai();
}

init();
