import type Snapshot from "../Interface/Snapshot.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Snapshot
 *
 * The loadAll read: rebuild the full node and edge lists from the open domain's stored
 * records when the handle exists, else from the in-memory mirror.
 *
 * @remarks
 *
 * Every record is re-validated (`IsRecord`); a record that fails validation is skipped and
 * counted (`State.Invalid`), never guessed. The `__meta` record is never mistaken for a file
 * record.
 */
declare function _default(StateRef: State): Snapshot;
