const t=r=>{const e=r.DSH_HOME;return!0===(typeof e=="string"&&e.length>0)?e:`${r.HOME??"~"}/.dsh`};var n=(r,e=typeof process>"u"?{}:process.env)=>[t(e),...r].join("/");export{n as default};
