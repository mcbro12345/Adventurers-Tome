// Class data (2014 rules). Descriptions are short summaries, not book text.
// feature: [level, name, summary, {max, reset, col, pool}]  — max is a formula (class names = class level).
// subclass spells: { classLevel: [spell names] }, spellMode 'always' (prepared/known, don't count) or 'expanded' (added to list).
window.DND = window.DND || {};
DND.classes = {};

DND.classes.barbarian = {
  name: 'Barbarian', hd: 12, saves: ['str', 'con'], src: 'PHB',
  armor: 'Light armor, medium armor, shields', weapons: 'Simple weapons, martial weapons', tools: '',
  armorCats: ['light', 'medium', 'shield'], weaponCats: ['simple', 'martial'],
  skills: { n: 2, from: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
  mc: { req: [['str', 13]], profs: 'Shields, simple weapons, martial weapons', armorCats: ['shield'], weaponCats: ['simple', 'martial'] },
  sub: { level: 3, label: 'Primal Path' }, asi: [4, 8, 12, 16, 19], extraAttack: { 5: 2 },
  unarmored: '10+dex+con', gold: '2d4*10',
  kit: ['Greataxe', 'Handaxe:2', "Explorer's Pack", 'Javelin:4'],
  scaling: [['Rage Damage', { 1: '+2', 9: '+3', 16: '+4' }], ['Brutal Critical', { 9: '+1 die', 13: '+2 dice', 17: '+3 dice' }]],
  features: [
    [1, 'Rage', 'Bonus action: advantage on STR checks and saves, bonus melee damage with STR weapons, resistance to bludgeoning/piercing/slashing. Lasts 1 minute; ends early if you neither attack nor take damage for a turn. No spellcasting or concentration while raging.', { max: 'tier(barbarian,1,2,3,3,6,4,12,5,17,6,20,99)', reset: 'long', col: 'bonus' }],
    [1, 'Unarmored Defense', 'Without armor, AC = 10 + DEX + CON (shield allowed).'],
    [2, 'Reckless Attack', 'On your first attack of the turn you can gain advantage on STR melee attacks; attacks against you have advantage until your next turn.'],
    [2, 'Danger Sense', 'Advantage on DEX saves against effects you can see (traps, spells) while not blinded, deafened or incapacitated.'],
    [5, 'Extra Attack', 'Attack twice when you take the Attack action.'],
    [5, 'Fast Movement', '+10 ft speed while not wearing heavy armor.'],
    [7, 'Feral Instinct', 'Advantage on initiative; if surprised you can still act on your first turn by entering a rage.'],
    [9, 'Brutal Critical', 'Roll one extra weapon damage die on a melee critical hit (two at 13th, three at 17th).'],
    [11, 'Relentless Rage', 'If you drop to 0 HP while raging, make a DC 10 CON save to drop to 1 HP instead. DC rises by 5 each use; resets on a rest.'],
    [15, 'Persistent Rage', 'Rage only ends early if you fall unconscious or choose to end it.'],
    [18, 'Indomitable Might', 'If a STR check total is lower than your STR score, use the score instead.'],
    [20, 'Primal Champion', 'STR and CON each increase by 4 (max 24).']
  ],
  subclasses: {
    berserker: { name: 'Path of the Berserker', src: 'PHB', features: [
      [3, 'Frenzy', 'When you rage you can frenzy: make one melee weapon attack as a bonus action each turn. You gain a level of exhaustion when the rage ends.'],
      [6, 'Mindless Rage', "Can't be charmed or frightened while raging; such effects are suspended."],
      [10, 'Intimidating Presence', 'Action: frighten a creature within 30 ft (WIS save, DC 8 + prof + CHA). Extend with an action each turn.'],
      [14, 'Retaliation', 'When a creature within 5 ft damages you, use your reaction to make a melee weapon attack against it.']] },
    totem: { name: 'Path of the Totem Warrior', src: 'PHB', features: [
      [3, 'Spirit Seeker', 'Cast beast sense and speak with animals as rituals.'],
      [3, 'Totem Spirit', 'Choose Bear (resist all damage but psychic while raging), Eagle (Dash as bonus action, disadvantage on OAs against you), Elk (+15 ft speed), Tiger (+10 ft jumps) or Wolf (allies have advantage on melee attacks vs enemies near you).'],
      [6, 'Aspect of the Beast', 'Bear: double carrying capacity. Eagle: see a mile clearly. Elk: travel pace boost. Tiger: two extra skills. Wolf: track at fast pace, stealth at normal pace.'],
      [10, 'Spirit Walker', 'Cast commune with nature as a ritual.'],
      [14, 'Totemic Attunement', 'Bear: enemies near you have disadvantage attacking others. Eagle: fly at walking speed while raging. Elk: bonus-action knock prone. Tiger: bonus-action extra attack after moving. Wolf: bonus-action knock Large or smaller prone.']] },
    ancestral: { name: 'Path of the Ancestral Guardian', src: 'XGE', features: [
      [3, 'Ancestral Protectors', 'While raging, the first creature you hit each turn has disadvantage on attacks against others, and others take half damage from it.'],
      [6, 'Spirit Shield', 'Reaction while raging: reduce damage to a creature within 30 ft by 2d6 (3d6 at 10th, 4d6 at 14th).'],
      [10, 'Consult the Spirits', 'Cast augury or clairvoyance without a slot or components.', { max: '1', reset: 'short' }],
      [14, 'Vengeful Ancestors', 'Damage prevented by Spirit Shield is dealt to the attacker as force damage.']] },
    storm: { name: 'Path of the Storm Herald', src: 'XGE', features: [
      [3, 'Storm Aura', 'While raging, emanate a 10 ft aura: Desert (fire damage), Sea (lightning damage, DEX save) or Tundra (temp HP to allies). Re-activate with a bonus action.'],
      [6, 'Storm Soul', 'Desert: fire resistance. Sea: lightning resistance, breathe water, swim speed. Tundra: cold resistance; freeze water.'],
      [10, 'Shielding Storm', 'Allies in your aura gain the damage resistance from Storm Soul.'],
      [14, 'Raging Storm', 'Desert: reaction fire damage to attackers. Sea: reaction knock prone. Tundra: reaction to stop a creature moving.']] },
    zealot: { name: 'Path of the Zealot', src: 'XGE', features: [
      [3, 'Divine Fury', 'While raging, your first hit each turn deals extra 1d6 + half barbarian level radiant or necrotic damage.'],
      [3, 'Warrior of the Gods', 'Spells that restore you to life need no material components.'],
      [6, 'Fanatical Focus', 'Once per rage, reroll a failed saving throw.'],
      [10, 'Zealous Presence', 'Bonus action: up to 10 creatures gain advantage on attacks and saves until your next turn.', { max: '1', reset: 'long', col: 'bonus' }],
      [14, 'Rage Beyond Death', "While raging, 0 HP doesn't knock you out; you die only when the rage ends if still at 0 HP."]] },
    beast: { name: 'Path of the Beast', src: 'TCE', features: [
      [3, 'Form of the Beast', 'When you rage, manifest Bite (1d8, heal when low), Claws (1d6, extra attack) or Tail (1d8 reach, reaction +1d8 AC).'],
      [6, 'Bestial Soul', 'Natural weapons count as magical; choose swim speed, climb speed or a bonus to jumping each rest.'],
      [10, 'Infectious Fury', 'When you hit with natural weapons, force a WIS save to make the target attack another creature or take 2d12 psychic.', { max: 'prof', reset: 'long' }],
      [14, 'Call the Hunt', 'When you rage, up to prof-bonus allies gain +1d6 damage once per turn; you gain 5 temp HP per ally.', { max: 'prof', reset: 'long' }]] },
    wildmagic: { name: 'Path of Wild Magic', src: 'TCE', features: [
      [3, 'Magic Awareness', 'Action: sense spells and magic items within 60 ft.', { max: 'prof', reset: 'long', col: 'action' }],
      [3, 'Wild Surge', 'When you rage, roll on the Wild Magic table for a random magical effect.'],
      [6, 'Bolstering Magic', 'Action: give a creature +1d3 to attacks/checks for 10 minutes, or restore a spell slot of level 1d3.', { max: 'prof', reset: 'long', col: 'action' }],
      [10, 'Unstable Backlash', 'When you take damage or fail a save while raging, reaction to reroll Wild Surge.'],
      [14, 'Controlled Surge', 'Roll twice on the Wild Magic table and choose.']] },
    battlerager: { name: 'Path of the Battlerager', src: 'SCAG', features: [
      [3, 'Battlerager Armor', 'In spiked armor while raging: bonus-action spike attack (1d4) and 3 piercing damage when you grapple.'],
      [6, 'Reckless Abandon', 'Using Reckless Attack while raging grants temp HP equal to CON mod.'],
      [10, 'Battlerager Charge', 'Dash as a bonus action while raging.'],
      [14, 'Spiked Retribution', 'Creatures that hit you in melee take 3 piercing damage while you rage in spiked armor.']] },
    giant: { name: 'Path of the Giant', src: 'BGG', features: [
      [3, "Giant's Power", 'Learn Giant language and druidcraft or thaumaturgy (WIS).'],
      [3, "Giant's Havoc", 'While raging you become Large if possible, reach +5 ft, and can use STR for thrown weapons with extra rage damage.'],
      [6, 'Elemental Cleaver', 'When you rage, infuse a weapon with acid, cold, fire, thunder or lightning: +1d6 damage, thrown and returns.'],
      [10, 'Mighty Impel', 'Bonus action while raging: hurl a Medium or smaller creature up to 30 ft.'],
      [14, 'Demiurgic Colossus', 'Rage size up to Huge, reach +10 ft, Elemental Cleaver dice become 2d6, Mighty Impel works on Large.']] }
  }
};

DND.classes.bard = {
  name: 'Bard', hd: 8, saves: ['dex', 'cha'], src: 'PHB',
  armor: 'Light armor', weapons: 'Simple weapons, hand crossbows, longswords, rapiers, shortswords', tools: 'Three musical instruments of your choice',
  armorCats: ['light'], weaponCats: ['simple'], weaponNames: ['Hand crossbow', 'Longsword', 'Rapier', 'Shortsword'],
  skills: { n: 3, from: 'any' },
  mc: { req: [['cha', 13]], profs: 'Light armor, one skill, one musical instrument', armorCats: ['light'], skills: 1 },
  sub: { level: 3, label: 'Bard College' }, asi: [4, 8, 12, 16, 19], gold: '5d4*10', jack: 2,
  caster: { type: 'full', ab: 'cha', list: 'B', known: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22], cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] },
  kit: ['Rapier', "Diplomat's Pack", 'Lute', 'Leather Armor', 'Dagger'],
  choices: [{ level: 3, type: 'expertise', n: 2 }, { level: 10, type: 'expertise', n: 2 }],
  scaling: [['Bardic Inspiration', { 1: 'd6', 5: 'd8', 10: 'd10', 15: 'd12' }], ['Song of Rest', { 2: 'd6', 9: 'd8', 13: 'd10', 17: 'd12' }]],
  features: [
    [1, 'Spellcasting', 'Cast bard spells using CHA. You know a fixed number of spells and can swap one each level.'],
    [1, 'Bardic Inspiration', 'Bonus action: give a creature within 60 ft an inspiration die to add to one ability check, attack or save within 10 minutes. Recharges on a short rest from 5th level.', { max: 'max(1,cha)', reset: 'long', shortAt: 5, col: 'bonus' }],
    [2, 'Jack of All Trades', 'Add half your proficiency bonus to ability checks you are not proficient in.'],
    [2, 'Song of Rest', 'Allies who spend Hit Dice during your short rest regain extra HP.'],
    [3, 'Expertise', 'Double proficiency on two chosen skills (two more at 10th).'],
    [5, 'Font of Inspiration', 'Bardic Inspiration recharges on a short or long rest.'],
    [6, 'Countercharm', 'Action: you and allies within 30 ft have advantage on saves against being frightened or charmed while you perform.'],
    [10, 'Magical Secrets', 'Learn two spells from any class list (two more at 14th and 18th).'],
    [20, 'Superior Inspiration', 'Regain one Bardic Inspiration use when you roll initiative with none left.']
  ],
  subclasses: {
    lore: { name: 'College of Lore', src: 'PHB', features: [
      [3, 'Bonus Proficiencies', 'Gain proficiency with three skills of your choice.'],
      [3, 'Cutting Words', 'Reaction: spend Bardic Inspiration to subtract the die from a creature\'s attack, check or damage roll.'],
      [6, 'Additional Magical Secrets', 'Learn two spells from any class list.'],
      [14, 'Peerless Skill', 'Spend Bardic Inspiration to add it to your own ability check.']] },
    valor: { name: 'College of Valor', src: 'PHB', extraAttack: { 6: 2 }, features: [
      [3, 'Bonus Proficiencies', 'Medium armor, shields and martial weapons.'],
      [3, 'Combat Inspiration', 'Inspired creatures can add the die to damage or to AC against one attack.'],
      [6, 'Extra Attack', 'Attack twice when you take the Attack action.'],
      [14, 'Battle Magic', 'After casting a bard spell with your action, make one weapon attack as a bonus action.']] },
    glamour: { name: 'College of Glamour', src: 'XGE', features: [
      [3, 'Mantle of Inspiration', 'Bonus action: spend Bardic Inspiration to give allies temp HP and a free reaction move.'],
      [3, 'Enthralling Performance', 'After a 1-minute performance, charm listeners (WIS save) for an hour.', { max: '1', reset: 'short' }],
      [6, 'Mantle of Majesty', 'Cast command as a bonus action each turn for 1 minute (concentration).', { max: '1', reset: 'long', col: 'bonus' }],
      [14, 'Unbreakable Majesty', 'Bonus action: attackers must make a CHA save or pick a new target.', { max: '1', reset: 'short', col: 'bonus' }]] },
    swords: { name: 'College of Swords', src: 'XGE', extraAttack: { 6: 2 }, features: [
      [3, 'Bonus Proficiencies', 'Medium armor and scimitars; use weapons as spellcasting focus.'],
      [3, 'Fighting Style', 'Choose Dueling or Two-Weapon Fighting.'],
      [3, 'Blade Flourish', '+10 ft speed when you attack; spend Bardic Inspiration for Defensive, Slashing or Mobile flourishes.'],
      [6, 'Extra Attack', 'Attack twice when you take the Attack action.'],
      [14, "Master's Flourish", 'Use a d6 instead of spending Bardic Inspiration for a flourish.']] },
    whispers: { name: 'College of Whispers', src: 'XGE', features: [
      [3, 'Psychic Blades', 'Spend Bardic Inspiration on a weapon hit for extra psychic damage (2d6, scaling to 8d6).'],
      [3, 'Words of Terror', 'After speaking alone with a creature for a minute, frighten it (WIS save).', { max: '1', reset: 'short' }],
      [6, 'Mantle of Whispers', "Reaction when a humanoid dies nearby: capture its shadow to take on its appearance.", { max: '1', reset: 'short' }],
      [14, 'Shadow Lore', 'Action: magically charm a creature that fails a WIS save, making it obey out of fear.', { max: '1', reset: 'long' }]] },
    creation: { name: 'College of Creation', src: 'TCE', features: [
      [3, 'Mote of Potential', 'Bardic Inspiration dice gain bonus effects on checks, attacks or saves.'],
      [3, 'Performance of Creation', 'Action: create a nonmagical item worth up to 20 × bard level gp.', { max: '1', reset: 'long', col: 'action' }],
      [6, 'Animating Performance', 'Action: animate a Large or smaller object as a Dancing Item companion.', { max: '1', reset: 'long', col: 'action' }],
      [14, 'Creative Crescendo', 'Performance of Creation can create multiple items and any size.']] },
    eloquence: { name: 'College of Eloquence', src: 'TCE', features: [
      [3, 'Silver Tongue', 'Treat a roll of 9 or lower as a 10 on Persuasion and Deception checks.'],
      [3, 'Unsettling Words', 'Bonus action: spend Bardic Inspiration to subtract the die from a creature\'s next save.'],
      [6, 'Unfailing Inspiration', 'Creatures keep your Bardic Inspiration die if it fails to help.'],
      [6, 'Universal Speech', 'Action: up to CHA mod creatures understand you for an hour.', { max: '1', reset: 'long', col: 'action' }],
      [14, 'Infectious Inspiration', 'Reaction when an inspired creature succeeds: give inspiration to another creature for free.', { max: 'max(1,cha)', reset: 'long', col: 'reaction' }]] },
    spirits: { name: 'College of Spirits', src: 'VRGR', features: [
      [3, 'Guiding Whispers', 'Learn guidance; its range is 60 ft.'],
      [3, 'Spiritual Focus', 'Use a candle, crystal ball, skull or tarokka deck as focus; add 1d6 to a damage or healing roll of your bard spells (6th).'],
      [3, 'Tales from Beyond', 'Bonus action: spend Bardic Inspiration to roll on the Spirit Tales table and hold the tale.'],
      [6, 'Spirit Session', 'Ritual: learn a divination or necromancy spell temporarily.', { max: '1', reset: 'long' }],
      [14, 'Mystical Connection', 'Roll twice on the Spirit Tales table and choose.']] }
  }
};

