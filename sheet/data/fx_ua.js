// Feature automation for Unearthed Arcana content defined in ua_classes_a.js (UA subclasses for existing classes,
// incl. Mages of Strixhaven), ua_races.js (UA races/subraces) and ua_misc.js (UA feats and fighting styles).
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const X = {};
  // Only set when nothing else (e.g. fx_races) already covers a trait name shared with printed races.
  const soft = (k, fx) => { if (!DND.featFx[k]) X[k] = fx; };

  // ----- Small fixes to the UA subclass data itself (choices, and a few wrong combat columns) -----
  const C = DND.classes;
  const sub = (cls, sk) => C[cls] && C[cls].subclasses[sk];
  const addCh = (cls, sk, chs) => { const s = sub(cls, sk); if (s) s.choices = (s.choices || []).concat(chs); };
  const setData = (cls, sk, name, patch) => { const s = sub(cls, sk), f = s && s.features.find(x => x[1] === name); if (f) f[3] = Object.assign({}, f[3] || {}, patch); };
  const lv0 = (cls, sk) => { const s = sub(cls, sk); return s && s.features[0] ? s.features[0][0] : 1; };
  // Option lists for choices these subclasses make (picked on the feature card or under Unfinished choices).
  const RES5 = ['bludgeoning', 'necrotic', 'piercing', 'radiant', 'slashing'];
  DND.options.uaIndomitableDefense = { label: 'Indomitable Defense', list: RES5.map(t => [t[0].toUpperCase() + t.slice(1), `Resistance to ${t} damage (change your two choices on a short or long rest).`, '', { passive: { resist: [t] } }]) };
  DND.options.uaFavoredMedium = { label: 'Favored Medium', list: [['Cold', 'cold'], ['Fire', 'fire'], ['Lightning', 'lightning']].map(([n, t]) => [n, `Resistance to ${t} damage; Focused Expression adds 1d6 ${t} and its ${t === 'cold' ? 'slowing' : t === 'fire' ? 'burning' : 'shocking'} effect.`, '', { passive: { resist: [t] } }]) };
  DND.options.uaWordOfPower = { label: 'Word of Power', list: [
    ['Deadly Despair', 'When you use Silvery Barbs, the creature that rerolled is also vulnerable to the next damage you deal it.', '', { text: 'Silvery Barbs target: vulnerable to the next damage you deal it' }],
    ['Selfless Invocation', 'Reaction when a creature you can see takes damage: it has resistance to that damage, and you take psychic damage equal to what it took (can’t be reduced).', '', { col: 'reaction', text: 'The creature resists the damage; you take psychic damage equal to what it took after resistance (this can’t be reduced)' }]] };
  addCh('artificer', 'uaarchivist', [{ level: 3, type: 'skill', n: 2, from: 'any', label: 'Artificial Mind: two skills tied to its material' }]);
  addCh('bard', 'uasatire', [{ level: 3, type: 'skill', n: 1, from: 'any', label: 'Bonus Proficiencies: one more skill' }]);
  addCh('cleric', 'uaprotection', [{ level: 17, type: 'uaIndomitableDefense', n: 2 }]);
  addCh('fighter', 'uaknight', [{ level: 7, type: 'skill', n: 2, from: ['Animal Handling', 'History', 'Insight', 'Persuasion', 'Religion'], label: 'Noble Cavalry (or one language instead)' }]);
  addCh('fighter', 'uamonsterhunter', [{ level: 3, type: 'skill', n: 2, from: ['Arcana', 'History', 'Insight', 'Investigation', 'Nature', 'Perception'], label: 'Bonus Proficiencies (a tool can replace one)' }, { level: 3, type: 'language', n: 1, label: "Hunter's Mysticism: Abyssal, Celestial or Infernal" }]);
  addCh('fighter', 'uasharpshooter', [{ level: 7, type: 'skill', n: 1, from: ['Perception', 'Investigation', 'Survival'], label: 'Careful Eyes' }]);
  addCh('fighter', 'uascout', [{ level: 3, type: 'skill', n: 3, from: ['Acrobatics', 'Athletics', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Stealth', 'Survival'], label: "Bonus Proficiencies (thieves' tools can replace one)" },
    { level: 3, type: 'favoredTerrain', n: 1 }, { level: 7, type: 'favoredTerrain', n: 1 }, { level: 15, type: 'favoredTerrain', n: 1 }]);
  addCh('monk', 'uatranquility', [{ level: 6, type: 'skill', n: 1, from: ['Performance', 'Persuasion'], label: 'Emissary of Peace' }]);
  ['druid', 'sorcerer', 'wizard'].forEach(c => addCh(c, 'uamageprismari', [{ level: lv0(c, 'uamageprismari'), type: 'skill', n: 2, from: ['Acrobatics', 'Athletics', 'Nature', 'Performance'], label: 'Creative Skills' }, { level: 6, type: 'uaFavoredMedium', n: 1 }]));
  ['bard', 'warlock', 'wizard'].forEach(c => addCh(c, 'uamagesilverquill', [{ level: lv0(c, 'uamagesilverquill'), type: 'cantrip', list: ['Sacred Flame', 'Vicious Mockery'], cls: c, n: 1, label: 'Eloquent Apprentice cantrip' },
    { level: lv0(c, 'uamagesilverquill'), type: 'skill', n: 2, from: ['Deception', 'Insight', 'Intimidation', 'Performance', 'Persuasion'], label: 'Eloquent Apprentice skills' }, { level: 14, type: 'uaWordOfPower', n: 1 }]));
  // These are free riders, not reactions or bonus actions: Implacable Mark's attack "doesn't require your reaction",
  // and Bolts from the Grave comes with the Cunning Action you already spent your bonus action on.
  setData('fighter', 'uaknight', 'Implacable Mark', { col: 'move' });
  setData('rogue', 'uarevived', 'Bolts from the Grave', { col: 'move' });

  // ======================= ARTIFICER: Archivist =======================
  Object.assign(X, {
    'artificer:uaarchivist:Tools of the Trade': { none: true },
    'artificer:uaarchivist:Artificial Mind': { col: 'action', text: 'Awaken a Tiny item as your spectral mind (darkvision 60 ft, dim light); cast artificer spells as if from its space, using its senses' },
    'artificer:uaarchivist:Information Overload': { col: 'action', dc: 'spell', save: 'INT', roll: '1d8+{artificer>=5?max(1,int):0}', rollNote: 'psychic on a failed save (+2d8 with a 1st-level slot, +1d8 per slot level above); next attack against it has advantage' },
    'artificer:uaarchivist:Mind Network': { none: true },
    'artificer:uaarchivist:Psychic Damage': { text: 'Psychic damage from artificer spells and Information Overload: +{max(1,int)} to one damage roll' },
    'artificer:uaarchivist:Mind Overload': { col: 'move', dc: 'spell', save: 'INT', text: 'After psychic damage from Information Overload or an artificer spell: on a failed save the target is stunned until the end of your next turn' },
    'artificer:uaarchivist:Infoportation': { col: 'move', slotRestore: 2, text: 'As you cast an artificer spell, teleport to a space within 5 ft of your spectral mind or an infused item' }
  });

  // ======================= BARBARIAN: Path of the Wild Soul =======================
  // The d8 table is rolled when you rage; each result has a button (free unless it says otherwise) for its roll or effect.
  const surgeActs = [
    { name: 'Roll Wild Surge (d8)', col: 'move', onlyRaging: true, roll: '1d8', rollNote: 'Wild Surge table result' },
    { name: '1: Necrotic burst', col: 'move', onlyRaging: true, roll: '1d10', rollNote: 'necrotic to each creature within 30 ft; you gain temp HP equal to the total dealt' },
    { name: '2: Teleport 20 ft', col: 'bonus', onlyRaging: true, text: 'Teleport up to 20 ft to a space you can see (again as a bonus action each turn while raging)' },
    { name: '3: Flumph explodes', col: 'move', onlyRaging: true, dc: 'con', save: 'DEX', roll: '2d8', rollNote: 'force to creatures near the exploding flumph (DEX save negates)' },
    { name: '4: Arcane armor', col: 'move', onlyRaging: true, use: R('Wild Surge: Arcane armor', 10, { ac: 2, note: 'Creatures that hit you take force damage equal to your CON mod' }) },
    { name: '4: Retaliate', col: 'move', onlyRaging: true, onlyWhen: { effect: 'Wild Surge: Arcane armor' }, roll: '{con}', rollNote: 'force damage to the creature that hit you' },
    { name: '5: Difficult ground', col: 'move', onlyRaging: true, use: R('Wild Surge: Difficult ground', 10, { note: 'Ground within 10 ft of you is difficult terrain for your enemies' }) },
    { name: '6: Mark a foe', col: 'move', onlyRaging: true, dc: 'con', save: 'WIS', text: 'A creature you can see: failed save, disadvantage on attacks against you while you rage' },
    { name: '7: Psychic weapon', col: 'move', onlyRaging: true, use: R('Wild Surge: Psychic weapon', 10, { note: 'Your weapon deals psychic damage, gains light and thrown (20/60), and returns to your hand' }) },
    { name: '8: Radiant line', col: 'move', onlyRaging: true, dc: 'con', save: 'CON', roll: '2d8', rollNote: 'radiant to each creature in a 60-ft line (failed CON save: also blinded)' }];
  Object.assign(X, {
    'barbarian:uawildsoul:Lingering Magic': { spells: ['Detect Magic'], spellCls: 'other', spellNote: 'No slot or components; CON mod times per long rest (tracked on the feature)' },
    'barbarian:uawildsoul:Wild Surge': { dc: 'con', save: null, acts: surgeActs },
    'barbarian:uawildsoul:Magic Reserves': { roll: '1d{tier(barbarian,6,4,14,6)}', rollNote: 'slot level the creature regains (or 5 × roll temp HP); you take 5 × roll force damage' },
    'barbarian:uawildsoul:Arcane Rebuke': { onlyRaging: true, roll: '3d6', rollNote: 'force damage to the creature that forced the save' },
    'barbarian:uawildsoul:Chaotic Fury': { onlyRaging: true, roll: '1d8', rollNote: 'new Wild Surge result (replaces the current one)' }
  });

  // ======================= BARD: College of Satire =======================
  Object.assign(X, {
    'bard:uasatire:Bonus Proficiencies': { passive: { skillProf: ['Sleight of Hand'] } },
    'bard:uasatire:Tumbling Fool': { dash: true, use: R('Tumbling Fool', 1, { note: 'Disengage; climb speed equal to your speed; half damage from falling' }) },
    "bard:uasatire:Fool's Insight": { spells: ['Detect Thoughts'], spellNote: 'Free casting CHA mod times per long rest (tracked on the feature)', dc: 'spell', save: 'WIS' },
    "bard:uasatire:Fool's Luck": { col: 'move', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'added to your failed check, save or attack', text: 'If it turns into a success, the DM later subtracts the same number from one of your rolls; no Fool’s Luck again until then' }
  });

  // ======================= CLERIC =======================
  const DS = t => ({ col: 'move', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: t + ' (once per turn on a weapon hit)' });
  const SLOT_LV = [1, 3, 5, 7, 9, 11, 13, 15, 17];   // cleric level that unlocks each spell slot level
  Object.assign(X, {
    // City Domain
    'cleric:uacity:Bonus Proficiencies': { spells: ['On/Off'] },
    'cleric:uacity:Heart of the City': { text: 'Advantage on one Deception, Intimidation or Persuasion check (in a city)' },
    'cleric:uacity:Channel Divinity: Spirits of the City': { dc: false, text: 'Within 30 ft (urban only): control utilities and simple machines, or knock a creature prone or restrain it — it escapes with an Athletics or Acrobatics check vs DC {8+prof+wis}' },
    'cleric:uacity:Block Watch': { passive: { advNote: 'In a city: proficiency in Insight and Perception, with double your proficiency bonus' } },
    'cleric:uacity:Divine Strike': DS('psychic'),
    'cleric:uacity:Express Transit': { col: 'action', text: 'Teleport from a mass-transit stop to any other stop of that network in the same city' },
    // Protection Domain
    'cleric:uaprotection:Bonus Proficiency': { none: true },
    'cleric:uaprotection:Shield of the Faithful': { text: 'Impose disadvantage on an attack against a creature within 5 ft of you (you see both)' },
    'cleric:uaprotection:Channel Divinity: Radiant Defense': { roll: '2d10+cleric', rollNote: 'radiant to the first creature that hits the warded ally (ward lasts 1 minute)' },
    'cleric:uaprotection:Blessed Healer': { text: 'After you heal another creature with a spell slot, you regain 2 + the spell’s level in HP', acts: SLOT_LV.map((m, i) => ({ name: `${['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'][i]} slot +${3 + i}`, col: 'move', min: m, use: { heal: String(3 + i) } })) },
    'cleric:uaprotection:Divine Strike': DS('radiant'),
    'cleric:uaprotection:Indomitable Defense': { col: 'action', text: 'Transfer one of your two resistances to a creature you touch (you lose it) until your next short or long rest' },
    // Unity Domain
    'cleric:uaunity:Emboldening Bond': { slotRestore: true, use: R('Emboldening Bond', 600, { note: 'Bonded pair within 30 ft: once per turn each adds 1d4 to an attack, check or save' }),
      acts: [{ name: 'Bond die', col: 'move', onlyWhen: { effect: 'Emboldening Bond' }, roll: '1d4', rollNote: 'added to an attack, check or save (once per turn)' }] },
    'cleric:uaunity:Channel Divinity: Shared Burden': { text: 'Split the damage evenly between the target and up to {max(1,wis)} willing creatures within 30 ft (you can include yourself; each takes at least 1)' },
    'cleric:uaunity:Protective Bond': { col: 'reaction', text: 'A bonded creature uses its reaction to give the other resistance to the triggering damage' },
    'cleric:uaunity:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:uaunity:Enduring Unity': { col: 'move', use: R('Enduring Unity', 10, { atkAdv: 'Enduring Unity', resist: ['all damage'], note: 'Bonded partner at 0 HP: advantage on attacks, checks and saves; resistance to all damage; spend Hit Dice (+CON) to heal them' }) },
    // Fate Domain
    'cleric:uafate:Omens and Portents': { spells: ['Augury'], spellNote: 'Once per long rest without a slot or components (tracked on the feature)' },
    'cleric:uafate:Ties That Bind': { dc: 'spell', save: 'WIS (to refuse)', use: R('Ties That Bind', 600, { note: 'You know where the bound creature is; once per turn add 1d6 to your spell’s damage or healing on it' }),
      acts: [{ name: 'Fate die', col: 'move', onlyWhen: { effect: 'Ties That Bind' }, roll: '1d6', rollNote: 'added to your spell’s damage or healing on the bound creature (once per turn)' }] },
    'cleric:uafate:Channel Divinity: Strands of Fate': { use: R('Strands of Fate', 10, { note: 'Reaction: give advantage or disadvantage on an attack roll or check you can see (decide before the roll)' }, { conc: true }),
      acts: [{ name: 'Tug the strand', col: 'reaction', onlyWhen: { effect: 'Strands of Fate' }, text: 'Advantage or disadvantage on that attack roll or ability check' }] },
    'cleric:uafate:Insightful Striking': { roll: '1d6', rollNote: 'added to your next attack against it, or subtracted from its next save against your spell (until the end of your next turn)' },
    'cleric:uafate:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    // Foresight is not a cleric spell, so it isn't added to the spell list (that would allow casting it with a slot).
    'cleric:uafate:Visions of the Future': { use: R('Foresight', 10, { atkAdv: 'Foresight', note: 'Can’t be surprised; advantage on attacks, checks and saves; attacks against you have disadvantage' }), text: 'Foresight on yourself or a touched creature, without a slot, for 1 minute' }
  });

  // ======================= DRUID: Circle of Twilight =======================
  const scythe = [];
  for (let n = 1; n <= 10; n++) scythe.push({ name: n + 'd10', col: 'move', cost: { from: "Harvest's Scythe", n }, roll: n + 'd10', rollNote: 'necrotic on one damage roll of your spell; if it kills a hostile creature, you or an ally within 30 ft heals 2 per die (5 per die vs undead)', min: 2 * n });
  Object.assign(X, {
    "druid:uatwilight:Harvest's Scythe": { acts: scythe },
    // Speak with dead and etherealness aren't druid spells: the free casting is tracked on the feature, not added to the spell list.
    'druid:uatwilight:Speech Beyond the Grave': { text: 'Cast speak with dead without material components; the corpse understands you and you understand it, whatever the language' },
    'druid:uatwilight:Watcher at the Threshold': { passive: { resist: ['necrotic', 'radiant'], advNote: 'Allies within 30 ft (while you aren’t incapacitated): death saves' } },
    'druid:uatwilight:Paths of the Dead': { text: 'Cast etherealness without a slot' }
  });

  // ======================= FIGHTER =======================
  const SD = '1d{tier(fighter,3,8,10,10,18,12)}';
  const relentless = { onInit: { from: 'Combat Superiority', regain: 1, ifEmpty: true }, text: 'When you roll initiative with no superiority dice left, you regain one (the sheet does it for you).' };
  Object.assign(X, {
    // Brute
    'fighter:uabrute:Brute Force': { col: 'move', roll: '1d{tier(fighter,3,4,10,6,16,8,20,10)}', rollNote: 'extra damage on a hit with a weapon you’re proficient with' },
    'fighter:uabrute:Brutish Durability': { col: 'move', roll: '1d6', rollNote: 'added to your saving throw (a death save of 20+ counts as a natural 20)' },
    'fighter:uabrute:Additional Fighting Style': { none: true },
    'fighter:uabrute:Devastating Critical': { col: 'move', roll: '{fighter}', rollNote: 'extra damage on a weapon critical hit' },
    'fighter:uabrute:Survivor': { col: 'move', onlyWhen: { hpBelowHalf: true }, use: { heal: '5+con' }, text: 'Start of each of your turns at half HP or less (but above 0)' },
    // Knight
    'fighter:uaknight:Born to the Saddle': { passive: { advNote: 'Saves to avoid falling off your mount' }, text: 'Mounting or dismounting costs only 5 ft of movement' },
    'fighter:uaknight:Implacable Mark': { text: 'Marked creature within 5 ft moved or attacked someone else: melee attack with advantage (no reaction needed); on a hit +{fighter} damage' },
    'fighter:uaknight:Noble Cavalry': { none: true },
    'fighter:uaknight:Hold the Line': { text: 'Melee attack against a creature that moved into your reach: on a hit +{floor(fighter/2)} damage and its speed becomes 0 this turn' },
    'fighter:uaknight:Rapid Strike': { col: 'bonus', text: 'Give up advantage on one attack to make an extra weapon attack against the same target' },
    "fighter:uaknight:Defender's Blade": { passive: { acHeavy: 1 }, text: 'Opportunity attacks without spending your reaction (once per turn)' },
    // Monster Hunter
    'fighter:uamonsterhunter:Bonus Proficiencies': { none: true },
    'fighter:uamonsterhunter:Combat Superiority': { resource: true, dc: false, save: null, acts: [
      { name: 'Attack bonus', col: 'move', cost: true, roll: SD, rollNote: 'added to the weapon attack roll' },
      { name: 'Damage', col: 'move', cost: true, roll: SD, rollNote: 'extra damage; target has disadvantage on its next concentration save' },
      { name: 'Perception/Insight', col: 'move', cost: true, roll: SD, rollNote: 'added to the check' },
      { name: 'INT/WIS/CHA save', col: 'move', cost: true, roll: SD, rollNote: 'added to the save' }] },
    "fighter:uamonsterhunter:Hunter's Mysticism": { spells: ['Detect Magic', 'Protection from Evil and Good'], spellCls: 'other', spellNote: 'WIS; detect magic as a ritual; protection from evil and good once per long rest without a slot (tracked on the feature)' },
    'fighter:uamonsterhunter:Monster Slayer': { acts: [
      { name: 'Two dice on damage', col: 'move', cost: { from: 'Combat Superiority', n: 2 }, roll: '2d{tier(fighter,3,8,10,10,18,12)}', rollNote: 'extra damage' },
      { name: 'Max vs monster (2 dice)', col: 'move', cost: { from: 'Combat Superiority', n: 2 }, roll: '{2*tier(fighter,3,8,10,10,18,12)}', rollNote: 'extra damage (maximum, vs an aberration, fey, fiend or undead)' },
      { name: 'Max vs monster (1 die)', col: 'move', cost: { from: 'Combat Superiority', n: 1 }, roll: '{tier(fighter,3,8,10,10,18,12)}', rollNote: 'extra damage (maximum, vs an aberration, fey, fiend or undead)' }] },
    'fighter:uamonsterhunter:Relentless': relentless,
    // Sharpshooter
    'fighter:uasharpshooter:Steady Aim': { use: R('Steady Aim', 1, { dmg: '2+floor(fighter/2)', note: 'Only ranged weapon attacks vs the aimed target: they ignore half and three-quarters cover' }) },
    'fighter:uasharpshooter:Careful Eyes': { col: 'bonus', text: 'Take the Search action' },
    'fighter:uasharpshooter:Close-Quarters Shooting': { text: 'No disadvantage on ranged attacks for being within 5 ft of an enemy; a creature you hit with a ranged attack within 5 ft can’t take reactions until the end of your turn' },
    'fighter:uasharpshooter:Rapid Strike': { col: 'bonus', text: 'Give up advantage on one attack to make an extra weapon attack against the same target' },
    'fighter:uasharpshooter:Snap Shot': { trigger: 'initiative', triggerText: 'Snap Shot: on your first turn of this combat, the Attack action gets one extra ranged weapon attack.', triggerLabel: 'OK' },
    // Scout
    'fighter:uascout:Bonus Proficiencies': { none: true },
    'fighter:uascout:Combat Superiority': { resource: true, acts: [
      { name: 'Attack bonus', col: 'move', cost: true, roll: SD, rollNote: 'added to the weapon attack roll' },
      { name: 'Skill check', col: 'move', cost: true, roll: SD, rollNote: 'add half (rounded up) to Athletics, Nature, Perception, Stealth or Survival' },
      { name: 'Defensive', col: 'reaction', cost: true, onlyWhen: { armor: 'notHeavy' }, roll: SD, rollNote: 'added to AC against the hit; half damage if it still hits' }] },
    'fighter:uascout:Natural Explorer': { none: true },
    'fighter:uascout:Relentless': relentless
  });

  // ======================= MONK: Way of Tranquility =======================
  Object.assign(X, {
    'monk:uatranquility:Path of Tranquility': { dc: 'wis', save: 'WIS', use: R('Sanctuary (Path of Tranquility)', 4800, { note: 'Attackers must make a WIS save; ends if you attack, deal damage or cast a spell on an enemy. Wait 1 minute after it ends to use again' }) },
    'monk:uatranquility:Healing Hands': { acts: [
      { name: 'Heal self 10', col: 'action', cost: { from: 'Healing Hands', n: 10 }, use: { heal: '10' } },
      { name: 'Heal self 25', col: 'action', cost: { from: 'Healing Hands', n: 25 }, use: { heal: '25' } },
      { name: 'Cure disease/poison', col: 'action', cost: { from: 'Healing Hands', n: 5 }, text: 'Cure one disease or neutralize one poison (5 points each). To heal someone else, lower the pool by the amount' }],
      text: 'Touch a creature and restore any number of HP from the pool; can replace one Flurry of Blows strike' },
    'monk:uatranquility:Emissary of Peace': { passive: { advNote: 'CHA checks to calm violence or counsel peace' } },
    'monk:uatranquility:Douse the Flames of War': { dc: 'wis', save: 'WIS', text: 'Auto-success if it took damage this turn; on a failure it can’t attack or cast damaging spells for 1 minute (ends if it or an ally is attacked or hurt)' },
    'monk:uatranquility:Anger of a Gentle Soul': { use: R('Anger of a Gentle Soul', 2, { dmg: 'monk', note: 'Your damage rolls get +monk level until the end of your next turn' }) }
  });

  // ======================= ROGUE: Revived =======================
  Object.assign(X, {
    'rogue:uarevived:Tokens of Past Lives': { trigger: 'longRest', triggerText: 'Tokens of Past Lives: choose one skill or tool proficiency until your next long rest.', triggerLabel: 'OK' },
    'rogue:uarevived:Revived Nature': { passive: { resist: ['poison'], advNote: 'Saves against disease and being poisoned' }, text: 'No need to eat, drink, breathe or sleep (4 hours of quiet rest for a long rest)' },
    'rogue:uarevived:Bolts from the Grave': { roll: '{ceil(rogue/2)}d6', rollNote: 'necrotic on a hit (uses your Sneak Attack this turn)', text: 'Right after Cunning Action: ranged spell attack +{prof+dex} against a creature within 30 ft' },
    'rogue:uarevived:Connect with the Dead': { spells: ['Speak with Dead'], spellCls: 'other', spellNote: 'INT; free casting tracked on the feature', text: 'Afterwards gain a random language, skill/tool or saving throw proficiency until your next rest' },
    'rogue:uarevived:Audience with Death': { passive: { advNote: 'Death saving throws' } },
    'rogue:uarevived:Ethereal Jaunt': { col: 'move', text: 'With your Cunning Action, also teleport up to 30 ft to a space you’re aware of (no line of sight needed)' }
  });

  // ======================= MAGES OF STRIXHAVEN =======================
  const SPMOD = { bard: 'cha', warlock: 'cha', sorcerer: 'cha', wizard: 'int', druid: 'wis' };
  const strix = (cls, s, map) => { if (sub(cls, 'uamage' + s)) Object.entries(map).forEach(([n, fx]) => { X[cls + ':uamage' + s + ':' + n] = fx; }); };
  ['bard', 'warlock', 'wizard'].forEach(c => strix(c, 'lorehold', {
    'Lorehold Spells': { none: true },
    'Ancient Companion': { trigger: ['shortRest', 'longRest'], triggerText: 'Ancient Companion: call a Healer, Sage or Warrior spirit into a statue ({5+5*' + c + '} HP, AC 14, or 16 for a Warrior).', triggerLabel: 'OK',
      text: 'Statue spirit: {5+5*' + c + '} HP, AC 14 (16 Warrior); acts right after you. Action: spend a slot to heal it 10 HP per slot level' },
    'Lessons of the Past': { text: 'Healer: more max HP and healing · Sage: advantage on INT checks to recall lore, extra force damage once per turn · Warrior: a weapon attack after a radiant cantrip' },
    'War Echoes': { col: 'move', dc: 'spell', save: 'WIS', text: 'After you hit: on a failed save the target is vulnerable to one damage type of your choice until the end of your next turn' },
    "History's Whims": { slotRestore: 4, use: R("History's Whims", 10, { note: 'Start of each turn: choose Luck (bonus on saves vs damage), Resistance (B/P/S) or Swiftness (more movement)' }),
      acts: [{ name: 'Resistance this turn', col: 'move', onlyWhen: { effect: "History's Whims" }, use: R('History’s Whims: Resistance', 1, { resist: BPS, note: 'Until the start of your next turn' }) }] }
  }));
  ['druid', 'sorcerer', 'wizard'].forEach(c => strix(c, 'prismari', {
    'Creative Skills': { none: true },
    'Kinetic Artistry': { resource: true, dc: false, save: null, acts: [
      { name: 'Boreal Sweep', col: 'bonus', cost: true, dash: true, dc: 'spell', save: 'STR', text: 'Dash; move across water this turn; creatures of your choice near your path: STR save or prone' },
      { name: 'Scorching Whirl', col: 'bonus', cost: true, dash: true, dc: 'spell', save: 'DEX', roll: '1d4+' + SPMOD[c], rollNote: 'fire to creatures of your choice within 5 ft (on a failed DEX save)' },
      { name: 'Thunderlight Jaunt', col: 'bonus', cost: true, dash: true, text: 'Dash; move through creatures’ spaces without provoking opportunity attacks' }] },
    'Favored Medium': { text: 'Cast a spell of your Favored Medium type: allies of your choice within 5 ft also resist that damage' },
    'Focused Expression': { col: 'move', roll: '1d6', rollNote: 'extra Favored Medium damage (cold slows, fire burns, lightning shocks)' },
    'Impeccable Physicality': { passive: { saveProf: ['dex'], minD20: { value: 10, kinds: ['save'], ab: 'dex' } }, text: 'A d20 roll of 9 or lower on a DEX save counts as 10 (built in)' }
  }));
  ['sorcerer', 'wizard'].forEach(c => strix(c, 'quandrix', {
    'Quandrix Spells': { none: true },
    'Functions of Probability': { dc: false, save: null, acts: [
      { name: 'Diminishing', col: 'move', dc: 'spell', save: 'WIS', roll: '1d6', rollNote: 'subtracted from its next attack roll (on a failed WIS save)' },
      { name: 'Supplemental', col: 'move', roll: '1d6', rollNote: 'an ally adds it to its next attack roll or save' }] },
    'Velocity Shift': { dc: 'spell', save: 'CHA', text: 'Failed save (a willing creature can fail): teleport it to a space you can see within 30 ft of where it is' },
    'Null Equation': { col: 'move', dc: 'spell', save: 'CON', text: 'After you deal damage: on a failed save, disadvantage on STR and DEX saves and half damage with weapon attacks until the start of your next turn' },
    'Quantum Tunneling': { col: 'move', passive: { resist: BPS }, roll: '1d10', rollNote: 'force damage to you per 5 ft moved inside a creature or object' }
  }));
  ['bard', 'warlock', 'wizard'].forEach(c => strix(c, 'silverquill', {
    'Eloquent Apprentice': { none: true },
    'Silvery Barbs': { slotRestore: true, text: 'The creature rerolls and uses the lower result; then a creature you choose can reroll one d20 within 1 minute' },
    'Inky Shroud': { spells: ['Darkness'], spellNote: 'Once per long rest without a slot (tracked on the feature); you see through it',
      acts: [{ name: 'Shroud damage', col: 'move', roll: '2d10', rollNote: 'psychic to a creature of your choice starting its turn in the darkness' }] },
    'Infusion of Eloquence': { col: 'move', text: 'Your spell’s damage becomes psychic (target frightened of you) or radiant (target charmed by you) until the start of your next turn; +{prof} to one damage roll' },
    'Word of Power': { text: 'Your choice: Deadly Despair or Selfless Invocation' }
  }));
  ['druid', 'warlock'].forEach(c => strix(c, 'witherbloom', {
    'Witherbloom Spells': { none: true },
    'Essence Tap': { resource: true, acts: [
      { name: 'Overgrowth', col: 'bonus', cost: true, use: R('Essence Tap: Overgrowth', 10, { note: 'Bonus action: spend a Hit Die to heal (roll + spell mod)' }) },
      { name: 'Overgrowth heal', col: 'bonus', onlyWhen: { effect: 'Essence Tap: Overgrowth' }, use: { hitDie: { plus: SPMOD[c] } }, text: 'Spends your biggest Hit Die left and heals its roll + your spellcasting modifier' },
      { name: 'Withering Strike', col: 'bonus', cost: true, use: R('Essence Tap: Withering Strike', 10, { note: 'Your damage can be necrotic and ignores resistance to necrotic' }) }] },
    'Witherbloom Brew': { text: 'Brew potions (24 hours; drinking or giving one is an action): Fortifying (resistance), Quickening (healing and end a condition) or Toxifying (poisoned weapon)' },
    'Witherbloom Adept': { text: 'Once per turn, a spell dealing necrotic damage or restoring HP deals or restores +{prof} to one target' },
    'Withering Vortex': { col: 'move', text: 'An ally within 30 ft of the target regains HP equal to half the necrotic damage dealt' }
  }));

  // ======================= RACES =======================
  Object.assign(X, {
    'race:Relentless Nature': { onlyWhen: { hpBelowHalf: true }, use: { heal: '1' }, text: 'Start of your turn below half HP: regain 1 HP' },
    'race:Human Revenant': { none: true },
    'race:Necrotic Ancestry': { passive: { resist: ['necrotic'] }, text: 'Breath weapon deals necrotic damage' },
    'race:Tiefling Revenant': { none: true },
    'race:Grugach Weapon Training': { none: true },
    'race:Sylvan Tongue': { none: true },
    'race:Lashing Tail': { col: 'reaction', roll: '1d4+str', rollNote: 'slashing (tail strike against a creature that hit you in melee)' },
    'race:Wiry Frame': { none: true },
    'race:Construct': { none: true },
    'race:Armored Plating': { none: true },
    'race:Balance Chaos': { text: 'Treat an attack roll or save of 9 or lower as a 10' },
    'race:Living Construct': { none: true },
    'race:Ordered Mind': { passive: { skillAdv: ['Insight'], advNote: 'Saves against being charmed or to end it' } },
    'race:Vestigial Wings': { use: R('Vestigial Wings', 1, { fly: 'walk', note: 'You fall if still aloft at the end of your turn' }) }
  });
  soft('race:Flight', { none: true });
  soft('race:Cantrip', { none: true });
  soft('race:Bite', { none: true });

  // ======================= FEATS =======================
  Object.assign(X, {
    'feat:Acrobat': { col: 'bonus', text: 'DC 15 Acrobatics check: ignore difficult terrain until the end of the turn' },
    'feat:Alchemist': { col: 'action', text: 'Identify a potion by handling it; potions of healing you brew or use heal the maximum' },
    'feat:Animal Handler': { col: 'bonus', text: 'Command a friendly beast within 60 ft that can hear you' },
    'feat:Arcanist': { spells: ['Prestidigitation', 'Detect Magic'], spellCls: 'other', spellNote: 'Detect magic once per long rest without a slot (INT)', max: '1', reset: 'long' },
    'feat:Brawny': { passive: { carry: 2 } },
    'feat:Burglar': { none: true },
    'feat:Diplomat': { text: 'Persuasion vs Insight after 1 minute of talking: charmed while you stay within 60 ft (and 1 minute after)' },
    'feat:Empathic': { col: 'action', text: 'Insight vs Deception: advantage on attacks and checks against it until the end of your next turn' },
    'feat:Historian': { text: 'Help action + DC 15 History: the helped creature also adds +{prof}' },
    'feat:Investigator': { col: 'bonus', text: 'Take the Search action' },
    'feat:Medic': { trigger: 'shortRest', triggerText: 'Tend up to six creatures: each one spending Hit Dice regains the maximum instead of rolling.', triggerLabel: 'OK' },
    'feat:Menacing': { col: 'action', text: 'Replace one attack: Intimidation vs Insight, frightened of you until the end of your next turn' },
    'feat:Naturalist': { spells: ['Druidcraft', 'Detect Poison and Disease'], spellCls: 'other', spellNote: 'Detect poison and disease once per long rest without a slot (INT)', max: '1', reset: 'long' },
    'feat:Perceptive': { none: true },
    'feat:Performer': { none: true },
    'feat:Quick-Fingered': { col: 'bonus', text: 'Make a Sleight of Hand check' },
    'feat:Silver-Tongued': { col: 'action', text: 'Replace one attack: Deception vs Insight; no opportunity attacks from it and advantage on your next attack against it this turn' },
    'feat:Stealthy': { none: true },
    'feat:Survivalist': { spells: ['Alarm'], spellCls: 'other', once: true, spellNote: 'Once per long rest without a slot' },
    'feat:Theologian': { spells: ['Thaumaturgy', 'Detect Evil and Good'], spellCls: 'other', spellNote: 'Detect evil and good once per long rest without a slot (INT)', max: '1', reset: 'long' },
    'feat:Blade Mastery': { col: 'reaction', use: R('Blade Mastery', 1, { ac: 1, note: 'Holding a shortsword, longsword, scimitar, rapier or greatsword' }), passive: { advNote: 'Opportunity attacks with mastered blades' }, text: '+1 to attack rolls with those blades (add to the weapon)' },
    'feat:Fell Handed': { text: '+1 to attacks with axes, hammers and mauls; advantage hit can knock prone; disadvantage miss deals {max(0,str)} damage' },
    'feat:Flail Mastery': { col: 'bonus', dc: 'str', save: 'STR', use: R('Flail Mastery', 1, { atk: 2, note: 'Next flail attack vs a creature with a shield' }), text: 'Opportunity attack hit: STR save or prone' },
    'feat:Spear Mastery': { acts: [
      { name: 'Set vs charge', col: 'bonus', use: R('Set vs charge', 1, { note: 'Reaction attack on a creature moving 20 ft toward you: +1d8 damage' }), roll: '1d8', rollNote: 'extra damage on the set attack' },
      { name: 'Extend reach', col: 'bonus', use: R('Spear reach', 1, { note: '+5 ft reach with your spear this turn' }) }], text: '+1 to spear attacks; spear damage d8 (d10 two-handed)' },
    'feat:Gourmand': { col: 'action', trigger: 'longRest', triggerText: 'Cook for up to six creatures: each regains two extra Hit Dice and has advantage on CON saves vs disease for 24 hours.', triggerLabel: 'OK', text: 'Tell whether food or drink within 5 ft is poisoned' },
    'feat:Master of Disguise': { none: true },
    'feat:Tandem Tactician': { col: 'bonus', text: 'Help action (reaches 30 ft; can aid two allies attacking the same creature)' },
    'feat:Shield Training': { none: true },
    'feat:Tracker': { spells: ["Hunter's Mark"], spellCls: 'other', once: true, spellNote: 'Once per long rest without a slot', passive: { advNote: 'Survival checks to track' } },
    'feat:Wild Talent': { roll: '1d6', rollNote: 'Psionic Talent die: add to a check or weapon damage (shrinks on a high roll, grows on a 1)' },
    'feat:Metabolic Control': { max: '1', reset: 'long', text: 'Meditate 1 minute for short-rest benefits (or spend your talent die to go 24 hours without food or water)' },
    'feat:Tower of Iron Will': { col: 'reaction', roll: '1d6', rollNote: 'Psionic Talent die added to the failed save' }
  });

  Object.assign(DND.featFx, X);

  // ======================= FIGHTING STYLES (UA) =======================
  // ua_classes_b.js also pushes these names, so set every matching entry.
  const setAll = (type, name, fx) => ((DND.options[type] || { list: [] }).list).forEach(e => { if (e[0] === name) e[3] = Object.assign({}, e[3] || {}, fx); });
  setAll('fightingStyle', 'Close Quarters Shooter', { rangedAtk: 1 });
  setAll('fightingStyle', 'Mariner', { passive: { swim: 'walk', climb: 'walk' }, acts: [{ name: 'Mariner AC', use: R('Mariner', null, { ac: 1, note: 'Only while not in heavy armor and without a shield' }) }] });
  setAll('fightingStyle', 'Tunnel Fighter', { col: 'bonus', use: R('Tunnel Fighter', 1, { note: 'Opportunity attacks without a reaction vs creatures moving more than 5 ft within your reach' }) });
})();
