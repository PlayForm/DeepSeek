import type { Log } from "@Function/Render.js";
import type { MonitorRecord } from "@Interface/Events.js";
import type State from "@Interface/State.js";
/** The record write path (best-effort, never on a caller path): through the
 * bound sink when the domain is open, else buffered in the pre-bind queue. */
export declare const Record: (State: State, Entry: MonitorRecord) => void;
export default _default;
/** Open the monitor domain (best-effort, never awaited by the caller). The
 * facility shape is the factory's structural view: only `open` is consumed;
 * the handle's `close` is kept on State for the effect's disposer. */
declare function _default(State: State, Facility: {
    open(spec: object): Promise<{
        close(): Promise<void>;
        table(name: string): {
            put(key: string, value: unknown): Promise<void>;
            entries(): IterableIterator<[string, unknown]>;
        };
    }>;
}, Append: Log): Promise<void>;
