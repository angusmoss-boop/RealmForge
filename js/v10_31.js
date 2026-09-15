window.RF=window.RF||{};
RF.VERSION='10.31.0';

/* Realmforge V10.31 — Hot Property
   - Rebalances Greenvale burglary into a slower, higher-risk money source.
   - Every Greenvale property has a one in-game day cooldown after a committed/successful/failed burglary attempt.
   - Rebuilds the four-pin target arc with SVG so narrow high-difficulty windows stay visible on Android.
   - Roughly doubles lock rotation speed, then scales speed/window thickness further by difficulty.
   - Removes the misaligned dark lock-wheel backdrop while keeping the readable four-pin mechanism.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF?.V1030||!RF?.V1029||!RF?.V1027)return;
RF.V1031=RF.V1031||{};RF.V1031.version='10.31.0';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// ---------- Greenvale burglary economy / difficulty ladder ----------
RF.V1031.SITE_BALANCE={
  baker:{loot:[2,5],itemChance:.08,quickRolls:1,deepRolls:1,entryBounty:15,lockBounty:18,caughtBounty:24,recommended:1,lockWindow:68,lockRev:1.90,lockStroke:10,label:'Easy'},
  chandler:{loot:[4,9],itemChance:.12,quickRolls:1,deepRolls:1,entryBounty:25,lockBounty:30,caughtBounty:40,recommended:3,lockWindow:58,lockRev:1.70,lockStroke:9,label:'Light'},
  clothier:{loot:[7,15],itemChance:.18,quickRolls:1,deepRolls:1,entryBounty:40,lockBounty:48,caughtBounty:65,recommended:6,lockWindow:50,lockRev:1.50,lockStroke:8,label:'Tricky'},
  merchant_counting:{loot:[12,24],itemChance:.24,quickRolls:1,deepRolls:2,entryBounty:65,lockBounty:75,caughtBounty:100,recommended:9,lockWindow:42,lockRev:1.34,lockStroke:7,label:'Guarded'},
  quartermaster:{loot:[18,34],itemChance:.30,quickRolls:1,deepRolls:2,entryBounty:95,lockBounty:110,caughtBounty:145,recommended:13,lockWindow:34,lockRev:1.20,lockStroke:6,label:'Severe'},
  magistrate_house:{loot:[28,50],itemChance:.36,quickRolls:1,deepRolls:2,entryBounty:140,lockBounty:160,caughtBounty:210,recommended:18,lockWindow:28,lockRev:1.08,lockStroke:5.5,label:'Brutal'},
  gilded_manor:{loot:[45,80],itemChance:.42,quickRolls:1,deepRolls:2,entryBounty:210,lockBounty:240,caughtBounty:300,recommended:25,lockWindow:24,lockRev:.98,lockStroke:5,label:'Nearly Impossible'}
};

for(const site of RF.V1030.GREENVALE_SITES||[]){
  const b=RF.V1031.SITE_BALANCE[site.id];if(!b)continue;
  site.loot=b.loot.slice();site.itemChance=b.itemChance;site.quickRolls=b.quickRolls;site.deepRolls=b.deepRolls;
  site.entryBounty=b.entryBounty;site.lockBounty=b.lockBounty;site.caughtBounty=b.caughtBounty;
  site.recommendedThieving=b.recommended;site.lockWindow=b.lockWindow;site.lockRev=b.lockRev;site.lockStroke=b.lockStroke;site.difficultyLabel=b.label;
}
RF.v92BurglarySites.greenvale=RF.V1030.GREENVALE_SITES;

// Thorough searches remain more profitable, but no longer balloon quite as aggressively as V10.30.
RF.V1030.lootBand=function(site,deep=false){const mult=deep?1.35:1;return [Math.round(site.loot[0]*mult),Math.round(site.loot[1]*mult)];};

// ---------- One-day per-property cooldown ----------
RF.V1031.worldStamp=s=>Math.max(0,((Math.max(1,+s?.day||1)-1)*1440)+Math.max(0,+s?.minute||0));
RF.V1031.cooldowns=s=>{s.v1031=s.v1031||{};s.v1031.burglaryCooldowns=s.v1031.burglaryCooldowns||{};return s.v1031.burglaryCooldowns;};
RF.V1031.cooldownRemaining=function(s,site){
  if(!s||!site)return 0;const until=+RF.V1031.cooldowns(s)[site.id]||0;return Math.max(0,until-RF.V1031.worldStamp(s));
};
RF.V1031.onCooldown=(s,site)=>RF.V1031.cooldownRemaining(s,site)>.001;
RF.V1031.setCooldown=function(s,site,refresh=true){
  if(!s||!site||!RF.V1030.isGreenvaleSite(site))return 0;
  const cds=RF.V1031.cooldowns(s),now=RF.V1031.worldStamp(s),next=now+1440,old=+cds[site.id]||0;
  cds[site.id]=refresh?Math.max(old,next):(old>now?old:next);return cds[site.id];
};
RF.V1031.formatCooldown=function(mins){
  mins=Math.max(0,Math.ceil(+mins||0));if(!mins)return'Ready now';
  const h=Math.floor(mins/60),m=mins%60;return h?`${h}h ${m}m`: `${m}m`;
};
RF.V1031.cooldownMessage=function(s,site){const rem=RF.V1031.cooldownRemaining(s,site);return `${site.name} is alert after the last break-in attempt. Give it another ${RF.V1031.formatCooldown(rem)} of in-game time before trying again.`;};

// Hard guard against stale buttons / old modal state.
const v1031ChooseBase=RF.v92ChooseBurglary;
RF.v92ChooseBurglary=function(id){
  const s=RF.state,site=(RF.v92BurglarySites?.[s?.location]||[]).find(x=>x.id===id);
  if(site&&RF.V1030.isGreenvaleSite(site)&&RF.V1031.onCooldown(s,site)){
    RF.UI.modal={type:'message',title:'Too Hot Right Now',text:RF.V1031.cooldownMessage(s,site)};RF.UI.render(s);return;
  }
  return v1031ChooseBase.apply(this,arguments);
};

// Non-lock approaches resolve immediately, so the cooldown starts after that entry result.
// Lock attempts get their cooldown from the first failed pin or from successfully opening the door.
const v1031AttemptBase=RF.v92BurglaryAttempt;
RF.v92BurglaryAttempt=function(method){
  const s=RF.state,site=RF.UI.modal?.site;
  if(site&&RF.V1030.isGreenvaleSite(site)&&RF.V1031.onCooldown(s,site)){
    RF.UI.modal={type:'message',title:'Too Hot Right Now',text:RF.V1031.cooldownMessage(s,site)};RF.UI.render(s);return;
  }
  const out=v1031AttemptBase.apply(this,arguments);
  if(site&&RF.V1030.isGreenvaleSite(site)&&method!=='lock'){
    RF.V1031.setCooldown(s,site,true);RF.save?.(s);
  }
  return out;
};

// A successfully picked burglary door counts as a completed entry attempt and starts the full day cooldown.
const v1031FinishBurgBase=RF.V1027.finishBurglary.bind(RF.V1027);
RF.V1027.finishBurglary=function(s,g){
  const site=g?.site,out=v1031FinishBurgBase(s,g);
  if(site&&RF.V1030.isGreenvaleSite(site)){RF.V1031.setCooldown(s,site,true);RF.save?.(s);}return out;
};

// Even a quiet snapped pick is a failed burglary attempt. The current lock session may continue,
// but abandoning it no longer lets the player instantly reset the same property.
const v1031FailLockBase=RF.V1029.failLock.bind(RF.V1029);
RF.V1029.failLock=function(s,g){
  const site=g?.context==='burglary'?g.site:null,out=v1031FailLockBase(s,g);
  if(site&&RF.V1030.isGreenvaleSite(site)){RF.V1031.setCooldown(s,site,true);RF.save?.(s);}return out;
};

// ---------- Burglary probability rebalance ----------
// Window/bluff are still alternatives to lockpicking, but security now bites much harder.
const v1031EntryBase=RF.v92BurglaryAttempt;
RF.v92BurglaryAttempt=function(method){
  const s=RF.state,m=RF.UI.modal,site=m?.site;
  if(!site||!RF.V1030.isGreenvaleSite(site)||method==='lock')return v1031EntryBase.apply(this,arguments);
  if(RF.V1031.onCooldown(s,site)){
    RF.UI.modal={type:'message',title:'Too Hot Right Now',text:RF.V1031.cooldownMessage(s,site)};RF.UI.render(s);return;
  }
  const th=Math.max(1,s.skills?.thieving?.level||1),night=(RF.hour(s)>=20||RF.hour(s)<5)?0.08:0;
  const speech=Math.max(1,s.skills?.speech?.level||1),base=method==='window'?.48:.39,methodBonus=method==='bluff'?Math.min(.16,speech*.012):0;
  const chance=clamp(base+th*.018+night+methodBonus-site.difficulty*.006,.05,.82);
  RF.advanceWorld(method==='window'?8:12);
  if(Math.random()<chance){
    RF.UI.modal={type:'v92BurglaryInside',site,heat:0};RF.addXp(s,'thieving',6+Math.round(site.difficulty/12));
  }else{
    const added=RF.V1030.actualBounty(s,site,'entry',`failed burglary at ${site.name}`);s.stats=s.stats||{};s.stats.burglariesFailed=(s.stats.burglariesFailed||0)+1;RF.addXp(s,'thieving',3);
    RF.UI.modal={type:'message',title:'Break-in Failed',text:`You are spotted before you make it inside ${site.name}. Bounty +${added}g.`};
  }
  RF.V1031.setCooldown(s,site,true);RF.save(s);RF.UI.render(s);
};

// Lower raw gold, lower item frequency and stronger detection risk make burglary supplemental rather than a gold printer.
const v1031SearchBase=RF.v92BurglarySearch;
RF.v92BurglarySearch=function(deep=false){
  const s=RF.state,m=RF.UI.modal,site=m?.site;if(!site||!RF.V1030.isGreenvaleSite(site))return v1031SearchBase.apply(this,arguments);
  const th=Math.max(1,s.skills?.thieving?.level||1),night=(RF.hour(s)>=20||RF.hour(s)<5)?0.03:0;
  const risk=clamp((deep?.24:.09)+site.difficulty*.0035-th*.0045-night,deep?.14:.06,deep?.72:.52);
  if(Math.random()<risk){
    const added=RF.V1030.actualBounty(s,site,'caught',`caught inside ${site.name}`);s.stats=s.stats||{};s.stats.burglariesFailed=(s.stats.burglariesFailed||0)+1;
    RF.UI.modal={type:'message',title:'Caught Inside',text:`You stay a moment too long inside ${site.name}. You escape without the haul, but the description is excellent. Bounty +${added}g.`};RF.save(s);return RF.UI.render(s);
  }
  const band=RF.V1030.lootBand(site,deep),gold=band[0]+Math.floor(Math.random()*(band[1]-band[0]+1));
  s.gold+=gold;s.crime.thefts++;s.stats=s.stats||{};s.stats.burglaries=(s.stats.burglaries||0)+1;s.stats.goldEarned=(s.stats.goldEarned||0)+gold;
  s.reputation.underworld=(s.reputation.underworld||0)+(deep?2:1);RF.addXp(s,'thieving',RF.V1030.xpFor(site,deep));
  const found=[],rolls=deep?(site.deepRolls||2):(site.quickRolls||1),chance=clamp((site.itemChance||.2)+(deep?.08:0),.05,.58);
  for(let i=0;i<rolls;i++)if(Math.random()<chance){const pool=(site.items||[]).filter(id=>RF.DATA?.items?.[id]);if(!pool.length)break;const id=pool[Math.floor(Math.random()*pool.length)];if(RF.addItem(s,id,1)!==false)found.push(RF.DATA.items[id]?.name||id);}
  RF.advanceWorld(deep?18:8);RF.questCheck?.(s);RF.UI.modal={type:'message',title:'Clean Escape',text:`You slip away from ${site.name} with ${gold} gold${found.length?` and ${found.join(', ')}`:''}. The property will stay alert for the rest of its cooldown.`};RF.save(s);RF.UI.render(s);
};

// ---------- Faster, always-visible four-pin locks ----------
RF.V1031.speedFromRev=rev=>360/(Math.max(.55,+rev||1.5)*1000);
RF.V1031.skillAdjusted=function(s,{required=1,width=60,rev=1.7,stroke=8,label='Simple'}){
  const th=Math.max(1,s.skills?.thieving?.level||1),delta=th-required;
  const w=clamp(width+clamp(delta*.45,-5,9),22,76),r=clamp(rev+clamp(delta*.007,-.08,.14),.88,2.05);
  return {required,tolerance:w/2,speed:RF.V1031.speedFromRev(r),label,arcStroke:stroke,arcThickness:Math.round(stroke*2.2),revSeconds:r};
};
RF.V1027.chestProfile=function(s,tier){
  const c=RF.V1025?.CHESTS?.[tier]||{level:3};
  if(tier==='rare')return RF.V1031.skillAdjusted(s,{required:c.level,width:28,rev:1.05,stroke:5.5,label:'Master'});
  if(tier==='medium')return RF.V1031.skillAdjusted(s,{required:c.level,width:46,rev:1.40,stroke:7,label:'Hard'});
  return RF.V1031.skillAdjusted(s,{required:c.level,width:66,rev:1.90,stroke:10,label:'Simple'});
};
RF.V1027.siteProfile=function(s,level=1){
  const width=clamp(72-level*3.6,28,68),rev=clamp(1.98-level*.075,1.02,1.90),label=level>=10?'Master':level>=6?'Hard':'Simple',stroke=label==='Master'?5.5:label==='Hard'?7:10;
  return RF.V1031.skillAdjusted(s,{required:level,width,rev,stroke,label});
};
RF.V1027.burglaryProfile=function(s,site){
  const b=RF.V1031.SITE_BALANCE[site?.id];
  if(b)return RF.V1031.skillAdjusted(s,{required:b.recommended,width:b.lockWindow,rev:b.lockRev,stroke:b.lockStroke,label:b.label==='Nearly Impossible'?'Master':b.label==='Brutal'||b.label==='Severe'||b.label==='Guarded'?'Hard':'Simple'});
  const d=+site?.difficulty||45;return RF.V1031.skillAdjusted(s,{required:Math.max(1,Math.round(d/6)),width:clamp(72-d*.48,26,66),rev:clamp(2.02-d*.0105,.98,1.9),stroke:d>=70?5.5:d>=45?7:10,label:d>=70?'Master':d>=45?'Hard':'Simple'});
};

// Ensure the final start wrapper preserves our SVG stroke metadata.
const v1031StartLockBase=RF.V1027.startLock.bind(RF.V1027);
RF.V1027.startLock=function(opts){
  const profile=opts?.profile||{},ok=v1031StartLockBase(Object.assign({},opts,{profile})),g=RF.actionGame;
  if(ok&&g?.type==='v1027Lock'){g.arcStroke=profile.arcStroke||8;g.revSeconds=profile.revSeconds||RF.V1029.revSeconds(g);RF.UI.render(RF.state);RF.V1027.startTicker();}return ok;
};
RF.V1029.revSeconds=g=>Number.isFinite(+g?.revSeconds)?+g.revSeconds:Math.max(.1,360/Math.max(.001,Number(g?.speed)||.09)/1000);

// Render the target as an SVG circumference arc. Unlike the old masked conic gradient,
// narrow windows cannot disappear due to Android masking/compositing quirks.
const v1031ActionModalBase=RF.UI.v7ActionModal.bind(RF.UI);
RF.UI.v7ActionModal=function(s,g){
  if(g?.type!=='v1027Lock')return v1031ActionModalBase(s,g);
  const angle=Number.isFinite(g.lastVisualAngle)?g.lastVisualAngle:g.startAngle||0,width=clamp((g.tolerance||20)*2,22,76),start=(g.target||0)-width/2;
  const svgStart=start+90,picks=RF.V1027.pickCount(s),pins=Math.max(0,g.pinStage||0),total=g.pinRequired||4,stroke=clamp(+g.arcStroke||7,5,11);
  const ch=g.context==='chest'?RF.V1025?.chestAt(s,g.location):null,failureLine=ch?`Chest failures ${ch.failures||0}/3`:g.context==='burglary'?`Quiet failures ${g.burglaryFails||0}`:'No permanent jam risk';
  const pinDots=Array.from({length:total},(_,i)=>`<span class="${i<pins?'set':i===pins?'active':''}">${i<pins?'✓':i+1}</span>`).join('');
  return `<div class="modalBack actionBack"><div class="modal actionModal v1027LockModal v1029LockModal v1031LockModal"><div class="actionHero">${g.icon||'🔐'}</div><span class="eyebrow">LOCKPICKING • ${String(g.difficulty||'LOCK').toUpperCase()}</span><h2>${g.title}</h2><div class="v1029PinTrack">${pinDots}</div>
    <div class="v1029LockDial v1031LockDial" aria-label="Circular four-pin lockpicking dial"><svg class="v1031ArcSvg" viewBox="0 0 100 100" aria-hidden="true"><circle class="v1031BaseRing" cx="50" cy="50" r="46"/><circle class="v1031TargetArc" cx="50" cy="50" r="46" pathLength="360" stroke-width="${stroke}" stroke-dasharray="${width} ${360-width}" transform="rotate(${svgStart} 50 50)"/></svg><div class="v1029Needle v1031Needle" style="transform:rotate(${angle}deg)"><span></span></div><div class="v1029Hub">${pins}/${total}</div></div>
    <div class="v1027LockStats"><span>🗝️ Picks <b>${picks}</b></span><span>📌 Pins <b>${pins}/${total}</b></span><span>🎯 Window <b>${Math.round(width)}°</b></span></div><div class="v1029Speed">${RF.V1029.revSeconds(g).toFixed(2)} sec per rotation • ${failureLine}</div>
    <button class="tapButton" data-v1027-turn>🗝️ TURN THE LOCK</button><div class="actionFeedback">${g.message}</div><div class="tiny center">Set all four pins. The bright green arc is the exact hit zone and moves after each successful pin. A miss snaps one Lockpick${g.context==='chest'?'; three total misses permanently jam this chest':''}.</div><button class="quietClose" data-v1027-lock-leave>${g.context==='burglary'?'Abandon the door':'Leave it for now'}</button></div></div>`;
};

// ---------- Burglary UI with cooldown / real stakes ----------
const v1031ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v92BurglarySites'&&s.location==='greenvale'){
    const rows=(m.sites||[]).slice().sort((a,b)=>a.difficulty-b.difficulty).map(site=>{
      const quick=RF.V1030.lootBand(site,false),caught=RF.V1030.nominalPenalty(site,'caught'),rem=RF.V1031.cooldownRemaining(s,site),locked=rem>0;
      return `<button class="row browseRow v1030BurgRow ${locked?'v1031Cooling':''}" data-v92-burg-site="${site.id}" ${locked?'disabled':''}><div class="icon">${site.icon}</div><div class="meta"><b>${site.name}</b><small>${site.difficultyLabel} • Security ${site.difficulty}/100 • recommended Thieving ${site.recommendedThieving}</small><small>${site.desc}</small><small class="v1030Stakes">${locked?`⏳ Alert for ${RF.V1031.formatCooldown(rem)} more`:`Typical quick haul ${quick[0]}–${quick[1]}g • caught inside ≈ ${caught}g bounty`}</small></div><span class="chev">${locked?'⏳':'›'}</span></button>`;
    }).join('');
    return `<div class="modalBack"><div class="modal v1030BurglaryList"><div style="font-size:42px">🪟</div><span class="eyebrow">GREENVALE • 7 TARGETS</span><h2>Choose a Target</h2><div class="sub">Every property remembers a break-in attempt for one full in-game day. Better targets have faster, narrower locks and much harsher consequences.</div><div class="list">${rows}</div><button class="quietClose" data-v92-close>Remain respectable</button></div></div>`;
  }
  if(m?.type==='v92BurglaryEntry'&&RF.V1030.isGreenvaleSite(m.site)){
    const site=m.site,picks=RF.V1027.pickCount(s),quick=RF.V1030.lootBand(site,false),prof=RF.V1027.burglaryProfile(s,site);
    return `<div class="modalBack"><div class="modal"><div style="font-size:42px">${site.icon}</div><span class="eyebrow">BURGLARY • ${site.difficultyLabel.toUpperCase()} • SECURITY ${site.difficulty}</span><h2>${site.name}</h2><div class="sub">${site.desc}</div><div class="v1030StakeGrid"><span>🪙 Quick haul <b>${quick[0]}–${quick[1]}g</b></span><span>🔐 Lock <b>${RF.V1029.revSeconds({speed:prof.speed,revSeconds:prof.revSeconds}).toFixed(2)}s • ${Math.round(prof.tolerance*2)}°</b></span><span>📚 Recommended <b>Thieving ${site.recommendedThieving}</b></span><span>🚨 Entry failure <b>≈${site.entryBounty}g</b></span><span>🔔 Caught inside <b>≈${site.caughtBounty}g</b></span><span>⏳ Re-entry <b>1 in-game day</b></span></div><div class="choices"><button class="choice" data-v92-entry="lock" ${!picks?'disabled':''}><b>🗝️ Work the lock</b><small>Lockpicks ×${picks} • four pins • a miss breaks a pick and starts this property's cooldown.</small></button><button class="choice" data-v92-entry="window"><b>🪟 Force a rear window</b><small>Faster, louder and security now matters heavily.</small></button><button class="choice" data-v92-entry="bluff"><b>🗣️ Bluff your way near the back</b><small>Speech helps, but wealthy properties are difficult to fool.</small></button><button class="choice" data-v92-close><b>Leave</b></button></div></div></div>`;
  }
  return v1031ModalBase(s);
};

// ---------- Migration ----------
RF.migrateV1031=function(s){
  if(!s)return s;s.version='10.31.0';s.v1031=s.v1031||{};s.v1031.burglaryCooldowns=s.v1031.burglaryCooldowns||{};s.stats=s.stats||{};
  const g=RF.actionGame;if(g?.type==='v1027Lock'){
    let p=null;if(g.context==='chest')p=RF.V1027.chestProfile(s,g.tier||RF.V1025?.chestAt(s,g.location)?.tier||'low');else if(g.context==='burglary')p=RF.V1027.burglaryProfile(s,g.site||{});else p=RF.V1027.siteProfile(s,RF.DATA?.lockSites?.[g.siteId]?.level||g.required||1);
    g.tolerance=p.tolerance;g.speed=p.speed;g.difficulty=p.label;g.arcStroke=p.arcStroke;g.revSeconds=p.revSeconds;
  }
  return s;
};
const v1031New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1031(v1031New(...a))};
const v1031Load=RF.load;RF.load=function(){return RF.migrateV1031(v1031Load())};
const v1031Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1031(v1031Import(x))};
if(RF.V95){RF.V95.SCHEMA='10.31.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.migrateV1031(oldMig(s));}

if(!document.getElementById('rf-v1031-style')){
  const st=document.createElement('style');st.id='rf-v1031-style';st.textContent=`
  .v1031LockDial{background:transparent!important;box-shadow:none!important;border:none!important;overflow:visible!important;width:min(72vw,286px)!important}
  .v1031ArcSvg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.v1031BaseRing{fill:none;stroke:#67543c;stroke-width:2.1}.v1031TargetArc{fill:none;stroke:#61ff7d;stroke-linecap:round;filter:drop-shadow(0 0 2px #48ff69) drop-shadow(0 0 6px rgba(77,255,109,.95));transition:filter .08s ease}
  .v1031LockDial.v1029InZone .v1031TargetArc{stroke:#8dffa0;filter:drop-shadow(0 0 3px #75ff8a) drop-shadow(0 0 10px rgba(87,255,119,1))}.v1031LockDial.v1029InZone .v1031Needle:before{background:linear-gradient(#ddffe4,#6cff87)!important;box-shadow:0 0 12px #62ff82!important}.v1031LockDial.v1029InZone .v1031Needle span{background:#91ffa3!important;box-shadow:0 0 12px #62ff82!important}
  .v1031LockModal .v1029Hub{background:#17130f;box-shadow:0 0 0 4px rgba(108,87,60,.28)}.v1031LockModal .v1029Speed{margin-top:-2px}
  .v1031Cooling{opacity:.56!important;filter:saturate(.55)}.v1031Cooling .v1030Stakes{color:#b9a477!important}.v1031Cooling:disabled{cursor:not-allowed}
  `;document.head.appendChild(st);
}

if(RF.state){
  RF.migrateV1031(RF.state);RF.state.flags=RF.state.flags||{};
  if(!RF.state.flags.v1031Seen){RF.state.flags.v1031Seen=true;RF.log?.(RF.state,'V10.31: burglary targets now cool down for one in-game day, high-end locks are much faster, and the lock target arc is always visible.','important');}
  RF.save?.(RF.state);RF.UI.render(RF.state);
}
})();
