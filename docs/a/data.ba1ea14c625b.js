// Rules content: SRD plus short summaries of options from the permitted 5e (2014) books.
// (Wrapped in a block so a newer version of the sheet can be loaded into this same page by Settings → Update.)
{
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

DND.raceGroups = [
  ['Player\'s Handbook', ['dwarf', 'elf', 'halfling', 'human', 'dragonborn', 'gnome', 'halfelf', 'halforc', 'tiefling']],
  ['Monsters of the Multiverse', ['aarakocra', 'aasimar', 'bugbear', 'centaur', 'changeling', 'deepgnome', 'duergar', 'eladrin', 'fairy', 'firbolg', 'genasi', 'githyanki', 'githzerai', 'goblin', 'goliath', 'harengon', 'hobgoblin', 'kenku', 'kobold', 'lizardfolk', 'minotaur', 'orc', 'satyr', 'seaelf', 'shadarkai', 'shifter', 'tabaxi', 'tortle', 'triton', 'yuanti']],
  ['Volo\'s & Elemental Evil (original versions)', ['aarakocra_ee', 'aasimar_volo', 'bugbear_volo', 'firbolg_volo', 'genasi_ee', 'goblin_volo', 'goliath_ee', 'hobgoblin_volo', 'kenku_volo', 'kobold_volo', 'lizardfolk_volo', 'orc_volo', 'tabaxi_volo', 'triton_volo', 'yuanti_volo']],
  ['Eberron', ['changeling_wg', 'kalashtar', 'shifter_wg', 'warforged', 'dragonmarked']],
  ['Van Richten\'s lineages', ['dhampir', 'hexblood', 'reborn']],
  ['Tasha\'s', ['customlineage']]
];

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

// Magic items: [name, source, type, rarity, attunement, summary, mods]
// mods: ac, save, atk, dmg, spell (spell attack & DC), abil {str:19} (sets score if lower), base 'weapon'|'armor'|'shield'|'ammo' (pick a base item), unarmoredOnly, charges
DND.magic = [];
const MI = (...a) => DND.magic.push(a);
// ---- Generic enhancement templates ----
MI('Weapon +1', 'SRD', 'weapon', 'uncommon', false, '+1 to attack and damage rolls.', { base: 'weapon', atk: 1, dmg: 1 });
MI('Weapon +2', 'SRD', 'weapon', 'rare', false, '+2 to attack and damage rolls.', { base: 'weapon', atk: 2, dmg: 2 });
MI('Weapon +3', 'SRD', 'weapon', 'very rare', false, '+3 to attack and damage rolls.', { base: 'weapon', atk: 3, dmg: 3 });
MI('Armor +1', 'SRD', 'armor', 'rare', false, '+1 AC while worn.', { base: 'armor', ac: 1 });
MI('Armor +2', 'SRD', 'armor', 'very rare', false, '+2 AC while worn.', { base: 'armor', ac: 2 });
MI('Armor +3', 'SRD', 'armor', 'legendary', false, '+3 AC while worn.', { base: 'armor', ac: 3 });
MI('Shield +1', 'SRD', 'shield', 'uncommon', false, '+1 AC beyond the shield\'s normal bonus.', { base: 'shield', ac: 1 });
MI('Shield +2', 'SRD', 'shield', 'rare', false, '+2 AC beyond the shield\'s normal bonus.', { base: 'shield', ac: 2 });
MI('Shield +3', 'SRD', 'shield', 'very rare', false, '+3 AC beyond the shield\'s normal bonus.', { base: 'shield', ac: 3 });
MI('Ammunition +1', 'SRD', 'ammo', 'uncommon', false, '+1 to attack and damage; destroyed on hit.', { base: 'ammo' });
MI('Ammunition +2', 'SRD', 'ammo', 'rare', false, '+2 to attack and damage; destroyed on hit.', { base: 'ammo' });
MI('Ammunition +3', 'SRD', 'ammo', 'very rare', false, '+3 to attack and damage; destroyed on hit.', { base: 'ammo' });
// ---- SRD items ----
MI('Adamantine Armor', 'SRD', 'armor', 'uncommon', false, 'Critical hits against you become normal hits (medium or heavy armor).', { base: 'armor' });
MI('Amulet of Health', 'SRD', 'wondrous', 'rare', true, 'Your CON score is 19.', { abil: { con: 19 } });
MI('Amulet of Proof against Detection and Location', 'SRD', 'wondrous', 'uncommon', true, 'Hidden from divination magic.');
MI('Amulet of the Planes', 'SRD', 'wondrous', 'very rare', true, 'Action: DC 15 INT check to cast plane shift.');
MI('Animated Shield', 'SRD', 'shield', 'very rare', true, 'Bonus action: shield floats and protects you for 1 minute, hands free.', { base: 'shield' });
MI('Apparatus of the Crab', 'SRD', 'wondrous', 'legendary', false, 'A crab-shaped submersible vehicle.');
MI('Armor of Invulnerability', 'SRD', 'armor', 'legendary', true, 'Resistance to nonmagical damage; once per day become immune for 10 minutes.', { base: 'armor' });
MI('Armor of Resistance', 'SRD', 'armor', 'rare', true, 'Resistance to one damage type.', { base: 'armor', resType: true });
MI('Armor of Vulnerability', 'SRD', 'armor', 'rare', true, 'Resistance to one physical type, vulnerability to the others (cursed).', { base: 'armor' });
MI('Arrow-Catching Shield', 'SRD', 'shield', 'rare', true, '+2 AC vs ranged attacks; reaction to redirect a ranged attack to you.', { base: 'shield' });
MI('Arrow of Slaying', 'SRD', 'ammo', 'very rare', false, 'A creature type takes 6d10 extra piercing (CON half).');
MI('Bag of Beans', 'SRD', 'wondrous', 'rare', false, 'Plant beans for random effects.');
MI('Bag of Holding', 'SRD', 'wondrous', 'uncommon', false, 'Holds 500 lb / 64 cubic ft; always weighs 15 lb.');
MI('Bag of Tricks', 'SRD', 'wondrous', 'uncommon', false, 'Pull out a fuzzy ball that becomes a random beast (3 charges).', { charges: 3 });
MI('Bead of Force', 'SRD', 'wondrous', 'rare', false, 'Throw: 5d4 force and trap creatures in a sphere for 1 minute.');
MI('Belt of Dwarvenkind', 'SRD', 'wondrous', 'rare', true, '+2 CON (max 20), darkvision, advantage vs poison and with dwarves.');
MI('Belt of Hill Giant Strength', 'SRD', 'wondrous', 'rare', true, 'Your STR score is 21.', { abil: { str: 21 } });
MI('Belt of Stone Giant Strength', 'SRD', 'wondrous', 'very rare', true, 'Your STR score is 23.', { abil: { str: 23 } });
MI('Belt of Frost Giant Strength', 'SRD', 'wondrous', 'very rare', true, 'Your STR score is 23.', { abil: { str: 23 } });
MI('Belt of Fire Giant Strength', 'SRD', 'wondrous', 'very rare', true, 'Your STR score is 25.', { abil: { str: 25 } });
MI('Belt of Cloud Giant Strength', 'SRD', 'wondrous', 'legendary', true, 'Your STR score is 27.', { abil: { str: 27 } });
MI('Belt of Storm Giant Strength', 'SRD', 'wondrous', 'legendary', true, 'Your STR score is 29.', { abil: { str: 29 } });
MI('Berserker Axe', 'SRD', 'weapon', 'rare', true, '+1 axe; +1 HP per level; cursed rage when damaged.', { base: 'weapon', atk: 1, dmg: 1 });
MI('Boots of Elvenkind', 'SRD', 'wondrous', 'uncommon', false, 'Silent steps; advantage on Stealth that relies on moving silently.');
MI('Boots of Levitation', 'SRD', 'wondrous', 'rare', true, 'Cast levitate on yourself at will.');
MI('Boots of Speed', 'SRD', 'wondrous', 'rare', true, 'Bonus action: double speed, OAs against you have disadvantage (10 minutes per day).');
MI('Boots of Striding and Springing', 'SRD', 'wondrous', 'uncommon', true, 'Speed 30 ft minimum; triple jump distance.');
MI('Boots of the Winterlands', 'SRD', 'wondrous', 'uncommon', true, 'Cold resistance; ignore ice and snow terrain.');
MI('Bowl of Commanding Water Elementals', 'SRD', 'wondrous', 'rare', false, 'Summon a water elemental once per day.');
MI('Bracers of Archery', 'SRD', 'wondrous', 'uncommon', true, 'Longbow/shortbow proficiency; +2 damage with them.');
MI('Bracers of Defense', 'SRD', 'wondrous', 'rare', true, '+2 AC while wearing no armor and no shield.', { ac: 2, unarmoredOnly: true });
MI('Brazier of Commanding Fire Elementals', 'SRD', 'wondrous', 'rare', false, 'Summon a fire elemental once per day.');
MI('Brooch of Shielding', 'SRD', 'wondrous', 'uncommon', true, 'Resistance to force damage; immune to magic missile.');
MI('Broom of Flying', 'SRD', 'wondrous', 'uncommon', false, 'Fly 50 ft (30 ft over 200 lb).');
MI('Candle of Invocation', 'SRD', 'wondrous', 'very rare', true, 'Aligned creatures gain advantage; can cast gate.');
MI('Cape of the Mountebank', 'SRD', 'wondrous', 'rare', false, 'Cast dimension door once per day.', { charges: 1 });
MI('Carpet of Flying', 'SRD', 'wondrous', 'very rare', false, 'Flying carpet for several riders.');
MI('Censer of Controlling Air Elementals', 'SRD', 'wondrous', 'rare', false, 'Summon an air elemental once per day.');
MI('Chime of Opening', 'SRD', 'wondrous', 'rare', false, 'Open locks and lids within 120 ft (10 charges).', { charges: 10 });
MI('Circlet of Blasting', 'SRD', 'wondrous', 'uncommon', false, 'Cast scorching ray (+5 to hit) once per day.', { charges: 1 });
MI('Cloak of Arachnida', 'SRD', 'wondrous', 'very rare', true, 'Poison resistance, climb speed, web once per day.');
MI('Cloak of Displacement', 'SRD', 'wondrous', 'rare', true, 'Attacks against you have disadvantage until you are hit.');
MI('Cloak of Elvenkind', 'SRD', 'wondrous', 'uncommon', true, 'Advantage on Stealth; disadvantage on Perception to see you.');
MI('Cloak of Protection', 'SRD', 'wondrous', 'uncommon', true, '+1 AC and +1 to saving throws.', { ac: 1, save: 1 });
MI('Cloak of the Bat', 'SRD', 'wondrous', 'rare', true, 'Stealth advantage; fly in darkness; polymorph into a bat.');
MI('Cloak of the Manta Ray', 'SRD', 'wondrous', 'uncommon', false, 'Breathe underwater, 60 ft swim speed.');
MI('Crystal Ball', 'SRD', 'wondrous', 'very rare', true, 'Cast scrying.');
MI('Cube of Force', 'SRD', 'wondrous', 'rare', true, 'Create a barrier cube using charges.', { charges: 36 });
MI('Cubic Gate', 'SRD', 'wondrous', 'legendary', false, 'Cast gate or plane shift to linked planes.', { charges: 3 });
MI('Dagger of Venom', 'SRD', 'weapon', 'rare', false, '+1 dagger; once per day coat with poison (2d10, poisoned).', { base: 'weapon', atk: 1, dmg: 1 });
MI('Dancing Sword', 'SRD', 'weapon', 'very rare', true, 'Toss to make it fight on its own.', { base: 'weapon' });
MI('Decanter of Endless Water', 'SRD', 'wondrous', 'uncommon', false, 'Produce water: stream, fountain or geyser.');
MI('Deck of Illusions', 'SRD', 'wondrous', 'uncommon', false, 'Draw cards to create illusions.');
MI('Deck of Many Things', 'SRD', 'wondrous', 'legendary', false, 'Draw for wondrous or terrible fates.');
MI('Defender', 'SRD', 'weapon', 'legendary', true, '+3 sword; transfer bonus to AC.', { base: 'weapon', atk: 3, dmg: 3 });
MI('Demon Armor', 'SRD', 'armor', 'very rare', true, '+1 plate; claws deal 1d8; cursed.', { base: 'armor', ac: 1 });
MI('Dimensional Shackles', 'SRD', 'wondrous', 'rare', false, 'Prevent extradimensional movement.');
MI('Dragon Scale Mail', 'SRD', 'armor', 'very rare', true, '+1 AC scale mail; advantage vs dragon frightful presence; resistance to one type.', { base: 'armor', ac: 1 });
MI('Dragon Slayer', 'SRD', 'weapon', 'rare', false, '+1 sword; +3d6 damage to dragons.', { base: 'weapon', atk: 1, dmg: 1 });
MI('Dust of Disappearance', 'SRD', 'wondrous', 'uncommon', false, 'Creatures in 10 ft become invisible for 2d4 minutes.');
MI('Dust of Dryness', 'SRD', 'wondrous', 'uncommon', false, 'Absorb water into pellets.');
MI('Dust of Sneezing and Choking', 'SRD', 'wondrous', 'uncommon', false, 'Looks like Dust of Disappearance; creatures choke.');
MI('Dwarven Plate', 'SRD', 'armor', 'very rare', false, '+2 plate; reduce forced movement by 10 ft.', { base: 'armor', ac: 2 });
MI('Dwarven Thrower', 'SRD', 'weapon', 'very rare', true, '+3 warhammer; thrown, returns, extra damage to giants (dwarf only).', { base: 'weapon', atk: 3, dmg: 3 });
MI('Efficient Quiver', 'SRD', 'wondrous', 'uncommon', false, 'Holds many arrows, bolts, javelins and staves.');
MI('Efreeti Bottle', 'SRD', 'wondrous', 'very rare', false, 'Release an efreeti with random results.');
MI('Elemental Gem', 'SRD', 'wondrous', 'uncommon', false, 'Break to summon an elemental.');
MI('Elven Chain', 'SRD', 'armor', 'rare', false, '+1 chain shirt; proficient even without medium armor training.', { base: 'armor', ac: 1 });
MI('Eversmoking Bottle', 'SRD', 'wondrous', 'uncommon', false, 'Releases thick smoke.');
MI('Eyes of Charming', 'SRD', 'wondrous', 'uncommon', true, 'Cast charm person (DC 13).', { charges: 3 });
MI('Eyes of Minute Seeing', 'SRD', 'wondrous', 'uncommon', false, 'Advantage on Investigation within 1 ft.');
MI('Eyes of the Eagle', 'SRD', 'wondrous', 'uncommon', true, 'Advantage on sight-based Perception.');
MI('Figurine of Wondrous Power', 'SRD', 'wondrous', 'rare', false, 'Statuette becomes a creature for a time.');
MI('Flame Tongue', 'SRD', 'weapon', 'rare', true, 'Bonus action: flames deal +2d6 fire.', { base: 'weapon' });
MI('Folding Boat', 'SRD', 'wondrous', 'rare', false, 'Box that becomes a boat or ship.');
MI('Frost Brand', 'SRD', 'weapon', 'very rare', true, '+1d6 cold; fire resistance; extinguish flames.', { base: 'weapon' });
MI('Gauntlets of Ogre Power', 'SRD', 'wondrous', 'uncommon', true, 'Your STR score is 19.', { abil: { str: 19 } });
MI('Gem of Brightness', 'SRD', 'wondrous', 'uncommon', false, 'Light, blinding beams (50 charges).', { charges: 50 });
MI('Gem of Seeing', 'SRD', 'wondrous', 'rare', true, 'Truesight 120 ft for 10 minutes.', { charges: 3 });
MI('Giant Slayer', 'SRD', 'weapon', 'rare', false, '+1 weapon; +2d6 vs giants and knock prone.', { base: 'weapon', atk: 1, dmg: 1 });
MI('Glamoured Studded Leather', 'SRD', 'armor', 'rare', false, '+1 studded leather; change its appearance.', { base: 'armor', ac: 1 });
MI('Gloves of Missile Snaring', 'SRD', 'wondrous', 'uncommon', true, 'Reaction: reduce ranged damage by 1d10 + DEX, maybe catch it.');
MI('Gloves of Swimming and Climbing', 'SRD', 'wondrous', 'uncommon', true, 'Climb and swim at full speed; +5 Athletics for them.');
MI('Goggles of Night', 'SRD', 'wondrous', 'uncommon', false, 'Darkvision 60 ft (or +60).');
MI('Hammer of Thunderbolts', 'SRD', 'weapon', 'legendary', true, '+1 maul; giant-slaying and thunderous strikes.', { base: 'weapon', atk: 1, dmg: 1 });
MI('Handy Haversack', 'SRD', 'wondrous', 'rare', false, 'Extradimensional pouches; item on top when you reach in.');
MI('Hat of Disguise', 'SRD', 'wondrous', 'uncommon', true, 'Cast disguise self at will.');
MI('Headband of Intellect', 'SRD', 'wondrous', 'uncommon', true, 'Your INT score is 19.', { abil: { int: 19 } });
MI('Helm of Brilliance', 'SRD', 'wondrous', 'very rare', true, 'Gems cast fire spells; fire resistance.');
MI('Helm of Comprehending Languages', 'SRD', 'wondrous', 'uncommon', false, 'Cast comprehend languages at will.');
MI('Helm of Telepathy', 'SRD', 'wondrous', 'uncommon', true, 'Detect thoughts at will; suggestion once per day.');
MI('Helm of Teleportation', 'SRD', 'wondrous', 'rare', true, 'Cast teleport (3 charges).', { charges: 3 });
MI('Holy Avenger', 'SRD', 'weapon', 'legendary', 'paladin', '+3 sword; +2d10 radiant to fiends and undead; aura vs spells.', { base: 'weapon', atk: 3, dmg: 3 });
MI('Horn of Blasting', 'SRD', 'wondrous', 'rare', false, 'Blast for 5d6 thunder in a cone.');
MI('Horn of Valhalla', 'SRD', 'wondrous', 'rare', false, 'Summon spirit warriors.');
MI('Horseshoes of Speed', 'SRD', 'wondrous', 'rare', false, 'Horse speed +30 ft.');
MI('Horseshoes of a Zephyr', 'SRD', 'wondrous', 'very rare', false, 'Horse moves over any surface, never tires.');
MI('Immovable Rod', 'SRD', 'rod', 'uncommon', false, 'Button fixes it in place, holding 8,000 lb.');
MI('Instant Fortress', 'SRD', 'wondrous', 'rare', false, 'Tiny cube becomes an adamantine tower.');
MI('Ioun Stone (Absorption)', 'SRD', 'wondrous', 'very rare', true, 'Absorb spells of 4th level or lower.');
MI('Ioun Stone (Agility)', 'SRD', 'wondrous', 'very rare', true, '+2 DEX (max 20).');
MI('Ioun Stone (Awareness)', 'SRD', 'wondrous', 'rare', true, "Can't be surprised.");
MI('Ioun Stone (Fortitude)', 'SRD', 'wondrous', 'very rare', true, '+2 CON (max 20).');
MI('Ioun Stone (Insight)', 'SRD', 'wondrous', 'very rare', true, '+2 WIS (max 20).');
MI('Ioun Stone (Intellect)', 'SRD', 'wondrous', 'very rare', true, '+2 INT (max 20).');
MI('Ioun Stone (Leadership)', 'SRD', 'wondrous', 'very rare', true, '+2 CHA (max 20).');
MI('Ioun Stone (Mastery)', 'SRD', 'wondrous', 'legendary', true, '+1 proficiency bonus.');
MI('Ioun Stone (Protection)', 'SRD', 'wondrous', 'rare', true, '+1 AC.', { ac: 1 });
MI('Ioun Stone (Regeneration)', 'SRD', 'wondrous', 'legendary', true, 'Regain 15 HP every hour.');
MI('Ioun Stone (Reserve)', 'SRD', 'wondrous', 'rare', true, 'Store spells.');
MI('Ioun Stone (Strength)', 'SRD', 'wondrous', 'very rare', true, '+2 STR (max 20).');
MI('Ioun Stone (Sustenance)', 'SRD', 'wondrous', 'rare', true, 'No need to eat or drink.');
MI('Iron Bands of Bilarro', 'SRD', 'wondrous', 'rare', false, 'Throw to restrain a creature.');
MI('Iron Flask', 'SRD', 'wondrous', 'legendary', false, 'Trap an extraplanar creature.');
MI('Javelin of Lightning', 'SRD', 'weapon', 'uncommon', false, 'Becomes a lightning bolt: 4d6 lightning in a line.', { base: 'weapon' });
MI('Lantern of Revealing', 'SRD', 'wondrous', 'uncommon', false, 'Reveals invisible creatures in its light.');
MI('Luck Blade', 'SRD', 'weapon', 'legendary', true, '+1 sword; +1 saves; reroll once per day; wishes.', { base: 'weapon', atk: 1, dmg: 1, save: 1 });
MI('Mace of Disruption', 'SRD', 'weapon', 'rare', true, '+2d6 radiant to fiends and undead, may destroy them.', { base: 'weapon' });
MI('Mace of Smiting', 'SRD', 'weapon', 'rare', false, '+1 mace; extra damage on 20s, more vs constructs.', { base: 'weapon', atk: 1, dmg: 1 });
MI('Mace of Terror', 'SRD', 'weapon', 'rare', true, 'Frighten creatures within 30 ft (3 charges).', { base: 'weapon', charges: 3 });
MI('Mantle of Spell Resistance', 'SRD', 'wondrous', 'rare', true, 'Advantage on saves vs spells.');
MI('Manual of Bodily Health', 'SRD', 'wondrous', 'very rare', false, 'Study for 48 hours: CON +2 permanently (max 22).');
MI('Manual of Gainful Exercise', 'SRD', 'wondrous', 'very rare', false, 'Study for 48 hours: STR +2 permanently (max 22).');
MI('Manual of Golems', 'SRD', 'wondrous', 'very rare', false, 'Instructions to create a golem.');
MI('Manual of Quickness of Action', 'SRD', 'wondrous', 'very rare', false, 'Study for 48 hours: DEX +2 permanently (max 22).');
MI('Marvelous Pigments', 'SRD', 'wondrous', 'very rare', false, 'Paintings become real objects.');
MI('Medallion of Thoughts', 'SRD', 'wondrous', 'uncommon', true, 'Cast detect thoughts (3 charges).', { charges: 3 });
MI('Mirror of Life Trapping', 'SRD', 'wondrous', 'very rare', false, 'Traps creatures that see their reflection.');
MI('Mithral Armor', 'SRD', 'armor', 'uncommon', false, 'No STR requirement or Stealth disadvantage (medium or heavy).', { base: 'armor', noStealth: true });
MI('Necklace of Adaptation', 'SRD', 'wondrous', 'uncommon', true, 'Breathe in any environment; advantage vs gases.');
MI('Necklace of Fireballs', 'SRD', 'wondrous', 'rare', false, 'Throw beads as fireballs.');
MI('Necklace of Prayer Beads', 'SRD', 'wondrous', 'rare', 'cleric, druid or paladin', 'Beads cast bless, cure wounds and more.');
MI('Nine Lives Stealer', 'SRD', 'weapon', 'very rare', true, '+2 sword; may slay creatures under 100 HP on a crit.', { base: 'weapon', atk: 2, dmg: 2 });
MI('Oathbow', 'SRD', 'weapon', 'very rare', true, 'Swear enmity: advantage and +3d6 against one foe.', { base: 'weapon' });
MI('Oil of Etherealness', 'SRD', 'potion', 'rare', false, 'Become ethereal for 1 hour.');
MI('Oil of Sharpness', 'SRD', 'potion', 'very rare', false, 'Weapon becomes +3 for 1 hour.');
MI('Oil of Slipperiness', 'SRD', 'potion', 'uncommon', false, 'Freedom of movement for 8 hours.');
MI('Pearl of Power', 'SRD', 'wondrous', 'uncommon', 'spellcaster', 'Regain a spell slot of 3rd level or lower once per day.', { charges: 1 });
MI('Periapt of Health', 'SRD', 'wondrous', 'uncommon', false, 'Immune to disease.');
MI('Periapt of Proof against Poison', 'SRD', 'wondrous', 'rare', false, 'Immune to poison.');
MI('Periapt of Wound Closure', 'SRD', 'wondrous', 'uncommon', true, 'Stabilize automatically; double Hit Die healing.');
MI('Philter of Love', 'SRD', 'potion', 'uncommon', false, 'Charmed by the first creature you see.');
MI('Pipes of Haunting', 'SRD', 'wondrous', 'uncommon', false, 'Frighten creatures within 30 ft (3 charges).', { charges: 3 });
MI('Pipes of the Sewers', 'SRD', 'wondrous', 'uncommon', true, 'Summon and control swarms of rats.');
MI('Plate Armor of Etherealness', 'SRD', 'armor', 'legendary', true, 'Cast etherealness once per day.', { base: 'armor' });
MI('Portable Hole', 'SRD', 'wondrous', 'rare', false, 'Extradimensional hole 6 ft wide, 10 ft deep.');
MI('Potion of Animal Friendship', 'SRD', 'potion', 'uncommon', false, 'Cast animal friendship for 24 hours.');
MI('Potion of Clairvoyance', 'SRD', 'potion', 'rare', false, 'Gain the clairvoyance spell effect.');
MI('Potion of Climbing', 'SRD', 'potion', 'common', false, 'Climb speed and advantage for 1 hour.');
MI('Potion of Diminution', 'SRD', 'potion', 'rare', false, 'Shrink for 1d4 hours.');
MI('Potion of Flying', 'SRD', 'potion', 'very rare', false, 'Fly speed for 1 hour.');
MI('Potion of Gaseous Form', 'SRD', 'potion', 'rare', false, 'Gaseous form for 1 hour.');
MI('Potion of Giant Strength', 'SRD', 'potion', 'uncommon', false, 'STR becomes a giant\'s for 1 hour.');
MI('Potion of Growth', 'SRD', 'potion', 'uncommon', false, 'Enlarge for 1d4 hours.');
MI('Potion of Healing', 'SRD', 'potion', 'common', false, 'Regain 2d4 + 2 HP.', { heal: '2d4+2' });
MI('Potion of Greater Healing', 'SRD', 'potion', 'uncommon', false, 'Regain 4d4 + 4 HP.', { heal: '4d4+4' });
MI('Potion of Superior Healing', 'SRD', 'potion', 'rare', false, 'Regain 8d4 + 8 HP.', { heal: '8d4+8' });
MI('Potion of Supreme Healing', 'SRD', 'potion', 'very rare', false, 'Regain 10d4 + 20 HP.', { heal: '10d4+20' });
MI('Potion of Heroism', 'SRD', 'potion', 'rare', false, '10 temp HP and bless for 1 hour.');
MI('Potion of Invisibility', 'SRD', 'potion', 'very rare', false, 'Invisible for 1 hour.');
MI('Potion of Mind Reading', 'SRD', 'potion', 'rare', false, 'Detect thoughts for 1 minute.');
MI('Potion of Poison', 'SRD', 'potion', 'uncommon', false, 'Looks like healing; 3d6 poison and poisoned.');
MI('Potion of Resistance', 'SRD', 'potion', 'uncommon', false, 'Resistance to one damage type for 1 hour.');
MI('Potion of Speed', 'SRD', 'potion', 'very rare', false, 'Haste for 1 minute.');
MI('Potion of Water Breathing', 'SRD', 'potion', 'uncommon', false, 'Breathe underwater for 1 hour.');
MI('Restorative Ointment', 'SRD', 'wondrous', 'uncommon', false, 'Heal 2d8 + 2 and cure poison or disease (5 doses).', { charges: 5 });
MI('Ring of Animal Influence', 'SRD', 'ring', 'rare', false, 'Cast animal spells (3 charges).', { charges: 3 });
MI('Ring of Djinni Summoning', 'SRD', 'ring', 'legendary', true, 'Summon a djinni.');
MI('Ring of Elemental Command', 'SRD', 'ring', 'legendary', true, 'Control one element.');
MI('Ring of Evasion', 'SRD', 'ring', 'rare', true, 'Reaction: succeed on a failed DEX save (3 charges).', { charges: 3 });
MI('Ring of Feather Falling', 'SRD', 'ring', 'rare', true, 'Fall at 60 ft per round, no damage.');
MI('Ring of Free Action', 'SRD', 'ring', 'rare', true, 'Difficult terrain doesn\'t slow you; can\'t be paralyzed or restrained by magic.');
MI('Ring of Invisibility', 'SRD', 'ring', 'legendary', true, 'Turn invisible at will.');
MI('Ring of Jumping', 'SRD', 'ring', 'uncommon', true, 'Cast jump at will.');
MI('Ring of Mind Shielding', 'SRD', 'ring', 'uncommon', true, 'Immune to mind reading.');
MI('Ring of Protection', 'SRD', 'ring', 'rare', true, '+1 AC and +1 to saving throws.', { ac: 1, save: 1 });
MI('Ring of Regeneration', 'SRD', 'ring', 'very rare', true, 'Regain 1d6 HP every 10 minutes; regrow limbs.');
MI('Ring of Resistance', 'SRD', 'ring', 'rare', true, 'Resistance to one damage type.', { resType: true });
MI('Ring of Shooting Stars', 'SRD', 'ring', 'very rare', true, 'Dancing lights, light, faerie fire, ball lightning, shooting stars.');
MI('Ring of Spell Storing', 'SRD', 'ring', 'rare', true, 'Store up to 5 levels of spells.');
MI('Ring of Spell Turning', 'SRD', 'ring', 'legendary', true, 'Advantage vs single-target spells; reflect them.');
MI('Ring of Swimming', 'SRD', 'ring', 'uncommon', false, '40 ft swim speed.');
MI('Ring of Telekinesis', 'SRD', 'ring', 'very rare', true, 'Cast telekinesis at will.');
MI('Ring of the Ram', 'SRD', 'ring', 'rare', true, 'Ram force attacks (3 charges).', { charges: 3 });
MI('Ring of Three Wishes', 'SRD', 'ring', 'legendary', false, 'Cast wish (3 charges).', { charges: 3 });
MI('Ring of Warmth', 'SRD', 'ring', 'uncommon', true, 'Cold resistance.');
MI('Ring of Water Walking', 'SRD', 'ring', 'uncommon', false, 'Walk on liquid surfaces.');
MI('Ring of X-ray Vision', 'SRD', 'ring', 'rare', true, 'See through solid matter 30 ft.');
MI('Robe of Eyes', 'SRD', 'wondrous', 'rare', true, 'See in all directions; darkvision; see invisible.');
MI('Robe of Scintillating Colors', 'SRD', 'wondrous', 'very rare', true, 'Dazzling patterns stun viewers (3 charges).', { charges: 3 });
MI('Robe of Stars', 'SRD', 'wondrous', 'very rare', true, '+1 saves; enter the Astral Plane; magic missile stars.', { save: 1 });
MI('Robe of the Archmagi', 'SRD', 'wondrous', 'legendary', 'sorcerer, warlock or wizard', 'AC 15 + DEX unarmored; advantage vs spells; +2 spell DC and attack.', { unarmoredBase: 15, spell: 2 });
MI('Robe of Useful Items', 'SRD', 'wondrous', 'uncommon', false, 'Detach patches to create items.');
MI('Rod of Absorption', 'SRD', 'rod', 'very rare', true, 'Absorb spells targeting only you.');
MI('Rod of Alertness', 'SRD', 'rod', 'very rare', true, 'Advantage on Perception and initiative; detection spells.');
MI('Rod of Lordly Might', 'SRD', 'rod', 'legendary', true, '+3 mace with transforming forms.', { base: 'weapon', atk: 3, dmg: 3 });
MI('Rod of Rulership', 'SRD', 'rod', 'rare', true, 'Charm creatures within 120 ft once per day.');
MI('Rod of Security', 'SRD', 'rod', 'very rare', false, 'Transport creatures to a safe paradise.');
MI('Rope of Climbing', 'SRD', 'wondrous', 'uncommon', false, 'Animated 60 ft rope.');
MI('Rope of Entanglement', 'SRD', 'wondrous', 'rare', false, 'Restrain a creature within 20 ft.');
MI('Scarab of Protection', 'SRD', 'wondrous', 'legendary', true, 'Advantage vs spells; negate necromancy (12 charges).', { charges: 12 });
MI('Scimitar of Speed', 'SRD', 'weapon', 'very rare', true, '+2 scimitar; bonus-action attack each turn.', { base: 'weapon', atk: 2, dmg: 2 });
MI('Shield of Missile Attraction', 'SRD', 'shield', 'rare', true, 'Resistance to ranged weapon damage; cursed to attract missiles.', { base: 'shield' });
MI('Slippers of Spider Climbing', 'SRD', 'wondrous', 'uncommon', true, 'Climb walls and ceilings.');
MI('Sovereign Glue', 'SRD', 'wondrous', 'legendary', false, 'Permanently bonds objects.');
MI('Spell Scroll', 'SRD', 'scroll', 'varies', false, 'Cast the spell written on it once.');
MI('Sentinel Shield', 'DMG', 'shield', 'uncommon', false, 'Advantage on initiative rolls and Wisdom (Perception) checks.', { base: 'shield', initAdv: true, percAdv: true });
MI('Spellguard Shield', 'SRD', 'shield', 'very rare', true, 'Advantage vs spells; spell attacks against you have disadvantage.', { base: 'shield' });
MI('Sphere of Annihilation', 'SRD', 'wondrous', 'legendary', false, 'Destroys all matter it touches.');
MI('Staff of Charming', 'SRD', 'staff', 'rare', 'bard, cleric, druid, sorcerer, warlock or wizard', 'Cast charm person, command, comprehend languages (10 charges).', { charges: 10 });
MI('Staff of Fire', 'SRD', 'staff', 'very rare', 'druid, sorcerer, warlock or wizard', 'Fire resistance; burning hands, fireball, wall of fire (10 charges).', { charges: 10 });
MI('Staff of Frost', 'SRD', 'staff', 'very rare', 'druid, sorcerer, warlock or wizard', 'Cold resistance; cone of cold, fog cloud, ice storm, wall of ice (10 charges).', { charges: 10 });
MI('Staff of Healing', 'SRD', 'staff', 'rare', 'bard, cleric or druid', 'Cure wounds, lesser restoration, mass cure wounds (10 charges).', { charges: 10 });
MI('Staff of Power', 'SRD', 'staff', 'very rare', 'sorcerer, warlock or wizard', '+2 staff; +2 AC, saves and spell attacks; many spells (20 charges).', { base: 'weapon', atk: 2, dmg: 2, ac: 2, save: 2, spellAtk: 2, charges: 20 });
MI('Staff of Striking', 'SRD', 'staff', 'very rare', true, '+3 quarterstaff; spend charges for force damage (10 charges).', { base: 'weapon', atk: 3, dmg: 3, charges: 10 });
MI('Staff of Swarming Insects', 'SRD', 'staff', 'rare', 'bard, cleric, druid, sorcerer, warlock or wizard', 'Insect cloud, giant insect, insect plague (10 charges).', { charges: 10 });
MI('Staff of the Magi', 'SRD', 'staff', 'legendary', 'sorcerer, warlock or wizard', '+2 staff; +2 spell attacks; spell absorption; many spells (50 charges).', { base: 'weapon', atk: 2, dmg: 2, spellAtk: 2, charges: 50 });
MI('Staff of the Python', 'SRD', 'staff', 'uncommon', 'cleric, druid or warlock', 'Becomes a giant constrictor snake.');
MI('Staff of the Woodlands', 'SRD', 'staff', 'rare', 'druid', '+2 staff; +2 spell attacks; nature spells (10 charges).', { base: 'weapon', atk: 2, dmg: 2, spellAtk: 2, charges: 10 });
MI('Staff of Thunder and Lightning', 'SRD', 'staff', 'very rare', true, '+2 staff; lightning, thunder and thunderclap effects.', { base: 'weapon', atk: 2, dmg: 2 });
MI('Staff of Withering', 'SRD', 'staff', 'rare', 'cleric, druid or warlock', 'Hits deal +2d10 necrotic (3 charges).', { charges: 3 });
MI('Stone of Controlling Earth Elementals', 'SRD', 'wondrous', 'rare', false, 'Summon an earth elemental once per day.');
MI('Stone of Good Luck (Luckstone)', 'SRD', 'wondrous', 'uncommon', true, '+1 to ability checks and saving throws.', { save: 1, check: 1 });
MI('Sun Blade', 'SRD', 'weapon', 'rare', true, '+2 radiant longsword blade of light; +1d8 vs undead.', { base: 'weapon', atk: 2, dmg: 2 });
MI('Sword of Life Stealing', 'SRD', 'weapon', 'rare', true, 'On a crit, +3d6 necrotic and gain temp HP.', { base: 'weapon' });
MI('Sword of Sharpness', 'SRD', 'weapon', 'very rare', true, 'Max damage vs objects; sever limbs on a 20.', { base: 'weapon' });
MI('Sword of Wounding', 'SRD', 'weapon', 'rare', true, 'Wounds that won\'t heal magically; extra necrotic each turn.', { base: 'weapon' });
MI('Talisman of Pure Good', 'SRD', 'wondrous', 'legendary', 'good creature', 'Holy symbol; open a fissure to destroy evil (7 charges).', { charges: 7 });
MI('Talisman of the Sphere', 'SRD', 'wondrous', 'legendary', true, 'Double proficiency to control a sphere of annihilation.');
MI('Talisman of Ultimate Evil', 'SRD', 'wondrous', 'legendary', 'evil creature', 'Unholy symbol; doom good creatures (6 charges).', { charges: 6 });
MI('Tome of Clear Thought', 'SRD', 'wondrous', 'very rare', false, 'Study for 48 hours: INT +2 permanently (max 22).');
MI('Tome of Leadership and Influence', 'SRD', 'wondrous', 'very rare', false, 'Study for 48 hours: CHA +2 permanently (max 22).');
MI('Tome of Understanding', 'SRD', 'wondrous', 'very rare', false, 'Study for 48 hours: WIS +2 permanently (max 22).');
MI('Trident of Fish Command', 'SRD', 'weapon', 'uncommon', true, 'Cast dominate beast on swimmers (3 charges).', { base: 'weapon', charges: 3 });
MI('Universal Solvent', 'SRD', 'potion', 'legendary', false, 'Dissolves any adhesive.');
MI('Vicious Weapon', 'SRD', 'weapon', 'rare', false, '+7 damage on a natural 20.', { base: 'weapon' });
MI('Vorpal Sword', 'SRD', 'weapon', 'legendary', true, '+3 sword; ignores slashing resistance; decapitates on a 20.', { base: 'weapon', atk: 3, dmg: 3 });
MI('Wand of Binding', 'SRD', 'wand', 'rare', 'spellcaster', 'Hold monster or hold person (7 charges).', { charges: 7 });
MI('Wand of Enemy Detection', 'SRD', 'wand', 'rare', true, 'Sense hostile creatures within 60 ft (7 charges).', { charges: 7 });
MI('Wand of Fear', 'SRD', 'wand', 'rare', true, 'Command or 60 ft cone of fear (7 charges).', { charges: 7 });
MI('Wand of Fireballs', 'SRD', 'wand', 'rare', 'spellcaster', 'Cast fireball (7 charges).', { charges: 7 });
MI('Wand of Lightning Bolts', 'SRD', 'wand', 'rare', 'spellcaster', 'Cast lightning bolt (7 charges).', { charges: 7 });
MI('Wand of Magic Detection', 'SRD', 'wand', 'uncommon', false, 'Cast detect magic (3 charges).', { charges: 3 });
MI('Wand of Magic Missiles', 'SRD', 'wand', 'uncommon', false, 'Cast magic missile (7 charges).', { charges: 7 });
MI('Wand of Paralysis', 'SRD', 'wand', 'rare', 'spellcaster', 'Paralyze a creature (7 charges).', { charges: 7 });
MI('Wand of Polymorph', 'SRD', 'wand', 'very rare', 'spellcaster', 'Cast polymorph (7 charges).', { charges: 7 });
MI('Wand of Secrets', 'SRD', 'wand', 'uncommon', false, 'Detect secret doors and traps (3 charges).', { charges: 3 });
MI('Wand of the War Mage +1', 'SRD', 'wand', 'uncommon', 'spellcaster', '+1 spell attack rolls; ignore half cover.', { spellAtk: 1 });
MI('Wand of the War Mage +2', 'SRD', 'wand', 'rare', 'spellcaster', '+2 spell attack rolls; ignore half cover.', { spellAtk: 2 });
MI('Wand of the War Mage +3', 'SRD', 'wand', 'very rare', 'spellcaster', '+3 spell attack rolls; ignore half cover.', { spellAtk: 3 });
MI('Wand of Web', 'SRD', 'wand', 'uncommon', 'spellcaster', 'Cast web (7 charges).', { charges: 7 });
MI('Wand of Wonder', 'SRD', 'wand', 'rare', 'spellcaster', 'Random magical effects (7 charges).', { charges: 7 });
MI('Well of Many Worlds', 'SRD', 'wondrous', 'legendary', false, 'Opens a portal to another world.');
MI('Wings of Flying', 'SRD', 'wondrous', 'rare', true, 'Wings grant 60 ft flying speed for 1 hour.');

// ---- Xanathar's (common items and more) ----
[['Armor of Gleaming', 'armor', 'Never gets dirty.'], ['Bead of Nourishment', 'wondrous', 'Provides a day of nourishment.'], ['Bead of Refreshment', 'wondrous', 'Purifies a pint of liquid.'], ['Boots of False Tracks', 'wondrous', 'Leave tracks of another creature.'], ['Candle of the Deep', 'wondrous', 'Flame can\'t be extinguished by water.'], ['Cast-Off Armor', 'armor', 'Doff as an action.'], ["Charlatan's Die", 'wondrous', 'Choose the result when rolled (attuned).'], ['Cloak of Billowing', 'wondrous', 'Billows dramatically on command.'], ['Cloak of Many Fashions', 'wondrous', 'Change its style at will.'], ['Clockwork Amulet', 'wondrous', 'Treat an attack roll as 10 once per day.'], ['Clothes of Mending', 'wondrous', 'Repairs itself.'], ['Dark Shard Amulet', 'wondrous', 'Warlock focus; try to cast an unknown warlock cantrip.'], ['Dread Helm', 'wondrous', 'Eyes glow red.'], ['Ear Horn of Hearing', 'wondrous', 'Suppresses deafness.'], ['Enduring Spellbook', 'wondrous', 'Unharmed by fire or water.'], ['Ersatz Eye', 'wondrous', 'An artificial eye that replaces a lost one.'], ['Hat of Vermin', 'wondrous', 'Pull out a bat, frog or rat (3 charges).'], ['Hat of Wizardry', 'wondrous', 'Wizard focus; try to cast an unknown wizard cantrip.'], ["Heward's Handy Spice Pouch", 'wondrous', 'Produces seasonings (10 charges).'], ['Horn of Silent Alarm', 'wondrous', 'Only one creature hears it.'], ['Instrument of Illusions', 'wondrous', 'Create harmless illusions while playing.'], ['Instrument of Scribing', 'wondrous', 'Write magical messages.'], ['Lock of Trickery', 'wondrous', 'Disadvantage to pick it.'], ['Moon-Touched Sword', 'weapon', 'Sheds moonlight in darkness.'], ['Mystery Key', 'wondrous', 'Small chance to open any lock.'], ['Orb of Direction', 'wondrous', 'Know which way is north.'], ['Orb of Time', 'wondrous', 'Know the time of day.'], ['Perfume of Bewitching', 'potion', 'Advantage on CHA checks vs humanoids for 1 hour.'], ['Pipe of Smoke Monsters', 'wondrous', 'Blow smoke shaped like creatures.'], ['Pole of Angling', 'wondrous', 'Becomes a fishing pole.'], ['Pole of Collapsing', 'wondrous', 'Shrinks to 1 foot.'], ['Pot of Awakening', 'wondrous', 'Grow an awakened shrub.'], ['Rope of Mending', 'wondrous', 'Repairs itself.'], ['Ruby of the War Mage', 'wondrous', 'Use a weapon as a spellcasting focus (attuned).'], ['Shield of Expression', 'shield', 'Change the face on it.'], ['Smoldering Armor', 'armor', 'Harmless smoke wisps.'], ['Staff of Adornment', 'staff', 'Objects orbit its tip.'], ['Staff of Birdcalls', 'staff', 'Make birdcalls (10 charges).'], ['Staff of Flowers', 'staff', 'Make flowers bloom (10 charges).'], ['Talking Doll', 'wondrous', 'Repeats recorded phrases.'], ['Tankard of Sobriety', 'wondrous', 'Can\'t get drunk from it.'], ['Unbreakable Arrow', 'ammo', 'Can\'t be broken except in an antimagic field.'], ["Veteran's Cane", 'wondrous', 'Becomes a longsword.'], ['Walloping Ammunition', 'ammo', 'Knock prone (STR save).'], ['Wand of Conducting', 'wand', 'Create orchestral music (3 charges).'], ['Wand of Pyrotechnics', 'wand', 'Create fireworks (7 charges).'], ['Wand of Scowls', 'wand', 'Force a scowl (3 charges).'], ['Wand of Smiles', 'wand', 'Force a smile (3 charges).']]
  .forEach(([n, t, s]) => MI(n, 'XGE', t, 'common', ["Charlatan's Die", 'Ruby of the War Mage', 'Dark Shard Amulet', 'Hat of Wizardry', 'Clockwork Amulet', 'Ersatz Eye'].includes(n), s, ['Moon-Touched Sword', 'Cast-Off Armor', 'Smoldering Armor', 'Armor of Gleaming', 'Shield of Expression'].includes(n) ? { base: t === 'weapon' ? 'weapon' : t === 'shield' ? 'shield' : 'armor' } : {}));

// ---- Tasha's ----
['1', '2', '3'].forEach((b, i) => {
  const r = ['uncommon', 'rare', 'very rare'][i], n = Number(b);
  MI(`All-Purpose Tool +${b}`, 'TCE', 'wondrous', r, 'artificer', `+${b} spell attack rolls and save DC; channel a cantrip once per long rest.`, { spell: n });
  MI(`Amulet of the Devout +${b}`, 'TCE', 'wondrous', r, 'cleric or paladin', `+${b} spell attack rolls and save DC; extra Channel Divinity once per long rest.`, { spell: n });
  MI(`Arcane Grimoire +${b}`, 'TCE', 'wondrous', r, 'wizard', `+${b} spell attack rolls and save DC; Arcane Recovery +1 level.`, { spell: n });
  MI(`Bloodwell Vial +${b}`, 'TCE', 'wondrous', r, 'sorcerer', `+${b} spell attack rolls and save DC; regain sorcery points once per day.`, { spell: n });
  MI(`Dragonhide Belt +${b}`, 'TCE', 'wondrous', r, 'monk', `+${b} to ki save DCs; regain ki once per day.`);
  MI(`Moon Sickle +${b}`, 'TCE', 'weapon', r, 'druid or ranger', `+${b} sickle and spell attacks/DC; extra healing.`, { base: 'weapon', atk: n, dmg: n, spell: n });
  MI(`Rhythm-Maker's Drum +${b}`, 'TCE', 'wondrous', r, 'bard', `+${b} spell attack rolls and save DC; regain Bardic Inspiration once per day.`, { spell: n });
  MI(`Rod of the Pact Keeper +${b}`, 'DMG', 'rod', r, 'warlock', `+${b} spell attack rolls and save DC; regain a pact slot once per long rest.`, { spell: n });
});
[['Alchemical Compendium', 'rare', 'wizard', 'Transmute nonmagical objects; spellbook focus.'], ['Astral Shard', 'rare', 'sorcerer', 'Teleport after a Metamagic spell.'], ['Astromancy Archive', 'uncommon', 'wizard', 'Reaction to add or subtract 1d4 from a roll.'], ['Atlas of Endless Horizons', 'rare', 'wizard', 'Teleport and travel spells.'], ['Cauldron of Rebirth', 'very rare', 'druid or warlock', 'Brew potions and revive the dead.'], ['Crystalline Chronicle', 'very rare', 'wizard', 'Psionic spells and telepathy.'], ['Duplicitous Manuscript', 'rare', 'wizard', 'Illusion spells; disguise spellbook.'], ['Elemental Essence Shard', 'rare', 'sorcerer', 'Elemental effects after Metamagic.'], ['Eldritch Claw Tattoo', 'uncommon', true, 'Unarmed strikes are +1 magical; reach 15 ft briefly.'], ['Feywild Shard', 'uncommon', 'sorcerer', 'Roll on the Wild Magic table after Metamagic.'], ['Fulminating Treatise', 'rare', 'wizard', 'Thunder damage and push.'], ["Heart Weaver's Primer", 'rare', 'wizard', 'Enchantment spells with disadvantage on the save.'], ['Libram of Souls and Flesh', 'rare', 'wizard', 'Necromancy spells and undead appearance.'], ['Lyre of Building', 'rare', 'bard', 'Mending and building spells.'], ["Nature's Mantle", 'uncommon', 'druid or ranger', 'Hide as a bonus action in nature.'], ['Outer Essence Shard', 'rare', 'sorcerer', 'Celestial or fiendish effects after Metamagic.'], ["Planecaller's Codex", 'rare', 'wizard', 'Conjuration spellbook and focus; spend a charge so a lone summoned creature gets advantage on attacks for 1 minute.'], ['Protective Verses', 'rare', 'wizard', 'Abjuration spells grant temp HP.'], ["Reveler's Concertina", 'rare', 'bard', '+2 bard spell save DC.'], ['Shadowfell Brand Tattoo', 'rare', true, 'Darkvision 60 ft and advantage on Stealth; reaction: halve damage you take (once per day, resets at sunset).'], ['Shadowfell Shard', 'rare', 'sorcerer', 'Curse a creature after Metamagic.'], ['Spellwrought Tattoo', 'varies', false, 'Cast the spell inked into it once.'], ['Barrier Tattoo', 'varies', true, 'AC 12/15/18 + DEX while unarmored.'], ['Blood Fury Tattoo', 'legendary', true, 'Extra necrotic damage and reaction attacks.'], ['Coiling Grasp Tattoo', 'uncommon', true, 'Action: inky tendrils hit a creature within 15 ft — DC 14 STR save or 3d6 force and grappled (escape DC 14).'], ['Ghost Step Tattoo', 'very rare', true, 'Become incorporeal briefly.'], ["Illuminator's Tattoo", 'common', true, 'Write with your fingertip; once per day make a page readable only by you and one named creature for 24 hours.'], ['Lifewell Tattoo', 'very rare', true, 'Necrotic resistance; avoid death once.'], ['Masquerade Tattoo', 'common', true, 'Change the tattoo; cast disguise self.'], ['Absorbing Tattoo', 'very rare', true, 'Resistance to one type; absorb it to heal.'], ['Tome of the Stilled Tongue', 'legendary', 'wizard', 'Cast a spell as a bonus action once per day.'], ['Mighty Servant of Leuk-o', 'artifact', true, 'An enormous construct vehicle.'], ["Baba Yaga's Mortar and Pestle", 'artifact', true, 'Legendary witch\'s tools.'], ['Crook of Rao', 'artifact', true, 'Banish fiends.'], ['Demonomicon of Iggwilv', 'artifact', true, 'Tome of demonic secrets.']]
  .forEach(([n, r, a, s]) => MI(n, 'TCE', 'wondrous', r, a, s, n === 'Barrier Tattoo' ? { unarmoredBase: 15 } : {}));

// ---- Fizban's ----
[['Amethyst Lodestone', 'Control gravity around you.'], ['Crystal Blade', 'Radiant blade that heals.'], ['Dragon Vessel', 'Produce liquids and dragon breath.'], ['Dragon Wing Bow', 'Arrows deal extra elemental damage.'], ["Dragon's Wrath Weapon", 'Extra elemental damage and a breath burst.'], ['Dragon-Touched Focus', 'Spellcasting focus with draconic powers; advantage on initiative.'], ['Emerald Pen', 'Writes illusions; cast illusory script.'], ['Hide of the Feral Guardian', 'Studded leather +1 that lets you polymorph.'], ['Platinum Scarf', 'Pull scales that heal or protect.'], ['Ruby Weave Gem', 'Learn and cast extra spells.'], ['Sapphire Buckler', 'Shield that grants thunder resistance and locates creatures.'], ['Scaled Ornament', 'Grows in power; resistance and flight at higher stages.'], ['Topaz Annihilator', 'Firearm that deals necrotic damage.'], ['Wyrmreaver Gauntlets', 'Deal extra damage to dragons; heal.'], ['Dragonlance', 'Legendary lance that slays dragons.']]
  .forEach(([n, s]) => MI(n, 'FTD', n.includes('Bow') || n.includes('Weapon') || n.includes('Blade') || n === 'Dragonlance' || n.includes('Annihilator') ? 'weapon' : 'wondrous', 'varies', true, s, n.includes('Bow') || n.includes('Weapon') || n.includes('Blade') || n === 'Dragonlance' ? { base: 'weapon' } : {}));

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
DND.sources = { PHB: "Player's Handbook", SRD: 'System Reference Document', XGE: "Xanathar's Guide to Everything", TCE: "Tasha's Cauldron of Everything", SCAG: "Sword Coast Adventurer's Guide", VGM: "Volo's Guide to Monsters", MPMM: 'Monsters of the Multiverse', FTD: "Fizban's Treasury of Dragons", VRGR: "Van Richten's Guide to Ravenloft", WGtE: "Wayfinder's Guide to Eberron", BGG: 'Bigby Presents: Glory of the Giants', EEPC: "Elemental Evil Player's Companion", DMG: "Dungeon Master's Guide", UA: 'Unearthed Arcana' };
DND.pointBuy = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
DND.standardArray = [15, 14, 13, 12, 10, 8];
DND.alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned'];

// Spells: name|level|school|time|range|components|duration|flags(c=concentration r=ritual)|classes|summary|source
// classes: A artificer, B bard, C cleric, D druid, P paladin, R ranger, S sorcerer, K warlock, W wizard
DND.spellText = `
Acid Splash|0|Con|A|60 ft|VS|Instantaneous||ASW|1d6 acid to one or two adjacent creatures, DEX save negates|PHB
Blade Ward|0|Abj|A|Self|VS|1 round||BKSW|Resistance to bludgeoning, piercing and slashing from weapon attacks|PHB
Booming Blade|0|Evo|A|Self (5 ft)|SM|1 round||AKSW|Melee weapon attack; if the target moves before your next turn it takes 1d8 thunder (more at 5th level)|TCE
Chill Touch|0|Nec|A|120 ft|VS|1 round||KSW|Ranged spell attack, 1d10 necrotic; target can't regain HP until your next turn|PHB
Control Flames|0|Tra|A|60 ft|S|Instantaneous||DSW|Shape, extend or extinguish nonmagical flames|XGE
Create Bonfire|0|Con|A|60 ft|VS|1 minute|c|ADKSW|Bonfire: 1d8 fire, DEX save negates|XGE
Dancing Lights|0|Evo|A|120 ft|VSM|1 minute|c|ABSW|Create up to four floating lights|PHB
Druidcraft|0|Tra|A|30 ft|VS|Instantaneous||D|Minor nature effects: predict weather, bloom flowers, sensory effects|PHB
Eldritch Blast|0|Evo|A|120 ft|VS|Instantaneous||K|Ranged spell attack, 1d10 force per beam (2 beams at 5th, 3 at 11th, 4 at 17th)|PHB
Fire Bolt|0|Evo|A|120 ft|VS|Instantaneous||ASW|Ranged spell attack, 1d10 fire; ignites objects|PHB
Friends|0|Enc|A|Self|SM|1 minute|c|BKSW|Advantage on CHA checks against one creature; it becomes hostile afterward|PHB
Frostbite|0|Evo|A|60 ft|VS|Instantaneous||ADKSW|1d6 cold, CON save; disadvantage on its next weapon attack|XGE
Green-Flame Blade|0|Evo|A|Self (5 ft)|SM|Instantaneous||AKSW|Melee weapon attack; fire leaps to a second creature for your spellcasting modifier|TCE
Guidance|0|Div|A|Touch|VS|1 minute|c|ACD|Target adds 1d4 to one ability check|PHB
Gust|0|Tra|A|30 ft|VS|Instantaneous||DSW|Push a creature 5 ft (STR save) or move a small object|XGE
Infestation|0|Con|A|30 ft|VSM|Instantaneous||DKSW|1d6 poison, CON save; target moves 5 ft randomly|XGE
Light|0|Evo|A|Touch|VM|1 hour||ABCSW|Object sheds bright light 20 ft|PHB
Lightning Lure|0|Evo|A|Self (15 ft)|V|Instantaneous||AKSW|Pull a creature 10 ft (STR save); 1d8 lightning if it ends within 5 ft|TCE
Mage Hand|0|Con|A|30 ft|VS|1 minute||ABKSW|Spectral hand manipulates objects up to 10 lb|PHB
Magic Stone|0|Tra|BA|Touch|VS|1 minute||ADK|Three pebbles: spell attack, 1d6 + spellcasting modifier bludgeoning|XGE
Mending|0|Tra|1m|Touch|VSM|Instantaneous||ABCDSW|Repair a single break or tear|PHB
Message|0|Tra|A|120 ft|VSM|1 round||ABSW|Whisper a message and hear the reply|PHB
Mind Sliver|0|Enc|A|60 ft|V|1 round||KSW|1d6 psychic, INT save; subtract 1d4 from its next save|TCE
Minor Illusion|0|Ill|A|30 ft|SM|1 minute||BKSW|Create a sound or image of an object|PHB
Mold Earth|0|Tra|A|30 ft|S|Instantaneous||DSW|Excavate, shape or mark loose earth|XGE
Poison Spray|0|Con|A|10 ft|VS|Instantaneous||ADKSW|1d12 poison, CON save negates|PHB
Prestidigitation|0|Tra|A|10 ft|VS|1 hour||ABKSW|Minor magical tricks|PHB
Primal Savagery|0|Tra|A|Self|S|Instantaneous||D|Melee spell attack, 1d10 acid|XGE
Produce Flame|0|Con|A|Self|VS|10 minutes||D|Light, or throw: ranged spell attack, 1d8 fire|PHB
Ray of Frost|0|Evo|A|60 ft|VS|Instantaneous||ASW|Ranged spell attack, 1d8 cold; speed −10 ft|PHB
Resistance|0|Abj|A|Touch|VSM|1 minute|c|ACD|Target adds 1d4 to one saving throw|PHB
Sacred Flame|0|Evo|A|60 ft|VS|Instantaneous||C|1d8 radiant, DEX save negates; ignores cover|PHB
Shape Water|0|Tra|A|30 ft|S|Instantaneous||DSW|Move, shape, color or freeze water|XGE
Shillelagh|0|Tra|BA|Touch|VSM|1 minute||D|Club or quarterstaff uses WIS and deals 1d8|PHB
Shocking Grasp|0|Evo|A|Touch|VS|Instantaneous||ASW|Melee spell attack, 1d8 lightning; no reactions; advantage vs metal armor|PHB
Spare the Dying|0|Nec|A|Touch|VS|Instantaneous||AC|Stabilize a creature at 0 HP|PHB
Sword Burst|0|Con|A|Self (5 ft)|V|Instantaneous||AKSW|1d6 force to each creature within 5 ft, DEX save negates|TCE
Thaumaturgy|0|Tra|A|30 ft|V|1 minute||C|Minor wonders: booming voice, tremors, flickering flames|PHB
Thorn Whip|0|Tra|A|30 ft|VSM|Instantaneous||AD|Melee spell attack, 1d6 piercing; pull 10 ft|PHB
Thunderclap|0|Evo|A|Self (5 ft)|S|Instantaneous||ABDKSW|1d6 thunder to each creature within 5 ft, CON save negates|XGE
Toll the Dead|0|Nec|A|60 ft|VS|Instantaneous||CKW|1d8 necrotic (1d12 if damaged), WIS save negates|XGE
True Strike|0|Div|A|30 ft|S|1 round|c|BKSW|Advantage on your first attack against the target next turn|PHB
Vicious Mockery|0|Enc|A|60 ft|V|Instantaneous||B|1d4 psychic, WIS save; disadvantage on its next attack|PHB
Word of Radiance|0|Evo|A|5 ft|VM|Instantaneous||C|1d6 radiant to chosen creatures within 5 ft, CON save negates|XGE
Absorb Elements|1|Abj|R|Self|S|1 round||ADRSW|Resistance to the triggering elemental damage; next melee hit +1d6 of that type|XGE
Alarm|1|Abj|1m|30 ft|VSM|8 hours|r|ARW|Ward an area to alert you to intruders|PHB
Animal Friendship|1|Enc|A|30 ft|VSM|24 hours||BDR|Charm a beast, WIS save|PHB
Armor of Agathys|1|Abj|A|Self|VSM|1 hour||K|5 temp HP; melee attackers take 5 cold while it lasts|PHB
Arms of Hadar|1|Con|A|Self (10 ft)|VS|Instantaneous||K|2d6 necrotic, STR save half; no reactions on a fail|PHB
Bane|1|Enc|A|30 ft|VSM|1 minute|c|BC|Up to three creatures subtract 1d4 from attacks and saves, CHA save|PHB
Beast Bond|1|Div|A|Touch|VSM|10 minutes|c|DR|Telepathic link with a friendly beast|XGE
Bless|1|Enc|A|30 ft|VSM|1 minute|c|CP|Up to three creatures add 1d4 to attacks and saves|PHB
Burning Hands|1|Evo|A|Self (15 ft cone)|VS|Instantaneous||SW|3d6 fire, DEX save half|PHB
Catapult|1|Tra|A|60 ft|S|Instantaneous||ASW|Hurl an object: 3d8 bludgeoning, DEX save negates|XGE
Cause Fear|1|Nec|A|60 ft|V|1 minute|c|KW|Frighten a creature, WIS save|XGE
Ceremony|1|Abj|1h|Touch|VSM|Instantaneous|r|CP|Perform a religious rite (atonement, bless water, wedding and more)|XGE
Chaos Bolt|1|Evo|A|120 ft|VS|Instantaneous||S|Ranged spell attack, 2d8 + 1d6 random type; can leap on doubles|XGE
Charm Person|1|Enc|A|30 ft|VS|1 hour||BDKSW|Charm a humanoid, WIS save|PHB
Chromatic Orb|1|Evo|A|90 ft|VSM|Instantaneous||SW|Ranged spell attack, 3d8 of a chosen element|PHB
Color Spray|1|Ill|A|Self (15 ft cone)|VSM|1 round||BSW|Blind 6d10 HP worth of creatures|PHB
Command|1|Enc|A|60 ft|V|1 round||CP|One-word command, WIS save|PHB
Compelled Duel|1|Enc|BA|30 ft|V|1 minute|c|P|Target has disadvantage attacking others and must stay near you, WIS save|PHB
Comprehend Languages|1|Div|A|Self|VSM|1 hour|r|BKSW|Understand any spoken or written language|PHB
Create or Destroy Water|1|Tra|A|30 ft|VSM|Instantaneous||CD|Create or destroy up to 10 gallons of water|PHB
Cure Wounds|1|Evo|A|Touch|VS|Instantaneous||ABCDPR|Heal 1d8 + spellcasting modifier|PHB
Detect Evil and Good|1|Div|A|Self|VS|10 minutes|c|CP|Sense aberrations, celestials, elementals, fey, fiends and undead within 30 ft|PHB
Detect Magic|1|Div|A|Self|VS|10 minutes|cr|ABCDPRSW|Sense magic within 30 ft|PHB
Detect Poison and Disease|1|Div|A|Self|VSM|10 minutes|cr|ACDPR|Sense poisons and diseases within 30 ft|PHB
Disguise Self|1|Ill|A|Self|VS|1 hour||ABSW|Change your appearance|PHB
Dissonant Whispers|1|Enc|A|60 ft|V|Instantaneous||B|3d6 psychic, WIS save half; target flees on a fail|PHB
Divine Favor|1|Evo|BA|Self|VS|1 minute|c|P|Weapon attacks deal +1d4 radiant|PHB
Earth Tremor|1|Evo|A|Self (10 ft)|VS|Instantaneous||BDSW|1d6 bludgeoning and prone, DEX save|XGE
Ensnaring Strike|1|Con|BA|Self|V|1 minute|c|R|Next hit restrains the target (STR save); 1d6 piercing each turn|PHB
Entangle|1|Con|A|90 ft|VS|1 minute|c|DR|Plants restrain creatures in a 20 ft square, STR save|PHB
Expeditious Retreat|1|Tra|BA|Self|VS|10 minutes|c|AKSW|Dash as a bonus action each turn|PHB
Faerie Fire|1|Evo|A|60 ft|V|1 minute|c|ABD|Outline creatures in light; attacks against them have advantage, DEX save|PHB
False Life|1|Nec|A|Self|VSM|1 hour||ASW|Gain 1d4 + 4 temporary HP|PHB
Feather Fall|1|Tra|R|60 ft|VM|1 minute||ABSW|Up to five falling creatures descend slowly|PHB
Find Familiar|1|Con|1h|10 ft|VSM|Instantaneous|r|W|Summon a familiar spirit|PHB
Fog Cloud|1|Con|A|120 ft|VS|1 hour|c|DRSW|20 ft radius sphere of heavy obscurement|PHB
Goodberry|1|Tra|A|Touch|VSM|Instantaneous||DR|Ten berries that each heal 1 HP and nourish|PHB
Grease|1|Con|A|60 ft|VSM|1 minute||AW|Slick 10 ft square; DEX save or fall prone|PHB
Guiding Bolt|1|Evo|A|120 ft|VS|1 round||C|Ranged spell attack, 4d6 radiant; next attack against it has advantage|PHB
Hail of Thorns|1|Con|BA|Self|V|1 minute|c|R|Next ranged hit explodes: 1d10 piercing, DEX save half|PHB
Healing Word|1|Evo|BA|60 ft|V|Instantaneous||ABCD|Heal 1d4 + spellcasting modifier|PHB
Hellish Rebuke|1|Evo|R|60 ft|VS|Instantaneous||K|2d10 fire to a creature that damaged you, DEX save half|PHB
Heroism|1|Enc|A|Touch|VS|1 minute|c|BP|Immune to fear; temp HP each turn equal to your modifier|PHB
Hex|1|Enc|BA|90 ft|VSM|1 hour|c|K|+1d6 necrotic on your hits; disadvantage on one ability's checks|PHB
Hunter's Mark|1|Div|BA|90 ft|V|1 hour|c|R|+1d6 damage on your weapon hits; advantage to track|PHB
Ice Knife|1|Con|A|60 ft|SM|Instantaneous||DSW|Ranged spell attack, 1d10 piercing; then 2d6 cold explosion, DEX save|XGE
Identify|1|Div|1m|Touch|VSM|Instantaneous|r|ABW|Learn a magic item's properties|PHB
Illusory Script|1|Ill|1m|Touch|SM|10 days|r|BKW|Write a secret message only chosen creatures can read|PHB
Inflict Wounds|1|Nec|A|Touch|VS|Instantaneous||C|Melee spell attack, 3d10 necrotic|PHB
Jump|1|Tra|A|Touch|VSM|1 minute||ADRSW|Triple jump distance|PHB
Longstrider|1|Tra|A|Touch|VSM|1 hour||ABDRW|+10 ft speed|PHB
Mage Armor|1|Abj|A|Touch|VSM|8 hours||SW|AC becomes 13 + DEX without armor|PHB
Magic Missile|1|Evo|A|120 ft|VS|Instantaneous||SW|Three darts, each 1d4 + 1 force, always hit|PHB
Nathair's Mischief|2|Ill|A|60 ft|SM|1 minute|c|ABSW|Fey illusion cube: charm, blind or difficult terrain effects|FTD
Protection from Evil and Good|1|Abj|A|Touch|VSM|10 minutes|c|CKPW|Protection from aberrations, celestials, elementals, fey, fiends and undead|PHB
Purify Food and Drink|1|Tra|A|10 ft|VS|Instantaneous|r|ACDP|Remove poison and disease from food and drink|PHB
Ray of Sickness|1|Nec|A|60 ft|VS|Instantaneous||SW|Ranged spell attack, 2d8 poison; poisoned (CON save)|PHB
Sanctuary|1|Abj|BA|30 ft|VSM|1 minute||AC|Attackers must make a WIS save or pick another target|PHB
Searing Smite|1|Evo|BA|Self|V|1 minute|c|PR|Next hit +1d6 fire; target burns 1d6 each turn until a CON save|PHB
Shield|1|Abj|R|Self|VS|1 round||SW|+5 AC until your next turn; immune to magic missile|PHB
Shield of Faith|1|Abj|BA|60 ft|VSM|10 minutes|c|CP|+2 AC|PHB
Silent Image|1|Ill|A|60 ft|VSM|10 minutes|c|BSW|Visual illusion up to a 15 ft cube|PHB
Sleep|1|Enc|A|90 ft|VSM|1 minute||BSW|Put 5d8 HP of creatures to sleep|PHB
Snare|1|Abj|1m|Touch|SM|8 hours||ADRW|Magical trap that hoists a creature (DEX save)|XGE
Speak with Animals|1|Div|A|Self|VS|10 minutes|r|BDR|Talk with beasts|PHB
Tasha's Caustic Brew|1|Evo|A|Self (30 ft line)|VSM|1 minute|c|ASW|Acid coats creatures: 2d4 acid each turn, DEX save|TCE
Tasha's Hideous Laughter|1|Enc|A|30 ft|VSM|1 minute|c|BW|Target falls prone laughing, incapacitated, WIS save|PHB
Tenser's Floating Disk|1|Con|A|30 ft|VSM|1 hour|r|W|Floating disk carries 500 lb|PHB
Thunderous Smite|1|Evo|BA|Self|V|1 minute|c|P|Next melee hit +2d6 thunder; push 10 ft and prone (STR save)|PHB
Thunderwave|1|Evo|A|Self (15 ft cube)|VS|Instantaneous||ABDSW|2d8 thunder and push 10 ft, CON save half|PHB
Unseen Servant|1|Con|A|60 ft|VSM|1 hour|r|BKW|Invisible force performs simple tasks|PHB
Witch Bolt|1|Evo|A|30 ft|VSM|1 minute|c|KSW|Ranged spell attack, 1d12 lightning; repeat as an action|PHB
Wrathful Smite|1|Evo|BA|Self|V|1 minute|c|P|Next melee hit +1d6 psychic; frightened (WIS save)|PHB
Zephyr Strike|1|Tra|BA|Self|V|1 minute|c|R|Move without provoking; one attack with advantage and +1d8 force|XGE
Aganazzar's Scorcher|2|Evo|A|30 ft line|VSM|Instantaneous||SW|3d8 fire in a line, DEX save half|XGE
Aid|2|Abj|A|30 ft|VSM|8 hours||ACPR|Up to three creatures gain +5 max and current HP|PHB
Alter Self|2|Tra|A|Self|VS|1 hour|c|ASW|Aquatic adaptation, change appearance, or natural weapons|PHB
Animal Messenger|2|Enc|A|30 ft|VSM|24 hours|r|BDR|A Tiny beast delivers a message|PHB
Arcane Lock|2|Abj|A|Touch|VSM|Until dispelled||AW|Magically lock a door or container|PHB
Augury|2|Div|1m|Self|VSM|Instantaneous|r|C|Omen of weal or woe for a plan in the next 30 minutes|PHB
Barkskin|2|Tra|A|Touch|VSM|1 hour|c|DR|Target's AC can't be lower than 16|PHB
Beast Sense|2|Div|A|Touch|S|1 hour|cr|DR|See and hear through a beast's senses|PHB
Blindness/Deafness|2|Nec|A|30 ft|V|1 minute||BCSW|Blind or deafen a creature, CON save|PHB
Blur|2|Ill|A|Self|V|1 minute|c|ASW|Attacks against you have disadvantage|PHB
Branding Smite|2|Evo|BA|Self|V|1 minute|c|P|Next weapon hit +2d6 radiant; target visible|PHB
Calm Emotions|2|Enc|A|60 ft|VS|1 minute|c|BC|Suppress charm, fear or hostility, CHA save|PHB
Cloud of Daggers|2|Con|A|60 ft|VSM|1 minute|c|BKSW|5 ft cube of daggers, 4d4 slashing|PHB
Continual Flame|2|Evo|A|Touch|VSM|Until dispelled||ACW|Permanent heatless flame|PHB
Cordon of Arrows|2|Tra|A|5 ft|VSM|8 hours||R|Arrows guard an area: 1d6 piercing, DEX save|PHB
Crown of Madness|2|Enc|A|120 ft|VS|1 minute|c|BKSW|Charm a humanoid into attacking others, WIS save|PHB
Darkness|2|Evo|A|60 ft|VM|10 minutes|c|KSW|15 ft sphere of magical darkness|PHB
Darkvision|2|Tra|A|Touch|VSM|8 hours||ADRSW|Darkvision 60 ft|PHB
Detect Thoughts|2|Div|A|Self|VSM|1 minute|c|BSW|Read surface thoughts, WIS save to probe deeper|PHB
Dragon's Breath|2|Tra|BA|Touch|VSM|1 minute|c|ASW|Target can exhale 3d6 elemental breath, DEX save half|XGE
Dust Devil|2|Con|A|60 ft|VSM|1 minute|c|DSW|Whirlwind deals 1d8 bludgeoning and pushes, STR save|XGE
Earthbind|2|Tra|A|300 ft|V|1 minute|c|DKSW|Flying creature's speed becomes 0 and it descends, STR save|XGE
Enhance Ability|2|Tra|A|Touch|VSM|1 hour|c|ABCDRS|Advantage on checks with one ability, plus a bonus effect|PHB
Enlarge/Reduce|2|Tra|A|30 ft|VSM|1 minute|c|ASW|Grow (+1d4 damage) or shrink (−1d4) a creature, CON save|PHB
Enthrall|2|Enc|A|60 ft|VS|1 minute||BK|Creatures have disadvantage on Perception vs others, WIS save|PHB
Find Steed|2|Con|10m|30 ft|VS|Instantaneous||P|Summon an intelligent loyal steed|PHB
Find Traps|2|Div|A|120 ft|VS|Instantaneous||CDR|Sense traps within line of sight|PHB
Flame Blade|2|Evo|BA|Self|VSM|10 minutes|c|D|Fiery blade: melee spell attack 3d6 fire|PHB
Flaming Sphere|2|Con|A|60 ft|VSM|1 minute|c|DW|Rolling sphere, 2d6 fire, DEX save half|PHB
Gentle Repose|2|Nec|A|Touch|VSM|10 days|r|ACPW|Preserve a corpse from decay and undeath|PHB
Gust of Wind|2|Evo|A|Self (60 ft line)|VSM|1 minute|c|DRSW|Strong wind pushes creatures 15 ft, STR save|PHB
Healing Spirit|2|Con|BA|60 ft|VS|1 minute|c|DR|Spirit heals 1d6 to creatures that enter its space|XGE
Heat Metal|2|Tra|A|60 ft|VSM|1 minute|c|ABD|Metal object glows red-hot: 2d8 fire each turn|PHB
Hold Person|2|Enc|A|60 ft|VSM|1 minute|c|BCDKSW|Paralyze a humanoid, WIS save|PHB
Invisibility|2|Ill|A|Touch|VSM|1 hour|c|ABKSW|Target becomes invisible until it attacks or casts|PHB
Knock|2|Tra|A|60 ft|V|Instantaneous||BSW|Unlock a door or container (loud)|PHB
Lesser Restoration|2|Abj|A|Touch|VS|Instantaneous||ABCDPR|End blinded, deafened, paralyzed, poisoned or a disease|PHB
Levitate|2|Tra|A|60 ft|VSM|10 minutes|c|ASW|Float a creature or object up to 20 ft, CON save|PHB
Locate Animals or Plants|2|Div|A|Self|VSM|Instantaneous|r|BDR|Find the nearest beast or plant of a kind within 5 miles|PHB
Locate Object|2|Div|A|Self|VSM|10 minutes|c|BCDPRW|Sense the direction of a known object within 1,000 ft|PHB
Magic Mouth|2|Ill|1m|30 ft|VSM|Until dispelled|r|ABW|Object speaks a message when triggered|PHB
Magic Weapon|2|Tra|BA|Touch|VS|1 hour|c|APRW|Weapon becomes +1|PHB
Maximilian's Earthen Grasp|2|Tra|A|30 ft|VSM|1 minute|c|SW|Earthen hand restrains, 2d6 bludgeoning, STR save|XGE
Melf's Acid Arrow|2|Evo|A|90 ft|VSM|Instantaneous||AW|Ranged spell attack, 4d4 acid now and 2d4 next turn|PHB
Mind Spike|2|Div|A|60 ft|S|1 hour|c|KSW|3d8 psychic, WIS save half; you track the target|XGE
Mirror Image|2|Ill|A|Self|VS|1 minute||KSW|Three illusory duplicates absorb attacks|PHB
Misty Step|2|Con|BA|Self|V|Instantaneous||KSW|Teleport up to 30 ft|PHB
Moonbeam|2|Evo|A|120 ft|VSM|1 minute|c|D|Beam of light: 2d10 radiant, CON save half|PHB
Nystul's Magic Aura|2|Ill|A|Touch|VSM|24 hours||W|Disguise a creature's or object's magical aura|PHB
Pass without Trace|2|Abj|A|Self|VSM|1 hour|c|DR|You and allies within 30 ft gain +10 Stealth|PHB
Phantasmal Force|2|Ill|A|60 ft|VSM|1 minute|c|BKSW|Illusion only the target perceives; 1d6 psychic, INT save|PHB
Prayer of Healing|2|Evo|10m|30 ft|V|Instantaneous||C|Up to six creatures heal 2d8 + spellcasting modifier|PHB
Protection from Poison|2|Abj|A|Touch|VS|1 hour||ACDPR|Neutralize poison; advantage and resistance vs poison|PHB
Pyrotechnics|2|Tra|A|60 ft|VS|Instantaneous||ABSW|Turn a fire into fireworks (blind) or smoke|XGE
Ray of Enfeeblement|2|Nec|A|60 ft|VS|1 minute|c|KW|Ranged spell attack; target deals half damage with STR weapons|PHB
Rime's Binding Ice|2|Evo|A|Self (30 ft cone)|SM|Instantaneous||SW|3d8 cold, CON save half; speed 0 on a fail|FTD
Rope Trick|2|Tra|A|Touch|VSM|1 hour||W|Extradimensional hideout up a rope|PHB
Scorching Ray|2|Evo|A|120 ft|VS|Instantaneous||SW|Three rays, ranged spell attack, 2d6 fire each|PHB
See Invisibility|2|Div|A|Self|VSM|1 hour||ABSW|See invisible and ethereal creatures|PHB
Shadow Blade|2|Ill|BA|Self|VS|1 minute|c|KSW|Shadow sword: 2d8 psychic, finesse, light, thrown|XGE
Shatter|2|Evo|A|60 ft|VSM|Instantaneous||BKSW|3d8 thunder in a 10 ft sphere, CON save half|PHB
Silence|2|Ill|A|120 ft|VS|10 minutes|cr|BCR|20 ft sphere of silence|PHB
Skywrite|2|Tra|A|Sight|VS|1 hour|cr|ABDW|Write words in the clouds|XGE
Snilloc's Snowball Swarm|2|Evo|A|90 ft|VSM|Instantaneous||SW|3d6 cold in a 5 ft sphere, DEX save half|XGE
Spider Climb|2|Tra|A|Touch|VSM|1 hour|c|AKSW|Climb walls and ceilings|PHB
Spike Growth|2|Tra|A|150 ft|VSM|10 minutes|c|DR|Thorny ground: 2d4 piercing per 5 ft moved|PHB
Spiritual Weapon|2|Evo|BA|60 ft|VS|1 minute||C|Floating weapon: bonus-action melee spell attack, 1d8 + modifier force|PHB
Suggestion|2|Enc|A|30 ft|VM|8 hours|c|BKSW|Suggest a reasonable course of action, WIS save|PHB
Summon Beast|2|Con|A|90 ft|VSM|1 hour|c|DR|Summon a bestial spirit (air, land or water)|TCE
Tasha's Mind Whip|2|Enc|A|90 ft|V|1 round||SW|3d6 psychic, INT save half; limits its next turn|TCE
Warding Bond|2|Abj|A|Touch|VSM|1 hour||CP|Target gains +1 AC and saves and resistance; you share its damage|PHB
Warding Wind|2|Evo|A|Self|V|10 minutes|c|BDSW|Strong wind around you: deafens, disadvantage on ranged attacks|XGE
Web|2|Con|A|60 ft|VSM|1 hour|c|ASW|Sticky webs restrain creatures, DEX save|PHB
Zone of Truth|2|Enc|A|60 ft|VS|10 minutes||BCP|Creatures can't lie in a 15 ft sphere, CHA save|PHB
Animate Dead|3|Nec|1m|10 ft|VSM|Instantaneous||CW|Raise a skeleton or zombie servant|PHB
Ashardalon's Stride|3|Tra|BA|Self|VS|1 minute|c|ARSW|+20 ft speed; 1d6 fire to creatures you move near|FTD
Aura of Vitality|3|Evo|A|Self (30 ft)|V|1 minute|c|CDP|Bonus action each turn: heal a creature in the aura 2d6|PHB
Beacon of Hope|3|Abj|A|30 ft|VS|1 minute|c|C|Advantage on WIS and death saves; healing is maximized|PHB
Bestow Curse|3|Nec|A|Touch|VS|1 minute|c|BCW|Curse a creature (disadvantage, +1d8 necrotic, or lost actions), WIS save|PHB
Blinding Smite|3|Evo|BA|Self|V|1 minute|c|P|Next melee hit +3d8 radiant; blinded (CON save)|PHB
Blink|3|Tra|A|Self|VS|1 minute||ASW|Roll each turn to vanish into the Ethereal Plane|PHB
Call Lightning|3|Con|A|120 ft|VS|10 minutes|c|D|Storm cloud: each turn call a bolt for 3d10 lightning, DEX save half|PHB
Catnap|3|Enc|A|30 ft|SM|10 minutes||ABSW|Up to three creatures gain a short rest in 10 minutes|XGE
Clairvoyance|3|Div|10m|1 mile|VSM|10 minutes|c|BCSW|Invisible sensor to see or hear a distant place|PHB
Conjure Animals|3|Con|A|60 ft|VS|1 hour|c|DR|Summon fey spirits as beasts|PHB
Conjure Barrage|3|Con|A|Self (60 ft cone)|VSM|Instantaneous||R|Copies of a weapon deal 3d8, DEX save half|PHB
Counterspell|3|Abj|R|60 ft|S|Instantaneous||KSW|Interrupt a spell; higher levels need a check|PHB
Create Food and Water|3|Con|A|30 ft|VS|Instantaneous||CP|Food and water for 15 creatures for a day|PHB
Crusader's Mantle|3|Evo|A|Self|V|1 minute|c|P|Allies within 30 ft deal +1d4 radiant with weapons|PHB
Daylight|3|Evo|A|60 ft|VS|1 hour||CDPRS|60 ft sphere of bright light|PHB
Dispel Magic|3|Abj|A|120 ft|VS|Instantaneous||ABCDKPSW|End spells of 3rd level or lower (check for higher)|PHB
Elemental Weapon|3|Tra|A|Touch|VS|1 hour|c|ADPR|Weapon gains +1 and +1d4 elemental damage|PHB
Enemies Abound|3|Enc|A|120 ft|VS|1 minute|c|BKSW|Target treats everyone as an enemy, INT save|XGE
Erupting Earth|3|Tra|A|120 ft|VSM|Instantaneous||DSW|3d12 bludgeoning in a 20 ft cube, DEX save half|XGE
Fear|3|Ill|A|Self (30 ft cone)|VSM|1 minute|c|BKSW|Creatures drop items and flee, WIS save|PHB
Feign Death|3|Nec|A|Touch|VSM|1 hour|r|BCDW|Willing creature appears dead|PHB
Fireball|3|Evo|A|150 ft|VSM|Instantaneous||SW|8d6 fire in a 20 ft sphere, DEX save half|PHB
Flame Arrows|3|Tra|A|Touch|VS|1 hour|c|ADRSW|Ammunition deals +1d6 fire|XGE
Fly|3|Tra|A|Touch|VSM|10 minutes|c|AKSW|Target gains 60 ft flying speed|PHB
Gaseous Form|3|Tra|A|Touch|VSM|1 hour|c|KSW|Turn a creature into mist|PHB
Glyph of Warding|3|Abj|1h|Touch|VSM|Until dispelled||ABCW|Magical trap: 5d8 explosion (DEX half) or stored spell|PHB
Haste|3|Tra|A|30 ft|VSM|1 minute|c|ASW|+2 AC, double speed, extra limited action; lethargy after|PHB
Hunger of Hadar|3|Con|A|150 ft|VSM|1 minute|c|K|Void: blinded, 2d6 cold at start and 2d6 acid at end of turns|PHB
Hypnotic Pattern|3|Ill|A|120 ft|SM|1 minute|c|BKSW|Charm and incapacitate creatures in a 30 ft cube, WIS save|PHB
Intellect Fortress|3|Abj|A|30 ft|V|1 hour|c|ABKSW|Resistance to psychic and advantage on INT, WIS, CHA saves|TCE
Leomund's Tiny Hut|3|Evo|1m|Self (10 ft)|VSM|8 hours|r|BW|Dome shelter that keeps others out|PHB
Life Transference|3|Nec|A|30 ft|VS|Instantaneous||CW|Take 4d8 necrotic; a creature heals twice that|XGE
Lightning Arrow|3|Tra|BA|Self|VS|1 minute|c|R|Next ranged attack becomes lightning: 4d8, plus 2d8 burst|PHB
Lightning Bolt|3|Evo|A|Self (100 ft line)|VSM|Instantaneous||SW|8d6 lightning in a line, DEX save half|PHB
Magic Circle|3|Abj|1m|10 ft|VSM|1 hour||CKPW|Cylinder that hinders a creature type|PHB
Major Image|3|Ill|A|120 ft|VSM|10 minutes|c|BKSW|Full sensory illusion up to a 20 ft cube|PHB
Mass Healing Word|3|Evo|BA|60 ft|V|Instantaneous||BC|Up to six creatures heal 1d4 + spellcasting modifier|PHB
Meld into Stone|3|Tra|A|Touch|VS|8 hours|r|CDR|Step into stone|PHB
Melf's Minute Meteors|3|Evo|A|Self|VSM|10 minutes|c|SW|Six meteors: bonus action to send two, 2d6 fire each, DEX save half|XGE
Nondetection|3|Abj|A|Touch|VSM|8 hours||BRW|Hide a target from divination|PHB
Phantom Steed|3|Ill|1m|30 ft|VS|1 hour|r|W|Quasi-real horse with 100 ft speed|PHB
Plant Growth|3|Tra|A|150 ft|VS|Instantaneous||BDR|Overgrowth difficult terrain or enrich crops|PHB
Protection from Energy|3|Abj|A|Touch|VS|1 hour|c|ACDRSW|Resistance to one energy type|PHB
Remove Curse|3|Abj|A|Touch|VS|Instantaneous||CKPW|End curses on a creature or object|PHB
Revivify|3|Nec|A|Touch|VSM|Instantaneous||ACDPR|Return a creature dead under a minute to 1 HP (300 gp diamonds)|PHB
Sending|3|Evo|A|Unlimited|VSM|1 round||BCW|Send a 25-word message to a known creature|PHB
Sleet Storm|3|Con|A|150 ft|VSM|1 minute|c|DSW|Freezing sleet: difficult terrain, prone, concentration checks|PHB
Slow|3|Tra|A|120 ft|VSM|1 minute|c|SW|Up to six creatures: −2 AC and DEX saves, half speed, fewer actions, WIS save|PHB
Speak with Dead|3|Nec|A|10 ft|VSM|10 minutes||BCW|Ask a corpse five questions|PHB
Speak with Plants|3|Tra|A|Self|VS|10 minutes||BDR|Talk with plants|PHB
Spirit Guardians|3|Con|A|Self (15 ft)|VSM|10 minutes|c|C|Spirits slow enemies and deal 3d8 radiant or necrotic, WIS save half|PHB
Spirit Shroud|3|Nec|BA|Self|VS|1 minute|c|CKPW|Your hits deal +1d8 radiant, necrotic or cold; nearby foes slowed|TCE
Stinking Cloud|3|Con|A|90 ft|VSM|1 minute|c|BSW|Nauseating gas: lose actions, CON save|PHB
Summon Fey|3|Con|A|90 ft|VSM|1 hour|c|DKRW|Summon a fey spirit (fuming, mirthful or tricksy)|TCE
Summon Lesser Demons|3|Con|A|60 ft|VSM|1 hour|c|KW|Summon hostile demons|XGE
Summon Shadowspawn|3|Con|A|90 ft|VSM|1 hour|c|KW|Summon a shadow spirit (fury, despair or fear)|TCE
Summon Undead|3|Nec|A|90 ft|VSM|1 hour|c|KW|Summon an undead spirit (ghostly, putrid or skeletal)|TCE
Thunder Step|3|Con|A|90 ft|V|Instantaneous||KSW|Teleport with an ally; 3d10 thunder where you left, CON save half|XGE
Tidal Wave|3|Con|A|Sight|VSM|Instantaneous||DSW|4d8 bludgeoning wave and prone, DEX save half|XGE
Tiny Servant|3|Tra|1m|Touch|VS|8 hours||AW|Animate a Tiny object as a servant|XGE
Tongues|3|Div|A|Touch|VM|1 hour||BCKSW|Understand and speak any language|PHB
Vampiric Touch|3|Nec|A|Self|VS|1 minute|c|KSW|Melee spell attack, 3d6 necrotic; heal half the damage|PHB
Wall of Sand|3|Evo|A|90 ft|VSM|10 minutes|c|W|Wall of sand blocks vision and slows|XGE
Wall of Water|3|Evo|A|60 ft|VSM|10 minutes|c|DSW|Wall of water hinders ranged attacks and fire|XGE
Water Breathing|3|Tra|A|30 ft|VSM|24 hours|r|ADRSW|Up to ten creatures breathe underwater|PHB
Water Walk|3|Tra|A|30 ft|VSM|1 hour|r|ACDRS|Walk on liquid surfaces|PHB
Wind Wall|3|Evo|A|120 ft|VSM|1 minute|c|DR|Wall of wind: 3d8 bludgeoning, STR save half; blocks missiles|PHB
`;

// Unearthed Arcana (2014-era) subclasses for Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk and Rogue that were never printed,
// plus the Mages of Strixhaven (Jul 2020) multiclass subclasses, added to every class that could take them.
// Skipped because they were later printed under the same or a renamed identity: Path of the Beast, Path of the Giant, College of Creation,
// College of Spirits, Twilight Domain, Circle of Stars, Circle of Wildfire, Arcane Archer, Cavalier, Samurai, Rune Knight,
// Psychic Warrior / Psi Knight (→ Psi Warrior), Way of the Ascendant Dragon, Way of the Astral Self, Way of Mercy, Phantom, Soulknife, Armorer.
// Summaries are written in our own words.
(() => {
  const C = DND.classes;
  const add = (cls, subs) => { if (C[cls]) Object.assign(C[cls].subclasses, subs); };

  // ======================= ARTIFICER =======================
  add('artificer', {
    uaarchivist: { name: 'Archivist (UA)', src: 'UA', ua: 'Artificer (Feb 2020)', spellMode: 'always',
      spells: { 3: ['Comprehend Languages', 'Dissonant Whispers'], 5: ['Detect Thoughts', 'Locate Object'], 9: ['Hypnotic Pattern', 'Tongues'], 13: ['Locate Creature', 'Phantasmal Killer'], 17: ['Legend Lore', 'Modify Memory'] },
      features: [
        [3, 'Tools of the Trade', "Proficiency with calligrapher's supplies and forger's kit (you get both). Scribing a spell scroll takes a quarter of the time and half the gold."],
        [3, 'Artificial Mind', 'Awaken a Tiny item as a spectral mind (darkvision 60 ft, sheds dim light). It grants two skill proficiencies tied to its material, and you can cast artificer spells as if from its space.', { max: 'max(1,int)', reset: 'long' }],
        [3, 'Information Overload', 'Action: a creature within 5 ft of your mind makes an INT save or takes 1d8 psychic and the next attack against it has advantage. Spend a slot for +2d8 (1st) and +1d8 per level above.', { col: 'action' }],
        [5, 'Mind Network', 'Creatures holding your infused items can talk telepathically with you and each other, even across planes.'],
        [5, 'Psychic Damage', 'Add your INT modifier (min +1) to psychic damage from your artificer spells and Information Overload.'],
        [15, 'Mind Overload', 'When Information Overload or an artificer spell deals psychic damage, the target makes an INT save or is stunned until the end of your next turn.', { max: '1', reset: 'long' }],
        [15, 'Infoportation', 'When you cast an artificer spell, teleport to an unoccupied space within 5 ft of your spectral mind or an infused item. Once free per long rest; again by spending a 2nd-level or higher slot.', { max: '1', reset: 'long' }]] }
  });

  // ======================= BARBARIAN =======================
  add('barbarian', {
    uawildsoul: { name: 'Path of the Wild Soul (UA)', src: 'UA', ua: 'Barbarian and Monk (Aug 2019)', features: [
      [3, 'Lingering Magic', 'Cast detect magic without a slot or components; you glow the colour of the school you sense.', { max: 'max(1,con)', reset: 'long', col: 'action' }],
      [3, 'Wild Surge', 'When you rage, roll a d8 for a magical effect (DC 8 + prof + CON): 1 necrotic burst 1d10 in 30 ft (temp HP equal to the total), 2 teleport 20 ft (again as a bonus action each turn), 3 1d4 flumph spirits that explode for 2d8 force (DEX save), 4 +2 AC and attackers take force damage = CON mod, 5 10-ft radius of difficult terrain, 6 WIS save or a creature has disadvantage attacking you, 7 your weapon deals psychic, gains light/thrown 20/60 and returns, 8 60-ft radiant line 2d8 (CON save or blinded).'],
      [6, 'Magic Reserves', 'Action: touch a creature and roll a d4 (d6 at 14th): it regains a spell slot of that level, or gains 5 × the roll in temp HP; you take 5 × the roll force damage.', { max: '1', reset: 'long', col: 'action' }],
      [10, 'Arcane Rebuke', 'Reaction while raging when a creature forces you to save: it takes 3d6 force damage.', { col: 'reaction' }],
      [14, 'Chaotic Fury', 'While raging, use a bonus action to reroll on the Wild Surge table and replace the current effect.', { col: 'bonus' }]] }
  });

  // ======================= BARD =======================
  add('bard', {
    uasatire: { name: 'College of Satire (UA)', src: 'UA', ua: 'Kits of Old (Jan 2016)', features: [
      [3, 'Bonus Proficiencies', "Thieves' tools, Sleight of Hand and one other skill of your choice."],
      [3, 'Tumbling Fool', 'Bonus action: until the end of the turn you get the Dash and Disengage benefits, a climb speed equal to your speed, and half damage from falls.', { col: 'bonus' }],
      [6, "Fool's Insight", 'Cast detect thoughts without a slot. A creature that fails the save also blurts out something embarrassing.', { max: 'max(1,cha)', reset: 'long', col: 'action' }],
      [14, "Fool's Luck", 'After failing a check, save or attack, spend a Bardic Inspiration and add the die. If that turns it into a success, the DM later subtracts the same number from one of your rolls; you can’t use this again until that happens.']] }
  });

  // ======================= CLERIC =======================
  add('cleric', {
    uacity: { name: 'City Domain (UA)', src: 'UA', ua: 'Modern Magic (Aug 2015)', spellMode: 'always',
      spells: { 1: ['Comprehend Languages', 'Remote Access'], 3: ['Find Vehicle', 'Heat Metal'], 5: ['Lightning Bolt', 'Protection from Ballistics'], 7: ['Locate Creature', 'Synchronicity'], 9: ['Commune with City', 'Shutdown'] },
      features: [
        [1, 'Bonus Proficiencies', 'Sidearms and land vehicles. You learn the On/Off cantrip.'],
        [1, 'Heart of the City', 'In a city, gain advantage on one CHA (Deception, Intimidation or Persuasion) check.', { max: 'max(1,wis)', reset: 'long' }],
        [2, 'Channel Divinity: Spirits of the City', 'Action: take control of city utilities and machines within 30 ft, or have the city knock a creature prone or restrain it (it escapes with an Athletics or Acrobatics check).', { col: 'action' }],
        [6, 'Block Watch', 'In a city, you have proficiency in Insight and Perception and double your proficiency bonus for them.'],
        [8, 'Divine Strike', 'Once per turn, a weapon hit deals +1d8 psychic damage (2d8 at 14th).'],
        [17, 'Express Transit', 'Teleport between two mass-transit stops in the same city.', { max: '1', reset: 'short' }]] },
    uaprotection: { name: 'Protection Domain (UA)', src: 'UA', ua: 'Cleric: Divine Domains (Mar 2017)', spellMode: 'always', profs: { armorCats: ['heavy'] },
      spells: { 1: ['Compelled Duel', 'Protection from Evil and Good'], 3: ['Aid', 'Protection from Poison'], 5: ['Protection from Energy', 'Slow'], 7: ['Guardian of Faith', "Otiluke's Resilient Sphere"], 9: ['Antilife Shell', 'Wall of Force'] },
      features: [
        [1, 'Bonus Proficiency', 'Heavy armor.'],
        [1, 'Shield of the Faithful', 'Reaction: impose disadvantage on an attack against a creature within 5 ft of you, if you can see both.', { col: 'reaction' }],
        [2, 'Channel Divinity: Radiant Defense', 'Action: ward an ally within 30 ft for 1 minute. The first creature to hit it takes 2d10 + your cleric level radiant damage.', { col: 'action' }],
        [6, 'Blessed Healer', 'When you heal another creature with a spell slot, you regain 2 + the spell’s level in HP.'],
        [8, 'Divine Strike', 'Once per turn, a weapon hit deals +1d8 radiant damage (2d8 at 14th).'],
        [17, 'Indomitable Defense', 'Resistance to two of bludgeoning, necrotic, piercing, radiant or slashing (change on a rest). Action: pass one of them to a creature you touch until your next rest.']] },
    uaunity: { name: 'Unity Domain (UA)', src: 'UA', ua: 'Subclasses, Part 2 (Feb 2020)', spellMode: 'always',
      spells: { 1: ['Heroism', 'Shield of Faith'], 3: ['Aid', 'Warding Bond'], 5: ['Beacon of Hope', 'Sending'], 7: ['Aura of Purity', 'Guardian of Faith'], 9: ['Greater Restoration', "Rary's Telepathic Bond"] },
      features: [
        [1, 'Emboldening Bond', 'Action: bond two willing creatures within 30 ft for 1 hour. While within 30 ft of each other, once per turn each can add a d4 to an attack, check or save. Again by spending a spell slot.', { max: '1', reset: 'long', col: 'action' }],
        [2, 'Channel Divinity: Shared Burden', 'Reaction when a creature you can see takes damage: split the damage among it and up to WIS mod willing creatures within 30 ft (each takes at least 1).', { col: 'reaction' }],
        [6, 'Protective Bond', 'When one bonded creature takes damage, the other can use its reaction to give it resistance to that damage.'],
        [8, 'Potent Spellcasting', 'Add WIS mod to cleric cantrip damage.'],
        [17, 'Enduring Unity', 'The bond works anywhere on the same plane. When one bonded creature drops to 0 HP, the other has advantage on rolls and resistance to all damage for 1 minute and can spend Hit Dice to heal it.']] },
    uafate: { name: 'Fate Domain (UA)', src: 'UA', ua: 'Wonders of the Multiverse (Mar 2022)', spellMode: 'always',
      spells: { 1: ['Dissonant Whispers', 'Heroism'], 3: ['See Invisibility', 'Warding Bond'], 5: ['Beacon of Hope', 'Clairvoyance'], 7: ['Death Ward', 'Divination'], 9: ['Commune', 'Geas'] },
      features: [
        [1, 'Omens and Portents', 'Cast augury without a slot or components; your divinations are 25% less likely to get no answer until your next long rest.', { max: '1', reset: 'long' }],
        [1, 'Ties That Bind', 'Touch a creature (WIS save to refuse) to bind it for 1 hour: you sense where it is, and once per turn when your spell damages or heals it, add a d6.', { max: 'prof', reset: 'long', col: 'action' }],
        [2, 'Channel Divinity: Strands of Fate', 'For up to 1 minute (concentration), use your reaction to give advantage or disadvantage on an attack or check you can see.', { col: 'action' }],
        [6, 'Insightful Striking', 'Bonus action on a creature within 30 ft: add 1d6 to your next attack against it, or subtract 1d6 from its next save against your spell.', { max: 'prof', reset: 'long', col: 'bonus' }],
        [8, 'Potent Spellcasting', 'Add WIS mod to cleric cantrip damage.'],
        [17, 'Visions of the Future', 'Cast foresight without a slot (lasts 1 minute).', { max: '1', reset: 'long', col: 'action' }]] }
  });

  // ======================= DRUID =======================
  add('druid', {
    uatwilight: { name: 'Circle of Twilight (UA)', src: 'UA', ua: 'Druid (Nov 2016)', features: [
      [2, "Harvest's Scythe", 'A pool of d10s equal to your druid level. When a spell deals damage, add up to half your druid level of them as necrotic. If the spell kills a hostile creature, you or an ally within 30 ft regains 2 HP per die spent (5 per die if it was undead).', { max: 'druid', reset: 'long', pool: true }],
      [6, 'Speech Beyond the Grave', 'Cast speak with dead without material components; you understand each other whatever the language or intelligence.', { max: '1', reset: 'short', col: 'action' }],
      [10, 'Watcher at the Threshold', 'Resistance to necrotic and radiant damage. Allies within 30 ft of you have advantage on death saves.'],
      [14, 'Paths of the Dead', 'Cast etherealness.', { max: '1', reset: 'short', col: 'action' }]] }
  });

  // ======================= FIGHTER =======================
  add('fighter', {
    uabrute: { name: 'Brute (UA)', src: 'UA', ua: 'Three Subclasses (Jan 2018)', features: [
      [3, 'Brute Force', 'Weapon hits with a proficient weapon deal +1d4 damage (1d6 at 10th, 1d8 at 16th, 1d10 at 20th).'],
      [7, 'Brutish Durability', 'Add 1d6 to your saving throws. If that makes a death save 20 or higher, it counts as a 20.'],
      [10, 'Additional Fighting Style', 'Choose a second Fighting Style.'],
      [15, 'Devastating Critical', 'On a critical hit with a weapon, add your fighter level to the damage.'],
      [18, 'Survivor', 'At the start of each of your turns, regain 5 + CON mod HP if you are at or below half HP (but above 0).']],
      choices: [{ level: 10, type: 'fightingStyle', n: 1 }] },
    uaknight: { name: 'Knight (UA)', src: 'UA', ua: 'Fighter (Dec 2016)', features: [
      [3, 'Born to the Saddle', 'Mounting or dismounting costs 5 ft of movement; advantage on saves to stay mounted; land on your feet after falling less than 10 ft from a mount.'],
      [3, 'Implacable Mark', 'A creature you hit in melee is marked until the end of your next turn: disadvantage on attacks against anyone but you. If it moves or attacks someone else while within 5 ft, you can make a melee attack against it with advantage (even without a reaction) for + your fighter level damage.', { max: '3', reset: 'short', col: 'reaction' }],
      [7, 'Noble Cavalry', 'Two skills from Animal Handling, History, Insight, Persuasion and Religion, or one language.'],
      [10, 'Hold the Line', 'Reaction when a creature moves within your reach: make a melee attack; on a hit, + half your fighter level damage and its speed becomes 0 this turn.', { col: 'reaction' }],
      [15, 'Rapid Strike', 'When you have advantage on a weapon attack, give it up to make an extra weapon attack against the same target as a bonus action.'],
      [18, "Defender's Blade", 'You can make opportunity attacks without spending your reaction (once per turn), and you get +1 AC in heavy armor.']] },
    uamonsterhunter: { name: 'Monster Hunter (UA)', src: 'UA', ua: 'Gothic Heroes (Apr 2016)', features: [
      [3, 'Bonus Proficiencies', 'Two skills from Arcana, History, Insight, Investigation, Nature and Perception, or one tool.'],
      [3, 'Combat Superiority', 'Superiority dice (four d8s; five at 7th, six at 15th; d10 at 10th, d12 at 18th). Spend one to add it to an attack roll, to damage (and the target has disadvantage on its next concentration save), to a Perception or Insight check, or to an INT/WIS/CHA save.', { max: 'tier(fighter,3,4,7,5,15,6)', reset: 'short' }],
      [3, "Hunter's Mysticism", 'Cast detect magic as a ritual and protection from evil and good once per long rest. Learn Abyssal, Celestial or Infernal.', { max: '1', reset: 'long' }],
      [7, 'Monster Slayer', 'You can spend up to two superiority dice on one damage roll; against aberrations, fey, fiends and undead they deal maximum damage.'],
      [15, 'Relentless', 'If you roll initiative with no superiority dice, regain one.']] },
    uasharpshooter: { name: 'Sharpshooter (UA)', src: 'UA', ua: 'Fighter (Dec 2016)', features: [
      [3, 'Steady Aim', 'Bonus action: aim at a creature in range. Until the end of the turn your ranged attacks against it ignore half and three-quarters cover and deal + (2 + half your fighter level) damage.', { max: '3', reset: 'short', col: 'bonus' }],
      [7, 'Careful Eyes', 'Search as a bonus action. Gain proficiency in Perception, Investigation or Survival.'],
      [10, 'Close-Quarters Shooting', 'No disadvantage on ranged attacks for being within 5 ft of an enemy; a creature you hit with a ranged attack within 5 ft can’t take reactions until the end of your turn.'],
      [15, 'Rapid Strike', 'When you have advantage on a weapon attack, give it up to make an extra weapon attack against the same target as a bonus action.'],
      [18, 'Snap Shot', 'On your first turn of a combat, the Attack action gets one extra ranged weapon attack.']] },
    uascout: { name: 'Scout (UA Fighter)', src: 'UA', ua: 'Kits of Old (Jan 2016)', features: [
      [3, 'Bonus Proficiencies', "Three skills from Acrobatics, Athletics, Investigation, Medicine, Nature, Perception, Stealth and Survival (thieves' tools can replace one)."],
      [3, 'Combat Superiority', 'Superiority dice (four d8s; five at 7th, six at 15th; d10 at 10th, d12 at 18th). Spend one to add half of it to an Athletics, Nature, Perception, Stealth or Survival check, add it to an attack roll, or as a reaction in light or medium armor add it to AC against a hit (half damage if it still hits).', { max: 'tier(fighter,3,4,7,5,15,6)', reset: 'short' }],
      [3, 'Natural Explorer', "Choose a favored terrain (another at 7th and 15th), with the ranger's travel and tracking benefits there."],
      [15, 'Relentless', 'If you roll initiative with no superiority dice, regain one.']] }
  });

  // ======================= MONK =======================
  add('monk', {
    uatranquility: { name: 'Way of Tranquility (UA)', src: 'UA', ua: 'Monk (Jan 2017)', features: [
      [3, 'Path of Tranquility', 'Action: cast sanctuary on yourself for 8 hours (DC 8 + prof + WIS). A creature that saves is immune for 1 hour. You must wait 1 minute after it ends to use it again.', { col: 'action' }],
      [3, 'Healing Hands', 'A pool of 10 × monk level HP. Action: touch a creature and restore HP, or spend 5 to cure a disease or poison. You can swap one Flurry of Blows strike for this.', { max: '10*monk', reset: 'long', pool: true, col: 'action' }],
      [6, 'Emissary of Peace', 'Advantage on CHA checks to calm violence or counsel peace. Gain Performance or Persuasion.'],
      [11, 'Douse the Flames of War', 'Action: touch a creature; WIS save (auto-success if it was damaged this turn) or it can’t attack or cast damaging spells for 1 minute, until it or its allies are attacked or hurt.', { col: 'action' }],
      [17, 'Anger of a Gentle Soul', 'Reaction when you see a creature drop to 0 HP: add your monk level to your damage until the end of your next turn.', { max: '1', reset: 'short', col: 'reaction' }]] }
  });

  // ======================= ROGUE =======================
  add('rogue', {
    uarevived: { name: 'Revived (UA)', src: 'UA', ua: 'Fighter, Ranger, and Rogue (Oct 2019)', features: [
      [3, 'Tokens of Past Lives', 'After each long rest, gain one skill or tool proficiency until your next long rest.'],
      [3, 'Revived Nature', 'Advantage on saves against disease and poison, resistance to poison. No need to eat, drink, breathe or sleep (4 hours of quiet rest instead).'],
      [3, 'Bolts from the Grave', 'After using Cunning Action, make a ranged spell attack (30 ft, DEX) that deals necrotic damage equal to your Sneak Attack; it uses your Sneak Attack for the turn.', { col: 'bonus' }],
      [9, 'Connect with the Dead', 'Cast speak with dead (INT). Afterwards gain a random language, skill or tool proficiency, or a saving throw proficiency until your next rest.', { max: '1', reset: 'short', col: 'action' }],
      [13, 'Audience with Death', 'Advantage on death saves. Each death save lets you ask Death one yes/no question. When you recover from 0 HP you may change a trait, ideal, bond or flaw.'],
      [17, 'Ethereal Jaunt', 'When you use Cunning Action, you can also teleport up to 30 ft, even without line of sight.']] }
  });

  // ======================= MAGES OF STRIXHAVEN (Jul 2020) =======================
  // Each is a subclass for several classes; its first features come at that class's subclass level.
  const strix = {
    lorehold: { cls: ['bard', 'warlock', 'wizard'], name: 'Mage of Lorehold (UA)', spells: { 1: ['Sacred Flame', 'Comprehend Languages'], 3: ['Knock', 'Locate Object'], 5: ['Speak with Dead', 'Spirit Guardians'], 7: ['Arcane Eye', 'Stone Shape'], 9: ['Destructive Wave', 'Legend Lore'] },
      first: [['Lorehold Spells', 'Learn sacred flame and comprehend languages, and more Lorehold spells as you level; they count as class spells and don’t count against spells known.'],
        ['Ancient Companion', 'After a rest, call a Healer, Sage or Warrior spirit into a statue. It has 5 + 5 × class level HP and AC 14 (16 Warrior) and acts right after you. Spend a slot to heal it 10 HP per slot level.']],
      later: [[6, 'Lessons of the Past', 'Your companion’s type grants a benefit: Healer raises your max HP and healing, Sage gives advantage on knowledge checks and extra force damage once per turn, Warrior lets you make a weapon attack after a radiant cantrip.'],
        [10, 'War Echoes', 'After an attack hits, the target makes a WIS save or becomes vulnerable to one damage type until the end of your next turn.', { max: 'prof', reset: 'long' }],
        [14, "History's Whims", 'Bonus action, 1 minute: each turn choose Luck (bonus on saves against damage), Resistance (to physical damage) or Swiftness (more movement). Again by spending a 4th-level slot.', { max: '1', reset: 'long', col: 'bonus' }]] },
    prismari: { cls: ['druid', 'sorcerer', 'wizard'], name: 'Mage of Prismari (UA)', spells: null,
      first: [['Creative Skills', 'Two skills from Acrobatics, Athletics, Nature and Performance.'],
        ['Kinetic Artistry', 'Dash as a bonus action with an elemental flourish: Boreal Sweep (walk on water; nearby creatures STR save or prone), Scorching Whirl (creatures within 5 ft DEX save or 1d4 + spell mod fire), or Thunderlight Jaunt (move through creatures without opportunity attacks).', { max: 'prof', reset: 'long', col: 'bonus' }]],
      later: [[6, 'Favored Medium', 'Choose cold, fire or lightning: resistance to it, and when you cast a spell of that type, chosen allies within 5 ft get the same resistance.'],
        [10, 'Focused Expression', 'When you deal damage of your Favored Medium, add 1d6 and a matching effect (slow, burn or shock).'],
        [14, 'Impeccable Physicality', 'Proficiency in DEX saves; a d20 roll of 9 or lower on them counts as 10.']] },
    quandrix: { cls: ['sorcerer', 'wizard'], name: 'Mage of Quandrix (UA)', spells: { 1: ['Guidance', 'Guiding Bolt'], 3: ['Enlarge/Reduce', 'Spike Growth'], 5: ['Aura of Vitality', 'Haste'], 7: ['Control Water', 'Freedom of Movement'], 9: ['Circle of Power', 'Passwall'] },
      first: [['Quandrix Spells', 'Learn guidance and guiding bolt, and more Quandrix spells as you level; they count as class spells and don’t count against spells known.'],
        ['Functions of Probability', 'When your spell targets a creature within 30 ft: Diminishing (WIS save or subtract a d6 from its next attack) or Supplemental (an ally adds a d6 to an attack or save).']],
      later: [[6, 'Velocity Shift', 'Reaction when a creature starts its turn or moves within 30 ft: CHA save or you teleport it to a space within 30 ft.', { max: 'prof', reset: 'long', col: 'reaction' }],
        [10, 'Null Equation', 'After you deal damage, the target makes a CON save or has disadvantage on STR/DEX saves and deals half weapon damage until your next turn.', { max: 'prof', reset: 'long' }],
        [14, 'Quantum Tunneling', 'Resistance to bludgeoning, piercing and slashing. Move through creatures and objects as difficult terrain, taking 1d10 force per 5 ft.']] },
    silverquill: { cls: ['bard', 'warlock', 'wizard'], name: 'Mage of Silverquill (UA)', spells: { 6: ['Darkness'] },
      first: [['Eloquent Apprentice', 'Learn sacred flame or vicious mockery (doesn’t count against cantrips known) and two skills from Deception, Insight, Intimidation, Performance and Persuasion.'],
        ['Silvery Barbs', 'Reaction when a creature you can see within 60 ft succeeds on a roll: it rerolls and uses the lower; an ally can then reroll one d20 within 1 minute. Again by spending a spell slot.', { max: '1', reset: 'long', col: 'reaction' }]],
      later: [[6, 'Inky Shroud', 'Learn darkness. Once per long rest cast it free; you see through it, and creatures that start their turn inside take 2d10 psychic.', { max: '1', reset: 'long', col: 'action' }],
        [10, 'Infusion of Eloquence', 'When your spell deals damage, you can make it psychic (target frightened) or radiant (target charmed) until your next turn, and add your proficiency bonus.'],
        [14, 'Word of Power', 'Choose Deadly Despair (Silvery Barbs also makes the target vulnerable to your next damage) or Selfless Invocation (give a creature resistance to an instance of damage; you take psychic damage equal to it).']] },
    witherbloom: { cls: ['druid', 'warlock'], name: 'Mage of Witherbloom (UA)', spells: { 1: ['Spare the Dying', 'Cure Wounds', 'Inflict Wounds'], 3: ['Lesser Restoration', 'Ray of Enfeeblement'], 5: ['Revivify', 'Vampiric Touch'], 7: ['Blight', 'Greater Restoration'], 9: ['Antilife Shell', 'Mass Cure Wounds'] },
      first: [['Witherbloom Spells', 'Learn spare the dying, cure wounds and inflict wounds, and more Witherbloom spells as you level; they count as class spells and don’t count against spells known.'],
        ['Essence Tap', 'Bonus action, 1 minute: Overgrowth (bonus action: spend a Hit Die to heal it + spell mod) or Withering Strike (your damage becomes necrotic and ignores resistance).', { max: 'prof', reset: 'long', col: 'bonus' }]],
      later: [[6, 'Witherbloom Brew', 'Each day brew prof-bonus potions (last 24 hours): Fortifying (resistance), Quickening (healing and ending a condition) or Toxifying (poisoned weapon).', { max: 'prof', reset: 'long' }],
        [10, 'Witherbloom Adept', 'Once per turn when your spell deals necrotic damage or restores HP, one target takes or regains extra equal to your proficiency bonus.'],
        [14, 'Withering Vortex', 'When your spell deals necrotic damage to a creature that isn’t undead or a construct, an ally within 30 ft regains HP equal to half of it.', { max: 'prof', reset: 'long' }]] }
  };
  // Spell levels in the tables are character spell levels; map them onto each class's level when that spell level unlocks.
  const SPELL_LV = { full: { 1: 1, 3: 5, 5: 9, 7: 13, 9: 17 }, pact: { 1: 1, 3: 5, 5: 9, 7: 13, 9: 17 } };
  Object.entries(strix).forEach(([k, s]) => s.cls.forEach(cls => {
    const c = C[cls]; if (!c) return;
    const lv0 = (c.sub && c.sub.level) || 1;
    let spells = null;
    if (s.spells) { spells = {}; Object.entries(s.spells).forEach(([sl, list]) => { const L = k === 'silverquill' ? 6 : Math.max(lv0, SPELL_LV.full[sl] || 1); spells[L] = (spells[L] || []).concat(list); }); }
    c.subclasses['uamage' + k] = Object.assign({ name: s.name, src: 'UA', ua: 'Mages of Strixhaven (Jul 2020)', features: s.first.map(([n, d, o]) => o ? [lv0, n, d, o] : [lv0, n, d]).concat(s.later) },
      spells ? { spellMode: 'always', spells } : {});
  }));
})();

// Unearthed Arcana (2014-era) subclasses for Paladin, Ranger, Sorcerer, Warlock and Wizard that were never printed,
// plus whole UA classes: The Mystic (Mar 2017) and The Ranger, Revised (Sep 2016).
// Skipped because they were later printed under the same or a renamed identity: Oath of Heroism (Oath of Glory), Deep Stalker ranger (Gloom Stalker),
// Psionic Soul (Aberrant Mind), Lurker in the Deep (Fathomless), Favored Soul (Divine Soul), Noble Genie (Genie), Lunar Magic (Lunar Sorcery), Order of Scribes.
(() => {
  const C = DND.classes;

  // ======================= PALADIN =======================
  Object.assign(C.paladin.subclasses, {
    uatreachery: { name: "Oath of Treachery (UA)", src: "UA", ua: "Paladin (Dec 2016)", spellMode: "always",
      spells: { 3: ["Charm Person", "Expeditious Retreat"], 5: ["Invisibility", "Mirror Image"], 9: ["Gaseous Form", "Haste"], 13: ["Confusion", "Greater Invisibility"], 17: ["Dominate Person", "Passwall"] },
      features: [
        [3, "Channel Divinity: Conjure Duplicate", "Action: create an illusory double within 30 ft for 1 minute (concentration). Move it 30 ft as a bonus action (stays within 120 ft); cast spells from its space; you have advantage on attacks against a creature that is within 5 ft of both you and the double and can see it."],
        [3, "Channel Divinity: Poison Strike", "Bonus action: poison a weapon or ammunition for 1 minute. The next hit deals extra poison damage of 2d10 + paladin level (20 + paladin level if the attack had advantage)."],
        [7, "Aura of Treachery", "Advantage on melee attacks against creatures with an ally within 5 ft of them. Treacherous Strike: when a creature within 5 ft misses you in melee, reaction to force it to reroll the attack against another creature of your choice within 5 ft of it (fails on creatures immune to charm).", { max: "3", reset: "short", col: "reaction" }],
        [15, "Blackguard's Escape", "Reaction after being hit: turn invisible and teleport up to 60 ft to a spot you can see; invisible until the end of your next turn or until you attack, deal damage or force a save.", { max: "1", reset: "short", col: "reaction" }],
        [20, "Icon of Deceit", "Action, 1 minute: invisible; a creature that damages you on its turn must make a WIS save (your spell DC) or you control its next action; when you have advantage on an attack roll, add your paladin level to the damage.", { max: "1", reset: "long", col: "action" }]] }
  });

  // ======================= RANGER =======================
  Object.assign(C.ranger.subclasses, {
    uaprimevalguardian: { name: "Primeval Guardian (UA)", src: "UA", ua: "Ranger and Rogue (Jan 2017)", spellMode: "always",
      spells: { 3: ["Entangle"], 5: ["Enhance Ability"], 9: ["Conjure Animals"], 13: ["Giant Insect"], 17: ["Insect Plague"] },
      features: [
        [3, "Guardian Magic", "Learn an extra ranger spell at 3rd (entangle), 5th (enhance ability), 9th (conjure animals), 13th (giant insect) and 17th (insect plague) level; they do not count against spells known."],
        [3, "Guardian Soul", "Bonus action: take a treelike guardian form (Large, speed 5 ft or lower, +5 ft reach, gain temp HP equal to half your ranger level at the start of each of your turns). Ends as a bonus action or when incapacitated."],
        [3, "Piercing Thorns", "Once per turn, one creature you hit with a weapon attack takes an extra 1d6 piercing damage."],
        [7, "Ancient Fortitude", "When you assume guardian form, your hit point maximum and current HP increase by 2 per ranger level until the form ends."],
        [11, "Rooted Defense", "While in guardian form, the ground within 30 ft is difficult terrain for your enemies."],
        [15, "Guardian Aura", "While in guardian form, allies that start their turn within 30 ft and are below half HP regain HP equal to half your ranger level (not undead or constructs)."]] }
  });

  // ======================= SORCERER =======================
  DND.options.uaOrdning = { label: "Mark of the Ordning (Giant Soul)", list: [
    ["Cloud Giant", "Spells: fog cloud, minor illusion (1st), invisibility (3rd). Soul of Lost Ostoria: after casting one, bonus action to teleport 10 ft + CON mod.", "Giant Soul (UA)"],
    ["Fire Giant", "Spells: burning hands, fire bolt (1st), flaming sphere (3rd). Soul of Lost Ostoria: add CON mod (min 1) to damage of these spells.", "Giant Soul (UA)"],
    ["Frost Giant", "Spells: armor of Agathys, ray of frost (1st), hold person (3rd). Soul of Lost Ostoria: after casting one, gain temp HP equal to CON mod (min 1); armor of Agathys gains that much extra.", "Giant Soul (UA)"],
    ["Hill Giant", "Spells: heroism, shillelagh (1st), enlarge/reduce (3rd). Soul of Lost Ostoria: after casting one, up to two creatures within 5 ft make a STR save or are pushed 5 + CON mod ft.", "Giant Soul (UA)"],
    ["Stone Giant", "Spells: entangle, resistance (1st), spike growth (3rd). Soul of Lost Ostoria: after casting one, +CON mod (min 1) AC until the end of your next turn.", "Giant Soul (UA)"],
    ["Storm Giant", "Spells: shocking grasp, thunderwave (1st), gust of wind (3rd). Soul of Lost Ostoria: after casting one, up to three creatures within 30 ft take lightning damage equal to CON mod (min 1).", "Giant Soul (UA)"]] };

  Object.assign(C.sorcerer.subclasses, {
    uaphoenix: { name: "Phoenix Sorcery (UA)", src: "UA", ua: "Sorcerer (Feb 2017)", features: [
      [1, "Ignite", "Action: ignite a flammable object you touch."],
      [1, "Mantle of Flame", "Bonus action, 1 minute: shed bright light 30 ft (dim 30 ft more); creatures that hit you in melee within 5 ft or touch you take fire damage equal to CHA mod; add CHA mod to fire damage you roll on your turn.", { max: "1", reset: "long", col: "bonus" }],
      [6, "Phoenix Spark", "Reaction when reduced to 0 HP: drop to 1 HP instead, and creatures within 10 ft take fire damage equal to half your sorcerer level + CHA mod. During Mantle of Flame this instead deals sorcerer level + 2 x CHA mod and ends the mantle.", { max: "1", reset: "long", col: "reaction" }],
      [14, "Nourishing Fire", "When you spend a spell slot on a spell that includes a fire damage roll, regain HP equal to the slot level + CHA mod."],
      [18, "Form of the Phoenix", "While under Mantle of Flame: 40 ft fly speed and hover, resistance to all damage, and Phoenix Spark deals an extra 20 fire damage to each creature."]] },
    uasea: { name: "Sea Sorcery (UA)", src: "UA", ua: "Sorcerer (Feb 2017)", features: [
      [1, "Soul of the Sea", "Breathe underwater; swim speed equal to your walking speed."],
      [1, "Curse of the Sea", "A cantrip that hits or forces a failed save curses the target until the end of your next turn. Once per turn a spell can trigger it: cold damage also cuts speed by 15 ft, lightning damage adds CHA mod damage, forced movement is 15 ft longer. A non-cantrip trigger ends the curse."],
      [6, "Watery Defense", "Resistance to fire damage. Reaction when you take weapon damage: reduce it by sorcerer level + CHA score, then move up to 30 ft without opportunity attacks.", { max: "1", reset: "short", col: "reaction" }],
      [14, "Shifting Form", "Opportunity attacks against you deal half damage; you can move through enemies' spaces and any gap 3 inches wide without squeezing while moving."],
      [18, "Water Soul", "No need to eat, drink or sleep; critical hits against you are normal hits; resistance to bludgeoning, piercing and slashing."]] },
    uastone: { name: "Stone Sorcery (UA)", src: "UA", ua: "Sorcerer (Feb 2017)", hpPerLevel: 1, profs: { armorCats: ["shield"], weaponCats: ["simple", "martial"] }, features: [
      [1, "Bonus Proficiencies", "Shields, simple weapons and martial weapons."],
      [1, "Metal Magic", "When you learn a sorcerer spell of 1st level or higher you can pick from compelled duel, the searing/thunderous/wrathful/branding/blinding/staggering smites, magic weapon and elemental weapon as sorcerer spells."],
      [1, "Stone's Durability", "+1 HP per sorcerer level (add by hand if not automatic). Action: while unarmored, base AC 13 + CON mod with stony skin until you end it as a bonus action, are incapacitated or don armor (shield allowed)."],
      [6, "Stone Aegis", "Bonus action: an ally within 60 ft reduces bludgeoning/piercing/slashing damage by 2 + sorcerer level / 4 for 1 minute. When a creature within 60 ft hits that ally in melee, reaction to teleport next to the attacker and make a melee weapon attack (extra 1d10 force on a hit, 2d10 at 11th, 3d10 at 17th)."],
      [14, "Stone's Edge", "When you cast a damaging spell, one creature it damaged takes extra force damage equal to half your sorcerer level (once per casting)."],
      [18, "Earth Master's Aegis", "Stone Aegis can protect up to three creatures."]] },
    uagiantsoul: { name: "Giant Soul (UA)", src: "UA", ua: "Giant Soul Sorcerer (Jun 2018)", hpPerLevel: 1,
      choices: [{ level: 1, type: "uaOrdning", n: 1 }], features: [
      [1, "Jotun Resilience", "+1 HP per sorcerer level (add by hand if not automatic)."],
      [1, "Mark of the Ordning", "Choose a giant type: you learn its two 1st-level spells at 1st level and its 3rd-level spell at 3rd level; they count as sorcerer spells and do not count against spells known."],
      [6, "Soul of Lost Ostoria", "A benefit whenever you cast one of your Mark of the Ordning spells (depends on giant type)."],
      [14, "Rage of Fallen Ostoria", "When you start casting a sorcerer spell with a slot, grow one size category for 1 minute: HP and HP max +1 per sorcerer level, +5 ft reach, +5 ft walking speed, advantage on STR checks and saves, melee weapon damage +CON mod (min 1).", { max: "tier(sorcerer,14,1,18,2)", reset: "short" }],
      [18, "Blessing of the All Father", "CON +2 (max 22). Rage of Fallen Ostoria can be used twice between rests (not more than once per turn); stacked uses are cumulative."]] }
  });

  // ======================= WARLOCK =======================
  // Pact of the Star Chain (Seeker patron) joins the Pact Boon list.
  if (!DND.options.pactBoon.list.some(e => e[0] === "Pact of the Star Chain"))
    DND.options.pactBoon.list.push(["Pact of the Star Chain", "A starlight chain: know augury (ritual, not counted); advantage on one INT check per short rest. Intended for Seeker warlocks.", "Seeker patron (UA)"]);

  Object.assign(C.warlock.subclasses, {
    uaundyinglight: { name: "The Undying Light (UA)", src: "UA", ua: "Light, Dark, Underdark! (Nov 2015)", spellMode: "expanded",
      spells: { 1: ["Burning Hands"], 3: ["Flaming Sphere"], 5: ["Daylight"], 7: ["Fire Shield"], 9: ["Flame Strike"] }, features: [
      [1, "Radiant Soul", "Resistance to radiant damage; add CHA mod to radiant and fire spell damage. Know the light and sacred flame cantrips (do not count against cantrips known)."],
      [6, "Searing Vengeance", "Instead of a death saving throw, spring up with half your HP max; hostile creatures within 30 ft take 10 + CHA mod radiant damage and are blinded until the end of your turn.", { max: "1", reset: "long" }],
      [10, "Radiant Resistance", "After a short or long rest gain temp HP equal to warlock level + CHA mod; up to five creatures you see gain half that."],
      [14, "Healing Light", "Bonus action: touch to heal 1d6 to 5d6 HP, drawing from a pool of 15d6 (regained on a long rest).", { max: "15", reset: "long", pool: true, col: "bonus" }]] },
    uaghost: { name: "The Ghost in the Machine (UA)", src: "UA", ua: "Modern Magic (Aug 2015)", features: [
      [1, "Expanded Spell List", "Modern Magic spells (on/off, infallible relay, remote access, arcane hacking, digital phantom, haywire, invisibility to cameras, conjure knowbot, system backdoor, shutdown, synchronicity) are added to your warlock list if your table uses Modern Magic. Not tracked by the sheet."],
      [1, "Information Surge", "Action: disable a computerized device within 30 ft until the end of your next turn (INT save if held or used).", { max: "1", reset: "short", col: "action" }],
      [6, "Wire Walk", "Bonus action: teleport along a hardwired network from a device you touch to another within line of sight.", { max: "1", reset: "short", col: "bonus" }],
      [10, "Personal Encryption", "Advantage on saves against scrying, thought reading and magical location; creatures targeting you with such effects without a save make the check at disadvantage."],
      [14, "Technovirus", "Action: melee spell attack against a humanoid; CON save or 8d10 psychic (half on success). On a fail, you can command it like the command spell.", { max: "1", reset: "long", col: "action" }]] },
    uaravenqueen: { name: "The Raven Queen (UA)", src: "UA", ua: "Warlock and Wizard (Feb 2017)", spellMode: "expanded",
      spells: { 1: ["False Life", "Sanctuary"], 3: ["Silence", "Spiritual Weapon"], 5: ["Feign Death", "Speak with Dead"], 7: ["Ice Storm", "Locate Creature"], 9: ["Commune", "Cone of Cold"] }, features: [
      [1, "Sentinel Raven", "A raven spirit obeys you telepathically (100 ft). Perched on your shoulder it gives darkvision 30 ft and a CHA-mod bonus to Perception; you can see and hear through it. If it is slain you have advantage on attacks against its killer for 24 hours. Recall it after a short or long rest."],
      [6, "Soul of the Raven", "Bonus action while the raven is on your shoulder: merge with it, becoming Tiny with the raven's speed, limited to Dash, Disengage, Dodge, Help, Hide or Search. Action to return to normal."],
      [10, "Raven's Shield", "Advantage on death saves, immune to frightened, resistance to necrotic damage."],
      [14, "Queen's Right Hand", "Cast finger of death once without a slot.", { max: "1", reset: "long" }]] },
    uaseeker: { name: "The Seeker (UA)", src: "UA", ua: "The Faithful (Aug 2016)", spellMode: "expanded",
      spells: { 1: ["Feather Fall", "Jump"], 3: ["Levitate", "Locate Object"], 5: ["Clairvoyance", "Sending"], 7: ["Arcane Eye", "Locate Creature"], 9: ["Legend Lore", "Passwall"] }, features: [
      [1, "Shielding Aurora", "Bonus action: until the end of your next turn, resistance to all damage, and hostile creatures ending their turn within 10 ft take radiant damage equal to warlock level + CHA mod.", { max: "1", reset: "short", col: "bonus" }],
      [3, "Pact Boon: Pact of the Star Chain", "Option for your Pact Boon: a starlight chain gives you augury as a ritual and advantage on one INT check per short rest."],
      [6, "Astral Refuge", "Action: slip into the Astral Plane and take two actions to cast spells that target only you, then return and end your turn."],
      [10, "Far Wanderer", "No need to breathe; resistance to fire and cold damage."],
      [14, "Astral Sequestration", "5-minute ritual: you and up to ten willing creatures shift to the Astral Plane and gain a short rest with no time passing.", { max: "1", reset: "long" }]] }
  });

  // ======================= WIZARD =======================
  DND.options.uaResonant = { label: "Resonant (Onomancy)", list: [
    ["Absorption", "Spell damaging the named target: gain 3d6 temp HP (4d6 at 10th, 5d6 at 14th).", "Onomancy (UA)"],
    ["Devastation", "Named creature has disadvantage on its first save against the spell.", "Onomancy (UA)"],
    ["Dissolution", "First damage the named creature takes from the spell: extra 2d8 force (3d8 at 10th, 4d8 at 14th).", "Onomancy (UA)"],
    ["Nullification", "Learn the other spells affecting the named target; INT check (DC 10 + spell level) to end one.", "Onomancy (UA)"],
    ["Puppetry", "First damage the named creature takes: knock it prone or move it 10 ft toward or away from you.", "Onomancy (UA)"],
    ["Sympathy", "Target the named creature even if you cannot see it or it has total cover (if in range).", "Onomancy (UA)"]] };

  Object.assign(C.wizard.subclasses, {
    uaartificer: { name: "Artificer (UA Wizard Tradition)", src: "UA", ua: "Eberron (Feb 2015)", features: [
      [2, "Infuse Potions", "10 minutes and a spell slot turn water into a potion (1st: climbing, growth, healing; 2nd: mind reading, greater healing; 3rd: invisibility, superior healing, water breathing; 4th: resistance). The slot is locked until the potion is drunk or a week passes; up to three potions."],
      [2, "Infuse Scrolls", "Use Arcane Recovery to scribe a scroll of a spell you know instead of regaining slots (spell level subtracted from the recovery until the scroll is used and you long rest)."],
      [6, "Infuse Weapons and Armor", "10 minutes and a slot make a temporary magic item for 8 hours: 2nd +1 ammunition (20), 3rd +1 weapon or shield, 4th +1 armor, 5th +2 weapon or ammunition, 6th +2 armor. One at a time; the slot is locked until it fades."],
      [10, "Superior Artificer", "Hold a second infused weapon/armor item, and one extra potion or scroll."],
      [14, "Master Artificer", "Craft one item from Magic Item Tables A or B in 1 week; rest 1 month before the next."]] },
    uainvention: { name: "School of Invention (UA)", src: "UA", ua: "Three Subclasses (Jan 2018)", profs: { armorCats: ["light"] }, features: [
      [2, "Tools of the Inventor", "Proficiency with two tools of your choice."],
      [2, "Arcanomechanical Armor", "Light armor proficiency. A magic suit (AC 12 + DEX, resistance to force damage) made from studded leather at the end of a long rest; only you can attune to it."],
      [2, "Reckless Casting", "Action: cast a random spell you do not have prepared. Roll a d10 on the cantrip table, or spend a slot and roll twice on that level's table (5th-level table for 6th+) and pick one. Results are wizard spells for you; a 10 means roll twice, but a second 10 wastes the action."],
      [6, "Alchemical Casting", "While attuned to your armor, spend an extra 1st-level slot to swap an acid/cold/fire/lightning/thunder damage type, or an extra 2nd-level slot to add 2d10 force damage against one target."],
      [10, "Prodigious Inspiration", "Bonus action: swap one prepared spell for another from your spellbook.", { max: "1", reset: "short", col: "bonus" }],
      [14, "Controlled Chaos", "When rolling on a Reckless Casting table for a non-cantrip, you may roll on the table one level higher than the slot spent."]] },
    ualoremaster: { name: "Lore Mastery (UA)", src: "UA", ua: "Warlock and Wizard (Feb 2017)", features: [
      [2, "Lore Master", "Double proficiency bonus on Arcana, History, Nature and Religion checks you are proficient in. Initiative can be an INT check instead of DEX."],
      [2, "Spell Secrets", "When you cast with a slot you can swap one damage type (acid, cold, fire, force, lightning, necrotic, radiant, thunder) for another, and once per rest change a spell's save to a different ability.", { max: "1", reset: "short" }],
      [6, "Alchemical Casting", "Spend an extra slot when casting: 1st adds 2d10 force damage to every target, 2nd extends range to 1 mile (range 30 ft or more), 3rd raises the save DC by 2."],
      [10, "Prodigious Memory", "Bonus action: swap one prepared spell for another from your spellbook.", { max: "1", reset: "short", col: "bonus" }],
      [14, "Master of Magic", "Bonus action: until the end of the turn you can cast one spell from any class list (of a level you have slots for, not prepared); it counts as a wizard spell.", { max: "1", reset: "long", col: "bonus" }]] },
    uaonomancy: { name: "Onomancy (UA)", src: "UA", ua: "Cleric, Druid, and Wizard (Oct 2019)", spellMode: "always", spells: { 2: ["Bane", "Bless"] },
      choices: [{ level: 6, type: "uaResonant", n: 2 }, { level: 10, type: "uaResonant", n: 2 }], features: [
      [2, "Bonus Proficiencies", "One language of your choice and calligrapher's tools."],
      [2, "Extract Name", "Bonus action: a creature within 60 ft makes a WIS save or is charmed until the end of your next turn and you learn its true name (or that it has none). On a success you cannot use this on it again.", { max: "max(1,int)", reset: "long", col: "bonus" }],
      [2, "Fateful Naming", "Bane and bless are always-prepared wizard spells; cast either without a slot by speaking one target's true name.", { max: "max(1,int)", reset: "long" }],
      [6, "Resonant Utterance", "Learn two Resonants; speak a target's true name while casting a wizard spell with a slot to apply one. Uses equal half your wizard level; you can swap one Resonant each level.", { max: "floor(wizard/2)", reset: "long" }],
      [10, "Inexorable Pronouncement", "Learn two more Resonants."],
      [14, "Relentless Naming", "When you speak a creature's true name while casting a damaging spell, you can make that spell deal force or psychic damage instead."]] },
    uapsionics: { name: "Psionics (UA)", src: "UA", ua: "Fighter, Rogue, and Wizard (Nov 2019)", features: [
      [2, "Psionic Focus", "A handheld object (not a weapon or magic item) that serves as your spellcasting focus; while carried, reroll 1s on psychic and force damage dice of your wizard spells. Recreate it with 1 hour of meditation."],
      [2, "Psionic Devotion", "Learn friends, mage hand or message (free cantrip); while carrying your focus you cast it as a bonus action with no components and an upgrade (friends: target not hostile afterwards; mage hand: invisible hand, bonus-action control; message: no gestures or whisper)."],
      [6, "Thought Form", "Bonus action, 10 minutes: become psionic energy. Cast spells without components that lack a gold cost; resistance to psychic and to nonmagical bludgeoning, piercing and slashing.", { max: "max(1,int)", reset: "long", col: "bonus" }],
      [10, "Empowered Psionics", "Add INT mod to psychic or force damage of a wizard spell against one target."],
      [10, "Mental Discipline", "Choose dominate person, scrying or telekinesis: add it to your spellbook, cast it without components, and once per long rest without a slot.", { max: "1", reset: "long" }],
      [14, "Thought Travel", "In Thought Form: fly at your walking speed and hover, and pass through creatures and objects as difficult terrain (1d10 force if you end a turn inside an object)."]] },
    uarunecrafter: { name: "Runecrafter (UA)", src: "UA", ua: "Giant Options (May 2022)", spellMode: "always", spells: { 2: ["Comprehend Languages"] }, features: [
      [2, "Runes of Understanding", "Comprehend languages is always prepared and can be cast without a slot."],
      [2, "Runic Empowerment", "When you cast with a slot, invoke one rune (one per spell): Life (a creature within 30 ft gains 5 x slot level temp HP), War (a creature within 30 ft is easier to hit: +half slot level to attack rolls against it until the end of your next turn) or Wind (speed +5 ft x slot level and no opportunity attacks until your next turn).", { max: "prof", reset: "long" }],
      [6, "Sigils of Warding", "Reaction when you fail a STR, DEX or CON save: spend a Runic Empowerment use to succeed instead."],
      [10, "Rune Maven", "Arcane Recovery also restores Runic Empowerment uses (up to half INT mod, rounded up, min 1)."],
      [14, "Engraved Enmity", "Bonus action: a creature within 60 ft makes a WIS save or is marked for 1 minute (concentration): disadvantage on saves against your spells, cannot be invisible, and a bonus action curses it so an ally's next hit deals +1d8 force. Regain by long rest or spending a 3rd-level or higher slot.", { max: "1", reset: "long", col: "bonus" }]] },
    uatechnomancy: { name: "Technomancy (UA)", src: "UA", ua: "Modern Magic (Aug 2015)", features: [
      [2, "Bonus Proficiencies", "Proficiency with sidearms and hacking tools (Modern Magic equipment)."],
      [2, "Technological Savant", "Replace your spellbook with an attuned storage device (tablet-grade or better); copying spells into it costs half."],
      [6, "Program Spell", "Store a spell in an electronic device (phone-grade or better) for 48 hours; activate it with an action; only you can trigger it. One device at a time.", { max: "1", reset: "long" }],
      [10, "Online Casting", "Cast single-target spells through networked cameras, phones and computers; range is measured from you to your device and from the target to its device.", { max: "max(1,int)", reset: "long" }],
      [14, "Chained Device", "A held or worn tablet-grade device can maintain your concentration on a spell for you.", { max: "1", reset: "long" }]] },
    uatheurgy: { name: "Theurgy (UA)", src: "UA", ua: "Wizard Revisited (Mar 2017)", features: [
      [2, "Divine Inspiration", "Choose a cleric domain from your deity's list (Knowledge and Light suit a theurgist)."],
      [2, "Arcane Initiate", "Whenever you gain a wizard level you can replace a spell you add to your spellbook with a domain spell of a level you can cast (then any cleric spell once all domain spells are added). They count as wizard spells but others cannot copy them."],
      [2, "Channel Arcana", "Use Divine Arcana or your domain's 2nd-level Channel Divinity option, using your wizard spell DC. Once per rest (twice at 6th, three times at 18th).", { max: "tier(wizard,2,1,6,2,18,3)", reset: "short" }],
      [2, "Channel Arcana: Divine Arcana", "Bonus action: your next spell gains +2 to its attack roll or save DC."],
      [6, "Arcane Acolyte", "Gain your domain's 1st-level benefits (no weapon or armor proficiencies)."],
      [10, "Arcane Priest", "Gain your domain's 6th-level benefits."],
      [14, "Arcane High Priest", "Gain your domain's 17th-level benefits."]] }
  });

  // ======================= THE MYSTIC (UA, Mar 2017) =======================
  const D = "Mystic (UA)";
  DND.options.uaTalent = { label: "Psionic Talent", list: [
    ["Beacon", "Bonus action: bright light in a 20 ft radius (dim 20 ft more) for 1 hour, any color.", D],
    ["Blade Meld", "Bonus action: a one-handed melee weapon becomes fused to your hand for 1 minute.", D],
    ["Blind Spot", "Action: a creature within 120 ft makes a WIS save or you are invisible to it until the end of your next turn.", D],
    ["Delusion", "Action: plant a false sound (1 minute) or a 5 ft image that only one creature within 60 ft perceives.", D],
    ["Energy Beam", "Action: 90 ft, DEX save or 1d8 acid, cold, fire, lightning or thunder (2d8 at 5th, 3d8 at 11th, 4d8 at 17th).", D],
    ["Light Step", "Bonus action: +10 ft walking speed this turn; standing up costs no movement.", D],
    ["Mind Meld", "Bonus action: telepathy with one willing creature within 120 ft until the end of the turn; recall one of its memories.", D],
    ["Mind Slam", "Action: 60 ft, CON save or 1d6 force and knocked prone if Large or smaller (scales by tier like other talents).", D],
    ["Mind Thrust", "Action: 120 ft, INT save or 1d10 psychic (2d10 at 5th, 3d10 at 11th, 4d10 at 17th).", D],
    ["Mystic Charm", "Action: a humanoid within 120 ft makes a CHA save or is charmed until the end of your next turn.", D],
    ["Mystic Hand", "Action: move or manipulate an object up to 10 lb within 30 ft.", D],
    ["Psychic Hammer", "Action: 120 ft, STR save or 1d6 force and moved 10 ft if Large or smaller (scales like Mind Slam).", D]] };

  DND.options.uaDiscipline = { label: "Psionic Discipline", list: [
    // Avatar
    ["Crown of Despair", "[Avatar] Focus: advantage on Intimidation. Crowned in Sorrow (1-7): CHA save, 1d8 psychic per point, no reactions. Call to Inaction (2, conc.): incapacitate after a minute of talk. Visions of Despair (3): 3d6 psychic, speed 0. Dolorous Mind (5, conc.): incapacitated, speed 0.", D],
    ["Crown of Disgust", "[Avatar] Focus: 5 ft difficult terrain around you for enemies. Eye of Horror (1-7): 1d6 psychic per point, can't approach. Wall of Repulsion (3, conc.). Visions of Disgust (5, conc.): 5d6 psychic and ongoing damage. World of Horror (7, conc.): 8d6 psychic, frightened.", D],
    ["Crown of Rage", "[Avatar] Focus: enemies within 5 ft attacking others have disadvantage. Primal Fury (1-7): 1d6 psychic per point, forced charge. Fighting Words (2, conc.). Mindless Courage (2). Punishing Fury (5, conc.): foes may counterattack when it attacks.", D],
    ["Mantle of Command", "[Avatar] Focus: reaction to move an ally half its speed. Coordinated Movement (2). Commander's Sight (2): allies get advantage on a target. Command to Strike (3): ally attacks as a reaction. Strategic Mind (5, conc.). Overwhelming Attack (7): five allies attack as reactions.", D],
    ["Mantle of Courage", "[Avatar] Focus: advantage on saves vs frightened for you and nearby allies. Incite Courage (2): end frightened on six creatures. Aura of Victory (1-7, conc.): temp HP when enemies drop. Pillar of Confidence (6): extra attack or Dash/Disengage action for six creatures.", D],
    ["Mantle of Fear", "[Avatar] Focus: advantage on Intimidation. Incite Fear (2, conc.): WIS save or frightened. Unsettling Aura (3, conc.): enemies pay extra movement approaching. Incite Panic (5, conc.): up to eight creatures, WIS saves each turn, random movement or melee.", D],
    ["Mantle of Fury", "[Avatar] Focus: +5 ft speed for you and allies starting within 10 ft. Incite Fury (2, conc.): +d4 melee damage for three allies. Mindless Charge (2). Aura of Bloodletting (3, conc.): advantage on melee for creatures within 60 ft. Overwhelming Fury (5, conc.): CHA save or only melee attacks.", D],
    ["Mantle of Joy", "[Avatar] Focus: advantage on Persuasion. Soothing Presence (1-7): 3 temp HP per point to three creatures. Comforting Aura (2, conc.): +d4 to saves for three allies. Aura of Jubilation (3, conc.): disadvantage on Perception/Investigation nearby. Beacon of Recovery (5): six allies reroll save-ends effects.", D],
    // Awakened
    ["Aura Sight", "[Awakened] Focus: advantage on Insight. Assess Foe (2): learn HP, resistances, immunities, vulnerabilities. Read Moods (2). View Aura (3, conc.): see magical effects and advantage on Insight/CHA against it. Perceive the Unseen (5, conc.): see hidden and invisible creatures.", D],
    ["Intellect Fortress", "[Awakened] Focus: resistance to psychic damage. Psychic Backlash (2): reaction, disadvantage on an attack and 2d10 psychic back if it hits. Psychic Parry (1-7): +1 per point to an INT/WIS/CHA save. Psychic Redoubt (5, conc.): allies gain psychic resistance and advantage on mental saves.", D],
    ["Mantle of Awe", "[Awakened] Focus: bonus to CHA checks equal to half INT mod (min +1). Charming Presence (1-7): charm lowest-HP creatures, 2d8 HP per point. Center of Attention (2, conc.). Invoke Awe (7, conc.): charm and command up to five creatures.", D],
    ["Precognition", "[Awakened] Focus: advantage on initiative. Precognitive Hunch (2, conc.): +d4 to attacks, saves and checks. All-Around Sight (3): reaction, disadvantage on an attack against you. Danger Sense (5, conc., 8 hr): no surprise, no advantage against you, +10 initiative. Victory Before Battle (7): +10 initiative for six creatures.", D],
    ["Psychic Assault", "[Awakened] Focus: +2 damage with psychic talents. Psionic Blast (1-7): 1d8 psychic per point, no save. Ego Whip (3): INT save, 3d8, limited actions. Id Insinuation (5): 5d8, forced Dodge/Attack. Psychic Blast (6): 60 ft cone 8d8. Psychic Crush (7): 20 ft cube, 8d8 and stunned.", D],
    ["Psychic Disruption", "[Awakened] Focus: advantage on Deception. Distracting Haze (1-7, conc.): 1d10 psychic per point, vision limited to 10 ft. Daze (3): incapacitate until end of next turn. Mind Storm (5): 20 ft sphere, 6d8 psychic and disadvantage on saves.", D],
    ["Psychic Inquisition", "[Awakened] Focus: know when a telepathic creature lies. Hammer of Inquisition (1-7): 1d10 psychic per point and disadvantage on its next WIS save. Forceful Query (2): yes/no truth. Ransack Mind (5, conc., 1 hr): read memories. Phantom Idea (6, conc., 1 hr): plant a memory or belief.", D],
    ["Psychic Phantoms", "[Awakened] Focus: advantage on Deception. Distracting Figment (1-7): 1d10 psychic per point, no reactions, melee attacks have advantage. Phantom Foe (3, conc.): 1d8 psychic per turn. Phantom Betrayal (5, conc.): must target allies. Phantom Riches (7, conc.): partial control of movement.", D],
    ["Telepathic Contact", "[Awakened] Focus: Telepathy with up to six creatures. Exacting Query (2): truthful answer. Occluded Mind (2): implant a belief for 5 minutes. Broken Will (5): control next turn. Psychic Grip (6, conc.): paralyze. Psychic Domination (7, conc.): control its actions.", D],
    // Immortal
    ["Adaptive Body", "[Immortal] Focus: no need to eat, breathe or sleep; rest with 8 hours of light activity. Environmental Adaptation (2). Adaptive Shield (3): reaction, resist acid/cold/fire/lightning/thunder. Energy Adaptation (5, conc.): resistance for a touched creature. Energy Immunity (7, conc.): immunity.", D],
    ["Bestial Form", "[Immortal] Focus: advantage on Animal Handling. Bestial Claws (1-7): melee attack, 1d10 slashing per point. Bestial Transformation (bonus action, 1 hour): pay for traits: amphibious 2, climbing 2, flight 5, keen senses 2, perfect senses 3, swimming 2, tough hide +2 AC for 2.", D],
    ["Brute Force", "[Immortal] Focus: advantage on Athletics. Brute Strike (1-7): +1d6 per point on a melee hit. Knock Back (1-7): STR save, pushed 10 ft per point. Mighty Leap (1-7): 20 ft per point. Feat of Strength (2): +5 to STR checks.", D],
    ["Celerity", "[Immortal] Focus: +10 ft speed. Rapid Step (1-7): +10 ft per point. Agile Defense (2): Dodge as a bonus action. Blur of Motion (2): invisible while moving. Surge of Speed (2): no opportunity attacks and a climb speed. Surge of Action (5): Dash or one weapon attack.", D],
    ["Corrosive Metabolism", "[Immortal] Focus: resistance to acid and poison. Corrosive Touch (1-7): DEX save, 1d10 acid per point. Venom Strike (1-7): CON save, 1d6 poison per point, poisoned. Acid Spray (2): reaction, 2d6 acid nearby. Breath of the Black Dragon (5): 60 ft line 6d6 acid. Breath of the Green Dragon (7): 90 ft cone 10d6 poison.", D],
    ["Diminution", "[Immortal] Focus: advantage on Stealth. Miniature Form (2, conc.): Tiny, +5 Stealth. Toppling Shift (2): STR save or prone. Sudden Shift (5): reaction, an attack misses and you move 5 ft. Microscopic Form (7, conc.): +10 Stealth, +5 AC, no weapon attacks.", D],
    ["Giant Growth", "[Immortal] Focus: +5 ft reach. Ogre Form (2, conc.): 10 temp HP, +1d4 bludgeoning melee damage, Large. Giant Form (7, conc.): 30 temp HP, +2d6 bludgeoning, +10 ft reach, Huge.", D],
    ["Iron Durability", "[Immortal] Focus: +1 AC. Iron Hide (1-7): reaction, +1 AC per point. Steel Hide (2): resist bludgeoning/piercing/slashing until the end of your next turn. Iron Resistance (7, conc., 1 hr): resist one physical damage type.", D],
    ["Psionic Restoration", "[Immortal] Focus: bonus action to stabilize a creature at 0 HP. Mend Wounds (1-7): heal 1d8 per point. Restore Health (3): cure blinded, deafened, paralyzed, poisoned or a disease. Restore Life (5): revive a creature dead under a minute. Restore Vigor (7): fix ability reduction, HP max reduction or 1 exhaustion.", D],
    ["Psionic Weapon", "[Immortal] Focus: chosen weapon or unarmed strike deals magical psychic damage. Ethereal Weapon (1): next attack ignores armor (DEX save). Lethal Strike (1-7): +1d10 psychic per point. Augmented Weapon (5, conc.): +3 magic weapon.", D],
    // Nomad
    ["Nomadic Arrow", "[Nomad] Focus: ranged attacks ignore disadvantage. Speed Dart (1-7): +1d10 psychic per point on the next ranged hit. Seeking Missile (2): reroll a missed ranged attack. Faithful Archer (5, conc.): free extra ranged attack each turn.", D],
    ["Nomadic Chameleon", "[Nomad] Focus: advantage on Stealth. Chameleon (2): try to hide without cover. Step from Sight (3, conc.): invisible, +1 target per extra point. Enduring Invisibility (7, conc.).", D],
    ["Nomadic Mind", "[Nomad] Focus: gain a skill, tool or language proficiency. Wandering Mind (2-6, conc.): skill proficiencies for 1 hour. Find Creature (2). Item Lore (3): identify. Psychic Speech (5): understand and be understood in any language for 1 hour. Wandering Eye (6) / Phasing Eye (7): psychic sensor.", D],
    ["Nomadic Step", "[Nomad] Focus: +10 ft speed after teleporting. Step of a Dozen Paces (1-7): teleport 20 ft per point. Nomadic Anchor (1). Defensive Step (2): reaction, +4 AC and teleport 10 ft. There and Back Again (2). Transposition (3). Baleful Transposition (5). Phantom Caravan (6): up to six creatures, 1 mile. Nomad's Gate (7, conc.).", D],
    ["Third Eye", "[Nomad] Focus: darkvision 60 ft (or +10 ft). Tremorsense (2, conc.): 30 ft. Unwavering Eye (2): advantage on WIS checks 1 minute. Piercing Sight (3, conc.): see through 1 ft of objects. Truesight (5, conc.): 30 ft.", D],
    // Wu Jen
    ["Mastery of Air", "[Wu Jen] Focus: no fall damage, ignore difficult terrain. Wind Step (1-7): fly 20 ft per point. Wind Stream (1-7): 1d8 bludgeoning per point, STR save. Cloak of Air (3, conc.). Wind Form (5, conc.): 60 ft fly. Misty Form (6, conc.). Animate Air (7, conc.): air elemental.", D],
    ["Mastery of Fire", "[Wu Jen] Focus: fire resistance, +2 fire damage. Combustion (1-7, conc.): 1d10 fire per point. Rolling Flame (3, conc.). Detonation (5): 20 ft sphere 7d6. Fire Form (5, conc.): 3d6 aura. Animate Fire (7, conc.): fire elemental.", D],
    ["Mastery of Force", "[Wu Jen] Focus: advantage on STR checks. Push (1-7): 1d8 force per point and pushed. Move (2-7): hurl objects. Inertial Armor (2): AC 14 + DEX for 8 hours. Telekinetic Barrier (3, conc.). Grasp (3, conc.): grapple at range, crush or move.", D],
    ["Mastery of Ice", "[Wu Jen] Focus: cold resistance. Ice Spike (1-7): 1d8 cold per point, slows. Ice Sheet (2). Frozen Sanctuary (3): 20 temp HP. Frozen Rain (5, conc.): 20 ft sphere 6d6 cold, speed 0. Ice Barrier (6, conc.): wall of ice.", D],
    ["Mastery of Light and Darkness", "[Wu Jen] Focus: see normally through darkness within 30 ft. Darkness (1-7): 10 ft radius per point. Light (2, conc.). Shadow Beasts (3, conc.): two shadows. Radiant Beam (5, conc.): 6d6 radiant and blinded.", D],
    ["Mastery of Water", "[Wu Jen] Focus: swim speed and water breathing. Desiccate (1-7): 1d10 necrotic per point. Watery Grasp (2): 2d6 wave, pulls. Water Whip (3): 60 ft line 3d6. Water Breathing (5). Water Sphere (6, conc.). Animate Water (7, conc.): water elemental.", D],
    ["Mastery of Weather", "[Wu Jen] Focus: resistance to lightning and thunder. Cloud Steps (1-7, conc.). Hungry Lightning (1-7): 1d8 lightning per point. Wall of Clouds (2). Whirlwind (2). Lightning Leap (5): 60 ft line 6d6 and teleport. Wall of Thunder (6, conc.). Thunder Clap (7): 8d6 thunder and stunned.", D],
    ["Mastery of Wood and Earth", "[Wu Jen] Focus: +1 AC. Animate Weapon (1-7): your held weapon attacks, +1d10 force per point. Warp Weapon (2). Warp Armor (3). Wall of Wood (3, conc.). Armored Form (6, conc.): physical resistance. Animate Earth (7, conc.): earth elemental.", D]] };

  const orderSkills = (from) => [{ level: 1, type: "skill", n: 2, from }];
  const bonusDisc = (order) => ({ level: 1, type: "uaDiscipline", n: 2, note: "Choose from the " + order + " disciplines" });
  // psychic-focus-gated 'once per rest' features are tracked as one use per short rest
  C.mystic = {
    name: "Mystic", hd: 8, saves: ["int", "wis"], src: "UA", ua: "The Mystic Class (Mar 2017)",
    armor: "Light armor", weapons: "Simple weapons", tools: "",
    armorCats: ["light"], weaponCats: ["simple"],
    skills: { n: 2, from: ["Arcana", "History", "Insight", "Medicine", "Nature", "Perception", "Religion"] },
    mc: { req: [["int", 13]], profs: "None" },
    sub: { level: 1, label: "Mystic Order" }, asi: [4, 8, 12, 16, 19], gold: "5d4*10",
    kit: ["Spear", "Leather Armor", "Crossbow, light", "Crossbow bolts:20", "Scholar's Pack"],
    choices: [
      { level: 1, type: "uaTalent", n: 1 }, { level: 3, type: "uaTalent", n: 1 }, { level: 10, type: "uaTalent", n: 1 }, { level: 17, type: "uaTalent", n: 1 },
      { level: 1, type: "uaDiscipline", n: 1 }, { level: 3, type: "uaDiscipline", n: 1 }, { level: 5, type: "uaDiscipline", n: 1 }, { level: 7, type: "uaDiscipline", n: 1 },
      { level: 9, type: "uaDiscipline", n: 1 }, { level: 12, type: "uaDiscipline", n: 1 }, { level: 15, type: "uaDiscipline", n: 1 }, { level: 18, type: "uaDiscipline", n: 1 }
    ],
    scaling: [
      ["Psi Points", { 1: "4", 2: "6", 3: "14", 4: "17", 5: "27", 6: "32", 7: "38", 8: "44", 9: "57", 10: "64", 18: "71" }],
      ["Psi Limit", { 1: "2", 3: "3", 5: "5", 7: "6", 9: "7" }],
      ["Potent Psionics", { 8: "+1d8", 14: "+2d8" }],
      ["Discipline DC", { 1: "8 + prof + INT" }]
    ],
    features: [
      [1, "Psionics", "Psionic talents (free, minor) and disciplines (powered by psi points, regained on a long rest). INT is your psionic ability: discipline save DC = 8 + prof + INT; attack = prof + INT. You can spend at most your psi limit (2 at 1st, 3 at 3rd, 5 at 5th, 6 at 7th, 7 at 9th) on one discipline use. Whenever you gain a level you can swap one discipline.", { max: "tier(mystic,1,4,2,6,3,14,4,17,5,27,6,32,7,38,8,44,9,57,10,64,18,71)", reset: "long", pool: true }],
      [1, "Psychic Focus", "Bonus action: focus on one of your disciplines to gain its psychic focus benefit until you are incapacitated or focus another. One at a time; talents cannot be focused."],
      [1, "Mystic Order", "Choose an order (Avatar, Awakened, Immortal, Nomad, Soul Knife or Wu Jen); features again at 3rd, 6th and 14th level."],
      [2, "Mystical Recovery", "Right after spending psi points on a discipline, bonus action: regain HP equal to the points spent."],
      [2, "Telepathy", "Speak telepathically to any creature you can see within 120 ft (it must understand at least one language)."],
      [4, "Strength of Mind", "After each short or long rest, replace your WIS save proficiency with proficiency in STR, DEX, CON or CHA saves until your next rest."],
      [8, "Potent Psionics", "Once per turn a weapon hit deals extra 1d8 psychic damage (2d8 at 14th). Add INT mod to damage from your psionic talents."],
      [10, "Consumptive Power", "Pay a discipline's psi cost with HP instead (both current HP and HP max drop by that amount until a long rest).", { max: "1", reset: "long" }],
      [11, "Psionic Mastery", "Action: gain 9 special psi points (11 at 15th) usable only on disciplines that take an action or bonus action; they cannot be mixed with normal psi points and vanish on a long rest. You can concentrate on several disciplines paid this way.", { max: "tier(mystic,11,1,13,2,15,3,17,4)", reset: "long", col: "action" }],
      [20, "Psionic Body", "Resistance to bludgeoning, piercing and slashing; no aging; immune to disease, poison damage and poisoned. If you die, roll d20: on 10+ you discorporate and return 1d3 days later at a spot of your choice on that plane after a long rest."]
    ],
    subclasses: {
      avatar: { name: "Order of the Avatar (UA)", src: "UA", ua: "The Mystic Class (Mar 2017)", profs: { armorCats: ["medium", "shield"] }, choices: [bonusDisc("Avatar")], features: [
        [1, "Bonus Disciplines", "Learn two extra disciplines, chosen from the Avatar list."],
        [1, "Armor Training", "Proficiency with medium armor and shields."],
        [3, "Avatar of Battle", "Allies within 30 ft who can see you gain +2 to initiative."],
        [6, "Avatar of Healing", "Allies within 30 ft who can see you regain extra HP equal to INT mod (min 0) when a psionic discipline heals them."],
        [14, "Avatar of Speed", "Allies within 30 ft who can see you can Dash as a bonus action."]] },
      awakened: { name: "Order of the Awakened (UA)", src: "UA", ua: "The Mystic Class (Mar 2017)",
        choices: [bonusDisc("Awakened"), ...orderSkills(["Animal Handling", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Persuasion"])], features: [
        [1, "Bonus Disciplines", "Learn two extra disciplines, chosen from the Awakened list."],
        [1, "Awakened Talent", "Proficiency in two of Animal Handling, Deception, Insight, Intimidation, Investigation, Perception, Persuasion."],
        [3, "Psionic Investigation", "Concentrate 10 minutes on a held object to see its last holder and events within 20 ft in the past hour; optionally leave a sensor for 24 hours.", { max: "1", reset: "short" }],
        [6, "Psionic Surge", "Give up your psychic focus (until a rest) to impose disadvantage on a target's save against a discipline or talent.", { max: "1", reset: "short" }],
        [14, "Spectral Form", "Action, 10 minutes: ghostly form with resistance to all damage, half speed, and you can pass through creatures and objects.", { max: "1", reset: "long", col: "action" }]] },
      immortal: { name: "Order of the Immortal (UA)", src: "UA", ua: "The Mystic Class (Mar 2017)", unarmored: "10+dex+con", hpPerLevel: 1, choices: [bonusDisc("Immortal")], features: [
        [1, "Bonus Disciplines", "Learn two extra disciplines, chosen from the Immortal list."],
        [1, "Immortal Durability", "HP max +1 per mystic level (add by hand if not automatic). Unarmored and without a shield: AC = 10 + DEX + CON."],
        [3, "Psionic Resilience", "At the start of each turn at 1 HP or more, gain temp HP equal to INT mod (min 0)."],
        [6, "Surge of Health", "Reaction: halve damage you take, giving up your psychic focus until a rest.", { max: "1", reset: "short", col: "reaction" }],
        [14, "Immortal Will", "At the end of your turn at 0 HP, spend 5 psi points to regain HP equal to mystic level + CON mod."]] },
      nomad: { name: "Order of the Nomad (UA)", src: "UA", ua: "The Mystic Class (Mar 2017)", choices: [bonusDisc("Nomad")], features: [
        [1, "Bonus Disciplines", "Learn two extra disciplines, chosen from the Nomad list."],
        [1, "Breadth of Knowledge", "After each long rest, gain two proficiencies (tools, skills or languages) until the next long rest."],
        [3, "Memory of One Thousand Steps", "Reaction when hit: teleport to a space you occupied since the start of your last turn; the attack misses.", { max: "1", reset: "short", col: "reaction" }],
        [6, "Superior Teleportation", "Teleporting with a psionic discipline goes 10 ft farther."],
        [14, "Effortless Journey", "Once per turn, give up up to 30 ft of movement to teleport that distance to a space you see."]] },
      soulknife: { name: "Order of the Soul Knife (UA)", src: "UA", ua: "The Mystic Class (Mar 2017)", profs: { armorCats: ["medium"], weaponCats: ["martial"] }, features: [
        [1, "Martial Training", "Proficiency with medium armor and martial weapons."],
        [1, "Soul Knife", "Bonus action: manifest psychic blades on both fists (light, finesse martial melee weapon, 1d8 psychic) while your hands are empty. Bonus action to parry: +2 AC until your next turn."],
        [3, "Hone the Blade", "Spend psi points to boost soul knife attack and damage rolls for 10 minutes: 2 points +1, 5 points +2, 7 points +4."],
        [6, "Consumptive Knife", "Slaying an enemy with a soul knife attack restores 2 psi points."],
        [14, "Phantom Knife", "Action: one soul knife attack that treats the target's AC as 10."]] },
      wujen: { name: "Order of the Wu Jen (UA)", src: "UA", ua: "The Mystic Class (Mar 2017)",
        choices: [bonusDisc("Wu Jen"), ...orderSkills(["Animal Handling", "Arcana", "History", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"])], features: [
        [1, "Bonus Disciplines", "Learn two extra disciplines, chosen from the Wu Jen list."],
        [1, "Hermit's Study", "Proficiency in two of Animal Handling, Arcana, History, Insight, Medicine, Nature, Perception, Religion, Survival."],
        [3, "Elemental Attunement", "Spend 1 psi point (within your psi limit) so a discipline ignores a creature's resistance."],
        [6, "Arcane Dabbler", "Learn three wizard spells (1st to 3rd level) that are always prepared (swap one each level). Bonus action: spend psi to create spell slots (1st 2, 2nd 3, 3rd 5, 4th 6, 5th 7 points) within your psi limit; they last until used or a long rest."],
        [14, "Elemental Mastery", "Reaction: if you resist a damage type, spend 2 psi points to ignore that damage and gain immunity to the type until the end of your next turn."]] }
    }
  };

  // ======================= THE RANGER, REVISED (UA, Sep 2016) =======================
  // Fighting styles: the shared list filters by class name, so let the revised ranger share the Ranger entries and add its UA styles.
  const fs = DND.options.fightingStyle.list;
  fs.forEach(e => { if (/\bRanger\b/.test(e[2] || "") && !/Ranger Revised/.test(e[2])) e[2] = e[2].replace(/(\s*\([^)]*\))?\s*$/, (m) => ", Ranger Revised" + m); });
  [["Close Quarters Shooter", "No disadvantage on ranged attacks against a creature within 5 ft; ignore half and three-quarters cover within 30 ft; +1 to ranged attack rolls."],
   ["Mariner", "Not in heavy armor or using a shield: swim and climb speed equal to your speed and +1 AC."],
   ["Tunnel Fighter", "Bonus action defensive stance until your next turn: opportunity attacks without a reaction, and a reaction melee attack against a creature that moves more than 5 ft within your reach."]
  ].forEach(([n, d]) => { if (!fs.some(e => e[0] === n)) fs.push([n, d, "Ranger Revised (UA)"]); });

  C.rangerrev = {
    name: "Ranger (Revised)", hd: 10, saves: ["str", "dex"], src: "UA", ua: "The Ranger, Revised (Sep 2016)",
    armor: "Light armor, medium armor, shields", weapons: "Simple weapons, martial weapons", tools: "",
    armorCats: ["light", "medium", "shield"], weaponCats: ["simple", "martial"],
    skills: { n: 3, from: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"] },
    mc: { req: [["dex", 13], ["wis", 13]], profs: "Light armor, medium armor, shields, simple weapons, martial weapons, one skill", armorCats: ["light", "medium", "shield"], weaponCats: ["simple", "martial"], skills: 1 },
    sub: { level: 3, label: "Ranger Conclave" }, asi: [4, 8, 12, 16, 19], gold: "5d4*10",
    caster: { type: "half", ab: "wis", list: "R", from: 2, known: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11] },
    kit: ["Scale Mail", "Shortsword:2", "Dungeoneer's Pack", "Longbow", "Arrows:20"],
    choices: [{ level: 2, type: "fightingStyle", n: 1 }],
    features: [
      [1, "Favored Enemy", "Choose beasts, fey, humanoids, monstrosities or undead: +2 damage on weapon attacks against them, advantage on Survival to track them and INT checks to recall lore, and one extra language."],
      [1, "Natural Explorer", "Ignore difficult terrain; advantage on initiative; on your first combat turn, advantage on attacks against creatures that have not acted. Travelling an hour or more: group ignores difficult terrain, cannot get lost except by magic, stays alert while doing other tasks, you sneak at normal pace alone, forage double, and learn the number, size and age of tracks."],
      [2, "Fighting Style", "Adopt a fighting style specialty (includes UA styles such as Close Quarters Shooter, Mariner and Tunnel Fighter)."],
      [2, "Spellcasting", "Cast known ranger spells using WIS."],
      [3, "Primeval Awareness", "Action: communicate simple ideas with a beast and read its mood, unless you attacked it in the last 10 minutes. 1 minute of concentration: sense whether your favored enemies are within 5 miles, with numbers, direction and distance."],
      [6, "Greater Favored Enemy", "Choose aberrations, celestials, constructs, dragons, elementals, fiends or giants as a second type: same benefits and a language; damage bonus against all favored enemies becomes +4, and advantage on saves against their spells and abilities."],
      [8, "Fleet of Foot", "Dash as a bonus action."],
      [10, "Hide in Plain Sight", "If you do not move on a turn in which you hide, creatures take -10 to Perception checks against you until your next turn; lost if you move or fall prone."],
      [14, "Vanish", "Hide as a bonus action; you cannot be tracked by nonmagical means unless you choose to leave a trail."],
      [18, "Feral Senses", "No disadvantage on attacks against creatures you cannot see; know the location of invisible creatures within 30 ft unless blinded or deafened."],
      [20, "Foe Slayer", "Once per turn, add WIS mod to an attack roll or damage roll."]
    ],
    subclasses: {
      beast: { name: "Beast Conclave (UA)", src: "UA", ua: "The Ranger, Revised (Sep 2016)", features: [
        [3, "Animal Companion", "8 hours and 50 gp of herbs and food call an ape, black bear, boar, giant badger, giant weasel, mule, panther or wolf as a companion (it loses Multiattack). If slain, 8 hours and 25 gp restore it."],
        [3, "Companion's Bond", "The companion obeys you and uses your proficiency bonus (also added to its AC and damage), is proficient in two skills of your choice and all saves, gains a hit die per level after 3rd, improves abilities when you take ASIs, and shares your favored enemies. You both move stealthily at normal pace when exploring."],
        [5, "Coordinated Attack", "When you take the Attack action and your companion can see you, it can use its reaction to make a melee attack. (This conclave has no Extra Attack.)"],
        [7, "Beast's Defense", "While it can see you, the companion has advantage on all saving throws."],
        [11, "Storm of Claws and Fangs", "The companion can use its action to make a melee attack against every creature within 5 ft of it."],
        [15, "Superior Beast's Defense", "Reaction when a creature it can see hits the companion: halve the damage."]] },
      hunter: { name: "Hunter Conclave (UA)", src: "UA", ua: "The Ranger, Revised (Sep 2016)", extraAttack: { 5: 2 }, features: [
        [3, "Hunter's Prey", "Choose Colossus Slayer (+1d8 to a wounded target once per turn), Giant Killer (reaction attack against a Large+ creature that attacks you) or Horde Breaker (extra attack on a second creature near the target)."],
        [5, "Extra Attack", "Attack twice when you take the Attack action."],
        [7, "Defensive Tactics", "Choose Escape the Horde (opportunity attacks against you have disadvantage), Multiattack Defense (+4 AC against later attacks by a creature that hit you this turn) or Steel Will (advantage against frightened)."],
        [11, "Multiattack", "Choose Volley (ranged attack against every creature within 10 ft of a point in range) or Whirlwind Attack (melee attack against every creature within 5 ft)."],
        [15, "Superior Hunter's Defense", "Choose Evasion, Stand Against the Tide (reaction: a creature that misses you in melee must reroll against another creature) or Uncanny Dodge."]] },
      deepstalker: { name: "Deep Stalker Conclave (UA)", src: "UA", ua: "The Ranger, Revised (Sep 2016)", extraAttack: { 5: 2 }, spellMode: "always",
        spells: { 3: ["Disguise Self"], 5: ["Rope Trick"], 9: ["Glyph of Warding"], 13: ["Greater Invisibility"], 17: ["Seeming"] }, features: [
        [3, "Underdark Scout", "On your first turn of combat: +10 ft speed and one extra attack with the Attack action. Creatures relying on darkvision get no benefit detecting you in dim light or darkness, or against your Hide."],
        [3, "Deep Stalker Magic", "Darkvision 90 ft (or +30 ft). Extra spells at 3rd (disguise self), 5th (rope trick), 9th (glyph of warding), 13th (greater invisibility) and 17th (seeming) level that do not count against spells known."],
        [5, "Extra Attack", "Attack twice when you take the Attack action."],
        [7, "Iron Mind", "Proficiency in WIS saving throws."],
        [11, "Stalker's Flurry", "Once per turn, when you miss with an attack, make another attack."],
        [15, "Stalker's Dodge", "Reaction when a creature without advantage attacks you: impose disadvantage on its attack roll."]] }
    }
  };

  DND.classOrder.push("mystic", "rangerrev");
})();

// Unearthed Arcana (2014-era) races and subraces that were never printed.
(() => {

  // ---- Elf Subraces (Nov 2017): Avariel and Grugach (Sea elf / Shadar-kai were printed) ----
  DND.races.elf.subraces.uaavariel = { name: 'Avariel (UA)', src: 'UA', ua: 'Elf Subraces (Nov 2017)', fly: 30, languages: ['Auran'],
    traits: [['Flight', '30 ft flying speed; not usable in medium or heavy armor.']] };
  DND.races.elf.subraces.uagrugach = { name: 'Grugach (UA)', src: 'UA', ua: 'Elf Subraces (Nov 2017)', asi: { str: 1 }, weapons: ['Spear', 'Shortbow', 'Longbow', 'Net'],
    choices: [{ type: 'cantrip', n: 1, list: 'D', ab: 'wis' }],
    traits: [['Grugach Weapon Training', 'Spear, shortbow, longbow and net proficiency.'], ['Cantrip', 'One druid cantrip (WIS).'], ['Sylvan Tongue', 'You speak, read and write Sylvan instead of Common (drop Common if your DM follows the playtest).']],
    languages: ['Sylvan'] };

  // ---- Gothic Heroes (2016): Revenant subrace, replacing the parent race's usual subrace ----
  const revTrait = ['Relentless Nature', 'The DM gives you a goal tied to your death. Until it is done: regain 1 HP at the start of your turn if below half HP; if you die you return after 24 hours (or re-form within a mile if destroyed, without gear); you sense the direction and distance to creatures tied to the goal on your plane. When the goal is complete you die and cannot be restored to life.'];
  const rev = (extra) => Object.assign({ name: 'Revenant (UA)', src: 'UA', ua: 'Gothic Heroes (Apr 2016)', asi: { con: 1 }, traits: [revTrait] }, extra || {});
  const addRev = (race, extra) => { DND.races[race].subraces.uarevenant = rev(extra); };
  addRev('dwarf'); addRev('elf'); addRev('halfling'); addRev('gnome');
  addRev('human', { asiReplace: true, choices: [{ type: 'asi', n: 2, amount: 1 }],
    traits: [['Human Revenant', 'Two different ability scores of your choice increase by 1 (instead of +1 to all); do not use the variant human skill and feat.'], revTrait] });
  addRev('dragonborn', { asiReplace: true, asi: { str: 1, cha: 1, con: 1 },
    traits: [['Necrotic Ancestry', 'Your breath weapon and damage resistance use necrotic damage instead of your ancestry type (choose any ancestry above; ignore its element).'], revTrait] });
  addRev('tiefling', { traits: [['Tiefling Revenant', 'Replaces the tiefling subrace options (no Infernal Legacy spells); keep the base tiefling traits.'], revTrait] });

  // ---- Races of Ravnica (Aug 2018): Viashino (Loxodon, Simic Hybrid, Vedalken were printed in GGR) ----
  DND.races.uaviashino = { name: 'Viashino (UA)', src: 'UA', ua: 'Races of Ravnica (Aug 2018)', size: 'Medium', speed: 30, asi: { dex: 2, str: 1 }, languages: ['Common', 'Draconic'],
    natural: [['Bite', '1d4', 'piercing']],
    choices: [{ type: 'skill', n: 1, from: ['Acrobatics', 'Stealth'] }],
    traits: [['Bite', 'Unarmed strike with your fangs deals 1d4 + STR piercing.'], ['Lashing Tail', 'Reaction: when a creature within 5 ft damages you with a melee attack, make an unarmed tail strike against it for 1d4 + STR slashing.'], ['Wiry Frame', 'Proficiency in Acrobatics or Stealth.']] };

  // ---- Wonders of the Multiverse (Jul 2022): Glitchling ----
  DND.races.uaglitchling = { name: 'Glitchling (UA)', src: 'UA', ua: 'Wonders of the Multiverse (Jul 2022)', size: 'Medium', speed: 30, asi: 'flex', languages: ['Common'], naturalArmor: '14+dex',
    choices: [{ type: 'language', n: 1 }],
    traits: [['Construct', 'Your creature type is Construct.'], ['Armored Plating', 'Unarmored AC is 14 + DEX.'], ['Balance Chaos', 'When you roll 9 or lower on an attack roll or save, treat it as a 10.', { max: 'prof', reset: 'long' }], ['Living Construct', 'Cure wounds, healing word, mass cure wounds, mass healing word and spare the dying work on you.'], ['Ordered Mind', 'Advantage on Insight checks and on saves vs or to end the charmed condition.'], ['Vestigial Wings', 'When you move, gain a flying speed equal to your walking speed until end of turn; you fall if still aloft at the end of it.', { max: 'prof', reset: 'long' }]] };

  DND.raceGroups.push(['Unearthed Arcana', ['uaviashino', 'uaglitchling']]);
})();

// Unearthed Arcana (2014-era) feats, spells and fighting styles that were never printed.
// Skipped because they were printed later: Starter Spells (XGE), the 2020 Feats and Spells & Magic Tattoos (TCE),
// Giant Options (BGG), Heroes of Krynn (DSotDQ), Planescape options, Nathair's Mischief / Raulothim's Psychic Lance /
// Summon Draconic Spirit (FTD), Spray of Cards and House of Cards, Conjure Lesser Demon (Summon Lesser Demons), Hand of Radiance (Word of Radiance).
// No 2014-era UA background or magic item stayed unprinted, so none are added. Summaries are written in our own words.
(() => {
  // ---------------- Feats ----------------
  const F = (name, prereq, text, fx) => DND.feats.push([name, 'UA', prereq, text, fx || {}]);
  // Feats for Skills (Apr 2017): +1 to an ability, proficiency in the skill (expertise if you already have it), and a perk.
  F('Acrobat', '', '+1 DEX; Acrobatics proficiency (or expertise). Bonus action: DC 15 Acrobatics check to ignore difficult terrain until the end of the turn.', { asiFixed: { dex: 1 }, skillFixed: 'Acrobatics' });
  F('Alchemist', '', "+1 INT; alchemist's supplies proficiency (or expertise). Action: identify a potion by handling it. When you brew or use a potion of healing, it heals the maximum.", { asiFixed: { int: 1 }, skillFixed: "Alchemist's supplies" });
  F('Animal Handler', '', '+1 WIS; Animal Handling proficiency (or expertise). Bonus action: command a friendly beast within 60 ft that can hear you; spend 1 hour to teach a beast a simple trick.', { asiFixed: { wis: 1 }, skillFixed: 'Animal Handling' });
  F('Arcanist', '', '+1 INT; Arcana proficiency (or expertise). Learn prestidigitation, and cast detect magic once per long rest without a slot (INT).', { asiFixed: { int: 1 }, skillFixed: 'Arcana' });
  F('Brawny', '', '+1 STR; Athletics proficiency (or expertise). You count as one size larger for carrying, pushing, dragging and lifting.', { asiFixed: { str: 1 }, skillFixed: 'Athletics' });
  F('Burglar', '', "+1 DEX; thieves' tools proficiency (or expertise).", { asiFixed: { dex: 1 }, skillFixed: "Thieves' tools" });
  F('Diplomat', '', '+1 CHA; Persuasion proficiency (or expertise). After a minute of talking outside combat, Persuasion vs Insight: on a win the creature is charmed by you while you stay within 60 ft (and for 1 minute after).', { asiFixed: { cha: 1 }, skillFixed: 'Persuasion' });
  F('Empathic', '', '+1 WIS; Insight proficiency (or expertise). Action: Insight vs Deception against a creature you can see; on a win you have advantage on attacks and checks against it until the end of your next turn.', { asiFixed: { wis: 1 }, skillFixed: 'Insight' });
  F('Historian', '', '+1 INT; History proficiency (or expertise). When you take the Help action on a check, a DC 15 History check lets the helped creature add your proficiency bonus too.', { asiFixed: { int: 1 }, skillFixed: 'History' });
  F('Investigator', '', '+1 INT; Investigation proficiency (or expertise). Search as a bonus action.', { asiFixed: { int: 1 }, skillFixed: 'Investigation' });
  F('Medic', '', '+1 WIS; Medicine proficiency (or expertise). During a short rest, tend up to six creatures: each that spends a Hit Die regains its maximum instead of rolling.', { asiFixed: { wis: 1 }, skillFixed: 'Medicine' });
  F('Menacing', '', '+1 CHA; Intimidation proficiency (or expertise). Replace one attack with Intimidation vs Insight: on a win the target is frightened of you until the end of your next turn.', { asiFixed: { cha: 1 }, skillFixed: 'Intimidation' });
  F('Naturalist', '', '+1 INT; Nature proficiency (or expertise). Learn druidcraft, and cast detect poison and disease once per long rest without a slot (INT).', { asiFixed: { int: 1 }, skillFixed: 'Nature' });
  F('Perceptive', '', '+1 WIS; Perception proficiency (or expertise). Being in a lightly obscured area doesn’t give you disadvantage on Perception checks.', { asiFixed: { wis: 1 }, skillFixed: 'Perception' });
  F('Performer', '', '+1 CHA; Performance proficiency (or expertise). While you perform, a creature that fails a Insight check vs your Performance has disadvantage on Perception and Investigation checks to notice anything but you.', { asiFixed: { cha: 1 }, skillFixed: 'Performance' });
  F('Quick-Fingered', '', '+1 DEX; Sleight of Hand proficiency (or expertise). Make Sleight of Hand checks as a bonus action.', { asiFixed: { dex: 1 }, skillFixed: 'Sleight of Hand' });
  F('Silver-Tongued', '', '+1 CHA; Deception proficiency (or expertise). Replace one attack with Deception vs Insight: on a win, your movement doesn’t provoke opportunity attacks from it and your next attack against it this turn has advantage.', { asiFixed: { cha: 1 }, skillFixed: 'Deception' });
  F('Stealthy', '', '+1 DEX; Stealth proficiency (or expertise). You can try to hide when only lightly obscured, and moving out of hiding doesn’t reveal you if you end behind cover.', { asiFixed: { dex: 1 }, skillFixed: 'Stealth' });
  F('Survivalist', '', '+1 WIS; Survival proficiency (or expertise). Cast alarm once per long rest without a slot.', { asiFixed: { wis: 1 }, skillFixed: 'Survival' });
  F('Theologian', '', '+1 INT; Religion proficiency (or expertise). Learn thaumaturgy, and cast detect evil and good once per long rest without a slot (INT).', { asiFixed: { int: 1 }, skillFixed: 'Religion' });
  // Feats (Jun 2016)
  F('Blade Mastery', '', '+1 to attacks with shortswords, longswords, scimitars, rapiers and greatswords. Reaction on your turn: +1 AC until your next turn while holding one. Opportunity attacks with them have advantage.');
  F('Fell Handed', '', '+1 to attacks with axes, hammers and mauls. Hit with advantage: knock the target prone if either roll would hit. Miss with disadvantage: deal STR mod damage if the higher roll would hit. When you use the Help action against a shielded foe, the ally gets +2 to the attack.');
  F('Flail Mastery', '', '+1 to attacks with flails. Bonus action: +2 to your next flail attack this turn against a creature with a shield. Opportunity attack hit: STR save (8 + prof + STR) or prone.');
  F('Spear Mastery', '', '+1 to attacks with spears; spear damage die becomes d8 (d10 two-handed). Bonus action: set against a charge (reaction attack for +1d8 when a creature moves 20 ft toward you), or gain +5 ft reach this turn.');
  F('Gourmand', '', "+1 CON; cook's utensils proficiency (or expertise). Action: tell whether food or drink within 5 ft is poisoned. On a long rest, cook for up to six creatures: each regains two extra Hit Dice and has advantage on CON saves against disease for 24 hours.", { asiFixed: { con: 1 }, skillFixed: "Cook's utensils" });
  F('Master of Disguise', '', '+1 CHA; disguise kit proficiency (or expertise). After studying a creature for an hour, spend 8 hours crafting a disguise of it that you can don as an action.', { asiFixed: { cha: 1 }, skillFixed: 'Disguise kit' });
  // Feats (Feb 2020) that never saw print
  F('Tandem Tactician', '', 'Help as a bonus action; the Help action reaches 30 ft and can aid two allies attacking the same creature.');
  F('Shield Training', '', '+1 STR, DEX or CON; shield proficiency; don or doff a shield as part of your object interaction; use a shield as a spellcasting focus.', { asi: ['str', 'dex', 'con'], armorCats: ['shield'] });
  F('Tracker', '', "+1 WIS. Learn hunter's mark and cast it once per long rest without a slot; advantage on Survival checks to track.", { asiFixed: { wis: 1 } });
  // Psionic Options Revisited (May 2020)
  F('Wild Talent', '', '+1 to any ability. Gain a Psionic Talent die (d6): add it to a check or to weapon damage; a high roll shrinks it, a 1 grows it; it resets on a long rest.', { asi: ['str', 'dex', 'con', 'int', 'wis', 'cha'] });
  F('Metabolic Control', 'Psionic Talent die (Wild Talent or similar)', '+1 STR, DEX or CON. Spend your talent die to go 24 hours without food or water, or meditate 1 minute to gain short-rest benefits (once per long rest).', { asi: ['str', 'dex', 'con'] });
  F('Tower of Iron Will', 'Psionic Talent die (Wild Talent or similar)', 'Reaction when you or a creature within 30 ft fails a save: roll your Psionic Talent die and add it, possibly turning the failure into a success.');

  // ---------------- Spells ----------------
  // name|level|school|time|range|components|duration|flags|classes|summary|source
  DND.spellText += `
On/Off|0|Tra|A|60 ft|VS|Instantaneous||KSW|Turn an electronic device on or off, or make one malfunction briefly|UA
Acid Stream|1|Evo|A|Self (30 ft line)|VSM|1 minute|c|SW|1d4 acid to each creature in a 30-ft line, DEX save negates; it keeps taking 1d4 at the start of each of its turns|UA
Arcane Weapon|1|Tra|BA|Self|VS|1 hour|c|A|Your weapon hits deal +1d6 damage of a type you choose (acid, cold, fire, lightning, poison or thunder)|UA
Guiding Hand|1|Div|1m|5 ft|VS|8 hours|cr|BCDW|A floating hand guides you toward a place you name|UA
Healing Elixir|1|Con|1m|Self|VSM|24 hours||A|Create a potion that heals 2d4 + 2 when drunk|UA
Id Insinuation|1|Enc|A|60 ft|VS|1 minute|c|BKSW|1d12 psychic and the target is incapacitated, WIS save negates|UA
Infallible Relay|1|Div|1m|Self|VSM|10 minutes|c|KSW|Call any phone you know of and talk through it|UA
Puppet|1|Enc|A|120 ft|V|Instantaneous||BKSW|A humanoid uses its next action to move, drop an item or fall prone, CON save negates|UA
Remote Access|1|Tra|A|120 ft|VS|10 minutes||KSW|Operate an electronic device from afar as if touching it|UA
Sense Emotion|1|Div|A|Self|VS|1 minute|c|BKSW|Sense the emotions of creatures within 30 ft|UA
Sudden Awakening|1|Enc|BA|10 ft|V|Instantaneous||BRSW|Wake sleeping creatures and let them stand up|UA
Wild Cunning|1|Tra|A|120 ft|VS|Instantaneous|r|DR|Ask nature spirits for one of several useful benefits (tracks, foraging, shelter…)|UA
Arcane Hacking|2|Tra|A|Self|VSM|1 hour|c|KSW|Advantage on checks to hack computers; bypass simple security|UA
Digital Phantom|2|Abj|A|Self|VSM|1 hour|c|KSW|Hide from electronic surveillance|UA
Find Vehicle|2|Con|10m|30 ft|VS|8 hours||KSW|Summon a nearby land vehicle of your choice|UA
Icingdeath's Frost|2|Evo|A|Self (15 ft cone)|SM|Instantaneous||SW|3d8 cold in a cone and creatures are encased in ice (speed 0), CON save half|UA
Mental Barrier|2|Abj|R|Self|V|1 round||KSW|Advantage on INT, WIS and CHA saves and resistance to psychic damage|UA
Mind Thrust|2|Enc|BA|60 ft|VS|1 round||KSW|3d6 psychic and the target can’t take reactions, INT save half|UA
Thought Shield|2|Abj|A|Touch|VS|8 hours||KSW|Resistance to psychic damage and protection from telepathy and mind reading|UA
Conjure Barlgura|3|Con|A|60 ft|VS|10 minutes|c|KW|Summon a barlgura that fights for you|UA
Conjure Knowbot|3|Con|A|Touch|VS|10 minutes||KSW|A smartphone sprouts a digital helper that advises on Arcana, History, Investigation and Religion|UA
Conjure Shadow Demon|3|Con|A|60 ft|VSM|1 hour|c|KW|Summon a shadow demon that fights for you|UA
Ego Whip|3|Enc|A|30 ft|V|1 minute|c|BKSW|3d6 psychic and disadvantage on ability checks, WIS save half and no disadvantage|UA
Flame Stride|3|Tra|BA|Self|VS|1 minute|c|SW|+20 ft speed and moving through creatures deals 1d6 fire|UA
Haywire|3|Enc|A|90 ft|VS|1 minute|c|KSW|Electronic devices in a 30-ft radius behave erratically|UA
Invisibility to Cameras|3|Ill|A|10 ft|VSM|1 minute|c|BKSW|Up to four creatures don’t appear on cameras or sensors|UA
Protection from Ballistics|3|Abj|A|Touch|VSM|10 minutes|c|CKSW|Resistance to damage from firearms and other ballistics|UA
Psionic Blast|3|Evo|A|Self (30 ft cone)|V|Instantaneous||KSW|5d8 force in a cone and creatures are pushed 20 ft and knocked prone, DEX save half|UA
Summon Warrior Spirit|4|Con|A|90 ft|VSM|1 hour|c|PW|A warrior spirit (champion or captain) fights alongside you|UA
Spirit of Death|5|Nec|A|60 ft|VSM|1 minute|c|KSW|Summon a reaper spirit that strikes foes with necrotic damage|UA
Synchronicity|5|Enc|A|Touch|VS|1 hour|c|CKSW|A creature finds that timing works in its favor (advantage on initiative, travel and chance events)|UA
System Backdoor|5|Tra|1m|Self|VSM|1 hour|c|KSW|Access any computer system as an administrator|UA
Commune with City|6|Div|1m|Self|VS|Instantaneous|r|CKSW|Learn facts about the surrounding city (crime, utilities, traffic)|UA
Conjure Vrock|6|Con|A|60 ft|VSM|1 hour|c|KW|Summon a vrock that fights for you|UA
Shutdown|6|Tra|A|120 ft|VS|1 minute|c|CKSW|Electronics within a 60-ft radius stop working|UA
`;

  // ---------------- Class options ----------------
  DND.options.fightingStyle.list.push(
    ['Close Quarters Shooter', 'No disadvantage on ranged attacks within 5 ft of a hostile creature; your ranged attacks ignore half and three-quarters cover against targets within 30 ft; +1 to ranged attack rolls.', 'Fighter, Ranger (UA)'],
    ['Mariner', 'While not wearing heavy armor or using a shield: swim and climb speeds equal to your speed, and +1 AC.', 'Fighter, Paladin, Ranger (UA)'],
    ['Tunnel Fighter', 'Bonus action: take a defensive stance until your next turn — you can make opportunity attacks without your reaction against creatures that move more than 5 ft within your reach.', 'Fighter, Paladin, Ranger (UA)']);
})();

DND.spellText += `
Arcane Eye|4|Div|A|30 ft|VSM|1 hour|c|ACW|Invisible floating eye you can see through|PHB
Aura of Life|4|Abj|A|Self (30 ft)|V|10 minutes|c|CP|Allies resist necrotic; 0-HP allies regain 1 HP|PHB
Aura of Purity|4|Abj|A|Self (30 ft)|V|10 minutes|c|CP|Allies resist poison and have advantage vs many conditions|PHB
Banishment|4|Abj|A|60 ft|VSM|1 minute|c|CKPSW|Banish a creature to a demiplane or home plane, CHA save|PHB
Blight|4|Nec|A|30 ft|VS|Instantaneous||DKSW|8d8 necrotic, CON save half|PHB
Charm Monster|4|Enc|A|30 ft|VS|1 hour||BDKSW|Charm any creature, WIS save|XGE
Compulsion|4|Enc|A|30 ft|VS|1 minute|c|B|Force creatures to move in a direction, WIS save|PHB
Confusion|4|Enc|A|90 ft|VSM|1 minute|c|BDSW|Creatures in a 10 ft sphere act randomly, WIS save|PHB
Conjure Minor Elementals|4|Con|1m|90 ft|VS|1 hour|c|DW|Summon minor elementals|PHB
Conjure Woodland Beings|4|Con|A|60 ft|VSM|1 hour|c|DR|Summon fey creatures|PHB
Control Water|4|Tra|A|300 ft|VSM|10 minutes|c|CDW|Flood, part, redirect or whirlpool water|PHB
Death Ward|4|Abj|A|Touch|VS|8 hours||CP|The first time the target would drop to 0 HP, it drops to 1 instead|PHB
Dimension Door|4|Con|A|500 ft|V|Instantaneous||BKSW|Teleport up to 500 ft with one passenger|PHB
Divination|4|Div|A|Self|VSM|Instantaneous|r|C|Ask your deity one question about the next week|PHB
Dominate Beast|4|Enc|A|60 ft|VS|1 minute|c|DRS|Control a beast, WIS save|PHB
Elemental Bane|4|Tra|A|90 ft|VS|1 minute|c|ADKW|Target loses resistance to an element and takes +2d6 of it, CON save|XGE
Evard's Black Tentacles|4|Con|A|90 ft|VSM|1 minute|c|W|Tentacles restrain and deal 3d6 bludgeoning, DEX save|PHB
Fabricate|4|Tra|10m|120 ft|VS|Instantaneous||AW|Turn raw materials into products|PHB
Find Greater Steed|4|Con|10m|30 ft|VS|Instantaneous||P|Summon a griffon, pegasus or other greater steed|XGE
Fire Shield|4|Evo|A|Self|VSM|10 minutes||AW|Warm or chill shield: resistance; attackers take 2d8|PHB
Freedom of Movement|4|Abj|A|Touch|VSM|1 hour||ABCDR|Ignore difficult terrain, paralysis and restraint|PHB
Giant Insect|4|Tra|A|30 ft|VS|10 minutes|c|D|Turn insects into giant versions|PHB
Grasping Vine|4|Con|BA|30 ft|VS|1 minute|c|DR|Vine pulls a creature 20 ft, DEX save|PHB
Greater Invisibility|4|Ill|A|Touch|VS|1 minute|c|BSW|Invisible even while attacking|PHB
Guardian of Faith|4|Con|A|30 ft|V|8 hours||C|Spectral guardian deals 20 radiant to hostile creatures, DEX save half|PHB
Guardian of Nature|4|Tra|BA|Self|V|1 minute|c|DR|Primal Beast or Great Tree form|XGE
Hallucinatory Terrain|4|Ill|10m|300 ft|VSM|24 hours||BDKW|Make terrain look like other terrain|PHB
Ice Storm|4|Evo|A|300 ft|VSM|Instantaneous||DSW|2d8 bludgeoning + 4d6 cold in a cylinder, DEX save half|PHB
Leomund's Secret Chest|4|Con|A|Touch|VSM|Instantaneous||AW|Hide a chest in the Ethereal Plane|PHB
Locate Creature|4|Div|A|Self|VSM|1 hour|c|BCDPRW|Sense the direction of a known creature within 1,000 ft|PHB
Mordenkainen's Faithful Hound|4|Con|A|30 ft|VSM|8 hours||AW|Invisible guard hound bites for 4d8 piercing|PHB
Mordenkainen's Private Sanctum|4|Abj|10m|120 ft|VSM|24 hours||AW|Secure an area against magic and senses|PHB
Otiluke's Resilient Sphere|4|Evo|A|30 ft|VSM|1 minute|c|AW|Encase a creature in an impenetrable sphere, DEX save|PHB
Phantasmal Killer|4|Ill|A|120 ft|VS|1 minute|c|W|Frightened; 4d10 psychic each turn, WIS save|PHB
Polymorph|4|Tra|A|60 ft|VSM|1 hour|c|BDSW|Transform a creature into a beast, WIS save|PHB
Raulothim's Psychic Lance|4|Enc|A|120 ft|V|Instantaneous||BKSW|7d6 psychic and incapacitated, INT save half|FTD
Shadow of Moil|4|Nec|A|Self|VSM|1 minute|c|K|Heavily obscured; radiant resistance; attackers take 2d8 necrotic|XGE
Sickening Radiance|4|Evo|A|120 ft|VS|10 minutes|c|KSW|4d10 radiant and exhaustion, CON save|XGE
Staggering Smite|4|Evo|BA|Self|V|1 minute|c|P|Next melee hit +4d6 psychic; stagger (WIS save)|PHB
Stone Shape|4|Tra|A|Touch|VSM|Instantaneous||ACDW|Reshape stone|PHB
Stoneskin|4|Abj|A|Touch|VSM|1 hour|c|ADRSW|Resistance to nonmagical physical damage|PHB
Storm Sphere|4|Evo|A|150 ft|VS|1 minute|c|SW|2d6 bludgeoning (STR save) and lightning bolts 4d6|XGE
Summon Aberration|4|Con|A|90 ft|VSM|1 hour|c|KW|Summon an aberrant spirit (beholderkin, slaad or star spawn)|TCE
Summon Construct|4|Con|A|90 ft|VSM|1 hour|c|AW|Summon a construct spirit (clay, metal or stone)|TCE
Summon Elemental|4|Con|A|90 ft|VSM|1 hour|c|DRW|Summon an elemental spirit (air, earth, fire or water)|TCE
Summon Greater Demon|4|Con|A|60 ft|VS|1 hour|c|KW|Summon a demon that may break free|XGE
Vitriolic Sphere|4|Evo|A|150 ft|VSM|Instantaneous||SW|10d4 acid + 5d4 next turn, DEX save half|XGE
Wall of Fire|4|Evo|A|120 ft|VSM|1 minute|c|DSW|Wall of fire: 5d8 fire, DEX save half|PHB
Watery Sphere|4|Con|A|90 ft|VSM|1 minute|c|DSW|Sphere of water restrains creatures, STR save|XGE
Animate Objects|5|Tra|A|120 ft|VS|1 minute|c|ABSW|Animate up to ten objects to fight|PHB
Antilife Shell|5|Abj|A|Self (10 ft)|VS|1 hour|c|D|Barrier keeps living creatures out|PHB
Awaken|5|Tra|8h|Touch|VSM|Instantaneous||BD|Give a beast or plant intelligence|PHB
Banishing Smite|5|Abj|BA|Self|V|1 minute|c|P|Next weapon hit +5d10 force; banish at 50 HP or less|PHB
Bigby's Hand|5|Evo|A|120 ft|VSM|1 minute|c|ASW|Large hand: punch 4d8 force, shove, grapple or cover|PHB
Circle of Power|5|Abj|A|Self (30 ft)|V|10 minutes|c|P|Allies have advantage on saves vs spells; successes take no damage|PHB
Cloudkill|5|Con|A|120 ft|VS|10 minutes|c|SW|Poison fog: 5d8 poison, CON save half|PHB
Commune|5|Div|1m|Self|VSM|1 minute|r|C|Ask your deity three yes-or-no questions|PHB
Commune with Nature|5|Div|1m|Self|VS|Instantaneous|r|DR|Learn about the surrounding land|PHB
Cone of Cold|5|Evo|A|Self (60 ft cone)|VSM|Instantaneous||SW|8d8 cold, CON save half|PHB
Conjure Elemental|5|Con|1m|90 ft|VSM|1 hour|c|DW|Summon an elemental|PHB
Conjure Volley|5|Con|A|150 ft|VSM|Instantaneous||R|Rain of weapons: 8d8, DEX save half|PHB
Contact Other Plane|5|Div|1m|Self|V|1 minute|r|KW|Ask an extraplanar entity five questions (INT save)|PHB
Contagion|5|Nec|A|Touch|VS|7 days||CD|Melee spell attack; afflict a magical disease|PHB
Control Winds|5|Tra|A|300 ft|VS|1 hour|c|DSW|Gusts, downdraft or updraft|XGE
Creation|5|Ill|1m|30 ft|VSM|Special||ASW|Create a nonliving object from shadow-stuff|PHB
Danse Macabre|5|Nec|A|60 ft|VS|1 hour|c|KW|Animate up to five corpses|XGE
Dawn|5|Evo|A|60 ft|VSM|1 minute|c|CW|Cylinder of sunlight: 4d10 radiant, CON save half|XGE
Destructive Wave|5|Evo|A|Self (30 ft)|V|Instantaneous||P|5d6 thunder + 5d6 radiant or necrotic and prone, CON save half|PHB
Dispel Evil and Good|5|Abj|A|Self|VSM|1 minute|c|CP|Protection and banishing touch against extraplanar creatures|PHB
Dominate Person|5|Enc|A|60 ft|VS|1 minute|c|BSW|Control a humanoid, WIS save|PHB
Dream|5|Ill|1m|Special|VSM|8 hours||BKW|Enter a creature's dreams|PHB
Enervation|5|Nec|A|60 ft|VS|1 minute|c|KSW|4d8 necrotic each turn, DEX save half; you heal|XGE
Far Step|5|Con|BA|Self|V|1 minute|c|KSW|Teleport 60 ft as a bonus action each turn|XGE
Flame Strike|5|Evo|A|60 ft|VSM|Instantaneous||C|4d6 fire + 4d6 radiant in a column, DEX save half|PHB
Geas|5|Enc|1m|60 ft|V|30 days||BCDPW|Command a creature; 5d10 psychic if it disobeys, WIS save|PHB
Greater Restoration|5|Abj|A|Touch|VSM|Instantaneous||ABCDR|End exhaustion, charm, petrification, curses or stat reduction|PHB
Hallow|5|Evo|24h|Touch|VSM|Until dispelled||C|Consecrate an area with protective effects|PHB
Hold Monster|5|Enc|A|90 ft|VSM|1 minute|c|BKSW|Paralyze any creature, WIS save|PHB
Holy Weapon|5|Evo|BA|Touch|VS|1 hour|c|CP|Weapon deals +2d8 radiant; burst to blind|XGE
Immolation|5|Evo|A|90 ft|V|1 minute|c|SW|8d6 fire then 4d6 each turn, DEX save half|XGE
Infernal Calling|5|Con|1m|90 ft|VSM|1 hour|c|KW|Summon a devil|XGE
Insect Plague|5|Con|A|300 ft|VSM|10 minutes|c|CDS|Swarming locusts: 4d10 piercing, CON save half|PHB
Legend Lore|5|Div|10m|Self|VSM|Instantaneous||BCW|Learn legends about a person, place or object|PHB
Maelstrom|5|Evo|A|120 ft|VSM|1 minute|c|D|Whirlpool: 6d6 bludgeoning and pull, STR save|XGE
Mass Cure Wounds|5|Evo|A|60 ft|VS|Instantaneous||BCD|Up to six creatures heal 3d8 + spellcasting modifier|PHB
Mislead|5|Ill|A|Self|S|1 hour|c|BW|Become invisible while an illusory double acts|PHB
Modify Memory|5|Enc|A|30 ft|VS|1 minute|c|BW|Alter a creature's memories, WIS save|PHB
Negative Energy Flood|5|Nec|A|60 ft|VM|Instantaneous||KW|5d12 necrotic, CON save half; may rise as a zombie|XGE
Passwall|5|Tra|A|30 ft|VSM|1 hour||W|Create a passage through walls|PHB
Planar Binding|5|Abj|1h|60 ft|VSM|24 hours||BCDKW|Bind a celestial, elemental, fey or fiend to service|PHB
Raise Dead|5|Nec|1h|Touch|VSM|Instantaneous||BCP|Return a creature dead up to 10 days (500 gp diamond)|PHB
Rary's Telepathic Bond|5|Div|A|30 ft|VSM|1 hour|r|W|Telepathic link among up to eight creatures|PHB
Reincarnate|5|Tra|1h|Touch|VSM|Instantaneous||D|Return a dead creature in a new body|PHB
Scrying|5|Div|10m|Self|VSM|10 minutes|c|BCDKW|See and hear a creature on the same plane, WIS save|PHB
Seeming|5|Ill|A|30 ft|VS|8 hours||BSW|Change the appearance of many creatures|PHB
Skill Empowerment|5|Tra|A|Touch|VS|1 hour|c|ABSW|Grant expertise in one skill|XGE
Steel Wind Strike|5|Con|A|30 ft|SM|Instantaneous||RW|Melee spell attack on up to five creatures, 6d10 force each|XGE
Summon Celestial|5|Con|A|90 ft|VSM|1 hour|c|CP|Summon a celestial spirit (avenger or defender)|TCE
Summon Draconic Spirit|5|Con|A|60 ft|VSM|1 hour|c|DSW|Summon a draconic spirit (chromatic, gem or metallic)|FTD
Swift Quiver|5|Tra|BA|Touch|VSM|1 minute|c|R|Bonus action: two extra ranged weapon attacks|PHB
Synaptic Static|5|Enc|A|120 ft|VS|Instantaneous||BKSW|8d6 psychic in a 20 ft sphere, INT save half|XGE
Telekinesis|5|Tra|A|60 ft|VS|10 minutes|c|SW|Move creatures and objects with your mind|PHB
Teleportation Circle|5|Con|1m|10 ft|VM|1 round||BSW|Open a portal to a known teleportation circle|PHB
Transmute Rock|5|Tra|A|120 ft|VSM|Until dispelled||ADW|Turn rock to mud or mud to rock|XGE
Tree Stride|5|Con|A|Self|VS|1 minute|c|DR|Teleport between trees|PHB
Wall of Force|5|Evo|A|120 ft|VSM|10 minutes|c|W|Invisible, indestructible wall|PHB
Wall of Light|5|Evo|A|120 ft|VSM|10 minutes|c|KSW|Wall of light: 4d8 radiant and blind, CON save half|XGE
Wall of Stone|5|Evo|A|120 ft|VSM|10 minutes|c|ADSW|Create a stone wall|PHB
Wrath of Nature|5|Evo|A|120 ft|VS|1 minute|c|DR|Animate nature to attack and hinder enemies|XGE
Arcane Gate|6|Con|A|500 ft|VS|10 minutes|c|KSW|Linked teleportation portals|PHB
Blade Barrier|6|Evo|A|90 ft|VS|10 minutes|c|C|Wall of blades: 6d10 slashing, DEX save half|PHB
Bones of the Earth|6|Tra|A|120 ft|VS|Instantaneous||D|Stone pillars: 6d6 bludgeoning when pinned, DEX save|XGE
Chain Lightning|6|Evo|A|150 ft|VSM|Instantaneous||SW|10d8 lightning to up to four targets, DEX save half|PHB
Circle of Death|6|Nec|A|150 ft|VSM|Instantaneous||KSW|8d6 necrotic in a 60 ft sphere, CON save half|PHB
Conjure Fey|6|Con|1m|90 ft|VS|1 hour|c|DK|Summon a fey creature|PHB
Contingency|6|Evo|10m|Self|VSM|10 days||W|Store a spell to trigger under a condition|PHB
Create Homunculus|6|Tra|1h|Touch|VSM|Instantaneous||W|Create a homunculus bound to you|XGE
Create Undead|6|Nec|1m|10 ft|VSM|Instantaneous||CKW|Create ghouls and stronger undead|PHB
Disintegrate|6|Tra|A|60 ft|VSM|Instantaneous||SW|10d6 + 40 force, DEX save negates; dust on 0 HP|PHB
Drawmij's Instant Summons|6|Con|1m|Touch|VSM|Until dispelled|r|W|Summon a marked object to your hand|PHB
Eyebite|6|Nec|A|Self|VS|1 minute|c|BKSW|Each turn: asleep, panicked or sickened, WIS save|PHB
Find the Path|6|Div|1m|Self|VSM|1 day|c|BCD|Know the route to a location|PHB
Fizban's Platinum Shield|6|Abj|BA|60 ft|VSM|1 minute|c|SW|Half cover, resistance and evasion for a creature|FTD
Flesh to Stone|6|Tra|A|60 ft|VSM|1 minute|c|KW|Gradually petrify a creature, CON save|PHB
Forbiddance|6|Abj|10m|Touch|VSM|24 hours|r|C|Ward an area against teleport and creature types (5d10)|PHB
Globe of Invulnerability|6|Abj|A|Self (10 ft)|VSM|1 minute|c|SW|Block spells of 5th level or lower|PHB
Guards and Wards|6|Abj|10m|Touch|VSM|24 hours||BW|Ward a stronghold with many effects|PHB
Harm|6|Nec|A|60 ft|VS|Instantaneous||C|14d6 necrotic and reduce max HP, CON save half|PHB
Heal|6|Evo|A|60 ft|VS|Instantaneous||CD|Heal 70 HP and end blindness, deafness and disease|PHB
Heroes' Feast|6|Con|10m|30 ft|VSM|Instantaneous||CD|Feast grants immunities and +2d10 max HP for 24 hours|PHB
Investiture of Flame|6|Tra|A|Self|VS|10 minutes|c|DKSW|Fire form: immunity, aura, 4d8 fire line|XGE
Investiture of Ice|6|Tra|A|Self|VS|10 minutes|c|DKSW|Ice form: immunity, ice terrain, 4d6 cold cone|XGE
Investiture of Stone|6|Tra|A|Self|VS|10 minutes|c|DKSW|Stone form: resistance, earth glide, tremors|XGE
Investiture of Wind|6|Tra|A|Self|VS|10 minutes|c|DKSW|Wind form: fly 60 ft, disadvantage on ranged attacks, 2d10 cube|XGE
Magic Jar|6|Nec|1m|Self|VSM|Until dispelled||W|Possess creatures from a container|PHB
Mass Suggestion|6|Enc|A|60 ft|VM|24 hours||BKSW|Suggest a course of action to twelve creatures|PHB
Mental Prison|6|Ill|A|60 ft|S|1 minute|c|KSW|5d10 psychic and restrained in an illusion, INT save|XGE
Move Earth|6|Tra|A|120 ft|VSM|2 hours|c|DSW|Reshape terrain|PHB
Otiluke's Freezing Sphere|6|Evo|A|300 ft|VSM|Instantaneous||W|10d6 cold in a 60 ft sphere, CON save half|PHB
Otto's Irresistible Dance|6|Enc|A|30 ft|V|1 minute|c|BW|Target dances uncontrollably|PHB
Planar Ally|6|Con|10m|60 ft|VS|Instantaneous||C|Request aid from an otherworldly entity|PHB
Primordial Ward|6|Abj|A|Self|VS|1 minute|c|D|Resistance to elements; convert to immunity once|XGE
Programmed Illusion|6|Ill|A|120 ft|VSM|Until dispelled||BW|Illusion triggered by a condition|PHB
Scatter|6|Con|A|30 ft|V|Instantaneous||KSW|Teleport up to five creatures, WIS save|XGE
Soul Cage|6|Nec|R|60 ft|VSM|8 hours||KW|Trap a dying soul to heal or question it|XGE
Summon Fiend|6|Con|A|90 ft|VSM|1 hour|c|KW|Summon a fiendish spirit (demon, devil or yugoloth)|TCE
Sunbeam|6|Evo|A|Self (60 ft line)|VSM|1 minute|c|DSW|6d8 radiant and blinded, CON save half|PHB
Tasha's Otherworldly Guise|6|Tra|BA|Self|VSM|1 minute|c|KSW|Upper or Lower Planes form: immunities, flight, +2 AC, extra attack|TCE
Tenser's Transformation|6|Tra|A|Self|VSM|10 minutes|c|W|Gain temp HP, weapon proficiency, extra attack and +2d12 force|XGE
Transport via Plants|6|Con|A|10 ft|VS|1 round||D|Teleport between plants|PHB
True Seeing|6|Div|A|Touch|VSM|1 hour||BCKSW|Truesight 120 ft|PHB
Wall of Ice|6|Evo|A|120 ft|VSM|10 minutes|c|W|Wall of ice: 10d6 cold, DEX save half|PHB
Wall of Thorns|6|Con|A|120 ft|VSM|10 minutes|c|D|Wall of thorns: 7d8 piercing, DEX save half|PHB
Wind Walk|6|Tra|1m|30 ft|VSM|8 hours||D|Turn creatures into clouds that fly 300 ft|PHB
Word of Recall|6|Con|A|5 ft|V|Instantaneous||C|Teleport you and allies to a sanctuary|PHB
Conjure Celestial|7|Con|1m|90 ft|VS|1 hour|c|C|Summon a celestial|PHB
Crown of Stars|7|Evo|A|Self|VS|1 hour||KSW|Seven motes: bonus action ranged attack, 4d12 radiant each|XGE
Delayed Blast Fireball|7|Evo|A|150 ft|VSM|1 minute|c|SW|Growing fireball: 12d6 fire (+1d6 per turn), DEX save half|PHB
Divine Word|7|Evo|BA|30 ft|V|Instantaneous||C|Deafen, blind, stun or kill based on HP, CHA save|PHB
Draconic Transformation|7|Tra|BA|Self|VM|1 minute|c|DSW|Blindsight, flight and a 6d8 force breath, DEX save half|FTD
Dream of the Blue Veil|7|Con|10m|20 ft|VSM|6 hours||BKSW|Travel to another world in a dream|TCE
Etherealness|7|Tra|A|Self|VS|8 hours||BCKSW|Enter the Ethereal Plane|PHB
Finger of Death|7|Nec|A|60 ft|VS|Instantaneous||KSW|7d8 + 30 necrotic, CON save half; rises as a zombie|PHB
Fire Storm|7|Evo|A|150 ft|VS|Instantaneous||CDS|7d10 fire in ten 10 ft cubes, DEX save half|PHB
Forcecage|7|Evo|A|100 ft|VSM|1 hour||BKW|Invisible cage of force|PHB
Mirage Arcane|7|Ill|10m|Sight|VS|10 days||BDW|Make terrain look, sound and feel like other terrain|PHB
Mordenkainen's Magnificent Mansion|7|Con|1m|300 ft|VSM|24 hours||BW|Extradimensional mansion|PHB
Mordenkainen's Sword|7|Evo|A|60 ft|VSM|1 minute|c|BW|Floating sword: melee spell attack 3d10 force|PHB
Plane Shift|7|Con|A|Touch|VSM|Instantaneous||CDKSW|Travel to another plane, or banish a creature (CHA save)|PHB
Power Word Pain|7|Enc|A|60 ft|V|Instantaneous||KSW|Creature with 100 HP or less is wracked with pain|XGE
Prismatic Spray|7|Evo|A|Self (60 ft cone)|VS|Instantaneous||SW|Random colored rays: 10d6 or conditions, DEX save|PHB
Project Image|7|Ill|A|500 miles|VSM|1 day|c|BW|Illusory copy you can see and speak through|PHB
Regenerate|7|Tra|1m|Touch|VSM|1 hour||BCD|Heal 4d8 + 15 and 1 HP per round; regrow limbs|PHB
Resurrection|7|Nec|1h|Touch|VSM|Instantaneous||BC|Return a creature dead up to a century|PHB
Reverse Gravity|7|Tra|A|100 ft|VSM|1 minute|c|DSW|Reverse gravity in a 50 ft cylinder|PHB
Sequester|7|Tra|A|Touch|VSM|Until dispelled||W|Hide and suspend a creature or object|PHB
Simulacrum|7|Ill|12h|Touch|VSM|Until dispelled||W|Create an illusory duplicate of a creature|PHB
Symbol|7|Abj|1m|Touch|VSM|Until dispelled||BCDW|Glyph with a harmful effect when triggered|PHB
Teleport|7|Con|A|10 ft|V|Instantaneous||BSW|Teleport up to eight creatures anywhere on the plane|PHB
Temple of the Gods|7|Con|1h|120 ft|VSM|24 hours||C|Summon a temple that wards against creature types|XGE
Whirlwind|7|Evo|A|300 ft|VM|1 minute|c|DSW|10d6 bludgeoning whirlwind, DEX save half|XGE
Abi-Dalzim's Horrid Wilting|8|Nec|A|150 ft|VSM|Instantaneous||SW|12d8 necrotic in a 30 ft cube, CON save half|XGE
Animal Shapes|8|Tra|A|30 ft|VS|24 hours|c|D|Transform creatures into beasts|PHB
Antimagic Field|8|Abj|A|Self (10 ft)|VSM|1 hour|c|CW|Suppress all magic around you|PHB
Antipathy/Sympathy|8|Enc|1h|60 ft|VSM|10 days||DW|Repel or attract a creature type|PHB
Clone|8|Nec|1h|Touch|VSM|Instantaneous||W|Grow a clone that awaits your soul|PHB
Control Weather|8|Tra|10m|Self (5 miles)|VSM|8 hours|c|CDW|Change the weather|PHB
Demiplane|8|Con|A|60 ft|S|1 hour||KSW|Door to an extradimensional room|PHB
Dominate Monster|8|Enc|A|60 ft|VS|1 hour|c|BKSW|Control any creature, WIS save|PHB
Earthquake|8|Evo|A|500 ft|VSM|1 minute|c|CDS|Shake the ground, fissures and collapses|PHB
Feeblemind|8|Enc|A|150 ft|VSM|Instantaneous||BDKW|4d6 psychic; INT and CHA become 1, INT save|PHB
Glibness|8|Tra|A|Self|V|1 hour||BK|CHA checks are at least 15; truth magic shows you truthful|PHB
Holy Aura|8|Abj|A|Self|VSM|1 minute|c|C|Allies have advantage on saves; attackers have disadvantage|PHB
Illusory Dragon|8|Ill|A|120 ft|S|1 minute|c|W|Shadow dragon frightens and breathes 7d6, INT save half|XGE
Incendiary Cloud|8|Con|A|150 ft|VS|1 minute|c|SW|Moving cloud of embers: 10d8 fire, DEX save half|PHB
Maddening Darkness|8|Evo|A|150 ft|VM|10 minutes|c|KW|Magical darkness: 8d8 psychic, WIS save half|XGE
Maze|8|Con|A|60 ft|VS|10 minutes|c|W|Banish a creature into a labyrinth|PHB
Mighty Fortress|8|Con|1m|1 mile|VSM|Instantaneous||W|Summon a stone fortress|XGE
Mind Blank|8|Abj|A|Touch|VS|24 hours||BW|Immune to psychic damage, divination and charm|PHB
Power Word Stun|8|Enc|A|60 ft|V|Instantaneous||BKSW|Stun a creature with 150 HP or less|PHB
Sunburst|8|Evo|A|150 ft|VSM|Instantaneous||DSW|12d6 radiant and blinded, CON save half|PHB
Telepathy|8|Evo|A|Unlimited|VSM|24 hours||W|Telepathic link with a creature on the same plane|PHB
Tsunami|8|Con|1m|Sight|VS|6 rounds|c|D|Wall of water: 6d10 bludgeoning, STR save half|PHB
Astral Projection|9|Nec|1h|10 ft|VSM|Special||CKW|Project yourself and others to the Astral Plane|PHB
Blade of Disaster|9|Con|BA|60 ft|VS|1 minute|c|KSW|Rift blade: melee spell attack 4d12 force, crits on 18+|TCE
Foresight|9|Div|1m|Touch|VSM|8 hours||BDKW|Advantage on everything; can't be surprised|PHB
Gate|9|Con|A|60 ft|VSM|1 minute|c|CSW|Portal to another plane; summon a named creature|PHB
Imprisonment|9|Abj|1m|30 ft|VSM|Until dispelled||KW|Magically imprison a creature, WIS save|PHB
Invulnerability|9|Abj|A|Self|VSM|10 minutes|c|W|Immune to all damage|XGE
Mass Heal|9|Evo|A|60 ft|VS|Instantaneous||C|Restore up to 700 HP among creatures|PHB
Mass Polymorph|9|Tra|A|120 ft|VSM|1 hour|c|BSW|Polymorph up to ten creatures|XGE
Meteor Swarm|9|Evo|A|1 mile|VS|Instantaneous||SW|Four meteors: 20d6 fire + 20d6 bludgeoning, DEX save half|PHB
Power Word Heal|9|Evo|A|Touch|VS|Instantaneous||B|Heal all HP and end conditions|PHB
Power Word Kill|9|Enc|A|60 ft|V|Instantaneous||BKSW|Kill a creature with 100 HP or less|PHB
Prismatic Wall|9|Abj|A|60 ft|VS|10 minutes||W|Multilayered wall of colored light|PHB
Psychic Scream|9|Enc|A|90 ft|S|Instantaneous||BKSW|14d6 psychic and stunned for up to ten creatures, INT save half|XGE
Shapechange|9|Tra|A|Self|VM|1 hour|c|DW|Transform into any creature|PHB
Storm of Vengeance|9|Con|A|Sight|VS|1 minute|c|D|Massive storm with escalating effects|PHB
Time Stop|9|Tra|A|Self|V|Instantaneous||SW|Take 1d4 + 1 turns in a row|PHB
True Polymorph|9|Tra|A|30 ft|VSM|1 hour|c|BKW|Permanently transform a creature or object|PHB
True Resurrection|9|Nec|1h|Touch|VSM|Instantaneous||CD|Return a creature dead up to 200 years|PHB
Weird|9|Ill|A|120 ft|VSM|1 minute|c|W|Fears: 4d10 psychic each turn, WIS save|PHB
Wish|9|Con|A|Self|V|Instantaneous||SW|The mightiest spell: duplicate any spell or reshape reality|PHB
`;
// Parse into objects
DND.schools = { Abj: 'Abjuration', Con: 'Conjuration', Div: 'Divination', Enc: 'Enchantment', Evo: 'Evocation', Ill: 'Illusion', Nec: 'Necromancy', Tra: 'Transmutation' };
DND.spellTimes = { A: '1 action', BA: '1 bonus action', R: '1 reaction', '1m': '1 minute', '10m': '10 minutes', '1h': '1 hour', '8h': '8 hours', '12h': '12 hours', '24h': '24 hours' };
DND.spells = DND.spellText.trim().split('\n').filter(l => l.trim()).map(l => {
  const [name, level, school, time, range, comps, duration, flags, classes, summary, src] = l.split('|');
  const conc = flags.includes('c');
  return { name, level: Number(level), school: DND.schools[school] || school, time: DND.spellTimes[time] || time, range, comps, duration: (conc ? 'Concentration, up to ' : '') + duration, conc, ritual: flags.includes('r'), classes, summary, src };
}).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
DND.spellIndex = {};
DND.spells.forEach(s => DND.spellIndex[s.name.toLowerCase()] = s);

// Creatures for Wild Shape, polymorph, conjuring, familiars and steeds (SRD stat summaries).
// [name, CR, size, AC, HP, speeds, [STR,DEX,CON,INT,WIS,CHA], attacks [[name, hit, dmg, type]], notes, tags]
DND.creatureRows = [
  ['Bat', 0, 'Tiny', 12, 1, 'walk 5, fly 30', [2, 15, 8, 2, 12, 4], [['Bite', 0, '1', 'piercing']], 'Echolocation; keen hearing', 'beast familiar fly'],
  ['Cat', 0, 'Tiny', 12, 2, 'walk 40, climb 30', [3, 15, 10, 3, 12, 7], [['Claws', 0, '1', 'slashing']], 'Keen smell', 'beast familiar'],
  ['Crab', 0, 'Tiny', 11, 2, 'walk 20, swim 20', [2, 11, 10, 1, 8, 2], [['Claw', 0, '1', 'bludgeoning']], 'Amphibious', 'beast familiar swim'],
  ['Frog', 0, 'Tiny', 11, 1, 'walk 20, swim 20', [1, 13, 8, 1, 8, 3], [], 'Amphibious; standing leap', 'beast familiar swim'],
  ['Hawk', 0, 'Tiny', 13, 1, 'walk 10, fly 60', [5, 16, 8, 2, 14, 6], [['Talons', 5, '1', 'slashing']], 'Keen sight', 'beast familiar fly'],
  ['Jackal', 0, 'Small', 12, 3, 'walk 40', [8, 15, 11, 3, 12, 6], [['Bite', 1, '1d4-1', 'piercing']], 'Pack tactics', 'beast'],
  ['Lizard', 0, 'Tiny', 10, 2, 'walk 20, climb 20', [2, 11, 10, 1, 8, 3], [['Bite', 0, '1', 'piercing']], '', 'beast familiar'],
  ['Octopus', 0, 'Small', 12, 3, 'walk 5, swim 30', [4, 15, 11, 3, 10, 4], [['Tentacles', 4, '1', 'bludgeoning']], 'Hold breath; ink cloud; water breathing', 'beast familiar swim'],
  ['Owl', 0, 'Tiny', 11, 1, 'walk 5, fly 60', [3, 13, 8, 2, 12, 7], [['Talons', 3, '1', 'slashing']], 'Flyby; keen hearing and sight', 'beast familiar fly'],
  ['Quipper', 0, 'Tiny', 13, 1, 'swim 40', [2, 16, 9, 1, 7, 2], [['Bite', 5, '1', 'piercing']], 'Blood frenzy; water breathing', 'beast familiar swim'],
  ['Rat', 0, 'Tiny', 10, 1, 'walk 20', [2, 11, 9, 2, 10, 4], [['Bite', 0, '1', 'piercing']], 'Keen smell', 'beast familiar'],
  ['Raven', 0, 'Tiny', 12, 1, 'walk 10, fly 50', [2, 14, 8, 2, 12, 6], [['Beak', 4, '1', 'piercing']], 'Mimicry', 'beast familiar fly'],
  ['Sea Horse', 0, 'Tiny', 11, 1, 'swim 20', [1, 12, 8, 1, 10, 2], [], 'Water breathing', 'beast familiar swim'],
  ['Spider', 0, 'Tiny', 12, 1, 'walk 20, climb 20', [2, 14, 8, 1, 10, 2], [['Bite', 4, '1', 'piercing (+1d4 poison, DC 9 CON)']], 'Spider climb; web sense', 'beast familiar'],
  ['Weasel', 0, 'Tiny', 13, 1, 'walk 30', [3, 16, 8, 2, 12, 3], [['Bite', 5, '1', 'piercing']], 'Keen hearing and smell', 'beast familiar'],
  ['Blood Hawk', 0.125, 'Small', 12, 7, 'walk 10, fly 60', [6, 14, 10, 3, 14, 5], [['Beak', 4, '1d4+2', 'piercing']], 'Pack tactics', 'beast fly'],
  ['Camel', 0.125, 'Large', 9, 15, 'walk 50', [16, 8, 14, 2, 8, 5], [['Bite', 5, '1d4', 'bludgeoning']], '', 'beast steed'],
  ['Flying Snake', 0.125, 'Tiny', 14, 5, 'walk 30, fly 60, swim 30', [4, 18, 11, 2, 12, 5], [['Bite', 6, '1', 'piercing (+3d4 poison)']], 'Flyby', 'beast fly swim'],
  ['Giant Crab', 0.125, 'Medium', 15, 13, 'walk 30, swim 30', [13, 15, 11, 1, 9, 3], [['Claw', 3, '1d6+1', 'bludgeoning (grapple)']], 'Amphibious', 'beast swim'],
  ['Giant Rat', 0.125, 'Small', 12, 7, 'walk 30', [7, 15, 11, 2, 10, 4], [['Bite', 4, '1d4+2', 'piercing']], 'Pack tactics; keen smell', 'beast'],
  ['Giant Weasel', 0.125, 'Medium', 13, 9, 'walk 40', [11, 16, 10, 4, 12, 5], [['Bite', 5, '1d4+3', 'piercing']], 'Keen hearing and smell', 'beast'],
  ['Mastiff', 0.125, 'Medium', 12, 5, 'walk 40', [13, 14, 12, 3, 12, 7], [['Bite', 3, '1d6+1', 'piercing (prone, DC 11 STR)']], 'Keen hearing and smell', 'beast steed'],
  ['Mule', 0.125, 'Medium', 10, 11, 'walk 40', [14, 10, 13, 2, 10, 5], [['Hooves', 2, '1d4+2', 'bludgeoning']], 'Beast of burden; sure-footed', 'beast'],
  ['Poisonous Snake', 0.125, 'Tiny', 13, 2, 'walk 30, swim 30', [2, 16, 11, 1, 10, 3], [['Bite', 5, '1', 'piercing (+2d4 poison, DC 10 CON half)']], 'Blindsight 10 ft', 'beast familiar swim'],
  ['Pony', 0.125, 'Medium', 10, 11, 'walk 40', [15, 10, 13, 2, 11, 7], [['Hooves', 4, '2d4+2', 'bludgeoning']], '', 'beast steed'],
  ['Axe Beak', 0.25, 'Large', 11, 19, 'walk 50', [14, 12, 12, 2, 10, 5], [['Beak', 4, '1d8+2', 'slashing']], '', 'beast'],
  ['Boar', 0.25, 'Medium', 11, 11, 'walk 40', [13, 11, 12, 2, 9, 5], [['Tusk', 3, '1d6+1', 'slashing']], 'Charge +1d6; relentless (drop to 1 HP once)', 'beast'],
  ['Constrictor Snake', 0.25, 'Large', 12, 13, 'walk 30, swim 30', [15, 14, 12, 1, 10, 3], [['Bite', 4, '1d6+2', 'piercing'], ['Constrict', 4, '1d8+2', 'bludgeoning (grapple)']], 'Blindsight 10 ft', 'beast swim'],
  ['Draft Horse', 0.25, 'Large', 10, 19, 'walk 40', [18, 10, 12, 2, 11, 7], [['Hooves', 6, '2d4+4', 'bludgeoning']], '', 'beast'],
  ['Elk', 0.25, 'Large', 10, 13, 'walk 50', [16, 10, 12, 2, 10, 6], [['Ram', 5, '1d6+3', 'bludgeoning'], ['Hooves (prone target)', 5, '2d4+3', 'bludgeoning']], 'Charge +2d6', 'beast steed'],
  ['Giant Badger', 0.25, 'Medium', 10, 13, 'walk 30, burrow 10', [13, 10, 15, 2, 12, 5], [['Bite', 3, '1d6+1', 'piercing'], ['Claws', 3, '2d4+1', 'slashing']], 'Multiattack (bite + claws); keen smell', 'beast'],
  ['Giant Bat', 0.25, 'Large', 13, 22, 'walk 10, fly 60', [15, 16, 11, 2, 12, 6], [['Bite', 4, '1d6+2', 'piercing']], 'Echolocation', 'beast fly'],
  ['Giant Centipede', 0.25, 'Small', 13, 4, 'walk 30, climb 30', [5, 14, 12, 1, 7, 3], [['Bite', 4, '1d4+2', 'piercing (+3d6 poison, DC 11 CON)']], 'Blindsight 30 ft', 'beast'],
  ['Giant Frog', 0.25, 'Medium', 11, 18, 'walk 30, swim 30', [12, 13, 11, 2, 10, 3], [['Bite', 3, '1d6+1', 'piercing (grapple)']], 'Amphibious; swallow', 'beast swim'],
  ['Giant Lizard', 0.25, 'Large', 12, 19, 'walk 30, climb 30', [15, 12, 13, 2, 10, 5], [['Bite', 4, '1d8+2', 'piercing']], '', 'beast'],
  ['Giant Owl', 0.25, 'Large', 12, 19, 'walk 5, fly 60', [13, 15, 12, 8, 13, 10], [['Talons', 3, '2d6+1', 'slashing']], 'Flyby; keen hearing and sight', 'beast fly'],
  ['Giant Poisonous Snake', 0.25, 'Medium', 14, 11, 'walk 30, swim 30', [10, 18, 13, 2, 10, 3], [['Bite', 6, '1d4+4', 'piercing (+3d6 poison, DC 11 CON half)']], 'Blindsight 10 ft', 'beast swim'],
  ['Giant Wolf Spider', 0.25, 'Medium', 13, 11, 'walk 40, climb 40', [12, 16, 13, 3, 12, 4], [['Bite', 3, '1d6+1', 'piercing (+2d6 poison, DC 11 CON half)']], 'Spider climb; web sense', 'beast'],
  ['Panther', 0.25, 'Medium', 12, 13, 'walk 50, climb 40', [14, 15, 10, 3, 14, 7], [['Bite', 4, '1d6+2', 'piercing'], ['Claw', 4, '1d4+2', 'slashing']], 'Pounce (prone, bonus bite)', 'beast'],
  ['Riding Horse', 0.25, 'Large', 10, 13, 'walk 60', [16, 10, 12, 2, 11, 7], [['Hooves', 5, '2d4+3', 'bludgeoning']], '', 'beast'],
  ['Wolf', 0.25, 'Medium', 13, 11, 'walk 40', [12, 15, 12, 3, 12, 6], [['Bite', 4, '2d4+2', 'piercing (prone, DC 11 STR)']], 'Pack tactics; keen hearing and smell', 'beast'],
  ['Ape', 0.5, 'Medium', 12, 19, 'walk 30, climb 30', [16, 14, 14, 6, 12, 7], [['Fist', 5, '1d6+3', 'bludgeoning'], ['Rock', 5, '1d6+3', 'bludgeoning']], 'Multiattack (two fists)', 'beast'],
  ['Black Bear', 0.5, 'Medium', 11, 19, 'walk 40, climb 30', [15, 10, 14, 2, 12, 7], [['Bite', 4, '1d6+2', 'piercing'], ['Claws', 4, '2d4+2', 'slashing']], 'Multiattack (bite + claws); keen smell', 'beast'],
  ['Crocodile', 0.5, 'Large', 12, 19, 'walk 20, swim 30', [15, 10, 13, 2, 10, 5], [['Bite', 4, '1d10+2', 'piercing (grapple)']], 'Hold breath', 'beast swim'],
  ['Giant Goat', 0.5, 'Large', 11, 19, 'walk 40', [17, 11, 12, 3, 12, 6], [['Ram', 5, '2d4+3', 'bludgeoning']], 'Charge +2d4; sure-footed', 'beast'],
  ['Giant Sea Horse', 0.5, 'Large', 13, 16, 'swim 40', [12, 15, 11, 2, 12, 5], [['Ram', 3, '1d6+1', 'bludgeoning']], 'Charge; water breathing', 'beast swim'],
  ['Giant Wasp', 0.5, 'Medium', 12, 13, 'walk 10, fly 50', [10, 14, 10, 1, 10, 3], [['Sting', 4, '1d6+2', 'piercing (+3d6 poison, DC 11 CON half)']], '', 'beast fly'],
  ['Reef Shark', 0.5, 'Medium', 12, 22, 'swim 40', [14, 13, 13, 1, 10, 4], [['Bite', 4, '1d8+2', 'piercing']], 'Pack tactics; water breathing', 'beast swim'],
  ['Warhorse', 0.5, 'Large', 11, 19, 'walk 60', [18, 12, 13, 2, 12, 7], [['Hooves', 6, '2d6+4', 'bludgeoning']], 'Trampling charge', 'beast steed'],
  ['Brown Bear', 1, 'Large', 11, 34, 'walk 40, climb 30', [19, 10, 16, 2, 13, 7], [['Bite', 6, '1d8+4', 'piercing'], ['Claws', 6, '2d6+4', 'slashing']], 'Multiattack (bite + claws); keen smell', 'beast'],
  ['Dire Wolf', 1, 'Large', 14, 37, 'walk 50', [17, 15, 15, 3, 12, 7], [['Bite', 5, '2d6+3', 'piercing (prone, DC 13 STR)']], 'Pack tactics', 'beast'],
  ['Giant Eagle', 1, 'Large', 13, 26, 'walk 10, fly 80', [16, 17, 13, 8, 14, 10], [['Beak', 5, '1d6+3', 'piercing'], ['Talons', 5, '2d6+3', 'slashing']], 'Multiattack; keen sight', 'beast fly'],
  ['Giant Hyena', 1, 'Large', 12, 45, 'walk 50', [16, 14, 14, 2, 12, 7], [['Bite', 5, '2d6+3', 'piercing']], 'Rampage', 'beast'],
  ['Giant Octopus', 1, 'Large', 11, 52, 'walk 10, swim 60', [17, 13, 13, 4, 10, 4], [['Tentacles', 5, '2d6+3', 'bludgeoning (grapple)']], 'Ink cloud; water breathing', 'beast swim'],
  ['Giant Spider', 1, 'Large', 14, 26, 'walk 30, climb 30', [14, 16, 12, 2, 11, 4], [['Bite', 5, '1d8+3', 'piercing (+2d8 poison, DC 11 CON half)'], ['Web (recharge 5–6)', 5, '', 'restrained']], 'Spider climb; web walker', 'beast'],
  ['Giant Toad', 1, 'Large', 11, 39, 'walk 20, swim 40', [15, 13, 13, 2, 10, 3], [['Bite', 4, '1d10+2', 'piercing (+1d10 poison, grapple)']], 'Amphibious; swallow', 'beast swim'],
  ['Giant Vulture', 1, 'Large', 10, 22, 'walk 10, fly 60', [15, 10, 15, 6, 12, 7], [['Beak', 4, '2d4+2', 'piercing'], ['Talons', 4, '2d6+2', 'slashing']], 'Pack tactics', 'beast fly'],
  ['Lion', 1, 'Large', 12, 26, 'walk 50', [17, 15, 13, 3, 12, 8], [['Bite', 5, '1d8+3', 'piercing'], ['Claw', 5, '1d6+3', 'slashing']], 'Pack tactics; pounce; running leap', 'beast'],
  ['Tiger', 1, 'Large', 12, 37, 'walk 40', [17, 15, 14, 3, 12, 8], [['Bite', 5, '1d10+3', 'piercing'], ['Claw', 5, '1d8+3', 'slashing']], 'Pounce; keen smell', 'beast'],
  ['Allosaurus', 2, 'Large', 13, 51, 'walk 60', [19, 13, 17, 2, 12, 5], [['Bite', 6, '2d10+4', 'piercing'], ['Claw', 6, '1d8+4', 'slashing']], 'Pounce', 'beast'],
  ['Giant Boar', 2, 'Large', 12, 42, 'walk 40', [17, 10, 16, 2, 7, 5], [['Tusk', 5, '2d6+3', 'slashing']], 'Charge +2d6; relentless', 'beast'],
  ['Giant Constrictor Snake', 2, 'Huge', 12, 60, 'walk 30, swim 30', [19, 14, 12, 1, 10, 3], [['Bite', 6, '2d6+4', 'piercing'], ['Constrict', 6, '2d8+4', 'bludgeoning (grapple)']], 'Blindsight 10 ft', 'beast swim'],
  ['Giant Elk', 2, 'Huge', 14, 42, 'walk 60', [19, 16, 14, 7, 14, 10], [['Ram', 6, '2d6+4', 'bludgeoning'], ['Hooves', 6, '4d8+4', 'bludgeoning']], 'Charge', 'beast'],
  ['Hunter Shark', 2, 'Large', 12, 45, 'swim 40', [18, 13, 15, 1, 10, 4], [['Bite', 6, '2d8+4', 'piercing']], 'Blood frenzy; water breathing', 'beast swim'],
  ['Plesiosaurus', 2, 'Large', 13, 68, 'walk 20, swim 40', [18, 15, 16, 2, 12, 5], [['Bite', 6, '3d6+4', 'piercing']], 'Hold breath', 'beast swim'],
  ['Polar Bear', 2, 'Large', 12, 42, 'walk 40, swim 30', [20, 10, 16, 2, 13, 7], [['Bite', 7, '1d8+5', 'piercing'], ['Claws', 7, '2d6+5', 'slashing']], 'Multiattack; keen smell', 'beast swim'],
  ['Rhinoceros', 2, 'Large', 11, 45, 'walk 40', [21, 8, 15, 2, 12, 6], [['Gore', 7, '2d8+5', 'bludgeoning']], 'Charge +2d8', 'beast'],
  ['Saber-Toothed Tiger', 2, 'Large', 12, 52, 'walk 40', [18, 14, 15, 3, 12, 8], [['Bite', 6, '1d10+5', 'piercing'], ['Claw', 6, '2d6+5', 'slashing']], 'Pounce; keen smell', 'beast'],
  ['Ankylosaurus', 3, 'Huge', 15, 68, 'walk 30', [19, 11, 15, 2, 12, 5], [['Tail', 7, '4d6+4', 'bludgeoning (prone, DC 14 STR)']], '', 'beast'],
  ['Giant Scorpion', 3, 'Large', 15, 52, 'walk 40', [15, 13, 15, 1, 9, 3], [['Claw', 4, '1d8+2', 'bludgeoning (grapple)'], ['Sting', 4, '1d10+2', 'piercing (+4d10 poison, DC 12 CON half)']], 'Multiattack (two claws, sting)', 'beast'],
  ['Killer Whale', 3, 'Huge', 12, 90, 'swim 60', [19, 10, 13, 3, 12, 7], [['Bite', 6, '5d6+4', 'piercing']], 'Echolocation; hold breath', 'beast swim'],
  ['Elephant', 4, 'Huge', 12, 76, 'walk 40', [22, 9, 17, 3, 11, 6], [['Gore', 8, '3d8+6', 'piercing'], ['Stomp', 8, '3d10+6', 'bludgeoning']], 'Trampling charge', 'beast'],
  ['Giant Crocodile', 5, 'Huge', 14, 85, 'walk 30, swim 50', [21, 9, 17, 2, 10, 7], [['Bite', 8, '3d10+5', 'piercing (grapple)'], ['Tail', 8, '2d8+5', 'bludgeoning']], 'Hold breath', 'beast swim'],
  ['Giant Shark', 5, 'Huge', 13, 126, 'swim 50', [23, 11, 21, 1, 10, 5], [['Bite', 9, '3d10+6', 'piercing']], 'Blood frenzy', 'beast swim'],
  ['Triceratops', 5, 'Huge', 13, 95, 'walk 50', [22, 9, 17, 2, 11, 5], [['Gore', 9, '4d8+6', 'piercing'], ['Stomp', 9, '3d10+6', 'bludgeoning']], 'Trampling charge', 'beast'],
  ['Mammoth', 6, 'Huge', 13, 126, 'walk 40', [24, 9, 21, 3, 11, 6], [['Gore', 10, '4d8+7', 'piercing'], ['Stomp', 10, '4d10+7', 'bludgeoning']], 'Trampling charge', 'beast'],
  ['Giant Ape', 7, 'Huge', 12, 157, 'walk 40, climb 40', [23, 14, 18, 7, 12, 7], [['Fist', 9, '3d10+6', 'bludgeoning'], ['Rock', 9, '7d6+6', 'bludgeoning']], 'Multiattack (two fists)', 'beast'],
  ['Tyrannosaurus Rex', 8, 'Huge', 13, 136, 'walk 50', [25, 10, 19, 2, 12, 9], [['Bite', 10, '4d12+7', 'piercing (grapple)'], ['Tail', 10, '3d8+7', 'bludgeoning']], 'Multiattack (bite + tail)', 'beast'],
  ['Air Elemental', 5, 'Large', 15, 90, 'fly 90', [14, 20, 14, 6, 10, 6], [['Slam', 8, '2d8+5', 'bludgeoning']], 'Multiattack (two slams); whirlwind', 'elemental fly'],
  ['Earth Elemental', 5, 'Large', 17, 126, 'walk 30, burrow 30', [20, 8, 20, 5, 10, 5], [['Slam', 8, '2d8+5', 'bludgeoning']], 'Multiattack (two slams); earth glide; siege monster', 'elemental'],
  ['Fire Elemental', 5, 'Large', 13, 102, 'walk 50', [10, 17, 16, 6, 10, 7], [['Touch', 6, '2d6+3', 'fire (ignites)']], 'Multiattack (two touches); fire form', 'elemental'],
  ['Water Elemental', 5, 'Large', 14, 114, 'walk 30, swim 90', [18, 14, 18, 5, 10, 8], [['Slam', 7, '2d8+4', 'bludgeoning']], 'Multiattack (two slams); whelm', 'elemental swim'],
  ['Imp', 1, 'Tiny', 13, 10, 'walk 20, fly 40', [6, 17, 13, 11, 12, 14], [['Sting', 5, '1d4+3', 'piercing (+3d6 poison, DC 11 CON half)']], 'Shapechanger; devil\'s sight; magic resistance; invisibility', 'fiend chain'],
  ['Pseudodragon', 0.25, 'Tiny', 13, 7, 'walk 15, fly 60', [6, 15, 13, 10, 12, 10], [['Bite', 4, '1d4+2', 'piercing'], ['Sting', 4, '1d4+2', 'piercing (poison sleep, DC 11 CON)']], 'Magic resistance; limited telepathy', 'dragon chain'],
  ['Quasit', 1, 'Tiny', 13, 7, 'walk 40', [5, 17, 10, 7, 10, 10], [['Claws', 4, '1d4+3', 'piercing (+2d4 poison, DC 10 CON)']], 'Shapechanger; magic resistance; invisibility; scare', 'fiend chain'],
  ['Sprite', 0.25, 'Tiny', 15, 2, 'walk 10, fly 40', [3, 18, 10, 14, 13, 11], [['Longsword', 2, '1', 'slashing'], ['Shortbow', 6, '1', 'piercing (poison, DC 10 CON)']], 'Heart sight; invisibility', 'fey chain'],
  ['Skeleton', 0.25, 'Medium', 13, 13, 'walk 30', [10, 14, 15, 6, 8, 5], [['Shortsword', 4, '1d6+2', 'piercing'], ['Shortbow', 4, '1d6+2', 'piercing']], 'Vulnerable to bludgeoning; immune to poison', 'undead'],
  ['Zombie', 0.25, 'Medium', 8, 22, 'walk 20', [13, 6, 16, 3, 6, 5], [['Slam', 3, '1d6+1', 'bludgeoning']], 'Undead fortitude', 'undead']
];
DND.creatures = DND.creatureRows.map(([name, cr, size, ac, hp, speed, abil, attacks, notes, tags]) => ({ name, cr, size, ac, hp, speed, abil, attacks, notes, tags: tags.split(' ') }));
DND.crLabel = cr => cr === 0.125 ? '1/8' : cr === 0.25 ? '1/4' : cr === 0.5 ? '1/2' : String(cr);

// Scaling summons (Tasha's / Fizban's). L = slot level, atk = your spell attack, pb = proficiency, m = spellcasting modifier.
// Each returns a creature object.
DND.summons = {
  'Summon Beast': { min: 2, kinds: ['Air', 'Land', 'Water'], make: (L, k, atk) => ({ ac: 11 + L, hp: (k === 'Air' ? 20 : 30) + 5 * (L - 2), speed: k === 'Air' ? 'walk 30, fly 60' : k === 'Land' ? 'walk 30, climb 30' : 'walk 30, swim 30', multi: Math.floor(L / 2), attacks: [['Maul', atk, `1d8+${4 + L}`, 'piercing']], notes: k === 'Air' ? 'Flyby' : 'Pack tactics' + (k === 'Water' ? '; water breathing' : '') }) },
  'Summon Fey': { min: 3, kinds: ['Fuming', 'Mirthful', 'Tricksy'], make: (L, k, atk) => ({ ac: 12 + L, hp: 30 + 10 * (L - 3), speed: 'walk 40', multi: Math.floor(L / 2), attacks: [['Shortsword', atk, `1d6+${3 + L}`, 'piercing (+1d6 force)']], notes: 'Fey Step: bonus-action teleport 30 ft with a ' + k.toLowerCase() + ' effect' }) },
  'Summon Shadowspawn': { min: 3, kinds: ['Fury', 'Despair', 'Fear'], make: (L, k, atk) => ({ ac: 11 + L, hp: 35 + 15 * (L - 3), speed: 'walk 40', multi: Math.floor(L / 2), attacks: [['Chilling Rend', atk, `1d12+${3 + L}`, 'cold']], notes: 'Dreadful Scream (1/day); ' + k + ' aura' }) },
  'Summon Undead': { min: 3, kinds: ['Ghostly', 'Putrid', 'Skeletal'], make: (L, k, atk) => ({ ac: 11 + L, hp: (k === 'Skeletal' ? 20 : 30) + 10 * (L - 3), speed: k === 'Ghostly' ? 'walk 30, fly 40 (hover)' : 'walk 30', multi: Math.floor(L / 2), attacks: k === 'Ghostly' ? [['Deathly Touch', atk, `1d8+${3 + L}`, 'necrotic (frighten)']] : k === 'Putrid' ? [['Rotting Claw', atk, `1d6+${3 + L}`, 'slashing (paralyze if poisoned)']] : [['Grave Bolt', atk, `2d4+${3 + L}`, 'necrotic, 150 ft']], notes: '' }) },
  'Summon Aberration': { min: 4, kinds: ['Beholderkin', 'Slaad', 'Star Spawn'], make: (L, k, atk) => ({ ac: 11 + L, hp: 40 + 10 * (L - 4), speed: k === 'Beholderkin' ? 'walk 30, fly 30 (hover)' : 'walk 30', multi: Math.floor(L / 2), attacks: k === 'Beholderkin' ? [['Eye Ray', atk, `1d8+${3 + L}`, 'psychic, 150 ft']] : k === 'Slaad' ? [['Claws', atk, `1d10+${3 + L}`, 'slashing']] : [['Psychic Slam', atk, `1d8+${3 + L}`, 'psychic']], notes: '' }) },
  'Summon Construct': { min: 4, kinds: ['Clay', 'Metal', 'Stone'], make: (L, k, atk) => ({ ac: 13 + L, hp: 40 + 15 * (L - 4), speed: 'walk 30', multi: Math.floor(L / 2), attacks: [['Slam', atk, `1d8+${4 + L}`, 'bludgeoning']], notes: k + ' construct reaction' }) },
  'Summon Elemental': { min: 4, kinds: ['Air', 'Earth', 'Fire', 'Water'], make: (L, k, atk) => ({ ac: 11 + L, hp: 50 + 10 * (L - 4), speed: k === 'Air' ? 'walk 40, fly 40 (hover)' : k === 'Earth' ? 'walk 40, burrow 40' : k === 'Water' ? 'walk 40, swim 40' : 'walk 40', multi: Math.floor(L / 2), attacks: [['Slam', atk, `1d10+${4 + L}`, k === 'Fire' ? 'fire' : k === 'Air' ? 'lightning' : 'bludgeoning']], notes: '' }) },
  'Summon Celestial': { min: 5, kinds: ['Avenger', 'Defender'], make: (L, k, atk) => ({ ac: 11 + L + (k === 'Defender' ? 2 : 0), hp: 40 + 10 * (L - 5), speed: 'walk 30, fly 40', multi: Math.floor(L / 2), attacks: k === 'Avenger' ? [['Radiant Bow', atk, `2d6+${2 + L}`, 'radiant, 150 ft']] : [['Radiant Mace', atk, `1d10+${3 + L}`, 'radiant']], notes: `Healing Touch (1/day): 2d8+${L}` }) },
  'Summon Fiend': { min: 6, kinds: ['Demon', 'Devil', 'Yugoloth'], make: (L, k, atk) => ({ ac: 12 + L, hp: (k === 'Demon' ? 50 : k === 'Devil' ? 40 : 60) + 15 * (L - 6), speed: k === 'Devil' ? 'walk 40, fly 60' : 'walk 40', multi: Math.floor(L / 2), attacks: k === 'Demon' ? [['Bite', atk, `1d12+${3 + L}`, 'necrotic']] : k === 'Devil' ? [['Hurl Flame', atk, `2d6+${3 + L}`, 'fire, 150 ft']] : [['Claws', atk, `1d8+${3 + L}`, 'slashing']], notes: 'Magic resistance' }) },
  'Summon Draconic Spirit': { min: 5, kinds: ['Chromatic', 'Gem', 'Metallic'], make: (L, k, atk) => ({ ac: 14 + L, hp: 50 + 10 * (L - 5), speed: 'walk 30, fly 60, swim 30', multi: Math.floor(L / 2), attacks: [['Rend', atk, `1d6+${4 + L}`, 'piercing'], ['Breath (15 ft cone, DEX save)', '', '2d6', 'elemental']], notes: 'Shared resistance' }) }
};
// Class companions: level = relevant class level
DND.companions = {
  'Steel Defender': (lv, pb, m, atk) => ({ ac: 15, hp: 2 + m + 5 * lv, speed: 'walk 40', attacks: [['Force-Empowered Rend', atk, `1d8+${pb}`, 'force'], ['Repair', '', `2d8+${pb}`, 'itself or a construct or object within 5 ft', 'heal', '', '', 'construct', 3]], notes: `Shares your initiative and acts right after you. It moves and uses its reaction on its own, but its only action is Dodge unless you use a bonus action to command it (or you're incapacitated). Reaction — Deflect Attack: impose disadvantage on one attack roll against a creature other than itself within 5 ft. Immune to poison damage and to being charmed, exhausted, poisoned or surprised. Darkvision 60 ft.` }),
  'Eldritch Cannon': (lv, pb, m, atk) => ({ ac: 18, hp: 5 * lv, speed: 'walk 15', attacks: [['Force Ballista', atk, lv >= 9 ? '3d8' : '2d8', 'force (push 5 ft)'], ['Flamethrower (DEX save)', '', lv >= 9 ? '3d8' : '2d8', 'fire']], notes: `Protector: 1d8+${m} temp HP to allies within 10 ft` }),
  'Homunculus Servant': (lv, pb, m, atk) => ({ ac: 13, hp: 1 + m + lv, speed: 'walk 20, fly 30', attacks: [['Force Strike', atk, `1d4+${pb}`, 'force, 30 ft']], notes: 'Channel Magic: deliver your touch spells' }),
  'Primal Companion (Land)': (lv, pb, m, atk) => ({ ac: 13 + pb, hp: 5 + 5 * lv, speed: 'walk 40, climb 40', attacks: [['Maul', atk, `1d8+${2 + pb}`, 'slashing (prone after charge)']], notes: 'Charge; Primal Bond' }),
  'Primal Companion (Sea)': (lv, pb, m, atk) => ({ ac: 13 + pb, hp: 5 + 5 * lv, speed: 'walk 5, swim 60', attacks: [['Binding Strike', atk, `1d6+${2 + pb}`, 'piercing or bludgeoning (grapple)']], notes: 'Amphibious' }),
  'Primal Companion (Sky)': (lv, pb, m, atk) => ({ ac: 13 + pb, hp: 4 + 4 * lv, speed: 'walk 10, fly 60', attacks: [['Shred', atk, `1d4+${3 + pb}`, 'slashing']], notes: 'Flyby' }),
  'Drake Companion': (lv, pb, m, atk) => ({ ac: 14 + pb, hp: 5 + 5 * lv, speed: 'walk 40' + (lv >= 7 ? ', fly 40' : ''), attacks: [['Bite', atk, `1d6+${pb}` + (lv >= 7 ? '+1d6' : ''), 'piercing + elemental']], notes: 'Infused Strike reaction (+1d6)' }),
  'Wildfire Spirit': (lv, pb, m, atk) => ({ ac: 13, hp: 5 + 5 * lv, speed: 'walk 30, fly 30', attacks: [['Flame Seed', atk, `1d6+${pb}`, 'fire, 60 ft'], ['Fiery Teleportation', '', `1d6+${pb}`, `fire to each creature within 5 ft of where it left (DC ${8 + pb + m} DEX save negates)`]], notes: 'Fiery Teleportation (bonus action): the spirit and each willing creature within 5 ft of it teleport up to 15 ft; creatures within 5 ft of the space it left take the fire damage.' }),
  'Dancing Item': (lv, pb, m, atk) => ({ ac: 16, hp: 10 + 5 * lv, speed: 'walk 30, fly 30', attacks: [['Force-Empowered Slam', atk, `1d10+${pb}`, 'force']], notes: 'Irrepressible Dance' })
};

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

// Deck of Many Things (DMG, 13- or 22-card) and the Deck of Many More Things (Book of Many Things). Short summaries.
// fx: what the sheet does automatically when the card is drawn (see applyCardFx). gone: the card leaves the deck for good.
DND.deckCards = {
  // ---- Deck of Many Things (DMG). in13: part of the 13-card deck ----
  Vizier: { in13: 1, text: 'Within one year you can ask one question in meditation and get a truthful answer, with insight on how to use it.', fx: { feature: { name: 'Vizier (Deck)', desc: 'Once within a year: meditate on a question and receive a truthful answer and the wisdom to apply it.', max: '1', reset: 'none' } } },
  Sun: { in13: 1, text: 'You gain 50,000 XP, and a wondrous item (DM\'s choice) appears in your hands.', fx: { xp: 50000, item: { name: 'Wondrous item (from the Sun card)', notes: 'Your DM decides what it is.' } } },
  Moon: { in13: 1, text: 'You can cast wish 1d3 times.', fx: { feature: { name: 'Moon (Deck): Wish', desc: 'You can cast wish this many times (rolled when you drew the Moon).', maxRoll: '1d3', reset: 'none', spells: ['Wish'] } } },
  Star: { in13: 1, text: 'Increase one ability score by 2 (to a maximum of 24).', fx: { abilityChoice: 2, max: 24 } },
  Comet: { in13: 1, text: 'If you single-handedly defeat the next hostile monster or group you encounter, you gain enough XP for one level.', fx: { feature: { name: 'Comet (Deck)', desc: 'Defeat the next hostile encounter alone to gain enough XP for one level. No effect otherwise.' } } },
  Fates: { in13: 1, text: 'Reality\'s fabric unravels: you can avoid or erase one event as if it never happened, any time before you die.', fx: { feature: { name: 'The Fates (Deck)', desc: 'Once, at any time before you die: avoid or erase one event as if it never happened.', max: '1', reset: 'none' } } },
  Throne: { in13: 1, text: 'You gain Persuasion proficiency with double your proficiency bonus, and rightful ownership of a small keep (currently held by monsters).', fx: { expertise: 'Persuasion', feature: { name: 'Throne (Deck)', desc: 'You are the rightful owner of a small keep somewhere in the world — but monsters hold it, and you must clear them out.' } } },
  Key: { in13: 1, text: 'A rare or rarer magic weapon you are proficient with appears in your hands (DM\'s choice).', fx: { item: { name: 'Magic weapon (from the Key card)', notes: 'Rare or rarer, one you are proficient with — your DM decides.' } } },
  Knight: { in13: 1, text: 'You gain a loyal 4th-level fighter of your race who serves you until death.', fx: { companion: { name: 'Knight (4th-level fighter)', ac: 18, hp: 36, speed: '30 ft', attacks: [['Longsword', 5, '1d8+3', 'slashing']], notes: 'Loyal until death; believes fate drew them to you.' } } },
  Gem: { in13: 1, text: 'Twenty-five pieces of jewelry worth 2,000 gp each or fifty gems worth 1,000 gp each appear at your feet.', fx: { choice: [['25 pieces of jewelry (2,000 gp each)', { item: { name: 'Jewelry (2,000 gp each)', qty: 25 } }], ['50 gems (1,000 gp each)', { item: { name: 'Gems (1,000 gp each)', qty: 50 } }]] } },
  Talons: { in13: 1, text: 'Every magic item you wear or carry disintegrates (artifacts vanish instead).', fx: { removeMagic: true } },
  Void: { in13: 1, text: 'Your soul is drawn into an object in a place of the DM\'s choice; your body is incapacitated. You draw no more cards.', fx: { cond: 'Incapacitated', stop: true, feature: { name: 'The Void (Deck)', desc: 'Your soul is trapped in an object somewhere; your body is incapacitated. Wish can reveal where, but not free it.' } } },
  Flames: { in13: 1, text: 'A powerful devil becomes your enemy and seeks your ruin until one of you dies.', fx: { person: { name: 'A powerful devil', rel: 'Sworn enemy (Flames card)', att: 'enemy' } } },
  // 22-card deck only
  Balance: { text: 'Your alignment changes: lawful ↔ chaotic, good ↔ evil.', fx: { alignment: 'flip' } },
  Donjon: { text: 'You vanish into suspended animation in an extradimensional sphere. You draw no more cards.', fx: { stop: true, feature: { name: 'Donjon (Deck)', desc: 'You are imprisoned in suspended animation; divination can\'t find you, but wish reveals the prison.' } } },
  Ruin: { text: 'All forms of wealth you carry or own, other than magic items, are lost.', fx: { ruin: true } },
  Euryale: { text: 'A medusa-like curse: −2 to saving throws. Only a god or the Fates card can end it.', fx: { saveMod: -2, feature: { name: 'Euryale\'s Curse (Deck)', desc: '−2 penalty on saving throws (applied automatically). Only a god or the Fates card ends it.' } } },
  Rogue: { text: 'A nonplayer character of the DM\'s choice becomes hostile toward you; you don\'t know who.', fx: { person: { name: 'Unknown rogue', rel: 'Secret enemy (Rogue card)', att: 'enemy' } } },
  Skull: { text: 'An avatar of death appears and fights you alone; anyone it slays can\'t be restored to life.', fx: { feature: { name: 'Skull (Deck)', desc: 'An avatar of death appeared to fight you. Allies who help summon their own avatars.' } } },
  Idiot: { text: 'Permanently reduce your Intelligence by 1d4 + 1 (minimum 1). You can draw one additional card.', fx: { abilityDown: ['int', '1d4+1'], extra: 1 } },
  Fool: { gone: 1, text: 'You lose 10,000 XP, discard this card and draw again (both count as one draw).', fx: { xp: -10000, extra: 1 } },
  Jester: { gone: 1, text: 'You gain 10,000 XP, or you can draw two additional cards.', fx: { choice: [['Gain 10,000 XP', { xp: 10000 }], ['Draw two more cards', { extra: 2 }]] } }
};
DND.moreCards = {
  Aberration: { text: 'You gain telepathy out to 90 feet.', fx: { feature: { name: 'Telepathy 90 ft (Deck)', desc: 'You can communicate telepathically with creatures within 90 feet.' } } },
  Balance: DND.deckCards.Balance,
  Beast: { text: 'You turn into a random beast of CR 5 or lower for 2d12 days.', fx: { roll: '2d12', feature: { name: 'Beast (Deck)', desc: 'Transformed into a beast of CR 5 or lower for the rolled number of days. Use the Creatures tab to track the form.' } } },
  Book: { text: 'You can speak, read and write 1d6 + 2 languages of your choice.', fx: { roll: '1d6+2', feature: { name: 'Book (Deck)', desc: 'Learn the rolled number of languages of your choice — add them in Proficiencies & Languages.' } } },
  Bridge: { text: 'You can cast time stop 1d3 times (INT, WIS or CHA).', fx: { feature: { name: 'Bridge (Deck): Time Stop', desc: 'Cast time stop this many times, no slot.', maxRoll: '1d3', reset: 'none', spells: ['Time Stop'] } } },
  Campfire: { text: 'You immediately gain the benefits of a long rest.', fx: { longRest: true } },
  Cavern: { text: 'You gain a climbing speed equal to your walking speed and can climb ceilings.', fx: { feature: { name: 'Cavern (Deck)', desc: 'Climbing speed equal to your walking speed; you can move up, down and across vertical surfaces and ceilings.' } } },
  Celestial: { text: 'You sprout luminous wings and gain a 30 ft flying speed.', fx: { feature: { name: 'Celestial Wings (Deck)', desc: 'Flying speed 30 ft.' } } },
  Comet: DND.deckCards.Comet,
  Construct: { text: 'A homunculus appears and treats you as its creator.', fx: { companion: { name: 'Homunculus', ac: 13, hp: 5, speed: '20 ft, fly 40 ft', attacks: [['Bite', 4, '1', 'piercing']], notes: 'Bite: DC 10 CON save or poisoned 1 minute (unconscious if it fails by 5+). Treats you as its creator.' } } },
  Corpse: { text: 'You drop to 0 hit points and start making death saving throws.', fx: { hp0: true } },
  Crossroads: { text: 'Roll a d20: even, you age 1d10 years; odd, you become 1d10 years younger.', fx: { roll: '1d20', feature: { name: 'Crossroads (Deck)', desc: 'Even d20: you aged 1d10 years. Odd: you became 1d10 years younger.' } } },
  Donjon: DND.deckCards.Donjon,
  Door: { text: 'You can cast gate 1d4 times, no material components.', fx: { feature: { name: 'Door (Deck): Gate', desc: 'Cast gate this many times without material components.', maxRoll: '1d4', reset: 'none', spells: ['Gate'] } } },
  Dragon: { text: 'A dragon wyrmling hatches at your feet and sees you as its parent.', fx: { companion: { name: 'Dragon wyrmling', ac: 17, hp: 33, speed: '30 ft, fly 60 ft', attacks: [['Bite', 4, '1d10+2', 'piercing']], notes: 'Has a breath weapon; type up to your DM. Sees you as its parent.' } } },
  Elemental: { text: 'You become immune to acid, cold, fire, lightning or thunder damage (your choice).', fx: { choice: ['acid', 'cold', 'fire', 'lightning', 'thunder'].map(t => [t[0].toUpperCase() + t.slice(1), { feature: { name: `Immune to ${t} (Deck)`, desc: `You are immune to ${t} damage.` } }]) } },
  Euryale: DND.deckCards.Euryale,
  Expert: { text: 'Your Dexterity increases by 2 (maximum 22).', fx: { ability: ['dex', 2, 22] } },
  Fates: DND.deckCards.Fates,
  Fey: { text: 'A portal to the Feywild opens and pulls you through.', fx: { feature: { name: 'Fey (Deck)', desc: 'You were pulled through a portal into the Feywild.' } } },
  Fiend: { text: 'A powerful fiend offers you a deal in exchange for a task.', fx: { feature: { name: 'Fiend (Deck)', desc: 'A powerful fiend has offered you a bargain for a task.' } } },
  Flames: DND.deckCards.Flames,
  Fool: DND.deckCards.Fool,
  Gem: DND.deckCards.Gem,
  Giant: { text: 'You grow 2d10 inches; your hit point maximum and current hit points increase by 20.', fx: { maxhp: 20 } },
  Humanoid: { text: 'You can choose to stop drawing now, whatever you declared.', fx: { mayStop: true } },
  Jester: DND.deckCards.Jester,
  Key: DND.deckCards.Key,
  Knight: DND.deckCards.Knight,
  Lance: { text: 'Every ability score increases by 1 (maximum 20).', fx: { all: 1, max: 20 } },
  Mage: { text: 'Your Intelligence increases by 2 (maximum 22).', fx: { ability: ['int', 2, 22] } },
  Map: { text: 'Within a year you can mentally locate one familiar object or person exactly.', fx: { feature: { name: 'Map (Deck)', desc: 'Once within a year: learn the exact location of an object or person you know.', max: '1', reset: 'none' } } },
  Maze: { text: 'You gain 1d3 levels of exhaustion.', fx: { exh: '1d3' } },
  Mine: { text: '2d6 gems (5,000 gp each) and 1d10 chunks of ore (2,500 gp each) appear.', fx: { itemsRoll: [['Gems (5,000 gp each)', '2d6'], ['Ore chunks (2,500 gp each)', '1d10']] } },
  Monstrosity: { text: 'A Large or larger hostile monstrosity of CR 10 or lower appears and attacks.', fx: { feature: { name: 'Monstrosity (Deck)', desc: 'A hostile monstrosity appeared and attacked.' } } },
  Moon: DND.deckCards.Moon,
  Ooze: { text: 'A gelatinous cube appears in your space and engulfs you.', fx: { feature: { name: 'Ooze (Deck)', desc: 'A gelatinous cube engulfed you.' } } },
  Path: { text: 'Your walking speed increases by 10 feet.', fx: { speed: 10 } },
  Pit: { text: 'You fall 3d6 × 10 feet, take falling damage and land prone.', fx: { pit: true } },
  Plant: { text: 'You can cast speak with plants without a slot once per long rest.', fx: { feature: { name: 'Plant (Deck)', desc: 'Cast speak with plants once per long rest, no slot.', max: '1', reset: 'long', spells: ['Speak with Plants'] } } },
  Priest: { text: 'Your Wisdom increases by 2 (maximum 22).', fx: { ability: ['wis', 2, 22] } },
  Prisoner: { text: 'Magic chains restrain you; you can\'t cast spells and your magic items are suppressed until freed.', fx: { cond: 'Restrained', feature: { name: 'Prisoner (Deck)', desc: 'Restrained by magical chains; no spellcasting and magic items suppressed until freed.' } } },
  Puzzle: { text: 'Reduce your Intelligence by 1d4 + 1. You can draw one additional card.', fx: { abilityDown: ['int', '1d4+1'], extra: 1 } },
  Ring: { text: 'A rare or rarer magic ring appears; you attune to it if you have a free slot.', fx: { item: { name: 'Magic ring (from the Ring card)', notes: 'Rare or rarer — your DM decides.' } } },
  Rogue: DND.deckCards.Rogue,
  Ruin: DND.deckCards.Ruin,
  Sage: { text: 'Within a year you can ask one question in meditation and get a truthful answer.', fx: { feature: { name: 'Sage (Deck)', desc: 'Once within a year: a truthful answer to one question.', max: '1', reset: 'none' } } },
  Shield: { text: 'A rare or rarer suit of magic armor appears.', fx: { item: { name: 'Magic armor (from the Shield card)', notes: 'Rare or rarer — your DM decides.' } } },
  Ship: { text: 'You gain proficiency in three skills of the DM\'s choice.', fx: { feature: { name: 'Ship (Deck)', desc: 'You gained proficiency in three skills chosen by your DM — mark them on the Core tab.' } } },
  Skull: DND.deckCards.Skull,
  Staff: { text: 'A rare or rarer magic rod, staff or wand appears.', fx: { item: { name: 'Magic rod, staff or wand (from the Staff card)', notes: 'Rare or rarer — your DM decides.' } } },
  Stairway: { text: 'Reduce your declared draws by 2, or receive a rare or rarer wondrous item.', fx: { choice: [['Draw two fewer cards', { extra: -2 }], ['Take a wondrous item', { item: { name: 'Wondrous item (from the Stairway card)', notes: 'Rare or rarer — your DM decides.' } }]] } },
  Star: DND.deckCards.Star,
  Statue: { text: 'You are petrified (turned to marble) until freed by greater restoration or similar magic.', fx: { cond: 'Petrified' } },
  Sun: DND.deckCards.Sun,
  Talons: DND.deckCards.Talons,
  Tavern: { text: 'Your Charisma increases by 2 (maximum 22).', fx: { ability: ['cha', 2, 22] } },
  Temple: { text: 'A deity takes an interest in you and may aid you once through divine intervention.', fx: { feature: { name: 'Temple (Deck)', desc: 'A deity has bound itself to aid you once (divine intervention or resurrection).', max: '1', reset: 'none' } } },
  Throne: DND.deckCards.Throne,
  Tomb: { text: 'Within a year you can cast true resurrection once, no slot or components.', fx: { feature: { name: 'Tomb (Deck)', desc: 'Once within a year: cast true resurrection without a slot or components.', max: '1', reset: 'none', spells: ['True Resurrection'] } } },
  Tower: { text: 'Draw two additional cards, keep one and return the other.', fx: { extra: 2, feature: { name: 'Tower (Deck)', desc: 'Of the next two cards, keep one and return the other to the deck.' } } },
  Tree: { text: 'Your base AC becomes 15 + your Dexterity modifier, and you gain vulnerability to fire damage.', fx: { feature: { name: 'Tree (Deck)', desc: 'Your base AC is 15 + DEX (set it with the AC tile), and you are vulnerable to fire damage.' } } },
  Undead: { text: 'A revenant rises and hunts you for a year or until one of you dies.', fx: { person: { name: 'Revenant', rel: 'Hunting you (Undead card)', att: 'enemy' } } },
  Void: DND.deckCards.Void,
  Warrior: { text: 'Your Strength increases by 2 (maximum 22).', fx: { ability: ['str', 2, 22] } },
  Well: { text: 'You learn three cantrips from any spell list.', fx: { feature: { name: 'Well (Deck)', desc: 'You learned three cantrips from any class — tap ✎ and add them under "Spells from this feature".' } } }
};

// What features actually do on the sheet. Keys: feature name, or "subclass:Name" / "class:Name" when names repeat.
// col: action|bonus|reaction · cost {from: feature name, n} · roll (tokens: 1sup, 1ma, 1bi, 1psi; {formula}) · dc: 'spell'|'wis'|'str|dex' + save 'CON'
// use {effect {name, rounds, buff}, cond, condRounds, temp, heal} · acts [{name, col, cost (true = this feature), roll, use, text, dc, save}]
// passive {ac, acArmor, acHeavy, acNoArmor, speed, speedNoHeavy, speedNoArmor, fly, swim, climb, init, initAdv, saveAll, saveProf, skillExp, skillProf,
//          resist, immune, condImmune, advNote, carry, everyHit, abil, min (class level), when 'conc', effect (only while that effect runs)}
// raging {same as passive, only while raging} · onlyRaging · resource (spent by other options, no Use of its own) · spells / spellsAt {level: [...]} · attacks [[name, dice, type, ab, extra]]
// target 'forge' (Blessing of the Forge picker)
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  DND.featFx = {
    // ---- Barbarian ----
    'Rage': { raging: { resist: BPS, advNote: 'STR checks and saves (rage)' } },
    'Reckless Attack': { col: 'action', use: R('Reckless Attack', 1, { atkAdv: 'Reckless Attack', note: 'Attacks against you have advantage until your next turn' }) },
    'Danger Sense': { passive: { advNote: 'DEX saves vs effects you can see (Danger Sense)' } },
    'Feral Instinct': { passive: { initAdv: true } },
    'Relentless Rage': { onlyRaging: true, text: 'DC 10 CON save to drop to 1 HP instead (+5 each use)' },
    'Primal Champion': { passive: { abil: { str: 4, con: 4 }, abilMax: 24 } },
    'Frenzy': { col: 'bonus', onlyRaging: true },
    'Mindless Rage': { raging: { condImmune: ['Charmed', 'Frightened'] } },
    'Intimidating Presence': { col: 'action', dc: 'cha', save: 'WIS' },
    'Retaliation': { col: 'reaction' },
    'Spirit Seeker': { spells: ['Beast Sense', 'Speak with Animals'], spellNote: 'Ritual only', spellCls: 'other' },
    'Spirit Walker': { spells: ['Commune with Nature'], spellNote: 'Ritual only', spellCls: 'other' },
    'Totem Spirit': { dc: false }, 'Aspect of the Beast': { dc: false }, 'Totemic Attunement': { dc: false },
    'Spirit Shield': { col: 'reaction', onlyRaging: true, roll: '{tier(barbarian,6,2,10,3,14,4)}d6', rollNote: 'damage prevented' },
    'Divine Fury': { col: 'action', onlyRaging: true, roll: '1d6+{floor(barbarian/2)}', rollNote: 'radiant or necrotic, first hit each turn' },
    'Zealous Presence': { col: 'bonus' },
    'Form of the Beast': { onlyRaging: false },
    'Battlerager Charge': { col: 'bonus', onlyRaging: true, dash: true },
    'Battlerager Armor': { col: 'bonus', onlyRaging: true, roll: '1d4+str', rollNote: 'piercing spike attack' },
    'Mighty Impel': { col: 'bonus', onlyRaging: true },
    'Elemental Cleaver': { raging: { everyHit: '1d6 elemental (Elemental Cleaver)' } },
    "Giant's Power": { spells: ['Thaumaturgy'], spellCls: 'other' },
    // ---- Bard ----
    'Bardic Inspiration': { roll: '1bi', rollNote: 'the die you give (they roll it)' },
    'Jack of All Trades': { dc: false },
    'Countercharm': { col: 'action' },
    'Cutting Words': { col: 'reaction', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'subtract from the roll' },
    'Peerless Skill': { cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi' },
    'Mantle of Inspiration': { col: 'bonus', cost: { from: 'Bardic Inspiration', n: 1 }, text: 'Temp HP to up to CHA mod creatures: 5 (8 at 5th, 11 at 10th, 14 at 15th)' },
    'Blade Flourish': { col: 'action', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'flourish damage (Defensive adds it to AC)' },
    'swords:Fighting Style': { dc: false },
    'whispers:Psychic Blades': { col: 'action', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '{tier(bard,3,2,5,3,10,5,15,8)}d6', rollNote: 'psychic' },
    'Unsettling Words': { col: 'bonus', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'subtract from its next save' },
    'Tales from Beyond': { col: 'bonus', cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1d6', rollNote: 'Spirit Tales table' },
    'Guiding Whispers': { spells: ['Guidance'] },
    'Spiritual Focus': { roll: '1d6', rollNote: 'added to one damage or healing roll' },
    // ---- Cleric ----
    'cleric:Channel Divinity': { resource: true },
    'Turn Undead': { col: 'action', cost: { from: 'Channel Divinity', n: 1 }, dc: 'spell', save: 'WIS' },
    'Blessings of Knowledge': {},
    'Channel Divinity: Knowledge of the Ages': { col: 'action' },
    'Channel Divinity: Read Thoughts': { col: 'action', dc: 'spell', save: 'WIS' },
    'Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'Disciple of Life': { passive: { healBonus: true } },
    'Channel Divinity: Preserve Life': { col: 'action', text: 'Distribute {5*cleric} HP' },
    'Blessed Healer': {},
    'life:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'radiant, once per turn on a weapon hit' },
    'Supreme Healing': {},
    'Bonus Cantrip': { spells: [] },
    'light:Bonus Cantrip': { spells: ['Light'] },
    'Channel Divinity: Radiance of the Dawn': { col: 'action', dc: 'spell', save: 'CON', roll: '2d10+cleric', rollNote: 'radiant (half on a save)' },
    'Corona of Light': { col: 'action' },
    'Channel Divinity: Charm Animals and Plants': { col: 'action', dc: 'spell', save: 'WIS' },
    'Dampen Elements': { col: 'reaction' },
    'nature:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'cold, fire or lightning, once per turn on a weapon hit' },
    'nature:Bonus Proficiency': { passive: {} },
    'Wrath of the Storm': { roll: '2d8', rollNote: 'lightning or thunder (DEX half)', dc: 'spell', save: 'DEX' },
    'Channel Divinity: Destructive Wrath': { col: 'action', text: 'Maximize one lightning or thunder damage roll' },
    'tempest:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'thunder, once per turn on a weapon hit' },
    'Stormborn': { passive: { fly: 'walk' } },
    'Blessing of the Trickster': { col: 'action' },
    'Channel Divinity: Invoke Duplicity': { col: 'action', use: R('Invoke Duplicity', 10, { note: 'Illusory duplicate: cast through it; advantage when you and it are both within 5 ft of a target' }, { conc: false }) },
    'Channel Divinity: Cloak of Shadows': { col: 'action', use: { cond: 'Invisible', condRounds: 1 } },
    'trickery:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'poison, once per turn on a weapon hit' },
    'War Priest': { col: 'bonus' },
    'Channel Divinity: Guided Strike': { col: 'action', text: '+10 to one attack roll (after you see the d20)' },
    "Channel Divinity: War God's Blessing": { col: 'reaction', text: '+10 to an ally’s attack roll within 30 ft' },
    'war:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'weapon’s damage type, once per turn on a weapon hit' },
    'Avatar of Battle': { passive: { resist: ['nonmagical bludgeoning, piercing and slashing'] } },
    'Blessing of the Forge': { target: 'forge' },
    "Channel Divinity: Artisan's Blessing": { col: 'action' },
    'Soul of the Forge': { passive: { resist: ['fire'] } },
    'forge:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'fire, once per turn on a weapon hit' },
    'Saint of Forge and Fire': { passive: { immune: ['fire'] } },
    'Circle of Mortality': { spells: ['Spare the Dying'] },
    'Eyes of the Grave': { col: 'action' },
    'Channel Divinity: Path to the Grave': { col: 'action' },
    "Sentinel at Death's Door": { col: 'reaction' },
    "Channel Divinity: Order's Demand": { col: 'action', dc: 'spell', save: 'WIS' },
    'order:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'psychic, once per turn on a weapon hit' },
    'Emboldening Bond': { col: 'action' },
    'Channel Divinity: Balm of Peace': { col: 'action', roll: '2d6+wis', rollNote: 'healing to each creature you pass' },
    'Eyes of Night': { passive: { sense: 'Darkvision 300 ft (Eyes of Night)' } },
    'Vigilant Blessing': { col: 'action' },
    'Channel Divinity: Twilight Sanctuary': { col: 'action', roll: '1d6+cleric', rollNote: 'temp HP (or end charm/fear)' },
    'twilight:Divine Strike': { col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: 'radiant, once per turn on a weapon hit' },
    'Steps of Night': { col: 'bonus', use: R('Steps of Night', 10, { fly: 30, note: 'Fly speed in dim light or darkness' }) },
    'Arcane Initiate': { passive: { skillProf: ['Arcana'] } },
    'Channel Divinity: Arcane Abjuration': { col: 'action', dc: 'spell', save: 'WIS' },
    // ---- Druid ----
    'Natural Recovery': { text: 'Recover slots totaling half your druid level (rounded up)' },
    "Nature's Ward": { passive: { immune: ['poison'], condImmune: ['Poisoned'], advNote: "Can't be charmed or frightened by elementals or fey" } },
    'Halo of Spores': { col: 'reaction', dc: 'spell', save: 'CON', roll: '1d{tier(druid,2,4,6,6,10,8,14,10)}', rollNote: 'necrotic' },
    'Symbiotic Entity': { col: 'action', cost: { from: 'Wild Shape', n: 1 }, use: Object.assign(R('Symbiotic Entity', 100, { dmgDice: '1d6 necrotic', note: 'Halo of Spores dice doubled' }), { temp: '4*druid' }) },
    'Fungal Body': { passive: { condImmune: ['Blinded', 'Deafened', 'Frightened', 'Poisoned'] } },
    'Spreading Spores': { col: 'bonus' },
    'Starry Form': { col: 'bonus', cost: { from: 'Wild Shape', n: 1 }, acts: [
      { name: 'Archer', col: 'bonus', cost: { from: 'Wild Shape', n: 1 }, use: R('Starry Form: Archer', 100, { note: 'Bonus action: ranged spell attack 1d8 + WIS radiant' }), text: 'Ranged spell attack, 60 ft, 1d8 + WIS radiant' },
      { name: 'Chalice', col: 'bonus', cost: { from: 'Wild Shape', n: 1 }, use: R('Starry Form: Chalice', 100, { note: 'Healing spells: another creature regains 1d8 + WIS' }) },
      { name: 'Dragon', col: 'bonus', cost: { from: 'Wild Shape', n: 1 }, use: R('Starry Form: Dragon', 100, { note: 'Treat d20 rolls of 9 or lower as 10 on INT/WIS checks and concentration saves' }) }] },
    'Star Map': { spells: ['Guidance', 'Guiding Bolt'], spellNote: 'Guiding Bolt without a slot (prof times per long rest)' },
    'Cosmic Omen': { roll: '1d6' },
    'Full of Stars': { passive: { effect: 'Starry Form: Archer', resist: BPS } },
    'Speech of the Woods': { spells: ['Speak with Animals'] },
    'Spirit Totem': { col: 'bonus' },
    'Summon Wildfire Spirit': { col: 'action', cost: { from: 'Wild Shape', n: 1 }, dc: 'spell', save: 'DEX', roll: '2d6', rollNote: 'fire to each creature within 10 ft of where it appears (DEX save negates)' },
    'Cauterizing Flames': { roll: '2d10+wis', rollNote: 'healing or fire damage (your choice)', healRoll: true },
    'Enhanced Bond': { passive: { advNote: 'While your Wildfire Spirit is summoned: +1d8 to fire damage and healing spells' } },
    'Hidden Paths': { col: 'bonus' },
    // ---- Fighter ----
    'Second Wind': { healRoll: true },
    'Action Surge': { use: { resetTurn: true } },
    'Indomitable': { text: 'Reroll a failed save' },
    'Combat Superiority': { resource: true },
    'Remarkable Athlete': {},
    'Survivor': { text: 'Start of turn at half HP or less: regain 5 + CON' },
    'Unwavering Mark': { col: 'bonus', text: 'Bonus-action attack against a marked creature that hit someone else' },
    'Warding Maneuver': { roll: '1d8', rollNote: 'added to the ally’s AC' },
    'Fighting Spirit': { use: Object.assign(R('Fighting Spirit', 1, { atkAdv: 'Fighting Spirit' }), { temp: '{tier(fighter,3,5,10,10,15,15)}' }) },
    'Psionic Power': { resource: true, acts: [
      { name: 'Protective Field', col: 'reaction', cost: true, roll: '1psi+int', rollNote: 'damage reduced' },
      { name: 'Psionic Strike', col: 'action', cost: true, roll: '1psi+int', rollNote: 'force damage (once per turn on a hit)' },
      { name: 'Telekinetic Movement', col: 'action', cost: true, text: 'Move a Large or smaller object or willing creature up to 30 ft' }] },
    'Guarded Mind': { passive: { resist: ['psychic'] } },
    'Bulwark of Force': { col: 'bonus' },
    "Giant's Might": { use: R("Giant's Might", 10, { dmgDice: '1d{tier(fighter,3,6,10,8,18,10)}', note: 'Large; advantage on STR checks and saves; extra damage once per turn' }) },
    'Runic Shield': { col: 'reaction' },
    // ---- Monk ----
    'Ki': { resource: true, acts: [
      { name: 'Flurry of Blows', col: 'bonus', cost: true, text: 'Two unarmed strikes after the Attack action' },
      { name: 'Patient Defense', col: 'bonus', cost: true, use: { cond: 'Dodging' }, text: 'Take the Dodge action' },
      { name: 'Step of the Wind', col: 'bonus', cost: true, dash: true, text: 'Dash or Disengage; jump distance doubled' }] },
    'Martial Arts': { col: 'bonus', text: 'One unarmed strike as a bonus action after the Attack action' },
    'Deflect Missiles': { col: 'reaction', cost: null, roll: '1d10+dex+monk', rollNote: 'damage reduced; at 0, spend 1 ki to throw it back', dc: false },
    'Slow Fall': { col: 'reaction', text: 'Reduce falling damage by {5*monk}' },
    'Stunning Strike': { col: 'action', cost: { from: 'Ki', n: 1 }, dc: 'wis', save: 'CON', text: 'On a melee hit: stunned until the end of your next turn on a failed save' },
    'Evasion': { passive: { advNote: 'DEX saves for half: no damage on a success (Evasion)' } },
    'Stillness of Mind': { col: 'action' },
    'Purity of Body': { passive: { immune: ['poison'], condImmune: ['Poisoned', 'Diseased'] } },
    'Diamond Soul': { passive: { saveProf: 'all' }, acts: [{ name: 'Reroll a save', cost: { from: 'Ki', n: 1 } }] },
    'Empty Body': { col: 'action', cost: { from: 'Ki', n: 4 }, use: Object.assign(R('Empty Body', 10, { note: 'Invisible; resistance to all damage but force' }), { cond: 'Invisible', condRounds: 10 }) },
    'Open Hand Technique': { dc: 'wis' },
    'Wholeness of Body': { col: 'action', roll: '3*monk', healRoll: true },
    'Quivering Palm': { col: 'action', cost: { from: 'Ki', n: 3 }, dc: 'wis', save: 'CON', roll: '10d10', rollNote: 'necrotic on a successful save' },
    'Shadow Arts': { spells: ['Darkness', 'Darkvision', 'Pass without Trace', 'Silence', 'Minor Illusion'], spellNote: '2 ki each (Minor Illusion is free)' },
    'Shadow Step': { col: 'bonus' },
    'shadow:Cloak of Shadows': { col: 'action', use: { cond: 'Invisible' } },
    'Opportunist': { col: 'reaction' },
    'Drunken Technique': { dc: false },
    'Tipsy Sway': { col: 'reaction', cost: { from: 'Ki', n: 1 } },
    "Drunkard's Luck": { cost: { from: 'Ki', n: 2 } },
    'Sharpen the Blade': { col: 'bonus' },
    'Touch of Death': { use: { temp: 'wis+monk' } },
    'Hour of Reaping': { col: 'action', dc: 'wis', save: 'WIS' },
    'Mastery of Death': { cost: { from: 'Ki', n: 1 } },
    'Touch of the Long Death': { col: 'action', dc: 'wis', save: 'CON', text: '2d10 necrotic per ki spent (1–10)' },
    'Radiant Sun Bolt': { col: 'action', roll: '1ma+dex', rollNote: 'radiant (ranged spell attack, 30 ft)' },
    'Searing Arc Strike': { col: 'bonus', cost: { from: 'Ki', n: 2 } },
    'Searing Sunburst': { col: 'action', dc: 'wis', save: 'CON', roll: '2d6', rollNote: 'radiant (+2d6 per ki, max 3)' },
    'Hand of Healing': { col: 'action', cost: { from: 'Ki', n: 1 }, roll: '1ma+wis', rollNote: 'healing', healRoll: true },
    'Hand of Harm': { col: 'action', cost: { from: 'Ki', n: 1 }, roll: '1ma+wis', rollNote: 'necrotic' },
    'Arms of the Astral Self': { col: 'bonus', cost: { from: 'Ki', n: 1 }, use: R('Arms of the Astral Self', 100, { note: 'Unarmed strikes use WIS, +5 ft reach, force damage' }), dc: 'wis', save: 'DEX' },
    'Visage of the Astral Self': { col: 'bonus', cost: { from: 'Ki', n: 1 } },
    'Breath of the Dragon': { col: 'action', dc: 'wis', save: 'DEX', roll: '2ma', rollNote: 'acid, cold, fire, lightning or poison' },
    'Aspect of the Wyrm': { col: 'bonus' },
    // ---- Paladin ----
    'paladin:Channel Divinity': { resource: true },
    'Divine Health': { passive: { condImmune: ['Diseased'] } },
    'Aura of Courage': { passive: { condImmune: ['Frightened'] } },
    'Improved Divine Smite': { passive: { everyHit: '1d8 radiant (melee)' } },
    'Channel Divinity: Sacred Weapon': { col: 'action', use: R('Sacred Weapon', 10, { atk: 'max(1,cha)', note: 'Weapon is magical and sheds light' }) },
    'Channel Divinity: Turn the Unholy': { col: 'action', dc: 'spell', save: 'WIS' },
    'Aura of Devotion': { passive: { condImmune: ['Charmed'] } },
    'Purity of Spirit': { passive: { advNote: 'Always under protection from evil and good' } },
    "Channel Divinity: Nature's Wrath": { col: 'action', dc: 'spell', save: 'STR or DEX' },
    'Channel Divinity: Turn the Faithless': { col: 'action', dc: 'spell', save: 'WIS' },
    'Aura of Warding': { passive: { resist: ['damage from spells'] } },
    'Channel Divinity: Abjure Enemy': { col: 'action', dc: 'spell', save: 'WIS' },
    'Channel Divinity: Vow of Enmity': { col: 'bonus', use: R('Vow of Enmity', 10, { atkAdv: 'Vow of Enmity (that creature only)' }) },
    'Soul of Vengeance': { col: 'reaction' },
    'Channel Divinity: Conquering Presence': { col: 'action', dc: 'spell', save: 'WIS' },
    'conquest:Channel Divinity: Guided Strike': { col: 'action', text: '+10 to one attack roll' },
    'Scornful Rebuke': { text: 'Attackers that hit you take {cha} psychic' },
    'Channel Divinity: Emissary of Peace': { col: 'bonus', use: R('Emissary of Peace', 100, { note: '+5 to Persuasion checks' }) },
    'Channel Divinity: Rebuke the Violent': { col: 'reaction', dc: 'spell', save: 'WIS' },
    'Aura of the Guardian': { col: 'reaction' },
    'Protective Spirit': { roll: '1d6+{floor(paladin/2)}', healRoll: true },
    'Channel Divinity: Peerless Athlete': { col: 'bonus', use: R('Peerless Athlete', 100, { note: 'Advantage on Athletics and Acrobatics; double carry; +10 ft jumps' }) },
    'Channel Divinity: Inspiring Smite': { col: 'bonus', roll: '2d8+paladin', rollNote: 'temp HP to share out' },
    'Aura of Alacrity': { passive: { speed: 10 } },
    "Channel Divinity: Watcher's Will": { col: 'action' },
    'Channel Divinity: Abjure the Extraplanar': { col: 'action', dc: 'spell', save: 'WIS' },
    'Aura of the Sentinel': { passive: { init: 'prof' } },
    'Vigilant Rebuke': { col: 'reaction', roll: '2d8+cha', rollNote: 'force' },
    'Channel Divinity: Champion Challenge': { col: 'bonus', dc: 'spell', save: 'WIS' },
    'Channel Divinity: Turn the Tide': { col: 'bonus', roll: '1d6+cha', rollNote: 'healing for each creature at half HP or less' },
    'Divine Allegiance': { col: 'reaction' },
    'Unyielding Spirit': { passive: { advNote: 'Saves against being paralyzed or stunned' } },
    // ---- Ranger ----
    'Primeval Awareness': { col: 'action' },
    'Vanish': { col: 'bonus' },
    'Feral Senses': { passive: { sense: 'Sense invisible creatures within 30 ft' } },
    'Foe Slayer': { text: 'Add {wis} to an attack or damage roll against a favored enemy' },
    'Dread Ambusher': { text: 'First turn: +10 ft speed, and one extra attack dealing +1d8' },
    'Umbral Sight': { passive: { sense: 'Invisible to darkvision in darkness' } },
    'Iron Mind': { passive: { saveProf: ['wis'] } },
    "Stalker's Flurry": {},
    'Shadowy Dodge': { col: 'reaction' },
    'Planar Warrior': { col: 'bonus', roll: '{tier(ranger,3,1,11,2)}d8', rollNote: 'force, on your next hit this turn' },
    'Spectral Defense': { col: 'reaction' },
    "Slayer's Prey": { col: 'bonus', roll: '1d6', rollNote: 'first hit each turn on your prey' },
    'Supernatural Defense': { roll: '1d6' },
    "Slayer's Counter": { col: 'reaction' },
    'Dreadful Strikes': { col: 'action', roll: '1d{tier(ranger,3,4,11,6)}', rollNote: 'psychic, once per turn per creature' },
    'Otherworldly Glamour': { text: 'Add {wis} to CHA checks' },
    'Beguiling Twist': { col: 'reaction', passive: { advNote: 'Saves against being charmed or frightened' } },
    'Misty Wanderer': { spells: ['Misty Step'], spellNote: 'Without a slot (WIS mod times per long rest)' },
    'Gathered Swarm': { col: 'action', roll: '1d{tier(ranger,3,6,11,8)}', rollNote: 'piercing, or push 15 ft, or move 5 ft' },
    'Writhing Tide': { use: R('Writhing Tide', 10, { fly: 10, note: 'Hover' }) },
    'Swarming Dispersal': { col: 'reaction' },
    'Draconic Gift': { spells: ['Thaumaturgy'] },
    "Drake's Breath": { dc: 'spell', save: 'DEX', roll: '{tier(ranger,11,8,15,10)}d6' },
    'Bond of Fang and Scale': {},
    'Favored Foe': { roll: '1d{tier(ranger,1,4,6,6,14,8)}', rollNote: 'extra damage (first hit each turn on the marked foe)', use: R('Favored Foe', 10, { note: 'Marked creature: first hit each turn deals extra damage' }) },
    'Deft Explorer: Roving': { passive: { speed: 5, climb: 'walk', swim: 'walk' } },
    'Deft Explorer: Tireless': { use: { temp: '1d8+wis' } },
    "Nature's Veil": { use: { cond: 'Invisible', condRounds: 1 } },
    'Primal Awareness': { spellsAt: { 3: ['Speak with Animals'], 5: ['Beast Sense'], 9: ['Speak with Plants'], 13: ['Locate Creature'], 17: ['Commune with Nature'] }, once: true, spellNote: 'Once per long rest without a slot' },
    // ---- Rogue ----
    'Cunning Action': { resource: true, acts: [{ name: 'Dash', col: 'bonus', dash: true }, { name: 'Disengage', col: 'bonus' }, { name: 'Hide', col: 'bonus' }] },
    'Steady Aim': { col: 'bonus', onlyWhen: { notMoved: true }, use: { speed0: 'Steady Aim', effect: { name: 'Steady Aim', rounds: 1, buff: { atkAdvNext: 'Steady Aim', note: 'Advantage on your next attack roll this turn' } } } },
    'Uncanny Dodge': { col: 'reaction', use: { halveDamage: true } },
    'Reliable Talent': { passive: { advNote: 'Proficient checks: a d20 roll of 9 or lower counts as 10' } },
    'Blindsense': { passive: { sense: 'Blindsense 10 ft' } },
    'Slippery Mind': { passive: { saveProf: ['wis'] } },
    'Elusive': { passive: { advNote: 'No attack has advantage against you' } },
    'Stroke of Luck': {},
    'Fast Hands': { col: 'bonus' },
    'Mage Hand Legerdemain': { spells: ['Mage Hand'] },
    'Versatile Trickster': { col: 'bonus' },
    'Eye for Detail': { col: 'bonus' },
    'Insightful Fighting': { col: 'bonus' },
    'Master of Tactics': { col: 'bonus' },
    'Misdirection': { col: 'reaction' },
    'Skirmisher': { col: 'reaction' },
    'Survivalist': { passive: { skillExp: ['Nature', 'Survival'] } },
    'Superior Mobility': { passive: { speed: 10 } },
    'Ambush Master': { passive: { initAdv: true } },
    'Sudden Strike': { col: 'bonus' },
    'Elegant Maneuver': { col: 'bonus' },
    'Panache': { col: 'action' },
    'soulknife:Psychic Blades': { attacks: [['Psychic Blade', '1d6', 'psychic', 'fin', { notes: 'Finesse, thrown 60 ft; vanishes after the attack' }], ['Psychic Blade (bonus)', '1d4', 'psychic', 'fin', { bonus: true, after: 'Psychic Blade', notes: 'Bonus action after attacking with a psychic blade' }]] },
    'soulknife:Psionic Power': { resource: true, acts: [
      { name: 'Psi-Bolstered Knack', cost: true, roll: '1psi', rollNote: 'added to a failed skill or tool check' },
      { name: 'Psychic Whispers', col: 'action', cost: true, roll: '1psi', rollNote: 'hours of telepathy' }] },
    'Soul Blades': { acts: [{ name: 'Homing Strikes', cost: { from: 'Psionic Power', n: 1 }, roll: '1psi', rollNote: 'added to a missed attack' }, { name: 'Psychic Teleportation', col: 'bonus', cost: { from: 'Psionic Power', n: 1 }, roll: '1psi', rollNote: '× 10 ft teleport' }] },
    'Rend Mind': { dc: 'dex', save: 'WIS' },
    'Ghost Walk': { use: R('Ghost Walk', 100, { fly: 10, note: 'Attacks against you have disadvantage; pass through objects' }) },
    // ---- Sorcerer ----
    'Font of Magic': { acts: [
      { name: 'Slot → points', text: 'Expend a spell slot to gain points equal to its level' },
      { name: 'Points → slot', col: 'bonus', text: 'Create a slot: 1st 2, 2nd 3, 3rd 5, 4th 6, 5th 7 points' }] },
    'Dragon Wings': { col: 'bonus', use: R('Dragon Wings', null, { fly: 'walk', note: 'Wings out (not in armor that lacks room)' }) },
    'Draconic Presence': { col: 'action', cost: { from: 'Font of Magic', n: 5 }, dc: 'spell', save: 'WIS' },
    'Bend Luck': { col: 'reaction', cost: { from: 'Font of Magic', n: 2 }, roll: '1d4' },
    'Favored by the Gods': { roll: '2d4', rollNote: 'added to a failed save or missed attack' },
    'Empowered Healing': { cost: { from: 'Font of Magic', n: 1 } },
    'Otherworldly Wings': { col: 'bonus', use: R('Otherworldly Wings', null, { fly: 30 }) },
    'Unearthly Recovery': { use: { healHalf: true } },
    'Eyes of the Dark': { passive: { sense: 'Darkvision 120 ft (Eyes of the Dark)' }, spellsAt: { 3: ['Darkness'] }, spellNote: '2 sorcery points; you can see through it' },
    'Hound of Ill Omen': { col: 'bonus', cost: { from: 'Font of Magic', n: 3 } },
    'Shadow Walk': { col: 'bonus' },
    'Umbral Form': { col: 'bonus', cost: { from: 'Font of Magic', n: 6 }, use: R('Umbral Form', 10, { note: 'Resistance to all damage but force and radiant; move through objects' }) },
    'Wind Speaker': {},
    'Tempestuous Magic': { col: 'bonus' },
    'Heart of the Storm': { passive: { resist: ['lightning', 'thunder'] } },
    "Storm's Fury": { col: 'reaction', roll: 'sorcerer', rollNote: 'lightning damage', dc: 'spell', save: 'STR' },
    'Wind Soul': { passive: { immune: ['lightning', 'thunder'], fly: 60 } },
    'Telepathic Speech': { col: 'bonus' },
    'Psychic Defenses': { passive: { resist: ['psychic'], advNote: 'Saves against being charmed or frightened' } },
    'Revelation in Flesh': { col: 'bonus', cost: { from: 'Font of Magic', n: 1 } },
    'Warping Implosion': { dc: 'spell', save: 'STR', roll: '3d10', rollNote: 'force' },
    'Bastion of Law': { col: 'action', text: 'Spend 1–5 sorcery points: a ward of that many d8s' },
    'Trance of Order': {},
    // ---- Warlock ----
    'Fey Presence': { dc: 'spell', save: 'WIS' },
    'Misty Escape': { use: { cond: 'Invisible' } },
    'Beguiling Defenses': { passive: { condImmune: ['Charmed'] } },
    'Dark Delirium': { dc: 'spell', save: 'WIS' },
    "Dark One's Blessing": { use: { temp: 'max(1,cha+warlock)' }, text: 'Use when you reduce a hostile creature to 0 HP' },
    "Dark One's Own Luck": { roll: '1d10', rollNote: 'added to a check or save' },
    'Hurl Through Hell': { roll: '10d10', rollNote: 'psychic (non-fiends)' },
    'Awakened Mind': {},
    'Entropic Ward': { use: R('Entropic Ward', 1, { atkAdv: 'Entropic Ward (if it missed)' }) },
    'Thought Shield': { passive: { resist: ['psychic'] } },
    'celestial:Bonus Cantrips': { spells: ['Light', 'Sacred Flame'] },
    'Healing Light': { roll: '1d6', rollNote: 'per die spent (max CHA mod dice)' },
    'Radiant Soul': { passive: { resist: ['radiant'] } },
    'Celestial Resilience': { use: { temp: 'warlock+cha' } },
    "Hexblade's Curse": { use: R("Hexblade's Curse", 10, { note: '+prof damage vs the cursed target; crit on 19–20 against it; heal warlock level + CHA when it dies' }) },
    'Armor of Hexes': { col: 'reaction', roll: '1d6', rollNote: 'on 4+ the attack misses' },
    'Tentacle of the Deeps': { roll: '{tier(warlock,1,1,10,2)}d8', rollNote: 'cold; speed −10 ft' },
    'Gift of the Sea': { passive: { swim: 40 } },
    'Oceanic Soul': { passive: { resist: ['cold'] } },
    'Guardian Coil': { col: 'reaction', roll: '{tier(warlock,6,1,10,2)}d8', rollNote: 'damage reduced' },
    'Grasping Tentacles': { spells: ["Evard's Black Tentacles"], spellNote: 'Once per long rest without a slot' },
    'Among the Dead': { spells: ['Spare the Dying'] },
    'Defy Death': { roll: '1d8+con', healRoll: true },
    'Indestructible Life': { roll: '1d8+warlock', healRoll: true },
    'Form of Dread': { use: Object.assign(R('Form of Dread', 10, { note: 'Immune to frightened; once per turn a hit can frighten (WIS save)' }), { temp: '1d10+warlock' }), dc: 'spell', save: 'WIS' },
    'Necrotic Husk': { passive: { resist: ['necrotic'] } },
    // ---- Wizard ----
    'Arcane Recovery': { text: 'Recover slots totaling half your wizard level (rounded up)' },
    'Portent': { roll: '1d20', rollNote: 'a Portent die' },
    'Benign Transposition': {},
    'Hypnotic Gaze': { col: 'action', dc: 'spell', save: 'WIS' },
    'Instinctive Charm': { col: 'reaction', dc: 'spell', save: 'WIS' },
    'Improved Minor Illusion': { spells: ['Minor Illusion'] },
    'Illusory Self': {},
    'Illusory Reality': { col: 'bonus' },
    'Grim Harvest': {},
    'Inured to Undeath': { passive: { resist: ['necrotic'] } },
    'Command Undead': { col: 'action', dc: 'spell', save: 'CHA' },
    'Arcane Deflection': { col: 'reaction', text: '+2 AC against one attack or +4 to a save; then only cantrips until your next turn' },
    'Durable Magic': { passive: { when: 'conc', ac: 2, saveAll: 2 } },
    'Power Surge': { roll: '{floor(wizard/2)}', rollNote: 'force damage added' },
    'Bladesong': { use: R('Bladesong', 10, { ac: 'max(1,int)', speed: 10, note: 'Advantage on Acrobatics; +INT to concentration saves' }) },
    'Song of Defense': { col: 'reaction', text: 'Expend a slot: reduce damage by 5 × slot level' },
    'Song of Victory': { passive: { effect: 'Bladesong', meleeDmg: 'int' } },
    'Wizardly Quill': { col: 'bonus' },
    'Spell Resistance': { passive: { resist: ['damage from spells'], advNote: 'Saves against spells' } },
    // ---- Artificer ----
    'Magical Tinkering': { col: 'action' },
    'Soul of Artifice': { passive: { saveAll: 'attuned' } },
    'Experimental Elixir': { roll: '1d6', rollNote: '1 healing · 2 swiftness · 3 resilience · 4 boldness · 5 flight · 6 transformation' },
    'Chemical Mastery': { passive: { resist: ['acid', 'poison'], immune: ['poison'], condImmune: ['Poisoned'] } },
    'Arcane Firearm': { roll: '1d8', rollNote: 'added to one artificer spell damage roll' },
    'Arcane Jolt': { roll: '{tier(artificer,9,2,15,4)}d6', rollNote: 'force damage, or healing' },
    // ---- Feats ----
    'feat:Lucky': { max: '3', reset: 'long', roll: '1d20', rollNote: 'luck die' },
    'feat:Sentinel': { col: 'reaction' },
    'feat:Polearm Master': { col: 'bonus', attacks: [] },
    'feat:Great Weapon Master': { acts: [{ name: 'Power attack (−5/+10)', use: R('Power attack', null, { atk: -5, dmg: 10, note: 'Heavy melee weapons only — end it in Active effects' }) }, { name: 'Bonus attack', col: 'bonus', text: 'After a crit or dropping a creature to 0 HP' }] },
    'feat:Sharpshooter': { acts: [{ name: 'Power shot (−5/+10)', use: R('Power shot', null, { atk: -5, dmg: 10, note: 'Ranged weapons only — end it in Active effects' }) }] },
    'feat:Crossbow Expert': { col: 'bonus' },
    'feat:Shield Master': { col: 'bonus' },
    'feat:War Caster': { col: 'reaction' },
    'feat:Mage Slayer': { col: 'reaction' },
    'feat:Defensive Duelist': { col: 'reaction', text: '+{prof} AC against one melee attack' },
    'feat:Inspiring Leader': { use: { temp: 'level+cha' } },
    'feat:Charger': { col: 'bonus' },
    'feat:Dual Wielder': { passive: { advNote: '+1 AC while wielding a separate melee weapon in each hand' } },
    'feat:Mobile': {},
    'feat:Fey Touched': {},
    'feat:Healer': { col: 'action', roll: '1d6+4+{level}', rollNote: 'healing (once per creature per rest)' },
    'feat:Tough': {},
    'feat:Savage Attacker': {},
    'feat:Durable': {},
    'feat:Resilient': {}
  };
  // ---- Class options (picks) ----
  const op = t => (DND.options[t] || { list: [] }).list;
  const setFx = (t, name, fx) => { const e = op(t).find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  // Battle Master maneuvers spend superiority dice and roll one.
  const MCOL = { Brace: 'reaction', Parry: 'reaction', Riposte: 'reaction', 'Feinting Attack': 'bonus', 'Grappling Strike': 'bonus', 'Quick Toss': 'bonus', Rally: 'bonus', 'Bait and Switch': 'action' };
  const MSAVE = { 'Disarming Attack': 'STR', 'Goading Attack': 'WIS', 'Menacing Attack': 'WIS', 'Pushing Attack': 'STR', 'Trip Attack': 'STR' };
  const MROLL = { Parry: '1sup+dex', Rally: '1sup+cha', 'Precision Attack': '1sup', 'Evasive Footwork': '1sup', 'Ambush': '1sup', 'Commanding Presence': '1sup', 'Tactical Assessment': '1sup' };
  op('maneuver').forEach(e => setFx('maneuver', e[0], Object.assign({ cost: { from: 'Combat Superiority', n: 1 }, roll: MROLL[e[0]] || '1sup', rollNote: MROLL[e[0]] ? '' : 'extra damage', dc: MSAVE[e[0]] ? 'str|dex' : false },
    ['Ambush', 'Commanding Presence', 'Tactical Assessment', 'Evasive Footwork'].includes(e[0]) ? {} : { col: MCOL[e[0]] || 'action' }, MSAVE[e[0]] ? { save: MSAVE[e[0]] } : {})));
  op('metamagic').forEach(e => { const m = /^(\d+) SP/.exec(e[1]); setFx('metamagic', e[0], { cost: { from: 'Font of Magic', n: m ? Number(m[1]) : 1 }, dc: false }); });
  setFx('metamagic', 'Twinned Spell', { cost: null, text: 'Costs sorcery points equal to the spell level (1 for a cantrip)' });
  op('arcaneShot').forEach(e => setFx('arcaneShot', e[0], { col: 'action', cost: { from: 'Arcane Shot', n: 1 }, dc: /save/i.test(e[1]) ? 'int' : false }));
  setFx('fightingStyle', 'Defense', { passive: { acArmor: 1 } });
  setFx('fightingStyle', 'Interception', { col: 'reaction', roll: '1d10+prof', rollNote: 'damage reduced' });
  setFx('fightingStyle', 'Protection', { col: 'reaction' });
  setFx('fightingStyle', 'Blind Fighting', { passive: { sense: 'Blindsight 10 ft' } });
  setFx('invocation', "Devil's Sight", {});
  // ---- New choice lists ----
  const RAGE_NOTE = ' (while raging)';
  DND.options.totemSpirit = { label: 'Totem Spirit', list: [
    ['Bear', 'While raging, resistance to all damage except psychic.', 'Totem Warrior', { raging: { resist: ['all damage except psychic'] } }],
    ['Eagle', 'While raging (not in heavy armor), opportunity attacks against you have disadvantage and you can Dash as a bonus action.', 'Totem Warrior', { acts: [{ name: 'Dash (Eagle)', col: 'bonus', dash: true, onlyRaging: true }], raging: { advNote: 'Opportunity attacks against you have disadvantage' } }],
    ['Elk', 'While raging (not in heavy armor), your walking speed increases by 15 ft.', 'Totem Warrior (SCAG)', { raging: { speedNoHeavy: 15 } }],
    ['Tiger', 'While raging, add 10 ft to long jumps and 3 ft to high jumps.', 'Totem Warrior (SCAG)', { raging: { advNote: 'Long jump +10 ft, high jump +3 ft' } }],
    ['Wolf', 'While raging, friends have advantage on melee attacks against enemies within 5 ft of you.', 'Totem Warrior', { raging: { advNote: 'Allies have advantage on melee attacks vs enemies next to you' } }]] };
  DND.options.totemAspect = { label: 'Aspect of the Beast', list: [
    ['Bear', 'Carrying capacity doubled; advantage on STR checks to push, pull, lift or break.', 'Totem Warrior', { passive: { carry: 2 } }],
    ['Eagle', 'See up to 1 mile clearly; dim light doesn’t impose disadvantage on Perception.', 'Totem Warrior', { passive: { sense: 'Eagle sight 1 mile' } }],
    ['Elk', 'You and up to 10 companions travel at a fast pace without penalty.', 'Totem Warrior (SCAG)'],
    ['Tiger', 'Proficiency in two of Athletics, Acrobatics, Stealth and Survival.', 'Totem Warrior (SCAG)'],
    ['Wolf', 'Track at a fast pace; move stealthily at a normal pace.', 'Totem Warrior']] };
  DND.options.totemAttune = { label: 'Totemic Attunement', list: [
    ['Bear', 'While raging, hostile creatures within 5 ft have disadvantage on attacks against others.', 'Totem Warrior'],
    ['Eagle', 'While raging, you have a flying speed equal to your walking speed (briefly).', 'Totem Warrior', { raging: { fly: 'walk' } }],
    ['Elk', 'While raging, bonus action: move through a Large or smaller creature’s space; STR save or prone and 1d12 + STR bludgeoning.', 'Totem Warrior (SCAG)', { acts: [{ name: 'Elk trample', col: 'bonus', onlyRaging: true, roll: '1d12+str', rollNote: 'bludgeoning', dc: 'str', save: 'STR' }] }],
    ['Tiger', 'While raging, after moving 20 ft in a straight line, bonus-action melee attack.', 'Totem Warrior (SCAG)', { acts: [{ name: 'Tiger pounce', col: 'bonus', onlyRaging: true }] }],
    ['Wolf', 'While raging, when you hit with a melee attack, bonus action to knock a Large or smaller creature prone.', 'Totem Warrior', { acts: [{ name: 'Wolf knockdown', col: 'bonus', onlyRaging: true }] }]] };
  DND.options.stormAura = { label: 'Storm Aura', list: [
    ['Desert', 'Aura: others take 2 fire damage (more at higher levels). Storm Soul: fire resistance.', 'Storm Herald', { acts: [{ name: 'Desert aura', col: 'bonus', onlyRaging: true, roll: '{tier(barbarian,3,2,5,3,10,4,15,5,20,6)}', rollNote: 'fire to each other creature in the aura' }], passive: { min: 6, resist: ['fire'] } }],
    ['Sea', 'Aura: one creature takes 1d6 lightning (DEX half). Storm Soul: lightning resistance, swim 30 ft, breathe water.', 'Storm Herald', { acts: [{ name: 'Sea aura', col: 'bonus', onlyRaging: true, roll: '{tier(barbarian,3,1,10,2,15,3,20,4)}d6', rollNote: 'lightning', dc: 'con', save: 'DEX' }], passive: { min: 6, resist: ['lightning'], swim: 30 } }],
    ['Tundra', 'Aura: creatures of your choice gain 2 temp HP (more at higher levels). Storm Soul: cold resistance.', 'Storm Herald', { acts: [{ name: 'Tundra aura', col: 'bonus', onlyRaging: true, roll: '{tier(barbarian,3,2,5,3,10,4,15,5,20,6)}', rollNote: 'temp HP to each chosen creature' }], passive: { min: 6, resist: ['cold'] } }]] };
  const LAND = { Arctic: [['Hold Person', 'Spike Growth'], ['Sleet Storm', 'Slow'], ['Freedom of Movement', 'Ice Storm'], ['Commune with Nature', 'Cone of Cold']],
    Coast: [['Mirror Image', 'Misty Step'], ['Water Breathing', 'Water Walk'], ['Control Water', 'Freedom of Movement'], ['Conjure Elemental', 'Scrying']],
    Desert: [['Blur', 'Silence'], ['Create Food and Water', 'Protection from Energy'], ['Blight', 'Hallucinatory Terrain'], ['Insect Plague', 'Wall of Stone']],
    Forest: [['Barkskin', 'Spider Climb'], ['Call Lightning', 'Plant Growth'], ['Divination', 'Freedom of Movement'], ['Commune with Nature', 'Tree Stride']],
    Grassland: [['Invisibility', 'Pass without Trace'], ['Daylight', 'Haste'], ['Divination', 'Freedom of Movement'], ['Dream', 'Insect Plague']],
    Mountain: [['Spider Climb', 'Spike Growth'], ['Lightning Bolt', 'Meld into Stone'], ['Stone Shape', 'Stoneskin'], ['Passwall', 'Wall of Stone']],
    Swamp: [['Darkness', "Melf's Acid Arrow"], ['Water Walk', 'Stinking Cloud'], ['Freedom of Movement', 'Locate Creature'], ['Insect Plague', 'Scrying']],
    Underdark: [['Spider Climb', 'Web'], ['Gaseous Form', 'Stinking Cloud'], ['Greater Invisibility', 'Stone Shape'], ['Cloudkill', 'Insect Plague']] };
  DND.options.landCircle = { label: 'Circle Spells land', list: Object.entries(LAND).map(([k, v]) => [k, 'Always prepared: ' + v.map(x => x.join(', ')).join('; ') + '.', 'Circle of the Land', { spellsAt: { 3: v[0], 5: v[1], 7: v[2], 9: v[3] } }]) };
  // PHB ranger: Favored Enemy (1st, 6th, 14th) and Natural Explorer terrains (1st, 6th, 10th)
  const FE = ['Aberrations', 'Beasts', 'Celestials', 'Constructs', 'Dragons', 'Elementals', 'Fey', 'Fiends', 'Giants', 'Monstrosities', 'Oozes', 'Plants', 'Undead', 'Humanoids (two races)'];
  DND.options.favoredEnemy = { label: 'Favored Enemy', list: FE.map(t => [t, `Advantage on Survival checks to track ${t.replace(' (two races)', ' of the two races you pick')} and on INT checks to recall facts about them.`, 'Ranger', { passive: { advNote: `Survival to track, and INT checks to recall info, vs ${t}` } }]) };
  const FT = ['Arctic', 'Coast', 'Desert', 'Forest', 'Grassland', 'Mountain', 'Swamp', 'Underdark'];
  DND.options.favoredTerrain = { label: 'Favored Terrain', list: FT.map(t => [t, `Double proficiency on INT/WIS checks about it (if proficient); your group isn't slowed by difficult terrain or lost except by magic; stay alert while doing other things; stealthy at normal pace when alone; forage double food; learn more when tracking.`, 'Ranger', {}]) };
  DND.options.hunterPrey = { label: "Hunter's Prey", list: [
    ['Colossus Slayer', 'Once per turn, +1d8 damage to a creature below its max HP.', 'Hunter', { col: 'action', roll: '1d8', rollNote: 'extra damage (target below max HP)' }],
    ['Giant Killer', 'Reaction: attack a Large or larger creature within 5 ft that attacks you.', 'Hunter', { col: 'reaction' }],
    ['Horde Breaker', 'Once per turn, make another attack against a different creature within 5 ft of the first target.', 'Hunter', { col: 'action' }]] };
  DND.options.hunterDefense = { label: 'Defensive Tactics', list: [
    ['Escape the Horde', 'Opportunity attacks against you have disadvantage.', 'Hunter', { passive: { advNote: 'Opportunity attacks against you have disadvantage' } }],
    ['Multiattack Defense', 'After a creature hits you, +4 AC against its later attacks this turn.', 'Hunter', { passive: { advNote: '+4 AC vs a creature’s later attacks after it hits you' } }],
    ['Steel Will', 'Advantage on saves against being frightened.', 'Hunter', { passive: { advNote: 'Saves against being frightened' } }]] };
  DND.options.hunterMultiattack = { label: 'Multiattack', list: [
    ['Volley', 'Action: ranged attack against any number of creatures within 10 ft of a point.', 'Hunter', { col: 'action' }],
    ['Whirlwind Attack', 'Action: melee attack against any number of creatures within 5 ft of you.', 'Hunter', { col: 'action' }]] };
  DND.options.hunterSuperior = { label: "Superior Hunter's Defense", list: [
    ['Evasion', 'No damage on a successful DEX save for half; half on a failure.', 'Hunter', { passive: { advNote: 'DEX saves for half: no damage on a success (Evasion)' } }],
    ['Stand Against the Tide', 'Reaction: when a creature misses you in melee, force it to repeat the attack against another creature.', 'Hunter', { col: 'reaction' }],
    ['Uncanny Dodge', 'Reaction: halve the damage of an attack from an attacker you can see.', 'Hunter', { col: 'reaction' }]] };
  const DRAG = [['Black', 'acid'], ['Blue', 'lightning'], ['Brass', 'fire'], ['Bronze', 'lightning'], ['Copper', 'acid'], ['Gold', 'fire'], ['Green', 'poison'], ['Red', 'fire'], ['Silver', 'cold'], ['White', 'cold']];
  DND.options.draconicAncestry = { label: 'Dragon Ancestor', list: DRAG.map(([d, t]) => [d, `${t[0].toUpperCase() + t.slice(1)} damage.`, 'Draconic Bloodline', { acts: [{ name: `${t} resistance (1 hour)`, min: 6, cost: { from: 'Font of Magic', n: 1 }, use: R('Elemental Affinity', 600, { note: `Resistance to ${t} damage` }) }], passive: { min: 6, advNote: `Add CHA to one damage roll of ${t} spells` } }]) };
  DND.options.armorModel = { label: 'Armor Model', list: [
    ['Guardian', 'Thunder Gauntlets (1d8 thunder, INT; target has disadvantage attacking others) and Defensive Field (bonus action: temp HP = artificer level).', 'Armorer', { attacks: [['Thunder Gauntlets', '1d8', 'thunder', 'int', { notes: 'Hit: disadvantage attacking anyone but you until your next turn' }]], acts: [{ name: 'Defensive Field', col: 'bonus', use: { temp: 'artificer' } }] }],
    ['Infiltrator', 'Lightning Launcher (1d6 lightning, 90/300 ft, +1d6 once per turn), +5 ft speed, advantage on Stealth.', 'Armorer', { attacks: [['Lightning Launcher', '1d6', 'lightning', 'int', { kind: 'ranged', notes: '90/300 ft; once per turn +1d6 lightning' }]], passive: { speed: 5, advNote: 'Stealth checks (Infiltrator)' } }]] };
  Object.assign(DND.options.totemSpirit, {}); // keep shape
  // Subclass choices these features need
  const C = DND.classes, addCh = (cls, sub, chs) => { const s = C[cls] && C[cls].subclasses[sub]; if (s) s.choices = (s.choices || []).concat(chs); };
  addCh('barbarian', 'totem', [{ level: 3, type: 'totemSpirit', n: 1 }, { level: 6, type: 'totemAspect', n: 1 }, { level: 14, type: 'totemAttune', n: 1 }]);
  addCh('barbarian', 'storm', [{ level: 3, type: 'stormAura', n: 1 }]);
  addCh('druid', 'land', [{ level: 2, type: 'cantrip', list: 'D', cls: 'druid', n: 1, label: 'Bonus druid cantrip' }, { level: 3, type: 'landCircle', n: 1 }]);
  addCh('ranger', 'hunter', [{ level: 3, type: 'hunterPrey', n: 1 }, { level: 7, type: 'hunterDefense', n: 1 }, { level: 11, type: 'hunterMultiattack', n: 1 }, { level: 15, type: 'hunterSuperior', n: 1 }]);
  addCh('sorcerer', 'draconic', [{ level: 1, type: 'draconicAncestry', n: 1 }]);
  addCh('artificer', 'armorer', [{ level: 3, type: 'armorModel', n: 1 }]);
  addCh('fighter', 'champion', [{ level: 10, type: 'fightingStyle', n: 1 }]);
  addCh('fighter', 'battlemaster', [{ level: 3, type: 'tool', n: 1, from: 'artisan', label: "Student of War: artisan's tool" }]);
  addCh('fighter', 'arcanearcher', [{ level: 3, type: 'skill', n: 1, from: ['Arcana', 'Nature'], label: 'Arcane Archer Lore skill' }]);
  addCh('fighter', 'cavalier', [{ level: 3, type: 'skill', n: 1, from: ['Animal Handling', 'History', 'Insight', 'Performance', 'Persuasion'], label: 'Bonus Proficiency' }]);
  addCh('fighter', 'samurai', [{ level: 3, type: 'skill', n: 1, from: ['History', 'Insight', 'Performance', 'Persuasion'], label: 'Bonus Proficiency' }]);
  addCh('cleric', 'knowledge', [{ level: 1, type: 'language', n: 2, label: 'Blessings of Knowledge languages' }, { level: 1, type: 'expertise', n: 2, from: ['Arcana', 'History', 'Nature', 'Religion'], label: 'Blessings of Knowledge skills (expertise)' }]);
  addCh('cleric', 'nature', [{ level: 1, type: 'cantrip', list: 'D', cls: 'cleric', n: 1, label: 'Acolyte of Nature cantrip' }, { level: 1, type: 'skill', n: 1, from: ['Animal Handling', 'Nature', 'Survival'], label: 'Acolyte of Nature skill' }]);
  addCh('cleric', 'arcana', [{ level: 1, type: 'cantrip', list: 'W', cls: 'cleric', n: 2, label: 'Arcane Initiate cantrips' }]);
  addCh('cleric', 'order', [{ level: 1, type: 'skill', n: 1, from: ['Intimidation', 'Persuasion'], label: 'Bonus Proficiency' }]);
  addCh('cleric', 'peace', [{ level: 1, type: 'skill', n: 1, from: ['Insight', 'Performance', 'Persuasion'], label: 'Implement of Peace' }]);
  addCh('bard', 'lore', [{ level: 3, type: 'skill', n: 3, from: 'any', label: 'Bonus Proficiencies' }]);
  addCh('ranger', 'feywanderer', [{ level: 3, type: 'skill', n: 1, from: ['Deception', 'Performance', 'Persuasion'], label: 'Otherworldly Glamour' }]);
  addCh('rogue', 'mastermind', [{ level: 3, type: 'language', n: 2, label: 'Master of Intrigue languages' }]);
  addCh('monk', 'kensei', []);
  // Heavy-armor and other fixed proficiencies some subclasses grant at 1st/3rd level
  const prof = (cls, sub, p) => { const s = C[cls] && C[cls].subclasses[sub]; if (s && !s.profs) s.profs = p; };
  ['life', 'nature', 'tempest', 'war', 'forge', 'order', 'twilight'].forEach(k => prof('cleric', k, { armorCats: ['heavy'], weaponCats: ['tempest', 'war', 'twilight'].includes(k) ? ['martial'] : [] }));
  prof('bard', 'valor', { armorCats: ['medium', 'shield'], weaponCats: ['martial'] });
  prof('bard', 'swords', { armorCats: ['medium'] });
  prof('warlock', 'hexblade', { armorCats: ['medium', 'shield'], weaponCats: ['martial'] });
  prof('artificer', 'armorer', { armorCats: ['heavy'] });
  prof('artificer', 'battlesmith', { weaponCats: ['martial'] });
  // Skills some subclasses always give
  Object.assign(DND.featFx, {
    'mercy:Implements of Mercy': { passive: { skillProf: ['Insight', 'Medicine'] } },
    'Implements of Mercy': { passive: { skillProf: ['Insight', 'Medicine'] } },
    'drunkenmaster:Bonus Proficiencies': { passive: { skillProf: ['Performance'] } },
    'Training in War and Song': { passive: { skillProf: ['Performance'] } },
    'Royal Envoy': { passive: { skillExp: ['Persuasion'] } }
  });
})();

// Feature automation: Barbarian and Bard (2014 rules) and their non-UA subclasses. See tools/FX_SPEC.md.
(function () {
  const BI = { from: 'Bardic Inspiration', n: 1 };
  const E = (name, rounds, buff, more) => ({ effect: Object.assign({ name, rounds, buff }, more || {}) });
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  const addActs = (type, name, acts) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) { e[3] = Object.assign({}, e[3] || {}); e[3].acts = (e[3].acts || []).concat(acts); } };
  const addPassive = (type, name, p) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) { e[3] = Object.assign({}, e[3] || {}); e[3].passive = [].concat(e[3].passive || []).concat(p); } };

  Object.assign(DND.featFx, {
    // ======================= BARBARIAN =======================
    'barbarian:Unarmored Defense': { none: true, note: 'Built in: AC 10 + DEX + CON without armor (class unarmored formula, shield allowed).' },
    'barbarian:Extra Attack': { none: true, note: 'Built in: class extraAttack (2 attacks from 5th level).' },
    'barbarian:Fast Movement': { none: true, note: 'Built in: +10 ft walking speed while not in heavy armor (speed calculation).' },
    'barbarian:Brutal Critical': { none: true, note: 'Built in: melee critical hits add {tier(barbarian,9,1,13,2,17,3)} extra weapon damage die (attack roller).' },
    'barbarian:Relentless Rage': {
      onlyRaging: true, trigger: 'zero', triggerLabel: 'Roll the save', max: '20', reset: 'short',
      roll: '1d20+{con+prof}', rollNote: 'CON save (includes proficiency)',
      text: 'DC 10 for the first use after a rest, +5 for every earlier use since then (count = uses spent on this card, including this one: DC = 5 + 5 × uses). On a success press "Saved: 1 HP".',
      triggerText: 'You dropped to 0 HP while raging: make a CON save (DC 10, +5 per earlier use since your last rest) to drop to 1 HP instead.',
      acts: [{ name: 'Saved: 1 HP', onlyWhen: { zeroHp: true }, use: { setHp: 1, removeCond: ['Unconscious'] }, text: 'Relentless Rage: you drop to 1 HP instead.' }]
    },
    'barbarian:Persistent Rage': { none: true, note: 'Rage only ends early if you fall unconscious or choose to end it (the sheet never ends rage early on its own).' },
    'barbarian:Indomitable Might': { passive: { advNote: 'STR checks: if the total is lower than your STR score, use the score (Indomitable Might)' } },

    // Berserker
    'barbarian:berserker:Frenzy': {
      use: E('Frenzy', 10, { note: 'Bonus action: one melee weapon attack each turn. 1 level of exhaustion when the rage ends.' }),
      text: 'Choose to frenzy when you enter your rage.',
      acts: [
        { name: 'Frenzy attack', col: 'bonus', onlyWhen: { effect: 'Frenzy' }, text: 'One melee weapon attack' },
        { name: 'Rage ended: +1 exhaustion', onlyWhen: { effect: 'Frenzy' }, use: { exhaustion: 1, endEffect: 'Frenzy' } }]
    },

    // Ancestral Guardian
    'barbarian:ancestral:Ancestral Protectors': { raging: { advNote: 'First creature you hit each turn (until your next turn): disadvantage on attacks vs others, and others resist its damage' } },
    'barbarian:ancestral:Spirit Shield': { col: 'reaction', onlyRaging: true, roll: '{tier(barbarian,6,2,10,3,14,4)}d6', rollNote: 'damage prevented for a creature within 30 ft (Vengeful Ancestors: dealt back as force)' },
    'barbarian:ancestral:Consult the Spirits': { spells: ['Augury', 'Clairvoyance'], spellNote: 'Cast one without a slot or material components, once per short rest (WIS); Clairvoyance uses an ancestral spirit as the sensor', spellCls: 'other', text: 'Cast Augury or Clairvoyance without a slot or components.' },
    'barbarian:ancestral:Vengeful Ancestors': { raging: { advNote: 'Spirit Shield: the attacker takes force damage equal to the damage prevented' } },

    // Storm Herald (per-environment effects live on the Storm Aura choice)
    'barbarian:storm:Storm Aura': { dc: 'con', save: 'DEX', text: 'Your Desert/Sea/Tundra aura button is on your Storm Aura choice (bonus action while raging).' },
    'barbarian:storm:Storm Soul': { dc: false, text: 'Resistance and environment benefits come from your Storm Aura choice.' },
    'barbarian:storm:Shielding Storm': { raging: { advNote: 'Creatures of your choice in your Storm Aura share your Storm Soul resistance' } },
    'barbarian:storm:Raging Storm': { dc: 'con', text: 'Your environment’s Raging Storm button is on your Storm Aura choice.' },

    // Zealot
    'barbarian:zealot:Divine Fury': { col: 'action', onlyRaging: true, roll: '1d6+{floor(barbarian/2)}', rollNote: 'radiant or necrotic, first weapon hit each turn' },
    'barbarian:zealot:Warrior of the Gods': { none: true },
    'barbarian:zealot:Fanatical Focus': { onlyRaging: true, roll: '1d20', rollNote: 'reroll of the failed save (add your save bonus; you must use the new roll)', text: 'Once per rage.' },
    'barbarian:zealot:Zealous Presence': { col: 'bonus', text: 'Up to 10 creatures within 60 ft gain advantage on attacks and saves until the start of your next turn.' },
    'barbarian:zealot:Rage Beyond Death': {
      onlyRaging: true, trigger: 'zero', triggerLabel: 'Keep fighting', use: { removeCond: ['Unconscious'] },
      text: 'You stay conscious at 0 HP while raging (still make death saves). If the rage ends and you are still at 0 HP, you die.'
    },

    // Beast
    'barbarian:beast:Form of the Beast': {
      attacks: [
        ['Bite (Form of the Beast)', '1d8', 'piercing', 'str', { kind: 'melee', notes: 'Only while raging. Once per turn on a hit while below half HP, regain HP equal to your proficiency bonus.' }],
        ['Claws (Form of the Beast)', '1d6', 'slashing', 'str', { kind: 'melee', notes: 'Only while raging. Each claw: once per turn when you attack with a claw using the Attack action, make one extra claw attack.' }],
        ['Tail (Form of the Beast)', '1d8', 'piercing', 'str', { kind: 'melee', notes: 'Only while raging. Reach 10 ft. Reaction: +1d8 AC against an attack you can see.' }]],
      acts: [
        { name: 'Bite: regain HP', onlyWhen: { cond: 'Raging', hpBelowHalf: true }, use: { heal: '{prof}' }, text: 'Once per turn, when your bite hits while you have less than half your HP.' },
        { name: 'Tail: deflect', col: 'reaction', onlyRaging: true, roll: '1d8', rollNote: 'added to your AC against the triggering attack' }]
    },
    'barbarian:beast:Bestial Soul': {
      text: 'Natural weapons count as magical. Choose one benefit (change it after a short or long rest).',
      acts: [
        { name: 'Swim', use: E('Bestial Soul', null, { note: 'Swimming speed equal to walking speed; breathe underwater' }) },
        { name: 'Climb', use: E('Bestial Soul', null, { note: 'Climbing speed equal to walking speed; climb difficult surfaces and ceilings without a check' }) },
        { name: 'Jump', use: E('Bestial Soul', null, { note: 'Once per turn when you jump, make a STR (Athletics) check and extend the jump by its total in feet' }) }]
    },
    'barbarian:beast:Infectious Fury': { onlyRaging: true, dc: 'con', save: 'WIS', roll: '2d12', rollNote: 'psychic (or instead it uses its reaction to attack a creature you choose)', text: 'When you hit with a natural weapon while raging.' },
    'barbarian:beast:Call the Hunt': { col: 'bonus', onlyRaging: true, use: { temp: '{5*prof}' }, text: 'Up to {prof} creatures within 30 ft: once per turn each adds 1d6 to a damage roll until the rage ends. You gain 5 temp HP per creature (auto-applied for the maximum {prof}; lower it if fewer accept).' },

    // Wild Magic
    'barbarian:wildmagic:Magic Awareness': { col: 'action', text: 'Until the end of your next turn you know the location of spells and magic items within 60 ft (not behind total cover) and their schools.' },
    'barbarian:wildmagic:Wild Surge': {
      col: 'bonus', onlyRaging: true, roll: '1d8', rollNote: 'Wild Magic table', dc: 'con',
      text: '1 Shadowy tendrils (CON save, 1d12 necrotic; you gain 1d12 temp HP) · 2 Teleport 30 ft (again as bonus action each turn) · 3 Exploding spirit (DEX save, 1d6 force; again as bonus action) · 4 Weapon: light, thrown 20/60, force damage, returns · 5 Attackers that hit you take 1d6 force · 6 Protective lights: +1 AC for you and allies within 10 ft · 7 Flowers and vines: 15 ft difficult terrain for enemies · 8 Bolt of light (CON save, 1d6 radiant + blinded; again as bonus action). Effects last until the rage ends.',
      acts: [
        { name: '1 Tendrils', onlyRaging: true, roll: '1d12', rollNote: 'necrotic to each creature you choose within 30 ft (CON save negates)', dc: 'con', save: 'CON', use: { temp: '1d12' } },
        { name: '2 Teleport', col: 'bonus', onlyRaging: true, text: 'Teleport up to 30 ft to an unoccupied space you can see.' },
        { name: '3 Spirit', col: 'bonus', onlyRaging: true, roll: '1d6', rollNote: 'force to each creature within 5 ft of the spirit (DEX save negates)', dc: 'con', save: 'DEX' },
        { name: '5 Retribution', onlyRaging: true, roll: '1d6', rollNote: 'force to the creature that hit you' },
        { name: '6 Protective lights', onlyRaging: true, use: E('Wild Surge: Lights', 10, { ac: 1, note: 'Allies within 10 ft also get +1 AC' }) },
        { name: '8 Bolt of light', col: 'bonus', onlyRaging: true, roll: '1d6', rollNote: 'radiant; blinded until the start of your next turn (CON save negates)', dc: 'con', save: 'CON' }]
    },
    'barbarian:wildmagic:Bolstering Magic': {
      resource: true,
      acts: [
        { name: 'Bolster (+1d3 rolls)', col: 'action', cost: true, use: E('Bolstering Magic', 100, { note: 'Roll 1d3 and add it to each attack roll or ability check for 10 minutes' }), text: 'Target yourself or a creature you touch (the effect chip tracks it on you).' },
        { name: 'Restore a slot', col: 'action', cost: true, roll: '1d3', rollNote: 'level of the spell slot the touched creature regains (lower if needed)' }]
    },
    'barbarian:wildmagic:Unstable Backlash': { col: 'reaction', onlyRaging: true, roll: '1d8', rollNote: 'new Wild Magic table result (replaces the current one)', dc: 'con', text: 'When you take damage or fail a save while raging.' },
    'barbarian:wildmagic:Controlled Surge': { col: 'bonus', onlyRaging: true, roll: '2d8', rollNote: 'two Wild Magic results — read each die and choose; doubles = choose any effect', dc: 'con' },

    // Battlerager
    'barbarian:battlerager:Battlerager Armor': {
      attacks: [['Armor Spikes', '1d4', 'piercing', 'str', { kind: 'melee', notes: 'Bonus action while raging in spiked armor' }]],
      col: 'bonus', onlyRaging: true, roll: '1d4+str', rollNote: 'piercing (spike attack, bonus action)',
      acts: [{ name: 'Grapple spikes', onlyRaging: true, roll: '3', rollNote: 'piercing when your grapple succeeds' }]
    },
    'barbarian:battlerager:Reckless Abandon': { col: 'action', onlyRaging: true, use: { temp: '{max(1,con)}' }, text: 'Use with Reckless Attack while raging (no extra action). Temp HP vanish when the rage ends.' },
    'barbarian:battlerager:Battlerager Charge': { col: 'bonus', onlyRaging: true, dash: true },
    'barbarian:battlerager:Spiked Retribution': { onlyRaging: true, roll: '3', rollNote: 'piercing to a creature within 5 ft that hits you with a melee attack (spiked armor, not incapacitated)' },

    // Giant
    "barbarian:giant:Giant's Power": { spells: ['Thaumaturgy'], spellNote: 'Or Druidcraft — your choice (WIS). You also learn Giant.', spellCls: 'other' },
    "barbarian:giant:Giant's Havoc": { raging: { advNote: 'Giant Stature: Large (if smaller), reach +5 ft. Crushing Throw: add Rage Damage to STR thrown weapon hits' } },
    'barbarian:giant:Elemental Cleaver': {
      raging: { everyHit: '1d6 elemental (Elemental Cleaver)' },
      acts: [{ name: 'Change element', col: 'bonus', onlyRaging: true, text: 'Acid, cold, fire, thunder or lightning. The weapon is thrown 20/60 and returns.' }]
    },
    'barbarian:giant:Mighty Impel': { col: 'bonus', onlyRaging: true, dc: 'str', save: 'STR', text: 'Move a Medium or smaller creature within reach (Large or smaller with Demiurgic Colossus) up to 30 ft; unwilling creatures save.' },
    'barbarian:giant:Demiurgic Colossus': { raging: { everyHit: '1d6 elemental (Demiurgic Colossus: Elemental Cleaver 2d6)', advNote: 'Rage size up to Huge, reach +10 ft; Mighty Impel works on Large creatures' } },

    // ======================= BARD =======================
    'bard:Spellcasting': { none: true, note: 'Built in: bard spell table, CHA spell DC and attack.' },
    'bard:Bardic Inspiration': { roll: '1bi', rollNote: 'the die you give (they roll it)', text: 'A creature within 60 ft that can hear you gains a d{tier(bard,1,6,5,8,10,10,15,12)} for 10 minutes.' },
    'bard:Song of Rest': { trigger: 'shortRest', triggerLabel: 'Roll Song of Rest', roll: '1d{tier(bard,2,6,9,8,13,10,17,12)}', rollNote: 'extra HP for each friendly creature that spent Hit Dice this rest', healRoll: true },
    'bard:Expertise': { none: true, note: 'Built in: class expertise choices at 3rd and 10th level.' },
    'bard:Font of Inspiration': { none: true, note: 'Built in: Bardic Inspiration resets on a short rest from 5th level (shortAt).' },
    'bard:Countercharm': { col: 'action', use: E('Countercharm', 1, { note: 'You and friends within 30 ft that hear you: advantage on saves vs frightened and charmed' }) },
    'bard:Magical Secrets': { none: true, note: 'Pick the spells as known bard spells (any class list); add them with the feature’s "Spells from this feature" editor.' },
    'bard:Superior Inspiration': { trigger: 'initiative', triggerLabel: 'Regain 1 Bardic Inspiration', use: { regain: { from: 'Bardic Inspiration', n: 1 } }, triggerText: 'If you have no Bardic Inspiration left, regain one use.' },

    // Lore
    'bard:lore:Bonus Proficiencies': { none: true, note: 'Built in: three skill choices.' },
    'bard:lore:Cutting Words': { col: 'reaction', cost: BI, roll: '1bi', rollNote: 'subtract from the creature’s attack, check or damage roll' },
    'bard:lore:Additional Magical Secrets': { none: true, note: 'Two spells from any class; add them with the feature’s spell editor.' },
    'bard:lore:Peerless Skill': { cost: BI, roll: '1bi', rollNote: 'added to your own ability check' },

    // Valor
    'bard:valor:Bonus Proficiencies': { none: true, note: 'Built in: medium armor, shields, martial weapons.' },
    'bard:valor:Combat Inspiration': { roll: '1bi', rollNote: 'the inspired creature adds it to weapon damage, or to AC against one attack' },
    'bard:valor:Extra Attack': { none: true, note: 'Built in: subclass extraAttack at 6th level.' },
    'bard:valor:Battle Magic': { col: 'bonus', text: 'After you cast a bard spell with your action this turn: one weapon attack.' },

    // Glamour
    'bard:glamour:Mantle of Inspiration': { col: 'bonus', cost: BI, roll: '{tier(bard,3,5,5,8,10,11,15,14)}', rollNote: 'temp HP to each chosen creature', text: 'Up to {max(1,cha)} creatures within 60 ft gain the temp HP and can use their reaction to move up to their speed without provoking.' },
    'bard:glamour:Enthralling Performance': { dc: 'spell', save: 'WIS', text: 'After 1 minute of performing: up to {max(1,cha)} humanoids within 60 ft that watched are charmed by you for 1 hour on a failed save.' },
    'bard:glamour:Mantle of Majesty': {
      col: 'bonus', use: E('Mantle of Majesty', 10, { note: 'Concentration. Cast Command as a bonus action each turn without a slot; creatures charmed by you fail the save' }),
      acts: [{ name: 'Command', col: 'bonus', onlyWhen: { effect: 'Mantle of Majesty' }, dc: 'spell', save: 'WIS' }]
    },
    'bard:glamour:Unbreakable Majesty': { col: 'bonus', dc: 'spell', save: 'CHA', use: E('Unbreakable Majesty', 10, { note: 'A creature attacking you first makes a CHA save or must pick a new target; on a success it has disadvantage on its save vs your next spell' }) },

    // Swords
    'bard:swords:Bonus Proficiencies': { none: true, note: 'Built in: medium armor. Scimitar proficiency and using weapons as a spellcasting focus are on the description.' },
    'bard:swords:Blade Flourish': {
      cost: null, roll: null,
      text: 'When you take the Attack action your speed rises by 10 ft this turn. Once per turn on a weapon hit, use one flourish.',
      acts: [
        { name: 'Defensive Flourish', col: 'action', cost: BI, roll: '1bi', rollNote: 'extra weapon damage, and add the same number to your AC until your next turn' },
        { name: 'Slashing Flourish', col: 'action', cost: BI, roll: '1bi', rollNote: 'extra damage to the target and to another creature within 5 ft' },
        { name: 'Mobile Flourish', col: 'action', cost: BI, roll: '1bi', rollNote: 'extra damage; push the target 5 + roll ft (you can follow with your reaction)' }]
    },
    'bard:swords:Extra Attack': { none: true, note: 'Built in: subclass extraAttack at 6th level.' },
    "bard:swords:Master's Flourish": {
      text: 'Use a d6 instead of spending Bardic Inspiration for a flourish.',
      acts: [
        { name: 'Defensive (d6)', col: 'action', roll: '1d6', rollNote: 'extra damage and AC bonus until your next turn' },
        { name: 'Slashing (d6)', col: 'action', roll: '1d6', rollNote: 'extra damage to the target and another creature within 5 ft' },
        { name: 'Mobile (d6)', col: 'action', roll: '1d6', rollNote: 'extra damage; push 5 + roll ft' }]
    },

    // Whispers
    'bard:whispers:Psychic Blades': { col: 'action', cost: BI, roll: '{tier(bard,3,2,5,3,10,5,15,8)}d6', rollNote: 'psychic, once per turn on a weapon hit' },
    'bard:whispers:Words of Terror': { dc: 'spell', save: 'WIS', text: 'After 1 minute alone talking with a creature: on a failed save it is frightened of you or a creature you choose for 1 hour (ends if attacked or damaged).' },
    'bard:whispers:Mantle of Whispers': { col: 'reaction', use: E('Mantle of Whispers', 600, { note: 'Disguised as the dead humanoid; +5 to CHA (Deception) checks to pass as it. End as a bonus action' }) },
    'bard:whispers:Shadow Lore': { col: 'action', dc: 'spell', save: 'WIS', text: 'On a failure the creature is charmed for 8 hours, obeying you out of fear (it knows afterwards).' },

    // Creation
    'bard:creation:Mote of Potential': {
      text: 'Bonus effect when the inspired creature uses the die.',
      acts: [
        { name: 'Check: roll twice', roll: '2bi', rollNote: 'the creature uses either roll' },
        { name: 'Attack: thunder', roll: '1bi', rollNote: 'thunder damage to the target and each creature within 5 ft (CON save negates)', dc: 'spell', save: 'CON' },
        { name: 'Save: temp HP', roll: '1bi+{cha}', rollNote: 'temp HP for the creature' }]
    },
    'bard:creation:Performance of Creation': { col: 'action', text: 'Create a nonmagical item worth up to {20*bard} gp, {tier(bard,3,1,6,2,14,3) == 1 ? 0 : 0}size Medium (Large at 6th, Huge at 14th); it lasts {prof} hours. You can also use it again by spending a 2nd-level or higher slot.' },
    'bard:creation:Animating Performance': { col: 'action', text: 'The Dancing Item joins you for 1 hour (see Companions). Command it with a bonus action. You can also use it again by spending a 3rd-level or higher slot.' },
    'bard:creation:Creative Crescendo': { text: 'Performance of Creation makes up to {max(2,cha)} items (one of any size, the rest Small or smaller) with no gp limit.' },

    // Eloquence
    'bard:eloquence:Silver Tongue': { passive: { minD20: { skills: ['Persuasion', 'Deception'], value: 10 } } },
    'bard:eloquence:Unsettling Words': { col: 'bonus', cost: BI, roll: '1bi', rollNote: 'subtract from the creature’s next save before your next turn' },
    'bard:eloquence:Unfailing Inspiration': { none: true, note: 'Applies to the inspired creature: it keeps the die if the roll still fails.' },
    'bard:eloquence:Universal Speech': { col: 'action', text: 'Up to {max(1,cha)} creatures within 60 ft understand you for 1 hour. You can also use it again by spending any spell slot.' },
    'bard:eloquence:Infectious Inspiration': { col: 'reaction', roll: '1bi', rollNote: 'the free Bardic Inspiration die you give another creature within 60 ft' },

    // Spirits
    'bard:spirits:Guiding Whispers': { spells: ['Guidance'], spellNote: 'Range 60 ft' },
    'bard:spirits:Spiritual Focus': { roll: null, text: 'Candle, crystal ball, skull, spirit board or tarokka deck as a spellcasting focus.', acts: [{ name: '+1d6 to a bard spell', min: 6, roll: '1d6', rollNote: 'added to one damage or healing roll of a bard spell cast through the focus' }] },
    'bard:spirits:Tales from Beyond': { col: 'bonus', cost: BI, roll: '1bi', rollNote: 'Spirit Tales table (roll with your Bardic Inspiration die)', dc: 'spell', text: 'Hold the tale until you tell it (action) or finish a rest.' },
    'bard:spirits:Spirit Session': { text: '1-hour ritual with up to {prof} willing creatures (you included): learn one divination or necromancy spell of a level up to the number of participants (and one you can cast) until your next long rest.' },
    'bard:spirits:Mystical Connection': { roll: '2bi', rollNote: 'two Spirit Tales results — choose one; doubles = choose any tale' }
  });

  // ---- Storm Herald per-environment additions (Storm Soul extras and Raging Storm) on the Storm Aura choices ----
  addActs('stormAura', 'Desert', [{ name: 'Raging Storm (Desert)', col: 'reaction', min: 14, onlyRaging: true, roll: '{floor(barbarian/2)}', rollNote: 'fire to the creature in your aura that hit you (DEX save negates)', dc: 'con', save: 'DEX' }]);
  addActs('stormAura', 'Sea', [{ name: 'Raging Storm (Sea)', col: 'reaction', min: 14, onlyRaging: true, text: 'When you hit a creature in your aura: it is knocked prone on a failed save.', dc: 'con', save: 'STR' }]);
  addActs('stormAura', 'Tundra', [
    { name: 'Freeze water', col: 'action', min: 6, text: 'Freeze a 5-ft cube of unoccupied water for 1 minute.' },
    { name: 'Raging Storm (Tundra)', min: 14, onlyRaging: true, text: 'When your aura activates: one creature in it has speed 0 until the start of your next turn on a failed save.', dc: 'con', save: 'STR' }]);
  addPassive('stormAura', 'Desert', { min: 6, advNote: 'Storm Soul: unaffected by extreme heat; set unattended flammable objects alight by touch (action)' });
  addPassive('stormAura', 'Sea', { min: 6, advNote: 'Storm Soul: you can breathe underwater' });
  addPassive('stormAura', 'Tundra', { min: 6, advNote: 'Storm Soul: unaffected by extreme cold' });
  // ---- Totem Warrior choices that had nothing ----
  setOpt('totemAttune', 'Bear', { raging: { advNote: 'Hostile creatures within 5 ft have disadvantage on attacks against others (Bear)' } });
  addPassive('totemAspect', 'Bear', { advNote: 'STR checks to push, pull, lift or break objects (Bear)' });
})();

// Feature automation: Cleric and Druid (PHB, XGE, TCE, SCAG) — see tools/FX_SPEC.md.
// Full keys only ('<class>:<Feature>' / '<class>:<sub>:<Feature>'); later files win over data/featfx.js.
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const CD = { from: 'Channel Divinity', n: 1 };
  const WS = { from: 'Wild Shape', n: 1 };
  const DSD = '{tier(cleric,8,1,14,2)}d8';
  // Divine Strike: once per turn on a weapon hit, 1d8 (2d8 at 14th). Rolled from the Action column next to your attacks.
  const DS = type => ({ col: 'action', roll: DSD, rollNote: type + ' damage (once per turn, on a weapon hit)', text: 'Add to one weapon hit this turn: ' + type + ' damage' });
  const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
  const HALO = '{tier(druid,2,4,6,6,10,8,14,10)}';
  const STARD = '{tier(druid,2,1,10,2)}d8';

  Object.assign(DND.featFx, {
    // ======================= CLERIC =======================
    'cleric:Spellcasting': { none: true },
    'cleric:Channel Divinity': { resource: true },
    'cleric:Turn Undead': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      text: 'Each undead within 30 ft that can see or hear you: on a failed save it is turned for 1 minute or until it takes damage. Destroy Undead (5th+): turned undead of CR 1/2 (5th), 1 (8th), 2 (11th), 3 (14th) or 4 (17th) or lower are destroyed instead.' },
    // The CR limit at your level is shown from the class scaling table ("Destroy Undead: CR …") on this card and on Turn Undead.
    'cleric:Destroy Undead': { text: 'When an undead fails its save against your Turn Undead, it is destroyed if its CR is at or below your limit: CR 1/2 at 5th, 1 at 8th, 2 at 11th, 3 at 14th, 4 at 17th.' },
    'cleric:Divine Intervention': { col: 'action', roll: '1d100', rollNote: 'succeeds on {cleric>=20?100:cleric} or lower',
      text: 'Succeeds on a d100 roll of {cleric>=20?100:cleric} or lower. On a success you can\'t use it again for 7 days (keep the use spent); on a failure you can try again after a long rest.' },
    'cleric:Divine Intervention Improvement': { none: true, text: 'Divine Intervention succeeds automatically (its success number becomes 100).' },

    // ---- Knowledge Domain ----
    'cleric:knowledge:Blessings of Knowledge': { none: true }, // languages + expertise come from the subclass choices
    'cleric:knowledge:Channel Divinity: Knowledge of the Ages': { col: 'action', cost: CD,
      use: { effect: { name: 'Knowledge of the Ages', rounds: 100, buff: { note: 'Proficient with one chosen skill or tool for 10 minutes' } } } },
    'cleric:knowledge:Channel Divinity: Read Thoughts': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      use: { effect: { name: 'Read Thoughts', rounds: 10, buff: { note: 'Read the target\'s surface thoughts (within 60 ft); action: end it to cast suggestion on it without a slot (no save)' } } },
      text: 'One creature within 60 ft. On a success you can\'t use this on it again until a long rest.' },
    'cleric:knowledge:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:knowledge:Visions of the Past': { text: 'Meditate at least 1 minute, then concentrate for up to your WIS score in minutes: Object Reading (owner\'s past) or Area Reading (events here within WIS-score days).' },

    // ---- Life Domain ----
    'cleric:life:Bonus Proficiency': { none: true }, // heavy armor from subclass proficiencies
    'cleric:life:Disciple of Life': { passive: { healBonus: true } },
    'cleric:life:Channel Divinity: Preserve Life': { col: 'action', cost: CD,
      text: 'Divide {5*cleric} HP among any creatures within 30 ft; none above half its HP maximum. No effect on undead or constructs.' },
    'cleric:life:Blessed Healer': {
      text: 'When a 1st+ level spell you cast heals another creature, you regain 2 + the spell\'s level HP.',
      acts: ORD.map((o, k) => ({ name: 'Healed with ' + o, use: { heal: String(3 + k) }, min: Math.max(6, 2 * (k + 1) - 1), text: 'You regain ' + (3 + k) + ' HP' })) },
    'cleric:life:Divine Strike': DS('radiant'),
    'cleric:life:Supreme Healing': { none: true, text: 'Healing spells: use the highest number on each die instead of rolling (apply it to the cast result).' },

    // ---- Light Domain ----
    'cleric:light:Bonus Cantrip': { spells: ['Light'] },
    'cleric:light:Warding Flare': { col: 'reaction', text: 'An attacker within 30 ft that you can see has disadvantage on its attack roll against you (not if it can\'t be blinded).' },
    'cleric:light:Improved Flare': { acts: [{ name: 'Warding Flare (ally)', col: 'reaction', cost: { from: 'Warding Flare', n: 1 }, text: 'Impose disadvantage on an attack against a creature other than you within 30 ft' }] },
    'cleric:light:Channel Divinity: Radiance of the Dawn': { col: 'action', cost: CD, dc: 'spell', save: 'CON', roll: '2d10+cleric', rollNote: 'radiant (half on a save)',
      text: 'Dispels magical darkness within 30 ft; each hostile creature within 30 ft takes the radiant damage (CON half; no effect behind total cover).' },
    'cleric:light:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:light:Corona of Light': { col: 'action',
      use: { effect: { name: 'Corona of Light', rounds: 10, buff: { note: 'Bright light 60 ft, dim 30 ft beyond; enemies in the bright light have disadvantage on saves against spells dealing fire or radiant damage' } } } },

    // ---- Nature Domain ----
    'cleric:nature:Acolyte of Nature': { none: true }, // cantrip + skill come from the subclass choices
    'cleric:nature:Bonus Proficiency': { none: true },
    'cleric:nature:Channel Divinity: Charm Animals and Plants': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      use: { effect: { name: 'Charm Animals and Plants', rounds: 10, buff: { note: 'Charmed beasts and plants are friendly to you and your allies (ends on damage)' } } },
      text: 'Each beast or plant creature within 30 ft that can see you: charmed for 1 minute or until it takes damage on a failed save.' },
    'cleric:nature:Dampen Elements': { col: 'reaction', text: 'You or a creature within 30 ft gains resistance to that instance of acid, cold, fire, lightning or thunder damage.' },
    'cleric:nature:Divine Strike': DS('cold, fire or lightning'),
    'cleric:nature:Master of Nature': { col: 'bonus', onlyWhen: { effect: 'Charm Animals and Plants' }, text: 'Command what each creature charmed by Charm Animals and Plants does on its next turn.' },

    // ---- Tempest Domain ----
    'cleric:tempest:Bonus Proficiencies': { none: true },
    'cleric:tempest:Wrath of the Storm': { col: 'reaction', dc: 'spell', save: 'DEX', roll: '2d8', rollNote: 'lightning or thunder (DEX half)',
      text: 'The creature within 5 ft that hit you takes the damage (your choice of lightning or thunder), half on a successful DEX save.' },
    'cleric:tempest:Channel Divinity: Destructive Wrath': { col: 'action', cost: CD, text: 'Deal maximum damage on one lightning or thunder damage roll instead of rolling.' },
    'cleric:tempest:Thunderbolt Strike': { none: true, text: 'When you deal lightning damage to a Large or smaller creature, you can push it up to 10 ft away.' },
    'cleric:tempest:Divine Strike': DS('thunder'),
    'cleric:tempest:Stormborn': { passive: { fly: 'walk', advNote: 'Stormborn flying speed only when not underground or indoors' } },

    // ---- Trickery Domain ----
    'cleric:trickery:Blessing of the Trickster': { col: 'action', text: 'A willing creature you touch (not you) has advantage on Stealth checks for 1 hour or until you use this again.' },
    'cleric:trickery:Channel Divinity: Invoke Duplicity': { col: 'action', cost: CD,
      use: { effect: { name: 'Invoke Duplicity', rounds: 10, buff: { note: 'Concentration. Illusory duplicate(s) within 120 ft: bonus action move 30 ft; cast spells from its space; advantage on attacks when you and it are both within 5 ft of the target' } } },
      text: 'Illusion appears within 30 ft; lasts 1 minute (concentration). Improved Duplicity (17th): up to four duplicates.' },
    'cleric:trickery:Channel Divinity: Cloak of Shadows': { col: 'action', cost: CD, use: { cond: 'Invisible', condRounds: 1 }, text: 'Invisible until the end of your next turn; ends early if you attack or cast a spell.' },
    'cleric:trickery:Divine Strike': DS('poison'),
    'cleric:trickery:Improved Duplicity': { none: true, text: 'Invoke Duplicity creates up to four duplicates; one bonus action moves any number of them.' },

    // ---- War Domain ----
    'cleric:war:Bonus Proficiencies': { none: true },
    'cleric:war:War Priest': { col: 'bonus', text: 'After taking the Attack action: one weapon attack as a bonus action.' },
    'cleric:war:Channel Divinity: Guided Strike': { col: 'action', cost: CD, text: '+10 to one of your attack rolls (decide after seeing the d20, before the result is known).' },
    'cleric:war:Channel Divinity: War God\'s Blessing': { col: 'reaction', cost: CD, text: '+10 to an attack roll made by a creature within 30 ft.' },
    'cleric:war:Divine Strike': DS('weapon\'s damage type'),
    'cleric:war:Avatar of Battle': { passive: { resist: ['nonmagical bludgeoning, piercing and slashing'] } },

    // ---- Forge Domain ----
    'cleric:forge:Bonus Proficiencies': { none: true },
    'cleric:forge:Blessing of the Forge': { target: 'forge', trigger: 'longRest', triggerLabel: 'Bless an item', triggerText: 'Blessing of the Forge: at the end of this long rest, make one nonmagical armor or weapon +1.' },
    'cleric:forge:Channel Divinity: Artisan\'s Blessing': { cost: CD, text: 'One-hour ritual: create a nonmagical item (at least partly metal) worth up to 100 gp, consuming metal of equal value.' },
    'cleric:forge:Soul of the Forge': { passive: { resist: ['fire'], acHeavy: 1 } },
    'cleric:forge:Divine Strike': DS('fire'),
    'cleric:forge:Saint of Forge and Fire': { passive: { immune: ['fire'], advNote: 'In heavy armor: resistance to nonmagical bludgeoning, piercing and slashing (Saint of Forge and Fire)' } },

    // ---- Grave Domain ----
    'cleric:grave:Circle of Mortality': { spells: ['Spare the Dying'], spellNote: 'Bonus action, range 30 ft. Healing dice on a creature at 0 HP use their maximum' },
    'cleric:grave:Eyes of the Grave': { col: 'action', use: { effect: { name: 'Eyes of the Grave', rounds: 1, buff: { note: 'Know the location of undead within 60 ft (not behind total cover or warded from divination)' } } } },
    'cleric:grave:Channel Divinity: Path to the Grave': { col: 'action', cost: CD, text: 'Curse a creature within 30 ft until the end of your next turn: the next attack that hits it deals vulnerable (double) damage, then the curse ends.' },
    'cleric:grave:Sentinel at Death\'s Door': { col: 'reaction', text: 'A critical hit against you or a creature within 30 ft becomes a normal hit.' },
    'cleric:grave:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:grave:Keeper of Souls': { none: true, text: 'When an enemy you can see dies within 60 ft, you or a creature within 60 ft regains HP equal to its number of Hit Dice (once per round, not while incapacitated).' },

    // ---- Order Domain ----
    'cleric:order:Bonus Proficiencies': { none: true },
    'cleric:order:Voice of Authority': { none: true, text: 'Cast a 1st+ level slot spell on an ally: that ally can use its reaction to make one weapon attack against a creature you choose.' },
    'cleric:order:Channel Divinity: Order\'s Demand': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      text: 'Creatures of your choice within 30 ft that can see or hear you: charmed until the end of your next turn or until damaged; you can make any of them drop one held item.' },
    'cleric:order:Embodiment of the Law': { col: 'bonus', text: 'Cast a 1st+ level enchantment spell with a casting time of 1 action as a bonus action.' },
    'cleric:order:Divine Strike': DS('psychic'),
    'cleric:order:Order\'s Wrath': { roll: '2d8', rollNote: 'psychic, the next ally hit on the cursed creature',
      text: 'After your Divine Strike hits, curse the target until the start of your next turn; the next ally hit on it deals +2d8 psychic and ends the curse.' },

    // ---- Peace Domain ----
    'cleric:peace:Implement of Peace': { none: true }, // skill from the subclass choice
    'cleric:peace:Emboldening Bond': { col: 'action',
      use: { effect: { name: 'Emboldening Bond', rounds: 100, buff: { note: 'Once per turn add 1d4 to an attack, check or save while within 30 ft of another bonded creature' } } },
      text: 'Bond up to {prof} willing creatures within 30 ft (you can include yourself) for 10 minutes.',
      acts: [{ name: 'Add 1d4', roll: '1d4', rollNote: 'add to the attack, check or save', onlyWhen: { effect: 'Emboldening Bond' } }] },
    'cleric:peace:Channel Divinity: Balm of Peace': { col: 'action', cost: CD, dash: true, roll: '2d6+wis', rollNote: 'healing to each other creature you pass within 5 ft (min 1)',
      text: 'Move up to your speed without provoking opportunity attacks; each other creature you come within 5 ft of regains 2d6 + WIS HP (once each).' },
    'cleric:peace:Protective Bond': { col: 'reaction', onlyWhen: { effect: 'Emboldening Bond' },
      text: 'A bonded creature about to take damage: another bonded creature within {cleric>=17?60:30} ft teleports next to it and takes all the damage instead{cleric>=17?1:0}' .replace('{cleric>=17?1:0}', '') + ' (from 17th: with resistance to it).' },
    'cleric:peace:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:peace:Expansive Bond': { none: true, text: 'Emboldening Bond and Protective Bond work within 60 ft; a creature using Protective Bond has resistance to that damage.' },

    // ---- Twilight Domain ----
    'cleric:twilight:Bonus Proficiencies': { none: true },
    'cleric:twilight:Eyes of Night': { col: 'action', passive: { sense: 'Darkvision 300 ft (Eyes of Night)' },
      text: 'Share this darkvision with up to {max(1,wis)} willing creatures within 10 ft for 1 hour (again by spending any spell slot).' },
    'cleric:twilight:Vigilant Blessing': { col: 'action', text: 'You or a creature you touch has advantage on its next initiative roll.' },
    'cleric:twilight:Channel Divinity: Twilight Sanctuary': { col: 'action', cost: CD,
      use: { effect: { name: 'Twilight Sanctuary', rounds: 10, buff: { note: '30-ft sphere of dim light centered on you. A creature (you included) ending its turn inside: 1d6 + cleric level temp HP, or end one charm or fright effect' } } },
      text: 'Lasts 1 minute or until you are incapacitated or die.',
      acts: [
        { name: 'Temp HP (me)', use: { temp: '1d6+cleric' }, onlyWhen: { effect: 'Twilight Sanctuary' } },
        { name: 'Temp HP (ally)', roll: '1d6+cleric', rollNote: 'temp HP for a creature ending its turn in the sphere', onlyWhen: { effect: 'Twilight Sanctuary' } },
        { name: 'End charm/fear (me)', use: { removeCond: ['Charmed', 'Frightened'] }, onlyWhen: { effect: 'Twilight Sanctuary' } }
      ] },
    'cleric:twilight:Steps of Night': { col: 'bonus', use: { effect: { name: 'Steps of Night', rounds: 10, buff: { fly: 'walk', note: 'Flying speed equal to your walking speed' } } }, text: 'Only while you are in dim light or darkness.' },
    'cleric:twilight:Divine Strike': DS('radiant'),
    'cleric:twilight:Twilight Shroud': { passive: { effect: 'Twilight Sanctuary', ac: 2, advNote: 'Half cover inside Twilight Sanctuary (+2 AC and DEX saves) for you and allies' } },

    // ---- Arcana Domain ----
    'cleric:arcana:Arcane Initiate': { passive: { skillProf: ['Arcana'] } },
    'cleric:arcana:Channel Divinity: Arcane Abjuration': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      text: 'One celestial, elemental, fey or fiend within 30 ft that can see or hear you: turned for 1 minute or until damaged. From 5th, if not on its home plane and CR ≤ 1/2 (5th), 1 (8th), 2 (11th), 3 (14th), 4 (17th), it is banished for 1 minute instead.' },
    'cleric:arcana:Spell Breaker': { none: true, text: 'When a 1st+ level spell of yours heals an ally, also end one spell on it of a level no higher than the slot used.' },
    'cleric:arcana:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:arcana:Arcane Mastery': { none: true, text: 'Choose one wizard spell each of 6th, 7th, 8th and 9th level; add them to your domain spells (attach them to this feature).' },

    // ======================= DRUID =======================
    'druid:Druidic': { none: true },
    'druid:Spellcasting': { none: true },
    'druid:Wild Shape': { note: 'Built in: the Use button opens the beast picker (CR/fly/swim limits by level and circle; Moon elementals cost 2 uses).' },
    'druid:Timeless Body': { none: true },
    'druid:Beast Spells': { none: true, text: 'You can cast druid spells with verbal and somatic components while in Wild Shape (not material components).' },
    'druid:Archdruid': { none: true, text: 'Unlimited Wild Shape (in the Wild Shape uses); ignore verbal, somatic and non-costly material components of druid spells.' },

    // ---- Circle of the Land ----
    'druid:land:Bonus Cantrip': { none: true }, // cantrip from the subclass choice
    'druid:land:Natural Recovery': { use: { recoverSlots: { total: 'ceil(druid/2)', maxLevel: 5 } }, trigger: 'shortRest', triggerLabel: 'Recover slots',
      triggerText: 'Natural Recovery: recover expended spell slots totaling up to {ceil(druid/2)} levels (none 6th or higher).' },
    'druid:land:Circle Spells': { none: true }, // the land choice (DND.options.landCircle) adds the spells
    'druid:land:Land\'s Stride': { passive: { advNote: 'Saves against plants magically created or manipulated to impede movement (Land\'s Stride); nonmagical difficult terrain and plants cost no extra movement' } },
    'druid:land:Nature\'s Ward': { passive: { immune: ['poison', 'disease'], condImmune: ['Poisoned'], advNote: 'Can\'t be charmed or frightened by elementals or fey (Nature\'s Ward)' } },
    'druid:land:Nature\'s Sanctuary': { dc: 'spell', save: 'WIS', text: 'A beast or plant creature attacking you must make a WIS save or choose another target (or the attack misses); on a success it is immune for 24 hours.' },

    // ---- Circle of the Moon ----
    'druid:moon:Combat Wild Shape': {
      text: 'Wild Shape as a bonus action (built into the Wild Shape picker). While transformed, bonus action: expend a spell slot to regain 1d8 HP per slot level (mark the slot on the Spells tab).',
      acts: ORD.map((o, k) => ({ name: 'Heal (' + o + ' slot)', col: 'bonus', roll: (k + 1) + 'd8', rollNote: 'HP regained — expend a ' + o + '-level slot', healRoll: true, onlyWhen: { effect: 'Wild Shape' }, min: Math.max(2, 2 * (k + 1) - 1) })) },
    'druid:moon:Circle Forms': { note: 'Built in: Wild Shape beasts up to CR 1, or CR = druid level ÷ 3 from 6th.' },
    'druid:moon:Primal Strike': { none: true, text: 'Your beast-form attacks count as magical for overcoming resistance and immunity.' },
    'druid:moon:Elemental Wild Shape': { note: 'Built in: the Wild Shape picker offers Air, Earth, Fire and Water Elementals for 2 uses.' },
    'druid:moon:Thousand Forms': { spells: ['Alter Self'], spellNote: 'At will, without a spell slot' },

    // ---- Circle of Dreams ----
    'druid:dreams:Balm of the Summer Court': {
      text: 'Bonus action: spend up to {max(1,floor(druid/2))} dice; a creature within 120 ft regains that many d6 HP and gains 1 temp HP per die.',
      acts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ name: n + 'd6', col: 'bonus', cost: { from: 'Balm of the Summer Court', n }, roll: n + 'd6', rollNote: 'healing; the target also gains ' + n + ' temp HP', healRoll: true, min: Math.max(2, 2 * n) })) },
    'druid:dreams:Hearth of Moonlight and Shadow': { passive: { advNote: 'During a short or long rest: you and allies in your 30-ft sphere get +5 to Stealth and Perception checks; light inside isn\'t visible outside' } },
    'druid:dreams:Hidden Paths': { col: 'bonus', text: 'Teleport up to 60 ft to an unoccupied space you can see.',
      acts: [{ name: 'Teleport ally 30 ft', col: 'action', cost: true, text: 'Teleport a willing creature you touch up to 30 ft to an unoccupied space you can see' }] },
    'druid:dreams:Walker in Dreams': { trigger: 'shortRest', triggerLabel: 'Use it',
      text: 'Cast dream (you as messenger), scrying, or teleportation circle (to the last place you took a long rest) without a slot or material components.',
      triggerText: 'Walker in Dreams: after this short rest, cast dream, scrying or teleportation circle without a slot or material components.' },

    // ---- Circle of the Shepherd ----
    'druid:shepherd:Speech of the Woods': { spells: ['Speak with Animals'], spellNote: 'Beasts understand you and you them (at will)' },
    'druid:shepherd:Spirit Totem': { col: 'bonus',
      use: { effect: { name: 'Spirit Totem', rounds: 10, buff: { note: 'Choose the spirit below' } } },
      text: 'Summon a spirit within 60 ft: a 30-ft aura for 1 minute (bonus action to move it 60 ft). Choose Bear, Hawk or Unicorn.',
      acts: [
        { name: 'Bear', onlyWhen: { effect: 'Spirit Totem' }, use: { endEffect: 'Spirit Totem', temp: '5+druid', effect: { name: 'Spirit Totem: Bear', rounds: 10, buff: { note: 'Bear aura: creatures of your choice got 5 + druid level temp HP; advantage on STR checks and saves in the aura' } } }, text: 'You and allies in the aura gain {5+druid} temp HP' },
        { name: 'Hawk', onlyWhen: { effect: 'Spirit Totem' }, use: { endEffect: 'Spirit Totem', effect: { name: 'Spirit Totem: Hawk', rounds: 10, buff: { note: 'Hawk aura: advantage on Perception checks; reaction to grant advantage on an attack against a creature in the aura' } } } },
        { name: 'Unicorn', onlyWhen: { effect: 'Spirit Totem' }, use: { endEffect: 'Spirit Totem', effect: { name: 'Spirit Totem: Unicorn', rounds: 10, buff: { note: 'Unicorn aura: advantage on checks to detect creatures in it; slot healing spells also heal creatures of your choice in it for your druid level' } } } },
        { name: 'Hawk: grant advantage', col: 'reaction', onlyWhen: { effect: 'Spirit Totem: Hawk' }, text: 'Advantage on one attack roll against a target in the aura' },
        { name: 'Unicorn: heal aura', onlyWhen: { effect: 'Spirit Totem: Unicorn' }, use: { heal: 'druid' }, text: 'When you heal with a spell slot: each creature of your choice in the aura (you included) regains {druid} HP' }
      ] },
    'druid:shepherd:Mighty Summoner': { none: true, text: 'Beasts and fey you summon with spells gain 2 extra HP per Hit Die and their natural weapons count as magical.' },
    'druid:shepherd:Guardian Spirit': { acts: [{ name: 'Guardian Spirit heal', onlyWhen: { effect: 'Spirit Totem' }, roll: '{floor(druid/2)}', rollNote: 'HP for a summoned beast or fey ending its turn in the aura' }],
      text: 'Your summoned beasts and fey that end their turn in your Spirit Totem aura regain {floor(druid/2)} HP.' },
    'druid:shepherd:Faithful Summons': { trigger: 'zero', triggerLabel: 'Summon guardians',
      text: 'Four beasts of CR 2 or lower appear within 20 ft to protect you (as conjure animals at 9th level, 1 hour, no concentration). Add them on the Creatures tab.',
      triggerText: 'Faithful Summons: you are at 0 HP — four CR 2 or lower beasts appear to protect you for 1 hour.' },

    // ---- Circle of Spores ----
    'druid:spores:Halo of Spores': { col: 'reaction', dc: 'spell', save: 'CON', roll: '1d' + HALO, rollNote: 'necrotic (CON negates)',
      text: 'A creature you can see moves into a space within 10 ft of you or starts its turn there.',
      acts: [{ name: 'Halo (Symbiotic)', col: 'reaction', roll: '2d' + HALO, rollNote: 'necrotic, die rolled twice (CON negates)', dc: 'spell', save: 'CON', onlyWhen: { effect: 'Symbiotic Entity' } }] },
    'druid:spores:Symbiotic Entity': { col: 'action', cost: WS,
      use: { effect: { name: 'Symbiotic Entity', rounds: 100, buff: { dmgDice: '1d6 necrotic', note: 'Melee weapon hits +1d6 necrotic; Halo of Spores die rolled twice. Ends when the temp HP are gone' } }, temp: '4*druid' } },
    'druid:spores:Fungal Infestation': { col: 'reaction', text: 'A beast or humanoid (Small or Medium) dies within 10 ft: it rises as a zombie with 1 HP for 1 hour, acting on your bonus-action commands.' },
    'druid:spores:Spreading Spores': { col: 'bonus', onlyWhen: { effect: 'Symbiotic Entity' }, dc: 'spell', save: 'CON', roll: '1d' + HALO, rollNote: 'necrotic to a creature entering or starting its turn in the cube (CON negates)',
      use: { effect: { name: 'Spreading Spores', rounds: 10, buff: { note: '10-ft cube within 30 ft deals your Halo of Spores damage; no Halo reaction while it lasts' } } } },
    'druid:spores:Fungal Body': { passive: { condImmune: ['Blinded', 'Deafened', 'Frightened', 'Poisoned'], advNote: 'Critical hits against you count as normal hits unless you are incapacitated (Fungal Body)' } },

    // ---- Circle of Stars ----
    'druid:stars:Star Map': { spells: ['Guidance', 'Guiding Bolt'], spellNote: 'Guiding Bolt without a slot {prof}× per long rest (track with this feature\'s uses)' },
    'druid:stars:Starry Form': { cost: null,
      text: 'Spend a Wild Shape use: luminous form for 10 minutes (bright light 10 ft, dim 10 ft more).',
      acts: [
        { name: 'Archer', col: 'bonus', cost: WS, roll: STARD + '+wis', rollNote: 'radiant on a hit (ranged spell attack, 60 ft)',
          use: { effect: { name: 'Starry Form: Archer', rounds: 100, buff: { note: 'Bonus action each turn: ranged spell attack (60 ft) for 1d8 + WIS radiant (2d8 from 10th)' } } }, text: 'Ranged spell attack +{prof+wis} as part of this bonus action' },
        { name: 'Archer shot', col: 'bonus', onlyWhen: { effect: 'Starry Form: Archer' }, roll: STARD + '+wis', rollNote: 'radiant on a hit', text: 'Ranged spell attack +{prof+wis}, 60 ft' },
        { name: 'Chalice', col: 'bonus', cost: WS,
          use: { effect: { name: 'Starry Form: Chalice', rounds: 100, buff: { note: 'When you heal with a spell slot, you or another creature within 30 ft regains 1d8 + WIS (2d8 from 10th)' } } } },
        { name: 'Chalice heal', onlyWhen: { effect: 'Starry Form: Chalice' }, roll: STARD + '+wis', rollNote: 'healing to you or a creature within 30 ft', healRoll: true },
        { name: 'Dragon', col: 'bonus', cost: WS,
          use: { effect: { name: 'Starry Form: Dragon', rounds: 100, buff: { note: 'INT and WIS checks and CON saves to keep concentration: treat a d20 of 9 or lower as 10' } } } }
      ],
      passive: [{ effect: 'Starry Form: Dragon', minD20: { ab: 'int', value: 10 } }, { effect: 'Starry Form: Dragon', minD20: { ab: 'wis', value: 10 }, advNote: 'Concentration saves: treat a d20 of 9 or lower as 10 (Dragon form)' }] },
    'druid:stars:Cosmic Omen': { col: 'reaction', roll: '1d6',
      text: 'After a long rest, roll a die: even = Weal (add this d6 to a creature\'s attack, save or check within 30 ft), odd = Woe (subtract it).' },
    'druid:stars:Twinkling Constellations': {
      text: 'Starry Form dice become 2d8; Dragon form grants a 20-ft fly speed (hover); at the start of each of your turns you can change constellation.',
      passive: { effect: 'Starry Form: Dragon', fly: 20 },
      acts: [
        { name: '→ Archer', onlyWhen: { effect: 'Starry Form: Chalice' }, use: { endEffect: 'Starry Form: Chalice', effect: { name: 'Starry Form: Archer', rounds: 100, buff: { note: 'Bonus action each turn: ranged spell attack (60 ft) for 2d8 + WIS radiant' } } } },
        { name: '→ Archer', onlyWhen: { effect: 'Starry Form: Dragon' }, use: { endEffect: 'Starry Form: Dragon', effect: { name: 'Starry Form: Archer', rounds: 100, buff: { note: 'Bonus action each turn: ranged spell attack (60 ft) for 2d8 + WIS radiant' } } } },
        { name: '→ Chalice', onlyWhen: { effect: 'Starry Form: Archer' }, use: { endEffect: 'Starry Form: Archer', effect: { name: 'Starry Form: Chalice', rounds: 100, buff: { note: 'When you heal with a spell slot, you or another creature within 30 ft regains 2d8 + WIS' } } } },
        { name: '→ Chalice', onlyWhen: { effect: 'Starry Form: Dragon' }, use: { endEffect: 'Starry Form: Dragon', effect: { name: 'Starry Form: Chalice', rounds: 100, buff: { note: 'When you heal with a spell slot, you or another creature within 30 ft regains 2d8 + WIS' } } } },
        { name: '→ Dragon', onlyWhen: { effect: 'Starry Form: Archer' }, use: { endEffect: 'Starry Form: Archer', effect: { name: 'Starry Form: Dragon', rounds: 100, buff: { note: 'INT/WIS checks and concentration saves: 9 or lower counts as 10; fly 20 ft (hover)' } } } },
        { name: '→ Dragon', onlyWhen: { effect: 'Starry Form: Chalice' }, use: { endEffect: 'Starry Form: Chalice', effect: { name: 'Starry Form: Dragon', rounds: 100, buff: { note: 'INT/WIS checks and concentration saves: 9 or lower counts as 10; fly 20 ft (hover)' } } } }
      ] },
    'druid:stars:Full of Stars': { passive: [
      { effect: 'Starry Form: Archer', resist: BPS }, { effect: 'Starry Form: Chalice', resist: BPS }, { effect: 'Starry Form: Dragon', resist: BPS }] },

    // ---- Circle of Wildfire ----
    'druid:wildfire:Summon Wildfire Spirit': { col: 'action', cost: WS, dc: 'spell', save: 'DEX', roll: '2d6', rollNote: 'fire to each creature within 10 ft of where it appears (DEX save negates)',
      text: 'The spirit appears within 30 ft for 1 hour; each creature within 10 ft of it takes the fire damage unless it succeeds on the DEX save.' },
    'druid:wildfire:Enhanced Bond': { passive: { advNote: 'While your Wildfire Spirit is summoned: +1d8 to fire damage and healing spells; spells can originate from the spirit' } },
    'druid:wildfire:Cauterizing Flames': { col: 'reaction', roll: '2d10+wis', rollNote: 'healing or fire damage (your choice)', healRoll: true,
      text: 'When a Small or larger creature dies within 30 ft of you or your spirit, a flame fills its space for 1 minute; when a creature enters it, heal it or burn it for 2d10 + WIS.' },
    'druid:wildfire:Blazing Revival': { trigger: 'zero', triggerLabel: 'Blazing Revival', onlyWhen: { companion: 'Wildfire Spirit' },
      use: { healHalf: true, removeCond: ['Unconscious', 'Prone'], dismiss: 'Wildfire Spirit' },
      text: 'Your Wildfire Spirit drops to 0 HP and disappears.',
      triggerText: 'Blazing Revival: your Wildfire Spirit sacrifices itself — regain half your HP and rise to your feet.' }
  });
})();

// Feature automation: Fighter and Monk (PHB, XGE, SCAG, TCE, FTD), with their non-UA subclasses.
// Full keys only ('fighter:<Name>', 'fighter:<sub>:<Name>', 'monk:...'). Later files win over data/featfx.js.
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const E = (name, rounds, buff, more) => ({ effect: Object.assign({ name, rounds, buff: buff || {} }, more || {}) });
  const KI = n => ({ from: 'Ki', n });
  const PSI = { from: 'Psionic Power', n: 1 };
  // Class level at the moment a feature is used (the sheet's clsLv); falls back for offline checks.
  const lvOf = (k, d) => { try { return typeof clsLv === 'function' ? clsLv(k) : d; } catch (e) { return d; } };
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };

  Object.assign(DND.featFx, {
    // ================= FIGHTER =================
    'fighter:Fighting Style': { dc: false, text: 'The chosen style is listed as its own feature and carries its effects' },
    'fighter:Second Wind': { col: 'bonus', healRoll: true, rollNote: 'HP regained' },
    'fighter:Action Surge': { col: 'move', use: { resetTurn: true }, text: 'One additional action this turn (only one Action Surge per turn)' },
    'fighter:Extra Attack': { none: true },
    'fighter:Indomitable': { text: 'Reroll a failed saving throw; you must use the new roll' },

    // ---- Champion ----
    'fighter:champion:Improved Critical': { crit: 19 },
    'fighter:champion:Remarkable Athlete': { passive: { init: 'ceil(prof/2)', advNote: 'Half proficiency (rounded up) on STR, DEX and CON checks you aren’t proficient in; running long jump +STR mod ft (Remarkable Athlete)' } },
    'fighter:champion:Additional Fighting Style': { dc: false, text: 'The second style is listed as its own feature' },
    'fighter:champion:Superior Critical': { crit: 18 },
    'fighter:champion:Survivor': { onlyWhen: { hpBelowHalf: true }, use: { heal: '5+con' }, text: 'Start of each of your turns while at half HP or less (but above 0): regain 5 + CON mod HP' },

    // ---- Battle Master ----
    'fighter:battlemaster:Combat Superiority': { resource: true, dc: 'str|dex' },
    'fighter:battlemaster:Student of War': { none: true },
    'fighter:battlemaster:Know Your Enemy': { none: true },
    'fighter:battlemaster:Improved Combat Superiority': { none: true },
    'fighter:battlemaster:Relentless': { trigger: 'initiative', triggerText: 'If you have no superiority dice left, regain one.', triggerLabel: 'Regain a die',
      use: { regain: { from: 'Combat Superiority', n: 1 } }, text: 'Only when you roll initiative with no superiority dice remaining' },

    // ---- Eldritch Knight ----
    'fighter:eldritchknight:Spellcasting': { none: true },
    'fighter:eldritchknight:Weapon Bond': { col: 'bonus', text: 'Summon a bonded weapon to your hand (if on the same plane); you can’t be disarmed of it unless incapacitated' },
    'fighter:eldritchknight:War Magic': { col: 'bonus', text: 'After casting a cantrip with your action: make one weapon attack' },
    'fighter:eldritchknight:Eldritch Strike': { text: 'Weapon hit: the target has disadvantage on its next save against a spell you cast before the end of your next turn' },
    'fighter:eldritchknight:Arcane Charge': { text: 'When you use Action Surge: teleport up to 30 ft to an unoccupied space you can see (before or after the action)' },
    'fighter:eldritchknight:Improved War Magic': { col: 'bonus', text: 'After casting any spell with your action: make one weapon attack' },

    // ---- Arcane Archer ----
    'fighter:arcanearcher:Arcane Archer Lore': { dc: false, text: 'You know Prestidigitation or Druidcraft (add the one you chose on the Spells tab)' },
    'fighter:arcanearcher:Arcane Shot': { resource: true, dc: 'int', text: 'Once per turn, on a hit with a magic arrow from a short- or longbow' },
    'fighter:arcanearcher:Magic Arrow': { none: true },
    'fighter:arcanearcher:Curving Shot': { col: 'bonus', text: 'After a magic arrow misses: reroll the attack against a different target within 60 ft of the original' },
    'fighter:arcanearcher:Ever-Ready Shot': { trigger: 'initiative', triggerText: 'If you have no uses of Arcane Shot left, regain one.', triggerLabel: 'Regain a use',
      use: { regain: { from: 'Arcane Shot', n: 1 } }, text: 'Only when you roll initiative with no Arcane Shot uses remaining' },

    // ---- Cavalier ----
    'fighter:cavalier:Bonus Proficiency': { none: true },
    'fighter:cavalier:Born to the Saddle': { passive: { advNote: 'Saves to avoid falling off your mount; land on your feet after falling ≤10 ft; mount/dismount costs 5 ft' } },
    'fighter:cavalier:Unwavering Mark': { col: 'bonus', roll: '{floor(fighter/2)}', rollNote: 'extra damage on the bonus-action attack (made with advantage)',
      text: 'Melee hit marks the target until the end of your next turn (disadvantage on attacks vs others within 5 ft of you). If it deals damage to anyone else: bonus-action melee attack against it' },
    'fighter:cavalier:Warding Maneuver': { col: 'reaction', roll: '1d8', rollNote: 'added to the target’s AC; if it still hits, the target has resistance to that damage' },
    'fighter:cavalier:Hold the Line': { col: 'reaction', text: 'Opportunity attack when a creature moves 5 ft or more within your reach; on a hit its speed becomes 0 for the turn' },
    'fighter:cavalier:Ferocious Charger': { dc: 'str', save: 'STR', text: 'Once per turn, after moving 10+ ft in a straight line, an attack hit forces a STR save or the target is knocked prone (Large or smaller)' },
    'fighter:cavalier:Vigilant Defender': { col: 'reaction', text: 'A special reaction for an opportunity attack once on every creature’s turn except yours' },

    // ---- Samurai ----
    'fighter:samurai:Bonus Proficiency': { none: true },
    'fighter:samurai:Fighting Spirit': { col: 'bonus', use: Object.assign(E('Fighting Spirit', 1, { atkAdv: 'Fighting Spirit' }), { temp: '{tier(fighter,3,5,10,10,15,15)}' }) },
    'fighter:samurai:Elegant Courtier': { passive: { saveProf: ['wis'], advNote: 'Persuasion checks: add your WIS modifier (Elegant Courtier); if already proficient in WIS saves, choose INT or CHA instead' } },
    'fighter:samurai:Tireless Spirit': { trigger: 'initiative', triggerText: 'If you have no uses of Fighting Spirit left, regain one.', triggerLabel: 'Regain a use',
      use: { regain: { from: 'Fighting Spirit', n: 1 } }, text: 'Only when you roll initiative with no Fighting Spirit uses remaining' },
    'fighter:samurai:Rapid Strike': { text: 'Once per turn, on an Attack-action attack with advantage against a creature: forgo the advantage to make one additional weapon attack against it as part of the same action' },
    'fighter:samurai:Strength before Death': { trigger: 'zero', triggerLabel: 'Take an extra turn', triggerText: 'You drop to 0 HP but don’t fall unconscious: take an extra turn right now. Damage during it causes death save failures as normal; three failures kill you. At the end of the turn you fall unconscious if still at 0 HP.',
      use: { resetTurn: true }, text: 'Extra turn now (interrupting the current turn)' },

    // ---- Psi Warrior ----
    'fighter:psiwarrior:Psionic Power': { resource: true, dc: 'int', acts: [
      { name: 'Protective Field', col: 'reaction', cost: true, roll: '1psi+{max(1,int)}', rollNote: 'damage reduced (you or a creature within 30 ft)' },
      { name: 'Psionic Strike', cost: true, roll: '1psi+int', rollNote: 'force damage (once per turn, after a weapon hit vs a creature within 30 ft)' },
      { name: 'Telekinetic Movement', col: 'action', text: 'Free once per short rest: move a Large or smaller object or willing creature (not you) up to 30 ft' },
      { name: 'Telekinetic Movement (spend a die)', col: 'action', cost: true, text: 'Move a Large or smaller object or willing creature (not you) up to 30 ft' },
      { name: 'Recover a die', col: 'bonus', use: { regain: { from: 'Psionic Power', n: 1 } }, text: 'Once per short rest' }] },
    'fighter:psiwarrior:Telekinetic Adept': { dc: 'int', acts: [
      { name: 'Psi-Powered Leap', col: 'bonus', use: E('Psi-Powered Leap', 1, { fly: 'walk', note: 'Flying speed equal to twice your walking speed until the end of the turn' }), text: 'Free once per short rest' },
      { name: 'Psi-Powered Leap (spend a die)', col: 'bonus', cost: PSI, use: E('Psi-Powered Leap', 1, { fly: 'walk', note: 'Flying speed equal to twice your walking speed until the end of the turn' }) },
      { name: 'Telekinetic Thrust', dc: 'int', save: 'STR', text: 'When Psionic Strike deals damage: STR save or knocked prone or moved up to 10 ft horizontally' }] },
    'fighter:psiwarrior:Guarded Mind': { passive: { resist: ['psychic'] }, acts: [
      { name: 'End charm and fear', cost: PSI, use: { removeCond: ['Charmed', 'Frightened'] }, text: 'Start of your turn, while charmed or frightened' }] },
    'fighter:psiwarrior:Bulwark of Force': { col: 'bonus', use: E('Bulwark of Force', 10, { ac: 2, note: 'Half cover (+2 AC and DEX saves); up to INT mod creatures within 30 ft' }),
      text: 'Up to {max(1,int)} creatures within 30 ft (you can include yourself) gain half cover for 1 minute or until you’re incapacitated',
      acts: [{ name: 'Bulwark of Force (spend a die)', col: 'bonus', cost: PSI, use: E('Bulwark of Force', 10, { ac: 2, note: 'Half cover (+2 AC and DEX saves)' }) }] },
    'fighter:psiwarrior:Telekinetic Master': { col: 'action', spells: ['Telekinesis'], spellNote: 'Telekinetic Master: once per long rest without a slot (or spend a psionic energy die); INT', text: 'Cast telekinesis without a slot (INT); spend a psionic energy die to cast it again',
      acts: [{ name: 'Cast again (spend a die)', col: 'action', cost: PSI, text: 'Cast telekinesis without a slot' },
        { name: 'Weapon attack (telekinesis)', col: 'bonus', text: 'While concentrating on telekinesis: one weapon attack' }] },

    // ---- Rune Knight ----
    'fighter:runeknight:Bonus Proficiencies': { none: true },
    'fighter:runeknight:Rune Carver': { dc: 'con', text: 'Each rune you know is listed as its own feature (invoke once per short rest; save DC 8 + prof + CON)' },
    "fighter:runeknight:Giant's Might": { col: 'bonus',
      get use() { const l = lvOf('fighter', 3), d = l >= 18 ? 10 : l >= 10 ? 8 : 6;
        return E("Giant's Might", 10, { dmgDice: `1d${d}`, note: `${l >= 18 ? 'Huge, +5 ft reach' : 'Large'}; advantage on STR checks and saves; +1d${d} damage once per turn on a weapon or unarmed hit` }); } },
    'fighter:runeknight:Runic Shield': { col: 'reaction', text: 'When a creature you can see within 60 ft hits another creature: force it to reroll the d20 and use the new roll' },
    'fighter:runeknight:Great Stature': { roll: '3d4', rollNote: 'inches of height gained', text: "Giant's Might extra damage becomes 1d8" },
    'fighter:runeknight:Master of Runes': { dc: false, text: 'Each rune can be invoked twice per short rest (rune uses updated automatically)' },
    'fighter:runeknight:Runic Juggernaut': { dc: false, text: "Giant's Might: damage 1d10, you can become Huge and your reach increases by 5 ft" },

    // ---- Purple Dragon Knight ----
    'fighter:purpledragon:Rallying Cry': { text: 'When you use Second Wind: up to three allies within 60 ft each regain {fighter} HP' },
    'fighter:purpledragon:Royal Envoy': { passive: { skillProf: ['Persuasion'], skillExp: ['Persuasion'] } },
    'fighter:purpledragon:Inspiring Surge': { text: 'When you use Action Surge: {tier(fighter,10,1,18,2)} ally(ies) within 60 ft can use a reaction to make one weapon attack' },
    'fighter:purpledragon:Bulwark': { text: 'When you use Indomitable on an INT, WIS or CHA save (not incapacitated): one ally within 60 ft that failed the same save can reroll it' },

    // ================= MONK =================
    'monk:Unarmored Defense': { none: true },
    'monk:Martial Arts': { col: 'bonus', text: 'One unarmed strike after you take the Attack action with unarmed strikes or monk weapons' },
    'monk:Ki': { resource: true, dc: 'wis', acts: [
      { name: 'Flurry of Blows', col: 'bonus', cost: true, text: 'Two unarmed strikes immediately after the Attack action' },
      { name: 'Patient Defense', col: 'bonus', cost: true, use: { cond: 'Dodging', condRounds: 1 }, text: 'Take the Dodge action' },
      { name: 'Step of the Wind (Dash)', col: 'bonus', cost: true, dash: true, text: 'Dash; jump distance doubled this turn' },
      { name: 'Step of the Wind (Disengage)', col: 'bonus', cost: true, text: 'Disengage; jump distance doubled this turn' }] },
    'monk:Unarmored Movement': { text: 'Speed bonus without armor or shield (applied automatically); from 9th level you can move along vertical surfaces and across liquids on your turn' },
    'monk:Deflect Missiles': { col: 'reaction', cost: null, dc: false, roll: '1d10+dex+monk', rollNote: 'damage reduced',
      acts: [{ name: 'Throw it back', cost: KI(1), text: 'If reduced to 0 and you caught it: ranged attack (proficient, monk weapon) with it, 20/60 ft' }] },
    'monk:Slow Fall': { col: 'reaction', dc: false, text: 'Reduce falling damage by {5*monk}' },
    'monk:Extra Attack': { none: true },
    'monk:Stunning Strike': { col: 'action', cost: KI(1), dc: 'wis', save: 'CON', text: 'On a melee weapon hit: CON save or stunned until the end of your next turn' },
    'monk:Ki-Empowered Strikes': { none: true },
    'monk:Evasion': { passive: { advNote: 'DEX saves for half: no damage on a success, half on a failure (Evasion)' } },
    'monk:Stillness of Mind': { col: 'action', use: { removeCond: ['Charmed', 'Frightened'] } },
    'monk:Purity of Body': { passive: { immune: ['poison'], condImmune: ['Poisoned', 'Diseased'] } },
    'monk:Tongue of the Sun and Moon': { none: true },
    'monk:Diamond Soul': { passive: { saveProf: 'all' }, acts: [{ name: 'Reroll a failed save', cost: KI(1), text: 'Use the second roll' }] },
    'monk:Timeless Body': { none: true },
    'monk:Empty Body': { col: 'action', cost: KI(4), use: Object.assign(E('Empty Body', 10, { note: 'Invisible; resistance to all damage except force' }), { cond: 'Invisible', condRounds: 10 }),
      passive: { effect: 'Empty Body', resist: ['all damage except force'] },
      acts: [{ name: 'Astral Projection', col: 'action', cost: KI(8), text: 'Cast astral projection on yourself only, without material components' }] },
    'monk:Perfect Self': { trigger: 'initiative', triggerText: 'If you have no ki points left, regain 4.', triggerLabel: 'Regain 4 ki',
      use: { regain: { from: 'Ki', n: 4 } }, text: 'Only when you roll initiative with no ki points remaining' },

    // ---- Open Hand ----
    'monk:openhand:Open Hand Technique': { dc: 'wis', save: 'DEX or STR', text: 'Flurry of Blows hit: DEX save or prone; STR save or pushed up to 15 ft; or no reactions until the end of your next turn' },
    'monk:openhand:Wholeness of Body': { col: 'action', use: { heal: '{3*monk}' } },
    'monk:openhand:Tranquility': { trigger: 'longRest', triggerLabel: 'Sanctuary', triggerText: 'Gain the effect of sanctuary until the start of your next long rest (ends early if you attack or cast a spell).',
      dc: 'wis', save: 'WIS', use: E('Sanctuary (Tranquility)', null, { note: 'Attackers must make a WIS save or choose a new target; ends if you attack or cast a spell' }) },
    'monk:openhand:Quivering Palm': { col: 'action', cost: KI(3), dc: 'wis', save: 'CON', roll: '10d10', rollNote: 'necrotic on a successful save (failure: drop to 0 HP)',
      text: 'Set on an unarmed hit; within {monk} days, use an action to end the vibrations' },

    // ---- Shadow ----
    'monk:shadow:Shadow Arts': { col: 'action', cost: KI(2), dc: 'wis', spells: ['Darkness', 'Darkvision', 'Pass without Trace', 'Silence', 'Minor Illusion'],
      spellNote: '2 ki each, no material components (Minor Illusion is free)', text: 'Cast darkness, darkvision, pass without trace or silence' },
    'monk:shadow:Shadow Step': { col: 'bonus', use: E('Shadow Step', 1, { atkAdv: 'first melee attack this turn (Shadow Step)' }), text: 'Teleport up to 60 ft from dim light or darkness to dim light or darkness' },
    'monk:shadow:Cloak of Shadows': { col: 'action', use: { cond: 'Invisible' }, text: 'In dim light or darkness: invisible until you attack, cast a spell, or are in bright light' },
    'monk:shadow:Opportunist': { col: 'reaction', text: 'Melee attack against a creature within 5 ft that was just hit by someone else' },

    // ---- Four Elements ----
    'monk:fourelements:Disciple of the Elements': { dc: 'wis',
      text: 'Max ki per discipline (base cost + extra): {tier(monk,3,2,5,3,9,4,13,5,17,6)}. Use only the disciplines you know (1 at 3rd, +1 at 6th, 11th, 17th)',
      acts: [
        { name: 'Elemental Attunement', col: 'action', text: 'Minor elemental effect (sensory effect, light/snuff a flame, chill/warm 1 lb, shape element in a 1-ft cube)' },
        { name: 'Fangs of the Fire Snake', cost: KI(1), roll: '1d10', rollNote: 'extra fire damage if you spend 1 more ki on a hit', text: 'Attack action: unarmed strikes get +10 ft reach and deal fire damage this turn' },
        { name: 'Fist of Four Thunders', col: 'action', cost: KI(2), dc: 'wis', save: 'CON', roll: '2d8', rollNote: 'thunder, 15-ft cube (thunderwave; +1d8 per extra ki)' },
        { name: 'Fist of Unbroken Air', col: 'action', cost: KI(2), dc: 'wis', save: 'STR', roll: '3d10', rollNote: 'bludgeoning, one creature within 30 ft (+1d10 per extra ki); fail: pushed 20 ft and prone; half on a success' },
        { name: 'Rush of the Gale Spirits', col: 'action', cost: KI(2), dc: 'wis', save: 'STR', text: 'Cast gust of wind' },
        { name: 'Shape the Flowing River', col: 'action', cost: KI(1), text: 'Shape water or ice in a 30-ft cube within 120 ft' },
        { name: 'Sweeping Cinder Strike', col: 'action', cost: KI(2), dc: 'wis', save: 'DEX', roll: '3d6', rollNote: 'fire, 15-ft cone (burning hands; +1d6 per extra ki)' },
        { name: 'Water Whip', col: 'action', cost: KI(2), dc: 'wis', save: 'DEX', roll: '3d10', rollNote: 'bludgeoning, one creature within 30 ft (+1d10 per extra ki); fail: prone or pulled 25 ft; half on a success' },
        { name: 'Clench of the North Wind', col: 'action', min: 6, cost: KI(3), dc: 'wis', save: 'WIS', text: 'Cast hold person' },
        { name: 'Gong of the Summit', col: 'action', min: 6, cost: KI(3), dc: 'wis', save: 'CON', roll: '3d8', rollNote: 'thunder, 10-ft radius (shatter; +1d8 per extra ki)' },
        { name: 'Eternal Mountain Defense', col: 'action', min: 11, cost: KI(5), use: E('Stoneskin', 600, { note: 'Resistance to nonmagical bludgeoning, piercing and slashing' }, { conc: true }), text: 'Cast stoneskin on yourself' },
        { name: 'Flames of the Phoenix', col: 'action', min: 11, cost: KI(4), dc: 'wis', save: 'DEX', roll: '8d6', rollNote: 'fire, 20-ft radius (fireball; +1d6 per extra ki)' },
        { name: 'Mist Stance', col: 'action', min: 11, cost: KI(4), text: 'Cast gaseous form on yourself' },
        { name: 'Ride the Wind', col: 'action', min: 17, cost: KI(4), use: E('Fly (Ride the Wind)', 100, { fly: 60 }, { conc: true }), text: 'Cast fly on yourself' },
        { name: 'Breath of Winter', col: 'action', min: 17, cost: KI(6), dc: 'wis', save: 'CON', roll: '8d8', rollNote: 'cold, 60-ft cone (cone of cold)' },
        { name: 'River of Hungry Flame', col: 'action', min: 17, cost: KI(5), dc: 'wis', save: 'DEX', roll: '5d8', rollNote: 'fire (wall of fire)' },
        { name: 'Wave of Rolling Earth', col: 'action', min: 17, cost: KI(6), dc: 'wis', save: 'DEX', text: 'Cast wall of stone' }] },

    // ---- Drunken Master ----
    'monk:drunkenmaster:Bonus Proficiencies': { passive: { skillProf: ['Performance'] } },
    'monk:drunkenmaster:Drunken Technique': { dc: false, acts: [
      { name: 'Flurry of Blows (drunken)', col: 'bonus', cost: KI(1), use: E('Drunken Technique', 1, { speed: 10, note: 'Disengage; +10 ft walking speed this turn' }), text: 'Two unarmed strikes after the Attack action; you also gain Disengage and +10 ft speed' }] },
    'monk:drunkenmaster:Tipsy Sway': { col: 'reaction', cost: KI(1), text: 'Redirect Attack: when a creature misses you in melee, it hits a creature of your choice within 5 ft of you instead. Standing up from prone costs only 5 ft' },
    "monk:drunkenmaster:Drunkard's Luck": { cost: KI(2), dc: false, text: 'Cancel disadvantage on an ability check, attack roll or saving throw before you roll' },
    'monk:drunkenmaster:Intoxicated Frenzy': { text: 'Flurry of Blows: up to three additional attacks (five total), each against a different creature' },

    // ---- Kensei ----
    'monk:kensei:Path of the Kensei': { acts: [
      { name: 'Agile Parry', use: E('Agile Parry', 1, { ac: 2, note: 'Holding a kensei melee weapon after an unarmed strike in the Attack action' }), text: '+2 AC until the start of your next turn' },
      { name: "Kensei's Shot", col: 'bonus', use: E("Kensei's Shot", 1, { dmgDice: '1d4', note: 'Ranged attacks with a kensei weapon this turn' }) }] },
    'monk:kensei:One with the Blade': { cost: KI(1), roll: '1ma', rollNote: 'extra damage (Deft Strike, once per turn, kensei weapon hit)', text: 'Your kensei weapons count as magical' },
    'monk:kensei:Sharpen the Blade': { col: 'bonus', text: 'Spend 1–3 ki: kensei weapon bonus to attack and damage rolls for 1 minute (not on a weapon that already has a bonus)', acts: [1, 2, 3].map(n => (
      { name: `+${n} (${n} ki)`, col: 'bonus', cost: KI(n), use: E('Sharpen the Blade', 10, { atk: n, dmg: n, note: `+${n} with your kensei weapon only` }) })) },
    'monk:kensei:Unerring Accuracy': { text: 'Once on each of your turns: reroll a missed attack with a monk weapon' },

    // ---- Long Death ----
    'monk:longdeath:Touch of Death': { use: { temp: '{max(1,wis+monk)}' }, text: 'When you reduce a creature within 5 ft to 0 HP' },
    'monk:longdeath:Hour of Reaping': { col: 'action', dc: 'wis', save: 'WIS', text: 'Each creature within 30 ft that can see you: frightened until the end of your next turn' },
    'monk:longdeath:Mastery of Death': { cost: KI(1), trigger: 'zero', triggerLabel: 'Spend 1 ki: 1 HP', triggerText: 'Reduced to 0 HP (not killed outright): spend 1 ki to drop to 1 HP instead.', use: { setHp: 1 } },
    'monk:longdeath:Touch of the Long Death': { col: 'action', dc: 'wis', save: 'CON', text: 'Touch a creature within 5 ft: 2d10 necrotic per ki spent (1–10), half on a success',
      acts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ name: `${n} ki`, cost: KI(n), roll: `${2 * n}d10`, rollNote: 'necrotic (half on a successful CON save)', dc: 'wis', save: 'CON' })) },

    // ---- Sun Soul ----
    'monk:sunsoul:Radiant Sun Bolt': { col: 'action', roll: '1ma+dex', rollNote: 'radiant (ranged spell attack, 30 ft, proficient, DEX)',
      acts: [{ name: 'Two bolts (1 ki)', col: 'bonus', cost: KI(1), roll: '1ma+dex', rollNote: 'radiant per bolt', text: 'After the Attack action: two Radiant Sun Bolt attacks' }] },
    'monk:sunsoul:Searing Arc Strike': { col: 'bonus', cost: KI(2), dc: 'wis', save: 'DEX', roll: '3d6', rollNote: 'fire, 15-ft cone (burning hands; +1d6 per extra ki, max {floor(monk/2)} ki total)', text: 'After the Attack action' },
    'monk:sunsoul:Searing Sunburst': { col: 'action', dc: 'wis', save: 'CON', roll: '2d6', rollNote: 'radiant, 20-ft radius within 150 ft (no damage on a success)',
      acts: [1, 2, 3].map(n => ({ name: `Sunburst +${n} ki`, col: 'action', cost: KI(n), roll: `${2 + 2 * n}d6`, rollNote: 'radiant (no damage on a success)', dc: 'wis', save: 'CON' })) },
    'monk:sunsoul:Sun Shield': { col: 'reaction', roll: '5+wis', rollNote: 'radiant damage to the creature that hit you in melee (within 5 ft)',
      acts: [{ name: 'Toggle light', col: 'bonus', text: 'Shed bright light 30 ft, dim 30 ft more (or extinguish it)' }] },

    // ---- Mercy ----
    'monk:mercy:Implements of Mercy': { passive: { skillProf: ['Insight', 'Medicine'] } },
    'monk:mercy:Hand of Healing': { col: 'action', cost: KI(1), roll: '1ma+wis', rollNote: 'healing', healRoll: true, text: 'Touch a creature; you can replace one Flurry of Blows strike with this' },
    'monk:mercy:Hand of Harm': { cost: KI(1), roll: '1ma+wis', rollNote: 'necrotic (once per turn, on an unarmed hit)' },
    "monk:mercy:Physician's Touch": { text: 'Hand of Healing also ends one disease or one condition: blinded, deafened, paralyzed, poisoned or stunned. Hand of Harm also poisons the target until the end of your next turn' },
    'monk:mercy:Flurry of Healing and Harm': { acts: [
      { name: 'Hand of Healing (Flurry, no ki)', col: 'bonus', roll: '1ma+wis', rollNote: 'healing', healRoll: true, text: 'Replaces a Flurry of Blows strike' },
      { name: 'Hand of Harm (Flurry, no ki)', roll: '1ma+wis', rollNote: 'necrotic', text: 'Once per turn during Flurry of Blows' }] },
    'monk:mercy:Hand of Ultimate Mercy': { col: 'action', cost: KI(5), roll: '4d10+wis', rollNote: 'HP the creature returns to life with', text: 'Touch a creature that died within 24 hours; it is cured of blinded, deafened, paralyzed, poisoned and stunned' },

    // ---- Astral Self ----
    'monk:astralself:Arms of the Astral Self': { col: 'bonus', cost: KI(1), dc: 'wis', save: 'DEX', roll: '2ma', rollNote: 'force to each creature of your choice within 10 ft (DEX save negates)',
      use: E('Arms of the Astral Self', 100, { note: 'Use WIS for STR checks/saves and arm attacks; +5 ft reach; force damage with martial arts die' }) },
    'monk:astralself:Visage of the Astral Self': { col: 'bonus', cost: KI(1), use: E('Visage of the Astral Self', 100, { note: 'Darkvision 120 ft (sees magical darkness); advantage on Insight and Intimidation; voice up to 600 ft or to one creature' }),
      passive: { effect: 'Visage of the Astral Self', sense: 'Darkvision 120 ft (magical darkness too)', skillAdv: ['Insight', 'Intimidation'] } },
    'monk:astralself:Body of the Astral Self': { acts: [
      { name: 'Deflect Energy', col: 'reaction', roll: '1d10+wis', rollNote: 'acid, cold, fire, force, lightning or thunder damage reduced', onlyWhen: { effect: 'Arms of the Astral Self' } },
      { name: 'Empowered Arms', roll: '1ma', rollNote: 'extra damage (once per turn, arm hit)', onlyWhen: { effect: 'Arms of the Astral Self' } }],
      text: 'Needs both arms and visage summoned' },
    'monk:astralself:Awakened Astral Self': { col: 'bonus', cost: KI(5), use: E('Awakened Astral Self', 100, { ac: 2, note: 'Arms and visage summoned; Extra Attack makes three arm attacks (Astral Barrage)' }) },

    // ---- Ascendant Dragon ----
    'monk:ascendantdragon:Draconic Disciple': { col: 'reaction', max: '1', reset: 'long', text: 'Reroll a failed CHA (Intimidation or Persuasion) check; once it turns a failure into a success, not again until a long rest. Unarmed strikes can deal acid, cold, fire, lightning or poison damage' },
    'monk:ascendantdragon:Breath of the Dragon': { col: 'action', dc: 'wis', save: 'DEX', roll: '2ma', rollNote: 'acid, cold, fire, lightning or poison; 20-ft cone or 30-ft line (half on a success)', text: 'Replaces one attack of the Attack action',
      acts: [{ name: 'Breathe again (2 ki)', col: 'action', cost: KI(2), dc: 'wis', save: 'DEX', roll: '2ma', rollNote: 'elemental (half on a success)', text: 'When you have no uses left' }] },
    'monk:ascendantdragon:Wings Unfurled': { col: 'bonus', use: E('Wings Unfurled', 1, { fly: 'walk', note: 'Flying speed equal to walking speed until the end of the turn' }), text: 'When you use Step of the Wind' },
    'monk:ascendantdragon:Aspect of the Wyrm': { col: 'bonus', dc: 'wis', save: 'WIS', use: E('Aspect of the Wyrm', 10, { note: '10-ft aura: Frightful Presence (WIS save or frightened 1 min) or resistance to one draconic type for you and allies' }),
      acts: [{ name: 'Again (3 ki)', col: 'bonus', cost: KI(3), use: E('Aspect of the Wyrm', 10, { note: '10-ft aura: Frightful Presence or resistance to one draconic type' }) }] },
    'monk:ascendantdragon:Ascendant Aspect': { passive: { sense: 'Blindsight 10 ft' }, acts: [
      { name: 'Augment Breath', cost: KI(1), dc: 'wis', save: 'DEX', roll: '3ma', rollNote: 'elemental, 60-ft cone or 90-ft line (half on a success)', text: 'When you use Breath of the Dragon' },
      { name: 'Explosive Fury', dc: 'wis', save: 'DEX', roll: '3d10', rollNote: 'acid, cold, fire, lightning or poison to creatures of your choice in the aura', text: 'When you activate Aspect of the Wyrm' }] }
  });

  // ---- Arcane Shot options (Arcane Archer): damage scales at 18th level ----
  const AS = (n18lo, n18hi) => `{tier(fighter,1,${n18lo},18,${n18hi})}d6`;
  const ASC = { from: 'Arcane Shot', n: 1 };
  setOpt('arcaneShot', 'Banishing Arrow', { col: 'action', cost: ASC, dc: 'int', save: 'CHA', text: 'Fail: banished to the Feywild until the end of its next turn (incapacitated). At 18th level: +2d6 force damage' });
  setOpt('arcaneShot', 'Beguiling Arrow', { col: 'action', cost: ASC, dc: 'int', save: 'WIS', roll: AS(2, 4), rollNote: 'psychic', text: 'Fail: charmed by one ally of yours within 30 ft of it until the start of your next turn' });
  setOpt('arcaneShot', 'Bursting Arrow', { col: 'action', cost: ASC, dc: false, roll: AS(2, 4), rollNote: 'force to each creature within 10 ft of the target' });
  setOpt('arcaneShot', 'Enfeebling Arrow', { col: 'action', cost: ASC, dc: 'int', save: 'CON', roll: AS(2, 4), rollNote: 'necrotic on a failed save', text: 'Fail: it deals half damage with weapon attacks until the start of your next turn' });
  setOpt('arcaneShot', 'Grasping Arrow', { col: 'action', cost: ASC, dc: 'int', roll: AS(2, 4), rollNote: 'poison', text: 'Speed −10 ft for 1 minute; it takes the same dice in slashing when it moves without teleporting. Athletics vs your DC to remove the brambles' });
  setOpt('arcaneShot', 'Piercing Arrow', { col: 'action', cost: ASC, dc: 'int', save: 'DEX', roll: `{tier(fighter,1,1,18,2)}d6`, rollNote: 'extra piercing to each creature in the 30-ft line, plus the arrow’s damage (half on a success)' });
  setOpt('arcaneShot', 'Seeking Arrow', { col: 'action', cost: ASC, dc: 'int', save: 'DEX', roll: `{tier(fighter,1,1,18,2)}d6`, rollNote: 'force, plus the arrow’s damage (half on a success); ignores cover' });
  setOpt('arcaneShot', 'Shadow Arrow', { col: 'action', cost: ASC, dc: 'int', save: 'WIS', roll: AS(2, 4), rollNote: 'psychic', text: 'Fail: it can’t see beyond 5 ft until the start of your next turn' });

  // ---- Runes (Rune Knight): each invoked once per short rest, twice from 15th (Master of Runes); DC 8 + prof + CON ----
  const RU = { max: 'tier(fighter,1,1,15,2)', reset: 'short' };
  setOpt('rune', 'Cloud Rune', Object.assign({}, RU, { col: 'reaction', passive: { skillAdv: ['Sleight of Hand', 'Deception'] },
    text: 'When a creature you can see within 30 ft is hit by an attack: choose a different creature within 30 ft of you (not the attacker) to be the target instead' }));
  setOpt('rune', 'Fire Rune', Object.assign({}, RU, { col: 'action', dc: 'con', save: 'STR', roll: '2d6', rollNote: 'extra fire damage on the hit',
    passive: { advNote: 'Proficiency bonus doubled for tool checks (Fire Rune)' }, text: 'Fail: restrained for 1 minute, taking 2d6 fire at the start of each of its turns (repeat the save at the end of each turn)' }));
  setOpt('rune', 'Frost Rune', Object.assign({}, RU, { col: 'bonus', passive: { skillAdv: ['Animal Handling', 'Intimidation'] },
    use: E('Frost Rune', 100, { note: '+2 to STR and CON ability checks and saving throws' }) }));
  setOpt('rune', 'Stone Rune', Object.assign({}, RU, { col: 'reaction', dc: 'con', save: 'WIS', passive: { skillAdv: ['Insight'], sense: 'Darkvision 120 ft' },
    text: 'When a creature you can see ends its turn within 30 ft: charmed for 1 minute (incapacitated, speed 0); repeats the save at the end of each turn' }));
  setOpt('rune', 'Hill Rune', Object.assign({}, RU, { col: 'bonus', passive: [{ resist: ['poison'], advNote: 'Saves against being poisoned (Hill Rune)' }, { effect: 'Hill Rune', resist: BPS }],
    use: E('Hill Rune', 10, { note: 'Resistance to bludgeoning, piercing and slashing damage' }) }));
  setOpt('rune', 'Storm Rune', Object.assign({}, RU, { col: 'bonus', passive: { skillAdv: ['Arcana'], advNote: 'Can’t be surprised while not incapacitated (Storm Rune)' },
    use: E('Storm Rune', 10, { note: 'Reaction: give advantage or disadvantage to an attack, check or save by a creature within 60 ft' }) }));
})();

// Feature automation: Paladin, Ranger (PHB) and Ranger (Tasha's) with all their non-UA subclasses.
// Ranger subclass features use '<subKey>:<Name>' so they apply to both 'ranger' and 'rangertce'.
// Formula word 'ranger' already counts Tasha's ranger levels (keyIs alias), so never add rangertce to it.
(function () {
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const CD = { from: 'Channel Divinity', n: 1 };
  const NONE = { none: true };
  const T = {};
  const P = (sub, name, fx) => { T['paladin:' + sub + ':' + name] = fx; };
  const RS = (sub, name, fx) => { T[sub + ':' + name] = fx; };
  const RB = (name, fx) => { T['ranger:' + name] = fx; T['rangertce:' + name] = fx; };

  // ================= PALADIN =================
  Object.assign(T, {
    'paladin:Divine Sense': { col: 'action', use: R('Divine Sense', 1, { note: 'Until the end of your next turn: know the location and type of any celestial, fiend or undead within 60 ft not behind total cover; sense consecrated or desecrated places' }) },
    'paladin:Lay on Hands': {
      col: 'action', pool: true,
      text: 'Touch a creature and restore any number of HP from the pool (no effect on undead or constructs); 5 points cures one disease or neutralizes one poison',
      acts: [
        { name: 'Heal self 5', col: 'action', cost: { from: 'Lay on Hands', n: 5 }, use: { heal: '5' } },
        { name: 'Heal self 10', col: 'action', cost: { from: 'Lay on Hands', n: 10 }, use: { heal: '10' } },
        { name: 'Cure disease / poison', col: 'action', cost: { from: 'Lay on Hands', n: 5 }, text: 'Cure one disease or neutralize one poison affecting the creature (5 points each). To heal someone else, lower the pool by the amount.' }
      ]
    },
    'paladin:Fighting Style': NONE, // the chosen style carries its own fx
    'paladin:Spellcasting': NONE, // class spellcasting table
    'paladin:Divine Smite': NONE, // built-in smite buttons on weapon hits
    'paladin:Divine Health': { passive: { condImmune: ['Diseased'] } },
    'paladin:Channel Divinity': { resource: true },
    'paladin:Extra Attack': NONE, // extraAttack in class data
    'paladin:Aura of Protection': NONE, // built in: +CHA (min +1) to your saves while conscious; allies within 10 ft (30 ft at 18th) too
    'paladin:Aura of Courage': { passive: { condImmune: ['Frightened'] } },
    'paladin:Improved Divine Smite': { passive: { everyHit: '1d8 radiant (melee)' } },
    'paladin:Cleansing Touch': { col: 'action', text: 'Touch yourself or a willing creature: end one spell on it' }
  });

  // ---- Oath of Devotion ----
  P('devotion', 'Channel Divinity: Sacred Weapon', { col: 'action', cost: CD, use: R('Sacred Weapon', 10, { atk: 'max(1,cha)', note: 'Weapon is magical; +CHA to its attack rolls; bright light 20 ft, dim 20 ft more' }) });
  P('devotion', 'Channel Divinity: Turn the Unholy', { col: 'action', cost: CD, dc: 'spell', save: 'WIS', text: 'Each fiend or undead within 30 ft that can see or hear you is turned for 1 minute or until it takes damage' });
  P('devotion', 'Aura of Devotion', { passive: { condImmune: ['Charmed'] } });
  P('devotion', 'Purity of Spirit', { passive: { advNote: 'Protection from evil and good: aberrations, celestials, elementals, fey, fiends and undead have disadvantage attacking you and can\'t charm, frighten or possess you' } });
  P('devotion', 'Holy Nimbus', { col: 'action', use: R('Holy Nimbus', 10, { note: 'Bright light 30 ft: an enemy starting its turn in it takes 10 radiant; advantage on saves vs spells cast by fiends or undead' }), passive: { effect: 'Holy Nimbus', advNote: 'Saves against spells cast by fiends or undead (Holy Nimbus)' }, text: 'Enemies that start their turn in the bright light take 10 radiant damage' });

  // ---- Oath of the Ancients ----
  P('ancients', "Channel Divinity: Nature's Wrath", { col: 'action', cost: CD, dc: 'spell', save: 'STR or DEX', text: 'One creature within 10 ft is restrained by spectral vines (it repeats the save at the end of each of its turns)' });
  P('ancients', 'Channel Divinity: Turn the Faithless', { col: 'action', cost: CD, dc: 'spell', save: 'WIS', text: 'Each fey or fiend within 30 ft that can hear you is turned for 1 minute or until it takes damage; illusory true forms are revealed' });
  P('ancients', 'Aura of Warding', { passive: { resist: ['damage from spells'] } });
  P('ancients', 'Undying Sentinel', { trigger: 'zero', triggerLabel: 'Drop to 1 HP instead', triggerText: 'Undying Sentinel: when reduced to 0 HP and not killed outright, drop to 1 HP instead (once per long rest).', use: { setHp: 1, removeCond: ['Unconscious'] }, text: 'You also suffer none of the drawbacks of old age and can\'t be aged magically' });
  P('ancients', 'Elder Champion', {
    col: 'action',
    use: R('Elder Champion', 10, { note: 'Regain 10 HP at the start of each turn; paladin spells with a 1-action casting time can be cast as a bonus action; enemies within 10 ft have disadvantage on saves vs your paladin spells and Channel Divinity' }),
    acts: [{ name: 'Regain 10 HP (start of turn)', onlyWhen: { effect: 'Elder Champion' }, use: { heal: '10' } }]
  });

  // ---- Oath of Vengeance ----
  P('vengeance', 'Channel Divinity: Abjure Enemy', { col: 'action', cost: CD, dc: 'spell', save: 'WIS', text: 'One creature within 60 ft: on a failure frightened for 1 minute (speed 0) or until it takes damage; on a success its speed is halved for 1 minute. Fiends and undead save with disadvantage.' });
  P('vengeance', 'Channel Divinity: Vow of Enmity', { col: 'bonus', cost: CD, use: R('Vow of Enmity', 10, { atkAdv: 'Vow of Enmity (that creature only)', note: 'Advantage on attacks against one creature within 10 ft for 1 minute' }) });
  P('vengeance', 'Relentless Avenger', { text: 'When you hit with an opportunity attack, move up to {floor(walkspeed/2)} ft (half your speed) right away as part of that reaction; it doesn\'t provoke opportunity attacks' });
  T['paladin:vengeance:Relentless Avenger'].text = 'When you hit with an opportunity attack, move up to half your speed right away as part of that reaction; this movement doesn\'t provoke opportunity attacks';
  P('vengeance', 'Soul of Vengeance', { col: 'reaction', onlyWhen: { effect: 'Vow of Enmity' }, text: 'When the creature under your Vow of Enmity makes an attack, make one melee weapon attack against it if it is within range' });
  P('vengeance', 'Avenging Angel', { col: 'action', dc: 'spell', save: 'WIS', use: R('Avenging Angel', 600, { fly: 60, note: 'Wings (fly 60 ft). Aura of menace 30 ft: an enemy entering or starting its turn there saves or is frightened for 1 minute or until it takes damage; attacks against those frightened creatures have advantage' }) });

  // ---- Oath of Conquest ----
  P('conquest', 'Channel Divinity: Conquering Presence', { col: 'action', cost: CD, dc: 'spell', save: 'WIS', text: 'Each creature of your choice within 30 ft is frightened for 1 minute (it repeats the save at the end of each of its turns)' });
  P('conquest', 'Channel Divinity: Guided Strike', { cost: CD, text: '+10 to one attack roll you make (decide after seeing the d20, before knowing if it hits)' });
  P('conquest', 'Aura of Conquest', { roll: '{floor(paladin/2)}', rollNote: 'psychic', text: 'A creature frightened of you has speed 0 within 10 ft of you (30 ft at 18th) and takes {floor(paladin/2)} psychic damage when it starts its turn there' });
  P('conquest', 'Scornful Rebuke', { roll: '{max(1,cha)}', rollNote: 'psychic to a creature that hits you with an attack', text: 'A creature that hits you with an attack takes {max(1,cha)} psychic damage (unless you are incapacitated)' });
  P('conquest', 'Invincible Conqueror', { col: 'action', use: R('Invincible Conqueror', 10, { note: 'Resistance to all damage; one extra attack when you take the Attack action; melee weapon attacks score a critical hit on 19–20' }), passive: { effect: 'Invincible Conqueror', resist: ['all damage'] } });

  // ---- Oath of Redemption ----
  P('redemption', 'Channel Divinity: Emissary of Peace', { col: 'bonus', cost: CD, use: R('Emissary of Peace', 100, { note: '+5 to Charisma (Persuasion) checks' }) });
  P('redemption', 'Channel Divinity: Rebuke the Violent', { col: 'reaction', cost: CD, dc: 'spell', save: 'WIS', text: 'Right after an attacker within 30 ft damages a creature other than you: it takes radiant damage equal to the damage it dealt (half on a success)' });
  P('redemption', 'Aura of the Guardian', { col: 'reaction', text: 'When a creature within 10 ft of you (30 ft at 18th) takes damage, you take that damage instead; it can\'t be reduced or transferred' });
  P('redemption', 'Protective Spirit', { roll: '1d6+{floor(paladin/2)}', rollNote: 'healing (end of your turn)', healRoll: true, onlyWhen: { hpBelowHalf: true }, text: 'At the end of each of your turns while below half HP and not incapacitated' });
  P('redemption', 'Emissary of Redemption', { passive: { resist: ['all damage dealt by other creatures (Emissary of Redemption; lost against a creature you attack or harm until your next long rest)'] }, text: 'A creature that hits you with an attack takes radiant damage equal to half the damage you take from it' });

  // ---- Oath of Glory ----
  P('glory', 'Channel Divinity: Peerless Athlete', { col: 'bonus', cost: CD, use: R('Peerless Athlete', 100, { note: 'Advantage on Athletics and Acrobatics; carry, push, drag and lift doubled; long and high jumps +10 ft' }), passive: { effect: 'Peerless Athlete', skillAdv: ['Athletics', 'Acrobatics'], carry: 2 } });
  P('glory', 'Channel Divinity: Inspiring Smite', { col: 'bonus', cost: CD, roll: '2d8+paladin', rollNote: 'temp HP to share among creatures within 30 ft (you included)', text: 'Immediately after you deal damage with Divine Smite' });
  P('glory', 'Aura of Alacrity', { passive: { speed: 10 }, text: 'Allies starting their turn within 5 ft of you (10 ft at 18th) gain +10 ft walking speed until the end of that turn' });
  P('glory', 'Glorious Defense', { col: 'reaction', text: 'When you or a creature within 10 ft is hit by an attack: +{max(1,cha)} AC against it; if it then misses, make one weapon attack against the attacker as part of this reaction' });
  P('glory', 'Living Legend', { col: 'bonus', use: R('Living Legend', 10, { note: 'Advantage on CHA checks; once on each of your turns a missed weapon attack can hit instead; reaction: reroll a failed save' }), passive: { effect: 'Living Legend', checkAdv: ['cha'] }, text: 'You can also regain this by expending a 5th-level spell slot' });

  // ---- Oath of the Watchers ----
  P('watchers', "Channel Divinity: Watcher's Will", { col: 'action', cost: CD, use: R("Watcher's Will", 10, { note: 'You and up to {max(1,cha)} creatures within 30 ft have advantage on INT, WIS and CHA saves' }), passive: { effect: "Watcher's Will", saveAdv: ['int', 'wis', 'cha'] }, text: 'Choose up to {max(1,cha)} creatures within 30 ft (you can include yourself)' });
  P('watchers', 'Channel Divinity: Abjure the Extraplanar', { col: 'action', cost: CD, dc: 'spell', save: 'WIS', text: 'Each aberration, celestial, elemental, fey or fiend within 30 ft that can hear you is turned for 1 minute or until it takes damage' });
  P('watchers', 'Aura of the Sentinel', { passive: { init: 'prof' }, text: 'You and creatures of your choice within 10 ft (30 ft at 18th) add +{prof} to initiative' });
  P('watchers', 'Vigilant Rebuke', { col: 'reaction', roll: '2d8+cha', rollNote: 'force', text: 'When you or a creature you can see within 30 ft succeeds on an INT, WIS or CHA save: damage the creature that forced the save' });
  P('watchers', 'Mortal Bulwark', { col: 'bonus', dc: 'spell', save: 'CHA', use: R('Mortal Bulwark', 10, { note: 'Truesight 120 ft; advantage on attacks against aberrations, celestials, elementals, fey and fiends; a hit can banish one (CHA save)' }), passive: { effect: 'Mortal Bulwark', sense: 'Truesight 120 ft' }, text: 'You can also regain this by expending a 5th-level spell slot' });

  // ---- Oath of the Crown ----
  P('crown', 'Channel Divinity: Champion Challenge', { col: 'bonus', cost: CD, dc: 'spell', save: 'WIS', text: 'Each creature of your choice within 30 ft can\'t willingly move more than 30 ft away from you' });
  P('crown', 'Channel Divinity: Turn the Tide', { col: 'bonus', cost: CD, roll: '1d6+{max(1,cha)}', rollNote: 'healing for each creature within 30 ft at half HP or less', healRoll: true });
  P('crown', 'Divine Allegiance', { col: 'reaction', text: 'When a creature within 5 ft of you takes damage, take that damage instead; it can\'t be reduced or prevented' });
  P('crown', 'Unyielding Spirit', { passive: { advNote: 'Saves against being paralyzed or stunned' } });
  P('crown', 'Exalted Champion', { col: 'action', use: R('Exalted Champion', 600, { note: 'Resistance to nonmagical bludgeoning, piercing and slashing; allies within 30 ft have advantage on death saves; you and allies within 30 ft have advantage on WIS saves' }), passive: { effect: 'Exalted Champion', resist: ['nonmagical bludgeoning, piercing and slashing'], saveAdv: ['wis'] } });

  // ================= RANGER (both versions) =================
  RB('Fighting Style', NONE);
  RB('Spellcasting', NONE);
  RB('Extra Attack', NONE);
  RB("Land's Stride", { passive: { advNote: 'Saves against magically created or manipulated plants that impede movement' } });
  RB('Vanish', { col: 'bonus', text: 'Take the Hide action; you can\'t be tracked by nonmagical means unless you choose to leave a trail' });
  RB('Feral Senses', { passive: { sense: 'Aware of invisible creatures within 30 ft (not hidden, you not blinded or deafened)' }, text: 'Attacking a creature you can\'t see doesn\'t impose disadvantage' });

  // ---- PHB ranger ----
  Object.assign(T, {
    'ranger:Favored Enemy': { passive: { advNote: 'Survival checks to track favored enemies; INT checks to recall information about them' } },
    'ranger:Natural Explorer': { text: 'In favored terrain: double proficiency on INT and WIS checks about it with a proficient skill; while traveling 1+ hour, difficult terrain doesn\'t slow your group, you can\'t get lost except by magic, stay alert while foraging or navigating, move stealthily at a normal pace alone, find twice as much food, and learn exact numbers, sizes and timing of creatures you track' },
    'ranger:Primeval Awareness': { col: 'action', text: 'Expend a ranger spell slot: for 1 minute per slot level, sense whether aberrations, celestials, dragons, elementals, fey, fiends or undead are within 1 mile (6 miles in favored terrain)' },
    'ranger:Hide in Plain Sight': { use: R('Hide in Plain Sight', null, { note: '+10 to Stealth checks while you stay still against a solid surface; ends when you move or take an action or reaction' }), text: 'Spend 1 minute making camouflage first' },
    'ranger:Foe Slayer': { text: 'Once on each of your turns, add +{wis} to an attack or damage roll against one of your favored enemies' }
  });

  // ---- Tasha's ranger ----
  Object.assign(T, {
    'rangertce:Favored Foe': { roll: '1d{tier(ranger,1,4,6,6,14,8)}', rollNote: 'extra damage (first hit each turn on the marked foe)', use: R('Favored Foe', 10, { note: 'Concentration: the marked creature takes +1d{tier(ranger,1,4,6,6,14,8)} the first time you hit it each turn' }), text: 'Use when you hit a creature; requires concentration (up to 1 minute)' },
    'rangertce:Deft Explorer: Canny': NONE, // expertise and languages are class choices
    'rangertce:Spellcasting Focus': NONE,
    'rangertce:Primal Awareness': { spellsAt: { 3: ['Speak with Animals'], 5: ['Beast Sense'], 9: ['Speak with Plants'], 13: ['Locate Creature'], 17: ['Commune with Nature'] }, once: true, spellNote: 'Always prepared; once per long rest without a slot' },
    'rangertce:Martial Versatility': NONE,
    'rangertce:Deft Explorer: Roving': { passive: { speed: 5, climb: 'walk', swim: 'walk' } },
    'rangertce:Deft Explorer: Tireless': { col: 'action', use: { temp: '1d8+wis' }, acts: [{ name: 'Short rest: −1 exhaustion', use: { exhaustion: -1 } }] },
    "rangertce:Nature's Veil": { col: 'bonus', use: { cond: 'Invisible', condRounds: 1 }, text: 'Invisible until the start of your next turn' },
    'rangertce:Foe Slayer': { text: 'Once on each of your turns, add +{wis} to an attack or damage roll against your Favored Foe target (or a favored enemy)' }
  });
  // Tasha's Favored Foe has a duration: show the extra damage as text in the effect chip
  T['rangertce:Favored Foe'].use.effect.buff.note = 'Concentration: the marked creature takes extra damage the first time you hit it each turn';

  // ---- Hunter (options carry the automation) ----
  RS('hunter', "Hunter's Prey", NONE);
  RS('hunter', 'Defensive Tactics', NONE);
  RS('hunter', 'Multiattack', NONE);
  RS('hunter', "Superior Hunter's Defense", NONE);

  // ---- Beast Master ----
  RS('beastmaster', "Ranger's Companion", {
    text: 'Your beast adds your proficiency bonus to AC, attacks, damage, saves and skills (Primal Companion: stats on the Companions tab)',
    acts: [
      { name: 'Command beast', col: 'bonus', text: 'Primal Companion: bonus action to command it to take an action other than Dodge (PHB beast: use your action to command it to Attack)' },
      { name: 'Revive beast', col: 'action', text: 'Touch a beast that died within the last hour and expend a 1st-level or higher spell slot: it returns to life after 1 minute with all its HP' }
    ]
  });
  RS('beastmaster', 'Exceptional Training', { col: 'bonus', text: 'When your beast doesn\'t attack, command it to take the Dash, Disengage, Dodge or Help action; its attacks count as magical' });
  RS('beastmaster', 'Bestial Fury', { text: 'Your beast makes two attacks when you command it to attack' });
  RS('beastmaster', 'Share Spells', { text: 'A spell you cast targeting yourself also affects your beast if it is within 30 ft' });

  // ---- Gloom Stalker ----
  RS('gloomstalker', 'Dread Ambusher', { trigger: 'initiative', triggerLabel: 'First turn boost', triggerText: 'Dread Ambusher: on your first turn, +10 ft speed, and one extra weapon attack with the Attack action that deals +1d8 on a hit.', roll: '1d8', use: R('Dread Ambusher', 1, { speed: 10, note: 'First turn: one extra weapon attack with the Attack action; it deals +1d8 of the weapon\'s type on a hit' }), text: 'Roll is the +1d8 for the extra attack' });
  RS('gloomstalker', 'Umbral Sight', { passive: { sense: 'Darkvision 60 ft (+30 ft if you already have it); invisible to darkvision while in darkness' } });
  RS('gloomstalker', 'Iron Mind', { passive: { saveProf: ['wis'] }, text: 'If you were already proficient in WIS saves, choose INT or CHA saves instead' });
  RS('gloomstalker', "Stalker's Flurry", { text: 'Once on each of your turns when you miss with a weapon attack, make another weapon attack as part of the same action' });
  RS('gloomstalker', 'Shadowy Dodge', { col: 'reaction', text: 'When a creature makes an attack roll against you without advantage: impose disadvantage on it' });

  // ---- Horizon Walker ----
  RS('horizonwalker', 'Detect Portal', { col: 'action', text: 'Sense the distance and direction to the closest planar portal within 1 mile' });
  RS('horizonwalker', 'Planar Warrior', { col: 'bonus', roll: '{tier(ranger,3,1,11,2)}d8', rollNote: 'force (next hit on the chosen creature this turn; all its damage becomes force)', text: 'Choose a creature within 30 ft: the next time you hit it this turn, all the damage is force and it takes +{tier(ranger,3,1,11,2)}d8 force' });
  RS('horizonwalker', 'Ethereal Step', { col: 'bonus', use: R('Ethereal Step', 1, { note: 'On the Ethereal Plane (etherealness) until the end of this turn' }) });
  RS('horizonwalker', 'Distant Strike', { text: 'With the Attack action, teleport up to 10 ft before each attack; if you attack two different creatures, make one extra attack against a third' });
  RS('horizonwalker', 'Spectral Defense', { col: 'reaction', text: 'When you take damage from an attack: gain resistance to all of that attack\'s damage this turn' });

  // ---- Monster Slayer ----
  RS('monsterslayer', "Hunter's Sense", { col: 'action', text: 'Choose a creature within 60 ft: learn its damage immunities, resistances and vulnerabilities (or that it has none); fails against creatures shielded from divination' });
  RS('monsterslayer', "Slayer's Prey", { col: 'bonus', roll: '1d6', rollNote: 'extra damage (first weapon hit each turn on your prey)', use: R("Slayer's Prey", null, { note: 'Marked prey (60 ft): first weapon hit on it each turn deals +1d6; lasts until you rest or mark another' }) });
  RS('monsterslayer', 'Supernatural Defense', { roll: '1d6', rollNote: 'added to a save forced by your prey or a check to escape its grapple' });
  RS('monsterslayer', "Magic-User's Nemesis", { col: 'reaction', dc: 'spell', save: 'WIS', text: 'When you see a creature within 60 ft cast a spell or teleport: on a failed save the spell or teleport fails and is wasted' });
  RS('monsterslayer', "Slayer's Counter", { col: 'reaction', text: 'When your prey forces you to save: make one weapon attack against it first; on a hit you also succeed on the save' });

  // ---- Fey Wanderer ----
  RS('feywanderer', 'Dreadful Strikes', { roll: '1d{tier(ranger,3,4,11,6)}', rollNote: 'psychic (once per turn per creature)' });
  RS('feywanderer', 'Otherworldly Glamour', { text: 'Add +{max(1,wis)} to your Charisma checks' });
  RS('feywanderer', 'Beguiling Twist', { col: 'reaction', dc: 'spell', save: 'WIS', passive: { advNote: 'Saves against being charmed or frightened' }, text: 'When you or a creature within 120 ft succeeds on a save against being charmed or frightened: another creature within 120 ft is charmed or frightened by you for 1 minute (repeats the save each turn)' });
  RS('feywanderer', 'Fey Reinforcements', { spells: ['Summon Fey'], once: true, spellNote: 'No material component; once per long rest without a slot; can drop concentration (duration 1 minute)' });
  RS('feywanderer', 'Misty Wanderer', { col: 'bonus', spells: ['Misty Step'], spellNote: 'Without a slot (WIS mod times per long rest)', text: 'Cast misty step without a slot; you can bring one willing creature within 5 ft of you to a space within 5 ft of your destination' });

  // ---- Swarmkeeper ----
  RS('swarmkeeper', 'Gathered Swarm', {
    text: 'Once on each of your turns after you hit a creature with an attack',
    acts: [
      { name: 'Swarm: damage', roll: '1d{tier(ranger,3,6,11,8)}', rollNote: 'piercing' },
      { name: 'Swarm: push', dc: 'spell', save: 'STR', text: 'On a failure the target is moved up to 15 ft horizontally (and knocked prone from 11th level)' },
      { name: 'Swarm: move me', text: 'You are moved 5 ft horizontally to an unoccupied space' },
      { name: 'Swarm: move me + cover', min: 11, use: R('Mighty Swarm cover', 2, { ac: 2, note: 'Half cover until the start of your next turn' }), text: 'Moved 5 ft; half cover until the start of your next turn' }
    ]
  });
  RS('swarmkeeper', 'Writhing Tide', { col: 'bonus', use: R('Writhing Tide', 10, { fly: 10, note: 'Fly 10 ft and hover' }) });
  RS('swarmkeeper', 'Mighty Swarm', { text: 'Gathered Swarm: damage becomes 1d8; a failed push also knocks the target prone; moving yourself gives half cover until your next turn' });
  RS('swarmkeeper', 'Swarming Dispersal', { col: 'reaction', text: 'When you take damage: resistance to that damage, then teleport to an unoccupied space you can see within 30 ft' });

  // ---- Drakewarden ----
  RS('drakewarden', 'Draconic Gift', { spells: ['Thaumaturgy'], text: 'You also learn Draconic (or another language)' });
  RS('drakewarden', 'Drake Companion', {
    col: 'action',
    acts: [
      { name: 'Command drake', col: 'bonus', onlyWhen: { companion: 'Drake Companion' }, text: 'Command it to take an action from its stat block or another action (it takes Dodge otherwise)' },
      { name: 'Summon with a spell slot', col: 'action', use: { companion: 'Drake Companion' }, text: 'Expend a spell slot of 1st level or higher (mark it on the Spells tab)' }
    ],
    text: 'The drake lasts until it drops to 0 HP, you summon it again or you die'
  });
  RS('drakewarden', 'Bond of Fang and Scale', { passive: { resist: ["your drake's Draconic Essence damage type"] }, text: 'Drake is Medium, can be ridden, gains a flying speed equal to its walking speed and its bite deals +1d6 of its essence type' });
  RS('drakewarden', "Drake's Breath", { col: 'action', dc: 'spell', save: 'DEX', roll: '{tier(ranger,11,8,15,10)}d6', rollNote: 'acid, cold, fire, lightning or poison in a 30-ft cone (half on a save)', text: 'You or your drake exhales; regain it by expending a 3rd-level or higher spell slot' });
  RS('drakewarden', 'Perfected Bond', { col: 'reaction', text: 'When you or your drake (within 30 ft of each other) takes damage: give that one resistance to that instance. Drake is Large and its bite deals +2d6 of its essence type' });

  Object.assign(DND.featFx, T);

  // ---- Hunter option fixes (on-hit riders aren't actions) ----
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  setOpt('hunterPrey', 'Colossus Slayer', { col: null, roll: '1d8', rollNote: 'extra damage (once per turn, target below its HP maximum)' });
  setOpt('hunterPrey', 'Giant Killer', { col: 'reaction', text: 'When a Large or larger creature within 5 ft hits or misses you with an attack: attack it right after its attack' });
  setOpt('hunterPrey', 'Horde Breaker', { col: null, text: 'Once on each of your turns when you make a weapon attack: make another attack with the same weapon against a different creature within 5 ft of the original target and in range' });
  setOpt('hunterDefense', 'Escape the Horde', { passive: { advNote: 'Opportunity attacks against you are made with disadvantage' } });
  setOpt('hunterDefense', 'Multiattack Defense', { text: 'When a creature hits you with an attack, you gain +4 AC against all its later attacks this turn' });
  setOpt('hunterMultiattack', 'Volley', { col: 'action', text: 'Ranged attack against any number of creatures within 10 ft of a point in range (ammunition for each; separate attack rolls)' });
  setOpt('hunterMultiattack', 'Whirlwind Attack', { col: 'action', text: 'Melee attack against any number of creatures within 5 ft of you (separate attack rolls)' });
  setOpt('hunterSuperior', 'Stand Against the Tide', { col: 'reaction', text: 'When a hostile creature misses you with a melee attack: force it to repeat the attack against another creature of your choice (not itself)' });
  setOpt('hunterSuperior', 'Uncanny Dodge', { col: 'reaction', use: { halveDamage: true } });
})();

// Feature automation: Rogue and Sorcerer (all non-UA subclasses). Loads after featfx.js; these records win.
(function () {
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const WAILS = '{ceil(ceil(rogue/2)/2)}d6'; // half the Sneak Attack dice, rounded up
  const ALLDMG_BUT_FORCE_RADIANT = ['acid', 'bludgeoning', 'cold', 'fire', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'slashing', 'thunder'];
  const SP = n => ({ from: 'Font of Magic', n });
  const ORDN = ['1st', '2nd', '3rd', '4th', '5th'];
  const SLOT_COST = [2, 3, 5, 6, 7], SLOT_MIN = [2, 3, 5, 7, 9];

  Object.assign(DND.featFx, {
    // ================= ROGUE =================
    'rogue:Expertise': { none: true }, // handled by the class expertise choices (1st and 6th)
    'rogue:Sneak Attack': { none: true }, // built in: Sneak Attack button with scaling dice on the Combat tab
    "rogue:Thieves' Cant": { none: true },
    'rogue:Cunning Action': { resource: true, acts: [
      { name: 'Dash', col: 'bonus', dash: true },
      { name: 'Disengage', col: 'bonus', text: 'Your movement doesn’t provoke opportunity attacks this turn' },
      { name: 'Hide', col: 'bonus', text: 'Make a DEX (Stealth) check to hide' }] },
    'rogue:Steady Aim': { col: 'bonus', onlyWhen: { notMoved: true }, use: { speed0: 'Steady Aim', effect: { name: 'Steady Aim', rounds: 1, buff: { atkAdvNext: 'Steady Aim', note: 'Advantage on your next attack roll this turn' } } } },
    'rogue:Uncanny Dodge': { col: 'reaction', use: { halveDamage: true } },
    'rogue:Evasion': { passive: { advNote: 'Evasion: DEX saves for half damage — no damage on a success, half on a failure' } },
    'rogue:Reliable Talent': { passive: { minD20: { prof: true, value: 10 }, advNote: 'Reliable Talent: proficient ability checks treat a d20 of 9 or lower as 10' } },
    'rogue:Blindsense': { passive: { sense: 'Blindsense 10 ft (hidden/invisible creatures, if you can hear)' } },
    'rogue:Slippery Mind': { passive: { saveProf: ['wis'] } },
    'rogue:Elusive': { passive: { advNote: 'Elusive: no attack roll has advantage against you while you aren’t incapacitated' } },
    'rogue:Stroke of Luck': { max: '1', reset: 'short', text: 'Turn a missed attack into a hit, or treat a failed ability check’s d20 as a 20' },

    // ---- Thief ----
    'rogue:thief:Fast Hands': { acts: [
      { name: 'Sleight of Hand', col: 'bonus', text: 'Cunning Action: DEX (Sleight of Hand) check' },
      { name: "Thieves' tools", col: 'bonus', text: 'Cunning Action: disarm a trap or open a lock' },
      { name: 'Use an Object', col: 'bonus', text: 'Cunning Action: Use an Object action' }] },
    'rogue:thief:Second-Story Work': { passive: { climb: 'walk', advNote: 'Second-Story Work: running jumps go DEX mod extra feet' } },
    'rogue:thief:Supreme Sneak': { passive: { advNote: 'Stealth checks when you move no more than half your speed that turn' } },
    'rogue:thief:Use Magic Device': { none: true },
    "rogue:thief:Thief's Reflexes": { trigger: 'initiative', triggerLabel: 'Noted', triggerText: "Thief's Reflexes: in the first round take two turns — your normal turn and a second at your initiative − 10 (not if surprised)", text: 'Second turn this round at initiative − 10' },

    // ---- Assassin ----
    'rogue:assassin:Bonus Proficiencies': { none: true }, // disguise kit + poisoner's kit: add on the Proficiencies panel
    'rogue:assassin:Assassinate': { passive: { advNote: 'Assassinate: attacks vs creatures that haven’t taken a turn yet; your hits vs surprised creatures are critical hits' } },
    'rogue:assassin:Infiltration Expertise': { none: true },
    'rogue:assassin:Impostor': { passive: { advNote: 'Impostor: Deception checks to avoid detection while posing as someone' } },
    'rogue:assassin:Death Strike': { dc: 'dex', save: 'CON', text: 'When you hit a surprised creature: on a failed save, double the attack’s damage' },

    // ---- Arcane Trickster ----
    'rogue:arcanetrickster:Spellcasting': { none: true }, // class data provides the third-caster table (INT)
    'rogue:arcanetrickster:Mage Hand Legerdemain': { spells: ['Mage Hand'], spellNote: 'Invisible hand; stow/retrieve items, pick locks and pockets', col: 'bonus', text: 'Control the hand; DEX (Sleight of Hand) contested by the target’s WIS (Perception) to go unnoticed' },
    'rogue:arcanetrickster:Magical Ambush': { passive: { advNote: 'Magical Ambush: if you are hidden when you cast, the target has disadvantage on its save this turn' } },
    'rogue:arcanetrickster:Versatile Trickster': { col: 'bonus', use: R('Versatile Trickster', 1, { atkAdv: 'Versatile Trickster (creature within 5 ft of your mage hand)', note: 'Advantage on attacks vs the distracted creature this turn' }) },
    'rogue:arcanetrickster:Spell Thief': { col: 'reaction', max: '1', reset: 'long', dc: false, text: 'The caster makes a spellcasting ability check vs DC {8+prof+int}. On a failure its spell has no effect on you and you steal it (1st level+, up to a level you can cast) for 8 hours' },

    // ---- Inquisitive ----
    'rogue:inquisitive:Ear for Deceit': { passive: { minD20: { skills: ['Insight'], value: 8 }, advNote: 'Ear for Deceit: Insight to tell if a creature is lying treats a d20 of 7 or lower as 8' } },
    'rogue:inquisitive:Eye for Detail': { acts: [
      { name: 'Spot (Perception)', col: 'bonus', text: 'WIS (Perception) to spot a hidden creature or object' },
      { name: 'Search (Investigation)', col: 'bonus', text: 'INT (Investigation) to uncover or decipher clues' }] },
    'rogue:inquisitive:Insightful Fighting': { col: 'bonus', use: R('Insightful Fighting', 10, { note: 'Sneak Attack the chosen creature without advantage (not if you have disadvantage)' }), text: 'WIS (Insight) vs the target’s CHA (Deception); the effect only applies if you win' },
    'rogue:inquisitive:Steady Eye': { passive: { advNote: 'Steady Eye: Perception and Investigation if you move no more than half your speed that turn' } },
    'rogue:inquisitive:Unerring Eye': { col: 'action', max: 'max(1,wis)', reset: 'long', text: 'Sense illusions, shapechangers not in true form, and magic deceptions within 30 ft (not blinded or deafened) for this turn' },
    'rogue:inquisitive:Eye for Weakness': { roll: '3d6', rollNote: 'extra Sneak Attack damage vs your Insightful Fighting target', onlyWhen: { effect: 'Insightful Fighting' } },

    // ---- Mastermind ----
    'rogue:mastermind:Master of Intrigue': { none: true }, // tools (disguise, forgery, gaming set) added manually; languages via the subclass choice
    'rogue:mastermind:Master of Tactics': { col: 'bonus', text: 'Help action; the ally’s target can be up to 30 ft from you if it can see or hear you' },
    'rogue:mastermind:Insightful Manipulator': { none: true },
    'rogue:mastermind:Misdirection': { col: 'reaction', text: 'An attacker targets you while a creature within 5 ft gives you cover: the attack targets that creature instead' },
    'rogue:mastermind:Soul of Deceit': { passive: { advNote: 'Soul of Deceit: thoughts can’t be read; magic can’t compel truth; Deception vs Insight to show false thoughts' } },

    // ---- Scout ----
    'rogue:scout:Skirmisher': { col: 'reaction', text: 'An enemy ends its turn within 5 ft: move up to {floor(0)}half your speed without provoking opportunity attacks'.replace('{floor(0)}', '') },
    'rogue:scout:Survivalist': { passive: { skillProf: ['Nature', 'Survival'], skillExp: ['Nature', 'Survival'] } },
    'rogue:scout:Superior Mobility': { passive: { speed: 10, advNote: 'Superior Mobility: +10 ft to climbing and swimming speeds too (if you have them)' } },
    'rogue:scout:Ambush Master': { passive: { initAdv: true }, acts: [{ name: 'Mark first target', text: 'First creature you hit in the first round: allies have advantage on attacks against it until your next turn' }] },
    'rogue:scout:Sudden Strike': { col: 'bonus', text: 'After the Attack action: one more attack; can Sneak Attack again only against a different target (no other Sneak Attack on that target this turn)' },

    // ---- Swashbuckler ----
    'rogue:swashbuckler:Fancy Footwork': { passive: { advNote: 'Fancy Footwork: creatures you make a melee attack against can’t make opportunity attacks against you this turn' } },
    'rogue:swashbuckler:Rakish Audacity': { passive: { advNote: 'Rakish Audacity: Sneak Attack without advantage if the target is the only creature within 5 ft of you (not with disadvantage)' } },
    'rogue:swashbuckler:Panache': { col: 'action', text: 'CHA (Persuasion) vs the target’s WIS (Insight). Hostile: disadvantage on attacks vs others and can’t make opportunity attacks vs others for 1 minute. Non-hostile: charmed for 1 minute' },
    'rogue:swashbuckler:Elegant Maneuver': { col: 'bonus', text: 'Advantage on the next DEX (Acrobatics) or STR (Athletics) check this turn' },
    'rogue:swashbuckler:Master Duelist': { max: '1', reset: 'short', text: 'Reroll a missed attack with advantage' },

    // ---- Phantom ----
    'rogue:phantom:Whispers of the Dead': { trigger: ['shortRest', 'longRest'], triggerLabel: 'Noted', triggerText: 'Whispers of the Dead: you may gain one skill or tool proficiency you lack (replacing the previous one) — set it on the Skills/Proficiencies panel', text: 'Swap your ghostly skill or tool proficiency' },
    'rogue:phantom:Wails from the Grave': { max: 'prof', reset: 'long', roll: WAILS, rollNote: 'necrotic to a second creature within 30 ft of the first (after Sneak Attack)' },
    'rogue:phantom:Tokens of the Departed': { max: 'prof', reset: 'none', resource: true,
      passive: { advNote: 'Tokens of the Departed: advantage on death saves and CON saves while you carry a soul trinket' },
      acts: [
        { name: 'Gain soul trinket', col: 'reaction', use: { regain: { from: 'Tokens of the Departed', n: 1 } }, text: 'A creature you can see dies within 30 ft' },
        { name: 'Wails (trinket)', cost: true, roll: WAILS, rollNote: 'necrotic — Wails from the Grave without spending a use' },
        { name: 'Ghost Walk (trinket)', col: 'bonus', min: 13, cost: true, use: R('Ghost Walk', 100, { fly: 10, note: 'Hover; attacks against you have disadvantage; pass through creatures and objects (difficult terrain)' }) },
        { name: 'Ask the spirit', col: 'action', cost: true, text: 'The trinket’s spirit appears and answers one question' }] },
    'rogue:phantom:Ghost Walk': { col: 'bonus', max: '1', reset: 'long', use: R('Ghost Walk', 100, { fly: 10, note: 'Hover; attacks against you have disadvantage; pass through creatures and objects (difficult terrain)' }), text: 'Can also be used by destroying a soul trinket (see Tokens of the Departed)' },
    "rogue:phantom:Death's Friend": { trigger: 'longRest', triggerLabel: 'Gain a trinket', triggerText: "Death's Friend: if you have no soul trinkets, one appears in your hand", use: { regain: { from: 'Tokens of the Departed', n: 1 } }, passive: { advNote: "Death's Friend: Wails from the Grave also deals its necrotic damage to the first target" } },

    // ---- Soulknife ----
    'rogue:soulknife:Psionic Power': { max: '2*prof', reset: 'long', resource: true, acts: [
      { name: 'Psi-Bolstered Knack', cost: true, roll: '1psi', rollNote: 'added to a failed check with a proficient skill or tool (die is lost only if you then succeed)' },
      { name: 'Psychic Whispers', col: 'action', cost: true, roll: '1psi', rollNote: 'hours of telepathy with up to {prof} creatures (first use after a long rest is free)' },
      { name: 'Regain a die', col: 'bonus', use: { regain: { from: 'Psionic Power', n: 1 } }, text: 'Once per short or long rest' }] },
    'rogue:soulknife:Psychic Blades': { attacks: [
      ['Psychic Blade', '1d6', 'psychic', 'fin', { kind: 'melee', notes: 'Finesse; thrown 60/120 ft; vanishes after the attack; leaves no mark' }],
      ['Psychic Blade (bonus action)', '1d4', 'psychic', 'fin', { kind: 'melee', bonus: true, after: 'Psychic Blade', notes: 'Bonus action after attacking with a psychic blade; other hand free' }]] },
    'rogue:soulknife:Soul Blades': { acts: [
      { name: 'Homing Strikes', cost: { from: 'Psionic Power', n: 1 }, roll: '1psi', rollNote: 'added to a missed psychic blade attack (die lost only if it then hits)' },
      { name: 'Psychic Teleportation', col: 'bonus', cost: { from: 'Psionic Power', n: 1 }, roll: '1psi', rollNote: '× 10 ft: throw a blade and teleport to an unoccupied space there' }] },
    'rogue:soulknife:Psychic Veil': { col: 'action', max: '1', reset: 'long', use: { cond: 'Invisible', condRounds: 600 }, text: 'Invisible for 1 hour (ends early if you deal damage or force a save)',
      acts: [{ name: 'Veil (spend die)', col: 'action', cost: { from: 'Psionic Power', n: 1 }, use: { cond: 'Invisible', condRounds: 600 }, text: 'Invisible for 1 hour (ends if you deal damage or force a save)' }] },
    'rogue:soulknife:Rend Mind': { max: '1', reset: 'long', dc: 'dex', save: 'WIS', text: 'Sneak Attack with a psychic blade: stunned for 1 minute on a failure (repeat the save at the end of each of its turns)',
      acts: [{ name: 'Rend Mind (3 dice)', cost: { from: 'Psionic Power', n: 3 }, dc: 'dex', save: 'WIS', text: 'Stunned for 1 minute on a failure (repeat the save each turn)' }] },

    // ================= SORCERER =================
    'sorcerer:Spellcasting': { none: true }, // class caster table (CHA)
    'sorcerer:Font of Magic': { max: 'sorcerer', reset: 'long', pool: true, acts: []
      .concat(ORDN.map((o, k) => ({ name: `${SLOT_COST[k]} SP → ${o} slot`, col: 'bonus', min: SLOT_MIN[k], cost: SP(SLOT_COST[k]), use: { recoverSlots: { total: k + 1, maxLevel: k + 1 } }, text: `Create a ${o}-level slot (pick an expended ${o}-level slot; created slots vanish on a long rest)` })))
      .concat(ORDN.map((o, k) => ({ name: `${o} slot → ${k + 1} SP`, col: 'bonus', min: SLOT_MIN[k], use: { regain: { from: 'Font of Magic', n: k + 1 } }, text: `Mark one ${o}-level slot as spent on the Spells tab` }))) },
    'sorcerer:Metamagic': { none: true }, // each Metamagic option carries its own cost
    'sorcerer:Sorcerous Restoration': { trigger: 'shortRest', triggerLabel: 'Regain 4 points', triggerText: 'Sorcerous Restoration: regain 4 expended sorcery points', use: { regain: { from: 'Font of Magic', n: 4 } } },

    // ---- Draconic Bloodline ----
    'sorcerer:draconic:Dragon Ancestor': { passive: { advNote: 'Dragon Ancestor: double proficiency on CHA checks with dragons (you speak Draconic)' } },
    'sorcerer:draconic:Draconic Resilience': { none: true }, // built in: +1 HP per sorcerer level and 13 + DEX unarmored AC
    'sorcerer:draconic:Elemental Affinity': { none: true }, // automated by the chosen Dragon Ancestor option (CHA to damage, 1 SP resistance)
    'sorcerer:draconic:Dragon Wings': { col: 'bonus', use: R('Dragon Wings', null, { fly: 'walk', note: 'Flying speed = your speed (not while wearing armor not made for them)' }), acts: [{ name: 'Dismiss wings', col: 'bonus', use: { endEffect: 'Dragon Wings' } }] },
    'sorcerer:draconic:Draconic Presence': { col: 'action', cost: SP(5), dc: 'spell', save: 'WIS', use: R('Draconic Presence', 10, { note: '60 ft aura of awe (charmed) or fear (frightened); a creature that saves is immune for 24 hours' }, { conc: true }) },

    // ---- Wild Magic ----
    // Casting a 1st+ level spell rolls the surge check by itself (and surges when Tides of Chaos is spent) — see wildAfterCast.
    'sorcerer:wildmagic:Wild Magic Surge': { acts: [
      { name: 'Surge check (d20)', surgeCheck: true },
      { name: 'Roll a surge (d100)', surge: true }] },
    'sorcerer:wildmagic:Tides of Chaos': { max: '1', reset: 'long', use: { effect: { name: 'Tides of Chaos', buff: { d20AdvNext: 'Tides of Chaos', note: 'Advantage on your next attack roll, ability check or saving throw' } } }, text: 'Your next attack roll, ability check or saving throw has advantage. While it’s spent, your next 1st+ level spell sets off a Wild Magic Surge, which restores it' },
    'sorcerer:wildmagic:Bend Luck': { col: 'reaction', cost: SP(2), roll: '1d4', rollNote: 'added to or subtracted from another creature’s attack, check or save' },
    'sorcerer:wildmagic:Controlled Chaos': { roll: '1d100', rollNote: 'second Wild Magic Surge roll — use either result' },
    'sorcerer:wildmagic:Spell Bombardment': { passive: { advNote: 'Spell Bombardment: once per turn, a spell damage die that rolls its maximum — roll it again and add it' } },

    // ---- Divine Soul ----
    'sorcerer:divinesoul:Divine Magic': { none: true }, // cleric list access + affinity spell: add the affinity spell on the Spells tab
    'sorcerer:divinesoul:Favored by the Gods': { max: '1', reset: 'short', roll: '2d4', rollNote: 'added to a failed save or missed attack' },
    'sorcerer:divinesoul:Empowered Healing': { cost: SP(1), text: 'Reroll any number of healing dice once (yours or an ally within 5 ft; once per turn)' },
    'sorcerer:divinesoul:Otherworldly Wings': { col: 'bonus', use: R('Otherworldly Wings', null, { fly: 30, note: 'Wings (not in armor not made for them)' }), acts: [{ name: 'Dismiss wings', col: 'bonus', use: { endEffect: 'Otherworldly Wings' } }] },
    'sorcerer:divinesoul:Unearthly Recovery': { col: 'bonus', max: '1', reset: 'long', onlyWhen: { hpBelowHalf: true }, use: { healHalf: true } },

    // ---- Shadow Magic ----
    'sorcerer:shadow:Eyes of the Dark': { passive: { sense: 'Darkvision 120 ft (Eyes of the Dark)' }, spellsAt: { 3: ['Darkness'] }, spellNote: 'Cast with 2 sorcery points; you can see through it',
      acts: [{ name: 'Darkness (2 SP)', col: 'action', min: 3, cost: SP(2), text: 'Cast darkness without a slot; you can see through it' }] },
    'sorcerer:shadow:Strength of the Grave': { max: '1', reset: 'long', trigger: 'zero', onlyWhen: { zeroHp: true }, triggerLabel: 'I saved — 1 HP', use: { setHp: 1 },
      triggerText: 'Strength of the Grave: make a CHA save (DC 5 + the damage taken). On a success drop to 1 HP instead. Not vs radiant damage or a critical hit.',
      text: 'Use only after succeeding on the CHA save (DC 5 + damage taken)' },
    'sorcerer:shadow:Hound of Ill Omen': { col: 'bonus', cost: SP(3), text: 'Summon a dire wolf hound (temp HP {floor(sorcerer/2)}) within 30 ft of a creature you can see within 120 ft, for 5 minutes. While it’s within 5 ft, the target has disadvantage on saves vs your spells' },
    'sorcerer:shadow:Shadow Walk': { col: 'bonus', text: 'In dim light or darkness: teleport up to 120 ft to an unoccupied space you can see in dim light or darkness' },
    'sorcerer:shadow:Umbral Form': { col: 'bonus', cost: SP(6), use: R('Umbral Form', 10, { note: 'Resistance to all but force and radiant; move through creatures and objects (difficult terrain)' }), passive: { effect: 'Umbral Form', resist: ALLDMG_BUT_FORCE_RADIANT } },

    // ---- Storm Sorcery ----
    'sorcerer:storm:Wind Speaker': { none: true }, // Primordial language
    'sorcerer:storm:Tempestuous Magic': { col: 'bonus', text: 'Before or after casting a 1st+ level spell: fly up to 10 ft without provoking opportunity attacks' },
    'sorcerer:storm:Heart of the Storm': { passive: { resist: ['lightning', 'thunder'] },
      acts: [{ name: 'Storm burst', text: 'After casting a 1st+ level lightning or thunder spell: creatures of your choice within 10 ft take {max(1,floor(sorcerer/2))} lightning or thunder damage' }] },
    'sorcerer:storm:Storm Guide': { acts: [
      { name: 'Calm the rain', col: 'action', text: 'Rain stops in a 20 ft radius around you until you end it (bonus action)' },
      { name: 'Turn the wind', col: 'bonus', text: 'Wind within 100 ft blows in a direction you choose until the end of your next turn' }] },
    "sorcerer:storm:Storm's Fury": { col: 'reaction', roll: '{sorcerer}', rollNote: 'lightning damage to the melee attacker', dc: 'spell', save: 'STR', text: 'On a failed STR save it’s pushed up to 20 ft away from you' },
    'sorcerer:storm:Wind Soul': { max: '1', reset: 'short', passive: { immune: ['lightning', 'thunder'], fly: 60 },
      use: R('Wind Soul (shared)', 600, { note: 'Your flying speed is 30 ft; up to {3+cha} creatures within 30 ft gain 30 ft flying speed for 1 hour' }), text: 'Up to {3+cha} creatures within 30 ft gain a 30 ft flying speed for 1 hour; yours drops to 30 ft' },

    // ---- Aberrant Mind ----
    'sorcerer:aberrantmind:Telepathic Speech': { col: 'bonus', text: 'Telepathic link with a creature within 30 ft for {sorcerer} minutes, while within {max(1,cha)} miles of each other' },
    'sorcerer:aberrantmind:Psionic Sorcery': { resource: true, acts: [1, 2, 3, 4, 5].map(L => ({ name: `${ORDN[L - 1]}-level psionic spell`, col: 'action', min: [0, 6, 6, 6, 7, 9][L], cost: SP(L), text: `Cast a ${ORDN[L - 1]}-level Psionic Spell with ${L} sorcery point${L > 1 ? 's' : ''}: no verbal or somatic components, no material unless consumed or costed (use the spell’s own casting time)` })) },
    'sorcerer:aberrantmind:Psychic Defenses': { passive: { resist: ['psychic'], advNote: 'Psychic Defenses: saves against being charmed or frightened' } },
    'sorcerer:aberrantmind:Revelation in Flesh': { resource: true, acts: [
      { name: 'See invisible', col: 'bonus', cost: SP(1), use: R('Revelation: See Invisible', 100, { note: 'See invisible creatures within 60 ft that aren’t behind total cover' }) },
      { name: 'Fly', col: 'bonus', cost: SP(1), use: R('Revelation: Flight', 100, { fly: 'walk', note: 'Hover' }) },
      { name: 'Aquatic', col: 'bonus', cost: SP(1), use: R('Revelation: Aquatic', 100, { note: 'Swimming speed = twice your walking speed; breathe water' }) },
      { name: 'Squeeze', col: 'bonus', cost: SP(1), use: R('Revelation: Slippery', 100, { note: 'Move through 1-inch spaces without squeezing; 5 ft of movement to escape nonmagical restraints or grapples' }) }] },
    'sorcerer:aberrantmind:Warping Implosion': { col: 'action', max: '1', reset: 'long', dc: 'spell', save: 'STR', roll: '3d10', rollNote: 'force (half on a save); failed save: pulled next to the space you left',
      text: 'Teleport to an unoccupied space within 120 ft; creatures within 30 ft of the space you left save',
      acts: [{ name: 'Restore (5 SP)', cost: SP(5), use: { regain: { from: 'Warping Implosion', n: 1 } } }] },

    // ---- Clockwork Soul ----
    'sorcerer:clockworksoul:Clockwork Magic': { none: true }, // clockwork spells come from the subclass spell list
    'sorcerer:clockworksoul:Restore Balance': { col: 'reaction', max: 'prof', reset: 'long', text: 'A creature within 60 ft is about to roll with advantage or disadvantage: cancel it' },
    'sorcerer:clockworksoul:Bastion of Law': { resource: true, acts: [1, 2, 3, 4, 5].map(n => ({ name: `Ward (${n} SP)`, col: 'action', cost: SP(n), text: `Ward a creature within 30 ft with ${n}d8: when it takes damage it can spend any of the dice, roll them and reduce the damage by the total. Lasts until your long rest or a new ward` })) },
    'sorcerer:clockworksoul:Trance of Order': { col: 'bonus', max: '1', reset: 'long',
      use: R('Trance of Order', 10, { note: 'Attacks against you can’t have advantage; your d20 attack rolls, checks and saves treat 9 or lower as 10' }),
      passive: ['str', 'dex', 'con', 'int', 'wis', 'cha'].map(a => ({ effect: 'Trance of Order', minD20: { ab: a, value: 10 } })),
      acts: [{ name: 'Restore (5 SP)', cost: SP(5), use: { regain: { from: 'Trance of Order', n: 1 } } }] },
    'sorcerer:clockworksoul:Clockwork Cavalcade': { col: 'action', max: '1', reset: 'long', text: 'Spirits of order fill a 30 ft cube: restore up to 100 HP divided among creatures, repair damaged objects, and end spells of 6th level or lower on creatures and objects of your choice',
      acts: [{ name: 'Restore (7 SP)', cost: SP(7), use: { regain: { from: 'Clockwork Cavalcade', n: 1 } } }] }
  });
})();

// Feature automation: warlock, wizard and artificer (see tools/FX_SPEC.md).
(function () {
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  Object.assign(DND.featFx, {
    // ---- Warlock ----
    'warlock:Pact Magic': { none: true },
    'warlock:Eldritch Invocations': { none: true },
    'warlock:Pact Boon': { none: true },
    'warlock:Mystic Arcanum': { text: 'Cast your arcanum spells (6th, 7th at 13th, 8th at 15th, 9th at 17th) once each per long rest without a slot — add them on the Spells tab with a free use' },
    'warlock:Eldritch Master': { col: 'action', text: 'Entreat your patron for 1 minute: regain all expended Pact Magic slots', use: { effect: { name: 'Eldritch Master', rounds: 10, buff: { note: 'Pact slots return after 1 minute' } } } },
    "warlock:fiend:Dark One's Blessing": { use: { temp: 'max(1,cha+warlock)' }, text: 'Use when you reduce a hostile creature to 0 HP' },
    "warlock:fiend:Dark One's Own Luck": { roll: '1d10', rollNote: 'added to an ability check or saving throw' },
    'warlock:fiend:Fiendish Resilience': { text: 'After a short or long rest, choose one damage type (not magical or silvered weapons) to resist until you choose another', trigger: ['shortRest', 'longRest'], triggerText: 'Choose your Fiendish Resilience damage type for now', use: R('Fiendish Resilience', null, { note: 'Resistance to your chosen damage type' }) },
    'warlock:fiend:Hurl Through Hell': { roll: '10d10', rollNote: 'psychic to a non-fiend when it reappears' },
    'warlock:archfey:Fey Presence': { col: 'action', dc: 'spell', save: 'WIS', text: 'Creatures in a 10 ft cube from you are charmed or frightened (your choice) until the end of your next turn' },
    'warlock:archfey:Misty Escape': { col: 'reaction', use: { cond: 'Invisible', condRounds: 1 }, text: 'When you take damage: turn invisible and teleport up to 60 ft' },
    'warlock:archfey:Beguiling Defenses': { col: 'reaction', passive: { condImmune: ['Charmed'] }, dc: 'spell', save: 'WIS', text: 'When someone tries to charm you, turn it back on them' },
    'warlock:archfey:Dark Delirium': { col: 'action', dc: 'spell', save: 'WIS', use: { effect: { name: 'Dark Delirium', rounds: 10, conc: true, buff: { note: 'Target charmed or frightened in an illusory realm' } } } },
    'warlock:greatoldone:Awakened Mind': { none: true },
    'warlock:greatoldone:Entropic Ward': { col: 'reaction', use: R('Entropic Ward', 1, { atkAdv: 'Entropic Ward (if the attack missed)' }) },
    'warlock:greatoldone:Thought Shield': { passive: { resist: ['psychic'], advNote: 'Thoughts can’t be read; psychic damage dealt to you is dealt to the attacker too' } },
    'warlock:greatoldone:Create Thrall': { col: 'action', text: 'Touch an incapacitated humanoid: it is charmed by you until remove curse, and you can talk telepathically' },
    'warlock:celestial:Bonus Cantrips': { spells: ['Light', 'Sacred Flame'] },
    'warlock:celestial:Healing Light': { col: 'bonus', roll: '1d6', rollNote: 'healing per die spent (up to CHA mod dice at once)' },
    'warlock:celestial:Radiant Soul': { passive: { resist: ['radiant'], advNote: 'Add CHA to one radiant or fire damage roll of your spells' } },
    'warlock:celestial:Celestial Resilience': { trigger: ['shortRest', 'longRest'], triggerText: 'Gain temporary HP (warlock level + CHA); up to five allies get half your level + CHA', use: { temp: 'warlock+cha' } },
    'warlock:celestial:Searing Vengeance': { trigger: 'zero', triggerText: 'Instead of a death save, regain half your HP, stand up, and blind and burn nearby enemies', use: { healHalf: true, removeCond: ['Unconscious', 'Prone'] }, roll: '2d8+5+cha', rollNote: 'radiant to each enemy within 30 ft (blinded until the end of the turn)' },
    "warlock:hexblade:Hexblade's Curse": { col: 'bonus', use: R("Hexblade's Curse", 10, { note: '+prof damage vs the cursed target; crit on 19–20 against it; regain warlock level + CHA HP when it dies' }) },
    'warlock:hexblade:Hex Warrior': { text: 'Use CHA instead of STR or DEX for attacks with your bonded weapon or pact weapon (set the attack’s ability to CHA on the Core tab)' },
    'warlock:hexblade:Accursed Specter': { col: 'action', text: 'Raise a slain humanoid as a specter (temp HP = half warlock level; adds CHA to its attacks) until your next long rest' },
    'warlock:hexblade:Armor of Hexes': { col: 'reaction', roll: '1d6', rollNote: 'on a 4 or higher the attack misses' },
    'warlock:hexblade:Master of Hexes': { text: 'When the target of your Hexblade’s Curse dies, move the curse to another creature within 30 ft (no healing from the first)' },
    'warlock:fathomless:Tentacle of the Deeps': { col: 'bonus', roll: '{tier(warlock,1,1,10,2)}d8', rollNote: 'cold damage; speed −10 ft', dc: false },
    'warlock:fathomless:Gift of the Sea': { passive: { swim: 40 } },
    'warlock:fathomless:Oceanic Soul': { passive: { resist: ['cold'] } },
    'warlock:fathomless:Guardian Coil': { col: 'reaction', roll: '{tier(warlock,6,1,10,2)}d8', rollNote: 'damage reduced' },
    'warlock:fathomless:Grasping Tentacles': { spells: ["Evard's Black Tentacles"], once: true, spellNote: 'Once per long rest without a slot; damage can’t break this concentration', use: { temp: 'warlock' } },
    'warlock:fathomless:Fathomless Plunge': { col: 'action', text: 'Teleport yourself and up to five willing creatures within 30 ft to a body of water within 1 mile' },
    "warlock:genie:Genie's Vessel": { col: 'action', text: 'Bottled Respite: vanish into the vessel for up to 2 × prof hours. Genie’s Wrath: once per turn, +prof damage of your genie’s type on an attack hit', passive: { advNote: 'Genie’s Wrath: +prof damage once per turn on a hit' } },
    'warlock:genie:Elemental Gift': { col: 'bonus', use: R('Elemental Gift', 100, { fly: 30, note: 'Flying speed 30 ft, hover' }), passive: { advNote: 'Resistance to your genie’s damage type' } },
    'warlock:genie:Sanctuary Vessel': { text: 'Bring up to five willing creatures into your vessel; a 10-minute rest there counts as a short rest, and they can add your prof bonus to Hit Dice healing' },
    'warlock:genie:Limited Wish': { col: 'action', text: 'Duplicate a 6th-level or lower spell with a casting time of 1 action, no components; usable again after 1d4 long rests' },
    'warlock:undying:Among the Dead': { spells: ['Spare the Dying'], passive: { advNote: 'Saves against disease; undead must make a WIS save to attack you' } },
    'warlock:undying:Defy Death': { roll: '1d8+max(1,con)', healRoll: true, rollNote: 'healing when you succeed on a death save or stabilize someone with spare the dying' },
    'warlock:undying:Undying Nature': { none: true },
    'warlock:undying:Indestructible Life': { col: 'bonus', roll: '1d8+warlock', healRoll: true },
    'warlock:undead:Form of Dread': { col: 'bonus', use: Object.assign(R('Form of Dread', 10, { note: 'Immune to frightened; once per turn a hit can frighten (WIS save)' }), { temp: '1d10+warlock', removeCond: ['Frightened'] }), dc: 'spell', save: 'WIS' },
    'warlock:undead:Grave Touched': { passive: { advNote: 'Once per turn, change attack damage to necrotic; in Form of Dread add one extra damage die' } },
    'warlock:undead:Necrotic Husk': { passive: { resist: ['necrotic'] }, trigger: 'zero', triggerText: 'Drop to 1 HP instead; creatures within 30 ft take 2d10 + warlock level necrotic (you gain a level of exhaustion)', use: { setHp: 1, removeCond: ['Unconscious'], exhaustion: 1 }, roll: '2d10+warlock', rollNote: 'necrotic to each creature of your choice within 30 ft' },
    'warlock:undead:Spirit Projection': { col: 'action', use: R('Spirit Projection', 600, { note: 'Spirit: resistance to bludgeoning, piercing and slashing; conjuration/necromancy spells need no components; fly' }) },
    // ---- Wizard ----
    'wizard:Spellcasting': { none: true },
    'wizard:Arcane Recovery': { use: { recoverSlots: { total: 'ceil(wizard/2)', maxLevel: 5 } }, text: 'During a short rest: recover slots totaling half your wizard level (none 6th or higher)', trigger: 'shortRest', triggerText: 'Recover spell slots with Arcane Recovery?' },
    'wizard:Spell Mastery': { text: 'Your chosen 1st- and 2nd-level spells can be cast at their lowest level without a slot (mark them on the Spells tab)' },
    'wizard:Signature Spells': { text: 'Your two 3rd-level signature spells are always prepared and each castable once at 3rd level without a slot per short or long rest' },
    'wizard:abjuration:Abjuration Savant': { none: true },
    'wizard:abjuration:Arcane Ward': { text: 'The ward absorbs damage before you. Casting an abjuration spell of 1st level or higher restores twice the spell level' },
    'wizard:abjuration:Projected Ward': { col: 'reaction', text: 'Your Arcane Ward absorbs damage taken by a creature within 30 ft' },
    'wizard:abjuration:Improved Abjuration': { advNote: '' , passive: { advNote: 'Add your proficiency bonus to ability checks made as part of abjuration spells (counterspell, dispel magic)' } },
    'wizard:abjuration:Spell Resistance': { passive: { resist: ['damage from spells'], advNote: 'Saving throws against spells' } },
    'wizard:conjuration:Conjuration Savant': { none: true },
    'wizard:conjuration:Minor Conjuration': { col: 'action', text: 'Conjure a nonmagical object up to 3 ft on a side and 10 lb for 1 hour' },
    'wizard:conjuration:Benign Transposition': { col: 'action', text: 'Teleport up to 30 ft, or swap places with a willing Small or Medium creature; regained after a long rest or casting a conjuration spell' },
    'wizard:conjuration:Focused Conjuration': { passive: { advNote: 'Concentration on conjuration spells can’t be broken by damage' } },
    'wizard:conjuration:Durable Summons': { text: 'Creatures you summon or create with conjuration spells have 30 temporary HP' },
    'wizard:divination:Divination Savant': { none: true },
    'wizard:divination:Portent': { trigger: 'longRest', triggerText: 'Roll your Portent dice for today', roll: '{tier(wizard,2,2,14,3)}d20', rollNote: 'Portent dice — replace any roll you can see with one of these' },
    'wizard:divination:Expert Divination': { text: 'Casting a divination spell of 2nd level or higher regains one expended slot of a lower level (max 5th)' },
    'wizard:divination:The Third Eye': { col: 'action', acts: [
      { name: 'Darkvision 60 ft', col: 'action', use: R('The Third Eye', null, { note: 'Darkvision 60 ft until you rest' }) },
      { name: 'Ethereal Sight', col: 'action', use: R('The Third Eye', null, { note: 'See into the Ethereal Plane within 60 ft' }) },
      { name: 'Greater Comprehension', col: 'action', use: R('The Third Eye', null, { note: 'Read any language' }) },
      { name: 'See Invisibility', col: 'action', use: R('The Third Eye', null, { note: 'See invisible creatures within 10 ft' }) }] },
    'wizard:divination:Greater Portent': { none: true },
    'wizard:enchantment:Enchantment Savant': { none: true },
    'wizard:enchantment:Hypnotic Gaze': { col: 'action', dc: 'spell', save: 'WIS', text: 'Charmed and incapacitated (speed 0) until the end of your next turn; extend with your action' },
    'wizard:enchantment:Instinctive Charm': { col: 'reaction', dc: 'spell', save: 'WIS', text: 'Divert an attack against you to another creature' },
    'wizard:enchantment:Split Enchantment': { text: 'Enchantment spells that target one creature can target a second' },
    'wizard:enchantment:Alter Memories': { text: 'A creature charmed by your spell doesn’t know it was charmed; you can make it forget up to 1 + CHA hours (INT save)' },
    'wizard:evocation:Evocation Savant': { none: true },
    'wizard:evocation:Sculpt Spells': { text: 'Choose 1 + the spell’s level creatures to automatically succeed and take no damage from your evocation spell' },
    'wizard:evocation:Potent Cantrip': { passive: { advNote: 'Creatures that save against your cantrips still take half damage' } },
    'wizard:evocation:Empowered Evocation': { passive: { advNote: 'Add INT to one damage roll of your wizard evocation spells' } },
    'wizard:evocation:Overchannel': { text: 'Maximize damage of a 1st–5th level spell. After the first use per long rest, you take 2d12 necrotic per spell level (more each time)', roll: '2d12', rollNote: 'necrotic per spell level after the first use (ignores resistance)' },
    'wizard:illusion:Illusion Savant': { none: true },
    'wizard:illusion:Improved Minor Illusion': { spells: ['Minor Illusion'] },
    'wizard:illusion:Malleable Illusions': { col: 'action' },
    'wizard:illusion:Illusory Self': { col: 'reaction', text: 'An illusory duplicate makes the attack miss' },
    'wizard:illusion:Illusory Reality': { col: 'bonus' },
    'wizard:necromancy:Necromancy Savant': { none: true },
    'wizard:necromancy:Grim Harvest': { roll: '2', rollNote: 'Regain 2 × spell level HP (3 × for necromancy) when your spell kills', text: 'When a spell of 1st level or higher kills a creature (not construct or undead)' },
    'wizard:necromancy:Undead Thralls': { spells: ['Animate Dead'], passive: { advNote: 'Animate dead raises one extra undead; your undead get +wizard level max HP and +prof damage' } },
    'wizard:necromancy:Inured to Undeath': { passive: { resist: ['necrotic'], advNote: 'Your HP maximum can’t be reduced' } },
    'wizard:necromancy:Command Undead': { col: 'action', dc: 'spell', save: 'CHA' },
    'wizard:transmutation:Transmutation Savant': { none: true },
    'wizard:transmutation:Minor Alchemy': { text: 'Over 10 minutes, change one material (wood, stone, iron, copper, silver) of an object for 1 hour' },
    "wizard:transmutation:Transmuter's Stone": { acts: [
      { name: 'Stone: darkvision', use: R("Transmuter's Stone", null, { note: 'Darkvision 60 ft' }) },
      { name: 'Stone: speed', use: R("Transmuter's Stone", null, { speed: 10 }) },
      { name: 'Stone: CON saves', use: R("Transmuter's Stone", null, { note: 'Proficiency in CON saves' }) },
      { name: 'Stone: resistance', use: R("Transmuter's Stone", null, { note: 'Resistance to acid, cold, fire, lightning or thunder (choose)' }) }] },
    'wizard:transmutation:Shapechanger': { spells: ['Polymorph'], once: true, spellNote: 'On yourself only, a beast of CR 1 or lower, without a slot (once per short rest)' },
    'wizard:transmutation:Master Transmuter': { col: 'action', text: 'Destroy your stone: transmute an object, cure all curses/diseases/poisons and heal fully, raise the dead (raise dead), or reduce apparent age' },
    'wizard:warmagic:Arcane Deflection': { col: 'reaction', acts: [
      { name: '+2 AC', col: 'reaction', use: R('Arcane Deflection', 1, { ac: 2, note: 'Only cantrips until the end of your next turn' }) },
      { name: '+4 to a save', col: 'reaction', text: 'Add 4 to the failed save; only cantrips until the end of your next turn' }] },
    'wizard:warmagic:Tactical Wit': { none: true },
    'wizard:warmagic:Power Surge': { roll: '{floor(wizard/2)}', rollNote: 'extra force damage (once per turn)' },
    'wizard:warmagic:Durable Magic': { passive: { when: 'conc', ac: 2, saveAll: 2 } },
    'wizard:warmagic:Deflecting Shroud': { roll: '{floor(wizard/2)}', rollNote: 'force damage to up to three creatures within 60 ft when you use Arcane Deflection' },
    'wizard:bladesinging:Training in War and Song': { passive: { skillProf: ['Performance'] } },
    'wizard:bladesinging:Bladesong': { col: 'bonus', use: R('Bladesong', 10, { ac: 'max(1,int)', speed: 10, note: 'Advantage on Acrobatics; +INT to concentration saves' }) },
    'wizard:bladesinging:Extra Attack': { none: true },
    'wizard:bladesinging:Song of Defense': { col: 'reaction', onlyWhen: { effect: 'Bladesong' }, text: 'Expend a spell slot to reduce damage by 5 × the slot level' },
    'wizard:bladesinging:Song of Victory': { passive: { effect: 'Bladesong', meleeDmg: 'int' } },
    'wizard:scribes:Wizardly Quill': { col: 'bonus' },
    'wizard:scribes:Awakened Spellbook': { text: 'Swap a spell’s damage type to one from another spell of that level in your book; ritual-cast at normal speed once per long rest' },
    'wizard:scribes:Manifest Mind': { col: 'bonus', text: 'Cast spells as if from your spectral mind (prof times per long rest)' },
    'wizard:scribes:Master Scrivener': { trigger: 'longRest', triggerText: 'Create a scroll of a 1st- or 2nd-level spell from your book (cast one level higher)' },
    'wizard:scribes:One with the Word': { col: 'reaction', passive: { skillAdv: ['Arcana'] }, text: 'Prevent all damage: your book loses spells of total level equal to the damage (3d6)', roll: '3d6', rollNote: 'spell levels lost from the book' },
    // ---- Artificer ----
    'artificer:Magical Tinkering': { col: 'action' },
    'artificer:Spellcasting': { none: true },
    'artificer:Infuse Item': { trigger: 'longRest', triggerText: 'Re-infuse your items', triggerLabel: 'Open Infusions', target: 'infusetab', useLabel: 'Open Infusions' },
    'artificer:The Right Tool for the Job': { use: { rtj: true }, text: '1 hour of work (can be during a short or long rest), with thieves\' or artisan\'s tools in hand' },
    'artificer:Tool Expertise': { passive: { advNote: 'Double your proficiency bonus for checks with tools you’re proficient in' } },
    'artificer:Flash of Genius': { col: 'reaction', roll: 'max(1,int)', rollNote: 'added to a creature’s check or save within 30 ft' },
    'artificer:Magic Item Adept': { none: true },
    'artificer:Spell-Storing Item': { target: 'spellstore', useLabel: 'Store a spell', trigger: 'longRest', triggerLabel: 'Store a spell', triggerText: 'Store a 1st- or 2nd-level artificer spell (1 action to cast) in a weapon or focus — usable 2 × INT times', text: 'Anyone holding it can cast the stored spell with your DC and attack bonus' },
    'artificer:Magic Item Savant': { none: true },
    'artificer:Magic Item Master': { none: true },
    'artificer:Soul of Artifice': { passive: { saveAll: 'attuned' }, trigger: 'zero', triggerText: 'End one of your infusions to drop to 1 HP instead', use: { setHp: 1, removeCond: ['Unconscious'] } },
    'artificer:alchemist:Tool Proficiency': { none: true },
    'artificer:alchemist:Experimental Elixir': { trigger: 'longRest', triggerText: 'Create your Experimental Elixirs', roll: '1d6', rollNote: '1 healing · 2 swiftness · 3 resilience · 4 boldness · 5 flight · 6 transformation' },
    'artificer:alchemist:Alchemical Savant': { passive: { advNote: '+INT to one healing, acid, fire, necrotic or poison roll of spells cast with alchemist’s supplies' } },
    'artificer:alchemist:Restorative Reagents': { spells: ['Lesser Restoration'], spellNote: 'Without a slot (INT mod times per long rest)', text: 'Elixirs you make also grant 2d6 + INT temporary HP', roll: '2d6+int', rollNote: 'temporary HP from the elixir' },
    'artificer:alchemist:Chemical Mastery': { passive: { resist: ['acid', 'poison'], immune: ['poison'], condImmune: ['Poisoned'] }, spells: ['Greater Restoration', 'Heal'], once: true, spellNote: 'Once each per long rest without a slot' },
    'artificer:armorer:Tools of the Trade': { none: true },
    'artificer:armorer:Arcane Armor': { text: 'Your armor ignores STR requirements, is a spellcasting focus, covers you completely and can’t be removed against your will' },
    'artificer:armorer:Armor Model': { none: true },
    'artificer:armorer:Extra Attack': { none: true },
    'artificer:armorer:Armor Modifications': { none: true },
    'artificer:armorer:Perfected Armor': { text: 'Guardian: reaction pull a Huge or smaller creature 30 ft and attack (STR save). Infiltrator: lightning launcher hits make the target glow; next attack has advantage and +1d6 lightning' },
    'artificer:artillerist:Tool Proficiency': { none: true },
    'artificer:artillerist:Eldritch Cannon': { col: 'action', slotRestore: 1, acts: [
      { name: 'Flamethrower', col: 'bonus', roll: '{tier(artificer,3,2,9,3)}d8', rollNote: 'fire in a 15 ft cone (DEX half)', dc: 'spell', save: 'DEX' },
      { name: 'Force Ballista', col: 'bonus', atk: 'spell', roll: '{tier(artificer,3,2,9,3)}d8', rollNote: 'force damage — on a hit the target is pushed up to 5 ft away (ranged spell attack, 120 ft)' },
      { name: 'Protector', col: 'bonus', roll: '1d8+max(1,int)', rollNote: 'temporary HP to each creature within 10 ft' }] },
    'artificer:artillerist:Arcane Firearm': { roll: '1d8', rollNote: 'added to one damage roll of an artificer spell' },
    'artificer:artillerist:Explosive Cannon': { col: 'action', dc: 'spell', save: 'DEX', roll: '3d8', rollNote: 'force when you detonate the cannon (20 ft radius, DEX half)' },
    'artificer:artillerist:Fortified Position': { passive: { advNote: 'Allies within 10 ft of your cannon have half cover; you can have two cannons' } },
    'artificer:battlesmith:Tool Proficiency': { none: true },
    'artificer:battlesmith:Battle Ready': { text: 'Use INT for attack and damage with magic weapons (set the attack’s ability on the Core tab)' },
    'artificer:battlesmith:Steel Defender': { text: 'Your Steel Defender is on the Creatures tab; command it with a bonus action. Deflect Attack (its reaction) imposes disadvantage on an attack' },
    'artificer:battlesmith:Extra Attack': { none: true },
    'artificer:battlesmith:Arcane Jolt': { roll: '{tier(artificer,9,2,15,4)}d6', rollNote: 'force damage, or healing to a creature within 30 ft' },
    'artificer:battlesmith:Improved Defender': { text: 'Arcane Jolt is 4d6; your defender gets +2 AC and its Deflect Attack deals 1d4 + INT force' }
  });
  delete DND.featFx['wizard:abjuration:Improved Abjuration'].advNote;
})();

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

// Feature automation: feats and class options (see tools/FX_SPEC.md).
(function () {
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  Object.assign(DND.featFx, {
    // ---- Feats (ability increases, proficiencies and spells come from the feat data) ----
    'feat:Actor': { passive: { advNote: 'Deception and Performance checks to pass yourself off as someone else' } },
    'feat:Alert': { passive: { advNote: 'Can’t be surprised while conscious; hidden attackers don’t get advantage on you' } },
    'feat:Athlete': { passive: { advNote: 'Standing up costs 5 ft; climbing costs no extra movement; running jumps after 5 ft' } },
    'feat:Dungeon Delver': { passive: { resist: ['damage from traps'], advNote: 'Perception and Investigation checks to find secret doors; saves vs traps' } },
    'feat:Elemental Adept': { none: true },
    'feat:Grappler': { passive: { advNote: 'Attack rolls against a creature you are grappling' } },
    'feat:Heavily Armored': { none: true },
    'feat:Heavy Armor Master': { passive: { advNote: 'In heavy armor: nonmagical bludgeoning, piercing and slashing damage reduced by 3' } },
    'feat:Keen Mind': { none: true },
    'feat:Lightly Armored': { none: true },
    'feat:Linguist': { none: true },
    'feat:Magic Initiate': { text: 'Add your two cantrips and once-per-long-rest 1st-level spell on the Spells tab (For: Feat)' },
    'feat:Martial Adept': { max: '1', reset: 'short', roll: '1d6', rollNote: 'superiority die for your maneuver', dc: 'str|dex' },
    'feat:Medium Armor Master': { passive: { advNote: 'Medium armor doesn’t give disadvantage on Stealth' } },
    'feat:Moderately Armored': { none: true },
    'feat:Mounted Combatant': { passive: { advNote: 'Melee attacks against unmounted creatures smaller than your mount' } },
    'feat:Observant': { none: true },
    'feat:Ritual Caster': { text: 'Add your ritual book spells on the Spells tab (For: Feat); you cast them only as rituals' },
    'feat:Skilled': { none: true },
    'feat:Skulker': { passive: { advNote: 'Missing a ranged attack while hidden doesn’t reveal you; dim light doesn’t hamper your Perception' } },
    'feat:Spell Sniper': { passive: { advNote: 'Spell attack range doubled; ignore half and three-quarters cover' } },
    'feat:Tavern Brawler': { col: 'bonus', attacks: [['Improvised weapon', '1d4', 'bludgeoning', 'str', { notes: 'Proficient with improvised weapons' }]], text: 'After hitting with an unarmed strike or improvised weapon, grapple as a bonus action' },
    'feat:Weapon Master': { none: true },
    'feat:Bountiful Luck': { col: 'reaction', text: 'An ally within 30 ft rolls a 1: they reroll and must use the new roll' },
    'feat:Dragon Fear': { col: 'action', dc: 'cha', save: 'WIS', text: 'Replace a Breath Weapon use: creatures within 30 ft are frightened for 1 minute' },
    'feat:Dragon Hide': { attacks: [['Claws', '1d4', 'slashing', 'str', { notes: 'Dragon Hide' }]] },
    'feat:Drow High Magic': { spells: ['Detect Magic', 'Levitate', 'Dispel Magic'], spellNote: 'Detect magic at will; levitate and dispel magic once per long rest' },
    'feat:Dwarven Fortitude': { col: 'action', text: 'When you take the Dodge action, spend one Hit Die to heal', roll: '1d8+con', healRoll: true, use: { cond: 'Dodging' } },
    'feat:Elven Accuracy': { passive: { advNote: 'With advantage on a DEX/INT/WIS/CHA attack, roll three dice and keep the highest' } },
    'feat:Fade Away': { col: 'reaction', max: '1', reset: 'short', use: { cond: 'Invisible', condRounds: 1 } },
    'feat:Fey Teleportation': { spells: ['Misty Step'], once: true, spellNote: 'Once per short rest without a slot' },
    'feat:Flames of Phlegethos': { passive: { advNote: 'Reroll 1s on fire damage dice; after casting a fire spell, flames deal 1d4 fire to melee attackers' } },
    'feat:Infernal Constitution': { passive: { resist: ['cold', 'poison'], advNote: 'Saves against being poisoned' } },
    'feat:Orcish Fury': { max: '1', reset: 'short', roll: '1d8', rollNote: 'extra weapon damage die', text: 'After Relentless Endurance you can also attack as a reaction' },
    'feat:Prodigy': { none: true },
    'feat:Second Chance': { col: 'reaction', max: '1', reset: 'short', text: 'Force a creature that hit you to reroll the attack' },
    'feat:Squat Nimbleness': { passive: { advNote: 'Escaping grapples (Athletics or Acrobatics)' } },
    'feat:Wood Elf Magic': { spells: ['Longstrider', 'Pass without Trace'], once: true, spellNote: 'Once each per long rest without a slot' },
    'feat:Artificer Initiate': { text: 'Add your artificer cantrip and once-per-long-rest 1st-level spell on the Spells tab (For: Feat)' },
    'feat:Chef': { trigger: 'shortRest', triggerText: 'Cook for your allies: each who spends Hit Dice regains an extra 1d8', roll: '1d8', rollNote: 'extra healing per creature (short rest)', acts: [{ name: 'Treats (temp HP)', use: { temp: 'prof' }, text: 'After a long rest you can make prof-bonus treats; eating one (bonus action) gives temp HP equal to your prof bonus' }] },
    'feat:Crusher': { passive: { advNote: 'Once per turn move a creature you hit with bludgeoning 5 ft; your crits give allies advantage against it' } },
    'feat:Eldritch Adept': { none: true },
    'feat:Fighting Initiate': { none: true },
    'feat:Gunner': { passive: { advNote: 'Loading ignored for firearms; no disadvantage in melee range' } },
    'feat:Metamagic Adept': { max: '2', reset: 'long', text: 'Two sorcery points for your two Metamagic options' },
    'feat:Piercer': { roll: '1d4', rollNote: 'Reroll one piercing damage die once per turn; crits add one extra damage die', passive: { advNote: 'Piercing crits roll one extra damage die' } },
    'feat:Poisoner': { col: 'bonus', dc: 'int', save: 'CON', roll: '2d8', rollNote: 'poison damage from a coated weapon (poisoned until end of your next turn)', passive: { advNote: 'Your poison damage ignores resistance' } },
    'feat:Shadow Touched': { text: 'Invisibility and your chosen 1st-level spell once each per long rest without a slot (add them on the Spells tab)', spells: ['Invisibility'], once: true },
    'feat:Skill Expert': { none: true },
    'feat:Slasher': { passive: { advNote: 'Once per turn a slashing hit reduces speed by 10 ft; crits give the target disadvantage on attacks' } },
    'feat:Telekinetic': { col: 'bonus', spells: ['Mage Hand'], spellNote: 'Invisible; range +30 ft', dc: 'int', save: 'STR', text: 'Shove a creature within 30 ft 5 ft toward or away from you' },
    'feat:Telepathic': { spells: ['Detect Thoughts'], once: true, spellNote: 'Once per long rest without a slot', text: 'Speak telepathically to a creature within 60 ft' },
    'feat:Gift of the Chromatic Dragon': { acts: [
      { name: 'Chromatic Infusion', col: 'bonus', use: R('Chromatic Infusion', 10, { dmgDice: '1d4 (chosen element)' }) },
      { name: 'Reactive Resistance', col: 'reaction', text: 'Resistance to the triggering acid, cold, fire, lightning or poison damage (prof times per long rest)' }] },
    'feat:Gift of the Gem Dragon': { col: 'reaction', dc: 'int', save: 'STR', roll: '2d8', rollNote: 'force damage and push 10 ft (Telekinetic Reprisal)' },
    'feat:Gift of the Metallic Dragon': { spells: ['Cure Wounds'], once: true, spellNote: 'Once per long rest without a slot', acts: [{ name: 'Protective Wings', col: 'reaction', roll: 'prof', rollNote: 'added to your or an ally’s AC against the attack' }] },
    'feat:Ember of the Fire Giant': { passive: { resist: ['fire'] }, col: 'action', dc: 'con', save: 'DEX', roll: '1d8+prof', rollNote: 'fire in a 15 ft radius (replace an attack); blinded on a failed save' },
    'feat:Fury of the Frost Giant': { passive: { resist: ['cold'] }, col: 'reaction', dc: 'con', save: 'STR', roll: '1d8+prof', rollNote: 'cold damage to an attacker within 30 ft; speed 0 on a failed save' },
    'feat:Guile of the Cloud Giant': { col: 'reaction', passive: { advNote: 'Cloudy Escape: when hit, gain resistance and teleport 30 ft (prof times per long rest)' }, use: { cond: 'Invisible', condRounds: 1 } },
    'feat:Keenness of the Stone Giant': { passive: { sense: 'Darkvision 60 ft (or +60 ft)' }, col: 'bonus', dc: 'con', save: 'STR', roll: '1d10+prof', rollNote: 'force when you hurl a stone (60 ft, prone on fail)' },
    'feat:Rune Shaper': { text: 'Inscribe a rune to cast its spell once per long rest without a slot' },
    'feat:Soul of the Storm Giant': { col: 'bonus', use: R('Maelstrom Aura', 1, { note: 'Resistance to lightning and thunder; creatures in 10 ft have disadvantage on attacks vs you; your attacks reduce their speed' }) },
    'feat:Strike of the Giants': { roll: '1d6', rollNote: 'extra damage of your giant’s type (once per turn, prof times per long rest)', dc: 'str|dex' },
    'feat:Vigor of the Hill Giant': { passive: { advNote: 'Bulwark: saves to avoid being pushed or knocked prone' }, text: 'When you take the Dodge action, you also regain HP equal to CON mod + prof (bonus action)', roll: 'con+prof', healRoll: true },
    'feat:Aberrant Dragonmark': { text: 'Your aberrant spell once per long rest; casting it can roll a Hit Die for temp HP or damage', roll: '1d8', rollNote: 'Hit Die: on an even number gain it as temp HP, on odd deal it as force damage to a creature within 30 ft' }
  });
  // ---- Fighting styles (Archery, Defense, Dueling are calculated by the sheet) ----
  setOpt('fightingStyle', 'Dueling', { none: true });
  setOpt('fightingStyle', 'Great Weapon Fighting', { passive: { advNote: 'Reroll 1s and 2s on two-handed melee damage dice' } });
  setOpt('fightingStyle', 'Superior Technique', { max: '1', reset: 'short', roll: '1d6', rollNote: 'superiority die', text: 'You know one maneuver' });
  setOpt('fightingStyle', 'Thrown Weapon Fighting', { passive: { advNote: '+2 damage with thrown weapon attacks' } });
  setOpt('fightingStyle', 'Two-Weapon Fighting', { passive: { advNote: 'Add your ability modifier to off-hand attack damage' } });
  setOpt('fightingStyle', 'Unarmed Fighting', { attacks: [['Unarmed strike (style)', '1d6', 'bludgeoning', 'str', { notes: '1d8 if both hands are free; grappled creatures take 1d4 at the start of your turn' }]] });
  setOpt('fightingStyle', 'Blessed Warrior', { text: 'Add two cleric cantrips on the Spells tab (CHA)' });
  setOpt('fightingStyle', 'Druidic Warrior', { text: 'Add two druid cantrips on the Spells tab (WIS)' });
  // ---- Pact boons ----
  setOpt('pactBoon', 'Pact of the Blade', { col: 'action', attacks: [['Pact weapon', '1d8', 'slashing', 'str', { notes: 'Change the weapon and damage to your chosen form; counts as magical' }]] });
  setOpt('pactBoon', 'Pact of the Talisman', { col: 'reaction', max: 'prof', reset: 'long', roll: '1d4', rollNote: 'added to a failed ability check' });
  // ---- Invocations ----
  const inv = (n, fx) => setOpt('invocation', n, fx);
  inv('Agonizing Blast', { none: true });
  inv('Aspect of the Moon', { none: true });
  inv('Bond of the Talisman', { col: 'action', max: 'prof', reset: 'long', text: 'Teleport to the talisman’s wearer (or they to you)' });
  inv('Cloak of Flies', { col: 'bonus', max: '1', reset: 'short', use: R('Cloak of Flies', null, { note: 'Advantage on Intimidation, disadvantage on other CHA checks; creatures starting their turn within 5 ft take CHA mod poison damage' }) });
  inv('Eldritch Mind', { passive: { advNote: 'Constitution saves to maintain concentration' } });
  inv('Eldritch Smite', { col: 'action', roll: '{1+pactslot}d8', rollNote: 'force (1d8 + 1d8 per pact slot level) — spends a pact slot; Huge or smaller knocked prone', text: 'Spend a pact slot on a pact-weapon hit' });
  inv('Eldritch Spear', { none: true });
  inv('Eyes of the Rune Keeper', { none: true });
  inv('Far Scribe', { none: true });
  inv('Gaze of Two Minds', { col: 'bonus', text: 'Perceive through a willing humanoid’s senses' });
  inv('Ghostly Gaze', { col: 'action', max: '1', reset: 'short', use: { effect: { name: 'Ghostly Gaze', rounds: 10, conc: true, buff: { note: 'See through solid objects within 30 ft; darkvision' } } } });
  inv('Gift of the Ever-Living Ones', { passive: { advNote: 'Healing dice are maximized while your familiar is within 100 ft' } });
  inv('Gift of the Protectors', { trigger: 'zero', triggerText: 'A creature named in your Book of Shadows drops to 1 HP instead (once per long rest)' });
  inv('Grasp of Hadar', { none: true });
  inv('Improved Pact Weapon', { text: 'Your pact weapon gets +1 to attack and damage (set Magic +1 on the attack)' });
  inv('Investment of the Chain Master', { none: true });
  inv('Lance of Lethargy', { none: true });
  inv('Lifedrinker', { passive: { everyHit: 'CHA mod necrotic (pact weapon)' } });
  inv('Maddening Hex', { col: 'bonus', roll: 'max(1,cha)', rollNote: 'psychic to your hexed/cursed target and each creature within 5 ft of it' });
  inv('One with Shadows', { col: 'action', use: { cond: 'Invisible' }, text: 'In dim light or darkness, until you move or act' });
  inv('Protection of the Talisman', { max: 'prof', reset: 'long', roll: '1d4', rollNote: 'added to a failed saving throw' });
  inv('Rebuke of the Talisman', { col: 'reaction', roll: 'prof', rollNote: 'psychic to the attacker of the talisman’s wearer; push 10 ft' });
  inv('Relentless Hex', { col: 'bonus', text: 'Teleport up to 30 ft to a space next to your cursed/hexed target' });
  inv('Repelling Blast', { text: 'Each eldritch blast beam that hits pushes the target 10 ft' });
  inv('Tomb of Levistus', { col: 'reaction', max: '1', reset: 'short', use: Object.assign(R('Tomb of Levistus', 1, { note: 'Encased in ice: speed 0, incapacitated; vulnerable to fire' }), { temp: '10*warlock' }) });
  inv('Voice of the Chain Master', { none: true });
  inv('Witch Sight', { passive: { sense: 'See the true form of shapechangers and illusions within 30 ft' } });
  // ---- Artificer infusions (they affect the infused item; the effect is noted here) ----
  const inf = (n, fx) => setOpt('infusion', n, fx);
  inf('Arcane Propulsion Armor', { attacks: [['Armor gauntlets', '1d8', 'force', 'str', { notes: 'Thrown 20/60, return to the armor' }]], passive: { speed: 5 } });
  inf('Armor of Magical Strength', { col: 'reaction', max: '4', reset: 'long', text: 'Spend a charge: add INT to a STR check or save, or avoid being knocked prone' });
  inf('Boots of the Winding Path', { col: 'bonus', text: 'Teleport up to 15 ft to a space you occupied this turn' });
  inf('Enhanced Arcane Focus', { text: '+1 to spell attack rolls (+2 at 10th); ignore half cover' });
  inf('Enhanced Defense', { text: '+1 AC on the infused armor or shield (+2 at 10th) — set it as the item’s magic bonus' });
  inf('Enhanced Weapon', { text: '+1 attack and damage (+2 at 10th) — set Magic on the weapon’s attack' });
  inf('Helm of Awareness', { passive: { initAdv: true, advNote: 'Can’t be surprised while not incapacitated' } });
  inf('Homunculus Servant', { none: true });
  inf('Mind Sharpener', { col: 'reaction', max: '4', reset: 'long', text: 'When you fail a concentration save, spend a charge to succeed' });
  inf('Radiant Weapon', { col: 'reaction', max: '4', reset: 'long', dc: 'spell', save: 'CON', text: '+1 to attack and damage; reaction when hit: blind the attacker' });
  inf('Repeating Shot', { text: '+1 attack and damage; ignores loading and makes its own ammunition' });
  inf('Replicate Magic Item', { none: true });
  inf('Repulsion Shield', { col: 'reaction', max: '4', reset: 'long', text: '+1 AC; push a melee attacker 15 ft' });
  inf('Resistant Armor', { text: 'Resistance to one damage type while wearing the armor' });
  inf('Returning Weapon', { text: '+1 attack and damage; returns after a thrown attack' });
  inf('Spell-Refueling Ring', { col: 'action', max: '1', reset: 'long', use: { recoverSlots: { total: 3, maxLevel: 3 } } });
  // ---- Totem aspects without numbers ----
  setOpt('totemAspect', 'Elk', { none: true });
  setOpt('totemAspect', 'Tiger', { text: 'Gain proficiency in two of Athletics, Acrobatics, Stealth and Survival (add them on the Core tab)' });
  setOpt('totemAspect', 'Wolf', { none: true });
})();

// Feature automation for Unearthed Arcana content defined in ua_classes_a.js (UA subclasses for existing classes,
// incl. Mages of Strixhaven), ua_races.js (UA races/subraces) and ua_misc.js (UA feats and fighting styles).
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const X = {};
  // Only set when nothing else (e.g. fx_races) already covers a trait name shared with printed races.
  const soft = (k, fx) => { if (!DND.featFx[k]) X[k] = fx; };

  // ======================= ARTIFICER: Archivist =======================
  Object.assign(X, {
    'artificer:uaarchivist:Tools of the Trade': { none: true },
    'artificer:uaarchivist:Artificial Mind': { col: 'action', text: 'Awaken a Tiny item as your spectral mind (darkvision 60 ft); cast artificer spells as if from its space' },
    'artificer:uaarchivist:Information Overload': { col: 'action', dc: 'spell', save: 'INT', roll: '1d8+{artificer>=5?max(1,int):0}', rollNote: 'psychic (+2d8 for a 1st-level slot, +1d8 per level above); next attack against it has advantage' },
    'artificer:uaarchivist:Mind Network': { none: true },
    'artificer:uaarchivist:Psychic Damage': { text: 'Psychic damage from artificer spells and Information Overload: +{max(1,int)}' },
    'artificer:uaarchivist:Mind Overload': { dc: 'spell', save: 'INT', text: 'On a failed save the target is stunned until the end of your next turn' },
    'artificer:uaarchivist:Infoportation': { text: 'Teleport to a space within 5 ft of your spectral mind or an infused item (again by spending a 2nd-level or higher slot)' }
  });

  // ======================= BARBARIAN: Path of the Wild Soul =======================
  const surgeActs = [
    { name: 'Surge 1: Necrotic burst', onlyRaging: true, roll: '1d10', rollNote: 'necrotic to creatures within 30 ft; you gain that many temp HP' },
    { name: 'Surge 2: Teleport', col: 'bonus', onlyRaging: true, text: 'Teleport up to 20 ft' },
    { name: 'Surge 3: Flumph explodes', onlyRaging: true, dc: 'con', save: 'DEX', roll: '2d8', rollNote: 'force (DEX save negates)' },
    { name: 'Surge 4: Arcane armor', onlyRaging: true, use: R('Wild Surge: Arcane armor', 10, { ac: 2, note: 'Creatures that hit you take force damage equal to your CON mod' }) },
    { name: 'Surge 8: Radiant line', onlyRaging: true, dc: 'con', save: 'CON', roll: '2d8', rollNote: 'radiant in a 60-ft line (CON save or blinded)' }];
  Object.assign(X, {
    'barbarian:uawildsoul:Lingering Magic': { spells: ['Detect Magic'], spellCls: 'other', spellNote: 'No slot or components; CON mod times per long rest' },
    'barbarian:uawildsoul:Wild Surge': { dc: 'con', roll: '1d8', rollNote: 'Wild Surge table (roll when you rage)', acts: surgeActs },
    'barbarian:uawildsoul:Magic Reserves': { roll: '1d{tier(barbarian,6,4,14,6)}', rollNote: 'slot level regained, or 5 × roll temp HP; you take 5 × roll force damage' },
    'barbarian:uawildsoul:Arcane Rebuke': { onlyRaging: true, roll: '3d6', rollNote: 'force damage to the creature that forced the save' },
    'barbarian:uawildsoul:Chaotic Fury': { onlyRaging: true, roll: '1d8', rollNote: 'new Wild Surge effect (replaces the current one)' }
  });

  // ======================= BARD: College of Satire =======================
  Object.assign(X, {
    'bard:uasatire:Bonus Proficiencies': { passive: { skillProf: ['Sleight of Hand'] } },
    'bard:uasatire:Tumbling Fool': { dash: true, use: R('Tumbling Fool', 1, { note: 'Disengage; climb speed equal to speed; half damage from falls' }) },
    "bard:uasatire:Fool's Insight": { spells: ['Detect Thoughts'], spellNote: 'No slot; CHA mod times per long rest', dc: 'spell', save: 'WIS' },
    "bard:uasatire:Fool's Luck": { cost: { from: 'Bardic Inspiration', n: 1 }, roll: '1bi', rollNote: 'added to your failed check, save or attack' }
  });

  // ======================= CLERIC =======================
  const DS = t => ({ col: 'action', roll: '{tier(cleric,8,1,14,2)}d8', rollNote: t + ', once per turn on a weapon hit' });
  Object.assign(X, {
    // City Domain
    'cleric:uacity:Bonus Proficiencies': { spells: ['On/Off'] },
    'cleric:uacity:Heart of the City': { text: 'Advantage on one Deception, Intimidation or Persuasion check in a city' },
    'cleric:uacity:Channel Divinity: Spirits of the City': { dc: 'spell', save: 'Athletics or Acrobatics check to escape', text: 'Control utilities and machines within 30 ft, or knock a creature prone or restrain it' },
    'cleric:uacity:Block Watch': { passive: { advNote: 'In a city: proficiency (double bonus) in Insight and Perception' } },
    'cleric:uacity:Divine Strike': DS('psychic'),
    'cleric:uacity:Express Transit': { text: 'Teleport between two mass-transit stops in the same city' },
    // Protection Domain
    'cleric:uaprotection:Bonus Proficiency': { none: true },
    'cleric:uaprotection:Shield of the Faithful': { text: 'Impose disadvantage on an attack against a creature within 5 ft of you' },
    'cleric:uaprotection:Channel Divinity: Radiant Defense': { roll: '2d10+cleric', rollNote: 'radiant to the first creature that hits the warded ally (1 minute)' },
    'cleric:uaprotection:Blessed Healer': { roll: '2', rollNote: '+ the spell’s level: HP you regain after healing another creature with a slot', healRoll: true },
    'cleric:uaprotection:Divine Strike': DS('radiant'),
    'cleric:uaprotection:Indomitable Defense': { col: 'action', passive: { resist: ['two of bludgeoning, necrotic, piercing, radiant, slashing (chosen on a rest)'] }, text: 'Transfer one of the resistances to a creature you touch until your next rest' },
    // Unity Domain
    'cleric:uaunity:Emboldening Bond': { use: R('Emboldening Bond', 600, { note: 'Bonded pair within 30 ft: once per turn add 1d4 to an attack, check or save' }),
      acts: [{ name: 'Bond die', roll: '1d4', rollNote: 'added to an attack, check or save (once per turn)' }] },
    'cleric:uaunity:Channel Divinity: Shared Burden': { text: 'Split the damage between the target and up to {max(1,wis)} willing creatures within 30 ft (each takes at least 1)' },
    'cleric:uaunity:Protective Bond': { col: 'reaction', text: 'A bonded creature uses its reaction to give the other resistance to the triggering damage' },
    'cleric:uaunity:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:uaunity:Enduring Unity': { use: R('Enduring Unity', 10, { atkAdv: 'Enduring Unity', note: 'Partner at 0 HP: advantage on attacks, checks and saves; resistance to all damage; spend Hit Dice to heal them' }) },
    // Fate Domain
    'cleric:uafate:Omens and Portents': { spells: ['Augury'], spellNote: 'Once per long rest without a slot or components' },
    'cleric:uafate:Ties That Bind': { dc: 'spell', save: 'WIS (to refuse)', roll: '1d6', rollNote: 'added once per turn to damage or healing your spell deals the bound creature' },
    'cleric:uafate:Channel Divinity: Strands of Fate': { use: R('Strands of Fate', 10, { note: 'Reaction: give advantage or disadvantage on an attack or check you can see' }) },
    'cleric:uafate:Insightful Striking': { roll: '1d6', rollNote: 'added to your next attack against it, or subtracted from its next save vs your spell' },
    'cleric:uafate:Potent Spellcasting': { passive: { cantripDmg: 'wis' } },
    'cleric:uafate:Visions of the Future': { spells: ['Foresight'], spellNote: 'Once per long rest without a slot (lasts 1 minute)',
      use: R('Foresight', 10, { atkAdv: 'Foresight', note: 'Advantage on attacks, checks and saves; attacks against you have disadvantage' }) }
  });

  // ======================= DRUID: Circle of Twilight =======================
  const scythe = [];
  for (let n = 1; n <= 10; n++) scythe.push({ name: n + 'd10', cost: { from: "Harvest's Scythe", n }, roll: n + 'd10', rollNote: 'necrotic; if it kills a hostile creature, heal 2 HP per die (5 per die vs undead)', min: 2 * n });
  Object.assign(X, {
    "druid:uatwilight:Harvest's Scythe": { acts: scythe },
    'druid:uatwilight:Speech Beyond the Grave': { spells: ['Speak with Dead'], spellNote: 'Once per short rest without a slot or material components' },
    'druid:uatwilight:Watcher at the Threshold': { passive: { resist: ['necrotic', 'radiant'], advNote: 'Allies within 30 ft: death saves' } },
    'druid:uatwilight:Paths of the Dead': { spells: ['Etherealness'], spellNote: 'Once per short rest without a slot' }
  });

  // ======================= FIGHTER =======================
  const SD = '1d{tier(fighter,3,8,10,10,18,12)}';
  const relentless = { trigger: 'initiative', triggerText: 'If you have no superiority dice left, regain one.', triggerLabel: 'Regain a die', use: { regain: { from: 'Combat Superiority', n: 1 } } };
  Object.assign(X, {
    // Brute
    'fighter:uabrute:Brute Force': { roll: '1d{tier(fighter,3,4,10,6,16,8,20,10)}', rollNote: 'extra damage on every weapon hit with a proficient weapon' },
    'fighter:uabrute:Brutish Durability': { roll: '1d6', rollNote: 'added to a saving throw (a death save of 20+ counts as a 20)' },
    'fighter:uabrute:Additional Fighting Style': { none: true },
    'fighter:uabrute:Devastating Critical': { roll: '{fighter}', rollNote: 'extra damage on a weapon critical hit' },
    'fighter:uabrute:Survivor': { onlyWhen: { hpBelowHalf: true }, use: { heal: '5+con' }, text: 'Start of each turn at half HP or less (but above 0)' },
    // Knight
    'fighter:uaknight:Born to the Saddle': { passive: { advNote: 'Saves to avoid falling off your mount' } },
    'fighter:uaknight:Implacable Mark': { text: 'Melee attack with advantage against the marked creature; on a hit +{fighter} damage' },
    'fighter:uaknight:Noble Cavalry': { none: true },
    'fighter:uaknight:Hold the Line': { text: 'On a hit: +{floor(fighter/2)} damage and its speed becomes 0 this turn' },
    'fighter:uaknight:Rapid Strike': { col: 'bonus', text: 'Give up advantage on one attack to make an extra weapon attack against the same target' },
    "fighter:uaknight:Defender's Blade": { passive: { acHeavy: 1 }, text: 'Opportunity attacks without your reaction (once per turn)' },
    // Monster Hunter
    'fighter:uamonsterhunter:Bonus Proficiencies': { none: true },
    'fighter:uamonsterhunter:Combat Superiority': { resource: true, acts: [
      { name: 'Attack bonus', cost: true, roll: SD, rollNote: 'added to the attack roll' },
      { name: 'Damage', cost: true, roll: SD, rollNote: 'extra damage; target has disadvantage on its next concentration save' },
      { name: 'Perception/Insight', cost: true, roll: SD, rollNote: 'added to the check' },
      { name: 'INT/WIS/CHA save', cost: true, roll: SD, rollNote: 'added to the save' }] },
    "fighter:uamonsterhunter:Hunter's Mysticism": { spells: ['Detect Magic', 'Protection from Evil and Good'], spellCls: 'other', spellNote: 'Detect magic as a ritual; protection from evil and good once per long rest' },
    'fighter:uamonsterhunter:Monster Slayer': { acts: [{ name: 'Two dice on damage', cost: { from: 'Combat Superiority', n: 2 }, roll: '2d{tier(fighter,3,8,10,10,18,12)}', rollNote: 'extra damage (maximum vs aberrations, fey, fiends and undead)' }] },
    'fighter:uamonsterhunter:Relentless': relentless,
    // Sharpshooter
    'fighter:uasharpshooter:Steady Aim': { use: R('Steady Aim', 1, { dmg: '2+floor(fighter/2)', note: 'Ranged attacks vs the aimed target only: ignore half and three-quarters cover' }) },
    'fighter:uasharpshooter:Careful Eyes': { col: 'bonus', text: 'Take the Search action' },
    'fighter:uasharpshooter:Close-Quarters Shooting': { none: true },
    'fighter:uasharpshooter:Rapid Strike': { col: 'bonus', text: 'Give up advantage on one attack to make an extra weapon attack against the same target' },
    'fighter:uasharpshooter:Snap Shot': { trigger: 'initiative', triggerText: 'First turn of combat: the Attack action gets one extra ranged weapon attack.', triggerLabel: 'OK' },
    // Scout
    'fighter:uascout:Bonus Proficiencies': { none: true },
    'fighter:uascout:Combat Superiority': { resource: true, acts: [
      { name: 'Attack bonus', cost: true, roll: SD, rollNote: 'added to the attack roll' },
      { name: 'Skill check', cost: true, roll: SD, rollNote: 'add half (round down) to Athletics, Nature, Perception, Stealth or Survival' },
      { name: 'Defensive', col: 'reaction', cost: true, onlyWhen: { armor: 'notHeavy' }, roll: SD, rollNote: 'added to AC against the hit; half damage if it still hits' }] },
    'fighter:uascout:Natural Explorer': { none: true },
    'fighter:uascout:Relentless': relentless
  });

  // ======================= MONK: Way of Tranquility =======================
  Object.assign(X, {
    'monk:uatranquility:Path of Tranquility': { dc: 'wis', save: 'WIS', use: R('Sanctuary (Path of Tranquility)', 4800, { note: 'Attackers must make a WIS save; ends if you attack or cast a spell on a hostile creature' }) },
    'monk:uatranquility:Healing Hands': { acts: [{ name: 'Cure disease/poison', col: 'action', cost: { from: 'Healing Hands', n: 5 }, text: 'Cure one disease or neutralize one poison' }] },
    'monk:uatranquility:Emissary of Peace': { passive: { advNote: 'CHA checks to calm violence or counsel peace' } },
    'monk:uatranquility:Douse the Flames of War': { dc: 'wis', save: 'WIS', text: 'Auto-success if it took damage this turn; it can’t attack or cast damaging spells for 1 minute' },
    'monk:uatranquility:Anger of a Gentle Soul': { use: R('Anger of a Gentle Soul', 2, { dmg: 'monk', note: 'Until the end of your next turn' }) }
  });

  // ======================= ROGUE: Revived =======================
  Object.assign(X, {
    'rogue:uarevived:Tokens of Past Lives': { trigger: 'longRest', triggerText: 'Choose one skill or tool proficiency until your next long rest.', triggerLabel: 'OK' },
    'rogue:uarevived:Revived Nature': { passive: { resist: ['poison'], advNote: 'Saves against disease and poison' } },
    'rogue:uarevived:Bolts from the Grave': { roll: '{ceil(rogue/2)}d6', rollNote: 'necrotic (ranged spell attack, 30 ft, DEX; uses your Sneak Attack this turn)' },
    'rogue:uarevived:Connect with the Dead': { spells: ['Speak with Dead'], spellCls: 'other', spellNote: 'INT; once per short rest without a slot' },
    'rogue:uarevived:Audience with Death': { passive: { advNote: 'Death saving throws' } },
    'rogue:uarevived:Ethereal Jaunt': { text: 'With Cunning Action, also teleport up to 30 ft (no line of sight needed)' }
  });

  // ======================= MAGES OF STRIXHAVEN =======================
  const SPMOD = { bard: 'cha', warlock: 'cha', sorcerer: 'cha', wizard: 'int', druid: 'wis' };
  const strix = (cls, sub, map) => { if (DND.classes[cls] && DND.classes[cls].subclasses['uamage' + sub]) Object.entries(map).forEach(([n, fx]) => { X[cls + ':uamage' + sub + ':' + n] = fx; }); };
  ['bard', 'warlock', 'wizard'].forEach(c => strix(c, 'lorehold', {
    'Lorehold Spells': { none: true },
    'Ancient Companion': { text: 'Statue spirit: {5+5*' + c + '} HP, AC 14 (16 Warrior); acts after you. Spend a slot to heal it 10 HP per slot level' },
    'Lessons of the Past': { text: 'Healer: more max HP and healing · Sage: advantage on knowledge checks, extra force damage once per turn · Warrior: weapon attack after a radiant cantrip' },
    'War Echoes': { dc: 'spell', save: 'WIS', text: 'Failed save: vulnerable to one damage type until the end of your next turn' },
    "History's Whims": { use: R("History's Whims", 10, { note: 'Each turn choose Luck (save bonus vs damage), Resistance (physical damage) or Swiftness (more movement)' }) }
  }));
  ['druid', 'sorcerer', 'wizard'].forEach(c => strix(c, 'prismari', {
    'Creative Skills': { none: true },
    'Kinetic Artistry': { resource: true, acts: [
      { name: 'Boreal Sweep', col: 'bonus', cost: true, dash: true, dc: 'spell', save: 'STR', text: 'Dash; walk on water this turn; nearby creatures STR save or prone' },
      { name: 'Scorching Whirl', col: 'bonus', cost: true, dash: true, dc: 'spell', save: 'DEX', roll: '1d4+' + SPMOD[c], rollNote: 'fire to creatures within 5 ft (DEX save negates)' },
      { name: 'Thunderlight Jaunt', col: 'bonus', cost: true, dash: true, text: 'Dash; move through creatures without provoking opportunity attacks' }] },
    'Favored Medium': { passive: { resist: ['your Favored Medium (cold, fire or lightning)'] }, text: 'Allies within 5 ft gain the same resistance when you cast a spell of that type' },
    'Focused Expression': { roll: '1d6', rollNote: 'extra Favored Medium damage (plus slow, burn or shock effect)' },
    'Impeccable Physicality': { passive: { saveProf: ['dex'] }, text: 'A d20 roll of 9 or lower on a DEX save counts as 10' }
  }));
  ['sorcerer', 'wizard'].forEach(c => strix(c, 'quandrix', {
    'Quandrix Spells': { none: true },
    'Functions of Probability': { acts: [
      { name: 'Diminishing', dc: 'spell', save: 'WIS', roll: '1d6', rollNote: 'subtracted from its next attack roll on a failed save' },
      { name: 'Supplemental', roll: '1d6', rollNote: 'an ally adds it to an attack or save' }] },
    'Velocity Shift': { dc: 'spell', save: 'CHA', text: 'Failed save: teleport it to an unoccupied space within 30 ft' },
    'Null Equation': { dc: 'spell', save: 'CON', text: 'Failed save: disadvantage on STR/DEX saves and half weapon damage until your next turn' },
    'Quantum Tunneling': { passive: { resist: BPS }, roll: '1d10', rollNote: 'force per 5 ft moved through creatures or objects' }
  }));
  ['bard', 'warlock', 'wizard'].forEach(c => strix(c, 'silverquill', {
    'Eloquent Apprentice': { none: true },
    'Silvery Barbs': { text: 'Target rerolls and keeps the lower; an ally can then reroll one d20 within 1 minute' },
    'Inky Shroud': { spells: ['Darkness'], spellNote: 'Once per long rest free; you see through it', roll: '2d10', rollNote: 'psychic to a creature starting its turn in the darkness' },
    'Infusion of Eloquence': { text: 'Spell damage becomes psychic (target frightened) or radiant (target charmed) until your next turn, +{prof} damage' },
    'Word of Power': { acts: [{ name: 'Selfless Invocation', col: 'reaction', text: 'Give a creature resistance to one instance of damage; you take psychic damage equal to what it takes' }], text: 'Or Deadly Despair: Silvery Barbs makes the target vulnerable to your next damage' }
  }));
  ['druid', 'warlock'].forEach(c => strix(c, 'witherbloom', {
    'Witherbloom Spells': { none: true },
    'Essence Tap': { resource: true, acts: [
      { name: 'Overgrowth', col: 'bonus', cost: true, use: R('Essence Tap: Overgrowth', 10, { note: 'Bonus action: spend a Hit Die to heal (roll + spell mod)' }) },
      { name: 'Overgrowth heal', col: 'bonus', onlyWhen: { effect: 'Essence Tap: Overgrowth' }, roll: '1d8+' + SPMOD[c], rollNote: 'healing (spend a Hit Die)', healRoll: true },
      { name: 'Withering Strike', col: 'bonus', cost: true, use: R('Essence Tap: Withering Strike', 10, { note: 'Your damage is necrotic and ignores resistance' }) }] },
    'Witherbloom Brew': { text: 'Brew potions (24 hours): Fortifying (resistance), Quickening (healing and end a condition) or Toxifying (poisoned weapon)' },
    'Witherbloom Adept': { text: 'Once per turn, a necrotic-damage or healing spell deals or restores +{prof} to one target' },
    'Withering Vortex': { text: 'An ally within 30 ft regains HP equal to half the necrotic damage dealt' }
  }));

  // ======================= RACES =======================
  Object.assign(X, {
    'race:Relentless Nature': { onlyWhen: { hpBelowHalf: true }, use: { heal: '1' }, text: 'Start of your turn below half HP: regain 1 HP' },
    'race:Human Revenant': { none: true },
    'race:Necrotic Ancestry': { passive: { resist: ['necrotic'] }, text: 'Breath weapon deals necrotic damage' },
    'race:Tiefling Revenant': { none: true },
    'race:Grugach Weapon Training': { none: true },
    'race:Sylvan Tongue': { none: true },
    'race:Lashing Tail': { col: 'reaction', roll: '1d4+str', rollNote: 'slashing (tail strike against a creature that hit you in melee)' },
    'race:Wiry Frame': { none: true },
    'race:Construct': { none: true },
    'race:Armored Plating': { none: true },
    'race:Balance Chaos': { text: 'Treat an attack roll or save of 9 or lower as a 10' },
    'race:Living Construct': { none: true },
    'race:Ordered Mind': { passive: { skillAdv: ['Insight'], advNote: 'Saves against being charmed or to end it' } },
    'race:Vestigial Wings': { use: R('Vestigial Wings', 1, { fly: 'walk', note: 'You fall if still aloft at the end of your turn' }) }
  });
  soft('race:Flight', { none: true });
  soft('race:Cantrip', { none: true });
  soft('race:Bite', { none: true });

  // ======================= FEATS =======================
  Object.assign(X, {
    'feat:Acrobat': { col: 'bonus', text: 'DC 15 Acrobatics check: ignore difficult terrain until the end of the turn' },
    'feat:Alchemist': { col: 'action', text: 'Identify a potion by handling it; potions of healing you brew or use heal the maximum' },
    'feat:Animal Handler': { col: 'bonus', text: 'Command a friendly beast within 60 ft that can hear you' },
    'feat:Arcanist': { spells: ['Prestidigitation', 'Detect Magic'], spellCls: 'other', spellNote: 'Detect magic once per long rest without a slot (INT)', max: '1', reset: 'long' },
    'feat:Brawny': { passive: { carry: 2 } },
    'feat:Burglar': { none: true },
    'feat:Diplomat': { text: 'Persuasion vs Insight after 1 minute of talking: charmed while you stay within 60 ft (and 1 minute after)' },
    'feat:Empathic': { col: 'action', text: 'Insight vs Deception: advantage on attacks and checks against it until the end of your next turn' },
    'feat:Historian': { text: 'Help action + DC 15 History: the helped creature also adds +{prof}' },
    'feat:Investigator': { col: 'bonus', text: 'Take the Search action' },
    'feat:Medic': { trigger: 'shortRest', triggerText: 'Tend up to six creatures: each one spending Hit Dice regains the maximum instead of rolling.', triggerLabel: 'OK' },
    'feat:Menacing': { col: 'action', text: 'Replace one attack: Intimidation vs Insight, frightened of you until the end of your next turn' },
    'feat:Naturalist': { spells: ['Druidcraft', 'Detect Poison and Disease'], spellCls: 'other', spellNote: 'Detect poison and disease once per long rest without a slot (INT)', max: '1', reset: 'long' },
    'feat:Perceptive': { none: true },
    'feat:Performer': { none: true },
    'feat:Quick-Fingered': { col: 'bonus', text: 'Make a Sleight of Hand check' },
    'feat:Silver-Tongued': { col: 'action', text: 'Replace one attack: Deception vs Insight; no opportunity attacks from it and advantage on your next attack against it this turn' },
    'feat:Stealthy': { none: true },
    'feat:Survivalist': { spells: ['Alarm'], spellCls: 'other', once: true, spellNote: 'Once per long rest without a slot' },
    'feat:Theologian': { spells: ['Thaumaturgy', 'Detect Evil and Good'], spellCls: 'other', spellNote: 'Detect evil and good once per long rest without a slot (INT)', max: '1', reset: 'long' },
    'feat:Blade Mastery': { col: 'reaction', use: R('Blade Mastery', 1, { ac: 1, note: 'Holding a shortsword, longsword, scimitar, rapier or greatsword' }), passive: { advNote: 'Opportunity attacks with mastered blades' }, text: '+1 to attack rolls with those blades (add to the weapon)' },
    'feat:Fell Handed': { text: '+1 to attacks with axes, hammers and mauls; advantage hit can knock prone; disadvantage miss deals {max(0,str)} damage' },
    'feat:Flail Mastery': { col: 'bonus', dc: 'str', save: 'STR', use: R('Flail Mastery', 1, { atk: 2, note: 'Next flail attack vs a creature with a shield' }), text: 'Opportunity attack hit: STR save or prone' },
    'feat:Spear Mastery': { acts: [
      { name: 'Set vs charge', col: 'bonus', use: R('Set vs charge', 1, { note: 'Reaction attack on a creature moving 20 ft toward you: +1d8 damage' }), roll: '1d8', rollNote: 'extra damage on the set attack' },
      { name: 'Extend reach', col: 'bonus', use: R('Spear reach', 1, { note: '+5 ft reach with your spear this turn' }) }], text: '+1 to spear attacks; spear damage d8 (d10 two-handed)' },
    'feat:Gourmand': { col: 'action', trigger: 'longRest', triggerText: 'Cook for up to six creatures: each regains two extra Hit Dice and has advantage on CON saves vs disease for 24 hours.', triggerLabel: 'OK', text: 'Tell whether food or drink within 5 ft is poisoned' },
    'feat:Master of Disguise': { none: true },
    'feat:Tandem Tactician': { col: 'bonus', text: 'Help action (reaches 30 ft; can aid two allies attacking the same creature)' },
    'feat:Shield Training': { none: true },
    'feat:Tracker': { spells: ["Hunter's Mark"], spellCls: 'other', once: true, spellNote: 'Once per long rest without a slot', passive: { advNote: 'Survival checks to track' } },
    'feat:Wild Talent': { roll: '1d6', rollNote: 'Psionic Talent die: add to a check or weapon damage (shrinks on a high roll, grows on a 1)' },
    'feat:Metabolic Control': { max: '1', reset: 'long', text: 'Meditate 1 minute for short-rest benefits (or spend your talent die to go 24 hours without food or water)' },
    'feat:Tower of Iron Will': { col: 'reaction', roll: '1d6', rollNote: 'Psionic Talent die added to the failed save' }
  });

  Object.assign(DND.featFx, X);

  // ======================= FIGHTING STYLES (UA) =======================
  // ua_classes_b.js also pushes these names, so set every matching entry.
  const setAll = (type, name, fx) => ((DND.options[type] || { list: [] }).list).forEach(e => { if (e[0] === name) e[3] = Object.assign({}, e[3] || {}, fx); });
  setAll('fightingStyle', 'Close Quarters Shooter', { rangedAtk: 1 });
  setAll('fightingStyle', 'Mariner', { passive: { swim: 'walk', climb: 'walk' }, acts: [{ name: 'Mariner AC', use: R('Mariner', null, { ac: 1, note: 'Only while not in heavy armor and without a shield' }) }] });
  setAll('fightingStyle', 'Tunnel Fighter', { col: 'bonus', use: R('Tunnel Fighter', 1, { note: 'Opportunity attacks without a reaction vs creatures moving more than 5 ft within your reach' }) });
})();

// Feature automation: remaining Unearthed Arcana content — Mystic, revised Ranger, UA subclasses and option lists (see tools/FX_SPEC.md).
(function () {
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  const PSI = n => ({ from: 'Psionics', n });
  const G = {
    // ---- Paladin: Oath of Treachery ----
    'paladin:uatreachery:Channel Divinity: Conjure Duplicate': { col: 'action', cost: { from: 'Channel Divinity', n: 1 }, use: { effect: { name: 'Conjure Duplicate', rounds: 10, conc: true, buff: { note: 'Illusory double: cast from its space; advantage vs creatures next to both of you' } } } },
    'paladin:uatreachery:Channel Divinity: Poison Strike': { col: 'bonus', cost: { from: 'Channel Divinity', n: 1 }, roll: '2d10+paladin', rollNote: 'poison on the next hit (20 + paladin level if you had advantage)' },
    'paladin:uatreachery:Aura of Treachery': { passive: { advNote: 'Melee attacks against creatures that have an ally within 5 ft of them' }, text: 'Treacherous Strike: force a creature that missed you to reroll against another creature' },
    "paladin:uatreachery:Blackguard's Escape": { use: { cond: 'Invisible', condRounds: 1 }, text: 'Teleport up to 60 ft' },
    'paladin:uatreachery:Icon of Deceit': { use: Object.assign(R('Icon of Deceit', 10, { note: 'Invisible; creatures that damage you: WIS save or you control their next action; +paladin level damage when you attack with advantage' }), { cond: 'Invisible', condRounds: 10 }), dc: 'spell', save: 'WIS' },
    // ---- Ranger: Primeval Guardian (both rangers) ----
    'uaprimevalguardian:Guardian Magic': { spellsAt: { 3: ['Entangle'], 5: ['Enhance Ability'], 9: ['Conjure Animals'], 13: ['Giant Insect'], 17: ['Insect Plague'] } },
    'uaprimevalguardian:Guardian Soul': { col: 'bonus', use: R('Guardian Soul', null, { note: 'Large, speed 5 ft or less, +5 ft reach; temp HP each turn equal to half your ranger level' }), text: 'Temp HP at the start of each turn: {floor(ranger/2)}' },
    'uaprimevalguardian:Piercing Thorns': { col: 'action', roll: '1d6', rollNote: 'extra piercing (once per turn)' },
    'uaprimevalguardian:Ancient Fortitude': { passive: { effect: 'Guardian Soul', maxHp: '2*ranger' } },
    'uaprimevalguardian:Rooted Defense': { passive: { effect: 'Guardian Soul', advNote: 'Ground within 30 ft is difficult terrain for enemies' } },
    'uaprimevalguardian:Guardian Aura': { passive: { effect: 'Guardian Soul', advNote: 'Allies below half HP starting within 30 ft regain half your ranger level' } },
    // ---- Sorcerer: Phoenix, Sea, Stone, Giant Soul ----
    'sorcerer:uaphoenix:Ignite': { col: 'action' },
    'sorcerer:uaphoenix:Mantle of Flame': { use: R('Mantle of Flame', 10, { note: 'Melee attackers take CHA mod fire; add CHA to fire damage on your turn; bright light 30 ft' }) },
    'sorcerer:uaphoenix:Phoenix Spark': { trigger: 'zero', triggerText: 'Drop to 1 HP instead and burst into flame', use: { setHp: 1, removeCond: ['Unconscious'], endEffect: 'Mantle of Flame' }, roll: '{floor(sorcerer/2)}+cha', rollNote: 'fire to creatures within 10 ft (sorcerer level + 2×CHA during Mantle of Flame)' },
    'sorcerer:uaphoenix:Nourishing Fire': { text: 'Spending a slot on a fire spell heals you slot level + CHA', roll: 'cha', rollNote: '+ the slot level', healRoll: true },
    'sorcerer:uaphoenix:Form of the Phoenix': { passive: { effect: 'Mantle of Flame', fly: 40, resist: ['all damage'] } },
    'sorcerer:uasea:Soul of the Sea': { passive: { swim: 'walk', advNote: 'Breathe underwater' } },
    'sorcerer:uasea:Curse of the Sea': { text: 'A cantrip hit or failed save curses the target until the end of your next turn' },
    'sorcerer:uasea:Watery Defense': { passive: { resist: ['fire'] }, roll: 'sorcerer', rollNote: '+ your CHA score: weapon damage reduced; then move 30 ft without opportunity attacks' },
    'sorcerer:uasea:Shifting Form': { passive: { advNote: 'Opportunity attacks against you deal half damage' } },
    'sorcerer:uasea:Water Soul': { passive: { resist: ['bludgeoning', 'piercing', 'slashing'], advNote: 'Critical hits against you are normal hits' } },
    'sorcerer:uastone:Bonus Proficiencies': { none: true },
    'sorcerer:uastone:Metal Magic': { none: true },
    "sorcerer:uastone:Stone's Durability": { passive: { maxHp: 'sorcerer' }, col: 'action', use: R("Stone's Durability", null, { acBase: '13+con', note: 'Stony skin while unarmored (shield allowed)' }), onlyWhen: { armor: 'none' } },
    'sorcerer:uastone:Stone Aegis': { col: 'bonus', text: 'An ally reduces physical damage by {2+floor(sorcerer/4)}; reaction teleport-strike for extra force', roll: '{tier(sorcerer,6,1,11,2,17,3)}d10', rollNote: 'force on your Stone Aegis strike' },
    "sorcerer:uastone:Stone's Edge": { roll: '{floor(sorcerer/2)}', rollNote: 'extra force damage to one creature the spell hurt' },
    "sorcerer:uastone:Earth Master's Aegis": { none: true },
    'sorcerer:uagiantsoul:Jotun Resilience': { passive: { maxHp: 'sorcerer' } },
    'sorcerer:uagiantsoul:Mark of the Ordning': { none: true },
    'sorcerer:uagiantsoul:Soul of Lost Ostoria': { text: 'See your giant type on the Mark of the Ordning feature' },
    'sorcerer:uagiantsoul:Rage of Fallen Ostoria': { use: R('Rage of Fallen Ostoria', 10, { meleeDmg: 'max(1,con)', speed: 5, note: 'One size larger, +5 ft reach, advantage on STR checks and saves; +sorcerer level HP and max HP' }) },
    'sorcerer:uagiantsoul:Blessing of the All Father': { passive: { abil: { con: 2 }, abilMax: 22 } },
    // ---- Warlock: Undying Light, Ghost in the Machine, Raven Queen, Seeker ----
    'warlock:uaundyinglight:Searing Vengeance': { trigger: 'zero', triggerText: 'Instead of a death save, spring up with half your HP', use: { healHalf: true, removeCond: ['Unconscious', 'Prone'] }, roll: '10+cha', rollNote: 'radiant to hostile creatures within 30 ft (blinded until the end of your turn)' },
    'warlock:uaundyinglight:Radiant Resistance': { trigger: ['shortRest', 'longRest'], use: { temp: 'warlock+cha' } },
    'warlock:uaghost:Expanded Spell List': { none: true },
    'warlock:uaghost:Information Surge': { dc: 'spell', save: 'INT' },
    'warlock:uaghost:Wire Walk': { none: true },
    'warlock:uaghost:Personal Encryption': { passive: { advNote: 'Saves against scrying, thought reading and magical location' } },
    'warlock:uaghost:Technovirus': { dc: 'spell', save: 'CON', roll: '8d10', rollNote: 'psychic (half on a success)' },
    'warlock:uaravenqueen:Sentinel Raven': {}, // darkvision and Perception come from the "on my shoulder" checkbox
    'warlock:uaravenqueen:Soul of the Raven': { col: 'bonus', use: R('Soul of the Raven', null, { note: 'Merged with your raven: Tiny, raven’s speed; only Dash, Disengage, Dodge, Help, Hide, Search' }), acts: [{ name: 'Return to normal', col: 'action', onlyWhen: { effect: 'Soul of the Raven' }, use: { endEffect: 'Soul of the Raven' }, text: 'You and the raven separate.' }] },
    "warlock:uaravenqueen:Raven's Shield": { passive: { resist: ['necrotic'], condImmune: ['Frightened'], advNote: 'Death saving throws' } },
    "warlock:uaravenqueen:Queen's Right Hand": { spells: ['Finger of Death'], once: true, spellNote: 'Once per long rest without a slot' },
    'warlock:uaseeker:Shielding Aurora': { use: R('Shielding Aurora', 1, { note: 'Resistance to all damage; enemies ending their turn within 10 ft take warlock level + CHA radiant' }), roll: 'warlock+cha', rollNote: 'radiant to each hostile creature ending its turn within 10 ft' },
    'warlock:uaseeker:Pact Boon: Pact of the Star Chain': { none: true },
    'warlock:uaseeker:Astral Refuge': { col: 'action' },
    'warlock:uaseeker:Far Wanderer': { passive: { resist: ['fire', 'cold'], advNote: 'No need to breathe' } },
    'warlock:uaseeker:Astral Sequestration': { text: 'You and up to ten willing creatures gain a short rest with no time passing' },
    // ---- Wizard UA traditions ----
    'wizard:uaartificer:Infuse Potions': { text: 'Spend 10 minutes and a slot: 1st climbing/growth/healing; 2nd mind reading/greater healing; 3rd invisibility/superior healing/water breathing; 4th resistance' },
    'wizard:uaartificer:Infuse Scrolls': { none: true },
    'wizard:uaartificer:Infuse Weapons and Armor': { text: '2nd: +1 ammunition (20) · 3rd: +1 weapon or shield · 4th: +1 armor · 5th: +2 weapon/ammo · 6th: +2 armor (8 hours)' },
    'wizard:uaartificer:Superior Artificer': { none: true },
    'wizard:uaartificer:Master Artificer': { none: true },
    'wizard:uainvention:Tools of the Inventor': { none: true },
    'wizard:uainvention:Arcanomechanical Armor': { passive: { resist: ['force'] }, text: 'Your armor: AC 12 + DEX (equip it as light armor)' },
    'wizard:uainvention:Reckless Casting': { col: 'action', roll: '1d10', rollNote: 'on the Reckless Casting table (10: roll twice)' },
    'wizard:uainvention:Alchemical Casting': { roll: '2d10', rollNote: 'force damage to one target (extra 2nd-level slot)' },
    'wizard:uainvention:Prodigious Inspiration': { none: true },
    'wizard:uainvention:Controlled Chaos': { none: true },
    'wizard:ualoremaster:Lore Master': { passive: { advNote: 'Double proficiency on Arcana, History, Nature, Religion; initiative can use INT' } },
    'wizard:ualoremaster:Spell Secrets': { text: 'Swap a damage type, or once per rest change a spell’s save ability' },
    'wizard:ualoremaster:Alchemical Casting': { roll: '2d10', rollNote: 'force to every target (extra 1st-level slot)' },
    'wizard:ualoremaster:Prodigious Memory': { none: true },
    'wizard:ualoremaster:Master of Magic': { text: 'Cast one spell from any class list this turn' },
    'wizard:uaonomancy:Bonus Proficiencies': { none: true },
    'wizard:uaonomancy:Extract Name': { dc: 'spell', save: 'WIS' },
    'wizard:uaonomancy:Fateful Naming': { spells: ['Bane', 'Bless'], spellNote: 'Without a slot by speaking a true name (INT mod times per long rest)' },
    'wizard:uaonomancy:Resonant Utterance': { text: 'Speak a true name while casting with a slot to apply one of your Resonants' },
    'wizard:uaonomancy:Inexorable Pronouncement': { none: true },
    'wizard:uaonomancy:Relentless Naming': { none: true },
    'wizard:uapsionics:Psionic Focus': { passive: { advNote: 'Reroll 1s on psychic and force damage dice of your wizard spells' } },
    'wizard:uapsionics:Psionic Devotion': { text: 'Cast friends, mage hand or message as a bonus action with no components' },
    'wizard:uapsionics:Thought Form': { use: R('Thought Form', 100, { note: 'Spells need no components (unless they cost gold); resistance to psychic and nonmagical physical damage' }) },
    'wizard:uapsionics:Empowered Psionics': { passive: { advNote: 'Add INT to psychic or force damage of a wizard spell against one target' } },
    'wizard:uapsionics:Mental Discipline': { text: 'Cast your chosen spell (dominate person, scrying or telekinesis) without a slot or components' },
    'wizard:uapsionics:Thought Travel': { passive: { effect: 'Thought Form', fly: 'walk' } },
    'wizard:uarunecrafter:Runes of Understanding': { spells: ['Comprehend Languages'], spellNote: 'Without a slot' },
    'wizard:uarunecrafter:Runic Empowerment': { acts: [
      { name: 'Life rune', cost: true, text: 'A creature within 30 ft gains 5 × slot level temporary HP' },
      { name: 'War rune', cost: true, text: 'Attacks against a creature within 30 ft get + half the slot level until the end of your next turn' },
      { name: 'Wind rune', cost: true, use: R('Wind rune', 1, { note: '+5 ft speed per slot level; no opportunity attacks' }) }] },
    'wizard:uarunecrafter:Sigils of Warding': { col: 'reaction', cost: { from: 'Runic Empowerment', n: 1 }, text: 'Succeed on a failed STR, DEX or CON save' },
    'wizard:uarunecrafter:Rune Maven': { none: true },
    'wizard:uarunecrafter:Engraved Enmity': { dc: 'spell', save: 'WIS', roll: '1d8', rollNote: 'force on an ally’s next hit against the marked creature' },
    'wizard:uatechnomancy:Bonus Proficiencies': { none: true },
    'wizard:uatechnomancy:Technological Savant': { none: true },
    'wizard:uatechnomancy:Program Spell': { col: 'action' },
    'wizard:uatechnomancy:Online Casting': { none: true },
    'wizard:uatechnomancy:Chained Device': { none: true },
    'wizard:uatheurgy:Divine Inspiration': { none: true },
    'wizard:uatheurgy:Channel Arcana': { resource: true },
    'wizard:uatheurgy:Channel Arcana: Divine Arcana': { col: 'bonus', cost: { from: 'Channel Arcana', n: 1 }, use: R('Divine Arcana', 1, { note: '+2 to your next spell’s attack roll or save DC' }) },
    'wizard:uatheurgy:Arcane Acolyte': { none: true },
    'wizard:uatheurgy:Arcane Priest': { none: true },
    'wizard:uatheurgy:Arcane High Priest': { none: true },
    // ---- Mystic ----
    'mystic:Psionics': { resource: true, dc: false },
    'mystic:Psychic Focus': { col: 'bonus' },
    'mystic:Mystic Order': { none: true },
    'mystic:Mystical Recovery': { col: 'bonus', text: 'Regain HP equal to the psi points you just spent' },
    'mystic:Telepathy': { none: true },
    'mystic:Strength of Mind': { trigger: ['shortRest', 'longRest'], triggerText: 'Swap your WIS save proficiency for STR, DEX, CON or CHA until your next rest' },
    'mystic:Potent Psionics': { col: 'action', roll: '{tier(mystic,8,1,14,2)}d8', rollNote: 'psychic, once per turn on a weapon hit' },
    'mystic:Consumptive Power': { text: 'Pay a discipline’s cost with HP (current and max) until a long rest' },
    'mystic:Psionic Mastery': { text: 'Gain {mystic>=15?11:9} special psi points for action or bonus-action disciplines' },
    'mystic:Psionic Body': { passive: { resist: ['bludgeoning', 'piercing', 'slashing'], immune: ['poison'], condImmune: ['Poisoned', 'Diseased'] }, trigger: 'zero', triggerText: 'If you die, roll a d20: on 10 or higher you return 1d3 days later', roll: '1d20' },
    'mystic:avatar:Bonus Disciplines': { none: true },
    'mystic:avatar:Armor Training': { none: true },
    'mystic:avatar:Avatar of Healing': { passive: { advNote: 'Allies healed by your disciplines regain +INT mod HP' } },
    'mystic:avatar:Avatar of Speed': { passive: { advNote: 'Allies within 30 ft can Dash as a bonus action' } },
    'mystic:awakened:Bonus Disciplines': { none: true },
    'mystic:awakened:Awakened Talent': { none: true },
    'mystic:awakened:Psionic Investigation': { text: 'Concentrate 10 minutes on an object to see its last hour' },
    'mystic:awakened:Psionic Surge': { text: 'Give up your psychic focus: the target has disadvantage on its save' },
    'mystic:awakened:Spectral Form': { use: R('Spectral Form', 100, { note: 'Resistance to all damage; half speed; pass through creatures and objects' }) },
    'mystic:immortal:Bonus Disciplines': { none: true },
    'mystic:immortal:Immortal Durability': { passive: { maxHp: 'mystic' } },
    'mystic:immortal:Psionic Resilience': { use: { temp: 'max(0,int)' }, text: 'At the start of each of your turns (1 HP or more)' },
    'mystic:immortal:Surge of Health': { text: 'Halve the damage; lose your psychic focus until a rest' },
    'mystic:immortal:Immortal Will': { trigger: 'zero', cost: PSI(5), roll: 'mystic+con', healRoll: true, rollNote: 'HP regained (spend 5 psi at the end of your turn)' },
    'mystic:nomad:Bonus Disciplines': { none: true },
    'mystic:nomad:Breadth of Knowledge': { trigger: 'longRest', triggerText: 'Choose two proficiencies (tools, skills or languages) until your next long rest' },
    'mystic:nomad:Memory of One Thousand Steps': { text: 'Teleport to a space you occupied since your last turn; the attack misses' },
    'mystic:nomad:Superior Teleportation': { none: true },
    'mystic:nomad:Effortless Journey': { none: true },
    'mystic:soulknife:Martial Training': { none: true },
    'mystic:soulknife:Soul Knife': { col: 'bonus', attacks: [['Soul knife', '1d8', 'psychic', 'fin', { notes: 'Light, finesse; one on each fist' }]], acts: [{ name: 'Parry (+2 AC)', col: 'bonus', use: R('Soul knife parry', 1, { ac: 2 }) }] },
    'mystic:soulknife:Hone the Blade': { acts: [
      { name: '+1 (2 psi)', cost: PSI(2), use: R('Hone the Blade', 100, { atk: 1, dmg: 1, note: 'Soul knife only' }) },
      { name: '+2 (5 psi)', cost: PSI(5), use: R('Hone the Blade', 100, { atk: 2, dmg: 2, note: 'Soul knife only' }) },
      { name: '+4 (7 psi)', cost: PSI(7), use: R('Hone the Blade', 100, { atk: 4, dmg: 4, note: 'Soul knife only' }) }] },
    'mystic:soulknife:Consumptive Knife': { text: 'Regain 2 psi points when your soul knife slays an enemy' },
    'mystic:soulknife:Phantom Knife': { col: 'action', text: 'One soul knife attack treats the target’s AC as 10' },
    'mystic:wujen:Bonus Disciplines': { none: true },
    "mystic:wujen:Hermit's Study": { none: true },
    'mystic:wujen:Elemental Attunement': { cost: PSI(1), text: 'Your discipline ignores the target’s resistance' },
    'mystic:wujen:Arcane Dabbler': { col: 'bonus', text: 'Create slots: 1st 2, 2nd 3, 3rd 5, 4th 6, 5th 7 psi' },
    'mystic:wujen:Elemental Mastery': { col: 'reaction', cost: PSI(2), text: 'Ignore damage of a type you resist; immune until the end of your next turn' },
    // ---- Revised Ranger ----
    'rangerrev:Favored Enemy': { passive: { advNote: '+2 weapon damage against favored enemies (+4 from 6th); Survival to track and INT to recall lore' } },
    'rangerrev:Natural Explorer': { passive: { initAdv: true, advNote: 'First turn: advantage on attacks against creatures that haven’t acted; ignore difficult terrain' } },
    'rangerrev:Fighting Style': { none: true },
    'rangerrev:Spellcasting': { none: true },
    'rangerrev:Greater Favored Enemy': { passive: { advNote: 'Saves against your favored enemies’ spells and abilities' } },
    'rangerrev:Fleet of Foot': { col: 'bonus', dash: true },
    'rangerrev:Hide in Plain Sight': { text: 'If you don’t move on a turn you hide, −10 to Perception checks against you' },
    'rangerrev:beast:Animal Companion': { none: true },
    "rangerrev:beast:Companion's Bond": { none: true },
    'rangerrev:beast:Coordinated Attack': { text: 'Your companion makes a melee attack with its reaction when you take the Attack action' },
    "rangerrev:beast:Beast's Defense": { none: true },
    'rangerrev:beast:Storm of Claws and Fangs': { none: true },
    "rangerrev:beast:Superior Beast's Defense": { none: true },
    'rangerrev:hunter:Extra Attack': { none: true },
    'rangerrev:deepstalker:Underdark Scout': { text: 'First turn of combat: +10 ft speed and one extra attack' },
    'rangerrev:deepstalker:Deep Stalker Magic': { passive: { sense: 'Darkvision 90 ft (Deep Stalker)' }, spellsAt: { 3: ['Disguise Self'], 5: ['Rope Trick'], 9: ['Glyph of Warding'], 13: ['Greater Invisibility'], 17: ['Seeming'] } },
    'rangerrev:deepstalker:Extra Attack': { none: true },
    "rangerrev:deepstalker:Stalker's Dodge": { col: 'reaction', text: 'Impose disadvantage on an attack against you' }
  };
  Object.assign(DND.featFx, G);
  // ---- Option lists ----
  setOpt('pactBoon', 'Pact of the Star Chain', { spells: ['Augury'], spellNote: 'Ritual, doesn’t count against spells known', max: '1', reset: 'short', text: 'Advantage on one INT check' });
  const ord = (n, spells, fx) => setOpt('uaOrdning', n, Object.assign({ spellsAt: spells }, fx));
  ord('Cloud Giant', { 1: ['Fog Cloud', 'Minor Illusion'], 3: ['Invisibility'] }, { text: 'Soul of Lost Ostoria: after casting one, teleport {10+con} ft as a bonus action' });
  ord('Fire Giant', { 1: ['Burning Hands', 'Fire Bolt'], 3: ['Flaming Sphere'] }, { text: 'Soul of Lost Ostoria: +{max(1,con)} damage with these spells' });
  ord('Frost Giant', { 1: ['Armor of Agathys', 'Ray of Frost'], 3: ['Hold Person'] }, { use: { temp: 'max(1,con)' }, text: 'Soul of Lost Ostoria: temp HP after casting one' });
  ord('Hill Giant', { 1: ['Heroism', 'Shillelagh'], 3: ['Enlarge/Reduce'] }, { dc: 'spell', save: 'STR', text: 'Soul of Lost Ostoria: push two creatures {5+con} ft' });
  ord('Stone Giant', { 1: ['Entangle', 'Resistance'], 3: ['Spike Growth'] }, { use: R('Soul of Lost Ostoria', 1, { ac: 'max(1,con)' }) });
  ord('Storm Giant', { 1: ['Shocking Grasp', 'Thunderwave'], 3: ['Gust of Wind'] }, { roll: 'max(1,con)', rollNote: 'lightning to up to three creatures within 30 ft' });
  setOpt('uaResonant', 'Absorption', { use: { temp: '{tier(wizard,6,3,10,4,14,5)}d6' } });
  setOpt('uaResonant', 'Devastation', { none: true });
  setOpt('uaResonant', 'Dissolution', { roll: '{tier(wizard,6,2,10,3,14,4)}d8', rollNote: 'extra force damage' });
  setOpt('uaResonant', 'Nullification', { text: 'INT check DC 10 + spell level to end one spell on the target' });
  setOpt('uaResonant', 'Puppetry', { none: true });
  setOpt('uaResonant', 'Sympathy', { none: true });
  const tal = (n, fx) => setOpt('uaTalent', n, fx);
  const TIER = '{tier(level,1,1,5,2,11,3,17,4)}';
  tal('Beacon', { col: 'bonus' });
  tal('Blade Meld', { col: 'bonus' });
  tal('Blind Spot', { col: 'action', dc: 'int', save: 'WIS' });
  tal('Delusion', { col: 'action' });
  tal('Energy Beam', { col: 'action', dc: 'int', save: 'DEX', roll: TIER + 'd8', rollNote: 'acid, cold, fire, lightning or thunder' });
  tal('Light Step', { col: 'bonus', use: R('Light Step', 1, { speed: 10 }) });
  tal('Mind Meld', { col: 'bonus' });
  tal('Mind Slam', { col: 'action', dc: 'int', save: 'CON', roll: TIER + 'd6', rollNote: 'force; Large or smaller knocked prone' });
  tal('Mind Thrust', { col: 'action', dc: 'int', save: 'INT', roll: TIER + 'd10', rollNote: 'psychic' });
  tal('Mystic Charm', { col: 'action', dc: 'int', save: 'CHA' });
  tal('Mystic Hand', { col: 'action' });
  tal('Psychic Hammer', { col: 'action', dc: 'int', save: 'STR', roll: TIER + 'd6', rollNote: 'force; moved 10 ft' });
  // Disciplines: each mode is a button that spends psi; scalable modes spend 1 point per press.
  const A = (name, n, col, more) => Object.assign({ name: `${name} (${n} psi)`, col, cost: PSI(n), dc: 'int' }, more || {});
  const dis = (n, acts, passive) => setOpt('uaDiscipline', n, { acts, passive: passive ? Object.assign({ effect: 'Psychic Focus' }, passive) : undefined, text: 'Psychic focus applies while you focus this discipline' });
  dis('Crown of Despair', [A('Crowned in Sorrow', 1, 'action', { roll: '1d8', rollNote: 'psychic per point (CHA save half); no reactions', save: 'CHA' }), A('Call to Inaction', 2, 'action'), A('Visions of Despair', 3, 'action', { roll: '3d6', rollNote: 'psychic; speed 0 (CHA save)', save: 'CHA' }), A('Dolorous Mind', 5, 'action', { save: 'CHA' })]);
  dis('Crown of Disgust', [A('Eye of Horror', 1, 'action', { roll: '1d6', rollNote: 'psychic per point; can’t approach (CHA save)', save: 'CHA' }), A('Wall of Repulsion', 3, 'action'), A('Visions of Disgust', 5, 'action', { roll: '5d6', rollNote: 'psychic', save: 'CHA' }), A('World of Horror', 7, 'action', { roll: '8d6', rollNote: 'psychic; frightened', save: 'CHA' })]);
  dis('Crown of Rage', [A('Primal Fury', 1, 'action', { roll: '1d6', rollNote: 'psychic per point', save: 'WIS' }), A('Fighting Words', 2, 'action'), A('Mindless Courage', 2, 'bonus'), A('Punishing Fury', 5, 'action')]);
  dis('Mantle of Command', [A('Coordinated Movement', 2, 'action'), A("Commander's Sight", 2, 'action'), A('Command to Strike', 3, 'action'), A('Strategic Mind', 5, 'bonus'), A('Overwhelming Attack', 7, 'action')]);
  dis('Mantle of Courage', [A('Incite Courage', 2, 'bonus'), A('Aura of Victory', 1, 'bonus', { rollNote: 'temp HP per point when enemies drop' }), A('Pillar of Confidence', 6, 'action')], { advNote: 'Saves against being frightened (you and nearby allies)' });
  dis('Mantle of Fear', [A('Incite Fear', 2, 'action', { save: 'WIS' }), A('Unsettling Aura', 3, 'bonus'), A('Incite Panic', 5, 'action', { save: 'WIS' })], { skillAdv: ['Intimidation'] });
  dis('Mantle of Fury', [A('Incite Fury', 2, 'bonus'), A('Mindless Charge', 2, 'bonus'), A('Aura of Bloodletting', 3, 'action'), A('Overwhelming Fury', 5, 'action', { save: 'CHA' })], { speed: 5 });
  dis('Mantle of Joy', [A('Soothing Presence', 1, 'action', { roll: '3', rollNote: 'temp HP per point to three creatures' }), A('Comforting Aura', 2, 'bonus'), A('Aura of Jubilation', 3, 'action'), A('Beacon of Recovery', 5, 'action')], { skillAdv: ['Persuasion'] });
  dis('Aura Sight', [A('Assess Foe', 2, 'action'), A('Read Moods', 2, 'action'), A('View Aura', 3, 'action'), A('Perceive the Unseen', 5, 'bonus')], { skillAdv: ['Insight'] });
  dis('Intellect Fortress', [A('Psychic Backlash', 2, 'reaction', { roll: '2d10', rollNote: 'psychic back if it hits' }), A('Psychic Parry', 1, 'reaction', { rollNote: '+1 per point to an INT/WIS/CHA save' }), A('Psychic Redoubt', 5, 'action')], { resist: ['psychic'] });
  dis('Mantle of Awe', [A('Charming Presence', 1, 'action', { roll: '2d8', rollNote: 'HP of creatures charmed, per point' }), A('Center of Attention', 2, 'action', { save: 'CHA' }), A('Invoke Awe', 7, 'action', { save: 'INT' })]);
  dis('Precognition', [A('Precognitive Hunch', 2, 'bonus', { use: R('Precognitive Hunch', 10, { note: '+1d4 to attacks, saves and checks', save: 0 }) }), A('All-Around Sight', 3, 'reaction'), A('Danger Sense', 5, 'action', { use: R('Danger Sense', null, { note: 'No surprise, no advantage against you, +10 initiative' }) }), A('Victory Before Battle', 7, 'action')], { initAdv: true });
  dis('Psychic Assault', [A('Psionic Blast', 1, 'action', { roll: '1d8', rollNote: 'psychic per point (no save)' }), A('Ego Whip', 3, 'action', { roll: '3d8', rollNote: 'psychic; limited actions', save: 'INT' }), A('Id Insinuation', 5, 'action', { roll: '5d8', rollNote: 'psychic', save: 'INT' }), A('Psychic Blast', 6, 'action', { roll: '8d8', rollNote: 'psychic, 60 ft cone', save: 'INT' }), A('Psychic Crush', 7, 'action', { roll: '8d8', rollNote: 'psychic, 20 ft cube; stunned', save: 'INT' })]);
  dis('Psychic Disruption', [A('Distracting Haze', 1, 'action', { roll: '1d10', rollNote: 'psychic per point', save: 'WIS' }), A('Daze', 3, 'action', { save: 'INT' }), A('Mind Storm', 5, 'action', { roll: '6d8', rollNote: 'psychic, 20 ft sphere', save: 'INT' })], { skillAdv: ['Deception'] });
  dis('Psychic Inquisition', [A('Hammer of Inquisition', 1, 'action', { roll: '1d10', rollNote: 'psychic per point', save: 'WIS' }), A('Forceful Query', 2, 'action', { save: 'WIS' }), A('Ransack Mind', 5, 'action', { save: 'INT' }), A('Phantom Idea', 6, 'action', { save: 'INT' })]);
  dis('Psychic Phantoms', [A('Distracting Figment', 1, 'action', { roll: '1d10', rollNote: 'psychic per point', save: 'INT' }), A('Phantom Foe', 3, 'action', { roll: '1d8', rollNote: 'psychic each turn', save: 'INT' }), A('Phantom Betrayal', 5, 'action', { save: 'INT' }), A('Phantom Riches', 7, 'action', { save: 'WIS' })], { skillAdv: ['Deception'] });
  dis('Telepathic Contact', [A('Exacting Query', 2, 'action', { save: 'WIS' }), A('Occluded Mind', 2, 'action', { save: 'WIS' }), A('Broken Will', 5, 'action', { save: 'WIS' }), A('Psychic Grip', 6, 'action', { save: 'INT' }), A('Psychic Domination', 7, 'action', { save: 'WIS' })]);
  dis('Adaptive Body', [A('Environmental Adaptation', 2, 'action'), A('Adaptive Shield', 3, 'reaction', { use: R('Adaptive Shield', 1, { note: 'Resistance to the triggering acid, cold, fire, lightning or thunder' }) }), A('Energy Adaptation', 5, 'action'), A('Energy Immunity', 7, 'action')], { advNote: 'No need to eat, breathe or sleep' });
  dis('Bestial Form', [A('Bestial Claws', 1, 'action', { roll: '1d10', rollNote: 'slashing per point (melee attack)' }), A('Tough hide (+2 AC)', 2, 'bonus', { use: R('Bestial Form', 600, { ac: 2 }) }), A('Flight', 5, 'bonus', { use: R('Bestial Form: flight', 600, { fly: 'walk' }) }), A('Climbing / swimming / senses', 2, 'bonus')], { skillAdv: ['Animal Handling'] });
  dis('Brute Force', [A('Brute Strike', 1, 'action', { roll: '1d6', rollNote: 'extra damage per point on a melee hit' }), A('Knock Back', 1, 'action', { rollNote: 'push 10 ft per point (STR save)', save: 'STR' }), A('Mighty Leap', 1, 'action'), A('Feat of Strength', 2, 'bonus')], { skillAdv: ['Athletics'] });
  dis('Celerity', [A('Rapid Step', 1, 'bonus', { use: R('Rapid Step', 1, { speed: 10 }) }), A('Agile Defense', 2, 'bonus', { use: { cond: 'Dodging' } }), A('Blur of Motion', 2, 'action'), A('Surge of Speed', 2, 'bonus'), A('Surge of Action', 5, 'bonus')], { speed: 10 });
  dis('Corrosive Metabolism', [A('Corrosive Touch', 1, 'action', { roll: '1d10', rollNote: 'acid per point', save: 'DEX' }), A('Venom Strike', 1, 'action', { roll: '1d6', rollNote: 'poison per point; poisoned', save: 'CON' }), A('Acid Spray', 2, 'reaction', { roll: '2d6', rollNote: 'acid' }), A('Breath of the Black Dragon', 5, 'action', { roll: '6d6', rollNote: 'acid, 60 ft line', save: 'DEX' }), A('Breath of the Green Dragon', 7, 'action', { roll: '10d6', rollNote: 'poison, 90 ft cone', save: 'CON' })], { resist: ['acid', 'poison'] });
  dis('Diminution', [A('Miniature Form', 2, 'bonus'), A('Toppling Shift', 2, 'action', { save: 'STR' }), A('Sudden Shift', 5, 'reaction'), A('Microscopic Form', 7, 'bonus', { use: R('Microscopic Form', 10, { ac: 5 }) })], { skillAdv: ['Stealth'] });
  dis('Giant Growth', [A('Ogre Form', 2, 'bonus', { use: Object.assign(R('Ogre Form', 10, { dmgDice: '1d4 bludgeoning (melee)', note: 'Large' }), { temp: '10' }) }), A('Giant Form', 7, 'bonus', { use: Object.assign(R('Giant Form', 10, { dmgDice: '2d6 bludgeoning (melee)', note: 'Huge, +10 ft reach' }), { temp: '30' }) })]);
  dis('Iron Durability', [A('Iron Hide', 1, 'reaction', { use: R('Iron Hide', 1, { ac: 1 }), rollNote: '+1 AC per point' }), A('Steel Hide', 2, 'reaction'), A('Iron Resistance', 7, 'action')], { ac: 1 });
  dis('Psionic Restoration', [A('Mend Wounds', 1, 'action', { roll: '1d8', rollNote: 'healing per point', healRoll: true }), A('Restore Health', 3, 'action'), A('Restore Life', 5, 'action'), A('Restore Vigor', 7, 'action')]);
  dis('Psionic Weapon', [A('Ethereal Weapon', 1, 'bonus', { save: 'DEX' }), A('Lethal Strike', 1, 'action', { roll: '1d10', rollNote: 'psychic per point on a hit' }), A('Augmented Weapon', 5, 'bonus', { use: R('Augmented Weapon', 10, { atk: 3, dmg: 3 }) })]);
  dis('Nomadic Arrow', [A('Speed Dart', 1, 'action', { roll: '1d10', rollNote: 'psychic per point on the next ranged hit' }), A('Seeking Missile', 2, 'reaction'), A('Faithful Archer', 5, 'bonus')]);
  dis('Nomadic Chameleon', [A('Chameleon', 2, 'action'), A('Step from Sight', 3, 'action', { use: { cond: 'Invisible' } }), A('Enduring Invisibility', 7, 'action', { use: { cond: 'Invisible' } })], { skillAdv: ['Stealth'] });
  dis('Nomadic Mind', [A('Wandering Mind', 2, 'action'), A('Find Creature', 2, 'action'), A('Item Lore', 3, 'action'), A('Psychic Speech', 5, 'action'), A('Wandering Eye', 6, 'action'), A('Phasing Eye', 7, 'action')]);
  dis('Nomadic Step', [A('Step of a Dozen Paces', 1, 'bonus', { rollNote: 'teleport 20 ft per point' }), A('Defensive Step', 2, 'reaction', { use: R('Defensive Step', 1, { ac: 4 }) }), A('There and Back Again', 2, 'action'), A('Transposition', 3, 'action'), A('Baleful Transposition', 5, 'action', { save: 'WIS' }), A('Phantom Caravan', 6, 'action'), A("Nomad's Gate", 7, 'action')]);
  dis('Third Eye', [A('Tremorsense', 2, 'bonus'), A('Unwavering Eye', 2, 'bonus'), A('Piercing Sight', 3, 'bonus'), A('Truesight', 5, 'bonus')], { sense: 'Darkvision 60 ft (Third Eye focus)' });
  dis('Mastery of Air', [A('Wind Step', 1, 'bonus', { rollNote: 'fly 20 ft per point' }), A('Wind Stream', 1, 'action', { roll: '1d8', rollNote: 'bludgeoning per point', save: 'STR' }), A('Cloak of Air', 3, 'bonus'), A('Wind Form', 5, 'bonus', { use: R('Wind Form', 10, { fly: 60 }) }), A('Misty Form', 6, 'action'), A('Animate Air', 7, 'action')]);
  dis('Mastery of Fire', [A('Combustion', 1, 'action', { roll: '1d10', rollNote: 'fire per point', save: 'DEX' }), A('Rolling Flame', 3, 'action'), A('Detonation', 5, 'action', { roll: '7d6', rollNote: 'fire, 20 ft sphere', save: 'DEX' }), A('Fire Form', 5, 'bonus'), A('Animate Fire', 7, 'action')], { resist: ['fire'] });
  dis('Mastery of Force', [A('Push', 1, 'action', { roll: '1d8', rollNote: 'force per point', save: 'STR' }), A('Move', 2, 'action'), A('Inertial Armor', 2, 'action', { use: R('Inertial Armor', 4800, { acBase: 14, note: 'Base AC 14 + DEX' }) }), A('Telekinetic Barrier', 3, 'action'), A('Grasp', 3, 'action', { save: 'STR' })], { checkAdv: ['str'] });
  dis('Mastery of Ice', [A('Ice Spike', 1, 'action', { roll: '1d8', rollNote: 'cold per point', save: 'DEX' }), A('Ice Sheet', 2, 'action', { save: 'DEX' }), A('Frozen Sanctuary', 3, 'reaction', { use: { temp: '20' } }), A('Frozen Rain', 5, 'action', { roll: '6d6', rollNote: 'cold, 20 ft sphere', save: 'DEX' }), A('Ice Barrier', 6, 'action')], { resist: ['cold'] });
  dis('Mastery of Light and Darkness', [A('Darkness', 1, 'action'), A('Light', 2, 'action'), A('Shadow Beasts', 3, 'action'), A('Radiant Beam', 5, 'action', { roll: '6d6', rollNote: 'radiant; blinded', save: 'DEX' })]);
  dis('Mastery of Water', [A('Desiccate', 1, 'action', { roll: '1d10', rollNote: 'necrotic per point', save: 'CON' }), A('Watery Grasp', 2, 'action', { roll: '2d6', rollNote: 'bludgeoning', save: 'STR' }), A('Water Whip', 3, 'action', { roll: '3d6', rollNote: 'bludgeoning, 60 ft line', save: 'DEX' }), A('Water Breathing', 5, 'action'), A('Water Sphere', 6, 'action'), A('Animate Water', 7, 'action')], { swim: 'walk' });
  dis('Mastery of Weather', [A('Cloud Steps', 1, 'bonus'), A('Hungry Lightning', 1, 'action', { roll: '1d8', rollNote: 'lightning per point', save: 'DEX' }), A('Wall of Clouds', 2, 'action'), A('Whirlwind', 2, 'action', { save: 'STR' }), A('Lightning Leap', 5, 'action', { roll: '6d6', rollNote: 'lightning, 60 ft line', save: 'DEX' }), A('Wall of Thunder', 6, 'action'), A('Thunder Clap', 7, 'action', { roll: '8d6', rollNote: 'thunder; stunned', save: 'CON' })], { resist: ['lightning', 'thunder'] });
  dis('Mastery of Wood and Earth', [A('Animate Weapon', 1, 'action', { roll: '1d10', rollNote: 'force per point' }), A('Warp Weapon', 2, 'action'), A('Warp Armor', 3, 'action'), A('Wall of Wood', 3, 'action'), A('Armored Form', 6, 'bonus', { use: R('Armored Form', 10, { note: 'Resistance to bludgeoning, piercing and slashing' }) }), A('Animate Earth', 7, 'action')], { ac: 1 });
})();

// Party play: what a spell or feature does to another character in your party when you use it on them.
// It's sent to their sheet, which applies it (HP, temp HP, a timed effect with its bonuses, conditions…).
//
// DND.allyFx[spell] — a spell cast on party members:
//   n  how many creatures it can target (default 1; 'any' = everyone in range), up  more per slot level above the spell's
//   self false = can't target the caster · heal true = the cast's healing roll (x2 doubles it) · temp 'formula' temp HP
//   tempEach 'formula' temp HP at the start of each of their turns · maxHp {base, up} or {roll} · buff {...} (the same
//   bonuses as the sheet's own effects: ac, acMin, acBase, speed, speedMult, fly, atk, dmg, dmgDice, bless, save,
//   saveAdv, checkAdv, skillAdv, resist, immune, condImmune, atkAdv, note…) · pick [[value, label]] + mk(v) → buff
//   (+ upBuff {slot: buff}) · rounds (otherwise from the duration) · cure {pick|all: [conditions]} · exh −1 · endFx
//   (ends a harmful effect on them) · revive 1|'max' · stab · rest 'short' · form (they take a creature's shape)
//   wpn (bound to their weapon) · bond (Warding Bond: their damage is shared with you) · note (shown with it)
// DND.allyHit[spell] — a harmful spell that catches party members: a condition on a failed save (with its damage, if
//   any, taken from the spell itself) or a timed debuff.
// DND.allyFeat[feature] — class, race and feat abilities used on party members (see app13.js for how each is spent).
(function () {
  const ABS = ['str', 'dex', 'con', 'int', 'wis', 'cha'], ABN = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
  const EN = ['acid', 'cold', 'fire', 'lightning', 'thunder'], cap = t => t[0].toUpperCase() + t.slice(1);
  const ABPICK = ABS.map(a => [a, ABN[a]]), ENPICK = EN.map(t => [t, cap(t)]);
  const LR = ['Blinded', 'Deafened', 'Paralyzed', 'Poisoned'];
  DND.allyFx = {
    // ---- Healing ----
    'Cure Wounds': { heal: true, self: true, up: 0 },
    'Healing Word': { heal: true },
    'Mass Healing Word': { heal: true, n: 6 },
    'Mass Cure Wounds': { heal: true, n: 6 },
    'Prayer of Healing': { heal: true, n: 6, self: false, note: 'Also a short rest’s worth of healing time (10 minutes)' },
    'Heal': { heal: true, cure: { all: ['Blinded', 'Deafened'] } },
    'Mass Heal': { heal: true, n: 'any', cure: { all: ['Blinded', 'Deafened'] }, note: 'Split up to 700 HP among the targets (each gets the amount you send)' },
    'Power Word Heal': { heal: 'max', cure: { all: ['Charmed', 'Frightened', 'Paralyzed', 'Stunned', 'Prone'] } },
    'Regenerate': { heal: true, rounds: 600, buff: { note: 'Regains 1 HP at the start of each turn; severed body parts regrow after 2 minutes' } },
    'Healing Spirit': { heal: true, note: 'The spirit heals whoever enters or starts a turn in its space' },
    'Aura of Vitality': { heal: true, note: 'Bonus action each turn: heal someone in the aura again (Party tab → Heal)' },
    'Life Transference': { heal: 'x2', self: false },
    'Goodberry': { note: 'Hand the berries over from your inventory (Give) — each heals 1 HP' },
    // ---- Coming back ----
    'Spare the Dying': { stab: true, self: false },
    'Revivify': { revive: 1, self: false, note: 'Died within the last minute (300 gp of diamonds, consumed)' },
    'Raise Dead': { revive: 1, self: false, buff: { note: '−4 to attack rolls, saves and ability checks, easing by 1 with each long rest' }, rounds: 4 * 14400, note: 'Died within 10 days (500 gp diamond, consumed)' },
    'Reincarnate': { revive: 'max', self: false, note: 'A new body: the DM rolls the new race' },
    'Resurrection': { revive: 'max', self: false, note: 'Died within a century (1,000 gp diamond, consumed)' },
    'True Resurrection': { revive: 'max', self: false, note: 'Died within 200 years (25,000 gp of diamonds, consumed)' },
    // ---- Restoration ----
    'Lesser Restoration': { cure: { pick: LR }, note: 'Or ends one disease' },
    'Greater Restoration': { cure: { pick: ['Charmed', 'Petrified'] }, exh: -1, endFx: 'curse', note: 'Or ends one curse, an ability score reduction, or a reduction to max HP' },
    'Remove Curse': { endFx: 'curse', note: 'Ends every curse on the target' },
    'Dispel Magic': { endFx: 'spell', note: 'Ends one spell of 3rd level or lower on the target (check for higher)' },
    'Calm Emotions': { cure: { all: ['Charmed', 'Frightened'] }, n: 'any', rounds: 10, buff: { note: 'Charm and fear suppressed (or indifferent to creatures of your choice)' } },
    'Protection from Poison': { cure: { all: ['Poisoned'] }, buff: { resist: ['poison'], note: 'Advantage on saves against being poisoned' } },
    'Heroism': { n: 1, up: 1, tempEach: 'M', temp: 'M', buff: { condImmune: ['Frightened'], note: 'Immune to frightened; temp HP at the start of each turn' } },
    // ---- Rolls ----
    'Bless': { n: 3, up: 1, buff: { bless: true } },
    'Guidance': { buff: { checkDieNext: '1d4', note: '+1d4 on your next ability check' } },
    'Resistance': { buff: { saveDieNext: '1d4', note: '+1d4 on your next saving throw' } },
    'Enhance Ability': { n: 1, up: 1, pick: ABPICK, mk: a => ({ checkAdv: [a], note: `Advantage on ${ABN[a]} checks${a === 'con' ? '; 2d6 temp HP' : a === 'str' ? '; carrying capacity doubles' : a === 'dex' ? '; no falling damage from 20 ft or less' : ''}` }), label: a => ABN[a] },
    'Pass without Trace': { n: 'any', buff: { note: '+10 to Dexterity (Stealth) checks; can’t be tracked except by magic' } },
    'Beacon of Hope': { n: 'any', buff: { saveAdv: ['wis'], note: 'Advantage on WIS saves and death saves; healing you receive is maximized' } },
    'Skill Empowerment': { buff: { note: 'Expertise in one skill you’re proficient in' } },
    'Foresight': { buff: { atkAdv: 'Foresight', saveAdv: ABS, checkAdv: ABS, note: 'Can’t be surprised; attacks against you have disadvantage' } },
    'Synchronicity': { buff: { initAdv: true, note: 'Advantage on initiative; timing and chance events tend to go your way' } },
    'Holy Aura': { n: 'any', buff: { saveAdv: ABS, note: 'Attacks against you have disadvantage; fiends and undead that hit you are blinded (CON save)' } },
    'Circle of Power': { n: 'any', buff: { note: 'Advantage on saves against spells and magic; a successful half-damage save takes none' } },
    'Aura of Purity': { n: 'any', buff: { resist: ['poison'], condImmune: [], note: 'Can’t be diseased; advantage on saves against being blinded, charmed, deafened, frightened, paralyzed, poisoned or stunned' } },
    'Aura of Life': { n: 'any', buff: { resist: ['necrotic'], note: 'Max HP can’t be reduced; at 0 HP, regain 1 HP when starting a turn in the aura' } },
    // ---- Protection ----
    'Shield of Faith': { buff: { ac: 2 } },
    'Mage Armor': { buff: { acBase: 13, unarmoredOnly: true } },
    'Barkskin': { buff: { acMin: 16 } },
    'Warding Bond': { self: false, bond: true, buff: { ac: 1, save: 1, resist: ['all damage'], note: 'The caster takes the same damage you do' } },
    'Stoneskin': { buff: { resist: ['nonmagical bludgeoning, piercing and slashing'] } },
    'Protection from Energy': { pick: ENPICK, mk: t => ({ resist: [t] }), label: cap },
    'Protection from Evil and Good': { buff: { note: 'Aberrations, celestials, elementals, fey, fiends and undead have disadvantage to hit you and can’t charm, frighten or possess you' } },
    'Protection from Ballistics': { buff: { resist: ['firearms and other ballistics'] } },
    'Thought Shield': { buff: { resist: ['psychic'], note: 'Telepathy and mind reading can’t reach you' } },
    'Intellect Fortress': { n: 1, up: 1, buff: { resist: ['psychic'], saveAdv: ['int', 'wis', 'cha'] } },
    'Mind Blank': { buff: { immune: ['psychic'], condImmune: ['Charmed'], note: 'Immune to divination and having your mind read' } },
    'Fizban\'s Platinum Shield': { buff: { ac: 2, resist: ['acid', 'cold', 'fire', 'lightning', 'poison'], note: 'Half cover; evasion against DEX saves for half damage' } },
    'Sanctuary': { buff: { note: 'Anyone targeting you must make a WIS save first; ends if you attack or cast on an enemy' } },
    'Death Ward': { buff: { deathWard: true, note: 'The first time you’d drop to 0 HP you drop to 1 instead (once)' } },
    'Freedom of Movement': { buff: { condImmune: ['Paralyzed', 'Restrained'], note: 'Difficult terrain and magic can’t slow you; escape a grapple with 5 ft of movement' } },
    'Blur': { self: true, buff: { note: 'Attacks against you have disadvantage' } },
    'Invisibility': { n: 1, up: 1, buff: { note: 'Invisible until you attack or cast a spell' } },
    'Greater Invisibility': { buff: { atkAdv: 'invisible', note: 'Attacks against you have disadvantage' } },
    'Nondetection': { buff: { note: 'Can’t be targeted by divination or seen through magical scrying' } },
    'Feign Death': { buff: { note: 'Appear dead; blinded and incapacitated, speed 0; resistance to all damage but psychic' } },
    'Gaseous Form': { buff: { resist: ['nonmagical damage'], fly: 10, note: 'Misty cloud: advantage on STR, DEX and CON saves; can’t attack or cast' } },
    'Nystul\'s Magic Aura': { buff: { note: 'Your aura reads as another creature type to divination' } },
    // ---- Movement and senses ----
    'Longstrider': { n: 1, up: 1, buff: { speed: 10 } },
    'Haste': { buff: { ac: 2, speedMult: 2, saveAdv: ['dex'], note: 'One extra action each turn (one weapon attack, Dash, Disengage, Hide or Use an Object); when it ends you can’t move or act for a turn' } },
    'Fly': { n: 1, up: 1, buff: { fly: 60 } },
    'Jump': { buff: { note: 'Your jump distance is tripled' } },
    'Spider Climb': { buff: { note: 'Climb speed equal to your walking speed, even upside down, hands free' } },
    'Feather Fall': { n: 5, rounds: 10, buff: { note: 'Fall 60 ft per round and take no falling damage' } },
    'Water Breathing': { n: 10, buff: { note: 'You can breathe underwater' } },
    'Water Walk': { n: 10, buff: { note: 'You can walk on liquid surfaces' } },
    'Wind Walk': { n: 10, buff: { fly: 300, note: 'A cloud of vapor: resistance to nonmagical damage; 1 minute to change back' } },
    'Darkvision': { buff: { note: 'Darkvision 60 ft' } },
    'See Invisibility': { buff: { note: 'You see invisible creatures and objects' } },
    'True Seeing': { buff: { note: 'Truesight 120 ft' } },
    'Tongues': { buff: { note: 'You understand and speak any language' } },
    'Rary\'s Telepathic Bond': { n: 8, buff: { note: 'Telepathic link with the others in the bond' } },
    'Enlarge/Reduce': { pick: [['enlarge', 'Enlarge'], ['reduce', 'Reduce']], mk: v => v === 'enlarge' ? { dmgDice: '1d4', checkAdv: ['str'], saveAdv: ['str'], note: 'One size larger' } : { checkDis: ['str'], saveDis: ['str'], note: 'One size smaller; your weapon attacks deal 1d4 less damage' }, label: cap },
    'Seeming': { n: 'any', buff: { note: 'Disguised as someone else (an Investigation check against the DC sees through it)' } },
    'Catnap': { n: 3, up: 1, rest: 'short' },
    // ---- Weapons ----
    'Magic Weapon': { wpn: true, buff: { atk: 1, dmg: 1 }, upBuff: { 4: { atk: 2, dmg: 2 }, 6: { atk: 3, dmg: 3 } } },
    'Elemental Weapon': { wpn: true, pick: ENPICK, mk: t => ({ atk: 1, dmgDice: '1d4 ' + t }), label: cap, upBuff: { 5: { atk: 2 }, 7: { atk: 3 } } },
    'Holy Weapon': { wpn: true, buff: { dmgDice: '2d8 radiant' } },
    'Flame Arrows': { buff: { note: 'Ammunition from the quiver deals +1d6 fire (12 pieces)' } },
    'Crusader\'s Mantle': { n: 'any', buff: { dmgDice: '1d4 radiant' } },
    // ---- Bigger magic ----
    'Aid': { n: 3, maxHp: { base: 5, up: 5 } },
    'Heroes\' Feast': { n: 12, maxHp: { roll: '2d10' }, buff: { immune: ['poison'], condImmune: ['Frightened', 'Poisoned'], saveAdv: ['wis'] } },
    'Polymorph': { form: 'beast' },
    'True Polymorph': { form: 'any' },
    'Mass Polymorph': { n: 10, form: 'beast' },
    'Animal Shapes': { n: 'any', form: 'beast' },
    'Shapechange': { form: 'any', selfOnly: true }
  };
  // Harmful spells: a condition on a failed save (the save and DC come from your sheet). Timed debuffs work like an
  // enemy's spell in Effects on you.
  DND.allyHit = {
    'Hold Person': { cond: 'Paralyzed' }, 'Hold Monster': { cond: 'Paralyzed' }, 'Sleep': { cond: 'Unconscious', noSave: true, note: 'If their HP is under the total you rolled' },
    'Blindness/Deafness': { pick: [['Blinded', 'Blinded'], ['Deafened', 'Deafened']] }, 'Color Spray': { cond: 'Blinded', noSave: true, rounds: 1 },
    'Tasha\'s Hideous Laughter': { cond: ['Prone', 'Incapacitated'] }, 'Hypnotic Pattern': { cond: ['Charmed', 'Incapacitated'] },
    'Charm Person': { cond: 'Charmed' }, 'Charm Monster': { cond: 'Charmed' }, 'Dominate Person': { cond: 'Charmed' }, 'Dominate Monster': { cond: 'Charmed' }, 'Dominate Beast': { cond: 'Charmed' },
    'Cause Fear': { cond: 'Frightened' }, 'Fear': { cond: 'Frightened' }, 'Command': { cond: [], rounds: 1, note: 'They follow a one-word command on their next turn' },
    'Entangle': { cond: 'Restrained' }, 'Web': { cond: 'Restrained' }, 'Evard\'s Black Tentacles': { cond: 'Restrained' }, 'Watery Sphere': { cond: 'Restrained' },
    'Grease': { cond: 'Prone' }, 'Earth Tremor': { cond: 'Prone' }, 'Thunderwave': { cond: [], note: 'Pushed 10 ft on a failed save' },
    'Flesh to Stone': { cond: 'Restrained', note: 'Petrified after three failed saves' }, 'Power Word Stun': { cond: 'Stunned', noSave: true }, 'Divine Word': { cond: ['Deafened', 'Blinded'] },
    'Stinking Cloud': { cond: [], note: 'Loses its action on a failed save while in the cloud' }, 'Banishment': { cond: 'Incapacitated', note: 'Banished to another plane' },
    'Otto\'s Irresistible Dance': { cond: [], noSave: true, buff: { note: 'Dancing: disadvantage on DEX saves and attacks; attacks against you have advantage; speed 0' }, rounds: 10 },
    'Bane': { buff: { bane: true } }, 'Slow': { buff: { ac: -2, speedHalf: true, note: '−2 to DEX saves; no reactions; an action or a bonus action, not both' } },
    'Faerie Fire': { buff: { note: 'Attacks against you have advantage; you can’t be invisible' } }, 'Hex': { pick: ABPICK, mk: a => ({ checkDis: [a], note: `Disadvantage on ${ABN[a]} checks` }), label: a => ABN[a], noSave: true },
    'Bestow Curse': { pick: ABPICK, mk: a => ({ checkDis: [a], saveDis: [a], curse: true, note: `Disadvantage on ${ABN[a]} checks and saves` }), label: a => ABN[a] },
    'Ray of Enfeeblement': { buff: { note: 'Your STR-based weapon attacks deal half damage' } }, 'Heat Metal': { noSave: true, buff: { note: 'Fire damage each turn while holding or wearing the metal; disadvantage on attacks and checks if you keep holding it' } },
    'Contagion': { buff: { note: 'Diseased: a magical disease takes hold after three failed saves' } }
  };
  // Abilities used on party members. kind: heal (roll or amount), temp, fx (a timed effect), aura (on while you keep it
  // up — sent to whoever's close enough), insp (a die they can add), cure, stab. cost: 'use' (one use of the feature),
  // 'pool' (points from the feature's pool), {from, n} (another feature's uses), none = free.
  DND.allyFeat = {
    'Bardic Inspiration': { kind: 'insp', die: '1bi', cost: 'use', rounds: 100, text: 'Add the die to one ability check, attack roll or saving throw in the next 10 minutes' },
    'Lay on Hands': { kind: 'heal', pool: true, cureCost: 5, cure: ['Poisoned'], text: 'Spend points from your pool to heal them, or 5 points to cure a disease or neutralize a poison' },
    'Healing Hands': { kind: 'heal', roll: '{prof}d4', cost: 'use' },
    'Healing Hands (MPMM)': { kind: 'heal', roll: '{prof}d4', cost: 'use' },
    'Healing Hands (Volo)': { kind: 'heal', roll: '{level}', cost: 'use' },
    'Healing Light': { kind: 'heal', pool: true, die: 'd6', text: 'Spend dice from your pool (bonus action): they regain the total' },
    'Rallying Cry': { kind: 'heal', roll: '{fighter}', n: 3, text: 'When you use Second Wind: up to three allies within 60 ft regain HP' },
    'Song of Rest': { kind: 'heal', roll: '1d{tier(bard,2,6,9,8,13,10,17,12)}', n: 'any', text: 'After a short rest: allies who spent Hit Dice regain extra HP' },
    'Chef': { kind: 'heal', roll: '1d8', n: '{4+prof}', text: 'After a short rest: allies who spent Hit Dice and ate your food regain extra HP' },
    'Inspiring Leader': { kind: 'temp', roll: '{level+cha}', n: 6, text: '10 minutes of inspiring words: up to six creatures gain temporary HP (once per short or long rest each)' },
    'Healer': { kind: 'heal', roll: '1d6+4+{tlevel}', text: 'With a healer’s kit (action): they regain 1d6 + 4 + their level in HP (once per short or long rest each); or stabilize them and give them 1 HP' },
    'Channel Divinity: Preserve Life': { kind: 'heal', amount: '{5*cleric}', cost: { from: 'Channel Divinity', n: 1 }, n: 'any', split: true, text: 'Share 5 × your cleric level HP among creatures within 30 ft (each up to half its max HP)' },
    'Channel Divinity: Balm of Peace': { kind: 'heal', roll: '2d6+{wis}', n: 'any', cost: { from: 'Channel Divinity', n: 1 } },
    'Channel Divinity: Twilight Sanctuary': { kind: 'temp', roll: '1d6+{cleric}', n: 'any', text: 'A creature ending its turn in the sphere gains temp HP (or ends charmed or frightened)', cure: ['Charmed', 'Frightened'] },
    'Twilight Sanctuary': { kind: 'temp', roll: '1d6+{cleric}', n: 'any', cure: ['Charmed', 'Frightened'] },
    'Celestial Resilience': { kind: 'temp', roll: '{floor(warlock/2)+cha}', n: 5, text: 'After a rest: up to five creatures gain temp HP' },
    'Rally': { kind: 'temp', roll: '1sup+{cha}', cost: { from: 'Combat Superiority', n: 1 }, text: 'A friendly creature that can hear you gains temp HP equal to the die + your CHA' },
    'Mantle of Inspiration': { kind: 'temp', roll: '{tier(bard,3,5,5,8,10,11,15,14)}', n: '{max(1,cha)}', cost: { from: 'Bardic Inspiration', n: 1 }, text: 'Bonus action: creatures you choose gain temp HP and can use their reaction to move' },
    'Spirit Totem: Bear': { kind: 'temp', roll: '5+{druid}', n: 'any' },
    'Aura of Protection': { kind: 'aura', buff: { aura: '{max(1,cha)}' }, label: '+{max(1,cha)} to saves', text: 'Creatures within 10 ft (30 ft at 18th level) add your CHA modifier to their saving throws' },
    'Aura of Courage': { kind: 'aura', buff: { condImmune: ['Frightened'] }, text: 'Can’t be frightened while within your aura' },
    'Aura of Devotion': { kind: 'aura', buff: { condImmune: ['Charmed'] }, text: 'Can’t be charmed while within your aura' },
    'Aura of Warding': { kind: 'aura', buff: { resist: ['damage from spells'] }, text: 'Resistance to damage from spells while within your aura' },
    'Aura of Alacrity': { kind: 'aura', buff: { speed: 10 }, text: '+10 ft walking speed while starting a turn near you' },
    'Aura of the Sentinel': { kind: 'aura', buff: { init: '{prof}', note: 'Add the paladin’s proficiency bonus to initiative' } },
    'Aura of the Guardian': { kind: 'aura', buff: { note: 'The paladin can take damage that would hit you (reaction)' } },
    'Emboldening Bond': { kind: 'fx', cost: 'use', n: '{prof}', rounds: 600, buff: { note: 'Once per turn, add 1d4 to an attack, check or save' }, repeat: { dice: '1d4', type: 'Emboldening Bond' } },
    'Blessing of the Trickster': { kind: 'fx', rounds: 600, buff: { skillAdv: ['Stealth'], note: 'Advantage on Stealth checks' } },
    'Vigilant Blessing': { kind: 'fx', rounds: 14400, buff: { initAdv: true, note: 'Advantage on your next initiative roll' } },
    'Channel Divinity: Knowledge of the Ages': null,
    'Cleansing Touch': { kind: 'cure', endFx: 'spell', cost: 'use', text: 'End one spell on them' },
    'Flash of Genius': { kind: 'insp', flat: '{int}', cost: 'use', rounds: 1, text: 'Reaction: add your INT modifier to their ability check or saving throw' },
    'Bend Luck': { kind: 'insp', die: '1d4', cost: { from: 'Font of Magic', n: 2 }, rounds: 1, text: 'Reaction: add 1d4 to their attack, check or save' },
    'Bolstering Magic': { kind: 'insp', die: '1d3', rounds: 100, text: 'Add 1d3 to attack rolls and ability checks for 10 minutes' },
    'Combat Inspiration': null,
    'Commander\'s Strike': { kind: 'insp', die: '1sup', cost: { from: 'Combat Superiority', n: 1 }, rounds: 1, text: 'They can use their reaction to make one weapon attack, adding the die to the damage' },
    'Maneuvering Attack': { kind: 'fx', cost: { from: 'Combat Superiority', n: 1 }, rounds: 1, buff: { note: 'Reaction: move up to half your speed without provoking opportunity attacks from the target' } },
    'Inspiring Surge': { kind: 'fx', rounds: 1, buff: { note: 'Use your reaction to make one weapon attack' } },
    'Warding Maneuver': { kind: 'fx', die: '1d8', rounds: 1, buff: { note: 'Add the die to your AC against one attack' } },
    'Protective Field': { kind: 'fx', rounds: 1, buff: { note: 'Damage you take from one hit is reduced by the psi warrior’s die + INT' } },
    'Help': { kind: 'fx', rounds: 1, buff: { d20AdvNext: 'Help', note: 'Advantage on your next ability check, or your next attack against the creature you were helped with' } },
    'Stabilize': { kind: 'stab', text: 'Medicine check (DC 10) to stabilize someone at 0 HP' }
  };
})();


// Hand-picked tooltip vignettes: name -> "motif colour" (see src/app12.js).
DND.vfx={"sp":{"Ring of Spell Refueling":"sparkle gold","Whispering Guidance":"speak illu","Cloak of Whispering Veils":"speak illu","Scar Sense":"eye blood","Bionic Eye":"light gold","Bolt Barrel (Arm)":"arrow force","Lightning Scar":"zap lightning","The Mask (Deck of Many Things)":"morph illu","Time Stutter":"time div","Thunderstone Switch":"storm thunder","Blue Dragon Scale Armor":"armor lightning","Rocket Boots":"wings fire","Cutlass of Vengeance":"slash blood","Sword of Justice":"smite radiant","Unarmed Strike":"punch bludgeoning","Flurry of Blows":"punch gold","Acid Splash":"burst acid","Blade Ward":"shield slashing","Booming Blade":"slash thunder","Chill Touch":"bolt necrotic","Control Flames":"wall fire","Create Bonfire":"wall fire","Dancing Lights":"light radiant","Druidcraft":"vines trans","Eldritch Blast":"bolt force","Fire Bolt":"bolt fire","Friends":"charm ench","Frostbite":"burst cold","Green-Flame Blade":"slash fire","Guidance":"bless div","Gust":"gust cold","Infestation":"cloud poison","Light":"light radiant","Lightning Lure":"zap lightning","Mage Hand":"hand conj","Magic Stone":"arrow gold","Mending":"create trans","Message":"speak div","Mind Sliver":"wave psychic","Minor Illusion":"illusion illu","Mold Earth":"quake gold","Poison Spray":"cone poison","Prestidigitation":"sparkle trans","Primal Savagery":"slash acid","Produce Flame":"light fire","Ray of Frost":"bolt cold","Resistance":"shield abj","Sacred Flame":"smite radiant","Shape Water":"water cold","Shillelagh":"slash trans","Shocking Grasp":"zap lightning","Spare the Dying":"heal heal","Sword Burst":"burst force","Thaumaturgy":"sparkle radiant","Thorn Whip":"vines trans","Thunderclap":"storm thunder","Toll the Dead":"curse necrotic","True Strike":"mark div","Vicious Mockery":"speak psychic","Word of Radiance":"aura radiant","Absorb Elements":"shield abj","Alarm":"glyph abj","Animal Friendship":"charm ench","Armor of Agathys":"shield cold","Arms of Hadar":"vines necrotic","Bane":"curse necro","Beast Bond":"wave div","Bless":"bless radiant","Burning Hands":"cone fire","Catapult":"meteor gold","Cause Fear":"fear necro","Ceremony":"bless radiant","Chaos Bolt":"bolt psychic","Charm Person":"charm ench","Chromatic Orb":"bolt force","Color Spray":"cone illu","Command":"speak ench","Compelled Duel":"mark ench","Comprehend Languages":"book div","Create or Destroy Water":"water cold","Cure Wounds":"heal heal","Detect Evil and Good":"eye div","Detect Magic":"eye div","Detect Poison and Disease":"eye poison","Disguise Self":"illusion illu","Dissonant Whispers":"wave psychic","Divine Favor":"smite radiant","Earth Tremor":"quake gold","Ensnaring Strike":"vines trans","Entangle":"vines trans","Expeditious Retreat":"dash trans","Faerie Fire":"light illu","False Life":"heart necro","Feather Fall":"wings trans","Find Familiar":"summon conj","Fog Cloud":"cloud cold","Goodberry":"create heal","Grease":"slip gold","Guiding Bolt":"bolt radiant","Hail of Thorns":"burst trans","Healing Word":"heal heal","Hellish Rebuke":"burst fire","Heroism":"bless gold","Hex":"curse necrotic","Hunter's Mark":"mark blood","Ice Knife":"bolt cold","Identify":"eye div","Illusory Script":"book illu","Inflict Wounds":"bolt necrotic","Jump":"wings trans","Longstrider":"dash trans","Mage Armor":"armor abj","Magic Missile":"bolt force","Protection from Evil and Good":"shield radiant","Purify Food and Drink":"create heal","Ray of Sickness":"bolt poison","Sanctuary":"shield radiant","Searing Smite":"smite fire","Shield":"shield force","Shield of Faith":"shield radiant","Silent Image":"illusion illu","Sleep":"sleep ench","Snare":"glyph trans","Speak with Animals":"speak trans","Tasha's Caustic Brew":"line acid","Tasha's Hideous Laughter":"charm ench","Tenser's Floating Disk":"create conj","Thunderous Smite":"smite thunder","Thunderwave":"gust thunder","Unseen Servant":"hand conj","Witch Bolt":"zap lightning","Wrathful Smite":"smite psychic","Zephyr Strike":"dash cold","Aganazzar's Scorcher":"line fire","Aid":"heart heal","Alter Self":"morph trans","Animal Messenger":"speak trans","Arcane Lock":"lock abj","Augury":"dice div","Barkskin":"armor trans","Beast Sense":"eye trans","Blindness/Deafness":"curse necro","Blur":"illusion illu","Branding Smite":"smite radiant","Calm Emotions":"charm ench","Cloud of Daggers":"burst slashing","Continual Flame":"light fire","Cordon of Arrows":"arrow gold","Crown of Madness":"curse psychic","Darkness":"shadow shadow","Darkvision":"eye div","Detect Thoughts":"wave psychic","Dragon's Breath":"cone fire","Dust Devil":"gust gold","Earthbind":"hold gold","Enhance Ability":"bless trans","Enlarge/Reduce":"morph trans","Enthrall":"charm ench","Find Steed":"steed radiant","Find Traps":"eye div","Flame Blade":"slash fire","Flaming Sphere":"burst fire","Gentle Repose":"shield necro","Gust of Wind":"gust cold","Healing Spirit":"heal heal","Heat Metal":"burst fire","Hold Person":"hold ench","Invisibility":"shadow illu","Knock":"lock trans","Lesser Restoration":"heal heal","Levitate":"wings trans","Locate Animals or Plants":"eye trans","Locate Object":"eye div","Magic Mouth":"speak illu","Magic Weapon":"slash force","Maximilian's Earthen Grasp":"hand gold","Melf's Acid Arrow":"arrow acid","Mind Spike":"wave psychic","Mirror Image":"illusion illu","Misty Step":"teleport conj","Moonbeam":"bless radiant","Nathair's Mischief":"illusion ench","Nystul's Magic Aura":"illusion illu","Pass without Trace":"shadow shadow","Phantasmal Force":"illusion psychic","Prayer of Healing":"heal heal","Protection from Poison":"shield poison","Pyrotechnics":"burst fire","Ray of Enfeeblement":"bolt necrotic","Rime's Binding Ice":"hold cold","Rope Trick":"teleport conj","Scorching Ray":"bolt fire","See Invisibility":"eye div","Shadow Blade":"slash shadow","Shatter":"storm thunder","Silence":"shadow abj","Skywrite":"weather div","Snilloc's Snowball Swarm":"burst cold","Spider Climb":"wings trans","Spike Growth":"vines trans","Spiritual Weapon":"slash force","Suggestion":"charm ench","Summon Beast":"summon trans","Tasha's Mind Whip":"wave psychic","Warding Bond":"shield abj","Warding Wind":"gust cold","Web":"web div","Zone of Truth":"speak ench","Animate Dead":"undead necrotic","Ashardalon's Stride":"dash fire","Aura of Vitality":"aura heal","Beacon of Hope":"bless radiant","Bestow Curse":"curse necrotic","Blinding Smite":"smite radiant","Blink":"teleport conj","Call Lightning":"storm lightning","Catnap":"sleep ench","Clairvoyance":"eye div","Conjure Animals":"summon trans","Conjure Barrage":"cone slashing","Counterspell":"counter force","Create Food and Water":"create heal","Crusader's Mantle":"aura radiant","Daylight":"light radiant","Dispel Magic":"counter abj","Elemental Weapon":"slash fire","Enemies Abound":"curse psychic","Erupting Earth":"quake gold","Fear":"fear necro","Feign Death":"sleep necro","Fireball":"burst fire","Flame Arrows":"arrow fire","Fly":"wings trans","Gaseous Form":"cloud trans","Glyph of Warding":"glyph abj","Haste":"dash trans","Hunger of Hadar":"shadow necrotic","Hypnotic Pattern":"charm ench","Intellect Fortress":"shield psychic","Leomund's Tiny Hut":"shield abj","Life Transference":"heal necrotic","Lightning Arrow":"arrow lightning","Lightning Bolt":"line lightning","Magic Circle":"glyph abj","Major Image":"illusion illu","Mass Healing Word":"heal heal","Meld into Stone":"morph gold","Melf's Minute Meteors":"meteor fire","Nondetection":"shadow abj","Phantom Steed":"steed illu","Plant Growth":"vines trans","Protection from Energy":"shield abj","Remove Curse":"counter radiant","Revivify":"revive radiant","Sending":"speak div","Sleet Storm":"weather cold","Slow":"time trans","Speak with Dead":"speak necro","Speak with Plants":"speak trans","Spirit Guardians":"aura radiant","Spirit Shroud":"aura necrotic","Stinking Cloud":"cloud poison","Summon Fey":"summon ench","Summon Lesser Demons":"summon blood","Summon Shadowspawn":"summon shadow","Summon Undead":"undead necrotic","Thunder Step":"teleport thunder","Tidal Wave":"water cold","Tiny Servant":"summon trans","Tongues":"speak div","Vampiric Touch":"heal necrotic","Wall of Sand":"wall gold","Wall of Water":"wall cold","Water Breathing":"water cold","Water Walk":"water cold","Wind Wall":"gust cold","Arcane Eye":"eye div","Aura of Life":"aura heal","Aura of Purity":"aura radiant","Banishment":"banish conj","Blight":"curse necrotic","Charm Monster":"charm ench","Compulsion":"charm ench","Confusion":"wave psychic","Conjure Minor Elementals":"summon fire","Conjure Woodland Beings":"summon trans","Control Water":"water cold","Death Ward":"shield radiant","Dimension Door":"teleport conj","Divination":"dice div","Dominate Beast":"charm ench","Elemental Bane":"curse fire","Evard's Black Tentacles":"vines shadow","Fabricate":"create trans","Find Greater Steed":"steed radiant","Fire Shield":"shield fire","Freedom of Movement":"dash abj","Giant Insect":"beast trans","Grasping Vine":"vines trans","Greater Invisibility":"shadow illu","Guardian of Faith":"summon radiant","Guardian of Nature":"beast trans","Hallucinatory Terrain":"illusion illu","Ice Storm":"weather cold","Leomund's Secret Chest":"create conj","Locate Creature":"eye div","Mordenkainen's Faithful Hound":"summon conj","Mordenkainen's Private Sanctum":"shield abj","Otiluke's Resilient Sphere":"hold force","Phantasmal Killer":"fear psychic","Polymorph":"beast trans","Raulothim's Psychic Lance":"line psychic","Shadow of Moil":"shadow necrotic","Sickening Radiance":"burst radiant","Staggering Smite":"smite psychic","Stone Shape":"quake gold","Stoneskin":"armor gold","Storm Sphere":"storm lightning","Summon Aberration":"summon psychic","Summon Construct":"summon gold","Summon Elemental":"summon fire","Summon Greater Demon":"summon blood","Vitriolic Sphere":"burst acid","Wall of Fire":"wall fire","Watery Sphere":"hold cold","Animate Objects":"summon trans","Antilife Shell":"shield abj","Awaken":"revive trans","Banishing Smite":"banish force","Bigby's Hand":"hand force","Circle of Power":"aura abj","Cloudkill":"cloud poison","Commune":"bless div","Commune with Nature":"vines trans","Cone of Cold":"cone cold","Conjure Elemental":"summon fire","Conjure Volley":"meteor slashing","Contact Other Plane":"wave psychic","Contagion":"cloud poison","Control Winds":"gust cold","Creation":"create illu","Danse Macabre":"undead necrotic","Dawn":"bless radiant","Destructive Wave":"quake thunder","Dispel Evil and Good":"banish radiant","Dominate Person":"charm ench","Dream":"sleep illu","Enervation":"bolt necrotic","Far Step":"teleport conj","Flame Strike":"smite fire","Geas":"curse ench","Greater Restoration":"heal heal","Hallow":"glyph radiant","Hold Monster":"hold ench","Holy Weapon":"smite radiant","Immolation":"burst fire","Infernal Calling":"summon fire","Insect Plague":"cloud gold","Legend Lore":"book div","Maelstrom":"water cold","Mass Cure Wounds":"heal heal","Mislead":"illusion illu","Modify Memory":"wave psychic","Negative Energy Flood":"undead necrotic","Passwall":"teleport trans","Planar Binding":"glyph abj","Raise Dead":"revive radiant","Rary's Telepathic Bond":"wave psychic","Reincarnate":"revive trans","Scrying":"eye div","Seeming":"illusion illu","Skill Empowerment":"skill trans","Steel Wind Strike":"multi force","Summon Celestial":"summon radiant","Summon Draconic Spirit":"summon fire","Swift Quiver":"arrow gold","Synaptic Static":"burst psychic","Telekinesis":"hand force","Teleportation Circle":"glyph conj","Transmute Rock":"quake gold","Tree Stride":"teleport trans","Wall of Force":"wall force","Wall of Light":"wall radiant","Wall of Stone":"wall gold","Wrath of Nature":"vines trans","Arcane Gate":"banish conj","Blade Barrier":"wall slashing","Bones of the Earth":"quake gold","Chain Lightning":"zap lightning","Circle of Death":"burst necrotic","Conjure Fey":"summon ench","Contingency":"time evoc","Create Homunculus":"summon trans","Create Undead":"undead necrotic","Disintegrate":"bolt force","Drawmij's Instant Summons":"teleport conj","Eyebite":"eye necrotic","Find the Path":"eye div","Fizban's Platinum Shield":"shield abj","Flesh to Stone":"morph gold","Forbiddance":"glyph abj","Globe of Invulnerability":"shield abj","Guards and Wards":"glyph abj","Harm":"curse necrotic","Heal":"heal heal","Heroes' Feast":"create heal","Investiture of Flame":"aura fire","Investiture of Ice":"aura cold","Investiture of Stone":"aura gold","Investiture of Wind":"gust cold","Magic Jar":"banish necro","Mass Suggestion":"charm ench","Mental Prison":"hold psychic","Move Earth":"quake gold","Otiluke's Freezing Sphere":"burst cold","Otto's Irresistible Dance":"music ench","Planar Ally":"summon radiant","Primordial Ward":"shield abj","Programmed Illusion":"illusion illu","Scatter":"teleport conj","Soul Cage":"banish necrotic","Summon Fiend":"summon blood","Sunbeam":"line radiant","Tasha's Otherworldly Guise":"wings radiant","Tenser's Transformation":"rage force","Transport via Plants":"teleport trans","True Seeing":"eye div","Wall of Ice":"wall cold","Wall of Thorns":"vines trans","Wind Walk":"cloud cold","Word of Recall":"teleport radiant","Conjure Celestial":"summon radiant","Crown of Stars":"bolt radiant","Delayed Blast Fireball":"burst fire","Divine Word":"speak radiant","Draconic Transformation":"wings fire","Dream of the Blue Veil":"sleep conj","Etherealness":"shadow conj","Finger of Death":"bolt necrotic","Fire Storm":"weather fire","Forcecage":"hold force","Mirage Arcane":"illusion illu","Mordenkainen's Magnificent Mansion":"banish conj","Mordenkainen's Sword":"slash force","Plane Shift":"banish conj","Power Word Pain":"speak psychic","Prismatic Spray":"cone illu","Project Image":"illusion illu","Regenerate":"heal heal","Resurrection":"revive radiant","Reverse Gravity":"wings trans","Sequester":"hold trans","Simulacrum":"illusion cold","Symbol":"glyph abj","Teleport":"teleport conj","Temple of the Gods":"bless radiant","Whirlwind":"gust cold","Abi-Dalzim's Horrid Wilting":"burst necrotic","Animal Shapes":"beast trans","Antimagic Field":"counter abj","Antipathy/Sympathy":"charm ench","Clone":"illusion necro","Control Weather":"weather cold","Demiplane":"banish conj","Dominate Monster":"charm ench","Earthquake":"quake gold","Feeblemind":"wave psychic","Glibness":"speak ench","Holy Aura":"aura radiant","Illusory Dragon":"cone shadow","Incendiary Cloud":"cloud fire","Maddening Darkness":"shadow psychic","Maze":"banish conj","Mighty Fortress":"wall gold","Mind Blank":"shield psychic","Power Word Stun":"speak force","Sunburst":"burst radiant","Telepathy":"wave psychic","Tsunami":"water cold","Astral Projection":"teleport div","Blade of Disaster":"slash force","Foresight":"eye div","Gate":"banish conj","Imprisonment":"hold abj","Invulnerability":"shield gold","Mass Heal":"heal heal","Mass Polymorph":"beast trans","Meteor Swarm":"meteor fire","Power Word Heal":"heal heal","Power Word Kill":"curse necrotic","Prismatic Wall":"wall illu","Psychic Scream":"wave psychic","Shapechange":"beast trans","Storm of Vengeance":"storm lightning","Time Stop":"time trans","True Polymorph":"morph trans","True Resurrection":"revive radiant","Weird":"fear psychic","Wish":"sparkle gold","Abjure Enemy":"fear radiant","Abjure the Extraplanar":"banish radiant","Arcane Abjuration":"banish abj","Artisan's Blessing":"create gold","Balm of Peace":"heal heal","Canny":"skill gold","Champion Challenge":"mark gold","Charm Animals and Plants":"beast trans","Conjure Duplicate":"illusion illu","Conquering Presence":"fear blood","Destructive Wrath":"storm lightning","Divine Arcana":"sparkle radiant","Emissary of Peace":"speak ench","Guided Strike":"mark gold","Inspiring Smite":"smite radiant","Invoke Duplicity":"illusion illu","Knowledge of the Ages":"book div","Nature's Wrath":"vines trans","Order's Demand":"charm ench","Pact of the Star Chain":"book radiant","Path to the Grave":"curse necrotic","Peerless Athlete":"dash gold","Poison Strike":"bolt poison","Preserve Life":"heal heal","Radiance of the Dawn":"light radiant","Radiant Defense":"shield radiant","Read Thoughts":"eye psychic","Rebuke the Violent":"counter radiant","Roving":"dash trans","Sacred Weapon":"light radiant","Shared Burden":"heart abj","Spirits of the City":"summon gold","Strands of Fate":"dice div","Tireless":"heart heal","Turn the Faithless":"fear radiant","Turn the Tide":"heal heal","Turn the Unholy":"fear radiant","Twilight Sanctuary":"aura div","Vow of Enmity":"mark blood","War God's Blessing":"bless gold","Watcher's Will":"shield psychic","Absorption":"counter abj","Acid Resistance":"shield acid","Acid Stream":"line acid","Acrobat":"dash gold","Adaptive Body":"morph trans","Alchemical Casting":"sparkle trans","Alchemist":"create trans","Ancient Companion":"summon div","Ancient Fortitude":"heart heal","Anger of a Gentle Soul":"rage blood","Animal Companion":"beast trans","Animal Handler":"beast gold","Arcane Acolyte":"bless radiant","Arcane Dabbler":"book evoc","Arcane Hacking":"glyph psychic","Arcane High Priest":"bless radiant","Arcane Priest":"bless radiant","Arcane Rebuke":"counter force","Arcane Weapon":"slash force","Arcanist":"book evoc","Arcanomechanical Armor":"armor force","Armor Training":"armor gold","Armored Plating":"armor bludgeoning","Artificer's Lore":"book gold","Artificial Mind":"speak psychic","Astral Refuge":"teleport psychic","Astral Sequestration":"banish psychic","Audience with Death":"undead necrotic","Aura Sight":"eye psychic","Aura of Treachery":"curse shadow","Avatar of Healing":"aura heal","Avatar of Speed":"aura trans","Awakened Talent":"skill psychic","Balance Chaos":"dice gold","Beacon":"light radiant","Beast's Defense":"shield trans","Beasthide Shift":"beast trans","Bestial Form":"beast trans","Blackguard's Escape":"shadow shadow","Blade Mastery":"slash slashing","Blade Meld":"slash psychic","Blessing of the All Father":"bless gold","Blind Spot":"shadow psychic","Block Watch":"eye gold","Bolts from the Grave":"bolt necrotic","Bonus Disciplines":"sparkle psychic","Brawny":"punch bludgeoning","Breadth of Knowledge":"book div","Brute Force":"crit bludgeoning","Brutish Durability":"heart gold","Burglar":"lock gold","Cantrip":"sparkle evoc","Careful Eyes":"eye gold","Celerity":"dash psychic","Chained Device":"lock force","Channel Arcana":"sparkle evoc","Chaotic Fury":"dice blood","Chromatic Warding":"shield gold","Close Quarters Shooter":"arrow piercing","Close-Quarters Shooting":"arrow piercing","Cloud Giant":"teleport cold","Commune with City":"speak gold","Companion's Bond":"heart trans","Conjure Barlgura":"summon blood","Conjure Knowbot":"summon force","Conjure Shadow Demon":"summon shadow","Conjure Vrock":"summon blood","Connect with the Dead":"speak necrotic","Construct":"armor bludgeoning","Consumptive Knife":"slash necrotic","Consumptive Power":"heart necrotic","Coordinated Attack":"multi gold","Corrosive Metabolism":"cloud acid","Creative Skills":"skill gold","Crown of Despair":"curse psychic","Crown of Disgust":"curse poison","Crown of Rage":"rage blood","Curse of the Sea":"curse cold","Deep Stalker Magic":"eye shadow","Defender's Blade":"slash gold","Delusion":"illusion psychic","Devastating Critical":"crit blood","Devastation":"burst force","Digital Phantom":"illusion force","Diminution":"morph psychic","Diplomat":"speak ench","Dissolution":"burst acid","Divine Inspiration":"bless radiant","Douse the Flames of War":"heal cold","Draconic Resistance":"shield gold","Drow Magic":"shadow shadow","Drow Weapon Training":"slash shadow","Duergar Resilience":"shield psychic","Dwarven Armor Training":"armor gold","Dwarven Toughness":"heart heal","Earth Master's Aegis":"armor bludgeoning","Earth Walk":"quake bludgeoning","Effortless Journey":"dash gold","Ego Whip":"wave psychic","Elemental Attunement":"sparkle evoc","Elemental Mastery":"shield evoc","Elf Cantrip":"sparkle evoc","Elf Weapon Training":"slash gold","Elf Weapon Training or Fleet of Foot":"dash gold","Eloquent Apprentice":"speak radiant","Empathic":"heart psychic","Empowered Psionics":"burst psychic","Enduring Unity":"heart abj","Energy Beam":"bolt psychic","Engraved Enmity":"mark blood","Essence Tap":"heal necrotic","Ethereal Jaunt":"shadow conj","Expanded Spell List":"book necro","Express Transit":"teleport gold","Extract Name":"speak psychic","Far Wanderer":"sparkle cold","Fateful Naming":"speak div","Favored Medium":"sparkle evoc","Fell Handed":"crit slashing","Find Vehicle":"summon gold","Fire Giant":"punch fire","Fire Resistance":"shield fire","Flail Mastery":"punch bludgeoning","Flame Stride":"dash fire","Fleet of Foot":"dash trans","Focused Expression":"bolt evoc","Fool's Insight":"eye psychic","Fool's Luck":"dice gold","Form of the Phoenix":"wings fire","Frost Giant":"punch cold","Functions of Probability":"dice div","Gem Flight":"wings gold","Giant Growth":"morph trans","Gourmand":"create gold","Greater Favored Enemy":"mark gold","Grugach Weapon Training":"arrow trans","Guardian Aura":"aura heal","Guardian Magic":"sparkle trans","Guardian Soul":"morph trans","Guiding Hand":"hand div","Harvest's Scythe":"slash necrotic","Haywire":"zap lightning","Healing Elixir":"heal heal","Heart of the City":"aura gold","Hermit's Study":"book div","Hill Giant":"punch bludgeoning","Historian":"book div","History's Whims":"dice div","Hone the Blade":"slash psychic","Human Revenant":"revive necrotic","Hunter's Mysticism":"eye trans","Icingdeath's Frost":"cone cold","Icon of Deceit":"shadow illu","Id Insinuation":"wave psychic","Ignite":"burst fire","Immortal Durability":"heart heal","Immortal Will":"revive psychic","Impeccable Physicality":"dash gold","Implacable Mark":"mark gold","Indomitable Defense":"shield abj","Inexorable Pronouncement":"speak force","Infallible Relay":"speak lightning","Infoportation":"teleport psychic","Information Overload":"wave psychic","Information Surge":"zap lightning","Infuse Potions":"morph trans","Infuse Scrolls":"book evoc","Infuse Weapons and Armor":"armor force","Infusion of Eloquence":"morph psychic","Inky Shroud":"shadow shadow","Insightful Striking":"mark psychic","Investigator":"eye div","Invisibility to Cameras":"shadow illu","Iron Durability":"armor bludgeoning","Jotun Resilience":"heart cold","Kinetic Artistry":"dash gold","Lashing Tail":"slash bludgeoning","Lessons of the Past":"book div","Light Step":"dash psychic","Lightning Resistance":"shield lightning","Lingering Magic":"eye div","Living Construct":"heal bludgeoning","Longtooth Shift":"beast blood","Lore Master":"book div","Lorehold Spells":"book radiant","Magic Reserves":"sparkle evoc","Mantle of Awe":"charm psychic","Mantle of Command":"speak psychic","Mantle of Courage":"bless psychic","Mantle of Fear":"fear psychic","Mantle of Flame":"aura fire","Mantle of Fury":"rage psychic","Mantle of Joy":"heart psychic","Mariner":"water cold","Mark of the Ordning":"glyph gold","Mask of the Wild":"shadow trans","Master Artificer":"create gold","Master of Disguise":"illusion illu","Master of Magic":"sparkle evoc","Mastery of Air":"gust psychic","Mastery of Fire":"burst fire","Mastery of Force":"hand force","Mastery of Ice":"cone cold","Mastery of Light and Darkness":"light shadow","Mastery of Water":"water cold","Mastery of Weather":"weather lightning","Mastery of Wood and Earth":"vines bludgeoning","Medic":"heal heal","Memory of One Thousand Steps":"time psychic","Mental Barrier":"shield psychic","Metabolic Control":"heart psychic","Metal Magic":"slash force","Metallic Breath Weapon":"cone gold","Mind Meld":"speak psychic","Mind Network":"speak psychic","Mind Overload":"wave psychic","Mind Slam":"punch psychic","Mind Thrust":"bolt psychic","Monster Slayer":"slash gold","Mystic Charm":"charm psychic","Mystic Hand":"hand psychic","Mystic Order":"sparkle psychic","Mystical Recovery":"heal psychic","Natural Illusionist":"illusion illu","Naturalist":"vines trans","Naturally Stealthy":"shadow shadow","Necrotic Ancestry":"cone necrotic","Necrotic Shroud":"fear necrotic","Noble Cavalry":"dash gold","Nomadic Arrow":"arrow psychic","Nomadic Chameleon":"shadow psychic","Nomadic Mind":"eye psychic","Nomadic Step":"teleport psychic","Nourishing Fire":"heal fire","Null Equation":"counter force","Nullification":"counter abj","Omens and Portents":"eye div","On/Off":"zap lightning","Online Casting":"zap lightning","Ordered Mind":"eye psychic","Path of Tranquility":"shield abj","Paths of the Dead":"shadow necro","Perceptive":"eye gold","Performer":"music ench","Personal Encryption":"lock psychic","Phantom Knife":"slash psychic","Phoenix Spark":"revive fire","Piercing Thorns":"vines piercing","Potent Psionics":"burst psychic","Precognition":"eye psychic","Prodigious Inspiration":"music ench","Prodigious Memory":"book psychic","Program Spell":"glyph lightning","Protection from Ballistics":"shield piercing","Psionic Blast":"cone psychic","Psionic Body":"armor psychic","Psionic Devotion":"sparkle psychic","Psionic Focus":"sparkle psychic","Psionic Investigation":"eye psychic","Psionic Mastery":"sparkle psychic","Psionic Mind":"speak psychic","Psionic Resilience":"shield psychic","Psionic Restoration":"heal psychic","Psionic Surge":"burst psychic","Psionic Weapon":"slash psychic","Psionics":"sparkle psychic","Psychic Assault":"wave psychic","Psychic Damage":"bolt psychic","Psychic Disruption":"wave psychic","Psychic Focus":"sparkle psychic","Psychic Hammer":"punch psychic","Psychic Inquisition":"eye psychic","Psychic Phantoms":"illusion psychic","Puppet":"charm ench","Puppetry":"charm ench","Quandrix Spells":"book div","Quantum Tunneling":"teleport force","Queen's Right Hand":"bolt necrotic","Quick-Fingered":"hand gold","Radiant Consumption":"aura radiant","Radiant Resistance":"shield radiant","Rage of Fallen Ostoria":"rage cold","Raven's Shield":"shield shadow","Reckless Casting":"dice evoc","Relentless Naming":"speak force","Relentless Nature":"revive necrotic","Remote Access":"zap lightning","Resonant Utterance":"speak force","Revived Nature":"revive heal","Rooted Defense":"vines trans","Rune Maven":"glyph evoc","Runes of Understanding":"glyph div","Runic Empowerment":"glyph force","Sense Emotion":"heart psychic","Sentinel Raven":"wings shadow","Shield Training":"shield gold","Shield of the Faithful":"shield radiant","Shielding Aurora":"shield radiant","Shifting Form":"water trans","Shutdown":"wave lightning","Sigils of Warding":"glyph abj","Silent Speech":"speak psychic","Silver-Tongued":"speak ench","Silvery Barbs":"counter ench","Skill Versatility":"skill gold","Snap Shot":"arrow gold","Soul Knife":"slash psychic","Soul of Lost Ostoria":"sparkle cold","Soul of the Raven":"wings shadow","Soul of the Sea":"water cold","Speak with Small Beasts":"beast trans","Spear Mastery":"line piercing","Spectral Form":"shadow necro","Speech Beyond the Grave":"speak necrotic","Spell Secrets":"morph evoc","Spirit of Death":"undead necrotic","Stalker's Dodge":"shadow shadow","Stealthy":"shadow shadow","Stone Aegis":"shield bludgeoning","Stone Camouflage":"shadow bludgeoning","Stone Giant":"quake bludgeoning","Stone's Durability":"armor bludgeoning","Stone's Edge":"burst bludgeoning","Storm Giant":"storm lightning","Storm of Claws and Fangs":"beast blood","Stout Resilience":"shield poison","Strength of Mind":"shield psychic","Sudden Awakening":"light radiant","Summon Warrior Spirit":"summon gold","Superior Artificer":"create gold","Superior Beast's Defense":"shield trans","Superior Teleportation":"teleport psychic","Surge of Health":"heal heal","Swiftstride Shift":"dash trans","Swim Speed":"water cold","Sylvan Tongue":"speak trans","Sympathy":"heart ench","Synchronicity":"time div","System Backdoor":"glyph lightning","Tandem Tactician":"multi gold","Technological Savant":"glyph lightning","Technovirus":"curse lightning","Telepathic Contact":"speak psychic","Theologian":"book radiant","Third Eye":"eye psychic","Thought Form":"morph psychic","Thought Shield":"shield psychic","Thought Travel":"teleport psychic","Tiefling Revenant":"revive fire","Ties That Bind":"hold ench","Tinker":"create gold","Tokens of Past Lives":"sparkle div","Tools of the Inventor":"create trans","Tower of Iron Will":"shield psychic","Tracker":"eye trans","Tumbling Fool":"dash gold","Tunnel Fighter":"shield gold","Underdark Scout":"shadow shadow","Unending Breath":"heart cold","Velocity Shift":"time force","Versatile":"skill gold","Vestigial Wings":"wings fire","Visions of the Future":"eye div","War Echoes":"slash div","Watcher at the Threshold":"shield radiant","Water Soul":"water cold","Watery Defense":"water cold","Wild Cunning":"vines trans","Wild Talent":"sparkle psychic","Wildhunt Shift":"eye trans","Winged":"wings fire","Wire Walk":"teleport lightning","Wiry Frame":"dash gold","Witherbloom Adept":"heal necrotic","Witherbloom Brew":"morph heal","Witherbloom Spells":"book necrotic","Withering Vortex":"curse necrotic","Word of Power":"speak force"},"f":{"Ring of Spell Refueling":"sparkle gold","Whispering Guidance":"speak illu","Cloak of Whispering Veils":"speak illu","Scar Sense":"eye blood","Bionic Eye":"light gold","Bolt Barrel (Arm)":"arrow force","Lightning Scar":"zap lightning","The Mask (Deck of Many Things)":"morph illu","Time Stutter":"time div","Thunderstone Switch":"storm thunder","Blue Dragon Scale Armor":"armor lightning","Rocket Boots":"wings fire","Cutlass of Vengeance":"slash blood","Sword of Justice":"smite radiant","Unarmed Strike":"punch bludgeoning","Flurry of Blows":"punch gold","Rage":"rage blood","Unarmored Defense":"armor gold","Reckless Attack":"slash blood","Danger Sense":"eye gold","Extra Attack":"multi slashing","Fast Movement":"dash trans","Feral Instinct":"eye blood","Brutal Critical":"crit blood","Relentless Rage":"heart blood","Persistent Rage":"rage blood","Indomitable Might":"rage gold","Primal Champion":"rage gold","Frenzy":"multi blood","Mindless Rage":"shield blood","Intimidating Presence":"fear blood","Retaliation":"slash blood","Spirit Seeker":"speak trans","Totem Spirit":"beast trans","Aspect of the Beast":"beast trans","Spirit Walker":"vines trans","Totemic Attunement":"aura trans","Ancestral Protectors":"summon cold","Spirit Shield":"shield cold","Consult the Spirits":"eye cold","Vengeful Ancestors":"bolt force","Storm Aura":"aura lightning","Storm Soul":"shield lightning","Shielding Storm":"aura cold","Raging Storm":"storm lightning","Divine Fury":"smite radiant","Warrior of the Gods":"revive radiant","Fanatical Focus":"dice radiant","Zealous Presence":"aura radiant","Rage Beyond Death":"rage radiant","Form of the Beast":"beast blood","Bestial Soul":"beast trans","Infectious Fury":"curse psychic","Call the Hunt":"aura blood","Magic Awareness":"eye illu","Wild Surge":"sparkle illu","Bolstering Magic":"bless illu","Unstable Backlash":"burst illu","Controlled Surge":"dice illu","Battlerager Armor":"armor slashing","Reckless Abandon":"heart blood","Battlerager Charge":"dash blood","Spiked Retribution":"burst slashing","Giant's Power":"speak gold","Giant's Havoc":"morph gold","Elemental Cleaver":"slash fire","Mighty Impel":"gust gold","Demiurgic Colossus":"morph gold","Spellcasting":"book evoc","Bardic Inspiration":"music ench","Jack of All Trades":"skill gold","Song of Rest":"music heal","Expertise":"skill gold","Font of Inspiration":"music ench","Countercharm":"music abj","Magical Secrets":"book ench","Superior Inspiration":"music ench","Bonus Proficiencies":"skill gold","Cutting Words":"speak psychic","Additional Magical Secrets":"book ench","Peerless Skill":"skill ench","Combat Inspiration":"music slashing","Battle Magic":"slash ench","Mantle of Inspiration":"aura ench","Enthralling Performance":"music ench","Mantle of Majesty":"bless ench","Unbreakable Majesty":"shield ench","Fighting Style":"slash slashing","Blade Flourish":"multi ench","Master's Flourish":"multi ench","Psychic Blades":"slash psychic","Words of Terror":"fear psychic","Mantle of Whispers":"illusion shadow","Shadow Lore":"charm shadow","Mote of Potential":"music trans","Performance of Creation":"create trans","Animating Performance":"summon trans","Creative Crescendo":"create trans","Silver Tongue":"speak ench","Unsettling Words":"speak psychic","Unfailing Inspiration":"music ench","Universal Speech":"speak ench","Infectious Inspiration":"music ench","Guiding Whispers":"bless div","Spiritual Focus":"eye necro","Tales from Beyond":"book necro","Spirit Session":"book necro","Mystical Connection":"dice necro","Channel Divinity":"bless radiant","Turn Undead":"fear radiant","Destroy Undead":"smite radiant","Divine Intervention":"bless radiant","Divine Intervention Improvement":"bless radiant","Blessings of Knowledge":"book div","Channel Divinity: Knowledge of the Ages":"book div","Channel Divinity: Read Thoughts":"wave psychic","Potent Spellcasting":"bolt radiant","Visions of the Past":"eye div","Bonus Proficiency":"armor gold","Disciple of Life":"heal heal","Channel Divinity: Preserve Life":"heal heal","Blessed Healer":"heal heal","Divine Strike":"smite radiant","Supreme Healing":"heal heal","Bonus Cantrip":"light radiant","Warding Flare":"light radiant","Channel Divinity: Radiance of the Dawn":"burst radiant","Improved Flare":"light radiant","Corona of Light":"aura radiant","Acolyte of Nature":"vines trans","Channel Divinity: Charm Animals and Plants":"charm trans","Dampen Elements":"shield abj","Master of Nature":"vines trans","Wrath of the Storm":"zap lightning","Channel Divinity: Destructive Wrath":"storm lightning","Thunderbolt Strike":"gust thunder","Stormborn":"wings lightning","Blessing of the Trickster":"shadow illu","Channel Divinity: Invoke Duplicity":"illusion illu","Channel Divinity: Cloak of Shadows":"shadow shadow","Improved Duplicity":"illusion illu","War Priest":"multi slashing","Channel Divinity: Guided Strike":"mark radiant","Channel Divinity: War God's Blessing":"bless radiant","Avatar of Battle":"armor gold","Blessing of the Forge":"create fire","Channel Divinity: Artisan's Blessing":"create fire","Soul of the Forge":"armor fire","Saint of Forge and Fire":"shield fire","Circle of Mortality":"heal necro","Eyes of the Grave":"eye necro","Channel Divinity: Path to the Grave":"curse necrotic","Sentinel at Death's Door":"shield necro","Keeper of Souls":"heal necro","Voice of Authority":"speak ench","Channel Divinity: Order's Demand":"charm ench","Embodiment of the Law":"charm ench","Order's Wrath":"curse psychic","Implement of Peace":"skill gold","Emboldening Bond":"bless heal","Channel Divinity: Balm of Peace":"heal heal","Protective Bond":"teleport abj","Expansive Bond":"teleport abj","Eyes of Night":"eye shadow","Vigilant Blessing":"bless div","Channel Divinity: Twilight Sanctuary":"aura div","Steps of Night":"wings shadow","Twilight Shroud":"shield shadow","Arcane Initiate":"book evoc","Channel Divinity: Arcane Abjuration":"banish abj","Spell Breaker":"counter heal","Arcane Mastery":"book evoc","Druidic":"speak trans","Wild Shape":"beast trans","Timeless Body":"time trans","Beast Spells":"beast trans","Archdruid":"beast trans","Natural Recovery":"moon trans","Circle Spells":"vines trans","Land's Stride":"dash trans","Nature's Ward":"shield trans","Nature's Sanctuary":"vines trans","Combat Wild Shape":"beast blood","Circle Forms":"beast trans","Primal Strike":"slash trans","Elemental Wild Shape":"summon fire","Thousand Forms":"morph trans","Balm of the Summer Court":"heal heal","Hearth of Moonlight and Shadow":"moon shadow","Hidden Paths":"teleport trans","Walker in Dreams":"sleep div","Speech of the Woods":"speak trans","Spirit Totem":"summon trans","Mighty Summoner":"summon trans","Guardian Spirit":"heal trans","Faithful Summons":"summon trans","Halo of Spores":"cloud necrotic","Symbiotic Entity":"aura necrotic","Fungal Infestation":"undead necrotic","Spreading Spores":"cloud necrotic","Fungal Body":"shield necrotic","Star Map":"book div","Starry Form":"bless radiant","Cosmic Omen":"dice div","Twinkling Constellations":"sparkle radiant","Full of Stars":"shield radiant","Summon Wildfire Spirit":"summon fire","Enhanced Bond":"burst fire","Cauterizing Flames":"heal fire","Blazing Revival":"revive fire","Second Wind":"heal heal","Action Surge":"dash gold","Indomitable":"dice gold","Improved Critical":"crit gold","Remarkable Athlete":"skill gold","Additional Fighting Style":"slash slashing","Superior Critical":"crit gold","Survivor":"heal heal","Combat Superiority":"dice slashing","Student of War":"skill gold","Know Your Enemy":"eye div","Improved Combat Superiority":"dice slashing","Relentless":"dice slashing","Weapon Bond":"teleport force","War Magic":"slash evoc","Eldritch Strike":"slash force","Arcane Charge":"teleport force","Improved War Magic":"slash evoc","Arcane Archer Lore":"book trans","Arcane Shot":"arrow force","Magic Arrow":"arrow force","Curving Shot":"arrow force","Ever-Ready Shot":"arrow gold","Born to the Saddle":"beast gold","Unwavering Mark":"mark gold","Warding Maneuver":"shield gold","Hold the Line":"hold gold","Ferocious Charger":"dash blood","Vigilant Defender":"shield gold","Fighting Spirit":"rage gold","Elegant Courtier":"speak gold","Tireless Spirit":"rage gold","Rapid Strike":"multi slashing","Strength before Death":"revive blood","Psionic Power":"wave psychic","Telekinetic Adept":"hand psychic","Guarded Mind":"shield psychic","Bulwark of Force":"shield force","Telekinetic Master":"hand psychic","Rune Carver":"glyph gold","Giant's Might":"morph gold","Runic Shield":"shield gold","Great Stature":"morph gold","Master of Runes":"glyph gold","Runic Juggernaut":"morph gold","Rallying Cry":"heal heal","Royal Envoy":"speak gold","Inspiring Surge":"bless gold","Bulwark":"shield gold","Martial Arts":"punch gold","Ki":"punch trans","Unarmored Movement":"dash trans","Deflect Missiles":"hand gold","Slow Fall":"wings trans","Stunning Strike":"punch thunder","Ki-Empowered Strikes":"punch force","Evasion":"dash gold","Stillness of Mind":"moon div","Purity of Body":"shield poison","Tongue of the Sun and Moon":"speak radiant","Diamond Soul":"shield radiant","Empty Body":"shadow force","Perfect Self":"punch radiant","Open Hand Technique":"punch gold","Wholeness of Body":"heal heal","Tranquility":"moon heal","Quivering Palm":"punch necrotic","Shadow Arts":"shadow shadow","Shadow Step":"teleport shadow","Cloak of Shadows":"shadow shadow","Opportunist":"slash shadow","Disciple of the Elements":"burst fire","Drunken Technique":"dash gold","Tipsy Sway":"illusion gold","Drunkard's Luck":"dice gold","Intoxicated Frenzy":"punch gold","Path of the Kensei":"slash gold","One with the Blade":"slash force","Sharpen the Blade":"slash force","Unerring Accuracy":"mark gold","Touch of Death":"heart necrotic","Hour of Reaping":"fear necrotic","Mastery of Death":"revive necrotic","Touch of the Long Death":"punch necrotic","Radiant Sun Bolt":"bolt radiant","Searing Arc Strike":"cone fire","Searing Sunburst":"burst radiant","Sun Shield":"aura radiant","Implements of Mercy":"skill heal","Hand of Healing":"heal heal","Hand of Harm":"punch necrotic","Physician's Touch":"heal heal","Flurry of Healing and Harm":"punch heal","Hand of Ultimate Mercy":"revive heal","Arms of the Astral Self":"hand psychic","Visage of the Astral Self":"eye psychic","Body of the Astral Self":"shield psychic","Awakened Astral Self":"aura psychic","Draconic Disciple":"punch fire","Breath of the Dragon":"cone fire","Wings Unfurled":"wings fire","Aspect of the Wyrm":"aura fire","Ascendant Aspect":"cone fire","Divine Sense":"eye radiant","Lay on Hands":"heal heal","Divine Smite":"smite radiant","Divine Health":"shield heal","Aura of Protection":"aura gold","Aura of Courage":"aura radiant","Improved Divine Smite":"smite radiant","Cleansing Touch":"counter radiant","Channel Divinity: Sacred Weapon":"slash radiant","Channel Divinity: Turn the Unholy":"fear radiant","Aura of Devotion":"aura radiant","Purity of Spirit":"shield radiant","Holy Nimbus":"aura radiant","Channel Divinity: Nature's Wrath":"vines trans","Channel Divinity: Turn the Faithless":"fear trans","Aura of Warding":"aura trans","Undying Sentinel":"revive trans","Elder Champion":"aura trans","Channel Divinity: Abjure Enemy":"fear blood","Channel Divinity: Vow of Enmity":"mark blood","Relentless Avenger":"dash blood","Soul of Vengeance":"slash blood","Avenging Angel":"wings blood","Channel Divinity: Conquering Presence":"fear necro","Aura of Conquest":"aura necro","Scornful Rebuke":"burst psychic","Invincible Conqueror":"rage necro","Channel Divinity: Emissary of Peace":"speak radiant","Channel Divinity: Rebuke the Violent":"burst radiant","Aura of the Guardian":"aura abj","Protective Spirit":"heal heal","Emissary of Redemption":"shield radiant","Channel Divinity: Peerless Athlete":"dash gold","Channel Divinity: Inspiring Smite":"smite gold","Aura of Alacrity":"aura trans","Glorious Defense":"shield gold","Living Legend":"bless gold","Channel Divinity: Watcher's Will":"bless div","Channel Divinity: Abjure the Extraplanar":"banish div","Aura of the Sentinel":"aura div","Vigilant Rebuke":"bolt force","Mortal Bulwark":"eye div","Channel Divinity: Champion Challenge":"mark gold","Channel Divinity: Turn the Tide":"heal heal","Divine Allegiance":"shield gold","Unyielding Spirit":"shield gold","Exalted Champion":"aura gold","Favored Enemy":"mark blood","Natural Explorer":"dash trans","Primeval Awareness":"eye trans","Hide in Plain Sight":"shadow trans","Vanish":"shadow shadow","Feral Senses":"eye trans","Foe Slayer":"crit blood","Hunter's Prey":"mark blood","Defensive Tactics":"shield trans","Multiattack":"multi slashing","Superior Hunter's Defense":"shield trans","Ranger's Companion":"summon trans","Exceptional Training":"beast trans","Bestial Fury":"beast blood","Share Spells":"wave trans","Dread Ambusher":"dash shadow","Umbral Sight":"eye shadow","Iron Mind":"shield psychic","Stalker's Flurry":"multi shadow","Shadowy Dodge":"shadow shadow","Detect Portal":"eye conj","Planar Warrior":"slash force","Ethereal Step":"teleport conj","Distant Strike":"teleport force","Spectral Defense":"shield conj","Hunter's Sense":"eye blood","Slayer's Prey":"mark blood","Supernatural Defense":"shield blood","Magic-User's Nemesis":"counter force","Slayer's Counter":"slash blood","Dreadful Strikes":"slash psychic","Otherworldly Glamour":"charm ench","Beguiling Twist":"charm ench","Fey Reinforcements":"summon ench","Misty Wanderer":"teleport ench","Gathered Swarm":"cloud gold","Writhing Tide":"wings gold","Mighty Swarm":"cloud gold","Swarming Dispersal":"teleport gold","Draconic Gift":"speak fire","Drake Companion":"summon fire","Bond of Fang and Scale":"wings fire","Drake's Breath":"cone fire","Perfected Bond":"summon fire","Sneak Attack":"slash shadow","Thieves' Cant":"speak shadow","Cunning Action":"dash shadow","Steady Aim":"mark gold","Uncanny Dodge":"shield shadow","Reliable Talent":"skill gold","Blindsense":"eye shadow","Slippery Mind":"shield psychic","Elusive":"dash shadow","Stroke of Luck":"dice gold","Fast Hands":"hand gold","Second-Story Work":"wings trans","Supreme Sneak":"shadow shadow","Use Magic Device":"sparkle gold","Thief's Reflexes":"time gold","Assassinate":"crit shadow","Infiltration Expertise":"illusion illu","Impostor":"illusion illu","Death Strike":"crit necrotic","Mage Hand Legerdemain":"hand illu","Magical Ambush":"shadow illu","Versatile Trickster":"hand illu","Spell Thief":"counter illu","Ear for Deceit":"speak div","Eye for Detail":"eye div","Insightful Fighting":"eye slashing","Steady Eye":"eye div","Unerring Eye":"eye div","Eye for Weakness":"crit div","Master of Intrigue":"illusion illu","Master of Tactics":"bless gold","Insightful Manipulator":"eye psychic","Misdirection":"illusion illu","Soul of Deceit":"shield psychic","Skirmisher":"dash trans","Survivalist":"skill trans","Superior Mobility":"dash trans","Ambush Master":"dash shadow","Sudden Strike":"multi shadow","Fancy Footwork":"dash gold","Rakish Audacity":"slash gold","Panache":"charm ench","Elegant Maneuver":"dash gold","Master Duelist":"dice gold","Whispers of the Dead":"speak necro","Wails from the Grave":"wave necrotic","Tokens of the Departed":"create necro","Ghost Walk":"shadow necro","Death's Friend":"undead necro","Soul Blades":"slash psychic","Psychic Veil":"shadow psychic","Rend Mind":"wave psychic","Font of Magic":"sparkle evoc","Metamagic":"sparkle evoc","Sorcerous Restoration":"moon evoc","Dragon Ancestor":"wings fire","Draconic Resilience":"armor fire","Elemental Affinity":"burst fire","Dragon Wings":"wings fire","Draconic Presence":"fear fire","Wild Magic Surge":"sparkle illu","Tides of Chaos":"dice illu","Bend Luck":"dice illu","Controlled Chaos":"dice illu","Spell Bombardment":"burst illu","Divine Magic":"bless radiant","Favored by the Gods":"bless radiant","Empowered Healing":"heal heal","Otherworldly Wings":"wings radiant","Unearthly Recovery":"heal radiant","Eyes of the Dark":"eye shadow","Strength of the Grave":"revive shadow","Hound of Ill Omen":"summon shadow","Shadow Walk":"teleport shadow","Umbral Form":"shadow shadow","Wind Speaker":"speak cold","Tempestuous Magic":"wings lightning","Heart of the Storm":"storm lightning","Storm Guide":"weather cold","Storm's Fury":"zap lightning","Wind Soul":"wings lightning","Telepathic Speech":"wave psychic","Psionic Sorcery":"wave psychic","Psychic Defenses":"shield psychic","Revelation in Flesh":"morph psychic","Warping Implosion":"teleport psychic","Clockwork Magic":"time gold","Restore Balance":"time gold","Bastion of Law":"shield gold","Trance of Order":"time gold","Clockwork Cavalcade":"heal gold","Pact Magic":"book necro","Eldritch Invocations":"book force","Pact Boon":"book force","Mystic Arcanum":"book necro","Eldritch Master":"moon necro","Fey Presence":"charm ench","Misty Escape":"teleport ench","Beguiling Defenses":"shield ench","Dark Delirium":"illusion ench","Dark One's Blessing":"heart fire","Dark One's Own Luck":"dice fire","Fiendish Resilience":"shield fire","Hurl Through Hell":"banish fire","Awakened Mind":"wave psychic","Entropic Ward":"shield psychic","Thought Shield":"shield psychic","Create Thrall":"charm psychic","Bonus Cantrips":"light radiant","Healing Light":"heal radiant","Radiant Soul":"aura radiant","Celestial Resilience":"heart radiant","Searing Vengeance":"revive radiant","Hexblade's Curse":"curse necro","Hex Warrior":"slash necro","Accursed Specter":"undead necro","Armor of Hexes":"shield necro","Master of Hexes":"curse necro","Tentacle of the Deeps":"vines cold","Gift of the Sea":"water cold","Oceanic Soul":"water cold","Guardian Coil":"shield cold","Grasping Tentacles":"vines shadow","Fathomless Plunge":"teleport cold","Genie's Vessel":"create gold","Elemental Gift":"wings gold","Sanctuary Vessel":"create gold","Limited Wish":"sparkle gold","Among the Dead":"undead necro","Defy Death":"revive necro","Undying Nature":"heart necro","Indestructible Life":"heal necro","Form of Dread":"fear necro","Grave Touched":"curse necrotic","Necrotic Husk":"burst necrotic","Spirit Projection":"teleport necro","Arcane Recovery":"moon evoc","Spell Mastery":"book evoc","Signature Spells":"book evoc","Abjuration Savant":"book abj","Arcane Ward":"shield abj","Projected Ward":"shield abj","Improved Abjuration":"counter abj","Spell Resistance":"shield abj","Conjuration Savant":"book conj","Minor Conjuration":"create conj","Benign Transposition":"teleport conj","Focused Conjuration":"summon conj","Durable Summons":"summon conj","Divination Savant":"book div","Portent":"dice div","Expert Divination":"eye div","The Third Eye":"eye div","Greater Portent":"dice div","Enchantment Savant":"book ench","Hypnotic Gaze":"charm ench","Instinctive Charm":"charm ench","Split Enchantment":"charm ench","Alter Memories":"wave ench","Evocation Savant":"book evoc","Sculpt Spells":"shield evoc","Potent Cantrip":"burst evoc","Empowered Evocation":"burst evoc","Overchannel":"burst evoc","Illusion Savant":"book illu","Improved Minor Illusion":"illusion illu","Malleable Illusions":"illusion illu","Illusory Self":"illusion illu","Illusory Reality":"create illu","Necromancy Savant":"book necro","Grim Harvest":"heal necrotic","Undead Thralls":"undead necrotic","Inured to Undeath":"shield necrotic","Command Undead":"undead necrotic","Transmutation Savant":"book trans","Minor Alchemy":"morph trans","Transmuter's Stone":"create trans","Shapechanger":"beast trans","Master Transmuter":"morph trans","Arcane Deflection":"shield force","Tactical Wit":"eye evoc","Power Surge":"burst force","Durable Magic":"shield force","Deflecting Shroud":"burst force","Training in War and Song":"music slashing","Bladesong":"dash ench","Song of Defense":"shield ench","Song of Victory":"slash ench","Wizardly Quill":"book div","Awakened Spellbook":"book div","Manifest Mind":"eye div","Master Scrivener":"book div","One with the Word":"book div","Magical Tinkering":"sparkle gold","Infuse Item":"create trans","The Right Tool for the Job":"create gold","Tool Expertise":"skill gold","Flash of Genius":"bless gold","Magic Item Adept":"sparkle gold","Spell-Storing Item":"create evoc","Magic Item Savant":"sparkle gold","Magic Item Master":"sparkle gold","Soul of Artifice":"shield gold","Tool Proficiency":"skill gold","Experimental Elixir":"morph trans","Alchemical Savant":"burst acid","Restorative Reagents":"heal heal","Chemical Mastery":"shield acid","Tools of the Trade":"armor gold","Arcane Armor":"armor force","Armor Model":"armor force","Armor Modifications":"armor force","Perfected Armor":"armor lightning","Eldritch Cannon":"cannon fire","Arcane Firearm":"bolt fire","Explosive Cannon":"cannon force","Fortified Position":"shield gold","Battle Ready":"slash force","Steel Defender":"summon gold","Arcane Jolt":"zap force","Improved Defender":"shield gold","Favored Foe":"mark blood","Deft Explorer: Canny":"skill trans","Spellcasting Focus":"sparkle trans","Primal Awareness":"speak trans","Martial Versatility":"slash slashing","Deft Explorer: Roving":"dash trans","Deft Explorer: Tireless":"heart trans","Nature's Veil":"shadow trans","Dwarven Resilience":"shield poison","Dwarven Combat Training":"slash gold","Stonecunning":"eye gold","Heavy Armor Speed":"armor gold","Keen Senses":"eye div","Fey Ancestry":"shield ench","Trance":"moon div","Lucky":"dice gold","Brave":"shield gold","Halfling Nimbleness":"dash gold","Breath Weapon":"cone fire","Damage Resistance":"shield fire","Gnome Cunning":"shield psychic","Menacing":"fear blood","Relentless Endurance":"revive blood","Savage Attacks":"crit blood","Hellish Resistance":"shield fire","Flight":"wings cold","Talons":"slash gold","Natural Athlete":"dash gold","Stone's Endurance":"shield gold","Powerful Build":"morph gold","Mountain Born":"shield cold","Celestial Resistance":"shield radiant","Healing Hands":"heal radiant","Light Bearer":"light radiant","Firbolg Magic":"illusion trans","Hidden Step":"shadow trans","Speech of Beast and Leaf":"speak trans","Expert Forgery":"book gold","Mimicry":"speak gold","Bite":"slash blood","Cunning Artisan":"create gold","Hold Breath":"water cold","Natural Armor":"armor trans","Hungry Jaws":"heart blood","Feline Agility":"dash gold","Cat's Claws":"slash gold","Cat's Talent":"shadow gold","Amphibious":"water cold","Emissary of the Sea":"speak cold","Guardians of the Depths":"shield cold","Long-Limbed":"slash gold","Sneaky":"shadow shadow","Surprise Attack":"crit shadow","Fury of the Small":"crit blood","Nimble Escape":"dash shadow","Martial Training":"slash slashing","Saving Face":"bless gold","Grovel, Cower, and Beg":"speak gold","Pack Tactics":"multi gold","Sunlight Sensitivity":"light radiant","Aggressive":"dash blood","Magic Resistance":"shield abj","Poison Immunity":"shield poison","Wind Caller":"gust cold","Celestial Revelation":"wings radiant","Charge":"dash gold","Equine Build":"beast gold","Hooves":"punch gold","Natural Affinity":"skill trans","Changeling Instincts":"skill illu","Gnomish Magic Resistance":"shield abj","Svirfneblin Camouflage":"shadow gold","Psionic Fortitude":"shield psychic","Fey Step":"teleport ench","Fairy Magic":"sparkle ench","Astral Knowledge":"book div","Psychic Resilience":"shield psychic","Mental Discipline":"shield psychic","Little Giant":"morph gold","Hare-Trigger":"dash gold","Leporine Senses":"eye gold","Lucky Footwork":"dice gold","Rabbit Hop":"wings gold","Fey Gift":"bless ench","Fortune from the Many":"bless gold","Expert Duplication":"book gold","Kenku Recall":"book gold","Draconic Cry":"fear fire","Kobold Legacy":"sparkle fire","Nature's Intuition":"skill trans","Horns":"punch gold","Goring Rush":"dash blood","Hammering Horns":"gust gold","Labyrinthine Recall":"eye gold","Adrenaline Rush":"dash blood","Ram":"punch gold","Mirthful Leaps":"wings gold","Reveler":"music ench","Child of the Sea":"water cold","Friend of the Sea":"speak cold","Blessing of the Raven Queen":"teleport necro","Necrotic Resistance":"shield necrotic","Bestial Instincts":"beast trans","Shifting":"beast blood","Claws":"slash gold","Shell Defense":"armor trans","Guardian of the Depths":"shield cold","Poison Resilience":"shield poison","Dual Mind":"shield psychic","Mind Link":"wave psychic","Severed from Dreams":"sleep psychic","Constructed Resilience":"shield gold","Sentry's Rest":"moon gold","Integrated Protection":"armor gold","Specialized Design":"skill gold","Dragonmark":"glyph gold","Ancestral Legacy":"skill necro","Deathless Nature":"heart necro","Spider Climb":"wings trans","Vampiric Bite":"heal blood","Eerie Token":"speak necro","Hex Magic":"curse necro","Knowledge from a Past Life":"book div","Custom Lineage":"skill gold","Actor":"illusion ench","Alert":"eye gold","Athlete":"dash gold","Charger":"dash blood","Crossbow Expert":"arrow gold","Defensive Duelist":"shield slashing","Dual Wielder":"multi slashing","Dungeon Delver":"eye gold","Durable":"heart heal","Elemental Adept":"burst fire","Grappler":"hold gold","Great Weapon Master":"crit slashing","Healer":"heal heal","Heavily Armored":"armor gold","Heavy Armor Master":"armor gold","Inspiring Leader":"bless gold","Keen Mind":"book div","Lightly Armored":"armor gold","Linguist":"speak div","Mage Slayer":"counter slashing","Magic Initiate":"book evoc","Martial Adept":"dice slashing","Medium Armor Master":"armor gold","Mobile":"dash trans","Moderately Armored":"armor gold","Mounted Combatant":"beast gold","Observant":"eye div","Polearm Master":"slash slashing","Resilient":"shield gold","Ritual Caster":"book div","Savage Attacker":"crit blood","Sentinel":"hold slashing","Sharpshooter":"mark gold","Shield Master":"shield gold","Skilled":"skill gold","Skulker":"shadow shadow","Spell Sniper":"bolt evoc","Tavern Brawler":"punch gold","Tough":"heart heal","War Caster":"bolt evoc","Weapon Master":"slash slashing","Bountiful Luck":"dice gold","Dragon Fear":"fear fire","Dragon Hide":"armor fire","Drow High Magic":"shadow shadow","Dwarven Fortitude":"heart gold","Elven Accuracy":"mark div","Fade Away":"shadow illu","Fey Teleportation":"teleport ench","Flames of Phlegethos":"burst fire","Infernal Constitution":"shield fire","Orcish Fury":"crit blood","Prodigy":"skill gold","Second Chance":"dice gold","Squat Nimbleness":"dash gold","Wood Elf Magic":"vines trans","Artificer Initiate":"create gold","Chef":"create heal","Crusher":"punch gold","Eldritch Adept":"book force","Fey Touched":"teleport ench","Fighting Initiate":"slash slashing","Gunner":"arrow fire","Metamagic Adept":"sparkle evoc","Piercer":"crit slashing","Poisoner":"cloud poison","Shadow Touched":"shadow shadow","Skill Expert":"skill gold","Slasher":"slash blood","Telekinetic":"hand psychic","Telepathic":"wave psychic","Gift of the Chromatic Dragon":"burst fire","Gift of the Gem Dragon":"wave psychic","Gift of the Metallic Dragon":"wings gold","Ember of the Fire Giant":"burst fire","Fury of the Frost Giant":"burst cold","Guile of the Cloud Giant":"teleport cold","Keenness of the Stone Giant":"meteor gold","Rune Shaper":"glyph gold","Soul of the Storm Giant":"storm lightning","Strike of the Giants":"smite gold","Vigor of the Hill Giant":"heart gold","Aberrant Dragonmark":"glyph psychic","Shelter of the Faithful":"bless radiant","False Identity":"illusion illu","Criminal Contact":"speak shadow","By Popular Demand":"music ench","Rustic Hospitality":"heart heal","Guild Membership":"create gold","Discovery":"book div","Position of Privilege":"bless gold","Wanderer":"dash trans","Researcher":"book div","Ship's Passage":"water cold","Military Rank":"bless gold","City Secrets":"dash shadow","Watcher's Eye":"eye div","Respect of the Stout Folk":"heart gold","Library Access":"book div","Court Functionary":"book gold","Safe Haven":"shield gold","All Eyes on You":"eye gold","Inheritance":"create gold","Knightly Regard":"bless gold","Mercenary Life":"slash gold","Ear to the Ground":"speak shadow","Uthgardt Heritage":"vines trans","Kept in Style":"create gold","Heart of Darkness":"shadow necro","House Connections":"glyph gold","Origin Stories":"book gold","Rune Carving":"glyph gold","Custom Feature":"sparkle gold","Abjure Enemy":"fear radiant","Abjure the Extraplanar":"banish radiant","Arcane Abjuration":"banish abj","Artisan's Blessing":"create gold","Balm of Peace":"heal heal","Canny":"skill gold","Champion Challenge":"mark gold","Charm Animals and Plants":"beast trans","Conjure Duplicate":"illusion illu","Conquering Presence":"fear blood","Destructive Wrath":"storm lightning","Divine Arcana":"sparkle radiant","Emissary of Peace":"speak ench","Guided Strike":"mark gold","Inspiring Smite":"smite radiant","Invoke Duplicity":"illusion illu","Knowledge of the Ages":"book div","Nature's Wrath":"vines trans","Order's Demand":"charm ench","Pact of the Star Chain":"book radiant","Path to the Grave":"curse necrotic","Peerless Athlete":"dash gold","Poison Strike":"bolt poison","Preserve Life":"heal heal","Radiance of the Dawn":"light radiant","Radiant Defense":"shield radiant","Read Thoughts":"eye psychic","Rebuke the Violent":"counter radiant","Roving":"dash trans","Sacred Weapon":"light radiant","Shared Burden":"heart abj","Spirits of the City":"summon gold","Strands of Fate":"dice div","Tireless":"heart heal","Turn the Faithless":"fear radiant","Turn the Tide":"heal heal","Turn the Unholy":"fear radiant","Twilight Sanctuary":"aura div","Vow of Enmity":"mark blood","War God's Blessing":"bless gold","Watcher's Will":"shield psychic","Absorption":"counter abj","Acid Resistance":"shield acid","Acid Stream":"line acid","Acrobat":"dash gold","Adaptive Body":"morph trans","Alchemical Casting":"sparkle trans","Alchemist":"create trans","Ancient Companion":"summon div","Ancient Fortitude":"heart heal","Anger of a Gentle Soul":"rage blood","Animal Companion":"beast trans","Animal Handler":"beast gold","Arcane Acolyte":"bless radiant","Arcane Dabbler":"book evoc","Arcane Hacking":"glyph psychic","Arcane High Priest":"bless radiant","Arcane Priest":"bless radiant","Arcane Rebuke":"counter force","Arcane Weapon":"slash force","Arcanist":"book evoc","Arcanomechanical Armor":"armor force","Armor Training":"armor gold","Armored Plating":"armor bludgeoning","Artificer's Lore":"book gold","Artificial Mind":"speak psychic","Astral Refuge":"teleport psychic","Astral Sequestration":"banish psychic","Audience with Death":"undead necrotic","Aura Sight":"eye psychic","Aura of Treachery":"curse shadow","Avatar of Healing":"aura heal","Avatar of Speed":"aura trans","Awakened Talent":"skill psychic","Balance Chaos":"dice gold","Beacon":"light radiant","Beast's Defense":"shield trans","Beasthide Shift":"beast trans","Bestial Form":"beast trans","Blackguard's Escape":"shadow shadow","Blade Mastery":"slash slashing","Blade Meld":"slash psychic","Blessing of the All Father":"bless gold","Blind Spot":"shadow psychic","Block Watch":"eye gold","Bolts from the Grave":"bolt necrotic","Bonus Disciplines":"sparkle psychic","Brawny":"punch bludgeoning","Breadth of Knowledge":"book div","Brute Force":"crit bludgeoning","Brutish Durability":"heart gold","Burglar":"lock gold","Cantrip":"sparkle evoc","Careful Eyes":"eye gold","Celerity":"dash psychic","Chained Device":"lock force","Channel Arcana":"sparkle evoc","Chaotic Fury":"dice blood","Chromatic Warding":"shield gold","Close Quarters Shooter":"arrow piercing","Close-Quarters Shooting":"arrow piercing","Cloud Giant":"teleport cold","Commune with City":"speak gold","Companion's Bond":"heart trans","Conjure Barlgura":"summon blood","Conjure Knowbot":"summon force","Conjure Shadow Demon":"summon shadow","Conjure Vrock":"summon blood","Connect with the Dead":"speak necrotic","Construct":"armor bludgeoning","Consumptive Knife":"slash necrotic","Consumptive Power":"heart necrotic","Coordinated Attack":"multi gold","Corrosive Metabolism":"cloud acid","Creative Skills":"skill gold","Crown of Despair":"curse psychic","Crown of Disgust":"curse poison","Crown of Rage":"rage blood","Curse of the Sea":"curse cold","Deep Stalker Magic":"eye shadow","Defender's Blade":"slash gold","Delusion":"illusion psychic","Devastating Critical":"crit blood","Devastation":"burst force","Digital Phantom":"illusion force","Diminution":"morph psychic","Diplomat":"speak ench","Dissolution":"burst acid","Divine Inspiration":"bless radiant","Douse the Flames of War":"heal cold","Draconic Resistance":"shield gold","Drow Magic":"shadow shadow","Drow Weapon Training":"slash shadow","Duergar Resilience":"shield psychic","Dwarven Armor Training":"armor gold","Dwarven Toughness":"heart heal","Earth Master's Aegis":"armor bludgeoning","Earth Walk":"quake bludgeoning","Effortless Journey":"dash gold","Ego Whip":"wave psychic","Elemental Attunement":"sparkle evoc","Elemental Mastery":"shield evoc","Elf Cantrip":"sparkle evoc","Elf Weapon Training":"slash gold","Elf Weapon Training or Fleet of Foot":"dash gold","Eloquent Apprentice":"speak radiant","Empathic":"heart psychic","Empowered Psionics":"burst psychic","Enduring Unity":"heart abj","Energy Beam":"bolt psychic","Engraved Enmity":"mark blood","Essence Tap":"heal necrotic","Ethereal Jaunt":"shadow conj","Expanded Spell List":"book necro","Express Transit":"teleport gold","Extract Name":"speak psychic","Far Wanderer":"sparkle cold","Fateful Naming":"speak div","Favored Medium":"sparkle evoc","Fell Handed":"crit slashing","Find Vehicle":"summon gold","Fire Giant":"punch fire","Fire Resistance":"shield fire","Flail Mastery":"punch bludgeoning","Flame Stride":"dash fire","Fleet of Foot":"dash trans","Focused Expression":"bolt evoc","Fool's Insight":"eye psychic","Fool's Luck":"dice gold","Form of the Phoenix":"wings fire","Frost Giant":"punch cold","Functions of Probability":"dice div","Gem Flight":"wings gold","Giant Growth":"morph trans","Gourmand":"create gold","Greater Favored Enemy":"mark gold","Grugach Weapon Training":"arrow trans","Guardian Aura":"aura heal","Guardian Magic":"sparkle trans","Guardian Soul":"morph trans","Guiding Hand":"hand div","Harvest's Scythe":"slash necrotic","Haywire":"zap lightning","Healing Elixir":"heal heal","Heart of the City":"aura gold","Hermit's Study":"book div","Hill Giant":"punch bludgeoning","Historian":"book div","History's Whims":"dice div","Hone the Blade":"slash psychic","Human Revenant":"revive necrotic","Hunter's Mysticism":"eye trans","Icingdeath's Frost":"cone cold","Icon of Deceit":"shadow illu","Id Insinuation":"wave psychic","Ignite":"burst fire","Immortal Durability":"heart heal","Immortal Will":"revive psychic","Impeccable Physicality":"dash gold","Implacable Mark":"mark gold","Indomitable Defense":"shield abj","Inexorable Pronouncement":"speak force","Infallible Relay":"speak lightning","Infoportation":"teleport psychic","Information Overload":"wave psychic","Information Surge":"zap lightning","Infuse Potions":"morph trans","Infuse Scrolls":"book evoc","Infuse Weapons and Armor":"armor force","Infusion of Eloquence":"morph psychic","Inky Shroud":"shadow shadow","Insightful Striking":"mark psychic","Intellect Fortress":"shield psychic","Investigator":"eye div","Invisibility to Cameras":"shadow illu","Iron Durability":"armor bludgeoning","Jotun Resilience":"heart cold","Kinetic Artistry":"dash gold","Lashing Tail":"slash bludgeoning","Lessons of the Past":"book div","Light Step":"dash psychic","Lightning Resistance":"shield lightning","Lingering Magic":"eye div","Living Construct":"heal bludgeoning","Longtooth Shift":"beast blood","Lore Master":"book div","Lorehold Spells":"book radiant","Magic Reserves":"sparkle evoc","Mantle of Awe":"charm psychic","Mantle of Command":"speak psychic","Mantle of Courage":"bless psychic","Mantle of Fear":"fear psychic","Mantle of Flame":"aura fire","Mantle of Fury":"rage psychic","Mantle of Joy":"heart psychic","Mariner":"water cold","Mark of the Ordning":"glyph gold","Mask of the Wild":"shadow trans","Master Artificer":"create gold","Master of Disguise":"illusion illu","Master of Magic":"sparkle evoc","Mastery of Air":"gust psychic","Mastery of Fire":"burst fire","Mastery of Force":"hand force","Mastery of Ice":"cone cold","Mastery of Light and Darkness":"light shadow","Mastery of Water":"water cold","Mastery of Weather":"weather lightning","Mastery of Wood and Earth":"vines bludgeoning","Medic":"heal heal","Memory of One Thousand Steps":"time psychic","Mental Barrier":"shield psychic","Metabolic Control":"heart psychic","Metal Magic":"slash force","Metallic Breath Weapon":"cone gold","Mind Meld":"speak psychic","Mind Network":"speak psychic","Mind Overload":"wave psychic","Mind Slam":"punch psychic","Mind Thrust":"bolt psychic","Monster Slayer":"slash gold","Mystic Charm":"charm psychic","Mystic Hand":"hand psychic","Mystic Order":"sparkle psychic","Mystical Recovery":"heal psychic","Natural Illusionist":"illusion illu","Naturalist":"vines trans","Naturally Stealthy":"shadow shadow","Necrotic Ancestry":"cone necrotic","Necrotic Shroud":"fear necrotic","Noble Cavalry":"dash gold","Nomadic Arrow":"arrow psychic","Nomadic Chameleon":"shadow psychic","Nomadic Mind":"eye psychic","Nomadic Step":"teleport psychic","Nourishing Fire":"heal fire","Null Equation":"counter force","Nullification":"counter abj","Omens and Portents":"eye div","On/Off":"zap lightning","Online Casting":"zap lightning","Ordered Mind":"eye psychic","Path of Tranquility":"shield abj","Paths of the Dead":"shadow necro","Perceptive":"eye gold","Performer":"music ench","Personal Encryption":"lock psychic","Phantom Knife":"slash psychic","Phoenix Spark":"revive fire","Piercing Thorns":"vines piercing","Potent Psionics":"burst psychic","Precognition":"eye psychic","Prodigious Inspiration":"music ench","Prodigious Memory":"book psychic","Program Spell":"glyph lightning","Protection from Ballistics":"shield piercing","Psionic Blast":"cone psychic","Psionic Body":"armor psychic","Psionic Devotion":"sparkle psychic","Psionic Focus":"sparkle psychic","Psionic Investigation":"eye psychic","Psionic Mastery":"sparkle psychic","Psionic Mind":"speak psychic","Psionic Resilience":"shield psychic","Psionic Restoration":"heal psychic","Psionic Surge":"burst psychic","Psionic Weapon":"slash psychic","Psionics":"sparkle psychic","Psychic Assault":"wave psychic","Psychic Damage":"bolt psychic","Psychic Disruption":"wave psychic","Psychic Focus":"sparkle psychic","Psychic Hammer":"punch psychic","Psychic Inquisition":"eye psychic","Psychic Phantoms":"illusion psychic","Puppet":"charm ench","Puppetry":"charm ench","Quandrix Spells":"book div","Quantum Tunneling":"teleport force","Queen's Right Hand":"bolt necrotic","Quick-Fingered":"hand gold","Radiant Consumption":"aura radiant","Radiant Resistance":"shield radiant","Rage of Fallen Ostoria":"rage cold","Raven's Shield":"shield shadow","Reckless Casting":"dice evoc","Relentless Naming":"speak force","Relentless Nature":"revive necrotic","Remote Access":"zap lightning","Resonant Utterance":"speak force","Revived Nature":"revive heal","Rooted Defense":"vines trans","Rune Maven":"glyph evoc","Runes of Understanding":"glyph div","Runic Empowerment":"glyph force","Sense Emotion":"heart psychic","Sentinel Raven":"wings shadow","Shield Training":"shield gold","Shield of the Faithful":"shield radiant","Shielding Aurora":"shield radiant","Shifting Form":"water trans","Shutdown":"wave lightning","Sigils of Warding":"glyph abj","Silent Speech":"speak psychic","Silver-Tongued":"speak ench","Silvery Barbs":"counter ench","Skill Versatility":"skill gold","Snap Shot":"arrow gold","Soul Knife":"slash psychic","Soul of Lost Ostoria":"sparkle cold","Soul of the Raven":"wings shadow","Soul of the Sea":"water cold","Speak with Small Beasts":"beast trans","Spear Mastery":"line piercing","Spectral Form":"shadow necro","Speech Beyond the Grave":"speak necrotic","Spell Secrets":"morph evoc","Spirit of Death":"undead necrotic","Stalker's Dodge":"shadow shadow","Stealthy":"shadow shadow","Stone Aegis":"shield bludgeoning","Stone Camouflage":"shadow bludgeoning","Stone Giant":"quake bludgeoning","Stone's Durability":"armor bludgeoning","Stone's Edge":"burst bludgeoning","Storm Giant":"storm lightning","Storm of Claws and Fangs":"beast blood","Stout Resilience":"shield poison","Strength of Mind":"shield psychic","Sudden Awakening":"light radiant","Summon Warrior Spirit":"summon gold","Superior Artificer":"create gold","Superior Beast's Defense":"shield trans","Superior Teleportation":"teleport psychic","Surge of Health":"heal heal","Swiftstride Shift":"dash trans","Swim Speed":"water cold","Sylvan Tongue":"speak trans","Sympathy":"heart ench","Synchronicity":"time div","System Backdoor":"glyph lightning","Tandem Tactician":"multi gold","Technological Savant":"glyph lightning","Technovirus":"curse lightning","Telepathic Contact":"speak psychic","Theologian":"book radiant","Third Eye":"eye psychic","Thought Form":"morph psychic","Thought Travel":"teleport psychic","Tiefling Revenant":"revive fire","Ties That Bind":"hold ench","Tinker":"create gold","Tokens of Past Lives":"sparkle div","Tools of the Inventor":"create trans","Tower of Iron Will":"shield psychic","Tracker":"eye trans","Tumbling Fool":"dash gold","Tunnel Fighter":"shield gold","Underdark Scout":"shadow shadow","Unending Breath":"heart cold","Velocity Shift":"time force","Versatile":"skill gold","Vestigial Wings":"wings fire","Visions of the Future":"eye div","War Echoes":"slash div","Watcher at the Threshold":"shield radiant","Water Soul":"water cold","Watery Defense":"water cold","Wild Cunning":"vines trans","Wild Talent":"sparkle psychic","Wildhunt Shift":"eye trans","Winged":"wings fire","Wire Walk":"teleport lightning","Wiry Frame":"dash gold","Witherbloom Adept":"heal necrotic","Witherbloom Brew":"morph heal","Witherbloom Spells":"book necrotic","Withering Vortex":"curse necrotic","Word of Power":"speak force"},"op":{"fightingStyle:Archery":"arrow gold","fightingStyle:Blind Fighting":"eye shadow","fightingStyle:Defense":"armor gold","fightingStyle:Dueling":"slash gold","fightingStyle:Great Weapon Fighting":"crit slashing","fightingStyle:Interception":"shield gold","fightingStyle:Protection":"shield abj","fightingStyle:Superior Technique":"dice gold","fightingStyle:Thrown Weapon Fighting":"arrow piercing","fightingStyle:Two-Weapon Fighting":"multi slashing","fightingStyle:Unarmed Fighting":"punch bludgeoning","fightingStyle:Blessed Warrior":"bless radiant","fightingStyle:Druidic Warrior":"vines trans","maneuver:Ambush":"shadow shadow","maneuver:Bait and Switch":"teleport gold","maneuver:Brace":"shield gold","maneuver:Commander's Strike":"speak gold","maneuver:Commanding Presence":"speak ench","maneuver:Disarming Attack":"hand slashing","maneuver:Distracting Strike":"illusion gold","maneuver:Evasive Footwork":"dash gold","maneuver:Feinting Attack":"illusion slashing","maneuver:Goading Attack":"charm blood","maneuver:Grappling Strike":"hold bludgeoning","maneuver:Lunging Attack":"dash piercing","maneuver:Maneuvering Attack":"dash gold","maneuver:Menacing Attack":"fear blood","maneuver:Parry":"shield slashing","maneuver:Precision Attack":"mark gold","maneuver:Pushing Attack":"gust bludgeoning","maneuver:Quick Toss":"arrow piercing","maneuver:Rally":"heart heal","maneuver:Riposte":"slash gold","maneuver:Sweeping Attack":"slash slashing","maneuver:Tactical Assessment":"eye div","maneuver:Trip Attack":"slip bludgeoning","metamagic:Careful Spell":"shield evoc","metamagic:Distant Spell":"bolt evoc","metamagic:Empowered Spell":"burst evoc","metamagic:Extended Spell":"time evoc","metamagic:Heightened Spell":"mark evoc","metamagic:Quickened Spell":"dash evoc","metamagic:Seeking Spell":"mark div","metamagic:Subtle Spell":"shadow illu","metamagic:Transmuted Spell":"morph trans","metamagic:Twinned Spell":"multi evoc","pactBoon:Pact of the Blade":"slash necro","pactBoon:Pact of the Chain":"summon shadow","pactBoon:Pact of the Tome":"book necro","pactBoon:Pact of the Talisman":"dice abj","invocation:Agonizing Blast":"bolt force","invocation:Armor of Shadows":"armor shadow","invocation:Ascendant Step":"wings trans","invocation:Aspect of the Moon":"moon div","invocation:Beast Speech":"beast trans","invocation:Beguiling Influence":"charm ench","invocation:Bewitching Whispers":"charm psychic","invocation:Bond of the Talisman":"teleport conj","invocation:Book of Ancient Secrets":"book div","invocation:Chains of Carceri":"hold necro","invocation:Cloak of Flies":"cloud poison","invocation:Devil's Sight":"eye shadow","invocation:Dreadful Word":"speak psychic","invocation:Eldritch Mind":"shield psychic","invocation:Eldritch Sight":"eye force","invocation:Eldritch Smite":"smite force","invocation:Eldritch Spear":"bolt force","invocation:Eyes of the Rune Keeper":"glyph div","invocation:Far Scribe":"book div","invocation:Fiendish Vigor":"heal necrotic","invocation:Gaze of Two Minds":"eye psychic","invocation:Ghostly Gaze":"eye necro","invocation:Gift of the Depths":"water cold","invocation:Gift of the Ever-Living Ones":"heal necro","invocation:Gift of the Protectors":"revive abj","invocation:Grasp of Hadar":"hold shadow","invocation:Improved Pact Weapon":"sparkle force","invocation:Investment of the Chain Master":"summon conj","invocation:Lance of Lethargy":"time force","invocation:Lifedrinker":"slash necrotic","invocation:Maddening Hex":"curse psychic","invocation:Mask of Many Faces":"illusion illu","invocation:Master of Myriad Forms":"morph trans","invocation:Minions of Chaos":"summon fire","invocation:Mire the Mind":"time trans","invocation:Misty Visions":"illusion illu","invocation:One with Shadows":"shadow shadow","invocation:Otherworldly Leap":"dash trans","invocation:Protection of the Talisman":"shield abj","invocation:Rebuke of the Talisman":"gust force","invocation:Relentless Hex":"teleport necro","invocation:Repelling Blast":"gust force","invocation:Sculptor of Flesh":"morph trans","invocation:Shroud of Shadow":"shadow illu","invocation:Sign of Ill Omen":"curse necro","invocation:Thief of Five Fates":"curse necrotic","invocation:Thirsting Blade":"multi necro","invocation:Tomb of Levistus":"armor cold","invocation:Trickster's Escape":"lock abj","invocation:Undying Servitude":"undead necrotic","invocation:Visions of Distant Realms":"eye div","invocation:Voice of the Chain Master":"speak conj","invocation:Whispers of the Grave":"speak necrotic","invocation:Witch Sight":"eye div","infusion:Arcane Propulsion Armor":"armor force","infusion:Armor of Magical Strength":"armor trans","infusion:Boots of the Winding Path":"teleport conj","infusion:Enhanced Arcane Focus":"sparkle evoc","infusion:Enhanced Defense":"shield abj","infusion:Enhanced Weapon":"slash gold","infusion:Helm of Awareness":"eye div","infusion:Homunculus Servant":"summon trans","infusion:Mind Sharpener":"shield psychic","infusion:Radiant Weapon":"light radiant","infusion:Repeating Shot":"arrow force","infusion:Replicate Magic Item":"create trans","infusion:Repulsion Shield":"gust force","infusion:Resistant Armor":"armor abj","infusion:Returning Weapon":"arrow gold","infusion:Spell-Refueling Ring":"sparkle gold","arcaneShot:Banishing Arrow":"banish conj","arcaneShot:Beguiling Arrow":"charm psychic","arcaneShot:Bursting Arrow":"burst force","arcaneShot:Enfeebling Arrow":"arrow necrotic","arcaneShot:Grasping Arrow":"vines poison","arcaneShot:Piercing Arrow":"line piercing","arcaneShot:Seeking Arrow":"mark force","arcaneShot:Shadow Arrow":"arrow shadow","rune:Cloud Rune":"glyph cold","rune:Fire Rune":"glyph fire","rune:Frost Rune":"glyph cold","rune:Stone Rune":"glyph bludgeoning","rune:Hill Rune":"glyph poison","rune:Storm Rune":"glyph lightning","totemSpirit:Bear":"beast blood","totemSpirit:Eagle":"wings gold","totemSpirit:Elk":"dash trans","totemSpirit:Tiger":"beast gold","totemSpirit:Wolf":"beast shadow","totemAspect:Bear":"beast bludgeoning","totemAspect:Eagle":"eye gold","totemAspect:Elk":"dash trans","totemAspect:Tiger":"beast gold","totemAspect:Wolf":"beast shadow","totemAttune:Bear":"aura blood","totemAttune:Eagle":"wings gold","totemAttune:Elk":"dash bludgeoning","totemAttune:Tiger":"dash gold","totemAttune:Wolf":"quake shadow","stormAura:Desert":"aura fire","stormAura:Sea":"aura lightning","stormAura:Tundra":"aura cold","landCircle:Arctic":"weather cold","landCircle:Coast":"water cold","landCircle:Desert":"weather fire","landCircle:Forest":"vines trans","landCircle:Grassland":"vines heal","landCircle:Mountain":"quake bludgeoning","landCircle:Swamp":"cloud poison","landCircle:Underdark":"web shadow","hunterPrey:Colossus Slayer":"crit gold","hunterPrey:Giant Killer":"slash gold","hunterPrey:Horde Breaker":"multi slashing","hunterDefense:Escape the Horde":"dash gold","hunterDefense:Multiattack Defense":"shield gold","hunterDefense:Steel Will":"shield psychic","hunterMultiattack:Volley":"arrow gold","hunterMultiattack:Whirlwind Attack":"slash slashing","hunterSuperior:Evasion":"dash gold","hunterSuperior:Stand Against the Tide":"counter gold","hunterSuperior:Uncanny Dodge":"shield gold","draconicAncestry:Black":"cone acid","draconicAncestry:Blue":"line lightning","draconicAncestry:Brass":"line fire","draconicAncestry:Bronze":"line lightning","draconicAncestry:Copper":"line acid","draconicAncestry:Gold":"cone fire","draconicAncestry:Green":"cone poison","draconicAncestry:Red":"cone fire","draconicAncestry:Silver":"cone cold","draconicAncestry:White":"cone cold","armorModel:Guardian":"punch thunder","armorModel:Infiltrator":"zap lightning"},"mi":{"Ring of Spell Refueling":"sparkle gold","Whispering Guidance":"speak illu","Cloak of Whispering Veils":"speak illu","Scar Sense":"eye blood","Bionic Eye":"light gold","Bolt Barrel (Arm)":"arrow force","Lightning Scar":"zap lightning","The Mask (Deck of Many Things)":"morph illu","Time Stutter":"time div","Thunderstone Switch":"storm thunder","Blue Dragon Scale Armor":"armor lightning","Rocket Boots":"wings fire","Cutlass of Vengeance":"slash blood","Sword of Justice":"smite radiant","Unarmed Strike":"punch bludgeoning","Flurry of Blows":"punch gold","Weapon +1":"slash gold","Weapon +2":"slash gold","Weapon +3":"crit gold","Armor +1":"armor gold","Armor +2":"armor gold","Armor +3":"armor gold","Shield +1":"shield gold","Shield +2":"shield gold","Shield +3":"shield gold","Ammunition +1":"arrow gold","Ammunition +2":"arrow gold","Ammunition +3":"arrow gold","Adamantine Armor":"armor bludgeoning","Amulet of Health":"heart heal","Amulet of Proof against Detection and Location":"shadow abj","Amulet of the Planes":"teleport conj","Animated Shield":"shield force","Apparatus of the Crab":"water trans","Armor of Invulnerability":"armor abj","Armor of Resistance":"armor abj","Armor of Vulnerability":"armor blood","Arrow-Catching Shield":"shield piercing","Arrow of Slaying":"arrow necrotic","Bag of Beans":"vines trans","Bag of Holding":"create conj","Bag of Tricks":"beast trans","Bead of Force":"burst force","Belt of Dwarvenkind":"armor gold","Belt of Hill Giant Strength":"punch bludgeoning","Belt of Stone Giant Strength":"punch bludgeoning","Belt of Frost Giant Strength":"punch cold","Belt of Fire Giant Strength":"punch fire","Belt of Cloud Giant Strength":"punch cold","Belt of Storm Giant Strength":"punch lightning","Berserker Axe":"rage blood","Boots of Elvenkind":"shadow shadow","Boots of Levitation":"wings trans","Boots of Speed":"dash gold","Boots of Striding and Springing":"dash trans","Boots of the Winterlands":"weather cold","Bowl of Commanding Water Elementals":"water cold","Bracers of Archery":"arrow gold","Bracers of Defense":"armor abj","Brazier of Commanding Fire Elementals":"summon fire","Brooch of Shielding":"shield force","Broom of Flying":"wings trans","Candle of Invocation":"light radiant","Cape of the Mountebank":"teleport conj","Carpet of Flying":"wings ench","Censer of Controlling Air Elementals":"gust cold","Chime of Opening":"lock gold","Circlet of Blasting":"bolt radiant","Cloak of Arachnida":"web poison","Cloak of Displacement":"illusion illu","Cloak of Elvenkind":"shadow shadow","Cloak of Protection":"shield abj","Cloak of the Bat":"wings shadow","Cloak of the Manta Ray":"water cold","Crystal Ball":"eye div","Cube of Force":"wall force","Cubic Gate":"teleport conj","Dagger of Venom":"slash poison","Dancing Sword":"slash force","Decanter of Endless Water":"water cold","Deck of Illusions":"illusion illu","Deck of Many Things":"dice gold","Defender":"shield gold","Demon Armor":"armor blood","Dimensional Shackles":"lock conj","Dragon Scale Mail":"armor gold","Dragon Slayer":"slash fire","Dust of Disappearance":"shadow illu","Dust of Dryness":"water acid","Dust of Sneezing and Choking":"cloud poison","Dwarven Plate":"armor bludgeoning","Dwarven Thrower":"arrow bludgeoning","Efficient Quiver":"arrow gold","Efreeti Bottle":"summon fire","Elemental Gem":"summon evoc","Elven Chain":"armor cold","Eversmoking Bottle":"cloud shadow","Eyes of Charming":"charm ench","Eyes of Minute Seeing":"eye div","Eyes of the Eagle":"eye gold","Figurine of Wondrous Power":"beast trans","Flame Tongue":"slash fire","Folding Boat":"create trans","Frost Brand":"slash cold","Gauntlets of Ogre Power":"punch bludgeoning","Gem of Brightness":"light radiant","Gem of Seeing":"eye div","Giant Slayer":"crit slashing","Glamoured Studded Leather":"illusion illu","Gloves of Missile Snaring":"hand gold","Gloves of Swimming and Climbing":"water trans","Goggles of Night":"eye shadow","Hammer of Thunderbolts":"punch thunder","Handy Haversack":"create conj","Hat of Disguise":"illusion illu","Headband of Intellect":"sparkle psychic","Helm of Brilliance":"light fire","Helm of Comprehending Languages":"speak div","Helm of Telepathy":"speak psychic","Helm of Teleportation":"teleport conj","Holy Avenger":"smite radiant","Horn of Blasting":"wave thunder","Horn of Valhalla":"summon gold","Horseshoes of Speed":"dash gold","Horseshoes of a Zephyr":"gust cold","Immovable Rod":"lock trans","Instant Fortress":"create bludgeoning","Ioun Stone (Absorption)":"counter abj","Ioun Stone (Agility)":"dash trans","Ioun Stone (Awareness)":"eye div","Ioun Stone (Fortitude)":"heart heal","Ioun Stone (Insight)":"eye psychic","Ioun Stone (Intellect)":"sparkle psychic","Ioun Stone (Leadership)":"speak ench","Ioun Stone (Mastery)":"sparkle gold","Ioun Stone (Protection)":"shield abj","Ioun Stone (Regeneration)":"heal heal","Ioun Stone (Reserve)":"sparkle evoc","Ioun Stone (Strength)":"punch bludgeoning","Ioun Stone (Sustenance)":"heart heal","Iron Bands of Bilarro":"hold bludgeoning","Iron Flask":"banish conj","Javelin of Lightning":"bolt lightning","Lantern of Revealing":"light div","Luck Blade":"dice gold","Mace of Disruption":"smite radiant","Mace of Smiting":"crit bludgeoning","Mace of Terror":"fear necro","Mantle of Spell Resistance":"shield abj","Manual of Bodily Health":"book heal","Manual of Gainful Exercise":"book bludgeoning","Manual of Golems":"book trans","Manual of Quickness of Action":"book trans","Marvelous Pigments":"create illu","Medallion of Thoughts":"speak psychic","Mirror of Life Trapping":"banish illu","Mithral Armor":"armor cold","Necklace of Adaptation":"cloud heal","Necklace of Fireballs":"meteor fire","Necklace of Prayer Beads":"bless radiant","Nine Lives Stealer":"crit necrotic","Oathbow":"arrow gold","Oil of Etherealness":"shadow conj","Oil of Sharpness":"slash slashing","Oil of Slipperiness":"slip trans","Pearl of Power":"sparkle evoc","Periapt of Health":"heart heal","Periapt of Proof against Poison":"shield poison","Periapt of Wound Closure":"heal heal","Philter of Love":"heart ench","Pipes of Haunting":"fear necro","Pipes of the Sewers":"music shadow","Plate Armor of Etherealness":"armor conj","Portable Hole":"banish shadow","Potion of Animal Friendship":"beast trans","Potion of Clairvoyance":"eye div","Potion of Climbing":"web trans","Potion of Diminution":"morph trans","Potion of Flying":"wings trans","Potion of Gaseous Form":"cloud trans","Potion of Giant Strength":"punch bludgeoning","Potion of Growth":"morph trans","Potion of Healing":"heal heal","Potion of Greater Healing":"heal heal","Potion of Superior Healing":"heal heal","Potion of Supreme Healing":"heal heal","Potion of Heroism":"bless gold","Potion of Invisibility":"shadow illu","Potion of Mind Reading":"eye psychic","Potion of Poison":"cloud poison","Potion of Resistance":"shield abj","Potion of Speed":"dash trans","Potion of Water Breathing":"water cold","Restorative Ointment":"heal heal","Ring of Animal Influence":"beast ench","Ring of Djinni Summoning":"summon cold","Ring of Elemental Command":"summon evoc","Ring of Evasion":"dash gold","Ring of Feather Falling":"wings trans","Ring of Free Action":"lock abj","Ring of Invisibility":"shadow illu","Ring of Jumping":"dash trans","Ring of Mind Shielding":"shield psychic","Ring of Protection":"shield abj","Ring of Regeneration":"heal heal","Ring of Resistance":"shield abj","Ring of Shooting Stars":"meteor lightning","Ring of Spell Storing":"sparkle evoc","Ring of Spell Turning":"counter abj","Ring of Swimming":"water cold","Ring of Telekinesis":"hand force","Ring of the Ram":"punch force","Ring of Three Wishes":"sparkle gold","Ring of Warmth":"aura fire","Ring of Water Walking":"water cold","Ring of X-ray Vision":"eye div","Robe of Eyes":"eye div","Robe of Scintillating Colors":"light illu","Robe of Stars":"meteor force","Robe of the Archmagi":"sparkle abj","Robe of Useful Items":"create conj","Rod of Absorption":"counter abj","Rod of Alertness":"eye div","Rod of Lordly Might":"punch gold","Rod of Rulership":"charm ench","Rod of Security":"teleport abj","Rope of Climbing":"vines trans","Rope of Entanglement":"hold trans","Scarab of Protection":"shield necro","Scimitar of Speed":"multi slashing","Shield of Missile Attraction":"shield piercing","Slippers of Spider Climbing":"web trans","Sovereign Glue":"lock gold","Spell Scroll":"book evoc","Sentinel Shield":"eye gold","Spellguard Shield":"shield abj","Sphere of Annihilation":"banish shadow","Staff of Charming":"charm ench","Staff of Fire":"burst fire","Staff of Frost":"cone cold","Staff of Healing":"heal heal","Staff of Power":"bolt force","Staff of Striking":"punch force","Staff of Swarming Insects":"cloud poison","Staff of the Magi":"sparkle evoc","Staff of the Python":"beast poison","Staff of the Woodlands":"vines trans","Staff of Thunder and Lightning":"storm lightning","Staff of Withering":"curse necrotic","Stone of Controlling Earth Elementals":"quake bludgeoning","Stone of Good Luck (Luckstone)":"dice gold","Sun Blade":"light radiant","Sword of Life Stealing":"slash necrotic","Sword of Sharpness":"crit slashing","Sword of Wounding":"slash blood","Talisman of Pure Good":"smite radiant","Talisman of the Sphere":"banish shadow","Talisman of Ultimate Evil":"curse necrotic","Tome of Clear Thought":"book psychic","Tome of Leadership and Influence":"book ench","Tome of Understanding":"book div","Trident of Fish Command":"water cold","Universal Solvent":"water acid","Vicious Weapon":"crit blood","Vorpal Sword":"crit slashing","Wand of Binding":"hold ench","Wand of Enemy Detection":"eye div","Wand of Fear":"fear necro","Wand of Fireballs":"meteor fire","Wand of Lightning Bolts":"line lightning","Wand of Magic Detection":"eye div","Wand of Magic Missiles":"bolt force","Wand of Paralysis":"hold ench","Wand of Polymorph":"morph trans","Wand of Secrets":"eye div","Wand of the War Mage +1":"bolt evoc","Wand of the War Mage +2":"bolt evoc","Wand of the War Mage +3":"bolt evoc","Wand of Web":"web trans","Wand of Wonder":"dice illu","Well of Many Worlds":"teleport conj","Wings of Flying":"wings gold","Armor of Gleaming":"armor gold","Bead of Nourishment":"heart heal","Bead of Refreshment":"water heal","Boots of False Tracks":"illusion illu","Candle of the Deep":"light fire","Cast-Off Armor":"armor trans","Charlatan's Die":"dice gold","Cloak of Billowing":"gust shadow","Cloak of Many Fashions":"morph illu","Clockwork Amulet":"dice gold","Clothes of Mending":"create trans","Dark Shard Amulet":"sparkle necro","Dread Helm":"fear blood","Ear Horn of Hearing":"speak div","Enduring Spellbook":"book abj","Ersatz Eye":"eye gold","Hat of Vermin":"summon shadow","Hat of Wizardry":"sparkle evoc","Heward's Handy Spice Pouch":"create gold","Horn of Silent Alarm":"wave psychic","Instrument of Illusions":"music illu","Instrument of Scribing":"book div","Lock of Trickery":"lock illu","Moon-Touched Sword":"moon radiant","Mystery Key":"lock gold","Orb of Direction":"eye div","Orb of Time":"time div","Perfume of Bewitching":"charm ench","Pipe of Smoke Monsters":"cloud shadow","Pole of Angling":"water gold","Pole of Collapsing":"morph gold","Pot of Awakening":"vines trans","Rope of Mending":"create trans","Ruby of the War Mage":"sparkle fire","Shield of Expression":"morph illu","Smoldering Armor":"armor fire","Staff of Adornment":"sparkle illu","Staff of Birdcalls":"music gold","Staff of Flowers":"vines heal","Talking Doll":"speak ench","Tankard of Sobriety":"heart heal","Unbreakable Arrow":"arrow gold","Veteran's Cane":"morph gold","Walloping Ammunition":"quake bludgeoning","Wand of Conducting":"music gold","Wand of Pyrotechnics":"burst fire","Wand of Scowls":"fear psychic","Wand of Smiles":"charm ench","All-Purpose Tool +1":"create trans","Amulet of the Devout +1":"bless radiant","Arcane Grimoire +1":"book evoc","Bloodwell Vial +1":"sparkle blood","Dragonhide Belt +1":"heart gold","Moon Sickle +1":"moon radiant","Rhythm-Maker's Drum +1":"music ench","Rod of the Pact Keeper +1":"sparkle necro","All-Purpose Tool +2":"create trans","Amulet of the Devout +2":"bless radiant","Arcane Grimoire +2":"book evoc","Bloodwell Vial +2":"sparkle blood","Dragonhide Belt +2":"heart gold","Moon Sickle +2":"moon radiant","Rhythm-Maker's Drum +2":"music ench","Rod of the Pact Keeper +2":"sparkle necro","All-Purpose Tool +3":"create trans","Amulet of the Devout +3":"bless radiant","Arcane Grimoire +3":"book evoc","Bloodwell Vial +3":"sparkle blood","Dragonhide Belt +3":"heart gold","Moon Sickle +3":"moon radiant","Rhythm-Maker's Drum +3":"music ench","Rod of the Pact Keeper +3":"sparkle necro","Alchemical Compendium":"book trans","Astral Shard":"sparkle psychic","Astromancy Archive":"book div","Atlas of Endless Horizons":"book conj","Cauldron of Rebirth":"revive heal","Crystalline Chronicle":"book psychic","Duplicitous Manuscript":"book illu","Elemental Essence Shard":"sparkle evoc","Eldritch Claw Tattoo":"slash force","Feywild Shard":"sparkle ench","Fulminating Treatise":"book thunder","Heart Weaver's Primer":"book ench","Libram of Souls and Flesh":"book necrotic","Lyre of Building":"music gold","Nature's Mantle":"shadow trans","Outer Essence Shard":"sparkle radiant","Planecaller's Codex":"book conj","Protective Verses":"book abj","Reveler's Concertina":"music ench","Shadowfell Brand Tattoo":"shadow shadow","Shadowfell Shard":"sparkle shadow","Spellwrought Tattoo":"glyph evoc","Barrier Tattoo":"armor abj","Blood Fury Tattoo":"rage blood","Coiling Grasp Tattoo":"hold force","Ghost Step Tattoo":"shadow necro","Illuminator's Tattoo":"light radiant","Lifewell Tattoo":"heal heal","Masquerade Tattoo":"illusion illu","Absorbing Tattoo":"shield abj","Tome of the Stilled Tongue":"book necro","Mighty Servant of Leuk-o":"summon bludgeoning","Baba Yaga's Mortar and Pestle":"create trans","Crook of Rao":"banish radiant","Demonomicon of Iggwilv":"book blood","Amethyst Lodestone":"gust force","Crystal Blade":"slash radiant","Dragon Vessel":"create fire","Dragon Wing Bow":"arrow fire","Dragon's Wrath Weapon":"slash fire","Dragon-Touched Focus":"sparkle gold","Emerald Pen":"book poison","Hide of the Feral Guardian":"beast trans","Platinum Scarf":"shield radiant","Ruby Weave Gem":"sparkle fire","Sapphire Buckler":"shield psychic","Scaled Ornament":"armor gold","Topaz Annihilator":"bolt necrotic","Wyrmreaver Gauntlets":"punch gold","Dragonlance":"smite force"}};

DND.r20ext = {"README.txt": "Adventurer's Tome <-> Roll20 companion extension\n\nChrome / Edge / Brave / Opera / Vivaldi: the easiest way is the Chrome Web Store (it updates itself):\nhttps://chromewebstore.google.com/detail/mgpepimfnfhagocgdbmmngiennbijgcd\nTo load this download instead:\n1. Unzip this download (Windows: right-click -> Extract All).\n2. Open chrome://extensions (edge://extensions, brave://extensions, opera://extensions).\n3. Turn on Developer mode, click \"Load unpacked\", and pick the unzipped folder - the one with manifest.json directly inside it.\n\nFirefox: the easiest way is Firefox Add-ons (it updates itself and stays after a restart):\nhttps://addons.mozilla.org/en-US/firefox/addon/adventurers-tome-roll20/\nTo load this download instead:\n1. Unzip this download.\n2. Open about:debugging#/runtime/this-firefox, click \"Load Temporary Add-on...\", choose manifest.json in the unzipped folder.\n   (Firefox removes it when it closes; load it again after a restart.)\n\nThen sign in to Roll20, open your game, reload your character sheet, and in Settings -> Dice choose \"Roll20 rolls for me\" and pick your game.\nThe extension only runs on app.roll20.net and on the Adventurer's Tome site (adventurers-tome.web.app); it sends nothing anywhere else.\n", "background.js": "// Finds your open Roll20 games and hands rolls to the right tab.\nconst GAME_URL = 'https://app.roll20.net/editor*';\nasync function games() {\n  const tabs = await chrome.tabs.query({ url: GAME_URL });\n  const out = [];\n  for (const t of tabs) {\n    try { const info = await chrome.tabs.sendMessage(t.id, { type: 'info' }); if (info) out.push(Object.assign({ tabId: t.id }, info)); }\n    catch (e) { out.push({ tabId: t.id, campaign: (t.title || 'Roll20 game').replace(/\\s*\\|\\s*Roll20.*$/i, ''), player: '', stale: true }); }\n  }\n  return out;\n}\nchrome.runtime.onMessage.addListener((msg, sender, send) => {\n  (async () => {\n    if (msg.type === 'campaigns') return send({ list: await games() });\n    if (msg.type === 'roll' || msg.type === 'post' || msg.type === 'tokens') {\n      const list = await games();\n      if (!list.length) return send({ error: 'No Roll20 game is open. Open your game in Roll20 first.' });\n      const g = (msg.campaign && list.find((x) => x.campaign === msg.campaign)) || (msg.campaign ? null : list[0]);\n      if (!g) return send({ error: `Your game \"${msg.campaign}\" isn't open in Roll20.` });\n      if (g.stale) return send({ error: 'Reload the Roll20 tab once so the extension can reach it.' });\n      try { send(await chrome.tabs.sendMessage(g.tabId, msg)); } catch (e) { send({ error: 'Roll20 tab did not answer: ' + e.message }); }\n      return;\n    }\n    send({ error: 'unknown request' });\n  })();\n  return true;\n});\n", "icon128.png": "b64:iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAxvUlEQVR4nO29eXBVV57n+TnnLm/VhhACCcSiBS0Is+8YO70bvBvbmU6bzsVV010zEzk9Xb1UT0VWxsRkRE/n9ERPdfTMVPVEdC3ZmV7SuXhLb2CMEZvZhUDsIEAIEEhvf+/ee878cd8TizEJQiBB+ut4OBC67957zvf8fr/z2w58g2/wDb7BN/gGf1QQ1/mzb3CXQQDyir+La/z9rscf08tKQAEsnB4ZIx29QghRAgitdZ8peH9tR+r0lb97t+OPgQAC0ADLmiuijkjNFZrnDSmf9rQeiwYp6daatcpTf4cObWjr7I1fee3diruZAIV304C8d2qkxTN4yZTyacdV9ZmcZwUDJkJAJudhm9KzTNnpeuq3SvGLCZ3JjjfBw5cGmruUCHcrAQZE+LLW0HjXFY8Y0nhFCz0rkXSKohGbFffX6c82HRfpTI4H51bq1V+eEX1xh0jIiAvENk9570qpXl+3J9N1yXfedUS42whwceKbiTpe6BFpyG8bhlyYyrhVWmuWzq1Rq56ZJieMLeLVf/ke8WSWv/k3s0kkHX7xcZdat+Oc1BpCAeOM1nqt8tS7QYz3Pt0X773yHncDzOF+gCFCYXWqZcswvTORZZ4Qz1i2+FbOUU2JVJbm+tH61WdaWXBPlVRacaE/i9YaAcSSDmPKAvzopXr5rTlj9C8/7tLth2JjArZcaVvG/LTScxe2hN+NGqkvPt5Fkou7hTueCHe6BLhUz7O0MTzLEzxqGfIpVzEnmcrJsRVR/dKKZh67d7KwbZNEModhCHKOxz/78UckUzn+w4/uoThi4TiKSMjEU4rPtp3Tv1p9gpNnMyIcNJRhiv2e5/3SULyzbl9q29XufyfiTpYAA6J4cXOwRiAfQBovG7AgnspFgkGLF5c3qZWPNcoxoyMkkjmSqRzSEEjxVd4LAVIKUhkXIQQPz68Uc5vKeGddt/5gQ7dMptzGSMj4F0iWLmkO/9zSavWavZljVz7LnYY7kQCFwVZLWkvKtMotEVqukqaxJJN2Kj2lWTx7vHrl6WmyqbZcptIO/bEshiGQUvzBpSqlT45Y0iFoG6xaMVEsnTmaNz89oTbs7o0CD4SCxjTHE+sXt4T+q2na69bu7O+74tnuGNxJBCgsW7WyGbtbhVu163zHNK0nco5XG49l5NTJo/Srz0xj8ezxUilNXyyLlALDuHFNZ0iBpzX9CYfqihB//nKD3NrZp3/5cRedx+KVAVs+bZvGNC/nfrawKfrzfpHY2NFBjjtMLdwJBLjM4FpSH5jSrY1vS9N8wlOqtT+RCVeUhfn+yul6+f21IhywSKRyIBjUxF95Y0MKco4im9PMnFoqpk0p5tMvz+i315yUZy5kGkJBs9aSTC/zIh8ubtG/Xr8ntTN/+R2xbRzpBCiIVP2taZHKnBJPCckKIVicTOVG2ZbBMw81qBeXN8vqyqiIJ3PEUzkMObS2rRAghCCVdhFSsHzxODG/eRS/XXdKfbipx0hmvAXhoHEPWsxb0hz9jTCdj9ftyh654h1GJEYqAQb0/IOzKUmlQvflFCsMQzyeyXpVjuMx954qterZaaK1oUKmMi59eT0/1JN/2UNdYh9EwyY/fHKyvHdmBW980qU2d5wPGVI8FgzIeZ5r3b+oWf4iHAqu/WTrhf4r3mlEYaQR4DI9f1IVzU6l1BOmKV9wXVUbj2WpnVSmX3mqhWVza6QG+uJZ5BCI+xuBIQWup+lPOkwaF+bfrGqUG9vP6zc+7eLgiWR5yJYvWJYxN5XKvbG4MfS7Ije9/fcHyTIC7YORQoDL9PyC5uK6k9p9xjR5SWnRFEvkQqNKgrz8ZIt+6qF6URSxiSdyALd0xV/zgQUYQpDJeaBhQesoMaOhhN9v6NG/XXdKnu/P1UaCxo+kaTwcE+HXF7WYb7ftiR3KXz5i7IORQIABPb+kLlqB7S0TUq0SmAtSmdxoKQXL76vVLz/ZIiaMKxKJpEMsMfR6frCQQoCAZMpFSsFz91eLRdPLeXvNSb1665mQ6+jZoYCcpFEPLGoO/8py5a/X7k+cK1zOMKuF4STARfftRIJeOLIEoV+RhnlvNutNyjkOs1rGqlXPThP3NI0R2Zx3W/T8YFGwD/qTDqVFFv/s+Vpx/+wK/cuPu/T2zr5yy5KPBCyjybPU4sWN0d9lIonfb91KimF2Kw8HAS574YUNobmeJZ8zhHzI8fSMeDwrJ1WX6JefbOFbCydKKQWxRO626/nBwpAC19XEHIf6mqj4y+83ifW7evUbn57Qx7qTNeGQucqyxLxQKjJ3YYt6e8Oe9BbyIWuGQS3cTgJcOvF6UWvRVOmqR6Qhn9TopbFUzi6OBPjes63qmUemyrLiAPFkDq2HT88PFgX7IJ31AMG9M0eLmVNLxfttp/W7X3QTSzhN4ZBRa2HMXdIU+Z0y5Ydtu+Od+ctvKxFuFwEG9Pyy5vBYD70UT70kTflAKu2UIAQPLZqkvvv0NDl5fIlMpBz683r+Km77OwaFmEM85WIagm8/NEEsuaectz49qT/fcdbWigdCQTkHTy1b0hz6pYFYd7vT0m41AQopVWrBeEJmaXCeq+UqU4oHMzlvQjaV456mMfrVZ6aJOa1jZS6v5+UI1fODhSEFWvv2QUVpgB+9VCfun1NBPuxcYlvy2aBtznVd9cmSacG/c6OZzRs3ks5ffkvT0m4VAQbE/Y9BrmmJTvWUek5gvKCVbuxPZq3qsUX62yuaeWTpZGGa8o7S84OFIQWOq8k5LtOmlPCT14rF2m1n9ZtrTtB9Nj0hHDBflsKaLWPGR4ua9c+rO1K7b3Va2lAT4DI9v6w5PPYTpZ+XQjwnpZyRTOVKwyGL7zzZolc+1ijKS0PEkzmyOe+uWvHXwoBbOR92fmj+GDG3uYzfrevWH7R124mUOz0SNOrQcvapxtDbSxG/Wrcv1Z2/fMiJMJQEGNDzi6ZSJI3ICoV40rTEsnTGHae0Ztn8GvXKUy2yftIokUw79CeyeT3/xzH5l+KiW9klYElWLZ8o7p0xmjf8sHNYwP3BgNmolV68pDnyO+Ul323rpJCtPGT2wVAQYGDV5/fzixFihWHI5TnHq0+ncjTXj1avPN0qFs6skq6rLoZp/0hW/bXgh52hP+FQVRHiz7/bILfu7dOvf9Kl9x2Ljwva8iXbErMhOm9Jk37XSCXXrz1GJn/5TdsHN0OAy8T9kobIdNfUyw1Dvuh5uqU/njErR0f1n7w0g8eXTZGFdKyhCNPebbgy7DyrsVRMqysWn245o99ec5KeC5n6SND87w1D3u9Gwr9c3MIHVXtS7UNhHwyWAAPifnFzsEZouQwpXhSIZfFkLhqwTZ5/rFG/uLxJjCn307FyySxS+lVZehg94IWRuvQZtL74GW4IIUikXaQQPL5onJjfMorfrD2lP9rUYyZS7j3hkFEL+vGTjeF/WCzVh+s7Msfzlw5KLQyWAGpeHcWmGV6gNauElN9yXTVWac2yuTX6u0+3iOa60SKdcUilc5imRFxWkjd80PhOGk9dfB7TEJimL5VGhjkiQEM641IStfjvnp0iHpg7htc/6dKbO85HDSGWGoasVYr7lraE/y6bTW3cfJDYYO50owQQy5ZheGdCsxXGd6XQDyJkvdbKKC8L6W+vaGbp3AlCKc2Rrj7kCHTkFAiQybkDK74v4aAB19Uj73k1KK0piVr802drxcyGUv2rNSd1f8KpktJ4UWs1y7Sinyxp8v7RGJPeunYtHjegDm7kdSWgFjaGVwgh/pUQYo7WOugp0FrrSMgSoWA+HQuumnk7UqABQ0LOUaA1liVRaqSs/qtDKX9OIyGTTM4jmfa0lAgpBEKQ0Vp/qbX+dxv2pd7lBtTBdUuAHwM/AYQUDYYUSzwFRWFLGVJIBEJ5GifnELZHhqj/OhQmP5Xx/EEV4HmacEAO/H1kwn8wx/GwDBhVbAoBeAqVzHhBwxBLPMWv4eJcXQ9u2AYQAiUQOp119QOzxsin763yjRYpRu7Y5VGY/HTW42e/OEA6lkMKgWkL/skjlZRETVxv5KmBq8FTEA1KPtxyQX6yvU9Fg4YQQt8eI1CDCFiSTR3neXDOGCIhA0+NABP6mhAopSgKW3ywsYfOY/28tnIakaDFf/zHHbTtifPcveWkMgo5soUYaAhYgmTaY/vBBLYpRL7K7YYxqFfVWmOZkjN9WdbtPIdtSVxPX7adGmkfz9PYlsGhkwk+3tzDhLFRvvtkEy8/1UTdhBLWt/dx4ESGgCXwvOF/3mt9XAW2Kdi0L865mItlCPQg/UGD5rpSGtsUrG/vpS/hYBpy+BPcrgWhkQLe3XCa3v4Mrz7VzLgxUUqKAvzg+RaSGZdPt/f5xuAIlgAaMA2IJT2+3J/ANgU3I3xv+FUlPgstQ1BRanPybJqN7ecJBSR6hKoBpTSRoMnW/X1s2N3LrOYKnnu0nlTaIZlyWHF/LQtnjGXnwRjbDiYI2/KmBvVWQmsIWpJtBxL0XMgxqsjANPyfD4a3g+a6lLCgqYiAJVm38xzxlDtiXbyGIUimXd5d3w1a88OVrRRFbDyl0VpjW5LXVrYSsCWfbu+jP+lhjlApYAhIZhSb98WxTcnM2tBNBdMG9Zp+WxVFXXWIxpowh04l2bL3PKGAMbBfHSnwlCYUMFiz/SwdR/p5eEkN982fQDyfcSSlIJ50WDBjHE/cP4XDp5Ksa48RsH3fwEiCUhC0JTsOJTh2JkPtOJtJlRY5Z/A7l0HzvKAGFreUYBqCz3f0ksp4A2HOkQCtIWBJTp7L8OHmHkaXBvjhytavkFRIyOY8vvdsC9Vjwqzb3UfXmSwBW4yI+EABUkI6p9i0L45pSGbXhwayjQb9nYO+UAgyOUXDhCD148McOJFga+cFwiNIChR2K+9vOM2pMyleWt5IU105qbzfogApBJmsx6QJJXz3iSbO92f5dHv/iPIHKO2v/t1Hkhw5nWFypc2Usba/+m9CXd2UplMaAqZkcUsxQsDaHefIOCNDCiitCQcNdh/uZ93OszTXlvHtFY0kUw7yKraKYQgSyRzPPzaVmY2j+bKzn/YjKUKBkWEQSgE5V7GxI45AMKs+hHWTOwC4SQJI4YukppowtVUh9h2Ls2N//4iwBaQQ5FzNO+u7yWY9vv/8NMrLQjiu+lqPietpisIWP1jZitaaT7b1kcoqhtu2Laz+PUdTHDyVYeIYi7pxNtmb0P0F3LStqzUEA5JFLSVoDWu2n/UHeRjlp1L+6v9i1zl27L/AsrnVPHrv5AHD7+tgSEE8meP+BRN4aFENnccTbNobJxgYXoNQCJ+cG/bE0Fozuz5M0Baowbr/LsFNE6CwI5g2KcyksUH2Houz+3CMUFAOixTQGixTcq4vy/sbTlMUtnjthVYMIdDXaS0pBT9c2cqoYps1O/roueBgW3+4vcytgNIQsiR7j6c4cCrDhAqbhvE2GUcPScR1SHa7/oqTLGwuxnU1a7aeQXl6WKSA1pqALfn9pjMcPZXgmYfqmNVSSSLlXJdtIqUglXZori/nhcca6D6XZs3OfkxjeHYEAvC0pm1PDNfTzKwLErIFNx72uTqGhACFHcE9tREmVAZpPxKj42jctwVu46gprQkGDPZ3JViz7QxTxhfx6jPNpDPuDRmmUgpSKYfvPNnE1MklbOroZ/+JNKHb7CH0db/gwIk0+0+kqS63aJoQHBLdX8CQ+bs8BdGQwYKmIjI5xeptZwYaMd4uCHwx/876bvoTOVY908L4yiKyOe+GBkwIP1lkzKgw33t2GumMyyfb+nA8xe3c4Ah8lbZ+T4yso5lZGyISEHhDaI8MGQGkgGxOMasuyviKILsOxejsShC0jdsiOn1/v8Hmjgts6TjP/OmVPPVgHfF8Y8gbhWH4VcmP3zeFJbPGsftwnK37E7dNCuh8yPfw6Qz7utKMG2XRPDFA1tVDSsIh9Xi7HhRHDOY3FpHMeKzZegYhGHSo8kZgGoL+pMO7baexTMFrL0wnGDBvyhDVWmMagtdenE44YLB6ez8XEq4ffBnCZ7/qvfEzhNvaY6SzihlTghSF5JCufhhiAggJWUczuyFKVXmA7Qf6OXQymZcCt27IPOXr/k+3nmX/8X6W3zeZxbOqiCdzN+WUklKQSDrMaa3kqQemcLQ7ybrdMQKmHDIj7GoorP5jZzLsOZZiTKnFtElBcrcgaXVoCYCfWVtWZDJ3ahHxlMvqbWdu2l99LWgNQdvg2OkUH23uYVxFhO8/N42ce2N6/+sgpO8mXvXsNGrGRfhidz9He7IEb2GcoNAToW1PjERaMX1ygJKIxPWGPmVxyIOeQkLO0cydGqVylM22zn6Onk4RuEW2gNYaKeG9ttOcPpfipccbmDS+hETSQSs/E8gP+97Yd3qe/9Fak0w7jK+M8spTzfTFs3y6ve+WqYDC6j9xNsvuI0kqSkymTw7iDLHuL2DoCQA4nmZ0scXshih9CYc1287k99FDO2xKaSIhkx0H+lm/+xxL51Txp9+egWFLRo8KUVoSoLQkQEnUxjQEnnft+2vtq5OAbfjXlgYpLQkyelQYKQUvPD6VGY2j2bY/xu5bFCfQ+AZoW0eMWFIxbVKQUUUGjje09ynglvQHKJBgfmMxm/fF2bL3Ag/NraRyVABnKPew0m/D8rsvutFaM3lCKf/lV3s4cvwCSkEkZFFWEqC2ppRZTRWMrYgMtJ258hl8SSIoDgc4cPQCW9p7OHisn1giR3lpkNqJpTywcAL/4gdz+P5ffMTHWy9QXx0cUgeR1n6u3+nzOXYdSjKqyGDGlCCOe+uy1W8NAQTkXE1lqcXMuigffXmBtdvP8t1Hasjl3CHxEHpKUxw2+d36bnYe7KMobPE3r7cTDplMrComnsxxuCuBZUHANhg7OsxLyxt4beU0XzWoi0TUGkxD4mnN//qfN/HWhwfoPpehvMSmalyUI8f6SWc8qisj/I+vzuTpB2t5/YODtO2J8/CcUpLpockkLuRYbOiIcyHhsnRalNHFBqncrRH/cAtbxBSkwMKmYrbuT7Cx4zwPzBlDebGN492cg6iQ6HGq10/0CAdN+hNZnn+0nr/407mUFAXwlOaTtuP81V9vxHH91jM//X+2cvBYP//+z5cMbA/97Za/5frnP13Lu58dJRwyWTJrLH/9l/dRWRFh36Hz/NlPVnOiJ8Ff/sc2Hls6kUlVUdbsuMD0KRHKi02cm7TQNWBZgjP9DtsPJiiNmsysDfp1CjcxVn8ItyzzrSAFxpXb3DMlwtkLOT7fcQ7bvPnk0YFEj7bTxJIuuZxL/cQyfvo/LaKsOEA26+I6Hk8tb+B7zzbTH89h2wbjKkK89eFBfrv6MNGohac0ytMURWz+9s123llzlOoxERxH8fITjVRXF9PXl2Za8xieuH8KjqMoLbL5/MuTRCM26azi460X/F3OTY6XVmAbgk174/TGXJomBBhTapLzbm3J2i1NffRLlzQLm4spiZq0tfdypi+LZcpB602lNaGgQceRGOt3n2NMWRBPw4MLJxAJWySSF4M+2f4M988fT1HEwnUVKh8o+qTtuC8BNNi25NSZBD9/Zx9lxTbZnEcoaDKxqohcykFKicq61E8s9VWXEDiuIpXxmDK+iC2dMfZ1pW7KQ+hHMAW9MYet+xMUhyWz6kJ46tZXqt1aAgjfMTS+IkDr5Cine7Os39VLwJaD3hFI/EaM77SdJpF2+MHKaXzw/z3Ld1Y0kkg6WJbM31vgKU1ZcYDiqI3r+RNuSEFvX4ZcTqHRhIMWbdu76T6bxLYMXKUIBQ1Kimw/liF8iVNWEsQyJcrTmKbkTG+KOfeMw5SCj7b2kXMHHyfQGmxLsKUzwZk+h6kTgowbdfNq5Xpwy5Of/YCGZlFLEUVhk3W7ztEb83sG3CgFlNKEQwZt7b1s6zzPkllVPPVAHRMrI5SVBL4SeSxUK2qdX0nCj7CFQ5Z/f+3/bMfecwPPohUELCPvRvaJ5O8oTL/4RWss06CnN03VmCIeWDiB9kMxtnQm/G3hDXoIC4UeF+IumzvjRIKSWXXB2xZ1vPUEEJBxNJMqg7RMCnPyXIYN7b0E7RuzBbQG05Scj+V4b8NpwkGTP3lhej7n38G7wljSaAxDcL4/OxAQklKQy3nMaRkzIClcR3G8OzagxzUa05B5NaUHCGxbBobh/07hZye64/zJi60UhU1W7+ijN+ZimTdmDxQM2q0HEpy+4NAwPsD4cmtIQ77Xwm0rf/ClQDHhoMHnO8755WQ3UH2htSZoSz7cfIbDJ+I8/UAtc6ePJZH0y9KuHCzlaeyAyZb208SSDgHbIJF0mDS+mBceayCVdgaOj/O7j/utdrT2HTFSXD6RUkqE8Pf8Gl8NnDgdp7ZxDM88XEfX6RRrd/X7mUM3IAVMCbGUx+a9cUK2r/sLJLsduC0EkHlboHZckOaaCMd70mzuOE/Qvr60sUKix6ETST79soeJVVFWPdNCJusf4fKV31eaQMDgQl+a//bOfoojNrFEjkjI5D/863upLA+RcxQybyf4OYxcEuITX5mBvP13GVxPozIuq55uYXJ1EW3t/RzuzvrvdR1iQCkI5As9TvbmqK+ymTjm5go9bhS3TwLg69NFzUUEbIPPtp8lnnQHxOq1UNDl72zopi+W5dWnm6mpLiKT9b5ieCmlMQxJ0Db5yX/axJET/STTDhOrivn7//0R5k6rJJ50BpJDpRR5e+DSp9BfjffqK+IJGmxLonIe1ZVRXn2mmVgyxyfb+vxkzeuYQMOARFqxoSOObQlm1YVu+3Hlt40AMp882jAhRGNNiCPdKb7svEDINq5pCxQyfL/c18em9l7mtFbyzEP1fobvFYkerqcJBkxMQ/Avf/YFr39wAIDnH67j9f/zMVrqyv0jZvJvrfJ1gUURe6A7iBD+1vXKjNtCHaF/PoSfkVtSFKDQ5vaZB+uY11rJjgMxdhxK+tvCa6gCpfwiz12HE3SdzVI3LsDksX6q9+3MOrqtJZAaf8UtbCrGMiVrtp0h8Qfy9QxDEE87vLP+FFLAay+0EglZl6mOQvSurDjAmd4U3/+LT/jbNzppnFLG//W/3MfP/vW9hIMmiaRDNGwRCvgOUK3AMg2qKyO+azj/n+epfKcQMSC5HFd9pQlGzbio32JGKYIBk9deaMU0YfX2PhJpD8P4+rGQElJZRVtHDNMQzKwNIeXtXf1wmwlQkAJNNWEaxoc5eDLJjgP9hINXLyRR+cLO1VvPsu9oP4/dO4mlc8ZfluihtG+1lxYHePezIyz/09/ycdsJ/uzlZv7bzx7l8XsncaE/QybnEQoa/PT/3cL//O/W5Z06/n3umTp64J4in9qWyboDdoEUfss2N1/v4DuUDKbVj8bzFKYhiSVzLJ5VzeNLJ3HwRIL1e+J5G+er41Ao8mw/muTY6SxTxgaoq7Ju++qH20wAuOj1WtBUhBSC1VvPkMp+tZyssD3qOpPmo809VJaH+MHKVlz34ogqrQlYBsm0y7/62Rf8079azYSqIt75myf46b9dxrgxEVxPU1oUoChiEygOsnt/Lxt2nPbPChaCdMZl8cwqRpeFcFwPwxBksq7fvVzmiy+E4Hx/BtdVmIZ/Td3EUlobRg/UGQrAcRXff76VytEh1u7s4+S5LAHrq9FCKSHrKNr2xBBCMLN2aKOKN4LbfmRMQQq0TApTXx2msyvB7oP9zGseRfKSok2tNYZh8P6G05zuTfPPV82kYXIZff3+uUFaa+y8Q+aH//Zj9h4+T1lxkNFlId74YD//5Y3dSFnYzuW9gKak63Sc0WVBdD4amMl5TKwu5vlH6vnrf9xJ9ZgIZy+kOdGTYFZrJV4siwwYHD0Zw8sbmKmMy6tPNVEctemLZwfKzNMZl7pJpby8opH/479uZ/WOGC9/qwLNRXtCaQgHfMv/cHeGSWMDNFTfft1fwLAcGqU0RGzJ/KYiOk+k+HTbWe6pL71MrIdDJrsO9vPFznO01pXz4vKpJJPOgOGnNViWpKc3xbFTcSpGhfGUYv3WU7iu8gtAL11RwncjI6CyPDTwT4YhSKQc/uw709m+9wxt27oJh0zeeH8/980dT3lFhK6uft797AihoMnJniTfWdHAykfrieW7nXPJdyWTOV54bCofrT/Glr39zKyL0DIxTCrru4oLQbL1e2JoYOaUIJYlSGeHhwDD0gejUFTaOjlCbVWIvUfj7DkSGygqlUKQzXq8s74bx/X4wcpplJUEcdzLFWrBxZvKuPT2pemLZX0VIXz7QelLPvm0sHjSpT+eG/gOAXiewrYN/u+/+hYrH61HCMGHX5zgge/9ipd+9D6PvfYbtnf0YluS/+G70/nffrSIbM7jau4ax9WUFgf4wfPTcD3FJ9v6yOT8yVcaQrZkf1eKAycy1IyxmTohQPYWxvv/EIbt2Dil/Tz+eY1FHDyZYvXWM0yvLUZrCAcNPtzcw86DF3ho4QQeXjLJ99Zdsu0rWOZVYyL8+z9fclWH0JUoTHZR1L7s51L6HsFwwHcUfffJRjbsOM3+oxeIxbM8vHgijVNGsXR2FU21o742qwjy9QTJHA8tnsS3Pj/KRxu62LQvyn33FJNIe7ieX+blKc2MyX6ZV2qYVj8MIwEK5WQzaqO07YnRfjhGx5E4MxtKOXUuzQcbTlMatXnthen+BVf4R/2KWUVZcYBvPzH1+vdPeemQTDlfeR7X08STOe5prGBOa+VXLs1mvbwf4Q/0QM4/yw9XtrJpVw+f7bhAc02IyjKLPcdS7O1KM360TVNNcNh0fwHDenKo50E0JJk3tYjXu9Os3naGec1l/H7TGY6dTvLayhbuaaygL5bBML6qrQS+8+dCf+arX34VFLxsAnHVaqGLp4Q7qJTvFyhcpPFV0/UcciGlIJnKMb2xguceruNv39rD2l39vPxABev3xHBczT1TgkSCw7v6YZgJIKW/I5hZF+WL9n72HY/z1mcn2bjnHHU1Jax6uoV0xsW4SrCnACEYOIdgqGAYAuMr+v3GZskwJOmMy6vPNLNmUxdb98cojZocOpVhbJlFS01g2Fc/DJMReCkK5WSLWorJOZr3N5wmnXH5J882U1EeJp11UdrP7b+TPkpr0lmXilFhVj3bTCarWLOjD8fVzKoLEQ35hR7DjWGTAIW2p7bli9WJlUHCAQONJhK2eev3B3jr9weG6/GGHJGwP9ShgKB6tIkhBbbJQILscDVUue0E0PlAm20KLEPQfT5HW0eMHQeTpB2FJQVSarp74nj6RgXvyIPGb+4opcTT/jbxrXX9tEwMMqsuREWpgef5voHhIMJtI0Bh4gOWwJSCrrNZNu71J74v6VEaMZgxOcjZfpfjZx3mNoSYPzVMehj3yDeLQoOHLZ1pNu9PUVNhUVFisq8ry/qOJO1HMzTXBJhRG2JcuYnKEwFuHxFuOQEunXgpBcd7smzaG2P7oSTxlEdZkcn8xjBTq21GF5v09Lmci8VpP5alcXyAqnJzRBhLNwqVr/Hr7nVpP5YhHJAsaAxTWWrSUG3TeSLHgVM5NuxLsftYlpaaADNqg1SVW2h1+4hwywhQOHwjYPkW/LGeDOv3xNh1OEkyoygvNlncHKG+yqY4LHGVJp5WlBcZzKkPsXZ3kk93Jnl+sd+D0FXcOfog7yRKZzWf7PTfd1lrhNHFBvG0IhqSzJ8aomlCgAOncuw7kWVTZ4rdRzM01QSZXRekutxC4xfawq0jwpAToDDxofzRMYdOpVm/J8aeYylSWcWYUpNZdSHqxtkUhSWuq8nkU6CMfH+BpgkBus+77OvKsrEzzX2teVUw1A97i6CAoCVYuztF11mHqeMDNE0IkMlpDOm303E9TTggmF0fpKHa5mB3js4TWbYeTNFxPEtDtc2c+hA1FRbgjwsMPRGGjACXTrzSms6uFBv2xuk4miTj+HWCc+pC1FfZREMSx9Vkcjoflr3ki/J5+HMbQpzpd9l2ME3NaIvJY618a7SheuJbA6X9yT9y2mHrwTRlUYN5DSE/5Sz/7AVjz9Pg5jQhWzCrNkhDlc2BUzn2n8yx60iGzhNZGqoDzKwNMrnSHmjAoYfQOL5pAqj8di4c9E8N2deVYn17jI7jKRxXU1lmsWBCgLqxFqGgP/EFw+5qk+l796AkLJnXEOLTHUnWtiepLCvBNhnxOwNDQiqrWduexPN8IpeE5VXTvAtEUBrSOY1tCWbUBplabXOw22HviSy7j6bZdyJDfVWA2XUhJlXamIavXoaiduCmCRAOSFJ47D6SZH17jM4TaTylqRpl0TQhwKRKi1Dg4or/uom/FIWKotpxNid7XXYfzfBFR5KHZ0VxcyP3UCe/qaNg7e4k3eddpk0MUF91fS1dpfAXUianMU1B62Q/S+hoj0NHV5a9XVn2n8wyZazNnIYQU8bahOybH4jBE0D4n+0HE6zd2c+h7gxKQfVoi6njbaZU2gRscUMTf+X3e55mTn2Qnj6HXUcy1FT4pBqJW0M/1CvoPJFl5+EMY0oM5jaE/KYUN/CslxHBEDTVBJgy1uZwT47OriwHT+U4fDrHxDE28xtDlIS/6rS+EdwwARSARksBr685y4lzOZTSfnQrv+Jt02/UPKiJz0PgG0vhgGR+Q5iPtidY155iXJnlu1HV7e1BeC0Uyrv6k4rP21MIAfMawkQCVxf914NLiSAFNI0PUDvW5miPw96uLIdP5zh2Jse4Mitfv4jWg7jPDRNAa6QhEEqjT593dNUoS8yuC1JZZmJKgePpAWPtZldpQRVMrLRonRTkywNpPt+TZMXcoq+Eh4cV+aLTL/YkORfzmFUbZFLl0JR3FcawMKb1VTaTKy16+ly2Hsxwpt/VtimQAuENYqN03Rf8JP9/Q+lOpfRmIdC2JYTrae14Wkvh965XX5MoMVhIAY6jmTklSHW570XbdTST75Y9dPcZLArevj1Hs+w5nqFqlMms2pDv4x/CccivcpT2w82Op7XraW2bQgiBVkpvNpTuhOs/NRRufA2JZWColvC3lBJPIcQTWjMh52mqykw1qzYoqsot4SqN6928BChgoHfOBZf3t8axDMELS4v95knu8AVS/IJV6Eso3lzXT9bRPDo7SlX50JZ3Ke2rGFMKTp139fZDaX2y15WWCVKILrR+R0r9W7kntXott+7w6MuwZEa0QmfU48KQywX6PsejAqB2nK3umRyUZVGDnKuH7FBmnV9pWw+m2bA3TV2VzdMLi4f1xNJCT5/fbozReTLHgqkh5jaEBvwbQ/H9QvgR0/6kYsfhjDrcnZMajWVwViM+0556TwTl+1/sSJwdzD0G+5gDp1Mvbg7WaC1flFKs0IhZrqujtiVoqQnqlpqACFhiSL1YUsCH2xIcPeNw//QICxpDw5JVo5Qf2v3yQIZPdiSYUGHx2OzokOT2F74jYAmyrqbjWFbvOZ4VWUdhmiIh0NsU+j2h1S/Xd2SO5y+77hPDL8XNDFvhWr0SjJ6pkWZXyu8YUj3pKdHoelqWRg09Y0qQKWP9DWuh1elgb1ooKjkf93hvSxylNc8tLmHcKPO2VtQWnuNsv8ubX8TQGpbPjTL6JptFaS6qO4Ajp3N6++EMfQlPmIZQhtT7PHjHdPl55fRkx5tvcmlq8qCoNxRDVki1Y9HU8iJppBdr5CopWOoqXe0pqCq31KwpQTl2lH86983YBwWjq/1ols/bk0yosHhucfEQvMaNQQj4dVucoz05FjeHmTEleFP+CaX9XgGmKei54LL9UEad6HWkIcA0xEmlWSdQf5fLpdo2HyRWeAxuspxwKNfMgAha2hgep6S4H8ErEhblXIqlFNRX2Wr65KAsuEa/LrX6emAYgk93JNh/0p+Ae6fdntyBgsOnrSPF2vYUdeNsHpoZGXQX78IYBCxBLKXYdSSjDpzKSU9pbJMY0KY0/6A99VlbZ/pU/rJBifurYaiHK+8f9B9uYWNkmoCHpSme04p5jqvNUEDoaRODNE0ICNscnH2g8S3ieFrx3pY46azi6YXFTKq8tQGjQoz/5DmHX62PYZuC5fOKKAkb+WriG3iH/Lq1Td930nkiq3cfzZDKamGZwhWSzcrVb2n4eMO+ZHv+Mr+NyRAWEd+q9XKpXhILm6JLhdBPGEI8ojStOVdTXuTbB5MqL9oHNzJxhabK+09lWb0jyZhSk5VLi7EMcUsCRhpfbSkFb34Ro/u8w32tEZprbtw1rfK7Byng2FlHbzuU1r0xT+YdOru1Uh95yN9t2Jv4An8x3ZSevxZutdk0IKoWLCBkxEMPCoyXBCx2PSZ6WjNhtKVm1QblmFLfgHLV9dsHhaTSz9uT7D6SZU5DiIdmRm6JKiiI/jU7k2zcl6apJsD90yM3ZPQp7UcLbVNwtt9j+6G0On7WkVIKDMlpUJ8qrd9QxemPN24knb9syMT91XC7Nk8DLzF/WqTSdPUjQspXEMx1PF1iCEFDta2nTw6KaFCSc6/PPtD6YhLJu1sS9CVcnphfzNTx9pCSoBDjP9yd4zcb4xSFJCvmFREKCLzr6OQ5sJ83BcmMYvfRjN53Mic8pbEM0Y9ms0K/Yyj91rp9qe78Zbd04gu4nbvny+yDRVOLpmLolwx4RsFUx9PBSEDq1klBpo63hWmI60qHKqiCoz0OH233u2y+sLSEcFAMSafNQlZv1tW88XmM3rjHQzMi1I6z/6C9came95Rm/8mc3nU0QyKthGWKjIROpfVvtJK/aOuMd+YvG3I9fy0MhxN1QJ8tGE/IKgnO1Fq+IIR82lNMdDxNRYmpZk4JipoKSyjt587/oYEOWIK2vSm2HczQOjnA43OKhuSIlcK286OtCbYdSjN9Uoil08J/0O8woOclnDjn6O2HMvT0ucIyBIbBMa34jfDcN1LRzI6tW0lxC/X8tTCc8bQBEbesgdGOiC6Thn5SCJa7SpQrpZk4xlIzp4RkebGB42m8a9gHAj9b6P0tcU5fcHlsThHTJ99c7kBB7+/tyvLu5gTlRQbL5xZhm3xtIEppX2LYlqA37rHjUEYd6clJIQSWoXu15j3lid9ZmrVr9yfOXTkWtxvDHVC9fNvYFJwotVghpLFcCJbkXF1kGYKp4wOqdVJAhgNfbx8UPGjdF1w++DJOwBKsXFpCWcQYVGTOP0NAkMgo3vi8n0RG8cisKDUVVw/zXqrn0zlN+7GM2tuVlY6rsUyRQ9OmlfeWEvrdDXszx/KX3VZxfzUMNwEKuIwIS5qjzaC/LRCPeNDqejoYDUp9z+Qg9dW2MGTePrjCrVwIGG3Zn2ZTZ5r6apunFhQNyklT2GG8uznOnmNZ5tSFWNAUIntFoEfn/7DzR7kf7M7pnYczxFKesEyhpWCbp/UHUqt3v9ib3pS/bNgnvoCRQoACLsYXmrFPqdAspFwlJQ96nqhzPU1lqaln1gapHm0Jpa5uHwgBH25NcOyswwP3RJjXELqhUzcKon/H4Qwfbk0wbpTJ43OK/DZu+vLfMw2BKSmEaek+7wrDEJiGPqgVnwuh3+jVqTUdHeQYJj1/LYw0AhQw4ON+oLGoPC3Ug0LwihDMdz1GA0yqtPXMKUExqujysPPF3vsu732ZAA3PLymmstS8LqPw0oDTm+v6yXmax+cUUVl6MdCjtW+L2JagL+Gx40hGHe52pPLDtOe0ZpPW/IMSxscbO2Ln8189bHr+WhipBChgYNCWtAamCNd6WAv9ikDMyHo6HDAFTRMCumViQIRsSdbVA11eQ7Zg15EM6/akqBlj8dyi4utadr6bGX67Mc6BUzkWNIaZU+cHegqDVQhxd3Rl9Z5jWZFxFLYhkqB3Ki3+QZrOR1/szh6+8h1GIkY6AeBStbAS40RHaJbQxmOG4DmlmZZztSyJSD1jcojacZYQQgxU2poGfLIjyYFTOZa2hFnaEr6mKlAawrZgU2ea1TuTTKq0eGRWFE9drGhGw5EeP0x7IeEJyxSeIfQRpXlbS/VmdVN6+1CEaW8X7gQCFDCwkh6tIxCzwg8IIVZIKR72FLWuqxk3ylQza0OiapQpnPwZgYl8wCjjaJ5dVExNxdUDRgNpZ30ub30RQwp4fG6UsogxoBZ6+ly97VBGn+x1pOm7b3sU+nda6d+Es4H1nxy+0H/ls4503EkEKOCi/2BiSakbdZ4UWjyLEAtcT1cKYMq4gJoxOSCLIwZSQEdXls92JRlbZvL8khL/8OevWZdvr49x/KzD4pYwMyb7J3ck0oqdRzLq4Kmc9FvT0odmjdb6Pa30B4Uw7Y9B/uQOmfgC7kQCFHAx/6AlOEEr4xkEL4KYkfN0OGhJWiYGdOP4gCgOSz7cmmDP8Qzzp4Z5YMblASO/e6fg890p1u1JUV9ts3xOEemsYt/JnG4/miGVU8I2REoIvc1T+vcmxhuf740fuORZRsS27kZxJxMALtGzy5Zhqp7wdE/KVwyhH/WUqHM8bZZGDD2nPsi4Mku8uyXOuZjHUwuKaKiySTs6X8IuOHbG4e22GNGQ5Ml5RfTGPf3lgTS9cU9YpsCQeq+n9EeG4u/H7kvtfJM7R89fC3c6AQoYkAbz6kYVW2Z2vjDEywIedRWVrqeZMtZWZRFD7jiSJhyQvHRvyUBtgafgzXX99MY9ZkwJksoovf9UTpgGGFJ0a63blFb/6Dnp1ZekY90xev5auFsIUMBF+6AuNN6zxP1Cimc14kHH1VHbFEiJSma0nDre5vE5RQjh7xR2Hs4QCQoFyExOE7CIay22gvp7w9Afr92dPnHlPe4G3G0EgKu6ldUTQojHlBILhcQWQDKr9BPzikTAkrzd1q+DfkMLoRWulOz0lHpDGuL3X7Qn27nFWTnDibuRAAUMEOHHID9pDM0TUrykkQ8IaNJg2JZQQkAmq6VhgFK6E63fF4j30uHk51u34nCXTnwBdzMBCrioFpqJOiq8CCFXScG9GsYDCKF7tdIfg/i1KZLvr+0gceW1dyv+GAhQwGVp6x6sEFKsApRW/NrT7q83dWaPXvm73+DuQkEtAH5Z2+LmYM3X/fs3uHtxtUn+ZuL/CCEZAQ2zv8E3+AbfYHjw/wNvv/p4eua+IgAAAABJRU5ErkJggg==", "icon16.png": "b64:iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC6UlEQVR4nG2Ty2tcZRjGf9/lnJnJpJ1r0jQzJJ2YemltbBUhinS0RcGNEHBKBTfFlbjrVkKk0YJ/g+jCnXXRhboqhLSUolJD2lpRtNSxcTKdmVwmc8k5cy6fizRhrD6bl5fve97N8/zgMc3NFbWUAoB8imOFYWsKQArBXBH9+P89lUooY4x4tCYvfjA1f+nTk60vP3yu9dG5J+aBFIAxRpRKqF2f6JsG4P2ZiXNvFgtzp18aHy9XWrTrFcYOxLi2XC9f+bF+4bPvKl/0e4QxCCEwrx7PFt996+mPX5vOv5JOxvD80L//16bqrFUZG4kHtpZ6s93j+vLa9a8WVmav3mouGhACoHgsUXr7VP7S0cMZ2h0vcL1AxGwl71e7bHfajA1FcNwgtGxp9sW0+q3c5tvv62eu3ml/rQH2x8JcLq1JRwI3ionYWtPq9DgymcUPkrSqK+QyUen7IVE7dIeTMjIYETkACVA4GO1tbHXZ6gZKKYVBUG8bXjyRZ/qFQ3hyADBIJWk5oWq2euSzdm/vQGCkyOyTrNQ6xCKKxqbDlqdY/OEBS3cf8svfPrV1l1hEsrrmkIgLjNkJQAO4bkgirmmsOqw3HYwV5cmJBD/9XMVxAwIUTc8m2fHYdjyGhjRdbycKDRCGGBCMZjRLvzd54/RRbt6t8dREFq0FfmAYHxnk8jc3KQxLhAAhdmLXAJYtLNcLWak5QbnS1QuLt0kOaip/hkghkBLu/RpQ23AYsFQwmrG1pY21d6BS81av3Vonl1aRyREVNBpNuV/bQhoDBoQUNBo9c3jUCpUQkeV721Tr/upumwRgXn8+fmrqUHx+8qD9stMz+GHoH0hZCuDhhh8oKXTMFvxR6d24XXZnryw1F9gt0qNGGUDMTCfee7YQnY3ZcmwkpUFAdd3H6YUP7pSdC5dvND8HTJ+nH6Y9NlJni6lPzs9k2+dnsp13TqYuAukdmPgXTP9RsQ/ZI+MDx58ZHzjxf2+7+gfD/zQ/PlBTXAAAAABJRU5ErkJggg==", "icon32.png": "b64:iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAIE0lEQVR4nK2XfWyV1RnAf+e8H/e997a0wi202NuWQimCBQGDiMOGTZE5l2G0JsZp5uJ/Jupm4rJFrSXGbDFZlpksmcviH0v8QyRxC2GZDgQFnMMqFpQvS2sp9hP6de993/t+nLM/7r2lhaKO+CQnN+895z3P73nO8zzvc+AapK0NQwox/SyEoK0N41r2Et+8ZJZIrbUWQmgguW6J86Qwpew8k/sDkNEaIQQCUNcC87WgbW0Yomj1QocHn/np8pOvPrtR//GJFfrptrpTNZU8VFpc9Ib8ThS3tmLOcPfGB7ZUv/3G71q199Fjeu+rdwdvvbQ2GNm9Vf/t2dW67fbUOyZsgsKxtLZi8g1evupkGxi7hIiU1gB1W1ZX/Gb71mWP3XdXs1GWtJXWcLDzvMxeGGbTmpQSAp3Nhcbu9wfUnv8M/HXf0akXgT4pBPdpbeyE6NsCSN3ejujYoUDHV9Waj9+7temZB+9ZWVW3uIKcF0ZePjQqymMc6jxP5sIQm1anmMgGOJaM4jHTOD/ismt//+iewwMvH+v1XwFc3Y4UHcBl8TELoA2mSSsM7r3/7rqOh368smXdqmr8UEWuGxjSkGilKUvaHPq4CNCSIuOGCCFQShO3jciypHHsi3F27Tt/7K33Bjsuuuy6XMflAALQS1Os27wh3bH9jqZ7tm5egmka0VTGl0IgpCwsV0WA94/0kxkd5LY1BYBSrGgNSmtdljBVFGljf+cIew4P7j50/MIL3QNBZ0nXTAAB6NtbkjsWVMR/tWVjvV01P6GmMnmURpYUl0QrTdwxOdkzRj6bobm+HDcfIYUo7FrcMNIaiVDlCZPRybw8eHQ0GMv4v33vWPb5kk5zJo1EPvzoD+vtuC2DjDtllSXnCpFioisfFfggDRzhUZY00FrPMGf6V0YqpDElg8WtKevPuwceBp4vrTBnrjclE6f7JvW2W2sMN28zs9qVRGlNWdziwCfDbN92A6Yh2b/vKJtaysi6EVKWzLnkCqXAiUlj/9FxbRlMzNxPzoyExsWO4Xp50fNVDgH4gcIPZ4ygEMDnBjNkIpM1zSluXJ5CxyvoH8qBAD/Q+NGMEWiEgL6hPG4+EHVVtgFQsm1WtVIamq6PceyLcSxTotGIIl/BSxrLEHSenuAHtzUWNlGKu1qbON6Xx5SXPH/pHTANwYm+LA0LTdRM71wO4PqKdJVD1vX4atTDNuW0N7UGxzboHcjSuHQRN62txvUi3HxEy+qFrLqxgbNf5XBsSSkUNGCbgqGxANcLqJlvkQ/U1QEkhSheWhOjq3u8AFBELlm29+NRMq7i3f092LbEMiX73u0hVILuYYVSavpItQaraH1dlclcMgtACMgHivpqh8kpj8GLeWxLFvLeMfj41BiJ8jK2bErz698f5p1Dfbz59hn+vrcbFSn+cXCInkEfp/iOZQhGJkKmsgHXL7AK8SC/BuASiKBhkTXtBSkFY1N5hjOw4xebqFuUxIkZVJTHePfDfpbVV7K8oZKyhM1w1mQy6yOlwDIL1temjDkzak4AISDvRyypiXNxwmVozKc8YXLk5Dh3bF6KHyn+8sZxnnpkLbdsqMXLRygNYaSJWYJtW5rp6nFJOpLRyZDxKZ/alEU+1MzFMOfBaMCQgnTK5NS5KVARdjLJzWurefzZf3N+OEttdTk5L+DR+1byzwO9eF7Ats0NrFu/mPePfMnA6BS9IxHV10kMKQhDPZequQGEEOTyiuZ0gsOfZzg0GfHYQ+sJvIhf/vxmvHyIm4+orS5jUSpBY20lOS9k1bIF+FM+bT9axZ9eO4wOXNY3xfH8ua2fE0AVI9ewBROZiIELLoMTOd7c/SnZbIjjFM5TCAgChR9GODETKQV79oZoBcmEyalzWSqdkCk3xryEJIq4ogZcASAlUdySun/E5/O+LKPjeWpTJmif3MVhaq4r5LEoVpi4EGAXPk4oiJsC2xQMjgUsKlekq2J8eDJHeVyyrMamZoGlJSK6KkDWUxUHj0+I/mE3XDBPypaGwvfAsWOcOu9zfZVJ0irk9+Ue1Vwqr30XfJoXx0g6ksqkwfB4SFevFw2MhZbr64pZRgNaFyouZwfc1ztPTYY31ses+ipbBSHK9TXJmGThPIOuHhfLgEhplJ49IqWxDOg661E1zyDpSFxfE4RapVOWaql3rBN9+fDL4eB1gKJOfUVDsnJJfEPdfHPH6ob4XUtrbBBEnq9l3Baiq9cjXWWRTlnkg0uBpTXELEH/aEDfSEBLg4Pna+3YQgFG94BPV4/7r3ND4XOf9btHmKMhAaAdZEexZ7sh7Tywss5pX9vorFx0nUmodOQHGJ996XHLijimIaZrvhAQRvDhyRyr6mPYlogMKYzh8YhPut0Tn/d5L5w4571xuY4rAErHojW62NwkNzQlnlyRdp5e0+jMn19u6P7RQI1MRMbGG+Lk/QKBYws+OOmSmmdE6ZQlL05FoqvHGzvR57383zO5V/iaS8vV2/I2jDd3EmkgFqPh1uVlz61IO4/e3OSI0/1+NC8hxZJqWwL0DvlqPBPp5nTM6DzjceKc99oHpzMv5vOcFcD9bRg7d377tnzWfGsrxoEDhADpKvN7qxsSHTc1xr8/no1Yv8wJhYCPznhmZdLg07Pu/qM9fnv/qPceQGsr5oEDRMzuka5J5MzL54amxCN3ris/88RPqvRT26v0nWvLu29pTvysNP9dXs1mSXshPkpeK9+4Ivnirc3Jl4AKKKRWG9d2S/6/pHjn+8b/vo38D0uExSal9QkqAAAAAElFTkSuQmCC", "icon48.png": "b64:iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAN0ElEQVR4nNWaeXBd1X3HP+fce9+7b5G8CVm29CRZlmVL8r5gcIipwawOS6jloYbphNJAM00nLdMySTrYFJomDE3CTJm2JJNMmE7bYIfpDCVgYgPGxnjDi2RjywveJNlaLT299b537zn940lCtla7Tpv8Zu7MnXvPPef3/e2/cy78lqiuDmPgni/ufx9IAgJg4+23m08twep7Ljbm3v3OkuiXtBCC4gk8cvOswIHls0OHZtxkrBViYJxBH8AbsuiNmKMO5GbwhBBE8vXicEhueODOWQ9NmhAgFYuSdBTv7mp9uyfpvNDSxX5Nzqw2gwL0/xuAPiY8EMyeoqcrUzy7oLrw6ccfrLW/ckel+uU7jfS2t/PoPWVi2742sWlbs9PwefQ14WRfOtHFxSvn+L8F0G/Lqq6uxrd367GvV82Y8J11988pXrOqklDQ50mBsXnLSWJdnay9M4JSyks5yti2r43/+qil5UxL/OVItXrto49ID57vehkZL/XbuRJCqOJJrDlff27nE2trX/2njXcXr39wrieE0D0xx5BCIIVACJBSEEu4BqC/uqrYe+nP5xevv6fsldSl0K7IFOMBIVCAqrsO/xjv4AE7RwhKJuq5E0LmxhWLS9Z+7ZG5zK8u9FIpVzoZTxiGwFOaSXl+Nm85SW9XB3WrS4nGMkiZe+ezpA74pTp2Nma8sbWJPZ9dfjOedF4810E9XJt/jAlgsJ1XFumbtOKZeVWF3/zjh2vDK28u1VIKnUhlpRS56AOMCgBAa1BaE7INpTRiz5Eu8ca2puRnZ6Kvarx/PN1Kx5Vrj0zmKO8kwGbwNm2qM/766c1PRgrzv/OH984uf2j1LCbm215v3DG0Rhjy2lxJCDCEIOl4UiBYubjAW1A1Mfje7tZn39p5cZ2rEj+4+2H185/8hCxj+MdwK39hLsBkP6tLp/k23Luy4svrH6ihPDLRi8Uz0vXUiIz3a+BX752kt8+Jo/EMUlw1XgAalAZDCh0OGqqpLWW8+WEL73/avqulM/V8e5RtMLJZjSi6+5blVcWSesPC6sLHvvbIPBbVTlWZrEc67Ukpc845EnlKMzHPz3/8dyPRznYeu6+caK8zYELDkQaU0th+Q/ksqRtORY1f/qaJI2ei/277+N62Q/Hjw30nrr6/9+bJeb29mb+KpbN/uermyMS7bqvQpil0PJGV/REFPQr0fvsOWOw/0kqqt4dltQUk0+6Aj4xEgty3WkMoYCjX0+Kjgx1iV31XT9AvXsl37R9vOX05NgjzF2zU1WFs3oy3sMJ3f2lh6Ncr5hWgwUumsoZSelTpXc2G1hqfKdnZ0IXrKW6pzsP19IDJjGMKlAIpIGAbnhAYB0/GudiRWXPgTPKdfl5hGCfOC5qiqzfrzZ2RT2UkbGSyaqjtjkJKa8IBiz1HOwhOzMeQEl+mi+W1k0ikPK7F35UGn4lxtjXtbTvQQzBoDPl6CADHhUkhaby7t1U9MaWcdEZd06IISKRc3tvfyQvPrMSyDJ79h22UFwWRUqBHM78hADS2Jdl+OCpCtpCx5NCIOiQTt7Q5zImEQLkcPx8nHDAQQiDl2JcGJoR9bNvfxq1LS4kUhSmaEuCO2yrZ0dBNXjDXFkgx9iWAkF9yuiWN1h4zp/lp6XTHBoABGs3SqjC7jnQiRM6mxyKtwW8ZNLclaLrs8uia2SSSWeLJLHX3zqLbsWhuT+GzxLjcQJNLjPtPxJhXbqM1mMO0RUMA+A1IOYo5pUHSTobGC3ECfoOxMGitsf2Sd/e08vDdVeSHLVyl8ZQmFDCpu7+GD+uj+Cw5jrnA9gk+v5jGybjMnO4jnVEYw6TdEYs5IQSLZ4b4uL4TwxhdC7mwaXKo8TKmHeSuL5XRG8tgSIEhBdF4hlXLS5gwZTINp3sJ2QZqFBAaMGRO+jVlvj6XGd5xhgUgBKQcj5ryELFEmtPNCexRtCAQZF3F7uM9fGP9AmQfqAGGtMaQ8I31C9l/KkkmO3I0ypmi4FyrQyyZZVaxTTqjR0ycI2pAA4YhWFARZGd9J5Yph9WCUppw0OSTI52E88Oksx7NbXEmhP0DYyaE/Rz/vBvX9Vi+dAZ7j0UJjqAFDViGYF9jjOqID0MyqsmNCEAKQSrtMa8iTFc0xdlLSfy+oVowDEEi5fJvWy4gpeCD3U3UfesdXnn9EJYp8fsMXvyXvfzoFwfZtOUU2z5pouF8hmg8i3mVGrQGvylo6sjQHcswuyQn/dHC+KgNjdbgMyVzywPsPNyB37pSC57ShGyTd3ZfYvG8aXz3qWV88+tLWVhdwPdeO8iljgQHj7Xz8s+Osu6+Kp59cgknzl7mfLvD3sY4fkug1FXrWTnpVxVbWKYY0+FHBSCkIOl4LJwZpvVykqb2VC6K9C0W9Js0nu+lOy341+fvIOsqcFwsUxLwC/LCfvYcbsX2C4K2iesq8kI+phUESekAp5oT2P5cVNLkmL/YlaW9x6G61CadUaMWjWMCgFw6t/0G1RGbHfWd2D4DrTQajZSw9dN2HnuolnTGZfIkm4/3NbPtkwv86NtfpiCST3evgxQaIQSizxayrsejX6nmk+PxgdiiVc559zbGmFlkYVsSpcdO2mMCkAKSaY9FlXk0t8W51JXGMAR5AYuP6zuIlExh+bypWKbB9r3N/Oo3p3n7Z1/l7tvK6G6JUTw1hOuBlGD2tZtSCpYum05FxTT2HushFDAwDGjrznKpM01tmU1qnCXMuJp6pSEcMKic7mdHfSd5AZOeeIYDp2M8/lANWgp+/IuD/MnfbiUU9PHWB2f4o2fepeFEJ2tWVRCwJUdPddHSmqDpYpxH7qpEZT0ef6iaxosu0XiWkG2w70ScsqkmIVuOmieuGYAUkHQ8ls7O43RTL0lHsXVfKyv66p1k3MEyJXetKKOjK0HD0TYiRXlMmWhTWBDk9R+s5sSZbv75Pxt4/i+Ws+7eWfR0JCmdFmblLRXsOHyZdEZz9lKSeeXjlz6M3hNfQa4HIdtgQUWQ1985x+QpYZ5cOxe0Jhiw+NbTy8CQOaMVIufliSzKVaxeVcHqP5gBWQUBE53IEghYCOCJtbVsON/Jpu1tVEf8BP2SpJNLfDcEQH+EsK1cWTBtip83tjexYpHFD3/+Kem0i5QCpfSQUrl/X8hTuUwqRG5cfy+tlMZvm3THXPafiPHkPQUYUmBb4Lh6XFX3iAB0X7Md9AkMQ3Ch3WHPsRjReIZlVWEuXuyiJBTHdTWS4RutkbbZVB9OBRhJQctFh6VVYXY3Jjh8VrKoIkBxgYmnIJ3Ro+aCYQFociENJOfaHPad6OVyNENZoUltJIDtk3zYoNDSZMFMP0ln9Gw5LAgNAb+gsckhHPC4dY5NOgvn2zPsOJogHJAsmGFTUmCNWoIPAeB6YArhnWtz+OBQD7FklhlTLRaUhTBkTiKpjGLRTJsdR5NMDhsE/QJHjX+bTwOmhPYezb4TKVbODZLKaJSCmdN8zJjq43x7hl3HkvgtwYrqoDYFnje0nxkKoOQmv/78UsroiWeYXeLziipDhhCQcTVZN+efSkFeQDKnxMfHx5KsWRbGG6ViHAJAg2UKdh1KMLvYR15ADlScTiYn6/JCH2WFPtp6XG/7kYTR1etRNNnUZ9oyV8w14OubN+dMMxj07+qOe9/vTXpxpYWhtNZaaTV4K0WInCYqp/uQAg6fSRP0i3HFbqUh5BfUn00jBMwq9l1ZLot+kFoprbXnYcSSXrwn4X0/GPTvAkQfr4OHD6U5JdbcgM96bkaRb93imTaFk0zPdbV01UBFkNOGhg/qE9yxIMSksEHWHVkTWoNpCqIJj/cPJ7hjfgg5qFxWGkyJtkyh2npc4+DpNGfbM5tS6eyLjc3Zo8PNOebW4tzS4Jq8oNgwu8R/87xym/yg9JyslrovyvktQXNnlpMXMzywPI/MKOGvv9p8e2+Myuk+IgUWTlb3C0P7LaF6k8o4ci7NiWZnXyypXzh6IflruI6tRQYfYtTga0wE/nRKvvHt+TMCkapiHz5TeE5WG0pD2BbsbkwRDkhurQ6QSA+NSv2ms/dEimhCsaI6QLxvnN8SXsbVxsmWDPVnUy1dUe8HJb7UT7ecxhnMx3g1cAUN3uJeFAlMV6Z+dtpk31NLKgOByE2WRqMznpamhPfrE6yoCVI00cxpYsCewWcK2qMuO48muXNhCKXAMoQSAi50ZuXBU6nUpcuZ14QrXj7UlBr38dO1H3AA80qDi/0+nisv8j28eGaAgnzDA2RrtysazqV5cHneEIc2JLy1N8bcUptpk00NqK5ezzh0Js2Z1szbjqOfP3IheWAQ4zfmgGM0ILVlgUfyg/K5moi9sKbUT+FEw/vkeEpqjVg1P0jCya0fsgUfHUmiFPpLNQHV3uMZx5scjl9wDvckvL//7ELqzWtl/HoBALAR5N/lFtFLlhB0Ou0/u2mC9TcLZthFNaV+th9JeHPLbaOs0EJraO7M0nAm7d0+P2Q0NjkcPptu74xmf+ibkn71wAGSfXz0VxfXRDfomBVqZ9oRU8nvlhVaT86a7rcudGTUmmV5SAFv749RUmDJ05cy3vm27E9R3kv1551zV89xPXRDD7oBKosDt0ybaGxQmvuWVAaQEj49lULA1rbL7gsnL6U/HsT4//qg+0aSHPxTx7Kq0LoVNaGTK2pCny+bHVrf/7xvzO/uPxMbB/3ssXrJpAm3zZsw6ap3vx80WBvXc4A9XvofJARjOXRlJnoAAAAASUVORK5CYII=", "manifest.json": "{\n  \"manifest_version\": 3,\n  \"name\": \"Adventurer\u2019s Tome \u2194 Roll20\",\n  \"version\": \"1.4.4\",\n  \"description\": \"Rolls from your Adventurer\u2019s Tome sheet in Roll20 chat, results back on the sheet, and auras that follow your tokens.\",\n  \"key\": \"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4A4d+2F0czdgfrsYye0WJLKGPuFsF14ERbKZcE+kzNB+OWk7ziKiBs7b8K7g1lMqS4vUGcXTCJiKfa6GQyIQoob6AcyggdOHIn9MvHV59V40L9gxbY7/4bP7ePhr1KjCBciY3qWFoTqXpVRfbBt0zOwcYxcmgPPLI7kl9/bYpRyQRThUHT9sjNZl5wok1j67yfHZObrNJ/k9f4y42BJZx0DYX+B9cII0QdEzohSrgq/vtWEDwV+u8Ry6duLpTEiP5Jn92iAiXgh77PFVpQJaSxKoBmkfeDJctXRUBgnP0q9Cl62XA+nT2WhcNP/YlYbVmpbT4fMd/9OSWEvKLlOLxQIDAQAB\",\n  \"icons\": {\n    \"16\": \"icon16.png\",\n    \"32\": \"icon32.png\",\n    \"48\": \"icon48.png\",\n    \"128\": \"icon128.png\"\n  },\n  \"background\": {\n    \"service_worker\": \"background.js\",\n    \"scripts\": [\n      \"background.js\"\n    ]\n  },\n  \"host_permissions\": [\n    \"https://app.roll20.net/*\"\n  ],\n  \"content_scripts\": [\n    {\n      \"matches\": [\n        \"https://app.roll20.net/editor/*\",\n        \"https://app.roll20.net/editor\"\n      ],\n      \"js\": [\n        \"roll20.js\"\n      ],\n      \"run_at\": \"document_idle\"\n    },\n    {\n      \"matches\": [\n        \"https://app.roll20.net/editor/*\",\n        \"https://app.roll20.net/editor\"\n      ],\n      \"js\": [\n        \"roll20-main.js\"\n      ],\n      \"run_at\": \"document_idle\",\n      \"world\": \"MAIN\"\n    },\n    {\n      \"matches\": [\n        \"https://adventurers-tome.web.app/*\",\n        \"https://dnd-character-sheets-b30c7.web.app/*\",\n        \"https://dnd-character-sheets-b30c7.firebaseapp.com/*\"\n      ],\n      \"js\": [\n        \"sheet-bridge.js\"\n      ],\n      \"all_frames\": true,\n      \"run_at\": \"document_start\"\n    }\n  ],\n  \"browser_specific_settings\": {\n    \"gecko\": {\n      \"id\": \"dnd-sheet-roll20@sheet.local\",\n      \"strict_min_version\": \"142.0\",\n      \"data_collection_permissions\": {\n        \"required\": [\n          \"none\"\n        ]\n      }\n    }\n  }\n}\n", "roll20-main.js": "// Runs inside the Roll20 page itself (not the extension's sandbox) so it can see the map: the page the player is on,\n// its grid and scale, and where each token is. It only answers the extension's own question and changes nothing.\n(function () {\n  if (window.__tomeTokens) return; window.__tomeTokens = true;\n  const num = (v, d) => { const n = Number(v); return isFinite(n) && n > 0 ? n : d; };\n  function read() {\n    const C = window.Campaign; if (!C) return { error: 'Roll20 hasn\u2019t finished loading.' };\n    let pg = null;\n    try { pg = typeof C.activePage === 'function' ? C.activePage() : null; } catch (e) {}\n    if (!pg && C.pages) { try { pg = C.pages.get(C.get('playerpageid')); } catch (e) {} }\n    if (!pg) return { error: 'No map page is open in Roll20.' };\n    const grid = 70 * num(pg.get('snapping_increment'), 1);\n    const list = (pg.thegraphics && pg.thegraphics.models) || [];\n    const tokens = [];\n    list.forEach((g) => {\n      try {\n        if (g.get('layer') !== 'objects') return;\n        let cname = ''; const rep = g.get('represents');\n        if (rep && C.characters) { const ch = C.characters.get(rep); if (ch) cname = ch.get('name') || ''; }\n        const name = g.get('name') || '';\n        if (!name && !cname) return;\n        tokens.push({ name, cname, x: Number(g.get('left')) || 0, y: Number(g.get('top')) || 0, w: num(g.get('width'), 70), h: num(g.get('height'), 70) });\n      } catch (e) {}\n    });\n    return { page: pg.get('name') || '', grid, scale: num(pg.get('scale_number'), 5), units: pg.get('scale_units') || 'ft', diag: pg.get('diagonaltype') || 'foure', tokens };\n  }\n  window.addEventListener('message', (e) => {\n    const d = e.data; if (e.source !== window || !d || d.__tomeTok !== 'ask') return;\n    let res; try { res = read(); } catch (err) { res = { error: 'Couldn\u2019t read the map: ' + (err && err.message || err) }; }\n    window.postMessage({ __tomeTok: 'ans', id: d.id, res }, '*');\n  });\n})();\n", "roll20.js": "// Runs inside your Roll20 game. Types the roll into chat, waits for Roll20's result and reads the dice back.\n(function () {\n  const $ = (s, r) => (r || document).querySelector(s);\n  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));\n  const campaign = () => (document.title || '').replace(/\\s*\\|\\s*Roll20.*$/i, '').trim() || 'Roll20 game';\n  const speakingAs = () => { const s = $('#speakingas'); return s && s.selectedOptions[0] ? s.selectedOptions[0].textContent.trim() : ''; };\n  const chatBox = () => $('#textchat-input textarea') || $('textarea[title*=\"chat\" i]') || $('#textchat textarea');\n  const sendBtn = () => $('#textchat-input button') || $('#textchat-input .btn');\n  const log = () => $('#textchat .content') || $('#textchat') || document.body;\n  const messages = () => $$('.message', log());\n  // Speak as the character when Roll20 has one with that name.\n  function speakAs(who) {\n    const s = $('#speakingas'); if (!s || !who) return;\n    const o = Array.from(s.options).find((x) => x.textContent.trim().toLowerCase() === String(who).trim().toLowerCase());\n    if (o && s.value !== o.value) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); }\n  }\n  // \"Rolling 2d20kh1+7 = (<span class=basicdiceroll>14<\/span>+<span class='basicdiceroll dropped'>3<\/span>)+7\" \u2192 [[14, 3]]\n  function parseDice(tip) {\n    const groups = []; const re = /\\(([^()]*)\\)/g; let m;\n    while ((m = re.exec(tip))) { const nums = (m[1].replace(/<[^>]*>/g, ' ').match(/\\d+/g) || []).map(Number); if (nums.length) groups.push(nums); }\n    return groups;\n  }\n  function readResult(msgEl) {\n    const r = msgEl.querySelector('.inlinerollresult'); if (!r) return null;\n    const total = parseInt((r.textContent || '').replace(/[^\\d-]/g, ''), 10);\n    const tip = r.getAttribute('original-title') || r.getAttribute('data-original-title') || r.getAttribute('title') || '';\n    const dice = parseDice(tip.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '\"'));\n    return isNaN(total) ? null : { total, dice: dice.length ? dice : undefined };\n  }\n  let chain = Promise.resolve();\n  const wait = (ms) => new Promise((r) => setTimeout(r, ms));\n  function post(text) {\n    const box = chatBox(); if (!box) return false;\n    box.value = text; box.dispatchEvent(new Event('input', { bubbles: true }));\n    const btn = sendBtn();\n    if (btn) btn.click(); else box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));\n    return true;\n  }\n  // Lines come from the sheet in the same style as its macros: an /em heading, a \"****\" spacer, then \"**Label:** [[dice]]\".\n  // Only dice notation is allowed inside [[ ]]; everything else is plain chat text: no other / commands (whispers etc.),\n  // no ! API commands or # macros, and no templates, ability calls or chat buttons \u2014 whatever page asked for it.\n  const cleanDice = (x) => { const tr = /&\\{tracker\\}/.test(x); const d = x.replace(/&\\{tracker\\}/g, '').replace(/[^\\ddkhl+\\-\\s{},]/gi, '').trim(); return '[[' + d + (tr ? ' &{tracker}' : '') + ']]'; };\n  const cleanText = (t) => t.replace(/&\\{/g, '& {').replace(/%\\{/g, '% {').replace(/@\\{/g, '@ {').replace(/\\]\\(/g, '] (');\n  const cleanLine = (t) => { let s = String(t).replace(/[\\r\\n]+/g, ' ').slice(0, 500);\n    if (/^\\s*\\//.test(s) && !/^\\/em\\s/.test(s)) s = s.replace(/^\\s*\\/+/, '');\n    s = s.replace(/^\\s*[!#]+/, '');\n    return s.split(/(\\[\\[[^\\]]*\\]\\])/).map((part) => /^\\[\\[/.test(part) ? cleanDice(part.slice(2, -2)) : cleanText(part)).join(''); };\n  const cleanLines = (ls) => (Array.isArray(ls) ? ls : []).slice(0, 8).map(cleanLine);\n  function roll(req) {\n    const job = chain.then(() => new Promise(async (resolve) => {\n      if (!chatBox()) return resolve({ error: \"Couldn't find Roll20's chat box. Is the chat panel open?\" });\n      speakAs(req.who);\n      const me = speakingAs().toLowerCase(), before = messages().length;\n      let lines = Array.isArray(req.lines) && req.lines.length ? cleanLines(req.lines) : null;\n      let key;\n      if (lines) {\n        const last = lines[lines.length - 1];\n        key = last.replace(/\\[\\[.*$/, '').replace(/\\*/g, '').replace(/:\\s*$/, '').trim();\n        for (let k = 0; k < lines.length; k++) { post(lines[k]); if (k < lines.length - 1) await wait(160); }\n      } else {\n        const name = String(req.label || 'Roll').replace(/[{}\\[\\]]/g, '');\n        const expr = String(req.expr || '').replace(/[^\\dd+\\-khl ]/gi, '');\n        key = name.slice(0, 40);\n        post(`&{template:default} {{name=${name}}} {{Roll=[[${expr}]]}}`);\n      }\n      const started = Date.now();\n      const tick = setInterval(() => {\n        const list = messages();\n        for (let i = list.length - 1; i >= Math.max(0, before - 1) && i >= 0; i--) {\n          const el = list[i]; if (el.__dnd20seen) continue;\n          if (i >= before && (/\\berror\\b/.test(el.className) || /SyntaxError|error with your formula|could not parse/i.test(el.textContent)) && !el.__dnd20err) { el.__dnd20err = true; clearInterval(tick); return resolve({ error: 'Roll20 rejected the roll: ' + el.textContent.trim().slice(0, 140) }); }\n          if (key && !el.textContent.includes(key)) continue;\n          // only our own message counts: another player could post a line with the same label\n          const by = el.querySelector('.by'); if (by && me && by.textContent.replace(/:\\s*$/, '').trim().toLowerCase() !== me) continue;\n          const r = readResult(el); if (!r) continue;\n          el.__dnd20seen = true; clearInterval(tick); return resolve(r);\n        }\n        if (Date.now() - started > 20000) { clearInterval(tick); resolve({ error: 'Roll20 posted nothing back within 20 seconds.' }); }\n      }, 150);\n    }));\n    chain = job.catch(() => {});\n    return job;\n  }\n  // Where the tokens are: Roll20's own map data lives in the page itself, so roll20-main.js (which runs there) reads it.\n  function tokens() {\n    return new Promise((resolve) => {\n      const id = 't' + Math.random().toString(36).slice(2);\n      const on = (e) => { const d = e.data; if (e.source !== window || !d || d.__tomeTok !== 'ans' || d.id !== id) return; removeEventListener('message', on); clearTimeout(t); resolve(d.res || { error: 'no answer' }); };\n      const t = setTimeout(() => { removeEventListener('message', on); resolve({ error: 'Reload the Roll20 tab once so the extension can read the map.' }); }, 3000);\n      addEventListener('message', on); window.postMessage({ __tomeTok: 'ask', id }, '*');\n    });\n  }\n  chrome.runtime.onMessage.addListener((msg, sender, send) => {\n    if (msg.type === 'tokens') { tokens().then(send); return true; }\n    if (msg.type === 'info') { send({ campaign: campaign(), player: speakingAs() }); return; }\n    if (msg.type === 'roll') { roll(msg).then(send); return true; }\n    if (msg.type === 'post') { chain = chain.then(async () => { speakAs(msg.who); const ls = cleanLines(msg.lines); for (let k = 0; k < ls.length; k++) { post(ls[k]); await wait(160); } }).then(() => send({ ok: true }), (e) => send({ error: String(e) })); return true; }\n  });\n})();\n", "sheet-bridge.js": "// Runs only on the Adventurer\u2019s Tome site (see manifest.json) and stays silent unless the character sheet says hello.\n// It only relays the sheet's own messages ({__dnd20: ...}) to the extension and the answers back.\n(function () {\n  if (window.__dnd20bridge) return; window.__dnd20bridge = true;\n  const VERSION = chrome.runtime.getManifest().version;\n  // Two copies installed (the Chrome Web Store one and one loaded by hand) would post every roll twice: the copies agree\n  // through the page itself which one answers \u2014 the store copy if there is one, otherwise whichever arrived first.\n  const ME = chrome.runtime.id + '|' + (chrome.runtime.getManifest().update_url ? 'store' : 'local'), de = document.documentElement;\n  const cur = de.getAttribute('data-dnd20');\n  if (!cur || (cur.endsWith('|local') && ME.endsWith('|store'))) de.setAttribute('data-dnd20', ME);\n  const mine = () => de.getAttribute('data-dnd20') === ME;\n  const CAPS = ['tokens']; // what this copy can do beyond rolling: read where tokens are on the map\n  const reply = (msg) => window.postMessage(Object.assign({ dir: 'toSheet' }, msg), '*');\n  window.addEventListener('message', (e) => {\n    const d = e.data;\n    if (!d || typeof d !== 'object' || !d.__dnd20 || d.dir !== 'toExt' || e.source !== window || !mine()) return;\n    if (d.__dnd20 === 'hello') { reply({ __dnd20: 'hi', version: VERSION, caps: CAPS }); return; }\n    const req = { type: d.__dnd20, expr: d.expr, label: d.label, lines: Array.isArray(d.lines) ? d.lines.slice(0, 6).map(String) : undefined, who: d.who, campaign: d.campaign };\n    try {\n      chrome.runtime.sendMessage(req, (res) => {\n        const err = chrome.runtime.lastError;\n        reply(Object.assign({ __dnd20: d.__dnd20, id: d.id }, err ? { error: err.message } : (res || { error: 'no answer' })));\n      });\n    } catch (err) { reply({ __dnd20: d.__dnd20, id: d.id, error: 'The extension was reloaded \u2014 refresh this page.' }); }\n  });\n  if (mine()) reply({ __dnd20: 'hi', version: VERSION, caps: CAPS });\n})();\n"};
}

DND.full = DND.full || {}; DND.fullSRD = DND.fullSRD || [];