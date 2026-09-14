window.RF = window.RF || {};
RF.VERSION='8.2.0';

/* Realmforge V8.2 — Pack, Bank & Mastery
   - 28-stack-slot pack + town bank
   - item detail modal, drop/equip/use controls + equip requirements
   - equipment state labels
   - mastery-scaled active gathering with target difficulty
   - one restrained combat shake per attack
*/

RF.V82={PACK_CAP:28,TOWNS:['greenvale','ironridge','reedmere']};
RF.packUsed=s=>Object.keys(s.inventory||{}).filter(id=>(s.inventory[id]||0)>0).length;
RF.packFree=s=>Math.max(0,RF.V82.PACK_CAP-RF.packUsed(s));
RF.isBankTown=s=>RF.V82.TOWNS.includes(s.location)||!!RF.DATA.locations[s.location]?.bank;
RF.isEquipped=(s,id)=>Object.values(s.equipment||{}).includes(id);
RF.equippedSlot=(s,id)=>Object.entries(s.equipment||{}).find(([,x])=>x===id)?.[0]||null;
RF.itemRequirement=function(it){
  if(!it?.slot)return null;
  if(it.slot==='main'){
    if(it.ranged)return {skill:'archery',level:Math.max(1,Math.ceil((it.damage||1)*.55))};
    return {skill:'attack',level:Math.max(1,Math.ceil((it.damage||1)*.42))};
  }
  return {skill:'defence',level:Math.max(1,Math.ceil((it.armor||1)*.72))};
};
RF.canEquipItem=function(s,id){let it=RF.DATA.items[id],r=RF.itemRequirement(it);return !!it?.slot&&(!r||(s.skills[r.skill]?.level||1)>=r.level)};

RF.migrateV82=function(s){
  if(!s)return s;s.version='8.2.0';s.bank=s.bank||{};s.stats=s.stats||{};
  if(s.stats.itemsDropped==null)s.stats.itemsDropped=0;
  if(s.stats.bankTransfers==null)s.stats.bankTransfers=0;
  return s;
};
const v82New=RF.newGame;RF.newGame=function(...a){return RF.migrateV82(v82New(...a));};
const v82Load=RF.load;RF.load=function(){return RF.migrateV82(v82Load());};
const v82Import=RF.importSave;RF.importSave=function(x){return RF.migrateV82(v82Import(x));};
if(RF.state)RF.migrateV82(RF.state);

// Pack-cap aware item intake. Existing stacks never need a new slot.
const v82AddItemBase=RF.addItem;
RF.addItem=function(s,id,q=1){
  if(!s||q<=0)return false;
  if((s.inventory[id]||0)>0||RF.packUsed(s)<RF.V82.PACK_CAP){v82AddItemBase(s,id,q);return true;}
  // In bank towns, overflow is protected in the bank rather than silently lost.
  if(RF.isBankTown(s)){
    s.bank[id]=(s.bank[id]||0)+q;
    RF.log?.(s,`Pack full — ${q} × ${RF.DATA.items[id]?.name||id} sent to the bank.`,'important');
    return 'banked';
  }
  RF.log?.(s,`Pack full — ${q} × ${RF.DATA.items[id]?.name||id} left behind.`,'bad');
  return false;
};

