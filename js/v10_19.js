window.RF=window.RF||{};
RF.VERSION='10.19.0';
RF.V1019=RF.V1019||{};

/* Realmforge V10.19 — Greenvale Workshop
   - Crafting in Greenvale can use Pack + Bank materials.
   - Materials are always consumed from Pack first, then Bank.
   - Recipe availability/max batch and ingredient UI reflect the combined pool.
   - Active production/forge mishaps can also consume banked ingredients if the pack stack is exhausted.
*/

RF.V1019.canUseBank=function(s){return !!s&&s.location==='greenvale'&&!!s.bank;};
RF.V1019.packCount=function(s,id){return Math.max(0,+s?.inventory?.[id]||0);};
RF.V1019.bankCount=function(s,id){return RF.V1019.canUseBank(s)?Math.max(0,+s?.bank?.[id]||0):0;};
RF.V1019.craftCount=function(s,id){return RF.V1019.packCount(s,id)+RF.V1019.bankCount(s,id);};
RF.V1019.hasCraftItems=function(s,req){return Object.entries(req||{}).every(([id,q])=>RF.V1019.craftCount(s,id)>=q);};

// Remove crafting ingredients from the pack first. Only the remainder touches Greenvale Bank.
RF.V1019.takeCraftItem=function(s,id,qty=1){
  qty=Math.max(0,Math.floor(+qty||0));if(!qty)return true;
  if(RF.V1019.craftCount(s,id)<qty)return false;
  const packHave=RF.V1019.packCount(s,id),fromPack=Math.min(packHave,qty);
  if(fromPack>0)RF.takeItem(s,id,fromPack);
  let remaining=qty-fromPack;
  if(remaining>0){
    if(!RF.V1019.canUseBank(s)||(s.bank[id]||0)<remaining)return false;
    s.bank[id]-=remaining;
    if(s.bank[id]<=0)delete s.bank[id];
  }
  return true;
};
RF.V1019.takeCraftItems=function(s,req,mult=1){
  const need=Object.fromEntries(Object.entries(req||{}).map(([id,q])=>[id,q*mult]));
  if(!RF.V1019.hasCraftItems(s,need))return false;
  Object.entries(need).forEach(([id,q])=>RF.V1019.takeCraftItem(s,id,q));
  return true;
};

// Final craftability analysis. At Greenvale the Bank is part of the material pool.
RF.V1019.craftAnalysis=function(s,id){
  const r=RF.DATA.recipes?.[id];
  if(!r)return {max:0,blockers:['Recipe data is unavailable.'],materialMax:0};
  const blockers=[];
  const level=s.skills?.[r.skill]?.level||1;
  if(level<r.level)blockers.push(`Requires ${RF.DATA.skills?.[r.skill]?.name||r.skill} Lv ${r.level} (you are Lv ${level}).`);

  let materialMax=Infinity;
  for(const [itemId,qty] of Object.entries(r.inputs||{})){
    const have=RF.V1019.craftCount(s,itemId);
    materialMax=Math.min(materialMax,Math.floor(have/qty));
    if(have<qty){
      const pack=RF.V1019.packCount(s,itemId),bank=RF.V1019.bankCount(s,itemId);
      const where=RF.V1019.canUseBank(s)?`pack ${pack} + bank ${bank}`:`pack ${pack}`;
      blockers.push(`Need ${qty} × ${RF.DATA.items?.[itemId]?.name||itemId} (you have ${have}: ${where}).`);
    }
  }
  if(!Number.isFinite(materialMax))materialMax=0;
  materialMax=Math.max(0,materialMax);
  if(blockers.length)return {max:0,blockers,materialMax};

  // Greenvale outputs may overflow directly to the Bank, so pack capacity does not reduce batch size there.
  if(RF.V1019.canUseBank(s))return {max:materialMax,blockers:[],materialMax};

  const cap=RF.packCapacity?RF.packCapacity(s):(RF.V82?.PACK_CAP||28);
  const inv=s.inventory||{};
  const ids=new Set([...Object.keys(inv),...Object.keys(r.inputs||{}),...Object.keys(r.outputs||{})]);
  const slotsAfter=q=>{
    let slots=0;
    for(const itemId of ids){
      const n=(inv[itemId]||0)-((r.inputs?.[itemId]||0)*q)+((r.outputs?.[itemId]||0)*q);
      if(n>0)slots++;
    }
    return slots;
  };
  let max=0;
  for(let q=1;q<=materialMax;q++)if(slotsAfter(q)<=cap)max=q;
  if(max<1){
    const used=RF.packUsed?RF.packUsed(s):Object.values(inv).filter(q=>q>0).length;
    const outNames=Object.keys(r.outputs||{}).map(x=>RF.DATA.items?.[x]?.name||x).join(', ');
    blockers.push(`Pack capacity: ${used}/${cap} slots. Free a slot for ${outNames||'the crafted item'}, or craft in Greenvale where overflow can be banked.`);
  }
  return {max,blockers,materialMax};
};
if(RF.V1015)RF.V1015.craftAnalysis=RF.V1019.craftAnalysis;
RF.v9MaxCraft=function(s,id){return RF.V1019.craftAnalysis(s,id).max;};

