import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type { Gate as Decision, State } from "@playform/ets-base-dsh";
export default _default;
/**
 * @module Gate
 *
 * The g1 gate set of the fs/observed pass, as ONE decision function.
 *
 * @remarks
 *
 * Order, exactly as in the trio's Function/Observe:
 *
 * 1. the target exists and carries a string displayPath;
 * 2. the actor carries a `govern` field (the raw-write's WRAPPED actor - the marker that routes
 *    this write's governance to the factory's DIRECT path exclusively: the event path skips it
 *    silently, since the tool's own `Govern` call already ran the selected steps);
 * 3. the mutating actor's tool name is in the module's mutation-tool list (reads emit too - the
 *    gate is required);
 * 4. `observation.kind === "present"` (absent probes: nothing to govern);
 * 5. the Stash idempotence gate (our own re-emit / re-read within the async window);
 * 6. the basename gate ("package.json" / "Cargo.toml" - the MODULE gate);
 * 7. exclusion-first (Function/Match).
 *
 * The gate LOGS NOTHING (Interface/Gate): the caller composes its own ledger lines for the
 * outcomes it cares about - the module strings ("skipped (excluded) ...") stay in the module. The
 * gate is also pure with respect to the Stash: it READS the idempotence token but never SETS it
 * (the trio sets Stash only after g2 discovery, right before detaching - the caller does that).
 *
 * `mutationToolsField` names the STATE field that holds the tool list (default "Tool" - the State
 * builder's fixed shared mapping) so a module that renamed the field can point at it.
 */
declare function _default(State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined, Options: {
    basename: string;
    mutationToolsField?: string;
}): Decision;
