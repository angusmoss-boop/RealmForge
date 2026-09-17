window.RF=window.RF||{};
RF.VERSION='10.57.0';
RF.BUILD={
  version:'10.57.0',
  title:'Battle Categories',
  built:'17 Sep 2026 • 15:58 BST',
  buildId:'20260917-1558-bst'
};
RF.V1057=RF.V1057||{};

/* Realmforge V10.57 — Battle Categories
   - Adds Magic as a first-class navigation tab with a Coming Soon page.
   - Tightens Tactical Battle actions/items to four columns on mobile.
   - Splits combat Actions into Aggressive / Defensive / Abilities / Magic categories.
   - Preserves all existing combat hooks, long-press intel, unidentified-enemy secrecy and loadout/save state.
*/

(()=>{
'use strict';
const V=RF.V1057;
V.CATS=[
  ['aggressive','⚔️','Aggressive'],
  ['defensive','🛡️','Defensive'],
  ['abilities','✨','Abilities'],
  ['magic','🔮','Magic']
];

V.migrate=function(s){
  if(!s)return s;
  s.version='10.57.0';
  s.v1057=s.v1057||{};
  if(!V.CATS.some(([id])=>id===s.v1057.combatCategory))s.v1057.combatCategory='aggressive';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.57.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------- Magic navigation ----------
V.magicPage=function(){
  return `<section class="card v1057MagicCard">
    <div class="questTitle"><div><span class="eyebrow">ARCANE ARTS</span><h2>🔮 Magic</h2></div><span class="tag v1057SoonTag">COMING SOON</span></div>
    <div class="v1057MagicHero"><div class="v1057Orb">🔮</div><h3>Magic is coming soon.</h3><p>The spellbook is still sealed. Future updates will open spellcasting, arcane combat actions and utility magic here.</p></div>
  </section>`;
};
const pageBase=RF.UI.page.bind(RF.UI);
RF.UI.page=function(s){
  if(this.tab==='magic')return V.magicPage(s);
  return pageBase(s);
};

V.withMagicArray=function(items){
  const clean=(items||[]).filter(x=>x&&x[0]!=='shop'&&x[0]!=='magic').map(x=>[...x]);
  const magic=['magic','🔮','Magic'];
  const i=clean.findIndex(x=>x[0]==='skills');
  clean.splice(i>=0?i+1:clean.length,0,magic);
  return clean;
};
if(RF.V95?.navItems)RF.V95.navItems=V.withMagicArray(RF.V95.navItems);
if(RF.V1038){
  const clean=(RF.V1038.items||[]).filter(x=>x?.id!=='shop'&&x?.id!=='magic').map(x=>({...x}));
  const i=clean.findIndex(x=>x.id==='skills');
  clean.splice(i>=0?i+1:clean.length,0,{id:'magic',icon:'🔮',label:'Magic'});
  RF.V1038.items=clean;
  RF.V1038.meta={
    ...(RF.V1038.meta||{}),
    magic:'Spellcasting and arcane arts. Coming soon.'
  };
  delete RF.V1038.meta.shop;
}
if(RF.UI.tab==='shop')RF.UI.tab='world';

// ---------- Categorised Tactical Battle ----------
V.categoryForButton=function(btnHtml){
  if(/data-parry\b/.test(btnHtml)||/data-v4-flee\b/.test(btnHtml))return 'defensive';
  const m=btnHtml.match(/data-ability="([^"]+)"/);if(!m)return 'abilities';
  const id=m[1],a=RF.DATA.abilities?.[id];
  if(a?.kind==='magic'||a?.skill==='magic')return 'magic';
  if(['guard','brace','riposte','iron_wall','shield_bash'].includes(id)||a?.skill==='defence'||['guard','riposte'].includes(a?.kind))return 'defensive';
  if(['second_wind','feint','hunters_mark','adrenaline_break'].includes(id)||['heal','status'].includes(a?.kind)||a?.special)return 'abilities';
  return 'aggressive';
};
V.actionCategoryHtml=function(s,buttons){
  const active=V.CATS.some(([id])=>id===s?.v1057?.combatCategory)?s.v1057.combatCategory:'aggressive';
  const grouped={aggressive:[],defensive:[],abilities:[],magic:[]};
  buttons.forEach(b=>grouped[V.categoryForButton(b)]?.push(b));
  const tabs=V.CATS.map(([id,icon,label])=>`<button type="button" class="v1057CombatCat ${active===id?'active':''}" data-v1057-combat-cat="${id}"><span>${icon}</span><b>${label}</b><small>${grouped[id].length}</small></button>`).join('');
  const body=grouped[active].length?grouped[active].join(''):`<div class="v1057EmptyCombatCat">${active==='magic'?'🔮 No combat magic is available yet.':'No actions are available in this category.'}</div>`;
  return `<div class="v1057CombatCats">${tabs}</div><div class="v1035ActionGrid v1057CategorisedGrid">${body}</div>`;
};

const combatBase=RF.UI.combatPopup.bind(RF.UI);
RF.UI.combatPopup=function(s){
  let h=combatBase(s);if(!h||!s?.combat)return h;
  h=h.replace(/<div class="v1035ActionGrid">([\s\S]*?)<\/div>/,(whole,inside)=>{
    const buttons=inside.match(/<button[\s\S]*?<\/button>/g)||[];
    return V.actionCategoryHtml(s,buttons);
  });
  return h;
};

// A fresh fight always opens on Aggressive. Changing category never spends a turn.
const startBattleBase=RF.startBattle;
if(startBattleBase)RF.startBattle=function(){
  if(RF.state){RF.state.v1057=RF.state.v1057||{};RF.state.v1057.combatCategory='aggressive'}
  return startBattleBase.apply(this,arguments);
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelectorAll('[data-v1057-combat-cat]').forEach(b=>b.onclick=()=>{
    if(!s?.combat)return;
    s.v1057=s.v1057||{};
    s.v1057.combatCategory=b.dataset.v1057CombatCat;
    RF.save?.(s);RF.UI.render(s);
  });
};

const oldStyle=document.getElementById('v1057-battle-categories-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v1057-battle-categories-style';st.textContent=`
.v1057MagicCard{display:grid;gap:14px}.v1057SoonTag{white-space:nowrap}.v1057MagicHero{min-height:310px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(198,158,83,.17);border-radius:20px;background:radial-gradient(circle at 50% 35%,rgba(90,62,124,.16),transparent 42%),linear-gradient(180deg,rgba(16,12,10,.34),rgba(9,7,6,.45));padding:28px 20px}.v1057Orb{width:94px;height:94px;display:grid;place-items:center;border-radius:50%;font-size:58px;background:radial-gradient(circle at 38% 30%,rgba(255,255,255,.09),rgba(92,62,126,.14) 42%,rgba(18,13,22,.6));border:1px solid rgba(157,126,184,.25);box-shadow:0 18px 48px #0006}.v1057MagicHero h3{margin:18px 0 6px;color:#efd69d;font-size:22px}.v1057MagicHero p{max-width:440px;margin:0;color:#ac9e87;line-height:1.5;font-size:12px}
.v1057CombatCats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin:5px 0 6px}.v1057CombatCat{min-width:0;min-height:38px;border:1px solid #44382b;border-radius:10px;background:#17130f;color:#b9ad97;padding:4px 2px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:3px;font:inherit}.v1057CombatCat>span{font-size:12px}.v1057CombatCat>b{min-width:0;font-size:7.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v1057CombatCat>small{font-size:6.5px;color:#897e6e}.v1057CombatCat.active{border-color:#b78949;background:linear-gradient(180deg,#49341d,#2c2116);color:#f0ddba}.v1057CombatCat.active small{color:#d3bd92}
.v1057EmptyCombatCat{grid-column:1/-1;min-height:58px;display:grid;place-items:center;text-align:center;border:1px dashed #46392c;border-radius:11px;color:#958a79;font-size:8px;padding:10px}
.v1035ActionGrid,.v1035ItemGrid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important}.v1035ActionTile,.v1035ItemTile{min-height:59px!important;padding:5px 3px!important;border-radius:10px!important}.v1035TileIcon{font-size:18px!important}.v1035ActionTile b,.v1035ItemTile b{font-size:8px!important;white-space:normal!important;line-height:1.04!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.v1035ActionTile small,.v1035ItemTile small{font-size:6.3px!important;line-height:1.05!important;white-space:nowrap!important}.v1035SectionTitle{margin:6px 0 3px!important}.v1035ParryNote{display:none!important}
@media(max-width:390px){.v1057CombatCats{gap:4px}.v1057CombatCat{min-height:36px;padding:3px 2px}.v1057CombatCat>b{font-size:7px}.v1057CombatCat>span{font-size:11px}.v1035ActionGrid,.v1035ItemGrid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:4px!important}.v1035ActionTile,.v1035ItemTile{min-height:56px!important;padding:4px 2px!important}.v1035TileIcon{font-size:17px!important}.v1035ActionTile b,.v1035ItemTile b{font-size:7.5px!important}.v1035ActionTile small,.v1035ItemTile small{font-size:6px!important}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
