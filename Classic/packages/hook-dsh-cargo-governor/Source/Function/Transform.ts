// Transform — the MODULE LEAF of the factory refactor: the entire content →
// next-content step of the cargo module, as a FACTORY TRANSFORM
// (Interface/Transform in the factory): `(current, section, keep) =>
// { next, count, message? } | null`. The factory's Continue hands off here
// with the raw file text (null when the read failed), the module's `Section`
// state field (inert for this module — see Interface/State) and the UNION
// KEEP-LIST it computed (Function/ResolvePolicy: the sidecars plus the P3
// chain keys — chain pins are ALWAYS protected).
//
// The pipeline (identical to the pre-refactor Continue/Satisfy/Pin sequence,
// the smoke suite is the arbiter):
//
//   1. Decode (smol-toml, identification ONLY) — null → the
//      "observed non-JSON/TOML Cargo.toml … — skipped" line, transform null
//      (the factory stays silent on every no-op path);
//   2. the update-policy path (Function/Resolve, first-wins — engine input)
//      is resolved QUIETLY here and recorded in the caller's passage cell,
//      so the post-continuation update stage (Function/Dispatch) reuses the
//      exact same path; only its pinStyle drives the chain pass (caret = the
//      bare resolved string — Cargo's implicit caret; exact = `=resolved`);
//   3. the KEEP-LIST: the factory's union (sidecars + P3 chain keys) PLUS
//      the module's own global `keepFile` source (config `keepFile` —
//      Transform/Keep, the absorbed pre-refactor Keep semantics);
//   4. Satisfy — the chain pass (P): 1. CHAIN (always the FULL resolved
//      form), 2. STRIP (strict, registry present), 3. NORMALIZE (the
//      full-version directive; the keep-list wins);
//   5. THE REFUSAL GUARD (Transform/Guard): any plan entry outside an
//      identified dependency table REFUSES the rewrite (logged, null
//      returned);
//   6. Pin — the SURGICAL LINE-LEVEL rewrite of the raw text: comments,
//      inline comments, blank lines and spacing survive byte-for-byte (the
//      internal calculation that makes comment preservation possible; never
//      a TOML stringify). A Pin refusal (an entry not locatable in the text —
//      never a partial rewrite) is logged and null is returned.
//
// On change the transform returns `{ next: <the rewritten TEXT>, count,
// message }` — next is a STRING, and the factory's Continue serializes a
// string next VERBATIM (the comment-preservation guarantee end-to-end). The
// success line (`governed <path> → <version>`) is supplied as a message
// FUNCTION of the write outcome's fresh version.
//
// Pure internal calculations (the standing exemptions): the smol-toml parse,
// the surgical line rewrite, Normalize's padding, and the auxiliary
// pin-policy.json read (plain fs, never the governed manifest).
import type PluginFactory from "@playform/plugin-dsh-factory";
import Decode from "./Decode.js";
import Pin from "./Pin.js";
import Resolve from "./Resolve.js";
import Satisfy from "./Satisfy.js";
import PolicyLoader from "./Update/Policy.js";
import KeepFile from "./Transform/Keep.js";
import Guard from "./Transform/Guard.js";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type Passage from "@Interface/Passage.js";
import type { FsVersion } from "@deepseek-ai/dsh-fs";

export default (
	Factory: PluginFactory,
	State: State,
	Path: string,
	Dir: string,
	Found: string | null,
	Registry: Registry | null,
	Passage: Passage,
): ((
	current: string | null,
	section: unknown,
	keep: string[],
) => {
	next: unknown;
	count: number;
	message?: string | ((outcome: { version: FsVersion }) => string) | undefined;
} | null) => {
	// The transform closure — one per observed event (the factory calls it
	// exactly once per continuation).
	return (Current, _Section, Keep) => {
		// 1. Decode — identification only (null on any failure; the caller's
		//    passage cell records the manifest for the update stage's Filter).
		const Manifest = Decode(Current);
		Passage.Manifest = Manifest;
		switch (true) {
			case !Manifest:
				Passage.Refused = true; // nothing to update-stage either — the manifest is unreadable
				Factory.Append(State, `observed non-JSON/TOML Cargo.toml ${Path} — skipped`);
				return null;
		}
		// 2. The update-policy path (quiet — the built-in-default diagnostics
		//    belong to the update job, Function/Run) + its pinStyle.
		const PolicyPath = Resolve(State, Dir, Found);
		Passage.Policy = PolicyPath;
		// 3. The keep-list: the factory's union plus THIS module's global
		//    keepFile source (Transform/Keep — the pre-refactor Keep semantics).
		// 4. The chain pass (P) — pure, idempotent: P(P(c)) = P(c).
		const Planned = Satisfy(
			Manifest as NonNullable<typeof Manifest>,
			Registry,
			State.Strict,
			PolicyLoader(Factory, State, PolicyPath, true).pinStyle ?? "caret",
			KeepFile(Factory, State, Keep),
		);
		// 5. The refusal guard: only identified dependency tables may differ
		//    (Transform/Guard — the intruding section, or none).
		switch (true) {
			case !!Planned: {
				const Intruder = Guard(Manifest as NonNullable<typeof Manifest>, Planned);
				switch (true) {
					case !!Intruder:
						Passage.Refused = true; // the pre-refactor flow skipped the update stage after a refusal
						Factory.Append(
							State,
							`REFUSED rewrite of ${Path}: non-dependency section "${Intruder}" would change`,
						);
						return null; // refusal guard — the update stage is skipped too
				}
				break;
			}
		}
		// No plan → no change: the designed no-op (the post-continuation update
		// stage still runs — normalization/keep decisions leave public deps for
		// cargo upgrade, exactly the pre-refactor flow).
		switch (true) {
			case !Planned:
				return null;
		}
		// 6. The surgical rewrite (comments/formatting preserved by
		//    construction) — aborted whole on any refusal.
		const Outcome = Pin(Current as string, Planned, Path);
		switch (true) {
			case !!Outcome.Refusal:
				Passage.Refused = true; // the pre-refactor flow skipped the update stage after a refusal
				Factory.Append(State, Outcome.Refusal as string);
				return null; // never a partial rewrite
			case !Outcome.Changed:
				return null; // nothing located changed — the designed no-op
		}
		// The change: next is the rewritten TEXT (a string — the factory's
		// Continue writes it verbatim; the string-next path is what preserves
		// the author's comments byte-for-byte end-to-end).
		return {
			next: Outcome.Text,
			count: Planned.replacements.length + Planned.strips.length,
			message: (OutcomeVersion: { version: FsVersion }) =>
				`governed ${Path} → ${OutcomeVersion.version}`,
		};
	};
};
