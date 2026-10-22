/** The three routing roles of the task-routing skill (the queue's own copy
 * of the vocabulary; the routing enforcer declares the same three). */
export type Role = "explorer" | "coder" | "planner";
/** The task-state vocabulary. */
export type TaskState = "queued" | "dispatched" | "running" | "completed" | "failed" | "interrupted";
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
}
