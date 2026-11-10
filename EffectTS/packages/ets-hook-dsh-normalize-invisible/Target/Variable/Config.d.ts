/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built
 * once at load).
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills
 * every default (docs/user/develop/basic/config.md:45), so invalid
 * configuration fails LOUD at load instead of silently falling back
 * per-field, and `apply` receives a validated plain config object. The shape
 * this schema produces is Interface/Config.ts; every default below is the
 * schema-level home of that shape's field values.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (factory v0.1.1, P1 -
 * `Schema(shared?, module?)` as a MODULE-LEVEL named export): the
 * NON-MANIFEST posture uses `shared: false` - the MINIMAL shared block, ONLY
 * the two universal volatile cells (`log`, `logFile`). The factory's full
 * shared block (updateCooldownMs, mutationTools, policyFile, exclude) is
 * fs/observed machinery the invisible hook has NONE of: it hooks llm/stream,
 * not fs/observed, and shipping those dead fields would advertise behavior
 * the plugin does not have. The invisible hook's own `logFile` default (its
 * SEPARATE ledger) is supplied through its own fields, which override the
 * minimal block's.
 *
 * P8 - VOLATILE CELLS: `log`, `logFile` and `replacement` are `.volatile()`
 * - hot edits commit WITHOUT remounting the plugin. `replacement` is the
 * transform's only knob, so a mid-session re-tune must not drop the
 * registration; the loader hands volatile fields to apply as stable
 * references (`{ get() }` cells) and the factory's State builder unwraps
 * them defensively. `normalizeReasoning` / `normalizeToolArguments` change
 * the dispatch SEMANTICS, so they remount on edit (plain fields).
 *
 * This is the ONLY module in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface;
 * the import resolves from the running dsh's own copy,
 * docs/user/develop/basic/publish.md:103).
 */
import Schema from "@deepseek-ai/schemastery";
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
