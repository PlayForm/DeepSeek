// Contract - the graph's side of the trace contract: the ONE event it
// consumes, `observe/stamp`, extracted as the library's Stamp payload. A
// foreign envelope or a malformed payload yields `undefined` (the consumer
// ledgers the existing malformed line and does nothing else - never a guessed
// re-index).
import { IsEnvelope, IsStamp, type Envelope, type Stamp } from "@playform/lib-dsh-trace";

export default (Envelope: Envelope): Stamp | undefined => {
	const Payload = (Envelope as { payload?: unknown } | null | undefined)?.payload;
	switch (true) {
		case !IsEnvelope(Envelope):
			return undefined;
		case !IsStamp(Payload):
			return undefined;
		default:
			return Payload;
	}
};
