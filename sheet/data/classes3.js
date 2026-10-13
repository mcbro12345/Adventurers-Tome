DND.classes.sorcerer = {
  name: 'Sorcerer', hd: 6, saves: ['con', 'cha'], src: 'PHB',
  armor: 'None', weapons: 'Daggers, darts, slings, quarterstaffs, light crossbows', tools: '',
  armorCats: [], weaponNames: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Crossbow, light'],
  skills: { n: 2, from: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
  mc: { req: [['cha', 13]], profs: 'None' },
  sub: { level: 1, label: 'Sorcerous Origin' }, asi: [4, 8, 12, 16, 19], gold: '3d4*10',
  caster: { type: 'full', ab: 'cha', list: 'S', known: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15], cantrips: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6] },
  kit: ['Crossbow, light', 'Crossbow bolts:20', 'Component pouch', "Dungeoneer's Pack", 'Dagger:2'],
  choices: [{ level: 3, type: 'metamagic', n: 2 }, { level: 10, type: 'metamagic', n: 1 }, { level: 17, type: 'metamagic', n: 1 }],
  features: [
    [1, 'Spellcasting', 'Cast known sorcerer spells using CHA.'],
    [2, 'Font of Magic', 'Sorcery points: convert to spell slots (2/3/5/6/7 points for 1st–5th) or slots back into points.', { max: 'sorcerer', reset: 'long', pool: true }],
    [3, 'Metamagic', 'Learn two Metamagic options (another at 10th and 17th) to twist spells with sorcery points.'],
    [20, 'Sorcerous Restoration', 'Regain 4 sorcery points on a short rest.']
  ],
  subclasses: {
    draconic: { name: 'Draconic Bloodline', src: 'PHB', unarmored: '13+dex', hpPerLevel: 1, features: [
      [1, 'Dragon Ancestor', 'Choose a dragon type; learn Draconic; double proficiency on CHA checks with dragons.'],
      [1, 'Draconic Resilience', '+1 max HP per sorcerer level; unarmored AC = 13 + DEX.'],
      [6, 'Elemental Affinity', 'Add CHA to damage of spells matching your ancestry; spend 1 sorcery point for resistance to it.'],
      [14, 'Dragon Wings', 'Bonus action: sprout wings for flying speed equal to your speed.'],
      [18, 'Draconic Presence', 'Spend 5 sorcery points: 60 ft aura of awe or fear for 1 minute (WIS save).']] },
    wildmagic: { name: 'Wild Magic', src: 'PHB', features: [
      [1, 'Wild Magic Surge', 'After casting a 1st+ level spell, the DM may have you roll for a wild surge.'],
      [1, 'Tides of Chaos', 'Gain advantage on one attack, check or save; regained when a surge happens.', { max: '1', reset: 'long' }],
      [6, 'Bend Luck', 'Reaction: spend 2 sorcery points to add or subtract 1d4 from another creature\'s roll.'],
      [14, 'Controlled Chaos', 'Roll twice on the Wild Magic Surge table and choose.'],
      [18, 'Spell Bombardment', 'Once per turn, reroll a maximum damage die and add it.']] },
    divinesoul: { name: 'Divine Soul', src: 'XGE', features: [
      [1, 'Divine Magic', 'Learn spells from the cleric list too; gain a bonus spell based on your affinity (cure wounds, inflict wounds, protection from evil and good, or bless).'],
      [1, 'Favored by the Gods', 'Add 2d4 to a failed save or missed attack.', { max: '1', reset: 'short' }],
      [6, 'Empowered Healing', 'Spend 1 sorcery point to reroll healing dice for you or an ally.'],
      [14, 'Otherworldly Wings', 'Bonus action: wings with 30 ft flying speed.'],
      [18, 'Unearthly Recovery', 'Bonus action below half HP: regain half your max HP.', { max: '1', reset: 'long', col: 'bonus' }]] },
    shadow: { name: 'Shadow Magic', src: 'XGE', features: [
      [1, 'Eyes of the Dark', 'Darkvision 120 ft; at 3rd, cast darkness with 2 sorcery points and see through it.'],
      [1, 'Strength of the Grave', 'When reduced to 0 HP (not radiant or crit), CHA save to drop to 1 HP instead.', { max: '1', reset: 'long' }],
      [6, 'Hound of Ill Omen', 'Spend 3 sorcery points to summon a hound that hunts a target and imposes disadvantage on saves against your spells.'],
      [14, 'Shadow Walk', 'Bonus action: teleport 120 ft between dim light or darkness.'],
      [18, 'Umbral Form', 'Spend 6 sorcery points: resistance to all but force and radiant, move through objects for 1 minute.']] },
    storm: { name: 'Storm Sorcery', src: 'XGE', features: [
      [1, 'Wind Speaker', 'Speak Primordial and its dialects.'],
      [1, 'Tempestuous Magic', 'After casting a 1st+ level spell, bonus-action fly 10 ft without provoking.'],
      [6, 'Heart of the Storm', 'Lightning and thunder resistance; casting those spells damages nearby creatures.'],
      [6, 'Storm Guide', 'Control rain and wind around you.'],
      [14, "Storm's Fury", 'Reaction: lightning damage and push a creature that hits you in melee.'],
      [18, 'Wind Soul', 'Immune to lightning and thunder; 60 ft flying speed; share it briefly with allies.', { max: '1', reset: 'short' }]] },
    aberrantmind: { name: 'Aberrant Mind', src: 'TCE', spellMode: 'always', spells: { 1: ['Arms of Hadar', 'Dissonant Whispers', 'Mind Sliver'], 3: ['Calm Emotions', 'Detect Thoughts'], 5: ['Hunger of Hadar', 'Sending'], 7: ["Evard's Black Tentacles", 'Summon Aberration'], 9: ["Rary's Telepathic Bond", 'Telekinesis'] }, features: [
      [1, 'Telepathic Speech', 'Bonus action: telepathic link with a creature within 30 ft for minutes equal to your sorcerer level, while you are within CHA mod (min 1) miles of each other.'],
      [6, 'Psionic Sorcery', 'Cast your Psionic Spells by spending sorcery points instead of slots, without components.'],
      [6, 'Psychic Defenses', 'Resistance to psychic damage; advantage on saves vs charm and fear.'],
      [14, 'Revelation in Flesh', 'Bonus action, 1+ sorcery points: see invisible, fly, swim and breathe water, or squeeze through gaps.'],
      [18, 'Warping Implosion', 'Action: teleport 120 ft and pull creatures in the vacated area (STR save, 3d10 force).', { max: '1', reset: 'long', col: 'action' }]] },
    clockworksoul: { name: 'Clockwork Soul', src: 'TCE', spellMode: 'always', spells: { 1: ['Alarm', 'Protection from Evil and Good'], 3: ['Aid', 'Lesser Restoration'], 5: ['Dispel Magic', 'Protection from Energy'], 7: ['Freedom of Movement', 'Summon Construct'], 9: ['Greater Restoration', 'Wall of Force'] }, features: [
      [1, 'Clockwork Magic', 'Gain clockwork spells; choose a manifestation of order.'],
      [1, 'Restore Balance', 'Reaction: cancel advantage or disadvantage on a roll within 60 ft.', { max: 'prof', reset: 'long', col: 'reaction' }],
      [6, 'Bastion of Law', 'Spend 1–5 sorcery points to give a creature a ward of d8s that reduce damage.'],
      [14, 'Trance of Order', 'Bonus action: treat d20 rolls of 9 or lower as 10 for 1 minute.', { max: '1', reset: 'long', col: 'bonus' }],
      [18, 'Clockwork Cavalcade', 'Action: 30 ft cube heals 100 HP, repairs objects and ends spells.', { max: '1', reset: 'long', col: 'action' }]] }
  }
};

