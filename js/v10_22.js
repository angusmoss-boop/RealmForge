window.RF=window.RF||{};
RF.VERSION='10.22.0';

/* Realmforge V10.22 — Endurance Loop
   - Gathering nodes stay open across consecutive harvests until depleted.
   - Work energy cost scales from target level, player mastery and equipped tools (1–5).
   - Energy cap grows with Character Level.
   - Passive Energy recovery remains slow while simulated time advances.
   - Travel requires and progressively consumes roughly 1 Energy per road minute.
*/

(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V1022=RF.V1022||{};
RF.V1022.version='10.22.0';

// ---------- Energy progression ----------
RF.V1022.maxEnergy=function(level){
  level=Math.max(1,Math.min(100,Number(level)||1));
  return 100+(level-1)*2;
};
RF.V1022.syncEnergyCap=function(s,preserveGain=true){
  if(!s?.player)return;
  const oldMax=Math.max(1,Number(s.player.maxEnergy)||100),next=RF.V1022.maxEnergy(s.player.level);
  let cur=Number(s.player.energy);if(!Number.isFinite(cur))cur=oldMax;
  if(preserveGain&&next>oldMax)cur+=next-oldMax;
  s.player.maxEnergy=next;
  s.player.energy=Math.max(0,Math.min(next,cur));
};
RF.migrateV1022=function(s){
  if(!s)return s;
  s.version='10.22.0';s.stats=s.stats||{};s.flags=s.flags||{};
  RF.V1022.syncEnergyCap(s,true);
  if(s.stats.travelEnergySpent==null)s.stats.travelEnergySpent=0;
  if(s.stats.gatherSessions==null)s.stats.gatherSessions=0;
  // Existing mid-road saves should not be charged retroactively for distance already covered.
  if(s.activity?.type==='travel'){
    const a=s.activity;
    a.v1022EnergyTotal=Math.max(0,Math.ceil(Number(a.v1022EnergyTotal)||Number(a.duration)||0));
    a.v1022EnergySpent=Math.max(0,Number(a.v1022EnergySpent)||0);
    a.v1022EnergyProgress=Math.max(Number(a.v1022EnergyProgress)||0,Number(a.progress)||0);
  }
  return s;
};
const v1022New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1022(v1022New(...a))};
const v1022Load=RF.load;RF.load=function(){return RF.migrateV1022(v1022Load())};
const v1022Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1022(v1022Import(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.22.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=function(s){return RF.migrateV1022(oldMig(s))};
}

// Character levels now add 2 maximum Energy each. Unlike HP/Stamina, levelling does not
// refill the whole bar; it simply grants the newly-created capacity as usable Energy.
const v1022AddPlayerXp=RF.addPlayerXp;
RF.addPlayerXp=function(s,amount){
  const oldMax=Number(s?.player?.maxEnergy)||RF.V1022.maxEnergy(s?.player?.level||1);
  const out=v1022AddPlayerXp.apply(this,arguments);
  if(s?.player){
    const next=RF.V1022.maxEnergy(s.player.level),gain=Math.max(0,next-oldMax);
    s.player.maxEnergy=next;
    s.player.energy=Math.min(next,Math.max(0,Number(s.player.energy)||0)+gain);
  }
  return out;
};

// ---------- Dynamic active-skill Energy costs ----------
RF.V1022.expectedTool=function(skill){
  return Object.values(RF.DATA.items||{}).some(it=>it?.tool===skill);
};
RF.V1022.scaledEnergy=function(required,level,tool,expectsTool=false){
  required=Math.max(1,Number(required)||1);level=Math.max(1,Number(level)||1);
  const surplus=Math.max(0,level-required);
  let cost=4-Math.floor(surplus/5);
  if(expectsTool){
    if(!tool)cost+=1;
    else if((tool.tier||1)>=3)cost-=2;
    else if((tool.tier||1)>=2)cost-=1;
  }
  return Math.max(1,Math.min(5,Math.round(cost)));
};
RF.V1022.energyContext=function(kind,s=RF.state,g=RF.actionGame){
  if(!s||!g)return null;
  let skill=null,required=1,tool=null;
  if(kind==='work'||kind==='fishing'){
    const d=RF.DATA.resourceDefs?.[g.key];if(!d)return null;
    skill=d.skill;required=d.level||1;tool=RF.bestTool?.(s,skill)||null;
  }else if(kind==='production'||kind==='forge'){
    const r=RF.DATA.recipes?.[g.recipe];if(!r)return null;
    skill=r.skill||'crafting';required=r.level||1;tool=RF.bestTool?.(s,skill)||null;
  }else if(kind==='cooking'){
    const r=RF.DATA.campRecipes?.[g.recipe];if(!r)return null;
    skill=r.skill||'cooking';required=r.level||1;tool=RF.bestTool?.(s,skill)||null;
  }else if(kind==='lockpick'){
    const d=RF.DATA.lockSites?.[g.id];skill='thieving';required=d?.level||1;tool=RF.bestTool?.(s,'lockpicking')||null;
  }else if(kind==='excavate'){
    const d=RF.DATA.excavationSites?.[g.location];skill='exploration';required=d?.level||1;
  }else if(kind==='fire'){
    skill='firemaking';required=g.logType==='yew_logs'?14:g.logType==='willow_logs'?5:1;tool=RF.bestTool?.(s,'firemaking')||null;
  }else if(kind==='potion'){
    skill='herblore';required=Math.max(1,(s.skills?.herblore?.level||1)-3);
  }else if(kind==='hunt'){
    skill='hunting';required=Math.max(1,(s.skills?.hunting?.level||1)-4);
  }
  if(!skill)return null;
  return {skill,required,level:s.skills?.[skill]?.level||1,tool,expectsTool:(kind==='lockpick'||RF.V1022.expectedTool(skill))};
};
const v1022EnergyCostBase=RF.v10EnergyCost;
RF.v10EnergyCost=function(kind){
  const c=RF.V1022.energyContext(kind);
  if(c)return RF.V1022.scaledEnergy(c.required,c.level,c.tool,c.expectsTool);
  // Keep non-skill utility actions deliberately light.
  const fallback={hunt:2,fire:2,lockpick:2,forge:2,excavate:2,fishing:2,cooking:2,potion:2,production:2,work:2};
  return fallback[kind]??(v1022EnergyCostBase?v1022EnergyCostBase(kind):2);
};
RF.V1022.gatherEnergy=function(s,g){
  const d=RF.DATA.resourceDefs?.[g?.key];if(!d)return 1;
  const tool=RF.bestTool?.(s,d.skill)||null;
  return RF.V1022.scaledEnergy(d.level||1,s.skills?.[d.skill]?.level||1,tool,RF.V1022.expectedTool(d.skill));
};

// V10 already restores 0.02 Energy per simulated minute. Add another 0.02 so total
// passive recovery is 0.04/min: noticeable over a long day, still far slower than proper rest.
const v1022AdvanceBase=RF.advanceWorld;
RF.advanceWorld=function(minutes){
  const out=v1022AdvanceBase.apply(this,arguments),s=RF.state;
  if(s?.player&&Number(minutes)>0){
    s.player.energy=Math.min(s.player.maxEnergy||RF.V1022.maxEnergy(s.player.level),(s.player.energy||0)+Number(minutes)*0.02);
  }
  // The hardened V10.16 tick advances travel progress before calling advanceWorld,
  // which lets us charge Energy progressively without replacing the master ticker.
  const a=s?.activity;
  if(a?.type==='travel'&&a.v1022EnergyTotal>0){
    const current=Math.min(a.v1022EnergyTotal,Math.max(0,Number(a.progress)||0));
    const previous=Math.max(0,Number(a.v1022EnergyProgress)||0);
    const wholeDue=Math.max(0,Math.floor(current)-Math.floor(previous));
    if(wholeDue>0){
      const remaining=Math.max(0,a.v1022EnergyTotal-(a.v1022EnergySpent||0));
      const due=Math.min(wholeDue,remaining),spend=Math.min(due,Math.max(0,s.player.energy||0));
      s.player.energy=Math.max(0,(s.player.energy||0)-spend);
      a.v1022EnergySpent=(a.v1022EnergySpent||0)+due;
      s.stats.travelEnergySpent=(s.stats.travelEnergySpent||0)+spend;
    }
    a.v1022EnergyProgress=current;
  }
  return out;
};

// ---------- Travel Energy ----------
RF.V1022.travelDuration=function(s,id){
  let min=Number(RF.DATA.locations?.[s?.location]?.neighbors?.[id])||0;if(!min)return 0;
  // Preserve the two existing journey-speed modifiers so the Energy requirement matches
  // the leg Realmforge will actually create.
  if(s?.buffs?.roadfed>0)min=Math.max(2,Math.round(min*.88));
  else if(typeof RF.perkRank==='function'){
    const rank=RF.perkRank(s,'trailwise')||0;if(rank)min=Math.max(2,Math.round(min*(1-rank*.05)));
  }
  return min;
};
RF.V1022.locationUnlocked=function(s,id){
  const d=RF.DATA.locations?.[id];if(!d)return false;
  if(d.lockedFlag&&!s.flags?.[d.lockedFlag])return false;
  if(d.lockedSkill){const [sk,lv]=Object.entries(d.lockedSkill)[0];if((s.skills?.[sk]?.level||1)<lv)return false}
  if(typeof RF.v9LocationUnlocked==='function'&&!RF.v9LocationUnlocked(s,id))return false;
  return true;
};
const v1022TravelBase=RF.travel;
RF.travel=function(id){
  const s=RF.state;
  if(s&&!s.activity&&!s.combat&&RF.DATA.locations?.[s.location]?.neighbors?.[id]&&RF.V1022.locationUnlocked(s,id)){
    const cost=RF.V1022.travelDuration(s,id);
    if(cost>0&&(s.player.energy||0)<cost){
      RF.V1022.lastTravelBlock={need:cost,have:Math.floor(s.player.energy||0),id};
      RF.UI.modal={type:'v1022TravelEnergy',need:cost,have:Math.floor(s.player.energy||0),destination:id};
      RF.UI.render(s);return false;
    }
  }
  RF.V1022.lastTravelBlock=null;
  const out=v1022TravelBase.apply(this,arguments);
  if(s?.activity?.type==='travel'&&s.activity.target===id){
    const a=s.activity;
    a.v1022EnergyTotal=Math.max(1,Math.ceil(Number(a.duration)||RF.V1022.travelDuration(s,id)||1));
    a.v1022EnergySpent=0;a.v1022EnergyProgress=0;
    RF.save?.(s);
  }
  return out;
};

// Replace V10.20's generic route error with the real Energy requirement when a route leg
// could not start because the character was exhausted.
if(RF.V1020){
  const v1022BeginRoute=RF.V1020.beginRoute?.bind(RF.V1020);
  if(v1022BeginRoute)RF.V1020.beginRoute=function(dest){
    const out=v1022BeginRoute(dest);
    if(RF.V1022.lastTravelBlock){const b=RF.V1022.lastTravelBlock;RF.UI.modal={type:'v1022TravelEnergy',need:b.need,have:b.have,destination:b.id};RF.UI.render(RF.state)}
    return out;
  };
  const v1022ContinueRoute=RF.V1020.continueRoute?.bind(RF.V1020);
  if(v1022ContinueRoute)RF.V1020.continueRoute=function(){
    const out=v1022ContinueRoute();
    if(RF.V1022.lastTravelBlock){const b=RF.V1022.lastTravelBlock;RF.UI.modal={type:'v1022TravelEnergy',need:b.need,have:b.have,destination:b.id};RF.UI.render(RF.state)}
    return out;
  };
}

// ---------- Continuous gathering ----------
RF.V1022.canReceiveGather=function(s,item){
  if((s.inventory?.[item]||0)>0)return true;
  if(typeof RF.packUsed==='function'&&typeof RF.packCapacity==='function'&&RF.packUsed(s)<RF.packCapacity(s))return true;
  if(typeof RF.isBankTown==='function'&&RF.isBankTown(s))return true;
  return false;
};
RF.V1022.session=function(g,d){
  g.v1022Session=g.v1022Session||{harvests:0,items:0,xp:0,rare:0,item:d?.item};
  return g.v1022Session;
};

// One tap = one cooldown + one Energy cost + one gathering outcome.
RF.workTap=function(){
  const s=RF.state,g=RF.actionGame;if(!s||!g||g.type!=='work'||g.depleted)return;
  const cooldown=RF.V8?.actionCooldowns?.work||520;
  if(!RF.actionReady?.(g,'work',cooldown))return;
  const d=RF.DATA.resourceDefs?.[g.key],r=RF.resourceState?.(s,g.key);
  if(!d||!r)return RF.closeActionGame?.();
  if(r.charges<=0){g.depleted=true;g.progress=0;g.last=`🪨 DEPLETED — ${d.name} has been worked out. It will regenerate as world time passes.`;RF.save(s);RF.UI.render(s);return}
  const energyCost=RF.V1022.gatherEnergy(s,g);
  if((s.player.energy||0)<energyCost){g.v8CooldownUntil=0;g.last=`⚡ Too exhausted. This action needs ${energyCost} Energy. Stop and recover before continuing.`;RF.UI.render(s);return}
  RF.v10SpendEnergy?.(s,energyCost);
  const tool=RF.bestTool?.(s,d.skill)||null,level=s.skills?.[d.skill]?.level||1;
  g.required=g.required||RF.workRequired(d);
  let power=RF.workPower(s,d,tool);
  const mishap=Math.max(.01,.065-(level-d.level)*.0045-(tool?.control||0));
  const instant=Math.min(.055,.012+level*.0008+(tool?.control||0)*.22+(s.luck||0)*.001);
  const crit=.09+Math.min(.12,level*.0025)+(tool?.control||0)+(s.luck||0)*.003;
  const roll=Math.random();s.stats.activeTaps=(s.stats.activeTaps||0)+1;g.crit=false;g.mishap=false;g.instant=false;
  if(roll<mishap){
    g.mishap=true;s.stats.skillMishaps=(s.stats.skillMishaps||0)+1;r.charges=Math.max(0,r.charges-1);r.last=RF.totalMinutes(s);g.progress=0;
    const words=d.skill==='woodcutting'?'The cut twists and the usable section splinters. One potential yield is lost.':d.skill==='mining'?'The strike fractures a useful pocket into rubble. One potential yield is lost.':'You spoil part of the resource.';
    g.last=`⚠️ BUTCHERED — ${words} Progress reset to 0%.`;
    if(r.charges<=0){g.depleted=true;g.last+=`<br><br>${d.name} is now depleted.`}
  }else if(roll<mishap+instant){
    g.instant=true;g.progress=g.required;s.stats.instantHarvests=(s.stats.instantHarvests||0)+1;g.v1022Outcome='✨ INSTANT HARVEST';
  }else{
    if(roll<mishap+instant+crit){power*=2;g.crit=true;s.stats.skillCrits=(s.stats.skillCrits||0)+1;g.v1022Outcome='💥 CRITICAL WORK'}else g.v1022Outcome='✓ HARVEST';
    g.progress=Math.min(g.required,g.progress+power);g.last=`${g.v1022Outcome==='💥 CRITICAL WORK'?'💥 CRITICAL WORK! ':''}+${power} work`;
  }
  if(g.progress>=g.required)return RF.finishActiveGather(g);
  RF.save(s);RF.UI.render(s);
};

// Completing one material no longer closes the minigame. It immediately rolls over to the
// next charge in the same resource node until the node itself is exhausted.
RF.finishActiveGather=function(g){
  const s=RF.state,d=RF.DATA.resourceDefs?.[g?.key],r=d&&RF.resourceState?.(s,g.key);if(!s||!g||!d||!r)return;
  if(r.charges<=0){g.depleted=true;g.progress=0;g.last=`🪨 DEPLETED — ${d.name} has no usable material left.`;RF.save(s);RF.UI.render(s);return}
  if(!RF.V1022.canReceiveGather(s,d.item)){
    g.blocked='pack';g.progress=0;g.last=`🎒 Pack full — there is nowhere to put ${RF.DATA.items?.[d.item]?.name||'the gathered material'}. Stop, make space, then return.`;RF.save(s);RF.UI.render(s);return;
  }
  const tool=RF.bestTool?.(s,d.skill)||null;
  const qty=d.yield[0]+Math.floor(Math.random()*(d.yield[1]-d.yield[0]+1));
  r.charges=Math.max(0,r.charges-1);r.last=RF.totalMinutes(s);
  const intake=RF.addItem(s,d.item,qty);
  const xp=Math.round(d.xp*qty*(1+(tool?.tier||1)*.03));RF.addXp(s,d.skill,xp);
  s.stats.resourcesGathered=(s.stats.resourcesGathered||0)+qty;
  const sess=RF.V1022.session(g,d);sess.harvests++;sess.items+=qty;sess.xp+=xp;
  let bonusText='';
  if(Math.random()<.07){
    const bonus=d.skill==='mining'?'coal':d.skill==='woodcutting'?'herb':'wild_berries';
    if(RF.DATA.items?.[bonus]&&RF.addItem(s,bonus,1)!==false)bonusText=` • bonus ${RF.DATA.items[bonus].icon} ${RF.DATA.items[bonus].name}`;
  }
  let rareText='';
  if(typeof RF.v7RareSkillFind==='function'){
    const rare=RF.v7RareSkillFind(s,d.skill);if(rare){sess.rare++;rareText=` • ✨ ${RF.DATA.items?.[rare]?.name||'rare find'}`}
  }
  RF.advanceWorld(Math.max(2,Math.round(d.duration*.7)));
  RF.questCheck?.(s);
  const outcome=g.v1022Outcome||'✓ HARVEST',where=intake==='banked'?' → bank':'';
  g.progress=0;g.required=RF.workRequired(d);g.crit=false;g.mishap=false;g.instant=false;g.v1022Outcome='';g.blocked=null;
  if(r.charges<=0){
    g.depleted=true;
    g.last=`${outcome} — ${qty} × ${RF.DATA.items[d.item]?.name||d.item}${where} • +${xp} ${RF.DATA.skills[d.skill]?.name||d.skill} XP${bonusText}${rareText}<br><br>🪨 DEPLETED — ${d.name} is exhausted. It will regenerate as world time passes.`;
  }else{
    g.last=`${outcome} — ${qty} × ${RF.DATA.items[d.item]?.name||d.item}${where} • +${xp} ${RF.DATA.skills[d.skill]?.name||d.skill} XP${bonusText}${rareText}<br>Next material ready: ${r.charges}/${d.max} remaining.`;
  }
  RF.save(s);RF.UI.render(s);
};

// ---------- Gathering / travel UI ----------
const v1022ActionModalBase=RF.UI.v6ActionModal?.bind(RF.UI);
if(v1022ActionModalBase)RF.UI.v6ActionModal=function(s,g){
  if(g?.type!=='work')return v1022ActionModalBase(s,g);
  const d=RF.DATA.resourceDefs?.[g.key],r=d&&RF.resourceState?.(s,g.key);if(!d||!r)return v1022ActionModalBase(s,g);
  const tool=RF.bestTool?.(s,d.skill)||null,lvl=s.skills?.[d.skill]?.level||1;
  g.required=g.required||RF.workRequired(d);const pct=g.depleted?0:Math.min(100,100*(g.progress||0)/g.required),pwr=RF.workPower(s,d,tool),surplus=Math.max(0,lvl-d.level),energy=RF.V1022.gatherEnergy(s,g),cool=RF.cooldownRemaining?.(g)||0;
  const sess=RF.V1022.session(g,d),actionLabel=d.skill==='woodcutting'?'🪓 CHOP':d.skill==='mining'?'⛏️ SWING':'🌿 GATHER';
  const disabled=g.depleted||g.blocked||cool>0||(s.player.energy||0)<energy;
  const status=g.depleted?`<div class="v1022Depleted"><b>DEPLETED</b><span>This resource node will regenerate as world time advances.</span></div>`:'';
  const session=sess.harvests?`<div class="v1022Session">Session: <b>${sess.items} × ${RF.DATA.items[d.item]?.name||d.item}</b> • +${sess.xp} XP${sess.rare?` • ${sess.rare} rare find${sess.rare===1?'':'s'}`:''}</div>`:'';
  return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">${d.icon}</div><span class="eyebrow">${RF.DATA.skills[d.skill]?.name?.toUpperCase()||d.skill.toUpperCase()} • LV ${lvl}</span><h2>${d.name}</h2><div class="toolLine">Using ${tool?.icon||'👐'} <b>${tool?.name||'Bare hands'}</b> • ${r.charges}/${d.max} remaining</div>${status}<div class="activeMeter"><div class="activeFill" style="width:${pct}%"></div></div><div class="activePct">${g.depleted?'0':Math.round(pct)}% • ${Math.floor(g.progress||0)}/${g.required} work</div>${!g.depleted?`<button class="tapButton" data-work-tap ${disabled?'disabled':''}>${actionLabel}</button>`:''}<div class="actionFeedback ${g.mishap?'bad':g.crit||g.instant?'good':''}">${g.last||'Work the node continuously. Critical work doubles progress; instant harvest completes the current material; butchered attempts lose a charge and reset progress.'}</div><div class="tiny center">⚡ ${energy} Energy/action • ~${pwr} work/action • +${surplus} mastery levels</div>${session}<button class="quietClose" data-abandon-action>${g.depleted||g.blocked?'Close':'Stop'}</button></div></div>`;
};

const v1022ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v1022TravelEnergy'){
    const d=RF.DATA.locations?.[m.destination];
    return `<div class="modalBack"><div class="modal"><div class="itemHero">⚡</div><span class="eyebrow">TRAVEL ENERGY</span><h2>Too tired to set out</h2><div class="itemDesc">The road to <b>${d?.name||'that destination'}</b> needs about 1 Energy per travel minute.</div><div class="statsGrid"><div class="statbox"><span>Required</span><b>${m.need} Energy</b></div><div class="statbox"><span>Available</span><b>${m.have} Energy</b></div></div><div class="notice">Rest at an inn or campfire, or let world time pass to recover slowly.</div><button class="quietClose" data-v1022-close>Close</button></div></div>`;
  }
  let h=v1022ModalBase(s);
  if(m?.type==='v1020RoutePreview'&&m.destination&&s){
    const route=RF.V1020?.route?.(s,m.destination,false);
    if(route?.path?.length>1){
      const first=route.path[1],cost=RF.V1022.travelDuration(s,first);
      h=h.replace('<div class="choices">',`<div class="v1022TravelCost">⚡ First leg requires <b>${cost} Energy</b> • You have ${Math.floor(s.player.energy||0)}</div><div class="choices">`);
    }
  }
  return h;
};

