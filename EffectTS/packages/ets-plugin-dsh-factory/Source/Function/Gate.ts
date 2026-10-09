// Gate — the g1 gate set of the fs/observed pass, as ONE decision function
// (Function/Gate in the service API). Order, exactly as in the trio's
// Function/Observe:
//   1. the target exists and carries a string displayPath;
//   2. the actor carries a `govern` field (the raw-write's WRAPPED actor -
//      the marker that routes this write's governance to the factory's
//      DIRECT path exclusively: the event path skips it silently, since the
//      tool's own `Govern` call already ran the selected steps);
//   3. the mutating actor's tool name is in the module's mutation-tool list
//      (reads emit too — the gate is required);
//   4. observation.kind === "present" (absent probes: nothing to govern);
//   5. the Stash idempotence gate (our own re-emit / re-read within the
//      async window);
//   6. the basename gate ("package.json" / "Cargo.toml" — the MODULE gate);
//   7. exclusion-first (Function/Match).
// The gate LOGS NOTHING (Interface/Gate): the caller composes its own ledger
// lines for the outcomes it cares about — the module strings ("skipped
// (excluded) …") stay in the module. The gate is also pure with respect to
// the Stash: it READS the idempotence token but never SETS it (the trio sets
// Stash only after g2 discovery, right before detaching — the caller does
// that).
//
// `mutationToolsField` names the STATE field that holds the tool list
// (default "Tool" — the State builder's fixed shared mapping) so a module
// that renamed the field can point at it.
import { basename as Base } from "node:path";
import Match from "./Match.js";
import type { State as State } from "@playform/ets-dsh-hook";
import type { Gate as Decision } from "@playform/ets-dsh-hook";
import type { Actor as ActorView } from "@playform/ets-dsh-hook";
import type { FsTarget, FsObservation, FsTargetKey, FsVersion } from "@deepseek-ai/dsh-fs";

export default (
	State: State,
	Target: FsTarget,
	Observation: FsObservation,
	Actor: object | undefined,
	Options: { basename: string; mutationToolsField?: string },
): Decision => {
	const Tools = (State as unknown as Record<string, unknown>)[
		Options.mutationToolsField ?? "Tool"
	] as string[] | undefined;
	const Name = (Actor as ActorView | undefined)?.name;
	switch (true) {
		case !Target || typeof Target.displayPath !== "string":
			return { pass: false, reason: "target" };
	}
	const Path: string = Target.displayPath;
	const Key = Target.targetKey;
	switch (true) {
		case (Actor as { govern?: unknown } | undefined)?.govern !== undefined:
			// The raw-write's wrapped actor: the marker (ALWAYS present on it)
			// means this write's governance already ran — or deliberately did not
			// run — through the DIRECT path. The event path skips it silently
			// (like the other non-excluded gate outcomes). The built-in write/edit
			// execs carry no `govern` field and keep governing exactly as before.
			return { pass: false, reason: "govern", path: Path };
		case Name === undefined || !Tools || !Tools.includes(Name): // reads emit too — gate required
			return { pass: false, reason: "actor", path: Path };
		case Observation?.kind !== "present": // absent probe: nothing to govern
			return { pass: false, reason: "kind", path: Path };
		case Key !== undefined &&
			State.Stash.get(Key as FsTargetKey) ===
				(Observation as { version?: FsVersion } | undefined)?.version: // our own re-emit / re-read: skip
			return { pass: false, reason: "idempotent", path: Path };
		case Base(Path) !== Options.basename: // the MODULE gate
			return { pass: false, reason: "basename", path: Path };
		case Match(Path, State.List): // exclusion-first: internals are never governed
			return { pass: false, reason: "excluded", path: Path };
		default:
			return { pass: true, path: Path };
	}
};
