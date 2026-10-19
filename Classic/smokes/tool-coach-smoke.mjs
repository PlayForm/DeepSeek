// Classic/smokes/tool-coach-smoke.mjs - the family smoke pattern: a fake ctx
// (on capture, get returning the REAL @playform/plugin-dsh-factory instance
// from its built Target, logger capture, a configurable tools.schemas seam) +
// the REAL tool-coach apply (from the built Target) -> assert the full
// coaching ladder: R1-R6 (the escalation ladder, TOOL-COACH-PLAN.md §7) and
// D1-D5 (the dynamic-fetch engine, TOOL-COACH-OPERATIVE-PLAN.md §4.3), with
// byte-exact ledger strings.
//
// The 10 ledger strings are the CONTRACT (operative plan §4.2, byte-exact,
// `hook-dsh-tool-coach: ` prefix):
//   offense / strike / cooldown suppressed / escalated persistent section /
//   persistent section cleared / section rebuilt / denied / exempt /
//   schema fetch failed -> static fallback / disabled (enabled=false).
import { rmSync, readFileSync, existsSync } from "node:fs";
import Coach from "../packages/hook-dsh-tool-coach/Target/Library.js";
import Detect from "../packages/hook-dsh-tool-coach/Target/Function/Detect.js";
import { DEFAULT_EXEMPTS, DEFAULT_PATTERNS } from "../packages/hook-dsh-tool-coach/Target/Variable/Patterns.js";
import { NOTE_FIRST, NOTE_PERSISTENT, NOTE_DENIED, STATIC_TOOL_LINES } from "../packages/hook-dsh-tool-coach/Target/Variable/Notes.js";
import FactoryClass from "../packages/plugin-dsh-factory/Target/Library.js";

const Ledger = "/tmp/hook-dsh-tool-coach-smoke.log";
let Pass = 0,
	Fail = 0;
const Check = (Condition, Message) => {
	if (Condition) {
		Pass += 1;
		console.log(`PASS - ${Message}`);
	} else {
		Fail += 1;
		console.log(`FAIL - ${Message}`);
	}
};
const rm = () => {
	try {
		rmSync(Ledger);
	} catch {}
};

// The REAL factory instance (constructed exactly the way the factory's own
// smoke does - the Service base constructor registers through
// ctx.reflect.probe; the stub context is used once and discarded).
const Furnace = new FactoryClass({ reflect: { provide: () => undefined } });

// The LIVE registry fixture (the fake ctx.tools.schemas). The read
// description carries a distinctive `(live fixture)` marker so the smoke can
// tell a LIVE fetch from the STATIC fallback table (D1 vs D2).
const LiveSchemas = () => [
	{
		name: "read",
		description: "Read a UTF-8 text file (live fixture) and return line-numbered content.",
		parameters: { properties: { file_path: {}, offset: {} } },
	},
	{
		name: "write",
		description: "Create or fully replace a UTF-8 text file.",
		parameters: { properties: { file_path: {} } },
	},
	{
		name: "edit",
		description: "Edit an existing UTF-8 text file by replacing literal text.",
		parameters: { properties: { old_string: {}, new_string: {} } },
	},
	{
		name: "grep",
		description: "Search file contents with a ripgrep regular expression.",
		parameters: { properties: { pattern: {} } },
	},
	{
		name: "web_search",
		description: "Search the web for current information.",
		parameters: { properties: { queries: {} } },
	},
	{
		name: "zzz_fixture",
		description: "Fixture tool for the top-up ordering.",
		parameters: { properties: { x: {} } },
	},
];

// The pattern rows the assertions name (located from the ACTUAL defaults, so
// the expected strings cannot drift from the table).
const RowFor = (Needle) => DEFAULT_PATTERNS.find((Row) => Row.pattern.includes(Needle));
const CAT_ROW = RowFor("(cat|less|more").pattern;
const SED_ROW = RowFor("\\bsed\\b").pattern;
const JQ_EXEMPT = DEFAULT_EXEMPTS.find((Pattern) => Pattern.includes("jq"));

// The fake ctx: on() captures listeners, get() serves the REAL factory,
// logger captures info + warn lines, tools.schemas is configurable.
const Make = (Raw, Options = {}) => {
	const Listeners = {},
		ListenerOptions = {},
		Lines = [],
		Warns = [];
	const Context = {
		pluginFactory: Furnace,
		tools: Options.tools ?? { schemas: LiveSchemas },
		on: (Name, Listener, Opts) => {
			Listeners[Name] = Listener;
			ListenerOptions[Name] = Opts;
			return () => true;
		},
		get: (Name) => {
			switch (Name) {
				case "pluginFactory":
					return Furnace;
				case "tools":
					return Context.tools;
				default:
					throw new Error(`unknown service: ${Name}`);
			}
		},
		logger: {
			info: (M) => {
				Lines.push(M);
			},
			warn: (M) => {
				Warns.push(M);
			},
		},
		get root() {
			return Context;
		},
	};
	const Returned = Coach.apply(Context, Raw);
	return {
		Context,
		Listeners,
		ListenerOptions,
		Lines,
		Warns,
		Returned,
		State: Context.__hookDshToolCoachState,
	};
};

