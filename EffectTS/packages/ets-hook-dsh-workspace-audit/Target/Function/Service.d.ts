import { Service, type Context } from "@deepseek-ai/cordis";
import type Line from "@Interface/Line.js";
import type State from "@Interface/State.js";
export default class WorkspaceAudit extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** Record one line of the traceability graph. */
    line(Input: {
        operation: string;
        parent?: string;
        category: Line["category"];
        path?: string;
        outcome?: Line["outcome"];
        assessment?: string;
    }): Line;
    /** Close the loop: the IntentAssessment line for one operation, recording
     *  whether its IntentSpecification was satisfied. */
    assessment(Operation: string, Satisfied: boolean, Detail?: string): Line;
    /** One operation's audit chain, in recording order. */
    chain(Operation: string): Line[];
    /** The ring, newest first (an optional limit slices the head). */
    lines(Limit?: number): Line[];
    /** The statistics triple. */
    statistics(): {
        operations: number;
        lines: number;
        sequence: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-audit hook's service (registered from apply). */
        workspaceAudit: WorkspaceAudit;
    }
}
