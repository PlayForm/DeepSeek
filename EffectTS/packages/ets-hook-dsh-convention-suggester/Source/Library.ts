/**
 * @module Library
 *
 * The entry module (mirrors Source/Library.rs) for
 * @playform/hook-dsh-convention-suggester, the convention-suggester hook.
 *
 * @remarks
 * Loader contract: `export const name` + `export const apply` +
 * `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }` - the ONLY named exports
 * in the tree (cordis requires them); every other module is a nameless
 * default export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the default
 * object, or service accessors throw `cannot get property ... without
 * inject` (live-verified 2026-10-03; a smoke that calls apply directly never
 * catches this).
 *
 * The candidates come from the agent's OWN PREVIOUS TOOL CALLS in this
 * workspace: the hook folds every `tool/call` event into the session's touch
 * history, and on every write/edit call it names the files that were touched
 * right after this one, so the model keeps the workspace's real working set
 * in view. An explicit repo/user pack (`.dsh/pack.yml` or the user layer) is
 * the override when the history is empty; the literal built-in pack is never
 * a candidate source. The entry stays wiring-only, one definition per file
 * with nameless default exports, the ledger strings are module-owned and
 * byte-stable with the four identity places agreeing. The arbiter is the
 * smoke suite that asserts the behavior. Deterministic fold (no LLM in the
 * hot path), a cooldown, a per-turn cap, and two abstention paths
 * (SEARCH-SUGGESTER-PLUGIN.md sections 3.4, 4, 8, 9.4 - the convention
 * consumer of the suggester family).
 *
 * READ-ONLY by design: the hook never edits, never rewrites arguments, and
 * never denies - its only surface is the additionalContexts notice. The
 * literal pack learner (D4) is retired; the config's `learning` field is
 * kept for compatibility until the history-driven proposal lands.
 *
 * FULLY CONTRACT-AWARE: every listener awaits next() FIRST and is fail-open
 * (never throws into a waterfall). The hook is a NON-MANIFEST module (no
 * fs/observed machinery) that consumes the factory for the State builder
 * (with the P10 volatile refresh) and the ledger. The per-agent state is
 * keyed on the Agent object (the tool-coach precedent); the durable record
 * is the ledger file (one log per module).
 */
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "convention-suggester";

/**
 * Loader contract (cordis): the exported schema is validated and defaulted
 * while the plugin loads; apply receives a plain validated config object.
 */
export const Config = Definition;

/**
 * The compiled package version (Source/Variable/Version, built in by the
 * ESBuild define) - NOT a loader key: the contract's four names (name, apply,
 * Config, inject) are unchanged, and the default object below stays exactly
 * { name, apply, Config, inject }.
 */
export { Version };

/**
 * Required services (skill: declare, never rely on load order). The factory
 * (@playform/ets-plugin-dsh-factory) provides the State builder (cell unwrap
 * + shared fields + the P10 volatile refresh) and the ledger. Nothing else.
 */
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
