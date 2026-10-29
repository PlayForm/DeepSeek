// Source/Test/Service-And-Match/Test.ts - the service surface and the
// ranked match: the loader contract (the class form with the Config static
// and the empty inject), the Service registration, the cold-start catalog,
// the idempotent registry, the byte-exact activation line, and the matcher's
// scoring arithmetic with both abstention paths (threshold, ambiguity).
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Make,
	MakeCounter,
	Messages,
	PatternService,
} from "../Harness.js";

/** A custom pattern for the matcher's arithmetic tests. */
const Pattern = (Id: string, Keywords: string[], Extra: Record<string, unknown> = {}): any => ({
	id: Id,
	intent: Id,
	trigger: { keywords: Keywords },
	targets: [],
	transform: [],
	arbiter: "test",
	confidence: 0.5,
	allowlist: false,
	updatedAt: 0,
	...Extra,
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group S1: the loader contract and the registration.
	{
		const Run = Make();
		Check(Count, "S1: the class form registers the service instance under `pattern`", () => {
			assert.equal(Run.Provided["pattern"], Run.Service);
			assert.equal(Run.Service.name, "pattern");
			assert.equal(Run.Service.ctx, Run.Context);
		});
		Check(Count, "S1: the loader contract - the Config static and the empty inject static", () => {
			assert.ok(PatternService.Config !== undefined);
			assert.deepEqual(PatternService.inject, []);
			assert.equal(typeof PatternService.Config, "function");
		});
		Check(Count, "S1: the cold start seeds the static catalog - never an empty registry", () => {
			assert.deepEqual(
				Run.Service.List().map((P: any) => P.id),
				["rename", "search", "test-update", "version-bump"],
			);
		});
		Check(Count, "S1: the activation line is byte-exact", () => {
			assert.deepEqual(Run.Lines, ["pattern: activated (seeded 4 patterns) (logFile ~/.dsh/playform/ets-plugin-dsh-pattern.log)"]);
		});
	}

	// Group S2: the registry.
	{
		const Run = Make();
		Check(Count, "S2: Get returns the stored pattern and undefined for unknown ids", () => {
			assert.equal(Run.Service.Get("version-bump").confidence, 0.5);
			assert.equal(Run.Service.Get("nope"), undefined);
		});
		Check(Count, "S2: Put is idempotent by id - a re-Put replaces, never duplicates", () => {
			Run.Service.Put(Pattern("version-bump", ["version"], { confidence: 0.9 }));
			assert.equal(Run.Service.List().length, 4);
			assert.equal(Run.Service.Get("version-bump").confidence, 0.9);
		});
		Check(Count, "S2: List is sorted by id for a deterministic output", () => {
			Run.Service.Put(Pattern("aaa", ["x"]));
			assert.deepEqual(
				Run.Service.List().map((P: any) => P.id),
				["aaa", "rename", "search", "test-update", "version-bump"],
			);
		});
	}

	// Group S3: the match arithmetic.
	{
		const Run = Make();
		Check(Count, "S3: the keyword overlap weighs 0.6 and the confidence 0.2 - exact score", () => {
			// "please bump the version" hits 2 of version-bump's 3 keywords:
			// 0.6 * (2/3) + 0.2 * 0 + 0.2 * 0.5 = 0.5.
			const Matched = Run.Service.Match({ text: "please bump the version" });
			assert.equal(Matched.length, 1);
			assert.equal(Matched[0].pattern.id, "version-bump");
			assert.ok(Math.abs(Matched[0].score - 0.5) < 1e-12);
		});
		Check(Count, "S3: the trigger's tool match weighs 0.2 - exact score", () => {
			// search: "find" hits 1 of 3 keywords (0.2) + tool 0.2 + 0.1 = 0.5
			// with the tool, 0.3 without it.
			const Without = Run.Service.Match({ text: "find it", tool: "grep" });
			const With = Run.Service.Match({ text: "find it", tool: "search" });
			assert.equal(With[0].pattern.id, "search");
			assert.ok(Math.abs(With[0].score - 0.5) < 1e-12);
			// Without the tool match the score drops to 0.3 - below the 0.35
			// threshold, so the match abstains entirely: the 0.2 tool weight is
			// what carries it over.
			assert.deepEqual(Without, []);
		});
		Check(Count, "S3: a score below matchThreshold abstains - the EMPTY result, never a guess", () => {
			assert.deepEqual(Run.Service.Match({ text: "unrelated chatter" }), []);
		});
		Check(Count, "S3: ambiguity - the top two within epsilon abstain", () => {
			Run.Service.Put(Pattern("dup-a", ["alpha"]));
			Run.Service.Put(Pattern("dup-b", ["alpha"]));
			assert.deepEqual(Run.Service.Match({ text: "alpha" }), []);
		});
		Check(Count, "S3: maxMatches caps the result; ties break by id", () => {
			Run.Service.Configure({ maxMatches: 1 });
			// Both rename and test-update score 0.5+ on "test the rename" ... use
			// a text that hits exactly one keyword of two patterns equally.
			Run.Service.Put(Pattern("tie-a", ["shared"]));
			Run.Service.Put(Pattern("tie-b", ["shared"]));
			Run.Service.Configure({ ambiguityEpsilon: 0 });
			const Matched = Run.Service.Match({ text: "shared" });
			assert.equal(Matched.length, 1);
			assert.equal(Matched[0].pattern.id, "tie-a");
		});
		Check(Count, "S3: a disabled service abstains to the empty result", () => {
			Run.Service.Configure({ enabled: false });
			assert.deepEqual(Run.Service.Match({ text: "please bump the version" }), []);
			assert.deepEqual(Messages(Run), ["pattern: activated (seeded 4 patterns)"]);
		});
	}
	return Finish(Count, "Service-And-Match");
};

// Standalone entry: `node Target/Test/Service-And-Match/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Service-And-Match`);
}
