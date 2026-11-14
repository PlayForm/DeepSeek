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
 * config object. The shape this schema produces is Interface/Config.ts; this is
 * IMPLEMENTATION-DESIGN.md section 2.1 + 2.2, with the 14-entry catalog supplied from the
 * sibling Variable/DefaultBlocks.
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture uses
 * `shared: false` - the MINIMAL shared block, ONLY the two universal volatile cells
 * (`log`, `logFile`). The plugin hooks the tool waterfalls and the assemble waterfall,
 * not fs/observed, so the schema never advertises
 * updateCooldownMs/mutationTools/policyFile/exclude - machinery the module has none of.
 * The plugin's own `logFile` default (its SEPARATE ledger, one log per module) is
 * supplied through its own fields, which override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits commit WITHOUT
 * remounting the plugin via the loader's loader/volatile-update event; the factory's
 * State builder refreshes the mapped State fields IN PLACE, so a flip (enabled, refresh,
 * ttlCalls, separator, budget, the block table, ...) takes effect on the next assembly.
 * The block TABLE (an array) carries the volatile marker and its leaves stay PLAIN -
 * schemastery rejects volatile leaves under an enclosing volatile field (the tool-coach's
 * patternTable precedent); one table edit commits one update whose whole array the
 * State's refresh listener re-reads. A kind change lands on the next assembly, which is
 * safe: the render engine dispatches per block id and keeps NO per-kind structural state
 * (design section 2.2).
 *
 * `enabled` defaults to TRUE - the shipped posture is ON, and a profile turns
 * it off with `enabled: false` (the LIVE disabled posture: a cold mount logs
 * `disabled (enabled=false)` and every listener stays registered, reading the
 * flag at call time).
 *
 * This is one of the modules in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance - the loader
 * consumes it through the Standard Schema `~standard` interface).
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
