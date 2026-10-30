// Feature automation: the Mystic class (UA) and the revised Ranger (UA) — their class features, subclasses and option lists,
// plus the Primeval Guardian ranger conclave (UA). Loads after fx_ua2.js, so records here win over earlier ones. See tools/FX_SPEC.md.
(function () {
  const T = DND.featFx, C = DND.classes;
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff: buff || {} }, more || {}) });
  const CONC = (n, rounds, buff) => ({ effect: { name: n, rounds, conc: true, buff: buff || {} } });
  const NONE = { none: true };
  const opt = (type, name) => (DND.options[type] || { list: [] }).list.find(x => x[0] === name);
  const setOpt = (type, name, fx) => { const e = opt(type, name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  const addCh = (cls, sub, chs) => { const s = C[cls] && (sub ? C[cls].subclasses[sub] : C[cls]); if (s) s.choices = (s.choices || []).concat(chs); };

  // ======================= THE MYSTIC =======================
  const PSI = n => ({ from: 'Psionics', n });
  // Mystic level at which the psi limit first reaches n points (2 at 1st, 3 at 3rd, 5 at 5th, 6 at 7th, 7 at 9th).
  // Acts are hidden below it, so a discipline option can't be used above your psi limit.
  const LIM = { 1: 1, 2: 1, 3: 3, 4: 5, 5: 5, 6: 7, 7: 9 };
  const A = (name, n, col, more) => Object.assign({ name, cost: PSI(n), min: LIM[n] }, col ? { col } : {}, more || {});
  const SV = ab => ({ dc: 'int', save: ab });
  // An option you can pay from `from` up to 7 psi points: one button per amount (only those within your psi limit show).
  // Only the first button carries the name; the others read just "N Psionics" (the name moves into their roll note / text).
  const V = (name, from, col, fn) => { const out = []; for (let n = from; n <= 7; n++) { const a = A(n === from ? name : '', n, col, fn(n));
    if (n > from) { if (a.rollNote) a.rollNote = name + ' — ' + a.rollNote; else a.text = name + (a.text ? ': ' + a.text : ''); } out.push(a); } return out; };
  // Psychic focus: one shared effect name, so focusing a new discipline replaces the old focus automatically.
  const FOCUS = (note, buff) => ({ name: 'Focus', col: 'bonus', use: R('Psychic Focus', null, Object.assign({ note }, buff || {})) });
  const dis = (name, note, buff, acts) => {
    const e = opt('uaDiscipline', name); if (!e) return;
    const o = Object.assign({}, e[3] || {}, { dc: false, acts: [FOCUS(name + ': ' + note, buff)].concat(acts), text: 'Psychic focus: bonus action "Focus" (one focus at a time — it replaces the previous one; it also ends if you are incapacitated)' });
    delete o.passive; e[3] = o;
  };

  Object.assign(T, {
    'mystic:Psionics': { resource: true, dc: false },
    'mystic:Psychic Focus': { col: null, use: { endEffect: 'Psychic Focus' }, text: 'Choose a focus with the "Focus" button on one of your disciplines (bonus action). Using this ends your current focus (e.g. when you are incapacitated).' },
    'mystic:Mystic Order': NONE,
    'mystic:Mystical Recovery': { col: null, acts: [1, 2, 3, 4, 5, 6, 7].map(n => ({ name: `+${n} HP`, col: 'bonus', min: Math.max(2, LIM[n]), use: { heal: String(n) } })), text: 'Right after spending psi points on a discipline: regain HP equal to the points spent' },
    'mystic:Telepathy': { none: true, text: 'Speak telepathically to any creature you can see within 120 ft (it must understand a language)' },
    'mystic:Strength of Mind': { dc: false, trigger: ['shortRest', 'longRest'], triggerText: 'Strength of Mind: swap your WIS save proficiency for STR, DEX, CON or CHA saves until your next short or long rest (change it on the Character tab)' },
    'mystic:Potent Psionics': { col: 'move', roll: '{tier(mystic,8,1,14,2)}d8', rollNote: 'psychic (once per turn, on a weapon hit)', text: 'Your talents add INT to their damage (already in their rolls)' },
    'mystic:Consumptive Power': { col: 'move', text: 'Pay a discipline’s psi cost with HP instead: lower your current HP and your HP maximum (until a long rest) by that amount' },
    'mystic:Psionic Mastery': { col: 'action', text: 'You gain {mystic>=15?11:9} special psi points, only for disciplines that take an action or bonus action (you can concentrate on several of those); unspent ones vanish on a long rest' },
    'mystic:Psionic Body': { passive: { resist: ['bludgeoning', 'piercing', 'slashing'], immune: ['poison'], condImmune: ['Poisoned', 'Diseased'] }, trigger: 'zero', triggerLabel: 'Psionic Body', triggerText: 'Psionic Body: if you die, roll a d20 — on 10 or higher you discorporate and return 1d3 days later', roll: '1d20', rollNote: '10+: you discorporate instead of dying' },

    // ---- Order of the Avatar ----
    'mystic:avatar:Bonus Disciplines': NONE,
    'mystic:avatar:Armor Training': NONE,
    'mystic:avatar:Avatar of Battle': { none: true, text: 'Allies within 30 ft who can see you get +2 to initiative (while you aren’t incapacitated)' },
    'mystic:avatar:Avatar of Healing': { none: true, text: 'Allies within 30 ft who can see you regain +{max(0,int)} HP when a psionic discipline heals them' },
    'mystic:avatar:Avatar of Speed': { none: true, col: null, text: 'Allies within 30 ft who can see you can Dash as a bonus action' },

    // ---- Order of the Awakened ----
    'mystic:awakened:Bonus Disciplines': NONE,
    'mystic:awakened:Awakened Talent': NONE,
    'mystic:awakened:Psionic Investigation': { text: 'Hold and concentrate on an object for 10 minutes: see its last holder (24 hours) and events within 20 ft in the past hour; leave a sensor for 24 hours (action to check its location and view)' },
    'mystic:awakened:Psionic Surge': { col: 'move', use: { endEffect: 'Psychic Focus' }, text: 'The target has disadvantage on its save against your discipline or talent. Your psychic focus ends and you can’t use one until you finish a short or long rest' },
    'mystic:awakened:Spectral Form': { use: R('Spectral Form', 100, { resist: ['all damage'], note: 'Resistance to all damage; half speed; move through creatures and objects (can’t end there). Ends early with an action' }) },

    // ---- Order of the Immortal ----
    'mystic:immortal:Bonus Disciplines': NONE,
    'mystic:immortal:Immortal Durability': { passive: { maxHp: 'mystic' } },
    'mystic:immortal:Psionic Resilience': { onTurn: { notZero: true, use: { temp: '{max(0,int)}' } }, text: 'At the start of each of your turns, if you have at least 1 HP: {max(0,int)} temp HP (the sheet gives them when your turn starts)' },
    'mystic:immortal:Surge of Health': { col: 'reaction', use: { halveDamage: true, endEffect: 'Psychic Focus' }, text: 'Your psychic focus ends and you can’t use one until you finish a short or long rest' },
    'mystic:immortal:Immortal Will': { col: 'move', trigger: 'zero', triggerLabel: 'Immortal Will', triggerText: 'Immortal Will: at the end of your turn at 0 HP, spend 5 psi points to regain {mystic+con} HP', onlyWhen: { zeroHp: true }, cost: PSI(5), use: { heal: 'mystic+con' } },

    // ---- Order of the Nomad ----
    'mystic:nomad:Bonus Disciplines': NONE,
    'mystic:nomad:Breadth of Knowledge': { trigger: 'longRest', triggerText: 'Breadth of Knowledge: choose two proficiencies (tools, skills or languages) until your next long rest' },
    'mystic:nomad:Memory of One Thousand Steps': { text: 'Teleport to an unoccupied space you occupied since the start of your last turn; the attack misses you' },
    'mystic:nomad:Superior Teleportation': { none: true, text: 'Teleporting with a psionic discipline: +10 ft distance' },
    'mystic:nomad:Effortless Journey': { col: 'move', text: 'Once per turn: give up up to 30 ft of movement to teleport that far to an unoccupied space you can see' },

    // ---- Order of the Soul Knife ----
    'mystic:soulknife:Martial Training': NONE,
    'mystic:soulknife:Soul Knife': { col: 'bonus', use: R('Soul knives', null, { note: 'Psychic blades on both fists; you can’t hold anything. Dismiss as a bonus action' }),
      attacks: [['Soul knife', '1d8', 'psychic', 'fin', { kind: 'melee', notes: 'Light, finesse martial weapon; one on each fist (two-weapon fighting)' }]],
      acts: [{ name: 'Parry (+2 AC)', col: 'bonus', use: R('Soul knife parry', 1, { ac: 2, note: 'Until the start of your next turn' }) }] },
    'mystic:soulknife:Hone the Blade': { acts: [
      { name: '+1 (2 psi)', col: 'move', cost: PSI(2), min: LIM[2], use: R('Hone the Blade', 100, { atk: 1, dmg: 1, note: 'Soul knife attacks only' }) },
      { name: '+2 (5 psi)', col: 'move', cost: PSI(5), min: LIM[5], use: R('Hone the Blade', 100, { atk: 2, dmg: 2, note: 'Soul knife attacks only' }) },
      { name: '+4 (7 psi)', col: 'move', cost: PSI(7), min: LIM[7], use: R('Hone the Blade', 100, { atk: 4, dmg: 4, note: 'Soul knife attacks only' }) }] },
    'mystic:soulknife:Consumptive Knife': { col: 'move', use: { regain: { from: 'Psionics', n: 2 } }, text: 'When your soul knife slays an enemy creature' },
    'mystic:soulknife:Phantom Knife': { col: 'action', text: 'One soul knife attack that treats the target’s AC as 10' },

    // ---- Order of the Wu Jen ----
    'mystic:wujen:Bonus Disciplines': NONE,
    "mystic:wujen:Hermit's Study": NONE,
    'mystic:wujen:Elemental Attunement': { col: 'move', cost: PSI(1), text: 'That use of the discipline ignores the creature’s resistance (only within your psi limit)' },
    'mystic:wujen:Arcane Dabbler': { col: null, acts: [[1, 2], [2, 3], [3, 5], [4, 6], [5, 7]].map(([L, n]) => ({ name: `Slot ${L}`, col: 'bonus', cost: PSI(n), min: LIM[n], text: `Create a level ${L} spell slot (track it by hand; it lasts until used or a long rest)` })),
      text: 'Three wizard spells (1st–3rd level) always prepared — add them on the Spells tab' },
    'mystic:wujen:Elemental Mastery': { col: 'reaction', cost: PSI(2), use: R('Elemental Mastery', 2, { note: 'Immunity to the triggering damage type (one you resist) until the end of your next turn' }), text: 'Ignore the triggering damage' }
  });

  // ---- Psionic talents (Potent Psionics adds INT to their damage from 8th level) ----
  const TIER = '{tier(level,1,1,5,2,11,3,17,4)}', PP = '+{mystic>=8?int:0}';
  const tal = (n, fx) => setOpt('uaTalent', n, fx);
  tal('Beacon', { col: 'bonus', use: R('Beacon', 600, { note: 'Bright light 20 ft, dim light 20 ft more (end it as a bonus action)' }) });
  tal('Blade Meld', { col: 'bonus', use: R('Blade Meld', 10, { note: 'Your one-handed melee weapon can’t leave your hand' }) });
  tal('Blind Spot', { col: 'action', dc: 'int', save: 'WIS', text: 'On a failure you are invisible to it until the end of your next turn' });
  tal('Delusion', { col: 'action', text: 'A sound or a 5-ft image only one creature within 60 ft perceives (1 minute)' });
  tal('Energy Beam', { col: 'action', dc: 'int', save: 'DEX', roll: TIER + 'd8' + PP, rollNote: 'acid, cold, fire, lightning or thunder (DEX save negates)' });
  tal('Light Step', { col: 'bonus', use: R('Light Step', 1, { speed: 10, note: 'Standing up this turn costs no movement' }) });
  tal('Mind Meld', { col: 'bonus' });
  tal('Mind Slam', { col: 'action', dc: 'int', save: 'CON', roll: TIER + 'd6' + PP, rollNote: 'force; Large or smaller knocked prone (CON save negates)' });
  tal('Mind Thrust', { col: 'action', dc: 'int', save: 'INT', roll: TIER + 'd10' + PP, rollNote: 'psychic (INT save negates; +2 with a Psychic Assault focus)' });
  tal('Mystic Charm', { col: 'action', dc: 'int', save: 'CHA', text: 'A humanoid is charmed until the end of your next turn' });
  tal('Mystic Hand', { col: 'action' });
  tal('Psychic Hammer', { col: 'action', dc: 'int', save: 'STR', roll: TIER + 'd6' + PP, rollNote: 'force; Large or smaller moved 10 ft (STR save negates)' });

  // ---- Psionic disciplines (UA text: The Mystic Class, Mar 2017) ----
  const per = (dice, type, extra) => n => ({ roll: n * dice[0] + 'd' + dice[1], rollNote: type + (extra ? '; ' + extra : '') });
  const up = (base, step, die, type, extra) => b => n => ({ roll: base + 'd' + die + (n > b ? '+' + (n - b) * step + 'd' + (die) : ''), rollNote: type + (extra ? '; ' + extra : '') });
  // Avatar
  dis('Crown of Despair', 'advantage on Intimidation checks', null, [].concat(
    V('Crowned in Sorrow', 1, 'action', n => Object.assign(SV('CHA'), per([1, 8], 'psychic', 'no reactions until the start of its next turn (CHA save: half, no effect)')(n))),
    [A('Call to Inaction', 2, 'action', Object.assign(SV('WIS'), { use: CONC('Call to Inaction', 100), text: 'After 1 minute of conversation: it is incapacitated until your concentration ends (ends if it or an ally is attacked or harmed)' }))],
    V('Visions of Despair', 3, 'action', n => Object.assign(SV('CHA'), up(3, 1, 6, 'psychic', 'speed 0 until the end of its next turn (CHA save: half)')(3)(n))),
    [A('Dolorous Mind', 5, 'action', Object.assign(SV('CHA'), { use: CONC('Dolorous Mind', 10), text: 'Incapacitated with speed 0 while you concentrate (repeats the save each turn)' }))]));
  dis('Crown of Disgust', 'the area within 5 ft of you is difficult terrain for enemies', null, [].concat(
    V('Eye of Horror', 1, 'action', n => Object.assign(SV('CHA'), per([1, 6], 'psychic', 'can’t move closer to you until the end of its next turn (CHA save: half)')(n))),
    [A('Wall of Repulsion', 3, 'action', Object.assign(SV('WIS'), { use: CONC('Wall of Repulsion', 100), text: '30×10 ft invisible wall within 60 ft; crossing it takes a WIS save' })),
     A('Visions of Disgust', 5, 'action', Object.assign(SV('WIS'), { roll: '5d6', rollNote: 'psychic; then 1d6 per creature within 5 ft of it at the end of each of its turns (WIS save: half, nothing else)', use: CONC('Visions of Disgust', 10) })),
     A('World of Horror', 7, 'action', Object.assign(SV('CHA'), { roll: '8d6', rollNote: 'psychic to up to six creatures; frightened with speed 0, melee attacks only (CHA save: half)', use: CONC('World of Horror', 10) }))]));
  dis('Crown of Rage', 'enemies within 5 ft of you have disadvantage on melee attacks against others', null, [].concat(
    V('Primal Fury', 1, 'action', n => Object.assign(SV('CHA'), per([1, 6], 'psychic', 'it uses its reaction to move its speed toward its nearest enemy (CHA save negates)')(n))),
    [A('Fighting Words', 2, 'action', Object.assign(SV('WIS'), { use: CONC('Fighting Words', 100), text: 'After 1 minute of conversation: it attacks the creature you name when it sees it' })),
     A('Mindless Courage', 2, 'bonus', Object.assign(SV('WIS'), { text: 'Until the end of your next turn it can only move toward its nearest enemy' })),
     A('Punishing Fury', 5, 'bonus', Object.assign(SV('WIS'), { use: CONC('Punishing Fury', 10), text: 'When it makes a melee attack, creatures within 5 ft of it can use a reaction to attack it' }))]));
  dis('Mantle of Command', 'when you end your turn without moving, reaction: an ally within 30 ft moves half its speed', null, [
    A('Coordinated Movement', 2, 'bonus', { text: 'Up to five allies within 60 ft use their reactions to move half their speed along your path' }),
    A("Commander's Sight", 2, 'action', { use: CONC("Commander's Sight", 1), text: 'Allies have advantage on attacks against one creature until the start of your next turn' }),
    A('Command to Strike', 3, 'action', { text: 'An ally within 60 ft uses its reaction to take the Attack action (you choose targets)' }),
    A('Strategic Mind', 5, 'action', { use: CONC('Strategic Mind', 10), text: 'Allies within 60 ft can, as a bonus action, Dash, Disengage or add 1d4 to their attacks that turn' }),
    A('Overwhelming Attack', 7, 'action', { text: 'Up to five allies within 60 ft use their reactions to take the Attack action' })]);
  dis('Mantle of Courage', 'you and allies within 10 ft have advantage on saves against being frightened', null, [].concat(
    [A('Incite Courage', 2, 'bonus', { use: { removeCond: ['Frightened'] }, text: 'Up to six creatures within 60 ft stop being frightened' })],
    V('Aura of Victory', 1, 'bonus', n => ({ use: CONC('Aura of Victory', 100, { note: `When an enemy you see drops to 0 HP: you and allies within 30 ft gain ${2 * n} temporary HP` }) })),
    [A('Pillar of Confidence', 6, 'action', { use: CONC('Pillar of Confidence', 1, { note: 'One extra action (one weapon attack, Dash or Disengage) before the end of your next turn' }), text: 'You and up to five creatures within 60 ft' })]));
  dis('Mantle of Fear', 'advantage on Intimidation checks', null, [
    A('Incite Fear', 2, 'action', Object.assign(SV('WIS'), { use: CONC('Incite Fear', 10), text: 'Frightened of you while you concentrate' })),
    A('Unsettling Aura', 3, 'bonus', { use: CONC('Unsettling Aura', 600, { note: 'Enemies within 60 ft spend 1 extra foot per foot moved toward you' }) }),
    A('Incite Panic', 5, 'action', Object.assign(SV('WIS'), { use: CONC('Incite Panic', 10), text: 'Up to eight creatures within 90 ft save at the start of each turn or panic (roll a die: odd flees, even attacks at random)' }))]);
  dis('Mantle of Fury', '+5 ft walking speed in combat (allies starting their turn within 10 ft too)', { speed: 5 }, [
    A('Incite Fury', 2, 'bonus', { use: CONC('Incite Fury', 10, { note: 'Up to three allies (or you) add 1d4 to melee weapon damage' }) }),
    A('Mindless Charge', 2, 'bonus', { text: 'Up to three creatures within 60 ft use their reaction to move their speed toward their nearest enemy' }),
    A('Aura of Bloodletting', 3, 'bonus', { use: CONC('Aura of Bloodletting', 10, { note: 'You and every creature within 60 ft have advantage on melee attack rolls' }) }),
    A('Overwhelming Fury', 5, 'action', Object.assign(SV('CHA'), { use: CONC('Overwhelming Fury', 10), text: 'It can use its actions only to make melee attacks (repeats the save each turn)' }))]);
  dis('Mantle of Joy', 'advantage on Persuasion checks', null, [].concat(
    V('Soothing Presence', 1, 'bonus', n => ({ roll: String(3 * n), rollNote: 'temporary HP to each of up to three creatures within 60 ft' })),
    [A('Comforting Aura', 2, 'bonus', { use: CONC('Comforting Aura', 10, { note: 'Up to three allies (or you) add 1d4 to saving throws' }) }),
     A('Aura of Jubilation', 3, 'bonus', { use: CONC('Aura of Jubilation', 10, { note: 'Creatures within 60 ft that see you: disadvantage on Perception and Investigation checks' }) }),
     A('Beacon of Recovery', 5, 'bonus', { text: 'You and up to five allies within 60 ft immediately repeat saves against effects that allow a save at the start or end of their turns' })]));
  // Awakened
  dis('Aura Sight', 'advantage on Insight checks', null, [
    A('Assess Foe', 2, 'bonus', { text: 'Learn a creature’s current HP and its immunities, resistances and vulnerabilities' }),
    A('Read Moods', 2, 'bonus', { text: 'One-word emotional state of up to six creatures you can see' }),
    A('View Aura', 3, 'action', { use: CONC('View Aura', 600, { note: 'Advantage on Insight and CHA checks against the creature; you know its HP, mood and magical effects' }) }),
    A('Perceive the Unseen', 5, 'bonus', { use: CONC('Perceive the Unseen', 10, { note: 'You see all creatures, including hidden and invisible ones' }) })]);
  dis('Intellect Fortress', 'resistance to psychic damage', { resist: ['psychic'] }, [].concat(
    [A('Psychic Backlash', 2, 'reaction', { roll: '2d10', rollNote: 'psychic to the attacker if the attack (with disadvantage) still hits' })],
    V('Psychic Parry', 1, 'reaction', n => ({ text: `+${n} to your INT, WIS or CHA saving throw (after the roll, before the result)` })),
    [A('Psychic Redoubt', 5, 'action', { use: CONC('Psychic Redoubt', 100, { resist: ['psychic'], note: 'Chosen creatures within 30 ft: resistance to psychic damage and advantage on INT, WIS and CHA saves' }) })]));
  dis('Mantle of Awe', 'bonus to Charisma checks equal to half your INT modifier (min +1)', null, [].concat(
    V('Charming Presence', 1, 'action', n => ({ roll: 2 * n + 'd8', rollNote: 'HP worth of creatures within 30 ft charmed for 10 minutes (lowest HP maximum first)' })),
    [A('Center of Attention', 2, 'action', Object.assign(SV('CHA'), { use: CONC('Center of Attention', 10), text: 'All other creatures are invisible to it until your concentration ends or it takes damage' })),
     A('Invoke Awe', 7, 'action', Object.assign(SV('INT'), { use: CONC('Invoke Awe', 100), text: 'Up to five creatures within 60 ft are charmed and obey your commands (repeat the save each turn)' }))]));
  dis('Precognition', 'advantage on initiative rolls', null, [
    A('Precognitive Hunch', 2, 'bonus', { use: CONC('Precognitive Hunch', 10, { bless: true, note: '+1d4 to attack rolls, saving throws and ability checks' }) }),
    A('All-Around Sight', 3, 'reaction', { text: 'An attack that hits you is rolled with disadvantage instead' }),
    A('Danger Sense', 5, 'action', { use: CONC('Danger Sense', 4800, { note: 'Can’t be surprised; attacks against you can’t gain advantage; +10 to initiative' }) }),
    A('Victory Before Battle', 7, 'move', { text: 'When you roll initiative: +10 to it for you and up to five creatures within 60 ft' })]);
  dis('Psychic Assault', '+2 damage with psionic talents that deal psychic damage', null, [].concat(
    V('Psionic Blast', 1, 'action', per([1, 8], 'psychic (no save)')),
    [A('Ego Whip', 3, 'action', Object.assign(SV('INT'), { roll: '3d8', rollNote: 'psychic; next turn its action can only Dodge, Disengage or Hide (INT save: half)' })),
     A('Id Insinuation', 5, 'action', Object.assign(SV('INT'), { roll: '5d8', rollNote: 'psychic; next turn its action can only Dodge or Attack (INT save: half)' })),
     A('Psychic Blast', 6, 'action', Object.assign(SV('INT'), { roll: '8d8', rollNote: 'psychic, 60-ft cone (INT save: half)' })),
     A('Psychic Blast', 7, 'action', Object.assign(SV('INT'), { roll: '10d8', rollNote: 'psychic, 60-ft cone (INT save: half)' })),
     A('Psychic Crush', 7, 'action', Object.assign(SV('INT'), { roll: '8d8', rollNote: 'psychic, 20-ft cube; stunned until the end of your next turn (INT save: half)' }))]));
  dis('Psychic Disruption', 'advantage on Deception checks', null, [].concat(
    V('Distracting Haze', 1, 'action', n => Object.assign(SV('INT'), per([1, 10], 'psychic', 'it can’t see beyond 10 ft while you concentrate (INT save: half)')(n), { use: CONC('Distracting Haze', 10) })),
    [A('Daze', 3, 'action', Object.assign(SV('INT'), { text: 'Incapacitated until the end of your next turn or until it takes damage' }))],
    V('Mind Storm', 5, 'action', n => Object.assign(SV('WIS'), { roll: '6d8' + (n > 5 ? '+' + (n - 5) + 'd6' : ''), rollNote: 'psychic, 20-ft sphere; disadvantage on saves until the end of your next turn (WIS save: half)' }))));
  dis('Psychic Inquisition', 'you know when a creature talking to you telepathically lies', null, [].concat(
    V('Hammer of Inquisition', 1, 'action', n => Object.assign(SV('INT'), per([1, 10], 'psychic', 'disadvantage on its next WIS save (INT save: half)')(n))),
    [A('Forceful Query', 2, 'action', Object.assign(SV('WIS'), { text: 'It answers a yes-or-no question truthfully' })),
     A('Ransack Mind', 5, null, Object.assign(SV('INT'), { use: CONC('Ransack Mind', 600), text: 'At full duration it makes three INT saves; each failure reveals more memories (12/24/48 hours)' })),
     A('Phantom Idea', 6, null, Object.assign(SV('INT'), { use: CONC('Phantom Idea', 600), text: 'At full duration it makes three INT saves; the planted idea lasts 4/24/48 hours' }))]));
  dis('Psychic Phantoms', 'advantage on Deception checks', null, [].concat(
    V('Distracting Figment', 1, 'action', n => Object.assign(SV('INT'), per([1, 10], 'psychic', 'no reactions and melee attacks against it have advantage until the end of your next turn (INT save: half)')(n))),
    V('Phantom Foe', 3, 'action', n => Object.assign(SV('INT'), { use: CONC('Phantom Foe', 10, { note: `Target takes ${n - 2}d8 psychic at the start of each of its turns` }), roll: (n - 2) + 'd8', rollNote: 'psychic at the start of each of its turns; no reactions (repeats the save)' })),
    [A('Phantom Betrayal', 5, 'action', Object.assign(SV('INT'), { use: CONC('Phantom Betrayal', 10), text: 'It must target its allies with attacks and damaging effects' })),
     A('Phantom Riches', 7, 'action', Object.assign(SV('INT'), { use: CONC('Phantom Riches', 10), text: 'You control its movement; if undamaged it can only admire the phantom object' }))]));
  dis('Telepathic Contact', 'Telepathy with up to six creatures at once', null, [
    A('Exacting Query', 2, 'action', Object.assign(SV('INT'), { text: 'It truthfully answers one question' })),
    A('Occluded Mind', 2, 'action', Object.assign(SV('INT'), { text: 'It believes one statement (up to ten words) for 5 minutes' })),
    A('Broken Will', 5, 'action', Object.assign(SV('INT'), { text: 'You choose its movement and action on its next turn' })),
    A('Psychic Grip', 6, 'action', Object.assign(SV('INT'), { use: CONC('Psychic Grip', 10), text: 'Paralyzed (repeats the save each turn; on a failure you can use your reaction to move it half its speed)' })),
    A('Psychic Domination', 7, 'action', Object.assign(SV('INT'), { use: CONC('Psychic Domination', 10), text: 'You choose its actions and movement (repeats the save each turn)' }))]);
  // Immortal
  dis('Adaptive Body', 'no need to eat, breathe or sleep; a long rest can be 8 hours of light activity', null, [
    A('Environmental Adaptation', 2, 'action', { text: 'You or a creature you touch ignore extreme heat or cold for 1 hour' }),
    A('Adaptive Shield', 3, 'reaction', { use: R('Adaptive Shield', 2, { note: 'Resistance to the triggering acid, cold, fire, lightning or thunder damage (including that hit) until the end of your next turn' }) }),
    A('Energy Adaptation', 5, 'action', { use: CONC('Energy Adaptation', 600, { note: 'A touched creature resists acid, cold, fire, lightning or thunder (your choice)' }) }),
    A('Energy Immunity', 7, 'action', { use: CONC('Energy Immunity', 600, { note: 'A touched creature is immune to acid, cold, fire, lightning or thunder (your choice)' }) })]);
  dis('Bestial Form', 'advantage on Animal Handling checks', null, [].concat(
    V('Bestial Claws', 1, 'action', per([1, 10], 'slashing (melee weapon attack against a creature within 5 ft)')),
    [A('Tough Hide', 2, 'bonus', { use: R('Bestial Form: Tough Hide', 600, { ac: 2 }) }),
     A('Flight', 5, 'bonus', { use: R('Bestial Form: Flight', 600, { fly: 'walk' }) }),
     A('Climbing', 2, 'bonus', { use: R('Bestial Form: Climbing', 600, { note: 'Climbing speed equal to your walking speed' }) }),
     A('Swimming', 2, 'bonus', { use: R('Bestial Form: Swimming', 600, { note: 'Swimming speed equal to your walking speed' }) }),
     A('Amphibious', 2, 'bonus', { use: R('Bestial Form: Amphibious', 600, { note: 'You breathe air and water' }) }),
     A('Keen Senses', 2, 'bonus', { use: R('Bestial Form: Keen Senses', 600, { note: 'Advantage on Perception checks' }) }),
     A('Perfect Senses', 3, 'bonus', { use: R('Bestial Form: Perfect Senses', 600, { note: 'See invisible creatures and objects within 10 ft, even blinded' }) })]));
  dis('Brute Force', 'advantage on Athletics checks', null, [].concat(
    V('Brute Strike', 1, 'bonus', per([1, 6], 'extra damage of the weapon’s type on your next melee hit this turn')),
    V('Knock Back', 1, 'reaction', n => Object.assign(SV('STR'), { roll: n + 'd6', rollNote: `bludgeoning only if it hits an object; pushed ${10 * n} ft (STR save negates)` })),
    V('Mighty Leap', 1, 'move', n => ({ text: `Jump up to ${20 * n} ft in any direction as part of your movement` })),
    [A('Feat of Strength', 2, 'bonus', { use: R('Feat of Strength', 2, { note: '+5 to Strength checks until the end of your next turn' }) })]));
  dis('Celerity', '+10 ft walking speed', { speed: 10 }, [].concat(
    V('Rapid Step', 1, 'bonus', n => ({ use: R('Rapid Step', 1, { speed: 10 * n, note: 'Also climbing and swimming speeds; until the end of the turn' }) })),
    [A('Agile Defense', 2, 'bonus', { use: { cond: 'Dodging', condRounds: 1 } }),
     A('Blur of Motion', 2, 'action', { text: 'You are invisible while moving this turn' }),
     A('Surge of Speed', 2, 'bonus', { use: R('Surge of Speed', 1, { note: 'No opportunity attacks; climbing speed equal to walking speed this turn' }) }),
     A('Surge of Action: Dash', 5, 'bonus', { dash: true }),
     A('Surge of Action: attack', 5, 'bonus', { text: 'Make one weapon attack' })]));
  dis('Corrosive Metabolism', 'resistance to acid and poison damage', { resist: ['acid', 'poison'] }, [].concat(
    V('Corrosive Touch', 1, 'action', n => Object.assign(SV('DEX'), per([1, 10], 'acid, a creature within reach (DEX save: half)')(n))),
    V('Venom Strike', 1, 'action', n => Object.assign(SV('CON'), per([1, 6], 'poison, 30 ft; poisoned until the end of your next turn (CON save: half, not poisoned)')(n))),
    [A('Acid Spray', 2, 'reaction', { roll: '2d6', rollNote: 'acid to each creature within 5 ft (when you take piercing or slashing damage)' })],
    V('Breath of the Black Dragon', 5, 'action', n => Object.assign(SV('CON'), up(6, 1, 6, 'acid, 60×5 ft line (CON save: half)')(5)(n))),
    [A('Breath of the Green Dragon', 7, 'action', Object.assign(SV('CON'), { roll: '10d6', rollNote: 'poison, 90-ft cone (CON save: half)' }))]));
  dis('Diminution', 'advantage on Stealth checks', null, [
    A('Miniature Form', 2, 'bonus', { use: CONC('Miniature Form', 100, { note: 'Tiny; +5 to Stealth; fit through 6-inch gaps' }) }),
    A('Toppling Shift', 2, 'bonus', Object.assign(SV('STR'), { text: 'A creature within 5 ft is knocked prone' })),
    A('Sudden Shift', 5, 'reaction', { text: 'The attack that hit you misses; move 5 ft without provoking opportunity attacks' }),
    A('Microscopic Form', 7, 'bonus', { use: CONC('Microscopic Form', 100, { ac: 5, note: '+10 to Stealth; fit through 1-inch gaps; no weapon attacks' }) })]);
  dis('Giant Growth', '+5 ft reach', null, [
    A('Ogre Form', 2, 'bonus', { use: Object.assign(CONC('Ogre Form', 10, { dmgDice: '1d4 bludgeoning', note: 'Large; +5 ft reach; +1d4 bludgeoning on melee weapon hits' }), { temp: '10' }) }),
    A('Giant Form', 7, 'bonus', { use: Object.assign(CONC('Giant Form', 10, { dmgDice: '2d6 bludgeoning', note: 'Huge; +10 ft reach; +2d6 bludgeoning on melee weapon hits' }), { temp: '30' }) })]);
  dis('Iron Durability', '+1 AC', { ac: 1 }, [].concat(
    V('Iron Hide', 1, 'reaction', n => ({ use: R('Iron Hide', 2, { ac: n, note: 'Until the end of your next turn (applies to the triggering attack)' }) })),
    [A('Steel Hide', 2, 'bonus', { use: R('Steel Hide', 2, { resist: ['bludgeoning', 'piercing', 'slashing'], note: 'Until the end of your next turn' }) }),
     A('Iron Resistance', 7, 'action', { use: CONC('Iron Resistance', 600, { note: 'Resistance to bludgeoning, piercing or slashing damage (your choice)' }) })]));
  dis('Psionic Restoration', 'bonus action: stabilize a creature at 0 HP within reach', null, [].concat(
    V('Mend Wounds', 1, 'action', n => ({ roll: n + 'd8', rollNote: 'healing to a creature you touch', healRoll: true })),
    [A('Restore Health', 3, 'action', { text: 'End blinded, deafened, paralyzed or poisoned on a creature you touch, or one disease' }),
     A('Restore Life', 5, 'action', { text: 'A creature dead for under a minute returns with 1 HP' }),
     A('Restore Vigor', 7, 'action', { text: 'Remove one ability score reduction, one HP maximum reduction, or one level of exhaustion from a creature you touch' })]));
  dis('Psionic Weapon', 'one chosen weapon (or unarmed strike) deals magical psychic damage (no STR/DEX to that damage before mystic 6th level)', null, [].concat(
    [A('Ethereal Weapon', 1, 'bonus', Object.assign(SV('DEX'), { text: 'Your next attack this turn with it needs no roll: DEX save, full damage on a failure, half on a success' }))],
    V('Lethal Strike', 1, 'bonus', per([1, 10], 'psychic on your next hit with it this turn')),
    [A('Augmented Weapon', 5, 'bonus', { use: CONC('Augmented Weapon', 100, { atk: 3, dmg: 3, note: 'The touched weapon only' }) })]));
  // Nomad
  dis('Nomadic Arrow', 'your ranged weapon attacks ignore disadvantage (and then can’t have advantage)', null, [].concat(
    V('Speed Dart', 1, 'bonus', per([1, 10], 'psychic on the next hit with that ranged weapon this turn')),
    [A('Seeking Missile', 2, 'reaction', { text: 'Reroll a missed ranged weapon attack against the same target' }),
     A('Faithful Archer', 5, 'bonus', { use: CONC('Faithful Archer', 10, { note: 'One extra attack with the weapon at the start of each of your turns' }) })]));
  dis('Nomadic Chameleon', 'advantage on Stealth checks', null, [].concat(
    [A('Chameleon', 2, 'action', { text: 'Try to hide even without cover or concealment' })],
    V('Step from Sight', 3, 'bonus', n => ({ use: Object.assign(CONC('Step from Sight', 10, { note: 'Invisible until you affect a creature with an attack, spell or ability' }), { cond: 'Invisible' }), text: n > 3 ? `You and ${n - 3} more creature${n > 4 ? 's' : ''} within 60 ft turn invisible` : 'You turn invisible' })),
    [A('Enduring Invisibility', 7, 'bonus', { use: Object.assign(CONC('Enduring Invisibility', 10, { note: 'Invisible while you concentrate' }), { cond: 'Invisible' }) })]));
  dis('Nomadic Mind', 'proficiency in one skill or tool (or reading and writing one language) of your choice', null, [
    A('Wandering Mind (1 skill)', 2, null, { use: CONC('Wandering Mind', 100), text: 'After 10 minutes: proficiency in a skill (Animal Handling, Arcana, History, Medicine, Nature, Performance, Religion, Survival) for 1 hour' }),
    A('Wandering Mind (2 skills)', 4, null, { use: CONC('Wandering Mind', 100), text: 'After 10 minutes: proficiency in two of those skills for 1 hour' }),
    A('Wandering Mind (3 skills)', 6, null, { use: CONC('Wandering Mind', 100), text: 'After 10 minutes: proficiency in three of those skills for 1 hour' }),
    A('Find Creature', 2, null, { use: CONC('Find Creature', 600), text: 'After 1 hour: the region where a specific creature is (or its plane)' }),
    A('Item Lore', 3, null, { use: CONC('Item Lore', 600), text: 'After 1 hour within 5 ft: as identify on the item' }),
    A('Psychic Speech', 5, 'action', { use: R('Psychic Speech', 600, { note: 'Understand any language; creatures that know a language understand you' }) }),
    A('Wandering Eye', 6, 'action', { use: CONC('Wandering Eye', 600, { note: 'Invisible sensor (darkvision 60 ft), move it 30 ft as an action' }) }),
    A('Phasing Eye', 7, 'action', { use: CONC('Phasing Eye', 600, { note: 'As Wandering Eye, and it passes through solid objects' }) })]);
  dis('Nomadic Step', 'after you teleport on your turn, +10 ft walking speed until the end of the turn (once per turn)', null, [].concat(
    V('Step of a Dozen Paces', 1, 'bonus', n => ({ onlyWhen: { notMoved: true }, use: { speed0: 'Step of a Dozen Paces' }, text: `Teleport up to ${20 * n} ft (+10 ft with Superior Teleportation) to a space you can see` })),
    [A('Nomadic Anchor', 1, 'action', { text: 'Teleportation anchor within 120 ft for 8 hours' }),
     A('Defensive Step', 2, 'reaction', { use: R('Defensive Step', 1, { ac: 4, note: 'Against the triggering attack' }), text: 'Then teleport up to 10 ft' }),
     A('There and Back Again', 2, 'bonus', { text: 'Teleport up to 20 ft, move half your speed, and teleport back at the end of your turn' }),
     A('Transposition', 3, 'bonus', { onlyWhen: { notMoved: true }, use: { speed0: 'Transposition' }, text: 'Swap places with an ally within 60 ft' }),
     A('Baleful Transposition', 5, 'action', Object.assign(SV('WIS'), { text: 'Swap places with a creature within 120 ft' })),
     A('Phantom Caravan', 6, 'action', { text: 'You and up to six willing creatures within 60 ft teleport up to 1 mile to a spot you can see' }),
     A("Nomad's Gate", 7, 'action', { use: CONC("Nomad's Gate", 600), text: 'Linked 5-ft portals up to 1 mile apart' })]));
  dis('Third Eye', 'darkvision 60 ft (or +10 ft if you already have 60 ft or more)', null, [
    A('Tremorsense', 2, 'bonus', { use: CONC('Tremorsense', 10, { note: 'Tremorsense 30 ft' }) }),
    A('Unwavering Eye', 2, 'bonus', { use: R('Unwavering Eye', 10, { note: 'Advantage on Wisdom checks' }) }),
    A('Piercing Sight', 3, 'bonus', { use: CONC('Piercing Sight', 10, { note: 'See through objects up to 1 ft thick within 30 ft' }) }),
    A('Truesight', 5, 'bonus', { use: CONC('Truesight', 10, { note: 'Truesight 30 ft' }) })]);
  // Wu Jen
  dis('Mastery of Air', 'no falling damage; you ignore difficult terrain when walking', null, [].concat(
    V('Wind Step', 1, 'move', n => ({ use: R('Wind Step', 1, { fly: 20 * n, note: 'Fly as part of your move; you fall if you end in the air' }) })),
    V('Wind Stream', 1, 'action', n => Object.assign(SV('STR'), per([1, 8], 'bludgeoning, 30×5 ft line; knocked prone (STR save: half, not prone)')(n))),
    [A('Cloak of Air', 3, 'bonus', { use: CONC('Cloak of Air', 100, { note: 'Attacks against you have disadvantage; reaction: a melee miss is rerolled against the attacker' }) }),
     A('Wind Form', 5, 'bonus', { use: CONC('Wind Form', 100, { fly: 60 }) }),
     A('Misty Form', 6, 'action', { use: CONC('Misty Form', 10, { resist: ['bludgeoning', 'piercing', 'slashing'], note: 'Only the Dash action; slip through 1-inch gaps' }) }),
     A('Animate Air', 7, 'action', { use: CONC('Animate Air', 600), text: 'An air elemental within 120 ft obeys you' })]));
  dis('Mastery of Fire', 'resistance to fire damage; +2 to fire damage rolls', { resist: ['fire'] }, [].concat(
    V('Combustion', 1, 'action', n => Object.assign(SV('CON'), per([1, 10], 'fire, within 120 ft; burns for 1d6 fire at the end of each of its turns (CON save: half, no fire)')(n), { use: CONC('Combustion', 10) })),
    [A('Rolling Flame', 3, 'action', { use: CONC('Rolling Flame', 10), roll: '5', rollNote: 'fire to creatures in the 20-ft cube (and ending their turn there)' }),
     A('Detonation', 5, 'action', Object.assign(SV('CON'), { roll: '7d6', rollNote: 'fire, 20-ft sphere; knocked prone (CON save: half)' })),
     A('Fire Form', 5, 'bonus', { use: CONC('Fire Form', 10, { note: 'Creatures ending their turn within 5 ft take 3d6 fire' }), roll: '3d6', rollNote: 'fire to a creature ending its turn within 5 ft' }),
     A('Animate Fire', 7, 'action', { use: CONC('Animate Fire', 600), text: 'A fire elemental within 120 ft obeys you' })]));
  const MOVE_T = { 2: ['25 lb', '2d6'], 3: ['50 lb', '4d6'], 5: ['250 lb', '6d6'], 6: ['500 lb', '7d6'], 7: ['1,000 lb', '8d6'] };
  dis('Mastery of Force', 'advantage on Strength checks', null, [].concat(
    V('Push', 1, 'action', n => Object.assign(SV('STR'), per([1, 8], `force; pushed ${5 * n} ft away (STR save: half, not pushed)`)(n))),
    [2, 3, 5, 6, 7].map(n => A('Move', n, 'action', { dc: 10, save: 'DEX', roll: MOVE_T[n][1], rollNote: `bludgeoning if the object (up to ${MOVE_T[n][0]}) falls on a creature (DC 10 DEX save)` })),
    [A('Inertial Armor', 2, 'action', { use: R('Inertial Armor', 4800, { acBase: 14, resist: ['force'], note: 'Base AC 14 + DEX and resistance to force damage; ends if you wear armor' }) }),
     A('Telekinetic Barrier', 3, 'action', { use: CONC('Telekinetic Barrier', 100), text: '40×10 ft wall within 60 ft; each 10-ft section AC 10, 10 HP' }),
     A('Grasp', 3, 'action', Object.assign(SV('STR'), { use: CONC('Grasp', 10), text: 'Grappled by you (60-ft reach); escape contests your INT + proficiency' }))],
    V('Grasp: Crush', 1, 'action', n => ({ onlyWhen: { effect: 'Grasp' }, roll: n + 'd6', rollNote: 'bludgeoning to the grasped creature' })),
    V('Grasp: Move', 1, 'action', n => ({ onlyWhen: { effect: 'Grasp' }, text: `Move the grasped creature up to ${5 * n} ft (it can hang in the air)` }))));
  dis('Mastery of Ice', 'resistance to cold damage', { resist: ['cold'] }, [].concat(
    V('Ice Spike', 1, 'action', n => Object.assign(SV('DEX'), per([1, 8], 'cold, within 120 ft; speed halved until the start of your next turn (DEX save: half)')(n))),
    [A('Ice Sheet', 2, 'action', Object.assign(SV('DEX'), { text: '20-ft radius of ice for 10 minutes: difficult terrain; moving more than 10 ft on it needs a DEX save or falls prone' })),
     A('Frozen Sanctuary', 3, 'bonus', { use: { temp: '20' } })],
    V('Frozen Rain', 5, 'action', n => Object.assign(SV('CON'), up(6, 1, 6, 'cold, 20-ft sphere; speed 0 while you concentrate (CON save: half)')(5)(n), { use: CONC('Frozen Rain', 10) })),
    [A('Ice Barrier', 6, 'action', { use: CONC('Ice Barrier', 100), text: '60×15 ft wall of ice within 60 ft; each 10-ft section AC 12, 30 HP' })]));
  dis('Mastery of Light and Darkness', 'darkness (natural or magical) within 30 ft doesn’t affect your vision', null, [].concat(
    V('Darkness', 1, 'action', n => ({ text: `Magical darkness in a ${10 * n}-ft-radius sphere within 60 ft (foils darkvision; suppresses light from spells of 2nd level or lower)` })),
    [A('Light', 2, 'action', Object.assign(SV('DEX'), { use: CONC('Light', 10), text: 'A touched object sheds light 20/20 ft; or a creature (DEX save) glows: it can’t hide and attacks against it have advantage' })),
     A('Shadow Beasts', 3, 'action', { use: CONC('Shadow Beasts', 10), text: 'Two shadows within 60 ft obey you' })],
    V('Radiant Beam', 5, 'action', n => Object.assign(SV('DEX'), up(6, 1, 6, 'radiant, within 60 ft; blinded while you concentrate (DEX save: half)')(5)(n), { use: CONC('Radiant Beam', 10) }))));
  dis('Mastery of Water', 'swimming speed equal to your walking speed; you breathe water', null, [].concat(
    V('Desiccate', 1, 'action', n => Object.assign(SV('CON'), per([1, 10], 'necrotic, within 60 ft (CON save: half)')(n))),
    V('Watery Grasp', 2, 'action', n => Object.assign(SV('STR'), up(2, 1, 6, 'bludgeoning, 20-ft square; prone and pulled 10 ft toward you (STR save: half)')(2)(n))),
    V('Water Whip', 3, 'action', n => Object.assign(SV('STR'), up(3, 1, 6, 'bludgeoning, 60×5 ft line; you can move those who fail next to the line (STR save: half)')(3)(n))),
    [A('Water Breathing', 5, 'action', { text: 'You and up to ten willing creatures within 60 ft breathe underwater for 24 hours' }),
     A('Water Sphere', 6, 'action', Object.assign(SV('DEX'), { use: CONC('Water Sphere', 10), text: 'Trapped: half speed, disadvantage on attacks and attacks against it, sees 10 ft (repeats the save)' })),
     A('Animate Water', 7, 'action', { use: CONC('Animate Water', 600), text: 'A water elemental within 120 ft obeys you' })]));
  dis('Mastery of Weather', 'resistance to lightning and thunder damage', { resist: ['lightning', 'thunder'] }, [].concat(
    V('Cloud Steps', 1, 'action', n => ({ use: CONC('Cloud Steps', 100), text: `A solid cloud staircase ${20 * n} ft high in a 10×10 ft area` })),
    V('Hungry Lightning', 1, 'action', n => Object.assign(SV('DEX'), per([1, 8], 'lightning, within 60 ft (DEX save with disadvantage in heavy armor: half)')(n))),
    [A('Wall of Clouds', 2, 'action', { use: CONC('Wall of Clouds', 100), text: '60×15 ft wall of cloud within 60 ft that blocks vision' }),
     A('Whirlwind', 2, 'action', Object.assign(SV('STR'), { roll: '1d6', rollNote: 'bludgeoning, 20-ft sphere; moved within it (STR save negates)' }))],
    V('Lightning Leap', 5, 'action', n => Object.assign(SV('DEX'), up(6, 1, 6, 'lightning, 60×5 ft line, then teleport to a space it touched (DEX save: half)')(5)(n))),
    [A('Wall of Thunder', 6, 'action', Object.assign(SV('STR'), { use: CONC('Wall of Thunder', 100), roll: '6d6', rollNote: 'thunder to a creature entering or starting there; pushed 30 ft and prone (STR save negates)' })),
     A('Thunder Clap', 7, 'action', Object.assign(SV('CON'), { roll: '8d6', rollNote: 'thunder, 20-ft sphere; stunned until the end of your next turn (CON save: half)' }))]));
  dis('Mastery of Wood and Earth', '+1 AC', { ac: 1 }, [].concat(
    V('Animate Weapon', 1, 'action', n => ({ roll: n + 'd10', rollNote: 'force on a hit, plus the weapon’s damage + INT', text: 'Your held one-handed melee weapon attacks a creature within 30 ft at +{prof+int} to hit' })),
    [A('Warp Weapon', 2, 'action', Object.assign(SV('STR'), { text: 'A nonmagical weapon a creature within 60 ft holds can’t attack until the end of your next turn' })),
     A('Warp Armor', 3, 'action', Object.assign(SV('CON'), { text: 'A creature’s nonmagical armor gives AC 10 + DEX until the end of your next turn' })),
     A('Wall of Wood', 3, 'action', { use: CONC('Wall of Wood', 600), text: '60×15 ft wall within 60 ft; each 5-ft section AC 12, 100 HP' }),
     A('Armored Form', 6, 'bonus', { use: CONC('Armored Form', 10, { resist: ['bludgeoning', 'piercing', 'slashing'] }) }),
     A('Animate Earth', 7, 'action', { use: CONC('Animate Earth', 600), text: 'An earth elemental within 120 ft obeys you' })]));

  // ======================= THE RANGER, REVISED =======================
  const FE = ['Beasts', 'Fey', 'Humanoids', 'Monstrosities', 'Undead'], GFE = ['Aberrations', 'Celestials', 'Constructs', 'Dragons', 'Elementals', 'Fiends', 'Giants'];
  DND.options.uaRevFavoredEnemy = { label: 'Favored Enemy', list: FE.map(t => [t, `+2 damage (+4 from 6th level) with weapon attacks against ${t.toLowerCase()}; advantage on Survival checks to track them and INT checks to recall information about them.`, 'Ranger Revised (UA)', { passive: { advNote: `Survival to track and INT checks to recall information about ${t.toLowerCase()}` } }]) };
  DND.options.uaRevGreaterFE = { label: 'Greater Favored Enemy', list: GFE.map(t => [t, `+4 damage with weapon attacks against ${t.toLowerCase()}; advantage on Survival to track them, INT checks to recall information, and saves against their spells and abilities.`, 'Ranger Revised (UA)', { passive: { advNote: `Saves against the spells and abilities of ${t.toLowerCase()}; Survival to track and INT checks to recall information about them` } }]) };
  addCh('rangerrev', null, [{ level: 1, type: 'uaRevFavoredEnemy', n: 1 }, { level: 1, type: 'language', n: 1, label: 'Favored Enemy language' }, { level: 6, type: 'uaRevGreaterFE', n: 1 }, { level: 6, type: 'language', n: 1, label: 'Greater Favored Enemy language' }]);
  // Hunter Conclave: the same four choices as the PHB Hunter (their option entries carry the automation)
  addCh('rangerrev', 'hunter', [{ level: 3, type: 'hunterPrey', n: 1 }, { level: 7, type: 'hunterDefense', n: 1 }, { level: 11, type: 'hunterMultiattack', n: 1 }, { level: 15, type: 'hunterSuperior', n: 1 }]);

  Object.assign(T, {
    'rangerrev:Favored Enemy': { col: 'move', roll: '{tier(rangerrev,1,2,6,4)}', rollNote: 'extra damage on a weapon hit against a favored enemy', passive: { advNote: 'Survival checks to track favored enemies; INT checks to recall information about them' } },
    'rangerrev:Natural Explorer': { passive: { initAdv: true, advNote: 'On your first turn in combat: attacks against creatures that haven’t acted yet' },
      trigger: 'initiative', triggerLabel: 'First turn', triggerText: 'Natural Explorer: on your first turn, you have advantage on attacks against creatures that haven’t acted yet.',
      use: R('Natural Explorer', 1, { note: 'Advantage on attacks against creatures that haven’t acted yet this combat' }), text: 'You also ignore difficult terrain' },
    'rangerrev:Fighting Style': NONE,
    'rangerrev:Spellcasting': NONE,
    'rangerrev:Primeval Awareness': { col: 'action', text: 'Communicate simple ideas to a beast and read its mood (not one you attacked in the last 10 minutes). Or concentrate 1 minute: sense your favored enemies within 5 miles (numbers, direction, distance)' },
    'rangerrev:Greater Favored Enemy': { passive: { advNote: 'Saves against the spells and abilities of your greater favored enemy' }, text: 'Your favored enemy damage bonus is now +4' },
    'rangerrev:Fleet of Foot': { col: 'bonus', dash: true },
    'rangerrev:Hide in Plain Sight': { col: 'move', onlyWhen: { notMoved: true }, use: R('Hide in Plain Sight', 1, { note: 'While you stay still and hidden: −10 to Perception checks to detect you (ends if you move or fall prone)' }), text: 'Use when you hide on a turn you don’t move' },
    'rangerrev:Vanish': { col: 'bonus', text: 'Take the Hide action; you can’t be tracked by nonmagical means unless you choose to leave a trail' },
    'rangerrev:Feral Senses': { passive: { sense: 'Aware of invisible creatures within 30 ft (not hidden; you not blinded or deafened)' }, text: 'Attacking a creature you can’t see doesn’t impose disadvantage' },
    'rangerrev:Foe Slayer': { col: 'move', roll: '{max(0,wis)}', rollNote: 'added to one attack or damage roll (once per turn)', text: 'Once on each of your turns, add +{wis} to the attack roll or the damage roll of an attack you make' },

    // ---- Beast Conclave (the companion is a creature you add on the Companions tab) ----
    'rangerrev:beast:Animal Companion': { none: true, text: '8 hours and 50 gp: an ape, black bear, boar, giant badger, giant weasel, mule, panther or wolf (no Multiattack); 8 hours and 25 gp to restore it' },
    "rangerrev:beast:Companion's Bond": { none: true, text: 'Companion: adds your proficiency bonus (+{prof}) to AC, attacks, damage and its proficient saves and two skills; +1 hit die per ranger level after 3rd; shares your favored enemies' },
    'rangerrev:beast:Coordinated Attack': { none: true, text: 'When you take the Attack action, your companion (if it can see you) uses its reaction to make a melee attack' },
    "rangerrev:beast:Beast's Defense": { none: true, text: 'Your companion has advantage on all saving throws while it can see you' },
    'rangerrev:beast:Storm of Claws and Fangs': { none: true, text: 'Your companion’s action: a melee attack against each creature of its choice within 5 ft' },
    "rangerrev:beast:Superior Beast's Defense": { none: true, text: 'Your companion’s reaction: halve the damage of an attack that hits it (attacker it can see)' },

    // ---- Hunter Conclave (choices carry the automation) ----
    "rangerrev:hunter:Hunter's Prey": NONE,
    'rangerrev:hunter:Extra Attack': NONE,
    'rangerrev:hunter:Defensive Tactics': NONE,
    'rangerrev:hunter:Multiattack': NONE,
    "rangerrev:hunter:Superior Hunter's Defense": NONE,

    // ---- Deep Stalker Conclave ----
    'rangerrev:deepstalker:Underdark Scout': { passive: { advNote: 'Hiding from creatures that rely on darkvision (they gain no benefit from it)' },
      trigger: 'initiative', triggerLabel: 'First turn boost', triggerText: 'Underdark Scout: on your first turn, +10 ft speed and one extra attack with the Attack action.',
      use: R('Underdark Scout', 1, { speed: 10, extraAtk: 1, note: 'First turn: +10 ft speed and one extra attack with the Attack action' }) },
    'rangerrev:deepstalker:Deep Stalker Magic': { passive: { sense: 'Darkvision 90 ft (or +30 ft if you already have darkvision)' }, spellsAt: { 3: ['Disguise Self'], 5: ['Rope Trick'], 9: ['Glyph of Warding'], 13: ['Greater Invisibility'], 17: ['Seeming'] } },
    'rangerrev:deepstalker:Extra Attack': NONE,
    'rangerrev:deepstalker:Iron Mind': { passive: { saveProf: ['wis'] } },
    "rangerrev:deepstalker:Stalker's Flurry": { col: 'move', text: 'Once on each of your turns when you miss with an attack, make another attack' },
    "rangerrev:deepstalker:Stalker's Dodge": { col: 'reaction', text: 'When a creature attacks you without advantage: impose disadvantage on that attack roll (before the outcome is known)' },

    // ---- Primeval Guardian Conclave (PHB and Tasha's rangers; class level = ranger + rangertce, only one is non-zero) ----
    'uaprimevalguardian:Guardian Magic': { spellsAt: { 3: ['Entangle'], 5: ['Enhance Ability'], 9: ['Conjure Animals'], 13: ['Giant Insect'], 17: ['Insect Plague'] } },
    // (Ancient Fortitude, 7th: taking the form raises current HP along with the HP maximum — the heal below; 0 before 7th)
    'uaprimevalguardian:Guardian Soul': { col: 'bonus', use: Object.assign(R('Guardian Soul', null, { note: 'Large; every speed of yours is at most 5 ft; +5 ft reach; temp HP at the start of each of your turns (lost when the form ends). Ends if you are incapacitated' }),
        { heal: '{(ranger+rangertce)>=7?2*(ranger+rangertce):0}' }),
      text: 'At the start of each of your turns press "Turn start: temp HP" ({floor((ranger+rangertce)/2)} temp HP)',
      onTurn: { onlyWhen: { effect: 'Guardian Soul' }, use: { temp: '{floor((ranger+rangertce)/2)}' } },
      acts: [{ name: 'Leave form', col: 'bonus', onlyWhen: { effect: 'Guardian Soul' }, use: { endEffect: 'Guardian Soul' } }] },
    'uaprimevalguardian:Piercing Thorns': { col: 'move', roll: '1d6', rollNote: 'extra piercing damage (once per turn, a creature you hit with a weapon attack)' },
    'uaprimevalguardian:Ancient Fortitude': { passive: { effect: 'Guardian Soul', maxHp: '2*(ranger+rangertce)' } },
    'uaprimevalguardian:Rooted Defense': { passive: { effect: 'Guardian Soul', advNote: 'Guardian form: the ground within 30 ft is difficult terrain for your enemies' } },
    'uaprimevalguardian:Guardian Aura': { acts: [{ name: 'Aura: heal ally', col: 'move', onlyWhen: { effect: 'Guardian Soul' }, roll: '{floor((ranger+rangertce)/2)}', rollNote: 'HP to an ally starting its turn within 30 ft below half HP (not undead or constructs)' }] }
  });
  // fx_ua2.js also declares the full 'ranger:uaprimevalguardian:' keys, which outrank the short ones: point every key at these records.
  ['Guardian Magic', 'Guardian Soul', 'Piercing Thorns', 'Ancient Fortitude', 'Rooted Defense', 'Guardian Aura'].forEach(n => { T['ranger:uaprimevalguardian:' + n] = T['rangertce:uaprimevalguardian:' + n] = T['uaprimevalguardian:' + n]; });
})();
