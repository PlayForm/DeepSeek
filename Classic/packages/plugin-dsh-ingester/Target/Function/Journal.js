import{appendFileSync as n,mkdirSync as p}from"node:fs";import{dirname as o}from"node:path";var m=(t,e,r,a,i)=>{try{p(o(t.Ledger),{recursive:!0}),n(t.Ledger,`${JSON.stringify({at:Date.now(),event:e,proposal:r,path:a,detail:i})}
`)}catch{}};export{m as default};
