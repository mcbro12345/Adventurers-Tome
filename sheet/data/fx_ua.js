// Feature automation for Unearthed Arcana content defined in ua_classes_a.js (UA subclasses for existing classes,
// incl. Mages of Strixhaven), ua_races.js (UA races/subraces) and ua_misc.js (UA feats and fighting styles).
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const X = {};
  // Only set when nothing else (e.g. fx_races) already covers a trait name shared with printed races.
  const soft = (k, fx) => { if (!DND.featFx[k]) X[k] = fx; };

  // ======================= ARTIFICER: Archivist =======================
  Object.assign(X, {
    'artificer:uaarchivist:Tools of the Trade': { none: true },
    'artificer:uaarchivist:Artificial Mind': { col: 'action', text: 'Awaken a Tiny item as your spectral mind (darkvision 60 ft); cast artificer spells as if from its space' },
    'artificer:uaarchivist:Information Overload': { col: 'action', dc: 'spell', save: 'INT', roll: '1d8+{artificer>=5?max(1,int):0}', rollNote: 'psychic (+2d8 for a 1st-level slot, +1d8 per level above); next attack against it has advantage' },
    'artificer:uaarchivist:Mind Network': { none: true },
    'artificer:uaarchivist:Psychic Damage': { text: 'Psychic damage from artificer spells and Information Overload: +{max(1,int)}' },
    'artificer:uaarchivist:Mind Overload': { dc: 'spell', save: 'INT', text: 'On a failed save the target is stunned until the end of your next turn' },
    'artificer:uaarchivist:Infoportation': { text: 'Teleport to a space within 5 ft of your spectral mind or an infused item (again by spending a 2nd-level or higher slot)' }
  });

  // ======================= BARBARIAN: Path of the Wild Soul =======================
  const surgeActs = [
    { name: 'Surge 1: Necrotic burst', onlyRaging: true, roll: '1d10', rollNote: 'necrotic to creatures within 30 ft; you gain that many temp HP' },
    { name: 'Surge 2: Teleport', col: 'bonus', onlyRaging: true, text: 'Teleport up to 20 ft' },
    { name: 'Surge 3: Flumph explodes', onlyRaging: true, dc: 'con', save: 'DEX', roll: '2d8', rollNote: 'force (DEX save negates)' },
    { name: 'Surge 4: Arcane armor', onlyRaging: true, use: R('Wild Surge: Arcane armor', 10, { ac: 2, note: 'Creatures that hit you take force damage equal to your CON mod' }) },
    { name: 'Surge 8: Radiant line', onlyRaging: true, dc: 'con', save: 'CON', roll: '2d8', rollNote: 'radiant in a 60-ft line (CON save or blinded)' }];
  Object.assign(X, {
    'barbarian:uawildsoul:Lingering Magic': { spells: ['Detect Magic'], spellCls: 'other', spellNote: 'No slot or components; CON mod times per long rest' },
    'barbarian:uawildsoul:Wild Surge': { dc: 'con', roll: '1d8', rollNote: 'Wild Surge table (roll when you rage)', acts: surgeActs },
    'barbarian:uawildsoul:Magic Reserves': { roll: '1d{tier(barbarian,6,4,14,6)}', rollNote: 'slot level regained, or 5 × roll temp HP; you take 5 × roll force damage' },
    'barbarian:uawildsoul:Arcane Rebuke': { onlyRaging: true, roll: '3d6', rollNote: 'force damage to the creature that forced the save' },
    'barbarian:uawildsoul:Chaotic Fury': { onlyRaging: true, roll: '1d8', rollNote: 'new Wild Surge effect (replaces the current one)' }
  });

  // ======================= BARD: College of Satire =======================
  Object.assign(X, {
    'bard:uasatire:Bonus Proficiencies': { passive: { skillProf: ['Sleight of Hand'] } },
    'bard:uasatire:Tumbling Fool': { dash: true, use: R('Tumbling Fool', 1, { note: 'Disengage; climb speed equal to speed; half damage from falls' }) },
    "bard:uasatire:Fool's Insight": { spells: ['Detect Thoughts'], spellNote: 'No slot; CHA mod times per long rest', dc: 'spell', save: 'WIS' },
    "bard:uasatire:Fool's Luck": { cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'added to your failed check, save or attack' }
  });

  // ======================= CLERIC =======================
  const DS = t => ({ col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: t + ', once per turn on a weapon hit' });
  Object.assign(X, {
    // City Domain
    'cleric:uacity:Bonus Proficiencies': { spells: ['On/Off'] },
    'cleric:uacity:Heart of the City': { text: 'Advantage on one Deception, Intimidation or Persuasion check in a city' },
    'cleric:uacity:Channel Divinity: Spirits of the City': { dc: 'spell', save: 'Athletics or Acrobatics check to escape', text: 'Control utilities and machines within 30 ft, or knock a creature prone or restrain it' },
    'cleric:uacity:Block Watch': { passive: { advNote: 'In a city: proficiency (double bonus) in Insight and Perception' } },
    'cleric:uacity:Divine Strike': DS('psychic'),
    'cleric:uacity:Express Transit': { text: 'Teleport between two mass-transit stops in the same city' },
    // Protection Domain
    'cleric:uaprotection:Bonus Proficiency': { none: true },
    'cleric:uaprotection:Shield of the Faithful': { text: 'Impose disadvantage on an attack against a creature within 5 ft of you' },
    'cleric:uaprotection:Channel Divinity: Radiant Defense': { roll: '2d10+cleric', rollNote: 'radiant to the first creature that hits the warded ally (1 minute)' },
    'cleric:uaprotection:Blessed Healer': { roll: '2', rollNote: '+ the spell’s level: HP you regain after healing another creature with a slot', healRoll: true },
    'cleric:uaprotection:Divine Strike': DS('radiant'),
    'cleric:uaprotection:Indomitable Defense': { col: 'action', passive: { resist: ['two of bludgeoning, necrotic, piercing, radiant, slashing (chosen on a rest)'] }, text: 'Transfer one of the resistances to a creature you touch until your next rest' },
    // Unity Domain
    'cleric:uaunity:Emboldening Bond': { use: R('Emboldening Bond', 600, { note: 'Bonded pair within 30 ft: once per turn add 1d4 to an attack, check or save' }),
      acts: [{ name: 'Bond die', roll: '1d4', rollNote: 'added to an attack, check or save (once per turn)' }] },
    'cleric:uaunity:Channel Divinity: Shared Burden': { text: 'Split the damage between the target and up to {max(1,wis)} willing creatures within 30 ft (each takes at least 1)' },
    'cleric:uaunity:Protective Bond': { col: 'reaction', text: 'A bonded creature uses its reaction to give the other resistance to the triggering damage' },
    'cleric:uaunity:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:uaunity:Enduring Unity': { use: R('Enduring Unity', 10, { atkAdv: 'Enduring Unity', note: 'Partner at 0 HP: advantage on attacks, checks and saves; resistance to all damage; spend Hit Dice to heal them' }) },
    // Fate Domain
    'cleric:uafate:Omens and Portents': { spells: ['Augury'], spellNote: 'Once per long rest without a slot or components' },
    'cleric:uafate:Ties That Bind': { dc: 'spell', save: 'WIS (to refuse)', roll: '1d6', rollNote: 'added once per turn to damage or healing your spell deals the bound creature' },
    'cleric:uafate:Channel Divinity: Strands of Fate': { use: R('Strands of Fate', 10, { note: 'Reaction: give advantage or disadvantage on an attack or check you can see' }) },
    'cleric:uafate:Insightful Striking': { roll: '1d6', rollNote: 'added to your next attack against it, or subtracted from its next save vs your spell' },
    'cleric:uafate:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:uafate:Visions of the Future': { spells: ['Foresight'], spellNote: 'Once per long rest without a slot (lasts 1 minute)',
      use: R('Foresight', 10, { atkAdv: 'Foresight', note: 'Advantage on attacks, checks and saves; attacks against you have disadvantage' }) }
  });

  // ======================= DRUID: Circle of Twilight =======================
  const scythe = [];
  for (let n = 1; n <= 10; n++) scythe.push({ name: n + 'd10', cost: { from: "Harvest's Scythe", n }, roll: n + 'd10', rollNote: 'necrotic; if it kills a hostile creature, heal 2 HP per die (5 per die vs undead)', min: 2 * n });
  Object.assign(X, {
    "druid:uatwilight:Harvest's Scythe": { acts: scythe },
    'druid:uatwilight:Speech Beyond the Grave': { spells: ['Speak with Dead'], spellNote: 'Once per short rest without a slot or material components' },
    'druid:uatwilight:Watcher at the Threshold': { passive: { resist: ['necrotic', 'radiant'], advNote: 'Allies within 30 ft: death saves' } },
    'druid:uatwilight:Paths of the Dead': { spells: ['Etherealness'], spellNote: 'Once per short rest without a slot' }
  });

  // ======================= FIGHTER =======================
  const SD = '1d{tier(fighter,3,8,10,10,18,12)}';
  const relentless = { trigger: 'initiative', triggerText: 'If you have no superiority dice left, regain one.', triggerLabel: 'Regain a die', use: { regain: { from: 'Combat Superiority', n: 1 } } };
  Object.assign(X, {
    // Brute
    'fighter:uabrute:Brute Force': { roll: '1d{tier(fighter,3,4,10,6,16,8,20,10)}', rollNote: 'extra damage on every weapon hit with a proficient weapon' },
    'fighter:uabrute:Brutish Durability': { roll: '1d6', rollNote: 'added to a saving throw (a death save of 20+ counts as a 20)' },
    'fighter:uabrute:Additional Fighting Style': { none: true },
    'fighter:uabrute:Devastating Critical': { roll: '{fighter}', rollNote: 'extra damage on a weapon critical hit' },
    'fighter:uabrute:Survivor': { onlyWhen: { hpBelowHalf: true }, use: { heal: '5+con' }, text: 'Start of each turn at half HP or less (but above 0)' },
    // Knight
    'fighter:uaknight:Born to the Saddle': { passive: { advNote: 'Saves to avoid falling off your mount' } },
    'fighter:uaknight:Implacable Mark': { text: 'Melee attack with advantage against the marked creature; on a hit +{fighter} damage' },
    'fighter:uaknight:Noble Cavalry': { none: true },
    'fighter:uaknight:Hold the Line': { text: 'On a hit: +{floor(fighter/2)} damage and its speed becomes 0 this turn' },
    'fighter:uaknight:Rapid Strike': { col: 'bonus', text: 'Give up advantage on one attack to make an extra weapon attack against the same target' },
    "fighter:uaknight:Defender's Blade": { passive: { acHeavy: 1 }, text: 'Opportunity attacks without your reaction (once per turn)' },
    // Monster Hunter
    'fighter:uamonsterhunter:Bonus Proficiencies': { none: true },
    'fighter:uamonsterhunter:Combat Superiority': { resource: true, acts: [
      { name: 'Attack bonus', cost: true, roll: SD, rollNote: 'added to the attack roll' },
      { name: 'Damage', cost: true, roll: SD, rollNote: 'extra damage; target has disadvantage on its next concentration save' },
      { name: 'Perception/Insight', cost: true, roll: SD, rollNote: 'added to the check' },
      { name: 'INT/WIS/CHA save', cost: true, roll: SD, rollNote: 'added to the save' }] },
    "fighter:uamonsterhunter:Hunter's Mysticism": { spells: ['Detect Magic', 'Protection from Evil and Good'], spellCls: 'other', spellNote: 'Detect magic as a ritual; protection from evil and good once per long rest' },
    'fighter:uamonsterhunter:Monster Slayer': { acts: [{ name: 'Two dice on damage', cost: { from: 'Combat Superiority', n: 2 }, roll: '2d{tier(fighter,3,8,10,10,18,12)}', rollNote: 'extra damage (maximum vs aberrations, fey, fiends and undead)' }] },
    'fighter:uamonsterhunter:Relentless': relentless,
    // Sharpshooter
    'fighter:uasharpshooter:Steady Aim': { use: R('Steady Aim', 1, { dmg: '2+floor(fighter/2)', note: 'Ranged attacks vs the aimed target only: ignore half and three-quarters cover' }) },
    'fighter:uasharpshooter:Careful Eyes': { col: 'bonus', text: 'Take the Search action' },
    'fighter:uasharpshooter:Close-Quarters Shooting': { none: true },
    'fighter:uasharpshooter:Rapid Strike': { col: 'bonus', text: 'Give up advantage on one attack to make an extra weapon attack against the same target' },
    'fighter:uasharpshooter:Snap Shot': { trigger: 'initiative', triggerText: 'First turn of combat: the Attack action gets one extra ranged weapon attack.', triggerLabel: 'OK' },
    // Scout
    'fighter:uascout:Bonus Proficiencies': { none: true },
    'fighter:uascout:Combat Superiority': { resource: true, acts: [
      { name: 'Attack bonus', cost: true, roll: SD, rollNote: 'added to the attack roll' },
      { name: 'Skill check', cost: true, roll: SD, rollNote: 'add half (round down) to Athletics, Nature, Perception, Stealth or Survival' },
      { name: 'Defensive', col: 'reaction', cost: true, onlyWhen: { armor: 'notHeavy' }, roll: SD, rollNote: 'added to AC against the hit; half damage if it still hits' }] },
    'fighter:uascout:Natural Explorer': { none: true },
    'fighter:uascout:Relentless': relentless
  });

  // ======================= MONK: Way of Tranquility =======================
  Object.assign(X, {
    'monk:uatranquility:Path of Tranquility': { dc: 'wis', save: 'WIS', use: R('Sanctuary (Path of Tranquility)', 4800, { note: 'Attackers must make a WIS save; ends if you attack or cast a spell on a hostile creature' }) },
    'monk:uatranquility:Healing Hands': { acts: [{ name: 'Cure disease/poison', col: 'action', cost: { from: 'Healing Hands', n: 5 }, text: 'Cure one disease or neutralize one poison' }] },
    'monk:uatranquility:Emissary of Peace': { passive: { advNote: 'CHA checks to calm violence or counsel peace' } },
    'monk:uatranquility:Douse the Flames of War': { dc: 'wis', save: 'WIS', text: 'Auto-success if it took damage this turn; it can’t attack or cast damaging spells for 1 minute' },
    'monk:uatranquility:Anger of a Gentle Soul': { use: R('Anger of a Gentle Soul', 2, { dmg: 'monk', note: 'Until the end of your next turn' }) }
  });

  // ======================= ROGUE: Revived =======================
  Object.assign(X, {
    'rogue:uarevived:Tokens of Past Lives': { trigger: 'longRest', triggerText: 'Choose one skill or tool proficiency until your next long rest.', triggerLabel: 'OK' },
    'rogue:uarevived:Revived Nature': { passive: { resist: ['poison'], advNote: 'Saves against disease and poison' } },
    'rogue:uarevived:Bolts from the Grave': { roll: '{ceil(rogue/2)}d6', rollNote: 'necrotic (ranged spell attack, 30 ft, DEX; uses your Sneak Attack this turn)' },
    'rogue:uarevived:Connect with the Dead': { spells: ['Speak with Dead'], spellCls: 'other', spellNote: 'INT; once per short rest without a slot' },
    'rogue:uarevived:Audience with Death': { passive: { advNote: 'Death saving throws' } },
    'rogue:uarevived:Ethereal Jaunt': { text: 'With Cunning Action, also teleport up to 30 ft (no line of sight needed)' }
  });

  // ======================= MAGES OF STRIXHAVEN =======================
  const SPMOD = { bard: 'cha', warlock: 'cha', sorcerer: 'cha', wizard: 'int', druid: 'wis' };
  const strix = (cls, sub, map) => { if (DND.classes[cls] && DND.classes[cls].subclasses['uamage' + sub]) Object.entries(map).forEach(([n, fx]) => { X[cls + ':uamage' + sub + ':' + n] = fx; }); };
  ['bard', 'warlock', 'wizard'].forEach(c => strix(c, 'lorehold', {
    'Lorehold Spells': { none: true },
    'Ancient Companion': { text: 'Statue spirit: {5+5*' + c + '} HP, AC 14 (16 Warrior); acts after you. Spend a slot to heal it 10 HP per slot level' },
    'Lessons of the Past': { text: 'Healer: more max HP and healing · Sage: advantage on knowledge checks, extra force damage once per turn · Warrior: weapon attack after a radiant cantrip' },
    'War Echoes': { dc: 'spell', save: 'WIS', text: 'Failed save: vulnerable to one damage type until the end of your next turn' },
    "History's Whims": { use: R("History's Whims", 10, { note: 'Each turn choose Luck (save bonus vs damage), Resistance (physical damage) or Swiftness (more movement)' }) }
  }));
  ['druid', 'sorcerer', 'wizard'].forEach(c => strix(c, 'prismari', {
    'Creative Skills': { none: true },
    'Kinetic Artistry': { resource: true, acts: [
      { name: 'Boreal Sweep', col: 'bonus', cost: true, dash: true, dc: 'spell', save: 'STR', text: 'Dash; walk on water this turn; nearby creatures STR save or prone' },
      { name: 'Scorching Whirl', col: 'bonus', cost: true, dash: true, dc: 'spell', save: 'DEX', roll: '1d4+' + SPMOD[c], rollNote: 'fire to creatures within 5 ft (DEX save negates)' },
      { name: 'Thunderlight Jaunt', col: 'bonus', cost: true, dash: true, text: 'Dash; move through creatures without provoking opportunity attacks' }] },
    'Favored Medium': { passive: { resist: ['your Favored Medium (cold, fire or lightning)'] }, text: 'Allies within 5 ft gain the same resistance when you cast a spell of that type' },
    'Focused Expression': { roll: '1d6', rollNote: 'extra Favored Medium damage (plus slow, burn or shock effect)' },
    'Impeccable Physicality': { passive: { saveProf: ['dex'] }, text: 'A d20 roll of 9 or lower on a DEX save counts as 10' }
  }));
  ['sorcerer', 'wizard'].forEach(c => strix(c, 'quandrix', {
    'Quandrix Spells': { none: true },
    'Functions of Probability': { acts: [
      { name: 'Diminishing', dc: 'spell', save: 'WIS', roll: '1d6', rollNote: 'subtracted from its next attack roll on a failed save' },
      { name: 'Supplemental', roll: '1d6', rollNote: 'an ally adds it to an attack or save' }] },
    'Velocity Shift': { dc: 'spell', save: 'CHA', text: 'Failed save: teleport it to an unoccupied space within 30 ft' },
    'Null Equation': { dc: 'spell', save: 'CON', text: 'Failed save: disadvantage on STR/DEX saves and half weapon damage until your next turn' },
    'Quantum Tunneling': { passive: { resist: BPS }, roll: '1d10', rollNote: 'force per 5 ft moved through creatures or objects' }
  }));
  ['bard', 'warlock', 'wizard'].forEach(c => strix(c, 'silverquill', {
    'Eloquent Apprentice': { none: true },
    'Silvery Barbs': { text: 'Target rerolls and keeps the lower; an ally can then reroll one d20 within 1 minute' },
    'Inky Shroud': { spells: ['Darkness'], spellNote: 'Once per long rest free; you see through it', roll: '2d10', rollNote: 'psychic to a creature starting its turn in the darkness' },
    'Infusion of Eloquence': { text: 'Spell damage becomes psychic (target frightened) or radiant (target charmed) until your next turn, +{prof} damage' },
    'Word of Power': { acts: [{ name: 'Selfless Invocation', col: 'reaction', text: 'Give a creature resistance to one instance of damage; you take psychic damage equal to what it takes' }], text: 'Or Deadly Despair: Silvery Barbs makes the target vulnerable to your next damage' }
  }));
  ['druid', 'warlock'].forEach(c => strix(c, 'witherbloom', {
    'Witherbloom Spells': { none: true },
    'Essence Tap': { resource: true, acts: [
      { name: 'Overgrowth', col: 'bonus', cost: true, use: R('Essence Tap: Overgrowth', 10, { note: 'Bonus action: spend a Hit Die to heal (roll + spell mod)' }) },
      { name: 'Overgrowth heal', col: 'bonus', onlyWhen: { effect: 'Essence Tap: Overgrowth' }, roll: '1d8+' + SPMOD[c], rollNote: 'healing (spend a Hit Die)', healRoll: true },
      { name: 'Withering Strike', col: 'bonus', cost: true, use: R('Essence Tap: Withering Strike', 10, { note: 'Your damage is necrotic and ignores resistance' }) }] },
    'Witherbloom Brew': { text: 'Brew potions (24 hours): Fortifying (resistance), Quickening (healing and end a condition) or Toxifying (poisoned weapon)' },
    'Witherbloom Adept': { text: 'Once per turn, a necrotic-damage or healing spell deals or restores +{prof} to one target' },
    'Withering Vortex': { text: 'An ally within 30 ft regains HP equal to half the necrotic damage dealt' }
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
