// Mundane equipment. Weapons: [name, cat, kind, cost, dice, dmgType, weight, properties, range]
DND.weapons = [
  ['Club', 'simple', 'melee', '1 sp', '1d4', 'bludgeoning', 2, ['light']],
  ['Dagger', 'simple', 'melee', '2 gp', '1d4', 'piercing', 1, ['finesse', 'light', 'thrown'], '20/60'],
  ['Greatclub', 'simple', 'melee', '2 sp', '1d8', 'bludgeoning', 10, ['two-handed']],
  ['Handaxe', 'simple', 'melee', '5 gp', '1d6', 'slashing', 2, ['light', 'thrown'], '20/60'],
  ['Javelin', 'simple', 'melee', '5 sp', '1d6', 'piercing', 2, ['thrown'], '30/120'],
  ['Light hammer', 'simple', 'melee', '2 gp', '1d4', 'bludgeoning', 2, ['light', 'thrown'], '20/60'],
  ['Mace', 'simple', 'melee', '5 gp', '1d6', 'bludgeoning', 4, []],
  ['Quarterstaff', 'simple', 'melee', '2 sp', '1d6', 'bludgeoning', 4, ['versatile (1d8)']],
  ['Sickle', 'simple', 'melee', '1 gp', '1d4', 'slashing', 2, ['light']],
  ['Spear', 'simple', 'melee', '1 gp', '1d6', 'piercing', 3, ['thrown', 'versatile (1d8)'], '20/60'],
  ['Crossbow, light', 'simple', 'ranged', '25 gp', '1d8', 'piercing', 5, ['ammunition', 'loading', 'two-handed'], '80/320'],
  ['Dart', 'simple', 'ranged', '5 cp', '1d4', 'piercing', 0.25, ['finesse', 'thrown'], '20/60'],
  ['Shortbow', 'simple', 'ranged', '25 gp', '1d6', 'piercing', 2, ['ammunition', 'two-handed'], '80/320'],
  ['Sling', 'simple', 'ranged', '1 sp', '1d4', 'bludgeoning', 0, ['ammunition'], '30/120'],
  ['Battleaxe', 'martial', 'melee', '10 gp', '1d8', 'slashing', 4, ['versatile (1d10)']],
  ['Flail', 'martial', 'melee', '10 gp', '1d8', 'bludgeoning', 2, []],
  ['Glaive', 'martial', 'melee', '20 gp', '1d10', 'slashing', 6, ['heavy', 'reach', 'two-handed']],
  ['Greataxe', 'martial', 'melee', '30 gp', '1d12', 'slashing', 7, ['heavy', 'two-handed']],
  ['Greatsword', 'martial', 'melee', '50 gp', '2d6', 'slashing', 6, ['heavy', 'two-handed']],
  ['Halberd', 'martial', 'melee', '20 gp', '1d10', 'slashing', 6, ['heavy', 'reach', 'two-handed']],
  ['Lance', 'martial', 'melee', '10 gp', '1d12', 'piercing', 6, ['reach', 'special']],
  ['Longsword', 'martial', 'melee', '15 gp', '1d8', 'slashing', 3, ['versatile (1d10)']],
  ['Maul', 'martial', 'melee', '10 gp', '2d6', 'bludgeoning', 10, ['heavy', 'two-handed']],
  ['Morningstar', 'martial', 'melee', '15 gp', '1d8', 'piercing', 4, []],
  ['Pike', 'martial', 'melee', '5 gp', '1d10', 'piercing', 18, ['heavy', 'reach', 'two-handed']],
  ['Rapier', 'martial', 'melee', '25 gp', '1d8', 'piercing', 2, ['finesse']],
  ['Scimitar', 'martial', 'melee', '25 gp', '1d6', 'slashing', 3, ['finesse', 'light']],
  ['Shortsword', 'martial', 'melee', '10 gp', '1d6', 'piercing', 2, ['finesse', 'light']],
  ['Trident', 'martial', 'melee', '5 gp', '1d6', 'piercing', 4, ['thrown', 'versatile (1d8)'], '20/60'],
  ['War pick', 'martial', 'melee', '5 gp', '1d8', 'piercing', 2, []],
  ['Warhammer', 'martial', 'melee', '15 gp', '1d8', 'bludgeoning', 2, ['versatile (1d10)']],
  ['Whip', 'martial', 'melee', '2 gp', '1d4', 'slashing', 3, ['finesse', 'reach']],
  ['Blowgun', 'martial', 'ranged', '10 gp', '1', 'piercing', 1, ['ammunition', 'loading'], '25/100'],
  ['Crossbow, hand', 'martial', 'ranged', '75 gp', '1d6', 'piercing', 3, ['ammunition', 'light', 'loading'], '30/120'],
  ['Crossbow, heavy', 'martial', 'ranged', '50 gp', '1d10', 'piercing', 18, ['ammunition', 'heavy', 'loading', 'two-handed'], '100/400'],
  ['Longbow', 'martial', 'ranged', '50 gp', '1d8', 'piercing', 2, ['ammunition', 'heavy', 'two-handed'], '150/600'],
  ['Net', 'martial', 'ranged', '1 gp', '', '', 3, ['special', 'thrown'], '5/15'],
  // Firearms (Tasha's Gunner feat / DMG renaissance)
  ['Pistol', 'martial', 'ranged', '250 gp', '1d10', 'piercing', 3, ['ammunition', 'loading'], '30/90'],
  ['Musket', 'martial', 'ranged', '500 gp', '1d12', 'piercing', 10, ['ammunition', 'loading', 'two-handed'], '40/120']
];

