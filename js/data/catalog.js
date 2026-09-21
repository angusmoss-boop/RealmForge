/* Realmforge V11.29.0 — canonical content catalog. Future content registers here or through RF.Authoring. */
(() => {
  'use strict';
  const RF=window.RF;
  const table=name => (RF.DATA && RF.DATA[name]) || {};
  const hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const api={
    table,
    get(type,id){return table(type)[id]??null;},
    entries(type){return Object.entries(table(type));},
    values(type){return Object.values(table(type));},
    ids(type){return Object.keys(table(type));},
    count(type){const v=table(type);return Array.isArray(v)?v.length:Object.keys(v).length;},
    has(type,id){return hasOwn(table(type),id);},
    register(type,id,value,{replace=false}={}){
      RF.DATA=RF.DATA||{}; RF.DATA[type]=RF.DATA[type]||{};
      if(Array.isArray(RF.DATA[type])) throw new Error(`Use append() for array catalog ${type}.`);
      if(!replace&&hasOwn(RF.DATA[type],id))throw new Error(`${type}.${id} already exists.`);
      RF.DATA[type][id]=value; return value;
    },
    registerMany(type,records,options){Object.entries(records||{}).forEach(([id,v])=>api.register(type,id,v,options));return table(type);},
    append(type,...records){RF.DATA=RF.DATA||{};RF.DATA[type]=RF.DATA[type]||[];if(!Array.isArray(RF.DATA[type]))throw new Error(`${type} is not an array catalog.`);RF.DATA[type].push(...records);return RF.DATA[type];},
    item:id=>table('items')[id]||null, enemy:id=>table('enemies')[id]||null, location:id=>table('locations')[id]||null,
    skill:id=>table('skills')[id]||null, quest:id=>table('quests')[id]||null, recipe:id=>table('recipes')[id]||null,
    summary(){const out={};for(const k of Object.keys(RF.DATA||{})){const v=RF.DATA[k];out[k]=Array.isArray(v)?v.length:(v&&typeof v==='object'?Object.keys(v).length:0);}return out;},
    validate(){
      if(RF.Authoring?.validateCatalog)return RF.Authoring.validateCatalog().filter(x=>x.severity==='error').map(x=>x.message);
      const issues=[]; const items=table('items'),locs=table('locations'),enemies=table('enemies'),recipes=table('recipes');
      for(const [id,e] of Object.entries(enemies))for(const d of (e.drops||[])){if(d?.[0]&&!items[d[0]])issues.push(`enemy ${id} drops missing item ${d[0]}`);}
      for(const [id,r] of Object.entries(recipes)){for(const x of Object.keys(r.inputs||{}))if(!items[x])issues.push(`recipe ${id} needs missing item ${x}`);for(const x of Object.keys(r.outputs||{}))if(!items[x])issues.push(`recipe ${id} outputs missing item ${x}`);}
      for(const [id,l] of Object.entries(locs))for(const n of Object.keys(l.neighbors||{}))if(!locs[n])issues.push(`location ${id} links missing location ${n}`);
      return issues;
    },
    validateDetailed(){return RF.Authoring?.validateCatalog?.()||api.validate().map(message=>({severity:'error',code:'legacy-validation',path:'catalog',message}));}
  };
  RF.Catalog=RF.Modules.register('data.catalog',api,{owner:'data',status:'canonical'});
})();
