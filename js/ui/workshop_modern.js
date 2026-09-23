/* Realmforge V12.6.0 — Modern Village Workshop.
   Final presentation owner for Greenvale workshop categories and modal chrome. */
(() => {
  'use strict';
  const RF=window.RF,V=RF.V1028;
  if(!RF.UI||!V)throw new Error('Modern Workshop requires RF.UI and V10.28 workshop runtime.');
  const labels={all:'All Recipes',weapons:'Weapons',armour:'Armour',consumables:'Consumables',materials:'Materials',tools:'Tools',treasure:'Treasure',other:'Other'};
  const icons={all:'⚒️',weapons:'⚔️',armour:'🛡️',consumables:'🧪',materials:'🧱',tools:'🛠️',treasure:'💎',other:'📦'};
  const baseBind=RF.UI.bind.bind(RF.UI);
  V.workshopModal=function(s){
    const cat=V.category(s),entries=V.recipeEntries(s),rows=entries.map(([id,r])=>V.recipeRow(s,id,r)).join('');
    const tabs=V.categories.map(id=>`<button type="button" class="v126WorkshopTab ${cat===id?'active':''}" data-v126-workshop-category="${id}"><span>${icons[id]||'•'}</span><b>${labels[id]||V.categoryLabel(id)}</b></button>`).join('');
    const all=Object.entries(RF.DATA?.recipes||{}).filter(([,r])=>r?.skill!=='cooking').length;
    return `<div class="modalBack"><div class="modal itemModal v1028WorkshopModal v126WorkshopModal"><button class="rfCloseX v126WorkshopClose" data-v126-workshop-close aria-label="Close Workshop">×</button><div class="v126WorkshopHero"><div class="v126WorkshopIcon">⚒️</div><div><span class="eyebrow">GREENVALE • PRODUCTION HUB</span><h2>Village Workshop</h2><p>Forge, craft and brew using materials from your Pack first, then Greenvale Bank.</p></div></div><div class="v126WorkshopSummary"><span><b>${entries.length}</b> shown</span><span><b>${all}</b> workshop recipes</span><span><b>${s.skills?.smithing?.level||1}</b> Smithing</span></div><div class="v126WorkshopTabs" role="tablist" aria-label="Workshop recipe categories">${tabs}</div><div class="list v1028RecipeList v126RecipeList">${rows||'<div class="v126WorkshopEmpty">No recipes in this category yet.</div>'}</div><div class="notice v126CookingNote">🍳 Cooking remains separate: use an active campfire or your cottage kitchen.</div></div></div>`;
  };
  RF.UI.bind=function(s){
    baseBind(s||RF.state);
    document.querySelectorAll('[data-v126-workshop-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
    document.querySelectorAll('[data-v126-workshop-category]').forEach(b=>b.onclick=()=>{
      const st=RF.state,id=b.dataset.v126WorkshopCategory;if(!st||!V.categories.includes(id))return;
      st.v1028=st.v1028||{};st.v1028.category=id;RF.save?.(st);RF.UI.modal={type:'v1028Workshop'};RF.UI.render(st);
    });
  };
  const old=document.getElementById('rf-v126-workshop-style');if(old)old.remove();
  const st=document.createElement('style');st.id='rf-v126-workshop-style';st.textContent=`
    .v126WorkshopModal{position:relative;width:min(680px,calc(100vw - 24px));max-width:100%;min-width:0;max-height:min(88dvh,900px);overflow:auto;padding:20px 16px 18px;border-color:rgba(215,169,84,.42);background:radial-gradient(circle at 90% 0%,rgba(155,102,31,.12),transparent 32%),linear-gradient(180deg,#21180f,#120e0a 55%,#0d0a08)}
    .v126WorkshopClose{position:absolute;top:12px;right:12px;z-index:3}.v126WorkshopHero{display:grid;grid-template-columns:64px minmax(0,1fr);gap:13px;align-items:center;padding-right:48px}.v126WorkshopIcon{width:62px;height:62px;display:grid;place-items:center;border-radius:18px;font-size:34px;background:linear-gradient(145deg,rgba(111,72,27,.85),rgba(36,25,16,.95));border:1px solid rgba(219,170,86,.3);box-shadow:inset 0 0 28px rgba(224,161,63,.06)}
    .v126WorkshopHero h2{margin:2px 0 3px;color:#f0d79e}.v126WorkshopHero p{margin:0;color:#b9aa91;font-size:12px;line-height:1.45}.v126WorkshopSummary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:14px 0 12px}.v126WorkshopSummary span{min-width:0;padding:8px 7px;border:1px solid rgba(211,166,85,.16);border-radius:12px;background:rgba(255,255,255,.025);text-align:center;color:#a9987c;font-size:9px}.v126WorkshopSummary b{display:block;color:#e8ca8d;font-size:13px;margin-bottom:1px}
    .v126WorkshopTabs{width:100%;max-width:100%;min-width:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(2,auto);gap:7px;margin:0 0 13px}.v126WorkshopTab{min-width:0;min-height:62px;padding:7px 4px;border:1px solid rgba(203,159,78,.18);border-radius:14px;background:linear-gradient(180deg,rgba(42,31,21,.9),rgba(18,13,10,.98));color:#b9aa90;font:inherit;text-align:center;display:grid;place-items:center;align-content:center;gap:3px}.v126WorkshopTab span{font-size:18px;line-height:1}.v126WorkshopTab b{font-size:8px;line-height:1.15;white-space:normal;overflow-wrap:anywhere}.v126WorkshopTab.active{border-color:#c99642;background:linear-gradient(180deg,rgba(112,74,29,.88),rgba(54,36,20,.98));color:#f2d79d;box-shadow:inset 0 0 0 1px rgba(242,198,116,.08),0 0 18px rgba(188,126,42,.08)}
    .v126RecipeList{min-width:0;margin-top:0;display:grid;gap:8px}.v126RecipeList .v1028RecipeRow{margin:0;border-radius:15px;background:linear-gradient(180deg,rgba(31,24,18,.94),rgba(15,12,9,.98));border-color:rgba(203,159,78,.16)}.v126WorkshopEmpty{padding:24px 12px;border:1px dashed rgba(202,159,80,.22);border-radius:14px;text-align:center;color:#9f927c}.v126CookingNote{margin-top:13px}
    @media(max-width:430px){.v126WorkshopModal{width:calc(100vw - 18px);padding:17px 11px 14px}.v126WorkshopHero{grid-template-columns:52px minmax(0,1fr);gap:10px}.v126WorkshopIcon{width:50px;height:50px;border-radius:14px;font-size:28px}.v126WorkshopHero p{font-size:10px}.v126WorkshopTabs{gap:6px}.v126WorkshopTab{min-height:57px;padding:6px 3px}.v126WorkshopTab b{font-size:7.5px}.v126WorkshopSummary span{font-size:8px;padding:7px 4px}}
  `;document.head.appendChild(st);
  const api={version:'12.6.0',columns:4,rows:2,categories:[...V.categories]};
  RF.Views.Workshop=RF.Modules.register('ui.workshop',api,{owner:'ui',status:'canonical',presentation:'4x2-category-grid'});
})();
