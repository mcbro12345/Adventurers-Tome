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
  const ease = q => q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2, ground = H * .8;
  x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(0, ground + H * .08, W, 1);
  const m = v.motif;
  if (m === 'bolt' || m === 'arrow' || m === 'zap') {
    figure(W * .2, ground, H * .2); figure(W * .8, ground, H * .2, '#8d96ab');
    const q = Math.min(1, ph / .6), sx = W * .28, sy = ground - H * .2, ex = W * .74, ey = ground - H * .22, px = sx + (ex - sx) * ease(q), py = sy + (ey - sy) * ease(q) - Math.sin(q * P) * H * (m === 'arrow' ? .12 : .04);
    if (ph < .6) {
      if (m === 'arrow') { const a = Math.atan2(ey - sy - Math.cos(q * P) * H * .12 * P, ex - sx); x.save(); x.translate(px, py); x.rotate(a * .6); x.strokeStyle = c2; x.lineWidth = 2; x.beginPath(); x.moveTo(-14, 0); x.lineTo(6, 0); x.stroke(); x.fillStyle = c1; x.beginPath(); x.moveTo(9, 0); x.lineTo(3, -3); x.lineTo(3, 3); x.fill(); x.restore(); }
      else if (m === 'zap') { x.strokeStyle = c2; x.lineWidth = 2.5; x.shadowColor = c1; x.shadowBlur = 10; x.beginPath(); x.moveTo(sx, sy); let lx = sx; for (let k = 1; k <= 7; k++) { const fx = sx + (px - sx) * k / 7; x.lineTo(fx, sy + (py - sy) * k / 7 + (k < 7 ? (rnd() - .5) * 14 : 0)); lx = fx; } x.stroke(); x.shadowBlur = 0; }
      else { for (let k = 0; k < 8; k++) { const tq = Math.max(0, q - k * .03), tx = sx + (ex - sx) * ease(tq), ty = sy + (ey - sy) * ease(tq); dot(tx, ty, 5 - k * .5, c1, .5 - k * .05); } glow(px, py, 12, c1); dot(px, py, 4, c2); }
    } else { const r = (ph - .6) / .4; glow(ex, ey, 10 + r * 26, c1, 1 - r); for (let k = 0; k < 10; k++) { const a = rnd() * 2 * P, d = r * (14 + rnd() * 16); dot(ex + Math.cos(a) * d, ey + Math.sin(a) * d, 2, c2, 1 - r); } }
  } else if (m === 'cone' || m === 'line') {
    figure(W * .16, ground, H * .2); const ox = W * .25, oy = ground - H * .2;
    for (let k = 0; k < 46; k++) { const life = (ph + k / 46) % 1, a = (rnd() - .5) * (m === 'cone' ? .9 : .12), d = life * W * .75; dot(ox + Math.cos(a) * d, oy + Math.sin(a) * d, 2 + life * (m === 'cone' ? 5 : 3), life < .5 ? c2 : c1, (1 - life) * .9); }
    glow(ox, oy, 12, c1, .8);
  } else if (m === 'burst' || m === 'storm') {
    figure(W * .5, ground, H * .2, '#8d96ab'); const cx = W * .5, cy = ground - H * .22;
    if (m === 'storm') { x.fillStyle = 'rgba(160,170,200,.35)'; x.beginPath(); x.ellipse(W * .5, H * .16, W * .34, H * .09, 0, 0, 2 * P); x.fill(); if (ph < .3) { x.strokeStyle = c2; x.lineWidth = 2.5; x.shadowColor = c1; x.shadowBlur = 12; x.beginPath(); x.moveTo(W * .5, H * .2); for (let k = 1; k <= 5; k++) x.lineTo(W * .5 + (rnd() - .5) * 16, H * .2 + (cy - H * .2) * k / 5); x.stroke(); x.shadowBlur = 0; } }
    const r = (ph < .25 ? 0 : (ph - .25) / .75); if (r > 0) { glow(cx, cy, 8 + r * W * .42, c1, 1 - r * .9); x.strokeStyle = c2; x.globalAlpha = 1 - r; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r * W * .4, 0, 2 * P); x.stroke(); x.globalAlpha = 1; for (let k = 0; k < 14; k++) { const a = k / 14 * 2 * P + rnd() * .3, d = r * W * (.25 + rnd() * .2); dot(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2.2, c2, 1 - r); } }
    else { const q = ph / .25; dot(W * .5, H * .1 + (cy - H * .1) * q, 4, c2); glow(W * .5, H * .1 + (cy - H * .1) * q, 10, c1); }
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
    const cx = W * .5, cy = ground; x.strokeStyle = c1; x.lineWidth = 2; x.globalAlpha = .9; x.beginPath(); x.ellipse(cx, cy, W * .3, H * .07, 0, 0, 2 * P); x.stroke();
    for (let k = 0; k < 6; k++) { const a = ph * 2 * P + k / 6 * 2 * P; dot(cx + Math.cos(a) * W * .3, cy + Math.sin(a) * H * .07, 2.5, c2); } x.globalAlpha = 1;
    const rise = Math.min(1, ph / .6); glow(cx, cy - H * .15, W * .25, c1, .35); x.save(); x.beginPath(); x.rect(0, 0, W, cy); x.clip();
    x.fillStyle = '#9aa3bb'; x.globalAlpha = rise; const by = cy + (1 - rise) * H * .4; x.beginPath(); x.ellipse(cx, by - H * .18, W * .14, H * .12, 0, 0, 2 * P); x.fill(); x.beginPath(); x.arc(cx + W * .1, by - H * .32, H * .07, 0, 2 * P); x.fill(); dot(cx + W * .13, by - H * .33, 1.6, c2, rise); x.restore(); x.globalAlpha = 1;
  } else if (m === 'slash') {
    figure(W * .3, ground, H * .22); figure(W * .74, ground, H * .2, '#8d96ab');
    const q = Math.min(1, ph / .4), a0 = -P * .75, a1 = P * .1, a = a0 + (a1 - a0) * ease(q), cx = W * .42, cy = ground - H * .24, R = W * .3;
    if (ph < .55) { x.strokeStyle = c2; x.lineWidth = 3; x.globalAlpha = .9; x.beginPath(); x.arc(cx, cy, R, a0, a, false); x.stroke(); x.strokeStyle = c1; x.lineWidth = 7; x.globalAlpha = .25; x.beginPath(); x.arc(cx, cy, R, Math.max(a0, a - .9), a); x.stroke(); x.globalAlpha = 1; dot(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 3, '#fff'); }
    if (ph > .35 && ph < .75) { const r = (ph - .35) / .4; for (let k = 0; k < 8; k++) { const sa = rnd() * 2 * P, d = r * 18; dot(W * .7 + Math.cos(sa) * d, ground - H * .25 + Math.sin(sa) * d, 1.8, c2, 1 - r); } }
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
    const sh = Math.sin(ph * 40) * 2; figure(W * .5 + sh, ground, H * .22, '#8d96ab'); x.strokeStyle = c1; x.lineWidth = 2.5;
    x.beginPath(); x.moveTo(W * .1, ground + H * .08); for (let k = 1; k <= 8; k++) x.lineTo(W * (.1 + k * .1), ground + H * .08 + ((k % 2) ? -5 : 5) * Math.min(1, ph * 2)); x.stroke();
    for (let k = 0; k < 6; k++) { const life = (ph * 1.3 + k / 6) % 1, px = W * (.2 + .6 * ((k * 3 % 6) / 6)), py = ground + H * .08 - Math.sin(life * P) * H * .3; x.fillStyle = k % 2 ? c1 : c2; x.fillRect(px - 3, py - 3, 6, 6); }
  } else if (m === 'gust') {
    const push = ease(Math.min(1, ph / .7)); figure(W * (.62 + push * .2), ground, H * .2, '#8d96ab');
    for (let k = 0; k < 6; k++) { const life = (ph * 1.4 + k / 6) % 1, yy = ground - H * (.08 + k * .07); x.strokeStyle = k % 2 ? c1 : c2; x.globalAlpha = .7 * Math.sin(life * P); x.lineWidth = 2; x.beginPath(); x.moveTo(W * (.05 + life * .6), yy); x.quadraticCurveTo(W * (.15 + life * .6), yy - 6, W * (.28 + life * .6), yy); x.stroke(); } x.globalAlpha = 1;
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
    figure(W * .25, ground, H * .2); figure(W * .75, ground, H * .2, '#8d96ab');
    [[.38, .32, 0], [.62, .5, .5]].forEach(([bx, by, off]) => { const a = Math.max(0, Math.sin(((ph + off) % 1) * P)); x.globalAlpha = a; x.fillStyle = c1; x.beginPath(); x.ellipse(W * bx, H * by, W * .14, H * .09, 0, 0, 2 * P); x.fill(); for (let k = -1; k <= 1; k++) dot(W * bx + k * 6, H * by, 1.8, '#1b2131', a); x.globalAlpha = 1; });
  } else if (m === 'glyph') {
    figure(W * .5, ground - H * .05, H * .2, '#8d96ab', ph > .6 ? 1 - (ph - .6) * 1.5 : 1); const cx = W * .5, cy = ground + H * .02, pul = .5 + .5 * Math.sin(ph * 2 * P);
    x.strokeStyle = c1; x.globalAlpha = .6 + .4 * pul; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, W * .34, H * .09, 0, 0, 2 * P); x.stroke(); x.beginPath(); x.ellipse(cx, cy, W * .24, H * .06, 0, 0, 2 * P); x.stroke();
    for (let k = 0; k < 6; k++) { const a = ph * P + k / 6 * 2 * P; dot(cx + Math.cos(a) * W * .29, cy + Math.sin(a) * H * .075, 2, c2); } x.globalAlpha = 1; if (ph > .6) glow(cx, cy - H * .2, W * .3 * (ph - .6) * 2.5, c1, 1 - (ph - .6) * 2.5);
  } else if (m === 'hand') {
    const q = ease((Math.sin(ph * 2 * P) + 1) / 2), hx = W * (.3 + .4 * q), hy = H * (.45 - .15 * Math.sin(q * P));
    glow(hx, hy, 16, c1, .5); x.fillStyle = c2; x.globalAlpha = .85; x.beginPath(); x.ellipse(hx, hy, 9, 11, 0, 0, 2 * P); x.fill(); for (let k = 0; k < 4; k++) { x.fillRect(hx - 8 + k * 5, hy - 20, 3.5, 11); } x.globalAlpha = 1;
    x.fillStyle = '#c9a36b'; x.fillRect(hx - 6, hy + 12, 12, 9);
  } else if (m === 'weather') {
    x.fillStyle = 'rgba(170,180,205,.6)'; x.beginPath(); x.ellipse(W * .45, H * .22, W * .28, H * .1, 0, 0, 2 * P); x.ellipse(W * .62, H * .2, W * .2, H * .09, 0, 0, 2 * P); x.fill();
    for (let k = 0; k < 18; k++) { const life = (ph * 2 + k / 18) % 1, px = W * (.2 + .6 * ((k * 7 % 18) / 18)); x.strokeStyle = c1; x.globalAlpha = .8; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, H * .3 + life * H * .55); x.lineTo(px - 3, H * .3 + life * H * .55 + 7); x.stroke(); } x.globalAlpha = 1;
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
    figure(W * .3, ground, H * .22); figure(W * .74, ground, H * .2, '#8d96ab'); const cx = W * .5, cy = ground - H * .26;
    [[0, -P * .75, P * .1], [.4, P * .75, -P * .1]].forEach(([off, a0, a1]) => { const q = (ph - off) / .35; if (q < 0 || q > 1.4) return; const a = a0 + (a1 - a0) * ease(Math.min(1, q)); x.strokeStyle = c2; x.lineWidth = 3; x.globalAlpha = Math.min(1, 1.4 - q); x.beginPath(); x.arc(cx, cy, W * .26, Math.min(a0, a), Math.max(a0, a)); x.stroke(); x.globalAlpha = 1; });
  } else if (m === 'punch') {
    figure(W * .28, ground, H * .22); figure(W * .74, ground, H * .2, '#8d96ab');
    for (let k = 0; k < 3; k++) { const q = ((ph * 3 + k / 3) % 1), px = W * (.36 + .3 * ease(q)), py = ground - H * (.22 + k * .06); dot(px, py, 5, c1, 1 - q * .3); if (q > .85) glow(W * .68, py, 12, c2, 1); }
  } else if (m === 'smite') {
    figure(W * .3, ground, H * .22); figure(W * .74, ground, H * .2, '#8d96ab'); const q = Math.min(1, ph / .4), a = -P * .7 + P * .8 * ease(q), cx = W * .42, cy = ground - H * .24;
    x.strokeStyle = c2; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * W * .3, cy + Math.sin(a) * W * .3); x.stroke();
    if (ph > .4) { const r = (ph - .4) / .6; glow(W * .72, ground - H * .25, 10 + r * 30, c1, 1 - r); for (let k = 0; k < 6; k++) { x.strokeStyle = c2; x.globalAlpha = 1 - r; x.beginPath(); x.moveTo(W * .72, 0); x.lineTo(W * .72 + (k - 2.5) * 3, ground - H * .25); x.stroke(); } x.globalAlpha = 1; }
  } else if (m === 'aura') {
    figure(W * .5, ground, H * .22, '#cfd6e6');
    for (let k = 0; k < 3; k++) { const life = (ph + k / 3) % 1; x.strokeStyle = c1; x.globalAlpha = 1 - life; x.lineWidth = 2; x.beginPath(); x.ellipse(W * .5, ground - H * .05, W * (.1 + life * .4), H * (.03 + life * .12), 0, 0, 2 * P); x.stroke(); } x.globalAlpha = 1; glow(W * .5, ground - H * .2, W * .3, c1, .3);
  } else if (m === 'cloud') {
    figure(W * .5, ground, H * .2, '#8d96ab');
    for (let k = 0; k < 9; k++) { const a = k / 9 * 2 * P + ph * P, r = W * (.18 + .05 * Math.sin(ph * 4 * P + k)); x.fillStyle = k % 2 ? c1 : c2; x.globalAlpha = .45; x.beginPath(); x.arc(W * .5 + Math.cos(a) * r, ground - H * .25 + Math.sin(a) * r * .6, W * .12, 0, 2 * P); x.fill(); } x.globalAlpha = 1;
  } else if (m === 'meteor') {
    figure(W * .5, ground, H * .2, '#8d96ab');
    for (let k = 0; k < 3; k++) { const q = ((ph + k / 3) % 1), sx = W * (.85 - k * .2), px = sx - q * W * .4, py = q * (ground - H * .05); if (q < .85) { for (let t = 0; t < 6; t++) dot(px + t * 4, py - t * 5, 4 - t * .5, c1, .6 - t * .08); dot(px, py, 4.5, c2); } else glow(px, ground - H * .05, 22, c1, (1 - q) * 6); }
  } else if (m === 'heart') {
    figure(W * .5, ground, H * .24, '#aab3c8'); const s = 7 + 3 * Math.abs(Math.sin(ph * 2 * P * 2)), px = W * .5, py = ground - H * .52;
    x.fillStyle = c1; x.beginPath(); x.moveTo(px, py + s); x.bezierCurveTo(px - s * 1.6, py - s * .2, px - s * .6, py - s * 1.4, px, py - s * .4); x.bezierCurveTo(px + s * .6, py - s * 1.4, px + s * 1.6, py - s * .2, px, py + s); x.fill(); glow(px, py, s * 2.4, c1, .35);
  } else if (m === 'armor') {
    const cx = W * .5, cy = H * .5, sh = (ph * 1.4) % 1.4; x.fillStyle = '#8f9bb3'; x.beginPath(); x.moveTo(cx - W * .22, cy - H * .25); x.lineTo(cx + W * .22, cy - H * .25); x.lineTo(cx + W * .2, cy + H * .1); x.quadraticCurveTo(cx, cy + H * .32, cx - W * .2, cy + H * .1); x.closePath(); x.fill(); x.strokeStyle = c1; x.lineWidth = 2; x.stroke();
    x.save(); x.clip(); x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.moveTo(cx - W * .4 + sh * W * .5, cy - H * .3); x.lineTo(cx - W * .32 + sh * W * .5, cy - H * .3); x.lineTo(cx - W * .5 + sh * W * .5, cy + H * .3); x.lineTo(cx - W * .58 + sh * W * .5, cy + H * .3); x.fill(); x.restore();
  } else if (m === 'crit') {
    figure(W * .3, ground, H * .22); figure(W * .74, ground, H * .2, '#8d96ab'); const r = Math.max(0, (ph - .3) / .7), cx = W * .72, cy = ground - H * .3;
    if (r > 0) { x.fillStyle = c1; x.globalAlpha = 1 - r * .7; x.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * 2 * P, rr = (k % 2 ? 8 : 20) * (0.6 + r); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); x.globalAlpha = 1; } else { x.strokeStyle = c2; x.lineWidth = 3; x.beginPath(); x.moveTo(W * .36, ground - H * .3); x.lineTo(W * (.36 + ph * 1.1), ground - H * .3); x.stroke(); }
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
function vfxForFeat(f) { const pk = /^pick:(\w+):(.+)$/.exec(String(f.key || '')); const h = (pk && vfxHand('op', pk[1] + ':' + pk[2])) || vfxHand('f', f.dname, f.name) || (pk && vfxHand('f', pk[2])) || vfxHand('sp', f.name) || vfxHand('mi', f.name); if (h) return h; const fx = (() => { try { return fxOf(f); } catch (e) { return {}; } })(); return vfxPick(f.dname || f.name, (f.desc || '') + ' ' + (fullOfFeat(f) || '') + ' ' + (fx.text || ''), {}); }
function vfxForAttack(a, it) { return vfxPick(a.name + (it && it.weapon ? ' ' + it.weapon.base : ''), (a.notes || '') + ' ' + (a.type || ''), { weapon: a.kind === 'ranged' || (it && it.weapon && it.weapon.kind === 'ranged') ? 'ranged' : 'melee', type: vfxType(a.type) }); }
function vfxForItem(it) { const h = vfxHand('mi', it.magic && it.magic.name, it.name); if (h) return h; if (it.weapon) return vfxPick(it.name + ' ' + it.weapon.base, it.weapon.type, { weapon: it.weapon.kind === 'ranged' ? 'ranged' : 'melee', type: vfxType(it.weapon.type) }); if (it.armor) return vfxPick('shield', '', {}); if (/elixir|potion|philter|oil of/i.test(it.name) && !/healing/i.test(it.name)) return Object.assign(vfxPick(it.name, '', {}), { motif: 'morph', c: VFX_COL.trans }); return vfxPick(it.name, (it.summary || '') + ' ' + (it.notes || '') + ' ' + (fullOfItem(it) || ''), { heal: /potion of healing|healing/i.test(it.name) }); }
