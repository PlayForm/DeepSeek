import s from"node:assert/strict";import*as d from"node:fs";import*as S from"node:os";import*as g from"node:path";import{AgentOf as l,CheckAsync as c,Finish as x,MakeCounter as C,Post as u,Setup as m}from"../Harness.js";const p=t=>d.mkdtempSync(g.join(S.tmpdir(),t)),a=(t,e,n="x")=>{const i=g.join(t,e);return d.mkdirSync(g.dirname(i),{recursive:!0}),d.writeFileSync(i,n,"utf8"),i},k=t=>{d.writeFileSync(g.join(t,"package.json"),"{}","utf8")},w=`signature:
  - docs/STYLE.md
families:
  "edit/Version":
    id: Version
    priority: 1
    threshold: 0.85
    signals:
      - rule: manifest
        pattern: '(^|/)package\\.json$'
        weight: 2.5
    targets:
      - path: MANIFEST.md
        kind: manifest
        prior: 1.0
        reason: the temp manifest
`,f=t=>({get:()=>t}),o=p("edit-suggester-packed-");k(o),a(o,".dsh/pack.yml",w),a(o,"docs/STYLE.md"),a(o,"MANIFEST.md");const P=a(o,"package.json"),y=p("edit-suggester-bare-");k(y);const q=a(y,"package.json"),h=p("edit-suggester-unsigned-");k(h),a(h,".dsh/pack.yml",w);const v=a(h,"package.json"),L=async()=>{const t=C();{const e=m();e.Context.workingDirectory=f(o),await c(t,"P1: the temp pack's family drives the note",async()=>{const n=await u(e,{name:"edit",arguments:{file_path:P},agent:l("pack-a")});s.equal(n.additionalContexts.length,1),s.deepEqual(n.additionalContexts[0].source,{kind:"edit-suggester",form:"notice",summary:"Version 0.87"});const i=n.additionalContexts[0].content[0].text;s.equal(i,`[edit-suggester] family=Version confidence=0.87
companions (1):
- MANIFEST.md - the temp manifest
note: this file rarely stands alone; check whether these need the same change.`),s.equal(i.includes("the root manifest"),!1)}),await c(t,"P1: the ledger counts the pack's one companion",async()=>{s.ok(e.Lines.includes(`hook-dsh-edit-suggester: suggest Version 0.87 1 companions ${P}`))})}{const e=m();e.Context.workingDirectory=f(y),await c(t,"P2: the same workspace without the pack abstains no-history",async()=>{const n={kind:"allow",additionalContexts:[]},i=await u(e,{name:"edit",arguments:{file_path:q},agent:l("pack-b")},n);s.equal(i,n),s.ok(e.Lines.includes("hook-dsh-edit-suggester: abstained no-history  0.00")),s.equal(e.Lines.filter(r=>r.includes(": suggest ")).length,0)})}{const e=m();e.Context.workingDirectory=f(h),await c(t,"P3: a pack with an absent signature marker still governs the tree",async()=>{const n={kind:"allow",additionalContexts:[]},i=await u(e,{name:"edit",arguments:{file_path:v},agent:l("pack-c")},n);s.equal(i,n),s.ok(e.Lines.includes("hook-dsh-edit-suggester: abstained no-companions Version 0.87")),s.equal(e.Lines.filter(r=>r.includes(": suggest ")).length,0)})}{const e=m();await c(t,"P4: a monorepo edit with no history abstains no-history",async()=>{const n={kind:"allow",additionalContexts:[]},i=await u(e,{name:"edit",arguments:{file_path:"package.json"},agent:l("pack-d")},n);s.equal(i,n),s.ok(e.Lines.includes("hook-dsh-edit-suggester: abstained no-history  0.00")),s.equal(e.Lines.filter(r=>r.includes(": suggest ")).length,0)})}return x(t,"Pack-Driven")},b=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(b){const t=await L();console.log(`${t} PASS - Pack-Driven`)}export{L as runTest};
