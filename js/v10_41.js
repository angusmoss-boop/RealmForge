window.RF=window.RF||{};
RF.VERSION='10.41.0';
RF.BUILD={version:'10.41.0',title:'Rainfall & Type Polish',built:'16 Sep 2026 • 03:50 BST',buildId:'20260916-0350-bst'};
RF.V1041=RF.V1041||{};
(()=>{
const V=RF.V1041;
V.migrate=function(s){if(!s)return s;s.version='10.41.0';s.v1041=s.v1041||{};return s};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){RF.V95.SCHEMA='10.41.0';const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s))}
const st=document.createElement('style');st.id='v1041-rain-type-polish';st.textContent=`
/* Give serif descenders (g, y, p, q, j) real breathing room. */
.v1040LocationLine{margin-top:5px!important;min-height:28px!important;align-items:center!important;overflow:visible!important}
.v1040LocationLine h2{line-height:1.18!important;padding:0 0 3px!important;overflow:hidden!important;text-overflow:ellipsis!important}
.v1040LocationIcon{align-self:center!important}
.v1040LocationDetails{overflow:visible!important;padding-bottom:10px!important}

/* V10.41 rain: short, fast streaks rather than scene-spanning rails. */
.v1039Weather-rain .v1039WeatherFx i,.v1039Weather-storm .v1039WeatherFx i{inset:0!important;background:none!important;animation:none!important;opacity:1!important;transform:none!important;overflow:hidden!important}
.v1039Weather-rain .v1039WeatherFx i:before,.v1039Weather-storm .v1039WeatherFx i:before{content:"";position:absolute;inset:-45% -25%;background-image:repeating-linear-gradient(108deg,transparent 0 30px,rgba(211,233,242,.34) 31px 32px,transparent 33px 64px);background-size:64px 22px;mask-image:repeating-linear-gradient(to bottom,#000 0 11px,transparent 11px 22px);-webkit-mask-image:repeating-linear-gradient(to bottom,#000 0 11px,transparent 11px 22px);animation:v1041RainShoot .48s linear infinite;will-change:transform}
.v1039Weather-rain .v1039WeatherFx i:nth-child(2):before,.v1039Weather-storm .v1039WeatherFx i:nth-child(2):before{opacity:.58;background-size:78px 27px;animation-duration:.62s;animation-delay:-.21s;transform:translateX(19px)}
.v1039Weather-rain .v1039WeatherFx i:nth-child(3):before,.v1039Weather-storm .v1039WeatherFx i:nth-child(3):before{opacity:.35;background-size:92px 31px;animation-duration:.78s;animation-delay:-.39s;transform:translateX(-24px)}
.v1039Weather-storm .v1039WeatherFx i:before{background-image:repeating-linear-gradient(108deg,transparent 0 27px,rgba(218,239,248,.45) 28px 30px,transparent 31px 59px)}
@keyframes v1041RainShoot{from{transform:translate3d(-18px,-28px,0)}to{transform:translate3d(18px,44px,0)}}
@media(prefers-reduced-motion:reduce){.v1039Weather-rain .v1039WeatherFx i:before,.v1039Weather-storm .v1039WeatherFx i:before{animation:none!important}}
`;
document.head.appendChild(st);
if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
