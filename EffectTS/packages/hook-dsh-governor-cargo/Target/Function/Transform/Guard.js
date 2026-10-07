var a=(e,n)=>{const s=new Set(e.sections.map(t=>t.path));return n.replacements.map(t=>t.section).concat(n.strips.map(t=>t.section)).find(t=>!s.has(t))};export{a as default};
