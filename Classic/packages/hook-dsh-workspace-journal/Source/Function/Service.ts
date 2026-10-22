// Service - the `workspaceJournal` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the Service base
// constructor calls ctx.reflect.provide("workspaceJournal", this), so
// `ctx.workspaceJournal` resolves). Declaration merging below gives the
// typed accessor.
//
// The methods are thin delegates (one Function module each):
//
//   open(batch, entries) - journal a batch BEFORE its writes land; throws
//                          if storage is down (no journal, no writes);
//   seal(batchId, next, reason?) - close the batch (verified |
//                          recovery-required);
//   revert(batchId)      - replay the batch backward; returns the per-file
//                          report;
//   recover()            - the boot pass: mark still-applying batches
//                          recovery-required;
//   batch(batchId)       - one batch record, or undefined;
//   batches()            - all batch records (ring order);
//   entries(batchId)     - one batch's revert data;
//   statistics()         - { batches, entries, applying }.
import { Service, type Context } from "@deepseek-ai/cordis";
import Open from "@Function/Open.js";
import * as Query from "@Function/Query.js";
import Recover from "@Function/Recover.js";
import Revert from "@Function/Revert.js";
import Seal from "@Function/Seal.js";
import type BatchRecord from "@Interface/Batch.js";
import type EntryRecord from "@Interface/Entry.js";
import type Result from "@Interface/Result.js";
import type { RecoveryReport } from "@Interface/Result.js";
import type State from "@Interface/State.js";

export default class WorkspaceJournal extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceJournal");
		this.State = State;
	}

	/** Journal a batch and its revert data BEFORE the writes land. */
	async open(
		Batch: { batchId: string; operation: string; parent?: string; files: string[] },
		Entries: {
			path: string;
			state: "present" | "absent";
			version: string;
			content: string;
		}[],
	): Promise<BatchRecord> {
		const Now = Date.now();
		const Record: BatchRecord = {
			batchId: Batch.batchId,
			operation: Batch.operation,
			parent: Batch.parent ?? "",
			state: "applying",
			files: [...Batch.files],
			progress: 0,
			reason: "",
			at: Now,
		};
		const Full: EntryRecord[] = Entries.map((Entry) => {
			const Truncated = Entry.content.length > this.State.MaxEntryBytes;
			return {
				batchId: Batch.batchId,
				path: Entry.path,
				state: Entry.state,
				version: Entry.version,
				content: Truncated ? "" : Entry.content,
				truncated: Truncated,
				at: Now,
			};
		});
		await Open(this.State, Record, Full);
		this.State.Factory.Append(this.State, `opened ${Batch.batchId} (${Full.length} files)`);
		return Record;
	}

	/** Close the batch: "verified" or "recovery-required". */
	async seal(
		BatchId: string,
		Next: "verified" | "recovery-required",
		Reason = "",
	): Promise<BatchRecord> {
		return (await Seal(this.State, BatchId, Next, Reason)) as BatchRecord;
	}

	/** Replay the batch backward; per-file report. */
	async revert(BatchId: string): Promise<Result> {
		return Revert(this.State, BatchId);
	}

	/** The boot pass: mark still-applying batches recovery-required. */
	async recover(): Promise<RecoveryReport> {
		return Recover(this.State);
	}

	/** One batch record, or undefined. */
	batch(BatchId: string): BatchRecord | undefined {
		return Query.Batch(this.State, BatchId);
	}

	/** All batch records (ring order). */
	batches(): BatchRecord[] {
		return Query.Batches(this.State);
	}

	/** One batch's revert data (its entries), file order. */
	entries(BatchId: string): EntryRecord[] {
		return Query.Entries(this.State, BatchId);
	}

	/** The statistics triple. */
	statistics(): { batches: number; entries: number; applying: number } {
		return Query.Statistics(this.State);
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-journal hook's service (registered from apply). */
		workspaceJournal: WorkspaceJournal;
	}
}
