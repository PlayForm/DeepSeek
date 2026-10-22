import type FactoryHandle from "./Factory.js";
import type Member from "./Member.js";
import type { State as Base } from "@playform/plugin-dsh-factory";
interface Extra {
    /** The master switch (config `enabled` - the IDLE-forever posture). */
    On: boolean;
    /** Config `batch` - the batch key (multi-batch isolation; volatile). */
    Batch: string;
    /** Config `stateFile` - the well-known JSON state file (volatile). */
    StateFile: string;
    /** Config `maxRecent` - the completions ring bound (volatile). */
    MaxRecent: number;
    /** The injected factory instance (the State builder, the ledger). */
    Factory: FactoryHandle;
    /** The live members, keyed by the agent id. */
    Members: Map<string, Member>;
    /** The idle queue, in order (the member ids). Named IdleQueue to stay
     *  clear of the factory's shared pre-open journal `Queue` field. */
    IdleQueue: string[];
    /** The completions ring, newest first, bounded by MaxRecent. */
    Recent: {
        id: string;
        status: string;
        task: string;
        at: number;
    }[];
}
export default interface State extends Base, Extra {
}
export {};
