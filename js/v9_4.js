window.RF=window.RF||{};
RF.VERSION='9.4.0';
RF.V94={
  types:[['enemies','Enemies'],['items','Items'],['npcs','NPCs'],['locations','Locations'],['resources','Resources'],['recipes','Recipes']],
  bossHomes:{captain_voss:['watchtower'],gravewarden:['crypt'],heron_keeper:['drowned_ruins']}
};
RF.migrateV94=function(s){if(!s)return s;s.version='9.4.0';s.v94=s.v94||{};s.v94.dbType=s.v94.dbType||'enemies';s.v94.dbSearch=s.v94.dbSearch||'';return s};
const v94New=RF.newGame;RF.newGame=function(...a){return RF.migrateV94(v94New(...a))};
const v94Load=RF.load;RF.load=function(){return RF.migrateV94(v94Load())};
const v94Import=RF.importSave;RF.importSave=function(x){return RF.migrateV94(v94Import(x))};
if(RF.state)RF.migrateV94(RF.state);

RF.v94LocName=id=>RF.DATA.locations[id]?`${RF.DATA.locations[id].icon||'📍'} ${RF.DATA.locations[id].name}`:id;
RF.v94EnemyLocations=function(id){let out=[];Object.entries(RF.fieldTables||{}).forEach(([loc,table])=>{if((table||[]).some(([eid])=>eid===id))out.push(loc)});(RF.V94.bossHomes[id]||[]).forEach(x=>{if(!out.includes(x))out.push(x)});return out};
RF.v94EnemyDrops=function(e){return (e?.drops||[]).map(([id,ch,q])=>{let it=RF.DATA.items[id];return it?`${it.icon} ${it.name} ×${q||1} • ${Math.round((ch||0)*100)}%`:id})};
RF.v94EnemyMoves=function(e){return (e?.moves||[]).map(id=>RF.DATA.enemyMoves?.[id]?.name||id.replaceAll('_',' '))};
RF.v94ItemSources=function(id){let out=[];Object.entries(RF.DATA.enemies).forEach(([eid,e])=>{if((e.drops||[]).some(([x])=>x===id))out.push(`Drop: ${e.icon} ${e.name}`)});Object.entries(RF.DATA.recipes||{}).forEach(([rid,r])=>{if((r.outputs||{})[id])out.push(`Crafted: ${r.name}`)});Object.entries(RF.DATA.campRecipes||{}).forEach(([rid,r])=>{if(r.output===id)out.push(`Camp cooking: ${r.name}`)});let defs=RF.DATA.resourceDefs||{};Object.entries(defs).forEach(([rid,r])=>{if(r.item===id){let locs=Object.entries(RF.DATA.locationResources||{}).filter(([,arr])=>arr.includes(rid)).map(([l])=>RF.v94LocName(l));out.push(`Gathered from ${r.name}${locs.length?` at ${locs.join(', ')}`:''}`)}});if((RF.DATA.shopStock||[]).includes(id))out.push('Sold by general merchants');return [...new Set(out)]};
RF.v94NpcLocations=function(id){let n=RF.DATA.npcs?.[id];if(!n)return[];let out=[];if(n.location)out.push(n.location);if(n.home)out.push(n.home);if(n.schedule){Object.values(n.schedule).forEach(v=>{if(typeof v==='string')out.push(v);else if(v?.location)out.push(v.location)})}Object.keys(RF.DATA.namedDialogues||{}).includes(id)&&Object.entries(RF.DATA.locations).forEach(([lid,l])=>{if(l.npcs?.includes?.(id))out.push(lid)});return [...new Set(out.filter(x=>RF.DATA.locations[x]))]};
RF.v94ResourceLocations=function(id){return Object.entries(RF.DATA.locationResources||{}).filter(([,arr])=>arr.includes(id)).map(([loc])=>loc)};
RF.v94RecipeOutput=function(r){return Object.entries(r.outputs||{}).map(([id,q])=>`${RF.DATA.items[id]?.icon||'📦'} ${RF.DATA.items[id]?.name||id} ×${q}`).join(', ')};
RF.v94Inputs=function(r){return Object.entries(r.inputs||{}).map(([id,q])=>`${RF.DATA.items[id]?.icon||'📦'} ${RF.DATA.items[id]?.name||id} ×${q}`).join(', ')};
RF.v94Matches=function(text,q){return !q||String(text||'').toLowerCase().includes(q.toLowerCase())};

