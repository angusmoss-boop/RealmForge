window.RF = window.RF || {};
RF.VERSION = '8.3.0';

/* Realmforge V8.3 — Deliberate Touch
   - cooldowns use disabled buttons only, with one render on ready
   - smooth one-shot combat impact animation, no screen shake
   - travel watchdog repairs accidental zero-speed soft locks
   - shop and crafting entries open detail/confirmation popups
*/

RF.V83 = RF.V83 || {};
RF.migrateV83=function(s){
  if(!s)return s;
  s.version='8.3.0';
  s.v83=s.v83||{};
  if(s.v83.manualPause==null)s.v83.manualPause=false;
  s.flags=s.flags||{};
  return s;
};
const v83NewGameBase=RF.newGame;RF.newGame=function(...a){return RF.migrateV83(v83NewGameBase(...a));};
const v83LoadBase=RF.load;RF.load=function(){return RF.migrateV83(v83LoadBase());};
const v83ImportBase=RF.importSave;RF.importSave=function(x){return RF.migrateV83(v83ImportBase(x));};
if(RF.state)RF.migrateV83(RF.state);

// ---------- Cooldowns: disabled state only ----------
// No denial shake and no per-tenth-second rerender. One render happens when the cooldown expires.
RF.v83CooldownTimer=null;
RF.v8CooldownMarkup=function(){return '';};
RF.animateDenied=function(){};
RF.cooldownRemaining=function(g){
  if(!g)return 0;
  const rem=(g.v8CooldownUntil||0)-Date.now();
  if(rem<=20){g.v8CooldownUntil=0;return 0;}
  return rem;
};
RF.ensureCooldownTicker=function(){
  if(RF.v83CooldownTimer){clearTimeout(RF.v83CooldownTimer);RF.v83CooldownTimer=null;}
  const s=RF.state;if(!s)return;
  const ends=[];
  if(RF.actionGame?.v8CooldownUntil>Date.now())ends.push(RF.actionGame.v8CooldownUntil);
  if(s.combat?.v8CooldownUntil>Date.now())ends.push(s.combat.v8CooldownUntil);
  if(!ends.length)return;
  const wait=Math.max(25,Math.min(...ends)-Date.now()+30);
  RF.v83CooldownTimer=setTimeout(()=>{
    RF.v83CooldownTimer=null;
    const ss=RF.state;if(!ss)return;
    if(RF.actionGame && (RF.actionGame.v8CooldownUntil||0)<=Date.now()+20)RF.actionGame.v8CooldownUntil=0;
    if(ss.combat && (ss.combat.v8CooldownUntil||0)<=Date.now()+20)ss.combat.v8CooldownUntil=0;
    RF.UI.render(ss);
    const more=(RF.actionGame?.v8CooldownUntil>Date.now())||(ss.combat?.v8CooldownUntil>Date.now());
    if(more)RF.ensureCooldownTicker();
  },wait);
};
RF.actionReady=function(g,key,ms){
  if(!g)return false;
  const now=Date.now();
  if((g.v8CooldownUntil||0)>now+20)return false;
  g.v8CooldownUntil=now+(ms||500);g.v8CooldownMs=ms||500;g.v8CooldownKey=key;
  RF.state.stats.cooldownActions++;RF.ensureCooldownTicker();return true;
};
RF.combatReady=function(){
  const c=RF.state?.combat;if(!c)return false;
  const now=Date.now();
  if((c.v8CooldownUntil||0)>now+20)return false;
  c.v8CooldownUntil=now+2000;c.v8CooldownMs=2000;RF.state.stats.cooldownActions++;RF.ensureCooldownTicker();return true;
};

