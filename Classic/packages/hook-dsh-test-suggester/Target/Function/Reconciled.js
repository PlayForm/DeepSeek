var s=(e,r)=>{const a=`[test-suggester] reconciliation package=${e.package} drifts=${e.drifts.length} expected=${e.expected} actual=${e.actual}`,c=e.drifts.map(t=>`- ${t.file} - ${t.reason} (expected ${t.expected}, actual ${t.actual})`),n=`${a}
${[...c,"note: the smoke claims drifted from the tree; fix the README count, the suite file or the roster - Target/ is never edited."].join(`
`)}`;return n.length<=r?n:`${n.slice(0,r-1)}...`};export{s as default};
