import type Dispatcher from "../Function/Dispatcher.js";
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type Task from "./Task.js";
export default interface State extends Shared {
    /** Master switch (config `enabled`, volatile) - false = full passthrough. */
    On: boolean;
    /** The capacity model (config `capacity`, volatile): main pool / child cap. */
    Capacity: {
        main: number;
        child: number;
    };
    /** Whether a freed slot triggers an automatic dispatch (volatile). */
    AutoDispatch: boolean;
    /** Whether the dispatch consults the routing enforcer (volatile). */
    RoutedDispatch: boolean;
    /** The injected factory service itself (the ledger + the journal) - set
     * once in Apply. */
    Factory: Factory;
    /** The queue store: insertion-ordered by enqueue sequence (the FIFO
     * tiebreaker is the Map's insertion order). */
    Tasks: Map<string, Task>;
    /** The monotonic counters: the id sequence and the enqueue sequence. */
    Seq: number;
    /** The seat bookkeeping: active (dispatched or running) tasks per agent
     * id; the key `main` is the main conversation's pool. */
    Seats: Map<string, number>;
    /** The registered service itself, set once in Apply (the tools read the
     * queue through it). */
    DshQueue?: Dispatcher | undefined;
}
