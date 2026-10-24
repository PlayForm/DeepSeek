import s from"./Measure.js";var c=(t,n,i)=>{const o=t.targets.flatMap(r=>{const e=s(r,n);return e===void 0?[]:[e]});return o.sort((r,e)=>e.score-r.score),o.slice(0,i)};export{c as default};
