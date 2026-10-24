import{readdirSync as e}from"node:fs";var n=t=>{try{return e(t,{withFileTypes:!0}).filter(r=>r.isDirectory()).map(r=>r.name).sort()}catch{return[]}};export{n as default};
