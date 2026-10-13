// Class option lists: [name, summary, prerequisite/notes]
DND.options = {
  fightingStyle: { label: 'Fighting Style', list: [
    ['Archery', '+2 to attack rolls with ranged weapons.', 'Fighter, Ranger', { rangedAtk: 2 }],
    ['Blind Fighting', 'Blindsight 10 ft.', 'Fighter, Paladin, Ranger (TCE)'],
    ['Defense', '+1 AC while wearing armor.', 'Fighter, Paladin, Ranger', { armorAC: 1 }],
    ['Dueling', '+2 damage with a one-handed melee weapon and no other weapon.', 'Fighter, Paladin, Ranger'],
    ['Great Weapon Fighting', 'Reroll 1s and 2s on damage dice with two-handed melee weapons.', 'Fighter, Paladin'],
    ['Interception', 'Reaction: reduce damage to a nearby ally by 1d10 + prof.', 'Fighter, Paladin (TCE)'],
    ['Protection', 'Reaction with a shield: impose disadvantage on an attack against an adjacent ally.', 'Fighter, Paladin'],
    ['Superior Technique', 'Learn one maneuver and gain one d6 superiority die.', 'Fighter (TCE)'],
    ['Thrown Weapon Fighting', 'Draw thrown weapons freely; +2 damage with them.', 'Fighter, Ranger (TCE)'],
    ['Two-Weapon Fighting', 'Add ability modifier to the off-hand attack damage.', 'Fighter, Ranger'],
    ['Unarmed Fighting', 'Unarmed strikes deal 1d6 (1d8 two-handed); grappled creatures take 1d4.', 'Fighter (TCE)'],
    ['Blessed Warrior', 'Learn two cleric cantrips (CHA).', 'Paladin (TCE)'],
    ['Druidic Warrior', 'Learn two druid cantrips (WIS).', 'Ranger (TCE)']] },
  maneuver: { label: 'Maneuver', list: [
    ['Ambush', 'Add a superiority die to Stealth or initiative.', 'TCE'], ['Bait and Switch', 'Swap places with an ally; one of you gains AC.', 'TCE'],
    ["Brace", 'Reaction attack when a creature moves into your reach.', 'TCE'], ["Commander's Strike", 'Give up an attack so an ally can attack with its reaction.', ''],
    ['Commanding Presence', 'Add a die to Intimidation, Performance or Persuasion.', 'TCE'], ['Disarming Attack', 'Add damage; target drops an item (STR save).', ''],
    ['Distracting Strike', 'Add damage; next ally attack on the target has advantage.', ''], ['Evasive Footwork', 'Add the die to AC while moving.', ''],
    ['Feinting Attack', 'Bonus action: advantage on next attack, add die to damage.', ''], ['Goading Attack', 'Add damage; target has disadvantage attacking others (WIS save).', ''],
    ['Grappling Strike', 'After a hit, grapple as a bonus action with the die added.', 'TCE'], ['Lunging Attack', '+5 ft reach for one attack, add die to damage.', ''],
    ['Maneuvering Attack', 'Add damage; an ally can move half speed without provoking.', ''], ['Menacing Attack', 'Add damage; frighten the target (WIS save).', ''],
    ['Parry', 'Reaction: reduce melee damage by die + DEX.', ''], ['Precision Attack', 'Add the die to an attack roll.', ''],
    ['Pushing Attack', 'Add damage; push Large or smaller 15 ft (STR save).', ''], ['Quick Toss', 'Bonus action thrown attack adding the die.', 'TCE'],
    ['Rally', 'Bonus action: ally gains temp HP equal to die + CHA.', ''], ['Riposte', 'Reaction attack when a creature misses you, add die.', ''],
    ['Sweeping Attack', 'Deal the die to a second adjacent creature.', ''], ['Tactical Assessment', 'Add the die to Investigation, History or Insight.', 'TCE'],
    ['Trip Attack', 'Add damage; knock Large or smaller prone (STR save).', '']] },
  metamagic: { label: 'Metamagic', list: [
    ['Careful Spell', '1 SP: chosen creatures auto-succeed on the spell\'s save.', ''], ['Distant Spell', '1 SP: double range (touch becomes 30 ft).', ''],
    ['Empowered Spell', '1 SP: reroll up to CHA mod damage dice.', ''], ['Extended Spell', '1 SP: double duration (max 24 h).', ''],
    ['Heightened Spell', '3 SP: one target has disadvantage on its first save.', ''], ['Quickened Spell', '2 SP: cast a 1-action spell as a bonus action.', ''],
    ['Seeking Spell', '2 SP: reroll a missed spell attack.', 'TCE'], ['Subtle Spell', '1 SP: no verbal or somatic components.', ''],
    ['Transmuted Spell', '1 SP: change acid/cold/fire/lightning/poison/thunder damage to another of those.', 'TCE'], ['Twinned Spell', 'SP = spell level: target a second creature with a single-target spell.', '']] },
  pactBoon: { label: 'Pact Boon', list: [
    ['Pact of the Blade', 'Summon a pact weapon you are proficient with; bond magic weapons.', ''],
    ['Pact of the Chain', 'Find familiar with special forms (imp, pseudodragon, quasit, sprite); it can attack with your reaction.', ''],
    ['Pact of the Tome', 'Book of Shadows with three cantrips from any class.', ''],
    ['Pact of the Talisman', 'An amulet that adds 1d4 to failed ability checks (prof-bonus times per long rest).', 'TCE']] },
  invocation: { label: 'Eldritch Invocation', list: [
    ['Agonizing Blast', 'Add CHA mod to eldritch blast damage.', 'Eldritch blast'], ['Armor of Shadows', 'Cast mage armor on yourself at will.', ''],
    ['Ascendant Step', 'Cast levitate on yourself at will.', '9th level'], ['Aspect of the Moon', "No sleep needed; rest by light activity.", 'Tome'],
    ['Beast Speech', 'Cast speak with animals at will.', ''], ['Beguiling Influence', 'Proficiency in Deception and Persuasion.', ''],
    ['Bewitching Whispers', 'Cast compulsion once per long rest with a pact slot.', '7th level'], ['Bond of the Talisman', 'Teleport to the talisman wearer.', '12th level, Talisman'],
    ['Book of Ancient Secrets', 'Inscribe and cast ritual spells.', 'Tome'], ['Chains of Carceri', 'Cast hold monster at will on celestials, fiends or elementals.', '15th level, Chain'],
    ['Cloak of Flies', 'Bonus action aura: poison damage and Intimidation advantage.', '5th level'], ['Devil\'s Sight', 'See normally in magical and nonmagical darkness to 120 ft.', ''],
    ['Dreadful Word', 'Cast confusion once per long rest with a pact slot.', '7th level'], ['Eldritch Mind', 'Advantage on CON saves to maintain concentration.', 'TCE'],
    ['Eldritch Sight', 'Cast detect magic at will.', ''], ['Eldritch Smite', 'Spend a pact slot on a pact-weapon hit: +1d8 force + 1d8 per slot level, knock prone.', '5th level, Blade'],
    ['Eldritch Spear', 'Eldritch blast range 300 ft.', 'Eldritch blast'], ['Eyes of the Rune Keeper', 'Read all writing.', ''],
    ['Far Scribe', 'Send messages to creatures who wrote in your book.', '5th level, Tome'], ['Fiendish Vigor', 'Cast false life on yourself at will as 1st level.', ''],
    ['Gaze of Two Minds', "Perceive through a willing humanoid's senses.", ''], ['Ghostly Gaze', 'See through solid objects 30 ft for 1 minute.', '7th level'],
    ['Gift of the Depths', 'Breathe water, swim speed; water breathing once per long rest.', '5th level'], ['Gift of the Ever-Living Ones', 'Maximize healing dice while familiar is near.', 'Chain'],
    ['Gift of the Protectors', 'Creatures in your book drop to 1 HP instead of 0 once.', '9th level, Tome'], ['Grasp of Hadar', 'Eldritch blast pulls 10 ft once per turn.', 'Eldritch blast'],
    ['Improved Pact Weapon', '+1 pact weapon; can be a bow or crossbow; use as focus.', 'Blade'], ['Investment of the Chain Master', 'Familiar upgrades: fly/swim, magic attacks, bonus-action commands.', 'Chain'],
    ['Lance of Lethargy', 'Eldritch blast reduces speed by 10 ft once per turn.', 'Eldritch blast'], ['Lifedrinker', 'Pact weapon hits deal +CHA necrotic.', '12th level, Blade'],
    ['Maddening Hex', 'Bonus action: psychic damage around a cursed target.', '5th level, hex or curse'], ['Mask of Many Faces', 'Cast disguise self at will.', ''],
    ['Master of Myriad Forms', 'Cast alter self at will.', '15th level'], ['Minions of Chaos', 'Cast conjure elemental once per long rest with a pact slot.', '9th level'],
    ['Mire the Mind', 'Cast slow once per long rest with a pact slot.', '5th level'], ['Misty Visions', 'Cast silent image at will.', ''],
    ['One with Shadows', 'Become invisible in dim light or darkness while still.', '5th level'], ['Otherworldly Leap', 'Cast jump on yourself at will.', '9th level'],
    ['Protection of the Talisman', 'Talisman wearer adds 1d4 to failed saves.', '7th level, Talisman'], ['Rebuke of the Talisman', 'Reaction: damage and push a creature that hits the wearer.', 'Talisman'],
    ['Relentless Hex', 'Teleport 30 ft next to your cursed target.', '7th level, hex or curse'], ['Repelling Blast', 'Eldritch blast pushes 10 ft.', 'Eldritch blast'],
    ['Sculptor of Flesh', 'Cast polymorph once per long rest with a pact slot.', '7th level'], ['Shroud of Shadow', 'Cast invisibility at will.', '15th level'],
    ['Sign of Ill Omen', 'Cast bestow curse once per long rest with a pact slot.', '5th level'], ['Thief of Five Fates', 'Cast bane once per long rest with a pact slot.', ''],
    ['Thirsting Blade', 'Attack twice with your pact weapon.', '5th level, Blade', { extraAttack: 2 }], ['Tomb of Levistus', 'Reaction: ice shell grants 10 temp HP per warlock level.', ''],
    ['Trickster\'s Escape', 'Cast freedom of movement on yourself once per long rest.', '7th level'], ['Undying Servitude', 'Cast animate dead once per long rest.', '5th level'],
    ['Visions of Distant Realms', 'Cast arcane eye at will.', '15th level'], ['Voice of the Chain Master', 'Communicate and perceive through your familiar.', 'Chain'],
    ['Whispers of the Grave', 'Cast speak with dead at will.', '9th level'], ['Witch Sight', 'See true forms of shapechangers within 30 ft.', '15th level']] },
  infusion: { label: 'Artificer Infusion', list: [
    ['Arcane Propulsion Armor', 'Armor: +5 ft speed, force gauntlets (1d8), unremovable.', '14th level'], ['Armor of Magical Strength', 'Armor: charges add INT to STR checks/saves or avoid prone.', '10th level'],
    ['Boots of the Winding Path', 'Teleport back to a space you occupied this turn.', '6th level'], ['Enhanced Arcane Focus', '+1 spell attacks (+2 at 10th), ignore half cover.', ''],
    ['Enhanced Defense', '+1 AC on armor or shield (+2 at 10th).', ''], ['Enhanced Weapon', '+1 weapon (+2 at 10th).', ''],
    ['Helm of Awareness', 'Advantage on initiative; can\'t be surprised.', '10th level'], ['Homunculus Servant', 'A tiny construct companion that can deliver touch spells.', ''],
    ['Mind Sharpener', 'Reaction: succeed on a failed concentration save.', ''], ['Radiant Weapon', '+1 weapon that sheds light and can blind attackers.', '6th level'],
    ['Repeating Shot', '+1 ammunition weapon that creates its own ammo.', ''], ['Replicate Magic Item', 'Create a common or uncommon magic item from the replicable list.', ''],
    ['Repulsion Shield', '+1 shield that can push attackers 15 ft.', '6th level'], ['Resistant Armor', 'Armor grants resistance to one damage type.', '6th level'],
    ['Returning Weapon', '+1 thrown weapon that returns.', ''], ['Spell-Refueling Ring', 'Recover one 3rd-level or lower slot once per day.', '6th level']] },
  arcaneShot: { label: 'Arcane Shot', list: [
    ['Banishing Arrow', 'Banish the target to the Feywild briefly (CHA save).', ''], ['Beguiling Arrow', '+2d6 psychic and charm the target toward an ally (WIS save).', ''],
    ['Bursting Arrow', '2d6 force to creatures within 10 ft of the target.', ''], ['Enfeebling Arrow', '+2d6 necrotic; target deals half damage (CON save).', ''],
    ['Grasping Arrow', '+2d6 poison; brambles slow and hurt the target.', ''], ['Piercing Arrow', 'Pass through creatures in a 30 ft line (DEX save, 1d6 extra).', ''],
    ['Seeking Arrow', 'Ignore cover; hits a known creature (DEX save, +1d6 force).', ''], ['Shadow Arrow', '+2d6 psychic; target can\'t see beyond 5 ft (WIS save).', '']] },
  rune: { label: 'Rune', list: [
    ['Cloud Rune', 'Advantage on Sleight of Hand and Deception; redirect an attack.', ''], ['Fire Rune', 'Double proficiency with tools; shackle a target with fiery bonds.', ''],
    ['Frost Rune', 'Advantage on Animal Handling and Intimidation; +2 to STR and CON checks/saves.', ''], ['Stone Rune', 'Advantage on Insight; darkvision; charm a target into a trance.', ''],
    ['Hill Rune', 'Advantage vs poison; resistance to physical damage for 1 minute.', '7th level'], ['Storm Rune', 'Can\'t be surprised; impose advantage or disadvantage within 60 ft.', '7th level']] }
};

