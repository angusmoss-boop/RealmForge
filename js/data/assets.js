/* Realmforge V11.30.0 — canonical asset registry for V12+ web/Android content. */
(() => {
  'use strict';
  const RF=window.RF;
  const defs=new Map();
  const validId=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9_.-]*$/.test(id);
  const validTypes=new Set(['image','audio','music','video','font','data']);
  const api={
    define(id,record,{replace=false}={}){
      if(!validId(id))throw new Error(`Invalid Realmforge asset id: ${id}`);
      if(!record||typeof record!=='object'||Array.isArray(record))throw new Error(`Asset ${id} must be an object.`);
      if(!validTypes.has(record.type))throw new Error(`Asset ${id} has unsupported type ${record.type}.`);
      if(typeof record.src!=='string'||!record.src.trim())throw new Error(`Asset ${id} must define a non-empty src.`);
      if(!replace&&defs.has(id))throw new Error(`Asset ${id} already exists.`);
      const value=Object.freeze({...record,id}); defs.set(id,value); return value;
    },
    get:id=>defs.get(id)||null,
    has:id=>defs.has(id),
    ids:()=>Array.from(defs.keys()),
    list:()=>Array.from(defs.values()),
    count:()=>defs.size,
    url(id){const x=defs.get(id);if(!x)throw new Error(`Unknown Realmforge asset: ${id}`);return x.src;},
    validate(){
      const issues=[];
      for(const [id,x] of defs){
        if(!validId(id))issues.push({severity:'error',code:'invalid-asset-id',path:`assets.${id}`,message:`Invalid asset id ${id}`});
        if(!validTypes.has(x.type))issues.push({severity:'error',code:'invalid-asset-type',path:`assets.${id}`,message:`Asset ${id} has unsupported type ${x.type}`});
        if(typeof x.src!=='string'||!x.src.trim())issues.push({severity:'error',code:'missing-asset-src',path:`assets.${id}`,message:`Asset ${id} has no source path`});
      }
      return issues;
    }
  };
  RF.Assets=RF.Modules.register('data.assets',api,{owner:'data',status:'canonical',purpose:'asset-registry'});
})();
