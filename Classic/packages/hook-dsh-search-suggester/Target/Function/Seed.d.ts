import type Projection from "../Interface/Projection.js";
import type { Intent, Knowledge } from "../Interface/Execution.js";
export default _default;
declare function _default(
/** The loaded (or cold) knowledge, mutated in place. */
Knowledge: Knowledge, 
/** The built-in pack's intents (the seed source). */
Pack: Intent[], 
/** The graph projection when one was available at load. */
Projection: Projection | undefined, 
/** The epoch-seconds timestamp recorded on every seeded row. */
At: number): number;
