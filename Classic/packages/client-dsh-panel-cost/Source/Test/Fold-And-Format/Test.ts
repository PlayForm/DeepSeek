// Source/Test/Fold-And-Format/Test.ts - the model layer folded and
// formatted through the real built Target: the Price ladder acceptance
// cases (Design.md section 13.3), the Count/CountShort/Rate/Lines/Share
// formatters, and the Fold groupBy of Design.md section 10 over hand-built
// call fixtures - the bucket sums, the dominant provider and model, the
// unpriced/error/retry counters, the file and tool tallies, and the
// no-throw posture on malformed responses. No re-implementation: every
// assertion runs against the built Target/Function modules, loaded after
// the shared Harness registers the alias hooks.
import assert from "node:assert/strict";
import { Check, Finish, MakeCounter } from "../Harness.js";
import Fold from "../../../Target/Function/Fold.js";
import Price from "../../../Target/Function/Price.js";
import Count from "../../../Target/Function/Count.js";
import CountShort from "../../../Target/Function/CountShort.js";
import Rate from "../../../Target/Function/Rate.js";
import Share from "../../../Target/Function/Share.js";
import Lines from "../../../Target/Function/Lines.js";

// -- fixtures: CostCall-shaped rows with every optional field filled --

const Tokens = (Input: number, Read: number, Write: number, Output: number): any => ({
	input: Input,
	output: Output,
	cacheRead: Read,
	cacheWrite: Write,
	reasoning: 0,
	total: Input + Read + Write + Output,
	reported: null,
});

const Money = (Total: number, Input: number, Read: number, Output: number): any => ({
	input: Input,
	output: Output,
	cacheRead: Read,
	cacheWrite: 0,
	reasoning: 0,
	total: Total,
	other: Math.max(0, Total - Read - Input - Output),
});

const Call = (overrides: any = {}): any => ({
	turn: 1,
	step: 1,
	seq: 1,
	at: 0,
	provider: "deepseek",
	model: "model-a",
	mode: "standard",
	region: null,
	tier: null,
	priced: true,
	currency: "USD",
	tokens: Tokens(0, 0, 0, 0),
	cost: Money(0, 0, 0, 0),
	saving: 0,
	attempts: 1,
	error: null,
	surfaceTokens: 0,
	purpose: null,
	contextWindow: null,
	utilization: null,
	latencyMs: null,
	firstTokenMs: null,
	tokensPerSecond: null,
	direct: 0,
	amortized: 0,
	allocations: 0,
	files: [],
	...overrides,
});

const Touch = (Path: string, overrides: any = {}): any => ({
	path: Path,
	kind: null,
	stage: null,
	tool: null,
	branch: null,
	readBeforeEdit: false,
	direct: 0,
	amortized: 0,
	total: 0,
	linesDelta: null,
	bytesDelta: null,
	durationMs: null,
	touched: false,
	at: 0,
	...overrides,
});

const Response = (calls: any[], summary: any = {}): any => ({
	ok: true,
	code: "ok",
	message: null,
	path: "",
	rows: calls.length,
	truncated: false,
	session: null,
	currency: "USD",
	currencies: [],
	summary,
	calls,
});

