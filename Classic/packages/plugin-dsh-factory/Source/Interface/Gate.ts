// Gate — the PASS DECISION the g1 gate set returns (Function/Gate). The gate
// itself logs NOTHING: the caller (the module's fs/observed listener) composes
// its own ledger lines for the outcomes it cares about — traditionally at
// least the `excluded` one (`skipped (excluded) <path>`), which is a MODULE
// string and stays in the module.
//
// The reasons enumerate the g1 gate order exactly:
//   target     — the observation target is missing or has no string displayPath;
//   govern     — the actor carries a `govern` field (the raw-write's WRAPPED
//                actor): its write's governance is the DIRECT path's business
//                only, so the event path skips it silently;
//   actor      — the mutating actor is absent or its tool name is not in the
//                module's mutation-tool list (reads emit too — the gate is
//                required);
//   kind       — observation.kind is not "present" (absent probes: nothing to
//                govern);
//   idempotent — Stash already holds this exact version token for the target
//                key (our own re-emit / re-read within the async window);
//   basename   — the file is not the module's manifest basename
//                ("package.json" / "Cargo.toml" — the MODULE gate);
//   excluded   — the display path contains an excluded segment (exclusion-
//                first: internals are never governed).
// `path` carries the display path whenever one was readable.
export default interface Gate {
	/** Whether the observation passes every g1 gate and may proceed to g2. */
	pass: boolean;
	/** Why the gate failed — absent when `pass` is true. */
	reason?: "target" | "govern" | "actor" | "kind" | "idempotent" | "basename" | "excluded";
	/** The display path, when one was readable. */
	path?: string;
}
