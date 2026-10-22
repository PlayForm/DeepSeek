var d=(a,e)=>[...a].sort((r,o)=>{const n=e[r.kind]??0;return(e[o.kind]??0)-n||`${r.from}->${r.to}`.localeCompare(`${o.from}->${o.to}`)});export{d as default};