export const runTest = (): number => {
	const Meter = MakeCounter();

	// F1: the Price ladder acceptance cases, verbatim from Design.md 13.3.
	Check(Meter, "F1: the Price ladder matches the acceptance cases", () => {
		assert.equal(Price(0, "USD"), "$0.00");
		assert.equal(Price(0.0123, "USD"), "$0.0123");
		assert.equal(Price(0.000123, "USD"), "$0.000123");
		assert.equal(Price(1.5, "USD"), "$1.50");
		assert.equal(Price(1234.567, "USD"), "$1,234.57");
		assert.equal(Price(-0.0123, "USD"), "-$0.0123");
		assert.equal(Price(0.0123, "EUR"), "EUR 0.0123");
		assert.equal(Price(null, "USD"), "-");
		assert.equal(Price(0.0000001, "USD"), "<$0.000001");
	});

	// F2: the integer and compact token formatters.
	Check(Meter, "F2: Count groups thousands and CountShort walks the K/M ladder", () => {
		assert.equal(Count(47300), "47,300");
		assert.equal(Count(null), "-");
		assert.equal(CountShort(47300), "47.3K");
		assert.equal(CountShort(999), "1.00K");
		assert.equal(CountShort(12000000), "12.0M");
		assert.equal(CountShort(null), "-");
	});

	// F3: the percentage and signed-line formatters.
	Check(Meter, "F3: Rate renders two-decimal percent and Lines signs the delta", () => {
		assert.equal(Rate(0.8035), "80.35%");
		assert.equal(Rate(0), "0.00%");
		assert.equal(Rate(null), "-");
		assert.equal(Lines(12), "+12");
		assert.equal(Lines(-3), "-3");
		assert.equal(Lines(null), "");
	});

	// F4: the square-root bar scale, including the harness guard for a
	// non-positive scale (a full track) and a non-positive total (empty).
	Check(Meter, "F4: Share scales by the square root and guards the scale", () => {
		assert.equal(Share(25, 100), 0.5);
		assert.equal(Share(100, 100), 1);
		assert.equal(Share(0, 100), 0);
		assert.equal(Share(50, 0), 1);
	});

	// F5: the empty response folds to the empty snapshot and the summary
	// is carried verbatim - the same object, not a recomputed copy.
	Check(Meter, "F5: an empty calls list folds to the empty snapshot, summary verbatim", () => {
		const Marker: any = { calls: 7, currency: "EUR" };
		const Empty = Fold(Response([], Marker));
		assert.deepEqual(Empty.turns, []);
		assert.equal(Empty.steps, 0);
		assert.ok(Empty.summary === Marker);
	});

	// F6: one turn with two calls, handed to the fold out of step order to
	// prove the sort: the cost and token buckets sum, steps counts 2, and
	// the turn cache hit is the token-weighted rate over the summed
	// prompt tokens (read / (read + input + write)).
	Check(
		Meter,
		"F6: one turn with two calls sums the buckets and computes the token-weighted cache hit",
		() => {
			const First = Call({
				step: 1,
				tokens: Tokens(100, 600, 100, 50),
				cost: Money(0.25, 0.125, 0.0625, 0.0625),
			});
			const Second = Call({
				step: 2,
				tokens: Tokens(200, 300, 0, 50),
				cost: Money(0.75, 0.25, 0.25, 0.25),
			});
			const Folded = Fold(Response([Second, First]));
			assert.equal(Folded.turns.length, 1);
			const Turn = Folded.turns[0];
			assert.equal(Turn.turn, 1);
			assert.equal(Turn.steps.length, 2);
			assert.equal(Turn.steps[0].step, 1);
			assert.equal(Turn.steps[1].step, 2);
			assert.equal(Folded.steps, 2);
			assert.equal(Turn.cost.total, 1);
			assert.equal(Turn.cost.input, 0.375);
			assert.equal(Turn.cost.cacheRead, 0.3125);
			assert.equal(Turn.cost.output, 0.3125);
			assert.equal(Turn.cost.cacheWrite, 0);
			assert.equal(Turn.cost.other, 0);
			assert.equal(Turn.tokens.input, 300);
			assert.equal(Turn.tokens.cacheRead, 900);
			assert.equal(Turn.tokens.cacheWrite, 100);
			assert.equal(Turn.tokens.output, 100);
			assert.equal(Turn.tokens.total, 1400);
			assert.equal(Turn.cacheHit, 900 / 1300);
			assert.equal(Turn.steps[0].cacheHit, 0.75);
			assert.equal(Turn.steps[1].cacheHit, 0.6);
		},
	);

	// F7: the dominant provider and model follow the largest call total;
	// on a full tie (same money, same tokens) the earlier step keeps the
	// turn, because a later step must strictly exceed to take over.
	Check(
		Meter,
		"F7: the dominant provider and model follow the largest total cost; a full tie keeps the earlier step",
		() => {
			const Cheaper = Call({
				step: 1,
				provider: "deepseek",
				model: "model-a",
				tokens: Tokens(100, 600, 100, 50),
				cost: Money(0.25, 0, 0, 0),
			});
			const Pricier = Call({
				step: 2,
				provider: "another",
				model: "model-b",
				tokens: Tokens(200, 100, 0, 50),
				cost: Money(1, 0, 0, 0),
			});
			const Dominated = Fold(Response([Cheaper, Pricier]));
			assert.equal(Dominated.turns[0].provider, "another");
			assert.equal(Dominated.turns[0].model, "model-b");
			const TieFirst = Call({
				step: 1,
				model: "model-a",
				tokens: Tokens(100, 600, 100, 50),
				cost: Money(0.5, 0, 0, 0),
			});
			const TieSecond = Call({
				step: 2,
				model: "model-b",
				tokens: Tokens(100, 600, 100, 50),
				cost: Money(0.5, 0, 0, 0),
			});
			const Tied = Fold(Response([TieSecond, TieFirst]));
			assert.equal(Tied.turns[0].model, "model-a");
		},
	);

	// F8: the unpriced, error and retry counters, and the mixed-currency
	// marker; the control turn carries one currency only.
	Check(
		Meter,
		"F8: unpriced calls, errors and retries are counted and different currencies flag the turn mixed",
		() => {
			const Failed = Call({
				step: 1,
				priced: false,
				attempts: 3,
				error: "rate_limit",
				currency: "USD",
			});
			const Euro = Call({ step: 2, currency: "EUR" });
			const Mixed = Fold(Response([Failed, Euro]));
			assert.equal(Mixed.turns[0].unpriced, 1);
			assert.equal(Mixed.turns[0].errors, 1);
			assert.equal(Mixed.turns[0].retries, 2);
			assert.equal(Mixed.turns[0].mixed, true);
			assert.equal(Mixed.turns[0].currency, "USD");
			const United = Fold(Response([Call({ turn: 2, step: 1 }), Call({ turn: 2, step: 2 })]));
			assert.equal(United.turns[0].mixed, false);
			assert.equal(United.turns[0].currency, "USD");
		},
	);

	// F9: the file tally keys by path, sums across steps, and sorts by
	// total descending then path ascending; the tool tally counts only the
	// touched files that carry a tool, and a count tie sorts by name
	// ascending; the allocation-only file renders money but stage null and
	// feeds no tool count.
	Check(
		Meter,
		"F9: the file tally keys by path and sorts by total then path; the tool tally counts touched files only",
		() => {
			const Editor = Call({
				step: 1,
				files: [
					Touch("/src/a.ts", {
						direct: 0.25,
						amortized: 0.125,
						total: 0.375,
						linesDelta: 10,
						touched: true,
						tool: "edit",
						stage: "write",
					}),
					Touch("/src/b.ts", {
						direct: 0.5,
						amortized: 0.375,
						total: 0.875,
						linesDelta: -3,
						touched: true,
						tool: "write",
						stage: "edit",
					}),
					Touch("/src/c.ts", {
						direct: 0.125,
						total: 0.125,
						touched: false,
						tool: "read",
					}),
				],
			});
			const Reader = Call({
				step: 2,
				files: [
					Touch("/src/a.ts", {
						direct: 0.125,
						total: 0.125,
						linesDelta: 5,
						touched: true,
						tool: "edit",
						stage: "read",
					}),
					Touch("/src/d.ts", {
						direct: 0.5,
						total: 0.5,
						touched: true,
						tool: "write",
						stage: "write",
					}),
				],
			});
			const Folded = Fold(Response([Editor, Reader]));
			const Turn = Folded.turns[0];
			assert.deepEqual(
				Turn.files.map((Entry) => Entry.key),
				["/src/b.ts", "/src/a.ts", "/src/d.ts", "/src/c.ts"],
			);
			assert.equal(Turn.files[0].total, 0.875);
			assert.equal(Turn.files[0].lines, -3);
			assert.equal(Turn.files[1].count, 2);
			assert.equal(Turn.files[1].direct, 0.375);
			assert.equal(Turn.files[1].amortized, 0.125);
			assert.equal(Turn.files[1].total, 0.5);
			assert.equal(Turn.files[1].lines, 15);
			assert.equal(Turn.files[1].stage, "write");
			assert.equal(Turn.files[2].total, 0.5);
			assert.equal(Turn.files[2].lines, 0);
			assert.equal(Turn.files[3].stage, null);
			assert.deepEqual(
				Turn.tools.map((Entry) => Entry.key),
				["edit", "write"],
			);
			assert.equal(Turn.tools[0].count, 2);
			assert.equal(Turn.tools[1].count, 2);
			assert.equal(Turn.tools[0].total, 0);
		},
	);

	// F10: the fold is total - a blank envelope, a null calls list, a
	// calls array of non-objects, and a call missing every optional field
	// all fold without throwing to turns [] or one well-formed turn with
	// zeroed buckets, a null cache hit and empty tallies.
	Check(Meter, "F10: a malformed response never throws and folds to a well-formed snapshot", () => {
		const Blank = Fold({} as any);
		const Broken = Fold({ calls: null } as any);
		const Sparse = Fold(Response([{ turn: 1, step: 1, seq: 1 }]));
		assert.doesNotThrow(() => Fold({ calls: [null, 7, undefined] } as any));
		assert.deepEqual(Blank.turns, []);
		assert.equal(Blank.steps, 0);
		assert.equal(Blank.summary.calls, 0);
		assert.equal(Blank.summary.currency, "USD");
		assert.deepEqual(Broken.turns, []);
		assert.equal(Broken.steps, 0);
		assert.equal(Sparse.turns.length, 1);
		const Turn = Sparse.turns[0];
		assert.equal(Turn.steps.length, 1);
		assert.equal(Turn.cost.total, 0);
		assert.equal(Turn.tokens.total, 0);
		assert.equal(Turn.cacheHit, null);
		assert.equal(Turn.steps[0].cacheHit, null);
		assert.equal(Turn.model, "");
		assert.equal(Turn.currency, "");
		assert.equal(Turn.mixed, false);
		assert.deepEqual(Turn.files, []);
		assert.deepEqual(Turn.tools, []);
	});

	return Finish(Meter, "Fold-And-Format");
};

// Standalone entry: `node Target/Test/Fold-And-Format/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = runTest();
	console.log(`${Pass} PASS - Fold-And-Format`);
}
