/* Realmforge V10.8 — Moving Target
   - Pickpocket green window now drifts left/right continuously.
   - Safe window smoothly grows and shrinks while the attention needle continues independently.
   - Vigilance controls window size, movement speed and unpredictability.
   - Result popup freezes the exact visible needle + green-window geometry from the tap.
*/
(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V108=RF.V108||{};RF.V108.version='10.8.0';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Precision-first profile: readable needle speed, moving/tightening target supplies the complexity.
RF.v104PickProfile=function(vig,skill){
  let baseWidth;
  if(vig<=20) baseWidth=20;
  else if(vig<=30) baseWidth=20-(vig-20)*0.28;      // 20 -> 17.2
  else if(vig<=45) baseWidth=17.2-(vig-30)*0.24;    // 17.2 -> 13.6
  else if(vig<=60) baseWidth=13.6-(vig-45)*0.20;    // 13.6 -> 10.6
  else if(vig<=70) baseWidth=10.6-(vig-60)*0.18;    // 10.6 -> 8.8
  else baseWidth=8.8-(vig-70)*0.12;                 // 8.8 -> 5.8 at 95
  baseWidth+=Math.min(3.2,Math.max(0,(skill-1)*0.035));
  baseWidth=clamp(baseWidth,5.2,22);

  // Needle remains deliberately readable across all vigilance levels.
  const baseSpeed=1.8+vig*0.085;                    // ~2.7..9.9 %/sec
  const speedCap=3.7+vig*0.105;                     // ~4.8..13.7 %/sec
  const retargetMax=clamp(3.0-vig*0.013,1.15,2.8);
  const retargetMin=clamp(retargetMax*.52,.55,1.35);
  const noise=3.5+vig*.17;

  // The green zone itself becomes more active as vigilance rises.
  const targetSpeed=.45+vig*.018;                   // ~0.6..2.2 %/sec
  const targetSpeedCap=.8+vig*.027;                 // ~1.1..3.4 %/sec
  const targetRetargetMin=clamp(3.8-vig*.022,1.05,3.4);
  const targetRetargetMax=targetRetargetMin+clamp(2.2-vig*.008,1.0,2.0);
  const widthSwing=clamp(2.8-vig*.012,1.2,2.7);      // +/- percentage points
  const widthRate=.34+vig*.0045;                    // slow breathing, a little quicker when alert

  const rewardMult=.65+vig/55;
  const rareChance=clamp(.05+vig*.0018,.06,.22);
  const grace=clamp(1.10-vig*.008,.28,1.02);
  let band='Routine';
  if(vig<25)band='Very Easy'; else if(vig<40)band='Easy'; else if(vig<55)band='Watchful';
  else if(vig<70)band='Hard'; else if(vig<85)band='Very Hard'; else band='Extremely Alert';
  return {width:baseWidth,baseWidth,baseSpeed,speedCap,retargetMin,retargetMax,noise,
    targetSpeed,targetSpeedCap,targetRetargetMin,targetRetargetMax,widthSwing,widthRate,
    rewardMult,rareChance,grace,band};
};

// Rebuild pickpocket start state with two independent moving actors: needle + safe window.
RF.startPickpocket=function(id,passer=false){
  const s=RF.state;if(!s||s.combat||s.activity)return;
  const speaker=passer?RF.passersHere(s).find(x=>x.id===id):RF.DATA.npcs[id];if(!speaker)return;
  const resume=s.speed;s.speed=0;
  const vig=RF.v9Vigilance({...speaker,id:speaker.id||id},passer),skill=s.skills.thieving.level||1,p=RF.v104PickProfile(vig,skill);
  const width=p.baseWidth;
  const target=4+Math.random()*Math.max(1,92-width);
  const attention=3+Math.random()*94;
  const centre=target+width/2;
  RF.actionGame={type:'pickpocket',id,passer,
    speaker:{name:speaker.name,icon:speaker.icon||'🧑',job:speaker.job||'Traveller'},
    target,width,baseWidth:width,targetCentre:centre,targetVelocity:(Math.random()<.5?-1:1)*p.targetSpeed*.55,
    targetWanderCentre:8+Math.random()*84,widthPhase:Math.random()*Math.PI*2,
    attention,lastVisualAttention:attention,velocity:(Math.random()*p.baseSpeed*.65+p.baseSpeed*.3)*(Math.random()<.5?-1:1),wanderTarget:Math.random()*100,
    vigilance:vig,pickProfile:p,resumeSpeed:resume,
    message:`${p.band} mark. Track both their attention and the shifting opportunity window.`};
  RF.UI.modal={type:'v7Action'};RF.UI.render(s);RF.v9StartPickTicker();
};

RF.v9StartPickTicker=function(){
  RF.v9StopPick();
  let last=performance.now(),needleRetarget=0,targetRetarget=0;
  RF.V9.pickTimer=setInterval(()=>{
    const g=RF.actionGame;if(!g||g.type!=='pickpocket'){RF.v9StopPick();return}
    const p=g.pickProfile||RF.v104PickProfile(g.vigilance||40,RF.state?.skills?.thieving?.level||1);
    const now=performance.now(),dt=Math.min(.075,(now-last)/1000);last=now;

    // --- attention needle ---
    needleRetarget-=dt;
    if(needleRetarget<=0||Math.abs(g.wanderTarget-g.attention)<1.5){
      g.wanderTarget=2+Math.random()*96;
      needleRetarget=p.retargetMin+Math.random()*(p.retargetMax-p.retargetMin);
    }
    const ndir=Math.sign(g.wanderTarget-g.attention)||1;
    const ndesired=ndir*p.baseSpeed*(.86+Math.random()*.24);
    g.velocity+=(ndesired-g.velocity)*Math.min(1,dt*(.95+g.vigilance/150))+(Math.random()-.5)*p.noise*dt;
    g.velocity=clamp(g.velocity,-p.speedCap,p.speedCap);
    g.attention+=g.velocity*dt;
    if(g.attention<0){g.attention=0;g.velocity=Math.abs(g.velocity)*.7}
    if(g.attention>100){g.attention=100;g.velocity=-Math.abs(g.velocity)*.7}

    // --- safe window size: smooth breathing, not random popping ---
    g.widthPhase=(g.widthPhase||0)+dt*p.widthRate;
    const widthNoise=Math.sin(g.widthPhase)*p.widthSwing + Math.sin(g.widthPhase*.47+1.3)*(p.widthSwing*.32);
    g.width=clamp(p.baseWidth+widthNoise,Math.max(4.2,p.baseWidth-p.widthSwing*1.18),Math.min(25,p.baseWidth+p.widthSwing*1.18));

    // --- safe window centre: slow wandering with gentle reversals ---
    targetRetarget-=dt;
    if(targetRetarget<=0||Math.abs((g.targetWanderCentre||50)-(g.targetCentre||50))<1.2){
      const half=g.width/2;
      g.targetWanderCentre=half+3+Math.random()*Math.max(1,94-g.width);
      targetRetarget=p.targetRetargetMin+Math.random()*(p.targetRetargetMax-p.targetRetargetMin);
    }
    const tdir=Math.sign(g.targetWanderCentre-g.targetCentre)||1;
    const tdesired=tdir*p.targetSpeed*(.82+Math.random()*.28);
    g.targetVelocity+=(tdesired-g.targetVelocity)*Math.min(1,dt*(.72+g.vigilance/190));
    g.targetVelocity+=(Math.random()-.5)*(.16+g.vigilance*.0025)*dt;
    g.targetVelocity=clamp(g.targetVelocity,-p.targetSpeedCap,p.targetSpeedCap);
    g.targetCentre+=g.targetVelocity*dt;
    const half=g.width/2;
    if(g.targetCentre<half+2){g.targetCentre=half+2;g.targetVelocity=Math.abs(g.targetVelocity)*.68}
    if(g.targetCentre>98-half){g.targetCentre=98-half;g.targetVelocity=-Math.abs(g.targetVelocity)*.68}
    g.target=clamp(g.targetCentre-half,2,98-g.width);

    // Draw all moving parts from the same state snapshot.
    const needle=document.querySelector('.v9AttentionNeedle');
    const zone=document.querySelector('.timingTarget');
    if(needle){needle.style.left=`${g.attention}%`;g.lastVisualAttention=g.attention}
    if(zone){zone.style.left=`${g.target}%`;zone.style.width=`${g.width}%`;g.lastVisualTarget=g.target;g.lastVisualWidth=g.width}
    g.lastVisualAt=now;
  },40);
};

// Patch the copy so the UI explains the moving target without replacing the established panel layout.
const actionBase=RF.UI.v7ActionModal?.bind(RF.UI);
if(actionBase)RF.UI.v7ActionModal=function(s,g){
  const html=actionBase(s,g);
  if(g?.type!=='pickpocket')return html;
  return html
    .replace('Low vigilance means slow movement and a broad opening. Alert marks are faster, tighter, richer and more dangerous.',
      'The green opportunity window now moves and breathes too. Vigilance makes it smaller and less predictable; Thieving skill claws back some room.')
    .replace('Wait until the attention marker is visibly inside green.','Track both moving elements, then lift while the marker is inside green.');
};

if(!document.getElementById('rf-v108-style')){
  const st=document.createElement('style');st.id='rf-v108-style';st.textContent=`
    .v9PickTrack .timingTarget{transition:left .04s linear,width .04s linear;will-change:left,width}
    .v9PickTrack .v9AttentionNeedle{will-change:left}
  `;document.head.appendChild(st);
}

if(RF.state){RF.state.version='10.8.0';RF.save(RF.state)}
})();
