/**
 * @module Names
 *
 * The conversation vocabulary's names: the service name the factory provides
 * (`ctx.conversation`) and the event names the factory's service emits on the
 * bus and the plugins' adapters consume.
 *
 * @remarks
 *
 * The library owns the strings; no plugin re-declares them. This is the one
 * place a new event name is added.
 */
declare const _default: {
    /**
     * The service name the factory provides (`ctx.conversation`).
     */
    readonly service: "conversation";
    /**
     * A turn started.
     */
    readonly turn: "conversation/turn";
    /**
     * A step started.
     */
    readonly step: "conversation/step";
    /**
     * An assistant message completed (the model call and its usage).
     */
    readonly call: "conversation/call";
    /**
     * A tool was called.
     */
    readonly tool: "conversation/tool";
    /**
     * A tool call resolved a file touch.
     */
    readonly touch: "conversation/touch";
    /**
     * The conversation ended (the turn ended or the session was disposed).
     */
    readonly end: "conversation/end";
};
export default _default;
