window.RF=window.RF||{};
RF.VERSION='10.28.0';

/* Realmforge V10.28 — Village Workshop
   - Greenvale gains a dedicated Village Workshop section immediately above the Bank.
   - Smithing, Crafting and Herblore production are workshop-only for now.
   - The old Skills & Crafting page becomes Skills only.
   - Workshop recipes use Greenvale Pack + Bank materials, always Pack first.
   - Cooking remains intentionally separate: active campfires or the owned Greenvale home kitchen.
*/

(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V1028=RF.V1028||{};
RF.V1028.version='10.28.0';

RF.V1028.isCooking=function(id){return RF.DATA?.recipes?.[id]?.skill==='cooking';};
RF.V1028.isWorkshopRecipe=function(id){const r=RF.DATA?.recipes?.[id];return !!r&&r.skill!=='cooking';};
RF.V1028.atWorkshop=function(s){return !!s&&s.location==='greenvale';};
RF.V1028.category=function(s){return s?.v1028?.category||'all';};
RF.V1028.categories=['all','weapons','armour','consumables','materials','tools','treasure','other'];
RF.V1028.categoryLabel=function(id){return ({all:'All recipes',weapons:'Weapons',armour:'Armour',consumables:'Consumables',materials:'Materials',tools:'Tools',treasure:'Treasure',other:'Other'})[id]||id;};
RF.V1028.outputId=function(id,r){return Object.keys(r?.outputs||{})[0]||id;};
RF.V1028.outputCategory=function(id,r){const out=RF.V1028.outputId(id,r);return RF.v92Category?RF.v92Category(RF.DATA?.items?.[out]):'other';};
RF.V1028.recipeEntries=function(s){
  const cat=RF.V1028.category(s);
  return Object.entries(RF.DATA?.recipes||{})
    .filter(([id,r])=>r?.skill!=='cooking')
    .filter(([id,r])=>cat==='all'||RF.V1028.outputCategory(id,r)===cat)
    .sort(([aid,a],[bid,b])=>{
      const ao=RF.V1028.outputId(aid,a),bo=RF.V1028.outputId(bid,b);
      if(RF.V1012?.compare)return RF.V1012.compare(ao,bo);
      return String(RF.DATA?.items?.[ao]?.name||a?.name||ao).localeCompare(String(RF.DATA?.items?.[bo]?.name||b?.name||bo));
    });
};

RF.migrateV1028=function(s){
  if(!s)return s;
  s.version='10.28.0';s.v1028=s.v1028||{};
  if(!RF.V1028.categories.includes(s.v1028.category))s.v1028.category='all';
  // Production used to be startable from anywhere. If a campaign updates mid-project in
  // the wilderness, cancel the station-bound work safely; ingredients are not consumed
  // until completion except for any mishaps that already happened.
  if(s.location!=='greenvale'&&RF.actionGame&&['forge','production'].includes(RF.actionGame.type)){
    const g=RF.actionGame;
    s.speed=(Number.isFinite(g.resumeSpeed)?g.resumeSpeed:1);
    RF.actionGame=null;
    if(RF.UI?.modal&&['v6Action','v7Action'].includes(RF.UI.modal.type))RF.UI.modal=null;
    RF.log?.(s,'Your unfinished production work was packed away. Smithing and workshop crafting now require the Greenvale Village Workshop.','important');
  }
  return s;
};
const v1028New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1028(v1028New(...a))};
const v1028Load=RF.load;RF.load=function(){return RF.migrateV1028(v1028Load())};
const v1028Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1028(v1028Import(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.28.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.migrateV1028(oldMig(s));
  const nav=RF.V95.navItems?.find(x=>x[0]==='skills');if(nav)nav[2]='Skills';
}

RF.V1028.workshopRequired=function(){
  const s=RF.state;
  RF.UI.modal={type:'message',title:'Village Workshop Required',text:'Smithing, Crafting and Herblore production are carried out at the Village Workshop in Greenvale. Cooking remains available at an active campfire or in your Greenvale home kitchen.'};
  RF.UI.render(s);
};

// Final craftability guard. V10.19 still supplies the Pack + Bank calculations inside Greenvale.
const v1028AnalysisBase=RF.V1019?.craftAnalysis||RF.V1015?.craftAnalysis;
RF.V1028.craftAnalysis=function(s,id){
  if(RF.V1028.isCooking(id))return RF.V1024?.craftAnalysis?RF.V1024.craftAnalysis(s,id):(v1028AnalysisBase?v1028AnalysisBase(s,id):{max:0,materialMax:0,blockers:['Cooking requires a cooking station.']});
  if(RF.V1028.isWorkshopRecipe(id)&&!RF.V1028.atWorkshop(s))return {max:0,materialMax:0,blockers:['Requires the Greenvale Village Workshop.']};
  return v1028AnalysisBase?v1028AnalysisBase(s,id):{max:0,materialMax:0,blockers:['Crafting unavailable.']};
};
if(RF.V1019)RF.V1019.craftAnalysis=RF.V1028.craftAnalysis;
if(RF.V1015)RF.V1015.craftAnalysis=RF.V1028.craftAnalysis;
RF.v9MaxCraft=function(s,id){return RF.V1028.craftAnalysis(s,id).max||0;};

// Hard guards below the UI. This prevents old pages, stale modals, debug calls or future
// regressions from beginning workshop production in the wilderness.
const v1028CraftBase=RF.craft;
RF.craft=function(id){
  if(RF.V1028.isWorkshopRecipe(id)&&!RF.V1028.atWorkshop(RF.state))return RF.V1028.workshopRequired();
  return v1028CraftBase?.apply(this,arguments);
};
const v1028BatchBase=RF.v9StartCraftQty;
if(typeof v1028BatchBase==='function')RF.v9StartCraftQty=function(id,qty){
  if(RF.V1028.isWorkshopRecipe(id)&&!RF.V1028.atWorkshop(RF.state))return RF.V1028.workshopRequired();
  return v1028BatchBase.apply(this,arguments);
};
const v1028OpenRecipeBase=RF.openRecipeDetail;
if(typeof v1028OpenRecipeBase==='function')RF.openRecipeDetail=function(id){
  if(RF.V1028.isWorkshopRecipe(id)&&!RF.V1028.atWorkshop(RF.state))return RF.V1028.workshopRequired();
  return v1028OpenRecipeBase.apply(this,arguments);
};

RF.V1028.cancelIllegalProduction=function(){
  const s=RF.state,g=RF.actionGame;if(!s||!g||!['forge','production'].includes(g.type)||s.location==='greenvale')return false;
  s.speed=Number.isFinite(g.resumeSpeed)?g.resumeSpeed:1;RF.actionGame=null;RF.UI.modal=null;RF.save?.(s);
  RF.UI.modal={type:'message',title:'Workshop Required',text:'That project cannot continue away from the Greenvale Village Workshop. Your unfinished work has been packed away.'};RF.UI.render(s);return true;
};
const v1028ProdBase=RF.productionTap;
if(typeof v1028ProdBase==='function')RF.productionTap=function(){if(RF.V1028.cancelIllegalProduction())return;return v1028ProdBase.apply(this,arguments)};
const v1028HammerBase=RF.hammerForge;
if(typeof v1028HammerBase==='function')RF.hammerForge=function(){if(RF.V1028.cancelIllegalProduction())return;return v1028HammerBase.apply(this,arguments)};

// ---------- Skills page: skills only ----------
const v1028SkillsBase=RF.UI.skills.bind(RF.UI);
RF.UI.skills=function(s){
  const h=v1028SkillsBase(s),markers=['<section class="card"><h3>Crafting</h3>','<section class="card"><h3>Crafting</h3'];
  let cut=-1;for(const m of markers){const i=h.indexOf(m);if(i>=0&&(cut<0||i<cut))cut=i;}
  return cut>=0?h.slice(0,cut):h;
};

// ---------- Workshop UI ----------
RF.V1028.recipeRow=function(s,id,r){
  const out=RF.V1028.outputId(id,r),it=RF.DATA?.items?.[out],a=RF.V1028.craftAnalysis(s,id),level=s.skills?.[r.skill]?.level||1;
  const state=a.max>0?{label:'READY',cls:'ready'}:level<(r.level||1)?{label:`LV ${r.level}`,cls:''}:a.materialMax<1?{label:'MATS',cls:''}:{label:'PACK',cls:''};
  const req=RF.v93Req?.(s,out)||'';
  return `<button class="row browseRow v1028RecipeRow" data-v1028-recipe="${id}"><div class="icon">${it?.icon||RF.DATA?.skills?.[r.skill]?.icon||'🛠️'}</div><div class="meta"><b>${r.name}</b><small>${RF.DATA?.skills?.[r.skill]?.name||r.skill} Lv ${r.level||1}${req?` • Use: ${req}`:''}</small></div><span class="recipeState ${state.cls}">${state.label}</span><span class="chev">›</span></button>`;
};
RF.V1028.workshopModal=function(s){
  const cat=RF.V1028.category(s),rows=RF.V1028.recipeEntries(s).map(([id,r])=>RF.V1028.recipeRow(s,id,r)).join('');
  const options=RF.V1028.categories.map(x=>`<option value="${x}" ${cat===x?'selected':''}>${RF.V1028.categoryLabel(x)}</option>`).join('');
  return `<div class="modalBack"><div class="modal itemModal v1028WorkshopModal"><div class="itemHero">⚒️</div><span class="eyebrow">GREENVALE • PRODUCTION HUB</span><h2>Village Workshop</h2><div class="itemDesc">Use the village forge, benches and mixing table for Smithing, Crafting and Herblore. Materials are drawn from your Pack first, then Greenvale Bank.</div><label class="filterLabel">Category<select data-v1028-workshop-filter>${options}</select></label><div class="list v1028RecipeList">${rows||'<div class="sub">No workshop recipes in this category.</div>'}</div><div class="notice" style="margin-top:12px">🍳 Cooking remains separate: use an active campfire or your cottage kitchen.</div><div class="choices"><button class="choice" data-v1028-workshop-close><b>Leave Workshop</b></button></div></div></div>`;
};
RF.V1028.openWorkshop=function(){
  const s=RF.state;if(!RF.V1028.atWorkshop(s))return RF.V1028.workshopRequired();
  if(s.combat||s.activity||RF.actionGame)return;
  RF.UI.modal={type:'v1028Workshop'};RF.UI.render(s);
};
RF.V1028.openRecipe=function(id){
  const s=RF.state;if(!RF.V1028.atWorkshop(s)||!RF.V1028.isWorkshopRecipe(id))return RF.V1028.workshopRequired();
  RF.UI.modal={type:'recipeDetail',id,v1028FromWorkshop:true};RF.UI.render(s);
};
RF.V1028.workshopSection=function(s){
  if(s.location!=='greenvale')return'';
  const entries=Object.entries(RF.DATA?.recipes||{}).filter(([,r])=>r?.skill!=='cooking');
  const ready=entries.filter(([id])=>RF.V1028.craftAnalysis(s,id).max>0).length,busy=s.activity||s.combat||RF.actionGame;
  return `<section class="card v1028WorkshopSection"><h3>⚒️ Village Workshop</h3><div class="sub">Greenvale's shared forge, benches and mixing table. All workshop production is done here.</div><button class="action primary v1028WorkshopButton" data-v1028-open-workshop ${busy?'disabled':''}><span class="emoji">🛠️</span><b>Enter Village Workshop</b><small>Smithing • Crafting • Herblore • ${ready}/${entries.length} recipes ready</small></button></section>`;
};

const v1028WorldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){
  let h=v1028WorldBase(s);if(s.location!=='greenvale')return h;
  const workshop=RF.V1028.workshopSection(s),bank='<section class="card v1014BankSection">',travel='<section class="card"><h3>Travel</h3>';
  if(h.includes(bank))return h.replace(bank,workshop+bank);
  if(h.includes(travel))return h.replace(travel,workshop+travel);
  return h+workshop;
};

