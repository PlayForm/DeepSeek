import { Service, type Context } from "@deepseek-ai/cordis";
import type Binding from "../Interface/Binding.js";
import type Candidate from "../Interface/Candidate.js";
import type CheckResult from "../Interface/Check.js";
import type Request from "../Interface/Request.js";
import type State from "../Interface/State.js";
/**
 * @module Service
 *
 * The `workspaceApprove` service: extends the cordis Service base and is
 * REGISTERED FROM APPLY.
 *
 * @remarks
 *
 * The loader contract for the object-form plugin: apply constructs the service;
 * the Service base constructor calls ctx.reflect.provide("workspaceApprove",
 * this), so `ctx.workspaceApprove` resolves. Declaration merging below gives
 * the typed accessor.
 *
 * The methods are thin delegates (one Function module each):
 *
 * - `bind(candidate)` - register an exact candidate as pending.
 * - `approve(id, who, constraints?)` / `deny(id, who)` / `revoke(id, who)` -
 *   the human decision paths.
 * - `check(request)` - the merge/execute side's exactness check.
 * - `binding(id)` / `bindings(limit?)` / `statistics()` - the read surface.
 */
export default class WorkspaceApprove extends Service {
    /**
     * The apply-built state the methods read and write.
     */
    State: State;
    constructor(Context: Context, State: State);
    /**
     * Register an exact candidate as a pending binding.
     */
    bind(Candidate: Candidate): Binding;
    /**
     * Approve a pending binding; a changed constraint set rejects.
     */
    approve(Id: string, Who: string, Constraints?: string[]): Binding | undefined;
    /**
     * Deny a pending binding.
     */
    deny(Id: string, Who: string): Binding | undefined;
    /**
     * Revoke an approved binding.
     */
    revoke(Id: string, Who: string): Binding | undefined;
    /**
     * The exactness check for the merge/execute side.
     */
    check(Req: Request): CheckResult;
    /**
     * One binding by id, or undefined.
     */
    binding(Id: string): Binding | undefined;
    /**
     * The ring, newest first (an optional limit slices the head).
     */
    bindings(Limit?: number): Binding[];
    /**
     * The statistics triple.
     */
    statistics(): {
        bindings: number;
        byId: number;
        sequence: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The workspace-approve hook's service (registered from apply).
         */
        workspaceApprove: WorkspaceApprove;
    }
}
