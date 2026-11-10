export default _default;
/**
 * @module Tokens
 *
 * The budget's measurement (Function/Tokens): the harness `ctx.tokenMeter`
 * is used where available; otherwise the module's own estimate applies.
 *
 * @remarks
 *
 * V4-1 section 4: "the orientation budget uses ctx.tokenMeter where
 * available" - the meter's `estimate` function when probed. The local
 * estimate is ~4 characters per token, a ceil so the budget errs on the
 * small side. The meter is probed once at apply time and kept on
 * State.Meter.
 */
declare function _default(State: {
    Meter?: {
        estimate?: (text: string) => number;
    } | undefined;
}, Text: string): number;
