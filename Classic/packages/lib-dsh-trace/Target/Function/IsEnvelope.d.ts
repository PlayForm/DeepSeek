import type Envelope from "../Interface/Envelope.js";
export default _default;
/**
 * @module IsEnvelope
 *
 * The envelope guard: a complete envelope carries the five fields with an
 * object payload.
 *
 * @remarks
 * The bus validates what it dispatches, so an adapter that receives a foreign
 * value ignores it instead of crashing.
 */
declare function _default(Value: unknown): Value is Envelope;
