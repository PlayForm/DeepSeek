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
 * the two universal volatile cells (`log`, `logFile`). The comment filter
 * hooks tools/post-execute and agent/pre-step, not fs/observed, so shipping
 * the fs/observed fields (updateCooldownMs, mutationTools, policyFile,
 * exclude) would advertise behavior the plugin does not have. The module's
 * own `logFile` default (its SEPARATE ledger) is supplied through its own
 * fields, which override the minimal block's.
 *
 * P8 - VOLATILE CELLS: `logFile`, `enabled`, `intent`, `intentKeywords` and
 * `notice` are `.volatile()` - hot edits commit WITHOUT remounting the
 * plugin; the next dispatch reads the refreshed State through the factory's
 * P10 volatile-refresh listener. `enabled` is the whole filter switch, so a
 * mid-session off must not drop the registrations; `intentKeywords` is the
 * tuning surface of the per-task gate; `notice` is the output's only
 * cosmetic knob. `targets` and `exempt` change WHICH tool names the filter
 * may ever touch (the decision surface), so they are plain fields and
 * remount on edit - the honest posture.
 *
 * THE `enabled` FLAG IS NOT THE LEDGER GATE: the factory's shared `log` cell
 * lands on `State.Enabled` (the durable-ledger switch), and the module's
 * `fields` map (Function/Apply) copies `enabled` onto the DISTINCT
 * `State.Active` cell. Keeping them apart is deliberate: a filter switched
 * off still writes its activation line and its refusals to the ledger - the
 * family's "did it activate is answerable from the ledger alone" contract.
 * The minimal block's `log` cell therefore keeps its full meaning here, and
 * Interface/Config.ts declares it.
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
