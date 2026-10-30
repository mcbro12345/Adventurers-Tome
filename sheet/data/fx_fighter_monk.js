// Feature automation: Fighter and Monk (PHB, XGE, SCAG, TCE, FTD), with their non-UA subclasses.
// Full keys only ('fighter:<Name>', 'fighter:<sub>:<Name>', 'monk:...'). Later files win over data/featfx.js.
(function () {
  const BPS = ['bludgeoning', 'piercing', 'slashing'];
  const E = (name, rounds, buff, more) => ({ effect: Object.assign({ name, rounds, buff: buff || {} }, more || {}) });
  const KI = n => ({ from: 'Ki', n });
  const PSI = { from: 'Psionic Power', n: 1 };
  // On-hit / no-action options go in the Combat tab's "Movement & Free" column ('move'): visible in a fight, no action spent.
  const FREE = 'move';
  // "Regain one when you roll initiative with none left" lives on the higher-level feature (onInit can only refill a feature's own uses).
  // regained on its own as you roll initiative, only when the pool is empty
  const ONINIT = (from, n, what) => ({ cost: null, dc: false, onInit: { from, regain: n, ifEmpty: true }, text: `When you roll initiative with no ${what} remaining, you regain ${n} (the sheet does it for you)` });
  const setOpt = (type, name, fx) => { const e = (DND.options[type] || { list: [] }).list.find(x => x[0] === name); if (e) e[3] = Object.assign({}, e[3] || {}, fx); };

  Object.assign(DND.featFx, {
    // ================= FIGHTER =================
    'fighter:Fighting Style': { dc: false, text: 'The chosen style is listed as its own feature and carries its effects' },
    'fighter:Second Wind': { col: 'bonus', healRoll: true, rollNote: 'HP regained' },
    'fighter:Action Surge': { col: 'move', use: { resetTurn: true }, text: 'One additional action this turn (only one Action Surge per turn)' },
    'fighter:Extra Attack': { none: true },
    'fighter:Indomitable': { col: FREE, text: 'Reroll a failed saving throw; you must use the new roll' },

    // ---- Champion ----
    'fighter:champion:Improved Critical': { crit: 19 },
    'fighter:champion:Remarkable Athlete': { passive: { init: 'ceil(prof/2)', advNote: 'Half proficiency (rounded up) on STR, DEX and CON checks you aren’t proficient in; running long jump +STR mod ft (Remarkable Athlete)' } },
    'fighter:champion:Additional Fighting Style': { dc: false, text: 'The second style is listed as its own feature' },
    'fighter:champion:Superior Critical': { crit: 18 },
    'fighter:champion:Survivor': { onTurn: { onlyWhen: { hpBelowHalf: true }, notZero: true, use: { heal: '5+con' } }, text: 'Start of each of your turns while at half HP or less (but above 0): regain 5 + CON mod HP — the sheet does it when your turn starts' },

    // ---- Battle Master ----
    'fighter:battlemaster:Combat Superiority': { resource: true, dc: 'str|dex' },
    'fighter:battlemaster:Student of War': { none: true },
    'fighter:battlemaster:Know Your Enemy': { none: true },
    'fighter:battlemaster:Improved Combat Superiority': { none: true },
    'fighter:battlemaster:Relentless': ONINIT('Combat Superiority', 1, 'superiority dice'),

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
    'fighter:arcanearcher:Ever-Ready Shot': ONINIT('Arcane Shot', 1, 'Arcane Shot uses'),

    // ---- Cavalier ----
    'fighter:cavalier:Bonus Proficiency': { none: true },
    'fighter:cavalier:Born to the Saddle': { passive: { advNote: 'Saves to avoid falling off your mount; land on your feet after falling ≤10 ft; mount/dismount costs 5 ft' } },
    'fighter:cavalier:Unwavering Mark': { col: 'bonus', roll: '{floor(fighter/2)}', rollNote: 'extra damage on the bonus-action attack (made with advantage)',
      text: 'Melee hit marks the target until the end of your next turn (disadvantage on attacks vs others within 5 ft of you). If it deals damage to anyone else: bonus-action melee attack against it' },
    'fighter:cavalier:Warding Maneuver': { col: 'reaction', roll: '1d8', rollNote: 'added to the target’s AC; if it still hits, the target has resistance to that damage' },
    'fighter:cavalier:Hold the Line': { col: 'reaction', text: 'Opportunity attack when a creature moves 5 ft or more within your reach; on a hit its speed becomes 0 for the turn' },
    'fighter:cavalier:Ferocious Charger': { col: FREE, dc: 'str', save: 'STR', text: 'Once per turn, after moving 10+ ft in a straight line, an attack hit forces a STR save or the target is knocked prone (Large or smaller)' },
    'fighter:cavalier:Vigilant Defender': { text: 'A special reaction for an opportunity attack once on every creature’s turn except yours' },

    // ---- Samurai ----
    'fighter:samurai:Bonus Proficiency': { none: true },
    'fighter:samurai:Fighting Spirit': { col: 'bonus', use: Object.assign(E('Fighting Spirit', 1, { atkAdv: 'Fighting Spirit' }), { temp: '{tier(fighter,3,5,10,10,15,15)}' }) },
    'fighter:samurai:Elegant Courtier': { passive: { saveProf: ['wis'], skillBonus: { Persuasion: 'wis' } }, text: 'Your WIS modifier is added to Persuasion (built in). If you were already proficient in WIS saves, you may choose INT or CHA instead' },
    'fighter:samurai:Tireless Spirit': ONINIT('Fighting Spirit', 1, 'Fighting Spirit uses'),
    'fighter:samurai:Rapid Strike': { text: 'Once per turn, on an Attack-action attack with advantage against a creature: forgo the advantage to make one additional weapon attack against it as part of the same action' },
    'fighter:samurai:Strength before Death': { trigger: 'zero', triggerLabel: 'Take an extra turn', triggerText: 'You drop to 0 HP but don’t fall unconscious: take an extra turn right now. Damage during it causes death save failures as normal; three failures kill you. At the end of the turn you fall unconscious if still at 0 HP.',
      use: { resetTurn: true }, text: 'Extra turn now (interrupting the current turn)' },

    // ---- Psi Warrior ----
    'fighter:psiwarrior:Psionic Power': { resource: true, dc: 'int', acts: [
      { name: 'Protective Field', col: 'reaction', cost: true, roll: '1psi+{max(1,int)}', rollNote: 'damage reduced (you or a creature within 30 ft)' },
      { name: 'Psionic Strike', col: FREE, cost: true, roll: '1psi+int', rollNote: 'force damage (once per turn, after a weapon hit vs a creature within 30 ft)' },
      { name: 'Telekinetic Movement', col: 'action', text: 'Free once per short rest: move a Large or smaller object or willing creature (not you) up to 30 ft' },
      { name: 'Telekinetic Movement (spend a die)', col: 'action', cost: true, text: 'Move a Large or smaller object or willing creature (not you) up to 30 ft' },
      { name: 'Recover a die', col: 'bonus', use: { regain: { from: 'Psionic Power', n: 1 } }, text: 'Once per short rest' }] },
    'fighter:psiwarrior:Telekinetic Adept': { dc: 'int', acts: [
      { name: 'Psi-Powered Leap', col: 'bonus', use: E('Psi-Powered Leap', 1, { fly: 'walk', note: 'Flying speed equal to twice your walking speed until the end of the turn' }), text: 'Free once per short rest' },
      { name: 'Psi-Powered Leap (spend a die)', col: 'bonus', cost: PSI, use: E('Psi-Powered Leap', 1, { fly: 'walk', note: 'Flying speed equal to twice your walking speed until the end of the turn' }) },
      { name: 'Telekinetic Thrust', col: FREE, dc: 'int', save: 'STR', text: 'When Psionic Strike deals damage: STR save or knocked prone or moved up to 10 ft horizontally' }] },
    'fighter:psiwarrior:Guarded Mind': { passive: { resist: ['psychic'] }, acts: [
      { name: 'End charm and fear', col: FREE, cost: PSI, use: { removeCond: ['Charmed', 'Frightened'] }, text: 'Start of your turn, while charmed or frightened' }] },
    'fighter:psiwarrior:Bulwark of Force': { col: 'bonus', use: E('Bulwark of Force', 10, { ac: 2, note: 'Half cover (+2 AC and DEX saves); up to INT mod creatures within 30 ft' }),
      text: 'Up to {max(1,int)} creatures within 30 ft (you can include yourself) gain half cover for 1 minute or until you’re incapacitated',
      acts: [{ name: 'Bulwark of Force (spend a die)', col: 'bonus', cost: PSI, use: E('Bulwark of Force', 10, { ac: 2, note: 'Half cover (+2 AC and DEX saves)' }) }] },
    'fighter:psiwarrior:Telekinetic Master': { col: 'action', spells: ['Telekinesis'], spellNote: 'Telekinetic Master: once per long rest without a slot (or spend a psionic energy die); INT', text: 'Cast telekinesis without a slot (INT); spend a psionic energy die to cast it again',
      acts: [{ name: 'Cast again (spend a die)', col: 'action', cost: PSI, text: 'Cast telekinesis without a slot' },
        { name: 'Weapon attack (telekinesis)', col: 'bonus', text: 'While concentrating on telekinesis: one weapon attack' }] },

    // ---- Rune Knight ----
    'fighter:runeknight:Bonus Proficiencies': { none: true },
    'fighter:runeknight:Rune Carver': { dc: 'con', text: 'Each rune you know is listed as its own feature (invoke once per short rest; save DC 8 + prof + CON)' },
    // Effect dice can't scale by level (dmgDice takes no formula), so one button per tier: use the highest one shown.
    "fighter:runeknight:Giant's Might": { resource: true, text: 'Extra damage 1d{tier(fighter,3,6,10,8,18,10)} once per turn (1d8 from 10th, 1d10 from 18th)',
      acts: [{ name: "Giant's Might", col: 'bonus', cost: true,
        use: E("Giant's Might", 10, { dmgDice: '1d{tier(fighter,3,6,10,8,18,10)}', note: 'Large (Huge from 18th, +5 ft reach); advantage on STR checks and saves; +1d{tier(fighter,3,6,10,8,18,10)} damage once per turn on a weapon or unarmed hit' }) }] },
    'fighter:runeknight:Runic Shield': { col: 'reaction', text: 'When a creature you can see within 60 ft hits another creature: force it to reroll the d20 and use the new roll' },
    'fighter:runeknight:Great Stature': { roll: '3d4', rollNote: 'inches of height gained', text: "Giant's Might extra damage becomes 1d8" },
    'fighter:runeknight:Master of Runes': { dc: false, text: 'Each rune can be invoked twice per short rest (rune uses updated automatically)' },
    'fighter:runeknight:Runic Juggernaut': { dc: false, text: "Giant's Might: damage 1d10, you can become Huge and your reach increases by 5 ft" },

    // ---- Purple Dragon Knight ----
    'fighter:purpledragon:Rallying Cry': { text: 'When you use Second Wind: up to three allies within 60 ft each regain {fighter} HP' },
    'fighter:purpledragon:Royal Envoy': { passive: { skillProf: ['Persuasion'], skillExp: ['Persuasion'] } },
    'fighter:purpledragon:Inspiring Surge': { text: 'When you use Action Surge: {tier(fighter,10,1,18,2)} ally(ies) within 60 ft can use a reaction to make one weapon attack' },
    'fighter:purpledragon:Bulwark': { dc: false, text: 'When you use Indomitable on an INT, WIS or CHA save (not incapacitated): one ally within 60 ft that failed the same save can reroll it' },

    // ================= MONK =================
    'monk:Unarmored Defense': { none: true },
    // (the bonus-action strike has its own built-in row in the Bonus Action column)
    'monk:Martial Arts': { col: null, text: 'One unarmed strike as a bonus action after you take the Attack action with unarmed strikes or monk weapons' },
    'monk:Ki': { resource: true, dc: 'wis', acts: [
      { name: 'Flurry of Blows', col: 'bonus', cost: true, text: 'Two unarmed strikes immediately after the Attack action' },
      { name: 'Patient Defense', col: 'bonus', cost: true, use: { cond: 'Dodging', condRounds: 1 }, text: 'Take the Dodge action' },
      { name: 'Step of the Wind (Dash)', col: 'bonus', cost: true, dash: true, text: 'Dash; jump distance doubled this turn' },
      { name: 'Step of the Wind (Disengage)', col: 'bonus', cost: true, text: 'Disengage; jump distance doubled this turn' }] },
    'monk:Unarmored Movement': { text: 'Speed bonus without armor or shield (applied automatically); from 9th level you can move along vertical surfaces and across liquids on your turn' },
    'monk:Deflect Missiles': { col: 'reaction', cost: null, dc: false, roll: '1d10+dex+monk', rollNote: 'damage reduced',
      acts: [{ name: 'Throw it back', col: FREE, cost: KI(1), text: 'If reduced to 0 and you caught it: ranged attack (proficient, monk weapon) with it, 20/60 ft' }] },
    'monk:Slow Fall': { col: 'reaction', dc: false, text: 'Reduce falling damage by {5*monk}' },
    'monk:Extra Attack': { none: true },
    'monk:Stunning Strike': { col: 'action', cost: KI(1), dc: 'wis', save: 'CON', text: 'On a melee weapon hit: CON save or stunned until the end of your next turn' },
    'monk:Ki-Empowered Strikes': { none: true },
    'monk:Evasion': { dc: false, passive: { advNote: 'DEX saves for half: no damage on a success, half on a failure (Evasion)' } },
    'monk:Stillness of Mind': { col: 'action', use: { removeCond: ['Charmed', 'Frightened'] } },
    'monk:Purity of Body': { passive: { immune: ['poison'], condImmune: ['Poisoned', 'Diseased'] } },
    'monk:Tongue of the Sun and Moon': { none: true },
    'monk:Diamond Soul': { cost: null, passive: { saveProf: 'all' }, acts: [{ name: 'Reroll a failed save', col: FREE, cost: KI(1), text: 'Use the second roll' }] },
    'monk:Timeless Body': { none: true },
    'monk:Empty Body': { col: 'action', cost: KI(4), use: Object.assign(E('Empty Body', 10, { note: 'Invisible; resistance to all damage except force' }), { cond: 'Invisible', condRounds: 10 }),
      passive: { effect: 'Empty Body', resist: ['all damage except force'] },
      acts: [{ name: 'Astral Projection', col: 'action', cost: KI(8), text: 'Cast astral projection on yourself only, without material components' }] },
    'monk:Perfect Self': ONINIT('Ki', 4, 'ki points'),

    // ---- Open Hand ----
    'monk:openhand:Open Hand Technique': { col: FREE, dc: 'wis', save: 'DEX or STR', text: 'Flurry of Blows hit: DEX save or prone; STR save or pushed up to 15 ft; or no reactions until the end of your next turn' },
    'monk:openhand:Wholeness of Body': { col: 'action', use: { heal: '{3*monk}' } },
    'monk:openhand:Tranquility': { trigger: 'longRest', triggerLabel: 'Sanctuary', triggerText: 'Gain the effect of sanctuary until the start of your next long rest (ends early if you attack or cast a spell).',
      dc: 'wis', save: 'WIS', use: E('Sanctuary (Tranquility)', null, { note: 'Attackers must make a WIS save or choose a new target; ends if you attack or cast a spell' }) },
    'monk:openhand:Quivering Palm': { col: FREE, cost: KI(3), dc: false, text: 'Unarmed hit: set harmless vibrations that last {monk} days (one creature at a time)',
      acts: [{ name: 'End the vibrations', col: 'action', dc: 'wis', save: 'CON', roll: '10d10', rollNote: 'necrotic on a successful save (failure: it drops to 0 HP)', text: 'Target on the same plane; ending them harmlessly takes no action' }] },

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
        { name: 'Fangs of the Fire Snake', col: FREE, cost: KI(1), text: 'Attack action: unarmed strikes get +10 ft reach and can deal fire damage this turn' },
        { name: 'Fangs: +1d10 fire', col: FREE, cost: KI(1), roll: '1d10', rollNote: 'extra fire damage on the hit' },
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
        { name: 'Ride the Wind', col: 'action', min: 11, cost: KI(4), use: E('Fly (Ride the Wind)', 100, { fly: 60 }, { conc: true }), text: 'Cast fly on yourself' },
        { name: 'Breath of Winter', col: 'action', min: 17, cost: KI(6), dc: 'wis', save: 'CON', roll: '8d8', rollNote: 'cold, 60-ft cone (cone of cold)' },
        { name: 'River of Hungry Flame', col: 'action', min: 17, cost: KI(5), dc: 'wis', save: 'DEX', roll: '5d8', rollNote: 'fire (wall of fire)' },
        { name: 'Wave of Rolling Earth', col: 'action', min: 17, cost: KI(6), dc: 'wis', save: 'DEX', text: 'Cast wall of stone' }] },

    // ---- Drunken Master ----
    'monk:drunkenmaster:Bonus Proficiencies': { passive: { skillProf: ['Performance'] } },
    // Named exactly "Flurry of Blows" so the sheet rolls the two strikes (as the Ki button does) and also applies the drunken bonus.
    'monk:drunkenmaster:Drunken Technique': { dc: false, acts: [
      { name: 'Flurry of Blows', col: 'bonus', cost: KI(1), use: E('Drunken Technique', 1, { speed: 10, note: 'Disengage; +10 ft walking speed this turn' }), text: 'Two unarmed strikes after the Attack action; you also gain Disengage and +10 ft speed' }] },
    'monk:drunkenmaster:Tipsy Sway': { col: 'reaction', cost: KI(1), text: 'Redirect Attack: when a creature misses you in melee, it hits a creature of your choice within 5 ft of you instead. Standing up from prone costs only 5 ft' },
    "monk:drunkenmaster:Drunkard's Luck": { col: FREE, cost: KI(2), dc: false, text: 'Cancel disadvantage on an ability check, attack roll or saving throw before you roll' },
    'monk:drunkenmaster:Intoxicated Frenzy': { text: 'Flurry of Blows: up to three additional attacks (five total), each against a different creature' },

    // ---- Kensei ----
    'monk:kensei:Path of the Kensei': { acts: [
      { name: 'Agile Parry', col: FREE, use: E('Agile Parry', 1, { ac: 2, note: 'Holding a kensei melee weapon after an unarmed strike in the Attack action' }), text: '+2 AC until the start of your next turn' },
      { name: "Kensei's Shot", col: 'bonus', use: E("Kensei's Shot", 1, { dmgDice: '1d4', note: 'Ranged attacks with a kensei weapon this turn' }) }] },
    'monk:kensei:One with the Blade': { col: FREE, cost: KI(1), roll: '1ma', rollNote: 'extra damage (Deft Strike, once per turn, kensei weapon hit)', text: 'Your kensei weapons count as magical' },
    'monk:kensei:Sharpen the Blade': { cost: null, text: 'Spend 1–3 ki: kensei weapon bonus to attack and damage rolls for 1 minute (not on a weapon that already has a bonus)', acts: [1, 2, 3].map(n => (
      { name: `+${n} (${n} ki)`, col: 'bonus', cost: KI(n), use: E('Sharpen the Blade', 10, { atk: n, dmg: n, note: `+${n} with your kensei weapon only` }) })) },
    'monk:kensei:Unerring Accuracy': { text: 'Once on each of your turns: reroll a missed attack with a monk weapon' },

    // ---- Long Death ----
    'monk:longdeath:Touch of Death': { col: FREE, use: { temp: '{max(1,wis+monk)}' }, text: 'When you reduce a creature within 5 ft to 0 HP' },
    'monk:longdeath:Hour of Reaping': { col: 'action', dc: 'wis', save: 'WIS', text: 'Each creature within 30 ft that can see you: frightened until the end of your next turn' },
    'monk:longdeath:Mastery of Death': { cost: KI(1), trigger: 'zero', triggerLabel: 'Spend 1 ki: 1 HP', triggerText: 'Reduced to 0 HP (not killed outright): spend 1 ki to drop to 1 HP instead.', use: { setHp: 1 } },
    'monk:longdeath:Touch of the Long Death': { cost: null, dc: 'wis', save: 'CON', text: 'Touch a creature within 5 ft: 2d10 necrotic per ki spent (1–10), half on a success',
      acts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({ name: `${n} ki`, col: 'action', cost: KI(n), roll: `${2 * n}d10`, rollNote: 'necrotic (half on a successful CON save)', dc: 'wis', save: 'CON' })) },

    // ---- Sun Soul ----
    'monk:sunsoul:Radiant Sun Bolt': { cost: null,
      attacks: [['Radiant Sun Bolt', '', 'radiant', 'dex', { kind: 'ranged', monk: true, notes: 'Ranged spell attack, 30 ft; Martial Arts die + DEX; usable for any attack of the Attack action' }]],
      acts: [{ name: 'Two bolts (1 ki)', col: 'bonus', cost: KI(1), text: 'After using a bolt in the Attack action: two more Radiant Sun Bolt attacks (roll them from Attacks)' }] },
    // Burning hands for 2 ki, +1d6 per extra ki; total ki spent can't exceed half your monk level.
    'monk:sunsoul:Searing Arc Strike': { cost: null, dc: 'wis', save: 'DEX', text: 'After the Attack action: cast burning hands (15-ft cone, DEX half) as a bonus action; at most {floor(monk/2)} ki',
      acts: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(x => ({ name: `${2 + x} ki (${3 + x}d6)`, col: 'bonus', min: 2 * (2 + x), cost: KI(2 + x), dc: 'wis', save: 'DEX', roll: `${3 + x}d6`, rollNote: 'fire, 15-ft cone (half on a success)' })) },
    'monk:sunsoul:Searing Sunburst': { col: 'action', dc: 'wis', save: 'CON', roll: '2d6', rollNote: 'radiant, 20-ft radius within 150 ft (no damage on a success)',
      acts: [1, 2, 3].map(n => ({ name: `Sunburst +${n} ki`, col: 'action', cost: KI(n), roll: `${2 + 2 * n}d6`, rollNote: 'radiant (no damage on a success)', dc: 'wis', save: 'CON' })) },
    'monk:sunsoul:Sun Shield': { col: 'reaction', roll: '5+wis', rollNote: 'radiant damage to the creature that hit you in melee (within 5 ft)',
      acts: [{ name: 'Toggle light', col: 'bonus', text: 'Shed bright light 30 ft, dim 30 ft more (or extinguish it)' }] },

    // ---- Mercy ----
    'monk:mercy:Implements of Mercy': { passive: { skillProf: ['Insight', 'Medicine'] } },
    'monk:mercy:Hand of Healing': { col: 'action', cost: KI(1), roll: '1ma+wis', rollNote: 'healing', healRoll: true, text: 'Touch a creature; you can replace one Flurry of Blows strike with this',
      acts: [{ name: 'In place of a Flurry strike', col: FREE, roll: '1ma+wis', rollNote: 'healing', healRoll: true, text: 'Replaces one unarmed strike of Flurry of Blows; no extra ki' }] },
    // (armed from the Attack action block / attack card: built in)
    'monk:mercy:Hand of Harm': { cost: KI(1), roll: '1ma+wis', rollNote: 'necrotic (once per turn, on an unarmed hit)' },
    "monk:mercy:Physician's Touch": { text: 'Hand of Healing also ends one disease or one condition: blinded, deafened, paralyzed, poisoned or stunned. Hand of Harm also poisons the target until the end of your next turn' },
    'monk:mercy:Flurry of Healing and Harm': { acts: [
      { name: 'Hand of Healing (Flurry, no ki)', col: FREE, roll: '1ma+wis', rollNote: 'healing', healRoll: true, text: 'Replaces a Flurry of Blows strike' },
      { name: 'Hand of Harm (Flurry, no ki)', col: FREE, roll: '1ma+wis', rollNote: 'necrotic', text: 'Once per turn during Flurry of Blows' }] },
    'monk:mercy:Hand of Ultimate Mercy': { col: 'action', cost: KI(5), roll: '4d10+wis', rollNote: 'HP the creature returns to life with', text: 'Touch a creature that died within 24 hours; it is cured of blinded, deafened, paralyzed, poisoned and stunned' },

    // ---- Astral Self ----
    'monk:astralself:Arms of the Astral Self': { col: 'bonus', cost: KI(1), dc: 'wis', save: 'DEX', roll: '2ma', rollNote: 'force to each creature of your choice within 10 ft (DEX save negates)',
      attacks: [['Astral Arms', '', 'force', 'wis', { kind: 'melee', monk: true, notes: 'Only while the arms are summoned: unarmed strike, reach +5 ft, WIS for attack and damage' }]],
      use: E('Arms of the Astral Self', 100, { note: 'Use WIS for STR checks/saves and arm attacks; +5 ft reach; force damage with martial arts die' }) },
    'monk:astralself:Visage of the Astral Self': { col: 'bonus', cost: KI(1), use: E('Visage of the Astral Self', 100, { note: 'Darkvision 120 ft (sees magical darkness); advantage on Insight and Intimidation; voice up to 600 ft or to one creature' }),
      passive: { effect: 'Visage of the Astral Self', sense: 'Darkvision 120 ft (magical darkness too)', skillAdv: ['Insight', 'Intimidation'] } },
    'monk:astralself:Body of the Astral Self': { acts: [
      { name: 'Deflect Energy', col: 'reaction', roll: '1d10+wis', rollNote: 'acid, cold, fire, force, lightning or thunder damage reduced', onlyWhen: { effect: 'Arms of the Astral Self' } },
      { name: 'Empowered Arms', col: FREE, roll: '1ma', rollNote: 'extra damage (once per turn, arm hit)', onlyWhen: { effect: 'Arms of the Astral Self' } }],
      text: 'Needs both arms and visage summoned' },
    'monk:astralself:Awakened Astral Self': { col: 'bonus', cost: KI(5), use: E('Awakened Astral Self', 100, { ac: 2, note: 'Arms and visage summoned; Extra Attack makes three arm attacks (Astral Barrage)' }) },

    // ---- Ascendant Dragon ----
    'monk:ascendantdragon:Draconic Disciple': { col: 'reaction', max: '1', reset: 'long', text: 'Reroll a failed CHA (Intimidation or Persuasion) check; once it turns a failure into a success, not again until a long rest. Unarmed strikes can deal acid, cold, fire, lightning or poison damage' },
    'monk:ascendantdragon:Breath of the Dragon': { col: 'action', dc: 'wis', save: 'DEX', roll: '2ma', rollNote: 'acid, cold, fire, lightning or poison; 20-ft cone or 30-ft line (half on a success)', text: 'Replaces one attack of the Attack action',
      acts: [{ name: 'Breathe again (2 ki)', col: 'action', cost: KI(2), dc: 'wis', save: 'DEX', roll: '2ma', rollNote: 'elemental (half on a success)', text: 'When you have no uses left' }] },
    'monk:ascendantdragon:Wings Unfurled': { col: FREE, use: E('Wings Unfurled', 1, { fly: 'walk', note: 'Flying speed equal to walking speed until the end of the turn' }), text: 'When you use Step of the Wind' },
    'monk:ascendantdragon:Aspect of the Wyrm': { col: 'bonus', dc: 'wis', save: 'WIS', use: E('Aspect of the Wyrm', 10, { note: '10-ft aura: Frightful Presence (WIS save or frightened 1 min) or resistance to one draconic type for you and allies' }),
      acts: [{ name: 'Again (3 ki)', col: 'bonus', cost: KI(3), use: E('Aspect of the Wyrm', 10, { note: '10-ft aura: Frightful Presence or resistance to one draconic type' }) }] },
    'monk:ascendantdragon:Ascendant Aspect': { passive: { sense: 'Blindsight 10 ft' }, acts: [
      { name: 'Augment Breath', col: FREE, cost: KI(1), dc: 'wis', save: 'DEX', roll: '3ma', rollNote: 'elemental, 60-ft cone or 90-ft line (half on a success)', text: 'When you use Breath of the Dragon' },
      { name: 'Explosive Fury', col: FREE, dc: 'wis', save: 'DEX', roll: '3d10', rollNote: 'acid, cold, fire, lightning or poison to creatures of your choice in the aura', text: 'When you activate Aspect of the Wyrm' }] }
  });

  // ---- Arcane Shot options (Arcane Archer): damage scales at 18th level ----
  const AS = (n18lo, n18hi) => `{tier(fighter,1,${n18lo},18,${n18hi})}d6`;
  const ASC = { from: 'Arcane Shot', n: 1 };
  setOpt('arcaneShot', 'Banishing Arrow', { col: FREE, cost: ASC, dc: 'int', save: 'CHA', text: 'Fail: banished to the Feywild until the end of its next turn (incapacitated). At 18th level: +2d6 force damage' });
  setOpt('arcaneShot', 'Beguiling Arrow', { col: FREE, cost: ASC, dc: 'int', save: 'WIS', roll: AS(2, 4), rollNote: 'psychic', text: 'Fail: charmed by one ally of yours within 30 ft of it until the start of your next turn' });
  setOpt('arcaneShot', 'Bursting Arrow', { col: FREE, cost: ASC, dc: false, roll: AS(2, 4), rollNote: 'force to each creature within 10 ft of the target' });
  setOpt('arcaneShot', 'Enfeebling Arrow', { col: FREE, cost: ASC, dc: 'int', save: 'CON', roll: AS(2, 4), rollNote: 'necrotic', text: 'Fail: it deals half damage with weapon attacks until the start of your next turn' });
  setOpt('arcaneShot', 'Grasping Arrow', { col: FREE, cost: ASC, dc: 'int', roll: AS(2, 4), rollNote: 'poison', text: 'Speed −10 ft for 1 minute; it takes the same dice in slashing when it moves without teleporting. Athletics vs your DC to remove the brambles' });
  setOpt('arcaneShot', 'Piercing Arrow', { col: FREE, cost: ASC, dc: 'int', save: 'DEX', roll: `{tier(fighter,1,1,18,2)}d6`, rollNote: 'extra piercing to each creature in the 30-ft line, plus the arrow’s damage (half on a success)' });
  setOpt('arcaneShot', 'Seeking Arrow', { col: FREE, cost: ASC, dc: 'int', save: 'DEX', roll: `{tier(fighter,1,1,18,2)}d6`, rollNote: 'force, plus the arrow’s damage (half on a success); ignores cover' });
  setOpt('arcaneShot', 'Shadow Arrow', { col: FREE, cost: ASC, dc: 'int', save: 'WIS', roll: AS(2, 4), rollNote: 'psychic', text: 'Fail: it can’t see beyond 5 ft until the start of your next turn' });

  // ---- Runes (Rune Knight): each invoked once per short rest, twice from 15th (Master of Runes); DC 8 + prof + CON ----
  const RU = { max: 'tier(fighter,1,1,15,2)', reset: 'short' };
  setOpt('rune', 'Cloud Rune', Object.assign({}, RU, { col: 'reaction', passive: { skillAdv: ['Sleight of Hand', 'Deception'] },
    text: 'When a creature you can see within 30 ft is hit by an attack: choose a different creature within 30 ft of you (not the attacker) to be the target instead' }));
  setOpt('rune', 'Fire Rune', Object.assign({}, RU, { col: FREE, dc: 'con', save: 'STR', roll: '2d6', rollNote: 'extra fire damage on the hit',
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
