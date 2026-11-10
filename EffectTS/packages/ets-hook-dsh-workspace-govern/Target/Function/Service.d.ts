import { Service, type Context } from "@deepseek-ai/cordis";
import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
/**
 * @module Service
 *
 * The `workspaceGovern` service: extends the cordis Service base and is
 * registered from apply.
 *
 * @remarks
 *
 * REGISTERED FROM APPLY (the loader contract for the object-form plugin:
 * apply constructs the service; the Service base constructor calls
 * ctx.reflect.provide("workspaceGovern", this), so `ctx.workspaceGovern`
 * resolves). Declaration merging below gives the typed accessor.
 *
 * The methods are thin delegates (one Function module each):
 *
 *   gate(proposal)   - run the four independent means-checks and return the
 *                      gate decision (the same Decide path the waterfall
 *                      uses; the proposals become the effects ONLY through
 *                      the gates, and this method is that gate for any
 *                      consumer that holds a proposal record);
 *   decisions(limit) - the decision ring, newest first;
 *   statistics()     - { decisions, sequence }.
 */
export default class WorkspaceGovern extends Service {
    /**
     * The apply-built state the methods read and write.
     */
    State: State;
    /**
     * The ledger sink the gate writes through.
     */
    Append: (Message: string) => void;
    constructor(Context: Context, State: State, Append: (Message: string) => void);
    /**
     * Run the gate on one proposal record.
     */
    gate(Proposal_: Proposal): Decision;
    /**
     * The decision ring, newest first (an optional limit slices the head).
     */
    decisions(Limit?: number): Decision[];
    /**
     * The statistics pair.
     */
    statistics(): {
        decisions: number;
        sequence: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The workspace-govern hook's service (registered from apply).
         */
        workspaceGovern: WorkspaceGovern;
    }
}
