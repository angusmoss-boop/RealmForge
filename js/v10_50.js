window.RF=window.RF||{};
RF.VERSION='10.50.0';
RF.BUILD={
  version:'10.50.0',
  title:'Loadout Pages',
  built:'17 Sep 2026 • 02:24 BST',
  buildId:'20260917-0224-bst'
};
RF.V1050=RF.V1050||{};

/* Realmforge V10.50 — Loadout Pages
   - Promotes Equipment and Tool Belt into dedicated navigation tabs.
   - Both pages use the newer compact 4-column inventory-card direction.
   - Removes the old Equipment and Tool Belt cards from Character so Character can focus on progression and records.
*/

(()=>{
'use strict';
const V=RF.V1050;
V.version='10.50.0';
V.EQUIP_SLOTS=[
  ['main','⚔️','Main Hand'],['off','🛡️','Off Hand'],['head','🪖','Head'],['chest','🥋','Chest'],
  ['legs','👖','Legs'],['boots','🥾','Boots'],['ring1','💍','Ring I'],['ring2','💍','Ring II']
];

V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.migrate=function(s){
  if(!s)return s;
  s.version='10.50.0';
  s.v1050=s.v1050||{};
  s.equipment=s.equipment||{};
  V.EQUIP_SLOTS.forEach(([slot])=>{if(!(slot in s.equipment))s.equipment[slot]=null});
  s.toolbelt=s.toolbelt||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.50.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

V.toolTypes=function(){
  const types=(RF.v103ToolTypes?.()||[]).filter(x=>x!=='lockpicking');
  return [...new Set(types)];
};
V.toolIcon=function(type){
  return ({mining:'⛏️',woodcutting:'🪓',fishing:'🎣',firemaking:'🔥'})[type]||'🧰';
};
V.slotTile=function(s,slot,slotIcon,label){
  const id=s.equipment?.[slot],it=id?RF.DATA.items?.[id]:null;
  if(it){
    return `<button type="button" class="v1050LoadoutTile equipped" data-item-detail="${V.escape(id)}" aria-label="${V.escape(label)}: ${V.escape(it.name)}">
      <div class="v1050TileIcon">${it.icon||slotIcon}</div>
      <div class="v1050TileLabel">${V.escape(label)}</div>
      <div class="v1050TileName">${V.escape(it.name)}</div>
      <div class="v1050TileFoot"><span>EQUIPPED</span></div>
    </button>`;
  }
  return `<div class="v1050LoadoutTile empty" aria-label="${V.escape(label)} empty">
    <div class="v1050TileIcon muted">${slotIcon}</div>
    <div class="v1050TileLabel">${V.escape(label)}</div>
    <div class="v1050TileName muted">Empty slot</div>
    <div class="v1050TileFoot"><span>EMPTY</span></div>
  </div>`;
};
V.toolTile=function(s,type){
  const id=s.toolbelt?.[type],it=id?RF.DATA.items?.[id]:null,label=RF.v103ToolLabel?.(type)||type;
  if(it){
    return `<button type="button" class="v1050LoadoutTile equipped" data-item-detail="${V.escape(id)}" aria-label="${V.escape(label)} tool: ${V.escape(it.name)}">
      <div class="v1050TileIcon">${it.icon||V.toolIcon(type)}</div>
      <div class="v1050TileLabel">${V.escape(label)}</div>
      <div class="v1050TileName">${V.escape(it.name)}</div>
      <div class="v1050TileFoot"><span>Tier ${it.tier||1}</span></div>
    </button>`;
  }
  return `<div class="v1050LoadoutTile empty" aria-label="${V.escape(label)} tool slot empty">
    <div class="v1050TileIcon muted">${V.toolIcon(type)}</div>
    <div class="v1050TileLabel">${V.escape(label)}</div>
    <div class="v1050TileName muted">Empty slot</div>
    <div class="v1050TileFoot"><span>EMPTY</span></div>
  </div>`;
};

RF.UI.equipmentPage=function(s){
  V.migrate(s);
  const equipped=V.EQUIP_SLOTS.filter(([slot])=>!!s.equipment?.[slot]).length;
  const tiles=V.EQUIP_SLOTS.map(([slot,icon,label])=>V.slotTile(s,slot,icon,label)).join('');
  return `<section class="card v1050LoadoutCard">
    <div class="questTitle"><div><span class="eyebrow">LOADOUT</span><h2>🛡️ Equipment</h2></div><span class="packCount">${equipped}/${V.EQUIP_SLOTS.length} equipped</span></div>
    <div class="sub">Your worn combat gear. Tap an equipped item for details, requirements and unequip controls.</div>
    <div class="v1050Summary"><span>⚔️ Weapon Damage <b>${RF.weaponDamage(s)}</b></span><span>🛡️ Armour <b>${RF.armor(s)}</b></span></div>
    <div class="v1050LoadoutGrid">${tiles}</div>
  </section>`;
};

RF.UI.toolbeltPage=function(s){
  V.migrate(s);
  const types=V.toolTypes(),equipped=types.filter(type=>!!s.toolbelt?.[type]).length;
  const tiles=types.map(type=>V.toolTile(s,type)).join('');
  return `<section class="card v1050LoadoutCard">
    <div class="questTitle"><div><span class="eyebrow">ACTIVE SKILL TOOLS</span><h2>🧰 Tool Belt</h2></div><span class="packCount">${equipped}/${types.length} equipped</span></div>
    <div class="sub">Only tools equipped here provide their bonuses during active skilling. Tap an equipped tool for details or to unequip it.</div>
    <div class="v1050LoadoutGrid">${tiles||'<div class="v1042VaultEmpty">No Tool Belt slots are currently available.</div>'}</div>
  </section>`;
};

// Dedicated page routes.
const pageBase=RF.UI.page.bind(RF.UI);
RF.UI.page=function(s){
  if(this.tab==='equipment')return this.equipmentPage(s);
  if(this.tab==='toolbelt')return this.toolbeltPage(s);
  return pageBase(s);
};

// Character is now progression / reputation / records only. Loadout management has its own pages.
const characterBase=RF.UI.character.bind(RF.UI);
RF.UI.character=function(s){
  let h=characterBase(s);
  h=h.replace(/<section class="card"><h3>Equipment<\/h3>[\s\S]*?<\/section>/g,'');
  h=h.replace(/<section class="card"><div class="questTitle"><h3>🧰 Tool Belt<\/h3>[\s\S]*?<\/section>/g,'');
  return h;
};

// Keep both the fallback nav source and the active V10.38 launcher aware of the new pages.
const navOrder=[
  ['world','🌍','World'],['map','🗺️','World Map'],['database','📚','Database'],
  ['character','🧍','Character'],['equipment','🛡️','Equipment'],['toolbelt','🧰','Tool Belt'],
  ['skills','📊','Skills'],['inventory','🎒','Pack'],['quests','📜','Quests'],
  ['shop','🪙','Shop'],['dev','🛠️','Developer'],['options','⚙️','Options & Saves']
];
if(RF.V95)RF.V95.navItems=navOrder.map(x=>[...x]);
if(RF.V1038){
  RF.V1038.items=navOrder.map(x=>({id:x[0],icon:x[1],label:x[2]}));
  RF.V1038.meta={
    ...(RF.V1038.meta||{}),
    world:'Your current location, actions and feed.',
    map:'Route planning and travel overview.',
    database:'Browse items, enemies, resources and lore.',
    character:'Stats, progression, reputation and lifetime records.',
    equipment:'Worn weapons, armour, rings and combat loadout.',
    toolbelt:'Equipped tools used by active gathering skills.',
    skills:'Mastery levels and skill details.',
    inventory:'Pack, bank access and item actions.',
    quests:'Active objectives and quest progress.',
    shop:'Trading and merchants.',
    dev:'Testing tools and campaign utilities.',
    options:'Save slots, backups and campaign controls.'
  };
}

const st=document.createElement('style');st.id='v1050-loadout-pages-style';st.textContent=`
.v1050LoadoutCard{display:grid;gap:12px}.v1050LoadoutCard h2{margin:2px 0 0}
.v1050Summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v1050Summary span{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border:1px solid rgba(198,158,83,.18);border-radius:13px;background:rgba(15,11,8,.28);color:#ae9e84;font-size:10px}.v1050Summary b{color:#efd59d;font-size:12px}
.v1050LoadoutGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;border:1px solid rgba(198,158,83,.16);border-radius:18px;background:linear-gradient(180deg,rgba(13,10,8,.18),rgba(9,7,6,.32));padding:8px}
.v1050LoadoutTile{appearance:none;min-width:0;min-height:110px;padding:9px 7px 8px;border-radius:15px;border:1px solid rgba(201,159,84,.18);background:linear-gradient(180deg,rgba(43,32,21,.92),rgba(18,13,10,.98));color:#f3e1bb;text-align:left;display:flex;flex-direction:column;gap:5px;box-shadow:inset 0 1px rgba(255,255,255,.035)}
button.v1050LoadoutTile:active{transform:scale(.98);border-color:#a97c3e}.v1050LoadoutTile.equipped{border-color:rgba(198,157,89,.34)}.v1050LoadoutTile.empty{opacity:.58}
.v1050TileIcon{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;font-size:24px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.01));border:1px solid rgba(223,183,104,.14)}.v1050TileIcon.muted{filter:grayscale(.7);opacity:.65}
.v1050TileLabel{font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#bca679;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v1050TileName{font-size:10.5px;font-weight:800;line-height:1.14;min-height:24px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.v1050TileName.muted{color:#9b8d77}.v1050TileFoot{margin-top:auto;font-size:7.5px;font-weight:800;letter-spacing:.07em;color:#d5bd8a}
@media(max-width:430px){.v1050LoadoutGrid{gap:7px;padding:7px}.v1050LoadoutTile{min-height:102px;padding:8px 6px 7px;border-radius:14px}.v1050TileIcon{width:34px;height:34px;font-size:22px}.v1050TileName{font-size:10px;min-height:22px}.v1050TileLabel{font-size:7.5px}.v1050Summary span{font-size:9px;padding:8px}.v1050Summary b{font-size:11px}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
