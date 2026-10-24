import*as o from"node:fs";import{dirname as i}from"node:path";import{Expand as n}from"@playform/lib-dsh-core";var p=(r,t)=>{try{r.Context.logger.info(`graph: ${t}`)}catch{}if(r.Ledger!=="")try{const e=n(r.Ledger);o.mkdirSync(i(e),{recursive:!0}),o.appendFileSync(e,`[${new Date().toISOString()}] graph: ${t}
`)}catch{}};export{p as default};
