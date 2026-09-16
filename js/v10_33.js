window.RF=window.RF||{};
RF.VERSION='10.33.0';
RF.BUILD={
  version:'10.33.0',
  title:'Build Beacon',
  built:'16 Sep 2026 • 01:10 BST',
  buildId:'20260916-0110-bst'
};
RF.V1033=RF.V1033||{};

/* Realmforge V10.33 — Build Beacon
   - Permanent main-menu build/deployment stamp backed by version.txt.
   - Repairs the Developer page controls after the old V10.10 bind wrapper lost its state argument.
   - Stops periodic world renders from destroying focused Developer selects/number inputs.
   - Gives every Developer action a visible confirmation toast.
*/

(()=>{
const V=RF.V1033;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.33.0';
  s.v1033=s.v1033||{};
  const d=s.v1033.dev=s.v1033.dev||{};
  const firstSkill=Object.keys(RF.DATA.skills||{})[0]||'attack';
  const firstItem=Object.keys(RF.DATA.items||{})[0]||'';
  const firstQuest=Object.keys(RF.DATA.quests||{})[0]||'';
  if(!RF.DATA.skills?.[d.skill])d.skill=firstSkill;
  if(!RF.DATA.items?.[d.item])d.item=firstItem;
  if(!RF.DATA.locations?.[d.location])d.location=s.location||'greenvale';
  if(!RF.DATA.quests?.[d.quest])d.quest=firstQuest;
  d.qty=Math.max(1,Math.min(99999,Math.floor(Number(d.qty)||1)));
  return s;
};

const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.33.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(oldMig(s));
}

