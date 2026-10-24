// Merge - the pack merge rules (D2, documented in SCHEME.md):
//
//   * families merge BY ID (the domain-qualified key): the override's
//     DECLARED scalar fields replace the base family's; its signals array
//     replaces; its targets merge BY PATH (a same-path target replaces the
//     base target in place, a new path appends in override order);
//   * every other section (signature, indexer, policy, learning, slug,
//     extends) follows scalars-replace, arrays-replace; a nested section
//     object merges key by key with the same rule.
//
// The layers are merged RAW (before Normalize): an absent field is not a
// default, so it never overwrites the base. Normalize runs once, on the
// merged result, and fills the schema defaults there.
//
// The override is the LATER layer: the extends chain is the base, then the
// user layer, then the repo layer.
import type Family from "../Interface/Family.js";
import type Pack from "../Interface/Pack.js";
import type Target from "../Interface/Target.js";

/** Merge two target lists by path. */
const MergeTargets = (Base: Target[], Override: Target[]): Target[] => {
	const Result = Base.map((Target) => ({ ...Target }));
	for (const Target of Override) {
		const Index = Result.findIndex((Entry) => Entry.path === Target.path);
		if (Index === -1) {
			Result.push({ ...Target });
		} else {
			Result[Index] = { ...Target };
		}
	}
	return Result;
};

/** Merge two family maps by the domain-qualified key. */
const MergeFamilies = (
	Base: Record<string, Family> | undefined,
	Override: Record<string, Family> | undefined,
): Record<string, Family> | undefined => {
	if (Base === undefined) {
		return Override;
	}
	if (Override === undefined) {
		return Base;
	}
	const Result: Record<string, Family> = {};
	for (const [Key, Family] of Object.entries(Base)) {
		Result[Key] = { ...Family };
	}
	for (const [Key, Family] of Object.entries(Override)) {
		const Existing = Result[Key];
		if (Existing === undefined) {
			Result[Key] = { ...Family };
			continue;
		}
		const Merged: Family = { ...Existing, ...Family };
		if (Existing.targets !== undefined || Family.targets !== undefined) {
			Merged.targets = MergeTargets(Existing.targets ?? [], Family.targets ?? []);
		}
		Result[Key] = Merged;
	}
	return Result;
};

/** Merge one section object: arrays replace, scalars replace, objects recurse. */
const MergeSection = (Base: unknown, Override: unknown): unknown => {
	if (Array.isArray(Override)) {
		return Override;
	}
	const Left = Base !== null && typeof Base === "object" && !Array.isArray(Base);
	const Right = Override !== null && typeof Override === "object" && !Array.isArray(Override);
	if (Left && Right) {
		const Result: Record<string, unknown> = {
			...(Base as Record<string, unknown>),
		};
		for (const [Key, Value] of Object.entries(Override as Record<string, unknown>)) {
			Result[Key] = Key in Result ? MergeSection(Result[Key], Value) : Value;
		}
		return Result;
	}
	return Override;
};

export default (Base: Pack, Override: Pack): Pack => {
	const Result: Pack = { ...Base, ...Override };
	if (Base.families !== undefined || Override.families !== undefined) {
		const Merged = MergeFamilies(Base.families, Override.families);
		if (Merged === undefined) {
			delete Result.families;
		} else {
			Result.families = Merged;
		}
	}
	for (const Section of ["indexer", "policy", "learning"] as const) {
		const Left = Base[Section];
		const Right = Override[Section];
		if (Left !== undefined && Right !== undefined) {
			(Result as Record<string, unknown>)[Section] = MergeSection(Left, Right);
		}
	}
	return Result;
};
