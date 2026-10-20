// High-Definition Procedural 3D Flower Bloom Engine (Ngàn Hoa Nở)
// Replaces video with ultra-crisp, high-DPI Canvas 2D botanical animation.

const S = 480; // Optimized crisp sprite size (ultra-sharp, 2.5x faster GPU upload)
const TAU = Math.PI * 2;

function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, lo = 0, hi = 255) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const jit = (c, r, amt) => [
  clamp(c[0] + (r() - 0.5) * amt),
  clamp(c[1] + (r() - 0.5) * amt),
  clamp(c[2] + (r() - 0.5) * amt),
];

const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutSine = (t) => Math.sin((t * Math.PI) / 2);
const easeOutBack = (t) => {
  const c1 = 1.6;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function newCanvas() {
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const x = c.getContext("2d");
  x.translate(S / 2, S / 2);
  return { c, x };
}

function roundPetalPath(x, len, wid) {
  x.beginPath();
  x.moveTo(0, 0);
  x.bezierCurveTo(wid * 1.5, -len * 0.1, wid * 1.15, -len, 0, -len);
  x.bezierCurveTo(-wid * 1.15, -len, -wid * 1.5, -len * 0.1, 0, 0);
  x.closePath();
}

function pointPetalPath(x, len, wid) {
  x.beginPath();
  x.moveTo(0, 0);
  x.bezierCurveTo(wid * 1.7, -len * 0.25, wid * 1.1, -len * 0.78, 0, -len);
  x.bezierCurveTo(-wid * 1.1, -len * 0.78, -wid * 1.7, -len * 0.25, 0, 0);
  x.closePath();
}

function drawPetal(x, ang, len, wid, pal, opts = {}) {
  x.save();
  x.rotate(ang);
  if (opts.pointed) pointPetalPath(x, len, wid);
  else roundPetalPath(x, len, wid);

  const g = x.createRadialGradient(0, -len * 0.08, len * 0.04, 0, -len * 0.55, len * 0.88);
  g.addColorStop(0, rgb(pal.inner));
  g.addColorStop(0.55, rgb(pal.mid));
  g.addColorStop(1, rgb(pal.outer));

  if (opts.shadow !== false) {
    x.shadowColor = "rgba(110, 20, 50, 0.22)";
    x.shadowBlur = S * 0.02;
    x.shadowOffsetY = S * 0.004;
  }
  x.fillStyle = g;
  x.fill();
  x.shadowColor = "transparent";

  // Delicate petal edge highlight
  x.lineWidth = S * 0.0022;
  x.strokeStyle = rgb(pal.edge, 0.28);
  x.stroke();

  if (opts.lip) {
    x.beginPath();
    x.arc(0, -len * 0.78, wid * 0.95, Math.PI * 1.12, Math.PI * 1.88);
    x.lineWidth = S * 0.0045;
    x.strokeStyle = "rgba(255, 255, 255, 0.45)";
    x.stroke();
  }
  x.restore();
}

// 1. Mẫu đơn (Peony)
function createPeonySprite(seed, pal, hasStamen) {
  const r = makeRng(seed);
  const { c, x } = newCanvas();
  const rings = 5;
  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1);
    const len = S * (0.47 - 0.34 * t);
    const n = [8, 8, 7, 5, 4][i];
    const off = r() * TAU;
    const p = {
      inner: mix(pal.outer, pal.inner, t * 0.65),
      mid: mix(pal.outer, pal.mid, 0.4 + t * 0.4),
      outer: mix(pal.outer, pal.edge, 0.18 * (1 - t)),
      edge: pal.edge,
    };
    for (let k = 0; k < n; k++) {
      const a = off + (k * TAU) / n + (r() - 0.5) * 0.3;
      drawPetal(x, a, len * (0.88 + r() * 0.22), len * (0.42 + r() * 0.06), p, { lip: i < 3 });
    }
  }

  if (hasStamen) {
    for (let k = 0; k < 52; k++) {
      const a = r() * TAU;
      const d = S * 0.055 * Math.sqrt(r());
      x.beginPath();
      x.arc(Math.cos(a) * d, Math.sin(a) * d, S * (0.004 + r() * 0.006), 0, TAU);
      x.fillStyle = rgb(jit([232, 190, 96], r, 35), 0.95);
      x.fill();
    }
  } else {
    const g = x.createRadialGradient(0, 0, 0, 0, 0, S * 0.075);
    g.addColorStop(0, rgb(mix(pal.edge, [65, 8, 22], 0.55), 0.92));
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.beginPath();
    x.arc(0, 0, S * 0.075, 0, TAU);
    x.fill();
  }
  return c;
}

