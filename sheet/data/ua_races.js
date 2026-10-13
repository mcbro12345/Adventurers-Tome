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
