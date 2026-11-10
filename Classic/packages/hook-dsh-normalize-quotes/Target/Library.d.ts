import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module (mirrors Source/Library.rs): the loader contract's named
 * exports and the default object for the hook-dsh-normalize-quotes plugin.
 *
 * @remarks
 *
 * Loader contract: `export const name` + `export const apply` +
 * `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }` - the ONLY named exports in
 * the tree (cordis requires them); every other module is a nameless default
 * export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the default
 * object, or service accessors throw `cannot get property "fs" without inject`
 * (live-verified 2026-10-03; a smoke that calls apply directly never catches
 * this).
 *
 * @playform/hook-dsh-normalize-quotes - the quote normalizer for MODEL OUTPUT.
 * The curly quote family arrives from smart-quote processors and code editors;
 * the straight forms are the unambiguous literals every parser, shell and diff
 * understands. The dsh plugin family hooks the llm/stream waterfall - the
 * interceptable wrapper around EVERY streaming model call (retry, replay,
 * routing), bound to the LlmRuntime. The normalization there flows into both
 * the live UI and the durable transcript - VISIBLE by design, the opposite of
 * the governance family's silence, because the normalization IS the feature.
 *
 * The transform is the char-to-char MAP (the core's Quotes table) - no context
 * rules, whole-chunk single-character substitution, chunk-boundary safe:
 *
 * - U+2018/U+2019/U+201A/U+201B - the typographic single-quote family
 *   (including the low-9 and high-reversed-9 variants) to ' (U+0027);
 * - U+201C/U+201D/U+201E/U+201F - the typographic double-quote family
 *   (including the low-9 and high-reversed-9 variants) to " (U+0022);
 * - text-delta / reasoning-delta (when on) - the `text` field;
 * - block-end - the assembled TextBlock.text / ReasoningBlock.text (plus a
 *   runtime `thinking` string field, defensively), and the
 *   ToolCallBlock.arguments when the tool-args flag is on;
 * - tool-call-delta - the `argumentsDelta` text when the tool-args flag is on
 *   (`normalizeToolArguments` - IMPLEMENTED, default OFF: the arguments are
 *   execution-critical raw JSON, so enabling it is the user's accepted risk;
 *   this profile's patch yml turns it on; the gate is THREE-WAY with the flag
 *   on: a delta/block whose `name` is "edit" passes through BY IDENTITY (the
 *   edit tool's `old_string` must match the real file bytes), and a call whose
 *   arguments open with the `{"__normalize":false` first-key marker passes
 *   through UNNORMALIZED with the marker entry stripped, so the executed call
 *   carries no unknown key);
 * - block-start / usage / finish - passthrough BY IDENTITY, ALWAYS.
 *
 * FULLY API-AWARE: one waterfall listener (next() always called - omitting it
 * short-circuits the model call; options never touched - LOOP-built requests
 * are deep-frozen and must not be rewritten), chunk order preserved, no
 * buffering, upstream throws propagate, and configuration is a validated
 * Schemastery schema (Variable/Config) whose defaults Cordis fills at load.
 * The factory's shared machinery is consumed for what applies (State builder +
 * ledger + cell unwrap); the fs/observed Wire and the storage Journal do not
 * (this is a NON-MANIFEST module: no fs/observed, no gate, no Stash traffic,
 * no policy discovery).
 */
export declare const name = "hook-dsh-normalize-quotes";
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
 * shared fields) and the ledger - the stream-normalization flavors are
 * NON-MANIFEST factory consumers. Nothing else: the chunk vocabulary arrives
 * through the llm/stream waterfall, not an import.
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
