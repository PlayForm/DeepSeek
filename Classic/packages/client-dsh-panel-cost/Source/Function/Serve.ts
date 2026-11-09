// Serve - the host half's route registration: GET <Path>?session=<id>&rows=<n>
// answers one JSON envelope with content-type "application/json; charset=utf-8"
// and cache-control "no-store", status 200 with the outcome in the envelope.
// The same route carries the file-scoped read: GET <Path>?file=<encoded path>
// answers the conversations that contributed to that file's cost under the
// same status and headers, because the engine's contribution read returns
// plain rows and the browser can only receive JSON.
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
// THE VALUATION SELECTION (lane B4d; the research's section 8): the session
// route also accepts `basis` and `revision`, validates the basis against the
// four the engine declares, and hands the selection to the engine, which
// answers the envelope's `valuation` block. An unknown basis, or a revision
// that is not a positive integer, answers the existing error envelope with one
// actionable line before the engine is called. Without both parameters the
// route answers exactly what it answered before this lane.
//
// THE PRICING SURFACE (lane B4d): two more routes ride the same server. GET
// <CatalogPath> answers { ok, catalogs, revisions } - every catalog the ledger
// carries and every revision of each, flattened in catalog order so the
// settings view groups them by CatalogId - and GET <RatePath>?revision=<id>
// answers { ok, rates }, one revision's rate rows in card order. Both read the
// engine's `costPricing` service structurally and own no SQL; both answer the
// same unavailable envelope the session route answers when that service is
// absent, because a settings surface must render a state rather than a crash.
//
// The decision chain: a present, non-blank `file` answers the engine's
// contribution rows as { ok: true, contributions }, without an envelope of
// its own; otherwise a blank session id answers code "session" without
// calling the engine; an unknown basis or a malformed revision answers code
// "error" with one line; a missing cost service answers code "unavailable" with
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
import type CostContributionRow from "@Interface/ContributionRow.js";
import type CostResponse from "@Interface/Response.js";
import type CostSummary from "@Interface/Summary.js";
import type CostService from "@playform/plugin-dsh-cost/service";
import type {
	Catalog,
	PricingService,
	RateRow,
	Revision,
	ValuationBasis,
	ValuationSelection,
} from "@playform/plugin-dsh-cost/service";
import Limits from "@Variable/Limits.js";
import Path, { CatalogPath, RatePath } from "@Variable/Path.js";

type WebServer = {
	register(route: {
		path: string;
		handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
	}): () => void;
};

const AbsentMessage =
	"client-dsh-panel-cost: the cost plugin is not loaded - add @playform/plugin-dsh-cost to the profile";

const PricingMessage =
	"client-dsh-panel-cost: the pricing service is not available - @playform/plugin-dsh-cost provides it when its ledger opens, so check that the plugin is loaded and its databasePath opens";

// The four bases the engine's ValuationSelection declares, spelled as a
// record so a fifth basis in the engine's union is a compile error here rather
// than a query this route silently rejects. The browser half mirrors the same
// union, because the transport owns its own validation and imports the engine
// for types only.
const Bases: Readonly<Record<ValuationBasis, true>> = {
	"as-recorded": true,
	corrected: true,
	current: true,
	scenario: true,
};

const Names = Object.keys(Bases).join(", ");

const IsBasis = (Value: string): Value is ValuationBasis => Object.hasOwn(Bases, Value);

const IsWebServer = (Candidate: unknown): Candidate is WebServer =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as WebServer).register === "function";

const IsService = (Candidate: unknown): Candidate is CostService =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as CostService).session === "function";

// IsContributionService - the file-scoped read's own guard: the session
// guard plus the contributions method, so an engine that carries only the
// session read answers the unavailable line instead of throwing a TypeError
// the catch would have to name.
const IsContributionService = (Candidate: unknown): Candidate is CostService =>
	IsService(Candidate) && typeof Candidate.contributions === "function";

// IsPricing - the pricing surface's guard: the three reads the two routes
// carry, so a partial service answers the unavailable line rather than
// throwing inside the route.
const IsPricing = (Candidate: unknown): Candidate is PricingService =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as PricingService).catalogs === "function" &&
	typeof (Candidate as PricingService).revisions === "function" &&
	typeof (Candidate as PricingService).rates === "function";

