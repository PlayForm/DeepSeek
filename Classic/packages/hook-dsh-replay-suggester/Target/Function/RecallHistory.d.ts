import type Entry from "@Interface/Entry.js";
import type { ReplayRecord } from "@Interface/History.js";
export default _default;
declare function _default(
/** The entries, newest first (an agent's ring or the durable mirror). */
Entries: Entry[], 
/** The current call's probe. */
Probe: string, 
/** The current call's path ("" when the call names none). */
Path: string, 
/** The episode radius (config `learnWindow`, volatile). */
Window: number, 
/** The sequence fence: only entries STRICTLY older than this are prior. */
Before: number): ReplayRecord | undefined;
