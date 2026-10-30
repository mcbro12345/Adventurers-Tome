// Feature automation: warlock, wizard and artificer (see tools/FX_SPEC.md).
(function () {
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  Object.assign(DND.featFx, {
    // ---- Warlock ----
    'warlock:Pact Magic': { none: true },
    'warlock:Eldritch Invocations': { none: true },
    'warlock:Pact Boon': { none: true },
    'warlock:Mystic Arcanum': { text: 'Cast your arcanum spells (6th, 7th at 13th, 8th at 15th, 9th at 17th) once each per long rest without a slot — add them on the Spells tab with a free use' },
    'warlock:Eldritch Master': { col: 'action', text: 'Entreat your patron for 1 minute: regain all expended Pact Magic slots', use: { effect: { name: 'Eldritch Master', rounds: 10, buff: { note: 'Pact slots return after 1 minute' } } } },
    // Archfey
    'warlock:archfey:Fey Presence': { col: 'action', dc: 'spell', save: 'WIS', text: 'Each creature in a 10 ft cube from you: charmed or frightened (your choice) until the end of your next turn' },
    'warlock:archfey:Misty Escape': { col: 'reaction', use: { cond: 'Invisible', condRounds: 1 }, text: 'When you take damage: turn invisible and teleport up to 60 ft (invisible until the start of your next turn, or until you attack or cast a spell)' },
    'warlock:archfey:Beguiling Defenses': { col: 'reaction', passive: { condImmune: ['Charmed'] }, dc: 'spell', save: 'WIS', text: 'When a creature tries to charm you: on a failed save it is charmed by you for 1 minute or until it takes damage' },
    // (concentration is noted only: a feature effect can't start concentration in the engine)
    'warlock:archfey:Dark Delirium': { col: 'action', dc: 'spell', save: 'WIS', use: R('Dark Delirium', 10, { note: 'Concentration (as on a spell): one creature within 60 ft is charmed or frightened in an illusory realm; ends early if it takes damage' }) },
    // Fiend
    "warlock:fiend:Dark One's Blessing": { use: { temp: '{max(1,cha+warlock)}' }, text: 'Use when you reduce a hostile creature to 0 HP' },
    "warlock:fiend:Dark One's Own Luck": { roll: '1d10', rollNote: 'added to your ability check or saving throw (after you see the roll, before the outcome)' },
    'warlock:fiend:Fiendish Resilience': { resource: true, trigger: 'longRest', triggerLabel: 'OK', triggerText: 'Fiendish Resilience: pick your resisted damage type again on the Features tab', text: 'Resistance to one damage type (damage from magical or silvered weapons ignores it) until you choose another after a short or long rest',
      acts: ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'].map(t => ({ name: t[0].toUpperCase() + t.slice(1), use: R('Fiendish Resilience', null, { resist: [t], note: 'Resistance to ' + t + ' damage' + (/^(bludgeoning|piercing|slashing)$/.test(t) ? ' (not from magical or silvered weapons)' : '') }) })) },
    'warlock:fiend:Hurl Through Hell': { roll: '10d10', rollNote: 'psychic when it returns at the end of your next turn (non-fiends only)', text: 'When you hit a creature with an attack: it vanishes through the lower planes until the end of your next turn' },
    // Great Old One
    'warlock:greatoldone:Awakened Mind': { passive: { sense: 'Telepathy 30 ft' }, text: 'Speak telepathically to a creature within 30 ft (it must understand a language)' },
    'warlock:greatoldone:Entropic Ward': { col: 'reaction', use: R('Entropic Ward', 1, { note: 'The attack has disadvantage. If it misses, tap “It missed”' }),
      acts: [{ name: 'It missed', onlyWhen: { effect: 'Entropic Ward' }, use: { endEffect: 'Entropic Ward', effect: { name: 'Entropic Ward: advantage', rounds: 2, buff: { atkAdvNext: 'Entropic Ward', note: 'Advantage on your next attack roll against that creature, during your next turn' } } } }] },
    'warlock:greatoldone:Thought Shield': { passive: { resist: ['psychic'], advNote: 'Thoughts can’t be read telepathically unless you allow it; whenever you take psychic damage, the creature that dealt it takes the same amount' } },
    'warlock:greatoldone:Create Thrall': { col: 'action', text: 'Touch an incapacitated humanoid: it is charmed by you until remove curse ends it, you dismiss it, or you use this again; you can talk telepathically on the same plane' },
    // Celestial
    'warlock:celestial:Bonus Cantrips': { spells: ['Light', 'Sacred Flame'] },
    'warlock:celestial:Healing Light': { col: 'bonus', pool: true, text: 'Heal a creature within 60 ft: spend up to your CHA modifier ({max(1,cha)}) dice at once',
      acts: [1, 2, 3, 4, 5].map(n => ({ name: n + 'd6', col: 'bonus', cost: { from: 'Healing Light', n }, roll: n + 'd6', rollNote: 'healing', healRoll: true })) },
    'warlock:celestial:Radiant Soul': { passive: { resist: ['radiant'], spellDmg: { types: ['radiant', 'fire'], bonus: 'cha' } }, text: 'Your CHA modifier is added to the damage of your radiant and fire spells (built in)' },
    'warlock:celestial:Celestial Resilience': { trigger: ['shortRest', 'longRest'], triggerText: 'Gain {warlock+cha} temporary HP; up to five allies gain {floor(warlock/2)+cha}', use: { temp: '{warlock+cha}' }, text: 'Up to five creatures you can see gain {floor(warlock/2)+cha} temporary HP' },
    'warlock:celestial:Searing Vengeance': { trigger: 'zero', triggerText: 'At the start of your turn, instead of a death save: regain half your HP, stand up, and burn and blind enemies within 30 ft', use: { healHalf: true, removeCond: ['Unconscious', 'Prone'] }, roll: '2d8+cha', rollNote: 'radiant to each creature of your choice within 30 ft (blinded until the end of the turn)' },
    // Hexblade
    "warlock:hexblade:Hexblade's Curse": { col: 'bonus', use: R("Hexblade's Curse", 10, { note: 'Against the cursed target: + your proficiency bonus to damage, crit on 19–20' }),
      acts: [
        { name: 'Cursed target died', onlyWhen: { effect: "Hexblade's Curse" }, use: { heal: '{max(1,warlock+cha)}', endEffect: "Hexblade's Curse" }, text: 'You regain warlock level + CHA HP' },
        { name: 'Move the curse', min: 14, onlyWhen: { effect: "Hexblade's Curse" }, use: R("Hexblade's Curse", 10, { note: 'Against the cursed target: + your proficiency bonus to damage, crit on 19–20' }), text: 'Master of Hexes: the curse moves to a creature within 30 ft (no healing from the first one’s death)' }] },
    'warlock:hexblade:Hex Warrior': { text: 'Use CHA instead of STR or DEX for attacks with your bonded weapon or pact weapon (set that attack’s ability to CHA in Inventory/Attacks)' },
    'warlock:hexblade:Accursed Specter': { col: 'action', text: 'Raise a humanoid you slew as a specter (temp HP = {floor(warlock/2)}; +{max(0,cha)} to its attack rolls) until your next long rest' },
    'warlock:hexblade:Armor of Hexes': { col: 'reaction', onlyWhen: { effect: "Hexblade's Curse" }, roll: '1d6', rollNote: '(4 or higher: the cursed target’s attack misses)' },
    'warlock:hexblade:Master of Hexes': { text: 'When the target of your Hexblade’s Curse dies, move the curse to another creature within 30 ft (use “Move the curse” on Hexblade’s Curse)' },
    // Fathomless
    'warlock:fathomless:Tentacle of the Deeps': { col: 'bonus', resource: true, dc: false,
      acts: [
        { name: 'Summon & attack', col: 'bonus', cost: true, atk: 'spell', roll: '{tier(warlock,1,1,10,2)}d8', rollNote: 'cold damage; its speed −10 ft until the start of your next turn', use: R('Tentacle of the Deeps', 10, { note: '10-ft tentacle within 60 ft; bonus action: move it 30 ft and attack again' }) },
        { name: 'Tentacle attack', col: 'bonus', onlyWhen: { effect: 'Tentacle of the Deeps' }, atk: 'spell', roll: '{tier(warlock,1,1,10,2)}d8', rollNote: 'cold damage; its speed −10 ft until the start of your next turn' }] },
    'warlock:fathomless:Gift of the Sea': { passive: { swim: 40, advNote: 'You can breathe underwater' } },
    'warlock:fathomless:Oceanic Soul': { passive: { resist: ['cold'], advNote: 'Fully submerged creatures understand your speech, and you theirs' } },
    'warlock:fathomless:Guardian Coil': { col: 'reaction', onlyWhen: { effect: 'Tentacle of the Deeps' }, roll: '{tier(warlock,6,1,10,2)}d8', rollNote: 'less damage for you or a creature within 10 ft of the tentacle' },
    'warlock:fathomless:Grasping Tentacles': { spells: ["Evard's Black Tentacles"], once: true, spellNote: 'Once per long rest without a slot; damage can’t break this concentration', use: { temp: 'warlock' }, text: 'Every time you cast evard’s black tentacles you gain {warlock} temporary HP' },
    'warlock:fathomless:Fathomless Plunge': { col: 'action', text: 'Teleport yourself and up to five willing creatures within 30 ft to a body of water within 1 mile (or one you’ve seen)' },
    // Genie (pick your kind under Choices: resistance, Wrath damage type, extra expanded spells)
    "warlock:genie:Genie's Vessel": { resource: true, text: 'Vessel: AC equal to your spell save DC, {warlock+prof} HP, immune to poison and psychic; a spellcasting focus',
      acts: [
        { name: 'Bottled Respite', col: 'action', cost: true, use: R('Bottled Respite', null, { note: 'Inside your vessel for up to twice your proficiency bonus in hours; leave as a bonus action' }) },
        { name: "Genie's Wrath", roll: '{prof}', rollNote: 'extra damage of your genie’s type (once per turn, on an attack hit)' }] },
    'warlock:genie:Elemental Gift': { col: 'bonus', use: R('Elemental Gift', 100, { fly: 30, note: 'Flying speed 30 ft, can hover' }) },
    'warlock:genie:Sanctuary Vessel': { text: 'Up to five willing creatures within 30 ft can join you in the vessel; a 10-minute rest there counts as a short rest, and anyone spending Hit Dice there adds {prof} HP' },
    'warlock:genie:Limited Wish': { col: 'action', text: 'Duplicate a spell of 6th level or lower from any class list with a casting time of 1 action, no components; usable again after 1d4 long rests (reset the counter by hand)' },
    // Undying
    'warlock:undying:Among the Dead': { spells: ['Spare the Dying'], passive: { advNote: 'Saves against disease; undead must make a WIS save to attack you (fail: pick another target)' } },
    'warlock:undying:Defy Death': { roll: '1d8+max(1,con)', healRoll: true, rollNote: 'healing when you succeed on a death save or stabilize someone with spare the dying' },
    'warlock:undying:Undying Nature': { none: true },
    'warlock:undying:Indestructible Life': { col: 'bonus', roll: '1d8+warlock', healRoll: true, rollNote: 'healing (and reattach severed parts)' },
    // Undead
    'warlock:undead:Form of Dread': { col: 'bonus', dc: 'spell', save: 'WIS', use: Object.assign(R('Form of Dread', 10, { note: 'Immune to frightened; once per turn an attack hit can frighten the target until the end of your next turn (WIS save)' }), { temp: '1d10+warlock', removeCond: ['Frightened'] }), passive: { effect: 'Form of Dread', condImmune: ['Frightened'] } },
    'warlock:undead:Grave Touched': { passive: { advNote: 'Once per turn, change an attack’s damage to necrotic; in Form of Dread add one extra damage die' } },
    'warlock:undead:Necrotic Husk': { passive: [{ resist: ['necrotic'] }, { effect: 'Form of Dread', immune: ['necrotic'] }], trigger: 'zero', triggerText: 'Drop to 1 HP instead; creatures of your choice within 30 ft take 2d10 + warlock level necrotic (you gain a level of exhaustion)', use: { setHp: 1, removeCond: ['Unconscious'], exhaustion: 1 }, roll: '2d10+warlock', rollNote: 'necrotic to each creature of your choice within 30 ft' },
    // (concentration is noted only: a feature effect can't start concentration in the engine)
    'warlock:undead:Spirit Projection': { col: 'action', use: R('Spirit Projection', 600, { fly: 'walk', note: 'Concentration. Spirit: resistance to bludgeoning, piercing and slashing; conjuration/necromancy spells need no V/S or cheap M components; necromancy spell damage heals you half' }), passive: { effect: 'Spirit Projection', resist: ['bludgeoning', 'piercing', 'slashing'] } },
    // ---- Wizard ----
    'wizard:Spellcasting': { none: true },
    'wizard:Arcane Recovery': { use: { recoverSlots: { total: 'ceil(wizard/2)', maxLevel: 5 } }, text: 'During a short rest: recover slots totaling half your wizard level (none 6th or higher)', trigger: 'shortRest', triggerText: 'Recover spell slots with Arcane Recovery?' },
    'wizard:Spell Mastery': { text: 'Your chosen 1st- and 2nd-level spells can be cast at their lowest level without a slot (mark them on the Spells tab)' },
    'wizard:Signature Spells': { text: 'Your two 3rd-level signature spells are always prepared and each castable once at 3rd level without a slot per short or long rest' },
    // Abjuration
    'wizard:abjuration:Abjuration Savant': { none: true },
    'wizard:abjuration:Arcane Ward': { pool: true, text: 'The ward (made when you first cast an abjuration spell of 1st level or higher after a long rest) takes damage before you. Casting an abjuration spell of 1st level or higher restores twice the spell level',
      acts: [[1, 2], [2, 3], [3, 5], [4, 7], [5, 9], [6, 11], [7, 13], [8, 15], [9, 17]].map(([L, lv]) => ({ name: '+' + 2 * L + ' (' + ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'][L - 1] + ')', min: lv, use: { regain: { from: 'Arcane Ward', n: 2 * L } }, text: 'Cast a ' + ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'][L - 1] + '-level abjuration spell: the ward regains ' + 2 * L + ' HP' })) },
    'wizard:abjuration:Projected Ward': { col: 'reaction', text: 'When a creature within 30 ft takes damage, your Arcane Ward absorbs it (lower the ward’s pool by the damage it takes)' },
    'wizard:abjuration:Improved Abjuration': { passive: { advNote: 'Add your proficiency bonus to ability checks made as part of abjuration spells (counterspell, dispel magic)' } },
    'wizard:abjuration:Spell Resistance': { passive: { resist: ['damage from spells'], advNote: 'Saving throws against spells' } },
    // Conjuration
    'wizard:conjuration:Conjuration Savant': { none: true },
    'wizard:conjuration:Minor Conjuration': { col: 'action', text: 'Conjure a nonmagical object up to 3 ft on a side and 10 lb within 10 ft for 1 hour (it vanishes if it takes damage)' },
    'wizard:conjuration:Benign Transposition': { col: 'action', text: 'Teleport up to 30 ft, or swap places with a willing Small or Medium creature within 30 ft; regained after a long rest or when you cast a conjuration spell of 1st level or higher' },
    'wizard:conjuration:Focused Conjuration': { passive: { advNote: 'Concentration on conjuration spells can’t be broken by taking damage' } },
    'wizard:conjuration:Durable Summons': { text: 'Creatures you summon or create with conjuration spells have 30 temporary HP' },
    // Divination: the pool is your Portent dice still unspent today
    'wizard:divination:Divination Savant': { none: true },
    'wizard:divination:Portent': { pool: true, trigger: 'longRest', triggerLabel: 'Roll them', triggerText: 'Roll your Portent dice for today', roll: '{tier(wizard,2,2,14,3)}d20', rollNote: 'Portent dice — write them down; spend one with “Use a Portent die”',
      acts: [{ name: 'Use a Portent die', cost: true, text: 'Replace an attack roll, saving throw or ability check made by you or a creature you can see with a Portent die (before the roll)' }] },
    'wizard:divination:Expert Divination': { text: 'Casting a divination spell of 2nd level or higher regains one expended slot of a lower level (max 5th) — pick just one slot',
      acts: [[2, 3], [3, 5], [4, 7], [5, 9], [6, 11]].map(([L, lv]) => ({ name: 'Cast ' + ['', '', '2nd', '3rd', '4th', '5th', '6th+'][L], min: lv, use: { recoverSlots: { total: String(Math.min(5, L - 1)), maxLevel: Math.min(5, L - 1) } } })) },
    'wizard:divination:The Third Eye': { col: 'action', resource: true, acts: [
      { name: 'Darkvision 60 ft', col: 'action', cost: true, use: R('The Third Eye', null, { darkvision: 60, note: 'Darkvision 60 ft until you are incapacitated or rest' }) },
      { name: 'Ethereal Sight', col: 'action', cost: true, use: R('The Third Eye', null, { note: 'See into the Ethereal Plane within 60 ft until you are incapacitated or rest' }) },
      { name: 'Greater Comprehension', col: 'action', cost: true, use: R('The Third Eye', null, { note: 'Read any language until you are incapacitated or rest' }) },
      { name: 'See Invisibility', col: 'action', cost: true, use: R('The Third Eye', null, { note: 'See invisible creatures and objects within 10 ft in your line of sight until you are incapacitated or rest' }) }] },
    'wizard:divination:Greater Portent': { none: true }, // Portent's die count already scales to 3 at 14th
    // Enchantment
    'wizard:enchantment:Enchantment Savant': { none: true },
    'wizard:enchantment:Hypnotic Gaze': { col: 'action', dc: 'spell', save: 'WIS', text: 'A creature within 5 ft that can see or hear you: charmed, incapacitated and speed 0 until the end of your next turn; extend it with your action each turn' },
    'wizard:enchantment:Instinctive Charm': { col: 'reaction', dc: 'spell', save: 'WIS', text: 'Divert an attack against you to the creature closest to the attacker (not you or itself)' },
    'wizard:enchantment:Split Enchantment': { text: 'Enchantment spells that target one creature can target a second' },
    'wizard:enchantment:Alter Memories': { dc: 'spell', save: 'INT', text: 'A creature charmed by your spell doesn’t know it was charmed; before the spell ends it can forget up to {1+max(0,cha)} hours (INT save)' },
    // Evocation
    'wizard:evocation:Evocation Savant': { none: true },
    'wizard:evocation:Sculpt Spells': { text: 'Choose 1 + the spell’s level creatures to automatically succeed and take no damage from your evocation spell' },
    'wizard:evocation:Potent Cantrip': { passive: { advNote: 'Creatures that save against your cantrips still take half damage' } },
    'wizard:evocation:Empowered Evocation': { passive: { advNote: 'Add your INT modifier to one damage roll of your wizard evocation spells' } },
    'wizard:evocation:Overchannel': { max: '1', reset: 'long', text: 'Use = the free use: deal maximum damage with a 1st–5th level wizard spell. Each later use before a long rest: roll the backlash below (2d12 necrotic per spell level, +1d12 per level for each use after the second)',
      acts: [1, 2, 3, 4, 5].map(L => ({ name: 'Backlash (' + ['1st', '2nd', '3rd', '4th', '5th'][L - 1] + ')', roll: 2 * L + 'd12', rollNote: 'necrotic to you (ignores resistance and immunity)' })) },
    // Illusion
    'wizard:illusion:Illusion Savant': { none: true },
    'wizard:illusion:Improved Minor Illusion': { spells: ['Minor Illusion'], text: 'Your minor illusion can create a sound and an image with a single casting' },
    'wizard:illusion:Malleable Illusions': { col: 'action', text: 'Change the nature of an illusion spell you cast (duration 1 minute or longer) that you can see' },
    'wizard:illusion:Illusory Self': { col: 'reaction', text: 'An illusory duplicate makes the attack automatically miss' },
    'wizard:illusion:Illusory Reality': { col: 'bonus', text: 'One inanimate, nonmagical object in your illusion spell (1st level or higher) becomes real for 1 minute (it can’t deal damage)' },
    // Necromancy
    'wizard:necromancy:Necromancy Savant': { none: true },
    'wizard:necromancy:Grim Harvest': { text: 'When a spell of 1st level or higher kills a creature (not a construct or undead), regain 2 × the spell’s level HP (3 × for necromancy spells) — once per turn' },
    'wizard:necromancy:Undead Thralls': { spells: ['Animate Dead'], spellNote: 'Added to your spellbook', passive: { advNote: 'Animate dead raises one extra undead; your undead get + your wizard level to max HP and + your proficiency bonus to weapon damage' } },
    'wizard:necromancy:Inured to Undeath': { passive: { resist: ['necrotic'], advNote: 'Your HP maximum can’t be reduced' } },
    'wizard:necromancy:Command Undead': { col: 'action', dc: 'spell', save: 'CHA', text: 'An undead within 60 ft becomes friendly and obeys you (INT 8+: advantage on the save; INT 12+: repeats the save every hour)' },
    // Transmutation (long rests clear effects: pick the stone's benefit again)
    'wizard:transmutation:Transmutation Savant': { none: true },
    'wizard:transmutation:Minor Alchemy': { text: 'Over 10 minutes, change one material (wood, stone, iron, copper, silver) of an object for 1 hour' },
    "wizard:transmutation:Transmuter's Stone": { resource: true, trigger: 'longRest', triggerLabel: 'OK', triggerText: 'Transmuter’s Stone: pick its benefit again on the Features tab', text: 'Whoever carries your stone gets one benefit; change it when you cast a transmutation spell of 1st level or higher',
      acts: [{ name: 'Darkvision', use: R("Transmuter's Stone", null, { darkvision: 60, note: 'Darkvision 60 ft' }) },
        { name: '+10 ft speed', use: R("Transmuter's Stone", null, { speed: 10, note: '+10 ft speed while unencumbered' }) },
        { name: 'CON saves', use: R("Transmuter's Stone", null, { note: 'Proficiency in CON saving throws' }) }].concat(['acid', 'cold', 'fire', 'lightning', 'thunder'].map(t => ({ name: t[0].toUpperCase() + t.slice(1) + ' resistance', use: R("Transmuter's Stone", null, { resist: [t], note: 'Resistance to ' + t + ' damage' }) }))) },
    'wizard:transmutation:Shapechanger': { spells: ['Polymorph'], spellNote: 'Added to your spellbook. Use Shapechanger to cast it on yourself without a slot (beast of CR 1 or lower), once per short rest', text: 'Cast polymorph on yourself without a slot, becoming a beast of CR 1 or lower' },
    'wizard:transmutation:Master Transmuter': { col: 'action', resource: true, text: 'Destroy your Transmuter’s Stone for one effect (make a new stone after)', acts: [
      { name: 'Major Transformation', col: 'action', text: '10 minutes: transmute one nonmagical object up to a 5-ft cube into another nonmagical object of similar size and mass, of equal or lesser value' },
      { name: 'Panacea', col: 'action', use: { healFull: true, removeCond: ['Poisoned', 'Diseased'] }, text: 'A creature touching the stone: all curses, diseases and poisons end and it regains all HP' },
      { name: 'Restore Life', col: 'action', text: 'Cast raise dead on a creature touching the stone, without a slot or the spell in your book' },
      { name: 'Restore Youth', col: 'action', text: 'A willing creature’s apparent age drops by 3d10 years (minimum 13)' }] },
    // War Magic
    'wizard:warmagic:Arcane Deflection': { col: 'reaction', resource: true, acts: [
      { name: '+2 AC', col: 'reaction', use: R('Arcane Deflection', 1, { ac: 2, note: 'Against the triggering attack. Only cantrips until the end of your next turn' }) },
      { name: '+4 to a save', col: 'reaction', use: R('Arcane Deflection', 1, { note: 'Only cantrips until the end of your next turn' }), text: 'Add 4 to the saving throw you just failed' }] },
    'wizard:warmagic:Tactical Wit': { none: true }, // +INT to initiative is built into the initiative bonus
    'wizard:warmagic:Power Surge': { roll: '{floor(wizard/2)}', rollNote: 'extra force damage (once per turn, with a wizard spell)', text: 'After a long rest you have exactly one surge (set the counter by hand); a short rest with none gives one',
      acts: [{ name: 'Gain a surge', use: { regain: { from: 'Power Surge', n: 1 } }, text: 'You ended a spell with dispel magic or counterspell' }] },
    'wizard:warmagic:Durable Magic': { passive: { when: 'conc', ac: 2, saveAll: 2 } },
    'wizard:warmagic:Deflecting Shroud': { roll: '{floor(wizard/2)}', rollNote: 'force damage to up to three creatures within 60 ft when you use Arcane Deflection' },
    // Bladesinging (no "light armor only" condition in the engine: medium armor isn't blocked)
    'wizard:bladesinging:Training in War and Song': { passive: { skillProf: ['Performance'] } },
    'wizard:bladesinging:Bladesong': { col: 'bonus', onlyWhen: { armor: 'light', shield: false }, use: R('Bladesong', 10, { ac: 'max(1,int)', speed: 10, note: 'Advantage on Acrobatics; + your INT modifier (min 1) to CON saves to keep concentration. Ends if incapacitated, in medium or heavy armor, with a shield, or attacking two-handed' }), passive: { effect: 'Bladesong', skillAdv: ['Acrobatics'] } },
    'wizard:bladesinging:Extra Attack': { none: true },
    'wizard:bladesinging:Song of Defense': { col: 'reaction', onlyWhen: { effect: 'Bladesong' }, text: 'When you take damage: expend a spell slot to reduce the damage by 5 × the slot level' },
    'wizard:bladesinging:Song of Victory': { passive: { effect: 'Bladesong', meleeDmg: 'max(1,int)' } },
    // Scribes
    'wizard:scribes:Wizardly Quill': { col: 'bonus', text: 'Create a Tiny spectral quill: a spellcasting focus that writes without ink; copying a spell takes 2 minutes per spell level' },
    'wizard:scribes:Awakened Spellbook': { max: '1', reset: 'long', text: 'Use = cast a wizard ritual at its normal casting time. Your book is a focus; a spell cast with a slot can swap its damage type for one from another spell of that level in your book' },
    'wizard:scribes:Manifest Mind': { col: 'bonus', resource: true, text: 'Manifesting is once per long rest (or spend a spell slot); casting through it uses the counter ({prof} per long rest)',
      acts: [{ name: 'Manifest', col: 'bonus', use: R('Manifest Mind', null, { note: 'Spectral mind within 60 ft (darkvision 60 ft, dim light 10 ft); bonus action to move it 30 ft' }) },
        { name: 'Cast through it', cost: true, onlyWhen: { effect: 'Manifest Mind' }, text: 'Cast a wizard spell with a slot as if you were in the mind’s space' },
        { name: 'Dismiss', col: 'bonus', onlyWhen: { effect: 'Manifest Mind' }, use: { endEffect: 'Manifest Mind' } }] },
    'wizard:scribes:Master Scrivener': { trigger: 'longRest', triggerText: 'Create a scroll of a 1st- or 2nd-level spell from your book (cast one level higher)', text: 'The scroll casts the spell one level higher and can only be read by you; it disappears after your next long rest' },
    'wizard:scribes:One with the Word': { col: 'reaction', max: '1', reset: 'long', onlyWhen: { effect: 'Manifest Mind' }, use: { endEffect: 'Manifest Mind' }, passive: { skillAdv: ['Arcana'] }, text: 'When you take damage while your spellbook’s mind is manifested: dismiss it and prevent all of that damage. Your book loses spells (3d6 spell levels; not enough = you drop to 0 HP) for 1d6 long rests', roll: '3d6', rollNote: 'spell levels that vanish from your book' },
    // ---- Artificer ----
    'artificer:Magical Tinkering': { col: 'action' },
    'artificer:Spellcasting': { none: true },
    'artificer:Infuse Item': { trigger: 'longRest', triggerText: 'Re-infuse your items', triggerLabel: 'Open Infusions', target: 'infusetab', useLabel: 'Open Infusions' },
    'artificer:The Right Tool for the Job': { use: { rtj: true }, text: '1 hour of work (can be during a short or long rest), with thieves\' or artisan\'s tools in hand' },
    'artificer:Tool Expertise': { passive: { advNote: 'Double your proficiency bonus for checks with tools you’re proficient in' } },
    'artificer:Flash of Genius': { col: 'reaction', roll: 'max(1,int)', rollNote: 'added to a creature’s check or save within 30 ft' },
    'artificer:Magic Item Adept': { none: true },
    'artificer:Spell-Storing Item': { target: 'spellstore', useLabel: 'Store a spell', trigger: 'longRest', triggerLabel: 'Store a spell', triggerText: 'Store a 1st- or 2nd-level artificer spell (1 action to cast) in a weapon or focus — usable 2 × INT times', text: 'Anyone holding it can cast the stored spell with your DC and attack bonus' },
    'artificer:Magic Item Savant': { none: true },
    'artificer:Magic Item Master': { none: true },
    'artificer:Soul of Artifice': { passive: { saveAll: 'attuned' }, trigger: 'zero', triggerText: 'End one of your infusions to drop to 1 HP instead', use: { setHp: 1, removeCond: ['Unconscious'] } },
    // Alchemist
    'artificer:alchemist:Tool Proficiency': { none: true },
    'artificer:alchemist:Experimental Elixir': { slotRestore: 1, trigger: 'longRest', triggerLabel: 'Make one', triggerText: 'Create your Experimental Elixirs (one roll per use)', roll: '1d6', rollNote: '1 healing · 2 swiftness · 3 resilience · 4 boldness · 5 flight · 6 transformation', text: 'Out of free elixirs? Spend a spell slot to make another and choose its effect',
      acts: [
        { name: 'Drink: Healing', col: 'action', use: { heal: '2d4+int' } },
        { name: 'Drink: Swiftness', col: 'action', use: R('Elixir: Swiftness', 600, { speed: 10, note: '+10 ft walking speed for 1 hour' }) },
        { name: 'Drink: Resilience', col: 'action', use: R('Elixir: Resilience', 100, { ac: 1, note: '+1 AC for 10 minutes' }) },
        { name: 'Drink: Boldness', col: 'action', use: R('Elixir: Boldness', 10, { note: 'Add 1d4 to every attack roll and saving throw for 1 minute' }) },
        { name: 'Drink: Flight', col: 'action', use: R('Elixir: Flight', 100, { fly: 10, note: 'Flying speed 10 ft for 10 minutes' }) },
        { name: 'Drink: Transformation', col: 'action', use: R('Elixir: Transformation', 100, { note: 'Body changed as by alter self for 10 minutes' }) }] },
    'artificer:alchemist:Alchemical Savant': { passive: { advNote: '+ your INT modifier (min 1) to one healing, acid, fire, necrotic or poison roll of spells cast with alchemist’s supplies' } },
    'artificer:alchemist:Restorative Reagents': { spells: ['Lesser Restoration'], spellNote: 'Use Restorative Reagents to cast it without a slot (INT modifier times per long rest, min 1)', text: 'Use = cast lesser restoration without a slot, with alchemist’s supplies as the focus. Whoever drinks one of your elixirs also gains 2d6 + INT temporary HP',
      acts: [{ name: 'Elixir temp HP', use: { temp: '2d6+{max(1,int)}' }, text: 'You drank one of your experimental elixirs' }] },
    'artificer:alchemist:Chemical Mastery': { passive: { resist: ['acid', 'poison'], condImmune: ['Poisoned'] }, spells: ['Greater Restoration', 'Heal'], once: true, spellNote: 'Once each per long rest without a slot or material components (alchemist’s supplies as focus)' },
    // Armorer (the Guardian / Infiltrator option carries the armor's weapon, Defensive Field and Perfected Armor parts)
    'artificer:armorer:Tools of the Trade': { none: true },
    'artificer:armorer:Arcane Armor': { text: 'Your armor ignores STR requirements, is a spellcasting focus, covers you completely and can’t be removed against your will; donning or doffing it takes an action' },
    'artificer:armorer:Armor Model': { text: 'Your chosen model (Guardian or Infiltrator) is under Choices; its weapon is in Attacks. You can switch models after a short or long rest with smith’s tools' },
    'artificer:armorer:Extra Attack': { none: true },
    'artificer:armorer:Armor Modifications': { text: 'Your armor counts as four items for infusions (armor, boots, helmet, special weapon); you can infuse two more items, which must be part of the armor' },
    'artificer:armorer:Perfected Armor': { text: 'Guardian: reaction pull (button on your Guardian model, {prof} per long rest). Infiltrator: Lightning Launcher targets glow — disadvantage attacking you, next attack against them has advantage and +1d6 lightning' },
    // Artillerist
    'artificer:artillerist:Tool Proficiency': { none: true },
    'artificer:artillerist:Eldritch Cannon': { col: 'action', slotRestore: 1, acts: [
      { name: 'Flamethrower', col: 'bonus', onlyWhen: { companion: 'Eldritch Cannon' }, roll: '{tier(artificer,3,2,9,3)}d8', rollNote: 'fire in a 15 ft cone (DEX half); ignites unattended flammable objects', dc: 'spell', save: 'DEX' },
      { name: 'Force Ballista', col: 'bonus', onlyWhen: { companion: 'Eldritch Cannon' }, atk: 'spell', roll: '{tier(artificer,3,2,9,3)}d8', rollNote: 'force damage — on a hit the target is pushed up to 5 ft away (ranged spell attack, 120 ft)' },
      { name: 'Protector', col: 'bonus', onlyWhen: { companion: 'Eldritch Cannon' }, roll: '1d8+max(1,int)', rollNote: 'temporary HP to each creature of your choice within 10 ft of the cannon' }] },
    'artificer:artillerist:Arcane Firearm': { roll: '1d8', rollNote: 'added to one damage roll of an artificer spell cast through your arcane firearm' },
    'artificer:artillerist:Explosive Cannon': { col: 'action', onlyWhen: { companion: 'Eldritch Cannon' }, dc: 'spell', save: 'DEX', roll: '3d8', rollNote: 'force to each creature within 20 ft of the cannon (DEX half)', use: { dismiss: 'Eldritch Cannon' }, text: 'Detonate a cannon within 60 ft (it is destroyed). Your cannons’ damage rolls are already +1d8' },
    'artificer:artillerist:Fortified Position': { passive: { advNote: 'You and allies within 10 ft of your cannon have half cover; you can have two cannons, and one bonus action activates both' } },
    // Battle Smith
    'artificer:battlesmith:Tool Proficiency': { none: true },
    'artificer:battlesmith:Battle Ready': { text: 'Attacks with magic weapons (infused ones included) use INT when it beats STR/DEX — the sheet does this for you' },
    'artificer:battlesmith:Steel Defender': { text: 'Your Steel Defender is on the Creatures tab; command it with a bonus action. Deflect Attack (its reaction) imposes disadvantage on an attack' },
    'artificer:battlesmith:Extra Attack': { none: true },
    'artificer:battlesmith:Arcane Jolt': { roll: '{tier(artificer,9,2,15,4)}d6', rollNote: 'force damage to the target, or healing to a creature within 30 ft of it (once per turn, on a magic weapon or Steel Defender hit)' },
    'artificer:battlesmith:Improved Defender': { text: 'Arcane Jolt is 4d6; your defender gets +2 AC and its Deflect Attack deals 1d4 + {int} force to the attacker' }
  });
  // Option entries: Armorer models (merged into the base entries) and the Genie's patron kind (a new subclass choice).
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  setOpt('armorModel', 'Guardian', { max: 'prof', reset: 'long', resource: true, acts: [
    { name: 'Defensive Field', col: 'bonus', cost: true, use: { temp: 'artificer' }, text: 'Temporary HP equal to your artificer level (lost if you doff the armor)' },
    { name: 'Perfected Armor: pull', col: 'reaction', min: 15, dc: 'spell', save: 'STR', text: 'A Huge or smaller creature ending its turn within 30 ft is pulled up to 30 ft toward you; if it ends within 5 ft, make a melee weapon attack as part of this reaction ({prof} per long rest)' }] });
  setOpt('armorModel', 'Infiltrator', { passive: [{ speed: 5, skillAdv: ['Stealth'] }, { min: 15, advNote: 'Lightning Launcher: a creature you damage glows — it has disadvantage attacking you, and the next attack against it has advantage and +1d6 lightning' }] });
  const GK = [['Dao', 'bludgeoning', 'sanctuary, spike growth, meld into stone, stone shape, wall of stone'], ['Djinni', 'thunder', 'thunderwave, gust of wind, wind wall, greater invisibility, seeming'],
    ['Efreeti', 'fire', 'burning hands, scorching ray, fireball, fire shield, flame strike'], ['Marid', 'cold', 'fog cloud, blur, sleet storm, control water, cone of cold']];
  DND.options.genieKind = { label: 'Genie Kind', list: GK.map(([n, t, sp]) => [n, `Genie’s Wrath and Elemental Gift: ${t}. Extra expanded spells: ${sp}.`, 'The Genie',
    { passive: [{ advNote: `Genie’s Wrath: once per turn, +prof ${t} damage on an attack hit` }, { min: 6, resist: [t] }] }]) };
  const gs = DND.classes.warlock && DND.classes.warlock.subclasses.genie;
  if (gs && !(gs.choices || []).some(c => c.type === 'genieKind')) gs.choices = (gs.choices || []).concat([{ level: 1, type: 'genieKind', n: 1 }]);
})();
