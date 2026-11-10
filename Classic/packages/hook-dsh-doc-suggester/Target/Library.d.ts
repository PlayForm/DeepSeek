import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * Declares the entry module and the loader contract of the doc suggester.
 *
 * @remarks
 *
 * Mirrors `Source/Library.rs`. Loader contract: `export const name` + `export const apply`
 * + `export const Config` + `export const inject` + `export default { name, apply, Config,
 * inject }` - the ONLY named exports in the tree (cordis requires them); every other module
 * is a nameless default export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }` SHADOWS the
 * named exports - `inject` and `Config` MUST also sit on the default object, or service
 * accessors throw `cannot get property "..." without inject` (live-verified 2026-10-03).
 *
 * @playform/hook-dsh-doc-suggester - the doc-task COMPANION SUGGESTER, the third consumer
 * of the search-suggester's pattern algebra (SEARCH-SUGGESTER-PLUGIN.md section 8: "the doc
 * task -> the plans, guides, site"). The history is a `ctx.sessionProjections` unit (key
 * `docHistory`): the registry folds every committed `tool/call` event into the session's
 * touch history, and the hook's tools/post-execute listener reads that cell for the
 * doc-task tools (read, grep, glob, write, edit, raw-write) to prepend ONE labeled
 * additionalContexts note naming the files the session touched right after this one in this
 * workspace - the companions the task most likely needs next (the INDEX row, the frontmatter
 * statuses/registry/index block, the archive style, the cross-references, the site mirror).
 * A repo/user pack is an EXPLICIT override only; the literal built-in pack is never a
 * candidate source. Deterministic path rules, no LLM in the hot path, a hard gate, a
 * cooldown, a dedupe, a per-turn cap, and an abstention line for every silence.
 *
 * FULLY CONTRACT-AWARE: one tools/post-execute waterfall listener that reads the session's
 * projection cell and emits the note (`next()` always awaited FIRST; pass-through returns
 * the downstream decision unchanged; fail-open try/catch never throws into the waterfall),
 * plus the agent/pre-step reset, the optional projection registration, and a validated
 * Schemastery schema (`Variable/Config`) whose defaults Cordis fills at load. The factory's
 * shared machinery is consumed for what applies (State builder + ledger + cell unwrap); the
 * fs/observed Wire and the storage Journal do not (a NON-MANIFEST module).
 */
export declare const name = "hook-dsh-doc-suggester";
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
export { Version };
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
