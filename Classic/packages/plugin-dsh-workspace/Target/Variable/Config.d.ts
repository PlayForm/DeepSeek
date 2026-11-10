/**
 * @module Config
 *
 * The plugin's Schemastery Config schema, a Variable: one constant built once
 * at load.
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load instead of silently
 * falling back per-field, and `apply` receives a validated plain config object.
 * The shape this schema produces is Interface/Config.ts.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture uses
 * `shared: false` - the MINIMAL shared block, ONLY the two universal volatile
 * cells (`log`, `logFile`), with the plugin's own `logFile` default (its
 * SEPARATE ledger, one log per module) supplied through its own fields, which
 * override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits commit
 * WITHOUT remounting the plugin via the loader's loader/volatile-update event;
 * the factory's State builder refreshes the mapped State fields IN PLACE, so a
 * flip (enabled, mapDepth, findLimit, packetTokenBudget, ...) takes effect on
 * the next tool call.
 *
 * `enabled` defaults to FALSE - the IDLE-forever posture: the plugin ships
 * disabled, never appears in the profile's bundles, and enables only by an
 * explicit ACTIVATE.
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
