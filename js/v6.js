window.RF = window.RF || {};
RF.VERSION = '6.0.0';

/* Realmforge V6 — Hands On
   Turns active world actions into dedicated interaction popups.
*/

Object.assign(RF.DATA.items, {
  crude_pickaxe:{name:'Crude Pickaxe',icon:'⛏️',type:'tool',value:18,tool:'mining',tier:1,power:10,control:0,desc:'A chipped starter pick. Slow, but dependable enough.'},
  iron_pickaxe:{name:'Iron Pickaxe',icon:'⛏️',type:'tool',value:78,tool:'mining',tier:2,power:15,control:.02,desc:'A properly weighted mining pick. Noticeably faster.'},
  steel_pickaxe:{name:'Steel Pickaxe',icon:'⛏️',type:'tool',value:190,tool:'mining',tier:3,power:21,control:.04,desc:'A balanced steel pick for serious seams.'},
  crude_axe:{name:'Crude Wood Axe',icon:'🪓',type:'tool',value:18,tool:'woodcutting',tier:1,power:10,control:0,desc:'A rough camp axe.'},
  iron_axe:{name:'Iron Wood Axe',icon:'🪓',type:'tool',value:82,tool:'woodcutting',tier:2,power:16,control:.02,desc:'An iron axe with a keen edge.'},
  steel_axe:{name:'Steel Wood Axe',icon:'🪓',type:'tool',value:205,tool:'woodcutting',tier:3,power:22,control:.04,desc:'Fast, controlled and hard to blunt.'},
  reed_rod:{name:'Reed Fishing Rod',icon:'🎣',type:'tool',value:22,tool:'fishing',tier:1,power:1,control:0,desc:'Simple tackle with a forgiving float.'},
  river_rod:{name:'River Fishing Rod',icon:'🎣',type:'tool',value:95,tool:'fishing',tier:2,power:1,control:.05,desc:'A responsive rod with stronger line.'},
  angler_rod:{name:'Angler’s Rod',icon:'🎣',type:'tool',value:235,tool:'fishing',tier:3,power:1,control:.1,desc:'Fine tackle that gives you more time to react.'},
  flint_kit:{name:'Flint & Steel',icon:'🔥',type:'tool',value:16,tool:'firemaking',tier:1,power:13,control:.01,desc:'A basic spark kit.'},
  tinderbox:{name:'Wayfarer Tinderbox',icon:'🔥',type:'tool',value:72,tool:'firemaking',tier:2,power:20,control:.04,desc:'Dry tinder and a spring-steel striker.'}
});

['crude_pickaxe','iron_pickaxe','crude_axe','iron_axe','reed_rod','river_rod','flint_kit','tinderbox'].forEach(id=>{
  if (!RF.DATA.shopStock.includes(id)) RF.DATA.shopStock.push(id);
});

RF.migrateV6 = function(s){
  if(!s) return s;
  s.version='6.0.0';
  s.actionMastery=s.actionMastery||{};
  s.stats=s.stats||{};
  if(s.stats.activeTaps==null)s.stats.activeTaps=0;
  if(s.stats.skillCrits==null)s.stats.skillCrits=0;
  if(s.stats.skillMishaps==null)s.stats.skillMishaps=0;
  if(s.stats.fishEscaped==null)s.stats.fishEscaped=0;
  if(s.stats.linesBroken==null)s.stats.linesBroken=0;
  if(s.stats.perfectCooks==null)s.stats.perfectCooks=0;
  const kit=['crude_pickaxe','crude_axe','reed_rod','flint_kit'];
  // V12.4: detached Tool Belt copies are intentionally absent from Pack.
  // Only seed the historical starter kit before the detached-loadout migration has run.
  if(!s.v1053?.detached) kit.forEach(id=>{if((s.inventory[id]||0)<1) RF.addItem(s,id,1);});
  return s;
};

const v6NewGameBase=RF.newGame;
RF.newGame=function(...args){return RF.migrateV6(v6NewGameBase(...args));};
const v6LoadBase=RF.load;
RF.load=function(){return RF.migrateV6(v6LoadBase());};
const v6ImportBase=RF.importSave;
RF.importSave=function(x){return RF.migrateV6(v6ImportBase(x));};

RF.bestTool=function(s,skill){
  let tools=Object.entries(RF.DATA.items).filter(([,it])=>it.tool===skill && (s.inventory[it.id]||0)>0);
  // entries do not contain id on the object, so sort from tuple.
  tools=Object.entries(RF.DATA.items).filter(([id,it])=>it.tool===skill && (s.inventory[id]||0)>0)
    .map(([id,it])=>({id,...it})).sort((a,b)=>(b.tier||1)-(a.tier||1));
  return tools[0]||null;
};

