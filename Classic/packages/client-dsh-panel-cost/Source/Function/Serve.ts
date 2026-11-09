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
// THE PUBLISH ROUTE (lane B4f) is the surface's one write: POST <PublishPath>
// with a JSON body of { catalogId, baseRevisionId, reason, rows } answers
// { ok, revision } after the engine's `publish` inserted one published
// revision and its rate rows in one transaction. The transport owns the body
// boundary: it caps the size, parses the JSON, validates every field the
// engine inserts (a non-negative rate, a currency, a mode, a window, a
// half-open interval, a tier band that does not invert) and refuses with the
// existing error envelope and one actionable line. Nothing observed is
// written: the route can only add a revision and its rate rows, and a refused
// publish leaves the ledger exactly as it was. The route is appended after
// `rates`, so the three reads keep their registration order.
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
import Path, { CatalogPath, PublishPath, RatePath } from "@Variable/Path.js";

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

// The publish route's own refusals: a body the transport cannot read never
// reaches the engine, so its line is the transport's; a body the engine
// refuses keeps the engine's line, which already names what to fix.
const BodyMessage =
	"client-dsh-panel-cost: the publish route needs a JSON body - POST { catalogId, baseRevisionId, reason, rows }";

const MethodMessage =
	"client-dsh-panel-cost: the publish route accepts POST only - send the revision as a POST body";

// The publish body's cap: one rate book is a few hundred rows, so a megabyte
// is generous and a runaway upload is refused before it is parsed.
const MaxBody = 1_000_000;

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

// IsPublisher - the publish route's guard: the three reads plus the one
// write, so a service that only lists answers the unavailable line instead of
// throwing a TypeError inside the route.
const IsPublisher = (Candidate: unknown): Candidate is PricingService =>
	IsPricing(Candidate) && typeof (Candidate as PricingService).publish === "function";

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

// The publish answer: the one write's new revision, unwrapped the same way
// the pricing reads are.
type PublishAnswer = {
	ok: true;
	revision: Revision;
};

// The publish body the transport hands the engine: the catalog, the base
// revision the draft corrects, the reason the audit reads and the rate rows
// the revision will carry. The field names are the body's own, so the
// validation reads as the wire shape it checks.
type PublishBody = {
	readonly CatalogId: number;
	readonly BaseRevisionId: number | null;
	readonly Reason: string;
	readonly Rows: readonly RateRow[];
};

type AnswerBody = CostResponse | ContributionAnswer | CatalogAnswer | RateAnswer | PublishAnswer;

// The body reader: the JSON text a POST carries, capped at one rate book's
// worth. A request the port cannot read, or one that runs past the cap, is
// refused with the transport's own line before any parsing happens.
const Read = (req: IncomingMessage): Promise<string> =>
	new Promise<string>((Done, Fail) => {
		switch (true) {
			case typeof req.on !== "function":
				Fail(new Error(BodyMessage));
				return;
			default: {
				let Text = "";
				let Size = 0;
				req.on("data", (Chunk: Buffer | string) => {
					Size += Chunk.length;
					switch (true) {
						case Size > MaxBody:
							Fail(
								new Error(
									"client-dsh-panel-cost: the publish body is larger than one megabyte - publish one rate book at a time",
								),
							);
							return;
						default:
							Text += Chunk.toString();
					}
				});
				req.on("end", () => {
					Done(Text);
				});
				req.on("error", (Failure: Error) => {
					Fail(Failure);
				});
			}
		}
	});

// Parse - the body text as a JSON value, or the transport's one line. An
// empty body is the same refusal as an unparseable one, because a publish
// with no body names no catalog and no rate row.
const Parse = (Text: string): unknown => {
	switch (true) {
		case Text.trim() === "":
			throw new Error(BodyMessage);
		default: {
			try {
				return JSON.parse(Text) as unknown;
			} catch {
				throw new Error(BodyMessage);
			}
		}
	}
};

const Label = (Value: unknown): string => (typeof Value === "string" ? Value : "");

const Figure = (Value: unknown): number | null =>
	typeof Value === "number" && Number.isFinite(Value) ? Value : null;

// Required - one required rate of a rate row: a non-negative finite number,
// else the one line naming the row and the field. The engine stores what this
// validated, so the transport refuses rather than storing a guess.
const Required = (Value: unknown, Index: number, Field: string): number => {
	const Parsed = Figure(Value);
	if (Parsed === null || Parsed < 0) {
		throw new Error(
			`client-dsh-panel-cost: rate row ${Index} carries no usable ${Field} - a rate is a non-negative number`,
		);
	}
	return Parsed;
};

