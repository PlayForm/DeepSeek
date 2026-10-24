import c from"./Home.js";import i from"./Resolve.js";const s=new Map;var f=(t,e)=>{const r=`${c(e)}\0${t}`,o=s.get(r);if(o!==void 0)return o;const n=i(t,e);return s.set(r,n),n};export{f as default};