// Armor: [name, type, cost, baseAC, dexCap (null = no cap, 0 = none), strReq, stealthDis, weight]
DND.armor = [
  ['Padded Armor', 'light', '5 gp', 11, null, 0, true, 8],
  ['Leather Armor', 'light', '10 gp', 11, null, 0, false, 10],
  ['Studded Leather Armor', 'light', '45 gp', 12, null, 0, false, 13],
  ['Hide Armor', 'medium', '10 gp', 12, 2, 0, false, 12],
  ['Chain Shirt', 'medium', '50 gp', 13, 2, 0, false, 20],
  ['Scale Mail', 'medium', '50 gp', 14, 2, 0, true, 45],
  ['Breastplate', 'medium', '400 gp', 14, 2, 0, false, 20],
  ['Half Plate', 'medium', '750 gp', 15, 2, 0, true, 40],
  ['Ring Mail', 'heavy', '30 gp', 14, 0, 0, true, 40],
  ['Chain Mail', 'heavy', '75 gp', 16, 0, 13, true, 55],
  ['Splint Armor', 'heavy', '200 gp', 17, 0, 15, true, 60],
  ['Plate Armor', 'heavy', '1,500 gp', 18, 0, 15, true, 65],
  ['Shield', 'shield', '10 gp', 2, null, 0, false, 6]
];

