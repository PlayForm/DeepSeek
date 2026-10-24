// Contract - the context's side of the trace contract: the ONE event it
// consumes, `graph/invalidated`, extracted as the payload's path. A foreign
// envelope or a malformed payload yields `undefined` (the invalidation is
// ignored - never a guessed cache clear).
import { IsEnvelope, type Envelope } from "@playform/ets-lib-dsh-trace";

export default (Envelope: Envelope): string | undefined => {
	switch (true) {
		case !IsEnvelope(Envelope):
			return undefined;
		default: {
			const Path = (Envelope.payload as { path?: unknown }).path;
			return typeof Path === "string" && Path.length > 0 ? Path : undefined;
		}
	}
};
