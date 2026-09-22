/* Realmforge V12.4.0 — Pack Item Dossier.
   Final post-compatibility owner for Pack item detail presentation and actions.
   Reuses canonical Codex knowledge without adding persistent state. */
(() => {
  'use strict';
  const RF=window.RF;if(!RF?.UI)return;
  const V=RF.Views.ItemDetail=RF.Views.ItemDetail||{};
  V.version='12.4.0';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=v=>String(v||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const qty=(s,id)=>Math.max(0,Number(s?.inventory?.[id])||0);
  const db=()=>RF.Views?.Database?.V123||RF.Views?.Database?.V122||null;

  V.sourcesFor=function(id){return typeof RF.v94ItemSources==='function'?RF.v94ItemSources(id):[]};
  V.usesFor=function(id){return db()?.recipeUsesForItem?.(id)||[]};
  V.requirement=function(s,it){
    if(RF.V115?.requirement)return RF.V115.requirement(s,it);
    const r=RF.itemRequirement?.(it);if(!r)return {req:null,met:true,have:0};
    const have=Math.max(1,+s?.skills?.[r.skill]?.level||1);return {req:r,met:have>=r.level,have};
  };

  V.contextLine=function(id,it){
    const uses=V.usesFor(id),n=uses.length,type=String(it?.type||'item').toLowerCase();
    if(it?.tool){const skill=RF.DATA.skills?.[it.tool]?.name||title(it.tool);return `A Tier ${Number(it.tier)||1} ${skill} tool carried in the Tool Belt. Equipping it replaces the current ${skill} tool and keeps the equipped copy outside Pack capacity.`;}
    if(it?.slot){const slots=RF.equipmentSlotsForItem?.(it)||[it.slot];const where=slots.map(x=>RF.V115?.slotLabel?.(x)||title(x)).join(' or ');return `Wearable equipment for ${where}.${n?` It is also used in ${n} known production ${n===1?'recipe':'recipes'}.`:''}`;}
    if(it?.heal||it?.stamina){const bits=[];if(it.heal)bits.push(`${it.heal} health`);if(it.stamina)bits.push(`${it.stamina} stamina`);return `Consumable provisions that restore ${bits.join(' and ')} when used from the Pack.${n?` It also appears in ${n} production ${n===1?'recipe':'recipes'}.`:''}`;}
    if(type==='material'||type==='ammo'){return n?`A production material with ${n} known ${n===1?'use':'uses'} across the realm. The recipes below are generated from the live crafting data.`:'A carried material with no currently recorded production use.';}
    if(type==='quest')return 'A quest-related object. Keep it safe while its associated objective remains active.';
    if(type==='treasure')return n?`A valuable curiosity that also appears in ${n} production ${n===1?'recipe':'recipes'}.`:'A valuable curiosity with no standard production use recorded.';
    return n?`This item appears in ${n} known production ${n===1?'recipe':'recipes'}.`:'A recorded item from your Pack.';
  };

  V.statPills=function(it){
    const rows=[];
    if(it.damage)rows.push(['⚔️','Damage',it.damage]);
    if(it.armor)rows.push(['🛡️','Armour',it.armor]);
    if(it.heal)rows.push(['❤️','Restores',`${it.heal} HP`]);
    if(it.stamina)rows.push(['🟢','Restores',`${it.stamina} stamina`]);
    if(it.tier)rows.push(['⭐','Tier',it.tier]);
    if(it.power!=null)rows.push(['⚙️','Work power',it.power]);
    if(it.control!=null)rows.push(['🎯','Control',`+${Math.round(Number(it.control)*100)}%`]);
    rows.push(['🪙','Base value',`${Number(it.value)||0}g`]);
    return `<div class="v124Stats">${rows.map(([icon,k,v])=>`<div><span>${icon}</span><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>`;
  };

  V.comparisonHtml=function(s,it){
    if(it.tool&&RF.V115?.toolCompareHtml)return `<section class="v124Section"><div class="v124SectionTitle">Tool Belt comparison</div>${RF.V115.toolCompareHtml(s,it,it.tool)}</section>`;
    if(it.slot&&RF.V115?.equipmentCompareHtml){
      const slots=RF.equipmentSlotsForItem?.(it)||[it.slot];
      return `<section class="v124Section"><div class="v124SectionTitle">Compared with worn gear</div><div class="v124Compare">${slots.map(slot=>RF.V115.equipmentCompareHtml(s,it,slot)).join('')}</div></section>`;
    }
    return '';
  };

  V.sourcesHtml=function(id){
    const src=V.sourcesFor(id);
    return `<section class="v124Section"><div class="v124SectionTitle">Known Sources</div><div class="v124Text">${src.length?src.map(esc).join('<br>'):'No standard source recorded.'}</div></section>`;
  };
  V.usesHtml=function(id){
    const html=db()?.usesHtml?.(id)||'';
    return html?`<section class="v124Section v124Uses">${html}</section>`:'';
  };

  V.action=function({icon,label,sub='',attr='',disabled=false,danger=false}){
    return `<button type="button" class="v124Action${danger?' danger':''}" ${attr} ${disabled?'disabled':''}><span>${icon}</span><b>${esc(label)}</b>${sub?`<small>${esc(sub)}</small>`:''}</button>`;
  };
  V.actions=function(s,id,it){
    const q=qty(s,id),rq=V.requirement(s,it),out=[];
    if(it.heal||it.stamina)out.push(V.action({icon:'✨',label:'Use',sub:it.heal?`Restore ${it.heal} HP`:`Restore ${it.stamina} stamina`,attr:`data-v124-use="${esc(id)}"`}));
    if(it.tool){
      const label=RF.v103ToolLabel?.(it.tool)||title(it.tool);
      out.push(V.action({icon:it.icon||'🧰',label:`Equip`,sub:`${label} Tool Belt`,attr:`data-v124-equip-tool="${esc(id)}"`,disabled:q<1||!rq.met}));
    }else if(it.slot){
      const slots=RF.equipmentSlotsForItem?.(it)||[it.slot];
      slots.forEach(slot=>out.push(V.action({icon:RF.V115?.slotMeta?.(slot)?.[1]||it.icon||'🛡️',label:'Equip',sub:RF.V115?.slotLabel?.(slot)||title(slot),attr:`data-v124-equip-slot="${esc(slot)}" data-v124-equip-id="${esc(id)}"`,disabled:q<1||!rq.met})));
    }
    if(q>0)out.push(V.action({icon:'🗑️',label:'Drop 1',sub:'Discard one',attr:`data-v124-drop-one="${esc(id)}"`,danger:true}));
    if(q>1)out.push(V.action({icon:'🗑️',label:`Drop All`,sub:`Discard ${q}`,attr:`data-v124-drop-all="${esc(id)}"`,danger:true}));
    out.push(V.action({icon:'✕',label:'Close',sub:'Return to Pack',attr:'data-v124-close'}));
    return `<div class="v124ActionGrid" style="--v124-cols:${Math.min(4,out.length)}">${out.join('')}</div>`;
  };

  V.detailHtml=function(s,id){
    const it=RF.DATA.items?.[id],q=qty(s,id);if(!it||q<1)return '';
    const rq=V.requirement(s,it),req=rq.req?`<div class="v124Requirement ${rq.met?'met':'unmet'}"><span>${rq.met?'✓':'🔒'}</span><div><b>${rq.met?'Requirement met':'Requirement locked'}</b><small>${esc(RF.DATA.skills?.[rq.req.skill]?.name||rq.req.skill)} Lv ${rq.req.level} • You: ${rq.have}</small></div></div>`:'';
    const rarity=it.rarity||'Common',type=title(it.type||'Item');
    return `<div class="modalBack v124Back"><div class="modal v124ItemModal"><button type="button" class="v124TopClose" data-v124-close aria-label="Close">✕</button><span class="v124Eyebrow">PACK DOSSIER • ${esc(type.toUpperCase())}</span><div class="v124Hero"><span class="v124HeroIcon">${it.icon||'📦'}</span><div><span class="v124Owned">${esc(rarity)} • ${esc(type)} • OWNED ×${q}</span><h2>${esc(it.name||id)}</h2></div></div><div class="v124Description"><p>${esc(it.desc||'No description recorded.')}</p><small>${esc(V.contextLine(id,it))}</small></div>${V.statPills(it)}${req}${V.comparisonHtml(s,it)}${V.sourcesHtml(id)}${V.usesHtml(id)}<section class="v124Actions"><div class="v124SectionTitle">Actions</div>${V.actions(s,id,it)}</section></div></div>`;
  };

  const modalBase=RF.UI.modalHtml.bind(RF.UI);
  RF.UI.modalHtml=function(s){
    const m=this.modal;
    if(m?.type==='itemDetail'&&qty(s,m.id)>0)return V.detailHtml(s,m.id);
    return modalBase(s);
  };

  const bindBase=RF.UI.bind.bind(RF.UI);
  RF.UI.bind=function(s){
    bindBase(s);
    document.querySelectorAll('[data-v124-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
    document.querySelectorAll('[data-v124-use]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124Use;RF.useItem?.(id);
      if((RF.state?.inventory?.[id]||0)>0)RF.UI.modal={type:'itemDetail',id};else RF.UI.modal=null;
      RF.UI.render(RF.state);
    });
    document.querySelectorAll('[data-v124-drop-one]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124DropOne;RF.dropItem?.(id,1);
      RF.UI.modal=(RF.state?.inventory?.[id]||0)>0?{type:'itemDetail',id}:null;RF.UI.render(RF.state);
    });
    document.querySelectorAll('[data-v124-drop-all]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124DropAll;RF.dropItem?.(id,Math.max(0,RF.state?.inventory?.[id]||0));RF.UI.modal=null;RF.UI.render(RF.state);
    });
    document.querySelectorAll('[data-v124-equip-tool]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124EquipTool,it=RF.DATA.items?.[id],ok=RF.equipTool?.(id);if(ok===false)return;
      RF.UI.modal={type:'v115Slot',kind:'toolbelt',slot:it?.tool};RF.UI.render(RF.state);
    });
    document.querySelectorAll('[data-v124-equip-slot]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.v124EquipId,slot=b.dataset.v124EquipSlot,ok=RF.equipToSlot?.(id,slot);if(ok===false)return;
      RF.UI.modal={type:'v115Slot',kind:'equipment',slot};RF.UI.render(RF.state);
    });
  };

  const oldStyle=document.getElementById('rf-item-detail-v124-style');if(oldStyle)oldStyle.remove();
  const st=document.createElement('style');st.id='rf-item-detail-v124-style';st.textContent=`
  .v124ItemModal{position:relative;width:min(640px,100%);max-height:91dvh;overflow:auto;padding:19px 16px 16px;border:1px solid rgba(211,166,91,.32)!important;border-radius:24px!important;background:radial-gradient(circle at 86% 0,rgba(196,138,55,.13),transparent 28%),linear-gradient(150deg,#241c14,#12100d 72%)!important;box-shadow:0 24px 78px rgba(0,0,0,.72)!important;color:var(--ink)}
  .v124TopClose{position:absolute;z-index:2;top:12px;right:12px;width:40px;height:40px;border:1px solid rgba(211,166,91,.34);border-radius:13px;background:#251c13;color:#efce8b;font-size:20px;line-height:1}.v124Eyebrow{display:block;padding-right:48px;color:#a98a59;font-size:8.5px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
  .v124Hero{display:grid;grid-template-columns:70px minmax(0,1fr);gap:14px;align-items:center;margin-top:10px;padding:12px;border:1px solid rgba(211,168,98,.15);border-radius:18px;background:rgba(8,7,6,.22)}.v124HeroIcon{width:68px;height:68px;display:grid;place-items:center;border:1px solid rgba(215,170,96,.2);border-radius:17px;background:radial-gradient(circle at 35% 25%,rgba(224,181,108,.08),transparent 60%),#12100d;font-size:40px}.v124Hero h2{margin:4px 0 0;color:#f1dba9;font:700 24px/1.06 Georgia,serif}.v124Owned{color:#a59070;font-size:8.5px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}
  .v124Description{margin-top:10px;padding:12px 13px;border:1px solid #3c3127;border-radius:15px;background:#17130f}.v124Description p{margin:0;color:#e1d5c0;font-size:13px;line-height:1.48}.v124Description small{display:block;margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.055);color:#948874;font-size:9.5px;line-height:1.5}
  .v124Stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px}.v124Stats>div{min-width:0;display:grid;grid-template-columns:24px minmax(0,1fr);grid-template-rows:auto auto;column-gap:6px;padding:8px 9px;border:1px solid rgba(210,163,89,.16);border-radius:13px;background:#12100d}.v124Stats>div>span{grid-row:1/3;align-self:center;font-size:17px}.v124Stats small{color:#857864;font-size:7.5px;text-transform:uppercase;letter-spacing:.08em}.v124Stats b{color:#dcc79e;font-size:10.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .v124Requirement{display:grid;grid-template-columns:30px minmax(0,1fr);gap:8px;align-items:center;margin-top:10px;padding:9px 10px;border-radius:13px;border:1px solid rgba(102,145,92,.28);background:rgba(54,84,48,.16)}.v124Requirement.unmet{border-color:rgba(176,101,82,.34);background:rgba(105,46,36,.16)}.v124Requirement>span{font-size:18px;text-align:center}.v124Requirement b{display:block;color:#cfe0bd;font-size:10px}.v124Requirement.unmet b{color:#e5b0a0}.v124Requirement small{display:block;margin-top:2px;color:#9c8f7b;font-size:8.5px}
  .v124Section{margin-top:14px;min-width:0}.v124SectionTitle{margin:0 0 7px;color:#d7b978;font:700 13px/1.2 Georgia,serif}.v124Text{padding:10px 11px;border:1px solid #3c3127;border-radius:13px;background:#12100d;color:#bbae97;font-size:10px;line-height:1.55}.v124Compare{display:grid;gap:7px}.v124Uses .db123UsesTitle{display:none!important}.v124Uses .db123Uses{margin-top:0}
  .v124Actions{margin-top:16px;padding-top:13px;border-top:1px solid rgba(215,170,96,.13)}.v124ActionGrid{display:grid;grid-template-columns:repeat(var(--v124-cols,4),minmax(0,1fr));gap:8px}.v124Action{min-width:0;aspect-ratio:1/1;min-height:72px;padding:8px 5px;border:1px solid #4a3928;border-radius:15px;background:linear-gradient(155deg,#281e14,#17120e);color:#e7d6b7;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:inset 0 1px rgba(255,255,255,.025),0 5px 13px rgba(0,0,0,.17)}.v124Action:active{transform:scale(.975);border-color:#936b38}.v124Action>span{font-size:20px;line-height:1}.v124Action>b{display:block;margin-top:6px;font-size:9.5px;line-height:1.15}.v124Action>small{display:block;max-width:100%;margin-top:3px;color:#8f816d;font-size:7.5px;line-height:1.2;overflow:hidden;text-overflow:ellipsis}.v124Action.danger{border-color:rgba(155,71,57,.5);background:linear-gradient(155deg,rgba(76,35,28,.62),#17110e)}.v124Action.danger>b{color:#e4b0a2}.v124Action:disabled{opacity:.38;filter:saturate(.4);pointer-events:none}
  @media(max-width:390px){.v124ItemModal{padding:16px 12px 13px}.v124Hero{grid-template-columns:60px minmax(0,1fr);gap:11px;padding:10px}.v124HeroIcon{width:58px;height:58px;font-size:34px}.v124Hero h2{font-size:21px}.v124ActionGrid{gap:6px}.v124Action{min-height:66px;border-radius:13px;padding:6px 3px}.v124Action>span{font-size:18px}.v124Action>b{font-size:8.8px}.v124Action>small{font-size:7px}}
  `;document.head.appendChild(st);

  RF.Modules?.register?.('ui.itemDetail',V,{owner:'ui',status:'canonical',introducedIn:'12.4.0',persistence:'none'});
})();
