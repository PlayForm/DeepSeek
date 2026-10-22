export default interface Config {
    /** The IDLE-forever switch: false means disabled, wired to nothing. */
    enabled: boolean;
    /** The hook's own KV domain name (NOT the shared package_governance one). */
    domain: string;
    /** The maximum number of live proposals (the oldest withdrawn is not
     *  enforced; a proposal is refused when the table is full). */
    maxProposals: number;
    /** The default limit for list results. */
    limitDefault: number;
    /** The hard cap for any list limit. */
    limitMaximum: number;
    /** The hook's own ledger file (one log per module). */
    logFile: string;
}
