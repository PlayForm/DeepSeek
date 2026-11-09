/**
 * @module Config
 *
 * The plugin's Schemastery Config schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 * Cordis validates the exported schema while the plugin loads and fills every
 * default (docs/user/develop/basic/config.md:45), so invalid configuration
 * fails LOUD at load instead of silently falling back per-field, and `apply`
 * receives a validated plain config object. The shape this schema produces is
 * Interface/Config.ts; every default below is the schema-level home of that
 * shape's field values (the plan's §5 schema, verbatim -
 * Documentation/Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md).
 *
 * COMPOSED BY THE FACTORY'S STANDALONE helper (`Schema(shared?, module?)` as
 * a MODULE-LEVEL named export): the NON-MANIFEST posture uses `shared: false`
 * - the MINIMAL shared block, ONLY the two universal volatile cells (`log`,
 * `logFile`). The CCR hook hooks tools/post-execute, not fs/observed, so the
 * schema never advertises updateCooldownMs/mutationTools/policyFile/exclude -
 * machinery the module has none of. The CCR hook's own `logFile` default (its
 * SEPARATE ledger, one log per module) is supplied through its own fields,
 * which override the minimal block's.
 *
 * VOLATILE CELLS: `log`, `logFile`, `thresholdBytes`, `previewMaxChars` and
 * `multipliers` are `.volatile()` - hot edits commit WITHOUT remounting the
 * plugin, matching Aphrodite's hot-reload thresholds. `thresholdBytes` is the
 * gate's only numeric knob that needs mid-session retuning; `multipliers` is
 * its per-type extension; `previewMaxChars` shapes the model-visible line.
 * The structural knobs (targets, exempt, the store, the journal, auto-expand,
 * the context-engine phase-4 flags) change the dispatch SEMANTICS, so they
 * remount on edit (plain fields). `contextEngine` and its three knobs are
 * phase 4: the engine is implemented and OFF by default - the field set is
 * fixed so tuning it is config-only (Function/Engine, SCHEME.md §9).
 *
 * This is one of the modules in the tree with a runtime import of
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
