import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * The panel package's Schemastery schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * The loader validates it and fills every default, so invalid configuration
 * fails loud at load. Every knob is volatile - hot edits commit without
 * remounting (the package is a pure client module, so the client half
 * re-reads the fields on the next render pass).
 */
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    tabOrder: Schema<number, number, "volatile-defined">;
    overlayMaxWidth: Schema<number, number, "volatile-defined">;
    locale: Schema<"en" | "zh", "en" | "zh", "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    tabOrder: Schema<number, number, "volatile-defined">;
    overlayMaxWidth: Schema<number, number, "volatile-defined">;
    locale: Schema<"en" | "zh", "en" | "zh", "volatile-defined">;
}>>, "plain">;
export default _default;
