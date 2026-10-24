// Races (2014 rules). asi: fixed object, 'flex' (+2/+1 or +1/+1/+1), or 'lineage' (+2 one, or +1/+1).
// choices: skill | language | tool | asi | feat | cantrip | option.  spells: [[charLevel, spell, note]]  (innate, once per long rest unless cantrip)
DND.races = {};
const R = (k, o) => { DND.races[k] = o; };

R('dwarf', { name: 'Dwarf', src: 'PHB', size: 'Medium', speed: 25, asi: { con: 2 }, darkvision: 60, languages: ['Common', 'Dwarvish'],
  weapons: ['Battleaxe', 'Handaxe', 'Light hammer', 'Warhammer'],
  choices: [{ type: 'tool', n: 1, from: ["Smith's tools", "Brewer's supplies", "Mason's tools"] }],
  traits: [['Dwarven Resilience', 'Advantage on saves vs poison; resistance to poison damage.'], ['Dwarven Combat Training', 'Battleaxe, handaxe, light hammer and warhammer proficiency.'], ['Stonecunning', 'Double proficiency on History checks about stonework.'], ['Heavy Armor Speed', 'Speed is not reduced by heavy armor.']],
  subraces: {
    hill: { name: 'Hill Dwarf', asi: { wis: 1 }, hpPerLevel: 1, traits: [['Dwarven Toughness', '+1 max HP per level.']] },
    mountain: { name: 'Mountain Dwarf', asi: { str: 2 }, armorCats: ['light', 'medium'], traits: [['Dwarven Armor Training', 'Light and medium armor proficiency.']] },
    duergar: { name: 'Duergar (SCAG)', asi: { str: 1 }, darkvision: 120, languages: ['Undercommon'], spells: [[3, 'Enlarge/Reduce', 'enlarge only, once per long rest'], [5, 'Invisibility', 'self, once per long rest']], traits: [['Duergar Resilience', 'Advantage on saves vs illusions, charm and paralysis.'], ['Sunlight Sensitivity', 'Disadvantage on attacks and sight-based Perception in direct sunlight.']] } } });

