/**
 * @module Config
 *
 * The plugin's Schemastery Config schema for the cargo module, a Variable:
 * one constant built once at load.
 *
 * @remarks
 * Produced by the FACTORY's schema factory (`factory.Schema(shared?,
 * module?)` - SCHEME.md §2.14): the SHARED block (log / logFile /
 * updateCooldownMs / mutationTools volatile - the P8 hot-editable cells -
 * plus policyFile and exclude, whose built-in default is the factory's own
 * Variable/Default list, identical to this module's historical one) followed
 * by the module's OWN fields verbatim.
 *
 * Defaults mirror the package.json governor except for the module-specific
 * fields: the SEPARATE ledger (hook-dsh-cargo-governor.log - never the package
 * governor's log, passed as the `shared.logFile` default), `cargoBin` (bare
 * name resolved by the subprocess seam; set an absolute path when the host
 * PATH lacks cargo), and `updateMode: "cargo"` - the only implemented mode
 * (the Rust-side CLI; Rust does not co-opt into the TypeScript ecosystem).
 *
 * CONTRACT NOTE: the loader contract requires `Config` as a static named
 * export - built at MODULE LOAD, before any service exists. The factory's
 * Schema is an instance method, so the schema is produced through the
 * STANDALONE named export (factory v0.1.1, P1 - the pre-v0.1.1 workaround,
 * invoking the class prototype with `call(null, ...)`, is gone; the schema
 * factory never reads `this`). The module's own fields are real Schemastery
 * fields built with the same @deepseek-ai/schemastery import the loader
 * consumes (the schema must be a real schemastery instance - the Standard
 * Schema `~standard` interface).
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
