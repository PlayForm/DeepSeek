import Version from "./Variable/Version.js";
export declare const name = "plugin-dsh-cost-analysis";
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
export { Version };
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