RF.openItem=function(id){if(!RF.DATA.items[id]||(RF.state.inventory[id]||0)<1)return;RF.UI.modal={type:'itemDetail',id};RF.UI.render(RF.state)};
RF.closeItem=function(){RF.UI.modal=null;RF.UI.render(RF.state)};
RF.dropItem=function(id,qty=1){
  const s=RF.state;if(RF.isEquipped(s,id)){RF.UI.modal={type:'message',title:'Equipped Item',text:'Unequip or replace this item before dropping it.'};RF.UI.render(s);return;}
  qty=Math.min(qty,s.inventory[id]||0);if(qty<1)return;RF.takeItem(s,id,qty);s.stats.itemsDropped+=qty;RF.log(s,`Dropped ${qty} × ${RF.DATA.items[id]?.name||id}.`);RF.save(s);RF.UI.modal=null;RF.UI.render(s);
};
RF.unequip=function(id){const s=RF.state,slot=RF.equippedSlot(s,id);if(!slot)return;s.equipment[slot]=null;RF.log(s,`Unequipped ${RF.DATA.items[id]?.name||id}.`);RF.save(s);RF.UI.render(s)};
const v82EquipBase=RF.equip;
RF.equip=function(id){let s=RF.state,it=RF.DATA.items[id],req=RF.itemRequirement(it);if(!RF.canEquipItem(s,id)){RF.UI.modal={type:'message',title:'Requirement Not Met',text:`Requires ${RF.DATA.skills[req.skill]?.name||req.skill} level ${req.level}.`};RF.UI.render(s);return;}v82EquipBase(id);};

RF.openBank=function(){if(!RF.isBankTown(RF.state)){RF.UI.modal={type:'message',title:'No Bank Here',text:'Banks are available in major towns.'};RF.UI.render(RF.state);return;}RF.UI.modal={type:'bank'};RF.UI.render(RF.state)};
RF.bankDeposit=function(id,all=false){
  const s=RF.state;if(!RF.isBankTown(s))return;let held=s.inventory[id]||0;if(!held)return;
  let protectedQty=RF.isEquipped(s,id)?1:0;let movable=Math.max(0,held-protectedQty);let q=all?movable:Math.min(1,movable);
  if(q<1){RF.animateDenied?.(`[data-bank-deposit="${id}"]`);return;}
  RF.takeItem(s,id,q);s.bank[id]=(s.bank[id]||0)+q;s.stats.bankTransfers+=q;RF.save(s);RF.UI.render(s);
};
RF.bankWithdraw=function(id,all=false){
  const s=RF.state;if(!RF.isBankTown(s))return;let held=s.bank[id]||0;if(!held)return;
  let q=all?held:1;
  if(!(s.inventory[id]>0)&&RF.packUsed(s)>=RF.V82.PACK_CAP){RF.animateDenied?.(`[data-bank-withdraw="${id}"]`);return;}
  s.bank[id]-=q;if(s.bank[id]<=0)delete s.bank[id];v82AddItemBase(s,id,q);s.stats.bankTransfers+=q;RF.save(s);RF.UI.render(s);
};

// Target work is intentionally nonlinear: newly unlocked targets are substantial projects,
// while overlevelling old targets makes them dramatically quicker.
RF.workRequired=function(d){
  const lv=d?.level||1;
  if(d.skill==='woodcutting'){
    if(lv<=1)return 70;       // oak baseline
    if(lv<=5)return 140;      // willow ~2x oak
    if(lv<=14)return 245;     // yew much tougher
  }
  return 70+lv*10;
};
RF.workPower=function(s,d,tool){
  const level=s.skills[d.skill]?.level||1;
  const surplus=Math.max(0,level-d.level);
  const mastery=1+Math.min(1.35,surplus*.055); // old resources keep speeding up
  return Math.max(5,Math.round(((tool?.power||8)+Math.floor(level/6))*mastery));
};

