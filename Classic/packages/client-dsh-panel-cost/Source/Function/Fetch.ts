// Fetch - the browser half of the data path: the session GET (the route
// path with the encoded session id and the row budget, answered as a
// CostResponse), the file-scoped GET that answers the conversations that
// contributed to one file's cost, the deeper file-scoped GET that answers one
// conversation's calls that allocated money to that same file, the lineage GET
// that answers one file's content versions with the touches bound to each, the
// two pricing GETs a settings surface lists (lane B4d): the catalogs with their
// revisions and one revision's rate rows, and the one pricing POST (lane B4f)
// that publishes a revision. None of the functions throws: a runtime without
// fetch, a failed request, a non-JSON answer or a malformed body resolve to
// the unavailable envelope, to an empty contribution list, to an empty call
// list, to an empty version list, to the empty catalog answer, to an empty
// rate list or to a refused publish answer, so the panel can always render a
// state. The envelope's `path` names the route, because the browser knows no
// ledger path; the route's own message names the file.
//
// THE VALUATION SELECTION (lane B4d; the research's section 8): the session
// fetch accepts the basis and the revision the panel selected and sends them
// as query parameters. Without a selection the URL is the recorded one -
// `?session=<id>&rows=<n>` - and the engine answers the recorded envelope; a
// selection adds `basis`, and a pinned revision adds `revision` too. The
// browser validates nothing here: the route owns the four-basis union and
// answers one actionable line for anything else.
import type CostContributionRow from "@Interface/ContributionRow.js";
import type CostResponse from "@Interface/Response.js";
import type {
	Catalog,
	CostFileCallRow,
	CostVersionRow,
	RateRow,
	Revision,
	ValuationSelection,
} from "@playform/plugin-dsh-cost/service";
import Route, { CatalogPath, PublishPath, RatePath } from "@Variable/Path.js";

// The minimal browser fetch surface this module needs (the build targets
// ESNext with node types only, so the browser globals are declared here
// instead of pulling in the full DOM library - the Interface/Document.ts
// pattern). `body` is the one member the publish POST adds: the session, the
// contribution and the two pricing reads all send a bare GET.
declare const fetch:
	| ((
			input: string,
			init?: {
				method?: string | undefined;
				headers?: Record<string, string> | undefined;
				cache?: string | undefined;
				body?: string | undefined;
			},
	  ) => Promise<{ json(): Promise<unknown> }>)
	| undefined;

const IsEnvelope = (Candidate: unknown): Candidate is CostResponse => {
	if (typeof Candidate !== "object" || Candidate === null) {
		return false;
	}
	const Envelope = Candidate as CostResponse;
	return (
		typeof Envelope.ok === "boolean" &&
		typeof Envelope.code === "string" &&
		typeof Envelope.rows === "number" &&
		Array.isArray(Envelope.calls)
	);
};

// Selected - the session request the route reads: the recorded query when no
// selection is given (byte-identical to the request before lane B4d), the
// basis alone when no revision is pinned, and both parameters otherwise. The
// values are encoded exactly as the route decodes them.
const Selected = (SessionId: string, Rows: number, Selection?: ValuationSelection): string => {
	const Query = `${Route}?session=${encodeURIComponent(SessionId)}&rows=${Rows}`;

	// The locals narrow the optional selection; a switch (true) arm cannot
	// narrow the original binding for its later arms.
	const Basis = Selection?.basis;
	const Revision = Selection?.revisionId;
	switch (true) {
		case Basis === undefined:
			return Query;
		case Revision === undefined:
			return `${Query}&basis=${encodeURIComponent(Basis)}`;
		default:
			return `${Query}&basis=${encodeURIComponent(Basis)}&revision=${Revision}`;
	}
};

const Fail = (Message: string, Rows: number): CostResponse => ({
	ok: false,
	code: "unavailable",
	message: Message,
	path: Route,
	rows: Rows,
	truncated: false,
	session: null,
	currency: "USD",
	currencies: [],
	summary: {
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
	},
	calls: [],
	files: null,
	stages: null,
	models: null,
});

