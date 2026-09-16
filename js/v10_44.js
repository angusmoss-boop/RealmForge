window.RF=window.RF||{};
RF.VERSION='10.44.0';
RF.BUILD={
  version:'10.44.0',
  title:'Vault Flow',
  built:'16 Sep 2026 • 22:31 BST',
  buildId:'20260916-2231-bst'
};
RF.V1044=RF.V1044||{};

/* Realmforge V10.44 — Vault Flow
   - Keeps the quantity popup open for repeated quick deposits/withdrawals.
   - Shows the currently available amount beside the item name.
   - Adds a red quick-close button alongside the preset quantity buttons.
*/

(()=>{
'use strict';
const V=RF.V1044;
const B=RF.V1042;
if(!B)return;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.44.0';
  s.v1044=s.v1044||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
    RF.V95.SCHEMA='10.44.0';
    const om=RF.V95.migrate.bind(RF.V95);
    RF.V95.migrate=s=>V.migrate(om(s));
}

B.transfer=function(side,id,qty,keepOpen){
  const s=RF.state;if(!s||!RF.isBankTown?.(s))return;
  qty=Math.max(1,Math.floor(Number(qty)||1));
  const beforeMove=B.moveCount(s,side,id);
  if(side==='pack'){
    const movable=B.packMovable(s,id),q=Math.min(qty,movable);
    if(q<1){RF.animateDenied?.(`[data-v1042-bank-tile="${id}"]`);return;}
    RF.takeItem(s,id,q);
    s.bank=s.bank||{};
    s.bank[id]=(s.bank[id]||0)+q;
    s.stats=s.stats||{};s.stats.bankTransfers=(s.stats.bankTransfers||0)+q;
    RF.log?.(s,`Deposited ${q} × ${RF.DATA.items?.[id]?.name||id}.`);
  }else{
    const movable=B.bankMovable(s,id),q=Math.min(qty,movable);
    if(q<1){RF.animateDenied?.(`[data-v1042-bank-tile="${id}"]`);return;}
    s.inventory=s.inventory||{};
    if(!(s.inventory[id]>0)&&RF.packUsed(s)>=B.cap(s)){RF.animateDenied?.(`[data-v1042-bank-tile="${id}"]`);return;}
    s.bank[id]-=q;if(s.bank[id]<=0)delete s.bank[id];
    s.inventory[id]=(s.inventory[id]||0)+q;
    s.stats=s.stats||{};s.stats.bankTransfers=(s.stats.bankTransfers||0)+q;
    RF.log?.(s,`Withdrew ${q} × ${RF.DATA.items?.[id]?.name||id}.`);
  }
  const remaining=B.moveCount(s,side,id);
  const autoKeep=qty<beforeMove;
  const keep=(typeof keepOpen==='boolean')?keepOpen:autoKeep;
  if(RF.UI.modal?.type==='bank'){
    if(keep&&remaining>0){RF.UI.modal.v1042Qty={side,id};}
    else delete RF.UI.modal.v1042Qty;
  }
  RF.save?.(s);RF.UI.render(s);
};

B.qtyPopup=function(s,m){
  const qd=m?.v1042Qty;if(!qd)return '';
  const side=qd.side==='bank'?'bank':'pack',id=qd.id,it=RF.DATA.items?.[id];
  if(!it)return '';
  const max=B.moveCount(s,side,id),act=B.actionWord(side);
  const quick=[1,2,5,10];
  return `<div class="v1042QtyBack" data-v1042-qty-back>
    <div class="v1042QtyModal v1044QtyModal" role="dialog" aria-modal="true" aria-label="${B.escape(act)} ${B.escape(it.name)}">
      <div class="v1042QtyHero"><div class="v1042QtyIcon">${it.icon||'📦'}</div><div><span class="eyebrow">${B.escape(side==='bank'?'WITHDRAW FROM BANK':'DEPOSIT TO BANK')}</span><h3>${B.escape(it.name)} <span class="v1044QtyNameCount">×${max}</span></h3><div class="sub">Tap a quantity to ${act.toLowerCase()}.</div></div></div>
      <div class="v1042QtyQuick v1044QtyQuick">${quick.map(n=>`<button type="button" data-v1042-qty-quick="${n}" ${n>max?'disabled':''}>${n}</button>`).join('')}<button type="button" data-v1042-qty-all ${max<1?'disabled':''}>All</button><button type="button" class="v1044QtyCloseQuick" data-v1042-qty-close>Close</button></div>
      <label class="v1042QtyCustom">Custom amount<input data-v1042-qty-input type="number" inputmode="numeric" min="1" max="${max}" value="${Math.min(max,1)}"></label>
      <div class="v1042QtyFoot"><button type="button" class="v1042QtyMove" data-v1042-qty-move ${max<1?'disabled':''}>${B.escape(act)} X</button><button type="button" class="v1042QtyCancel" data-v1042-qty-cancel>Cancel</button></div>
      <div class="tiny center">Available to move: ${max}</div>
    </div>
  </div>`;
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelector('[data-v1042-qty-close]')?.addEventListener('click',()=>B.closeQty());
};

const oldStyle=document.getElementById('v1044-vault-flow-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1044-vault-flow-style';
st.textContent=`
.v1044QtyModal .v1042QtyHero h3{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.v1044QtyNameCount{font-size:.7em;color:#e9cb84;font-weight:800}
.v1044QtyQuick{grid-template-columns:repeat(3,minmax(0,1fr))}
.v1044QtyCloseQuick{border-color:rgba(182,84,72,.58)!important;background:linear-gradient(180deg,rgba(110,45,39,.96),rgba(71,24,20,.98))!important;color:#f5ddd8!important}
.v1044QtyCloseQuick:active{filter:brightness(1.08)}
`;
 document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
