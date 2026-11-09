import e from"node:assert/strict";import{Call as c,Check as i,Finish as u,LinesWith as a,MakeCounter as g,RealGraph as m,Setup as h}from"../Harness.js";const w=`export function core(): number {
	return 1;
}
`,b=`import { core } from "./Core.ts";

export const used = core;
`,E=`import { core } from "./Core.ts";

export const suite = core;
`,S=`# The workspace

Text.
`,f={"/ws/Source/Core.ts":w,"/ws/Source/Use.ts":b,"/ws/Source/Core.test.ts":E,"/ws/README.md":S},d={file_path:"/ws/Source/Core.ts",pattern:"export function",glob:"**/*.ts"},q=async()=>{const s=g(),n=m(f),p=await n.indexWorkspace("/ws"),r=h({},t=>{t.workspaceGraph=n}),l=await c(r,"read",d);i(s,"G1: the real graph yielded the neighborhood component",()=>{e.deepEqual(p,{indexed:4,skipped:0,failed:0,files:4}),e.deepEqual(n.neighborhood("/ws/Source/Core.ts").map(t=>`${t.path} ${t.role}`),["/ws/Source/Core.ts definition","/ws/Source/Core.test.ts test","/ws/Source/Use.ts importer"])}),i(s,"G1: the suggest line is byte-exact and the graph answered",()=>{e.deepEqual(a(r,"candidates call"),["graph-suggester: suggest Neighborhood 0.87 2 candidates call read"]),e.equal(a(r,"graph unavailable").length,0),e.equal(a(r,"abstained").length,0)}),i(s,"G1: the note carries the real candidate paths and reasons",()=>{e.ok(Array.isArray(l.additionalContexts)),e.equal(l.additionalContexts.length,1),e.equal(l.additionalContexts[0].content[0].text,`[graph-suggester] intent=Neighborhood confidence=0.87
targets (2):
- /ws/Source/Core.test.ts - the tests
- /ws/Source/Use.ts - the importers
note: the files around this one: importers, dependencies, tests, doc block.`),e.equal(l.kind,"allow")}),i(s,"G1: the candidates are the graph's own entries minus the anchor",()=>{const t=l.additionalContexts[0].content[0].text.split(`
`).filter(o=>o.startsWith("- ")).map(o=>o.slice(2).split(" - ")[0]);e.deepEqual(t,n.neighborhood("/ws/Source/Core.ts").map(o=>o.path).filter(o=>o!=="/ws/Source/Core.ts"))});{const t=h({},o=>{o.workspaceGraph=n});await c(t,"read",{...d,file_path:"/ws/Source/Missing.ts"}),i(s,"G2: an unknown anchor is an empty component, so the hook abstains honestly",()=>{e.deepEqual(n.neighborhood("/ws/Source/Missing.ts"),[]),e.deepEqual(a(t,"candidates call"),[]),e.deepEqual(a(t,"abstained"),["graph-suggester: abstained no-companions Neighborhood 0.87"]),e.equal(a(t,"graph unavailable").length,0)})}i(s,"G3: the suggester's fs capture records ZERO operations",()=>{e.equal(r.Fs.reads.length,0),e.equal(r.Fs.writes.length,0),e.equal(r.Fs.resolved.length,0),e.equal(r.Fs.stats.length,0)});{const t=h({},o=>{o.workspaceGraph=n});await c(t,"read",{...d,file_path:"/ws/README.md"}),i(s,"G4: an anchor-only component abstains no-companions",()=>{e.deepEqual(n.neighborhood("/ws/README.md").map(o=>o.path),["/ws/README.md"]),e.deepEqual(a(t,"candidates call"),[]),e.deepEqual(a(t,"abstained"),["graph-suggester: abstained no-companions Neighborhood 0.87"]),e.equal(a(t,"graph unavailable").length,0)}),i(s,"G4: the note of the real component never names the anchor",()=>{e.equal(l.additionalContexts[0].content[0].text.includes("/ws/Source/Core.ts"),!1)})}return u(s,"Real-Graph-Neighborhood")},C=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(C){const s=await q();console.log(`${s} PASS - Real-Graph-Neighborhood`)}export{q as runTest};
