import{readFile as s,stat as n}from"node:fs/promises";import{homedir as a}from"node:os";async function i(o){const e=o.replace(/^~/,a());try{const r=await n(e),t=(await s(e,"utf8")).split(`
`);return t.length>0&&t[t.length-1]===""&&t.pop(),{ok:!0,ccrLog:e,bytes:r.size,lines:t.length}}catch(r){return{ok:!1,code:"not-found",message:`ccr log is unreadable: ${String(r)}`}}}export{i as default};
