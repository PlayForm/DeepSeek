/**
 * @module Storage
 *
 * The P5-style monitor-domain open, the record sink and the recovery load
 * (the FILE-MONITOR design section 1, the factory's plugin-dsh-factory
 * `Function/{Open,Attach}.ts` pattern).
 *
 * @remarks
 * THE DOMAIN: a NEW storage domain `live_containers_monitors` (version 1,
 * layout per-record, invalidRecords backup-and-skip, ONE table `checks`).
 * NOT extension records in the shared `package_governance` domain: the v2
 * open contract (a NEW event name requires a new domain version) would force
 * a `package_governance` v3 bump whose blast radius is the whole governance
 * family (the single-layout parser enforces EXACT version equality). A new
 * domain name has no collision (the harness enforces ONE open per domain
 * NAME) and the plugin owns its record schema.
 *
 * Best-effort and detached, exactly like the factory's P5 arm: the open is
 * kicked off from the plugin's own effect with `void`, every failure is
 * contained here. An ABSENT facility is a SILENT SKIP (no log line, no
 * record; the pre-bind queue is dropped and the sink retired - after a
 * restart the bands degrade to `not run yet`, never a fabricated clean). A
 * PRESENT facility whose open fails is LOUD: one best-effort ledger line
 * `monitors storage open failed: <reason>` (the P5 v2 incident posture,
 * never rethrown).
 *
 * THE RECOVERY (once, on mount, before the first band render): the loaded
 * records rebuild the monitor set - the newest monitor-check record per
 * (path, agent, check set) becomes the entry's recovered check, the enrolled
 * records rebuild the enrollment (a file enrolled before the restart stays
 * enrolled), and every loaded entry logs `monitor recovered <path> (<n>
 * checks)`. When the read surface is absent or fails: no recovery - the
 * bands render `not run yet` (honesty, never fabrication).
 */
import type { Log } from "./Render.js";
import type { MonitorRecord } from "../Interface/Events.js";
import type State from "../Interface/State.js";
/** The record write path (best-effort, never on a caller path): through the
 * bound sink when the domain is open, else buffered in the pre-bind queue. */
export declare const Record: (State: State, Entry: MonitorRecord) => void;
export default _default;
/** Open the monitor domain (best-effort, never awaited by the caller). The
 * facility shape is the factory's structural view: only `open` is consumed;
 * the handle's `close` is kept on State for the effect's disposer. */
declare function _default(State: State, Facility: {
    open(spec: object): Promise<{
        close(): Promise<void>;
        table(name: string): {
            put(key: string, value: unknown): Promise<void>;
            entries(): IterableIterator<[string, unknown]>;
        };
    }>;
}, Append: Log): Promise<void>;
