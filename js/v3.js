window.RF=window.RF||{};
RF.VERSION='3.0.0';

Object.assign(RF.DATA.items,{
  steel_bar:{name:'Steel Bar',icon:'▰',type:'material',value:38,rarity:'Uncommon',desc:'A hard carbon-rich bar for serious equipment.'},
  steel_sword:{name:'Steel Longsword',icon:'🗡️',type:'weapon',value:210,damage:15,slot:'main',rarity:'Uncommon',desc:'+15 melee damage. Reliable Ironridge steel.'},
  steel_helm:{name:'Steel Sallet',icon:'🪖',type:'armor',value:175,armor:7,slot:'head',rarity:'Uncommon',desc:'+7 armour.'},
  steel_cuirass:{name:'Steel Cuirass',icon:'🛡️',type:'armor',value:290,armor:11,slot:'chest',rarity:'Rare',desc:'+11 armour. Heavy, dependable plate.'},
  ash_ring:{name:'Ashglass Ring',icon:'💍',type:'armor',value:360,armor:2,slot:'ring1',rarity:'Epic',desc:'+2 armour and an uncanny warmth.'},
  warden_blade:{name:'Gravewarden Blade',icon:'⚔️',type:'weapon',value:520,damage:20,slot:'main',rarity:'Epic',desc:'+20 melee damage. Pale runes wake near the dead.'},
  crypt_sigil:{name:'Crypt Sigil',icon:'🔘',type:'quest',value:0,rarity:'Rare',desc:'A stone seal engraved with a crown split in two.'},
  ember_shard:{name:'Ember Shard',icon:'🔶',type:'material',value:42,rarity:'Rare',desc:'A hot mineral fragment from beneath Ironridge.'},
  smoke_bomb:{name:'Smoke Bomb',icon:'💨',type:'utility',value:55,rarity:'Uncommon',desc:'Useful for criminals and tactical retreats.'},
  master_lockpick:{name:'Fine Lockpick',icon:'🗝️',type:'utility',value:38,rarity:'Uncommon',desc:'A finely sprung pick. Improves risky theft attempts.'}
});
RF.DATA.shopStock.push('steel_sword');
Object.assign(RF.DATA.recipes,{
  steel_bar:{name:'Smelt Steel Bar',skill:'smithing',level:7,time:12,inputs:{iron_ore:2,coal:2},outputs:{steel_bar:1},xp:58},
  steel_sword:{name:'Forge Steel Longsword',skill:'smithing',level:9,time:19,inputs:{steel_bar:3},outputs:{steel_sword:1},xp:115},
  steel_helm:{name:'Forge Steel Sallet',skill:'smithing',level:10,time:18,inputs:{steel_bar:3},outputs:{steel_helm:1},xp:125},
  smoke_bomb:{name:'Craft Smoke Bomb',skill:'crafting',level:6,time:10,inputs:{coal:1,herb:1},outputs:{smoke_bomb:1},xp:54}
});
Object.assign(RF.DATA.locations,{
  crypt:{name:'Forgotten Crypt',icon:'🪦',region:'Greenvale',desc:'Stone stairs descend beneath the Mossbound Ruins. Cold air carries the smell of wet iron.',neighbors:{ruins:4},actions:['delve','explore'],lockedFlag:'cryptOpened'},
  northroad:{name:'Northwatch Road',icon:'🛤️',region:'The Marches',desc:'The old kingroad climbs beyond Greenvale toward harsher country and darker stone.',neighbors:{watchtower:28,ironridge:42},actions:['wait','explore'],lockedFlag:'northRoadOpen'},
  ironridge:{name:'Ironridge',icon:'🏰',region:'Ironridge',desc:'A fortified mining town cut into black hills. Forges burn through the night.',neighbors:{northroad:42,quarry:16,ember_cave:31},actions:['rest','talk','explore'],shop:true,lockedFlag:'northRoadOpen'},
  quarry:{name:'Redstone Quarry',icon:'🧱',region:'Ironridge',desc:'Terraced stone pits echo with hammers, shouted orders and the occasional landslide.',neighbors:{ironridge:16},actions:['mine','explore'],lockedFlag:'northRoadOpen'},
  ember_cave:{name:'Emberdeep',icon:'🌋',region:'Ironridge',desc:'A volcanic cavern where the rock sweats heat and orange crystal burns in the walls.',neighbors:{ironridge:31},actions:['delve','mine'],lockedFlag:'emberdeepKnown'}
});
RF.DATA.locations.ruins.neighbors.crypt=4;
RF.DATA.locations.watchtower.neighbors.northroad=28;
Object.assign(RF.DATA.enemies,{
  skeleton:{name:'Crypt Skeleton',icon:'💀',hp:82,damage:[7,14],armor:3,xp:105,gold:[4,12],drops:[['crypt_sigil',.08,1],['silver_ore',.14,1]],level:8},
  crypt_guard:{name:'Hollow Knight',icon:'🛡️',hp:128,damage:[9,18],armor:7,xp:190,gold:[16,35],drops:[['steel_bar',.24,1],['crypt_sigil',.22,1]],level:11},
  gravewarden:{name:'The Gravewarden',icon:'👑',hp:260,damage:[13,24],armor:9,xp:620,gold:[90,145],drops:[['warden_blade',1,1],['ash_ring',.4,1],['crypt_sigil',1,1]],level:16},
  ridge_raider:{name:'Ridge Raider',icon:'🪓',hp:104,damage:[9,17],armor:5,xp:145,gold:[18,38],drops:[['steel_bar',.12,1],['bread',.25,1]],level:10},
  magma_crawler:{name:'Magma Crawler',icon:'🦎',hp:150,damage:[11,21],armor:6,xp:215,gold:[2,8],drops:[['ember_shard',.62,1]],level:13}
});
RF.DATA.factions.ironridge={name:'Ironridge',icon:'⛰️'};
RF.DATA.factions.underworld={name:'Underworld',icon:'🕶️'};
Object.assign(RF.DATA.npcs,{
  kael:{name:'Kael Marr',icon:'🧔‍♂️',job:'Forge Marshal',home:'ironridge',schedule:[['ironridge',5,20],['ironridge',20,24]],condition:s=>s.flags.northRoadOpen,rumours:['Steel is easy. Good steel is a lifelong argument with fire.','Emberdeep is closed for a reason, which naturally means fools keep entering it.']},
  nyra:{name:'Nyra Quickhand',icon:'🕶️',job:'Fixer',home:'ironridge',schedule:[['ironridge',18,24],['ironridge',0,3]],condition:s=>s.flags.northRoadOpen,rumours:['A clean reputation is just a criminal record nobody has found yet.','Eastwatch pays poorly. Other people pay creatively.']}
});

