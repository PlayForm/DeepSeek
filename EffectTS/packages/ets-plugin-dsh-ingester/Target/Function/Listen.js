import e from"./Consume.js";import r from"./Record.js";var s=n=>{const t=n.Context.on;t("batch/proposed",o=>{try{r(n,o)}catch{}}),t("batch/decision",o=>{try{e(n,o)}catch{}})};export{s as default};
