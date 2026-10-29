import l from"./Detect.js";import y from"./Scan.js";const d=/^<path>([^\n]*)<\/path>\n<type>file<\/type>\n<content>\n([\s\S]*)\n<\/content>$/u,h=/^(\d+): ([\s\S]*)$/u,x="(Comments omitted. Use grep to inspect them, or ask the user to include comments.)";var k=(t,i)=>{const n=d.exec(t);if(n===null)return{text:t,count:0};const r=n[1]??"",a=n[2]??"",c=l(r);if(c===void 0)return{text:t,count:0};const p={};let e=0;const m=a.split(`
`).map(s=>{const o=h.exec(s);if(o===null)return s;const u=y(o[2]??"",c,p);return e+=u.count,`${o[1]}: ${u.text}`});if(e===0)return{text:t,count:0};const f=i.Notice?`
${x}`:"";return{text:`<path>${r}</path>
<type>file</type>
<content>
${m.join(`
`)}${f}
</content>`,count:e}};export{k as default};
