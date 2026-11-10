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
 */
declare function _default(Config: unknown): Record<string, unknown>;
