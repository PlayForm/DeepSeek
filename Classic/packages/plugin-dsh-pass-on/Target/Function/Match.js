var g=e=>{const r=e.replace(/[.+^${}()|[\]\\]/g,"\\$&").replace(/\*\*/g,"\0").replace(/\*/g,"[^/]*").replace(/\?/g,"[^/]").replace(/\u0000/g,".*");return new RegExp(`^${r}$`)};export{g as default};
