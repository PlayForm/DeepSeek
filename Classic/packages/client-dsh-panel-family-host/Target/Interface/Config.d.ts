/**
 * @module Config
 *
 * The validated shape of the host package's tunables: the Schemastery schema in
 * `Variable/Config.ts` produces this object.
 */
export default interface Config {
    /**
     * The endpoint ships enabled (the Config base's master switch); a disabled
     * package answers every method with the refusal instead of passing
     * silently.
     */
    enabled: boolean;
    /**
     * The log root: every family ledger lives here as `<namespace>.log`.
     */
    logRoot: string;
    /**
     * The cap on any single `tail()` request, in lines.
     */
    maxLines: number;
    /**
     * The ccr log path for `stats()`.
     */
    ccrLog: string;
}
