// Source/Test/Raw-Write-Tool/Test.ts - one singular test: the raw-write tool
// surface - the captured registration (name, input schema with the OPTIONAL
// normalize/govern unions, output envelope), the execution path (verbatim by
// default, all six transforms on, the real before/after of an overwrite, the
// pre-aborted rejection), the per-call flavor selection with the family
// order, the presenters' selection-aware view, and the govern call path with
// the wrapped actor, the sequential fold and the omission rule.
// Runs standalone (`node Target/Test/Raw-Write-Tool/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-normalize-dash: the fake ctx + the REAL
// factory + the REAL dash apply, from the Harness.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter, Make, Rm, Validate, Furnace, Ledger } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	Rm();
	// Group: Run 8 - the raw-write tool (registration capture + exec).
	{
		const Run8 = Make(Validate({ logFile: Ledger }));
		const Tool = Run8.Registered[0];
		{
			const Sub = "exactly one tool registered";
			Check(Count, Sub, () => {
				assert.ok(Run8.Registered.length === 1);
			});
		}
		{
			const Sub = "the tool registration is captured: the tool is named raw-write";
			Check(Count, Sub, () => {
				assert.ok(Tool && Tool.name === "raw-write");
			});
		}
		{
			const Sub = "input schema: file_path is a required string";
			Check(Count, Sub, () => {
				assert.ok(
					Tool.parameters.properties.file_path.type === "string" &&
						Tool.parameters.required.includes("file_path"),
				);
			});
		}
		{
			const Sub = "input schema: content is a required string";
			Check(Count, Sub, () => {
				assert.ok(
					Tool.parameters.properties.content.type === "string" &&
						Tool.parameters.required.includes("content"),
				);
			});
		}
		{
			const Sub =
				'input schema: normalize is an OPTIONAL union (boolean | "all" | the flavor-name array \u2014 the harness tools reject unknown keys, so the whole selection shape is declared)';
			Check(Count, Sub, () => {
				const NormalizeUnion = Tool.parameters.properties.normalize.oneOf;
				assert.ok(
					Array.isArray(NormalizeUnion) &&
						NormalizeUnion.length === 3 &&
						NormalizeUnion[0].type === "boolean" &&
						NormalizeUnion[1].type === "string" &&
						NormalizeUnion[1].enum.join() === "all" &&
						NormalizeUnion[2].type === "array" &&
						NormalizeUnion[2].items.type === "string" &&
						NormalizeUnion[2].items.enum.join() ===
							"dash,quotes,ellipsis,spaces,invisible,fullwidth",
				);
			});
		}
		{
			const Sub = "normalize stays OPTIONAL";
			Check(Count, Sub, () => {
				assert.ok(!Tool.parameters.required.includes("normalize"));
			});
		}
		{
			const Sub = 'input schema: govern is an OPTIONAL union (boolean | "all" | the step-name array)';
			Check(Count, Sub, () => {
				const GovernUnion = Tool.parameters.properties.govern.oneOf;
				assert.ok(
					Array.isArray(GovernUnion) &&
						GovernUnion.length === 3 &&
						GovernUnion[0].type === "boolean" &&
						GovernUnion[1].type === "string" &&
						GovernUnion[1].enum.join() === "all" &&
						GovernUnion[2].type === "array" &&
						GovernUnion[2].items.type === "string" &&
						GovernUnion[2].items.enum.join() === "canonicalize,pin,cargo,update",
				);
			});
		}
		{
			const Sub = "govern stays OPTIONAL";
			Check(Count, Sub, () => {
				assert.ok(!Tool.parameters.required.includes("govern"));
			});
		}
		{
			const Sub = "output schema mirrors the built-in write envelope (path/operation/before/after)";
			Check(Count, Sub, () => {
				assert.ok(
					Tool.output.schema.properties.path.type === "string" &&
						Tool.output.schema.properties.operation.enum.join() === "create,update" &&
						Tool.output.schema.required.join() === "path,operation,before,after",
				);
			});
		}
		const Exec = (Signal?: AbortSignal) => ({
			signal: Signal ?? new AbortController().signal,
			agent: undefined,
			callId: "call_smoke",
		});
		// normalize ABSENT \u2192 verbatim (the default).
		const Verbatim = "a\u2014b\u201Cc\u201D";
		{
			const Out8a = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-verbatim.txt", content: Verbatim },
				Exec(),
			);
			{
				const Sub = "normalize absent: content written VERBATIM (em dash and curly quotes untouched)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.length === 1 && Run8.Writes[0].content === Verbatim);
				});
			}
			{
				const Sub = "the fs/write-intent waterfall's next() default flowed through (unconditional write)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes[0].intent === undefined);
				});
			}
			{
				const Sub = "bare backend: no sandbox policy stamped onto the write";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes[0].policy === undefined);
				});
			}
			{
				const Sub = "fs/observed emitted with the written version (the governance hooks' trigger)";
				Check(Count, Sub, () => {
					assert.ok(
						Run8.Observations.some(
							(O: any) =>
								O.name === "fs/observed" &&
								O.observation.kind === "present" &&
								O.observation.version === "v1",
						),
					);
				});
			}
			{
				const Sub =
					"the emitted actor is the WRAPPED exec: the govern marker present, false for an absent flag (the factory's gate skips the event path)";
				Check(Count, Sub, () => {
					assert.ok(
						Run8.Observations[0].actor &&
							"govern" in Run8.Observations[0].actor &&
							Run8.Observations[0].actor.govern === false,
					);
				});
			}
			{
				const Sub =
					"the wrapped actor preserves every exec field (the spread \u2014 name/callId/agent/signal survive for the harness's own listeners)";
				Check(Count, Sub, () => {
					assert.ok(
						Run8.Observations[0].actor.callId === "call_smoke" &&
							"signal" in Run8.Observations[0].actor &&
							Run8.Observations[0].actor.agent === undefined,
					);
				});
			}
			{
				const Sub = "the write outcome is returned (path, create, before null, after verbatim)";
				Check(Count, Sub, () => {
					assert.ok(
						Out8a.path === "/tmp/normalize-dash-smoke-verbatim.txt" &&
							Out8a.operation === "create" &&
							Out8a.before === null &&
							Out8a.after === Verbatim,
					);
				});
			}
		}
		// normalize: true \u2192 all SIX transforms, in order.
		{
			const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
			const Normalized6 = 'a-b"c"...d efAg';
			const Out8b = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-normalized.txt", content: All6, normalize: true },
				Exec(),
			);
			{
				const Sub =
					"normalize: true \u2192 all six transforms applied (em dash\u2192-, curly quotes\u2192straight, ellipsis\u2192..., NBSP\u2192space, zero-width removed, fullwidth\u2192halfwidth)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes[1].content === Normalized6);
				});
			}
			{
				const Sub = "the normalized write to a new path reports create with the normalized after";
				Check(Count, Sub, () => {
					assert.ok(Out8b.operation === "create" && Out8b.after === Normalized6);
				});
			}
			// Overwrite the verbatim path: the outcome carries the real before/after.
			const Out8d = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-verbatim.txt", content: All6 },
				Exec(),
			);
			{
				const Sub = "an overwrite reports update with the real before/after contents";
				Check(Count, Sub, () => {
					assert.ok(Out8d.operation === "update" && Out8d.before === Verbatim && Out8d.after === All6);
				});
			}
			// normalize: false EXPLICITLY \u2192 verbatim.
			await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-explicit.txt", content: All6, normalize: false },
				Exec(),
			);
			{
				const Sub = "normalize: false \u2192 content written VERBATIM";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes[2].content === All6);
				});
			}
		}
		// The configured replacement knob flows into the tool's Dashes transform.
		{
			Rm();
			const Run8b = Make(Validate({ replacement: "$&", logFile: Ledger }));
			await Run8b.Registered[0].execute(
				{ file_path: "/tmp/normalize-dash-smoke-replacement.txt", content: "a\u2014b", normalize: true },
				Exec(),
			);
			{
				const Sub = "the volatile replacement knob flows into the tool (literal $& \u2014 the function replacer)";
				Check(Count, Sub, () => {
					assert.ok(Run8b.Writes[0].content === "a$&b");
				});
			}
		}
		// A pre-aborted signal \u2192 NO write (the fs seam honors the signal; the real
		// registry rejects a pre-aborted invocation before the body even runs).
		{
			const WritesBeforeAbort = Run8.Writes.length;
			const Aborted = new AbortController();
			Aborted.abort();
			let AbortError: any = null;
			try {
				await Tool.execute(
					{ file_path: "/tmp/normalize-dash-smoke-abort.txt", content: "x\u2014y" },
					Exec(Aborted.signal),
				);
			} catch (E) {
				AbortError = E;
			}
			{
				const Sub = "a pre-aborted signal rejects the call";
				Check(Count, Sub, () => {
					assert.ok(AbortError !== null && /aborted/.test(AbortError.message));
				});
			}
			{
				const Sub = "a pre-aborted signal writes NOTHING (no fs write after the abort)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.length === WritesBeforeAbort);
				});
			}
		}
	}
	// Group: Run 9 - the fine-grained normalize selection (per-call flavors).
	{
		const Run8 = Make(Validate({ logFile: Ledger }));
		const Tool = Run8.Registered[0];
		const Exec = (Signal?: AbortSignal) => ({
			signal: Signal ?? new AbortController().signal,
			agent: undefined,
			callId: "call_smoke",
		});
		const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
		const Normalized6 = 'a-b"c"...d efAg';
		const DashOnly = "a-b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g"; // ONLY the em dash replaced
		const QuotesOnly = 'a\u2014b"c"\u2026d\u00A0e\u200Bf\uFF21g'; // ONLY the curly quotes replaced
		{
			const Out9a = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-sel-dash.txt", content: All6, normalize: ["dash"] },
				Exec(),
			);
			{
				const Sub =
					'normalize: ["dash"] \u2192 ONLY the dashes replaced (quotes, ellipsis, spaces, invisible, fullwidth untouched)';
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.at(-1).content === DashOnly);
				});
			}
			{
				const Sub = "the [\"dash\"] write's after mirrors the selection";
				Check(Count, Sub, () => {
					assert.ok(Out9a.after === DashOnly);
				});
			}
		}
		{
			await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-sel-quotes.txt", content: All6, normalize: ["quotes"] },
				Exec(),
			);
			{
				const Sub = 'normalize: ["quotes"] \u2192 ONLY the curly quotes replaced (em dash untouched)';
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.at(-1).content === QuotesOnly);
				});
			}
		}
		{
			await Tool.execute(
				{
					file_path: "/tmp/normalize-dash-smoke-sel-fullwidth.txt",
					content: All6,
					normalize: ["fullwidth"],
				},
				Exec(),
			);
			{
				const Sub = 'normalize: ["fullwidth"] \u2192 ONLY the fullwidth mapped (\uFF21 \u2192 A)';
				Check(Count, Sub, () => {
					assert.ok(
						Run8.Writes.at(-1).content === "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf" + "Ag",
					);
				});
			}
		}
		// The family order is fixed even when the selection is out of order.
		{
			await Tool.execute(
				{
					file_path: "/tmp/normalize-dash-smoke-sel-order.txt",
					content: All6,
					normalize: ["fullwidth", "dash", "quotes"],
				},
				Exec(),
			);
			{
				const Sub =
					"an out-of-order selection applies the flavors in the FAMILY order (dashes \u2192 quotes \u2192 fullwidth)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.at(-1).content === 'a-b"c"\u2026d\u00A0e\u200BfAg');
				});
			}
		}
		// "all" as a string is the legacy boolean behavior, byte-equivalent.
		{
			await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-sel-all.txt", content: All6, normalize: "all" },
				Exec(),
			);
			{
				const Sub = 'normalize: "all" \u2192 all six transforms (byte-equivalent with normalize: true)';
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.at(-1).content === Normalized6);
				});
			}
		}
		// An empty selection and unknown names are verbatim.
		{
			await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-sel-empty.txt", content: All6, normalize: [] },
				Exec(),
			);
			{
				const Sub = "normalize: [] \u2192 an empty selection writes VERBATIM";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.at(-1).content === All6);
				});
			}
		}
		{
			let BogusError: any = null;
			try {
				await Tool.execute(
					{
						file_path: "/tmp/normalize-dash-smoke-sel-bogus.txt",
						content: All6,
						normalize: ["bogus"],
					},
					Exec(),
				);
			} catch (E) {
				BogusError = E;
			}
			{
				const Sub =
					'normalize: ["bogus"] \u2014 the union schema REJECTS unknown flavor names (harness-style args validation; the chain\'s own filter is the second gate)';
				Check(Count, Sub, () => {
					assert.ok(
						BogusError !== null && /must match exactly one oneOf branch/.test(BogusError.message),
					);
				});
			}
		}
		// The presenters recompute through the same selection-aware chain.
		{
			const Call9 = Tool.presentCall({ file_path: "/x", content: All6, normalize: ["dash"] });
			{
				const Sub = "presentCall shows the selection-aware content (card and file can never disagree)";
				Check(Count, Sub, () => {
					assert.ok(Call9.diffs[0].newText === DashOnly);
				});
			}
			const Result9 = Tool.presentResult(
				{ file_path: "/x", content: All6, normalize: ["dash"] },
				{ isError: false },
			);
			{
				const Sub = "presentResult shows the selection-aware content";
				Check(Count, Sub, () => {
					assert.ok(Result9.diffs[0].newText === DashOnly);
				});
			}
		}
	}
	// Group: Run 10 - the govern call path (the registry is EMPTY here).
	{
		const Run8 = Make(Validate({ logFile: Ledger }));
		const Tool = Run8.Registered[0];
		const Exec = (Signal?: AbortSignal) => ({
			signal: Signal ?? new AbortController().signal,
			agent: undefined,
			callId: "call_smoke",
		});
		const All6 = "a\u2014b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
		const DashOnly = "a-b\u201Cc\u201D\u2026d\u00A0e\u200Bf\uFF21g";
		{
			const Writes10 = Run8.Writes.length;
			const StepsBefore = Object.keys(Furnace.GovernSteps).length;
			const Out10a = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-gov-true.txt", content: All6, govern: true },
				Exec(),
			);
			{
				const Sub =
					"govern: true with an empty registry \u2014 the write completes (the governed call is a contained no-op)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.length === Writes10 + 1 && Out10a.after === All6);
				});
			}
			{
				const Sub =
					"govern: true \u2014 the wrapped actor carries the selection value (true; the gate checks presence, the direct path gets the original flag)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Observations.at(-1).actor.govern === true);
				});
			}
			const Out10b = await Tool.execute(
				{
					file_path: "/tmp/normalize-dash-smoke-gov-steps.txt",
					content: All6,
					govern: ["canonicalize", "pin"],
				},
				Exec(),
			);
			{
				const Sub =
					"govern: a step-name array with an empty registry \u2014 the write completes (the governed call is a contained no-op)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.length === Writes10 + 2 && Out10b.after === All6);
				});
			}
			{
				const Sub = "govern: [steps] \u2014 the wrapped actor carries the array selection as-is";
				Check(Count, Sub, () => {
					assert.ok(
						JSON.stringify(Run8.Observations.at(-1).actor.govern) ===
							JSON.stringify(["canonicalize", "pin"]),
					);
				});
			}
			let GovBogusError: any = null;
			try {
				await Tool.execute(
					{ file_path: "/tmp/normalize-dash-smoke-gov-bogus.txt", content: All6, govern: ["bogus"] },
					Exec(),
				);
			} catch (E) {
				GovBogusError = E;
			}
			{
				const Sub = 'govern: ["bogus"] \u2014 the union schema rejects unknown step names at the harness boundary';
				Check(Count, Sub, () => {
					assert.ok(
						GovBogusError !== null && /must match exactly one oneOf branch/.test(GovBogusError.message),
					);
				});
			}
			const Out10c = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-gov-all.txt", content: All6, govern: "all" },
				Exec(),
			);
			{
				const Sub = 'govern: "all" with an empty registry \u2014 the write completes';
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.length === Writes10 + 3 && Out10c.after === All6);
				});
			}
			{
				const Sub = 'govern: "all" \u2014 the marker maps to true like the boolean';
				Check(Count, Sub, () => {
					assert.ok(Run8.Observations.at(-1).actor.govern === true);
				});
			}
			{
				const Sub = "govern: the empty registry stays empty (no steps registered by the calls)";
				Check(Count, Sub, () => {
					assert.ok(Object.keys(Furnace.GovernSteps).length === StepsBefore);
				});
			}
			// govern combined with the normalize selection on one call.
			const Out10d = await Tool.execute(
				{
					file_path: "/tmp/normalize-dash-smoke-gov-norm.txt",
					content: All6,
					normalize: ["dash"],
					govern: true,
				},
				Exec(),
			);
			{
				const Sub = "govern + normalize compose on one call (selection-aware write, contained govern)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.length === Writes10 + 4 && Out10d.after === DashOnly);
				});
			}
			// govern: false \u2192 no governance (the default posture), still verbatim
			// without normalize.
			const Out10e = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-gov-false.txt", content: All6, govern: false },
				Exec(),
			);
			{
				const Sub = "govern: false \u2014 no governance chain, verbatim write";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.length === Writes10 + 5 && Out10e.after === All6);
				});
			}
			{
				const Sub =
					"govern: false \u2014 the marker maps to false (still present: the event path stays skipped)";
				Check(Count, Sub, () => {
					assert.ok(Run8.Observations.at(-1).actor.govern === false);
				});
			}
		}
		// Run 10 addendum: the Govern call's ACTOR. The direct steps must receive
		// the WRAPPED actor (the marker rides along), not the plain exec.
		{
			const ProbeRuns: any[] = [];
			Furnace.RegisterGovern(
				"normalize-dash-smoke-gov-actor.txt",
				"pin",
				(Target: any, Actor: any, Version: any) => {
					ProbeRuns.push({ target: Target, actor: Actor, version: Version });
				},
			);
			const Writes10 = Run8.Writes.length;
			const Out10f = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-gov-actor.txt", content: All6, govern: ["pin"] },
				Exec(),
			);
			{
				const Sub = "govern actor probe: the write completes with a registered step in the chain";
				Check(Count, Sub, () => {
					assert.ok(Run8.Writes.length === Writes10 + 1 && Out10f.after === All6);
				});
			}
			{
				const Sub =
					"govern actor probe: the direct step runs once with the written outcome's fresh version (the fs/observed emit's token)";
				Check(Count, Sub, () => {
					assert.ok(
						ProbeRuns.length === 1 && ProbeRuns[0].version === Run8.Observations.at(-1).observation.version,
					);
				});
			}
			{
				const Sub =
					"govern actor probe: the direct step receives the WRAPPED actor \u2014 the govern marker present with the mapped selection (NOT the plain exec)";
				Check(Count, Sub, () => {
					assert.ok(
						ProbeRuns[0].actor &&
							"govern" in ProbeRuns[0].actor &&
							JSON.stringify(ProbeRuns[0].actor.govern) === JSON.stringify(["pin"]),
					);
				});
			}
			{
				const Sub = "govern actor probe: the spread preserves the exec fields (callId, signal ride along)";
				Check(Count, Sub, () => {
					assert.ok(ProbeRuns[0].actor.callId === "call_smoke" && "signal" in ProbeRuns[0].actor);
				});
			}
			// govern: false omits the Govern call entirely \u2014 the registered probe
			// never runs.
			const ProbeRunsBefore = ProbeRuns.length;
			await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-gov-actor-false.txt", content: All6, govern: false },
				Exec(),
			);
			{
				const Sub =
					"govern: false \u2014 the Govern call is omitted entirely (the registered probe step never runs)";
				Check(Count, Sub, () => {
					assert.ok(ProbeRuns.length === ProbeRunsBefore);
				});
			}
			// The SEQUENTIAL FOLD (factory v0.2.1): the exec AWAITS the Govern call,
			// so an async step's promise is fulfilled before the tool result
			// returns (each step's chain completes before the next step reads the
			// file).
			const SlowRuns: any[] = [];
			Furnace.RegisterGovern(
				"normalize-dash-smoke-gov-async.txt",
				"slow",
				async (Target: any, Actor: any, Version: any) => {
					await new Promise((R) => setTimeout(R, 10));
					SlowRuns.push({ target: Target, actor: Actor, version: Version });
				},
			);
			const OutSlow = await Tool.execute(
				{ file_path: "/tmp/normalize-dash-smoke-gov-async.txt", content: All6, govern: true },
				Exec(),
			);
			{
				const Sub = "govern sequential fold: the write completes with an async registered step in the chain";
				Check(Count, Sub, () => {
					// +3 relative to the recaptured baseline: the actor probe's own
					// write, then the gov-actor-false verbatim write, then this
					// call - the same arithmetic as the source suite's
					// "Writes10+8" measured from its single Run-10 baseline.
					assert.ok(Run8.Writes.length === Writes10 + 3 && OutSlow.after === All6);
				});
			}
			{
				const Sub =
					"govern sequential fold: the async step ran ONCE and completed BEFORE the tool result returned (the exec awaits the fold)";
				Check(Count, Sub, () => {
					assert.ok(
						SlowRuns.length === 1 && SlowRuns[0].version === Run8.Observations.at(-1).observation.version,
					);
				});
			}
			{
				const Sub = "govern sequential fold: the async step receives the wrapped actor like the sync steps";
				Check(Count, Sub, () => {
					assert.ok(SlowRuns[0].actor && JSON.stringify(SlowRuns[0].actor.govern) === "true");
				});
			}
		}
	}
	return Finish(Count, "Raw-Write-Tool");
};

// Standalone entry: `node Target/Test/Raw-Write-Tool/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Raw-Write-Tool`);
}
