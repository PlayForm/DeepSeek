import { Service, type Context } from "@deepseek-ai/cordis";
import type Line from "../Interface/Line.js";
import type State from "../Interface/State.js";
/**
 * @module Service
 *
 * The `workspaceAudit` service: extends the cordis Service base and is
 * REGISTERED FROM APPLY, so `ctx.workspaceAudit` resolves.
 *
 * @remarks
 *
 * Declaration merging below gives the typed accessor. The methods are thin
 * delegates (one Function module each):
 *
 * - line(input) - record any traceability-graph node's line;
 * - assessment(operation, verdict) - close the loop: the IntentAssessment
 *   line against the IntentSpecification's satisfaction contract;
 * - chain(operation) - one operation's lines, in order;
 * - lines(limit?) - the ring, newest first;
 * - statistics() - { operations, lines, sequence }.
 */
export default class WorkspaceAudit extends Service {
    /**
     * The apply-built state the methods read and write.
     */
    State: State;
    constructor(Context: Context, State: State);
    /**
     * Record one line of the traceability graph.
     */
    line(Input: {
        operation: string;
        parent?: string;
        category: Line["category"];
        path?: string;
        outcome?: Line["outcome"];
        assessment?: string;
    }): Line;
    /**
     * Close the loop: the IntentAssessment line for one operation, recording
     * whether its IntentSpecification was satisfied.
     */
    assessment(Operation: string, Satisfied: boolean, Detail?: string): Line;
    /**
     * One operation's audit chain, in recording order.
     */
    chain(Operation: string): Line[];
    /**
     * The ring, newest first (an optional limit slices the head).
     */
    lines(Limit?: number): Line[];
    /**
     * The statistics triple.
     */
    statistics(): {
        operations: number;
        lines: number;
        sequence: number;
    };
}
/**
 * Declaration merging: the typed accessor on the cordis Context.
 */
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The workspace-audit hook's service (registered from apply).
         */
        workspaceAudit: WorkspaceAudit;
    }
}
