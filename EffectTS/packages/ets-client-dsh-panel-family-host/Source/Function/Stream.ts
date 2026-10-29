// Stream - the HTTP SSE route that bridges the host's D5 trace bus to the
// browser. The Workspace tab resolves `ctx.get("trace")` (the client half's
// re-published face), which in turn needs the host's bus envelopes; this
// route streams them as `text/event-stream` frames so an EventSource in the
// panel receives every kind. The bus is read structurally - the same shape
// Function/Trace.ts already forwards - so the package never imports the
// trace library. When the bus is absent the stream stays open with one
// comment frame, so a browser connected before the factory provides the bus
// picks the flow up the moment a later mount starts writing.
import type { IncomingMessage, ServerResponse } from "node:http";

import type { Context } from "@deepseek-ai/cordis";
import type { PanelEnvelope } from "@Interface/Trace.js";

type Bus = {
	on(kind: string, listener: (envelope: PanelEnvelope) => void): () => void;
	ring?(limit?: number): PanelEnvelope[];
};

type Disposer = () => void;

type WebServer = {
	register(route: {
		path: string;
		handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
	}): Disposer;
};

const Path = "/api/playform-family/trace";

// The D5 contract's six kinds: every listener set below must cover exactly
// these, and the cleanup must remove exactly the same set once.
const Kinds = [
	"observe/stamp",
	"graph/indexed",
	"graph/invalidated",
	"batch/proposed",
	"batch/decision",
	"batch/state-change",
] as const;

const IsBus = (Candidate: unknown): Candidate is Bus =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as Bus).on === "function";

const IsWebServer = (Candidate: unknown): Candidate is WebServer =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as WebServer).register === "function";

export default function Stream(ctx: Context): Disposer | undefined {
	const Server = ctx.get("webServer");
	switch (true) {
		case !IsWebServer(Server):
			return undefined;
		default:
			return Server.register({
				path: Path,
				handler: (req, res) => {
					// The write helper never throws into the request lifecycle: a
					// closed or broken socket destroys the response instead of
					// surfacing an error to the server, and the failure lands in
					// the host log through the context's logger.
					const Write = (frame: string): void => {
						try {
							res.write(frame);
						} catch (Error) {
							ctx.logger.warn(`trace stream: write failed: ${String(Error)}`);
							res.destroy();
						}
					};
					res.writeHead(200, {
						"content-type": "text/event-stream",
						"cache-control": "no-cache",
						connection: "keep-alive",
					});
					Write("retry: 3000\n\n");
					// Replay the ring newest-first, then follow the live flow.
					const Bus = ctx.get("trace");
					if (IsBus(Bus) && typeof Bus.ring === "function") {
						for (const Envelope of Bus.ring(200)) {
							Write(`data: ${JSON.stringify(Envelope)}\n\n`);
						}
					} else {
						// No bus yet: one comment frame keeps the EventSource
						// connected so a later bus mount flows without a reconnect.
						Write(": waiting\n\n");
					}
					// Each listener's own disposer is collected, so the close
					// path unsubscribes every kind exactly once.
					const Off = Kinds.map((Kind) =>
						IsBus(Bus)
							? Bus.on(Kind, (Envelope) => {
									Write(`data: ${JSON.stringify(Envelope)}\n\n`);
								})
							: () => {},
					);
					req.on("close", () => {
						for (const OffOne of Off) {
							OffOne();
						}
					});
				},
			});
	}
}
