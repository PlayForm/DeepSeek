import type Configuration from "@Interface/Configuration.js";

/**
 * @module Knobs
 *
 * The resolved-knob reader: one raw config in, the effective values out.
 *
 * @remarks
 *
 * WHY THIS FILE EXISTS AT ALL when the loader already validates the schema: the
 * service is also constructed bare by the smokes (`new SkillLearnService(ctx)`), and a
 * bare construction never passes through Schemastery. Without this reader a fixture
 * would run on `undefined` knobs and a review would divide by a missing interval. So
 * the defaults of plan section 9 are applied here, in one table, and they are the same
 * values the schema declares in `Variable/Configuration.ts` - one of the two is a
 * duplicate by construction, and the alternative (reading the schema at runtime) would
 * make every knob a deferred lookup that a hot edit could change mid-run.
 *
 * THE VOLATILE CELLS ARE HONOURED: every schema cell is `.volatile()`, which means the
 * loader may hand this reader a cell object rather than a value (`{ get }`), so each
 * field is unwrapped before it is read. A cell that is not unwrapped resolves to a
 * function and silently falls back to the default, which is the failure mode this
 * helper exists to prevent.
 *
 * THE NUMERIC BOUNDS MIRROR THE SCHEMA, AND THEY CLAMP RATHER THAN THROW. The schema's
 * `.min(1)` and `.max(8)` are the loader's refusal; a bare construction bypasses that
 * refusal, so the same bounds are applied here. Clamping is the deliberate choice for
 * the one bound that has a semantic consequence: `maxOperations` "defaults to 8 and may
 * only be lowered", because the prompt states "at most eight objects" byte-stably (plan
 * section 5), so a higher configured value would make the shipped text wrong and is
 * lowered to the text instead. The day thresholds clamp at 1 for the reason plan
 * section 7.1 gives: a cutoff at or past now would transition the whole corpus on one
 * bad config.
 */
/**
 * Unwrap one possibly-volatile config cell (`{ get }` reference or plain value).
 */
const Cell = (Value: unknown): unknown => {
	const Candidate = Value as { get?: unknown } | null | undefined;
	return typeof Candidate?.get === "function"
		? (Candidate as { get: () => unknown }).get()
		: Value;
};

/**
 * A string knob, or its default; an empty string is a real value here (no route override).
 */
const Text = (Value: unknown, Fallback: string): string =>
	typeof Value === "string" ? Value : Fallback;

/**
 * A boolean knob, or its default.
 */
const Flag = (Value: unknown, Fallback: boolean): boolean =>
	typeof Value === "boolean" ? Value : Fallback;

/**
 * A numeric knob inside its schema bounds, or its default when it is not a finite number.
 */
const Count = (Value: unknown, Fallback: number, Low: number, High: number): number => {
	const Numeric = typeof Value === "number" ? Value : globalThis.Number(Value);
	switch (true) {
		case !globalThis.Number.isFinite(Numeric):
			return Fallback;
		default:
			return Math.min(Math.max(Numeric, Low), High);
	}
};

export default (Raw: unknown): Configuration => {
	const Source = (Raw ?? {}) as Record<string, unknown>;
	const Policy = Cell(Source["policy"]);
	return {
		enabled: Flag(Cell(Source["enabled"]), false),
		logFile: Text(Cell(Source["logFile"]), "~/.dsh/playform/plugin-dsh-skill-learn.log"),
		domain: Text(Cell(Source["domain"]), "skillLearn"),
		storagePath: Text(Cell(Source["storagePath"]), "~/.dsh/skill-learn/usage.json"),
		statePath: Text(Cell(Source["statePath"]), "~/.dsh/skill-learn/state.json"),
		ledgerPath: Text(Cell(Source["ledgerPath"]), "~/.dsh/skill-learn/ledger.jsonl"),
		blobRoot: Text(Cell(Source["blobRoot"]), "~/.dsh/skill-learn/blobs"),
		snapshotRoot: Text(Cell(Source["snapshotRoot"]), "~/.dsh/skill-learn/snapshots"),
		reportsRoot: Text(Cell(Source["reportsRoot"]), "~/.dsh/skill-learn/reports"),
		snapshotKeep: Count(Cell(Source["snapshotKeep"]), 5, 1, globalThis.Number.MAX_SAFE_INTEGER),
		skillsRoot: Text(Cell(Source["skillsRoot"]), "~/.dsh/skills"),
		archiveRoot: Text(Cell(Source["archiveRoot"]), "~/.dsh/skills/.archive"),
		agreementPath: Text(Cell(Source["agreementPath"]), "~/.dsh/AGENTS.md"),
		intervalIterations: Count(
			Cell(Source["intervalIterations"]),
			15,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		// The prompt says "at most eight objects", so eight is also the ceiling here.
		maxOperations: Count(Cell(Source["maxOperations"]), 8, 1, 8),
		maxOperationsPerRun: Count(
			Cell(Source["maxOperationsPerRun"]),
			4,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		maxWritesPerSession: Count(
			Cell(Source["maxWritesPerSession"]),
			6,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		digestTail: Count(Cell(Source["digestTail"]), 24, 1, globalThis.Number.MAX_SAFE_INTEGER),
		digestUserChars: Count(
			Cell(Source["digestUserChars"]),
			300,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		digestAssistantChars: Count(
			Cell(Source["digestAssistantChars"]),
			200,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		maxInputChars: Count(
			Cell(Source["maxInputChars"]),
			120_000,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		maxTokens: Count(Cell(Source["maxTokens"]), 4000, 1, globalThis.Number.MAX_SAFE_INTEGER),
		maxSkillChars: Count(
			Cell(Source["maxSkillChars"]),
			100_000,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		staleAfterDays: Count(
			Cell(Source["staleAfterDays"]),
			14,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		archiveAfterDays: Count(
			Cell(Source["archiveAfterDays"]),
			30,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		curateIntervalHours: Count(
			Cell(Source["curateIntervalHours"]),
			168,
			1,
			globalThis.Number.MAX_SAFE_INTEGER,
		),
		consolidate: Flag(Cell(Source["consolidate"]), false),
		provider: Text(Cell(Source["provider"]), ""),
		model: Text(Cell(Source["model"]), ""),
		// THE POLICY BLOCK: a partial override merges over the shipped verdicts,
		// which is the rule the schema's nested object applies. `write: auto` is
		// this package's one divergence from the sibling - the review publishes
		// behind the fence rather than queueing for approval (plan section 9).
		policy: {
			read: "auto",
			index: "auto",
			record: "auto",
			suggest: "auto",
			write: "auto",
			commit: "approve",
			spawn: "approve",
			message: "auto",
			...(typeof Policy === "object" && Policy !== null
				? (Policy as Partial<Configuration["policy"]>)
				: {}),
		},
	};
};
