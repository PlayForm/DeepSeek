// DefaultCheckSets - the shipped check-set classification catalog (DATA, not
// code; the live-containers DefaultCheckSets precedent, monitor role). The
// same shape the `checksets` config cell holds: dict name -> spec. The
// catalog is the default value of the `checksets` dict, so classification
// works out of the box:
//
//   tsc        -> **/*.ts        tsc --noEmit <path>          (fast)
//   format     -> **/*.ts        npx prettier --check <path>  (fast)
//   cargo      -> **/Cargo.toml  cargo check                  (slow)
//   governance -> **/package.json  linked (no re-run)
//
// THE ROLE SPLIT (the family's ownership law): the workspace-monitor hook
// CLASSIFIES and RECORDES - the `command` templates are recorded for the
// accountability trail and are NEVER executed here; the check execution
// stays with the live-containers monitor (its G2 wrapper is the one
// execution path, "one wrapper, two callers" would be violated otherwise).
import type CheckSet from "@Interface/CheckSet.js";

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
