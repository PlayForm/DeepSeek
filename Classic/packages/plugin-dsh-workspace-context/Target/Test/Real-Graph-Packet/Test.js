import e from"node:assert/strict";import l from"../../../Target/Function/Render.js";import{Check as r,CheckAsync as p,Finish as d,Ledger as u,LedgerWith as h,LinesWith as w,Make as k,MakeCounter as C,RealGraph as f,Validate as m,rm as E}from"../Harness.js";const F=`import { util } from "./util.ts";

export function core(): number {
	return util;
}
`,g=`export const util = 1;
`,x=`import { core } from "./core.ts";

export const suite = core;
`,q=`# The workspace

Intro text.

## Section
`,R={"/ws/src/core.ts":F,"/ws/src/util.ts":g,"/ws/src/core.test.ts":x,"/ws/README.md":q},S=async()=>{const t=C();E();const c=f(R),i=await c.indexWorkspace("/ws"),o=k(m({logFile:u,enabled:!0}),s=>{s.workspaceGraph=c}),a=c.getNode("File:/ws/src/core.ts");{const s=o.Context.workspaceContext.packet({id:"File:/ws/src/core.ts"});r(t,"C1: the real indexing trigger populated the graph the packet reads",()=>{e.deepEqual(i,{indexed:4,skipped:0,failed:0,files:4}),e.equal(c.statistics().indexRevision,"4"),e.ok(a!==void 0)}),r(t,"C1: the WORKSPACE and SCOPE lines carry the real revision and scope",()=>{e.equal(s.workspace,"WORKSPACE workspace @ 4"),e.equal(s.scope,"SCOPE File:/ws/src/core.ts")}),r(t,"C1: the MAP band groups the real absolute paths by parent directory",()=>{e.deepEqual(s.map,["/ws/src (3 files)","/ws (1 files)"])}),r(t,"C1: the FOCUS line carries the real span, fingerprint prefix and version",()=>{e.equal(s.focus,`FOCUS File:/ws/src/core.ts span 1-5 fp ${a.fingerprint.slice(0,12)} v v1`),e.equal(s.nodeId,"File:/ws/src/core.ts"),e.equal(s.nodeVersion,"v1")}),r(t,"C1: the NEIGHBORS band ranks the real edges (imports before contains)",()=>{e.deepEqual(s.neighbors,["imports File:/ws/src/core.ts -> File:/ws/src/util.ts","contains File:/ws/src/core.ts -> Block:/ws/src/core.ts:4:body","contains File:/ws/src/core.ts -> Symbol:/ws/src/core.ts:core"])}),r(t,"C1: the EVIDENCE band carries the real files and spans",()=>{e.deepEqual(s.evidence,["/ws/src/core.ts 1-5","/ws/src/util.ts -"])}),r(t,"C1: OPEN is (none) - the real graph answered, this is not the empty form",()=>{e.deepEqual(s.open,["(none)"]),e.equal(s.tokens,Math.ceil(l(s).length/4))})}{const s=o.Context.workspaceContext.packet({id:"File:/ws/src/core.ts",caller:"real"});r(t,"C2: the packet line is byte-exact and the caller's focus is tracked",()=>{e.deepEqual(o.Context.workspaceContext.focusOf("real"),{id:"File:/ws/src/core.ts",version:"v1"}),e.ok(w(o,`packet File:/ws/src/core.ts (${s.tokens} tok, lens code)`).length>0),e.ok(h(`packet File:/ws/src/core.ts (${s.tokens} tok, lens code)`).length>=1)})}{const s=o.Tools[0];await p(t,"C3: the tool renders the real packet text",async()=>{const n=await s.execute({id:"File:/ws/src/core.ts"});e.equal(n.text.startsWith("WORKSPACE workspace @ 4"),!0),e.equal(n.text.includes(`
NEIGHBORS
imports File:/ws/src/core.ts -> File:/ws/src/util.ts`),!0),e.equal(n.text.includes(`
EVIDENCE
/ws/src/core.ts 1-5`),!0),e.equal(n.lens,"code"),e.equal(n.stale,!1)})}return r(t,"C4: the context plugin's fs records ZERO writes and reads",()=>{e.equal(o.Fs.writes.length,0),e.equal(o.Fs.reads.length,0)}),d(t,"Real-Graph-Packet")},O=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(O){const t=await S();console.log(`${t} PASS - Real-Graph-Packet`)}export{S as runTest};
