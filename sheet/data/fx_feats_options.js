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
