window.RF=window.RF||{};
RF.VERSION='10.42.0';
RF.BUILD={
  version:'10.42.0',
  title:'Vault Grid',
  built:'16 Sep 2026 • 22:15 BST',
  buildId:'20260916-2215-bst'
};
RF.V1042=RF.V1042||{};

/* Realmforge V10.42 — Vault Grid
   - Rebuilds Bank into a sleek Pack/Bank tab interface using a 3-column item grid.
   - Tapping a stack now moves it instantly when only 1 can move, or opens a quantity popup for larger stacks.
   - Press and hold any bank tile to inspect item details without leaving the Vault.
   - Aligns the Bank with the newer Skills and navigation-grid design direction.
*/

(()=>{
'use strict';
const V=RF.V1042;
V.HOLD_MS=650;
V.MOVE_CANCEL_PX=14;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.42.0';
  s.v1042=s.v1042||{};
  if(!s.v1042.bankTab)s.v1042.bankTab='pack';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.42.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(oldMig(s));
}

V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.cap=s=>RF.packCapacity?RF.packCapacity(s):(RF.V82?.PACK_CAP||28);
V.tab=s=>s?.v1042?.bankTab||'pack';
V.setTab=function(s,tab){
  s.v1042=s.v1042||{};
  s.v1042.bankTab=tab==='bank'?'bank':'pack';
  if(RF.UI.modal?.type==='bank')delete RF.UI.modal.v1042Qty;
  RF.save?.(s);RF.UI.render(s);
};
V.sortedEntries=function(obj){
  if(RF.V1012?.sortedEntries)return RF.V1012.sortedEntries(obj||{});
  return Object.entries(obj||{}).sort((a,b)=>{
    const an=RF.DATA.items?.[a[0]]?.name||a[0],bn=RF.DATA.items?.[b[0]]?.name||b[0];
    return an.localeCompare(bn);
  });
};
V.packMovable=function(s,id){
  const held=Math.max(0,Number(s?.inventory?.[id])||0);
  const protectedQty=RF.isEquipped?.(s,id)?1:0;
  return Math.max(0,held-protectedQty);
};
V.bankMovable=function(s,id){
  const held=Math.max(0,Number(s?.bank?.[id])||0);
  if(!held)return 0;
  if(!(s?.inventory?.[id]>0)&&RF.packUsed(s)>=V.cap(s))return 0;
  return held;
};
V.moveCount=function(s,side,id){return side==='bank'?V.bankMovable(s,id):V.packMovable(s,id)};
V.bankStacks=s=>Object.values(s?.bank||{}).filter(q=>(+q||0)>0).length;
V.entries=function(s,side,cat){
  const source=side==='bank'?(s.bank||{}):(s.inventory||{});
  return V.sortedEntries(source)
    .filter(([,q])=>(+q||0)>0)
    .filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat)
    .map(([id,q])=>({id,qty:+q||0,it:RF.DATA.items[id]}))
    .filter(x=>x.it);
};
V.actionWord=side=>side==='bank'?'Withdraw':'Deposit';
V.sideLabel=side=>side==='bank'?'Bank':'Pack';
V.stateLine=function(s,side,id,qty){
  const req=RF.v93Req?.(s,id)||'';
  const equipped=side==='pack'&&RF.isEquipped?.(s,id);
  const bits=[`${side==='bank'?'Bank':'Pack'} ×${qty}`];
  if(equipped)bits.push('Equipped');
  if(req)bits.push(req);
  return bits.join(' • ');
};
V.tileHtml=function(s,side,row){
  const {id,qty,it}=row;
  const movable=V.moveCount(s,side,id);
  const eq=side==='pack'&&RF.isEquipped?.(s,id);
  const cls=['v1042BankTile'];
  if(movable<1)cls.push('disabled');
  if(eq)cls.push('equipped');
  return `<button type="button" class="${cls.join(' ')}" data-v1042-bank-tile="${V.escape(id)}" data-v1042-bank-side="${side}" data-v1042-bank-info="${V.escape(id)}" aria-label="${V.escape(it.name)}">
    <div class="v1042TileIcon">${it.icon||'📦'}</div>
    <div class="v1042TileName">${V.escape(it.name)}</div>
    <div class="v1042TileMeta">${side==='bank'?'Bank':'Pack'} ×${qty}</div>
    <div class="v1042TileFoot">
      <span class="v1042TileQty">×${qty}</span>
      ${eq?'<span class="v1042TileBadge">EQ</span>':movable<1?'<span class="v1042TileBadge muted">LOCK</span>':'<span class="v1042TileBadge">MOVE</span>'}
    </div>
  </button>`;
};
V.itemInfo=function(s,id){
  const it=RF.DATA.items?.[id];
  if(!it)return null;
  const req=RF.itemRequirement?.(it);
  const rows=[];
  rows.push(['Type',it.rarity||it.type||'Item']);
  rows.push(['In Pack',String(Math.max(0,Number(s?.inventory?.[id])||0))]);
  rows.push(['In Bank',String(Math.max(0,Number(s?.bank?.[id])||0))]);
  if(it.value!=null)rows.push(['Value',`${it.value}g`]);
  if(req)rows.push(['Requirement',`${RF.DATA.skills?.[req.skill]?.name||req.skill} Lv ${req.level} • You: ${s?.skills?.[req.skill]?.level||1}`]);
  if(it.damage)rows.push(['Damage',String(it.damage)]);
  if(it.armor)rows.push(['Armour',String(it.armor)]);
  if(it.heal)rows.push(['Healing',`${it.heal} HP`]);
  if(it.stamina)rows.push(['Stamina',`${it.stamina} STA`]);
  if(it.slot)rows.push(['Equipment slot',String(it.slot)]);
  return {icon:it.icon||'📦',name:it.name||id,desc:it.desc||'No description recorded.',rows};
};
V.closeInfo=function(){document.querySelector('.v1042BankInfoBack')?.remove()};
V.showInfo=function(id){
  const s=RF.state,info=V.itemInfo(s,id); if(!info)return;
  V.closeInfo();
  const back=document.createElement('div');
  back.className='v1042BankInfoBack';
  back.innerHTML=`<div class="v1042BankInfoModal" role="dialog" aria-modal="true" aria-label="${V.escape(info.name)} details">
    <div class="v1042BankInfoHero"><div class="v1042BankInfoIcon">${info.icon}</div><div><span class="eyebrow">ITEM DETAILS</span><h2>${V.escape(info.name)}</h2></div></div>
    <p class="v1042BankInfoDesc">${V.escape(info.desc)}</p>
    <div class="v1042BankInfoRows">${info.rows.map(([k,v])=>`<div><span>${V.escape(k)}</span><b>${V.escape(v)}</b></div>`).join('')}</div>
    <button class="v1042BankInfoClose">Close</button>
  </div>`;
  document.body.appendChild(back);
  back.addEventListener('click',e=>{if(e.target===back||e.target.closest('.v1042BankInfoClose'))V.closeInfo()});
  navigator.vibrate?.(18);
};
V.openQty=function(side,id){
  if(RF.UI.modal?.type!=='bank')return;
  RF.UI.modal.v1042Qty={side,id};
  RF.UI.render(RF.state);
};
V.closeQty=function(){
  if(RF.UI.modal?.type==='bank'&&RF.UI.modal.v1042Qty){delete RF.UI.modal.v1042Qty;RF.UI.render(RF.state)}
};
V.transfer=function(side,id,qty){
  const s=RF.state;if(!s||!RF.isBankTown?.(s))return;
  qty=Math.max(1,Math.floor(Number(qty)||1));
  if(side==='pack'){
    const movable=V.packMovable(s,id),q=Math.min(qty,movable);
    if(q<1){RF.animateDenied?.(`[data-v1042-bank-tile="${id}"]`);return;}
    RF.takeItem(s,id,q);
    s.bank=s.bank||{};
    s.bank[id]=(s.bank[id]||0)+q;
    s.stats=s.stats||{};s.stats.bankTransfers=(s.stats.bankTransfers||0)+q;
    RF.log?.(s,`Deposited ${q} × ${RF.DATA.items?.[id]?.name||id}.`);
  }else{
    const movable=V.bankMovable(s,id),q=Math.min(qty,movable);
    if(q<1){RF.animateDenied?.(`[data-v1042-bank-tile="${id}"]`);return;}
    s.inventory=s.inventory||{};
    if(!(s.inventory[id]>0)&&RF.packUsed(s)>=V.cap(s)){RF.animateDenied?.(`[data-v1042-bank-tile="${id}"]`);return;}
    s.bank[id]-=q;if(s.bank[id]<=0)delete s.bank[id];
    s.inventory[id]=(s.inventory[id]||0)+q;
    s.stats=s.stats||{};s.stats.bankTransfers=(s.stats.bankTransfers||0)+q;
    RF.log?.(s,`Withdrew ${q} × ${RF.DATA.items?.[id]?.name||id}.`);
  }
  if(RF.UI.modal?.type==='bank')delete RF.UI.modal.v1042Qty;
  RF.save?.(s);RF.UI.render(s);
};
V.tileTap=function(side,id){
  const s=RF.state,count=V.moveCount(s,side,id);
  if(count<1){RF.animateDenied?.(`[data-v1042-bank-tile="${id}"]`);return;}
  if(count===1)V.transfer(side,id,1);
  else V.openQty(side,id);
};
V.qtyPopup=function(s,m){
  const qd=m?.v1042Qty;if(!qd)return '';
  const side=qd.side==='bank'?'bank':'pack',id=qd.id,it=RF.DATA.items?.[id];
  if(!it)return '';
  const max=V.moveCount(s,side,id),act=V.actionWord(side);
  const quick=[1,2,5,10];
  return `<div class="v1042QtyBack" data-v1042-qty-back>
    <div class="v1042QtyModal" role="dialog" aria-modal="true" aria-label="${V.escape(act)} ${V.escape(it.name)}">
      <div class="v1042QtyHero"><div class="v1042QtyIcon">${it.icon||'📦'}</div><div><span class="eyebrow">${V.escape(side==='bank'?'WITHDRAW FROM BANK':'DEPOSIT TO BANK')}</span><h3>${V.escape(it.name)}</h3><div class="sub">Choose how many to ${act.toLowerCase()}.</div></div></div>
      <div class="v1042QtyQuick">${quick.map(n=>`<button type="button" data-v1042-qty-quick="${n}" ${n>max?'disabled':''}>${n}</button>`).join('')}<button type="button" data-v1042-qty-all ${max<1?'disabled':''}>All</button></div>
      <label class="v1042QtyCustom">Custom amount<input data-v1042-qty-input type="number" inputmode="numeric" min="1" max="${max}" value="${Math.min(max,1)}"></label>
      <div class="v1042QtyFoot"><button type="button" class="v1042QtyMove" data-v1042-qty-move ${max<1?'disabled':''}>${V.escape(act)} X</button><button type="button" class="v1042QtyCancel" data-v1042-qty-cancel>Cancel</button></div>
      <div class="tiny center">Available to move: ${max}</div>
    </div>
  </div>`;
};
V.bindTile=function(btn){
  if(!btn||btn.dataset.v1042Bound==='1')return;
  btn.dataset.v1042Bound='1';
  let timer=0,startX=0,startY=0,longFired=false,activePointer=null;
  const cancel=()=>{if(timer){clearTimeout(timer);timer=0}btn.classList.remove('holding');activePointer=null};
  btn.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    cancel();longFired=false;activePointer=e.pointerId;startX=e.clientX;startY=e.clientY;
    btn.classList.add('holding');
    timer=setTimeout(()=>{timer=0;longFired=true;btn.classList.remove('holding');V.showInfo(btn.dataset.v1042BankInfo)},V.HOLD_MS);
  });
  btn.addEventListener('pointermove',e=>{if(activePointer!==e.pointerId)return;if(Math.hypot(e.clientX-startX,e.clientY-startY)>V.MOVE_CANCEL_PX)cancel();});
  btn.addEventListener('pointerup',cancel);btn.addEventListener('pointercancel',cancel);btn.addEventListener('lostpointercapture',cancel);btn.addEventListener('contextmenu',e=>e.preventDefault());
  btn.addEventListener('click',e=>{
    if(longFired){longFired=false;e.preventDefault();e.stopImmediatePropagation();return;}
    e.preventDefault();e.stopImmediatePropagation();
    V.tileTap(btn.dataset.v1042BankSide,btn.dataset.v1042BankTile);
  },true);
};