DND.classes.warlock = {
  name: 'Warlock', hd: 8, saves: ['wis', 'cha'], src: 'PHB',
  armor: 'Light armor', weapons: 'Simple weapons', tools: '',
  armorCats: ['light'], weaponCats: ['simple'],
  skills: { n: 2, from: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
  mc: { req: [['cha', 13]], profs: 'Light armor, simple weapons', armorCats: ['light'], weaponCats: ['simple'] },
  sub: { level: 1, label: 'Otherworldly Patron' }, asi: [4, 8, 12, 16, 19], gold: '4d4*10',
  caster: { type: 'pact', ab: 'cha', list: 'K', known: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15], cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    pactSlots: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4], pactLevel: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
  kit: ['Crossbow, light', 'Crossbow bolts:20', 'Component pouch', "Scholar's Pack", 'Leather Armor', 'Quarterstaff', 'Dagger:2'],
  choices: [{ level: 2, type: 'invocation', n: 2 }, { level: 5, type: 'invocation', n: 1 }, { level: 7, type: 'invocation', n: 1 }, { level: 9, type: 'invocation', n: 1 }, { level: 12, type: 'invocation', n: 1 }, { level: 15, type: 'invocation', n: 1 }, { level: 18, type: 'invocation', n: 1 }, { level: 3, type: 'pactBoon', n: 1 }],
  features: [
    [1, 'Pact Magic', 'Few spell slots, always cast at your highest slot level, regained on a short rest. Uses CHA.'],
    [2, 'Eldritch Invocations', 'Learn invocations that grant magical abilities; more as you level.'],
    [3, 'Pact Boon', 'Choose Pact of the Blade, Chain, Tome or Talisman.'],
    [11, 'Mystic Arcanum', 'Choose a 6th-level spell to cast once per long rest without a slot (7th at 13th, 8th at 15th, 9th at 17th).', { max: '1', reset: 'long' }],
    [20, 'Eldritch Master', 'Spend 1 minute to regain all Pact Magic slots.', { max: '1', reset: 'long' }]
  ],
  subclasses: {
    archfey: { name: 'The Archfey', src: 'PHB', spellMode: 'expanded', spells: { 1: ['Faerie Fire', 'Sleep'], 3: ['Calm Emotions', 'Phantasmal Force'], 5: ['Blink', 'Plant Growth'], 7: ['Dominate Beast', 'Greater Invisibility'], 9: ['Dominate Person', 'Seeming'] }, features: [
      [1, 'Fey Presence', 'Action: charm or frighten creatures in a 10 ft cube (WIS save).', { max: '1', reset: 'short', col: 'action' }],
      [6, 'Misty Escape', 'Reaction when damaged: turn invisible and teleport 60 ft.', { max: '1', reset: 'short', col: 'reaction' }],
      [10, 'Beguiling Defenses', 'Immune to charm; reflect charm attempts back.'],
      [14, 'Dark Delirium', 'Action: charm or frighten a creature into an illusory realm for 1 minute.', { max: '1', reset: 'short', col: 'action' }]] },
    fiend: { name: 'The Fiend', src: 'PHB', spellMode: 'expanded', spells: { 1: ['Burning Hands', 'Command'], 3: ['Blindness/Deafness', 'Scorching Ray'], 5: ['Fireball', 'Stinking Cloud'], 7: ['Fire Shield', 'Wall of Fire'], 9: ['Flame Strike', 'Hallow'] }, features: [
      [1, "Dark One's Blessing", 'When you reduce a hostile creature to 0 HP, gain CHA mod + warlock level temp HP.'],
      [6, "Dark One's Own Luck", 'Add 1d10 to an ability check or saving throw.', { max: '1', reset: 'short' }],
      [10, 'Fiendish Resilience', 'Choose a damage type to resist after each rest.'],
      [14, 'Hurl Through Hell', 'On a hit, send the target through the lower planes for 10d10 psychic.', { max: '1', reset: 'long' }]] },
    greatoldone: { name: 'The Great Old One', src: 'PHB', spellMode: 'expanded', spells: { 1: ['Dissonant Whispers', "Tasha's Hideous Laughter"], 3: ['Detect Thoughts', 'Phantasmal Force'], 5: ['Clairvoyance', 'Sending'], 7: ['Dominate Beast', "Evard's Black Tentacles"], 9: ['Dominate Person', 'Telekinesis'] }, features: [
      [1, 'Awakened Mind', 'Telepathically speak to a creature within 30 ft.'],
      [6, 'Entropic Ward', 'Reaction: impose disadvantage on an attack; if it misses, gain advantage on your next attack against it.', { max: '1', reset: 'short', col: 'reaction' }],
      [10, 'Thought Shield', 'Thoughts can\'t be read; psychic resistance; reflect psychic damage.'],
      [14, 'Create Thrall', 'Touch an incapacitated humanoid to charm it indefinitely.']] },
    celestial: { name: 'The Celestial', src: 'XGE', spellMode: 'expanded', spells: { 1: ['Cure Wounds', 'Guiding Bolt'], 3: ['Flaming Sphere', 'Lesser Restoration'], 5: ['Daylight', 'Revivify'], 7: ['Guardian of Faith', 'Wall of Fire'], 9: ['Flame Strike', 'Greater Restoration'] }, features: [
      [1, 'Bonus Cantrips', 'Learn light and sacred flame.'],
      [1, 'Healing Light', 'Bonus action: spend d6s from a pool to heal a creature within 60 ft.', { max: '1+warlock', reset: 'long', pool: true, col: 'bonus' }],
      [6, 'Radiant Soul', 'Radiant resistance; add CHA to one radiant or fire damage roll of your spells.'],
      [10, 'Celestial Resilience', 'You and up to five allies gain temp HP after rests.'],
      [14, 'Searing Vengeance', 'When you make a death save, rise to half HP and blind nearby enemies.', { max: '1', reset: 'long' }]] },
    hexblade: { name: 'The Hexblade', src: 'XGE', spellMode: 'expanded', spells: { 1: ['Shield', 'Wrathful Smite'], 3: ['Blur', 'Branding Smite'], 5: ['Blink', 'Elemental Weapon'], 7: ['Phantasmal Killer', 'Staggering Smite'], 9: ['Banishing Smite', 'Cone of Cold'] }, profs: { armorCats: ['medium', 'shield'], weaponCats: ['martial'] }, hexWarrior: true, features: [
      [1, "Hexblade's Curse", 'Bonus action: curse a creature for 1 minute — +prof damage, crit on 19–20, heal when it dies.', { max: '1', reset: 'short', col: 'bonus' }],
      [1, 'Hex Warrior', 'Medium armor, shields, martial weapons; use CHA for attacks with one weapon (or pact weapon).'],
      [6, 'Accursed Specter', 'Raise a slain humanoid as a specter under your control until your next long rest.', { max: '1', reset: 'long' }],
      [10, 'Armor of Hexes', 'Reaction: if your cursed target hits you, roll a d6 — on 4+ it misses.'],
      [14, 'Master of Hexes', 'Move your curse to a new creature when the cursed one dies.']] },
    fathomless: { name: 'The Fathomless', src: 'TCE', spellMode: 'expanded', spells: { 1: ['Create or Destroy Water', 'Thunderwave'], 3: ['Gust of Wind', 'Silence'], 5: ['Lightning Bolt', 'Sleet Storm'], 7: ['Control Water', 'Summon Elemental'], 9: ["Bigby's Hand", 'Cone of Cold'] }, features: [
      [1, 'Tentacle of the Deeps', 'Bonus action: summon a spectral tentacle that attacks for 1d8 cold (2d8 at 10th) and slows.', { max: 'prof', reset: 'long', col: 'bonus' }],
      [1, 'Gift of the Sea', '40 ft swim speed; breathe underwater.'],
      [6, 'Oceanic Soul', 'Cold resistance; understood underwater.'],
      [6, 'Guardian Coil', 'Reaction: tentacle reduces damage to a nearby creature by 1d8 (2d8 at 10th).'],
      [10, 'Grasping Tentacles', 'Learn Evard\'s black tentacles and cast it once without a slot; gain temp HP and can\'t lose concentration from damage.', { max: '1', reset: 'long' }],
      [14, 'Fathomless Plunge', 'Action: teleport yourself and up to five creatures to a body of water within 1 mile.', { max: '1', reset: 'short', col: 'action' }]] },
    genie: { name: 'The Genie', src: 'TCE', spellMode: 'expanded', spells: { 1: ['Detect Evil and Good'], 3: ['Phantasmal Force'], 5: ['Create Food and Water'], 7: ['Phantasmal Killer'], 9: ['Creation'] }, features: [
      [1, "Genie's Vessel", 'A magic vessel: Bottled Respite (hide inside) and Genie\'s Wrath (+prof damage of your genie type once per turn). Choose Dao, Djinni, Efreeti or Marid for extra spells.', { max: '1', reset: 'long' }],
      [6, 'Elemental Gift', 'Resistance to your genie\'s damage type; bonus action to gain flying speed for 10 minutes.', { max: 'prof', reset: 'long', col: 'bonus' }],
      [10, 'Sanctuary Vessel', 'Bring up to five creatures into your vessel; short rests there grant extra healing.'],
      [14, 'Limited Wish', 'Action: duplicate any 6th-level or lower spell with a 1-action casting time. Recharges after 1d4 long rests.', { max: '1', reset: 'none' }]] },
    undying: { name: 'The Undying', src: 'SCAG', spellMode: 'expanded', spells: { 1: ['False Life', 'Ray of Sickness'], 3: ['Blindness/Deafness', 'Silence'], 5: ['Feign Death', 'Speak with Dead'], 7: ['Aura of Life', 'Death Ward'], 9: ['Contagion', 'Legend Lore'] }, features: [
      [1, 'Among the Dead', 'Learn spare the dying; advantage vs disease; undead must save to attack you.'],
      [6, 'Defy Death', 'Regain 1d8 + CON HP when you succeed on a death save or stabilize someone.', { max: '1', reset: 'long' }],
      [10, 'Undying Nature', 'Hold your breath indefinitely; no food, water or sleep; age slowly.'],
      [14, 'Indestructible Life', 'Bonus action: regain 1d8 + warlock level HP and reattach severed parts.', { max: '1', reset: 'short', col: 'bonus' }]] },
    undead: { name: 'The Undead', src: 'VRGR', spellMode: 'expanded', spells: { 1: ['Bane', 'False Life'], 3: ['Blindness/Deafness', 'Phantasmal Force'], 5: ['Phantom Steed', 'Speak with Dead'], 7: ['Death Ward', 'Greater Invisibility'], 9: ['Antilife Shell', 'Cloudkill'] }, features: [
      [1, 'Form of Dread', 'Bonus action: transform for 1 minute — temp HP, immune to fear, once per turn a hit can frighten.', { max: 'prof', reset: 'long', col: 'bonus' }],
      [6, 'Grave Touched', "No need to eat, drink or breathe; once per turn turn damage necrotic and add a die while in Form of Dread."],
      [10, 'Necrotic Husk', 'Necrotic resistance (immunity in Form of Dread); when dropped to 0 HP, explode and drop to 1 HP instead.', { max: '1', reset: 'long' }],
      [14, 'Spirit Projection', 'Action: project your spirit for an hour with special benefits.', { max: '1', reset: 'long', col: 'action' }]] }
  }
};

