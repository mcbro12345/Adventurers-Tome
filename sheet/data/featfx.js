// What features actually do on the sheet. Keys: feature name, or "subclass:Name" / "class:Name" when names repeat.
// col: action|bonus|reaction · cost {from: feature name, n} · roll (tokens: 1sup, 1ma, 1bi, 1psi; {formula}) · dc: 'spell'|'wis'|'str|dex' + save 'CON'
// use {effect {name, rounds, buff}, cond, condRounds, temp, heal} · acts [{name, col, cost (true = this feature), roll, use, text, dc, save}]
// passive {ac, acArmor, acHeavy, acNoArmor, speed, speedNoHeavy, speedNoArmor, fly, swim, climb, init, initAdv, saveAll, saveProf, skillExp, skillProf,
//          resist, immune, condImmune, advNote, carry, everyHit, abil, min (class level), when 'conc', effect (only while that effect runs)}
// raging {same as passive, only while raging} · onlyRaging · resource (spent by other options, no Use of its own) · spells / spellsAt {level: [...]} · attacks [[name, dice, type, ab, extra]]
// target 'forge' (Blessing of the Forge picker)
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  DND.featFx = {
    // ---- Barbarian ----
    'Rage': { raging: { resist: BPS, advNote: 'STR checks and saves (rage)' } },
    'Reckless Attack': { col: 'action', use: R('Reckless Attack', 1, { atkAdv: 'Reckless Attack', note: 'Attacks against you have advantage until your next turn' }) },
    'Danger Sense': { passive: { advNote: 'DEX saves vs effects you can see (Danger Sense)' } },
    'Feral Instinct': { passive: { initAdv: true } },
    'Relentless Rage': { onlyRaging: true, text: 'DC 10 CON save to drop to 1 HP instead (+5 each use)' },
    'Primal Champion': { passive: { abil: { str: 4, con: 4 }, abilMax: 24 } },
    'Frenzy': { col: 'bonus', onlyRaging: true },
    'Mindless Rage': { raging: { condImmune: ['Charmed', 'Frightened'] } },
    'Intimidating Presence': { col: 'action', dc: 'cha', save: 'WIS' },
    'Retaliation': { col: 'reaction' },
    'Spirit Seeker': { spells: ['Beast Sense', 'Speak with Animals'], spellNote: 'Ritual only', spellCls: 'other' },
    'Spirit Walker': { spells: ['Commune with Nature'], spellNote: 'Ritual only', spellCls: 'other' },
    'Totem Spirit': { dc: false }, 'Aspect of the Beast': { dc: false }, 'Totemic Attunement': { dc: false },
    'Spirit Shield': { col: 'reaction', onlyRaging: true, roll: '{tier(barbarian,6,2,10,3,14,4)}d6', rollNote: 'damage prevented' },
    'Divine Fury': { col: 'action', onlyRaging: true, roll: '1d6+{floor(barbarian/2)}', rollNote: 'radiant or necrotic, first hit each turn' },
    'Zealous Presence': { col: 'bonus' },
    'Form of the Beast': { onlyRaging: false },
    'Battlerager Charge': { col: 'bonus', onlyRaging: true, dash: true },
    'Battlerager Armor': { col: 'bonus', onlyRaging: true, roll: '1d4+str', rollNote: 'piercing spike attack' },
    'Mighty Impel': { col: 'bonus', onlyRaging: true },
    'Elemental Cleaver': { raging: { everyHit: '1d6 elemental (Elemental Cleaver)' } },
    "Giant's Power": { spells: ['Thaumaturgy'], spellCls: 'other' },
    // ---- Bard ----
    'Bardic Inspiration': { roll: '1bi', rollNote: 'the die you give (they roll it)' },
    'Jack of All Trades': { dc: false },
    'Countercharm': { col: 'action' },
    'Cutting Words': { col: 'reaction', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'subtract from the roll' },
    'Peerless Skill': { cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi' },
    'Mantle of Inspiration': { col: 'bonus', cost: { from: 'Bardic Inspiration', n: 1 }, text: 'Temp HP to up to CHA mod creatures: 5 (8 at 5th, 11 at 10th, 14 at 15th)' },
    'Blade Flourish': { col: 'action', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'flourish damage (Defensive adds it to AC)' },
    'swords:Fighting Style': { dc: false },
    'whispers:Psychic Blades': { col: 'action', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '{tier(bard,3,2,5,3,10,5,15,8)}d6', rollNote: 'psychic' },
    'Unsettling Words': { col: 'bonus', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'subtract from its next save' },
    'Tales from Beyond': { col: 'bonus', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1d6', rollNote: 'Spirit Tales table' },
    'Guiding Whispers': { spells: ['Guidance'] },
    'Spiritual Focus': { roll: '1d6', rollNote: 'added to one damage or healing roll' },
    // ---- Cleric ----
    'cleric:Channel Divinity': { resource: true },
    'Turn Undead': { col: 'action', cost: { from: 'Channel Divinity', n: 1 }, dc: 'spell', save: 'WIS' },
    'Blessings of Knowledge': {},
    'Channel Divinity: Knowledge of the Ages': { col: 'action' },
    'Channel Divinity: Read Thoughts': { col: 'action', dc: 'spell', save: 'WIS' },
    'Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'Disciple of Life': { passive: { healBonus: true } },
    'Channel Divinity: Preserve Life': { col: 'action', text: 'Distribute {5*cleric} HP' },
    'Blessed Healer': {},
    'life:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'radiant, once per turn on a weapon hit' },
    'Supreme Healing': {},
    'Bonus Cantrip': { spells: [] },
    'light:Bonus Cantrip': { spells: ['Light'] },
    'Channel Divinity: Radiance of the Dawn': { col: 'action', dc: 'spell', save: 'CON', roll: '2d10+cleric', rollNote: 'radiant (half on a save)' },
    'Corona of Light': { col: 'action' },
    'Channel Divinity: Charm Animals and Plants': { col: 'action', dc: 'spell', save: 'WIS' },
    'Dampen Elements': { col: 'reaction' },
    'nature:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'cold, fire or lightning, once per turn on a weapon hit' },
    'nature:Bonus Proficiency': { passive: {} },
    'Wrath of the Storm': { roll: '2d8', rollNote: 'lightning or thunder (DEX half)', dc: 'spell', save: 'DEX' },
    'Channel Divinity: Destructive Wrath': { col: 'action', text: 'Maximize one lightning or thunder damage roll' },
    'tempest:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'thunder, once per turn on a weapon hit' },
    'Stormborn': { passive: { fly: 'walk' } },
    'Blessing of the Trickster': { col: 'action' },
    'Channel Divinity: Invoke Duplicity': { col: 'action', use: R('Invoke Duplicity', 10, { note: 'Illusory duplicate: cast through it; advantage when you and it are both within 5 ft of a target' }, { conc: false }) },
    'Channel Divinity: Cloak of Shadows': { col: 'action', use: { cond: 'Invisible', condRounds: 1 } },
    'trickery:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'poison, once per turn on a weapon hit' },
    'War Priest': { col: 'bonus' },
    'Channel Divinity: Guided Strike': { col: 'action', text: '+10 to one attack roll (after you see the d20)' },
    "Channel Divinity: War God's Blessing": { col: 'reaction', text: '+10 to an ally’s attack roll within 30 ft' },
    'war:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'weapon’s damage type, once per turn on a weapon hit' },
    'Avatar of Battle': { passive: { resist: ['nonmagical bludgeoning, piercing and slashing'] } },
    'Blessing of the Forge': { target: 'forge' },
    "Channel Divinity: Artisan's Blessing": { col: 'action' },
    'Soul of the Forge': { passive: { resist: ['fire'] } },
    'forge:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'fire, once per turn on a weapon hit' },
    'Saint of Forge and Fire': { passive: { immune: ['fire'] } },
    'Circle of Mortality': { spells: ['Spare the Dying'] },
    'Eyes of the Grave': { col: 'action' },
    'Channel Divinity: Path to the Grave': { col: 'action' },
    "Sentinel at Death's Door": { col: 'reaction' },
    "Channel Divinity: Order's Demand": { col: 'action', dc: 'spell', save: 'WIS' },
    'order:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'psychic, once per turn on a weapon hit' },
    'Emboldening Bond': { col: 'action' },
    'Channel Divinity: Balm of Peace': { col: 'action', roll: '2d6+wis', rollNote: 'healing to each creature you pass' },
    'Eyes of Night': { passive: { sense: 'Darkvision 300 ft (Eyes of Night)' } },
    'Vigilant Blessing': { col: 'action' },
    'Channel Divinity: Twilight Sanctuary': { col: 'action', roll: '1d6+cleric', rollNote: 'temp HP (or end charm/fear)' },
    'twilight:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'radiant, once per turn on a weapon hit' },
    'Steps of Night': { col: 'bonus', use: R('Steps of Night', 10, { fly: 30, note: 'Fly speed in dim light or darkness' }) },
    'Arcane Initiate': { passive: { skillProf: ['Arcana'] } },
    'Channel Divinity: Arcane Abjuration': { col: 'action', dc: 'spell', save: 'WIS' },
    // ---- Druid ----
    'Natural Recovery': { text: 'Recover slots totaling half your druid level (rounded up)' },
    "Nature's Ward": { passive: { immune: ['poison'], condImmune: ['Poisoned'], advNote: "Can't be charmed or frightened by elementals or fey" } },
    'Halo of Spores': { col: 'reaction', dc: 'spell', save: 'CON', roll: '1d{tier(druid,2,4,6,6,10,8,14,10)}', rollNote: 'necrotic' },
    'Symbiotic Entity': { col: 'action', cost: { from: 'Wild Shape', n: 1 }, use: Object.assign(R('Symbiotic Entity', 100, { dmgDice: '1d6 necrotic', note: 'Halo of Spores dice doubled' }), { temp: '4*druid' }) },
    'Fungal Body': { passive: { condImmune: ['Blinded', 'Deafened', 'Frightened', 'Poisoned'] } },
    'Spreading Spores': { col: 'bonus' },
    'Starry Form': { col: 'bonus', cost: { from: 'Wild Shape', n: 1 }, acts: [
      { name: 'Archer', col: 'bonus', cost: { from: 'Wild Shape', n: 1 }, use: R('Starry Form: Archer', 100, { note: 'Bonus action: ranged spell attack 1d8 + WIS radiant' }), text: 'Ranged spell attack, 60 ft, 1d8 + WIS radiant' },
      { name: 'Chalice', col: 'bonus', cost: { from: 'Wild Shape', n: 1 }, use: R('Starry Form: Chalice', 100, { note: 'Healing spells: another creature regains 1d8 + WIS' }) },
      { name: 'Dragon', col: 'bonus', cost: { from: 'Wild Shape', n: 1 }, use: R('Starry Form: Dragon', 100, { note: 'Treat d20 rolls of 9 or lower as 10 on INT/WIS checks and concentration saves' }) }] },
    'Star Map': { spells: ['Guidance', 'Guiding Bolt'], spellNote: 'Guiding Bolt without a slot (prof times per long rest)' },
    'Cosmic Omen': { roll: '1d6' },
    'Full of Stars': { passive: { effect: 'Starry Form: Archer', resist: BPS } },
    'Speech of the Woods': { spells: ['Speak with Animals'] },
    'Spirit Totem': { col: 'bonus' },
    'Summon Wildfire Spirit': { col: 'action', cost: { from: 'Wild Shape', n: 1 }, dc: 'spell', save: 'DEX', roll: '2d6', rollNote: 'fire to each creature within 10 ft of where it appears (DEX save negates)' },
    'Cauterizing Flames': { roll: '2d10+wis', rollNote: 'healing or fire damage (your choice)', healRoll: true },
    'Enhanced Bond': { passive: { advNote: 'While your Wildfire Spirit is summoned: +1d8 to fire damage and healing spells' } },
    'Hidden Paths': { col: 'bonus' },
    // ---- Fighter ----
    'Second Wind': { healRoll: true },
    'Action Surge': { use: { resetTurn: true } },
    'Indomitable': { text: 'Reroll a failed save' },
    'Combat Superiority': { resource: true },
    'Remarkable Athlete': {},
    'Survivor': { text: 'Start of turn at half HP or less: regain 5 + CON' },
    'Unwavering Mark': { col: 'bonus', text: 'Bonus-action attack against a marked creature that hit someone else' },
    'Warding Maneuver': { roll: '1d8', rollNote: 'added to the ally’s AC' },
    'Fighting Spirit': { use: Object.assign(R('Fighting Spirit', 1, { atkAdv: 'Fighting Spirit' }), { temp: '{tier(fighter,3,5,10,10,15,15)}' }) },
    'Psionic Power': { resource: true, acts: [
      { name: 'Protective Field', col: 'reaction', cost: true, roll: '1psi+int', rollNote: 'damage reduced' },
      { name: 'Psionic Strike', col: 'action', cost: true, roll: '1psi+int', rollNote: 'force damage (once per turn on a hit)' },
      { name: 'Telekinetic Movement', col: 'action', cost: true, text: 'Move a Large or smaller object or willing creature up to 30 ft' }] },
    'Guarded Mind': { passive: { resist: ['psychic'] } },
    'Bulwark of Force': { col: 'bonus' },
    "Giant's Might": { use: R("Giant's Might", 10, { dmgDice: '1d{tier(fighter,3,6,10,8,18,10)}', note: 'Large; advantage on STR checks and saves; extra damage once per turn' }) },
    'Runic Shield': { col: 'reaction' },
    // ---- Monk ----
    'Ki': { resource: true, acts: [
      { name: 'Flurry of Blows', col: 'bonus', cost: true, text: 'Two unarmed strikes after the Attack action' },
      { name: 'Patient Defense', col: 'bonus', cost: true, use: { cond: 'Dodging' }, text: 'Take the Dodge action' },
      { name: 'Step of the Wind', col: 'bonus', cost: true, dash: true, text: 'Dash or Disengage; jump distance doubled' }] },
    'Martial Arts': { col: 'bonus', text: 'One unarmed strike as a bonus action after the Attack action' },
    'Deflect Missiles': { col: 'reaction', cost: null, roll: '1d10+dex+monk', rollNote: 'damage reduced; at 0, spend 1 ki to throw it back', dc: false },
    'Slow Fall': { col: 'reaction', text: 'Reduce falling damage by {5*monk}' },
    'Stunning Strike': { col: 'action', cost: { from: 'Ki', n: 1 }, dc: 'wis', save: 'CON', text: 'On a melee hit: stunned until the end of your next turn on a failed save' },
    'Evasion': { passive: { advNote: 'DEX saves for half: no damage on a success (Evasion)' } },
    'Stillness of Mind': { col: 'action' },
    'Purity of Body': { passive: { immune: ['poison'], condImmune: ['Poisoned', 'Diseased'] } },
    'Diamond Soul': { passive: { saveProf: 'all' }, acts: [{ name: 'Reroll a save', cost: { from: 'Ki', n: 1 } }] },
    'Empty Body': { col: 'action', cost: { from: 'Ki', n: 4 }, use: Object.assign(R('Empty Body', 10, { note: 'Invisible; resistance to all damage but force' }), { cond: 'Invisible', condRounds: 10 }) },
    'Open Hand Technique': { dc: 'wis' },
    'Wholeness of Body': { col: 'action', roll: '3*monk', healRoll: true },
    'Quivering Palm': { col: 'action', cost: { from: 'Ki', n: 3 }, dc: 'wis', save: 'CON', roll: '10d10', rollNote: 'necrotic on a successful save' },
    'Shadow Arts': { spells: ['Darkness', 'Darkvision', 'Pass without Trace', 'Silence', 'Minor Illusion'], spellNote: '2 ki each (Minor Illusion is free)' },
    'Shadow Step': { col: 'bonus' },
    'shadow:Cloak of Shadows': { col: 'action', use: { cond: 'Invisible' } },
    'Opportunist': { col: 'reaction' },
    'Drunken Technique': { dc: false },
    'Tipsy Sway': { col: 'reaction', cost: { from: 'Ki', n: 1 } },
    "Drunkard's Luck": { cost: { from: 'Ki', n: 2 } },
    'Sharpen the Blade': { col: 'bonus' },
    'Touch of Death': { use: { temp: 'wis+monk' } },
    'Hour of Reaping': { col: 'action', dc: 'wis', save: 'WIS' },
    'Mastery of Death': { cost: { from: 'Ki', n: 1 } },
    'Touch of the Long Death': { col: 'action', dc: 'wis', save: 'CON', text: '2d10 necrotic per ki spent (1–10)' },
    'Radiant Sun Bolt': { col: 'action', roll: '1ma+dex', rollNote: 'radiant (ranged spell attack, 30 ft)' },
    'Searing Arc Strike': { col: 'bonus', cost: { from: 'Ki', n: 2 } },
    'Searing Sunburst': { col: 'action', dc: 'wis', save: 'CON', roll: '2d6', rollNote: 'radiant (+2d6 per ki, max 3)' },
    'Hand of Healing': { col: 'action', cost: { from: 'Ki', n: 1 }, roll: '1ma+wis', rollNote: 'healing', healRoll: true },
    'Hand of Harm': { col: 'action', cost: { from: 'Ki', n: 1 }, roll: '1ma+wis', rollNote: 'necrotic' },
    'Arms of the Astral Self': { col: 'bonus', cost: { from: 'Ki', n: 1 }, use: R('Arms of the Astral Self', 100, { note: 'Unarmed strikes use WIS, +5 ft reach, force damage' }), dc: 'wis', save: 'DEX' },
    'Visage of the Astral Self': { col: 'bonus', cost: { from: 'Ki', n: 1 } },
    'Breath of the Dragon': { col: 'action', dc: 'wis', save: 'DEX', roll: '2ma', rollNote: 'acid, cold, fire, lightning or poison' },
    'Aspect of the Wyrm': { col: 'bonus' },
    // ---- Paladin ----
    'paladin:Channel Divinity': { resource: true },
    'Divine Health': { passive: { condImmune: ['Diseased'] } },
    'Aura of Courage': { passive: { condImmune: ['Frightened'] } },
    'Improved Divine Smite': { passive: { everyHit: '1d8 radiant (melee)' } },
    'Channel Divinity: Sacred Weapon': { col: 'action', use: R('Sacred Weapon', 10, { atk: 'max(1,cha)', note: 'Weapon is magical and sheds light' }) },
    'Channel Divinity: Turn the Unholy': { col: 'action', dc: 'spell', save: 'WIS' },
    'Aura of Devotion': { passive: { condImmune: ['Charmed'] } },
    'Purity of Spirit': { passive: { advNote: 'Always under protection from evil and good' } },
    "Channel Divinity: Nature's Wrath": { col: 'action', dc: 'spell', save: 'STR or DEX' },
    'Channel Divinity: Turn the Faithless': { col: 'action', dc: 'spell', save: 'WIS' },
    'Aura of Warding': { passive: { resist: ['damage from spells'] } },
    'Channel Divinity: Abjure Enemy': { col: 'action', dc: 'spell', save: 'WIS' },
    'Channel Divinity: Vow of Enmity': { col: 'bonus', use: R('Vow of Enmity', 10, { atkAdv: 'Vow of Enmity (that creature only)' }) },
    'Soul of Vengeance': { col: 'reaction' },
    'Channel Divinity: Conquering Presence': { col: 'action', dc: 'spell', save: 'WIS' },
    'conquest:Channel Divinity: Guided Strike': { col: 'action', text: '+10 to one attack roll' },
    'Scornful Rebuke': { text: 'Attackers that hit you take {cha} psychic' },
    'Channel Divinity: Emissary of Peace': { col: 'bonus', use: R('Emissary of Peace', 100, { note: '+5 to Persuasion checks' }) },
    'Channel Divinity: Rebuke the Violent': { col: 'reaction', dc: 'spell', save: 'WIS' },
    'Aura of the Guardian': { col: 'reaction' },
    'Protective Spirit': { roll: '1d6+{floor(paladin/2)}', healRoll: true },
    'Channel Divinity: Peerless Athlete': { col: 'bonus', use: R('Peerless Athlete', 100, { note: 'Advantage on Athletics and Acrobatics; double carry; +10 ft jumps' }) },
    'Channel Divinity: Inspiring Smite': { col: 'bonus', roll: '2d8+paladin', rollNote: 'temp HP to share out' },
    'Aura of Alacrity': { passive: { speed: 10 } },
    "Channel Divinity: Watcher's Will": { col: 'action' },
    'Channel Divinity: Abjure the Extraplanar': { col: 'action', dc: 'spell', save: 'WIS' },
    'Aura of the Sentinel': { passive: { init: 'prof' } },
    'Vigilant Rebuke': { col: 'reaction', roll: '2d8+cha', rollNote: 'force' },
    'Channel Divinity: Champion Challenge': { col: 'bonus', dc: 'spell', save: 'WIS' },
    'Channel Divinity: Turn the Tide': { col: 'bonus', roll: '1d6+cha', rollNote: 'healing for each creature at half HP or less' },
    'Divine Allegiance': { col: 'reaction' },
    'Unyielding Spirit': { passive: { advNote: 'Saves against being paralyzed or stunned' } },
    // ---- Ranger ----
    'Primeval Awareness': { col: 'action' },
    'Vanish': { col: 'bonus' },
    'Feral Senses': { passive: { sense: 'Sense invisible creatures within 30 ft' } },
    'Foe Slayer': { text: 'Add {wis} to an attack or damage roll against a favored enemy' },
    'Dread Ambusher': { text: 'First turn: +10 ft speed, and one extra attack dealing +1d8' },
    'Umbral Sight': { passive: { sense: 'Invisible to darkvision in darkness' } },
    'Iron Mind': { passive: { saveProf: ['wis'] } },
    "Stalker's Flurry": {},
    'Shadowy Dodge': { col: 'reaction' },
    'Planar Warrior': { col: 'bonus', roll: '{tier(ranger,3,1,11,2)}d8', rollNote: 'force, on your next hit this turn' },
    'Spectral Defense': { col: 'reaction' },
    "Slayer's Prey": { col: 'bonus', roll: '1d6', rollNote: 'first hit each turn on your prey' },
    'Supernatural Defense': { roll: '1d6' },
    "Slayer's Counter": { col: 'reaction' },
    'Dreadful Strikes': { col: 'action', roll: '1d{tier(ranger,3,4,11,6)}', rollNote: 'psychic, once per turn per creature' },
    'Otherworldly Glamour': { text: 'Add {wis} to CHA checks' },
    'Beguiling Twist': { col: 'reaction', passive: { advNote: 'Saves against being charmed or frightened' } },
    'Misty Wanderer': { spells: ['Misty Step'], spellNote: 'Without a slot (WIS mod times per long rest)' },
    'Gathered Swarm': { col: 'action', roll: '1d{tier(ranger,3,6,11,8)}', rollNote: 'piercing, or push 15 ft, or move 5 ft' },
    'Writhing Tide': { use: R('Writhing Tide', 10, { fly: 10, note: 'Hover' }) },
    'Swarming Dispersal': { col: 'reaction' },
    'Draconic Gift': { spells: ['Thaumaturgy'] },
    "Drake's Breath": { dc: 'spell', save: 'DEX', roll: '{tier(ranger,11,8,15,10)}d6' },
    'Bond of Fang and Scale': {},
    'Favored Foe': { roll: '1d{tier(ranger,1,4,6,6,14,8)}', rollNote: 'extra damage (first hit each turn on the marked foe)', use: R('Favored Foe', 10, { note: 'Marked creature: first hit each turn deals extra damage' }) },
    'Deft Explorer: Roving': { passive: { speed: 5, climb: 'walk', swim: 'walk' } },
    'Deft Explorer: Tireless': { use: { temp: '1d8+wis' } },
    "Nature's Veil": { use: { cond: 'Invisible', condRounds: 1 } },
    'Primal Awareness': { spellsAt: { 3: ['Speak with Animals'], 5: ['Beast Sense'], 9: ['Speak with Plants'], 13: ['Locate Creature'], 17: ['Commune with Nature'] }, once: true, spellNote: 'Once per long rest without a slot' },
    // ---- Rogue ----
    'Cunning Action': { resource: true, acts: [{ name: 'Dash', col: 'bonus', dash: true }, { name: 'Disengage', col: 'bonus' }, { name: 'Hide', col: 'bonus' }] },
    'Steady Aim': { col: 'bonus', onlyWhen: { notMoved: true }, use: { speed0: 'Steady Aim', effect: { name: 'Steady Aim', rounds: 1, buff: { atkAdvNext: 'Steady Aim', note: 'Advantage on your next attack roll this turn' } } } },
    'Uncanny Dodge': { col: 'reaction', use: { halveDamage: true } },
    'Reliable Talent': { passive: { advNote: 'Proficient checks: a d20 roll of 9 or lower counts as 10' } },
    'Blindsense': { passive: { sense: 'Blindsense 10 ft' } },
    'Slippery Mind': { passive: { saveProf: ['wis'] } },
    'Elusive': { passive: { advNote: 'No attack has advantage against you' } },
    'Stroke of Luck': {},
    'Fast Hands': { col: 'bonus' },
    'Mage Hand Legerdemain': { spells: ['Mage Hand'] },
    'Versatile Trickster': { col: 'bonus' },
    'Eye for Detail': { col: 'bonus' },
    'Insightful Fighting': { col: 'bonus' },
    'Master of Tactics': { col: 'bonus' },
    'Misdirection': { col: 'reaction' },
    'Skirmisher': { col: 'reaction' },
    'Survivalist': { passive: { skillExp: ['Nature', 'Survival'] } },
    'Superior Mobility': { passive: { speed: 10 } },
    'Ambush Master': { passive: { initAdv: true } },
    'Sudden Strike': { col: 'bonus' },
    'Elegant Maneuver': { col: 'bonus' },
    'Panache': { col: 'action' },
    'soulknife:Psychic Blades': { attacks: [['Psychic Blade', '1d6', 'psychic', 'fin', { notes: 'Finesse, thrown 60 ft; vanishes after the attack' }], ['Psychic Blade (bonus)', '1d4', 'psychic', 'fin', { bonus: true, after: 'Psychic Blade', notes: 'Bonus action after attacking with a psychic blade' }]] },
    'soulknife:Psionic Power': { resource: true, acts: [
      { name: 'Psi-Bolstered Knack', cost: true, roll: '1psi', rollNote: 'added to a failed skill or tool check' },
      { name: 'Psychic Whispers', col: 'action', cost: true, roll: '1psi', rollNote: 'hours of telepathy' }] },
    'Soul Blades': { acts: [{ name: 'Homing Strikes', cost: { from: 'Psionic Power', n: 1 }, roll: '1psi', rollNote: 'added to a missed attack' }, { name: 'Psychic Teleportation', col: 'bonus', cost: { from: 'Psionic Power', n: 1 }, roll: '1psi', rollNote: '× 10 ft teleport' }] },
    'Rend Mind': { dc: 'dex', save: 'WIS' },
    'Ghost Walk': { use: R('Ghost Walk', 100, { fly: 10, note: 'Attacks against you have disadvantage; pass through objects' }) },
    // ---- Sorcerer ----
    'Font of Magic': { acts: [
      { name: 'Slot → points', text: 'Expend a spell slot to gain points equal to its level' },
      { name: 'Points → slot', col: 'bonus', text: 'Create a slot: 1st 2, 2nd 3, 3rd 5, 4th 6, 5th 7 points' }] },
    'Dragon Wings': { col: 'bonus', use: R('Dragon Wings', null, { fly: 'walk', note: 'Wings out (not in armor that lacks room)' }) },
    'Draconic Presence': { col: 'action', cost: { from: 'Font of Magic', n: 5 }, dc: 'spell', save: 'WIS' },
    'Bend Luck': { col: 'reaction', cost: { from: 'Font of Magic', n: 2 }, roll: '1d4' },
    'Favored by the Gods': { roll: '2d4', rollNote: 'added to a failed save or missed attack' },
    'Empowered Healing': { cost: { from: 'Font of Magic', n: 1 } },
    'Otherworldly Wings': { col: 'bonus', use: R('Otherworldly Wings', null, { fly: 30 }) },
    'Unearthly Recovery': { use: { healHalf: true } },
    'Eyes of the Dark': { passive: { sense: 'Darkvision 120 ft (Eyes of the Dark)' }, spellsAt: { 3: ['Darkness'] }, spellNote: '2 sorcery points; you can see through it' },
    'Hound of Ill Omen': { col: 'bonus', cost: { from: 'Font of Magic', n: 3 } },
    'Shadow Walk': { col: 'bonus' },
    'Umbral Form': { col: 'bonus', cost: { from: 'Font of Magic', n: 6 }, use: R('Umbral Form', 10, { note: 'Resistance to all damage but force and radiant; move through objects' }) },
    'Wind Speaker': {},
    'Tempestuous Magic': { col: 'bonus' },
    'Heart of the Storm': { passive: { resist: ['lightning', 'thunder'] } },
    "Storm's Fury": { col: 'reaction', roll: 'sorcerer', rollNote: 'lightning damage', dc: 'spell', save: 'STR' },
    'Wind Soul': { passive: { immune: ['lightning', 'thunder'], fly: 60 } },
    'Telepathic Speech': { col: 'bonus' },
    'Psychic Defenses': { passive: { resist: ['psychic'], advNote: 'Saves against being charmed or frightened' } },
    'Revelation in Flesh': { col: 'bonus', cost: { from: 'Font of Magic', n: 1 } },
    'Warping Implosion': { dc: 'spell', save: 'STR', roll: '3d10', rollNote: 'force' },
    'Bastion of Law': { col: 'action', text: 'Spend 1–5 sorcery points: a ward of that many d8s' },
    'Trance of Order': {},
    // ---- Warlock ----
    'Fey Presence': { dc: 'spell', save: 'WIS' },
    'Misty Escape': { use: { cond: 'Invisible' } },
    'Beguiling Defenses': { passive: { condImmune: ['Charmed'] } },
    'Dark Delirium': { dc: 'spell', save: 'WIS' },
    "Dark One's Blessing": { use: { temp: 'max(1,cha+warlock)' }, text: 'Use when you reduce a hostile creature to 0 HP' },
    "Dark One's Own Luck": { roll: '1d10', rollNote: 'added to a check or save' },
    'Hurl Through Hell': { roll: '10d10', rollNote: 'psychic (non-fiends)' },
    'Awakened Mind': {},
    'Entropic Ward': { use: R('Entropic Ward', 1, { atkAdv: 'Entropic Ward (if it missed)' }) },
    'Thought Shield': { passive: { resist: ['psychic'] } },
    'celestial:Bonus Cantrips': { spells: ['Light', 'Sacred Flame'] },
    'Healing Light': { roll: '1d6', rollNote: 'per die spent (max CHA mod dice)' },
    'Radiant Soul': { passive: { resist: ['radiant'] } },
    'Celestial Resilience': { use: { temp: 'warlock+cha' } },
    "Hexblade's Curse": { use: R("Hexblade's Curse", 10, { note: '+prof damage vs the cursed target; crit on 19–20 against it; heal warlock level + CHA when it dies' }) },
    'Armor of Hexes': { col: 'reaction', roll: '1d6', rollNote: 'on 4+ the attack misses' },
    'Tentacle of the Deeps': { roll: '{tier(warlock,1,1,10,2)}d8', rollNote: 'cold; speed −10 ft' },
    'Gift of the Sea': { passive: { swim: 40 } },
    'Oceanic Soul': { passive: { resist: ['cold'] } },
    'Guardian Coil': { col: 'reaction', roll: '{tier(warlock,6,1,10,2)}d8', rollNote: 'damage reduced' },
    'Grasping Tentacles': { spells: ["Evard's Black Tentacles"], spellNote: 'Once per long rest without a slot' },
    'Among the Dead': { spells: ['Spare the Dying'] },
    'Defy Death': { roll: '1d8+con', healRoll: true },
    'Indestructible Life': { roll: '1d8+warlock', healRoll: true },
    'Form of Dread': { use: Object.assign(R('Form of Dread', 10, { note: 'Immune to frightened; once per turn a hit can frighten (WIS save)' }), { temp: '1d10+warlock' }), dc: 'spell', save: 'WIS' },
    'Necrotic Husk': { passive: { resist: ['necrotic'] } },
    // ---- Wizard ----
    'Arcane Recovery': { text: 'Recover slots totaling half your wizard level (rounded up)' },
    'Portent': { roll: '1d20', rollNote: 'a Portent die' },
    'Benign Transposition': {},
    'Hypnotic Gaze': { col: 'action', dc: 'spell', save: 'WIS' },
    'Instinctive Charm': { col: 'reaction', dc: 'spell', save: 'WIS' },
    'Improved Minor Illusion': { spells: ['Minor Illusion'] },
    'Illusory Self': {},
    'Illusory Reality': { col: 'bonus' },
    'Grim Harvest': {},
    'Inured to Undeath': { passive: { resist: ['necrotic'] } },
    'Command Undead': { col: 'action', dc: 'spell', save: 'CHA' },
    'Arcane Deflection': { col: 'reaction', text: '+2 AC against one attack or +4 to a save; then only cantrips until your next turn' },
    'Durable Magic': { passive: { when: 'conc', ac: 2, saveAll: 2 } },
    'Power Surge': { roll: '{floor(wizard/2)}', rollNote: 'force damage added' },
    'Bladesong': { use: R('Bladesong', 10, { ac: 'max(1,int)', speed: 10, note: 'Advantage on Acrobatics; +INT to concentration saves' }) },
    'Song of Defense': { col: 'reaction', text: 'Expend a slot: reduce damage by 5 × slot level' },
    'Song of Victory': { passive: { effect: 'Bladesong', meleeDmg: 'int' } },
    'Wizardly Quill': { col: 'bonus' },
    'Spell Resistance': { passive: { resist: ['damage from spells'], advNote: 'Saves against spells' } },
    // ---- Artificer ----
    'Magical Tinkering': { col: 'action' },
    'Soul of Artifice': { passive: { saveAll: 'attuned' } },
    'Experimental Elixir': { roll: '1d6', rollNote: '1 healing · 2 swiftness · 3 resilience · 4 boldness · 5 flight · 6 transformation' },
    'Chemical Mastery': { passive: { resist: ['acid', 'poison'], immune: ['poison'], condImmune: ['Poisoned'] } },
    'Arcane Firearm': { roll: '1d8', rollNote: 'added to one artificer spell damage roll' },
    'Arcane Jolt': { roll: '{tier(artificer,9,2,15,4)}d6', rollNote: 'force damage, or healing' },
    // ---- Feats ----
    'feat:Lucky': { max: '3', reset: 'long', roll: '1d20', rollNote: 'luck die' },
    'feat:Sentinel': { col: 'reaction' },
    'feat:Polearm Master': { col: 'bonus', attacks: [] },
    'feat:Great Weapon Master': { acts: [{ name: 'Power attack (−5/+10)', use: R('Power attack', null, { atk: -5, dmg: 10, note: 'Heavy melee weapons only — end it in Active effects' }) }, { name: 'Bonus attack', col: 'bonus', text: 'After a crit or dropping a creature to 0 HP' }] },
    'feat:Sharpshooter': { acts: [{ name: 'Power shot (−5/+10)', use: R('Power shot', null, { atk: -5, dmg: 10, note: 'Ranged weapons only — end it in Active effects' }) }] },
    'feat:Crossbow Expert': { col: 'bonus' },
    'feat:Shield Master': { col: 'bonus' },
    'feat:War Caster': { col: 'reaction' },
    'feat:Mage Slayer': { col: 'reaction' },
    'feat:Defensive Duelist': { col: 'reaction', text: '+{prof} AC against one melee attack' },
    'feat:Inspiring Leader': { use: { temp: 'level+cha' } },
    'feat:Charger': { col: 'bonus' },
    'feat:Dual Wielder': { passive: { advNote: '+1 AC while wielding a separate melee weapon in each hand' } },
    'feat:Mobile': {},
    'feat:Healer': { col: 'action', roll: '1d6+4+{level}', rollNote: 'healing (once per creature per rest)' },
    'feat:Tough': {},
    'feat:Savage Attacker': {},
    'feat:Durable': {},
    'feat:Resilient': {}
  };
  // ---- Class options (picks) ----
  const op = t => (DND.options[t] || { list: [] }).list;
  const setFx = (t, name, fx) => { const e = op(t).find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  // Battle Master maneuvers spend superiority dice and roll one.
  const MCOL = { Brace: 'reaction', Parry: 'reaction', Riposte: 'reaction', 'Feinting Attack': 'bonus', 'Grappling Strike': 'bonus', 'Quick Toss': 'bonus', Rally: 'bonus', 'Bait and Switch': 'action' };
  const MSAVE = { 'Disarming Attack': 'STR', 'Goading Attack': 'WIS', 'Menacing Attack': 'WIS', 'Pushing Attack': 'STR', 'Trip Attack': 'STR' };
  const MROLL = { Parry: '1sup+dex', Rally: '1sup+cha', 'Precision Attack': '1sup', 'Evasive Footwork': '1sup', 'Ambush': '1sup', 'Commanding Presence': '1sup', 'Tactical Assessment': '1sup' };
  op('maneuver').forEach(e => setFx('maneuver', e[0], Object.assign({ cost: { from: 'Combat Superiority', n: 1 }, roll: MROLL[e[0]] || '1sup', rollNote: MROLL[e[0]] ? '' : 'extra damage', dc: MSAVE[e[0]] ? 'str|dex' : false },
    ['Ambush', 'Commanding Presence', 'Tactical Assessment', 'Evasive Footwork'].includes(e[0]) ? {} : { col: MCOL[e[0]] || 'action' }, MSAVE[e[0]] ? { save: MSAVE[e[0]] } : {})));
  op('metamagic').forEach(e => { const m = /^(\d+) SP/.exec(e[1]); setFx('metamagic', e[0], { cost: { from: 'Font of Magic', n: m ? Number(m[1]) : 1 }, dc: false }); });
  setFx('metamagic', 'Twinned Spell', { cost: null, text: 'Costs sorcery points equal to the spell level (1 for a cantrip)' });
  op('arcaneShot').forEach(e => setFx('arcaneShot', e[0], { col: 'action', cost: { from: 'Arcane Shot', n: 1 }, dc: /save/i.test(e[1]) ? 'int' : false }));
  setFx('fightingStyle', 'Defense', { passive: { acArmor: 1 } });
  setFx('fightingStyle', 'Interception', { col: 'reaction', roll: '1d10+prof', rollNote: 'damage reduced' });
  setFx('fightingStyle', 'Protection', { col: 'reaction' });
  setFx('fightingStyle', 'Blind Fighting', { passive: { sense: 'Blindsight 10 ft' } });
  setFx('invocation', "Devil's Sight", {});
  // ---- New choice lists ----
  const RAGE_NOTE = ' (while raging)';
  DND.options.totemSpirit = { label: 'Totem Spirit', list: [
    ['Bear', 'While raging, resistance to all damage except psychic.', 'Totem Warrior', { raging: { resist: ['all damage except psychic'] } }],
    ['Eagle', 'While raging (not in heavy armor), opportunity attacks against you have disadvantage and you can Dash as a bonus action.', 'Totem Warrior', { acts: [{ name: 'Dash (Eagle)', col: 'bonus', dash: true, onlyRaging: true }], raging: { advNote: 'Opportunity attacks against you have disadvantage' } }],
    ['Elk', 'While raging (not in heavy armor), your walking speed increases by 15 ft.', 'Totem Warrior (SCAG)', { raging: { speedNoHeavy: 15 } }],
    ['Tiger', 'While raging, add 10 ft to long jumps and 3 ft to high jumps.', 'Totem Warrior (SCAG)', { raging: { advNote: 'Long jump +10 ft, high jump +3 ft' } }],
    ['Wolf', 'While raging, friends have advantage on melee attacks against enemies within 5 ft of you.', 'Totem Warrior', { raging: { advNote: 'Allies have advantage on melee attacks vs enemies next to you' } }]] };
  DND.options.totemAspect = { label: 'Aspect of the Beast', list: [
    ['Bear', 'Carrying capacity doubled; advantage on STR checks to push, pull, lift or break.', 'Totem Warrior', { passive: { carry: 2 } }],
    ['Eagle', 'See up to 1 mile clearly; dim light doesn’t impose disadvantage on Perception.', 'Totem Warrior', { passive: { sense: 'Eagle sight 1 mile' } }],
    ['Elk', 'You and up to 10 companions travel at a fast pace without penalty.', 'Totem Warrior (SCAG)'],
    ['Tiger', 'Proficiency in two of Athletics, Acrobatics, Stealth and Survival.', 'Totem Warrior (SCAG)'],
    ['Wolf', 'Track at a fast pace; move stealthily at a normal pace.', 'Totem Warrior']] };
  DND.options.totemAttune = { label: 'Totemic Attunement', list: [
    ['Bear', 'While raging, hostile creatures within 5 ft have disadvantage on attacks against others.', 'Totem Warrior'],
    ['Eagle', 'While raging, you have a flying speed equal to your walking speed (briefly).', 'Totem Warrior', { raging: { fly: 'walk' } }],
    ['Elk', 'While raging, bonus action: move through a Large or smaller creature’s space; STR save or prone and 1d12 + STR bludgeoning.', 'Totem Warrior (SCAG)', { acts: [{ name: 'Elk trample', col: 'bonus', onlyRaging: true, roll: '1d12+str', rollNote: 'bludgeoning', dc: 'str', save: 'STR' }] }],
    ['Tiger', 'While raging, after moving 20 ft in a straight line, bonus-action melee attack.', 'Totem Warrior (SCAG)', { acts: [{ name: 'Tiger pounce', col: 'bonus', onlyRaging: true }] }],
    ['Wolf', 'While raging, when you hit with a melee attack, bonus action to knock a Large or smaller creature prone.', 'Totem Warrior', { acts: [{ name: 'Wolf knockdown', col: 'bonus', onlyRaging: true }] }]] };
  DND.options.stormAura = { label: 'Storm Aura', list: [
    ['Desert', 'Aura: others take 2 fire damage (more at higher levels). Storm Soul: fire resistance.', 'Storm Herald', { acts: [{ name: 'Desert aura', col: 'bonus', onlyRaging: true, roll: '{tier(barbarian,3,2,5,3,10,4,15,5,20,6)}', rollNote: 'fire to each other creature in the aura' }], passive: { min: 6, resist: ['fire'] } }],
    ['Sea', 'Aura: one creature takes 1d6 lightning (DEX half). Storm Soul: lightning resistance, swim 30 ft, breathe water.', 'Storm Herald', { acts: [{ name: 'Sea aura', col: 'bonus', onlyRaging: true, roll: '{tier(barbarian,3,1,10,2,15,3,20,4)}d6', rollNote: 'lightning', dc: 'con', save: 'DEX' }], passive: { min: 6, resist: ['lightning'], swim: 30 } }],
    ['Tundra', 'Aura: creatures of your choice gain 2 temp HP (more at higher levels). Storm Soul: cold resistance.', 'Storm Herald', { acts: [{ name: 'Tundra aura', col: 'bonus', onlyRaging: true, roll: '{tier(barbarian,3,2,5,3,10,4,15,5,20,6)}', rollNote: 'temp HP to each chosen creature' }], passive: { min: 6, resist: ['cold'] } }]] };
  const LAND = { Arctic: [['Hold Person', 'Spike Growth'], ['Sleet Storm', 'Slow'], ['Freedom of Movement', 'Ice Storm'], ['Commune with Nature', 'Cone of Cold']],
    Coast: [['Mirror Image', 'Misty Step'], ['Water Breathing', 'Water Walk'], ['Control Water', 'Freedom of Movement'], ['Conjure Elemental', 'Scrying']],
    Desert: [['Blur', 'Silence'], ['Create Food and Water', 'Protection from Energy'], ['Blight', 'Hallucinatory Terrain'], ['Insect Plague', 'Wall of Stone']],
    Forest: [['Barkskin', 'Spider Climb'], ['Call Lightning', 'Plant Growth'], ['Divination', 'Freedom of Movement'], ['Commune with Nature', 'Tree Stride']],
    Grassland: [['Invisibility', 'Pass without Trace'], ['Daylight', 'Haste'], ['Divination', 'Freedom of Movement'], ['Dream', 'Insect Plague']],
    Mountain: [['Spider Climb', 'Spike Growth'], ['Lightning Bolt', 'Meld into Stone'], ['Stone Shape', 'Stoneskin'], ['Passwall', 'Wall of Stone']],
    Swamp: [['Darkness', "Melf's Acid Arrow"], ['Water Walk', 'Stinking Cloud'], ['Freedom of Movement', 'Locate Creature'], ['Insect Plague', 'Scrying']],
    Underdark: [['Spider Climb', 'Web'], ['Gaseous Form', 'Stinking Cloud'], ['Greater Invisibility', 'Stone Shape'], ['Cloudkill', 'Insect Plague']] };
  DND.options.landCircle = { label: 'Circle Spells land', list: Object.entries(LAND).map(([k, v]) => [k, 'Always prepared: ' + v.map(x => x.join(', ')).join('; ') + '.', 'Circle of the Land', { spellsAt: { 3: v[0], 5: v[1], 7: v[2], 9: v[3] } }]) };
  // PHB ranger: Favored Enemy (1st, 6th, 14th) and Natural Explorer terrains (1st, 6th, 10th)
  const FE = ['Aberrations', 'Beasts', 'Celestials', 'Constructs', 'Dragons', 'Elementals', 'Fey', 'Fiends', 'Giants', 'Monstrosities', 'Oozes', 'Plants', 'Undead', 'Humanoids (two races)'];
  DND.options.favoredEnemy = { label: 'Favored Enemy', list: FE.map(t => [t, `Advantage on Survival checks to track ${t.replace(' (two races)', ' of the two races you pick')} and on INT checks to recall facts about them.`, 'Ranger', { passive: { advNote: `Survival to track, and INT checks to recall info, vs ${t}` } }]) };
  const FT = ['Arctic', 'Coast', 'Desert', 'Forest', 'Grassland', 'Mountain', 'Swamp', 'Underdark'];
  DND.options.favoredTerrain = { label: 'Favored Terrain', list: FT.map(t => [t, `Double proficiency on INT/WIS checks about it (if proficient); your group isn't slowed by difficult terrain or lost except by magic; stay alert while doing other things; stealthy at normal pace when alone; forage double food; learn more when tracking.`, 'Ranger', {}]) };
  DND.options.hunterPrey = { label: "Hunter's Prey", list: [
    ['Colossus Slayer', 'Once per turn, +1d8 damage to a creature below its max HP.', 'Hunter', { col: 'action', roll: '1d8', rollNote: 'extra damage (target below max HP)' }],
    ['Giant Killer', 'Reaction: attack a Large or larger creature within 5 ft that attacks you.', 'Hunter', { col: 'reaction' }],
    ['Horde Breaker', 'Once per turn, make another attack against a different creature within 5 ft of the first target.', 'Hunter', { col: 'action' }]] };
  DND.options.hunterDefense = { label: 'Defensive Tactics', list: [
    ['Escape the Horde', 'Opportunity attacks against you have disadvantage.', 'Hunter', { passive: { advNote: 'Opportunity attacks against you have disadvantage' } }],
    ['Multiattack Defense', 'After a creature hits you, +4 AC against its later attacks this turn.', 'Hunter', { passive: { advNote: '+4 AC vs a creature’s later attacks after it hits you' } }],
    ['Steel Will', 'Advantage on saves against being frightened.', 'Hunter', { passive: { advNote: 'Saves against being frightened' } }]] };
  DND.options.hunterMultiattack = { label: 'Multiattack', list: [
    ['Volley', 'Action: ranged attack against any number of creatures within 10 ft of a point.', 'Hunter', { col: 'action' }],
    ['Whirlwind Attack', 'Action: melee attack against any number of creatures within 5 ft of you.', 'Hunter', { col: 'action' }]] };
  DND.options.hunterSuperior = { label: "Superior Hunter's Defense", list: [
    ['Evasion', 'No damage on a successful DEX save for half; half on a failure.', 'Hunter', { passive: { advNote: 'DEX saves for half: no damage on a success (Evasion)' } }],
    ['Stand Against the Tide', 'Reaction: when a creature misses you in melee, force it to repeat the attack against another creature.', 'Hunter', { col: 'reaction' }],
    ['Uncanny Dodge', 'Reaction: halve the damage of an attack from an attacker you can see.', 'Hunter', { col: 'reaction' }]] };
  const DRAG = [['Black', 'acid'], ['Blue', 'lightning'], ['Brass', 'fire'], ['Bronze', 'lightning'], ['Copper', 'acid'], ['Gold', 'fire'], ['Green', 'poison'], ['Red', 'fire'], ['Silver', 'cold'], ['White', 'cold']];
  DND.options.draconicAncestry = { label: 'Dragon Ancestor', list: DRAG.map(([d, t]) => [d, `${t[0].toUpperCase() + t.slice(1)} damage.`, 'Draconic Bloodline', { acts: [{ name: `${t} resistance (1 hour)`, min: 6, cost: { from: 'Font of Magic', n: 1 }, use: R('Elemental Affinity', 600, { note: `Resistance to ${t} damage` }) }], passive: { min: 6, advNote: `Add CHA to one damage roll of ${t} spells` } }]) };
  DND.options.armorModel = { label: 'Armor Model', list: [
    ['Guardian', 'Thunder Gauntlets (1d8 thunder, INT; target has disadvantage attacking others) and Defensive Field (bonus action: temp HP = artificer level).', 'Armorer', { attacks: [['Thunder Gauntlets', '1d8', 'thunder', 'int', { notes: 'Hit: disadvantage attacking anyone but you until your next turn' }]], acts: [{ name: 'Defensive Field', col: 'bonus', use: { temp: 'artificer' } }] }],
    ['Infiltrator', 'Lightning Launcher (1d6 lightning, 90/300 ft, +1d6 once per turn), +5 ft speed, advantage on Stealth.', 'Armorer', { attacks: [['Lightning Launcher', '1d6', 'lightning', 'int', { kind: 'ranged', notes: '90/300 ft; once per turn +1d6 lightning' }]], passive: { speed: 5, advNote: 'Stealth checks (Infiltrator)' } }]] };
  Object.assign(DND.options.totemSpirit, {}); // keep shape
  // Subclass choices these features need
  const C = DND.classes, addCh = (cls, sub, chs) => { const s = C[cls] && C[cls].subclasses[sub]; if (s) s.choices = (s.choices || []).concat(chs); };
  addCh('barbarian', 'totem', [{ level: 3, type: 'totemSpirit', n: 1 }, { level: 6, type: 'totemAspect', n: 1 }, { level: 14, type: 'totemAttune', n: 1 }]);
  addCh('barbarian', 'storm', [{ level: 3, type: 'stormAura', n: 1 }]);
  addCh('druid', 'land', [{ level: 2, type: 'cantrip', list: 'D', cls: 'druid', n: 1, label: 'Bonus druid cantrip' }, { level: 3, type: 'landCircle', n: 1 }]);
  addCh('ranger', 'hunter', [{ level: 3, type: 'hunterPrey', n: 1 }, { level: 7, type: 'hunterDefense', n: 1 }, { level: 11, type: 'hunterMultiattack', n: 1 }, { level: 15, type: 'hunterSuperior', n: 1 }]);
  addCh('sorcerer', 'draconic', [{ level: 1, type: 'draconicAncestry', n: 1 }]);
  addCh('artificer', 'armorer', [{ level: 3, type: 'armorModel', n: 1 }]);
  addCh('fighter', 'champion', [{ level: 10, type: 'fightingStyle', n: 1 }]);
  addCh('fighter', 'battlemaster', [{ level: 3, type: 'tool', n: 1, from: 'artisan', label: "Student of War: artisan's tool" }]);
  addCh('fighter', 'arcanearcher', [{ level: 3, type: 'skill', n: 1, from: ['Arcana', 'Nature'], label: 'Arcane Archer Lore skill' }]);
  addCh('fighter', 'cavalier', [{ level: 3, type: 'skill', n: 1, from: ['Animal Handling', 'History', 'Insight', 'Performance', 'Persuasion'], label: 'Bonus Proficiency' }]);
  addCh('fighter', 'samurai', [{ level: 3, type: 'skill', n: 1, from: ['History', 'Insight', 'Performance', 'Persuasion'], label: 'Bonus Proficiency' }]);
  addCh('cleric', 'knowledge', [{ level: 1, type: 'language', n: 2, label: 'Blessings of Knowledge languages' }, { level: 1, type: 'expertise', n: 2, from: ['Arcana', 'History', 'Nature', 'Religion'], label: 'Blessings of Knowledge skills (expertise)' }]);
  addCh('cleric', 'nature', [{ level: 1, type: 'cantrip', list: 'D', cls: 'cleric', n: 1, label: 'Acolyte of Nature cantrip' }, { level: 1, type: 'skill', n: 1, from: ['Animal Handling', 'Nature', 'Survival'], label: 'Acolyte of Nature skill' }]);
  addCh('cleric', 'arcana', [{ level: 1, type: 'cantrip', list: 'W', cls: 'cleric', n: 2, label: 'Arcane Initiate cantrips' }]);
  addCh('cleric', 'order', [{ level: 1, type: 'skill', n: 1, from: ['Intimidation', 'Persuasion'], label: 'Bonus Proficiency' }]);
  addCh('cleric', 'peace', [{ level: 1, type: 'skill', n: 1, from: ['Insight', 'Performance', 'Persuasion'], label: 'Implement of Peace' }]);
  addCh('bard', 'lore', [{ level: 3, type: 'skill', n: 3, from: 'any', label: 'Bonus Proficiencies' }]);
  addCh('ranger', 'feywanderer', [{ level: 3, type: 'skill', n: 1, from: ['Deception', 'Performance', 'Persuasion'], label: 'Otherworldly Glamour' }]);
  addCh('rogue', 'mastermind', [{ level: 3, type: 'language', n: 2, label: 'Master of Intrigue languages' }]);
  addCh('monk', 'kensei', []);
  // Heavy-armor and other fixed proficiencies some subclasses grant at 1st/3rd level
  const prof = (cls, sub, p) => { const s = C[cls] && C[cls].subclasses[sub]; if (s && !s.profs) s.profs = p; };
  ['life', 'nature', 'tempest', 'war', 'forge', 'order', 'twilight'].forEach(k => prof('cleric', k, { armorCats: ['heavy'], weaponCats: ['tempest', 'war', 'twilight'].includes(k) ? ['martial'] : [] }));
  prof('bard', 'valor', { armorCats: ['medium', 'shield'], weaponCats: ['martial'] });
  prof('bard', 'swords', { armorCats: ['medium'] });
  prof('warlock', 'hexblade', { armorCats: ['medium', 'shield'], weaponCats: ['martial'] });
  prof('artificer', 'armorer', { armorCats: ['heavy'] });
  prof('artificer', 'battlesmith', { weaponCats: ['martial'] });
  // Skills some subclasses always give
  Object.assign(DND.featFx, {
    'mercy:Implements of Mercy': { passive: { skillProf: ['Insight', 'Medicine'] } },
    'Implements of Mercy': { passive: { skillProf: ['Insight', 'Medicine'] } },
    'drunkenmaster:Bonus Proficiencies': { passive: { skillProf: ['Performance'] } },
    'Training in War and Song': { passive: { skillProf: ['Performance'] } },
    'Royal Envoy': { passive: { skillExp: ['Persuasion'] } }
  });
})();
