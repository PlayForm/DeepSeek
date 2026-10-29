import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "defined">;
    databasePath: Schema<string, string, "defined">;
    client: Schema<string, string, "defined">;
    window: Schema<number, number, "defined">;
    metrics: Schema<Schemastery.ObjectS<NoInfer<{
        credit: Schema<boolean, boolean, "defined">;
        effectiveness: Schema<boolean, boolean, "defined">;
        lines: Schema<boolean, boolean, "defined">;
        overhead: Schema<boolean, boolean, "defined">;
        cache: Schema<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        credit: Schema<boolean, boolean, "defined">;
        effectiveness: Schema<boolean, boolean, "defined">;
        lines: Schema<boolean, boolean, "defined">;
        overhead: Schema<boolean, boolean, "defined">;
        cache: Schema<boolean, boolean, "defined">;
    }>>, "plain">;
    log: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "defined">;
    databasePath: Schema<string, string, "defined">;
    client: Schema<string, string, "defined">;
    window: Schema<number, number, "defined">;
    metrics: Schema<Schemastery.ObjectS<NoInfer<{
        credit: Schema<boolean, boolean, "defined">;
        effectiveness: Schema<boolean, boolean, "defined">;
        lines: Schema<boolean, boolean, "defined">;
        overhead: Schema<boolean, boolean, "defined">;
        cache: Schema<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        credit: Schema<boolean, boolean, "defined">;
        effectiveness: Schema<boolean, boolean, "defined">;
        lines: Schema<boolean, boolean, "defined">;
        overhead: Schema<boolean, boolean, "defined">;
        cache: Schema<boolean, boolean, "defined">;
    }>>, "plain">;
    log: Schema<boolean, boolean, "defined">;
    logFile: Schema<string, string, "defined">;
}>>, "plain">;
export default _default;
