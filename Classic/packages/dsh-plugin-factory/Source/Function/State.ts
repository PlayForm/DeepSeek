// State — the State builder (Function/State in the service API):
// `State(ctx, config, { module, fields, policyFileName? })`. Defensive cell
// unwrap (Function/Unwrap — volatile Schemastery cells), the FIXED shared
// field mappings (Tool←mutationTools, Policy←policyFile, Ledger←logFile,
// Enabled←log, List←exclude), the module's own fields copied by the `fields`
// map (StateKey → configKey), and the shared machinery structures: Stash
// (idempotence gate), Inflight (P2 disposal), Seams (probe-once cache),
// Queue + Journal (the P5 pre-open sink) — plus the P9 probe-once
// "subprocess" seam through Function/Seam.
//
// Returns the SHARED shape intersected with the module's extra fields
// (`State & Extra`) — the caller names its own extras type. Never returned
// from `apply` itself: the loader treats apply return values specially, and
// a returned State object silently killed event delivery (live-verified
// 2026-10-03); modules expose state via a context attachment instead.
import Seam from "./Seam.js";
import Unwrap from "./Unwrap.js";
import type State from "@Interface/State.js";
import type Options from "@Interface/Options.js";
import type Entry from "@Interface/Journal.js";
import type SubprocessService from "@deepseek-ai/dsh-subprocess";
import type { Context } from "@deepseek-ai/cordis";

export default <Extra extends object = Record<string, unknown>>(
	Context: Context,
	Config: unknown,
	Setup: Options,
): State & Extra => {
	// Defensive cell unwrap (see header). Plain-object copy; cells unwrapped
	// best-effort, a failed unwrap keeps the raw value (the schema default).
	const Plain = Unwrap(Config);
	// The pre-open journal queue (P5): the sink below queues lifecycle records
	// until the optional storage domain opens, capped so a deployment without
	// storage cannot grow it unboundedly; Function/Open drains it on success
	// and the Attach effect's disposer drops it.
	const Queue: Entry[] = [];
	const Shared: State = {
		Context,
		Module: Setup.module,
		Tool: Plain["mutationTools"] as string[],
		Policy: (Plain["policyFile"] as string) ?? "",
		PolicyName: Setup.policyFileName ?? "",
		Ledger: Plain["logFile"] as string,
		Enabled: Plain["log"] as boolean,
		List: Plain["exclude"] as string[],
		Stash: new Map(), // targetKey -> version token we last processed
		Inflight: new Map(), // targetKey -> abort controller of the detached pass
		Subprocess: undefined,
		Seams: new Map(), // probe-once cache (Function/Seam)
		Queue,
		Journal: (Event, Path, Detail, At) => {
			switch (Queue.length < 256) {
				case true:
					Queue.push({
						event: Event,
						path: Path,
						detail: Detail,
						at: At ?? Date.now(),
					});
					break;
			}
		},
	};
	// P9 — the subprocess seam is probed ONCE per load, through the same
	// probe-once accessor the new seams use (a direct `ctx.subprocess`
	// accessor fallback THROWS on service accessors without inject —
	// live-verified 2026-10-03).
	Shared.Subprocess = Seam(Shared, "subprocess") as SubprocessService | undefined;
	// The module's own fields, copied from the unwrapped config by name.
	return Object.assign(
		Shared,
		Object.fromEntries(
			Object.entries(Setup.fields ?? {}).map(([Key, Source]) => [Key, Plain[Source]]),
		),
	) as State & Extra;
};
