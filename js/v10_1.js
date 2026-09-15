window.RF=window.RF||{};
RF.VERSION='10.1.0';
RF.V101=RF.V101||{mainMenu:true};

/* Realmforge V10.1 — Campaign Front Door & Skilling Repair
   - Startup main menu with New Campaign / Load Campaign.
   - Repairs V10 active-gather cooldown/progress interaction.
   - Rebalances pickpocketing between V9 and V10 difficulty.
   - Failed pickpockets always add bounty + heat.
*/

(()=>{const st=document.createElement('style');st.textContent=`
.rfMainMenu{min-height:100dvh;padding:max(28px,env(safe-area-inset-top)) 22px max(28px,env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 15%,rgba(154,107,42,.18),transparent 34%),linear-gradient(#17120c,#0d0b08);color:#eadfc5}.rfMainInner{width:min(560px,100%)}.rfMainLogo{text-align:center;font-family:Georgia,serif;font-size:clamp(38px,12vw,66px);letter-spacing:.035em;color:#efbd67;text-shadow:0 3px 18px #000;margin-bottom:4px}.rfMainLogo small{display:block;font-family:system-ui;font-size:12px;letter-spacing:.42em;color:#a99b84;margin-top:4px}.rfMainCard{margin-top:30px;border:1px solid #59452d;border-radius:22px;background:rgba(28,23,17,.92);padding:20px;box-shadow:0 18px 60px #0008}.rfMainCard h2{font-family:Georgia,serif;color:#f0d398;margin:0 0 8px}.rfMainButton{width:100%;border:1px solid #7a5b31;border-radius:14px;background:#3c2b18;color:#f4e7cd;padding:15px;margin-top:10px;text-align:left}.rfMainButton.primary{background:linear-gradient(#82551f,#583615);border-color:#c38a3e}.rfMainButton b{display:block;font-size:16px}.rfMainButton small{display:block;color:#b9aa91;margin-top:4px}.rfSavePick{margin-top:14px;display:grid;gap:8px}.rfSavePick button{width:100%;border:1px solid #493d2f;background:#191611;color:#e7dcc5;border-radius:12px;padding:12px;text-align:left}.rfSavePick button b,.rfSavePick button small{display:block}.rfSavePick button small{color:#998d79;margin-top:3px}.rfMainFoot{text-align:center;color:#807463;font-size:12px;margin-top:16px}
`;document.head.appendChild(st)})();

RF.migrateV101=function(s){if(!s)return s;s.version='10.1.0';return s};
const v101New=RF.newGame;RF.newGame=function(...a){return RF.migrateV101(v101New(...a))};
if(RF.V95){RF.V95.SCHEMA='10.1.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=function(s){return RF.migrateV101(oldMig(s))}};

// ---------- Startup main menu ----------
RF.V101.renderMainMenu=function(){
  const root=document.getElementById('app'); if(!root)return;
  const slots=RF.V95?.readIndex?.().sort((a,b)=>b.updated-a.updated)||[];
  const rows=slots.map(m=>{const loc=RF.DATA.locations[m.location]?.name||m.location||'Unknown';return `<button data-v101-load="${m.id}"><b>💾 ${m.name}</b><small>${m.playerName} • Lv ${m.level} • Day ${m.day} • ${loc}</small></button>`}).join('');
  root.innerHTML=`<div class="rfMainMenu"><div class="rfMainInner"><div class="rfMainLogo">REALMFORGE<small>WANDERER'S RISE</small></div><div class="rfMainCard"><h2>Enter the Realm</h2><div class="sub">Choose a campaign, or begin another life without touching your existing saves.</div><button class="rfMainButton primary" data-v101-new><b>✨ New Campaign</b><small>Create a new wanderer in a separate save slot</small></button>${slots.length?`<div class="rfSavePick"><div class="tiny">LOAD CAMPAIGN</div>${rows}</div>`:`<div class="notice" style="margin-top:14px">No saved campaigns yet.</div>`}<div class="rfMainFoot">V10.1 • Verified multi-slot saves</div></div></div></div>`;
  root.querySelector('[data-v101-new]')?.addEventListener('click',()=>{RF.V101.mainMenu=false;RF.UI.modal=null;RF.state=null;RF.UI.render(null)});
  root.querySelectorAll('[data-v101-load]').forEach(b=>b.addEventListener('click',()=>{RF.V101.mainMenu=false;RF.V95.loadSlot(b.dataset.v101Load)}));
};
const v101RenderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){if(RF.V101.mainMenu){RF.V101.renderMainMenu();return}return v101RenderBase(s)};
// Show the front door on every fresh app/page launch.
RF.V101.mainMenu=true;if(RF.state)RF.state.speed=0;setTimeout(()=>RF.V101.renderMainMenu(),0);

