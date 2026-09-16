window.RF=window.RF||{};
RF.VERSION='10.39.0';
RF.BUILD={
  version:'10.39.0',
  title:'Living Vistas',
  built:'16 Sep 2026 • 03:30 BST',
  buildId:'20260916-0330-bst'
};
RF.V1039=RF.V1039||{};

/* Realmforge V10.39 — Living Vistas
   - Rebuilds the World location scene as a richer generated landscape.
   - Scenery is location-aware; sky/celestial lighting follows the exact game hour.
   - Weather receives stronger dedicated cloud, rain, storm and fog layers.
   - No external artwork is required, keeping the PWA light and fully dynamic.
*/

(()=>{
const V=RF.V1039;

V.migrate=function(s){if(!s)return s;s.version='10.39.0';s.v1039=s.v1039||{};return s};
const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){RF.V95.SCHEMA='10.39.0';const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s))}

V.theme={
  greenvale:'village',forest:'forest',river:'river',mine:'mine',crossroads:'road',ruins:'ruins',bandit_camp:'camp',
  mill:'mill',watchtower:'watch',deep_mine:'deepmine',crypt:'crypt',northroad:'mountain',ironridge:'fortress',quarry:'quarry',ember_cave:'ember',
  sunmeadow:'meadow',guildhall:'guild',marshroad:'marsh',reedmere:'reedmere',drowned_ruins:'drowned',mirewatch:'mirewatch'
};
V.weatherIcon=w=>({Clear:'☀️',Cloudy:'☁️',Rain:'🌧️',Storm:'⛈️',Fog:'🌫️'})[w]||'☀️';
V.pad=n=>String(Math.floor(n)).padStart(2,'0');
V.daypart=function(h){if(h<5)return'Night';if(h<8)return'Dawn';if(h<12)return'Morning';if(h<15)return'Midday';if(h<18)return'Afternoon';if(h<21)return'Dusk';return'Night'};
V.sky=function(hour){
  const stops=[
    [0,'#07111e','#19263a'],[4,'#0c1628','#303049'],[6,'#423247','#d37f5e'],[8,'#4f82a1','#b7ced1'],
    [12,'#39789d','#a9c9d6'],[16,'#4f8098','#d6c099'],[18,'#5b465c','#db7b57'],[20,'#27253d','#82505b'],[22,'#0d1828','#26324a'],[24,'#07111e','#19263a']
  ];
  let a=stops[0],b=stops[1];for(let i=0;i<stops.length-1;i++){if(hour>=stops[i][0]&&hour<=stops[i+1][0]){a=stops[i];b=stops[i+1];break}}
  const t=(hour-a[0])/Math.max(.001,b[0]-a[0]);
  const mix=(x,y,t)=>{const A=x.match(/\w\w/g).map(v=>parseInt(v,16)),B=y.match(/\w\w/g).map(v=>parseInt(v,16));return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
  return [mix(a[1],b[1],t),mix(a[2],b[2],t)];
};
V.celestial=function(hour){
  const day=hour>=6&&hour<18;
  let p=day?(hour-6)/12:((hour<6?hour+6:hour-18)/12);
  p=Math.max(0,Math.min(1,p));
  return {day,left:8+p*84,top:58-Math.sin(p*Math.PI)*45};
};
V.palette={
  village:['#395231','#1b2e20','#263b22'],forest:['#203923','#0e2317','#162919'],river:['#324d3b','#173223','#355d6c'],mine:['#44382b','#211b17','#2b241e'],road:['#465438','#263523','#433726'],ruins:['#354232','#1d2b20','#34342b'],camp:['#3e3f2d','#22281c','#3b2a1f'],mill:['#526238','#2e4228','#473923'],watch:['#405039','#223225','#31352a'],deepmine:['#292720','#151512','#201b17'],crypt:['#282b27','#111612','#24211d'],mountain:['#4a5260','#28313b','#322f2b'],fortress:['#373c42','#20252a','#30251f'],quarry:['#684b3b','#3d2f29','#4b3429'],ember:['#4b241b','#1f1513','#7d321f'],meadow:['#61713d','#334b28','#51402b'],guild:['#48593a','#26372a','#4c3824'],marsh:['#455345','#24362f','#3d493a'],reedmere:['#48564c','#253932','#35473e'],drowned:['#3e4c48','#1f302d','#394642'],mirewatch:['#465445','#25372e','#3b4536']
};

V.scenery=function(theme){
  const hills=`<div class="v1039Hills"><i></i><i></i><i></i></div>`;
  const trees=n=>`<div class="v1039Trees">${Array.from({length:n},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>`;
  const reeds=`<div class="v1039Reeds">${Array.from({length:16},(_,i)=>`<i style="--i:${i};--h:${26+(i%4)*7}px"></i>`).join('')}</div>`;
  if(theme==='village')return `${hills}<div class="v1039Village"><i class="house h1"></i><i class="house h2"></i><i class="house h3"></i><i class="spire"></i><i class="road"></i></div>${trees(5)}`;
  if(theme==='forest')return `${hills}${trees(13)}<div class="v1039Path"></div>`;
  if(theme==='river')return `${hills}${trees(5)}<div class="v1039Water"></div><div class="v1039Bank b1"></div><div class="v1039Bank b2"></div>`;
  if(theme==='mine')return `${hills}<div class="v1039MineMouth"><i></i></div>${trees(4)}<div class="v1039Track"></div>`;
  if(theme==='road')return `${hills}<div class="v1039CrossRoad"></div><div class="v1039Sign"><i></i><b></b></div>${trees(4)}`;
  if(theme==='ruins')return `${hills}${trees(6)}<div class="v1039Ruins"><i></i><i></i><i></i><i></i></div>`;
  if(theme==='camp')return `${hills}${trees(7)}<div class="v1039Camp"><i class="tent t1"></i><i class="tent t2"></i><i class="fire"></i></div>`;
  if(theme==='mill')return `${hills}<div class="v1039Mill"><i class="tower"></i><i class="blades"></i></div><div class="v1039Fields"></div>${trees(3)}`;
  if(theme==='watch')return `${hills}<div class="v1039Tower"><i></i><b></b></div>${trees(6)}`;
  if(theme==='deepmine')return `<div class="v1039Cave"><i></i></div><div class="v1039Crystals c1"></div><div class="v1039Crystals c2"></div>`;
  if(theme==='crypt')return `<div class="v1039Crypt"><i></i><b></b></div><div class="v1039Graves"><i></i><i></i><i></i></div>`;
  if(theme==='mountain')return `<div class="v1039Mountains"><i></i><i></i><i></i></div><div class="v1039MountainRoad"></div>`;
  if(theme==='fortress')return `<div class="v1039Mountains"><i></i><i></i><i></i></div><div class="v1039Fort"><i></i><i></i><b></b><em></em></div><div class="v1039ForgeGlow"></div>`;
  if(theme==='quarry')return `<div class="v1039Quarry"><i></i><i></i><i></i><b></b></div>`;
  if(theme==='ember')return `<div class="v1039EmberCave"><i></i><b></b></div><div class="v1039Lava l1"></div><div class="v1039Lava l2"></div><div class="v1039Embers"></div>`;
  if(theme==='meadow')return `${hills}<div class="v1039Fields meadow"></div><div class="v1039Wall"></div>${trees(3)}`;
  if(theme==='guild')return `${hills}<div class="v1039Guild"><i></i><b></b><em></em></div>${trees(4)}`;
  if(theme==='marsh')return `${hills}<div class="v1039MarshWater"></div>${reeds}<div class="v1039Causeway"></div>`;
  if(theme==='reedmere')return `${hills}<div class="v1039MarshWater"></div>${reeds}<div class="v1039Stilts"><i></i><i></i><i></i></div>`;
  if(theme==='drowned')return `${hills}<div class="v1039MarshWater"></div>${reeds}<div class="v1039DrownedRuins"><i></i><i></i><b></b></div>`;
  if(theme==='mirewatch')return `${hills}<div class="v1039MarshWater small"></div>${reeds}<div class="v1039Lodge"><i></i><b></b></div>${trees(3)}`;
  return hills+trees(5);
};

V.scene=function(s){
  const l=RF.DATA.locations[s.location],theme=V.theme[s.location]||'village',pal=V.palette[theme]||V.palette.village;
  const hour=(Number(s.minute)||0)/60%24,hm=`${V.pad(hour)}:${V.pad((Number(s.minute)||0)%60)}`,part=V.daypart(hour),sky=V.sky(hour),cel=V.celestial(hour),night=hour<6||hour>=19.5;
  const weather=String(s.weather||'Clear'),wc=weather.toLowerCase();
  return `<div class="v1039Vista v1039-${theme} v1039Weather-${wc} ${night?'v1039Night':'v1039Day'}" style="--sky1:${sky[0]};--sky2:${sky[1]};--land1:${pal[0]};--land2:${pal[1]};--ground:${pal[2]};--cel-left:${cel.left}%;--cel-top:${cel.top}%">
    <div class="v1039Sky" aria-hidden="true"><div class="v1039Stars"></div><div class="v1039Celestial ${cel.day?'sun':'moon'}"></div><div class="v1039Clouds c1"></div><div class="v1039Clouds c2"></div></div>
    <div class="v1039Scenery" aria-hidden="true">${V.scenery(theme)}</div>
    <div class="v1039WeatherFx" aria-hidden="true"><i></i><i></i><i></i></div><div class="v1039Shade" aria-hidden="true"></div>
    <div class="v1039VistaTop"><span class="v1039Chip">${l.region||'The Wilds'}</span><span class="v1039Chip weather">${V.weatherIcon(weather)} ${weather}</span></div>
    <div class="v1039Plaque"><div class="v1039PlaqueMeta"><span>DAY ${s.day}</span><span>${part.toUpperCase()}</span><span>${hm}</span></div><h2>${l.icon||'🗺️'} ${l.name}</h2><p>${l.desc||''}</p></div>
  </div>`;
};

// Replace only the original scene block, leaving every accumulated World system around it untouched.
V.replaceScene=function(html,replacement){
  const start=html.indexOf('<div class="scene');if(start<0)return html;
  const re=/<\/?div\b[^>]*>/g;re.lastIndex=start;let depth=0,m,end=-1;
  while((m=re.exec(html))){if(m[0].startsWith('</'))depth--;else depth++;if(depth===0){end=re.lastIndex;break}}
  return end>start?html.slice(0,start)+replacement+html.slice(end):html;
};
const worldBase=RF.UI.world.bind(RF.UI);
RF.UI.world=function(s){return V.replaceScene(worldBase(s),V.scene(s))};

const st=document.createElement('style');st.id='v1039-living-vistas-style';st.textContent=`
.v1039Vista{height:255px;position:relative;overflow:hidden;border-radius:20px;border:1px solid #5a4933;margin-bottom:14px;background:linear-gradient(180deg,var(--sky1) 0 54%,var(--land1) 55% 72%,var(--ground) 73%);box-shadow:inset 0 0 0 1px #ffffff0b,0 12px 28px #0005;isolation:isolate}
.v1039Sky,.v1039Scenery,.v1039WeatherFx,.v1039Shade{position:absolute;inset:0;pointer-events:none}.v1039Sky{z-index:0;background:linear-gradient(180deg,var(--sky1),var(--sky2) 57%,transparent 58%)}.v1039Scenery{z-index:2}.v1039WeatherFx{z-index:5;overflow:hidden}.v1039Shade{z-index:6;background:linear-gradient(180deg,transparent 35%,rgba(4,5,5,.08) 58%,rgba(4,4,4,.5) 100%),radial-gradient(ellipse at 50% 40%,transparent 28%,rgba(0,0,0,.18) 100%)}
.v1039Celestial{position:absolute;width:38px;height:38px;left:var(--cel-left);top:var(--cel-top);transform:translate(-50%,-50%);border-radius:50%;transition:left .8s linear,top .8s linear}.v1039Celestial.sun{background:#ffe7a0;box-shadow:0 0 18px #ffd87aaa,0 0 48px #ffc86155}.v1039Celestial.moon{background:#d8e1e4;box-shadow:0 0 16px #d6e4ec77}.v1039Celestial.moon:after{content:"";position:absolute;width:31px;height:31px;border-radius:50%;background:var(--sky1);left:10px;top:-3px;opacity:.82}
.v1039Stars{opacity:0;transition:opacity 1s}.v1039Night .v1039Stars{opacity:.95}.v1039Stars:before,.v1039Stars:after{content:"";position:absolute;width:2px;height:2px;background:#eef4ee;border-radius:50%;left:12%;top:16%;box-shadow:42px 19px #fff9,88px -4px #fff7,141px 22px #fff,191px -1px #fff8,236px 31px #fff9,302px 8px #fff7,357px 26px #fff,416px 3px #fff8,492px 30px #fff7,540px 7px #fff8,610px 24px #fff}.v1039Stars:after{left:6%;top:34%;opacity:.55;transform:scale(.7)}
.v1039Clouds{position:absolute;left:-18%;width:55%;height:55px;top:25px;opacity:.05;filter:blur(4px);background:radial-gradient(ellipse at 18% 65%,#eef1f0 0 19%,transparent 20%),radial-gradient(ellipse at 45% 42%,#eef1f0 0 25%,transparent 26%),radial-gradient(ellipse at 72% 64%,#eef1f0 0 20%,transparent 21%);animation:v1039Cloud 22s linear infinite}.v1039Clouds.c2{top:58px;left:35%;transform:scale(.72);animation-duration:31s;animation-direction:reverse}.v1039Weather-cloudy .v1039Clouds,.v1039Weather-rain .v1039Clouds{opacity:.42}.v1039Weather-storm .v1039Clouds{opacity:.62;filter:blur(5px) brightness(.62)}.v1039Weather-fog .v1039Clouds{opacity:.25}
.v1039Hills i{position:absolute;bottom:45px;width:72%;height:110px;border-radius:50% 50% 0 0;background:var(--land1);filter:saturate(.8)}.v1039Hills i:nth-child(1){left:-24%;bottom:52px;opacity:.72}.v1039Hills i:nth-child(2){left:18%;bottom:45px;background:var(--land2);opacity:.9}.v1039Hills i:nth-child(3){right:-32%;bottom:36px;background:var(--land1);opacity:.8}
.v1039Trees i{position:absolute;bottom:43px;left:calc(4% + (var(--i) * 7.4%));width:8px;height:41px;background:#172018;border-radius:4px 4px 0 0;filter:brightness(.72)}.v1039Trees i:before,.v1039Trees i:after{content:"";position:absolute;left:50%;transform:translateX(-50%);border-left:16px solid transparent;border-right:16px solid transparent;border-bottom:31px solid #1c3422;bottom:18px}.v1039Trees i:after{border-left-width:12px;border-right-width:12px;border-bottom-width:25px;border-bottom-color:#27442c;bottom:34px}.v1039Night .v1039Trees i{filter:brightness(.43)}
.v1039Village .house{position:absolute;bottom:43px;width:42px;height:29px;background:#6c553b;border-radius:2px;box-shadow:inset 0 0 0 1px #a7896238}.v1039Village .house:before{content:"";position:absolute;left:-5px;top:-16px;border-left:26px solid transparent;border-right:26px solid transparent;border-bottom:19px solid #49352a}.v1039Village .house:after{content:"";position:absolute;width:7px;height:10px;background:#f4c97999;left:9px;top:8px;box-shadow:17px 0 #f4c97977}.v1039Village .h1{left:16%}.v1039Village .h2{left:38%;transform:scale(.78);bottom:50px}.v1039Village .h3{right:16%;transform:scale(.9)}.v1039Village .spire{position:absolute;left:58%;bottom:44px;width:13px;height:58px;background:#3d312a}.v1039Village .spire:before{content:"";position:absolute;left:-6px;top:-17px;border-left:12px solid transparent;border-right:12px solid transparent;border-bottom:20px solid #2d2621}.v1039Village .road,.v1039Path,.v1039MountainRoad{position:absolute;bottom:-26px;left:42%;width:28%;height:100px;background:linear-gradient(90deg,transparent,#75614b99 20% 80%,transparent);transform:perspective(90px) rotateX(48deg);transform-origin:bottom}
.v1039Water,.v1039MarshWater{position:absolute;left:-5%;right:-5%;bottom:0;height:73px;background:linear-gradient(180deg,#466c79aa,#1b4658dd);box-shadow:inset 0 12px 25px #bde5ee18}.v1039Water:after,.v1039MarshWater:after{content:"";position:absolute;inset:8px 0;background:repeating-linear-gradient(180deg,transparent 0 9px,#d8f1ed18 10px 11px)}.v1039Bank{position:absolute;bottom:50px;width:56%;height:47px;border-radius:50%;background:#253b28}.v1039Bank.b1{left:-18%}.v1039Bank.b2{right:-20%;bottom:42px}
.v1039MineMouth,.v1039Cave,.v1039Crypt,.v1039EmberCave{position:absolute;left:31%;bottom:35px;width:38%;height:105px;border-radius:52% 52% 15% 15%;background:#25221d;box-shadow:0 0 0 18px #493f31,0 0 0 21px #2e2923}.v1039MineMouth i{position:absolute;inset:18px 19px 0;border-radius:50% 50% 0 0;background:#090a09}.v1039Track{position:absolute;bottom:-2px;left:43%;width:14%;height:63px;border-left:2px solid #604f3e;border-right:2px solid #604f3e}.v1039Track:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0 8px,#604f3e 9px 11px)}
.v1039CrossRoad{position:absolute;bottom:-10px;left:18%;right:18%;height:100px;background:linear-gradient(35deg,transparent 45%,#7b674eaa 46% 55%,transparent 56%),linear-gradient(-35deg,transparent 45%,#7b674e99 46% 55%,transparent 56%)}.v1039Sign{position:absolute;left:58%;bottom:56px;width:6px;height:55px;background:#453625}.v1039Sign:before,.v1039Sign:after{content:"";position:absolute;width:44px;height:10px;background:#594531;left:-18px}.v1039Sign:before{top:7px;transform:rotate(5deg)}.v1039Sign:after{top:21px;left:-28px;transform:rotate(-4deg)}
.v1039Ruins,.v1039DrownedRuins{position:absolute;left:29%;bottom:42px;width:44%;height:82px}.v1039Ruins i,.v1039DrownedRuins i{position:absolute;bottom:0;width:13px;background:#66675a}.v1039Ruins i:nth-child(1){left:4%;height:60px}.v1039Ruins i:nth-child(2){left:28%;height:82px}.v1039Ruins i:nth-child(3){right:27%;height:55px}.v1039Ruins i:nth-child(4){right:2%;height:72px}.v1039Ruins:after{content:"";position:absolute;left:17%;right:15%;top:18px;height:11px;background:#68695b;transform:rotate(-2deg)}
.v1039Camp .tent{position:absolute;bottom:42px;width:56px;height:36px;clip-path:polygon(50% 0,100% 100%,0 100%);background:#5a3928}.v1039Camp .t1{left:31%}.v1039Camp .t2{left:55%;transform:scale(.72)}.v1039Camp .fire{position:absolute;left:49%;bottom:42px;width:13px;height:18px;border-radius:60% 40% 55% 45%;background:#f08b37;box-shadow:0 0 17px #ff792e}
.v1039Mill .tower{position:absolute;left:49%;bottom:41px;width:26px;height:75px;background:#6a5a42;clip-path:polygon(18% 0,82% 0,100% 100%,0 100%)}.v1039Mill .blades{position:absolute;left:37.7%;bottom:84px;width:82px;height:7px;background:#3d352a;transform:rotate(35deg);transform-origin:center;box-shadow:0 0 0 0 #000}.v1039Mill .blades:after{content:"";position:absolute;left:37px;top:-37px;width:7px;height:82px;background:#3d352a}.v1039Fields,.v1039Fields.meadow{position:absolute;left:0;right:0;bottom:0;height:70px;background:repeating-linear-gradient(105deg,#6b6a3238 0 3px,transparent 4px 14px)}
.v1039Tower{position:absolute;left:49%;bottom:43px;width:30px;height:96px;background:#4b4131}.v1039Tower:before{content:"";position:absolute;left:-10px;top:-14px;width:50px;height:16px;background:#342e25;clip-path:polygon(12% 100%,0 0,100% 0,88% 100%)}.v1039Tower i{position:absolute;left:10px;top:18px;width:8px;height:15px;background:#f5c87566}
.v1039Cave{left:16%;width:68%;height:155px;bottom:0;border-radius:50% 50% 0 0;background:#121310;box-shadow:0 0 0 28px #2b2924}.v1039Cave i{position:absolute;inset:29px 45px 0;border-radius:50% 50% 0 0;background:#050606}.v1039Crystals{position:absolute;bottom:28px;width:11px;height:34px;background:#90bec799;clip-path:polygon(50% 0,100% 100%,0 100%);box-shadow:0 0 11px #8dd6e48a}.v1039Crystals.c1{left:29%}.v1039Crystals.c2{right:27%;transform:scale(.68)}
.v1039Crypt{left:28%;width:44%;height:96px;bottom:34px;border-radius:50% 50% 0 0;box-shadow:0 0 0 13px #414039}.v1039Crypt i{position:absolute;inset:22px 24px 0;background:#090b09;border-radius:50% 50% 0 0}.v1039Crypt b{position:absolute;left:48%;top:39%;width:6px;height:12px;background:#d8c28588}.v1039Graves i{position:absolute;bottom:39px;width:16px;height:28px;border-radius:8px 8px 2px 2px;background:#484942}.v1039Graves i:nth-child(1){left:17%}.v1039Graves i:nth-child(2){right:17%;height:22px}.v1039Graves i:nth-child(3){right:28%;transform:scale(.65)}
.v1039Mountains i{position:absolute;bottom:42px;width:0;height:0;border-left:115px solid transparent;border-right:115px solid transparent;border-bottom:145px solid #3a4148;filter:brightness(.8)}.v1039Mountains i:nth-child(1){left:-7%}.v1039Mountains i:nth-child(2){left:28%;transform:scale(.82);bottom:35px;border-bottom-color:#30363d}.v1039Mountains i:nth-child(3){right:-11%;transform:scale(1.12);border-bottom-color:#42474c}
.v1039Fort{position:absolute;left:36%;bottom:40px;width:31%;height:70px;background:#292a29}.v1039Fort i,.v1039Fort b{position:absolute;bottom:0;width:27px;height:98px;background:#262827}.v1039Fort i{left:-20px}.v1039Fort b{right:-20px}.v1039Fort:after{content:"";position:absolute;left:41%;bottom:0;width:25px;height:39px;background:#0c0d0c;border-radius:50% 50% 0 0}.v1039ForgeGlow{position:absolute;left:43%;bottom:38px;width:90px;height:35px;background:#d6502735;filter:blur(10px);box-shadow:0 0 25px #dc522b55}
.v1039Quarry i{position:absolute;left:9%;right:9%;height:28px;border-radius:50% 50% 0 0;background:#6d5143}.v1039Quarry i:nth-child(1){bottom:35px}.v1039Quarry i:nth-child(2){bottom:58px;left:17%;right:18%;background:#5b4439}.v1039Quarry i:nth-child(3){bottom:80px;left:27%;right:28%;background:#493832}.v1039Quarry b{position:absolute;left:48%;bottom:36px;width:4px;height:85px;background:#29251f;transform:rotate(13deg)}
.v1039EmberCave{left:8%;width:84%;height:190px;bottom:-28px;background:#17110f;box-shadow:0 0 0 31px #35211b}.v1039Lava{position:absolute;bottom:12px;height:8px;border-radius:99px;background:#e35829;box-shadow:0 0 17px #ff602e}.v1039Lava.l1{left:18%;width:31%}.v1039Lava.l2{right:16%;width:22%}.v1039Embers:before{content:"✦  ·  ✦   ·  ✦";position:absolute;left:36%;bottom:54px;color:#f2773d;letter-spacing:12px;text-shadow:0 0 9px #f45b32}
.v1039Wall{position:absolute;left:9%;right:7%;bottom:42px;height:9px;background:repeating-linear-gradient(90deg,#6b6453 0 15px,#514b3f 16px 18px);transform:rotate(-2deg)}
.v1039Guild{position:absolute;left:34%;bottom:42px;width:34%;height:63px;background:#5b4933}.v1039Guild:before{content:"";position:absolute;left:-7px;right:-7px;top:-25px;border-left:48px solid transparent;border-right:48px solid transparent;border-bottom:30px solid #3b2c24}.v1039Guild i{position:absolute;left:43%;bottom:0;width:17px;height:31px;background:#201b16}.v1039Guild b{position:absolute;left:9px;top:17px;width:10px;height:12px;background:#f1c87577;box-shadow:75px 0 #f1c87566}
.v1039MarshWater{height:67px;background:linear-gradient(180deg,#4c6762aa,#263f3add)}.v1039MarshWater.small{height:52px}.v1039Reeds i{position:absolute;bottom:31px;left:calc(2% + var(--i)*6.3%);width:2px;height:var(--h);background:#5f6d42;transform:rotate(calc((var(--i)%3 - 1)*5deg));transform-origin:bottom}.v1039Reeds i:after{content:"";position:absolute;top:-2px;left:-2px;width:6px;height:11px;border-radius:60% 40%;background:#3d4228}.v1039Causeway{position:absolute;left:34%;bottom:-9px;width:34%;height:100px;background:repeating-linear-gradient(180deg,#705842 0 9px,#493b2e 10px 13px);transform:perspective(120px) rotateX(52deg);transform-origin:bottom}.v1039Stilts i{position:absolute;bottom:44px;width:58px;height:37px;background:#584939;box-shadow:0 14px 0 -5px #2d2b24}.v1039Stilts i:before{content:"";position:absolute;left:-5px;right:-5px;top:-18px;border-left:34px solid transparent;border-right:34px solid transparent;border-bottom:22px solid #38342b}.v1039Stilts i:nth-child(1){left:20%}.v1039Stilts i:nth-child(2){left:46%;transform:scale(.82);bottom:50px}.v1039Stilts i:nth-child(3){right:12%;transform:scale(.67);bottom:54px}.v1039DrownedRuins{bottom:28px}.v1039DrownedRuins i:nth-child(1){left:15%;height:75px}.v1039DrownedRuins i:nth-child(2){right:18%;height:58px}.v1039DrownedRuins b{position:absolute;left:31%;top:16px;width:70px;height:13px;background:#555e56;transform:rotate(-5deg)}.v1039Lodge{position:absolute;left:36%;bottom:47px;width:110px;height:55px;background:#514638}.v1039Lodge:before{content:"";position:absolute;left:-9px;right:-9px;top:-25px;border-left:64px solid transparent;border-right:64px solid transparent;border-bottom:31px solid #333129}.v1039Lodge i{position:absolute;left:50%;bottom:0;width:20px;height:34px;background:#231e19}.v1039Lodge b{position:absolute;left:14px;top:16px;width:12px;height:12px;background:#f1bb6277;box-shadow:69px 0 #f1bb6277}
.v1039VistaTop{position:absolute;z-index:8;left:12px;right:12px;top:12px;display:flex;justify-content:space-between;gap:8px}.v1039Chip{font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#efe1c3;background:rgba(13,12,10,.58);border:1px solid rgba(214,182,119,.35);backdrop-filter:blur(5px);border-radius:999px;padding:6px 9px;text-shadow:0 1px 2px #000}.v1039Chip.weather{text-transform:none;letter-spacing:0;font-size:10px}
.v1039Plaque{position:absolute;z-index:9;left:12px;right:12px;bottom:11px;padding:11px 13px 12px;border-radius:15px;background:linear-gradient(180deg,rgba(12,12,10,.7),rgba(9,9,8,.86));border:1px solid rgba(204,166,99,.34);backdrop-filter:blur(6px);box-shadow:0 10px 28px #0005}.v1039PlaqueMeta{display:flex;gap:8px;color:#b5a588;font-size:7px;font-weight:800;letter-spacing:.13em}.v1039PlaqueMeta span+span:before{content:"•";margin-right:8px;color:#8e7652}.v1039Plaque h2{font-family:Georgia,serif;color:#f1d496;font-size:21px;line-height:1.05;margin:4px 0 4px;text-shadow:0 2px 4px #000}.v1039Plaque p{font-size:10px;line-height:1.35;color:#c7bca8;margin:0;max-width:92%}
.v1039Weather-rain .v1039WeatherFx i,.v1039Weather-storm .v1039WeatherFx i{position:absolute;inset:-55px -30px;background:repeating-linear-gradient(105deg,transparent 0 19px,rgba(205,230,240,.26) 20px 21px,transparent 22px 39px);animation:v1039Rain .58s linear infinite}.v1039Weather-rain .v1039WeatherFx i:nth-child(2),.v1039Weather-storm .v1039WeatherFx i:nth-child(2){opacity:.55;animation-duration:.82s;transform:translateX(23px)}.v1039Weather-rain .v1039WeatherFx i:nth-child(3),.v1039Weather-storm .v1039WeatherFx i:nth-child(3){opacity:.33;animation-duration:1.05s;transform:translateX(-17px)}.v1039Weather-fog .v1039WeatherFx:before,.v1039Weather-fog .v1039WeatherFx:after{content:"";position:absolute;left:-20%;right:-20%;height:54px;background:linear-gradient(180deg,transparent,rgba(226,233,228,.2),transparent);filter:blur(8px);animation:v1039Fog 9s ease-in-out infinite alternate}.v1039Weather-fog .v1039WeatherFx:before{top:58px}.v1039Weather-fog .v1039WeatherFx:after{top:116px;animation-direction:alternate-reverse;opacity:.7}.v1039Weather-storm .v1039WeatherFx{animation:v1039Lightning 8s steps(1,end) infinite}.v1039Weather-storm{filter:saturate(.75) brightness(.82)}.v1039Weather-rain{filter:saturate(.83) brightness(.9)}.v1039Weather-cloudy{filter:saturate(.86) brightness(.94)}.v1039Weather-fog{filter:saturate(.67) contrast(.9) brightness(1.04)}
@keyframes v1039Cloud{from{transform:translateX(0)}to{transform:translateX(155%)}}@keyframes v1039Rain{to{transform:translate(-25px,55px)}}@keyframes v1039Fog{from{transform:translateX(-4%)}to{transform:translateX(6%)}}@keyframes v1039Lightning{0%,91%,94%,100%{box-shadow:inset 0 0 0 rgba(255,255,255,0)}92%{box-shadow:inset 0 0 160px rgba(223,235,255,.28)}93%{box-shadow:inset 0 0 90px rgba(223,235,255,.08)}}
@media(min-width:700px){.v1039Vista{height:310px}.v1039Plaque h2{font-size:26px}.v1039Plaque p{font-size:12px}}
@media(prefers-reduced-motion:reduce){.v1039Clouds,.v1039WeatherFx,.v1039WeatherFx:before,.v1039WeatherFx:after{animation:none!important}}
`;
document.head.appendChild(st);

if(RF.state){V.migrate(RF.state);RF.save?.(RF.state);setTimeout(()=>{if(RF.state&&!RF.V101?.mainMenu)RF.UI.render(RF.state)},0)}
})();
