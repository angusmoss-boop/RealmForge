window.RF=window.RF||{};
RF.VERSION='10.55.0';
RF.BUILD={
  version:'10.55.0',
  title:'Loadout Balance',
  built:'17 Sep 2026 • 15:30 BST',
  buildId:'20260917-1530-bst'
};
RF.V1055=RF.V1055||{};

/* Realmforge V10.55 — Loadout Balance
   - Every combat equipment slot now contributes both damage and armour when the item defines those stats.
   - Weapons may carry smaller defensive bonuses; armour may carry smaller offensive bonuses.
   - Rebalances/normalises all existing combat equipment without changing its primary progression stat.
   - Preserves detached V10.53 loadouts and existing equipped item IDs during save migration.
*/

(()=>{
'use strict';
const V=RF.V1055;
V.version='10.55.0';
V.SLOTS=['main','off','head','chest','legs','boots','ring1','ring2'];

// Primary progression values are intentionally kept at their existing levels so current
// equipment requirements and friends' established loadouts do not jump tiers unexpectedly.
// Secondary values add the new cross-stat identity requested for combat equipment.
V.STATS={
  rusty_sword:          {damage:3, armor:0},
  bronze_sword:         {damage:6, armor:1},
  shortbow:             {damage:5, armor:0},
  iron_sword:           {damage:8, armor:2},
  crossroads_cutlass:   {damage:9, armor:2},
  watch_spear:          {damage:12,armor:2},
  blackthorn_blade:     {damage:13,armor:2},
  marshbow:             {damage:12,armor:1},
  reedmere_spear:       {damage:13,armor:2},
  silvered_blade:       {damage:14,armor:3},
  quarry_maul:          {damage:14,armor:2},
  steel_sword:          {damage:15,armor:3},
  mirewatch_bow:        {damage:16,armor:2},
  ironridge_warhammer:  {damage:18,armor:4},
  warden_blade:         {damage:20,armor:4},

  leather_vest:         {damage:1, armor:3},
  greenvale_jerkin:     {damage:1, armor:4},
  iron_helm:            {damage:1, armor:4},
  ranger_cloak:         {damage:2, armor:5},
  miners_helm:          {damage:1, armor:5},
  wayfarer_coat:        {damage:1, armor:6},
  steel_helm:           {damage:2, armor:7},
  mirewatch_hood:       {damage:2, armor:7},
  fen_leathers:         {damage:2, armor:8},
  bronze_buckler:       {damage:2, armor:3},
  ironridge_kite_shield:{damage:3, armor:9},
  steel_cuirass:        {damage:2, armor:11},
  ash_ring:             {damage:2, armor:2}
};

V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
V.cleanDesc=function(desc){
  return String(desc||'')
    .replace(/\+\d+\s+(?:melee|ranged)\s+damage\.?\s*/gi,'')
    .replace(/\+\d+\s+damage\.?\s*/gi,'')
    .replace(/\+\d+\s+armou?r\.?\s*/gi,'')
    .replace(/\s{2,}/g,' ')
    .trim();
};
V.applyItemStats=function(){
  Object.entries(V.STATS).forEach(([id,stat])=>{
    const it=RF.DATA.items?.[id];if(!it)return;
    const lore=V.cleanDesc(it.desc);
    it.damage=Math.max(0,+stat.damage||0);
    it.armor=Math.max(0,+stat.armor||0);
    const parts=[];
    if(it.damage)parts.push(`+${it.damage} damage`);
    if(it.armor)parts.push(`+${it.armor} armour`);
    it.desc=`${lore?`${lore} `:''}${parts.join(' • ')}${parts.length?'.':''}`.trim();
  });
};
V.applyItemStats();

V.equipmentStats=function(s){
  let damage=0,armor=0;
  V.SLOTS.forEach(slot=>{
    const id=s?.equipment?.[slot],it=id?RF.DATA.items?.[id]:null;
    if(!it)return;
    damage+=Math.max(0,+it.damage||0);
    armor+=Math.max(0,+it.armor||0);
  });
  return {damage,armor};
};
RF.equipmentStats=V.equipmentStats;
RF.equipmentDamage=s=>V.equipmentStats(s).damage;
RF.equipmentArmor=s=>V.equipmentStats(s).armor;

// Legacy callers use RF.weaponDamage as the player's equipment damage contribution.
// From V10.55 it means ALL worn damage bonuses, not only the main-hand item.
RF.weaponDamage=function(s){
  let damage=RF.equipmentDamage(s);
  if(s?.combat?.__researchBonus)damage+=Math.max(0,+s.combat.__researchBonus||0);
  return damage;
};
RF.damageOutput=RF.weaponDamage;

// Rebuild effective armour from the same ingredients the previous wrapper chain used:
// worn armour + Defence passive + Bulwark perk, with V10.7's temporary enemy-resolution
// effectiveness boost preserved. The important change is that ALL equipment slots contribute.
RF.armor=function(s){
  const equipment=RF.equipmentArmor(s);
  const defence=Math.max(1,+s?.skills?.defence?.level||1);
  const defencePassive=Math.floor(defence*.38);
  const bulwark=(RF.perkRank?.(s,'bulwark')||0)*2;
  let total=equipment+defencePassive+bulwark;
  if(RF.V107?.enemyResolving)total*=1.35;
  return total;
};

// V10.7 captured an older armour function for threat previews. Rebind the preview so the
// displayed threat estimate sees the same complete V10.55 loadout as real enemy attacks.
if(RF.V107){
  RF.v107Threat=function(s,e){
    const armour=RF.armor(s)||0,r=RF.v107EnemyDamageRange(e),mitigation=armour*.32*1.35;
    const lo=Math.max(1,Math.round(r[0]-mitigation)),hi=Math.max(1,Math.round(r[1]-mitigation));
    const avg=(lo+hi)/2,hits=(s.player.maxHp||100)/Math.max(1,avg);
    let name='Low';
    if(hits<2.8)name='Extreme';
    else if(hits<4)name='Severe';
    else if(hits<5.5)name='High';
    else if(hits<8)name='Moderate';
    return {name,range:[lo,hi]};
  };
}

V.reconcileLoadout=function(s){
  if(!s)return s;
  s.equipment=s.equipment||{};
  V.SLOTS.forEach(slot=>{if(!(slot in s.equipment))s.equipment[slot]=null});
  s.toolbelt=s.toolbelt||{};
  // V10.53 owns physical extraction from the Pack. Calling its migration is safe/idempotent
  // and specifically protects older campaigns jumping directly to this build.
  if(RF.V1053?.migrate)RF.V1053.migrate(s);
  return s;
};
V.migrate=function(s){
  if(!s)return s;
  V.reconcileLoadout(s);
  s.version='10.55.0';
  s.v1055=s.v1055||{};
  s.v1055.loadoutStats=true;
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.55.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

// Loadout presentation: use the new terminology while retaining the existing page structure.
if(RF.UI?.equipmentPage){
  const equipmentPageBase=RF.UI.equipmentPage.bind(RF.UI);
  RF.UI.equipmentPage=function(s){
    let h=equipmentPageBase(s);
    h=h.replace('⚔️ Weapon Damage','⚔️ Damage Output');
    return h;
  };
}
// Keep the same terminology anywhere the Character summary still exposes this stat.
if(RF.UI?.character){
  const characterBase=RF.UI.character.bind(RF.UI);
  RF.UI.character=function(s){return characterBase(s).replace(/Weapon Damage/g,'Damage Output')};
}

const st=document.createElement('style');st.id='v1055-loadout-balance-style';st.textContent=`
.v1050Summary span:first-child b{color:#f1d49b}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
