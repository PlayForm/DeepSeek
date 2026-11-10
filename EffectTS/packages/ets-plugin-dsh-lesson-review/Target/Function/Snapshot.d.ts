/**
 * @module Snapshot
 *
 * The live-session projection: the ONE integration seam of this package, and the only module
 * that reads a harness object it does not own.
 *
 * @remarks
 * THE CONTRACT IS "MESSAGES IN", NOT "SESSION OUT". The service's `Review`
 * takes a snapshot (Interface/Review), exactly like the Hermes fork takes
 * `messages_snapshot`; this module is the adapter that produces one from a
 * live agent. Keeping the adapter separate means:
 *
 * - the review, the digest, the parse, the judge and the apply are all
 *   testable without a session (the smokes pass literal snapshots), and
 * - the harness-specific read is confined to one guarded function, so a
 *   projection shape that changes upstream cannot take the review down.
 *
 * THE SURFACE READ IS PROBED, NOT ASSUMED (SCHEME §6): the harness exposes the
 * ordered surface over a session's event log, and this package has not
 * verified the accessor names against a live host. Each candidate is tried in
 * order and every read is guarded; an empty result is NOT an error - the
 * caller reports `unavailable` and the ledger says why, which is strictly
 * better than reviewing a transcript the reviewer invented.
 *
 * A message's text is read from its content blocks: `text` blocks join, and
 * every other block type is named rather than stringified (a tool-call block
 * stringified into a digest is noise the reviewer would treat as prose).
 */
import type { ReviewMessage } from "../Interface/Review.js";
export default _default;
declare function _default(Agent: unknown): ReviewMessage[];