// Replace active-gather tap math with difficulty-scaled progress. Mishaps still use V8.1 reset rule.
RF.workTap=function(){
  const s=RF.state,g=RF.actionGame;if(!g||g.type!=='work')return;
  if(RF.actionReady&&!RF.actionReady(g,'work'))return;
  const d=RF.DATA.resourceDefs[g.key],r=RF.resourceState(s,g.key);if(!d||!r||r.charges<=0)return RF.closeActionGame();
  const tool=RF.bestTool(s,d.skill),level=s.skills[d.skill]?.level||1;
  g.required=g.required||RF.workRequired(d);
  let power=RF.workPower(s,d,tool);
  const critChance=.09+Math.min(.12,level*.0025)+(tool?.control||0)+(s.luck||0)*.003;
  const mishapChance=Math.max(.01,.065-(level-d.level)*.0045-(tool?.control||0));
  const roll=Math.random();s.stats.activeTaps++;g.crit=false;g.mishap=false;
  if(roll<mishapChance){
    g.mishap=true;s.stats.skillMishaps++;r.charges=Math.max(0,r.charges-1);r.last=RF.totalMinutes(s);g.progress=0;
    const words=d.skill==='woodcutting'?'The cut twists and the usable section splinters. One potential yield is lost.':d.skill==='mining'?'The strike fractures a useful pocket into rubble. One potential yield is lost.':'You spoil part of the resource.';
    g.last=`⚠️ BUTCHERED — ${words} Progress reset to 0%.`;
  }else{
    if(roll<mishapChance+critChance){power*=2;g.crit=true;s.stats.skillCrits++;g.last=`💥 CRITICAL WORK! +${power} work`;}else g.last=`+${power} work`;
    g.progress=Math.min(g.required,g.progress+power);
  }
  if(g.progress>=g.required)return RF.finishActiveGather(g);RF.save(s);RF.UI.render(s);
};

// ---------- UI ----------
const v82InventoryBase=RF.UI.inventory.bind(RF.UI);
RF.UI.inventory=function(s){
  const used=RF.packUsed(s),pct=Math.min(100,100*used/RF.V82.PACK_CAP);
  const rows=Object.entries(s.inventory).filter(([,q])=>q>0).map(([id,q])=>{
    const it=RF.DATA.items[id];if(!it)return'';const equipped=RF.isEquipped(s,id),req=RF.itemRequirement(it),can=RF.canEquipItem(s,id);
    const state=equipped?'<span class="equipState on">EQUIPPED</span>':it.slot?`<span class="equipState ${can?'':'locked'}">${can?'EQUIP':'LOCKED'}</span>`:'';
    return `<button class="row inventoryRow" data-item-detail="${id}"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name} ${state}</b><small>${it.rarity||it.type||'Item'}${req?` • ${RF.DATA.skills[req.skill]?.name||req.skill} ${req.level}`:''}</small></div><span class="qty">×${q}</span><span class="chev">›</span></button>`;
  }).join('');
  return `<section class="card"><div class="questTitle"><h2>Pack</h2><span class="packCount ${used>=RF.V82.PACK_CAP?'full':''}">${used}/${RF.V82.PACK_CAP} slots</span></div><div class="packBar"><div style="width:${pct}%"></div></div><div class="sub">Items of the same type stack into one slot. Equipped gear is marked below.</div>${RF.isBankTown(s)?`<button class="action bankOpen" data-open-bank><b>🏦 Open Bank</b><small>Deposit or withdraw stored items</small></button>`:`<div class="tiny bankHint">🏦 Bank access: Greenvale, Ironridge and Reedmere.</div>`}<div class="list inventoryList">${rows||'<div class="sub">Your pack is empty.</div>'}</div></section>`;
};