const { apply: ApplyUnused, Config: Schema } = Coach;
void ApplyUnused;
const Validate = (Raw) => Schema({ ...Raw });

// Stable downstream decisions shared by every fake Next (so identity checks
// `Out === Downstream` are meaningful).
const ACCEPT = { kind: "accept" };
const ALLOW = { kind: "allow" };
// A judged terminal call through the post-execute listener.
const Agent = (Id) => ({ id: Id });
const AgentA = Agent("agent-a");
const Post = (Run, Command, Who = AgentA, Name = "bash") =>
	Run.Listeners["tools/post-execute"](
		{ callId: "call_smoke", name: Name, arguments: { command: Command }, agent: Who, signal: undefined },
		{ isError: false, value: "", content: [] },
		async () => ACCEPT,
	);
const Pre = (Run, Command, Who = AgentA, Name = "bash") =>
	Run.Listeners["tools/pre-execute"](
		{ callId: "call_smoke", name: Name, arguments: { command: Command }, agent: Who, signal: undefined },
		async () => ALLOW,
	);
const Assemble = async (Run, Who = AgentA) => {
	const Assembly = {
		sections: [{ name: "base", text: "BASE" }],
		contexts: [{ name: "ctx", text: "CTX" }],
		tools: [{ name: "read", description: "d", parameters: {} }],
		variables: { v: "1" },
	};
	return Run.Listeners["system-prompt/assemble"](Assembly, { agent: Who }, async () => Assembly);
};
const LinesWith = (Run, Needle) => Run.Lines.filter((L) => L.includes(Needle));

// -----------------------------------------------------------------------
// Run 1: the wiring + defaults + activation.
// -----------------------------------------------------------------------
rm();
const Raw1 = Validate({ logFile: Ledger });
Check(typeof Raw1.log.get === "function", "volatile cell: log arrives as { get }");
Check(typeof Raw1.enabled.get === "function", "volatile cell: enabled arrives as { get }");
Check(typeof Raw1.fetchLive.get === "function", "volatile cell: fetchLive arrives as { get }");
Check(typeof Raw1.notes.get === "function", "volatile cell: notes arrives as { get } (object cell)");
Check(Raw1.threshold.get() === 3, "config default threshold=3");
Check(Raw1.window.get() === 8, "config default window=8");
Check(Raw1.cooldown.get() === 10, "config default cooldown=10");
Check(Raw1.escalateThreshold.get() === 6, "config default escalateThreshold=6");
Check(Raw1.cleanWindow.get() === 12, "config default cleanWindow=12");
Check(Raw1.enforce.get() === "off", "config default enforce=off");
Check(Raw1.enforceThreshold.get() === 4, "config default enforceThreshold=4");
Check(Raw1.maxSectionTools.get() === 8, "config default maxSectionTools=8");
Check(Raw1.sectionTtl.get() === 20, "config default sectionTtl=20");
Check(Raw1.fetchLive.get() === true, "config default fetchLive=true");
Check(
	JSON.stringify(Raw1.judgeTools.get()) === JSON.stringify(["bash", "pwsh"]),
	"config default judgeTools=[bash,pwsh]",
);
Check(
	JSON.stringify(Raw1.notes.get()) ===
		JSON.stringify({ first: NOTE_FIRST, persistent: NOTE_PERSISTENT, denied: NOTE_DENIED }),
	"config default notes: the three verbatim templates",
);
Check(
	JSON.stringify(Raw1.patternTable.get()) === JSON.stringify(DEFAULT_PATTERNS),
	"config default patternTable = the built-in adversarial table",
);
Check(
	JSON.stringify(Raw1.exemptPatterns.get()) === JSON.stringify(DEFAULT_EXEMPTS),
	"config default exemptPatterns = the built-in legitimate-bash boundary",
);
const Run1 = Make(Raw1);
Check(Run1.Returned === undefined, "apply returns NOTHING (the loader contract)");
Check(
	["tools/post-execute", "tools/pre-execute", "agent/pre-step", "system-prompt/assemble", "tools/change"].every(
		(Name) => typeof Run1.Listeners[Name] === "function",
	),
	"all FIVE coaching listeners are registered",
);
Check(
	Run1.Listeners["loader/volatile-update"] !== undefined,
	"plus the State builder's P10 loader/volatile-update refresh",
);
Check(
	Object.keys(Run1.Listeners).length === 6,
	"exactly six registrations (5 coaching + 1 volatile refresh)",
);
Check(
	Run1.ListenerOptions["tools/post-execute"] === undefined,
	"tools/post-execute is a PLAIN registration (runs AFTER ccr's {prepend:true})",
);
Check(
	Run1.ListenerOptions["tools/pre-execute"] === undefined &&
		Run1.ListenerOptions["system-prompt/assemble"] === undefined,
	"pre-execute and assemble are plain registrations too",
);
Check(Coach.name === "hook-dsh-tool-coach", "the module identity is hook-dsh-tool-coach");
Check(
	JSON.stringify(Coach.inject) === JSON.stringify(["pluginFactory", "tools"]),
	"inject = [pluginFactory, tools]",
);
Check(Run1.State.Module === "hook-dsh-tool-coach", "state module = hook-dsh-tool-coach (the ledger prefix)");
Check(Run1.State.Factory === Furnace, "state carries the REAL factory instance");
Check(Run1.State.On === true, "volatile unwrap: enabled cell -> State.On=true");
Check(Run1.State.Threshold === 3, "volatile unwrap: threshold cell -> State.Threshold=3");
Check(Run1.State.FetchLive === true, "volatile unwrap: fetchLive cell -> State.FetchLive=true");
Check(
	Run1.Lines.includes(
		"hook-dsh-tool-coach: activated (bundle 0.0.1, threshold=3/8, cooldown=10, escalate=6, clean=12, enforce=off@4, judge=bash,pwsh, fetch=live)",
	),
	"activation ledger line byte-exact",
);
Check(
	existsSync(Ledger) && readFileSync(Ledger, "utf8").includes(
		"] activated (bundle 0.0.1, threshold=3/8, cooldown=10, escalate=6, clean=12, enforce=off@4, judge=bash,pwsh, fetch=live)",
	),
	"the durable ledger file carries the [ISO] activation line",
);

