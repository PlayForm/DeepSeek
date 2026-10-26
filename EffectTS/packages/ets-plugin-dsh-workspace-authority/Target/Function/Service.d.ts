import { Service, type Context } from "@deepseek-ai/cordis";
import type Capability from "@Interface/Capability.js";
import type Lease from "@Interface/Lease.js";
import type Residency from "@Interface/Residency.js";
import type State from "@Interface/State.js";
export default class WorkspaceAuthority extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** Grant a capability (what the actor may do). */
    grant(Spec: {
        holder: string;
        resource: string;
        operations: string[];
        expiresAt?: number | undefined;
        delegation?: "none" | "delegate";
    }): Capability | undefined;
    /** Revoke a capability (permanent). */
    revoke(Id: string): boolean;
    /** The permission judgment: does the holder hold a valid capability? */
    authorize(Holder: string, Resource: string, Operation: string): boolean;
    /** Acquire a lease (for how long). */
    acquire(Holder: string, Resource: string, Kind?: string, TtlMs?: number): Lease | undefined;
    /** Release a lease. */
    release(Id: string): boolean;
    /** Register or touch a residency record (what stays; weight ranks only). */
    residence(Resource: string, Kind: string, Weight: number): Residency | undefined;
    /** The disposition pass (keep / defer / evict / discard / promote). */
    evict(Resources?: string[]): {
        resource: string;
        disposition: string;
    }[];
    /** The counts. */
    statistics(): {
        capabilities: number;
        leases: number;
        residency: number;
        sequence: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-authority service (registered from apply). */
        workspaceAuthority: WorkspaceAuthority;
    }
}
