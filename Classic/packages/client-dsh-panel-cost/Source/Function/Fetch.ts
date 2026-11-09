// Fetch - the browser half of the data path: one GET to the route path with
// the encoded session id and the row budget, answered as a CostResponse.
// The function never throws: a runtime without fetch, a failed request, a
// non-JSON answer or a malformed envelope all resolve to the unavailable
// envelope with one actionable line, so the panel can always render a
// state. The envelope's `path` names the route, because the browser knows
// no ledger path; the route's own message names the file.
import type CostResponse from "@Interface/Response.js";
import Path from "@Variable/Path.js";

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
	path: Path,
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
});

export default function Fetch(SessionId: string, Rows: number): Promise<CostResponse> {
	if (typeof fetch !== "function") {
		return Promise.resolve(Fail("the fetch API is not available in this runtime", Rows));
	}
	try {
		return fetch(`${Path}?session=${encodeURIComponent(SessionId)}&rows=${Rows}`, {
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
