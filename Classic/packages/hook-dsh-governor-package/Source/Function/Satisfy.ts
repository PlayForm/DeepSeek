// Satisfy — the chain pass (P): canonicalize governed pins, keep public deps.
// The canonical target is ALWAYS "^<resolved>" (FLOW.md §2 "propagate":
// pin = ^resolved in every manifest that declares dep). Only a plain string
// comparison is needed — no semver comparator to get wrong. Idempotent: an
// already-canonical manifest maps to null (no change). Pure internal
// calculation — one of the two standing exemptions.
import Section from "@Variable/Section.js";
import type Registry from "@Interface/Registry.js";
import type Manifest from "@Interface/Manifest.js";

export default (
	Manifest: Manifest,
	Registry: Registry | null,
	Strict: boolean,
): Manifest | null => {
	const Amended = { ...Manifest };
	let Changed = false;
	for (const Name of Section) {
		const Group = Amended[Name];
		switch (true) {
			case !Group || typeof Group !== "object":
				continue;
		}
		const Next = { ...(Group as Record<string, unknown>) };
		let Touched = false;
		for (const [Key, Pin] of Object.entries(Next)) {
			switch (true) {
				case typeof Pin !== "string":
					continue;
			}
			const Resolved = (Registry?.effectiveLatest ?? {})[Key];
			switch (true) {
				case Resolved !== undefined && Pin !== `^${Resolved}`:
					Next[Key] = `^${Resolved}`; // out-of-chain / non-canonical pin corrected
					Touched = true;
					break;
				case Resolved === undefined && Strict:
					// unknown dep in an explicitly strict workspace: strip.
					// Never a default: strict defaults to false.
					delete Next[Key];
					Touched = true;
					break;
				// else: public dep — left for the update stage (ncu)
			}
		}
		switch (true) {
			case Touched:
				Amended[Name] = Next;
				break;
		}
		Changed = Changed || Touched;
	}
	switch (true) {
		case !!Changed:
			return Amended;
		default:
			return null;
	}
};
