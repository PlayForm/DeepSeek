import r from"./Count.js";function t(n){return typeof n!="number"||!Number.isFinite(n)?"":n>=0?`+${r(n)}`:`-${r(Math.abs(n))}`}export{t as default};
