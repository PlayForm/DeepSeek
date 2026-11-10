/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * durable activation proof, the `dshQueue` service instantiation, the tool
 * registrations, and the unload effect.
 *
 * @remarks
 * The State build is the factory's cell unwrap plus the P10 volatile refresh.
 * The unload effect cancels in-flight spawned children. The function returns
 * NOTHING (the loader treats apply returns specially - a returned value
 * silently kills event delivery).
 *
 * THE SPAWN (the completion wave): the dispatcher assigns a seat and, when
 * `autoSpawn` is on, starts the child through the harness's own subagent
 * service (`ctx.subagents.startActivation`) - never a private spawn, never a
 * shell. `autoSpawn` ships FALSE (the D6 approval posture: a spawn is a
 * privileged action), so the default mount assigns and ledgers only. The
 * idle-slot automation (a released seat pulls the next queued task) and the
 * restart reconcile (`Reconcile`) live on the same service surface; both are
 * gated so the manual posture's ledger stays byte-identical.
 *
 * The activation line is UNCHANGED (the byte-exact contract): the spawn
 * posture is visible on the per-task lines (`spawned` / `spawn skipped` /
 * `spawn failed`), not on the activation proof.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
