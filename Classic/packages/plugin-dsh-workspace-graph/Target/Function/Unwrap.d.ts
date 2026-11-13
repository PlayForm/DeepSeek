export default _default;
/**
 * @module Unwrap
 *
 * The defensive Schemastery cell unwrap used by the entry.
 *
 * @remarks
 *
 * When a config field arrives as a Schemastery cell (`{ get }` - the loader's representation
 * for VOLATILE fields; every field of this plugin's config is volatile) it is unwrapped before
 * the State is built; a failed unwrap keeps the raw value (the schema default).
 *
 * The semantics are identical to the factory's `Function/Unwrap`, owned here so the plugin
 * stays self-contained.
 *
 * THE ONE LIVE EXCEPTION: the entry keeps the raw `enabled` cell beside the plain snapshot and
 * reads it through `State.On` at the moment of every call (Library.ts), so the master switch
 * is never frozen at construction - every other volatile cell stays a construction snapshot.
 */
declare function _default(Config: unknown): Record<string, unknown>;
