// Policy — the shape of an `update-policy.json` for the CARGO FLAVOR (data,
// not code). Resolved by Function/Resolve and materialized by Function/Update/
// Policy: the configured file when given and readable, else the BUILT-IN
// DEFAULT (no rejects, all dep tables, target latest, NO verifyCommand — never
// install implicitly). Every field is optional in the file form; the consumer
// coalesces with `??` exactly as in the parent governor.
//
// THE CLI MAPPING (cargo-edit 0.13.13, verified live 2026-10-03) — each field
// → the cargo upgrade flag it drives, or the documented gap:
//
//   reject       → --exclude <crate>   (ONE flag per crate — the comma form
//                                  is silently IGNORED by cargo upgrade; the
//                                  chain deps are always merged into this list)
//   allow        → -p <crate>          (repeatable; only these crates upgrade)
//   incompatible → --incompatible <allow|ignore>   (the -i long form)
//   pinned       → --pinned <allow|ignore>
//   compatible   → --compatible <allow|ignore>
//   pinStyle     → NO CLI equivalent — cargo-edit 0.13.13 has NO --exact flag
//                  (verified: `cargo upgrade --exact` → "unexpected argument").
//                  Exact pins are enforced at the MANIFEST level by the chain
//                  pass: pinStyle "exact" canonicalizes governed deps to
//                  `=<resolved>` instead of the bare caret form.
//   depGroups    → NO equivalent — cargo upgrade rewrites every dependency
//                  table in the manifest; the field is accepted and ignored.
//   targets      → NO equivalent — cargo upgrade has no per-package target
//                  selector (only --rust-version); accepted and ignored.
//   concurrency  → NO equivalent (no registry-lookup knob); accepted and
//                  ignored.
//   verifyCommand→ run after the upgrade through ctx.subprocess
//                  (/bin/sh -c <command>), exit 127 non-fatal.
export default interface Policy {
	/** Crates cargo upgrade must never bump (one --exclude flag per crate). */
	reject?: string[];
	/** Crates that gate every other update (one -p flag per crate; empty = all). */
	allow?: string[];
	/** Upgrade to latest INCOMPATIBLE versions: "allow" | "ignore". */
	incompatible?: "allow" | "ignore";
	/** Upgrade PINNED requirements to latest incompatible: "allow" | "ignore". */
	pinned?: "allow" | "ignore";
	/** Upgrade to latest COMPATIBLE versions: "allow" | "ignore". */
	compatible?: "allow" | "ignore";
	/** Chain-pass canonical form: "caret" (bare resolved string — Cargo's
	 *  implicit caret, the default) or "exact" (`=resolved`). No CLI mapping. */
	pinStyle?: "caret" | "exact";
	/** Dependency groups — accepted for policy-file compatibility with the
	 *  package.json governor; cargo upgrade rewrites every dep table. Ignored. */
	depGroups?: string[];
	/** Target selection — no cargo-edit equivalent; accepted and ignored. */
	targets?: {
		default?: string;
		overrides?: Array<{ filter: string; target: string }>;
	};
	/** Concurrent registry lookups — no cargo-edit equivalent; ignored. */
	concurrency?: number;
	/** Shell command run after the upgrade; a non-zero exit fails the stage. */
	verifyCommand?: string | null;
}
