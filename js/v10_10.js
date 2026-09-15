/* Realmforge V10.10 — Greenvale Vault
   - Fix V10.9 bank renderer hook (modalHtml, not modalHTML)
   - Bank only accessible in Greenvale
   - Bank entry moved to World > Actions
   - Pack tab contains pack only; nav label simplified to Pack
   - Split Pack/Bank bank modal with independent preserved scrolling
*/
(()=>{
'use strict';
const RF=window.RF;if(!RF)return;
RF.V1010=RF.V1010||{};
RF.V1010.scroll=RF.V1010.scroll||{pack:0,bank:0};

// ---------- Bank geography ----------
// Greenvale village is the sole public bank in V10.10.
RF.isBankTown=s=>!!s&&s.location==='greenvale';

// ---------- Navigation wording ----------
if(RF.V95?.navItems){
  RF.V95.navItems=RF.V95.navItems.map(x=>x[0]==='inventory'?['inventory','🎒','Pack']:x);
}

// ---------- Pack page: no bank access here ----------
const priorInventory=RF.UI.inventory.bind(RF.UI);
RF.UI.inventory=function(s){
  let h=priorInventory(s);
  // Strip any inherited bank-open button or bank-access hint from older versions.
  h=h.replace(/<button class="action bankOpen" data-open-bank>[\s\S]*?<\/button>/g,'');
  h=h.replace(/<div class="tiny bankHint">[\s\S]*?<\/div>/g,'');
  return h;
};

// ---------- World: Greenvale Bank is a location action ----------
const priorWorld=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){
  let h=priorWorld(s);
  if(s.location!=='greenvale')return h;
  const disabled=(s.activity||s.combat)?'disabled':'';
  const btn=`<button class="action bankOpen" data-open-bank ${disabled}><span class="emoji">🏦</span><b>Greenvale Bank</b><small>Deposit or withdraw stored items</small></button>`;
  // Inject into the first Actions grid only.
  const marker='<section class="card"><h3>Actions</h3><div class="grid2">';
  if(h.includes(marker))h=h.replace(marker,marker+btn);
  return h;
};

// ---------- Split vault styling ----------
function injectStyle(){
 if(document.getElementById('v1010-bank-style'))return;
 const st=document.createElement('style');st.id='v1010-bank-style';st.textContent=`
 .bankModal.v1010Bank{height:min(90dvh,900px);max-height:90dvh;display:grid;grid-template-rows:auto auto minmax(0,1fr) minmax(0,1fr) auto;gap:8px;overflow:hidden;padding:14px 10px 10px}
 .v1010BankHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.v1010BankHead h2{margin:0}.v1010BankHead .sub{margin-top:3px}
 .v1010BankPane{min-height:0;display:flex;flex-direction:column;border:1px solid rgba(198,158,83,.30);border-radius:14px;background:rgba(9,8,7,.34);overflow:hidden}
 .v1010BankPaneHead{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid rgba(198,158,83,.18);background:rgba(198,158,83,.07)}
 .v1010BankPaneHead h3{margin:0;font-size:15px}.v1010BankPaneHead span{font-size:12px;color:var(--muted,#b7aa92)}
 .v1010BankScroll{min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-bottom:6px;scrollbar-width:thin}
 .v1010Bank .bankRow{display:grid;grid-template-columns:38px minmax(0,1fr) 48px 52px;align-items:center;gap:6px;padding:9px 7px;border-bottom:1px solid rgba(255,255,255,.055)}
 .v1010Bank .bankRow:last-child{border-bottom:0}.v1010Bank .bankIcon{font-size:25px;text-align:center}
 .v1010Bank .bankRow .meta{min-width:0}.v1010Bank .bankRow .meta b{display:block;line-height:1.15;overflow-wrap:anywhere}.v1010Bank .bankRow .meta small{display:block;margin-top:3px;color:var(--muted,#b7aa92);line-height:1.2}
 .v1010Bank button.vaultBtn{appearance:none;border:1px solid rgba(216,173,87,.48)!important;background:linear-gradient(180deg,rgba(101,71,31,.98),rgba(59,41,21,.98))!important;color:#f6e7c1!important;border-radius:9px!important;min-width:0!important;width:100%;height:38px;padding:0 5px!important;font:inherit;font-size:13px!important;font-weight:800!important;box-shadow:inset 0 1px rgba(255,255,255,.08)!important;touch-action:manipulation}
 .v1010Bank button.vaultBtn.all{background:linear-gradient(180deg,rgba(78,62,39,.98),rgba(47,38,27,.98))!important}
 .v1010Bank button.vaultBtn:active:not(:disabled){transform:translateY(1px);filter:brightness(1.12)}
 .v1010Bank button.vaultBtn:disabled{background:rgba(52,47,41,.66)!important;color:rgba(235,222,194,.28)!important;border-color:rgba(190,166,119,.13)!important;box-shadow:none!important;opacity:1!important;filter:none!important}
 .v1010BankEmpty{padding:14px 10px;color:var(--muted,#b7aa92);font-size:13px}.v1010BankFoot{display:flex}.v1010BankFoot .quietClose{width:100%;margin:0}
 `;document.head.appendChild(st);
}
injectStyle();

RF.V1010.capture=function(){
 const p=document.querySelector('[data-v1010-scroll="pack"]'),b=document.querySelector('[data-v1010-scroll="bank"]');
 if(p)RF.V1010.scroll.pack=p.scrollTop;if(b)RF.V1010.scroll.bank=b.scrollTop;
};
RF.V1010.restore=function(){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const p=document.querySelector('[data-v1010-scroll="pack"]'),b=document.querySelector('[data-v1010-scroll="bank"]');
   if(p)p.scrollTop=RF.V1010.scroll.pack||0;if(b)b.scrollTop=RF.V1010.scroll.bank||0;
 }));
};