// -----------------------------------------------------------------------
// R1: legitimate bash passthrough - zero strikes, zero notes, zero lines.
// -----------------------------------------------------------------------
rm();
const RunR1 = Make(Validate({ logFile: Ledger }));
const Legit = ["git status", "pnpm build", "node x.js", "ls", "rm -rf build", "python script.py", "make", "docker ps", "echo hello", "true"];
let R1Passthrough = true;
for (const Command of Legit) {
	const Out = await Post(RunR1, Command);
	if (Out !== ACCEPT) {
		R1Passthrough = false;
	}
}
Check(R1Passthrough, "R1: all 10 legitimate calls pass through with NO additionalContexts");
Check(RunR1.Lines.filter((L) => L.startsWith("hook-dsh-tool-coach: activated")).length === 1,
	"R1: the only ledger line is the activation");
Check(RunR1.Warns.length === 0, "R1: no warnings (no listener ever throws)");

// -----------------------------------------------------------------------
// R2: detect + strike - 3 offenses below the per-class threshold, the 4th
// (same class) notes; the note text is byte-exact and carries the LIVE
// fetch (D1's discriminator).
// -----------------------------------------------------------------------
rm();
const RunR2 = Make(Validate({ logFile: Ledger }));
const AgentR2 = Agent("agent-r2");
await Post(RunR2, "cat a.md", AgentR2);
await Post(RunR2, "cat a.md", AgentR2);
await Post(RunR2, "sed -i s/x/y/ b.md", AgentR2);
Check(
	LinesWith(RunR2, ": offense bash read ").length === 2 &&
		LinesWith(RunR2, `: offense bash read ${CAT_ROW}`).length === 2,
	"R2: two offense lines for the read-class cat, byte-exact pattern",
);
Check(
	LinesWith(RunR2, `: offense bash write ${SED_ROW}`).length === 1,
	"R2: one offense line for the write-class sed -i, byte-exact pattern",
);
Check(LinesWith(RunR2, ": strike ").length === 0, "R2: no note below the threshold (mixed classes, read at 2)");
const R2Out = await RunR2.Listeners["tools/post-execute"](
	{ callId: "call_smoke", name: "bash", arguments: { command: "cat a.md" }, agent: AgentR2, signal: undefined },
	{ isError: false, value: "", content: [] },
	async () => ACCEPT,
);
Check(R2Out !== ACCEPT && R2Out.kind === "accept", "R2: the 4th read offense returns a NEW decision");
Check(
	JSON.stringify(R2Out.additionalContexts?.[0]?.source) ===
		JSON.stringify({ kind: "tool-coach", form: "notice", summary: "bash read × 4" }),
	"R2/D1: the notice carries the load-bearing source label {kind, form, summary}",
);
const R2Text = R2Out.additionalContexts[0].content[0].text;
Check(
	R2Text ===
		`Tool-coach note (strike 4, read-class bash pattern):
- "cat a.md" is forbidden for file content. Use the read tool instead.
- read: Read a UTF-8 text file (live fixture) and return line-numbered content. (key parameter: file_path).
- terminal edits produce no fs/observed event, so the governor/pinner/normalize plugins never see them.
The terminal runs COMMANDS (builds, tests, git, package managers); the tools handle CONTENT.`,
	"R2/D1: the tier-1 note text is byte-exact with the LIVE (fetched) description",
);
Check(!R2Text.includes("${"), "D1: no literal ${ placeholder remains in the composed note");
Check(
	LinesWith(RunR2, ": strike 4/3 bash read -> note read").length === 1,
	"R2: the strike ledger line is byte-exact: 'strike 4/3 bash read -> note read'",
);
Check(
	existsSync(Ledger) && readFileSync(Ledger, "utf8").includes(`] strike 4/3 bash read -> note read`),
	"the durable ledger file carries the [ISO] strike line",
);

