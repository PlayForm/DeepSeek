// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger<-logFile / Enabled<-log and the module's own
// fields via the setup `fields` map - factory SCHEME.md section 2.10), emit
// the durable activation proof (the module's own string, via Factory.Append -
// the factory never owns ledger strings), register the comment filter's TWO
// listeners on the current fiber, and attach the State for the smoke probes.
//
// THE TWO LISTENERS (both fiber-owned: removed on unload, no manual
// bookkeeping, ever):
//   1. tools/post-execute - the OVERPASS ARM, PREPENDED like the family's
//      other arms (the CCR hook's prepended listener must see the FILTERED
//      bytes so its size stats describe what the model actually sees; the
//      core's CCR marker guard makes any load order safe regardless). The
//      arm strips comments from `read` and `ccr_retrieve` results, gated per
//      call by Function/Gate.
//   2. agent/pre-step - the INTENT STASH (Function/Intent): the last user
//      message's text, lowercased, per agent - the task intent the gate
//      consults. It must exist even when `intent` is off (a volatile flip
//      later lands without re-registration; the Gate reads the refreshed
//      cell per call).
//
// NOT factory machinery, deliberately:
//   * Factory.Wire is fs/observed-hardwired (the family's SILENCE) - the
//     comment filter has no fs machinery at all; its registrations are the
//     plain `ctx.on(...)` pattern.
//   * Factory.Attach (jobs controller, inflight disposal, storage domain) has
//     no consumer: the plugin runs no jobs, holds no continuations, and its
//     only journal traffic is the core arm's best-effort `normalized` record.
//   * Factory.Schema is not used for Config: it hardcodes the family's
//     shared block (fs/observed machinery this module has none of). The
//     MODULE owns its Config: Variable/Config.ts.
//
// THE CORE ADAPTER: `State.Scopes` is pinned to `{ toolResults: true }`. The
// shared ToolResults arm factory reads that cell as its own scope gate, and
// this flavor has no scope vocabulary - the per-call Gate is the single
// decision point - so the adapter keeps the core gate OPEN. One module-level
// frozen object serves every apply; it is never mutated (the factory's
// volatile refresh only writes fields named in the `fields` map, and this is
// not one).
//
// The function returns NOTHING - never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified, plugin-development skill pitfall 16). Test probes
// read the state through the `ctx.__hookDshCommentFilterState` attachment
// instead.
//
// `inject: ["pluginFactory"]` (Library.ts) - the factory is a REQUIRED
// service; the loader's PENDING state handles the ordering (the plugin loads
// only when every injected service exists), so bundle-layer order never
// matters. Nothing else is injected: the tool-result vocabulary arrives
// through the merged Events declaration, and the agent-step payload through
// the harness's own event augmentation.
import type { Context } from "@deepseek-ai/cordis";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import { Activate } from "@playform/lib-dsh-core";

import Intent from "./Intent.js";
import Overpass from "./Overpass.js";

/** The core arm factory's scope-gate adapter (see the header). */
const Scopes = { toolResults: true };

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the comment filter's own
	// fields, copied from the (cell-unwrapped) validated config by the setup
	// map.
	const State: State = Factory.State<State>(Context, Options, {
		module: "hook-dsh-comment-filter",
		fields: {
			Active: "enabled",
			Targets: "targets",
			Exempt: "exempt",
			IntentOn: "intent",
			Keywords: "intentKeywords",
			Notice: "notice",
		},
	});
	State.Factory = Factory;
	// The runtime-only fields (NOT config cells: the intent stash and the core
	// scope adapter are per-apply state, initialized here).
	State.IntentMap = new Map();
	State.Global = "";
	State.Scopes = Scopes;

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone. Format (asserted by the smoke):
	//   hook-dsh-comment-filter: activated (targets 2, intent on, notice on, logFile=...)
	// The line's string mechanics (the `activated (` prefix, the `k=v` join,
	// the `)` suffix) live in the core's Activate composer; the FIELD LIST is
	// the module's own. The three flag segments are passed with an EMPTY key -
	// the composer's bare-segment form (the family's "anywhere mode"
	// precedent) - so the line reads as a sentence (`targets 2, intent on,
	// notice on`) while the logFile stays a k=v field. The values are the
	// MOUNT-TIME effective values: the volatile cells (intent/notice/logFile)
	// are hot-editable later without a new activation line - observability
	// then goes through the logger.
	Factory.Append(
		State,
		Activate([
			["", `targets ${State.Targets.length}`],
			["", `intent ${State.IntentOn ? "on" : "off"}`],
			["", `notice ${State.Notice ? "on" : "off"}`],
			["logFile", State.Ledger],
		]),
	);

	// Listener 1: the tools/post-execute arm (PREPENDED - see the header).
	Context.on("tools/post-execute", (Exec, Result, Next) => Overpass(Exec, Result, Next, State), {
		prepend: true,
	});

	// Listener 2: the agent/pre-step intent stash (default ordering: nothing
	// needs to precede an observer).
	Context.on("agent/pre-step", (Payload, Next) => Intent(Payload, Next, State));

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead (a bare `return State` is
	// avoided: loader behavior on apply return values is untrusted).
	(Context as { __hookDshCommentFilterState?: State }).__hookDshCommentFilterState = State;
};
