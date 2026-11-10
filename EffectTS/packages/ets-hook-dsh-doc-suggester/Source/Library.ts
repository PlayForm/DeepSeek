/**
 * @module Library
 *
 * The entry module (mirrors Source/Library.rs) for
 * @playform/hook-dsh-doc-suggester, the doc-task companion suggester.
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
 * object, or service accessors throw `cannot get property "..." without
 * inject` (live-verified 2026-10-03).
 *
 * The plugin is the third consumer of the search-suggester's pattern algebra
 * (SEARCH-SUGGESTER-PLUGIN.md section 8: "the doc task -> the plans, guides,
 * site"). The history is a `ctx.sessionProjections` unit (key `docHistory`):
 * the registry folds every committed `tool/call` event into the session's
 * touch history, and the hook's tools/post-execute listener reads that cell
 * for the doc-task tools (read, grep, glob, write, edit, raw-write) to
 * prepend ONE labeled additionalContexts note naming the files the session
 * touched right after this one in this workspace - the companions the task
 * most likely needs next (the INDEX row, the frontmatter statuses/registry/
 * index block, the archive style, the cross-references, the site mirror). A
 * repo/user pack is an EXPLICIT override only; the literal built-in pack is
 * never a candidate source. Deterministic path rules, no LLM in the hot
 * path, a hard gate, a cooldown, a dedupe, a per-turn cap, and an abstention
 * line for every silence.
 *
 * FULLY CONTRACT-AWARE: one tools/post-execute waterfall listener that reads
 * the session's projection cell and emits the note (next() always awaited
 * FIRST; pass-through returns the downstream decision unchanged; fail-open
 * try/catch never throws into the waterfall), plus the agent/pre-step reset,
 * the optional projection registration, and a validated Schemastery schema
 * (Variable/Config) whose defaults Cordis fills at load. The factory's
 * shared machinery is consumed for what applies (State builder + ledger +
 * cell unwrap); the fs/observed Wire and the storage Journal do not (a
 * NON-MANIFEST module).
 */
import Apply from "./Function/Apply.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

export const name = "hook-dsh-doc-suggester";

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
 * + shared fields) and the ledger. Nothing else: the doc vocabulary of tool
 * traffic arrives through the tools/post-execute waterfall, not an import.
 */
export const inject = ["pluginFactory"];

export const apply = Apply;

export default { name, apply, Config, inject };
