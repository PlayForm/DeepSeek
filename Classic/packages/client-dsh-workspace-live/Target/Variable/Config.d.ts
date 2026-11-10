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
 * knob is volatile.
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
