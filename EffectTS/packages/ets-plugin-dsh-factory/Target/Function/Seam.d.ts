/**
 * @module Seam
 *
 * The probe-once accessor for an OPTIONAL service.
 *
 * @remarks
 * The documented optional-dep probe, `ctx.get(name)` - tutorial 03:82-90. NEVER the direct
 * accessor fallback: `ctx.<name>` (e.g. `ctx.subprocess`) THROWS on service accessors without
 * inject ("cannot get property ... without inject" - live-verified 2026-10-03); the probe is the
 * safe form. The result is cached on the state's Seams map, so repeated calls probe ONCE per load
 * (the P9 shape) - including a cached `undefined` for a genuinely absent service. The State
 * builder uses this exact accessor for the "subprocess" seam; new optional seams (storageDomain,
 * jobs) should prefer it over ad-hoc probes.
 */
import type { State } from "@playform/ets-base-dsh";
export default _default;
declare function _default(State: State, Name: string): unknown;
