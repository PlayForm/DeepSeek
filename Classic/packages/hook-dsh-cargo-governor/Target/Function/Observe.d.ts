import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
export default _default;
/**
 * @module Observe
 *
 * The fs/observed listener body of the cargo module (basename Cargo.toml), a
 * thin composition of the `@playform/plugin-dsh-factory` service.
 *
 * @remarks
 *
 * The critical path stays AWAIT-FREE and THROW-FREE (a throw inside an
 * fs/observed listener fails the tool call AFTER the mutation already
 * succeeded): the g1 gate set runs as ONE factory call (Factory.Gate — it logs
 * nothing; the module composes its own lines), the registry discovery
 * (Factory.Discover / Factory.Parse — exempt plain-fs reads) and the ledger
 * lines run inline, and the API-aware stages run DETACHED (the factory's
 * Continue for the g3 chain pass, then the module-owned g4 update stage) —
 * ctx.fs.readText/writeText are async by contract (subsystems/filesystem.md),
 * and the listener must never await. Both stages are contained (their own
 * catch) so rejections can never surface as a tool error (the silence
 * invariant).
 *
 * - g1 — Factory.Gate (target → actor → kind → idempotent → basename →
 *   exclusion; the `excluded` outcome is the one line the module composes:
 *   `skipped (excluded) <path>`).
 * - g2 — governance context (registry walk-up + the two designed skip lines).
 * - g3 — the factory's Continue with THE TRANSFORM (Function/Transform: the
 *   TOML pipeline as a string-next factory transform — the guarded write, the
 *   `governed <path> → <version>` line and the P₃ re-emit are the factory's).
 * - g4 — the update stage (Function/Dispatch → Run → Update/Upgrade), run
 *   AFTER the continuation resolves so the ledger order stays byte-identical
 *   (`governed …` before `update stage dispatched …`), skipped entirely when
 *   Filter finds nothing public for cargo to do.
 */
declare function _default(Factory: PluginFactory, State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined): void;
