// Feature automation: Barbarian and Bard (2014 rules) and their non-UA subclasses. See tools/FX_SPEC.md.
(function () {
  const BI = { from: 'Bardic Inspiration', n: 1 };
  const E = (name, rounds, buff, more) => ({ effect: Object.assign({ name, rounds, buff }, more || {}) });
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  const addActs = (type, name, acts) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) { e[3] = Object.assign({}, e[3] || {}); e[3].acts = (e[3].acts || []).concat(acts); } };
  const addPassive = (type, name, p) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) { e[3] = Object.assign({}, e[3] || {}); e[3].passive = [].concat(e[3].passive || []).concat(p); } };

  Object.assign(DND.featFx, {
    // ======================= BARBARIAN =======================
    'barbarian:Unarmored Defense': { none: true, note: 'Built in: AC 10 + DEX + CON without armor (class unarmored formula, shield allowed).' },
    'barbarian:Extra Attack': { none: true, note: 'Built in: class extraAttack (2 attacks from 5th level).' },
    'barbarian:Fast Movement': { none: true, note: 'Built in: +10 ft walking speed while not in heavy armor (speed calculation).' },
    'barbarian:Brutal Critical': { none: true, note: 'Built in: melee critical hits add {tier(barbarian,9,1,13,2,17,3)} extra weapon damage die (attack roller).' },
    'barbarian:Relentless Rage': {
      onlyRaging: true, trigger: 'zero', triggerLabel: 'Roll the save', max: '20', reset: 'short',
      roll: '1d20+{con+prof}', rollNote: 'CON save (includes proficiency)',
      text: 'DC 10 for the first use after a rest, +5 for every earlier use since then (count = uses spent on this card, including this one: DC = 5 + 5 × uses). On a success press "Saved: 1 HP".',
      triggerText: 'You dropped to 0 HP while raging: make a CON save (DC 10, +5 per earlier use since your last rest) to drop to 1 HP instead.',
      acts: [{ name: 'Saved: 1 HP', onlyWhen: { zeroHp: true }, use: { setHp: 1, removeCond: ['Unconscious'] }, text: 'Relentless Rage: you drop to 1 HP instead.' }]
    },
    'barbarian:Persistent Rage': { none: true, note: 'Rage only ends early if you fall unconscious or choose to end it (the sheet never ends rage early on its own).' },
    'barbarian:Indomitable Might': { passive: { advNote: 'STR checks: if the total is lower than your STR score, use the score (Indomitable Might)' } },

    // Berserker
    'barbarian:berserker:Frenzy': {
      use: E('Frenzy', 10, { note: 'Bonus action: one melee weapon attack each turn. 1 level of exhaustion when the rage ends.' }),
      text: 'Choose to frenzy when you enter your rage.',
      acts: [
        { name: 'Frenzy attack', col: 'bonus', onlyWhen: { effect: 'Frenzy' }, text: 'One melee weapon attack' },
        { name: 'Rage ended: +1 exhaustion', onlyWhen: { effect: 'Frenzy' }, use: { exhaustion: 1, endEffect: 'Frenzy' } }]
    },

    // Ancestral Guardian
    'barbarian:ancestral:Ancestral Protectors': { raging: { advNote: 'First creature you hit each turn (until your next turn): disadvantage on attacks vs others, and others resist its damage' } },
    'barbarian:ancestral:Spirit Shield': { col: 'reaction', onlyRaging: true, roll: '{tier(barbarian,6,2,10,3,14,4)}d6', rollNote: 'damage prevented for a creature within 30 ft (Vengeful Ancestors: dealt back as force)' },
    'barbarian:ancestral:Consult the Spirits': { spells: ['Augury', 'Clairvoyance'], spellNote: 'Cast one without a slot or material components, once per short rest (WIS); Clairvoyance uses an ancestral spirit as the sensor', spellCls: 'other', text: 'Cast Augury or Clairvoyance without a slot or components.' },
    'barbarian:ancestral:Vengeful Ancestors': { raging: { advNote: 'Spirit Shield: the attacker takes force damage equal to the damage prevented' } },

    // Storm Herald (per-environment effects live on the Storm Aura choice)
    'barbarian:storm:Storm Aura': { dc: 'con', save: 'DEX', text: 'Your Desert/Sea/Tundra aura button is on your Storm Aura choice (bonus action while raging).' },
    'barbarian:storm:Storm Soul': { dc: false, text: 'Resistance and environment benefits come from your Storm Aura choice.' },
    'barbarian:storm:Shielding Storm': { raging: { advNote: 'Creatures of your choice in your Storm Aura share your Storm Soul resistance' } },
    'barbarian:storm:Raging Storm': { dc: 'con', text: 'Your environment’s Raging Storm button is on your Storm Aura choice.' },

    // Zealot
    'barbarian:zealot:Divine Fury': { col: 'action', onlyRaging: true, roll: '1d6+{floor(barbarian/2)}', rollNote: 'radiant or necrotic, first weapon hit each turn' },
    'barbarian:zealot:Warrior of the Gods': { none: true },
    'barbarian:zealot:Fanatical Focus': { onlyRaging: true, roll: '1d20', rollNote: 'reroll of the failed save (add your save bonus; you must use the new roll)', text: 'Once per rage.' },
    'barbarian:zealot:Zealous Presence': { col: 'bonus', text: 'Up to 10 creatures within 60 ft gain advantage on attacks and saves until the start of your next turn.' },
    'barbarian:zealot:Rage Beyond Death': {
      onlyRaging: true, trigger: 'zero', triggerLabel: 'Keep fighting', use: { removeCond: ['Unconscious'] },
      text: 'You stay conscious at 0 HP while raging (still make death saves). If the rage ends and you are still at 0 HP, you die.'
    },

    // Beast
    'barbarian:beast:Form of the Beast': {
      attacks: [
        ['Bite (Form of the Beast)', '1d8', 'piercing', 'str', { kind: 'melee', notes: 'Only while raging. Once per turn on a hit while below half HP, regain HP equal to your proficiency bonus.' }],
        ['Claws (Form of the Beast)', '1d6', 'slashing', 'str', { kind: 'melee', notes: 'Only while raging. Each claw: once per turn when you attack with a claw using the Attack action, make one extra claw attack.' }],
        ['Tail (Form of the Beast)', '1d8', 'piercing', 'str', { kind: 'melee', notes: 'Only while raging. Reach 10 ft. Reaction: +1d8 AC against an attack you can see.' }]],
      acts: [
        { name: 'Bite: regain HP', onlyWhen: { cond: 'Raging', hpBelowHalf: true }, use: { heal: '{prof}' }, text: 'Once per turn, when your bite hits while you have less than half your HP.' },
        { name: 'Tail: deflect', col: 'reaction', onlyRaging: true, roll: '1d8', rollNote: 'added to your AC against the triggering attack' }]
    },
    'barbarian:beast:Bestial Soul': {
      text: 'Natural weapons count as magical. Choose one benefit (change it after a short or long rest).',
      acts: [
        { name: 'Swim', use: E('Bestial Soul', null, { note: 'Swimming speed equal to walking speed; breathe underwater' }) },
        { name: 'Climb', use: E('Bestial Soul', null, { note: 'Climbing speed equal to walking speed; climb difficult surfaces and ceilings without a check' }) },
        { name: 'Jump', use: E('Bestial Soul', null, { note: 'Once per turn when you jump, make a STR (Athletics) check and extend the jump by its total in feet' }) }]
    },
    'barbarian:beast:Infectious Fury': { onlyRaging: true, dc: 'con', save: 'WIS', roll: '2d12', rollNote: 'psychic (or instead it uses its reaction to attack a creature you choose)', text: 'When you hit with a natural weapon while raging.' },
    'barbarian:beast:Call the Hunt': { col: 'bonus', onlyRaging: true, use: { temp: '{5*prof}' }, text: 'Up to {prof} creatures within 30 ft: once per turn each adds 1d6 to a damage roll until the rage ends. You gain 5 temp HP per creature (auto-applied for the maximum {prof}; lower it if fewer accept).' },

    // Wild Magic
    'barbarian:wildmagic:Magic Awareness': { col: 'action', text: 'Until the end of your next turn you know the location of spells and magic items within 60 ft (not behind total cover) and their schools.' },
    'barbarian:wildmagic:Wild Surge': {
      col: 'bonus', onlyRaging: true, roll: '1d8', rollNote: 'Wild Magic table', dc: 'con',
      text: '1 Shadowy tendrils (CON save, 1d12 necrotic; you gain 1d12 temp HP) · 2 Teleport 30 ft (again as bonus action each turn) · 3 Exploding spirit (DEX save, 1d6 force; again as bonus action) · 4 Weapon: light, thrown 20/60, force damage, returns · 5 Attackers that hit you take 1d6 force · 6 Protective lights: +1 AC for you and allies within 10 ft · 7 Flowers and vines: 15 ft difficult terrain for enemies · 8 Bolt of light (CON save, 1d6 radiant + blinded; again as bonus action). Effects last until the rage ends.',
      acts: [
        { name: '1 Tendrils', onlyRaging: true, roll: '1d12', rollNote: 'necrotic to each creature you choose within 30 ft (CON save negates)', dc: 'con', save: 'CON', use: { temp: '1d12' } },
        { name: '2 Teleport', col: 'bonus', onlyRaging: true, text: 'Teleport up to 30 ft to an unoccupied space you can see.' },
        { name: '3 Spirit', col: 'bonus', onlyRaging: true, roll: '1d6', rollNote: 'force to each creature within 5 ft of the spirit (DEX save negates)', dc: 'con', save: 'DEX' },
        { name: '5 Retribution', onlyRaging: true, roll: '1d6', rollNote: 'force to the creature that hit you' },
        { name: '6 Protective lights', onlyRaging: true, use: E('Wild Surge: Lights', 10, { ac: 1, note: 'Allies within 10 ft also get +1 AC' }) },
        { name: '8 Bolt of light', col: 'bonus', onlyRaging: true, roll: '1d6', rollNote: 'radiant; blinded until the start of your next turn (CON save negates)', dc: 'con', save: 'CON' }]
    },
    'barbarian:wildmagic:Bolstering Magic': {
      resource: true,
      acts: [
        { name: 'Bolster (+1d3 rolls)', col: 'action', cost: true, use: E('Bolstering Magic', 100, { note: 'Roll 1d3 and add it to each attack roll or ability check for 10 minutes' }), text: 'Target yourself or a creature you touch (the effect chip tracks it on you).' },
        { name: 'Restore a slot', col: 'action', cost: true, roll: '1d3', rollNote: 'level of the spell slot the touched creature regains (lower if needed)' }]
    },
    'barbarian:wildmagic:Unstable Backlash': { col: 'reaction', onlyRaging: true, roll: '1d8', rollNote: 'new Wild Magic table result (replaces the current one)', dc: 'con', text: 'When you take damage or fail a save while raging.' },
    'barbarian:wildmagic:Controlled Surge': { col: 'bonus', onlyRaging: true, roll: '2d8', rollNote: 'two Wild Magic results — read each die and choose; doubles = choose any effect', dc: 'con' },

    // Battlerager
    'barbarian:battlerager:Battlerager Armor': {
      attacks: [['Armor Spikes', '1d4', 'piercing', 'str', { kind: 'melee', notes: 'Bonus action while raging in spiked armor' }]],
      col: 'bonus', onlyRaging: true, roll: '1d4+str', rollNote: 'piercing (spike attack, bonus action)',
      acts: [{ name: 'Grapple spikes', onlyRaging: true, roll: '3', rollNote: 'piercing when your grapple succeeds' }]
    },
    'barbarian:battlerager:Reckless Abandon': { col: 'action', onlyRaging: true, use: { temp: '{max(1,con)}' }, text: 'Use with Reckless Attack while raging (no extra action). Temp HP vanish when the rage ends.' },
    'barbarian:battlerager:Battlerager Charge': { col: 'bonus', onlyRaging: true, dash: true },
    'barbarian:battlerager:Spiked Retribution': { onlyRaging: true, roll: '3', rollNote: 'piercing to a creature within 5 ft that hits you with a melee attack (spiked armor, not incapacitated)' },

    // Giant
    "barbarian:giant:Giant's Power": { spells: ['Thaumaturgy'], spellNote: 'Or Druidcraft — your choice (WIS). You also learn Giant.', spellCls: 'other' },
    "barbarian:giant:Giant's Havoc": { raging: { advNote: 'Giant Stature: Large (if smaller), reach +5 ft. Crushing Throw: add Rage Damage to STR thrown weapon hits' } },
    'barbarian:giant:Elemental Cleaver': {
      raging: { everyHit: '1d6 elemental (Elemental Cleaver)' },
      acts: [{ name: 'Change element', col: 'bonus', onlyRaging: true, text: 'Acid, cold, fire, thunder or lightning. The weapon is thrown 20/60 and returns.' }]
    },
    'barbarian:giant:Mighty Impel': { col: 'bonus', onlyRaging: true, dc: 'str', save: 'STR', text: 'Move a Medium or smaller creature within reach (Large or smaller with Demiurgic Colossus) up to 30 ft; unwilling creatures save.' },
    'barbarian:giant:Demiurgic Colossus': { raging: { everyHit: '1d6 elemental (Demiurgic Colossus: Elemental Cleaver 2d6)', advNote: 'Rage size up to Huge, reach +10 ft; Mighty Impel works on Large creatures' } },

    // ======================= BARD =======================
    'bard:Spellcasting': { none: true, note: 'Built in: bard spell table, CHA spell DC and attack.' },
    'bard:Bardic Inspiration': { roll: '1bi', rollNote: 'the die you give (they roll it)', text: 'A creature within 60 ft that can hear you gains a d{tier(bard,1,6,5,8,10,10,15,12)} for 10 minutes.' },
    'bard:Song of Rest': { trigger: 'shortRest', triggerLabel: 'Roll Song of Rest', roll: '1d{tier(bard,2,6,9,8,13,10,17,12)}', rollNote: 'extra HP for each friendly creature that spent Hit Dice this rest', healRoll: true },
    'bard:Expertise': { none: true, note: 'Built in: class expertise choices at 3rd and 10th level.' },
    'bard:Font of Inspiration': { none: true, note: 'Built in: Bardic Inspiration resets on a short rest from 5th level (shortAt).' },
    'bard:Countercharm': { col: 'action', use: E('Countercharm', 1, { note: 'You and friends within 30 ft that hear you: advantage on saves vs frightened and charmed' }) },
    'bard:Magical Secrets': { none: true, note: 'Pick the spells as known bard spells (any class list); add them with the feature’s "Spells from this feature" editor.' },
    'bard:Superior Inspiration': { trigger: 'initiative', triggerLabel: 'Regain 1 Bardic Inspiration', use: { regain: { from: 'Bardic Inspiration', n: 1 } }, triggerText: 'If you have no Bardic Inspiration left, regain one use.' },

    // Lore
    'bard:lore:Bonus Proficiencies': { none: true, note: 'Built in: three skill choices.' },
    'bard:lore:Cutting Words': { col: 'reaction', cost: BI, roll: '1bi', rollNote: 'subtract from the creature’s attack, check or damage roll' },
    'bard:lore:Additional Magical Secrets': { none: true, note: 'Two spells from any class; add them with the feature’s spell editor.' },
    'bard:lore:Peerless Skill': { cost: BI, roll: '1bi', rollNote: 'added to your own ability check' },

    // Valor
    'bard:valor:Bonus Proficiencies': { none: true, note: 'Built in: medium armor, shields, martial weapons.' },
    'bard:valor:Combat Inspiration': { roll: '1bi', rollNote: 'the inspired creature adds it to weapon damage, or to AC against one attack' },
    'bard:valor:Extra Attack': { none: true, note: 'Built in: subclass extraAttack at 6th level.' },
    'bard:valor:Battle Magic': { col: 'bonus', text: 'After you cast a bard spell with your action this turn: one weapon attack.' },

    // Glamour
    'bard:glamour:Mantle of Inspiration': { col: 'bonus', cost: BI, roll: '{tier(bard,3,5,5,8,10,11,15,14)}', rollNote: 'temp HP to each chosen creature', text: 'Up to {max(1,cha)} creatures within 60 ft gain the temp HP and can use their reaction to move up to their speed without provoking.' },
    'bard:glamour:Enthralling Performance': { dc: 'spell', save: 'WIS', text: 'After 1 minute of performing: up to {max(1,cha)} humanoids within 60 ft that watched are charmed by you for 1 hour on a failed save.' },
    'bard:glamour:Mantle of Majesty': {
      col: 'bonus', use: E('Mantle of Majesty', 10, { note: 'Concentration. Cast Command as a bonus action each turn without a slot; creatures charmed by you fail the save' }),
      acts: [{ name: 'Command', col: 'bonus', onlyWhen: { effect: 'Mantle of Majesty' }, dc: 'spell', save: 'WIS' }]
    },
    'bard:glamour:Unbreakable Majesty': { col: 'bonus', dc: 'spell', save: 'CHA', use: E('Unbreakable Majesty', 10, { note: 'A creature attacking you first makes a CHA save or must pick a new target; on a success it has disadvantage on its save vs your next spell' }) },

    // Swords
    'bard:swords:Bonus Proficiencies': { none: true, note: 'Built in: medium armor. Scimitar proficiency and using weapons as a spellcasting focus are on the description.' },
    'bard:swords:Blade Flourish': {
      cost: null, roll: null,
      text: 'When you take the Attack action your speed rises by 10 ft this turn. Once per turn on a weapon hit, use one flourish.',
      acts: [
        { name: 'Defensive Flourish', col: 'action', cost: BI, roll: '1bi', rollNote: 'extra weapon damage, and add the same number to your AC until your next turn' },
        { name: 'Slashing Flourish', col: 'action', cost: BI, roll: '1bi', rollNote: 'extra damage to the target and to another creature within 5 ft' },
        { name: 'Mobile Flourish', col: 'action', cost: BI, roll: '1bi', rollNote: 'extra damage; push the target 5 + roll ft (you can follow with your reaction)' }]
    },
    'bard:swords:Extra Attack': { none: true, note: 'Built in: subclass extraAttack at 6th level.' },
    "bard:swords:Master's Flourish": {
      text: 'Use a d6 instead of spending Bardic Inspiration for a flourish.',
      acts: [
        { name: 'Defensive (d6)', col: 'action', roll: '1d6', rollNote: 'extra damage and AC bonus until your next turn' },
        { name: 'Slashing (d6)', col: 'action', roll: '1d6', rollNote: 'extra damage to the target and another creature within 5 ft' },
        { name: 'Mobile (d6)', col: 'action', roll: '1d6', rollNote: 'extra damage; push 5 + roll ft' }]
    },

    // Whispers
    'bard:whispers:Psychic Blades': { col: 'action', cost: BI, roll: '{tier(bard,3,2,5,3,10,5,15,8)}d6', rollNote: 'psychic, once per turn on a weapon hit' },
    'bard:whispers:Words of Terror': { dc: 'spell', save: 'WIS', text: 'After 1 minute alone talking with a creature: on a failed save it is frightened of you or a creature you choose for 1 hour (ends if attacked or damaged).' },
    'bard:whispers:Mantle of Whispers': { col: 'reaction', use: E('Mantle of Whispers', 600, { note: 'Disguised as the dead humanoid; +5 to CHA (Deception) checks to pass as it. End as a bonus action' }) },
    'bard:whispers:Shadow Lore': { col: 'action', dc: 'spell', save: 'WIS', text: 'On a failure the creature is charmed for 8 hours, obeying you out of fear (it knows afterwards).' },

    // Creation
    'bard:creation:Mote of Potential': {
      text: 'Bonus effect when the inspired creature uses the die.',
      acts: [
        { name: 'Check: roll twice', roll: '2bi', rollNote: 'the creature uses either roll' },
        { name: 'Attack: thunder', roll: '1bi', rollNote: 'thunder damage to the target and each creature within 5 ft (CON save negates)', dc: 'spell', save: 'CON' },
        { name: 'Save: temp HP', roll: '1bi+{cha}', rollNote: 'temp HP for the creature' }]
    },
    'bard:creation:Performance of Creation': { col: 'action', text: 'Create a nonmagical item worth up to {20*bard} gp, {tier(bard,3,1,6,2,14,3) == 1 ? 0 : 0}size Medium (Large at 6th, Huge at 14th); it lasts {prof} hours. You can also use it again by spending a 2nd-level or higher slot.' },
    'bard:creation:Animating Performance': { col: 'action', text: 'The Dancing Item joins you for 1 hour (see Companions). Command it with a bonus action. You can also use it again by spending a 3rd-level or higher slot.' },
    'bard:creation:Creative Crescendo': { text: 'Performance of Creation makes up to {max(2,cha)} items (one of any size, the rest Small or smaller) with no gp limit.' },

    // Eloquence
    'bard:eloquence:Silver Tongue': { passive: { minD20: { skills: ['Persuasion', 'Deception'], value: 10 } } },
    'bard:eloquence:Unsettling Words': { col: 'bonus', cost: BI, roll: '1bi', rollNote: 'subtract from the creature’s next save before your next turn' },
    'bard:eloquence:Unfailing Inspiration': { none: true, note: 'Applies to the inspired creature: it keeps the die if the roll still fails.' },
    'bard:eloquence:Universal Speech': { col: 'action', text: 'Up to {max(1,cha)} creatures within 60 ft understand you for 1 hour. You can also use it again by spending any spell slot.' },
    'bard:eloquence:Infectious Inspiration': { col: 'reaction', roll: '1bi', rollNote: 'the free Bardic Inspiration die you give another creature within 60 ft' },

    // Spirits
    'bard:spirits:Guiding Whispers': { spells: ['Guidance'], spellNote: 'Range 60 ft' },
    'bard:spirits:Spiritual Focus': { roll: null, text: 'Candle, crystal ball, skull, spirit board or tarokka deck as a spellcasting focus.', acts: [{ name: '+1d6 to a bard spell', min: 6, roll: '1d6', rollNote: 'added to one damage or healing roll of a bard spell cast through the focus' }] },
    'bard:spirits:Tales from Beyond': { col: 'bonus', cost: BI, roll: '1bi', rollNote: 'Spirit Tales table (roll with your Bardic Inspiration die)', dc: 'spell', text: 'Hold the tale until you tell it (action) or finish a rest.' },
    'bard:spirits:Spirit Session': { text: '1-hour ritual with up to {prof} willing creatures (you included): learn one divination or necromancy spell of a level up to the number of participants (and one you can cast) until your next long rest.' },
    'bard:spirits:Mystical Connection': { roll: '2bi', rollNote: 'two Spirit Tales results — choose one; doubles = choose any tale' }
  });

  // ---- Storm Herald per-environment additions (Storm Soul extras and Raging Storm) on the Storm Aura choices ----
  addActs('stormAura', 'Desert', [{ name: 'Raging Storm (Desert)', col: 'reaction', min: 14, onlyRaging: true, roll: '{floor(barbarian/2)}', rollNote: 'fire to the creature in your aura that hit you (DEX save negates)', dc: 'con', save: 'DEX' }]);
  addActs('stormAura', 'Sea', [{ name: 'Raging Storm (Sea)', col: 'reaction', min: 14, onlyRaging: true, text: 'When you hit a creature in your aura: it is knocked prone on a failed save.', dc: 'con', save: 'STR' }]);
  addActs('stormAura', 'Tundra', [
    { name: 'Freeze water', col: 'action', min: 6, text: 'Freeze a 5-ft cube of unoccupied water for 1 minute.' },
    { name: 'Raging Storm (Tundra)', min: 14, onlyRaging: true, text: 'When your aura activates: one creature in it has speed 0 until the start of your next turn on a failed save.', dc: 'con', save: 'STR' }]);
  addPassive('stormAura', 'Desert', { min: 6, advNote: 'Storm Soul: unaffected by extreme heat; set unattended flammable objects alight by touch (action)' });
  addPassive('stormAura', 'Sea', { min: 6, advNote: 'Storm Soul: you can breathe underwater' });
  addPassive('stormAura', 'Tundra', { min: 6, advNote: 'Storm Soul: unaffected by extreme cold' });
  // ---- Totem Warrior choices that had nothing ----
  setOpt('totemAttune', 'Bear', { raging: { advNote: 'Hostile creatures within 5 ft have disadvantage on attacks against others (Bear)' } });
  addPassive('totemAspect', 'Bear', { advNote: 'STR checks to push, pull, lift or break objects (Bear)' });
})();