RF.actionGame=null;
RF.actionTimer=null;
RF.clearActionTimer=function(){ if(RF.actionTimer){clearTimeout(RF.actionTimer);RF.actionTimer=null;} };
RF.closeActionGame=function(){
  RF.clearActionTimer();
  if(RF.actionGame?.resumeSpeed!=null && RF.state && !RF.state.combat) RF.state.speed=RF.actionGame.resumeSpeed;
  RF.actionGame=null;
  RF.UI.modal=null;
  RF.UI.render(RF.state);
};

RF.startActionGame=function(key){
  const s=RF.state,d=RF.DATA.resourceDefs[key],r=RF.resourceState(s,key);
  if(!d||!r||r.charges<=0||(s.skills[d.skill]?.level||1)<d.level)return;
  const resume=s.speed;s.speed=0;
  RF.clearActionTimer();
  if(d.skill==='fishing'){
    RF.actionGame={type:'fishing',key,stage:'ready',before:RF.activitySnapshot(s),resumeSpeed:resume,message:'Choose when to cast.'};
  }else{
    RF.actionGame={type:'work',key,progress:0,before:RF.activitySnapshot(s),resumeSpeed:resume,last:'',crit:false,mishap:false};
  }
  RF.UI.modal={type:'v6Action'};
  RF.UI.render(s);
};

// Replace V5's timer-based gather opening with active sessions.
RF.startGather=function(key){ return RF.startActionGame(key); };

RF.workTap=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='work')return;
  const d=RF.DATA.resourceDefs[g.key],r=RF.resourceState(s,g.key);if(!d||!r||r.charges<=0)return RF.closeActionGame();
  const tool=RF.bestTool(s,d.skill);
  const level=s.skills[d.skill]?.level||1;
  let power=(tool?.power||8)+Math.min(8,Math.floor(level/5));
  const critChance=.09+Math.min(.10,level*.002)+(tool?.control||0)+(s.luck||0)*.003;
  const mishapChance=Math.max(.012,.065-(level-d.level)*.004-(tool?.control||0));
  const roll=Math.random();
  s.stats.activeTaps++;
  g.crit=false;g.mishap=false;
  if(roll<mishapChance){
    g.mishap=true;s.stats.skillMishaps++;
    r.charges=Math.max(0,r.charges-1);r.last=RF.totalMinutes(s);
    const words=d.skill==='woodcutting'?'The cut twists and the usable section splinters. One potential yield is lost.':d.skill==='mining'?'The strike fractures a useful pocket into rubble. One potential yield is lost.':'You spoil part of the resource.';
    g.last=`⚠️ BUTCHERED — ${words}`;
  }else{
    if(roll<mishapChance+critChance){power*=2;g.crit=true;s.stats.skillCrits++;g.last=`💥 CRITICAL WORK! +${power} progress`;}
    else g.last=`+${power} progress`;
    g.progress=Math.min(100,g.progress+power);
  }
  if(g.progress>=100) return RF.finishActiveGather(g);
  RF.save(s);RF.UI.render(s);
};

RF.finishActiveGather=function(g){
  const s=RF.state,d=RF.DATA.resourceDefs[g.key],r=RF.resourceState(s,g.key);if(!d||!r)return;
  const tool=RF.bestTool(s,d.skill);
  const qty=d.yield[0]+Math.floor(Math.random()*(d.yield[1]-d.yield[0]+1));
  r.charges=Math.max(0,r.charges-1);r.last=RF.totalMinutes(s);
  RF.addItem(s,d.item,qty);
  const xp=Math.round(d.xp*qty*(1+(tool?.tier||1)*.03));RF.addXp(s,d.skill,xp);
  s.stats.resourcesGathered+=qty;
  if(Math.random()<.07){
    const bonus=d.skill==='mining'?'coal':d.skill==='woodcutting'?'herb':'wild_berries';
    if(RF.DATA.items[bonus])RF.addItem(s,bonus,1);
  }
  RF.advanceWorld(Math.max(2,Math.round(d.duration*.7)));
  RF.questCheck(s);RF.save(s);
  s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.clearActionTimer();
  const pop=RF.makeResult(s,g.before,`${d.name} Complete`,d.icon);
  RF.UI.modal=pop||{type:'message',title:'Done',text:`You finish working the ${d.name}.`};
  RF.UI.render(s);
};

