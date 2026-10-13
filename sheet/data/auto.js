// Spell automation. Damage spells are read from the spell summary (dice, type, save, attack);
// this table adds upcasting, healing, self-buffs, smites, summons and transformations.
// Keys: dmg 'XdY' (override), type, save 'dex'..., half, attack, up 'XdY' per slot level above base,
// heal 'XdY+M' (M = spellcasting modifier), healUp, temp, tempUp, repeat (re-roll on later turns),
// buff {ac, acMin, acBase, speed, speedMult, fly, atk, dmg, dmgDice, bless, saveBonus, note}, rider (next weapon hit), riderUp,
// summon (DND.summons key), form 'polymorph'|'shapechange', conjure {cr}, familiar, steed, maxHp {base, up}, beams
DND.spellAuto = {
  'Eldritch Blast': { beams: true },
  'Magic Missile': { darts: true },
  'Scorching Ray': { rays: 3, dmg: '2d6', type: 'fire', attack: true },
  'Burning Hands': { up: '1d6' }, 'Thunderwave': { up: '1d8' }, 'Fireball': { up: '1d6' }, 'Lightning Bolt': { up: '1d6' },
  'Shatter': { up: '1d8' }, 'Cone of Cold': { up: '1d8' }, 'Blight': { up: '1d8' }, 'Inflict Wounds': { up: '1d10' },
  'Guiding Bolt': { up: '1d6' }, 'Chromatic Orb': { up: '1d8' }, 'Witch Bolt': { up: '1d12', repeat: '1d12' }, 'Hellish Rebuke': { up: '1d10' },
  'Arms of Hadar': { up: '1d6' }, 'Dissonant Whispers': { up: '1d6' }, 'Ice Storm': { dmg: '2d8+4d6', up: '1d8' }, 'Flame Strike': { dmg: '4d6+4d6', type: 'fire + radiant', up: '1d6' },
  'Spirit Guardians': { up: '1d8', repeat: '3d8' }, 'Moonbeam': { up: '1d10', repeat: '2d10' }, 'Call Lightning': { up: '1d10', repeat: '3d10' },
  'Vampiric Touch': { up: '1d6', repeat: '3d6' }, "Melf's Acid Arrow": { up: '1d4' }, 'Flaming Sphere': { up: '1d6', repeat: '2d6' },
  'Cloud of Daggers': { up: '2d4', repeat: '4d4' }, 'Heat Metal': { up: '1d8', repeat: '2d8' }, "Aganazzar's Scorcher": { up: '1d8' }, 'Catapult': { up: '1d8' },
  'Chaos Bolt': { dmg: '2d8+1d6', up: '1d6' }, 'Earth Tremor': { up: '1d6' }, 'Ray of Sickness': { up: '1d8' }, 'Erupting Earth': { up: '1d12' },
  'Thunder Step': { up: '1d10' }, 'Wall of Fire': { up: '1d8', repeat: '5d8' }, 'Vitriolic Sphere': { up: '2d4' }, 'Disintegrate': { dmg: '10d6+40', up: '3d6' },
  'Circle of Death': { up: '2d6' }, "Dragon's Breath": { up: '1d6', repeat: '3d6' }, "Snilloc's Snowball Swarm": { up: '1d6' }, "Rime's Binding Ice": { up: '1d8' },
  'Mind Spike': { up: '1d8' }, 'Ice Knife': { dmg: '1d10', type: 'piercing (+2d6 cold burst, DEX save)', attack: true, up: '1d6' }, 'Tasha\'s Caustic Brew': { up: '2d4', repeat: '2d4' },
  'Hunger of Hadar': { repeat: '2d6' }, 'Sickening Radiance': { repeat: '4d10' }, 'Incendiary Cloud': { repeat: '10d8' }, 'Insect Plague': { up: '1d10', repeat: '4d10' },
  'Cloudkill': { up: '1d8', repeat: '5d8' }, 'Enervation': { up: '1d8', repeat: '4d8' }, 'Immolation': { repeat: '4d6' }, 'Blade Barrier': { repeat: '6d10' },
  'Sunbeam': { repeat: '6d8' }, 'Storm Sphere': { up: '1d6', repeat: '4d6' }, 'Delayed Blast Fireball': { up: '1d6' }, 'Spiritual Weapon': { spiritual: true },
  'Toll the Dead': { dmg: '1d8', type: 'necrotic', alt: '1d12 if already damaged' }, 'Booming Blade': { weapon: true, pickWeapon: 'melee', boom: true }, 'Green-Flame Blade': { weapon: true, pickWeapon: 'melee', leap: true },
  // Healing
  'Cure Wounds': { heal: '1d8+M', healUp: '1d8' }, 'Healing Word': { heal: '1d4+M', healUp: '1d4' }, 'Mass Healing Word': { heal: '1d4+M', healUp: '1d4', each: true },
  'Mass Cure Wounds': { heal: '3d8+M', healUp: '1d8', each: true }, 'Prayer of Healing': { heal: '2d8+M', healUp: '1d8', each: true }, 'Heal': { heal: '70', healUp: '10' },
  'Aura of Vitality': { heal: '2d6', repeatHeal: '2d6' }, 'Healing Spirit': { heal: '1d6', healUp: '1d6', repeatHeal: '1d6' }, 'Regenerate': { heal: '4d8+15' },
  'Mass Heal': { heal: '700' }, 'Power Word Heal': { heal: 'all' }, 'Goodberry': { note: 'Ten berries, 1 HP each' }, 'Life Transference': { dmg: '4d8', type: 'necrotic to you (target heals double)', self: true, up: '1d8' },
  // Temporary HP and max HP
  'False Life': { temp: '1d4+4', tempUp: '5' }, 'Armor of Agathys': { temp: '5', tempUp: '5', buff: { note: 'Melee attackers take cold damage equal to the temp HP amount' } },
  'Heroism': { buff: { tempEach: 'M', note: 'Immune to frightened; temp HP each turn' } }, 'Aid': { maxHp: { base: 5, up: 5 }, ask: 'Are you one of the targets?' },
  "Heroes' Feast": { maxHp: { roll: '2d10' }, buff: { note: 'Immune to poison and fear; advantage on WIS saves' } },
  // Self buffs
  'Mage Armor': { buff: { acBase: 13, unarmoredOnly: true }, ask: 'On yourself?' }, 'Shield': { buff: { ac: 5 }, rounds: 1 }, 'Shield of Faith': { buff: { ac: 2 }, ask: 'On yourself?' },
  'Haste': { buff: { ac: 2, speedMult: 2, note: 'Advantage on DEX saves; one extra limited action' }, ask: 'On yourself?' }, 'Barkskin': { buff: { acMin: 16 }, ask: 'On yourself?' },
  'Longstrider': { buff: { speed: 10 }, ask: 'On yourself?' }, 'Expeditious Retreat': { buff: { note: 'Dash as a bonus action' } }, 'Fly': { buff: { fly: 60 }, ask: 'On yourself?' },
  'Enlarge/Reduce': { buff: { dmgDice: '1d4', note: 'Enlarged: advantage on STR checks and saves' }, ask: 'Enlarge yourself?' }, 'Divine Favor': { buff: { dmgDice: '1d4 radiant' } },
  'Hex': { buff: { dmgDice: '1d6 necrotic', note: 'Only against the hexed target' } }, "Hunter's Mark": { buff: { dmgDice: '1d6', note: 'Only against the marked target' } },
  'Magic Weapon': { pickWeapon: 'any', buff: { atk: 1, dmg: 1 }, upBuff: { 4: { atk: 2, dmg: 2 }, 6: { atk: 3, dmg: 3 } } }, 'Elemental Weapon': { pickWeapon: 'any', buff: { atk: 1, dmgDice: '1d4' }, upBuff: { 5: { atk: 2, dmgDice: '2d4' }, 7: { atk: 3, dmgDice: '3d4' } } },
  "Crusader's Mantle": { buff: { dmgDice: '1d4 radiant' } }, 'Spirit Shroud': { buff: { dmgDice: '1d8 radiant' } }, 'Holy Weapon': { pickWeapon: 'any', buff: { dmgDice: '2d8 radiant' } },
  'Bless': { buff: { bless: true }, ask: 'Are you one of the blessed?' }, 'Blur': { buff: { note: 'Attacks against you have disadvantage' } }, 'Stoneskin': { buff: { note: 'Resistance to nonmagical physical damage' }, ask: 'On yourself?' },
  'Protection from Energy': { buff: { note: 'Resistance to one energy type' }, ask: 'On yourself?' }, 'Protection from Evil and Good': { buff: { note: 'Protected from aberrations, celestials, elementals, fey, fiends, undead' }, ask: 'On yourself?' },
  'Greater Invisibility': { buff: { note: 'Invisible: advantage on attacks, disadvantage against you' }, ask: 'On yourself?' }, 'Invisibility': { buff: { note: 'Invisible until you attack or cast' }, ask: 'On yourself?' },
  'Death Ward': { buff: { note: 'Drop to 1 HP instead of 0 once' }, ask: 'On yourself?' }, 'Freedom of Movement': { buff: { note: 'Ignore difficult terrain and restraints' }, ask: 'On yourself?' },
  'Shadow Blade': { weaponSpell: ['Shadow Blade', '2d8', 'psychic'], upWeapon: { 3: '3d8', 5: '4d8', 7: '5d8' } }, 'Flame Blade': { weaponSpell: ['Flame Blade', '3d6', 'fire', 'spell'], upWeapon: { 4: '4d6', 6: '5d6', 8: '6d6', 9: '7d6' } },
  'Shillelagh': { pickWeapon: 'shillelagh', wpn: { ab: 'spell', die: 'd8', magical: true } },
  "Tenser's Transformation": { buff: { note: 'Advantage on weapon attacks, +2d12 force on hits, extra attack, 50 temp HP' }, temp: '50' },
  'Tasha\'s Otherworldly Guise': { buff: { ac: 2, note: 'Flying 40 ft; weapon attacks use spellcasting ability; extra attack' } },
  // Smites and next-hit riders (applied to your next weapon hit)
  'Searing Smite': { rider: '1d6 fire', riderUp: '1d6' }, 'Thunderous Smite': { rider: '2d6 thunder' }, 'Wrathful Smite': { rider: '1d6 psychic' },
  'Branding Smite': { rider: '2d6 radiant', riderUp: '1d6' }, 'Blinding Smite': { rider: '3d8 radiant' }, 'Staggering Smite': { rider: '4d6 psychic' },
  'Banishing Smite': { rider: '5d10 force' }, 'Ensnaring Strike': { rider: '1d6 piercing (restrain)', riderUp: '1d6' }, 'Hail of Thorns': { rider: '1d10 piercing burst', riderUp: '1d10' },
  'Lightning Arrow': { rider: '4d8 lightning (replaces weapon damage)', riderUp: '1d8' }, 'Zephyr Strike': { rider: '1d8 force' },
  // Summons, conjurations and transformations
  'Summon Beast': { summon: 'Summon Beast' }, 'Summon Fey': { summon: 'Summon Fey' }, 'Summon Shadowspawn': { summon: 'Summon Shadowspawn' }, 'Summon Undead': { summon: 'Summon Undead' },
  'Summon Aberration': { summon: 'Summon Aberration' }, 'Summon Construct': { summon: 'Summon Construct' }, 'Summon Elemental': { summon: 'Summon Elemental' },
  'Summon Celestial': { summon: 'Summon Celestial' }, 'Summon Fiend': { summon: 'Summon Fiend' }, 'Summon Draconic Spirit': { summon: 'Summon Draconic Spirit' },
  'Find Familiar': { familiar: true }, 'Find Steed': { steed: ['Warhorse', 'Pony', 'Camel', 'Elk', 'Mastiff'] }, 'Find Greater Steed': { steed: ['Warhorse'], note: 'Griffon, pegasus, peryton, dire wolf, rhinoceros or saber-toothed tiger — pick the closest and edit' },
  'Conjure Animals': { conjure: { tag: 'beast', cr: 2 } }, 'Conjure Woodland Beings': { conjure: { tag: 'fey', cr: 2 } }, 'Conjure Minor Elementals': { conjure: { tag: 'elemental', cr: 2 } },
  'Conjure Elemental': { conjure: { tag: 'elemental', cr: 5 } }, 'Animate Dead': { conjure: { names: ['Skeleton', 'Zombie'], cr: 1 } }, 'Giant Insect': { conjure: { names: ['Giant Centipede', 'Giant Wolf Spider', 'Giant Wasp', 'Constrictor Snake'], cr: 1 } },
  'Polymorph': { form: 'polymorph', ask: 'Polymorph yourself?' }, 'True Polymorph': { form: 'polymorph', ask: 'Transform yourself?' }, 'Shapechange': { form: 'shapechange' }, 'Animal Shapes': { form: 'polymorph', ask: 'Include yourself?' }
};
// Damage cantrips that scale by character level (dice count ×1/×2/×3/×4 at 1/5/11/17)
DND.cantripScale = ['Acid Splash', 'Chill Touch', 'Create Bonfire', 'Fire Bolt', 'Frostbite', 'Infestation', 'Mind Sliver', 'Poison Spray', 'Primal Savagery', 'Produce Flame', 'Ray of Frost', 'Sacred Flame', 'Shocking Grasp', 'Sword Burst', 'Thorn Whip', 'Thunderclap', 'Toll the Dead', 'Vicious Mockery', 'Word of Radiance', 'Lightning Lure'];
