// Source/Test/Overpass/Test.ts - one singular test: the OVERPASS ARM of the
// comment filter - the registration facts (the two listeners, the prepend
// ordering, the deliberate `read`/`ccr_retrieve` targeting), the envelope
// strip (prefixes and footer preserved, the byte-exact ledger line, the
// omission notice), the string guard, the unknown-extension identity, the
// ccr_retrieve target, the exemption list, the N=0 no-op, the CCR marker
// guard, the fail-open on a thrown transform, and the notice-off variant.
// Runs standalone (`node Target/Test/Overpass/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-comment-filter: the fake ctx + the REAL
// factory + the REAL comment-filter apply, from the Harness.
import assert from "node:assert/strict";

import { Check, Finish, Ledger, Make, MakeCounter, Rm, Validate } from "../Harness.js";

/** The read tool's model-facing envelope (the harness contract, byte-exact). */
const Envelope = (Path: string, Body: string): string =>
	`<path>${Path}</path>\n<type>file</type>\n<content>\n${Body}\n</content>`;

/** A numbered body: the numbered lines, the blank separator, the footer. */
const Body = (Lines: string[], Footer: string): string => [...Lines, "", Footer].join("\n");

/** The omission notice line (module-owned, byte-exact). */
const Omission =
	"(Comments omitted. Use grep to inspect them, or ask the user to include comments.)";

/** A text content block. */
const Block = (Value: string) => ({ type: "text", text: Value });

/** A settled tool result whose only content is one text block. */
const Outcome = (Value: string) => ({ isError: false, value: {}, content: [Block(Value)] });

