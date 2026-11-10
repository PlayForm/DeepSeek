import { type State } from "@playform/ets-base-dsh";
export default _default;
/**
 * @module Open
 *
 * The optional storageDomain seam setup (P5).
 *
 * @remarks
 *
 * Registered once per load by Function/Attach inside a `ctx.effect`: the facility is probed via
 * `ctx.get?.("storageDomain")`; when present, the domain is declared ONCE (`defineDomain` -
 * name/version/UNIT_NAME_RE fail loud here, at setup, not on any caller path), opened, and
 * `State.Journal` is rewired from the pre-open queue to the real typed-record put; the queue is
 * drained so the events that fired before the open (always: `activated`) are not lost.
 *
 * The domain is the SHARED package_governance v2 `events` table - identical across the modules
 * (the event enum is the lifecycle vocabulary they already share, plus `normalized` - the
 * non-manifest stream family's count records; a NEW event name requires a new domain version,
 * hence v2).
 *
 * Best-effort and detached: this whole setup is awaited by nobody - the Attach effect kicks it
 * off with `void`, every failure is contained here. An ABSENT facility is a SILENT SKIP at the
 * Attach probe (no log line, no record - Open is never even called); a PRESENT facility whose
 * open fails is LOUD (the P5 v2 incident): one best-effort ledger line via Function/Append
 * (logger + the module's durable ledger file, never throws, never rethrown) - the previous silent
 * catch made a permanent open failure undiagnosable: the sink was never bound, PendingJournal was
 * never drained, and every record from every module buffered into it and died with the process.
 * The human ledger stays the complete record, the storage journal is the structured, disposable
 * one.
 *
 * THE V2 OPEN CONTRACT (the live version-mismatch finding): the domain declares
 * `layout: "per-record"` plus `compatibleVersions: [1]` - the single-layout unit parser enforces
 * EXACT version equality (a v2 open against the v1-stamped `package_governance.json` hard-fails
 * with `version-mismatch`; single layout has no migration and no `compatibleVersions`
 * consultation), while the per-record backend's legacy bootstrap migrates a v1-stamped file into
 * per-record documents when the file's version is in `compatibleVersions` - the pre-existing v1
 * records survive the bump automatically, the legacy file is left untouched, and they all
 * validate against the widened enum. `invalidRecords: "backup-and-skip"` moves one corrupt stored
 * record aside instead of letting it brick the whole open. The dynamic imports keep the optional
 * packages off the module-load path (a module-level import of an unresolvable package would crash
 * the whole bundle load - a live-verified pitfall); the type-only devDeps pin them to the
 * host-era versions.
 *
 * SHARED SINK (the live single-open-domain finding): the harness's storageDomain enforces ONE
 * open per domain name - the domain is shared across the modules, so the FIRST module whose open
 * succeeds binds the table put on the factory instance (`SharedJournal`, probed by
 * Function/Attach and passed in); every module's records then route through it (Function/Journal),
 * so a later module's `already-open` failure never loses its records.
 *
 * THE BOOT-WINDOW RACE (the pre-bind buffer): each module's apply journals its `activated` record
 * BEFORE its own Attach's Open completes, so records journaled in that pre-bind window buffer in
 * the factory-level `PendingJournal` (Function/Journal stage 2) instead of the per-State queues -
 * only the first module's open wins, so a per-State queue on a later module would never drain. On
 * SUCCESS this module drains that factory-level buffer through the sink it just bound
 * (timestamps preserved) and retires it (`PendingJournal = undefined` - the pre-bind stage is
 * over; after that, records route straight through the shared sink). The v2 domain spec's single
 * source of truth: the shared package_governance vocabulary (`EVENTS`) and open contract
 * (`DOMAIN` - name/version/layout/compatibleVersions/invalidRecords) live on the JournalService -
 * the storage journal's shape belongs to the storage service, the open mechanics stay here.
 *
 * The DOMAIN NAME (the journalDomain option): the State's JournalDomain (the `journalDomain`
 * setup option) names the domain, overriding the JournalService's shared `DOMAIN` name; the
 * fallback for a module that does not set the option is the shared "package_governance", so every
 * other consumer keeps its behavior. A distinct name (lowercase letters, digits and underscores -
 * the storage unit-name rule) keeps a module's open out of the shared domain's single-open
 * contention. The Journal routing is unchanged: post-open records still flow through the first
 * bound shared sink.
 */
declare function _default(State: State & {
    JournalDomain?: string | undefined;
}, Facility: {
    open(spec: object): Promise<{
        close(): Promise<void>;
        table(name: string): {
            put(key: string, value: unknown): Promise<void>;
        };
    }>;
}, Factory?: {
    SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
    SharedJournals?: Map<string, (Event: string, Path: string, Detail: string, At?: number) => void>;
    PendingJournal?: {
        event: string;
        path: string;
        detail: string;
        at: number;
    }[] | undefined;
}): Promise<void>;
