window.RF=window.RF||{};
RF.VERSION='10.2.0';
RF.V102=RF.V102||{worldMinutesPerSecond:.8,campDurationScale:3.5};

/* Realmforge V10.2 — Faster World, Crime Feedback & Character Skills Grid
   - 1× world clock now advances ~0.8 game minutes per real second (~30 min real per game day).
   - Campfires last longer to remain useful at the faster world cadence.
   - Failed pickpockets show bounty gained and current total bounty in a dedicated popup.
   - Character tab gains a compact 3-column RuneScape-style skill grid.
*/

(()=>{const st=document.createElement('style');st.textContent=`
.v102SkillGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.v102SkillTile{border:1px solid #493d2f;background:#191611;color:#eadfc5;border-radius:12px;padding:9px 6px;min-height:70px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.v102SkillTile:active{transform:scale(.985)}
.v102SkillIcon{font-size:21px;line-height:1}.v102SkillName{font-size:11px;color:#b7aa94;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%}.v102SkillLv{font-size:17px;color:#f0d398;font-weight:800}
.v102CrimeTotal{margin-top:12px;border:1px solid #704236;background:#241513;border-radius:14px;padding:12px;text-align:center}.v102CrimeTotal span{display:block;color:#b99b91;font-size:12px}.v102CrimeTotal b{display:block;color:#f0a58f;font-size:24px;margin-top:2px}
`;document.head.appendChild(st)})();

RF.migrateV102=function(s){if(!s)return s;s.version='10.2.0';s.flags=s.flags||{};return s};
const v102New=RF.newGame;RF.newGame=function(...a){return RF.migrateV102(v102New(...a))};
if(RF.V95){RF.V95.SCHEMA='10.2.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=function(s){return RF.migrateV102(oldMig(s))}};

// ---------- Faster baseline world clock ----------
// Activity timers remain real-time paced; only the simulated world's clock/calendar advances faster.
RF.tick=function(now){
  if(!RF.state){requestAnimationFrame(RF.tick);return}
  let dt=Math.min(.25,(now-RF.lastTick)/1000);RF.lastTick=now;let s=RF.state;
  if(s.speed>0&&!RF.UI.modal){
    let gameSec=dt*s.speed;
    RF.advanceWorld(gameSec*RF.V102.worldMinutesPerSecond);
    if(s.activity){
      s.activity.progress+=gameSec;
      if(s.activity.progress>=s.activity.duration){let a=s.activity;if(a.type==='travel')RF.finishTravel(a);else if(a.type==='craft')RF.finishCraft(a);else RF.finishActivity(a);requestAnimationFrame(RF.tick);return}
    }
    RF.autoSave+=dt;RF.renderAcc+=dt;
    if(RF.autoSave>8){RF.save(s);RF.autoSave=0}
    if(RF.renderAcc>.18){RF.UI.render(s);RF.renderAcc=0}
  }
  requestAnimationFrame(RF.tick)
};

// ---------- Longer campfires at the faster world cadence ----------
RF.lightFire=function(logType){
  const s=RF.state;if(!RF.canCamp(s))return;if((s.inventory[logType]||0)<1)return;
  RF.takeItem(s,logType,1);
  const quality=logType==='yew_logs'?3:logType==='willow_logs'?2:1;
  const base=45+quality*20;
  const duration=Math.round(base*RF.V102.campDurationScale);
  s.camp={location:s.location,expiresAt:RF.totalMinutes(s)+duration,quality};
  const xp=18+quality*12;RF.addXp(s,'firemaking',xp);s.stats.firesLit++;
  RF.log(s,`You light a campfire. It should last about ${duration} game minutes.`,'good');
  RF.UI.modal={type:'activityResult',title:'Campfire Lit',icon:'🔥',gains:[{icon:'🔥',label:`+${xp} Firemaking XP`},{icon:'⏳',label:`Burn time: ${duration} game min`}]};
  RF.save(s);RF.UI.render(s)
};

// ---------- Dedicated failed-pickpocket bounty result ----------
const v102LiftBase=RF.liftPurse;
RF.liftPurse=function(){
  const s=RF.state;if(!s)return;const before=s.crime?.bounty||0;
  const out=v102LiftBase.apply(this,arguments);
  const after=s.crime?.bounty||0;
  if(after>before){
    RF.UI.modal={type:'v102PickFail',added:after-before,total:after,heat:s.crime?.heat||0};
    RF.save(s);RF.UI.render(s)
  }
  return out
};

// ---------- Character-tab skills grid ----------
const v102CharBase=RF.UI.character.bind(RF.UI);
RF.UI.character=function(s){
  let h=v102CharBase(s);
  let tiles=Object.entries(RF.DATA.skills).map(([id,d])=>{let sk=s.skills[id]||{level:1,xp:0};return `<button class="v102SkillTile" data-skill-detail="${id}"><span class="v102SkillIcon">${d.icon||'✨'}</span><span class="v102SkillName">${d.name}</span><span class="v102SkillLv">${sk.level}</span></button>`}).join('');
  return h+`<section class="card"><div class="questTitle"><h3>📊 Skills</h3><span class="tiny">Tap for XP details</span></div><div class="v102SkillGrid">${tiles}</div></section>`
};

// ---------- Modal ----------
const v102ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){let m=this.modal;if(m?.type==='v102PickFail')return `<div class="modalBack"><div class="modal resultModal"><div class="resultIcon">🚨</div><span class="eyebrow">PICKPOCKET FAILED</span><h2>Caught in the act</h2><div class="itemDesc">Your target notices the attempt. Local heat rises and a bounty is placed on you.</div><div class="statsGrid"><div class="statbox"><span>Bounty added</span><b>+${m.added}g</b></div><div class="statbox"><span>Heat</span><b>${Math.round(m.heat)}/100</b></div></div><div class="v102CrimeTotal"><span>CURRENT BOUNTY</span><b>${m.total}g</b></div><button class="startBtn" data-v102-close>Continue</button></div></div>`;return v102ModalBase(s)};

const v102BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){v102BindBase(s);document.querySelectorAll('[data-v102-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(s)})};

if(RF.state){RF.migrateV102(RF.state);RF.save(RF.state)}
