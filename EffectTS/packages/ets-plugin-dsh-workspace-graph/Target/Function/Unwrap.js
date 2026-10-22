var u=o=>{const n={...o??{}};for(const t of Object.keys(n)){const e=n[t];if(e!==null&&typeof e=="object"&&typeof e.get=="function")try{n[t]=e.get()}catch{}}return n};export{u as default};
