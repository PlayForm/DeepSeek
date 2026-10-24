/** The three routing roles of the task-routing skill (the queue's own copy
 * of the vocabulary; the routing enforcer declares the same three). */
export type Role = "explorer" | "coder" | "planner";
/** The task-state vocabulary. */
export type TaskState = "queued" | "dispatched" | "running" | "completed" | "failed" | "interrupted";
/** The child route the spawn passes as `agentOptions` (the harness's
 * AgentOptions vocabulary: provider / model / reasoningEffort). */
export interface AgentRoute {
    provider: string;
    model: string;
    reasoningEffort: string;
}
export default interface Task {
    /** The queue id, assigned at enqueue time (`queue-<n>`, monotonic). */
    id: string;
    /** The full self-contained prompt. The queue never alters it. */
    spec: string;
    /** The declared task type, when the enqueuer declares one (undefined =
     * the routing's keyword inference decides at dispatch). */
    role?: Role | undefined;
    /** Higher priority dispatches first (dependencies still win). */
    priority: number;
    /** The ids of the tasks that must be completed before this one. */
    dependsOn: string[];
    /** The lifecycle state. */
    state: TaskState;
    /** The agent id this task is assigned to (set at dispatch). */
    assignedAgent?: string | undefined;
    /** The result hash, set at completion (the adjudication's key). */
    resultHash?: string | undefined;
    /** The monotonic enqueue sequence (the FIFO tiebreaker). */
    seq: number;
    /** When the task was enqueued (epoch ms). */
    queuedAt: number;
    /** When the task was dispatched (epoch ms; undefined while queued). */
    dispatchedAt?: number | undefined;
    /** The route the dispatch resolved for this task, when the routing
     * enforcer was present at dispatch time (the routed dispatch). */
    route?: string | undefined;
    /** The resolved route in the harness's launch form (the spawn's
     * `agentOptions`); absent when the dispatch was unrouted. */
    agentOptions?: AgentRoute | undefined;
    /** The harness child the spawn started (`startActivation`'s childId);
     * absent until a spawn succeeded. The restart reconcile checks exactly
     * this id against the live agent registry. */
    childId?: string | undefined;
    /** How many reconciles already requeued this task (one requeue, then an
     * honest failure - the task's work is not retried forever). */
    attempts: number;
}
