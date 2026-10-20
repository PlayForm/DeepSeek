var u=(r,e)=>{let n=0;return{text:r.replace(new RegExp(`[${Object.keys(e).map(t=>`\\u{${t.codePointAt(0).toString(16)}}`).join("")}]`,"gu"),t=>(n+=1,e[t]??t)),count:n}};export{u as default};
