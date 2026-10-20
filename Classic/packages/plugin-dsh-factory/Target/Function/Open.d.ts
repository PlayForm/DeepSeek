import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Facility: {
    open(spec: object): Promise<{
        close(): Promise<void>;
        table(name: string): {
            put(key: string, value: unknown): Promise<void>;
        };
    }>;
}, Factory?: {
    SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
    PendingJournal?: {
        event: string;
        path: string;
        detail: string;
        at: number;
    }[] | undefined;
}): Promise<void>;
