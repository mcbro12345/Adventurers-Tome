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
