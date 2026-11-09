/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load, and `apply` receives
 * a validated plain config object.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
 * a MODULE-LEVEL named export): the NON-MANIFEST posture uses `shared: false`
 * - the MINIMAL shared block, ONLY the two universal volatile cells (`log`,
 * `logFile`). The edit suggester hooks tools/post-execute, not fs/observed,
 * so the schema never advertises updateCooldownMs/mutationTools/policyFile/
 * exclude. The suggester's own `logFile` default (its SEPARATE ledger, one
 * log per module) is supplied through its own fields.
 *
 * VOLATILE CELLS: every tuning knob is `.volatile()` - hot-editable without a
 * remount, matching the tool-coach's posture. There is no structural knob:
 * the pack is an explicit repo/user file resolved per call, never a config
 * path.
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
