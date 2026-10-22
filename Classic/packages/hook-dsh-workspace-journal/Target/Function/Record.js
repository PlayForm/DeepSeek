var c=async(a,t)=>{try{const e=a.Handle;e!==void 0&&await e.table("batches").put(t.batchId,t)}catch{}};export{c as default};
