export default _default;
/**
 * @module Unwrap
 *
 * The defensive Schemastery cell unwrap used by Function/State.
 *
 * @remarks
 *
 * If a config field arrives as a Schemastery cell (`{ get }` - the loader's representation for
 * VOLATILE fields; log, logFile, updateCooldownMs and mutationTools are volatile) it is unwrapped
 * before the State is built; a failed unwrap keeps the raw value (the schema default).
 * Byte-identical semantics with the trio's apply-time loop.
 */
declare function _default(Config: unknown): Record<string, unknown>;
