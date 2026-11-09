// Fetch - the browser half of the data path: the session GET (the route
// path with the encoded session id and the row budget, answered as a
// CostResponse) and the file-scoped GET that answers the conversations that
// contributed to one file's cost. Neither function throws: a runtime
// without fetch, a failed request, a non-JSON answer or a malformed body
// resolve to the unavailable envelope and to an empty contribution list, so
// the panel can always render a state. The envelope's `path` names the
// route, because the browser knows no ledger path; the route's own message
// names the file.
import type CostContributionRow from "@Interface/ContributionRow.js";
import type CostResponse from "@Interface/Response.js";
import Route from "@Variable/Path.js";

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

export default function Fetch(SessionId: string, Rows: number): Promise<CostResponse> {
	if (typeof fetch !== "function") {
		return Promise.resolve(Fail("the fetch API is not available in this runtime", Rows));
	}
	try {
		return fetch(`${Route}?session=${encodeURIComponent(SessionId)}&rows=${Rows}`, {
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
