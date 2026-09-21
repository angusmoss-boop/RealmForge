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


/* Realmforge V11.24.0 historical fragment extension: Commerce. */
(() => {
  'use strict';
  const RF=window.RF,api=RF.Systems.Commerce;if(!api)throw new Error('Commerce canonical owner missing before V11.24 fragment extension.');
  const extraSources={"v9-quantity-trade":"// ---------- Quantity-aware trade & crafting ----------\nRF.v9Int=function(v){v=parseInt(v,10);return Number.isFinite(v)&&v>0?v:0};\nRF.v9MaxBuy=function(s,id,price){let it=RF.DATA.items[id];if(!it)return 0;let byGold=Math.floor(s.gold/Math.max(1,price));if(byGold<1)return 0;let has=(s.inventory[id]||0)>0;if(!has&&RF.packUsed&&RF.packUsed(s)>=RF.V82.PACK_CAP&&!RF.isBankTown(s))return 0;return byGold};\nRF.v9MaxSell=function(s,id){let q=s.inventory[id]||0;return Math.max(0,q-(RF.isEquipped?.(s,id)?1:0))};\nRF.v9MaxCraft=function(s,id){let r=RF.DATA.recipes[id];if(!r||(s.skills[r.skill]?.level||1)<r.level)return 0;let max=Infinity;Object.entries(r.inputs).forEach(([x,q])=>max=Math.min(max,Math.floor((s.inventory[x]||0)/q)));if(!Number.isFinite(max))max=0;let outId=Object.keys(r.outputs||{})[0];if(outId&&!(s.inventory[outId]>0)&&RF.packUsed&&RF.packUsed(s)>=RF.V82.PACK_CAP&&!RF.isBankTown(s))return 0;return Math.max(0,max)};\nRF.v9Cant=function(title,text,back){RF.UI.modal={type:'v9Cant',title,text,back};RF.UI.render(RF.state)};\nRF.v9BuyQty=function(id,qty,price,privateTrade=false){let s=RF.state;qty=RF.v9Int(qty);let max=RF.v9MaxBuy(s,id,price);if(!qty||qty>max)return RF.v9Cant('Cannot buy that amount',`You can currently buy at most ${max} × ${RF.DATA.items[id]?.name||id}.`,RF.UI.modal);let cost=qty*price;s.gold-=cost;RF.addItem(s,id,qty);RF.addXp(s,'trading',Math.max(5,Math.round(5*Math.sqrt(qty))));RF.save(s);RF.UI.modal={type:'message',title:'Purchase complete',text:`Bought ${qty} × ${RF.DATA.items[id].name} for ${cost}g.`};RF.UI.render(s)};\nRF.v9SellQty=function(id,qty,price){let s=RF.state;qty=RF.v9Int(qty);let max=RF.v9MaxSell(s,id);if(!qty||qty>max)return RF.v9Cant('Cannot sell that amount',`You can currently sell at most ${max} × ${RF.DATA.items[id]?.name||id}. Equipped copies are protected.`,RF.UI.modal);RF.takeItem(s,id,qty);s.gold+=qty*price;RF.addXp(s,'trading',Math.max(3,Math.round(3*Math.sqrt(qty))));RF.save(s);RF.UI.modal={type:'message',title:'Sale complete',text:`Sold ${qty} × ${RF.DATA.items[id].name} for ${qty*price}g.`};RF.UI.render(s)};\n\n"};
  const previous=typeof api.installHistoricalFragment==='function'?api.installHistoricalFragment.bind(api):null;
  const installed=Array.isArray(api.installedFragments)?api.installedFragments:(api.installedFragments=[]);
  const seen=new Set(installed);
  function runExtra(name){
    if(seen.has(name))return false;const source=extraSources[name];if(typeof source!=='string')return previous?previous(name):false;
    const script=document.createElement('script');script.type='text/javascript';script.setAttribute('data-rf-canonical-commerce-fragment',name);
    script.textContent=source+'\n//# sourceURL=realmforge-canonical:///systems.commerce/fragment/'+name+'\n';(document.head||document.documentElement).appendChild(script);script.remove();
    seen.add(name);installed.push(name);return true;
  }
  api.installHistoricalFragment=runExtra;
  const oldNames=typeof api.fragmentNames==='function'?api.fragmentNames.bind(api):()=>[];
  api.fragmentNames=()=>Array.from(new Set([...oldNames(),...Object.keys(extraSources)]));
})();
