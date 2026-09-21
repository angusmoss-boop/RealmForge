/* Realmforge V11.30.0 — canonical equipment configuration. */
(()=>{
  'use strict';
  const C=window.RF.Config;
  if(!C)throw new Error('RF.Config must load before equipment configuration.');
  C.define("equipment.statBalance",{
    rusty_sword:          {damage:3, armor:0},
    bronze_sword:         {damage:6, armor:1},
    shortbow:             {damage:5, armor:0},
    iron_sword:           {damage:8, armor:2},
    crossroads_cutlass:   {damage:9, armor:2},
    watch_spear:          {damage:12,armor:2},
    blackthorn_blade:     {damage:13,armor:2},
    marshbow:             {damage:12,armor:1},
    reedmere_spear:       {damage:13,armor:2},
    silvered_blade:       {damage:14,armor:3},
    quarry_maul:          {damage:14,armor:2},
    steel_sword:          {damage:15,armor:3},
    mirewatch_bow:        {damage:16,armor:2},
    ironridge_warhammer:  {damage:18,armor:4},
    warden_blade:         {damage:20,armor:4},
  
    leather_vest:         {damage:1, armor:3},
    greenvale_jerkin:     {damage:1, armor:4},
    iron_helm:            {damage:1, armor:4},
    ranger_cloak:         {damage:2, armor:5},
    miners_helm:          {damage:1, armor:5},
    wayfarer_coat:        {damage:1, armor:6},
    steel_helm:           {damage:2, armor:7},
    mirewatch_hood:       {damage:2, armor:7},
    fen_leathers:         {damage:2, armor:8},
    bronze_buckler:       {damage:2, armor:3},
    ironridge_kite_shield:{damage:3, armor:9},
    steel_cuirass:        {damage:2, armor:11},
    ash_ring:             {damage:2, armor:2}
  },{"source": "js/v10_55.js", "bytes": 1264});
})();
