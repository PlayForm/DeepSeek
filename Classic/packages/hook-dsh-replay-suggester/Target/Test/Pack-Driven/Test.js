import s from"node:assert/strict";import*as o from"node:fs";import*as S from"node:os";import*as c from"node:path";import{Call as l,CheckAsync as a,Finish as R,MakeCounter as v,Setup as u,WriteStore as y,rmStore as h}from"../Harness.js";const k=t=>o.mkdtempSync(c.join(S.tmpdir(),t)),m=(t,e,n="x")=>{const r=c.join(t,e);return o.mkdirSync(c.dirname(r),{recursive:!0}),o.writeFileSync(r,n,"utf8"),r},w=t=>{o.writeFileSync(c.join(t,"package.json"),"{}","utf8")},x=`signature:
  - docs/STYLE.md
families:
  "replay/Rerun":
    id: Rerun
    priority: 1
    threshold: 0.75
    note: the temp recall is the answer
    signals:
      - rule: temp-shape
        pattern: 'grep'
        weight: 3.0
    targets: []
`,f={intent:"Repeat",probe:'grep {"pattern":"version"}',files:["Source/Version.ts"],verify:""},d=t=>({get:()=>t}),i=k("replay-suggester-packed-");w(i),m(i,".dsh/pack.yml",x),m(i,"Source/Version.ts");const p=k("replay-suggester-bare-");w(p),m(p,"Source/Version.ts");const C=async()=>{const t=v();{y([f]);const e=u();e.Context.workingDirectory=d(i),await a(t,"P1: the temp pack's intent and caveat drive the note",async()=>{const n=await l(e,"grep",{pattern:"version"});s.equal(n.additionalContexts.length,1),s.deepEqual(n.additionalContexts[0].source,{kind:"replay-suggester",form:"notice",summary:"Rerun 0.92"});const r=n.additionalContexts[0].content[0].text;s.equal(r,`[replay-suggester] intent=Rerun confidence=0.92
targets (1):
- Source/Version.ts - touched last time (Repeat)
note: the temp recall is the answer`),s.equal(r.includes("docs/STYLE.md"),!1)}),await a(t,"P1: the ledger counts the recalled companion",async()=>{s.ok(e.Lines.includes("replay-suggester: suggest Rerun 0.92 1 candidates call grep"))})}{y([f]);const e=u();e.Context.workingDirectory=d(p),await a(t,"P2: without a pack the recall still produces the note",async()=>{const n=await l(e,"grep",{pattern:"version"});s.equal(n.additionalContexts.length,1),s.deepEqual(n.additionalContexts[0].source,{kind:"replay-suggester",form:"notice",summary:"Repeat 0.87"});const r=n.additionalContexts[0].content[0].text;s.equal(r,`[replay-suggester] intent=Repeat confidence=0.87
targets (1):
- Source/Version.ts - touched last time (Repeat)
note: the last time this call was made, these files were touched`),s.ok(e.Lines.includes("replay-suggester: suggest Repeat 0.87 1 candidates call grep"))})}{h();const e=u();e.Context.workingDirectory=d(i),await a(t,"P3: a pack family with no record abstains no-memory",async()=>{const n={kind:"allow"},r=await l(e,"grep",{pattern:"version"},void 0,n);s.equal(r,n),s.ok(e.Lines.includes("replay-suggester: abstained no-memory Rerun 0.92")),s.equal(e.Lines.filter(g=>g.includes("candidates call")).length,0)})}{h();const e=u();e.Context.workingDirectory=d(p),await a(t,"P4: a workspace with no pack and no record abstains no-history",async()=>{const n={kind:"allow"},r=await l(e,"grep",{pattern:"version"},void 0,n);s.equal(r,n),s.ok(e.Lines.includes("replay-suggester: abstained no-history  0.00")),s.equal(e.Lines.filter(g=>g.includes("candidates call")).length,0)})}return R(t,"Pack-Driven")},P=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(P){const t=await C();console.log(`${t} PASS - Pack-Driven`)}export{C as runTest};