R('elf', { name: 'Elf', src: 'PHB', size: 'Medium', speed: 30, asi: { dex: 2 }, darkvision: 60, languages: ['Common', 'Elvish'], skills: ['Perception'],
  traits: [['Keen Senses', 'Perception proficiency.'], ['Fey Ancestry', "Advantage vs being charmed; magic can't put you to sleep."], ['Trance', 'Meditate 4 hours instead of sleeping 8.']],
  subraces: {
    high: { name: 'High Elf', asi: { int: 1 }, weapons: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow'], choices: [{ type: 'cantrip', n: 1, list: 'W', ab: 'int' }, { type: 'language', n: 1 }], traits: [['Elf Weapon Training', 'Longsword, shortsword, shortbow and longbow proficiency.'], ['Cantrip', 'One wizard cantrip (INT).']] },
    wood: { name: 'Wood Elf', asi: { wis: 1 }, speed: 35, weapons: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow'], traits: [['Elf Weapon Training', 'Longsword, shortsword, shortbow and longbow proficiency.'], ['Fleet of Foot', 'Speed 35 ft.'], ['Mask of the Wild', 'Hide when lightly obscured by nature.']] },
    drow: { name: 'Drow (Dark Elf)', asi: { cha: 1 }, darkvision: 120, weapons: ['Rapier', 'Shortsword', 'Hand crossbow'], spells: [[1, 'Dancing Lights', 'cantrip'], [3, 'Faerie Fire', 'once per long rest'], [5, 'Darkness', 'once per long rest']], traits: [['Sunlight Sensitivity', 'Disadvantage on attacks and sight-based Perception in direct sunlight.'], ['Drow Weapon Training', 'Rapier, shortsword and hand crossbow proficiency.']] } } });

R('halfling', { name: 'Halfling', src: 'PHB', size: 'Small', speed: 25, asi: { dex: 2 }, languages: ['Common', 'Halfling'],
  traits: [['Lucky', 'Reroll a natural 1 on an attack, check or save.'], ['Brave', 'Advantage on saves vs being frightened.'], ['Halfling Nimbleness', 'Move through the space of larger creatures.']],
  subraces: {
    lightfoot: { name: 'Lightfoot', asi: { cha: 1 }, traits: [['Naturally Stealthy', 'Hide behind creatures at least one size larger.']] },
    stout: { name: 'Stout', asi: { con: 1 }, traits: [['Stout Resilience', 'Advantage vs poison; resistance to poison damage.']] },
    ghostwise: { name: 'Ghostwise (SCAG)', asi: { wis: 1 }, traits: [['Silent Speech', 'Telepathically speak to a creature within 30 ft.']] } } });

R('human', { name: 'Human', src: 'PHB', size: 'Medium', speed: 30, asi: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, languages: ['Common'], choices: [{ type: 'language', n: 1 }], traits: [] ,
  subraces: { standard: { name: 'Standard Human' },
    variant: { name: 'Variant Human', asiReplace: true, asi: {}, choices: [{ type: 'asi', n: 2, amount: 1 }, { type: 'skill', n: 1, from: 'any' }, { type: 'feat', n: 1 }], traits: [['Versatile', '+1 to two scores, one skill and one feat.']] } } });

R('dragonborn', { name: 'Dragonborn', src: 'PHB', size: 'Medium', speed: 30, asi: { str: 2, cha: 1 }, languages: ['Common', 'Draconic'],
  choices: [{ type: 'option', label: 'Draconic Ancestry', options: [['Black', 'Acid, 5×30 ft line (DEX)'], ['Blue', 'Lightning, 5×30 ft line (DEX)'], ['Brass', 'Fire, 5×30 ft line (DEX)'], ['Bronze', 'Lightning, 5×30 ft line (DEX)'], ['Copper', 'Acid, 5×30 ft line (DEX)'], ['Gold', 'Fire, 15 ft cone (DEX)'], ['Green', 'Poison, 15 ft cone (CON)'], ['Red', 'Fire, 15 ft cone (DEX)'], ['Silver', 'Cold, 15 ft cone (CON)'], ['White', 'Cold, 15 ft cone (CON)']] }],
  traits: [['Breath Weapon', 'Action: 2d6 damage of your ancestry type (3d6 at 6th, 4d6 at 11th, 5d6 at 16th); save DC 8 + CON + prof for half.', { max: '1', reset: 'short', col: 'action' }], ['Damage Resistance', 'Resistance to your ancestry damage type.']],
  subraces: { standard: { name: 'Dragonborn (PHB)' },
    chromatic: { name: 'Chromatic Dragonborn (FTD)', src: 'FTD', asiReplace: true, replaceChoices: true, asi: 'flex', replaceTraits: true, choices: [{ type: 'option', label: 'Chromatic Ancestry', options: [['Black', 'Acid'], ['Blue', 'Lightning'], ['Green', 'Poison'], ['Red', 'Fire'], ['White', 'Cold']] }],
      traits: [['Breath Weapon', 'Replace one attack: 15 ft cone or 5×30 ft line, 1d10 (2d10 at 5th, 3d10 at 11th, 4d10 at 17th), DEX save DC 8 + CON + prof.', { max: 'prof', reset: 'long' }], ['Draconic Resistance', 'Resistance to your ancestry type.'], ['Chromatic Warding', 'At 5th level: immunity to your ancestry type for 1 minute, once per long rest.', { max: '1', reset: 'long', minLevel: 5 }]] },
    metallic: { name: 'Metallic Dragonborn (FTD)', src: 'FTD', asiReplace: true, replaceChoices: true, asi: 'flex', replaceTraits: true, choices: [{ type: 'option', label: 'Metallic Ancestry', options: [['Brass', 'Fire'], ['Bronze', 'Lightning'], ['Copper', 'Acid'], ['Gold', 'Fire'], ['Silver', 'Cold']] }],
      traits: [['Breath Weapon', 'Replace one attack: 15 ft cone, 1d10 (scales at 5th, 11th, 17th), DEX save.', { max: 'prof', reset: 'long' }], ['Draconic Resistance', 'Resistance to your ancestry type.'], ['Metallic Breath Weapon', 'At 5th level: a second breath — Enervating (incapacitate) or Repulsion (push and prone), once per long rest.', { max: '1', reset: 'long', minLevel: 5 }]] },
    gem: { name: 'Gem Dragonborn (FTD)', src: 'FTD', asiReplace: true, replaceChoices: true, asi: 'flex', replaceTraits: true, choices: [{ type: 'option', label: 'Gem Ancestry', options: [['Amethyst', 'Force'], ['Crystal', 'Radiant'], ['Emerald', 'Psychic'], ['Sapphire', 'Thunder'], ['Topaz', 'Necrotic']] }],
      traits: [['Breath Weapon', 'Replace one attack: 15 ft cone, 1d10 (scales at 5th, 11th, 17th), DEX save.', { max: 'prof', reset: 'long' }], ['Draconic Resistance', 'Resistance to your ancestry type.'], ['Psionic Mind', 'Telepathy 30 ft.'], ['Gem Flight', 'At 5th level: bonus action flying speed for 1 minute, once per long rest.', { max: '1', reset: 'long', minLevel: 5, col: 'bonus' }]] } } });

R('gnome', { name: 'Gnome', src: 'PHB', size: 'Small', speed: 25, asi: { int: 2 }, darkvision: 60, languages: ['Common', 'Gnomish'],
  traits: [['Gnome Cunning', 'Advantage on INT, WIS and CHA saves against magic.']],
  subraces: {
    forest: { name: 'Forest Gnome', asi: { dex: 1 }, spells: [[1, 'Minor Illusion', 'cantrip (INT)']], traits: [['Natural Illusionist', 'Know minor illusion.'], ['Speak with Small Beasts', 'Communicate simple ideas with Small or smaller beasts.']] },
    rock: { name: 'Rock Gnome', asi: { con: 1 }, tools: ["Tinker's tools"], traits: [["Artificer's Lore", 'Double proficiency on History checks about magic items and devices.'], ['Tinker', 'Build tiny clockwork devices.']] },
    deep: { name: 'Deep Gnome (SCAG/EEPC)', asi: { dex: 1 }, darkvision: 120, languages: ['Undercommon'], traits: [['Stone Camouflage', 'Advantage on Stealth in rocky terrain.']] } } });

R('halfelf', { name: 'Half-Elf', src: 'PHB', size: 'Medium', speed: 30, asi: { cha: 2 }, darkvision: 60, languages: ['Common', 'Elvish'],
  choices: [{ type: 'asi', n: 2, amount: 1, exclude: ['cha'] }, { type: 'language', n: 1 }],
  traits: [['Fey Ancestry', "Advantage vs being charmed; magic can't put you to sleep."]],
  subraces: {
    standard: { name: 'Half-Elf (Skill Versatility)', choices: [{ type: 'skill', n: 2, from: 'any' }], traits: [['Skill Versatility', 'Two skills of your choice.']] },
    high: { name: 'Half-Elf, High Elf descent (SCAG)', choices: [{ type: 'cantrip', n: 1, list: 'W', ab: 'int' }], traits: [['Elf Cantrip', 'One wizard cantrip.']] },
    wood: { name: 'Half-Elf, Wood Elf descent (SCAG)', weapons: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow'], traits: [['Elf Weapon Training or Fleet of Foot', 'Elf weapons, or speed 35, or Mask of the Wild (choose one).']] },
    drow: { name: 'Half-Elf, Drow descent (SCAG)', spells: [[1, 'Dancing Lights', 'cantrip'], [3, 'Faerie Fire', 'once per long rest'], [5, 'Darkness', 'once per long rest']], traits: [['Drow Magic', 'Dancing lights, then faerie fire and darkness.']] },
    aquatic: { name: 'Half-Elf, Aquatic descent (SCAG)', traits: [['Swim Speed', '30 ft swimming speed.']] } } });

R('halforc', { name: 'Half-Orc', src: 'PHB', size: 'Medium', speed: 30, asi: { str: 2, con: 1 }, darkvision: 60, languages: ['Common', 'Orc'], skills: ['Intimidation'],
  traits: [['Menacing', 'Intimidation proficiency.'], ['Relentless Endurance', 'When reduced to 0 HP but not killed, drop to 1 HP instead.', { max: '1', reset: 'long' }], ['Savage Attacks', 'Roll one extra weapon damage die on a melee critical hit.']] });

R('tiefling', { name: 'Tiefling', src: 'PHB', size: 'Medium', speed: 30, asi: { cha: 2, int: 1 }, darkvision: 60, languages: ['Common', 'Infernal'],
  traits: [['Hellish Resistance', 'Resistance to fire damage.']],
  subraces: {
    standard: { name: 'Tiefling (Infernal Legacy)', spells: [[1, 'Thaumaturgy', 'cantrip (CHA)'], [3, 'Hellish Rebuke', 'as 2nd level, once per long rest'], [5, 'Darkness', 'once per long rest']] },
    feral: { name: 'Feral Tiefling (SCAG)', asiReplace: true, asi: { dex: 2, int: 1 }, spells: [[1, 'Thaumaturgy', 'cantrip (CHA)'], [3, 'Hellish Rebuke', 'once per long rest'], [5, 'Darkness', 'once per long rest']] },
    devilstongue: { name: "Tiefling, Devil's Tongue (SCAG)", spells: [[1, 'Vicious Mockery', 'cantrip'], [3, 'Charm Person', 'as 2nd level, once per long rest'], [5, 'Enthrall', 'once per long rest']] },
    hellfire: { name: 'Tiefling, Hellfire (SCAG)', spells: [[1, 'Thaumaturgy', 'cantrip'], [3, 'Burning Hands', 'as 2nd level, once per long rest'], [5, 'Darkness', 'once per long rest']] },
    winged: { name: 'Tiefling, Winged (SCAG)', fly: 30, traits: [['Winged', '30 ft flying speed (replaces Infernal Legacy).']] } } });

// ---------- Elemental Evil / Volo's (legacy versions) ----------
R('aarakocra_ee', { name: 'Aarakocra (EEPC)', src: 'EEPC', size: 'Medium', speed: 25, fly: 50, asi: { dex: 2, wis: 1 }, languages: ['Common', 'Aarakocra', 'Auran'], natural: [['Talons', '1d4', 'slashing']],
  traits: [['Flight', '50 ft flying speed; not in medium or heavy armor.'], ['Talons', 'Unarmed strikes deal 1d4 slashing.']] });
R('genasi_ee', { name: 'Genasi (EEPC)', src: 'EEPC', size: 'Medium', speed: 30, asi: { con: 2 }, languages: ['Common', 'Primordial'],
  subraces: {
    air: { name: 'Air Genasi', asi: { dex: 1 }, spells: [[1, 'Levitate', 'once per long rest (CON)']], traits: [['Unending Breath', 'Hold your breath indefinitely.']] },
    earth: { name: 'Earth Genasi', asi: { str: 1 }, spells: [[1, 'Pass without Trace', 'once per long rest (CON)']], traits: [['Earth Walk', 'Ignore difficult earth or stone terrain.']] },
    fire: { name: 'Fire Genasi', asi: { int: 1 }, darkvision: 60, spells: [[1, 'Produce Flame', 'cantrip (CON)'], [3, 'Burning Hands', 'once per long rest']], traits: [['Fire Resistance', 'Resistance to fire damage.']] },
    water: { name: 'Water Genasi', asi: { wis: 1 }, swim: 30, spells: [[1, 'Shape Water', 'cantrip (CON)'], [3, 'Create or Destroy Water', 'as 2nd level, once per long rest']], traits: [['Acid Resistance', 'Resistance to acid damage.'], ['Amphibious', 'Breathe air and water.']] } } });
R('goliath_ee', { name: 'Goliath (EEPC/Volo)', src: 'EEPC', size: 'Medium', speed: 30, asi: { str: 2, con: 1 }, languages: ['Common', 'Giant'], skills: ['Athletics'],
  traits: [['Natural Athlete', 'Athletics proficiency.'], ["Stone's Endurance", 'Reaction: reduce damage by 1d12 + CON.', { max: '1', reset: 'short', col: 'reaction' }], ['Powerful Build', 'Count as one size larger for carrying.'], ['Mountain Born', 'Cold resistance; acclimated to altitude.']] });
R('aasimar_volo', { name: 'Aasimar (Volo)', src: 'VGM', size: 'Medium', speed: 30, asi: { cha: 2 }, darkvision: 60, languages: ['Common', 'Celestial'],
  spells: [[1, 'Light', 'cantrip (CHA)']],
  traits: [['Celestial Resistance', 'Resistance to necrotic and radiant damage.'], ['Healing Hands', 'Action: touch to heal HP equal to your level.', { max: '1', reset: 'long', col: 'action' }], ['Light Bearer', 'Know light.']],
  subraces: {
    protector: { name: 'Protector Aasimar', asi: { wis: 1 }, traits: [['Radiant Soul', 'At 3rd: sprout wings for 1 minute (fly 30), +level radiant once per turn.', { max: '1', reset: 'long', minLevel: 3, col: 'action' }]] },
    scourge: { name: 'Scourge Aasimar', asi: { con: 1 }, traits: [['Radiant Consumption', 'At 3rd: radiate light for 1 minute dealing radiant damage around you; +level radiant once per turn.', { max: '1', reset: 'long', minLevel: 3, col: 'action' }]] },
    fallen: { name: 'Fallen Aasimar', asi: { str: 1 }, traits: [['Necrotic Shroud', 'At 3rd: frighten nearby creatures (CHA save) and deal +level necrotic once per turn for 1 minute.', { max: '1', reset: 'long', minLevel: 3, col: 'action' }]] } } });
R('firbolg_volo', { name: 'Firbolg (Volo)', src: 'VGM', size: 'Medium', speed: 30, asi: { wis: 2, str: 1 }, languages: ['Common', 'Elvish', 'Giant'],
  traits: [['Firbolg Magic', 'Cast detect magic and disguise self once each per short rest (WIS).', { max: '1', reset: 'short' }], ['Hidden Step', 'Bonus action: turn invisible until your next turn.', { max: '1', reset: 'short', col: 'bonus' }], ['Powerful Build', 'Count as one size larger for carrying.'], ['Speech of Beast and Leaf', 'Advantage on CHA checks to influence beasts and plants.']] });
R('kenku_volo', { name: 'Kenku (Volo)', src: 'VGM', size: 'Medium', speed: 30, asi: { dex: 2, wis: 1 }, languages: ['Common', 'Auran'],
  choices: [{ type: 'skill', n: 2, from: ['Acrobatics', 'Deception', 'Stealth', 'Sleight of Hand'] }],
  traits: [['Expert Forgery', 'Advantage on checks to duplicate writing and craftwork.'], ['Mimicry', 'Mimic sounds and voices you have heard.']] });
R('lizardfolk_volo', { name: 'Lizardfolk (Volo)', src: 'VGM', size: 'Medium', speed: 30, swim: 30, asi: { con: 2, wis: 1 }, languages: ['Common', 'Draconic'], natural: [['Bite', '1d6', 'piercing']], naturalArmor: '13+dex',
  choices: [{ type: 'skill', n: 2, from: ['Animal Handling', 'Nature', 'Perception', 'Stealth', 'Survival'] }],
  traits: [['Bite', 'Unarmed strikes can be a 1d6 piercing bite.'], ['Cunning Artisan', 'Craft simple weapons from bones and hide.'], ['Hold Breath', 'Hold breath for 15 minutes.'], ['Natural Armor', 'AC 13 + DEX without armor.'], ['Hungry Jaws', 'Bonus action bite that grants temp HP equal to CON.', { max: '1', reset: 'short', col: 'bonus' }]] });
R('tabaxi_volo', { name: 'Tabaxi (Volo)', src: 'VGM', size: 'Medium', speed: 30, climb: 20, asi: { dex: 2, cha: 1 }, darkvision: 60, languages: ['Common'], skills: ['Perception', 'Stealth'], natural: [['Claws', '1d4', 'slashing']],
  choices: [{ type: 'language', n: 1 }],
  traits: [['Feline Agility', 'Double your speed for a turn; recharges when you spend a turn not moving.'], ["Cat's Claws", '20 ft climb speed; claws deal 1d4 slashing.'], ["Cat's Talent", 'Perception and Stealth proficiency.']] });
R('triton_volo', { name: 'Triton (Volo)', src: 'VGM', size: 'Medium', speed: 30, swim: 30, asi: { str: 1, con: 1, cha: 1 }, languages: ['Common', 'Primordial'],
  spells: [[1, 'Fog Cloud', 'once per long rest (CHA)'], [3, 'Gust of Wind', 'once per long rest'], [5, 'Wall of Water', 'once per long rest']],
  traits: [['Amphibious', 'Breathe air and water.'], ['Emissary of the Sea', 'Communicate simple ideas with water-breathing beasts.'], ['Guardians of the Depths', 'Cold resistance; ignore deep-water drawbacks.']] });
R('bugbear_volo', { name: 'Bugbear (Volo)', src: 'VGM', size: 'Medium', speed: 30, asi: { str: 2, dex: 1 }, darkvision: 60, languages: ['Common', 'Goblin'], skills: ['Stealth'],
  traits: [['Long-Limbed', '+5 ft reach on your turn.'], ['Powerful Build', 'Count as one size larger for carrying.'], ['Sneaky', 'Stealth proficiency.'], ['Surprise Attack', '+2d6 damage once on a surprised creature in the first round.']] });
R('goblin_volo', { name: 'Goblin (Volo)', src: 'VGM', size: 'Small', speed: 30, asi: { dex: 2, con: 1 }, darkvision: 60, languages: ['Common', 'Goblin'],
  traits: [['Fury of the Small', 'Deal extra damage equal to your level to a larger creature.', { max: '1', reset: 'short' }], ['Nimble Escape', 'Disengage or Hide as a bonus action.']] });
R('hobgoblin_volo', { name: 'Hobgoblin (Volo)', src: 'VGM', size: 'Medium', speed: 30, asi: { con: 2, int: 1 }, darkvision: 60, languages: ['Common', 'Goblin'], armorCats: ['light'],
  choices: [{ type: 'weapon', n: 2, from: 'martial' }],
  traits: [['Martial Training', 'Light armor and two martial weapons.'], ['Saving Face', 'Add +1 per visible ally (max +5) to a missed roll.', { max: '1', reset: 'short' }]] });
R('kobold_volo', { name: 'Kobold (Volo)', src: 'VGM', size: 'Small', speed: 30, asi: { dex: 2, str: -2 }, darkvision: 60, languages: ['Common', 'Draconic'],
  traits: [['Grovel, Cower, and Beg', 'Action: allies gain advantage on attacks against enemies within 10 ft of you.', { max: '1', reset: 'short', col: 'action' }], ['Pack Tactics', 'Advantage on attacks when an ally is within 5 ft of the target.'], ['Sunlight Sensitivity', 'Disadvantage on attacks and sight-based Perception in direct sunlight.']] });
R('orc_volo', { name: 'Orc (Volo)', src: 'VGM', size: 'Medium', speed: 30, asi: { str: 2, con: 1, int: -2 }, darkvision: 60, languages: ['Common', 'Orc'], skills: ['Intimidation'],
  traits: [['Aggressive', 'Bonus action: move up to your speed toward a hostile creature.'], ['Menacing', 'Intimidation proficiency.'], ['Powerful Build', 'Count as one size larger for carrying.']] });
R('yuanti_volo', { name: 'Yuan-ti Pureblood (Volo)', src: 'VGM', size: 'Medium', speed: 30, asi: { cha: 2, int: 1 }, darkvision: 60, languages: ['Common', 'Abyssal', 'Draconic'],
  spells: [[1, 'Poison Spray', 'cantrip (CHA)'], [1, 'Animal Friendship', 'snakes only, at will'], [3, 'Suggestion', 'once per long rest']],
  traits: [['Magic Resistance', 'Advantage on saves against spells and magical effects.'], ['Poison Immunity', 'Immune to poison damage and the poisoned condition.']] });

// ---------- Mordenkainen Presents: Monsters of the Multiverse (flexible ASIs) ----------
R('aarakocra', { name: 'Aarakocra', src: 'MPMM', size: 'Medium', speed: 30, fly: 30, asi: 'flex', languages: ['Common'], natural: [['Talons', '1d6', 'slashing']], choices: [{ type: 'language', n: 1 }],
  spells: [[3, 'Gust of Wind', 'once per long rest or with a slot']],
  traits: [['Flight', '30 ft flying speed; not in medium or heavy armor.'], ['Talons', 'Unarmed strikes deal 1d6 slashing.'], ['Wind Caller', 'At 3rd level, cast gust of wind.']] });
R('aasimar', { name: 'Aasimar', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common'], choices: [{ type: 'language', n: 1 }, { type: 'option', label: 'Celestial Revelation', options: [['Heavenly Wings', '30 ft fly speed'], ['Inner Radiance', 'radiant aura damage'], ['Necrotic Shroud', 'frighten nearby creatures']] }],
  spells: [[1, 'Light', 'cantrip (CHA)']],
  traits: [['Celestial Resistance', 'Resistance to necrotic and radiant damage.'], ['Healing Hands', 'Action: heal prof-bonus d4s.', { max: '1', reset: 'long', col: 'action' }], ['Light Bearer', 'Know light.'], ['Celestial Revelation', 'At 3rd level, bonus action transformation for 1 minute; once per turn deal +prof radiant or necrotic.', { max: '1', reset: 'long', minLevel: 3, col: 'bonus' }]] });
R('bugbear', { name: 'Bugbear', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common'], skills: ['Stealth'], choices: [{ type: 'language', n: 1 }],
  traits: [['Fey Ancestry', 'Advantage vs being charmed.'], ['Long-Limbed', '+5 ft reach for melee attacks on your turn.'], ['Powerful Build', 'Count as one size larger for carrying.'], ['Sneaky', 'Stealth proficiency; squeeze through Small spaces.'], ['Surprise Attack', '+2d6 damage to a creature that hasn\'t acted yet in combat.']] });
R('centaur', { name: 'Centaur', src: 'MPMM', size: 'Medium', speed: 40, asi: 'flex', languages: ['Common'], natural: [['Hooves', '1d6', 'bludgeoning']], choices: [{ type: 'language', n: 1 }, { type: 'skill', n: 1, from: ['Animal Handling', 'Medicine', 'Nature', 'Survival'] }],
  traits: [['Charge', 'After moving 30 ft straight, bonus-action hoof attack on a hit.'], ['Equine Build', 'Count as larger for carrying; climbing costs extra.'], ['Hooves', 'Unarmed strikes deal 1d6 bludgeoning.'], ['Natural Affinity', 'One of Animal Handling, Medicine, Nature or Survival.']] });
R('changeling', { name: 'Changeling', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common'], choices: [{ type: 'language', n: 1 }, { type: 'skill', n: 2, from: ['Deception', 'Insight', 'Intimidation', 'Performance', 'Persuasion'] }],
  traits: [['Changeling Instincts', 'Two of Deception, Insight, Intimidation, Performance, Persuasion.'], ['Shapechanger', 'Action: change your appearance and voice.']] });
R('deepgnome', { name: 'Deep Gnome', src: 'MPMM', size: 'Small', speed: 30, asi: 'flex', darkvision: 120, languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  spells: [[3, 'Disguise Self', 'once per long rest'], [5, 'Nondetection', 'self, once per long rest']],
  traits: [['Gnomish Magic Resistance', 'Advantage on INT, WIS and CHA saves vs spells.'], ['Svirfneblin Camouflage', 'Advantage on a Stealth check.', { max: 'prof', reset: 'long' }]] });
R('duergar', { name: 'Duergar', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 120, languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  spells: [[3, 'Enlarge/Reduce', 'self, once per long rest'], [5, 'Invisibility', 'self, once per long rest']],
  traits: [['Dwarven Resilience', 'Advantage vs poison; resistance to poison damage.'], ['Psionic Fortitude', 'Advantage on saves vs charmed and stunned.']] });
R('eladrin', { name: 'Eladrin', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common'], skills: ['Perception'], choices: [{ type: 'language', n: 1 }, { type: 'option', label: 'Season', options: [['Autumn', 'charm'], ['Winter', 'frighten'], ['Spring', 'teleport an ally'], ['Summer', 'fire damage']] }],
  traits: [['Fey Ancestry', 'Advantage vs being charmed.'], ['Fey Step', 'Bonus action: teleport 30 ft with a seasonal effect at 3rd level.', { max: 'prof', reset: 'long', col: 'bonus' }], ['Keen Senses', 'Perception proficiency.'], ['Trance', 'Meditate 4 hours; gain a skill or tool proficiency until your next long rest.']] });
R('fairy', { name: 'Fairy', src: 'MPMM', size: 'Small', speed: 30, fly: 30, asi: 'flex', languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  spells: [[1, 'Druidcraft', 'cantrip'], [3, 'Faerie Fire', 'once per long rest'], [5, 'Enlarge/Reduce', 'once per long rest']],
  traits: [['Fairy Magic', 'Druidcraft; faerie fire at 3rd; enlarge/reduce at 5th.'], ['Flight', 'Flying speed equal to walking; not in medium or heavy armor.']] });
R('firbolg', { name: 'Firbolg', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  spells: [[1, 'Detect Magic', 'once per long rest'], [1, 'Disguise Self', 'once per long rest']],
  traits: [['Hidden Step', 'Bonus action: turn invisible until the start of your next turn.', { max: 'prof', reset: 'long', col: 'bonus' }], ['Powerful Build', 'Count as one size larger for carrying.'], ['Speech of Beast and Leaf', 'Advantage on CHA checks with beasts and plants.']] });
R('genasi', { name: 'Genasi', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common', 'Primordial'],
  subraces: {
    air: { name: 'Air Genasi', speed: 35, spells: [[1, 'Shocking Grasp', 'cantrip'], [3, 'Feather Fall', 'once per long rest'], [5, 'Levitate', 'once per long rest']], traits: [['Unending Breath', 'Hold breath indefinitely.'], ['Lightning Resistance', 'Resistance to lightning damage.']] },
    earth: { name: 'Earth Genasi', spells: [[1, 'Blade Ward', 'cantrip (bonus action, prof/long rest)'], [5, 'Pass without Trace', 'once per long rest']], traits: [['Earth Walk', 'Ignore difficult earth or stone terrain.']] },
    fire: { name: 'Fire Genasi', spells: [[1, 'Produce Flame', 'cantrip'], [3, 'Burning Hands', 'once per long rest'], [5, 'Flame Blade', 'once per long rest']], traits: [['Fire Resistance', 'Resistance to fire damage.']] },
    water: { name: 'Water Genasi', swim: 30, spells: [[1, 'Acid Splash', 'cantrip'], [3, 'Create or Destroy Water', 'once per long rest'], [5, 'Water Walk', 'once per long rest']], traits: [['Acid Resistance', 'Resistance to acid damage.'], ['Amphibious', 'Breathe air and water.']] } } });
R('githyanki', { name: 'Githyanki', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common', 'Gith'], choices: [{ type: 'language', n: 1 }, { type: 'skill', n: 1, from: 'any' }],
  spells: [[1, 'Mage Hand', 'cantrip, invisible'], [3, 'Jump', 'once per long rest'], [5, 'Misty Step', 'once per long rest']],
  traits: [['Astral Knowledge', 'After a long rest, one skill and one weapon/tool proficiency until your next.'], ['Psychic Resilience', 'Resistance to psychic damage.']] });
R('githzerai', { name: 'Githzerai', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common', 'Gith'], choices: [{ type: 'language', n: 1 }],
  spells: [[1, 'Mage Hand', 'cantrip, invisible'], [3, 'Shield', 'once per long rest'], [5, 'Detect Thoughts', 'once per long rest']],
  traits: [['Mental Discipline', 'Advantage on saves vs charmed and frightened.'], ['Psychic Resilience', 'Resistance to psychic damage.']] });
R('goblin', { name: 'Goblin', src: 'MPMM', size: 'Small', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common', 'Goblin'],
  traits: [['Fey Ancestry', 'Advantage vs being charmed.'], ['Fury of the Small', 'Once per turn, deal extra damage equal to prof bonus to a larger creature.', { max: 'prof', reset: 'long' }], ['Nimble Escape', 'Disengage or Hide as a bonus action.']] });
R('goliath', { name: 'Goliath', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common'], skills: ['Athletics'], choices: [{ type: 'language', n: 1 }],
  traits: [['Little Giant', 'Athletics proficiency; count as larger for carrying.'], ['Mountain Born', 'Cold resistance; acclimated to altitude.'], ["Stone's Endurance", 'Reaction: reduce damage by 1d12 + CON.', { max: 'prof', reset: 'long', col: 'reaction' }]] });
R('harengon', { name: 'Harengon', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common'], skills: ['Perception'], choices: [{ type: 'language', n: 1 }],
  traits: [['Hare-Trigger', 'Add prof bonus to initiative.', { initProf: true }], ['Leporine Senses', 'Perception proficiency.'], ['Lucky Footwork', 'Reaction: add 1d4 to a failed DEX save.'], ['Rabbit Hop', 'Bonus action: jump 5 × prof ft without provoking.', { max: 'prof', reset: 'long', col: 'bonus' }]] });
R('hobgoblin', { name: 'Hobgoblin', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common', 'Goblin'],
  traits: [['Fey Ancestry', 'Advantage vs being charmed.'], ['Fey Gift', 'Help as a bonus action, with an added Hospitality, Passage or Spite effect at 3rd.', { max: 'prof', reset: 'long', col: 'bonus' }], ['Fortune from the Many', 'Add +1 per ally within 30 ft (max +3) to a missed roll.', { max: 'prof', reset: 'long' }]] });
R('kenku', { name: 'Kenku', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common'], choices: [{ type: 'language', n: 1 }, { type: 'skill', n: 2, from: 'any' }],
  traits: [['Expert Duplication', 'Advantage on checks to copy writing or craftwork.'], ['Kenku Recall', 'Gain advantage on a skill check you are proficient in.', { max: 'prof', reset: 'long' }], ['Mimicry', 'Mimic sounds and voices.']] });
R('kobold', { name: 'Kobold', src: 'MPMM', size: 'Small', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common', 'Draconic'], choices: [{ type: 'option', label: 'Kobold Legacy', options: [['Craftiness', 'one skill: Arcana, Investigation, Medicine, Sleight of Hand or Survival'], ['Defiance', 'advantage vs frightened'], ['Draconic Sorcery', 'one sorcerer cantrip']] }],
  traits: [['Draconic Cry', 'Bonus action: allies have advantage on attacks against enemies within 10 ft of you.', { max: 'prof', reset: 'long', col: 'bonus' }], ['Kobold Legacy', 'Craftiness, Defiance or Draconic Sorcery.']] });
R('lizardfolk', { name: 'Lizardfolk', src: 'MPMM', size: 'Medium', speed: 30, swim: 30, asi: 'flex', languages: ['Common'], natural: [['Bite', '1d6', 'piercing']], naturalArmor: '13+dex', choices: [{ type: 'language', n: 1 }, { type: 'skill', n: 2, from: ['Animal Handling', 'Medicine', 'Nature', 'Perception', 'Stealth', 'Survival'] }],
  traits: [['Bite', 'Unarmed strikes can be a 1d6 piercing bite.'], ['Hold Breath', '15 minutes.'], ['Hungry Jaws', 'Bonus action bite that grants temp HP equal to prof bonus.', { max: 'prof', reset: 'long', col: 'bonus' }], ['Natural Armor', 'AC 13 + DEX without armor.'], ["Nature's Intuition", 'Two skills from the list.']] });
R('minotaur', { name: 'Minotaur', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common'], natural: [['Horns', '1d6', 'piercing']], choices: [{ type: 'language', n: 1 }],
  traits: [['Horns', 'Unarmed strikes deal 1d6 piercing.'], ['Goring Rush', 'After Dashing 20 ft, bonus-action horn attack.'], ['Hammering Horns', 'After a melee hit with Attack, bonus-action shove 10 ft.'], ['Labyrinthine Recall', 'Always know north; advantage to navigate.']] });
R('orc', { name: 'Orc', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common', 'Orc'],
  traits: [['Adrenaline Rush', 'Bonus action Dash and gain temp HP equal to prof.', { max: 'prof', reset: 'short', col: 'bonus' }], ['Powerful Build', 'Count as one size larger for carrying.'], ['Relentless Endurance', 'Drop to 1 HP instead of 0.', { max: '1', reset: 'long' }]] });
R('satyr', { name: 'Satyr', src: 'MPMM', size: 'Medium', speed: 35, asi: 'flex', languages: ['Common', 'Sylvan'], skills: ['Performance', 'Persuasion'], natural: [['Ram', '1d4', 'bludgeoning']], choices: [{ type: 'tool', n: 1, from: 'instrument' }],
  traits: [['Ram', 'Unarmed strikes deal 1d4 bludgeoning.'], ['Magic Resistance', 'Advantage on saves vs spells.'], ['Mirthful Leaps', 'Add 1d8 to long or high jumps.'], ['Reveler', 'Performance, Persuasion and one instrument.']] });
R('seaelf', { name: 'Sea Elf', src: 'MPMM', size: 'Medium', speed: 30, swim: 30, asi: 'flex', darkvision: 60, languages: ['Common', 'Elvish'], skills: ['Perception'],
  traits: [['Child of the Sea', 'Breathe water; 30 ft swim speed; cold resistance.'], ['Fey Ancestry', 'Advantage vs being charmed.'], ['Friend of the Sea', 'Communicate simple ideas with swimming beasts.'], ['Keen Senses', 'Perception proficiency.'], ['Trance', 'Meditate 4 hours; gain temporary proficiencies.']] });
R('shadarkai', { name: 'Shadar-kai', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common', 'Elvish'], skills: ['Perception'],
  traits: [['Blessing of the Raven Queen', 'Bonus action: teleport 30 ft; at 3rd, resistance to all damage until your next turn.', { max: 'prof', reset: 'long', col: 'bonus' }], ['Fey Ancestry', 'Advantage vs being charmed.'], ['Necrotic Resistance', 'Resistance to necrotic damage.'], ['Keen Senses', 'Perception proficiency.'], ['Trance', 'Meditate 4 hours.']] });
R('shifter', { name: 'Shifter', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common'], choices: [{ type: 'skill', n: 1, from: ['Acrobatics', 'Athletics', 'Intimidation', 'Survival'] }],
  traits: [['Bestial Instincts', 'One of Acrobatics, Athletics, Intimidation or Survival.'], ['Shifting', 'Bonus action: shift for 1 minute, gaining 2 × prof temp HP plus your subrace benefit.', { max: 'prof', reset: 'long', col: 'bonus' }]],
  subraces: { beasthide: { name: 'Beasthide', traits: [['Beasthide Shift', '+1d6 temp HP and +1 AC while shifted.']] }, longtooth: { name: 'Longtooth', traits: [['Longtooth Shift', 'Bonus-action fang attack (1d6 + STR).']] }, swiftstride: { name: 'Swiftstride', traits: [['Swiftstride Shift', '+10 ft speed; reaction move 10 ft.']] }, wildhunt: { name: 'Wildhunt', traits: [['Wildhunt Shift', 'Advantage on WIS checks; no advantage against you.']] } } });
R('tabaxi', { name: 'Tabaxi', src: 'MPMM', size: 'Medium', speed: 30, climb: 30, asi: 'flex', darkvision: 60, languages: ['Common'], skills: ['Perception', 'Stealth'], natural: [['Claws', '1d6', 'slashing']], choices: [{ type: 'language', n: 1 }],
  traits: [["Cat's Claws", 'Climb speed equal to walking; claws deal 1d6 slashing.'], ["Cat's Talent", 'Perception and Stealth.'], ['Feline Agility', 'Double speed for a turn; recharges after a turn without moving.']] });
R('tortle', { name: 'Tortle', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common'], natural: [['Claws', '1d6', 'slashing']], naturalArmor: '17', noDexArmor: true, choices: [{ type: 'language', n: 1 }, { type: 'skill', n: 1, from: ['Animal Handling', 'Medicine', 'Nature', 'Perception', 'Stealth', 'Survival'] }],
  traits: [['Claws', 'Unarmed strikes deal 1d6 slashing.'], ['Hold Breath', '1 hour.'], ['Natural Armor', 'Base AC 17 (DEX not added); shields still apply.'], ["Nature's Intuition", 'One skill from the list.'], ['Shell Defense', 'Action: withdraw into your shell for +4 AC and advantage on STR/CON saves.']] });
R('triton', { name: 'Triton', src: 'MPMM', size: 'Medium', speed: 30, swim: 30, asi: 'flex', darkvision: 60, languages: ['Common', 'Primordial'],
  spells: [[1, 'Fog Cloud', 'once per long rest'], [3, 'Gust of Wind', 'once per long rest'], [5, 'Water Walk', 'once per long rest']],
  traits: [['Amphibious', 'Breathe air and water.'], ['Emissary of the Sea', 'Communicate simple ideas with water creatures.'], ['Guardian of the Depths', 'Cold resistance.']] });
R('yuanti', { name: 'Yuan-ti', src: 'MPMM', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  spells: [[1, 'Poison Spray', 'cantrip'], [1, 'Animal Friendship', 'snakes, at will'], [3, 'Suggestion', 'once per long rest']],
  traits: [['Magic Resistance', 'Advantage on saves vs spells.'], ['Poison Resilience', 'Advantage vs poisoned; resistance to poison damage.']] });

// ---------- Eberron (Wayfinder's Guide) ----------
R('changeling_wg', { name: 'Changeling (Eberron)', src: 'WGtE', size: 'Medium', speed: 30, asi: { cha: 2 }, languages: ['Common'], choices: [{ type: 'asi', n: 1, amount: 1, exclude: ['cha'] }, { type: 'skill', n: 2, from: ['Deception', 'Insight', 'Intimidation', 'Persuasion'] }, { type: 'language', n: 2 }],
  traits: [['Shapechanger', 'Action: change your appearance and voice.'], ['Changeling Instincts', 'Two of Deception, Insight, Intimidation, Persuasion.']] });
R('kalashtar', { name: 'Kalashtar', src: 'WGtE', size: 'Medium', speed: 30, asi: { wis: 2, cha: 1 }, languages: ['Common', 'Quori'], choices: [{ type: 'language', n: 1 }],
  traits: [['Dual Mind', 'Advantage on WIS saves.'], ['Mental Discipline', 'Resistance to psychic damage.'], ['Mind Link', 'Telepathy 10 × level ft.'], ['Severed from Dreams', 'Immune to dream-based magic.']] });
R('shifter_wg', { name: 'Shifter (Eberron)', src: 'WGtE', size: 'Medium', speed: 30, asi: {}, darkvision: 60, languages: ['Common'],
  traits: [['Shifting', 'Bonus action: shift for 1 minute, gaining level + CON temp HP and a subrace benefit.', { max: '1', reset: 'short', col: 'bonus' }]],
  subraces: { beasthide: { name: 'Beasthide', asi: { con: 2, str: 1 }, skills: ['Athletics'] }, longtooth: { name: 'Longtooth', asi: { str: 2, dex: 1 }, skills: ['Intimidation'] }, swiftstride: { name: 'Swiftstride', asi: { dex: 2, cha: 1 }, skills: ['Acrobatics'] }, wildhunt: { name: 'Wildhunt', asi: { wis: 2, dex: 1 }, skills: ['Survival'] } } });
R('warforged', { name: 'Warforged', src: 'WGtE', size: 'Medium', speed: 30, asi: { con: 2 }, languages: ['Common'], acBonus: 1, choices: [{ type: 'asi', n: 1, amount: 1, exclude: ['con'] }, { type: 'skill', n: 1, from: 'any' }, { type: 'tool', n: 1, from: 'any' }, { type: 'language', n: 1 }],
  traits: [['Constructed Resilience', 'Advantage vs poison, resistance to poison; no need to eat, drink, breathe or sleep; immune to disease.'], ["Sentry's Rest", 'Rest inactive but aware for 6 hours.'], ['Integrated Protection', '+1 AC; armor takes an hour to don.'], ['Specialized Design', 'One skill and one tool.']] });
R('dragonmarked', { name: 'Dragonmarked (Eberron)', src: 'WGtE', size: 'Medium', speed: 30, asi: {}, languages: ['Common'],
  choices: [{ type: 'option', label: 'Dragonmark', options: [['Mark of Detection (half-elf)', 'WIS +2, one other +1'], ['Mark of Finding (half-orc/human)', 'WIS +2, CON +1'], ['Mark of Handling (human)', 'WIS +2, one other +1'], ['Mark of Healing (halfling)', 'DEX +2, WIS +1'], ['Mark of Hospitality (halfling)', 'DEX +2, CHA +1'], ['Mark of Making (human)', 'INT +2, one other +1'], ['Mark of Passage (human)', 'DEX +2, one other +1'], ['Mark of Scribing (gnome)', 'INT +2, CHA +1'], ['Mark of Sentinel (human)', 'CON +2, WIS +1'], ['Mark of Shadow (elf)', 'DEX +2, CHA +1'], ['Mark of Storm (half-elf)', 'CHA +2, DEX +1'], ['Mark of Warding (dwarf)', 'CON +2, INT +1']] }, { type: 'asi', n: 2, amount: 1, note: 'Set to match your mark (e.g. +2 and +1)' }],
  traits: [['Dragonmark', 'Your mark grants a spellcasting bonus, expanded spell list and minor magic. Record its details here.']] });

// ---------- Van Richten's lineages ----------
R('dhampir', { name: 'Dhampir (lineage)', src: 'VRGR', size: 'Medium', speed: 35, climb: 35, asi: 'lineage', darkvision: 60, languages: ['Common'], natural: [['Vampiric Bite', '1d4', 'piercing']], choices: [{ type: 'language', n: 1 }],
  traits: [['Ancestral Legacy', 'Optionally keep skill proficiencies and climb/fly/swim speeds of your previous race.'], ['Deathless Nature', "No need to breathe."], ['Spider Climb', 'Climb speed; walk on ceilings at 3rd level.'], ['Vampiric Bite', '1d4 + CON piercing; on a hit, heal or empower your next roll.', { max: 'prof', reset: 'long' }]] });
R('hexblood', { name: 'Hexblood (lineage)', src: 'VRGR', size: 'Medium', speed: 30, asi: 'lineage', darkvision: 60, languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  spells: [[1, 'Disguise Self', 'once per long rest'], [1, 'Hex', 'once per long rest']],
  traits: [['Ancestral Legacy', 'Optionally keep skill proficiencies and speeds of your previous race.'], ['Eerie Token', 'Bonus action: create a token for telepathic messages or remote viewing.', { max: '1', reset: 'long', col: 'bonus' }], ['Hex Magic', 'Disguise self and hex once each per long rest.']] });
R('reborn', { name: 'Reborn (lineage)', src: 'VRGR', size: 'Medium', speed: 30, asi: 'lineage', languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  traits: [['Ancestral Legacy', 'Optionally keep skill proficiencies and speeds of your previous race.'], ['Deathless Nature', 'Advantage vs disease and poison; resistance to poison; death save advantage; no food, water or sleep.'], ['Knowledge from a Past Life', 'Add 1d6 to an ability check.', { max: 'prof', reset: 'long' }]] });

// ---------- Tasha's ----------
R('customlineage', { name: 'Custom Lineage', src: 'TCE', size: 'Medium or Small', speed: 30, asi: 'lineage1', languages: ['Common'], choices: [{ type: 'language', n: 1 }, { type: 'feat', n: 1 }, { type: 'option', label: 'Variable Trait', options: [['Darkvision', '60 ft darkvision'], ['Skill', 'one skill proficiency']] }],
  traits: [['Custom Lineage', '+2 to one score, a feat, darkvision or a skill, and a language.']] });

// ---------- Spelljammer: Adventures in Space (off unless the book is turned on) ----------
R('astralelf', { name: 'Astral Elf', src: 'AAG', size: 'Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common'], skills: ['Perception'],
  choices: [{ type: 'language', n: 1 }, { type: 'cantrip', n: 1, list: ['Dancing Lights', 'Light', 'Sacred Flame'], ab: 'wis', label: 'Astral Fire' }],
  traits: [['Astral Fire', 'You know Dancing Lights, Light or Sacred Flame (your pick). Intelligence, Wisdom or Charisma is its spellcasting ability, chosen when you take this race.'], ['Fey Ancestry', 'Advantage vs being charmed.'], ['Keen Senses', 'Perception proficiency.'], ['Starlight Step', 'Bonus action: teleport up to 30 ft to an unoccupied space you can see.', { max: 'prof', reset: 'long', col: 'bonus' }], ['Astral Trance', 'Rest in a 4-hour trance instead of sleeping; afterwards gain one skill and one weapon or tool proficiency until your next long rest.']] });
R('autognome', { name: 'Autognome', src: 'AAG', size: 'Small', speed: 30, asi: 'flex', languages: ['Common'], naturalArmor: '13+dex', choices: [{ type: 'language', n: 1 }, { type: 'tool', n: 2, from: 'any' }],
  traits: [['Armored Casing', 'Without armor, your base AC is 13 + DEX.'], ['Built for Success', 'After seeing the roll, add 1d4 to an attack roll, ability check or saving throw.', { max: 'prof', reset: 'long' }], ['Healing Machine', 'When Mending is cast on you, you can spend a Hit Die to heal. Healing spells that normally skip constructs (Cure Wounds, Healing Word, their mass versions and Spare the Dying) work on you.'], ['Mechanical Nature', 'Resistance to poison; immune to disease; advantage on saves vs being paralyzed or poisoned; no need to eat, drink or breathe.'], ["Sentry's Rest", 'A long rest is 6 hours of inactivity, during which you stay aware.'], ['Specialized Design', 'Two tool proficiencies of your choice.']] });
R('giff', { name: 'Giff', src: 'AAG', size: 'Medium', speed: 30, swim: 30, asi: 'flex', languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  traits: [['Astral Spark', 'When you hit with a simple or martial weapon, deal extra force damage equal to your proficiency bonus (once per turn).', { max: 'prof', reset: 'long' }], ['Firearms Mastery', 'Proficient with firearms; you ignore their loading property and long range doesn’t give you disadvantage with them.'], ['Hippo Build', 'Advantage on Strength checks and saves; you count as one size larger for carrying, pushing, dragging and lifting.']] });
R('hadozee', { name: 'Hadozee', src: 'AAG', size: 'Small or Medium', speed: 30, climb: 30, asi: 'flex', languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  traits: [['Dexterous Feet', 'Bonus action: use an object with your feet (the Use an Object action).'], ['Glide', 'When you fall at least 10 ft and aren’t incapacitated, use your reaction to glide up to your walking speed sideways and take no falling damage.'], ['Hadozee Dodge', 'Reaction when you take damage: reduce it by 1d6 + your proficiency bonus.', { max: 'prof', reset: 'long', col: 'reaction' }]] });
R('plasmoid', { name: 'Plasmoid', src: 'AAG', size: 'Small or Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common'], choices: [{ type: 'language', n: 1 }],
  traits: [['Amorphous', 'Squeeze through a 1-inch gap while carrying and wearing nothing; advantage on checks to start or escape a grapple.'], ['Hold Breath', '1 hour.'], ['Natural Resilience', 'Resistance to acid and poison; advantage on saves vs being poisoned.'], ['Shape Self', 'Action: reshape into a rough humanoid form (and wear gear made for Medium folk) or back into a blob. Bonus action: extend or pull back a pseudopod up to 10 ft long that can handle objects (no attacks, no magic items, 10 lb max).']] });
R('thrikreen', { name: 'Thri-kreen', src: 'AAG', size: 'Small or Medium', speed: 30, asi: 'flex', darkvision: 60, languages: ['Common'], naturalArmor: '13+dex', choices: [{ type: 'language', n: 1 }],
  traits: [['Chameleon Carapace', 'Without armor, your base AC is 13 + DEX. Action: shift your color to match your surroundings for advantage on Stealth checks to hide there.'], ['Secondary Arms', 'A smaller pair of arms that can handle objects and wield light weapons.'], ['Sleepless', 'You don’t need sleep and stay conscious through a long rest.'], ['Thri-kreen Telepathy', 'Telepathically talk with a creature you can see within 120 ft (it needs to know a language to understand).']] });

DND.raceGroups = [
  ['Player\'s Handbook', ['dwarf', 'elf', 'halfling', 'human', 'dragonborn', 'gnome', 'halfelf', 'halforc', 'tiefling']],
  ['Monsters of the Multiverse', ['aarakocra', 'aasimar', 'bugbear', 'centaur', 'changeling', 'deepgnome', 'duergar', 'eladrin', 'fairy', 'firbolg', 'genasi', 'githyanki', 'githzerai', 'goblin', 'goliath', 'harengon', 'hobgoblin', 'kenku', 'kobold', 'lizardfolk', 'minotaur', 'orc', 'satyr', 'seaelf', 'shadarkai', 'shifter', 'tabaxi', 'tortle', 'triton', 'yuanti']],
  ['Volo\'s & Elemental Evil (original versions)', ['aarakocra_ee', 'aasimar_volo', 'bugbear_volo', 'firbolg_volo', 'genasi_ee', 'goblin_volo', 'goliath_ee', 'hobgoblin_volo', 'kenku_volo', 'kobold_volo', 'lizardfolk_volo', 'orc_volo', 'tabaxi_volo', 'triton_volo', 'yuanti_volo']],
  ['Eberron', ['changeling_wg', 'kalashtar', 'shifter_wg', 'warforged', 'dragonmarked']],
  ['Van Richten\'s lineages', ['dhampir', 'hexblood', 'reborn']],
  ['Tasha\'s', ['customlineage']],
  ['Spelljammer', ['astralelf', 'autognome', 'giff', 'hadozee', 'plasmoid', 'thrikreen']]
];