RF.castLine=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='fishing'||g.stage!=='ready')return;
  const d=RF.DATA.resourceDefs[g.key],tool=RF.bestTool(s,'fishing');
  g.stage='waiting';g.message='The float settles. Watch closely...';g.castAt=Date.now();
  RF.UI.render(s);
  const wait=1700+Math.random()*3200;
  RF.clearActionTimer();
  RF.actionTimer=setTimeout(()=>{
    if(!RF.actionGame||RF.actionGame!==g)return;
    g.stage='bite';g.biteAt=Date.now();
    const level=s.skills.fishing.level||1;
    g.window=1350+(tool?.tier||1)*350+Math.min(700,level*22);
    g.message='BITE! REEL IN!';
    RF.UI.render(s);
    RF.actionTimer=setTimeout(()=>RF.fishEscapes('The fish spits the hook and disappears.'),g.window);
  },wait);
};

RF.reelFish=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='fishing')return;
  if(g.stage==='waiting'){
    RF.clearActionTimer();g.stage='ready';g.message='Too early. The splash scared the water. Cast again.';RF.advanceWorld(1);RF.UI.render(s);return;
  }
  if(g.stage!=='bite')return;
  RF.clearActionTimer();
  const d=RF.DATA.resourceDefs[g.key],r=RF.resourceState(s,g.key),tool=RF.bestTool(s,'fishing'),level=s.skills.fishing.level||1;
  const reaction=Date.now()-g.biteAt;
  const lineBreak=Math.max(.025,.16-(tool?.control||0)-(level-d.level)*.008);
  if(Math.random()<lineBreak){
    s.stats.linesBroken++;g.stage='result';g.message='💢 LINE BROKE — The fish surges away with the hook.';RF.advanceWorld(2);RF.save(s);RF.UI.render(s);
    RF.actionTimer=setTimeout(()=>RF.endFishingFailure(),850);return;
  }
  const qty=d.yield[0]+Math.floor(Math.random()*(d.yield[1]-d.yield[0]+1));
  r.charges=Math.max(0,r.charges-1);r.last=RF.totalMinutes(s);RF.addItem(s,d.item,qty);
  const quick=reaction<g.window*.36;let xp=d.xp*qty+(quick?Math.round(d.xp*.35):0);RF.addXp(s,'fishing',xp);s.stats.resourcesGathered+=qty;
  RF.advanceWorld(Math.max(2,Math.round(d.duration*.8)));RF.questCheck(s);RF.save(s);
  const before=g.before;s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;
  const pop=RF.makeResult(s,before,quick?'Perfect Hook!':'Catch Landed',quick?'✨':'🎣');
  if(pop&&quick)pop.gains.unshift({icon:'⚡',label:'Fast reaction bonus'});
  RF.UI.modal=pop||{type:'message',title:'Catch Landed',text:`You land ${qty} × ${RF.DATA.items[d.item].name}.`};RF.UI.render(s);
};

RF.fishEscapes=function(text){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='fishing')return;RF.clearActionTimer();s.stats.fishEscaped++;g.stage='result';g.message=`🐟 ESCAPED — ${text}`;RF.advanceWorld(2);RF.save(s);RF.UI.render(s);RF.actionTimer=setTimeout(()=>RF.endFishingFailure(),900);
};
RF.endFishingFailure=function(){
  const g=RF.actionGame;if(!g)return;g.stage='ready';g.message='The water settles. Cast again, or leave it.';RF.clearActionTimer();RF.UI.render(RF.state);
};

