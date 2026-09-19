/* Realmforge V11.12.0 — Canonical Gameplay Systems Core */

/* ===== js/systems/commerce.js ===== */
/* Realmforge V11.11.0 — Canonical Commerce implementation.
   Mature V10.54 market behaviour moved out of the compatibility runtime.
   Installed at the original V10.54 execution point so every later patch sees the same RF.V1054 contract. */
(() => {
  'use strict';
  const RF=window.RF;
  let installed=false;
  function installHistoricalV1054() {
    if(installed) return RF.V1054;
    installed=true;
    RF.V1054=RF.V1054||{};
    const V=RF.V1054;
    V.version='10.54.0';
    V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    V.cap=s=>RF.packCapacity?RF.packCapacity(s):(RF.V82?.PACK_CAP||28);

    // Regional market-only additions. Requirements remain derived by the existing equipment system,
    // so players may purchase them early but cannot equip them until the relevant skill is high enough.
    Object.assign(RF.DATA.items,{
      greenvale_jerkin:{name:'Greenvale Jerkin',icon:'🦺',type:'armor',value:78,armor:4,slot:'chest',rarity:'Uncommon',desc:'Layered leather made by Greenvale saddlers. +4 armour.'},
      millers_pie:{name:"Miller's Savoury Pie",icon:'🥧',type:'food',value:18,heal:24,desc:'Hot pastry packed with root vegetables and minced meat. Restores 24 health.'},
      crossroads_cutlass:{name:'Roadwarden Cutlass',icon:'🗡️',type:'weapon',value:120,damage:9,slot:'main',rarity:'Uncommon',desc:'A short road blade built for cramped wagon fights. +9 melee damage.'},
      wayfarer_coat:{name:'Wayfarer Field Coat',icon:'🧥',type:'armor',value:155,armor:6,slot:'chest',rarity:'Uncommon',desc:'Waxed travelling layers with hidden reinforcement. +6 armour.'},
      watch_spear:{name:'Eastwatch Spear',icon:'🔱',type:'weapon',value:175,damage:12,slot:'main',rarity:'Uncommon',desc:'A disciplined guard spear with a dark iron head. +12 melee damage.'},
      miners_helm:{name:'Pitwarden Helm',icon:'⛑️',type:'armor',value:130,armor:5,slot:'head',rarity:'Uncommon',desc:'A reinforced mining helm adapted for ugly tunnel fights. +5 armour.'},
      ironridge_warhammer:{name:'Ironridge Warhammer',icon:'🔨',type:'weapon',value:360,damage:18,slot:'main',rarity:'Rare',desc:'A forge-heavy hammer balanced just enough for battle. +18 melee damage.'},
      ironridge_kite_shield:{name:'Ironridge Kite Shield',icon:'🛡️',type:'armor',value:295,armor:9,slot:'off',rarity:'Rare',desc:'Riveted Ironridge plate with a tall fighting profile. +9 armour.'},
      quarry_maul:{name:'Redstone Maul',icon:'🔨',type:'weapon',value:250,damage:14,slot:'main',rarity:'Uncommon',desc:'A quarry hammer whose working face has seen more stone than skulls. +14 melee damage.'},
      reedmere_spear:{name:'Reedmere Marsh Spear',icon:'🔱',type:'weapon',value:225,damage:13,slot:'main',rarity:'Uncommon',desc:'A long ash-and-reed spear used from narrow stilt walkways. +13 melee damage.'},
      mirewatch_bow:{name:'Mirewatch Warbow',icon:'🏹',type:'weapon',value:340,damage:16,slot:'main',ranged:true,rarity:'Rare',desc:'A heavy ranger bow sealed against fen rain. +16 ranged damage.'},
      mirewatch_hood:{name:'Mirewatch Ranger Hood',icon:'🥷',type:'armor',value:220,armor:7,slot:'head',rarity:'Rare',desc:'Layered hood, leather cap and hidden mail used by Mirewatch rangers. +7 armour.'}
    });

    // Stock rows: [item id, minimum daily stock, maximum daily stock, local buy-price multiplier].
    // Markets exist only at places where a permanent stall, quartermaster or work commissary makes sense.
    V.MARKETS=RF.Config.clone("commerce.markets");

    V.hash=function(str){let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
    V.qtyFor=function(s,loc,id,min,max){if(max<=min)return min;const seed=V.hash(`${s?.seed||'rf'}|${s?.day||1}|${loc}|${id}`);return min+(seed%(max-min+1))};
    V.market=function(loc){return V.MARKETS[loc]||null};
    V.stockSpec=function(loc,id){return V.market(loc)?.stock?.find(x=>x[0]===id)||null};
    V.ensureStock=function(s,loc=s?.location){
      const def=V.market(loc);if(!s||!def)return null;
      s.v1054=s.v1054||{};s.v1054.markets=s.v1054.markets||{};
      let rec=s.v1054.markets[loc];
      if(!rec||rec.day!==s.day){
        const stock={};
        def.stock.forEach(([id,min,max])=>{if(RF.DATA.items[id])stock[id]=V.qtyFor(s,loc,id,min,max)});
        rec={day:s.day,stock};s.v1054.markets[loc]=rec;
      }
      return rec;
    };
    V.localBuyMult=function(loc,id){const spec=V.stockSpec(loc,id);return Math.max(.5,Number(spec?.[3])||1)};
    V.buyPrice=function(s,loc,id){const base=RF.marketPrice?RF.marketPrice(s,id,true):Math.max(1,Math.round((RF.DATA.items[id]?.value||1)*1.25));return Math.max(1,Math.round(base*(V.market(loc)?.buy||1)*V.localBuyMult(loc,id)))};
    V.sellPrice=function(s,loc,id){const base=RF.marketPrice?RF.marketPrice(s,id,false):Math.max(1,Math.floor((RF.DATA.items[id]?.value||1)*.55));const cat=RF.v92Category?.(RF.DATA.items[id])||'other',def=V.market(loc),demand=def?.demand?.[cat]??1;return Math.max(1,Math.round(base*(def?.sell||1)*demand))};
    V.sortedIds=function(ids){return [...ids].sort((a,b)=>{const ca=RF.v92Category?.(RF.DATA.items[a])||'other',cb=RF.v92Category?.(RF.DATA.items[b])||'other';const cats=(RF.v92Cats||[]).map(x=>x[0]);const d=(cats.indexOf(ca)+1||99)-(cats.indexOf(cb)+1||99);if(d)return d;return (RF.DATA.items[a]?.name||a).localeCompare(RF.DATA.items[b]?.name||b)})};
    V.buyMax=function(s,loc,id){const rec=V.ensureStock(s,loc),stock=Math.max(0,Number(rec?.stock?.[id])||0),price=V.buyPrice(s,loc,id);if(stock<1||price<1)return 0;const byGold=Math.floor((s.gold||0)/price);if(byGold<1)return 0;const canReceive=(s.inventory?.[id]||0)>0||RF.packUsed(s)<V.cap(s)||RF.isBankTown?.(s);return canReceive?Math.min(stock,byGold):0};
    V.sellMax=(s,id)=>Math.max(0,Number(s?.inventory?.[id])||0);
    V.quality=it=>it?.rarity||'Common';
    V.req=function(s,id){return RF.v93Req?.(s,id)||''};

    V.migrate=function(s){
      if(!s)return s;
      s.version='10.54.0';s.v1054=s.v1054||{};s.v1054.markets=s.v1054.markets||{};s.v1054.view=s.v1054.view||'buy';
      s.v93=s.v93||{};s.v93.marketCategory=s.v93.marketCategory||'all';
      Object.keys(V.MARKETS).forEach(id=>{if(RF.DATA.locations?.[id])RF.DATA.locations[id].market=true});
      s.stats=s.stats||{};if(s.stats.marketTrades==null)s.stats.marketTrades=0;
      return s;
    };
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */

    // Shop is no longer a global app tab. Commerce lives in the World at actual market locations.
    if(RF.V95?.navItems)RF.V95.navItems=RF.V95.navItems.filter(x=>x[0]!=='shop');
    if(RF.V1038){RF.V1038.items=(RF.V1038.items||[]).filter(x=>x.id!=='shop');if(RF.V1038.meta)delete RF.V1038.meta.shop}
    if(RF.UI.tab==='shop')RF.UI.tab='world';

    RF.openMarket=function(){
      const s=RF.state,def=V.market(s?.location);if(!s||!def)return;
      V.migrate(s);V.ensureStock(s,s.location);s.v1054.view=s.v1054.view==='sell'?'sell':'buy';
      RF.UI.modal={type:'v1054Market'};RF.save?.(s);RF.UI.render(s);
    };
    V.closeMarket=function(){RF.UI.modal=null;RF.UI.render(RF.state)};
    V.openDetail=function(mode,id){if(RF.UI.modal?.type!=='v1054Market')return;RF.UI.modal.detail={mode:mode==='sell'?'sell':'buy',id};RF.UI.modal.notice='';RF.UI.render(RF.state)};
    V.closeDetail=function(){if(RF.UI.modal?.type==='v1054Market'){delete RF.UI.modal.detail;RF.UI.modal.notice='';RF.UI.render(RF.state)}};

    V.trade=function(mode,id,qty){
      const s=RF.state,loc=s?.location,def=V.market(loc),it=RF.DATA.items?.[id];if(!s||!def||!it)return;
      qty=Math.max(1,Math.floor(Number(qty)||1));
      if(mode==='buy'){
        const rec=V.ensureStock(s,loc),price=V.buyPrice(s,loc,id),max=V.buyMax(s,loc,id);qty=Math.min(qty,max);
        if(qty<1){RF.UI.modal.notice='You cannot buy that amount right now.';return RF.UI.render(s)}
        const result=RF.addItem(s,id,qty);if(result===false){RF.UI.modal.notice='Your Pack cannot take that purchase.';return RF.UI.render(s)}
        const cost=price*qty;s.gold-=cost;rec.stock[id]=Math.max(0,(rec.stock[id]||0)-qty);RF.addXp?.(s,'trading',Math.max(4,Math.round(4*Math.sqrt(qty))));s.stats.marketTrades+=qty;
        RF.log?.(s,`Bought ${qty} × ${it.name} from ${def.name} for ${cost}g.${result==='banked'?' Sent to your Bank because the Pack was full.':''}`,'good');
        RF.UI.modal.notice=`Bought ${qty} × ${it.name} for ${cost}g${result==='banked'?' • sent to Bank':''}.`;
      }else{
        const price=V.sellPrice(s,loc,id),max=V.sellMax(s,id);qty=Math.min(qty,max);
        if(qty<1){RF.UI.modal.notice='You do not have that amount in your Pack.';return RF.UI.render(s)}
        if(!RF.takeItem(s,id,qty)){RF.UI.modal.notice='That sale could not be completed.';return RF.UI.render(s)}
        const gain=price*qty;s.gold+=gain;s.stats.goldEarned=(s.stats.goldEarned||0)+gain;s.stats.marketTrades+=qty;RF.addXp?.(s,'trading',Math.max(3,Math.round(3*Math.sqrt(qty))));
        RF.log?.(s,`Sold ${qty} × ${it.name} to ${def.name} for ${gain}g.`,'good');RF.UI.modal.notice=`Sold ${qty} × ${it.name} for ${gain}g.`;
      }
      RF.save?.(s);RF.UI.render(s);
    };

    V.marketTile=function(s,loc,mode,id){
      const it=RF.DATA.items[id];if(!it)return'';
      const buy=mode==='buy',rec=V.ensureStock(s,loc),qty=buy?Math.max(0,rec.stock[id]||0):V.sellMax(s,id),price=buy?V.buyPrice(s,loc,id):V.sellPrice(s,loc,id),soldout=qty<1;
      return `<button type="button" class="v1054MarketTile ${soldout?'soldout':''}" data-v1054-item="${V.escape(id)}" data-v1054-mode="${mode}" ${soldout?'aria-disabled="true"':''}>
        <div class="v1054ItemIcon">${it.icon||'📦'}</div>
        <div class="v1054ItemName">${V.escape(it.name)}</div>
        <div class="v1054ItemQuality">${V.escape(V.quality(it))}</div>
        <div class="v1054ItemFoot"><span>×${qty}</span><b>${price}g</b></div>
      </button>`;
    };
    V.detailStats=function(it){const a=[];if(it.damage)a.push(`⚔️ ${it.damage} damage`);if(it.armor)a.push(`🛡️ ${it.armor} armour`);if(it.heal)a.push(`❤️ ${it.heal} HP`);if(it.stamina)a.push(`⚡ ${it.stamina} stamina`);if(it.tool)a.push(`🧰 ${RF.v103ToolLabel?.(it.tool)||it.tool} • Tier ${it.tier||1}`);if(it.power!=null)a.push(`⚙️ Work power ${it.power}`);return a};
    V.detailHtml=function(s,loc,d){
      if(!d)return'';const mode=d.mode==='sell'?'sell':'buy',id=d.id,it=RF.DATA.items[id];if(!it)return'';
      const buy=mode==='buy',price=buy?V.buyPrice(s,loc,id):V.sellPrice(s,loc,id),max=buy?V.buyMax(s,loc,id):V.sellMax(s,id),rec=V.ensureStock(s,loc),available=buy?Math.max(0,rec.stock[id]||0):V.sellMax(s,id),req=V.req(s,id),stats=V.detailStats(it),action=buy?'Buy':'Sell';
      return `<div class="v1054DetailBack"><div class="v1054DetailModal">
        <div class="v1054DetailHero"><div class="v1054DetailIcon">${it.icon||'📦'}</div><div><span class="eyebrow">${action.toUpperCase()} • ${V.escape(V.quality(it))}</span><h2>${V.escape(it.name)}</h2></div></div>
        <div class="v1054DetailDesc">${V.escape(it.desc||'No description recorded.')}</div>
        ${stats.length?`<div class="v1054DetailStats">${stats.map(x=>`<span>${V.escape(x)}</span>`).join('')}</div>`:''}
        ${req?`<div class="v1054Requirement"><b>Requirement to equip:</b> ${V.escape(req)}<small>You may purchase this item regardless of your current level.</small></div>`:''}
        <div class="v1054TradeSummary"><span>${buy?'Unit price':'Unit offer'} <b>${price}g</b></span><span>${buy?'In stock':'In Pack'} <b>×${available}</b></span><span>Gold <b>${s.gold}g</b></span></div>
        ${RF.UI.modal?.notice?`<div class="v1054TradeNotice">${V.escape(RF.UI.modal.notice)}</div>`:''}
        <label class="v1054QtyLabel">Amount<input data-v1054-qty type="number" inputmode="numeric" min="1" max="${Math.max(1,max)}" value="1"></label>
        <div class="v1054DetailActions"><button type="button" data-v1054-trade-one="${mode}" data-id="${V.escape(id)}" ${max<1?'disabled':''}>${action} 1 • ${price}g</button><button type="button" data-v1054-trade-x="${mode}" data-id="${V.escape(id)}" ${max<1?'disabled':''}>${action} X</button><button type="button" class="close" data-v1054-detail-close>Close</button></div>
      </div></div>`;
    };
    V.modalHtml=function(s){
      const loc=s.location,def=V.market(loc);if(!def)return'';const rec=V.ensureStock(s,loc),view=s.v1054.view==='sell'?'sell':'buy',cat=s.v93.marketCategory||'all';
      let ids;if(view==='buy')ids=def.stock.map(x=>x[0]).filter(id=>RF.DATA.items[id]);else ids=Object.entries(s.inventory||{}).filter(([id,q])=>(+q||0)>0&&RF.DATA.items[id]?.value>0).map(x=>x[0]);
      ids=V.sortedIds(ids).filter(id=>cat==='all'||RF.v92Category(RF.DATA.items[id])===cat);
      const tiles=ids.map(id=>V.marketTile(s,loc,view,id)).join('');
      const tick=s.world?.market||{food:1,metal:1,wood:1};
      return `<div class="modalBack"><div class="modal v1054MarketModal">
        <div class="v1054MarketHead"><div><span class="eyebrow">${V.escape((RF.DATA.locations[loc]?.name||loc).toUpperCase())} • TIER ${def.tier}</span><h2>${def.icon} ${V.escape(def.name)}</h2><div class="sub">Finite local stock • restocks each dawn</div></div><button class="v1054MarketClose" type="button" data-v1054-close aria-label="Close Market">✕</button></div>
        <div class="v1054MarketTicker"><span>🍞 ×${(+tick.food||1).toFixed(2)}</span><span>⚒️ ×${(+tick.metal||1).toFixed(2)}</span><span>🪵 ×${(+tick.wood||1).toFixed(2)}</span><span>🪙 ${s.gold}g</span></div>
        <div class="v1054TradeTabs"><button type="button" class="${view==='buy'?'active':''}" data-v1054-view="buy"><span>🛒 Buy</span><b>${Object.values(rec.stock).reduce((a,b)=>a+(+b||0),0)} units</b></button><button type="button" class="${view==='sell'?'active':''}" data-v1054-view="sell"><span>💰 Sell</span><b>${Object.values(s.inventory||{}).reduce((a,b)=>a+(+b||0),0)} carried</b></button></div>
        ${RF.v93Select('market',cat)}
        <div class="v1054MarketGridWrap"><div class="v1054MarketGrid">${tiles||`<div class="v1054MarketEmpty">${view==='buy'?'No wares in this category.':'Nothing saleable in this category.'}</div>`}</div></div>
        ${V.detailHtml(s,loc,RF.UI.modal?.detail)}
      </div></div>`;
    };

    // World markets sit beside other physical services such as the Bank, not in the global navigator.
    const worldBase=RF.UI.world.bind(RF.UI);
    RF.UI.world=function(s){
      let h=worldBase(s),def=V.market(s?.location);if(!def)return h;
      h=h.replace(/<section class="card v1054MarketSection">[\s\S]*?<\/section>/g,'');
      const disabled=(s.activity||s.combat)?'disabled':'';
      const section=`<section class="card v1054MarketSection"><h3>Market</h3><button class="action v1054MarketButton" data-open-market ${disabled}><span class="emoji">${def.icon}</span><b>${V.escape(def.name)}</b><small>Buy & sell local goods • finite daily stock</small></button></section>`;
      const bankMarker='<section class="card v1014BankSection';const travelMarker='<section class="card"><h3>Travel</h3>';
      if(h.includes(bankMarker))h=h.replace(bankMarker,section+bankMarker);else if(h.includes(travelMarker))h=h.replace(travelMarker,section+travelMarker);else h+=section;
      return h;
    };

    const modalBase=RF.UI.modalHtml.bind(RF.UI);
    RF.UI.modalHtml=function(s){if(this.modal?.type==='v1054Market')return V.modalHtml(s);return modalBase(s)};

    const bindBase=RF.UI.bind.bind(RF.UI);
    RF.UI.bind=function(s){
      bindBase(s);
      document.querySelectorAll('[data-open-market]').forEach(b=>b.onclick=()=>RF.openMarket());
      document.querySelectorAll('[data-v1054-close]').forEach(b=>b.onclick=()=>V.closeMarket());
      document.querySelectorAll('[data-v1054-view]').forEach(b=>b.onclick=()=>{s.v1054.view=b.dataset.v1054View==='sell'?'sell':'buy';if(RF.UI.modal?.type==='v1054Market'){delete RF.UI.modal.detail;RF.UI.modal.notice=''}RF.save?.(s);RF.UI.render(s)});
      document.querySelectorAll('[data-v1054-item]').forEach(b=>b.onclick=()=>V.openDetail(b.dataset.v1054Mode,b.dataset.v1054Item));
      document.querySelectorAll('[data-v1054-detail-close]').forEach(b=>b.onclick=()=>V.closeDetail());
      document.querySelectorAll('[data-v1054-trade-one]').forEach(b=>b.onclick=()=>V.trade(b.dataset.v1054TradeOne,b.dataset.id,1));
      document.querySelectorAll('[data-v1054-trade-x]').forEach(b=>b.onclick=()=>V.trade(b.dataset.v1054TradeX,b.dataset.id,document.querySelector('[data-v1054-qty]')?.value));
    };

    const st=document.createElement('style');st.id='v1054-local-markets-style';st.textContent=`
    .v1054MarketSection{padding-bottom:14px}.v1054MarketButton{margin:0!important;width:100%!important}.v1054MarketButton .emoji{font-size:30px}
    .v1054MarketModal{position:relative;width:min(760px,100%);height:min(91dvh,900px);max-height:91dvh;display:grid;grid-template-rows:auto auto auto auto minmax(0,1fr);gap:10px;overflow:hidden;padding:16px 12px 12px}
    .v1054MarketHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.v1054MarketHead h2{margin:2px 0 0;color:#f1d496;font-size:25px}.v1054MarketHead .sub{margin-top:4px;color:#b7a78a}.v1054MarketClose{width:42px;height:42px;border-radius:13px;border:1px solid rgba(214,173,96,.28);background:linear-gradient(180deg,rgba(52,38,22,.85),rgba(25,19,13,.95));color:#edd6a0;font-size:20px;display:grid;place-items:center;flex:0 0 auto}
    .v1054MarketTicker{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none}.v1054MarketTicker::-webkit-scrollbar{display:none}.v1054MarketTicker span{flex:0 0 auto;border:1px solid rgba(198,158,83,.22);border-radius:999px;background:#17110d;padding:6px 9px;color:#cfbf9f;font-size:10px}
    .v1054TradeTabs{display:grid;grid-template-columns:1fr 1fr;gap:9px}.v1054TradeTabs button{appearance:none;border:1px solid rgba(201,159,84,.24);border-radius:15px;background:linear-gradient(180deg,rgba(46,34,21,.76),rgba(20,15,10,.95));padding:11px 13px;display:flex;align-items:center;justify-content:space-between;gap:8px;color:#e5d1a3}.v1054TradeTabs button span{font-weight:850}.v1054TradeTabs button b{font-size:10px;color:#ad9c80}.v1054TradeTabs button.active{border-color:#c69d59;background:linear-gradient(180deg,rgba(96,67,29,.95),rgba(40,28,17,.98));box-shadow:0 0 0 1px rgba(198,157,89,.16) inset}
    .v1054MarketModal .v1046CatGrid{margin:0}
    .v1054MarketGridWrap{min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border:1px solid rgba(198,158,83,.18);border-radius:18px;background:linear-gradient(180deg,rgba(13,10,8,.28),rgba(9,7,6,.42));padding:8px}.v1054MarketGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-content:start}.v1054MarketTile{appearance:none;min-width:0;min-height:112px;padding:9px 7px 8px;border-radius:15px;border:1px solid rgba(201,159,84,.18);background:linear-gradient(180deg,rgba(43,32,21,.92),rgba(18,13,10,.98));color:#f3e1bb;text-align:left;display:flex;flex-direction:column;gap:5px;box-shadow:inset 0 1px rgba(255,255,255,.035)}.v1054MarketTile:active{transform:scale(.98);border-color:#a97c3e}.v1054MarketTile.soldout{opacity:.43;filter:saturate(.55)}
    .v1054ItemIcon{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;font-size:24px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.01));border:1px solid rgba(223,183,104,.14)}.v1054ItemName{font-size:10.5px;font-weight:850;line-height:1.14;min-height:24px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.v1054ItemQuality{font-size:7.5px;text-transform:uppercase;letter-spacing:.07em;color:#9f8f75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v1054ItemFoot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:5px;font-size:10.5px;font-weight:800;color:#efd59d}.v1054ItemFoot b{font-size:10px;color:#d7b870}.v1054MarketEmpty{grid-column:1/-1;padding:30px 12px;text-align:center;color:#ad9e87;font-size:12px}
    .v1054DetailBack{position:absolute;inset:0;z-index:35;background:#080604d8;backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:14px}.v1054DetailModal{width:min(440px,100%);max-height:88%;overflow:auto;border:1px solid #775c38;border-radius:19px;background:linear-gradient(180deg,#21190f,#15110d);box-shadow:0 22px 60px #000b;padding:16px}.v1054DetailHero{display:flex;align-items:center;gap:12px}.v1054DetailIcon{width:58px;height:58px;display:grid;place-items:center;border-radius:16px;font-size:34px;background:#2a2117;border:1px solid #6b5438}.v1054DetailHero h2{margin:2px 0 0;color:#f0d99f;font-size:24px}.v1054DetailDesc{margin:10px 0 12px;color:#c4b79f;line-height:1.42;font-size:12px}.v1054DetailStats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.v1054DetailStats span{border:1px solid #4a3928;border-radius:999px;padding:5px 7px;background:#18120e;color:#d8c8a8;font-size:9px}.v1054Requirement{border:1px solid #57452e;border-radius:11px;padding:9px 10px;margin-bottom:10px;color:#d2c09c;font-size:10px;line-height:1.35}.v1054Requirement b{color:#eed39a}.v1054Requirement small{display:block;color:#9f917b;margin-top:3px}.v1054TradeSummary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.v1054TradeSummary span{border:1px solid #443526;border-radius:10px;background:#120e0b;padding:7px 6px;text-align:center;color:#9f917b;font-size:8px}.v1054TradeSummary b{display:block;color:#edd6a0;font-size:11px;margin-top:2px}.v1054TradeNotice{margin-top:9px;border:1px solid #5f4b2f;background:#1d170f;border-radius:10px;padding:8px 9px;color:#d9c39a;font-size:10px}.v1054QtyLabel{display:grid;gap:5px;margin-top:10px;color:#c2b59d;font-size:10px}.v1054QtyLabel input{height:42px;border-radius:11px;border:1px solid #59442b;background:#0e0b09;color:#f1dfb7;padding:0 11px;font:inherit}.v1054DetailActions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:10px}.v1054DetailActions button{min-height:44px;border-radius:11px;border:1px solid rgba(216,173,87,.42);background:linear-gradient(180deg,rgba(100,71,31,.92),rgba(61,42,21,.95));color:#f6e7c1;font-weight:800;font-size:10px}.v1054DetailActions button.close{background:linear-gradient(180deg,rgba(83,57,40,.94),rgba(48,34,25,.98))}.v1054DetailActions button:disabled{opacity:.34}
    @media(max-width:430px){.v1054MarketModal{height:92dvh;max-height:92dvh;padding:12px 8px 9px;gap:8px}.v1054MarketHead h2{font-size:22px}.v1054MarketGrid{gap:7px}.v1054MarketTile{min-height:105px;padding:8px 6px 7px;border-radius:14px}.v1054ItemIcon{width:34px;height:34px;font-size:22px}.v1054ItemName{font-size:10px;min-height:22px}.v1054ItemQuality{font-size:7px}.v1054ItemFoot{font-size:10px}.v1054DetailModal{padding:14px}.v1054DetailActions{gap:6px}.v1054DetailActions button{font-size:9.5px}}
    `;
    document.head.appendChild(st);

    if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
    return RF.V1054;
  }
  const api={
    installHistoricalV1054,
    get installed(){return installed;},
    namespace:()=>RF.V1054||null,
    open:(...args)=>RF.V1054?.open?RF.V1054.open(...args):RF.openMarket?.(...args),
    trade:(...args)=>RF.V1054?.trade?.(...args),
    marketDefinition:id=>RF.Config?.get('commerce.markets')?.[id]||null,
    marketDefinitions:()=>RF.Config?.clone('commerce.markets')||{},
    buyPrice:(...args)=>RF.V1054?.buyPrice?.(...args),
    sellPrice:(...args)=>RF.V1054?.sellPrice?.(...args),
    ensureStock:(...args)=>RF.V1054?.ensureStock?.(...args),
    bankDefinition:id=>RF.Config?.get('services.banks')?.[id]||null,
    bankOpen:(...args)=>RF.openBank?.(...args),
    bankDeposit:(...args)=>RF.bankDeposit?.(...args),
    bankWithdraw:(...args)=>RF.bankWithdraw?.(...args)
  };
  RF.Systems.Commerce=RF.Modules.register('systems.commerce',api,{owner:'systems',status:'canonical',implementation:'v10.54-equivalent',configOwner:'data.config'});
})();

/* ===== js/systems/dungeons.js ===== */
/* Realmforge V11.11.0 — Canonical Dungeon implementation.
   Mature V11.0 gauntlet behaviour moved out of the compatibility runtime.
   Installed at the original V11.0 execution point; V11.3/V11.4 historical enrichments continue to target RF.V1062. */
(() => {
  'use strict';
  const RF=window.RF;
  let installed=false;
  function installHistoricalV1062() {
    if(installed) return RF.V1062;
    installed=true;
    RF.V1062=RF.V1062||{};
    const V=RF.V1062;
    V.version='11.0.0';
    V.WAVES=8;
    V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    // New dungeon bosses and reward gear. Equipment requirements remain derived from the same
    // global item-requirement rules as every other piece of gear, so old/new characters stay aligned.
    Object.assign(RF.DATA.items,{
      regent_falchion:{name:'Regent Falchion',icon:'🗡️',type:'weapon',slot:'main',value:445,damage:14,armor:3,rarity:'Epic',desc:'A pale hooked blade taken from the ruler of the lower crypt. +14 damage • +3 armour.'},
      bonewall_buckler:{name:'Bonewall Buckler',icon:'🛡️',type:'armor',slot:'off',value:390,damage:2,armor:8,rarity:'Rare',desc:'Layered grave-iron and ossified plate. +2 damage • +8 armour.'},
      ossuary_coif:{name:'Ossuary Coif',icon:'💀',type:'armor',slot:'head',value:335,damage:2,armor:7,rarity:'Rare',desc:'A funerary helm reinforced with blackened chain. +2 damage • +7 armour.'},
      tombwarden_greaves:{name:'Tombwarden Greaves',icon:'👖',type:'armor',slot:'legs',value:360,damage:2,armor:8,rarity:'Rare',desc:'Heavy greaves engraved with the split-crown seal. +2 damage • +8 armour.'},

      cindermaw_blade:{name:'Cindermaw Blade',icon:'🔥',type:'weapon',slot:'main',value:690,damage:19,armor:4,rarity:'Epic',desc:'A volcanic greatblade whose edge glows after a hard strike. +19 damage • +4 armour.'},
      emberplate_cuirass:{name:'Emberplate Cuirass',icon:'🛡️',type:'armor',slot:'chest',value:735,damage:3,armor:13,rarity:'Epic',desc:'Interlocking forge-plate cooled in mineral steam. +3 damage • +13 armour.'},
      magma_guard:{name:'Magma Guard',icon:'🔰',type:'armor',slot:'off',value:575,damage:4,armor:10,rarity:'Rare',desc:'A heat-scarred shield built from dense Emberdeep slag-steel. +4 damage • +10 armour.'},
      cinderstep_boots:{name:'Cinderstep Boots',icon:'🥾',type:'armor',slot:'boots',value:520,damage:3,armor:9,rarity:'Rare',desc:'Forge boots insulated for cracked lava shelves. +3 damage • +9 armour.'}
    });

    Object.assign(RF.DATA.enemies,{
      ossuary_regent:{name:'Ossuary Regent',icon:'☠️',level:12,hp:305,damage:[14,25],armor:9,xp:860,gold:[115,175],temperament:'boss',moves:['stone_guard','royal_gaze','rend','drowned_grip'],drops:[['crypt_sigil',1,1],['steel_bar',.45,1]],desc:'An ancient grave-lord clad in layered remains and crown-marked iron.'},
      cindermaw_tyrant:{name:'Cindermaw Tyrant',icon:'🐲',level:17,hp:380,damage:[17,30],armor:11,xp:1260,gold:[150,235],temperament:'boss',moves:['ember_breath','flame_pounce','tail_sweep','war_cry'],drops:[['ember_shard',1,2],['steel_bar',.5,1]],desc:'A furnace-scaled predator that has claimed the deepest stable chambers of Emberdeep.'}
    });

    V.DUNGEONS=RF.Config.clone("dungeons.base");

    // The V3 locations are the game's two explicit delve/dungeon locations. The old Delve action
    // is retired from their action rows so the new dedicated Dungeon card owns this interaction.
    Object.keys(V.DUNGEONS).forEach(id=>{
      const l=RF.DATA.locations?.[id];if(!l)return;
      l.dungeon=true;
      if(Array.isArray(l.actions))l.actions=l.actions.filter(a=>a!=='delve');
    });
    if(RF.V94?.bossHomes){RF.V94.bossHomes.ossuary_regent=['crypt'];RF.V94.bossHomes.cindermaw_tyrant=['ember_cave']}

    V.def=loc=>V.DUNGEONS[loc]||null;
    V.record=function(s,loc){s.v1062=s.v1062||{};s.v1062.records=s.v1062.records||{};return s.v1062.records[loc]||(s.v1062.records[loc]={attempts:0,clears:0,bestHp:null})};
    V.active=s=>s?.v1062?.active||null;
    V.isDungeonCombat=s=>!!(s?.combat?.v1062Dungeon&&V.active(s));
    V.clock=function(s){
      if(RF.V1026?.captureClock)return RF.V1026.captureClock(s);
      return {speed:+s?.speed||0,paused:!!s?.paused||(+s?.speed||0)===0,boostRemaining:0};
    };
    V.pause=function(s){if(!s)return;s.speed=0;s.paused=true;if(s.v8)s.v8.boostUntil=0};
    V.restoreClock=function(s,clock){
      if(!s||!clock||RF.isOverEncumbered?.(s))return V.pause(s);
      if(RF.V1026?.restoreClock)return RF.V1026.restoreClock(s,clock);
      s.speed=clock.paused?0:(clock.speed||1);s.paused=s.speed===0;
    };
    V.random=function(seed){
      if(RF.seedHash&&RF.seedRand)return RF.seedRand(RF.seedHash(seed));
      let x=0;for(let i=0;i<seed.length;i++)x=(Math.imul(x,31)+seed.charCodeAt(i))>>>0;
      return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296};
    };
    V.sequence=function(s,loc,attempt){
      const d=V.def(loc),bag=[];d.pool.forEach(([id,w])=>{if(RF.DATA.enemies[id])for(let i=0;i<w;i++)bag.push(id)});
      const rnd=V.random(`${s?.seed||'rf'}|dungeon|${loc}|${s?.day||1}|${attempt}|${Date.now()}`),out=[];
      for(let i=0;i<V.WAVES;i++){
        let pick=bag[Math.floor(rnd()*bag.length)]||d.pool[0][0];
        // Avoid three identical rooms in a row while keeping the sequence genuinely random.
        if(i>1&&out[i-1]===pick&&out[i-2]===pick){const alt=bag.filter(x=>x!==pick);if(alt.length)pick=alt[Math.floor(rnd()*alt.length)]}
        out.push(pick);
      }
      return out;
    };
    V.snapshot=function(s){
      return {gold:+s.gold||0,playerXp:+s.player?.xp||0,inventory:{...(s.inventory||{})},skills:Object.fromEntries(Object.entries(s.skills||{}).map(([id,x])=>[id,+x.xp||0])),hp:+s.player?.hp||0};
    };
    V.itemDiff=function(s,start){
      const out=[];Object.entries(s.inventory||{}).forEach(([id,q])=>{const n=(+q||0)-(+start.inventory?.[id]||0);if(n>0&&RF.DATA.items?.[id])out.push([id,n])});return out;
    };
    V.skillDiff=function(s,start){return Object.entries(s.skills||{}).map(([id,x])=>[id,(+x.xp||0)-(+start.skills?.[id]||0)]).filter(([,n])=>n>0)};
    V.siphonQueue=function(a){
      if(!a||!RF.V10?.queue?.length)return;
      a.pendingQueue=a.pendingQueue||[];a.pendingQueue.push(...RF.V10.queue.splice(0));
    };
    V.releaseQueue=function(a){if(a?.pendingQueue?.length&&RF.V10?.queue)RF.V10.queue.push(...a.pendingQueue)};
    V.identifyBoss=function(s,id){s.v7=s.v7||{};s.v7.research=s.v7.research||{};s.v7.research[id]={level:3,notes:0};};
    V.runLabel=function(a){if(!a)return'';return a.phase==='boss'||a.phase==='bossIntro'?'Boss':`Wave ${Math.max(1,Math.min(V.WAVES,+a.wave||1))}/${V.WAVES}`};

    V.open=function(){
      const s=RF.state,d=V.def(s?.location);if(!s||!d)return;
      if(s.combat||s.activity)return;
      if(RF.isOverEncumbered?.(s))return RF.V1056?.warn?.(s,'Pack must be sorted before entering a dungeon');
      const a=V.active(s);
      RF.UI.modal={type:'v1062DungeonLobby',loc:s.location,resume:!!a&&a.loc===s.location};RF.UI.render(s);
    };
    V.start=function(loc){
      const s=RF.state,d=V.def(loc);if(!s||!d||s.location!==loc||s.combat||s.activity)return;
      if(RF.isOverEncumbered?.(s))return RF.V1056?.warn?.(s,'Pack must be sorted before entering a dungeon');
      const rec=V.record(s,loc);rec.attempts++;
      const clock=V.clock(s);
      const a={loc,wave:1,phase:'wave',sequence:V.sequence(s,loc,rec.attempts),startedDay:s.day,startedMinute:s.minute,clock,snapshot:V.snapshot(s),metrics:{turns:0,damageTaken:0,parries:0,perfectParries:0},pendingQueue:[],gearAwarded:[]};
      s.v1062.active=a;V.siphonQueue(a);V.pause(s);RF.UI.modal=null;RF.save?.(s);V.startWave(s);
    };
    V.startWave=function(s=RF.state){
      const a=V.active(s),d=a&&V.def(a.loc);if(!a||!d||s.combat)return;
      const idx=Math.max(0,Math.min(V.WAVES-1,(+a.wave||1)-1)),id=a.sequence[idx];
      a.phase='wave';V.pause(s);RF.UI.modal=null;RF.startBattle(id,{forced:true,dungeon:true});
      if(s.combat){s.combat.v1062Dungeon={loc:a.loc,wave:a.wave,boss:false};RF.save?.(s);RF.UI.render?.(s)}
    };
    V.showBoss=function(s=RF.state){
      const a=V.active(s),d=a&&V.def(a.loc);if(!a||!d)return;
      a.phase='bossIntro';V.identifyBoss(s,d.boss);V.pause(s);RF.UI.modal={type:'v1062BossIntro',loc:a.loc};RF.save?.(s);RF.UI.render(s);
    };
    V.startBoss=function(s=RF.state){
      const a=V.active(s),d=a&&V.def(a.loc);if(!a||!d||s.combat)return;
      a.phase='boss';V.pause(s);RF.UI.modal=null;RF.startBattle(d.boss,{forced:true,dungeon:true,boss:true});
      if(s.combat){s.combat.v1062Dungeon={loc:a.loc,wave:V.WAVES+1,boss:true};RF.save?.(s);RF.UI.render?.(s)}
    };
    V.addCompletionRewards=function(s,a){
      const d=V.def(a.loc),rec=V.record(s,a.loc),first=rec.clears===0,count=first?2:1;
      s.gold=(+s.gold||0)+d.bonusGold;s.stats=s.stats||{};s.stats.goldEarned=(s.stats.goldEarned||0)+d.bonusGold;
      RF.addPlayerXp?.(s,d.bonusXp);
      d.materials.forEach(([id,q])=>RF.addItem?.(s,id,q));
      const pool=[...d.rewards],rnd=V.random(`${s?.seed||'rf'}|reward|${a.loc}|${rec.clears}|${Date.now()}`);
      for(let i=0;i<count&&pool.length;i++){
        const n=Math.floor(rnd()*pool.length),id=pool.splice(n,1)[0];RF.addItem?.(s,id,1);a.gearAwarded.push(id);
      }
      rec.clears++;rec.bestHp=rec.bestHp==null?Math.ceil(s.player.hp):Math.max(rec.bestHp,Math.ceil(s.player.hp));
      s.stats.dungeonsCleared=(s.stats.dungeonsCleared||0)+1;s.flags=s.flags||{};s.flags[d.flag]=true;
      // Keep the legacy dungeon status objects meaningful for older UI/quests without changing loadouts.
      s.dungeons=s.dungeons||{};
      if(a.loc==='crypt'){s.dungeons.crypt=s.dungeons.crypt||{};s.dungeons.crypt.cleared=true}
      if(a.loc==='ember_cave'){s.dungeons.ember=s.dungeons.ember||{};s.dungeons.ember.cleared=true}
      V.siphonQueue(a);
    };
    V.finishBoss=function(s,a){
      V.addCompletionRewards(s,a);
      const start=a.snapshot,summary={
        loc:a.loc,gold:(+s.gold||0)-(+start.gold||0),playerXp:(+s.player?.xp||0)-(+start.playerXp||0),skills:V.skillDiff(s,start),loot:V.itemDiff(s,start),
        turns:a.metrics.turns||0,damageTaken:a.metrics.damageTaken||0,parries:a.metrics.parries||0,perfectParries:a.metrics.perfectParries||0,hpLeft:Math.ceil(s.player.hp),gear:[...(a.gearAwarded||[])]
      };
      a.summary=summary;a.phase='cleared';V.pause(s);RF.UI.modal={type:'v1062DungeonCleared',loc:a.loc};RF.save?.(s);RF.UI.render(s);
    };
    V.completeAndExit=function(){
      const s=RF.state,a=V.active(s);if(!s||!a)return;
      const clock=a.clock;V.releaseQueue(a);s.v1062.active=null;RF.UI.modal=null;V.restoreClock(s,clock);RF.save?.(s);RF.UI.render(s);
    };
    V.abandon=function(reason='The dungeon run ends here.'){
      const s=RF.state,a=V.active(s);if(!s||!a)return;
      const d=V.def(a.loc),clock=a.clock,progress=Math.max(0,(+a.wave||1)-1);V.releaseQueue(a);s.v1062.active=null;V.pause(s);s.v1062.resumeClock=clock;
      RF.UI.modal={type:'v1062DungeonAbandoned',name:d?.name||'Dungeon',progress,reason};RF.save?.(s);RF.UI.render(s);
    };
    V.closeAbandoned=function(){const s=RF.state,clock=s?.v1062?.resumeClock;if(s?.v1062)delete s.v1062.resumeClock;RF.UI.modal=null;V.restoreClock(s,clock);RF.save?.(s);RF.UI.render(s)};

    // Preserve all existing save/loadout state. V11.0 only adds dungeon records/active-run data.
    V.migrate=function(s){
      if(!s)return s;
      s.v1062=s.v1062||{};s.v1062.records=s.v1062.records||{};
      Object.keys(V.DUNGEONS).forEach(loc=>V.record(s,loc));
      s.version='11.0.0';
      return s;
    };
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */

    // Legacy callers hitting the old Delve action are routed into the new dungeon lobby.
    const actionBase=RF.action;
    RF.action=function(a){if(a==='delve'&&V.def(RF.state?.location))return V.open();return actionBase.apply(this,arguments)};

    // Dedicated World card, matching Bank/Market as a physical location interaction.
    const worldBase=RF.UI.world.bind(RF.UI);
    RF.UI.world=function(s){
      let h=worldBase(s),d=V.def(s?.location);if(!d)return h;
      h=h.replace(/<section class="card v1062DungeonSection">[\s\S]*?<\/section>/g,'');
      const rec=V.record(s,s.location),a=V.active(s),active=a?.loc===s.location;
      const status=active?`${V.runLabel(a)} in progress`:rec.clears?`${rec.clears} clear${rec.clears===1?'':'s'}`:'Uncleared';
      const disabled=(s.activity||s.combat)?'disabled':'';
      const section=`<section class="card v1062DungeonSection"><div class="questTitle"><h3>Dungeon</h3><span class="tag">LV ${d.level}</span></div><button class="action v1062DungeonButton" data-open-dungeon ${disabled}><span class="emoji">${d.icon}</span><b>${V.escape(d.name)}</b><small>${status} • 8 waves + boss</small></button></section>`;
      const market='<section class="card v1054MarketSection';const bank='<section class="card v1014BankSection';const travel='<section class="card"><h3>Travel</h3>';
      if(h.includes(market))h=h.replace(market,section+market);else if(h.includes(bank))h=h.replace(bank,section+bank);else if(h.includes(travel))h=h.replace(travel,section+travel);else h+=section;
      return h;
    };

    // Live wave readout inside the fixed V10.60 combat frame.
    const combatBase=RF.UI.combatPopup.bind(RF.UI);
    RF.UI.combatPopup=function(s){
      let h=combatBase(s),a=V.active(s);if(!h||!a||!s?.combat?.v1062Dungeon)return h;
      const d=V.def(a.loc),label=s.combat.v1062Dungeon.boss?'BOSS':`WAVE ${a.wave}/${V.WAVES}`;
      const strip=`<div class="v1062BattleProgress"><span>${d.icon} ${V.escape(d.name)}</span><b>${label}</b></div>`;
      return h.replace('<div class="v1035Faceoff">',strip+'<div class="v1035Faceoff">');
    };

    // Convert each ordinary battle victory into a dungeon interstitial instead of showing nine
    // separate battle summaries. The complete reward/XP picture is shown once after the boss.
    const winBase=RF.winCombat;
    RF.winCombat=function(){
      const s0=RF.state,c0=s0?.combat,a0=V.active(s0),dungeon=!!(a0&&c0?.v1062Dungeon&&a0.loc===c0.v1062Dungeon.loc),boss=!!c0?.v1062Dungeon?.boss;
      if(!dungeon)return winBase.apply(this,arguments);
      const out=winBase.apply(this,arguments),s=RF.state,a=V.active(s);if(!s||!a)return out;
      const bs=RF.UI.modal?.type==='v10BattleSummary'?RF.UI.modal:null;
      if(bs){a.metrics.turns+=(+bs.turns||0);a.metrics.damageTaken+=(+bs.damageTaken||0);a.metrics.parries+=(+bs.parries||0);a.metrics.perfectParries+=(+bs.perfectParries||0)}
      V.siphonQueue(a);V.pause(s);
      if(boss){V.finishBoss(s,a);return out}
      a.lastCompleted=a.wave;a.phase='between';RF.UI.modal={type:'v1062WaveComplete',loc:a.loc,wave:a.wave};RF.save?.(s);RF.UI.render(s);return out;
    };

    // Fleeing successfully abandons the run. A failed flee simply remains in the current room.
    const fleeBase=RF.fleeV4;
    if(fleeBase)RF.fleeV4=function(){
      const before=V.isDungeonCombat(RF.state),out=fleeBase.apply(this,arguments);
      if(before&&!RF.state?.combat&&V.active(RF.state))V.abandon('You escape the current chamber, but the dungeon run is broken.');
      return out;
    };
    const loseBase=RF.loseV4Battle;
    if(loseBase)RF.loseV4Battle=function(){
      const s0=RF.state,a0=V.active(s0),was=!!(a0&&s0?.combat?.v1062Dungeon),pending=a0?.pendingQueue?[...a0.pendingQueue]:[];
      const out=loseBase.apply(this,arguments),s=RF.state;
      if(was&&s?.v1062){if(pending.length&&RF.V10?.queue)RF.V10.queue.push(...pending);const clock=a0?.clock;s.v1062.active=null;V.restoreClock(s,clock);RF.save?.(s)}
      return out;
    };

    const modalBase=RF.UI.modalHtml.bind(RF.UI);
    RF.UI.modalHtml=function(s){
      const m=this.modal,d=m?.loc&&V.def(m.loc),a=V.active(s);
      if(m?.type==='v1062DungeonLobby'&&d){const rec=V.record(s,m.loc),resume=m.resume&&a?.loc===m.loc;return `<div class="modalBack"><div class="modal v1062DungeonModal"><div class="v1062DungeonHero"><span>${d.icon}</span><div><span class="eyebrow">DUNGEON • LEVEL ${d.level}</span><h2>${V.escape(d.name)}</h2></div></div><p>${V.escape(d.desc)}</p><div class="v1062DungeonStats"><div><small>Structure</small><b>8 waves + boss</b></div><div><small>Clears</small><b>${rec.clears}</b></div><div><small>Best finish</small><b>${rec.bestHp==null?'—':`${rec.bestHp} HP`}</b></div></div>${resume?`<div class="notice good">Current run: ${V.runLabel(a)}.</div>`:''}<div class="choices">${resume?`<button class="choice" data-v1062-resume><b>Resume Run</b><small>Continue from the saved dungeon state.</small></button>`:`<button class="choice dangerChoice" data-v1062-start="${m.loc}"><b>Enter Dungeon</b><small>Health and supplies persist across every fight.</small></button>`}<button class="choice" data-v1062-close><b>Close</b></button></div></div></div>`}
      if(m?.type==='v1062WaveComplete'&&d)return `<div class="modalBack"><div class="modal resultModal v1062Interlude"><div class="resultIcon">⚔️</div><span class="eyebrow">${V.escape(d.name.toUpperCase())}</span><h2>Wave ${m.wave} Complete</h2><div class="itemDesc">The chamber falls quiet. ${m.wave<V.WAVES?'There is no way out but deeper.':'Something much larger waits beyond the final door.'}</div><div class="v1062WavePips">${Array.from({length:V.WAVES},(_,i)=>`<i class="${i<m.wave?'done':''}"></i>`).join('')}<b>👑</b></div><button class="startBtn" data-v1062-next>${m.wave<V.WAVES?`Continue to Wave ${m.wave+1}`:'Approach the Boss'}</button></div></div>`;
      if(m?.type==='v1062BossIntro'&&d){const e=RF.DATA.enemies[d.boss];return `<div class="modalBack"><div class="modal resultModal v1062BossIntro"><div class="resultIcon">${e.icon}</div><span class="eyebrow">FINAL ENCOUNTER</span><h2>Boss — ${V.escape(e.name)}</h2><div class="itemDesc">The final chamber opens. The dungeon's ruler steps forward.</div><div class="v1062BossFacts"><span>Lv ${e.level}</span><span>⚔️ ${RF.V1049?.attackRating?.(e)||Math.round((e.damage[0]+e.damage[1])/2)} attack</span><span>🛡️ ${e.armor} armour</span></div><button class="startBtn" data-v1062-boss>Face the Boss</button></div></div>`}
      if(m?.type==='v1062DungeonCleared'&&d)return `<div class="modalBack"><div class="modal resultModal v1062Cleared"><div class="resultIcon">🏆</div><span class="eyebrow">DUNGEON CLEARED</span><h2>${d.icon} ${V.escape(d.name)}</h2><div class="itemDesc">Nine fights end with the dungeon ruler defeated. The surviving hoard is yours.</div><button class="startBtn" data-v1062-summary>View Dungeon Summary</button></div></div>`;
      if(m?.type==='v1062DungeonSummary'&&d&&m.summary){const x=m.summary;return `<div class="modalBack"><div class="modal battleSummary v1062Summary"><div class="resultIcon">📜</div><span class="eyebrow">DUNGEON SUMMARY • LEVEL ${d.level}</span><h2>${d.icon} ${V.escape(d.name)}</h2><div class="statsGrid"><div class="statbox"><span>Encounters</span><b>8 + Boss</b></div><div class="statbox"><span>Turns</span><b>${x.turns}</b></div><div class="statbox"><span>HP remaining</span><b>${x.hpLeft}</b></div><div class="statbox"><span>Damage taken</span><b>${Math.round(x.damageTaken)}</b></div></div><h3>Total Rewards</h3><div class="resultGains">${x.gold>0?`<div><span>🪙</span><b>+${x.gold} gold</b></div>`:''}${x.playerXp>0?`<div><span>🌟</span><b>+${x.playerXp} Character XP</b></div>`:''}${x.skills.map(([id,n])=>`<div><span>${RF.DATA.skills?.[id]?.icon||'✨'}</span><b>+${Math.round(n)} ${V.escape(RF.DATA.skills?.[id]?.name||id)} XP</b></div>`).join('')}${x.loot.map(([id,n])=>`<div><span>${RF.DATA.items[id]?.icon||'🎁'}</span><b>${V.escape(RF.DATA.items[id]?.name||id)} ×${n}</b></div>`).join('')||'<div><span>▫️</span><b>No item rewards</b></div>'}</div>${x.gear?.length?`<div class="v1062GearBanner">Guaranteed dungeon gear: ${x.gear.map(id=>`${RF.DATA.items[id]?.icon||'🎁'} ${V.escape(RF.DATA.items[id]?.name||id)}`).join(' • ')}</div>`:''}${RF.isOverEncumbered?.(s)?`<div class="notice bad">⚠️ Rewards pushed your Pack over capacity. Sort the Pack before time or travel can resume.</div>`:''}<button class="startBtn" data-v1062-finish>Finish</button></div></div>`}
      if(m?.type==='v1062DungeonAbandoned')return `<div class="modalBack"><div class="modal resultModal"><div class="resultIcon">🚪</div><span class="eyebrow">DUNGEON RUN ENDED</span><h2>${V.escape(m.name)}</h2><div class="itemDesc">${V.escape(m.reason)} You cleared ${m.progress}/${V.WAVES} normal waves before leaving.</div><button class="startBtn" data-v1062-abandon-close>Return to World</button></div></div>`;
      return modalBase(s);
    };

    const bindBase=RF.UI.bind.bind(RF.UI);
    RF.UI.bind=function(s){
      bindBase(s);
      document.querySelectorAll('[data-open-dungeon]').forEach(b=>b.onclick=()=>V.open());
      document.querySelectorAll('[data-v1062-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(s)});
      document.querySelectorAll('[data-v1062-start]').forEach(b=>b.onclick=()=>V.start(b.dataset.v1062Start));
      document.querySelectorAll('[data-v1062-next]').forEach(b=>b.onclick=()=>{const a=V.active(s);if(!a)return;if(a.lastCompleted>=V.WAVES)V.showBoss(s);else{a.wave=a.lastCompleted+1;V.startWave(s)}});
      document.querySelectorAll('[data-v1062-boss]').forEach(b=>b.onclick=()=>V.startBoss(s));
      document.querySelectorAll('[data-v1062-summary]').forEach(b=>b.onclick=()=>{const a=V.active(s);if(!a?.summary)return;RF.UI.modal={type:'v1062DungeonSummary',loc:a.loc,summary:a.summary};RF.UI.render(s)});
      document.querySelectorAll('[data-v1062-finish]').forEach(b=>b.onclick=()=>V.completeAndExit());
      document.querySelectorAll('[data-v1062-abandon-close]').forEach(b=>b.onclick=()=>V.closeAbandoned());
      document.querySelectorAll('[data-v1062-resume]').forEach(b=>b.onclick=()=>{const a=V.active(s);if(!a)return;if(a.phase==='between'){RF.UI.modal={type:'v1062WaveComplete',loc:a.loc,wave:a.lastCompleted||a.wave};RF.UI.render(s)}else if(a.phase==='bossIntro')V.showBoss(s);else if(a.phase==='cleared'){RF.UI.modal={type:'v1062DungeonCleared',loc:a.loc};RF.UI.render(s)}else if(a.phase==='boss')V.startBoss(s);else V.startWave(s)});
    };

    const st=document.createElement('style');st.id='v1062-dungeon-gauntlets-style';st.textContent=`
    .v1062DungeonSection{padding-bottom:14px}.v1062DungeonButton{margin:0!important;width:100%!important}.v1062DungeonButton .emoji{font-size:30px}
    .v1062DungeonModal{width:min(470px,100%)}.v1062DungeonHero{display:flex;align-items:center;gap:13px}.v1062DungeonHero>span{width:62px;height:62px;border-radius:17px;display:grid;place-items:center;font-size:38px;background:#2a2016;border:1px solid #654d32}.v1062DungeonHero h2{margin:2px 0 0;color:#efd39a;font-size:26px}.v1062DungeonModal>p{color:#b8aa92;line-height:1.5;font-size:12px}.v1062DungeonStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0}.v1062DungeonStats>div{border:1px solid #443527;background:#15100d;border-radius:12px;padding:9px;text-align:center}.v1062DungeonStats small{display:block;color:#897d6c;font-size:8px}.v1062DungeonStats b{display:block;color:#e8d2a3;margin-top:3px;font-size:11px}
    .v1062WavePips{display:flex;align-items:center;justify-content:center;gap:5px;margin:14px 0}.v1062WavePips i{width:17px;height:6px;border-radius:999px;background:#32291f;border:1px solid #54412b}.v1062WavePips i.done{background:#c39147;border-color:#dfb568}.v1062WavePips b{font-size:17px;margin-left:3px}.v1062BossFacts{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:12px 0 16px}.v1062BossFacts span{border:1px solid #52402c;border-radius:999px;background:#17110d;padding:6px 9px;color:#d9c29a;font-size:9px}.v1062GearBanner{margin:10px 0;border:1px solid #72552f;border-radius:11px;background:#241a10;padding:9px 10px;color:#efd49e;font-size:10px;line-height:1.4}.v1062Summary .resultGains{max-height:31vh!important}
    .v1062BattleProgress{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:5px 0 8px;border:1px solid #654c2d;border-radius:10px;background:linear-gradient(90deg,#21170e,#17110d);padding:7px 9px;color:#c9b38c;font-size:8px;font-weight:800;letter-spacing:.04em}.v1062BattleProgress b{color:#f2d89e;font-size:9px;text-transform:uppercase}
    @media(max-width:390px){.v1062DungeonHero h2{font-size:23px}.v1062DungeonStats{gap:5px}.v1062DungeonStats>div{padding:7px 5px}.v1062WavePips{gap:4px}.v1062WavePips i{width:14px}}
    `;
    document.head.appendChild(st);

    if(RF.state){
      V.migrate(RF.state);RF.save?.(RF.state);
      setTimeout(()=>{
        const s=RF.state,a=V.active(s);
        // If the app was closed between rooms, make the saved run resumable instead of losing it.
        if(a&&!s.combat&&!RF.UI.modal&&a.loc===s.location)RF.UI.modal={type:'v1062DungeonLobby',loc:a.loc,resume:true};
        if(s&&!RF.V101?.mainMenu)RF.UI.render(s);
      },0);
    }
    return RF.V1062;
  }
  const api={
    installHistoricalV1062,
    get installed(){return installed;},
    namespace:()=>RF.V1062||null,
    open:(...args)=>RF.V1062?.open?.(...args),
    start:(...args)=>RF.V1062?.start?.(...args),
    definition:id=>RF.V1062?.DUNGEONS?.[id]||null,
    definitions:()=>RF.V1062?.DUNGEONS||{},
    baseConfig:()=>RF.Config?.clone('dungeons.base')||{},
    ecosystem:id=>RF.Config?.get('world.ecosystems')?.[id]||null,
    activeRun:state=>state?.v1062?.active||null,
    records:state=>state?.v1062?.records||{}
  };
  RF.Systems.Dungeons=RF.Modules.register('systems.dungeons',api,{owner:'systems',status:'canonical',implementation:'v11.0-equivalent',configOwner:'data.config'});
})();

/* ===== js/systems/travel.js ===== */
/* Realmforge V11.12.0 — Canonical Travel & World Routing.
   Owns mature routing, journey, overlay and clock-recovery behaviour formerly housed in
   the historical compatibility runtime. Historical installers run at their original boundaries. */
(() => {
  'use strict';
  const RF=window.RF;
  const installed=new Set();
  function once(key,fn){if(installed.has(key))return;installed.add(key);return fn();}
  function installHistoricalV9Routing(){return once('v9-routing',()=>{
    // ---------- World map / routing ----------
    RF.v9LocationUnlocked=function(s,id){let l=RF.DATA.locations[id];if(!l)return false;if(l.lockedFlag&&!s.flags[l.lockedFlag])return false;if(l.lockedSkill){let [sk,lv]=Object.entries(l.lockedSkill)[0];if((s.skills[sk]?.level||1)<lv)return false}return true};
    RF.v9Route=function(s,start,dest,allowLocked=false){if(start===dest)return {path:[start],minutes:0};let q=[[start,[start],0]],seen=new Set([start]);while(q.length){let [cur,path,min]=q.shift(),l=RF.DATA.locations[cur];for(let [n,cost] of Object.entries(l?.neighbors||{})){if(seen.has(n))continue;if(!allowLocked&&!RF.v9LocationUnlocked(s,n))continue;let np=[...path,n],nm=min+cost;if(n===dest)return {path:np,minutes:nm};seen.add(n);q.push([n,np,nm])}}return null};
    RF.v9LockText=function(s,id){let l=RF.DATA.locations[id];if(!l)return'';if(l.lockedFlag&&!s.flags[l.lockedFlag])return `Requires world progress: ${l.lockedFlag.replace(/_/g,' ')}`;if(l.lockedSkill){let [sk,lv]=Object.entries(l.lockedSkill)[0];if((s.skills[sk]?.level||1)<lv)return `Requires ${RF.DATA.skills[sk]?.name||sk} Lv ${lv}`}return''};
    RF.UI.worldMap=function(s){let groups={};Object.entries(RF.DATA.locations).forEach(([id,l])=>(groups[l.region||'Other']=groups[l.region||'Other']||[]).push([id,l]));let chosen=s.v9?.mapDest,route=chosen?RF.v9Route(s,s.location,chosen,false):null,lockedRoute=chosen&&!route?RF.v9Route(s,s.location,chosen,true):null;let routeCard='';if(chosen){let d=RF.DATA.locations[chosen],lock=RF.v9LockText(s,chosen);routeCard=`<section class="card routePlanner"><span class="eyebrow">ROUTE PLANNER</span><h2>${d.icon} ${d.name}</h2>${route?`<div class="routeChain">${route.path.map((id,i)=>`<span class="routeStop ${id===s.location?'here':''}">${RF.DATA.locations[id].icon} ${RF.DATA.locations[id].name}</span>${i<route.path.length-1?'<b>›</b>':''}`).join('')}</div><div class="sub">Estimated road time: ${route.minutes} game min${route.path.length>1?` • Next stop: <b>${RF.DATA.locations[route.path[1]].name}</b>`:''}</div>${route.path.length>1?`<button class="action primary" data-travel="${route.path[1]}" style="width:100%;margin-top:10px"><b>Travel next leg → ${RF.DATA.locations[route.path[1]].name}</b><small>${RF.DATA.locations[s.location].neighbors[route.path[1]]} min</small></button>`:'<div class="notice good">You are already here.</div>'}`:`<div class="notice">No currently usable route.${lock?` ${lock}.`:''}${lockedRoute?` Potential route: ${lockedRoute.path.map(id=>RF.DATA.locations[id].name).join(' → ')}.`:''}</div>`}</section>`}let cards=Object.entries(groups).map(([region,arr])=>`<section class="card"><div class="questTitle"><h3>${region}</h3><span class="tag">${arr.length} PLACES</span></div><div class="mapList">${arr.map(([id,l])=>{let unlocked=RF.v9LocationUnlocked(s,id),visited=!!s.visited[id],r=unlocked?RF.v9Route(s,s.location,id,false):null,req=RF.v9LockText(s,id);return `<button class="mapPlace ${id===s.location?'here':''} ${!unlocked?'locked':''}" data-map-dest="${id}"><span class="mapPlaceIcon">${l.icon}</span><span><b>${l.name}</b><small>${id===s.location?'YOU ARE HERE':!unlocked?`🔒 ${req||'Undiscovered route'}`:r?`${r.minutes} min • ${Math.max(0,r.path.length-1)} road leg${r.path.length-1===1?'':'s'}`:visited?'No known route from here':'Route not yet known'}</small></span><span class="chev">›</span></button>`}).join('')}</div></section>`).join('');return `<section class="card mapIntro"><h2>🗺️ World Map</h2><div class="sub">Choose any location to plan a route. Realmforge shows every road junction you must pass through rather than pretending distant locations are adjacent.</div></section>${routeCard}${cards}`};
    const v9NavBase=RF.UI.nav.bind(RF.UI);RF.UI.nav=function(){let n=[['world','🌍','WORLD'],['map','🗺️','MAP'],['character','🧍','CHAR'],['skills','📊','SKILLS'],['inventory','🎒','PACK'],['quests','📜','QUESTS'],['shop','🪙','SHOP']];return `<nav class="bottomnav"><div class="bottomInner v9nav">${n.map(x=>`<button class="navbtn ${this.tab===x[0]?'active':''}" data-tab="${x[0]}"><span>${x[1]}</span>${x[2]}</button>`).join('')}</div></nav>`};
    const v9PageBase=RF.UI.page.bind(RF.UI);RF.UI.page=function(s){if(this.tab==='map')return this.worldMap(s);return v9PageBase(s)};
  });}
  function installHistoricalV1016(){return once('js/v10_16.js',()=>{
    window.RF=window.RF||{};
    RF.VERSION='10.16.0';
    RF.V1016=RF.V1016||{lastTickError:'',lastTickErrorAt:0};

    /* Realmforge V10.16 — Travel Recovery
       - Harden the world tick so one subsystem error cannot kill the RAF loop.
       - Travel/activity progress advances independently of world-pulse/event errors.
       - Repair malformed/stalled saved travel state on campaign load.
       - Developer Teleport always cancels an active journey first.
       - Turn Back saves immediately and clears travel pause debris.
       - Invisible/unsupported stale modals can no longer freeze the world clock.
    */

    RF.V1016.resetUIPause=function(s){
      if(!s)return;
      if(RF.V96){
        RF.V96.modalPaused=false;RF.V96.modalResume=null;RF.V96.selectPaused=false;RF.V96.selectResume=null;RF.V96.modalWasOpen=false;
      }
      if(s.v83)s.v83.manualPause=false;
    };

    RF.V1016.modalMarkup=function(s){
      if(!RF.UI?.modal)return '';
      try{return String(RF.UI.modalHtml?.(s)||'').trim()}catch(e){return '__ERROR__'}
    };
    RF.V1016.clearGhostModal=function(s){
      const m=RF.UI?.modal;if(!m)return false;
      // Active minigame shells without an action object are stale and must be discarded.
      if((m.type==='v6Action'||m.type==='v7Action')&&!RF.actionGame){
        RF.UI.modal=null;RF.V1016.resetUIPause(s);return true;
      }
      const html=RF.V1016.modalMarkup(s);
      if(html===''){
        RF.UI.modal=null;RF.V1016.resetUIPause(s);return true;
      }
      return false;
    };

    RF.V1016.sanitiseTravel=function(s,{resume=true}={}){
      if(!s?.activity||s.activity.type!=='travel')return false;
      const a=s.activity;
      let dirty=false;
      const dur=Number(a.duration),prog=Number(a.progress);
      if(!Number.isFinite(dur)||dur<=0){a.duration=1;dirty=true}else if(a.duration!==dur){a.duration=dur;dirty=true}
      if(!Number.isFinite(prog)||prog<0){a.progress=0;dirty=true}else if(a.progress!==prog){a.progress=prog;dirty=true}
      if(a.progress>a.duration){a.progress=a.duration;dirty=true}
      if(!a.from||!RF.DATA.locations?.[a.from]){a.from=s.location;dirty=true}
      if(!a.target||!RF.DATA.locations?.[a.target]){
        RF.log?.(s,'A corrupted journey was cancelled safely.','bad');
        s.activity=null;dirty=true;
      }
      if(resume&&s.activity?.type==='travel'){
        // Campaign loading is an explicit resume action. Do not preserve an accidental UI pause.
        if(![1,2].includes(+s.speed)){s.speed=1;dirty=true}
        if(s.paused){s.paused=false;dirty=true}
        if(s.v83?.manualPause){s.v83.manualPause=false;dirty=true}
        RF.V1016.resetUIPause(s);
      }
      return dirty;
    };

    RF.V1016.repairCampaign=function(s){
      if(!s)return s;
      s.version='10.16.0';
      RF.V1016.clearGhostModal(s);
      if(RF.V1016.sanitiseTravel(s,{resume:true})){
        try{RF.save?.(s)}catch(_){}
      }
      return s;
    };

    // Ensure multi-slot loads and migrations repair an already-stuck journey immediately.
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */

    RF.V1016.reportTickError=function(err,where='world tick'){
      const msg=`${where}: ${err?.message||err||'unknown error'}`;
      const now=Date.now();
      if(msg!==RF.V1016.lastTickError||now-RF.V1016.lastTickErrorAt>10000){
        RF.V1016.lastTickError=msg;RF.V1016.lastTickErrorAt=now;
        console.warn('[Realmforge travel recovery]',msg,err);
        const s=RF.state;
        if(s){
          // Keep this to one compact log entry rather than spamming every animation frame.
          RF.log?.(s,'The world simulation stumbled, but Realmforge recovered without stopping your journey.','bad');
          try{RF.save?.(s)}catch(_){}
        }
      }
    };

    // Hardened master ticker. Crucially, requestAnimationFrame is scheduled in finally,
    // so an exception in world events/NPC pulses can never permanently kill time/travel.
    RF.tick=function(now){
      try{
        const s=RF.state;
        if(!s){RF.lastTick=now;return}
        let dt=(now-(RF.lastTick||now))/1000;
        if(!Number.isFinite(dt)||dt<0)dt=0;
        dt=Math.min(.25,dt);RF.lastTick=now;

        RF.V1016.clearGhostModal(s);
        const blocked=!!RF.UI.modal;
        if(s.speed>0&&!blocked){
          const gameSec=dt*s.speed;

          // Advance active timers FIRST. If a later simulation hook throws, the road still moves.
          if(s.activity){
            const a=s.activity;
            let p=Number(a.progress),d=Number(a.duration);
            if(!Number.isFinite(p)||p<0)p=0;
            if(!Number.isFinite(d)||d<=0)d=1;
            a.progress=Math.min(d,p+gameSec);a.duration=d;
          }

          // World clock, NPC pulses, road-event checks etc. are allowed to fail safely.
          try{
            RF.advanceWorld(gameSec*(RF.V102?.worldMinutesPerSecond??.32));
          }catch(err){RF.V1016.reportTickError(err,'world simulation')}

          // A road event may have opened a modal during advanceWorld. Resolve completion only
          // when the player is not currently answering that interruption.
          if(s.activity&&s.activity.progress>=s.activity.duration&&!RF.UI.modal){
            const a=s.activity;
            try{
              if(a.type==='travel')RF.finishTravel(a);
              else if(a.type==='craft')RF.finishCraft(a);
              else RF.finishActivity(a);
            }catch(err){
              RF.V1016.reportTickError(err,`${a.type||'activity'} completion`);
              // Never leave a completed activity blocking the campaign forever.
              if(RF.state?.activity===a)RF.state.activity=null;
            }
          }

          RF.autoSave=(RF.autoSave||0)+dt;RF.renderAcc=(RF.renderAcc||0)+dt;
          if(RF.autoSave>8){try{RF.save(s)}catch(err){console.warn(err)}RF.autoSave=0}
          if(RF.renderAcc>.18){try{RF.UI.render(s)}catch(err){RF.V1016.reportTickError(err,'UI render')}RF.renderAcc=0}
        }
      }catch(err){RF.V1016.reportTickError(err,'master tick')}
      finally{requestAnimationFrame(RF.tick)}
    };

    // Turn Back must actually persist, and it also clears stale pause state.
    const v1016CancelBase=RF.cancelActivity;
    RF.cancelActivity=function(){
      const s=RF.state,a=s?.activity;
      if(a?.type!=='travel')return v1016CancelBase?.apply(RF,arguments);
      s.activity=null;
      if(a.from&&RF.DATA.locations?.[a.from])s.location=a.from;
      s.speed=1;s.paused=false;RF.V1016.resetUIPause(s);
      RF.log?.(s,`You turn back${a.from&&RF.DATA.locations[a.from]?` to ${RF.DATA.locations[a.from].name}`:''}.`);
      RF.save?.(s);RF.UI.render(s);
    };

    RF.V1016.forceTeleport=function(id){
      const s=RF.state;if(!s||!RF.DATA.locations?.[id])return false;
      try{RF.clearActionTimer?.()}catch(_){}
      RF.actionGame=null;s.activity=null;s.combat=null;RF.UI.modal=null;
      RF.V1016.resetUIPause(s);
      s.location=id;s.visited=s.visited||{};s.visited[id]=true;s.speed=1;s.paused=false;
      RF.log?.(s,`DEV emergency teleport: ${RF.DATA.locations[id].name}.`,'important');
      RF.save?.(s);RF.UI.render(s);return true;
    };

    // Developer escape hatch: override the old teleport binder after all earlier handlers run.
    const v1016BindBase=RF.UI.bind.bind(RF.UI);
    RF.UI.bind=function(s){
      v1016BindBase(s);
      const tp=document.querySelector('[data-dev="teleport"]');
      if(tp)tp.onclick=()=>{
        const id=document.querySelector('[data-dev-location]')?.value;
        if(id)RF.V1016.forceTeleport(id);
      };
      document.querySelector('[data-v1016-recover-travel]')?.addEventListener('click',()=>{
        const ss=RF.state;if(!ss)return;
        if(ss.activity?.type==='travel')RF.cancelActivity();
        else {RF.V1016.resetUIPause(ss);ss.speed=1;ss.paused=false;RF.save?.(ss);RF.UI.render(ss)}
      });
    };

    // Add a visible rescue button to Developer utilities.
    const v1016DevBase=RF.UI.dev?.bind(RF.UI);
    if(v1016DevBase)RF.UI.dev=function(s){
      let h=v1016DevBase(s);
      const btn=`<button data-v1016-recover-travel>${s.activity?.type==='travel'?'Cancel / Recover Current Journey':'Reset Travel / Clock State'}</button>`;
      if(h.includes('Utilities</h3><div class="devGrid">'))h=h.replace('Utilities</h3><div class="devGrid">',`Utilities</h3><div class="devGrid">${btn}`);
      else h=h.replace('</section>',`<h3>Travel Recovery</h3><div class="devGrid">${btn}</div></section>`);
      return h;
    };

    // Lightweight watchdog for impossible pause debris. It does not advance travel itself;
    // the hardened ticker remains the single source of progress.
    RF.V1016.watchdog=setInterval(()=>{
      const s=RF.state;if(!s||RF.V101?.mainMenu)return;
      let dirty=RF.V1016.clearGhostModal(s);
      if(s.activity?.type==='travel'){
        dirty=RF.V1016.sanitiseTravel(s,{resume:false})||dirty;
        if(s.speed===0&&!s.paused&&!RF.UI.modal&&!s.combat&&!RF.actionGame){s.speed=1;dirty=true}
      }
      if(dirty){try{RF.save?.(s)}catch(_){};try{RF.UI.render(s)}catch(_){}}
    },1000);

    if(RF.state){RF.V1016.repairCampaign(RF.state);try{RF.save?.(RF.state)}catch(_){}}
  });}
  function installHistoricalV1017(){return once('js/v10_17.js',()=>{
    window.RF=window.RF||{};
    RF.VERSION='10.17.0';
    RF.V1017=RF.V1017||{};

    /* Realmforge V10.17 — Travel Overlay
       - Travel is presented in a dedicated non-pausing overlay rather than inline on World.
       - Road events/dialogue pause the journey above the overlay, then restore the prior speed.
       - Travel-started combat suspends the journey and restores it after victory / successful flee.
       - Defeat abandons a suspended journey because the player is carried to safety.
       - The overlay owns its own Pause / 1x / 2x controls and Turn Back action.
    */

    (()=>{
      const old=document.getElementById('v1017-style');if(old)old.remove();
      const st=document.createElement('style');st.id='v1017-style';st.textContent=`
        .v1017TravelBack{
          position:fixed;z-index:48;inset:0;
          display:grid;place-items:center;
          padding:calc(16px + env(safe-area-inset-top)) 14px calc(20px + env(safe-area-inset-bottom));
          background:rgba(5,4,3,.74);backdrop-filter:blur(5px);
          touch-action:manipulation;
        }
        .v1017TravelModal{
          width:min(660px,100%);max-height:min(84dvh,760px);overflow:auto;
          box-sizing:border-box;padding:18px;
          border:1px solid rgba(200,157,82,.58);border-radius:22px;
          background:linear-gradient(180deg,rgba(42,30,18,.99),rgba(18,14,10,.995));
          box-shadow:0 28px 80px rgba(0,0,0,.68),inset 0 1px rgba(255,255,255,.04);
          overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
        }
        .v1017TravelHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
        .v1017TravelHead h2{margin:2px 0 2px;font-family:Georgia,serif;color:#f1d392;font-size:25px;line-height:1.1}
        .v1017TravelWeather{white-space:nowrap;border:1px solid rgba(210,172,99,.28);border-radius:999px;padding:5px 9px;color:#d9c7a5;font-size:12px;background:rgba(255,255,255,.035)}
        .v1017Route{margin:13px 0 10px;padding:10px 12px;border:1px solid rgba(210,172,99,.18);border-radius:14px;background:rgba(0,0,0,.16);font-size:13px;color:#cbb99a;line-height:1.4}
        .v1017Route b{color:#f2dfb5}
        .v1017Road{position:relative;height:54px;margin:8px 2px 8px;overflow:hidden}
        .v1017Road:before{content:'';position:absolute;left:0;right:0;top:31px;height:5px;border-radius:99px;background:linear-gradient(90deg,#403526,#7b6341,#403526);box-shadow:0 1px rgba(255,255,255,.06)}
        .v1017Road:after{content:'';position:absolute;left:0;right:0;top:23px;border-top:1px dashed rgba(239,210,147,.16)}
        .v1017Walker{position:absolute;top:5px;width:32px;height:38px;line-height:38px;text-align:center;font-size:27px;transform:translateX(-50%) scaleX(-1);transform-origin:center;transition:left .18s linear;filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}
        .v1017TravelBar{height:10px;border-radius:99px;overflow:hidden;background:#211b14;border:1px solid rgba(208,169,91,.18)}
        .v1017TravelBar>div{height:100%;background:linear-gradient(90deg,#9b7131,#efd084);transition:width .18s linear}
        .v1017TravelStats{display:flex;justify-content:space-between;gap:12px;margin-top:7px;color:#c9b896;font-size:12px}
        .v1017Ambient{margin:13px 0 10px;padding:11px 12px;border-left:3px solid rgba(214,170,82,.55);background:rgba(255,255,255,.025);border-radius:0 10px 10px 0;color:#c5b392;font-size:13px;line-height:1.45;font-style:italic}
        .v1017SpeedRow{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
        .v1017Speed{min-height:44px;border-radius:12px;border:1px solid rgba(192,151,78,.32);background:#21180f;color:#d9c6a3;font:inherit;font-weight:800}
        .v1017Speed.active{border-color:#d3a34a;color:#ffdb8b;background:linear-gradient(180deg,#493017,#291b10);box-shadow:inset 0 0 0 1px rgba(255,219,139,.08)}
        .v1017Speed:disabled{opacity:.42}
        .v1017BoostNote{text-align:center;font-size:11px;color:#a99779;margin:-4px 0 10px}
        .v1017TurnBack{width:100%;min-height:48px;border-radius:13px;border:1px solid rgba(202,153,81,.35);background:#2a1d12;color:#f0d7a6;font:inherit;font-weight:800}
        .v1017TravelHint{text-align:center;color:#998b73;font-size:11px;line-height:1.35;margin-top:10px}
        @media(max-width:420px){.v1017TravelModal{padding:15px}.v1017TravelHead h2{font-size:22px}.v1017Walker{font-size:25px}}
        @media(prefers-reduced-motion:reduce){.v1017Walker,.v1017TravelBar>div{transition:none!important}}
      `;document.head.appendChild(st);
    })();

    RF.V1017.ensure=function(s){
      if(!s)return null;
      s.v1017=s.v1017||{};
      return s.v1017;
    };
    RF.V1017.cloneActivity=function(a){
      if(!a)return null;
      try{return JSON.parse(JSON.stringify(a))}catch(_){return {...a}}
    };
    RF.V1017.captureRunningClock=function(s){
      // If an event popup already paused the world, its stored resume state is the truthful clock.
      const mr=RF.V96?.modalResume;
      if(mr)return {speed:mr.speed||1,paused:!!mr.paused,boostRemaining:Math.max(0,mr.boostRemaining||0)};
      if(typeof RF.v96CaptureClock==='function')return RF.v96CaptureClock(s);
      const speed=[0,1,2].includes(+s?.speed)?+s.speed:1;
      return {speed,paused:speed===0||!!s?.paused,boostRemaining:speed===2&&s?.v8?Math.max(0,(s.v8.boostUntil||0)-Date.now()):0};
    };
    RF.V1017.applyTravelClock=function(s,snap){
      if(!s||!snap)return;
      let speed=snap.paused?0:(snap.speed||1);if(![0,1,2].includes(speed))speed=1;
      // A normal popup owns the pause. Update what it will resume to without unpausing behind it.
      if(RF.UI.modal&&RF.V96){
        RF.V96.modalResume={speed,paused:speed===0,boostRemaining:snap.boostRemaining||0};
        RF.V96.modalPaused=true;RF.V96.modalWasOpen=true;
        s.speed=0;s.paused=true;return;
      }
      s.speed=speed;s.paused=speed===0;
      if(speed>0&&RF.V96)RF.V96.lastNonZeroSpeed=speed;
      if(s.v8){
        if(speed===2){const left=Math.max(1000,snap.boostRemaining||RF.V8?.boostMs||30000);s.v8.boostUntil=Date.now()+left;}
        else s.v8.boostUntil=0;
      }
    };
    RF.V1017.travelRecord=function(s){
      if(s?.activity?.type==='travel')return s.activity;
      if(s?.combat&&s?.v1017?.suspendedTravel?.activity)return s.v1017.suspendedTravel.activity;
      return null;
    };
    RF.V1017.ambient=function(s,a){
      const hour=Math.floor((s.minute||0)/60)%24,w=s.weather||'Clear',region=RF.DATA.locations?.[a?.from]?.region||RF.DATA.locations?.[s.location]?.region||'the road';
      if(w==='Storm')return 'Thunder rolls beyond the road. Every flash briefly redraws the landscape in hard silver.';
      if(w==='Rain')return 'Rain whispers against the road and beads along your travelling gear.';
      if(w==='Fog')return 'The road ahead dissolves into fog; landmarks arrive later than expected.';
      if(hour<5)return `The ${region} road is almost black at this hour, save for the occasional distant lantern.`;
      if(hour<8)return 'Dawn gathers slowly along the road while the world wakes around you.';
      if(hour>=20)return 'Evening settles across the road. Windows and campfires begin to glow in the distance.';
      return 'Boots, weather and road dust mark the steady rhythm of the journey.';
    };
    RF.V1017.overlayHtml=function(s){
      const a=RF.V1017.travelRecord(s);if(!a)return '';
      const from=RF.DATA.locations?.[a.from]||RF.DATA.locations?.[s.location],to=RF.DATA.locations?.[a.target];
      const duration=Math.max(.001,Number(a.duration)||1),progress=Math.max(0,Math.min(duration,Number(a.progress)||0)),pct=Math.max(0,Math.min(100,100*progress/duration));
      const remaining=Math.max(0,duration-progress),speed=+s.speed||0,realRemain=s.combat?remaining:(speed>0?remaining/speed:remaining);
      const boostCd=typeof RF.boostCooldownRemaining==='function'?RF.boostCooldownRemaining(s):0;
      const boost=typeof RF.boostRemaining==='function'?RF.boostRemaining(s):0;
      const paused=s.combat?'Interrupted by combat':RF.UI.modal?'Journey interrupted':speed===0?'Paused':`${speed}× travel`;
      const remLabel=s.combat||RF.UI.modal?`${Math.ceil(remaining)} sec of road left`:speed===0?`${Math.ceil(remaining)} sec remaining`:`≈ ${Math.ceil(realRemain)} sec remaining`;
      const twoLabel=boostCd?`${Math.ceil(boostCd/1000)}s`:'2×';
      return `<div class="v1017TravelBack" data-v1017-travel-overlay>
        <section class="v1017TravelModal" role="dialog" aria-label="Travelling to ${to?.name||'destination'}">
          <div class="v1017TravelHead"><div><span class="eyebrow">ON THE ROAD</span><h2>🛤️ Travelling to ${to?.name||'your destination'}</h2><div class="sub">${paused}</div></div><div class="v1017TravelWeather">${RF.UI.weatherIcon?.(s.weather)||'☀️'} ${s.weather}</div></div>
          <div class="v1017Route"><b>${from?.icon||'📍'} ${from?.name||'Origin'}</b> &nbsp;→&nbsp; <b>${to?.icon||'📍'} ${to?.name||'Destination'}</b><br>${RF.UI.fmtTime?.(s)||''}</div>
          <div class="v1017Road"><div class="v1017Walker" style="left:${Math.max(3,Math.min(97,pct))}%">🚶</div></div>
          <div class="v1017TravelBar"><div style="width:${pct}%"></div></div>
          <div class="v1017TravelStats"><span>${Math.round(pct)}% complete</span><span>${remLabel}</span></div>
          <div class="v1017Ambient">${RF.V1017.ambient(s,a)}</div>
          <div class="v1017SpeedRow">
            <button class="v1017Speed ${speed===0&&!s.combat&&!RF.UI.modal?'active':''}" data-v1017-speed="0" ${s.combat||RF.UI.modal?'disabled':''}>Ⅱ Pause</button>
            <button class="v1017Speed ${speed===1?'active':''}" data-v1017-speed="1" ${s.combat||RF.UI.modal?'disabled':''}>1×</button>
            <button class="v1017Speed ${speed===2?'active':''}" data-v1017-speed="2" ${s.combat||RF.UI.modal||boostCd?'disabled':''}>${twoLabel}</button>
          </div>
          ${speed===2&&boost?`<div class="v1017BoostNote">2× burst • ${Math.ceil(boost/1000)}s remaining</div>`:boostCd?`<div class="v1017BoostNote">2× recovering • ${Math.ceil(boostCd/1000)}s</div>`:''}
          <button class="v1017TurnBack" data-v1017-turnback ${s.combat||RF.UI.modal?'disabled':''}>Turn back</button>
          <div class="v1017TravelHint">Road events can interrupt the journey. Decisions and battles pause your route, then return you here at the same progress.</div>
        </section>
      </div>`;
    };
    RF.V1017.mountOverlay=function(s){
      const a=RF.V1017.travelRecord(s);if(!a||RF.V101?.mainMenu)return;
      const root=document.getElementById('app');if(!root)return;
      root.insertAdjacentHTML('beforeend',RF.V1017.overlayHtml(s));
      root.querySelectorAll('[data-v1017-speed]').forEach(b=>b.onclick=()=>RF.setSpeed(+b.dataset.v1017Speed));
      const turn=root.querySelector('[data-v1017-turnback]');if(turn)turn.onclick=()=>RF.cancelActivity();
    };

    // Travel is no longer drawn as an inline World card. Other activities keep their normal panels.
    const v1017ActivityBase=RF.UI.activity.bind(RF.UI);
    RF.UI.activity=function(s){if(s?.activity?.type==='travel')return '';return v1017ActivityBase(s)};

    // Final render wrapper: base game renders first (including any event/combat overlay), then the
    // Travel Overlay is inserted at z48 so ordinary popups/battles at z60 naturally sit above it.
    const v1017RenderBase=RF.UI.render.bind(RF.UI);
    RF.UI.render=function(s){
      const out=v1017RenderBase(s);
      if(s)RF.V1017.mountOverlay(s);
      return out;
    };

    // Road interruptions now rely on the normal popup pause/resume machinery. They do not manually
    // zero the travel clock or require the player to restart it afterwards.
    RF.maybeTravelInterrupt=function(){
      const s=RF.state,a=s?.activity;if(!a||a.type!=='travel'||!a.v8Prepared||a.v8Checked||RF.UI.modal||s.combat)return;
      if(a.progress<a.v8Checkpoint)return;
      a.v8Checked=true;if(Math.random()>a.v8EventChance)return;
      const ev=RF.chooseRoadEvent?.(s);if(!ev)return;
      s.v8=s.v8||{};s.v8.travelInterrupts=(s.v8.travelInterrupts||0)+1;s.stats.travelEvents=(s.stats.travelEvents||0)+1;s.v8.roadEventsSeen=s.v8.roadEventsSeen||{};s.v8.roadEventsSeen[ev.id]=(s.v8.roadEventsSeen[ev.id]||0)+1;
      const at=Math.round(100*Math.max(0,a.progress)/Math.max(1,a.duration));
      RF.UI.modal={type:'event',event:{...ev,choices:ev.choices.map(c=>({...c,result:ss=>{const text=c.result(ss);return `${text}\n\nThe road waits at ${at}% complete. Close this event to continue the journey.`;}}))}};
      RF.log(s,`Travel interrupted: ${ev.title}`,'important');RF.save(s);RF.UI.render(s);
    };

    // ---------- Combat during travel ----------
    RF.V1017.suspendForCombat=function(s){
      if(!s?.activity||s.activity.type!=='travel')return false;
      const v=RF.V1017.ensure(s);v.suspendedTravel={activity:RF.V1017.cloneActivity(s.activity),clock:RF.V1017.captureRunningClock(s),at:Date.now()};
      return true;
    };
    RF.V1017.restoreAfterCombat=function(s){
      const v=RF.V1017.ensure(s),rec=v?.suspendedTravel;if(!rec?.activity||s.combat)return false;
      s.activity=RF.V1017.cloneActivity(rec.activity);v.suspendedTravel=null;
      RF.V1017.applyTravelClock(s,rec.clock||{speed:1,paused:false,boostRemaining:0});
      RF.V1016?.sanitiseTravel?.(s,{resume:false});
      RF.log?.(s,'You return to the road where the interruption began.','important');RF.save?.(s);return true;
    };
    RF.V1017.abandonSuspended=function(s){if(s?.v1017)s.v1017.suspendedTravel=null};

    const v1017StartBattleBase=RF.startBattle;
    RF.startBattle=function(id,opts={}){
      const s=RF.state;if(s?.activity?.type==='travel')RF.V1017.suspendForCombat(s);
      return v1017StartBattleBase.apply(RF,arguments);
    };

    const v1017WinBase=RF.winCombat;
    RF.winCombat=function(){
      const had=!!RF.state?.v1017?.suspendedTravel;
      const out=v1017WinBase.apply(RF,arguments);const s=RF.state;
      if(had&&s&&!s.combat&&RF.V1017.restoreAfterCombat(s))RF.UI.render(s);
      return out;
    };

    const v1017FleeBase=RF.fleeV4;
    RF.fleeV4=function(){
      const had=!!RF.state?.v1017?.suspendedTravel;
      const out=v1017FleeBase.apply(RF,arguments);const s=RF.state;
      if(had&&s&&!s.combat&&RF.V1017.restoreAfterCombat(s))RF.UI.render(s);
      return out;
    };

    const v1017LoseBase=RF.loseV4Battle;
    RF.loseV4Battle=function(){
      const s0=RF.state;RF.V1017.abandonSuspended(s0);
      return v1017LoseBase.apply(RF,arguments);
    };

    // Emergency travel cancellation / developer teleport must also forget any suspended road state.
    if(RF.V1016?.forceTeleport){
      const v1017TeleportBase=RF.V1016.forceTeleport.bind(RF.V1016);
      RF.V1016.forceTeleport=function(id){RF.V1017.abandonSuspended(RF.state);return v1017TeleportBase(id)};
    }
    const v1017CancelBase=RF.cancelActivity;
    RF.cancelActivity=function(){
      const s=RF.state;if(s?.activity?.type==='travel')RF.V1017.abandonSuspended(s);
      return v1017CancelBase.apply(RF,arguments);
    };

    // Save migration metadata.
    RF.V1017.migrate=function(s){if(!s)return s;RF.V1017.ensure(s);s.version='10.17.0';return s};
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */
    if(RF.state){RF.V1017.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state)}
  });}
  function installHistoricalV1020(){return once('js/v10_20.js',()=>{
    window.RF = window.RF || {};
    RF.VERSION='10.20.0';

    /* Realmforge V10.20 — Waypoint Journeys
       - World Map locations open a route-confirmation popup.
       - Direct routes can be started from the popup or left alone.
       - Multi-leg routes show every waypoint before departure.
       - A planned journey persists across individual travel legs.
       - At each intermediate stop, the player chooses Continue Journey or Stop Here.
       - Existing Travel Overlay, road events and combat interruptions continue to operate per leg.
    */

    RF.V1020=RF.V1020||{launchingRouteLeg:false};
    RF.V1020.ensure=function(s){
      if(!s)return null;
      s.v1020=s.v1020||{};
      if(!('routePlan' in s.v1020))s.v1020.routePlan=null;
      return s.v1020;
    };
    RF.V1020.loc=function(id){return RF.DATA.locations?.[id]||null};
    RF.V1020.route=function(s,dest,allowLocked=false){
      if(!s||!dest||typeof RF.v9Route!=='function')return null;
      try{return RF.v9Route(s,s.location,dest,allowLocked)}catch(_){return null}
    };
    RF.V1020.legMinutes=function(from,to){return Number(RF.DATA.locations?.[from]?.neighbors?.[to])||0};
    RF.V1020.routeNames=function(path){return (path||[]).map(id=>RF.V1020.loc(id)?.name||id)};
    RF.V1020.chainHtml=function(path,current){
      return `<div class="v1020RouteChain">${(path||[]).map((id,i)=>{
        const l=RF.V1020.loc(id);return `<span class="v1020Stop ${id===current?'here':''}">${l?.icon||'📍'} ${l?.name||id}</span>${i<(path.length-1)?'<b>›</b>':''}`;
      }).join('')}</div>`;
    };
    RF.V1020.clearPlan=function(s,reason=''){
      const v=RF.V1020.ensure(s);if(!v)return;
      if(v.routePlan&&reason)RF.log?.(s,reason);
      v.routePlan=null;
    };

    // ---------- World Map: tap a destination, inspect the route, then deliberately begin ----------
    RF.V1020.openRoutePreview=function(dest){
      const s=RF.state,d=RF.V1020.loc(dest);if(!s||!d)return;
      RF.V1020.ensure(s);
      s.v9=s.v9||{};s.v9.mapDest=null; // V9's old inline route card is superseded by the popup.
      RF.UI.modal={type:'v1020RoutePreview',destination:dest};
      RF.UI.render(s);
    };

    RF.V1020.beginRoute=function(dest){
      const s=RF.state;if(!s)return;
      const route=RF.V1020.route(s,dest,false);
      if(!route||!route.path||route.path.length<2){
        RF.UI.modal={type:'message',title:'Route unavailable',text:'There is no currently usable road route to that destination.'};RF.UI.render(s);return;
      }
      const v=RF.V1020.ensure(s);
      v.routePlan={
        destination:dest,
        path:[...route.path],
        currentIndex:0,
        pending:false,
        startedDay:s.day,
        startedMinute:s.minute,
        startedAt:Date.now()
      };
      const next=route.path[1];
      RF.UI.modal=null;
      RF.V1020.launchingRouteLeg=true;
      try{RF.travel(next)}finally{RF.V1020.launchingRouteLeg=false}
      if(s.activity?.type==='travel'){
        s.activity.v1020Planned=true;s.activity.v1020Destination=dest;
        RF.save?.(s);
      }else{
        RF.V1020.clearPlan(s);
        RF.UI.modal={type:'message',title:'Could not depart',text:'The journey could not be started. Check that the next road is still available.'};RF.UI.render(s);
      }
    };

    RF.V1020.remainingRoute=function(s){
      const p=RF.V1020.ensure(s)?.routePlan;if(!p?.destination)return null;
      return RF.V1020.route(s,p.destination,false);
    };
    RF.V1020.openContinue=function(s){
      const p=RF.V1020.ensure(s)?.routePlan;if(!p?.pending||RF.UI.modal||s.combat||s.activity)return false;
      if(s.location===p.destination){RF.V1020.clearPlan(s);return false}
      RF.UI.modal={type:'v1020RouteContinue',destination:p.destination};
      return true;
    };
    RF.V1020.continueRoute=function(){
      const s=RF.state,p=RF.V1020.ensure(s)?.routePlan;if(!s||!p)return;
      const route=RF.V1020.remainingRoute(s);
      if(!route||route.path.length<2){
        p.pending=false;RF.UI.modal={type:'message',title:'Journey interrupted',text:'The onward route is no longer available from here. Your planned journey has been stopped.'};RF.V1020.clearPlan(s);RF.save?.(s);RF.UI.render(s);return;
      }
      p.path=[...route.path];p.currentIndex=0;p.pending=false;
      const next=route.path[1];RF.UI.modal=null;
      RF.V1020.launchingRouteLeg=true;
      try{RF.travel(next)}finally{RF.V1020.launchingRouteLeg=false}
      if(s.activity?.type==='travel'){
        s.activity.v1020Planned=true;s.activity.v1020Destination=p.destination;RF.save?.(s);
      }else{
        RF.V1020.clearPlan(s);RF.UI.modal={type:'message',title:'Could not continue',text:'The next road could not be started.'};RF.UI.render(s);
      }
    };
    RF.V1020.stopRoute=function(){
      const s=RF.state;if(!s)return;const p=RF.V1020.ensure(s)?.routePlan;
      const dest=p?.destination?RF.V1020.loc(p.destination)?.name:null;
      RF.V1020.clearPlan(s,dest?`You stop the planned journey to ${dest} here.`:'');
      RF.UI.modal=null;RF.save?.(s);RF.UI.render(s);
    };

    // ---------- Map presentation ----------
    const v1020WorldMapBase=RF.UI.worldMap?.bind(RF.UI);
    if(v1020WorldMapBase)RF.UI.worldMap=function(s){
      if(s?.v9)s.v9.mapDest=null;
      let h=v1020WorldMapBase(s);
      h=h.replace('Choose any location to plan a route. Realmforge shows every road junction you must pass through rather than pretending distant locations are adjacent.',
        'Tap a location to inspect the route. Multi-leg journeys show every waypoint before you set out.');
      return h;
    };

    // ---------- Modal UI ----------
    const v1020ModalBase=RF.UI.modalHtml.bind(RF.UI);
    RF.UI.modalHtml=function(s){
      const m=this.modal;
      if(m?.type==='v1020RoutePreview'){
        const dest=m.destination,d=RF.V1020.loc(dest),unlocked=RF.v9LocationUnlocked?RF.v9LocationUnlocked(s,dest):true;
        const route=unlocked?RF.V1020.route(s,dest,false):null;
        const potential=!route?RF.V1020.route(s,dest,true):null;
        const lock=RF.v9LockText?.(s,dest)||'';
        if(dest===s.location)return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">${d?.icon||'📍'}</div><span class="eyebrow">WORLD MAP</span><h2>${d?.name||'Location'}</h2><div class="itemDesc">${d?.desc||''}</div><div class="notice good">You are already here.</div><div class="choices"><button class="choice" data-v1020-route-leave><b>Close</b></button></div></div></div>`;
        if(!route){
          const potentialText=potential?.path?.length>1?`<div class="v1020Potential"><b>Known path:</b> ${RF.V1020.routeNames(potential.path).join(' → ')}</div>`:'';
          return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">${d?.icon||'📍'}</div><span class="eyebrow">WORLD MAP • ROUTE</span><h2>${d?.name||'Destination'}</h2><div class="itemDesc">${d?.desc||''}</div><div class="notice">No usable route from your current location.${lock?`<br><b>${lock}</b>`:''}</div>${potentialText}<div class="choices"><button class="choice" data-v1020-route-leave><b>Leave it</b></button></div></div></div>`;
        }
        const legs=route.path.length-1,direct=legs===1,first=route.path[1],firstMin=RF.V1020.legMinutes(s.location,first),mids=route.path.slice(1,-1);
        return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">${d?.icon||'📍'}</div><span class="eyebrow">WORLD MAP • ${direct?'DIRECT JOURNEY':`${legs}-LEG JOURNEY`}</span><h2>${d?.name||'Destination'}</h2><div class="itemDesc">${d?.desc||''}</div>${RF.V1020.chainHtml(route.path,s.location)}<div class="tradeSummary"><span>Road legs <b>${legs}</b></span><span>Total road time <b>${route.minutes} min</b></span><span>First leg <b>${firstMin} min</b></span></div>${mids.length?`<div class="notice"><b>Waypoints:</b> ${mids.map(id=>`${RF.V1020.loc(id)?.icon||'📍'} ${RF.V1020.loc(id)?.name||id}`).join(' → ')}<br><small>You will be asked whether to continue at each stop.</small></div>`:`<div class="notice good">A single road leads directly there.</div>`}<div class="choices"><button class="choice" data-v1020-route-begin="${dest}"><b>Begin journey</b><small>${direct?`Travel directly to ${d.name}.`:`Start with ${RF.V1020.loc(first)?.name||'the first waypoint'}.`}</small></button><button class="choice" data-v1020-route-leave><b>Leave it</b></button></div></div></div>`;
      }
      if(m?.type==='v1020RouteContinue'){
        const p=RF.V1020.ensure(s)?.routePlan,dest=p?.destination||m.destination,d=RF.V1020.loc(dest),route=RF.V1020.route(s,dest,false);
        if(!route||route.path.length<2)return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">🛑</div><span class="eyebrow">PLANNED JOURNEY</span><h2>Route unavailable</h2><div class="notice">The onward road to ${d?.name||'your destination'} is no longer usable from here.</div><div class="choices"><button class="choice" data-v1020-route-stop><b>Stop here</b></button></div></div></div>`;
        const next=route.path[1],nextLoc=RF.V1020.loc(next),legs=route.path.length-1;
        return `<div class="modalBack"><div class="modal v1020RouteModal"><div class="itemHero">${RF.V1020.loc(s.location)?.icon||'📍'}</div><span class="eyebrow">WAYPOINT REACHED</span><h2>${RF.V1020.loc(s.location)?.name||'Waypoint'}</h2><div class="itemDesc">You have reached an intermediate stop on your planned journey to <b>${d?.name||'your destination'}</b>.</div>${RF.V1020.chainHtml(route.path,s.location)}<div class="tradeSummary"><span>Next leg <b>${RF.V1020.legMinutes(s.location,next)} min</b></span><span>Road legs left <b>${legs}</b></span><span>Remaining road time <b>${route.minutes} min</b></span></div><div class="notice">Next: ${nextLoc?.icon||'📍'} <b>${nextLoc?.name||next}</b>${legs>1?`<br><small>You will be asked again at the next waypoint.</small>`:''}</div><div class="choices"><button class="choice" data-v1020-route-continue><b>Continue journey</b><small>Begin the next leg toward ${d?.name||'the destination'}.</small></button><button class="choice" data-v1020-route-stop><b>Stop here</b><small>End the planned journey and remain at ${RF.V1020.loc(s.location)?.name||'this location'}.</small></button></div></div></div>`;
      }
      return v1020ModalBase(s);
    };

    // ---------- Route lifecycle ----------
    const v1020TravelBase=RF.travel;
    RF.travel=function(id){
      const s=RF.state;
      // A normal World travel button starts an independent journey and cancels any old route chain.
      if(s&&!RF.V1020.launchingRouteLeg&&RF.V1020.ensure(s)?.routePlan)RF.V1020.clearPlan(s);
      return v1020TravelBase.apply(RF,arguments);
    };

    const v1020FinishTravelBase=RF.finishTravel;
    RF.finishTravel=function(a){
      const planned=!!RF.state?.v1020?.routePlan && (a?.v1020Planned||a?.v1020Destination===RF.state.v1020.routePlan.destination);
      const target=a?.target;
      const out=v1020FinishTravelBase.apply(RF,arguments);
      const s=RF.state,p=RF.V1020.ensure(s)?.routePlan;
      if(!planned||!s||!p)return out;
      if(target===p.destination||s.location===p.destination){
        const name=RF.V1020.loc(p.destination)?.name||'your destination';
        RF.log?.(s,`Planned journey complete: ${name}.`,'important');RF.V1020.clearPlan(s);RF.save?.(s);return out;
      }
      // We reached a waypoint. Preserve the route plan and wait for any arrival event/combat to finish.
      p.pending=true;p.lastWaypoint=s.location;p.arrivedAt=Date.now();RF.save?.(s);
      if(!RF.UI.modal&&!s.combat&&!s.activity){RF.V1020.openContinue(s);RF.UI.render(s)}
      return out;
    };

    // If an arrival event or battle temporarily occupies the UI, show the waypoint choice as soon as it is safe.
    const v1020RenderBase=RF.UI.render.bind(RF.UI);
    RF.UI.render=function(s){
      if(s){
        const p=RF.V1020.ensure(s)?.routePlan;
        if(p?.pending&&!RF.UI.modal&&!s.combat&&!s.activity&&!RF.V101?.mainMenu)RF.V1020.openContinue(s);
      }
      return v1020RenderBase(s);
    };

    // Stopping/turning back or emergency teleporting ends a planned route chain as well.
    const v1020CancelBase=RF.cancelActivity;
    RF.cancelActivity=function(){
      const s=RF.state,wasTravel=s?.activity?.type==='travel';
      if(wasTravel&&RF.V1020.ensure(s)?.routePlan)RF.V1020.clearPlan(s);
      return v1020CancelBase.apply(RF,arguments);
    };
    if(RF.V1016?.forceTeleport){
      const v1020TeleportBase=RF.V1016.forceTeleport.bind(RF.V1016);
      RF.V1016.forceTeleport=function(id){RF.V1020.clearPlan(RF.state);return v1020TeleportBase(id)};
    }
    if(typeof RF.loseV4Battle==='function'){
      const v1020LoseBase=RF.loseV4Battle;
      RF.loseV4Battle=function(){RF.V1020.clearPlan(RF.state);return v1020LoseBase.apply(RF,arguments)};
    }

    // ---------- Bind final map/modal controls after all historical wrappers ----------
    const v1020BindBase=RF.UI.bind.bind(RF.UI);
    RF.UI.bind=function(s){
      try{v1020BindBase(s||RF.state)}catch(err){console.warn('[Realmforge V10.20 bind recovery]',err)}
      document.querySelectorAll('[data-map-dest]').forEach(b=>b.onclick=()=>RF.V1020.openRoutePreview(b.dataset.mapDest));
      document.querySelectorAll('[data-v1020-route-begin]').forEach(b=>b.onclick=()=>RF.V1020.beginRoute(b.dataset.v1020RouteBegin));
      document.querySelectorAll('[data-v1020-route-leave]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(RF.state)});
      document.querySelectorAll('[data-v1020-route-continue]').forEach(b=>b.onclick=()=>RF.V1020.continueRoute());
      document.querySelectorAll('[data-v1020-route-stop]').forEach(b=>b.onclick=()=>RF.V1020.stopRoute());
    };

    // ---------- Styling ----------
    (function(){
      const css=document.createElement('style');css.id='rf-v1020-style';css.textContent=`
        .v1020RouteModal .itemDesc{margin-bottom:12px}
        .v1020RouteChain{display:flex;align-items:center;gap:7px;overflow-x:auto;padding:10px 4px 13px;margin:5px 0 8px;scrollbar-width:none}
        .v1020RouteChain::-webkit-scrollbar{display:none}
        .v1020RouteChain>b{flex:0 0 auto;color:#a98c5d;font-size:20px}
        .v1020Stop{flex:0 0 auto;padding:8px 10px;border:1px solid rgba(211,173,104,.24);border-radius:12px;background:rgba(0,0,0,.16);font-size:13px;color:#dbc79e;white-space:nowrap}
        .v1020Stop.here{border-color:#e1bb6f;background:rgba(174,118,41,.18);color:#ffe6a9}
        .v1020Potential{margin:10px 0;padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.17);color:#cbb99a;line-height:1.45}
        .v1020RouteModal .tradeSummary{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
        .v1020RouteModal .tradeSummary span{min-width:0;text-align:center}
        @media(max-width:390px){.v1020RouteModal .tradeSummary{grid-template-columns:1fr 1fr}.v1020RouteModal .tradeSummary span:last-child{grid-column:1/-1}}
      `;document.head.appendChild(css);
    })();

    RF.V1020.migrate=function(s){if(!s)return s;RF.V1020.ensure(s);s.version='10.20.0';return s};
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */
    if(RF.state){RF.V1020.migrate(RF.state);try{RF.save?.(RF.state)}catch(_){};RF.UI.render(RF.state)}
  });}
  function installHistoricalV1122(){return once('js/v11_2_2.js',()=>{
    window.RF=window.RF||{};
    RF.VERSION='11.2.2';
    RF.BUILD={
      version:'11.2.2',
      title:'Clock Sentinel',
      built:'17 Sep 2026 • 21:20 BST',
      buildId:'20260917-2120-bst'
    };
    RF.V1122=RF.V1122||{};

    /* Realmforge V11.2.2 — Clock Sentinel
       - Replaces the single-point-of-failure world RAF loop with a guarded scheduler.
       - Adds an independent visible-page watchdog that takes over if RAF progression stalls.
       - Repairs stale travel/popup pause debris without overriding a deliberate manual Pause.
       - Repairs already-stuck journeys on load and keeps progress/completion lossless.
       - Keeps over-encumbrance, combat, action games and genuine modal pauses authoritative.
    */

    (()=>{
    'use strict';
    const V=RF.V1122;
    V.version='11.2.2';
    V.rafId=0;
    V.lastFrameStamp=0;
    V.lastRafWall=Date.now();
    V.lastProgressWall=Date.now();
    V.lastFallbackWall=0;
    V.fallbackActive=false;
    V.recoveryNoticeAt=0;
    V.WATCH_MS=500;
    V.STALL_MS=1600;

    V.nowPerf=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
    V.visible=()=>typeof document==='undefined'||document.visibilityState!=='hidden';
    V.over=s=>!!RF.isOverEncumbered?.(s);
    V.selectOpen=()=>typeof document!=='undefined'&&document.activeElement?.tagName==='SELECT';

    V.trueBlocker=function(s){
      if(!s)return 'no-state';
      if(V.over(s))return 'over-encumbered';
      if(RF.UI?.modal)return 'modal';
      if(s.combat)return 'combat';
      if(RF.actionGame)return 'action';
      if((+s.speed||0)<=0)return 'paused';
      return '';
    };
    V.shouldRun=s=>V.visible()&&!V.trueBlocker(s);

    V.markProgress=function(){V.lastProgressWall=Date.now()};
    V.noteRecovery=function(s,reason){
      if(!s)return;
      s.v1122=s.v1122||{};
      s.v1122.recoveries=(s.v1122.recoveries||0)+1;
      s.v1122.lastRecovery=Date.now();
      const now=Date.now();
      if(now-V.recoveryNoticeAt>10000){
        V.recoveryNoticeAt=now;
        RF.log?.(s,`Clock Sentinel recovered a stalled ${reason||'world clock'} without losing progress.`,'good');
      }
    };

    V.resetPauseDebris=function(s){
      if(!s)return false;
      let dirty=false;
      try{if(RF.V1016?.clearGhostModal?.(s))dirty=true}catch(_){ }

      // V9.6 stores temporary pause snapshots for actual popups/selects. If no such interface exists,
      // these flags are stale and must never be allowed to survive as a hidden time lock.
      if(!RF.UI?.modal&&!V.selectOpen()&&RF.V96){
        if(RF.V96.modalPaused||RF.V96.modalResume||RF.V96.selectPaused||RF.V96.selectResume||RF.V96.modalWasOpen){
          RF.V96.modalPaused=false;RF.V96.modalResume=null;
          RF.V96.selectPaused=false;RF.V96.selectResume=null;
          RF.V96.modalWasOpen=false;dirty=true;
        }
      }

      if(s.activity?.type==='travel'){
        try{if(RF.V1016?.sanitiseTravel?.(s,{resume:false}))dirty=true}catch(_){ }
        s.v83=s.v83||{};
        // A positive speed is an explicit running state. `paused=true` beside it is contradictory.
        if((+s.speed||0)>0){
          if(s.paused){s.paused=false;dirty=true}
          if(s.v83.manualPause){s.v83.manualPause=false;dirty=true}
        }
        // Conversely, an old accidental zero-speed journey with no deliberate Pause should resume.
        if((+s.speed||0)===0&&!s.v83.manualPause&&!RF.UI?.modal&&!s.combat&&!RF.actionGame&&!V.over(s)){
          s.speed=1;s.paused=false;dirty=true;
        }
      }
      return dirty;
    };

    V.finishReadyActivity=function(s){
      const a=s?.activity;if(!a)return false;
      const p=Number(a.progress)||0,d=Math.max(.001,Number(a.duration)||1);
      if(p+1e-6<d||RF.UI?.modal)return false;
      try{
        if(a.type==='travel')RF.finishTravel(a);
        else if(a.type==='craft')RF.finishCraft(a);
        else RF.finishActivity(a);
      }catch(err){
        RF.V1016?.reportTickError?.(err,`${a.type||'activity'} completion`);
        if(RF.state?.activity===a)RF.state.activity=null;
      }
      return true;
    };

    V.step=function(s,dt,{fallback=false}={}){
      if(!s||!Number.isFinite(dt)||dt<=0)return false;
      if(!V.shouldRun(s))return false;
      dt=Math.max(.001,Math.min(fallback?1.0:.25,dt));
      const speed=Math.max(0,+s.speed||0);if(speed<=0)return false;
      const gameSec=dt*speed;
      const beforeMinute=Number(s.minute)||0;
      const beforeProgress=Number(s.activity?.progress)||0;

      // Activity timers first, exactly as the hardened V10.16 clock intended.
      if(s.activity){
        const a=s.activity;
        let p=Number(a.progress),d=Number(a.duration);
        if(!Number.isFinite(p)||p<0)p=0;
        if(!Number.isFinite(d)||d<=0)d=1;
        a.duration=d;a.progress=Math.min(d,p+gameSec);
      }

      try{RF.advanceWorld(gameSec*(RF.V102?.worldMinutesPerSecond??.32))}
      catch(err){RF.V1016?.reportTickError?.(err,'world simulation')}

      V.finishReadyActivity(s);

      const afterMinute=Number(s.minute)||0;
      const afterProgress=Number(s.activity?.progress)||0;
      if(afterMinute!==beforeMinute||afterProgress!==beforeProgress)V.markProgress();

      RF.autoSave=(RF.autoSave||0)+dt;
      RF.renderAcc=(RF.renderAcc||0)+dt;
      if(RF.autoSave>8){try{RF.save?.(s)}catch(err){console.warn(err)}RF.autoSave=0}
      if(fallback||RF.renderAcc>.18){
        try{RF.UI.render(s)}catch(err){RF.V1016?.reportTickError?.(err,'UI render')}
        RF.renderAcc=0;
      }
      return true;
    };

    V.schedule=function(){
      if(!V.visible()||V.rafId)return;
      V.rafId=requestAnimationFrame(ts=>{V.rafId=0;RF.tick(ts)});
    };

    // One guarded master tick. Any older already-queued callback hands off to this function on its
    // next schedule. Near-simultaneous duplicate callbacks collapse back to one managed RAF chain.
    RF.tick=function(now){
      now=Number.isFinite(now)?now:V.nowPerf();
      const wall=Date.now();
      V.lastRafWall=wall;
      if(V.lastFrameStamp&&Math.abs(now-V.lastFrameStamp)<5){V.schedule();return}
      V.lastFrameStamp=now;
      try{
        const s=RF.state;
        if(!s){RF.lastTick=now;return}
        V.resetPauseDebris(s);
        let prev=Number(RF.lastTick);if(!Number.isFinite(prev)||prev<=0)prev=now;
        let dt=(now-prev)/1000;if(!Number.isFinite(dt)||dt<0)dt=0;
        RF.lastTick=now;
        V.step(s,dt);
      }catch(err){RF.V1016?.reportTickError?.(err,'Clock Sentinel RAF')}
      finally{V.schedule()}
    };

    V.recoverIfStalled=function(){
      const s=RF.state;if(!s||!V.visible())return false;
      const dirty=V.resetPauseDebris(s);
      if(dirty){try{RF.save?.(s)}catch(_){}}
      if(!V.shouldRun(s)){V.fallbackActive=false;V.lastFallbackWall=0;return dirty}

      const now=Date.now();
      const rafStalled=now-V.lastRafWall>V.STALL_MS;
      const progressStalled=now-V.lastProgressWall>V.STALL_MS;
      if(!rafStalled&&!progressStalled){V.fallbackActive=false;V.lastFallbackWall=0;return dirty}

      // A running clock that has not changed for >1.6s is impossible in normal play. Switch to a
      // temporary interval-backed pulse, preserve the exact journey/activity, then try to re-arm RAF.
      if(!V.fallbackActive){
        V.fallbackActive=true;V.lastFallbackWall=now;
        V.noteRecovery(s,s.activity?.type==='travel'?'journey':'world clock');
      }
      const elapsed=V.lastFallbackWall?Math.max(.12,Math.min(1,(now-V.lastFallbackWall)/1000)):.25;
      V.lastFallbackWall=now;
      try{V.step(s,elapsed,{fallback:true})}catch(err){RF.V1016?.reportTickError?.(err,'Clock Sentinel fallback')}
      V.schedule();
      try{RF.save?.(s)}catch(_){ }
      return true;
    };

    V.repairOnResume=function(){
      const s=RF.state;if(!s)return;
      const dirty=V.resetPauseDebris(s);
      RF.lastTick=V.nowPerf();
      V.lastRafWall=Date.now();V.lastProgressWall=Date.now();V.lastFallbackWall=0;V.fallbackActive=false;
      if(dirty)try{RF.save?.(s)}catch(_){ }
      V.finishReadyActivity(s);
      try{RF.UI.render(s)}catch(_){ }
      V.schedule();
    };

    V.migrate=function(s){
      if(!s)return s;
      s.v1122=s.v1122||{};
      // Never alter valid Pack/Bank/Equipment/Tool Belt contents here. This repair is clock-only.
      V.resetPauseDebris(s);
      if(s.activity?.type==='travel'){
        try{RF.V1016?.sanitiseTravel?.(s,{resume:false})}catch(_){ }
        if((+s.speed||0)>0)s.paused=false;
        if((+s.speed||0)===0&&!s.v83?.manualPause&&!V.over(s)&&!RF.UI?.modal&&!s.combat&&!RF.actionGame){s.speed=1;s.paused=false}
      }
      s.version='11.2.2';
      return s;
    };
    /* V11.8: legacy save/migration wrapper extracted to canonical core. */

    // Independent watchdog: unlike the visual RAF loop, this can detect a dead RAF chain and take
    // over long enough to recover it. It only runs while the app is visible and time should run.
    if(V.watchdog)clearInterval(V.watchdog);
    V.watchdog=setInterval(()=>V.recoverIfStalled(),V.WATCH_MS);

    ['visibilitychange','pageshow','focus'].forEach(name=>window.addEventListener(name,()=>{
      if(name==='visibilitychange'&&!V.visible())return;
      V.repairOnResume();
    },{passive:true}));

    if(RF.state){
      V.migrate(RF.state);
      RF.lastTick=V.nowPerf();
      RF.save?.(RF.state);
      setTimeout(()=>{V.repairOnResume()},0);
    }
    })();
  });}
  const api={
    installHistoricalV9Routing,installHistoricalV1016,installHistoricalV1017,installHistoricalV1020,installHistoricalV1122,
    get installedStages(){return Array.from(installed);},
    start:id=>RF.travel(id),finish:a=>RF.finishTravel(a),setSpeed:s=>typeof RF.setSpeed==='function'?RF.setSpeed(s):null,
    repair:s=>typeof RF.repairTravelIfStalled==='function'?RF.repairTravelIfStalled(s):s,
    route:(s,from,to,allowLocked=false)=>typeof RF.v9Route==='function'?RF.v9Route(s,from,to,allowLocked):null,
    preview:id=>RF.V1020?.openRoutePreview?RF.V1020.openRoutePreview(id):null,
    beginRoute:(...a)=>RF.V1020?.beginRoute?RF.V1020.beginRoute(...a):null,
    clearPlan:(s,r)=>RF.V1020?.clearPlan?RF.V1020.clearPlan(s,r):null,
    unlocked:(s,id)=>typeof RF.v9LocationUnlocked==='function'?RF.v9LocationUnlocked(s,id):false,
    lockText:(s,id)=>typeof RF.v9LockText==='function'?RF.v9LockText(s,id):''
  };
  RF.Systems.Travel=RF.Modules.register('systems.travel',api,{owner:'systems',status:'canonical',historicalStages:['v9-routing','v10.16','v10.17','v10.20','v11.2.2']});
})();

/* ===== js/systems/quests.js ===== */
/* Realmforge V11.12.0 — Canonical Quest Journal.
   Owns the V9.3 quest discovery/journal/detail interaction formerly embedded in compatibility.
   Later quest data and progression hooks can extend the same RF.Systems.Quests contract. */
(() => {
  'use strict';
  const RF=window.RF;
  let installed=false;
  function installHistoricalV93(){
    if(installed)return RF.V93;
    installed=true;
    RF.V93.questMeta={
      first_steps:{source:'Story',giver:'Your own curiosity',auto:true,summary:'Learn the rhythm of Greenvale and establish yourself as a capable traveller.'},
      missing_caravan:{source:'Story',giver:'Greenvale road rumours',auto:true,summary:'Investigate the caravan that vanished on the eastern road.'},
      blackthorn:{source:'Story',giver:'Blackthorn evidence',auto:true,summary:'Follow the token back to the gang operating beyond Greenvale.'},
      greenvale_teeth:{source:'Greenvale Noticeboard',location:'greenvale',summary:'Cull predators troubling the farms around Sunmeadow.'},
      river_provisions:{source:'Greenvale Noticeboard',location:'greenvale',summary:'Bring fresh fish and prove you know your way around a river.'},
      miners_due:{source:'Brann / Mine Notice',location:'mine',summary:'Replace valuable ore lost after a mine support failure.'},
      woodland_ledger:{source:'Elira',location:'forest',summary:'Help document Whisperwood and its more territorial inhabitants.'},
      ironridge_contract:{source:'Ironridge Contract Board',location:'ironridge',summary:'Reduce dangerous drakes around Redstone Quarry.'},
      marsh_medicine:{source:'Nessa Vale',location:'reedmere',summary:'Gather fen reagents for Reedmere medicine.'},
      field_notes:{source:'Maelin Quill',location:'mirewatch',summary:'Collect practical combat observations on dangerous Mirefen wildlife.'},
      locksmiths_errand:{source:'Cobb Rill',location:'reedmere',summary:'Demonstrate sufficient finesse for a suspiciously legitimate locksmith.'}
    };
    RF.v93OfferVisible=function(s,id){let q=RF.DATA.quests[id],m=RF.V93.questMeta[id];if(!q||!m||m.auto||s.quests[id]?.done||s.quests[id]?.active)return false;if(m.location&&s.location!==m.location)return false;
      if(id==='ironridge_contract'&&!s.visited?.ironridge)return false;if(['marsh_medicine','locksmiths_errand'].includes(id)&&!s.visited?.reedmere)return false;if(id==='field_notes'&&!s.visited?.mirewatch)return false;return true};
    RF.v93AcceptQuest=function(id){let s=RF.state,q=RF.DATA.quests[id];if(!q||s.quests[id]?.done)return;s.quests[id]={active:true,done:false};delete s.questAbandoned[id];RF.log(s,`Quest accepted: ${q.name}`,'important');RF.save(s);RF.UI.modal={type:'questDetail',id};RF.UI.render(s)};
    RF.v93AbandonQuest=function(id){let s=RF.state,qs=s.quests[id];if(!qs?.active)return;delete s.quests[id];s.questAbandoned[id]=true;RF.log(s,`Quest abandoned: ${RF.DATA.quests[id]?.name||id}`);RF.save(s);RF.UI.modal=null;RF.UI.render(s)};
    RF.v93RewardText=function(q){let r=q?.reward||{},a=[];if(r.gold)a.push(`${r.gold}g`);if(r.xp)a.push(`${r.xp} character XP`);if(r.item&&RF.DATA.items[r.item])a.push(`${RF.DATA.items[r.item].icon} ${RF.DATA.items[r.item].name}`);return a.join(' • ')||'No listed reward'};

    RF.UI.quests=function(s){let active=Object.entries(s.quests||{}).filter(([,qs])=>qs.active&&!qs.done),done=Object.entries(s.quests||{}).filter(([,qs])=>qs.done),offers=Object.keys(RF.DATA.quests).filter(id=>RF.v93OfferVisible(s,id));let row=(id,qs,label)=>{let q=RF.DATA.quests[id],m=RF.V93.questMeta[id]||{};if(!q)return'';return `<button class="row quest browseRow ${qs?.done?'done':''}" data-quest-detail="${id}" data-quest-state="${label}"><div class="meta"><div class="questTitle"><b>${q.name}</b><span class="tag">${label}</span></div><small>${m.summary||q.desc}</small></div><span class="chev">›</span></button>`};return `<section class="card"><h2>📜 Quest Journal</h2><div class="sub">Quests are discovered through story events, people, noticeboards and exploration. Tap any entry for objectives, source, requirements and rewards.</div></section>${offers.length?`<section class="card"><h3>Available Here</h3><div class="list">${offers.map(id=>row(id,null,'AVAILABLE')).join('')}</div></section>`:''}<section class="card"><h3>Active</h3><div class="list">${active.length?active.map(([id,qs])=>row(id,qs,'ACTIVE')).join(''):'<div class="sub">No active quests.</div>'}</div></section><section class="card"><h3>Completed</h3><div class="list">${done.length?done.map(([id,qs])=>row(id,qs,'DONE')).join(''):'<div class="sub">No completed quests yet.</div>'}</div></section>`};

    const questModalBase=RF.UI.modalHtml.bind(RF.UI);
    RF.UI.modalHtml=function(s){let m=this.modal;
      if(m?.type==='questDetail'){let q=RF.DATA.quests[m.id],qs=s.quests[m.id],meta=RF.V93.questMeta[m.id]||{},isOffer=!qs||(!qs.active&&!qs.done);if(!q)return'';let objs=q.objectives.map(o=>`<div class="objective detailObj">${this.objDone(s,o)?'✅':'⬜'} ${o.text}</div>`).join('');return `<div class="modalBack"><div class="modal questModal"><span class="eyebrow">${qs?.done?'COMPLETED':qs?.active?'ACTIVE QUEST':'QUEST OFFER'}</span><h2>📜 ${q.name}</h2><div class="itemDesc">${q.desc}</div><div class="questInfo"><b>Source</b><span>${meta.source||meta.giver||'World event'}</span></div>${meta.giver?`<div class="questInfo"><b>Giver</b><span>${meta.giver}</span></div>`:''}<h3>Objectives</h3>${objs}<h3>Rewards</h3><div class="notice good">${RF.v93RewardText(q)}</div><div class="choices">${isOffer?`<button class="choice" data-quest-accept="${m.id}"><b>Accept Quest</b></button>`:''}${qs?.active?`<button class="choice dangerChoice" data-quest-abandon="${m.id}"><b>Abandon Quest</b><small>You can reacquire it from its source later.</small></button>`:''}<button class="choice" data-quest-close><b>Close</b></button></div></div></div>`}
      return questModalBase(s);
    };

    const questBindBase=RF.UI.bind.bind(RF.UI);
    RF.UI.bind=function(s){questBindBase(s);
      document.querySelectorAll('[data-quest-detail]').forEach(b=>b.onclick=()=>{RF.UI.modal={type:'questDetail',id:b.dataset.questDetail};RF.UI.render(s)});document.querySelectorAll('[data-quest-accept]').forEach(b=>b.onclick=()=>RF.v93AcceptQuest(b.dataset.questAccept));document.querySelectorAll('[data-quest-abandon]').forEach(b=>b.onclick=()=>RF.v93AbandonQuest(b.dataset.questAbandon));document.querySelectorAll('[data-quest-close]').forEach(b=>b.onclick=()=>{RF.UI.modal=null;RF.UI.render(s)});
    };
    return RF.V93;
  }

  const api={
    installHistoricalV93,
    get installed(){return installed;},
    check:s=>RF.questCheck(s),
    accept:id=>typeof RF.v93AcceptQuest==='function'?RF.v93AcceptQuest(id):null,
    abandon:id=>typeof RF.v93AbandonQuest==='function'?RF.v93AbandonQuest(id):null,
    visible:(s,id)=>typeof RF.v93OfferVisible==='function'?RF.v93OfferVisible(s,id):true,
    requirementText:(...a)=>typeof RF.v93Req==='function'?RF.v93Req(...a):'',
    journal:s=>RF.UI.quests?.(s)||''
  };
  RF.Systems.Quests=RF.Modules.register('systems.quests',api,{owner:'systems',status:'canonical',historicalStage:'v9.3'});
})();

/* ===== js/systems/wayfinder.js ===== */
/* Realmforge V11.12.0 — Canonical Wayfinder.
   Owns the mature V11.5.1 contextual locked-route guidance system.
   Installed at the original V11.5.1 boundary so progression behaviour remains identical. */
(() => {
  'use strict';
  const RF=window.RF;
  let installed=false;
  function installHistoricalV1151(){
    if(installed)return RF.V1151;
    installed=true;
    window.RF=window.RF||{};
    RF.VERSION='11.5.1';
    RF.BUILD={
      version:'11.5.1',
      title:'Wayfinder Hints',
      built:'17 Sep 2026 • 23:28 BST',
      buildId:'20260917-2328-bst'
    };
    RF.V1151=RF.V1151||{};

    /* Realmforge V11.5.1 — Wayfinder Hints
       - Locked World Map destinations no longer expose internal save-flag names.
       - Tapping a locked destination gives a subtle contextual hint for the NEXT step only.
       - Hints advance automatically as the campaign state advances, until the road unlocks.
       - Covers every current flag-locked and skill-locked location without changing progression rules.
    */

    (()=>{
    'use strict';
    const V=RF.V1151;
    V.version='11.5.1';
    V.escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    V.skillLevel=(s,id)=>Math.max(1,Number(s?.skills?.[id]?.level)||1);
    V.kills=(s,id)=>Math.max(0,Number(s?.kills?.[id])||0);

    V.northHint=function(s){
      if(!s?.flags?.woundedMerchantResolved){
        return {title:'The east road has unfinished business',text:'Travellers around Whisperwood and Kingroad Crossroads have been seeing signs of trouble. One of them may know more than they first let on.'};
      }
      if(!s.flags.banditCampKnown){
        return {title:'Stories leave tracks',text:'What you learned on the east road points back toward Kingroad Crossroads. A careful search there may reveal a trail that ordinary traffic has hidden.'};
      }
      if(!s.flags.eastwatchOpen){
        const n=V.kills(s,'bandit')+V.kills(s,'blackthorn_scout');
        if(n<3)return {title:'Eastwatch is still watching from a distance',text:'The watch has little reason to open its doors while Blackthorn still looks like a roadside nuisance. A few decisive victories against their people may change that.'};
        return {title:'The watch should have noticed by now',text:'Blackthorn has taken enough losses to draw official attention. Eastwatch Tower is worth checking again.'};
      }
      if(!s.flags.vossRevealed){
        return {title:'A name is missing from the story',text:'Blackthorn has organisation behind it. Their tougher enforcers are more likely than common raiders to be carrying orders, letters, or names.'};
      }
      if(!s.flags.vossDefeated){
        return {title:'Cut off the head, not another branch',text:'You know who commands Blackthorn now. Their hidden camp is the natural place to press that advantage.'};
      }
      return {title:'The road north is now a matter of permission',text:'With Blackthorn broken, Sergeant Halden at Eastwatch may finally be willing to discuss passage beyond the valley.'};
    };

    V.flagHint=function(s,flag,id){
      switch(flag){
        case 'banditCampKnown':
          if(!s?.flags?.woundedMerchantResolved)return {title:'Someone has seen too much',text:'Keep an eye on the roads around Whisperwood and Kingroad Crossroads. Trouble there may point toward whoever is hiding beyond the ridge.'};
          return {title:'Blackthorn left a trail',text:'The account you heard points toward Kingroad Crossroads. Search the road itself for signs the bandits failed to hide.'};

        case 'eastwatchOpen': {
          if(!s?.flags?.banditCampKnown)return V.northHint(s);
          const n=V.kills(s,'bandit')+V.kills(s,'blackthorn_scout');
          if(n<3)return {title:'Give the watch a reason to listen',text:'Eastwatch is tracking Blackthorn activity. Driving more of their raiders from the valley may make the tower take you seriously.'};
          return {title:'Eastwatch should be paying attention',text:'Enough Blackthorn fighters have fallen that the guards can no longer dismiss the threat. Try the tower again.'};
        }

        case 'deepMineFound':
          if(V.skillLevel(s,'exploration')<3)return {title:'There are older workings below',text:'The Old Greenvale Mine has signs of passages beyond the obvious tunnels, but spotting the right marks will take a little more experience on the road.'};
          return {title:'Look past the working mine',text:'Old boards and unfamiliar markings inside the Old Greenvale Mine suggest that one tunnel was hidden rather than abandoned. A deliberate search may find it.'};

        case 'wayfarerHallOpen':
          if((s?.player?.level||1)<3&&!s?.flags?.eastwatchOpen)return {title:'The Wayfarers prefer proven travellers',text:'Greenvale’s guild hall does not seem interested in complete newcomers. A little more worldly experience may be enough to draw an invitation.'};
          return {title:'Someone in Greenvale knows the Wayfarers',text:'People connected to the roads and the watch occasionally point capable travellers toward paid work. Ask around rather than looking for an unlocked door.'};

        case 'cryptOpened':
          if(s?.flags?.cryptMarked)return {title:'You already found the breathing stone',text:'The slab beneath Mossbound Ruins is still on your map. Perhaps the question is no longer where the entrance is, but whether you are ready to uncover it.'};
          if(!s?.flags?.vossDefeated&&V.skillLevel(s,'exploration')<6)return {title:'The ruins are hiding a second story',text:'Mossbound Ruins feel older than their surface stones suggest. Greater experience, or new knowledge from the Blackthorn affair, may make the buried signs easier to read.'};
          return {title:'Cold air has to come from somewhere',text:'At Mossbound Ruins, disturbed stone and a thread of unnatural cold may reward patient exploration.'};

        case 'northRoadOpen':
          return V.northHint(s);

        case 'emberdeepKnown':
          if(!s?.flags?.northRoadOpen)return {title:'First reach the country that knows its name',text:V.northHint(s).text};
          if(V.skillLevel(s,'mining')<7)return {title:'Miners keep some roads to themselves',text:'Ironridge workers are reluctant to discuss the old furnace tunnels with casual travellers. More time underground may loosen tongues.'};
          return {title:'Listen for talk of a sealed furnace road',text:'Experienced workers around Ironridge and Redstone Quarry have started whispering about heat where no furnace should still burn.'};

        default:
          return {title:'The road is not ready to reveal itself',text:'Keep progressing through nearby quests, exploration and conversations. The next clue is somewhere in the world you can already reach.'};
      }
    };

    V.skillHint=function(s,skill,need,id){
      const name=RF.DATA.skills?.[skill]?.name||skill;
      const have=V.skillLevel(s,skill);
      if(id==='ruins')return {title:'The overgrown trail is difficult to read',text:have>=need-1?'The route through the moss is beginning to make sense. A little more field experience should be enough to pick it out.':'Spend more time exploring the valley. The path to these ruins is there, but you are not yet reading the terrain the way an experienced traveller would.'};
      if(id==='drowned_ruins')return {title:'The fen hides its roads under water',text:have>=need-1?'You are close to understanding the safe approach. One more stretch of difficult exploration may make the drowned route readable.':'The route through the flooded ground is too deceptive to follow safely. More experience charting difficult places should help.'};
      return {title:`More ${name} experience will help`,text:`The way is visible, but not yet practical. Spend more time developing ${name} and return when the route feels less uncertain.`};
    };

    V.progressHint=function(s,id){
      const loc=RF.DATA.locations?.[id];
      if(!loc)return {title:'No clue yet',text:'Nothing useful is known about this route.'};
      if(loc.lockedFlag&&!s?.flags?.[loc.lockedFlag])return V.flagHint(s,loc.lockedFlag,id);
      if(loc.lockedSkill){
        const [skill,need]=Object.entries(loc.lockedSkill)[0]||[];
        if(skill&&V.skillLevel(s,skill)<Number(need||1))return V.skillHint(s,skill,Number(need||1),id);
      }
      return {title:'The route itself is open',text:'Something else along the planned path is currently preventing the journey.'};
    };

    V.blockedLocation=function(s,dest){
      if(!s||!dest)return dest;
      if(RF.v9LocationUnlocked&&!RF.v9LocationUnlocked(s,dest))return dest;
      const route=RF.V1020?.route?.(s,dest,true)||RF.v9Route?.(s,s.location,dest,true);
      if(route?.path){
        for(const id of route.path.slice(1)){
          if(RF.v9LocationUnlocked&&!RF.v9LocationUnlocked(s,id))return id;
        }
      }
      return dest;
    };

    // Never expose raw internal save flag names on the World Map.
    const oldLockText=RF.v9LockText;
    RF.v9LockText=function(s,id){
      const loc=RF.DATA.locations?.[id];if(!loc)return oldLockText?oldLockText(s,id):'';
      if(loc.lockedFlag&&!s?.flags?.[loc.lockedFlag])return 'World progress needed';
      if(loc.lockedSkill){
        const [sk,lv]=Object.entries(loc.lockedSkill)[0]||[];
        if(sk&&V.skillLevel(s,sk)<Number(lv||1))return `More ${RF.DATA.skills?.[sk]?.name||sk} experience needed`;
      }
      return '';
    };

    // Replace only the LOCKED route-preview presentation. Route calculation and unlock logic stay authoritative.
    const modalBase=RF.UI.modalHtml.bind(RF.UI);
    RF.UI.modalHtml=function(s){
      const m=this.modal;
      if(m?.type==='v1020RoutePreview'){
        const dest=m.destination,d=RF.DATA.locations?.[dest];
        const route=RF.V1020?.route?.(s,dest,false)||RF.v9Route?.(s,s.location,dest,false);
        if(dest!==s.location&&!route){
          const potential=RF.V1020?.route?.(s,dest,true)||RF.v9Route?.(s,s.location,dest,true);
          const blocker=V.blockedLocation(s,dest),blockedLoc=RF.DATA.locations?.[blocker];
          const hint=V.progressHint(s,blocker);
          const potentialText=potential?.path?.length>1?`<div class="v1020Potential"><b>Known path:</b> ${(RF.V1020?.routeNames?RF.V1020.routeNames(potential.path):potential.path.map(x=>RF.DATA.locations?.[x]?.name||x)).join(' → ')}</div>`:'';
          const blockerLine=blocker&&blocker!==dest&&blockedLoc?`<small>The route is currently held up around ${V.escape(blockedLoc.name)}.</small>`:'';
          return `<div class="modalBack"><div class="modal v1020RouteModal v1151LockedRoute"><div class="itemHero">${d?.icon||'📍'}</div><span class="eyebrow">WORLD MAP • ROUTE</span><h2>${V.escape(d?.name||'Destination')}</h2><div class="itemDesc">${V.escape(d?.desc||'')}</div><div class="notice v1151RouteClosed"><b>The way is not open yet.</b>${blockerLine}</div><div class="v1151WayfinderHint"><span class="eyebrow">WAYFINDER'S HINT</span><b>${V.escape(hint.title)}</b><p>${V.escape(hint.text)}</p></div>${potentialText}<div class="choices"><button class="choice" data-v1020-route-leave><b>Leave it</b></button></div></div></div>`;
        }
      }
      return modalBase(s);
    };

    const old=document.getElementById('v1151-wayfinder-style');if(old)old.remove();
    const st=document.createElement('style');st.id='v1151-wayfinder-style';st.textContent=`
    .v1151RouteClosed{display:flex;flex-direction:column;gap:4px;margin-top:10px}
    .v1151RouteClosed>b{color:#edd7a7}.v1151RouteClosed small{color:#aa9a7c;line-height:1.35}
    .v1151WayfinderHint{margin:12px 0;padding:14px 15px;border:1px solid rgba(115,160,88,.5);border-radius:14px;background:linear-gradient(180deg,rgba(39,71,38,.36),rgba(24,47,26,.25));box-shadow:inset 3px 0 0 rgba(132,188,101,.75)}
    .v1151WayfinderHint>.eyebrow{display:block;color:#b8d99a;margin-bottom:7px;font-size:9px;letter-spacing:.16em}
    .v1151WayfinderHint>b{display:block;color:#e6efcf;font-size:15px;line-height:1.25;margin-bottom:6px}
    .v1151WayfinderHint>p{margin:0;color:#c5b99e;font-size:13px;line-height:1.48}
    `;
    document.head.appendChild(st);

    // Presentation-only patch: no save migration and no progression flags are changed.
    if(RF.state)setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
    })();
    return RF.V1151;
  }
  const api={
    installHistoricalV1151,
    get installed(){return installed;},
    hint:(s,id)=>RF.V1151?.progressHint?RF.V1151.progressHint(s,id):null,
    lockText:(s,id)=>typeof RF.v9LockText==='function'?RF.v9LockText(s,id):'',
    northHint:s=>RF.V1151?.northHint?RF.V1151.northHint(s):null
  };
  RF.Systems.Wayfinder=RF.Modules.register('systems.wayfinder',api,{owner:'systems',status:'canonical',historicalStage:'v11.5.1'});
})();
