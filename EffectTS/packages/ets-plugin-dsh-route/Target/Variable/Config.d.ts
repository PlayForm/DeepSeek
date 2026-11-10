/**
 * @module Config
 *
 * The plugin's Schemastery Config schema, built once at load.
 *
 * @remarks
 * A Variable: one constant built once at load. Cordis validates the exported
 * schema while the plugin loads and fills every default, so invalid
 * configuration fails LOUD at load instead of silently falling back
 * per-field, and `apply` receives a validated plain config object. The
 * shape this schema produces is Interface/Config.ts.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
 * a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST
 * posture uses `shared: false` - the MINIMAL shared block, ONLY the two
 * universal volatile cells (`log`, `logFile`). The plugin hooks the tools
 * waterfalls, not fs/observed, so the schema never advertises
 * updateCooldownms / mutationTools / policyFile / exclude - machinery the
 * module has none of. The plugin's own `logFile` default (its SEPARATE
 * ledger, one log per module) is supplied through its own fields.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin via the loader's loader/volatile-
 * update event; the factory's State builder refreshes the mapped State
 * fields IN PLACE, so a policy edit lands on the next launch without a
 * remount (the plan's "the config hot-reload or the restart").
 *
 * `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
 * disabled, never appears in the profile's bundles, and enables only by an
 * explicit ACTIVATE.
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface).
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
