window.RF=window.RF||{};
RF.VERSION='10.43.0';
RF.BUILD={
  version:'10.43.0',
  title:'Vault Compact',
  built:'16 Sep 2026 • 22:22 BST',
  buildId:'20260916-2222-bst'
};
RF.V1043=RF.V1043||{};

/* Realmforge V10.43 — Vault Compact
   - Tightens the V10.42 vault layout into a denser 4-column grid.
   - Shortens item tiles and removes the redundant Pack/Bank quantity subline.
   - Reduces item-name sizing so compact tiles still fit neatly on mobile.
*/

(()=>{
'use strict';
const V=RF.V1043;
V.migrate=function(s){
  if(!s)return s;
  s.version='10.43.0';
  s.v1043=s.v1043||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.43.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

const oldStyle=document.getElementById('v1043-vault-compact-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1043-vault-compact-style';
st.textContent=`
.v1042VaultModal{width:min(760px,100%);padding:16px 12px 12px;gap:10px}
.v1042VaultGridWrap{padding:8px}
.v1042VaultGrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.v1042BankTile{min-height:104px;padding:9px 7px 8px;border-radius:15px;gap:5px}
.v1042TileIcon{width:36px;height:36px;border-radius:12px;font-size:24px}
.v1042TileName{font-size:11px;line-height:1.12;min-height:24px}
.v1042TileMeta{display:none!important}
.v1042TileFoot{gap:6px}
.v1042TileQty{font-size:11px;line-height:1}
.v1042TileBadge{font-size:8px;padding:3px 5px}
.v1042VaultHead h2{font-size:24px}
.v1042VaultHead .sub{font-size:11px}
.v1042VaultTab{padding:11px 12px;border-radius:15px}
.v1042VaultTools{gap:8px;align-items:center}
.v1042VaultCount{font-size:10px;padding-bottom:0}
@media(max-width:430px){
  .v1042VaultModal{height:91dvh;max-height:91dvh;padding:12px 8px 10px;gap:9px}
  .v1042VaultGridWrap{padding:7px}
  .v1042VaultGrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
  .v1042BankTile{min-height:98px;padding:8px 6px 7px;border-radius:14px}
  .v1042TileIcon{width:34px;height:34px;font-size:22px}
  .v1042TileName{font-size:10.5px;min-height:22px}
  .v1042TileQty{font-size:10.5px}
  .v1042TileBadge{font-size:7.5px;padding:3px 4px}
}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
