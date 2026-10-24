// Normalize - fill a parsed pack's defaults and validate its shape, so the
// merge and the families projection can rely on a total structure. The
// defaults are the pack schema's documented ones:
//
//   family.id        - the key's last segment (`doc/Plan` -> `Plan`);
//   family.priority  - 99 (a pack without a priority sorts last);
//   family.threshold - 0.75;
//   family.note      - "" (the domains without a caveat);
//   family.familyGlobs - [];
//   target.kind      - "";
//   target.prior     - 0.6;
//   target.reason    - "";
//   signal.rule      - "rule";
//   signal.weight    - 1.
//
// A structurally invalid pack throws (a family must be a mapping, a signal a
// mapping with a string pattern, a target a mapping with a string path); the
// suggester's fail-open listener catches it, warns, and passes the call
// through unnoted.
import type Family from "../Interface/Family.js";
import type Pack from "../Interface/Pack.js";
import type Signal from "../Interface/Signal.js";
import type Target from "../Interface/Target.js";

/** A string field with a fallback. */
const Text = (Value: unknown, Fallback: string): string =>
	typeof Value === "string" ? Value : Fallback;

/** A finite number field with a fallback. */
const Count = (Value: unknown, Fallback: number): number =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : Fallback;

/** One signal row. */
const Row = (Value: unknown): Signal => {
	if (Value === null || typeof Value !== "object" || Array.isArray(Value)) {
		throw new Error("a pack signal must be a mapping");
	}
	const Raw = Value as Partial<Signal>;
	if (typeof Raw.pattern !== "string") {
		throw new Error("a pack signal needs a string pattern");
	}
	return {
		rule: Text(Raw.rule, "rule"),
		pattern: Raw.pattern,
		weight: Count(Raw.weight, 1),
		...(Array.isArray(Raw.tools) ? { tools: Raw.tools.map(String) } : {}),
	};
};

/** One target row. */
const Companion = (Value: unknown): Target => {
	if (Value === null || typeof Value !== "object" || Array.isArray(Value)) {
		throw new Error("a pack target must be a mapping");
	}
	const Raw = Value as Partial<Target>;
	if (typeof Raw.path !== "string" || Raw.path.length === 0) {
		throw new Error("a pack target needs a string path");
	}
	return {
		path: Raw.path,
		kind: Text(Raw.kind, ""),
		prior: Count(Raw.prior, 0.6),
		reason: Text(Raw.reason, ""),
		...(typeof Raw.digest === "string" ? { digest: Raw.digest } : {}),
	};
};

/** One family row. */
const Entry = (Key: string, Value: unknown): Family => {
	if (Value === null || typeof Value !== "object" || Array.isArray(Value)) {
		throw new Error(`pack family ${Key}: expected a mapping`);
	}
	const Raw = Value as Partial<Family>;
	if (Raw.signals !== undefined && !Array.isArray(Raw.signals)) {
		throw new Error(`pack family ${Key}: signals must be a sequence`);
	}
	if (Raw.targets !== undefined && !Array.isArray(Raw.targets)) {
		throw new Error(`pack family ${Key}: targets must be a sequence`);
	}
	const Segment = Key.includes("/") ? Key.slice(Key.lastIndexOf("/") + 1) : Key;
	return {
		id: Text(Raw.id, Segment),
		priority: Count(Raw.priority, 99),
		threshold: Count(Raw.threshold, 0.75),
		signals: (Raw.signals ?? []).map(Row),
		targets: (Raw.targets ?? []).map(Companion),
		note: Text(Raw.note, ""),
		familyGlobs: Array.isArray(Raw.familyGlobs) ? Raw.familyGlobs.map(String) : [],
	};
};

export default (Pack: Pack): Pack => {
	const Result: Pack = { ...Pack };
	// A scalar `signature:` is accepted; arrays replace the inherited list.
	const Signature = Result.signature as unknown;
	if (Signature !== undefined) {
		Result.signature = Array.isArray(Signature) ? Signature.map(String) : [String(Signature)];
	}
	// A scalar `extends:` is accepted; the chain normalizes it.
	const Extends = Result.extends as unknown;
	if (Extends !== undefined) {
		Result.extends = Array.isArray(Extends) ? Extends.map(String) : [String(Extends)];
	}
	if (Result.families !== undefined) {
		const Families: Record<string, Family> = {};
		for (const [Key, Value] of Object.entries(Result.families)) {
			Families[Key] = Entry(Key, Value);
		}
		Result.families = Families;
	}
	return Result;
};
