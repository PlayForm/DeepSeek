import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * The service's Schemastery Config schema: one constant built once at load.
 *
 * @remarks
 *
 * Cordis validates the exported schema while the plugin loads and fills every
 * default, so invalid configuration fails LOUD at load, and `apply` receives
 * a validated plain config object. The shape this schema produces is
 * Interface/Config.ts; the contract is SEMANTICS.md (the distribution law:
 * its own Config + ledger strings).
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as a
 * MODULE-LEVEL named export, imported as Compose): the NON-MANIFEST posture
 * uses `shared: false` - the MINIMAL shared block, ONLY the two universal
 * volatile cells (`log`, `logFile`). The service's own `logFile` default (its
 * SEPARATE ledger, one log per module) is supplied through its own fields,
 * which override the minimal block's.
 *
 * VOLATILE CELLS: every knob in this schema is `.volatile()` - hot edits
 * commit WITHOUT remounting the plugin via the loader's loader/volatile-update
 * event; the factory's State builder refreshes the mapped State fields IN
 * PLACE, so a flip (enabled, domain, maxEntries, exclude, root, lsp, adapters)
 * takes effect on the next resolve or event.
 *
 * `enabled` defaults to FALSE - the IDLE-forever posture: the service ships
 * disabled, never appears in the profile's bundles, and enables only by an
 * explicit ACTIVATE.
 *
 * `adapters` defaults to EMPTY - the default registration stays the seven
 * TypeScript/JavaScript extensions (the byte-exact `adapters registered (7
 * extensions)` line). The any-file adapters are OPT-IN by name; the names are
 * validated against the catalog (Variable/Adapters) at load.
 *
 * `lsp` defaults to TRUE: the harness LSP seam is probed at use time, and an
 * absent seam (or no provider for the extension) falls back to the lexical
 * adapter - the switch exists so a deployment can keep the model purely
 * lexical.
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