DND.classes.cleric = {
  name: 'Cleric', hd: 8, saves: ['wis', 'cha'], src: 'PHB',
  armor: 'Light armor, medium armor, shields', weapons: 'Simple weapons', tools: '',
  armorCats: ['light', 'medium', 'shield'], weaponCats: ['simple'],
  skills: { n: 2, from: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
  mc: { req: [['wis', 13]], profs: 'Light armor, medium armor, shields', armorCats: ['light', 'medium', 'shield'] },
  sub: { level: 1, label: 'Divine Domain' }, asi: [4, 8, 12, 16, 19], gold: '5d4*10',
  caster: { type: 'full', ab: 'wis', list: 'C', prepared: 'wis+cleric', cantrips: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] },
  kit: ['Mace', 'Scale Mail', 'Crossbow, light', 'Crossbow bolts:20', "Priest's Pack", 'Shield', 'Holy symbol'],
  scaling: [['Destroy Undead', { 5: 'CR 1/2', 8: 'CR 1', 11: 'CR 2', 14: 'CR 3', 17: 'CR 4' }]],
  features: [
    [1, 'Spellcasting', 'Prepare WIS mod + cleric level spells from the cleric list each day.'],
    [2, 'Channel Divinity', 'Channel divine energy for Turn Undead or your domain\'s effect.', { max: 'tier(cleric,2,1,6,2,18,3)', reset: 'short', col: 'action' }],
    [2, 'Turn Undead', 'Action: undead within 30 ft that fail a WIS save are turned for 1 minute.'],
    [5, 'Destroy Undead', 'Turned undead of low enough CR are destroyed instead.'],
    [10, 'Divine Intervention', 'Action: roll d100; if it is at or below your cleric level, your deity intervenes. Usable again after 7 days on success.', { max: '1', reset: 'long', col: 'action' }],
    [20, 'Divine Intervention Improvement', 'Divine Intervention succeeds automatically.']
  ],
  subclasses: {
    knowledge: { name: 'Knowledge Domain', src: 'PHB', spellMode: 'always', spells: { 1: ['Command', 'Identify'], 3: ['Augury', 'Suggestion'], 5: ['Nondetection', 'Speak with Dead'], 7: ['Arcane Eye', 'Confusion'], 9: ['Legend Lore', 'Scrying'] }, features: [
      [1, 'Blessings of Knowledge', 'Learn two languages; gain expertise in two of Arcana, History, Nature or Religion.'],
      [2, 'Channel Divinity: Knowledge of the Ages', 'Gain proficiency with a skill or tool for 10 minutes.'],
      [6, 'Channel Divinity: Read Thoughts', 'Read a creature\'s surface thoughts (WIS save) and cast suggestion on it.'],
      [8, 'Potent Spellcasting', 'Add WIS mod to cleric cantrip damage.'],
      [17, 'Visions of the Past', 'Meditate to see recent events tied to an object or location.', { max: '1', reset: 'short' }]] },
    life: { name: 'Life Domain', src: 'PHB', spellMode: 'always', spells: { 1: ['Bless', 'Cure Wounds'], 3: ['Lesser Restoration', 'Spiritual Weapon'], 5: ['Beacon of Hope', 'Revivify'], 7: ['Death Ward', 'Guardian of Faith'], 9: ['Mass Cure Wounds', 'Raise Dead'] }, profs: { armorCats: ['heavy'] }, features: [
      [1, 'Bonus Proficiency', 'Heavy armor.'],
      [1, 'Disciple of Life', 'Healing spells of 1st level or higher restore an extra 2 + spell level HP.'],
      [2, 'Channel Divinity: Preserve Life', 'Action: distribute 5 × cleric level HP among creatures within 30 ft (up to half their max).'],
      [6, 'Blessed Healer', 'When you heal another with a spell, you regain 2 + spell level HP.'],
      [8, 'Divine Strike', 'Once per turn, weapon hits deal +1d8 radiant (2d8 at 14th).'],
      [17, 'Supreme Healing', 'Healing spells use maximum dice values.']] },
    light: { name: 'Light Domain', src: 'PHB', spellMode: 'always', spells: { 1: ['Burning Hands', 'Faerie Fire'], 3: ['Flaming Sphere', 'Scorching Ray'], 5: ['Daylight', 'Fireball'], 7: ['Guardian of Faith', 'Wall of Fire'], 9: ['Flame Strike', 'Scrying'] }, features: [
      [1, 'Bonus Cantrip', 'Learn light.'],
      [1, 'Warding Flare', 'Reaction: impose disadvantage on an attack against you by a creature within 30 ft.', { max: 'max(1,wis)', reset: 'long', col: 'reaction' }],
      [2, 'Channel Divinity: Radiance of the Dawn', 'Action: dispel magical darkness; hostile creatures within 30 ft take 2d10 + cleric level radiant (CON half).'],
      [6, 'Improved Flare', 'Use Warding Flare to protect allies.'],
      [8, 'Potent Spellcasting', 'Add WIS mod to cleric cantrip damage.'],
      [17, 'Corona of Light', 'Action: emit sunlight; enemies have disadvantage on saves against fire and radiant spells.']] },
    nature: { name: 'Nature Domain', src: 'PHB', spellMode: 'always', spells: { 1: ['Animal Friendship', 'Speak with Animals'], 3: ['Barkskin', 'Spike Growth'], 5: ['Plant Growth', 'Wind Wall'], 7: ['Dominate Beast', 'Grasping Vine'], 9: ['Insect Plague', 'Tree Stride'] }, profs: { armorCats: ['heavy'] }, features: [
      [1, 'Acolyte of Nature', 'Learn one druid cantrip and one of Animal Handling, Nature or Survival.'],
      [1, 'Bonus Proficiency', 'Heavy armor.'],
      [2, 'Channel Divinity: Charm Animals and Plants', 'Action: charm beasts and plants within 30 ft (WIS save) for 1 minute.'],
      [6, 'Dampen Elements', 'Reaction: grant resistance to acid, cold, fire, lightning or thunder damage.'],
      [8, 'Divine Strike', 'Once per turn, weapon hits deal +1d8 cold, fire or lightning (2d8 at 14th).'],
      [17, 'Master of Nature', 'Bonus action: command charmed animals and plants.']] },
    tempest: { name: 'Tempest Domain', src: 'PHB', spellMode: 'always', spells: { 1: ['Fog Cloud', 'Thunderwave'], 3: ['Gust of Wind', 'Shatter'], 5: ['Call Lightning', 'Sleet Storm'], 7: ['Control Water', 'Ice Storm'], 9: ['Destructive Wave', 'Insect Plague'] }, profs: { armorCats: ['heavy'], weaponCats: ['martial'] }, features: [
      [1, 'Bonus Proficiencies', 'Martial weapons and heavy armor.'],
      [1, 'Wrath of the Storm', 'Reaction when hit in melee: 2d8 lightning or thunder to the attacker (DEX half).', { max: 'max(1,wis)', reset: 'long', col: 'reaction' }],
      [2, 'Channel Divinity: Destructive Wrath', 'Deal maximum damage with a lightning or thunder roll.'],
      [6, 'Thunderbolt Strike', 'Lightning damage you deal can push Large or smaller creatures 10 ft.'],
      [8, 'Divine Strike', 'Once per turn, weapon hits deal +1d8 thunder (2d8 at 14th).'],
      [17, 'Stormborn', 'Fly at walking speed outdoors.']] },
    trickery: { name: 'Trickery Domain', src: 'PHB', spellMode: 'always', spells: { 1: ['Charm Person', 'Disguise Self'], 3: ['Mirror Image', 'Pass without Trace'], 5: ['Blink', 'Dispel Magic'], 7: ['Dimension Door', 'Polymorph'], 9: ['Dominate Person', 'Modify Memory'] }, features: [
      [1, 'Blessing of the Trickster', 'Action: give a creature advantage on Stealth checks for an hour.'],
      [2, 'Channel Divinity: Invoke Duplicity', 'Create an illusory duplicate; cast spells through it and gain advantage when you and it flank.'],
      [6, 'Channel Divinity: Cloak of Shadows', 'Action: become invisible until the end of your next turn.'],
      [8, 'Divine Strike', 'Once per turn, weapon hits deal +1d8 poison (2d8 at 14th).'],
      [17, 'Improved Duplicity', 'Create up to four duplicates.']] },
    war: { name: 'War Domain', src: 'PHB', spellMode: 'always', spells: { 1: ['Divine Favor', 'Shield of Faith'], 3: ['Magic Weapon', 'Spiritual Weapon'], 5: ["Crusader's Mantle", 'Spirit Guardians'], 7: ['Freedom of Movement', 'Stoneskin'], 9: ['Flame Strike', 'Hold Monster'] }, profs: { armorCats: ['heavy'], weaponCats: ['martial'] }, features: [
      [1, 'Bonus Proficiencies', 'Martial weapons and heavy armor.'],
      [1, 'War Priest', 'When you take the Attack action, make one weapon attack as a bonus action.', { max: 'max(1,wis)', reset: 'long', col: 'bonus' }],
      [2, 'Channel Divinity: Guided Strike', '+10 to one attack roll.'],
      [6, "Channel Divinity: War God's Blessing", 'Reaction: give +10 to an ally\'s attack roll within 30 ft.'],
      [8, 'Divine Strike', 'Once per turn, weapon hits deal +1d8 of the weapon\'s type (2d8 at 14th).'],
      [17, 'Avatar of Battle', 'Resistance to nonmagical bludgeoning, piercing and slashing damage.']] },
    forge: { name: 'Forge Domain', src: 'XGE', spellMode: 'always', spells: { 1: ['Identify', 'Searing Smite'], 3: ['Heat Metal', 'Magic Weapon'], 5: ['Elemental Weapon', 'Protection from Energy'], 7: ['Fabricate', 'Wall of Fire'], 9: ['Animate Objects', 'Creation'] }, profs: { armorCats: ['heavy'] }, features: [
      [1, 'Bonus Proficiencies', "Heavy armor and smith's tools."],
      [1, 'Blessing of the Forge', 'At the end of a long rest, make a weapon or armor +1 until your next long rest.', { max: '1', reset: 'long' }],
      [2, "Channel Divinity: Artisan's Blessing", 'One-hour ritual to create a metal item worth up to 100 gp.'],
      [6, 'Soul of the Forge', 'Fire resistance; +1 AC in heavy armor.'],
      [8, 'Divine Strike', 'Once per turn, weapon hits deal +1d8 fire (2d8 at 14th).'],
      [17, 'Saint of Forge and Fire', 'Immune to fire; resistance to nonmagical physical damage in heavy armor.']] },
    grave: { name: 'Grave Domain', src: 'XGE', spellMode: 'always', spells: { 1: ['Bane', 'False Life'], 3: ['Gentle Repose', 'Ray of Enfeeblement'], 5: ['Revivify', 'Vampiric Touch'], 7: ['Blight', 'Death Ward'], 9: ['Antilife Shell', 'Raise Dead'] }, features: [
      [1, 'Circle of Mortality', 'Healing on a creature at 0 HP uses maximum dice; learn spare the dying (bonus action, 30 ft).'],
      [1, 'Eyes of the Grave', 'Action: detect undead within 60 ft until the end of your next turn.', { max: 'max(1,wis)', reset: 'long', col: 'action' }],
      [2, 'Channel Divinity: Path to the Grave', 'Action: curse a creature so the next attack against it deals vulnerability damage.'],
      [6, "Sentinel at Death's Door", 'Reaction: turn a critical hit on a creature within 30 ft into a normal hit.', { max: 'max(1,wis)', reset: 'long', col: 'reaction' }],
      [8, 'Potent Spellcasting', 'Add WIS mod to cleric cantrip damage.'],
      [17, 'Keeper of Souls', 'When an enemy dies nearby, you or an ally regain HP equal to its Hit Dice.']] },
    order: { name: 'Order Domain', src: 'TCE', spellMode: 'always', spells: { 1: ['Command', 'Heroism'], 3: ['Hold Person', 'Zone of Truth'], 5: ['Mass Healing Word', 'Slow'], 7: ['Compulsion', 'Locate Creature'], 9: ['Commune', 'Dominate Person'] }, profs: { armorCats: ['heavy'] }, features: [
      [1, 'Bonus Proficiencies', 'Heavy armor; Intimidation or Persuasion.'],
      [1, 'Voice of Authority', 'When you cast a 1st+ level spell on an ally, they can use their reaction to make a weapon attack.'],
      [2, "Channel Divinity: Order's Demand", 'Action: charm creatures within 30 ft (WIS save) and make them drop what they hold.'],
      [6, 'Embodiment of the Law', 'Cast enchantment spells as a bonus action.', { max: 'max(1,wis)', reset: 'long' }],
      [8, 'Divine Strike', 'Once per turn, weapon hits deal +1d8 psychic (2d8 at 14th).'],
      [17, "Order's Wrath", 'Divine Strike curses the target: the next ally hit deals +2d8 psychic.']] },
    peace: { name: 'Peace Domain', src: 'TCE', spellMode: 'always', spells: { 1: ['Heroism', 'Sanctuary'], 3: ['Aid', 'Warding Bond'], 5: ['Beacon of Hope', 'Sending'], 7: ['Aura of Purity', "Otiluke's Resilient Sphere"], 9: ['Greater Restoration', "Rary's Telepathic Bond"] }, features: [
      [1, 'Implement of Peace', 'Proficiency in Insight, Performance or Persuasion.'],
      [1, 'Emboldening Bond', 'Action: bond creatures within 30 ft; once per turn each can add 1d4 to an attack, check or save while near another.', { max: 'prof', reset: 'long', col: 'action' }],
      [2, 'Channel Divinity: Balm of Peace', 'Move without provoking and heal creatures you pass (2d6 + WIS).'],
      [6, 'Protective Bond', 'Bonded creatures can teleport to take damage for each other.'],
      [8, 'Potent Spellcasting', 'Add WIS mod to cleric cantrip damage.'],
      [17, 'Expansive Bond', 'Bond range 60 ft; the teleporting creature gains resistance.']] },
    twilight: { name: 'Twilight Domain', src: 'TCE', spellMode: 'always', spells: { 1: ['Faerie Fire', 'Sleep'], 3: ['Moonbeam', 'See Invisibility'], 5: ['Aura of Vitality', "Leomund's Tiny Hut"], 7: ['Aura of Life', 'Greater Invisibility'], 9: ['Circle of Power', 'Mislead'] }, profs: { armorCats: ['heavy'], weaponCats: ['martial'] }, features: [
      [1, 'Bonus Proficiencies', 'Martial weapons and heavy armor.'],
      [1, 'Eyes of Night', 'Darkvision 300 ft; share it with allies for an hour.', { max: '1', reset: 'long' }],
      [1, 'Vigilant Blessing', 'Action: give a creature advantage on its next initiative roll.'],
      [2, 'Channel Divinity: Twilight Sanctuary', 'Action: 30 ft sphere for 1 minute; allies ending turns inside gain 1d6 + cleric level temp HP or end charm/fear.'],
      [6, 'Steps of Night', 'Bonus action in dim light or darkness: fly speed for 1 minute.', { max: 'prof', reset: 'long', col: 'bonus' }],
      [8, 'Divine Strike', 'Once per turn, weapon hits deal +1d8 radiant (2d8 at 14th).'],
      [17, 'Twilight Shroud', 'Allies in your Twilight Sanctuary have half cover.']] },
    arcana: { name: 'Arcana Domain', src: 'SCAG', spellMode: 'always', spells: { 1: ['Detect Magic', 'Magic Missile'], 3: ['Magic Weapon', "Nystul's Magic Aura"], 5: ['Dispel Magic', 'Magic Circle'], 7: ['Arcane Eye', "Leomund's Secret Chest"], 9: ['Planar Binding', 'Teleportation Circle'] }, features: [
      [1, 'Arcane Initiate', 'Proficiency in Arcana; learn two wizard cantrips.'],
      [2, 'Channel Divinity: Arcane Abjuration', 'Action: turn (and later banish) a celestial, elemental, fey or fiend.'],
      [6, 'Spell Breaker', 'When you heal an ally with a spell, end one spell on them.'],
      [8, 'Potent Spellcasting', 'Add WIS mod to cleric cantrip damage.'],
      [17, 'Arcane Mastery', 'Add one wizard spell each of 6th–9th level to your domain spells.']] }
  }
};