RF.UI.database=function(s){
  let type=s.v94.dbType||'enemies',q=s.v94.dbSearch||'';
  let options=RF.V94.types.map(([id,n])=>`<option value="${id}" ${type===id?'selected':''}>${n}</option>`).join('');
  let entries=[];
  if(type==='enemies')entries=Object.entries(RF.DATA.enemies).map(([id,e])=>({id,icon:e.icon,name:e.name,sub:`Lv ${e.level} • ${e.temperament||'Hostile'} • ${(s.collection?.enemies?.[id]||0)} defeated`}));
  if(type==='items')entries=Object.entries(RF.DATA.items).map(([id,it])=>({id,icon:it.icon,name:it.name,sub:`${it.rarity||'Common'} • ${it.type||'Item'} • ${it.value||0}g base value`}));
  if(type==='npcs')entries=Object.entries(RF.DATA.npcs||{}).map(([id,n])=>({id,icon:n.icon||'🧑',name:n.name,sub:n.job||'Resident'}));
  if(type==='locations')entries=Object.entries(RF.DATA.locations).map(([id,l])=>({id,icon:l.icon,name:l.name,sub:`${l.region||'Unknown region'}${s.visited?.[id]?' • Visited':' • Unvisited'}`}));
  if(type==='resources')entries=Object.entries(RF.DATA.resourceDefs||{}).map(([id,r])=>({id,icon:r.icon,name:r.name,sub:`${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level} • yields ${RF.DATA.items[r.item]?.name||r.item}`}));
  if(type==='recipes')entries=Object.entries(RF.DATA.recipes||{}).map(([id,r])=>({id,icon:RF.DATA.skills[r.skill]?.icon||'🔨',name:r.name,sub:`${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level} • ${RF.v94RecipeOutput(r)}`}));
  entries=entries.filter(x=>RF.v94Matches(`${x.name} ${x.sub}`,q)).sort((a,b)=>a.name.localeCompare(b.name));
  let rows=entries.map(x=>`<button class="row dbRow" data-db-entry="${type}:${x.id}"><div class="icon">${x.icon}</div><div class="meta"><b>${x.name}</b><small>${x.sub}</small></div><span class="chev">›</span></button>`).join('');
  return `<section class="card databaseCard"><div class="questTitle"><h2>📚 Database</h2><span class="tag">${entries.length} ENTRIES</span></div><div class="sub">Field reference for creatures, people, places, items and production knowledge.</div><div class="dbControls"><label class="filterSelect"><span>Section</span><select data-db-type>${options}</select></label><label class="filterSelect"><span>Search</span><input data-db-search value="${String(q).replaceAll('&','&amp;').replaceAll('"','&quot;')}" placeholder="Search database…"></label></div><div class="list dbList">${rows||'<div class="sub">No matching entries.</div>'}</div></section>`;
};

