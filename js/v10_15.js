window.RF=window.RF||{};
RF.VERSION='10.15.0';
RF.V1015=RF.V1015||{};

/* Realmforge V10.15 — Crafting Requirements
   - Robust batch-capacity calculation based on the post-craft inventory.
   - Exact requirement/blocker text in recipe popups.
   - Crafting list READY state now reflects whether at least one batch can actually start.
*/

RF.V1015.craftAnalysis=function(s,id){
  const r=RF.DATA.recipes?.[id];
  if(!r)return {max:0,blockers:['Recipe data is unavailable.'],materialMax:0};
  const blockers=[];
  const level=s.skills?.[r.skill]?.level||1;
  if(level<r.level)blockers.push(`Requires ${RF.DATA.skills?.[r.skill]?.name||r.skill} Lv ${r.level} (you are Lv ${level}).`);

  let materialMax=Infinity;
  for(const [itemId,qty] of Object.entries(r.inputs||{})){
    const have=s.inventory?.[itemId]||0;
    materialMax=Math.min(materialMax,Math.floor(have/qty));
    if(have<qty)blockers.push(`Need ${qty} × ${RF.DATA.items?.[itemId]?.name||itemId} (you have ${have}).`);
  }
  if(!Number.isFinite(materialMax))materialMax=0;
  materialMax=Math.max(0,materialMax);

  // If skill/materials already fail, capacity cannot make the recipe possible.
  if(blockers.length)return {max:0,blockers,materialMax};

  // Greenvale crafting may safely route a brand-new overflow stack into the bank.
  if(RF.isBankTown?.(s))return {max:materialMax,blockers:[],materialMax};

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
  for(let q=1;q<=materialMax;q++){
    if(slotsAfter(q)<=cap)max=q;
  }
  if(max<1){
    const used=RF.packUsed?RF.packUsed(s):Object.values(inv).filter(q=>q>0).length;
    const outNames=Object.keys(r.outputs||{}).map(x=>RF.DATA.items?.[x]?.name||x).join(', ');
    blockers.push(`Pack capacity: ${used}/${cap} slots. Free a slot for ${outNames||'the crafted item'}, or craft at Greenvale where overflow can be banked.`);
  }
  return {max,blockers,materialMax};
};

RF.v9MaxCraft=function(s,id){return RF.V1015.craftAnalysis(s,id).max};

RF.V1015.recipeState=function(s,id,r){
  const a=RF.V1015.craftAnalysis(s,id),lvl=s.skills?.[r.skill]?.level||1;
  if(lvl<r.level)return {label:`LV ${r.level}`,ready:false};
  if(a.materialMax<1)return {label:'MATS',ready:false};
  if(a.max<1)return {label:'PACK',ready:false};
  return {label:'READY',ready:true};
};

