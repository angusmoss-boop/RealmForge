window.RF=window.RF||{};
RF.VERSION='10.11.0';
RF.V1011=RF.V1011||{lastState:RF.state||null,allowCreator:false};

/* Realmforge V10.11 — Stability & Layout
   - Protect live campaigns from stray null renders that could reopen character creation.
   - Travel walker faces the direction of travel.
   - Normalize action-card sizing/alignment across World/action grids.
   - Sort item/recipe/bank/shop lists by category then name instead of insertion age.
*/

(()=>{
  if(document.getElementById('v1011-style'))return;
  const st=document.createElement('style');st.id='v1011-style';st.textContent=`
  /* Consistent action-card geometry */
  .card>.grid2{align-items:stretch}
  .card>.grid2>.action{box-sizing:border-box;min-height:92px;height:100%;display:grid;grid-template-columns:42px minmax(0,1fr);grid-template-rows:auto auto;column-gap:9px;row-gap:2px;align-content:center;align-items:center;padding:12px 11px}
  .card>.grid2>.action .emoji{grid-column:1;grid-row:1/3;float:none!important;margin:0!important;text-align:center;font-size:24px;line-height:1}
  .card>.grid2>.action b{grid-column:2;grid-row:1;font-size:13px;line-height:1.2}
  .card>.grid2>.action small{grid-column:2;grid-row:2;margin-top:0;line-height:1.25}
  .card>.grid2>.action:not(:has(.emoji)){grid-template-columns:minmax(0,1fr)}
  .card>.grid2>.action:not(:has(.emoji)) b,.card>.grid2>.action:not(:has(.emoji)) small{grid-column:1}
  @media(max-width:420px){.card>.grid2>.action{min-height:88px;grid-template-columns:38px minmax(0,1fr);padding:10px 9px}.card>.grid2>.action .emoji{font-size:22px}}

  /* Traveller faces forward while retaining the light walking bob. */
  .roadWalker{animation:v1011walk .6s ease-in-out infinite alternate!important;transform-origin:center}
  @keyframes v1011walk{from{transform:scaleX(-1) translateY(0)}to{transform:scaleX(-1) translateY(-3px) rotate(-2deg)}}
  `;document.head.appendChild(st);
})();

// ---------- Campaign-state guard ----------
// Keep an in-memory reference to the last valid live state. A stray render(null/undefined)
// from post-combat/event cleanup should never be interpreted as character creation.
const v1011RenderBase=RF.UI.render.bind(RF.UI);
RF.UI.render=function(s){
  if(s){RF.V1011.lastState=s;RF.V1011.allowCreator=false;}
  if(!s&&RF.state){s=RF.state;}
  if(!s&&!RF.state&&RF.V1011.lastState&&!RF.V1011.allowCreator&&!(RF.V101?.mainMenu)){
    RF.state=RF.V1011.lastState;s=RF.state;
    try{RF.save?.(s)}catch(_){}
  }
  const out=v1011RenderBase(s);
  requestAnimationFrame(()=>RF.V1011.organizeLists());
  return out;
};

// Mark only deliberate new-campaign flows as allowed to reach the creator.
if(RF.V95?.doConfirm){
  const v1011ConfirmBase=RF.V95.doConfirm.bind(RF.V95);
  RF.V95.doConfirm=function(m){if(m?.action==='new')RF.V1011.allowCreator=true;return v1011ConfirmBase(m)};
}
document.addEventListener('click',e=>{
  const el=e.target?.closest?.('[data-v101-new]');
  if(el)RF.V1011.allowCreator=true;
},true);
const v1011StartNewBase=RF.startNew;
if(typeof v1011StartNewBase==='function')RF.startNew=function(...a){RF.V1011.allowCreator=false;const r=v1011StartNewBase.apply(this,a);if(RF.state)RF.V1011.lastState=RF.state;return r};

// ---------- Category-first visual ordering ----------
RF.V1011.categoryOrder={weapon:0,armor:1,food:2,material:3,tool:4,treasure:5,other:6};
RF.V1011.itemSortKey=function(id){
  const it=RF.DATA.items?.[id];if(!it)return [99,'zzz'];
  const cat=RF.v92Category?RF.v92Category(it):(it.slot==='main'?'weapon':it.slot?'armor':it.tool?'tool':it.type||'other');
  return [RF.V1011.categoryOrder[cat]??98,String(it.name||id).toLowerCase()];
};
RF.V1011.compareItemIds=function(a,b){let A=RF.V1011.itemSortKey(a),B=RF.V1011.itemSortKey(b);return A[0]-B[0]||A[1].localeCompare(B[1])};
RF.V1011.idFromRow=function(el){
  if(!el)return null;
  if(el.dataset?.itemDetail)return el.dataset.itemDetail;
  if(el.dataset?.shopDetail)return el.dataset.shopDetail;
  if(el.dataset?.bankDeposit)return el.dataset.bankDeposit;
  if(el.dataset?.bankDepositAll)return el.dataset.bankDepositAll;
  if(el.dataset?.bankWithdraw)return el.dataset.bankWithdraw;
  if(el.dataset?.bankWithdrawAll)return el.dataset.bankWithdrawAll;
  if(el.dataset?.recipeDetail){const r=RF.DATA.recipes?.[el.dataset.recipeDetail];return Object.keys(r?.outputs||{})[0]||el.dataset.recipeDetail;}
  const btn=el.querySelector?.('[data-bank-deposit],[data-bank-deposit-all],[data-bank-withdraw],[data-bank-withdraw-all]');
  if(btn)return btn.dataset.bankDeposit||btn.dataset.bankDepositAll||btn.dataset.bankWithdraw||btn.dataset.bankWithdrawAll;
  return null;
};
RF.V1011.sortContainer=function(container){
  if(!container)return;
  const kids=[...container.children].filter(x=>RF.V1011.idFromRow(x));
  if(kids.length<2)return;
  kids.sort((a,b)=>RF.V1011.compareItemIds(RF.V1011.idFromRow(a),RF.V1011.idFromRow(b)));
  kids.forEach(x=>container.appendChild(x));
};
RF.V1011.organizeLists=function(){
  // Pack and ordinary browse lists.
  document.querySelectorAll('.inventoryList,.v1010BankScroll').forEach(RF.V1011.sortContainer);
  // Shop/crafting list blocks: only reorder rows that carry an item/recipe id.
  document.querySelectorAll('.list').forEach(list=>{
    const candidates=[...list.children].filter(x=>x.matches?.('[data-shop-detail],[data-recipe-detail]'));
    if(candidates.length<2)return;
    candidates.sort((a,b)=>RF.V1011.compareItemIds(RF.V1011.idFromRow(a),RF.V1011.idFromRow(b)));
    candidates.forEach(x=>list.appendChild(x));
  });
};

// Ensure active save metadata carries the patch version without otherwise mutating progression.
if(RF.state){RF.state.version='10.11.0';RF.V1011.lastState=RF.state;try{RF.save?.(RF.state)}catch(_){};requestAnimationFrame(()=>RF.V1011.organizeLists())}
