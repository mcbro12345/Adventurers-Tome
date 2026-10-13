// Spells: name|level|school|time|range|components|duration|flags(c=concentration r=ritual)|classes|summary|source
// classes: A artificer, B bard, C cleric, D druid, P paladin, R ranger, S sorcerer, K warlock, W wizard
DND.spellText = `
Acid Splash|0|Con|A|60 ft|VS|Instantaneous||ASW|1d6 acid to one or two adjacent creatures, DEX save negates|PHB
Blade Ward|0|Abj|A|Self|VS|1 round||BKSW|Resistance to bludgeoning, piercing and slashing from weapon attacks|PHB
Booming Blade|0|Evo|A|Self (5 ft)|SM|1 round||AKSW|Melee weapon attack; if the target moves before your next turn it takes 1d8 thunder (more at 5th level)|TCE
Chill Touch|0|Nec|A|120 ft|VS|1 round||KSW|Ranged spell attack, 1d10 necrotic; target can't regain HP until your next turn|PHB
Control Flames|0|Tra|A|60 ft|S|Instantaneous||DSW|Shape, extend or extinguish nonmagical flames|XGE
Create Bonfire|0|Con|A|60 ft|VS|1 minute|c|ADKSW|Bonfire: 1d8 fire, DEX save negates|XGE
Dancing Lights|0|Evo|A|120 ft|VSM|1 minute|c|ABSW|Create up to four floating lights|PHB
Druidcraft|0|Tra|A|30 ft|VS|Instantaneous||D|Minor nature effects: predict weather, bloom flowers, sensory effects|PHB
Eldritch Blast|0|Evo|A|120 ft|VS|Instantaneous||K|Ranged spell attack, 1d10 force per beam (2 beams at 5th, 3 at 11th, 4 at 17th)|PHB
Fire Bolt|0|Evo|A|120 ft|VS|Instantaneous||ASW|Ranged spell attack, 1d10 fire; ignites objects|PHB
Friends|0|Enc|A|Self|SM|1 minute|c|BKSW|Advantage on CHA checks against one creature; it becomes hostile afterward|PHB
Frostbite|0|Evo|A|60 ft|VS|Instantaneous||ADKSW|1d6 cold, CON save; disadvantage on its next weapon attack|XGE
Green-Flame Blade|0|Evo|A|Self (5 ft)|SM|Instantaneous||AKSW|Melee weapon attack; fire leaps to a second creature for your spellcasting modifier|TCE
Guidance|0|Div|A|Touch|VS|1 minute|c|ACD|Target adds 1d4 to one ability check|PHB
Gust|0|Tra|A|30 ft|VS|Instantaneous||DSW|Push a creature 5 ft (STR save) or move a small object|XGE
Infestation|0|Con|A|30 ft|VSM|Instantaneous||DKSW|1d6 poison, CON save; target moves 5 ft randomly|XGE
Light|0|Evo|A|Touch|VM|1 hour||ABCSW|Object sheds bright light 20 ft|PHB
Lightning Lure|0|Evo|A|Self (15 ft)|V|Instantaneous||AKSW|Pull a creature 10 ft (STR save); 1d8 lightning if it ends within 5 ft|TCE
Mage Hand|0|Con|A|30 ft|VS|1 minute||ABKSW|Spectral hand manipulates objects up to 10 lb|PHB
Magic Stone|0|Tra|BA|Touch|VS|1 minute||ADK|Three pebbles: spell attack, 1d6 + spellcasting modifier bludgeoning|XGE
Mending|0|Tra|1m|Touch|VSM|Instantaneous||ABCDSW|Repair a single break or tear|PHB
Message|0|Tra|A|120 ft|VSM|1 round||ABSW|Whisper a message and hear the reply|PHB
Mind Sliver|0|Enc|A|60 ft|V|1 round||KSW|1d6 psychic, INT save; subtract 1d4 from its next save|TCE
Minor Illusion|0|Ill|A|30 ft|SM|1 minute||BKSW|Create a sound or image of an object|PHB
Mold Earth|0|Tra|A|30 ft|S|Instantaneous||DSW|Excavate, shape or mark loose earth|XGE
Poison Spray|0|Con|A|10 ft|VS|Instantaneous||ADKSW|1d12 poison, CON save negates|PHB
Prestidigitation|0|Tra|A|10 ft|VS|1 hour||ABKSW|Minor magical tricks|PHB
Primal Savagery|0|Tra|A|Self|S|Instantaneous||D|Melee spell attack, 1d10 acid|XGE
Produce Flame|0|Con|A|Self|VS|10 minutes||D|Light, or throw: ranged spell attack, 1d8 fire|PHB
Ray of Frost|0|Evo|A|60 ft|VS|Instantaneous||ASW|Ranged spell attack, 1d8 cold; speed −10 ft|PHB
Resistance|0|Abj|A|Touch|VSM|1 minute|c|ACD|Target adds 1d4 to one saving throw|PHB
Sacred Flame|0|Evo|A|60 ft|VS|Instantaneous||C|1d8 radiant, DEX save negates; ignores cover|PHB
Shape Water|0|Tra|A|30 ft|S|Instantaneous||DSW|Move, shape, color or freeze water|XGE
Shillelagh|0|Tra|BA|Touch|VSM|1 minute||D|Club or quarterstaff uses WIS and deals 1d8|PHB
Shocking Grasp|0|Evo|A|Touch|VS|Instantaneous||ASW|Melee spell attack, 1d8 lightning; no reactions; advantage vs metal armor|PHB
Spare the Dying|0|Nec|A|Touch|VS|Instantaneous||AC|Stabilize a creature at 0 HP|PHB
Sword Burst|0|Con|A|Self (5 ft)|V|Instantaneous||AKSW|1d6 force to each creature within 5 ft, DEX save negates|TCE
Thaumaturgy|0|Tra|A|30 ft|V|1 minute||C|Minor wonders: booming voice, tremors, flickering flames|PHB
Thorn Whip|0|Tra|A|30 ft|VSM|Instantaneous||AD|Melee spell attack, 1d6 piercing; pull 10 ft|PHB
Thunderclap|0|Evo|A|Self (5 ft)|S|Instantaneous||ABDKSW|1d6 thunder to each creature within 5 ft, CON save negates|XGE
Toll the Dead|0|Nec|A|60 ft|VS|Instantaneous||CKW|1d8 necrotic (1d12 if damaged), WIS save negates|XGE
True Strike|0|Div|A|30 ft|S|1 round|c|BKSW|Advantage on your first attack against the target next turn|PHB
Vicious Mockery|0|Enc|A|60 ft|V|Instantaneous||B|1d4 psychic, WIS save; disadvantage on its next attack|PHB
Word of Radiance|0|Evo|A|5 ft|VM|Instantaneous||C|1d6 radiant to chosen creatures within 5 ft, CON save negates|XGE
Absorb Elements|1|Abj|R|Self|S|1 round||ADRSW|Resistance to the triggering elemental damage; next melee hit +1d6 of that type|XGE
Alarm|1|Abj|1m|30 ft|VSM|8 hours|r|ARW|Ward an area to alert you to intruders|PHB
Animal Friendship|1|Enc|A|30 ft|VSM|24 hours||BDR|Charm a beast, WIS save|PHB
Armor of Agathys|1|Abj|A|Self|VSM|1 hour||K|5 temp HP; melee attackers take 5 cold while it lasts|PHB
Arms of Hadar|1|Con|A|Self (10 ft)|VS|Instantaneous||K|2d6 necrotic, STR save half; no reactions on a fail|PHB
Bane|1|Enc|A|30 ft|VSM|1 minute|c|BC|Up to three creatures subtract 1d4 from attacks and saves, CHA save|PHB
Beast Bond|1|Div|A|Touch|VSM|10 minutes|c|DR|Telepathic link with a friendly beast|XGE
Bless|1|Enc|A|30 ft|VSM|1 minute|c|CP|Up to three creatures add 1d4 to attacks and saves|PHB
Burning Hands|1|Evo|A|Self (15 ft cone)|VS|Instantaneous||SW|3d6 fire, DEX save half|PHB
Catapult|1|Tra|A|60 ft|S|Instantaneous||ASW|Hurl an object: 3d8 bludgeoning, DEX save negates|XGE
Cause Fear|1|Nec|A|60 ft|V|1 minute|c|KW|Frighten a creature, WIS save|XGE
Ceremony|1|Abj|1h|Touch|VSM|Instantaneous|r|CP|Perform a religious rite (atonement, bless water, wedding and more)|XGE
Chaos Bolt|1|Evo|A|120 ft|VS|Instantaneous||S|Ranged spell attack, 2d8 + 1d6 random type; can leap on doubles|XGE
Charm Person|1|Enc|A|30 ft|VS|1 hour||BDKSW|Charm a humanoid, WIS save|PHB
Chromatic Orb|1|Evo|A|90 ft|VSM|Instantaneous||SW|Ranged spell attack, 3d8 of a chosen element|PHB
Color Spray|1|Ill|A|Self (15 ft cone)|VSM|1 round||BSW|Blind 6d10 HP worth of creatures|PHB
Command|1|Enc|A|60 ft|V|1 round||CP|One-word command, WIS save|PHB
Compelled Duel|1|Enc|BA|30 ft|V|1 minute|c|P|Target has disadvantage attacking others and must stay near you, WIS save|PHB
Comprehend Languages|1|Div|A|Self|VSM|1 hour|r|BKSW|Understand any spoken or written language|PHB
Create or Destroy Water|1|Tra|A|30 ft|VSM|Instantaneous||CD|Create or destroy up to 10 gallons of water|PHB
Cure Wounds|1|Evo|A|Touch|VS|Instantaneous||ABCDPR|Heal 1d8 + spellcasting modifier|PHB
Detect Evil and Good|1|Div|A|Self|VS|10 minutes|c|CP|Sense aberrations, celestials, elementals, fey, fiends and undead within 30 ft|PHB
Detect Magic|1|Div|A|Self|VS|10 minutes|cr|ABCDPRSW|Sense magic within 30 ft|PHB
Detect Poison and Disease|1|Div|A|Self|VSM|10 minutes|cr|ACDPR|Sense poisons and diseases within 30 ft|PHB
Disguise Self|1|Ill|A|Self|VS|1 hour||ABSW|Change your appearance|PHB
Dissonant Whispers|1|Enc|A|60 ft|V|Instantaneous||B|3d6 psychic, WIS save half; target flees on a fail|PHB
Divine Favor|1|Evo|BA|Self|VS|1 minute|c|P|Weapon attacks deal +1d4 radiant|PHB
Earth Tremor|1|Evo|A|Self (10 ft)|VS|Instantaneous||BDSW|1d6 bludgeoning and prone, DEX save|XGE
Ensnaring Strike|1|Con|BA|Self|V|1 minute|c|R|Next hit restrains the target (STR save); 1d6 piercing each turn|PHB
Entangle|1|Con|A|90 ft|VS|1 minute|c|D|Plants restrain creatures in a 20 ft square, STR save|PHB
Expeditious Retreat|1|Tra|BA|Self|VS|10 minutes|c|AKSW|Dash as a bonus action each turn|PHB
Faerie Fire|1|Evo|A|60 ft|V|1 minute|c|ABD|Outline creatures in light; attacks against them have advantage, DEX save|PHB
False Life|1|Nec|A|Self|VSM|1 hour||ASW|Gain 1d4 + 4 temporary HP|PHB
Feather Fall|1|Tra|R|60 ft|VM|1 minute||ABSW|Up to five falling creatures descend slowly|PHB
Find Familiar|1|Con|1h|10 ft|VSM|Instantaneous|r|W|Summon a familiar spirit|PHB
Fog Cloud|1|Con|A|120 ft|VS|1 hour|c|DRSW|20 ft radius sphere of heavy obscurement|PHB
Goodberry|1|Tra|A|Touch|VSM|Instantaneous||DR|Ten berries that each heal 1 HP and nourish|PHB
Grease|1|Con|A|60 ft|VSM|1 minute||AW|Slick 10 ft square; DEX save or fall prone|PHB
Guiding Bolt|1|Evo|A|120 ft|VS|1 round||C|Ranged spell attack, 4d6 radiant; next attack against it has advantage|PHB
Hail of Thorns|1|Con|BA|Self|V|1 minute|c|R|Next ranged hit explodes: 1d10 piercing, DEX save half|PHB
Healing Word|1|Evo|BA|60 ft|V|Instantaneous||ABCD|Heal 1d4 + spellcasting modifier|PHB
Hellish Rebuke|1|Evo|R|60 ft|VS|Instantaneous||K|2d10 fire to a creature that damaged you, DEX save half|PHB
Heroism|1|Enc|A|Touch|VS|1 minute|c|BP|Immune to fear; temp HP each turn equal to your modifier|PHB
Hex|1|Enc|BA|90 ft|VSM|1 hour|c|K|+1d6 necrotic on your hits; disadvantage on one ability's checks|PHB
Hunter's Mark|1|Div|BA|90 ft|V|1 hour|c|R|+1d6 damage on your weapon hits; advantage to track|PHB
Ice Knife|1|Con|A|60 ft|SM|Instantaneous||DSW|Ranged spell attack, 1d10 piercing; then 2d6 cold explosion, DEX save|XGE
Identify|1|Div|1m|Touch|VSM|Instantaneous|r|ABW|Learn a magic item's properties|PHB
Illusory Script|1|Ill|1m|Touch|SM|10 days|r|BKW|Write a secret message only chosen creatures can read|PHB
Inflict Wounds|1|Nec|A|Touch|VS|Instantaneous||C|Melee spell attack, 3d10 necrotic|PHB
Jump|1|Tra|A|Touch|VSM|1 minute||ADRSW|Triple jump distance|PHB
Longstrider|1|Tra|A|Touch|VSM|1 hour||ABDRW|+10 ft speed|PHB
Mage Armor|1|Abj|A|Touch|VSM|8 hours||SW|AC becomes 13 + DEX without armor|PHB
Magic Missile|1|Evo|A|120 ft|VS|Instantaneous||SW|Three darts, each 1d4 + 1 force, always hit|PHB
Nathair's Mischief|2|Ill|A|60 ft|SM|1 minute|c|ABSW|Fey illusion cube: charm, blind or difficult terrain effects|FTD
Protection from Evil and Good|1|Abj|A|Touch|VSM|10 minutes|c|CKPW|Protection from aberrations, celestials, elementals, fey, fiends and undead|PHB
Purify Food and Drink|1|Tra|A|10 ft|VS|Instantaneous|r|ACDP|Remove poison and disease from food and drink|PHB
Ray of Sickness|1|Nec|A|60 ft|VS|Instantaneous||SW|Ranged spell attack, 2d8 poison; poisoned (CON save)|PHB
Sanctuary|1|Abj|BA|30 ft|VSM|1 minute||AC|Attackers must make a WIS save or pick another target|PHB
Searing Smite|1|Evo|BA|Self|V|1 minute|c|P|Next hit +1d6 fire; target burns 1d6 each turn until a CON save|PHB
Shield|1|Abj|R|Self|VS|1 round||SW|+5 AC until your next turn; immune to magic missile|PHB
Shield of Faith|1|Abj|BA|60 ft|VSM|10 minutes|c|CP|+2 AC|PHB
Silent Image|1|Ill|A|60 ft|VSM|10 minutes|c|BSW|Visual illusion up to a 15 ft cube|PHB
Sleep|1|Enc|A|90 ft|VSM|1 minute||BSW|Put 5d8 HP of creatures to sleep|PHB
Snare|1|Abj|1m|Touch|SM|8 hours||ADRW|Magical trap that hoists a creature (DEX save)|XGE
Speak with Animals|1|Div|A|Self|VS|10 minutes|r|BDR|Talk with beasts|PHB
Tasha's Caustic Brew|1|Evo|A|Self (30 ft line)|VSM|1 minute|c|ASW|Acid coats creatures: 2d4 acid each turn, DEX save|TCE
Tasha's Hideous Laughter|1|Enc|A|30 ft|VSM|1 minute|c|BW|Target falls prone laughing, incapacitated, WIS save|PHB
Tenser's Floating Disk|1|Con|A|30 ft|VSM|1 hour|r|W|Floating disk carries 500 lb|PHB
Thunderous Smite|1|Evo|BA|Self|V|1 minute|c|P|Next melee hit +2d6 thunder; push 10 ft and prone (STR save)|PHB
Thunderwave|1|Evo|A|Self (15 ft cube)|VS|Instantaneous||ABDSW|2d8 thunder and push 10 ft, CON save half|PHB
Unseen Servant|1|Con|A|60 ft|VSM|1 hour|r|BKW|Invisible force performs simple tasks|PHB
Witch Bolt|1|Evo|A|30 ft|VSM|1 minute|c|KSW|Ranged spell attack, 1d12 lightning; repeat as an action|PHB
Wrathful Smite|1|Evo|BA|Self|V|1 minute|c|P|Next melee hit +1d6 psychic; frightened (WIS save)|PHB
Zephyr Strike|1|Tra|BA|Self|V|1 minute|c|R|Move without provoking; one attack with advantage and +1d8 force|XGE
Aganazzar's Scorcher|2|Evo|A|30 ft line|VSM|Instantaneous||SW|3d8 fire in a line, DEX save half|XGE
Aid|2|Abj|A|30 ft|VSM|8 hours||ACP|Up to three creatures gain +5 max and current HP|PHB
Alter Self|2|Tra|A|Self|VS|1 hour|c|ASW|Aquatic adaptation, change appearance, or natural weapons|PHB
Animal Messenger|2|Enc|A|30 ft|VSM|24 hours|r|BDR|A Tiny beast delivers a message|PHB
Arcane Lock|2|Abj|A|Touch|VSM|Until dispelled||AW|Magically lock a door or container|PHB
Augury|2|Div|1m|Self|VSM|Instantaneous|r|C|Omen of weal or woe for a plan in the next 30 minutes|PHB
Barkskin|2|Tra|A|Touch|VSM|1 hour|c|DR|Target's AC can't be lower than 16|PHB
Beast Sense|2|Div|A|Touch|S|1 hour|cr|DR|See and hear through a beast's senses|PHB
Blindness/Deafness|2|Nec|A|30 ft|V|1 minute||BCSW|Blind or deafen a creature, CON save|PHB
Blur|2|Ill|A|Self|V|1 minute|c|ASW|Attacks against you have disadvantage|PHB
Branding Smite|2|Evo|BA|Self|V|1 minute|c|P|Next weapon hit +2d6 radiant; target visible|PHB
Calm Emotions|2|Enc|A|60 ft|VS|1 minute|c|BC|Suppress charm, fear or hostility, CHA save|PHB
Cloud of Daggers|2|Con|A|60 ft|VSM|1 minute|c|BKSW|5 ft cube of daggers, 4d4 slashing|PHB
Continual Flame|2|Evo|A|Touch|VSM|Until dispelled||ACW|Permanent heatless flame|PHB
Cordon of Arrows|2|Tra|A|5 ft|VSM|8 hours||R|Arrows guard an area: 1d6 piercing, DEX save|PHB
Crown of Madness|2|Enc|A|120 ft|VS|1 minute|c|BKSW|Charm a humanoid into attacking others, WIS save|PHB
Darkness|2|Evo|A|60 ft|VM|10 minutes|c|KSW|15 ft sphere of magical darkness|PHB
Darkvision|2|Tra|A|Touch|VSM|8 hours||ADRSW|Darkvision 60 ft|PHB
Detect Thoughts|2|Div|A|Self|VSM|1 minute|c|BSW|Read surface thoughts, WIS save to probe deeper|PHB
Dragon's Breath|2|Tra|BA|Touch|VSM|1 minute|c|ASW|Target can exhale 3d6 elemental breath, DEX save half|XGE
Dust Devil|2|Con|A|60 ft|VSM|1 minute|c|DSW|Whirlwind deals 1d8 bludgeoning and pushes, STR save|XGE
Earthbind|2|Tra|A|300 ft|V|1 minute|c|DKSW|Flying creature's speed becomes 0 and it descends, STR save|XGE
Enhance Ability|2|Tra|A|Touch|VSM|1 hour|c|ABCDS|Advantage on checks with one ability, plus a bonus effect|PHB
Enlarge/Reduce|2|Tra|A|30 ft|VSM|1 minute|c|ASW|Grow (+1d4 damage) or shrink (−1d4) a creature, CON save|PHB
Enthrall|2|Enc|A|60 ft|VS|1 minute||BK|Creatures have disadvantage on Perception vs others, WIS save|PHB
Find Steed|2|Con|10m|30 ft|VS|Instantaneous||P|Summon an intelligent loyal steed|PHB
Find Traps|2|Div|A|120 ft|VS|Instantaneous||CDR|Sense traps within line of sight|PHB
Flame Blade|2|Evo|BA|Self|VSM|10 minutes|c|D|Fiery blade: melee spell attack 3d6 fire|PHB
Flaming Sphere|2|Con|A|60 ft|VSM|1 minute|c|DW|Rolling sphere, 2d6 fire, DEX save half|PHB
Gentle Repose|2|Nec|A|Touch|VSM|10 days|r|ACPW|Preserve a corpse from decay and undeath|PHB
Gust of Wind|2|Evo|A|Self (60 ft line)|VSM|1 minute|c|DSW|Strong wind pushes creatures 15 ft, STR save|PHB
Healing Spirit|2|Con|BA|60 ft|VS|1 minute|c|DR|Spirit heals 1d6 to creatures that enter its space|XGE
Heat Metal|2|Tra|A|60 ft|VSM|1 minute|c|ABD|Metal object glows red-hot: 2d8 fire each turn|PHB
Hold Person|2|Enc|A|60 ft|VSM|1 minute|c|BCDKSW|Paralyze a humanoid, WIS save|PHB
Invisibility|2|Ill|A|Touch|VSM|1 hour|c|ABKSW|Target becomes invisible until it attacks or casts|PHB
Knock|2|Tra|A|60 ft|V|Instantaneous||BSW|Unlock a door or container (loud)|PHB
Lesser Restoration|2|Abj|A|Touch|VS|Instantaneous||ABCDPR|End blinded, deafened, paralyzed, poisoned or a disease|PHB
Levitate|2|Tra|A|60 ft|VSM|10 minutes|c|ASW|Float a creature or object up to 20 ft, CON save|PHB
Locate Animals or Plants|2|Div|A|Self|VSM|Instantaneous|r|BDR|Find the nearest beast or plant of a kind within 5 miles|PHB
Locate Object|2|Div|A|Self|VSM|10 minutes|c|BCDPRW|Sense the direction of a known object within 1,000 ft|PHB
Magic Mouth|2|Ill|1m|30 ft|VSM|Until dispelled|r|ABW|Object speaks a message when triggered|PHB
Magic Weapon|2|Tra|BA|Touch|VS|1 hour|c|APW|Weapon becomes +1|PHB
Maximilian's Earthen Grasp|2|Tra|A|30 ft|VSM|1 minute|c|SW|Earthen hand restrains, 2d6 bludgeoning, STR save|XGE
Melf's Acid Arrow|2|Evo|A|90 ft|VSM|Instantaneous||AW|Ranged spell attack, 4d4 acid now and 2d4 next turn|PHB
Mind Spike|2|Div|A|60 ft|S|1 hour|c|KSW|3d8 psychic, WIS save half; you track the target|XGE
Mirror Image|2|Ill|A|Self|VS|1 minute||KSW|Three illusory duplicates absorb attacks|PHB
Misty Step|2|Con|BA|Self|V|Instantaneous||KSW|Teleport up to 30 ft|PHB
Moonbeam|2|Evo|A|120 ft|VSM|1 minute|c|D|Beam of light: 2d10 radiant, CON save half|PHB
Nystul's Magic Aura|2|Ill|A|Touch|VSM|24 hours||W|Disguise a creature's or object's magical aura|PHB
Pass without Trace|2|Abj|A|Self|VSM|1 hour|c|DR|You and allies within 30 ft gain +10 Stealth|PHB
Phantasmal Force|2|Ill|A|60 ft|VSM|1 minute|c|BKSW|Illusion only the target perceives; 1d6 psychic, INT save|PHB
Prayer of Healing|2|Evo|10m|30 ft|V|Instantaneous||C|Up to six creatures heal 2d8 + spellcasting modifier|PHB
Protection from Poison|2|Abj|A|Touch|VS|1 hour||ACDPR|Neutralize poison; advantage and resistance vs poison|PHB
Pyrotechnics|2|Tra|A|60 ft|VS|Instantaneous||ABSW|Turn a fire into fireworks (blind) or smoke|XGE
Ray of Enfeeblement|2|Nec|A|60 ft|VS|1 minute|c|KW|Ranged spell attack; target deals half damage with STR weapons|PHB
Rime's Binding Ice|2|Evo|A|Self (30 ft cone)|SM|Instantaneous||SW|3d8 cold, CON save half; speed 0 on a fail|FTD
Rope Trick|2|Tra|A|Touch|VSM|1 hour||W|Extradimensional hideout up a rope|PHB
Scorching Ray|2|Evo|A|120 ft|VS|Instantaneous||SW|Three rays, ranged spell attack, 2d6 fire each|PHB
See Invisibility|2|Div|A|Self|VSM|1 hour||ABSW|See invisible and ethereal creatures|PHB
Shadow Blade|2|Ill|BA|Self|VS|1 minute|c|KSW|Shadow sword: 2d8 psychic, finesse, light, thrown|XGE
Shatter|2|Evo|A|60 ft|VSM|Instantaneous||BKSW|3d8 thunder in a 10 ft sphere, CON save half|PHB
Silence|2|Ill|A|120 ft|VS|10 minutes|cr|BCR|20 ft sphere of silence|PHB
Skywrite|2|Tra|A|Sight|VS|1 hour|cr|ABDW|Write words in the clouds|XGE
Snilloc's Snowball Swarm|2|Evo|A|90 ft|VSM|Instantaneous||SW|3d6 cold in a 5 ft sphere, DEX save half|XGE
Spider Climb|2|Tra|A|Touch|VSM|1 hour|c|AKSW|Climb walls and ceilings|PHB
Spike Growth|2|Tra|A|150 ft|VSM|10 minutes|c|DR|Thorny ground: 2d4 piercing per 5 ft moved|PHB
Spiritual Weapon|2|Evo|BA|60 ft|VS|1 minute||C|Floating weapon: bonus-action melee spell attack, 1d8 + modifier force|PHB
Suggestion|2|Enc|A|30 ft|VM|8 hours|c|BKSW|Suggest a reasonable course of action, WIS save|PHB
Summon Beast|2|Con|A|90 ft|VSM|1 hour|c|DR|Summon a bestial spirit (air, land or water)|TCE
Tasha's Mind Whip|2|Enc|A|90 ft|V|1 round||SW|3d6 psychic, INT save half; limits its next turn|TCE
Warding Bond|2|Abj|A|Touch|VSM|1 hour||CP|Target gains +1 AC and saves and resistance; you share its damage|PHB
Warding Wind|2|Evo|A|Self|V|10 minutes|c|BDSW|Strong wind around you: deafens, disadvantage on ranged attacks|XGE
Web|2|Con|A|60 ft|VSM|1 hour|c|ASW|Sticky webs restrain creatures, DEX save|PHB
Zone of Truth|2|Enc|A|60 ft|VS|10 minutes||BCP|Creatures can't lie in a 15 ft sphere, CHA save|PHB
Animate Dead|3|Nec|1m|10 ft|VSM|Instantaneous||CW|Raise a skeleton or zombie servant|PHB
Ashardalon's Stride|3|Tra|BA|Self|VS|1 minute|c|ARSW|+20 ft speed; 1d6 fire to creatures you move near|FTD
Aura of Vitality|3|Evo|A|Self (30 ft)|V|1 minute|c|CDP|Bonus action each turn: heal a creature in the aura 2d6|PHB
Beacon of Hope|3|Abj|A|30 ft|VS|1 minute|c|C|Advantage on WIS and death saves; healing is maximized|PHB
Bestow Curse|3|Nec|A|Touch|VS|1 minute|c|BCW|Curse a creature (disadvantage, +1d8 necrotic, or lost actions), WIS save|PHB
Blinding Smite|3|Evo|BA|Self|V|1 minute|c|P|Next melee hit +3d8 radiant; blinded (CON save)|PHB
Blink|3|Tra|A|Self|VS|1 minute||ASW|Roll each turn to vanish into the Ethereal Plane|PHB
Call Lightning|3|Con|A|120 ft|VS|10 minutes|c|D|Storm cloud: each turn call a bolt for 3d10 lightning, DEX save half|PHB
Catnap|3|Enc|A|30 ft|SM|10 minutes||ABSW|Up to three creatures gain a short rest in 10 minutes|XGE
Clairvoyance|3|Div|10m|1 mile|VSM|10 minutes|c|BCSW|Invisible sensor to see or hear a distant place|PHB
Conjure Animals|3|Con|A|60 ft|VS|1 hour|c|DR|Summon fey spirits as beasts|PHB
Conjure Barrage|3|Con|A|Self (60 ft cone)|VSM|Instantaneous||R|Copies of a weapon deal 3d8, DEX save half|PHB
Counterspell|3|Abj|R|60 ft|S|Instantaneous||KSW|Interrupt a spell; higher levels need a check|PHB
Create Food and Water|3|Con|A|30 ft|VS|Instantaneous||CP|Food and water for 15 creatures for a day|PHB
Crusader's Mantle|3|Evo|A|Self|V|1 minute|c|P|Allies within 30 ft deal +1d4 radiant with weapons|PHB
Daylight|3|Evo|A|60 ft|VS|1 hour||CDPRS|60 ft sphere of bright light|PHB
Dispel Magic|3|Abj|A|120 ft|VS|Instantaneous||ABCDKPSW|End spells of 3rd level or lower (check for higher)|PHB
Elemental Weapon|3|Tra|A|Touch|VS|1 hour|c|ADP|Weapon gains +1 and +1d4 elemental damage|PHB
Enemies Abound|3|Enc|A|120 ft|VS|1 minute|c|BKSW|Target treats everyone as an enemy, INT save|XGE
Erupting Earth|3|Tra|A|120 ft|VSM|Instantaneous||DSW|3d12 bludgeoning in a 20 ft cube, DEX save half|XGE
Fear|3|Ill|A|Self (30 ft cone)|VSM|1 minute|c|BKSW|Creatures drop items and flee, WIS save|PHB
Feign Death|3|Nec|A|Touch|VSM|1 hour|r|BCDW|Willing creature appears dead|PHB
Fireball|3|Evo|A|150 ft|VSM|Instantaneous||SW|8d6 fire in a 20 ft sphere, DEX save half|PHB
Flame Arrows|3|Tra|A|Touch|VS|1 hour|c|ADRSW|Ammunition deals +1d6 fire|XGE
Fly|3|Tra|A|Touch|VSM|10 minutes|c|AKSW|Target gains 60 ft flying speed|PHB
Gaseous Form|3|Tra|A|Touch|VSM|1 hour|c|KSW|Turn a creature into mist|PHB
Glyph of Warding|3|Abj|1h|Touch|VSM|Until dispelled||ABCW|Magical trap: 5d8 explosion (DEX half) or stored spell|PHB
Haste|3|Tra|A|30 ft|VSM|1 minute|c|ASW|+2 AC, double speed, extra limited action; lethargy after|PHB
Hunger of Hadar|3|Con|A|150 ft|VSM|1 minute|c|K|Void: blinded, 2d6 cold at start and 2d6 acid at end of turns|PHB
Hypnotic Pattern|3|Ill|A|120 ft|SM|1 minute|c|BKSW|Charm and incapacitate creatures in a 30 ft cube, WIS save|PHB
Intellect Fortress|3|Abj|A|30 ft|V|1 hour|c|ABKSW|Resistance to psychic and advantage on INT, WIS, CHA saves|TCE
Leomund's Tiny Hut|3|Evo|1m|Self (10 ft)|VSM|8 hours|r|BW|Dome shelter that keeps others out|PHB
Life Transference|3|Nec|A|30 ft|VS|Instantaneous||CW|Take 4d8 necrotic; a creature heals twice that|XGE
Lightning Arrow|3|Tra|BA|Self|VS|1 minute|c|R|Next ranged attack becomes lightning: 4d8, plus 2d8 burst|PHB
Lightning Bolt|3|Evo|A|Self (100 ft line)|VSM|Instantaneous||SW|8d6 lightning in a line, DEX save half|PHB
Magic Circle|3|Abj|1m|10 ft|VSM|1 hour||CKPW|Cylinder that hinders a creature type|PHB
Major Image|3|Ill|A|120 ft|VSM|10 minutes|c|BKSW|Full sensory illusion up to a 20 ft cube|PHB
Mass Healing Word|3|Evo|BA|60 ft|V|Instantaneous||BC|Up to six creatures heal 1d4 + spellcasting modifier|PHB
Meld into Stone|3|Tra|A|Touch|VS|8 hours|r|CDR|Step into stone|PHB
Melf's Minute Meteors|3|Evo|A|Self|VSM|10 minutes|c|SW|Six meteors: bonus action to send two, 2d6 fire each, DEX save half|XGE
Nondetection|3|Abj|A|Touch|VSM|8 hours||BRW|Hide a target from divination|PHB
Phantom Steed|3|Ill|1m|30 ft|VS|1 hour|r|W|Quasi-real horse with 100 ft speed|PHB
Plant Growth|3|Tra|A|150 ft|VS|Instantaneous||BDR|Overgrowth difficult terrain or enrich crops|PHB
Protection from Energy|3|Abj|A|Touch|VS|1 hour|c|ACDRSW|Resistance to one energy type|PHB
Remove Curse|3|Abj|A|Touch|VS|Instantaneous||CKPW|End curses on a creature or object|PHB
Revivify|3|Nec|A|Touch|VSM|Instantaneous||ACDPR|Return a creature dead under a minute to 1 HP (300 gp diamonds)|PHB
Sending|3|Evo|A|Unlimited|VSM|1 round||BCW|Send a 25-word message to a known creature|PHB
Sleet Storm|3|Con|A|150 ft|VSM|1 minute|c|DSW|Freezing sleet: difficult terrain, prone, concentration checks|PHB
Slow|3|Tra|A|120 ft|VSM|1 minute|c|SW|Up to six creatures: −2 AC and DEX saves, half speed, fewer actions, WIS save|PHB
Speak with Dead|3|Nec|A|10 ft|VSM|10 minutes||BCW|Ask a corpse five questions|PHB
Speak with Plants|3|Tra|A|Self|VS|10 minutes||BDR|Talk with plants|PHB
Spirit Guardians|3|Con|A|Self (15 ft)|VSM|10 minutes|c|C|Spirits slow enemies and deal 3d8 radiant or necrotic, WIS save half|PHB
Spirit Shroud|3|Nec|BA|Self|VS|1 minute|c|CKPW|Your hits deal +1d8 radiant, necrotic or cold; nearby foes slowed|TCE
Stinking Cloud|3|Con|A|90 ft|VSM|1 minute|c|BSW|Nauseating gas: lose actions, CON save|PHB
Summon Fey|3|Con|A|90 ft|VSM|1 hour|c|DKRW|Summon a fey spirit (fuming, mirthful or tricksy)|TCE
Summon Lesser Demons|3|Con|A|60 ft|VSM|1 hour|c|KW|Summon hostile demons|XGE
Summon Shadowspawn|3|Con|A|90 ft|VSM|1 hour|c|KW|Summon a shadow spirit (fury, despair or fear)|TCE
Summon Undead|3|Nec|A|90 ft|VSM|1 hour|c|KW|Summon an undead spirit (ghostly, putrid or skeletal)|TCE
Thunder Step|3|Con|A|90 ft|V|Instantaneous||KSW|Teleport with an ally; 3d10 thunder where you left, CON save half|XGE
Tidal Wave|3|Con|A|Sight|VSM|Instantaneous||DSW|4d8 bludgeoning wave and prone, DEX save half|XGE
Tiny Servant|3|Tra|1m|Touch|VS|8 hours||AW|Animate a Tiny object as a servant|XGE
Tongues|3|Div|A|Touch|VM|1 hour||BCKSW|Understand and speak any language|PHB
Vampiric Touch|3|Nec|A|Self|VS|1 minute|c|KSW|Melee spell attack, 3d6 necrotic; heal half the damage|PHB
Wall of Sand|3|Evo|A|90 ft|VSM|10 minutes|c|W|Wall of sand blocks vision and slows|XGE
Wall of Water|3|Evo|A|60 ft|VSM|10 minutes|c|DSW|Wall of water hinders ranged attacks and fire|XGE
Water Breathing|3|Tra|A|30 ft|VSM|24 hours|r|ADRSW|Up to ten creatures breathe underwater|PHB
Water Walk|3|Tra|A|30 ft|VSM|1 hour|r|ACDRS|Walk on liquid surfaces|PHB
Wind Wall|3|Evo|A|120 ft|VSM|1 minute|c|DR|Wall of wind: 3d8 bludgeoning, STR save half; blocks missiles|PHB
`;
