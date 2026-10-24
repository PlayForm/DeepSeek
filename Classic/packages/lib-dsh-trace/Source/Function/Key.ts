// Key - the coalescing key of an envelope: the payload's path when it carries
// one (every workspace trace does), else the event name. The detached loop
// (Function/Loop) and the graph's per-path debounce key on exactly this value,
// so a coalesced pair of stamps for one path produces ONE re-index.
export default (Envelope: { kind?: unknown; payload?: unknown }): string => {
	const Payload = (Envelope.payload ?? {}) as { path?: unknown };
	switch (true) {
		case typeof Payload.path === "string" && Payload.path.length > 0:
			return Payload.path as string;
		case typeof Envelope.kind === "string" && Envelope.kind.length > 0:
			return Envelope.kind as string;
		default:
			return "unknown";
	}
};
