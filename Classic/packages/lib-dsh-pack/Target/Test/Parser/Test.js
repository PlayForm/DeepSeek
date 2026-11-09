import e from"node:assert/strict";import{Check as r,Finish as o,Library as a,MakeCounter as p,Put as n,Tree as l}from"../Harness.js";const i=async()=>{const s=p();return r(s,"P1: a pack-shaped mapping/sequence tree parses",()=>{e.deepEqual(a.Parse(`signature:
  - docs/STYLE.md
families:
  "doc/Plan":
    priority: 2
    threshold: 0.75
    signals:
      - rule: plan
        pattern: 'Documentation/Plans/.*\\.md$'
        weight: 2.5
    targets:
      - path: docs/STYLE.md
        kind: style
        prior: 1.0
        reason: the temp style
`),{signature:["docs/STYLE.md"],families:{"doc/Plan":{priority:2,threshold:.75,signals:[{rule:"plan",pattern:"Documentation/Plans/.*\\.md$",weight:2.5}],targets:[{path:"docs/STYLE.md",kind:"style",prior:1,reason:"the temp style"}]}}})}),r(s,"P2: comments, blank lines and the document markers are dropped",()=>{e.deepEqual(a.Parse(`---
# the pack
signature: [a, b] # inline

learning:
  propose: true # on
...
`),{signature:["a","b"],learning:{propose:!0}})}),r(s,"P3: single, double and flow scalars",()=>{e.deepEqual(a.Parse(`single: 'it''s'
double: "a\\tb"
flow: ["a", 'b']
empty: []
mapping: {}
`),{single:"it's",double:"a	b",flow:["a","b"],empty:[],mapping:{}})}),r(s,"P4: booleans, null and numbers",()=>{e.deepEqual(a.Parse(`a: true
b: false
c: null
d: ~
e: 1.5
f: -2
g: 01
h: plain text
`),{a:!0,b:!1,c:null,d:null,e:1.5,f:-2,g:"01",h:"plain text"})}),r(s,"P5: the unsupported constructs throw a line-numbered error",()=>{e.throws(()=>a.Parse("a:	1"),/tabs are not supported/),e.throws(()=>a.Parse("a: &x 1"),/anchors are not supported/),e.throws(()=>a.Parse("a: *x"),/aliases are not supported/),e.throws(()=>a.Parse("a: !x 1"),/tags are not supported/),e.throws(()=>a.Parse("a: |"),/block scalars are not supported/),e.throws(()=>a.Parse("a: {b: c}"),/flow collections/),e.throws(()=>a.Parse(`a: 1
a: 2`),/duplicate key a/),e.throws(()=>a.Parse(`a: 1
  b: 2`),/unexpected indentation/),e.throws(()=>a.Parse("a: 'open"),/unterminated single-quoted/)}),r(s,"P6: Read parses .yml and .json and refuses a non-mapping root",()=>{const t=l("pack-parser-");n(t,"pack.yml",`signature:
  - docs/A.md
`),n(t,"pack.json",JSON.stringify({signature:["docs/B.md"]})),n(t,"array.yml",`- a
- b
`),e.deepEqual(a.Read(`${t}/pack.yml`),{signature:["docs/A.md"]}),e.deepEqual(a.Read(`${t}/pack.json`),{signature:["docs/B.md"]}),e.throws(()=>a.Read(`${t}/array.yml`),/the root must be a mapping/)}),o(s,"Parser")},d=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(d){const s=await i();console.log(`${s} PASS - Parser`)}export{i as runTest};