/** One tool execution identity. */
const Exec = (Name: string) => ({
	callId: "call_smoke",
	name: Name,
	arguments: {},
	signal: new AbortController().signal,
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: O - the overpass arm. One apply with the REAL schema defaults
	// (Validate fills every default, so the checks also prove the mission's
	// default table: targets, exempt, intent, notice).
	Rm();
	{
		const RunO = Make(Validate({ logFile: Ledger }));
		const PostO = RunO.Listeners["tools/post-execute"];
		const NextAcceptO = async () => ({ kind: "accept" });
		// O0: registration and default facts.
		{
			const Sub = "overpass: the tools/post-execute arm is registered";
			Check(Count, Sub, () => {
				assert.ok(typeof PostO === "function");
			});
		}
		{
			const Sub =
				"overpass: the post-execute arm PREPENDS (the ccr arm's own prepend sees the filtered bytes)";
			Check(Count, Sub, () => {
				assert.ok(RunO.ListenerOptions["tools/post-execute"]?.prepend === true);
			});
		}
		{
			const Sub = "overpass: the agent/pre-step arm is registered";
			Check(Count, Sub, () => {
				assert.ok(typeof RunO.Listeners["agent/pre-step"] === "function");
			});
		}
		{
			const Sub =
				"overpass: the default targets are read and ccr_retrieve (read is NOT exempt here)";
			Check(Count, Sub, () => {
				assert.deepEqual([...RunO.State.Targets], ["read", "ccr_retrieve"]);
			});
		}
		{
			const Sub =
				"overpass: the default exemption list omits read and ccr_retrieve (the deliberate opposite)";
			Check(Count, Sub, () => {
				assert.ok(
					!RunO.State.Exempt.includes("read") &&
						!RunO.State.Exempt.includes("ccr_retrieve") &&
						RunO.State.Exempt.includes("edit") &&
						RunO.State.Exempt.includes("raw-write"),
				);
			});
		}
		{
			const Sub = "overpass: the activation line is byte-exact";
			Check(Count, Sub, () => {
				assert.ok(
					RunO.Lines.includes(
						`hook-dsh-comment-filter: activated (targets 2, intent on, notice on, logFile=${Ledger})`,
					),
				);
			});
		}
		// O1: a read envelope strips its comments, preserving every line-number
		// prefix and the footer, and appends the omission notice.
		const SourceO1 = Envelope(
			"/tmp/demo.ts",
			Body(
				["1: // leading comment", "2: const a = 1;", "3: const b = 2; // trailing comment"],
				"(End of file - total 3 lines)",
			),
		);
		const ExpectedO1 = Envelope(
			"/tmp/demo.ts",
			Body(
				["1: ", "2: const a = 1;", "3: const b = 2; "],
				"(End of file - total 3 lines)",
			) +
				"\n" +
				Omission,
		);
		const OutO1 = await PostO(Exec("read"), Outcome(SourceO1), NextAcceptO);
		{
			const Sub =
				"overpass: a read envelope strips comments and preserves every line-number prefix and the footer";
			Check(Count, Sub, () => {
				assert.ok(OutO1.kind === "accept");
				assert.equal(OutO1.content[0].text, ExpectedO1);
			});
		}
		{
			const Sub = "overpass: the tool-result ledger line is byte-exact";
			Check(Count, Sub, () => {
				assert.ok(
					RunO.Lines.includes(
						"hook-dsh-comment-filter: filtered 2 comment(s) in tool result read call_smoke",
					),
				);
			});
		}
		{
			const Sub = "overpass: the omission notice is appended when notice is on";
			Check(Count, Sub, () => {
				assert.ok(
					OutO1.content[0].text.includes(`\n${Omission}\n</content>`) &&
						OutO1.content[0].text.endsWith(`</content>`),
				);
			});
		}
		// O2: a `//` inside a string is a STRING, not a comment - only the real
		// trailing comment is removed.
		const SourceO2 = Envelope(
			"/tmp/strings.ts",
			Body(
				[
					'1: const Url = "https://example.com"; // trailing',
					"2: const Quote = '// not a comment';",
				],
				"(End of file - total 2 lines)",
			),
		);
		const ExpectedO2 = Envelope(
			"/tmp/strings.ts",
			Body(
				['1: const Url = "https://example.com"; ', "2: const Quote = '// not a comment';"],
				"(End of file - total 2 lines)",
			) +
				"\n" +
				Omission,
		);
		const OutO2 = await PostO(Exec("read"), Outcome(SourceO2), NextAcceptO);
		{
			const Sub =
				"overpass: a `//` inside a string is untouched (only the real trailing comment is removed)";
			Check(Count, Sub, () => {
				assert.equal(OutO2.content[0].text, ExpectedO2);
			});
		}
		// O3: an unknown extension is never stripped (never strip what cannot
		// be parsed), and the N=0 rule means no ledger line.
		{
			const LinesBeforeO3 = RunO.Lines.length;
			const SourceO3 = Envelope(
				"/tmp/readme.md",
				Body(["1: // looks like a comment"], "(End of file - total 1 lines)"),
			);
			const OutO3 = await PostO(Exec("read"), Outcome(SourceO3), NextAcceptO);
			const Sub = "overpass: an unknown extension (.md) passes through by identity";
			Check(Count, Sub, () => {
				assert.ok(OutO3.kind === "accept" && !("content" in OutO3));
				assert.ok(RunO.Lines.length === LinesBeforeO3);
			});
		}
		// O4: ccr_retrieve is TARGETED: a retrieval carrying the read-shaped
		// envelope strips exactly like a read, and the ledger names the tool.
		const SourceO4 = Envelope(
			"/tmp/module.py",
			Body(
				["1: # module doc", "2: def f():", "3: return 1  # trailing"],
				"(End of file - total 3 lines)",
			),
		);
		const ExpectedO4 = Envelope(
			"/tmp/module.py",
			Body(["1: ", "2: def f():", "3: return 1  "], "(End of file - total 3 lines)") +
				"\n" +
				Omission,
		);
		const OutO4 = await PostO(Exec("ccr_retrieve"), Outcome(SourceO4), NextAcceptO);
		{
			const Sub = "overpass: ccr_retrieve is targeted (its read-shaped envelope strips)";
			Check(Count, Sub, () => {
				assert.equal(OutO4.content[0].text, ExpectedO4);
			});
		}
		{
			const Sub = "overpass: the ccr_retrieve ledger line is byte-exact";
			Check(Count, Sub, () => {
				assert.ok(
					RunO.Lines.includes(
						"hook-dsh-comment-filter: filtered 2 comment(s) in tool result ccr_retrieve call_smoke",
					),
				);
			});
		}
		// O5: an exempt tool passes by identity even with parseable content.
		{
			const LinesBeforeO5 = RunO.Lines.length;
			const OutO5 = await PostO(Exec("edit"), Outcome(SourceO1), NextAcceptO);
			const Sub = "overpass: an exempt tool (edit) passes through by identity";
			Check(Count, Sub, () => {
				assert.ok(OutO5.kind === "accept" && !("content" in OutO5));
				assert.ok(RunO.Lines.length === LinesBeforeO5);
			});
		}
		// O6: N = 0 -> the downstream decision unchanged and NO ledger line.
		{
			const LinesBeforeO6 = RunO.Lines.length;
			const SourceO6 = Envelope(
				"/tmp/plain.ts",
				Body(["1: const a = 1;"], "(End of file - total 1 lines)"),
			);
			const OutO6 = await PostO(Exec("read"), Outcome(SourceO6), NextAcceptO);
			{
				const Sub = "overpass: N=0 -> the downstream decision is unchanged";
				Check(Count, Sub, () => {
					assert.ok(OutO6.kind === "accept" && !("content" in OutO6));
				});
			}
			{
				const Sub = "overpass: N=0 -> NO ledger line (the no-op rule)";
				Check(Count, Sub, () => {
					assert.ok(RunO.Lines.length === LinesBeforeO6);
				});
			}
		}
		// O7: the core's CCR marker guard: marker-bearing content passes
		// through unchanged (the arm is order-safe against the CCR hook).
		{
			const LinesBeforeO7 = RunO.Lines.length;
			const SourceO7 = Envelope(
				"/tmp/spill.ts",
				Body(
					['1: const Spill = "<<<CCR:0123456789abcdef01234567|text|42>>>"; // trailing'],
					"(End of file - total 1 lines)",
				),
			);
			const OutO7 = await PostO(Exec("read"), Outcome(SourceO7), NextAcceptO);
			const Sub =
				"overpass: a block carrying the CCR marker passes through (the core's marker guard)";
			Check(Count, Sub, () => {
				assert.ok(OutO7.kind === "accept" && !("content" in OutO7));
				assert.ok(RunO.Lines.length === LinesBeforeO7);
			});
		}
		// O8: fail-open on a thrown transform: a State whose `notice` getter
		// throws makes Strip throw AFTER the scan; the core's catch must keep
		// the downstream decision and write nothing. A FRESH apply, so the
		// broken cell never leaks into the other checks.
		{
			const BrokenO = Make(Validate({ logFile: Ledger }));
			Object.defineProperty(BrokenO.State, "Notice", {
				configurable: true,
				get() {
					throw new Error("boom");
				},
			});
			const LinesBeforeO8 = BrokenO.Lines.length;
			const OutO8 = await BrokenO.Listeners["tools/post-execute"](
				Exec("read"),
				Outcome(SourceO1),
				NextAcceptO,
			);
			const Sub =
				"overpass: a thrown transform fails open (the downstream decision unchanged, no ledger line)";
			Check(Count, Sub, () => {
				assert.ok(OutO8.kind === "accept" && !("content" in OutO8));
				assert.ok(BrokenO.Lines.length === LinesBeforeO8);
			});
		}
		// O9: notice off -> the strip still happens, without the notice line.
		{
			const QuietO = Make(Validate({ logFile: Ledger, notice: false }));
			const SourceO9 = Envelope(
				"/tmp/quiet.ts",
				Body(["1: // comment", "2: const a = 1;"], "(End of file - total 2 lines)"),
			);
			const ExpectedO9 = Envelope(
				"/tmp/quiet.ts",
				Body(["1: ", "2: const a = 1;"], "(End of file - total 2 lines)"),
			);
			const OutO9 = await QuietO.Listeners["tools/post-execute"](
				Exec("read"),
				Outcome(SourceO9),
				NextAcceptO,
			);
			const Sub = "overpass: notice off strips without the omission notice";
			Check(Count, Sub, () => {
				assert.equal(OutO9.content[0].text, ExpectedO9);
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
