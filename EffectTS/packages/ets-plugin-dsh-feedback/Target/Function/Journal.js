import{appendFileSync as n,mkdirSync as o}from"node:fs";import{dirname as i}from"node:path";import{Expand as p}from"@playform/ets-base-dsh";var d=(r,a,e)=>{try{const t=p(r.Ledger);o(i(t),{recursive:!0}),n(t,`${JSON.stringify({at:Date.now(),event:a,session:e.session,agentId:e.agentId,block:e})}
`)}catch{}};export{d as default};