RF.DATA.perks={
  ironblood:{name:'Ironblood',icon:'🩸',tree:'Warrior',max:3,desc:'Increase maximum health by 8 per rank.'},
  brutal_training:{name:'Brutal Training',icon:'⚔️',tree:'Warrior',max:2,desc:'Power Strike deals more damage and costs less stamina.',requires:['ironblood']},
  bulwark:{name:'Bulwark',icon:'🛡️',tree:'Warrior',max:2,desc:'Gain +2 effective armour per rank.'},
  trailwise:{name:'Trailwise',icon:'🧭',tree:'Ranger',max:3,desc:'Travel is 5% faster per rank.'},
  scavenger:{name:'Scavenger',icon:'🎒',tree:'Ranger',max:3,desc:'Improves enemy drop chances and gathering bonuses.'},
  silver_tongue:{name:'Silver Tongue',icon:'🗣️',tree:'Influence',max:3,desc:'Better shop prices and selected event outcomes.'},
  guild_favour:{name:'Guild Favour',icon:'🤝',tree:'Influence',max:2,desc:'Positive reputation gains are increased.'},
  light_fingers:{name:'Light Fingers',icon:'🫳',tree:'Shadow',max:3,desc:'Improves theft success and reduces bounty gained.'},
  vanish:{name:'Vanish',icon:'💨',tree:'Shadow',max:1,desc:'Smoke Bombs guarantee escape from normal enemies.',requires:['light_fingers']},
  craftsman:{name:'Craftsman',icon:'🔨',tree:'Artisan',max:3,desc:'Gain 12% more production XP per rank.'},
  prospector:{name:'Prospector',icon:'💎',tree:'Artisan',max:2,desc:'Chance to find bonus valuable ore.'}
};

