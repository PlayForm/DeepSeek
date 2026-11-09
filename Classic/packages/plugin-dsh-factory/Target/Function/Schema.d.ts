/**
 * @module Schema
 *
 * The Schemastery schema factory (`Function/Schema` in the service API).
 * Builds the module's exported `Config` from the SHARED volatile fields +
 * `exclude` + `policyFile` + the module's OWN schema fields.
 *
 * @remarks
 * Shared shape (P8 - the volatile cells, identical to the trio: hot edits
 * commit WITHOUT remounting the plugin):
 *
 *     log              boolean  default true   .volatile()  - ledger enabled
 *     logFile          string   default (param).volatile()  - the ledger file
 *     updateCooldownMs number   default 3000   .volatile()  - update cooldown
 *     mutationTools    string[] default (param).volatile()  - the trigger tools
 *     policyFile       string   default ""                  - the global policy
 *     exclude          string[] default (param)             - exclusion segments
 *
 * `shared` (all optional) parameterizes the per-module defaults - logFile is
 * per-module by design (one separate ledger per module), exclude defaults to
 * the shared built-in list (`Variable/Default`), updateCooldownMs is included
 * for every fs/observed module (the pinner simply never reads it). A
 * NON-MANIFEST module (the hook-dsh-normalize-dash - no fs/observed machinery
 * at all) passes `shared: false` (v0.1.1, P1): the emitted block is then the
 * MINIMAL one - ONLY the two universal volatile cells (`log`, `logFile`) -
 * so the schema never advertises
 * updateCooldownMs/mutationTools/policyFile/exclude that the module has none
 * of; the module supplies its own `logFile` default via its own fields
 * (spread last, overriding the minimal one).
 *
 * `module` carries the module's OWN schema fields verbatim (e.g.
 * `{ sections: Schema.array(Schema.string()).default(Section) }`) - appended
 * after the shared ones, so a module field never collides with the shared
 * names.
 *
 * EXPORTED TWICE (v0.1.1, P1): as the service's instance method
 * (`Factory.Schema(shared?, module?)` - the 15-method surface) AND as the
 * module-level named export `Schema` on the entry (`Library.ts`) - the loader
 * needs `Config` at MODULE-EVALUATION time, before any context (and therefore
 * any service instance) exists; the named export is the module-load use.
 * Both delegate to this function (it never reads `this`).
 *
 * This is the ONLY module in the tree with a runtime import of
 * @deepseek-ai/schemastery (the schema must be a real schemastery instance -
 * the loader consumes it through the Standard Schema `~standard` interface;
 * the import resolves from the running dsh's own copy,
 * docs/user/develop/basic/publish.md:103).
 */
import Schema from "@deepseek-ai/schemastery";
export default _default;
declare function _default(Shared?: {
    log?: boolean;
    logFile?: string;
    updateCooldownMs?: number;
    mutationTools?: string[];
    exclude?: string[];
    policyFile?: string;
} | false, Module?: Record<string, unknown>): Schema<Schemastery.ObjectS<NoInfer<{
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
