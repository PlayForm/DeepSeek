import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module (mirrors Source/Library.rs).
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
 * `cannot get property "..." without inject` (live-verified 2026-10-03).
 *
 * @playform/hook-dsh-search-suggester - the search-intent TARGET SUGGESTER. The evidence
 * (Documentation/Plans/SEARCH-SUGGESTER-PLUGIN.md section 1): 46% of every tool call in the
 * measured sessions is a search-class call, and the model's discovery is late - in the
 * release lane only 6% of the files it eventually edited had been read before its first
 * edit. The plugin infers the intent from the call and the recent context and names the
 * likely targets BEFORE the model finishes searching: one labeled additionalContexts note on
 * the tools/post-execute waterfall, deterministic (no LLM in the hot path), gated hard
 * (threshold 0.75, 0.85 for the destructive intents), at most 7 candidates each with a stated
 * reason, with a cooldown, a dedupe, a per-turn cap, and an explicit abstention path where
 * every abstention is a ledger line - the algebra's identity element is silence.
 *
 * FULLY CONTRACT-AWARE: one tools/post-execute waterfall listener (next() always awaited
 * FIRST; pass-through returns the downstream decision unchanged; fail-open try/catch never
 * throws into the waterfall), plus the agent/pre-step reset, the optional sticky section
 * (system-prompt/assemble, off by default), the tools/change invalidation, and a validated
 * Schemastery schema (Variable/Config, the plan section 4.8 schema) whose defaults Cordis
 * fills at load. The factory's shared machinery is consumed for what applies (State builder +
 * ledger + cell unwrap); the fs/observed Wire and the storage Journal do not (a NON-MANIFEST
 * module).
 */
export declare const name = "hook-dsh-search-suggester";
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