function v83StripCooldownChrome(h){
  return h
    .replace(/<div class="combatCadence">[\s\S]*?<div class="battleSectionTitle">Choose a move<\/div>/,'<div class="battleSectionTitle">Choose a move</div>')
    .replace(/<div class="actionCooldown"><div[^>]*><\/div><\/div>/g,'')
    .replace(/<div class="cooldownText">[\s\S]*?<\/div>/g,'');
}
function v83DisableDataButton(h,attrs){
  attrs.forEach(attr=>{
    const re=new RegExp(`<button(?![^>]*\\bdisabled\\b)([^>]*${attr}[^>]*)>`,'g');
    h=h.replace(re,'<button disabled$1>');
  });
  return h;
}
const v83V6ModalBase=RF.UI.v6ActionModal?.bind(RF.UI);
if(v83V6ModalBase)RF.UI.v6ActionModal=function(s,g){
  let h=v83StripCooldownChrome(v83V6ModalBase(s,g));
  if(g&&RF.cooldownRemaining(g)>0){
    h=v83DisableDataButton(h,['data-work-tap','data-production-tap','data-hunt-track','data-spark-fire']);
  }
  return h;
};
const v83V7ModalBase=RF.UI.v7ActionModal?.bind(RF.UI);
if(v83V7ModalBase)RF.UI.v7ActionModal=function(s,g){
  let h=v83StripCooldownChrome(v83V7ModalBase(s,g));
  if(g&&RF.cooldownRemaining(g)>0){
    h=v83DisableDataButton(h,['data-set-tumbler','data-stoke-forge','data-hammer-forge','data-excavate','data-dig-tile']);
  }
  return h;
};
const v83CombatPopupBase=RF.UI.combatPopup.bind(RF.UI);
RF.UI.combatPopup=function(s){
  let h=v83StripCooldownChrome(v83CombatPopupBase(s));
  const rem=Math.max(0,(s.combat?.v8CooldownUntil||0)-Date.now());
  if(rem>20){
    h=h.replace(/<button(?![^>]*\bdisabled\b)([^>]*class="abilityBtn [^"]*"[^>]*)>/g,'<button disabled$1>');
    h=h.replace(/<button(?![^>]*\bdisabled\b)([^>]*data-battle-item=[^>]*)>/g,'<button disabled$1>');
    h=h.replace(/<button(?![^>]*\bdisabled\b)([^>]*data-v4-flee[^>]*)>/g,'<button disabled$1>');
  }
  return h;
};

// ---------- Combat motion: one smooth impact, never shake the entire modal ----------
RF.v82CombatShake=function(){};
RF.v83CombatImpact=function(){
  requestAnimationFrame(()=>{
    const el=document.querySelector('.enemyPane');if(!el)return;
    el.classList.remove('combatImpactOnce');void el.offsetWidth;el.classList.add('combatImpactOnce');
  });
};
// V8.2's wrapper calls v82CombatShake after damage. Redirect that hook to our smooth target-only animation.
RF.v82CombatShake=RF.v83CombatImpact;


const v83EnemyTurnBase=RF.enemyBattleTurn;
RF.enemyBattleTurn=function(...args){
  const before=RF.state?.player?.hp;
  const out=v83EnemyTurnBase.apply(RF,args);
  const after=RF.state?.player?.hp;
  if(before!=null&&after!=null&&after<before){
    requestAnimationFrame(()=>{const el=document.querySelector('.playerPane');if(!el)return;el.classList.remove('combatImpactPlayer');void el.offsetWidth;el.classList.add('combatImpactPlayer');});
  }
  return out;
};

// ---------- Travel soft-lock protection ----------
const v83SetSpeedBase=RF.setSpeed;
RF.setSpeed=function(v){
  const s=RF.state;if(s){s.v83=s.v83||{};s.v83.manualPause=(+v===0);if(+v>0)s.v83.manualPause=false;}
  return v83SetSpeedBase(v);
};
const v83TravelBase=RF.travel;
RF.travel=function(id){
  const s=RF.state;if(s){s.v83=s.v83||{};}
  const out=v83TravelBase(id);
  if(s?.activity?.type==='travel' && s.speed===0 && !s.v83.manualPause && !RF.UI.modal && !s.combat && !RF.actionGame){
    s.speed=1;s.paused=false;
  }
  return out;
};
RF.repairTravelIfStalled=function(){
  const s=RF.state;if(!s?.activity||s.activity.type!=='travel')return false;
  if(s.speed===0&&!s.v83?.manualPause&&!RF.UI.modal&&!s.combat&&!RF.actionGame){
    s.speed=1;s.paused=false;RF.log(s,'The journey resumes at 1× after a stalled travel state was cleared.','good');RF.save(s);RF.UI.render(s);return true;
  }
  return false;
};
RF.v83TravelWatch=setInterval(()=>RF.repairTravelIfStalled(),600);

// ---------- Shop browsing: tap row, then confirm ----------
RF.v83ShopStock=function(s){
  if(s.location==='ironridge')return ['bread','potion','iron_ore','coal','steel_bar','steel_sword','steel_helm','smoke_bomb'].filter(id=>RF.DATA.items[id]);
  if(s.location==='reedmere')return ['bread','field_tonic','bait_grubs','lockpick','fine_lockpick','redroot','mooncap','antivenom','river_rod'].filter(id=>RF.DATA.items[id]);
  return RF.DATA.shopStock.concat(s.flags.savedMerchant?['iron_ore','coal']:[]).filter((id,i,a)=>RF.DATA.items[id]&&a.indexOf(id)===i);
};
RF.v83ShopName=function(s){return s.location==='ironridge'?'Ironridge Forge Market':s.location==='reedmere'?'Reedmere Stilt Market':'Greenvale Market';};
RF.UI.shop=function(s){
  const l=RF.DATA.locations[s.location];if(!l?.shop)return `<section class="card"><h2>Shop</h2><div class="notice">There is no permanent shop here. Merchants move through settled roads and towns.</div></section>`;
  const stock=RF.v83ShopStock(s),market=s.world?.market||{food:1,metal:1,wood:1};
  const buyRows=stock.map(id=>{const it=RF.DATA.items[id],price=RF.marketPrice?RF.marketPrice(s,id,true):Math.max(1,it.value||1);return `<button class="row browseRow" data-shop-detail="${id}" data-shop-mode="buy"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>${it.desc||'No description recorded.'}</small></div><span class="qty">${price}g</span><span class="chev">›</span></button>`}).join('');
  const sellRows=Object.entries(s.inventory).filter(([id,q])=>q>0&&RF.DATA.items[id]?.value>0).map(([id,q])=>{const it=RF.DATA.items[id],price=RF.marketPrice?RF.marketPrice(s,id,false):Math.max(1,Math.floor(it.value*.55));return `<button class="row browseRow" data-shop-detail="${id}" data-shop-mode="sell"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>Owned ×${q}</small></div><span class="qty">${price}g</span><span class="chev">›</span></button>`}).join('');
  return `<section class="card"><h2>${RF.v83ShopName(s)}</h2><div class="marketTicker"><span>🍞 Food ×${(+market.food||1).toFixed(2)}</span><span>⚒️ Metal ×${(+market.metal||1).toFixed(2)}</span><span>🪵 Wood ×${(+market.wood||1).toFixed(2)}</span></div><div class="sub">Tap an item to inspect it before buying. No purchases happen from the list itself.</div><div class="list" style="margin-top:10px">${buyRows}</div></section><section class="card"><h3>Sell</h3><div class="sub">Tap something from your pack to review its sale before confirming.</div><div class="list" style="margin-top:10px">${sellRows||'<div class="sub">Nothing saleable in your pack.</div>'}</div></section>`;
};


// Private NPC trade uses the same deliberate inspect-then-confirm pattern.
RF.UI.dialogueShop=function(s,m){
  return `<div class="modalBack"><div class="modal dialogueModal"><div class="dialogueHead"><div class="dialoguePortrait">${m.speaker.icon||'🧑'}</div><div><h2>${m.speaker.name}</h2><div class="sub">Private trade</div></div></div><div class="dialogueText">${m.text}</div><div class="list">${m.stock.map(id=>{let it=RF.DATA.items[id],price=Math.max(1,Math.round(it.value*1.15*(RF.priceFactor?RF.priceFactor(s,id,true):1)));return `<button class="row browseRow" data-dialogue-shop-detail="${id}"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name}</b><small>${it.desc}</small></div><span class="qty">${price}g</span><span class="chev">›</span></button>`}).join('')}</div><button class="quietClose" data-close-dialogue>Thanks, that's all</button></div></div>`;
};

