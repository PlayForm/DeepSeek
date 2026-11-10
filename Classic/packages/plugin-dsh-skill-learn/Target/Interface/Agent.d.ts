import type Message from "./Message.js";
/**
 * @module Agent
 *
 * The STRUCTURAL live-agent shape the review reads, and nothing more.
 *
 * @remarks
 *
 * TAKEN FROM `@deepseek-ai/dsh-agent`'s own declarations, which this package cannot
 * import (`@deepseek-ai/dsh-skill` is not installed, so the harness's skill types are
 * unavailable and every harness shape in this tree is declared structurally):
 *
 * - id - `dsh-agent/lib/types/types.d.ts:11-14` (`readonly id: SessionId`, the
 *   session-backed identity the ledger row carries as evidence)
 * - options - `dsh-agent/lib/types/runtime-types.d.ts:21-30` and `:141` (provider,
 *   model, reasoningEffort, maxTokens)
 * - session - `dsh-agent/lib/types/runtime-types.d.ts:143`
 * - status - `dsh-agent/lib/types/runtime-types.d.ts:90` (`idle` or `running`) and
 *   `:147`
 * - whenIdle - `dsh-agent/lib/types/runtime-types.d.ts:164`
 * - runMaintenance - `dsh-agent/lib/types/runtime-types.d.ts:174`
 *
 * ONLY THE MEMBERS THE PLUGIN TOUCHES ARE DECLARED. The agent has many more (send,
 * followup, steer, cancel, inbox, ctx), and none of them may appear here: a wider
 * structural face would let the review reach the live turn, and the whole design rests
 * on the review running from the true idle phase through `runMaintenance` and never
 * driving the agent.
 *
 * `runMaintenance` THROWS SYNCHRONOUSLY when a turn or another maintenance task already
 * owns the agent (`runtime-types.d.ts:165-173`), which is why the service wraps the call
 * rather than awaiting it: the synchronous throw is the `busy` outcome, and an awaited
 * rejection would arrive too late to tell the two apart.
 */
export default interface Agent {
    /**
     * The session-backed agent identity the ledger row records as evidence.
     */
    readonly id: string;
    /**
     * The route this agent's requests use; both fields may be absent.
     */
    readonly options: {
        readonly provider?: string;
        readonly model?: string;
    };
    /**
     * The live session; its derived history is the only transcript this plugin reads.
     */
    readonly session: {
        /**
         * The derived model-visible history (`dsh-session/lib/types/index.d.ts:347`),
         * projected onto the block subset the digest understands. A fresh array per
         * call whose messages are shared and deep-frozen, so a reader must copy
         * rather than mutate.
         */
        deriveMessages(): readonly Message[];
    };
    /**
     * The lifecycle state; only `idle` opens the maintenance phase.
     */
    readonly status: "idle" | "running";
    /**
     * Run one non-turn task from the true idle phase, with a signal aborted by
     * `cancel`. Throws synchronously when a turn or another task owns the agent.
     */
    runMaintenance<Result>(task: (signal: AbortSignal) => Promise<Result>): Promise<Result>;
    /**
     * Resolve after the current whole-agent activity reaches quiescence.
     */
    whenIdle(): Promise<void>;
}
