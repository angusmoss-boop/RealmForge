window.RF=window.RF||{};
RF.VERSION='11.5.0';
RF.BUILD={
  version:'11.5.0',
  title:'Loadout Manager',
  built:'17 Sep 2026 • 21:58 BST',
  buildId:'20260917-2158-bst'
};
RF.V115=RF.V115||{};

/* Realmforge V11.5 — Loadout Manager
   - Equipment/tool detail screens compare carried gear against the item currently occupying its target slot.
   - Rings may be explicitly equipped to Ring I or Ring II, including two copies of the same ring.
   - Equipment and Tool Belt tiles, including empty tiles, become slot managers showing compatible Pack replacements.
   - Equipped/tool-belt copies remain detached from the Pack and do not consume Pack slots.
   - Existing loadouts and saves migrate in place without moving valid equipped items.
*/

(()=>{
'use strict';
const V=RF.V115;
V.version='11.5.0';
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.packQty=(s,id)=>Math.max(0,Number(s?.inventory?.[id])||0);
V.EQUIP_SLOTS=RF.V1050?.EQUIP_SLOTS||[
  ['main','⚔️','Main Hand'],['off','🛡️','Off Hand'],['head','🪖','Head'],['chest','🥋','Chest'],
  ['legs','👖','Legs'],['boots','🥾','Boots'],['ring1','💍','Ring I'],['ring2','💍','Ring II']
];
V.slotMeta=slot=>V.EQUIP_SLOTS.find(x=>x[0]===slot)||[slot,'▫️',String(slot||'Slot').replace(/\b\w/g,c=>c.toUpperCase())];
V.slotLabel=slot=>V.slotMeta(slot)[2];
V.isRingItem=it=>!!it&&['ring','ring1','ring2'].includes(it.slot);
V.compatibleEquipment=function(it,slot){
  if(!it?.slot)return false;
  if(V.isRingItem(it))return slot==='ring1'||slot==='ring2';
  return it.slot===slot;
};
RF.equipmentSlotsForItem=function(it){
  if(V.isRingItem(it))return ['ring1','ring2'];
  return it?.slot?[it.slot]:[];
};
V.requirement=function(s,it){
  const r=RF.itemRequirement?.(it);if(!r)return {req:null,met:true,have:0};
  const have=Math.max(1,+s?.skills?.[r.skill]?.level||1);
  return {req:r,met:have>=r.level,have};
};
V.delta=(next,current)=>Number(next||0)-Number(current||0);
V.deltaText=n=>n>0?`+${n}`:n<0?`${n}`:'±0';
V.deltaClass=n=>n>0?'good':n<0?'bad':'same';
V.statValue=(it,key)=>Math.max(0,Number(it?.[key])||0);
V.toolValue=(it,key)=>Number(it?.[key])||0;
V.rarityRank=r=>({Common:0,Uncommon:1,Rare:2,Epic:3,Legendary:4})[r]??0;

V.equipmentComparison=function(s,it,slot){
  const oldId=s?.equipment?.[slot]||null,old=oldId?RF.DATA.items?.[oldId]:null;
  return {
    slot,oldId,old,
    damage:V.delta(V.statValue(it,'damage'),V.statValue(old,'damage')),
    armor:V.delta(V.statValue(it,'armor'),V.statValue(old,'armor'))
  };
};
V.toolComparison=function(s,it,type){
  const oldId=s?.toolbelt?.[type]||null,old=oldId?RF.DATA.items?.[oldId]:null;
  return {
    type,oldId,old,
    tier:V.delta(V.toolValue(it,'tier'),V.toolValue(old,'tier')),
    power:V.delta(V.toolValue(it,'power'),V.toolValue(old,'power')),
    control:V.delta(Math.round(V.toolValue(it,'control')*100),Math.round(V.toolValue(old,'control')*100))
  };
};
V.comparePill=(label,val,suffix='')=>`<span class="v115Delta ${V.deltaClass(val)}"><small>${V.escape(label)}</small><b>${V.escape(V.deltaText(val))}${V.escape(suffix)}</b></span>`;
V.equipmentCompareHtml=function(s,it,slot){
  const c=V.equipmentComparison(s,it,slot),name=c.old?.name||'Empty slot';
  return `<div class="v115CompareCard"><div class="v115CompareHead"><span>${V.escape(V.slotLabel(slot))}</span><b>${c.old?.icon||'▫️'} ${V.escape(name)}</b></div><div class="v115DeltaGrid">${V.comparePill('Damage',c.damage)}${V.comparePill('Armour',c.armor)}</div></div>`;
};
V.toolCompareHtml=function(s,it,type){
  const c=V.toolComparison(s,it,type),name=c.old?.name||'Empty slot';
  return `<div class="v115CompareCard"><div class="v115CompareHead"><span>${V.escape(RF.v103ToolLabel?.(type)||type)}</span><b>${c.old?.icon||'▫️'} ${V.escape(name)}</b></div><div class="v115DeltaGrid v115ToolDelta">${V.comparePill('Tier',c.tier)}${V.comparePill('Power',c.power)}${V.comparePill('Control',c.control,'%')}</div></div>`;
};

// ----- Explicit slot equipping -----
RF.equipToSlot=function(id,slot){
  const s=RF.state,it=RF.DATA.items?.[id];
  if(!s||!it||!V.compatibleEquipment(it,slot)||V.packQty(s,id)<1)return false;
  const rq=V.requirement(s,it);
  if(!rq.met){
    RF.UI.modal={type:'message',title:'Requirement Not Met',text:`Requires ${RF.DATA.skills?.[rq.req.skill]?.name||rq.req.skill} level ${rq.req.level}.`};
    RF.UI.render(s);return false;
  }
  s.equipment=s.equipment||{};
  const oldId=s.equipment[slot]||null;
  if(oldId===id){
    RF.UI.modal={type:'message',title:'Already Equipped',text:`${it.name} is already equipped in ${V.slotLabel(slot)}.`};RF.UI.render(s);return false;
  }
  // The incoming physical copy leaves Pack. The replaced detached copy returns to Pack.
  if(RF.V1053?.removePackOne){if(!RF.V1053.removePackOne(s,id))return false}
  else RF.takeItem?.(s,id,1);
  if(oldId){
    if(RF.V1053?.addPackOne)RF.V1053.addPackOne(s,oldId);
    else RF.forceLoadoutItemToPack?.(s,oldId,1,'Loadout item returned to Pack');
  }
  s.equipment[slot]=id;
  RF.log?.(s,oldId?`Equipped ${it.name} to ${V.slotLabel(slot)}; ${RF.DATA.items?.[oldId]?.name||oldId} returned to the Pack.`:`Equipped ${it.name} to ${V.slotLabel(slot)}.`,'good');
  RF.save?.(s);RF.UI.render(s);return true;
};
RF.unequipSlot=function(slot){
  const s=RF.state,id=s?.equipment?.[slot];if(!s||!id)return false;
  if(RF.V1053?.addPackOne)RF.V1053.addPackOne(s,id);
  else RF.forceLoadoutItemToPack?.(s,id,1,'Loadout item returned to Pack');
  s.equipment[slot]=null;
  RF.log?.(s,`${RF.DATA.items?.[id]?.name||id} returned to the Pack.`);
  RF.save?.(s);RF.UI.render(s);return true;
};
RF.unequipToolSlot=function(type){
  const s=RF.state,id=s?.toolbelt?.[type];if(!s||!id)return false;
  if(RF.V1053?.addPackOne)RF.V1053.addPackOne(s,id);
  else RF.forceLoadoutItemToPack?.(s,id,1,'Tool Belt item returned to Pack');
  s.toolbelt[type]=null;
  RF.log?.(s,`${RF.DATA.items?.[id]?.name||id} returned to the Pack.`);
  RF.save?.(s);RF.UI.render(s);return true;
};

// Legacy generic equip remains useful outside the detail UI. Rings choose the first empty ring
// before replacing Ring I, so direct callers no longer make Ring II effectively unreachable.
const equipBase=RF.equip;
RF.equip=function(id){
  const it=RF.DATA.items?.[id];
  if(it?.tool)return RF.equipTool(id);
  if(V.isRingItem(it)){
    const s=RF.state,slot=!s?.equipment?.ring1?'ring1':!s?.equipment?.ring2?'ring2':'ring1';
    return RF.equipToSlot(id,slot);
  }
  if(it?.slot)return RF.equipToSlot(id,it.slot);
  return equipBase?.apply(this,arguments);
};

// ----- Slot managers -----
V.equipmentCandidates=function(s,slot){
  return Object.entries(s?.inventory||{}).filter(([,q])=>(+q||0)>0).map(([id,q])=>({id,q,it:RF.DATA.items?.[id]}))
    .filter(x=>V.compatibleEquipment(x.it,slot))
    .sort((a,b)=>{
      const ar=RF.itemRequirement?.(a.it)?.level||0,br=RF.itemRequirement?.(b.it)?.level||0;
      return (ar-br)||(V.rarityRank(a.it?.rarity)-V.rarityRank(b.it?.rarity))||String(a.it?.name||a.id).localeCompare(String(b.it?.name||b.id));
    });
};
V.toolCandidates=function(s,type){
  return Object.entries(s?.inventory||{}).filter(([,q])=>(+q||0)>0).map(([id,q])=>({id,q,it:RF.DATA.items?.[id]}))
    .filter(x=>x.it?.tool===type)
    .sort((a,b)=>(V.toolValue(a.it,'tier')-V.toolValue(b.it,'tier'))||String(a.it?.name||a.id).localeCompare(String(b.it?.name||b.id)));
};
V.candidateTile=function(x,kind,slot){
  const it=x.it;if(!it)return'';
  const meta=kind==='toolbelt'?`Tier ${it.tier||1} • Power ${it.power||0}`:`⚔️ ${V.statValue(it,'damage')} • 🛡️ ${V.statValue(it,'armor')}`;
  return `<button type="button" class="v115Candidate" data-v115-candidate="${V.escape(x.id)}" data-v115-kind="${kind}" data-v115-slot="${V.escape(slot)}"><span class="v115CandidateIcon">${it.icon||'📦'}</span><span class="v115CandidateMeta"><b>${V.escape(it.name)}</b><small>${V.escape(it.rarity||it.type||'Item')} • ${V.escape(meta)}</small></span><span class="v115CandidateQty">×${x.q}</span><span class="chev">›</span></button>`;
};
V.currentEquipmentHtml=function(s,slot){
  const id=s?.equipment?.[slot],it=id?RF.DATA.items?.[id]:null;
  if(!it)return `<div class="v115Current empty"><span>${V.slotMeta(slot)[1]}</span><div><small>CURRENT</small><b>Empty ${V.escape(V.slotLabel(slot))}</b><p>Select any compatible item from your Pack below.</p></div></div>`;
  const rq=V.requirement(s,it);
  return `<div class="v115Current"><span>${it.icon||'📦'}</span><div><small>CURRENT • ${V.escape(V.slotLabel(slot))}</small><b>${V.escape(it.name)}</b><p>${V.escape(it.desc||'No description recorded.')}</p><div class="v115MiniStats"><i>⚔️ ${V.statValue(it,'damage')} damage</i><i>🛡️ ${V.statValue(it,'armor')} armour</i>${rq.req?`<i>${rq.met?'✓':'🔒'} ${V.escape(RF.DATA.skills?.[rq.req.skill]?.name||rq.req.skill)} ${rq.req.level}</i>`:''}</div></div></div>`;
};
V.currentToolHtml=function(s,type){
  const id=s?.toolbelt?.[type],it=id?RF.DATA.items?.[id]:null,label=RF.v103ToolLabel?.(type)||type;
  if(!it)return `<div class="v115Current empty"><span>${RF.V1050?.toolIcon?.(type)||'🧰'}</span><div><small>CURRENT</small><b>Empty ${V.escape(label)} slot</b><p>Select a compatible tool from your Pack below.</p></div></div>`;
  return `<div class="v115Current"><span>${it.icon||'🧰'}</span><div><small>CURRENT • ${V.escape(label)}</small><b>${V.escape(it.name)}</b><p>${V.escape(it.desc||'No description recorded.')}</p><div class="v115MiniStats"><i>⭐ Tier ${it.tier||1}</i><i>⚙️ Power ${it.power||0}</i><i>🎯 Control +${Math.round((it.control||0)*100)}%</i></div></div></div>`;
};
V.slotManagerHtml=function(s,m){
  const kind=m.kind==='toolbelt'?'toolbelt':'equipment',slot=m.slot;
  const currentId=kind==='toolbelt'?s.toolbelt?.[slot]:s.equipment?.[slot];
  const candidates=kind==='toolbelt'?V.toolCandidates(s,slot):V.equipmentCandidates(s,slot);
  const title=kind==='toolbelt'?(RF.v103ToolLabel?.(slot)||slot):V.slotLabel(slot);
  const icon=kind==='toolbelt'?(RF.V1050?.toolIcon?.(slot)||'🧰'):V.slotMeta(slot)[1];
  const current=kind==='toolbelt'?V.currentToolHtml(s,slot):V.currentEquipmentHtml(s,slot);
  const rows=candidates.map(x=>V.candidateTile(x,kind,slot)).join('');
  return `<div class="modalBack"><div class="modal v115SlotModal"><button type="button" class="v1123CloseX v115TopClose" data-v115-close aria-label="Close">✕</button><span class="eyebrow">${kind==='toolbelt'?'TOOL BELT':'EQUIPMENT'} SLOT</span><h2>${icon} ${V.escape(title)}</h2>${current}${currentId?`<button type="button" class="v115Return" data-v115-unequip-slot="${V.escape(slot)}" data-v115-kind="${kind}">Return current to Pack</button>`:''}<div class="v115AvailableHead"><h3>Available in Pack</h3><span>${candidates.length}</span></div><div class="v115CandidateList">${rows||'<div class="v115NoCandidates">No compatible items are currently in your Pack.</div>'}</div><div class="notice">Equipped copies live in ${kind==='toolbelt'?'your Tool Belt':'Equipment'} and do not consume Pack slots. Spare duplicate copies can still exist in the Pack.</div></div></div>`;
};

// ----- Detail / comparison modal -----
V.itemStatsHtml=function(it){
  const stats=[];
  if(it.damage)stats.push(`⚔️ ${it.damage} damage`);
  if(it.armor)stats.push(`🛡️ ${it.armor} armour`);
  if(it.tier)stats.push(`⭐ Tier ${it.tier}`);
  if(it.power!=null)stats.push(`⚙️ Work power ${it.power}`);
  if(it.control!=null)stats.push(`🎯 Control +${Math.round((it.control||0)*100)}%`);
  if(it.heal)stats.push(`❤️ Restores ${it.heal} HP`);
  if(it.stamina)stats.push(`🟢 Restores ${it.stamina} stamina`);
  if(it.value!=null)stats.push(`🪙 Base value ${it.value}g`);
  return stats.length?`<div class="itemStats">${stats.map(x=>`<span>${V.escape(x)}</span>`).join('')}</div>`:'';
};
V.equipButtons=function(s,id,it,targetSlot=null){
  const q=V.packQty(s,id),rq=V.requirement(s,it),disabled=q<1||!rq.met;
  if(it.tool){
    const label=RF.v103ToolLabel?.(it.tool)||it.tool;
    return q<1?`<div class="notice">Withdraw a copy to your Pack before equipping it to the ${V.escape(label)} Tool Belt slot.</div>`:`<button class="choice" data-v115-equip-tool="${V.escape(id)}" ${disabled?'disabled':''}><b>${rq.met?`Equip to ${V.escape(label)}`:'Level requirement not met'}</b></button>`;
  }
  if(!it.slot)return'';
  const slots=targetSlot?[targetSlot]:RF.equipmentSlotsForItem(it);
  if(q<1)return `<div class="notice">Withdraw a copy to your Pack before equipping it.</div>`;
  return slots.map(slot=>{
    const cur=s.equipment?.[slot],curName=RF.DATA.items?.[cur]?.name||'Empty';
    return `<button class="choice" data-v115-equip-slot="${V.escape(slot)}" data-v115-equip-id="${V.escape(id)}" ${disabled?'disabled':''}><b>${rq.met?`Equip to ${V.escape(V.slotLabel(slot))}`:'Level requirement not met'}</b><small>Currently: ${V.escape(curName)}</small></button>`;
  }).join('');
};
V.detailHtml=function(s,id,opt={}){
  const it=RF.DATA.items?.[id];if(!it)return'';
  const q=V.packQty(s,id),rq=V.requirement(s,it),targetSlot=opt.targetSlot||null;
  let compare='';
  if(it.tool)compare=V.toolCompareHtml(s,it,it.tool);
  else if(it.slot){
    const slots=targetSlot?[targetSlot]:RF.equipmentSlotsForItem(it);
    compare=`<div class="v115Compare"><div class="v115CompareTitle">Compared with worn gear</div>${slots.map(slot=>V.equipmentCompareHtml(s,it,slot)).join('')}</div>`;
  }
  const reqHtml=rq.req?`<div class="requirement ${rq.met?'met':'unmet'}">${rq.met?'✓':'🔒'} Requires ${V.escape(RF.DATA.skills?.[rq.req.skill]?.name||rq.req.skill)} Lv ${rq.req.level} • You: ${rq.have}</div>`:'';
  const back=opt.backToSlot?`<button class="choice" data-v115-back-slot="${V.escape(opt.backToSlot)}" data-v115-kind="${opt.kind||'equipment'}"><b>Back to ${V.escape(opt.kind==='toolbelt'?(RF.v103ToolLabel?.(opt.backToSlot)||opt.backToSlot):V.slotLabel(opt.backToSlot))}</b></button>`:'';
  const drop=q>0?`<button class="choice dangerChoice" data-drop-item="${V.escape(id)}"><b>Drop 1</b><small>Permanently discard one carried copy.</small></button>${q>1?`<button class="choice dangerChoice" data-drop-all="${V.escape(id)}"><b>Drop All (${q})</b></button>`:''}`:'';
  return `<div class="modalBack"><div class="modal itemModal v115ItemModal"><div class="itemHero">${it.icon||'📦'}</div><span class="eyebrow">${V.escape(it.rarity||it.type||'ITEM')} • ${q?`PACK ×${q}`:'NOT IN PACK'}</span><h2>${V.escape(it.name)}</h2><div class="itemDesc">${V.escape(it.desc||'No description recorded.')}</div>${V.itemStatsHtml(it)}${compare}${reqHtml}<div class="choices">${V.equipButtons(s,id,it,targetSlot)}${back}${drop}<button class="choice" data-v115-close><b>Close</b></button></div></div></div>`;
};

// Make every loadout tile, including empty ones, interactive.
if(RF.V1050){
  RF.V1050.slotTile=function(s,slot,slotIcon,label){
    const id=s.equipment?.[slot],it=id?RF.DATA.items?.[id]:null;
    return `<button type="button" class="v1050LoadoutTile ${it?'equipped':'empty'}" data-v115-open-slot="${V.escape(slot)}" data-v115-kind="equipment" aria-label="Manage ${V.escape(label)}"><div class="v1050TileIcon ${it?'':'muted'}">${it?.icon||slotIcon}</div><div class="v1050TileLabel">${V.escape(label)}</div><div class="v1050TileName ${it?'':'muted'}">${V.escape(it?.name||'Empty slot')}</div><div class="v1050TileFoot"><span>${it?'EQUIPPED':'TAP TO EQUIP'}</span></div></button>`;
  };
  RF.V1050.toolTile=function(s,type){
    const id=s.toolbelt?.[type],it=id?RF.DATA.items?.[id]:null,label=RF.v103ToolLabel?.(type)||type;
    return `<button type="button" class="v1050LoadoutTile ${it?'equipped':'empty'}" data-v115-open-slot="${V.escape(type)}" data-v115-kind="toolbelt" aria-label="Manage ${V.escape(label)} Tool Belt slot"><div class="v1050TileIcon ${it?'':'muted'}">${it?.icon||RF.V1050.toolIcon?.(type)||'🧰'}</div><div class="v1050TileLabel">${V.escape(label)}</div><div class="v1050TileName ${it?'':'muted'}">${V.escape(it?.name||'Empty slot')}</div><div class="v1050TileFoot"><span>${it?`TIER ${it.tier||1}`:'TAP TO EQUIP'}</span></div></button>`;
  };
  const equipmentPageBase=RF.UI.equipmentPage?.bind(RF.UI);
  if(equipmentPageBase)RF.UI.equipmentPage=function(s){return equipmentPageBase(s).replace('Tap an equipped item for details, requirements and unequip controls.','Tap any slot to inspect the current item and see every compatible replacement in your Pack.')};
  const toolbeltPageBase=RF.UI.toolbeltPage?.bind(RF.UI);
  if(toolbeltPageBase)RF.UI.toolbeltPage=function(s){return toolbeltPageBase(s).replace('Tap an equipped tool for details or to unequip it.','Tap any Tool Belt slot to inspect it and choose from compatible tools currently in your Pack.')};
}

// Extend ordinary Pack item details for equipment/tools with live loadout comparisons.
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type==='v115Slot')return V.slotManagerHtml(s,m);
  if(m?.type==='v115Candidate')return V.detailHtml(s,m.id,{targetSlot:m.slot,backToSlot:m.slot,kind:m.kind});
  if(m?.type==='v1053LoadoutDetail')return V.slotManagerHtml(s,{kind:m.kind||'equipment',slot:m.slot});
  if(m?.type==='itemDetail'){
    const it=RF.DATA.items?.[m.id];
    if(it&&(it.slot||it.tool))return V.detailHtml(s,m.id,{});
  }
  return modalBase(s);
};

