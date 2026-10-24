// Race trait automation (non-UA races in data/races.js, plus UA subraces attached to them in ua_races.js).
// Keys are 'race:<Trait Name>'. Several races share a trait name with different numbers (Breath Weapon,
// Healing Hands, Fury of the Small, Hungry Jaws, Shifting…): those records offer one sub-option per version.
// Already handled by race data or the engine (not repeated here): darkvision, speeds, languages, skill/weapon/armor
// proficiencies, natural weapons, racial spells, natural armor, Warforged +1 AC, hill dwarf HP, Powerful Build /
// Little Giant carrying, Savage Attacks crit die, dwarf heavy-armor speed, Hare-Trigger initiative.
(function () {
  const NONE = { none: true };
  const charm = 'Saves vs being charmed';
  Object.assign(DND.featFx, {
    // ---------- Spelljammer ----------
    'race:Astral Fire': NONE,
    'race:Starlight Step': { resource: true, acts: [{ name: 'Starlight Step', col: 'bonus', cost: true, text: 'Teleport up to 30 ft to an unoccupied space you can see.' }] },
    'race:Astral Trance': { trigger: 'longRest', triggerLabel: 'Noted', triggerText: 'Astral Trance: choose one skill and one weapon or tool to be proficient with until your next long rest.' },
    'race:Armored Casing': NONE,
    'race:Built for Success': { resource: true, acts: [{ name: 'Built for Success', cost: true, roll: '1d4', rollNote: 'added to the attack roll, check or save' }] },
    'race:Healing Machine': { text: 'Mending cast on you: spend a Hit Die and heal its roll + CON. Cure Wounds, Healing Word, Mass Cure Wounds, Mass Healing Word and Spare the Dying work on you.' },
    'race:Mechanical Nature': { passive: { resist: ['poison'], immune: ['disease'], advNote: 'Saves vs being paralyzed or poisoned' } },
    "race:Sentry's Rest": NONE,
    'race:Specialized Design': NONE,
    'race:Astral Spark': { resource: true, acts: [{ name: 'Astral Spark', cost: true, roll: '{prof}', rollNote: 'extra force damage on a weapon hit (once per turn)' }] },
    'race:Firearms Mastery': { text: 'Proficient with all firearms; ignore the loading property; no disadvantage at long range with them.' },
    'race:Hippo Build': { passive: { advNote: 'Strength checks and Strength saves' } },
    'race:Dexterous Feet': { col: 'bonus', text: 'Use an Object with your feet.' },
    'race:Glide': { col: 'reaction', text: 'When you fall 10 ft or more: glide sideways up to your walking speed and take no falling damage.' },
    'race:Hadozee Dodge': { resource: true, acts: [{ name: 'Hadozee Dodge', col: 'reaction', cost: true, roll: '1d6+{prof}', rollNote: 'damage reduced' }] },
    'race:Amorphous': { passive: { advNote: 'Checks to start or escape a grapple' } },
    'race:Natural Resilience': { passive: { resist: ['acid', 'poison'], advNote: 'Saves vs being poisoned' } },
    'race:Shape Self': { col: 'action', text: 'Action: take a rough humanoid shape or return to a blob. Bonus action: extend or retract a 10 ft pseudopod for handling objects (no attacks or magic items, 10 lb max).' },
    'race:Chameleon Carapace': { col: 'action', text: 'Change color to match your surroundings: advantage on Stealth checks to hide in them.' },
    'race:Secondary Arms': NONE,
    'race:Sleepless': NONE,
    'race:Thri-kreen Telepathy': { passive: { sense: 'Telepathy 120 ft (one creature you can see)' } },

    // ---------- Dwarf / Duergar ----------
    'race:Dwarven Resilience': { passive: { resist: ['poison'], advNote: 'Saves vs poison' } },
    'race:Dwarven Combat Training': NONE,
    'race:Stonecunning': { text: 'History checks about the origin of stonework: you count as proficient and add double your proficiency bonus (+{2*prof}).' },
    'race:Heavy Armor Speed': NONE,
    'race:Dwarven Toughness': NONE,
    'race:Dwarven Armor Training': NONE,
    'race:Duergar Resilience': { passive: { advNote: 'Saves vs illusions and vs being charmed or paralyzed' } },
    'race:Sunlight Sensitivity': { passive: { sense: 'Sunlight Sensitivity: disadvantage on attacks and sight-based Perception in direct sunlight' } },
    'race:Psionic Fortitude': { passive: { advNote: 'Saves to avoid or end being charmed or stunned' } },

    // ---------- Elf / Half-Elf ----------
    'race:Keen Senses': NONE,
    'race:Fey Ancestry': { passive: { advNote: charm, immune: ['magical sleep'] } },
    'race:Trance': NONE,
    'race:Elf Weapon Training': NONE,
    'race:Cantrip': NONE,
    'race:Fleet of Foot': NONE,
    'race:Mask of the Wild': { text: 'You can try to hide even when only lightly obscured by foliage, heavy rain, falling snow, mist and other natural phenomena.' },
    'race:Drow Weapon Training': NONE,
    'race:Flight': NONE,
    'race:Grugach Weapon Training': NONE,
    'race:Sylvan Tongue': NONE,
    'race:Skill Versatility': NONE,
    'race:Elf Cantrip': NONE,
    'race:Elf Weapon Training or Fleet of Foot': NONE,
    'race:Drow Magic': NONE,
    'race:Swim Speed': { passive: { swim: 30 } },

    // ---------- Halfling ----------
    'race:Lucky': { text: 'When you roll a 1 on the d20 for an attack roll, ability check or saving throw, reroll the die and use the new roll.' },
    'race:Brave': { passive: { advNote: 'Saves vs being frightened' } },
    'race:Halfling Nimbleness': NONE,
    'race:Naturally Stealthy': { text: 'You can attempt to hide even when obscured only by a creature at least one size larger than you.' },
    'race:Stout Resilience': { passive: { resist: ['poison'], advNote: 'Saves vs poison' } },
    'race:Silent Speech': { passive: { sense: 'Telepathy 30 ft (creatures that share a language)' } },

    // ---------- Human / Revenant (UA subrace on PHB races) ----------
    'race:Versatile': NONE,
    'race:Human Revenant': NONE,
    'race:Tiefling Revenant': NONE,
    'race:Relentless Nature': { use: { heal: '1' }, onlyWhen: { hpBelowHalf: true }, text: 'At the start of your turn, regain 1 HP while below half your HP maximum (and above 0).' },
    'race:Necrotic Ancestry': { passive: { resist: ['necrotic'] }, text: 'Your Breath Weapon deals necrotic damage.' },

    // ---------- Dragonborn (PHB, FTD, Revenant) ----------
    'race:Breath Weapon': { resource: true, acts: [
      { name: 'Breath Weapon (PHB)', col: 'action', cost: true, roll: '{tier(level,1,2,6,3,11,4,16,5)}d6', rollNote: 'ancestry damage, half on a save (5×30 ft line or 15 ft cone)', dc: 'con', save: 'DEX (CON for green, silver, white)' },
      { name: 'Breath Weapon (Fizban\'s)', col: 'action', cost: true, roll: '{tier(level,1,1,5,2,11,3,17,4)}d10', rollNote: 'ancestry damage, half on a save (replaces one attack; 15 ft cone or 5×30 ft line)', dc: 'con', save: 'DEX' }] },
    'race:Damage Resistance': { passive: { resist: ['your ancestry'] } },
    'race:Draconic Resistance': { passive: { resist: ['your ancestry'] } },
    'race:Chromatic Warding': { col: 'action', use: { effect: { name: 'Chromatic Warding', rounds: 10, buff: { note: 'Immune to your ancestry damage type' } } } },
    'race:Metallic Breath Weapon': { col: 'action', resource: true, acts: [
      { name: 'Enervating Breath', col: 'action', cost: true, dc: 'con', save: 'CON', text: '15 ft cone: on a failed save, incapacitated until the start of your next turn.' },
      { name: 'Repulsion Breath', col: 'action', cost: true, dc: 'con', save: 'STR', text: '15 ft cone: on a failed save, pushed 20 ft away and knocked prone.' }] },
    'race:Psionic Mind': { passive: { sense: 'Telepathy 30 ft' } },
    'race:Gem Flight': { use: { effect: { name: 'Gem Flight', rounds: 10, buff: { fly: 'walk', note: 'Can hover' } } } },

    // ---------- Gnome ----------
    'race:Gnome Cunning': { passive: { advNote: 'INT, WIS and CHA saves vs magic' } },
    'race:Natural Illusionist': NONE,
    'race:Speak with Small Beasts': NONE,
    "race:Artificer's Lore": { text: 'History checks about magic items, alchemical objects or technological devices: add double your proficiency bonus (+{2*prof}).' },
    'race:Tinker': NONE,
    'race:Stone Camouflage': { passive: { advNote: 'Stealth to hide in rocky terrain' } },
    'race:Gnomish Magic Resistance': { passive: { advNote: 'INT, WIS and CHA saves vs spells' } },
    'race:Svirfneblin Camouflage': { text: 'Make this Dexterity (Stealth) check with advantage.' },

    // ---------- Half-Orc / Orc ----------
    'race:Menacing': NONE,
    'race:Relentless Endurance': { trigger: 'zero', triggerLabel: 'Drop to 1 HP', triggerText: 'Relentless Endurance: you drop to 1 HP instead (not if killed outright).', use: { setHp: 1 } },
    'race:Savage Attacks': NONE,
    'race:Adrenaline Rush': { col: 'bonus', dash: true, use: { temp: '{prof}' } },
    'race:Aggressive': { col: 'bonus', dash: true, text: 'Move toward a hostile creature you can see or hear; you must end closer to it.' },

    // ---------- Tiefling ----------
    'race:Hellish Resistance': { passive: { resist: ['fire'] } },
    'race:Winged': NONE,

    // ---------- Aarakocra / Genasi / Triton / Sea elf ----------
    'race:Talons': NONE,
    'race:Wind Caller': NONE,
    'race:Unending Breath': NONE,
    'race:Earth Walk': NONE,
    'race:Fire Resistance': { passive: { resist: ['fire'] } },
    'race:Acid Resistance': { passive: { resist: ['acid'] } },
    'race:Lightning Resistance': { passive: { resist: ['lightning'] } },
    'race:Amphibious': NONE,
    'race:Emissary of the Sea': NONE,
    'race:Guardians of the Depths': { passive: { resist: ['cold'] } },
    'race:Guardian of the Depths': { passive: { resist: ['cold'] } },
    'race:Child of the Sea': { passive: { resist: ['cold'] } },
    'race:Friend of the Sea': NONE,

    // ---------- Goliath ----------
    'race:Natural Athlete': NONE,
    'race:Little Giant': NONE,
    'race:Powerful Build': NONE,
    'race:Mountain Born': { passive: { resist: ['cold'] } },
    "race:Stone's Endurance": { col: 'reaction', roll: '1d12+con', rollNote: 'damage reduced' },

    // ---------- Aasimar (Volo and MPMM) ----------
    'race:Celestial Resistance': { passive: { resist: ['necrotic', 'radiant'] } },
    'race:Light Bearer': NONE,
    'race:Healing Hands': { resource: true, acts: [
      { name: 'Healing Hands (MPMM)', col: 'action', cost: true, roll: '{prof}d4', rollNote: 'healing to the creature you touch', healRoll: true },
      { name: 'Healing Hands (Volo)', col: 'action', cost: true, roll: '{level}', rollNote: 'healing to the creature you touch', healRoll: true }] },
    'race:Radiant Soul': { col: 'action', roll: '{level}', rollNote: 'extra radiant damage (once per turn, one target)',
      use: { effect: { name: 'Radiant Soul', rounds: 10, buff: { fly: 30, note: `Once per turn +${'{level}'} radiant to one target of an attack or spell` } } }, text: 'Once on each of your turns, one target of your attack or spell takes +{level} radiant damage.' },
    'race:Radiant Consumption': { col: 'action', roll: '{level}', rollNote: 'extra radiant damage (once per turn, one target)',
      use: { effect: { name: 'Radiant Consumption', rounds: 10, buff: { note: 'Bright light 10 ft; you and creatures within 10 ft take radiant damage at the end of your turns' } } },
      text: 'At the end of each of your turns, you and each creature within 10 ft take {ceil(level/2)} radiant damage. Once per turn, one target of your attack or spell takes +{level} radiant.' },
    'race:Necrotic Shroud': { col: 'action', dc: 'cha', save: 'WIS'.replace('WIS', 'CHA'), roll: '{level}', rollNote: 'extra necrotic damage (once per turn, one target)',
      use: { effect: { name: 'Necrotic Shroud', rounds: 10, buff: { note: 'Once per turn +level necrotic to one target' } } },
      text: 'Each creature within 10 ft that can see you makes a CHA save or is frightened of you until the end of your next turn. Once per turn, one target of your attack or spell takes +{level} necrotic.' },
    'race:Celestial Revelation': { resource: true, acts: [
      { name: 'Heavenly Wings', col: 'bonus', cost: true, roll: '{prof}', rollNote: 'extra radiant damage (once per turn)',
        use: { effect: { name: 'Heavenly Wings', rounds: 10, buff: { fly: 30, note: 'Once per turn +prof radiant damage' } } } },
      { name: 'Inner Radiance', col: 'bonus', cost: true, roll: '{prof}', rollNote: 'extra radiant damage (once per turn)',
        use: { effect: { name: 'Inner Radiance', rounds: 10, buff: { note: 'Bright light 10 ft; end of your turn: each creature within 10 ft takes prof radiant; once per turn +prof radiant' } } },
        text: 'At the end of each of your turns, each creature within 10 ft of you takes {prof} radiant damage.' },
      { name: 'Necrotic Shroud', col: 'bonus', cost: true, roll: '{prof}', rollNote: 'extra necrotic damage (once per turn)', dc: 'cha', save: 'CHA',
        use: { effect: { name: 'Necrotic Shroud', rounds: 10, buff: { note: 'Once per turn +prof necrotic damage' } } },
        text: 'Each creature (your choice) within 10 ft makes a CHA save or is frightened of you until the end of your next turn.' }] },

    // ---------- Firbolg ----------
    'race:Firbolg Magic': { spells: ['Detect Magic', 'Disguise Self'], spellNote: 'Firbolg Magic: each once per short rest without a slot (WIS); disguise self can make you up to 3 ft shorter' },
    'race:Hidden Step': { col: 'bonus', use: { cond: 'Invisible', condRounds: 1 }, text: 'Invisible until the start of your next turn, or until you attack, make a damage roll or force a saving throw.' },
    'race:Speech of Beast and Leaf': { passive: { advNote: 'CHA checks to influence beasts and plants' } },

    // ---------- Kenku ----------
    'race:Expert Forgery': { passive: { advNote: 'Checks to produce forgeries or duplicates of objects' } },
    'race:Expert Duplication': { passive: { advNote: 'Checks to duplicate writing or craftwork' } },
    'race:Kenku Recall': { text: 'Gain advantage on one ability check you make with a skill you are proficient in.' },
    'race:Mimicry': NONE,

    // ---------- Lizardfolk / Tortle ----------
    'race:Bite': NONE,
    'race:Cunning Artisan': NONE,
    'race:Hold Breath': NONE,
    'race:Natural Armor': NONE,
    "race:Nature's Intuition": NONE,
    'race:Hungry Jaws': { resource: true, acts: [
      { name: 'Hungry Jaws bite', col: 'bonus', cost: true, roll: '1d6+str', rollNote: 'piercing (special Bite attack)' },
      { name: 'On a hit: temp HP (MPMM)', use: { temp: '{prof}' } },
      { name: 'On a hit: temp HP (Volo)', use: { temp: '{max(1,con)}' } }] },
    'race:Claws': NONE,
    'race:Shell Defense': { col: 'action', use: { cond: 'Prone', effect: { name: 'Shell Defense', rounds: null, buff: { ac: 4, note: 'Speed 0; advantage on STR and CON saves; disadvantage on DEX saves; only a bonus action to emerge' } } },
      acts: [{ name: 'Emerge from shell', col: 'bonus', onlyWhen: { effect: 'Shell Defense' }, use: { endEffect: 'Shell Defense', removeCond: ['Prone'] } }] },

    // ---------- Tabaxi ----------
    'race:Feline Agility': { max: '1', reset: 'short', dash: true, text: 'Speed doubled this turn. Recharges when you move 0 ft on one of your turns (or reset it after a rest).' },
    "race:Cat's Claws": NONE,
    "race:Cat's Talent": NONE,

    // ---------- Goblinoids / Kobold ----------
    'race:Long-Limbed': { text: 'Your reach is 5 ft greater than normal when you make a melee attack on your turn.' },
    'race:Sneaky': NONE,
    'race:Surprise Attack': { roll: '2d6', rollNote: 'extra damage (MPMM: target hasn\'t taken a turn yet this combat; Volo: once per combat, a surprised creature on your first turn)' },
    'race:Fury of the Small': { resource: true, acts: [
      { name: 'Fury of the Small (MPMM)', cost: true, roll: '{prof}', rollNote: 'extra damage to a larger creature (once per turn)' },
      { name: 'Fury of the Small (Volo)', cost: true, roll: '{level}', rollNote: 'extra damage to a larger creature' }] },
    'race:Nimble Escape': { col: 'bonus', text: 'Take the Disengage or Hide action.' },
    'race:Martial Training': NONE,
    'race:Saving Face': { text: 'Add +1 for each ally you can see within 30 ft (max +5) to the missed attack, failed check or failed save.' },
    'race:Fortune from the Many': { text: 'Add +1 for each ally you can see within 30 ft (max +3) to the missed attack, failed check or failed save.' },
    'race:Fey Gift': { resource: true, acts: [
      { name: 'Help (Fey Gift)', col: 'bonus', cost: true, text: 'Take the Help action.' },
      { name: 'Help + Hospitality', col: 'bonus', cost: true, min: 3, use: { temp: '1d6+{prof}' }, text: 'You and the creature you help each gain 1d6 + {prof} temporary HP (roll separately for them).' },
      { name: 'Help + Passage', col: 'bonus', cost: true, min: 3, use: { effect: { name: 'Fey Gift: Passage', rounds: 1, buff: { speed: 10 } } }, text: 'You and the creature you help each gain +10 ft walking speed until the start of your next turn.' },
      { name: 'Help + Spite', col: 'bonus', cost: true, min: 3, text: 'Until the start of your next turn, the first time the creature you helped hits with an attack roll, that target has disadvantage on its next attack roll within the next minute.' }] },
    'race:Grovel, Cower, and Beg': { use: { effect: { name: 'Grovel, Cower, and Beg', rounds: 1, buff: { note: 'Allies have advantage on attacks vs enemies within 10 ft of you that can see you' } } } },
    'race:Draconic Cry': { use: { effect: { name: 'Draconic Cry', rounds: 1, buff: { atkAdv: 'Draconic Cry: vs enemies within 10 ft that could hear it', note: 'You and allies have advantage on attacks vs those enemies' } } } },
    'race:Pack Tactics': { passive: { advNote: 'Attacks vs a creature with a non-incapacitated ally within 5 ft of it' } },
    'race:Kobold Legacy': { passive: { advNote: 'Defiance legacy: saves vs being frightened' } },

    // ---------- Yuan-ti / Satyr ----------
    'race:Magic Resistance': { passive: { advNote: 'Saves vs spells' } },
    'race:Poison Immunity': { passive: { immune: ['poison'], condImmune: ['Poisoned'] } },
    'race:Poison Resilience': { passive: { resist: ['poison'], advNote: 'Saves vs being poisoned' } },
    'race:Ram': NONE,
    'race:Mirthful Leaps': { roll: '1d8', rollNote: 'extra feet added to a long or high jump' },
    'race:Reveler': NONE,

    // ---------- Centaur / Minotaur ----------
    'race:Charge': { col: 'bonus', text: 'After moving 30 ft straight toward a target and hitting it with a melee weapon attack this turn, make one Hooves attack against it.' },
    'race:Equine Build': { passive: { carry: 2 }, text: 'Each foot of climbing costs 4 extra feet of movement.' },
    'race:Hooves': NONE,
    'race:Natural Affinity': NONE,
    'race:Horns': NONE,
    'race:Goring Rush': { col: 'bonus', text: 'Right after you Dash and move at least 20 ft, make one melee attack with your Horns.' },
    'race:Hammering Horns': { col: 'bonus', dc: 'str', save: 'STR', text: 'After hitting with a melee attack as part of the Attack action: push a Large or smaller target up to 10 ft away on a failed save.' },
    'race:Labyrinthine Recall': { passive: { advNote: 'WIS (Survival) checks to navigate or track' } },

    // ---------- Changeling / Shapechangers ----------
    'race:Changeling Instincts': NONE,
    'race:Shapechanger': { col: 'action', text: 'Change your appearance and voice (not your game statistics) until you change back or die.' },

    // ---------- Deep gnome / Eladrin / Fairy / Shadar-kai ----------
    'race:Fey Step': { resource: true, acts: [
      { name: 'Fey Step', col: 'bonus', cost: true, text: 'Teleport up to 30 ft to an unoccupied space you can see.' },
      { name: 'Fey Step: Autumn', col: 'bonus', cost: true, min: 3, dc: 'int|wis|cha', save: 'WIS', text: 'Teleport 30 ft; up to two creatures you can see within 10 ft make a WIS save or are charmed by you for 1 minute (ends if you or allies damage them).' },
      { name: 'Fey Step: Winter', col: 'bonus', cost: true, min: 3, dc: 'int|wis|cha', save: 'WIS', text: 'Before teleporting, one creature within 5 ft makes a WIS save or is frightened of you until the end of your next turn.' },
      { name: 'Fey Step: Spring', col: 'bonus', cost: true, min: 3, text: 'Touch a willing creature within 5 ft; it teleports up to 30 ft instead of you.' },
      { name: 'Fey Step: Summer', col: 'bonus', cost: true, min: 3, roll: '{prof}', rollNote: 'fire damage to each creature of your choice within 5 ft after you teleport' }] },
    'race:Fairy Magic': NONE,
    'race:Blessing of the Raven Queen': { use: { effect: { name: 'Blessing of the Raven Queen', rounds: 1, buff: { note: 'From 3rd level: resistance to all damage until the start of your next turn' } } }, text: 'Teleport up to 30 ft to an unoccupied space you can see. From 3rd level you also resist all damage until the start of your next turn.' },
    'race:Necrotic Resistance': { passive: { resist: ['necrotic'] } },

    // ---------- Gith ----------
    'race:Astral Knowledge': { trigger: 'longRest', triggerLabel: 'Noted', triggerText: 'Astral Knowledge: choose one skill and one weapon or tool to be proficient with until your next long rest.' },
    'race:Psychic Resilience': { passive: { resist: ['psychic'] } },
    // Shared name: Githzerai (advantage vs charmed/frightened; already resist psychic from Psychic Resilience) and Kalashtar (psychic resistance).
    'race:Mental Discipline': { passive: { resist: ['psychic'], advNote: 'Githzerai: saves vs being charmed or frightened' } },

    // ---------- Harengon ----------
    'race:Hare-Trigger': { initProf: true },
    'race:Leporine Senses': NONE,
    'race:Lucky Footwork': { col: 'reaction', roll: '1d4', rollNote: 'added to the failed DEX save' },
    'race:Rabbit Hop': { text: 'Jump up to {5*prof} ft without provoking opportunity attacks (only if your speed isn\'t 0).' },

    // ---------- Shifter (MPMM subraces; Eberron shifter uses the Eberron sub-option) ----------
    'race:Bestial Instincts': NONE,
    'race:Shifting': { resource: true, acts: [
      { name: 'Shift', col: 'bonus', cost: true, use: { temp: '{2*prof}', effect: { name: 'Shifted', rounds: 10 } }, text: 'Shifted for 1 minute. (Beasthide/Longtooth/Swiftstride/Wildhunt: use your subrace\'s shift button for its extras.)' },
      { name: 'Shift (Eberron)', col: 'bonus', cost: true, use: { temp: '{level+max(1,con)}', effect: { name: 'Shifted', rounds: 10 } },
        text: 'Beasthide: +1 AC. Longtooth: bonus-action 1d6 + STR piercing bite. Swiftstride: +10 ft speed, reaction move 10 ft. Wildhunt: advantage on WIS checks; no attacks with advantage against you within 30 ft.' }] },
    'race:Beasthide Shift': { col: 'bonus', cost: { from: 'Shifting', n: 1 }, use: { temp: '{2*prof}+1d6', effect: { name: 'Shifted', rounds: 10 } }, passive: { ac: 1, effect: 'Shifted' } },
    'race:Longtooth Shift': { col: 'bonus', cost: { from: 'Shifting', n: 1 }, use: { temp: '{2*prof}', effect: { name: 'Shifted', rounds: 10 } },
      attacks: [['Fangs (while shifted)', '1d6', 'piercing', 'str', { kind: 'melee', notes: 'Unarmed strike; bonus action while shifted' }]] },
    'race:Swiftstride Shift': { col: 'bonus', cost: { from: 'Shifting', n: 1 }, use: { temp: '{2*prof}', effect: { name: 'Shifted', rounds: 10 } }, passive: { speed: 10, effect: 'Shifted' },
      acts: [{ name: 'Swiftstride step', col: 'reaction', onlyWhen: { effect: 'Shifted' }, text: 'A creature ended its turn within 5 ft: move up to 10 ft without provoking opportunity attacks.' }] },
    'race:Wildhunt Shift': { col: 'bonus', cost: { from: 'Shifting', n: 1 }, use: { temp: '{2*prof}', effect: { name: 'Shifted', rounds: 10 } },
      passive: { checkAdv: ['wis'], effect: 'Shifted' }, text: 'While shifted, no creature within 30 ft can make an attack roll with advantage against you unless you are incapacitated.' },

    // ---------- Eberron ----------
    'race:Dual Mind': { passive: { saveAdv: ['wis'] } },
    'race:Mind Link': { passive: { sense: 'Telepathy (10 × your level ft)' } },
    'race:Severed from Dreams': { passive: { immune: ['dream-based magic'] } },
    'race:Constructed Resilience': { passive: { resist: ['poison'], immune: ['disease'], advNote: 'Saves vs poison' } },
    "race:Sentry's Rest": NONE,
    'race:Integrated Protection': NONE,
    'race:Specialized Design': NONE,
    'race:Dragonmark': NONE,

    // ---------- Van Richten's lineages ----------
    'race:Ancestral Legacy': NONE,
    // Shared name: Dhampir (no need to breathe) and Reborn (advantage vs disease/poison, poison resistance, death saves).
    'race:Deathless Nature': { passive: { resist: ['poison'], advNote: 'Reborn: saves vs disease and being poisoned; death saving throws' } },
    'race:Spider Climb': NONE,
    'race:Vampiric Bite': { passive: { advNote: 'Vampiric Bite attacks while at half HP or less' },
      text: 'After a bite hit (1d4 + CON piercing): regain HP equal to the piercing damage, or add that amount to your next ability check or attack roll.' },
    'race:Eerie Token': { text: 'Token works while within 10 miles: as an action, send a telepathic message (25 words), or see and hear around the token for 1 minute (concentration).' },
    'race:Hex Magic': NONE,
    'race:Knowledge from a Past Life': { roll: '1d6', rollNote: 'added to the ability check' },

    // ---------- Tasha's ----------
    'race:Custom Lineage': NONE,
  });
})();
