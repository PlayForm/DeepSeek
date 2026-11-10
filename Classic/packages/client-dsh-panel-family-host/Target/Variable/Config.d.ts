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
