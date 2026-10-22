import{createHash as e}from"node:crypto";var a=t=>e("sha256").update(t.join(`
`)).digest("hex");export{a as default};
