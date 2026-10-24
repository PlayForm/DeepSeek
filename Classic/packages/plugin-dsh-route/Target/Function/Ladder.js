var a=(l,n)=>{const e=l.planner;if(n===void 0||n.includes(e.model))return{...e};const o=n.find(c=>l.allowedModels.includes(c));return o===void 0?{...e}:{...e,model:o}};export{a as default};
