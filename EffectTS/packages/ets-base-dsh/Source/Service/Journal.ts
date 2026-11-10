import type State from "@Interface/State.js";
import { Context, Effect, Layer } from "effect";

import JournalFn from "../Function/Journal.js";

/**
 * @module Journal
 *
 * The P5 storage-domain service: the `Context.Service` behind the Library's
 * `Journal` method.
 *
 * @remarks
 *
 * Two halves:
 *
 * 1. `record` - the P5 storage writer. The three-stage routing (the v2
 *    per-record domain plus the routing decisions) is re-expressed as an
 *    effect body (Function/Journal.ts), wrapped in a `dsh.journal` span and
 *    `Effect.exit`-contained here: a storage failure can never reach any
 *    caller path (the listener's silence invariant, the update stage's
 *    containment). The routing stages are unchanged, in order:
 *
 *    a. Shared sink - when the factory instance's `SharedJournal` is bound
 *       (the first successful Function/Open bound it), every record routes
 *       through it - the harness's storageDomain enforces one open per
 *       domain name, so the family's shared package_governance domain is
 *       opened once and every module's records land in the one shared
 *       table.
 *    b. Pre-bind buffer - before any open has succeeded (the boot-window
 *       race), records buffer in the factory-level `PendingJournal`, capped
 *       at 256 (when full, the new record is dropped); the successful Open
 *       drains and retires it.
 *    c. Per-State fallback - the defensive default (no shared sink, buffer
 *       retired): the per-State sink (queue or retired no-op).
 *
 *    Both factory fields are read at call time through the captured factory
 *    reference - the smoke resets them between scenarios, so a captured
 *    snapshot would leak records across scenarios.
 *
 * 2. The v2 domain spec - the `events` table's vocabulary and the open
 *    contract constants live here as the service's exported data (the
 *    single source of truth for the storage journal's shape), consumed by
 *    Function/Open when it declares the domain:
 *
 *    - `EVENTS` - the enum `activated/governed/dispatched/
 *      update-failed/excluded/normalized` (the lifecycle vocabulary the
 *      modules share, plus `normalized` - the stream family's count
 *      records; a NEW event name requires a new domain version, hence v2).
 *      Order is the smoke-asserted contract.
 *    - `DOMAIN` - the v2 open contract: `name: "package_governance"`,
 *      `version: 2`, `layout: "per-record"` plus
 *      `compatibleVersions: [1]` (the legacy v1-stamped file self-migrates
 *      on the first open instead of hard-failing `version-mismatch`) and
 *      `invalidRecords: "backup-and-skip"` (one corrupt record can never
 *      brick the open).
 *
 * The human ledger stays the complete record; the storage journal is the
 * structured, disposable one.
 */
/**
 * The P5 events enum - byte-identical order, asserted by the smoke.
 */
export const EVENTS = [
	"activated",
	"governed",
	"dispatched",
	"update-failed",
	"excluded",
	"normalized",
] as const;

/**
 * The v2 open contract (see the module remarks).
 */
export const DOMAIN = {
	name: "package_governance",
	version: 2,
	layout: "per-record",
	compatibleVersions: [1],
	invalidRecords: "backup-and-skip",
} as const;

/**
 * Host - the structural slice of the factory shell the routing reads at
 * call time.
 *
 * @remarks
 *
 * The shell is a cordis Service class - not an Effect concept - so the
 * service captures the instance instead of owning its state.
 */
export interface Host {
	SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
	PendingJournal?: { event: string; path: string; detail: string; at: number }[] | undefined;
}

// Journal - the service tag.
export class Journal extends Context.Service<
	Journal,
	{
		/**
		 * The P5 storage writer (best-effort): one typed lifecycle record,
		 * routed through the three stages above, never failing.
		 */
		record(
			State: State,
			Event: string,
			Path: string,
			Detail: string,
			At?: number,
		): Effect.Effect<void>;
	}
>()("dsh.factory.Journal") {}

// The service implementation: `Layer.succeed` over a factory-bound closure
// (per factory instance - each test context gets a fresh factory, so the
// smokes stay per-scenario).
export const layer = (Factory: Host): Layer.Layer<Journal> =>
	Layer.succeed(Journal, {
		record: (State, Event, Path, Detail, At) =>
			// Exit-containment outermost (the routing body's storage failures are
			// typed errors; a defect can never escape either), the span inside.
			Effect.asVoid(
				Effect.exit(
					JournalFn(Factory, State, Event, Path, Detail, At).pipe(
						Effect.withSpan("dsh.journal", { attributes: { event: Event } }),
					),
				),
			),
	});
