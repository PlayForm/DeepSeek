import type State from "../Interface/State.js";
import { type Envelope } from "@playform/lib-dsh-trace";
export default _default;
/**
 * @module Consume
 *
 * The graph's trace consumer: the INCREMENTAL wiring that keeps a populated graph current, now
 * driven by the family's bus instead of a direct `ctx.root.on("fs/observed")` registration (D5).
 *
 * @remarks
 *
 * It consumes `observe/stamp` and applies the same filter chain the `fs/observed` listener
 * applied:
 *
 * - a disabled graph (`enabled=false`) does nothing - the LIVE disabled posture (the adapter
 *   is wired on every mount; the consumer reads `State.On` at the moment of the event);
 * - a foreign envelope or a malformed payload is caught and ledgered with the module's existing
 *   `failed <path> (<reason>)` line;
 * - a path matching an EXCLUDE pattern is ignored before any work;
 * - an ABSENT stamp (version "absent") has no file to index: the stale record stays until
 *   `removeFile`, but the graph tells the consumers the path's record is no longer trustworthy
 *   (`graph/invalidated`, reason "absent") - never a guessed re-index;
 * - every accepted stamp is coalesced into the detached loop keyed by the library's coalescing
 *   key (the payload's path): N rapid stamps for one path produce ONE re-index, no timer, and
 *   `State.Flush` is the loop's flush promise so a smoke can await it deterministically.
 *
 * Only a real re-index ledgers a line, and that line is the re-index's own
 * (`reindexed <path> (<status>)`).
 */
declare function _default(StateRef: State, Envelope: Envelope): void;
