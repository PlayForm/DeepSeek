import Schema from "@deepseek-ai/schemastery";
/**
 * @module Config
 *
 * The host package's Schemastery schema (a Variable: one constant built once
 * at load).
 *
 * @remarks
 *
 * The loader validates it and fills every default, so invalid configuration
 * fails loud at load. Every knob is volatile - hot edits commit without
 * remounting.
 */
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    logRoot: Schema<string, string, "volatile-defined">;
    maxLines: Schema<number, number, "volatile-defined">;
    ccrLog: Schema<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: Schema<boolean, boolean, "volatile-defined">;
    logRoot: Schema<string, string, "volatile-defined">;
    maxLines: Schema<number, number, "volatile-defined">;
    ccrLog: Schema<string, string, "volatile-defined">;
}>>, "plain">;
export default _default;
