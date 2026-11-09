import o from"node:assert/strict";import{Check as l,Finish as d,Library as t,MakeCounter as p,Put as c,Tree as r}from"../Harness.js";const u=`signature:
  - docs/STYLE.md
slug: custom
families:
  "doc/Plan":
    id: Plan
    priority: 4
    threshold: 0.5
    note: the temp caveat
    signals:
      - rule: plan
        pattern: 'Documentation/Plans/.*\\.md$'
        weight: 2.5
    targets:
      - path: docs/STYLE.md
        kind: style
        prior: 1.0
        reason: the temp style
`,h=async()=>{const n=p();{const s=r("pack-resolve-home-"),e=r("pack-resolve-builtin-");c(e,"Documentation/ARCHIVE-STYLE.md"),l(n,"R1: no pack layer resolves to the built-in pack",()=>{o.equal(t.Resolve(e,{home:s}),t.Builtin),o.equal(t.Families(t.Resolve(e,{home:s}),"doc").length,7)}),l(n,"R1: the locator finds the built-in workspace by the default signature",()=>{const a=t.Locate("Documentation/INDEX.md",e,{home:s});o.equal(a?.root,e),o.equal(a?.pack,t.Builtin)})}{const s=r("pack-resolve-home-"),e=r("pack-resolve-repo-");c(e,".dsh/pack.yml",u),c(e,"docs/STYLE.md"),l(n,"R2: the repo layer replaces the signature and declares the slug",()=>{const a=t.Resolve(e,{home:s});o.deepEqual(a.signature,["docs/STYLE.md"]),o.equal(a.slug,"custom"),o.equal(Object.keys(a.families??{}).length,1),o.equal(a.families?.["doc/Plan"]?.priority,4),o.equal(a.families?.["doc/Plan"]?.threshold,.5),o.equal(a.families?.["doc/Plan"]?.targets[0]?.path,"docs/STYLE.md")}),l(n,"R2: the locator resolves a foreign workspace by its pack signature",()=>{const a=t.Locate("Documentation/Plans/anything.md",e,{home:s});o.equal(a?.root,e),o.deepEqual(a?.pack.signature,["docs/STYLE.md"]),o.equal(t.Families(a?.pack??{},"doc").length,1)})}{const s=r("pack-resolve-home-"),e=r("pack-resolve-user-");c(s,".dsh/playform/workspaces/custom.yml",`learning:
  propose: true
families:
  "doc/Plan":
    priority: 9
    targets:
      - path: docs/BASE.md
        prior: 0.6
        reason: the user companion
`),c(e,".dsh/pack.yml",`slug: custom
signature:
  - docs/STYLE.md
families:
  "doc/Plan":
    threshold: 0.5
    targets:
      - path: docs/REPO.md
        prior: 1.0
        reason: the repo companion
`),c(e,"docs/STYLE.md"),l(n,"R3: the user layer is read first and the repo layer overrides it",()=>{const a=t.Resolve(e,{home:s}),i=a.families?.["doc/Plan"];o.equal(i?.priority,9),o.equal(i?.threshold,.5),o.deepEqual(i?.targets.map(m=>m.path),["docs/BASE.md","docs/REPO.md"]),o.equal(a.learning?.propose,!0)})}{const s=r("pack-resolve-home-"),e=r("Pack-UserOnly-"),a=e.split("/").pop()??"";c(s,`.dsh/playform/workspaces/${a.toLowerCase()}.yml`,`signature:
  - docs/ONLY.md
families:
  "test/Suite":
    id: Suite
    priority: 1
    threshold: 0.6
`),c(e,"docs/ONLY.md"),l(n,"R4: a user-only layer is located by the lowercased basename",()=>{const i=t.Locate("docs/ONLY.md",e,{home:s});o.equal(i?.root,e),o.equal(t.Families(i?.pack??{},"test").length,1)})}{const s=r("pack-resolve-home-"),e=r("pack-resolve-gate-");c(e,".dsh/pack.yml",`signature:
  - docs/MISSING.md
`),l(n,"R5: a pack whose signature marker is absent does not resolve",()=>{o.equal(t.Locate("anything.md",e,{home:s}),void 0)})}{const s=r("pack-resolve-home-"),e=r("pack-resolve-foreign-");c(e,"Documentation/INDEX.md"),l(n,"R6: a foreign workspace without a pack stays silent",()=>{o.equal(t.Locate("Documentation/INDEX.md",e,{home:s}),void 0)})}{const s=r("pack-resolve-home-"),e=r("pack-resolve-json-");c(e,".dsh/pack.json",JSON.stringify({signature:["docs/JSON.md"],families:{"doc/Index":{priority:2}}})),c(e,"docs/JSON.md"),l(n,"R7: a .json pack resolves through JSON.parse",()=>{const a=t.Locate("docs/JSON.md",e,{home:s});o.equal(a?.root,e),o.equal(t.Families(a?.pack??{},"doc")[0]?.priority,2)})}{const s=r("pack-resolve-home-"),e=r("pack-resolve-memo-");c(e,".dsh/pack.yml",`signature:
  - docs/MEMO.md
`),c(e,"docs/MEMO.md"),l(n,"R8: Load memoizes one pack per root",()=>{o.equal(t.Load(e,{home:s}),t.Load(e,{home:s}))})}return d(n,"Resolve")},k=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(k){const n=await h();console.log(`${n} PASS - Resolve`)}export{h as runTest};