// OptionalRate - one optional rate: absent and null both mean the bucket is
// not separately priced, a non-negative finite number is the rate, and
// anything else is refused, because a missing rate must stay unpriced rather
// than become a zero.
const OptionalRate = (Value: unknown, Index: number, Field: string): number | null => {
	switch (true) {
		case Value === null || Value === undefined:
			return null;
		default: {
			const Parsed = Figure(Value);
			if (Parsed === null || Parsed < 0) {
				throw new Error(
					`client-dsh-panel-cost: rate row ${Index} carries an unusable ${Field} - a rate is a non-negative number or null`,
				);
			}
			return Parsed;
		}
	}
};

// OptionalMoment - one optional instant: null means the interval or the tier
// is open, a finite number is the bound, and anything else is refused.
const OptionalMoment = (Value: unknown, Index: number, Field: string): number | null => {
	switch (true) {
		case Value === null || Value === undefined:
			return null;
		default: {
			const Parsed = Figure(Value);
			if (Parsed === null) {
				throw new Error(
					`client-dsh-panel-cost: rate row ${Index} carries an unusable ${Field} - an instant is epoch milliseconds or null`,
				);
			}
			return Parsed;
		}
	}
};

// RowOf - one rate row of the publish body, validated field by field: the
// identity fields a card cannot do without, the two required rates, the three
// optional ones, the half-open interval and the tier band. The two
// ledger-assigned ids are placeholders, because publish assigns the revision
// id and the row id and never reads what the caller sent there.
const RowOf = (Value: unknown, Index: number): RateRow => {
	if (typeof Value !== "object" || Value === null) {
		throw new Error(
			`client-dsh-panel-cost: rate row ${Index} is not an object - every row needs provider, model, currency, the two token rates and a valid-from instant`,
		);
	}
	const Row = Value as Record<string, unknown>;
	const Provider = Label(Row["Provider"]);
	const Model = Label(Row["Model"]);
	const Currency = Label(Row["Currency"]);
	const Mode = Label(Row["Mode"]);
	const Window = Label(Row["Window"]);
	switch (true) {
		case Provider === "":
			throw new Error(
				`client-dsh-panel-cost: rate row ${Index} names no provider - every row needs provider and model`,
			);
		case Model === "":
			throw new Error(
				`client-dsh-panel-cost: rate row ${Index} names no model - every row needs provider and model`,
			);
		case Currency === "":
			throw new Error(
				`client-dsh-panel-cost: rate row ${Index} carries no currency - one currency per row`,
			);
		case Mode === "":
			throw new Error(
				`client-dsh-panel-cost: rate row ${Index} carries no mode - use "standard" when the row is not mode-specific`,
			);
		case Window === "":
			throw new Error(
				`client-dsh-panel-cost: rate row ${Index} carries no window - use "any" when the row is not window-specific`,
			);
		default:
	}
	const ValidFrom = Required(Row["ValidFrom"], Index, "valid-from instant");
	const ValidTo = OptionalMoment(Row["ValidTo"], Index, "valid-to instant");
	switch (true) {
		case ValidTo !== null && ValidTo <= ValidFrom:
			throw new Error(
				`client-dsh-panel-cost: rate row ${Index} ends at or before it starts - the interval is half-open, so ValidTo must be after ValidFrom`,
			);
		default:
	}
	const TierFrom = Required(Row["TierFrom"], Index, "tier floor");
	const TierTo = OptionalMoment(Row["TierTo"], Index, "tier ceiling");
	switch (true) {
		case TierTo !== null && TierTo <= TierFrom:
			throw new Error(
				`client-dsh-panel-cost: rate row ${Index} ends its tier at or before its floor - TierTo must be above TierFrom`,
			);
		default:
	}
	return {
		RateRowId: 0,
		RevisionId: 0,
		Provider,
		Model,
		Currency,
		InputRate: Required(Row["InputRate"], Index, "input rate"),
		OutputRate: Required(Row["OutputRate"], Index, "output rate"),
		CacheReadRate: OptionalRate(Row["CacheReadRate"], Index, "cache read rate"),
		CacheWriteRate: OptionalRate(Row["CacheWriteRate"], Index, "cache write rate"),
		ReasoningRate: OptionalRate(Row["ReasoningRate"], Index, "reasoning rate"),
		ValidFrom,
		ValidTo,
		Mode,
		Region: typeof Row["Region"] === "string" ? Row["Region"] : null,
		Window,
		TierFrom,
		TierTo,
		Note: typeof Row["Note"] === "string" ? Row["Note"] : null,
	};
};

