import { Service, type Context } from "@deepseek-ai/cordis";
import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
export default class WorkspaceGovern extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    /** The ledger sink the gate writes through. */
    Append: (Message: string) => void;
    constructor(Context: Context, State: State, Append: (Message: string) => void);
    /** Run the gate on one proposal record. */
    gate(Proposal_: Proposal): Decision;
    /** The decision ring, newest first (an optional limit slices the head). */
    decisions(Limit?: number): Decision[];
    /** The statistics pair. */
    statistics(): {
        decisions: number;
        sequence: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-govern hook's service (registered from apply). */
        workspaceGovern: WorkspaceGovern;
    }
}
