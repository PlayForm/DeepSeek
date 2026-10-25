import r from"node:assert/strict";import*as p from"node:fs";import*as f from"node:os";import*as u from"node:path";import{Call as i,CheckAsync as a,Finish as v,MakeCounter as S,Setup as o,WriteStore as c}from"../Harness.js";const d=t=>p.mkdtempSync(u.join(f.tmpdir(),t)),g=(t,e,n="x")=>{const s=u.join(t,e);return p.mkdirSync(u.dirname(s),{recursive:!0}),p.writeFileSync(s,n,"utf8"),s},y=`signature:
  - docs/STYLE.md
families:
  "replay/Repeat":
    id: Repeat
    priority: 1
    threshold: 0.75
    note: the temp recall is the answer
    signals:
      - rule: search-shape
        pattern: 'grep'
        weight: 0.5
      - rule: literal-shape
        pattern: '"version"'
        weight: 0.4
      - rule: context-shape
        pattern: 'pattern'
        weight: 0.3
    targets: []
`,l={intent:"Repeat",probe:'grep {"pattern":"version"}',files:["Source/Version.ts"],verify:""},h=t=>({get:()=>t}),m=d("replay-suggester-packed-");g(m,".dsh/pack.yml",y),g(m,"docs/STYLE.md");const x=d("replay-suggester-bare-"),k=d("replay-suggester-unsigned-");g(k,".dsh/pack.yml",y);const R=async()=>{const t=S();{c([l]);const e=o();e.Context.workingDirectory=h(m),await a(t,"P1: the temp pack's intent and caveat drive the note",async()=>{const n=await i(e,"grep",{pattern:"version"});r.equal(n.additionalContexts.length,1),r.deepEqual(n.additionalContexts[0].source,{kind:"replay-suggester",form:"notice",summary:"Repeat 0.77"});const s=n.additionalContexts[0].content[0].text;r.equal(s,`[replay-suggester] intent=Repeat confidence=0.77
targets (1):
- Source/Version.ts - touched last time (Repeat)
note: the temp recall is the answer`)}),await a(t,"P1: the ledger counts the recalled companion",async()=>{r.ok(e.Lines.includes("replay-suggester: suggest Repeat 0.77 1 candidates call grep"))})}{c([l]);const e=o();e.Context.workingDirectory=h(x),await a(t,"P2: the same workspace without the pack stays silent",async()=>{const n={kind:"allow"},s=await i(e,"grep",{pattern:"version"},void 0,n);r.equal(s,n),r.ok(e.Lines.includes("replay-suggester: abstained foreign-workspace  0.00")),r.equal(e.Lines.filter(w=>w.includes("candidates call")).length,0)})}{c([l]);const e=o();e.Context.workingDirectory=h(k),await a(t,"P3: a pack whose signature marker is absent stays silent",async()=>{const n={kind:"allow"},s=await i(e,"grep",{pattern:"version"},void 0,n);r.equal(s,n),r.ok(e.Lines.includes("replay-suggester: abstained foreign-workspace  0.00"))})}{c([{...l,probe:"grep"}]);const e=o();await a(t,"P4: the built-in pack still drives the monorepo path",async()=>{const n=await i(e,"grep",{pattern:"version",path:"Source/Version.ts"});r.equal(n.additionalContexts[0].source.summary,"Repeat 0.77");const s=n.additionalContexts[0].content[0].text;r.equal(s.includes("- Source/Version.ts - touched last time (Repeat)"),!0),r.equal(s.includes("note: the recall is the answer; without a record the hook abstains."),!0)})}return v(t,"Pack-Driven")},P=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(P){const t=await R();console.log(`${t} PASS - Pack-Driven`)}export{R as runTest};