const v1022TravelOverlayBase=RF.V1017?.html?.bind(RF.V1017);
if(v1022TravelOverlayBase)RF.V1017.html=function(s){
  let h=v1022TravelOverlayBase(s),a=s?.activity;
  if(a?.type==='travel'&&a.v1022EnergyTotal>0){
    const left=Math.max(0,a.v1022EnergyTotal-(a.v1022EnergySpent||0));
    h=h.replace(/(<div class="v1017TravelStats">)/,`<div class="v1022TravelEnergy">⚡ ${Math.ceil(s.player.energy||0)}/${s.player.maxEnergy||100} Energy • ~${left} road Energy remaining</div>$1`);
  }
  return h;
};

if(!document.getElementById('rf-v1022-style')){
  const st=document.createElement('style');st.id='rf-v1022-style';st.textContent=`
  .v1022Depleted{margin:10px 0;padding:11px 12px;border:1px solid #71513a;background:#251a14;border-radius:12px}.v1022Depleted b,.v1022Depleted span{display:block}.v1022Depleted b{color:#e2a96c;letter-spacing:.08em}.v1022Depleted span{color:#b8aa93;font-size:12px;margin-top:3px}
  .v1022Session{margin-top:9px;padding:8px 10px;border:1px solid #453a2c;background:#17140f;border-radius:10px;color:#aa9d87;font-size:12px}.v1022Session b{color:#e8d4ab}
  .v1022TravelCost,.v1022TravelEnergy{margin:9px 0;padding:8px 10px;border:1px solid #66512f;background:#211a10;border-radius:10px;color:#cbb995;font-size:12px}.v1022TravelCost b,.v1022TravelEnergy b{color:#efd08a}
  `;document.head.appendChild(st);
}

const v1022BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v1022BindBase(s||RF.state);
  document.querySelectorAll('[data-v1022-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
};

if(RF.state){
  RF.migrateV1022(RF.state);
  if(!RF.state.flags.v1022Seen){RF.state.flags.v1022Seen=true;RF.log(RF.state,'V10.22: gathering sessions, scalable Energy and travel fatigue are active.','important')}
  RF.save(RF.state);RF.UI.render(RF.state);
}
})();
