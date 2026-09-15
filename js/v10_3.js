window.RF=window.RF||{};
RF.VERSION='10.3.0';

/* Realmforge V10.3 — Tool Belt
   - Tools are explicitly equipped into a separate tool belt.
   - Equipped tools are protected from banking/dropping and marked in Pack.
   - Active skills use the equipped tool instead of automatically selecting the best carried tool.
   - Character page gains a dedicated Tool Belt section, separate from weapons/armour.
*/

(()=>{const st=document.createElement('style');st.textContent=`
.v103ToolGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
.v103ToolSlot{border:1px solid #493d2f;background:#191611;border-radius:12px;padding:10px;min-height:82px;display:flex;gap:9px;align-items:center;text-align:left;color:#eadfc5}
.v103ToolSlot .icon{font-size:25px;min-width:30px}.v103ToolSlot .meta{min-width:0}.v103ToolSlot small{display:block;color:#a99d88;margin-top:2px;line-height:1.25}.v103ToolSlot b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v103ToolType{font-size:10px;color:#d1b46f;text-transform:uppercase;letter-spacing:.08em}
`;document.head.appendChild(st)})();

RF.v103ToolTypes=function(){
  const preferred=['mining','woodcutting','fishing','firemaking','lockpicking'];
  const found=[...new Set(Object.values(RF.DATA.items).map(it=>it?.tool).filter(Boolean))];
  return [...preferred.filter(x=>found.includes(x)),...found.filter(x=>!preferred.includes(x))];
};
RF.v103ToolLabel=function(type){return RF.DATA.skills[type]?.name||({lockpicking:'Lockpicking'}[type])||String(type).replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())};
RF.v103BestOwnedTool=function(s,type){return Object.entries(RF.DATA.items).filter(([id,it])=>it?.tool===type&&(s.inventory?.[id]||0)>0).map(([id,it])=>({id,...it})).sort((a,b)=>(b.tier||1)-(a.tier||1))[0]||null};
RF.v103ToolEquipped=function(s,id){return Object.values(s.toolbelt||{}).includes(id)};
RF.v103ToolSlotFor=function(s,id){return Object.entries(s.toolbelt||{}).find(([,x])=>x===id)?.[0]||null};

RF.migrateV103=function(s){
  if(!s)return s;s.version='10.3.0';s.flags=s.flags||{};s.toolbelt=s.toolbelt||{};
  RF.v103ToolTypes().forEach(type=>{
    const current=s.toolbelt[type];
    if(current&&RF.DATA.items[current]?.tool===type&&(s.inventory[current]||0)>0)return;
    const best=RF.v103BestOwnedTool(s,type);s.toolbelt[type]=best?.id||null;
  });
  return s
};
const v103New=RF.newGame;RF.newGame=function(...a){return RF.migrateV103(v103New(...a))};
const v103Load=RF.load;RF.load=function(){return RF.migrateV103(v103Load())};
if(RF.V95){RF.V95.SCHEMA='10.3.0';const oldMig=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=function(s){return RF.migrateV103(oldMig(s))}};

// The explicitly equipped tool is now the active tool. No silent best-in-pack selection.
RF.bestTool=function(s,skill){
  const id=s?.toolbelt?.[skill],it=id&&RF.DATA.items[id];
  if(id&&it?.tool===skill&&(s.inventory?.[id]||0)>0)return {id,...it};
  return null
};

// Equipment helpers now understand both worn equipment and the separate tool belt.
const v103IsEquippedBase=RF.isEquipped;
RF.isEquipped=function(s,id){return !!(v103IsEquippedBase?.(s,id)||RF.v103ToolEquipped(s,id))};
const v103EquippedSlotBase=RF.equippedSlot;
RF.equippedSlot=function(s,id){return RF.v103ToolSlotFor(s,id)?`tool:${RF.v103ToolSlotFor(s,id)}`:(v103EquippedSlotBase?.(s,id)||null)};
const v103CanEquipBase=RF.canEquipItem;
RF.canEquipItem=function(s,id){const it=RF.DATA.items[id];if(it?.tool)return (s.inventory?.[id]||0)>0;return v103CanEquipBase?s? v103CanEquipBase(s,id):false:false};

RF.equipTool=function(id){
  const s=RF.state,it=RF.DATA.items[id];if(!it?.tool||(s.inventory[id]||0)<1)return;
  s.toolbelt=s.toolbelt||{};s.toolbelt[it.tool]=id;RF.log(s,`Equipped ${it.name} to the ${RF.v103ToolLabel(it.tool)} tool belt slot.`,'good');RF.save(s);RF.UI.render(s)
};
RF.unequipTool=function(id){
  const s=RF.state,type=RF.v103ToolSlotFor(s,id);if(!type)return;s.toolbelt[type]=null;RF.log(s,`Removed ${RF.DATA.items[id]?.name||id} from the tool belt.`);RF.save(s);RF.UI.render(s)
};
const v103EquipBase=RF.equip;RF.equip=function(id){const it=RF.DATA.items[id];if(it?.tool)return RF.equipTool(id);return v103EquipBase(id)};
const v103UnequipBase=RF.unequip;RF.unequip=function(id){if(RF.DATA.items[id]?.tool)return RF.unequipTool(id);return v103UnequipBase(id)};