DND.classes.wizard = {
  name: 'Wizard', hd: 6, saves: ['int', 'wis'], src: 'PHB',
  armor: 'None', weapons: 'Daggers, darts, slings, quarterstaffs, light crossbows', tools: '',
  armorCats: [], weaponNames: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Crossbow, light'],
  skills: { n: 2, from: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] },
  mc: { req: [['int', 13]], profs: 'None' },
  sub: { level: 2, label: 'Arcane Tradition' }, asi: [4, 8, 12, 16, 19], gold: '4d4*10',
  caster: { type: 'full', ab: 'int', list: 'W', prepared: 'int+wizard', book: true, cantrips: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
  kit: ['Quarterstaff', 'Component pouch', "Scholar's Pack", 'Spellbook'],
  features: [
    [1, 'Spellcasting', 'Keep a spellbook (6 spells at 1st, +2 per level); prepare INT mod + wizard level spells each day. Ritual-cast spells from your book.'],
    [1, 'Arcane Recovery', 'Once per day during a short rest, recover spell slots totaling up to half your wizard level (rounded up), none 6th or higher.', { max: '1', reset: 'long' }],
    [18, 'Spell Mastery', 'Choose a 1st- and 2nd-level spell to cast at their lowest level without slots.'],
    [20, 'Signature Spells', 'Choose two 3rd-level spells: always prepared and castable once each per short rest without a slot.', { max: '2', reset: 'short' }]
  ],
  subclasses: {
    abjuration: { name: 'School of Abjuration', src: 'PHB', features: [
      [2, 'Abjuration Savant', 'Copy abjuration spells for half the gold and time.'],
      [2, 'Arcane Ward', 'Casting an abjuration spell creates a ward with HP = 2 × wizard level + INT mod that absorbs damage.', { max: '2*wizard+int', reset: 'long', pool: true }],
      [6, 'Projected Ward', 'Reaction: your ward absorbs damage for a creature within 30 ft.'],
      [10, 'Improved Abjuration', 'Add prof bonus to ability checks made as part of abjuration spells.'],
      [14, 'Spell Resistance', 'Advantage on saves vs spells; resistance to spell damage.']] },
    conjuration: { name: 'School of Conjuration', src: 'PHB', features: [
      [2, 'Conjuration Savant', 'Copy conjuration spells for half the gold and time.'],
      [2, 'Minor Conjuration', 'Action: conjure a nonmagical object up to 3 ft and 10 lb for an hour.'],
      [6, 'Benign Transposition', 'Action: teleport 30 ft or swap places with a willing creature.', { max: '1', reset: 'long', col: 'action' }],
      [10, 'Focused Conjuration', "Concentration on conjuration spells can't be broken by damage."],
      [14, 'Durable Summons', 'Your summoned creatures gain 30 temp HP.']] },
    divination: { name: 'School of Divination', src: 'PHB', features: [
      [2, 'Divination Savant', 'Copy divination spells for half the gold and time.'],
      [2, 'Portent', 'After a long rest roll two d20s (three at 14th); replace any roll you can see with one of them.', { max: 'tier(wizard,2,2,14,3)', reset: 'long' }],
      [6, 'Expert Divination', 'Casting a 2nd+ divination spell regains a lower-level slot.'],
      [10, 'The Third Eye', 'Action: gain darkvision, ethereal sight, comprehend languages or see invisibility until rest.', { max: '1', reset: 'short', col: 'action' }],
      [14, 'Greater Portent', 'Roll three Portent dice.']] },
    enchantment: { name: 'School of Enchantment', src: 'PHB', features: [
      [2, 'Enchantment Savant', 'Copy enchantment spells for half the gold and time.'],
      [2, 'Hypnotic Gaze', 'Action: charm a creature within 5 ft (WIS save), incapacitating it.'],
      [6, 'Instinctive Charm', 'Reaction: redirect an attack against you to another creature (WIS save).'],
      [10, 'Split Enchantment', 'Single-target enchantment spells can target a second creature.'],
      [14, 'Alter Memories', 'Make charmed creatures forget being charmed and lose memories.']] },
    evocation: { name: 'School of Evocation', src: 'PHB', features: [
      [2, 'Evocation Savant', 'Copy evocation spells for half the gold and time.'],
      [2, 'Sculpt Spells', 'Protect 1 + spell level creatures from your evocation spells.'],
      [6, 'Potent Cantrip', 'Creatures that succeed on saves vs your cantrips take half damage.'],
      [10, 'Empowered Evocation', 'Add INT mod to one damage roll of wizard evocation spells.'],
      [14, 'Overchannel', 'Deal maximum damage with a 1st–5th level spell; later uses hurt you.']] },
    illusion: { name: 'School of Illusion', src: 'PHB', features: [
      [2, 'Illusion Savant', 'Copy illusion spells for half the gold and time.'],
      [2, 'Improved Minor Illusion', 'Learn minor illusion; create sound and image together.'],
      [6, 'Malleable Illusions', 'Action: change the nature of your ongoing illusions.'],
      [10, 'Illusory Self', 'Reaction: an illusory duplicate makes an attack miss.', { max: '1', reset: 'short', col: 'reaction' }],
      [14, 'Illusory Reality', 'Bonus action: make one inanimate object in your illusion real for 1 minute.']] },
    necromancy: { name: 'School of Necromancy', src: 'PHB', features: [
      [2, 'Necromancy Savant', 'Copy necromancy spells for half the gold and time.'],
      [2, 'Grim Harvest', 'Regain HP when you kill with a spell (2× spell level, 3× for necromancy).'],
      [6, 'Undead Thralls', 'Animate dead raises one extra undead; your undead are stronger.'],
      [10, 'Inured to Undeath', 'Necrotic resistance; your max HP can\'t be reduced.'],
      [14, 'Command Undead', 'Action: take control of an undead (CHA save).']] },
    transmutation: { name: 'School of Transmutation', src: 'PHB', features: [
      [2, 'Transmutation Savant', 'Copy transmutation spells for half the gold and time.'],
      [2, 'Minor Alchemy', 'Temporarily change the material of an object.'],
      [6, "Transmuter's Stone", 'Create a stone granting darkvision, speed, a save proficiency or a resistance.'],
      [10, 'Shapechanger', 'Cast polymorph on yourself without a slot (CR 1 beast).', { max: '1', reset: 'short' }],
      [14, 'Master Transmuter', 'Destroy your stone for a major transformation, healing, restoration or youth.']] },
    warmagic: { name: 'War Magic', src: 'XGE', features: [
      [2, 'Arcane Deflection', 'Reaction: +2 AC or +4 to a save; then only cantrips until your next turn.'],
      [2, 'Tactical Wit', 'Add INT mod to initiative.'],
      [6, 'Power Surge', 'Store power surges; add half wizard level force damage to a spell once per turn.', { max: 'max(1,int)', reset: 'long' }],
      [10, 'Durable Magic', '+2 AC and saves while concentrating on a spell.'],
      [14, 'Deflecting Shroud', 'Arcane Deflection also deals force damage to up to three creatures.']] },
    bladesinging: { name: 'Bladesinging', src: 'TCE', extraAttack: { 6: 2 }, features: [
      [2, 'Training in War and Song', 'Light armor, one one-handed melee weapon, and Performance.'],
      [2, 'Bladesong', 'Bonus action for 1 minute: +INT to AC, +10 ft speed, advantage on Acrobatics, +INT to concentration saves.', { max: 'prof', reset: 'long', col: 'bonus' }],
      [6, 'Extra Attack', 'Attack twice (one can be replaced by a cantrip).'],
      [10, 'Song of Defense', 'Reaction while Bladesong is active: spend a slot to reduce damage by 5 × slot level.'],
      [14, 'Song of Victory', 'Add INT to melee weapon damage while Bladesong is active.']] },
    scribes: { name: 'Order of Scribes', src: 'TCE', features: [
      [2, 'Wizardly Quill', 'Bonus action: create a magic quill; copy spells faster.'],
      [2, 'Awakened Spellbook', 'Use your spellbook as focus; swap a spell\'s damage type; ritual-cast at normal speed once per long rest.'],
      [6, 'Manifest Mind', 'Bonus action: project your spellbook\'s mind to see, hear and cast through it.', { max: 'prof', reset: 'long', col: 'bonus' }],
      [10, 'Master Scrivener', 'After a long rest, create a spell scroll of a 1st or 2nd level spell, cast one level higher.', { max: '1', reset: 'long' }],
      [14, 'One with the Word', 'Advantage on Arcana; when you take damage, your book can absorb it by losing spells.']] }
  }
};

