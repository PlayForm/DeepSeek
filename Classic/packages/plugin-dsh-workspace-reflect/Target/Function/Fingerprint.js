import{createHash as e}from"node:crypto";const i=t=>t.replace(/\r\n?/g,`
`).split(`
`).map(n=>n.replace(/[ \t]+$/g,"")).join(`
`);var a=(t,n,r="")=>e("sha256").update(`${i(t)}
${n}
${r}`).digest("hex");export{a as default};
