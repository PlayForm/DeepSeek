import type State from "../Interface/State.js";
export default _default;
/**
 * @module Invalidate
 *
 * The stale-validation invalidation: the Acar seam, one pass over the store.
 *
 * @remarks
 *
 * Every validation object whose declared dependencies include the key goes
 * stale, in one pass (the incremental-computation principle). A stale object is
 * never guessed back to fresh: a revalidation is a new validation object (the
 * Declare path). The return is the number of objects invalidated.
 *
 * The two callers: the fs/observed listener (the key is the changed path,
 * Function/Watch) and the service's explicit invalidate(key) - any dependency
 * key, not just a file path.
 */
declare function _default(State: State, Key: string): number;
