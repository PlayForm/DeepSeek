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
//
// P10 — THE VOLATILE REFRESH: the builder additionally retains the RAW
// config's volatile cells (`{ get }` references — Unwrap still produces the
// initial plain values) and registers ONE instance-local
// `loader/volatile-update` listener on the module's own context (the event is
// dispatched to the owning fiber only, so the listener belongs here —
// docs/cordis-api/inherited.md:38). The payload is "the changed paths as
// arrays of keys" (docs/cordis-tutorial/05-config.md:90); the listener keys
// each path on its TOP-LEVEL key (robust to either the key-array or the
// dotted-string notation), maps it to a State field through the FIXED shared
// mappings plus the module's own `fields` map inverted, and refreshes that
// field IN PLACE from the retained cell — object identity preserved, no
// remount, no new activation line, zero consumer changes. A failed refresh
// keeps the previous value (the same defensive rule as the initial unwrap);
// unknown or non-volatile key paths are ignored.
import type { Context } from "@deepseek-ai/cordis";
import type SubprocessService from "@deepseek-ai/dsh-subprocess";

import type Entry from "../Interface/Journal.js";
import type Options from "../Interface/Options.js";
import type State from "../Interface/State.js";
import Seam from "./Seam.js";
import Unwrap from "./Unwrap.js";

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
	const State = Object.assign(
		Shared,
		Object.fromEntries(
			Object.entries(Setup.fields ?? {}).map(([Key, Source]) => [Key, Plain[Source]]),
		),
	) as State & Extra;
	// P10 — the volatile refresh (see header): the retained raw cells and the
	// key→field map (fixed shared mappings, then the module's own `fields`
	// map inverted — Setup.fields maps StateKey → configKey, the listener
	// needs configKey → StateKey), then the ONE instance-local listener.
	const Cells = (Config ?? {}) as Record<string, { get?: () => unknown } | undefined>;
	const Fields: Record<string, string> = {
		logFile: "Ledger",
		log: "Enabled",
		exclude: "List",
		mutationTools: "Tool",
		policyFile: "Policy",
	};
	for (const [Field, Key] of Object.entries(Setup.fields ?? {})) {
		Fields[Key] = Field;
	}
	Context.on("loader/volatile-update", (Paths) => {
		for (const Path of Array.isArray(Paths) ? Paths : [Paths]) {
			// The top-level key: a key array's first element, or the first
			// segment of a dotted string — either notation maps to the same
			// cell, and an object cell (e.g. a future scopes object) is
			// re-read WHOLESALE (a volatile object value is a detached frozen
			// snapshot, so the whole object is the refresh unit).
			const Key = Array.isArray(Path)
				? (Path[0] as string | undefined)
				: typeof Path === "string"
					? Path.split(".")[0]
					: undefined;
			if (typeof Key !== "string") {
				continue; // unknown path shape — ignored
			}
			const Field = Fields[Key];
			const Cell = Cells[Key];
			if (Field === undefined || Cell === undefined || typeof Cell.get !== "function") {
				continue; // not a mapped volatile key — ignored
			}
			try {
				(State as unknown as Record<string, unknown>)[Field] = Cell.get();
			} catch {
				/* a failed refresh keeps the previous value */
			}
		}
	});
	return State;
};

// The loader's instance-local volatile-update event (emitted by the harness's
// loader package, which is not a dependency of this monorepo — the
// augmentation types the ONE listener the State builder registers; the
// payload is the changed paths, each either a key array or a dotted string).
declare module "@deepseek-ai/cordis" {
	interface Events {
		/** Volatile config values committed into the running fiber without a remount. */
		"loader/volatile-update"(Paths: unknown): void;
	}
}
