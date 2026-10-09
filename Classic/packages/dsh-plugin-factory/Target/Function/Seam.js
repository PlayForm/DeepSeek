var r=(t,e)=>{if(!0===t.Seams.has(e))return t.Seams.get(e);let n;try{n=t.Context.get?.(e)}catch{n=void 0}return t.Seams.set(e,n),n};export{r as default};
