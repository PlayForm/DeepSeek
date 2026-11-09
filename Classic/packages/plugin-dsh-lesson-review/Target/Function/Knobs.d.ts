/**
 * @module Knobs
 *
 * The service's validated configuration.
 *
 * @remarks
 * The constructor's defaults, overridden by the loader's validated config
 * (the class-form plugin receives it as the SECOND constructor argument -
 * the graph service's precedent), with every volatile cell unwrapped and
 * the numeric/name knobs fail-loud checked at load. A bad knob must throw
 * AT LOAD, never at the first review: an interval of NaN silently disables
 * the nudge, and a reversed stale/archive pair archives entries the moment
 * they go stale.
 *
 * THE TWO POSTURES: `enabled` is TRUE in these defaults while the SCHEMA
 * (Variable/Config) defaults it to FALSE. They are different by design - a
 * BARE construction (`new LessonService(ctx)` - the smokes' fixture) is an
 * inert-but-live service: Tick answers and Status reports, so every
 * assertion is byte-exact; the LOADED plugin gets the schema's validated
 * config (the loader always passes it), which is the documented
 * idle-forever posture (disabled, the bundle patch row).
 */
import type Configuration from "../Interface/Config.js";
export default _default;
declare function _default(Raw: unknown): Configuration;
