window.RF=window.RF||{};
RF.VERSION='10.12.0';
RF.V1012=RF.V1012||{};

/* Realmforge V10.12 — Stability Repair
   - Roll back V10.11's over-broad action-card CSS.
   - Fix Greenvale Bank card alignment at the actual cause (legacy bankOpen margin).
   - Disable V10.11 post-render DOM list shuffling.
   - Sort Pack, Bank, Shop and Crafting at data/render time instead.
*/
(()=>{
  // V10.11 injected its layout CSS dynamically. Remove it completely.
  document.getElementById('v1011-style')?.remove();
  // Stop the post-render appendChild sorter that could make lists look like two renderers fighting.
  if(RF.V1011)RF.V1011.organizeLists=()=>{};

  const st=document.createElement('style');st.id='v1012-style';st.textContent=`
    /* Only the Greenvale bank card needed correction: old Pack-page margin was leaking into World grid. */
    .v1012ActionSection .bankOpen{margin:0!important;width:auto!important}
    .v1012ActionSection .grid2{align-items:stretch}
    .v1012ActionSection .action{height:auto!important;min-height:54px}
    /* Keep icon/text alignment compact without changing every action/travel card in the game. */
    .v1012ActionSection .action .emoji{float:left;margin-right:8px}
  `;document.head.appendChild(st);
})();

RF.V1012.catOrder={weapon:0,armor:1,food:2,material:3,tool:4,treasure:5,other:6};
RF.V1012.cat=function(id){const it=RF.DATA.items?.[id];return it?(RF.v92Category?.(it)||it.type||'other'):'other'};
RF.V1012.compare=function(a,b){const ca=RF.V1012.cat(a),cb=RF.V1012.cat(b),oa=RF.V1012.catOrder[ca]??98,ob=RF.V1012.catOrder[cb]??98;if(oa!==ob)return oa-ob;return String(RF.DATA.items?.[a]?.name||a).localeCompare(String(RF.DATA.items?.[b]?.name||b),undefined,{sensitivity:'base'})};
RF.V1012.sortedEntries=function(obj){return Object.entries(obj||{}).sort(([a],[b])=>RF.V1012.compare(a,b))};
RF.V1012.sortedIds=function(ids){return [...(ids||[])].sort(RF.V1012.compare)};

// ---------- Pack: sort before HTML is generated ----------
RF.UI.inventory=function(s){
  const cap=RF.packCapacity?RF.packCapacity(s):(RF.V82?.PACK_CAP||28),used=RF.packUsed(s),pct=Math.min(100,used/cap*100),cat=s.v93?.inventoryCategory||'all';
  const rows=RF.V1012.sortedEntries(s.inventory).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{
    const it=RF.DATA.items[id];if(!it)return'';const equipped=RF.isEquipped(s,id),req=RF.v93Req?.(s,id)||'',can=it.tool?true:RF.canEquipItem(s,id),equippable=!!(it.slot||it.tool);
    const state=equipped?'<span class="equipState equipped">EQUIPPED</span>':equippable?(can?'<span class="equipState">EQUIP</span>':'<span class="equipState locked">LOCKED</span>'):'';
    let sub=it.rarity||it.type||'Item';if(it.tool)sub+=` • ${RF.v103ToolLabel?.(it.tool)||it.tool} tool${it.tier?` • Tier ${it.tier}`:''}`;else if(req)sub+=` • ${req}`;
    return `<button class="row inventoryRow" data-item-detail="${id}"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name} ${state}</b><small>${sub}</small></div><span class="qty">×${q}</span><span class="chev">›</span></button>`;
  }).join('');
  return `<section class="card"><div class="questTitle"><h2>Pack</h2><span class="packCount ${used>=cap?'full':''}">${used}/${cap} slots</span></div><div class="packBar"><div style="width:${pct}%"></div></div>${RF.v93Select('inventory',cat)}<div class="list inventoryList">${rows||'<div class="sub">Nothing in this category.</div>'}</div></section>`;
};