// ---------- Crafting browsing: tap row, then confirm ----------
const v83SkillsBase=RF.UI.skills.bind(RF.UI);
RF.UI.skills=function(s){
  let base=v83SkillsBase(s);
  const marker='<section class="card"><h3>Crafting</h3>';
  const idx=base.indexOf(marker);
  const skillsOnly=idx>=0?base.slice(0,idx):base;
  const rows=Object.entries(RF.DATA.recipes).map(([id,r])=>{
    const outId=Object.keys(r.outputs||{})[0]||id,it=RF.DATA.items[outId]||RF.DATA.items[id],skill=s.skills[r.skill]?.level||1,canLevel=skill>=r.level,canMats=RF.hasItems(s,r.inputs);
    const state=canLevel&&canMats?'READY':!canLevel?`LV ${r.level}`:'MATERIALS';
    return `<button class="row browseRow" data-recipe-detail="${id}"><div class="icon">${it?.icon||'🛠️'}</div><div class="meta"><b>${r.name}</b><small>${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level} • ${Object.entries(r.inputs).map(([x,q])=>`${q}× ${RF.DATA.items[x]?.name||x}`).join(', ')}</small></div><span class="recipeState ${canLevel&&canMats?'ready':''}">${state}</span><span class="chev">›</span></button>`;
  }).join('');
  return `${skillsOnly}<section class="card"><h3>Crafting</h3><div class="sub">Tap a recipe for ingredients, requirements and a deliberate Craft confirmation.</div><div class="list" style="margin-top:10px">${rows}</div></section>`;
};

