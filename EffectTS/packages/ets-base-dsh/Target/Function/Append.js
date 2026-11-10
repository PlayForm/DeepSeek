import*as o from"node:fs";import{dirname as n}from"node:path";import i from"./Expand.js";var m=(e,r)=>{try{e.Context.logger.info(`${e.Module}: ${r}`)}catch{}switch(!0){case e.Enabled:try{const t=i(e.Ledger);o.mkdirSync(n(t),{recursive:!0}),o.appendFileSync(t,`[${new Date().toISOString()}] ${r}
`)}catch{}}};export{m as default};
