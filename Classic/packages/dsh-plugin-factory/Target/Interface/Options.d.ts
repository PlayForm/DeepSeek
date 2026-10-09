export default interface Options {
    /** The module identity — doubles as the logger/ledger prefix. */
    module: string;
    /** StateKey → configKey map of module-specific fields to copy. */
    fields?: Record<string, string> | undefined;
    /** The policy sidecar file name for union discovery (State.PolicyName). */
    policyFileName?: string | undefined;
}
