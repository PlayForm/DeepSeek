import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * The plugin's one Variable: the Schemastery schema the loader validates at boot.
 *
 * @remarks
 *
 * A mismatch fails loud rather than silently disabling the tab. Every knob is volatile, following
 * the family convention: the values live in the profile row (cordis.patch.yml) and the client half
 * receives only what it needs (the tab order and the row budget), never the whole schema object.
 */
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    tabOrder: Schema<number, number, "volatile-defined">;
    rows: Schema<number, number, "volatile-defined">;
    locale: Schema<"en" | "zh", "en" | "zh", "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    tabOrder: Schema<number, number, "volatile-defined">;
    rows: Schema<number, number, "volatile-defined">;
    locale: Schema<"en" | "zh", "en" | "zh", "volatile-defined">;
}>>, "plain">;
export default _default;
