/* Realmforge V11.11.0 — Canonical Commerce + Dungeons Core */

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

//# sourceURL=realmforge:///js/systems/commerce.js

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

//# sourceURL=realmforge:///js/systems/dungeons.js
