// Fetch - the browser half of the data path: the session GET (the route
// path with the encoded session id and the row budget, answered as a
// CostResponse), the file-scoped GET that answers the conversations that
// contributed to one file's cost, and the two pricing GETs a settings surface
// lists (lane B4d): the catalogs with their revisions and one revision's rate
// rows. None of the functions throws: a runtime without fetch, a failed
// request, a non-JSON answer or a malformed body resolve to the unavailable
// envelope, to an empty contribution list, to the empty catalog answer or to
// an empty rate list, so the panel can always render a state. The envelope's
// `path` names the route, because the browser knows no ledger path; the
// route's own message names the file.
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
	RateRow,
	Revision,
	ValuationSelection,
} from "@playform/plugin-dsh-cost/service";
import Route, { CatalogPath, RatePath } from "@Variable/Path.js";

// The minimal browser fetch surface this module needs (the build targets
// ESNext with node types only, so the browser globals are declared here
// instead of pulling in the full DOM library - the Interface/Document.ts
// pattern).
declare const fetch:
	| ((
			input: string,
			init?: {
				method?: string | undefined;
				headers?: Record<string, string> | undefined;
				cache?: string | undefined;
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
	switch (true) {
		case Selection === undefined:
			return Query;
		case Selection.revisionId === undefined:
			return `${Query}&basis=${encodeURIComponent(Selection.basis)}`;
		default:
			return `${Query}&basis=${encodeURIComponent(Selection.basis)}&revision=${Selection.revisionId}`;
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
