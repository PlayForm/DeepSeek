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
}