// -----------------------------------------------------------------------
// R3: cooldown - offenses inside the cooldown suppress the note; the second
// note waits for the cooldown; tier 2 escalates on the way (6 strikes since
// the note).
// -----------------------------------------------------------------------
const AgentR3 = Agent("agent-r3");
for (let Index = 0; Index < 9; Index += 1) {
	await Post(RunR2, "cat a.md", AgentR3);
}
Check(
	LinesWith(RunR2, ": cooldown suppressed ").length === 6,
	"R3: six cooldown-suppressed lines for the offenses inside the cooldown (calls 4-9)",
);
Check(
	LinesWith(RunR2, ": strike 3/3 bash read -> note read").length === 1,
	"R3: the fresh agent's own first note fired at its 3rd offense (per-class threshold)",
);
Check(
	LinesWith(RunR2, ": cooldown suppressed 8 bash read").length >= 1,
	"R3: the suppressed line carries the total strikes: 'cooldown suppressed 8 bash read'",
);
Check(
	LinesWith(RunR2, ": escalated persistent section (8 strikes)").length === 1,
	"R3: tier 2 escalates at 6 strikes since the note: 'escalated persistent section (8 strikes)'",
);
Check(
	LinesWith(RunR2, ": strike ").length === 2,
	"R3: still only TWO strike lines (no second note inside the cooldown)",
);
for (let Index = 0; Index < 3; Index += 1) {
	await Post(RunR2, "cat a.md", AgentR3);
}
Check(
	LinesWith(RunR2, ": cooldown suppressed ").length === 9,
	"R3: nine cooldown-suppressed lines in total (calls 4-12)",
);
await Post(RunR2, "cat a.md", AgentR3); // the 10th judged call since the note
Check(
	LinesWith(RunR2, ": strike 8/3 bash read -> note read").length === 1,
	"R3: the second note fires exactly when the cooldown elapses (window capped at 8)",
);

// -----------------------------------------------------------------------
// R4: tier 2 - the persistent section turns on, appends EXACTLY one section
// with every other assembly field untouched, and clears after the clean
// window.
// -----------------------------------------------------------------------
rm();
const RunR4 = Make(Validate({ logFile: Ledger }));
const AgentR4 = Agent("agent-r4");
for (let Index = 0; Index < 9; Index += 1) {
	await Post(RunR4, "cat a.md", AgentR4);
}
Check(
	LinesWith(RunR4, ": escalated persistent section (8 strikes)").length === 1,
	"R4: the escalation line fires at the 6th strike since the note",
);
const Before = await Assemble(RunR4, AgentR4);
Check(Before.sections.length === 2, "R4: the assembled sections are base + the coach's");
Check(Before.sections[0].name === "base" && Before.sections[0].text === "BASE", "R4: the base section untouched");
Check(Before.sections[1].name === "hook-dsh-tool-coach", "R4: the appended section is the coach's");
Check(
	Before.sections[1].text.startsWith("Tool discipline (persistent, from tool-coach):"),
	"R4: the section text starts with the verbatim heading",
);
Check(Before.contexts.length === 1 && Before.variables.v === "1" && Before.tools.length === 1,
	"R4: contexts, tools and variables are DEEP-EQUAL untouched (PTC + structured-output preserved)");
Check(
	Before.sections[1].text.includes(
		'- NEVER read file content through the terminal: "cat a.md-style" commands',
	) &&
		Before.sections[1].text.includes(
			"- NEVER mutate file content through the terminal: cat a.md-style commands",
		),
	"R4: the ${command} fill lands in both fixed rules",
);
Check(
	!Before.sections[1].text.includes("${"),
	"R4/D1: no literal ${ placeholder remains in the composed section",
);
const Table = Before.sections[1].text.split("| tool | purpose |")[1] ?? "";
const Rows_ = Table.split("\n").filter((Row) => Row.startsWith("| ") && !Row.startsWith("| ---"));
Check(Rows_.length === 8, "R4: the tool table has exactly maxSectionTools (8) rows");
Check(Rows_[0] === "| edit | Edit an existing UTF-8 text file by replacing literal text. |",
	"R4: the first row is the write-class mapped tool (edit), live description");
