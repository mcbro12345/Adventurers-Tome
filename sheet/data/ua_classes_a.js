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
