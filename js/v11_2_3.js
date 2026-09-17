window.RF=window.RF||{};
RF.VERSION='11.2.3';
RF.BUILD={
  version:'11.2.3',
  title:'Close Button Standardisation',
  built:'17 Sep 2026 • 21:35 BST',
  buildId:'20260917-2135-bst'
};
RF.V1123=RF.V1123||{};

/* Realmforge V11.2.3 — Close Button Standardisation
   - Normalises top-right X close buttons across popups and overlay interfaces.
   - Makes all X close boxes smaller and visually consistent.
   - Automatically catches current and future modal X close buttons that use the same pattern.
*/

(()=>{
'use strict';
const V=RF.V1123;
V.version='11.2.3';
V.SELECTORS=[
  '.v1111DbClose',
  '.v112ModalX',
  '.v112DbClose',
  '.v1042VaultClose',
  '.v1054MarketClose',
  '.v1123CloseX'
].join(',');

V.isCloseX=function(btn){
  if(!btn||btn.tagName!=='BUTTON')return false;
  const txt=(btn.textContent||'').replace(/\s+/g,' ').trim();
  if(!(txt==='✕'||txt==='×'||txt==='✖'))return false;
  const label=((btn.getAttribute('aria-label')||'')+' '+(btn.className||'')).toLowerCase();
  if(label.includes('close'))return true;
  return false;
};

V.normaliseCloseButtons=function(root=document){
  if(typeof document==='undefined'||!root?.querySelectorAll)return;
  const scope=root.nodeType===1?root:document;
  scope.querySelectorAll('button').forEach(btn=>{
    if(V.isCloseX(btn))btn.classList.add('v1123CloseX');
  });
};

V.migrate=function(s){
  if(!s)return s;
  s.v1123=s.v1123||{};
  s.version='11.2.3';
  return s;
};

const oldNew=RF.newGame;RF.newGame=function(...a){return V.migrate(oldNew(...a))};
const oldLoad=RF.load;RF.load=function(){return V.migrate(oldLoad())};
const oldImport=RF.importSave;RF.importSave=function(x){return V.migrate(oldImport(x))};
if(RF.V95){
  RF.V95.SCHEMA='11.2.3';
  const om=RF.V95.migrate.bind(RF.V95);RF.V95.migrate=s=>V.migrate(om(s));
}

const oldStyle=document.getElementById('v1123-close-style');if(oldStyle)oldStyle.remove();
const st=document.createElement('style');
st.id='v1123-close-style';
st.textContent=`
.v1123CloseX,
.v1111DbClose,
.v112ModalX,
.v112DbClose,
.v1042VaultClose,
.v1054MarketClose{
  width:40px !important;
  height:40px !important;
  min-width:40px !important;
  min-height:40px !important;
  border-radius:12px !important;
  font-size:21px !important;
  line-height:1 !important;
  padding:0 !important;
  display:grid !important;
  place-items:center !important;
  flex:0 0 40px !important;
}
.v1111DbClose,
.v112ModalX,
.v112DbClose{
  top:12px !important;
  right:12px !important;
}
`;
document.head.appendChild(st);

const renderBase=RF.UI?.render?.bind(RF.UI);
if(renderBase){
  RF.UI.render=function(...args){
    const out=renderBase(...args);
    try{V.normaliseCloseButtons(document);}catch(_){ }
    return out;
  };
}

const mo=new MutationObserver(muts=>{
  for(const m of muts){
    if(m.type==='childList'&&(m.addedNodes?.length||0)){
      V.normaliseCloseButtons(document);
      break;
    }
  }
});
if(document.body)mo.observe(document.body,{childList:true,subtree:true});

if(RF.state){
  V.migrate(RF.state);
  RF.save?.(RF.state);
  setTimeout(()=>{
    V.normaliseCloseButtons(document);
    RF.UI?.render?.(RF.state);
  },0);
}
})();
