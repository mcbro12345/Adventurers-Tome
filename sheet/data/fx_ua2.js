// Feature automation: remaining Unearthed Arcana content — Mystic, revised Ranger, UA subclasses and option lists (see tools/FX_SPEC.md).
(function () {
  const R = (n, rounds, buff, more) => ({ effect: Object.assign({ name: n, rounds, buff }, more || {}) });
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };
  const PSI = n => ({ from: 'Psionics', n });
  const G = {
    // ---- Paladin: Oath of Treachery ----
    'paladin:uatreachery:Channel Divinity: Conjure Duplicate': { col: 'action', cost: { from: 'Channel Divinity', n: 1 }, use: { effect: { name: 'Conjure Duplicate', rounds: 10, conc: true, buff: { note: 'Illusory double: cast spells from its space; advantage on attacks vs creatures within 5 ft of both of you that can see it' } } },
      acts: [{ name: 'Move duplicate', col: 'bonus', onlyWhen: { effect: 'Conjure Duplicate' }, text: 'Move the duplicate up to 30 ft (it must stay within 120 ft of you)' }] },
    'paladin:uatreachery:Channel Divinity: Poison Strike': { col: 'bonus', cost: { from: 'Channel Divinity', n: 1 }, use: R('Poison Strike', 10, { note: 'Next hit with the poisoned weapon/ammunition: +2d10 + paladin level poison (20 + paladin level if you had advantage)' }),
      text: 'Weapon poisoned for 1 minute — use a hit button below on your next hit',
      acts: [{ name: 'Poison hit', col: 'move', onlyWhen: { effect: 'Poison Strike' }, roll: '2d10+{paladin}', rollNote: 'poison damage (poison spent)', use: { endEffect: 'Poison Strike' } },
        { name: 'Poison hit (had advantage)', col: 'move', onlyWhen: { effect: 'Poison Strike' }, roll: '{20+paladin}', rollNote: 'poison damage (poison spent)', use: { endEffect: 'Poison Strike' } }] },
    'paladin:uatreachery:Aura of Treachery': { passive: { advNote: 'Melee attacks against creatures that have an ally within 5 ft of them' }, text: 'Treacherous Strike: a creature within 5 ft that missed you in melee rerolls the attack against another creature within 5 ft of it (no effect if immune to charm)' },
    "paladin:uatreachery:Blackguard's Escape": { use: { cond: 'Invisible', condRounds: 2 }, text: 'Teleport up to 60 ft to a space you can see; invisible until the end of your next turn or until you attack, deal damage or force a save' },
    'paladin:uatreachery:Icon of Deceit': { use: Object.assign(R('Icon of Deceit', 10, { note: 'Invisible; a creature that damages you on its turn: WIS save or you control its next action; +paladin level damage on hits made with advantage' }), { cond: 'Invisible', condRounds: 10 }), dc: 'spell', save: 'WIS', text: 'Hits made with advantage deal +{paladin} damage' },
    // ---- Sorcerer: Phoenix, Sea, Stone, Giant Soul ----
    'sorcerer:uaphoenix:Ignite': { col: 'action', text: 'Set alight a flammable object you touch (not worn or carried by someone else)' },
    'sorcerer:uaphoenix:Mantle of Flame': { use: R('Mantle of Flame', 10, { note: 'Bright light 30 ft; creatures that touch you or hit you in melee take CHA mod fire; add CHA mod to one fire damage roll on your turn' }),
      text: 'Creatures that touch you or hit you in melee take {max(0,cha)} fire; add {max(0,cha)} to one fire damage roll on each of your turns' },
    'sorcerer:uaphoenix:Phoenix Spark': { trigger: 'zero', triggerText: 'Reaction: drop to 1 HP instead and burst into flame (with Mantle of Flame up, use the "with Mantle of Flame" button for the bigger blast)',
      onlyWhen: { zeroHp: true }, use: { setHp: 1 }, roll: '{floor(sorcerer/2)+cha}', rollNote: 'fire to creatures of your choice within 10 ft',
      acts: [{ name: 'Spark with Mantle of Flame', col: 'reaction', cost: true, onlyWhen: { effect: 'Mantle of Flame', zeroHp: true }, use: { setHp: 1, endEffect: 'Mantle of Flame' }, roll: '{sorcerer+2*cha+(sorcerer>=18?20:0)}', rollNote: 'fire to creatures of your choice within 10 ft (the mantle ends)' }] },
    // Nourishing Fire: one button per slot level (shown once you can cast that level)
    'sorcerer:uaphoenix:Nourishing Fire': { text: 'After spending a slot on a spell with a fire damage roll, regain slot level + CHA mod HP (minimum 1)',
      acts: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(L => ({ name: 'Fire spell, level ' + L + ' slot', col: 'move', min: 2 * L - 1, roll: '{max(1,' + L + '+cha)}', rollNote: 'HP regained', healRoll: true })) },
    'sorcerer:uaphoenix:Form of the Phoenix': { passive: { effect: 'Mantle of Flame', fly: 40, resist: ['all damage'], advNote: 'Hover while your Mantle of Flame is active; Phoenix Spark deals +20 fire' } },
    'sorcerer:uasea:Soul of the Sea': { passive: { swim: 'walk', advNote: 'You can breathe underwater' } },
    'sorcerer:uasea:Curse of the Sea': { text: 'Cursed target, once per turn: cold spell → speed −15 ft; lightning spell → +{max(0,cha)} lightning; forced movement +15 ft. A non-cantrip trigger ends the curse.' },
    'sorcerer:uasea:Watery Defense': { passive: { resist: ['fire'] }, text: 'Reduce the weapon damage by {sorcerer} + your Charisma score, then move up to 30 ft without provoking opportunity attacks' },
    'sorcerer:uasea:Shifting Form': { passive: { advNote: 'Opportunity attacks against you deal half damage; move through hostile creatures and 3-inch gaps' } },
    'sorcerer:uasea:Water Soul': { passive: { resist: ['bludgeoning', 'piercing', 'slashing'], advNote: 'Critical hits against you are normal hits; no need to eat, drink or sleep' } },
    'sorcerer:uastone:Bonus Proficiencies': { none: true },
    'sorcerer:uastone:Metal Magic': { none: true },
    // acBase adds DEX in the engine, so subtract it to get 13 + CON
    "sorcerer:uastone:Stone's Durability": { passive: { maxHp: 'sorcerer' }, col: 'action', onlyWhen: { armor: 'none' }, use: R("Stone's Durability", null, { acBase: '13+con-dex', note: 'Stony skin: AC 13 + CON while not wearing armor (shield allowed); end it as a bonus action' }) },
    'sorcerer:uastone:Stone Aegis': { col: 'bonus', use: R('Stone Aegis', 10, { note: 'Warded ally takes less bludgeoning/piercing/slashing damage (2 + ¼ sorcerer level); reaction strike when it is hit in melee' }),
      text: 'Ally within 60 ft reduces bludgeoning, piercing and slashing damage by {2+floor(sorcerer/4)} for 1 minute',
      acts: [{ name: 'Aegis strike', col: 'reaction', onlyWhen: { effect: 'Stone Aegis' }, roll: '{tier(sorcerer,6,1,11,2,17,3)}d10', rollNote: 'extra force damage on a hit (teleport next to the attacker, make one melee weapon attack)' }] },
    "sorcerer:uastone:Stone's Edge": { roll: '{floor(sorcerer/2)}', rollNote: 'extra force damage to one creature the spell damaged' },
    "sorcerer:uastone:Earth Master's Aegis": { none: true },
    'sorcerer:uagiantsoul:Jotun Resilience': { passive: { maxHp: 'sorcerer' } },
    'sorcerer:uagiantsoul:Mark of the Ordning': { none: true },
    'sorcerer:uagiantsoul:Soul of Lost Ostoria': { text: 'See your giant type on the Mark of the Ordning feature' },
    'sorcerer:uagiantsoul:Rage of Fallen Ostoria': { use: Object.assign(R('Rage of Fallen Ostoria', 10, { meleeDmg: 'max(1,con)', speed: 5, note: 'One size larger, +5 ft reach, advantage on STR checks and saves, +1 HP and max HP per sorcerer level' }), { heal: '{sorcerer}' }),
      passive: { effect: 'Rage of Fallen Ostoria', maxHp: 'sorcerer', checkAdv: ['str'], saveAdv: ['str'] } },
    'sorcerer:uagiantsoul:Blessing of the All Father': { passive: { abil: { con: 2 }, abilMax: 22 } },
    // ---- Warlock: Undying Light, Ghost in the Machine, Raven Queen, Seeker ----
    'warlock:uaundyinglight:Radiant Soul': { passive: { resist: ['radiant'], spellDmg: { types: ['radiant', 'fire'], bonus: 'cha' } }, spells: ['Light', 'Sacred Flame'], spellNote: 'Radiant Soul: doesn’t count against cantrips known', text: 'Add {cha} to radiant and fire spell damage' },
    'warlock:uaundyinglight:Searing Vengeance': { trigger: 'zero', triggerText: 'Instead of a death save, spring up with half your HP; hostile creatures within 30 ft take radiant damage and are blinded',
      onlyWhen: { zeroHp: true }, use: { healHalf: true, removeCond: ['Prone'] }, roll: '{10+cha}', rollNote: 'radiant to each hostile creature within 30 ft (blinded until the end of your turn)' },
    'warlock:uaundyinglight:Radiant Resistance': { trigger: ['shortRest', 'longRest'], triggerText: 'Gain temporary HP; up to five creatures you see gain half as much', use: { temp: '{warlock+cha}' }, text: 'Up to five creatures you can see gain {floor((warlock+cha)/2)} temporary HP' },
    'warlock:uaundyinglight:Healing Light': { col: 'bonus', pool: true, text: 'Touch a creature and spend 1–5 dice from the pool',
      acts: [1, 2, 3, 4, 5].map(n => ({ name: n + 'd6', col: 'bonus', cost: { from: 'Healing Light', n }, roll: n + 'd6', rollNote: 'healing', healRoll: true })) },
    'warlock:uaghost:Expanded Spell List': { none: true },
    'warlock:uaghost:Information Surge': { dc: 'spell', save: 'INT', text: 'A device within 30 ft stops working until the end of your next turn (its holder can save)' },
    'warlock:uaghost:Wire Walk': { text: 'Teleport through a hardwired network to a connected device you can see' },
    'warlock:uaghost:Personal Encryption': { passive: { advNote: 'Saves against scrying, thought reading and magical location (checks to do so against you have disadvantage)' } },
    'warlock:uaghost:Technovirus': { dc: 'spell', save: 'CON', roll: '8d10', rollNote: 'psychic (half on a success)', text: 'Make a melee spell attack first; if it fails the save you can command it (as the command spell)' },
    'warlock:uaravenqueen:Sentinel Raven': {}, // darkvision and Perception come from the "on my shoulder" checkbox
    'warlock:uaravenqueen:Soul of the Raven': { col: 'bonus', use: R('Soul of the Raven', null, { note: 'Merged with your raven: Tiny, raven’s speed; only Dash, Disengage, Dodge, Help, Hide, Search' }), acts: [{ name: 'Return to normal', col: 'action', onlyWhen: { effect: 'Soul of the Raven' }, use: { endEffect: 'Soul of the Raven' }, text: 'You and the raven separate.' }] },
    "warlock:uaravenqueen:Raven's Shield": { passive: { resist: ['necrotic'], condImmune: ['Frightened'], advNote: 'Death saving throws' } },
    "warlock:uaravenqueen:Queen's Right Hand": { spells: ['Finger of Death'], once: true, spellNote: 'Once per long rest without a slot' },
    // "until the end of your next turn": 2 rounds, since effects tick down at the start of each of your turns
    'warlock:uaseeker:Shielding Aurora': { use: R('Shielding Aurora', 2, { resist: ['all damage'], note: 'Resistance to all damage; hostile creatures ending their turn within 10 ft take warlock level + CHA radiant' }), roll: '{warlock+cha}', rollNote: 'radiant to each hostile creature ending its turn within 10 ft' },
    'warlock:uaseeker:Pact Boon: Pact of the Star Chain': { none: true },
    'warlock:uaseeker:Astral Refuge': { col: 'action', text: 'In the Astral Plane take two actions, only to cast spells that target you alone; then return and your turn ends' },
    'warlock:uaseeker:Far Wanderer': { passive: { resist: ['fire', 'cold'], advNote: 'No need to breathe' } },
    'warlock:uaseeker:Astral Sequestration': { text: '5-minute ritual: you and up to ten willing creatures gain a short rest with no time passing' },
    // ---- Wizard UA traditions ----
    'wizard:uaartificer:Infuse Potions': { text: 'Spend 10 minutes and a slot: 1st climbing/growth/healing; 2nd mind reading/greater healing; 3rd invisibility/superior healing/water breathing; 4th resistance' },
    'wizard:uaartificer:Infuse Scrolls': { none: true },
    'wizard:uaartificer:Infuse Weapons and Armor': { text: '2nd: +1 ammunition (20) · 3rd: +1 weapon or shield · 4th: +1 armor · 5th: +2 weapon/ammo · 6th: +2 armor (8 hours)' },
    'wizard:uaartificer:Superior Artificer': { none: true },
    'wizard:uaartificer:Master Artificer': { none: true },
    'wizard:uainvention:Tools of the Inventor': { none: true },
    'wizard:uainvention:Arcanomechanical Armor': { passive: { resist: ['force'] }, text: 'Your armor: AC 12 + DEX (equip it as studded leather); force resistance while you wear it' },
    'wizard:uainvention:Reckless Casting': { col: 'action', roll: '1d10', rollNote: 'on the Reckless Casting table (10: roll twice)' },
    'wizard:uainvention:Alchemical Casting': { roll: '2d10', rollNote: 'force damage to one target (extra 2nd-level slot; extra 1st-level slot swaps the damage type instead)' },
    'wizard:uainvention:Prodigious Inspiration': { text: 'Swap one prepared wizard spell for another in your spellbook' },
    'wizard:uainvention:Controlled Chaos': { none: true },
    // initiative: INT instead of DEX when it's higher
    'wizard:ualoremaster:Lore Master': { passive: { init: 'max(0,int-dex)', advNote: 'Double proficiency on Arcana, History, Nature and Religion checks you are proficient in' } },
    'wizard:ualoremaster:Spell Secrets': { text: 'Swap a damage type, or once per rest change a spell’s save ability' },
    'wizard:ualoremaster:Alchemical Casting': { roll: '2d10', rollNote: 'force to each target (extra 1st-level slot; 2nd: range 1 mile; 3rd: +2 save DC)' },
    'wizard:ualoremaster:Prodigious Memory': { text: 'Swap one prepared wizard spell for another in your spellbook' },
    'wizard:ualoremaster:Master of Magic': { text: 'Cast one spell from any class list this turn (a level you have slots for)' },
    'wizard:uaonomancy:Bonus Proficiencies': { none: true },
    'wizard:uaonomancy:Extract Name': { dc: 'spell', save: 'WIS', text: 'On a failure it is charmed until the end of your next turn and you learn its true name' },
    'wizard:uaonomancy:Fateful Naming': { spells: ['Bane', 'Bless'], spellNote: 'Without a slot by speaking a true name' },
    'wizard:uaonomancy:Resonant Utterance': { text: 'Speak a true name while casting with a slot to apply one of your Resonants' },
    'wizard:uaonomancy:Inexorable Pronouncement': { none: true },
    'wizard:uaonomancy:Relentless Naming': { none: true },
    'wizard:uapsionics:Psionic Focus': { passive: { advNote: 'Reroll 1s on psychic and force damage dice of your wizard spells (focus in hand)' } },
    'wizard:uapsionics:Psionic Devotion': { text: 'Cast your chosen cantrip as a bonus action with no components (while carrying your focus)' },
    'wizard:uapsionics:Thought Form': { use: R('Thought Form', 100, { resist: ['psychic', 'nonmagical bludgeoning, piercing and slashing'], note: 'Spells need no components (unless they cost gold)' }) },
    'wizard:uapsionics:Empowered Psionics': { passive: { advNote: 'Add INT mod to psychic or force damage of a wizard spell against one target' } },
    'wizard:uapsionics:Mental Discipline': { text: 'Cast your chosen spell without components; once per long rest without a slot' },
    'wizard:uapsionics:Thought Travel': { passive: { effect: 'Thought Form', fly: 'walk', advNote: 'Thought Form: hover; move through creatures and objects (1d10 force if you end your turn inside one)' } },
    'wizard:uarunecrafter:Runes of Understanding': { spells: ['Comprehend Languages'], spellNote: 'Without a slot' },
    'wizard:uarunecrafter:Runic Empowerment': { acts: [
      { name: 'Life rune', col: 'move', cost: true, text: 'A creature within 30 ft gains 5 × slot level temporary HP' },
      { name: 'War rune', col: 'move', cost: true, text: 'Attacks against a creature within 30 ft get + half the slot level (round up) until the end of your next turn' },
      { name: 'Wind rune', col: 'move', cost: true, use: R('Wind rune', 1, { note: '+5 ft speed per slot level; no opportunity attacks until your next turn' }) }] },
    'wizard:uarunecrafter:Sigils of Warding': { col: 'reaction', dc: false, cost: { from: 'Runic Empowerment', n: 1 }, text: 'Succeed on a failed STR, DEX or CON save' },
    'wizard:uarunecrafter:Rune Maven': { trigger: 'shortRest', triggerText: 'If you used Arcane Recovery, also regain Runic Empowerment uses', use: { regain: { from: 'Runic Empowerment', n: 'max(1,ceil(int/2))' } } },
    'wizard:uarunecrafter:Engraved Enmity': { use: R('Engraved Enmity', 10, { note: 'Marked: disadvantage on saves against your spells; can’t become invisible' }, { conc: true }), dc: 'spell', save: 'WIS', slotRestore: 3,
      acts: [{ name: 'Curse the mark', col: 'bonus', onlyWhen: { effect: 'Engraved Enmity' }, roll: '1d8', rollNote: 'force on an ally’s next hit against the marked creature' }] },
    'wizard:uatechnomancy:Bonus Proficiencies': { none: true },
    'wizard:uatechnomancy:Technological Savant': { none: true },
    'wizard:uatechnomancy:Program Spell': { col: 'action', text: 'Release the spell stored in your device (stored up to 48 hours)' },
    'wizard:uatechnomancy:Online Casting': { text: 'Cast a single-target spell through networked devices' },
    'wizard:uatechnomancy:Chained Device': { text: 'Your device holds concentration on one spell for you' },
    'wizard:uatheurgy:Divine Inspiration': { none: true },
    'wizard:uatheurgy:Arcane Initiate': { none: true }, // (not the Arcana domain's Arcane Initiate — no skill proficiency)
    'wizard:uatheurgy:Channel Arcana': { resource: true },
    'wizard:uatheurgy:Channel Arcana: Divine Arcana': { col: 'bonus', cost: { from: 'Channel Arcana', n: 1 }, use: R('Divine Arcana', 1, { note: '+2 to your next spell’s attack roll or save DC this turn' }) },
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
  // ---- Ranger: Primeval Guardian (UA) — full ranger keys; the bare subclass keys stay as a fallback for the other ranger classes ----
  const PG = {
    'Guardian Magic': { none: true }, // the subclass's always-prepared spell list adds these
    'Guardian Soul': { col: 'bonus', use: Object.assign(R('Guardian Soul', null, { note: 'Large; walking speed 5 ft (unless lower); +5 ft reach; temp HP equal to half your ranger level at the start of each of your turns. Ends if you are incapacitated.' }),
        { temp: '{floor(ranger/2)}', heal: '{ranger>=7?2*ranger:0}' }),
      text: 'Gain {floor(ranger/2)} temporary HP at the start of each of your turns while in this form',
      acts: [{ name: 'End guardian form', col: 'bonus', onlyWhen: { effect: 'Guardian Soul' }, use: { endEffect: 'Guardian Soul' } }] },
    'Piercing Thorns': { col: 'move', roll: '1d6', rollNote: 'extra piercing damage (once per turn, on a weapon hit)' },
    'Ancient Fortitude': { passive: { effect: 'Guardian Soul', maxHp: '2*ranger' } },
    'Rooted Defense': { passive: { effect: 'Guardian Soul', advNote: 'Guardian form: the ground within 30 ft is difficult terrain for your enemies' } },
    'Guardian Aura': { passive: { effect: 'Guardian Soul', advNote: 'Guardian form: allies below half HP starting their turn within 30 ft regain half your ranger level in HP' } }
  };
  Object.keys(PG).forEach(n => { DND.featFx['ranger:uaprimevalguardian:' + n] = PG[n]; DND.featFx['uaprimevalguardian:' + n] = PG[n]; });
  // ---- Option lists ----
  setOpt('pactBoon', 'Pact of the Star Chain', { spells: ['Augury'], spellNote: 'Ritual, doesn’t count against spells known', max: '1', reset: 'short', text: 'Advantage on one INT check' });
  // Mark of the Ordning: the feature card offers the giant-type picker (label = feature name); its spells are sorcerer spells.
  if (DND.options.uaOrdning) DND.options.uaOrdning.label = 'Mark of the Ordning';
  const ord = (n, spells, fx) => setOpt('uaOrdning', n, Object.assign({ spellsAt: spells, spellCls: 'sorcerer' }, fx));
  ord('Cloud Giant', { 1: ['Fog Cloud', 'Minor Illusion'], 3: ['Invisibility'] }, { col: 'bonus', text: 'Soul of Lost Ostoria (6th level): after casting one, teleport {10+con} ft as a bonus action' });
  ord('Fire Giant', { 1: ['Burning Hands', 'Fire Bolt'], 3: ['Flaming Sphere'] }, { text: 'Soul of Lost Ostoria (6th level): +{max(1,con)} damage with these spells' });
  ord('Frost Giant', { 1: ['Armor of Agathys', 'Ray of Frost'], 3: ['Hold Person'] }, { use: { temp: '{max(1,con)}' }, text: 'Soul of Lost Ostoria (6th level): temp HP after casting one (armor of Agathys gains that much extra)' });
  ord('Hill Giant', { 1: ['Heroism', 'Shillelagh'], 3: ['Enlarge/Reduce'] }, { dc: 'spell', save: 'STR', text: 'Soul of Lost Ostoria (6th level): after casting one, up to two creatures within 5 ft are pushed {5+con} ft' });
  ord('Stone Giant', { 1: ['Entangle', 'Resistance'], 3: ['Spike Growth'] }, { use: R('Soul of Lost Ostoria', 2, { ac: 'max(1,con)' }), text: 'Soul of Lost Ostoria (6th level): +{max(1,con)} AC until the end of your next turn' });
  ord('Storm Giant', { 1: ['Shocking Grasp', 'Thunderwave'], 3: ['Gust of Wind'] }, { roll: '{max(1,con)}', rollNote: 'lightning to up to three creatures within 30 ft (Soul of Lost Ostoria, 6th level)' });
  // Psionics (UA) wizard: the cantrip of Psionic Devotion and the spell of Mental Discipline are choices on those feature cards.
  {
    const s = DND.classes.wizard && DND.classes.wizard.subclasses.uapsionics;
    DND.options.uaPsiDevotion = { label: 'Psionic Devotion', list: [
      ['Friends', 'Cantrip; with your focus, cast as a bonus action with no components — the target doesn’t turn hostile when it ends.', 'Psionics (UA)', { spellsAt: { 1: ['Friends'] }, spellCls: 'wizard', spellNote: 'Psionic Devotion: bonus action, no components (focus)' }],
      ['Mage Hand', 'Cantrip; with your focus, cast as a bonus action with no components — the hand is invisible and you control it as a bonus action.', 'Psionics (UA)', { spellsAt: { 1: ['Mage Hand'] }, spellCls: 'wizard', spellNote: 'Psionic Devotion: bonus action, no components, invisible hand (focus)' }],
      ['Message', 'Cantrip; with your focus, cast as a bonus action with no components — no gestures or whisper needed.', 'Psionics (UA)', { spellsAt: { 1: ['Message'] }, spellCls: 'wizard', spellNote: 'Psionic Devotion: bonus action, no components (focus)' }]] };
    DND.options.uaMentalDiscipline = { label: 'Mental Discipline', list: ['Dominate Person', 'Scrying', 'Telekinesis'].map(n =>
      [n, 'Always prepared, cast without components; once per long rest without a slot.', 'Psionics (UA)', { spellsAt: { 1: [n] }, spellCls: 'wizard', once: true, spellNote: 'Mental Discipline: no components; once per long rest without a slot' }]) };
    if (s && !(s.choices || []).some(c => c.type === 'uaPsiDevotion')) s.choices = (s.choices || []).concat([{ level: 2, type: 'uaPsiDevotion', n: 1 }, { level: 10, type: 'uaMentalDiscipline', n: 1 }]);
  }
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
