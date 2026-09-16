window.RF=window.RF||{};
RF.VERSION='10.41.0';
RF.BUILD={
  version:'10.41.0',
  title:'Rainline',
  built:'16 Sep 2026 • 21:35 BST',
  buildId:'20260916-2135-bst'
};
RF.V1041=RF.V1041||{};

/* Realmforge V10.41 — Rainline
   - Gives the V10.40 location-information strip a little more breathing room so descenders do not clip.
   - Rebuilds rain into slower, shorter diagonal drops that read more like real rainfall.
   - Preserves the rest of the V10.40 Vista Composition presentation unchanged.
*/

(()=>{
'use strict';
const V=RF.V1041;
V.version='10.41.0';

V.migrate=function(s){
  if(!s)return s;
  s.version='10.41.0';
  s.v1041=s.v1041||{};
  return s;
};

const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){RF.V95.SCHEMA='10.41.0';const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s))}

const oldStyle=document.getElementById('v1041-rainline-style');
if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1041-rainline-style';
st.textContent=`
/* Keep the same overall composition feel as V10.40, but give the lower details strip
   a touch more room so letters like g, y and p can sit comfortably. */
.v1040Vista{height:298px!important;grid-template-rows:minmax(0,72fr) minmax(86px,28fr)!important}
.v1040LocationDetails{padding:10px 13px 11px!important;overflow:visible!important}
.v1040Meta{margin-bottom:1px!important}
.v1040LocationLine{margin-top:5px!important;min-height:29px;overflow:visible!important}
.v1040LocationLine h2{line-height:1.16!important;padding:1px 0 4px!important;overflow:visible!important;text-overflow:clip!important}
.v1040LocationDetails p{margin-top:3px!important}

/* Replace the old screen-spanning rain streaks with repeated short drops.
   The pattern travels down and right-to-left to preserve the existing diagonal motion,
   but at a slower speed so storms feel more natural. */
.v1039Weather-rain .v1039WeatherFx i,.v1039Weather-storm .v1039WeatherFx i{
  position:absolute!important;
  inset:-28px -42px!important;
  transform:none!important;
  background:transparent!important;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='32' viewBox='0 0 42 32'%3E%3Cpath d='M34 3 L27 14' fill='none' stroke='%23d6ebf3' stroke-opacity='.50' stroke-width='1.15' stroke-linecap='round'/%3E%3C/svg%3E")!important;
  background-size:42px 32px!important;
  background-repeat:repeat!important;
  animation:v1041Rainline 1.95s linear infinite!important;
  will-change:background-position;
}
.v1039Weather-rain .v1039WeatherFx i:nth-child(2),.v1039Weather-storm .v1039WeatherFx i:nth-child(2){opacity:.5!important;animation-duration:2.35s!important;background-position:12px 7px!important}
.v1039Weather-rain .v1039WeatherFx i:nth-child(3),.v1039Weather-storm .v1039WeatherFx i:nth-child(3){opacity:.3!important;animation-duration:2.8s!important;background-position:24px 15px!important}
.v1039Weather-storm .v1039WeatherFx i:first-child{opacity:.9!important}
@keyframes v1041Rainline{from{background-position:0 0}to{background-position:-84px 64px}}

@media(min-width:700px){
  .v1040Vista{height:348px!important;grid-template-rows:minmax(0,72fr) minmax(96px,28fr)!important}
  .v1040LocationDetails{padding:11px 16px 12px!important}
  .v1040LocationLine h2{line-height:1.17!important;padding-bottom:5px!important}
}
@media(prefers-reduced-motion:reduce){
  .v1039Weather-rain .v1039WeatherFx i,.v1039Weather-storm .v1039WeatherFx i{animation:none!important}
}
`;
document.head.appendChild(st);

if(RF.state){
  V.migrate(RF.state);
  RF.save?.(RF.state);
  setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0);
}
})();
