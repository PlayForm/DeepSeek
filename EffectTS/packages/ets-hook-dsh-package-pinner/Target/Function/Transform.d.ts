import type State from "../Interface/State.js";
import type Factory from "@playform/ets-plugin-dsh-factory";
export default _default;
/**
 * @module Transform
 *
 * The MODULE LEAF: the factory's transform contract with the pinner's content
 * step.
 *
 * @remarks
 * Shape: `(current, section, keep) => { next, count, message? } | null`. The
 * factory's Continue calls it exactly once per detached pass with the RAW file
 * text (null when the read failed), the module's own `Section` state field and
 * the UNION keep-list (the factory's ResolvePolicy - the pin-policy.json
 * sidecars plus the P3 chain-keys interlock, so the governor's `^resolved`
 * chain pins are never stripped).
 *
 * This module BUILDS the transform per pass: the contract carries no path, but
 * the pinner's ledger strings are path-bearing - so the builder closes over
 * the pass's target path and the State, and the returned function is the
 * pure-ish leaf the factory drives. Every no-op/refusal line is the MODULE'S
 * and is logged HERE, before returning null (the factory stays silent on
 * no-op paths):
 *
 * - decode (Function/Decode - JSON.parse, null on any failure): undecodable ->
 *   `observed non-JSON package.json <path> - skipped` -> null;
 * - pin (Function/Pin - the range law: ONE leading ^/~/= stripped, statics/
 *   wildcards/protocols/compound ranges untouched; already-pinned -> null):
 *   no change -> `no changes to pin for <path>` -> null;
 * - REFUSAL GUARD (the defensive invariant absorbed from the old Rewrite):
 *   only the config's dependency sections may differ from the author's
 *   manifest - Function/Pin touches dependency sections by construction, so
 *   this guard can never fire through the real flow; if the pinner's own logic
 *   would EVER change a non-dependency section, the rewrite is refused
 *   (`REFUSED rewrite of <path>: non-dependency section "<name>" would
 *   change`) and null is returned - never applied.
 * - otherwise -> { next: the pinned manifest, count: the number of pinned
 *   versions, message: `pinned <path> (<count> versions)` } - the factory
 *   serializes the manifest exactly as the trio did (JSON.stringify(next,
 *   null, 2) + "\n"), performs the guarded write (GuardedWrite:
 *   replaceIfVersion + the P4 fence + Stash pre-registration), logs the
 *   message and refreshes the observation-policy's record (same actor).
 */
declare function _default(Furnace: Factory, State: State, Path: string): Parameters<Factory["Continue"]>[6];
