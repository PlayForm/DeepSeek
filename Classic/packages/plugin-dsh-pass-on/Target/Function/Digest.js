import{createHash as r}from"node:crypto";var i=(t,e)=>r("sha256").update(JSON.stringify({targets:t,operations:e})).digest("hex");export{i as default};
