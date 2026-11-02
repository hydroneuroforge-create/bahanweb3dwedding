/* =========================================================================
   DUNIA 3D SINEMATIK — mesin Three.js
   -------------------------------------------------------------------------
   Membangun & menggerakkan seluruh dunia berdasarkan naskah di cerita.js.

   Bagian:
     1. Utilitas & tekstur buatan kanvas
     2. Langit (gradasi, matahari, awan, bintang)
     3. Latar diorama (gambar + peta kedalaman -> mesh 3D)
     4. Lapisan (potongan gambar, kabut, sinar, air, bingkai galeri)
     5. Partikel yang selalu mengelilingi kamera
        (kelopak, kilau, kunang-kunang, lampion, burung, kembang api)
     6. Tirai transisi antar bab
     7. Kelas Dunia: kamera, pencampuran suasana, loop render, kualitas adaptif

   Tidak ada OrbitControls: kamera sepenuhnya dikendalikan posisi gulir.
   ========================================================================= */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SUSUNAN, LATAR, POTONGAN, WAKTU, BAB, GALERI } from './cerita.js';

/* ===================== 1. UTILITAS ===================== */
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
// Panjang ruang gulir video transisi sesudah bab (0 bila bab tidak memakai klip)
const panjangKlip = (b) => (b.klip ? b.klip.panjang : 0);
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const rand = (() => { let s = 20261226; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

// Potongan GLSL bersama: hash & noise
const GLSL_NOISE = /* glsl */`
  float hash11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float hash31(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float noise3(vec3 x){
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x), mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x), mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm3(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise3(p); p = p * 2.03 + 1.7; a *= 0.5; } return v; }
`;

function kanvas(w, h, gambar) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  gambar(cv.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Gumpalan awan/kabut lembut
const teksturAwan = () => kanvas(512, 256, (c, w, h) => {
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    const x = w / 2 + Math.cos(a) * r * w * 0.36;
    const y = h * 0.55 + Math.sin(a) * r * h * 0.26;
    const rad = (0.12 + rand() * 0.2) * h;
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, 'rgba(255,255,255,0.16)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
});

// Berkas sinar matahari (god rays)
const teksturSinar = () => kanvas(256, 512, (c, w, h) => {
  for (let i = 0; i < 14; i++) {
    const x = rand() * w;
    const lebar = 6 + rand() * 30;
    const g = c.createLinearGradient(0, 0, 0, h);
    const a = 0.05 + rand() * 0.12;
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.6, `rgba(255,255,255,${a * 0.4})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.filter = 'blur(8px)';
    c.fillRect(x - lebar / 2, 0, lebar, h);
  }
  c.filter = 'none';
  // pudar di tepi kiri & kanan
  c.globalCompositeOperation = 'destination-in';
  const tepi = c.createLinearGradient(0, 0, w, 0);
  tepi.addColorStop(0, 'rgba(0,0,0,0)'); tepi.addColorStop(0.2, 'rgba(0,0,0,1)');
  tepi.addColorStop(0.8, 'rgba(0,0,0,1)'); tepi.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = tepi; c.fillRect(0, 0, w, h);
});

// Kelopak bunga
const teksturKelopak = () => kanvas(128, 128, (c) => {
  c.translate(64, 64);
  c.beginPath();
  c.moveTo(0, 50);
  c.bezierCurveTo(38, 30, 34, -26, 6, -50);
  c.quadraticCurveTo(0, -42, -6, -50);
  c.bezierCurveTo(-34, -26, -38, 30, 0, 50);
  const g = c.createRadialGradient(0, 10, 4, 0, 0, 56);
  g.addColorStop(0, '#fff'); g.addColorStop(0.7, 'rgba(240,236,232,.95)'); g.addColorStop(1, 'rgba(200,190,185,.85)');
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(200,190,185,.5)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(0, 44); c.quadraticCurveTo(4, 0, 0, -38); c.stroke();
});

// Lampion terbang (kertas bercahaya)
const teksturLampion = () => kanvas(128, 160, (c, w, h) => {
  const glow = c.createRadialGradient(w / 2, h * 0.52, 4, w / 2, h * 0.52, w * 0.62);
  glow.addColorStop(0, 'rgba(255,190,90,.55)'); glow.addColorStop(1, 'rgba(255,140,40,0)');
  c.fillStyle = glow; c.fillRect(0, 0, w, h);
  c.beginPath();
  c.moveTo(w * 0.3, h * 0.24); c.lineTo(w * 0.7, h * 0.24);
  c.quadraticCurveTo(w * 0.8, h * 0.5, w * 0.68, h * 0.8);
  c.lineTo(w * 0.32, h * 0.8);
  c.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.3, h * 0.24);
  const body = c.createLinearGradient(0, h * 0.24, 0, h * 0.8);
  body.addColorStop(0, '#E8742E'); body.addColorStop(0.55, '#FFD27A'); body.addColorStop(1, '#FFF1C2');
  c.fillStyle = body; c.fill();
  c.strokeStyle = 'rgba(150,60,20,.55)'; c.lineWidth = 2;
  for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(w * (0.3 + i * 0.1), h * 0.25); c.lineTo(w * (0.32 + i * 0.09), h * 0.79); c.stroke(); }
  c.fillStyle = 'rgba(120,40,20,.8)'; c.fillRect(w * 0.31, h * 0.78, w * 0.38, h * 0.03);
});

// Bingkai emas ukir untuk foto galeri (bagian tengah transparan)
const teksturBingkai = () => kanvas(640, 400, (c, w, h) => {
  const t = 34;
  const emas = c.createLinearGradient(0, 0, w, h);
  emas.addColorStop(0, '#F6DE8D'); emas.addColorStop(0.35, '#C99A2E'); emas.addColorStop(0.55, '#FBE7A1');
  emas.addColorStop(0.8, '#A87A1C'); emas.addColorStop(1, '#F1D78A');
  c.fillStyle = emas; c.fillRect(0, 0, w, h);
  c.clearRect(t, t, w - t * 2, h - t * 2);
  c.strokeStyle = 'rgba(90,50,10,.55)'; c.lineWidth = 3;
  c.strokeRect(6, 6, w - 12, h - 12);
  c.strokeRect(t - 6, t - 6, w - (t - 6) * 2, h - (t - 6) * 2);
  c.strokeStyle = 'rgba(255,248,220,.8)'; c.lineWidth = 1.5;
  c.strokeRect(12, 12, w - 24, h - 24);
  // ukiran sulur di sudut & tengah sisi
  const sulur = (x, y, s) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#7A5512';
    c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFF2C4';
    c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill();
    c.restore();
  };
  [[17, 17], [w - 17, 17], [17, h - 17], [w - 17, h - 17], [w / 2, 17], [w / 2, h - 17], [17, h / 2], [w - 17, h / 2]]
    .forEach(([x, y]) => sulur(x, y, 1.15));
});

/* ===================== 2. LANGIT ===================== */
function buatLangit(U) {
  const mat = new THREE.ShaderMaterial({
    uniforms: U.langit,
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww; // selalu di bidang terjauh
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uAtas, uCakrawala, uBawah, uArahMatahari, uWarnaMatahari, uWarnaAwan;
      uniform float uBesarMatahari, uAwan, uBintang, uWaktu;
      varying vec3 vDir;
      ${GLSL_NOISE}
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uCakrawala, uAtas, smoothstep(0.0, 0.6, h));
        col = mix(col, uBawah, smoothstep(0.0, -0.3, h));
        vec3 sd = normalize(uArahMatahari);
        float s = max(dot(d, sd), 0.0);
        col += uWarnaMatahari * uBesarMatahari * (pow(s, 1400.0) * 6.0 + pow(s, 60.0) * 0.5 + pow(s, 6.0) * 0.22);
        // awan: proyeksi ke bidang langit
        if (uAwan > 0.0 && h > -0.02) {
          vec2 cp = d.xz / (h + 0.2);
          float c = fbm3(vec3(cp * 0.75 + vec2(uWaktu * 0.006, 0.0), uWaktu * 0.01));
          float m = smoothstep(0.48, 0.82, c) * uAwan * smoothstep(-0.02, 0.22, h);
          vec3 awan = uWarnaAwan * (0.82 + 0.35 * pow(s, 4.0)) + uWarnaMatahari * pow(s, 18.0) * 0.4;
          col = mix(col, awan, m * 0.88);
        }
        // bintang berkelip
        if (uBintang > 0.0) {
          vec3 g = d * 220.0;
          vec3 id = floor(g);
          float r = hash31(id);
          float bintang = smoothstep(0.12, 0.0, length(fract(g) - 0.5)) * step(0.982, r);
          bintang *= 0.55 + 0.45 * sin(uWaktu * (1.0 + r * 3.0) + r * 60.0);
          float band = exp(-pow((d.x * 0.6 + d.y - 0.55) * 3.2, 2.0)) * fbm3(d * 6.0) * 0.35; // jejak bima sakti
          col += (vec3(bintang) * 1.6 + vec3(0.55, 0.6, 0.95) * band) * uBintang * smoothstep(-0.02, 0.25, h);
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), mat);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return mesh;
}

/* ===================== 3. LATAR DIORAMA ===================== */
// Mengukur kecerahan & kejenuhan rata-rata gambar (untuk menyamakan semua latar)
function ukurGambar(img) {
  const cv = document.createElement('canvas');
  cv.width = 48; cv.height = 48;
  const c = cv.getContext('2d', { willReadFrequently: true });
  c.drawImage(img, 0, 0, 48, 48);
  const px = c.getImageData(0, 0, 48, 48).data;
  let L = 0, S = 0;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i] / 255, g = px[i + 1] / 255, b = px[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    L += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    S += mx > 0 ? (mx - mn) / mx : 0;
  }
  const n = px.length / 4;
  return { L: L / n, S: S / n };
}

function buatLatar(cfg, tex, segmen) {
  const aspek = tex.map.image.width / tex.map.image.height;
  // Penyamaan: gambar yang terlalu terang/gelap/pucat/jenuh didorong setengah jalan ke nilai sasaran
  const st = ukurGambar(tex.map.image);
  const samakan = cfg.samakan !== false;
  const eksposur = samakan ? clamp(Math.pow(0.42 / Math.max(st.L, 0.05), 0.4), 0.9, 1.12) : 1;
  const jenuh = samakan ? clamp(Math.pow(0.42 / Math.max(st.S, 0.05), 0.45), 0.86, 1.12) : 1;
  const H = cfg.tinggi;
  const W = H * aspek;
  const geo = new THREE.PlaneGeometry(W, H, Math.round(segmen * Math.min(aspek, 2)), Math.round(segmen / Math.max(aspek, 0.5)));
  const warna = cfg.warna || { tint: [1, 1, 1], lift: [0, 0, 0], saturasi: 1 };
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uPeta: { value: null }, uDalam: { value: null }, uSkalaDalam: { value: cfg.kedalaman },
      uTint: { value: new THREE.Vector3(...warna.tint) }, uLift: { value: new THREE.Vector3(...warna.lift) },
      uSaturasi: { value: warna.saturasi * jenuh }, uOpasitas: { value: 1 }, uKabur: { value: 0 },
      uEksposur: { value: eksposur }
    }]),
    vertexShader: /* glsl */`
      uniform sampler2D uDalam; uniform float uSkalaDalam;
      varying vec2 vUv;
      #include <fog_pars_vertex>
      void main(){
        vUv = uv;
        vec3 p = position;
        float d = texture2D(uDalam, uv).r;
        p.z += d * d * uSkalaDalam * 1.35; // kuadrat: objek depan lebih menonjol
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uPeta; uniform vec3 uTint, uLift; uniform float uSaturasi, uOpasitas, uKabur, uEksposur;
      varying vec2 vUv;
      #include <fog_pars_fragment>
      void main(){
        // kabur seperti lensa kamera (depth of field) saat kamera menyorot tokoh
        vec3 c = texture2D(uPeta, vUv, uKabur).rgb;
        if (uKabur > 0.05) {
          vec2 o = vec2(0.0018, 0.0011) * uKabur;
          c = (c * 2.0 + texture2D(uPeta, vUv + o, uKabur).rgb + texture2D(uPeta, vUv - o, uKabur).rgb
             + texture2D(uPeta, vUv + vec2(-o.x, o.y), uKabur).rgb + texture2D(uPeta, vUv + vec2(o.x, -o.y), uKabur).rgb) / 6.0;
        }
        c *= uEksposur;
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(vec3(l), c, uSaturasi) * uTint + uLift;
        // === FILTER FILM SERAGAM (sama untuk semua adegan) ===
        // bayangan sedikit hangat-marun, sorotan keemasan lembut, kontras kurva-S tipis
        l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = mix(c, c * vec3(1.05, 0.98, 0.9), smoothstep(0.35, 1.0, l) * 0.5);
        c += vec3(0.022, 0.008, 0.004) * (1.0 - smoothstep(0.0, 0.35, l));
        c = mix(c, c * c * (3.0 - 2.0 * c), 0.22);
        c = mix(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), c, 0.94);
        float tepi = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x)
                   * smoothstep(0.0, 0.04, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
        gl_FragColor = vec4(c, tepi * uOpasitas);
        #include <fog_fragment>
      }`,
    fog: true,
    transparent: true
  });
  mat.uniforms.uPeta.value = tex.map;
  mat.uniforms.uDalam.value = tex.depth;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = cfg.z;
  mesh.renderOrder = -5;
  mesh.userData = { W, H };
  return mesh;
}

/* ===================== 4. LAPISAN ===================== */
function buatPotongan(cfg, tex) {
  if (cfg.cermin) { tex = tex.clone(); tex.repeat.x = -1; tex.offset.x = 1; tex.needsUpdate = true; }
  const aspek = tex.image.width / tex.image.height;
  const h = cfg.tinggi;
  const w = h * aspek;
  const geo = new THREE.PlaneGeometry(w, h);
  const geser = cfg.jangkar === 'kanan' ? -w / 2 : cfg.jangkar === 'kiri' ? w / 2 : 0;
  geo.translate(geser, h / 2, 0); // titik pusat di bawah (dan di tepi bila berjangkar)
  const terang = cfg.cahaya ?? 1;
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, alphaTest: 0.02, depthWrite: false, fog: true,
    color: new THREE.Color(terang * 1.02, terang * 0.95, terang * 0.9)
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.terang = terang;
  if (cfg.bayangan) mesh.add(Object.assign(buatBayangan(w * 0.95), { renderOrder: -1 }));
  if (cfg.pos) mesh.position.set(...cfg.pos);
  return mesh;
}

// Bayangan lembut di bawah kaki tokoh agar terasa berdiri di lantai
let _teksturBayangan = null;
function buatBayangan(lebar) {
  _teksturBayangan ||= kanvas(256, 128, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(0.45, 'rgba(0,0,0,0.38)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.save(); c.scale(1, h / w); c.fillRect(0, 0, w, w); c.restore();
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(lebar, lebar * 0.32),
    new THREE.MeshBasicMaterial({ map: _teksturBayangan, transparent: true, depthWrite: false, opacity: 0.55, fog: true, color: 0x2a1408 }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.02;
  return m;
}

// Membaca nilai peta kedalaman di titik (u,v) — untuk menaruh tokoh tepat "berdiri" di lantai gambar
function bacaKedalaman(tex) {
  const img = tex.image;
  const cv = document.createElement('canvas');
  cv.width = img.width; cv.height = img.height;
  const c = cv.getContext('2d', { willReadFrequently: true });
  c.drawImage(img, 0, 0);
  const data = c.getImageData(0, 0, cv.width, cv.height).data;
  return (u, v) => {
    const x = Math.min(cv.width - 1, Math.max(0, Math.round(u * (cv.width - 1))));
    const y = Math.min(cv.height - 1, Math.max(0, Math.round(v * (cv.height - 1))));
    return data[(y * cv.width + x) * 4] / 255;
  };
}

function buatKabut(cfg, tex) {
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: cfg.kekuatan });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cfg.ukuran[0], cfg.ukuran[1]), mat);
  mesh.position.set(...cfg.pos);
  mesh.userData.peran = 'kabut';
  return mesh;
}

function buatSinar(cfg, tex) {
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, depthWrite: false, fog: false,
    blending: THREE.AdditiveBlending, opacity: cfg.kekuatan
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cfg.ukuran[0], cfg.ukuran[1]), mat);
  mesh.position.set(...cfg.pos);
  mesh.rotation.z = cfg.rz || 0;
  mesh.userData.peran = 'sinar';
  return mesh;
}

function buatAir(U, y) {
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uDalam: { value: new THREE.Color('#1B2346') } }]),
    vertexShader: /* glsl */`
      varying vec3 vDunia;
      #include <fog_pars_vertex>
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.0);
        vDunia = w.xyz;
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uAtas, uCakrawala, uArahMatahari, uWarnaMatahari, uDalam;
      uniform float uBesarMatahari, uWaktu;
      varying vec3 vDunia;
      #include <fog_pars_fragment>
      void main(){
        vec3 V = normalize(cameraPosition - vDunia);
        vec2 p = vDunia.xz * 0.45; float t = uWaktu;
        vec3 n = normalize(vec3(
          sin(p.x * 3.1 + t * 1.2) * 0.05 + sin(p.y * 4.7 - t * 1.6) * 0.035 + sin((p.x + p.y) * 9.3 + t * 2.3) * 0.015,
          1.0,
          cos(p.y * 3.3 + t * 1.0) * 0.05 + cos((p.x - p.y) * 6.1 - t * 1.8) * 0.025));
        vec3 R = reflect(-V, n);
        float h = clamp(R.y, 0.0, 1.0);
        vec3 langit = mix(uCakrawala, uAtas, smoothstep(0.0, 0.6, h));
        float fres = 0.2 + 0.8 * pow(1.0 - max(dot(n, V), 0.0), 3.0);
        vec3 c = mix(uDalam * 0.6 + uCakrawala * 0.15, langit, fres);
        float s = max(dot(R, normalize(uArahMatahari)), 0.0);
        c += uWarnaMatahari * (pow(s, 260.0) * 5.0 + pow(s, 20.0) * 0.25) * uBesarMatahari;
        gl_FragColor = vec4(c, 1.0);
        #include <fog_fragment>
      }`,
    fog: true
  });
  // uniform langit dipakai bersama agar pantulan selalu cocok dengan langit
  Object.assign(mat.uniforms, {
    uAtas: U.langit.uAtas, uCakrawala: U.langit.uCakrawala, uArahMatahari: U.langit.uArahMatahari,
    uWarnaMatahari: U.langit.uWarnaMatahari, uBesarMatahari: U.langit.uBesarMatahari, uWaktu: U.langit.uWaktu
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 1, 1), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.renderOrder = -4;
  return mesh;
}

/* ===================== 5. PARTIKEL DI SEKITAR KAMERA ===================== */
// Posisi partikel "dibungkus" di dalam kotak yang selalu mengikuti kamera,
// sehingga partikel terasa diam di dunia tetapi tidak pernah habis.
const GLSL_BUNGKUS = /* glsl */`
  uniform vec3 uKamera, uKotak, uMaju;
  vec3 bungkus(vec3 p, out float pudar){
    vec3 pusat = uKamera + uMaju;
    vec3 lokal = mod(p - pusat + uKotak * 0.5, uKotak);
    vec3 e = lokal / uKotak;
    pudar = smoothstep(0.0, 0.12, e.x) * smoothstep(1.0, 0.88, e.x)
          * smoothstep(0.0, 0.12, e.y) * smoothstep(1.0, 0.88, e.y)
          * smoothstep(0.0, 0.15, e.z) * smoothstep(1.0, 0.85, e.z);
    return pusat + lokal - uKotak * 0.5;
  }
`;

function sistemPartikel(U, { jumlah, kotak, maju = [0, 0, -0.35], atribut, vertex, fragment, blending = THREE.NormalBlending, uniform = {} }) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(jumlah * 3);
  const seed = new Float32Array(jumlah);
  for (let i = 0; i < jumlah; i++) {
    pos[i * 3] = rand() * kotak[0];
    pos[i * 3 + 1] = rand() * kotak[1];
    pos[i * 3 + 2] = rand() * kotak[2];
    seed[i] = rand();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  if (atribut) atribut(geo, jumlah);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uWaktu: U.waktu, uSkala: U.skalaTitik, uKamera: U.kamera,
      uKotak: { value: new THREE.Vector3(...kotak) },
      uMaju: { value: new THREE.Vector3(kotak[0] * maju[0], kotak[1] * maju[1], kotak[2] * maju[2]) },
      uIntensitas: { value: 0 }, uGerak: U.gerak,
      ...uniform
    },
    vertexShader: GLSL_NOISE + GLSL_BUNGKUS + vertex,
    fragmentShader: fragment,
    transparent: true, depthWrite: false, blending
  });
  const titik = new THREE.Points(geo, mat);
  titik.frustumCulled = false;
  titik.renderOrder = 5;
  return titik;
}

function buatSemuaPartikel(U, ponsel, tLampion) {
  const f = ponsel ? 0.65 : 1;
  const sistem = {};

  // Kelopak mawar & melati jatuh berputar
  const paletKelopak = ['#F7B7C3', '#E88A9C', '#C84B5E', '#FFF4E2', '#FFFBF2', '#F1D78A', '#E9A27E'].map((c) => new THREE.Color(c));
  sistem.kelopak = sistemPartikel(U, {
    jumlah: Math.round(240 * f), kotak: [26, 22, 34],
    atribut: (geo, n) => {
      const col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const c = paletKelopak[(rand() * paletKelopak.length) | 0]; col.set([c.r, c.g, c.b], i * 3); }
      geo.setAttribute('aWarna', new THREE.BufferAttribute(col, 3));
    },
    uniform: { uPeta: { value: teksturKelopak() } },
    vertex: /* glsl */`
      uniform float uWaktu, uSkala, uIntensitas, uGerak;
      attribute float aSeed; attribute vec3 aWarna;
      varying vec3 vWarna; varying float vRot, vBalik, vAlpha;
      void main(){
        vec3 p = position;
        float t = uWaktu * uGerak;
        p.y -= t * (0.5 + aSeed * 0.6);
        p.x += sin(t * (0.4 + aSeed * 0.3) + aSeed * 6.28) * 1.2 + t * 0.25;
        p.z += cos(t * 0.3 + aSeed * 12.0) * 0.8;
        float pudar; vec3 w = bungkus(p, pudar);
        vec4 mv = viewMatrix * vec4(w, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(0.2 * (0.6 + aSeed) * uSkala / max(-mv.z, 0.3), uSkala * 0.05);
        vWarna = aWarna;
        vRot = t * (0.5 + aSeed) + aSeed * 10.0;
        vBalik = 0.4 + 0.6 * abs(sin(t * (0.7 + aSeed) + aSeed * 4.0));
        vAlpha = pudar * uIntensitas * step(aSeed, uIntensitas * 1.2) * smoothstep(0.4, 1.5, -mv.z);
      }`,
    fragment: /* glsl */`
      uniform sampler2D uPeta;
      varying vec3 vWarna; varying float vRot, vBalik, vAlpha;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float c = cos(vRot), s = sin(vRot);
        uv = mat2(c, -s, s, c) * uv; uv.x /= vBalik; uv += 0.5;
        if (uv.x < 0.0 || uv.x > 1.0 || vAlpha < 0.01) discard;
        vec4 t = texture2D(uPeta, uv);
        float a = t.a * vAlpha;
        if (a < 0.02) discard;
        gl_FragColor = vec4(vWarna * t.rgb, a);
      }`
  });

  // Kilau emas berkelip
  sistem.kilau = sistemPartikel(U, {
    jumlah: Math.round(160 * f), kotak: [22, 16, 30], blending: THREE.AdditiveBlending,
    vertex: /* glsl */`
      uniform float uWaktu, uSkala, uIntensitas, uGerak;
      attribute float aSeed; varying float vA;
      void main(){
        vec3 p = position;
        float t = uWaktu * uGerak;
        p.y += t * 0.15; p.x += sin(t * 0.3 + aSeed * 20.0) * 0.5;
        float pudar; vec3 w = bungkus(p, pudar);
        vec4 mv = viewMatrix * vec4(w, 1.0);
        gl_Position = projectionMatrix * mv;
        float kelip = pow(abs(sin(uWaktu * (0.7 + aSeed * 1.8) + aSeed * 40.0)), 4.0);
        // ukuran dibatasi & partikel yang terlalu dekat kamera dipudarkan (agar tidak menutupi layar)
        gl_PointSize = min(0.14 * (0.5 + aSeed) * (0.6 + kelip) * uSkala / max(-mv.z, 0.3), uSkala * 0.03);
        vA = pudar * uIntensitas * (0.25 + kelip) * step(aSeed, uIntensitas * 1.2) * smoothstep(1.2, 3.0, -mv.z);
      }`,
    fragment: /* glsl */`
      varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d); a *= a * vA;
        if (a < 0.005) discard;
        gl_FragColor = vec4(vec3(1.0, 0.82, 0.48) * 1.6 * a, a);
      }`
  });

  // Kunang-kunang
  sistem.kunang = sistemPartikel(U, {
    jumlah: Math.round(130 * f), kotak: [24, 10, 30], maju: [0, -0.15, -0.35], blending: THREE.AdditiveBlending,
    vertex: /* glsl */`
      uniform float uWaktu, uSkala, uIntensitas, uGerak;
      attribute float aSeed; varying float vA;
      void main(){
        vec3 p = position;
        float t = uWaktu * uGerak * 0.6;
        p += vec3(sin(t + aSeed * 30.0), sin(t * 1.3 + aSeed * 11.0) * 0.6, cos(t * 0.8 + aSeed * 7.0)) * 1.4;
        float pudar; vec3 w = bungkus(p, pudar);
        vec4 mv = viewMatrix * vec4(w, 1.0);
        gl_Position = projectionMatrix * mv;
        float nyala = smoothstep(0.3, 1.0, sin(uWaktu * (0.8 + aSeed) + aSeed * 50.0));
        gl_PointSize = min(0.22 * uSkala / max(-mv.z, 0.3), uSkala * 0.03);
        vA = pudar * uIntensitas * nyala * step(aSeed, uIntensitas * 1.2) * smoothstep(1.2, 3.0, -mv.z);
      }`,
    fragment: /* glsl */`
      varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = (smoothstep(0.5, 0.0, d) * 0.5 + smoothstep(0.12, 0.0, d)) * vA;
        if (a < 0.005) discard;
        gl_FragColor = vec4(vec3(0.85, 1.0, 0.45) * 1.8 * a, a);
      }`
  });

  // Lampion terbang
  sistem.lampion = sistemPartikel(U, {
    jumlah: Math.round(90 * f), kotak: [40, 34, 60], maju: [0, 0.2, -0.4],
    uniform: { uPeta: { value: tLampion || teksturLampion() }, uAspek: { value: tLampion ? tLampion.image.width / tLampion.image.height : 0.8 } },
    vertex: /* glsl */`
      uniform float uWaktu, uSkala, uIntensitas, uGerak;
      attribute float aSeed; varying float vA, vKedip;
      void main(){
        vec3 p = position;
        float t = uWaktu * uGerak;
        p.y += t * (0.35 + aSeed * 0.35);
        p.x += sin(t * 0.25 + aSeed * 9.0) * 1.2;
        float pudar; vec3 w = bungkus(p, pudar);
        vec4 mv = viewMatrix * vec4(w, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min((0.9 + aSeed * 0.9) * uSkala / max(-mv.z, 0.5), uSkala * 0.045);
        vA = pudar * uIntensitas * step(aSeed, uIntensitas * 1.15) * smoothstep(1.5, 4.0, -mv.z);
        vKedip = 0.85 + 0.15 * sin(uWaktu * 6.0 + aSeed * 30.0);
      }`,
    fragment: /* glsl */`
      uniform sampler2D uPeta; uniform float uAspek; varying float vA, vKedip;
      void main(){
        if (vA < 0.01) discard;
        vec2 pc = gl_PointCoord;
        vec2 uv = vec2((pc.x - 0.5) / uAspek + 0.5, pc.y);
        float halo = smoothstep(0.5, 0.0, length(pc - vec2(0.5, 0.62))) * 0.35;
        vec4 t = (uv.x < 0.0 || uv.x > 1.0) ? vec4(0.0) : texture2D(uPeta, uv);
        float a = max(t.a, halo) * vA;
        if (a < 0.01) discard;
        vec3 c = mix(vec3(1.0, 0.62, 0.25) * 1.4, t.rgb * 1.35 * vKedip, t.a);
        gl_FragColor = vec4(c, a);
      }`
  });

  // Kembang api (meledak berulang di langit depan kamera)
  const LEDAKAN = 7;
  const perLedakan = Math.round(110 * f);
  sistem.kembangApi = sistemPartikel(U, {
    jumlah: LEDAKAN * perLedakan, kotak: [1, 1, 1], blending: THREE.AdditiveBlending,
    atribut: (geo, n) => {
      const arah = new Float32Array(n * 3);
      const ledak = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const u = rand() * 2 - 1, a = rand() * Math.PI * 2, r = Math.sqrt(1 - u * u);
        arah.set([r * Math.cos(a), u, r * Math.sin(a)], i * 3);
        ledak[i] = Math.floor(i / perLedakan);
      }
      geo.setAttribute('aArah', new THREE.BufferAttribute(arah, 3));
      geo.setAttribute('aLedak', new THREE.BufferAttribute(ledak, 1));
    },
    vertex: /* glsl */`
      uniform float uWaktu, uSkala, uIntensitas;
      attribute float aSeed, aLedak; attribute vec3 aArah;
      varying float vA; varying vec3 vWarna;
      vec3 rona(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
      void main(){
        float P = 3.4;
        float tt = uWaktu + aLedak * 0.53 * P;
        float siklus = floor(tt / P);
        float umur = mod(tt, P);
        float k = aLedak * 7.13 + siklus * 3.71;
        vec3 pusat = uKamera + vec3((hash11(k) - 0.5) * 34.0, 14.0 + hash11(k + 1.0) * 12.0, -48.0 - hash11(k + 2.0) * 26.0);
        float sebar = (1.0 - exp(-umur * 2.6)) * (6.0 + hash11(k + 3.0) * 4.0) * (0.75 + 0.25 * aSeed);
        vec3 w = pusat + aArah * sebar + vec3(0.0, -umur * umur * 0.9, 0.0);
        vec4 mv = viewMatrix * vec4(w, 1.0);
        gl_Position = projectionMatrix * mv;
        float hidup = smoothstep(0.0, 0.08, umur) * (1.0 - smoothstep(1.0, 2.6, umur));
        float kelip = 0.6 + 0.4 * sin(uWaktu * 30.0 + aSeed * 50.0);
        gl_PointSize = min(0.32 * uSkala / max(-mv.z, 1.0) * (1.0 - umur * 0.25), uSkala * 0.02);
        vA = hidup * kelip * uIntensitas;
        float rr = hash11(k + 4.0);
        vWarna = mix(vec3(1.0, 0.82, 0.45), rona(rr), 0.55 * step(0.35, rr));
      }`,
    fragment: /* glsl */`
      varying float vA; varying vec3 vWarna;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vA;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vWarna * 2.2 * a, a);
      }`
  });

  // Burung kuntul terbang (geometri instans dengan kepak sayap)
  const jumlahBurung = ponsel ? 9 : 14;
  const bg = new THREE.InstancedBufferGeometry();
  // tubuh + sayap kiri + sayap kanan; aSayap: 0 tubuh, ±1 ujung sayap
  const v = new Float32Array([
    0, 0, 0.35, 0, 0.02, -0.25, 0.06, 0, 0,
    0, 0.02, 0.05, -1, 0, -0.05, 0, 0.02, -0.15,
    0, 0.02, 0.05, 1, 0, -0.05, 0, 0.02, -0.15
  ]);
  const sayap = new Float32Array([0, 0, 0, 0, -1, 0, 0, 1, 0]);
  bg.setAttribute('position', new THREE.BufferAttribute(v, 3));
  bg.setAttribute('aSayap', new THREE.BufferAttribute(sayap, 1));
  const off = new Float32Array(jumlahBurung * 3);
  const bs = new Float32Array(jumlahBurung);
  for (let i = 0; i < jumlahBurung; i++) {
    off.set([(rand() - 0.5) * 9, (rand() - 0.5) * 3, (rand() - 0.5) * 6], i * 3);
    bs[i] = rand();
  }
  bg.setAttribute('aOffset', new THREE.InstancedBufferAttribute(off, 3));
  bg.setAttribute('aSeed', new THREE.InstancedBufferAttribute(bs, 1));
  bg.instanceCount = jumlahBurung;
  const burungMat = new THREE.ShaderMaterial({
    uniforms: { uWaktu: U.waktu, uKamera: U.kamera, uIntensitas: { value: 0 }, uWarna: { value: new THREE.Color('#FBF6EE') } },
    vertexShader: /* glsl */`
      uniform float uWaktu, uIntensitas; uniform vec3 uKamera;
      attribute float aSayap, aSeed; attribute vec3 aOffset;
      varying float vTerang;
      void main(){
        vec3 p = position * 0.55;
        float kepak = sin(uWaktu * (7.0 + aSeed * 3.0) + aSeed * 20.0);
        p.y += abs(aSayap) * kepak * 0.45;
        p.z += abs(aSayap) * 0.05;
        // kawanan melintas dari kiri ke kanan, lalu muncul lagi
        float jalur = mod(uWaktu * 2.2 + aSeed * 3.0, 90.0) - 45.0;
        vec3 pusat = uKamera + vec3(jalur, 7.0 + sin(uWaktu * 0.3) * 1.5, -34.0);
        mat3 putar = mat3(0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0); // menghadap arah terbang (+x)
        vec3 w = pusat + aOffset + putar * p;
        w.y += sin(uWaktu * 0.8 + aSeed * 10.0) * 0.4;
        gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
        vTerang = 0.75 + 0.25 * kepak;
        if (uIntensitas < 0.02) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uWarna; uniform float uIntensitas; varying float vTerang;
      void main(){ gl_FragColor = vec4(uWarna * vTerang, uIntensitas); }`,
    transparent: true, side: THREE.DoubleSide, depthWrite: false
  });
  sistem.burung = new THREE.Mesh(bg, burungMat);
  sistem.burung.frustumCulled = false;
  sistem.burung.renderOrder = 4;
  return sistem;
}

/* ===================== 6. TIRAI TRANSISI ===================== */
function buatTirai(U) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uKemajuan: { value: 0 }, uWarna: { value: new THREE.Color('#fff') }, uMode: { value: 0 }, uWaktu: U.waktu, uAspek: { value: 0.5 } },
    vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uKemajuan, uMode, uWaktu, uAspek; uniform vec3 uWarna;
      varying vec2 vUv;
      ${GLSL_NOISE}
      void main(){
        vec2 q = (vUv - 0.5) * vec2(uAspek, 1.0);
        float r = length(q) * 1.6;
        float a; vec3 c = uWarna;
        if (uMode < 0.5) {               // kabut / awan dari tepi
          float n = fbm3(vec3(q * 3.2, uWaktu * 0.08));
          float nilai = n * 0.75 + r * 0.55;
          float batas = 1.25 - uKemajuan * 1.55;
          a = smoothstep(batas - 0.14, batas + 0.14, nilai);
          c = mix(uWarna, vec3(1.0), n * 0.35);
        } else if (uMode < 1.5) {        // kilatan cahaya keemasan
          a = uKemajuan * (0.55 + 0.45 * smoothstep(1.1, 0.0, r * (1.4 - uKemajuan)));
          c = mix(uWarna, vec3(1.0, 0.98, 0.92), smoothstep(0.6, 0.0, r));
        } else {                          // gelap perlahan
          a = uKemajuan;
          c = uWarna * (1.0 - r * 0.25);
        }
        gl_FragColor = vec4(c, clamp(a, 0.0, 1.0));
      }`,
    transparent: true, depthTest: false, depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1000;
  return mesh;
}

/* ===================== 7. KELAS DUNIA ===================== */
const MODE_TIRAI = { kabut: 0, cahaya: 1, malam: 2 };
const KUNCI_SUASANA = ['langitAtas', 'cakrawala', 'bawah', 'warnaMatahari', 'kabut', 'warnaAwan'];
const ANGKA_SUASANA = ['besarMatahari', 'kepadatanKabut', 'awan', 'bintang', 'bloom'];
const JENIS_EFEK = ['kelopak', 'kilau', 'kunang', 'lampion', 'burung', 'kembangApi'];

function siapkanSuasana() {
  const hasil = {};
  for (const [nama, w] of Object.entries(WAKTU)) {
    const o = {};
    KUNCI_SUASANA.forEach((k) => { o[k] = new THREE.Color(w[k]); });
    ANGKA_SUASANA.forEach((k) => { o[k] = w[k]; });
    o.matahari = new THREE.Vector3(...w.matahari).normalize();
    hasil[nama] = o;
  }
  return hasil;
}

export class Dunia {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ onProgress?: (p:number)=>void, kurangiGerak?: boolean }} opsi
   */
  static async buat(canvas, opsi = {}) {
    const d = new Dunia(canvas, opsi);
    await d.muat();
    d.bangun();
    return d;
  }

  constructor(canvas, opsi) {
    this.canvas = canvas;
    this.opsi = opsi;
    this.ponsel = window.matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 600;
    this.suasana = siapkanSuasana();

    // Struktur bab: mulai & durasi dalam satuan gulir
    let mulai = 0;
    // Bab dengan "klip" mendapat ruang gulir tambahan sesudahnya untuk memutar video transisi
    this.bab = BAB.map((b, i) => { const o = { ...b, indeks: i, mulai }; mulai += b.durasi + panjangKlip(b); return o; });
    this.total = mulai;

    this.gulirTarget = 0;
    this.gulir = 0;
    this.waktu = 0;
    this.aktif = true;
    this.jalan = false;
    this.pendengar = new Set();
    this.penunjuk = { x: 0, y: 0, hx: 0, hy: 0 };
    this.kinerja = { jumlah: 0, total: 0, sejak: 0, langkah: 0 };

    this.U = {
      waktu: { value: 0 },
      kamera: { value: new THREE.Vector3() },
      skalaTitik: { value: 1 },
      gerak: { value: opsi.kurangiGerak ? 0.3 : 1 },
      langit: {
        uAtas: { value: new THREE.Color() }, uCakrawala: { value: new THREE.Color() }, uBawah: { value: new THREE.Color() },
        uArahMatahari: { value: new THREE.Vector3(0, 0.2, -1) }, uWarnaMatahari: { value: new THREE.Color() },
        uWarnaAwan: { value: new THREE.Color() }, uBesarMatahari: { value: 0.5 }, uAwan: { value: 0.5 },
        uBintang: { value: 0 }, uWaktu: null
      }
    };
    this.U.langit.uWaktu = this.U.waktu;
  }

  /* ---------- Memuat tekstur ---------- */
  async muat() {
    const manager = new THREE.LoadingManager();
    manager.onProgress = (_u, n, total) => this.opsi.onProgress && this.opsi.onProgress(n / total);
    const loader = new THREE.TextureLoader(manager);
    const muat1 = (url, warna = true) => loader.loadAsync(url).then((t) => {
      if (warna) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    });

    const dipakai = new Set(this.bab.map((b) => b.latar && b.latar.gambar).filter(Boolean));
    const latar = {};
    await Promise.all([...dipakai].map(async (nama) => {
      const cfg = LATAR[nama];
      const [map, depth] = await Promise.all([muat1(cfg.src), muat1(cfg.depth, false)]);
      latar[nama] = { map, depth };
    }));
    const potongan = {};
    await Promise.all(Object.entries(POTONGAN).map(async ([k, url]) => { potongan[k] = await muat1(url); }));
    const galeri = await Promise.all(GALERI.map((g) => muat1(g.thumb)));
    this.tex = { latar, potongan, galeri };
  }

  /* ---------- Membangun adegan ---------- */
  bangun() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.ponsel ? 1.75 : 2);
    this.dprMaks = dpr;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: !this.ponsel || dpr < 1.5, powerPreference: 'high-performance', alpha: false });
    this.renderer.setPixelRatio(dpr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.005);
    this.camera = new THREE.PerspectiveCamera(SUSUNAN.fov, 0.5, 0.1, 1200);
    this.scene.add(this.camera);

    this.langit = buatLangit(this.U);
    this.scene.add(this.langit);

    // Tekstur bersama
    const tAwan = teksturAwan();
    const tSinar = teksturSinar();
    const tBingkai = teksturBingkai();
    this.kabutSemua = [];
    this.sinarSemua = [];
    this.bingkaiFoto = [];

    // Bab
    this.bab.forEach((b, i) => {
      const grup = new THREE.Group();
      grup.position.z = -i * SUSUNAN.jarakBab;
      grup.visible = false;
      b.grup = grup;
      b.lapisanObj = [];

      if (b.latar) {
        b.latarObj = buatLatar(b.latar, this.tex.latar[b.latar.gambar], this.ponsel ? 150 : 200);
        grup.add(b.latarObj);
      }
      (b.lapisan || []).forEach((l) => {
        let obj;
        if (l.potongan) {
          obj = buatPotongan(l, this.tex.potongan[l.potongan]);
          if (l.uv && b.latarObj) {
            b.bacaDalam ||= bacaKedalaman(this.tex.latar[b.latar.gambar].depth);
            const { W, H } = b.latarObj.userData;
            const dz = b.bacaDalam(l.uv[0], l.uv[1]);
            l.pos = [(l.uv[0] - 0.5) * W, (0.5 - l.uv[1]) * H, b.latar.z + dz * dz * b.latar.kedalaman * 1.35 + (l.maju || 0)];
            l.relatif = true;
            obj.position.set(...l.pos);
          }
        }
        else if (l.jenis === 'kabut') { obj = buatKabut(l, tAwan); this.kabutSemua.push({ obj, l }); }
        else if (l.jenis === 'sinar') { obj = buatSinar(l, tSinar); this.sinarSemua.push({ obj, l }); }
        if (!obj) return;
        obj.userData.cfg = l;
        obj.userData.dasar = { x: l.pos[0], y: l.pos[1], z: l.pos[2], ry: 0, o: obj.material.opacity, s: 1 };
        grup.add(obj);
        b.lapisanObj.push(obj);
      });

      if (b.bingkaiGaleri) this.bangunGaleri(b, grup, tBingkai);
      this.scene.add(grup);
      b.kunci = this.siapkanKamera(b);
    });

    // Partikel
    this.partikel = buatSemuaPartikel(this.U, this.ponsel, this.tex.potongan.lampion);
    Object.values(this.partikel).forEach((p) => this.scene.add(p));

    // Tirai transisi (selalu di depan kamera)
    this.tirai = buatTirai(this.U);
    this.scene.add(this.tirai);

    // Pascaproses: bloom lembut
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.55, 0.78);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.pakaiBloom = true;
    this.renderPass = this.composer.passes[0];

    // Perlengkapan transisi tembus
    this.kameraLain = this.camera.clone();
    const rtOpsi = { type: THREE.HalfFloatType, depthBuffer: true };
    this.rtA = new THREE.WebGLRenderTarget(4, 4, rtOpsi);
    this.rtB = new THREE.WebGLRenderTarget(4, 4, rtOpsi);
    this.adeganCampur = new THREE.Scene();
    this.kameraCampur = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.matCampur = new THREE.ShaderMaterial({
      uniforms: { tA: { value: this.rtA.texture }, tB: { value: this.rtB.texture }, uM: { value: 0 }, uAspek: { value: 0.5 }, uWaktu: this.U.waktu },
      vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: /* glsl */`
        uniform sampler2D tA, tB; uniform float uM, uAspek, uWaktu;
        varying vec2 vUv;
        ${GLSL_NOISE}
        vec3 zoomBlur(sampler2D t, vec2 uv, float kuat){
          vec3 c = vec3(0.0); vec2 d = (uv - 0.5) * kuat;
          for (int i = 0; i < 8; i++){ c += texture2D(t, uv - d * float(i) / 8.0).rgb; }
          return c / 8.0;
        }
        void main(){
          float m = uM;
          vec2 q = (vUv - 0.5) * vec2(uAspek, 1.0);
          float r = length(q);
          float rMaks = length(vec2(uAspek, 1.0) * 0.5);
          // adegan lama: terus diperbesar & kabur gerak (kamera menembus)
          vec2 uvA = 0.5 + (vUv - 0.5) / (1.0 + m * 0.6);
          vec3 a = zoomBlur(tA, uvA, m * 0.18);
          // adegan baru: muncul dari tengah, sedikit diperkecil lalu kembali normal
          vec2 uvB = 0.5 + (vUv - 0.5) * (1.0 - (1.0 - m) * 0.25);
          vec3 b = zoomBlur(tB, uvB, (1.0 - m) * 0.12);
          // bukaan organik yang membesar dari titik jembatan (tengah layar)
          float n = fbm3(vec3(q * 4.0, uWaktu * 0.2));
          float R = smoothstep(0.0, 1.0, m) * (rMaks + 0.45) - 0.12;
          float buka = 1.0 - smoothstep(R - 0.2, R + 0.06, r + (n - 0.5) * 0.22);
          vec3 c = mix(a, b, buka);
          // pinggiran bukaan bercahaya hangat (tipis, tidak menyilaukan)
          float tepi = exp(-pow((r + (n - 0.5) * 0.22 - R) * 9.0, 2.0)) * sin(m * 3.14159) * 0.22;
          c += vec3(1.0, 0.78, 0.45) * tepi;
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
      depthTest: false, depthWrite: false
    });
    const kuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.matCampur);
    kuad.frustumCulled = false;
    this.adeganCampur.add(kuad);

    this.ukur = this.ukur.bind(this);
    new ResizeObserver(this.ukur).observe(this.canvas);
    this.ukur();

    if (!this.opsi.kurangiGerak && window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', (e) => {
        const r = this.canvas.getBoundingClientRect();
        this.penunjuk.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        this.penunjuk.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      }, { passive: true });
    }
    document.addEventListener('visibilitychange', () => this.perbaruiJalan());
    this.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.berhenti(); });

    this.loop = this.loop.bind(this);
    this.terapkan(0, 0);
    this.siapkanGPU();
    this.perbaruiJalan();
  }

  // Kompilasi semua shader & unggah semua tekstur ke GPU saat layar loading,
  // agar tidak tersendat ketika sebuah bab tampil untuk pertama kali.
  siapkanGPU() {
    const tersembunyi = [];
    this.scene.traverse((o) => { if (!o.visible) { tersembunyi.push(o); o.visible = true; } });
    this.renderer.compile(this.scene, this.camera);
    this.renderer.compile(this.adeganCampur, this.kameraCampur);
    tersembunyi.forEach((o) => { o.visible = false; });
    const t = this.tex;
    [...Object.values(t.latar).flatMap((x) => [x.map, x.depth]), ...Object.values(t.potongan), ...t.galeri]
      .forEach((x) => { if (x && x.isTexture) this.renderer.initTexture(x); });
    this.bab.forEach((x) => { x.grup.visible = x === this.posisi.b; });
  }

  bangunGaleri(b, grup, tBingkai) {
    const cfg = b.bingkaiGaleri;
    const pakaiAir = cfg.air !== false;
    if (pakaiAir) grup.add(buatAir(this.U, -2.3));
    b.kamera = [];
    const n = GALERI.length;
    const sebelum = this.bab[b.indeks - 1];
    // beri ruang untuk kamera masuk/keluar lorong bila bab ini bersambung dengan klip video
    const tAwal = sebelum && sebelum.klip ? 0.2 : 0.1;
    const tAkhir = b.klip ? 0.82 : 0.88;
    GALERI.forEach((g, i) => {
      const sisi = i % 2 === 0 ? -1 : 1;
      const z = cfg.mulaiZ - i * cfg.jarak;
      const x = sisi * 0.95;
      const lebar = cfg.lebar;
      const tinggi = lebar * (g.h / g.w);
      const holder = new THREE.Group();
      holder.position.set(x, 0.35, z);
      holder.rotation.y = -sisi * 0.32;
      const foto = new THREE.Mesh(new THREE.PlaneGeometry(lebar, tinggi), new THREE.MeshBasicMaterial({ map: this.tex.galeri[i], fog: true, transparent: true }));
      const bingkai = new THREE.Mesh(new THREE.PlaneGeometry(lebar * 1.13, tinggi * 1.2), new THREE.MeshBasicMaterial({ map: tBingkai, transparent: true, fog: true, color: new THREE.Color(1.15, 1.1, 1.05) }));
      bingkai.position.z = 0.01;
      const pantul = new THREE.Mesh(new THREE.PlaneGeometry(lebar * 1.13, tinggi * 1.2), new THREE.MeshBasicMaterial({ map: this.tex.galeri[i], transparent: true, opacity: 0.18, fog: true }));
      pantul.scale.y = -1;
      pantul.position.y = -(2.3 + 0.35) * 2 + 0.0;
      holder.add(foto, bingkai);
      if (pakaiAir) holder.add(pantul);
      foto.userData.indeksGaleri = i;
      bingkai.userData.indeksGaleri = i;
      this.bingkaiFoto.push(foto, bingkai);
      grup.add(holder);
      (b.fotoGaleri ||= []).push(holder);
      // Kamera berhenti sejenak di depan tiap foto
      const t = tAwal + (i / Math.max(n - 1, 1)) * (tAkhir - tAwal);
      b.kamera.push({ t, pos: [x * 0.35, 0.4, z + 6.2], lihat: [x * 1.05, 0.3, z - 1] });
    });
    // Batas dengan klip video: kamera memperlihatkan lorong tanpa foto di depan agar sama dengan frame klip
    const zAkhir = cfg.mulaiZ - (n - 1) * cfg.jarak;
    // Titik pandang dibuat dekat (bukan di ujung lorong) agar interpolasi ke titik pandang foto tidak membuat
    // kamera berbelok tajam ke samping (dulu sempat memperlihatkan langit oranye di awal galeri).
    if (sebelum && sebelum.klip) b.kamera.unshift({ t: 0, pos: [0, 0, 45], lihat: [0, 0.1, cfg.mulaiZ - 1] });
    if (b.klip) {
      // keluar lewat sisi yang berlawanan dengan foto terakhir agar kamera tidak menembus bingkainya
      const sisiAkhir = (n - 1) % 2 === 0 ? -1 : 1;
      b.kamera.push({ t: 1, pos: [-sisiAkhir * 0.5, 0.3, zAkhir - 5], lihat: [0, 0.2, zAkhir - 16] });
    }
    // lampion statis yang mengapung di atas air
    const tLamp = this.tex.potongan.lampion || teksturLampion();
    for (let i = 0; i < 26; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tLamp, color: new THREE.Color(1.5, 1.35, 1.15), fog: true, depthWrite: false }));
      const z = cfg.mulaiZ + 6 - rand() * (n * cfg.jarak + 12);
      const sisiL = rand() < 0.5 ? -1 : 1; // jauhkan dari jalur kamera di tengah
      s.position.set(pakaiAir ? (rand() - 0.5) * 9 : sisiL * (2.2 + rand() * 2.6), pakaiAir ? -2.0 + rand() * 0.1 : 2.4 + rand() * 2.6, z);
      s.scale.set(0.3, 0.48, 1);
      s.userData.ayun = rand() * 10;
      grup.add(s);
      (b.lampionAir ||= []).push(s);
    }
  }

  /* ---------- Kamera ---------- */
  siapkanKamera(b) {
    const latar = b.latarObj;
    // Layar lebar: kamera dimajukan agar gambar latar tetap memenuhi lebar layar
    const tanSetengah = Math.tan(THREE.MathUtils.degToRad(SUSUNAN.fov) / 2);
    return (b.kamera || []).map((k) => {
      // Fokus ke tokoh: jarak dihitung agar tokoh mengisi bagian layar (isi = 0..1 tinggi layar)
      if (k.fokus !== undefined && b.lapisan[k.fokus] && b.lapisan[k.fokus].pos) {
        const l = b.lapisan[k.fokus];
        const h = l.tinggi;
        const jarak = h / ((k.isi || 0.6) * 2 * tanSetengah);
        const g = k.geser || [0, 0];
        const cx = l.pos[0];
        const cy = l.pos[1] + h / 2 + h * (k.naik || 0) + (k.dy || 0);
        const cz = l.pos[2] + (k.dz || 0);
        return { t: k.t, kabur: k.kabur || 0, pos: new THREE.Vector3(cx + g[0], cy + g[1], cz + jarak), lihat: new THREE.Vector3(cx, cy, cz) };
      }
      if (k.uv && latar) {
        const { W, H } = latar.userData;
        const jarakMaks = (W * 0.9) / (2 * tanSetengah * Math.max(this.camera.aspect, 0.3));
        const jarak = Math.min(k.jarak, jarakMaks);
        const x = (k.uv[0] - 0.5) * W;
        const y = (0.5 - k.uv[1]) * H;
        const zL = b.latar.z + b.latar.kedalaman * 0.35;
        const g = k.geser || [0, 0];
        return { t: k.t, kabur: k.kabur || 0, pos: new THREE.Vector3(x + g[0], y + g[1], zL + jarak), lihat: new THREE.Vector3(x, y, zL) };
      }
      return { t: k.t, kabur: k.kabur || 0, pos: new THREE.Vector3(...k.pos), lihat: new THREE.Vector3(...k.lihat) };
    });
  }

  // Interpolasi Catmull-Rom antar titik kunci (gerak mulus tanpa berhenti mendadak)
  posisiKamera(b, t, outPos, outLihat) {
    const K = b.kunci;
    const n = K.length;
    const cr = (p0, p1, p2, p3, u, out) => {
      const u2 = u * u, u3 = u2 * u;
      out.set(0, 0, 0)
        .addScaledVector(p0, -0.5 * u3 + u2 - 0.5 * u)
        .addScaledVector(p1, 1.5 * u3 - 2.5 * u2 + 1)
        .addScaledVector(p2, -1.5 * u3 + 2 * u2 + 0.5 * u)
        .addScaledVector(p3, 0.5 * u3 - 0.5 * u2);
    };
    // nilai kabur latar: interpolasi halus antar titik kunci
    let j = 0;
    while (j < n - 1 && t > K[j + 1].t) j++;
    const kb = j >= n - 1 ? K[n - 1].kabur : (t <= K[0].t ? K[0].kabur : K[j].kabur + (K[j + 1].kabur - K[j].kabur) * smooth(0, 1, (t - K[j].t) / (K[j + 1].t - K[j].t)));
    this._kabur = kb || 0;
    const ke = b.transisi && b.transisi.ke;
    if (ke && !b.klip && t > K[n - 1].t && (b.latarObj || Array.isArray(ke[0]))) {
      // Terbang masuk ke titik jembatan (pintu/jendela/jalan) lalu menembusnya
      b._titikKe ||= Array.isArray(ke[0]) ? new THREE.Vector3(...ke[0]) : this.titikUV(b, ke);
      const akhir = K[n - 1];
      const tEnd = 1 + SUSUNAN.lebarTransisi / b.durasi;
      const e = smooth(K[n - 1].t, tEnd, t);
      const e2 = e * e;
      outLihat.copy(akhir.lihat).lerp(b._titikKe, Math.min(1, e * 1.6));
      this._tmp.copy(akhir.pos).sub(b._titikKe).normalize().multiplyScalar(1.5);
      outPos.copy(akhir.pos).lerp(this._tmp.add(b._titikKe), e2 * 0.97);
      return;
    }
    if (n === 1 || t <= K[0].t || t >= K[n - 1].t) {
      const k = t <= K[0].t ? K[0] : K[n - 1];
      outPos.copy(k.pos); outLihat.copy(k.lihat);
      // di luar kunci: kamera terus melaju pelan ke arah pandang (terasa menembus kabut transisi)
      const lebih = t <= K[0].t ? t - K[0].t : t - K[n - 1].t;
      const arah = this._tmp.copy(k.lihat).sub(k.pos).normalize();
      outPos.addScaledVector(arah, lebih * b.durasi * 7);
      outLihat.addScaledVector(arah, lebih * b.durasi * 7);
      return;
    }
    let i = 0;
    while (i < n - 2 && t > K[i + 1].t) i++;
    const u = (t - K[i].t) / (K[i + 1].t - K[i].t);
    const b1 = K[i], c = K[i + 1];
    let a = K[Math.max(i - 1, 0)], d = K[Math.min(i + 2, n - 1)];
    // Di batas dengan klip video, kamera melambat sampai diam (bukan berhenti mendadak),
    // agar gerak 3D menyambung lembut dengan awal/akhir video.
    if (i === 0 && b.indeks > 0 && this.bab[b.indeks - 1].klip) a = c;
    if (i + 1 === n - 1 && b.klip) d = b1;
    cr(a.pos, b1.pos, c.pos, d.pos, u, outPos);
    cr(a.lihat, b1.lihat, c.lihat, d.lihat, u, outLihat);
  }

  /* ---------- Ukuran layar ---------- */
  ukur() {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    if (w === this._w && Math.abs(h - this._h) < 2) return;
    this._w = w; this._h = h;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    const pr = this.renderer.getPixelRatio();
    this.rtA.setSize(Math.round(w * pr), Math.round(h * pr));
    this.rtB.setSize(Math.round(w * pr), Math.round(h * pr));
    this.kameraLain.aspect = w / h;
    this.kameraLain.updateProjectionMatrix();
    this.matCampur.uniforms.uAspek.value = w / h;
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.bloom.resolution.set(w * 0.5, h * 0.5);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.tirai.material.uniforms.uAspek.value = w / h;
    this.bab.forEach((b) => { if (b.latarObj && !b.bingkaiGaleri) b.kunci = this.siapkanKamera(b); });
    const tanSetengah = Math.tan(THREE.MathUtils.degToRad(SUSUNAN.fov) / 2);
    this.U.skalaTitik.value = (h * this.renderer.getPixelRatio()) / (2 * tanSetengah);
    if (!this.jalan) this.render();
  }

  /* ---------- Pencampuran suasana antar bab ---------- */
  hitungPosisi(s) {
    const B = this.bab;
    let i = B.length - 1;
    for (let k = 0; k < B.length; k++) { if (s < B[k].mulai + B[k].durasi + panjangKlip(B[k])) { i = k; break; } }
    let b = B[i];
    // Di ruang klip: video transisi menutupi layar. Paruh pertama bab lama tetap aktif, paruh kedua bab baru.
    const akhirBab = b.mulai + b.durasi;
    if (b.klip && i < B.length - 1 && s >= akhirBab) {
      const k = clamp((s - akhirBab) / b.klip.panjang, 0, 1);
      const nx = B[i + 1];
      const dulu = k < 0.5;
      return {
        i: dulu ? i : i + 1, b: dulu ? b : nx, t: dulu ? 1 : 0,
        lain: dulu ? nx : b, tLain: dulu ? 0 : 1, campur: dulu ? k : 1 - k,
        tirai: 0, jenis: null, klip: { bab: b, k }
      };
    }
    const t = clamp((s - b.mulai) / b.durasi, 0, 1.2);
    const w = SUSUNAN.lebarTransisi;
    let lain = null, campur = 0, tirai = 0, jenis = null;
    const keAkhir = b.mulai + b.durasi - s;
    const dariAwal = s - b.mulai;
    if (i < B.length - 1 && keAkhir < w && b.transisi && !b.klip) {
      const k = 1 - keAkhir / w;
      lain = B[i + 1]; campur = 0.5 * k; tirai = smooth(0, 1, k); jenis = b.transisi;
    } else if (i > 0 && dariAwal < w && B[i - 1].transisi && !B[i - 1].klip) {
      const k = 1 - dariAwal / w;
      lain = B[i - 1]; campur = 0.5 * k; tirai = smooth(0, 1, k); jenis = B[i - 1].transisi;
    }
    const tLain = lain ? (s - lain.mulai) / lain.durasi : 0;
    return { i, b, t, lain, campur, tirai, jenis, tLain };
  }

  // Titik (u,v) pada gambar latar -> koordinat lokal bab (mengikuti peta kedalaman)
  titikUV(b, uv) {
    const { W, H } = b.latarObj.userData;
    b.bacaDalam ||= bacaKedalaman(this.tex.latar[b.latar.gambar].depth);
    const dz = b.bacaDalam(uv[0], uv[1]);
    return new THREE.Vector3((uv[0] - 0.5) * W, (0.5 - uv[1]) * H, b.latar.z + dz * dz * b.latar.kedalaman * 1.35);
  }

  terapkan(s, dt) {
    const P = this.hitungPosisi(s);
    this.posisi = P;
    const { b, t } = P;

    // Hanya bab aktif yang dirender
    this.bab.forEach((x) => { x.grup.visible = x === b; });

    // Suasana waktu
    const A = this.suasana[b.waktu];
    const Bw = P.lain ? this.suasana[P.lain.waktu] : A;
    const c = P.campur;
    const L = this.U.langit;
    L.uAtas.value.copy(A.langitAtas).lerp(Bw.langitAtas, c);
    L.uCakrawala.value.copy(A.cakrawala).lerp(Bw.cakrawala, c);
    L.uBawah.value.copy(A.bawah).lerp(Bw.bawah, c);
    L.uWarnaMatahari.value.copy(A.warnaMatahari).lerp(Bw.warnaMatahari, c);
    L.uWarnaAwan.value.copy(A.warnaAwan).lerp(Bw.warnaAwan, c);
    L.uArahMatahari.value.copy(A.matahari).lerp(Bw.matahari, c).normalize();
    L.uBesarMatahari.value = lerp(A.besarMatahari, Bw.besarMatahari, c);
    L.uAwan.value = lerp(A.awan, Bw.awan, c);
    L.uBintang.value = lerp(A.bintang, Bw.bintang, c);
    this.scene.fog.color.copy(A.kabut).lerp(Bw.kabut, c);
    this.scene.fog.density = lerp(A.kepadatanKabut, Bw.kepadatanKabut, c);
    this.bloom.strength = lerp(A.bloom, Bw.bloom, c);

    // Efek partikel
    JENIS_EFEK.forEach((e) => {
      const v = lerp((b.efek || {})[e] || 0, P.lain ? ((P.lain.efek || {})[e] || 0) : ((b.efek || {})[e] || 0), c);
      const sis = this.partikel[e];
      sis.material.uniforms.uIntensitas.value = damp(sis.material.uniforms.uIntensitas.value, v, 3, dt || 1);
      sis.visible = sis.material.uniforms.uIntensitas.value > 0.01;
    });
    this.partikel.burung.material.uniforms.uWarna.value.copy(this.scene.fog.color).lerp(new THREE.Color('#FFFFFF'), 0.7);

    // Lapisan bab aktif
    b.lapisanObj.forEach((o) => this.gerakkanLapisan(o, t));
    // Tokoh & objek diberi rona cahaya suasana (matahari + kabut) agar menyatu dengan latar
    this._rona ||= new THREE.Color();
    this._rona.copy(L.uWarnaMatahari.value).lerp(this.scene.fog.color, 0.5);
    b.lapisanObj.forEach((o) => {
      if (!o.userData.cfg.potongan) return;
      const k = o.userData.cfg.rona ?? 0.22;
      const tr = o.userData.terang;
      o.material.color.setRGB(tr, tr, tr).lerp(this._rona.clone().multiplyScalar(tr * 1.05), k);
    });
    this.kabutSemua.forEach(({ obj, l }) => {
      if (!obj.parent.visible) return;
      obj.material.color.copy(this.scene.fog.color).lerp(L.uWarnaAwan.value, 0.5);
      obj.position.x = l.pos[0] + Math.sin(this.waktu * 0.05 * (l.gerakAngin || 0.3)) * 3 * (l.gerakAngin || 0.3) * 3;
      obj.quaternion.copy(this.camera.quaternion);
    });
    this.sinarSemua.forEach(({ obj, l }) => {
      if (!obj.parent.visible) return;
      obj.material.color.copy(L.uWarnaMatahari.value);
      obj.material.opacity = l.kekuatan * (0.8 + 0.2 * Math.sin(this.waktu * 0.6));
    });
    // Foto galeri memudar saat kamera lewat sangat dekat / sudah melewatinya (tepi bingkai tidak menyapu layar)
    if (b.fotoGaleri) {
      this._pf ||= new THREE.Vector3();
      b.fotoGaleri.forEach((h) => {
        h.getWorldPosition(this._pf);
        const depan = this.camera.position.z - this._pf.z; // > 0: foto masih di depan kamera
        const k = smooth(0.6, 3.2, depan);
        h.visible = k > 0.01;
        h.children.forEach((m) => { m.material.opacity = (m.userData.opasitasDasar ??= m.material.opacity) * k; });
      });
    }
    if (b.lampionAir) b.lampionAir.forEach((s2) => { s2.userData.y0 ??= s2.position.y; s2.position.y = s2.userData.y0 + Math.sin(this.waktu * 1.2 + s2.userData.ayun) * 0.06; });

    // Kamera
    const pn = this.penunjuk;
    pn.hx = damp(pn.hx, pn.x, 2.5, dt || 1);
    pn.hy = damp(pn.hy, pn.y, 2.5, dt || 1);
    this.kameraUntuk(b, t, this.camera);
    this.langit.position.copy(this.camera.position);
    this.U.kamera.value.copy(this.camera.position);

    // Transisi tembus: bab tetangga ikut disiapkan & dirender ke tekstur terpisah
    this.tembus = null;
    if (P.lain && P.jenis && P.jenis.jenis === 'tembus') {
      const lain = P.lain;
      lain.lapisanObj.forEach((o) => this.gerakkanLapisan(o, clamp(P.tLain, 0, 1)));
      this.kameraUntuk(lain, P.tLain, this.kameraLain);
      const lainSesudah = lain.indeks > b.indeks;
      this.tembus = {
        awal: lainSesudah ? b : lain, akhir: lainSesudah ? lain : b,
        kamAwal: lainSesudah ? this.camera : this.kameraLain, kamAkhir: lainSesudah ? this.kameraLain : this.camera,
        m: lainSesudah ? P.campur : 1 - P.campur
      };
    }
    // Ruang klip: bila video belum siap, adegan dicampur pelan sebagai cadangan.
    // Bila video siap, cukup render satu adegan di bawahnya (hemat GPU).
    if (P.klip && P.lain && !P.klip.bab._klipSiap) {
      const lain = P.lain;
      lain.lapisanObj.forEach((o) => this.gerakkanLapisan(o, P.tLain));
      this.kameraUntuk(lain, P.tLain, this.kameraLain);
      const sesudah = lain.indeks > b.indeks;
      this.tembus = {
        awal: sesudah ? b : lain, akhir: sesudah ? lain : b,
        kamAwal: sesudah ? this.camera : this.kameraLain, kamAkhir: sesudah ? this.kameraLain : this.camera,
        m: smooth(0.2, 0.8, P.klip.k)
      };
    }

    // Tirai
    const tm = this.tirai.material.uniforms;
    tm.uKemajuan.value = P.tirai;
    if (P.jenis) { tm.uMode.value = MODE_TIRAI[P.jenis.jenis] ?? 0; tm.uWarna.value.set(P.jenis.warna); }
    this.tirai.visible = P.tirai > 0.001 && !!P.jenis && P.jenis.jenis in MODE_TIRAI;
  }

  kameraUntuk(b, t, cam) {
    this._tmp ||= new THREE.Vector3();
    const pos = (this._kp ||= new THREE.Vector3());
    const lihat = (this._kl ||= new THREE.Vector3());
    this.posisiKamera(b, t, pos, lihat);
    if (b.latarObj) b.latarObj.material.uniforms.uKabur.value = this._kabur;
    const pn = this.penunjuk;
    const napas = this.opsi.kurangiGerak ? 0 : 1;
    pos.x += pn.hx * 0.6 + Math.sin(this.waktu * 0.35) * 0.12 * napas;
    pos.y += -pn.hy * 0.35 + Math.sin(this.waktu * 0.5) * 0.08 * napas;
    pos.z += b.grup.position.z;
    lihat.z += b.grup.position.z;
    cam.position.copy(pos);
    cam.lookAt(lihat);
    cam.rotateZ(Math.sin(this.waktu * 0.27) * 0.006 * napas);
  }

  gerakkanLapisan(o, t) {
    const cfg = o.userData.cfg;
    const st = { ...o.userData.dasar };
    const dasar = o.userData.dasar;
    const abs = (obj) => {
      if (!obj || !cfg.relatif) return obj || {};
      const out = { ...obj };
      ['x', 'y', 'z'].forEach((k) => { if (k in out) out[k] += dasar[k]; });
      return out;
    };
    (cfg.gerak || []).forEach((g) => {
      const dari = { ...st, ...abs(g.dari) };
      const ke = { ...dari, ...abs(g.ke) };
      const k = smooth(g.t[0], g.t[1], t);
      for (const key of Object.keys(st)) st[key] = lerp(dari[key], ke[key], k);
    });
    o.position.set(st.x, st.y, st.z);
    o.rotation.y = st.ry;
    o.scale.setScalar(st.s);
    o.material.opacity = st.o;
    o.visible = st.o > 0.01;
  }

  /* ---------- Loop ---------- */
  loop(ms) {
    const dt = Math.min((ms - (this._ms || ms)) / 1000, 0.1);
    this._ms = ms;
    this.waktu += dt;
    this.U.waktu.value = this.waktu;
    const g0 = this.gulir;
    let g;
    if (this.opsi.kurangiGerak || !dt) {
      g = damp(g0, this.gulirTarget, 12, dt);
    } else {
      // Cerita bergerak seperti kamera ber-gimbal: laju naik-turun halus tanpa sentakan (redaman kritis),
      // dibatasi per posisi agar gulir cepat tidak melompati animasi (lihat kecepatanMaks).
      const vMaks = this.kecepatanMaks(g0);
      const ingin = clamp((this.gulirTarget - g0) * 5.5, -vMaks, vMaks);
      this._laju = damp(this._laju || 0, ingin, 22, dt);
      g = g0 + this._laju * dt;
      if ((this.gulirTarget - g0) * (this.gulirTarget - g) <= 0) { g = this.gulirTarget; this._laju = 0; }
    }
    this.gulir = g;
    if (Math.abs(this.gulir - this.gulirTarget) < 0.0004) { this.gulir = this.gulirTarget; this._laju = 0; }
    this.terapkan(this.gulir, dt);
    this.render();
    this.pendengar.forEach((fn) => fn(this.gulir, this.posisi));
    this.pantauKinerja(dt);
  }

  render() {
    // Video transisi menutupi layar sepenuhnya: tidak perlu merender 3D (GPU bebas untuk memutar video)
    if (this.tertutupKlip) return;
    const T = this.tembus;
    if (T && T.m > 0.001 && T.m < 0.999) {
      const r = this.renderer;
      const satu = (bab, kam, rt) => {
        this.bab.forEach((x) => { x.grup.visible = x === bab; });
        this.langit.position.copy(kam.position);
        this.U.kamera.value.copy(kam.position);
        r.setRenderTarget(rt);
        r.render(this.scene, kam);
      };
      satu(T.awal, T.kamAwal, this.rtA);
      satu(T.akhir, T.kamAkhir, this.rtB);
      r.setRenderTarget(null);
      this.matCampur.uniforms.uM.value = T.m;
      if (this.pakaiBloom) {
        this.renderPass.scene = this.adeganCampur; this.renderPass.camera = this.kameraCampur;
        this.composer.render();
        this.renderPass.scene = this.scene; this.renderPass.camera = this.camera;
      } else r.render(this.adeganCampur, this.kameraCampur);
      this.bab.forEach((x) => { x.grup.visible = x === this.posisi.b; });
      return;
    }
    if (this.pakaiBloom) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  // Turunkan resolusi / matikan bloom bila perangkat kewalahan
  pantauKinerja(dt) {
    const k = this.kinerja;
    k.sejak += dt;
    if (k.sejak < 1.5) return; // abaikan detik-detik awal
    k.jumlah++; k.total += dt;
    if (k.total < 2) return;
    const fps = k.jumlah / k.total;
    k.jumlah = 0; k.total = 0;
    if (fps < 42 && k.langkah < 4) {
      k.langkah++;
      const dpr = this.renderer.getPixelRatio();
      if (dpr > 1.05) this.renderer.setPixelRatio(Math.max(1, dpr - 0.35));
      else if (this.pakaiBloom) this.pakaiBloom = false;
      this._w = 0; this.ukur();
    }
  }

  perbaruiJalan() {
    const harus = this.aktif && !document.hidden;
    if (harus && !this.jalan) { this.jalan = true; this._ms = 0; this.renderer.setAnimationLoop(this.loop); }
    else if (!harus && this.jalan) this.berhenti();
  }

  berhenti() { this.jalan = false; this.renderer.setAnimationLoop(null); }

  // Laju gulir maksimum (satuan gulir per detik) di posisi s.
  // Di ruang klip: maks ±2,5× kecepatan putar asli video, agar video bisa diputar (bukan di-seek) dan tetap mulus.
  // Batas laju turun/naik bertahap selebar SUSUNAN.lunakBatas sebelum & sesudah ruang klip,
  // sehingga cerita melambat perlahan menjelang video (tidak "mengerem" mendadak di akhir adegan).
  kecepatanMaks(s) {
    const vBiasa = SUSUNAN.kecepatanMaks || 1.8;
    const lebar = SUSUNAN.lunakBatas || 0.7;
    let v = vBiasa;
    for (const b of this.bab) {
      if (!b.klip) continue;
      const a = b.mulai + b.durasi, z = a + b.klip.panjang;
      if (s < a - lebar || s > z + lebar) continue;
      const vKlip = (b.klip.panjang / (b.klip.detik || 8)) * (SUSUNAN.kecepatanKlip || 2.5);
      const w = smooth(a - lebar, a, s) * (1 - smooth(z, z + lebar, s));
      v = Math.min(v, lerp(vBiasa, vKlip, w));
    }
    return Math.max(v, 0.05);
  }

  /* ---------- API publik ---------- */
  setGulir(s, langsung = false) { this.gulirTarget = clamp(s, 0, this.total); if (langsung) { this.gulir = this.gulirTarget; this._laju = 0; } }
  padaFrame(fn) { this.pendengar.add(fn); }
  mulaiBab(id) { const b = this.bab.find((x) => x.id === id); return b ? b.mulai : 0; }

  // Mengembalikan indeks foto galeri yang diketuk (atau -1)
  ketuk(clientX, clientY) {
    if (!this.posisi || !this.posisi.b.bingkaiGaleri) return -1;
    const r = this.canvas.getBoundingClientRect();
    const p = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(p, this.camera);
    const hit = ray.intersectObjects(this.bingkaiFoto, false)[0];
    return hit ? hit.object.userData.indeksGaleri : -1;
  }
}