const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelectorAll('[data-v115-open-slot]').forEach(b=>b.onclick=()=>{RF.UI.modal={type:'v115Slot',kind:b.dataset.v115Kind,slot:b.dataset.v115OpenSlot};RF.UI.render(RF.state)});
  document.querySelectorAll('[data-v115-candidate]').forEach(b=>b.onclick=()=>{RF.UI.modal={type:'v115Candidate',id:b.dataset.v115Candidate,kind:b.dataset.v115Kind,slot:b.dataset.v115Slot};RF.UI.render(RF.state)});
  document.querySelectorAll('[data-v115-equip-slot]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.v115EquipId,slot=b.dataset.v115EquipSlot,ok=RF.equipToSlot(id,slot);if(ok===false)return;
    RF.UI.modal={type:'v115Slot',kind:'equipment',slot};RF.UI.render(RF.state);
  });
  document.querySelectorAll('[data-v115-equip-tool]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.v115EquipTool,it=RF.DATA.items?.[id],ok=RF.equipTool(id);if(ok===false)return;
    RF.UI.modal={type:'v115Slot',kind:'toolbelt',slot:it.tool};RF.UI.render(RF.state);
  });
  document.querySelectorAll('[data-v115-unequip-slot]').forEach(b=>b.onclick=()=>{
    const slot=b.dataset.v115UnequipSlot,kind=b.dataset.v115Kind;
    const ok=kind==='toolbelt'?RF.unequipToolSlot(slot):RF.unequipSlot(slot);if(ok===false)return;
    RF.UI.modal={type:'v115Slot',kind,slot};RF.UI.render(RF.state);
  });
  document.querySelectorAll('[data-v115-back-slot]').forEach(b=>b.onclick=()=>{RF.UI.modal={type:'v115Slot',kind:b.dataset.v115Kind,slot:b.dataset.v115BackSlot};RF.UI.render(RF.state)});
  document.querySelectorAll('[data-v115-close],[data-v115-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
};