RF.v94DetailHtml=function(s,type,id){
  let h='';
  if(type==='enemies'){
    let e=RF.DATA.enemies[id];if(!e)return'';let locs=RF.v94EnemyLocations(id),drops=RF.v94EnemyDrops(e),moves=RF.v94EnemyMoves(e),research=s.v7?.research?.[id]?.level||0,kills=s.collection?.enemies?.[id]||0;
    h=`<span class="eyebrow">BESTIARY ENTRY</span><div class="dbHero"><span>${e.icon}</span><div><h2>${e.name}</h2><div class="sub">Level ${e.level} • ${e.temperament||'Hostile'}</div></div></div><div class="dbStatGrid"><div><small>HP</small><b>${e.hp}</b></div><div><small>Armour</small><b>${e.armor||0}</b></div><div><small>Damage</small><b>${e.damage?.[0]||0}–${e.damage?.[1]||0}</b></div><div><small>Defeated</small><b>${kills}</b></div></div><div class="questInfo"><b>Research</b><span>Rank ${research}/3</span></div><h3>Where to find</h3><div class="dbChips">${locs.length?locs.map(l=>`<span>${RF.v94LocName(l)}</span>`).join(''):'<span>Special encounter / unknown habitat</span>'}</div><h3>Known techniques</h3><div class="dbText">${moves.length?moves.join(' • '):'Basic attacks only'}</div><h3>Possible drops</h3><div class="dbText">${drops.length?drops.join('<br>'):'No recorded item drops.'}</div>`;
  }
  if(type==='items'){
    let it=RF.DATA.items[id];if(!it)return'';let req=RF.itemRequirement?.(it),src=RF.v94ItemSources(id),stats=[];if(it.damage)stats.push(`Damage +${it.damage}`);if(it.armor)stats.push(`Armour +${it.armor}`);if(it.heal)stats.push(`Heals ${it.heal}`);if(it.stamina)stats.push(`Stamina +${it.stamina}`);
    h=`<span class="eyebrow">ITEM ENTRY</span><div class="dbHero"><span>${it.icon}</span><div><h2>${it.name}</h2><div class="sub">${it.rarity||'Common'} • ${it.type||'Item'}</div></div></div><div class="itemDesc">${it.desc||'No description recorded.'}</div><div class="questInfo"><b>Base value</b><span>${it.value||0}g</span></div>${req?`<div class="questInfo"><b>Use requirement</b><span>${RF.DATA.skills[req.skill]?.name||req.skill} Lv ${req.level}</span></div>`:''}${stats.length?`<div class="questInfo"><b>Effects</b><span>${stats.join(' • ')}</span></div>`:''}<h3>Known sources</h3><div class="dbText">${src.length?src.join('<br>'):'No standard source recorded.'}</div>`;
  }
  if(type==='npcs'){
    let n=RF.DATA.npcs?.[id];if(!n)return'';let locs=RF.v94NpcLocations(id),rel=s.social?.relations?.[id]||0;
    h=`<span class="eyebrow">PERSON ENTRY</span><div class="dbHero"><span>${n.icon||'🧑'}</span><div><h2>${n.name}</h2><div class="sub">${n.job||'Resident'}</div></div></div><div class="questInfo"><b>Relationship</b><span>${rel}</span></div><h3>Where to find</h3><div class="dbChips">${locs.length?locs.map(l=>`<span>${RF.v94LocName(l)}</span>`).join(''):'<span>Moves according to schedule / encounter</span>'}</div>${n.rumours?.length?`<h3>Notes</h3><div class="dbText">${n.rumours[0]}</div>`:''}`;
  }
  if(type==='locations'){
    let l=RF.DATA.locations[id];if(!l)return'';let enemies=(RF.fieldTables?.[id]||[]).map(([eid])=>RF.DATA.enemies[eid]).filter(Boolean),resources=(RF.DATA.locationResources?.[id]||[]).map(rid=>RF.DATA.resourceDefs[rid]).filter(Boolean),roads=Object.entries(l.neighbors||{}).map(([nid,min])=>`${RF.v94LocName(nid)} • ${min} min`);
    h=`<span class="eyebrow">LOCATION ENTRY</span><div class="dbHero"><span>${l.icon}</span><div><h2>${l.name}</h2><div class="sub">${l.region||'Unknown region'} • ${s.visited?.[id]?'Visited':'Unvisited'}</div></div></div><div class="itemDesc">${l.desc||''}</div><h3>Roads</h3><div class="dbText">${roads.length?roads.join('<br>'):'No ordinary road connections.'}</div><h3>Local resources</h3><div class="dbChips">${resources.length?resources.map(r=>`<span>${r.icon} ${r.name}</span>`).join(''):'<span>None recorded</span>'}</div><h3>Nearby creatures</h3><div class="dbChips">${enemies.length?enemies.map(e=>`<span>${e.icon} ${e.name}</span>`).join(''):'<span>No standard wild encounters</span>'}</div>`;
  }
  if(type==='resources'){
    let r=RF.DATA.resourceDefs?.[id];if(!r)return'';let locs=RF.v94ResourceLocations(id),it=RF.DATA.items[r.item];
    h=`<span class="eyebrow">RESOURCE ENTRY</span><div class="dbHero"><span>${r.icon}</span><div><h2>${r.name}</h2><div class="sub">${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level}</div></div></div><div class="itemDesc">${r.desc||''}</div><div class="questInfo"><b>Yield</b><span>${it?.icon||'📦'} ${it?.name||r.item} ×${r.yield?.[0]||1}–${r.yield?.[1]||1}</span></div><div class="questInfo"><b>XP</b><span>${r.xp}</span></div><div class="questInfo"><b>Node capacity</b><span>${r.max}</span></div><h3>Where to find</h3><div class="dbChips">${locs.length?locs.map(l=>`<span>${RF.v94LocName(l)}</span>`).join(''):'<span>No standard node recorded</span>'}</div>`;
  }
  if(type==='recipes'){
    let r=RF.DATA.recipes?.[id];if(!r)return'';let out=Object.keys(r.outputs||{})[0],useReq=out?RF.v93Req(s,out):'';
    h=`<span class="eyebrow">RECIPE ENTRY</span><div class="dbHero"><span>${RF.DATA.skills[r.skill]?.icon||'🔨'}</span><div><h2>${r.name}</h2><div class="sub">${RF.DATA.skills[r.skill]?.name||r.skill} Lv ${r.level}</div></div></div><div class="questInfo"><b>Ingredients</b><span>${RF.v94Inputs(r)||'None'}</span></div><div class="questInfo"><b>Produces</b><span>${RF.v94RecipeOutput(r)}</span></div><div class="questInfo"><b>Skill XP</b><span>${r.xp||0}</span></div>${useReq?`<div class="questInfo"><b>Use requirement</b><span>${useReq}</span></div>`:''}`;
  }
  return `<div class="modalBack"><div class="modal dbModal">${h}<button class="quietClose" data-db-close>Close</button></div></div>`;
};