// What some warlock options give you, so the sheet can hand it out:
// spells: always available (at will or once per long rest), grant: a choice of spells to make, skills: proficiencies.
(() => {
  const G = {
    pactBoon: {
      'Pact of the Tome': { grant: [{ type: 'spellpick', n: 3, level: 0, list: 'any', label: 'Book of Shadows cantrips', note: 'from any class — they count as warlock spells for you' }] },
      'Pact of the Chain': { spells: ['Find Familiar'], spellNote: 'Pact of the Chain: cast as a ritual; special familiar forms' }
    },
    invocation: {
      'Book of Ancient Secrets': { grant: [{ type: 'spellpick', n: 2, level: 1, ritual: true, list: 'any', label: 'Ritual spells for your Book of Shadows', note: '1st-level rituals from any class — cast them only as rituals', ritualOnly: true }] },
      'Armor of Shadows': { spells: ['Mage Armor'], spellNote: 'At will on yourself, no slot' },
      'Beast Speech': { spells: ['Speak with Animals'], spellNote: 'At will, no slot' },
      'Eldritch Sight': { spells: ['Detect Magic'], spellNote: 'At will, no slot' },
      'Fiendish Vigor': { spells: ['False Life'], spellNote: 'At will on yourself as 1st level, no slot' },
      'Mask of Many Faces': { spells: ['Disguise Self'], spellNote: 'At will, no slot' },
      'Misty Visions': { spells: ['Silent Image'], spellNote: 'At will, no slot' },
      'Ascendant Step': { spells: ['Levitate'], spellNote: 'At will on yourself, no slot' },
      'Otherworldly Leap': { spells: ['Jump'], spellNote: 'At will on yourself, no slot' },
      'Whispers of the Grave': { spells: ['Speak with Dead'], spellNote: 'At will, no slot' },
      'Master of Myriad Forms': { spells: ['Alter Self'], spellNote: 'At will, no slot' },
      'Shroud of Shadow': { spells: ['Invisibility'], spellNote: 'At will, no slot' },
      'Visions of Distant Realms': { spells: ['Arcane Eye'], spellNote: 'At will, no slot' },
      'Chains of Carceri': { spells: ['Hold Monster'], spellNote: 'At will on a celestial, fiend or elemental, no slot' },
      'Bewitching Whispers': { spells: ['Compulsion'], spellNote: 'Once per long rest with a pact slot', once: true },
      'Dreadful Word': { spells: ['Confusion'], spellNote: 'Once per long rest with a pact slot', once: true },
      'Minions of Chaos': { spells: ['Conjure Elemental'], spellNote: 'Once per long rest with a pact slot', once: true },
      'Mire the Mind': { spells: ['Slow'], spellNote: 'Once per long rest with a pact slot', once: true },
      'Sculptor of Flesh': { spells: ['Polymorph'], spellNote: 'Once per long rest with a pact slot', once: true },
      'Sign of Ill Omen': { spells: ['Bestow Curse'], spellNote: 'Once per long rest with a pact slot', once: true },
      'Thief of Five Fates': { spells: ['Bane'], spellNote: 'Once per long rest with a pact slot', once: true },
      "Trickster's Escape": { spells: ['Freedom of Movement'], spellNote: 'On yourself once per long rest, no slot', once: true, free: true },
      'Undying Servitude': { spells: ['Animate Dead'], spellNote: 'Once per long rest, no slot', once: true, free: true },
      'Gift of the Depths': { spells: ['Water Breathing'], spellNote: 'Once per long rest, no slot', once: true, free: true },
      'Beguiling Influence': { skills: ['Deception', 'Persuasion'] }
    }
  };
  Object.entries(G).forEach(([type, m]) => (DND.options[type] ? DND.options[type].list : []).forEach(e => { if (m[e[0]]) e[3] = Object.assign({}, e[3] || {}, m[e[0]]); }));
})();
