import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

/**
 * @module Library
 *
 * The entry module of the BATCH-DECISION hook (@playform/hook-dsh-batch-decision).
 *
 * @remarks
 *
 * Loader contract: `export const name` + `export const apply` + `export const Config` +
 * `export const inject` + `export default { name, apply, Config, inject }` - the ONLY named
 * exports in the tree (cordis requires them); every other module is a nameless default export
 * composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }` SHADOWS the named
 * exports - inject and Config MUST also sit on the default object, or service accessors throw
 * `cannot get property ... without inject` (live-verified 2026-10-03; a smoke that calls apply
 * directly never catches this).
 *
 * @playform/hook-dsh-batch-decision - the thin workflow owner between the suggester, the
 * pass-on, the ingester and the live view (Documentation/Plans/PASS-ON-AND-INGESTER.md
 * section 5). It listens for batch/proposed, runs the decision gate (expiry first, then the
 * conservative auto-approve policy: the first batch of an intent class always requires the
 * user), records the BatchDecision, emits batch/decision for the ingester and the live view, and
 * exposes the batch_decision tool as the one entry point the user interacts with. It does NOT
 * implement the pass-on or the ingester and it NEVER writes files: the sibling service shapes
 * are declared structurally (Source/Interface/Siblings.ts) and resolved via `Context.get` at
 * use time - never injected. The workflow ledger is the module's own log file.
 *
 * THE LIVE DISABLED POSTURE: every listener, the batch_decision tool and every effect register
 * unconditionally on every mount; a disabled mount (`enabled: false`) logs the byte-exact
 * `disabled (enabled=false)` line instead of the activation proof, and every registered surface
 * reads the volatile `On` cell at CALL time, so a disabled surface passes through with zero
 * ledger lines and a flip acts on the very next call.
 */
export const name = "hook-dsh-batch-decision";

/**
 * Loader contract (cordis): the exported schema is validated and defaulted while the plugin
 * loads; apply receives a plain validated config object.
 */
export const Config = Definition;

/**
 * The compiled package version (Source/Variable/Version, built in by the ESBuild define) - NOT a
 * loader key: the contract's four names (name, apply, Config, inject) are unchanged, and the
 * default object below stays exactly `{ name, apply, Config, inject }`.
 */
export { Version };

/**
 * Required services.
 *
 * @remarks
 *
 * The factory (@playform/plugin-dsh-factory) provides the State builder (cell unwrap + the P10
 * volatile refresh) and the ledger. `tools` serves the batch_decision registration. The sibling
 * services (pass-on, ingester, approval) are deliberately NOT injected: they are optional, they
 * may not exist yet (the self-contained PoC posture), and they are resolved via `Context.get` at
 * use time (Source/Function/Handoff.ts, the tool-jobs precedent).
 */
export const inject = ["pluginFactory", "tools"];

export const apply = Apply;

export default { name, apply, Config, inject };
