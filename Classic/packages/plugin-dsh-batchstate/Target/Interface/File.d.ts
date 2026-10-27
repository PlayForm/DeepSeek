import type Entry from "./Entry.js";
import type Gate from "./Gate.js";
import type Member from "./Member.js";
export default interface File {
    /** The members, keyed by agent id once restored. */
    members: Member[];
    /** The idle queue (member ids, in order). */
    queue: string[];
    /** The spliced batch proposals (the board's memory). */
    proposals: Entry[];
    /** The arbiter gates (the Gates block's truth). */
    gates: Gate[];
}