// ---------- Build beacon / deployment sentinel ----------
V.parseVersion=function(text){
  const out={};
  String(text||'').split(/\r?\n/).forEach(line=>{
    const i=line.indexOf('=');if(i<1)return;
    out[line.slice(0,i).trim().toLowerCase()]=line.slice(i+1).trim();
  });
  return out;
};
V.compareVersion=function(a,b){
  const aa=String(a||'').replace(/^v/i,'').split('.').map(x=>Number(x)||0),bb=String(b||'').replace(/^v/i,'').split('.').map(x=>Number(x)||0);
  for(let i=0;i<Math.max(aa.length,bb.length);i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return Math.sign(d)}
  return 0;
};
V.buildMarkup=function(){return `<div class="rfBuildBeacon" data-v1033-build>
  <div class="rfBuildTop"><span>VERSION.TXT • LIVE BUILD</span><b>V${RF.BUILD.version} • ${RF.BUILD.title}</b></div>
  <div class="rfBuildWhen">Built ${RF.BUILD.built}</div>
  <div class="rfBuildStatus checking" data-v1033-build-status>Checking deployed version…</div>
  <button type="button" data-v1033-check-build>↻ Check deployed build</button>
</div>`};
V.checkRemoteBuild=async function(){
  const status=document.querySelector('[data-v1033-build-status]');
  if(status){status.className='rfBuildStatus checking';status.textContent='Checking deployed version…'}
  try{
    const res=await fetch('./version.txt',{cache:'no-store'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const info=V.parseVersion(await res.text()),remote=info.version||'';
    if(!remote)throw new Error('version.txt has no version field');
    const cmp=V.compareVersion(remote,RF.BUILD.version),el=document.querySelector('[data-v1033-build-status]');if(!el)return;
    let published='';
    const lm=res.headers.get('last-modified');
    if(lm){try{published=` • server ${new Date(lm).toLocaleString(undefined,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}`}catch(_){}}
    if(cmp===0){el.className='rfBuildStatus current';el.textContent=`✓ Server matches V${remote}${published}`}
    else if(cmp>0){el.className='rfBuildStatus update';el.textContent=`↻ V${remote} is deployed. Fully close/reopen or reload to update.`}
    else {el.className='rfBuildStatus waiting';el.textContent=`⏳ Server still reports V${remote}. Deployment has not caught up yet.`}
  }catch(err){
    const el=document.querySelector('[data-v1033-build-status]');if(el){el.className='rfBuildStatus offline';el.textContent=`Offline/unavailable • running V${RF.BUILD.version}`}
  }
};

if(RF.V101?.renderMainMenu){
  const baseMain=RF.V101.renderMainMenu.bind(RF.V101);
  RF.V101.renderMainMenu=function(){
    baseMain();
    const foot=document.querySelector('.rfMainFoot');
    if(foot){foot.innerHTML=V.buildMarkup();foot.classList.add('v1033Foot')}
    document.querySelector('[data-v1033-check-build]')?.addEventListener('click',()=>V.checkRemoteBuild());
    setTimeout(()=>V.checkRemoteBuild(),60);
  };
}

// ---------- Developer UI ----------
V.devState=function(s){V.migrate(s);return s.v1033.dev};
V.sel=function(entries,value,labelFn){return entries.map(([id,d])=>`<option value="${id}" ${id===value?'selected':''}>${labelFn(id,d)}</option>`).join('')};

RF.UI.dev=function(s){
  const d=V.devState(s);
  const skills=V.sel(Object.entries(RF.DATA.skills||{}),d.skill,(_id,x)=>`${x.icon||''} ${x.name}`);
  const items=V.sel(Object.entries(RF.DATA.items||{}).filter(([,it])=>!it.hidden).sort((a,b)=>a[1].name.localeCompare(b[1].name)),d.item,(_id,it)=>`${it.icon||'•'} ${it.name}`);
  const locs=V.sel(Object.entries(RF.DATA.locations||{}).sort((a,b)=>a[1].name.localeCompare(b[1].name)),d.location,(_id,l)=>`${l.icon||'📍'} ${l.name}`);
  const quests=V.sel(Object.entries(RF.DATA.quests||{}).sort((a,b)=>a[1].name.localeCompare(b[1].name)),d.quest,(_id,q)=>q.name);
  return `<section class="card devCard v1033Dev"><h2>🛠️ Developer</h2>
    <div class="notice">Testing controls. Every action changes the live campaign immediately and now confirms what happened.</div>
    <div class="v1033DevHint">Controls stay stable while you type or open a dropdown. World time can continue in the background.</div>
    <h3>Player</h3><div class="devGrid">
      <button data-dev="gold+">+100 Gold</button><button data-dev="gold-">-100 Gold</button>
      <button data-dev="heal">Full Heal</button><button data-dev="damage">Take 25 HP</button>
      <button data-dev="xp+">+250 Character XP</button><button data-dev="clearcrime">Clear Bounty / Heat</button>
    </div>
    <h3>Energy</h3><div class="devGrid"><button data-v10-dev-energy="full">Full Energy</button><button data-v10-dev-energy="empty">Empty Energy</button></div>
    <h3>Skill XP</h3><select data-dev-skill>${skills}</select><div class="devGrid"><button data-dev-skillxp="100">+100 XP</button><button data-dev-skillxp="1000">+1000 XP</button><button data-dev-skillxp="-100">-100 XP</button></div>
    <h3>Give / Remove Item</h3><select data-dev-item>${items}</select><input data-dev-itemqty type="number" inputmode="numeric" value="${d.qty}" min="1" max="99999" enterkeyhint="done"><div class="devGrid"><button data-dev-itemact="give">Give</button><button data-dev-itemact="remove">Remove</button></div>
    <h3>World</h3><select data-dev-location>${locs}</select><div class="devGrid"><button data-dev="teleport">Teleport</button><button data-dev="hour">+1 Hour</button><button data-dev="day">+1 Day</button><button data-dev="weather">Cycle Weather</button></div>
    <h3>Quest Testing</h3><select data-dev-quest>${quests}</select><div class="devGrid"><button data-dev-questact="start">Start</button><button data-dev-questact="complete">Complete</button><button data-dev-questact="reset">Reset</button></div>
    <h3>Utilities</h3><div class="devGrid"><button data-dev="fillhpstam">Restore HP + Stamina</button><button data-dev="packclear">Clear Unequipped Pack</button><button data-dev="reveal">Reveal Locations</button><button data-dev="logstate">Log State Summary</button><button data-v1033-recover-travel>${s.activity?.type==='travel'?'Cancel / Recover Current Journey':'Reset Travel / Clock State'}</button></div>
  </section>`;
};

V.toastTimer=null;
V.notify=function(text,type='good'){
  let el=document.getElementById('rfDevToast');
  if(!el){el=document.createElement('div');el.id='rfDevToast';document.body.appendChild(el)}
  el.className=`rfDevToast ${type}`;el.textContent=text;el.classList.add('show');
  clearTimeout(V.toastTimer);V.toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
};
V.preserveRender=function(s){
  const y=window.scrollY||0;V.forceNextRender=true;RF.UI.render(s||RF.state);requestAnimationFrame(()=>window.scrollTo(0,y));
};
V.commit=function(s,msg,type='good'){RF.save?.(s);V.preserveRender(s);setTimeout(()=>V.notify(msg,type),0)};
V.currentQty=function(s){const raw=document.querySelector('[data-dev-itemqty]')?.value??V.devState(s).qty;const q=Math.max(1,Math.min(99999,Math.floor(Number(raw)||1)));V.devState(s).qty=q;return q};

V.playerAction=function(action){
  const s=RF.state;if(!s)return;
  if(action==='gold+') {s.gold+=100;return V.commit(s,`🪙 +100 Gold • ${s.gold}g total`)}
  if(action==='gold-') {const n=Math.min(100,s.gold||0);s.gold=Math.max(0,(s.gold||0)-100);return V.commit(s,`🪙 -${n} Gold • ${s.gold}g total`,n?'good':'neutral')}
  if(action==='heal'){const before=s.player.hp;s.player.hp=s.player.maxHp;return V.commit(s,`❤️ Health restored • +${Math.max(0,s.player.hp-before)} HP • ${s.player.hp}/${s.player.maxHp}`)}
  if(action==='damage'){const before=s.player.hp;s.player.hp=Math.max(1,s.player.hp-25);return V.commit(s,`💥 ${before-s.player.hp} damage applied • ${s.player.hp}/${s.player.maxHp}`,'bad')}
  if(action==='xp+'){const before=s.player.level;RF.addPlayerXp(s,250);return V.commit(s,`✨ +250 Character XP • Level ${s.player.level}${s.player.level>before?` (+${s.player.level-before})`:''}`)}
  if(action==='clearcrime'){
    const bounty=Math.max(Number(s.bounty)||0,Number(s.crime?.bounty)||0),heat=Math.max(Number(s.heat)||0,Number(s.crime?.heat)||0);
    s.bounty=0;s.heat=0;s.crime=s.crime||{};s.crime.bounty=0;s.crime.heat=0;
    return V.commit(s,`🕊️ Crime cleared • ${bounty}g bounty / ${Math.round(heat)} heat removed`);
  }
  if(action==='hour'){RF.advanceWorld?.(60);return V.commit(s,`🕐 Advanced world by 1 hour • Day ${s.day} ${RF.timeString?.(s)||''}`)}
  if(action==='day'){RF.advanceWorld?.(1440);return V.commit(s,`📅 Advanced world by 1 day • Day ${s.day}`)}
  if(action==='weather'){
    const w=['Clear','Cloudy','Rain','Storm','Fog'],i=w.indexOf(s.weather);s.weather=w[(i+1+w.length)%w.length];s.weatherTimer=180;
    return V.commit(s,`🌦️ Weather changed to ${s.weather}`);
  }
  if(action==='fillhpstam'){
    s.player.hp=s.player.maxHp;s.player.stamina=s.player.maxStamina;
    return V.commit(s,`❤️ Health and Stamina fully restored`);
  }
  if(action==='packclear'){
    let removed=0;Object.keys(s.inventory||{}).forEach(id=>{if(!RF.isEquipped?.(s,id)){removed+=s.inventory[id]||0;delete s.inventory[id]}});
    return V.commit(s,`🎒 Cleared ${removed} unequipped item${removed===1?'':'s'} from Pack`,removed?'good':'neutral');
  }
  if(action==='reveal'){
    let n=0;s.visited=s.visited||{};Object.keys(RF.DATA.locations||{}).forEach(id=>{if(!s.visited[id])n++;s.visited[id]=true});
    return V.commit(s,`🗺️ Revealed ${n} previously hidden location${n===1?'':'s'}`);
  }
  if(action==='logstate'){
    RF.log?.(s,`DEV: Lv ${s.player.level}, ${s.gold}g, ${s.location}, D${s.day} ${Math.floor(s.minute/60)}:${String(Math.floor(s.minute%60)).padStart(2,'0')}`,'important');
    return V.commit(s,`📋 State summary written to the game log`);
  }
};

V.bindDev=function(s){
  if(RF.UI.tab!=='dev'||!s)return;
  const d=V.devState(s);
  const bindSel=(q,key)=>{const el=document.querySelector(q);if(!el)return;el.onchange=()=>{d[key]=el.value;RF.save?.(s)}};
  bindSel('[data-dev-skill]','skill');bindSel('[data-dev-item]','item');bindSel('[data-dev-location]','location');bindSel('[data-dev-quest]','quest');
  const qty=document.querySelector('[data-dev-itemqty]');if(qty){
    qty.oninput=()=>{d.qty=Math.max(1,Math.min(99999,Math.floor(Number(qty.value)||1)))};
    qty.onchange=()=>{d.qty=Math.max(1,Math.min(99999,Math.floor(Number(qty.value)||1)));qty.value=d.qty;RF.save?.(s)};
  }

  document.querySelectorAll('[data-dev]').forEach(b=>b.onclick=()=>{
    const action=b.dataset.dev;
    if(action==='teleport'){
      const id=document.querySelector('[data-dev-location]')?.value||d.location;if(!RF.DATA.locations?.[id])return V.notify('⚠️ Invalid teleport destination','bad');
      d.location=id;RF.save?.(s);
      const ok=RF.V1016?.forceTeleport?RF.V1016.forceTeleport(id):false;
      if(!ok){s.activity=null;s.combat=null;RF.actionGame=null;RF.UI.modal=null;s.location=id;s.visited[id]=true;s.speed=1;s.paused=false;V.commit(s,`📍 Teleported to ${RF.DATA.locations[id].name}`)}
      else setTimeout(()=>V.notify(`📍 Teleported to ${RF.DATA.locations[id].name}`),0);
      return;
    }
    V.playerAction(action);
  });

  document.querySelectorAll('[data-v10-dev-energy]').forEach(b=>b.onclick=()=>{
    const full=b.dataset.v10DevEnergy==='full';s.player.energy=full?(s.player.maxEnergy||100):0;V.commit(s,`⚡ Energy ${full?'restored':'emptied'} • ${Math.round(s.player.energy)}/${s.player.maxEnergy||100}`,full?'good':'neutral');
  });

  document.querySelectorAll('[data-dev-skillxp]').forEach(b=>b.onclick=()=>{
    const id=document.querySelector('[data-dev-skill]')?.value||d.skill,amt=Number(b.dataset.devSkillxp)||0,sk=s.skills?.[id];if(!sk)return V.notify('⚠️ Select a valid skill','bad');
    d.skill=id;const beforeXp=sk.xp,beforeLv=sk.level;
    if(amt>=0)RF.addXp(s,id,amt);else {const floor=RF.xpForLevel(sk.level);sk.xp=Math.max(floor,sk.xp+amt);sk.level=RF.levelFromXp(sk.xp)}
    const delta=Math.round(sk.xp-beforeXp);V.commit(s,`${RF.DATA.skills[id]?.icon||'📚'} ${RF.DATA.skills[id]?.name||id}: ${delta>=0?'+':''}${delta} XP • Lv ${sk.level}${sk.level!==beforeLv?` (${beforeLv}→${sk.level})`:''}`,delta<0?'neutral':'good');
  });

  document.querySelectorAll('[data-dev-itemact]').forEach(b=>b.onclick=()=>{
    const id=document.querySelector('[data-dev-item]')?.value||d.item,q=V.currentQty(s),it=RF.DATA.items?.[id];if(!it)return V.notify('⚠️ Select a valid item','bad');d.item=id;
    if(b.dataset.devItemact==='give'){
      const result=RF.addItem(s,id,q);if(result===false){RF.save?.(s);return V.notify(`⚠️ Pack full • ${it.name} could not be added`,'bad')}
      return V.commit(s,`${it.icon||'📦'} Gave ${q} × ${it.name}${result==='banked'?' • sent to Bank':''}`);
    }
    const have=s.inventory?.[id]||0,n=Math.min(q,have);if(n>0)RF.takeItem(s,id,n);return V.commit(s,`${it.icon||'📦'} Removed ${n} × ${it.name}${n<q?` • only ${have} available`:''}`,n?'neutral':'bad');
  });

  document.querySelectorAll('[data-dev-questact]').forEach(b=>b.onclick=()=>{
    const id=document.querySelector('[data-dev-quest]')?.value||d.quest,q=RF.DATA.quests?.[id];if(!q)return V.notify('⚠️ Select a valid quest','bad');d.quest=id;s.quests=s.quests||{};
    const a=b.dataset.devQuestact;if(a==='start')s.quests[id]={active:true,done:false};if(a==='complete')s.quests[id]={active:false,done:true};if(a==='reset')delete s.quests[id];
    V.commit(s,`📜 ${q.name} • ${a==='start'?'started':a==='complete'?'marked complete':'reset'}`);
  });

  document.querySelector('[data-v1033-recover-travel]')?.addEventListener('click',()=>{
    if(s.activity?.type==='travel'){RF.cancelActivity?.();setTimeout(()=>V.notify('🛟 Current journey cancelled and travel state recovered'),0);return}
    RF.actionGame=null;s.activity=null;s.combat=null;RF.UI.modal=null;RF.V1016?.resetUIPause?.(s);s.speed=1;s.paused=false;V.commit(s,'🛟 Travel / clock state reset to 1×');
  });
};

// Developer controls used to receive an undefined state after V10.10. Let the inherited bind chain
// do its normal work, then always replace the Developer handlers with the final live-state versions.
const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  const live=s||RF.state;
  try{bindBase(live)}catch(err){console.warn('[Realmforge V10.33 inherited bind recovery]',err)}
  V.bindDev(live);
};

// The main ticker redraws the page several times per second. Replacing a focused native select/input
// closes Android's picker/keyboard. While editing Developer controls, keep that DOM node alive.
const renderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){
  const a=document.activeElement;
  const editing=RF.UI.tab==='dev'&&a&&a.closest?.('.v1033Dev')&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName);
  if(editing&&!V.forceNextRender)return;
  V.forceNextRender=false;
  return renderBase(s);
};

