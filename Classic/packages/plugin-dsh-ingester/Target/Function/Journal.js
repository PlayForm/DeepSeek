import{appendFileSync as o,mkdirSync as s}from"node:fs";import{dirname as p}from"node:path";import{Expand as d}from"@playform/lib-dsh-core";var g=(t,r,a,n,i)=>{if(!0!==(t.Config.log===!1))try{const e=d(t.Ledger);s(p(e),{recursive:!0}),o(e,`${JSON.stringify({at:Date.now(),event:r,proposal:a,path:n,detail:i})}
`)}catch{}};export{g as default};
