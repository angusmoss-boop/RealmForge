window.RF=window.RF||{};
RF.VERSION='11.4.0';
RF.BUILD={
  version:'11.4.0',
  title:'Eightfold Dungeons',
  built:'17 Sep 2026 • 22:25 BST',
  buildId:'20260917-2225-bst'
};
RF.V114=RF.V114||{};

/* Realmforge V11.4 — Eightfold Dungeons
   - Expands the world to eight persistent 8-wave + boss dungeons.
   - Every standard combat location now has exactly eight local entity species.
   - Dungeon waves use the eight entities from that exact location, fought lowest level to highest.
   - Every dungeon has its own boss and tier-scaled equipment pool, with extra rare boss-drop chances.
   - Existing active dungeon runs and every Equipment/Tool Belt/Pack/Bank item remain untouched.
*/

(()=>{
'use strict';
const V=RF.V114;
V.version='11.4.0';
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------- Entity expansion ----------
V.addEnemy=function(id,c){
  const level=+c.level||1,armor=c.armor??Math.max(0,Math.floor((level-1)/3));
  const hp=c.hp??Math.round(24+level*10.5+armor*3.2);
  const lo=c.damage?.[0]??Math.max(2,Math.round(1.5+level*.72));
  const hi=c.damage?.[1]??Math.max(lo+2,Math.round(4+level*1.38));
  RF.DATA.enemies[id]={name:c.name,icon:c.icon,level,hp,damage:[lo,hi],armor,
    xp:c.xp??Math.round(18+level*20),gold:c.gold??[0,Math.max(2,Math.round(level*1.7))],
    temperament:c.temperament||'territorial',moves:c.moves||['bite','brace'],drops:c.drops||[],desc:c.desc||''};
};
[
['dusk_fox',{name:'Dusk Fox',icon:'🦊',level:4,armor:1,moves:['snap','circle','evade'],drops:[['raw_meat',.45,1],['lucky_charm',.025,1]],desc:'A lean fox made bold by roads and unattended packs.'}],
['briar_sprite',{name:'Briar Sprite',icon:'🧚',level:6,armor:1,moves:['cinder_touch','hex','drift'],drops:[['herb',.48,1],['ghost_orchid',.018,1]],desc:'A thorn-bright forest spirit with a malicious sense of territory.'}],
['river_leech',{name:'Silverrun Leech',icon:'🪱',level:3,armor:0,moves:['bite','grasp'],drops:[['herb',.22,1]],desc:'A hand-long river leech that strikes from reed shadows.'}],
['silver_crab',{name:'Silverbank Crab',icon:'🦀',level:4,armor:3,moves:['claw','brace'],drops:[['raw_meat',.46,1],['silver_ore',.025,1]],desc:'A bright-shelled crab from the colder gravel bars.'}],
['water_snake',{name:'Silverrun Water Snake',icon:'🐍',level:6,armor:1,moves:['bite','venom_bite','coil'],drops:[['adder_scale',.5,1],['venom_sac',.28,1]],desc:'A river snake whose bite numbs the limb before it starts to hurt.'}],
['river_stalker',{name:'Riverbank Stalker',icon:'🦎',level:8,armor:3,moves:['stone_bite','tail_sweep','circle'],drops:[['raw_meat',.55,1],['cave_chitin',.12,1]],desc:'A low-slung reptile that waits motionless beneath muddy ledges.'}],
['cave_bat',{name:'Cave Bat',icon:'🦇',level:2,armor:0,moves:['bite','wing_flurry','evade'],drops:[['raw_meat',.22,1]],desc:'A startled cave bat with absolutely no respect for personal space.'}],
['dust_rat',{name:'Dust Rat',icon:'🐀',level:3,armor:0,moves:['bite','scrabble'],drops:[['raw_meat',.38,1],['coal',.08,1]],desc:'A mine rat grey with stone dust and bad decisions.'}],
['stone_centipede',{name:'Stone Centipede',icon:'🐛',level:4,armor:2,moves:['bite','venom_bite','coil'],drops:[['cave_chitin',.58,1]],desc:'A plated centipede that nests between warm seams of rock.'}],
['tunnel_scavenger',{name:'Tunnel Scavenger',icon:'👺',level:5,armor:2,moves:['slash','dirty_trick','evade'],drops:[['iron_ore',.32,1],['bread',.08,1]],desc:'A feral tunnel-dweller that has learned the value of a dropped pick.'}],
['rock_worm',{name:'Rock Worm',icon:'🪱',level:8,armor:5,moves:['bite','stone_bite','brace'],drops:[['iron_ore',.58,2],['silver_ore',.12,1]],desc:'A thick mineral-feeding worm whose hide has hardened like shale.'}],
['pale_lurker',{name:'Pale Lurker',icon:'👹',level:8,armor:3,moves:['slash','grasp','evade'],drops:[['silver_ore',.22,1]],desc:'Something humanoid that learned to live without sunlight.'}],
['stone_ghoul',{name:'Stone Ghoul',icon:'🧟',level:9,armor:5,moves:['grasp','rend','brace'],drops:[['iron_ore',.5,1],['crypt_sigil',.025,1]],desc:'A corpse-like thing fused with mineral crust.'}],
['deepcrawler',{name:'Deep Crawler',icon:'🕷️',level:10,armor:4,moves:['bite','web','venom_bite'],drops:[['cave_chitin',.7,1],['venom_sac',.3,1]],desc:'A broad cave predator that hunts by vibration rather than sight.'}],
['deep_worm',{name:'Blackvein Worm',icon:'🪱',level:12,armor:7,moves:['stone_bite','tail_sweep','brace'],drops:[['silver_ore',.45,1],['steel_bar',.1,1]],desc:'A deep-burrowing worm whose hide carries black metallic veins.'}],
['cutpurse',{name:'Kingroad Cutpurse',icon:'🥷',level:4,armor:1,moves:['slash','dirty_trick','evade'],drops:[['lockpick',.25,1],['bandit_token',.18,1]],desc:'A petty road thief who prefers distraction to a fair fight.'}],
['road_viper',{name:'Kingroad Viper',icon:'🐍',level:5,armor:1,moves:['bite','venom_bite','coil'],drops:[['adder_scale',.55,1],['venom_sac',.22,1]],desc:'A warm-stone viper common around abandoned milestones.'}],
['highwayman',{name:'Blackroad Highwayman',icon:'🗡️',level:6,armor:3,moves:['slash','marked_shot','dirty_trick'],drops:[['bandit_token',.42,1],['bread',.2,1]],desc:'A road robber with enough equipment to be dangerous and enough confidence to be worse.'}],
['frost_crow',{name:'Northwatch Crow',icon:'🐦‍⬛',level:6,armor:1,moves:['peck','wing_flurry','evade'],drops:[['crow_feather',.8,1],['silver_ore',.02,1]],desc:'A large black crow that follows travellers into the colder hills.'}],
['mountain_goat',{name:'Ironhorn Goat',icon:'🐐',level:8,armor:4,moves:['gore','hoof_feint','brace'],drops:[['raw_meat',.7,2],['troll_tooth',.015,1]],desc:'A territorial mountain goat with horns polished by stone.'}],
['road_warg',{name:'March Warg',icon:'🐺',level:9,armor:3,moves:['snap','hamstring','roar'],drops:[['wolf_pelt',.72,1],['wolf_fang',.5,1]],desc:'A heavy northern wolf bred by weather rather than kindness.'}],
['cliff_harrier',{name:'Cliff Harrier',icon:'🦅',level:12,armor:2,moves:['peck','marked_shot','evade'],drops:[['crow_feather',.42,2],['lucky_charm',.035,1]],desc:'A huge hill raptor that attacks from blind angles.'}],
['dust_asp',{name:'Redstone Asp',icon:'🐍',level:8,armor:2,moves:['bite','venom_bite','coil'],drops:[['adder_scale',.62,1],['venom_sac',.3,1]],desc:'A quarry snake almost perfectly coloured like red spoil.'}],
['stone_tick',{name:'Stone Tick',icon:'🪲',level:9,armor:7,moves:['bite','brace','grasp'],drops:[['cave_chitin',.75,1],['iron_ore',.22,1]],desc:'A fist-sized tick whose shell has absorbed mineral grit.'}],
['quarry_hound',{name:'Quarry Hound',icon:'🐕',level:10,armor:4,moves:['snap','hamstring','circle'],drops:[['raw_meat',.4,1],['wolf_fang',.35,1]],desc:'A half-feral work hound descended from animals left in the pits.'}],
['slate_golem',{name:'Slate Golem',icon:'🗿',level:13,armor:10,moves:['stone_guard','club','brace'],drops:[['iron_ore',.7,2],['silver_ore',.18,1]],desc:'A walking slab of quarry stone animated by old marks under the dust.'}],
['cinder_bat',{name:'Cinder Bat',icon:'🦇',level:10,armor:1,moves:['cinder_touch','wing_flurry','evade'],drops:[['ember_shard',.18,1]],desc:'A soot-black bat whose wing edges glow when angered.'}],
['lava_tick',{name:'Lava Tick',icon:'🪲',level:11,armor:7,moves:['cinder_bite','brace','grasp'],drops:[['ember_shard',.28,1],['cave_chitin',.55,1]],desc:'A heatproof parasite that feeds near magma vents.'}],
['slag_golem',{name:'Slag Golem',icon:'🗿',level:15,armor:12,moves:['stone_guard','club','ember_breath'],drops:[['ember_shard',.55,2],['steel_bar',.22,1]],desc:'A lump of furnace slag dragged upright by something inside it.'}],
['bone_rat',{name:'Bone Rat',icon:'🐀',level:6,armor:2,moves:['bite','scrabble','grasp'],drops:[['crypt_sigil',.025,1]],desc:'A crypt rat armoured in fragments it should not have learned to wear.'}],
['tomb_wisp',{name:'Tomb Wisp',icon:'👻',level:7,armor:1,moves:['wisp_burn','hex','drift'],drops:[['warding_salt',.35,1]],desc:'A cold mote that circles sealed graves and extinguishes lamps.'}],
['restless_knight',{name:'Restless Knight',icon:'🛡️',level:12,armor:8,moves:['rusted_cleave','brace','royal_gaze'],drops:[['steel_bar',.24,1],['crypt_sigil',.16,1]],desc:'An armoured corpse still standing watch after its oath lost meaning.'}],
['sepulcher_hound',{name:'Sepulcher Hound',icon:'🐕‍🦺',level:13,armor:5,moves:['snap','hamstring','hex'],drops:[['wolf_fang',.38,1],['crypt_sigil',.12,1]],desc:'A grave-fed hound that moves without making a sound.'}],
['reed_serpent',{name:'Reed Serpent',icon:'🐍',level:6,armor:1,moves:['bite','venom_bite','coil'],drops:[['venom_sac',.34,1],['redroot',.12,1]],desc:'A marsh snake whose striped hide disappears between reeds.'}],
['fen_boar',{name:'Fen Boar',icon:'🐗',level:8,armor:4,moves:['gore','circle','brace'],drops:[['raw_meat',.78,2]],desc:'A mud-caked boar that treats raised walkways as a personal insult.'}],
['reed_rat',{name:'Reed Rat',icon:'🐀',level:4,armor:1,moves:['bite','scrabble'],drops:[['raw_meat',.35,1],['drowned_coin',.018,1]],desc:'A marsh rat large enough to make fishermen reconsider bare feet.'}],
['bog_adder',{name:'Bog Adder',icon:'🐍',level:6,armor:1,moves:['bite','venom_bite','coil'],drops:[['venom_sac',.38,1],['adder_scale',.5,1]],desc:'A dark marsh adder with a venomous bite and terrible manners.'}],
['stilt_thief',{name:'Stiltway Thief',icon:'🥷',level:8,armor:3,moves:['slash','dirty_trick','evade'],drops:[['lockpick',.3,1],['drowned_coin',.12,1]],desc:'A thief who knows which rope bridge creaks and which does not.'}],
['drowned_rat',{name:'Drowned Rat',icon:'🐀',level:8,armor:2,moves:['bite','grasp','scrabble'],drops:[['drowned_coin',.12,1]],desc:'A waterlogged rat that refuses to stay properly dead.'}],
['silt_specter',{name:'Silt Specter',icon:'👻',level:9,armor:1,moves:['wisp_burn','hex','drift'],drops:[['drowned_coin',.22,1],['ghost_orchid',.035,1]],desc:'A drowned shape that rises when mud is disturbed.'}],
['ruin_croc',{name:'Ruin Crocodile',icon:'🐊',level:13,armor:7,moves:['death_roll','snap','brace'],drops:[['croc_hide',.78,1],['drowned_coin',.14,1]],desc:'An old crocodile that nests among flooded masonry.'}],
['heron_shade',{name:'Heron Shade',icon:'🐦',level:17,armor:5,moves:['peck','royal_gaze','drift'],drops:[['drowned_coin',.42,1],['royal_seal',.018,1]],desc:'A long-legged shadow wearing the outline of a stone heron.'}],
['reed_viper',{name:'Mirewatch Viper',icon:'🐍',level:8,armor:1,moves:['bite','venom_bite','coil'],drops:[['venom_sac',.42,1]],desc:'A quick marsh viper that basks beneath the lodge boardwalk.'}],
['fen_lynx',{name:'Fen Lynx',icon:'🐈',level:10,armor:2,moves:['slash','circle','evade'],drops:[['raw_meat',.35,1],['lucky_charm',.025,1]],desc:'A marsh cat that hunts from low willow branches.'}],
['marsh_harrier',{name:'Marsh Harrier',icon:'🦅',level:11,armor:2,moves:['peck','marked_shot','evade'],drops:[['crow_feather',.55,2]],desc:'A broad-winged raptor that patrols open fen.'}],
['mire_bear',{name:'Mire Bear',icon:'🐻',level:13,armor:6,moves:['club','roar','brace'],drops:[['raw_meat',.8,2],['wolf_pelt',.18,1]],desc:'A huge dark bear accustomed to wading through waist-deep marsh.'}]]
.forEach(([id,c])=>V.addEnemy(id,c));

// ---------- Eight standard entity species per combat location ----------
V.ECOSYSTEMS={
  sunmeadow:[['road_crow',3],['wolf',2],['dusk_fox',2],['meadow_boar',4],['thorn_adder',3],['feral_hound',2],['razorback',2],['rogue_stag',1]],
  forest:[['road_crow',2],['wolf',4],['dusk_fox',3],['meadow_boar',2],['thorn_adder',2],['briar_sprite',2],['feral_hound',3],['rogue_stag',1]],
  river:[['rat',2],['road_crow',2],['river_leech',3],['silver_crab',3],['thorn_adder',2],['water_snake',2],['feral_hound',1],['river_stalker',1]],
  mine:[['rat',4],['cave_bat',4],['dust_rat',3],['stone_centipede',3],['tunnel_scavenger',2],['cave_spider',3],['tunnel_beetle',3],['rock_worm',1]],
  deep_mine:[['cave_bat',3],['cave_spider',3],['tunnel_beetle',3],['pale_lurker',2],['stone_ghoul',2],['deepcrawler',2],['crypt_guard',1],['deep_worm',1]],
  crossroads:[['road_crow',3],['wolf',2],['cutpurse',2],['bandit',3],['road_viper',2],['highwayman',2],['feral_hound',2],['brute',1]],
  northroad:[['wolf',2],['frost_crow',3],['mountain_goat',2],['road_warg',2],['ridge_raider',3],['hill_troll',2],['cliff_harrier',1],['ridge_brute',1]],
  quarry:[['dust_asp',2],['stone_tick',3],['ridge_raider',2],['quarry_hound',2],['hill_troll',2],['slate_golem',1],['ridge_brute',1],['quarry_drake',1]],
  ember_cave:[['tunnel_beetle',2],['ash_wisp',3],['cinder_bat',3],['lava_tick',2],['magma_crawler',3],['ember_hound',3],['slag_golem',1],['quarry_drake',1]],
  crypt:[['bone_rat',3],['tomb_wisp',3],['skeleton',3],['grave_moth',2],['crypt_guard',2],['restless_knight',1],['sepulcher_hound',1],['gravewarden',1]],
  marshroad:[['road_crow',2],['mudcrab',3],['reed_serpent',3],['bog_spider',3],['fen_boar',2],['mire_wolf',2],['marsh_lurker',2],['marsh_raider',1]],
  reedmere:[['reed_rat',3],['mudcrab',4],['bog_adder',3],['bog_spider',3],['stilt_thief',2],['mire_wolf',2],['marsh_lurker',2],['fen_croc',1]],
  drowned_ruins:[['drowned_rat',3],['silt_specter',3],['grave_moth',2],['lantern_wisp',3],['fen_croc',2],['ruin_croc',2],['drowned_sentinel',2],['heron_shade',1]],
  mirewatch:[['bog_spider',2],['reed_viper',3],['mire_wolf',3],['rogue_stag',2],['fen_lynx',2],['marsh_harrier',2],['fen_croc',2],['mire_bear',1]]
};
Object.entries(V.ECOSYSTEMS).forEach(([loc,table])=>{RF.fieldTables[loc]=table.map(x=>[x[0],x[1]])});

V.localDungeonLineup=function(loc){
  const seen=new Set();
  return (RF.fieldTables?.[loc]||[]).map(([id])=>id).filter(id=>RF.DATA.enemies?.[id]&&!seen.has(id)&&seen.add(id))
    .sort((a,b)=>(RF.DATA.enemies[a].level-RF.DATA.enemies[b].level)||RF.DATA.enemies[a].name.localeCompare(RF.DATA.enemies[b].name))
    .slice(0,8);
};

// ---------- Tier-scaled equipment ----------
V.addGear=function(id,c){
  RF.DATA.items[id]={name:c.name,icon:c.icon,type:c.type||((c.slot==='main')?'weapon':'armor'),slot:c.slot,value:c.value,
    damage:c.damage||0,armor:c.armor||0,rarity:c.rarity,desc:c.desc||`${c.name}. +${c.damage||0} damage • +${c.armor||0} armour.`};
};
[
// Shattered Shaft — Uncommon
['veinmaw_pick',{name:'Veinmaw War Pick',icon:'⛏️',slot:'main',value:155,damage:8,armor:1,rarity:'Uncommon'}],
['prospector_buckler',{name:'Prospector Buckler',icon:'🛡️',slot:'off',value:142,damage:1,armor:5,rarity:'Uncommon'}],
['shaft_helm',{name:'Shaftwarden Helm',icon:'⛑️',slot:'head',value:136,damage:1,armor:4,rarity:'Uncommon'}],
['dustcoat',{name:'Dustbound Coat',icon:'🥋',slot:'chest',value:165,damage:1,armor:5,rarity:'Uncommon'}],
['pit_boots',{name:'Pitwalker Boots',icon:'🥾',slot:'boots',value:128,damage:1,armor:4,rarity:'Uncommon'}],
// Hollowroot — Uncommon/Rare
['hollowroot_blade',{name:'Hollowroot Blade',icon:'🗡️',slot:'main',value:235,damage:11,armor:2,rarity:'Rare'}],
['rootguard',{name:'Rootguard Shield',icon:'🛡️',slot:'off',value:220,damage:2,armor:6,rarity:'Rare'}],
['thorncap',{name:'Thorncap Helm',icon:'🌿',slot:'head',value:192,damage:2,armor:5,rarity:'Uncommon'}],
['barkhide_vest',{name:'Barkhide Vest',icon:'🥋',slot:'chest',value:230,damage:2,armor:6,rarity:'Rare'}],
['briarstep_boots',{name:'Briarstep Boots',icon:'🥾',slot:'boots',value:205,damage:2,armor:5,rarity:'Rare'}],
// Buried Galleries — Rare
['buried_edge',{name:'Buried Edge',icon:'⚔️',slot:'main',value:335,damage:14,armor:3,rarity:'Rare'}],
['deepguard',{name:'Deepguard',icon:'🛡️',slot:'off',value:315,damage:2,armor:8,rarity:'Rare'}],
['blacklamp_coif',{name:'Blacklamp Coif',icon:'🪖',slot:'head',value:285,damage:2,armor:7,rarity:'Rare'}],
['gallery_mail',{name:'Gallery Mail',icon:'🛡️',slot:'chest',value:360,damage:3,armor:9,rarity:'Rare'}],
['understep_boots',{name:'Understep Boots',icon:'🥾',slot:'boots',value:295,damage:2,armor:7,rarity:'Rare'}],
// Forgotten Crypt additions — Epic
['regent_crown',{name:'Regent Crown',icon:'👑',slot:'head',value:540,damage:3,armor:10,rarity:'Epic'}],
['cryptlord_mace',{name:'Cryptlord Mace',icon:'🔨',slot:'main',value:585,damage:18,armor:4,rarity:'Epic'}],
// Crownwatch Barrow — Rare/Epic
['barrow_sabre',{name:'Barrow Sabre',icon:'🗡️',slot:'main',value:565,damage:19,armor:4,rarity:'Epic'}],
['warlord_roundshield',{name:'Warlord Roundshield',icon:'🛡️',slot:'off',value:520,damage:3,armor:10,rarity:'Rare'}],
['crownwatch_helm',{name:'Crownwatch Helm',icon:'🪖',slot:'head',value:505,damage:3,armor:9,rarity:'Rare'}],
['marcher_plate',{name:'Marcher Plate',icon:'🛡️',slot:'chest',value:620,damage:4,armor:12,rarity:'Epic'}],
['kingroad_greaves',{name:'Kingroad Greaves',icon:'👖',slot:'legs',value:530,damage:3,armor:10,rarity:'Rare'}],
// Redstone Underworks — Epic
['redstone_maul',{name:'Redstone Maul',icon:'🔨',slot:'main',value:720,damage:22,armor:5,rarity:'Epic'}],
['quarry_wall',{name:'Quarry Wall',icon:'🛡️',slot:'off',value:675,damage:4,armor:12,rarity:'Epic'}],
['colossus_helm',{name:'Colossus Helm',icon:'🪖',slot:'head',value:640,damage:4,armor:11,rarity:'Epic'}],
['redstone_plate',{name:'Redstone Plate',icon:'🛡️',slot:'chest',value:790,damage:5,armor:14,rarity:'Epic'}],
['scree_boots',{name:'Scree Boots',icon:'🥾',slot:'boots',value:610,damage:4,armor:10,rarity:'Epic'}],
// Emberdeep additions — Legendary
['tyrant_crown',{name:'Cindermaw Crown',icon:'👑',slot:'head',value:980,damage:5,armor:14,rarity:'Legendary'}],
['heartforge_greatblade',{name:'Heartforge Greatblade',icon:'🔥',slot:'main',value:1100,damage:26,armor:6,rarity:'Legendary'}],
// Sunken Heron Vault — Legendary
['heron_spear',{name:'Sovereign Heron Spear',icon:'🔱',slot:'main',value:1450,damage:29,armor:7,rarity:'Legendary'}],
['tidewall_shield',{name:'Tidewall Shield',icon:'🛡️',slot:'off',value:1340,damage:6,armor:16,rarity:'Legendary'}],
['drowned_crown',{name:'Drowned Crown',icon:'👑',slot:'head',value:1280,damage:5,armor:15,rarity:'Legendary'}],
['heron_scale_mail',{name:'Heron Scale Mail',icon:'🛡️',slot:'chest',value:1560,damage:6,armor:18,rarity:'Legendary'}],
['undertow_greaves',{name:'Undertow Greaves',icon:'👖',slot:'legs',value:1360,damage:5,armor:16,rarity:'Legendary'}]
].forEach(([id,c])=>V.addGear(id,c));

// ---------- Eight dungeon bosses ----------
V.addBoss=function(id,c){
  RF.DATA.enemies[id]={name:c.name,icon:c.icon,level:c.level,hp:c.hp,damage:c.damage,armor:c.armor,xp:c.xp,gold:c.gold,
    temperament:'boss',moves:c.moves,drops:c.drops,desc:c.desc};
};
const rareDrops=(gear,base=.11)=>gear.map((id,i)=>[id,Math.max(.045,base-i*.012),1]);
V.addBoss('ironmaw_broodmother',{name:'Ironmaw Broodmother',icon:'🕷️',level:9,hp:205,damage:[10,19],armor:6,xp:390,gold:[45,80],moves:['venom_bite','web','stone_bite','brace'],drops:[['iron_ore',1,2],...rareDrops(['veinmaw_pick','prospector_buckler','shaft_helm','dustcoat','pit_boots'],.14)],desc:'An enormous mine spider plated in iron-rich stone.'});
V.addBoss('hollowroot_hart',{name:'Hollowroot Hart',icon:'🦌',level:11,hp:245,damage:[12,22],armor:7,xp:520,gold:[60,105],moves:['gore','hoof_feint','circle','royal_gaze'],drops:[['herb',1,3],...rareDrops(['hollowroot_blade','rootguard','thorncap','barkhide_vest','briarstep_boots'],.13)],desc:'An ancient stag crowned in root and thorn, far too old to be ordinary wildlife.'});
V.addBoss('buried_foreman',{name:'The Buried Foreman',icon:'👷',level:14,hp:315,damage:[15,26],armor:9,xp:760,gold:[85,140],moves:['club','commanding_strike','stone_guard','roar'],drops:[['silver_ore',1,2],...rareDrops(['buried_edge','deepguard','blacklamp_coif','gallery_mail','understep_boots'],.12)],desc:'A dead foreman still directing a shift that ended generations ago.'});
V.addBoss('crownwatch_warlord',{name:'Crownwatch Warlord',icon:'👑',level:19,hp:435,damage:[19,33],armor:12,xp:1320,gold:[150,230],moves:['commanding_strike','marked_shot','brace','war_cry'],drops:[['steel_bar',1,2],...rareDrops(['barrow_sabre','warlord_roundshield','crownwatch_helm','marcher_plate','kingroad_greaves'],.10)],desc:'The armoured warlord buried beneath the old northern road, awake and furious.'});
V.addBoss('redstone_colossus',{name:'Redstone Colossus',icon:'🗿',level:21,hp:510,damage:[21,36],armor:15,xp:1580,gold:[180,275],moves:['stone_guard','club','tail_sweep','war_cry'],drops:[['silver_ore',1,3],...rareDrops(['redstone_maul','quarry_wall','colossus_helm','redstone_plate','scree_boots'],.095)],desc:'A quarry idol the size of a cart, cut loose from the bedrock.'});
V.addBoss('drowned_heron_sovereign',{name:'Drowned Heron Sovereign',icon:'🐦‍⬛',level:24,hp:590,damage:[24,41],armor:16,xp:2050,gold:[235,350],moves:['royal_gaze','flood_call','stone_beak','drowned_grip'],drops:[['royal_seal',1,1],['drowned_coin',1,4],...rareDrops(['heron_spear','tidewall_shield','drowned_crown','heron_scale_mail','undertow_greaves'],.085)],desc:'A crowned marsh revenant wearing the shape of the dynasty carved throughout the ruins.'});

// Existing dungeon rulers are strengthened and gain larger rare equipment pools.
Object.assign(RF.DATA.enemies.ossuary_regent,{level:18,hp:410,damage:[18,32],armor:12,xp:1190,gold:[135,205],drops:[['crypt_sigil',1,1],['steel_bar',.5,1],...rareDrops(['regent_falchion','bonewall_buckler','ossuary_coif','tombwarden_greaves','regent_crown','cryptlord_mace'],.10)]});
Object.assign(RF.DATA.enemies.cindermaw_tyrant,{level:22,hp:545,damage:[22,38],armor:14,xp:1775,gold:[205,310],drops:[['ember_shard',1,3],['steel_bar',.6,1],...rareDrops(['cindermaw_blade','emberplate_cuirass','magma_guard','cinderstep_boots','tyrant_crown','heartforge_greatblade'],.09)]});

// ---------- Dungeon definitions ----------
const D=RF.V1062;
Object.assign(D.DUNGEONS,{
  mine:{name:'Shattered Shaft',icon:'⛏️',level:3,difficulty:'Novice',boss:'ironmaw_broodmother',region:'Greenvale',desc:'The reopened mine hides a collapsed lower circuit. Eight local threats stand between the lift cage and the brood chamber.',rewards:['veinmaw_pick','prospector_buckler','shaft_helm','dustcoat','pit_boots'],bonusGold:95,bonusXp:180,materials:[['iron_ore',3],['coal',2]],flag:'shatteredShaftCleared'},
  forest:{name:'Hollowroot Warren',icon:'🌲',level:5,difficulty:'Low',boss:'hollowroot_hart',region:'Greenvale',desc:'A root-choked hollow beneath Whisperwood funnels every local predator toward an ancient heart-tree chamber.',rewards:['hollowroot_blade','rootguard','thorncap','barkhide_vest','briarstep_boots'],bonusGold:130,bonusXp:260,materials:[['wolf_pelt',2],['herb',3]],flag:'hollowrootCleared'},
  deep_mine:{name:'Buried Galleries',icon:'🕳️',level:7,difficulty:'Moderate',boss:'buried_foreman',region:'Greenvale',desc:'The oldest workings form a descending chain of sealed galleries. Every creature from the deep ecosystem must be passed in order.',rewards:['buried_edge','deepguard','blacklamp_coif','gallery_mail','understep_boots'],bonusGold:185,bonusXp:360,materials:[['silver_ore',2],['steel_bar',1]],flag:'buriedGalleriesCleared'},
  northroad:{name:'Crownwatch Barrow',icon:'⚔️',level:10,difficulty:'Hard',boss:'crownwatch_warlord',region:'The Marches',desc:'A burial road beneath the kingroad has opened. Eight northern threats guard the warlord chamber beyond.',rewards:['barrow_sabre','warlord_roundshield','crownwatch_helm','marcher_plate','kingroad_greaves'],bonusGold:300,bonusXp:580,materials:[['steel_bar',2],['troll_tooth',1]],flag:'crownwatchBarrowCleared'},
  quarry:{name:'Redstone Underworks',icon:'🧱',level:12,difficulty:'Severe',boss:'redstone_colossus',region:'Ironridge',desc:'Old quarry cuts continue beneath the active pits into chambers nobody remembers excavating.',rewards:['redstone_maul','quarry_wall','colossus_helm','redstone_plate','scree_boots'],bonusGold:390,bonusXp:760,materials:[['iron_ore',4],['silver_ore',2]],flag:'redstoneUnderworksCleared'},
  drowned_ruins:{name:'Sunken Heron Vault',icon:'🏛️',level:17,difficulty:'Mythic',boss:'drowned_heron_sovereign',region:'Mirefen',desc:'A drowned ceremonial route descends beneath the Heron ruins. The local dead and predators guard a royal chamber below the waterline.',rewards:['heron_spear','tidewall_shield','drowned_crown','heron_scale_mail','undertow_greaves'],bonusGold:610,bonusXp:1180,materials:[['drowned_coin',4],['ghost_orchid',1]],flag:'sunkenHeronVaultCleared'}
});
// Re-tier the two original dungeons and broaden their reward pools without invalidating records.
Object.assign(D.DUNGEONS.crypt,{level:9,difficulty:'Challenging',rewards:['regent_falchion','bonewall_buckler','ossuary_coif','tombwarden_greaves','regent_crown','cryptlord_mace'],bonusGold:250,bonusXp:500});
Object.assign(D.DUNGEONS.ember_cave,{level:14,difficulty:'Elite',rewards:['cindermaw_blade','emberplate_cuirass','magma_guard','cinderstep_boots','tyrant_crown','heartforge_greatblade'],bonusGold:430,bonusXp:850});

// Every dungeon points at the eight standard entities from that exact location.
Object.entries(D.DUNGEONS).forEach(([loc,d])=>{
  const lineup=V.localDungeonLineup(loc);
  d.pool=lineup.map(id=>[id,1]);
  d.localLineup=lineup;
  const l=RF.DATA.locations?.[loc];if(l)l.dungeon=true;
});

// New runs are deterministic by local ecology: all eight local entities, lowest level first.
// Existing active runs keep their already-saved sequence exactly as it was.
D.sequence=function(s,loc,attempt){
  const d=D.def(loc);if(!d)return[];
  const lineup=V.localDungeonLineup(loc);
  if(lineup.length===8)return lineup;
  return (d.localLineup||[]).slice(0,8);
};

if(RF.V94?.bossHomes){
  Object.assign(RF.V94.bossHomes,{
    ironmaw_broodmother:['mine'],hollowroot_hart:['forest'],buried_foreman:['deep_mine'],
    ossuary_regent:['crypt'],crownwatch_warlord:['northroad'],redstone_colossus:['quarry'],
    cindermaw_tyrant:['ember_cave'],drowned_heron_sovereign:['drowned_ruins']
  });
}

// Enrich dungeon Database rows/details with difficulty and the local-wave rule.
if(RF.V113?.dungeonEntries){
  const dbBase=RF.V113.dungeonEntries.bind(RF.V113);
  RF.V113.dungeonEntries=function(s){
    return dbBase(s).map(row=>{
      const d=D.def(row.id);return d?{...row,sub:`Lv ${d.level} • ${d.difficulty||'Dungeon'} • ${RF.DATA.locations?.[row.id]?.icon||'📍'} ${RF.DATA.locations?.[row.id]?.name||row.id} • ${d.region||RF.DATA.locations?.[row.id]?.region||'Unknown region'}${D.record(s,row.id).clears?` • ${D.record(s,row.id).clears} clear${D.record(s,row.id).clears===1?'':'s'}`:''}`} : row;
    }).sort((a,b)=>(a.sortLevel-b.sortLevel)||a.name.localeCompare(b.name));
  };
}

// Dungeon cards now make the ordered local-gauntlet rule explicit.
const worldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){
  let h=worldBase(s),d=D.def(s?.location);if(!d)return h;
  h=h.replace(/(<section class="card v1062DungeonSection">[\s\S]*?<small>)([\s\S]*?)(<\/small>[\s\S]*?<\/section>)/,
    (m,a,b,c)=>a+`${b.split(' • 8 waves + boss')[0]} • ${d.difficulty||'Dungeon'} • 8 local waves + boss`+c);
  return h;
};

V.validate=function(){
  const badEco=Object.entries(V.ECOSYSTEMS).filter(([loc])=>V.localDungeonLineup(loc).length!==8);
  const dungeons=Object.keys(D.DUNGEONS);
  const badDungeon=dungeons.filter(loc=>V.localDungeonLineup(loc).length!==8||!D.DUNGEONS[loc].boss||!RF.DATA.enemies[D.DUNGEONS[loc].boss]);
  return {ecosystems:Object.keys(V.ECOSYSTEMS).length,badEco,dungeons:dungeons.length,badDungeon};
};

V.migrate=function(s){
  if(!s)return s;
  s.v114=s.v114||{};
  s.v1062=s.v1062||{};s.v1062.records=s.v1062.records||{};
  Object.keys(D.DUNGEONS).forEach(loc=>D.record(s,loc));
  // Encounter caches are disposable world-state snapshots; clear only those so the expanded
  // eight-species ecosystems appear immediately. Active combat/dungeon sequences are untouched.
  s.encounters=s.encounters||{};
  Object.keys(V.ECOSYSTEMS).forEach(loc=>{if(!s.combat||s.location!==loc)delete s.encounters[loc]});
  s.version='11.4.0';
  return s;
};
const newBase=RF.newGame;RF.newGame=function(...a){return V.migrate(newBase(...a))};
const loadBase=RF.load;RF.load=function(){return V.migrate(loadBase())};
const importBase=RF.importSave;RF.importSave=function(x){return V.migrate(importBase(x))};
if(RF.V95){RF.V95.SCHEMA='11.4.0';const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s))}

const oldStyle=document.getElementById('v114-eightfold-dungeons-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v114-eightfold-dungeons-style';st.textContent=`
.v1062DungeonSection .action small{line-height:1.35}
.v113DungeonDetail .dbChips span{white-space:nowrap}
`;
document.head.appendChild(st);

if(RF.state){
  V.migrate(RF.state);RF.save?.(RF.state);
  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
}
})();
