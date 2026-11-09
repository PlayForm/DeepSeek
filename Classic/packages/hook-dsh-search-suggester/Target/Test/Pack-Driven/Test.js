import n from"node:assert/strict";import*as h from"node:fs";import*as P from"node:os";import*as u from"node:path";import{AgentOf as p,CheckAsync as r,Finish as x,MakeCounter as v,Post as g,SeedHistory as C,Setup as d}from"../Harness.js";const m=t=>h.mkdtempSync(u.join(P.tmpdir(),t)),o=(t,e,s="x")=>{const a=u.join(t,e);return h.mkdirSync(u.dirname(a),{recursive:!0}),h.writeFileSync(a,s,"utf8"),a},S=`signature:
  - docs/STYLE.md
families:
  "search/Version":
    id: Version
    priority: 1
    threshold: 0.5
    signals:
      - rule: R1 literal-shape
        pattern: '\\bversion\\b'
        weight: 2.5
    targets:
      - path: VERSIONS.md
        kind: doc
        prior: 1.0
        reason: the temp versions
`,l=t=>({get:()=>t}),i=m("search-suggester-packed-");o(i,"package.json","{}"),o(i,".dsh/pack.yml",S),o(i,"docs/STYLE.md"),o(i,"VERSIONS.md");const f=u.join(i,"package.json"),k=m("search-suggester-bare-");o(k,"package.json","{}"),o(k,"VERSIONS.md");const y=m("search-suggester-unsigned-");o(y,"package.json","{}"),o(y,".dsh/pack.yml",S);const w=(t,e="version")=>({name:"grep",arguments:{pattern:e},agent:p(t)}),b=async()=>{const t=v();{const e=d();e.Context.workingDirectory=l(i),await r(t,"P1: the temp pack's family drives the note",async()=>{const s=await g(e,w("pack-a"));n.equal(s.additionalContexts.length,1),n.deepEqual(s.additionalContexts[0].source,{kind:"search-suggester",form:"notice",summary:"Version 0.87"}),n.equal(s.additionalContexts[0].content[0].text,`[search-suggester] intent=Version confidence=0.87
targets (1):
- VERSIONS.md - the temp versions
note: open these before more searches; Target/ is generated, never edit it.`)}),await r(t,"P1: the ledger counts the pack's one candidate",async()=>{n.ok(e.Lines.includes("hook-dsh-search-suggester: suggest Version 0.87 1 candidates"))})}{const e=d();e.Context.workingDirectory=l(k),await r(t,"P2: the same workspace without the pack abstains no-history",async()=>{const s={kind:"allow",additionalContexts:[]},a=await g(e,w("pack-b"),s);n.equal(a,s),n.ok(e.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00")),n.equal(e.Lines.filter(c=>c.includes(": suggest ")).length,0)})}{const e=d();e.Context.workingDirectory=l(y),await r(t,"P3: a pack with an absent companion abstains no-companions",async()=>{const s={kind:"allow",additionalContexts:[]},a=await g(e,w("pack-c"),s);n.equal(a,s),n.ok(e.Lines.includes("hook-dsh-search-suggester: abstained no-companions Version 0.87")),n.equal(e.Lines.filter(c=>c.includes(": suggest ")).length,0)})}{const e=d();await r(t,"P4: a monorepo read with no history abstains no-history",async()=>{const s={kind:"allow",additionalContexts:[]},a=await g(e,{name:"read",arguments:{file_path:"package.json"},agent:p("pack-d")},s);n.equal(a,s),n.ok(e.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00")),n.equal(e.Lines.filter(c=>c.includes(": suggest ")).length,0)})}{const e=d();e.Context.workingDirectory=l(i),C(e,"pack-e",f,["VERSIONS.md"]),await r(t,"P5: the History family outranks the explicit pack's row",async()=>{const s=await g(e,{name:"grep",arguments:{pattern:"version",path:f},agent:p("pack-e")});n.equal(s.additionalContexts[0].source.summary,"History 0.87"),n.ok(e.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 1 candidates"))})}return x(t,"Pack-Driven")},O=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(O){const t=await b();console.log(`${t} PASS - Pack-Driven`)}export{b as runTest};
