import type Envelope from "../Interface/Envelope.js";
export default _default;
/**
 * @module IsEnvelope
 *
 * Guards the envelope: a complete envelope (the five fields, the payload an
 * object).
 *
 * @remarks
 *
 * The bus validates what it dispatches; an adapter that receives a foreign
 * value ignores it instead of crashing.
 */
declare function _default(Value: unknown): Value is Envelope;