// Make direct/legacy craft calls enter the modern one-item batch flow so Bank support remains consistent.
const v1019CraftBase=RF.craft;
RF.craft=function(id){
  const s=RF.state,r=RF.DATA.recipes?.[id];
  if(s&&r&&RF.V1019.canUseBank(s)&&RF.V1019.craftAnalysis(s,id).max>=1&&typeof RF.v9StartCraftQty==='function')return RF.v9StartCraftQty(id,1);
  return v1019CraftBase(id);
};

// Batch production resolver with Greenvale Bank-aware material checks/losses.
const v1019ProductionBase=RF.productionTap;
RF.productionTap=function(){
  const g=RF.actionGame;if(!g?.v9Qty)return v1019ProductionBase();
  const s=RF.state,r=RF.DATA.recipes?.[g.recipe];if(!s||!r)return;
  const need={};Object.entries(r.inputs||{}).forEach(([id,q])=>need[id]=q*g.v9Qty);
  if(!RF.V1019.hasCraftItems(s,need)){g.last='⚠️ You no longer have enough materials in your Pack + Bank to finish this batch.';RF.UI.render(s);return;}
  if(RF.actionReady&&!RF.actionReady(g,'productionTap',650))return;
  const energy=RF.v10EnergyCost?RF.v10EnergyCost('production'):2;
  if(RF.v10SpendEnergy&&!RF.v10SpendEnergy(s,energy))return;

  let lvl=s.skills[r.skill]?.level||1,power=13+Math.min(12,Math.floor(lvl/3)),crit=.09+Math.min(.12,lvl*.003),mishap=Math.max(.012,.055-(lvl-r.level)*.004),roll=Math.random();
  g.crit=false;g.mishap=false;s.stats.activeTaps=(s.stats.activeTaps||0)+1;
  if(roll<mishap){
    g.mishap=true;s.stats.skillMishaps=(s.stats.skillMishaps||0)+1;
    const candidates=Object.keys(r.inputs||{}).filter(id=>RF.V1019.craftCount(s,id)>0);
    if(candidates.length){
      const lost=candidates[Math.floor(Math.random()*candidates.length)];RF.V1019.takeCraftItem(s,lost,1);g.progress=0;
      g.last=`⚠️ BUTCHERED — 1 × ${RF.DATA.items[lost]?.name||lost} is ruined. Batch progress reset.`;
    }
  }else{
    if(roll<mishap+crit){power*=2;g.crit=true;s.stats.skillCrits=(s.stats.skillCrits||0)+1;g.last=`✨ MASTERFUL STEP! +${power} progress`;}
    else g.last=`+${power} progress`;
    g.progress=Math.min(g.v9Target,g.progress+power);
  }
  if(g.progress>=g.v9Target)return RF.v9FinishBatch(g);
  RF.save(s);RF.UI.render(s);
};

// Final smithing resolver. Mirrors V10.18 thermal tuning, but uses the Greenvale material pool.
RF.hammerForge=function(){
  const s=RF.state,g=RF.actionGame;if(!s||!g||g.type!=='forge')return;
  const r=RF.DATA.recipes?.[g.recipe];if(!r)return;
  const qty=Math.max(1,g.v9Qty||1),need={};Object.entries(r.inputs||{}).forEach(([id,q])=>need[id]=q*qty);
  if(!RF.V1019.hasCraftItems(s,need)){g.message='⚠️ You no longer have enough materials in your Pack + Bank to finish this work.';RF.UI.render(s);return;}
  if(RF.actionReady&&!RF.actionReady(g,'forge',RF.V8?.actionCooldowns?.forge||650))return;
  const energy=RF.v10EnergyCost?RF.v10EnergyCost('forge'):3;
  if(RF.v10SpendEnergy&&!RF.v10SpendEnergy(s,energy))return;

  const heat=+g.heat||0;
  const ideal=heat>=(RF.V1018?.idealMin??52)&&heat<=(RF.V1018?.idealMax??70);
  const perfect=heat>=(RF.V1018?.perfectMin??59)&&heat<=(RF.V1018?.perfectMax??64);
  let power=9+Math.floor((s.skills?.smithing?.level||1)/3);
  s.stats.activeTaps=(s.stats.activeTaps||0)+1;
  if(perfect){power*=2;g.message=`✨ PERFECT HEAT • +${power} progress`;RF.addXp(s,'smithing',3);}
  else if(ideal)g.message=`🔨 Clean strike • +${power} progress`;
  else{power=Math.max(3,Math.floor(power*.45));g.integrity-=heat>86?13:7;g.message=heat>86?'⚠️ Too hot. Scale flakes from the workpiece.':'⚠️ Too cold. The metal resists.';}

  const target=g.v9Target||100;g.progress=Math.min(target,(+g.progress||0)+power);g.heat=Math.max(0,(+g.heat||0)-(2+Math.random()*2));
  if(g.integrity<=0){
    const candidates=Object.keys(r.inputs||{}).filter(id=>RF.V1019.craftCount(s,id)>0);
    if(candidates.length)RF.V1019.takeCraftItem(s,candidates[0],1);
    g.integrity=45;g.progress=0;s.stats.skillMishaps=(s.stats.skillMishaps||0)+1;g.message='💥 The workpiece cracks. Material is lost and progress resets.';
  }
  if(g.progress>=target){
    if(g.v9Qty&&RF.v9FinishBatch)return RF.v9FinishBatch(g);
    return RF.finishForge?.();
  }
  RF.save(s);RF.UI.render(s);
};

