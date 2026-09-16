window.RF=window.RF||{};
RF.VERSION='10.45.0';
RF.BUILD={
  version:'10.45.0',
  title:'Pack Grid',
  built:'16 Sep 2026 • 22:52 BST',
  buildId:'20260916-2252-bst'
};
RF.V1045=RF.V1045||{};

/* Realmforge V10.45 — Pack Grid
   - Rebuilds the main Pack tab into the same compact 4-column grid direction as the Vault.
   - Replaces inventory category dropdowns with a single-row tab strip.
   - Applies the new category tabs across inventory-facing interfaces such as Pack and Bank.
*/

(()=>{
'use strict';
const V=RF.V1045;
V.CATS=[
  ['all','All'],
  ['weapons','Weapons'],
  ['armour','Armour'],
  ['consumables','Food'],
  ['materials','Mats'],
  ['tools','Tools'],
  ['treasure','Treasure'],
  ['other','Other']
];

V.migrate=function(s){
  if(!s)return s;
  s.version='10.45.0';
  s.v1045=s.v1045||{};
  s.v93=s.v93||{};
  if(!s.v93.inventoryCategory)s.v93.inventoryCategory='all';
  if(!s.v93.bankCategory)s.v93.bankCategory='all';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.45.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.cap=s=>RF.packCapacity?RF.packCapacity(s):(RF.V82?.PACK_CAP||28);
V.categoryTabs=function(kind,active){
  return `<div class="v1045CatScroller" role="tablist" aria-label="${V.escape(kind)} categories">${V.CATS.map(([id,label])=>`<button type="button" class="v1045CatTab ${active===id?'active':''}" data-v1045-cat-kind="${kind}" data-v1045-cat="${id}">${V.escape(label)}</button>`).join('')}</div>`;
};
RF.v93Select=function(kind,active){return V.categoryTabs(kind,active)};

V.packTile=function(s,id,qty){
  const it=RF.DATA.items?.[id]; if(!it)return '';
  const equipped=RF.isEquipped?.(s,id);
  const can=RF.canEquipItem?.(s,id);
  const badge=equipped?'<span class="v1042TileBadge">EQ</span>':(it.slot&&!can?'<span class="v1042TileBadge muted">LOCK</span>':'');
  return `<button type="button" class="v1042BankTile v1045PackTile ${equipped?'equipped':''}" data-item-detail="${V.escape(id)}" aria-label="${V.escape(it.name)}">
    <div class="v1042TileIcon">${it.icon||'📦'}</div>
    <div class="v1042TileName">${V.escape(it.name)}</div>
    <div class="v1042TileFoot"><span class="v1042TileQty">×${qty}</span>${badge}</div>
  </button>`;
};

RF.UI.inventory=function(s){
  const used=RF.packUsed(s),cap=V.cap(s),pct=Math.min(100,used/cap*100),cat=s.v93?.inventoryCategory||'all';
  const entries=(RF.V1012?.sortedEntries?RF.V1012.sortedEntries(s.inventory):Object.entries(s.inventory||{}))
    .filter(([,q])=>(+q||0)>0)
    .filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat);
  const tiles=entries.map(([id,q])=>V.packTile(s,id,+q||0)).join('');
  return `<section class="card v1045PackCard"><div class="questTitle"><h2>Pack</h2><span class="packCount ${used>=cap?'full':''}">${used}/${cap} slots</span></div><div class="packBar"><div style="width:${pct}%"></div></div>${V.categoryTabs('inventory',cat)}${RF.isBankTown(s)?`<button class="action bankOpen v1045BankOpen" data-open-bank><b>🏦 Open Bank</b><small>Deposit or withdraw stored items</small></button>`:'<div class="tiny bankHint">🏦 Bank access: Greenvale, Ironridge and Reedmere.</div>'}<div class="v1045PackGridWrap"><div class="v1042VaultGrid v1045PackGrid">${tiles||'<div class="v1042VaultEmpty">Nothing in this category.</div>'}</div></div></section>`;
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelectorAll('[data-v1045-cat-kind]').forEach(b=>b.onclick=()=>{
    const kind=b.dataset.v1045CatKind,cat=b.dataset.v1045Cat;
    s.v93=s.v93||{};
    s.v93[`${kind}Category`]=cat;
    RF.save?.(s);
    RF.UI.render(s);
  });
};

const oldStyle=document.getElementById('v1045-pack-grid-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1045-pack-grid-style';
st.textContent=`
.v1045CatScroller{display:flex;flex-wrap:nowrap;gap:7px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:2px 1px 1px}.v1045CatScroller::-webkit-scrollbar{display:none}
.v1045CatTab{flex:0 0 auto;min-height:34px;padding:0 12px;border-radius:999px;border:1px solid rgba(200,159,84,.22);background:linear-gradient(180deg,rgba(36,27,19,.82),rgba(18,13,10,.94));color:#d7c39a;font-size:11px;font-weight:800;letter-spacing:.02em;white-space:nowrap;box-shadow:inset 0 1px rgba(255,255,255,.04)}
.v1045CatTab.active{border-color:#c69d59;background:linear-gradient(180deg,rgba(109,76,33,.98),rgba(65,45,22,.98));color:#f5e5bf}
.v1045PackCard{display:grid;gap:12px}.v1045BankOpen{margin-top:2px}.v1045PackGridWrap{border:1px solid rgba(198,158,83,.16);border-radius:18px;background:linear-gradient(180deg,rgba(13,10,8,.18),rgba(9,7,6,.32));padding:8px;min-height:0}.v1045PackGrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-content:start}
.v1045PackTile{min-height:98px;padding:8px 6px 7px;border-radius:14px}.v1045PackTile .v1042TileIcon{width:34px;height:34px;font-size:22px}.v1045PackTile .v1042TileName{font-size:10.5px;min-height:22px}.v1045PackTile .v1042TileFoot{margin-top:auto}.v1045PackTile .v1042TileQty{font-size:10.5px}.v1045PackTile .v1042TileBadge{font-size:7.5px;padding:3px 4px}
.v1042VaultTools .v1045CatScroller{flex:1 1 auto}
@media(min-width:700px){.v1045PackTile{min-height:104px;padding:9px 7px 8px}.v1045PackTile .v1042TileIcon{width:36px;height:36px;font-size:24px}.v1045PackTile .v1042TileName{font-size:11px;min-height:24px}.v1045PackTile .v1042TileQty{font-size:11px}.v1045PackTile .v1042TileBadge{font-size:8px;padding:3px 5px}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
