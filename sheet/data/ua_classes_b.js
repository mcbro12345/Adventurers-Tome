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
