import{createHash as i}from"node:crypto";import a from"./Normalize.js";var m=(r,t,e="")=>i("sha256").update(`${a(r)}
${t}
${e}`).digest("hex");export{m as default};