// ----- Vault long-press equipment details -----
if(RF.V1042){
  const B=RF.V1042;
  B.showInfo=function(id){
    const s=RF.state,it=RF.DATA.items?.[id];if(!s||!it)return;
    B.closeInfo();
    const info=B.itemInfo(s,id),q=V.packQty(s,id),side=B.tab?.(s)||'pack',rq=V.requirement(s,it);
    let compare='';
    if(it.tool)compare=V.toolCompareHtml(s,it,it.tool);
    else if(it.slot)compare=`<div class="v115Compare v115BankCompare"><div class="v115CompareTitle">Compared with worn gear</div>${RF.equipmentSlotsForItem(it).map(slot=>V.equipmentCompareHtml(s,it,slot)).join('')}</div>`;
    let actions='';
    if(it.tool||it.slot){
      actions=q>0?`<div class="v115BankActions">${it.tool?`<button type="button" data-v115-bank-tool="${V.escape(id)}" ${rq.met?'':'disabled'}>Equip to ${V.escape(RF.v103ToolLabel?.(it.tool)||it.tool)}</button>`:RF.equipmentSlotsForItem(it).map(slot=>`<button type="button" data-v115-bank-equip="${V.escape(id)}" data-v115-bank-slot="${V.escape(slot)}" ${rq.met?'':'disabled'}>Equip to ${V.escape(V.slotLabel(slot))}</button>`).join('')}</div>`:`<div class="notice">${side==='bank'?'Withdraw':'Move'} a copy to your Pack before equipping it.</div>`;
    }
    const back=document.createElement('div');
    back.className='v1042BankInfoBack';
    back.innerHTML=`<div class="v1042BankInfoModal v115BankInfo" role="dialog" aria-modal="true" aria-label="${V.escape(info.name)} details"><div class="v1042BankInfoHero"><div class="v1042BankInfoIcon">${info.icon}</div><div><span class="eyebrow">ITEM DETAILS</span><h2>${V.escape(info.name)}</h2></div></div><p class="v1042BankInfoDesc">${V.escape(info.desc)}</p><div class="v1042BankInfoRows">${info.rows.map(([k,val])=>`<div><span>${V.escape(k)}</span><b>${V.escape(val)}</b></div>`).join('')}</div>${compare}${rq.req?`<div class="requirement ${rq.met?'met':'unmet'}">${rq.met?'✓':'🔒'} Requires ${V.escape(RF.DATA.skills?.[rq.req.skill]?.name||rq.req.skill)} Lv ${rq.req.level} • You: ${rq.have}</div>`:''}${actions}<button class="v1042BankInfoClose">Close</button></div>`;
    document.body.appendChild(back);
    back.addEventListener('click',e=>{
      const eq=e.target.closest('[data-v115-bank-equip]');
      if(eq){B.closeInfo();const ok=RF.equipToSlot(eq.dataset.v115BankEquip,eq.dataset.v115BankSlot);if(ok!==false)RF.UI.render(RF.state);return}
      const tl=e.target.closest('[data-v115-bank-tool]');
      if(tl){B.closeInfo();const ok=RF.equipTool(tl.dataset.v115BankTool);if(ok!==false)RF.UI.render(RF.state);return}
      if(e.target===back||e.target.closest('.v1042BankInfoClose'))B.closeInfo();
    });
    navigator.vibrate?.(18);
  };
}

