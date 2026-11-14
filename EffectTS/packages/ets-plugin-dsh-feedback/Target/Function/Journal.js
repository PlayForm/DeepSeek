import{appendFileSync as n,mkdirSync as o}from"node:fs";import{dirname as i}from"node:path";import{Expand as s}from"@playform/ets-base-dsh";var m=(t,a,e)=>{if(!0!==!t.Config.enabled)try{const r=s(t.Ledger);o(i(r),{recursive:!0}),n(r,`${JSON.stringify({at:Date.now(),event:a,session:e.session,agentId:e.agentId,block:e})}
`)}catch{}};export{m as default};
