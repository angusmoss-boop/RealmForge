window.RF=window.RF||{};
RF.VERSION='11.3.2';
RF.BUILD={
  version:'11.3.2',
  title:'Battle Reward Flow',
  built:'17 Sep 2026 • 22:05 BST',
  buildId:'20260917-2205-bst'
};
RF.V1132=RF.V1132||{};

/* Realmforge V11.3.2 — Battle Reward Flow
   - Removes the nested scrolling region from post-combat reward lists.
   - Long reward lists expand naturally inside the battle-summary modal.
   - The battle summary itself is the only vertical scrolling surface, with Continue remaining after the final reward.
*/

(()=>{
'use strict';
const V=RF.V1132;
V.version='11.3.2';

const old=document.getElementById('v1132-battle-reward-flow-style');if(old)old.remove();
const st=document.createElement('style');
st.id='v1132-battle-reward-flow-style';
st.textContent=`
/* V10 originally capped the reward list at 38vh. That created a second scroller inside
   the battle-summary popup. Let the rewards grow normally and leave scrolling to .modal. */
.battleSummary .resultGains{
  max-height:none!important;
  height:auto!important;
  overflow:visible!important;
  overscroll-behavior:auto!important;
}
.battleSummary{
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch;
  overscroll-behavior:contain!important;
}
.battleSummary .startBtn{
  position:static!important;
  width:100%;
  margin-top:14px;
}
`;
document.head.appendChild(st);

// Presentation-only patch: no save migration and no loadout/inventory mutation.
if(RF.state){setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
