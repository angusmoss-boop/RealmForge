window.RF=window.RF||{};
RF.VERSION='11.3.1';
RF.BUILD={
  version:'11.3.1',
  title:'Verdant Count Tabs',
  built:'17 Sep 2026 • 21:55 BST',
  buildId:'20260917-2155-bst'
};
RF.V1131=RF.V1131||{};

/* Realmforge V11.3.1 — Verdant Count Tabs
   - Refreshes the small count/status pills used in card headers.
   - Gives them a cleaner green tab treatment that fits more neatly into the top-right corner.
   - Applies consistently anywhere the standard .tag badge appears.
*/

(()=>{
'use strict';
const V=RF.V1131;
V.version='11.3.1';
const old=document.getElementById('v1131-verdant-count-tabs-style');if(old)old.remove();
const st=document.createElement('style');
st.id='v1131-verdant-count-tabs-style';
st.textContent=`
.questTitle{align-items:flex-start}
.questTitle>:first-child{min-width:0}
.tag{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  align-self:flex-start!important;
  flex:0 0 auto!important;
  margin-left:auto!important;
  max-width:min(44vw,180px);
  min-height:26px;
  padding:6px 11px!important;
  border-radius:13px!important;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  font-size:10px!important;
  line-height:1!important;
  letter-spacing:.12em!important;
  font-weight:800!important;
  text-transform:uppercase;
  color:#d9efbf!important;
  background:linear-gradient(180deg,#375f36 0%,#284a2a 52%,#213f24 100%)!important;
  border:1px solid #79b66b!important;
  box-shadow:
    0 1px 0 rgba(255,255,255,.10) inset,
    0 8px 16px rgba(17,33,16,.16),
    0 0 0 1px rgba(8,15,9,.08)!important;
}
.questTitle .tag b,.questTitle .tag strong{font-weight:800}
@media (max-width:430px){
  .tag{
    max-width:min(46vw,150px);
    min-height:24px;
    padding:5px 10px!important;
    border-radius:12px!important;
    font-size:9.5px!important;
    letter-spacing:.10em!important;
  }
}
`;
document.head.appendChild(st);
if(RF.state){setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
