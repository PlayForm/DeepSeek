import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module (mirrors Source/Library.rs).
 *
 * @remarks
 *
 * Loader contract: `export const name` + `export const apply` + `export const
 * Config` + `export const inject` + `export default { name, apply, Config,
 * inject }` - the ONLY named exports in the tree (cordis requires them);
 * every other module is a nameless default export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the default
 * object, or service accessors throw `cannot get property "..." without
 * inject` (live-verified 2026-10-03).
 *
 * @playform/hook-dsh-edit-suggester - the modification-intent COMPANION
 * SUGGESTER, the second consumer of the search-suggester's pattern algebra
 * and the two-consumer extraction trigger (SEARCH-SUGGESTER-PLUGIN.md section
 * 8.1). The evidence: the edit is where the discovery happens - the model
 * edited its way to the target sets it never thought to open (section 1.4).
 * The plugin folds every `tool/call` event into the session's touch history
 * through a `ctx.sessionProjections` unit and hooks the tools/post-execute
 * waterfall for the modification tools (write, edit, raw-write) to prepend
 * ONE labeled additionalContexts note naming the files the session touched
 * right after this one in this workspace - the companions the task most
 * likely needs next (the root manifest, the CHANGELOG section, the Config
 * table row, the byte-exact test, the site mirror). A repo/user pack is an
 * EXPLICIT override only; the literal built-in pack is never a candidate
 * source. Deterministic path rules, no LLM in the hot path, a hard gate, a
 * cooldown, a dedupe, a per-turn cap, and an abstention line for every
 * silence. The note never claims the Transform: it names the companions;
 * deciding the change is the model's.
 *
 * FULLY CONTRACT-AWARE: the history fold is a session-projection unit (the
 * registry drives `session/event`), one tools/post-execute waterfall listener
 * (next() always awaited FIRST; pass-through returns the downstream decision
 * unchanged; fail-open try/catch never throws into the waterfall), plus the
 * agent/pre-step reset, and a validated Schemastery schema (Variable/Config)
 * whose defaults Cordis fills at load. The factory's shared machinery is
 * consumed for what applies (State builder + ledger + cell unwrap); the
 * fs/observed Wire and the storage Journal do not (a NON-MANIFEST module).
 */
export declare const name = "hook-dsh-edit-suggester";
/**
 * Loader contract (cordis): the exported schema is validated and defaulted
 * while the plugin loads; apply receives a plain validated config object.
 */
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
}>>, "plain"> | import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
}>>, "plain">;
/**
 * The compiled package version (Source/Variable/Version, built in by the
 * ESBuild define) - NOT a loader key: the contract's four names (name, apply,
 * Config, inject) are unchanged, and the default object below stays exactly
 * { name, apply, Config, inject }.
 */
export { Version };
/**
 * Required services (skill: declare, never rely on load order). The factory
 * (@playform/plugin-dsh-factory) provides the State builder (cell unwrap +
 * shared fields) and the ledger. Nothing else: the edit vocabulary of tool
 * traffic arrives through the tools/post-execute waterfall, not an import.
 */
export declare const inject: string[];
export declare const apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
declare const _default: {
    name: string;
    apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, "plain"> | import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