DND.classes.artificer = {
  name: 'Artificer', hd: 8, saves: ['con', 'int'], src: 'TCE',
  armor: 'Light armor, medium armor, shields', weapons: 'Simple weapons', tools: "Thieves' tools, tinker's tools, one artisan's tool",
  armorCats: ['light', 'medium', 'shield'], weaponCats: ['simple'],
  skills: { n: 2, from: ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'] },
  mc: { req: [['int', 13]], profs: "Light armor, medium armor, shields, thieves' tools, tinker's tools", armorCats: ['light', 'medium', 'shield'] },
  sub: { level: 3, label: 'Artificer Specialist' }, asi: [4, 8, 12, 16, 19], gold: '5d4*10',
  caster: { type: 'artificer', ab: 'int', list: 'A', prepared: 'int+floor(artificer/2)', cantrips: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4] },
  kit: ['Dagger', 'Light hammer', 'Crossbow, light', 'Crossbow bolts:20', 'Studded Leather Armor', "Thieves' tools", "Dungeoneer's Pack"],
  choices: [{ level: 2, type: 'infusion', n: 4 }, { level: 6, type: 'infusion', n: 2 }, { level: 10, type: 'infusion', n: 2 }, { level: 14, type: 'infusion', n: 2 }, { level: 18, type: 'infusion', n: 2 }],
  scaling: [['Infused Items', { 2: '2', 6: '3', 10: '4', 14: '5', 18: '6' }], ['Attunement Slots', { 1: '3', 10: '4', 14: '5', 18: '6' }]],
  features: [
    [1, 'Magical Tinkering', 'Imbue a tiny object with a minor magical property (light, message, sound, image).'],
    [1, 'Spellcasting', 'Prepare INT mod + half artificer level spells; cast through tools.'],
    [2, 'Infuse Item', 'After a long rest, infuse nonmagical items with your known infusions.'],
    [3, 'The Right Tool for the Job', 'Create a set of artisan\'s tools over an hour.'],
    [6, 'Tool Expertise', 'Double proficiency with tools you are proficient in.'],
    [7, 'Flash of Genius', 'Reaction: add INT mod to a creature\'s check or save within 30 ft.', { max: 'max(1,int)', reset: 'long', col: 'reaction' }],
    [10, 'Magic Item Adept', 'Attune to four items; craft common and uncommon items faster.'],
    [11, 'Spell-Storing Item', 'Store a 1st or 2nd level spell in an item; others can cast it 2 × INT mod times.'],
    [14, 'Magic Item Savant', 'Attune to five items; ignore class, race, spell and level requirements.'],
    [18, 'Magic Item Master', 'Attune to six items.'],
    [20, 'Soul of Artifice', '+1 to all saves per attuned item; end an infusion to drop to 1 HP instead of 0.']
  ],
  subclasses: {
    alchemist: { name: 'Alchemist', src: 'TCE', spellMode: 'always', spells: { 3: ['Healing Word', 'Ray of Sickness'], 5: ['Flaming Sphere', "Melf's Acid Arrow"], 9: ['Gaseous Form', 'Mass Healing Word'], 13: ['Blight', 'Death Ward'], 17: ['Cloudkill', 'Raise Dead'] }, features: [
      [3, 'Tool Proficiency', "Alchemist's supplies."],
      [3, 'Experimental Elixir', 'After a long rest, create a random elixir (healing, swiftness, resilience, boldness, flight or transformation); spend slots for more.', { max: 'tier(artificer,3,1,6,2,15,3)', reset: 'long' }],
      [5, 'Alchemical Savant', 'Add INT mod to healing or acid, fire, necrotic or poison damage of your spells.'],
      [9, 'Restorative Reagents', 'Elixirs grant temp HP; cast lesser restoration without a slot.', { max: 'max(1,int)', reset: 'long' }],
      [15, 'Chemical Mastery', 'Acid and poison resistance, poison immunity; cast greater restoration and heal once each.', { max: '1', reset: 'long' }]] },
    armorer: { name: 'Armorer', src: 'TCE', extraAttack: { 5: 2 }, spellMode: 'always', spells: { 3: ['Magic Missile', 'Thunderwave'], 5: ['Mirror Image', 'Shatter'], 9: ['Hypnotic Pattern', 'Lightning Bolt'], 13: ['Fire Shield', 'Greater Invisibility'], 17: ['Passwall', 'Wall of Force'] }, profs: { armorCats: ['heavy'] }, features: [
      [3, 'Tools of the Trade', "Heavy armor and smith's tools."],
      [3, 'Arcane Armor', 'Turn armor into arcane armor: no STR requirement, spellcasting focus, replaces missing limbs.'],
      [3, 'Armor Model', 'Guardian (thunder gauntlets, defensive field temp HP) or Infiltrator (lightning launcher, +5 ft speed, Stealth advantage).'],
      [5, 'Extra Attack', 'Attack twice when you take the Attack action.'],
      [9, 'Armor Modifications', 'Armor counts as separate items for infusions; infuse two more items.'],
      [15, 'Perfected Armor', 'Guardian: pull and attack; Infiltrator: lightning makes targets glow for advantage.']] },
    artillerist: { name: 'Artillerist', src: 'TCE', spellMode: 'always', spells: { 3: ['Shield', 'Thunderwave'], 5: ['Scorching Ray', 'Shatter'], 9: ['Fireball', 'Wind Wall'], 13: ['Ice Storm', 'Wall of Fire'], 17: ['Cone of Cold', 'Wall of Force'] }, features: [
      [3, 'Tool Proficiency', "Woodcarver's tools."],
      [3, 'Eldritch Cannon', 'Action: create a Flamethrower, Force Ballista or Protector cannon for 1 hour (more with spell slots).', { max: '1', reset: 'long', col: 'action' }],
      [5, 'Arcane Firearm', 'A wand, staff or rod adds 1d8 to one damage roll of your artificer spells.'],
      [9, 'Explosive Cannon', 'Cannon damage +1d8; detonate it for 3d8 force.'],
      [15, 'Fortified Position', 'Two cannons at once; allies near them have half cover.']] },
    battlesmith: { name: 'Battle Smith', src: 'TCE', extraAttack: { 5: 2 }, battleReady: true, spellMode: 'always', spells: { 3: ['Heroism', 'Shield'], 5: ['Branding Smite', 'Warding Bond'], 9: ['Aura of Vitality', 'Conjure Barrage'], 13: ['Aura of Purity', 'Fire Shield'], 17: ['Banishing Smite', 'Mass Cure Wounds'] }, profs: { weaponCats: ['martial'] }, features: [
      [3, 'Tool Proficiency', "Smith's tools."],
      [3, 'Battle Ready', 'Martial weapons; use INT for attacks with magic weapons.'],
      [3, 'Steel Defender', 'A mechanical companion that fights with you and can deflect attacks.'],
      [5, 'Extra Attack', 'Attack twice when you take the Attack action.'],
      [9, 'Arcane Jolt', 'Once per turn, a hit by you or your defender deals 2d6 force or heals 2d6 (4d6 at 15th).', { max: 'max(1,int)', reset: 'long' }],
      [15, 'Improved Defender', 'Jolt dice increase; defender gets +2 AC and reflects damage.']] }
  }
};

