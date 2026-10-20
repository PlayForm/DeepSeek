// Source/Test/Overpass/Test.ts - one singular test: the overpass arms and the
// human command (Run O) - the tool-results arm (tools/post-execute), the
// step-batch arm (agent/pre-step), the normalize-overpass command, the
// ordering guard and the history-safety invariant, with the volatile flips
// (O2/O10) and the one-shot batch grammar (O12).
// Runs standalone (`node Target/Test/Overpass/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Smoke of @playform/ets-hook-dsh-normalize-invisible: the fake ctx + the REAL
// factory + the REAL invisible apply (the seams live in ../Harness.js).
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Furnace,
	MakeCounter,
	Ledger,
	Make,
	rm,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// ---------- Run O (additive): the overpass arms + the command ----------
	// The tool-results arm (tools/post-execute), the step-batch arm
	// (agent/pre-step), the normalize-overpass command, the ordering guard and
	// the history-safety invariant. Hand-built config with a MUTABLE scopes
	// object (the stable-reference simulation) so the scope flips go through
	// the factory's volatile-update dispatch like Run V / Run S. The fixtures
	// use this flavor's own character class.
	// SCOPES_DEFAULT is duplicated from the Scopes folder: in the source suite
	// it is defined in the Run S section and reused here via spread; each
	// folder is its own process/module, so the const is repeated verbatim.
	const SCOPES_DEFAULT = {
		conversation: true,
		reasoning: true,
		toolInput: false,
		toolResults: false,
		files: true,
		batch: false,
	};
	rm();
	const LiveScopesO = { ...SCOPES_DEFAULT };
	const RawO = {
		log: true,
		logFile: Ledger,
		replacement: "",
		normalizeReasoning: true,
		normalizeToolArguments: false,
		scopes: { get: () => LiveScopesO },
	};
	const RunO = Make(RawO);
	const PostO = RunO.Listeners["tools/post-execute"]!;
	const PreO = RunO.Listeners["agent/pre-step"]!;
	const NextAcceptO = async () => ({ kind: "accept" });
	const ExecO = (Name: string) => ({
		callId: "call_smoke",
		name: Name,
		arguments: {},
		signal: new AbortController().signal,
	});

	// Group: O0 - registration facts (the ordering contract is the prepend
	// flag + the marker guard, together making any load order safe).
	{
		const Sub = "overpass: the tools/post-execute arm is registered";
		{
			Check(Count, Sub, () => {
				assert.ok(
					typeof PostO === "function",
					"overpass: the tools/post-execute arm is registered",
				);
			});
		}
	}
	{
		const Sub = "overpass: the agent/pre-step arm is registered";
		{
			Check(Count, Sub, () => {
				assert.ok(typeof PreO === "function", "overpass: the agent/pre-step arm is registered");
			});
		}
	}
	{
		const Sub = "overpass: the post-execute arm PREPENDS (outermost vs the CCR arm's own prepend)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.ListenerOptions["tools/post-execute"]?.prepend === true,
					"overpass: the post-execute arm PREPENDS (outermost vs the CCR arm's own prepend)",
				);
			});
		}
	}
	{
		const Sub = "overpass: the pre-step arm uses default ordering (nothing needs to precede it)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.ListenerOptions["agent/pre-step"] === undefined,
					"overpass: the pre-step arm uses default ordering (nothing needs to precede it)",
				);
			});
		}
	}
	{
		const Sub = "overpass: the normalize-overpass command is registered (name without slash)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.CommandsRegistered.length === 1 &&
						RunO.CommandsRegistered[0].name === "normalize-overpass" &&
						typeof RunO.CommandsRegistered[0].handler === "function",
					"overpass: the normalize-overpass command is registered (name without slash)",
				);
			});
		}
	}

	// Group: O1/O2 - the tool-results arm: off by default, then the volatile
	// flip to on (removal + the exact ledger line).
	const OutO1 = await PostO(
		ExecO("bash"),
		{ isError: false, value: {}, content: [{ type: "text", text: "a \u200B b" }] },
		NextAcceptO,
	);
	{
		const Sub = "overpass: toolResults off (default) -> the decision passes untouched";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO1.kind === "accept" && !("content" in OutO1),
					"overpass: toolResults off (default) -> the decision passes untouched",
				);
			});
		}
	}
	// O2: scope ON via the volatile flip -> removal + the exact ledger line.
	LiveScopesO.toolResults = true;
	RunO.Listeners["loader/volatile-update"]!([["scopes", "toolResults"]]);
	const OutO2 = await PostO(
		ExecO("bash"),
		{ isError: false, value: {}, content: [{ type: "text", text: "a \u200B b" }] },
		NextAcceptO,
	);
	{
		const Sub = "overpass: toolResults on -> the text block is rewritten (em dash -> hyphen)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO2.kind === "accept" && OutO2.content.length === 1 && OutO2.content[0].text === "a  b",
					"overpass: toolResults on -> the text block is rewritten (em dash -> hyphen)",
				);
			});
		}
	}
	{
		const Sub = "overpass: the tool-result ledger line is byte-exact";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.Lines.includes(
						"hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in tool result bash call_smoke",
					),
					"overpass: the tool-result ledger line is byte-exact",
				);
			});
		}
	}
	{
		const Sub = "overpass: the arm runs against the REAL factory (no direct fs access)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.State.Factory === Furnace,
					"overpass: the arm runs against the REAL factory (no direct fs access)",
				);
			});
		}
	}

	// Group: O3 - the exemption list: `read` passes by identity even with the
	// scope on.
	const OutO3 = await PostO(
		ExecO("read"),
		{ isError: false, value: {}, content: [{ type: "text", text: "a \u200B b" }] },
		NextAcceptO,
	);
	{
		const Sub = "overpass: exempt tool (read) passes through by identity";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO3.kind === "accept" && !("content" in OutO3),
					"overpass: exempt tool (read) passes through by identity",
				);
			});
		}
	}

	// Group: O4 - non-text blocks are never touched; a mixed content rewrites
	// only text.
	const ToolBlockO = { type: "tool-call", name: "bash", arguments: '{"a":"\u200B"}' };
	const OutO4 = await PostO(
		ExecO("bash"),
		{
			isError: false,
			value: {},
			content: [ToolBlockO, { type: "text", text: "x \u200B y" }],
		},
		NextAcceptO,
	);
	{
		const Sub = "overpass: tool-call/argument blocks pass untouched (execution-critical JSON)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO4.content[0] === ToolBlockO && OutO4.content[0].arguments === '{"a":"\u200B"}',
					"overpass: tool-call/argument blocks pass untouched (execution-critical JSON)",
				);
			});
		}
	}
	{
		const Sub = "overpass: the text block in the same content IS rewritten";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO4.content[1].text === "x  y",
					"overpass: the text block in the same content IS rewritten",
				);
			});
		}
	}

	// Group: O5/O6/O7 - the no-op and pass-through rules (N=0, the canonical
	// value decision, the CCR marker guard).
	const LinesBeforeO5 = RunO.Lines.length;
	const OutO5 = await PostO(
		ExecO("bash"),
		{ isError: false, value: {}, content: [{ type: "text", text: "plain text" }] },
		NextAcceptO,
	);
	{
		const Sub = "overpass: N=0 payload -> the bare decision unchanged";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO5.kind === "accept" && !("content" in OutO5),
					"overpass: N=0 payload -> the bare decision unchanged",
				);
			});
		}
	}
	{
		const Sub = "overpass: N=0 -> no ledger line (the no-op rule)";
		{
			Check(Count, Sub, () => {
				assert.ok(RunO.Lines.length === LinesBeforeO5, "overpass: N=0 -> no ledger line (the no-op rule)");
			});
		}
	}
	// O6: a value-carrying decision is canonical -> untouched.
	const OutO6 = await PostO(
		ExecO("bash"),
		{ isError: false, value: {}, content: [{ type: "text", text: "a \u200B b" }] },
		async () => ({ kind: "accept", value: { ok: 1 } }),
	);
	{
		const Sub = "overpass: value-carrying decision passes untouched";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO6.kind === "accept" && OutO6.value.ok === 1 && !("content" in OutO6),
					"overpass: value-carrying decision passes untouched",
				);
			});
		}
	}
	// O7: the CCR marker guard -> marker-bearing content passes unchanged
	// (the ordering guard: normalization never touches a CCR replacement).
	const MarkerBlockO = {
		type: "text",
		text: "[text:preview]\n<<<CCR:0123456789abcdef01234567|text|42>>>",
	};
	const OutO7 = await PostO(
		ExecO("bash"),
		{ isError: false, value: {}, content: [MarkerBlockO] },
		NextAcceptO,
	);
	{
		const Sub =
			"overpass: marker-bearing content passes through the arm unchanged (N=0 on a CCR replacement)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO7.kind === "accept" && !("content" in OutO7),
					"overpass: marker-bearing content passes through the arm unchanged (N=0 on a CCR replacement)",
				);
			});
		}
	}
	{
		const Sub = "overpass: O5/O6/O7 added NO ledger lines (the no-op and pass-through rules)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.Lines.length === LinesBeforeO5,
					"overpass: O5/O6/O7 added NO ledger lines (the no-op and pass-through rules)",
				);
			});
		}
	}

	// Group: O8 - the content basis is the DOWNSTREAM decision's content when
	// present.
	const OutO8 = await PostO(
		ExecO("bash"),
		{ isError: false, value: {}, content: [{ type: "text", text: "raw \u200B result" }] },
		async () => ({ kind: "accept", content: [{ type: "text", text: "downstream \u200B shaped" }] }),
	);
	{
		const Sub = "overpass: the downstream decision's content is the basis (not the raw result)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO8.content[0].text === "downstream  shaped",
					"overpass: the downstream decision's content is the basis (not the raw result)",
				);
			});
		}
	}

	// Group: O9/O10 - the step-batch arm: off by default, then the volatile
	// flip to on (removed characters in the messages + the exact ledger line).
	const MsgO = (Text: string) => ({ role: "user", content: [{ type: "text", text: Text }] });
	const OutO9 = await PreO(
		{
			agent: {},
			messages: [MsgO("a \u200B batch")],
			turn: 3,
			step: 1,
			signal: new AbortController().signal,
		},
		async () => ({ kind: "enter", messages: [MsgO("a \u200B batch")] }),
	);
	{
		const Sub = "overpass: batch off (default) -> the enter decision passes untouched";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO9.kind === "enter" && OutO9.messages[0].content[0].text === "a \u200B batch",
					"overpass: batch off (default) -> the enter decision passes untouched",
				);
			});
		}
	}
	// O10: batch ON via the volatile flip -> removed characters + exact ledger.
	LiveScopesO.batch = true;
	RunO.Listeners["loader/volatile-update"]!([["scopes", "batch"]]);
	const OutO10 = await PreO(
		{
			agent: {},
			messages: [MsgO("a \u200B batch")],
			turn: 3,
			step: 1,
			signal: new AbortController().signal,
		},
		async () => ({ kind: "enter", messages: [MsgO("a \u200B batch")] }),
	);
	{
		const Sub = "overpass: batch on -> the text blocks in the incoming batch are rewritten";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO10.kind === "enter" && OutO10.messages[0].content[0].text === "a  batch",
					"overpass: batch on -> the text blocks in the incoming batch are rewritten",
				);
			});
		}
	}
	{
		const Sub = "overpass: the step-batch ledger line is byte-exact";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.Lines.includes(
						"hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in step batch (turn 3 step 1)",
					),
					"overpass: the step-batch ledger line is byte-exact",
				);
			});
		}
	}

	// Group: O11 - N=0 batch -> decision unchanged, no ledger line.
	const LinesBeforeO11 = RunO.Lines.length;
	const OutO11 = await PreO(
		{
			agent: {},
			messages: [MsgO("plain")],
			turn: 3,
			step: 2,
			signal: new AbortController().signal,
		},
		async () => ({ kind: "enter", messages: [MsgO("plain")] }),
	);
	{
		const Sub = "overpass: N=0 batch -> the decision unchanged";
		{
			Check(Count, Sub, () => {
				assert.ok(OutO11.kind === "enter", "overpass: N=0 batch -> the decision unchanged");
			});
		}
	}
	{
		const Sub = "overpass: N=0 batch -> no ledger line";
		{
			Check(Count, Sub, () => {
				assert.ok(RunO.Lines.length === LinesBeforeO11, "overpass: N=0 batch -> no ledger line");
			});
		}
	}

	// Group: O12 - the one-shot arm from the command fires ONCE regardless of
	// the scope.
	LiveScopesO.batch = false;
	RunO.Listeners["loader/volatile-update"]!([["scopes", "batch"]]);
	const CommandO = RunO.CommandsRegistered[0];
	const ArmO = await CommandO.handler({ rawInput: "batch" });
	{
		const Sub = "overpass: the command's batch grammar arms the one-shot flag";
		{
			Check(Count, Sub, () => {
				assert.ok(
					ArmO.kind === "success" && RunO.State.Overpass === true,
					"overpass: the command's batch grammar arms the one-shot flag",
				);
			});
		}
	}
	const OutO12 = await PreO(
		{
			agent: {},
			messages: [MsgO("a \u200B batch")],
			turn: 4,
			step: 0,
			signal: new AbortController().signal,
		},
		async () => ({ kind: "enter", messages: [MsgO("a \u200B batch")] }),
	);
	{
		const Sub = "overpass: the one-shot arm normalizes the next batch with the scope off";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO12.messages[0].content[0].text === "a  batch",
					"overpass: the one-shot arm normalizes the next batch with the scope off",
				);
			});
		}
	}
	{
		const Sub = "overpass: the one-shot batch ledger line is byte-exact";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.Lines.includes(
						"hook-dsh-normalize-invisible: overpass: normalized 1 char(s) in step batch (turn 4 step 0)",
					),
					"overpass: the one-shot batch ledger line is byte-exact",
				);
			});
		}
	}
	{
		const Sub = "overpass: the one-shot flag is consumed (cleared after one use)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					RunO.State.Overpass === false,
					"overpass: the one-shot flag is consumed (cleared after one use)",
				);
			});
		}
	}
	const OutO12b = await PreO(
		{
			agent: {},
			messages: [MsgO("a \u200B batch")],
			turn: 4,
			step: 1,
			signal: new AbortController().signal,
		},
		async () => ({ kind: "enter", messages: [MsgO("a \u200B batch")] }),
	);
	{
		const Sub = "overpass: the second batch after the one-shot passes untouched (exactly one use)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					OutO12b.messages[0].content[0].text === "a \u200B batch",
					"overpass: the second batch after the one-shot passes untouched (exactly one use)",
				);
			});
		}
	}

	// Group: O13 - a rejected step is never touched.
	const OutO13 = await PreO(
		{
			agent: {},
			messages: [MsgO("a \u200B")],
			turn: 5,
			step: 0,
			signal: new AbortController().signal,
		},
		async () => ({ kind: "reject" }),
	);
	{
		const Sub = "overpass: a reject decision passes untouched";
		{
			Check(Count, Sub, () => {
				assert.ok(OutO13.kind === "reject", "overpass: a reject decision passes untouched");
			});
		}
	}

	// Group: O14 - the command's other grammars.
	const ReportO = await CommandO.handler({ rawInput: "scopes" });
	{
		const Sub = "overpass: the scopes report is the read-only effective-values summary";
		{
			Check(Count, Sub, () => {
				assert.ok(
					ReportO.kind === "success" &&
						ReportO.text.includes("conversation=on") &&
						ReportO.text.includes("toolResults=on") &&
						ReportO.text.includes("batch=off") &&
						ReportO.text.includes("exempt: read, edit"),
					"overpass: the scopes report is the read-only effective-values summary",
				);
			});
		}
	}
	const FilesO = await CommandO.handler({ rawInput: "files /tmp/x.txt" });
	{
		const Sub = "overpass: the files sweep is declined by a stream flavor (owned by normalize-file)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					FilesO.kind === "error" && FilesO.text.includes("normalize-file"),
					"overpass: the files sweep is declined by a stream flavor (owned by normalize-file)",
				);
			});
		}
	}
	const ResultsBadO = await CommandO.handler({ rawInput: "results" });
	{
		const Sub = "overpass: 'results' without on|off is a usage error";
		{
			Check(Count, Sub, () => {
				assert.ok(ResultsBadO.kind === "error", "overpass: 'results' without on|off is a usage error");
			});
		}
	}
	const JunkO = await CommandO.handler({ rawInput: "nonsense" });
	{
		const Sub = "overpass: an unknown grammar is a usage error";
		{
			Check(Count, Sub, () => {
				assert.ok(JunkO.kind === "error", "overpass: an unknown grammar is a usage error");
			});
		}
	}
	const ResultsO = await CommandO.handler({ rawInput: "results on" });
	{
		const Sub =
			"overpass: 'results on' with no settings/config-editor service reports the settings path (config stays the source of truth)";
		{
			Check(Count, Sub, () => {
				assert.ok(
					ResultsO.kind === "success" &&
						(ResultsO.text.includes("settings") || ResultsO.text.includes("config")),
					"overpass: 'results on' with no settings/config-editor service reports the settings path (config stays the source of truth)",
				);
			});
		}
	}
	return Finish(Count, "Overpass");
};

// Standalone entry: `node Target/Test/Overpass/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Overpass`);
}
