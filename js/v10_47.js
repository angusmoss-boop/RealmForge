window.RF=window.RF||{};
RF.VERSION='10.47.0';
RF.BUILD={
  version:'10.47.0',
  title:'Three Vaults',
  built:'16 Sep 2026 • 23:12 BST',
  buildId:'20260916-2312-bst'
};
RF.V1047=RF.V1047||{};

/* Realmforge V10.47 — Three Vaults
   - Removes the redundant bottom Close Bank control from the modern Vault modal.
   - Restores banking as a regional-town service in Greenvale, Ironridge and Reedmere.
   - Adds the same dedicated World > Bank section used in Greenvale to Ironridge and Reedmere.
*/

(()=>{
'use strict';
const V=RF.V1047;
V.BANKS={
  greenvale:{name:'Greenvale Bank',icon:'🏦'},
  ironridge:{name:'Ironridge Bank',icon:'🏦'},
  reedmere:{name:'Reedmere Bank',icon:'🏦'}
};

V.migrate=function(s){
  if(!s)return s;
  s.version='10.47.0';
  s.v1047=s.v1047||{};
  // Mark these locations as banking settlements for systems that inspect location data directly.
  ['greenvale','ironridge','reedmere'].forEach(id=>{if(RF.DATA?.locations?.[id])RF.DATA.locations[id].bank=true});
  return s;
};

// Restore the original regional-bank geography that V10.10 temporarily narrowed to Greenvale.
RF.isBankTown=s=>!!s&&!!V.BANKS[s.location];
['greenvale','ironridge','reedmere'].forEach(id=>{if(RF.DATA?.locations?.[id])RF.DATA.locations[id].bank=true});

const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='10.47.0';
  const om=RF.V95.migrate.bind(RF.V95);
  RF.V95.migrate=s=>V.migrate(om(s));
}

// Normalize World banking into the same dedicated card at all three banking settlements.
const worldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){
  let html=worldBase(s);
  const bank=V.BANKS[s?.location];
  if(!bank)return html;

  // Remove any earlier bank button/card so this patch owns one consistent regional-bank section.
  html=html.replace(/<button class="action bankOpen[^>]*data-open-bank[^>]*>[\s\S]*?<\/button>/g,'');
  html=html.replace(/<section class="card v1014BankSection">[\s\S]*?<\/section>/g,'');

  const disabled=(s.activity||s.combat)?'disabled':'';
  const section=`<section class="card v1014BankSection v1047BankSection"><h3>Bank</h3><button class="action bankOpen v1014BankButton v1047BankButton" data-open-bank ${disabled}><span class="emoji">${bank.icon}</span><b>${bank.name}</b><small>Deposit or withdraw stored items</small></button></section>`;
  const travel='<section class="card"><h3>Travel</h3>';
  if(html.includes(travel))html=html.replace(travel,section+travel);
  else html+=section;
  return html;
};

// Modern Vault already has the top-right X. Remove only its redundant bottom close row.
const modalBase=RF.UI.modalHtml.bind(RF.UI);
RF.UI.modalHtml=function(s){
  let h=modalBase(s);
  if(this.modal?.type==='bank'){
    h=h.replace(/<div class="v1042VaultFoot">[\s\S]*?<\/div>/g,'');
  }
  return h;
};

// V10.10's older bank binder hard-coded Greenvale. Reassert the current geography last.
const bindBase=RF.UI.bind.bind(RF.UI);
RF.UI.bind=function(s){
  bindBase(s);
  document.querySelectorAll('[data-open-bank]').forEach(b=>{
    b.onclick=()=>{
      if(!RF.isBankTown(RF.state))return;
      RF.openBank();
    };
  });
};

const oldStyle=document.getElementById('v1047-three-vaults-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1047-three-vaults-style';
st.textContent=`
.v1042VaultModal{grid-template-rows:auto auto auto minmax(0,1fr)!important}
.v1042VaultFoot{display:none!important}
.v1047BankSection{padding-bottom:14px}
.v1047BankButton{margin:0!important}
`;
document.head.appendChild(st);

if(RF.state){
  V.migrate(RF.state);
  RF.save?.(RF.state);
  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
}
})();
