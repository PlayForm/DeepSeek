import s from"node:assert/strict";import*as l from"node:fs";import*as C from"node:os";import*as u from"node:path";import{AgentOf as g,Call as m,CheckAsync as d,Finish as v,MakeCounter as L,Setup as p}from"../Harness.js";const h=e=>l.mkdtempSync(u.join(C.tmpdir(),e)),o=(e,i,t="x")=>{const n=u.join(e,i);return l.mkdirSync(u.dirname(n),{recursive:!0}),l.writeFileSync(n,t,"utf8"),n},k=e=>{l.writeFileSync(u.join(e,"package.json"),"{}","utf8")},D=`signature:
  - docs/STYLE.md
families:
  "test/Suite":
    id: Suite
    priority: 1
    threshold: 0.5
    note: the temp test caveat
    signals:
      - rule: test-shape
        pattern: 'PASS'
        weight: 2.5
    targets:
      - path: SUITE.md
        kind: ''
        prior: 1.0
        reason: the temp suite
`,S=e=>({get:()=>e}),f=e=>({file_path:u.join(e,"Source/Test/Foo/Test.ts"),hint:"PASS"}),r=h("test-suggester-packed-");k(r),o(r,".dsh/pack.yml",D),o(r,"docs/STYLE.md"),o(r,"SUITE.md");const y=h("test-suggester-bare-");k(y),o(y,"SUITE.md");const w=h("test-suggester-unsigned-");k(w),o(w,".dsh/pack.yml",D);const P=h("test-suggester-monorepo-");k(P),o(P,"Documentation/Plans/POC-LEDGER.md");const T=async()=>{const e=L();{const i=g("pack-a"),t=p();t.Context.workingDirectory=S(r),await d(e,"P1: the temp pack's family drives the note",async()=>{const n=await m(t,"read",f(r),i);s.equal(n.additionalContexts.length,1),s.deepEqual(n.additionalContexts[0].source,{kind:"test-suggester",form:"notice",summary:"Suite 0.87"});const a=n.additionalContexts[0].content[0].text;s.equal(a,`[test-suggester] intent=Suite confidence=0.87
targets (1):
- SUITE.md - the temp suite
note: the temp test caveat`),s.equal(a.includes("the assertion body"),!1)}),await d(e,"P1: the ledger counts the pack's one candidate",async()=>{s.ok(t.Lines.includes("test-suggester: suggest Suite 0.87 1 candidates call read"))})}{const i=g("pack-b"),t=p();t.Context.workingDirectory=S(y),await d(e,"P2: the same workspace without the pack abstains no-history",async()=>{const n={kind:"allow"},a=await m(t,"read",f(y),i,n);s.equal(a,n),s.ok(t.Lines.includes("test-suggester: abstained no-history  0.00")),s.equal(t.Lines.filter(c=>c.includes("candidates call")).length,0)})}{const i=g("pack-c"),t=p();t.Context.workingDirectory=S(w),await d(e,"P3: a pack with an absent signature marker still governs the tree",async()=>{const n={kind:"allow"},a=await m(t,"read",f(w),i,n);s.equal(a,n),s.ok(t.Lines.includes("test-suggester: abstained no-companions Suite 0.87")),s.equal(t.Lines.filter(c=>c.includes("candidates call")).length,0)})}{const i=g("pack-d"),t=p();t.Context.workingDirectory=S(P),await d(e,"P4: a monorepo test read with no history abstains no-history",async()=>{const n={kind:"allow"},a=await m(t,"read",{file_path:"Documentation/Plans/POC-LEDGER.md",hint:"Run-Smokes says PASS"},i,n);s.equal(a,n),s.ok(t.Lines.includes("test-suggester: abstained no-history  0.00")),s.equal(t.Lines.filter(c=>c.includes("candidates call")).length,0)})}return v(e,"Pack-Driven")},b=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(b){const e=await T();console.log(`${e} PASS - Pack-Driven`)}export{T as runTest};