// ---------- Correct bank modal renderer ----------
const priorModal=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
 const m=this.modal;
 if(m?.type!=='bank')return priorModal(s);
 if(!RF.isBankTown(s)){
   return `<div class="modalBack"><div class="modal"><div style="font-size:42px">🏦</div><h2>Bank Unavailable</h2><div class="sub">Your vault can only be accessed from Greenvale Bank.</div><div class="choices"><button class="choice" data-close-bank><b>Close</b></button></div></div></div>`;
 }
 const cat=s.v93?.bankCategory||'all';
 const cap=(RF.packCapacity?RF.packCapacity(s):RF.V82?.PACK_CAP)||28;
 const used=RF.packUsed?RF.packUsed(s):Object.values(s.inventory||{}).filter(q=>q>0).length;
 const pack=Object.entries(s.inventory||{}).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{
   const it=RF.DATA.items[id];if(!it)return'';const eq=RF.isEquipped(s,id),mov=Math.max(0,q-(eq?1:0)),req=RF.v93Req?.(s,id)||'';
   return `<div class="bankRow"><span class="bankIcon">${it.icon}</span><div class="meta"><b>${it.name}</b><small>Pack ×${q}${eq?' • EQUIPPED':''}${req?` • ${req}`:''}</small></div><button type="button" class="vaultBtn" data-bank-deposit="${id}" ${mov<1?'disabled':''}>+1</button><button type="button" class="vaultBtn all" data-bank-deposit-all="${id}" ${mov<1?'disabled':''}>All</button></div>`;
 }).join('');
 const bank=Object.entries(s.bank||{}).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{
   const it=RF.DATA.items[id];if(!it)return'';const req=RF.v93Req?.(s,id)||'';const full=!(s.inventory[id]>0)&&used>=cap;
   return `<div class="bankRow"><span class="bankIcon">${it.icon}</span><div class="meta"><b>${it.name}</b><small>Bank ×${q}${req?` • ${req}`:''}</small></div><button type="button" class="vaultBtn" data-bank-withdraw="${id}" ${full?'disabled':''}>−1</button><button type="button" class="vaultBtn all" data-bank-withdraw-all="${id}" ${full?'disabled':''}>All</button></div>`;
 }).join('');
 const bankCount=Object.values(s.bank||{}).filter(q=>q>0).length;
 return `<div class="modalBack"><div class="modal bankModal v1010Bank"><div class="v1010BankHead"><div><span class="eyebrow">GREENVALE BANK</span><h2>🏦 Vault</h2><div class="sub">Pack above • Bank below</div></div></div>${RF.v93Select('bank',cat)}<section class="v1010BankPane"><div class="v1010BankPaneHead"><h3>🎒 Pack</h3><span>${used}/${cap} slots</span></div><div class="v1010BankScroll" data-v1010-scroll="pack">${pack||'<div class="v1010BankEmpty">Nothing carried in this category.</div>'}</div></section><section class="v1010BankPane"><div class="v1010BankPaneHead"><h3>🏦 Bank</h3><span>${bankCount} stored stacks</span></div><div class="v1010BankScroll" data-v1010-scroll="bank">${bank||'<div class="v1010BankEmpty">Nothing stored in this category.</div>'}</div></section><div class="v1010BankFoot"><button class="quietClose" data-close-bank>Close Bank</button></div></div></div>`;
};

// ---------- Preserve scroll around transfers ----------
const depBase=RF.bankDeposit,withBase=RF.bankWithdraw;
RF.bankDeposit=function(id,all=false){
 if(!RF.isBankTown(RF.state))return;
 RF.V1010.capture();const r=depBase?.call(this,id,all);RF.V1010.restore();return r;
};
RF.bankWithdraw=function(id,all=false){
 if(!RF.isBankTown(RF.state))return;
 RF.V1010.capture();const r=withBase?.call(this,id,all);RF.V1010.restore();return r;
};

// ---------- Binding + close ----------
const priorBind=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(){
 priorBind();
 // v8.2 already binds data-open-bank and bank transfer buttons through the common render path.
 document.querySelectorAll('[data-open-bank]').forEach(b=>{
   b.onclick=()=>{if(RF.state.location==='greenvale')RF.openBank();};
 });
 const close=document.querySelector('[data-close-bank]');if(close)close.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)};
 const sel=document.querySelector('[data-v93-category="bank"]');
 if(sel&&!sel.dataset.v1010Bound){sel.dataset.v1010Bound='1';sel.addEventListener('change',()=>{RF.V1010.scroll.pack=0;RF.V1010.scroll.bank=0;});}
 if(RF.UI.modal?.type==='bank')RF.V1010.restore();
};

if(RF.state){RF.state.version='10.10.0';RF.save?.(RF.state);RF.UI.render(RF.state);}
})();
