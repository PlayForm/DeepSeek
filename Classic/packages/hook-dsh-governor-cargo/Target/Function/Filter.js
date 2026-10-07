var f=(e,t)=>{for(const r of e?.sections??[])for(const s of Object.keys(r.deps))if(!0===!(s in(t?.effectiveLatest??{})))return!0;return!1};export{f as default};
