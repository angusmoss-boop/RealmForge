window.RF=window.RF||{};
RF.VERSION='10.51.0';
RF.BUILD={
  version:'10.51.0',
  title:'Vault Trim',
  built:'17 Sep 2026 • 03:27 BST',
  buildId:'20260917-0327-bst'
};
RF.V1051=RF.V1051||{};

/* Realmforge V10.51 — Vault Trim
   - Removes the redundant secondary Pack/Bank count beside the Vault category filters.
   - The Pack and Bank tabs at the top remain the single source of capacity/storage counts.
*/

(()=>{
'use strict';
const V=RF.V1051;

V.migrate=function(s){
  if(!s)return s;
  s.version='10.51.0';
  s.v1051=s.v1051||{};
  return s;
};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.51.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

// V10.42 writes a second count beside the category controls. The top Pack/Bank tabs already
// show the same information, so remove that duplicate from the rendered Vault markup entirely.
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=modalBase(s);
  if(this.modal?.type==='bank')h=h.replace(/<div class="v1042VaultCount">[\s\S]*?<\/div>/,'');
  return h;
};

const oldStyle=document.getElementById('v1051-vault-trim-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1051-vault-trim-style';
st.textContent=`
.v1042VaultTools{grid-template-columns:minmax(0,1fr)!important}
.v1042VaultCount{display:none!important}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
