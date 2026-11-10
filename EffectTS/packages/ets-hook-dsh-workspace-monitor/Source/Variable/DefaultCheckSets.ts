/**
 * @module DefaultCheckSets
 *
 * The shipped check-set classification catalog (DATA, not code; the
 * live-containers DefaultCheckSets precedent, monitor role).
 *
 * @remarks
 * The same shape the `checksets` config cell holds: dict name -> spec. The
 * catalog is the default value of the `checksets` dict, so classification
 * works out of the box:
 *
 *   tsc        -> double star then *.ts       tsc --noEmit <path>          (fast)
 *   format     -> double star then *.ts       npx prettier --check <path>  (fast)
 *   cargo      -> double star then Cargo.toml  cargo check                (slow)
 *   governance -> double star then package.json  linked (no re-run)
 *
 * THE ROLE SPLIT (the family's ownership law): the workspace-monitor hook
 * CLASSIFIES and RECORDES - the `command` templates are recorded for the
 * accountability trail and are NEVER executed here; the check execution
 * stays with the live-containers monitor (its G2 wrapper is the one
 * execution path, "one wrapper, two callers" would be violated otherwise).
 */
import type CheckSet from "@Interface/CheckSet.js";

/**
 * The shipped check-set classification catalog keyed by set name.
 */
const DEFAULT_CHECK_SETS: Record<string, CheckSet> = {
	tsc: { glob: "**/*.ts", command: "tsc --noEmit {{path}}", fast: true },
	format: {
		glob: "**/*.ts",
		command: "npx prettier --check {{path}}",
		fast: true,
	},
	cargo: {
		glob: "**/Cargo.toml",
		command: "cargo check",
		fast: false,
		intervalMs: 0,
	},
	governance: { glob: "**/package.json", fast: false },
};

export default DEFAULT_CHECK_SETS;
