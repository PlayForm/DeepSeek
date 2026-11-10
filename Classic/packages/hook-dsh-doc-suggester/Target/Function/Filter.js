import m from"./Exists.js";var s=(e,i,r,a)=>e.map(t=>({...t,family:{...t.family,targets:t.family.targets.filter(f=>m(f.path,i,r,a))}}));export{s as default};