RF.DATA.quests.eastwatch_rising.next='road_to_ironridge';
RF.DATA.quests.road_to_ironridge={name:'Road to Ironridge',desc:'Blackthorn has fractured, but Voss carried orders bearing a northern seal.',objectives:[{type:'flag',target:'northRoadOpen',text:'Secure passage along Northwatch Road'},{type:'visit',target:'ironridge',text:'Reach Ironridge'}],reward:{gold:180,xp:360},next:'the_split_crown'};
RF.DATA.quests.the_split_crown={name:'The Split Crown',desc:'A buried crypt beneath Greenvale bears the same broken-crown seal found in Voss’s papers.',objectives:[{type:'flag',target:'cryptOpened',text:'Open the Forgotten Crypt'},{type:'kill',target:'gravewarden',value:1,text:'Defeat the Gravewarden'},{type:'item',target:'crypt_sigil',value:1,text:'Recover a Crypt Sigil'}],reward:{gold:450,xp:800,item:'ash_ring'}};

RF.DATA.events.push(
 {id:'crypt_whisper',title:'The Stone That Breathes',icon:'🪦',once:true,locations:['ruins'],weight:9,condition:s=>s.flags.vossDefeated||s.skills.exploration.level>=6,text:'A slab beneath the ruins exhales a thread of winter-cold air. Scratched into its edge is a crown split vertically in two.',choices:[
   {text:'Clear the rubble',result:s=>{s.flags.cryptOpened=true;RF.addXp(s,'exploration',70);return 'Hours of dirt and roots reveal steps descending beneath the ruin. Something below knocks once.';}},
   {text:'Leave it sealed',result:s=>{s.flags.cryptMarked=true;return 'You mark the stone on your map. Some doors have survived centuries for good reasons.';}}
 ]},
 {id:'north_charter',title:'The Northern Charter',icon:'📜',once:true,locations:['watchtower'],weight:10,condition:s=>s.flags.vossDefeated,text:'Sergeant Halden lays Voss’s captured papers across a table. Several orders came from beyond the valley.',choices:[
   {text:'Take the road north',result:s=>{s.flags.northRoadOpen=true;s.reputation.watch+=3;return 'Halden stamps a travel charter. “Ironridge first. Then find out who was paying Voss.” The northern gate opens.';}},
   {text:'Demand payment first',condition:s=>(s.skills.speech.level>=4||((s.perks?.silver_tongue||0)>0)),result:s=>{s.gold+=65;s.flags.northRoadOpen=true;s.reputation.watch+=1;return 'Halden mutters, pays 65 gold, then stamps the charter with considerably less enthusiasm.';}}
 ]},
 {id:'ironridge_offer',title:'A Job Without Questions',icon:'🕶️',once:true,locations:['ironridge'],weight:6,condition:s=>RF.hour(s)>=18,text:'Nyra Quickhand sits alone beneath a forge awning, rolling a silver coin across her knuckles. “You look useful. More importantly, you look deniable.”',choices:[
   {text:'Hear her out',result:s=>{s.flags.metUnderworld=true;s.reputation.underworld+=4;RF.addItem(s,'master_lockpick',1);return 'She gives you a fine lockpick and a name scratched onto bone. The underworld now knows yours.';}},
   {text:'Report her to the marshal',result:s=>{s.reputation.ironridge+=5;s.reputation.underworld-=5;s.gold+=30;return 'Kael Marr takes the information seriously. Nyra is gone before the guards arrive.';}},
   {text:'Walk away',result:s=>'The coin keeps turning behind you.'}
 ]},
 {id:'ember_rumour',title:'The Sealed Furnace Road',icon:'🔥',once:true,locations:['ironridge','quarry'],weight:5,condition:s=>s.skills.mining.level>=7,text:'Quarry workers whisper that the old Emberdeep tunnel is glowing again. The foreman has nailed boards across the entrance.',choices:[
   {text:'Ask for the route',result:s=>{s.flags.emberdeepKnown=true;RF.addXp(s,'mining',45);return 'A miner sketches the forbidden route on the back of a wage chit.';}},
   {text:'Leave volcanic holes alone',result:s=>'For once, common sense wins.'}
 ]}
);

