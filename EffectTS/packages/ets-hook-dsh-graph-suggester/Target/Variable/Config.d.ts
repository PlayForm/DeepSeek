import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * Declares the plugin's Schemastery Config schema as one constant built once at load.
 *
 * @remarks
 *
 * A Variable: one constant built once at load. Cordis validates the exported schema while
 * the plugin loads and fills every default, so invalid configuration fails LOUD at load
 * instead of silently falling back per-field, and `apply` receives a validated plain
 * config object. The shape this schema produces is Interface/Config.ts.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export): the NON-MANIFEST posture uses `shared: false` - the MINIMAL
 * shared block, ONLY the two universal volatile cells (`log`, `logFile`). The hook hooks
 * tools/post-execute, not fs/observed, so the schema never advertises the factory's fs
 * machinery. The hook's own `logFile` default (its SEPARATE ledger, one log per module)
 * is supplied through its own fields, which override the minimal block's.
 *
 * EVERY knob is volatile (hot-editable without remounting), matching the search plan's
 * §4.8 posture - the noise-control knobs need mid-session retuning without a rebuild.
 *
 * Runtime import of @deepseek-ai/schemastery (the schema must be a real schemastery
 * instance - the loader consumes it through the Standard Schema `~standard` interface;
 * the import resolves from the running dsh's own copy,
 * docs/user/develop/basic/publish.md:103).
 */
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
}>>, "plain"> | Schema<Schemastery.ObjectS<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
    updateCooldownMs: Schema<number, number, "volatile-defined">;
    mutationTools: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: Schema<string, string, "defined">;
    exclude: Schema<string[], string[], "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    log: Schema<boolean, boolean, "volatile-defined">;
    logFile: Schema<string, string, "volatile-defined">;
    updateCooldownMs: Schema<number, number, "volatile-defined">;
    mutationTools: Schema<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    policyFile: Schema<string, string, "defined">;
    exclude: Schema<string[], string[], "defined">;
}>>, "plain">;
export default _default;