// Hunting becomes a tiny track-and-strike interaction rather than an invisible timer.
RF.startHunt=function(){
  const s=RF.state;if(s.combat||s.activity)return;const resume=s.speed;s.speed=0;RF.actionGame={type:'hunt',stage:'track',tracks:0,before:RF.activitySnapshot(s),resumeSpeed:resume,message:'Look for disturbed grass, prints and snapped stems.'};RF.UI.modal={type:'v6Action'};RF.UI.render(s);
};
RF.huntTrack=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='hunt'||g.stage!=='track')return;g.tracks++;s.stats.activeTaps++;g.message=g.tracks<3?`Tracks pieced together: ${g.tracks}/3`:'You find fresh movement ahead. Wait for the opening...';
  if(g.tracks>=3){g.stage='waiting';RF.clearActionTimer();RF.actionTimer=setTimeout(()=>{if(RF.actionGame!==g)return;g.stage='strike';g.strikeAt=Date.now();g.window=1550+Math.min(650,s.skills.hunting.level*25);g.message='NOW — strike before it bolts!';RF.UI.render(s);RF.actionTimer=setTimeout(()=>RF.huntFail('The animal vanishes into cover.'),g.window);},1000+Math.random()*1800);}RF.UI.render(s);
};
RF.huntStrike=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='hunt'||g.stage!=='strike')return;RF.clearActionTimer();let skill=s.skills.hunting.level||1;let fail=Math.max(.05,.22-skill*.012);if(Math.random()<fail)return RF.huntFail('Your footing slips and the quarry bolts.');
  let qty=Math.random()<.2+skill*.01?2:1;RF.addItem(s,'raw_meat',qty);if(Math.random()<.28)RF.addItem(s,'wolf_pelt',1);RF.addXp(s,'hunting',30+skill);RF.advanceWorld(14);RF.questCheck(s);RF.save(s);const before=g.before;s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.UI.modal=RF.makeResult(s,before,'Successful Hunt','🐾')||{type:'message',title:'Successful Hunt',text:'You return with usable game.'};RF.UI.render(s);
};
RF.huntFail=function(text){const s=RF.state,g=RF.actionGame;if(!g||g.type!=='hunt')return;RF.clearActionTimer();g.stage='result';g.message=`🍂 MISSED — ${text}`;RF.addXp(s,'hunting',6);RF.advanceWorld(8);RF.save(s);RF.UI.render(s);RF.actionTimer=setTimeout(()=>{if(RF.actionGame===g){g.stage='track';g.tracks=0;g.message='Try the trail again.';RF.UI.render(s)}},900);};

// Firemaking is now hands-on.
const v6LightFireBase=RF.lightFire;
RF.lightFire=function(logType){
  const s=RF.state;if(!RF.canCamp(s)||(s.inventory[logType]||0)<1)return;const resume=s.speed;s.speed=0;RF.actionGame={type:'firemaking',logType,progress:0,before:RF.activitySnapshot(s),resumeSpeed:resume,message:'Build the tinder nest, then work sparks into it.'};RF.UI.modal={type:'v6Action'};RF.UI.render(s);
};
RF.sparkFire=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='firemaking')return;const tool=RF.bestTool(s,'firemaking'),lvl=s.skills.firemaking.level||1;let p=(tool?.power||12)+Math.floor(lvl/6);let damp=(s.weather==='Rain'||s.weather==='Storm')?.13:.035;if(Math.random()<damp){g.message='💧 The tinder catches damp and dies back.';g.progress=Math.max(0,g.progress-5);RF.UI.render(s);return;}if(Math.random()<.12+(tool?.control||0)){p*=2;g.message=`✨ A clean shower of sparks! +${p}`;}else g.message=`🔥 +${p} ignition`;g.progress=Math.min(100,g.progress+p);s.stats.activeTaps++;if(g.progress>=100)return RF.completeFireGame(g);RF.UI.render(s);
};
RF.completeFireGame=function(g){const s=RF.state,logType=g.logType;if((s.inventory[logType]||0)<1)return RF.closeActionGame();RF.takeItem(s,logType,1);const quality=logType==='yew_logs'?3:logType==='willow_logs'?2:1,duration=45+quality*20,xp=18+quality*12;s.camp={location:s.location,expiresAt:RF.totalMinutes(s)+duration,quality};RF.addXp(s,'firemaking',xp);s.stats.firesLit++;RF.advanceWorld(5);RF.save(s);const before=g.before;s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;let pop=RF.makeResult(s,before,'Campfire Lit','🔥')||{type:'activityResult',title:'Campfire Lit',icon:'🔥',gains:[]};pop.gains.push({icon:'⏳',label:`Burn time: ${duration} game min`});RF.UI.modal=pop;RF.UI.render(s);};

