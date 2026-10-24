// Service - the `workspaceContext` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the loader contract for
// the object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("workspaceContext", this), so
// `ctx.workspaceContext` resolves). Declaration merging below gives the
// typed accessor.
//
// The methods are thin delegates (one Function module each):
//
//   packet(query)     - the orientation packet, served through the bounded
//                       memo (Function/Cached; the trace's graph/invalidated
//                       clears it) and built by Function/Packet on a miss;
//   lenses()          - the available lens names;
//   focusOf(caller)   - the caller's tracked focus, or undefined;
//   statistics()      - { packets, clamped, stale, budget }.
import { Service, type Context } from "@deepseek-ai/cordis";
import Cached from "@Function/Cached.js";
import type Packet from "@Interface/Packet.js";
import type Query from "@Interface/Query.js";
import type State from "@Interface/State.js";

export default class WorkspaceContext extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceContext");
		this.State = State;
	}

	/** The orientation packet for one query (memoized; invalidated by the trace). */
	packet(Query_: Query): Packet {
		return Cached(this.State, Query_);
	}

	/** The available lens names (config `lenses`). */
	lenses(): string[] {
		return [...this.State.Lenses];
	}

	/** The caller's tracked focus, or undefined. */
	focusOf(Caller: string): { id: string; version: string } | undefined {
		return this.State.Focus.get(Caller);
	}

	/** The service statistics. */
	statistics(): {
		packets: number;
		clamped: number;
		stale: number;
		budget: { target: number; maximum: number };
	} {
		return {
			packets: this.State.Packets,
			clamped: this.State.Clamped,
			stale: this.State.Stale,
			budget: {
				target: this.State.BudgetTokens,
				maximum: this.State.BudgetMaximum,
			},
		};
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-context service (registered from apply). */
		workspaceContext: WorkspaceContext;
	}
}