Check(Rows_[2] === "| read | Read a UTF-8 text file (live fixture) and return line-numbered content. |",
	"R4: the third row is the read-class mapped tool with the LIVE description");
Check(
	!Rows_.some((Row) => Row.includes("zzz_fixture")),
	"R4: the cap holds - with 11 mapped tools the 8 rows are all mapped (the top-up appears in D3b)",
);
Check(
	LinesWith(RunR4, ": section rebuilt").length === 0,
	"R4: the FIRST section build logs no rebuild line",
);
const OffensesBeforeClean = LinesWith(RunR4, ": offense bash read").length;
for (let Index = 0; Index < 12; Index += 1) {
	await Post(RunR4, "git status", AgentR4);
}
Check(
	LinesWith(RunR4, ": persistent section cleared (12 clean calls)").length === 1,
	"R4: 12 clean judged calls clear the section: 'persistent section cleared (12 clean calls)'",
);
const After = await Assemble(RunR4, AgentR4);
Check(
	After.sections.length === 1 && After.sections[0].name === "base",
	"R4: after the clean window the assembly has NO coach section (returns untouched)",
);
Check(
	LinesWith(RunR4, ": offense bash read").length === OffensesBeforeClean,
	"R4: the clean git status calls wrote no NEW offense lines",
);

// -----------------------------------------------------------------------
// R5: enforce - the tier-3 deny fires for write class at the threshold, the
// reason is the byte-exact NOTE_DENIED text, read class is not denied under
// 'write', 'all' denies read too, 'off' never denies.
// -----------------------------------------------------------------------
rm();
const RunR5 = Make(Validate({ logFile: Ledger, enforce: "write" }));
const AgentR5 = Agent("agent-r5");
for (let Index = 0; Index < 7; Index += 1) {
	await Post(RunR5, "sed -i s/x/y/ f", AgentR5);
}
Check(
	LinesWith(RunR5, ": strike 3/3 bash write -> note edit").length === 1,
	"R5: the tier-1 note fired at the write-class threshold on the way",
);
const R5Denied = await Pre(RunR5, "sed -i s/x/y/ f", AgentR5);
Check(
	JSON.stringify(R5Denied) ===
		JSON.stringify({
			kind: "deny",
			reason: `Blocked by tool-coach: "sed -i s/x/y/ f" is forbidden (write-class bash pattern). Use the edit tool for this operation instead — Edit an existing UTF-8 text file by replacing literal text. (key parameter: old_string). Then rerun only the legitimate command parts (build/test/git), if any.`,
		}),
	"R5/D1: the deny reason is the byte-exact NOTE_DENIED text with the fetched edit entry",
);
Check(
	LinesWith(RunR5, `: denied bash write ${SED_ROW} -> use edit`).length === 1,
	"R5: the denied ledger line is byte-exact: 'denied bash write <sed row> -> use edit'",
);
const R5Cat = await Pre(RunR5, "cat f", AgentR5);
Check(R5Cat === ALLOW, "R5: read class is NOT denied under enforce='write'");
const RunR5all = Make(Validate({ logFile: Ledger, enforce: "all" }));
const AgentR5all = Agent("agent-r5-all");
for (let Index = 0; Index < 7; Index += 1) {
	await Post(RunR5all, "cat f", AgentR5all);
}
const R5allCat = await Pre(RunR5all, "cat f", AgentR5all);
Check(R5allCat.kind === "deny", "R5: under enforce='all' the read class IS denied");
const RunR5off = Make(Validate({ logFile: Ledger, enforce: "off" }));
const AgentR5off = Agent("agent-r5-off");
for (let Index = 0; Index < 7; Index += 1) {
	await Post(RunR5off, "sed -i s/x/y/ f", AgentR5off);
}
Check(
	(await Pre(RunR5off, "sed -i s/x/y/ f", AgentR5off)) === ALLOW,
	"R5: under enforce='off' nothing is ever denied",
);

// -----------------------------------------------------------------------
// R6: exempt + enabled=false + N=0.
// -----------------------------------------------------------------------
rm();
const RunR6 = Make(Validate({ logFile: Ledger }));
const AgentR6 = Agent("agent-r6");
for (const Command of ["rm -rf build", "git commit -m x", "cp a b", "echo hi", "python script.py"]) {
	await Post(RunR6, Command, AgentR6);
}
Check(RunR6.Lines.every((L) => !L.includes(": offense") && !L.includes(": exempt")),
	"R6: rm/git commit/cp/echo/python script.py write NO lines (not even exempt)");
