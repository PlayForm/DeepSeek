export default _default;
/**
 * @module Tokens
 *
 * The budget's token measurement over the packet's text.
 *
 * @remarks
 *
 * The harness `ctx.tokenMeter` is used where available (V4-1 section 4:
 * "the orientation budget uses ctx.tokenMeter where available" - the
 * meter's `estimate` function when probed); otherwise the module's own
 * estimate applies: ~4 characters per token, a ceil so the budget errs on
 * the small side. The meter is probed once at apply time and kept on
 * State.Meter.
 */
declare function _default(State: {
    Meter?: {
        estimate?: (text: string) => number;
    } | undefined;
}, Text: string): number;