// Rebuild the Skills/Crafting page using the stable V10.12 layout, but with true craftability.
RF.UI.skills=function(s){
  const skillRows=Object.entries(RF.DATA.skills).map(([id,d])=>{const sk=s.skills[id],next=RF.xpForLevel(Math.min(100,sk.level+1)),prev=RF.xpForLevel(sk.level),pct=sk.level>=100?100:100*(sk.xp-prev)/Math.max(1,next-prev);return `<button class="row skill skillInspect" data-skill-detail="${id}"><div class="skillIcon">${d.icon}</div><div><div class="skillName">${d.name}</div><div class="miniBar"><div class="miniFill" style="width:${Math.max(0,Math.min(100,pct))}%"></div></div><small>${Math.floor(sk.xp)} XP</small></div><div class="skillLevel">${sk.level}</div></button>`}).join('');
  const cat=s.v93?.craftCategory||'all';
  const options=[['all','All items'],['weapon','Weapons'],['armor','Armour'],['food','Food & Potions'],['material','Materials'],['tool','Tools'],['treasure','Treasure'],['other','Other']].map(([v,l])=>`<option value="${v}" ${cat===v?'selected':''}>${l}</option>`).join('');
  const recipeEntries=Object.entries(RF.DATA.recipes).sort(([aid,a],[bid,b])=>{const ao=Object.keys(a.outputs||{})[0]||aid,bo=Object.keys(b.outputs||{})[0]||bid;return RF.V1012?.compare?RF.V1012.compare(ao,bo):String(RF.DATA.items?.[ao]?.name||ao).localeCompare(String(RF.DATA.items?.[bo]?.name||bo))});
  const recipes=recipeEntries.filter(([id,r])=>{const out=Object.keys(r.outputs||{})[0]||id;return cat==='all'||RF.v92Category(RF.DATA.items[out])===cat}).map(([id,r])=>{const out=Object.keys(r.outputs||{})[0]||id,it=RF.DATA.items[out],req=RF.v93Req?.(s,out)||'',st=RF.V1015.recipeState(s,id,r);return `<button class="row browseRow" data-recipe-detail="${id}"><div class="icon">${it?.icon||'🛠️'}</div><div class="meta"><b>${r.name}</b><small>${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level}${req?` • Use: ${req}`:''}</small></div><span class="recipeState ${st.ready?'ready':''}">${st.label}</span><span class="chev">›</span></button>`}).join('');
  return `<section class="card"><h2>Skills</h2><div class="sub">Tap any skill for detailed XP progress. Level cap: 100.</div><div class="list" style="margin-top:10px">${skillRows}</div></section><section class="card"><h3>Crafting</h3><label class="filterLabel">Category<select data-v93-filter="craft">${options}</select></label><div class="sub">Tap a recipe to inspect ingredients, crafting skill and use requirements.</div><div class="list">${recipes||'<div class="sub">No recipes in this category.</div>'}</div></section>`;
};

const v1015ModalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  const m=this.modal;
  if(m?.type!=='recipeDetail')return v1015ModalBase(s);
  const id=m.id,r=RF.DATA.recipes[id];
  if(!r)return `<div class="modalBack"><div class="modal"><h2>Recipe unavailable</h2><div class="choices"><button class="choice" data-close-recipe><b>Close</b></button></div></div></div>`;
  const outId=Object.keys(r.outputs||{})[0],it=RF.DATA.items[outId]||RF.DATA.items[id],a=RF.V1015.craftAnalysis(s,id),max=a.max;
  const inputs=Object.entries(r.inputs||{}).map(([x,q])=>`<div class="ingredientRow ${(s.inventory[x]||0)>=q?'ok':'missing'}"><span>${RF.DATA.items[x]?.icon||'•'} ${RF.DATA.items[x]?.name||x}</span><b>${s.inventory[x]||0} / ${q} each</b></div>`).join('');
  const req=outId&&RF.v93Req?.(s,outId);
  const blockerHtml=a.blockers.length?`<div style="margin-top:8px;display:grid;gap:4px">${a.blockers.map(x=>`<span>• ${x}</span>`).join('')}</div>`:`<span>Up to ${max} currently possible.</span>`;
  return `<div class="modalBack"><div class="modal itemModal"><div class="itemHero">${it?.icon||'🛠️'}</div><span class="eyebrow">${RF.DATA.skills[r.skill]?.name||r.skill} • BATCH RECIPE</span><h2>${r.name}</h2><div class="itemDesc">Choose how many to make. Larger batches require proportionally more active work.</div><div class="ingredientList">${inputs}</div><div class="tradeSummary"><span>Skill <b>${s.skills[r.skill]?.level||1}/${r.level}</b></span><span>Maximum batch <b>${max}</b></span></div><label class="qtyLabel">Amount<input class="qtyInput" type="number" inputmode="numeric" min="1" value="1" data-v9-qty></label><div class="quickQty"><button data-v9-setqty="1">1</button><button data-v9-setqty="5">5</button><button data-v9-setqty="${max}">MAX</button></div>${req?`<div class="notice ok" style="margin-top:12px">⚔️ Use requirement: ${req}</div>`:''}<div class="choices"><button class="choice" data-v9-craft="${id}" ${max<1?'disabled':''}><b>Start batch</b><small>${blockerHtml}</small></button><button class="choice" data-close-recipe><b>Close</b></button></div></div></div>`;
};

if(RF.state){RF.state.version='10.15.0';try{RF.save?.(RF.state)}catch(_){}}
