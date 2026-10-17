DND.classes.fighter = {
  name: 'Fighter', hd: 10, saves: ['str', 'con'], src: 'PHB',
  armor: 'All armor, shields', weapons: 'Simple weapons, martial weapons', tools: '',
  armorCats: ['light', 'medium', 'heavy', 'shield'], weaponCats: ['simple', 'martial'],
  skills: { n: 2, from: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
  mc: { req: [['str', 13], ['dex', 13]], reqAny: true, profs: 'Light armor, medium armor, shields, simple weapons, martial weapons', armorCats: ['light', 'medium', 'shield'], weaponCats: ['simple', 'martial'] },
  sub: { level: 3, label: 'Martial Archetype' }, asi: [4, 6, 8, 12, 14, 16, 19], gold: '5d4*10',
  extraAttack: { 5: 2, 11: 3, 20: 4 },
  kit: ['Chain Mail', 'Longsword', 'Shield', 'Crossbow, light', 'Crossbow bolts:20', "Dungeoneer's Pack"],
  choices: [{ level: 1, type: 'fightingStyle', n: 1 }],
  features: [
    [1, 'Fighting Style', 'Adopt a fighting style specialty.'],
    [1, 'Second Wind', 'Bonus action: regain 1d10 + fighter level HP.', { max: '1', reset: 'short', col: 'bonus', roll: '1d10+fighter' }],
    [2, 'Action Surge', 'Take one additional action on your turn (two uses at 17th, once per turn).', { max: 'tier(fighter,2,1,17,2)', reset: 'short' }],
    [5, 'Extra Attack', 'Attack twice when you take the Attack action (three times at 11th, four at 20th).'],
    [9, 'Indomitable', 'Reroll a failed saving throw.', { max: 'tier(fighter,9,1,13,2,17,3)', reset: 'long' }]
  ],
  subclasses: {
    champion: { name: 'Champion', src: 'PHB', features: [
      [3, 'Improved Critical', 'Weapon attacks score a critical hit on 19–20.', { crit: 19 }],
      [7, 'Remarkable Athlete', 'Add half proficiency to STR, DEX and CON checks you lack proficiency in; longer running jumps.'],
      [10, 'Additional Fighting Style', 'Choose a second fighting style.'],
      [15, 'Superior Critical', 'Weapon attacks score a critical hit on 18–20.', { crit: 18 }],
      [18, 'Survivor', 'Regain 5 + CON mod HP at the start of each turn while at or below half HP (and above 0).']] },
    battlemaster: { name: 'Battle Master', src: 'PHB', choices: [{ level: 3, type: 'maneuver', n: 3 }, { level: 7, type: 'maneuver', n: 2 }, { level: 10, type: 'maneuver', n: 2 }, { level: 15, type: 'maneuver', n: 2 }],
      scaling: [['Superiority Die', { 3: 'd8', 10: 'd10', 18: 'd12' }], ['Maneuver DC', { 3: '8 + prof + STR or DEX' }]], features: [
      [3, 'Combat Superiority', 'Fuel maneuvers with superiority dice; regain them on a short rest.', { max: 'tier(fighter,3,4,7,5,15,6)', reset: 'short' }],
      [3, 'Student of War', "Proficiency with one artisan's tool."],
      [7, 'Know Your Enemy', 'Study a creature for a minute to learn how it compares to you.'],
      [10, 'Improved Combat Superiority', 'Superiority dice become d10s (d12 at 18th).'],
      [15, 'Relentless', 'Regain one superiority die when you roll initiative with none left.']] },
    eldritchknight: { name: 'Eldritch Knight', src: 'PHB', caster: { type: 'third', ab: 'int', list: 'W', known: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13], cantrips: [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] }, features: [
      [3, 'Spellcasting', 'Cast wizard spells with INT (mostly abjuration and evocation).'],
      [3, 'Weapon Bond', "Bond with up to two weapons; you can't be disarmed and can summon them as a bonus action."],
      [7, 'War Magic', 'After casting a cantrip with your action, make one weapon attack as a bonus action.'],
      [10, 'Eldritch Strike', 'Weapon hits give the target disadvantage on its next save against your spell.'],
      [15, 'Arcane Charge', 'Teleport up to 30 ft when you use Action Surge.'],
      [18, 'Improved War Magic', 'After casting a spell with your action, make one weapon attack as a bonus action.']] },
    arcanearcher: { name: 'Arcane Archer', src: 'XGE', choices: [{ level: 3, type: 'arcaneShot', n: 2 }, { level: 7, type: 'arcaneShot', n: 1 }, { level: 10, type: 'arcaneShot', n: 1 }, { level: 15, type: 'arcaneShot', n: 1 }, { level: 18, type: 'arcaneShot', n: 1 }], features: [
      [3, 'Arcane Archer Lore', 'Proficiency in Arcana or Nature; learn prestidigitation or druidcraft.'],
      [3, 'Arcane Shot', 'Once per turn, add a magical effect to a hit with a ranged weapon.', { max: '2', reset: 'short' }],
      [7, 'Magic Arrow', 'Your arrows count as magical.'],
      [7, 'Curving Shot', 'Bonus action: redirect a missed magic arrow to another target within 60 ft.'],
      [15, 'Ever-Ready Shot', 'Regain one Arcane Shot use when you roll initiative with none left.']] },
    cavalier: { name: 'Cavalier', src: 'XGE', features: [
      [3, 'Bonus Proficiency', 'One of Animal Handling, History, Insight, Performance or Persuasion, or a language.'],
      [3, 'Born to the Saddle', 'Advantage on saves to avoid falling off a mount; mounting costs 5 ft.'],
      [3, 'Unwavering Mark', 'Mark creatures you hit; marked foes have disadvantage attacking others, and you get a bonus-action punishing attack.', { max: 'max(1,str)', reset: 'long' }],
      [7, 'Warding Maneuver', 'Reaction: add 1d8 to an ally\'s AC and give resistance against a hit.', { max: 'max(1,con)', reset: 'long', col: 'reaction' }],
      [10, 'Hold the Line', 'Opportunity attacks when creatures move within your reach; hits reduce speed to 0.'],
      [15, 'Ferocious Charger', 'After moving 10 ft in a line, a hit can knock the target prone.'],
      [18, 'Vigilant Defender', 'One extra reaction per creature turn for opportunity attacks.']] },
    samurai: { name: 'Samurai', src: 'XGE', features: [
      [3, 'Bonus Proficiency', 'One of History, Insight, Performance or Persuasion, or a language.'],
      [3, 'Fighting Spirit', 'Bonus action: advantage on weapon attacks this turn and temp HP (5, 10 at 10th, 15 at 15th).', { max: '3', reset: 'long', col: 'bonus' }],
      [7, 'Elegant Courtier', 'Add WIS to Persuasion checks; proficiency in WIS saves (or another save).'],
      [10, 'Tireless Spirit', 'Regain one Fighting Spirit use when you roll initiative with none left.'],
      [15, 'Rapid Strike', 'Trade advantage on an attack for an extra attack.'],
      [18, 'Strength before Death', 'When reduced to 0 HP, take an extra turn immediately.', { max: '1', reset: 'long' }]] },
    psiwarrior: { name: 'Psi Warrior', src: 'TCE', scaling: [['Psionic Energy Die', { 3: 'd6', 5: 'd8', 11: 'd10', 17: 'd12' }]], features: [
      [3, 'Psionic Power', 'Psionic Energy dice fuel Protective Field (reduce damage), Psionic Strike (+force damage) and Telekinetic Movement. Bonus action: regain one die (once per short rest).', { max: '2*prof', reset: 'long' }],
      [7, 'Telekinetic Adept', 'Psi-Powered Leap (fly) and Telekinetic Thrust (push or knock prone after a Psionic Strike).'],
      [10, 'Guarded Mind', 'Resistance to psychic damage; spend a die to end charm or fear.'],
      [15, 'Bulwark of Force', 'Bonus action: give half cover to up to INT mod creatures for 1 minute.', { max: '1', reset: 'long', col: 'bonus' }],
      [18, 'Telekinetic Master', 'Cast telekinesis without a slot; attack as a bonus action while concentrating on it.', { max: '1', reset: 'long' }]] },
    runeknight: { name: 'Rune Knight', src: 'TCE', choices: [{ level: 3, type: 'rune', n: 2 }, { level: 7, type: 'rune', n: 1 }, { level: 10, type: 'rune', n: 1 }, { level: 15, type: 'rune', n: 1 }], features: [
      [3, 'Bonus Proficiencies', "Smith's tools and Giant language."],
      [3, 'Rune Carver', 'Inscribe runes on gear; each has a passive benefit and an activated effect (once per short rest each).'],
      [3, "Giant's Might", 'Bonus action: become Large, advantage on STR checks/saves, +1d6 weapon damage once per turn (1d8 at 10th, 1d10 at 18th).', { max: 'prof', reset: 'long', col: 'bonus' }],
      [7, 'Runic Shield', 'Reaction: force a creature to reroll an attack against an ally.', { max: 'prof', reset: 'long', col: 'reaction' }],
      [10, 'Great Stature', 'Grow taller; Giant\'s Might damage becomes 1d8.'],
      [15, 'Master of Runes', 'Invoke each rune twice per short rest.'],
      [18, 'Runic Juggernaut', "Giant's Might makes you Huge, +5 ft reach, damage 1d10."]] },
    purpledragon: { name: 'Purple Dragon Knight (Banneret)', src: 'SCAG', features: [
      [3, 'Rallying Cry', 'When you use Second Wind, up to three allies within 60 ft regain HP equal to your fighter level.'],
      [7, 'Royal Envoy', 'Persuasion proficiency (expertise if already proficient); add one of Animal Handling, Insight, Intimidation or Performance.'],
      [10, 'Inspiring Surge', 'When you Action Surge, an ally within 60 ft can make a weapon attack with its reaction (two allies at 18th).'],
      [15, 'Bulwark', 'When you use Indomitable on an INT, WIS or CHA save, an ally can reroll the same save.']] }
  }
};

