window.RF=window.RF||{};
RF.VERSION='10.56.0';
RF.BUILD={
  version:'10.56.0',
  title:'Overburdened',
  built:'17 Sep 2026 • 15:58 BST',
  buildId:'20260917-1558-bst'
};
RF.V1056=RF.V1056||{};

/* Realmforge V10.56 — Overburdened
   - Pack acquisitions are lossless: new item stacks may temporarily exceed Pack capacity.
   - Being above capacity pauses simulated time and prevents travel until the Pack is sorted.
   - The Pack page shows a prominent over-encumbered warning and exact excess-slot count.
   - Detached Equipment / Tool Belt returns may overflow safely instead of deleting or blocking gear.
   - Existing saves/loadouts migrate in place; nothing valid is unequipped or discarded.
*/

(()=>{
'use strict';
const V=RF.V1056;
V.version='10.56.0';
V.LEGACY_PICKS={master_lockpick:2,fine_lockpick:4,master_picks:8};
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.cap=s=>RF.packCapacity?Math.max(0,+RF.packCapacity(s)||0):Math.max(0,+RF.V82?.PACK_CAP||28);
V.used=s=>RF.packUsed?Math.max(0,+RF.packUsed(s)||0):Object.values(s?.inventory||{}).filter(q=>(+q||0)>0).length;
V.excess=s=>Math.max(0,V.used(s)-V.cap(s));
V.isOver=s=>V.excess(s)>0;
RF.isOverEncumbered=V.isOver;
RF.packExcess=V.excess;

V.syncPauseSnapshots=function(s){
  if(!s)return;
  if(RF.V96){
    if(RF.V96.modalResume){RF.V96.modalResume.speed=0;RF.V96.modalResume.paused=true;RF.V96.modalResume.boostRemaining=0}
    if(RF.V96.selectResume){RF.V96.selectResume.speed=0;RF.V96.selectResume.paused=true;RF.V96.selectResume.boostRemaining=0}
    RF.V96.lastNonZeroSpeed=RF.V96.lastNonZeroSpeed||1;
  }
};
V.enforcePause=function(s,{log=false}={}){
  if(!s||!V.isOver(s))return false;
  const wasMoving=(+s.speed||0)>0||!s.paused;
  s.speed=0;s.paused=true;
  if(s.v8){s.v8.boostUntil=0}
  V.syncPauseSnapshots(s);
  s.v1056=s.v1056||{};
  if(log&&wasMoving&&!s.v1056.pauseLogged){
    RF.log?.(s,`Pack over capacity (${V.used(s)}/${V.cap(s)} slots). Time and travel pause until you free ${V.excess(s)} slot${V.excess(s)===1?'':'s'}.`,'bad');
    s.v1056.pauseLogged=true;
  }
  return true;
};
V.clearResolvedFlag=function(s){
  if(!s)return;
  s.v1056=s.v1056||{};
  if(!V.isOver(s))s.v1056.pauseLogged=false;
};
V.warningText=function(s){
  const used=V.used(s),cap=V.cap(s),ex=V.excess(s);
  return `Your Pack is ${ex} slot${ex===1?'':'s'} over capacity (${used}/${cap}). Time and travel are locked until you bank, drop, sell, use or equip enough items to return to ${cap}/${cap} or lower.`;
};
V.warn=function(s=RF.state,title='Over-encumbered'){
  if(!s)return false;
  V.enforcePause(s);
  RF.UI.modal={type:'message',title,text:V.warningText(s)};
  RF.save?.(s);RF.UI.render(s);return false;
};
V.canPassTime=s=>!V.isOver(s);
RF.canPassTime=V.canPassTime;

// Future migrations can always return invalidated loadout items here. This deliberately
// permits a temporary 31/30-style Pack rather than deleting gear or blocking migration.
V.forceToPack=function(s,id,qty=1,reason='Loadout item returned to Pack'){
  if(!s||!id)return false;
  qty=Math.floor(Number(qty)||0);if(qty<=0)return false;
  s.inventory=s.inventory||{};s.inventory[id]=(s.inventory[id]||0)+qty;
  if(s.collection?.items)s.collection.items[id]=true;
  RF.log?.(s,`${reason}: ${qty} × ${RF.DATA.items?.[id]?.name||id}.`,'important');
  V.enforcePause(s,{log:true});
  return true;
};
RF.forceLoadoutItemToPack=V.forceToPack;

// Lossless item intake. V8.2 used to bank or discard brand-new overflow stacks; from V10.56
// every legitimate acquisition lands in the Pack first and the player gets to sort it out.
RF.addItem=function(s,id,q=1){
  if(!s||!id)return false;
  q=Math.floor(Number(q)||0);if(q<=0)return false;
  if(V.LEGACY_PICKS[id]){q*=V.LEGACY_PICKS[id];id='lockpick'}
  s.inventory=s.inventory||{};
  s.inventory[id]=(s.inventory[id]||0)+q;
  if(s.collection?.items)s.collection.items[id]=true;
  V.enforcePause(s,{log:true});
  return true;
};

// Detached loadout returns/swaps must never destroy an item because the Pack happens to be full.
if(RF.V1053){
  RF.V1053.addPackOne=function(s,id){return V.forceToPack(s,id,1,'Loadout item returned to Pack')};
  RF.V1053.canSwap=function(s,newId){return Math.max(0,Number(s?.inventory?.[newId])||0)>0};
}

// Active gathering/crafting and market purchases may create overflow too. The penalty is the
// resulting time lock, not disappearance of the reward.
if(RF.V1022)RF.V1022.canReceiveGather=()=>true;
V.craftAnalysis=function(s,id){
  const r=RF.DATA.recipes?.[id];
  if(!r)return {max:0,blockers:['Recipe data is unavailable.'],materialMax:0};
  const blockers=[];
  const level=s.skills?.[r.skill]?.level||1;
  if(level<r.level)blockers.push(`Requires ${RF.DATA.skills?.[r.skill]?.name||r.skill} Lv ${r.level} (you are Lv ${level}).`);
  let materialMax=Infinity;
  for(const [itemId,qty] of Object.entries(r.inputs||{})){
    const have=RF.V1019?.craftCount?RF.V1019.craftCount(s,itemId):Math.max(0,+s.inventory?.[itemId]||0);
    materialMax=Math.min(materialMax,Math.floor(have/qty));
    if(have<qty){
      const pack=Math.max(0,+s.inventory?.[itemId]||0),bank=RF.V1019?.bankCount?RF.V1019.bankCount(s,itemId):0;
      const where=RF.V1019?.canUseBank?.(s)?`pack ${pack} + bank ${bank}`:`pack ${pack}`;
      blockers.push(`Need ${qty} × ${RF.DATA.items?.[itemId]?.name||itemId} (you have ${have}: ${where}).`);
    }
  }
  if(!Number.isFinite(materialMax))materialMax=0;
  materialMax=Math.max(0,materialMax);
  if(blockers.length)return {max:0,blockers,materialMax};
  return {max:materialMax,blockers:[],materialMax};
};
if(RF.V1019)RF.V1019.craftAnalysis=V.craftAnalysis;
if(RF.V1015){RF.V1015.craftAnalysis=V.craftAnalysis;RF.V1015.recipeState=function(s,id,r){const a=V.craftAnalysis(s,id),lvl=s.skills?.[r.skill]?.level||1;if(lvl<r.level)return {label:`LV ${r.level}`,ready:false};if(a.materialMax<1)return {label:'MATS',ready:false};return {label:'READY',ready:true}}}
RF.v9MaxCraft=function(s,id){return V.craftAnalysis(s,id).max};
RF.v9MaxBuy=function(s,id,price){
  const it=RF.DATA.items?.[id];if(!it)return 0;
  return Math.max(0,Math.floor((s.gold||0)/Math.max(1,price||1)));
};
if(RF.V1054){
  RF.V1054.buyMax=function(s,loc,id){
    const rec=RF.V1054.ensureStock(s,loc),stock=Math.max(0,Number(rec?.stock?.[id])||0),price=RF.V1054.buyPrice(s,loc,id);
    if(stock<1||price<1)return 0;
    return Math.min(stock,Math.max(0,Math.floor((s.gold||0)/price)));
  };
}

// Time cannot move while burdened. Returning false lets newer callers detect the block while
// older callers simply receive a harmless no-op instead of advancing the world clock.
const advanceBase=RF.advanceWorld;
RF.advanceWorld=function(minutes){
  const s=RF.state;
  if(s&&V.isOver(s)){V.enforcePause(s);return false}
  return advanceBase.apply(this,arguments);
};

const speedBase=RF.setSpeed;
RF.setSpeed=function(v){
  const s=RF.state;
  if(s&&+v>0&&V.isOver(s))return V.warn(s);
  const out=speedBase.apply(this,arguments);V.clearResolvedFlag(RF.state);return out;
};

const travelBase=RF.travel;
RF.travel=function(){
  const s=RF.state;
  if(s&&V.isOver(s))return V.warn(s,'Too burdened to travel');
  return travelBase.apply(this,arguments);
};

const startActivityBase=RF.startActivity;
RF.startActivity=function(type){
  const s=RF.state;
  if(s&&V.isOver(s))return V.warn(s,type==='travel'?'Too burdened to travel':'Pack must be sorted first');
  return startActivityBase.apply(this,arguments);
};

// Explicit long rests should not grant free recovery when advanceWorld is blocked.
if(typeof RF.restAtHome==='function'){
  const restHomeBase=RF.restAtHome;
  RF.restAtHome=function(){if(V.isOver(RF.state))return V.warn(RF.state,'Too burdened to rest');return restHomeBase.apply(this,arguments)};
}
if(typeof RF.v10RestUntil==='function'){
  const restInnBase=RF.v10RestUntil;
  RF.v10RestUntil=function(){if(V.isOver(RF.state))return V.warn(RF.state,'Too burdened to rest');return restInnBase.apply(this,arguments)};
}

// Time-costing active minigames also respect the lock. Pack-management actions, combat,
// dialogue and ordinary UI remain available so the player can solve the overload.
V.guardStart=function(name,fn){if(typeof fn!=='function')return fn;return function(){if(V.isOver(RF.state))return V.warn(RF.state,'Pack must be sorted first');return fn.apply(this,arguments)}};
if(typeof RF.v9StartCraftQty==='function')RF.v9StartCraftQty=V.guardStart('craft',RF.v9StartCraftQty);
if(typeof RF.startExcavation==='function')RF.startExcavation=V.guardStart('excavation',RF.startExcavation);
if(typeof RF.startPotionLab==='function')RF.startPotionLab=V.guardStart('herblore',RF.startPotionLab);
if(typeof RF.cookAtFire==='function')RF.cookAtFire=V.guardStart('cooking',RF.cookAtFire);
if(RF.V1024?.startHomeCook)RF.V1024.startHomeCook=V.guardStart('cooking',RF.V1024.startHomeCook);
if(typeof RF.lightFire==='function')RF.lightFire=V.guardStart('firemaking',RF.lightFire);
if(typeof RF.startLockpick==='function')RF.startLockpick=V.guardStart('lockpicking',RF.startLockpick);
if(typeof RF.startPickpocket==='function')RF.startPickpocket=V.guardStart('pickpocket',RF.startPickpocket);
if(typeof RF.researchEnemy==='function')RF.researchEnemy=V.guardStart('research',RF.researchEnemy);

// If road loot/event rewards make the Pack overflow, keep the journey record paused but hide the
// travel overlay so the player can actually open Pack, drop/use items, or use a bank at the origin.
if(RF.V1017?.mountOverlay){
  const overlayBase=RF.V1017.mountOverlay.bind(RF.V1017);
  RF.V1017.mountOverlay=function(s){if(V.isOver(s)){V.enforcePause(s);return}return overlayBase(s)};
}

V.migrate=function(s){
  if(!s)return s;
  s.v1056=s.v1056||{};s.inventory=s.inventory||{};
  // Keep valid existing Equipment/Tool Belt loadouts exactly where they are. V10.53 remains the
  // owner of detached-loadout migration; we only add overflow-safe return semantics from now on.
  if(RF.V1053?.migrate)RF.V1053.migrate(s);
  s.version='10.56.0';
  V.enforcePause(s,{log:false});V.clearResolvedFlag(s);
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.56.0';
  const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s));
  if(RF.V95.loadSlot){
    const slotBase=RF.V95.loadSlot.bind(RF.V95);
    RF.V95.loadSlot=function(id){const ok=slotBase(id);if(ok&&RF.state){V.migrate(RF.state);RF.save?.(RF.state);RF.UI.render(RF.state)}return ok};
  }
}