// 2. Hoa hồng (Rose / English Cabbage Rose)
function createRoseSprite(seed, pal) {
  const r = makeRng(seed);
  const { c, x } = newCanvas();
  const layers = [
    { n: 7, len: 0.48, w: 0.54 },
    { n: 6, len: 0.40, w: 0.50 },
    { n: 6, len: 0.32, w: 0.46 },
    { n: 5, len: 0.24, w: 0.44 },
    { n: 4, len: 0.16, w: 0.42 },
  ];

  layers.forEach((L, i) => {
    const t = i / (layers.length - 1);
    const len = S * L.len;
    const off = r() * TAU;
    const p = {
      inner: mix(pal.mid, pal.inner, 0.3 + 0.5 * (1 - t)),
      mid: mix(pal.outer, pal.mid, 0.5 + 0.4 * (1 - t)),
      outer: mix(pal.outer, pal.edge, 0.25 * t),
      edge: pal.edge,
    };
    for (let k = 0; k < L.n; k++) {
      const a = off + (k * TAU) / L.n + (r() - 0.5) * 0.35;
      drawPetal(x, a, len * (0.92 + r() * 0.16), len * L.w * 0.9, p, { lip: true, shadow: i > 0 });
    }
  });

  // Center cupped heart petals (soft cabbage rose center)
  for (let k = 0; k < 6; k++) {
    const a = (k * TAU) / 6 + r() * 0.4;
    const rad = S * (0.05 + r() * 0.03);
    x.save();
    x.rotate(a);
    x.beginPath();
    x.arc(0, -rad * 0.6, rad * 0.8, 0, TAU);
    const g = x.createRadialGradient(0, -rad * 0.4, 0, 0, -rad * 0.6, rad);
    g.addColorStop(0, rgb(pal.inner));
    g.addColorStop(0.7, rgb(pal.mid));
    g.addColorStop(1, rgb(pal.edge, 0.75));
    x.fillStyle = g;
    x.fill();
    x.restore();
  }
  return c;
}

// 3. Hoa Lily
function createLilySprite(seed, light, deep) {
  const r = makeRng(seed);
  const { c, x } = newCanvas();
  const pal = { inner: deep, mid: mix(deep, light, 0.55), outer: light, edge: mix(deep, [155, 45, 85], 0.5) };

  for (let k = 0; k < 6; k++) {
    const a = (k * TAU) / 6 + (r() - 0.5) * 0.08;
    const big = k % 2 === 0;
    const len = S * (big ? 0.48 : 0.45);
    const wid = S * (big ? 0.125 : 0.105);
    drawPetal(x, a, len, wid, pal, { pointed: true });

    x.save();
    x.rotate(a);
    x.beginPath();
    x.moveTo(0, -len * 0.05);
    x.lineTo(0, -len * 0.72);
    x.strokeStyle = rgb(pal.edge, 0.5);
    x.lineWidth = S * 0.005;
    x.stroke();

    for (let d = 0; d < 8; d++) {
      x.beginPath();
      x.arc((r() - 0.5) * wid * 0.85, -len * (0.16 + r() * 0.36), S * 0.0048, 0, TAU);
      x.fillStyle = "rgba(125, 38, 48, 0.6)";
      x.fill();
    }
    x.restore();
  }

  // Lily center core & anthers
  const g = x.createRadialGradient(0, 0, 0, 0, 0, S * 0.065);
  g.addColorStop(0, "rgba(195, 205, 115, 0.95)");
  g.addColorStop(1, "rgba(195, 205, 115, 0)");
  x.fillStyle = g;
  x.beginPath();
  x.arc(0, 0, S * 0.065, 0, TAU);
  x.fill();

  for (let k = 0; k < 6; k++) {
    const a = (k * TAU) / 6 + 0.5 + (r() - 0.5) * 0.28;
    const l = S * (0.17 + r() * 0.07);
    const ex = Math.cos(a) * l;
    const ey = Math.sin(a) * l;
    x.beginPath();
    x.moveTo(0, 0);
    x.lineTo(ex, ey);
    x.strokeStyle = "rgba(240, 220, 175, 0.95)";
    x.lineWidth = S * 0.0055;
    x.stroke();

    x.save();
    x.translate(ex, ey);
    x.rotate(a);
    x.beginPath();
    x.ellipse(0, 0, S * 0.034, S * 0.012, 0, 0, TAU);
    x.fillStyle = "#632d22";
    x.fill();
    x.restore();
  }
  return c;
}