const v1028ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v1028Workshop')return RF.V1028.workshopModal(s);
  if(m?.type==='recipeDetail'&&m.v1028FromWorkshop){
    let h=v1028ModalBase(s);
    h=h.replace(/data-close-recipe/g,'data-v1028-back-workshop');
    return h;
  }
  return v1028ModalBase(s);
};

if(!document.getElementById('rf-v1028-style')){
  const st=document.createElement('style');st.id='rf-v1028-style';st.textContent=`
  .v1028WorkshopSection{overflow:hidden}.v1028WorkshopButton{width:100%;margin-top:10px}.v1028WorkshopModal{max-height:min(82vh,820px);overflow:auto}.v1028WorkshopModal .filterLabel{display:grid;gap:6px;margin:14px 0 10px}.v1028WorkshopModal select{width:100%;min-height:44px}.v1028RecipeList{margin-top:8px}.v1028RecipeRow{text-align:left}
  `;document.head.appendChild(st);
}

const v1028BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v1028BindBase(s||RF.state);
  document.querySelectorAll('[data-v1028-open-workshop]').forEach(b=>b.onclick=()=>RF.V1028.openWorkshop());
  document.querySelectorAll('[data-v1028-workshop-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
  document.querySelectorAll('[data-v1028-workshop-filter]').forEach(sel=>sel.onchange=()=>{const st=RF.state;RF.migrateV1028(st);st.v1028.category=RF.V1028.categories.includes(sel.value)?sel.value:'all';RF.save(st);RF.UI.modal={type:'v1028Workshop'};RF.UI.render(st)});
  document.querySelectorAll('[data-v1028-recipe]').forEach(b=>b.onclick=()=>RF.V1028.openRecipe(b.dataset.v1028Recipe));
  document.querySelectorAll('[data-v1028-back-workshop]').forEach(b=>b.onclick=()=>{RF.UI.modal={type:'v1028Workshop'};RF.UI.render(RF.state)});
};

if(RF.state){
  RF.migrateV1028(RF.state);
  if(!RF.state.flags)RF.state.flags={};
  if(!RF.state.flags.v1028Seen){RF.state.flags.v1028Seen=true;RF.log?.(RF.state,'V10.28: Greenvale Village Workshop is now the home of Smithing, Crafting and Herblore production.','important')}
  RF.save?.(RF.state);RF.UI.render(RF.state);
}
})();
