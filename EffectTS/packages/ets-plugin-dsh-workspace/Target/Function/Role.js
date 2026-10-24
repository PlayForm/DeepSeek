var i=(e,t)=>e.find({kind:"DocSection",pattern:t,limit:50}).find(r=>r.path===t)?.name??"module";export{i as default};