RF.migrateV3=function(s){
  if(!s)return s; RF.migrateV2(s); s.version='3.0.0';
  s.perks=s.perks||{}; s.perkPoints??=Math.max(0,Math.floor((s.player.level-1)/3)); s.perkPointsSpent??=0;
  s.crime=s.crime||{bounty:0,heat:0,thefts:0}; s.dungeons=s.dungeons||{crypt:{depth:0,cleared:false},ember:{depth:0,cleared:false}};
  s.reputation.ironridge??=0;s.reputation.underworld??=0;
  s.equipment.ring1??=null;s.equipment.ring2??=null;s.equipment.legs??=null;s.equipment.boots??=null;
  s.stats.perksBought??=0;s.stats.crimes??=0;s.stats.dungeonsCleared??=0;s.stats.rareDrops??=0;
  if(s.flags.wanted&&!s.crime.bounty)s.crime.bounty=35;
  if(s.quests?.eastwatch_rising?.done&&!s.quests.road_to_ironridge)s.quests.road_to_ironridge={active:true,done:false};
  if(s.quests?.road_to_ironridge?.done&&!s.quests.the_split_crown)s.quests.the_split_crown={active:true,done:false};
  return s;
};
const v3New=RF.newGame;RF.newGame=function(...a){return RF.migrateV3(v3New(...a))};
const v3Load=RF.load;RF.load=function(){return RF.migrateV3(v3Load())};
const v3Import=RF.importSave;RF.importSave=function(x){return RF.migrateV3(v3Import(x))};
if(RF.state)RF.migrateV3(RF.state);

RF.perkRank=(s,id)=>s.perks?.[id]||0;
RF.canBuyPerk=function(s,id){let p=RF.DATA.perks[id],r=RF.perkRank(s,id);if(!p||r>=p.max||s.perkPoints<1)return false;return !(p.requires||[]).some(x=>RF.perkRank(s,x)<1)};
RF.buyPerk=function(id){let s=RF.state,p=RF.DATA.perks[id];if(!RF.canBuyPerk(s,id))return;s.perks[id]=(s.perks[id]||0)+1;s.perkPoints--;s.perkPointsSpent++;s.stats.perksBought++;if(id==='ironblood'){s.player.maxHp+=8;s.player.hp+=8}RF.log(s,`Perk gained: ${p.name} ${s.perks[id]}/${p.max}.`,'important');RF.save(s);RF.UI.render(s)};
const v3AddLevel=RF.addPlayerXp;RF.addPlayerXp=function(s,amount){let before=s.player.level;v3AddLevel(s,amount);let gained=Math.floor((s.player.level-1)/3)-Math.floor((before-1)/3);if(gained>0){s.perkPoints=(s.perkPoints||0)+gained;RF.log(s,`You gained ${gained} perk point${gained>1?'s':''}.`,'important')}};
const v3Armor=RF.armor;RF.armor=function(s){let slots=['head','chest','legs','boots','ring1','ring2'];let a=slots.reduce((n,k)=>n+(RF.DATA.items[s.equipment[k]]?.armor||0),0);return a+RF.perkRank(s,'bulwark')*2};

RF.addBounty=function(s,amount,reason){let reduction=1-RF.perkRank(s,'light_fingers')*.12;let gain=Math.max(1,Math.round(amount*reduction));s.crime.bounty+=gain;s.crime.heat=Math.min(100,s.crime.heat+gain);s.crime.lastReason=reason;s.flags.wanted=s.crime.bounty>0;s.stats.crimes++;RF.log(s,`Bounty +${gain}g: ${reason}.`,'bad')};
RF.commitCrime=function(type){let s=RF.state;if(s.activity||s.combat)return;let rank=RF.perkRank(s,'light_fingers'),skill=s.skills.thieving.level,night=RF.hour(s)>=20||RF.hour(s)<5?0.12:0;let base=.35+skill*.025+rank*.09+night;let fine=type==='pickpocket'?22:42;if(type==='pickpocket'){
    if(Math.random()<Math.min(.9,base)){let loot=12+Math.floor(Math.random()*28);s.gold+=loot;s.stats.goldEarned+=loot;s.crime.thefts++;RF.addXp(s,'thieving',32);s.reputation.underworld+=1;RF.log(s,`You lift a purse containing ${loot} gold.`,'good');if(Math.random()<.18)RF.addBounty(s,8,'suspicious pickpocketing')}
    else {RF.addBounty(s,fine,'caught pickpocketing');s.reputation.greenvale-=2;RF.log(s,'A shout goes up behind you. Your face is remembered.','bad')}
  } else if(type==='burglary'){
    if(Math.random()<Math.min(.82,base-.08)){let loot=35+Math.floor(Math.random()*55);s.gold+=loot;s.crime.thefts++;RF.addXp(s,'thieving',55);if(Math.random()<.35)RF.addItem(s,'silver_ore',1);s.reputation.underworld+=2;RF.log(s,`You slip through a shutter and leave with goods worth ${loot} gold.`,'good')}
    else {RF.addBounty(s,fine,'burglary');s.reputation.greenvale-=4;RF.log(s,'A lamp flares inside. You escape empty-handed.','bad')}
  }RF.save(s);RF.UI.render(s)};
