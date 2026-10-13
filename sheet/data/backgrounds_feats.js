// Backgrounds: skills (fixed), skillChoice {n, from}, tools (fixed), toolChoice {n, from}, langs (count), feature [name, summary], equip, gold, feat
DND.backgrounds = {};
const BG = (k, o) => { DND.backgrounds[k] = o; };
BG('acolyte', { name: 'Acolyte', src: 'PHB', skills: ['Insight', 'Religion'], langs: 2, feature: ['Shelter of the Faithful', 'You and companions can receive free healing and care at temples of your faith.'], equip: ['Holy symbol', 'Prayer book', 'Incense:5', 'Vestments', "Common clothes"], gold: 15 });
BG('charlatan', { name: 'Charlatan', src: 'PHB', skills: ['Deception', 'Sleight of Hand'], tools: ['Disguise kit', 'Forgery kit'], feature: ['False Identity', 'A second identity with documents and acquaintances; you can forge documents you have seen.'], equip: ['Fine clothes', 'Disguise kit', 'Con tools'], gold: 15 });
BG('criminal', { name: 'Criminal / Spy', src: 'PHB', skills: ['Deception', 'Stealth'], tools: ["Thieves' tools"], toolChoice: { n: 1, from: 'gaming' }, feature: ['Criminal Contact', 'A reliable contact who passes messages through a criminal network.'], equip: ['Crowbar', "Common clothes"], gold: 15 });
BG('entertainer', { name: 'Entertainer / Gladiator', src: 'PHB', skills: ['Acrobatics', 'Performance'], tools: ['Disguise kit'], toolChoice: { n: 1, from: 'instrument' }, feature: ['By Popular Demand', 'Find a place to perform in exchange for free lodging and food; locals recognize you.'], equip: ['Musical instrument', 'Costume clothes'], gold: 15 });
BG('folkhero', { name: 'Folk Hero', src: 'PHB', skills: ['Animal Handling', 'Survival'], tools: ['Vehicles (land)'], toolChoice: { n: 1, from: 'artisan' }, feature: ['Rustic Hospitality', 'Common folk will shelter and hide you, unless it endangers them.'], equip: ["Artisan's tools", 'Shovel', 'Pot, iron', "Common clothes"], gold: 10 });
BG('guildartisan', { name: 'Guild Artisan / Merchant', src: 'PHB', skills: ['Insight', 'Persuasion'], toolChoice: { n: 1, from: 'artisan' }, langs: 1, feature: ['Guild Membership', 'Your guild provides lodging, support and political connections for dues of 5 gp a month.'], equip: ["Artisan's tools", 'Letter of introduction', "Traveler's clothes"], gold: 15 });
BG('hermit', { name: 'Hermit', src: 'PHB', skills: ['Medicine', 'Religion'], tools: ['Herbalism kit'], langs: 1, feature: ['Discovery', 'You discovered a unique and powerful truth during your seclusion.'], equip: ['Scroll case', 'Blanket', "Common clothes", 'Herbalism kit'], gold: 5 });
BG('noble', { name: 'Noble / Knight', src: 'PHB', skills: ['History', 'Persuasion'], toolChoice: { n: 1, from: 'gaming' }, langs: 1, feature: ['Position of Privilege', 'People assume you belong in high society; you can secure audiences with nobles. (Knight: Retainers instead.)'], equip: ['Fine clothes', 'Signet ring', 'Scroll of pedigree'], gold: 25 });
BG('outlander', { name: 'Outlander', src: 'PHB', skills: ['Athletics', 'Survival'], toolChoice: { n: 1, from: 'instrument' }, langs: 1, feature: ['Wanderer', 'Excellent memory for geography; find food and water for up to five people daily.'], equip: ['Quarterstaff', 'Hunting trap', "Traveler's clothes"], gold: 10 });
BG('sage', { name: 'Sage', src: 'PHB', skills: ['Arcana', 'History'], langs: 2, feature: ['Researcher', 'If you don\'t know a piece of lore, you know where to find it.'], equip: ['Ink (1 ounce bottle)', 'Ink pen', 'Knife, small', "Common clothes"], gold: 10 });
BG('sailor', { name: 'Sailor / Pirate', src: 'PHB', skills: ['Athletics', 'Perception'], tools: ["Navigator's tools", 'Vehicles (water)'], feature: ["Ship's Passage", 'Secure free passage on a sailing ship for you and companions. (Pirate: Bad Reputation.)'], equip: ['Club', 'Rope, silk (50 feet)', "Common clothes"], gold: 10 });
BG('soldier', { name: 'Soldier', src: 'PHB', skills: ['Athletics', 'Intimidation'], tools: ['Vehicles (land)'], toolChoice: { n: 1, from: 'gaming' }, feature: ['Military Rank', 'Soldiers loyal to your former organization recognize your authority.'], equip: ['Insignia of rank', 'Trophy', 'Dice set', "Common clothes"], gold: 10 });
BG('urchin', { name: 'Urchin', src: 'PHB', skills: ['Sleight of Hand', 'Stealth'], tools: ['Disguise kit', "Thieves' tools"], feature: ['City Secrets', 'Travel through a city twice as fast using hidden paths.'], equip: ['Knife, small', 'Map of your home city', 'Pet mouse', "Common clothes"], gold: 10 });
BG('citywatch', { name: 'City Watch / Investigator', src: 'SCAG', skills: ['Athletics', 'Insight'], langs: 2, feature: ["Watcher's Eye", 'Easily find the local watch post and spot criminal haunts. (Investigator: Insight and Investigation.)'], equip: ['Uniform', 'Horn', 'Manacles'], gold: 10 });
BG('clancrafter', { name: 'Clan Crafter', src: 'SCAG', skills: ['History', 'Insight'], toolChoice: { n: 1, from: 'artisan' }, langs: 1, feature: ['Respect of the Stout Folk', 'Dwarves provide free room and board.'], equip: ["Artisan's tools", "Maker's mark chisel", "Traveler's clothes"], gold: 10 });
BG('cloisteredscholar', { name: 'Cloistered Scholar', src: 'SCAG', skills: ['History'], skillChoice: { n: 1, from: ['Arcana', 'Nature', 'Religion'] }, langs: 2, feature: ['Library Access', 'Access to scholarly libraries and help with research.'], equip: ["Scholar's robes", 'Ink', 'Ink pen', 'Book of history'], gold: 10 });
BG('courtier', { name: 'Courtier', src: 'SCAG', skills: ['Insight', 'Persuasion'], langs: 2, feature: ['Court Functionary', 'Knowledge of how bureaucracies work and access to records.'], equip: ['Fine clothes'], gold: 5 });
BG('factionagent', { name: 'Faction Agent', src: 'SCAG', skills: ['Insight'], skillChoice: { n: 1, from: ['Animal Handling', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Perception', 'Performance', 'Persuasion', 'Survival', 'Arcana', 'History', 'Nature', 'Religion'] }, langs: 2, feature: ['Safe Haven', 'Your faction offers safe houses and contacts.'], equip: ['Badge of your faction', 'Copy of a seminal faction text', "Common clothes"], gold: 15 });
BG('fartraveler', { name: 'Far Traveler', src: 'SCAG', skills: ['Insight', 'Perception'], toolChoice: { n: 1, from: ['instrument', 'gaming'] }, langs: 1, feature: ['All Eyes on You', 'Your foreign manner attracts curiosity and invitations.'], equip: ["Traveler's clothes", 'Maps of your homeland', 'Small jewelry'], gold: 5 });
BG('inheritor', { name: 'Inheritor', src: 'SCAG', skills: ['Survival'], skillChoice: { n: 1, from: ['Arcana', 'History', 'Religion'] }, toolChoice: { n: 1, from: ['instrument', 'gaming'] }, langs: 1, feature: ['Inheritance', 'You inherited an important item, document or secret.'], equip: ['Your inheritance', "Traveler's clothes"], gold: 15 });
BG('knightoftheorder', { name: 'Knight of the Order', src: 'SCAG', skills: ['Persuasion'], skillChoice: { n: 1, from: ['Arcana', 'History', 'Nature', 'Religion'] }, toolChoice: { n: 1, from: ['instrument', 'gaming'] }, langs: 1, feature: ['Knightly Regard', 'Members of your order and its allies offer shelter and aid.'], equip: ["Traveler's clothes", 'Signet or banner of your order'], gold: 10 });
BG('mercenaryveteran', { name: 'Mercenary Veteran', src: 'SCAG', skills: ['Athletics', 'Persuasion'], tools: ['Vehicles (land)'], toolChoice: { n: 1, from: 'gaming' }, feature: ['Mercenary Life', 'Find mercenary work and know the companies that hire.'], equip: ['Uniform of your company', 'Insignia of rank', 'Gaming set'], gold: 10 });
BG('urbanbountyhunter', { name: 'Urban Bounty Hunter', src: 'SCAG', skillChoice: { n: 2, from: ['Deception', 'Insight', 'Persuasion', 'Stealth'] }, toolChoice: { n: 2, from: ['gaming', 'instrument', "Thieves' tools"] }, feature: ['Ear to the Ground', 'Contacts who can locate people in cities.'], equip: ['Clothes appropriate to your duties'], gold: 20 });
BG('uthgardt', { name: 'Uthgardt Tribe Member', src: 'SCAG', skills: ['Athletics', 'Survival'], toolChoice: { n: 1, from: ['instrument', 'artisan'] }, langs: 1, feature: ['Uthgardt Heritage', 'Find twice the food when foraging; tribes welcome you.'], equip: ['Hunting trap', 'Totemic token', "Traveler's clothes"], gold: 10 });
BG('waterdhaviannoble', { name: 'Waterdhavian Noble', src: 'SCAG', skills: ['History', 'Persuasion'], toolChoice: { n: 1, from: ['instrument', 'gaming'] }, langs: 1, feature: ['Kept in Style', 'Your family pays for comfortable lifestyle expenses in Waterdeep.'], equip: ['Fine clothes', 'Signet ring', 'Scroll of pedigree'], gold: 20 });
BG('hauntedone', { name: 'Haunted One', src: 'VRGR', skillChoice: { n: 2, from: ['Arcana', 'Investigation', 'Religion', 'Survival'] }, langs: 2, feature: ['Heart of Darkness', 'Common folk sense your burden and will help you, even fighting at your side.'], equip: ["Monster hunter's pack", 'Gothic trinket', "Common clothes"], gold: 1 });
BG('houseagent', { name: 'House Agent', src: 'WGtE', skills: ['Investigation', 'Persuasion'], toolChoice: { n: 2, from: 'any' }, feature: ['House Connections', 'Your dragonmarked house provides lodging, resources and contacts.'], equip: ['Fine clothes', 'House signet ring', 'Identification papers'], gold: 20 });
BG('giantfoundling', { name: 'Giant Foundling', src: 'BGG', skills: ['Intimidation', 'Survival'], langs: 1, feat: 'Strike of the Giants', feature: ['Origin Stories', 'You were raised by or among giants; also gain the Strike of the Giants feat.'], equip: ["Traveler's clothes", 'Small stone or sprig'], gold: 10 });
BG('runecarver', { name: 'Rune Carver', src: 'BGG', skills: ['History', 'Perception'], toolChoice: { n: 1, from: 'artisan' }, langs: 1, feat: 'Rune Shaper', feature: ['Rune Carving', 'You study giant runes; also gain the Rune Shaper feat.'], equip: ["Artisan's tools", 'Small knife', 'Whetstone', "Common clothes"], gold: 10 });
BG('custom', { name: 'Custom Background', src: 'PHB', skillChoice: { n: 2, from: 'any' }, toolChoice: { n: 2, from: 'any', orLang: true }, feature: ['Custom Feature', 'Pick or invent a background feature with your DM.'], equip: [], gold: 10 });

// Feats: [name, source, prerequisite, summary, effects]
// effects: asi {abilities:[...], amount} | asiFixed {str:1} | init | hpPerLevel | speed | saveProf 'choose' | skills n | armorCats | passive | spells | res
DND.feats = [
  ['Actor', 'PHB', '', '+1 CHA; advantage on Deception and Performance to pass as someone else; mimic voices.', { asiFixed: { cha: 1 } }],
  ['Alert', 'PHB', '', '+5 initiative; can\'t be surprised while conscious; unseen attackers gain no advantage.', { init: 5 }],
  ['Athlete', 'PHB', '', '+1 STR or DEX; stand up with 5 ft; climbing costs no extra; running jumps after 5 ft.', { asi: ['str', 'dex'] }],
  ['Charger', 'PHB', '', 'After Dashing, bonus-action melee attack (+5 damage) or shove 10 ft.'],
  ['Crossbow Expert', 'PHB', '', 'Ignore loading; no disadvantage on ranged attacks in melee; bonus-action hand crossbow attack after attacking one-handed.'],
  ['Defensive Duelist', 'PHB', 'DEX 13', 'Reaction with a finesse weapon: add prof bonus to AC against one melee attack.', { col: 'reaction' }],
  ['Dual Wielder', 'PHB', '', '+1 AC while wielding two weapons; dual wield non-light weapons; draw two at once.'],
  ['Dungeon Delver', 'PHB', '', 'Advantage to find secret doors and vs traps; resistance to trap damage; search at normal pace.'],
  ['Durable', 'PHB', '', '+1 CON; Hit Dice heal at least 2 × CON mod.', { asiFixed: { con: 1 } }],
  ['Elemental Adept', 'PHB', 'Spellcasting', 'Choose acid, cold, fire, lightning or thunder: spells ignore resistance and treat 1s as 2s.', { element: true }],
  ['Grappler', 'PHB', 'STR 13', 'Advantage on attacks against creatures you grapple; pin them (restrained).'],
  ['Great Weapon Master', 'PHB', '', 'Bonus-action attack after a crit or kill; take −5 to hit for +10 damage with heavy weapons.'],
  ['Healer', 'PHB', '', "Healer's kit stabilizes and heals 1d6 + 4 + creature's max Hit Dice once per rest per creature."],
  ['Heavily Armored', 'PHB', 'Medium armor proficiency', '+1 STR; heavy armor proficiency.', { asiFixed: { str: 1 }, armorCats: ['heavy'] }],
  ['Heavy Armor Master', 'PHB', 'Heavy armor proficiency', '+1 STR; reduce nonmagical bludgeoning, piercing and slashing damage by 3 in heavy armor.', { asiFixed: { str: 1 } }],
  ['Inspiring Leader', 'PHB', 'CHA 13', '10-minute speech: up to six creatures gain level + CHA temp HP.', { res: { max: '1', reset: 'short' } }],
  ['Keen Mind', 'PHB', '', '+1 INT; always know north, hours to sunrise, and recall anything from the past month.', { asiFixed: { int: 1 } }],
  ['Lightly Armored', 'PHB', '', '+1 STR or DEX; light armor proficiency.', { asi: ['str', 'dex'], armorCats: ['light'] }],
  ['Linguist', 'PHB', '', '+1 INT; learn three languages; create written ciphers.', { asiFixed: { int: 1 }, langs: 3 }],
  ['Lucky', 'PHB', '', 'Spend a luck point to roll an extra d20 for an attack, check or save (or an attack against you).', { res: { max: '3', reset: 'long' } }],
  ['Mage Slayer', 'PHB', '', 'Reaction attack against adjacent casters; they have disadvantage on concentration saves; advantage on saves vs adjacent spells.'],
  ['Magic Initiate', 'PHB', '', 'Learn two cantrips and one 1st-level spell (once per long rest) from one class list.', { spells: 'initiate' }],
  ['Martial Adept', 'PHB', '', 'Learn two maneuvers and gain one d6 superiority die (short rest).', { res: { max: '1', reset: 'short', name: 'Superiority Die (d6)' } }],
  ['Medium Armor Master', 'PHB', 'Medium armor proficiency', 'No Stealth disadvantage in medium armor; DEX bonus up to +3.', { medMaster: true }],
  ['Mobile', 'PHB', '', '+10 ft speed; Dash ignores difficult terrain; no opportunity attacks from creatures you melee.', { speed: 10 }],
  ['Moderately Armored', 'PHB', 'Light armor proficiency', '+1 STR or DEX; medium armor and shield proficiency.', { asi: ['str', 'dex'], armorCats: ['medium', 'shield'] }],
  ['Mounted Combatant', 'PHB', '', 'Advantage vs smaller unmounted creatures; redirect attacks to you; mount gets evasion.'],
  ['Observant', 'PHB', '', '+1 INT or WIS; read lips; +5 passive Perception and Investigation.', { asi: ['int', 'wis'], passive: 5 }],
  ['Polearm Master', 'PHB', '', 'Bonus-action butt-end attack (1d4) with glaive, halberd, quarterstaff or spear; opportunity attacks when creatures enter reach.'],
  ['Resilient', 'PHB', '', '+1 to one ability and proficiency in its saving throws.', { asi: ['str', 'dex', 'con', 'int', 'wis', 'cha'], saveProfFromAsi: true }],
  ['Ritual Caster', 'PHB', 'INT or WIS 13', 'Ritual book with two 1st-level ritual spells from one class; add more as you find them.'],
  ['Savage Attacker', 'PHB', '', 'Once per turn, reroll melee weapon damage dice and use either total.'],
  ['Sentinel', 'PHB', '', 'Opportunity attack hits reduce speed to 0; Disengage doesn\'t help; react to attacks on adjacent allies.'],
  ['Sharpshooter', 'PHB', '', 'No disadvantage at long range; ignore half and three-quarters cover; −5 to hit for +10 damage.'],
  ['Shield Master', 'PHB', '', 'Bonus-action shove after attacking; add shield AC to DEX saves; evasion-like reaction.'],
  ['Skilled', 'PHB', '', 'Gain proficiency in any combination of three skills or tools.', { skills: 3 }],
  ['Skulker', 'PHB', 'DEX 13', 'Hide when lightly obscured; missing doesn\'t reveal you; dim light doesn\'t hinder Perception.'],
  ['Spell Sniper', 'PHB', 'Spellcasting', 'Double range of attack spells; ignore half and three-quarters cover; learn one attack cantrip.'],
  ['Tavern Brawler', 'PHB', '', '+1 STR or CON; improvised weapon proficiency; unarmed strikes deal 1d4; bonus-action grapple.', { asi: ['str', 'con'] }],
  ['Tough', 'PHB', '', '+2 max HP per level.', { hpPerLevel: 2 }],
  ['War Caster', 'PHB', 'Spellcasting', 'Advantage on concentration saves; cast with hands full; cast a spell as an opportunity attack.'],
  ['Weapon Master', 'PHB', '', '+1 STR or DEX; proficiency with four weapons.', { asi: ['str', 'dex'] }],
  // Xanathar's racial feats
  ['Bountiful Luck', 'XGE', 'Halfling', 'Reaction: let an ally within 30 ft reroll a natural 1.'],
  ['Dragon Fear', 'XGE', 'Dragonborn', '+1 STR, CON or CHA; spend breath weapon to frighten creatures within 30 ft.', { asi: ['str', 'con', 'cha'] }],
  ['Dragon Hide', 'XGE', 'Dragonborn', '+1 STR, CON or CHA; unarmored AC 13 + DEX; retractable claws (1d4).', { asi: ['str', 'con', 'cha'], unarmored: '13+dex' }],
  ['Drow High Magic', 'XGE', 'Drow', 'Detect magic at will; levitate and dispel magic once per long rest.'],
  ['Dwarven Fortitude', 'XGE', 'Dwarf', '+1 CON; spend a Hit Die to heal when you Dodge.', { asiFixed: { con: 1 } }],
  ['Elven Accuracy', 'XGE', 'Elf or half-elf', '+1 DEX, INT, WIS or CHA; reroll one die when you have advantage with those abilities.', { asi: ['dex', 'int', 'wis', 'cha'] }],
  ['Fade Away', 'XGE', 'Gnome', '+1 DEX or INT; reaction: become invisible after taking damage.', { asi: ['dex', 'int'], res: { max: '1', reset: 'short' } }],
  ['Fey Teleportation', 'XGE', 'High elf', '+1 INT or CHA; learn Sylvan; cast misty step once per short rest.', { asi: ['int', 'cha'], res: { max: '1', reset: 'short' } }],
  ['Flames of Phlegethos', 'XGE', 'Tiefling', '+1 INT or CHA; reroll 1s on fire spell damage; wreathed in flames that burn attackers.', { asi: ['int', 'cha'] }],
  ['Infernal Constitution', 'XGE', 'Tiefling', '+1 CON; resistance to cold and poison; advantage vs poisoned.', { asiFixed: { con: 1 } }],
  ['Orcish Fury', 'XGE', 'Half-orc', '+1 STR or CON; extra weapon die once per short rest; reaction attack after Relentless Endurance.', { asi: ['str', 'con'] }],
  ['Prodigy', 'XGE', 'Half-elf, half-orc or human', 'One skill, one tool, one language, and expertise in one skill.', { skills: 1, expertise: 1 }],
  ['Second Chance', 'XGE', 'Halfling', '+1 DEX, CON or CHA; reaction: force an attacker to reroll a hit.', { asi: ['dex', 'con', 'cha'], res: { max: '1', reset: 'short' } }],
  ['Squat Nimbleness', 'XGE', 'Dwarf or Small race', '+1 STR or DEX; +5 ft speed; Athletics or Acrobatics; advantage to escape grapples.', { asi: ['str', 'dex'], speed: 5 }],
  ['Wood Elf Magic', 'XGE', 'Wood elf', 'Learn a druid cantrip; longstrider and pass without trace once per long rest.'],
  // Tasha's
  ['Artificer Initiate', 'TCE', '', 'Learn an artificer cantrip and 1st-level spell; tinker\'s tools proficiency.'],
  ['Chef', 'TCE', '', '+1 CON or WIS; cook\'s utensils; meals heal extra; treats grant temp HP.', { asi: ['con', 'wis'] }],
  ['Crusher', 'TCE', '', '+1 STR or CON; push targets 5 ft with bludgeoning hits; crits grant advantage to allies.', { asi: ['str', 'con'] }],
  ['Eldritch Adept', 'TCE', 'Spellcasting or Pact Magic', 'Learn one eldritch invocation.'],
  ['Fey Touched', 'TCE', '', '+1 INT, WIS or CHA; learn misty step and one 1st-level divination or enchantment spell (each once per long rest free).', { asi: ['int', 'wis', 'cha'] }],
  ['Fighting Initiate', 'TCE', 'Martial weapon proficiency', 'Learn one fighting style.'],
  ['Gunner', 'TCE', '', '+1 DEX; firearm proficiency; ignore loading; no disadvantage in melee.', { asiFixed: { dex: 1 } }],
  ['Metamagic Adept', 'TCE', 'Spellcasting or Pact Magic', 'Learn two Metamagic options and gain 2 sorcery points.', { res: { max: '2', reset: 'long', name: 'Sorcery Points (Metamagic Adept)' } }],
  ['Piercer', 'TCE', '', '+1 STR or DEX; reroll a piercing damage die once per turn; extra die on crits.', { asi: ['str', 'dex'] }],
  ['Poisoner', 'TCE', '', 'Ignore poison resistance; apply potent poison as a bonus action; poisoner\'s kit.'],
  ['Shadow Touched', 'TCE', '', '+1 INT, WIS or CHA; learn invisibility and one 1st-level illusion or necromancy spell.', { asi: ['int', 'wis', 'cha'] }],
  ['Skill Expert', 'TCE', '', '+1 to any ability; one skill proficiency; expertise in one skill.', { asi: ['str', 'dex', 'con', 'int', 'wis', 'cha'], skills: 1, expertise: 1 }],
  ['Slasher', 'TCE', '', '+1 STR or DEX; slashing hits reduce speed by 10 ft; crits impose disadvantage.', { asi: ['str', 'dex'] }],
  ['Telekinetic', 'TCE', '', '+1 INT, WIS or CHA; invisible mage hand; bonus-action shove 5 ft (STR save).', { asi: ['int', 'wis', 'cha'] }],
  ['Telepathic', 'TCE', '', '+1 INT, WIS or CHA; telepathy 60 ft; cast detect thoughts once per long rest.', { asi: ['int', 'wis', 'cha'] }],
  // Fizban's
  ['Gift of the Chromatic Dragon', 'FTD', '', 'Bonus action: infuse a weapon with +1d4 elemental damage for 1 minute; reaction resistance (prof/long rest).'],
  ['Gift of the Gem Dragon', 'FTD', '', '+1 INT, WIS or CHA; reaction telekinetic reprisal 2d8 force and push (prof/long rest).', { asi: ['int', 'wis', 'cha'] }],
  ['Gift of the Metallic Dragon', 'FTD', '', 'Cast cure wounds once per long rest; reaction: protective wings add your proficiency bonus to AC against one hit on you or an ally within 5 ft (prof bonus uses/long rest).'],
  // Bigby's
  ['Ember of the Fire Giant', 'BGG', 'Giant Foundling or Rune Shaper', '+1 STR, CON or WIS; fire resistance; replace an attack with a fiery burst.', { asi: ['str', 'con', 'wis'] }],
  ['Fury of the Frost Giant', 'BGG', 'Giant Foundling or Rune Shaper', '+1 STR, CON or WIS; cold resistance; reaction cold damage and slow.', { asi: ['str', 'con', 'wis'] }],
  ['Guile of the Cloud Giant', 'BGG', 'Giant Foundling or Rune Shaper', '+1 STR, CON or CHA; reaction: reduce damage and teleport.', { asi: ['str', 'con', 'cha'] }],
  ['Keenness of the Stone Giant', 'BGG', 'Giant Foundling or Rune Shaper', '+1 STR, CON or WIS; darkvision 60 ft; bonus-action thrown stone (1d10).', { asi: ['str', 'con', 'wis'] }],
  ['Rune Shaper', 'BGG', '', 'Learn comprehend languages and runes that let you cast spells once per long rest.'],
  ['Soul of the Storm Giant', 'BGG', 'Giant Foundling or Rune Shaper', '+1 STR, CON or WIS; bonus-action storm aura.', { asi: ['str', 'con', 'wis'] }],
  ['Strike of the Giants', 'BGG', 'Martial weapon proficiency', 'Once per turn, add a giant-themed effect to a weapon hit (prof/long rest).', { res: { max: 'prof', reset: 'long' } }],
  ['Vigor of the Hill Giant', 'BGG', 'Giant Foundling or Rune Shaper', '+1 STR, CON or WIS; resist being knocked prone or moved; extra healing.', { asi: ['str', 'con', 'wis'] }],
  // Eberron
  ['Aberrant Dragonmark', 'WGtE', 'No other dragonmark', '+1 CON; learn a sorcerer cantrip and 1st-level spell; spend a Hit Die when casting it.', { asiFixed: { con: 1 } }]
];
