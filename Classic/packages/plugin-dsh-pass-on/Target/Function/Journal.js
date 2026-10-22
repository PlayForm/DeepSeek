import{appendFileSync as a,mkdirSync as n}from"node:fs";import{dirname as o}from"node:path";var s=(t,e,r)=>{try{n(o(t.Ledger),{recursive:!0}),a(t.Ledger,`${JSON.stringify({at:Date.now(),event:"prepared",proposal:e?.id??null,digest:e?.digest??null,targets:e?.targets.length??0,note:r})}
`)}catch{}};export{s as default};
