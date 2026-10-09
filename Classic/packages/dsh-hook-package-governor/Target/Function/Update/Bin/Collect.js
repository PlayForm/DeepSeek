import a from"./Pipe.js";var c=(t,r,o,s)=>{try{const e=r.collected?.[o]?.readFrom(0);!0===(!!e&&e.text.length>0)&&a(t,e.text.replace(/\n+$/,""),s)}catch{}};export{c as default};
