window.RF=window.RF||{};
RF.VERSION='10.24.0';

/* Realmforge V10.24 — Hearth & Home
   - Food cooking is station-bound: active campfire, or the owned Greenvale cottage kitchen.
   - Greenvale Home becomes a dedicated World section above Bank with Home / Cook tabs.
   - Greenvale's generic Rest action is explicitly Rest at Inn.
   - Sleeping at home fully restores Health, Stamina and Energy and preserves Well Rested.
*/

(function(){
'use strict';
const RF=window.RF;if(!RF)return;
RF.V1024=RF.V1024||{};
RF.V1024.version='10.24.0';

// Venison Stew predates camp cooking. Move it into the same active cooking ecosystem so
// every food recipe follows the campfire/home-kitchen rule rather than the generic bench.
if(RF.DATA?.items?.venison_stew && RF.DATA?.campRecipes && !RF.DATA.campRecipes.venison_stew){
  RF.DATA.campRecipes.venison_stew={
    name:'Venison Stew',icon:'🥘',level:4,input:'raw_meat',qty:2,output:'venison_stew',xp:52,time:13,
    desc:'A hearty stew of meat and Greenleaf.',extra:{herb:1}
  };
}

RF.V1024.isFoodRecipe=function(id){return RF.DATA?.recipes?.[id]?.skill==='cooking';};
RF.V1024.homeAvailable=function(s){return !!s&&s.location==='greenvale'&&!!s.home?.owned;};
RF.V1024.homeTab=function(s){return s?.v1024?.homeTab==='cook'?'cook':'home';};
RF.V1024.recipeNeeds=function(r){
  const out={};if(!r)return out;
  if(r.input)out[r.input]=(out[r.input]||0)+Math.max(1,Math.floor(Number(r.qty)||1));
  Object.entries(r.extra||{}).forEach(([id,q])=>out[id]=(out[id]||0)+Math.max(0,Math.floor(Number(q)||0)));
  return out;
};
RF.V1024.count=function(s,id,source='camp'){
  const pack=Math.max(0,Number(s?.inventory?.[id])||0);
  if(source==='home'&&RF.V1024.homeAvailable(s))return pack+Math.max(0,Number(s?.bank?.[id])||0);
  return pack;
};
RF.V1024.hasIngredients=function(s,r,source='camp'){
  return Object.entries(RF.V1024.recipeNeeds(r)).every(([id,q])=>RF.V1024.count(s,id,source)>=q);
};
RF.V1024.takeHomeItem=function(s,id,qty){
  qty=Math.max(0,Math.floor(Number(qty)||0));if(!qty)return true;
  if(RF.V1024.count(s,id,'home')<qty)return false;
  // Reuse V10.19's Pack-first Greenvale material logic where available.
  if(RF.V1019?.takeCraftItem)return RF.V1019.takeCraftItem(s,id,qty);
  const pack=Math.max(0,Number(s.inventory?.[id])||0),fromPack=Math.min(pack,qty);
  if(fromPack)RF.takeItem(s,id,fromPack);
  const rem=qty-fromPack;
  if(rem){s.bank=s.bank||{};if((s.bank[id]||0)<rem)return false;s.bank[id]-=rem;if(s.bank[id]<=0)delete s.bank[id];}
  return true;
};
RF.V1024.takeHomeIngredients=function(s,r){
  const needs=RF.V1024.recipeNeeds(r);if(!RF.V1024.hasIngredients(s,r,'home'))return false;
  Object.entries(needs).forEach(([id,q])=>RF.V1024.takeHomeItem(s,id,q));return true;
};

RF.migrateV1024=function(s){
  if(!s)return s;s.version='10.24.0';s.flags=s.flags||{};s.v1024=s.v1024||{};
  if(!['home','cook'].includes(s.v1024.homeTab))s.v1024.homeTab='home';
  return s;
};
const v1024New=RF.newGame;RF.newGame=function(...a){return RF.migrateV1024(v1024New(...a))};
const v1024Load=RF.load;RF.load=function(){return RF.migrateV1024(v1024Load())};
const v1024Import=RF.importSave;RF.importSave=function(x){return RF.migrateV1024(v1024Import(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.24.0';
  const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.migrateV1024(oldMig(s));
}

// ---------- Cooking access ----------
RF.V1024.stationMessage=function(){
  const s=RF.state;
  RF.UI.modal={type:'message',title:'You Need a Cooking Fire',text:RF.V1024.homeAvailable(s)?'Food is cooked at an active campfire or in the Cook tab of your Greenvale home.':'Food is cooked at an active campfire. Owning the Greenvale cottage also unlocks a permanent home kitchen.'};
  RF.UI.render(s);
};

// Generic Crafting must no longer start Cooking recipes, even through an old/stale UI.
const v1024CraftBase=RF.craft;
RF.craft=function(id){if(RF.V1024.isFoodRecipe(id))return RF.V1024.stationMessage();return v1024CraftBase?.apply(this,arguments)};
const v1024BatchBase=RF.v9StartCraftQty;
if(typeof v1024BatchBase==='function')RF.v9StartCraftQty=function(id,qty){if(RF.V1024.isFoodRecipe(id))return RF.V1024.stationMessage();return v1024BatchBase.apply(this,arguments)};
const v1024OpenRecipeBase=RF.openRecipeDetail;
if(typeof v1024OpenRecipeBase==='function')RF.openRecipeDetail=function(id){if(RF.V1024.isFoodRecipe(id))return RF.V1024.stationMessage();return v1024OpenRecipeBase.apply(this,arguments)};

// Keep analysis truthful for callers outside the main Skills page.
const v1024AnalysisBase=RF.V1019?.craftAnalysis||RF.V1015?.craftAnalysis;
RF.V1024.craftAnalysis=function(s,id){
  if(RF.V1024.isFoodRecipe(id))return {max:0,materialMax:0,blockers:['Cooking requires an active campfire or your Greenvale home kitchen.']};
  return v1024AnalysisBase?v1024AnalysisBase(s,id):{max:0,materialMax:0,blockers:['Crafting unavailable.']};
};
if(RF.V1019)RF.V1019.craftAnalysis=RF.V1024.craftAnalysis;
if(RF.V1015)RF.V1015.craftAnalysis=RF.V1024.craftAnalysis;
RF.v9MaxCraft=function(s,id){return RF.V1024.craftAnalysis(s,id).max||0};

// Remove Cooking recipes from the general Crafting list. They remain visible in the Database.
const v1024SkillsBase=RF.UI.skills.bind(RF.UI);
RF.UI.skills=function(s){
  let h=v1024SkillsBase(s);
  Object.entries(RF.DATA.recipes||{}).filter(([,r])=>r.skill==='cooking').forEach(([id])=>{
    const esc=String(id).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    h=h.replace(new RegExp(`<button class="row browseRow" data-recipe-detail="${esc}">[\\s\\S]*?<\\/button>`,'g'),'');
  });
  const marker='<div class="sub">Tap a recipe to inspect ingredients, crafting skill and use requirements.</div>';
  if(h.includes(marker))h=h.replace(marker,'<div class="sub">Tap a recipe to inspect ingredients, crafting skill and use requirements.</div><div class="notice" style="margin-top:8px">🍳 Cooking is separate from bench crafting: use an active campfire, or the Cook tab at your Greenvale home.</div>');
  return h;
};

// Home cooking uses the existing timing minigame, but a Greenvale kitchen can draw ingredients
// from Pack + Bank, Pack first. Campfire cooking remains Pack-only and otherwise unchanged.
RF.V1024.startHomeCook=function(id){
  const s=RF.state,r=RF.DATA.campRecipes?.[id];if(!RF.V1024.homeAvailable(s)||!r||(r.skill&&r.skill!=='cooking'))return;
  if(s.combat||s.activity||RF.actionGame)return;
  const skill=r.skill||'cooking',level=s.skills?.[skill]?.level||1;
  if(level<(r.level||1)||!RF.V1024.hasIngredients(s,r,'home'))return;
  const resume=s.speed;s.speed=0;
  RF.actionGame={type:'cooking',recipe:id,start:Date.now(),target:48+Math.random()*30,width:20+Math.min(15,(level-(r.level||1))*1.5),before:RF.activitySnapshot(s),resumeSpeed:resume,message:'Your cottage kitchen is warm. Tap TURN when the marker crosses the sweet spot.',v1024Source:'home'};
  RF.UI.modal={type:'v6Action'};RF.startCookTicker?.();
};

const v1024TurnCookBase=RF.turnCook;
RF.turnCook=function(){
  const s=RF.state,g=RF.actionGame;
  if(!g||g.type!=='cooking'||g.v1024Source!=='home')return v1024TurnCookBase?.apply(this,arguments);
  RF.clearActionTimer?.();
  const r=RF.DATA.campRecipes?.[g.recipe];if(!r)return RF.closeActionGame?.();
  const skill=r.skill||'cooking';
  if(!RF.V1024.homeAvailable(s)||!RF.V1024.hasIngredients(s,r,'home')){
    g.message='⚠️ You no longer have the ingredients needed for this meal.';RF.startCookTicker?.();RF.UI.render(s);return;
  }
  const energy=RF.v10EnergyCost?RF.v10EnergyCost('cooking'):2;
  if((s.player?.energy||0)<energy){g.message=`⚡ Too exhausted. Turning this meal needs ${energy} Energy.`;RF.startCookTicker?.();RF.UI.render(s);return;}
  if(RF.v10SpendEnergy&&!RF.v10SpendEnergy(s,energy)){RF.startCookTicker?.();return;}
  RF.V1024.takeHomeIngredients(s,r);
  const pos=RF.cookPosition(g),dist=Math.abs(pos-g.target),perfect=dist<=g.width*.22,good=dist<=g.width*.5;
  const success=good||Math.random()<.45+Math.min(.45,((s.skills?.[skill]?.level||1)-(r.level||1))*.04);
  if(success){
    RF.addItem(s,r.output,1);const xp=Math.round((r.xp||0)*(perfect?1.5:good?1.15:1));RF.addXp(s,skill,xp);
    s.stats.mealsCooked=(s.stats.mealsCooked||0)+1;if(perfect)s.stats.perfectCooks=(s.stats.perfectCooks||0)+1;
    g.message=perfect?'✨ PERFECT TURN — a proper home-cooked meal.':'🍳 Cooked successfully.';
  }else{
    RF.addXp(s,skill,Math.ceil((r.xp||0)*.3));g.message='🔥 BUTCHERED — the food burns and the ingredients are lost.';s.stats.skillMishaps=(s.stats.skillMishaps||0)+1;
  }
  RF.advanceWorld(r.time||1);RF.questCheck?.(s);RF.save(s);
  const before=g.before;s.speed=g.resumeSpeed??s.speed;RF.actionGame=null;
  let pop=RF.makeResult?.(s,before,perfect?'Perfect Home Cooking':success?r.name:'Burnt Meal',success?'🍳':'🔥');
  if(!pop)pop={type:'message',title:success?'Meal Ready':'Burnt',text:g.message};
  RF.UI.modal=pop;RF.UI.render(s);
};

// ---------- Home resting ----------
RF.restAtHome=function(){
  const s=RF.state;if(!RF.V1024.homeAvailable(s)||s.combat||s.activity||RF.actionGame)return;
  RF.advanceWorld(8*60);
  s.player.hp=s.player.maxHp;s.player.stamina=s.player.maxStamina;s.player.energy=s.player.maxEnergy||RF.V1022?.maxEnergy?.(s.player.level)||100;
  if(s.v1023)s.v1023.energyRecoveryMinutes=0;
  s.home.wellRestedBattles=3;
  RF.log(s,'You sleep in your own bed. Health, Stamina and Energy are fully restored. Well Rested: +8% damage for the next 3 victories.','good');
  RF.save(s);
  RF.UI.modal={type:'message',title:'Rested at Home',text:'Eight quiet hours in your own bed fully restore Health, Stamina and Energy. Well Rested grants +8% damage for your next 3 victories.'};
  RF.UI.render(s);
};

// ---------- Greenvale Home panel ----------
RF.V1024.homePanel=function(s){
  if(s.location!=='greenvale')return'';
  if(!s.home?.owned){
    return `<section class="card v1024HomeSection"><h3>🏠 Home</h3><div class="sub">A small cottage is for sale on the western lane.</div><button class="action" data-buy-home ${s.gold>=450?'':'disabled'} style="width:100%;margin-top:8px"><span class="emoji">🔑</span><b>Buy Cottage • 450g</b><small>Permanent bed, home kitchen and Well Rested bonus</small></button></section>`;
  }
  const tab=RF.V1024.homeTab(s),busy=s.activity||s.combat||RF.actionGame;
  const tabs=`<div class="v1024HomeTabs"><button class="${tab==='home'?'active':''}" data-v1024-home-tab="home">🏠 Home</button><button class="${tab==='cook'?'active':''}" data-v1024-home-tab="cook">🍳 Cook</button></div>`;
  if(tab==='home'){
    return `<section class="card v1024HomeSection"><h3>🏠 Greenvale Cottage</h3>${tabs}<div class="sub">Your cottage waits on the western lane. Well Rested victories remaining: ${s.home.wellRestedBattles||0}</div><button class="action primary v1024Wide" data-home-rest ${busy?'disabled':''}><span class="emoji">🛏️</span><b>Sleep at Home</b><small>8 hours • full Health, Stamina & Energy • Well Rested</small></button></section>`;
  }
  const recipes=Object.entries(RF.DATA.campRecipes||{}).filter(([,r])=>(r.skill||'cooking')==='cooking').sort(([,a],[,b])=>(a.level||1)-(b.level||1)||String(a.name).localeCompare(String(b.name))).map(([id,r])=>{
    const needs=RF.V1024.recipeNeeds(r),level=s.skills?.cooking?.level||1,lvOk=level>=(r.level||1),matOk=RF.V1024.hasIngredients(s,r,'home');
    const ing=Object.entries(needs).map(([x,q])=>{const p=s.inventory?.[x]||0,b=s.bank?.[x]||0;return `${q}× ${RF.DATA.items?.[x]?.name||x} (${p}+${b})`}).join(' • ');
    const status=!lvOk?`Need Cooking Lv ${r.level}`:!matOk?'Missing ingredients':'Ready';
    return `<button class="choice v1024CookRow" data-v1024-home-cook="${id}" ${(!lvOk||!matOk||busy)?'disabled':''}><b>${r.icon||'🍳'} ${r.name}</b><small>Cooking Lv ${r.level||1} • ${ing}<br>${status}</small></button>`;
  }).join('');
  return `<section class="card v1024HomeSection"><h3>🏠 Greenvale Cottage</h3>${tabs}<div class="sub">Cook in your own kitchen without building a campfire. Ingredients may come from Pack + Bank, with Pack used first.</div><div class="choices v1024CookList">${recipes||'<div class="sub">No cooking recipes known.</div>'}</div></section>`;
};

const v1024WorldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){
  let h=v1024WorldBase(s);if(s.location!=='greenvale')return h;
  // Remove the original V4 Home card and reinsert the modern Home section in a stable location.
  h=h.replace(/<section class="card"><h3>🏠 Home<\/h3>[\s\S]*?<\/section>/g,'');
  const home=RF.V1024.homePanel(s),bank='<section class="card v1014BankSection">',travel='<section class="card"><h3>Travel</h3>';
  if(h.includes(bank))h=h.replace(bank,home+bank);
  else if(h.includes(travel))h=h.replace(travel,home+travel);
  else h+=home;
  return h;
};

const v1024ActionButtonBase=RF.UI.actionButton.bind(RF.UI);
RF.UI.actionButton=function(a,s){
  if(a==='rest'&&s?.location==='greenvale')return `<button class="action" data-action="rest" ${s.activity||s.combat?'disabled':''}><span class="emoji">🛏️</span><b>Rest at Inn</b><small>Sleep until tomorrow • full recovery</small></button>`;
  return v1024ActionButtonBase(a,s);
};

if(!document.getElementById('rf-v1024-style')){
  const st=document.createElement('style');st.id='rf-v1024-style';st.textContent=`
  .v1024HomeSection{overflow:hidden}.v1024HomeTabs{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0 12px}.v1024HomeTabs button{min-height:42px;border:1px solid rgba(190,155,91,.28);border-radius:11px;background:#17130f;color:#b9aa91;font:inherit;font-weight:800}.v1024HomeTabs button.active{border-color:#d1aa63;background:#2b2115;color:#f4ddad;box-shadow:inset 0 0 0 1px rgba(234,190,105,.10)}.v1024Wide{width:100%;margin-top:10px}.v1024CookList{margin-top:10px}.v1024CookRow{text-align:left}.v1024CookRow small{line-height:1.35}
  `;document.head.appendChild(st);
}

const v1024BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v1024BindBase(s||RF.state);
  document.querySelectorAll('[data-v1024-home-tab]').forEach(b=>b.onclick=()=>{const st=RF.state;RF.migrateV1024(st);st.v1024.homeTab=b.dataset.v1024HomeTab==='cook'?'cook':'home';RF.save(st);RF.UI.render(st)});
  document.querySelectorAll('[data-v1024-home-cook]').forEach(b=>b.onclick=()=>RF.V1024.startHomeCook(b.dataset.v1024HomeCook));
};

if(RF.state){
  RF.migrateV1024(RF.state);
  if(!RF.state.flags.v1024Seen){RF.state.flags.v1024Seen=true;RF.log(RF.state,'V10.24: cooking now belongs to campfires and the Greenvale home kitchen; home rest fully restores every endurance pool.','important')}
  RF.save(RF.state);RF.UI.render(RF.state);
}
})();
