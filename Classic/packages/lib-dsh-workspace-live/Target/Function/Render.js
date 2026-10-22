var t=e=>{const n=e.version===void 0?"":` @ ${e.version}`,r=`--- WORKSPACE SECTION ${e.id} (${e.kind}) - ${e.title}${n} ---`;return!0===(e.lines.length===0)?"":[r,...e.lines,`--- END WORKSPACE SECTION ${e.id} ---`].join(`
`)};export{t as default};