// Order for display
// Ranger with Tasha's Cauldron of Everything's optional class features, as its own class (same archetypes).
DND.classes.rangertce = Object.assign({}, DND.classes.ranger, {
  name: "Ranger (Tasha's)", src: 'TCE',
  choices: [{ level: 1, type: 'expertise', n: 1, label: 'Deft Explorer: Canny — expertise in one skill' }, { level: 1, type: 'language', n: 2, label: 'Deft Explorer: Canny — languages' }, { level: 2, type: 'fightingStyle', n: 1 }],
  scaling: [['Favored Foe', { 1: '1d4', 6: '1d6', 14: '1d8' }]],
  features: [
    [1, 'Favored Foe', 'When you hit a creature, mark it as your favored enemy for 1 minute (concentration): the first time each turn you hit it, deal extra damage (1d4, 1d6 at 6th, 1d8 at 14th).', { max: 'prof', reset: 'long' }],
    [1, 'Deft Explorer: Canny', 'Expertise in one skill you are proficient in; learn two languages.'],
    [2, 'Fighting Style', 'Adopt a fighting style specialty (Druidic Warrior available).'],
    [2, 'Spellcasting', 'Cast known ranger spells using WIS.'],
    [2, 'Spellcasting Focus', 'Use a druidic focus as a spellcasting focus for ranger spells.'],
    [3, 'Primal Awareness', 'Learn speak with animals, then beast sense (5th), speak with plants (9th), locate creature (13th) and commune with nature (17th); each is always prepared and castable once per long rest without a slot.'],
    [4, 'Martial Versatility', 'Whenever you gain an Ability Score Improvement, you can replace your fighting style.'],
    [5, 'Extra Attack', 'Attack twice when you take the Attack action.'],
    [6, 'Deft Explorer: Roving', '+5 ft walking speed; climbing and swimming speeds equal to your walking speed.'],
    [8, "Land's Stride", 'Nonmagical difficult terrain costs no extra movement; advantage against magical plants.'],
    [10, 'Deft Explorer: Tireless', 'Action: gain 1d8 + WIS temporary HP (prof times per long rest). A short rest reduces your exhaustion by 1.', { max: 'prof', reset: 'long', col: 'action' }],
    [10, "Nature's Veil", 'Bonus action: become invisible until the start of your next turn.', { max: 'prof', reset: 'long', col: 'bonus' }],
    [14, 'Vanish', 'Hide as a bonus action; nonmagical tracking fails.'],
    [18, 'Feral Senses', 'Attacks against unseen creatures have no disadvantage; sense invisible creatures within 30 ft.'],
    [20, 'Foe Slayer', 'Once per turn, add WIS mod to an attack or damage roll against your favored enemy.']
  ]
});
DND.classOrder = ['artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rangertce', 'rogue', 'sorcerer', 'warlock', 'wizard'];
