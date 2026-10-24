import type Entry from "@Interface/Entry.js";
import type Gate from "@Interface/Gate.js";
import type Member from "@Interface/Member.js";
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
