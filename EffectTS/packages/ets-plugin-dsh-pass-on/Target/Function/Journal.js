import{appendFileSync as i,mkdirSync as d}from"node:fs";import{dirname as o}from"node:path";import{Expand as s}from"@playform/ets-base-dsh";var m=(r,e,n,a="prepared")=>{try{const t=s(r.Ledger);d(o(t),{recursive:!0}),i(t,`${JSON.stringify({at:Date.now(),event:a,proposal:e?.id??null,digest:e?.digest??null,targets:e?.targets.length??0,note:n})}
`)}catch{}};export{m as default};