RF.payBounty=function(){let s=RF.state;if(!s.crime.bounty||s.gold<s.crime.bounty)return;let b=s.crime.bounty;s.gold-=b;s.crime.bounty=0;s.crime.heat=0;s.flags.wanted=false;RF.log(s,`You pay ${b} gold to clear your bounty.`,'important');RF.save(s);RF.UI.render(s)};

const v3Travel=RF.travel;RF.travel=function(id){let s=RF.state,min=RF.DATA.locations[s.location]?.neighbors?.[id];if(min&&RF.perkRank(s,'trailwise')){let dest=RF.DATA.locations[id];if(dest?.lockedFlag&&!s.flags[dest.lockedFlag])return v3Travel(id);let adjusted=Math.max(2,Math.round(min*(1-RF.perkRank(s,'trailwise')*.05)));return RF.startActivity('travel',`Travelling to ${dest.name}`,adjusted,{target:id,from:s.location})}return v3Travel(id)};

const v3Action=RF.action;RF.action=function(a){if(a==='delve')return RF.startActivity('delve',RF.state.location==='crypt'?'Descending the Forgotten Crypt':'Pushing deeper into Emberdeep',14,{dungeon:RF.state.location});return v3Action(a)};
const v3FinishActivity=RF.finishActivity;RF.finishActivity=function(a){if(a.type!=='delve'){v3FinishActivity(a);let s=RF.state;if(!s)return;if(a.type==='mine'&&RF.perkRank(s,'prospector')&&Math.random()<.07*RF.perkRank(s,'prospector')){let id=s.location==='quarry'?'silver_ore':s.location==='ember_cave'?'ember_shard':'coal';RF.addItem(s,id,1);RF.log(s,`Prospector: you uncover bonus ${RF.DATA.items[id].name}.`,'good')}return}
  let s=RF.state;s.activity=null;if(a.dungeon==='crypt'){
    let d=s.dungeons.crypt;d.depth++;RF.log(s,`You descend to crypt chamber ${d.depth}.`,'important');
    if(d.depth>=4&&!d.cleared)RF.spawnEnemy('gravewarden');else RF.spawnEnemy(d.depth%2===0?'crypt_guard':'skeleton');
  }else{
    let d=s.dungeons.ember;d.depth++;RF.log(s,`You push into Emberdeep sector ${d.depth}.`,'important');RF.spawnEnemy('magma_crawler');if(d.depth>=5&&!d.cleared){d.cleared=true;s.stats.dungeonsCleared++;RF.addItem(s,'ember_shard',3);RF.log(s,'You chart a stable route through Emberdeep. The deepest vents remain beyond reach.','important')}
  }RF.save(s);RF.UI.render(s)
};

const v3Combat=RF.combatAction;RF.combatAction=function(action){let s=RF.state,e=s.combat;if(!e)return;
  if(action==='power'){let cost=Math.max(10,20-RF.perkRank(s,'brutal_training')*3);if(s.player.stamina<cost){RF.log(s,'Not enough stamina for Power Strike.','bad');RF.UI.render(s);return}s.player.stamina-=cost;let d=RF.DATA.enemies[e.id],mult=1.65+RF.perkRank(s,'brutal_training')*.18;if(Math.random()<.78){let hit=Math.max(1,Math.round((5+RF.weaponDamage(s)+s.skills.strength.level)*(mult)*(0.88+Math.random()*.25)-d.armor*.35));e.hp-=hit;RF.log(s,`Power Strike crashes into ${d.name} for ${hit}.`,'good');RF.addXp(s,'strength',14)}else RF.log(s,'Your Power Strike whistles past.','bad');if(e.hp<=0)return RF.winCombat();RF.enemyTurn();RF.save(s);RF.UI.render(s);return}
  if(action==='precision'){let cost=14;if(s.player.stamina<cost){RF.log(s,'Not enough stamina for Precise Strike.','bad');RF.UI.render(s);return}s.player.stamina-=cost;let d=RF.DATA.enemies[e.id],crit=Math.random()<(.18+s.skills.attack.level*.006),hit=Math.max(1,Math.round((5+RF.weaponDamage(s)+s.skills.attack.level*.9)*(crit?1.75:1.15)-d.armor*.25));e.hp-=hit;RF.log(s,`${crit?'Critical! ':''}Precise Strike deals ${hit}.`,'good');RF.addXp(s,'attack',12);if(e.hp<=0)return RF.winCombat();RF.enemyTurn();RF.save(s);RF.UI.render(s);return}
  if(action==='smoke'&&RF.perkRank(s,'vanish')&&RF.takeItem(s,'smoke_bomb',1)){let boss=['captain_voss','gravewarden'].includes(e.id);if(!boss){RF.log(s,'Smoke floods the fight. You vanish before your enemy can react.','good');s.combat=null;RF.save(s);RF.UI.render(s);return}RF.log(s,'The boss refuses to lose you in the smoke.','bad')}
  return v3Combat(action)
};

