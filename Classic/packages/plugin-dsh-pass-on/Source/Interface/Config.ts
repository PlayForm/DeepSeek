import type { Allowlist } from "@playform/plugin-dsh-factory";

import type KindSpec from "./KindSpec.js";

/**
 * @module Config
 *
 * The schema's runtime shape (Variable/Config.ts produces it).
 */
export default interface Config {
	/**
	 * The pass-on's on/off switch (the schema's `enabled`, default true;
	 * false journals `disabled (enabled=false)` and Prepare refuses at call
	 * time).
	 */
	enabled: boolean;

	/**
	 * Ledger enabled - write the durable journal (one log per module).
	 */
	log: boolean;

	/**
	 * The durable journal (one log per module).
	 */
	logFile: string;

	/**
	 * The workspace root the globs resolve against.
	 */
	root: string;

	/**
	 * Maximum targets in one proposal.
	 */
	maxTargets: number;

	/**
	 * Maximum bytes of one preview entry.
	 */
	maxPreviewBytes: number;

	/**
	 * Proposal lifetime in seconds.
	 */
	expiresSeconds: number;

	/**
	 * The kind table: kind name -> spec.
	 */
	kinds: Record<string, KindSpec>;

	/**
	 * The per-action allowlist (D6): the shared factory block. The pass-on is
	 * read-only - `read`/`suggest` are automatic; the write/commit/spawn
	 * verdicts stay the shipped `approve`. A resolved pack's `policy` section
	 * overrides it per action.
	 */
	policy: Allowlist;
}
