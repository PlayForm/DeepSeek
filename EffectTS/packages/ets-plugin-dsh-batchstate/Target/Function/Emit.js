var r=(e,a)=>{try{e.Context.emit("batch/state-change",a)}catch(t){try{e.Context.logger.warn(`${e.Module}: emit failed (${t instanceof Error?t.message:String(t)})`)}catch{}}};export{r as default};
