import*as r from"node:fs";var o=(t,e)=>{try{t.Context.logger.info(`${t.Module}: ${e}`)}catch{}switch(!0){case t.Enabled:try{r.appendFileSync(t.Ledger,`[${new Date().toISOString()}] ${e}
`)}catch{}}};export{o as default};
