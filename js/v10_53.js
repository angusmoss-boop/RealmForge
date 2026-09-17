window.RF=window.RF||{};
RF.VERSION='10.53.0';
RF.BUILD={
  version:'10.53.0',
  title:'Detached Loadout',
  built:'17 Sep 2026 • 07:26 BST',
  buildId:'20260917-0726-bst'
};
RF.V1053=RF.V1053||{};

/* Realmforge V10.53 — Detached Loadout
   - Worn equipment and Tool Belt tools now live outside the Pack and no longer consume Pack slots.
   - Equipping from the Pack removes one copy from the Pack; replacing gear returns the old item to the Pack.
   - Unequipping returns the item to the Pack and is blocked if doing so would exceed Pack capacity.
   - Existing saves are migrated once by extracting currently equipped copies from Pack inventory.
*/

(()=>{
'use strict';
const V=RF.V1053;
V.version='10.53.0';
V.EQUIP_SLOTS=RF.V1050?.EQUIP_SLOTS?.map(x=>x[0])||['main','off','head','chest','legs','boots','ring1','ring2'];
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.cap=s=>RF.packCapacity?RF.packCapacity(s):(RF.V82?.PACK_CAP||28);
V.packQty=(s,id)=>Math.max(0,Number(s?.inventory?.[id])||0);
V.loadoutRefs=function(s,id){
  const out=[];
  Object.entries(s?.equipment||{}).forEach(([slot,x])=>{if(x===id)out.push({kind:'equipment',slot})});
  Object.entries(s?.toolbelt||{}).forEach(([slot,x])=>{if(x===id)out.push({kind:'toolbelt',slot})});
  return out;
};
V.isLoadoutItem=(s,id)=>V.loadoutRefs(s,id).length>0;
V.removePackOne=function(s,id){
  const q=V.packQty(s,id);if(q<1)return false;
  RF.takeItem(s,id,1);return true;
};
V.addPackOne=function(s,id){
  if(!s||!id)return false;
  if(V.packQty(s,id)<=0&&RF.packUsed(s)>=V.cap(s))return false;
  s.inventory=s.inventory||{};s.inventory[id]=(s.inventory[id]||0)+1;return true;
};
V.canSwap=function(s,newId,oldId){
  const used=RF.packUsed(s),newQ=V.packQty(s,newId);
  if(newQ<1)return false;
  let after=used-(newQ===1?1:0);
  if(oldId&&oldId!==newId&&V.packQty(s,oldId)<=0)after++;
  return after<=V.cap(s);
};
V.blocked=function(title,text){RF.UI.modal={type:'message',title,text};RF.UI.render(RF.state);return false};

// V10.3 originally required a Tool Belt item to remain physically in inventory. From V10.53
// onward the Tool Belt itself owns that copy, so old migrations must preserve a valid detached tool.
RF.migrateV103=function(s){
  if(!s)return s;s.version='10.3.0';s.flags=s.flags||{};s.toolbelt=s.toolbelt||{};
  RF.v103ToolTypes().forEach(type=>{
    const current=s.toolbelt[type];
    if(current&&RF.DATA.items[current]?.tool===type)return;
    const best=RF.v103BestOwnedTool(s,type);s.toolbelt[type]=best?.id||null;
  });
  return s;
};

V.extractExistingLoadout=function(s){
  if(s.v1053?.detached)return;
  const refs=[];
  V.EQUIP_SLOTS.forEach(slot=>{const id=s.equipment?.[slot];if(id)refs.push(id)});
  Object.values(s.toolbelt||{}).forEach(id=>{if(id)refs.push(id)});
  refs.forEach(id=>{if(V.packQty(s,id)>0)RF.takeItem(s,id,1)});
  s.v1053.detached=true;
};
V.migrate=function(s){
  if(!s)return s;
  s.version='10.53.0';s.v1053=s.v1053||{};s.inventory=s.inventory||{};s.equipment=s.equipment||{};s.toolbelt=s.toolbelt||{};
  V.extractExistingLoadout(s);
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.53.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

// Tool bonuses now come from the detached Tool Belt copy rather than a matching Pack copy.
RF.bestTool=function(s,skill){
  const id=s?.toolbelt?.[skill],it=id&&RF.DATA.items?.[id];
  if(id&&it?.tool===skill)return {id,...it};
  return null;
};

RF.equipTool=function(id){
  const s=RF.state,it=RF.DATA.items?.[id];
  if(!s||!it?.tool||V.packQty(s,id)<1)return false;
  const type=it.tool,oldId=s.toolbelt?.[type]||null;
  if(oldId===id)return V.blocked('Already Equipped',`${it.name} is already in that Tool Belt slot.`);
  if(!V.canSwap(s,id,oldId))return V.blocked('Pack Full',`There is no Pack slot available for ${RF.DATA.items?.[oldId]?.name||'the replaced tool'}. Free a Pack slot before swapping tools.`);
  V.removePackOne(s,id);
  if(oldId)V.addPackOne(s,oldId);
  s.toolbelt=s.toolbelt||{};s.toolbelt[type]=id;
  RF.log?.(s,oldId?`Equipped ${it.name}; ${RF.DATA.items?.[oldId]?.name||oldId} returned to the Pack.`:`Equipped ${it.name} to the ${RF.v103ToolLabel?.(type)||type} Tool Belt slot.`,'good');
  RF.save?.(s);RF.UI.render(s);return true;
};
RF.unequipTool=function(id){
  const s=RF.state,type=RF.v103ToolSlotFor?.(s,id);if(!s||!type)return false;
  if(!V.addPackOne(s,id))return V.blocked('Pack Full',`Free a Pack slot before removing ${RF.DATA.items?.[id]?.name||id} from the Tool Belt.`);
  s.toolbelt[type]=null;RF.log?.(s,`${RF.DATA.items?.[id]?.name||id} returned to the Pack.`);RF.save?.(s);RF.UI.render(s);return true;
};

RF.equip=function(id){
  const s=RF.state,it=RF.DATA.items?.[id];if(!s||!it)return false;
  if(it.tool)return RF.equipTool(id);
  if(!it.slot||V.packQty(s,id)<1)return false;
  const req=RF.itemRequirement?.(it);
  if(req&&(s.skills?.[req.skill]?.level||1)<req.level)return V.blocked('Requirement Not Met',`Requires ${RF.DATA.skills?.[req.skill]?.name||req.skill} level ${req.level}.`);
  const slot=it.slot,oldId=s.equipment?.[slot]||null;
  if(oldId===id)return V.blocked('Already Equipped',`${it.name} is already equipped in that slot.`);
  if(!V.canSwap(s,id,oldId))return V.blocked('Pack Full',`There is no Pack slot available for ${RF.DATA.items?.[oldId]?.name||'the replaced item'}. Free a Pack slot before changing equipment.`);
  V.removePackOne(s,id);
  if(oldId)V.addPackOne(s,oldId);
  s.equipment=s.equipment||{};s.equipment[slot]=id;
  RF.log?.(s,oldId?`Equipped ${it.name}; ${RF.DATA.items?.[oldId]?.name||oldId} returned to the Pack.`:`Equipped ${it.name}.`,'good');
  RF.save?.(s);RF.UI.render(s);return true;
};
RF.unequip=function(id){
  const s=RF.state;if(!s)return false;
  const toolType=RF.v103ToolSlotFor?.(s,id);if(toolType)return RF.unequipTool(id);
  const slot=Object.entries(s.equipment||{}).find(([,x])=>x===id)?.[0];if(!slot)return false;
  if(!V.addPackOne(s,id))return V.blocked('Pack Full',`Free a Pack slot before unequipping ${RF.DATA.items?.[id]?.name||id}.`);
  s.equipment[slot]=null;RF.log?.(s,`${RF.DATA.items?.[id]?.name||id} returned to the Pack.`);RF.save?.(s);RF.UI.render(s);return true;
};

// Pack copies are now independent of loadout copies. A duplicate in the Pack may be dropped or banked.
RF.dropItem=function(id,qty=1){
  const s=RF.state;if(!s)return;
  qty=Math.min(Math.max(1,Math.floor(Number(qty)||1)),V.packQty(s,id));if(qty<1)return;
  RF.takeItem(s,id,qty);s.stats=s.stats||{};s.stats.itemsDropped=(s.stats.itemsDropped||0)+qty;
  RF.log?.(s,`Dropped ${qty} × ${RF.DATA.items?.[id]?.name||id}.`);RF.save?.(s);RF.UI.modal=null;RF.UI.render(s);
};
RF.bankDeposit=function(id,all=false){
  const s=RF.state;if(!s||!RF.isBankTown?.(s))return;const held=V.packQty(s,id);if(!held)return;
  const q=all?held:1;RF.takeItem(s,id,q);s.bank=s.bank||{};s.bank[id]=(s.bank[id]||0)+q;s.stats=s.stats||{};s.stats.bankTransfers=(s.stats.bankTransfers||0)+q;RF.save?.(s);RF.UI.render(s);
};

// V10.42 Vault transfer logic should move every actual Pack copy; the equipped copy no longer lives there.
if(RF.V1042){
  const B=RF.V1042;
  B.packMovable=(s,id)=>V.packQty(s,id);
  B.tileHtml=function(s,side,row){
    const {id,qty,it}=row,movable=B.moveCount(s,side,id),cls=['v1042BankTile'];if(movable<1)cls.push('disabled');
    return `<button type="button" class="${cls.join(' ')}" data-v1042-bank-tile="${B.escape(id)}" data-v1042-bank-side="${side}" data-v1042-bank-info="${B.escape(id)}" aria-label="${B.escape(it.name)}">
      <div class="v1042TileIcon">${it.icon||'📦'}</div><div class="v1042TileName">${B.escape(it.name)}</div><div class="v1042TileMeta">${side==='bank'?'Bank':'Pack'} ×${qty}</div>
      <div class="v1042TileFoot"><span class="v1042TileQty">×${qty}</span>${movable<1?'<span class="v1042TileBadge muted">LOCK</span>':'<span class="v1042TileBadge">MOVE</span>'}</div>
    </button>`;
  };
}

// Main Pack grid contains carried items only. Loadout items vanish from it and therefore free slots.
RF.UI.inventory=function(s){
  const used=RF.packUsed(s),cap=V.cap(s),pct=Math.min(100,used/cap*100),cat=s.v93?.inventoryCategory||'all';
  const sorted=(RF.V1012?.sortedEntries?RF.V1012.sortedEntries(s.inventory):Object.entries(s.inventory||{}));
  const entries=sorted.filter(([,q])=>(+q||0)>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat);
  const tiles=entries.map(([id,q])=>{
    const it=RF.DATA.items?.[id];if(!it)return'';
    const can=it.tool?true:RF.canEquipItem?.(s,id),badge=(it.slot&&!can)?'<span class="v1042TileBadge muted">LOCK</span>':'';
    return `<button type="button" class="v1042BankTile v1045PackTile" data-item-detail="${V.escape(id)}" aria-label="${V.escape(it.name)}"><div class="v1042TileIcon">${it.icon||'📦'}</div><div class="v1042TileName">${V.escape(it.name)}</div><div class="v1042TileFoot"><span class="v1042TileQty">×${q}</span>${badge}</div></button>`;
  }).join('');
  const cats=RF.V1046?.categoryTabs?RF.V1046.categoryTabs('inventory',cat):RF.v93Select('inventory',cat);
  return `<section class="card v1045PackCard"><div class="questTitle"><h2>Pack</h2><span class="packCount ${used>=cap?'full':''}">${used}/${cap} slots</span></div><div class="packBar"><div style="width:${pct}%"></div></div>${cats}${RF.isBankTown(s)?`<button class="action bankOpen v1045BankOpen" data-open-bank><b>🏦 Open Bank</b><small>Deposit or withdraw stored items</small></button>`:'<div class="tiny bankHint">🏦 Bank access: Greenvale, Ironridge and Reedmere.</div>'}<div class="v1045PackGridWrap"><div class="v1042VaultGrid v1045PackGrid">${tiles||'<div class="v1042VaultEmpty">Nothing in this category.</div>'}</div></div></section>`;
};

// Dedicated Loadout pages now own their item interaction, independent of Pack inventory quantities.
if(RF.V1050){
  RF.V1050.slotTile=function(s,slot,slotIcon,label){
    const id=s.equipment?.[slot],it=id?RF.DATA.items?.[id]:null;
    if(it)return `<button type="button" class="v1050LoadoutTile equipped" data-v1053-loadout-detail="${V.escape(id)}" data-v1053-kind="equipment" data-v1053-slot="${V.escape(slot)}" aria-label="${V.escape(label)}: ${V.escape(it.name)}"><div class="v1050TileIcon">${it.icon||slotIcon}</div><div class="v1050TileLabel">${V.escape(label)}</div><div class="v1050TileName">${V.escape(it.name)}</div><div class="v1050TileFoot"><span>EQUIPPED</span></div></button>`;
    return `<div class="v1050LoadoutTile empty"><div class="v1050TileIcon muted">${slotIcon}</div><div class="v1050TileLabel">${V.escape(label)}</div><div class="v1050TileName muted">Empty slot</div><div class="v1050TileFoot"><span>EMPTY</span></div></div>`;
  };
  RF.V1050.toolTile=function(s,type){
    const id=s.toolbelt?.[type],it=id?RF.DATA.items?.[id]:null,label=RF.v103ToolLabel?.(type)||type;
    if(it)return `<button type="button" class="v1050LoadoutTile equipped" data-v1053-loadout-detail="${V.escape(id)}" data-v1053-kind="toolbelt" data-v1053-slot="${V.escape(type)}" aria-label="${V.escape(label)} tool: ${V.escape(it.name)}"><div class="v1050TileIcon">${it.icon||'🧰'}</div><div class="v1050TileLabel">${V.escape(label)}</div><div class="v1050TileName">${V.escape(it.name)}</div><div class="v1050TileFoot"><span>Tier ${it.tier||1}</span></div></button>`;
    return `<div class="v1050LoadoutTile empty"><div class="v1050TileIcon muted">${RF.V1050.toolIcon?.(type)||'🧰'}</div><div class="v1050TileLabel">${V.escape(label)}</div><div class="v1050TileName muted">Empty slot</div><div class="v1050TileFoot"><span>EMPTY</span></div></div>`;
  };
}

V.detailHtml=function(s,m){
  const id=m.id,it=RF.DATA.items?.[id];if(!it)return'';
  const isTool=m.kind==='toolbelt'||!!it.tool,req=RF.itemRequirement?.(it),stats=[];
  if(it.damage)stats.push(`⚔️ ${it.damage} damage`);if(it.armor)stats.push(`🛡️ ${it.armor} armour`);if(it.tier)stats.push(`⭐ Tier ${it.tier}`);if(it.power!=null)stats.push(`⚙️ Work power ${it.power}`);if(it.control!=null)stats.push(`🎯 Control +${Math.round(it.control*100)}%`);if(it.value!=null)stats.push(`🪙 Base value ${it.value}g`);
  const slotLabel=isTool?(RF.v103ToolLabel?.(m.slot)||m.slot):String(m.slot||it.slot||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  return `<div class="modalBack"><div class="modal itemModal"><div class="itemHero">${it.icon||'📦'}</div><span class="eyebrow">${isTool?'TOOL BELT':'EQUIPPED'} • ${V.escape(slotLabel)}</span><h2>${V.escape(it.name)}</h2><div class="itemDesc">${V.escape(it.desc||'No description recorded.')}</div>${stats.length?`<div class="itemStats">${stats.map(x=>`<span>${x}</span>`).join('')}</div>`:''}${req?`<div class="requirement met">✓ Requires ${V.escape(RF.DATA.skills?.[req.skill]?.name||req.skill)} Lv ${req.level}</div>`:''}<div class="notice">This copy is stored in your ${isTool?'Tool Belt':'Equipment'} and does not use a Pack slot.</div><div class="choices"><button class="choice" data-v1053-unequip="${V.escape(id)}" data-v1053-kind="${isTool?'toolbelt':'equipment'}"><b>Return to Pack</b><small>Unequip this item and place it back in your Pack.</small></button><button class="choice" data-v1053-close><b>Close</b></button></div></div></div>`;
};
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v1053LoadoutDetail')return V.detailHtml(s,m);
  if(m?.type==='itemDetail'&&V.packQty(s,m.id)<1){
    const ref=V.loadoutRefs(s,m.id)[0];if(ref)return V.detailHtml(s,{type:'v1053LoadoutDetail',id:m.id,...ref});
  }
  return modalBase(s);
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  // Replace older equip handlers so a failed swap can keep its Pack Full / requirement message,
  // while a successful swap opens the detached loadout copy rather than a now-empty Pack stack.
  document.querySelectorAll('[data-equip-detail]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.equipDetail,ok=RF.equip(id);if(ok===false)return;
    const ref=V.loadoutRefs(RF.state,id)[0];RF.UI.modal=ref?{type:'v1053LoadoutDetail',id,...ref}:null;RF.UI.render(RF.state);
  });
  document.querySelectorAll('[data-tool-equip]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.toolEquip,ok=RF.equipTool(id);if(ok===false)return;
    const ref=V.loadoutRefs(RF.state,id)[0];RF.UI.modal=ref?{type:'v1053LoadoutDetail',id,...ref}:null;RF.UI.render(RF.state);
  });
  document.querySelectorAll('[data-v1053-loadout-detail]').forEach(b=>b.onclick=()=>{RF.UI.modal={type:'v1053LoadoutDetail',id:b.dataset.v1053LoadoutDetail,kind:b.dataset.v1053Kind,slot:b.dataset.v1053Slot};RF.UI.render(s)});
  document.querySelectorAll('[data-v1053-unequip]').forEach(b=>b.onclick=()=>{const id=b.dataset.v1053Unequip,ok=b.dataset.v1053Kind==='toolbelt'?RF.unequipTool(id):RF.unequip(id);if(ok!==false){RF.UI.modal=null;RF.UI.render(RF.state)}});
  document.querySelectorAll('[data-v1053-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
};

const st=document.createElement('style');st.id='v1053-detached-loadout-style';st.textContent=`
.v1050LoadoutTile.equipped{box-shadow:inset 0 1px rgba(255,255,255,.04),0 0 0 1px rgba(102,145,92,.08)}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