// Cooking uses a timing window. Hitting the centre gives bonus XP and better recovery food feels earned.
const v6CookAtFireBase=RF.cookAtFire;
RF.cookAtFire=function(id){
  const s=RF.state,r=RF.DATA.campRecipes[id];if(!r||!RF.fireActive(s))return;const skill=r.skill||'cooking',need=r.qty||1;if((s.skills[skill]?.level||1)<r.level||(s.inventory[r.input]||0)<need)return;const resume=s.speed;s.speed=0;RF.actionGame={type:'cooking',recipe:id,start:Date.now(),target:48+Math.random()*30,width:20+Math.min(15,(s.skills[skill].level-r.level)*1.5),before:RF.activitySnapshot(s),resumeSpeed:resume,message:'Watch the heat. Tap TURN when the marker crosses the sweet spot.'};RF.UI.modal={type:'v6Action'};RF.startCookTicker();
};
RF.cookPosition=function(g){return (Math.sin((Date.now()-g.start)/760-Math.PI/2)+1)*50;};
RF.startCookTicker=function(){RF.clearActionTimer();const tick=()=>{if(!RF.actionGame||RF.actionGame.type!=='cooking')return;RF.UI.render(RF.state);RF.actionTimer=setTimeout(tick,80)};tick();};
RF.turnCook=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='cooking')return;RF.clearActionTimer();const r=RF.DATA.campRecipes[g.recipe],skill=r.skill||'cooking',need=r.qty||1;if((s.inventory[r.input]||0)<need)return RF.closeActionGame();RF.takeItem(s,r.input,need);let pos=RF.cookPosition(g),dist=Math.abs(pos-g.target),perfect=dist<=g.width*.22,good=dist<=g.width*.5;let success=good||Math.random()<.45+Math.min(.45,(s.skills[skill].level-r.level)*.04);if(success){RF.addItem(s,r.output,1);let xp=Math.round(r.xp*(perfect?1.5:good?1.15:1));RF.addXp(s,skill,xp);s.stats.mealsCooked++;if(perfect)s.stats.perfectCooks++;g.message=perfect?'✨ PERFECT TURN — crisp outside, properly cooked through.':'🍳 Cooked successfully.';}else{RF.addXp(s,skill,Math.ceil(r.xp*.3));g.message='🔥 BUTCHERED — the food burns and is lost.';s.stats.skillMishaps++;}RF.advanceWorld(r.time);RF.questCheck(s);RF.save(s);const before=g.before;s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;let pop=RF.makeResult(s,before,perfect?'Perfectly Cooked':success?r.name:'Burnt Meal',success?'🍳':'🔥');if(!pop)pop={type:'message',title:success?'Meal Ready':'Burnt',text:g.message};RF.UI.modal=pop;RF.UI.render(s);
};


// Production skills use an active workbench instead of a passive timer.
const v6CraftBase=RF.craft;
RF.craft=function(id){
  const s=RF.state,r=RF.DATA.recipes[id];if(!r||s.combat||s.activity||!RF.hasItems(s,r.inputs)||(s.skills[r.skill]?.level||1)<r.level)return;
  const resume=s.speed;s.speed=0;RF.actionGame={type:'production',recipe:id,progress:0,before:RF.activitySnapshot(s),resumeSpeed:resume,last:'',crit:false,mishap:false};RF.UI.modal={type:'v6Action'};RF.UI.render(s);
};
RF.productionTap=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='production')return;const r=RF.DATA.recipes[g.recipe];if(!r||!RF.hasItems(s,r.inputs)){g.last='⚠️ You no longer have enough materials to finish this.';RF.UI.render(s);return;}
  const lvl=s.skills[r.skill]?.level||1;let power=13+Math.min(12,Math.floor(lvl/3)),crit=.09+Math.min(.12,lvl*.003),mishap=Math.max(.012,.055-(lvl-r.level)*.004);let roll=Math.random();g.crit=false;g.mishap=false;s.stats.activeTaps++;
  if(roll<mishap){g.mishap=true;s.stats.skillMishaps++;let candidates=Object.entries(r.inputs).filter(([id])=>(s.inventory[id]||0)>0);if(candidates.length){let [lost]=candidates[Math.floor(Math.random()*candidates.length)];RF.takeItem(s,lost,1);g.last=`⚠️ BUTCHERED — 1 × ${RF.DATA.items[lost].name} is ruined.`;}else g.last='⚠️ The attempt goes wrong.';}
  else{if(roll<mishap+crit){power*=2;g.crit=true;s.stats.skillCrits++;g.last=`✨ MASTERFUL STEP! +${power} progress`;}else g.last=`+${power} progress`;g.progress=Math.min(100,g.progress+power);}
  if(g.progress>=100)return RF.finishProduction(g);RF.save(s);RF.UI.render(s);
};
RF.finishProduction=function(g){
  const s=RF.state,r=RF.DATA.recipes[g.recipe];if(!r||!RF.hasItems(s,r.inputs)){g.last='⚠️ The project stalls because too many materials were lost.';g.progress=Math.min(95,g.progress);RF.UI.render(s);return;}
  Object.entries(r.inputs).forEach(([id,q])=>RF.takeItem(s,id,q));Object.entries(r.outputs).forEach(([id,q])=>RF.addItem(s,id,q));RF.addXp(s,r.skill,r.xp);s.stats.itemsCrafted++;RF.advanceWorld(r.time);RF.questCheck(s);RF.save(s);const before=g.before;s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;RF.UI.modal=RF.makeResult(s,before,`${r.name} Complete`,RF.DATA.skills[r.skill]?.icon||'🔨')||{type:'message',title:'Craft Complete',text:`${r.name} completed.`};RF.UI.render(s);
};

