window.RF=window.RF||{};
RF.VERSION='10.27.0';

/* Realmforge V10.27 — Locks & Locality
   - Circular active lockpicking for exploration chests and burglary locks.
   - Chest difficulty rises sharply by tier; 3 failed picks permanently jam/lost a chest.
   - Lockpicks are stackable consumables, never Tool Belt equipment, and every failed lock attempt breaks one.
   - Iron lockpicks are smithable through the normal active forge system.
   - Explore enemies and discoveries are pulled from the current location's actual ecosystem/resources.
   - Persisting discovered chests live inside the location's Actions grid until opened, jammed or otherwise removed.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF?.DATA)return;
RF.V1027=RF.V1027||{};RF.V1027.version='10.27.0';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// ---------- Lockpicks: one stackable consumable ----------
const legacyPickValue={master_lockpick:2,fine_lockpick:4,master_picks:8};
const legacyPickIds=Object.keys(legacyPickValue);
RF.DATA.items.lockpick=Object.assign(RF.DATA.items.lockpick||{}, {
  name:'Lockpick',icon:'🗝️',type:'utility',value:9,
  desc:'A slender iron pick for locks. Stackable and consumed whenever a lockpicking attempt fails.'
});
// Old premium pick sets are retained only as migration aliases so historic content never crashes.
legacyPickIds.forEach(id=>{const it=RF.DATA.items[id];if(it){delete it.tool;delete it.tier;delete it.power;delete it.control;it.type='utility';it.hidden=true;it.desc='Legacy lockpick item. Existing copies are converted into ordinary stackable Lockpicks.';}});

// Smithable exactly like other iron work, through the active forge minigame.
RF.DATA.recipes=RF.DATA.recipes||{};
RF.DATA.recipes.iron_lockpicks={name:'Forge Lockpicks',skill:'smithing',level:4,time:10,inputs:{iron_bar:1},outputs:{lockpick:3},xp:44};

// Any old quest/event reward that still names an obsolete pick is transparently converted.
const v1027AddItemBase=RF.addItem;
RF.addItem=function(s,id,q=1,...rest){
  if(legacyPickValue[id])return v1027AddItemBase.call(this,s,'lockpick',Math.max(1,Math.floor(q))*legacyPickValue[id],...rest);
  return v1027AddItemBase.call(this,s,id,q,...rest);
};

RF.V1027.convertLegacyPicks=function(container){
  if(!container)return 0;let added=0;
  legacyPickIds.forEach(id=>{const q=Math.max(0,Math.floor(+container[id]||0));if(!q)return;added+=q*legacyPickValue[id];delete container[id];});
  if(added)container.lockpick=(container.lockpick||0)+added;
  return added;
};
RF.V1027.pickCount=s=>Math.max(0,Math.floor(+s?.inventory?.lockpick||0));
RF.V1027.hasPick=s=>RF.V1027.pickCount(s)>0;
RF.V1027.breakPick=function(s){if(!RF.V1027.hasPick(s))return false;RF.takeItem(s,'lockpick',1);s.stats=s.stats||{};s.stats.lockpicksBroken=(s.stats.lockpicksBroken||0)+1;return true;};

// V10.25 helpers now mean one thing only: an actual consumable Lockpick in the Pack.
if(RF.V1025){
  RF.V1025.lockpickItems=s=>RF.V1027.hasPick(s)?['lockpick']:[];
  RF.V1025.hasLockpick=RF.V1027.hasPick;
  RF.V1025.consumeBreakablePick=s=>RF.V1027.breakPick(s)?'Lockpick':null;
}

// Remove obsolete premium picks from permanent shops and dynamically generated NPC shops.
if(Array.isArray(RF.DATA.shopStock))RF.DATA.shopStock=RF.DATA.shopStock.filter(id=>!legacyPickIds.includes(id));
RF.V1027.cleanPickArrays=function(obj,seen=new Set()){
  if(!obj||typeof obj!=='object'||seen.has(obj))return;seen.add(obj);
  for(const [k,v] of Object.entries(obj)){
    if(Array.isArray(v)&&(k==='shop'||k==='wares'||k==='stock')){
      const mapped=v.map(id=>legacyPickIds.includes(id)?'lockpick':id);obj[k]=[...new Set(mapped)];
    }else if(v&&typeof v==='object')RF.V1027.cleanPickArrays(v,seen);
  }
};
RF.V1027.cleanPickArrays(RF.DATA);
if(typeof RF.v83ShopStock==='function'){
  const oldStock=RF.v83ShopStock;
  RF.v83ShopStock=function(s){return [...new Set((oldStock(s)||[]).map(id=>legacyPickIds.includes(id)?'lockpick':id))].filter(id=>RF.DATA.items[id]&&!RF.DATA.items[id].hidden)};
}

// ---------- Save migration ----------
RF.migrateV1027=function(s){
  if(!s)return s;s.version='10.27.0';s.stats=s.stats||{};s.v1025=s.v1025||{};s.v1025.chests=s.v1025.chests||{};
  ['lockpicksBroken','failedLockpicks','chestLocksJammed','burglaryLockFailures'].forEach(k=>{if(s.stats[k]==null)s.stats[k]=0});
  RF.V1027.convertLegacyPicks(s.inventory);RF.V1027.convertLegacyPicks(s.bank);
  s.toolbelt=s.toolbelt||{};if(s.toolbelt.lockpicking)s.toolbelt.lockpicking=null;
  Object.values(s.v1025.chests).forEach(ch=>{if(ch&&ch.failures==null)ch.failures=0;});
  return s;
};
const v1027New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1027(v1027New(...a))};
const v1027Load=RF.load;RF.load=function(){return RF.migrateV1027(v1027Load())};
const v1027Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1027(v1027Import(x))};
if(RF.V95){RF.V95.SCHEMA='10.27.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.migrateV1027(oldMig(s));}

// ---------- Area-local Explore pools ----------
RF.V1027.EXTRA_ENEMIES={
  greenvale:[['rat',4],['road_crow',1]],
  mill:[['rat',4],['road_crow',2]],
  guildhall:[['rat',1]],
  watchtower:[['wolf',2],['bandit',1],['road_crow',2]],
  ruins:[['grave_moth',3],['skeleton',1],['rat',1]],
  bandit_camp:[['bandit',5],['feral_hound',2]],
  ironridge:[['tunnel_beetle',2],['ridge_raider',1]]
};
RF.V1027.enemyTable=function(loc){return (RF.fieldTables?.[loc]||RF.V1027.EXTRA_ENEMIES[loc]||[]).filter(([id])=>RF.DATA.enemies?.[id]);};
RF.V1027.weightedEnemy=function(loc){
  const table=RF.V1027.enemyTable(loc);if(!table.length)return null;let total=table.reduce((a,[,w])=>a+(+w||1),0),r=Math.random()*total;
  for(const [id,w] of table){r-=+w||1;if(r<=0)return id;}return table[table.length-1][0];
};
if(RF.V1025)RF.V1025.pickEnemy=s=>RF.V1027.weightedEnemy(s?.location);

RF.V1027.LOCAL_EXTRAS={
  greenvale:['herb','wild_berries','bread'],mill:['bread','herb','logs'],guildhall:['field_tonic','bread','traveller_token'],
  watchtower:['arrow','field_tonic','bread','crow_feather'],ruins:['cave_mushroom','old_bone_dice','warding_salt'],
  crypt:['cave_mushroom','old_bone_dice','warding_salt'],crossroads:['wild_berries','bread','crow_feather'],
  bandit_camp:['arrow','bandit_token','smoke_bomb','lockpick'],northroad:['crow_feather','wolf_pelt','raider_token','herb'],
  ironridge:['iron_ore','coal','iron_bar','whetstone']
};
RF.V1027.localItemPool=function(s){
  const loc=s.location;
  // Exploration finds come only from resources physically present here plus a small curated
  // location list. Enemy drop tables are intentionally NOT merged in: some creatures roam
  // between biomes and can carry odd trophies that would make a local search feel misplaced.
  const res=(RF.DATA.locationResources?.[loc]||[]).map(k=>RF.DATA.resourceDefs?.[k]?.item).filter(Boolean);
  const extras=RF.V1027.LOCAL_EXTRAS[loc]||[];
  return [...new Set([...res,...extras])].filter(id=>RF.DATA.items?.[id]&&!RF.DATA.items[id].hidden);
};
if(RF.V1025){
  RF.V1025.regionMaterialPool=s=>RF.V1027.localItemPool(s);
  RF.V1025.localFind=function(s){
    s.stats.exploreFinds++;const pool=RF.V1027.localItemPool(s),id=RF.V1025.pickExisting(pool);let text=`You search ${RF.DATA.locations?.[s.location]?.name||'the area'} carefully.`;
    if(id&&Math.random()<.72){const q=1+(Math.random()<.22?1:0),ok=RF.addItem(s,id,q);if(ok!==false)text=`Your search turns up ${q} × ${RF.DATA.items[id].name}, something that actually belongs in this part of the world.`;}
    else if(Math.random()<.38){const gold=3+Math.floor(Math.random()*10);s.gold+=gold;s.stats.goldEarned=(s.stats.goldEarned||0)+gold;text=`You find ${gold} loose gold tucked into a plausible hiding place.`;}
    else text='You learn a little more about the local paths, tracks and hiding places, but find nothing worth carrying.';
    RF.addXp(s,'exploration',18);RF.UI.modal={type:'message',title:'Local Discovery',text};RF.save(s);RF.UI.render(s);return true;
  };
}

RF.V1027.gearPool=function(s,tier){
  const region=RF.DATA.locations?.[s.location]?.region||'Greenvale';
  const pools={
    Greenvale:{low:['rusty_sword','bronze_sword','bronze_buckler','leather_vest','shortbow'],medium:['iron_sword','iron_helm','ranger_cloak','bronze_buckler'],rare:['steel_sword','steel_helm','ranger_cloak']},
    Ironridge:{low:['bronze_sword','bronze_buckler','iron_helm','iron_sword'],medium:['iron_sword','steel_sword','steel_helm'],rare:['steel_sword','steel_helm','steel_cuirass','silvered_blade']},
    Mirefen:{low:['leather_vest','shortbow','bronze_buckler'],medium:['fen_leathers','marshbow','iron_sword'],rare:['fen_leathers','marshbow','mire_ring','silvered_blade']},
    'The Marches':{low:['iron_sword','iron_helm','shortbow'],medium:['steel_sword','steel_helm','ranger_cloak'],rare:['steel_sword','steel_cuirass','silvered_blade']}
  };
  return (pools[region]?.[tier]||pools.Greenvale[tier]||[]).filter(id=>RF.DATA.items?.[id]);
};
if(RF.V1025)RF.V1025.rollChestLoot=function(s,tier){
  const out=[],local=RF.V1027.localItemPool(s);let gold=0;
  if(tier==='low'){
    gold=9+Math.floor(Math.random()*25);RF.V1025.grant(s,RF.V1025.pickExisting(local),1+Math.floor(Math.random()*2),out);
    if(Math.random()<.20)RF.V1025.grant(s,RF.V1025.pickExisting(['bread','potion','lockpick']),1,out);
  }else if(tier==='medium'){
    gold=35+Math.floor(Math.random()*56);RF.V1025.grant(s,RF.V1025.pickExisting(local),2+Math.floor(Math.random()*3),out);
    RF.V1025.grant(s,RF.V1025.pickExisting(RF.V1027.gearPool(s,'medium')),1,out);
    if(Math.random()<.28)RF.V1025.grant(s,RF.V1025.pickExisting(['field_tonic','iron_bar','lockpick']),1,out);
  }else{
    gold=95+Math.floor(Math.random()*126);RF.V1025.grant(s,RF.V1025.pickExisting(local),3+Math.floor(Math.random()*4),out);
    const valuable=(RF.DATA.locations?.[s.location]?.region==='Mirefen'?['mire_pearl','ghost_orchid','mire_amber','bog_iron']:RF.DATA.locations?.[s.location]?.region==='Ironridge'?['silver_ore','silver_bar','steel_bar','ember_shard']:['silver_ore','silver_bar','steel_bar','lucky_charm']).filter(id=>RF.DATA.items?.[id]);
    RF.V1025.grant(s,RF.V1025.pickExisting(valuable),1+Math.floor(Math.random()*2),out);
    RF.V1025.grant(s,RF.V1025.pickExisting(RF.V1027.gearPool(s,'rare')),1,out);
  }
  s.gold+=gold;s.stats.goldEarned=(s.stats.goldEarned||0)+gold;out.unshift(`🪙 ${gold} gold`);return out;
};

// ---------- Circular lock engine ----------
RF.V1027.timer=null;
RF.V1027.stopTicker=function(){if(RF.V1027.timer){clearInterval(RF.V1027.timer);RF.V1027.timer=null;}};
RF.V1027.angle=function(g,now=Date.now()){return ((g.startAngle||0)+(now-(g.started||now))*(g.speed||.08))%360;};
RF.V1027.angleDiff=(a,b)=>Math.abs(((a-b+540)%360)-180);
RF.V1027.randomTarget=()=>24+Math.random()*312;
RF.V1027.chestProfile=function(s,tier){
  const c=RF.V1025?.CHESTS?.[tier]||{level:3},th=Math.max(1,s.skills?.thieving?.level||1),over=Math.max(0,th-c.level);
  const base=tier==='rare'?{tol:15,speed:.105,label:'Master'}:tier==='medium'?{tol:24,speed:.082,label:'Hard'}:{tol:36,speed:.061,label:'Simple'};
  return {required:c.level,tolerance:clamp(base.tol+Math.min(7,over*.45),10,43),speed:Math.max(.047,base.speed*(1-Math.min(.14,over*.008))),label:base.label};
};
RF.V1027.siteProfile=function(s,level=1){
  const th=Math.max(1,s.skills?.thieving?.level||1),over=Math.max(0,th-level);
  return {required:level,tolerance:clamp(39-level*1.65+Math.min(8,over*.5),13,40),speed:clamp(.054+level*.004-over*.0006,.05,.105),label:level>=10?'Master':level>=6?'Hard':'Simple'};
};
RF.V1027.burglaryProfile=function(s,site){
  const d=+site?.difficulty||45,th=Math.max(1,s.skills?.thieving?.level||1);
  return {required:1,tolerance:clamp(42-d*.32+th*.38,13,39),speed:clamp(.052+d*.00062-th*.0005,.05,.11),label:d>=70?'Master':d>=45?'Hard':'Simple'};
};
RF.V1027.startTicker=function(){
  RF.V1027.stopTicker();RF.V1027.timer=setInterval(()=>{
    const g=RF.actionGame;if(!g||g.type!=='v1027Lock'){RF.V1027.stopTicker();return;}
    const ang=RF.V1027.angle(g);g.lastVisualAngle=ang;
    const el=document.querySelector('.v1027Needle');if(el)el.style.transform=`rotate(${ang}deg)`;
  },33);
};
RF.V1027.startLock=function(opts){
  const s=RF.state;if(!s||s.combat||s.activity||RF.actionGame)return false;
  if(!RF.V1027.hasPick(s)){RF.UI.modal={type:'message',title:'No Lockpicks',text:'You need at least one Lockpick in your Pack. Lockpicks are stackable consumables and a failed attempt breaks one.'};RF.UI.render(s);return false;}
  const profile=opts.profile;if((s.skills?.thieving?.level||1)<(profile.required||1)){RF.UI.modal={type:'message',title:'Lock Beyond Your Skill',text:`This lock requires Thieving level ${profile.required}. Your Thieving is level ${s.skills?.thieving?.level||1}.`};RF.UI.render(s);return false;}
  const pauseSnap=RF.V96?.modalPaused&&RF.V96?.modalResume?RF.V96.modalResume:null;let resume=pauseSnap?(pauseSnap.paused?0:(pauseSnap.speed||1)):s.speed;if(resume===0&&!s.paused&&RF.V96?.lastNonZeroSpeed)resume=RF.V96.lastNonZeroSpeed;s.speed=0;s.paused=false;
  RF.actionGame={type:'v1027Lock',context:opts.context,title:opts.title||'Lock',icon:opts.icon||'🔐',tier:opts.tier||null,location:opts.location||s.location,siteId:opts.siteId||null,site:opts.site||null,
    target:RF.V1027.randomTarget(),tolerance:profile.tolerance,speed:profile.speed,difficulty:profile.label,required:profile.required||1,startAngle:Math.random()*360,started:Date.now(),resumeSpeed:resume,
    message:'Guide the moving pick into the green binding arc, then turn the lock.'};
  RF.UI.modal={type:'v7Action'};RF.UI.render(s);RF.V1027.startTicker();return true;
};
RF.V1027.resetAttempt=function(g,msg){g.target=RF.V1027.randomTarget();g.startAngle=Math.random()*360;g.started=Date.now();g.lastVisualAngle=g.startAngle;g.message=msg;};
RF.V1027.resume=function(messageModal=null){
  const s=RF.state,g=RF.actionGame;if(g?.resumeSpeed!=null&&!s.combat){s.speed=g.resumeSpeed;s.paused=s.speed===0;}RF.V1027.stopTicker();RF.actionGame=null;RF.UI.modal=messageModal;RF.save(s);RF.UI.render(s);
};

RF.V1027.finishChest=function(s,g){
  const ch=RF.V1025?.chestAt(s,g.location);if(!ch)return RF.V1027.resume({type:'message',title:'Chest Gone',text:'There is no longer a chest here.'});
  const tier=ch.tier,c=RF.V1025.CHESTS[tier],loot=RF.V1025.rollChestLoot(s,tier);
  RF.addXp(s,'thieving',tier==='rare'?150:tier==='medium'?92:55);RF.addXp(s,'exploration',tier==='rare'?70:tier==='medium'?40:24);
  s.stats.locksPicked=(s.stats.locksPicked||0)+1;s.stats.exploreChestsOpened=(s.stats.exploreChestsOpened||0)+1;s.stats[`exploreChestOpened_${tier}`]=(s.stats[`exploreChestOpened_${tier}`]||0)+1;
  delete s.v1025.chests[g.location];RF.advanceWorld(6+c.level);RF.questCheck?.(s);RF.log(s,`${c.name} opened: ${loot.join(', ')}.`,'important');
  RF.V1027.resume({type:'message',title:`${c.name} Opened`,text:`The lock turns cleanly. Inside: ${loot.join(' • ')}`});
};
RF.V1027.finishSite=function(s,g){
  const def=RF.DATA.lockSites?.[g.siteId],st=def&&RF.lockState?.(s,g.siteId);if(!def||!st)return RF.V1027.resume({type:'message',title:'Lock Gone',text:'The lock is no longer available.'});
  st.opened=true;s.stats.locksPicked=(s.stats.locksPicked||0)+1;RF.addXp(s,'thieving',35+def.level*6);for(const [id,q] of def.rewards||[]){if(id==='gold')s.gold+=q;else RF.addItem(s,id,q)}RF.advanceWorld(8+def.level);RF.questCheck?.(s);
  RF.V1027.resume({type:'message',title:`${def.name} Opened`,text:'The final bind gives and the lock turns.'});
};
RF.V1027.finishBurglary=function(s,g){
  s.stats.locksPicked=(s.stats.locksPicked||0)+1;RF.addXp(s,'thieving',12+Math.round((g.site?.difficulty||40)/8));RF.advanceWorld(6);
  const resume=g.resumeSpeed??1;RF.V1027.stopTicker();RF.actionGame=null;s.speed=resume;s.paused=resume===0;RF.UI.modal={type:'v92BurglaryInside',site:g.site,heat:0};RF.save(s);RF.UI.render(s);
};
RF.V1027.turnLock=function(){
  const s=RF.state,g=RF.actionGame;if(!s||g?.type!=='v1027Lock')return;
  const cost=RF.v10EnergyCost?RF.v10EnergyCost('lockpick'):2;if(RF.v10SpendEnergy&&!RF.v10SpendEnergy(s,cost)){g.message='⚡ You are too tired to keep the delicate pressure steady.';RF.UI.render(s);return;}
  const angle=Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:RF.V1027.angle(g),diff=RF.V1027.angleDiff(angle,g.target),success=diff<=g.tolerance+1.8;
  if(success){RF.addXp(s,'thieving',6);if(g.context==='chest')return RF.V1027.finishChest(s,g);if(g.context==='burglary')return RF.V1027.finishBurglary(s,g);return RF.V1027.finishSite(s,g);}

  // Every failed lockpicking attempt breaks one physical pick.
  RF.V1027.breakPick(s);s.stats.failedLockpicks=(s.stats.failedLockpicks||0)+1;
  if(g.context==='chest'){
    const ch=RF.V1025?.chestAt(s,g.location);if(ch){ch.failures=(ch.failures||0)+1;
      if(ch.failures>=3){const c=RF.V1025.chestDef(ch);delete s.v1025.chests[g.location];s.stats.chestLocksJammed=(s.stats.chestLocksJammed||0)+1;RF.log(s,`${c.name}: the lock jams permanently after three failed picks.`,'bad');return RF.V1027.resume({type:'message',title:'Lock Jammed',text:`The third failed pick drives the mechanism out of alignment. ${c.name} is permanently jammed and the find is lost.`});}
    }
  }else if(g.context==='burglary'){
    s.stats.burglaryLockFailures=(s.stats.burglaryLockFailures||0)+1;
    const risk=clamp(.05+(g.site?.difficulty||40)*.0025+(g.burglaryFails||0)*.045,.08,.36);g.burglaryFails=(g.burglaryFails||0)+1;
    if(Math.random()<risk){const fine=24+Math.round((g.site?.difficulty||40)*.55);RF.addBounty?.(s,fine,'failed burglary lock');return RF.V1027.resume({type:'message',title:'The House Wakes',text:`The snapped pick makes just enough noise. You escape, but somebody gets a useful look at you. Bounty +${fine}g.`});}
  }
  if(!RF.V1027.hasPick(s))return RF.V1027.resume({type:'message',title:'Out of Lockpicks',text:g.context==='chest'?'Your last pick snaps. The chest remains marked here unless that was its third failed attempt.':'Your last pick snaps, leaving you no way to continue working the lock.'});
  const ch=g.context==='chest'?RF.V1025?.chestAt(s,g.location):null,failText=ch?` Failure ${ch.failures}/3.`:'';
  RF.V1027.resetAttempt(g,`💥 Lockpick snapped.${failText} ${RF.V1027.pickCount(s)} pick${RF.V1027.pickCount(s)===1?'':'s'} remain.`);RF.save(s);RF.UI.render(s);RF.V1027.startTicker();
};
RF.V1027.leaveLock=function(){const g=RF.actionGame;if(g?.type!=='v1027Lock')return;RF.V1027.resume(null);};

// Exploration chests now launch the circular engine and remember failure count between visits.
if(RF.V1025){
  RF.V1025.startChestLock=function(loc=RF.state?.location){
    const s=RF.state,ch=RF.V1025.chestAt(s,loc);if(!s||!ch||s.location!==loc)return;ch.failures=ch.failures||0;const c=RF.V1025.chestDef(ch),th=s.skills.thieving.level||1;
    if(th<c.level){RF.UI.modal={type:'message',title:'Lock Beyond Your Skill',text:`${c.name} requires Thieving level ${c.level}. Your Thieving is level ${th}. It remains marked here.`};return RF.UI.render(s)}
    if(!RF.V1027.hasPick(s)){RF.UI.modal={type:'message',title:'No Lockpicks',text:`You need a Lockpick in your Pack. ${c.name} remains marked here.`};return RF.UI.render(s)}
    RF.UI.modal=null;RF.V1027.startLock({context:'chest',title:c.name,icon:c.icon,tier:ch.tier,location:loc,profile:RF.V1027.chestProfile(s,ch.tier)});
  };
}

// Older fixed lock sites use the same circular consumable-pick rules, but do not jam after three failures.
RF.startLockpick=function(id){
  const s=RF.state,def=RF.DATA.lockSites?.[id],st=def&&RF.lockState?.(s,id);if(!s||!def||st?.opened)return;
  if((s.skills.thieving.level||1)<def.level){RF.UI.modal={type:'message',title:'Lock Beyond Your Skill',text:`${def.name} requires Thieving level ${def.level}.`};return RF.UI.render(s)}
  if(!RF.V1027.hasPick(s)){RF.UI.modal={type:'message',title:'No Lockpicks',text:'You need a stackable Lockpick in your Pack.'};return RF.UI.render(s)}
  RF.V1027.startLock({context:'site',title:def.name,icon:'🔐',siteId:id,profile:RF.V1027.siteProfile(s,def.level)});
};

// Burglary lock entry now uses the active circular lock instead of a hidden probability roll.
if(typeof RF.v92BurglaryAttempt==='function'){
  const oldBurglaryAttempt=RF.v92BurglaryAttempt;
  RF.v92BurglaryAttempt=function(method){
    if(method!=='lock')return oldBurglaryAttempt.apply(this,arguments);
    const s=RF.state,m=RF.UI.modal,site=m?.site;if(!s||!site)return;
    if(!RF.V1027.hasPick(s)){RF.UI.modal={type:'message',title:'No Lockpicks',text:'Working the door requires at least one Lockpick in your Pack.'};return RF.UI.render(s)}
    RF.UI.modal=null;return RF.V1027.startLock({context:'burglary',title:site.name,icon:'🪟',site,profile:RF.V1027.burglaryProfile(s,site)});
  };
}

// Trap disarming no longer references a Tool Belt lockpicking set.
if(RF.V1025){
  RF.V1025.trapChoice=function(mode){
    const s=RF.state,m=RF.UI.modal,t=m?.trap;if(!s||!t)return;
    if(mode==='around'){RF.addXp(s,'exploration',8);RF.advanceWorld(4);RF.UI.modal={type:'message',title:'Long Way Around',text:'You mark the hazard and give it a wide berth. Slower, but painless.'};RF.save(s);return RF.UI.render(s)}
    const exp=RF.V1025.skill(s,'exploration'),th=RF.V1025.skill(s,'thieving'),chance=clamp(.44+exp*.013+th*.016-t.difficulty*.025,.22,.94);
    if(Math.random()<chance){RF.addXp(s,'exploration',15+t.difficulty);RF.addXp(s,'thieving',9+t.difficulty);let salvage='';if(Math.random()<.25){const id=RF.V1025.pickExisting(['lockpick','whetstone','waxed_thread','arrow']);if(id&&RF.addItem(s,id,1)!==false)salvage=` You salvage ${RF.DATA.items[id].name}.`;}RF.UI.modal={type:'message',title:'Trap Disarmed',text:`You trace the mechanism, take the tension out of it and leave the path safer than you found it.${salvage}`};}
    else{const hit=3+t.difficulty+Math.floor(Math.random()*5);s.player.hp=Math.max(1,s.player.hp-hit);s.player.stamina=Math.max(0,(s.player.stamina||0)-(6+t.difficulty));s.player.energy=Math.max(0,(s.player.energy||0)-Math.max(2,Math.floor(t.difficulty/2)));RF.addXp(s,'exploration',5);RF.UI.modal={type:'message',title:'Trap Triggered',text:`The mechanism snaps before you finish. You take ${hit} damage and lose some Stamina and Energy, but manage to pull free.`};}
    RF.save(s);RF.UI.render(s);
  };
}

// ---------- UI: chest becomes an action inside the location's Actions grid ----------
if(RF.V1025)RF.V1025.chestPanel=()=>'';
RF.V1027.chestAction=function(s){
  const ch=RF.V1025?.chestAt(s),c=ch&&RF.V1025.chestDef(ch);if(!ch||!c)return'';const th=s.skills.thieving.level||1,picks=RF.V1027.pickCount(s),fails=ch.failures||0;
  return `<button class="action v1027ChestAction" data-v1027-chest-action="${s.location}" ${s.activity||s.combat?'disabled':''}><span class="emoji">${c.icon}</span><b>${c.name}</b><small>${c.label} • Thieving ${th}/${c.level} • 🗝️ ${picks} • Failures ${fails}/3</small></button>`;
};
const v1027WorldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){
  let h=v1027WorldBase(s),ch=RF.V1027.chestAction(s);if(!ch)return h;
  const markers=['<section class="card v1012ActionSection"><h3>Actions</h3><div class="grid2">','<section class="card"><h3>Actions</h3><div class="grid2">'];
  for(const marker of markers){if(h.includes(marker))return h.replace(marker,marker+ch);}return h;
};

const v1027ActionModalBase=RF.UI.v7ActionModal?.bind(RF.UI);
if(v1027ActionModalBase)RF.UI.v7ActionModal=function(s,g){
  if(g?.type!=='v1027Lock')return v1027ActionModalBase(s,g);
  const angle=Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:g.startAngle||0,start=g.target-g.tolerance,width=g.tolerance*2,picks=RF.V1027.pickCount(s),ch=g.context==='chest'?RF.V1025?.chestAt(s,g.location):null;
  const failureLine=ch?` • Chest failures ${ch.failures||0}/3`:g.context==='burglary'?` • Quiet failures ${g.burglaryFails||0}`:'';
  return `<div class="modalBack actionBack"><div class="modal actionModal v1027LockModal"><div class="actionHero">${g.icon||'🔐'}</div><span class="eyebrow">LOCKPICKING • ${String(g.difficulty||'LOCK').toUpperCase()}</span><h2>${g.title}</h2>
    <div class="v1027LockDial" aria-label="Circular lockpicking dial"><div class="v1027Arc" style="--arcStart:${start}deg;--arcWidth:${width}deg"></div><div class="v1027Ring"></div><div class="v1027Needle" style="transform:rotate(${angle}deg)"><span></span></div><div class="v1027Hub">🔑</div></div>
    <div class="v1027LockStats"><span>🗝️ Picks <b>${picks}</b></span><span>🎯 Window <b>${Math.round(width)}°</b></span><span>📚 Thieving <b>${s.skills.thieving.level}</b></span></div>
    <button class="tapButton" data-v1027-turn>🗝️ TURN THE LOCK</button><div class="actionFeedback">${g.message}</div><div class="tiny center">Tap when the moving pick is inside the green binding arc. Every miss breaks one Lockpick${g.context==='chest'?'; the third miss jams this chest permanently':''}.${failureLine}</div><button class="quietClose" data-v1027-lock-leave>${g.context==='burglary'?'Abandon the door':'Leave it for now'}</button></div></div>`;
};

const v1027ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v1025Chest'){
    const ch=RF.V1025.chestAt(s,m.location),c=ch&&RF.V1025.chestDef(ch);if(!ch||!c){this.modal=null;return'';}ch.failures=ch.failures||0;const th=s.skills.thieving.level||1,picks=RF.V1027.pickCount(s);
    return `<div class="modalBack"><div class="modal v1025ExploreModal"><div class="resultIcon">${c.icon}</div><span class="eyebrow">EXPLORE FIND • ${c.label}</span><h2>${c.name}</h2><div class="itemDesc">${c.desc}</div><div class="itemStats"><span>🗝️ Thieving Lv ${c.level}</span><span>${th>=c.level?'✅':'🔒'} Your level ${th}</span><span>${picks?'✅':'❌'} Lockpicks ×${picks}</span><span>${ch.failures?'⚠️':'✅'} Failed attempts ${ch.failures}/3</span></div><div class="notice">The lock is worked with the circular timing minigame. Every failed turn breaks one Lockpick. Three failed attempts permanently jam and destroy this chest find.</div><div class="choices"><button class="choice" data-v1025-pick-chest="${m.location}" ${th<c.level||!picks?'disabled':''}><b>🗝️ Pick the Lock</b><small>${th<c.level?`Requires Thieving level ${c.level}.`:!picks?'Bring at least one Lockpick.':'Open the circular lockpicking dial.'}</small></button><button class="choice" data-v1025-chest-close><b>Mark It and Leave</b><small>It stays in this location's Actions until opened or jammed.</small></button></div></div></div>`;
  }
  if(m?.type==='v92BurglaryEntry'){
    const site=m.site,picks=RF.V1027.pickCount(s);return `<div class="modalBack"><div class="modal"><div style="font-size:42px">${site.icon}</div><span class="eyebrow">BURGLARY • SECURITY ${site.difficulty}</span><h2>${site.name}</h2><div class="sub">Choose how to get inside. Working the lock launches the active circular lockpicking minigame, and every miss snaps one Lockpick.</div><div class="choices"><button class="choice" data-v92-entry="lock" ${!picks?'disabled':''}><b>🗝️ Work the lock</b><small>Lockpicks ×${picks} • Thieving controls the timing window.</small></button><button class="choice" data-v92-entry="window"><b>🪟 Force a rear window</b><small>Faster, louder, less sophisticated.</small></button><button class="choice" data-v92-entry="bluff"><b>🗣️ Bluff your way near the back</b><small>Speech helps create an opening.</small></button><button class="choice" data-v92-close><b>Leave</b></button></div></div></div>`;
  }
  if(m?.type==='v1025Trap'){
    const t=m.trap;return `<div class="modalBack"><div class="modal v1025ExploreModal"><div class="resultIcon">${t.icon}</div><span class="eyebrow">HAZARD</span><h2>${t.name}</h2><div class="itemDesc">${t.text}</div><div class="choices"><button class="choice" data-v1025-trap="disarm"><b>🧠 Inspect and Disarm</b><small>Exploration + Thieving. No lockpicking Tool Belt equipment is involved.</small></button><button class="choice" data-v1025-trap="around"><b>🧭 Take the Long Way Around</b><small>Safe, but costs a few extra in-game minutes.</small></button></div></div></div>`;
  }
  return v1027ModalBase(s);
};

if(!document.getElementById('rf-v1027-style')){
  const st=document.createElement('style');st.id='rf-v1027-style';st.textContent=`
  .v1027ChestAction{border-color:rgba(211,172,88,.58)!important;background:linear-gradient(145deg,rgba(76,56,28,.42),rgba(30,25,18,.88))!important}
  .v1027LockModal{overflow:hidden}.v1027LockDial{position:relative;width:min(68vw,270px);aspect-ratio:1;margin:18px auto 20px;border-radius:50%;background:radial-gradient(circle at 50% 45%,#3b3429 0 17%,#171411 18% 51%,#2c261e 52% 69%,#100e0c 70% 100%);box-shadow:inset 0 0 0 3px #5d4c37,inset 0 0 25px #000,0 8px 28px rgba(0,0,0,.42)}
  .v1027Arc{position:absolute;inset:5px;border-radius:50%;background:conic-gradient(from var(--arcStart),rgba(104,190,108,.92) 0deg var(--arcWidth),rgba(104,190,108,.10) var(--arcWidth) calc(var(--arcWidth) + 4deg),transparent calc(var(--arcWidth) + 4deg) 360deg);-webkit-mask:radial-gradient(circle,transparent 0 72%,#000 73% 100%);mask:radial-gradient(circle,transparent 0 72%,#000 73% 100%);filter:drop-shadow(0 0 7px rgba(104,190,108,.45))}
  .v1027Ring{position:absolute;inset:18%;border:2px dashed rgba(231,211,169,.20);border-radius:50%}.v1027Hub{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:58px;height:58px;border-radius:50%;display:grid;place-items:center;font-size:25px;background:#16120e;border:2px solid #746047;box-shadow:0 0 0 5px rgba(0,0,0,.22)}
  .v1027Needle{position:absolute;left:50%;top:50%;width:2px;height:39%;transform-origin:50% 0;will-change:transform;pointer-events:none}.v1027Needle:before{content:'';position:absolute;left:-3px;top:-3px;width:8px;height:calc(100% + 10px);border-radius:8px;background:linear-gradient(#f2d892,#b58b3f);box-shadow:0 0 8px rgba(236,198,104,.45)}.v1027Needle span{position:absolute;left:-7px;top:calc(100% - 3px);width:16px;height:16px;border-radius:50%;background:#e4c578;border:2px solid #43351f}
  .v1027LockStats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:0 0 12px}.v1027LockStats span{border:1px solid #42382b;background:#181510;border-radius:10px;padding:8px 4px;text-align:center;font-size:11px;color:#b9ab91}.v1027LockStats b{display:block;color:#f0e0bd;font-size:14px;margin-top:2px}
  `;document.head.appendChild(st);
}

const v1027BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v1027BindBase(s||RF.state);
  document.querySelectorAll('[data-v1027-chest-action]').forEach(b=>b.onclick=()=>RF.V1025.openChest(b.dataset.v1027ChestAction));
  document.querySelectorAll('[data-v1027-turn]').forEach(b=>b.onclick=()=>RF.V1027.turnLock());
  document.querySelectorAll('[data-v1027-lock-leave]').forEach(b=>b.onclick=()=>RF.V1027.leaveLock());
};

// If Android Back abandons the custom lock through V7's generic resume, make sure our animation stops too.
const v1027V7ResumeBase=RF.v7Resume;
RF.v7Resume=function(){if(RF.actionGame?.type==='v1027Lock')RF.V1027.stopTicker();return v1027V7ResumeBase?.apply(this,arguments)};

if(RF.state){
  RF.migrateV1027(RF.state);
  if(!RF.state.flags?.v1027Seen){RF.state.flags=RF.state.flags||{};RF.state.flags.v1027Seen=true;RF.log?.(RF.state,'V10.27: lockpicking is now circular and active, Lockpicks are consumable stacks, exploration finds are location-specific, and unopened chests remain in local Actions.','important');}
  RF.save(RF.state);RF.UI.render(RF.state);
}
})();
