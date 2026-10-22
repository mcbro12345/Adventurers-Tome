// ---------- Anime storyboard animations (info-box square) ----------
// Every spell, feature, class option and magic item has its own storyboard in DND.anim: a short script of beats
// ("who does what, what flies, how it lands, what happens to the target") played on a small canvas in the corner of its
// info box, drawn in an anime style: wind-ups, speed lines, smears, impact frames, shockwaves. See ANI.help below for
// the script language. Anything without a script (homebrew, renamed things) gets one built from what it does.
const ANI = (() => {
  const P = Math.PI, TAU = P * 2, W = 100, H = 100, GROUND = 82, LOOP = 3000, CAM = 1.14;
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const E = {
    lin: t => t, in: t => t * t, out: t => 1 - (1 - t) * (1 - t), io: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    back: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    el: t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1,
    snap: t => 1 - Math.pow(1 - t, 4)
  };
  // Deterministic random numbers (a scene looks the same every loop)
  const rng = seed => { let s = (Math.abs(seed | 0) % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const hash = str => [...String(str)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7);
  // ----- Colours -----
  const PAL = {
    fire: ['#ff4d1a', '#ffd23a'], cold: ['#6fd0ff', '#f0fdff'], ice: ['#8fe3ff', '#ffffff'], lightning: ['#9d8cff', '#fff8c4'], thunder: ['#6f8fff', '#e6ecff'],
    acid: ['#7fe33a', '#eaffa8'], poison: ['#3fae3a', '#c4ff6a'], necrotic: ['#7a3fa0', '#d9a3ff'], radiant: ['#ffcf4a', '#ffffff'], force: ['#a86bff', '#f1e4ff'],
    psychic: ['#ff4fc0', '#ffd6f2'], steel: ['#b9c2d0', '#ffffff'], heal: ['#33d677', '#d2ffe0'], abj: ['#5cb8ff', '#e6f6ff'], conj: ['#f0a83a', '#fff1cc'],
    div: ['#ffe08a', '#ffffff'], ench: ['#ff7fc8', '#ffe4f5'], evoc: ['#ff7a3a', '#ffe4b8'], illu: ['#a97dff', '#f1e9ff'], necro: ['#8a50b5', '#e6cbff'],
    trans: ['#3fd1a0', '#d9fff1'], shadow: ['#3a3f5c', '#a3acd4'], gold: ['#e0aa3e', '#fff2c8'], blood: ['#d9362b', '#ffb3a3'], nature: ['#5cbf3a', '#e6ffc4'],
    water: ['#2f8fff', '#c8ecff'], earth: ['#a8743a', '#ecd2a6'], wind: ['#bfe8e0', '#ffffff'], storm: ['#5a6cff', '#e8ecff'], void: ['#26124a', '#b78cff'],
    sun: ['#ff9a1a', '#fff6c8'], moon: ['#b8c6ff', '#ffffff'], star: ['#8ad0ff', '#ffffff'], fey: ['#ff9de0', '#e9ffd4'], infernal: ['#c0161b', '#ffb02e'],
    celestial: ['#ffe9a6', '#ffffff'], arcane: ['#4f7dff', '#e0e8ff'], blood2: ['#8a0f1a', '#ff5a5a'], bone: ['#e8e0c8', '#ffffff'], ink: ['#1c2233', '#8a96b8'],
    rose: ['#ff6b8a', '#ffe0e8'], teal: ['#1fb8b0', '#d4fffb'], lime: ['#b4ff3a', '#f4ffd8'], amber: ['#ffb000', '#fff0b8'], copper: ['#d9844a', '#ffe0c8'],
    silver: ['#cfd6e4', '#ffffff'], jade: ['#28b86b', '#cfffe2'], violet: ['#8a4dff', '#efe4ff'], crimson: ['#e0213f', '#ffc8d2'], azure: ['#2fa8ff', '#e0f4ff'],
    obsidian: ['#2a2238', '#9a86c8'], sand: ['#e3c27a', '#fff6dc'], lava: ['#ff3a00', '#ffcf3a'], frost: ['#bfefff', '#ffffff'], spirit: ['#7ff0e0', '#ffffff'],
    plague: ['#8a9a2a', '#e6f28a'], toxic: ['#9cff2e', '#f0ffcc'], dream: ['#9fa8ff', '#ffe8ff'], chaos: ['#ff3ac8', '#3affe0'], time: ['#d9b85a', '#e8f0ff']
  };
  const col = s => { if (!s) return null; if (PAL[s]) return PAL[s]; if (/^#/.test(s)) { const [a, b] = s.split('/'); return [a, b || '#ffffff']; } return null; };
  const rgba = (hex, a) => { const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const mix = (h1, h2, t) => { const p = h => { const n = parseInt(h.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }; const a = p(h1), b = p(h2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join(''); };

  // ----- Script language -----
  // "@bg:night @tgt:foe @w:sword:fire @pal:fire  charge:fire > orb:fire:big > burst:fire:big + shake"
  //   @key:args    scene setup (no time). bg, tgt (foe/foes/beast/undead/big/dragon/ally/object/none...), w (weapon), pal, cast (caster look)
  //   a > b        beats in order;  a + b   at the same time;  args after ':'; key=value allowed (n=3, at=tgt)
  function parse(src) {
    const setup = {}, beats = [];
    String(src || '').trim().split(/\s*>\s*/).forEach(part => {
      const acts = [];
      part.split(/\s+\+\s+|\s+/).forEach(tok => { tok = tok.trim(); if (!tok) return; if (tok === '+') return;
        const [name, ...rest] = tok.split(':'); const args = [], kv = {};
        rest.forEach(r => { const m = /^(\w+)=(.*)$/.exec(r); if (m) kv[m[1]] = m[2]; else args.push(r); });
        if (name[0] === '@') setup[name.slice(1)] = { args, kv }; else acts.push({ name, args, kv });
      });
      if (acts.length) beats.push(acts);
    });
    return { setup, beats };
  }
  // ----- Verbs registry -----
  const V = {};
  const def = (name, o) => { V[name] = Object.assign({ w: 1 }, o); };
  // ----- Scene -----
  function build(src, seed) {
    const sc = parse(src), r0 = rng(seed || hash(src));
    const S = { src, seed: seed || hash(src), setup: sc.setup, beats: sc.beats, acts: [] };
    const pal = col((sc.setup.pal || {}).args && sc.setup.pal.args[0]);
    // first coloured act decides the main colour if no @pal
    let main = pal; if (!main) for (const b of sc.beats) { for (const a of b) { const c = a.args.map(col).find(Boolean); if (c) { main = c; break; } } if (main) break; }
    S.c = main || PAL.gold;
    // Timeline: beats share 4%..80% of the loop by weight; the rest lets things land and settle before it fades and repeats
    const ws = sc.beats.map(b => Math.max(...b.map(a => +(a.kv.w || (V[a.name] || {}).w || 1))));
    const tot = ws.reduce((a, b) => a + b, 0) || 1, span = sc.beats.length > 4 ? .8 : .76; let t = .04;
    sc.beats.forEach((b, i) => { const d = ws[i] / tot * span; b.forEach(a => S.acts.push(Object.assign({}, a, { t0: t, t1: t + d * (a.kv.d ? +a.kv.d : 1), v: V[a.name], rnd: r0() * 1e6 | 0 }))); t += d; });
    S.unknown = S.acts.filter(a => !a.v).map(a => a.name);
    return S;
  }

  // ----- Drawing helpers -----
  const H_ = {};
  H_.glow = (x, px, py, r, c, a = 1) => { if (r <= 0) return; const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0)); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); };
  H_.dot = (x, px, py, r, c, a = 1) => { if (r <= 0) return; const _g = x.globalAlpha; x.globalAlpha = _g * a; x.fillStyle = c; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); x.globalAlpha = _g; };
  H_.star4 = (x, px, py, r, c, a = 1, rot = 0) => { if (r <= 0) return; x.save(); x.translate(px, py); x.rotate(rot); const _g = x.globalAlpha; x.globalAlpha = _g * a; x.fillStyle = c; x.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .22 : r, an = i * P / 4; x.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } x.closePath(); x.fill(); x.restore(); };
  H_.ring = (x, px, py, r, c, lw = 2, a = 1) => { if (r <= 0) return; const _g = x.globalAlpha; x.globalAlpha = _g * a; x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.arc(px, py, r, 0, TAU); x.stroke(); x.globalAlpha = _g; };
  H_.ell = (x, px, py, rx, ry, c, a = 1, stroke = 0) => { if (rx <= 0 || ry <= 0) return; const _g = x.globalAlpha; x.globalAlpha = _g * a; x.beginPath(); x.ellipse(px, py, rx, ry, 0, 0, TAU); if (stroke) { x.strokeStyle = c; x.lineWidth = stroke; x.stroke(); } else { x.fillStyle = c; x.fill(); } x.globalAlpha = _g; };
  H_.line = (x, x1, y1, x2, y2, c, lw = 1, a = 1) => { const _g = x.globalAlpha; x.globalAlpha = _g * a; x.strokeStyle = c; x.lineWidth = lw; x.lineCap = 'round'; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); x.globalAlpha = _g; };
  // A tapered streak (anime motion smear) from (x1,y1) to (x2,y2): thick at the head, thin at the tail
  H_.streak = (x, x1, y1, x2, y2, c, w, a = 1) => { const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; const _g = x.globalAlpha; x.globalAlpha = _g * a; x.fillStyle = c; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2 + nx * w / 2, y2 + ny * w / 2); x.arc(x2, y2, w / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + P, true); x.lineTo(x1, y1); x.fill(); x.globalAlpha = _g; };
  // Jagged lightning between two points
  H_.bolt = (x, x1, y1, x2, y2, c, lw, jit, r, br = 0) => { const n = Math.max(4, Math.hypot(x2 - x1, y2 - y1) / 6 | 0); const pts = [[x1, y1]];
    for (let i = 1; i < n; i++) { const t = i / n; pts.push([lerp(x1, x2, t) + (r() - .5) * jit, lerp(y1, y2, t) + (r() - .5) * jit]); } pts.push([x2, y2]);
    [[c[0], lw * 2.6, .45], [c[1], lw, 1]].forEach(([cc, w, al]) => { const _g2 = x.globalAlpha; x.globalAlpha = _g2 * al; x.strokeStyle = cc; x.lineWidth = w; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); x.globalAlpha = _g2; });
    if (br) for (let k = 0; k < br; k++) { const p = pts[1 + (r() * (pts.length - 2) | 0)]; H_.bolt(x, p[0], p[1], p[0] + (r() - .3) * 14, p[1] + (r() - .2) * 14, c, lw * .6, jit * .6, r, 0); } };
  // Radial speed lines around (cx,cy) (anime focus lines)
  H_.speed = (x, cx, cy, a, c = '#ffffff', n = 26, r = Math.random, inner = 26) => { x.save(); const _g = x.globalAlpha; x.globalAlpha = _g * a; x.fillStyle = c;
    for (let i = 0; i < n; i++) { const an = r() * TAU, w = .6 + r() * 1.6, r1 = inner + r() * 18, r2 = 90; x.beginPath(); x.moveTo(cx + Math.cos(an) * r2, cy + Math.sin(an) * r2); x.lineTo(cx + Math.cos(an + w * .012) * r1, cy + Math.sin(an + w * .012) * r1); x.lineTo(cx + Math.cos(an - w * .012) * r1, cy + Math.sin(an - w * .012) * r1); x.fill(); }
    x.restore(); };
  // Horizontal speed lines (dash / motion)
  H_.hlines = (x, a, dir = 1, c = '#ffffff', r = Math.random, n = 14, y0 = 20, y1 = 90) => { x.save(); const _g = x.globalAlpha; x.globalAlpha = _g * a; x.fillStyle = c; for (let i = 0; i < n; i++) { const y = lerp(y0, y1, r()), L = 20 + r() * 40, s = r() * 100; x.fillRect(dir > 0 ? s - L : s, y, L, .5 + r() * .8); } x.restore(); };
  // Cartoon smoke puff
  H_.puff = (x, px, py, r, c, a = 1) => { if (r <= 0) return; const _g = x.globalAlpha; x.globalAlpha = _g * a; x.fillStyle = c; x.beginPath(); for (let i = 0; i < 6; i++) { const an = i / 6 * TAU; x.moveTo(px + Math.cos(an) * r * .6 + r * .45, py + Math.sin(an) * r * .6); x.arc(px + Math.cos(an) * r * .6, py + Math.sin(an) * r * .6, r * .45, 0, TAU); } x.arc(px, py, r * .6, 0, TAU); x.fill(); x.globalAlpha = _g; };
  H_.poly = (x, pts, c, a = 1, stroke) => { const _g = x.globalAlpha; x.globalAlpha = _g * a; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); if (stroke) { x.strokeStyle = c; x.lineWidth = stroke; x.stroke(); } else { x.fillStyle = c; x.fill(); } x.globalAlpha = _g; };
  // Rune circle (magic circle) seen at an angle on the ground, or face-on when flat=0
  H_.circle = (x, px, py, r, c, a, rot, flat = .38, r2) => { x.save(); x.translate(px, py); x.scale(1, flat); x.rotate(rot); const _g = x.globalAlpha; x.globalAlpha = _g * a; x.strokeStyle = c[0]; x.shadowColor = c[0]; x.shadowBlur = 6;
    x.lineWidth = 1.6; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.stroke(); x.lineWidth = .8; x.beginPath(); x.arc(0, 0, r * .78, 0, TAU); x.stroke();
    x.strokeStyle = c[1]; x.beginPath(); for (let i = 0; i < 6; i++) { const an = i / 6 * TAU, an2 = (i + 2) / 6 * TAU; x.moveTo(Math.cos(an) * r * .78, Math.sin(an) * r * .78); x.lineTo(Math.cos(an2) * r * .78, Math.sin(an2) * r * .78); } x.stroke();
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; x.fillStyle = c[1]; x.fillRect(Math.cos(an) * r * .89 - .6, Math.sin(an) * r * .89 - .6, 1.2, 1.2); }
    x.restore(); };
  H_.E = E; H_.lerp = lerp; H_.clamp = clamp; H_.rgba = rgba; H_.mix = mix; H_.rng = rng; H_.PAL = PAL; H_.col = col;

  // ----- Figures -----
  // Pose = [lean, [backArm shoulder, elbow], [frontArm shoulder, elbow], [backLeg hip, knee], [frontLeg hip, knee], hipDrop]
  // Angles in degrees from straight down, positive = toward where the figure faces.
  const POSE = {
    idle: [0, [-8, 12], [10, 14], [-8, 4], [8, 6], 0], stand: [0, [-6, 6], [6, 6], [-6, 2], [6, 2], 0],
    cast: [8, [50, 30], [86, 4], [-16, 6], [16, 12], 1], raise: [2, [20, 20], [172, 6], [-10, 4], [10, 6], 0], point: [6, [-14, 22], [90, 0], [-12, 4], [12, 6], 0],
    thrust: [16, [-30, 30], [92, 0], [-34, 4], [34, 44], 3], punch: [12, [-30, 100], [92, 0], [-26, 6], [26, 30], 2], kick: [-10, [40, 60], [20, 80], [-14, 10], [92, 0], 0],
    kneel: [6, [10, 20], [30, 30], [-20, 100], [80, 90], 8], pray: [4, [40, 112], [44, 118], [-20, 100], [80, 90], 8], leap: [0, [150, 20], [160, 10], [30, 100], [50, 110], -2],
    crouch: [14, [20, 60], [40, 50], [-44, 90], [46, 96], 7], bow: [4, [94, 160], [92, 0], [-16, 6], [16, 8], 1], throw: [-14, [-20, 30], [150, -10], [-20, 6], [20, 16], 0],
    throw2: [18, [-40, 30], [70, 0], [-28, 6], [28, 30], 2], drink: [-6, [-10, 20], [130, 130], [-6, 4], [6, 6], 0], read: [4, [50, 80], [56, 84], [-8, 4], [8, 6], 0],
    play: [2, [50, 90], [70, 70], [-8, 4], [8, 6], 0], block: [-4, [20, 60], [70, 110], [-18, 6], [18, 14], 2], dodge: [-22, [60, 40], [-30, 60], [-30, 10], [20, 40], 3],
    roar: [-12, [118, 30], [124, 26], [-16, 6], [16, 8], 0], float: [0, [70, 10], [74, 6], [6, 22], [-4, 26], -4], open: [-2, [100, 6], [104, 4], [-10, 4], [10, 6], 0],
    clap: [4, [76, 70], [80, 66], [-10, 4], [10, 6], 0], stomp: [4, [30, 40], [40, 40], [-10, 4], [60, 60], 0], slam: [20, [150, 0], [156, 0], [-20, 6], [20, 30], 3],
    salute: [0, [-6, 6], [120, 150], [-6, 2], [6, 2], 0], sneak: [22, [-30, 70], [20, 80], [-30, 60], [40, 70], 6], run: [14, [-50, 70], [60, 90], [-40, 30], [50, 70], 1],
    wave: [0, [-6, 6], [150, 40], [-6, 2], [6, 2], 0], guard: [-2, [40, 100], [70, 100], [-18, 6], [18, 10], 2], bowdown: [30, [10, 0], [14, 0], [-6, 4], [6, 6], 0],
    sit: [0, [20, 70], [30, 70], [70, 90], [80, 90], 10], fall: [-70, [120, 20], [140, 30], [10, 10], [40, 20], 6], hurt: [-14, [-30, 40], [30, 60], [-12, 4], [16, 10], 0],
    swing0: [-6, [-20, 30], [190, 30], [-16, 6], [16, 14], 1], swing1: [18, [-30, 40], [70, 0], [-28, 6], [28, 34], 3], spin: [0, [96, 0], [96, 0], [-14, 6], [14, 8], 1],
    shrug: [0, [30, 120], [34, 120], [-6, 2], [6, 2], 0], think: [0, [-6, 6], [60, 150], [-6, 2], [6, 2], 0], dance: [6, [140, 40], [40, 80], [-20, 10], [40, 60], 0],
    hold: [0, [40, 60], [150, 10], [-6, 4], [6, 4], 0], push: [16, [80, 20], [84, 10], [-34, 4], [30, 30], 2], pull: [-18, [70, 70], [76, 70], [-24, 6], [34, 14], 2]
  };
  const LOOKS = {
    hero: { body: '#3b5b9a', body2: '#26406f', skin: '#f2d2b0', hair: '#2b2235', cape: '#b33a3a', cape2: '#7a2222', eye: '#ffffff', trim: '#e0b04a' },
    mage: { body: '#4a3a8a', body2: '#2f2460', skin: '#f2d2b0', hair: '#e8e8f0', cape: '#2f2460', cape2: '#1d163f', eye: '#ffffff', trim: '#e0b04a', hat: 1 },
    cleric: { body: '#e8e4d8', body2: '#bdb6a2', skin: '#e8c29a', hair: '#8a5a2a', cape: '#d9b45a', cape2: '#a8832e', eye: '#ffffff', trim: '#d9b45a' },
    rogue: { body: '#2d3340', body2: '#1b1f28', skin: '#e8c29a', hair: '#1a1a1a', cape: '#3a4252', cape2: '#232833', eye: '#ffffff', trim: '#8a96aa', hood: 1 },
    druid: { body: '#4f7a3a', body2: '#34552a', skin: '#e0b48a', hair: '#7a4a2a', cape: '#6b4a2a', cape2: '#4a321c', eye: '#ffffff', trim: '#c9e08a' },
    monk: { body: '#e08a2a', body2: '#a85f18', skin: '#e0b48a', hair: '#2a1a12', cape: null, eye: '#ffffff', trim: '#7a3a12' },
    knight: { body: '#aab4c4', body2: '#77839a', skin: '#e8c29a', hair: '#5a4a3a', cape: '#2f5aa8', cape2: '#1f3d75', eye: '#ffffff', trim: '#e0b04a', helm: 1 },
    bard: { body: '#b33a7a', body2: '#7a2452', skin: '#f2d2b0', hair: '#e0a040', cape: '#3a8a8a', cape2: '#245a5a', eye: '#ffffff', trim: '#ffe08a', hat2: 1 },
    warlock: { body: '#2a1f3a', body2: '#160f22', skin: '#d8c8e8', hair: '#6a2a8a', cape: '#3a1450', cape2: '#220a30', eye: '#d9a3ff', trim: '#8a4dff', hood: 1 },
    barb: { body: '#7a4a2a', body2: '#55301a', skin: '#d9a07a', hair: '#c0402a', cape: '#5a5a5a', cape2: '#3a3a3a', eye: '#ffffff', trim: '#c9c9c9', big: 1 },
    ranger: { body: '#3a5a3a', body2: '#264026', skin: '#e8c29a', hair: '#4a3a2a', cape: '#2f4a2a', cape2: '#1d301a', eye: '#ffffff', trim: '#a8743a', hood: 1 },
    foe: { body: '#4a5168', body2: '#2f3446', skin: '#7a8296', hair: '#1c2030', cape: '#3a2030', cape2: '#24121c', eye: '#ff4a4a', trim: '#7a2a3a', hood: 1, foe: 1 },
    ally: { body: '#2f8a7a', body2: '#1f5f54', skin: '#f2d2b0', hair: '#c08a3a', cape: '#e0b04a', cape2: '#a8832e', eye: '#ffffff', trim: '#ffffff' },
    undead: { body: '#cfc8b0', body2: '#9a9378', skin: '#e8e0c8', hair: null, cape: '#3a3446', cape2: '#24202e', eye: '#7ff0e0', trim: '#5a5468', skull: 1, foe: 1 }
  };
  // Draw something on its own layer so a colour tint covers just that thing (not the background behind it)
  const LAYERS = []; let DEPTH = 0;
  function tinted(x, tint, a, fn) {
    if (!tint || !(a > 0)) return fn(x);
    const cv = x.canvas; const LAYER = LAYERS[DEPTH] || (LAYERS[DEPTH] = document.createElement('canvas')); if (LAYER.width !== cv.width || LAYER.height !== cv.height) { LAYER.width = cv.width; LAYER.height = cv.height; }
    DEPTH++; try { return tintOn(x, LAYER, tint, a, fn); } finally { DEPTH--; }
  }
  function tintOn(x, LAYER, tint, a, fn) {
    const l = LAYER.getContext('2d'); l.setTransform(1, 0, 0, 1, 0, 0); l.clearRect(0, 0, LAYER.width, LAYER.height); l.setTransform(x.getTransform()); l.globalAlpha = 1;
    const r = fn(l); l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-atop'; l.fillStyle = rgba(tint, Math.min(1, a)); l.fillRect(0, 0, LAYER.width, LAYER.height); l.globalCompositeOperation = 'source-over';
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(LAYER, 0, 0); x.restore(); return r;
  }
  // Where a joint ends up: start (x,y), angle a (deg from down toward facing f), length l
  const limb = (x0, y0, a, l, f) => [x0 + Math.sin(a * P / 180) * l * f, y0 + Math.cos(a * P / 180) * l];
  // Draw a person. st: { x, y, s, f, pose(name|array), look, alpha, tint, tintA, rot, dx, dy, armF, armB (override angles), weapon }
  function figure(x, st, T) { if (st.tint && st.tintA > 0 && !st._inLayer) { const st2 = Object.assign({}, st, { _inLayer: 1 }); return tinted(x, st.tint, st.tintA, l => figure(l, st2, T)); }
    const L = LOOKS[st.look] || LOOKS.hero, f = st.f || 1, s = (st.s || 1) * (L.big ? 1.12 : 1);
    const pz = Array.isArray(st.pose) ? st.pose : (POSE[st.pose] || POSE.idle);
    const ps = st.blend ? pz.map((v, i) => Array.isArray(v) ? v.map((q, j) => lerp(q, (st.blend[0][i] || [])[j] ?? q, st.blend[1])) : lerp(v, st.blend[0][i] ?? v, st.blend[1])) : pz;
    const [lean, aB0, aF0, lB, lF, drop] = ps, aB = st.armB || aB0, aF = st.armF || aF0;
    x.save(); x.translate(st.x + (st.dx || 0), st.y + (st.dy || 0)); if (st.rot) x.rotate(st.rot); x.scale(s, s); x.globalAlpha *= st.alpha == null ? 1 : st.alpha;
    const ol = st.outline || '#0d1018', lw = .9;
    const hipY = -15 + (drop || 0), sh = [Math.sin(lean * P / 180) * 10 * f, hipY - 10 + Math.abs(Math.sin(lean * P / 180)) * 1.2], hip = [0, hipY];
    const breathe = Math.sin((T || 0) / 380) * .35;
    sh[1] += breathe;
    const leg = (a, k, front) => { const kn = limb(hip[0] + (front ? 1.2 : -1.2) * f, hip[1], a[0], 7.4, f), ft = limb(kn[0], kn[1], a[0] - a[1], 7.4, f);
      x.strokeStyle = ol; x.lineWidth = 4.6; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(hip[0], hip[1]); x.lineTo(kn[0], kn[1]); x.lineTo(ft[0], ft[1]); x.stroke();
      x.strokeStyle = front ? L.body2 : mix(L.body2, '#000000', .3); x.lineWidth = 3.2; x.beginPath(); x.moveTo(hip[0], hip[1]); x.lineTo(kn[0], kn[1]); x.lineTo(ft[0], ft[1]); x.stroke();
      x.fillStyle = ol; x.beginPath(); x.ellipse(ft[0] + 1.2 * f, ft[1] + .3, 2.2, 1.2, 0, 0, TAU); x.fill(); return ft; };
    const arm = (a, front) => { const el = limb(sh[0], sh[1], a[0], 6.2, f), hd = limb(el[0], el[1], a[0] + a[1], 6, f);
      x.strokeStyle = ol; x.lineWidth = 4.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(sh[0], sh[1]); x.lineTo(el[0], el[1]); x.lineTo(hd[0], hd[1]); x.stroke();
      x.strokeStyle = front ? L.body : mix(L.body, '#000000', .3); x.lineWidth = 2.8; x.beginPath(); x.moveTo(sh[0], sh[1]); x.lineTo(el[0], el[1]); x.stroke();
      x.strokeStyle = front ? L.skin : mix(L.skin, '#000000', .25); x.beginPath(); x.moveTo(el[0] + (hd[0] - el[0]) * .5, el[1] + (hd[1] - el[1]) * .5); x.lineTo(hd[0], hd[1]); x.stroke();
      x.fillStyle = front ? L.skin : mix(L.skin, '#000000', .25); x.strokeStyle = ol; x.lineWidth = .8; x.beginPath(); x.arc(hd[0], hd[1], 1.6, 0, TAU); x.fill(); x.stroke();
      return { el, hd, ang: a[0] + a[1] }; };
    // cape behind
    if (L.cape) { const flow = Math.sin((T || 0) / 260 + (st.x || 0)) * 1.6 + (st.wind || 0);
      x.fillStyle = L.cape2; x.strokeStyle = ol; x.lineWidth = lw; x.beginPath(); x.moveTo(sh[0] - 2 * f, sh[1] - .5); x.quadraticCurveTo(sh[0] - 7 * f - flow * f, hipY + 2, -6 * f - flow * 1.6 * f, hipY + 9 + Math.abs(flow) * .4);
      x.lineTo(-1 * f - flow * f, hipY + 8); x.lineTo(sh[0] + 1.5 * f, sh[1] + 1); x.closePath(); x.fill(); x.stroke(); }
    const bArm = arm(aB, false); const bFt = leg(lB, 0, false); const fFt = leg(lF, 0, true);
    // torso (cel shaded: light front half, dark back half)
    const tw = L.big ? 4.6 : 3.8;
    x.lineJoin = 'round'; x.strokeStyle = ol; x.lineWidth = lw;
    x.fillStyle = L.body; x.beginPath(); x.moveTo(sh[0] - tw * f, sh[1]); x.lineTo(sh[0] + tw * f, sh[1]); x.lineTo(hip[0] + 3.2 * f, hip[1] + 1.6); x.lineTo(hip[0] - 3.2 * f, hip[1] + 1.6); x.closePath(); x.fill();
    x.fillStyle = L.body2; x.beginPath(); x.moveTo(sh[0] - tw * f, sh[1]); x.lineTo(sh[0] - .4 * f, sh[1]); x.lineTo(hip[0] - .2 * f, hip[1] + 1.6); x.lineTo(hip[0] - 3.2 * f, hip[1] + 1.6); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(sh[0] - tw * f, sh[1]); x.lineTo(sh[0] + tw * f, sh[1]); x.lineTo(hip[0] + 3.2 * f, hip[1] + 1.6); x.lineTo(hip[0] - 3.2 * f, hip[1] + 1.6); x.closePath(); x.stroke();
    x.strokeStyle = L.trim; x.lineWidth = 1; x.beginPath(); x.moveTo(hip[0] - 3.2 * f, hip[1]); x.lineTo(hip[0] + 3.2 * f, hip[1]); x.stroke();
    // head
    const hx = sh[0] + Math.sin(lean * P / 180) * 2.2 * f, hy = sh[1] - 4.6;
    if (L.skull) { x.fillStyle = L.skin; x.strokeStyle = ol; x.lineWidth = lw; x.beginPath(); x.arc(hx, hy, 3.9, 0, TAU); x.fill(); x.stroke(); x.fillStyle = '#14101c'; x.beginPath(); x.arc(hx + 1.2 * f, hy - .2, 1.1, 0, TAU); x.arc(hx - .9 * f, hy - .2, 1.1, 0, TAU); x.fill(); H_.dot(x, hx + 1.2 * f, hy - .2, .5, L.eye); H_.dot(x, hx - .9 * f, hy - .2, .5, L.eye); x.fillStyle = '#14101c'; x.fillRect(hx - 1, hy + 2, 2.4, .8); }
    else {
      x.fillStyle = L.skin; x.strokeStyle = ol; x.lineWidth = lw; x.beginPath(); x.arc(hx, hy, 3.9, 0, TAU); x.fill(); x.stroke();
      if (L.hood) { x.fillStyle = L.cape || L.body2; x.beginPath(); x.arc(hx - .4 * f, hy - .4, 4.7, P * (f > 0 ? .62 : -.62) + (f > 0 ? 0 : P) - P, P * (f > 0 ? .62 : -.62) + (f > 0 ? 0 : P) + P * .55); x.lineTo(hx - 4 * f, hy + 3.6); x.closePath(); x.fill(); x.stroke(); }
      else if (L.helm) { x.fillStyle = L.body; x.beginPath(); x.arc(hx, hy - .6, 4.3, P, TAU); x.lineTo(hx + 4.3, hy + 1); x.lineTo(hx - 4.3, hy + 1); x.closePath(); x.fill(); x.stroke(); x.fillStyle = L.trim; x.fillRect(hx - .6, hy - 5, 1.2, 4); }
      else if (L.hair) { // spiky anime hair
        x.fillStyle = L.hair; x.beginPath(); x.moveTo(hx - 4.3 * f, hy + 1.5); const sp = [[-4.8, -2.5], [-3.6, -5.6], [-1.6, -4.4], [0, -7], [1.4, -4.6], [3.6, -6.2], [4.2, -2.6], [4.6, -.6]];
        sp.forEach(([a, b]) => x.lineTo(hx + a * f, hy + b)); x.quadraticCurveTo(hx + 2 * f, hy - 2.6, hx - .6 * f, hy - 1.6); x.lineTo(hx - 2.6 * f, hy + 2.4); x.closePath(); x.fill(); x.stroke(); }
      if (L.hat) { x.fillStyle = L.body; x.beginPath(); x.moveTo(hx - 6 * f, hy - 2.4); x.lineTo(hx + 6 * f, hy - 2.4); x.lineTo(hx + 1 * f, hy - 4); x.lineTo(hx - 3 * f, hy - 13); x.lineTo(hx - 2 * f, hy - 4); x.closePath(); x.fill(); x.stroke(); x.fillStyle = L.trim; x.fillRect(hx - 2.5, hy - 4, 5, 1.1); }
      if (L.hat2) { x.fillStyle = L.cape; x.beginPath(); x.ellipse(hx, hy - 3, 5.6, 1.4, 0, 0, TAU); x.fill(); x.stroke(); x.beginPath(); x.ellipse(hx, hy - 4.4, 3, 2, 0, P, TAU); x.fill(); x.stroke(); x.strokeStyle = L.trim; x.beginPath(); x.moveTo(hx - 1 * f, hy - 5); x.quadraticCurveTo(hx - 5 * f, hy - 10, hx - 7 * f, hy - 7); x.stroke(); }
      // anime eye: tall dark eye with a white glint
      const ex = hx + 1.7 * f, ey = hy + .1; x.fillStyle = L.foe ? L.eye : '#1a1420'; x.beginPath(); x.ellipse(ex, ey, .75, 1.25, 0, 0, TAU); x.fill();
      if (L.foe) H_.glow(x, ex, ey, 3, L.eye, .7); else H_.dot(x, ex + .3 * f, ey - .5, .35, '#ffffff');
      if (st.mood === 'angry') H_.line(x, ex - 1 * f, ey - 2, ex + 1.2 * f, ey - 1.2, ol, .8);
    }
    // front arm last (with weapon in hand)
    const fArm = arm(aF, true);
    if (st.weapon && st.drawWeapon) st.drawWeapon(x, fArm.hd[0], fArm.hd[1], st.weaponAng != null ? st.weaponAng : fArm.ang, st, f);
    x.restore();
    // world positions of hands and chest for effects
    const tr = (p) => [st.x + (st.dx || 0) + p[0] * s, st.y + (st.dy || 0) + p[1] * s];
    return { hand: tr(fArm.hd), hand2: tr(bArm.hd), chest: tr([sh[0] * .6, sh[1] + 3]), head: tr([hx, hy]), feet: [st.x + (st.dx || 0), st.y + (st.dy || 0)], s };
  }
  // A drawn creature silhouette by kind (beast, wolf, bear, dragon, owl, cat, horse, snake, spider, bat, eagle, golem, elemental, spirit, imp, ooze, crate, door, tree...)
  const CREATURE = {};
  function creature(x, kind, st, T) { if (st.tint && st.tintA > 0 && !st._inLayer) { const st2 = Object.assign({}, st, { _inLayer: 1 }); return tinted(x, st.tint, st.tintA, l => creature(l, kind, st2, T)); }
    const fn = CREATURE[kind] || CREATURE.wolf; x.save(); x.translate(st.x + (st.dx || 0), st.y + (st.dy || 0)); if (st.rot) x.rotate(st.rot); const s = st.s || 1; x.scale(s * (st.f || 1), s); x.globalAlpha *= st.alpha == null ? 1 : st.alpha;
    x.lineJoin = 'round'; x.lineCap = 'round'; x.strokeStyle = '#0d1018'; x.lineWidth = .9;
    const r = fn(x, st, T || 0) || { h: 20 };
    x.restore(); const h = (r.h || 20) * s; return { chest: [st.x + (st.dx || 0), st.y + (st.dy || 0) - h * .55], head: [st.x + (st.dx || 0) + (r.hx || 6) * s * (st.f || 1), st.y + (st.dy || 0) - h * .9], hand: [st.x + (st.dx || 0) + 8 * s * (st.f || 1), st.y + (st.dy || 0) - h * .6], feet: [st.x + (st.dx || 0), st.y + (st.dy || 0)], s };
  }
  // ----- Props (icons) registry: drawn centred at 0,0 at size ~10 -----
  const ICON = {};

  // ----- Backgrounds -----
  const BG = {};
  function drawBg(x, S, T) {
    const b = (S.setup.bg && S.setup.bg.args[0]) || 'dusk';
    const fn = BG[b] || BG.dusk; fn(x, S, T, rng(S.seed));
  }

  // ----- Rendering one frame -----
  const TGT = { foe: ['foe'], foes: ['foe', 'foe', 'foe'], two: ['foe', 'foe'], undead: ['undead'], undeads: ['undead', 'undead', 'undead'], ally: ['ally'], allies: ['ally', 'ally', 'ally'], none: [], self: [] };
  function actorsFor(S) {
    const cs = S.setup.cast, look = (cs && cs.args[0]) || 'hero';
    const caster = { kind: 'person', x: 24, y: GROUND, f: 1, look, pose: 'idle', s: 1 };
    if (cs && cs.args[1]) caster.kind = cs.args[1];
    const tg = S.setup.tgt ? S.setup.tgt.args : ['foe'], k0 = tg[0] || 'foe';
    let list = TGT[k0] ? TGT[k0].slice() : [k0]; const n = +(S.setup.tgt && S.setup.tgt.kv.n) || 0; if (n) list = Array(n).fill(list[0] || 'foe');
    const xs = list.length === 1 ? [74] : list.length === 2 ? [68, 84] : list.length === 3 ? [64, 78, 90] : list.map((_, i) => 60 + i * (34 / Math.max(1, list.length - 1)));
    const targets = list.map((k, i) => { const isP = LOOKS[k] && !CREATURE[k]; const d = list.length > 1 ? (i % 2 ? .5 : 0) : 0;
      return { kind: isP ? 'person' : k, look: isP ? k : null, x: xs[i], y: GROUND - d * 6, s: (1 - d * .18) * (k === 'big' ? 1.3 : 1), f: -1, pose: 'idle', depth: d }; });
    if (tg[1]) targets.forEach(t => { if (LOOKS[tg[1]]) t.look = tg[1]; });
    return { caster, targets };
  }
  function frame(x, S, tms) {
    const T = tms, ph = (tms % LOOP) / LOOP;
    const A = actorsFor(S); S.A = A; S.T = T; S.ph = ph; S.shake = 0; S.flash = 0; S.invert = 0; S.dark = 0; S.zoom = 1; S.zx = 50; S.zy = 60; S.hide = {};
    const w = S.setup.w; if (w) { A.caster.weapon = w.args[0]; A.caster.wcol = col(w.args[1]) || null; A.caster.drawWeapon = WEAPON_DRAW; }
    // which acts are active now: p = local progress (0..1), u = unclamped
    const live = [];
    // a 'cure' act ends conditions that started before it (they fade out as it lands)
    let cureAt = 2; for (const a of S.acts) if (a.name === 'cure' && ph >= a.t0) cureAt = Math.min(cureAt, a.t0 + (a.t1 - a.t0) * .5);
    for (const a of S.acts) { if (!a.v) continue; let u = (ph - a.t0) / Math.max(.001, a.t1 - a.t0); if (u < 0) continue;
      if (a.v.cond && a.t0 < cureAt && ph > cureAt) { const f = (ph - cureAt) / .08; if (f >= 1) continue; a._fade = 1 - f; } else a._fade = 1; if (!a.v.keep && !a.kv.keep && u > 1 + (a.v.tail != null ? a.v.tail : .6)) continue; live.push([a, clamp(u) * (a._fade == null ? 1 : a._fade), u]); }
    // 1) acts change actors (poses, knockback, tint...)
    live.forEach(([a, p, u]) => a.v.mod && a.v.mod(S, p, a, u));
    // global fade at the loop's end
    const fade = ph > .93 ? clamp((ph - .93) / .05) : ph < .02 ? 1 - ph / .02 : 0;
    x.save();
    // camera: a little closer than the full stage so people read at the small size; acts can zoom further
    x.translate(50, 66); x.scale(CAM, CAM); x.translate(-50, -66);
    if (S.zoom !== 1) { x.translate(S.zx, S.zy); x.scale(S.zoom, S.zoom); x.translate(-S.zx, -S.zy); }
    if (S.shake) { const r = rng(T / 30 | 0); x.translate((r() - .5) * S.shake * 2, (r() - .5) * S.shake * 2); }
    drawBg(x, S, T);
    if (S.dark) { x.fillStyle = `rgba(4,4,12,${S.dark})`; x.fillRect(-10, -10, W + 20, H + 20); }
    live.forEach(([a, p, u]) => a.v.back && (x.save(), a.v.back(x, S, p, a, u, H_), x.restore()));
    // ground shadow + actors
    const draw = (act, who) => { if (S.hide[who]) return null; H_.glow(x, act.x + (act.dx || 0), act.y + (act.dy || 0) - 16 * (act.s || 1), 20 * (act.s || 1), '#c8d4ff', .09 * (act.alpha == null ? 1 : act.alpha)); H_.ell(x, act.x + (act.dx || 0) * .6, act.y + 1, 7 * (act.s || 1), 1.6, '#000000', .35 * (act.alpha == null ? 1 : act.alpha));
      return act.kind === 'person' ? figure(x, act, T) : creature(x, act.kind, act, T); };
    const tPts = A.targets.slice().sort((a, b) => b.depth - a.depth).map(t => [t, draw(t, 't' + A.targets.indexOf(t))]);
    A.targets.forEach(t => { const m = tPts.find(q => q[0] === t); t.pt = m && m[1]; });
    A.caster.pt = draw(A.caster, 'c');
    if (!A.caster.pt) A.caster.pt = { hand: [32, 64], hand2: [20, 64], chest: [24, 64], head: [24, 52], feet: [24, GROUND], s: 1 };
    A.targets.forEach(t => { if (!t.pt) t.pt = { hand: [t.x - 8, 64], chest: [t.x, 64], head: [t.x, 52], feet: [t.x, t.y], s: 1 }; });
    live.forEach(([a, p, u]) => a.v.front && (x.save(), a.v.front(x, S, p, a, u, H_), x.restore()));
    live.forEach(([a, p, u]) => a.v.over && (x.save(), a.v.over(x, S, p, a, u, H_), x.restore()));
    x.restore();
    { const g = x.createRadialGradient(50, 50, 34, 50, 50, 76); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.36)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    if (S.invert > 0) { x.save(); x.globalCompositeOperation = 'difference'; x.globalAlpha = clamp(S.invert); x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); x.restore(); }
    if (S.flash > 0) { x.fillStyle = `rgba(255,255,255,${clamp(S.flash)})`; x.fillRect(0, 0, W, H); }
    if (fade > 0) { x.fillStyle = `rgba(8,10,16,${fade})`; x.fillRect(0, 0, W, H); }
  }
  // Points helpers for verbs
  const P_ = {
    hand: S => S.A.caster.pt.hand, chest: S => S.A.caster.pt.chest, head: S => S.A.caster.pt.head,
    tgt: (S, i = 0) => { const t = S.A.targets[i] || S.A.targets[0]; return t ? (t.pt ? t.pt.chest : [t.x + (t.dx || 0), t.y + (t.dy || 0) - 18 * (t.s || 1)]) : [74, 64]; },
    thead: (S, i = 0) => { const t = S.A.targets[i] || S.A.targets[0]; return t ? (t.pt ? t.pt.head : [t.x + (t.dx || 0), t.y + (t.dy || 0) - 30 * (t.s || 1)]) : [74, 52]; },
    tfeet: (S, i = 0) => { const t = S.A.targets[i] || S.A.targets[0]; return t ? [t.x + (t.dx || 0), t.y] : [74, GROUND]; },
    area: S => { const ts = S.A.targets; if (!ts.length) return [72, GROUND]; return [ts.reduce((a, t) => a + t.x, 0) / ts.length, GROUND]; }
  };
  // Where an act aims: at=tgt (default), self, sky, ground, all, mid, ally
  const aim = (S, a, def = 'tgt') => { const at = a.kv.at || def; if (at === 'self') return P_.chest(S); if (at === 'sky') return [50, 14]; if (at === 'mid') return [50, 60]; if (at === 'ground') return P_.area(S); if (/^t\d$/.test(at)) return P_.tgt(S, +at[1]); return S.A.targets.length ? P_.tgt(S) : [74, 62]; };
  // Apply a function to the acted-on actors (targets by default; at=self -> caster; at=all -> everyone)
  const each = (S, a, fn, def = 'tgt') => { const at = a.kv.at || def; if (at === 'self') return fn(S.A.caster, 0); if (at === 'all') { fn(S.A.caster, 0); S.A.targets.forEach(fn); return; } if (/^t\d$/.test(at)) { const t = S.A.targets[+at[1]]; if (t) fn(t, 0); return; } if (at === 'first') { if (S.A.targets[0]) fn(S.A.targets[0], 0); return; } S.A.targets.forEach(fn); };
  const C2 = (S, a, i = 0) => { for (const g of a.args) { const c = col(g); if (c) return c; } return S.c; };
  let WEAPON_DRAW = () => {};

  // ----- Player for the info box -----
  let RAF = 0;
  function play(cv, src, seed, alive) {
    const x = cv.getContext('2d'), S2 = cv.width / W; let S; try { S = build(src, seed); } catch (e) { S = build('@tgt:none sparkle:gold', 7); } const t0 = performance.now();
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ok = alive || (() => cv.isConnected);
    const step = now => { if (!ok()) return; x.setTransform(S2, 0, 0, S2, 0, 0); x.clearRect(0, 0, W, H); try { frame(x, S, reduce ? LOOP * .62 : now - t0); } catch (e) { return; } if (!reduce) RAF = requestAnimationFrame(step); };
    cancelAnimationFrame(RAF); step(t0); return S;
  }
  return { tinted, parse, build, frame, play, def, V, ICON, BG, CREATURE, POSE, LOOKS, PAL, H: H_, P: P_, aim, each, C2, figure, creature, rng, hash, E, col, rgba, mix, clamp, lerp, W, H0: H, GROUND, LOOP, setWeapon: f => { WEAPON_DRAW = f; } };
})();
