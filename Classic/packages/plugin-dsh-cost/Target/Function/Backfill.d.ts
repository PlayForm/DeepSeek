/**
 * @module Backfill
 *
 * The replay of the sessions that predate the plugin: each session's events are
 * pushed through the same Capture/Drain path the live listeners use, so a
 * backfilled session lands the same rows a live session would.
 *
 * @remarks
 * The walk follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 6. On
 * first run the ledger is empty and every past conversation is unpriced, so the
 * walk reads the session-history query service (probed with ctx.get - the
 * service is optional and the plugin does not inject it), reads each session's
 * events, and folds them. The Cursor table makes it resumable and idempotent: a
 * session already folded to its last event's sequence is skipped whole, and the
 * drain itself skips the events at or below the recorded sequence. The walk
 * runs only when the Config.capture.backfill gate is on, and it runs inside the
 * backfill job - never on the boot path.
 *
 * A session whose cursor is past zero was partially booked, and the in-memory
 * replay state the later events depend on (the surface buffer, the pending
 * touch sets, the per-file histories) died with the process that held it, so
 * skipping the prefix is not the same as reconstructing it (E2, A2 section
 * 1.4). The walk therefore separates two boundaries: the replay boundary is the
 * session's first event, where a replay-only drain pass rebuilds the state
 * without writing a row or moving the cursor, and the booking boundary is the
 * cursor, where the normal fold starts booking. A zero cursor means nothing was
 * booked, so the normal fold already covers the whole log and no prefix is
 * replayed.
 */
import type { DatabaseSync } from "node:sqlite";
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Database: DatabaseSync, Config: Config): () => Promise<{
    Sessions: number;
    Calls: number;
}>;
