/* Realmforge V10.5 — Steady Hands
   - Pickpocket attention marker is globally slower and easier to visually track.
   - Safe windows are substantially narrower, so difficulty comes from precision rather than frantic speed.
   - Lift resolution freezes the bar exactly where the player tapped and shows that frozen bar in the result popup.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V105=RF.V105||{};RF.V105.version='10.5.0';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

RF.v104PickProfile=function(vig,skill){
  // Slower globally, but much narrower success zones.
  // Low vigilance is calm/readable; high vigilance is precise and erratic rather than simply fast.
  let width;
  if(vig<=20) width=28;
  else if(vig<=30) width=28-(vig-20)*0.55;       // 28 -> 22.5
  else if(vig<=45) width=22.5-(vig-30)*0.40;    // 22.5 -> 16.5
  else if(vig<=60) width=16.5-(vig-45)*0.32;    // 16.5 -> 11.7
  else if(vig<=70) width=11.7-(vig-60)*0.22;    // 11.7 -> 9.5
  else width=9.5-(vig-70)*0.12;                 // 9.5 -> 6.5 at 95
  width+=Math.min(4.5,Math.max(0,(skill-1)*0.05));
  width=clamp(width,6,30);

  // Track is deliberately readable at every tier.
  const baseSpeed=2.1+vig*0.115;                 // ~3.3 at 10, ~13 at 95
  const speedCap=4.5+vig*0.145;                  // ~6 at 10, ~18 at 95
  const retargetMax=clamp(2.65-vig*0.014,0.95,2.55);
  const retargetMin=clamp(retargetMax*0.50,0.42,1.20);
  const noise=4.5+vig*0.24;
  const rewardMult=0.65+vig/55;
  const rareChance=clamp(0.05+vig*0.0018,0.06,0.22);
  // Tiny visual/touch tolerance, now smaller because the marker is slower.
  const grace=clamp(1.35-vig*0.010,0.30,1.20);
  let band='Routine';
  if(vig<25)band='Very Easy'; else if(vig<40)band='Easy'; else if(vig<55)band='Watchful';
  else if(vig<70)band='Hard'; else if(vig<85)band='Very Hard'; else band='Extremely Alert';
  return {width,baseSpeed,speedCap,retargetMin,retargetMax,noise,rewardMult,rareChance,grace,band};
};

// Rebuild ticker with slower, smoother movement. It still wanders unpredictably, but never teleports visually.
RF.v9StartPickTicker=function(){
  RF.v9StopPick();let last=performance.now(),retarget=0;
  RF.V9.pickTimer=setInterval(()=>{
    const g=RF.actionGame;if(!g||g.type!=='pickpocket'){RF.v9StopPick();return}
    const p=g.pickProfile||RF.v104PickProfile(g.vigilance||40,RF.state?.skills?.thieving?.level||1);
    const now=performance.now(),dt=Math.min(.075,(now-last)/1000);last=now;retarget-=dt;
    if(retarget<=0||Math.abs(g.wanderTarget-g.attention)<1.8){
      g.wanderTarget=2+Math.random()*96;
      retarget=p.retargetMin+Math.random()*(p.retargetMax-p.retargetMin);
    }
    const dir=Math.sign(g.wanderTarget-g.attention)||1;
    const desired=dir*p.baseSpeed*(0.82+Math.random()*.30);
    g.velocity+=(desired-g.velocity)*Math.min(1,dt*(1.0+g.vigilance/120))+(Math.random()-.5)*p.noise*dt;
    g.velocity=clamp(g.velocity,-p.speedCap,p.speedCap);
    g.attention+=g.velocity*dt;
    if(g.attention<0){g.attention=0;g.velocity=Math.abs(g.velocity)*.72}
    if(g.attention>100){g.attention=100;g.velocity=-Math.abs(g.velocity)*.72}
    const el=document.querySelector('.v9AttentionNeedle');
    if(el){el.style.left=`${g.attention}%`;g.lastVisualAttention=g.attention;g.lastVisualAt=performance.now()}
  },40);
};

RF.liftPurse=function(){
  const s=RF.state,g=RF.actionGame;if(!s||!g||g.type!=='pickpocket')return;
  // Snapshot exactly what was visually on-screen at the instant of the tap.
  const el=document.querySelector('.v9AttentionNeedle');
  let pos=el?parseFloat(el.style.left):NaN;
  if(!Number.isFinite(pos))pos=Number.isFinite(g.lastVisualAttention)?g.lastVisualAttention:g.attention;
  pos=clamp(pos,0,100);
  RF.v9StopPick();

  const skill=s.skills.thieving.level||1,p=g.pickProfile||RF.v104PickProfile(g.vigilance||40,skill);
  const lo=g.target,hi=g.target+g.width,grace=p.grace;
  const inside=pos>=lo-grace&&pos<=hi+grace;
  const dist=pos<lo?lo-pos:pos>hi?pos-hi:0;
  const beforeBounty=s.crime?.bounty||0;
  let gold=0,bonus='',xp=0,bountyAdded=0;

  if(inside){
    const base=4+Math.floor(Math.random()*(8+skill*1.5));
    gold=Math.max(2,Math.round(base*p.rewardMult));s.gold+=gold;s.stats.goldEarned=(s.stats.goldEarned||0)+gold;
    xp=Math.round(14+skill+g.vigilance*.22);RF.addXp(s,'thieving',xp);s.stats.pickpockets=(s.stats.pickpockets||0)+1;
    if(Math.random()<p.rareChance){
      const pool=g.vigilance>=70?['lockpick','traveller_token','field_tonic','honey_cake']:['bread','lockpick','honey_cake'];
      const item=pool[Math.floor(Math.random()*pool.length)];
      if(RF.addItem(s,item,1)!==false)bonus=RF.DATA.items[item]?.name||item;
    }
    RF.log(s,`${g.speaker.name}: clean pickpocket for ${gold}g (${p.band}, vigilance ${g.vigilance}).`,'good');
  }else{
    const severity=.75+g.vigilance/70;
    bountyAdded=Math.max(8,Math.round((10+Math.min(28,dist*.55))*severity));
    s.crime=s.crime||{bounty:0,heat:0};s.crime.bounty=(s.crime.bounty||0)+bountyAdded;
    s.crime.heat=Math.min(100,(s.crime.heat||0)+Math.round(10+g.vigilance*.16));
    xp=Math.max(3,Math.round(4+g.vigilance*.035));RF.addXp(s,'thieving',xp);
    RF.log(s,`Pickpocket failed against ${g.speaker.name}: bounty +${bountyAdded}g.`,'bad');
    if(!g.passer&&RF.changeRelation)RF.changeRelation(s,g.id,-3);
  }

  RF.advanceWorld(2);
  const resume=g.resumeSpeed??1;
  const result={
    type:'v105PickResult',success:inside,pos,target:g.target,width:g.width,grace,
    vigilance:g.vigilance,band:p.band,speaker:g.speaker,gold,bonus,xp,
    bountyAdded,totalBounty:s.crime?.bounty||beforeBounty,heat:s.crime?.heat||0,resumeSpeed:resume
  };
  s.speed=resume;RF.actionGame=null;RF.save(s);RF.UI.modal=result;RF.UI.render(s);
};

const v105ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v105PickResult'){
    const lo=m.target,hi=m.target+m.width;
    const edgeDist=m.pos<lo?lo-m.pos:m.pos>hi?m.pos-hi:0;
    const verdict=m.success?'SUCCESS':'FAILED';
    const detail=m.success
      ? `${m.gold}g stolen${m.bonus?` • ${m.bonus} acquired`:''} • +${m.xp} Thieving XP`
      : `Bounty +${m.bountyAdded}g • Current bounty ${m.totalBounty}g • Heat ${Math.round(m.heat)}/100${edgeDist?` • Missed by ~${edgeDist.toFixed(1)}%`:''}`;
    return `<div class="modalBack"><div class="modal resultModal v105PickResult ${m.success?'pickSuccess':'pickFail'}">
      <div class="resultIcon">${m.success?'🪙':'🚨'}</div>
      <span class="eyebrow">PICKPOCKET ${verdict}</span>
      <h2>${m.speaker?.icon||'🧑'} ${m.speaker?.name||'Target'}</h2>
      <div class="timingTrack v9PickTrack v105FrozenTrack">
        <div class="timingTarget" style="left:${m.target}%;width:${m.width}%"></div>
        <div class="timingNeedle v9AttentionNeedle v105FrozenNeedle" style="left:${m.pos}%"></div>
      </div>
      <div class="v105TapReadout"><span>Stopped at <b>${m.pos.toFixed(1)}%</b></span><span>Green <b>${lo.toFixed(1)}–${hi.toFixed(1)}%</b></span></div>
      <div class="itemDesc">${detail}</div>
      <div class="statsGrid"><div class="statbox"><span>Vigilance</span><b>${m.vigilance}/100</b></div><div class="statbox"><span>Difficulty</span><b>${m.band}</b></div></div>
      <button class="startBtn" data-v105-close>Continue</button>
    </div></div>`;
  }
  return v105ModalBase(s);
};

const v105BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v105BindBase(s);
  document.querySelectorAll('[data-v105-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(s)});
};

// Small styling patch without requiring style.css replacement in the GitHub update pack.
if(!document.getElementById('rf-v105-style')){
  const st=document.createElement('style');st.id='rf-v105-style';st.textContent=`
    .v105FrozenTrack{margin:18px 0 10px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
    .v105FrozenNeedle{animation:none!important;transition:none!important}
    .v105TapReadout{display:flex;justify-content:space-between;gap:10px;font-size:12px;opacity:.82;margin:0 2px 16px}
    .v105PickResult.pickSuccess .v105FrozenTrack{box-shadow:0 0 0 1px rgba(117,190,112,.18),inset 0 0 12px rgba(117,190,112,.08)}
    .v105PickResult.pickFail .v105FrozenTrack{box-shadow:0 0 0 1px rgba(190,89,72,.18),inset 0 0 12px rgba(190,89,72,.08)}
  `;document.head.appendChild(st);
}

if(RF.state){RF.state.version='10.5.0';RF.save(RF.state)}
})();
