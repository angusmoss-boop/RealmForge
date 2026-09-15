window.RF=window.RF||{};
RF.VERSION='10.25.0';

/* Realmforge V10.25 - Into the Unknown
   - Explore is available in every location.
   - Exploring can uncover people, events, enemies, traps, local finds and rare locked chests.
   - Three exploration chest tiers use Thieving + carried lockpicks and the existing lockpicking minigame.
   - Discovered chests persist at their location until opened.
*/

(function(){
'use strict';
const RF=window.RF;if(!RF?.DATA)return;
RF.V1025=RF.V1025||{};
RF.V1025.version='10.25.0';

// Explore belongs to every location. Keep existing action order and append it only where missing.
Object.values(RF.DATA.locations||{}).forEach(l=>{
  l.actions=Array.isArray(l.actions)?l.actions:[];
  if(!l.actions.includes('explore'))l.actions.push('explore');
});

RF.V1025.CHESTS={
  low:{key:'low',name:'Weathered Chest',icon:'🧰',label:'TIER I',level:3,color:'#b99362',desc:'A small road-worn chest with an ordinary pin lock.'},
  medium:{key:'medium',name:'Ironbound Chest',icon:'🗃️',label:'TIER II',level:8,color:'#b7bec8',desc:'Iron straps reinforce a heavier chest. The lock is much less forgiving.'},
  rare:{key:'rare',name:'Gilded Strongbox',icon:'✨',label:'TIER III',level:15,color:'#e1bd63',desc:'An unusually fine strongbox, hidden well enough that somebody cared about its contents.'}
};

// Fixed lock definitions let the existing lockpicking interface handle the tactile part.
Object.values(RF.V1025.CHESTS).forEach(c=>{
  RF.DATA.lockSites=RF.DATA.lockSites||{};
  RF.DATA.lockSites[`v1025_${c.key}`]={name:c.name,location:null,level:c.level,desc:c.desc,rewards:[]};
});

RF.migrateV1025=function(s){
  if(!s)return s;
  s.version='10.25.0';s.flags=s.flags||{};s.stats=s.stats||{};
  s.v1025=s.v1025||{};s.v1025.chests=s.v1025.chests||{};
  ['explores','explorePeople','exploreEnemyEvents','exploreTraps','exploreFinds','exploreChestsFound','exploreChestsOpened'].forEach(k=>{if(s.stats[k]==null)s.stats[k]=0});
  ['low','medium','rare'].forEach(t=>{const a=`exploreChestFound_${t}`,b=`exploreChestOpened_${t}`;if(s.stats[a]==null)s.stats[a]=0;if(s.stats[b]==null)s.stats[b]=0});
  return s;
};
const v1025New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1025(v1025New(...a))};
const v1025Load=RF.load;RF.load=function(){return RF.migrateV1025(v1025Load())};
const v1025Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1025(v1025Import(x))};
if(RF.V95){RF.V95.SCHEMA='10.25.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.migrateV1025(oldMig(s));}

RF.V1025.clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
RF.V1025.skill=(s,id)=>Math.max(1,Number(s?.skills?.[id]?.level)||1);
RF.V1025.chestAt=(s,loc=s?.location)=>s?.v1025?.chests?.[loc]||null;
RF.V1025.chestDef=c=>RF.V1025.CHESTS[typeof c==='string'?c:c?.tier]||RF.V1025.CHESTS.low;
RF.V1025.lockpickItems=function(s){
  return Object.entries(s?.inventory||{}).filter(([id,q])=>q>0&&(id==='lockpick'||id==='master_lockpick'||RF.DATA.items?.[id]?.tool==='lockpicking')).map(([id])=>id);
};
RF.V1025.hasLockpick=s=>RF.V1025.lockpickItems(s).length>0;
RF.V1025.consumeBreakablePick=function(s){
  if((s.inventory?.lockpick||0)>0){RF.takeItem(s,'lockpick',1);return 'Lockpick';}
  if((s.inventory?.master_lockpick||0)>0){RF.takeItem(s,'master_lockpick',1);return RF.DATA.items.master_lockpick?.name||'Fine Lockpick';}
  return null; // Proper tool sets are durable.
};

RF.V1025.chestFindRoll=function(s){
  const exp=RF.V1025.skill(s,'exploration'),scav=RF.perkRank?RF.perkRank(s,'scavenger')||0:0;
  // Roughly 1.8% at low levels, rising gently with mastery. Rare chests remain genuinely rare.
  const chance=Math.min(.038,.018+exp*.00012+scav*.0025);
  if(Math.random()>=chance)return null;
  const rare=.03+Math.min(.05,exp*.0005),medium=.20+Math.min(.15,exp*.0015),r=Math.random();
  if(r<rare)return'rare';
  if(r<rare+medium)return'medium';
  return'low';
};

RF.V1025.findChest=function(s,tier){
  if(!tier||RF.V1025.chestAt(s))return false;
  const c=RF.V1025.CHESTS[tier];
  s.v1025.chests[s.location]={tier,location:s.location,day:s.day,minute:s.minute};
  s.stats.exploreChestsFound++;s.stats[`exploreChestFound_${tier}`]++;
  RF.addXp(s,'exploration',tier==='rare'?55:tier==='medium'?34:22);
  RF.log(s,`Exploration find: ${c.name}. It remains hidden here until you deal with it.`,'important');
  RF.save(s);RF.UI.modal={type:'v1025Chest',location:s.location};RF.UI.render(s);return true;
};

RF.V1025.openChest=function(loc=RF.state?.location){
  const s=RF.state,ch=RF.V1025.chestAt(s,loc);if(!s||!ch)return;
  if(s.location!==loc){RF.UI.modal={type:'message',title:'Chest Left Behind',text:'That chest is still marked at the location where you found it.'};return RF.UI.render(s)}
  RF.UI.modal={type:'v1025Chest',location:loc};RF.UI.render(s);
};

RF.V1025.startChestLock=function(loc=RF.state?.location){
  const s=RF.state,ch=RF.V1025.chestAt(s,loc);if(!s||!ch||s.location!==loc)return;
  const c=RF.V1025.chestDef(ch),th=RF.V1025.skill(s,'thieving');
  if(th<c.level){RF.UI.modal={type:'message',title:'Lock Beyond Your Skill',text:`${c.name} requires Thieving level ${c.level}. Your Thieving is level ${th}. The chest remains marked here.`};return RF.UI.render(s)}
  if(!RF.V1025.hasLockpick(s)){RF.UI.modal={type:'message',title:'No Lockpick',text:'You need to carry a lockpick or lockpicking tool. The chest remains here until you return prepared.'};return RF.UI.render(s)}
  if(typeof RF.startLockpick!=='function')return;
  const id=`v1025_${ch.tier}`;s.v7=s.v7||{};s.v7.locks=s.v7.locks||{};s.v7.locks[id]={opened:false};
  RF.UI.modal=null;RF.startLockpick(id);
  if(RF.actionGame?.type==='lockpick'){
    RF.actionGame.v1025Chest={location:loc,tier:ch.tier};
    RF.actionGame.message=`${c.label}: feel for the first tumbler.`;
    RF.save(s);RF.UI.render(s);
  }
};

RF.V1025.regionMaterialPool=function(s){
  const loc=s.location,l=RF.DATA.locations?.[loc],keys=RF.DATA.locationResources?.[loc]||[];
  const local=keys.map(k=>RF.DATA.resourceDefs?.[k]?.item).filter(id=>RF.DATA.items?.[id]);
  if(local.length)return [...new Set(local)];
  if(l?.region==='Ironridge')return ['iron_ore','coal','steel_bar','silver_ore'].filter(id=>RF.DATA.items?.[id]);
  if(l?.region==='Mirefen')return ['redroot','alder_logs','bog_iron','mooncap','bait_grubs'].filter(id=>RF.DATA.items?.[id]);
  return ['herb','logs','copper_ore','tin_ore','iron_ore','wild_berries'].filter(id=>RF.DATA.items?.[id]);
};
RF.V1025.pickExisting=function(ids){const p=ids.filter(id=>RF.DATA.items?.[id]);return p.length?p[Math.floor(Math.random()*p.length)]:null;};
RF.V1025.grant=function(s,id,q,summary){if(!id||q<=0)return;const ok=RF.addItem(s,id,q);if(ok!==false)summary.push(`${RF.DATA.items[id]?.icon||'▫️'} ${RF.DATA.items[id]?.name||id} ×${q}`);};
RF.V1025.rollChestLoot=function(s,tier){
  const out=[],mats=RF.V1025.regionMaterialPool(s);let gold=0;
  if(tier==='low'){
    gold=10+Math.floor(Math.random()*21);
    const id=RF.V1025.pickExisting(mats);RF.V1025.grant(s,id,1+Math.floor(Math.random()*3),out);
    if(Math.random()<.22)RF.V1025.grant(s,RF.V1025.pickExisting(['bread','potion','lockpick']),1,out);
  }else if(tier==='medium'){
    gold=32+Math.floor(Math.random()*49);
    RF.V1025.grant(s,RF.V1025.pickExisting(mats),2+Math.floor(Math.random()*3),out);
    const gear=['rusty_sword','bronze_sword','bronze_buckler','leather_vest','iron_helm','shortbow'];
    RF.V1025.grant(s,RF.V1025.pickExisting(gear),1,out);
    if(Math.random()<.28)RF.V1025.grant(s,RF.V1025.pickExisting(['fine_lockpick','field_tonic','iron_bar']),1,out);
  }else{
    gold=90+Math.floor(Math.random()*111);
    RF.V1025.grant(s,RF.V1025.pickExisting(mats),3+Math.floor(Math.random()*4),out);
    RF.V1025.grant(s,RF.V1025.pickExisting(['silver_ore','silver_bar','steel_bar','ember_shard','ghost_orchid']),1+Math.floor(Math.random()*2),out);
    // Better equipment, but no boss-exclusive uniques.
    RF.V1025.grant(s,RF.V1025.pickExisting(['iron_sword','steel_sword','steel_helm','steel_cuirass','fen_leathers','marshbow','silvered_blade','master_picks']),1,out);
  }
  s.gold+=gold;s.stats.goldEarned=(s.stats.goldEarned||0)+gold;out.unshift(`🪙 ${gold} gold`);return out;
};

// V10 originally wrapped setTumbler for Energy before this patch exists. Our chest-specific
// implementation therefore spends lockpicking Energy explicitly and leaves every older lock alone.
const v1025SetTumblerBase=RF.setTumbler;
RF.setTumbler=function(){
  const s=RF.state,g=RF.actionGame;if(!g?.v1025Chest)return v1025SetTumblerBase?.apply(this,arguments);
  const def=RF.DATA.lockSites[g.id],c=RF.V1025.chestDef(g.v1025Chest.tier);if(!s||!def)return;
  const cost=RF.v10EnergyCost?RF.v10EnergyCost('lockpick'):2;if(RF.v10SpendEnergy&&!RF.v10SpendEnergy(s,cost))return;
  const tool=RF.bestTool?.(s,'lockpicking'),needle=RF.lockNeedle(g),target=g.targets[g.pin];
  const tierPenalty=c.key==='rare'?2.5:c.key==='medium'?1.25:0;
  const tol=Math.max(6,11+(tool?.control||0)*65+Math.min(7,RF.V1025.skill(s,'thieving')*.25)-tierPenalty),dist=Math.abs(needle-target);
  if(dist<=tol){
    g.pin++;g.started=Date.now();g.message=dist<tol*.3?'✨ Clean click.':`Click. ${g.pins-g.pin} tumbler${g.pins-g.pin===1?'':'s'} remain.`;RF.addXp(s,'thieving',5);
    if(g.pin>=g.pins)return RF.finishLockpick();
  }else{
    g.message='⚠️ The pick slips.';
    const snap=Math.max(.06,.27-(tool?.control||0)-RF.V1025.skill(s,'thieving')*.007+(c.key==='rare'?.05:c.key==='medium'?.025:0));
    if(Math.random()<snap){const broken=RF.V1025.consumeBreakablePick(s);if(broken)g.message=`💥 ${broken} snaps inside the keyway.`;}
    if(!RF.V1025.hasLockpick(s)){
      const snapSpeed=g.resumeSpeed??1,loc=g.v1025Chest.location;RF.actionGame=null;s.speed=snapSpeed;RF.save(s);
      RF.UI.modal={type:'message',title:'Out of Picks',text:`Your last usable pick is gone. The ${c.name} remains marked here, so you can return with another.`};RF.UI.render(s);return;
    }
  }
  RF.save(s);RF.UI.render(s);
};

const v1025FinishLockBase=RF.finishLockpick;
RF.finishLockpick=function(){
  const s=RF.state,g=RF.actionGame;if(!g?.v1025Chest)return v1025FinishLockBase?.apply(this,arguments);
  const loc=g.v1025Chest.location,tier=g.v1025Chest.tier,c=RF.V1025.CHESTS[tier],before=RF.activitySnapshot?.(s);
  const loot=RF.V1025.rollChestLoot(s,tier);
  RF.addXp(s,'thieving',tier==='rare'?150:tier==='medium'?92:55);
  RF.addXp(s,'exploration',tier==='rare'?70:tier==='medium'?40:24);
  s.stats.locksPicked=(s.stats.locksPicked||0)+1;s.stats.exploreChestsOpened++;s.stats[`exploreChestOpened_${tier}`]++;
  if(s.v1025?.chests)delete s.v1025.chests[loc];
  RF.advanceWorld(8+c.level);s.speed=g.resumeSpeed??1;RF.actionGame=null;RF.questCheck?.(s);RF.save(s);
  let pop=before&&RF.makeResult?.(s,before,`${c.name} Opened`,'🔓');
  if(pop){pop.note=`Inside: ${loot.join(' • ')}`;RF.UI.modal=pop;}
  else RF.UI.modal={type:'message',title:`${c.name} Opened`,text:`The lock yields. ${loot.join(' • ')}`};
  RF.log(s,`${c.name} opened: ${loot.join(', ')}.`,'important');RF.UI.render(s);
};

RF.V1025.localPeople=function(s){
  const named=(RF.npcsHere?.(s)||[]).map(n=>({...n,passer:false}));
  const pass=(RF.passersHere?.(s)||[]).map(n=>({...n,passer:true}));
  return [...named,...pass];
};
RF.V1025.showPerson=function(s){
  const people=RF.V1025.localPeople(s);if(!people.length)return false;
  const p=people[Math.floor(Math.random()*people.length)];s.stats.explorePeople++;
  RF.UI.modal={type:'v1025Person',person:{id:p.id,name:p.name,icon:p.icon||'🧑',job:p.job||'Traveller',passer:!!p.passer}};RF.save(s);RF.UI.render(s);return true;
};

RF.V1025.pickEnemy=function(s){
  let list=RF.refreshEncounters?.(s)||[];
  if(list.length)return list[Math.floor(Math.random()*list.length)].id;
  const l=RF.DATA.locations?.[s.location];let pool=[];
  if(l?.region==='Ironridge')pool=['ridge_raider'];
  else if(l?.region==='Mirefen')pool=['mudcrab','bog_spider'];
  else if(['greenvale','mill','crossroads','guildhall'].includes(s.location))pool=['rat'];
  pool=pool.filter(id=>RF.DATA.enemies?.[id]);return pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
};
RF.V1025.showEnemy=function(s){
  const id=RF.V1025.pickEnemy(s),e=RF.DATA.enemies?.[id];if(!e)return false;
  s.stats.exploreEnemyEvents++;RF.UI.modal={type:'v1025Enemy',id};RF.save(s);RF.UI.render(s);return true;
};
RF.V1025.enemyChoice=function(mode){
  const s=RF.state,m=RF.UI.modal,e=RF.DATA.enemies?.[m?.id];if(!s||!e)return;
  if(mode==='fight'){RF.UI.modal=null;return RF.startBattle(m.id,{forced:true,source:'explore'})}
  if(mode==='observe'&&RF.researchEnemy){RF.UI.modal=null;return RF.researchEnemy(m.id)}
  const exp=RF.V1025.skill(s,'exploration'),chance=RF.V1025.clamp(.78+exp*.004-(e.level||1)*.012,.32,.94);
  if(Math.random()<chance){RF.addXp(s,'exploration',10);RF.UI.modal={type:'message',title:'You Slip Away',text:`You read ${e.name}'s movement and quietly put distance between you.`};RF.save(s);RF.UI.render(s);}
  else{RF.log(s,`${e.name} notices your retreat and attacks.`,'bad');RF.UI.modal=null;RF.startBattle(m.id,{forced:true,source:'explore'});}
};

RF.V1025.trapFor=function(s){
  const id=s.location;
  if(['mine','deep_mine','quarry','ember_cave'].includes(id))return {icon:'🪨',name:'Unstable Ground',text:'A hollow crack runs through the floor just as loose stone begins to shift.',difficulty:6};
  if(['ruins','crypt','drowned_ruins'].includes(id))return {icon:'⚙️',name:'Old Mechanism',text:'Your boot stops above a pressure plate hidden beneath grit and old leaves.',difficulty:8};
  if(['marshroad','reedmere','mirewatch'].includes(id))return {icon:'🪤',name:'Fen Snare',text:'A cord vanishes beneath the reeds. Something has rigged this path to catch the unwary.',difficulty:7};
  if(['forest','sunmeadow'].includes(id))return {icon:'🪤',name:'Hunter’s Snare',text:'A bent sapling and a nearly invisible loop of cord wait beside the trail.',difficulty:5};
  return {icon:'⚠️',name:'Hidden Hazard',text:'A tripline and loose debris reveal a crude hazard somebody left for the next careless traveller.',difficulty:5};
};
RF.V1025.showTrap=function(s){const t=RF.V1025.trapFor(s);s.stats.exploreTraps++;RF.UI.modal={type:'v1025Trap',trap:t};RF.save(s);RF.UI.render(s);return true;};
RF.V1025.trapChoice=function(mode){
  const s=RF.state,m=RF.UI.modal,t=m?.trap;if(!s||!t)return;
  if(mode==='around'){
    RF.addXp(s,'exploration',8);RF.advanceWorld(4);RF.UI.modal={type:'message',title:'Long Way Around',text:'You mark the hazard and give it a wide berth. Slower, but painless.'};RF.save(s);return RF.UI.render(s);
  }
  const exp=RF.V1025.skill(s,'exploration'),th=RF.V1025.skill(s,'thieving'),tool=RF.bestTool?.(s,'lockpicking'),chance=RF.V1025.clamp(.42+exp*.013+th*.016+(tool?.control||0)*.45-t.difficulty*.025,.22,.94);
  if(Math.random()<chance){
    RF.addXp(s,'exploration',15+t.difficulty);RF.addXp(s,'thieving',9+t.difficulty);let salvage='';
    if(Math.random()<.25){const id=RF.V1025.pickExisting(['lockpick','whetstone','waxed_thread','arrow']);if(id&&RF.addItem(s,id,1)!==false)salvage=` You salvage ${RF.DATA.items[id].name}.`;}
    RF.UI.modal={type:'message',title:'Trap Disarmed',text:`You trace the mechanism, take the tension out of it and leave the path safer than you found it.${salvage}`};
  }else{
    const hit=3+t.difficulty+Math.floor(Math.random()*5);s.player.hp=Math.max(1,s.player.hp-hit);s.player.stamina=Math.max(0,(s.player.stamina||0)-(6+t.difficulty));s.player.energy=Math.max(0,(s.player.energy||0)-Math.max(2,Math.floor(t.difficulty/2)));RF.addXp(s,'exploration',5);
    RF.UI.modal={type:'message',title:'Trap Triggered',text:`The mechanism snaps before you finish. You take ${hit} damage and lose some Stamina and Energy, but manage to pull free.`};
  }
  RF.save(s);RF.UI.render(s);
};

RF.V1025.localFind=function(s){
  s.stats.exploreFinds++;let pool=RF.V1025.regionMaterialPool(s),id=RF.V1025.pickExisting(pool),text='You search side paths, walls and forgotten corners.';
  if(id&&Math.random()<.68){const q=1+(Math.random()<.25?1:0),ok=RF.addItem(s,id,q);if(ok!==false)text=`A careful search turns up ${q} × ${RF.DATA.items[id].name}. Not a treasure haul, but useful.`;}
  else if(Math.random()<.45){const gold=3+Math.floor(Math.random()*10);s.gold+=gold;s.stats.goldEarned=(s.stats.goldEarned||0)+gold;text=`You find ${gold} loose gold tucked somewhere nobody has checked in a while.`;}
  else text='You uncover tracks, old markings and a few useful details about the area, but nothing worth carrying.';
  RF.addXp(s,'exploration',18);RF.UI.modal={type:'message',title:'Local Discovery',text};RF.save(s);RF.UI.render(s);return true;
};

// Preserve the important one-off discoveries from the original Explore implementation.
RF.V1025.legacyDiscovery=function(s){
  if(s.location==='mine'&&RF.V1025.skill(s,'exploration')>=3&&!s.flags.deepMineFound){s.flags.deepMineFound=true;RF.addXp(s,'exploration',30);RF.log(s,'You find a boarded tunnel marked with an unfamiliar crest.','important');RF.UI.modal={type:'message',title:'A Deeper Way',text:'Behind old boards you uncover the entrance to the Deep Galleries.'};return true;}
  if(s.location==='ruins'&&!s.flags.ruinsSearched){s.flags.ruinsSearched=true;RF.addItem(s,'old_map',1);RF.addXp(s,'exploration',25);RF.UI.modal={type:'message',title:'Map Beneath the Stone',text:'Beneath a loose flagstone you discover part of an old map.'};return true;}
  if(s.location==='crossroads'&&!s.flags.banditCampKnown&&s.flags.woundedMerchantResolved){s.flags.banditCampKnown=true;RF.addXp(s,'exploration',28);RF.UI.modal={type:'message',title:'Black Thread Trail',text:'Fresh bootprints and scraps of black thread reveal a hidden trail east toward Blackthorn Camp.'};return true;}
  if(s.location==='bandit_camp'&&s.flags.vossRevealed&&!s.flags.vossDefeated&&!s.combat){RF.log(s,'You find the command tent. Captain Voss steps from behind the canvas.','important');setTimeout(()=>RF.spawnEnemy?.('captain_voss'),40);return true;}
  return false;
};

RF.V1025.finishExplore=function(){
  const s=RF.state;if(!s)return;s.activity=null;s.stats.explores++;RF.addXp(s,'exploration',12);RF.questCheck?.(s);
  if(RF.V1025.legacyDiscovery(s)){RF.save(s);RF.UI.render(s);return;}
  if(!RF.V1025.chestAt(s)){const tier=RF.V1025.chestFindRoll(s);if(tier){RF.V1025.findChest(s,tier);return;}}
  const people=RF.V1025.localPeople(s).length,hasEnemy=!!RF.V1025.pickEnemy(s),wild=!!RF.DATA.locations?.[s.location]?.wild||!!RF.fieldTables?.[s.location];
  // Weighted local-adventure outcomes. Missing categories naturally fall through.
  let roll=Math.random();
  if(people&&roll<.20){RF.V1025.showPerson(s);return;}
  if(roll<.38){RF.save(s);if(RF.tryEvent?.(true))return;}
  if(hasEnemy&&roll<(wild?.58:.50)){RF.V1025.showEnemy(s);return;}
  if(roll<(wild?.74:.62)){RF.V1025.showTrap(s);return;}
  if(roll<.91){RF.V1025.localFind(s);return;}
  RF.addXp(s,'exploration',8);RF.save(s);RF.UI.modal={type:'message',title:'Quiet Search',text:'You range through the area, learn its paths a little better, and return without finding anything dramatic.'};RF.UI.render(s);
};

// Explore uses the familiar timed activity presentation but now resolves through V10.25's encounter table.
const v1025ActionBase=RF.action;
RF.action=function(a){
  if(a!=='explore')return v1025ActionBase?.apply(this,arguments);
  const s=RF.state;if(!s||s.activity||s.combat||RF.actionGame)return;
  const l=RF.DATA.locations?.[s.location];RF.startActivity('explore',`Exploring ${l?.name||'the area'}`,13);
};
const v1025FinishActivityBase=RF.finishActivity;
RF.finishActivity=function(a){if(a?.type==='explore')return RF.V1025.finishExplore();return v1025FinishActivityBase?.apply(this,arguments)};

// ---------- UI ----------
const v1025ActionButtonBase=RF.UI.actionButton.bind(RF.UI);
RF.UI.actionButton=function(a,s){
  if(a==='explore')return `<button class="action primary" data-action="explore" ${s.activity||s.combat?'disabled':''}><span class="emoji">🧭</span><b>Explore</b><small>People • danger • events • rare finds</small></button>`;
  return v1025ActionButtonBase(a,s);
};
RF.V1025.chestPanel=function(s){
  const ch=RF.V1025.chestAt(s),c=ch&&RF.V1025.chestDef(ch);if(!ch||!c)return'';
  const th=RF.V1025.skill(s,'thieving'),pick=RF.V1025.hasLockpick(s);
  return `<section class="card v1025ChestPanel"><div class="questTitle"><h3>${c.icon} Discovered Chest</h3><span class="tag">${c.label}</span></div><div class="sub">${c.name} • Thieving Lv ${c.level}<br>${th>=c.level?'✅ Skill ready':`🔒 Thieving ${th}/${c.level}`} • ${pick?'✅ Lockpick carried':'🗝️ Bring a lockpick'}</div><button class="action v1025Wide" data-v1025-open-chest="${s.location}" ${s.activity||s.combat?'disabled':''}><b>Inspect ${c.name}</b><small>The chest remains here until opened.</small></button></section>`;
};
const v1025WorldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){let h=v1025WorldBase(s),panel=RF.V1025.chestPanel(s);if(!panel)return h;const travel='<section class="card"><h3>Travel</h3>';return h.includes(travel)?h.replace(travel,panel+travel):h+panel;};