DND.classes.monk = {
  name: 'Monk', hd: 8, saves: ['str', 'dex'], src: 'PHB',
  armor: 'None', weapons: 'Simple weapons, shortswords', tools: "One artisan's tool or musical instrument",
  armorCats: [], weaponCats: ['simple'], weaponNames: ['Shortsword'],
  skills: { n: 2, from: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
  mc: { req: [['dex', 13], ['wis', 13]], profs: 'Simple weapons, shortswords', weaponCats: ['simple'] },
  sub: { level: 3, label: 'Monastic Tradition' }, asi: [4, 8, 12, 16, 19], gold: '5d4', extraAttack: { 5: 2 },
  unarmored: '10+dex+wis', unarmoredNoShield: true, martialArts: true,
  kit: ['Shortsword', "Dungeoneer's Pack", 'Dart:10'],
  scaling: [['Martial Arts Die', { 1: 'd4', 5: 'd6', 11: 'd8', 17: 'd10' }], ['Unarmored Movement', { 2: '+10 ft', 6: '+15 ft', 10: '+20 ft', 14: '+25 ft', 18: '+30 ft' }], ['Ki Save DC', { 2: '8 + prof + WIS' }]],
  features: [
    [1, 'Unarmored Defense', 'Without armor or shield, AC = 10 + DEX + WIS.'],
    [1, 'Martial Arts', 'Use DEX for unarmed strikes and monk weapons, roll your Martial Arts die for damage, and make an unarmed strike as a bonus action after attacking.'],
    [2, 'Ki', 'Spend ki for Flurry of Blows (two bonus unarmed strikes), Patient Defense (Dodge as bonus action) or Step of the Wind (Dash/Disengage as bonus action, double jump).', { max: 'monk', reset: 'short', col: 'bonus' }],
    [2, 'Unarmored Movement', 'Speed increases while not wearing armor or a shield; at 9th, move along walls and water.'],
    [3, 'Deflect Missiles', 'Reaction: reduce ranged weapon damage by 1d10 + DEX + monk level; spend 1 ki to throw it back.'],
    [4, 'Slow Fall', 'Reaction: reduce falling damage by 5 × monk level.'],
    [5, 'Extra Attack', 'Attack twice when you take the Attack action.'],
    [5, 'Stunning Strike', 'Spend 1 ki on a melee hit: target makes a CON save or is stunned until the end of your next turn.'],
    [6, 'Ki-Empowered Strikes', 'Unarmed strikes count as magical.'],
    [7, 'Evasion', 'Take no damage on a successful DEX save for half (half on a failure).'],
    [7, 'Stillness of Mind', 'Action: end a charm or fear effect on yourself.'],
    [10, 'Purity of Body', 'Immune to disease and poison.'],
    [13, 'Tongue of the Sun and Moon', 'Understand all spoken languages and be understood by any creature that speaks one.'],
    [14, 'Diamond Soul', 'Proficiency in all saving throws; spend 1 ki to reroll a failed save.'],
    [15, 'Timeless Body', 'No frailty of old age; no need for food or water.'],
    [18, 'Empty Body', 'Spend 4 ki to become invisible with resistance to all but force for 1 minute; 8 ki for astral projection.'],
    [20, 'Perfect Self', 'Regain 4 ki when you roll initiative with none left.']
  ],
  subclasses: {
    openhand: { name: 'Way of the Open Hand', src: 'PHB', features: [
      [3, 'Open Hand Technique', 'Flurry of Blows hits can knock prone, push 15 ft, or deny reactions.'],
      [6, 'Wholeness of Body', 'Action: regain 3 × monk level HP.', { max: '1', reset: 'long', col: 'action' }],
      [11, 'Tranquility', 'At the end of a long rest, gain the effect of sanctuary.'],
      [17, 'Quivering Palm', 'Spend 3 ki on a hit to set lethal vibrations: later, CON save or drop to 0 HP (10d10 necrotic on success).']] },
    shadow: { name: 'Way of Shadow', src: 'PHB', features: [
      [3, 'Shadow Arts', 'Spend 2 ki to cast darkness, darkvision, pass without trace or silence; know minor illusion.'],
      [6, 'Shadow Step', 'Bonus action: teleport between dim light or darkness up to 60 ft, gaining advantage on your next melee attack.'],
      [11, 'Cloak of Shadows', 'Action: become invisible in dim light or darkness.'],
      [17, 'Opportunist', 'Reaction: attack a creature within 5 ft that was hit by someone else.']] },
    fourelements: { name: 'Way of the Four Elements', src: 'PHB', features: [
      [3, 'Disciple of the Elements', 'Learn Elemental Attunement and one elemental discipline; more at 6th, 11th and 17th. Spend ki to cast elemental spells. Record your disciplines here.']] },
    drunkenmaster: { name: 'Way of the Drunken Master', src: 'XGE', features: [
      [3, 'Bonus Proficiencies', "Performance and brewer's supplies."],
      [3, 'Drunken Technique', 'Flurry of Blows also grants Disengage and +10 ft speed.'],
      [6, 'Tipsy Sway', 'Stand up for 5 ft; spend 1 ki to redirect a missed attack.'],
      [11, "Drunkard's Luck", 'Spend 2 ki to cancel disadvantage on a check, attack or save.'],
      [17, 'Intoxicated Frenzy', 'Flurry of Blows makes up to five attacks against different targets.']] },
    kensei: { name: 'Way of the Kensei', src: 'XGE', features: [
      [3, 'Path of the Kensei', 'Choose kensei weapons; Agile Parry (+2 AC), Kensei\'s Shot (+1d4 ranged), Way of the Brush (calligraphy or painting).'],
      [6, 'One with the Blade', 'Kensei weapons are magical; Deft Strike (spend ki for extra damage).'],
      [11, 'Sharpen the Blade', 'Bonus action: spend up to 3 ki to give a kensei weapon +1 to +3 for a minute.'],
      [17, 'Unerring Accuracy', 'Reroll one missed monk-weapon attack per turn.']] },
    longdeath: { name: 'Way of the Long Death', src: 'SCAG', features: [
      [3, 'Touch of Death', 'When you reduce a creature to 0 HP, gain temp HP = WIS mod + monk level.'],
      [6, 'Hour of Reaping', 'Action: creatures within 30 ft make a WIS save or are frightened.'],
      [11, 'Mastery of Death', 'Spend 1 ki to drop to 1 HP instead of 0.'],
      [17, 'Touch of the Long Death', 'Spend 1–10 ki to deal 2d10 necrotic per ki (CON half).']] },
    sunsoul: { name: 'Way of the Sun Soul', src: 'XGE', features: [
      [3, 'Radiant Sun Bolt', 'Ranged spell attack with your Martial Arts die as radiant damage; Flurry-style bonus attacks for 1 ki.'],
      [6, 'Searing Arc Strike', 'After the Attack action, spend 2+ ki to cast burning hands as a bonus action.'],
      [11, 'Searing Sunburst', 'Action: 20 ft radius 2d6 radiant (CON save); spend ki for +2d6 each.'],
      [17, 'Sun Shield', 'Shed bright light; reaction radiant damage to creatures that hit you in melee.']] },
    mercy: { name: 'Way of Mercy', src: 'TCE', features: [
      [3, 'Implements of Mercy', "Insight, Medicine and herbalism kit; a mercy mask."],
      [3, 'Hand of Healing', 'Spend 1 ki to heal a Martial Arts die + WIS; can replace one Flurry strike.'],
      [3, 'Hand of Harm', 'Spend 1 ki on an unarmed hit for extra Martial Arts die + WIS necrotic (once per turn).'],
      [6, "Physician's Touch", 'Hand of Healing ends a disease or condition; Hand of Harm poisons.'],
      [11, 'Flurry of Healing and Harm', 'Replace each Flurry strike with Hand of Healing, and use Hand of Harm free once per turn.'],
      [17, 'Hand of Ultimate Mercy', 'Spend 5 ki to revive a creature dead under 24 hours.', { max: '1', reset: 'long' }]] },
    astralself: { name: 'Way of the Astral Self', src: 'TCE', features: [
      [3, 'Arms of the Astral Self', 'Bonus action, 1 ki: summon spectral arms (WIS for attacks, +5 ft reach, force damage) for 10 minutes.'],
      [6, 'Visage of the Astral Self', 'Spend 1 ki: astral visage grants darkvision and voice benefits.'],
      [11, 'Body of the Astral Self', 'With arms and visage active: deflect energy damage and add Martial Arts die to one hit per turn.'],
      [17, 'Awakened Astral Self', 'Spend 5 ki to summon full astral self: +2 AC and three attacks with Extra Attack.']] },
    ascendantdragon: { name: 'Way of the Ascendant Dragon', src: 'FTD', features: [
      [3, 'Draconic Disciple', 'Unarmed strikes can deal draconic damage; reroll failed CHA checks; learn Draconic.'],
      [3, 'Breath of the Dragon', 'Replace an attack with a 20 ft cone or 30 ft line of elemental breath (DEX half).', { max: 'prof', reset: 'long' }],
      [6, 'Wings Unfurled', 'With Step of the Wind, gain flying speed until the end of your turn.', { max: 'prof', reset: 'long' }],
      [11, 'Aspect of the Wyrm', 'Bonus action: frightening presence aura or resistance aura for 1 minute.', { max: '1', reset: 'long', col: 'bonus' }],
      [17, 'Ascendant Aspect', 'Blindsight 10 ft, stronger breath, explosive fury reaction.']] }
  }
};

DND.classes.paladin = {
  name: 'Paladin', hd: 10, saves: ['wis', 'cha'], src: 'PHB',
  armor: 'All armor, shields', weapons: 'Simple weapons, martial weapons', tools: '',
  armorCats: ['light', 'medium', 'heavy', 'shield'], weaponCats: ['simple', 'martial'],
  skills: { n: 2, from: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
  mc: { req: [['str', 13], ['cha', 13]], profs: 'Light armor, medium armor, shields, simple weapons, martial weapons', armorCats: ['light', 'medium', 'shield'], weaponCats: ['simple', 'martial'] },
  sub: { level: 3, label: 'Sacred Oath' }, asi: [4, 8, 12, 16, 19], gold: '5d4*10', extraAttack: { 5: 2 },
  caster: { type: 'half', ab: 'cha', list: 'P', prepared: 'cha+floor(paladin/2)', from: 2 },
  kit: ['Longsword', 'Shield', 'Javelin:5', "Priest's Pack", 'Chain Mail', 'Holy symbol'],
  choices: [{ level: 2, type: 'fightingStyle', n: 1 }],
  smite: true,
  features: [
    [1, 'Divine Sense', 'Action: until the end of your next turn, know the location of celestials, fiends and undead within 60 ft.', { max: '1+cha', reset: 'long', col: 'action' }],
    [1, 'Lay on Hands', 'Action: restore HP from a pool, or spend 5 to cure a disease or poison.', { max: '5*paladin', reset: 'long', pool: true, col: 'action' }],
    [2, 'Fighting Style', 'Adopt a fighting style specialty.'],
    [2, 'Spellcasting', 'Prepare CHA mod + half paladin level spells from the paladin list.'],
    [2, 'Divine Smite', 'On a melee weapon hit, spend a spell slot for +2d8 radiant (+1d8 per slot level above 1st, max 5d8; +1d8 vs undead or fiends).'],
    [3, 'Divine Health', 'Immune to disease.'],
    [3, 'Channel Divinity', 'Use one of your oath\'s Channel Divinity options.', { max: '1', reset: 'short', col: 'action' }],
    [5, 'Extra Attack', 'Attack twice when you take the Attack action.'],
    [6, 'Aura of Protection', 'You and friendly creatures within 10 ft add your CHA mod (min +1) to saving throws while you are conscious (30 ft at 18th).', { aura: true }],
    [10, 'Aura of Courage', "You and friendly creatures within 10 ft can't be frightened while you are conscious."],
    [11, 'Improved Divine Smite', 'All melee weapon hits deal +1d8 radiant.'],
    [14, 'Cleansing Touch', 'Action: end one spell on yourself or a willing creature.', { max: 'max(1,cha)', reset: 'long', col: 'action' }]
  ],
  subclasses: {
    devotion: { name: 'Oath of Devotion', src: 'PHB', spellMode: 'always', spells: { 3: ['Protection from Evil and Good', 'Sanctuary'], 5: ['Lesser Restoration', 'Zone of Truth'], 9: ['Beacon of Hope', 'Dispel Magic'], 13: ['Freedom of Movement', 'Guardian of Faith'], 17: ['Commune', 'Flame Strike'] }, features: [
      [3, 'Channel Divinity: Sacred Weapon', 'Add CHA to attack rolls with a weapon for 1 minute; it sheds light.'],
      [3, 'Channel Divinity: Turn the Unholy', 'Fiends and undead within 30 ft that fail a WIS save are turned.'],
      [7, 'Aura of Devotion', "You and allies within 10 ft can't be charmed (30 ft at 18th)."],
      [15, 'Purity of Spirit', 'Always under the effect of protection from evil and good.'],
      [20, 'Holy Nimbus', 'Action: emanate sunlight that damages enemies; advantage on saves vs fiend/undead spells for 1 minute.', { max: '1', reset: 'long', col: 'action' }]] },
    ancients: { name: 'Oath of the Ancients', src: 'PHB', spellMode: 'always', spells: { 3: ['Ensnaring Strike', 'Speak with Animals'], 5: ['Misty Step', 'Moonbeam'], 9: ['Plant Growth', 'Protection from Energy'], 13: ['Ice Storm', 'Stoneskin'], 17: ['Commune with Nature', 'Tree Stride'] }, features: [
      [3, "Channel Divinity: Nature's Wrath", 'Spectral vines restrain a creature within 10 ft (STR or DEX save).'],
      [3, 'Channel Divinity: Turn the Faithless', 'Fey and fiends within 30 ft that fail a WIS save are turned.'],
      [7, 'Aura of Warding', 'You and allies within 10 ft have resistance to spell damage (30 ft at 18th).'],
      [15, 'Undying Sentinel', 'When reduced to 0 HP, drop to 1 HP instead; no aging penalties.', { max: '1', reset: 'long' }],
      [20, 'Elder Champion', 'Action: transform for 1 minute — regain 10 HP per turn, bonus-action spells, enemies have disadvantage on saves vs your spells.', { max: '1', reset: 'long', col: 'action' }]] },
    vengeance: { name: 'Oath of Vengeance', src: 'PHB', spellMode: 'always', spells: { 3: ['Bane', "Hunter's Mark"], 5: ['Hold Person', 'Misty Step'], 9: ['Haste', 'Protection from Energy'], 13: ['Banishment', 'Dimension Door'], 17: ['Hold Monster', 'Scrying'] }, features: [
      [3, 'Channel Divinity: Abjure Enemy', 'Frighten a creature within 60 ft (WIS save); its speed becomes 0.'],
      [3, 'Channel Divinity: Vow of Enmity', 'Bonus action: advantage on attacks against one creature for 1 minute.'],
      [7, 'Relentless Avenger', 'After an opportunity attack hit, move up to half speed without provoking.'],
      [15, 'Soul of Vengeance', 'Reaction: attack your Vow of Enmity target when it attacks.'],
      [20, 'Avenging Angel', 'Action: grow wings (60 ft fly) and a frightening aura for 1 hour.', { max: '1', reset: 'long', col: 'action' }]] },
    conquest: { name: 'Oath of Conquest', src: 'XGE', spellMode: 'always', spells: { 3: ['Armor of Agathys', 'Command'], 5: ['Hold Person', 'Spiritual Weapon'], 9: ['Bestow Curse', 'Fear'], 13: ['Dominate Beast', 'Stoneskin'], 17: ['Cloudkill', 'Dominate Person'] }, features: [
      [3, 'Channel Divinity: Conquering Presence', 'Frighten creatures of your choice within 30 ft (WIS save).'],
      [3, 'Channel Divinity: Guided Strike', '+10 to one attack roll.'],
      [7, 'Aura of Conquest', 'Frightened enemies within 10 ft have speed 0 and take psychic damage (30 ft at 18th).'],
      [15, 'Scornful Rebuke', 'Creatures that hit you take psychic damage equal to your CHA mod.'],
      [20, 'Invincible Conqueror', 'Action: resistance to all damage, extra attack, crits on 19–20 for 1 minute.', { max: '1', reset: 'long', col: 'action' }]] },
    redemption: { name: 'Oath of Redemption', src: 'XGE', spellMode: 'always', spells: { 3: ['Sanctuary', 'Sleep'], 5: ['Calm Emotions', 'Hold Person'], 9: ['Counterspell', 'Hypnotic Pattern'], 13: ["Otiluke's Resilient Sphere", 'Stoneskin'], 17: ['Hold Monster', 'Wall of Force'] }, features: [
      [3, 'Channel Divinity: Emissary of Peace', '+5 to Persuasion checks for 10 minutes.'],
      [3, 'Channel Divinity: Rebuke the Violent', 'Reaction: deal radiant damage equal to the damage an attacker dealt (WIS half).'],
      [7, 'Aura of the Guardian', 'Reaction: take the damage an ally within 10 ft would take (30 ft at 18th).'],
      [15, 'Protective Spirit', 'Regain 1d6 + half paladin level HP at the end of turns while below half HP.'],
      [20, 'Emissary of Redemption', 'Resistance to all creature damage; attackers take radiant damage equal to half what they dealt.']] },
    glory: { name: 'Oath of Glory', src: 'TCE', spellMode: 'always', spells: { 3: ['Guiding Bolt', 'Heroism'], 5: ['Enhance Ability', 'Magic Weapon'], 9: ['Haste', 'Protection from Energy'], 13: ['Compulsion', 'Freedom of Movement'], 17: ['Commune', 'Flame Strike'] }, features: [
      [3, 'Channel Divinity: Peerless Athlete', 'Advantage on Athletics and Acrobatics, extra carry and jump for 10 minutes.'],
      [3, 'Channel Divinity: Inspiring Smite', 'After a Divine Smite, distribute 2d8 + paladin level temp HP.'],
      [7, 'Aura of Alacrity', '+10 ft speed; allies starting a turn within 5 ft gain +10 ft (10 ft aura at 18th).'],
      [15, 'Glorious Defense', 'Reaction: add CHA to AC against an attack; attack back if it misses.', { max: 'max(1,cha)', reset: 'long', col: 'reaction' }],
      [20, 'Living Legend', 'Bonus action: advantage on CHA checks, turn a miss into a hit, reroll a failed save for 1 minute.', { max: '1', reset: 'long', col: 'bonus' }]] },
    watchers: { name: 'Oath of the Watchers', src: 'TCE', spellMode: 'always', spells: { 3: ['Alarm', 'Detect Magic'], 5: ['Moonbeam', 'See Invisibility'], 9: ['Counterspell', 'Nondetection'], 13: ['Aura of Purity', 'Banishment'], 17: ['Hold Monster', 'Scrying'] }, features: [
      [3, "Channel Divinity: Watcher's Will", 'Give up to CHA mod creatures advantage on INT, WIS and CHA saves for 1 minute.'],
      [3, 'Channel Divinity: Abjure the Extraplanar', 'Aberrations, celestials, elementals, fey and fiends within 30 ft that fail a WIS save are turned.'],
      [7, 'Aura of the Sentinel', 'You and allies within 10 ft add prof bonus to initiative (30 ft at 18th).'],
      [15, 'Vigilant Rebuke', 'Reaction: deal 2d8 + CHA force damage to a creature that forces an ally\'s save.'],
      [20, 'Mortal Bulwark', 'Bonus action: truesight, advantage vs extraplanar creatures, banish on hit for 1 minute.', { max: '1', reset: 'long', col: 'bonus' }]] },
    crown: { name: 'Oath of the Crown', src: 'SCAG', spellMode: 'always', spells: { 3: ['Command', 'Compelled Duel'], 5: ['Warding Bond', 'Zone of Truth'], 9: ['Aura of Vitality', 'Spirit Guardians'], 13: ['Banishment', 'Guardian of Faith'], 17: ['Circle of Power', 'Geas'] }, features: [
      [3, 'Channel Divinity: Champion Challenge', "Bonus action: creatures within 30 ft that fail a WIS save can't willingly move more than 30 ft from you."],
      [3, 'Channel Divinity: Turn the Tide', 'Bonus action: creatures within 30 ft at half HP or less regain 1d6 + CHA mod HP.'],
      [7, 'Divine Allegiance', 'Reaction: take the damage a creature within 5 ft would take.'],
      [15, 'Unyielding Spirit', 'Advantage on saves against being paralyzed or stunned.'],
      [20, 'Exalted Champion', 'Action: resistance to nonmagical physical damage and advantage on death and WIS saves (you and allies) for 1 hour.', { max: '1', reset: 'long', col: 'action' }]] }
  }
};

DND.classes.ranger = {
  name: 'Ranger', hd: 10, saves: ['str', 'dex'], src: 'PHB',
  armor: 'Light armor, medium armor, shields', weapons: 'Simple weapons, martial weapons', tools: '',
  armorCats: ['light', 'medium', 'shield'], weaponCats: ['simple', 'martial'],
  skills: { n: 3, from: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
  mc: { req: [['dex', 13], ['wis', 13]], profs: 'Light armor, medium armor, shields, simple weapons, martial weapons, one skill', armorCats: ['light', 'medium', 'shield'], weaponCats: ['simple', 'martial'], skills: 1 },
  sub: { level: 3, label: 'Ranger Archetype' }, asi: [4, 8, 12, 16, 19], gold: '5d4*10', extraAttack: { 5: 2 },
  caster: { type: 'half', ab: 'wis', list: 'R', from: 2, known: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11] },
  kit: ['Scale Mail', 'Shortsword:2', "Dungeoneer's Pack", 'Longbow', 'Arrows:20'],
  choices: [{ level: 1, type: 'favoredEnemy', n: 1 }, { level: 1, type: 'language', n: 1, label: 'Favored Enemy — a language your favored enemy speaks' }, { level: 1, type: 'favoredTerrain', n: 1 }, { level: 2, type: 'fightingStyle', n: 1 }, { level: 6, type: 'favoredEnemy', n: 1 }, { level: 6, type: 'language', n: 1, label: 'Favored Enemy — a language your new favored enemy speaks' }, { level: 6, type: 'favoredTerrain', n: 1 }, { level: 10, type: 'favoredTerrain', n: 1 }, { level: 14, type: 'favoredEnemy', n: 1 }, { level: 14, type: 'language', n: 1, label: 'Favored Enemy — a language your new favored enemy speaks' }],
  features: [
    [1, 'Favored Enemy', 'Choose a favored enemy type (another at 6th and 14th): advantage on Survival to track and INT checks to recall info; learn a language.'],
    [1, 'Natural Explorer', 'Choose a favored terrain (more at 6th and 10th) for travel and tracking benefits.'],
    [2, 'Fighting Style', 'Adopt a fighting style specialty.'],
    [2, 'Spellcasting', 'Cast known ranger spells using WIS.'],
    [3, 'Primeval Awareness', 'Spend a slot to sense certain creature types nearby.'],
    [5, 'Extra Attack', 'Attack twice when you take the Attack action.'],
    [8, "Land's Stride", 'Nonmagical difficult terrain costs no extra movement; advantage against magical plants.'],
    [10, 'Hide in Plain Sight', 'Spend a minute camouflaging for +10 Stealth while still.'],
    [14, 'Vanish', 'Hide as a bonus action; nonmagical tracking fails.'],
    [18, 'Feral Senses', 'Attacks against unseen creatures have no disadvantage; sense invisible creatures within 30 ft.'],
    [20, 'Foe Slayer', 'Once per turn, add WIS mod to an attack or damage roll against a favored enemy.']
  ],
  subclasses: {
    hunter: { name: 'Hunter', src: 'PHB', features: [
      [3, "Hunter's Prey", 'Choose Colossus Slayer (+1d8 to wounded foes), Giant Killer (reaction attack vs Large+) or Horde Breaker (extra attack on adjacent foe).'],
      [7, 'Defensive Tactics', 'Choose Escape the Horde, Multiattack Defense or Steel Will.'],
      [11, 'Multiattack', 'Choose Volley (ranged vs all within 10 ft) or Whirlwind Attack (melee vs all within 5 ft).'],
      [15, "Superior Hunter's Defense", 'Choose Evasion, Stand Against the Tide or Uncanny Dodge.']] },
    beastmaster: { name: 'Beast Master', src: 'PHB', features: [
      [3, "Ranger's Companion", 'Gain a beast companion (CR 1/4 or lower; Tasha\'s Primal Companion: Beast of the Land, Sea or Sky) that obeys your commands.'],
      [7, 'Exceptional Training', 'Bonus action: command the beast to Dash, Disengage, Dodge or Help; its attacks are magical.'],
      [11, 'Bestial Fury', 'Your companion makes two attacks when commanded to Attack.'],
      [15, 'Share Spells', 'Self-targeting spells also affect your companion within 30 ft.']] },
    gloomstalker: { name: 'Gloom Stalker', src: 'XGE', spellMode: 'always', spells: { 3: ['Disguise Self'], 5: ['Rope Trick'], 9: ['Fear'], 13: ['Greater Invisibility'], 17: ['Seeming'] }, features: [
      [3, 'Dread Ambusher', 'Add WIS to initiative; first turn of combat: +10 ft speed and one extra attack dealing +1d8.'],
      [3, 'Umbral Sight', 'Darkvision 60 ft (or +30 ft); invisible to creatures relying on darkvision while in darkness.'],
      [7, 'Iron Mind', 'Proficiency in WIS saves (or INT/CHA if already proficient).'],
      [11, "Stalker's Flurry", 'Once per turn when you miss, make another weapon attack.'],
      [15, 'Shadowy Dodge', 'Reaction: impose disadvantage on an attack against you.']] },
    horizonwalker: { name: 'Horizon Walker', src: 'XGE', spellMode: 'always', spells: { 3: ['Protection from Evil and Good'], 5: ['Misty Step'], 9: ['Haste'], 13: ['Banishment'], 17: ['Teleportation Circle'] }, features: [
      [3, 'Detect Portal', 'Action: sense the nearest planar portal within 1 mile.', { max: '1', reset: 'short', col: 'action' }],
      [3, 'Planar Warrior', 'Bonus action: your next hit on a creature deals force damage and +1d8 (2d8 at 11th).'],
      [7, 'Ethereal Step', 'Bonus action: enter the Ethereal Plane until the end of your turn.', { max: '1', reset: 'short', col: 'bonus' }],
      [11, 'Distant Strike', 'Teleport 10 ft before each attack; attack a third creature if you hit two.'],
      [15, 'Spectral Defense', 'Reaction: gain resistance to an attack\'s damage.']] },
    monsterslayer: { name: 'Monster Slayer', src: 'XGE', spellMode: 'always', spells: { 3: ['Protection from Evil and Good'], 5: ['Zone of Truth'], 9: ['Magic Circle'], 13: ['Banishment'], 17: ['Hold Monster'] }, features: [
      [3, "Hunter's Sense", "Action: learn a creature's immunities, resistances and vulnerabilities.", { max: 'max(1,wis)', reset: 'long', col: 'action' }],
      [3, "Slayer's Prey", 'Bonus action: mark a creature; first hit each turn deals +1d6.'],
      [7, 'Supernatural Defense', "Add 1d6 to saves and grapple escapes against your Slayer's Prey target."],
      [11, "Magic-User's Nemesis", 'Reaction: foil a spell or teleport (WIS save).', { max: '1', reset: 'short', col: 'reaction' }],
      [15, "Slayer's Counter", "Reaction: attack your prey when it forces a save; a hit makes you succeed."]] },
    feywanderer: { name: 'Fey Wanderer', src: 'TCE', spellMode: 'always', spells: { 3: ['Charm Person'], 5: ['Misty Step'], 9: ['Dispel Magic'], 13: ['Dimension Door'], 17: ['Mislead'] }, features: [
      [3, 'Dreadful Strikes', 'Once per turn per creature, weapon hits deal +1d4 psychic (1d6 at 11th).'],
      [3, 'Otherworldly Glamour', 'Add WIS to CHA checks; gain Deception, Performance or Persuasion.'],
      [7, 'Beguiling Twist', 'Advantage vs charm/fear; reaction to redirect a resisted effect onto another creature.'],
      [11, 'Fey Reinforcements', 'Cast summon fey without material components (or without concentration once per long rest).', { max: '1', reset: 'long' }],
      [15, 'Misty Wanderer', 'Cast misty step without a slot and bring a willing creature.', { max: 'max(1,wis)', reset: 'long', col: 'bonus' }]] },
    swarmkeeper: { name: 'Swarmkeeper', src: 'TCE', spellMode: 'always', spells: { 3: ['Faerie Fire', 'Mage Hand'], 5: ['Web'], 9: ['Gaseous Form'], 13: ['Arcane Eye'], 17: ['Insect Plague'] }, features: [
      [3, 'Gathered Swarm', 'Once per turn on a hit: +1d6 piercing, push 15 ft, or move yourself 5 ft.'],
      [7, 'Writhing Tide', 'Bonus action: gain a 10 ft fly speed and hover for 1 minute.', { max: 'prof', reset: 'long', col: 'bonus' }],
      [11, 'Mighty Swarm', 'Swarm damage becomes 1d8; push knocks prone; self-move grants half cover.'],
      [15, 'Swarming Dispersal', 'Reaction when damaged: gain resistance and teleport 30 ft.', { max: 'prof', reset: 'long', col: 'reaction' }]] },
    drakewarden: { name: 'Drakewarden', src: 'FTD', features: [
      [3, 'Draconic Gift', 'Learn Draconic and thaumaturgy.'],
      [3, 'Drake Companion', 'Action: summon a drake companion that fights alongside you (free once per long rest, otherwise spend a slot).', { max: '1', reset: 'long', col: 'action' }],
      [7, 'Bond of Fang and Scale', 'Drake grows to Medium, can be ridden, flies; you resist its damage type; its bite deals +1d6.'],
      [11, "Drake's Breath", 'Action: 30 ft cone breath, 8d6 (10d6 at 15th) of the drake\'s type (DEX half).', { max: '1', reset: 'long', col: 'action' }],
      [15, 'Perfected Bond', 'Drake grows to Large; bite +2d6; reaction resistance for you or the drake.', { max: 'prof', reset: 'long', col: 'reaction' }]] }
  }
};

DND.classes.rogue = {
  name: 'Rogue', hd: 8, saves: ['dex', 'int'], src: 'PHB',
  armor: 'Light armor', weapons: 'Simple weapons, hand crossbows, longswords, rapiers, shortswords', tools: "Thieves' tools",
  armorCats: ['light'], weaponCats: ['simple'], weaponNames: ['Hand crossbow', 'Longsword', 'Rapier', 'Shortsword'],
  skills: { n: 4, from: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
  mc: { req: [['dex', 13]], profs: "Light armor, one skill, thieves' tools", armorCats: ['light'], skills: 1 },
  sub: { level: 3, label: 'Roguish Archetype' }, asi: [4, 8, 10, 12, 16, 19], gold: '4d4*10', languages: ["Thieves' Cant"],
  kit: ['Rapier', 'Shortbow', 'Arrows:20', "Burglar's Pack", 'Leather Armor', 'Dagger:2', "Thieves' tools"],
  choices: [{ level: 1, type: 'expertise', n: 2 }, { level: 6, type: 'expertise', n: 2 }],
  scaling: [['Sneak Attack', { 1: '1d6', 3: '2d6', 5: '3d6', 7: '4d6', 9: '5d6', 11: '6d6', 13: '7d6', 15: '8d6', 17: '9d6', 19: '10d6' }]],
  features: [
    [1, 'Expertise', 'Double proficiency on two skills (or thieves\' tools); two more at 6th.'],
    [1, 'Sneak Attack', 'Once per turn, deal extra damage with a finesse or ranged weapon when you have advantage or an ally is next to the target.'],
    [1, "Thieves' Cant", 'A secret mix of dialect and jargon for hidden messages.'],
    [2, 'Cunning Action', 'Bonus action: Dash, Disengage or Hide.', { col: 'bonus' }],
    [3, 'Steady Aim', "Bonus action (Tasha's optional): if you haven't moved this turn, gain advantage on your next attack roll this turn; your speed becomes 0 until the end of the turn.", { col: 'bonus' }],
    [5, 'Uncanny Dodge', 'Reaction: halve the damage of an attack from an attacker you can see.', { col: 'reaction' }],
    [7, 'Evasion', 'Take no damage on a successful DEX save for half (half on a failure).'],
    [11, 'Reliable Talent', 'Treat rolls of 9 or lower as 10 on proficient ability checks.'],
    [14, 'Blindsense', 'Know the location of hidden or invisible creatures within 10 ft if you can hear.'],
    [15, 'Slippery Mind', 'Proficiency in WIS saving throws.', { saveProf: 'wis' }],
    [18, 'Elusive', 'No attack roll has advantage against you while you aren\'t incapacitated.'],
    [20, 'Stroke of Luck', 'Turn a miss into a hit, or treat a failed check as a 20.', { max: '1', reset: 'short' }]
  ],
  subclasses: {
    thief: { name: 'Thief', src: 'PHB', features: [
      [3, 'Fast Hands', "Cunning Action can Sleight of Hand, use thieves' tools or Use an Object."],
      [3, 'Second-Story Work', 'Climbing costs no extra movement; running jumps add DEX mod feet.'],
      [9, 'Supreme Sneak', 'Advantage on Stealth if you move at half speed or less.'],
      [13, 'Use Magic Device', 'Ignore class, race and level requirements on magic items.'],
      [17, "Thief's Reflexes", 'Take two turns in the first round of combat.']] },
    assassin: { name: 'Assassin', src: 'PHB', features: [
      [3, 'Bonus Proficiencies', "Disguise kit and poisoner's kit."],
      [3, 'Assassinate', "Advantage against creatures that haven't acted yet; hits against surprised creatures are critical."],
      [9, 'Infiltration Expertise', 'Create false identities over a week.'],
      [13, 'Impostor', 'Mimic a person\'s speech, writing and behavior after study.'],
      [17, 'Death Strike', 'Surprised creatures you hit must make a CON save or take double damage.']] },
    arcanetrickster: { name: 'Arcane Trickster', src: 'PHB', caster: { type: 'third', ab: 'int', list: 'W', known: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13], cantrips: [0, 0, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] }, features: [
      [3, 'Spellcasting', 'Cast wizard spells with INT (mostly enchantment and illusion); know mage hand.'],
      [3, 'Mage Hand Legerdemain', 'Your mage hand is invisible and can pick pockets and locks.'],
      [9, 'Magical Ambush', 'Spells cast while hidden impose disadvantage on the save.'],
      [13, 'Versatile Trickster', 'Bonus action: mage hand distracts a creature, giving you advantage on attacks against it.'],
      [17, 'Spell Thief', 'Reaction: steal knowledge of a spell cast on you (INT save).', { max: '1', reset: 'long', col: 'reaction' }]] },
    inquisitive: { name: 'Inquisitive', src: 'XGE', features: [
      [3, 'Ear for Deceit', 'Treat Insight rolls of 7 or lower as 8 to detect lies.'],
      [3, 'Eye for Detail', 'Bonus action: Perception or Investigation check.'],
      [3, 'Insightful Fighting', 'Bonus action: Insight vs Deception to gain Sneak Attack without advantage for 1 minute.'],
      [9, 'Steady Eye', 'Advantage on Perception and Investigation if you move half speed or less.'],
      [13, 'Unerring Eye', 'Action: sense illusions and shapechangers within 30 ft.', { max: 'max(1,wis)', reset: 'long', col: 'action' }],
      [17, 'Eye for Weakness', 'Sneak Attack deals +3d6 against your Insightful Fighting target.']] },
    mastermind: { name: 'Mastermind', src: 'XGE', features: [
      [3, 'Master of Intrigue', 'Disguise kit, forgery kit, one gaming set, two languages; mimic accents.'],
      [3, 'Master of Tactics', 'Help as a bonus action, at a range of 30 ft.'],
      [9, 'Insightful Manipulator', 'Study a creature for a minute to compare mental stats.'],
      [13, 'Misdirection', 'Reaction: redirect an attack to a creature providing you cover.'],
      [17, 'Soul of Deceit', 'Your thoughts can\'t be read; magic can\'t compel truth from you.']] },
    scout: { name: 'Scout', src: 'XGE', features: [
      [3, 'Skirmisher', 'Reaction: move half speed without provoking when an enemy ends its turn within 5 ft.'],
      [3, 'Survivalist', 'Proficiency and expertise in Nature and Survival.'],
      [9, 'Superior Mobility', '+10 ft walking, climbing and swimming speed.'],
      [13, 'Ambush Master', 'Advantage on initiative; allies get advantage against the first creature you hit in round one.'],
      [17, 'Sudden Strike', 'Bonus action attack after the Attack action; can Sneak Attack a second target.']] },
    swashbuckler: { name: 'Swashbuckler', src: 'XGE', features: [
      [3, 'Fancy Footwork', "Creatures you melee attack can't make opportunity attacks against you that turn."],
      [3, 'Rakish Audacity', 'Add CHA to initiative; Sneak Attack a lone adjacent target without advantage.'],
      [9, 'Panache', 'Action: Persuasion vs Insight to taunt or charm a creature.'],
      [13, 'Elegant Maneuver', 'Bonus action: advantage on your next Acrobatics or Athletics check.'],
      [17, 'Master Duelist', 'Reroll a missed attack with advantage.', { max: '1', reset: 'short' }]] },
    phantom: { name: 'Phantom', src: 'TCE', features: [
      [3, 'Whispers of the Dead', 'After a rest, gain one skill or tool proficiency until you change it.'],
      [3, 'Wails from the Grave', 'After Sneak Attack, deal half the Sneak Attack dice as necrotic to a second creature within 30 ft.', { max: 'prof', reset: 'long' }],
      [9, 'Tokens of the Departed', 'Create soul trinkets when creatures die; use them for advantage or extra Wails.'],
      [13, 'Ghost Walk', 'Bonus action: become spectral — fly 10 ft, pass through objects, attackers have disadvantage, for 10 minutes.', { max: '1', reset: 'long', col: 'bonus' }],
      [17, "Death's Friend", 'Wails also hits the original target; gain a soul trinket if you have none.']] },
    soulknife: { name: 'Soulknife', src: 'TCE', scaling: [['Psionic Energy Die', { 3: 'd6', 5: 'd8', 11: 'd10', 17: 'd12' }]], features: [
      [3, 'Psionic Power', 'Psionic Energy dice fuel Psi-Bolstered Knack (add to failed skill checks) and Psychic Whispers (telepathy). Regain one die as a bonus action once per short rest.', { max: '2*prof', reset: 'long' }],
      [3, 'Psychic Blades', 'Manifest psychic blades: 1d6 psychic (finesse, thrown 60 ft) and a bonus-action 1d4 blade.'],
      [9, 'Soul Blades', 'Homing Strikes (add a die to a missed attack) and Psychic Teleportation.'],
      [13, 'Psychic Veil', 'Action: become invisible for an hour.', { max: '1', reset: 'long', col: 'action' }],
      [17, 'Rend Mind', 'Sneak Attack with blades can stun (WIS save).', { max: '1', reset: 'long' }]] }
  }
};
