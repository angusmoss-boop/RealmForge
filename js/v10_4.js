/* Realmforge V10.4 — Light Fingers
   - Vigilance is genuinely individual and strongly controls pickpocket difficulty.
   - Low-vigilance targets are intentionally forgiving; high-vigilance targets are severe.
   - Rewards, rare-loot chance and failure bounty scale with target vigilance.
   - Lift resolution uses the needle position actually rendered on screen + tiny latency grace.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V104=RF.V104||{};
RF.V104.version='10.4.0';

function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function hashText(t){let h=2166136261;for(const ch of String(t||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h>>>0)}

// Named people can be deliberately authored. Everyone else gets a stable personal modifier,
// so two people with the same profession need not be equally alert.
const NAMED_VIGILANCE={
  mira:22, brann:29, oren:48, elira:39, halden:86,
  tamsin:68, saela:57, vell:62, ysra:74, nessa:46,
  torren:24, cobb:77, maelin:42, dock:65, ilse:27
};

RF.v9Vigilance=function(speaker,passer=false){
  const id=String(speaker.id||speaker.key||'').toLowerCase();
  if(NAMED_VIGILANCE[id]!=null)return NAMED_VIGILANCE[id];
  const job=String(speaker.job||'').toLowerCase();
  let v=passer?34:40;
  if(/farmer|fisher|miller|baker|drover|labourer|innkeeper/.test(job))v=20;
  else if(/miner|woodcutter|herbalist|porter|pilgrim/.test(job))v=29;
  else if(/scholar|naturalist|healer|apothecary/.test(job))v=40;
  else if(/merchant|trader|factor|guildmaster/.test(job))v=52;
  else if(/mercenary|sellsword|scout|ranger|warden/.test(job))v=70;
  else if(/guard|watch|sergeant|captain|locksmith|thief|assassin/.test(job))v=82;
  // Stable -8..+8 personal variance from identity/name.
  const personal=(hashText((speaker.name||'')+'|'+job)%17)-8;
  return clamp(v+personal,10,95);
};

RF.v104PickProfile=function(vig,skill){
  // Strong nonlinear curve: <=25 deliberately easy, >=70 deliberately nasty.
  let width;
  if(vig<=20)width=46;
  else if(vig<=30)width=46-(vig-20)*0.75;       // 46 -> 38.5
  else if(vig<=45)width=38.5-(vig-30)*0.55;    // 38.5 -> 30.25
  else if(vig<=60)width=30.25-(vig-45)*0.55;   // 30.25 -> 22
  else if(vig<=70)width=22-(vig-60)*0.65;      // 22 -> 15.5
  else width=15.5-(vig-70)*0.24;               // 15.5 -> 9.5 at 95
  width+=Math.min(7,Math.max(0,(skill-1)*0.08));
  width=clamp(width,8.5,48);

  const baseSpeed=5+vig*0.34;                   // % track / sec
  const speedCap=10+vig*0.50;
  const retargetMax=clamp(1.85-vig*0.013,0.48,1.75);
  const retargetMin=clamp(retargetMax*0.48,0.24,0.85);
  const noise=10+vig*0.52;
  const rewardMult=0.65+vig/55;                 // ~1.0 at vig 20, ~2.2 at 85
  const rareChance=clamp(0.05+vig*0.0018,0.06,0.22);
  const grace=clamp(2.2-vig*0.018,0.55,2.0);    // visual/touch forgiveness
  let band='Routine';
  if(vig<25)band='Very Easy'; else if(vig<40)band='Easy'; else if(vig<55)band='Watchful';
  else if(vig<70)band='Hard'; else if(vig<85)band='Very Hard'; else band='Extremely Alert';
  return {width,baseSpeed,speedCap,retargetMin,retargetMax,noise,rewardMult,rareChance,grace,band};
};

RF.startPickpocket=function(id,passer=false){
  const s=RF.state;if(!s||s.combat||s.activity)return;
  const speaker=passer?RF.passersHere(s).find(x=>x.id===id):RF.DATA.npcs[id];if(!speaker)return;
  const resume=s.speed;s.speed=0;
  const vig=RF.v9Vigilance({...speaker,id:speaker.id||id},passer),skill=s.skills.thieving.level||1,p=RF.v104PickProfile(vig,skill);
  const target=4+Math.random()*(92-p.width),attention=3+Math.random()*94;
  RF.actionGame={type:'pickpocket',id,passer,speaker:{name:speaker.name,icon:speaker.icon||'🧑',job:speaker.job||'Traveller'},target,width:p.width,
    attention,lastVisualAttention:attention,velocity:(Math.random()*p.baseSpeed*.7+p.baseSpeed*.35)*(Math.random()<.5?-1:1),wanderTarget:Math.random()*100,
    vigilance:vig,pickProfile:p,resumeSpeed:resume,message:`${p.band} mark. Wait until the attention marker is visibly inside green.`};
  RF.UI.modal={type:'v7Action'};RF.UI.render(s);RF.v9StartPickTicker();
};

RF.v9StartPickTicker=function(){
  RF.v9StopPick();let last=performance.now(),retarget=0;
  RF.V9.pickTimer=setInterval(()=>{
    const g=RF.actionGame;if(!g||g.type!=='pickpocket'){RF.v9StopPick();return}
    const p=g.pickProfile||RF.v104PickProfile(g.vigilance||40,RF.state?.skills?.thieving?.level||1);
    const now=performance.now(),dt=Math.min(.08,(now-last)/1000);last=now;retarget-=dt;
    if(retarget<=0||Math.abs(g.wanderTarget-g.attention)<2.2){g.wanderTarget=2+Math.random()*96;retarget=p.retargetMin+Math.random()*(p.retargetMax-p.retargetMin)}
    const dir=Math.sign(g.wanderTarget-g.attention)||1;
    const desired=dir*p.baseSpeed*(0.75+Math.random()*.45);
    g.velocity+=(desired-g.velocity)*Math.min(1,dt*(1.5+g.vigilance/65))+(Math.random()-.5)*p.noise*dt;
    g.velocity=clamp(g.velocity,-p.speedCap,p.speedCap);g.attention+=g.velocity*dt;
    if(g.attention<0){g.attention=0;g.velocity=Math.abs(g.velocity)*.8}if(g.attention>100){g.attention=100;g.velocity=-Math.abs(g.velocity)*.8}
    const el=document.querySelector('.v9AttentionNeedle');
    if(el){el.style.left=`${g.attention}%`;g.lastVisualAttention=g.attention;g.lastVisualAt=performance.now()}
  },35);
};

RF.liftPurse=function(){
  const s=RF.state,g=RF.actionGame;if(!s||!g||g.type!=='pickpocket')return;
  // Capture what the player actually saw BEFORE stopping the ticker.
  const el=document.querySelector('.v9AttentionNeedle');
  let pos=el?parseFloat(el.style.left):NaN;if(!Number.isFinite(pos))pos=Number.isFinite(g.lastVisualAttention)?g.lastVisualAttention:g.attention;
  RF.v9StopPick();
  const skill=s.skills.thieving.level||1,p=g.pickProfile||RF.v104PickProfile(g.vigilance||40,skill);
  const lo=g.target,hi=g.target+g.width,grace=p.grace;
  const inside=pos>=lo-grace&&pos<=hi+grace;
  const dist=pos<lo?lo-pos:pos>hi?pos-hi:0;
  const before=RF.activitySnapshot(s);
  if(inside){
    const base=4+Math.floor(Math.random()*(8+skill*1.5));
    const gold=Math.max(2,Math.round(base*p.rewardMult));s.gold+=gold;s.stats.goldEarned=(s.stats.goldEarned||0)+gold;
    const xp=Math.round((14+skill+g.vigilance*.22));RF.addXp(s,'thieving',xp);s.stats.pickpockets=(s.stats.pickpockets||0)+1;
    let bonus='';
    if(Math.random()<p.rareChance){const pool=g.vigilance>=70?['lockpick','traveller_token','field_tonic','honey_cake']:['bread','lockpick','honey_cake'];const item=pool[Math.floor(Math.random()*pool.length)];if(RF.addItem(s,item,1)!==false)bonus=` Plus: ${RF.DATA.items[item]?.name||item}.`}
    g.message=`Clean lift. ${gold}g taken.${bonus}`;RF.log(s,`${g.speaker.name}: clean pickpocket for ${gold}g (${p.band}, vigilance ${g.vigilance}).`,'good');
  }else{
    const severity=0.75+g.vigilance/70;
    const bounty=Math.max(8,Math.round((10+Math.min(28,dist*.55))*severity));
    s.crime=s.crime||{bounty:0,heat:0};s.crime.bounty=(s.crime.bounty||0)+bounty;
    s.crime.heat=Math.min(100,(s.crime.heat||0)+Math.round(10+g.vigilance*.16));
    RF.addXp(s,'thieving',Math.max(3,Math.round(4+g.vigilance*.035)));
    g.message=`Caught! Bounty +${bounty}g.`;RF.log(s,`Pickpocket failed against ${g.speaker.name}: bounty +${bounty}g.`,'bad');
    if(!g.passer&&RF.changeRelation)RF.changeRelation(s,g.id,-3);
  }
  RF.advanceWorld(2);s.speed=g.resumeSpeed??1;RF.actionGame=null;RF.save(s);
  RF.UI.modal=RF.makeResult(s,before,inside?'Clean Lift':'Pickpocket Failed',inside?'🪙':'🚨')||{type:'message',title:inside?'Clean Lift':'Caught',text:g.message};RF.UI.render(s);
};

// Richer pickpocket panel, retaining V9's action UI but explaining the curve.
const v104ActionBase=RF.UI.v7ActionModal?.bind(RF.UI);
if(v104ActionBase)RF.UI.v7ActionModal=function(s,g){
  if(g?.type==='pickpocket'){
    const p=g.pickProfile||RF.v104PickProfile(g.vigilance||40,s.skills.thieving.level||1);
    const approx=Math.max(3,Math.round((7+(s.skills.thieving.level||1)*.8)*p.rewardMult));
    return `<div class="modalBack actionBack"><div class="modal actionModal"><div class="actionHero">🖐️</div><span class="eyebrow">PICKPOCKET • ${g.speaker.job||'Traveller'}</span><h2>${g.speaker.icon} ${g.speaker.name}</h2><div class="statsGrid"><div class="statbox"><span>Vigilance</span><b>${g.vigilance}/100</b></div><div class="statbox"><span>Difficulty</span><b>${p.band}</b></div><div class="statbox"><span>Safe window</span><b>${Math.round(g.width)}%</b></div><div class="statbox"><span>Likely take</span><b>~${approx}g+</b></div></div><div class="timingTrack v9PickTrack"><div class="timingTarget" style="left:${g.target}%;width:${g.width}%"></div><div class="timingNeedle v9AttentionNeedle" style="left:${g.attention}%"></div></div><div class="tiny center">Low vigilance means slow movement and a broad opening. Alert marks are faster, tighter, richer and more dangerous.</div><button class="tapButton" data-lift-purse>🪙 LIFT PURSE</button><div class="actionFeedback">${g.message}</div><button class="quietClose" data-v7-abandon>Think better of it</button></div></div>`;
  }
  return v104ActionBase(s,g);
};

if(RF.state){RF.state.version='10.4.0';RF.save(RF.state)}
})();
