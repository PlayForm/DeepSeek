export default _default;
/**
 * @module Projection
 *
 * The queue projection (Function/Projection, BATCH-STATE-PLUGIN section 7.2
 * item 3): the compiled schedule the board renders.
 *
 * @remarks
 *
 * The queue service (plugin-dsh-queue, registered as `dshQueue`) already
 * compiles its own line - `QUEUE: <n> pending - next: <id|none> - running:
 * <m>/<limit> (main seats <n>)` - so the board projects THAT line verbatim
 * instead of re-deriving the seats: one source of truth, no drift.
 * READ-ONLY: the queue package is never modified and nothing is written
 * into it.
 *
 * The probe is at use time (the family's optional-service rule): the queue
 * ships disabled independently, so an absent service is `null` - the honest
 * silence, and the compiled block simply does not speak about the queue.
 */
declare function _default(Context: unknown): string | null;
