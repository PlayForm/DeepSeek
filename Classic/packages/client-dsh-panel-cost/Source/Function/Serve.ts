// Serve - the host half's route registration (the rewrite of the
// placeholder): GET <Path>?session=<id>&rows=<n> answers one JSON envelope
// with content-type "application/json; charset=utf-8" and cache-control
// "no-store", status 200 with the outcome in the envelope. The web server
// is probed structurally (the fail-open switch (true) guard of
// client-dsh-panel-family-host/Source/Function/Stream.ts), so the package
// never imports the web-server library. The ledger path is the cost
// plugin's config default, tilde-expanded here once so the envelope can
// name the file; the route never takes a path from the query. A missing or
// blank session id answers code "session" without opening the ledger, an
// unopenable ledger answers code "unavailable" with the reader's one
// actionable line, and any other read failure answers code "error" - each
// logged once through ctx.logger.warn with the "cost route: " prefix, and
// the response write never throws into the request lifecycle.
import type { IncomingMessage, ServerResponse } from "node:http";
import { homedir } from "node:os";

import type { Context } from "@deepseek-ai/cordis";
import type CostResponse from "@Interface/Response.js";
import type CostSummary from "@Interface/Summary.js";
import Limits from "@Variable/Limits.js";
import Path from "@Variable/Path.js";

import Open from "./Open.js";
import Read from "./Read.js";

type WebServer = {
	register(route: {
		path: string;
		handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
	}): () => void;
};

const LedgerPath = "~/.dsh/cost/ledger.db";

const OpenPrefix = "client-dsh-panel-cost: cannot open the ledger";

const IsWebServer = (Candidate: unknown): Candidate is WebServer =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as WebServer).register === "function";

export default function Serve(ctx: Context): void {
	const Server = ctx.get("webServer");
	switch (true) {
		case !IsWebServer(Server):
			return;
		default: {
			const Resolved = LedgerPath.startsWith("~/")
				? `${homedir()}${LedgerPath.slice(1)}`
				: LedgerPath;
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
				path: Resolved,
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
						default: {
							try {
								const Ledger = Open(Resolved);
								try {
									Answer(res, {
										...Read(Ledger.Database, SessionId, Rows),
										path: Resolved,
									});
								} finally {
									Ledger.Close();
								}
							} catch (Caught) {
								const Message =
									Caught instanceof Error ? Caught.message : String(Caught);
								const Unopenable = Message.startsWith(OpenPrefix);
								ctx.logger.warn(`cost route: ${Message}`);
								Answer(
									res,
									Failure(
										Unopenable ? "unavailable" : "error",
										Unopenable ? Message : `the ledger read failed: ${Message}`,
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