// 4. Cẩm tú cầu (Hydrangea)
function createHydrangeaSprite(seed, base) {
  const r = makeRng(seed);
  const { c, x } = newCanvas();
  const items = [];
  const N = 95;
  for (let i = 0; i < N; i++) {
    const a = r() * TAU;
    const d = S * 0.41 * Math.sqrt(r()) * (0.92 + 0.1 * Math.sin(a * 5 + seed));
    items.push({ px: Math.cos(a) * d, py: Math.sin(a) * d, s: S * (0.05 + r() * 0.032) });
  }
  items.sort((a, b) => a.py - b.py);

  for (const it of items) {
    const col = jit(base, r, 36);
    x.save();
    x.translate(it.px, it.py);
    x.rotate(r() * TAU);
    x.shadowColor = "rgba(95, 30, 85, 0.32)";
    x.shadowBlur = S * 0.014;

    for (let k = 0; k < 4; k++) {
      x.save();
      x.rotate((k * TAU) / 4);
      x.beginPath();
      x.ellipse(0, -it.s * 0.55, it.s * 0.52, it.s * 0.65, 0, 0, TAU);
      const g = x.createRadialGradient(0, -it.s * 0.3, 0, 0, -it.s * 0.55, it.s * 0.72);
      g.addColorStop(0, rgb(mix(col, [255, 245, 250], 0.42)));
      g.addColorStop(1, rgb(mix(col, [155, 68, 145], 0.28)));
      x.fillStyle = g;
      x.fill();
      x.restore();
    }
    x.shadowColor = "transparent";
    x.beginPath();
    x.arc(0, 0, it.s * 0.14, 0, TAU);
    x.fillStyle = "rgba(255, 242, 205, 0.92)";
    x.fill();
    x.restore();
  }
  return c;
}

// Bảng màu hoa sắc nét
const PAL_PINK = { inner: [255, 216, 226], mid: [248, 172, 198], outer: [234, 130, 165], edge: [192, 80, 120] };
const PAL_PINK_LIGHT = { inner: [255, 235, 240], mid: [252, 199, 215], outer: [242, 158, 186], edge: [202, 102, 138] };
const PAL_PINK_DEEP = { inner: [250, 162, 192], mid: [238, 120, 162], outer: [210, 82, 126], edge: [152, 42, 88] };
const PAL_WHITE = { inner: [255, 252, 246], mid: [254, 246, 236], outer: [240, 224, 216], edge: [200, 170, 170] };
const PAL_RED = { inner: [210, 48, 68], mid: [175, 30, 50], outer: [122, 18, 38], edge: [80, 10, 26] };

export function buildFlowerSprites() {
  const sprites = [];
  const weighted = [];
  const add = (c, weight) => {
    const i = sprites.push(c) - 1;
    for (let k = 0; k < weight; k++) weighted.push(i);
  };

  add(createRoseSprite(11, PAL_PINK), 6);
  add(createRoseSprite(12, PAL_PINK_LIGHT), 5);
  add(createRoseSprite(13, PAL_PINK_DEEP), 4);
  add(createPeonySprite(21, PAL_WHITE, true), 6);
  add(createPeonySprite(22, PAL_WHITE, true), 5);
  add(createPeonySprite(23, PAL_PINK_LIGHT, true), 4);
  add(createPeonySprite(24, PAL_RED, false), 3);
  add(createPeonySprite(25, PAL_RED, false), 3);
  add(createLilySprite(31, [254, 228, 234], [238, 122, 154]), 4);
  add(createLilySprite(32, [252, 212, 222], [226, 102, 142]), 4);
  add(createHydrangeaSprite(41, [238, 154, 194]), 4);
  add(createHydrangeaSprite(42, [224, 152, 206]), 4);
  add(createHydrangeaSprite(43, [248, 180, 204]), 4);

  return { sprites, weighted };
}

