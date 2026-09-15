window.RF=window.RF||{};
RF.VERSION='10.21.0';
RF.V1021=RF.V1021||{};

/* Realmforge V10.21 — Decision Reliability
   - Repairs the Rain Like Thrown Gravel “Push through” choice, which referenced a Survival skill
     that does not exist in the current skill table.
   - Gives all generic event/chain choices one hardened, capture-level click path.
   - Safely evaluates choice conditions and catches bad choice handlers rather than leaving dead buttons.
   - Keeps decision modals above travel/other fixed UI and respects the phone safe area.
*/

RF.V1021.safeLevel=function(s,id){return Math.max(1,+s?.skills?.[id]?.level||1)};
RF.V1021.conditionOK=function(choice,s){
  if(!choice||typeof choice!=='object')return false;
  if(typeof choice.condition!=='function')return true;
  try{return !!choice.condition(s)}catch(err){console.error('[Realmforge V10.21 condition error]',err,choice);return false}
};

// Repair the known road-event failure. “Push through” now uses skills Realmforge really has.
(function repairStormChoice(){
  const storm=RF.DATA?.roadEvents?.find?.(e=>e.id==='sudden_storm');
  if(!storm?.choices?.[1])return;
  const c=storm.choices[1];
  c.sub='Exploration and Vitality improve your odds.';
  c.result=function(s){
    const exploration=RF.V1021.safeLevel(s,'exploration');
    const vitality=RF.V1021.safeLevel(s,'vitality');
    const chance=Math.min(.88,.48+exploration*.013+vitality*.007);
    if(Math.random()<chance){
      RF.addXp?.(s,'exploration',18);
      RF.addXp?.(s,'vitality',8);
      if(s.activity?.type==='travel')s.activity.duration=Math.max(s.activity.progress+1,s.activity.duration-2);
      return 'You lean into the weather, keep your footing and pick a clean line through the worst of the mud. You make up a little time despite the storm.';
    }
    s.player.stamina=Math.max(0,(s.player.stamina||0)-18);
    if(s.activity?.type==='travel')s.activity.duration+=5;
    RF.addXp?.(s,'exploration',7);
    return 'The road fights you for every step. You emerge soaked, tired and several minutes behind.';
  };
})();

RF.V1021.decisionSource=function(m){
  if(m?.type==='event')return {title:m.event?.title||'Road Event',choices:m.event?.choices||[]};
  if(m?.type==='chain')return {title:m.title||'Decision',choices:m.choices||[]};
  return null;
};

RF.V1021.resolve=function(index){
  const s=RF.state,m=RF.UI?.modal,src=RF.V1021.decisionSource(m);
  index=Number(index);
  if(!s||!m||!src||!Number.isInteger(index))return false;
  const c=src.choices[index];
  if(!c||!RF.V1021.conditionOK(c,s))return false;
  try{
    const text=typeof c.result==='function'?c.result(s):(c.reply||'The moment passes.');
    // Some choices deliberately replace the modal themselves. Preserve that behaviour.
    if(RF.UI.modal===m)RF.UI.modal={type:'message',title:src.title,text:text||'The moment passes.'};
    RF.questCheck?.(s);
    RF.save?.(s);
    RF.UI.render?.(s);
    return true;
  }catch(err){
    console.error('[Realmforge V10.21 decision error]',src.title,index,c,err);
    try{RF.log?.(s,`A decision handler recovered from an error: ${src.title}.`,'bad')}catch(_){}
    RF.UI.modal={type:'message',title:'Decision Recovered',text:'That choice hit an internal error instead of resolving. Realmforge caught it safely rather than leaving the button dead. No further input is required; you can continue playing.'};
    try{RF.save?.(s)}catch(_){}
    RF.UI.render?.(s);
    return false;
  }
};

// Final generic event/chain renderer: conditions cannot crash the entire popup.
const v1021ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='event'||m?.type==='chain'){
    const ev=m.type==='event'?m.event:m;
    const choices=(m.type==='event'?m.event?.choices:m.choices)||[];
    const title=m.type==='event'?(m.event?.title||'Event'):(m.title||'Decision');
    const text=m.type==='event'?(m.event?.text||''):(m.text||'');
    const icon=m.type==='event'?(m.event?.icon||'❗'):(m.icon||'❗');
    return `<div class="modalBack v1021DecisionBack"><div class="modal v1021DecisionModal"><div class="v1021DecisionIcon">${icon}</div><h2>${title}</h2><div class="sub">${text}</div><div class="choices">${choices.map((c,i)=>{const ok=RF.V1021.conditionOK(c,s);return `<button type="button" class="choice v1021DecisionChoice" data-choice="${i}" ${ok?'':'disabled'}><b>${c.text||`Choice ${i+1}`}</b>${c.sub?`<small>${c.sub}</small>`:''}</button>`}).join('')}</div></div></div>`;
  }
  return v1021ModalBase(s);
};

// Capture-level delegation means all generic decision buttons use the same reliable route,
// regardless of how many historical bind wrappers have run underneath them.
if(!RF.V1021.delegateInstalled){
  RF.V1021.delegateInstalled=true;
  document.addEventListener('click',function(e){
    const btn=e.target?.closest?.('[data-choice]');
    if(!btn||btn.disabled||!RF.V1021.decisionSource(RF.UI?.modal))return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    RF.V1021.resolve(+btn.dataset.choice);
  },true);
}

// Audit the generic decision tables for obviously malformed options at startup.
RF.V1021.audit=function(){
  const bad=[];
  const groups=[['events',RF.DATA?.events||[]],['roadEvents',RF.DATA?.roadEvents||[]]];
  for(const [group,list] of groups)for(const ev of list)for(const [i,c] of (ev.choices||[]).entries()){
    if(!c?.text)bad.push(`${group}:${ev.id||ev.title}:${i}: missing text`);
    if(typeof c?.result!=='function')bad.push(`${group}:${ev.id||ev.title}:${i}: missing result handler`);
  }
  if(bad.length)console.warn('[Realmforge V10.21 decision audit]',bad);
  return bad;
};
RF.V1021.audit();

(function styleDecisionLayer(){
  const old=document.getElementById('rf-v1021-style');if(old)old.remove();
  const st=document.createElement('style');st.id='rf-v1021-style';st.textContent=`
    .v1021DecisionBack{z-index:220!important;padding:12px 12px calc(18px + env(safe-area-inset-bottom))!important;pointer-events:auto!important}
    .v1021DecisionModal{position:relative;z-index:1;padding-bottom:18px!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
    .v1021DecisionIcon{font-size:42px;line-height:1;margin-bottom:8px}
    .v1021DecisionModal .choices{position:relative;z-index:2;padding-bottom:2px}
    .v1021DecisionChoice{position:relative;z-index:3;pointer-events:auto!important;touch-action:manipulation;min-height:58px;-webkit-tap-highlight-color:rgba(227,184,101,.12)}
    .v1021DecisionChoice:active:not(:disabled){transform:scale(.992);border-color:#b88945;background:#342315}
  `;document.head.appendChild(st);
})();

RF.V1021.migrate=function(s){if(!s)return s;s.version='10.21.0';return s};
if(RF.V95){
  RF.V95.SCHEMA='10.21.0';
  const base=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.V1021.migrate(base(s));
}
if(RF.state){RF.V1021.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state)}
