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
