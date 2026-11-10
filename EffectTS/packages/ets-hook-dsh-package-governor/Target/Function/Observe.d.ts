import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Observe
 *
 * The fs/observed listener body: a thin module residue over the factory's
 * machinery.
 *
 * @remarks
 *
 * `Factory.Gate` provides the whole g1 gate set (the exact pre-refactor order -
 * target -> actor -> kind -> Stash idempotence -> basename -> exclusion-first -
 * logs nothing, SCHEME.md §2.6), the MODULE'S ledger lines for the outcomes it
 * cares about, `Factory.Discover` + `Factory.Parse` for the g2 registry walk-up
 * (the auxiliary plain-fs exemption), the Stash seed, and the hand-off to
 * `Factory.Continue` with the MODULE'S transform (Function/Transform - SCHEME.md
 * §2.9).
 *
 * The update stage follows the settled continuation (Function/Follow, chained
 * onto the Continue promise) - the factory's refresh re-emit re-enters THIS
 * listener, and the Stash token gate (checked inside Factory.Gate, seeded here
 * after g2) makes it a no-op.
 *
 * The critical path stays AWAIT-FREE and THROW-FREE (a throw inside an
 * fs/observed listener fails the tool call AFTER the mutation already
 * succeeded): every step here is synchronous, and the async stages (the chain
 * pass and the update stage) run detached and contained - the factory's
 * Continue catches its own, and Function/Follow catches its own, so neither can
 * ever surface as a tool error (the silence invariant).
 */
declare function _default(State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined): void;