const v3Win=RF.winCombat;RF.winCombat=function(){let s=RF.state,id=s.combat?.id;if(!id)return;let enemy=RF.DATA.enemies[id];let scav=RF.perkRank(s,'scavenger');if(scav&&enemy?.drops)enemy.drops.forEach(([drop,ch,q])=>{if(Math.random()<ch*.12*scav){RF.addItem(s,drop,q);RF.log(s,`Scavenger finds extra ${RF.DATA.items[drop]?.name||drop}.`,'good')}});v3Win();s=RF.state;
  if(id==='gravewarden'){s.dungeons.crypt.cleared=true;s.stats.dungeonsCleared++;s.flags.gravewardenDefeated=true;s.reputation.greenvale+=3;RF.log(s,'The Forgotten Crypt falls silent. For the first time, the cold air begins to warm.','important')}
  if(id==='ridge_raider')s.reputation.ironridge+=1;
  RF.questCheck(s);RF.save(s)
};

const v3Pulse=RF.worldPulse;RF.worldPulse=function(s,minutes){v3Pulse(s,minutes);if(!s?.crime)return;s.crime.heat=Math.max(0,s.crime.heat-minutes*.015);if(s.crime.bounty>0&&Math.random()<.025){let place=s.location;if(['greenvale','watchtower','ironridge'].includes(place)){RF.log(s,'A guard studies a bounty notice, then scans the crowd.','bad')}}};
const v3FinishTravel=RF.finishTravel;RF.finishTravel=function(a){v3FinishTravel(a);let s=RF.state;if(!s)return;if(['northroad','quarry'].includes(s.location)&&!s.combat&&Math.random()<.22)RF.spawnEnemy('ridge_raider');if(s.crime.bounty>0&&['greenvale','watchtower','ironridge'].includes(s.location)&&Math.random()<Math.min(.75,.2+s.crime.bounty/180)){
  s.speed=0;RF.UI.modal={type:'event',event:{title:'Recognised by the Watch',icon:'🚨',text:`A guard points at you. “That face. Bounty says ${s.crime.bounty} gold.”`,choices:[
    {text:`Pay ${s.crime.bounty}g`,condition:ss=>ss.gold>=ss.crime.bounty,result:ss=>{let b=ss.crime.bounty;ss.gold-=b;ss.crime.bounty=0;ss.crime.heat=0;ss.flags.wanted=false;return `You pay ${b} gold. The notice is struck through.`;}},
    {text:'Talk your way out',condition:ss=>ss.skills.speech.level>=5||RF.perkRank(ss,'silver_tongue')>=2,result:ss=>{ss.crime.heat=Math.max(0,ss.crime.heat-25);RF.addXp(ss,'speech',35);return 'You produce enough plausible names, dates and indignation that the guard loses confidence.';}},
    {text:'Run',result:ss=>{RF.addBounty(ss,12,'fleeing the watch');ss.location=ss.location==='ironridge'?'northroad':'crossroads';return 'You bolt through the nearest gap and disappear into the road traffic.';}}
  ]}};RF.UI.render(s)
 }};

// Production XP perk hooks
const v3AddXp=RF.addXp;RF.addXp=function(s,skill,amount){let prod=['smithing','cooking','crafting','herblore'];if(prod.includes(skill))amount=Math.round(amount*(1+RF.perkRank(s,'craftsman')*.12));return v3AddXp(s,skill,amount)};
const v3Price=RF.priceFactor;RF.priceFactor=function(s,id,buy=true){let f=v3Price(s,id,buy),r=RF.perkRank(s,'silver_tongue');return buy?f*(1-r*.035):f*(1+r*.04)};

