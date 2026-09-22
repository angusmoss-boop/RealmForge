/* Realmforge V12.2.0 — Living Codex.
   Post-compatibility Database presentation, refiners and focus-safe live search.
   Historical Database stages remain the data/detail authority. */
(() => {
  'use strict';
  const RF=window.RF;if(!RF?.UI)return;
  const DB=RF.Views.Database=RF.Views.Database||{};
  const V=DB.V122=DB.V122||{};
  V.version='12.2.0';
  DB.modernVersion=V.version;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=v=>String(v||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  const sectors=()=>RF.V1061?.SECTORS||RF.V113?.SECTORS||[
    ['enemies','🐾','Enemies'],['items','🎒','Items'],['npcs','🧑','NPCs'],['locations','🗺️','Locations'],
    ['resources','⛏️','Resources'],['recipes','📜','Recipes'],['dungeons','🗝️','Dungeons'],['magic','🔮','Magic']
  ];

  V.activeFilters={items:'all',resources:'all',recipes:'all'};
  V.filterDefs={
    items:[
      ['all','All'],['weapon','Weapons'],['armor','Armour'],['tool','Tools'],['food','Food'],['material','Materials'],
      ['ammo','Ammo'],['utility','Utilities'],['trinket','Trinkets'],['quest_treasure','Quest & Treasure']
    ],
    resources:[['all','All'],['mining','Mining'],['woodcutting','Woodcutting'],['fishing','Fishing'],['foraging','Foraging']],
    recipes:[['all','All'],['smithing','Smithing'],['fletching','Fletching'],['crafting','Crafting'],['cooking','Cooking'],['herblore','Herblore']]
  };
  V.hasRefiners=type=>Object.prototype.hasOwnProperty.call(V.filterDefs,type);
  V.filterFor=type=>V.activeFilters[type]||'all';
  V.setFilter=(type,id)=>{if(V.filterDefs[type]?.some(x=>x[0]===id))V.activeFilters[type]=id;return V.filterFor(type)};

  V.isFletching=function(recipe){
    if(!recipe||recipe.skill!=='crafting')return false;
    const ids=Object.keys(recipe.outputs||{});
    return ids.some(id=>{
      const it=RF.DATA.items?.[id];
      return it?.type==='ammo'||(it?.type==='weapon'&&(String(id).includes('bow')||String(it.name||'').toLowerCase().includes('bow')));
    })||/arrow|bow|fletch/i.test(String(recipe.name||''));
  };
  V.matchesCategory=function(type,id,filter){
    if(!filter||filter==='all')return true;
    if(type==='items'){
      const t=RF.DATA.items?.[id]?.type||'';
      return filter==='quest_treasure'?(t==='quest'||t==='treasure'):t===filter;
    }
    if(type==='resources')return RF.DATA.resourceDefs?.[id]?.skill===filter;
    if(type==='recipes'){
      const r=RF.DATA.recipes?.[id];if(!r)return false;
      if(filter==='fletching')return V.isFletching(r);
      if(filter==='crafting')return r.skill==='crafting'&&!V.isFletching(r);
      return r.skill===filter;
    }
    return true;
  };
  V.searchText=function(type,id,row){
    const bits=[id,row?.name,row?.sub];
    if(type==='items'){
      const it=RF.DATA.items?.[id]||{};bits.push(it.type,it.rarity,it.desc,it.value);
    }else if(type==='resources'){
      const r=RF.DATA.resourceDefs?.[id]||{},it=RF.DATA.items?.[r.item];bits.push(r.skill,r.desc,r.item,it?.name);
    }else if(type==='recipes'){
      const r=RF.DATA.recipes?.[id]||{};bits.push(r.skill,r.level,r.name);
      Object.keys(r.inputs||{}).forEach(x=>bits.push(x,RF.DATA.items?.[x]?.name));
      Object.keys(r.outputs||{}).forEach(x=>bits.push(x,RF.DATA.items?.[x]?.name));
    }
    return bits.filter(v=>v!==undefined&&v!==null).join(' ').toLowerCase();
  };
  V.allEntries=function(s,type){return (RF.V1061?.entries?.(s,type)||[]).slice()};
  V.filteredEntries=function(s,type,q='',filter=V.filterFor(type)){
    const needle=String(q||'').trim().toLowerCase();
    return V.allEntries(s,type).filter(row=>V.matchesCategory(type,row.id,filter)&&(!needle||V.searchText(type,row.id,row).includes(needle)));
  };
  V.countFor=(s,type,filter)=>V.allEntries(s,type).filter(row=>V.matchesCategory(type,row.id,filter)).length;

  V.sectionCopy=function(type){
    const copy={
      enemies:['Bestiary','Only fully researched creatures earn a place in the Codex.','Search researched creatures…','No fully researched creatures match this search.'],
      items:['Item Archive','Weapons, armour, tools, supplies and curios gathered across the realm.','Search items, types, rarities…','No items match these filters.'],
      npcs:['People','Known residents, specialists and wanderers encountered on your travels.','Search people or roles…','No people match this search.'],
      locations:['World Atlas','Settlements, wilds, routes and facilities recorded across the realm.','Search locations, regions, facilities…','No locations match this search.'],
      resources:['Resource Index','Harvestable seams, trees, waters and forage with their skill requirements.','Search resources, skills, yields…','No resources match these filters.'],
      recipes:['Recipe Library','Production knowledge across Smithing, Crafting, Fletching, Cooking and Herblore.','Search recipes, ingredients, outputs…','No recipes match these filters.'],
      dungeons:['Dungeon Records','Known dungeon sites, danger levels and expedition records.','Search dungeons or regions…','No dungeons match this search.'],
      magic:['Arcane Archive','A sealed wing reserved for the realm’s future magical disciplines.','Search arcane records…','🔮 Magic records are coming soon.']
    };
    return copy[type]||['Database','Field knowledge gathered during your journey.','Search database…','No matching entries.'];
  };
  V.rowBadge=function(type,id){
    if(type==='items')return title(RF.DATA.items?.[id]?.type||'Item');
    if(type==='resources'){const r=RF.DATA.resourceDefs?.[id];return r?`Lv ${r.level} ${title(r.skill)}`:'';}
    if(type==='recipes'){
      const r=RF.DATA.recipes?.[id];if(!r)return'';
      return `Lv ${r.level} ${V.isFletching(r)?'Fletching':title(r.skill)}`;
    }
    if(type==='dungeons'){const d=RF.V113?.dungeonDefs?.()?.[id];return d?`Lv ${d.level}`:'';}
    return '';
  };
  V.rowsHtml=function(s,type,q,filter){
    const rows=V.filteredEntries(s,type,q,filter),copy=V.sectionCopy(type);
    const html=rows.map(x=>{
      const badge=V.rowBadge(type,x.id);
      return `<button type="button" class="db122Result" data-db-entry="${esc(type)}:${esc(x.id)}"><span class="db122Icon">${x.icon||'📖'}</span><span class="db122Meta"><span class="db122NameLine"><b>${esc(x.name)}</b>${badge?`<em>${esc(badge)}</em>`:''}</span><small>${esc(x.sub||'')}</small></span><span class="db122Chevron">›</span></button>`;
    }).join('');
    return {rows,html:html||`<div class="db122Empty"><span>⌕</span><b>No records found</b><small>${esc(copy[3])}</small></div>`};
  };
  V.refinersHtml=function(s,type){
    if(!V.hasRefiners(type))return'';
    const active=V.filterFor(type);
    return `<div class="db122Refine"><div class="db122RefineHead"><span>REFINE</span><small>Swipe categories</small></div><div class="db122Chips" role="group" aria-label="Refine ${esc(type)}">${V.filterDefs[type].map(([id,label])=>`<button type="button" class="db122Chip ${active===id?'active':''}" aria-pressed="${active===id?'true':'false'}" data-db122-filter="${esc(id)}"><span>${esc(label)}</span><b>${V.countFor(s,type,id)}</b></button>`).join('')}</div></div>`;
  };
  V.sectorGrid=function(active){
    return `<div class="db122Sectors" role="tablist" aria-label="Database sections">${sectors().map(([id,icon,name])=>`<button type="button" role="tab" aria-selected="${active===id?'true':'false'}" class="db122Sector ${active===id?'active':''}" data-v1061-db-type="${esc(id)}"><span>${icon}</span><b>${esc(name)}</b></button>`).join('')}</div>`;
  };
  V.pageHtml=function(s){
    s.v94=s.v94||{dbType:'enemies',dbSearch:''};
    const type=sectors().some(x=>x[0]===s.v94.dbType)?s.v94.dbType:'enemies';
    const q=s.v94.dbSearch||'',copy=V.sectionCopy(type),result=V.rowsHtml(s,type,q,V.filterFor(type));
    return `<section class="db122Codex" data-db122-root data-db122-type="${esc(type)}">
      <header class="db122Hero"><div><span class="db122Eyebrow">REALMFORGE CODEX</span><h2><span>📚</span> Database</h2><p>${esc(copy[1])}</p></div><div class="db122Count"><b data-db122-count>${result.rows.length}</b><span>RECORDS</span></div></header>
      ${V.sectorGrid(type)}
      <div class="db122Workbench"><div class="db122SectionHead"><div><span>${esc(copy[0])}</span><small>${esc(sectors().find(x=>x[0]===type)?.[2]||title(type))}</small></div></div>
        <label class="db122Search"><span class="db122SearchIcon">⌕</span><input type="search" autocomplete="off" autocorrect="off" spellcheck="false" data-db-search data-rf-live-edit="database-search" value="${esc(q)}" placeholder="${esc(copy[2])}" aria-label="Search database"><button type="button" data-db122-clear aria-label="Clear search" ${q?'':'hidden'}>✕</button></label>
        ${V.refinersHtml(s,type)}
      </div>
      <div class="db122Results" data-db122-results>${result.html}</div>
    </section>`;
  };

  RF.UI.database=function(s){return V.pageHtml(s)};

  V.refreshResults=function(s=RF.state,{keepFocus=true}={}){
    const root=document.querySelector?.('[data-db122-root]');if(!root||!s)return false;
    const type=root.dataset.db122Type||s.v94?.dbType||'enemies';
    const input=root.querySelector?.('[data-db-search]'),q=input?.value??s.v94?.dbSearch??'';
    s.v94=s.v94||{};s.v94.dbSearch=q;
    const result=V.rowsHtml(s,type,q,V.filterFor(type));
    const host=root.querySelector?.('[data-db122-results]');if(host)host.innerHTML=result.html;
    const count=root.querySelector?.('[data-db122-count]');if(count)count.textContent=String(result.rows.length);
    const clear=root.querySelector?.('[data-db122-clear]');if(clear)clear.hidden=!q;
    V.bindResultRows(s,root);
    if(keepFocus&&input&&document.activeElement!==input){try{input.focus({preventScroll:true})}catch(_){input.focus?.()}}
    return true;
  };
  V.bindResultRows=function(s,root=document){
    root.querySelectorAll?.('[data-db-entry]').forEach(btn=>{
      btn.onclick=()=>{
        const [type,id]=String(btn.dataset.dbEntry||'').split(':');
        const detail=RF.v94DetailHtml?.(s,type,id);if(!detail)return;
        RF.UI.modal={type:'dbDetail',dbType:type,id};
        RF.UI.render(s);
      };
    });
  };
  V.forceRender=false;
  V.renderNow=function(s=RF.state){V.forceRender=true;try{return RF.UI.render(s)}finally{V.forceRender=false}};
  V.shouldHoldRender=function(){
    if(V.forceRender||RF.UI.modal||RF.actionGame||RF.state?.combat)return false;
    if(RF.UI.tab!=='database')return false;
    const a=document.activeElement;
    return !!(a?.matches?.('[data-rf-live-edit="database-search"]'));
  };

  // Final render boundary. The live clock may keep advancing, but it cannot destroy an actively edited field.
  const renderBase=RF.UI.render.bind(RF.UI);
  RF.UI.render=function(s){if(V.shouldHoldRender())return;return renderBase(s)};

  // Let all established binders run first, then replace Database-specific handlers with focus-safe ones.
  const bindBase=RF.UI.bind?.bind(RF.UI);
  if(bindBase)RF.UI.bind=function(s){
    bindBase(s);
    const root=document.querySelector?.('[data-db122-root]');if(!root)return;
    const input=root.querySelector('[data-db-search]');
    if(input){
      input.oninput=()=>{s.v94=s.v94||{};s.v94.dbSearch=input.value;V.refreshResults(s,{keepFocus:false})};
      input.onsearch=()=>{s.v94=s.v94||{};s.v94.dbSearch=input.value;V.refreshResults(s,{keepFocus:false})};
    }
    const clear=root.querySelector('[data-db122-clear]');
    if(clear)clear.onclick=()=>{if(!input)return;input.value='';s.v94=s.v94||{};s.v94.dbSearch='';V.refreshResults(s,{keepFocus:false});input.focus?.()};
    root.querySelectorAll('[data-db122-filter]').forEach(btn=>btn.onclick=()=>{
      const type=root.dataset.db122Type||s.v94?.dbType||'items';V.setFilter(type,btn.dataset.db122Filter);
      root.querySelectorAll('[data-db122-filter]').forEach(x=>{const on=x.dataset.db122Filter===V.filterFor(type);x.classList.toggle('active',on);x.setAttribute('aria-pressed',on?'true':'false')});
      V.refreshResults(s,{keepFocus:false});
    });
    root.querySelectorAll('[data-v1061-db-type]').forEach(btn=>btn.onclick=()=>{
      s.v94=s.v94||{};s.v94.dbType=btn.dataset.v1061DbType;s.v94.dbSearch='';
      input?.blur?.();V.renderNow(s);
    });
    V.bindResultRows(s,root);
  };

  const oldStyle=document.getElementById('rf-database-v122-style');if(oldStyle)oldStyle.remove();
  const st=document.createElement('style');st.id='rf-database-v122-style';st.textContent=`
  .db122Codex{display:grid;gap:12px;margin:0 0 18px;color:var(--ink);--db122Gold:#d7a856;--db122Gold2:#f0cc83;--db122Line:rgba(213,171,100,.2);--db122Panel:linear-gradient(145deg,rgba(33,27,20,.98),rgba(19,16,13,.98))}
  .db122Hero{position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px;border:1px solid var(--db122Line);border-radius:22px;background:radial-gradient(circle at 88% 10%,rgba(201,143,60,.19),transparent 34%),linear-gradient(145deg,#211a13,#13100d 72%);box-shadow:0 14px 34px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.025)}
  .db122Hero:after{content:'✦';position:absolute;right:76px;top:-29px;font-size:112px;color:rgba(235,190,111,.035);transform:rotate(12deg);pointer-events:none}
  .db122Eyebrow{display:block;margin-bottom:4px;color:#a98d61;font-size:9px;font-weight:850;letter-spacing:.19em}
  .db122Hero h2{display:flex;align-items:center;gap:9px;margin:0;font:700 27px/1.05 Georgia,serif;color:#f2dfb8;letter-spacing:.01em}.db122Hero h2>span{font-size:25px}.db122Hero p{max-width:520px;margin:9px 0 0;color:#b8aa91;font-size:11.5px;line-height:1.55}
  .db122Count{position:relative;z-index:1;min-width:68px;padding:10px 9px;text-align:center;border:1px solid rgba(226,178,94,.24);border-radius:16px;background:rgba(11,9,7,.42);box-shadow:inset 0 1px rgba(255,255,255,.025)}.db122Count b{display:block;color:var(--db122Gold2);font:700 22px/1 Georgia,serif}.db122Count span{display:block;margin-top:4px;color:#8f8068;font-size:7.5px;font-weight:900;letter-spacing:.14em}
  .db122Sectors{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.db122Sector{min-width:0;min-height:67px;padding:8px 4px;border:1px solid #3c3125;border-radius:15px;background:linear-gradient(160deg,#1c1813,#14110e);color:#b9aa90;box-shadow:0 6px 16px rgba(0,0,0,.16);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}.db122Sector span{font-size:24px;filter:saturate(.72);transition:.15s}.db122Sector b{max-width:100%;overflow:hidden;text-overflow:ellipsis;color:#a99a82;font-size:9px;letter-spacing:.025em}.db122Sector.active{border-color:#936c37;background:radial-gradient(circle at 50% 10%,rgba(213,162,79,.17),transparent 50%),linear-gradient(160deg,#2b2014,#19130d);box-shadow:inset 0 0 0 1px rgba(231,186,107,.08),0 8px 20px rgba(0,0,0,.2)}.db122Sector.active span{filter:none;transform:translateY(-1px)}.db122Sector.active b{color:#ecc77f}
  .db122Workbench{padding:13px;border:1px solid var(--db122Line);border-radius:19px;background:var(--db122Panel);box-shadow:0 10px 26px rgba(0,0,0,.2)}.db122SectionHead{display:flex;justify-content:space-between;align-items:end;margin:0 1px 10px}.db122SectionHead>div>span{display:block;color:#e7c887;font:700 16px/1.15 Georgia,serif}.db122SectionHead small{display:block;margin-top:3px;color:#756b5b;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
  .db122Search{display:flex;align-items:center;gap:8px;height:45px;padding:0 9px 0 12px;border:1px solid #50402e;border-radius:14px;background:#0f0d0a;box-shadow:inset 0 1px 8px rgba(0,0,0,.35);transition:border-color .15s,box-shadow .15s}.db122Search:focus-within{border-color:#9d743c;box-shadow:0 0 0 3px rgba(176,125,54,.1),inset 0 1px 8px rgba(0,0,0,.35)}.db122SearchIcon{color:#96784b;font-size:21px;line-height:1}.db122Search input{min-width:0;flex:1;width:100%;padding:0!important;border:0!important;outline:0!important;background:transparent!important;color:#eee0c4!important;font:500 13px/1.2 system-ui!important;box-shadow:none!important}.db122Search input::placeholder{color:#716756}.db122Search button{width:29px;height:29px;min-width:29px;padding:0;border:0;border-radius:9px;background:#272018;color:#9f8e75;font-size:12px}.db122Search button[hidden]{display:none!important}
  .db122Refine{margin-top:12px}.db122RefineHead{display:flex;justify-content:space-between;align-items:center;margin:0 2px 6px}.db122RefineHead>span{color:#8d7d65;font-size:8px;font-weight:900;letter-spacing:.14em}.db122RefineHead small{color:#62594d;font-size:8px}.db122Chips{display:flex;gap:6px;overflow-x:auto;padding:1px 1px 4px;scrollbar-width:none;overscroll-behavior-x:contain}.db122Chips::-webkit-scrollbar{display:none}.db122Chip{flex:0 0 auto;display:flex;align-items:center;gap:6px;min-height:31px;padding:5px 9px;border:1px solid #40352a;border-radius:999px;background:#17130f;color:#9f927e;font-size:9.5px}.db122Chip b{display:grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:999px;background:#252019;color:#857761;font-size:8px}.db122Chip.active{border-color:#916b38;background:linear-gradient(#302315,#21180f);color:#edcb88}.db122Chip.active b{background:#704a20;color:#f6deb0}
  .db122Results{display:grid;grid-template-columns:1fr;gap:7px}.db122Result{width:100%;min-width:0;display:grid;grid-template-columns:48px minmax(0,1fr) 24px;align-items:center;gap:10px;padding:10px;border:1px solid #3b3127;border-radius:15px;background:linear-gradient(145deg,#1d1914,#14110e);color:inherit;text-align:left;box-shadow:0 6px 16px rgba(0,0,0,.14);transition:transform .12s,border-color .12s,background .12s}.db122Result:active{transform:scale(.988);border-color:#84623a;background:#221a12}.db122Icon{display:grid;place-items:center;width:48px;height:48px;border:1px solid rgba(209,164,91,.15);border-radius:13px;background:radial-gradient(circle at 35% 25%,rgba(224,181,108,.09),transparent 60%),#110f0c;font-size:25px}.db122Meta{min-width:0}.db122NameLine{display:flex;align-items:center;gap:7px;min-width:0}.db122NameLine b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e9d9ba;font:700 13px/1.2 system-ui}.db122NameLine em{flex:0 0 auto;padding:3px 6px;border:1px solid #4a3a28;border-radius:999px;background:#18130e;color:#aa8c5e;font:700 7.5px/1 system-ui;font-style:normal;text-transform:uppercase;letter-spacing:.04em}.db122Meta small{display:-webkit-box;margin-top:4px;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:#8f8371;font-size:9.5px;line-height:1.35}.db122Chevron{color:#7f6a4c;font:300 25px/1 Georgia,serif;text-align:center}.db122Empty{padding:28px 15px;border:1px dashed #44382b;border-radius:17px;background:#15120e;text-align:center}.db122Empty>span{display:block;color:#806842;font-size:27px}.db122Empty>b{display:block;margin-top:5px;color:#c7b693;font:700 14px Georgia,serif}.db122Empty>small{display:block;margin:5px auto 0;max-width:300px;color:#766d60;font-size:10px;line-height:1.45}
  .v112DbModal,.dbModal{border:1px solid rgba(210,165,91,.28)!important;border-radius:21px!important;background:radial-gradient(circle at 88% 0,rgba(196,138,55,.12),transparent 29%),linear-gradient(145deg,#211b15,#12100d)!important;box-shadow:0 22px 70px rgba(0,0,0,.68)!important}.v112DbModal .eyebrow,.dbModal .eyebrow{color:#a88958!important;letter-spacing:.16em!important}.v112DbModal .dbHero,.dbModal .dbHero{padding:9px;border:1px solid rgba(211,168,98,.13);border-radius:16px;background:rgba(8,7,6,.22)}.v112DbModal .dbHero>span,.dbModal .dbHero>span{border-color:rgba(215,170,96,.2)!important;background:#12100d!important;box-shadow:inset 0 0 20px rgba(197,139,57,.05)}.v112DbModal .dbStatGrid>div,.dbModal .dbStatGrid>div{border-color:rgba(210,163,89,.16)!important;background:#12100d!important}.v112DbModal .questInfo,.dbModal .questInfo{border-color:#3f3326!important;background:#15120e!important}.v112DbModal .dbText,.dbModal .dbText{border-color:#392f25!important;background:#12100d!important}.v112DbModal .dbChips span,.dbModal .dbChips span{border-color:#493825!important;background:#17130e!important;color:#cdbb99!important}
  @media(min-width:680px){.db122Results{grid-template-columns:repeat(2,minmax(0,1fr))}.db122Hero{padding:21px}.db122Sector{min-height:73px}.db122Sector span{font-size:27px}}
  @media(max-width:390px){.db122Hero{padding:15px}.db122Hero h2{font-size:24px}.db122Hero p{font-size:10.5px}.db122Count{min-width:61px}.db122Sectors{gap:6px}.db122Sector{min-height:61px;border-radius:13px}.db122Sector span{font-size:22px}.db122Sector b{font-size:8.3px}.db122Result{grid-template-columns:44px minmax(0,1fr) 20px;padding:9px}.db122Icon{width:44px;height:44px;font-size:23px}.db122NameLine em{max-width:86px;overflow:hidden;text-overflow:ellipsis}}
  `;document.head.appendChild(st);
})();