const v1025ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v1025Chest'){
    const ch=RF.V1025.chestAt(s,m.location),c=ch&&RF.V1025.chestDef(ch);if(!ch||!c){this.modal=null;return'';}
    const th=RF.V1025.skill(s,'thieving'),pick=RF.V1025.hasLockpick(s),tool=RF.bestTool?.(s,'lockpicking');
    return `<div class="modalBack"><div class="modal v1025ExploreModal"><div class="resultIcon">${c.icon}</div><span class="eyebrow">EXPLORE FIND • ${c.label}</span><h2>${c.name}</h2><div class="itemDesc">${c.desc}</div><div class="itemStats"><span>🗝️ Thieving Lv ${c.level}</span><span>${th>=c.level?'✅':'🔒'} Your level ${th}</span><span>${pick?'✅ Lockpick ready':'❌ No lockpick carried'}</span>${tool?`<span>🧰 Equipped: ${tool.name}</span>`:''}</div><div class="notice">Tier I tends toward gold and basic materials. Tier II can hold low-level gear. Tier III can contain valuable materials and substantially better equipment.</div><div class="choices"><button class="choice" data-v1025-pick-chest="${m.location}"><b>🗝️ Pick the Lock</b><small>${th<c.level?`Requires Thieving level ${c.level}.`:!pick?'You need to carry a lockpick or lockpicking tool.':'Begin the lockpicking minigame.'}</small></button><button class="choice" data-v1025-chest-close><b>Mark It and Leave</b><small>It will remain at this location.</small></button></div></div></div>`;
  }
  if(m?.type==='v1025Person'){
    const p=m.person;return `<div class="modalBack"><div class="modal v1025ExploreModal"><div class="resultIcon">${p.icon}</div><span class="eyebrow">LOCAL ENCOUNTER</span><h2>${p.name}</h2><div class="itemDesc">While exploring, you cross paths with ${p.name}, ${String(p.job||'traveller').toLowerCase()}.</div><div class="choices"><button class="choice" data-v1025-talk="${p.id}" data-passer="${p.passer?'1':'0'}"><b>💬 Speak to them</b><small>Open the normal conversation system.</small></button><button class="choice" data-v1025-close><b>Keep Exploring Another Time</b></button></div></div></div>`;
  }
  if(m?.type==='v1025Enemy'){
    const e=RF.DATA.enemies?.[m.id];if(!e){this.modal=null;return'';}return `<div class="modalBack"><div class="modal v1025ExploreModal"><div class="resultIcon">${e.icon}</div><span class="eyebrow">DANGER FOUND • LV ${e.level}</span><h2>${e.name}</h2><div class="itemDesc">Your search carries you into its territory. You spot it before the encounter fully commits either way.</div><div class="choices"><button class="choice dangerChoice" data-v1025-enemy="fight"><b>⚔️ Fight</b><small>Enter tactical combat.</small></button>${RF.researchEnemy?`<button class="choice" data-v1025-enemy="observe"><b>📓 Observe from Cover</b><small>Gain field research, with some risk of provoking it.</small></button>`:''}<button class="choice" data-v1025-enemy="leave"><b>🌿 Back Away Carefully</b><small>Exploration skill improves your chance of leaving unnoticed.</small></button></div></div></div>`;
  }
  if(m?.type==='v1025Trap'){
    const t=m.trap;return `<div class="modalBack"><div class="modal v1025ExploreModal"><div class="resultIcon">${t.icon}</div><span class="eyebrow">HAZARD</span><h2>${t.name}</h2><div class="itemDesc">${t.text}</div><div class="choices"><button class="choice" data-v1025-trap="disarm"><b>🗝️ Inspect and Disarm</b><small>Exploration + Thieving. Equipped lockpicking tools help.</small></button><button class="choice" data-v1025-trap="around"><b>🧭 Take the Long Way Around</b><small>Safe, but costs a few extra in-game minutes.</small></button></div></div></div>`;
  }
  return v1025ModalBase(s);
};