let cachedFlowerSprites = null;

export function getFlowerSprites() {
  if (!cachedFlowerSprites && typeof document !== "undefined") {
    cachedFlowerSprites = buildFlowerSprites();
  }
  return cachedFlowerSprites;
}

export function prewarmFlowerSprites() {
  if (typeof window === "undefined" || cachedFlowerSprites) return;
  const runner = () => {
    if (!cachedFlowerSprites) {
      getFlowerSprites();
    }
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runner, { timeout: 1500 });
  } else {
    window.setTimeout(runner, 200);
  }
}

const BLOOM_N = 1350;
const TRANSITION_COMPLETE_AT = 2.8;
const OUT_LEN = 3.8;
const NEAR_CUT = 0.25;

export class FlowerBloomEngine {
  constructor(canvas, onCardReveal, onTransitionEnd) {
    this.canvas = canvas;
    this.onCardReveal = onCardReveal;
    this.onTransitionEnd = onTransitionEnd;
    this.ctx = canvas.getContext("2d");
    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.raf = 0;
    this.cardRevealed = false;
    this.ended = false;

    this.t0 = performance.now();
    this.last = performance.now();

    this.sprites = getFlowerSprites() || buildFlowerSprites();
    this.flowers = [];

    this.makeFlowers();
    this.resize();
  }

  makeFlowers() {
    const n = BLOOM_N;
    for (let i = 0; i < n; i++) {
      const spr = this.sprites.weighted[(Math.random() * this.sprites.weighted.length) | 0];

      let x, y, z, rad;
      const type = i % 4;
      if (type === 0 || type === 1) {
        // Core cluster (50%): densely packed center rosette
        const u = Math.random();
        rad = 0.06 + 0.94 * Math.pow(u, 0.45);
        const th = Math.random() * TAU;
        const ph = Math.acos(2 * Math.random() - 1);
        x = rad * Math.sin(ph) * Math.cos(th);
        y = rad * Math.sin(ph) * Math.sin(th) * 0.95;
        z = rad * Math.cos(ph) * 0.6;
      } else if (type === 2) {
        // Horizontal span for widescreen / 16:9 edges (25%)
        const ang = Math.random() * TAU;
        const dist = 0.65 + 0.85 * Math.random();
        x = Math.cos(ang) * dist * 1.55;
        y = Math.sin(ang) * dist * 0.85;
        z = (Math.random() - 0.5) * 0.55;
        rad = dist;
      } else {
        // Vertical span for mobile portrait edges (25%)
        const ang = Math.random() * TAU;
        const dist = 0.65 + 0.85 * Math.random();
        x = Math.cos(ang) * dist * 0.85;
        y = Math.sin(ang) * dist * 1.55;
        z = (Math.random() - 0.5) * 0.55;
        rad = dist;
      }

      // Kích thước vừa phải (0.17 - 0.33), nhiều bông hoa đan xen, không có bông nào bị quá to
      const size = 0.17 + Math.random() * 0.16;

      // Xuất hiện sau khi màn hình đã trắng hoàn toàn (0.45s+), nở nhẹ nhàng từ tâm ra ngoài
      const start = 0.45 + 1.25 * Math.pow(rad, 0.7) + Math.random() * 0.35;
      const bloomDuration = 0.85 + Math.random() * 0.45; // 0.85s - 1.3s để bung cánh nhẹ nhàng
      const unfurlAngle = (Math.random() - 0.5) * 0.8; // Độ xoay nhẹ khi cánh hoa hé nở

      // Thông số rơi nhẹ nhàng khi hoa biến mất ("từng bông hoa nhẹ nhàng rơi xuống mờ dần rồi biến mất")
      const fallDelay = Math.random() * 0.95; // Rơi lần lượt sole tự nhiên
      const fallSpeed = 65 + Math.random() * 95; // Tốc độ rơi êm ái
      const swayFreq = 1.0 + Math.random() * 1.8;
      const swayAmp = 20 + Math.random() * 45;
      const swayPhase = Math.random() * TAU;
      const rotSpeed = (Math.random() - 0.5) * 0.6;
      const fadeDuration = 2.2 + Math.random() * 1.2; // 2.2s - 3.4s mờ dần

      this.flowers.push({
        x,
        y,
        z,
        size,
        rot: Math.random() * TAU,
        squash: 0.88 + Math.random() * 0.12,
        sprite: spr,
        start,
        bloomDuration,
        unfurlAngle,
        rad,
        fallDelay,
        fallSpeed,
        swayFreq,
        swayAmp,
        swayPhase,
        rotSpeed,
        fadeDuration,
      });
    }
  }

