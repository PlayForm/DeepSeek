import { Service, type Context } from "@deepseek-ai/cordis";
import type Filter from "../Interface/Filter.js";
import type Outcome from "../Interface/Outcome.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
import type Statistics from "../Interface/Statistics.js";
/**
 * @module Service
 *
 * The `workspaceOperate` service: extends the cordis Service base and is
 * REGISTERED FROM APPLY.
 *
 * @remarks
 *
 * This is the loader contract for the object-form plugin: apply constructs
 * the service; the Service base constructor calls
 * ctx.reflect.provide("workspaceOperate", this), so `ctx.workspaceOperate`
 * resolves. Declaration merging below gives the typed accessor.
 *
 * The methods are thin delegates (one Function module each):
 *
 *   proposeRename(input) / proposeConnect(input) / proposeReplace(input)
 *                          - the resolution rules + the refusal-to-guess;
 *   list(filter?)          - the filtered proposal table;
 *   get(id)                - one proposal or undefined;
 *   withdraw(id)           - mark one proposal withdrawn;
 *   statistics()           - the honest counts.
 */
export default class WorkspaceOperate extends Service {
    /**
     * The apply-built state the methods read and write.
     */
    State: State;
    constructor(Context: Context, State: State);
    /**
     * Propose a rename through the resolution rules.
     */
    proposeRename(Input: unknown): Promise<Outcome>;
    /**
     * Propose a connect through the resolution rules.
     */
    proposeConnect(Input: unknown): Promise<Outcome>;
    /**
     * Propose a replace through the resolution rules.
     */
    proposeReplace(Input: unknown): Promise<Outcome>;
    /**
     * The filtered proposal table.
     */
    list(Filter?: Filter): Proposal[];
    /**
     * One proposal by id, or undefined.
     */
    get(Id: string): Proposal | undefined;
    /**
     * Mark one proposal withdrawn.
     */
    withdraw(Id: string): boolean;
    /**
     * The honest statistics.
     */
    statistics(): Statistics;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The workspace-operate hook's service (registered from apply).
         */
        workspaceOperate: WorkspaceOperate;
    }
}
