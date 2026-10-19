// Source/Test/Overpass/Test.ts - one singular test: the overpass arms and the
// command - the registration facts (the two arms with their ordering
// contract, the normalize-overpass command), the tool-results arm (default
// off, the O2 volatile flip with the exact ledger line, the read exemption,
// the block rules, the N=0 no-op, the value-carrying and ccr-marker
// pass-throughs, the downstream basis), the step-batch arm (default off, the
// O10 flip, the one-shot command arm), and the history-safety invariant.
// Runs standalone (`node Target/Test/Overpass/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-normalize-dash: the fake ctx + the REAL
// factory + the REAL dash apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Furnace, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Run O - the overpass arms + the command. The tool-results arm
	// (tools/post-execute), the step-batch arm (agent/pre-step), the
	// normalize-overpass command, the ordering guard and the history-safety
	// invariant. Hand-built config with a MUTABLE scopes object (the
	// stable-reference simulation) so the scope flips go through the factory's
	// volatile-update dispatch like the source suite's Run V / Run S.
	Rm();
	{
		const LiveScopesO = {
			conversation: true,
			reasoning: true,
			toolInput: false,
			toolResults: false,
			files: true,
			batch: false,
		};
		const RawO = {
			log: true,
			logFile: Ledger,
			replacement: "-",
			normalizeReasoning: true,
			normalizeToolArguments: false,
			scopes: { get: () => LiveScopesO },
		};
		const RunO = Make(RawO);
		const PostO = RunO.Listeners["tools/post-execute"];
		const PreO = RunO.Listeners["agent/pre-step"];
		const NextAcceptO = async () => ({ kind: "accept" });
		const ExecO = (Name: string) => ({
			callId: "call_smoke",
			name: Name,
			arguments: {},
			signal: new AbortController().signal,
		});
		// O0: registration facts (the ordering contract is the prepend flag +
		// the marker guard, together making any load order safe).
		{
			const Sub = "overpass: the tools/post-execute arm is registered";
			Check(Count, Sub, () => {
				assert.ok(typeof PostO === "function");
			});
		}
		{
			const Sub = "overpass: the agent/pre-step arm is registered";
			Check(Count, Sub, () => {
				assert.ok(typeof PreO === "function");
			});
		}
		{
			const Sub = "overpass: the post-execute arm PREPENDS (outermost vs the ccr arm's own prepend)";
			Check(Count, Sub, () => {
				assert.ok(RunO.ListenerOptions["tools/post-execute"]?.prepend === true);
			});
		}
		{
			const Sub = "overpass: the pre-step arm uses default ordering (nothing needs to precede it)";
			Check(Count, Sub, () => {
				assert.ok(RunO.ListenerOptions["agent/pre-step"] === undefined);
			});
		}
		{
			const Sub = "overpass: the normalize-overpass command is registered (name without slash)";
			Check(Count, Sub, () => {
				assert.ok(
					RunO.CommandsRegistered.length === 1 &&
						RunO.CommandsRegistered[0].name === "normalize-overpass" &&
						typeof RunO.CommandsRegistered[0].handler === "function",
				);
			});
		}
		// O1: the tool-results scope is OFF by default -> the bare decision passes.
		{
			const OutO1 = await PostO(
				ExecO("bash"),
				{ isError: false, value: {}, content: [{ type: "text", text: "a \u2014 b" }] },
				NextAcceptO,
			);
			const Sub = "overpass: toolResults off (default) -> the decision passes untouched";
			Check(Count, Sub, () => {
				assert.ok(OutO1.kind === "accept" && !("content" in OutO1));
			});
		}
		const WritesO = RunO.Writes.length;
		const ObservationsO = RunO.Observations.length;
		let LinesBeforeO5 = 0;
		// O2: scope ON via the volatile flip -> normalization + the exact ledger line.
		{
			LiveScopesO.toolResults = true;
			RunO.Listeners["loader/volatile-update"]([["scopes", "toolResults"]]);
			const OutO2 = await PostO(
				ExecO("bash"),
				{ isError: false, value: {}, content: [{ type: "text", text: "a \u2014 b" }] },
				NextAcceptO,
			);
			{
				const Sub = "overpass: toolResults on -> the text block is rewritten (em dash -> hyphen)";
				Check(Count, Sub, () => {
					assert.ok(
						OutO2.kind === "accept" && OutO2.content.length === 1 && OutO2.content[0].text === "a - b",
					);
				});
			}
			{
				const Sub = "overpass: the tool-result ledger line is byte-exact";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Lines.includes(
							"hook-dsh-normalize-dash: overpass: normalized 1 char(s) in tool result bash call_smoke",
						),
					);
				});
			}
			{
				const Sub = "overpass: the arm wrote NOTHING to any file surface (history safety)";
				Check(Count, Sub, () => {
					assert.ok(RunO.State.Factory === Furnace && RunO.Writes.length === WritesO);
				});
			}
		}
		// O3: the exemption list -> `read` passes by identity even with the scope on.
		{
			const OutO3 = await PostO(
				ExecO("read"),
				{ isError: false, value: {}, content: [{ type: "text", text: "a \u2014 b" }] },
				NextAcceptO,
			);
			const Sub = "overpass: exempt tool (read) passes through by identity";
			Check(Count, Sub, () => {
				assert.ok(OutO3.kind === "accept" && !("content" in OutO3));
			});
		}
		// O4: non-text blocks are never touched; a mixed content rewrites only text.
		{
			const ToolBlockO = { type: "tool-call", name: "bash", arguments: '{"a":"\u2014"}' };
			const OutO4 = await PostO(
				ExecO("bash"),
				{
					isError: false,
					value: {},
					content: [ToolBlockO, { type: "text", text: "x \u2014 y" }],
				},
				NextAcceptO,
			);
			{
				const Sub = "overpass: tool-call/argument blocks pass untouched (execution-critical JSON)";
				Check(Count, Sub, () => {
					assert.ok(OutO4.content[0] === ToolBlockO && OutO4.content[0].arguments === '{"a":"\u2014"}');
				});
			}
			{
				const Sub = "overpass: the text block in the same content IS rewritten";
				Check(Count, Sub, () => {
					assert.ok(OutO4.content[1].text === "x - y");
				});
			}
		}
		// O5: N = 0 -> the decision unchanged and NO ledger line.
		{
			LinesBeforeO5 = RunO.Lines.length;
			const OutO5 = await PostO(
				ExecO("bash"),
				{ isError: false, value: {}, content: [{ type: "text", text: "plain text" }] },
				NextAcceptO,
			);
			{
				const Sub = "overpass: N=0 payload -> the bare decision unchanged";
				Check(Count, Sub, () => {
					assert.ok(OutO5.kind === "accept" && !("content" in OutO5));
				});
			}
			{
				const Sub = "overpass: N=0 -> no ledger line (the no-op rule)";
				Check(Count, Sub, () => {
					assert.ok(RunO.Lines.length === LinesBeforeO5);
				});
			}
		}
		// O6: a value-carrying decision is canonical -> untouched.
		{
			const OutO6 = await PostO(
				ExecO("bash"),
				{ isError: false, value: {}, content: [{ type: "text", text: "a \u2014 b" }] },
				async () => ({ kind: "accept", value: { ok: 1 } }),
			);
			const Sub = "overpass: value-carrying decision passes untouched";
			Check(Count, Sub, () => {
				assert.ok(OutO6.kind === "accept" && OutO6.value.ok === 1 && !("content" in OutO6));
			});
		}
		// O7: the CCR marker guard -> marker-bearing content passes unchanged
		// (the ordering guard: normalization never touches a ccr replacement).
		{
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
				const Sub = "overpass: marker-bearing content passes through the arm unchanged (N=0 on a ccr replacement)";
				Check(Count, Sub, () => {
					assert.ok(OutO7.kind === "accept" && !("content" in OutO7));
				});
			}
			{
				const Sub = "overpass: O5/O6/O7 added NO ledger lines (the no-op and pass-through rules)";
				Check(Count, Sub, () => {
					assert.ok(RunO.Lines.length === LinesBeforeO5);
				});
			}
		}
		// O8: the content basis is the DOWNSTREAM decision's content when present.
		{
			const OutO8 = await PostO(
				ExecO("bash"),
				{ isError: false, value: {}, content: [{ type: "text", text: "raw \u2014 result" }] },
				async () => ({ kind: "accept", content: [{ type: "text", text: "downstream \u2014 shaped" }] }),
			);
			const Sub = "overpass: the downstream decision's content is the basis (not the raw result)";
			Check(Count, Sub, () => {
				assert.ok(OutO8.content[0].text === "downstream - shaped");
			});
		}
		// O9: the batch scope is OFF by default -> the enter decision passes.
		{
			const MsgO = (Text: string) => ({ role: "user", content: [{ type: "text", text: Text }] });
			const OutO9 = await PreO(
				{
					agent: {},
					messages: [MsgO("a \u2014 batch")],
					turn: 3,
					step: 1,
					signal: new AbortController().signal,
				},
				async () => ({ kind: "enter", messages: [MsgO("a \u2014 batch")] }),
			);
			const Sub = "overpass: batch off (default) -> the enter decision passes untouched";
			Check(Count, Sub, () => {
				assert.ok(OutO9.kind === "enter" && OutO9.messages[0].content[0].text === "a \u2014 batch");
			});
		}
		// O10: batch ON via the volatile flip -> normalized messages + exact ledger.
		{
			LiveScopesO.batch = true;
			RunO.Listeners["loader/volatile-update"]([["scopes", "batch"]]);
			const MsgO = (Text: string) => ({ role: "user", content: [{ type: "text", text: Text }] });
			const OutO10 = await PreO(
				{
					agent: {},
					messages: [MsgO("a \u2014 batch")],
					turn: 3,
					step: 1,
					signal: new AbortController().signal,
				},
				async () => ({ kind: "enter", messages: [MsgO("a \u2014 batch")] }),
			);
			{
				const Sub = "overpass: batch on -> the text blocks in the incoming batch are rewritten";
				Check(Count, Sub, () => {
					assert.ok(OutO10.kind === "enter" && OutO10.messages[0].content[0].text === "a - batch");
				});
			}
			{
				const Sub = "overpass: the step-batch ledger line is byte-exact";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Lines.includes(
							"hook-dsh-normalize-dash: overpass: normalized 1 char(s) in step batch (turn 3 step 1)",
						),
					);
				});
			}
		}
		// O11: N=0 batch -> decision unchanged, no ledger line.
		{
			const LinesBeforeO11 = RunO.Lines.length;
			const MsgO = (Text: string) => ({ role: "user", content: [{ type: "text", text: Text }] });
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
				Check(Count, Sub, () => {
					assert.ok(OutO11.kind === "enter");
				});
			}
			{
				const Sub = "overpass: N=0 batch -> no ledger line";
				Check(Count, Sub, () => {
					assert.ok(RunO.Lines.length === LinesBeforeO11);
				});
			}
		}
		// O12: the one-shot arm from the command fires ONCE regardless of the scope.
		{
			LiveScopesO.batch = false;
			RunO.Listeners["loader/volatile-update"]([["scopes", "batch"]]);
			const CommandO = RunO.CommandsRegistered[0];
			const MsgO = (Text: string) => ({ role: "user", content: [{ type: "text", text: Text }] });
			const ArmO = await CommandO.handler({ rawInput: "batch" });
			{
				const Sub = "overpass: the command's batch grammar arms the one-shot flag";
				Check(Count, Sub, () => {
					assert.ok(ArmO.kind === "success" && RunO.State.Overpass === true);
				});
			}
			const OutO12 = await PreO(
				{
					agent: {},
					messages: [MsgO("a \u2014 batch")],
					turn: 4,
					step: 0,
					signal: new AbortController().signal,
				},
				async () => ({ kind: "enter", messages: [MsgO("a \u2014 batch")] }),
			);
			{
				const Sub = "overpass: the one-shot arm normalizes the next batch with the scope off";
				Check(Count, Sub, () => {
					assert.ok(OutO12.messages[0].content[0].text === "a - batch");
				});
			}
			{
				const Sub = "overpass: the one-shot batch ledger line is byte-exact";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Lines.includes(
							"hook-dsh-normalize-dash: overpass: normalized 1 char(s) in step batch (turn 4 step 0)",
						),
					);
				});
			}
			{
				const Sub = "overpass: the one-shot flag is consumed (cleared after one use)";
				Check(Count, Sub, () => {
					assert.ok(RunO.State.Overpass === false);
				});
			}
			const OutO12b = await PreO(
				{
					agent: {},
					messages: [MsgO("a \u2014 batch")],
					turn: 4,
					step: 1,
					signal: new AbortController().signal,
				},
				async () => ({ kind: "enter", messages: [MsgO("a \u2014 batch")] }),
			);
			{
				const Sub = "overpass: the second batch after the one-shot passes untouched (exactly one use)";
				Check(Count, Sub, () => {
					assert.ok(OutO12b.messages[0].content[0].text === "a \u2014 batch");
				});
			}
		}
		// O13: a rejected step is never touched.
		{
			const MsgO = (Text: string) => ({ role: "user", content: [{ type: "text", text: Text }] });
			const OutO13 = await PreO(
				{
					agent: {},
					messages: [MsgO("a \u2014")],
					turn: 5,
					step: 0,
					signal: new AbortController().signal,
				},
				async () => ({ kind: "reject" }),
			);
			const Sub = "overpass: a reject decision passes untouched";
			Check(Count, Sub, () => {
				assert.ok(OutO13.kind === "reject");
			});
		}
		// O14: the command's other grammars.
		{
			const CommandO = RunO.CommandsRegistered[0];
			const ReportO = await CommandO.handler({ rawInput: "scopes" });
			{
				const Sub = "overpass: the scopes report is the read-only effective-values summary";
				Check(Count, Sub, () => {
					assert.ok(
						ReportO.kind === "success" &&
							ReportO.text.includes("conversation=on") &&
							ReportO.text.includes("toolResults=on") &&
							ReportO.text.includes("batch=off") &&
							ReportO.text.includes("exempt: read, edit"),
					);
				});
			}
			const FilesO = await CommandO.handler({ rawInput: "files /tmp/x.txt" });
			{
				const Sub = "overpass: the files sweep is declined by a stream flavor (owned by normalize-file)";
				Check(Count, Sub, () => {
					assert.ok(FilesO.kind === "error" && FilesO.text.includes("normalize-file"));
				});
			}
			const ResultsBadO = await CommandO.handler({ rawInput: "results" });
			{
				const Sub = "overpass: 'results' without on|off is a usage error";
				Check(Count, Sub, () => {
					assert.ok(ResultsBadO.kind === "error");
				});
			}
			const JunkO = await CommandO.handler({ rawInput: "nonsense" });
			{
				const Sub = "overpass: an unknown grammar is a usage error";
				Check(Count, Sub, () => {
					assert.ok(JunkO.kind === "error");
				});
			}
			const ResultsO = await CommandO.handler({ rawInput: "results on" });
			{
				const Sub =
					"overpass: 'results on' with no settings/config-editor service reports the settings path (config stays the source of truth)";
				Check(Count, Sub, () => {
					assert.ok(
						ResultsO.kind === "success" &&
							(ResultsO.text.includes("settings") || ResultsO.text.includes("config")),
					);
				});
			}
			{
				const Sub = "overpass: zero fs/observed emissions and zero writes from ANY overpass path (history safety)";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Observations.length === ObservationsO && RunO.Writes.length === WritesO,
					);
				});
			}
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
