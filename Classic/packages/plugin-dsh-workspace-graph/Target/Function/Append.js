import*as e from"node:fs";var o=(t,r)=>{try{t.Context.logger.info(`graph: ${r}`)}catch{}if(t.Ledger!=="")try{e.appendFileSync(t.Ledger,`[${new Date().toISOString()}] graph: ${r}
`)}catch{}};export{o as default};