await Post(RunR6, "cat f.json | jq", AgentR6);
Check(
	LinesWith(RunR6, `: exempt bash ${JQ_EXEMPT}`).length === 1,
	"R6: the cat|jq carve-out logs the exempt line once: 'exempt bash <carve-out>'",
);
await Post(RunR6, "cat g.json | jq", AgentR6);
Check(
	LinesWith(RunR6, ": exempt bash").length === 1,
	"R6: the exempt line is deduped per distinct pattern per agent",
);
Check(
	existsSync(Ledger) && readFileSync(Ledger, "utf8").includes(`] exempt bash ${JQ_EXEMPT}`),
	"the durable ledger file carries the [ISO] exempt line",
);
rm();
const RunR6off = Make(Validate({ logFile: Ledger, enabled: false }));
Check(
	RunR6off.Lines.includes("hook-dsh-tool-coach: disabled (enabled=false)"),
	"R6: the disabled ledger line is byte-exact: 'disabled (enabled=false)'",
);
const R6offOut = await Post(RunR6off, "cat a.md", Agent("agent-r6-off"));
Check(
	R6offOut === ACCEPT,
	"R6: enabled=false - every listener returns next() untouched (full passthrough)",
);
Check(RunR6off.Lines.every((L) => !L.includes(": offense")), "R6: enabled=false writes no offense lines");
rm();
const RunR6n0 = Make(Validate({ logFile: Ledger, patternTable: [] }));
const R6n0Out = await Post(RunR6n0, "cat a.md", Agent("agent-r6-n0"));
Check(
	R6n0Out.kind === "accept" && R6n0Out.additionalContexts === undefined,
	"R6: an emptied pattern table = N=0 passthrough",
);
Check(RunR6n0.Lines.every((L) => !L.includes(": offense")), "R6: N=0 writes no offense lines");

// -----------------------------------------------------------------------
// D2: the fetch failure - schemas() throws, the note degrades to the static
// table, the ledger carries the fetch-failure line, the waterfall continues.
// -----------------------------------------------------------------------
rm();
const RunD2 = Make(Validate({ logFile: Ledger }), {
	tools: {
		schemas: () => {
			throw new Error("registry exploded");
		},
	},
});
const AgentD2 = Agent("agent-d2");
await Post(RunD2, "cat a.md", AgentD2);
await Post(RunD2, "cat a.md", AgentD2);
const D2Out = await Post(RunD2, "cat a.md", AgentD2); // the 3rd read offense notes (same class)
const D2Text = D2Out.additionalContexts[0].content[0].text;
Check(
	D2Text.includes(`- read: ${STATIC_TOOL_LINES.read.description} (key parameter: file_path).`) &&
		!D2Text.includes("(live fixture)"),
	"D2: the note degrades to the STATIC tool line (no live fixture marker)",
);
Check(
	LinesWith(RunD2, ": schema fetch failed -> static fallback").length === 1,
	"D2: the fetch-failure ledger line is byte-exact (exactly once - fetched per note)",
);
Check(D2Out.kind === "accept", "D2: the waterfall continues (the note never fails it)");
Check(
	LinesWith(RunD2, ": strike 3/3 bash read -> note read").length === 1,
	"D2: the strike line is unchanged under the fallback",
);

// -----------------------------------------------------------------------
// D3: the section cap + mapped-class priority + the top-up.
// -----------------------------------------------------------------------
rm();
const RunD3 = Make(Validate({ logFile: Ledger, maxSectionTools: 3 }));
const AgentD3 = Agent("agent-d3");
for (let Index = 0; Index < 9; Index += 1) {
	await Post(RunD3, "cat a.md", AgentD3);
}
const D3Assembly = await Assemble(RunD3, AgentD3);
const D3Table = D3Assembly.sections[1].text.split("| tool | purpose |")[1] ?? "";
const D3Rows = D3Table.split("\n").filter((Row) => Row.startsWith("| ") && !Row.startsWith("| ---"));
Check(D3Rows.length === 3, "D3: exactly maxSectionTools (3) rows");
Check(
	JSON.stringify(D3Rows.map((Row) => Row.split(" | ")[0].slice(2))) ===
		JSON.stringify(["edit", "write", "read"]),
	"D3: the rows follow the mapped-class priority (write tools first, then read) - no search/discovery/control rows",
);
rm();
const RunD3b = Make(Validate({ logFile: Ledger, maxSectionTools: 24 }));
const AgentD3b = Agent("agent-d3b");
for (let Index = 0; Index < 9; Index += 1) {
	await Post(RunD3b, "cat a.md", AgentD3b);
}
const D3bAssembly = await Assemble(RunD3b, AgentD3b);
const D3bRows = (D3bAssembly.sections[1].text.split("| tool | purpose |")[1] ?? "")
	.split("\n")
	.filter((Row) => Row.startsWith("| ") && !Row.startsWith("| ---"));