// The file-scoped answer: the contribution rows under the same
// 200-with-envelope convention as the session read, with the rows unwrapped
// because the engine's contribution read carries no envelope of its own.
type ContributionAnswer = {
	ok: true;
	contributions: readonly CostContributionRow[];
};

// The pricing answers: the catalogs with their revisions, and one revision's
// rate rows. Both are unwrapped the same way the contribution answer is - the
// ok flag is the shape the browser's guard reads.
type CatalogAnswer = {
	ok: true;
	catalogs: readonly Catalog[];
	revisions: readonly Revision[];
};

type RateAnswer = {
	ok: true;
	rates: readonly RateRow[];
};

type AnswerBody = CostResponse | ContributionAnswer | CatalogAnswer | RateAnswer;

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
			// The revision id the routes accept: a positive integer, else null.
			// The raw value stays beside it in the session handler so the route
			// can tell "absent" (the recorded read) from "present but not an
			// id" (one actionable line).
			const RevisionOf = (Raw: string | null): number | null => {
				switch (true) {
					case Raw === null || Raw.trim() === "":
						return null;
					default: {
						const Parsed = Number(Raw);
						return Number.isInteger(Parsed) && Parsed > 0 ? Parsed : null;
					}
				}
			};
			// The selection the engine accepts: absent when the query names no
			// basis (the recorded read, byte-identical to the pre-B4d route),
			// the basis alone when no revision is named (also the recorded
			// read), and both when the panel pinned a revision (the valuation
			// block). The handler already validated the basis; the second check
			// is what narrows the string to the engine's union.
			const Selected = (
				Basis: string | null,
				Revision: number | null,
			): ValuationSelection | undefined => {
				// Early returns, because the narrowing has to survive into the
				// constructed selection; a switch (true) arm cannot carry it.
				if (Basis === null || !IsBasis(Basis)) {
					return undefined;
				}
				if (Revision === null) {
					return { basis: Basis };
				}
				return { basis: Basis, revisionId: Revision };
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
			const Answer = (res: ServerResponse, Body: AnswerBody): void => {
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
			// Failure - the one envelope every code answers through. The route
			// parameter keeps `path` naming the route that failed: the session
			// read answers its own path (the pre-B4d behaviour), and the two
			// pricing routes name theirs so a settings surface can tell which
			// read the message belongs to.
			const Failure = (
				Code: "session" | "unavailable" | "error",
				Message: string,
				Rows: number,
				Route: string = Path,
			): CostResponse => ({
				ok: false,
				code: Code,
				message: Message,
				path: Route,
				rows: Rows,
				truncated: false,
				session: null,
				currency: "USD",
				currencies: [],
				summary: Zero(),
				calls: [],
				files: null,
				stages: null,
				models: null,
			});
			// LedgerFailure - the one mapping of a throwing engine: the
			// ledger's own actionable line for an unopenable file is the
			// "unavailable" state, anything else a read error. Every read
			// answers through it, so a contribution, catalog or rate read fails
			// exactly as the session read does.
			const LedgerFailure = (
				Caught: unknown,
				Rows: number,
				Route: string = Path,
			): CostResponse => {
				const Message = Caught instanceof Error ? Caught.message : String(Caught);
				ctx.logger.warn(`cost route: ${Message}`);
				return Failure(
					Message.startsWith("plugin-dsh-cost: cannot open the ledger")
						? "unavailable"
						: "error",
					Message.startsWith("plugin-dsh-cost: cannot open the ledger")
						? Message
						: `the ledger read failed: ${Message}`,
					Rows,
					Route,
				);
			};
			// Contribution - the file-scoped answer: the engine's own rows,
			// unwrapped, because the contribution read carries no envelope.
			// An absent engine answers the same unavailable line the session
			// read answers, and a throw maps through LedgerFailure.
			const Contribution = (
				res: ServerResponse,
				Engine: unknown,
				File: string,
				Rows: number,
			): void => {
				switch (true) {
					case !IsContributionService(Engine):
						ctx.logger.warn(`cost route: ${AbsentMessage}`);
						Answer(res, Failure("unavailable", AbsentMessage, Rows));
						return;
					default: {
						try {
							Answer(res, {
								ok: true,
								contributions: Engine.contributions(File),
							});
						} catch (Caught) {
							Answer(res, LedgerFailure(Caught, Rows));
						}
					}
				}
			};
			// Catalogs - the catalog list with every revision of each,
			// flattened in catalog order: the Revision row carries its
			// CatalogId, so the settings view groups the two arrays without a
			// nested shape. The engine's own reads answer both lists; this
			// route owns no SQL. The narrowed const keeps the service type
			// inside the flatMap callback.
			const Catalogs = (res: ServerResponse, Engine: unknown): void => {
				switch (true) {
					case !IsPricing(Engine):
						ctx.logger.warn(`cost route: ${PricingMessage}`);
						Answer(
							res,
							Failure("unavailable", PricingMessage, Limits.DefaultRows, CatalogPath),
						);
						return;
					default: {
						try {
							const Pricing = Engine;
							const Listed = Pricing.catalogs();
							const Revisions = Listed.flatMap((One) =>
								Pricing.revisions(One.CatalogId),
							);
							Answer(res, { ok: true, catalogs: Listed, revisions: Revisions });
						} catch (Caught) {
							Answer(res, LedgerFailure(Caught, Limits.DefaultRows, CatalogPath));
						}
					}
				}
			};
			// Rates - one revision's rate rows in card order. The engine's
			// rates read answers an empty list for a revision it does not
			// carry; the route does not invent a row, and a throw maps through
			// LedgerFailure.
			const Rates = (res: ServerResponse, Engine: unknown, RevisionId: number): void => {
				switch (true) {
					case !IsPricing(Engine):
						ctx.logger.warn(`cost route: ${PricingMessage}`);
						Answer(
							res,
							Failure("unavailable", PricingMessage, Limits.DefaultRows, RatePath),
						);
						return;
					default: {
						try {
							Answer(res, { ok: true, rates: Engine.rates(RevisionId) });
						} catch (Caught) {
							Answer(res, LedgerFailure(Caught, Limits.DefaultRows, RatePath));
						}
					}
				}
			};
			Server.register({
				path: Path,
				handler: (req, res) => {
					const Url = new URL(req.url ?? "/", "http://localhost");
					const SessionId = Url.searchParams.get("session") ?? "";
					const File = Url.searchParams.get("file") ?? "";
					const Rows = Applied(Url.searchParams.get("rows"));
					const Basis = Url.searchParams.get("basis");
					const RevisionRaw = Url.searchParams.get("revision");
					const Revision = RevisionOf(RevisionRaw);
					const Engine = ctx.get("cost");
					switch (true) {
						case File.trim() !== "":
							Contribution(res, Engine, File, Rows);
							return;
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
						case Basis !== null && !IsBasis(Basis):
							Answer(
								res,
								Failure(
									"error",
									`client-dsh-panel-cost: the query names the unknown cost basis "${Basis}" - use one of ${Names}`,
									Rows,
								),
							);
							return;
						case RevisionRaw !== null && RevisionRaw.trim() !== "" && Revision === null:
							Answer(
								res,
								Failure(
									"error",
									`client-dsh-panel-cost: the query names the revision "${RevisionRaw}" - a revision id is a positive integer, so add ?revision=<id>`,
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
								Answer(
									res,
									Engine.session(SessionId, Rows, Selected(Basis, Revision)),
								);
							} catch (Caught) {
								Answer(res, LedgerFailure(Caught, Rows));
							}
						}
					}
				},
			});
			Server.register({
				path: CatalogPath,
				handler: (_req, res) => {
					Catalogs(res, ctx.get("costPricing"));
				},
			});
			Server.register({
				path: RatePath,
				handler: (req, res) => {
					const Url = new URL(req.url ?? "/", "http://localhost");
					const Revision = RevisionOf(Url.searchParams.get("revision"));
					switch (true) {
						case Revision === null:
							Answer(
								res,
								Failure(
									"error",
									"client-dsh-panel-cost: the rates route needs a revision id - add ?revision=<id>",
									Limits.DefaultRows,
									RatePath,
								),
							);
							return;
						default:
							Rates(res, ctx.get("costPricing"), Revision);
					}
				},
			});
		}
	}
}
