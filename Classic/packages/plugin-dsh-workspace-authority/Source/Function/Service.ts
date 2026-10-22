// Service - the `workspaceAuthority` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the loader contract for
// the object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("workspaceAuthority", this), so
// `ctx.workspaceAuthority` resolves). Declaration merging below gives the
// typed accessor.
//
// The methods are thin delegates (one Function module each):
//
//   grant(spec)      - the capability: what the actor may do;
//   revoke(id)       - the capability revocation (permanent);
//   authorize(...)   - the permission judgment (pure, records only);
//   acquire(...)     - the lease: for how long (lazy expiry sweep);
//   release(id)      - the lease release;
//   residence(...)   - the residency: what stays (weight = representation);
//   evict(resources?) - the disposition pass (keep/defer/evict/discard/promote);
//   statistics()     - the counts.
import { Service, type Context } from "@deepseek-ai/cordis";
import type Capability from "@Interface/Capability.js";
import type Lease from "@Interface/Lease.js";
import type Residency from "@Interface/Residency.js";
import type State from "@Interface/State.js";

import Acquire from "./Acquire.js";
import Authorize from "./Authorize.js";
import Evict from "./Evict.js";
import Grant from "./Grant.js";
import Release from "./Release.js";
import Residence from "./Residence.js";
import Revoke from "./Revoke.js";

export default class WorkspaceAuthority extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceAuthority");
		this.State = State;
	}

	/** Grant a capability (what the actor may do). */
	grant(Spec: {
		holder: string;
		resource: string;
		operations: string[];
		expiresAt?: number | undefined;
		delegation?: "none" | "delegate";
	}): Capability | undefined {
		return Grant(this.State, Spec);
	}

	/** Revoke a capability (permanent). */
	revoke(Id: string): boolean {
		return Revoke(this.State, Id);
	}

	/** The permission judgment: does the holder hold a valid capability? */
	authorize(Holder: string, Resource: string, Operation: string): boolean {
		return Authorize(this.State, Holder, Resource, Operation);
	}

	/** Acquire a lease (for how long). */
	acquire(Holder: string, Resource: string, Kind?: string, TtlMs?: number): Lease | undefined {
		return Acquire(this.State, Holder, Resource, Kind ?? "unknown", TtlMs);
	}

	/** Release a lease. */
	release(Id: string): boolean {
		return Release(this.State, Id);
	}

	/** Register or touch a residency record (what stays; weight ranks only). */
	residence(Resource: string, Kind: string, Weight: number): Residency | undefined {
		return Residence(this.State, Resource, Kind, Weight);
	}

	/** The disposition pass (keep / defer / evict / discard / promote). */
	evict(Resources?: string[]): { resource: string; disposition: string }[] {
		return Evict(this.State, Resources);
	}

	/** The counts. */
	statistics(): { capabilities: number; leases: number; residency: number; sequence: number } {
		return {
			capabilities: this.State.Capabilities.size,
			leases: this.State.Leases.size,
			residency: this.State.Residency.size,
			sequence: this.State.Sequence,
		};
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-authority service (registered from apply). */
		workspaceAuthority: WorkspaceAuthority;
	}
}