// Make old Hunt button use the new interaction.
const v6ActionBase=RF.action;
RF.action=function(a){if(a==='hunt')return RF.startHunt();return v6ActionBase(a);};

// Combat becomes a dedicated popup and victory reports become popup results.
const v6StartBattleBase=RF.startBattle;
RF.startBattle=function(id,opts={}){
  const before=RF.state?RF.activitySnapshot(RF.state):null;
  const out=v6StartBattleBase(id,opts);
  if(RF.state?.combat){RF.state.combat.__v6before=before;RF.UI.modal=null;RF.UI.render(RF.state);}return out;
};
const v6WinCombatBase=RF.winCombat;
RF.winCombat=function(){
  const s=RF.state,c=s?.combat;if(!c)return;const before=c.__v6before,enemy=RF.DATA.enemies[c.id];v6WinCombatBase();if(!RF.state?.combat&&before){const pop=RF.makeResult(RF.state,before,`${enemy?.name||'Enemy'} Defeated`,'🏆');if(pop)RF.UI.modal=pop;RF.UI.render(RF.state);}
};

RF.UI.combat=function(){return '';};
RF.UI.combatPopup=function(s){
  const c=s.combat,e=RF.DATA.enemies[c.id],abilities=RF.unlockedAbilities(s),statuses=t=>(t||[]).map(x=>`<span class="statusChip ${x.id}">${RF.statusName(x.id)} ${x.turns}</span>`).join('');
  const items=['potion','field_tonic','cooked_meat','cooked_fish','cooked_trout','smoked_eel','mana_tonic'].filter(id=>(s.inventory[id]||0)>0);
  return `<div class="modalBack battleBack"><div class="modal battleModal"><div class="battleHeader"><div><span class="eyebrow">TACTICAL BATTLE • TURN ${c.turn}</span><h2>${e.icon} ${e.name}</h2></div><span class="phaseTag">${c.phase==='player'?'YOUR TURN':'ENEMY TURN'}</span></div><div class="battleField"><div class="enemyPane"><b>${e.icon} ${e.name}</b><div class="tiny">Lv ${e.level} • ${e.temperament||'hostile'}</div><div class="bar large"><div class="fill hp" style="width:${Math.max(0,100*c.hp/c.maxHp)}%"></div></div><div class="tiny">${Math.max(0,Math.ceil(c.hp))}/${c.maxHp} HP</div><div class="statusRow">${statuses(c.enemyStatuses)}</div></div><div class="versus">⚔️</div><div class="playerPane"><b>${s.player.avatar} ${s.player.name}</b><div class="tiny">${Math.ceil(s.player.hp)}/${s.player.maxHp} HP • ${Math.floor(s.player.stamina)} STA</div><div class="bar large"><div class="fill hp" style="width:${Math.max(0,100*s.player.hp/s.player.maxHp)}%"></div></div><div class="statusRow">${statuses(c.playerStatuses)}</div>${s.companion?`<div class="companionMini">${RF.DATA.npcs[s.companion.id]?.icon||'🧭'} ${RF.DATA.npcs[s.companion.id]?.name||'Companion'} • Bond ${s.companion.bond}</div>`:''}</div></div><div class="battleLog">${c.log.map(x=>`<div class="${x.type||''}">${typeof x==='string'?x:x.text}</div>`).join('')}</div><div class="battleSectionTitle">Choose a move</div><div class="abilityGrid">${abilities.map(a=>{let cd=c.cooldowns[a.id]||0,disabled=c.phase!=='player'||s.player.stamina<a.cost||cd>0;return `<button class="abilityBtn ${a.id==='attack'?'primary':''}" data-ability="${a.id}" ${disabled?'disabled':''}><span>${a.icon}</span><b>${a.name}</b><small>${a.cost?`${a.cost} STA`:'Free'}${cd?` • CD ${cd}`:''}<br>${a.desc}</small></button>`}).join('')}</div>${items.length?`<div class="battleSectionTitle">Items</div><div class="battleItems">${items.map(id=>`<button data-battle-item="${id}" ${c.phase!=='player'?'disabled':''}>${RF.DATA.items[id].icon} ${RF.DATA.items[id].name} ×${s.inventory[id]}</button>`).join('')}</div>`:''}<button class="cancelBtn" data-v4-flee ${c.phase!=='player'?'disabled':''}>🏃 Attempt to flee</button></div></div>`;
};

