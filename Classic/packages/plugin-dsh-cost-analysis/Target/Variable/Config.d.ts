import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load instead of silently
 * falling back per-field, and `apply` receives a validated plain config object.
 * The shape this schema produces is Interface/Config.ts.
 *
 * The schema is small by charter (section 13): the plugin reads the ledger the
 * cost plugin wrote, so it configures only WHERE to read, WHICH metric families
 * render, and WHERE its own diagnostic log goes - no price book, no capture
 * gates, no annotate toggle, because those belong to the writer.
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
 *
 * Home - the harness home precedence (explicit path > $DSH_HOME > ~/.dsh)
 * resolves the ledger and the log beside the harness's own storages, not under
 * a fixed tilde path (Temporary/Harness-Wave/Plan.md section 1.1).
 *
 * THE CONFIG BASE leads the field list - `enabled`, then `log`, then `logFile`
 * - the base every cost-and-panel package carries; the domain fields follow in
 * their existing order, unchanged in name and default.
 */
/**
 * Named defaults (the shipped convention): every .default literal is hoisted
 * to a constant above the schema (Temporary/Harness-Wave/Plan.md section 6,
 * Pattern P1). DefaultRenderLimit is the one command's bounded render; the
 * diagnostic log is off by default because the harness ships no plugin
 * diagnostic-log convention (Plan.md section 1.1, "log off").
 */
export declare const DefaultDatabasePath: string;
export declare const DefaultClient = "";
export declare const DefaultWindow = 30;
export declare const DefaultRenderLimit = 20;
export declare const DefaultLog = false;
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
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
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
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
}>>, "plain">;
export default _default;
