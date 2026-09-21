#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const manifestPath=path.join(__dirname,'content_sources_v11_30.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const joinSources=rels=>rels.map(read).join('\n');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');

const packsDir=path.join(root,manifest.contentPackDirectory);
const packSources=fs.existsSync(packsDir)
  ? fs.readdirSync(packsDir).filter(x=>x.endsWith('.js')).sort().map(x=>`${manifest.contentPackDirectory}/${x}`)
  : [];
const base=joinSources(manifest.baseContentSources);
const data=joinSources([...manifest.dataBundleSources,...packSources]);
new vm.Script(base,{filename:'js/data/base_content.js'});
new vm.Script(data,{filename:`js/dist/data_core_v${manifest.version.replace(/\./g,'_').replace(/_0$/,'')}.js`});
fs.writeFileSync(path.join(root,'js/data/base_content.js'),base);
fs.writeFileSync(path.join(root,'js/dist/data_core_v11_30.js'),data);
console.log(JSON.stringify({
  version:manifest.version,
  baseSources:manifest.baseContentSources.length,
  dataSources:manifest.dataBundleSources.length,
  contentPacks:packSources,
  baseBytes:Buffer.byteLength(base),baseSha256:sha(base),
  dataBytes:Buffer.byteLength(data),dataSha256:sha(data)
},null,2));
if(!process.argv.includes('--no-validate')){const r=cp.spawnSync(process.execPath,[path.join(__dirname,'validate_content.js')],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||2);}