// Adventuring gear, tools, packs, mounts: [name, category, cost, weight, notes]
DND.gear = [
  ['Abacus', 'gear', '2 gp', 2], ['Acid (vial)', 'gear', '25 gp', 1, 'Throw: 2d6 acid (ranged attack, 20 ft)'], ["Alchemist's fire (flask)", 'gear', '50 gp', 1, 'Throw: 1d4 fire each turn until extinguished (DC 10 DEX)'],
  ['Arrows', 'ammo', '1 gp/20', 0.05], ['Blowgun needles', 'ammo', '1 gp/50', 0.02], ['Crossbow bolts', 'ammo', '1 gp/20', 0.075], ['Sling bullets', 'ammo', '4 cp/20', 0.075],
  ['Antitoxin (vial)', 'gear', '50 gp', 0, 'Advantage on saves vs poison for 1 hour'], ['Crystal', 'focus', '10 gp', 1, 'Arcane focus'], ['Orb', 'focus', '20 gp', 3, 'Arcane focus'], ['Rod', 'focus', '10 gp', 2, 'Arcane focus'], ['Staff', 'focus', '5 gp', 4, 'Arcane focus'], ['Wand', 'focus', '10 gp', 1, 'Arcane focus'],
  ['Backpack', 'gear', '2 gp', 5], ['Ball bearings (bag of 1,000)', 'gear', '1 gp', 2], ['Barrel', 'gear', '2 gp', 70], ['Basket', 'gear', '4 sp', 2], ['Bedroll', 'gear', '1 gp', 7], ['Bell', 'gear', '1 gp', 0], ['Blanket', 'gear', '5 sp', 3], ['Block and tackle', 'gear', '1 gp', 5],
  ['Book', 'gear', '25 gp', 5], ['Bottle, glass', 'gear', '2 gp', 2], ['Bucket', 'gear', '5 cp', 2], ['Caltrops (bag of 20)', 'gear', '1 gp', 2], ['Candle', 'gear', '1 cp', 0], ['Case, crossbow bolt', 'gear', '1 gp', 1], ['Case, map or scroll', 'gear', '1 gp', 1], ['Chain (10 feet)', 'gear', '5 gp', 10], ['Chalk (1 piece)', 'gear', '1 cp', 0], ['Chest', 'gear', '5 gp', 25],
  ["Climber's kit", 'gear', '25 gp', 12], ['Common clothes', 'clothes', '5 sp', 3], ['Costume clothes', 'clothes', '5 gp', 4], ['Fine clothes', 'clothes', '15 gp', 6], ["Traveler's clothes", 'clothes', '2 gp', 4], ['Vestments', 'clothes', '—', 4], ['Robes', 'clothes', '1 gp', 4],
  ['Component pouch', 'focus', '25 gp', 2, 'Spellcasting components'], ['Crowbar', 'gear', '2 gp', 5, 'Advantage on STR checks where leverage helps'], ['Sprig of mistletoe', 'focus', '1 gp', 0, 'Druidic focus'], ['Totem', 'focus', '1 gp', 0, 'Druidic focus'], ['Wooden staff', 'focus', '5 gp', 4, 'Druidic focus'], ['Yew wand', 'focus', '10 gp', 1, 'Druidic focus'], ['Druidic focus', 'focus', '1 gp', 0],
  ['Fishing tackle', 'gear', '1 gp', 4], ['Flask or tankard', 'gear', '2 cp', 1], ['Grappling hook', 'gear', '2 gp', 4], ['Hammer', 'gear', '1 gp', 3], ['Hammer, sledge', 'gear', '2 gp', 10], ["Healer's kit", 'gear', '5 gp', 3, '10 uses: stabilize a creature at 0 HP'],
  ['Holy symbol', 'focus', '5 gp', 1, 'Amulet, emblem or reliquary'], ['Holy water (flask)', 'gear', '25 gp', 1, 'Throw: 2d6 radiant to fiends or undead'], ['Hourglass', 'gear', '25 gp', 1], ['Hunting trap', 'gear', '5 gp', 25, '1d4 piercing, restrains (DC 13 STR)'],
  ['Ink (1 ounce bottle)', 'gear', '10 gp', 0], ['Ink pen', 'gear', '2 cp', 0], ['Jug or pitcher', 'gear', '2 cp', 4], ['Ladder (10-foot)', 'gear', '1 sp', 25], ['Lamp', 'gear', '5 sp', 1], ['Lantern, bullseye', 'gear', '10 gp', 2], ['Lantern, hooded', 'gear', '5 gp', 2], ['Lock', 'gear', '10 gp', 1],
  ['Magnifying glass', 'gear', '100 gp', 0], ['Manacles', 'gear', '2 gp', 6], ['Mess kit', 'gear', '2 sp', 1], ['Mirror, steel', 'gear', '5 gp', 0.5], ['Oil (flask)', 'gear', '1 sp', 1, 'Splash and ignite: 5 fire damage'], ['Paper (one sheet)', 'gear', '2 sp', 0], ['Parchment (one sheet)', 'gear', '1 sp', 0], ['Perfume (vial)', 'gear', '5 gp', 0],
  ["Pick, miner's", 'gear', '2 gp', 10], ['Piton', 'gear', '5 cp', 0.25], ['Poison, basic (vial)', 'gear', '100 gp', 0, 'Coat a weapon: +1d4 poison for 1 minute'], ['Pole (10-foot)', 'gear', '5 cp', 7], ['Pot, iron', 'gear', '2 gp', 10], ['Pouch', 'gear', '5 sp', 1], ['Quiver', 'gear', '1 gp', 1], ['Ram, portable', 'gear', '4 gp', 35],
  ['Rations (1 day)', 'gear', '5 sp', 2], ['Rope, hempen (50 feet)', 'gear', '1 gp', 10], ['Rope, silk (50 feet)', 'gear', '10 gp', 5], ['Sack', 'gear', '1 cp', 0.5], ["Scale, merchant's", 'gear', '5 gp', 3], ['Sealing wax', 'gear', '5 sp', 0], ['Shovel', 'gear', '2 gp', 5], ['Signal whistle', 'gear', '5 cp', 0], ['Signet ring', 'gear', '5 gp', 0], ['Soap', 'gear', '2 cp', 0],
  ['Spellbook', 'focus', '50 gp', 3, 'Holds your wizard spells'], ['Spikes, iron (10)', 'gear', '1 gp', 5], ['Spyglass', 'gear', '1,000 gp', 1], ['Tent, two-person', 'gear', '2 gp', 20], ['Tinderbox', 'gear', '5 sp', 1], ['Torch', 'gear', '1 cp', 1, '1 hour of bright light 20 ft; 1 fire damage as a weapon'], ['Vial', 'gear', '1 gp', 0], ['Waterskin', 'gear', '2 sp', 5], ['Whetstone', 'gear', '1 cp', 1],
  ['Knife, small', 'gear', '—', 0.5], ['Prayer book', 'gear', '—', 1], ['Incense', 'gear', '—', 0], ['Con tools', 'gear', '—', 0], ['Letter of introduction', 'gear', '—', 0], ['Scroll of pedigree', 'gear', '—', 0], ['Insignia of rank', 'gear', '—', 0], ['Trophy', 'gear', '—', 0], ['Map of your home city', 'gear', '—', 0], ['Pet mouse', 'gear', '—', 0], ['Uniform', 'clothes', '—', 4], ['Horn', 'gear', '—', 1],
  // Packs
  ["Burglar's Pack", 'pack', '16 gp', 44.5, 'Backpack, 1,000 ball bearings, 10 ft string, bell, 5 candles, crowbar, hammer, 10 pitons, hooded lantern, 2 flasks of oil, 5 days rations, tinderbox, waterskin, 50 ft hempen rope'],
  ["Diplomat's Pack", 'pack', '39 gp', 36, 'Chest, 2 map cases, fine clothes, ink, ink pen, lamp, 2 flasks of oil, 5 sheets of paper, perfume, sealing wax, soap'],
  ["Dungeoneer's Pack", 'pack', '12 gp', 61.5, 'Backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days rations, waterskin, 50 ft hempen rope'],
  ["Entertainer's Pack", 'pack', '40 gp', 38, 'Backpack, bedroll, 2 costumes, 5 candles, 5 days rations, waterskin, disguise kit'],
  ["Explorer's Pack", 'pack', '10 gp', 59, 'Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft hempen rope'],
  ["Priest's Pack", 'pack', '19 gp', 24, 'Backpack, blanket, 10 candles, tinderbox, alms box, 2 blocks of incense, censer, vestments, 2 days rations, waterskin'],
  ["Scholar's Pack", 'pack', '40 gp', 10, 'Backpack, book of lore, ink, ink pen, 10 sheets of parchment, little bag of sand, small knife'],
  ["Monster hunter's pack", 'pack', '33 gp', 49, 'Chest, crowbar, hammer, 3 wooden stakes, holy symbol, holy water, manacles, steel mirror, oil, tinderbox, 3 torches (VRGR)'],
  // Tools
  ["Alchemist's supplies", 'artisan', '50 gp', 8], ["Brewer's supplies", 'artisan', '20 gp', 9], ["Calligrapher's supplies", 'artisan', '10 gp', 5], ["Carpenter's tools", 'artisan', '8 gp', 6], ["Cartographer's tools", 'artisan', '15 gp', 6], ["Cobbler's tools", 'artisan', '5 gp', 5],
  ["Cook's utensils", 'artisan', '1 gp', 8], ["Glassblower's tools", 'artisan', '30 gp', 5], ["Jeweler's tools", 'artisan', '25 gp', 2], ["Leatherworker's tools", 'artisan', '5 gp', 5], ["Mason's tools", 'artisan', '10 gp', 8], ["Painter's supplies", 'artisan', '10 gp', 5],
  ["Potter's tools", 'artisan', '10 gp', 3], ["Smith's tools", 'artisan', '20 gp', 8], ["Tinker's tools", 'artisan', '50 gp', 10], ["Weaver's tools", 'artisan', '1 gp', 5], ["Woodcarver's tools", 'artisan', '1 gp', 5],
  ['Disguise kit', 'tool', '25 gp', 3], ['Forgery kit', 'tool', '15 gp', 5], ['Herbalism kit', 'tool', '5 gp', 3], ["Navigator's tools", 'tool', '25 gp', 2], ["Poisoner's kit", 'tool', '50 gp', 2], ["Thieves' tools", 'tool', '25 gp', 1],
  ['Dice set', 'gaming', '1 sp', 0], ['Dragonchess set', 'gaming', '1 gp', 0.5], ['Playing card set', 'gaming', '5 sp', 0], ['Three-Dragon Ante set', 'gaming', '1 gp', 0],
  ['Bagpipes', 'instrument', '30 gp', 6], ['Drum', 'instrument', '6 gp', 3], ['Dulcimer', 'instrument', '25 gp', 10], ['Flute', 'instrument', '2 gp', 1], ['Lute', 'instrument', '35 gp', 2], ['Lyre', 'instrument', '30 gp', 2], ['Horn (instrument)', 'instrument', '3 gp', 2], ['Pan flute', 'instrument', '12 gp', 2], ['Shawm', 'instrument', '2 gp', 1], ['Viol', 'instrument', '30 gp', 1],
  // Mounts & vehicles
  ['Camel', 'mount', '50 gp', 0, 'Speed 50 ft'], ['Donkey or mule', 'mount', '8 gp', 0, 'Speed 40 ft'], ['Elephant', 'mount', '200 gp', 0, 'Speed 40 ft'], ['Horse, draft', 'mount', '50 gp', 0, 'Speed 40 ft'], ['Horse, riding', 'mount', '75 gp', 0, 'Speed 60 ft'], ['Mastiff', 'mount', '25 gp', 0, 'Speed 40 ft'], ['Pony', 'mount', '30 gp', 0, 'Speed 40 ft'], ['Warhorse', 'mount', '400 gp', 0, 'Speed 60 ft'],
  ['Saddle, riding', 'tack', '10 gp', 25], ['Saddle, military', 'tack', '20 gp', 30], ['Saddlebags', 'tack', '4 gp', 8], ['Feed (per day)', 'tack', '5 cp', 10], ['Cart', 'vehicle', '15 gp', 200], ['Wagon', 'vehicle', '35 gp', 400], ['Rowboat', 'vehicle', '50 gp', 100], ['Keelboat', 'vehicle', '3,000 gp', 0]
];

DND.toolGroups = {
  artisan: ["Alchemist's supplies", "Brewer's supplies", "Calligrapher's supplies", "Carpenter's tools", "Cartographer's tools", "Cobbler's tools", "Cook's utensils", "Glassblower's tools", "Jeweler's tools", "Leatherworker's tools", "Mason's tools", "Painter's supplies", "Potter's tools", "Smith's tools", "Tinker's tools", "Weaver's tools", "Woodcarver's tools"],
  gaming: ['Dice set', 'Dragonchess set', 'Playing card set', 'Three-Dragon Ante set'],
  instrument: ['Bagpipes', 'Drum', 'Dulcimer', 'Flute', 'Lute', 'Lyre', 'Horn', 'Pan flute', 'Shawm', 'Viol'],
  other: ['Disguise kit', 'Forgery kit', 'Herbalism kit', "Navigator's tools", "Poisoner's kit", "Thieves' tools", 'Vehicles (land)', 'Vehicles (water)']
};