// RequestOf - the publish body the engine accepts: one catalog, the base
// revision the draft corrects, the reason the audit reads and the rate rows
// the revision carries. Every field is validated here because the browser is
// the only writer and the ledger must never receive a half-formed book.
const RequestOf = (Value: unknown): PublishBody => {
	if (typeof Value !== "object" || Value === null || Array.isArray(Value)) {
		throw new Error(BodyMessage);
	}
	const Body = Value as Record<string, unknown>;
	// The two locals carry the narrowing: a switch (true) arm cannot narrow
	// the original binding for the value the return below constructs, so each
	// validated figure is re-bound to its narrowed type first.
	const Stated = Figure(Body["catalogId"]);
	switch (true) {
		case Stated === null || !Number.isInteger(Stated) || Stated <= 0:
			throw new Error(
				"client-dsh-panel-cost: the publish body names no catalog - catalogId must be a positive integer",
			);
		default:
	}
	const CatalogId = Stated === null ? 0 : Stated;
	const Raw = Body["baseRevisionId"];
	const BaseRevisionId = Raw === null || Raw === undefined ? null : Figure(Raw);
	switch (true) {
		case BaseRevisionId !== null && (!Number.isInteger(BaseRevisionId) || BaseRevisionId <= 0):
			throw new Error(
				"client-dsh-panel-cost: baseRevisionId must be a positive integer or null - a revision corrects the revision it names",
			);
		default:
	}
	const Reason = Label(Body["reason"]).trim();
	switch (true) {
		case Reason === "":
			throw new Error(
				"client-dsh-panel-cost: the publish body carries no reason - say what changed and why",
			);
		default:
	}
	const Listed = Body["rows"];
	// Early throw, because the narrowing has to survive into the row walk; a
	// switch (true) arm cannot carry it.
	if (!Array.isArray(Listed) || Listed.length === 0) {
		throw new Error(
			"client-dsh-panel-cost: the publish body carries no rate row - a revision needs at least one",
		);
	}
	const Rows: RateRow[] = [];
	for (const [Index, One] of Listed.entries()) {
		Rows.push(RowOf(One, Index + 1));
	}
	return { CatalogId, BaseRevisionId, Reason, Rows };
};

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
			// Published - the one write: the body is read, parsed and
			// validated by the transport, then the engine publishes the
			// revision and its rate rows inside its own transaction. A refused
			// publish keeps the engine's one actionable line; a body the
			// transport cannot read answers its own. Nothing observed is
			// written - only a revision and its rate rows can land.
			const Published = async (
				res: ServerResponse,
				Engine: unknown,
				req: IncomingMessage,
			): Promise<void> => {
				switch (true) {
					case !IsPublisher(Engine):
						ctx.logger.warn(`cost route: ${PricingMessage}`);
						Answer(
							res,
							Failure("unavailable", PricingMessage, Limits.DefaultRows, PublishPath),
						);
						return;
					default: {
						try {
							const Pricing = Engine;
							const Request = RequestOf(Parse(await Read(req)));
							Answer(res, {
								ok: true,
								revision: Pricing.publish(
									Request.CatalogId,
									Request.BaseRevisionId,
									Request.Reason,
									Request.Rows,
								),
							});
						} catch (Caught) {
							const Message =
								Caught instanceof Error ? Caught.message : String(Caught);
							ctx.logger.warn(`cost route: ${Message}`);
							Answer(res, Failure("error", Message, Limits.DefaultRows, PublishPath));
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
			// The one write, appended after the three reads so their order is
			// unchanged. A GET answers the method line rather than reading a
			// body that cannot be there, and the POST itself hands the body to
			// the one handler that validates and publishes it.
			Server.register({
				path: PublishPath,
				handler: (req, res) => {
					switch (true) {
						case req.method !== "POST":
							ctx.logger.warn(`cost route: ${MethodMessage}`);
							Answer(
								res,
								Failure("error", MethodMessage, Limits.DefaultRows, PublishPath),
							);
							return;
						default:
							return Published(res, ctx.get("costPricing"), req);
					}
				},
			});
		}
	}
}
