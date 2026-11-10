/**
 * @module Knobs
 *
 * The service's validated configuration: the constructor's defaults,
 * overridden by the loader's validated config.
 *
 * @remarks
 * Function/Knobs. The class-form plugin receives the config as the SECOND
 * constructor argument - the graph service's precedent - and every volatile
 * cell is unwrapped, while the `domain` knob is fail-loud checked at load (a
 * bad domain name must throw at load, never at the detached storage open).
 *
 * THE TWO POSTURES: `enabled` is TRUE in these defaults while the SCHEMA
 * (Variable/Config) defaults it to FALSE. They are different by design - a
 * BARE construction (`new PatternService(ctx)` - the smokes' fixture) is an
 * inert-but-live registry: the catalog is seeded and Match answers, so every
 * existing assertion stays byte-exact; the LOADED plugin gets the schema's
 * validated config (the loader always passes it), which is the documented
 * idle-forever posture (disabled, the bundle patch row).
 */
import type Configuration from "../Interface/Config.js";
export default _default;
declare function _default(Raw: unknown): Configuration;