Check(D3bRows.length >= 11, "D3b: the cap-24 table holds every mapped tool plus the top-up");
Check(
	JSON.stringify(D3bRows.map((Row) => Row.split(" | ")[0].slice(2)).slice(0, 11)) ===
		JSON.stringify([
			"edit",
			"write",
			"read",
			"ccr_retrieve",
			"grep",
			"glob",
			"working_directory",
			"web_fetch",
			"run_in_background",
			"schedule_create",
			"plugin_manager",
		]),
	"D3b: the mapped order is write, read, search, discovery, control (first appearance within a class)",
);
const D3bTopUp = D3bRows.map((Row) => Row.split(" | ")[0].slice(2)).slice(11);
Check(
	D3bTopUp.includes("web_search") && D3bTopUp.includes("zzz_fixture"),
	"D3b: non-mapped live tools top up the table",
);
Check(
	JSON.stringify(D3bTopUp) === JSON.stringify([...D3bTopUp].sort()),
	"D3b: the top-up is alphabetical",
);

// -----------------------------------------------------------------------
// D4: the section cache - rebuilt at sectionTtl judged calls AND on
// tools/change, each path with its own ledger line.
// -----------------------------------------------------------------------
rm();
const RunD4 = Make(Validate({ logFile: Ledger, sectionTtl: 2 }));
const AgentD4 = Agent("agent-d4");
for (let Index = 0; Index < 9; Index += 1) {
	await Post(RunD4, "cat a.md", AgentD4);
}
await Assemble(RunD4, AgentD4); // first build at calls=9 (no rebuild line)
Check(LinesWith(RunD4, ": section rebuilt").length === 0, "D4: the first build is silent");
await Post(RunD4, "git status", AgentD4);
await Post(RunD4, "git status", AgentD4); // calls=11, 11-9 >= ttl 2
await Assemble(RunD4, AgentD4);
Check(
	LinesWith(RunD4, ": section rebuilt (ttl 2)").length === 1,
	"D4: the TTL path logs 'section rebuilt (ttl 2)'",
);
RunD4.Listeners["tools/change"]();
Check(
	LinesWith(RunD4, ": section rebuilt (tools/change)").length === 1,
	"D4: the tools/change path logs 'section rebuilt (tools/change)'",
);
Check(RunD4.State.Registry.size >= 1, "D4: the registry tracks the live agent states");
const CacheBefore = [...RunD4.State.Registry].find((S) => S.tier2)?.sectionCache;
Check(CacheBefore === undefined, "D4: tools/change cleared the section cache");
await Assemble(RunD4, AgentD4); // silent rebuild from the fresh registry
Check(
	LinesWith(RunD4, ": section rebuilt").length === 2,
	"D4: the post-invalidation rebuild is silent (only the two path lines exist)",
);

// -----------------------------------------------------------------------
// D5: fetchLive=false (static only, no fetch-failure line ever) + the
// volatile flips via a fake loader/volatile-update.
// -----------------------------------------------------------------------
rm();
const RawD5 = Validate({ logFile: Ledger, fetchLive: false });
const RunD5 = Make(RawD5, {
	tools: {
		schemas: () => {
			throw new Error("must never be called");
		},
	},
});
const AgentD5 = Agent("agent-d5");
await Post(RunD5, "cat a.md", AgentD5);
await Post(RunD5, "cat a.md", AgentD5);
const D5Out = await Post(RunD5, "cat a.md", AgentD5); // the 3rd read offense notes
const D5Text = D5Out.additionalContexts[0].content[0].text;
Check(
	D5Text.includes(STATIC_TOOL_LINES.read.description) && !D5Text.includes("(live fixture)"),
	"D5: fetchLive=false - the note uses the static table only",
);
Check(
	RunD5.Lines.every((L) => !L.includes("schema fetch failed")),
	"D5: no fetch-failure line is ever logged with fetchLive=false",
);
// The volatile flips: fake cells + the P10 loader/volatile-update dispatch.
RawD5.fetchLive = { get: () => true };
RawD5.maxSectionTools = { get: () => 24 };
RawD5.threshold = { get: () => 2 };
RawD5.enabled = { get: () => true };
RunD5.Listeners["loader/volatile-update"]([["fetchLive"], ["maxSectionTools"], ["threshold"], ["enabled"]]);
Check(RunD5.State.FetchLive === true, "D5: the fetchLive flip lands on the State without a remount");
// The flipped fetchLive needs a working registry fixture again.
RunD5.Context.tools = { schemas: LiveSchemas };
Check(RunD5.State.MaxSectionTools === 24, "D5: the maxSectionTools flip lands on the State");
Check(RunD5.State.Threshold === 2, "D5: the threshold flip lands on the State");
const AgentD5b = Agent("agent-d5b");
await Post(RunD5, "cat a.md", AgentD5b);
const D5bOut = await Post(RunD5, "cat a.md", AgentD5b);
Check(
	D5bOut.additionalContexts[0].content[0].text.includes("(live fixture)"),
	"D5: the flipped fetchLive is picked up on the next judged call (live text, no remount)",
);
Check(
	LinesWith(RunD5, ": strike 2/2 bash read -> note read").length === 1,
	"D5: the flipped threshold=2 is picked up too (byte-exact strike line)",
);


