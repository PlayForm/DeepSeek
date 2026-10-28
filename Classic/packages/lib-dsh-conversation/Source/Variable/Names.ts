// Names - the conversation vocabulary's names: the service name the factory
// provides (`ctx.conversation`) and the event names the factory's service
// emits on the bus and the plugins' adapters consume. The library owns the
// strings; no plugin re-declares them (the one place a new event name is
// added).
export default {
	/** The service name the factory provides (`ctx.conversation`). */
	service: "conversation",
	/** A turn started. */
	turn: "conversation/turn",
	/** A step started. */
	step: "conversation/step",
	/** An assistant message completed (the model call and its usage). */
	call: "conversation/call",
	/** A tool was called. */
	tool: "conversation/tool",
	/** A tool call resolved a file touch. */
	touch: "conversation/touch",
	/** The conversation ended (the turn ended or the session was disposed). */
	end: "conversation/end",
} as const;
