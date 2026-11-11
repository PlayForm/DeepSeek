const s="Phase 2 of 2: return the final list. The bodies above are the current text. Reply with one JSON object and nothing else.",a=t=>t.length===0?"Skill index: (the catalog is empty)":["Skill index:",...t].join(`
`),l=t=>{const o=(t.match(/`+/g)??[]).reduce((r,i)=>Math.max(r,i.length),0);return"`".repeat(Math.max(3,o+1))},d=t=>{const e=l(t.body);return[`File: ${t.name}`,e,t.body,e].join(`
`)};var y=async(t,e)=>{const o=[e.digest,a(e.index),e.views.map(d).join(`

`),s].filter(n=>n!=="").join(`

`);let r="";const i=t.stream({provider:e.route.provider,model:e.route.model,system:e.system,messages:[{role:"user",content:[{type:"text",text:o}]}],maxTokens:e.maxTokens,signal:e.signal});for await(const n of i)n.type==="text-delta"&&typeof n.text=="string"&&(r+=n.text);return r};export{y as default};
