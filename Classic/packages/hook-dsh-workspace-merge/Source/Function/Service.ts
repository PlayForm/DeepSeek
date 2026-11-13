import { Service, type Context } from "@deepseek-ai/cordis";
import CommitFn from "@Function/Commit.js";
import PreviewFn from "@Function/Preview.js";
import * as Query from "@Function/Query.js";
import type Batch from "@Interface/Batch.js";
import type Commit from "@Interface/Commit.js";
import type Preview from "@Interface/Preview.js";
import type Record from "@Interface/Record.js";
import type State from "@Interface/State.js";
import type Statistics from "@Interface/Statistics.js";

/**
 * @module Service
 *
 * The `workspaceMerge` service: extends the cordis Service base and is
 * REGISTERED FROM APPLY (the loader contract for the object-form plugin).
 * Declaration merging below gives the typed accessor.
 *
 * @remarks
 *
 * The methods are thin delegates (one Function module each):
 *
 *   preview(batch)     - the gates + digest, no write;
 *   commit(batch)      - the gates + the per-file commits;
 *   batch(id)          - one recorded batch or undefined;
 *   batches()          - all recorded batches;
 *   statistics()       - the honest counts.
 *
 * THE CALL-TIME MASTER SWITCH: the commit path reads State.On at the moment
 * of the call and answers the `rejected` commit reply with ZERO ledger lines
 * while the hook is disabled (Function/Commit; the live-flip law - a
 * volatile flip acts on the very next call). The read paths answer from the
 * state and write nothing, so they need no flag.
 */
export default class WorkspaceMerge extends Service {
	/**
	 * The apply-built state the methods read and write.
	 */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceMerge");
		this.State = State;
	}

	/**
	 * The gates + digest, no write.
	 */
	preview(Batch: Batch): Promise<Preview> {
		return PreviewFn(this.State, Batch);
	}

	/**
	 * The gates + the per-file commits.
	 */
	commit(Batch: Batch): Promise<Commit> {
		return CommitFn(this.State, Batch);
	}

	/**
	 * One recorded batch by id, or undefined.
	 */
	batch(Id: string): Record | undefined {
		return Query.One(this.State, Id);
	}

	/**
	 * All recorded batches.
	 */
	batches(): Record[] {
		return Query.All(this.State);
	}

	/**
	 * The honest statistics.
	 */
	statistics(): Statistics {
		return Query.Statistics(this.State);
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/**
		 * The workspace-merge hook's service (registered from apply).
		 */
		workspaceMerge: WorkspaceMerge;
	}
}