const v94NavBase=RF.UI.nav.bind(RF.UI);RF.UI.nav=function(){let n=[['world','🌍','WORLD'],['map','🗺️','MAP'],['database','📚','DB'],['character','🧍','CHAR'],['skills','📊','SKILLS'],['inventory','🎒','PACK'],['quests','📜','QUESTS'],['shop','🪙','SHOP'],['dev','🛠️','DEV']];return `<nav class="bottomnav"><div class="bottomInner v9nav">${n.map(x=>`<button class="navbtn ${this.tab===x[0]?'active':''}" data-tab="${x[0]}"><span>${x[1]}</span>${x[2]}</button>`).join('')}</div></nav>`};
const v94PageBase=RF.UI.page.bind(RF.UI);RF.UI.page=function(s){if(this.tab==='database')return this.database(s);return v94PageBase(s)};
const v94ModalBase=RF.UI.modalHtml.bind(RF.UI);RF.UI.modalHtml=function(s){let m=this.modal;if(m?.type==='dbDetail')return RF.v94DetailHtml(s,m.dbType,m.id);return v94ModalBase(s)};
const v94BindBase=RF.UI.bind.bind(RF.UI);RF.UI.bind=function(s){v94BindBase(s);document.querySelector('[data-db-type]')?.addEventListener('change',e=>{s.v94.dbType=e.target.value;s.v94.dbSearch='';RF.save(s);RF.UI.render(s)});let search=document.querySelector('[data-db-search]');if(search)search.oninput=e=>{s.v94.dbSearch=e.target.value;let pos=e.target.selectionStart;RF.save(s);RF.UI.render(s);requestAnimationFrame(()=>{let el=document.querySelector('[data-db-search]');if(el){el.focus();try{el.setSelectionRange(pos,pos)}catch{}}})};document.querySelectorAll('[data-db-entry]').forEach(b=>b.onclick=()=>{let [dbType,id]=b.dataset.dbEntry.split(':');RF.UI.modal={type:'dbDetail',dbType,id};RF.UI.render(s)});document.querySelectorAll('[data-db-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(s)})};

if(RF.state){RF.migrateV94(RF.state);if(!RF.state.flags.v94Seen){RF.state.flags.v94Seen=true;RF.log(RF.state,'V9.4: the Field Database is now available with enemies, items, NPCs, locations, resources and recipes.','important');RF.save(RF.state)}RF.UI.render(RF.state)}
