const l="Phase 1 of 2: return the plan. Reply with one JSON object and nothing else.",s=n=>n.length===0?"Skill index: (the catalog is empty)":["Skill index:",...n].join(`
`);var i=async(n,e)=>{const o=[e.digest,s(e.index),l].filter(t=>t!=="").join(`

`);let r="";const a=n.stream({provider:e.route.provider,model:e.route.model,system:e.system,messages:[{role:"user",content:[{type:"text",text:o}]}],maxTokens:e.maxTokens,signal:e.signal});for await(const t of a)t.type==="text-delta"&&typeof t.text=="string"&&(r+=t.text);return r};export{i as default};