// V3 UI
const v3ActionButton=RF.UI.actionButton.bind(RF.UI);RF.UI.actionButton=function(a,s){if(a==='delve')return `<button class="action danger" data-action="delve" ${s.activity||s.combat?'disabled':''}><span class="emoji">🕯️</span><b>Delve Deeper</b><small>Dungeon combat & rare loot</small></button>`;return v3ActionButton(a,s)};
RF.UI.combat=function(s){let e=s.combat,enemy=RF.DATA.enemies[e.id],smoke=RF.perkRank(s,'vanish')&&(s.inventory.smoke_bomb||0)>0;return `<div class="card combatV3"><div class="questTitle"><h3>Combat</h3><span class="rarityTag">STAMINA ${Math.floor(s.player.stamina)}</span></div><div class="combatant"><div class="combatIcon">${enemy.icon}</div><div class="grow"><b>${enemy.name} • Lv ${enemy.level}</b><div class="tiny">HP ${Math.max(0,Math.ceil(e.hp))}/${enemy.hp}</div><div class="bar"><div class="fill hp" style="width:${100*e.hp/enemy.hp}%"></div></div></div></div><div class="combatBtns"><button class="action primary" data-combat="attack"><b>⚔️ Attack</b><small>Reliable strike</small></button><button class="action" data-combat="heavy"><b>🪓 Heavy</b><small>Harder, less accurate</small></button><button class="action skillAction" data-combat="power"><b>💥 Power Strike</b><small>High damage • stamina</small></button><button class="action skillAction" data-combat="precision"><b>🎯 Precise Strike</b><small>Accurate • crit chance</small></button><button class="action" data-combat="defend"><b>🛡️ Defend</b><small>Reduce next hit</small></button><button class="action danger" data-combat="flee"><b>🏃 Flee</b><small>Attempt escape</small></button>${smoke?'<button class="action" data-combat="smoke"><b>💨 Vanish</b><small>Consume Smoke Bomb</small></button>':''}</div></div>`};

const v3Char=RF.UI.character.bind(RF.UI);RF.UI.character=function(s){let base=v3Char(s);let trees=[...new Set(Object.values(RF.DATA.perks).map(p=>p.tree))];let perks=`<section class="card"><div class="questTitle"><h3>Perks</h3><span class="perkPoints">${s.perkPoints} POINT${s.perkPoints===1?'':'S'}</span></div><div class="sub">Earn one perk point every 3 character levels. Builds now diverge permanently in capability, not in access.</div>${trees.map(tree=>`<h3 class="treeTitle">${tree}</h3><div class="list">${Object.entries(RF.DATA.perks).filter(([id,p])=>p.tree===tree).map(([id,p])=>{let r=RF.perkRank(s,id),can=RF.canBuyPerk(s,id);return `<div class="row perkRow"><div class="icon">${p.icon}</div><div class="meta"><b>${p.name} <span class="tiny">${r}/${p.max}</span></b><small>${p.desc}${p.requires?.length?' • Requires '+p.requires.map(x=>RF.DATA.perks[x].name).join(', '):''}</small></div><button data-perk="${id}" ${can?'':'disabled'}>${r>=p.max?'MAX':'Learn'}</button></div>`}).join('')}</div>`).join('')}</section>`;
 let crime=`<section class="card"><h3>Law & Infamy</h3><div class="statsGrid"><div class="statbox"><span>🚨 Bounty</span><b>${s.crime.bounty}g</b></div><div class="statbox"><span>🔥 Heat</span><b>${Math.round(s.crime.heat)}%</b></div><div class="statbox"><span>🕶️ Underworld</span><b>${s.reputation.underworld}</b></div><div class="statbox"><span>🫳 Thefts</span><b>${s.crime.thefts}</b></div></div>${s.crime.bounty&&s.gold>=s.crime.bounty?`<button class="action" data-pay-bounty style="width:100%;margin-top:9px"><b>Pay bounty • ${s.crime.bounty}g</b></button>`:''}</section>`;
 return base+perks+crime};

