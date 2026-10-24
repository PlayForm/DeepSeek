var u=e=>{const n=e.indexOf("## Expected count");if(n<0)return;const d=/(\d+)\s*PASS/.exec(e.slice(n));return d===null?void 0:Number(d[1])};export{u as default};
