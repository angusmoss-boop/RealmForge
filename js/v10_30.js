window.RF=window.RF||{};
RF.VERSION='10.30.0';

/* Realmforge V10.30 — Seven Doors
   - Expands Greenvale from 2 burglary targets to 7.
   - Targets form a clear security/risk/reward ladder from easy petty theft to a near-impossible manor.
   - Entry/search bounties, loot, item quality and Thieving XP scale with the chosen property.
   - The four-pin V10.29 lock minigame automatically inherits each building's security rating.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF?.v92BurglarySites)return;
RF.V1030=RF.V1030||{};RF.V1030.version='10.30.0';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

RF.V1030.GREENVALE_SITES=[
  {id:'baker',name:'Baker’s Back Room',icon:'🥖',difficulty:16,difficultyLabel:'Easy',loot:[4,10],items:['bread','honey_cake','wild_berries'],itemChance:.22,quickRolls:1,deepRolls:1,entryBounty:12,caughtBounty:18,lockBounty:14,desc:'A cheap latch behind a busy bakery. Mostly food, loose change and little worth fencing.'},
  {id:'chandler',name:'Chandler’s Shed',icon:'🕯️',difficulty:28,difficultyLabel:'Light',loot:[8,18],items:['torch','waxed_thread','herb'],itemChance:.30,quickRolls:1,deepRolls:1,entryBounty:22,caughtBounty:32,lockBounty:24,desc:'Wax, lamp oil and workshop odds and ends. Better secured than it looks, but still small-time.'},
  {id:'clothier',name:'Clothier’s Loft',icon:'🧵',difficulty:42,difficultyLabel:'Tricky',loot:[14,30],items:['waxed_thread','traveller_token','leather_vest'],itemChance:.38,quickRolls:1,deepRolls:2,entryBounty:35,caughtBounty:50,lockBounty:38,desc:'Bolts of cloth, travelling goods and a locked till above the shop floor.'},
  {id:'merchant_counting',name:'Merchant’s Counting Room',icon:'🧾',difficulty:56,difficultyLabel:'Guarded',loot:[25,48],items:['traveller_token','field_tonic','silver_ore','lucky_charm'],itemChance:.46,quickRolls:1,deepRolls:2,entryBounty:55,caughtBounty:78,lockBounty:60,desc:'Ledgers, coin drawers and stock samples. The merchant pays for decent locks and alert neighbours.'},
  {id:'quartermaster',name:'Wayfarer Quartermaster’s Annex',icon:'🛡️',difficulty:68,difficultyLabel:'Severe',loot:[40,75],items:['whetstone','bronze_bar','iron_helm','iron_sword','bronze_buckler'],itemChance:.54,quickRolls:1,deepRolls:2,entryBounty:80,caughtBounty:110,lockBounty:85,desc:'A supply annex holding coin, repair materials and field equipment. Guild eyes are rarely far away.'},
  {id:'magistrate_house',name:'Magistrate’s Townhouse',icon:'⚖️',difficulty:82,difficultyLabel:'Brutal',loot:[65,110],items:['silver_bar','steel_bar','lucky_charm','ranger_cloak'],itemChance:.64,quickRolls:1,deepRolls:2,entryBounty:115,caughtBounty:155,lockBounty:120,desc:'Private wealth behind serious locks, with watch patrols close enough to make every creak expensive.'},
  {id:'gilded_manor',name:'Gilded Manor',icon:'🏛️',difficulty:96,difficultyLabel:'Nearly Impossible',loot:[100,175],items:['silver_bar','steel_bar','ranger_cloak','steel_sword','steel_helm','silvered_blade'],itemChance:.76,quickRolls:1,deepRolls:2,entryBounty:165,caughtBounty:220,lockBounty:170,desc:'Greenvale old money. Reinforced locks, servants, watch connections and valuables worth the insanity.'}
].filter(site=>site.items.some(id=>RF.DATA?.items?.[id]));

RF.v92BurglarySites.greenvale=RF.V1030.GREENVALE_SITES;
RF.V1030.isGreenvaleSite=site=>!!site&&RF.V1030.GREENVALE_SITES.some(x=>x.id===site.id);
RF.V1030.nominalPenalty=(site,type)=>Math.max(1,Math.round(type==='caught'?(site.caughtBounty||35+site.difficulty*.6):type==='lock'?(site.lockBounty||24+site.difficulty*.55):(site.entryBounty||26+site.difficulty*.55)));
RF.V1030.actualBounty=function(s,site,type,reason){
  const before=s.crime?.bounty||0,nominal=RF.V1030.nominalPenalty(site,type);RF.addBounty?.(s,nominal,reason);return Math.max(0,(s.crime?.bounty||0)-before);
};
RF.V1030.lootBand=function(site,deep=false){const mult=deep?1.45:1;return [Math.round(site.loot[0]*mult),Math.round(site.loot[1]*mult)];};
RF.V1030.xpFor=function(site,deep=false){return Math.round((deep?30:18)+(site.difficulty||20)*(deep?.62:.38));};

// Keep V10.27/V10.29 active lock entry. Rebuild only the two non-lock approaches so their penalties use the site's explicit stakes.
const v1030BurglaryAttemptBase=RF.v92BurglaryAttempt;
RF.v92BurglaryAttempt=function(method){
  const s=RF.state,m=RF.UI.modal,site=m?.site;
  if(!site||!RF.V1030.isGreenvaleSite(site)||method==='lock')return v1030BurglaryAttemptBase.apply(this,arguments);
  const th=s.skills?.thieving?.level||1,night=RF.hour(s)>=20||RF.hour(s)<5?10:0;
  const methodBonus=method==='window'?4:method==='bluff'?(s.skills?.speech?.level||1):0;
  const chance=clamp(.66+(th*2+night+methodBonus-site.difficulty)/100,.12,.90);
  RF.advanceWorld(method==='window'?8:12);
  if(Math.random()<chance){
    RF.UI.modal={type:'v92BurglaryInside',site,heat:0};RF.addXp(s,'thieving',8+Math.round(site.difficulty/10));RF.save(s);return RF.UI.render(s);
  }
  const added=RF.V1030.actualBounty(s,site,'entry',`failed burglary at ${site.name}`);
  s.stats=s.stats||{};s.stats.burglariesFailed=(s.stats.burglariesFailed||0)+1;RF.addXp(s,'thieving',4);
  RF.UI.modal={type:'message',title:'Break-in Failed',text:`You are spotted before you make it inside ${site.name}. Bounty +${added}g.`};RF.save(s);RF.UI.render(s);
};

// Scale the actual haul, loot quality and caught-inside bounty with the selected Greenvale building.
const v1030BurglarySearchBase=RF.v92BurglarySearch;
RF.v92BurglarySearch=function(deep=false){
  const s=RF.state,m=RF.UI.modal,site=m?.site;
  if(!site||!RF.V1030.isGreenvaleSite(site))return v1030BurglarySearchBase.apply(this,arguments);
  const th=s.skills?.thieving?.level||1;
  const risk=clamp((deep?.28:.10)+site.difficulty/500-th*.004,.06,.58);
  if(Math.random()<risk){
    const added=RF.V1030.actualBounty(s,site,'caught',`caught inside ${site.name}`);
    s.stats=s.stats||{};s.stats.burglariesFailed=(s.stats.burglariesFailed||0)+1;
    RF.UI.modal={type:'message',title:'Caught Inside',text:`You stay a moment too long inside ${site.name}. You escape without the haul, but the description is good. Bounty +${added}g.`};RF.save(s);return RF.UI.render(s);
  }
  const band=RF.V1030.lootBand(site,deep),gold=band[0]+Math.floor(Math.random()*(band[1]-band[0]+1));
  s.gold+=gold;s.crime.thefts++;s.stats=s.stats||{};s.stats.burglaries=(s.stats.burglaries||0)+1;s.stats.goldEarned=(s.stats.goldEarned||0)+gold;
  s.reputation.underworld=(s.reputation.underworld||0)+(deep?2:1);RF.addXp(s,'thieving',RF.V1030.xpFor(site,deep));
  const found=[],rolls=deep?(site.deepRolls||2):(site.quickRolls||1),chance=clamp((site.itemChance||.4)+(deep?.08:0),.15,.90);
  for(let i=0;i<rolls;i++)if(Math.random()<chance){
    const pool=(site.items||[]).filter(id=>RF.DATA?.items?.[id]);if(!pool.length)break;
    const id=pool[Math.floor(Math.random()*pool.length)];if(RF.addItem(s,id,1)!==false)found.push(RF.DATA.items[id]?.name||id);
  }
  RF.advanceWorld(deep?18:8);RF.questCheck?.(s);
  RF.UI.modal={type:'message',title:'Clean Escape',text:`You slip away from ${site.name} with ${gold} gold${found.length?` and ${found.join(', ')}`:''}.`};RF.save(s);RF.UI.render(s);
};

// V10.29 lock failures now use each Greenvale property's own escalating bounty when the noise gives the player away.
if(RF.V1029&&RF.V1027){
  RF.V1029.failLock=function(s,g){
    RF.V1027.breakPick(s);s.stats.failedLockpicks=(s.stats.failedLockpicks||0)+1;
    if(g.context==='chest'){
      const ch=RF.V1025?.chestAt(s,g.location);if(ch){ch.failures=(ch.failures||0)+1;
        if(ch.failures>=3){const c=RF.V1025.chestDef(ch);delete s.v1025.chests[g.location];s.stats.chestLocksJammed=(s.stats.chestLocksJammed||0)+1;RF.log(s,`${c.name}: the lock jams permanently after three failed picks.`,'bad');return RF.V1027.resume({type:'message',title:'Lock Jammed',text:`The third failed pick mangles the final mechanism. ${c.name} is permanently jammed and the find is lost.`});}
      }
    }else if(g.context==='burglary'){
      s.stats.burglaryLockFailures=(s.stats.burglaryLockFailures||0)+1;
      const risk=clamp(.05+(g.site?.difficulty||40)*.0025+(g.burglaryFails||0)*.045,.08,.42);g.burglaryFails=(g.burglaryFails||0)+1;
      if(Math.random()<risk){
        const site=g.site,added=RF.V1030.isGreenvaleSite(site)?RF.V1030.actualBounty(s,site,'lock',`noisy lockpicking at ${site.name}`):(()=>{const before=s.crime?.bounty||0;RF.addBounty?.(s,24+Math.round((site?.difficulty||40)*.55),'failed burglary lock');return Math.max(0,(s.crime?.bounty||0)-before)})();
        s.stats.burglariesFailed=(s.stats.burglariesFailed||0)+1;
        return RF.V1027.resume({type:'message',title:'The House Wakes',text:`The snapped pick rings against the lock. You get away, but somebody gets a useful look at you. Bounty +${added}g.`});
      }
    }
    if(!RF.V1027.hasPick(s))return RF.V1027.resume({type:'message',title:'Out of Lockpicks',text:g.context==='chest'?'Your last pick snaps. The chest remains marked here unless that was its third failed attempt.':'Your last pick snaps, leaving you no way to continue working the lock.'});
    const ch=g.context==='chest'?RF.V1025?.chestAt(s,g.location):null,failText=ch?` Chest failures ${ch.failures}/3.`:'';
    g.message=`💥 Lockpick snapped.${failText} Pin ${Math.min((g.pinStage||0)+1,g.pinRequired||4)} is still binding. ${RF.V1027.pickCount(s)} pick${RF.V1027.pickCount(s)===1?'':'s'} remain.`;
    RF.save(s);RF.UI.render(s);RF.V1027.startTicker();
  };
}

// Make the seven-step ladder visible before the player commits.
const v1030ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v92BurglarySites'&&s.location==='greenvale'){
    const rows=(m.sites||[]).slice().sort((a,b)=>a.difficulty-b.difficulty).map(site=>{
      const quick=RF.V1030.lootBand(site,false),caught=RF.V1030.nominalPenalty(site,'caught');
      return `<button class="row browseRow v1030BurgRow" data-v92-burg-site="${site.id}"><div class="icon">${site.icon}</div><div class="meta"><b>${site.name}</b><small>${site.difficultyLabel} • Security ${site.difficulty}/100</small><small>${site.desc}</small><small class="v1030Stakes">Typical quick haul ${quick[0]}–${quick[1]}g • caught inside ≈ ${caught}g bounty</small></div><span class="chev">›</span></button>`;
    }).join('');
    return `<div class="modalBack"><div class="modal v1030BurglaryList"><div style="font-size:42px">🪟</div><span class="eyebrow">GREENVALE • 7 TARGETS</span><h2>Choose a Target</h2><div class="sub">Security, lock speed, detection risk, bounty and rewards all rise down the list. Night helps. Greed does not.</div><div class="list">${rows}</div><button class="quietClose" data-v92-close>Remain respectable</button></div></div>`;
  }
  if(m?.type==='v92BurglaryEntry'&&RF.V1030.isGreenvaleSite(m.site)){
    const site=m.site,picks=RF.V1027?.pickCount?RF.V1027.pickCount(s):(s.inventory?.lockpick||0),quick=RF.V1030.lootBand(site,false);
    return `<div class="modalBack"><div class="modal"><div style="font-size:42px">${site.icon}</div><span class="eyebrow">BURGLARY • ${site.difficultyLabel.toUpperCase()} • SECURITY ${site.difficulty}</span><h2>${site.name}</h2><div class="sub">${site.desc}</div><div class="v1030StakeGrid"><span>🪙 Quick haul <b>${quick[0]}–${quick[1]}g</b></span><span>🚨 Entry failure <b>≈${site.entryBounty}g</b></span><span>🔔 Caught inside <b>≈${site.caughtBounty}g</b></span></div><div class="choices"><button class="choice" data-v92-entry="lock" ${!picks?'disabled':''}><b>🗝️ Work the lock</b><small>Lockpicks ×${picks} • four-pin difficulty scales with this building's security.</small></button><button class="choice" data-v92-entry="window"><b>🪟 Force a rear window</b><small>Faster and louder. Security still matters.</small></button><button class="choice" data-v92-entry="bluff"><b>🗣️ Bluff your way near the back</b><small>Speech helps, especially against easier properties.</small></button><button class="choice" data-v92-close><b>Leave</b></button></div></div></div>`;
  }
  if(m?.type==='v92BurglaryInside'&&RF.V1030.isGreenvaleSite(m.site)){
    const site=m.site,q=RF.V1030.lootBand(site,false),d=RF.V1030.lootBand(site,true);
    return `<div class="modalBack"><div class="modal"><div style="font-size:42px">🕯️</div><span class="eyebrow">INSIDE • ${site.difficultyLabel.toUpperCase()}</span><h2>${site.name}</h2><div class="sub">You are in. Staying longer improves the haul and item chances, but dramatically increases the chance somebody notices.</div><div class="v1030StakeGrid"><span>🤏 Quick <b>${q[0]}–${q[1]}g</b></span><span>🧤 Thorough <b>${d[0]}–${d[1]}g</b></span><span>🚨 Caught <b>≈${site.caughtBounty}g</b></span></div><div class="choices"><button class="choice" data-v92-search="quick"><b>Grab what is obvious and leave</b><small>Lower risk and fewer item rolls.</small></button><button class="choice dangerChoice" data-v92-search="deep"><b>Search thoroughly</b><small>Better gold and loot rolls, much greater detection risk.</small></button><button class="choice" data-v92-close><b>Leave empty-handed</b></button></div></div></div>`;
  }
  return v1030ModalBase(s);
};

RF.migrateV1030=function(s){if(!s)return s;s.version='10.30.0';s.v1030=s.v1030||{};return s};
const v1030New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1030(v1030New(...a))};
const v1030Load=RF.load;RF.load=function(){return RF.migrateV1030(v1030Load())};
const v1030Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1030(v1030Import(x))};
if(RF.V95){RF.V95.SCHEMA='10.30.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.migrateV1030(oldMig(s));}

if(!document.getElementById('rf-v1030-style')){
  const st=document.createElement('style');st.id='rf-v1030-style';st.textContent=`
  .v1030BurglaryList{max-height:min(84vh,760px);overflow:auto;padding-bottom:max(20px,env(safe-area-inset-bottom))}.v1030BurgRow{align-items:flex-start}.v1030BurgRow .meta small{display:block;margin-top:3px}.v1030Stakes{color:#d1b778!important}.v1030StakeGrid{display:grid;grid-template-columns:1fr;gap:7px;margin:12px 0}.v1030StakeGrid span{display:flex;justify-content:space-between;gap:12px;padding:9px 11px;border:1px solid #493c2c;border-radius:10px;background:#17130f;color:#b6aa96}.v1030StakeGrid b{color:#f0dba9;text-align:right}
  `;document.head.appendChild(st);
}

if(RF.state){
  RF.migrateV1030(RF.state);RF.state.flags=RF.state.flags||{};
  if(!RF.state.flags.v1030Seen){RF.state.flags.v1030Seen=true;RF.log?.(RF.state,'V10.30: Greenvale now has seven burglary targets, ranging from petty back-room theft to the near-impossible Gilded Manor.','important');}
  RF.save?.(RF.state);RF.UI.render(RF.state);
}
})();
