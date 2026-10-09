// Wire — the fs/observed listener registration (Function/Wire in the service
// API). The listener is registered on the ROOT context —
// `Context.root.on("fs/observed", Observe)` — not on the module's own plugin
// context. Rationale: cordis dispatches events through the shared root bus
// and filters by the emitting scope, so a listener registered on one plugin's
// context hears only that plugin's emissions (verified live: the family's
// governance hooks never reacted to the shared write executor's fs/observed
// emits — the raw-write tool writes through the factory's write executor,
// which emits via `State.Context.root.emit(...)`, while the hooks DID react
// to the built-in tools' emits and the family's own Refresh re-emits).
// Root registration is the posture the harness's own fs listeners use (they
// hear everything), and it makes the family's listeners hear ALL fs/observed
// emissions: the built-in write/edit tools', sibling plugins' (the
// raw-write/normalize-file tools), and the family's own re-emits — the Stash
// idempotence gate already handles the re-entrant cases. The module supplies
// its OWN observe function `(target, observation, actor) => void` — its g1
// gate calls (Factory.Gate), its own ledger lines (the factory logs nothing
// on the listener path), its own g2 discovery, and its detached continuation
// handoff (Factory.Continue). The hook is fs/observed ONLY: never
// fs/write-intent / fs/edit-intent (the single-slot waterfalls belong to the
// observation policy; registering there would veto it), never tools/*
// (result amendment is louder).
//
// The ACTIVATION PROOF is the module's too: the module composes its own
// `activated (…)` summary line and logs it through Factory.Append (and
// Factory.Journal with the "activated" event) before/after calling Wire —
// the factory never owns the string.
import type { State as State } from "@playform/ets-base-dsh";
import type { Context } from "@deepseek-ai/cordis";
import type { FsTarget, FsObservation } from "@deepseek-ai/dsh-fs";

export default (
	Context: Context,
	// Accepted for signature stability (every module passes its built State);
	// the registration itself needs no state today.
	_State: State,
	Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void,
): void => {
	Context.root.on("fs/observed", Observe);
};
