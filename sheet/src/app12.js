// ---------- Tooltip vignettes ----------
// Every spell, feature, attack and magic item's info box gets a small looping animation in its corner — a sketch of
// what it might look like: a fire bolt streaking at a target, a cone of frost, a shimmering ward, a healing glow, a
// blade slash. They're drawn live on a canvas from what the thing does (its damage type, shape, school and wording),
// so every entry has one, homebrew included.
const VFX_COL = {
  fire: ['#ff5a1f', '#ffd23a'], cold: ['#7fd6ff', '#eafcff'], lightning: ['#a99bff', '#fff7c2'], thunder: ['#7f9cff', '#dfe6ff'],
  acid: ['#7fe33a', '#e2ff9e'], poison: ['#4fb33a', '#b6ff6a'], necrotic: ['#7a3fa0', '#d59bff'], radiant: ['#ffd76a', '#ffffff'],
  force: ['#b77bff', '#efe0ff'], psychic: ['#ff5fc8', '#ffd1f1'], bludgeoning: ['#c9ced8', '#ffffff'], piercing: ['#c9ced8', '#ffffff'],
  slashing: ['#c9ced8', '#ffffff'], heal: ['#3fd67a', '#c9ffd9'], abj: ['#6cc3ff', '#e2f4ff'], conj: ['#f0b44a', '#fff0c9'],
  div: ['#ffe39a', '#ffffff'], ench: ['#ff8fd0', '#ffe0f3'], evoc: ['#ff8a4a', '#ffe0b0'], illu: ['#b48cff', '#efe6ff'],
  necro: ['#8f5bb5', '#e2c6ff'], trans: ['#4fd6a6', '#d6fff0'], shadow: ['#4a4f6a', '#9aa3c7'], gold: ['#e0b04a', '#fff1c4'], blood: ['#e0453a', '#ffb0a0']
};
const VFX_SCHOOL = { abjuration: 'abj', conjuration: 'conj', divination: 'div', enchantment: 'ench', evocation: 'evoc', illusion: 'illu', necromancy: 'necro', transmutation: 'trans' };
const VFX_SCH3 = { abj: 'abj', con: 'conj', div: 'div', enc: 'ench', evo: 'evoc', ill: 'illu', nec: 'necro', tra: 'trans' };
const vfxType = t => { const m = String(t || '').toLowerCase().match(/\b(fire|cold|lightning|thunder|acid|poison|necrotic|radiant|force|psychic|bludgeoning|piercing|slashing)\b/); return m ? m[1] : ''; };
// Hand-picked vignettes: every built-in spell, feature, trait, feat, class option and magic item has its own entry in
// DND.vfx ("motif colour"). The guesser below is only the fallback for homebrew and renamed things.
function vfxHand(sec, ...names) {
  const tb = (DND.vfx || {})[sec]; if (!tb) return null;
  for (const raw of names) { if (!raw) continue; const n = String(raw).trim();
    const tries = [n, n.replace(/\s*\([^)]*\)\s*$/, ''), n.replace(/^[^:]+:\s*/, ''), n.replace(/^[^:]+:\s*/, '').replace(/\s*\([^)]*\)\s*$/, ''), n.replace(/\s*[+-]\d+$/, '')];
    for (const k of tries) { const v = tb[k]; if (v) { const [motif, c] = v.split(' '); return { motif, c: VFX_COL[c] || VFX_COL.gold, seed: [...n].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7) }; } } }
  return null;
}
// A 'full' text key (sp:Fireball, item:Bag of Holding, pick:invocation:Agonizing Blast, cleric:life:Disciple of Life).
function vfxForKey(fk) { fk = String(fk || ''); let m;
  if ((m = /^sp:(.+)$/.exec(fk))) return vfxHand('sp', m[1]);
  if ((m = /^item:(.+)$/.exec(fk))) return vfxHand('mi', m[1]);
  if ((m = /^pick:(\w+):(.+)$/.exec(fk))) return vfxHand('op', m[1] + ':' + m[2]) || vfxHand('f', m[2]);
  const last = fk.replace(/^.*:/, ''); return vfxHand('f', last) || vfxHand('sp', last) || vfxHand('mi', last);
}
// Decide what to draw from a name, the rules text and a few hints.
function vfxPick(name, text, o = {}) {
  const T = (name + ' ' + (text || '')).toLowerCase(), N0 = String(name || '').toLowerCase();
  const dmg = o.type || vfxType(T), sch = o.school ? (VFX_SCHOOL[String(o.school).toLowerCase()] || VFX_SCH3[String(o.school).toLowerCase().slice(0, 3)] || '') : '';
  const col = dmg ? VFX_COL[dmg] : null, has = re => re.test(T), nm = re => re.test(N0);
  const pick = (motif, c) => ({ motif, c: c || col || VFX_COL[sch] || VFX_COL.gold, seed: [...String(name)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7) });
  if (o.heal || nm(/\b(cure|heal|healing|regenerat|revivif|restor|aid|lay on hands|second wind|song of rest)\b/) || (has(/\bregains? (a number of |\d+d?\d* )?hit points\b|\bregain hit points\b/) && !dmg)) return pick('heal', VFX_COL.heal);
  if (nm(/elixir|potion|philter|alchemical/)) return pick('morph', VFX_COL.trans);
  if (nm(/teleport|misty step|dimension door|blink|step\b|thunder step|far step|fey step|shadow step|translocat/)) return pick('teleport', col || VFX_COL.conj);
  if (nm(/rage|frenzy|berserk/)) return pick('rage', VFX_COL.blood);
  if (nm(/breath/) ) return pick('cone', col || VFX_COL.fire);
  if (nm(/\b(unarmed|fist|punch|martial arts|flurry of blows)\b/)) return pick('punch', col || VFX_COL.bludgeoning);
  if (o.weapon === 'ranged' || nm(/\b(bow|crossbow|sling|dart|javelin|arrow|shot|gun|pistol|rifle|musket|blowgun|barrel)\b/)) return pick('arrow', col || VFX_COL.piercing);
  if (o.weapon === 'melee' || nm(/\b(sword|axe|dagger|hammer|mace|blade|scimitar|rapier|spear|club|flail|glaive|halberd|whip|maul|pike|trident|staff|quarterstaff|unarmed|fist|claw|bite|strike|smite|flurry)\b/)) return pick('slash', col || VFX_COL.slashing);
  if (nm(/haste|dash|expeditious|speed|step of the wind|fast movement|cunning action|longstrider|mobile|swift/) || has(/\bdash action\b|walking speed increases|speed increases by/)) return pick('dash', col || VFX_COL.trans);
  if (nm(/fly|flight|levitat|feather fall|wings|jump|spider climb/) || has(/\bflying speed\b/)) return pick('wings', col || VFX_COL.trans);
  if (nm(/shield|armor|ward|sanctuary|protection|barkskin|stoneskin|defen|deflect|parry|uncanny dodge|evasion|resist|absorb/) || has(/\+\d+ bonus to ac\b|bonus to ac\b|resistance to/)) return pick('shield', col || VFX_COL.abj);
  if (has(/\b\d+-foot cone\b|\bin a cone\b|\bcone\b/)) return pick('cone', col);
  if (has(/\b\d+ feet long and \d+ feet wide\b|\bin a line\b|\b\d+-foot line\b|\bline \d+ feet long\b|\(\d+-foot line\)/)) return pick('line', col);
  if (has(/\bray\b|\bbeam\b|ranged spell attack|\bbolt\b|\bdart\b|\bmissile\b|\borb\b/) && (dmg || o.attack)) return pick(dmg === 'lightning' ? 'zap' : 'bolt', col);
  if (has(/\b\d+-foot[- ]radius sphere|\bsphere\b|\bexplod|\bburst\b|\bcylinder\b|\b\d+-foot[- ]cube\b|\bcube\b|each creature in (a|the) \d+-foot/) && dmg) return pick(dmg === 'lightning' || dmg === 'thunder' ? 'storm' : 'burst', col);
  if (nm(/summon|conjure|animate|find familiar|find steed|create undead|homunculus|defender|cannon|companion|spirit|beast|servant/)) return pick('summon', col || VFX_COL[sch] || VFX_COL.conj);
  if (nm(/invisib|stealth|hide|shadow|darkness|sneak|skulker|silence|pass without trace|nondetection/)) return pick(nm(/sneak/) ? 'slash' : 'shadow', nm(/sneak/) ? VFX_COL.shadow : VFX_COL.shadow);
  if (nm(/detect|see|sight|vision|sense|identify|locate|scry|clairvoy|true seeing|darkvision|perception|insight|alert|comprehend|tongues|speak with|legend lore|divination|guidance|foresight|awareness/)) return pick('eye', VFX_COL.div);
  if (nm(/telepath|psionic|psychic|mind|thought|whisper|message|sending|dream/)) return pick('wave', VFX_COL.psychic);
  if (nm(/charm|friends|suggestion|command|dominate|hypnot|enthrall|calm|fear|frighten|cause fear|compulsion|geas|tasha's hideous laughter|bless|bane|hex|curse|inspir|bardic|heroism|befuddle|sleep/) || sch === 'ench') return pick('charm', VFX_COL[nm(/fear|frighten|bane|hex|curse/) ? 'necro' : 'ench']);
  if (nm(/light|dancing lights|daylight|faerie fire|flare|glow|sunbeam/)) return pick('light', VFX_COL.radiant);
  if (nm(/illusion|image|mirror|disguise|alter self|seeming|mirage|phantasm|silent image|minor illusion|mislead/) || sch === 'illu') return pick('illusion', VFX_COL.illu);
  if (nm(/\brest\b|recover|\bsleep\b|meditat|trance|arcane recovery|natural recovery/)) return pick('moon', VFX_COL.div);
  if (nm(/luck|lucky|fortune|reroll|portent|tides of chaos|wild magic|chaos|surge|halfling/)) return pick('dice', VFX_COL.gold);
  if (dmg && (o.attack || has(/spell attack|melee weapon attack|ranged weapon attack/))) return pick(dmg === 'lightning' ? 'zap' : 'bolt', col);
  if (dmg && has(/saving throw/)) return pick(dmg === 'lightning' || dmg === 'thunder' ? 'storm' : 'burst', col);
  if (dmg) return pick('bolt', col);
  if (sch === 'necro') return pick('shadow', VFX_COL.necro);
  if (sch === 'trans') return pick('morph', VFX_COL.trans);
  if (sch === 'conj') return pick('summon', VFX_COL.conj);
  if (sch === 'abj') return pick('shield', VFX_COL.abj);
  if (sch === 'div') return pick('eye', VFX_COL.div);
  if (sch === 'evoc') return pick('burst', VFX_COL.evoc);
  if (has(/\battack\b/)) return pick('slash', VFX_COL.slashing);
  if (has(/\bproficien|\bexpertise\b|\bskill\b|\btool/)) return pick('sparkle', VFX_COL.gold);
  return pick('sparkle', col || VFX_COL[sch] || VFX_COL.gold);
}
// ----- Drawing -----
const VFXR = (s => () => (s = (s * 16807) % 2147483647) / 2147483647);
function vfxDraw(x, W, H, t, v) {
  const [c1, c2] = v.c, P = Math.PI, ph = (t % 2000) / 2000, rnd = VFXR(Math.abs(v.seed) % 2147483646 + 1);
  const bg = x.createRadialGradient(W / 2, H / 2, 4, W / 2, H / 2, W * .75); bg.addColorStop(0, '#2a3450'); bg.addColorStop(1, '#10151f');
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  const glow = (px, py, r, c, a = 1) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.globalAlpha = a; x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 2 * P); x.fill(); x.globalAlpha = 1; };
  const dot = (px, py, r, c, a = 1) => { x.globalAlpha = a; x.fillStyle = c; x.beginPath(); x.arc(px, py, r, 0, 2 * P); x.fill(); x.globalAlpha = 1; };
  const figure = (px, py, s, c = '#aab3c8', a = 1) => { s *= 1.35; x.globalAlpha = a; x.fillStyle = c; x.beginPath(); x.arc(px, py - s * 1.05, s * .32, 0, 2 * P); x.fill(); x.beginPath(); x.moveTo(px - s * .42, py + s * .55); x.quadraticCurveTo(px - s * .45, py - s * .55, px, py - s * .62); x.quadraticCurveTo(px + s * .45, py - s * .55, px + s * .42, py + s * .55); x.closePath(); x.fill(); x.globalAlpha = 1; };
  // Several targets at slightly different depths: [x, depth 0 front..1 back]. Back ones sit higher, smaller, dimmer.
  const crowd = (pts, push = () => 0) => pts.slice().sort((a, b) => b[1] - a[1]).forEach(([px, d], i) => { const sc = 1 - d * .25; figure(W * px + push(px, d), ground - d * H * .1, H * .19 * sc, d > .5 ? '#6f788c' : '#8d96ab'); });
  const ease = q => q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2, ground = H * .8;
  x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(0, ground + H * .08, W, 1);
  const m = v.motif;
  // A held weapon drawn along angle `ang` from the grip at (px,py); L is its length.
  const weapon = (px, py, ang, L, kind, glowC) => {
    x.save(); x.translate(px, py); x.rotate(ang); x.lineJoin = 'round'; x.lineCap = 'round';
    if (glowC) { x.shadowColor = glowC; x.shadowBlur = 10; }
    const steel = (a, b) => { const g = x.createLinearGradient(0, -L * .06, 0, L * .06); g.addColorStop(0, '#f4f7fc'); g.addColorStop(.5, glowC ? glowC : '#c3ccda'); g.addColorStop(1, '#7d889c'); return g; };
    const wood = '#7a5232', dark = '#3b2a1e', brass = '#d8b25a';
    const haft = (a, b, w) => { x.strokeStyle = wood; x.lineWidth = w; x.beginPath(); x.moveTo(a, 0); x.lineTo(b, 0); x.stroke(); };
    if (kind === 'axe') {
      haft(-L * .12, L * .92, L * .07);
      x.fillStyle = steel(); x.beginPath(); x.moveTo(L * .66, -L * .04); x.quadraticCurveTo(L * .7, -L * .2, L * .62, -L * .32); x.quadraticCurveTo(L * .84, -L * .26, L * .9, -L * .04);
      x.lineTo(L * .9, L * .04); x.quadraticCurveTo(L * .84, L * .18, L * .66, L * .2); x.quadraticCurveTo(L * .72, L * .1, L * .66, L * .04); x.closePath(); x.fill();
      x.shadowBlur = 0; x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1; x.beginPath(); x.moveTo(L * .63, -L * .3); x.quadraticCurveTo(L * .83, -L * .24, L * .88, -L * .03); x.stroke();
    } else if (kind === 'hammer') {
      haft(-L * .12, L * .82, L * .07);
      x.fillStyle = steel(); x.beginPath(); x.roundRect ? x.roundRect(L * .7, -L * .17, L * .22, L * .34, L * .03) : x.rect(L * .7, -L * .17, L * .22, L * .34); x.fill();
      x.shadowBlur = 0; x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(L * .79, -L * .17, L * .03, L * .34);
    } else if (kind === 'spear' || kind === 'staff') {
      haft(-L * .35, kind === 'staff' ? L * .95 : L * .8, L * .055);
      if (kind === 'staff') { x.fillStyle = glowC || brass; x.beginPath(); x.arc(L * .97, 0, L * .07, 0, 2 * P); x.fill(); }
      else { x.fillStyle = steel(); x.beginPath(); x.moveTo(L * .76, 0); x.quadraticCurveTo(L * .84, -L * .08, L * 1.02, 0); x.quadraticCurveTo(L * .84, L * .08, L * .76, 0); x.fill(); x.fillStyle = dark; x.fillRect(L * .74, -L * .035, L * .04, L * .07); }
    } else {
      const k = kind === 'dagger' ? .62 : 1, bl = L * k, bw = L * .085;
      // grip, pommel, crossguard
      x.strokeStyle = dark; x.lineWidth = L * .07; x.beginPath(); x.moveTo(-L * .14, 0); x.lineTo(L * .03, 0); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-L * .12 + i * L * .04, -L * .03); x.lineTo(-L * .1 + i * L * .04, L * .03); x.stroke(); }
      x.fillStyle = brass; x.beginPath(); x.arc(-L * .17, 0, L * .05, 0, 2 * P); x.fill();
      x.beginPath(); x.moveTo(L * .03, -L * .16); x.quadraticCurveTo(L * .07, -L * .17, L * .07, -L * .12); x.lineTo(L * .07, L * .12); x.quadraticCurveTo(L * .07, L * .17, L * .03, L * .16); x.closePath(); x.fill();
      // blade with a fuller and a bright edge
      x.fillStyle = steel(); x.beginPath(); x.moveTo(L * .07, -bw / 2); x.lineTo(L * .07 + bl * .8, -bw / 2 * .85); x.lineTo(L * .07 + bl * .93, 0); x.lineTo(L * .07 + bl * .8, bw / 2 * .85); x.lineTo(L * .07, bw / 2); x.closePath(); x.fill();
      x.shadowBlur = 0; x.strokeStyle = 'rgba(60,70,90,.45)'; x.lineWidth = Math.max(1, L * .018); x.beginPath(); x.moveTo(L * .1, 0); x.lineTo(L * .07 + bl * .66, 0); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 1; x.beginPath(); x.moveTo(L * .08, -bw / 2 + .5); x.lineTo(L * .07 + bl * .8, -bw / 2 * .85 + .5); x.lineTo(L * .07 + bl * .92, 0); x.stroke();
    }
    x.restore(); x.shadowBlur = 0;
  };
  // A figure on the left swinging a weapon at a figure on the right. `swings` lists [start, from, to] in phase/radians.
  const swingScene = (swings, trailA, trailB, glowC, impact) => {
    const fx = W * .28, fs = H * .22 * 1.35, sx = fx + fs * .12, sy = ground - fs * .55, L = W * (v.w === 'dagger' ? .26 : v.w === 'spear' || v.w === 'staff' ? .38 : .31);
    figure(fx, ground, H * .22); const hitAt = [];
    let ang = swings[0][1], live = null;
    swings.forEach(([st, a0, a1]) => { const wind = .08, dur = .2; if (ph >= st) { const q = (ph - st - wind) / dur; ang = q < 0 ? a0 - .15 * Math.sin(Math.min(1, (ph - st) / wind) * P / 2) : a0 + (a1 - a0) * ease(Math.min(1, q)); if (q >= 0 && q < 1.6) live = { a0, a: ang, q }; hitAt.push(st + wind + dur * .6); } });
    if (ph > .78) { const r = (ph - .78) / .22; ang = ang + (swings[0][1] - ang) * ease(r); live = null; }
    const flinch = hitAt.some(h => ph > h && ph < h + .12) ? 3 : 0;
    figure(W * .74 + flinch, ground, H * .2, '#8d96ab');
    const hx = sx + Math.cos(ang) * fs * .35, hy = sy + Math.sin(ang) * fs * .35;
    if (live) { const R = fs * .35 + L * .9, from = live.a0 < live.a ? live.a0 : live.a, to = live.a0 < live.a ? live.a : live.a0, fade = Math.max(0, 1 - Math.max(0, live.q - 1) / .6);
      const lo = live.a0 > live.a ? from : Math.max(from, to - 1.4), hi = live.a0 > live.a ? Math.min(to, from + 1.4) : to; [[trailB, .22, 7, 0], [trailA, .7, 2, 1]].forEach(([c, al, lw, off]) => { x.strokeStyle = c; x.globalAlpha = al * fade; x.lineWidth = lw; x.beginPath(); x.arc(sx, sy, R - off, lo, hi); x.stroke(); }); x.globalAlpha = 1; }
    // the far arm behind, the weapon, then the arm holding it
    weapon(hx, hy, ang, L, v.w || 'sword', glowC);
    x.strokeStyle = '#aab3c8'; x.lineCap = 'round'; x.lineWidth = fs * .16; x.beginPath(); x.moveTo(sx, sy); x.lineTo(hx, hy); x.stroke(); dot(hx, hy, fs * .1, '#aab3c8');
    hitAt.forEach(h => { const r = (ph - h) / .3; if (r > 0 && r < 1) impact(r); });
  };
  if (m === 'bolt' || m === 'arrow' || m === 'zap') {
    figure(W * .2, ground, H * .2); figure(W * .8, ground, H * .2, '#8d96ab');
    const q = Math.min(1, ph / .6), sx = W * .28, sy = ground - H * .2, ex = W * .74, ey = ground - H * .22, px = sx + (ex - sx) * ease(q), py = sy + (ey - sy) * ease(q) - Math.sin(q * P) * H * (m === 'arrow' ? .12 : .04);
    if (ph < .6) {
      if (m === 'arrow') { const a = Math.atan2(ey - sy - Math.cos(q * P) * H * .12 * P, ex - sx); x.save(); x.translate(px, py); x.rotate(a * .6); x.strokeStyle = c2; x.lineWidth = 2; x.beginPath(); x.moveTo(-14, 0); x.lineTo(6, 0); x.stroke(); x.fillStyle = c1; x.beginPath(); x.moveTo(9, 0); x.lineTo(3, -3); x.lineTo(3, 3); x.fill(); x.restore(); }
      else if (m === 'zap') { x.strokeStyle = c2; x.lineWidth = 2.5; x.shadowColor = c1; x.shadowBlur = 10; x.beginPath(); x.moveTo(sx, sy); let lx = sx; for (let k = 1; k <= 7; k++) { const fx = sx + (px - sx) * k / 7; x.lineTo(fx, sy + (py - sy) * k / 7 + (k < 7 ? (rnd() - .5) * 14 : 0)); lx = fx; } x.stroke(); x.shadowBlur = 0; }
      else { for (let k = 0; k < 8; k++) { const tq = Math.max(0, q - k * .03), tx = sx + (ex - sx) * ease(tq), ty = sy + (ey - sy) * ease(tq); dot(tx, ty, 5 - k * .5, c1, .5 - k * .05); } glow(px, py, 12, c1); dot(px, py, 4, c2); }
    } else { const r = (ph - .6) / .4; glow(ex, ey, 10 + r * 26, c1, 1 - r); for (let k = 0; k < 10; k++) { const a = rnd() * 2 * P, d = r * (14 + rnd() * 16); dot(ex + Math.cos(a) * d, ey + Math.sin(a) * d, 2, c2, 1 - r); } }
  } else if (m === 'cone' || m === 'line') {
    figure(W * .14, ground, H * .2, '#aab3c8'); const ox = W * .22, oy = ground - H * .2;
    const pts = m === 'cone' ? [[.6, .3], [.78, 1], [.84, 0], [.68, .8]] : [[.52, 0], [.7, 0], [.88, 0]];
    crowd(pts, (px) => Math.max(0, Math.sin(ph * P * 2 - px * 2)) * 2);
    for (let k = 0; k < 50; k++) { const life = (ph + k / 50) % 1, a = (rnd() - .5) * (m === 'cone' ? .8 : .1) - (m === 'cone' ? .05 : 0), d = life * W * .8; dot(ox + Math.cos(a) * d, oy + Math.sin(a) * d * (m === 'cone' ? .7 : 1), 2 + life * (m === 'cone' ? 5 : 3), life < .5 ? c2 : c1, (1 - life) * .85); }
    glow(ox, oy, 12, c1, .8);
  } else if (m === 'burst' || m === 'storm') {
    const cx = W * .5, cy = ground - H * .2, r = (ph < .25 ? 0 : (ph - .25) / .75), kick = r > 0 ? Math.sin(Math.min(1, r * 3) * P) * 4 : 0;
    crowd([[.22, .2], [.5, .9], [.5, 0], [.78, .2], [.34, .7], [.68, .7]].filter((_, i) => i !== 1), (px) => (px - .5) * kick * 2);
    if (m === 'storm') { x.fillStyle = 'rgba(160,170,200,.35)'; x.beginPath(); x.ellipse(W * .5, H * .14, W * .4, H * .09, 0, 0, 2 * P); x.fill(); if (ph < .3) { x.strokeStyle = c2; x.lineWidth = 2.5; x.shadowColor = c1; x.shadowBlur = 12; x.beginPath(); x.moveTo(W * .5, H * .18); for (let k = 1; k <= 5; k++) x.lineTo(W * .5 + (rnd() - .5) * 16, H * .18 + (cy - H * .18) * k / 5); x.stroke(); x.shadowBlur = 0; } }
    if (r > 0) { glow(cx, cy, 8 + r * W * .45, c1, 1 - r * .9); x.strokeStyle = c2; x.globalAlpha = 1 - r; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, r * W * .45, r * W * .3, 0, 0, 2 * P); x.stroke(); x.globalAlpha = 1; for (let k = 0; k < 16; k++) { const a = k / 16 * 2 * P + rnd() * .3, d = r * W * (.25 + rnd() * .22); dot(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .7, 2.2, c2, 1 - r); } }
    else if (m === 'burst') { const q = ph / .25, sx = W * .15 + (cx - W * .15) * q, sy = H * .15 + (cy - H * .15) * q; dot(sx, sy, 3.5, c2); glow(sx, sy, 10, c1); }
  } else if (m === 'heal') {
    figure(W * .5, ground, H * .24, '#aab3c8'); glow(W * .5, ground - H * .2, W * .32, c1, .35 + .2 * Math.sin(ph * 2 * P));
    for (let k = 0; k < 9; k++) { const life = (ph + k / 9) % 1, px = W * (.28 + .44 * ((k * 37 % 9) / 9)), py = ground - life * H * .6; x.globalAlpha = Math.sin(life * P); x.fillStyle = k % 2 ? c2 : c1; x.fillRect(px - 1.5, py - 5, 3, 10); x.fillRect(px - 5, py - 1.5, 10, 3); } x.globalAlpha = 1;
  } else if (m === 'shield') {
    figure(W * .5, ground, H * .22); const cx = W * .5, cy = ground - H * .24, R = W * .3, pulse = .55 + .25 * Math.sin(ph * 2 * P);
    x.strokeStyle = c1; x.lineWidth = 2.5; x.globalAlpha = pulse; x.beginPath(); for (let k = 0; k < 6; k++) { const a = P / 6 + k * P / 3; x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); } x.closePath(); x.stroke(); x.globalAlpha = pulse * .25; x.fillStyle = c1; x.fill(); x.globalAlpha = 1;
    const sa = ph * 2 * P; dot(cx + Math.cos(sa) * R * .95, cy + Math.sin(sa) * R * .95, 3, c2); if (ph > .45 && ph < .6) { const r = (ph - .45) / .15; glow(W * .82, cy, 10 * (1 - r) + 4, '#ffffff', 1 - r); }
  } else if (m === 'eye') {
    const cx = W * .5, cy = H * .48, open = Math.min(1, Math.abs(Math.sin(ph * P * 2)) * 3);
    for (let k = 0; k < 12; k++) { const a = k / 12 * 2 * P + ph, r1 = W * .28, r2 = W * (.34 + .04 * Math.sin(ph * 4 * P + k)); x.strokeStyle = c1; x.globalAlpha = .5; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); x.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); x.stroke(); } x.globalAlpha = 1;
    x.fillStyle = '#f2ecdc'; x.beginPath(); x.ellipse(cx, cy, W * .22, H * .12 * open + .5, 0, 0, 2 * P); x.fill(); if (open > .3) { dot(cx + Math.sin(ph * 2 * P) * 6, cy, H * .07, c1); dot(cx + Math.sin(ph * 2 * P) * 6, cy, H * .03, '#111'); }
  } else if (m === 'charm') {
    figure(W * .5, ground, H * .22, '#aab3c8');
    for (let k = 0; k < 5; k++) { const a = ph * 2 * P + k / 5 * 2 * P, px = W * .5 + Math.cos(a) * W * .26, py = ground - H * .45 + Math.sin(a) * H * .08, s = 4 + 1.5 * Math.sin(ph * 4 * P + k); x.fillStyle = k % 2 ? c2 : c1; x.beginPath(); x.moveTo(px, py + s); x.bezierCurveTo(px - s * 1.6, py - s * .2, px - s * .6, py - s * 1.4, px, py - s * .4); x.bezierCurveTo(px + s * .6, py - s * 1.4, px + s * 1.6, py - s * .2, px, py + s); x.fill(); }
  } else if (m === 'teleport') {
    const q = ph < .5 ? ph / .5 : (ph - .5) / .5, from = ph < .5;
    figure(W * (from ? .28 : .72), ground, H * .22, '#aab3c8', from ? 1 - q : q);
    for (let k = 0; k < 14; k++) { const a = rnd() * 2 * P, d = (from ? q : 1 - q) * 22 + rnd() * 6; dot(W * (from ? .28 : .72) + Math.cos(a) * d, ground - H * .22 + Math.sin(a) * d * 1.4, 2, k % 2 ? c1 : c2, from ? q : 1 - q); }
    glow(W * (from ? .28 : .72), ground - H * .22, 18, c1, .5);
  } else if (m === 'summon') {
    // a creature climbs up out of a glowing circle
    const cx = W * .5, cy = ground; x.strokeStyle = c1; x.lineWidth = 2; x.globalAlpha = .9; x.beginPath(); x.ellipse(cx, cy + H * .03, W * .32, H * .07, 0, 0, 2 * P); x.stroke();
    for (let k = 0; k < 6; k++) { const a = ph * 2 * P + k / 6 * 2 * P; dot(cx + Math.cos(a) * W * .32, cy + H * .03 + Math.sin(a) * H * .07, 2.2, c2); } x.globalAlpha = 1;
    const rise = ease(Math.min(1, ph / .5)); glow(cx, cy - H * .18, W * .3, c1, .4); x.save(); x.beginPath(); x.rect(0, 0, W, cy + H * .03); x.clip(); x.translate(cx, cy + H * .03 + (1 - rise) * H * .5); const k2 = W * .0055; x.scale(k2, k2);
    const g = x.createLinearGradient(0, -60, 0, 0); g.addColorStop(0, c2); g.addColorStop(1, c1); x.fillStyle = g; x.shadowColor = c1; x.shadowBlur = 10; x.globalAlpha = .9;
    // a hunched beast: body, head with ears and snout, four legs, tail
    x.beginPath(); x.ellipse(-4, -26, 24, 11, -.08, 0, 2 * P); x.fill();
    x.beginPath(); x.moveTo(14, -34); x.quadraticCurveTo(22, -44, 30, -42); x.lineTo(42, -36); x.quadraticCurveTo(40, -31, 30, -30); x.quadraticCurveTo(22, -26, 16, -22); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(22, -42); x.lineTo(23, -52); x.lineTo(28, -43); x.fill();
    [[-22, 0], [-14, 0], [6, 0], [14, 0]].forEach(([lx], i) => { x.fillRect(lx - 2.5, -20, 5, 20 + Math.sin(ph * 12 * P + i) * (rise === 1 ? 1.5 : 0)); });
    x.beginPath(); x.moveTo(-26, -30); x.quadraticCurveTo(-40, -40, -42, -30); x.quadraticCurveTo(-36, -30, -27, -24); x.fill();
    x.shadowBlur = 0; dot(31, -38, 1.8, '#1b2131'); x.restore(); x.globalAlpha = 1;
  } else if (m === 'slash') {
    swingScene([[0, -P * .62, P * .22]], c2, c1, null, r => { for (let k = 0; k < 8; k++) { const sa = k / 8 * 2 * P + rnd() * .3, d = 4 + r * 16; dot(W * .7 + Math.cos(sa) * d, ground - H * .26 + Math.sin(sa) * d, 1.8, c2, 1 - r); } });
  } else if (m === 'dash') {
    const q = ease(ph), px = W * (.15 + .7 * q); figure(px, ground, H * .22, '#aab3c8');
    for (let k = 0; k < 6; k++) { x.strokeStyle = c1; x.globalAlpha = .6 - k * .08; x.lineWidth = 2; const ly = ground - H * (.1 + k * .06); x.beginPath(); x.moveTo(px - W * .08, ly); x.lineTo(px - W * (.2 + k * .03), ly); x.stroke(); } x.globalAlpha = 1;
  } else if (m === 'rage') {
    const pul = .5 + .5 * Math.sin(ph * 4 * P); glow(W * .5, ground - H * .25, W * (.3 + .06 * pul), c1, .7); figure(W * .5, ground, H * .25, '#c9a7a0');
    for (let k = 0; k < 10; k++) { const life = (ph * 1.5 + k / 10) % 1, px = W * (.3 + .4 * ((k * 53 % 10) / 10)), py = ground - life * H * .55; dot(px, py, 3 * (1 - life) + 1, k % 2 ? c2 : c1, 1 - life); }
  } else if (m === 'shadow') {
    const a = .5 + .45 * Math.cos(ph * 2 * P); figure(W * .5, ground, H * .24, '#aab3c8', a);
    for (let k = 0; k < 7; k++) { const life = (ph + k / 7) % 1; x.globalAlpha = (1 - life) * .5; x.fillStyle = c1; x.beginPath(); x.ellipse(W * (.3 + .4 * (k / 7)), ground - life * H * .5, 8 + life * 10, 5 + life * 6, 0, 0, 2 * P); x.fill(); } x.globalAlpha = 1;
  } else if (m === 'wave') {
    figure(W * .25, ground, H * .2); figure(W * .75, ground, H * .2, '#8d96ab');
    for (let k = 0; k < 4; k++) { const life = (ph + k / 4) % 1; x.strokeStyle = k % 2 ? c2 : c1; x.globalAlpha = 1 - life; x.lineWidth = 2; x.beginPath(); x.arc(W * .25, ground - H * .3, 6 + life * W * .45, -P / 5, P / 5); x.stroke(); } x.globalAlpha = 1;
  } else if (m === 'light') {
    const fl = .85 + .15 * Math.sin(ph * 6 * P); glow(W * .5, H * .42, W * .45 * fl, c1, .6); dot(W * .5, H * .42, 7, c2);
    for (let k = 0; k < 8; k++) { const a = k / 8 * 2 * P + ph * P; x.strokeStyle = c2; x.globalAlpha = .6; x.lineWidth = 1.5; x.beginPath(); x.moveTo(W * .5 + Math.cos(a) * 12, H * .42 + Math.sin(a) * 12); x.lineTo(W * .5 + Math.cos(a) * 22 * fl, H * .42 + Math.sin(a) * 22 * fl); x.stroke(); } x.globalAlpha = 1;
  } else if (m === 'illusion') {
    for (let k = -1; k <= 1; k++) figure(W * (.5 + k * .2 * Math.sin(ph * 2 * P)), ground, H * .22, k ? c1 : '#aab3c8', k ? .45 : 1);
    for (let k = 0; k < 6; k++) dot(W * rnd(), H * (.2 + .5 * rnd()), 1.6, c2, .5 + .5 * Math.sin(ph * 6 * P + k));
  } else if (m === 'moon') {
    const cx = W * .5, cy = H * .42; dot(cx, cy, W * .2, c2); dot(cx + W * .09, cy - H * .06, W * .18, '#141a28');
    for (let k = 0; k < 3; k++) { const life = (ph + k / 3) % 1; x.fillStyle = c1; x.globalAlpha = Math.sin(life * P); x.font = `bold ${10 + life * 6}px sans-serif`; x.fillText('z', W * (.68 + life * .15), H * (.42 - life * .3)); } x.globalAlpha = 1;
  } else if (m === 'dice') {
    const cx = W * .5, cy = H * .5, a = ease(Math.min(1, ph / .7)) * 4 * P, s = W * .26; x.save(); x.translate(cx, cy); x.rotate(a);
    x.fillStyle = c1; x.beginPath(); for (let k = 0; k < 6; k++) { const aa = -P / 2 + k * P / 3; x.lineTo(Math.cos(aa) * s, Math.sin(aa) * s); } x.closePath(); x.fill(); x.strokeStyle = '#3b2a0c'; x.lineWidth = 2; x.stroke();
    x.beginPath(); x.moveTo(0, -s * .55); x.lineTo(s * .5, s * .3); x.lineTo(-s * .5, s * .3); x.closePath(); x.stroke(); x.restore();
    if (ph > .7) { x.fillStyle = '#2a1d07'; x.font = `bold ${Math.round(W * .13)}px serif`; x.textAlign = 'center'; x.fillText('20', cx, cy + W * .05); x.textAlign = 'start'; glow(cx, cy, W * .45, c2, (ph - .7) / .3 * .5); }
  } else if (m === 'wings') {
    const fl = Math.sin(ph * 4 * P), cy = ground - H * .3 - Math.sin(ph * 2 * P) * H * .06; figure(W * .5, cy + H * .22, H * .2, '#aab3c8');
    x.fillStyle = c1; x.globalAlpha = .8; [-1, 1].forEach(sd => { x.beginPath(); x.moveTo(W * .5, cy); x.quadraticCurveTo(W * (.5 + sd * .3), cy - H * (.18 + .1 * fl), W * (.5 + sd * .38), cy + H * .04); x.quadraticCurveTo(W * (.5 + sd * .2), cy + H * .02, W * .5, cy + H * .06); x.fill(); }); x.globalAlpha = 1;
  } else if (m === 'morph') {
    const q = .5 + .5 * Math.sin(ph * 2 * P); figure(W * .5, ground, H * (.16 + .1 * q), q > .5 ? c1 : '#aab3c8');
    for (let k = 0; k < 10; k++) { const a = k / 10 * 2 * P + ph * 2 * P; dot(W * .5 + Math.cos(a) * W * .3, ground - H * .25 + Math.sin(a) * H * .2, 2, c2, .7); }
  } else if (m === 'hold') {
    const sh = Math.sin(ph * 30) * (ph > .3 ? 1.2 : 0); figure(W * .5 + sh, ground, H * .24, '#aab3c8');
    for (let k = 0; k < 3; k++) { const yy = ground - H * (.12 + k * .16), q = Math.min(1, ph * 3 - k * .3); if (q <= 0) continue; x.strokeStyle = k % 2 ? c2 : c1; x.lineWidth = 2.5; x.globalAlpha = .9; x.beginPath(); x.ellipse(W * .5, yy, W * .2 * q + 2, H * .045, 0, 0, 2 * P); x.stroke(); } x.globalAlpha = 1;
  } else if (m === 'web') {
    figure(W * .5, ground, H * .22, '#8d96ab'); const cx = W * .5, cy = H * .45, q = Math.min(1, ph / .6); x.strokeStyle = c2; x.lineWidth = 1; x.globalAlpha = .8;
    for (let k = 0; k < 8; k++) { const a = k / 8 * 2 * P; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * W * .45 * q, cy + Math.sin(a) * H * .45 * q); x.stroke(); }
    for (let r = 1; r <= 4; r++) { const rr = r / 4 * W * .4 * q; x.beginPath(); for (let k = 0; k <= 8; k++) { const a = k / 8 * 2 * P; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .9); } x.stroke(); } x.globalAlpha = 1;
  } else if (m === 'wall') {
    figure(W * .2, ground, H * .2); const q = Math.min(1, ph / .5), top = ground + H * .08 - q * H * .62;
    for (let k = 0; k < 7; k++) { const xx = W * (.45 + k * .07), fl = Math.sin(ph * 10 * P + k) * 4; x.fillStyle = k % 2 ? c1 : c2; x.globalAlpha = .85; x.fillRect(xx, top + fl, W * .06, ground + H * .08 - top - fl); } x.globalAlpha = 1; glow(W * .66, ground - H * .25, W * .3, c1, .3);
  } else if (m === 'vines') {
    figure(W * .5, ground, H * .22, '#8d96ab');
    for (let k = 0; k < 5; k++) { const bx = W * (.2 + k * .15), q = Math.min(1, ph * 1.6 - k * .08); if (q <= 0) continue; x.strokeStyle = k % 2 ? c1 : c2; x.lineWidth = 3; x.beginPath(); x.moveTo(bx, ground + H * .08); for (let s = 1; s <= 10; s++) { const tt = s / 10 * q; x.lineTo(bx + Math.sin(tt * 9 + k) * 6 + (W * .5 - bx) * tt * .6, ground + H * .08 - tt * H * .55); } x.stroke(); dot(bx + (W * .5 - bx) * q * .6, ground + H * .08 - q * H * .55, 3, c2); }
  } else if (m === 'quake') {
    const sh = Math.sin(ph * 40) * 2; crowd([[.28, .3], [.5, 0], [.72, .3]], px => sh * (px > .4 && px < .6 ? 1 : -1)); x.strokeStyle = c1; x.lineWidth = 2.5;
    x.beginPath(); x.moveTo(W * .1, ground + H * .08); for (let k = 1; k <= 8; k++) x.lineTo(W * (.1 + k * .1), ground + H * .08 + ((k % 2) ? -5 : 5) * Math.min(1, ph * 2)); x.stroke();
    for (let k = 0; k < 6; k++) { const life = (ph * 1.3 + k / 6) % 1, px = W * (.2 + .6 * ((k * 3 % 6) / 6)), py = ground + H * .08 - Math.sin(life * P) * H * .3; x.fillStyle = k % 2 ? c1 : c2; x.fillRect(px - 3, py - 3, 6, 6); }
  } else if (m === 'gust') {
    const push = ease(Math.min(1, ph / .7)) * W * .14; figure(W * .14, ground, H * .2, '#aab3c8'); crowd([[.58, .6], [.62, 0], [.78, .3]], () => push);
    for (let k = 0; k < 6; k++) { const life = (ph * 1.4 + k / 6) % 1, yy = ground - H * (.08 + k * .07); x.strokeStyle = k % 2 ? c1 : c2; x.globalAlpha = .7 * Math.sin(life * P); x.lineWidth = 2; x.beginPath(); x.moveTo(W * (.2 + life * .6), yy); x.quadraticCurveTo(W * (.3 + life * .6), yy - 6, W * (.43 + life * .6), yy); x.stroke(); } x.globalAlpha = 1;
  } else if (m === 'water') {
    figure(W * .5, ground, H * .2, '#8d96ab'); const lvl = ground + H * .06 - Math.sin(ph * P) * H * .35;
    x.fillStyle = c1; x.globalAlpha = .7; x.beginPath(); x.moveTo(0, H); for (let k = 0; k <= 12; k++) x.lineTo(W * k / 12, lvl + Math.sin(k + ph * 8 * P) * 4); x.lineTo(W, H); x.fill(); x.globalAlpha = 1;
    for (let k = 0; k < 6; k++) dot(W * (.2 + k * .12), lvl - 6 - Math.abs(Math.sin(ph * 4 * P + k)) * 10, 2, c2, .8);
  } else if (m === 'sleep') {
    x.fillStyle = '#aab3c8'; x.beginPath(); x.ellipse(W * .5, ground - 6, W * .22, 7, 0, 0, 2 * P); x.fill(); dot(W * .28, ground - 10, 6, '#aab3c8');
    for (let k = 0; k < 3; k++) { const life = (ph + k / 3) % 1; x.fillStyle = c1; x.globalAlpha = Math.sin(life * P); x.font = `bold ${9 + life * 8}px sans-serif`; x.fillText('z', W * (.32 + life * .3), ground - 18 - life * H * .4); } x.globalAlpha = 1;
  } else if (m === 'fear') {
    const sh = Math.sin(ph * 50) * 1.5; figure(W * .7 + sh, ground, H * .2, '#8d96ab'); const s = W * (.16 + .03 * Math.sin(ph * 4 * P)), cx = W * .32, cy = H * .42;
    glow(cx, cy, s * 2, c1, .5); dot(cx, cy, s, c2); x.fillStyle = '#111'; dot(cx - s * .38, cy - s * .1, s * .25, '#111'); dot(cx + s * .38, cy - s * .1, s * .25, '#111'); x.fillRect(cx - s * .4, cy + s * .45, s * .8, s * .18);
  } else if (m === 'bless') {
    figure(W * .5, ground, H * .24, '#cfd6e6'); const cy = ground - H * .52; x.strokeStyle = c2; x.lineWidth = 2.5; x.shadowColor = c1; x.shadowBlur = 8; x.beginPath(); x.ellipse(W * .5, cy, W * .12, H * .035, 0, 0, 2 * P); x.stroke(); x.shadowBlur = 0;
    for (let k = 0; k < 7; k++) { const a = -P / 2 + (k - 3) * .28; x.strokeStyle = c1; x.globalAlpha = .35 + .3 * Math.sin(ph * 2 * P + k); x.beginPath(); x.moveTo(W * .5, 0); x.lineTo(W * .5 + Math.cos(a) * -W * .6, H * .9); x.stroke(); } x.globalAlpha = 1;
  } else if (m === 'curse') {
    figure(W * .5, ground, H * .22, '#8d96ab'); const cy = ground - H * .55, r = W * .15, a0 = ph * 2 * P;
    x.strokeStyle = c1; x.lineWidth = 2; x.globalAlpha = .9; x.beginPath(); x.arc(W * .5, cy, r, 0, 2 * P); x.stroke();
    x.beginPath(); for (let k = 0; k < 5; k++) { const a = a0 + k * 4 * P / 5 - P / 2; x.lineTo(W * .5 + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.stroke(); x.globalAlpha = 1;
    for (let k = 0; k < 5; k++) { const life = (ph + k / 5) % 1; dot(W * (.4 + .2 * (k / 5)), cy + life * H * .3, 2, c2, 1 - life); }
  } else if (m === 'mark') {
    figure(W * .2, ground, H * .2); figure(W * .72, ground, H * .2, '#8d96ab'); const cx = W * .72, cy = ground - H * .22, r = W * (.14 + .04 * Math.cos(ph * 2 * P));
    x.strokeStyle = c1; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r, 0, 2 * P); x.stroke(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { x.beginPath(); x.moveTo(cx + dx * r * .6, cy + dy * r * .6); x.lineTo(cx + dx * r * 1.4, cy + dy * r * 1.4); x.stroke(); }); dot(cx, cy, 2.5, c2);
  } else if (m === 'counter') {
    figure(W * .2, ground, H * .2); figure(W * .8, ground, H * .2, '#8d96ab'); const q = Math.min(1, ph / .5), px = W * (.78 - .32 * q), py = ground - H * .3;
    if (ph < .5) { glow(px, py, 10, c1); dot(px, py, 4, c2); } else { const r = (ph - .5) / .5; for (let k = 0; k < 10; k++) { const a = k / 10 * 2 * P; dot(W * .46 + Math.cos(a) * r * 22, py + Math.sin(a) * r * 22, 2, c1, 1 - r); } x.strokeStyle = '#ff6b6b'; x.lineWidth = 3; x.globalAlpha = 1 - r; x.beginPath(); x.moveTo(W * .4, py - 8); x.lineTo(W * .52, py + 8); x.moveTo(W * .52, py - 8); x.lineTo(W * .4, py + 8); x.stroke(); x.globalAlpha = 1; }
  } else if (m === 'banish') {
    const cx = W * .5, cy = H * .48, q = ease(Math.min(1, ph / .8)); x.strokeStyle = c1; for (let k = 0; k < 3; k++) { x.globalAlpha = .7; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, W * (.32 - k * .08), H * (.32 - k * .08), ph * 2 * P + k, 0, 1.6 * P); x.stroke(); } x.globalAlpha = 1;
    glow(cx, cy, W * .2, c2, .5); x.save(); x.translate(cx, cy); x.scale(1 - q, 1 - q); x.rotate(q * 3); figure(0, H * .22, H * .22, '#aab3c8', 1 - q); x.restore();
  } else if (m === 'revive') {
    const q = ease(Math.min(1, ph / .7)); glow(W * .5, ground - H * .2, W * .35, c1, .25 + .35 * q); x.save(); x.translate(W * .5, ground); x.rotate((1 - q) * -P / 2); figure(0, 0, H * .22, '#cfd6e6'); x.restore();
    for (let k = 0; k < 8; k++) { const life = (ph + k / 8) % 1; dot(W * (.3 + .4 * (k / 8)), ground - life * H * .6, 2, c2, Math.sin(life * P)); }
  } else if (m === 'speak') {
    const hs = H * .2 * 1.35, headY = ground - hs * 1.05; figure(W * .25, ground, H * .2); figure(W * .75, ground, H * .2, '#8d96ab');
    [[.25, 0, 1], [.75, .5, -1]].forEach(([fx, off, dir]) => { const a = Math.max(0, Math.sin(((ph + off) % 1) * P * 1.1)); if (a <= 0) return; const bx = W * fx + dir * W * .1, by = headY - hs * .62, bw = W * .13, bh = H * .085;
      x.globalAlpha = Math.min(1, a * 1.6); x.fillStyle = c1; x.beginPath(); x.ellipse(bx, by, bw, bh, 0, 0, 2 * P); x.fill();
      x.beginPath(); x.moveTo(bx - dir * bw * .35, by + bh * .6); x.lineTo(W * fx + dir * W * .03, headY - hs * .38); x.lineTo(bx - dir * bw * .02, by + bh * .8); x.closePath(); x.fill();
      const n = Math.min(3, Math.floor(((ph + off) % 1) * 8) + 1); for (let k = 0; k < n; k++) dot(bx + (k - 1) * 5, by, 1.6, '#1b2131'); x.globalAlpha = 1; });
  } else if (m === 'glyph') {
    figure(W * .5, ground - H * .05, H * .2, '#8d96ab', ph > .6 ? 1 - (ph - .6) * 1.5 : 1); const cx = W * .5, cy = ground + H * .02, pul = .5 + .5 * Math.sin(ph * 2 * P);
    x.strokeStyle = c1; x.globalAlpha = .6 + .4 * pul; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, W * .34, H * .09, 0, 0, 2 * P); x.stroke(); x.beginPath(); x.ellipse(cx, cy, W * .24, H * .06, 0, 0, 2 * P); x.stroke();
    for (let k = 0; k < 6; k++) { const a = ph * P + k / 6 * 2 * P; dot(cx + Math.cos(a) * W * .29, cy + Math.sin(a) * H * .075, 2, c2); } x.globalAlpha = 1; if (ph > .6) glow(cx, cy - H * .2, W * .3 * (ph - .6) * 2.5, c1, 1 - (ph - .6) * 2.5);
  } else if (m === 'hand') {
    // A spectral open hand: one continuous outline (palm, four fingers and a thumb), drifting over to lift a small vial.
    // floats and drifts in a lazy figure-eight, flexing its fingers closed and open
    const S = H * .5, hold = true, hx = W * .5 + Math.sin(ph * 2 * P) * W * .16, hy = ground - H * .02 + Math.sin(ph * 4 * P) * H * .05, tilt = Math.sin(ph * 2 * P) * .18;
    for (let k = 0; k < 6; k++) { const life = (ph * 2 + k / 6) % 1; dot(hx - Math.cos(ph * 2 * P) * 14 * life + Math.sin(k * 7) * 6, hy - S * .25 + life * 8, 1.4, c2, (1 - life) * .7); }
    glow(hx, hy - S * .45, S * .75, c1, .45);
    x.save(); x.translate(hx, hy); x.rotate(tilt); x.scale(S, S);
    // fingers: [base x, base y, angle from vertical, length, width]
    const F = [[-.17, -.56, -.16, .34, .1], [-.055, -.6, -.04, .4, .105], [.06, -.58, .07, .37, .1], [.16, -.52, .2, .28, .085]];
    const curl = .5 * Math.max(0, Math.sin(ph * 4 * P - 1)) ** 2;
    x.beginPath(); x.moveTo(.18, 0); x.quadraticCurveTo(.25, -.25, .22, -.45);
    F.slice().reverse().forEach(([bx, by, a, len, w], i) => { const A = a + curl * .4, L2 = len * (1 - curl * .35), ux = Math.sin(A), uy = -Math.cos(A), nx = -uy, ny = ux, tx = bx + ux * L2, ty = by + uy * L2;
      x.lineTo(bx + nx * w / 2, by + ny * w / 2); x.lineTo(tx + nx * w / 2, ty + ny * w / 2); x.arc(tx, ty, w / 2, Math.atan2(ny, nx), Math.atan2(-ny, -nx), true); x.lineTo(bx - nx * w / 2, by - ny * w / 2);
      if (i < 3) { const nb = F[2 - i]; x.quadraticCurveTo((bx + nb[0]) / 2, by + .05, nb[0] + Math.cos(nb[2]) * nb[4] / 2, nb[1] + Math.sin(nb[2]) * nb[4] / 2); } });
    // thumb sweeping out from the lower palm
    const ta = -.85 + curl * .55, tw = .13, tl = .3 - curl * .06, Bx = -.17, By = -.3, ux = Math.sin(ta), uy = -Math.cos(ta), nx = Math.cos(ta), ny = Math.sin(ta), tx = Bx + ux * tl, ty = By + uy * tl;
    x.quadraticCurveTo(-.2, -.42, Bx + nx * tw / 2, By + ny * tw / 2); x.lineTo(tx + nx * tw / 2, ty + ny * tw / 2); x.arc(tx, ty, tw / 2, Math.atan2(ny, nx), Math.atan2(-ny, -nx), true); x.lineTo(Bx - nx * tw / 2 + .02, By - ny * tw / 2 + .04);
    x.quadraticCurveTo(-.22, -.1, -.17, 0); x.closePath();
    const g = x.createLinearGradient(0, -1, 0, 0); g.addColorStop(0, c2); g.addColorStop(1, c1); x.fillStyle = g; x.globalAlpha = .82; x.shadowColor = c1; x.shadowBlur = 14; x.fill(); x.shadowBlur = 0;
    x.globalAlpha = .9; x.strokeStyle = c2; x.lineWidth = 1.4 / S; x.stroke();
    // palm creases and knuckle lines
    x.globalAlpha = .35; x.strokeStyle = '#ffffff'; x.lineWidth = 1 / S; x.beginPath(); x.moveTo(-.15, -.3); x.quadraticCurveTo(0, -.38, .19, -.33); x.moveTo(-.18, -.2); x.quadraticCurveTo(-.05, -.18, .02, -.3); x.stroke();
    F.forEach(([bx, by, a, len]) => { const A = a + curl * .4, L2 = len * (1 - curl * .35), mx = bx + Math.sin(A) * L2 * .5, my = by - Math.cos(A) * L2 * .5; x.beginPath(); x.moveTo(mx - .03, my); x.lineTo(mx + .03, my); x.stroke(); });
    x.globalAlpha = 1; x.restore();
  } else if (m === 'weather') {
    crowd([[.28, .2], [.5, 0], [.72, .3], [.6, .9]], px => Math.sin(ph * 10 * P + px * 9) * .8);
    x.fillStyle = 'rgba(170,180,205,.6)'; x.beginPath(); x.ellipse(W * .45, H * .16, W * .3, H * .1, 0, 0, 2 * P); x.ellipse(W * .64, H * .14, W * .22, H * .09, 0, 0, 2 * P); x.fill();
    for (let k = 0; k < 22; k++) { const life = (ph * 2 + k / 22) % 1, px = W * (.15 + .7 * ((k * 7 % 22) / 22)); x.strokeStyle = c1; x.globalAlpha = .8; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, H * .24 + life * H * .6); x.lineTo(px - 3, H * .24 + life * H * .6 + 7); x.stroke(); } x.globalAlpha = 1;
  } else if (m === 'time') {
    const cx = W * .5, cy = H * .48, r = W * .3; x.strokeStyle = c1; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r, 0, 2 * P); x.stroke(); for (let k = 0; k < 12; k++) { const a = k / 12 * 2 * P; dot(cx + Math.cos(a) * r * .82, cy + Math.sin(a) * r * .82, 1.5, c2); }
    const a1 = ph * 2 * P * 3 - P / 2, a2 = ph * 2 * P * .5 - P / 2; x.strokeStyle = c2; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a1) * r * .75, cy + Math.sin(a1) * r * .75); x.stroke(); x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a2) * r * .5, cy + Math.sin(a2) * r * .5); x.stroke();
  } else if (m === 'beast') {
    const q = (Math.sin(ph * 2 * P) + 1) / 2; figure(W * .5, ground, H * .22, '#aab3c8', 1 - q); glow(W * .5, ground - H * .2, W * .3, c1, .3);
    x.globalAlpha = q; x.fillStyle = c1; x.beginPath(); x.ellipse(W * .5, ground - H * .14, W * .2, H * .1, 0, 0, 2 * P); x.fill(); x.beginPath(); x.ellipse(W * .7, ground - H * .25, W * .08, H * .07, 0, 0, 2 * P); x.fill();
    [.38, .46, .56, .62].forEach(lx => x.fillRect(W * lx, ground - H * .08, 4, H * .12)); x.beginPath(); x.moveTo(W * .72, ground - H * .3); x.lineTo(W * .76, ground - H * .4); x.lineTo(W * .68, ground - H * .31); x.fill(); x.globalAlpha = 1;
  } else if (m === 'book') {
    const cx = W * .5, cy = H * .55, fl = Math.sin(ph * 2 * P) * .3; x.fillStyle = '#e8e0cc'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx - W * .3, cy - H * (.12 + fl * .1)); x.lineTo(cx - W * .3, cy + H * .14); x.lineTo(cx, cy + H * .2); x.fill(); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + W * .3, cy - H * (.12 - fl * .1)); x.lineTo(cx + W * .3, cy + H * .14); x.lineTo(cx, cy + H * .2); x.fill();
    for (let k = 0; k < 6; k++) { const life = (ph + k / 6) % 1; x.fillStyle = k % 2 ? c1 : c2; x.globalAlpha = Math.sin(life * P); x.font = 'bold 10px serif'; x.fillText('✦ᚱᛟ'[k % 3], W * (.3 + .4 * (k / 6)), cy - life * H * .4); } x.globalAlpha = 1;
  } else if (m === 'music') {
    figure(W * .3, ground, H * .22, '#aab3c8');
    for (let k = 0; k < 4; k++) { const life = (ph + k / 4) % 1, px = W * (.38 + life * .45), py = ground - H * (.3 + .25 * life) + Math.sin(life * 6) * 6; x.globalAlpha = Math.sin(life * P); x.fillStyle = k % 2 ? c1 : c2; x.font = `bold ${12 + 4 * (k % 2)}px serif`; x.fillText(k % 2 ? '♪' : '♫', px, py); } x.globalAlpha = 1;
  } else if (m === 'multi') {
    swingScene([[0, -P * .62, P * .22], [.36, P * .22, -P * .5]], c2, c1, null, r => { for (let k = 0; k < 6; k++) { const sa = k / 6 * 2 * P, d = 4 + r * 14; dot(W * .7 + Math.cos(sa) * d, ground - H * .26 + Math.sin(sa) * d, 1.6, c2, 1 - r); } });
  } else if (m === 'punch') {
    // two quick jabs then a hook; the fist has knuckles and a thumb, the target rocks back
    const fx = W * .3, fs = H * .22 * 1.35, sx = fx + fs * .14, sy = ground - fs * .5, jab = t0 => { const q = (ph - t0) / .16; return q < 0 || q > 1 ? 0 : Math.sin(q * P); };
    const e = Math.max(jab(.05), jab(.3), jab(.55) * 1.15), hit = [.13, .38, .63].find(h => ph > h && ph < h + .12), rock = hit ? 4 : 0;
    figure(fx + e * 3, ground, H * .22); figure(W * .74 + rock, ground, H * .2, '#8d96ab');
    const reach = W * (.1 + .27 * e), hx = sx + reach, hy = sy - fs * .05 + (ph > .5 ? -Math.sin(e * P) * 3 : 0);
    x.strokeStyle = '#aab3c8'; x.lineCap = 'round'; x.lineWidth = fs * .17; x.beginPath(); x.moveTo(sx, sy); x.lineTo(hx - fs * .1, hy); x.stroke();
    if (e > .6) for (let k = 0; k < 3; k++) { x.strokeStyle = c2; x.globalAlpha = .5 * e; x.lineWidth = 1.2; x.beginPath(); x.moveTo(hx - fs * (.35 + k * .12), hy - 4 + k * 4); x.lineTo(hx - fs * .2, hy - 4 + k * 4); x.stroke(); } x.globalAlpha = 1;
    x.save(); x.translate(hx, hy); const r = fs * .14; x.fillStyle = '#c3cbdc'; x.beginPath(); x.roundRect ? x.roundRect(-r * 1.1, -r, r * 2, r * 2, r * .6) : x.arc(0, 0, r, 0, 2 * P); x.fill();
    x.strokeStyle = 'rgba(40,48,66,.55)'; x.lineWidth = 1; for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(r * .2, -r + k * r * .5); x.lineTo(r * .85, -r + k * r * .5); x.stroke(); } x.beginPath(); x.moveTo(-r * .6, r * .3); x.quadraticCurveTo(0, r * .55, r * .3, r * .2); x.stroke(); x.restore();
    if (hit) { const q = (ph - hit) / .12, cx = W * .74 - fs * .1, cy = hy; x.fillStyle = c1; x.globalAlpha = 1 - q; x.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * 2 * P, rr = (k % 2 ? 3 : 9) * (0.7 + q); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); x.globalAlpha = 1; }
  } else if (m === 'smite') {
    if (ph < .3) glow(W * .4, ground - H * .45, W * .22, c1, ph / .3 * .5);
    swingScene([[0, -P * .62, P * .2]], c2, c1, c1, r => { glow(W * .72, ground - H * .25, 10 + r * 30, c1, 1 - r); for (let k = 0; k < 6; k++) { x.strokeStyle = c2; x.globalAlpha = 1 - r; x.lineWidth = 1.5; x.beginPath(); x.moveTo(W * .72 + (k - 2.5) * 2, 0); x.lineTo(W * .72 + (k - 2.5) * 4, ground - H * .25); x.stroke(); } x.globalAlpha = 1; });
  } else if (m === 'steed') {
    // a horse forms out of light inside a summoning circle, rears, then trots in place
    const cx = W * .5, q = Math.min(1, ph / .45), rear = ph > .45 && ph < .65 ? Math.sin((ph - .45) / .2 * P) : 0, trot = ph > .65 ? Math.sin(ph * 16 * P) : 0;
    x.strokeStyle = c1; x.lineWidth = 2; x.globalAlpha = .8; x.beginPath(); x.ellipse(cx, ground + H * .04, W * .36, H * .06, 0, 0, 2 * P); x.stroke(); x.globalAlpha = 1;
    for (let k = 0; k < 7; k++) { const a = ph * 2 * P + k / 7 * 2 * P; dot(cx + Math.cos(a) * W * .36, ground + H * .04 + Math.sin(a) * H * .06, 2, c2); }
    glow(cx, ground - H * .25, W * .35, c1, .35 * q);
    x.save(); x.translate(cx, ground + H * .02); x.rotate(-rear * .35); x.globalAlpha = q; const s2 = W * .0055; x.scale(s2, s2);
    const body = x.createLinearGradient(0, -60, 0, 0); body.addColorStop(0, c2); body.addColorStop(1, '#9aa6c0'); x.fillStyle = body; x.shadowColor = c1; x.shadowBlur = 10;
    const leg = (lx, ang, back) => { x.save(); x.translate(lx, -22); x.rotate(ang); x.fillStyle = back ? '#7d88a3' : body; x.beginPath(); x.moveTo(-2.6, 0); x.lineTo(2.6, 0); x.lineTo(2, 12); x.lineTo(2.4, 22); x.lineTo(-2.2, 22); x.lineTo(-2, 12); x.closePath(); x.fill(); x.fillStyle = '#3a4155'; x.fillRect(-2.6, 20, 5.2, 3); x.restore(); };
    leg(-22, -.15 + trot * .25, 1); leg(18, .2 - trot * .25 - rear * .9, 1);
    // torso, neck, head, tail
    x.fillStyle = body; x.beginPath(); x.ellipse(0, -30, 30, 12, 0, 0, 2 * P); x.fill();
    x.beginPath(); x.moveTo(18, -38); x.quadraticCurveTo(26, -58, 34, -66); x.lineTo(42, -64); x.quadraticCurveTo(36, -48, 30, -28); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(32, -70); x.quadraticCurveTo(44, -72, 52, -60); x.quadraticCurveTo(54, -55, 48, -54); x.quadraticCurveTo(42, -58, 36, -58); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(33, -70); x.lineTo(35, -78); x.lineTo(38, -70); x.fill();
    x.shadowBlur = 0; x.fillStyle = c1; x.beginPath(); x.moveTo(20, -40); x.quadraticCurveTo(24, -62, 34, -70); x.quadraticCurveTo(28, -56, 26, -36); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-28, -36); x.quadraticCurveTo(-46, -34 + trot * 3, -44, -10); x.quadraticCurveTo(-36, -24, -27, -28); x.closePath(); x.fill();
    dot(44, -64, 1.6, '#1b2131');
    leg(-18, .1 - trot * .25, 0); leg(22, -.1 + trot * .25 - rear * 1.1, 0);
    x.restore(); x.globalAlpha = 1;
  } else if (m === 'cannon') {
    // a small walking cannon on two legs fires a blast across at a target
    const fire = ph > .3 && ph < .4, rec = ph > .3 ? Math.max(0, 1 - (ph - .3) / .2) * 4 : 0, bx = W * .26 - rec, by = ground - H * .14, step = Math.sin(ph * 8 * P) * (ph < .25 ? 1 : 0);
    crowd([[.76, .2], [.86, .8]], () => (ph > .5 && ph < .62 ? 2 : 0));
    x.strokeStyle = '#6b5440'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx - 5, by + 4); x.lineTo(bx - 9 + step * 2, ground + H * .06); x.moveTo(bx + 5, by + 4); x.lineTo(bx + 9 - step * 2, ground + H * .06); x.stroke();
    x.fillStyle = '#8a6a4a'; x.beginPath(); x.ellipse(bx, by + 2, 11, 6, 0, 0, 2 * P); x.fill();
    x.save(); x.translate(bx, by - 2); x.rotate(-.12); const g = x.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, '#d7dde8'); g.addColorStop(.5, '#8d97aa'); g.addColorStop(1, '#4b5367'); x.fillStyle = g;
    x.beginPath(); x.moveTo(-8, -6); x.lineTo(16, -4.5); x.lineTo(16, 4.5); x.lineTo(-8, 6); x.quadraticCurveTo(-13, 0, -8, -6); x.fill(); x.fillStyle = '#c9a24e'; x.fillRect(12, -5.5, 4, 11); x.fillRect(-2, -6, 2.5, 12); x.restore();
    dot(bx - 3, by + 2, 1.5, c2); glow(bx - 3, by + 2, 5, c1, .6);
    if (fire) glow(bx + 17, by - 4, 14, c2, 1);
    if (ph > .3 && ph < .55) { const q = (ph - .3) / .2; if (q < 1) { const px = bx + 17 + q * (W * .74 - bx - 17), py = by - 4 - Math.sin(q * P) * H * .06; for (let k = 0; k < 5; k++) dot(px - k * 4, py + k * .3, 3.5 - k * .5, c1, .7 - k * .12); dot(px, py, 3.5, c2); } }
    if (ph > .5 && ph < .8) { const r = (ph - .5) / .3; glow(W * .76, ground - H * .22, 8 + r * 24, c1, 1 - r); for (let k = 0; k < 10; k++) { const a = k / 10 * 2 * P; dot(W * .76 + Math.cos(a) * r * 18, ground - H * .22 + Math.sin(a) * r * 14, 1.8, c2, 1 - r); } }
    if (ph > .32 && ph < .7) for (let k = 0; k < 4; k++) { const r = (ph - .32) / .38; x.fillStyle = 'rgba(200,205,215,' + (.35 * (1 - r)) + ')'; x.beginPath(); x.arc(bx + 18 + k * 3, by - 6 - r * 12 - k * 3, 3 + r * 5, 0, 2 * P); x.fill(); }
  } else if (m === 'slip') {
    // an oily slick spreads, someone walks onto it, their feet go out and they land on their back
    const cx = W * .55, spread = Math.min(1, ph / .2);
    const sl = x.createRadialGradient(cx, ground + H * .07, 2, cx, ground + H * .07, W * .34); sl.addColorStop(0, c2); sl.addColorStop(1, c1); x.fillStyle = sl; x.globalAlpha = .75; x.beginPath(); x.ellipse(cx, ground + H * .07, W * .34 * spread, H * .055 * spread, 0, 0, 2 * P); x.fill();
    x.globalAlpha = .7; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx - W * .1 * spread, ground + H * .055, W * .06 * spread, H * .012, 0, 0, 2 * P); x.fill(); x.globalAlpha = 1;
    const walk = Math.min(1, Math.max(0, (ph - .1) / .3)), fall = Math.max(0, Math.min(1, (ph - .42) / .14)), lie = ph > .56, px = W * (.18 + .34 * walk) + fall * W * .06, bob = walk < 1 ? Math.abs(Math.sin(walk * 6 * P)) * 1.5 : 0;
    x.save(); x.translate(px, ground + H * .02); x.rotate(-fall * P / 2 * (1 + (fall < 1 ? Math.sin(fall * P) * .25 : 0))); figure(0, -H * .02 - bob - fall * H * .02, H * .2, '#aab3c8'); x.restore();
    if (fall > 0 && fall < 1) { x.strokeStyle = c2; x.lineWidth = 1.5; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(px + W * .06, ground - H * .06 - k * 4, 4 + k * 3, P * 1.1, P * 1.6); x.stroke(); } }
    if (lie) for (let k = 0; k < 3; k++) { const a = ph * 6 * P + k * 2.1; x.fillStyle = c2; x.font = 'bold 8px sans-serif'; x.fillText('✦', px - W * .1 + Math.cos(a) * 8, ground - H * .12 + Math.sin(a) * 3); }
  } else if (m === 'aura') {
    figure(W * .5, ground, H * .22, '#cfd6e6');
    for (let k = 0; k < 3; k++) { const life = (ph + k / 3) % 1; x.strokeStyle = c1; x.globalAlpha = 1 - life; x.lineWidth = 2; x.beginPath(); x.ellipse(W * .5, ground - H * .05, W * (.1 + life * .4), H * (.03 + life * .12), 0, 0, 2 * P); x.stroke(); } x.globalAlpha = 1; glow(W * .5, ground - H * .2, W * .3, c1, .3);
  } else if (m === 'cloud') {
    crowd([[.28, .3], [.5, 0], [.72, .4], [.6, .9]], px => Math.sin(ph * 6 * P + px * 9) * 1.2);
    for (let k = 0; k < 11; k++) { const a = k / 11 * 2 * P + ph * P, r = W * (.24 + .05 * Math.sin(ph * 4 * P + k)); x.fillStyle = k % 2 ? c1 : c2; x.globalAlpha = .38; x.beginPath(); x.arc(W * .5 + Math.cos(a) * r, ground - H * .25 + Math.sin(a) * r * .45, W * .13, 0, 2 * P); x.fill(); } x.globalAlpha = 1;
  } else if (m === 'meteor') {
    crowd([[.25, .3], [.5, 0], [.75, .3], [.62, .9], [.38, .9]]);
    for (let k = 0; k < 3; k++) { const q = ((ph + k / 3) % 1), tx = W * (.3 + k * .2), px = tx + (1 - q) * W * .35, py = q * (ground - H * .05); if (q < .85) { for (let t = 0; t < 6; t++) dot(px + t * 4, py - t * 5, 4 - t * .5, c1, .6 - t * .08); dot(px, py, 4.5, c2); } else glow(tx, ground - H * .05, 24, c1, (1 - q) * 6); }
  } else if (m === 'heart') {
    figure(W * .5, ground, H * .24, '#aab3c8'); const s = 7 + 3 * Math.abs(Math.sin(ph * 2 * P * 2)), px = W * .5, py = ground - H * .52;
    x.fillStyle = c1; x.beginPath(); x.moveTo(px, py + s); x.bezierCurveTo(px - s * 1.6, py - s * .2, px - s * .6, py - s * 1.4, px, py - s * .4); x.bezierCurveTo(px + s * .6, py - s * 1.4, px + s * 1.6, py - s * .2, px, py + s); x.fill(); glow(px, py, s * 2.4, c1, .35);
  } else if (m === 'armor') {
    const cx = W * .5, cy = H * .5, sh = (ph * 1.4) % 1.4; x.fillStyle = '#8f9bb3'; x.beginPath(); x.moveTo(cx - W * .22, cy - H * .25); x.lineTo(cx + W * .22, cy - H * .25); x.lineTo(cx + W * .2, cy + H * .1); x.quadraticCurveTo(cx, cy + H * .32, cx - W * .2, cy + H * .1); x.closePath(); x.fill(); x.strokeStyle = c1; x.lineWidth = 2; x.stroke();
    x.save(); x.clip(); x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.moveTo(cx - W * .4 + sh * W * .5, cy - H * .3); x.lineTo(cx - W * .32 + sh * W * .5, cy - H * .3); x.lineTo(cx - W * .5 + sh * W * .5, cy + H * .3); x.lineTo(cx - W * .58 + sh * W * .5, cy + H * .3); x.fill(); x.restore();
  } else if (m === 'crit') {
    swingScene([[0, -P * .66, P * .25]], '#ffffff', c1, null, r => { const cx = W * .72, cy = ground - H * .28; x.fillStyle = c1; x.globalAlpha = 1 - r * .7; x.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * 2 * P, rr = (k % 2 ? 6 : 16) * (0.5 + r); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); x.globalAlpha = 1; });
  } else if (m === 'skill') {
    const cx = W * .5, cy = H * .5, a = ph * 2 * P / 3, R = W * .22; x.fillStyle = c1; x.beginPath(); for (let k = 0; k < 16; k++) { const aa = a + k / 16 * 2 * P, rr = k % 2 ? R : R * 1.25; x.lineTo(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr); } x.closePath(); x.fill(); dot(cx, cy, R * .45, '#1b2131');
    for (let k = 0; k < 4; k++) { const life = (ph + k / 4) % 1; dot(cx + W * .3 * Math.cos(k * 1.6), cy - H * .3 * life, 2, c2, Math.sin(life * P)); }
  } else if (m === 'create') {
    const q = ease(Math.min(1, ph / .6)), cx = W * .5, cy = ground - H * .12; glow(cx, cy - H * .1, W * .3, c1, .4 * q);
    x.save(); x.translate(cx, cy); x.scale(q, q); x.fillStyle = c2; x.fillRect(-W * .12, -H * .18, W * .24, H * .18); x.fillStyle = c1; x.fillRect(-W * .12, -H * .18, W * .24, H * .05); x.restore();
    for (let k = 0; k < 8; k++) { const a = k / 8 * 2 * P + ph * 3, d = (1 - q) * W * .35 + 6; dot(cx + Math.cos(a) * d, cy - H * .1 + Math.sin(a) * d * .7, 2, c2, 1 - q * .5); }
  } else if (m === 'undead') {
    const q = ease(Math.min(1, ph / .7)); x.save(); x.beginPath(); x.rect(0, 0, W, ground + H * .08); x.clip(); const by = ground + (1 - q) * H * .45;
    x.fillStyle = '#d9d4c3'; dot(W * .5, by - H * .36, H * .08, '#d9d4c3'); x.fillRect(W * .5 - 2, by - H * .28, 4, H * .22); for (let k = 0; k < 3; k++) x.fillRect(W * .5 - 9, by - H * (.24 - k * .05), 18, 2); dot(W * .48, by - H * .37, 1.6, c1); dot(W * .52, by - H * .37, 1.6, c1); x.restore();
    for (let k = 0; k < 6; k++) { const life = (ph + k / 6) % 1; dot(W * (.3 + .4 * (k / 6)), ground - life * H * .3, 2, c1, Math.sin(life * P) * .7); }
  } else if (m === 'lock') {
    const cx = W * .5, cy = H * .55, open = Math.max(0, Math.sin(ph * 2 * P)); x.strokeStyle = c1; x.lineWidth = 4; x.beginPath(); x.arc(cx, cy - H * .12 - open * 8, W * .12, P, 0); x.stroke();
    x.fillStyle = c2; x.fillRect(cx - W * .17, cy - H * .12, W * .34, H * .26); dot(cx, cy, 3.5, '#1b2131'); glow(cx, cy, W * .35, c1, .25);
  } else {
    for (let k = 0; k < 16; k++) { const life = (ph + k / 16) % 1, px = W * (.15 + .7 * ((k * 7 % 16) / 16)), py = H * (.2 + .6 * ((k * 11 % 16) / 16)); const s = Math.sin(life * P) * 4; x.fillStyle = k % 2 ? c1 : c2; x.globalAlpha = Math.sin(life * P); x.beginPath(); x.moveTo(px, py - s * 2); x.lineTo(px + s * .5, py - s * .5); x.lineTo(px + s * 2, py); x.lineTo(px + s * .5, py + s * .5); x.lineTo(px, py + s * 2); x.lineTo(px - s * .5, py + s * .5); x.lineTo(px - s * 2, py); x.lineTo(px - s * .5, py - s * .5); x.fill(); }
    x.globalAlpha = 1; glow(W * .5, H * .5, W * .3, c1, .25);
  }
}
let VFX_RAF = 0;
// Put the animation in the open tooltip and run it while the tooltip is showing.
function tipVfx(t, v) {
  if (!t || !v) return; cancelAnimationFrame(VFX_RAF);
  const cv = document.createElement('canvas'); cv.className = 'tipfx'; const S2 = 2, W = 96, H = 96; cv.width = W * S2; cv.height = H * S2; cv.setAttribute('aria-hidden', 'true');
  t.insertBefore(cv, t.firstChild); const x = cv.getContext('2d'); x.scale(S2, S2); const t0 = performance.now();
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = now => { if (!cv.isConnected || !t.classList.contains('on')) return; x.save(); vfxDraw(x, W, H, reduce ? 700 : now - t0, v); x.restore(); if (!reduce) VFX_RAF = requestAnimationFrame(step); };
  step(t0);
}
// What to draw for each kind of info box.
function vfxForSpell(sp) { const h = vfxHand('sp', sp.name, sp.base, sp.orig); if (h) return h; const sm = (() => { try { return spellMath(sp); } catch (e) { return {}; } })(); return vfxPick(sp.name, (sp.summary || '') + ' ' + (fullOfSpell(sp) || ''), { type: vfxType(sm.type), school: sp.school, heal: !!sm.heal && !sm.dice, attack: !!sm.attack }); }
function vfxForFeat(f) { return vfxWithWeapon(vfxForFeat0(f), f.dname || f.name); }
function vfxForFeat0(f) { const pk = /^pick:(\w+):(.+)$/.exec(String(f.key || '')); const h = (pk && vfxHand('op', pk[1] + ':' + pk[2])) || vfxHand('f', f.dname, f.name) || (pk && vfxHand('f', pk[2])) || vfxHand('sp', f.name) || vfxHand('mi', f.name); if (h) return h; const fx = (() => { try { return fxOf(f); } catch (e) { return {}; } })(); return vfxPick(f.dname || f.name, (f.desc || '') + ' ' + (fullOfFeat(f) || '') + ' ' + (fx.text || ''), {}); }
const vfxWeaponKind = n => { n = String(n || '').toLowerCase(); return /\baxe|halberd/.test(n) ? 'axe' : /hammer|mace|maul|club|flail|morningstar|greatclub|rod of lordly/.test(n) ? 'hammer' : /spear|pike|trident|lance|glaive|javelin/.test(n) ? 'spear' : /quarterstaff|\bstaff/.test(n) ? 'staff' : /dagger|knife|sickle|shortsword|kukri/.test(n) ? 'dagger' : ''; };
const vfxWithWeapon = (v, ...names) => { const w = names.map(vfxWeaponKind).find(Boolean); return w ? Object.assign({}, v, { w }) : v; };
function vfxForAttack0(a, it) { return vfxPick(a.name + (it && it.weapon ? ' ' + it.weapon.base : ''), (a.notes || '') + ' ' + (a.type || ''), { weapon: a.kind === 'ranged' || (it && it.weapon && it.weapon.kind === 'ranged') ? 'ranged' : 'melee', type: vfxType(a.type) }); }
function vfxForAttack(a, it) { return vfxWithWeapon(vfxForAttack0(a, it), it && it.weapon && it.weapon.base, a.name, it && it.name); }
function vfxForItem(it) { return vfxWithWeapon(vfxForItem0(it), it.weapon && it.weapon.base, it.name); }
function vfxForItem0(it) { const h = vfxHand('mi', it.magic && it.magic.name, it.name); if (h) return h; if (it.weapon) return vfxPick(it.name + ' ' + it.weapon.base, it.weapon.type, { weapon: it.weapon.kind === 'ranged' ? 'ranged' : 'melee', type: vfxType(it.weapon.type) }); if (it.armor) return vfxPick('shield', '', {}); if (/elixir|potion|philter|oil of/i.test(it.name) && !/healing/i.test(it.name)) return Object.assign(vfxPick(it.name, '', {}), { motif: 'morph', c: VFX_COL.trans }); return vfxPick(it.name, (it.summary || '') + ' ' + (it.notes || '') + ' ' + (fullOfItem(it) || ''), { heal: /potion of healing|healing/i.test(it.name) }); }
