window.RF=window.RF||{};
RF.VERSION='10.40.0';
RF.BUILD={
  version:'10.40.0',
  title:'Vista Composition',
  built:'16 Sep 2026 • 03:38 BST',
  buildId:'20260916-0338-bst'
};
RF.V1040=RF.V1040||{};

/* Realmforge V10.40 — Vista Composition
   - Refines Living Vistas into a clean 75/25 landscape + location-detail composition.
   - Removes the duplicate region/location chip from the scene; weather remains visible on its own.
   - Rebuilds cloud motion as seamless tiled drift with real-time phase continuity across frequent UI rerenders.
*/

(()=>{
const V=RF.V1040;
const Vista=RF.V1039;

V.migrate=function(s){if(!s)return s;s.version='10.40.0';s.v1040=s.v1040||{};return s};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){RF.V95.SCHEMA='10.40.0';const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s))}

if(Vista){
  Vista.scene=function(s){
    const l=RF.DATA.locations[s.location];
    const theme=Vista.theme[s.location]||'village';
    const pal=Vista.palette[theme]||Vista.palette.village;
    const hour=(Number(s.minute)||0)/60%24;
    const hm=`${Vista.pad(hour)}:${Vista.pad((Number(s.minute)||0)%60)}`;
    const part=Vista.daypart(hour);
    const sky=Vista.sky(hour),cel=Vista.celestial(hour),night=hour<6||hour>=19.5;
    const weather=String(s.weather||'Clear'),wc=weather.toLowerCase();

    // RF.UI frequently rebuilds the World DOM while time advances. Negative animation delays derived
    // from real time keep the repeating cloud layers on approximately the same phase after each rebuild,
    // preventing the visible snap the old transform animation produced.
    const now=Date.now()/1000;
    const cloudA=-(now%44).toFixed(3);
    const cloudB=-(now%67).toFixed(3);

    return `<div class="v1039Vista v1040Vista v1039-${theme} v1039Weather-${wc} ${night?'v1039Night':'v1039Day'}" style="--sky1:${sky[0]};--sky2:${sky[1]};--land1:${pal[0]};--land2:${pal[1]};--ground:${pal[2]};--cel-left:${cel.left}%;--cel-top:${cel.top}%;--cloud-delay-a:${cloudA}s;--cloud-delay-b:${cloudB}s">
      <div class="v1040Landscape">
        <div class="v1039Sky" aria-hidden="true"><div class="v1039Stars"></div><div class="v1039Celestial ${cel.day?'sun':'moon'}"></div><div class="v1040CloudLayer c1"></div><div class="v1040CloudLayer c2"></div></div>
        <div class="v1039Scenery" aria-hidden="true">${Vista.scenery(theme)}</div>
        <div class="v1039WeatherFx" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="v1039Shade" aria-hidden="true"></div>
        <div class="v1040WeatherBadge">${Vista.weatherIcon(weather)} <b>${weather}</b></div>
      </div>
      <div class="v1040LocationDetails">
        <div class="v1040Meta"><span>DAY ${s.day}</span><span>${part.toUpperCase()}</span><span>${hm}</span></div>
        <div class="v1040LocationLine"><span class="v1040LocationIcon">${l.icon||'🗺️'}</span><h2>${l.name}</h2></div>
        <p>${l.desc||''}</p>
      </div>
    </div>`;
  };
}

