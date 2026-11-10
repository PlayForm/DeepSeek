import r from"node:assert/strict";import{Check as m,Finish as i,Library as l,MakeCounter as h,Put as o,Tree as d}from"../Harness.js";const p=(t,e="")=>`slug: repo
signature:
  - docs/S.md
extends: ${t}
${e}`,c=(t,e,s)=>`${t===""?"":`extends: ${t}
`}families:
  "doc/Plan":
    priority: ${s}
    targets:
      - path: ${e}
        prior: 1.0
        reason: the ${e} companion
`,k=async()=>{const t=h();{const e=d("pack-extends-home-"),s=d("pack-extends-chain-");o(e,".dsh/playform/workspaces/base.yml",c("","docs/BASE.md",1)),o(e,".dsh/playform/workspaces/mid.yml",c("base","docs/MID.md",2)),o(s,".dsh/pack.yml",p("mid",`families:
  "doc/Plan":
    threshold: 0.5
`)),o(s,"docs/S.md"),m(t,"E1: the chain merges base, middle and repo in order",()=>{const a=l.Resolve(s,{home:e}).families?.["doc/Plan"];r.equal(a?.priority,2),r.equal(a?.threshold,.5),r.deepEqual(a?.targets.map(n=>n.path),["docs/BASE.md","docs/MID.md"])})}{const e=d("pack-extends-home-"),s=d("pack-extends-cycle-");o(e,".dsh/playform/workspaces/a.yml",c("b","docs/A.md",1)),o(e,".dsh/playform/workspaces/b.yml",c("a","docs/B.md",2)),o(s,".dsh/pack.yml",p("a")),o(s,"docs/S.md"),m(t,"E2: a cycle is guarded and each pack merges once",()=>{const a=l.Resolve(s,{home:e}).families?.["doc/Plan"];r.deepEqual(a?.targets.map(n=>n.path),["docs/B.md","docs/A.md"])})}{const e=d("pack-extends-home-"),s=d("pack-extends-self-");o(e,".dsh/playform/workspaces/base.yml",c("","docs/BASE.md",1)),o(s,".dsh/pack.yml",p("[repo, base]")),o(s,"docs/S.md"),m(t,"E3: a self-cycle is skipped and the other base applies",()=>{const a=l.Resolve(s,{home:e}).families?.["doc/Plan"];r.deepEqual(a?.targets.map(n=>n.path),["docs/BASE.md"])})}{const e=d("pack-extends-home-"),s=d("pack-extends-missing-");o(e,".dsh/playform/workspaces/base.yml",c("","docs/BASE.md",1)),o(s,".dsh/pack.yml",p("[missing, base]")),o(s,"docs/S.md"),m(t,"E4: a missing extends link is skipped, the rest resolves",()=>{const a=l.Resolve(s,{home:e}).families?.["doc/Plan"];r.equal(a?.targets.length,1),r.equal(a?.targets[0]?.path,"docs/BASE.md")})}{const e=d("pack-extends-home-"),s=d("pack-extends-array-");o(e,".dsh/playform/workspaces/a.yml",c("","docs/A.md",1)),o(e,".dsh/playform/workspaces/b.yml",c("","docs/B.md",2)),o(s,".dsh/pack.yml",p("[a, b]")),o(s,"docs/S.md"),m(t,"E5: an extends array merges both bases in order",()=>{const a=l.Resolve(s,{home:e}).families?.["doc/Plan"];r.deepEqual(a?.targets.map(n=>n.path),["docs/A.md","docs/B.md"])})}{const e=d("pack-extends-home-"),s=d("pack-extends-override-");o(e,".dsh/playform/workspaces/base.yml",`families:
  "doc/Plan":
    targets:
      - path: docs/SAME.md
        prior: 1.0
        reason: the base reason
`),o(s,".dsh/pack.yml",`slug: repo
signature:
  - docs/S.md
extends: base
families:
  "doc/Plan":
    targets:
      - path: docs/SAME.md
        prior: 1.0
        reason: the repo reason
`),o(s,"docs/S.md"),m(t,"E6: the repo layer overrides its base on the same path",()=>{const a=l.Resolve(s,{home:e}).families?.["doc/Plan"];r.equal(a?.targets.length,1),r.equal(a?.targets[0]?.reason,"the repo reason")})}return i(t,"Extends")},y=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(y){const t=await k();console.log(`${t} PASS - Extends`)}export{k as runTest};
