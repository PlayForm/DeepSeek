import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of the COST ANALYSIS plugin
 * (@playform/ets-plugin-dsh-cost-analysis).
 *
 * @remarks
 *
 * THE EXPORT SURFACE AND THE LOADER CONTRACT: `export const name` +
 * `export const apply` + `export const Config` + `export const inject` +
 * `export default { name, apply, Config, inject }` - the ONLY named exports
 * in the tree (cordis requires them); every other module is a nameless
 * default export composed Rust-style.
 *
 * THE DEFAULT OBJECT CARRIES ALL OF THEM: `export default { name, apply }`
 * SHADOWS the named exports - inject and Config MUST also sit on the
 * default object, or service accessors throw `cannot get property "..."
 * without inject` (the live-verified lesson recorded in the
 * plugin-development skill and in the live-containers entry).
 *
 * THE ROLE: @playform/ets-plugin-dsh-cost-analysis - the read-only analysis
 * half of the cost family: it opens the ledger the cost plugin wrote with
 * { readOnly: true } and answers questions about contribution and
 * efficiency (read credit, read-before-edit effectiveness, cost per added
 * line on changed files, exploration overhead, cache efficiency). It never
 * writes a row, never creates a table, and never registers a tool or a
 * prompt section: its only surface is the one /cost analysis command.
 */
/**
 * The plugin's loader name.
 */
export declare const name = "plugin-dsh-cost-analysis";
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    client: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    window: import("@deepseek-ai/schemastery").default<number, number, "defined">;
    metrics: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, "plain">;
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    client: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    window: import("@deepseek-ai/schemastery").default<number, number, "defined">;
    metrics: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, "plain">;
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
}>>, "plain">;
export { Version };
export declare const inject: string[];
export declare const apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
declare const _default: {
    name: string;
    apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        client: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        window: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        metrics: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        }>>, "plain">;
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        client: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        window: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        metrics: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
            cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        }>>, "plain">;
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