const v82ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){let m=this.modal;
  if(m?.type==='itemDetail'){
    let id=m.id,it=RF.DATA.items[id],q=s.inventory[id]||0;if(!it||!q)return'';let equipped=RF.isEquipped(s,id),req=RF.itemRequirement(it),can=RF.canEquipItem(s,id);
    let stats=[];if(it.damage)stats.push(`⚔️ ${it.damage} damage`);if(it.armor)stats.push(`🛡️ ${it.armor} armour`);if(it.heal)stats.push(`❤️ Restores ${it.heal} HP`);if(it.stamina)stats.push(`🟢 Restores ${it.stamina} stamina`);if(it.value!=null)stats.push(`🪙 Base value ${it.value}g`);
    return `<div class="modalBack"><div class="modal itemModal"><div class="itemHero">${it.icon}</div><span class="eyebrow">${it.rarity||it.type||'ITEM'} • OWNED ×${q}</span><h2>${it.name}</h2><div class="itemDesc">${it.desc||'No description recorded.'}</div>${stats.length?`<div class="itemStats">${stats.map(x=>`<span>${x}</span>`).join('')}</div>`:''}${req?`<div class="requirement ${can?'met':'unmet'}">${can?'✓':'🔒'} Requires ${RF.DATA.skills[req.skill]?.name||req.skill} Lv ${req.level} • You: ${s.skills[req.skill]?.level||1}</div>`:''}<div class="choices">${it.slot?(equipped?`<button class="choice" data-unequip-item="${id}"><b>Unequip</b></button>`:`<button class="choice" data-equip-detail="${id}" ${can?'':'disabled'}><b>${can?'Equip':'Level requirement not met'}</b></button>`):''}${(it.heal||it.stamina)?`<button class="choice" data-use-detail="${id}"><b>Use</b></button>`:''}<button class="choice dangerChoice" data-drop-item="${id}" ${equipped?'disabled':''}><b>Drop 1</b><small>${equipped?'Equipped items cannot be dropped.':'Permanently discard one.'}</small></button>${q>1&&!equipped?`<button class="choice dangerChoice" data-drop-all="${id}"><b>Drop All (${q})</b></button>`:''}<button class="choice" data-close-item><b>Close</b></button></div></div></div>`;
  }
  if(m?.type==='bank'){
    const packRows=Object.entries(s.inventory).filter(([,q])=>q>0).map(([id,q])=>{let it=RF.DATA.items[id];if(!it)return'';let eq=RF.isEquipped(s,id),mov=Math.max(0,q-(eq?1:0));return `<div class="bankRow"><span class="bankIcon">${it.icon}</span><div class="meta"><b>${it.name}</b><small>Pack ×${q}${eq?' • 1 equipped':''}</small></div><button data-bank-deposit="${id}" ${mov<1?'disabled':''}>+1</button><button data-bank-deposit-all="${id}" ${mov<1?'disabled':''}>All</button></div>`}).join('');
    const bankRows=Object.entries(s.bank||{}).filter(([,q])=>q>0).map(([id,q])=>{let it=RF.DATA.items[id];if(!it)return'';let full=!(s.inventory[id]>0)&&RF.packUsed(s)>=RF.V82.PACK_CAP;return `<div class="bankRow"><span class="bankIcon">${it.icon}</span><div class="meta"><b>${it.name}</b><small>Bank ×${q}</small></div><button data-bank-withdraw="${id}" ${full?'disabled':''}>-1</button><button data-bank-withdraw-all="${id}" ${full?'disabled':''}>All</button></div>`}).join('');
    return `<div class="modalBack"><div class="modal bankModal"><span class="eyebrow">TOWN BANK</span><h2>🏦 Vault & Pack</h2><div class="sub">Pack ${RF.packUsed(s)}/${RF.V82.PACK_CAP} slots • Bank storage is unlimited.</div><h3>Pack</h3><div class="bankList">${packRows||'<div class="sub">Nothing carried.</div>'}</div><h3>Bank</h3><div class="bankList">${bankRows||'<div class="sub">Your vault is empty.</div>'}</div><button class="quietClose" data-close-bank>Close Bank</button></div></div>`;
  }
  return v82ModalBase(s);
};

// Rewrite work popup's percent to respect variable target requirement and expose mastery math.
const v82ActionModalBase=RF.UI.v6ActionModal?.bind(RF.UI);
if(v82ActionModalBase)RF.UI.v6ActionModal=function(s,g){
  let h=v82ActionModalBase(s,g);if(g?.type==='work'){
    const d=RF.DATA.resourceDefs[g.key],tool=RF.bestTool(s,d.skill);g.required=g.required||RF.workRequired(d);const pct=Math.min(100,100*g.progress/g.required),pwr=RF.workPower(s,d,tool),surplus=Math.max(0,(s.skills[d.skill]?.level||1)-d.level);
    h=h.replace(/class="activeFill" style="width:[^%]*%"/,`class="activeFill" style="width:${pct}%"`);
    h=h.replace(/<div class="activePct">[^<]*<\/div>/,`<div class="activePct">${Math.round(pct)}% • ${Math.floor(g.progress)}/${g.required} work</div>`);
    h=h.replace(/<div class="tiny center">Better tools[^<]*<\/div>/,`<div class="tiny center">~${pwr} work/action • +${surplus} mastery levels • tougher resources require more work.</div>`);
  }return h;
};

