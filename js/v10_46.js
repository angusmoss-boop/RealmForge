window.RF=window.RF||{};
RF.VERSION='10.46.0';
RF.BUILD={
  version:'10.46.0',
  title:'Category Grid',
  built:'16 Sep 2026 • 23:02 BST',
  buildId:'20260916-2302-bst'
};
RF.V1046=RF.V1046||{};

/* Realmforge V10.46 — Category Grid
   - Reworks the V10.45 category tabs into a tidy 2-row, 4-column layout.
   - Keeps the new category-tab system while preventing horizontal stretch in Pack and Vault.
*/

(()=>{
'use strict';
const V=RF.V1046;
V.CATS=[
  ['all','All'],['weapons','Weapons'],['armour','Armour'],['consumables','Food'],
  ['materials','Mats'],['tools','Tools'],['treasure','Treasure'],['other','Other']
];
V.migrate=function(s){
  if(!s)return s;
  s.version='10.46.0';
  s.v1046=s.v1046||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.46.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.cap=s=>RF.packCapacity?RF.packCapacity(s):(RF.V82?.PACK_CAP||28);
V.categoryTabs=function(kind,active){
  return `<div class="v1046CatGrid" role="tablist" aria-label="${V.escape(kind)} categories">${V.CATS.map(([id,label])=>`<button type="button" class="v1046CatTab ${active===id?'active':''}" data-v1045-cat-kind="${kind}" data-v1045-cat="${id}">${V.escape(label)}</button>`).join('')}</div>`;
};
RF.v93Select=function(kind,active){return V.categoryTabs(kind,active)};

// Rebuild Pack so it uses the new compact 2x4 category layout too.
RF.UI.inventory=function(s){
  const used=RF.packUsed(s),cap=V.cap(s),pct=Math.min(100,used/cap*100),cat=s.v93?.inventoryCategory||'all';
  const sorted=(RF.V1012?.sortedEntries?RF.V1012.sortedEntries(s.inventory):Object.entries(s.inventory||{}));
  const entries=sorted.filter(([,q])=>(+q||0)>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat);
  const tiles=entries.map(([id,q])=>{
    const it=RF.DATA.items?.[id]; if(!it)return '';
    const equipped=RF.isEquipped?.(s,id);
    const can=RF.canEquipItem?.(s,id);
    const badge=equipped?'<span class="v1042TileBadge">EQ</span>':(it.slot&&!can?'<span class="v1042TileBadge muted">LOCK</span>':'');
    return `<button type="button" class="v1042BankTile v1045PackTile ${equipped?'equipped':''}" data-item-detail="${V.escape(id)}" aria-label="${V.escape(it.name)}"><div class="v1042TileIcon">${it.icon||'📦'}</div><div class="v1042TileName">${V.escape(it.name)}</div><div class="v1042TileFoot"><span class="v1042TileQty">×${q}</span>${badge}</div></button>`;
  }).join('');
  return `<section class="card v1045PackCard"><div class="questTitle"><h2>Pack</h2><span class="packCount ${used>=cap?'full':''}">${used}/${cap} slots</span></div><div class="packBar"><div style="width:${pct}%"></div></div>${V.categoryTabs('inventory',cat)}${RF.isBankTown(s)?`<button class="action bankOpen v1045BankOpen" data-open-bank><b>🏦 Open Bank</b><small>Deposit or withdraw stored items</small></button>`:'<div class="tiny bankHint">🏦 Bank access: Greenvale, Ironridge and Reedmere.</div>'}<div class="v1045PackGridWrap"><div class="v1042VaultGrid v1045PackGrid">${tiles||'<div class="v1042VaultEmpty">Nothing in this category.</div>'}</div></div></section>`;
};

const oldStyle=document.getElementById('v1046-category-grid-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1046-category-grid-style';
st.textContent=`
.v1046CatGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;align-items:stretch}
.v1046CatTab{min-height:36px;padding:0 6px;border-radius:14px;border:1px solid rgba(200,159,84,.22);background:linear-gradient(180deg,rgba(36,27,19,.82),rgba(18,13,10,.94));color:#d7c39a;font-size:10px;font-weight:800;letter-spacing:.01em;line-height:1.05;white-space:normal;text-align:center;box-shadow:inset 0 1px rgba(255,255,255,.04)}
.v1046CatTab.active{border-color:#c69d59;background:linear-gradient(180deg,rgba(109,76,33,.98),rgba(65,45,22,.98));color:#f5e5bf}
.v1042VaultTools .v1046CatGrid{flex:1 1 auto;width:100%}
.v1042VaultTools{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:10px}
.v1042VaultCount{padding-top:5px}
@media(max-width:430px){
  .v1046CatGrid{gap:6px}
  .v1046CatTab{min-height:34px;font-size:9.5px;padding:0 4px;border-radius:13px}
  .v1042VaultTools{gap:8px}
}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
