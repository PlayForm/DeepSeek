import e from"node:assert/strict";import*as s from"../../../Target/Function/Ops.js";import{Check as r,CheckAsync as o,Exec as i,Finish as h,Ledger as f,Make as m,MakeCounter as w,rm as g,Validate as x}from"../Harness.js";const c=(a,t={})=>(g(),m(x({...t,enabled:!0,logFile:f,policy:{write:"auto"}}),a)),d=async(a,t,n,l)=>a.Tool.execute({action:"open",files:l??Object.keys(a.Fs.files),searches:[`s=${t}`],ops:[`file=* search=s op=replace with=${n}`]},i()),y=async()=>{const a=w();{const t=c({"a.txt":`hello
world
`});await o(a,"C1: a commit replaces, writes through the factory and closes the one-shot machine",async()=>{await d(t,"world","HI");const n=await t.Tool.execute({action:"commit",machine:"mach-1"},i());e.equal(n.applied,1),e.equal(n.failed,0),e.equal(n.halted,0),e.deepEqual(n.state,[{file:"a.txt",status:"done",version:"v2",diff:`- world
+ HI`}]),e.equal(t.Fs.files["a.txt"],`hello
HI
`)}),await o(a,"C1: the commit ledger lines are byte-exact",async()=>{e.ok(t.Lines.includes("plugin-dsh-batch-edit: transition running a.txt op=1/1")),e.ok(t.Lines.includes("plugin-dsh-batch-edit: transition applied a.txt version v1 -> v2")),e.ok(t.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (1 applied, 0 failed, 0 halted)")),e.ok(t.Lines.includes("plugin-dsh-batch-edit: machine closed mach-1"))}),await o(a,"C1: the write carried the replaceIfVersion intent and the factory's stash got the fresh version",async()=>{e.equal(t.Fs.writes.length,1),e.deepEqual(t.Fs.writes[0].intent,{kind:"replaceIfVersion",version:"v1"}),e.equal(t.Fs.writes[0].content,`hello
HI
`),e.equal(t.State.Stash.get("key:a.txt"),"v2")})}{const t=c({"package.json":`{
	"name": "x"
}
`}),n=[];t.State.Factory.RegisterGovern("package.json","smoke",(l,p,u)=>{n.push({path:l.displayPath,version:u})}),await o(a,"C2: a package.json write re-runs the registered governance steps exactly once",async()=>{await t.Tool.execute({action:"open",files:["package.json"],searches:["s=x"],ops:["file=* search=s op=replace with=y"]},i()),await t.Tool.execute({action:"commit",machine:"mach-1"},i()),e.deepEqual(n,[{path:"package.json",version:"v2"}]),e.equal(t.Fs.files["package.json"],`{
	"name": "y"
}
`)})}{const t=c({"a.txt":`hello
world
`});await o(a,"C3: an externally touched file halts stale and is protected, not written",async()=>{await d(t,"world","HI"),t.Fs.versions.set("a.txt","v9");const n=await t.Tool.execute({action:"commit",machine:"mach-1"},i());e.equal(n.halted,1),e.equal(n.applied,0),e.deepEqual(n.state,[{file:"a.txt",status:"halted",version:"v1",haltReason:"stale"}]),e.ok(t.Lines.includes("plugin-dsh-batch-edit: transition halted a.txt stale")),e.ok(t.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (0 applied, 0 failed, 1 halted)")),e.equal(t.Fs.files["a.txt"],`hello
world
`)})}{const t=c({"a.txt":`hello
`},{strictMode:!0});await o(a,"C4: a search-not-found under strict mode errors the file loudly",async()=>{await d(t,"missing","HI");const n=await t.Tool.execute({action:"commit",machine:"mach-1"},i());e.equal(n.failed,1),e.deepEqual(n.state,[{file:"a.txt",status:"errored",version:"v1",error:"search not found"}]),e.ok(t.Lines.includes("plugin-dsh-batch-edit: transition errored a.txt search not found"))})}{const t=c({"a.txt":`hello
`});await o(a,"C5: a zero-change commit is the designed no-op - nothing written, nothing logged",async()=>{await t.Tool.execute({action:"open",files:["a.txt"],searches:["s=zzz"],ops:["file=* search=s op=replace with=HI"]},i());const n=await t.Tool.execute({action:"commit",machine:"mach-1"},i());e.equal(n.applied,0),e.deepEqual(n.state,[{file:"a.txt",status:"observed",version:"v1"}]),e.equal(t.Fs.writes.length,0),e.ok(t.Lines.includes("plugin-dsh-batch-edit: machine committed mach-1 (0 applied, 0 failed, 0 halted)")),e.ok(!t.Lines.some(l=>l.includes("transition applied")))})}{const t=c({"1-first.txt":`one
`,"2-second.txt":`two
`});await o(a,"C6: a failed write stops the apply loop - the remainder returns to observed",async()=>{t.Fs.failWrite="1-first.txt",await d(t,"one","UNO");const n=await t.Tool.execute({action:"commit",machine:"mach-1"},i());e.equal(n.failed,1),e.equal(n.applied,0),e.ok(t.Lines.includes("plugin-dsh-batch-edit: transition errored 1-first.txt write denied"));const l=n.state.find(p=>p.file==="2-second.txt");e.equal(l.status,"observed"),e.equal(t.Fs.writes.length,0)})}return r(a,"C7: replace with mode first replaces only the first occurrence",()=>{e.deepEqual(s.ApplyOp("a a a","a","replace","b","first",!1),{next:"b a a",count:1}),e.deepEqual(s.ApplyOp("a a a","a","replace","b",2,!1),{next:"b b a",count:2}),e.deepEqual(s.ApplyOp("a a a","a","replace","b",void 0,!1),{next:"b b b",count:3})}),r(a,"C7: a regex search counts and replaces through the same executor",()=>{const t=s.ApplyOp("aa12bb34",/[0-9]+/,"replace","#",void 0,!1);e.deepEqual(t,{next:"aa#bb#",count:2})}),r(a,"C7: the line ops insert before/after and remove the matched lines",()=>{e.deepEqual(s.ApplyOp(`one
two
three`,"two","insert-before","X",void 0,!1),{next:`one
X
two
three`,count:1}),e.deepEqual(s.ApplyOp(`one
two
three`,"two","insert-after","X",void 0,!1),{next:`one
two
X
three`,count:1}),e.deepEqual(s.ApplyOp(`one
two
three`,"two","remove-line","",void 0,!1),{next:`one
three`,count:1})}),r(a,"C7: append and prepend pad the newline honestly",()=>{e.deepEqual(s.ApplyOp("one","s","append","X",void 0,!1),{next:`one
X
`,count:1}),e.deepEqual(s.ApplyOp(`one
`,"s","append","X",void 0,!1),{next:`one
X
`,count:1}),e.deepEqual(s.ApplyOp("one","s","prepend","X",void 0,!1),{next:`X
one`,count:1})}),r(a,"C7: the diff is the bounded removed/added line list",()=>{e.equal(s.Diff(`a
b
c
`,`a
c
`),"- b"),e.equal(s.Diff(`a
`,`a
X
`),"+ X"),e.equal(s.Diff("","",2e3),"")}),h(a,"Commit-And-Ops")},q=process.argv[1]!==void 0&&import.meta.url===(await import("node:url")).pathToFileURL(process.argv[1]).href;if(q){const a=await y();console.log(`${a} PASS - Commit-And-Ops`)}export{y as runTest};
