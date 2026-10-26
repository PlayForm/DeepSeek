// Knobs - the service's validated configuration: the constructor's defaults,
// overridden by the loader's validated config (the class-form plugin receives
// it as the SECOND constructor argument - the graph service's precedent), with
// every volatile cell unwrapped and the numeric/name knobs fail-loud checked
// at load. A bad knob must throw AT LOAD, never at the first review: an
// interval of NaN silently disables the nudge, and a reversed
// stale/archive pair archives entries the moment they go stale.
//
// THE TWO POSTURES: `enabled` is TRUE in these defaults while the SCHEMA
// (Variable/Config) defaults it to FALSE. They are different by design - a
// BARE construction (`new LessonService(ctx)` - the smokes' fixture) is an
// inert-but-live service: Tick answers and Status reports, so every assertion
// is byte-exact; the LOADED plugin gets the schema's validated config (the
// loader always passes it), which is the documented idle-forever posture
// (disabled, the bundle patch row).
import type Configuration from "@Interface/Config.js";

/** The usage-domain name rule (the library's UNIT_NAME_RE). */
const UNIT = /^[a-z][a-z0-9_]*$/;

/** Unwrap one possibly-volatile config cell (`{ get }` reference or value). */
const Cell = (Value: unknown): unknown =>
	typeof (Value as { get?: unknown } | null)?.get === "function"
		? (Value as { get: () => unknown }).get()
		: Value;

/** A finite number, or the default (a NaN/Infinity knob is never a policy). */
const Number_ = (Value: unknown, Fallback: number): number => {
	const Numeric = typeof Value === "number" ? Value : globalThis.Number(Value);
	return globalThis.Number.isFinite(Numeric) ? Numeric : Fallback;
};

export default (Raw: unknown): Configuration => {
	const Defaults: Configuration = {
		enabled: true,
		logFile: "~/.dsh/playform/plugin-dsh-lesson-review.log",
		domain: "lesson",
		storagePath: "~/.dsh/lesson/usage.json",
		intervalTurns: 10,
		idleOnly: true,
		staleAfterDays: 14,
		archiveAfterDays: 30,
		neverUsedGraceDays: 14,
		digestTail: 24,
		maxInputChars: 120_000,
		maxProposals: 8,
		consolidate: false,
		promptFile: "",
		skillsRoot: "~/.dsh/skills",
		archiveRoot: "~/.dsh/skills/.archive",
		agreementPath: "~/.dsh/AGENTS.md",
		reportsRoot: "~/.dsh/lesson/reports",
		pendingPath: "~/.dsh/lesson/pending.jsonl",
		provider: "",
		model: "",
		maxTokens: 4000,
		// THE POLICY BLOCK (D6): the bare-construction default, mirrored from
		// the factory's shared block (Variable/Policy there). A LOADED plugin
		// always receives the schema-validated block through `Raw`, so this
		// literal only serves `new LessonService(ctx)` (the smokes' fixture).
		policy: {
			read: "auto",
			index: "auto",
			record: "auto",
			suggest: "auto",
			write: "approve",
			commit: "approve",
			spawn: "approve",
			message: "auto",
		},
	};
	const Source = (Raw ?? {}) as Record<string, unknown>;
	const Merged: Record<string, unknown> = { ...Defaults };
	for (const Key of Object.keys(Defaults)) {
		switch (true) {
			case Source[Key] === undefined:
				continue;
			case Key === "policy":
				// A partial policy override MERGES over the D6 defaults (the
				// same rule the schema's nested object applies); the other
				// knobs replace wholesale.
				Merged[Key] = {
					...Defaults.policy,
					...(Cell(Source[Key]) as Record<string, unknown>),
				};
				break;
			default:
				Merged[Key] = Cell(Source[Key]);
		}
	}
	// The numeric knobs: a non-finite value falls back to its default, then
	// the RELATIONAL checks below decide whether the combination is usable.
	for (const Key of [
		"intervalTurns",
		"staleAfterDays",
		"archiveAfterDays",
		"neverUsedGraceDays",
		"digestTail",
		"maxInputChars",
		"maxProposals",
		"maxTokens",
	] as const) {
		Merged[Key] = Number_(Merged[Key], Defaults[Key]);
	}
	switch (true) {
		case typeof Merged["domain"] !== "string" || !UNIT.test(Merged["domain"] as string):
			throw new Error(
				"lesson: domain must be a lowercase unit name matching /^[a-z][a-z0-9_]*$/",
			);
		case (Merged["intervalTurns"] as number) < 0:
			throw new Error("lesson: intervalTurns must be >= 0 (0 disables the nudge)");
		case (Merged["digestTail"] as number) < 2:
			throw new Error("lesson: digestTail must be >= 2 (a one-message digest is no digest)");
		case (Merged["maxProposals"] as number) < 1:
			throw new Error("lesson: maxProposals must be >= 1");
		case (Merged["maxInputChars"] as number) < 1000:
			throw new Error("lesson: maxInputChars must be >= 1000");
		case (Merged["staleAfterDays"] as number) <= 0:
			throw new Error("lesson: staleAfterDays must be > 0");
		case (Merged["archiveAfterDays"] as number) < (Merged["staleAfterDays"] as number):
			throw new Error("lesson: archiveAfterDays must be >= staleAfterDays");
		default:
			break;
	}
	return Merged as unknown as Configuration;
};