// Pack: tools show EQUIP / EQUIPPED just like gear, but remain a distinct equipment family.
RF.UI.inventory=function(s){
  let used=RF.packUsed(s),pct=Math.min(100,used/RF.V82.PACK_CAP*100),cat=s.v93?.inventoryCategory||'all';
  let rows=Object.entries(s.inventory).filter(([,q])=>q>0).filter(([id])=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat).map(([id,q])=>{
    let it=RF.DATA.items[id];if(!it)return'';let equipped=RF.isEquipped(s,id),req=RF.v93Req?.(s,id)||'',can=it.tool?true:RF.canEquipItem(s,id);
    let equippable=!!(it.slot||it.tool),state=equipped?'<span class="equipState equipped">EQUIPPED</span>':equippable?(can?'<span class="equipState">EQUIP</span>':'<span class="equipState locked">LOCKED</span>'):'';
    let sub=it.rarity||it.type||'Item';if(it.tool)sub+=` • ${RF.v103ToolLabel(it.tool)} tool${it.tier?` • Tier ${it.tier}`:''}`;else if(req)sub+=` • ${req}`;
    return `<button class="row inventoryRow" data-item-detail="${id}"><div class="icon">${it.icon}</div><div class="meta"><b>${it.name} ${state}</b><small>${sub}</small></div><span class="qty">×${q}</span><span class="chev">›</span></button>`
  }).join('');
  return `<section class="card"><div class="questTitle"><h2>Pack</h2><span class="packCount ${used>=RF.V82.PACK_CAP?'full':''}">${used}/${RF.V82.PACK_CAP} slots</span></div><div class="packBar"><div style="width:${pct}%"></div></div>${RF.v93Select('inventory',cat)}${RF.isBankTown(s)?`<button class="action bankOpen" data-open-bank><b>🏦 Open Bank</b><small>Deposit or withdraw stored items</small></button>`:''}<div class="list inventoryList">${rows||'<div class="sub">Nothing in this category.</div>'}</div></section>`
};

// Tool item details get belt-specific controls and stats.
const v103ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){let m=this.modal;
  if(m?.type==='itemDetail'){
    const id=m.id,it=RF.DATA.items[id],q=s.inventory[id]||0;
    if(it?.tool&&q>0){
      const equipped=RF.v103ToolEquipped(s,id),active=s.toolbelt?.[it.tool],activeItem=active?RF.DATA.items[active]:null;
      let stats=[`🧰 ${RF.v103ToolLabel(it.tool)} tool`,`⭐ Tier ${it.tier||1}`];if(it.power!=null)stats.push(`⚙️ Work power ${it.power}`);if(it.control!=null)stats.push(`🎯 Control +${Math.round(it.control*100)}%`);if(it.value!=null)stats.push(`🪙 Base value ${it.value}g`);
      return `<div class="modalBack"><div class="modal itemModal"><div class="itemHero">${it.icon}</div><span class="eyebrow">TOOL • OWNED ×${q}</span><h2>${it.name}</h2><div class="itemDesc">${it.desc||'No description recorded.'}</div><div class="itemStats">${stats.map(x=>`<span>${x}</span>`).join('')}</div><div class="notice">Tool Belt: <b>${RF.v103ToolLabel(it.tool)}</b>${activeItem&&!equipped?`<br>Currently equipped: ${activeItem.icon} ${activeItem.name}`:''}</div><div class="choices">${equipped?`<button class="choice" data-tool-unequip="${id}"><b>Unequip from Tool Belt</b></button>`:`<button class="choice" data-tool-equip="${id}"><b>Equip to Tool Belt</b><small>This becomes the tool used for ${RF.v103ToolLabel(it.tool)} actions.</small></button>`}<button class="choice dangerChoice" data-drop-item="${id}" ${equipped?'disabled':''}><b>Drop 1</b><small>${equipped?'Equipped tools cannot be dropped.':'Permanently discard one.'}</small></button>${q>1&&!equipped?`<button class="choice dangerChoice" data-drop-all="${id}"><b>Drop All (${q})</b></button>`:''}<button class="choice" data-close-item><b>Close</b></button></div></div></div>`
    }
  }
  return v103ModalBase(s)
};

// Character: remove the old automatic Active Tools card and replace it with a real Tool Belt.
const v103CharacterBase=RF.UI.character.bind(RF.UI);
RF.UI.character=function(s){
  let h=v103CharacterBase(s);
  h=h.replace(/<section class="card"><h3>🧰 Active Tools<\/h3>[\s\S]*?<\/section>/,'');
  const rows=RF.v103ToolTypes().map(type=>{const id=s.toolbelt?.[type],it=id?RF.DATA.items[id]:null;return `<button class="v103ToolSlot" ${id?`data-item-detail="${id}"`:''}><div class="icon">${it?.icon||'▫️'}</div><div class="meta"><span class="v103ToolType">${RF.v103ToolLabel(type)}</span><b>${it?.name||'Empty slot'}</b><small>${it?`Tier ${it.tier||1} • Equipped`:'Equip a matching tool from your Pack'}</small></div></button>`}).join('');
  return h+`<section class="card"><div class="questTitle"><h3>🧰 Tool Belt</h3><span class="tiny">Separate from worn gear</span></div><div class="sub">Only the tool equipped here provides its bonuses during active skilling.</div><div class="v103ToolGrid">${rows}</div></section>`
};

const v103BindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){v103BindBase(s);
  document.querySelectorAll('[data-tool-equip]').forEach(b=>b.onclick=()=>{RF.equipTool(b.dataset.toolEquip);RF.UI.modal={type:'itemDetail',id:b.dataset.toolEquip};RF.UI.render(RF.state)});
  document.querySelectorAll('[data-tool-unequip]').forEach(b=>b.onclick=()=>{RF.unequipTool(b.dataset.toolUnequip);RF.UI.modal={type:'itemDetail',id:b.dataset.toolUnequip};RF.UI.render(RF.state)});
};

if(RF.state){RF.migrateV103(RF.state);RF.save(RF.state)}
