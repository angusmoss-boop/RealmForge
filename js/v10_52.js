window.RF=window.RF||{};
RF.VERSION='10.52.0';
RF.BUILD={
  version:'10.52.0',
  title:'Quick Stack',
  built:'17 Sep 2026 • 03:36 BST',
  buildId:'20260917-0336-bst'
};
RF.V1052=RF.V1052||{};

/* Realmforge V10.52 — Quick Stack
   - Adds a one-tap Pack -> Bank quick-stack action inside the Vault.
   - Only items that already have a stored Bank stack are moved.
   - Equipped copies remain protected exactly as with normal deposits.
*/

(()=>{
'use strict';
const V=RF.V1052;
const B=RF.V1042;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.52.0';
  s.v1052=s.v1052||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.52.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

V.stackable=function(s){
  if(!s||!B)return [];
  return Object.keys(s.inventory||{}).map(id=>{
    const bankQty=Math.max(0,Number(s.bank?.[id])||0);
    const move=B.packMovable(s,id);
    return {id,move,bankQty};
  }).filter(x=>x.bankQty>0&&x.move>0);
};
V.summary=function(s){
  const rows=V.stackable(s);
  return {stacks:rows.length,items:rows.reduce((n,x)=>n+x.move,0)};
};
V.quickStack=function(){
  const s=RF.state;
  if(!s||!RF.isBankTown?.(s)||RF.UI.modal?.type!=='bank'||!B)return;
  const rows=V.stackable(s);
  if(!rows.length){
    RF.animateDenied?.('[data-v1052-quick-stack]');
    return;
  }
  let items=0;
  for(const {id,move} of rows){
    if(move<1)continue;
    RF.takeItem(s,id,move);
    s.bank=s.bank||{};
    s.bank[id]=(s.bank[id]||0)+move;
    items+=move;
  }
  s.stats=s.stats||{};
  s.stats.bankTransfers=(s.stats.bankTransfers||0)+items;
  RF.log?.(s,`Quick stacked ${items} item${items===1?'':'s'} across ${rows.length} bank stack${rows.length===1?'':'s'}.`);
  if(RF.UI.modal?.type==='bank')delete RF.UI.modal.v1042Qty;
  RF.save?.(s);
  RF.UI.render(s);
};

// Insert the action between the main Pack/Bank tabs and the category controls.
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=modalBase(s);
  if(this.modal?.type!=='bank'||!B)return h;
  const sum=V.summary(s);
  const label=sum.items>0?`${sum.items} item${sum.items===1?'':'s'} • ${sum.stacks} stack${sum.stacks===1?'':'s'}`:'No matching Pack stacks';
  const quick=`<button type="button" class="v1052QuickStack" data-v1052-quick-stack ${sum.items<1?'disabled':''}><span class="v1052QuickIcon">⚡</span><span><b>Quick Stack</b><small>Pack → Bank • ${label}</small></span></button>`;
  h=h.replace(/(<div class="v1042VaultTabs">[\s\S]*?<\/div>)/,`$1${quick}`);
  return h;
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelector('[data-v1052-quick-stack]')?.addEventListener('click',V.quickStack);
};

const oldStyle=document.getElementById('v1052-quick-stack-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1052-quick-stack-style';
st.textContent=`
.v1042VaultModal{grid-template-rows:auto auto auto auto minmax(0,1fr)!important}
.v1052QuickStack{appearance:none;width:100%;min-height:46px;border-radius:14px;border:1px solid rgba(201,159,84,.25);background:linear-gradient(180deg,rgba(49,36,22,.9),rgba(22,16,11,.98));color:#ead8ad;display:flex;align-items:center;gap:10px;padding:8px 12px;text-align:left;box-shadow:inset 0 1px rgba(255,255,255,.04)}
.v1052QuickStack:not(:disabled):active{transform:translateY(1px);filter:brightness(1.08)}
.v1052QuickStack:disabled{opacity:.42;filter:saturate(.55)}
.v1052QuickIcon{width:30px;height:30px;display:grid;place-items:center;border-radius:10px;background:rgba(198,157,89,.09);border:1px solid rgba(198,157,89,.17);font-size:17px;flex:0 0 auto}
.v1052QuickStack>span:last-child{min-width:0;display:grid;gap:2px}.v1052QuickStack b{font-size:12px;color:#f0d79e}.v1052QuickStack small{font-size:9.5px;color:#a99a80;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:430px){.v1052QuickStack{min-height:43px;padding:7px 10px}.v1052QuickIcon{width:28px;height:28px}.v1052QuickStack b{font-size:11.5px}.v1052QuickStack small{font-size:9px}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
