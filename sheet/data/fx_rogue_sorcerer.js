// Feature automation: Rogue and Sorcerer (all non-UA subclasses). Loads after featfx.js; these records win.
(function () {
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const WAILS = '{ceil(ceil(rogue/2)/2)}d6'; // half the Sneak Attack dice, rounded up
  const ALLDMG_BUT_FORCE_RADIANT = ['acid', 'bludgeoning', 'cold', 'fire', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'slashing', 'thunder'];
  const SP = n => ({ from: 'Font of Magic', n });
  const ORDN = ['1st', '2nd', '3rd', '4th', '5th'];
  const SLOT_COST = [2, 3, 5, 6, 7], SLOT_MIN = [2, 3, 5, 7, 9];

  Object.assign(DND.featFx, {
    // ================= ROGUE =================
    'rogue:Expertise': { none: true }, // handled by the class expertise choices (1st and 6th)
    'rogue:Sneak Attack': { none: true }, // built in: Sneak Attack button with scaling dice on the Combat tab
    "rogue:Thieves' Cant": { none: true },
    'rogue:Cunning Action': { resource: true, acts: [
      { name: 'Dash', col: 'bonus', dash: true },
      { name: 'Disengage', col: 'bonus', text: 'Your movement doesn’t provoke opportunity attacks this turn' },
      { name: 'Hide', col: 'bonus', text: 'Make a DEX (Stealth) check to hide' }] },
    'rogue:Steady Aim': { col: 'bonus', onlyWhen: { notMoved: true }, use: { speed0: 'Steady Aim', effect: { name: 'Steady Aim', rounds: 1, buff: { atkAdvNext: 'Steady Aim', note: 'Advantage on your next attack roll this turn' } } } },
    'rogue:Uncanny Dodge': { col: 'reaction', use: { halveDamage: true } },
    'rogue:Evasion': { passive: { advNote: 'Evasion: DEX saves for half damage — no damage on a success, half on a failure' } },
    'rogue:Reliable Talent': { passive: { minD20: { prof: true, value: 10 }, advNote: 'Reliable Talent: proficient ability checks treat a d20 of 9 or lower as 10' } },
    'rogue:Blindsense': { passive: { sense: 'Blindsense 10 ft (hidden/invisible creatures, if you can hear)' } },
    'rogue:Slippery Mind': { passive: { saveProf: ['wis'] } },
    'rogue:Elusive': { passive: { advNote: 'Elusive: no attack roll has advantage against you while you aren’t incapacitated' } },
    'rogue:Stroke of Luck': { max: '1', reset: 'short', text: 'Turn a missed attack into a hit, or treat a failed ability check’s d20 as a 20' },

    // ---- Thief ----
    'rogue:thief:Fast Hands': { acts: [
      { name: 'Sleight of Hand', col: 'bonus', text: 'Cunning Action: DEX (Sleight of Hand) check' },
      { name: "Thieves' tools", col: 'bonus', text: 'Cunning Action: disarm a trap or open a lock' },
      { name: 'Use an Object', col: 'bonus', text: 'Cunning Action: Use an Object action' }] },
    'rogue:thief:Second-Story Work': { passive: { climb: 'walk', advNote: 'Second-Story Work: running jumps go DEX mod extra feet' } },
    'rogue:thief:Supreme Sneak': { passive: { advNote: 'Stealth checks when you move no more than half your speed that turn' } },
    'rogue:thief:Use Magic Device': { none: true },
    "rogue:thief:Thief's Reflexes": { trigger: 'initiative', triggerLabel: 'Noted', triggerText: "Thief's Reflexes: in the first round take two turns — your normal turn and a second at your initiative − 10 (not if surprised)", text: 'Second turn this round at initiative − 10' },

    // ---- Assassin ----
    'rogue:assassin:Bonus Proficiencies': { none: true }, // disguise kit + poisoner's kit: add on the Proficiencies panel
    'rogue:assassin:Assassinate': { passive: { advNote: 'Assassinate: attacks vs creatures that haven’t taken a turn yet; your hits vs surprised creatures are critical hits' } },
    'rogue:assassin:Infiltration Expertise': { none: true },
    'rogue:assassin:Impostor': { passive: { advNote: 'Impostor: Deception checks to avoid detection while posing as someone' } },
    'rogue:assassin:Death Strike': { dc: 'dex', save: 'CON', text: 'When you hit a surprised creature: on a failed save, double the attack’s damage' },

    // ---- Arcane Trickster ----
    'rogue:arcanetrickster:Spellcasting': { none: true }, // class data provides the third-caster table (INT)
    'rogue:arcanetrickster:Mage Hand Legerdemain': { spells: ['Mage Hand'], spellNote: 'Invisible hand; stow/retrieve items, pick locks and pockets', col: 'bonus', text: 'Control the hand; DEX (Sleight of Hand) contested by the target’s WIS (Perception) to go unnoticed' },
    'rogue:arcanetrickster:Magical Ambush': { passive: { advNote: 'Magical Ambush: if you are hidden when you cast, the target has disadvantage on its save this turn' } },
    'rogue:arcanetrickster:Versatile Trickster': { col: 'bonus', use: R('Versatile Trickster', 1, { atkAdv: 'Versatile Trickster (creature within 5 ft of your mage hand)', note: 'Advantage on attacks vs the distracted creature this turn' }) },
    'rogue:arcanetrickster:Spell Thief': { col: 'reaction', max: '1', reset: 'long', dc: false, text: 'The caster makes a spellcasting ability check vs DC {8+prof+int}. On a failure its spell has no effect on you and you steal it (1st level+, up to a level you can cast) for 8 hours' },

    // ---- Inquisitive ----
    'rogue:inquisitive:Ear for Deceit': { passive: { minD20: { skills: ['Insight'], value: 8 }, advNote: 'Ear for Deceit: Insight to tell if a creature is lying treats a d20 of 7 or lower as 8' } },
    'rogue:inquisitive:Eye for Detail': { acts: [
      { name: 'Spot (Perception)', col: 'bonus', text: 'WIS (Perception) to spot a hidden creature or object' },
      { name: 'Search (Investigation)', col: 'bonus', text: 'INT (Investigation) to uncover or decipher clues' }] },
    'rogue:inquisitive:Insightful Fighting': { col: 'bonus', use: R('Insightful Fighting', 10, { note: 'Sneak Attack the chosen creature without advantage (not if you have disadvantage)' }), text: 'WIS (Insight) vs the target’s CHA (Deception); the effect only applies if you win' },
    'rogue:inquisitive:Steady Eye': { passive: { advNote: 'Steady Eye: Perception and Investigation if you move no more than half your speed that turn' } },
    'rogue:inquisitive:Unerring Eye': { col: 'action', max: 'max(1,wis)', reset: 'long', text: 'Sense illusions, shapechangers not in true form, and magic deceptions within 30 ft (not blinded or deafened) for this turn' },
    'rogue:inquisitive:Eye for Weakness': { roll: '3d6', rollNote: 'extra Sneak Attack damage vs your Insightful Fighting target', onlyWhen: { effect: 'Insightful Fighting' } },

    // ---- Mastermind ----
    'rogue:mastermind:Master of Intrigue': { none: true }, // tools (disguise, forgery, gaming set) added manually; languages via the subclass choice
    'rogue:mastermind:Master of Tactics': { col: 'bonus', text: 'Help action; the ally’s target can be up to 30 ft from you if it can see or hear you' },
    'rogue:mastermind:Insightful Manipulator': { none: true },
    'rogue:mastermind:Misdirection': { col: 'reaction', text: 'An attacker targets you while a creature within 5 ft gives you cover: the attack targets that creature instead' },
    'rogue:mastermind:Soul of Deceit': { passive: { advNote: 'Soul of Deceit: thoughts can’t be read; magic can’t compel truth; Deception vs Insight to show false thoughts' } },

    // ---- Scout ----
    'rogue:scout:Skirmisher': { col: 'reaction', text: 'An enemy ends its turn within 5 ft: move up to {floor(0)}half your speed without provoking opportunity attacks'.replace('{floor(0)}', '') },
    'rogue:scout:Survivalist': { passive: { skillProf: ['Nature', 'Survival'], skillExp: ['Nature', 'Survival'] } },
    'rogue:scout:Superior Mobility': { passive: { speed: 10, advNote: 'Superior Mobility: +10 ft to climbing and swimming speeds too (if you have them)' } },
    'rogue:scout:Ambush Master': { passive: { initAdv: true }, acts: [{ name: 'Mark first target', text: 'First creature you hit in the first round: allies have advantage on attacks against it until your next turn' }] },
    'rogue:scout:Sudden Strike': { col: 'bonus', text: 'After the Attack action: one more attack; can Sneak Attack again only against a different target (no other Sneak Attack on that target this turn)' },

    // ---- Swashbuckler ----
    'rogue:swashbuckler:Fancy Footwork': { passive: { advNote: 'Fancy Footwork: creatures you make a melee attack against can’t make opportunity attacks against you this turn' } },
    'rogue:swashbuckler:Rakish Audacity': { passive: { advNote: 'Rakish Audacity: Sneak Attack without advantage if the target is the only creature within 5 ft of you (not with disadvantage)' } },
    'rogue:swashbuckler:Panache': { col: 'action', text: 'CHA (Persuasion) vs the target’s WIS (Insight). Hostile: disadvantage on attacks vs others and can’t make opportunity attacks vs others for 1 minute. Non-hostile: charmed for 1 minute' },
    'rogue:swashbuckler:Elegant Maneuver': { col: 'bonus', text: 'Advantage on the next DEX (Acrobatics) or STR (Athletics) check this turn' },
    'rogue:swashbuckler:Master Duelist': { max: '1', reset: 'short', text: 'Reroll a missed attack with advantage' },

    // ---- Phantom ----
    'rogue:phantom:Whispers of the Dead': { trigger: ['shortRest', 'longRest'], triggerLabel: 'Noted', triggerText: 'Whispers of the Dead: you may gain one skill or tool proficiency you lack (replacing the previous one) — set it on the Skills/Proficiencies panel', text: 'Swap your ghostly skill or tool proficiency' },
    'rogue:phantom:Wails from the Grave': { max: 'prof', reset: 'long', roll: WAILS, rollNote: 'necrotic to a second creature within 30 ft of the first (after Sneak Attack)' },
    'rogue:phantom:Tokens of the Departed': { max: 'prof', reset: 'none', resource: true,
      passive: { advNote: 'Tokens of the Departed: advantage on death saves and CON saves while you carry a soul trinket' },
      acts: [
        { name: 'Gain soul trinket', col: 'reaction', use: { regain: { from: 'Tokens of the Departed', n: 1 } }, text: 'A creature you can see dies within 30 ft' },
        { name: 'Wails (trinket)', cost: true, roll: WAILS, rollNote: 'necrotic — Wails from the Grave without spending a use' },
        { name: 'Ghost Walk (trinket)', col: 'bonus', min: 13, cost: true, use: R('Ghost Walk', 100, { fly: 10, note: 'Hover; attacks against you have disadvantage; pass through creatures and objects (difficult terrain)' }) },
        { name: 'Ask the spirit', col: 'action', cost: true, text: 'The trinket’s spirit appears and answers one question' }] },
    'rogue:phantom:Ghost Walk': { col: 'bonus', max: '1', reset: 'long', use: R('Ghost Walk', 100, { fly: 10, note: 'Hover; attacks against you have disadvantage; pass through creatures and objects (difficult terrain)' }), text: 'Can also be used by destroying a soul trinket (see Tokens of the Departed)' },
    "rogue:phantom:Death's Friend": { trigger: 'longRest', triggerLabel: 'Gain a trinket', triggerText: "Death's Friend: if you have no soul trinkets, one appears in your hand", use: { regain: { from: 'Tokens of the Departed', n: 1 } }, passive: { advNote: "Death's Friend: Wails from the Grave also deals its necrotic damage to the first target" } },

    // ---- Soulknife ----
    'rogue:soulknife:Psionic Power': { max: '2*prof', reset: 'long', resource: true, acts: [
      { name: 'Psi-Bolstered Knack', cost: true, roll: '1psi', rollNote: 'added to a failed check with a proficient skill or tool (die is lost only if you then succeed)' },
      { name: 'Psychic Whispers', col: 'action', cost: true, roll: '1psi', rollNote: 'hours of telepathy with up to {prof} creatures (first use after a long rest is free)' },
      { name: 'Regain a die', col: 'bonus', use: { regain: { from: 'Psionic Power', n: 1 } }, text: 'Once per short or long rest' }] },
    'rogue:soulknife:Psychic Blades': { attacks: [
      ['Psychic Blade', '1d6', 'psychic', 'fin', { kind: 'melee', notes: 'Finesse; thrown 60/120 ft; vanishes after the attack; leaves no mark' }],
      ['Psychic Blade (bonus action)', '1d4', 'psychic', 'fin', { kind: 'melee', bonus: true, after: 'Psychic Blade', notes: 'Bonus action after attacking with a psychic blade; other hand free' }]] },
    'rogue:soulknife:Soul Blades': { acts: [
      { name: 'Homing Strikes', cost: { from: 'Psionic Power', n: 1 }, roll: '1psi', rollNote: 'added to a missed psychic blade attack (die lost only if it then hits)' },
      { name: 'Psychic Teleportation', col: 'bonus', cost: { from: 'Psionic Power', n: 1 }, roll: '1psi', rollNote: '× 10 ft: throw a blade and teleport to an unoccupied space there' }] },
    'rogue:soulknife:Psychic Veil': { col: 'action', max: '1', reset: 'long', use: { cond: 'Invisible', condRounds: 600 }, text: 'Invisible for 1 hour (ends early if you deal damage or force a save)',
      acts: [{ name: 'Veil (spend die)', col: 'action', cost: { from: 'Psionic Power', n: 1 }, use: { cond: 'Invisible', condRounds: 600 }, text: 'Invisible for 1 hour (ends if you deal damage or force a save)' }] },
    'rogue:soulknife:Rend Mind': { max: '1', reset: 'long', dc: 'dex', save: 'WIS', text: 'Sneak Attack with a psychic blade: stunned for 1 minute on a failure (repeat the save at the end of each of its turns)',
      acts: [{ name: 'Rend Mind (3 dice)', cost: { from: 'Psionic Power', n: 3 }, dc: 'dex', save: 'WIS', text: 'Stunned for 1 minute on a failure (repeat the save each turn)' }] },

    // ================= SORCERER =================
    'sorcerer:Spellcasting': { none: true }, // class caster table (CHA)
    'sorcerer:Font of Magic': { max: 'sorcerer', reset: 'long', pool: true, acts: []
      .concat(ORDN.map((o, k) => ({ name: `${SLOT_COST[k]} SP → ${o} slot`, col: 'bonus', min: SLOT_MIN[k], cost: SP(SLOT_COST[k]), use: { recoverSlots: { total: k + 1, maxLevel: k + 1 } }, text: `Create a ${o}-level slot (pick an expended ${o}-level slot; created slots vanish on a long rest)` })))
      .concat(ORDN.map((o, k) => ({ name: `${o} slot → ${k + 1} SP`, col: 'bonus', min: SLOT_MIN[k], use: { regain: { from: 'Font of Magic', n: k + 1 } }, text: `Mark one ${o}-level slot as spent on the Spells tab` }))) },
    'sorcerer:Metamagic': { none: true }, // each Metamagic option carries its own cost
    'sorcerer:Sorcerous Restoration': { trigger: 'shortRest', triggerLabel: 'Regain 4 points', triggerText: 'Sorcerous Restoration: regain 4 expended sorcery points', use: { regain: { from: 'Font of Magic', n: 4 } } },

    // ---- Draconic Bloodline ----
    'sorcerer:draconic:Dragon Ancestor': { passive: { advNote: 'Dragon Ancestor: double proficiency on CHA checks with dragons (you speak Draconic)' } },
    'sorcerer:draconic:Draconic Resilience': { none: true }, // built in: +1 HP per sorcerer level and 13 + DEX unarmored AC
    'sorcerer:draconic:Elemental Affinity': { none: true }, // automated by the chosen Dragon Ancestor option (CHA to damage, 1 SP resistance)
    'sorcerer:draconic:Dragon Wings': { col: 'bonus', use: R('Dragon Wings', null, { fly: 'walk', note: 'Flying speed = your speed (not while wearing armor not made for them)' }), acts: [{ name: 'Dismiss wings', col: 'bonus', use: { endEffect: 'Dragon Wings' } }] },
    'sorcerer:draconic:Draconic Presence': { col: 'action', cost: SP(5), dc: 'spell', save: 'WIS', use: R('Draconic Presence', 10, { note: '60 ft aura of awe (charmed) or fear (frightened); a creature that saves is immune for 24 hours' }, { conc: true }) },

    // ---- Wild Magic ----
    // Casting a 1st+ level spell rolls the surge check by itself (and surges when Tides of Chaos is spent) — see wildAfterCast.
    'sorcerer:wildmagic:Wild Magic Surge': { acts: [
      { name: 'Surge check (d20)', surgeCheck: true },
      { name: 'Roll a surge (d100)', surge: true }] },
    'sorcerer:wildmagic:Tides of Chaos': { max: '1', reset: 'long', use: { effect: { name: 'Tides of Chaos', buff: { d20AdvNext: 'Tides of Chaos', note: 'Advantage on your next attack roll, ability check or saving throw' } } }, text: 'Your next attack roll, ability check or saving throw has advantage. While it’s spent, your next 1st+ level spell sets off a Wild Magic Surge, which restores it' },
    'sorcerer:wildmagic:Bend Luck': { col: 'reaction', cost: SP(2), roll: '1d4', rollNote: 'added to or subtracted from another creature’s attack, check or save' },
    'sorcerer:wildmagic:Controlled Chaos': { roll: '1d100', rollNote: 'second Wild Magic Surge roll — use either result' },
    'sorcerer:wildmagic:Spell Bombardment': { passive: { advNote: 'Spell Bombardment: once per turn, a spell damage die that rolls its maximum — roll it again and add it' } },

    // ---- Divine Soul ----
    'sorcerer:divinesoul:Divine Magic': { none: true }, // cleric list access + affinity spell: add the affinity spell on the Spells tab
    'sorcerer:divinesoul:Favored by the Gods': { max: '1', reset: 'short', roll: '2d4', rollNote: 'added to a failed save or missed attack' },
    'sorcerer:divinesoul:Empowered Healing': { cost: SP(1), text: 'Reroll any number of healing dice once (yours or an ally within 5 ft; once per turn)' },
    'sorcerer:divinesoul:Otherworldly Wings': { col: 'bonus', use: R('Otherworldly Wings', null, { fly: 30, note: 'Wings (not in armor not made for them)' }), acts: [{ name: 'Dismiss wings', col: 'bonus', use: { endEffect: 'Otherworldly Wings' } }] },
    'sorcerer:divinesoul:Unearthly Recovery': { col: 'bonus', max: '1', reset: 'long', onlyWhen: { hpBelowHalf: true }, use: { healHalf: true } },

    // ---- Shadow Magic ----
    'sorcerer:shadow:Eyes of the Dark': { passive: { sense: 'Darkvision 120 ft (Eyes of the Dark)' }, spellsAt: { 3: ['Darkness'] }, spellNote: 'Cast with 2 sorcery points; you can see through it',
      acts: [{ name: 'Darkness (2 SP)', col: 'action', min: 3, cost: SP(2), text: 'Cast darkness without a slot; you can see through it' }] },
    'sorcerer:shadow:Strength of the Grave': { max: '1', reset: 'long', trigger: 'zero', onlyWhen: { zeroHp: true }, triggerLabel: 'I saved — 1 HP', use: { setHp: 1 },
      triggerText: 'Strength of the Grave: make a CHA save (DC 5 + the damage taken). On a success drop to 1 HP instead. Not vs radiant damage or a critical hit.',
      text: 'Use only after succeeding on the CHA save (DC 5 + damage taken)' },
    'sorcerer:shadow:Hound of Ill Omen': { col: 'bonus', cost: SP(3), text: 'Summon a dire wolf hound (temp HP {floor(sorcerer/2)}) within 30 ft of a creature you can see within 120 ft, for 5 minutes. While it’s within 5 ft, the target has disadvantage on saves vs your spells' },
    'sorcerer:shadow:Shadow Walk': { col: 'bonus', text: 'In dim light or darkness: teleport up to 120 ft to an unoccupied space you can see in dim light or darkness' },
    'sorcerer:shadow:Umbral Form': { col: 'bonus', cost: SP(6), use: R('Umbral Form', 10, { note: 'Resistance to all but force and radiant; move through creatures and objects (difficult terrain)' }), passive: { effect: 'Umbral Form', resist: ALLDMG_BUT_FORCE_RADIANT } },

    // ---- Storm Sorcery ----
    'sorcerer:storm:Wind Speaker': { none: true }, // Primordial language
    'sorcerer:storm:Tempestuous Magic': { col: 'bonus', text: 'Before or after casting a 1st+ level spell: fly up to 10 ft without provoking opportunity attacks' },
    'sorcerer:storm:Heart of the Storm': { passive: { resist: ['lightning', 'thunder'] },
      acts: [{ name: 'Storm burst', text: 'After casting a 1st+ level lightning or thunder spell: creatures of your choice within 10 ft take {max(1,floor(sorcerer/2))} lightning or thunder damage' }] },
    'sorcerer:storm:Storm Guide': { acts: [
      { name: 'Calm the rain', col: 'action', text: 'Rain stops in a 20 ft radius around you until you end it (bonus action)' },
      { name: 'Turn the wind', col: 'bonus', text: 'Wind within 100 ft blows in a direction you choose until the end of your next turn' }] },
    "sorcerer:storm:Storm's Fury": { col: 'reaction', roll: '{sorcerer}', rollNote: 'lightning damage to the melee attacker', dc: 'spell', save: 'STR', text: 'On a failed STR save it’s pushed up to 20 ft away from you' },
    'sorcerer:storm:Wind Soul': { max: '1', reset: 'short', passive: { immune: ['lightning', 'thunder'], fly: 60 },
      use: R('Wind Soul (shared)', 600, { note: 'Your flying speed is 30 ft; up to {3+cha} creatures within 30 ft gain 30 ft flying speed for 1 hour' }), text: 'Up to {3+cha} creatures within 30 ft gain a 30 ft flying speed for 1 hour; yours drops to 30 ft' },

    // ---- Aberrant Mind ----
    'sorcerer:aberrantmind:Telepathic Speech': { col: 'bonus', text: 'Telepathic link with a creature within 30 ft for {sorcerer} minutes, while within {max(1,cha)} miles of each other' },
    'sorcerer:aberrantmind:Psionic Sorcery': { resource: true, acts: [1, 2, 3, 4, 5].map(L => ({ name: `${ORDN[L - 1]}-level psionic spell`, col: 'action', min: [0, 6, 6, 6, 7, 9][L], cost: SP(L), text: `Cast a ${ORDN[L - 1]}-level Psionic Spell with ${L} sorcery point${L > 1 ? 's' : ''}: no verbal or somatic components, no material unless consumed or costed (use the spell’s own casting time)` })) },
    'sorcerer:aberrantmind:Psychic Defenses': { passive: { resist: ['psychic'], advNote: 'Psychic Defenses: saves against being charmed or frightened' } },
    'sorcerer:aberrantmind:Revelation in Flesh': { resource: true, acts: [
      { name: 'See invisible', col: 'bonus', cost: SP(1), use: R('Revelation: See Invisible', 100, { note: 'See invisible creatures within 60 ft that aren’t behind total cover' }) },
      { name: 'Fly', col: 'bonus', cost: SP(1), use: R('Revelation: Flight', 100, { fly: 'walk', note: 'Hover' }) },
      { name: 'Aquatic', col: 'bonus', cost: SP(1), use: R('Revelation: Aquatic', 100, { note: 'Swimming speed = twice your walking speed; breathe water' }) },
      { name: 'Squeeze', col: 'bonus', cost: SP(1), use: R('Revelation: Slippery', 100, { note: 'Move through 1-inch spaces without squeezing; 5 ft of movement to escape nonmagical restraints or grapples' }) }] },
    'sorcerer:aberrantmind:Warping Implosion': { col: 'action', max: '1', reset: 'long', dc: 'spell', save: 'STR', roll: '3d10', rollNote: 'force (half on a save); failed save: pulled next to the space you left',
      text: 'Teleport to an unoccupied space within 120 ft; creatures within 30 ft of the space you left save',
      acts: [{ name: 'Restore (5 SP)', cost: SP(5), use: { regain: { from: 'Warping Implosion', n: 1 } } }] },

    // ---- Clockwork Soul ----
    'sorcerer:clockworksoul:Clockwork Magic': { none: true }, // clockwork spells come from the subclass spell list
    'sorcerer:clockworksoul:Restore Balance': { col: 'reaction', max: 'prof', reset: 'long', text: 'A creature within 60 ft is about to roll with advantage or disadvantage: cancel it' },
    'sorcerer:clockworksoul:Bastion of Law': { resource: true, acts: [1, 2, 3, 4, 5].map(n => ({ name: `Ward (${n} SP)`, col: 'action', cost: SP(n), text: `Ward a creature within 30 ft with ${n}d8: when it takes damage it can spend any of the dice, roll them and reduce the damage by the total. Lasts until your long rest or a new ward` })) },
    'sorcerer:clockworksoul:Trance of Order': { col: 'bonus', max: '1', reset: 'long',
      use: R('Trance of Order', 10, { note: 'Attacks against you can’t have advantage; your d20 attack rolls, checks and saves treat 9 or lower as 10' }),
      passive: ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(a => ({ effect: 'Trance of Order', minD20: { ab: a, value: 10 } })),
      acts: [{ name: 'Restore (5 SP)', cost: SP(5), use: { regain: { from: 'Trance of Order', n: 1 } } }] },
    'sorcerer:clockworksoul:Clockwork Cavalcade': { col: 'action', max: '1', reset: 'long', text: 'Spirits of order fill a 30 ft cube: restore up to 100 HP divided among creatures, repair damaged objects, and end spells of 6th level or lower on creatures and objects of your choice',
      acts: [{ name: 'Restore (7 SP)', cost: SP(7), use: { regain: { from: 'Clockwork Cavalcade', n: 1 } } }] }
  });
})();
