/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built
 * once at load).
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills
 * every default, so invalid configuration fails LOUD at load instead of
 * silently falling back per-field, and `apply` receives a validated plain
 * config object. The shape this schema produces is Interface/Config.ts.
 *
 * The schema is small by charter (section 13): the plugin reads the ledger
 * the cost plugin wrote, so it configures only WHERE to read, WHICH metric
 * families render, and WHERE its own diagnostic log goes - no price book,
 * no capture gates, no annotate toggle, because those belong to the writer.
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
 */
import Schema from "@deepseek-ai/schemastery";
/**
 * The plugin's Config schema, built once at load.
 */
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
