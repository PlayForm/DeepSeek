var o=(d,s,c,f,l)=>{const u=new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"g"),e=[...d];let i=0;for(let n=s;n<=c;n+=1){const t=e[n-1];if(t===void 0)continue;const r=t.match(u);r!=null&&(i+=r.length,e[n-1]=t.replace(u,l))}if(!0!==(i===0))return e.join(`
`)};export{o as default};
