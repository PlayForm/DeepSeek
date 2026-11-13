import type State from "@Interface/State.js";

/**
 * @module Journal
 *
 * The P5 storage-domain writer (`Function/Journal` in the service API):
 * appends ONE typed lifecycle record to the optional storage journal.
 *
 * @remarks
 *
 * The call sites are the module's lifecycle events: activated, excluded,
 * governed/pinned, dispatched, update-failed. Purely best-effort: the sink
 * is one of the three routing stages below, and this wrapper guarantees a
 * storage failure can never reach any caller path (the listener's silence
 * invariant, the update stage's containment). The human ledger stays the
 * complete record.
 *
 * ROUTING (three stages, in order):
 *
 * 1. SHARED SINK - when `SharedJournal` is bound (the first successful
 *    `Function/Open` bound it on the factory instance), every record routes
 *    through it: the harness's storageDomain enforces ONE open per domain
 *    name, so the family's shared `package_governance` domain is opened
 *    once and every module's records (all consumers hold the same service
 *    instance) land in the one shared table.
 * 2. PRE-BIND BUFFER - before any open has succeeded (the boot-window
 *    race: each module's apply journals its `activated` record BEFORE its
 *    own Attach's Open completes, and only the FIRST module's open wins -
 *    the other modules' per-State queues never drain), records buffer in
 *    the factory-level `PendingJournal`, CAPPED at 256 exactly like the
 *    per-State pre-open queue (`Function/State` - when full, the new
 *    record is dropped). The successful Open drains the buffer through
 *    the sink it just bound and retires it.
 * 3. PER-STATE FALLBACK - the defensive default (no shared sink, buffer
 *    retired): the per-State sink (queue or retired no-op), unchanged.
 *
 * The OPEN-SIDE STAGES also live here, as named exports beside the router -
 * this module is the journal machine's ONE owner: `Bind` (register a
 * just-opened domain's sink on the factory instance), `Drain` (the per-State
 * queue first, then the factory-level pre-bind buffer, then the buffer's
 * retirement) and `Retire` (zero the queue, no-op the sink) - the stages
 * `Function/Open` and `Function/Attach` call instead of inlining them.
 */
export default (
	Factory: {
		SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
		SharedJournals?: Map<
			string,
			(Event: string, Path: string, Detail: string, At?: number) => void
		>;
		PendingJournal?: { event: string; path: string; detail: string; at: number }[] | undefined;
	},
	State: State,
	Event: string,
	Path: string,
	Detail: string,
	At?: number,
): void => {
	try {
		const Domain = State.JournalDomain ?? "package_governance";
		const Shared = Factory.SharedJournals?.get(Domain) ?? Factory.SharedJournal;
		switch (true) {
			case !!Shared:
				Shared(Event, Path, Detail, At);
				break;
			case Array.isArray(Factory.PendingJournal) && Domain === "package_governance":
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
		/* storage optional - never on any caller path */
	}
};

/** The journal record's put: the shared shape of the shared-sink register
 *  (Function/Open binds it) and the per-State sink (Function/State). */
type Put = (Event: string, Path: string, Detail: string, At?: number) => void;

/** The sink BINDING (the Open-side stage one): register the just-opened
 *  domain's sink on the factory instance - in `Factory.SharedJournals` under
 *  the domain name (creating the map when absent) and, for the shared
 *  `package_governance` domain only, in the legacy `Factory.SharedJournal`
 *  slot when that slot is still empty (the FIRST successful open wins; a
 *  later module's `already-open` failure never loses its records, since the
 *  router above sends them through the bound sink either way). */
export const Bind = (
	Factory: {
		SharedJournal?: Put;
		SharedJournals?: Map<string, Put>;
	},
	Domain: string,
	Sink: Put,
): void => {
	(Factory.SharedJournals = Factory.SharedJournals ?? new Map()).set(Domain, Sink);
	switch (true) {
		case !Factory.SharedJournal && Domain === "package_governance":
			Factory.SharedJournal = Sink;
			break;
	}
};

/** The DRAIN (the Open-side stage two): the per-State pre-open queue first,
 *  then the factory-level pre-bind buffer (the boot-window race - the other
 *  modules' records journaled before ANY open succeeded), each through the
 *  just-bound sink with timestamps preserved and in that order, and then the
 *  buffer retires (`PendingJournal = undefined` - the pre-bind stage is
 *  over; the router above then routes straight through the shared sink). */
export const Drain = (
	State: State,
	Factory?: {
		PendingJournal?: { event: string; path: string; detail: string; at: number }[] | undefined;
	},
): void => {
	for (const Item of State.Queue.splice(0, State.Queue.length)) {
		State.Journal(Item.event, Item.path, Item.detail, Item.at);
	}
	switch (true) {
		case !!Factory && Array.isArray(Factory.PendingJournal): {
			for (const Item of Factory.PendingJournal.splice(0, Factory.PendingJournal.length)) {
				State.Journal(Item.event, Item.path, Item.detail, Item.at);
			}
			Factory.PendingJournal = undefined;
			break;
		}
	}
};

/** The RETIREMENT (the absent-facility stage): zero the pre-open queue and
 *  replace the sink with a no-op - nothing to open, nothing to close, and no
 *  queue growth either (records queued before the probe - e.g. the
 *  activation record - have nowhere to go; the human ledger remains the
 *  source). */
export const Retire = (State: State): void => {
	State.Queue.length = 0;
	State.Journal = () => {};
};
