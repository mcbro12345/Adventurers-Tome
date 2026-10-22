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
  const an = (DND.anim || {})[sec], tb = (DND.vfx || {})[sec]; if (!tb && !an) return null;
  for (const raw of names) { if (!raw) continue; const n = String(raw).trim();
    const tries = [n, n.replace(/\s*\([^)]*\)\s*$/, ''), n.replace(/^[^:]+:\s*/, ''), n.replace(/^[^:]+:\s*/, '').replace(/\s*\([^)]*\)\s*$/, ''), n.replace(/\s*[+-]\d+$/, ''), n.replace(/^[+-]\d+\s+/, '')];
    if (an) for (const k of tries) if (an[k]) return { sb: an[k], sec, key: k, motif: 'sparkle', c: VFX_COL.gold, seed: [...n].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7), name: n };
    if (tb) for (const k of tries) { const v = tb[k]; if (v) { const [motif, c] = v.split(' '); return { motif, c: VFX_COL[c] || VFX_COL.gold, seed: [...n].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7) }; } } }
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
  const pick = (motif, c) => ({ name, motif, c: c || col || VFX_COL[sch] || VFX_COL.gold, seed: [...String(name)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7) });
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
let VFX_RAF = 0;
// Put the entry's anime storyboard in the open tooltip's corner and play it while the tooltip shows.
function tipVfx(t, v) {
  if (!t || !v) return; cancelAnimationFrame(VFX_RAF);
  const cv = document.createElement('canvas'); cv.className = 'tipfx'; cv.width = cv.height = 288; cv.setAttribute('aria-hidden', 'true'); t.insertBefore(cv, t.firstChild);
  if (typeof ANI === 'undefined') return;
  ANI.play(cv, v.sb || vfxStoryboard(v), v.seed, () => cv.isConnected && t.classList.contains('on'));
}
// No storyboard written for it (homebrew, renamed things): build one from what it does, varied by its name.
const VFX_SB = {
  armor: ['@tgt:none armor:C > icon:shield:C:at=self:anim=pop', '@tgt:foe armor:C > deflect:arrow:C'], arrow: ['@w:bow shoot:arrow:C > hit', '@w:crossbow shoot:bolt:C:n=2 > mark:C'],
  aura: ['@tgt:allies aura:C:at=self > bless:C:at=all', '@tgt:none aura:C > glow:C'], banish: ['sigil:C:at=tgt > banish:C', 'charge:C > portal:C:x=74 > banish:C'],
  beast: ['@tgt:none summon:wolf:C', '@tgt:none transform:bear:C'], bless: ['@tgt:allies p_pray > bless:C:at=all', '@tgt:ally p_raise > bless:C > glow:C:at=tgt'],
  bolt: ['charge:C > bolt:C > hit', 'p_point > orb:C > burst:C'], book: ['@tgt:none book:C > icon:spellbook:C:at=mid', '@bg:library @tgt:none book:C:scroll > sparkle:C'],
  burst: ['charge:C > orb:C > burst:C:big + shake', 'p_raise > burst:C:at=self'], cannon: ['@tgt:foe summon:turret:C > shoot:bullet:C'],
  charm: ['heartshot:C > charm:C', 'speak:heart:C > charm:C'], cloud: ['p_cast > cloud:C', 'charge:C > cloud:C:bubbles > sick'],
  cone: ['charge:C > cone:C', 'p_roar > cone:C:from=mouth'], counter: ['counter:C', 'p_point > dispel:C'], create: ['@tgt:none icon:sparkle:C:at=mid > icon:gem:C:at=mid:anim=drop', '@tgt:none craft:gear:C'],
  crit: ['slash:C > crit:C', 'dash:C > crit:C'], curse: ['p_point > curse:C', 'skull:C > curse:C:skull'], dash: ['@tgt:none run:C', 'dash:C > hit'],
  dice: ['@tgt:none dice:C:n=2', '@tgt:none dice:C:nat20 > sparkle:C'], eye: ['@tgt:none eye:C', '@tgt:none see:C > scan:C:key:gem'], fear: ['p_roar > fear', 'skull:C > fear'],
  glyph: ['glyph:C:at=tgt > pillar:C', '@tgt:none glyph:C:at=self > sparkle:C'], gust: ['gust:C > push', 'p_push > gust:C:pull=1'], hand: ['@tgt:none summon:hand:C', 'grasp:C > lift:C'],
  heal: ['@tgt:ally p_pray > heal:C', '@tgt:ally give:potion:C > heal:C'], heart: ['@tgt:ally icon:heart:C:at=tgt > heal:C', '@tgt:allies inspire:C:at=all'],
  hold: ['sigil:C:at=tgt > bind:C', 'p_point > bind:C:anchor + stun'], illusion: ['@tgt:none mirror:C', 'disguise:foe'], light: ['@tgt:none light:C', '@tgt:none light_orbs:C'],
  line: ['charge:C > line:C', 'p_point > line:C > hit'], lock: ['@tgt:door unlock:C', '@tgt:door lockup:C'], mark: ['p_point > mark:C', 'p_point > mark:C:target > hit'],
  meteor: ['p_raise > meteor:C:n=3', 'charge:C:pose=raise > meteor:C'], moon: ['@bg:night @tgt:none p_sit > regen:C', '@bg:night @tgt:none icon:moon:C:at=sky > glow:C'],
  morph: ['@tgt:none transform:wolf:C', 'polymorph:frog:C'], multi: ['slash:C:n=2', 'punch:C:n=3'], music: ['@tgt:allies song:C > inspire:C:at=all', 'note:C:n=3 > charm:C'],
  punch: ['punch:C > hit', 'flurry:C'], quake: ['p_stomp > quake:C:prone', 'smash:C > quake:C'], rage: ['p_roar + aura:C > slash:C', 'shout:C > glow:C'],
  revive: ['@tgt:ally p_pray > revive:C', '@tgt:ally revive:C > bless:C'], shadow: ['@tgt:none invis:C', 'sneak > dash:C > crit:C'], shield: ['@tgt:foe shield:C > deflect:orb:C', 'p_block > shield:C'],
  skill: ['@tgt:none icon:star:C:at=hand:anim=spin > sparkle:C', '@tgt:none advantage:C'], slash: ['slash:C > hit', 'slash:C:arc=x:n=2'], sleep: ['p_cast > sleep', 'cloud:C:hurt=0 > sleep'],
  slip: ['@tgt:none evade:C', 'blink:C'], smite: ['slash:C > pillar:C', 'smash:C > radiance:C:at=tgt'], sparkle: ['@tgt:none sparkle:C', '@tgt:none icon:star:C:at=mid'],
  speak: ['@tgt:ally speak:C', 'telepathy:C'], steed: ['@tgt:none summon:horse:C'], storm: ['@bg:storm storm:C', 'p_raise > strike:C'], summon: ['@tgt:none summon:spirit:C', '@tgt:none summon:elemental:C:fire'],
  teleport: ['@tgt:none teleport:C', 'blink:C > slash:C'], time: ['@tgt:none time:C', 'time:C:stop'], undead: ['@bg:grave @tgt:none summon:skeleton:C', 'drain:C'],
  vines: ['vines:C > root', 'grow_plant:C'], wall: ['wall:C:force', 'wall:C:stone'], water: ['wave:C', 'geyser:C'], wave: ['p_push > ring:C', 'telepathy:C > confuse'],
  weather: ['@tgt:none weather:sun:rain:C', '@tgt:none rain:C'], web: ['web > bind:C'], wings: ['@tgt:none wings:C', '@tgt:none rise:C > wings:C'], zap: ['zap:C > shock', 'chain:C']
};
function vfxStoryboard(v) {
  const r = (n => () => (n = (n * 16807) % 2147483647) / 2147483647)((Math.abs(v.seed || 7) % 2147483646) + 1);
  const opts = VFX_SB[v.motif] || VFX_SB.sparkle, base = opts[Math.floor(r() * opts.length)], C = (v.c || VFX_COL.gold).join('/');
  const bgs = ['dusk', 'night', 'forest', 'cave', 'dungeon', 'temple', 'astral', 'ruins', 'castle', 'mountain'], looks = ['hero', 'mage', 'cleric', 'rogue', 'druid', 'knight', 'warlock', 'ranger', 'monk', 'bard'];
  const extra = ['', ' > sparkle:C', ' > focus', ' > glow:C', ''][Math.floor(r() * 5)];
  const w = v.w ? ` @w:${v.w === 'spear' ? 'spear' : v.w}` : '';
  return (base.indexOf('@bg') < 0 ? '@bg:' + bgs[Math.floor(r() * bgs.length)] + ' ' : '') + '@cast:' + looks[Math.floor(r() * looks.length)] + w + ' ' + (base + extra).replace(/\bC\b/g, C);
}
// What to draw for each kind of info box.
function vfxForSpell(sp) { const h = vfxHand('sp', sp.name, sp.base, sp.orig); if (h) return h; const sm = (() => { try { return spellMath(sp); } catch (e) { return {}; } })(); return vfxPick(sp.name, (sp.summary || '') + ' ' + (fullOfSpell(sp) || ''), { type: vfxType(sm.type), school: sp.school, heal: !!sm.heal && !sm.dice, attack: !!sm.attack }); }
function vfxForFeat(f) { return vfxWithWeapon(vfxForFeat0(f), f.dname || f.name); }
function vfxForFeat0(f) { const pk = /^pick:(\w+):(.+)$/.exec(String(f.key || '')); const h = (pk && vfxHand('op', pk[1] + ':' + pk[2])) || vfxHand('f', f.dname, f.name) || (pk && vfxHand('f', pk[2])) || vfxHand('sp', f.name) || vfxHand('mi', f.name); if (h) return h; const fx = (() => { try { return fxOf(f); } catch (e) { return {}; } })(); return vfxPick(f.dname || f.name, (f.desc || '') + ' ' + (fullOfFeat(f) || '') + ' ' + (fx.text || ''), {}); }
const vfxWeaponKind = n => { n = String(n || '').toLowerCase(); return /\baxe|halberd/.test(n) ? 'axe' : /hammer|mace|maul|club|flail|morningstar|greatclub|rod of lordly/.test(n) ? 'hammer' : /spear|pike|trident|lance|glaive|javelin/.test(n) ? 'spear' : /quarterstaff|\bstaff/.test(n) ? 'staff' : /dagger|knife|sickle|shortsword|kukri/.test(n) ? 'dagger' : ''; };
const vfxWithWeapon = (v, ...names) => { const w = names.map(vfxWeaponKind).find(Boolean); return w ? Object.assign({}, v, { w }) : v; };
function vfxForAttack0(a, it) { const h = vfxHand('mi', it && it.magic && it.magic.name) || vfxHand('wp', it && it.weapon && it.weapon.base, a.name, it && it.name); if (h) return h; return vfxPick(a.name + (it && it.weapon ? ' ' + it.weapon.base : ''), (a.notes || '') + ' ' + (a.type || ''), { weapon: a.kind === 'ranged' || (it && it.weapon && it.weapon.kind === 'ranged') ? 'ranged' : 'melee', type: vfxType(a.type) }); }
function vfxForAttack(a, it) { return vfxWithWeapon(vfxForAttack0(a, it), it && it.weapon && it.weapon.base, a.name, it && it.name); }
function vfxForItem(it) { return vfxWithWeapon(vfxForItem0(it), it.weapon && it.weapon.base, it.name); }
function vfxForItem0(it) { const h = vfxHand('mi', it.magic && it.magic.name, it.name) || vfxHand('wp', it.weapon && it.weapon.base, it.armor && it.armor.base, it.name) || vfxHand('gr', it.name, it.base); if (h) return h; if (it.weapon) return vfxPick(it.name + ' ' + it.weapon.base, it.weapon.type, { weapon: it.weapon.kind === 'ranged' ? 'ranged' : 'melee', type: vfxType(it.weapon.type) }); if (it.armor) return vfxPick('shield', '', {}); if (/elixir|potion|philter|oil of/i.test(it.name) && !/healing/i.test(it.name)) return Object.assign(vfxPick(it.name, '', {}), { motif: 'morph', c: VFX_COL.trans }); return vfxPick(it.name, (it.summary || '') + ' ' + (it.notes || '') + ' ' + (fullOfItem(it) || ''), { heal: /potion of healing|healing/i.test(it.name) }); }