// ---------- Shop: category then name, generated once ----------
RF.UI.shop=function(s){
  const l=RF.DATA.locations[s.location];if(!l?.shop)return `<section class="card"><h2>Shop</h2><div class="notice">There is no permanent shop here.</div></section>`;
  const market=s.world?.market||{food:1,metal:1,wood:1},cat=s.v93?.shopCategory||'all';
  const stock=RF.V1012.sortedIds(RF.v83ShopStock(s));
  const buyRows=stock.filter(id=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(id=>{const it=RF.DATA.items[id],price=RF.marketPrice?RF.marketPrice(s,id,true):it.value||1,req=RF.v93Req?.(s,id);return `<button class="row browseRow" data-shop-detail="${id}" data-shop-mode="buy"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>${req?`Requires ${req} • `:''}${it.desc||''}</small></div><span class="qty">${price}g</span><span class="chev">›</span></button>`}).join('');
  const sellRows=RF.V1012.sortedEntries(s.inventory).filter(([id,q])=>q>0&&RF.DATA.items[id]?.value>0&&(cat==='all'||RF.v92Category(RF.DATA.items[id])===cat)).map(([id,q])=>{const it=RF.DATA.items[id],price=RF.marketPrice?RF.marketPrice(s,id,false):Math.max(1,Math.floor(it.value*.55)),req=RF.v93Req?.(s,id);return `<button class="row browseRow" data-shop-detail="${id}" data-shop-mode="sell"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>Owned ×${q}${req?` • ${req}`:''}</small></div><span class="qty">${price}g</span><span class="chev">›</span></button>`}).join('');
  return `<section class="card"><h2>${RF.v83ShopName(s)}</h2><div class="marketTicker"><span>🍞 ×${(+market.food||1).toFixed(2)}</span><span>⚒️ ×${(+market.metal||1).toFixed(2)}</span><span>🪵 ×${(+market.wood||1).toFixed(2)}</span></div>${RF.v93Select('shop',cat)}<div class="list" style="margin-top:10px">${buyRows||'<div class="sub">No stock in this category.</div>'}</div></section><section class="card"><h3>Sell</h3><div class="list">${sellRows||'<div class="sub">Nothing saleable in this category.</div>'}</div></section>`;
};

// ---------- Skills + Crafting: recipes sorted by output category then name ----------
RF.UI.skills=function(s){
  const skillRows=Object.entries(RF.DATA.skills).map(([id,d])=>{const sk=s.skills[id],next=RF.xpForLevel(Math.min(100,sk.level+1)),prev=RF.xpForLevel(sk.level),pct=sk.level>=100?100:100*(sk.xp-prev)/Math.max(1,next-prev);return `<button class="row skill skillInspect" data-skill-detail="${id}"><div class="skillIcon">${d.icon}</div><div><div class="skillName">${d.name}</div><div class="miniBar"><div class="miniFill" style="width:${Math.max(0,Math.min(100,pct))}%"></div></div><small>${Math.floor(sk.xp)} XP</small></div><div class="skillLevel">${sk.level}</div></button>`}).join('');
  const cat=s.v93?.craftCategory||'all';
  const options=[['all','All items'],['weapon','Weapons'],['armor','Armour'],['food','Food & Potions'],['material','Materials'],['tool','Tools'],['treasure','Treasure'],['other','Other']].map(([v,l])=>`<option value="${v}" ${cat===v?'selected':''}>${l}</option>`).join('');
  const recipeEntries=Object.entries(RF.DATA.recipes).sort(([aid,a],[bid,b])=>{const ao=Object.keys(a.outputs||{})[0]||aid,bo=Object.keys(b.outputs||{})[0]||bid;return RF.V1012.compare(ao,bo)});
  const recipes=recipeEntries.filter(([id,r])=>{const out=Object.keys(r.outputs||{})[0]||id;return cat==='all'||RF.v92Category(RF.DATA.items[out])===cat}).map(([id,r])=>{const out=Object.keys(r.outputs||{})[0]||id,it=RF.DATA.items[out],req=RF.v93Req?.(s,out)||'',canLevel=(s.skills[r.skill]?.level||1)>=r.level,canMats=RF.hasItems(s,r.inputs);return `<button class="row browseRow" data-recipe-detail="${id}"><div class="icon">${it?.icon||'🛠️'}</div><div class="meta"><b>${r.name}</b><small>${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level}${req?` • Use: ${req}`:''}</small></div><span class="recipeState ${canLevel&&canMats?'ready':''}">${canLevel&&canMats?'READY':!canLevel?`LV ${r.level}`:'MATS'}</span><span class="chev">›</span></button>`}).join('');
  return `<section class="card"><h2>Skills</h2><div class="sub">Tap any skill for detailed XP progress. Level cap: 100.</div><div class="list" style="margin-top:10px">${skillRows}</div></section><section class="card"><h3>Crafting</h3><label class="filterLabel">Category<select data-v93-filter="craft">${options}</select></label><div class="sub">Tap a recipe to inspect ingredients, crafting skill and use requirements.</div><div class="list">${recipes||'<div class="sub">No recipes in this category.</div>'}</div></section>`;
};

// ---------- Bank modal: sorted at source, preserving V10.10 split-vault behavior ----------
const v1012ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  if(this.modal?.type!=='bank')return v1012ModalBase(s);
  if(!RF.isBankTown(s))return `<div class="modalBack"><div class="modal"><div style="font-size:42px">🏦</div><h2>Bank Unavailable</h2><div class="sub">Your vault can only be accessed from Greenvale Bank.</div><div class="choices"><button class="choice" data-close-bank><b>Close</b></button></div></div></div>`;
  const cat=s.v93?.bankCategory||'all',cap=RF.packCapacity?RF.packCapacity(s):(RF.V82?.PACK_CAP||28),used=RF.packUsed(s);
  const pack=RF.V1012.sortedEntries(s.inventory).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{const it=RF.DATA.items[id];if(!it)return'';const eq=RF.isEquipped(s,id),mov=Math.max(0,q-(eq?1:0)),req=RF.v93Req?.(s,id)||'';return `<div class="bankRow"><span class="bankIcon">${it.icon}</span><div class="meta"><b>${it.name}</b><small>Pack ×${q}${eq?' • EQUIPPED':''}${req?` • ${req}`:''}</small></div><button type="button" class="vaultBtn" data-bank-deposit="${id}" ${mov<1?'disabled':''}>+1</button><button type="button" class="vaultBtn all" data-bank-deposit-all="${id}" ${mov<1?'disabled':''}>All</button></div>`}).join('');
  const bank=RF.V1012.sortedEntries(s.bank).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{const it=RF.DATA.items[id];if(!it)return'';const req=RF.v93Req?.(s,id)||'',full=!(s.inventory[id]>0)&&used>=cap;return `<div class="bankRow"><span class="bankIcon">${it.icon}</span><div class="meta"><b>${it.name}</b><small>Bank ×${q}${req?` • ${req}`:''}</small></div><button type="button" class="vaultBtn" data-bank-withdraw="${id}" ${full?'disabled':''}>−1</button><button type="button" class="vaultBtn all" data-bank-withdraw-all="${id}" ${full?'disabled':''}>All</button></div>`}).join('');
  const bankCount=Object.values(s.bank||{}).filter(q=>q>0).length;
  return `<div class="modalBack"><div class="modal bankModal v1010Bank"><div class="v1010BankHead"><div><span class="eyebrow">GREENVALE BANK</span><h2>🏦 Vault</h2><div class="sub">Pack above • Bank below</div></div></div>${RF.v93Select('bank',cat)}<section class="v1010BankPane"><div class="v1010BankPaneHead"><h3>🎒 Pack</h3><span>${used}/${cap} slots</span></div><div class="v1010BankScroll" data-v1010-scroll="pack">${pack||'<div class="v1010BankEmpty">Nothing carried in this category.</div>'}</div></section><section class="v1010BankPane"><div class="v1010BankPaneHead"><h3>🏦 Bank</h3><span>${bankCount} stored stacks</span></div><div class="v1010BankScroll" data-v1010-scroll="bank">${bank||'<div class="v1010BankEmpty">Nothing stored in this category.</div>'}</div></section><div class="v1010BankFoot"><button class="quietClose" data-close-bank>Close Bank</button></div></div></div>`;
};

// Mark only the World Actions section so the bank margin reset does not affect Pack/Options/etc.
RF.V1012.markWorldActions=function(){
  document.querySelectorAll('section.card').forEach(card=>{const h=card.querySelector(':scope > h3');if(h?.textContent.trim()==='Actions')card.classList.add('v1012ActionSection')});
};
const v1012RenderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){const out=v1012RenderBase(s);requestAnimationFrame(RF.V1012.markWorldActions);return out};

if(RF.state){RF.state.version='10.12.0';try{RF.save?.(RF.state)}catch(_){};requestAnimationFrame(RF.V1012.markWorldActions)}