export default function Fetch(
	SessionId: string,
	Rows: number,
	Selection?: ValuationSelection,
): Promise<CostResponse> {
	if (typeof fetch !== "function") {
		return Promise.resolve(Fail("the fetch API is not available in this runtime", Rows));
	}
	try {
		return fetch(Selected(SessionId, Rows, Selection), {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		})
			.then((Response) => Response.json())
			.then((Body) =>
				IsEnvelope(Body)
					? Body
					: Fail("the cost route answered a malformed envelope", Rows),
			)
			.catch((Caught) =>
				Fail(
					`the cost route request failed: ${Caught instanceof Error ? Caught.message : String(Caught)}`,
					Rows,
				),
			);
	} catch (Failure) {
		return Promise.resolve(
			Fail(
				`the cost route request failed: ${Failure instanceof Error ? Failure.message : String(Failure)}`,
				Rows,
			),
		);
	}
}

// The file-scoped answer: the engine's contribution rows under the same
// 200-with-envelope convention as the session read, with the rows unwrapped
// because the contribution read carries no envelope of its own.
type ContributionAnswer = {
	readonly ok: true;
	readonly contributions: readonly CostContributionRow[];
};

// IsContributionAnswer - the file-scoped answer's guard: the ok flag and a
// contributions array. The rows themselves are read defensively where they
// render, so the guard stops at the shape the table indexes.
const IsContributionAnswer = (Candidate: unknown): Candidate is ContributionAnswer => {
	if (typeof Candidate !== "object" || Candidate === null) {
		return false;
	}
	const Answer = Candidate as { ok?: unknown; contributions?: unknown };
	return Answer.ok === true && Array.isArray(Answer.contributions);
};

// Contributions - the file-scoped read: one GET to the same route with the
// encoded path, answered as the rows of the conversations that contributed
// to that file's cost. It never throws: a runtime without fetch, a failed
// request, a non-JSON answer or a malformed body all resolve to an empty
// list, so a file row that opens always has a state to render.
export function Contributions(Path: string): Promise<readonly CostContributionRow[]> {
	if (typeof fetch !== "function") {
		return Promise.resolve([]);
	}
	try {
		return fetch(`${Route}?file=${encodeURIComponent(Path)}`, {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		})
			.then((Response) => Response.json())
			.then((Body) => (IsContributionAnswer(Body) ? Body.contributions : []))
			.catch(() => []);
	} catch {
		return Promise.resolve([]);
	}
}

// The per-call answer: the engine's call rows for one file and one
// conversation, unwrapped the same way the contribution answer is - the ok
// flag and the calls array are the shape the table indexes.
type FileCallAnswer = {
	readonly ok: true;
	readonly calls: readonly CostFileCallRow[];
};

// IsFileCallAnswer - the per-call answer's guard: the ok flag and a calls
// array. The rows themselves are read defensively where they render, so the
// guard stops at the shape the table indexes.
const IsFileCallAnswer = (Candidate: unknown): Candidate is FileCallAnswer => {
	if (typeof Candidate !== "object" || Candidate === null) {
		return false;
	}
	const Answer = Candidate as { ok?: unknown; calls?: unknown };
	return Answer.ok === true && Array.isArray(Answer.calls);
};

// FileCalls - the deeper file-scoped read: one GET to the same route with the
// encoded path and the encoded conversation id, answered as the calls of that
// conversation that allocated money to that file. It never throws: a runtime
// without fetch, a failed request, a non-JSON answer or a malformed body all
// resolve to an empty list, so a conversation row that opens always has a
// state to render.
export function FileCalls(Path: string, SessionId: string): Promise<readonly CostFileCallRow[]> {
	if (typeof fetch !== "function") {
		return Promise.resolve([]);
	}
	try {
		return fetch(
			`${Route}?file=${encodeURIComponent(Path)}&conversation=${encodeURIComponent(
				SessionId,
			)}`,
			{
				method: "GET",
				headers: { accept: "application/json" },
				cache: "no-store",
			},
		)
			.then((Response) => Response.json())
			.then((Body) => (IsFileCallAnswer(Body) ? Body.calls : []))
			.catch(() => []);
	} catch {
		return Promise.resolve([]);
	}
}

// The version answer: the file's content versions with the touches bound to
// each, unwrapped the same way the contribution and call answers are - the ok
// flag and the versions array are the shape the block indexes.
type VersionAnswer = {
	readonly ok: true;
	readonly versions: readonly CostVersionRow[];
};

