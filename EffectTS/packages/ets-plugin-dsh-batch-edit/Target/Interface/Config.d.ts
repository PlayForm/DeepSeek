export default interface Config {
    /** The IDLE-forever posture: the plugin ships disabled and enables only
     *  by an explicit ACTIVATE. */
    enabled: boolean;
    /** The ledger file (one log per module, the family strings contract). */
    logFile: string;
    /** Maximum open machines per agent (the planted-board capacity rule). */
    machinesPerAgent: number;
    /** Maximum op lines per commit (the tool-schema escape hatch pushes the
     *  overflow to the opfile path). */
    opsPerCommit: number;
    /** The commit's in-line deadline, capped at 120000 (the composition
     *  contract: the overflow continues as a background job). */
    deadlineMs: number;
    /** Search-not-found errors (true) vs skips (false) at commit. */
    strictMode: boolean;
    /** The advisory bash intercept (off by default in v1 - the control
     *  layer comes later as its own plugin). */
    interceptBash: boolean;
    /** Per-file check-set names (the live containers' monitor vocabulary,
     *  reused; v1 records the names on the machine, the runner is later). */
    monitorChecksets: string[];
}