// Pack warning + count treatment.
const inventoryBase=RF.UI.inventory.bind(RF.UI);
RF.UI.inventory=function(s){
  let h=inventoryBase(s),used=V.used(s),cap=V.cap(s),ex=V.excess(s);
  if(!ex)return h;
  const warning=`<div class="v1056OverWarning"><div class="v1056WarnIcon">⚠️</div><div><b>OVER-ENCUMBERED • +${ex} SLOT${ex===1?'':'S'}</b><span>${used}/${cap} Pack slots. Time and travel are paused until you bank, drop, sell, use or equip enough items.</span></div></div>`;
  h=h.replace(/(<div class="v1046CatGrid"[^>]*>)/,warning+'$1');
  h=h.replace('packCount full','packCount full v1056OverCount');
  return h;
};

// Give the top time controls a visibly locked state while still allowing taps to explain why.
const topBase=RF.UI.top?.bind(RF.UI);
if(topBase)RF.UI.top=function(s){
  let h=topBase(s);if(!V.isOver(s))return h;
  return h.replace(/class="speed ([^"]*)" data-speed="([12])"/g,(m,cls,v)=>`class="speed ${cls} v1056TimeLocked" data-speed="${v}" aria-disabled="true" title="Free Pack space to resume time"`);
};

// Final render guard catches older systems that restore a pre-combat/pre-modal speed after loot.
const renderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){if(s)V.enforcePause(s,{log:false});const out=renderBase(s);if(s&&!V.isOver(s))V.clearResolvedFlag(s);return out};

const st=document.createElement('style');st.id='v1056-overburdened-style';st.textContent=`
.v1056OverWarning{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px;align-items:center;padding:11px 12px;border:1px solid rgba(207,91,73,.62);border-radius:15px;background:linear-gradient(180deg,rgba(91,31,24,.46),rgba(47,19,16,.58));box-shadow:inset 0 1px rgba(255,255,255,.035)}
.v1056WarnIcon{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:rgba(155,54,42,.28);font-size:21px}.v1056OverWarning b{display:block;color:#f2b49f;font-size:12px;letter-spacing:.06em}.v1056OverWarning span{display:block;margin-top:3px;color:#d7b9ae;font-size:10.5px;line-height:1.35}
.v1056OverCount{color:#ef9e89!important}.speed.v1056TimeLocked{opacity:.42!important;border-color:rgba(183,88,70,.35)!important;color:#c99d94!important;filter:saturate(.55)}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