const v82BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){v82BindBase(s);
  document.querySelectorAll('[data-item-detail]').forEach(b=>b.onclick=()=>RF.openItem(b.dataset.itemDetail));
  document.querySelector('[data-close-item]')?.addEventListener('click',()=>RF.closeItem());
  document.querySelectorAll('[data-drop-item]').forEach(b=>b.onclick=()=>RF.dropItem(b.dataset.dropItem,1));
  document.querySelectorAll('[data-drop-all]').forEach(b=>b.onclick=()=>RF.dropItem(b.dataset.dropAll,RF.state.inventory[b.dataset.dropAll]||0));
  document.querySelectorAll('[data-equip-detail]').forEach(b=>b.onclick=()=>{RF.equip(b.dataset.equipDetail);RF.UI.modal={type:'itemDetail',id:b.dataset.equipDetail};RF.UI.render(RF.state)});
  document.querySelectorAll('[data-unequip-item]').forEach(b=>b.onclick=()=>{RF.unequip(b.dataset.unequipItem);RF.UI.modal={type:'itemDetail',id:b.dataset.unequipItem};RF.UI.render(RF.state)});
  document.querySelectorAll('[data-use-detail]').forEach(b=>b.onclick=()=>{RF.useItem(b.dataset.useDetail);if((RF.state.inventory[b.dataset.useDetail]||0)>0)RF.UI.modal={type:'itemDetail',id:b.dataset.useDetail};RF.UI.render(RF.state)});
  document.querySelector('[data-open-bank]')?.addEventListener('click',()=>RF.openBank());
  document.querySelector('[data-close-bank]')?.addEventListener('click',()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
  document.querySelectorAll('[data-bank-deposit]').forEach(b=>b.onclick=()=>RF.bankDeposit(b.dataset.bankDeposit,false));
  document.querySelectorAll('[data-bank-deposit-all]').forEach(b=>b.onclick=()=>RF.bankDeposit(b.dataset.bankDepositAll,true));
  document.querySelectorAll('[data-bank-withdraw]').forEach(b=>b.onclick=()=>RF.bankWithdraw(b.dataset.bankWithdraw,false));
  document.querySelectorAll('[data-bank-withdraw-all]').forEach(b=>b.onclick=()=>RF.bankWithdraw(b.dataset.bankWithdrawAll,true));
};

// Combat feedback: exactly one restrained shake/jolt per player attack event.
RF.v82CombatShake=function(){const el=document.querySelector('.battleModal');if(!el)return;el.classList.remove('singleCombatJolt');void el.offsetWidth;el.classList.add('singleCombatJolt');};
const v82BattleAbilityBase=RF.battleAbility;
RF.battleAbility=function(id){const beforeHp=RF.state?.combat?.hp;const out=v82BattleAbilityBase(id);const afterHp=RF.state?.combat?.hp;if(beforeHp!=null&&afterHp!=null&&afterHp<beforeHp)requestAnimationFrame(()=>RF.v82CombatShake());return out;};

if(RF.state){RF.migrateV82(RF.state);if(!RF.state.flags.v82Seen){RF.state.flags.v82Seen=true;RF.log(RF.state,'V8.2: pack capacity, banking, item details, equipment requirements and mastery-scaled skilling are active.','important');RF.save(RF.state);}RF.UI.render(RF.state);}
