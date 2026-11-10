/**
 * @module Knobs
 *
 * The service's validated configuration: the constructor's defaults,
 * overridden by the loader's validated config, with every volatile cell
 * unwrapped and the numeric/name knobs fail-loud checked at load.
 *
 * @remarks
 * The class-form plugin receives the loader's validated config as the SECOND constructor
 * argument (the graph service's precedent). A bad knob must throw AT LOAD, never at the first
 * review: an interval of NaN silently disables the nudge, and a reversed
 * stale/archive pair archives entries the moment they go stale.
 *
 * THE TWO POSTURES: `enabled` is TRUE in these defaults while the SCHEMA
 * (Variable/Config) defaults it to FALSE. They are different by design - a
 * BARE construction (`new LessonService(ctx)` - the smokes' fixture) is an
 * inert-but-live service: Tick answers and Status reports, so every assertion
 * is byte-exact; the LOADED plugin gets the schema's validated config (the
 * loader always passes it), which is the documented idle-forever posture
 * (disabled, the bundle patch row).
 */
import type Configuration from "../Interface/Config.js";
export default _default;
declare function _default(Raw: unknown): Configuration;
