DND.skills = [['Acrobatics', 'dex'], ['Animal Handling', 'wis'], ['Arcana', 'int'], ['Athletics', 'str'], ['Deception', 'cha'], ['History', 'int'], ['Insight', 'wis'], ['Intimidation', 'cha'], ['Investigation', 'int'], ['Medicine', 'wis'], ['Nature', 'int'], ['Perception', 'wis'], ['Performance', 'cha'], ['Persuasion', 'cha'], ['Religion', 'int'], ['Sleight of Hand', 'dex'], ['Stealth', 'dex'], ['Survival', 'wis']];
DND.languages = { standard: ['Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc'], exotic: ['Abyssal', 'Celestial', 'Deep Speech', 'Draconic', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon', 'Aarakocra', 'Gith', 'Quori', 'Thieves\' Cant', 'Druidic'] };
DND.damageTypes = ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
// Conditions: [name, summary, automation]
DND.conditions = [
  ['Blinded', "Can't see; auto-fail sight checks. Attacks against you have advantage; your attacks have disadvantage."],
  ['Charmed', "Can't attack the charmer or target it with harmful effects; the charmer has advantage on social checks with you."],
  ['Deafened', "Can't hear; auto-fail hearing checks."],
  ['Frightened', "Disadvantage on checks and attacks while the source is in sight; can't willingly move closer to it."],
  ['Grappled', 'Speed 0. Ends if the grappler is incapacitated or you are moved out of reach.', { speed0: true }],
  ['Incapacitated', "Can't take actions or reactions."],
  ['Invisible', "Can't be seen without magic; attacks against you have disadvantage, yours have advantage."],
  ['Paralyzed', "Incapacitated; can't move or speak. Auto-fail STR and DEX saves. Attacks have advantage; hits within 5 ft are crits.", { speed0: true }],
  ['Petrified', 'Turned to stone; incapacitated; resistance to all damage; immune to poison and disease. Auto-fail STR and DEX saves.', { speed0: true }],
  ['Poisoned', 'Disadvantage on attack rolls and ability checks.'],
  ['Prone', 'Crawl only; disadvantage on attacks. Melee attacks within 5 ft have advantage against you, ranged have disadvantage. Standing costs half your speed.'],
  ['Restrained', 'Speed 0; attacks against you have advantage; your attacks and DEX saves have disadvantage.', { speed0: true }],
  ['Stunned', "Incapacitated; can't move; speak falteringly. Auto-fail STR and DEX saves; attacks against you have advantage.", { speed0: true }],
  ['Unconscious', 'Incapacitated, prone, unaware. Drop held items. Auto-fail STR and DEX saves; attacks have advantage; hits within 5 ft are crits.', { speed0: true }],
  ['Concentrating', 'Maintaining a concentration spell; CON save (DC 10 or half damage) when damaged.'],
  ['Raging', 'Barbarian rage active.'],
  ['Hasted', '+2 AC, double speed, advantage on DEX saves, extra limited action.', { ac: 2 }],
  ['Blessed', '+1d4 to attack rolls and saving throws.'],
  ['Hexed / Cursed', 'Under a hex or curse.'],
  ['Dodging', 'Attacks against you have disadvantage; advantage on DEX saves.']
];
DND.exhaustion = ['None', 'Disadvantage on ability checks', 'Speed halved', 'Disadvantage on attack rolls and saving throws', 'Hit point maximum halved', 'Speed reduced to 0', 'Death'];
DND.sources = { PHB: "Player's Handbook", SRD: 'System Reference Document', XGE: "Xanathar's Guide to Everything", TCE: "Tasha's Cauldron of Everything", SCAG: "Sword Coast Adventurer's Guide", VGM: "Volo's Guide to Monsters", MPMM: 'Monsters of the Multiverse', FTD: "Fizban's Treasury of Dragons", VRGR: "Van Richten's Guide to Ravenloft", WGtE: "Wayfinder's Guide to Eberron", BGG: 'Bigby Presents: Glory of the Giants', AAG: 'Spelljammer: Adventures in Space', EEPC: "Elemental Evil Player's Companion", DMG: "Dungeon Master's Guide", UA: 'Unearthed Arcana' };
DND.pointBuy = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
DND.standardArray = [15, 14, 13, 12, 10, 8];
DND.alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned'];
