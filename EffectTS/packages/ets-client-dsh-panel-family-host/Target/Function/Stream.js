const f="/api/playform-family/trace",l=["observe/stamp","graph/indexed","graph/invalidated","batch/proposed","batch/decision","batch/state-change"],a=e=>typeof e=="object"&&e!==null&&typeof e.on=="function",d=e=>typeof e=="object"&&e!==null&&typeof e.register=="function";function g(e){const i=e.get("webServer");if(!0!==!d(i))return i.register({path:f,handler:(c,o)=>{const r=n=>{try{o.write(n)}catch(s){e.logger.warn(`trace stream: write failed: ${String(s)}`),o.destroy()}};o.writeHead(200,{"content-type":"text/event-stream","cache-control":"no-cache",connection:"keep-alive"}),r(`retry: 3000

`);const t=e.get("trace");if(a(t)&&typeof t.ring=="function")for(const n of t.ring(200))r(`data: ${JSON.stringify(n)}

`);else r(`: waiting

`);const p=l.map(n=>a(t)?t.on(n,s=>{r(`data: ${JSON.stringify(s)}

`)}):()=>{});c.on("close",()=>{for(const n of p)n()})}})}export{g as default};
