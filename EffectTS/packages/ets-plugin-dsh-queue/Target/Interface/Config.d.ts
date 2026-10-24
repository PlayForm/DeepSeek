import type { Allowlist } from "@playform/ets-plugin-dsh-factory";
export default interface Config {
    /** Master switch. Shipped false (the IDLE-forever posture). */
    enabled: boolean;
    /** The durable ledger toggle (the factory's shared field). */
    log: boolean;
    /** The plugin's own ledger file (one log per module). */
    logFile: string;
    /** The user's capacity model (the law): the MAIN conversation's pool and
     * the per-agent child cap (the two-active regime). */
    capacity: {
        main: number;
        child: number;
    };
    /** Whether the dispatcher automatically re-dispatches on a freed slot
     * (the settled IDLE children release their active slots). */
    autoDispatch: boolean;
    /** Whether the dispatcher consults the routing enforcer for the routed
     * dispatch (the service is probed at dispatch time; absent = skip). */
    routedDispatch: boolean;
    /** Whether an assignment actually STARTS a subagent through the harness's
     * `ctx.subagents` service. Shipped false (the approval posture: a spawn is
     * a privileged action). False = the manual posture: assign and ledger
     * only. */
    autoSpawn: boolean;
    /** The harness subagent provider selected by name at spawn time
     * (`spawn` = the in-process backend's default registration). */
    spawnProvider: string;
    /** The per-action allowlist (D6): the OUTER gate in front of `autoSpawn`.
     * The shared factory block - `spawn` defaults to `approve`, so an
     * assignment waits for the user even with the knob on. A resolved pack's
     * `policy` section overrides it per action. */
    policy: Allowlist;
}
