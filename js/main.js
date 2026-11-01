/* =========================================================================
   MAIN — animasi, interaksi, dan fitur undangan
   -------------------------------------------------------------------------
   Daftar modul (urut sesuai pemanggilan di init()):
     1.  Utilitas & toast
     2.  Preloader (progress bar emas)
     3.  Smooth scroll (Lenis + GSAP ScrollTrigger)
     4.  Scene 3D hero (scene.js)
     5.  Buka undangan + musik
     6.  Animasi masuk section
     7.  Hitung mundur
     8.  Galeri + lightbox
     9.  RSVP & ucapan (localStorage / API)
     10. Salin nomor / alamat hadiah
     11. Dock navigasi, kalender, kursor kustom
   Semua fitur tetap berfungsi (tanpa animasi) bila GSAP/Lenis gagal dimuat.
   ========================================================================= */
(() => {
  'use strict';

  const CFG = window.WEDDING_CONFIG;
  const { ASSETS, GALLERY, WEDDING, STORAGE } = CFG;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const hasGsap = Boolean(gsap && ScrollTrigger);
  const animate = hasGsap && !reducedMotion;

  /* ===================== 1. UTILITAS ===================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text; // selalu textContent: aman dari XSS
    return node;
  };

  const toast = (() => {
    const node = $('#toast');
    let timer = null;
    return (message) => {
      node.textContent = message;
      node.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(() => node.classList.remove('is-visible'), 2600);
    };
  })();

  /* ===================== 2. PRELOADER ===================== */
  const preloader = (() => {
    const loader = $('#loader');
    const fill = $('#loader-fill');
    const percent = $('#loader-percent');
    const bar = $('.loader__bar', loader);
    const weights = { scene: 0.6, fonts: 0.15, images: 0.25 };
    const progress = { scene: 0, fonts: 0, images: 0 };
    const startedAt = performance.now();
    let shown = 0;

    const render = () => {
      const total = Object.keys(weights).reduce((sum, k) => sum + weights[k] * progress[k], 0);
      shown = Math.max(shown, total); // tidak pernah mundur
      const pct = Math.round(shown * 100);
      fill.style.transform = `scaleX(${shown})`;
      percent.textContent = `${pct}%`;
      bar.setAttribute('aria-valuenow', String(pct));
    };

    return {
      update(key, value) { progress[key] = Math.min(Math.max(value, 0), 1); render(); },
      async hide() {
        Object.keys(progress).forEach((k) => { progress[k] = 1; });
        render();
        const minVisible = 1400 - (performance.now() - startedAt); // biar ornamen sempat terlihat
        if (minVisible > 0) await wait(minVisible);
        await wait(250);
        if (animate) {
          await gsap.to(loader, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' });
        }
        loader.remove();
      }
    };
  })();

  function preloadImages(urls, onProgress) {
    let done = 0;
    return Promise.all(urls.map((url) => new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => { done += 1; onProgress(done / urls.length); resolve(); };
      img.src = url;
    })));
  }

  /* ===================== 3. SMOOTH SCROLL ===================== */
  let lenis = null;

  function setupScroll() {
    if (hasGsap) gsap.registerPlugin(ScrollTrigger);
    if (animate && window.Lenis) {
      lenis = new window.Lenis({ autoRaf: false, lerp: 0.09, wheelMultiplier: 0.9 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      root.style.scrollBehavior = 'auto';
    }
    lockScroll(true);

    // Semua tautan internal (#id) memakai scroll halus
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = $(link.getAttribute('href'));
      if (!target || root.classList.contains('is-locked')) return;
      e.preventDefault();
      scrollToEl(target);
    });
  }

  function lockScroll(locked) {
    root.classList.toggle('is-locked', locked);
    if (lenis) (locked ? lenis.stop() : lenis.start());
  }

  function scrollToEl(target) {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  /* ===================== 4. SCENE 3D HERO ===================== */
  const hero = $('#hero');
  let scene = null;

  async function setupScene() {
    if (!window.KratonScene) throw new Error('scene-script-missing');
    scene = await window.KratonScene.create($('#scene-canvas'), ASSETS, {
      reducedMotion,
      onProgress: (p) => preloader.update('scene', p),
      onContextLost: () => hero.classList.remove('is-3d-ready')
    });
    hero.classList.add('is-3d-ready');

    // Hentikan render saat hero tidak terlihat (hemat baterai & GPU)
    new IntersectionObserver(([entry]) => scene.setActive(entry.isIntersecting), { threshold: 0 }).observe(hero);

    // Kamera maju perlahan saat hero di-scroll
    if (hasGsap) {
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: (self) => scene.setScrollProgress(self.progress)
      });
    }
  }

  function setupHeroScrollFade() {
    if (!animate) return;
    gsap.to('.hero__content', {
      yPercent: -18, autoAlpha: 0, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 35%', scrub: true }
    });
  }

  function heroIntro() {
    if (!animate) return;
    gsap.fromTo('[data-hero-item]',
      { y: 34, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1.2, ease: 'power3.out', stagger: 0.14 });
  }

  /* ===================== 5. BUKA UNDANGAN + MUSIK ===================== */
  const music = (() => {
    const audio = $('#bg-music');
    const toggle = $('#music-toggle');
    let wantPlaying = false;

    // Sumber dipasang di awal, tetapi file baru diunduh saat diputar (preload="none")
    ASSETS.music.forEach(({ src, type }) => {
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      audio.append(source);
    });
    audio.volume = 0.6;

    const setUi = (playing) => {
      toggle.setAttribute('aria-pressed', String(playing));
      toggle.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
    };

    const play = () => {
      wantPlaying = true;
      if (animate) audio.volume = 0;
      const attempt = audio.play();
      if (attempt && attempt.then) {
        attempt.then(() => {
          setUi(true);
          if (animate) gsap.to(audio, { volume: 0.6, duration: 2.5, ease: 'power1.out' });
          else audio.volume = 0.6;
        }).catch(() => { wantPlaying = false; setUi(false); });
      }
    };
    const pause = () => { wantPlaying = false; audio.pause(); setUi(false); };

    toggle.addEventListener('click', () => (audio.paused ? play() : pause()));
    audio.addEventListener('error', () => setUi(false), true);

    // Jeda saat tab tidak aktif, lanjutkan saat kembali
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) audio.pause();
      else if (wantPlaying) audio.play().catch(() => setUi(false));
    });

    return { play, showToggle: () => { toggle.hidden = false; } };
  })();

  function setupOpening() {
    const btn = $('#open-invitation');
    const dock = $('#dock');
    let opened = false;

    btn.addEventListener('click', async () => {
      if (opened) return;
      opened = true;
      btn.disabled = true;
      music.play(); // harus dipanggil langsung di dalam klik (kebijakan autoplay browser)

      if (animate) gsap.to(btn, { autoAlpha: 0, y: 12, scale: 0.96, duration: 0.45, ease: 'power2.in' });
      const gateOpening = scene ? scene.open() : Promise.resolve();
      await Promise.race([Promise.all([gateOpening, wait(animate ? 900 : 0)]), wait(3500)]);

      btn.hidden = true;
      const scrollHint = $('#hero-scroll');
      scrollHint.hidden = false;
      if (animate) gsap.fromTo(scrollHint, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.8 });

      lockScroll(false);
      dock.hidden = false;
      root.style.setProperty('--dock-h', `${dock.offsetHeight + 12}px`);
      music.showToggle();
      if (animate) gsap.from([dock, '#music-toggle'], { y: 30, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.1 });
      // Tunggu satu frame agar ukuran halaman terhitung ulang setelah kunci scroll dilepas
      await new Promise((r) => requestAnimationFrame(r));
      if (lenis) lenis.resize();
      if (hasGsap) ScrollTrigger.refresh();

      scrollToEl($('#salam'));
    });
  }

  /* ===================== 6. ANIMASI MASUK SECTION ===================== */
  function setupReveals() {
    if (!animate) return;
    const base = { ease: 'power3.out', duration: 1.1 };

    // Elemen tunggal: fade + naik
    $$('[data-reveal]').forEach((node) => {
      gsap.from(node, { ...base, y: 44, autoAlpha: 0, scrollTrigger: { trigger: node, start: 'top 86%', once: true } });
    });

    // Kelompok bersaudara: muncul bergantian (stagger)
    const parents = new Set($$('[data-reveal-group]').map((n) => n.parentElement));
    parents.forEach((parent) => {
      const items = Array.from(parent.children).filter((c) => c.hasAttribute('data-reveal-group'));
      gsap.from(items, { ...base, y: 54, autoAlpha: 0, stagger: 0.18, scrollTrigger: { trigger: parent, start: 'top 84%', once: true } });
    });

    // Kartu mempelai: isi kartu muncul satu per satu
    $$('[data-reveal-stagger]').forEach((card) => {
      gsap.from(card.children, { ...base, y: 36, autoAlpha: 0, stagger: 0.12, scrollTrigger: { trigger: card, start: 'top 82%', once: true } });
    });
  }

  /* ===================== 7. HITUNG MUNDUR ===================== */
  function setupCountdown() {
    const target = new Date(WEDDING.countdownTarget).getTime();
    const nums = Object.fromEntries($$('[data-unit]').map((n) => [n.dataset.unit, n]));
    const last = {};
    let timer = null;

    const setUnit = (unit, value) => {
      const text = String(value).padStart(2, '0');
      if (last[unit] === text) return;
      last[unit] = text;
      const node = nums[unit];
      node.textContent = text;
      if (!reducedMotion) { // efek flip setiap angka berubah
        node.classList.remove('is-tick');
        void node.offsetWidth;
        node.classList.add('is-tick');
      }
    };

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        ['days', 'hours', 'minutes', 'seconds'].forEach((u) => setUnit(u, 0));
        $('#countdown-done').hidden = false;
        return false;
      }
      const s = Math.floor(diff / 1000);
      setUnit('days', Math.floor(s / 86400));
      setUnit('hours', Math.floor((s % 86400) / 3600));
      setUnit('minutes', Math.floor((s % 3600) / 60));
      setUnit('seconds', s % 60);
      return true;
    };

    const loop = () => { if (tick()) timer = setTimeout(loop, 1000 - (Date.now() % 1000) + 5); };
    loop();
    document.addEventListener('visibilitychange', () => {
      clearTimeout(timer);
      if (!document.hidden) loop();
    });
  }

  /* ===================== 8. GALERI + LIGHTBOX ===================== */
  function setupGallery() {
    const list = $('#gallery');
    const dialog = $('#lightbox');
    const img = $('#lightbox-img');
    const caption = $('#lightbox-caption');
    const counter = $('#lightbox-counter');
    const figure = $('.lightbox__figure', dialog);
    let index = 0;
    let closing = false;

    GALLERY.forEach((item, i) => {
      const li = el('li', 'gallery__item');
      const btn = el('button', 'gallery__btn');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Perbesar foto ${i + 1}: ${item.alt}`);
      const thumb = el('img');
      thumb.src = item.thumb;
      thumb.alt = item.alt;
      thumb.width = item.w;
      thumb.height = item.h;
      thumb.loading = 'lazy';
      thumb.decoding = 'async';
      btn.append(thumb);
      btn.addEventListener('click', () => open(i));
      li.append(btn);
      list.append(li);
    });

    if (animate) {
      gsap.from(list.children, {
        scale: 0.86, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: list, start: 'top 85%', once: true }
      });
    }

    const show = (i, direction = 0) => {
      index = (i + GALLERY.length) % GALLERY.length;
      const item = GALLERY[index];
      const apply = () => {
        img.src = item.full;
        img.alt = item.alt;
        caption.textContent = item.alt;
        counter.textContent = `${index + 1} / ${GALLERY.length}`;
      };
      if (animate && direction) {
        gsap.to(img, {
          autoAlpha: 0, x: -30 * direction, duration: 0.2, onComplete: () => {
            apply();
            gsap.fromTo(img, { x: 30 * direction }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' });
          }
        });
      } else apply();
    };

    const open = (i) => {
      show(i);
      dialog.showModal();
      if (lenis) lenis.stop();
      if (animate) gsap.fromTo(figure, { scale: 0.82, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'power3.out' });
    };

    const close = async () => {
      if (closing || !dialog.open) return;
      closing = true;
      if (animate) await gsap.to(figure, { scale: 0.9, autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
      dialog.close();
      closing = false;
    };

    dialog.addEventListener('close', () => { if (lenis) lenis.start(); });
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); }); // tombol Esc
    dialog.addEventListener('click', (e) => {
      const action = e.target.closest('[data-lightbox]')?.dataset.lightbox;
      if (action === 'close') close();
      else if (action === 'prev') show(index - 1, -1);
      else if (action === 'next') show(index + 1, 1);
      else if (e.target === dialog || e.target === figure) close(); // klik area gelap
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1, -1);
      if (e.key === 'ArrowRight') show(index + 1, 1);
    });

    // Geser (swipe) di layar sentuh
    let startX = null;
    dialog.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    dialog.addEventListener('pointerup', (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
  }

  /* ===================== 9. RSVP & UCAPAN ===================== */
  // Lapisan penyimpanan: localStorage (demo) atau API (jika STORAGE.apiEndpoint diisi)
  const wishStore = {
    async list() {
      if (STORAGE.apiEndpoint) {
        const res = await fetch(STORAGE.apiEndpoint, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE.localKey) || '[]');
        return Array.isArray(raw) ? raw : [];
      } catch {
        return [];
      }
    },
    async add(entry) {
      if (STORAGE.apiEndpoint) {
        const res = await fetch(STORAGE.apiEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
      const all = await this.list();
      all.push(entry);
      localStorage.setItem(STORAGE.localKey, JSON.stringify(all.slice(-200)));
      return entry;
    }
  };

  // Validasi data dari penyimpanan sebelum ditampilkan
  const normalizeWish = (w) => {
    if (!w || typeof w !== 'object') return null;
    const name = String(w.name ?? '').trim().slice(0, STORAGE.maxNameLength);
    const message = String(w.message ?? '').trim().slice(0, STORAGE.maxMessageLength);
    if (!name || !message) return null;
    const time = new Date(w.createdAt);
    return {
      name, message,
      attendance: w.attendance === 'hadir' ? 'hadir' : 'tidak',
      guests: Math.min(Math.max(parseInt(w.guests, 10) || 0, 0), 10),
      createdAt: Number.isNaN(time.getTime()) ? new Date() : time
    };
  };

  const relativeTime = (() => {
    const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
    const steps = [[60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.35, 'week'], [12, 'month'], [Infinity, 'year']];
    return (date) => {
      let value = (date.getTime() - Date.now()) / 1000;
      for (const [size, unit] of steps) {
        if (Math.abs(value) < size) return unit === 'second' && Math.abs(value) < 45 ? 'baru saja' : rtf.format(Math.round(value), unit);
        value /= size;
      }
      return '';
    };
  })();

  function setupRsvp() {
    const form = $('#rsvp-form');
    const listNode = $('#wishes-list');
    const empty = $('#wishes-empty');
    const guestsField = $('#guests-field');
    const message = $('#rsvp-message');
    const count = $('#message-count');
    const submitBtn = $('button[type="submit"]', form);
    let wishes = [];

    const renderWish = (w) => {
      const li = el('li', 'wish');
      const head = el('div', 'wish__head');
      head.append(el('span', 'wish__name', w.name));
      const badge = el('span', `wish__badge${w.attendance === 'tidak' ? ' wish__badge--tidak' : ''}`,
        w.attendance === 'hadir' ? `Hadir${w.guests > 1 ? ` · ${w.guests} orang` : ''}` : 'Tidak hadir');
      head.append(badge);
      const time = el('time', 'wish__time', relativeTime(w.createdAt));
      time.dateTime = w.createdAt.toISOString();
      time.title = w.createdAt.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
      li.append(head, el('p', 'wish__message', w.message), time);
      return li;
    };

    const render = () => {
      listNode.replaceChildren(...wishes.slice().reverse().map(renderWish));
      empty.hidden = wishes.length > 0;
      listNode.hidden = wishes.length === 0;
      $('#stat-total').textContent = wishes.length;
      $('#stat-hadir').textContent = wishes.filter((w) => w.attendance === 'hadir').length;
      $('#stat-tidak').textContent = wishes.filter((w) => w.attendance === 'tidak').length;
    };

    wishStore.list()
      .then((raw) => { wishes = raw.map(normalizeWish).filter(Boolean); render(); })
      .catch(() => { render(); toast('Gagal memuat ucapan. Coba muat ulang halaman.'); });

    // Jumlah tamu hanya relevan bila hadir
    form.addEventListener('change', (e) => {
      if (e.target.name === 'attendance') {
        guestsField.hidden = e.target.value !== 'hadir';
        setError('attendance', false);
      }
    });
    message.addEventListener('input', () => { count.textContent = message.value.length; });

    function setError(field, show) {
      const err = $(`#rsvp-${field}-error`);
      err.hidden = !show;
      const input = field === 'attendance' ? null : $(`#rsvp-${field}`);
      if (input) {
        input.setAttribute('aria-invalid', String(show));
        if (show) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const attendance = data.get('attendance');
      const text = String(data.get('message') || '').trim();

      setError('name', !name);
      setError('attendance', !attendance);
      setError('message', !text);
      if (!name) return $('#rsvp-name').focus();
      if (!attendance) return $('input[name="attendance"]', form).focus();
      if (!text) return message.focus();

      const entry = {
        name: name.slice(0, STORAGE.maxNameLength),
        attendance,
        guests: attendance === 'hadir' ? Number(data.get('guests')) || 1 : 0,
        message: text.slice(0, STORAGE.maxMessageLength),
        createdAt: new Date().toISOString()
      };

      submitBtn.disabled = true;
      try {
        const saved = normalizeWish(await wishStore.add(entry)) || normalizeWish(entry);
        wishes.push(saved);
        render();
        form.reset();
        guestsField.hidden = false;
        count.textContent = '0';
        toast('Terima kasih! Ucapan Anda telah terkirim.');
        const first = listNode.firstElementChild;
        listNode.scrollTop = 0;
        if (animate && first) gsap.from(first, { y: -16, autoAlpha: 0, duration: 0.6, ease: 'power2.out' });
      } catch {
        toast('Maaf, ucapan gagal dikirim. Silakan coba lagi.');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ===================== 10. SALIN NOMOR / ALAMAT ===================== */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Cadangan untuk browser lama / konteks non-HTTPS
      const area = el('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      area.remove();
      return ok;
    }
  }

  function setupCopy() {
    $$('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const ok = await copyText(btn.dataset.copy);
        toast(ok ? btn.dataset.copyMessage || 'Berhasil disalin!' : 'Gagal menyalin. Silakan salin manual.');
      });
    });
  }

  /* ===================== 11. DOCK, KALENDER, KURSOR ===================== */
  function setupDock() {
    const links = $$('.dock__link');
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        const active = map.get(entry.target.id);
        if (active) { active.classList.add('is-active'); active.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_a, id) => { const section = document.getElementById(id); if (section) io.observe(section); });
  }

  function setupLinks() {
    $('#maps-link').href = WEDDING.mapsUrl;
    const c = WEDDING.calendar;
    const params = new URLSearchParams({
      action: 'TEMPLATE', text: c.title, dates: `${c.startUtc}/${c.endUtc}`, details: c.details, location: c.location
    });
    $('#calendar-link').href = `https://calendar.google.com/calendar/render?${params}`;
  }

  function setupCursor() {
    if (!animate || !window.matchMedia('(pointer: fine)').matches) return;
    const cursor = $('.cursor');
    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);
    root.classList.add('has-cursor');
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08 });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08 });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });
    cursor.classList.add('is-hidden');

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      cursor.classList.remove('is-hidden');
      dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      cursor.classList.toggle('is-hover', Boolean(e.target.closest('a, button, input, select, textarea, label')));
    });
    document.documentElement.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  }

  /* ===================== INIT ===================== */
  async function init() {
    if (animate) gsap.set('[data-hero-item]', { autoAlpha: 0, y: 34 });
    setupScroll();
    setupLinks();
    setupOpening();
    setupCountdown();
    setupGallery();
    setupRsvp();
    setupCopy();
    setupDock();
    setupCursor();

    const fonts = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => preloader.update('fonts', 1));
    const images = preloadImages([ASSETS.groomPhoto, ASSETS.bridePhoto, ASSETS.batikPattern], (p) => preloader.update('images', p));
    const scene3d = setupScene().catch((err) => {
      // Tanpa WebGL / dibuka via file:// -> hero memakai gambar statis
      console.info('[Undangan] Hero memakai gambar statis:', err.message);
    });

    // Batas waktu 12 detik agar tamu tidak tertahan di layar loading
    await Promise.race([Promise.all([fonts, images, scene3d]), wait(12000)]);

    setupReveals();
    setupHeroScrollFade();
    await preloader.hide();
    heroIntro();
    if (hasGsap) ScrollTrigger.refresh();
  }

  init();
})();
