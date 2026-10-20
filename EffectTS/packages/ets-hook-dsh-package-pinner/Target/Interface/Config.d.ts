export default interface Config {
    /** Factory shared field: ledger enabled — write the durable log file. */
    log: boolean;
    /** Factory shared field: ledger file (SEPARATE from the governor's). */
    logFile: string;
    /** Factory shared field: cooldown between update-stage dispatches — the
     *  pinner never reads it (no update stage); included for family parity. */
    updateCooldownMs: number;
    /** Factory shared field: actor tool names whose fs/observed events trigger
     *  pinning. */
    mutationTools: string[];
    /** Factory shared field: global pin-policy.json; empty means discovery +
     *  built-in default. */
    policyFile: string;
    /** Dependency sections the pinner may rewrite (each must hold an object). */
    sections: string[];
    /** Factory shared field: excluded path segments (anywhere mode,
     *  exclusion-first). */
    exclude: string[];
}