// IsVersionAnswer - the version answer's guard: the ok flag and a versions
// array. The rows themselves are read defensively where they render, so the
// guard stops at the shape the table indexes.
const IsVersionAnswer = (Candidate: unknown): Candidate is VersionAnswer => {
	if (typeof Candidate !== "object" || Candidate === null) {
		return false;
	}
	const Answer = Candidate as { ok?: unknown; versions?: unknown };
	return Answer.ok === true && Array.isArray(Answer.versions);
};

// History - the lineage read: one GET to the same route with the encoded path
// under `history`, answered as the file's content versions, newest first, each
// with the touches bound to it. It never throws: a runtime without fetch, a
// failed request, a non-JSON answer or a malformed body all resolve to an
// empty list, so the block always has a state to render.
export function History(Path: string): Promise<readonly CostVersionRow[]> {
	if (typeof fetch !== "function") {
		return Promise.resolve([]);
	}
	try {
		return fetch(`${Route}?history=${encodeURIComponent(Path)}`, {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		})
			.then((Response) => Response.json())
			.then((Body) => (IsVersionAnswer(Body) ? Body.versions : []))
			.catch(() => []);
	} catch {
		return Promise.resolve([]);
	}
}

// CatalogAnswer - the pricing list the catalogs route answers: every catalog
// the ledger carries and every revision of each, flattened in catalog order
// (the Revision row names its CatalogId). The settings view groups the two
// lists; nothing here is nested, and the answer is empty when the route could
// not be read.
export type CatalogAnswer = {
	readonly catalogs: readonly Catalog[];
	readonly revisions: readonly Revision[];
};

// IsCatalogAnswer - the catalogs answer's guard: the ok flag and both arrays.
const IsCatalogAnswer = (Candidate: unknown): Candidate is CatalogAnswer => {
	if (typeof Candidate !== "object" || Candidate === null) {
		return false;
	}
	const Answer = Candidate as { ok?: unknown; catalogs?: unknown; revisions?: unknown };
	return Answer.ok === true && Array.isArray(Answer.catalogs) && Array.isArray(Answer.revisions);
};

// IsRateAnswer - the rates answer's guard: the ok flag and the rate array.
const IsRateAnswer = (
	Candidate: unknown,
): Candidate is { readonly ok: true; readonly rates: readonly RateRow[] } => {
	if (typeof Candidate !== "object" || Candidate === null) {
		return false;
	}
	const Answer = Candidate as { ok?: unknown; rates?: unknown };
	return Answer.ok === true && Array.isArray(Answer.rates);
};

// Blank - the empty catalog answer a failed read resolves to.
const Blank = (): CatalogAnswer => ({ catalogs: [], revisions: [] });

// Catalogs - the pricing list: one GET to the catalogs route, answered as the
// catalogs and their revisions. It never throws: a runtime without fetch, a
// failed request, a non-JSON answer or a malformed body all resolve to the
// empty answer, so a settings surface always has a state to render.
export function Catalogs(): Promise<CatalogAnswer> {
	if (typeof fetch !== "function") {
		return Promise.resolve(Blank());
	}
	try {
		return fetch(CatalogPath, {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		})
			.then((Response) => Response.json())
			.then((Body) => (IsCatalogAnswer(Body) ? Body : Blank()))
			.catch(() => Blank());
	} catch {
		return Promise.resolve(Blank());
	}
}

// Rates - one revision's rate rows: one GET to the rates route with the
// revision id. It never throws: a runtime without fetch, a failed request, a
// non-JSON answer or a malformed body all resolve to an empty list. A
// revision id that is not a positive integer never reaches the route, because
// the query would only answer the error envelope.
export function Rates(RevisionId: number): Promise<readonly RateRow[]> {
	switch (true) {
		case !Number.isInteger(RevisionId) || RevisionId <= 0:
			return Promise.resolve([]);
		case typeof fetch !== "function":
			return Promise.resolve([]);
		default:
			try {
				return fetch(`${RatePath}?revision=${RevisionId}`, {
					method: "GET",
					headers: { accept: "application/json" },
					cache: "no-store",
				})
					.then((Response) => Response.json())
					.then((Body) => (IsRateAnswer(Body) ? Body.rates : []))
					.catch(() => []);
			} catch {
				return Promise.resolve([]);
			}
	}
}

