import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * The live client's Schemastery schema.
 *
 * @remarks
 *
 * A Variable: one constant built once at load; the loader validates it and
 * fills every default, so invalid configuration fails LOUD at load. Every
 * knob is volatile. The Config base leads the field list - `enabled` first,
 * the base every cost-and-panel package carries; the package is a pure
 * browser module and writes no ledger file, so the base's `log`/`logFile`
 * cells are absent by design.
 */
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    tabOrder: Schema<number, number, "volatile-defined">;
    maxEvents: Schema<number, number, "volatile-defined">;
    maxRepresentations: Schema<number, number, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    tabOrder: Schema<number, number, "volatile-defined">;
    maxEvents: Schema<number, number, "volatile-defined">;
    maxRepresentations: Schema<number, number, "volatile-defined">;
}>>, "plain">;
export default _default;