// ---------- Repaired active gathering ----------
// One press => one cooldown => one outcome. The V10 instant-harvest roll no longer consumes
// a hidden cooldown before normal progress is allowed to resolve.
RF.workTap=function(){
  const s=RF.state,g=RF.actionGame;if(!s||!g||g.type!=='work')return;
  const cooldown=RF.V8?.actionCooldowns?.work||520;
  if(!RF.actionReady(g,'work',cooldown))return;
  const d=RF.DATA.resourceDefs[g.key],r=RF.resourceState(s,g.key);if(!d||!r||r.charges<=0)return RF.closeActionGame();
  const energyCost=RF.v10EnergyCost?.('work')||3;
  if((s.player.energy||0)<energyCost){g.v8CooldownUntil=0;RF.v10SpendEnergy(s,energyCost);return}
  RF.v10SpendEnergy(s,energyCost);
  const tool=RF.bestTool(s,d.skill),level=s.skills[d.skill]?.level||1;
  g.required=g.required||RF.workRequired(d);
  let power=RF.workPower(s,d,tool);
  const mishap=Math.max(.01,.065-(level-d.level)*.0045-(tool?.control||0));
  const instant=Math.min(.055,.012+level*.0008+(tool?.control||0)*.22+(s.luck||0)*.001);
  const crit=.09+Math.min(.12,level*.0025)+(tool?.control||0)+(s.luck||0)*.003;
  const roll=Math.random();s.stats.activeTaps++;g.crit=false;g.mishap=false;
  if(roll<mishap){
    g.mishap=true;s.stats.skillMishaps++;r.charges=Math.max(0,r.charges-1);r.last=RF.totalMinutes(s);g.progress=0;
    const words=d.skill==='woodcutting'?'The cut twists and the usable section splinters. One potential yield is lost.':d.skill==='mining'?'The strike fractures a useful pocket into rubble. One potential yield is lost.':'You spoil part of the resource.';
    g.last=`⚠️ BUTCHERED — ${words} Progress reset to 0%.`;
  }else if(roll<mishap+instant){
    g.progress=g.required;s.stats.instantHarvests=(s.stats.instantHarvests||0)+1;g.last='✨ INSTANT HARVEST — one exceptional action finishes the resource.';
  }else{
    if(roll<mishap+instant+crit){power*=2;g.crit=true;s.stats.skillCrits++;g.last=`💥 CRITICAL WORK! +${power} work`;}else g.last=`+${power} work`;
    g.progress=Math.min(g.required,g.progress+power);
  }
  if(g.progress>=g.required)return RF.finishActiveGather(g);
  RF.save(s);RF.UI.render(s);
};

