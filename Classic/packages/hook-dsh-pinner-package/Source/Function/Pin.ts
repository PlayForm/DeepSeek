// Pin — the pure transform (P): strip ONE leading range prefix from every
// version the config's dependency sections declare, unless the keep-list
// protects the package. Deterministic and idempotent: an already-pinned
// manifest maps to null (no change), so P(P(c)) = P(c) and re-observing a
// pinned file is a no-op rewrite. Pure internal calculation — part of the
// standing exemptions.
//
// THE RANGE LAW, exactly one decision per value (after the keep-list gate):
//   1. NON-STRING value (a map/array entry that is not a version string):
//      untouched — the pinner only rewrites version strings.
//   2. FIRST CHARACTER not one of `^`, `~`, `=`: untouched. This single rule
//      excludes, by construction, every form the pinner must never touch:
//        - already-STATIC versions ("0.3.4", "1.2.3-rc.1") — the transform is
//          idempotent because a static version has no leading prefix;
//        - wildcards ("*", "" ) — no prefix, no strip;
//        - PROTOCOL dependencies ("workspace:*", "file:…", "link:…",
//          "git+…", "npm:alias") — none of them begins with `^`/`~`/`=`;
//        - comparison ranges (">=1.0.0", ">1 <2") — no prefix in the set.
//   3. WHITESPACE anywhere in the value: untouched — a compound/space range
//      ("^1.0.0 || 2.0.0") is not a single static version and collapsing it
//      would change meaning, not just notation.
//   4. Otherwise: strip the ONE leading prefix character.
//
// Documented edge decision (wildcards with a prefix): `"^1.*"` IS stripped —
// the prefix law applies to the notation before the content, so `"^1.*"` →
// `"1.*"`. The static-version rule targets the common caret/tilde/exact case;
// the pinner strips the prefix and leaves the rest untouched, never
// inventing content. A deployment that wants wildcards protected adds the
// package to the pin-policy keep-list.
import Section from "@Variable/Section.js";
import type Manifest from "@Interface/Manifest.js";

export default (
	Current: Manifest,
	Sections: string[] = Section,
	Keep: string[] = [],
): { Next: Manifest; Pinned: number } | null => {
	const Next: Manifest = { ...Current };
	let Pinned = 0;
	for (const Name of Sections) {
		const Group = Next[Name];
		switch (true) {
			case !Group || typeof Group !== "object" || Array.isArray(Group):
				continue;
		}
		const Rewritten = { ...(Group as Record<string, unknown>) };
		let Touched = false;
		let Delta = 0;
		for (const [Key, Value] of Object.entries(Rewritten)) {
			// The pin-policy keeps this range exactly as authored.
			switch (true) {
				case Keep.includes(Key):
					continue;
			}
			// Rule 1 — NON-STRING value: untouched; the pinner only rewrites
			// version strings. (switch(true) case chains do not narrow `unknown`
			// across cases, so the guarded cast below is the narrowing point.)
			switch (true) {
				case typeof Value !== "string":
					continue;
			}
			const Range = Value as string;
			// Rule 2 — FIRST CHARACTER not one of `^`, `~`, `=`: untouched.
			// Rule 3 — WHITESPACE anywhere: untouched (a compound/space range).
			switch (true) {
				case Range[0] !== "^" && Range[0] !== "~" && Range[0] !== "=":
					continue;
				case /\s/.test(Range):
					continue;
			}
			// Rule 4 — strip the ONE leading range prefix.
			Rewritten[Key] = Range.slice(1);
			Touched = true;
			Delta++;
		}
		switch (true) {
			case Touched:
				Next[Name] = Rewritten;
				Pinned += Delta;
				break;
		}
	}
	switch (true) {
		case Pinned > 0:
			return { Next, Pinned };
		default:
			return null;
	}
};