const v3World=RF.UI.world.bind(RF.UI);RF.UI.world=function(s){let base=v3World(s);let crime='';if(['greenvale','mill','ironridge'].includes(s.location)&&!s.combat&&!s.activity){crime=`<section class="card shadowCard"><h3>Less Reputable Options</h3><div class="grid2"><button class="action" data-crime="pickpocket"><span class="emoji">🫳</span><b>Pickpocket</b><small>Risk bounty for quick gold</small></button><button class="action danger" data-crime="burglary"><span class="emoji">🪟</span><b>Burglary</b><small>Higher stakes, higher reward</small></button></div></section>`}
 let dungeon='';if(s.location==='crypt')dungeon=`<section class="card"><h3>Forgotten Crypt</h3><div class="statsGrid"><div class="statbox"><span>Depth</span><b>${s.dungeons.crypt.depth}</b></div><div class="statbox"><span>Status</span><b>${s.dungeons.crypt.cleared?'CLEARED':'UNCLEARED'}</b></div></div></section>`;if(s.location==='ember_cave')dungeon=`<section class="card"><h3>Emberdeep</h3><div class="statsGrid"><div class="statbox"><span>Depth</span><b>${s.dungeons.ember.depth}</b></div><div class="statbox"><span>Status</span><b>${s.dungeons.ember.cleared?'CHARTED':'DANGEROUS'}</b></div></div></section>`;
 return base.replace('<section class="card"><h3>World Feed</h3>',dungeon+crime+'<section class="card"><h3>World Feed</h3>')};

const v3Inventory=RF.UI.inventory.bind(RF.UI);RF.UI.inventory=function(s){let html=v3Inventory(s);return html.replace(/<b>([^<]+)<\/b><small>/g,(m,n)=>{let id=Object.keys(RF.DATA.items).find(k=>RF.DATA.items[k].name===n),r=id&&RF.DATA.items[id].rarity;return `<b>${n}${r?` <span class="rarityTag ${r.toLowerCase()}">${r}</span>`:''}</b><small>`})};

RF.UI.characterEquipment=function(s){return ['main','head','chest','legs','boots','ring1','ring2'].map(slot=>{let id=s.equipment[slot],it=id?RF.DATA.items[id]:null;return `<div class="row"><div class="icon">${it?.icon||'▫️'}</div><div class="meta"><b>${slot.toUpperCase()}</b><small>${it?.name||'Empty slot'}</small></div></div>`}).join('')};
// Replace equipment section inside character output with expanded slots.
const v3Char2=RF.UI.character.bind(RF.UI);RF.UI.character=function(s){let html=v3Char2(s);let start='<section class="card"><h3>Equipment</h3><div class="list">',idx=html.indexOf(start);if(idx>=0){let end=html.indexOf('</div></section>',idx);if(end>=0)html=html.slice(0,idx)+start+RF.UI.characterEquipment(s)+html.slice(end)}return html};


const v3Shop=RF.UI.shop.bind(RF.UI);RF.UI.shop=function(s){
  if(s.location!=='ironridge')return v3Shop(s);
  let stock=['bread','potion','iron_ore','coal','steel_bar','steel_sword','steel_helm','smoke_bomb'];
  return `<section class="card"><h2>Ironridge Forge Market</h2><div class="sub">Hard metal, hot furnaces and northern prices. Trading, reputation and world supply still apply.</div><div class="list" style="margin-top:10px">${stock.map(id=>{let it=RF.DATA.items[id],price=RF.marketPrice(s,id,true);return `<div class="row"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>${it.desc}</small></div><span class="qty">${price}g</span><button data-buy="${id}" data-price="${price}" ${s.gold>=price?'':'disabled'}>Buy</button></div>`}).join('')}</div></section><section class="card"><h3>Sell to the Forges</h3><div class="list">${Object.entries(s.inventory).filter(([id])=>RF.DATA.items[id]?.value>0).map(([id,q])=>{let it=RF.DATA.items[id],price=RF.marketPrice(s,id,false);return `<div class="row"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>Owned: ${q}</small></div><span class="qty">${price}g</span><button data-sell="${id}" data-price="${price}">Sell 1</button></div>`}).join('')}</div></section>`;
};

const v3Bind=RF.UI.bind.bind(RF.UI);RF.UI.bind=function(s){v3Bind(s);document.querySelectorAll('[data-perk]').forEach(b=>b.onclick=()=>RF.buyPerk(b.dataset.perk));document.querySelectorAll('[data-crime]').forEach(b=>b.onclick=()=>RF.commitCrime(b.dataset.crime));document.querySelector('[data-pay-bounty]')?.addEventListener('click',()=>RF.payBounty())};

RF.migrateV3(RF.state);if(RF.state){RF.log(RF.state,'Realmforge V3 awakened: perks, combat techniques, crime, dungeons and Ironridge are now active.','important');RF.save(RF.state);RF.UI.render(RF.state)};