// PublishRow - one rate row as the publish body carries it: every field the
// engine inserts, and neither ledger-assigned id, because the publish assigns
// the revision id and the row id itself. The host half validates exactly this
// shape and hands the engine the full RateRow, so the browser never invents
// an id and the engine never stores one.
export type PublishRow = Omit<RateRow, "RateRowId" | "RevisionId">;

// PublishRequest - the one write's body: the catalog the revision belongs to,
// the revision the draft corrects (null for a catalog's first revision), the
// reason the audit reads and the whole edited row set. A concurrent publish
// is answered by the engine's own base-revision check, so the caller always
// names the book it was editing.
export type PublishRequest = {
	readonly catalogId: number;
	readonly baseRevisionId: number | null;
	readonly reason: string;
	readonly rows: readonly PublishRow[];
};

// PublishAnswer - the publish route's answer, flat so the caller reads one
// field instead of narrowing a union: the ok flag, the new revision when the
// write landed, and the route's own code, line and path when it did not. An
// error envelope comes back as this value, never as a rejection, so the
// settings surface can render the refusal inline.
export type PublishAnswer = {
	readonly ok: boolean;
	readonly revision: Revision | null;
	readonly code: string;
	readonly message: string | null;
	readonly path: string;
};

// Refused - the answer a failed request resolves to: the route's own line
// when one came back, and the browser's line when the request never landed.
const Refused = (Message: string): PublishAnswer => ({
	ok: false,
	revision: null,
	code: "unavailable",
	message: Message,
	path: PublishPath,
});

// IsRevision - the one field the caller reads off a published revision: an
// answer that names a revision without an id is a malformed answer, not a
// successful publish.
const IsRevision = (Candidate: unknown): Candidate is Revision => {
	if (typeof Candidate !== "object" || Candidate === null) {
		return false;
	}
	const Shape = Candidate as { RevisionId?: unknown };
	return typeof Shape.RevisionId === "number" && Number.isFinite(Shape.RevisionId);
};

// Normalize - the raw answer as the flat PublishAnswer: the success shape
// (`{ ok, revision }`) and the existing error envelope (`{ ok: false, code,
// message, path }`) both land in one record, and anything else is refused
// rather than rendered as a half-read outcome.
const Normalize = (Body: unknown): PublishAnswer => {
	if (typeof Body !== "object" || Body === null) {
		return Refused("the publish route answered a malformed answer");
	}
	const Answer = Body as {
		ok?: unknown;
		revision?: unknown;
		code?: unknown;
		message?: unknown;
		path?: unknown;
	};

	// Early returns, because the narrowing has to survive into the
	// constructed answer; a switch (true) arm cannot carry it.
	const Found = Answer.revision;
	if (Answer.ok === true && IsRevision(Found)) {
		return {
			ok: true,
			revision: Found,
			code: "ok",
			message: null,
			path: PublishPath,
		};
	}
	const Line = Answer.message;
	if (Answer.ok === false && typeof Line === "string") {
		return {
			ok: false,
			revision: null,
			code: typeof Answer.code === "string" ? Answer.code : "error",
			message: Line,
			path: typeof Answer.path === "string" ? Answer.path : PublishPath,
		};
	}
	return Refused("the publish route answered a malformed answer");
};

// Publish - the one write: one POST to the publish route with the whole body
// as JSON. It never throws: a runtime without fetch, a failed request, a
// non-JSON answer or a malformed body all resolve to a refused answer whose
// message is the one line the settings surface shows.
export function Publish(Request: PublishRequest): Promise<PublishAnswer> {
	if (typeof fetch !== "function") {
		return Promise.resolve(Refused("the fetch API is not available in this runtime"));
	}
	try {
		return fetch(PublishPath, {
			method: "POST",
			headers: { accept: "application/json", "content-type": "application/json" },
			cache: "no-store",
			body: JSON.stringify(Request),
		})
			.then((Response) => Response.json())
			.then((Body) => Normalize(Body))
			.catch((Caught) =>
				Refused(
					`the publish request failed: ${
						Caught instanceof Error ? Caught.message : String(Caught)
					}`,
				),
			);
	} catch (Failure) {
		return Promise.resolve(
			Refused(
				`the publish request failed: ${
					Failure instanceof Error ? Failure.message : String(Failure)
				}`,
			),
		);
	}
}