DND.classes.druid = {
  name: 'Druid', hd: 8, saves: ['int', 'wis'], src: 'PHB',
  armor: 'Light armor, medium armor, shields (nonmetal)', weapons: 'Clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears', tools: 'Herbalism kit',
  armorCats: ['light', 'medium', 'shield'], weaponNames: ['Club', 'Dagger', 'Dart', 'Javelin', 'Mace', 'Quarterstaff', 'Scimitar', 'Sickle', 'Sling', 'Spear'],
  skills: { n: 2, from: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
  mc: { req: [['wis', 13]], profs: 'Light armor, medium armor, shields (nonmetal)', armorCats: ['light', 'medium', 'shield'] },
  sub: { level: 2, label: 'Druid Circle' }, asi: [4, 8, 12, 16, 19], gold: '2d4*10', languages: ['Druidic'],
  caster: { type: 'full', ab: 'wis', list: 'D', prepared: 'wis+druid', cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4] },
  kit: ['Shield', 'Scimitar', 'Leather Armor', "Explorer's Pack", 'Druidic focus'],
  scaling: [['Wild Shape', { 2: 'CR 1/4, no fly/swim', 4: 'CR 1/2, no fly', 8: 'CR 1' }]],
  features: [
    [1, 'Druidic', 'You know the secret language of druids.'],
    [1, 'Spellcasting', 'Prepare WIS mod + druid level spells from the druid list each day.'],
    [2, 'Wild Shape', 'Action: transform into a beast you have seen for half your druid level in hours.', { max: 'druid>=20?99:2', reset: 'short', col: 'action' }],
    [18, 'Timeless Body', 'Age 1 year for every 10 that pass.'],
    [18, 'Beast Spells', 'Cast many druid spells while in Wild Shape.'],
    [20, 'Archdruid', 'Unlimited Wild Shape; ignore verbal, somatic and non-costly material components.']
  ],
  subclasses: {
    land: { name: 'Circle of the Land', src: 'PHB', features: [
      [2, 'Bonus Cantrip', 'Learn one additional druid cantrip.'],
      [2, 'Natural Recovery', 'During a short rest, recover spell slots totaling up to half your druid level (rounded up).', { max: '1', reset: 'long' }],
      [3, 'Circle Spells', 'Choose a land (Arctic, Coast, Desert, Forest, Grassland, Mountain, Swamp, Underdark) for always-prepared spells at 3rd, 5th, 7th and 9th. Add them on the Spells tab.'],
      [6, "Land's Stride", 'Nonmagical difficult terrain costs no extra movement; advantage against magical plants.'],
      [10, "Nature's Ward", "Can't be charmed or frightened by elementals or fey; immune to poison and disease."],
      [14, "Nature's Sanctuary", 'Beasts and plants must make a WIS save to attack you.']] },
    moon: { name: 'Circle of the Moon', src: 'PHB', features: [
      [2, 'Combat Wild Shape', 'Wild Shape as a bonus action; spend spell slots to heal 1d8 per slot level while transformed.'],
      [2, 'Circle Forms', 'Wild Shape into beasts up to CR 1 (CR = druid level ÷ 3 from 6th).'],
      [6, 'Primal Strike', 'Beast-form attacks count as magical.'],
      [10, 'Elemental Wild Shape', 'Spend two uses of Wild Shape to become an air, earth, fire or water elemental.'],
      [14, 'Thousand Forms', 'Cast alter self at will.']] },
    dreams: { name: 'Circle of Dreams', src: 'XGE', features: [
      [2, 'Balm of the Summer Court', 'Bonus action: spend d6s from a pool to heal a creature within 120 ft and give temp HP.', { max: 'druid', reset: 'long', pool: true, col: 'bonus' }],
      [6, 'Hearth of Moonlight and Shadow', 'During rests, create a 30 ft sphere that grants +5 Stealth and Perception.'],
      [10, 'Hidden Paths', 'Bonus action: teleport up to 60 ft, or teleport a willing creature 30 ft.', { max: 'max(1,wis)', reset: 'long', col: 'bonus' }],
      [14, 'Walker in Dreams', 'After a short rest, cast dream, scrying or teleportation circle.', { max: '1', reset: 'long' }]] },
    shepherd: { name: 'Circle of the Shepherd', src: 'XGE', features: [
      [2, 'Speech of the Woods', 'Learn Sylvan; speak with beasts at will.'],
      [2, 'Spirit Totem', 'Bonus action: summon a Bear, Hawk or Unicorn spirit aura for 1 minute.', { max: '1', reset: 'short', col: 'bonus' }],
      [6, 'Mighty Summoner', 'Summoned beasts and fey get +2 HP per Hit Die and magical attacks.'],
      [10, 'Guardian Spirit', 'Summoned creatures in your Spirit Totem aura regain HP each turn.'],
      [14, 'Faithful Summons', 'When reduced to 0 HP, summon four beasts as conjure animals.', { max: '1', reset: 'long' }]] },
    spores: { name: 'Circle of Spores', src: 'TCE', spellMode: 'always', spells: { 2: ['Chill Touch'], 3: ['Blindness/Deafness', 'Gentle Repose'], 5: ['Animate Dead', 'Gaseous Form'], 7: ['Blight', 'Confusion'], 9: ['Cloudkill', 'Contagion'] }, features: [
      [2, 'Halo of Spores', 'Reaction: 1d4 necrotic to a creature within 10 ft (CON negates); scales with level.'],
      [2, 'Symbiotic Entity', 'Spend Wild Shape: gain 4 temp HP per druid level, stronger Halo, +1d6 necrotic on melee hits.'],
      [6, 'Fungal Infestation', 'Reaction: animate a creature that dies nearby as a 1-HP zombie.', { max: 'max(1,wis)', reset: 'long', col: 'reaction' }],
      [10, 'Spreading Spores', 'Bonus action: seed a 10 ft cube with your Halo damage.'],
      [14, 'Fungal Body', "Can't be blinded, deafened, frightened or poisoned; crits become normal hits."]] },
    stars: { name: 'Circle of Stars', src: 'TCE', features: [
      [2, 'Star Map', 'Know guidance; cast guiding bolt without a slot.', { max: 'prof', reset: 'long' }],
      [2, 'Starry Form', 'Spend Wild Shape: become Archer (bonus ranged attack), Chalice (extra healing) or Dragon (minimum 10 on CON/INT/WIS checks).'],
      [6, 'Cosmic Omen', 'After a long rest, roll for Weal or Woe; reaction to add or subtract 1d6.', { max: 'prof', reset: 'long', col: 'reaction' }],
      [10, 'Twinkling Constellations', 'Starry Form dice become 2d8; Dragon form flies; switch forms each turn.'],
      [14, 'Full of Stars', 'Resistance to bludgeoning, piercing and slashing while in Starry Form.']] },
    wildfire: { name: 'Circle of Wildfire', src: 'TCE', spellMode: 'always', spells: { 2: ['Burning Hands', 'Cure Wounds'], 3: ['Flaming Sphere', 'Scorching Ray'], 5: ['Plant Growth', 'Revivify'], 7: ['Aura of Life', 'Fire Shield'], 9: ['Flame Strike', 'Mass Cure Wounds'] }, features: [
      [2, 'Summon Wildfire Spirit', 'Spend Wild Shape: summon a Wildfire Spirit that can teleport allies.'],
      [6, 'Enhanced Bond', '+1d8 to fire damage or healing spells while your spirit is summoned.'],
      [10, 'Cauterizing Flames', 'Reaction when a creature dies near your spirit: create a flame that heals or burns.', { max: 'prof', reset: 'long', col: 'reaction' }],
      [14, 'Blazing Revival', 'When you drop to 0 HP, your spirit sacrifices itself to restore you to half HP.', { max: '1', reset: 'long' }]] }
  }
};