const st=document.createElement('style');
st.id='v1040-vista-composition-style';
st.textContent=`
/* The scene is now a true composition: roughly 3/4 landscape and 1/4 information. */
.v1040Vista{height:286px!important;display:grid!important;grid-template-rows:minmax(0,3fr) minmax(70px,1fr);background:#100e0b!important;filter:none!important;}
.v1040Landscape{position:relative;min-height:0;overflow:hidden;background:linear-gradient(180deg,var(--sky1) 0 54%,var(--land1) 55% 74%,var(--ground) 75% 100%);border-bottom:1px solid rgba(202,165,101,.26);isolation:isolate}
.v1039Weather-cloudy .v1040Landscape{filter:saturate(.88) brightness(.95)}
.v1039Weather-rain .v1040Landscape{filter:saturate(.84) brightness(.90)}
.v1039Weather-storm .v1040Landscape{filter:saturate(.76) brightness(.82)}
.v1039Weather-fog .v1040Landscape{filter:saturate(.70) contrast(.92) brightness(1.03)}

/* Seamless cloud fields. The background pattern tiles exactly at each animation endpoint,
   and negative delays keep phase stable across full UI rerenders. */
.v1040CloudLayer{position:absolute;left:-10%;right:-10%;height:68px;top:20px;opacity:.07;pointer-events:none;will-change:background-position;transform:translateZ(0);backface-visibility:hidden;background-image:radial-gradient(ellipse at 16% 66%,rgba(239,243,242,.95) 0 17%,transparent 18%),radial-gradient(ellipse at 43% 43%,rgba(239,243,242,.96) 0 24%,transparent 25%),radial-gradient(ellipse at 72% 64%,rgba(239,243,242,.90) 0 19%,transparent 20%);background-size:280px 68px,280px 68px,280px 68px;background-repeat:repeat-x;animation:v1040CloudDriftA 44s linear infinite;animation-delay:var(--cloud-delay-a)}
.v1040CloudLayer.c2{top:57px;height:54px;opacity:.045;background-size:360px 54px,360px 54px,360px 54px;filter:blur(2px);animation-name:v1040CloudDriftB;animation-duration:67s;animation-delay:var(--cloud-delay-b)}
.v1039Weather-cloudy .v1040CloudLayer{opacity:.38}.v1039Weather-cloudy .v1040CloudLayer.c2{opacity:.25}
.v1039Weather-rain .v1040CloudLayer{opacity:.52;filter:blur(1.5px)}.v1039Weather-rain .v1040CloudLayer.c2{opacity:.34;filter:blur(3px)}
.v1039Weather-storm .v1040CloudLayer{opacity:.66;filter:blur(2px) brightness(.62)}.v1039Weather-storm .v1040CloudLayer.c2{opacity:.44;filter:blur(4px) brightness(.56)}
.v1039Weather-fog .v1040CloudLayer{opacity:.18;filter:blur(5px)}.v1039Weather-fog .v1040CloudLayer.c2{opacity:.13;filter:blur(7px)}
@keyframes v1040CloudDriftA{from{background-position:0 0,86px 2px,174px 5px}to{background-position:280px 0,366px 2px,454px 5px}}
@keyframes v1040CloudDriftB{from{background-position:0 0,118px 0,244px 4px}to{background-position:-360px 0,-242px 0,-116px 4px}}

/* One unambiguous weather badge. The duplicate region/location chip is intentionally gone. */
.v1040WeatherBadge{position:absolute;z-index:9;left:13px;top:13px;display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:rgba(13,12,10,.60);border:1px solid rgba(214,182,119,.38);backdrop-filter:blur(6px);box-shadow:0 4px 15px #0003;color:#f0e4ca;font-size:10px;text-shadow:0 1px 2px #000}
.v1040WeatherBadge b{font-size:10px}

/* Location information lives in its own lower quarter instead of obscuring the landscape. */
.v1040LocationDetails{position:relative;z-index:10;min-height:0;padding:8px 13px 9px;background:linear-gradient(180deg,#17130f,#100e0b);box-shadow:inset 0 1px 0 rgba(255,255,255,.025);overflow:hidden}
.v1040Meta{display:flex;align-items:center;gap:7px;color:#a99677;font-size:6.5px;font-weight:800;letter-spacing:.14em;line-height:1}
.v1040Meta span+span:before{content:"•";margin-right:7px;color:#7f6846}
.v1040LocationLine{display:flex;align-items:center;gap:7px;margin-top:4px;min-width:0}
.v1040LocationIcon{font-size:21px;line-height:1;flex:0 0 auto}
.v1040LocationLine h2{font-family:Georgia,serif;color:#f1d496;font-size:20px;line-height:1;margin:0;text-shadow:0 1px 3px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v1040LocationDetails p{font-size:9.5px;line-height:1.28;color:#c4b9a4;margin:4px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* Retire V10.39's overlapping top chips/plaque if stale markup survives a hot reload. */
.v1040Vista .v1039VistaTop,.v1040Vista .v1039Plaque{display:none!important}

@media(min-width:700px){.v1040Vista{height:335px!important;grid-template-rows:minmax(0,3fr) minmax(82px,1fr)}.v1040LocationDetails{padding:10px 16px}.v1040LocationLine h2{font-size:24px}.v1040LocationDetails p{font-size:11px}.v1040WeatherBadge{left:16px;top:16px}}
@media(prefers-reduced-motion:reduce){.v1040CloudLayer{animation:none!important}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
