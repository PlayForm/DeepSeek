import{appendFileSync as a,mkdirSync as n}from"node:fs";import{dirname as o}from"node:path";var p=(t,r,e)=>{try{n(o(t.Ledger),{recursive:!0}),a(t.Ledger,`${JSON.stringify({at:Date.now(),event:r,session:e.session,agentId:e.agentId,block:e})}
`)}catch{}};export{p as default};
