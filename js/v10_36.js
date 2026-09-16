window.RF=window.RF||{};
RF.VERSION='10.36.0';
RF.BUILD={
  version:'10.36.0',
  title:'Battle Intel',
  built:'16 Sep 2026 • 02:51 BST',
  buildId:'20260916-0251-bst'
};
RF.V1036=RF.V1036||{};

/* Realmforge V10.36 — Battle Intel
   - Press and hold any combat Action tile for 2 seconds to open its information card.
   - Normal taps remain instant combat actions.
   - Adds a clear "Hold 2s for more info" hint beside Actions.
   - Long-press information remains available even while an action is temporarily unavailable.
*/

(()=>{
const V=RF.V1036;
V.HOLD_MS=2000;
V.MOVE_CANCEL_PX=14;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.36.0';
  s.v1036=s.v1036||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.36.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(oldMig(s));
}

V.escape=function(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
V.pct=n=>`${Math.round((+n||0)*100)}%`;
V.kindLabel=k=>({attack:'Weapon attack',magic:'Magic attack',guard:'Defensive stance',riposte:'Counter stance',heal:'Recovery',status:'Status technique',volley:'Ranged attack'}[k]||'Combat technique');

V.abilityInfo=function(id,s){
  const a=RF.DATA.abilities?.[id];
  if(!a)return null;
  const reqSkill=a.skill;
  const reqName=reqSkill?RF.DATA.skills?.[reqSkill]?.name||reqSkill:'Character';
  const have=reqSkill?s?.skills?.[reqSkill]?.level:s?.player?.level;
  const rows=[];
  rows.push(['Type',V.kindLabel(a.kind)]);
  rows.push(['Requirement',`${reqName} Lv ${a.level||1}${have!=null?` • You: ${have}`:''}`]);
  rows.push(['Stamina',a.cost?`${a.cost} STA`:'Free']);
  rows.push(['Cooldown',a.oncePerBattle?'Once per battle':(a.cooldown?`${a.cooldown} turn${a.cooldown===1?'':'s'}`:'None')]);
  if(a.requiresBow)rows.push(['Weapon','Requires a bow']);
  if(['attack','magic'].includes(a.kind)){
    rows.push(['Base accuracy',V.pct(a.accuracy == null ? .9 : a.accuracy)]);
    rows.push(['Damage',`${(a.power||1).toFixed(2).replace(/\.00$/,'')}× base`]);
    rows.push(['Base crit',V.pct(a.crit == null ? .08 : a.crit)]);
  }
  if(a.kind==='volley')rows.push(['Effect','Two rapid bow hits']);
  if(a.status)rows.push(['On hit',`${RF.statusName?.(a.status.id)||a.status.id} • ${V.pct(a.status.chance==null?1:a.status.chance)} • ${a.status.turns} turn${a.status.turns===1?'':'s'}`]);
  if(a.targetStatus)rows.push(['Effect',`${RF.statusName?.(a.targetStatus.id)||a.targetStatus.id} for ${a.targetStatus.turns} turn${a.targetStatus.turns===1?'':'s'}`]);
  if(a.v81Stamina)rows.push(['Bonus',`Recover ${a.v81Stamina} Stamina`]);
  if(a.v81WeakenEnemy)rows.push(['Bonus','Weakens the enemy after guarding']);
  if(a.v81Execute)rows.push(['Finisher','Deals much more damage below 32% enemy HP']);
  return {icon:a.icon||'⚔️',name:a.name||id,eyebrow:a.special?'SPECIAL ABILITY':'COMBAT ABILITY',desc:a.desc||'A combat technique.',rows};
};

V.parryInfo=function(s){
  const def=s?.skills?.defence?.level||1,atk=s?.skills?.attack?.level||1;
  const chance=Math.min(.88,.32+def*.022+atk*.0035);
  const minReduce=Math.min(.88,.48+def*.012),maxReduce=Math.min(.98,.68+def*.012);
  const reflect=Math.min(.72,.16+def*.021),perfect=Math.min(.36,.035+def*.011);
  return {icon:'🛡️',name:'Parry',eyebrow:'DEFENCE ACTION',desc:'Read the incoming strike and try to catch it. A successful parry prevents part of the damage and throws force back at the attacker.',rows:[
    ['Training','Banks Defence XP'],
    ['Catch chance',V.pct(chance)],
    ['Damage stopped',`${V.pct(minReduce)}–${V.pct(maxReduce)} on a normal success`],
    ['Perfect parry',`${V.pct(perfect)} chance after a successful catch`],
    ['Reflection',`Up to about ${V.pct(reflect)} of blocked force`],
    ['Cost','No Stamina cost']
  ]};
};

V.fleeInfo=function(s){
  const c=s?.combat;
  let chance=c?.forced?.45:.72;
  const smoke=!!(RF.perkRank?.(s,'vanish')&&(s?.inventory?.smoke_bomb||0)>0);
  if(smoke)chance=1;
  return {icon:'🏃',name:'Flee',eyebrow:'ESCAPE ACTION',desc:'Try to disengage from the fight. Failure gives the enemy an immediate opening to act.',rows:[
    ['Current escape chance',V.pct(chance)],
    ['Encounter',c?.forced?'Forced / ambush':'Voluntary fight'],
    ['Failure','Enemy immediately takes its turn'],
    ...(smoke?[['Vanish','Smoke Bomb available • escape becomes guaranteed']]:[])
  ]};
};

V.infoFor=function(id,s){
  if(id==='parry')return V.parryInfo(s);
  if(id==='flee')return V.fleeInfo(s);
  return V.abilityInfo(id,s);
};

V.closeInfo=function(){
  document.querySelector('.v1036InfoBack')?.remove();
};

V.showInfo=function(id){
  const s=RF.state,info=V.infoFor(id,s);
  if(!info)return;
  V.closeInfo();
  const back=document.createElement('div');
  back.className='v1036InfoBack';
  back.innerHTML=`<div class="v1036InfoModal" role="dialog" aria-modal="true" aria-label="${V.escape(info.name)} information">
    <div class="v1036InfoHero"><div class="v1036InfoIcon">${info.icon}</div><div><span class="eyebrow">${V.escape(info.eyebrow)}</span><h2>${V.escape(info.name)}</h2></div></div>
    <p class="v1036InfoDesc">${V.escape(info.desc)}</p>
    <div class="v1036InfoRows">${info.rows.map(([k,v])=>`<div><span>${V.escape(k)}</span><b>${V.escape(v)}</b></div>`).join('')}</div>
    <button class="v1036InfoClose">Close</button>
  </div>`;
  document.body.appendChild(back);
  back.addEventListener('click',e=>{if(e.target===back||e.target.closest('.v1036InfoClose'))V.closeInfo()});
  navigator.vibrate?.(18);
};

// Keep V10.35's compact renderer and only add the information affordances.
const combatBase=RF.UI.combatPopup.bind(RF.UI);
RF.UI.combatPopup=function(s){
  let h=combatBase(s);
  if(!h)return h;
  h=h.replace('<div class="battleSectionTitle v1035SectionTitle">Actions</div>',
    '<div class="battleSectionTitle v1035SectionTitle v1036ActionHead"><span>Actions</span><small>Press & hold 2s for more info</small></div>');
  h=h.replace(/(<button[^>]*data-ability="([^"]+)"[^>]*)>/g,(m,start,id)=>`${start} data-combat-info="${id}">`);
  h=h.replace(/(<button[^>]*data-parry[^>]*)>/g,(m,start)=>`${start} data-combat-info="parry">`);
  h=h.replace(/(<button[^>]*data-v4-flee[^>]*)>/g,(m,start)=>`${start} data-combat-info="flee">`);
  return h;
};

V.bindTile=function(btn){
  if(!btn||btn.dataset.v1036Bound==='1')return;
  btn.dataset.v1036Bound='1';

  // Native disabled buttons do not reliably receive long-press pointer events on Android.
  // Preserve their unavailable state ourselves so information remains inspectable at any time.
  const locked=!!btn.disabled;
  btn.dataset.v1036Locked=locked?'1':'0';
  if(locked){
    btn.disabled=false;
    btn.setAttribute('aria-disabled','true');
    btn.classList.add('v1036Locked');
  }

  let timer=0,startX=0,startY=0,longFired=false,activePointer=null;
  const cancel=()=>{if(timer){clearTimeout(timer);timer=0}btn.classList.remove('v1036Holding');activePointer=null};

  btn.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    cancel();
    longFired=false;
    activePointer=e.pointerId;
    startX=e.clientX;startY=e.clientY;
    btn.classList.add('v1036Holding');
    timer=setTimeout(()=>{
      timer=0;
      longFired=true;
      btn.classList.remove('v1036Holding');
      V.showInfo(btn.dataset.combatInfo);
    },V.HOLD_MS);
  });
  btn.addEventListener('pointermove',e=>{
    if(activePointer!==e.pointerId)return;
    if(Math.hypot(e.clientX-startX,e.clientY-startY)>V.MOVE_CANCEL_PX)cancel();
  });
  btn.addEventListener('pointerup',cancel);
  btn.addEventListener('pointercancel',cancel);
  btn.addEventListener('lostpointercapture',cancel);
  btn.addEventListener('contextmenu',e=>e.preventDefault());

  // Capture before the older combat onclick handlers. A completed long press must never
  // accidentally fire the combat move when the finger is released.
  btn.addEventListener('click',e=>{
    if(longFired){
      longFired=false;
      e.preventDefault();e.stopImmediatePropagation();
      return;
    }
    if(btn.dataset.v1036Locked==='1'){
      e.preventDefault();e.stopImmediatePropagation();
      RF.animateDenied?.(btn);
    }
  },true);
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelectorAll('.v1035ActionTile[data-combat-info]').forEach(V.bindTile);
};

