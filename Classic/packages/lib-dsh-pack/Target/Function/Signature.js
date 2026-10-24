import{existsSync as e}from"node:fs";import{join as a}from"node:path";import m from"../Variable/Signature.js";var c=(r,o)=>(r.signature??m).some(t=>e(a(o,t)));export{c as default};
