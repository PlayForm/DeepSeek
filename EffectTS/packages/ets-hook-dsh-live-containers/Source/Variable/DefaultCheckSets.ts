// DefaultCheckSets - the shipped check-set catalog (DATA, not code; the
// FILE-MONITOR design section 3.2). The same shape the `checksets` config
// cell holds: dict name -> spec. The catalog is the default value of the
// `checksets` dict, so the explicit enrollment path (live_monitor <path>)
// classifies out of the box:
//
//   tsc        -> **/*.ts        tsc --noEmit <path>          (fast)
//   format     -> **/*.ts        npx prettier --check <path>  (fast)
//   cargo      -> **/Cargo.toml  cargo check                  (slow)
//   governance -> **/package.json  linked (no re-run)
//
// The automatic enrollment is watchlist-gated and stays EMPTY by default
// (no scan, no watch-all); the catalog only supplies the classification the
// explicit path uses when no watchlist entry matches. A command is a
// TEMPLATE with the substitution tokens {{path}} (the absolute display
// path), {{basename}}, {{dir}} (the dirname) - template replace only, never
// eval. The `link: "governance"` set carries NO command: the band renders
// the linked form and the plugin never re-runs npm (the R3 3.2 rule: the
// the governor/pinner's own verbs are not duplicated).
import type { CheckSetSpec } from "@Interface/Events.js";

export const DEFAULT_CHECK_SETS: Record<string, CheckSetSpec> = {
	tsc: { glob: "**/*.ts", command: "tsc --noEmit {{path}}", fast: true },
	format: { glob: "**/*.ts", command: "npx prettier --check {{path}}", fast: true },
	cargo: { glob: "**/Cargo.toml", command: "cargo check", fast: false, intervalMs: 0 },
	governance: { glob: "**/package.json", link: "governance", fast: false },
};
