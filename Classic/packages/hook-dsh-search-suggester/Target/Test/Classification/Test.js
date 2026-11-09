import i from"node:assert/strict";import*as d from"node:fs";import*as k from"node:os";import*as g from"node:path";import{AgentOf as y,CheckAsync as r,Finish as w,Ledger as f,Make as b,MakeCounter as R,Post as E,rm as L,SeedHistory as C,Setup as D,Validate as v}from"../Harness.js";const u=s=>d.mkdtempSync(g.join(k.tmpdir(),s)),c=(s,e,a="x")=>{const t=g.join(s,e);return d.mkdirSync(g.dirname(t),{recursive:!0}),d.writeFileSync(t,a,"utf8"),t},A=`families:
  "search/Version":
    id: Version
    priority: 1
    threshold: 0.5
    signals:
      - rule: R1 literal-shape
        pattern: '\\bversion\\b'
        weight: 2.5
    targets:
      - path: package.json
        kind: manifest
        prior: 1.0
        reason: the temp manifest
  "search/Doc":
    id: Doc
    priority: 8
    threshold: 0.5
    signals:
      - rule: R7 heading
        pattern: 'README'
        weight: 2.0
      - rule: R7 heading
        pattern: '##'
        weight: 2.0
      - rule: R7 frontmatter
        pattern: 'title'
        weight: 2.0
    targets:
      - path: README.md
        kind: doc
        prior: 1.0
        reason: the temp readme
  "search/Usage":
    id: Usage
    priority: 9
    threshold: 0.5
    signals:
      - rule: R9 caller
        pattern: 'hook-dsh-'
        weight: 2.0
    targets:
      - path: Source/Library.ts
        kind: symbol
        prior: 1.0
        reason: the temp entry
`,l=u("search-suggester-classification-");c(l,"package.json","{}"),c(l,".dsh/pack.yml",A);const o=c(l,"README.md"),p=c(l,"Source/Library.ts"),m=u("search-suggester-classification-bare-");c(m,"package.json","{}");const S=c(m,"README.md"),n=(s,e,a,t)=>E(s,{name:"grep",arguments:{pattern:a,path:t},agent:y(e)}),P=async()=>{const s=R();L();const e=b(v({logFile:f,enabled:!0,threshold:.9}));await r(s,"C: the Version family wins its own literal",async()=>{await n(e,"c1","version",o),i.ok(e.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Version 0.87"))}),await r(s,"C: the Doc family wins its own literal",async()=>{await n(e,"c2","README",o),i.ok(e.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Doc 0.80"))}),await r(s,"C: the Usage family wins its own literal",async()=>{await n(e,"c3","hook-dsh-caller",p),i.ok(e.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Usage 0.80"))}),await r(s,"C: equal evidence is broken by the pack priority",async()=>{const a=e.Lines.filter(t=>t.includes("Usage")).length;await n(e,"c4","README hook-dsh-",o),i.ok(e.Lines.includes("hook-dsh-search-suggester: abstained low-confidence Doc 0.80")),i.equal(e.Lines.filter(t=>t.includes("Usage")).length,a)}),await r(s,"C: the higher evidence total beats the priority",async()=>{await n(e,"c5","version README ## title",o),i.ok(e.Lines.includes("hook-dsh-search-suggester: suggest Doc 1.00 1 candidates"))}),await r(s,"C: the same call classifies identically twice",async()=>{const a=e.Lines.filter(h=>h.includes("low-confidence Version 0.87")).length;await n(e,"c6","version",o),await n(e,"c7","version",o);const t=e.Lines.filter(h=>h.includes("low-confidence Version 0.87")).length;i.equal(t-a,2)}),await r(s,"C: a call the pack does not match abstains no-signal",async()=>{await n(e,"c8","unrelated query",p),i.ok(e.Lines.includes("hook-dsh-search-suggester: abstained no-signal  0.00"))}),await r(s,"C: a workspace with no pack and no history abstains no-history",async()=>{await n(e,"c9","version",S),i.ok(e.Lines.includes("hook-dsh-search-suggester: abstained no-history  0.00"))});{const a=D();C(a,"c10",o,["README.md"]),await r(s,"C: the History family outranks the explicit pack",async()=>{const t=await n(a,"c10","version",o);i.equal(t.additionalContexts[0].source.summary,"History 0.87"),i.ok(a.Lines.includes("hook-dsh-search-suggester: suggest History 0.87 2 candidates"))})}return w(s,"Classification")},M=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(M){const s=await P();console.log(`${s} PASS - Classification`)}export{P as runTest};
