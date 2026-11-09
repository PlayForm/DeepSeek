import Schema from "@deepseek-ai/schemastery";
export declare const DefaultDatabasePath: string;
export declare const DefaultClient = "";
export declare const DefaultWindow = 30;
export declare const DefaultRenderLimit = 20;
export declare const DefaultLog = false;
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    databasePath: Schema<string, string, "defined">;
    client: Schema<string, string, "volatile-defined">;
    window: Schema<number, number, "volatile-defined">;
    metrics: Schema<Schemastery.ObjectS<NoInfer<{
        credit: Schema<boolean, boolean, "volatile-defined">;
        effectiveness: Schema<boolean, boolean, "volatile-defined">;
        lines: Schema<boolean, boolean, "volatile-defined">;
        overhead: Schema<boolean, boolean, "volatile-defined">;
        cache: Schema<boolean, boolean, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        credit: Schema<boolean, boolean, "volatile-defined">;
        effectiveness: Schema<boolean, boolean, "volatile-defined">;
        lines: Schema<boolean, boolean, "volatile-defined">;
        overhead: Schema<boolean, boolean, "volatile-defined">;
        cache: Schema<boolean, boolean, "volatile-defined">;
    }>>, "plain">;
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    databasePath: Schema<string, string, "defined">;
    client: Schema<string, string, "volatile-defined">;
    window: Schema<number, number, "volatile-defined">;
    metrics: Schema<Schemastery.ObjectS<NoInfer<{
        credit: Schema<boolean, boolean, "volatile-defined">;
        effectiveness: Schema<boolean, boolean, "volatile-defined">;
        lines: Schema<boolean, boolean, "volatile-defined">;
        overhead: Schema<boolean, boolean, "volatile-defined">;
        cache: Schema<boolean, boolean, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        credit: Schema<boolean, boolean, "volatile-defined">;
        effectiveness: Schema<boolean, boolean, "volatile-defined">;
        lines: Schema<boolean, boolean, "volatile-defined">;
        overhead: Schema<boolean, boolean, "volatile-defined">;
        cache: Schema<boolean, boolean, "volatile-defined">;
    }>>, "plain">;
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "defined">;
}>>, "plain">;
export default _default;