const v83ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='shopDetail'){
    const id=m.id,it=RF.DATA.items[id];if(!it)return'';
    const buy=m.mode==='buy',price=RF.marketPrice?RF.marketPrice(s,id,buy):Math.max(1,buy?it.value:Math.floor((it.value||1)*.55));
    const owned=s.inventory[id]||0,equipped=RF.isEquipped(s,id),sellable=Math.max(0,owned-(equipped?1:0)),canBuy=s.gold>=price&&((owned>0)||RF.packUsed(s)<RF.V82.PACK_CAP||RF.isBankTown(s));
    let stats=[];if(it.damage)stats.push(`⚔️ ${it.damage} damage`);if(it.armor)stats.push(`🛡️ ${it.armor} armour`);if(it.heal)stats.push(`❤️ ${it.heal} healing`);if(it.value!=null)stats.push(`🪙 Base value ${it.value}g`);
    return `<div class="modalBack"><div class="modal itemModal"><div class="itemHero">${it.icon}</div><span class="eyebrow">${buy?'BUY':'SELL'} • ${it.rarity||it.type||'ITEM'}</span><h2>${it.name}</h2><div class="itemDesc">${it.desc||'No description recorded.'}</div>${stats.length?`<div class="itemStats">${stats.map(x=>`<span>${x}</span>`).join('')}</div>`:''}<div class="tradeSummary"><span>${buy?'Price':'Offer'} <b>${price}g</b></span><span>Owned <b>×${owned}</b></span><span>Gold <b>${s.gold}g</b></span></div><div class="choices">${buy?`<button class="choice" data-confirm-buy="${id}" data-price="${price}" ${canBuy?'':'disabled'}><b>${canBuy?`Buy 1 • ${price}g`:'Cannot buy'}</b><small>${s.gold<price?'Not enough gold.':(!owned&&RF.packUsed(s)>=RF.V82.PACK_CAP&&!RF.isBankTown(s))?'Pack is full.':''}</small></button>`:`<button class="choice" data-confirm-sell="${id}" data-price="${price}" ${sellable>0?'':'disabled'}><b>Sell 1 • ${price}g</b><small>${sellable>0?`${sellable} saleable${equipped?' • equipped copy protected':''}.`:equipped?'Only copy is equipped.':'None carried.'}</small></button>`}<button class="choice" data-close-trade><b>Close</b></button></div></div></div>`;
  }
  if(m?.type==='dialogueTradeDetail'){
    const id=m.id,it=RF.DATA.items[id];if(!it)return'';
    const price=Math.max(1,Math.round(it.value*1.15*(RF.priceFactor?RF.priceFactor(s,id,true):1))),owned=s.inventory[id]||0;
    const can=s.gold>=price&&((owned>0)||RF.packUsed(s)<RF.V82.PACK_CAP||RF.isBankTown(s));
    return `<div class="modalBack"><div class="modal itemModal"><div class="itemHero">${it.icon}</div><span class="eyebrow">PRIVATE TRADE • ${m.speaker.name}</span><h2>${it.name}</h2><div class="itemDesc">${it.desc||'No description recorded.'}</div><div class="tradeSummary"><span>Price <b>${price}g</b></span><span>Owned <b>×${owned}</b></span><span>Gold <b>${s.gold}g</b></span></div><div class="choices"><button class="choice" data-confirm-dialogue-buy="${id}" data-price="${price}" ${can?'':'disabled'}><b>${can?`Buy 1 • ${price}g`:'Cannot buy'}</b></button><button class="choice" data-back-dialogue-shop><b>Back to ${m.speaker.name}'s stock</b></button></div></div></div>`;
  }
  if(m?.type==='recipeDetail'){
    const id=m.id,r=RF.DATA.recipes[id];if(!r)return'';
    const out=Object.entries(r.outputs||{}),outId=out[0]?.[0],it=RF.DATA.items[outId]||RF.DATA.items[id],level=s.skills[r.skill]?.level||1,canLevel=level>=r.level,canMats=RF.hasItems(s,r.inputs),can=canLevel&&canMats&&!s.activity&&!s.combat;
    const inputs=Object.entries(r.inputs).map(([x,q])=>{const have=s.inventory[x]||0;return `<div class="ingredientRow ${have>=q?'ok':'missing'}"><span>${RF.DATA.items[x]?.icon||'•'} ${RF.DATA.items[x]?.name||x}</span><b>${have}/${q}</b></div>`}).join('');
    const outputs=out.map(([x,q])=>`${q}× ${RF.DATA.items[x]?.name||x}`).join(', ');
    return `<div class="modalBack"><div class="modal itemModal"><div class="itemHero">${it?.icon||'🛠️'}</div><span class="eyebrow">${RF.DATA.skills[r.skill]?.name||r.skill} • RECIPE</span><h2>${r.name}</h2><div class="itemDesc">Produces ${outputs}. Completing it grants ${r.xp} ${RF.DATA.skills[r.skill]?.name||r.skill} XP.</div><div class="requirement ${canLevel?'met':'unmet'}">${canLevel?'✓':'🔒'} Requires ${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level} • You: ${level}</div><div class="ingredientList">${inputs}</div><div class="choices"><button class="choice" data-confirm-craft="${id}" ${can?'':'disabled'}><b>${can?'Craft':'Requirements not met'}</b><small>${!canLevel?'Your skill level is too low.':!canMats?'You are missing materials.':s.activity||s.combat?'Finish your current activity first.':''}</small></button><button class="choice" data-close-recipe><b>Close</b></button></div></div></div>`;
  }
  return v83ModalBase(s);
};

