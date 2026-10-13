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