if(!document.getElementById('rf-v1025-style')){
  const st=document.createElement('style');st.id='rf-v1025-style';st.textContent=`
  .v1025Wide{width:100%;margin-top:10px}.v1025ChestPanel .tag{white-space:nowrap}.v1025ExploreModal .itemStats{margin-top:10px}.v1025ExploreModal .notice{margin-top:12px}.v1025ExploreModal .choices{margin-top:12px}
  `;document.head.appendChild(st);
}

const v1025BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v1025BindBase(s||RF.state);
  document.querySelectorAll('[data-v1025-open-chest]').forEach(b=>b.onclick=()=>RF.V1025.openChest(b.dataset.v1025OpenChest));
  document.querySelectorAll('[data-v1025-pick-chest]').forEach(b=>b.onclick=()=>RF.V1025.startChestLock(b.dataset.v1025PickChest));
  document.querySelectorAll('[data-v1025-chest-close],[data-v1025-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
  document.querySelectorAll('[data-v1025-talk]').forEach(b=>b.onclick=()=>{const id=b.dataset.v1025Talk,pass=b.dataset.passer==='1';RF.UI.modal=null;RF.openDialogue?.(id,pass)});
  document.querySelectorAll('[data-v1025-enemy]').forEach(b=>b.onclick=()=>RF.V1025.enemyChoice(b.dataset.v1025Enemy));
  document.querySelectorAll('[data-v1025-trap]').forEach(b=>b.onclick=()=>RF.V1025.trapChoice(b.dataset.v1025Trap));
};

if(RF.state){
  RF.migrateV1025(RF.state);
  if(!RF.state.flags.v1025Seen){RF.state.flags.v1025Seen=true;RF.log(RF.state,'V10.25: Explore is now a full local-adventure system with people, events, danger, traps, discoveries and rare locked chests.','important')}
  RF.save(RF.state);RF.UI.render(RF.state);
}
})();
