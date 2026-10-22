import { Service, type Context } from "@deepseek-ai/cordis";
import type State from "@Interface/State.js";
import type { TruthKind } from "@Interface/TruthKind.js";
import type Validation from "@Interface/Validation.js";
export default class WorkspaceEvidence extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** Record one validation object (a revalidation supersedes the old). */
    validate(Id: string, Kind: TruthKind, Subject: string, Dependencies: string[], Verdict?: "verified" | "unverified"): Validation;
    /** The object's current status, or undefined for an unknown id. */
    check(Id: string): Validation["status"] | undefined;
    /** The Acar seam: mark every object depending on the key stale. */
    invalidate(Key: string): number;
    /** The objects, optionally filtered by status, oldest first. */
    list(Status?: Validation["status"]): Validation[];
    /** The statistics pentuple. */
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
        /** The workspace-evidence service (registered from apply). */
        workspaceEvidence: WorkspaceEvidence;
    }
}
