import { Service, type Context } from "@deepseek-ai/cordis";
import type Stamp from "../Interface/Stamp.js";
import type State from "../Interface/State.js";
export default class WorkspaceObserve extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** The latest stamp for one path, or undefined. */
    stamp(Path: string): Stamp | undefined;
    /** The ring, newest first (an optional limit slices the head). */
    stamps(Limit?: number): Stamp[];
    /** The manual stamp: resolve, stat, record, ledger. */
    manual(Path: string): Promise<Stamp>;
    /** The statistics triple. */
    statistics(): {
        paths: number;
        stamps: number;
        sequence: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-observe hook's service (registered from apply). */
        workspaceObserve: WorkspaceObserve;
    }
}