// ---------- Pickpocketing: challenging, not microscopic ----------
RF.v9Vigilance=function(speaker,passer){let job=(speaker.job||'').toLowerCase(),v=passer?44:52;if(/guard|warden|ranger|mercenary|sellsword|captain|watch|locksmith/.test(job))v+=24;if(/merchant|trader|guildmaster|apothecary/.test(job))v+=12;if(/farmer|fisher|innkeeper|miner/.test(job))v-=6;return Math.max(28,Math.min(92,v))};
RF.startPickpocket=function(id,passer=false){let s=RF.state;if(s.combat||s.activity)return;let speaker=passer?RF.passersHere(s).find(x=>x.id===id):RF.DATA.npcs[id];if(!speaker)return;let resume=s.speed;s.speed=0,vig=RF.v9Vigilance(speaker,passer),skill=s.skills.thieving.level||1,width=Math.max(9,Math.min(27,24-vig*.105+skill*.22)),target=7+Math.random()*(86-width);RF.actionGame={type:'pickpocket',id,passer,speaker:{name:speaker.name,icon:speaker.icon||'🧑',job:speaker.job||'Traveller'},target,width,attention:Math.random()*100,velocity:(Math.random()*18+14)*(Math.random()<.5?-1:1),wanderTarget:Math.random()*100,vigilance:vig,resumeSpeed:resume,message:'Watch their attention. Lift only while the marker is inside the green window.'};RF.UI.modal={type:'v7Action'};RF.UI.render(s);RF.v9StartPickTicker()};
RF.v9StartPickTicker=function(){RF.v9StopPick();let last=performance.now(),retarget=0;RF.V9.pickTimer=setInterval(()=>{let g=RF.actionGame;if(!g||g.type!=='pickpocket'){RF.v9StopPick();return}let now=performance.now(),dt=Math.min(.08,(now-last)/1000);last=now;retarget-=dt;if(retarget<=0){g.wanderTarget=Math.random()*100;retarget=.35+Math.random()*.85}let desired=Math.sign(g.wanderTarget-g.attention)*(16+g.vigilance*.18);g.velocity+=(desired-g.velocity)*Math.min(1,dt*2)+(Math.random()-.5)*35*dt;let cap=34+g.vigilance*.28;g.velocity=Math.max(-cap,Math.min(cap,g.velocity));g.attention+=g.velocity*dt;if(g.attention<0){g.attention=0;g.velocity=Math.abs(g.velocity)}if(g.attention>100){g.attention=100;g.velocity=-Math.abs(g.velocity)}let el=document.querySelector('.v9AttentionNeedle');if(el)el.style.left=`${g.attention}%`;},40)};
RF.liftPurse=function(){let s=RF.state,g=RF.actionGame;if(!g||g.type!=='pickpocket')return;RF.v9StopPick();let pos=g.attention,dist=pos<g.target?g.target-pos:pos>g.target+g.width?pos-(g.target+g.width):0,inside=dist===0,skill=s.skills.thieving.level||1,before=RF.activitySnapshot(s);if(inside){let gold=5+Math.floor(Math.random()*(10+skill*2));s.gold+=gold;RF.addXp(s,'thieving',18+skill);s.stats.pickpockets++;if(Math.random()<.14)RF.addItem(s,['bread','lockpick','honey_cake','traveller_token'][Math.floor(Math.random()*4)],1);g.message=`Clean lift. ${gold}g taken.`}else{let bounty=Math.max(10,12+Math.round(Math.min(32,dist*.6)));s.crime=s.crime||{bounty:0,heat:0};s.crime.bounty=(s.crime.bounty||0)+bounty;s.crime.heat=Math.min(100,(s.crime.heat||0)+20);RF.addXp(s,'thieving',5);g.message=`Caught! Bounty +${bounty}g and local heat increased.`;RF.log(s,`Pickpocket failed: bounty increased by ${bounty}g.`,'bad');if(!g.passer&&RF.changeRelation)RF.changeRelation(s,g.id,-3)}RF.advanceWorld(2);s.speed=g.resumeSpeed??1;RF.actionGame=null;RF.save(s);RF.UI.modal=RF.makeResult(s,before,inside?'Clean Lift':'Pickpocket Failed',inside?'🪙':'🚨')||{type:'message',title:inside?'Clean Lift':'Caught',text:g.message};RF.UI.render(s)};

if(RF.state)RF.migrateV101(RF.state);
