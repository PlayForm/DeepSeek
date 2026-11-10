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
 * default (docs/user/develop/basic/config.md:45), so invalid configuration
 * fails LOUD at load instead of silently falling back per-field, and `apply`
 * receives a validated plain config object. Defaults mirror the previous
 * Access/* fallbacks; the load-crash lesson of the deprecated dev.1 build is
 * covered by the runtime resolution rule - the schema import resolves from the
 * running dsh's own copy (docs/user/develop/basic/publish.md:103).
 *
 * COMPOSED BY THE FACTORY (SCHEME.md §2.14): the shared block (log, logFile,
 * updateCooldownMs, mutationTools, policyFile, exclude) followed by the
 * module's own fields - via the STANDALONE named export (factory v0.1.1, P1):
 * the loader needs `Config` at MODULE-EVALUATION time, before any context (and
 * therefore any service instance) exists, so the module-level
 * `Schema(shared?, module?)` is the module-load use (the pre-v0.1.1
 * hand-restated block - shape parity by restatement - is gone). The built-in
 * `exclude` default is NOT restated here: Variable/Default owns that list (it
 * is also the governor's fence - see Function/Transform).
 *
 * The shape this schema produces is Interface/Config.ts; every default below
 * is the schema-level home of that shape's field values.
 *
 * P8 - VOLATILE CELLS: `log`, `logFile`, `updateCooldownMs` and
 * `mutationTools` are `.volatile()` - hot edits to them commit WITHOUT
 * remounting the plugin (the fiber, and with it the ledger file handle state,
 * the in-flight map and the circuit breaker, stay alive). The loader hands
 * volatile fields to apply as stable references (`{ get() }` cells, not raw
 * values) - the FACTORY'S State builder already unwraps them defensively
 * (SCHEME.md §2.10), so the State still sees the same plain config shape (the
 * smoke's defaults hold).
 *
 * This is the ONLY module in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
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
