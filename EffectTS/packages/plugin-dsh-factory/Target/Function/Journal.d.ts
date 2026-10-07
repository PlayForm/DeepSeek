import { Effect } from "effect";
import type State from "../Interface/State.js";
export default _default;
declare function _default(Factory: {
    SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
    PendingJournal?: {
        event: string;
        path: string;
        detail: string;
        at: number;
    }[] | undefined;
}, State: State, Event: string, Path: string, Detail: string, At?: number): Effect.Effect<void, unknown>;
