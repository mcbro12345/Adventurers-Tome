// Feature automation: Barbarian and Bard (2014 rules) and their non-UA subclasses. See tools/FX_SPEC.md.
// col 'move' = the "Movement & Free" column: riders you add on a hit or as part of another action, so using them
// doesn't spend your action (an Action-column button before your first attack would block the Attack action).
(function () {
  const BI = { from: 'Bardic Inspiration', n: 1 };
  const E = (name, rounds, buff, more) => ({ effect: Object.assign({ name, rounds, buff }, more || {}) });
  const RAGING = { cond: 'Raging' };
  const opt = (type, name) => (DND.options[type] || { list: [] }).list.find(x => x[0] === name);
  const setOpt = (type, name, fx) => { const e = opt(type, name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  const addActs = (type, name, acts) => { const e = opt(type, name); if (e) { e[3] = Object.assign({}, e[3] || {}); e[3].acts = (e[3].acts || []).concat(acts); } };
  const addPassive = (type, name, p) => { const e = opt(type, name); if (e) { e[3] = Object.assign({}, e[3] || {}); e[3].passive = [].concat(e[3].passive || []).concat(p); } };
  const BS = n => 'Bestial Soul: ' + n;

  Object.assign(DND.featFx, {
    // ======================= BARBARIAN =======================
    'barbarian:Unarmored Defense': { none: true, note: 'Built in: AC 10 + DEX + CON without armor (class unarmored formula, shield allowed).' },
    'barbarian:Reckless Attack': {
      col: 'move', use: E('Reckless Attack', 1, { atkAdv: 'Reckless Attack', note: 'Advantage on STR melee weapon attacks this turn; attack rolls against you have advantage until your next turn' }),
      text: 'Decide when you make your first attack this turn (it doesn’t use your action).'
    },
    'barbarian:Danger Sense': { passive: { advNote: 'DEX saves vs effects you can see, such as traps and spells (Danger Sense; not while blinded, deafened or incapacitated)' } },
    'barbarian:Extra Attack': { none: true, note: 'Built in: class extraAttack (2 attacks from 5th level).' },
    'barbarian:Fast Movement': { none: true, note: 'Built in: +10 ft walking speed while not in heavy armor (speed calculation).' },
    'barbarian:Feral Instinct': { passive: { initAdv: true, advNote: 'Surprised: you can still act on your first turn if you rage before doing anything else (Feral Instinct)' } },
    'barbarian:Brutal Critical': { none: true, note: 'Built in: melee critical hits add {tier(barbarian,9,1,13,2,17,3)} extra weapon damage die (attack roller).' },
    'barbarian:Relentless Rage': {
      onlyRaging: true, onlyWhen: RAGING, trigger: 'zero', triggerLabel: 'Roll the save', max: '20', reset: 'short', dc: false,
      roll: '1d20+{con+prof}', rollNote: 'CON save (includes proficiency)',
      text: 'DC 10 for the first use after a rest, +5 for every earlier use since then (DC = 5 + 5 × uses spent on this card, including this one). On a success press "Saved: 1 HP".',
      triggerText: 'You dropped to 0 HP while raging: make a CON save (DC 10, +5 per earlier use since your last rest) to drop to 1 HP instead.',
      acts: [{ name: 'Saved: 1 HP', onlyWhen: { zeroHp: true }, use: { setHp: 1, removeCond: ['Unconscious'] }, text: 'Relentless Rage: you drop to 1 HP instead.' }]
    },
    'barbarian:Persistent Rage': { none: true, note: 'Rage only ends early if you fall unconscious or choose to end it (the sheet never ends rage early on its own).' },
    'barbarian:Indomitable Might': { passive: { advNote: 'STR checks: if the total is lower than your STR score, use the score (Indomitable Might)' } },
    'barbarian:Primal Champion': { passive: { abil: { str: 4, con: 4 }, abilMax: 24 } },

    // Berserker
    'barbarian:berserker:Frenzy': {
      onlyRaging: true, dc: false,
      use: E('Frenzy', null, { note: 'Bonus action each turn: one melee weapon attack. 1 level of exhaustion when the rage ends' }),
      text: 'Choose to frenzy as you enter your rage. When the rage ends, press "Rage ended: +1 exhaustion".',
      acts: [
        { name: 'Frenzy attack', col: 'bonus', onlyRaging: true, onlyWhen: { effect: 'Frenzy' }, text: 'One melee weapon attack (on each of your turns after the one you frenzied).' },
        { name: 'Rage ended: +1 exhaustion', onlyWhen: { effect: 'Frenzy' }, use: { exhaustion: 1, endEffect: 'Frenzy' } }],
      onRageEnd: { onlyWhen: { effect: 'Frenzy' }, use: { exhaustion: 1, endEffect: 'Frenzy' } }  // (happens on its own when the rage ends; the button stays for a rage ended some other way)
    },
    'barbarian:berserker:Mindless Rage': { raging: { condImmune: ['Charmed', 'Frightened'] }, text: 'Charmed or frightened effects already on you are suspended while you rage.' },
    'barbarian:berserker:Intimidating Presence': {
      col: 'action', dc: 'cha', save: 'WIS', text: 'One creature within 30 ft that can see or hear you is frightened of you until the end of your next turn. If it saves, you can’t use this on it again for 24 hours.',
      acts: [{ name: 'Extend the fear', col: 'action', text: 'The frightened creature stays frightened until the end of your next turn (ends if it ends its turn out of sight or over 60 ft away).' }]
    },
    'barbarian:berserker:Retaliation': { col: 'reaction', text: 'When a creature within 5 ft damages you: make one melee weapon attack against it.' },

    // Totem Warrior (each totem's effects live on the chosen option, below)
    'barbarian:totem:Spirit Seeker': { spells: ['Beast Sense', 'Speak with Animals'], spellNote: 'Ritual only (10 extra minutes, no slot)', spellCls: 'other' },
    'barbarian:totem:Totem Spirit': { dc: false, text: 'Your chosen totem is listed as its own feature and carries its effects.' },
    'barbarian:totem:Aspect of the Beast': { dc: false, text: 'Your chosen aspect is listed as its own feature and carries its effects.' },
    'barbarian:totem:Spirit Walker': { spells: ['Commune with Nature'], spellNote: 'Ritual only (10 extra minutes, no slot)', spellCls: 'other' },
    'barbarian:totem:Totemic Attunement': { dc: false, text: 'Your chosen attunement is listed as its own feature and carries its effects.' },

    // Ancestral Guardian
    'barbarian:ancestral:Ancestral Protectors': { raging: { advNote: 'First creature you hit each turn (until your next turn): disadvantage on attacks vs others, and others resist its damage' } },
    'barbarian:ancestral:Spirit Shield': { col: 'reaction', onlyRaging: true, roll: '{tier(barbarian,6,2,10,3,14,4)}d6', rollNote: 'damage prevented for a creature you can see within 30 ft' },
    'barbarian:ancestral:Consult the Spirits': { spells: ['Augury', 'Clairvoyance'], spellNote: 'Cast one without a slot or material components, once per short rest (WIS); Clairvoyance uses an ancestral spirit as the sensor', spellCls: 'other', text: 'Cast Augury or Clairvoyance without a slot or components.' },
    'barbarian:ancestral:Vengeful Ancestors': { raging: { advNote: 'Spirit Shield: the attacker takes force damage equal to the damage prevented' } },

    // Storm Herald (per-environment effects live on the Storm Aura choice)
    'barbarian:storm:Storm Aura': { dc: 'con', save: 'DEX', text: 'Your Desert/Sea/Tundra aura button is on your Storm Aura choice (it activates as you rage, then as a bonus action each turn).' },
    'barbarian:storm:Storm Soul': { dc: false, text: 'Resistance and environment benefits come from your Storm Aura choice.' },
    'barbarian:storm:Shielding Storm': { raging: { advNote: 'Creatures of your choice in your Storm Aura share your Storm Soul resistance' } },
    'barbarian:storm:Raging Storm': { dc: 'con', text: 'Your environment’s Raging Storm button is on your Storm Aura choice.' },

    // Zealot
    'barbarian:zealot:Divine Fury': { col: 'move', onlyRaging: true, roll: '1d6+{floor(barbarian/2)}', rollNote: 'radiant or necrotic (your choice when you gained it), first weapon hit each turn' },
    'barbarian:zealot:Warrior of the Gods': { none: true },
    'barbarian:zealot:Fanatical Focus': { col: 'move', onlyRaging: true, roll: '1d20', rollNote: 'reroll of the failed save (add your save bonus; you must use the new roll)', text: 'Once per rage.' },
    'barbarian:zealot:Zealous Presence': { col: 'bonus', text: 'Up to 10 other creatures within 60 ft that hear you gain advantage on attacks and saves until the start of your next turn.' },
    'barbarian:zealot:Rage Beyond Death': {
      onlyRaging: true, onlyWhen: RAGING, trigger: 'zero', triggerLabel: 'Keep fighting', use: { removeCond: ['Unconscious'] },
      text: 'You stay conscious at 0 HP while raging (still make death saves). If the rage ends and you are still at 0 HP, you die.'
    },

    // Beast
    'barbarian:beast:Form of the Beast': {
      attacks: [
        ['Bite (Form of the Beast)', '1d8', 'piercing', 'str', { kind: 'melee', notes: 'Only while raging. Once per turn on a hit while below half HP, regain HP equal to your proficiency bonus.' }],
        ['Claws (Form of the Beast)', '1d6', 'slashing', 'str', { kind: 'melee', notes: 'Only while raging. Once per turn when you attack with a claw using the Attack action, make one extra claw attack.' }],
        ['Tail (Form of the Beast)', '1d8', 'piercing', 'str', { kind: 'melee', notes: 'Only while raging. Reach 10 ft. Reaction: +1d8 AC against an attack you can see.' }]],
      text: 'Choose the form each time you rage. From 6th level these count as magical (Bestial Soul).',
      acts: [
        { name: 'Bite: regain HP', col: 'move', onlyWhen: { cond: 'Raging', hpBelowHalf: true }, use: { heal: '{prof}' }, text: 'Once per turn, when your bite deals damage while you have fewer than half your HP.' },
        { name: 'Claws: extra claw attack', col: 'move', onlyRaging: true, text: 'Once per turn, as part of the Attack action: one extra claw attack.' },
        { name: 'Tail: deflect', col: 'reaction', onlyRaging: true, roll: '1d8', rollNote: 'added to your AC against the triggering attack' }]
    },
    'barbarian:beast:Bestial Soul': {
      text: 'Natural weapons count as magical. Choose one benefit after each short or long rest (it lasts until your next one).',
      passive: [{ swim: 'walk', effect: BS('Swimming') }, { climb: 'walk', effect: BS('Climbing') }],
      // each pick ends the other two (endEffect ends one, dismiss ends effects starting with that name)
      acts: [
        { name: 'Swimming', use: { effect: { name: BS('Swimming'), rounds: null, buff: { note: 'Swimming speed equal to your walking speed; breathe underwater' } }, endEffect: BS('Climbing'), dismiss: BS('Jumping') } },
        { name: 'Climbing', use: { effect: { name: BS('Climbing'), rounds: null, buff: { note: 'Climbing speed equal to your walking speed; climb difficult surfaces and ceilings without a check' } }, endEffect: BS('Jumping'), dismiss: BS('Swimming') } },
        { name: 'Jumping', use: { effect: { name: BS('Jumping'), rounds: null, buff: { note: 'Once per turn when you jump, make a STR (Athletics) check and add the total in feet' } }, endEffect: BS('Swimming'), dismiss: BS('Climbing') } }]
    },
    'barbarian:beast:Infectious Fury': { col: 'move', onlyRaging: true, dc: 'con', save: 'WIS', roll: '2d12', rollNote: 'psychic (or instead it uses its reaction to make a melee attack against a creature you choose)', text: 'When you hit with a natural weapon while raging.' },
    'barbarian:beast:Call the Hunt': { col: 'move', onlyRaging: true, use: { temp: '{5*prof}' }, text: 'As you enter your rage: up to {prof} willing creatures within 30 ft each deal +1d6 damage once per turn until the rage ends. You gain 5 temp HP per creature (auto-applied for the maximum {prof}; lower it if fewer accept).' },

    // Wild Magic (bsurge: the sheet's own Wild Magic table roller)
    'barbarian:wildmagic:Magic Awareness': { col: 'action', text: 'Until the end of your next turn you know the location of spells and magic items within 60 ft (not behind total cover) and their schools.' },
    'barbarian:wildmagic:Wild Surge': {
      col: 'bonus', onlyRaging: true, bsurge: 'one', dc: 'con',
      text: 'Rolls automatically when you rage. 1 Shadowy tendrils (CON save, 1d12 necrotic; you gain 1d12 temp HP) · 2 Teleport 30 ft (again as bonus action each turn) · 3 Exploding spirit (DEX save, 1d6 force; again as bonus action) · 4 Weapon: light, thrown 20/60, force damage, returns · 5 Attackers that hit you take 1d6 force · 6 Protective lights: +1 AC for you and allies within 10 ft · 7 Flowers and vines: 15 ft difficult terrain for enemies · 8 Bolt of light (CON save, 1d6 radiant + blinded; again as bonus action). Effects last until the rage ends.',
      acts: [
        { name: 'Teleport again', col: 'bonus', onlyRaging: true, onlyWhen: { effect: 'Wild Surge: Teleport' }, text: 'Teleport up to 30 ft to an unoccupied space you can see.' },
        { name: 'Another spirit', col: 'bonus', onlyRaging: true, onlyWhen: { effect: 'Wild Surge: Exploding spirit' }, roll: '1d6', rollNote: 'force to each creature within 5 ft of the spirit (DEX save negates)', dc: 'con', save: 'DEX' },
        { name: 'Retribution', col: 'move', onlyRaging: true, onlyWhen: { effect: 'Wild Surge: Retribution' }, roll: '1d6', rollNote: 'force to the creature that hit you' },
        { name: 'Another bolt', col: 'bonus', onlyRaging: true, onlyWhen: { effect: 'Wild Surge: Bolt of light' }, roll: '1d6', rollNote: 'radiant; blinded until the start of your next turn (CON save negates)', dc: 'con', save: 'CON' }]
    },
    'barbarian:wildmagic:Bolstering Magic': {
      resource: true,
      acts: [
        { name: 'Bolster (+1d3 rolls)', col: 'action', cost: true, roll: '1d3', rollNote: 'added to each attack roll and ability check for 10 minutes', use: E('Bolstering Magic', 100, { note: 'Add the rolled 1d3 to each attack roll and ability check for 10 minutes' }), text: 'Target yourself or a creature you touch (the effect chip tracks it on you).' },
        { name: 'Restore a slot', col: 'action', cost: true, roll: '1d3', rollNote: 'level of the spell slot the touched creature regains (lower if needed)' }]
    },
    'barbarian:wildmagic:Unstable Backlash': { col: 'reaction', onlyRaging: true, bsurge: 'backlash', dc: 'con', text: 'When you take damage or fail a save while raging: roll a new Wild Surge (it replaces the current one).' },
    'barbarian:wildmagic:Controlled Surge': { onlyRaging: true, bsurge: 'controlled', dc: 'con', text: 'Whenever you roll on the Wild Magic table, roll twice and choose; doubles let you choose any effect. (The sheet does this for you.)' },

    // Battlerager
    'barbarian:battlerager:Battlerager Armor': {
      attacks: [['Armor Spikes', '1d4', 'piercing', 'str', { kind: 'melee', notes: 'Bonus action while raging in spiked armor' }]],
      col: 'bonus', onlyRaging: true, roll: '1d4+{str}', rollNote: 'piercing (spike attack, bonus action — roll to hit with Armor Spikes)',
      acts: [{ name: 'Grapple spikes', col: 'move', onlyRaging: true, roll: '3', rollNote: 'piercing when your grapple (Attack action) succeeds' }]
    },
    'barbarian:battlerager:Reckless Abandon': { col: 'move', onlyRaging: true, use: { temp: '{max(1,con)}' }, text: 'When you use Reckless Attack while raging (no extra action). Temp HP vanish when the rage ends.' },
    'barbarian:battlerager:Battlerager Charge': { col: 'bonus', onlyRaging: true, dash: true },
    'barbarian:battlerager:Spiked Retribution': { col: 'move', onlyRaging: true, roll: '3', rollNote: 'piercing to a creature within 5 ft that hits you with a melee attack (spiked armor, not incapacitated)' },

    // Giant (the cantrip is a subclass choice, below)
    "barbarian:giant:Giant's Power": { dc: false, text: 'You learn Giant and your chosen cantrip (Druidcraft or Thaumaturgy, WIS).' },
    "barbarian:giant:Giant's Havoc": { raging: { advNote: 'Giant Stature: Large (if smaller), reach +5 ft. Crushing Throw: add Rage Damage to STR thrown weapon hits' } },
    'barbarian:giant:Elemental Cleaver': {
      raging: { everyHit: '1d6 elemental (Elemental Cleaver)' },
      acts: [{ name: 'Change element', col: 'bonus', onlyRaging: true, text: 'Acid, cold, fire, thunder or lightning. The weapon is thrown 20/60 and returns.' }]
    },
    'barbarian:giant:Mighty Impel': { col: 'bonus', onlyRaging: true, dc: 'str', save: 'STR', text: 'Move a Medium or smaller creature within reach (Large or smaller with Demiurgic Colossus) up to 30 ft; unwilling creatures save.' },
    'barbarian:giant:Demiurgic Colossus': { raging: { everyHit: '1d6 elemental (Demiurgic Colossus: Elemental Cleaver 2d6)', advNote: 'Rage size up to Huge, reach +10 ft; Mighty Impel works on Large creatures' } },

    // ======================= BARD =======================
    'bard:Spellcasting': { none: true, note: 'Built in: bard spell table, CHA spell DC and attack.' },
    'bard:Bardic Inspiration': { roll: '1bi', rollNote: 'the die you give (they roll it)', text: 'A creature other than you within 60 ft that can hear you gains a d{tier(bard,1,6,5,8,10,10,15,12)} for 10 minutes.' },
    'bard:Jack of All Trades': { none: true, note: 'Built in: half proficiency on checks without proficiency (skills and initiative).' },
    'bard:Song of Rest': { trigger: 'shortRest', triggerLabel: 'Roll Song of Rest', roll: '1d{tier(bard,2,6,9,8,13,10,17,12)}', rollNote: 'extra HP for you and each friendly creature that spent Hit Dice this rest', healRoll: true },
    'bard:Expertise': { none: true, note: 'Built in: class expertise choices at 3rd and 10th level.' },
    'bard:Font of Inspiration': { none: true, note: 'Built in: Bardic Inspiration resets on a short rest from 5th level (shortAt).' },
    'bard:Countercharm': { col: 'action', use: E('Countercharm', 1, { note: 'You and friends within 30 ft that hear you: advantage on saves vs frightened and charmed' }) },
    'bard:Magical Secrets': { none: true, note: 'Pick the spells as known bard spells (any class list); add them with the feature’s "Spells from this feature" editor.' },
    // onInit only refills the feature's own uses, so this is offered as you roll initiative instead
    'bard:Superior Inspiration': { onInit: { from: 'Bardic Inspiration', regain: 1, ifEmpty: true }, text: 'When you roll initiative with no Bardic Inspiration left, you regain one (the sheet does it for you).' },

    // Lore
    'bard:lore:Bonus Proficiencies': { none: true, note: 'Built in: three skill choices.' },
    'bard:lore:Cutting Words': { col: 'reaction', cost: BI, roll: '1bi', rollNote: 'subtract from the creature’s attack, check or damage roll' },
    'bard:lore:Additional Magical Secrets': { none: true, note: 'Two spells from any class; add them with the feature’s spell editor.' },
    'bard:lore:Peerless Skill': { cost: BI, roll: '1bi', rollNote: 'added to your own ability check' },

    // Valor
    'bard:valor:Bonus Proficiencies': { none: true, note: 'Built in: medium armor, shields, martial weapons.' },
    'bard:valor:Combat Inspiration': { roll: '1bi', rollNote: 'the inspired creature adds it to weapon damage, or (reaction) to AC against one attack' },
    'bard:valor:Extra Attack': { none: true, note: 'Built in: subclass extraAttack at 6th level.' },
    'bard:valor:Battle Magic': { col: 'bonus', text: 'After you use your action to cast a bard spell this turn: one weapon attack.' },

    // Glamour
    'bard:glamour:Mantle of Inspiration': {
      col: 'bonus', cost: BI, roll: '{tier(bard,3,5,5,8,10,11,15,14)}', rollNote: 'temp HP to each chosen creature',
      text: 'Up to {max(1,cha)} creatures within 60 ft gain the temp HP and can use their reaction to move up to their speed without provoking.',
      acts: [{ name: 'I’m one of them: temp HP', use: { temp: '{tier(bard,3,5,5,8,10,11,15,14)}' }, text: 'You chose yourself as one of the creatures.' }]
    },
    'bard:glamour:Enthralling Performance': { dc: 'spell', save: 'WIS', text: 'After 1 minute of performing: up to {max(1,cha)} humanoids within 60 ft that watched are charmed by you for 1 hour on a failed save.' },
    'bard:glamour:Mantle of Majesty': {
      col: 'bonus', dc: 'spell', save: 'WIS', use: E('Mantle of Majesty', 10, { note: 'Concentration. Cast Command as a bonus action each turn without a slot; creatures charmed by you fail the save' }),
      text: 'You cast Command now (no slot). Concentration, as for a spell.',
      acts: [{ name: 'Command', col: 'bonus', onlyWhen: { effect: 'Mantle of Majesty' }, dc: 'spell', save: 'WIS', text: 'Cast Command without a slot (charmed creatures fail).' }]
    },
    'bard:glamour:Unbreakable Majesty': { col: 'bonus', dc: 'spell', save: 'CHA', use: E('Unbreakable Majesty', 10, { note: 'The first time each turn a creature tries to attack you it makes a CHA save or must pick a new target; on a success it has disadvantage on saves vs your spells on your next turn' }) },

    // Swords
    'bard:swords:Bonus Proficiencies': { none: true, note: 'Built in: medium armor. Scimitar proficiency and using weapons as a spellcasting focus are on the description.' },
    'bard:swords:Fighting Style': { dc: false, text: 'Dueling or Two-Weapon Fighting: the chosen style is listed as its own feature and carries its effects.' },
    'bard:swords:Blade Flourish': {
      cost: null, roll: null,
      text: 'When you take the Attack action your walking speed rises by 10 ft this turn. Once per turn on a weapon hit, use one flourish.',
      acts: [
        { name: 'Attack action: +10 ft speed', col: 'move', use: E('Blade Flourish speed', 1, { speed: 10 }) },
        { name: 'Defensive Flourish', col: 'move', cost: BI, roll: '1bi', rollNote: 'extra weapon damage, and add the same number to your AC until your next turn', use: E('Defensive Flourish', 1, { note: 'Add the flourish roll to your AC until the start of your next turn' }) },
        { name: 'Slashing Flourish', col: 'move', cost: BI, roll: '1bi', rollNote: 'extra damage to the target and to each creature of your choice within 5 ft of you' },
        { name: 'Mobile Flourish', col: 'move', cost: BI, roll: '1bi', rollNote: 'extra damage; push the target 5 + roll ft (then your reaction: move up to your speed next to it)' }]
    },
    'bard:swords:Extra Attack': { none: true, note: 'Built in: subclass extraAttack at 6th level.' },
    "bard:swords:Master's Flourish": {
      text: 'Use a d6 instead of spending Bardic Inspiration for a flourish.',
      acts: [
        { name: 'Defensive (d6)', col: 'move', roll: '1d6', rollNote: 'extra damage and AC bonus until your next turn', use: E('Defensive Flourish', 1, { note: 'Add the flourish roll to your AC until the start of your next turn' }) },
        { name: 'Slashing (d6)', col: 'move', roll: '1d6', rollNote: 'extra damage to the target and each creature of your choice within 5 ft of you' },
        { name: 'Mobile (d6)', col: 'move', roll: '1d6', rollNote: 'extra damage; push 5 + roll ft' }]
    },

    // Whispers
    'bard:whispers:Psychic Blades': { col: 'move', cost: BI, roll: '{tier(bard,3,2,5,3,10,5,15,8)}d6', rollNote: 'psychic, once per round on your turn when you hit with a weapon' },
    'bard:whispers:Words of Terror': { dc: 'spell', save: 'WIS', text: 'After 1 minute alone talking with a humanoid: on a failed save it is frightened of you or a creature you choose for 1 hour (ends if it or its allies are attacked or damaged).' },
    'bard:whispers:Mantle of Whispers': {
      col: 'reaction', use: E('Captured shadow', null, { note: 'You hold a dead humanoid’s shadow until you use it or finish a long rest' }),
      text: 'When a humanoid dies within 30 ft: capture its shadow.',
      acts: [
        { name: 'Take on its appearance', col: 'action', onlyWhen: { effect: 'Captured shadow' }, use: { effect: { name: 'Mantle of Whispers', rounds: 600, buff: { note: 'Disguised as the dead humanoid for 1 hour; +5 to your CHA (Deception) check against Insight to see through it' } }, endEffect: 'Captured shadow' } },
        { name: 'End the disguise', col: 'bonus', onlyWhen: { effect: 'Mantle of Whispers' }, use: { endEffect: 'Mantle of Whispers' } }]
    },
    'bard:whispers:Shadow Lore': { col: 'action', dc: 'spell', save: 'WIS', text: 'A creature within 30 ft that hears and understands you: on a failure it is charmed for 8 hours, obeying you out of fear (ends if you or allies attack or damage it).' },

    // Creation (slotRestore: once free use is spent, the Use button offers a spell slot of that level or higher)
    'bard:creation:Mote of Potential': {
      text: 'Bonus effect when the inspired creature uses the die.',
      acts: [
        { name: 'Check: roll twice', roll: '2bi', rollNote: 'the creature uses either roll' },
        { name: 'Attack: thunder', roll: '1bi', rollNote: 'thunder damage to the target and each creature of your choice within 5 ft of it (CON save negates)', dc: 'spell', save: 'CON' },
        { name: 'Save: temp HP', roll: '1bi+{max(1,cha)}', rollNote: 'temp HP for the creature' }]
    },
    'bard:creation:Performance of Creation': { col: 'action', slotRestore: 2, text: 'Create a nonmagical item worth up to {20*bard} gp, Medium or smaller (Large from 6th level, Huge from 14th), within 10 ft; it lasts {prof} hours. Only one at a time. Again by spending a 2nd-level or higher slot.' },
    'bard:creation:Animating Performance': { col: 'action', slotRestore: 3, text: 'The Dancing Item joins you for 1 hour (see Companions). Command it with a bonus action. Again by spending a 3rd-level or higher slot.' },
    'bard:creation:Creative Crescendo': { text: 'Performance of Creation makes up to {max(2,cha)} items (one of the maximum size, the rest Small or Tiny) with no gp limit.' },

    // Eloquence
    'bard:eloquence:Silver Tongue': { passive: { minD20: { skills: ['Persuasion', 'Deception'], value: 10 } } },
    'bard:eloquence:Unsettling Words': { col: 'bonus', cost: BI, roll: '1bi', rollNote: 'subtract from the creature’s next save before your next turn' },
    'bard:eloquence:Unfailing Inspiration': { none: true, note: 'Applies to the inspired creature: it keeps the die if the roll still fails.' },
    'bard:eloquence:Universal Speech': { col: 'action', slotRestore: 1, text: 'Up to {max(1,cha)} creatures within 60 ft understand you for 1 hour. Again by spending any spell slot.' },
    'bard:eloquence:Infectious Inspiration': { col: 'reaction', roll: '1bi', rollNote: 'the free Bardic Inspiration die you give another creature within 60 ft' },

    // Spirits
    'bard:spirits:Guiding Whispers': { spells: ['Guidance'], spellNote: 'Range 60 ft; doesn’t count against cantrips known' },
    'bard:spirits:Spiritual Focus': { roll: null, text: 'Candle, crystal ball, skull, spirit board or tarokka deck as a spellcasting focus.', acts: [{ name: '+1d6 to a bard spell', col: 'move', min: 6, roll: '1d6', rollNote: 'added to one damage or healing roll of a bard spell cast through the focus' }] },
    'bard:spirits:Tales from Beyond': {
      col: 'bonus', cost: BI, roll: '1bi', rollNote: 'Spirit Tales table result (you hold the tale)', dc: 'spell',
      use: E('Spirit tale', null, { note: 'Holding a Spirit Tale until you tell it (action) or finish a rest' }),
      text: 'Tell it with an action to a creature within 30 ft (it can be you).',
      acts: [
        { name: 'Tell the tale', col: 'action', onlyWhen: { effect: 'Spirit tale' }, use: { endEffect: 'Spirit tale' }, dc: 'spell', text: 'Tales 1, 4, 6 and the effects of 5 and 8 need no roll; use the buttons below for damage and healing.' },
        { name: 'Tale 2 / 11: 2 BI + CHA', roll: '2bi+{cha}', rollNote: 'force damage (Duelist, melee spell attack) or healing (Angel)', healRoll: true },
        { name: 'Tale 3: temp HP', roll: '1bi+{cha}', rollNote: 'temp HP for the target and one creature within 5 ft of it' },
        { name: 'Tale 5 / 8: 1 BI die', roll: '1bi', rollNote: 'force (Avenger: creature that hits the target) or necrotic (Phantom: creature it hits while invisible)' },
        { name: 'Tale 7: 2 BI dice', roll: '2bi', rollNote: 'psychic, and incapacitated (WIS save negates)', dc: 'spell', save: 'WIS' },
        { name: 'Tale 9 / 12: 3 BI dice', roll: '3bi', rollNote: 'thunder + prone (Brute, STR save half) or psychic + stunned (Mind-Bender, INT save negates)', dc: 'spell' },
        { name: 'Tale 10: 4 BI dice', roll: '4bi', rollNote: 'fire in a 30 ft cone (Dragon, DEX save half)', dc: 'spell', save: 'DEX' }]
    },
    'bard:spirits:Spirit Session': { text: '1-hour ritual (during a rest) with up to {prof} willing creatures, you included: learn one divination or necromancy spell from any class of a level you can cast and no higher than the number of participants, until your next long rest. Add it with the feature’s spell editor.' },
    'bard:spirits:Mystical Connection': { roll: '2bi', rollNote: 'two Spirit Tales results — choose one; doubles = choose any tale' }
  });

  // ---- Subclass choices the features need ----
  const C = DND.classes, addCh = (cls, sub, chs) => { const s = C[cls] && C[cls].subclasses[sub]; if (s && !(s.choices || []).some(c => chs.some(x => x.type === c.type && x.level === c.level))) s.choices = (s.choices || []).concat(chs); };
  // College of Swords: Dueling or Two-Weapon Fighting (the fighting-style list filters options by class name)
  addCh('bard', 'swords', [{ level: 3, type: 'fightingStyle', n: 1 }]);
  ['Dueling', 'Two-Weapon Fighting'].forEach(n => { const e = opt('fightingStyle', n); if (e && !/Bard/.test(e[2] || '')) e[2] = (e[2] || '') + ', College of Swords bard'; });
  // Path of the Giant: Druidcraft or Thaumaturgy, cast with WIS
  addCh('barbarian', 'giant', [{ level: 3, type: 'cantrip', list: ['Druidcraft', 'Thaumaturgy'], ab: 'wis', n: 1, label: "Giant's Power cantrip (WIS)" }]);

  // ---- Totem Warrior (PHB/SCAG) ----
  // Totem Spirit
  setOpt('totemSpirit', 'Bear', { raging: { resist: ['all damage except psychic'] } });
  setOpt('totemSpirit', 'Eagle', {
    acts: [{ name: 'Dash (Eagle)', col: 'bonus', dash: true, onlyRaging: true, onlyWhen: { cond: 'Raging', armor: 'notHeavy' } }],
    raging: { advNote: 'Opportunity attacks against you have disadvantage (Eagle; not in heavy armor)' }
  });
  setOpt('totemSpirit', 'Elk', { raging: { speedNoHeavy: 15 } });
  setOpt('totemSpirit', 'Tiger', { raging: { advNote: 'Long jump +10 ft, high jump +3 ft (Tiger)' } });
  setOpt('totemSpirit', 'Wolf', { raging: { advNote: 'Friends have advantage on melee attacks vs hostile creatures within 5 ft of you (Wolf)' } });
  // Aspect of the Beast (always on)
  setOpt('totemAspect', 'Bear', { passive: [{ carry: 2 }, { advNote: 'STR checks to push, pull, lift or break objects (Bear)' }] });
  setOpt('totemAspect', 'Eagle', { passive: { sense: 'Eagle sight 1 mile', advNote: 'Dim light doesn’t impose disadvantage on WIS (Perception) checks (Eagle)' } });
  setOpt('totemAspect', 'Elk', { text: 'Your travel pace is doubled (mounted or on foot), and so is that of up to 10 companions within 60 ft while you aren’t incapacitated.' });
  setOpt('totemAspect', 'Wolf', { text: 'You can track creatures while traveling at a fast pace, and move stealthily while traveling at a normal pace.' });
  setOpt('totemAspect', 'Tiger', { text: 'Proficiency in two of Athletics, Acrobatics, Stealth and Survival — tick them on the Core tab.' });
  // Totemic Attunement
  setOpt('totemAttune', 'Bear', { raging: { advNote: 'Hostile creatures within 5 ft have disadvantage on attacks against anyone but you (Bear; not if it can’t see or hear you or can’t be frightened)' } });
  setOpt('totemAttune', 'Eagle', { raging: { fly: 'walk', advNote: 'Eagle flight: you fall if you end your turn in the air with nothing holding you aloft' } });
  setOpt('totemAttune', 'Elk', { acts: [{ name: 'Elk trample', col: 'bonus', onlyRaging: true, roll: '1d12+{str}', rollNote: 'bludgeoning and knocked prone (STR save negates)', dc: 'str', save: 'STR', text: 'During your move, pass through the space of a Large or smaller creature.' }] });
  setOpt('totemAttune', 'Tiger', { acts: [{ name: 'Tiger pounce', col: 'bonus', onlyRaging: true, text: 'After moving 20+ ft in a straight line toward a Large or smaller target right before a melee weapon attack against it: one more melee weapon attack against it.' }] });
  setOpt('totemAttune', 'Wolf', { acts: [{ name: 'Wolf knockdown', col: 'bonus', onlyRaging: true, text: 'When you hit a Large or smaller creature with a melee weapon attack: knock it prone (no save).' }] });

  // ---- Storm Herald per-environment additions (Storm Soul extras and Raging Storm) on the Storm Aura choices ----
  addActs('stormAura', 'Desert', [
    { name: 'Ignite an object', col: 'action', min: 6, text: 'Touch a flammable object no one is wearing or carrying: it catches fire.' },
    { name: 'Raging Storm (Desert)', col: 'reaction', min: 14, onlyRaging: true, roll: '{floor(barbarian/2)}', rollNote: 'fire to the creature in your aura that hit you (DEX save negates)', dc: 'con', save: 'DEX' }]);
  addActs('stormAura', 'Sea', [{ name: 'Raging Storm (Sea)', col: 'reaction', min: 14, onlyRaging: true, text: 'When you hit a creature in your aura: it is knocked prone on a failed save.', dc: 'con', save: 'STR' }]);
  addActs('stormAura', 'Tundra', [
    { name: 'Freeze water', col: 'action', min: 6, text: 'Freeze a 5-ft cube of unoccupied water for 1 minute.' },
    { name: 'Raging Storm (Tundra)', col: 'move', min: 14, onlyRaging: true, text: 'When your aura activates: one creature you can see in it has speed 0 until the start of your next turn on a failed save.', dc: 'con', save: 'STR' }]);
  addPassive('stormAura', 'Desert', { min: 6, advNote: 'Storm Soul: unaffected by extreme heat' });
  addPassive('stormAura', 'Sea', { min: 6, advNote: 'Storm Soul: you can breathe underwater' });
  addPassive('stormAura', 'Tundra', { min: 6, advNote: 'Storm Soul: unaffected by extreme cold' });
})();