RF.UI.v6ActionModal=function(s,g){
  if(!g)return '';
  if(g.type==='work'){
    const d=RF.DATA.resourceDefs[g.key],tool=RF.bestTool(s,d.skill),r=RF.resourceState(s,g.key),lvl=s.skills[d.skill].level;
    return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">${d.icon}</div><span class="eyebrow">${RF.DATA.skills[d.skill].name.toUpperCase()} • LV ${lvl}</span><h2>${d.name}</h2><div class="toolLine">Using ${tool?.icon||'👐'} <b>${tool?.name||'Bare hands'}</b> • ${r.charges}/${d.max} remaining</div><div class="activeMeter"><div class="activeFill" style="width:${g.progress}%"></div></div><div class="activePct">${Math.round(g.progress)}%</div><button class="tapButton" data-work-tap>${d.skill==='woodcutting'?'🪓 CHOP':d.skill==='mining'?'⛏️ SWING':'🌿 GATHER'}</button><div class="actionFeedback ${g.mishap?'bad':g.crit?'good':''}">${g.last||'Tap to make progress. Critical work doubles a hit; mistakes can destroy a potential yield.'}</div><div class="tiny center">Better tools increase progress per tap and reduce mistakes.</div><button class="quietClose" data-abandon-action>Stop</button></div></div>`;
  }
  if(g.type==='fishing'){
    const d=RF.DATA.resourceDefs[g.key],tool=RF.bestTool(s,'fishing');
    const button=g.stage==='ready'?`<button class="tapButton water" data-cast-line>🎣 CAST LINE</button>`:g.stage==='bite'?`<button class="tapButton bite" data-reel-line>⚡ REEL IN!</button>`:g.stage==='waiting'?`<button class="tapButton water" data-reel-line>🌊 WAITING...</button>`:'';
    return `<div class="modalBack actionBack"><div class="modal actionModal fishingModal"><div class="actionHero">${g.stage==='bite'?'🐟':'🎣'}</div><span class="eyebrow">FISHING • ${tool?.name||'Improvised tackle'}</span><h2>${d.name}</h2><div class="floatScene"><div class="ripples"></div><div class="float ${g.stage==='bite'?'jerk':''}">🔴</div></div><div class="actionFeedback ${g.stage==='bite'?'good':''}">${g.message}</div>${button}<div class="tiny center">Do not reel before the bite. Better rods widen the reaction window and reduce line breaks.</div><button class="quietClose" data-abandon-action>Pack up</button></div></div>`;
  }
  if(g.type==='hunt'){
    const btn=g.stage==='track'?`<button class="tapButton" data-hunt-track>🐾 FOLLOW TRACKS ${g.tracks}/3</button>`:g.stage==='strike'?`<button class="tapButton bite" data-hunt-strike>🏹 STRIKE NOW!</button>`:'';
    return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">🐾</div><span class="eyebrow">HUNTING • LV ${s.skills.hunting.level}</span><h2>Track Local Game</h2><div class="trackMarks">${'🐾'.repeat(Math.max(1,g.tracks))}</div><div class="actionFeedback ${g.stage==='strike'?'good':''}">${g.message}</div>${btn}<div class="tiny center">Tracking skill makes the final opening more forgiving.</div><button class="quietClose" data-abandon-action>Break off</button></div></div>`;
  }
  if(g.type==='firemaking'){
    const tool=RF.bestTool(s,'firemaking');
    return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">🔥</div><span class="eyebrow">FIREMAKING • ${tool?.name||'Flint'}</span><h2>Start a Campfire</h2><div class="activeMeter fire"><div class="activeFill" style="width:${g.progress}%"></div></div><div class="activePct">${Math.round(g.progress)}% ignition</div><button class="tapButton fireTap" data-spark-fire>✨ STRIKE SPARKS</button><div class="actionFeedback">${g.message}</div><div class="tiny center">Rain and storms make ignition harder. Better fire kits produce stronger sparks.</div><button class="quietClose" data-abandon-action>Give up</button></div></div>`;
  }
  if(g.type==='production'){
    const r=RF.DATA.recipes[g.recipe],sk=RF.DATA.skills[r.skill],verb=r.skill==='smithing'?'🔨 HAMMER':r.skill==='herblore'?'🧪 MIX':r.skill==='cooking'?'🍳 WORK HEAT':'🧵 WORK';
    const mats=Object.entries(r.inputs).map(([id,q])=>`${q}× ${RF.DATA.items[id].name} (${s.inventory[id]||0} held)`).join(' • ');
    return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">${sk?.icon||'🔨'}</div><span class="eyebrow">${sk?.name?.toUpperCase()||'PRODUCTION'} • LV ${s.skills[r.skill].level}</span><h2>${r.name}</h2><div class="toolLine">Materials: ${mats}</div><div class="activeMeter"><div class="activeFill" style="width:${g.progress}%"></div></div><div class="activePct">${Math.round(g.progress)}%</div><button class="tapButton" data-production-tap>${verb}</button><div class="actionFeedback ${g.mishap?'bad':g.crit?'good':''}">${g.last||'Work the recipe step by step. Skilled execution is faster; mistakes can ruin materials.'}</div><button class="quietClose" data-abandon-action>Stop project</button></div></div>`;
  }
  if(g.type==='cooking'){
    const r=RF.DATA.campRecipes[g.recipe],pos=RF.cookPosition(g),left=Math.max(0,g.target-g.width/2),width=Math.min(100-left,g.width);
    return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">🍳</div><span class="eyebrow">COOKING • ${RF.DATA.skills[r.skill||'cooking'].name}</span><h2>${r.name}</h2><div class="cookRail"><div class="sweetZone" style="left:${left}%;width:${width}%"></div><div class="cookMarker" style="left:${pos}%"></div></div><div class="actionFeedback">${g.message}</div><button class="tapButton" data-turn-cook>🍴 TURN NOW</button><div class="tiny center">Hit the centre of the highlighted zone for a perfect cook and bonus XP. Miss badly and the ingredient is lost.</div><button class="quietClose" data-abandon-action>Stop cooking</button></div></div>`;
  }
  return '';
};

