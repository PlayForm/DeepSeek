import{appendFileSync as o,mkdirSync as p}from"node:fs";import{dirname as s}from"node:path";import{Expand as d}from"@playform/lib-dsh-core";var g=(e,r,a,n,i)=>{try{const t=d(e.Ledger);p(s(t),{recursive:!0}),o(t,`${JSON.stringify({at:Date.now(),event:r,proposal:a,path:n,detail:i})}
`)}catch{}};export{g as default};
