/**
 * @module Board
 *
 * The queue's state as ONE compiled TOC line, pre-baked into the
 * orchestration layer's context block.
 *
 * @remarks
 * Section 2.4, the batch-state integration. Byte-stable template:
 *
 * QUEUE: <n> pending - next: <id|none> - running: <m>/<limit>
 *
 * The parent-bound visibility rule (the ORCHESTRATION-FAMILY's table): the
 * orchestrator's view carries the full line; an agent's own view is its own
 * task only, which the compiler derives from the snapshot, not from here.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State): string;
