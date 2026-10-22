var r=o=>{const s=[o.workspace,o.scope,"MAP",...o.map,o.focus,"NEIGHBORS"];for(const e of o.neighbors)s.push(e);s.push("EVIDENCE");for(const e of o.evidence)s.push(e);s.push("OPEN");for(const e of o.open)s.push(e);return!0===(o.stale!==void 0)&&s.push(`STALE ${o.stale}`),s.join(`
`)};export{r as default};
