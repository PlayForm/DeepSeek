import { Service, type Context } from "@deepseek-ai/cordis";
import type State from "../Interface/State.js";
import type { TruthKind } from "../Interface/TruthKind.js";
import type Validation from "../Interface/Validation.js";
/**
 * @module Service
 *
 * The `workspaceEvidence` service: a thin delegate class over the Function
 * modules of the evidence plugin.
 *
 * @remarks
 *
 * Extends the cordis Service base and is REGISTERED FROM APPLY (the loader
 * contract for the object-form plugin: apply constructs the service; the
 * Service base constructor calls ctx.reflect.provide("workspaceEvidence",
 * this), so `ctx.workspaceEvidence` resolves). Declaration merging below
 * gives the typed accessor.
 *
 * The methods are thin delegates (one Function module each):
 *
 * - validate(id, kind, subject, dependencies, verdict?) - record one
 *   validation object (the claim's proof record; a revalidation supersedes
 *   the old object);
 * - check(id) - the object's current status or undefined;
 * - invalidate(key) - the Acar seam: mark every object depending on the key
 *   stale (explicit form of the fs/observed seam);
 * - list(status?) - the objects, optionally filtered by status;
 * - statistics() - { validations, fresh, stale, superseded, sequence }.
 */
export default class WorkspaceEvidence extends Service {
    /**
     * The apply-built state the methods read and write.
     */
    State: State;
    constructor(Context: Context, State: State);
    /**
     * Record one validation object (a revalidation supersedes the old).
     */
    validate(Id: string, Kind: TruthKind, Subject: string, Dependencies: string[], Verdict?: "verified" | "unverified"): Validation;
    /**
     * The object's current status, or undefined for an unknown id.
     */
    check(Id: string): Validation["status"] | undefined;
    /**
     * The Acar seam: mark every object depending on the key stale.
     */
    invalidate(Key: string): number;
    /**
     * The objects, optionally filtered by status, oldest first.
     */
    list(Status?: Validation["status"]): Validation[];
    /**
     * The statistics pentuple.
     */
    statistics(): {
        validations: number;
        fresh: number;
        stale: number;
        superseded: number;
        sequence: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The workspace-evidence service (registered from apply).
         */
        workspaceEvidence: WorkspaceEvidence;
    }
}
