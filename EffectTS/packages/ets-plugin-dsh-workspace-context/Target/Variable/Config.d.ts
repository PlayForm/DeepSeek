import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * The service's Schemastery Config schema, built once at load.
 *
 * @remarks
 *
 * A Variable: one constant built once at load. Cordis validates the
 * exported schema while the plugin loads and fills every default, so
 * invalid configuration fails LOUD at load, and `apply` receives a
 * validated plain config object. The shape this schema produces is
 * Interface/Config.ts; the contract is
 * Documentation/Plans/WORKSPACE-FAMILY-V4-1.md section 3.5.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)`
 * as a MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST
 * posture uses `shared: false` - the MINIMAL shared block, ONLY the two
 * universal volatile cells (`log`, `logFile`). The service's own `logFile`
 * default (its SEPARATE ledger, one log per module) is supplied through its
 * own fields, which override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin; the factory's State builder
 * refreshes the mapped State fields IN PLACE.
 *
 * `enabled` defaults to FALSE - the IDLE-forever posture.
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
