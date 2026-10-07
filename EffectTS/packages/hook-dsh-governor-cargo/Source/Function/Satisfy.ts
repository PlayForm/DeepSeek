// Satisfy — the chain pass (P) for Cargo.toml: canonicalize governed pins,
// keep public deps, and — the CARGO-FLAVOR DIRECTIVE — FULL-VERSION
// NORMALIZATION of every simple version value. THE CARGO CHAIN SEMANTICS:
// the canonical form is the BARE version string — `version = "0.1.0-rc.6"` —
// because a bare requirement IS Cargo's implicit caret (the Cargo equivalent
// of npm's ^); with the policy's pinStyle "exact" the canonical form is
// `=<resolved>` instead (cargo-edit 0.13.13 has no --exact flag — verified
// live — so exact pins are enforced at the manifest level by this pass, never
// by the CLI). The chain canonicalization ALWAYS emits the FULL resolved
// form: the registry's resolved values are padded through Function/Normalize
// before use, so the canonical output can never leave shorthand behind even
// if the registry itself carried a "1.0"-shaped entry. Only a plain string
// comparison is needed — no semver comparator to get wrong. Idempotent: an
// already-canonical manifest maps to null (no change) — P(P(c)) = P(c).
//
// Handled entry shapes (Cargo.toml semantics):
//   * string version            → governed/rewritten/normalized;
//   * table with version        → governed/rewritten/normalized (the version
//                                 inside the inline or sub-table entry);
//   * inherited (workspace=true)→ NEVER rewritten here (the version lives in
//                                 the workspace table, walked separately) and
//                                 NEVER strict-stripped (that would orphan
//                                 every member inheriting it — the documented
//                                 Cargo-specific decision);
//   * path/git entries          → not version-governed; skipped.
//
// [workspace.dependencies] entries are governed exactly like member entries —
// the shared table is where a manifest can define versions for members.
//
// THE NORMALIZATION RULE (precedence, in order):
//   1. CHAIN — a dep name in registry.effectiveLatest is canonicalized to the
//      full resolved form (chain wins over everything; the registry is the
//      user's own chain, and its canonical output is always full);
//   2. STRIP — with strict:true AND a registry present, an unknown dep is
//      STRIPPED (the whole `name = "…"` entry removed — the documented
//      Cargo-specific decision); never a default: strict defaults to false;
//   3. NORMALIZE — every other entry whose version is a simple form ("X",
//      "X.Y", "=X.Y", with optional prerelease/build suffixes) is padded to
//      X.Y.Z by Function/Normalize — UNLESS the name is in the keep-list
//      (Function/Keep): the keep-list policy wins over normalization and kept
//      packages stay byte-identical. Complex forms (">=", ">", "<", "~",
//      compound/space ranges) are left as-is by Normalize (null).
//   Without a registry there is no chain and no strip — normalization alone
//   runs (strict is part of the CHAIN pass).
//
// Pure internal calculation — one of the two standing exemptions.
import Normalize from "./Normalize.js";
import type Plan from "@Interface/Plan.js";
import type Manifest from "@Interface/Manifest.js";
import type Registry from "@Interface/Registry.js";

export default (
	Manifest: Manifest,
	Registry: Registry | null,
	Strict: boolean,
	PinStyle: string,
	Keep: string[],
): Plan | null => {
	const Form = (Resolved: string): string => {
		// The canonical output is ALWAYS the full resolved form: pad the
		// registry's value through Normalize before the pin style is applied.
		const Full = Normalize(Resolved) ?? Resolved;
		return PinStyle === "exact" ? `=${Full}` : Full;
	};
	const Plan_: Plan = { replacements: [], strips: [] };
	for (const Section of Manifest.sections) {
		for (const [Name, Entry] of Object.entries(Section.deps)) {
			// Normalize the entry to its version requirement, or null when the
			// entry carries none (inherited, path, git) — those are skipped.
			let Version: string | null = null;
			let Inherited = false;
			switch (true) {
				case typeof Entry === "string":
					Version = Entry as string;
					break;
				case !!Entry && typeof Entry === "object" && !Array.isArray(Entry): {
					const Table = Entry as Record<string, unknown>;
					switch (true) {
						case typeof Table["version"] === "string":
							Version = Table["version"] as string;
							break;
						case Table["workspace"] === true:
							Inherited = true;
							break;
					}
					break;
				}
			}
			switch (true) {
				case Version === null:
					continue; // inherited / path / git: nothing to govern here
				case Inherited:
					continue;
			}
			const Resolved = (Registry?.effectiveLatest ?? {})[Name];
			switch (true) {
				case Resolved !== undefined && Version !== Form(Resolved):
					// 1. CHAIN — out-of-chain / non-canonical pin corrected; the target
					//    is always the FULL resolved form.
					Plan_.replacements.push({
						section: Section.path,
						name: Name,
						from: Version as string,
						to: Form(Resolved),
					});
					break;
				case Resolved === undefined && Strict && Registry !== null:
					// 2. STRIP — unknown dep in an explicitly strict workspace (a
					//    registry is present): the whole entry is removed.
					Plan_.strips.push({ section: Section.path, name: Name });
					break;
				case Keep.includes(Name):
					// 3. KEEP-LIST — wins over normalization: the entry stays
					//    byte-identical (left for the update stage / the author).
					break;
				default: {
					// 3. NORMALIZE — every other simple version is padded to X.Y.Z.
					const Full = Normalize(Version as string);
					switch (true) {
						case !!Full && Full !== Version:
							Plan_.replacements.push({
								section: Section.path,
								name: Name,
								from: Version as string,
								to: Full,
							});
							break;
					}
				}
			}
		}
	}
	switch (true) {
		case Plan_.replacements.length > 0 || Plan_.strips.length > 0:
			return Plan_;
		default:
			return null;
	}
};
