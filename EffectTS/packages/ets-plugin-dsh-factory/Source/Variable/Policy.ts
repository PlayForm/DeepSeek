import type Allowlist from "@Interface/Allowlist.js";

/**
 * @module Policy
 *
 * The D6 DEFAULTS of the shared policy block.
 *
 * @remarks
 *
 * A Variable: one constant built once at load. Every consumer's `policy` block is built by the
 * `Policy` helper (Function/Policy) from this object, so the defaults are stated ONCE here and
 * the schema, the smoke suites and `Decide`'s fallback all read the same truth.
 *
 * The default posture (the completion spec's D6): read-only work, indexing, recording, suggesting
 * and messaging run AUTOMATICALLY; writes, batch commits and spawns wait for APPROVAL. A pack's
 * `policy` section overrides these per action when a pack is resolved (the pack-to-policy
 * defaulting wiring is the next refinement; the type is already in
 * @playform/ets-lib-dsh-pack).
 */
export default {
	read: "auto",
	index: "auto",
	record: "auto",
	suggest: "auto",
	write: "approve",
	commit: "approve",
	spawn: "approve",
	message: "auto",
} as const satisfies Allowlist;
