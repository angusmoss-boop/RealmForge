/* Realmforge V11.10.0 — canonical static configuration registry. */
(() => {
  'use strict';
  const RF=window.RF;
  const defs=new Map();
  const cloneValue=v=>{
    if(Array.isArray(v))return v.map(cloneValue);
    if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=cloneValue(x);return o;}
    return v;
  };
  const deepFreeze=v=>{
    if(!v||typeof v!=='object'||Object.isFrozen(v))return v;
    Object.freeze(v);for(const x of Object.values(v))deepFreeze(x);return v;
  };
  const api={
    define(name,value,meta={}){if(defs.has(name))throw new Error(`Duplicate Realmforge config: ${name}`);defs.set(name,{value:deepFreeze(value),meta:{...meta}});return value;},
    get(name){return defs.get(name)?.value??null;},
    clone(name){const d=defs.get(name);if(!d)throw new Error(`Missing Realmforge config: ${name}`);return cloneValue(d.value);},
    has:name=>defs.has(name),
    keys:()=>Array.from(defs.keys()),
    entries:()=>Array.from(defs.entries()).map(([name,d])=>({name,...d.meta})),
    size:()=>defs.size
  };
  RF.Config=RF.Modules.register('data.config',api,{owner:'data',status:'canonical'});
})();
