// CacheKey - the packet memo's key (Function/CacheKey): every input that
// changes the built packet, in a fixed order - the query's five fields and the
// service's own knobs (a volatile flip changes the packet, so the memo must
// not survive it). The graph's indexRevision is deliberately NOT part of the
// key: the cache is stable-until-event, invalidated by the graph's
// `graph/invalidated` trace (Trace/Invalidate), so a repeated identical query
// is served from the memo until the graph says its basis changed.
import type Query from "@Interface/Query.js";
import type State from "@Interface/State.js";

export default (State: State, Options: Query): string =>
	JSON.stringify([
		Options.id ?? null,
		Options.query ?? null,
		Options.lens ?? null,
		Options.caller ?? null,
		Options.callerVersion ?? null,
		State.BudgetTokens,
		State.BudgetMaximum,
		State.Lenses,
		State.LensDefault,
		State.NeighborLimit,
		State.EvidenceLimit,
		State.MapLimit,
		State.WorkspaceName,
	]);
