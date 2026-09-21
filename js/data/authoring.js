/* Realmforge V11.30.0 — canonical content authoring and validation surface. */
(() => {
  'use strict';
  const RF=window.RF;
  const isRecord=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const validId=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9_]*$/.test(id);
  const issue=(severity,code,path,message)=>({severity,code,path,message});
  const table=name=>(RF.DATA&&RF.DATA[name])||{};
  const requiredNames=new Set(['items','enemies','locations','recipes','quests','skills','npcs','perks']);
  const specs=Object.freeze({
    items:{label:'item'},enemies:{label:'enemy'},locations:{label:'location'},recipes:{label:'recipe'},quests:{label:'quest'},skills:{label:'skill'},npcs:{label:'npc'},perks:{label:'perk'}
  });

  function validateRecord(type,id,value){
    const issues=[]; const path=`${type}.${id}`;
    if(!validId(id))issues.push(issue('error','invalid-id',path,`Invalid ${type} id: ${id}`));
    if(!isRecord(value)){issues.push(issue('error','invalid-record',path,`${path} must be an object.`));return issues;}
    if(requiredNames.has(type)&&typeof value.name!=='string')issues.push(issue('error','missing-name',path,`${path} is missing a string name.`));
    if(type==='items'&&typeof value.type!=='string')issues.push(issue('error','missing-type',path,`${path} is missing item type.`));
    if(type==='enemies'){
      if(!Number.isFinite(value.hp)||value.hp<=0)issues.push(issue('error','invalid-hp',path,`${path} must define positive hp.`));
      if(!Array.isArray(value.damage)||value.damage.length!==2)issues.push(issue('error','invalid-damage',path,`${path} must define [min,max] damage.`));
    }
    if(type==='locations'&&value.neighbors!=null&&!isRecord(value.neighbors))issues.push(issue('error','invalid-neighbors',path,`${path}.neighbors must be an object.`));
    if(type==='recipes'&&(!isRecord(value.inputs)||!isRecord(value.outputs)))issues.push(issue('error','invalid-recipe-io',path,`${path} must define inputs and outputs objects.`));
    if(type==='quests'&&value.objectives!=null&&!Array.isArray(value.objectives))issues.push(issue('error','invalid-objectives',path,`${path}.objectives must be an array.`));
    return issues;
  }

  function validateCatalog(){
    const issues=[];
    for(const type of Object.keys(specs)){
      const records=table(type);
      if(!isRecord(records)){issues.push(issue('error','invalid-catalog',type,`${type} catalog must be an object.`));continue;}
      for(const [id,value] of Object.entries(records))issues.push(...validateRecord(type,id,value));
    }
    const items=table('items'), enemies=table('enemies'), locations=table('locations'), recipes=table('recipes'), quests=table('quests'), skills=table('skills'), npcs=table('npcs'), perks=table('perks');
    const ref=(exists,code,path,target,label)=>{if(target&&!exists[target])issues.push(issue('error',code,path,`${path} references missing ${label} ${target}`));};
    for(const [id,e] of Object.entries(enemies))for(const d of (e.drops||[]))if(Array.isArray(d))ref(items,'missing-item-ref',`enemies.${id}.drops`,d[0],'item');
    for(const [id,r] of Object.entries(recipes)){
      for(const x of Object.keys(r.inputs||{}))ref(items,'missing-item-ref',`recipes.${id}.inputs`,x,'item');
      for(const x of Object.keys(r.outputs||{}))ref(items,'missing-item-ref',`recipes.${id}.outputs`,x,'item');
      ref(skills,'missing-skill-ref',`recipes.${id}.skill`,r.skill,'skill');
    }
    for(const [id,l] of Object.entries(locations))for(const n of Object.keys(l.neighbors||{}))ref(locations,'missing-location-ref',`locations.${id}.neighbors`,n,'location');
    for(const [id,n] of Object.entries(npcs)){
      ref(locations,'missing-location-ref',`npcs.${id}.home`,n.home,'location');
      for(const row of (n.schedule||[]))if(Array.isArray(row))ref(locations,'missing-location-ref',`npcs.${id}.schedule`,row[0],'location');
    }
    for(const [id,p] of Object.entries(perks))for(const r of (p.requires||[]))ref(perks,'missing-perk-ref',`perks.${id}.requires`,r,'perk');
    for(const [id,q] of Object.entries(quests)){
      ref(quests,'missing-quest-ref',`quests.${id}.next`,q.next,'quest');
      for(const o of (q.objectives||[])){
        if(!o||!o.target)continue;
        if(o.type==='visit')ref(locations,'missing-location-ref',`quests.${id}.objectives`,o.target,'location');
        if(o.type==='kill')ref(enemies,'missing-enemy-ref',`quests.${id}.objectives`,o.target,'enemy');
        if(o.type==='item')ref(items,'missing-item-ref',`quests.${id}.objectives`,o.target,'item');
        if(o.type==='skill')ref(skills,'missing-skill-ref',`quests.${id}.objectives`,o.target,'skill');
      }
    }
    for(const id of (RF.DATA?.shopStock||[]))ref(items,'missing-item-ref','shopStock',id,'item');
    for(const [i,e] of (RF.DATA?.events||[]).entries())for(const loc of (e?.locations||[]))ref(locations,'missing-location-ref',`events[${i}].locations`,loc,'location');
    return issues;
  }

  function validateConfig(){
    const issues=[]; const C=RF.Config;
    if(!C)return [issue('error','missing-config-registry','RF.Config','RF.Config is not available.')];
    const items=table('items'), enemies=table('enemies'), locations=table('locations');
    const ref=(exists,code,path,target,label)=>{if(target&&!exists[target])issues.push(issue('error',code,path,`${path} references missing ${label} ${target}`));};
    const markets=C.get('commerce.markets')||{};
    for(const [loc,m] of Object.entries(markets)){ref(locations,'missing-location-ref',`commerce.markets.${loc}`,loc,'location');for(const row of (m.stock||[]))if(Array.isArray(row))ref(items,'missing-item-ref',`commerce.markets.${loc}.stock`,row[0],'item');}
    const ecosystems=C.get('world.ecosystems')||{};
    for(const [loc,rows] of Object.entries(ecosystems)){ref(locations,'missing-location-ref',`world.ecosystems.${loc}`,loc,'location');if(rows.length!==8)issues.push(issue('error','ecosystem-size',`world.ecosystems.${loc}`,`Expected 8 ecosystem species, found ${rows.length}.`));for(const row of rows)if(Array.isArray(row))ref(enemies,'missing-enemy-ref',`world.ecosystems.${loc}`,row[0],'enemy');}
    for(const [loc] of Object.entries(C.get('services.banks')||{}))ref(locations,'missing-location-ref',`services.banks.${loc}`,loc,'location');
    for(const loc of (C.get('services.innLocations')||[]))ref(locations,'missing-location-ref','services.innLocations',loc,'location');
    for(const site of (C.get('crime.greenvaleBurglarySites')||[]))for(const id of (site.items||[]))ref(items,'missing-item-ref',`crime.greenvaleBurglarySites.${site.id}`,id,'item');
    for(const id of Object.keys(C.get('equipment.statBalance')||{}))ref(items,'missing-item-ref','equipment.statBalance',id,'item');
    for(const [loc,rows] of Object.entries(C.get('exploration.extraEnemies')||{})){ref(locations,'missing-location-ref',`exploration.extraEnemies.${loc}`,loc,'location');for(const row of rows)if(Array.isArray(row))ref(enemies,'missing-enemy-ref',`exploration.extraEnemies.${loc}`,row[0],'enemy');}
    for(const [loc,ids] of Object.entries(C.get('exploration.localExtras')||{})){ref(locations,'missing-location-ref',`exploration.localExtras.${loc}`,loc,'location');for(const id of ids)ref(items,'missing-item-ref',`exploration.localExtras.${loc}`,id,'item');}
    for(const pool of Object.values(C.get('exploration.gearPools')||{}))for(const ids of Object.values(pool||{}))for(const id of ids||[])ref(items,'missing-item-ref','exploration.gearPools',id,'item');
    const liveDungeons=RF.Systems?.Dungeons?.definitions?.()||RF.V1062?.DUNGEONS||{};
    for(const [loc,d] of Object.entries(liveDungeons)){ref(locations,'missing-location-ref',`dungeons.${loc}`,loc,'location');ref(enemies,'missing-enemy-ref',`dungeons.${loc}.boss`,d.boss,'enemy');for(const id of (d.rewards||[]))ref(items,'missing-item-ref',`dungeons.${loc}.rewards`,id,'item');for(const row of (d.materials||[]))if(Array.isArray(row))ref(items,'missing-item-ref',`dungeons.${loc}.materials`,row[0],'item');}
    for(const [id] of (C.get('dungeons.v114EntitySpecs')||[]))ref(enemies,'missing-enemy-ref','dungeons.v114EntitySpecs',id,'enemy');
    for(const [id] of (C.get('dungeons.v114GearSpecs')||[]))ref(items,'missing-item-ref','dungeons.v114GearSpecs',id,'item');
    return issues;
  }

  function validateAssets(){return RF.Assets?.validate?.()||[];}

  function validateAssetReferences(){
    const issues=[]; const A=RF.Assets; if(!A)return issues;
    const fields=['asset','image','portrait','music','audio','sound','sprite','iconAsset','backgroundAsset'];
    for(const type of Object.keys(specs))for(const [id,value] of Object.entries(table(type))){
      if(!isRecord(value))continue;
      for(const field of fields){
        const target=value[field];
        if(typeof target==='string'&&target&&!A.has(target))issues.push(issue('error','missing-asset-ref',`${type}.${id}.${field}`,`${type}.${id}.${field} references missing asset ${target}`));
      }
    }
    return issues;
  }

  function report(){
    const issues=[...validateCatalog(),...validateConfig(),...validateAssets(),...validateAssetReferences()];
    const errors=issues.filter(x=>x.severity==='error'), warnings=issues.filter(x=>x.severity==='warning');
    return {valid:errors.length===0,issues,errors,warnings,catalogSummary:RF.Catalog?.summary?.()||{},configDefinitions:RF.Config?.size?.()||0,assetDefinitions:RF.Assets?.count?.()||0};
  }
  function assertClean(){const r=report();if(!r.valid)throw new Error(`Realmforge content validation failed:\n${r.errors.map(x=>`- ${x.message}`).join('\n')}`);return r;}
  function register(type,id,value,options={}){const bad=validateRecord(type,id,value).filter(x=>x.severity==='error');if(bad.length)throw new Error(bad.map(x=>x.message).join(' '));return RF.Catalog.register(type,id,value,options);}
  function registerMany(type,records,options={}){for(const [id,value] of Object.entries(records||{}))register(type,id,value,options);return RF.Catalog.table(type);}
  function defineConfig(name,value,meta={}){if(typeof name!=='string'||!name.includes('.'))throw new Error('Realmforge config names must be dotted strings, e.g. commerce.markets.');return RF.Config.define(name,value,meta);}
  function defineAsset(id,value,options={}){return RF.Assets.define(id,value,options);}
  function registerPack(pack,{replace=false,assertValid=true}={}){
    if(!isRecord(pack))throw new Error('Realmforge content pack must be an object.');
    for(const type of Object.keys(specs))if(pack[type])registerMany(type,pack[type],{replace});
    for(const [name,value] of Object.entries(pack.config||{}))defineConfig(name,value,{source:'content-pack'});
    for(const [id,value] of Object.entries(pack.assets||{}))defineAsset(id,value);
    return assertValid?assertClean():report();
  }

  const api={specs,validateRecord,validateCatalog,validateConfig,validateAssets,validateAssetReferences,report,assertClean,register,registerMany,defineConfig,defineAsset,registerPack,
    item:(id,v,o)=>register('items',id,v,o),enemy:(id,v,o)=>register('enemies',id,v,o),location:(id,v,o)=>register('locations',id,v,o),recipe:(id,v,o)=>register('recipes',id,v,o),quest:(id,v,o)=>register('quests',id,v,o),skill:(id,v,o)=>register('skills',id,v,o),npc:(id,v,o)=>register('npcs',id,v,o),perk:(id,v,o)=>register('perks',id,v,o),asset:(id,v,o)=>defineAsset(id,v,o)};
  RF.Authoring=RF.Modules.register('data.authoring',api,{owner:'data',status:'canonical',purpose:'content-authoring'});
})();
