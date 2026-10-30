// Feature automation: Cleric and Druid (PHB, XGE, TCE, SCAG) — see tools/FX_SPEC.md.
// Full keys only ('<class>:<Feature>' / '<class>:<sub>:<Feature>'); later files win over data/featfx.js.
// resource: true on act-only features keeps their buttons listed out of combat too (they have no Use of their own).
// col 'move' = the "Movement & Free" combat column: for things that take no action (Divine Strike, Guided Strike…),
// so using them never marks your action as spent.
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const CD = { from: 'Channel Divinity', n: 1 };
  const WS = { from: 'Wild Shape', n: 1 };
  const DSD = '{tier(cleric,8,1,14,2)}d8';
  // Divine Strike: once on each of your turns when you hit with a weapon attack, +1d8 (2d8 at 14th). No action.
  const DS = type => ({ col: 'move', roll: DSD, rollNote: type + ' damage (once per turn, on a weapon hit)', text: 'Add to one weapon hit this turn (' + type + ').' });
  const POTENT = { none: true, text: 'Built in: your WIS modifier is added to the damage of your cleric cantrips.' };
  const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
  const HALO = '{tier(druid,2,4,6,6,10,8,14,10)}';
  const STARD = '{tier(druid,2,1,10,2)}d8';
  const ARCHER = 'Bonus action each turn: ranged spell attack (60 ft) for ' + '1d8 + WIS radiant (2d8 from 10th)';
  const CHALICE = 'When you heal with a spell slot, you or another creature within 30 ft regains 1d8 + WIS (2d8 from 10th)';
  const DRAGON = 'INT and WIS checks and CON saves to keep concentration: treat a d20 of 9 or lower as 10 (fly 20 ft, hover, from 10th)';
  const star = (nm, note) => ({ name: 'Starry Form: ' + nm, rounds: 100, buff: { note } });

  Object.assign(DND.featFx, {
    // ======================= CLERIC =======================
    'cleric:Spellcasting': { none: true },
    'cleric:Channel Divinity': { resource: true },
    'cleric:Turn Undead': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      text: 'Each undead within 30 ft that can see or hear you: on a failed save it is turned for 1 minute or until it takes damage. Destroy Undead (5th+): turned undead of CR 1/2 (5th), 1 (8th), 2 (11th), 3 (14th) or 4 (17th) or lower are destroyed instead.' },
    // The CR limit at your level is shown from the class scaling table ("Destroy Undead: CR …") on this card.
    'cleric:Destroy Undead': { none: true, text: 'When an undead fails its save against your Turn Undead, it is destroyed if its CR is at or below your limit: CR 1/2 at 5th, 1 at 8th, 2 at 11th, 3 at 14th, 4 at 17th.' },
    // (rollNote isn't run through {…} formulas, so the success number lives in text)
    'cleric:Divine Intervention': { col: 'action', roll: '1d100', rollNote: 'succeeds on your cleric level or lower',
      text: 'Succeeds on a d100 roll of {cleric>=20?100:cleric} or lower (automatic at 20th). On a success you can\'t use it again for 7 days (keep the use spent); on a failure you can try again after a long rest.' },
    'cleric:Divine Intervention Improvement': { none: true, text: 'Divine Intervention succeeds automatically (its success number becomes 100).' },

    // ---- Knowledge Domain ----
    'cleric:knowledge:Blessings of Knowledge': { none: true }, // languages + expertise come from the subclass choices
    'cleric:knowledge:Channel Divinity: Knowledge of the Ages': { col: 'action', cost: CD,
      use: { effect: { name: 'Knowledge of the Ages', rounds: 100, buff: { note: 'Proficient with one chosen skill or tool for 10 minutes' } } } },
    'cleric:knowledge:Channel Divinity: Read Thoughts': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      use: { effect: { name: 'Read Thoughts', rounds: 10, buff: { note: 'Read the target\'s surface thoughts while it is within 60 ft; action: end it to cast suggestion on it without a slot (it fails the save)' } } },
      text: 'One creature you can see within 60 ft. On a success you can\'t use this on it again until a long rest (end the Read Thoughts effect).',
      // dc 'none': no DC line on this act (the target fails automatically)
      acts: [{ name: 'Cast suggestion', col: 'action', dc: 'none', onlyWhen: { effect: 'Read Thoughts' }, use: { endEffect: 'Read Thoughts' },
        text: 'Suggestion on the read creature without a spell slot; it automatically fails its saving throw (concentration, up to 8 hours).' }] },
    'cleric:knowledge:Potent Spellcasting': POTENT,
    'cleric:knowledge:Visions of the Past': { text: 'Meditate at least 1 minute, then concentrate (as for a spell) for up to as many minutes as your WIS score: Object Reading (the object\'s owners within that many days) or Area Reading (one significant event per minute, going back that many days).' },

    // ---- Life Domain ----
    'cleric:life:Bonus Proficiency': { none: true }, // heavy armor from subclass proficiencies
    'cleric:life:Disciple of Life': { none: true, text: 'Built in: your 1st-level-and-higher healing spells add 2 + the slot level to the healing they roll.' },
    'cleric:life:Channel Divinity: Preserve Life': { col: 'action', cost: CD,
      text: 'Divide {5*cleric} HP among any creatures within 30 ft; none above half its HP maximum. No effect on undead or constructs.' },
    // Free (no action): tap the slot level after casting a healing spell on someone else.
    'cleric:life:Blessed Healer': { resource: true,
      text: 'When a 1st+ level spell you cast heals another creature, you regain 2 + the spell\'s level HP.',
      acts: ORD.map((o, k) => ({ name: 'Healed an ally: ' + o, col: 'move', use: { heal: String(3 + k) }, min: Math.max(6, 2 * (k + 1) - 1), text: 'Blessed Healer: you regain ' + (3 + k) + ' HP' })) },
    'cleric:life:Divine Strike': DS('radiant'),
    'cleric:life:Supreme Healing': { none: true, text: 'Healing spells: use the highest number on each die instead of rolling (apply it to the cast result).' },

    // ---- Light Domain ----
    'cleric:light:Bonus Cantrip': { spells: ['Light'] },
    'cleric:light:Warding Flare': { col: 'reaction', text: 'An attacker within 30 ft that you can see has disadvantage on its attack roll against you (not if it can\'t be blinded).' },
    'cleric:light:Improved Flare': { resource: true, acts: [{ name: 'Warding Flare (ally)', col: 'reaction', cost: { from: 'Warding Flare', n: 1 }, text: 'Impose disadvantage on an attack a creature within 30 ft makes against someone other than you' }] },
    'cleric:light:Channel Divinity: Radiance of the Dawn': { col: 'action', cost: CD, dc: 'spell', save: 'CON', roll: '2d10+cleric', rollNote: 'radiant (half on a save)',
      text: 'Dispels magical darkness within 30 ft; each hostile creature within 30 ft takes the radiant damage (CON half; no effect behind total cover).' },
    'cleric:light:Potent Spellcasting': POTENT,
    'cleric:light:Corona of Light': { col: 'action',
      use: { effect: { name: 'Corona of Light', rounds: 10, buff: { note: 'Bright light 60 ft, dim 30 ft beyond; enemies in the bright light have disadvantage on saves against spells dealing fire or radiant damage' } } },
      text: 'Lasts 1 minute or until you dismiss it with another action.' },

    // ---- Nature Domain ----
    'cleric:nature:Acolyte of Nature': { none: true }, // cantrip + skill come from the subclass choices
    'cleric:nature:Bonus Proficiency': { none: true },
    'cleric:nature:Channel Divinity: Charm Animals and Plants': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      use: { effect: { name: 'Charm Animals and Plants', rounds: 10, buff: { note: 'Charmed beasts and plants are friendly to you and the creatures you designate (each ends on damage)' } } },
      text: 'Each beast or plant creature within 30 ft that can see you: charmed for 1 minute or until it takes damage on a failed save.' },
    'cleric:nature:Dampen Elements': { col: 'reaction', text: 'You or a creature within 30 ft gains resistance to that instance of acid, cold, fire, lightning or thunder damage.' },
    'cleric:nature:Divine Strike': DS('cold, fire or lightning'),
    'cleric:nature:Master of Nature': { col: 'bonus', onlyWhen: { effect: 'Charm Animals and Plants' }, text: 'Command what each creature charmed by Charm Animals and Plants does on its next turn.' },

    // ---- Tempest Domain ----
    'cleric:tempest:Bonus Proficiencies': { none: true },
    'cleric:tempest:Wrath of the Storm': { col: 'reaction', dc: 'spell', save: 'DEX', roll: '2d8', rollNote: 'lightning or thunder (DEX half)',
      text: 'The creature within 5 ft that hit you takes the damage (your choice of lightning or thunder), half on a successful DEX save.' },
    // No action: used when you roll lightning or thunder damage.
    'cleric:tempest:Channel Divinity: Destructive Wrath': { col: 'move', cost: CD, text: 'Deal maximum damage on one lightning or thunder damage roll instead of rolling.' },
    'cleric:tempest:Thunderbolt Strike': { none: true, text: 'When you deal lightning damage to a Large or smaller creature, you can push it up to 10 ft away.' },
    'cleric:tempest:Divine Strike': DS('thunder'),
    'cleric:tempest:Stormborn': { passive: { fly: 'walk', advNote: 'Stormborn flying speed only when not underground or indoors' } },

    // ---- Trickery Domain ----
    'cleric:trickery:Blessing of the Trickster': { col: 'action', text: 'A willing creature you touch (not you) has advantage on Stealth checks for 1 hour or until you use this again.' },
    // (lasts while you concentrate: drop the effect if your concentration breaks)
    'cleric:trickery:Channel Divinity: Invoke Duplicity': { col: 'action', cost: CD,
      use: { effect: { name: 'Invoke Duplicity', rounds: 10, buff: { note: 'Concentration. Illusory duplicate(s) within 120 ft: cast spells from its space; advantage on attacks against a creature when you and it are both within 5 ft of it' } } },
      text: 'An illusion of you appears within 30 ft; lasts 1 minute (concentration). Improved Duplicity (17th): up to four duplicates.',
      acts: [{ name: 'Move duplicate', col: 'bonus', onlyWhen: { effect: 'Invoke Duplicity' }, text: 'Move the illusion up to 30 ft (it must stay within 120 ft of you); from 17th, any number of them' }] },
    'cleric:trickery:Channel Divinity: Cloak of Shadows': { col: 'action', cost: CD, use: { cond: 'Invisible', condRounds: 1 }, text: 'Invisible until the end of your next turn; ends early if you attack or cast a spell.' },
    'cleric:trickery:Divine Strike': DS('poison'),
    'cleric:trickery:Improved Duplicity': { none: true, text: 'Invoke Duplicity creates up to four duplicates; one bonus action moves any number of them.' },

    // ---- War Domain ----
    'cleric:war:Bonus Proficiencies': { none: true },
    'cleric:war:War Priest': { col: 'bonus', text: 'After taking the Attack action: one weapon attack as a bonus action.' },
    // No action required: decide after seeing the d20.
    'cleric:war:Channel Divinity: Guided Strike': { col: 'move', cost: CD, text: '+10 to one of your attack rolls (decide after seeing the d20, before the result is known).' },
    'cleric:war:Channel Divinity: War God\'s Blessing': { col: 'reaction', cost: CD, text: '+10 to an attack roll made by a creature within 30 ft (decide after seeing the d20).' },
    'cleric:war:Divine Strike': DS('the weapon\'s damage type'),
    'cleric:war:Avatar of Battle': { passive: { resist: ['nonmagical bludgeoning, piercing and slashing'] } },

    // ---- Forge Domain ----
    'cleric:forge:Bonus Proficiencies': { none: true },
    'cleric:forge:Blessing of the Forge': { target: 'forge', trigger: 'longRest', triggerLabel: 'Bless an item', triggerText: 'Blessing of the Forge: at the end of this long rest, make one nonmagical armor or weapon +1.' },
    'cleric:forge:Channel Divinity: Artisan\'s Blessing': { cost: CD, text: 'One-hour ritual: create a nonmagical item (at least partly metal) worth up to 100 gp, consuming metal of equal value.' },
    'cleric:forge:Soul of the Forge': { passive: { resist: ['fire'], acHeavy: 1 } },
    'cleric:forge:Divine Strike': DS('fire'),
    'cleric:forge:Saint of Forge and Fire': { passive: { immune: ['fire'], advNote: 'In heavy armor: resistance to nonmagical bludgeoning, piercing and slashing (Saint of Forge and Fire)' } },

    // ---- Grave Domain ----
    'cleric:grave:Circle of Mortality': { spells: ['Spare the Dying'], spellNote: 'Bonus action, range 30 ft. Healing spell dice on a creature at 0 HP use their maximum' },
    'cleric:grave:Eyes of the Grave': { col: 'action', use: { effect: { name: 'Eyes of the Grave', rounds: 1, buff: { note: 'Know the location of undead within 60 ft (not behind total cover or warded from divination)' } } } },
    'cleric:grave:Channel Divinity: Path to the Grave': { col: 'action', cost: CD, text: 'Curse a creature within 30 ft until the end of your next turn: the next attack that hits it deals vulnerable (double) damage, then the curse ends.' },
    'cleric:grave:Sentinel at Death\'s Door': { col: 'reaction', text: 'A critical hit against you or a creature within 30 ft becomes a normal hit.' },
    'cleric:grave:Potent Spellcasting': POTENT,
    'cleric:grave:Keeper of Souls': { none: true, text: 'When an enemy you can see dies within 60 ft, you or a creature within 60 ft regains HP equal to its number of Hit Dice (once per turn, not while incapacitated).' },

    // ---- Order Domain ----
    'cleric:order:Bonus Proficiencies': { none: true },
    'cleric:order:Voice of Authority': { none: true, text: 'Cast a 1st+ level slot spell on an ally: that ally can use its reaction to make one weapon attack against a creature you choose.' },
    'cleric:order:Channel Divinity: Order\'s Demand': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      text: 'Creatures of your choice within 30 ft that can see or hear you: charmed until the end of your next turn or until damaged; you can make any of them drop one held item.' },
    'cleric:order:Embodiment of the Law': { col: 'bonus', text: 'Cast a 1st+ level enchantment spell with a casting time of 1 action as a bonus action.' },
    'cleric:order:Divine Strike': DS('psychic'),
    'cleric:order:Order\'s Wrath': { col: 'move', roll: '2d8', rollNote: 'psychic, the next ally hit on the cursed creature',
      text: 'After your Divine Strike hits, curse the target until the start of your next turn; the next ally hit on it deals +2d8 psychic and ends the curse.' },

    // ---- Peace Domain ----
    'cleric:peace:Implement of Peace': { none: true }, // skill from the subclass choice
    'cleric:peace:Emboldening Bond': { col: 'action',
      use: { effect: { name: 'Emboldening Bond', rounds: 100, buff: { note: 'Once per turn add 1d4 to an attack, check or save while within 30 ft (60 ft from 17th) of another bonded creature' } } },
      text: 'Bond up to {prof} willing creatures within 30 ft (you can include yourself) for 10 minutes.',
      acts: [{ name: 'Add 1d4', col: 'move', roll: '1d4', rollNote: 'add to the attack, check or save', onlyWhen: { effect: 'Emboldening Bond' } }] },
    'cleric:peace:Channel Divinity: Balm of Peace': { col: 'action', cost: CD, dash: true, roll: '2d6+wis', rollNote: 'healing to each other creature you pass within 5 ft (min 1)',
      text: 'Move up to your speed without provoking opportunity attacks; each other creature you come within 5 ft of regains 2d6 + WIS HP (once each).' },
    'cleric:peace:Protective Bond': { col: 'reaction', onlyWhen: { effect: 'Emboldening Bond' },
      text: 'A bonded creature is about to take damage: another bonded creature within {cleric>=17?60:30} ft teleports next to it and takes all the damage instead (from 17th: with resistance to it).' },
    'cleric:peace:Potent Spellcasting': POTENT,
    'cleric:peace:Expansive Bond': { none: true, text: 'Emboldening Bond and Protective Bond work within 60 ft; a creature using Protective Bond has resistance to that damage.' },

    // ---- Twilight Domain ----
    'cleric:twilight:Bonus Proficiencies': { none: true },
    'cleric:twilight:Eyes of Night': { col: 'action', passive: { sense: 'Darkvision 300 ft (Eyes of Night)' },
      text: 'Share this darkvision with up to {max(1,wis)} willing creatures within 10 ft for 1 hour (again by spending any spell slot).' },
    // On yourself: advantage on your next initiative roll (drop the effect once you've rolled).
    'cleric:twilight:Vigilant Blessing': { col: 'action', text: 'One creature you touch (you can choose yourself) has advantage on its next initiative roll; ends after that roll or when you use this again.',
      passive: { effect: 'Vigilant Blessing', initAdv: true },
      acts: [{ name: 'Bless myself', col: 'action', use: { effect: { name: 'Vigilant Blessing', rounds: null, buff: { note: 'Advantage on your next initiative roll — remove this after you roll' } } } }] },
    'cleric:twilight:Channel Divinity: Twilight Sanctuary': { col: 'action', cost: CD,
      use: { effect: { name: 'Twilight Sanctuary', rounds: 10, buff: { note: '30-ft sphere of dim light centered on you. A creature (you included) ending its turn inside: 1d6 + cleric level temp HP, or end one charm or fright effect' } } },
      text: 'Lasts 1 minute or until you are incapacitated or die.',
      acts: [
        { name: 'Temp HP (me)', col: 'move', use: { temp: '1d6+cleric' }, onlyWhen: { effect: 'Twilight Sanctuary' } },
        { name: 'Temp HP (ally)', col: 'move', roll: '1d6+cleric', rollNote: 'temp HP for a creature ending its turn in the sphere', onlyWhen: { effect: 'Twilight Sanctuary' } },
        { name: 'End charm/fear (me)', col: 'move', use: { removeCond: ['Charmed', 'Frightened'] }, onlyWhen: { effect: 'Twilight Sanctuary' } }
      ] },
    'cleric:twilight:Steps of Night': { col: 'bonus', use: { effect: { name: 'Steps of Night', rounds: 10, buff: { fly: 'walk', note: 'Flying speed equal to your walking speed' } } }, text: 'Only while you are in dim light or darkness.' },
    'cleric:twilight:Divine Strike': DS('radiant'),
    'cleric:twilight:Twilight Shroud': { passive: { effect: 'Twilight Sanctuary', ac: 2, advNote: 'Half cover inside Twilight Sanctuary (+2 AC and DEX saves) for you and allies' } },

    // ---- Arcana Domain ----
    'cleric:arcana:Arcane Initiate': { passive: { skillProf: ['Arcana'] } }, // the two wizard cantrips come from the subclass choice
    'cleric:arcana:Channel Divinity: Arcane Abjuration': { col: 'action', cost: CD, dc: 'spell', save: 'WIS',
      text: 'One celestial, elemental, fey or fiend within 30 ft that can hear you: turned for 1 minute or until damaged. From 5th, if its CR is at or below 1/2 (5th), 1 (8th), 2 (11th), 3 (14th) or 4 (17th), it is banished for 1 minute instead (no concentration).' },
    'cleric:arcana:Spell Breaker': { none: true, text: 'When a 1st+ level spell of yours heals an ally, also end one spell on it of a level no higher than the slot used.' },
    'cleric:arcana:Potent Spellcasting': POTENT,
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
    'druid:moon:Combat Wild Shape': { resource: true,
      text: 'Wild Shape as a bonus action (built into the Wild Shape picker). While transformed, bonus action: expend a spell slot to regain 1d8 HP per slot level (mark the slot on the Spells tab).',
      acts: ORD.map((o, k) => ({ name: 'Heal (' + o + ' slot)', col: 'bonus', roll: (k + 1) + 'd8', rollNote: 'HP regained — expend a ' + o + '-level slot', healRoll: true, onlyWhen: { effect: 'Wild Shape' }, min: Math.max(2, 2 * (k + 1) - 1) })) },
    'druid:moon:Circle Forms': { note: 'Built in: Wild Shape beasts up to CR 1, or CR = druid level ÷ 3 from 6th.' },
    'druid:moon:Primal Strike': { none: true, text: 'Your beast-form attacks count as magical for overcoming resistance and immunity.' },
    'druid:moon:Elemental Wild Shape': { note: 'Built in: the Wild Shape picker offers Air, Earth, Fire and Water Elementals for 2 uses.' },
    'druid:moon:Thousand Forms': { spells: ['Alter Self'], spellNote: 'At will, without a spell slot' },

    // ---- Circle of Dreams ----
    'druid:dreams:Balm of the Summer Court': {
      text: 'Bonus action: spend up to {max(1,floor(druid/2))} dice; an ally within 120 ft regains that many d6 HP and gains 1 temp HP per die.',
      acts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ name: n + 'd6', col: 'bonus', cost: { from: 'Balm of the Summer Court', n }, roll: n + 'd6', rollNote: 'healing; the target also gains ' + n + ' temp HP', healRoll: true, min: Math.max(2, 2 * n) })) },
    'druid:dreams:Hearth of Moonlight and Shadow': { passive: { advNote: 'During a short or long rest: you and allies in your 30-ft sphere get +5 to Stealth and Perception checks; firelight inside isn\'t visible outside' } },
    'druid:dreams:Hidden Paths': { col: 'bonus', text: 'Teleport up to 60 ft to an unoccupied space you can see.',
      acts: [{ name: 'Teleport ally 30 ft', col: 'action', cost: true, text: 'Teleport a willing creature you touch up to 30 ft to an unoccupied space you can see' }] },
    'druid:dreams:Walker in Dreams': { trigger: 'shortRest', triggerLabel: 'Use it',
      text: 'Cast dream (you as messenger), scrying, or teleportation circle (to the last place you took a long rest) without a slot or material components.',
      triggerText: 'Walker in Dreams: after this short rest, cast dream, scrying or teleportation circle without a slot or material components.' },

    // ---- Circle of the Shepherd ----
    // A natural ability, not the spell: beasts understand you and you them.
    'druid:shepherd:Speech of the Woods': { none: true, text: 'You speak, read and write Sylvan; beasts understand your speech and you can decipher their noises and body language.' },
    // The feature's own use is spent by choosing a spirit (bonus action).
    'druid:shepherd:Spirit Totem': { resource: true,
      text: 'Summon a spirit within 60 ft: a 30-ft aura for 1 minute or until you are incapacitated (bonus action to move it 60 ft).',
      acts: [
        { name: 'Bear spirit', col: 'bonus', cost: true, use: { temp: '5+druid', effect: { name: 'Spirit Totem: Bear', rounds: 10, buff: { note: 'Bear aura: creatures of your choice in it got 5 + druid level temp HP; you and allies in it have advantage on STR checks and saves' } } }, text: 'You and allies in the aura gain {5+druid} temp HP' },
        { name: 'Hawk spirit', col: 'bonus', cost: true, use: { effect: { name: 'Spirit Totem: Hawk', rounds: 10, buff: { note: 'Hawk aura: you and allies in it have advantage on Perception checks; reaction to grant advantage on an attack against a creature in it' } } } },
        { name: 'Unicorn spirit', col: 'bonus', cost: true, use: { effect: { name: 'Spirit Totem: Unicorn', rounds: 10, buff: { note: 'Unicorn aura: advantage on checks to detect creatures in it; slot healing spells also heal creatures of your choice in it for your druid level' } } } },
        { name: 'Move spirit', col: 'bonus', onlyWhen: { effect: 'Spirit Totem' }, text: 'Move the spirit up to 60 ft to a point you can see' },
        { name: 'Hawk: grant advantage', col: 'reaction', onlyWhen: { effect: 'Spirit Totem: Hawk' }, text: 'Advantage on one attack roll against a target in the aura' },
        { name: 'Unicorn: heal aura', col: 'move', onlyWhen: { effect: 'Spirit Totem: Unicorn' }, use: { heal: 'druid' }, text: 'When you heal with a spell slot: each creature of your choice in the aura (you included) regains {druid} HP' }
      ],
      passive: [{ effect: 'Spirit Totem: Bear', checkAdv: ['str'], saveAdv: ['str'] }, { effect: 'Spirit Totem: Hawk', skillAdv: ['Perception'] }] },
    'druid:shepherd:Mighty Summoner': { none: true, text: 'Beasts and fey you summon with spells gain 2 extra HP per Hit Die and their natural weapons count as magical.' },
    'druid:shepherd:Guardian Spirit': { resource: true, acts: [{ name: 'Guardian Spirit heal', col: 'move', onlyWhen: { effect: 'Spirit Totem' }, roll: '{floor(druid/2)}', rollNote: 'HP for a summoned beast or fey ending its turn in the aura' }],
      text: 'Your summoned beasts and fey that end their turn in your Spirit Totem aura regain {floor(druid/2)} HP.' },
    'druid:shepherd:Faithful Summons': { trigger: 'zero', triggerLabel: 'Summon guardians',
      text: 'Four beasts of CR 2 or lower appear within 20 ft to protect you (as conjure animals at 9th level, 1 hour, no concentration). Add them on the Creatures tab.',
      triggerText: 'Faithful Summons: you are at 0 HP — four CR 2 or lower beasts appear to protect you for 1 hour.' },

    // ---- Circle of Spores ----
    'druid:spores:Halo of Spores': { col: 'reaction', dc: 'spell', save: 'CON', roll: '1d' + HALO, rollNote: 'necrotic (CON negates)',
      text: 'A creature you can see moves into a space within 10 ft of you or starts its turn there. Not while your Spreading Spores cube exists.',
      acts: [{ name: 'Halo (Symbiotic)', col: 'reaction', roll: '2d' + HALO, rollNote: 'necrotic, die rolled twice (CON negates)', dc: 'spell', save: 'CON', onlyWhen: { effect: 'Symbiotic Entity' } }] },
    'druid:spores:Symbiotic Entity': { col: 'action', cost: WS,
      use: { effect: { name: 'Symbiotic Entity', rounds: 100, buff: { dmgDice: '1d6 necrotic', note: 'Melee weapon hits +1d6 necrotic; Halo of Spores die rolled twice. Ends after 10 minutes, when these temp HP are gone, or if you Wild Shape' } }, temp: '{4*druid}' } },
    'druid:spores:Fungal Infestation': { col: 'reaction', text: 'A Small or Medium beast or humanoid dies within 10 ft: it rises as a zombie with 1 HP for 1 hour, acting right after you (Attack action only, one melee attack).' },
    // The cube deals your Halo of Spores damage, which Symbiotic Entity (required for this) rolls twice.
    'druid:spores:Spreading Spores': { col: 'bonus', onlyWhen: { effect: 'Symbiotic Entity' }, dc: 'spell', save: 'CON',
      use: { effect: { name: 'Spreading Spores', rounds: 10, buff: { note: '10-ft cube within 30 ft deals your Halo of Spores damage to a creature entering it or starting its turn there; no Halo reaction while it lasts' } } },
      text: 'The cube lasts 1 minute, until you use this again or dismiss it (bonus action), or your Symbiotic Entity ends.',
      acts: [{ name: 'Spore cube damage', col: 'move', onlyWhen: { effect: 'Spreading Spores' }, roll: '2d' + HALO, rollNote: 'necrotic to a creature entering or starting its turn in the cube (CON negates, once per turn)', dc: 'spell', save: 'CON' }] },
    'druid:spores:Fungal Body': { passive: { condImmune: ['Blinded', 'Deafened', 'Frightened', 'Poisoned'], advNote: 'Critical hits against you count as normal hits unless you are incapacitated (Fungal Body)' } },

    // ---- Circle of Stars ----
    // Free guiding bolt casts: the Use button spends one of this feature's {prof} uses and rolls the damage.
    'druid:stars:Star Map': { spells: ['Guidance', 'Guiding Bolt'], spellNote: 'Guiding Bolt without a slot {prof}× per long rest: use the Star Map feature for those',
      col: 'action', roll: '4d6', rollNote: 'radiant on a hit (guiding bolt, 1st level, no slot)',
      text: 'Guiding bolt without a slot: ranged spell attack +{prof+wis}, 120 ft; on a hit the next attack roll against the target before the end of your next turn has advantage.' },
    'druid:stars:Starry Form': { resource: true, cost: null,
      text: 'Spend a Wild Shape use (bonus action): luminous form for 10 minutes (bright light 10 ft, dim 10 ft more). Ends early if you dismiss it, are incapacitated, die or use this again.',
      acts: [
        { name: 'Archer', col: 'bonus', cost: WS, roll: STARD + '+wis', rollNote: 'radiant on a hit (ranged spell attack, 60 ft)',
          use: { effect: star('Archer', ARCHER) }, text: 'Ranged spell attack +{prof+wis} as part of this bonus action' },
        { name: 'Archer shot', col: 'bonus', onlyWhen: { effect: 'Starry Form: Archer' }, roll: STARD + '+wis', rollNote: 'radiant on a hit', text: 'Ranged spell attack +{prof+wis}, 60 ft' },
        { name: 'Chalice', col: 'bonus', cost: WS, use: { effect: star('Chalice', CHALICE) } },
        { name: 'Chalice heal', col: 'move', onlyWhen: { effect: 'Starry Form: Chalice' }, roll: STARD + '+wis', rollNote: 'healing to you or a creature within 30 ft', healRoll: true, text: 'After you heal with a spell slot' },
        { name: 'Dragon', col: 'bonus', cost: WS, use: { effect: star('Dragon', DRAGON) } }
      ],
      passive: [{ effect: 'Starry Form: Dragon', minD20: { ab: 'int', value: 10 } }, { effect: 'Starry Form: Dragon', minD20: { ab: 'wis', value: 10 }, advNote: 'Concentration saves: treat a d20 of 9 or lower as 10 (Dragon form)' }] },
    'druid:stars:Cosmic Omen': { col: 'reaction', roll: '1d6', rollNote: 'add (Weal, even omen) or subtract (Woe, odd omen)',
      text: 'After each long rest roll any die: even = Weal (add the d6 to a creature\'s attack, save or check within 30 ft), odd = Woe (subtract it). Use it as the creature is about to roll.' },
    'druid:stars:Twinkling Constellations': { resource: true,
      text: 'Starry Form dice become 2d8; Dragon form grants a 20-ft fly speed (hover); at the start of each of your turns you can change constellation.',
      passive: { effect: 'Starry Form: Dragon', fly: 20 },
      acts: [
        { name: '→ Archer', col: 'move', onlyWhen: { effect: 'Starry Form: Chalice' }, use: { endEffect: 'Starry Form: Chalice', effect: star('Archer', ARCHER) } },
        { name: '→ Archer', col: 'move', onlyWhen: { effect: 'Starry Form: Dragon' }, use: { endEffect: 'Starry Form: Dragon', effect: star('Archer', ARCHER) } },
        { name: '→ Chalice', col: 'move', onlyWhen: { effect: 'Starry Form: Archer' }, use: { endEffect: 'Starry Form: Archer', effect: star('Chalice', CHALICE) } },
        { name: '→ Chalice', col: 'move', onlyWhen: { effect: 'Starry Form: Dragon' }, use: { endEffect: 'Starry Form: Dragon', effect: star('Chalice', CHALICE) } },
        { name: '→ Dragon', col: 'move', onlyWhen: { effect: 'Starry Form: Archer' }, use: { endEffect: 'Starry Form: Archer', effect: star('Dragon', DRAGON) } },
        { name: '→ Dragon', col: 'move', onlyWhen: { effect: 'Starry Form: Chalice' }, use: { endEffect: 'Starry Form: Chalice', effect: star('Dragon', DRAGON) } }
      ] },
    'druid:stars:Full of Stars': { passive: [
      { effect: 'Starry Form: Archer', resist: BPS }, { effect: 'Starry Form: Chalice', resist: BPS }, { effect: 'Starry Form: Dragon', resist: BPS }] },

    // ---- Circle of Wildfire ----
    'druid:wildfire:Summon Wildfire Spirit': { col: 'action', cost: WS, dc: 'spell', save: 'DEX', roll: '2d6', rollNote: 'fire to each creature within 10 ft of where it appears (DEX save negates)',
      text: 'The spirit appears within 30 ft for 1 hour; each creature within 10 ft of it takes the fire damage unless it succeeds on the DEX save.' },
    'druid:wildfire:Enhanced Bond': { none: true, text: 'Built in: while your Wildfire Spirit is summoned, your fire-damage and healing spells add 1d8 to one roll; spells with a range can originate from the spirit.' },
    'druid:wildfire:Cauterizing Flames': { col: 'reaction', roll: '2d10+wis', rollNote: 'healing or fire damage (your choice)', healRoll: true,
      text: 'When a Small or larger creature dies within 30 ft of you or your spirit, a flame fills its space for 1 minute; when a creature you can see enters it, heal it or burn it for 2d10 + WIS.' },
    'druid:wildfire:Blazing Revival': { trigger: 'zero', triggerLabel: 'Blazing Revival', onlyWhen: { companion: 'Wildfire Spirit' },
      use: { healHalf: true, removeCond: ['Unconscious', 'Prone'], dismiss: 'Wildfire Spirit' },
      text: 'Your Wildfire Spirit drops to 0 HP and disappears.',
      triggerText: 'Blazing Revival: your Wildfire Spirit sacrifices itself — regain half your HP and rise to your feet.' }
  });
})();
