import type Message from "./Message.js";
export default interface Agent {
    /** The session-backed agent identity the ledger row records as evidence. */
    readonly id: string;
    /** The route this agent's requests use; both fields may be absent. */
    readonly options: {
        readonly provider?: string;
        readonly model?: string;
    };
    /** The live session; its derived history is the only transcript this plugin reads. */
    readonly session: {
        /**
         * The derived model-visible history (`dsh-session/lib/types/index.d.ts:347`),
         * projected onto the block subset the digest understands. A fresh array per
         * call whose messages are shared and deep-frozen, so a reader must copy
         * rather than mutate.
         */
        deriveMessages(): readonly Message[];
    };
    /** The lifecycle state; only `idle` opens the maintenance phase. */
    readonly status: "idle" | "running";
    /**
     * Run one non-turn task from the true idle phase, with a signal aborted by
     * `cancel`. Throws synchronously when a turn or another task owns the agent.
     */
    runMaintenance<Result>(task: (signal: AbortSignal) => Promise<Result>): Promise<Result>;
    /** Resolve after the current whole-agent activity reaches quiescence. */
    whenIdle(): Promise<void>;
}
