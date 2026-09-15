/* Realmforge V10.9 — Split Vault
   - Bank modal split vertically: Pack top / Bank bottom
   - Independent scroll panes, preserved across transfers/rerenders
   - Cleaner transfer buttons + disabled styling
*/
(()=>{
'use strict';
const RF=window.RF;if(!RF)return;
RF.V109=RF.V109||{};
RF.V109.scroll={pack:0,bank:0};

function injectStyle(){
 if(document.getElementById('v109-bank-style'))return;
 const st=document.createElement('style');st.id='v109-bank-style';st.textContent=`
 .bankModal.v109Bank{height:min(88dvh,860px);max-height:88dvh;display:grid;grid-template-rows:auto auto minmax(0,1fr) minmax(0,1fr) auto;gap:10px;overflow:hidden;padding:18px 14px 14px}
 .v109BankHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
 .v109BankHead h2{margin:0}.v109BankHead .sub{margin-top:3px}
 .v109BankPane{min-height:0;display:flex;flex-direction:column;border:1px solid rgba(198,158,83,.28);border-radius:14px;background:rgba(9,8,7,.28);overflow:hidden}
 .v109BankPaneHead{display:flex;align-items:center;justify-content:space-between;padding:9px 11px;border-bottom:1px solid rgba(198,158,83,.18);background:rgba(198,158,83,.06)}
 .v109BankPaneHead h3{margin:0;font-size:15px;letter-spacing:.03em}.v109BankPaneHead span{font-size:12px;color:var(--muted,#b7aa92)}
 .v109BankScroll{min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:2px 0 8px;scrollbar-width:thin}
 .v109Bank .bankRow{display:grid;grid-template-columns:42px minmax(0,1fr) auto auto;align-items:center;gap:8px;padding:10px 10px;border-bottom:1px solid rgba(255,255,255,.055)}
 .v109Bank .bankRow:last-child{border-bottom:0}.v109Bank .bankIcon{font-size:26px;text-align:center}
 .v109Bank .bankRow .meta{min-width:0}.v109Bank .bankRow .meta b{display:block;line-height:1.15}.v109Bank .bankRow .meta small{display:block;margin-top:3px;color:var(--muted,#b7aa92);line-height:1.22}
 .v109Bank button.vaultBtn{appearance:none;border:1px solid rgba(216,173,87,.48);background:linear-gradient(180deg,rgba(100,71,31,.95),rgba(61,42,21,.95));color:#f6e7c1;border-radius:10px;min-width:48px;height:38px;padding:0 10px;font:inherit;font-weight:750;box-shadow:inset 0 1px rgba(255,255,255,.08);touch-action:manipulation}
 .v109Bank button.vaultBtn:active:not(:disabled){transform:translateY(1px);filter:brightness(1.12)}
 .v109Bank button.vaultBtn.all{min-width:54px;background:linear-gradient(180deg,rgba(77,62,39,.96),rgba(48,39,27,.96))}
 .v109Bank button.vaultBtn:disabled{background:rgba(54,49,42,.58)!important;color:rgba(235,222,194,.30)!important;border-color:rgba(190,166,119,.14)!important;box-shadow:none!important;opacity:1!important;filter:none!important}
 .v109BankEmpty{padding:16px 12px;color:var(--muted,#b7aa92);font-size:13px}
 .v109BankFoot{display:flex;gap:8px}.v109BankFoot .quietClose{width:100%;margin:0}
 @media(max-width:430px){.bankModal.v109Bank{height:90dvh;max-height:90dvh;padding:14px 10px 10px;gap:8px}.v109Bank .bankRow{grid-template-columns:36px minmax(0,1fr) 46px 50px;gap:5px;padding:9px 7px}.v109Bank button.vaultBtn{min-width:0;width:100%;padding:0 5px;font-size:13px}}
 `;document.head.appendChild(st);
}
injectStyle();

RF.V109.captureBankScroll=function(){
 const p=document.querySelector('[data-bank-scroll="pack"]'),b=document.querySelector('[data-bank-scroll="bank"]');
 if(p)RF.V109.scroll.pack=p.scrollTop;if(b)RF.V109.scroll.bank=b.scrollTop;
};
RF.V109.restoreBankScroll=function(){
 requestAnimationFrame(()=>{const p=document.querySelector('[data-bank-scroll="pack"]'),b=document.querySelector('[data-bank-scroll="bank"]');if(p)p.scrollTop=RF.V109.scroll.pack||0;if(b)b.scrollTop=RF.V109.scroll.bank||0;});
};

// Patch modal HTML after all prior bank renderers.
const priorModal=RF.UI.modalHTML.bind(RF.UI);
RF.UI.modalHTML=function(s){
 const m=RF.UI.modal;if(m?.type!=='bank')return priorModal(s);
 const cat=s.v93?.bankCategory||'all';
 const cap=(RF.packCapacity?RF.packCapacity(s):RF.V82?.PACK_CAP)||28;
 const used=RF.packUsed?RF.packUsed(s):Object.values(s.inventory||{}).filter(q=>q>0).length;
 const pack=Object.entries(s.inventory||{}).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{
   const it=RF.DATA.items[id];if(!it)return'';const eq=RF.isEquipped(s,id),mov=Math.max(0,q-(eq?1:0)),req=RF.v93Req?.(s,id)||'';
   return `<div class="bankRow"><span class="bankIcon">${it.icon}</span><div class="meta"><b>${it.name}</b><small>Pack ×${q}${eq?' • EQUIPPED':''}${req?` • ${req}`:''}</small></div><button class="vaultBtn" data-bank-deposit="${id}" ${mov<1?'disabled':''}>+1</button><button class="vaultBtn all" data-bank-deposit-all="${id}" ${mov<1?'disabled':''}>All</button></div>`;
 }).join('');
 const bank=Object.entries(s.bank||{}).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{
   const it=RF.DATA.items[id];if(!it)return'';const req=RF.v93Req?.(s,id)||'';const full=!(s.inventory[id]>0)&&used>=cap;
   return `<div class="bankRow"><span class="bankIcon">${it.icon}</span><div class="meta"><b>${it.name}</b><small>Bank ×${q}${req?` • ${req}`:''}</small></div><button class="vaultBtn" data-bank-withdraw="${id}" ${full?'disabled':''}>−1</button><button class="vaultBtn all" data-bank-withdraw-all="${id}" ${full?'disabled':''}>All</button></div>`;
 }).join('');
 const bankCount=Object.values(s.bank||{}).filter(q=>q>0).length;
 return `<div class="modalBack"><div class="modal bankModal v109Bank"><div class="v109BankHead"><div><span class="eyebrow">TOWN BANK</span><h2>🏦 Vault & Pack</h2><div class="sub">Move supplies without leaving the vault screen.</div></div></div>${RF.v93Select('bank',cat)}<section class="v109BankPane"><div class="v109BankPaneHead"><h3>🎒 Pack</h3><span>${used}/${cap} slots</span></div><div class="v109BankScroll" data-bank-scroll="pack">${pack||'<div class="v109BankEmpty">Nothing carried in this category.</div>'}</div></section><section class="v109BankPane"><div class="v109BankPaneHead"><h3>🏦 Bank</h3><span>${bankCount} stored stacks</span></div><div class="v109BankScroll" data-bank-scroll="bank">${bank||'<div class="v109BankEmpty">Nothing stored in this category.</div>'}</div></section><div class="v109BankFoot"><button class="quietClose" data-close-bank>Close Bank</button></div></div></div>`;
};

// Preserve pane positions around transfers. Existing functions still own game-state rules.
const dep=RF.bankDeposit,wd=RF.bankWithdraw;
if(dep)RF.bankDeposit=function(id,all=false){RF.V109.captureBankScroll();const r=dep.call(this,id,all);RF.V109.restoreBankScroll();return r;};
if(wd)RF.bankWithdraw=function(id,all=false){RF.V109.captureBankScroll();const r=wd.call(this,id,all);RF.V109.restoreBankScroll();return r;};

// Bank category change should reset both panes intentionally, but ordinary rerenders should not.
const priorBind=RF.UI.bind?.bind(RF.UI);
if(priorBind)RF.UI.bind=function(){priorBind();const sel=document.querySelector('[data-v93-category="bank"]');if(sel&&!sel.dataset.v109Bound){sel.dataset.v109Bound='1';sel.addEventListener('change',()=>{RF.V109.scroll.pack=0;RF.V109.scroll.bank=0;});}if(RF.UI.modal?.type==='bank')RF.V109.restoreBankScroll();};

if(RF.state){RF.state.version='10.9.0';RF.save?.(RF.state);RF.UI.render(RF.state);}
})();