const v6ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){if(this.modal?.type==='v6Action')return this.v6ActionModal(s,RF.actionGame);return v6ModalBase(s);};

// Render battle as a true overlay. Otherwise use the normal popup system.
RF.UI.render=function(s){
  const root=document.getElementById('app');if(!s){root.innerHTML=this.creator();this.bindCreator();return;}
  const overlay=s.combat?this.combatPopup(s):(this.modal?this.modalHtml(s):'');
  root.innerHTML=`<div class="app">${this.top(s)}<main class="content">${this.page(s)}</main>${this.nav()}</div>${overlay}`;
  this.bind(s);
};

const v6BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v6BindBase(s);
  document.querySelector('[data-work-tap]')?.addEventListener('click',()=>RF.workTap());
  document.querySelector('[data-cast-line]')?.addEventListener('click',()=>RF.castLine());
  document.querySelector('[data-reel-line]')?.addEventListener('click',()=>RF.reelFish());
  document.querySelector('[data-hunt-track]')?.addEventListener('click',()=>RF.huntTrack());
  document.querySelector('[data-hunt-strike]')?.addEventListener('click',()=>RF.huntStrike());
  document.querySelector('[data-spark-fire]')?.addEventListener('click',()=>RF.sparkFire());
  document.querySelector('[data-turn-cook]')?.addEventListener('click',()=>RF.turnCook());
  document.querySelector('[data-production-tap]')?.addEventListener('click',()=>RF.productionTap());
  document.querySelector('[data-abandon-action]')?.addEventListener('click',()=>RF.closeActionGame());
};

// Tiny character panel extension so tool progress is visible outside minigames.
const v6CharBase=RF.UI.character.bind(RF.UI);
RF.UI.character=function(s){
  const h=v6CharBase(s),rows=['mining','woodcutting','fishing','firemaking'].map(sk=>{let t=RF.bestTool(s,sk);return `<div class="row"><div class="icon">${t?.icon||'▫️'}</div><div class="meta"><b>${RF.DATA.skills[sk].name}</b><small>${t?.name||'No tool'}${t?` • Tier ${t.tier}`:''}</small></div></div>`}).join('');
  return h+`<section class="card"><h3>🧰 Active Tools</h3><div class="sub">The best tool in your pack is used automatically during active skill actions.</div><div class="list" style="margin-top:8px">${rows}</div></section>`;
};

if(RF.state){RF.migrateV6(RF.state);RF.log(RF.state,'Realmforge V6 awakened: combat and active skills now use hands-on popup interfaces.','important');RF.save(RF.state);RF.UI.render(RF.state);}
