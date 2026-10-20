// Journal — the P5 storage-domain writer (Function/Journal in the service
// API): appends ONE typed lifecycle record to the optional storage journal.
// The call sites are the module's lifecycle events: activated, excluded,
// governed/pinned, dispatched, update-failed. Purely best-effort: the sink
// is one of the three routing stages below, and this wrapper guarantees a
// storage failure can never reach any caller path (the listener's silence
// invariant, the update stage's containment). The human ledger stays the
// complete record.
//
// ROUTING (three stages, in order):
//   1. SHARED SINK — when `SharedJournal` is bound (the first successful
//      Function/Open bound it on the factory instance), every record routes
//      through it: the harness's storageDomain enforces ONE open per domain
//      name, so the family's shared package_governance domain is opened
//      once and every module's records (all consumers hold the same service
//      instance) land in the one shared table.
//   2. PRE-BIND BUFFER — before any open has succeeded (the boot-window
//      race: each module's apply journals its `activated` record BEFORE its
//      own Attach's Open completes, and only the FIRST module's open wins —
//      the other modules' per-State queues never drain), records buffer in
//      the factory-level `PendingJournal`, CAPPED at 256 exactly like the
//      per-State pre-open queue (Function/State — when full, the new record
//      is dropped). The successful Open drains the buffer through the sink
//      it just bound and retires it.
//   3. PER-STATE FALLBACK — the defensive default (no shared sink, buffer
//      retired): the per-State sink (queue or retired no-op), unchanged.
import type State from "@Interface/State.js";

export default (
	Factory: {
		SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
		PendingJournal?: { event: string; path: string; detail: string; at: number }[] | undefined;
	},
	State: State,
	Event: string,
	Path: string,
	Detail: string,
	At?: number,
): void => {
	try {
		switch (true) {
			case !!Factory.SharedJournal:
				Factory.SharedJournal(Event, Path, Detail, At);
				break;
			case Array.isArray(Factory.PendingJournal):
				switch (Factory.PendingJournal.length < 256) {
					case true:
						Factory.PendingJournal.push({
							event: Event,
							path: Path,
							detail: Detail,
							at: At ?? Date.now(),
						});
						break;
				}
				break;
			default:
				State.Journal(Event, Path, Detail, At);
		}
	} catch {
		/* storage optional — never on any caller path */
	}
};
