// Service - the `workspaceObserve` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the loader contract for
// the object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("workspaceObserve", this), so
// `ctx.workspaceObserve` resolves). Declaration merging below gives the
// typed accessor.
//
// The methods are thin delegates (one Function module each):
//
//   stamp(path)         - the latest stamp for the path, or undefined;
//   stamps(limit?)      - the ring, newest first (optional limit);
//   manual(path)        - resolve through ctx.fs, stat for the version,
//                         record with origin "manual", ledger (async);
//   statistics()        - { paths, stamps, sequence }.
import { Service, type Context } from "@deepseek-ai/cordis";
import Manual from "@Function/Manual.js";
import * as Query from "@Function/Query.js";
import type Stamp from "@Interface/Stamp.js";
import type State from "@Interface/State.js";

export default class WorkspaceObserve extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceObserve");
		this.State = State;
	}

	/** The latest stamp for one path, or undefined. */
	stamp(Path: string) {
		return Query.Latest(this.State, Path);
	}

	/** The ring, newest first (an optional limit slices the head). */
	stamps(Limit?: number) {
		return Query.Ring(this.State, Limit);
	}

	/** The manual stamp: resolve, stat, record, ledger. */
	manual(Path: string): Promise<Stamp> {
		return Manual(this.State, Path);
	}

	/** The statistics triple. */
	statistics(): { paths: number; stamps: number; sequence: number } {
		return Query.Statistics(this.State);
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-observe hook's service (registered from apply). */
		workspaceObserve: WorkspaceObserve;
	}
}
