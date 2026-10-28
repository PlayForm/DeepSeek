import { Service, type Context } from "@deepseek-ai/cordis";
import type Batch from "../Interface/Batch.js";
import type Commit from "../Interface/Commit.js";
import type Preview from "../Interface/Preview.js";
import type Record from "../Interface/Record.js";
import type State from "../Interface/State.js";
import type Statistics from "../Interface/Statistics.js";
export default class WorkspaceMerge extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** The gates + digest, no write. */
    preview(Batch: Batch): Promise<Preview>;
    /** The gates + the per-file commits. */
    commit(Batch: Batch): Promise<Commit>;
    /** One recorded batch by id, or undefined. */
    batch(Id: string): Record | undefined;
    /** All recorded batches. */
    batches(): Record[];
    /** The honest statistics. */
    statistics(): Statistics;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-merge hook's service (registered from apply). */
        workspaceMerge: WorkspaceMerge;
    }
}
