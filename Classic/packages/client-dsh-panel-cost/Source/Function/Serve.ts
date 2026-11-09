// Serve - the host half's route registration: GET <Path>?session=<id>&rows=<n>
// answers one JSON envelope with content-type "application/json; charset=utf-8"
// and cache-control "no-store", status 200 with the outcome in the envelope.
// The host half is transport only and owns NO SQL: the ledger is
// @playform/plugin-dsh-cost's business, and this route parses the query,
// clamps the row budget and carries the answer. The service is resolved
// structurally as `ctx.get("cost")` - the injection mechanism, the same way
// the family host reads its trace bus - so the package never imports the
// ledger library and a plugin that loads after the panel is still found at
// request time. Library declares `inject: ["webServer"]`, so the loader
// orders this row after the harness web server; the server itself is still
// probed structurally (the fail-open switch (true) guard of
// client-dsh-panel-family-host/Source/Function/Stream.ts). The route path
// comes from Variable/Path and never from the query.
//
// The decision chain: a blank session id answers code "session" without
// calling the engine; a missing cost service answers code "unavailable" with
// the one actionable line that names the missing package; a service that
// throws answers code "error"; otherwise the service's own envelope is
// answered verbatim, because it owns the ledger path, the currency facts and
// the codes. Every failure is logged once through ctx.logger.warn with the
// "cost route: " prefix, and the response write never throws into the request
// lifecycle. The panel's own envelopes name the route in `path`, because the
// host half no longer knows the ledger file - the convention
// Function/Fetch.ts documents for the browser half.
import type { IncomingMessage, ServerResponse } from "node:http";

import type { Context } from "@deepseek-ai/cordis";
import type CostResponse from "@Interface/Response.js";
import type CostSummary from "@Interface/Summary.js";
import type CostService from "@playform/plugin-dsh-cost/service";
import Limits from "@Variable/Limits.js";
import Path from "@Variable/Path.js";

type WebServer = {
	register(route: {
		path: string;
		handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
	}): () => void;
};

const AbsentMessage =
	"client-dsh-panel-cost: the cost plugin is not loaded - add @playform/plugin-dsh-cost to the profile";

const IsWebServer = (Candidate: unknown): Candidate is WebServer =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as WebServer).register === "function";

const IsService = (Candidate: unknown): Candidate is CostService =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as CostService).session === "function";

export default function Serve(ctx: Context): void {
	const Server = ctx.get("webServer");
	switch (true) {
		case !IsWebServer(Server):
			return;
		default: {
			const Applied = (Raw: string | null): number => {
				const Parsed = Raw === null || Raw.trim() === "" ? Limits.DefaultRows : Number(Raw);
				const Finite = Number.isFinite(Parsed) ? Math.floor(Parsed) : Limits.DefaultRows;
				return Math.min(Math.max(Finite, Limits.MinRows), Limits.MaxRows);
			};
			const Zero = (): CostSummary => ({
				calls: 0,
				priced: 0,
				unpriced: 0,
				turns: 0,
				steps: 0,
				tokens: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					reasoning: 0,
					total: 0,
					reported: null,
				},
				cost: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					reasoning: 0,
					total: 0,
					other: 0,
				},
				direct: 0,
				amortized: 0,
				saving: 0,
				cacheHit: null,
				files: 0,
				currency: "USD",
				currencies: [],
				topFiles: [],
			});
			const Answer = (res: ServerResponse, Body: CostResponse): void => {
				try {
					res.writeHead(200, {
						"content-type": "application/json; charset=utf-8",
						"cache-control": "no-store",
					});
					res.end(JSON.stringify(Body));
				} catch (Failure) {
					ctx.logger.warn(`cost route: write failed: ${String(Failure)}`);
					res.destroy();
				}
			};
			const Failure = (
				Code: "session" | "unavailable" | "error",
				Message: string,
				Rows: number,
			): CostResponse => ({
				ok: false,
				code: Code,
				message: Message,
				path: Path,
				rows: Rows,
				truncated: false,
				session: null,
				currency: "USD",
				currencies: [],
				summary: Zero(),
				calls: [],
			});
			Server.register({
				path: Path,
				handler: (req, res) => {
					const Url = new URL(req.url ?? "/", "http://localhost");
					const SessionId = Url.searchParams.get("session") ?? "";
					const Rows = Applied(Url.searchParams.get("rows"));
					const Engine = ctx.get("cost");
					switch (true) {
						case SessionId.trim() === "":
							Answer(
								res,
								Failure(
									"session",
									"client-dsh-panel-cost: the query carries no session id - add ?session=<id>",
									Rows,
								),
							);
							return;
						case !IsService(Engine):
							ctx.logger.warn(`cost route: ${AbsentMessage}`);
							Answer(res, Failure("unavailable", AbsentMessage, Rows));
							return;
						default: {
							try {
								Answer(res, Engine.session(SessionId, Rows));
							} catch (Caught) {
								const Message =
									Caught instanceof Error ? Caught.message : String(Caught);
								ctx.logger.warn(`cost route: ${Message}`);
								// The engine throws the ledger's own actionable
								// line; an unopenable file is the "unavailable"
								// state, anything else a read error.
								Answer(
									res,
									Failure(
										Message.startsWith(
											"plugin-dsh-cost: cannot open the ledger",
										)
											? "unavailable"
											: "error",
										Message.startsWith(
											"plugin-dsh-cost: cannot open the ledger",
										)
											? Message
											: `the ledger read failed: ${Message}`,
										Rows,
									),
								);
							}
						}
					}
				},
			});
		}
	}
}
