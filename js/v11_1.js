window.RF=window.RF||{};
RF.VERSION='11.1.0';
RF.BUILD={
  version:'11.1.0',
  title:'Location Directory',
  built:'17 Sep 2026 • 20:36 BST',
  buildId:'20260917-2036-bst'
};
RF.V111=RF.V111||{};

/* Realmforge V11.1 — Location Directory
   - Expands Database > Locations with permanent services and special interactions.
   - Location rows now preview important facilities such as banks, inns, markets and dungeons.
   - Location detail pages gain a Facilities & Services section without changing existing campaign state.
*/

(()=>{
'use strict';
const V=RF.V111;
V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

V.INNS=new Set(['greenvale','ironridge','reedmere']);
V.SPECIAL={
  greenvale:[['🛠️','Village Workshop'],['🍳','Cottage Kitchen']],
  guildhall:[['📜','Wayfarer Contracts']],
  mirewatch:[['🛏️','Lodge Rest']]
};

V.facilities=function(id,l=RF.DATA.locations?.[id]){
  if(!l)return [];
  const out=[];
  const add=(icon,name,key=name)=>{if(!out.some(x=>x.key===key))out.push({icon,name,key})};

  if(l.bank)add('🏦','Bank','bank');
  if(V.INNS.has(id))add('🛏️','Inn','inn');
  if(l.market||RF.V1054?.MARKETS?.[id])add('🏪','Market','market');

  const dungeon=RF.V1062?.def?.(id)||RF.V1062?.DUNGEONS?.[id];
  if(l.dungeon||dungeon)add('🗝️',`Dungeon${dungeon?.level?` Lv ${dungeon.level}`:''}`,'dungeon');

  (V.SPECIAL[id]||[]).forEach(([icon,name])=>add(icon,name,name));

  const dig=RF.DATA.excavationSites?.[id];
  if(dig)add('🏺',`Excavation Lv ${dig.level||1}`,'excavation');

  // Locations with a permanent rest action but no formal inn still advertise lodging/rest access.
  if(!V.INNS.has(id)&&id!=='mirewatch'&&Array.isArray(l.actions)&&l.actions.includes('rest'))add('🛏️','Resting','rest');

  return out;
};

V.facilitySummary=function(id,l){
  const f=V.facilities(id,l);
  if(!f.length)return '';
  return f.map(x=>`${x.icon} ${x.name}`).join(' • ');
};

V.facilityChips=function(id,l){
  const f=V.facilities(id,l);
  return f.length?f.map(x=>`<span>${x.icon} ${V.escape(x.name)}</span>`).join(''):'<span>No permanent facilities recorded</span>';
};

// Keep V10.61's level-then-alphabetical ordering and simply enrich Location rows.
if(RF.V1061?.entries){
  const entriesBase=RF.V1061.entries.bind(RF.V1061);
  RF.V1061.entries=function(s,type){
    const rows=entriesBase(s,type);
    if(type!=='locations')return rows;
    return rows.map(row=>{
      const l=RF.DATA.locations?.[row.id],fac=V.facilitySummary(row.id,l);
      if(!fac)return row;
      return {...row,sub:`${row.sub} • ${fac}`};
    });
  };
}

// Extend the existing Location detail card without replacing any of its established sections.
if(typeof RF.v94DetailHtml==='function'){
  const detailBase=RF.v94DetailHtml;
  RF.v94DetailHtml=function(s,type,id){
    const h=detailBase.apply(this,arguments);
    if(type!=='locations'||!h)return h;
    const l=RF.DATA.locations?.[id];if(!l)return h;
    const facilities=`<h3>Facilities &amp; Services</h3><div class="dbChips v111FacilityChips">${V.facilityChips(id,l)}</div>`;
    return h.replace('<h3>Roads</h3>',facilities+'<h3>Roads</h3>');
  };
}

V.migrate=function(s){
  if(!s)return s;
  s.v111=s.v111||{};
  s.version='11.1.0';
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='11.1.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

const oldStyle=document.getElementById('v111-location-directory-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');st.id='v111-location-directory-style';st.textContent=`
.v111FacilityChips{margin-bottom:3px}
.v111FacilityChips span{border-color:rgba(190,149,77,.28);background:rgba(104,72,31,.12);color:#dcc59a}
.v1061Database .dbRow .meta small{line-height:1.4}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