// Migration is deliberately non-destructive. V10.53 remains the owner of detached-copy
// extraction, so legitimate spare duplicate tools/rings in Pack are never guessed away.
V.migrate=function(s){
  if(!s)return s;
  s.v115=s.v115||{};s.equipment=s.equipment||{};s.toolbelt=s.toolbelt||{};s.inventory=s.inventory||{};
  V.EQUIP_SLOTS.forEach(([slot])=>{if(!(slot in s.equipment))s.equipment[slot]=null});
  if(RF.V1053?.migrate)RF.V1053.migrate(s);
  s.version='11.5.0';s.v115.loadoutManager=true;
  return s;
};
const newBase=RF.newGame;RF.newGame=function(...a){return V.migrate(newBase(...a))};
const loadBase=RF.load;RF.load=function(){return V.migrate(loadBase())};
const importBase=RF.importSave;RF.importSave=function(x){return V.migrate(importBase(x))};
if(RF.V95){RF.V95.SCHEMA='11.5.0';const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s))}

const oldStyle=document.getElementById('v115-loadout-manager-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v115-loadout-manager-style';st.textContent=`
.v1050LoadoutTile.empty{opacity:.78;cursor:pointer}.v1050LoadoutTile.empty:active{opacity:1}.v1050LoadoutTile.empty .v1050TileFoot{color:#b99f6f}
.v115SlotModal{position:relative;width:min(620px,100%);max-height:90dvh;overflow:auto;padding:20px 16px 18px}.v115TopClose{position:absolute;top:12px;right:12px}.v115SlotModal>h2{padding-right:48px;margin:3px 0 12px}
.v115Current{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;padding:13px;border:1px solid rgba(201,159,84,.22);border-radius:17px;background:linear-gradient(180deg,rgba(43,32,21,.72),rgba(19,14,10,.88));margin:10px 0}.v115Current>span{width:56px;height:56px;border-radius:15px;display:grid;place-items:center;font-size:34px;background:rgba(255,255,255,.035);border:1px solid rgba(223,183,104,.14)}.v115Current small{display:block;color:#ac9870;font-size:8px;font-weight:900;letter-spacing:.12em;margin-bottom:2px}.v115Current b{display:block;color:#f2dda9;font-size:16px}.v115Current p{margin:5px 0 0;color:#b9aa91;font-size:11px;line-height:1.4}.v115Current.empty{opacity:.78}
.v115MiniStats{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.v115MiniStats i{font-style:normal;font-size:9px;color:#d6c49e;background:rgba(255,255,255,.04);border:1px solid rgba(202,163,91,.14);border-radius:999px;padding:4px 7px}
.v115Return{width:100%;min-height:42px;border-radius:13px;border:1px solid rgba(199,155,80,.28);background:linear-gradient(180deg,rgba(66,47,27,.82),rgba(38,28,19,.92));color:#eddbb2;font:inherit;font-weight:750;margin-bottom:12px}.v115AvailableHead{display:flex;align-items:center;justify-content:space-between;margin:8px 0}.v115AvailableHead h3{margin:0}.v115AvailableHead span{min-width:28px;height:25px;padding:0 8px;border-radius:999px;display:grid;place-items:center;background:#294b2a;border:1px solid #6fa464;color:#d6edbd;font-size:10px;font-weight:850}
.v115CandidateList{display:grid;gap:8px}.v115Candidate{appearance:none;width:100%;display:grid;grid-template-columns:44px minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:10px;border:1px solid rgba(201,159,84,.18);border-radius:15px;background:linear-gradient(180deg,rgba(39,29,20,.86),rgba(18,13,10,.96));color:#f0dfb9;text-align:left}.v115CandidateIcon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:26px;border:1px solid rgba(223,183,104,.13);background:rgba(255,255,255,.03)}.v115CandidateMeta{min-width:0}.v115CandidateMeta b{display:block;font-size:12px}.v115CandidateMeta small{display:block;margin-top:2px;color:#aa9a80;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v115CandidateQty{font-size:11px;font-weight:800;color:#e7ce94}.v115NoCandidates{padding:22px 12px;text-align:center;color:#a99a83;border:1px dashed rgba(201,159,84,.18);border-radius:14px}
.v115Compare{display:grid;gap:8px;margin:13px 0}.v115CompareTitle{font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;color:#ae9870}.v115CompareCard{border:1px solid rgba(199,157,83,.2);border-radius:14px;padding:9px 10px;background:rgba(12,9,7,.25)}.v115CompareHead{display:flex;justify-content:space-between;gap:10px;align-items:center}.v115CompareHead span{font-size:9px;color:#aa9878;text-transform:uppercase;letter-spacing:.08em}.v115CompareHead b{font-size:10px;color:#dfcda7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v115DeltaGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px}.v115ToolDelta{grid-template-columns:repeat(3,minmax(0,1fr))}.v115Delta{display:flex;align-items:center;justify-content:space-between;gap:5px;border-radius:10px;padding:6px 7px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}.v115Delta small{font-size:8px;color:#a99b84}.v115Delta b{font-size:10px}.v115Delta.good b{color:#9ed79a}.v115Delta.bad b{color:#e89b8e}.v115Delta.same b{color:#c4b69b}
.v115BankCompare{margin:12px 0}.v115BankActions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:12px}.v115BankActions button{min-height:42px;border-radius:12px;border:1px solid rgba(216,173,87,.35);background:linear-gradient(180deg,rgba(91,63,29,.9),rgba(52,36,21,.96));color:#f1deb4;font:inherit;font-weight:750;font-size:10px}.v115BankActions button:disabled{opacity:.4}
@media(max-width:430px){.v115SlotModal{padding:17px 12px 14px}.v115Current{grid-template-columns:50px minmax(0,1fr);gap:10px}.v115Current>span{width:48px;height:48px;font-size:29px}.v115Current b{font-size:14px}.v115Candidate{grid-template-columns:40px minmax(0,1fr) auto auto;padding:9px 8px;gap:8px}.v115CandidateIcon{width:38px;height:38px;font-size:24px}.v115CandidateMeta b{font-size:11px}.v115BankActions{grid-template-columns:1fr}.v115ToolDelta{grid-template-columns:1fr 1fr 1fr}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