// Finish a batch using Pack first, then Greenvale Bank for any remainder.
RF.v9FinishBatch=function(g){
  const s=RF.state,r=RF.DATA.recipes?.[g.recipe],qty=Math.max(1,g.v9Qty||1);if(!s||!r)return;
  const need={};Object.entries(r.inputs||{}).forEach(([id,q])=>need[id]=q*qty);
  if(!RF.V1019.hasCraftItems(s,need)){
    g.last='⚠️ Batch stalled — too many materials were lost to complete it.';RF.UI.render(s);return;
  }
  RF.V1019.takeCraftItems(s,r.inputs,qty);
  Object.entries(r.outputs||{}).forEach(([id,q])=>RF.addItem(s,id,q*qty));
  RF.addXp(s,r.skill,(r.xp||0)*qty);s.stats.itemsCrafted=(s.stats.itemsCrafted||0)+qty;RF.advanceWorld((r.time||0)*qty);RF.questCheck?.(s);
  const before=g.before;s.speed=g.resumeSpeed??1;RF.actionGame=null;RF.save(s);
  RF.UI.modal=RF.makeResult?.(s,before,`${r.name} ×${qty} Complete`,RF.DATA.skills?.[r.skill]?.icon||'🔨')||{type:'message',title:'Batch complete',text:`Crafted ${qty} × ${r.name}.`};RF.UI.render(s);
};

// Recipe popup: show Pack and Bank contributions separately when crafting in Greenvale.
const v1019ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type!=='recipeDetail')return v1019ModalBase(s);
  const id=m.id,r=RF.DATA.recipes?.[id];
  if(!r)return `<div class="modalBack"><div class="modal"><h2>Recipe unavailable</h2><div class="choices"><button class="choice" data-close-recipe><b>Close</b></button></div></div></div>`;
  const outId=Object.keys(r.outputs||{})[0],it=RF.DATA.items?.[outId]||RF.DATA.items?.[id],a=RF.V1019.craftAnalysis(s,id),max=a.max,bankCraft=RF.V1019.canUseBank(s);
  const inputs=Object.entries(r.inputs||{}).map(([x,q])=>{
    const pack=RF.V1019.packCount(s,x),bank=RF.V1019.bankCount(s,x),total=pack+bank,ok=total>=q;
    const count=bankCraft?`Pack ${pack} + Bank ${bank} = ${total} / ${q} each`:`${pack} / ${q} each`;
    return `<div class="ingredientRow ${ok?'ok':'missing'}"><span>${RF.DATA.items?.[x]?.icon||'•'} ${RF.DATA.items?.[x]?.name||x}</span><b>${count}</b></div>`;
  }).join('');
  const req=outId&&RF.v93Req?.(s,outId);
  const blockerHtml=a.blockers.length?`<div style="margin-top:8px;display:grid;gap:4px">${a.blockers.map(x=>`<span>• ${x}</span>`).join('')}</div>`:`<span>Up to ${max} currently possible.${bankCraft?' Pack materials are used first, then Greenvale Bank.':''}</span>`;
  return `<div class="modalBack"><div class="modal itemModal"><div class="itemHero">${it?.icon||'🛠️'}</div><span class="eyebrow">${RF.DATA.skills?.[r.skill]?.name||r.skill} • BATCH RECIPE</span><h2>${r.name}</h2><div class="itemDesc">Choose how many to make. Larger batches require proportionally more active work.${bankCraft?' In Greenvale, crafting automatically draws missing ingredients from your Bank after using your Pack first.':''}</div><div class="ingredientList">${inputs}</div><div class="tradeSummary"><span>Skill <b>${s.skills?.[r.skill]?.level||1}/${r.level}</b></span><span>Maximum batch <b>${max}</b></span></div><label class="qtyLabel">Amount<input class="qtyInput" type="number" inputmode="numeric" min="1" value="1" data-v9-qty></label><div class="quickQty"><button data-v9-setqty="1">1</button><button data-v9-setqty="5">5</button><button data-v9-setqty="${max}">MAX</button></div>${req?`<div class="notice ok" style="margin-top:12px">⚔️ Use requirement: ${req}</div>`:''}<div class="choices"><button class="choice" data-v9-craft="${id}" ${max<1?'disabled':''}><b>Start batch</b><small>${blockerHtml}</small></button><button class="choice" data-close-recipe><b>Close</b></button></div></div></div>`;
};

RF.V1019.migrate=function(s){if(!s)return s;s.version='10.19.0';s.bank=s.bank||{};return s;};
if(RF.V95){
  RF.V95.SCHEMA='10.19.0';
  const base=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>RF.V1019.migrate(base(s));
}
if(RF.state){RF.V1019.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state);}