if(!document.getElementById('rf-v1033-style')){
  const st=document.createElement('style');st.id='rf-v1033-style';st.textContent=`
  .rfMainFoot.v1033Foot{margin-top:18px}.rfBuildBeacon{border:1px solid #4f432f;background:#15120e;border-radius:14px;padding:12px;text-align:left}.rfBuildTop span{display:block;color:#8f826e;font-size:10px;font-weight:800;letter-spacing:.18em}.rfBuildTop b{display:block;color:#ead6a9;font-size:14px;margin-top:3px}.rfBuildWhen{color:#9f927d;font-size:11px;margin-top:3px}.rfBuildStatus{margin-top:9px;border-radius:9px;padding:7px 9px;font-size:11px;border:1px solid #41382d;background:#1d1914}.rfBuildStatus.current{color:#a9d98d;border-color:#48643b;background:#142012}.rfBuildStatus.update{color:#ffd58a;border-color:#8a6530;background:#261b0e}.rfBuildStatus.waiting{color:#e5c28b;border-color:#6f5532}.rfBuildStatus.offline{color:#aaa095}.rfBuildBeacon button{margin-top:8px;width:100%;padding:8px 10px;border:1px solid #4b4032;border-radius:9px;background:#211c16;color:#b8aa91;font-size:11px}.v1033DevHint{margin:10px 0 2px;padding:9px 10px;border:1px solid #4e4435;border-radius:10px;background:#17140f;color:#a99d89;font-size:12px}.v1033Dev select,.v1033Dev input{width:100%;box-sizing:border-box}.rfDevToast{position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translate(-50%,18px);z-index:250;width:min(88vw,520px);box-sizing:border-box;padding:11px 14px;border-radius:12px;border:1px solid #655438;background:#17140f;color:#eadfc5;box-shadow:0 10px 32px #000b;opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease;font-weight:700;font-size:13px;text-align:center}.rfDevToast.show{opacity:1;transform:translate(-50%,0)}.rfDevToast.good{border-color:#557042;color:#c9e6b2}.rfDevToast.bad{border-color:#8b4c43;color:#f0b0a8}.rfDevToast.neutral{border-color:#6a5c45;color:#d6c4a1}
  `;document.head.appendChild(st);
}

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state)}
// Re-render the startup menu once so the build beacon replaces the old static V10.1 footer.
setTimeout(()=>{if(RF.V101?.mainMenu)RF.V101.renderMainMenu();else if(RF.state)RF.UI.render(RF.state)},0);

})();