// -----------------------------------------------------------------------
// The craft library (plan §2.7c): every obfuscated variant classifies
// correctly, including the catch-all and the exemption rows.
// -----------------------------------------------------------------------
const Craft = (Command) => Detect(Command, DEFAULT_PATTERNS, DEFAULT_EXEMPTS);
const Expect = (Command, Kind, Cls) => {
	const R = Craft(Command);
	Check(
		Kind === "none"
			? R === null
			: R !== null && R.kind === Kind && (Cls === undefined || (Kind === "offense" ? R.match.class === Cls : true)),
		`craft: ${JSON.stringify(Command)} -> ${Kind}${Cls ? `/${Cls}` : ""}`,
	);
};
Expect("sed -i.bak s/x/y/ f", "offense", "write");
Expect('perl -pi -e "s/x/y/" f', "offense", "write");
Expect('echo "${TXT}" > f.md', "offense", "write");
Expect("printf '%s\\n' x | tee -a f", "offense", "write");
Expect("cat <<'EOF' > f.md\nbody\nEOF", "offense", "write");
Expect("python3 -c \"open('f','w').write(x)\"", "offense", "write");
Expect("echo a2V5 | base64 -d | sh", "offense", "write");
Expect("x='sed'; $x -i s/a/b/ f", "offense", "write");
Expect("grep x f > /dev/null", "offense", "search");
Expect("cat f | sed s/a/b/ > f", "offense", "write");
Expect("find . -name '*.ts' -exec sed -i s/a/b/ {} +", "offense", "write");
Expect("ssh host 'cat f'", "none");
Expect("git diff > patch.txt", "exempt");
Expect("journalctl > log.txt", "offense", "write");
Expect("git stash", "none");
Expect("echo x > tracked.md", "offense", "write");
Expect("cat a; sed -i s/x/y/ b", "offense", "write");

// -----------------------------------------------------------------------
// The fail-open envelope + fail-loud validation.
// -----------------------------------------------------------------------
const Cyclical = {};
Cyclical.self = Cyclical;
const FailOpenOut = await RunR1.Listeners["tools/post-execute"](
	{ callId: "c", name: "bash", arguments: Cyclical, agent: AgentA, signal: undefined },
	{ isError: false, value: "", content: [] },
	async () => ACCEPT,
);
Check(FailOpenOut === ACCEPT, "a malformed (cyclic) payload returns the downstream decision unchanged");
Check(
	RunR1.Warns.some((W) => W.startsWith("hook-dsh-tool-coach: ")),
	"the fail-open envelope logs a prefixed warning instead of throwing",
);
let Threw = null;
try {
	Make(Validate({ threshold: 0 }));
} catch (Error) {
	Threw = Error;
}
Check(
	Threw !== null && Threw.message === "hook-dsh-tool-coach: threshold must be >= 1",
	"fail-loud validation: an invalid config throws at load with a clear error",
);
Threw = null;
try {
	Make(Validate({ patternTable: [...DEFAULT_PATTERNS, { pattern: CAT_ROW, class: "read", tool: "read" }] }));
} catch (Error) {
	Threw = Error;
}
Check(
	Threw !== null && Threw.message.includes("duplicates a built-in pattern"),
	"fail-loud validation: a user row duplicating a built-in pattern is rejected",
);
Threw = null;
try {
	Make(Validate({ maxSectionTools: 0 }));
} catch (Error) {
	Threw = Error;
}
Check(
	Threw !== null && Threw.message === "hook-dsh-tool-coach: maxSectionTools must be between 1 and 24",
	"fail-loud validation: maxSectionTools outside 1-24 is rejected",
);

// Non-terminal tools are never judged.
rm();
const RunNJ = Make(Validate({ logFile: Ledger }));
await Post(RunNJ, "cat a.md", Agent("agent-nj"), "read");
await Post(RunNJ, "sed -i s/x/y/ f", Agent("agent-nj"), "write");
Check(RunNJ.Lines.every((L) => !L.includes(": offense")), "the dedicated tools are never judged (read/write calls)");

rm();
console.log(`\n${Pass} PASS, ${Fail} FAIL`);
process.exit(Fail === 0 ? 0 : 1);
