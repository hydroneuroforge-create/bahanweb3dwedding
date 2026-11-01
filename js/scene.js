/* =========================================================================
   SCENE 3D HERO — Three.js
   -------------------------------------------------------------------------
   Isi scene (urut dari belakang ke depan):
     1. Backdrop  : plane besar bertekstur palace_bg (latar istana)
     2. Lantai    : ShadowMaterial transparan untuk menerima bayangan gapura
     3. Gapura    : dua plane bertekstur transparan (kiri & kanan) yang
                    memberi kedalaman & "terbuka" saat undangan dibuka
     4. Kelopak   : Points (shader) kelopak mawar & melati melayang
     5. Kilau     : Points emas additive yang berkelip

   Kamera: tidak memakai OrbitControls. Posisi dikendalikan oleh
     - parallax mouse (sangat halus)
     - progres "buka undangan" (kamera maju melewati gapura)
     - progres scroll hero (diberikan dari main.js via GSAP ScrollTrigger)

   File ini adalah script klasik; Three.js dimuat dengan dynamic import()
   dari CDN agar tidak perlu build step. API publik: window.KratonScene.
   ========================================================================= */
(() => {
  'use strict';

  // Versi Three.js dikunci agar hasil konsisten. Ubah hanya setelah diuji.
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.min.js';

  // Pengaturan visual — ubah angka di sini untuk menyetel suasana
  const SETTINGS = {
    fov: 50,
    cameraZ: 10,
    backdropZ: -20,
    gateZ: -2,
    fogColor: 0xF3DDBE,     // krem hangat
    fogDensity: 0.011,
    ambient: { color: 0xFFE4B5, intensity: 0.6 },
    sun: { color: 0xFFD27A, intensity: 1.2, position: [-10, 12, 8] }, // golden hour dari kiri atas
    gateEmissive: 0.62,      // kecerahan dasar gapura agar warna foto tetap hidup
    petals: { desktop: 260, mobile: 160, size: 0.22 },
    sparkles: { desktop: 120, mobile: 70, size: 0.12 },
    parallax: { x: 0.45, y: 0.25 },
    openDuration: 2.4        // detik
  };

  /* ---------------- Shader kelopak ---------------- */
  const PETAL_VERTEX = /* glsl */`
    uniform float uTime;
    uniform float uScale;      // konversi ukuran dunia -> piksel
    uniform float uSize;
    uniform float uHeight;     // tinggi area jatuh
    uniform float uSpeed;
    attribute float aSeed;
    attribute float aScale;
    attribute vec3 aColor;
    varying vec3 vColor;
    varying float vRot;
    varying float vFlip;
    varying float vAlpha;

    void main() {
      vec3 p = position;
      float speed = (0.25 + aSeed * 0.35) * uSpeed;
      // Jatuh perlahan lalu kembali ke atas (loop tanpa batas)
      float y = mod(p.y - uTime * speed + uHeight * 0.5, uHeight) - uHeight * 0.5;
      p.y = y;
      // Gerakan sinusoidal seperti tertiup angin
      float t = uTime * (0.35 + aSeed * 0.3) * uSpeed;
      p.x += sin(t + aSeed * 6.2831) * 0.9;
      p.z += cos(t * 0.8 + aSeed * 12.0) * 0.6;

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * aScale * uScale / max(-mv.z, 0.5);

      vColor = aColor;
      vRot = uTime * (0.4 + aSeed * 0.8) * uSpeed + aSeed * 10.0;
      vFlip = 0.45 + 0.55 * abs(sin(uTime * (0.6 + aSeed) * uSpeed + aSeed * 4.0));
      // Pudar di tepi atas & bawah agar loop tidak terlihat
      vAlpha = 1.0 - smoothstep(0.75, 1.0, abs(y) / (uHeight * 0.5));
    }
  `;

  const PETAL_FRAGMENT = /* glsl */`
    uniform sampler2D uMap;
    uniform float uOpacity;
    varying vec3 vColor;
    varying float vRot;
    varying float vFlip;
    varying float vAlpha;

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float c = cos(vRot), s = sin(vRot);
      uv = mat2(c, -s, s, c) * uv;
      uv.x /= vFlip;              // simulasi kelopak berputar 3D
      uv += 0.5;
      if (uv.x < 0.0 || uv.x > 1.0) discard;
      vec4 tex = texture2D(uMap, uv);
      float a = tex.a * vAlpha * uOpacity;
      if (a < 0.02) discard;
      gl_FragColor = vec4(vColor * tex.rgb, a);
      #include <colorspace_fragment>
    }
  `;

  /* ---------------- Shader kilau emas ---------------- */
  const SPARKLE_VERTEX = /* glsl */`
    uniform float uTime;
    uniform float uScale;
    uniform float uSize;
    uniform float uBoost;
    uniform float uSpeed;
    attribute float aSeed;
    varying float vTwinkle;

    void main() {
      vec3 p = position;
      p.y += mod(uTime * 0.12 * uSpeed + aSeed * 10.0, 10.0) - 5.0;
      p.x += sin(uTime * 0.3 * uSpeed + aSeed * 20.0) * 0.4;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      vTwinkle = 0.35 + 0.65 * pow(abs(sin(uTime * (0.8 + aSeed * 1.6) + aSeed * 30.0)), 3.0);
      vTwinkle = min(vTwinkle + uBoost, 1.6);
      gl_PointSize = uSize * (0.6 + aSeed) * (1.0 + uBoost * 0.8) * uScale / max(-mv.z, 0.5);
    }
  `;

  const SPARKLE_FRAGMENT = /* glsl */`
    uniform vec3 uColor;
    varying float vTwinkle;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float core = smoothstep(0.5, 0.0, d);
      float glow = core * core;
      float a = glow * vTwinkle;
      if (a < 0.01) discard;
      gl_FragColor = vec4(uColor * a, a);
      #include <colorspace_fragment>
    }
  `;

  /* ---------------- Utilitas ---------------- */
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

  // Tekstur kelopak dibuat dari canvas (tanpa file gambar tambahan)
  function createPetalCanvas() {
    const size = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.translate(size / 2, size / 2);

    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.bezierCurveTo(38, 30, 34, -26, 6, -50);
    ctx.quadraticCurveTo(0, -42, -6, -50);
    ctx.bezierCurveTo(-34, -26, -38, 30, 0, 50);
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, 10, 4, 0, 0, 56);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.65, 'rgba(240,236,232,0.95)');
    grad.addColorStop(1, 'rgba(205,195,190,0.85)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Urat kelopak tipis
    ctx.strokeStyle = 'rgba(200,190,185,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 44);
    ctx.quadraticCurveTo(4, 0, 0, -38);
    ctx.stroke();
    return cv;
  }

  class Scene3D {
    constructor(THREE, canvas, assets, options) {
      this.THREE = THREE;
      this.canvas = canvas;
      this.assets = assets;
      this.options = options;
      this.isMobile = window.matchMedia('(max-width: 767px)').matches;
      this.reducedMotion = options.reducedMotion;

      this.state = {
        mouseX: 0, mouseY: 0,         // target -1..1
        camX: 0, camY: 0,             // nilai halus
        open: 0, openFrom: 0, openStart: -1, openResolve: null,
        scroll: 0, scrollSmooth: 0,
        boost: 0,
        time: 0,
        running: false, active: true, lastTs: 0
      };
      this.layoutInfo = null;
      this.loop = this.loop.bind(this);
    }

    /* ---------- Inisialisasi ---------- */
    async build(onProgress) {
      const THREE = this.THREE;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // dibatasi maks 2 demi performa

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
      });
      this.renderer.setPixelRatio(dpr);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;

      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(SETTINGS.fogColor, SETTINGS.fogDensity);

      this.camera = new THREE.PerspectiveCamera(SETTINGS.fov, 1, 0.1, 100);
      this.camera.position.set(0, 0, SETTINGS.cameraZ);
      this.lookTarget = new THREE.Vector3(0, 0, SETTINGS.backdropZ);

      // Cahaya golden hour
      const ambient = new THREE.AmbientLight(SETTINGS.ambient.color, SETTINGS.ambient.intensity);
      const sun = new THREE.DirectionalLight(SETTINGS.sun.color, SETTINGS.sun.intensity);
      sun.position.set(...SETTINGS.sun.position);
      sun.target.position.set(0, 0, SETTINGS.gateZ);
      sun.castShadow = true;
      sun.shadow.mapSize.set(this.isMobile ? 512 : 1024, this.isMobile ? 512 : 1024);
      Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 14, bottom: -14, near: 1, far: 60 });
      sun.shadow.bias = -0.0006;
      sun.shadow.normalBias = 0.02;
      this.scene.add(ambient, sun, sun.target);

      // Muat tekstur dengan LoadingManager agar progres akurat
      const manager = new THREE.LoadingManager();
      manager.onProgress = (_url, loaded, total) => onProgress && onProgress(loaded / total);
      const loader = new THREE.TextureLoader(manager);
      const maxAniso = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
      const load = async (url) => {
        const tex = await loader.loadAsync(url);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        return tex;
      };
      const bgUrl = this.isMobile ? this.assets.palaceBgMobile : this.assets.palaceBg;
      const [bgTex, gateLTex, gateRTex] = await Promise.all([
        load(bgUrl), load(this.assets.gateLeft), load(this.assets.gateRight)
      ]);

      this.createBackdrop(bgTex);
      this.createGates(gateLTex, gateRTex);
      this.createPetals();
      this.createSparkles();

      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize, { passive: true });
      this.onResize();

      if (!this.reducedMotion && window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('pointermove', (e) => {
          this.state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
          this.state.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });
      }

      document.addEventListener('visibilitychange', () => this.updateRunning());
      this.canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        this.stop();
        this.options.onContextLost && this.options.onContextLost();
      });

      // Kompilasi shader lebih awal agar frame pertama tidak tersendat
      this.renderer.compile(this.scene, this.camera);
      this.updateRunning();
    }

    createBackdrop(texture) {
      const THREE = this.THREE;
      this.bgAspect = texture.image.width / texture.image.height;
      const material = new THREE.MeshBasicMaterial({ map: texture });
      this.backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      this.backdrop.position.z = SETTINGS.backdropZ;
      this.scene.add(this.backdrop);

      // Lantai transparan penerima bayangan
      this.floor = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 40),
        new THREE.ShadowMaterial({ color: 0x3A1111, opacity: 0.2 })
      );
      this.floor.rotation.x = -Math.PI / 2;
      this.floor.position.z = SETTINGS.gateZ - 10;
      this.floor.receiveShadow = true;
      this.scene.add(this.floor);
    }

    createGates(texL, texR) {
      const THREE = this.THREE;
      const makeGate = (tex) => {
        const geo = new THREE.PlaneGeometry(1, 1);
        geo.translate(0, 0.5, 0); // titik pusat di bawah agar mudah diletakkan di lantai
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          emissive: 0xffffff,
          emissiveMap: tex,
          emissiveIntensity: SETTINGS.gateEmissive,
          alphaTest: 0.5,
          alphaToCoverage: true, // tepi halus bila MSAA aktif
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.userData.aspect = tex.image.width / tex.image.height;
        return mesh;
      };
      this.gateL = makeGate(texL);
      this.gateR = makeGate(texR);
      this.gateL.position.z = this.gateR.position.z = SETTINGS.gateZ;
      this.scene.add(this.gateL, this.gateR);
    }

    createPetals() {
      const THREE = this.THREE;
      const count = this.isMobile ? SETTINGS.petals.mobile : SETTINGS.petals.desktop;
      const height = 20;
      const positions = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      const scales = new Float32Array(count);
      const colors = new Float32Array(count * 3);
      // Warna mawar, melati, dan emas — khas pengantin Jawa
      const palette = ['#F7B7C3', '#E88A9C', '#C84B5E', '#FFF4E2', '#FFFBF2', '#F1D78A', '#E9A27E']
        .map((c) => new THREE.Color(c));

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() * 2 - 1) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * height;
        positions[i * 3 + 2] = -10 + Math.random() * 15; // z: -10 .. 5
        seeds[i] = Math.random();
        scales[i] = 0.6 + Math.random() * 0.9;
        const col = palette[(Math.random() * palette.length) | 0];
        colors.set([col.r, col.g, col.b], i * 3);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
      geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
      geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40); // hindari culling keliru

      const tex = new THREE.CanvasTexture(createPetalCanvas());
      tex.colorSpace = THREE.SRGBColorSpace;

      this.petalMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 }, uScale: { value: 1 }, uSize: { value: SETTINGS.petals.size },
          uHeight: { value: height }, uMap: { value: tex }, uOpacity: { value: 0.92 },
          uSpeed: { value: this.reducedMotion ? 0.25 : 1 }
        },
        vertexShader: PETAL_VERTEX,
        fragmentShader: PETAL_FRAGMENT,
        transparent: true,
        depthWrite: false
      });
      this.petals = new THREE.Points(geo, this.petalMaterial);
      this.petals.frustumCulled = false;
      this.petals.position.y = 1.5;
      this.scene.add(this.petals);
    }

    createSparkles() {
      const THREE = this.THREE;
      const count = this.isMobile ? SETTINGS.sparkles.mobile : SETTINGS.sparkles.desktop;
      const positions = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() * 2 - 1) * 13;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 2] = -12 + Math.random() * 15;
        seeds[i] = Math.random();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

      this.sparkleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 }, uScale: { value: 1 }, uSize: { value: SETTINGS.sparkles.size },
          uBoost: { value: 0 }, uColor: { value: new THREE.Color(0xFFD27A) },
          uSpeed: { value: this.reducedMotion ? 0.25 : 1 }
        },
        vertexShader: SPARKLE_VERTEX,
        fragmentShader: SPARKLE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.sparkles = new THREE.Points(geo, this.sparkleMaterial);
      this.sparkles.frustumCulled = false;
      this.scene.add(this.sparkles);
    }

    /* ---------- Tata letak responsif ---------- */
    onResize() {
      const w = this.canvas.clientWidth || window.innerWidth;
      const h = this.canvas.clientHeight || window.innerHeight;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();

      const THREE = this.THREE;
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(SETTINGS.fov) / 2);
      const viewH = (dist) => 2 * tanHalf * dist;
      const aspect = w / h;

      // Backdrop menutupi seluruh layar (+ margin untuk parallax)
      const dB = SETTINGS.cameraZ - SETTINGS.backdropZ;
      const hB = viewH(dB);
      const wB = hB * aspect;
      const planeH = Math.max(hB, wB / this.bgAspect) * 1.16;
      this.backdrop.scale.set(planeH * this.bgAspect, planeH, 1);

      // Gapura di kiri & kanan, sebagian keluar layar agar teks tengah lega
      const dG = SETTINGS.cameraZ - SETTINGS.gateZ;
      const hG = viewH(dG);
      const wG = hG * aspect;
      const aL = this.gateL.userData.aspect;
      const aR = this.gateR.userData.aspect;
      const gateH = Math.min(hG * 0.6, 0.42 * wG / (0.75 * aL));
      const wL = gateH * aL;
      const wR = gateH * aR;
      const baseY = -hG / 2 - gateH * 0.025; // tepi bawah (sisa lantai foto) sedikit di luar layar

      this.gateL.scale.set(wL, gateH, 1);
      this.gateR.scale.set(wR, gateH, 1);
      this.layoutInfo = {
        leftX: -wG / 2 + wL * 0.25,
        rightX: wG / 2 - wR * 0.25,
        wL, wR, baseY
      };
      this.gateL.position.y = this.gateR.position.y = baseY;
      this.floor.position.y = baseY;
      this.applyGateOpen();

      // Faktor ukuran titik (piksel per unit dunia pada jarak 1)
      const scale = (h * this.renderer.getPixelRatio()) / (2 * tanHalf);
      this.petalMaterial.uniforms.uScale.value = scale;
      this.sparkleMaterial.uniforms.uScale.value = scale;

      if (!this.state.running) this.renderer.render(this.scene, this.camera);
    }

    applyGateOpen() {
      if (!this.layoutInfo) return;
      const { leftX, rightX, wL, wR } = this.layoutInfo;
      const o = this.state.open;
      this.gateL.position.x = leftX - o * wL * 0.85;
      this.gateR.position.x = rightX + o * wR * 0.85;
      this.gateL.rotation.y = o * 0.55;
      this.gateR.rotation.y = -o * 0.55;
    }

    /* ---------- Loop render ---------- */
    loop(ts) {
      const s = this.state;
      const dt = Math.min(((ts - (s.lastTs || ts)) / 1000), 0.1);
      s.lastTs = ts;
      s.time += dt;

      // Animasi buka gapura
      if (s.openStart >= 0) {
        const p = Math.min((s.time - s.openStart) / SETTINGS.openDuration, 1);
        s.open = s.openFrom + (1 - s.openFrom) * easeInOutCubic(p);
        s.boost = Math.max(s.boost, Math.sin(p * Math.PI) * 0.9);
        if (p >= 1) {
          s.openStart = -1;
          if (s.openResolve) { s.openResolve(); s.openResolve = null; }
        }
        this.applyGateOpen();
      }
      s.boost = damp(s.boost, 0, 1.5, dt);

      // Kamera: parallax + buka + scroll
      s.camX = damp(s.camX, s.mouseX * SETTINGS.parallax.x, 3, dt);
      s.camY = damp(s.camY, -s.mouseY * SETTINGS.parallax.y, 3, dt);
      s.scrollSmooth = damp(s.scrollSmooth, s.scroll, 6, dt);
      const cam = this.camera;
      cam.position.x = s.camX;
      cam.position.y = s.camY + s.scrollSmooth * 0.8;
      cam.position.z = SETTINGS.cameraZ - s.open * 2.4 - s.scrollSmooth * 4;
      this.lookTarget.set(s.camX * 0.25, s.camY * 0.2 + s.scrollSmooth * 1.2, SETTINGS.backdropZ);
      cam.lookAt(this.lookTarget);

      this.petalMaterial.uniforms.uTime.value = s.time;
      this.sparkleMaterial.uniforms.uTime.value = s.time;
      this.sparkleMaterial.uniforms.uBoost.value = s.boost;

      this.renderer.render(this.scene, cam);
    }

    updateRunning() {
      const shouldRun = this.state.active && !document.hidden;
      if (shouldRun && !this.state.running) {
        this.state.running = true;
        this.state.lastTs = 0;
        this.renderer.setAnimationLoop(this.loop);
      } else if (!shouldRun && this.state.running) {
        this.stop();
      }
    }

    stop() {
      this.state.running = false;
      this.renderer.setAnimationLoop(null);
    }

    /* ---------- API publik ---------- */
    setActive(active) { this.state.active = active; this.updateRunning(); }
    setScrollProgress(p) { this.state.scroll = Math.min(Math.max(p, 0), 1); }
    open() {
      const s = this.state;
      if (s.open >= 1) return Promise.resolve();
      return new Promise((resolve) => {
        s.openFrom = s.open;
        s.openStart = s.time;
        s.openResolve = resolve;
        if (!s.running) { // tab tersembunyi: langsung selesai
          s.open = 1; this.applyGateOpen(); s.openStart = -1; resolve();
        }
      });
    }
  }

  /**
   * Membuat scene 3D.
   * @param {HTMLCanvasElement} canvas
   * @param {object} assets  objek ASSETS dari config.js
   * @param {object} options { onProgress(0..1), onContextLost(), reducedMotion }
   * @returns {Promise<Scene3D>}
   */
  async function create(canvas, assets, options = {}) {
    if (location.protocol === 'file:') {
      // Browser memblokir tekstur WebGL dari file:// — pakai gambar statis
      throw new Error('file-protocol');
    }
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
      throw new Error('webgl-unsupported');
    }
    const report = (p) => options.onProgress && options.onProgress(p);
    const THREE = await import(THREE_URL);
    report(0.3);
    const scene = new Scene3D(THREE, canvas, assets, options);
    await scene.build((p) => report(0.3 + p * 0.7));
    report(1);
    return scene;
  }

  window.KratonScene = { create };
})();