const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type!=='bank')return modalBase(s);
  if(!RF.isBankTown(s))return `<div class="modalBack"><div class="modal"><div style="font-size:42px">🏦</div><h2>Bank Unavailable</h2><div class="sub">Your vault can only be accessed from town banks.</div><div class="choices"><button class="choice" data-close-bank><b>Close</b></button></div></div></div>`;
  const tab=V.tab(s),cat=s.v93?.bankCategory||'all',cap=V.cap(s),used=RF.packUsed(s),bankStacks=V.bankStacks(s),rows=V.entries(s,tab,cat),loc=RF.DATA.locations?.[s.location],label=tab==='bank'?'stored stacks':'slots';
  const grid=rows.map(r=>V.tileHtml(s,tab,r)).join('');
  return `<div class="modalBack"><div class="modal bankModal v1042VaultModal">
    <div class="v1042VaultHead"><div><span class="eyebrow">${V.escape((loc?.name||'Town').toUpperCase())} BANK</span><h2>${loc?.icon||'🏦'} Vault</h2><div class="sub">Tap to move • hold for details</div></div><button class="v1042VaultClose" type="button" data-close-bank aria-label="Close Bank">✕</button></div>
    <div class="v1042VaultTabs">
      <button type="button" class="v1042VaultTab ${tab==='pack'?'active':''}" data-v1042-bank-tab="pack"><span>🎒 Pack</span><b>${used}/${cap}</b></button>
      <button type="button" class="v1042VaultTab ${tab==='bank'?'active':''}" data-v1042-bank-tab="bank"><span>🏦 Bank</span><b>${bankStacks} stacks</b></button>
    </div>
    <div class="v1042VaultTools">${RF.v93Select('bank',cat)}<div class="v1042VaultCount">${tab==='pack'?`${used}/${cap}`:`${bankStacks}`} ${label}</div></div>
    <div class="v1042VaultGridWrap">
      <div class="v1042VaultGrid">${grid||`<div class="v1042VaultEmpty">Nothing in this category.</div>`}</div>
    </div>
    <div class="v1042VaultFoot"><button class="quietClose" data-close-bank>Close Bank</button></div>
    ${V.qtyPopup(s,m)}
  </div></div>`;
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelectorAll('[data-v1042-bank-tab]').forEach(b=>b.onclick=()=>V.setTab(s,b.dataset.v1042BankTab));
  document.querySelectorAll('.v1042BankTile[data-v1042-bank-info]').forEach(V.bindTile);
  document.querySelector('[data-v1042-qty-cancel]')?.addEventListener('click',()=>V.closeQty());
  document.querySelector('[data-v1042-qty-back]')?.addEventListener('click',e=>{if(e.target===e.currentTarget)V.closeQty()});
  document.querySelectorAll('[data-v1042-qty-quick]').forEach(b=>b.onclick=()=>{const q=+b.dataset.v1042QtyQuick||1,m=RF.UI.modal?.v1042Qty;if(m)V.transfer(m.side,m.id,q)});
  document.querySelector('[data-v1042-qty-all]')?.addEventListener('click',()=>{const m=RF.UI.modal?.v1042Qty;if(m)V.transfer(m.side,m.id,V.moveCount(RF.state,m.side,m.id))});
  document.querySelector('[data-v1042-qty-move]')?.addEventListener('click',()=>{
    const m=RF.UI.modal?.v1042Qty;if(!m)return;
    const input=document.querySelector('[data-v1042-qty-input]');
    const max=V.moveCount(RF.state,m.side,m.id),q=Math.max(1,Math.min(max,Math.floor(+input?.value||1)));
    V.transfer(m.side,m.id,q);
  });
};

const renderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){
  if(this.modal?.type!=='bank')V.closeInfo();
  return renderBase(s);
};

const st=document.createElement('style');st.id='v1042-vault-grid-style';st.textContent=`
.v1042VaultModal{width:min(740px,100%);height:min(89dvh,860px);max-height:89dvh;display:grid;grid-template-rows:auto auto auto minmax(0,1fr) auto;gap:12px;overflow:hidden;padding:18px 14px 14px}
.v1042VaultHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.v1042VaultHead h2{margin:2px 0 0;color:#f1d496;font-size:25px}.v1042VaultHead .sub{margin-top:4px;color:#b7a78a}
.v1042VaultClose{width:42px;height:42px;border-radius:13px;border:1px solid rgba(214,173,96,.28);background:linear-gradient(180deg,rgba(52,38,22,.85),rgba(25,19,13,.95));color:#edd6a0;font-size:20px;display:grid;place-items:center;flex:0 0 auto}
.v1042VaultTabs{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v1042VaultTab{appearance:none;border:1px solid rgba(201,159,84,.24);border-radius:16px;background:linear-gradient(180deg,rgba(46,34,21,.76),rgba(20,15,10,.95));padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#e5d1a3;text-align:left;box-shadow:inset 0 1px rgba(255,255,255,.05)}.v1042VaultTab span{font-weight:800}.v1042VaultTab b{font-size:12px;color:#b8a991;font-weight:700}.v1042VaultTab.active{border-color:#c69d59;background:linear-gradient(180deg,rgba(96,67,29,.95),rgba(40,28,17,.98));box-shadow:0 0 0 1px rgba(198,157,89,.16) inset,0 10px 26px #0003}
.v1042VaultTools{display:flex;align-items:end;justify-content:space-between;gap:10px}.v1042VaultTools .filterSelect{flex:1 1 auto;margin:0}.v1042VaultTools .filterSelect span{text-transform:uppercase;letter-spacing:.14em}.v1042VaultCount{flex:0 0 auto;font-size:11px;color:#b4a489;padding-bottom:3px}
.v1042VaultGridWrap{min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border:1px solid rgba(198,158,83,.18);border-radius:18px;background:linear-gradient(180deg,rgba(13,10,8,.28),rgba(9,7,6,.42));padding:10px}
.v1042VaultGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-content:start}
.v1042BankTile{appearance:none;position:relative;min-height:132px;border-radius:18px;border:1px solid rgba(201,159,84,.18);background:linear-gradient(180deg,rgba(43,32,21,.92),rgba(18,13,10,.98));padding:12px 10px 10px;color:#f3e1bb;text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:7px;box-shadow:inset 0 1px rgba(255,255,255,.035);-webkit-touch-callout:none;user-select:none;touch-action:manipulation}
.v1042BankTile.holding{outline:1px solid #bc8b45;box-shadow:0 0 0 1px #bc8b4528 inset}.v1042BankTile.holding:after{content:'';position:absolute;left:0;bottom:0;height:3px;background:#d8ae63;animation:v1042HoldFill .65s linear forwards;width:0}.v1042BankTile.disabled{opacity:.52;filter:saturate(.65)}.v1042BankTile.equipped{border-color:rgba(106,151,110,.34)}
@keyframes v1042HoldFill{from{width:0}to{width:100%}}
.v1042TileIcon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;font-size:30px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.01));border:1px solid rgba(223,183,104,.14)}
.v1042TileName{font-weight:800;line-height:1.12;font-size:14px;min-height:31px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.v1042TileMeta{font-size:10px;line-height:1.25;color:#ad9c80;min-height:24px}.v1042TileFoot{margin-top:auto;width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px}.v1042TileQty{font-weight:800;font-size:14px;color:#f2d89b}.v1042TileBadge{font-size:9px;font-weight:800;letter-spacing:.08em;border:1px solid rgba(208,167,87,.28);padding:4px 6px;border-radius:999px;background:rgba(208,167,87,.08);color:#d9c18f}.v1042TileBadge.muted{background:rgba(255,255,255,.04);color:#b5a58b;border-color:rgba(255,255,255,.08)}
.v1042VaultEmpty{grid-column:1/-1;padding:30px 14px;text-align:center;color:#b9ab94;font-size:13px}
.v1042VaultFoot{display:flex}.v1042VaultFoot .quietClose{width:100%;margin:0}
.v1042QtyBack{position:absolute;inset:0;z-index:30;background:#080604cc;backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:14px}.v1042QtyModal{width:min(430px,100%);border:1px solid #775c38;border-radius:18px;background:linear-gradient(180deg,#21190f,#15110d);box-shadow:0 22px 60px #000b;padding:16px}.v1042QtyHero{display:flex;gap:12px;align-items:center}.v1042QtyIcon{width:54px;height:54px;border-radius:15px;display:grid;place-items:center;font-size:30px;background:#2a2117;border:1px solid #6b5438}.v1042QtyHero h3{margin:2px 0 0;color:#f0d99f;font-size:22px}.v1042QtyQuick{margin-top:13px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.v1042QtyQuick button,.v1042QtyMove,.v1042QtyCancel{min-height:44px;border-radius:12px;border:1px solid rgba(216,173,87,.42);background:linear-gradient(180deg,rgba(100,71,31,.92),rgba(61,42,21,.95));color:#f6e7c1;font:inherit;font-weight:750}.v1042QtyQuick button:disabled,.v1042QtyMove:disabled{opacity:.38}.v1042QtyCustom{display:grid;gap:6px;margin-top:12px;color:#c2b59d;font-size:12px}.v1042QtyCustom input{height:44px;border-radius:12px;border:1px solid #59442b;background:#0e0b09;color:#f1dfb7;padding:0 12px;font:inherit}.v1042QtyFoot{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.v1042QtyCancel{background:linear-gradient(180deg,rgba(77,62,39,.96),rgba(48,39,27,.96))}
.v1042BankInfoBack{position:fixed;inset:0;z-index:141;background:#080604c9;backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:18px 14px calc(18px + env(safe-area-inset-bottom))}.v1042BankInfoModal{width:min(430px,100%);max-height:88vh;overflow:auto;border:1px solid #775c38;border-radius:18px;background:linear-gradient(180deg,#21190f,#15110d);box-shadow:0 22px 60px #000b;padding:17px}.v1042BankInfoHero{display:flex;align-items:center;gap:12px;margin-bottom:10px}.v1042BankInfoIcon{width:58px;height:58px;display:grid;place-items:center;border-radius:16px;font-size:34px;background:#2a2117;border:1px solid #6b5438}.v1042BankInfoHero h2{margin:2px 0 0;color:#f0d99f;font-size:25px}.v1042BankInfoDesc{margin:7px 0 13px;color:#c4b79f;line-height:1.45;font-size:13px}.v1042BankInfoRows{border:1px solid #463729;border-radius:13px;overflow:hidden}.v1042BankInfoRows>div{display:grid;grid-template-columns:minmax(95px,.8fr) minmax(0,1.4fr);gap:10px;padding:9px 10px;border-bottom:1px solid #392d23}.v1042BankInfoRows>div:last-child{border-bottom:0}.v1042BankInfoRows span{font-size:10px;color:#958976}.v1042BankInfoRows b{font-size:10px;color:#e5d5b5;text-align:right;line-height:1.3}.v1042BankInfoClose{width:100%;margin-top:13px;min-height:46px;border-radius:12px;border:1px solid #745630;background:#302215;color:#f2dfb7;font-weight:700}
@media(max-width:430px){.v1042VaultModal{height:91dvh;max-height:91dvh;padding:14px 10px 10px;gap:10px}.v1042VaultHead h2{font-size:23px}.v1042VaultGrid{gap:8px}.v1042BankTile{min-height:122px;padding:10px 8px 8px;border-radius:16px}.v1042TileIcon{width:42px;height:42px;font-size:27px}.v1042TileName{font-size:13px;min-height:28px}.v1042TileMeta{font-size:9.5px}.v1042TileQty{font-size:13px}.v1042TileBadge{font-size:8px;padding:3px 5px}.v1042QtyModal,.v1042BankInfoModal{padding:14px}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