RF.openShopDetail=function(id,mode){RF.UI.modal={type:'shopDetail',id,mode};RF.UI.render(RF.state);};
RF.openRecipeDetail=function(id){RF.UI.modal={type:'recipeDetail',id};RF.UI.render(RF.state);};
const v83BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  v83BindBase(s);
  document.querySelectorAll('[data-shop-detail]').forEach(b=>b.onclick=()=>RF.openShopDetail(b.dataset.shopDetail,b.dataset.shopMode));
  document.querySelectorAll('[data-dialogue-shop-detail]').forEach(b=>b.onclick=()=>{const m=RF.UI.modal;if(m?.type!=='dialogueShop')return;RF.UI.modal={type:'dialogueTradeDetail',id:b.dataset.dialogueShopDetail,speaker:m.speaker,stock:m.stock,text:m.text};RF.UI.render(RF.state);});
  document.querySelectorAll('[data-confirm-dialogue-buy]').forEach(b=>b.onclick=()=>{const m=RF.UI.modal,id=b.dataset.confirmDialogueBuy,p=+b.dataset.price;if(m?.type!=='dialogueTradeDetail'||RF.state.gold<p)return;RF.state.gold-=p;RF.addItem(RF.state,id,1);RF.addXp(RF.state,'trading',5);RF.save(RF.state);RF.UI.modal={...m};RF.UI.render(RF.state);});
  document.querySelector('[data-back-dialogue-shop]')?.addEventListener('click',()=>{const m=RF.UI.modal;if(m?.type==='dialogueTradeDetail')RF.UI.modal={type:'dialogueShop',speaker:m.speaker,stock:m.stock,text:m.text};RF.UI.render(RF.state);});
  document.querySelectorAll('[data-recipe-detail]').forEach(b=>b.onclick=()=>RF.openRecipeDetail(b.dataset.recipeDetail));
  document.querySelectorAll('[data-confirm-buy]').forEach(b=>b.onclick=()=>{const id=b.dataset.confirmBuy,p=+b.dataset.price;RF.buy(id,p);RF.UI.modal={type:'shopDetail',id,mode:'buy'};RF.UI.render(RF.state);});
  document.querySelectorAll('[data-confirm-sell]').forEach(b=>b.onclick=()=>{const id=b.dataset.confirmSell,p=+b.dataset.price;RF.sell(id,p);if((RF.state.inventory[id]||0)>0)RF.UI.modal={type:'shopDetail',id,mode:'sell'};else RF.UI.modal=null;RF.UI.render(RF.state);});
  document.querySelector('[data-close-trade]')?.addEventListener('click',()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
  document.querySelectorAll('[data-confirm-craft]').forEach(b=>b.onclick=()=>{const id=b.dataset.confirmCraft;RF.UI.modal=null;RF.craft(id);RF.UI.render(RF.state);});
  document.querySelector('[data-close-recipe]')?.addEventListener('click',()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
};

if(RF.state){
  RF.migrateV83(RF.state);
  if(!RF.state.flags.v83Seen){RF.state.flags.v83Seen=true;RF.log(RF.state,'V8.3: cleaner cooldowns, repaired travel flow, smooth combat motion and deliberate shop/crafting popups are active.','important');RF.save(RF.state);}
  RF.UI.render(RF.state);
}
