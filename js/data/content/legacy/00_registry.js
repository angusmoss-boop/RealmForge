/* Realmforge V11.30.0 — canonical legacy content registry (decomposed from V11.9) — Canonical historical content definitions.
   Extracted from the old patch runtime. Definitions are invoked at their original
   execution points by the trimmed compatibility layer, preserving ordering while
   moving content ownership into js/data. */
window.RF=window.RF||{};
(()=>{
'use strict';
const RF=window.RF;
RF.Content=RF.Content||{};
const blocks=new Map();
const applied=[];
const define=(id,fn,meta)=>{if(blocks.has(id))throw new Error(`Duplicate content block: ${id}`);blocks.set(id,{fn,meta});};
const api=RF.Content;
const legacyOrder=["v2@L3", "v2@L11", "v2@L16", "v2@L17", "v2@L18", "v2@L19", "v2@L24", "v2@L27", "v2@L34", "v2@L35", "v2@L55", "v2@L56", "v2@L57", "v3@L4", "v3@L16", "v3@L17", "v3@L23", "v3@L30", "v3@L31", "v3@L32", "v3@L39", "v3@L40", "v3@L41", "v3@L46", "v3@L60", "v3@L61", "v3@L62", "v3@L64", "v4@L10", "v4@L22", "v4@L26", "v4@L27", "v4@L28", "v4@L29", "v4@L31", "v4@L49", "v4@L63", "v4@L76", "v4@L82", "v4@L89", "v4@L91", "v4@L134", "v5@L6", "v5@L10", "v5@L24", "v5@L42", "v5@L56", "v6@L8", "v7@L9", "v7@L50", "v7@L63", "v7@L73", "v7@L74", "v7@L75", "v7@L76", "v7@L78", "v7@L83", "v7@L89", "v7@L91", "v7@L105", "v7@L122", "v7@L132", "v7@L171", "v7@L172", "v7@L173", "v7@L174", "v7@L175", "v7@L177", "v7@L182", "v7@L184", "v7@L190", "v7@L191", "v7@L193", "v7@L216", "v7@L223", "v7@L230", "v7@L375", "v8@L64", "v8_1@L39", "v8_1@L105", "v9_2@L15", "v9_2@L27", "v9_2@L35", "v9_3@L16", "v10_27@L21", "v10_27@L29", "v10_27@L30"];
api.defineLegacyBlock=define;
api.applyLegacyBlock=function(id){const b=blocks.get(id);if(!b)throw new Error(`Missing canonical content block: ${id}`);b.fn();applied.push(id);return true;};
api.legacyBlocks=()=>legacyOrder.filter(id=>blocks.has(id)).map(id=>({id,...blocks.get(id).meta}));
api.legacyBlockCount=()=>blocks.size;
api.legacyOrder=()=>legacyOrder.slice();
api.appliedLegacyBlocks=()=>applied.slice();
api.expectedLegacyBlocks=87;

})();
