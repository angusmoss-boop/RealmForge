window.RF=window.RF||{};
RF.VERSION='10.14.0';
RF.V1014=RF.V1014||{};

/* Realmforge V10.14 — Greenvale Bank Section
   - Remove Greenvale Bank from the shared World Actions grid.
   - Render the bank as its own dedicated section directly below Actions.
   - Avoid the Greenvale-only action-grid/icon relayout path that caused visible flicker.
*/
(()=>{
  const st=document.createElement('style');
  st.id='v1014-style';
  st.textContent=`
    .v1014BankSection{padding-bottom:14px}
    .v1014BankSection .v1014BankButton{
      width:100%;
      min-height:72px;
      margin:0!important;
      display:grid!important;
      grid-template-columns:44px minmax(0,1fr);
      grid-template-rows:auto auto;
      column-gap:12px;
      align-items:center;
      text-align:left;
    }
    .v1014BankSection .v1014BankButton .emoji{
      grid-row:1 / span 2;
      grid-column:1;
      width:44px!important;
      min-width:44px!important;
      height:44px!important;
      font-size:34px!important;
      line-height:44px!important;
      margin:0!important;
      padding:0!important;
      display:block!important;
      float:none!important;
      text-align:center!important;
      transform:none!important;
      animation:none!important;
      transition:none!important;
      contain:layout style;
    }
    .v1014BankSection .v1014BankButton b{grid-column:2;grid-row:1;align-self:end}
    .v1014BankSection .v1014BankButton small{grid-column:2;grid-row:2;align-self:start}
  `;
  document.getElementById('v1014-style')?.remove();
  document.head.appendChild(st);

  const base=RF.UI.world.bind(RF.UI);
  RF.UI.world=function(s){
    let html=base(s);
    if(s.location!=='greenvale') return html;

    // Remove the V10.10 bank button from the shared Actions grid entirely.
    html=html.replace(/<button class="action bankOpen" data-open-bank[^>]*>[\s\S]*?<\/button>/g,'');

    const disabled=(s.activity||s.combat)?'disabled':'';
    const bank=`<section class="card v1014BankSection"><h3>Bank</h3><button class="action bankOpen v1014BankButton" data-open-bank ${disabled}><span class="emoji">🏦</span><b>Greenvale Bank</b><small>Deposit or withdraw stored items</small></button></section>`;

    // Place the bank between Actions and Travel so it has its own layout context.
    const travel='<section class="card"><h3>Travel</h3>';
    if(html.includes(travel)) html=html.replace(travel,bank+travel);
    else html+=bank;
    return html;
  };

  if(RF.state){
    RF.state.version='10.14.0';
    try{RF.save?.(RF.state)}catch(_){}
    RF.UI.render(RF.state);
  }
})();
