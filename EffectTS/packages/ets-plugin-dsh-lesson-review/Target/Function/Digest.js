const f=300,w=200,p=t=>{const r=t.text.replace(/\s+/g," ").trim();switch(!0){case t.role==="user":return`USER: ${r.slice(0,300)}`;case t.role==="assistant":return`ASSISTANT: ${r.slice(0,200)}`;case t.role==="tool":return`TOOL: ${r.slice(0,200)}`;default:return`${t.role.toUpperCase()}: ${r.slice(0,200)}`}};var x=(t,r,d)=>{const e=Array.isArray(t)?t.filter(a=>a!==void 0):[];if(!0===(e.length===0))return{text:"[No conversation to review.]",kept:0,collapsed:0,trimmed:!1};let s=Math.min(Math.max(2,r),e.length);for(;s<e.length&&e[e.length-s]?.role==="tool";)s++;const i=e.slice(e.length-s),l=e.slice(0,e.length-s),h=l.map(p),o=l.length?["[Earlier conversation digest - older turns summarised to bound the","review's cost. Recent turns follow verbatim below.]"].join(`
`):"";let n=h.join(`
`),c=!1;const u=i.map(p).join(`
`),m=Math.max(0,d-u.length-o.length-2);return!0===n.length>m&&(c=!0,n=n.slice(n.length-m),n=n.slice(Math.max(0,n.indexOf(`
`)+1))),{text:[o,n,u].filter(a=>a!=="").join(`

`),kept:i.length,collapsed:l.length,trimmed:c}};export{x as default};