  start() {
    this.ended = false;
    this.cardRevealed = false;
    this.t0 = performance.now();
    this.last = performance.now();
    this.resize();

    if (!this.sprites) {
      this.sprites = getFlowerSprites() || buildFlowerSprites();
    }
    if (this.flowers.length === 0) {
      this.makeFlowers();
    }

    cancelAnimationFrame(this.raf);
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.frame(now, dt);
      if (!this.ended) {
        this.raf = requestAnimationFrame(loop);
      }
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.ended = true;
    cancelAnimationFrame(this.raf);
    if (this.ctx && this.canvas) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  resize() {
    if (!this.canvas) return;
    this.dpr = Math.min(2.5, window.devicePixelRatio || 1);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    const tw = Math.round(this.w * this.dpr);
    const th = Math.round(this.h * this.dpr);
    if (this.canvas.width !== tw) this.canvas.width = tw;
    if (this.canvas.height !== th) this.canvas.height = th;
  }

  frame(now, dt) {
    const { ctx, w, h, dpr } = this;
    if (!ctx || w === 0 || h === 0) return;

    // Fully clear canvas buffer every frame (transparent background - no purple backdrop!)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    const m = Math.min(w, h);
    const time = (now - this.t0) / 1000;

    // Trigger card reveal at peak full-screen bloom
    if (time >= TRANSITION_COMPLETE_AT && !this.cardRevealed) {
      this.cardRevealed = true;
      if (this.onCardReveal) this.onCardReveal();
    }

    // End transition after flowers have slowly and gracefully dissolved completely
    if (time >= TRANSITION_COMPLETE_AT + OUT_LEN && !this.ended) {
      this.ended = true;
      if (this.onTransitionEnd) this.onTransitionEnd();
      return;
    }

    const outT = time >= TRANSITION_COMPLETE_AT ? time - TRANSITION_COMPLETE_AT : -1;

    // Màn hình trắng hoàn toàn sau khi kéo vào thiệp, rồi mới bắt đầu nở hoa trên nền trắng đó
    // Khi hoa biến mất dần, nền trắng mờ dần lộ ra tấm thiệp chúc mừng ở phía sau
    let bgAlpha = 1;
    if (time < 0.4) {
      bgAlpha = easeOutSine(time / 0.4);
    } else if (outT >= 0) {
      const o = clamp01(outT / OUT_LEN);
      bgAlpha = (1 + Math.cos(o * Math.PI)) / 2;
    }

    if (bgAlpha > 0.001) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = `rgba(255, 255, 255, ${bgAlpha})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // Render pure volumetric 3D blooming flowers on pure white backdrop
    this.drawBouquet(time, m, outT);
  }

  drawBouquet(tb, m, outT) {
    const { ctx, w, h } = this;
    const aspect = w / (h || 1);
    const baseDim = Math.min(w, h);
    // Tiêu cự mở rộng tự nhiên, bao phủ toàn màn hình mà không ép sát camera
    const f = Math.max(baseDim * 1.55, Math.max(w, h) * 0.95);
    // Nở ra thật nhẹ nhàng từ lúc bắt đầu xuất hiện trên nền trắng (tb >= 0.45s)
    const bloomT = Math.max(0, tb - 0.45);
    const grow = easeOutCubic(clamp01(bloomT / 2.1));
    // D giữ ở cự ly vừa phải (3.6 -> 2.35), hoa không bị phóng to choán hết màn hình
    const D = lerp(3.6, 2.35, grow);

    const cx = w / 2;
    const cy = h / 2;

    const yaw = tb * 0.08 + 0.3;
    const pitch = 0.07 * Math.sin(tb * 0.14);
    const cyw = Math.cos(yaw);
    const syw = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const posScale = 0.32 + 0.68 * grow;
    const xAspectScale = aspect > 1 ? Math.min(1.45, 0.95 + (aspect - 1) * 0.45) : 1;
    const yAspectScale = aspect < 1 ? Math.min(1.45, 0.95 + (1 / aspect - 1) * 0.35) : 1;

    const list = [];
    for (const fl of this.flowers) {
      if (tb < fl.start) continue;

      // Cánh hoa nở ra thật nhẹ nhàng (unhurried organic unfurl)
      const bProgress = clamp01((tb - fl.start) / fl.bloomDuration);
      if (bProgress <= 0.001) continue;

      // Easing nở cánh hoa êm ái, cánh hé mở mượt mà
      const bloomScale = easeOutSine(bProgress);
      // Xoay nhẹ theo chiều bung nở như cánh hoa hé từ búp
      const bloomRot = (1 - bloomScale) * fl.unfurlAngle;
      // Tăng dần độ trong suốt khi hoa mới nhú
      const bloomAlpha = Math.min(1, bProgress * 1.5);

      // Hiệu ứng từng bông hoa nhẹ nhàng rơi xuống và mờ dần khi kết thúc
      let fallY = 0;
      let swayX = 0;
      let fallRot = 0;
      let flowerFade = 1;

      if (outT >= 0) {
        const fT = outT - fl.fallDelay;
        if (fT > 0) {
          // Rơi xuống nhẹ nhàng theo phương thẳng đứng với gia tốc rơi tự do rất êm
          fallY = fl.fallSpeed * fT + 24 * fT * fT;
          // Đong đưa chao liệng nhẹ nhàng sang 2 bên
          swayX = Math.sin(fT * fl.swayFreq + fl.swayPhase) * fl.swayAmp * Math.min(1, fT * 1.5);
          fallRot = fl.rotSpeed * fT;

          // Mờ dần theo thời lượng riêng của từng bông
          const pFade = clamp01(fT / fl.fadeDuration);
          flowerFade = (1 + Math.cos(pFade * Math.PI)) / 2;
          if (flowerFade <= 0.001) continue; // Bông hoa đã biến mất hoàn toàn
        }
      }

      const x0 = fl.x * posScale * xAspectScale;
      const y0 = fl.y * posScale * yAspectScale;
      const z0 = fl.z * posScale;
      const x1 = x0 * cyw + z0 * syw;
      const z1 = -x0 * syw + z0 * cyw;
      const y2 = y0 * cp - z1 * sp;
      const z2 = y0 * sp + z1 * cp;
      const dz = D + z2;
      if (dz < NEAR_CUT) continue;

      const sc = f / dz;
      const sx = cx + x1 * sc + swayX;
      const sy = cy + y2 * sc + fallY;
      const px = fl.size * sc * bloomScale * (0.35 + 0.65 * grow);
      if (px < 2) continue;

      // Bounding margin kiểm tra viền màn hình
      const half = px * 0.55;
      if (sx + half < -w * 0.25 || sx - half > w * 1.25 || sy + half < -h * 0.25 || sy - half > h * 1.4) continue;

      const near = clamp01((dz - NEAR_CUT) / 0.15);
      const shade = clamp01(0.72 + 0.48 * (1 - clamp01((dz - D + 1) / 2)));
      const alpha = near * bloomAlpha * flowerFade * Math.min(1, shade + 0.2);
      if (alpha <= 0.005) continue;

      const rot = fl.rot + tb * 0.03 + bloomRot + fallRot;

      list.push({ fl, sx, sy, dz, px, rot, alpha });
    }

    // Sắp xếp vẽ các bông ở xa trước, bông ở gần đè lên sau
    list.sort((a, b) => b.dz - a.dz);

    ctx.save();
    for (const it of list) {
      ctx.globalAlpha = it.alpha;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.translate(it.sx, it.sy);
      ctx.rotate(it.rot);
      ctx.scale(1, it.fl.squash);
      ctx.drawImage(this.sprites.sprites[it.fl.sprite], -it.px / 2, -it.px / 2, it.px, it.px);
    }
    ctx.restore();
  }
}
