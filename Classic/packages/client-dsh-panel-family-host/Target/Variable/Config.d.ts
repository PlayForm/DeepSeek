/**
 * @module Config
 *
 * The host package's Schemastery schema: one Variable, a single constant built once at load.
 *
 * @remarks
 * The loader validates the schema and fills every default, so invalid configuration fails LOUD
 * at load. Every knob is volatile - hot edits commit without remounting - and every reader
 * unwraps a cell through `Function/Cell`, so a volatile field is safe here.
 */
import Schema from "@deepseek-ai/schemastery";
declare const _default: Schema<Schemastery.ObjectS<NoInfer<{
    /**
     * The enabled switch of the endpoint (ships disabled).
     */
    enabled: Schema<boolean, boolean, "volatile-defined">;
    /**
     * The log root; every family ledger lives here as `<namespace>.log`.
     */
    logRoot: Schema<string, string, "volatile-defined">;
    /**
     * The cap on any single `tail()` request, in lines.
     */
    maxLines: Schema<number, number, "volatile-defined">;
    /**
     * The ccr log path for `stats()`.
     */
    ccrLog: Schema<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    /**
     * The enabled switch of the endpoint (ships disabled).
     */
    enabled: Schema<boolean, boolean, "volatile-defined">;
    /**
     * The log root; every family ledger lives here as `<namespace>.log`.
     */
    logRoot: Schema<string, string, "volatile-defined">;
    /**
     * The cap on any single `tail()` request, in lines.
     */
    maxLines: Schema<number, number, "volatile-defined">;
    /**
     * The ccr log path for `stats()`.
     */
    ccrLog: Schema<string, string, "volatile-defined">;
}>>, "plain">;
export default _default;
