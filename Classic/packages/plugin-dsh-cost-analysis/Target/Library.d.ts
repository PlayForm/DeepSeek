import Version from "./Variable/Version.js";
export declare const name = "plugin-dsh-cost-analysis";
/**
 * Loader contract (cordis): the exported schema is validated and defaulted
 * while the plugin loads; apply receives a plain validated config object.
 */
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    client: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    window: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    metrics: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    }>>, "plain">;
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    client: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    window: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
    metrics: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    }>>, "plain">;
    log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
    logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
}>>, "plain">;
/**
 * The compiled package version (Source/Variable/Version, built in by the
 * ESBuild define) - NOT a loader key: the contract's four names (name, apply,
 * Config, inject) are unchanged, and the default object below stays exactly
 * { name, apply, Config, inject }.
 */
export { Version };
/**
 * Required services. The factory (@playform/plugin-dsh-factory) provides the
 * State builder and the ledger lines; the commands service owns the human
 * surface (the one /cost analysis command). The plugin registers NO tool, NO
 * prompt section, and NO model-visible message.
 */
export declare const inject: string[];
export declare const apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
declare const _default: {
    name: string;
    apply: (Context: import("@deepseek-ai/cordis").Context, Options: import("./Interface/Config.js").default) => void;
    Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        client: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        window: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        metrics: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        }>>, "plain">;
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        databasePath: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        client: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        window: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        metrics: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
            credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            credit: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            effectiveness: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            lines: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            overhead: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
            cache: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        }>>, "plain">;
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
    }>>, "plain">;
    inject: string[];
};
export default _default;