// Clean up a stale help card if combat is closed by another system.
const renderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){
  if(!s?.combat)V.closeInfo();
  return renderBase(s);
};

const st=document.createElement('style');st.id='v1036-battle-intel-style';st.textContent=`
.v1036ActionHead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.v1036ActionHead small{font-size:7px;font-weight:500;color:#a89b84;text-transform:none;letter-spacing:.01em;text-align:right}
.v1035ActionTile[data-combat-info]{position:relative;overflow:hidden;-webkit-touch-callout:none;user-select:none;touch-action:manipulation}
.v1035ActionTile.v1036Locked{opacity:.34;filter:grayscale(.45) saturate(.45)}
.v1035ActionTile.v1036Holding{outline:1px solid #bc8b45;box-shadow:0 0 0 1px #bc8b4528 inset}
.v1035ActionTile.v1036Holding:after{content:'';position:absolute;left:0;bottom:0;height:3px;background:#d8ae63;animation:v1036HoldFill 2s linear forwards;pointer-events:none}
@keyframes v1036HoldFill{from{width:0}to{width:100%}}
.v1036InfoBack{position:fixed;inset:0;z-index:140;background:#080604c9;backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:18px 14px calc(18px + env(safe-area-inset-bottom))}
.v1036InfoModal{width:min(430px,100%);max-height:88vh;overflow:auto;border:1px solid #775c38;border-radius:18px;background:linear-gradient(180deg,#21190f,#15110d);box-shadow:0 22px 60px #000b;padding:17px}
.v1036InfoHero{display:flex;align-items:center;gap:12px;margin-bottom:10px}.v1036InfoIcon{width:58px;height:58px;display:grid;place-items:center;border-radius:16px;font-size:34px;background:#2a2117;border:1px solid #6b5438}
.v1036InfoHero h2{margin:2px 0 0;color:#f0d99f;font-size:25px}.v1036InfoDesc{margin:7px 0 13px;color:#c4b79f;line-height:1.45;font-size:13px}
.v1036InfoRows{border:1px solid #463729;border-radius:13px;overflow:hidden}.v1036InfoRows>div{display:grid;grid-template-columns:minmax(95px,.8fr) minmax(0,1.4fr);gap:10px;padding:9px 10px;border-bottom:1px solid #392d23}.v1036InfoRows>div:last-child{border-bottom:0}.v1036InfoRows span{font-size:10px;color:#958976}.v1036InfoRows b{font-size:10px;color:#e5d5b5;text-align:right;line-height:1.3}
.v1036InfoClose{width:100%;margin-top:13px;min-height:46px;border-radius:12px;border:1px solid #745630;background:#302215;color:#f2dfb7;font-weight:700}
@media(max-width:390px){.v1036ActionHead small{max-width:145px;font-size:6.5px}.v1036InfoBack{padding:10px}.v1036InfoModal{padding:14px}.v1036InfoHero h2{font-size:22px}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
