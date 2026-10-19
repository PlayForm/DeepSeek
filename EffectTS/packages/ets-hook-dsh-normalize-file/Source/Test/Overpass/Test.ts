// Source/Test/Overpass/Test.ts - one singular test: the overpass arms and the
// command - the registration facts (the two arms with their ordering
// contract, the normalize-overpass command as the files sweep owner), the
// tool-results arm (default off, the volatile flip with the SIX-FOLD rewrite
// and the exact ledger line, the read exemption, the block rules, the N=0
// no-op, the value-carrying and ccr-marker pass-throughs), the files sweep
// through the command, the step-batch arm, the command's other grammars, and
// the history-safety invariant. Runs standalone (`node
// Target/Test/Overpass/Test.js`) AND under the aggregate
// (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-normalize-file: the fake ctx + the REAL
// factory + the REAL normalize-file apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Run O - the overpass arms + the command. The tool-results arm and
	// step-batch arm with the SIX-FOLD transform (the same chain the tool body
	// runs), the files sweep, and the history-safety invariant. Hand-built
	// config with a MUTABLE scopes object.
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
			const Sub = "overpass: the normalize-overpass command is registered (the files sweep owner)";
			Check(Count, Sub, () => {
				assert.ok(
					RunO.CommandsRegistered.length === 1 &&
						RunO.CommandsRegistered[0].name === "normalize-overpass" &&
						typeof RunO.CommandsRegistered[0].handler === "function",
				);
			});
		}
		// O1: the tool-results scope is OFF by default -> pass-through.
		{
			const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
			const OutO1 = await PostO(
				ExecO("bash"),
				{ isError: false, value: {}, content: [{ type: "text", text: All6 }] },
				NextAcceptO,
			);
			const Sub = "overpass: toolResults off (default) -> the decision passes untouched";
			Check(Count, Sub, () => {
				assert.ok(OutO1.kind === "accept" && !("content" in OutO1));
			});
		}
		const WritesO = RunO.Writes.length;
		const ObservationsO = RunO.Observations.length;
		// O2: scope ON via the volatile flip -> the SIX-FOLD rewrite + exact ledger.
		{
			const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
			const Normalized6 = 'a-b"c"...d efAg';
			LiveScopesO.toolResults = true;
			RunO.Listeners["loader/volatile-update"]([["scopes", "toolResults"]]);
			const OutO2 = await PostO(
				ExecO("bash"),
				{ isError: false, value: {}, content: [{ type: "text", text: All6 }] },
				NextAcceptO,
			);
			{
				const Sub = "overpass: toolResults on -> the six-fold chain rewrites the text block";
				Check(Count, Sub, () => {
					assert.ok(
						OutO2.kind === "accept" && OutO2.content.length === 1 && OutO2.content[0].text === Normalized6,
					);
				});
			}
			{
				const Sub = "overpass: the tool-result ledger line is byte-exact";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Lines.includes(
							"hook-dsh-normalize-file: overpass: normalized 7 char(s) in tool result bash call_smoke",
						),
					);
				});
			}
		}
		// O3: the exemption list -> `read` passes by identity even with the scope on.
		{
			const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
			const OutO3 = await PostO(
				ExecO("read"),
				{ isError: false, value: {}, content: [{ type: "text", text: All6 }] },
				NextAcceptO,
			);
			const Sub = "overpass: exempt tool (read) passes through by identity";
			Check(Count, Sub, () => {
				assert.ok(OutO3.kind === "accept" && !("content" in OutO3));
			});
		}
		// O4: non-text blocks are never touched.
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
		// O5: N = 0 -> decision unchanged, no ledger line.
		{
			const LinesBeforeO5 = RunO.Lines.length;
			const OutO5 = await PostO(
				ExecO("bash"),
				{ isError: false, value: {}, content: [{ type: "text", text: "plain text" }] },
				NextAcceptO,
			);
			{
				const Sub = "overpass: N=0 payload -> decision unchanged";
				Check(Count, Sub, () => {
					assert.ok(OutO5.kind === "accept" && !("content" in OutO5));
				});
			}
			{
				const Sub = "overpass: N=0 -> no ledger line";
				Check(Count, Sub, () => {
					assert.ok(RunO.Lines.length === LinesBeforeO5);
				});
			}
			// O6/O7: value-carrying decision untouched; ccr marker guard.
			{
				const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
				const OutO6 = await PostO(
					ExecO("bash"),
					{ isError: false, value: {}, content: [{ type: "text", text: All6 }] },
					async () => ({ kind: "accept", value: { ok: 1 } }),
				);
				{
					const Sub = "overpass: value-carrying decision passes untouched";
					Check(Count, Sub, () => {
						assert.ok(OutO6.kind === "accept" && OutO6.value.ok === 1 && !("content" in OutO6));
					});
				}
			}
			{
				const MarkerBlockO = {
					type: "text",
					text: `[text:preview]\n<<<CCR:${"a".repeat(24)}|text|42>>>`,
				};
				const OutO7 = await PostO(
					ExecO("bash"),
					{ isError: false, value: {}, content: [MarkerBlockO] },
					NextAcceptO,
				);
				{
					const Sub = "overpass: marker-bearing content passes through the arm unchanged";
					Check(Count, Sub, () => {
						assert.ok(OutO7.kind === "accept" && !("content" in OutO7));
					});
				}
			}
			{
				const Sub = "overpass: O5/O6/O7 added NO ledger lines (the no-op and pass-through rules)";
				Check(Count, Sub, () => {
					assert.ok(RunO.Lines.length === LinesBeforeO5);
				});
			}
		}
		// O8: the files sweep through the command.
		{
			const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
			const Normalized6 = 'a-b"c"...d efAg';
			const CommandO = RunO.CommandsRegistered[0];
			const SweepFixture = "/tmp/normalize-file-smoke-sweep-a.txt";
			const CleanFixture = "/tmp/normalize-file-smoke-sweep-b.txt";
			RunO.Files.set(`key:${SweepFixture}`, All6);
			RunO.Files.set(`key:${CleanFixture}`, "already clean");
			const SweepO = await CommandO.handler({
				rawInput: `files ${SweepFixture} ${CleanFixture}`,
				signal: new AbortController().signal,
			});
			{
				const Sub = "overpass: the files sweep reports K and M in the command result";
				Check(Count, Sub, () => {
					assert.ok(
						SweepO.kind === "success" && SweepO.text.includes("swept 2 file(s), normalized 7 char(s)"),
					);
				});
			}
			{
				const Sub = "overpass: the sweep summary ledger line is byte-exact";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Lines.includes(
							"hook-dsh-normalize-file: overpass: swept 2 file(s), normalized 7 char(s)",
						),
					);
				});
			}
			{
				const Sub = "overpass: each changed file still writes its own count line (via Normalize)";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Lines.some((L: string) => L.includes(`normalized 7 char(s) in ${SweepFixture}`)) &&
							RunO.Lines.some((L: string) => L.includes("overpass: swept")),
					);
				});
			}
			{
				const Sub = "overpass: the sweep wrote the changed file and left the clean one untouched";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Files.get(`key:${SweepFixture}`) === Normalized6 &&
							RunO.Files.get(`key:${CleanFixture}`) === "already clean",
					);
				});
			}
			const SweepBadO = await CommandO.handler({
				rawInput: "files /tmp/normalize-file-smoke-missing.txt",
				signal: new AbortController().signal,
			});
			{
				const Sub = "overpass: a failing path fails the command with the context prefix";
				Check(Count, Sub, () => {
					assert.ok(SweepBadO.kind === "error" && SweepBadO.text.includes("cannot sweep"));
				});
			}
			const SweepNoPathO = await CommandO.handler({
				rawInput: "files",
				signal: new AbortController().signal,
			});
			{
				const Sub = "overpass: 'files' without paths is a usage error";
				Check(Count, Sub, () => {
					assert.ok(SweepNoPathO.kind === "error");
				});
			}
		}
		// O9: batch off by default -> pass-through; the arm on the six-fold.
		{
			const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
			const Normalized6 = 'a-b"c"...d efAg';
			const MsgO = (Text: string) => ({ role: "user", content: [{ type: "text", text: Text }] });
			const OutO9 = await PreO(
				{ agent: {}, messages: [MsgO(All6)], turn: 3, step: 1, signal: new AbortController().signal },
				async () => ({ kind: "enter", messages: [MsgO(All6)] }),
			);
			{
				const Sub = "overpass: batch off (default) -> the enter decision passes untouched";
				Check(Count, Sub, () => {
					assert.ok(OutO9.kind === "enter" && OutO9.messages[0].content[0].text === All6);
				});
			}
			LiveScopesO.batch = true;
			RunO.Listeners["loader/volatile-update"]([["scopes", "batch"]]);
			const OutO10 = await PreO(
				{ agent: {}, messages: [MsgO(All6)], turn: 3, step: 1, signal: new AbortController().signal },
				async () => ({ kind: "enter", messages: [MsgO(All6)] }),
			);
			{
				const Sub = "overpass: batch on -> the six-fold chain rewrites the batch text";
				Check(Count, Sub, () => {
					assert.ok(OutO10.kind === "enter" && OutO10.messages[0].content[0].text === Normalized6);
				});
			}
			{
				const Sub = "overpass: the step-batch ledger line is byte-exact";
				Check(Count, Sub, () => {
					assert.ok(
						RunO.Lines.includes(
							"hook-dsh-normalize-file: overpass: normalized 7 char(s) in step batch (turn 3 step 1)",
						),
					);
				});
			}
		}
		// O11: the command's other grammars on the owning flavor.
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
							ReportO.text.includes("files=on"),
					);
				});
			}
			const ResultsBadO = await CommandO.handler({
				rawInput: "results",
				signal: new AbortController().signal,
			});
			{
				const Sub = "overpass: 'results' without on|off is a usage error";
				Check(Count, Sub, () => {
					assert.ok(ResultsBadO.kind === "error");
				});
			}
			const ResultsO = await CommandO.handler({
				rawInput: "results off",
				signal: new AbortController().signal,
			});
			{
				const Sub =
					"overpass: 'results off' with no settings/config-editor service reports the settings path";
				Check(Count, Sub, () => {
					assert.ok(
						ResultsO.kind === "success" &&
							(ResultsO.text.includes("settings") || ResultsO.text.includes("config")),
					);
				});
			}
		}
		// O12: history safety across all non-sweep overpass activity: no extra
		// writes and no extra fs/observed emissions beyond the sweep's own.
		{
			const Sub =
				"overpass: exactly the sweep's own write + emit happened (every other overpass path wrote NOTHING)";
			Check(Count, Sub, () => {
				assert.ok(
					RunO.Writes.length === WritesO + 1 && RunO.Observations.length === ObservationsO + 1,
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
