// ToolResults - the TOOL-RESULTS arm of the post-hoc normalization, as a
// FACTORY over the shared machinery: one `tools/post-execute` waterfall
// listener per flavor, built from four injected pieces and registered in the
// flavor's Function/Apply next to the llm/stream listener. A tool result here
// is PRE-COMMIT (the waterfall settles before the result is appended to the
// durable log), so rewriting it is not history rewriting.
//
// The parameterization boundary:
//   * Transform(Text, State) - the flavor's replacement, read PER CALL from
//     the (volatile-refreshed) State; the one-argument fullwidth/quotes
//     delegates ignore State.
//   * Line - the module's ledger-line composer, REQUIRED. Arity is
//     `(Count, Name, CallID)`.
//   * Ledger { Append, Journal } - the factory's ledger sink, INJECTED.
//   * Exempt - the module's schema-default exemption list. The per-apply
//     `State.Exempt` cell wins when present, preserving the volatile
//     `toolResultsExempt` refresh.
//
// Semantics:
//   * next() is ALWAYS awaited first;
//   * the scope gate (`State.Scopes.toolResults`): off -> the downstream
//     decision passes through UNTOUCHED (the default - the arm is opt-in);
//   * the exemption list: a listed exec name passes through by identity;
//   * only an accepted, non-value-carrying decision can be replaced
//     (`Object.hasOwn(Decision, "value")` - a value-carrying decision is
//     canonical);
//   * the content basis is `Decision.content ?? Result.content`;
//   * TEXT blocks only, with the CCR MARKER GUARD (Overpass/Blocks): a text
//     block already carrying the CCR spill marker bytes passes through
//     untouched - normalization never touches a CCR replacement, which makes
//     the arm order-safe against the CCR hook's own prepended post-execute
//     listener under ANY bundle load order;
//   * N = 0 -> the downstream decision unchanged (no ledger line);
//   * N > 0 -> `{ kind: "accept", content: <rewritten blocks> }` and the
//     module's ledger line via Ledger.Append, plus the shared `normalized`
//     journal event with the scope in the path slot;
//   * FAIL-OPEN: the whole arm is one try/catch - on any error the
//     downstream decision is returned UNCHANGED.
//
// The registration is `{ prepend: true }` in the flavor's Apply: the arm that
// prepends later is OUTERMOST, and the marker guard makes any load order safe.
//
// Pure per call: no module-level state - two concurrent dispatches share
// nothing, and an HMR reload rebinds the closure cleanly.
import RewriteBlocks from "./Blocks.js";

/** The schema-default scope gates (the fallback for a hand-built config). */
const DefaultScopes = {
	conversation: true,
	reasoning: true,
	toolInput: false,
	toolResults: false,
	files: true,
	batch: false,
};

/** The structural scope cells the arm reads (all optional). */
type Scopes = {
	conversation?: boolean | undefined;
	reasoning?: boolean | undefined;
	toolInput?: boolean | undefined;
	toolResults?: boolean | undefined;
	files?: boolean | undefined;
	batch?: boolean | undefined;
};

/** The per-apply state cells the tool-results arm reads. */
type State = {
	Scopes?: Scopes | undefined;
	Exempt?: string[] | undefined;
};

/** The structural tool execution: only the fields the arm reads. */
type Execution = { name?: unknown; callId?: unknown };

/** The structural tool execution result: only the content basis. */
type Result = { content?: unknown };

/** The structural post-tool decision: the fields the arm reads/writes. */
type Decision = { kind?: unknown; content?: readonly unknown[]; value?: unknown };

/** The injected ledger sink: the factory's Append/Journal, module-typed. */
type Ledger<S> = {
	Append: (State: S, Line: string) => void;
	Journal: (State: S, Event: string, Path: string, Value: string) => void;
};

export default <S extends State, D extends Decision = Decision>(
		Transform: (Text: string, State: S) => { text: string; count: number },
		Line: (Count: number, Name: string, CallID: string) => string,
		Ledger: Ledger<S>,
		Exempt: readonly string[],
	) =>
	async (Exec: Execution, Result: Result, Next: () => Promise<D>, State: S): Promise<D> => {
		// next() FIRST: the downstream listeners settle before any decision.
		const Decision = await Next();
		try {
			// The scope gate: off -> the downstream decision passes untouched.
			const Scopes = State.Scopes ?? DefaultScopes;
			switch (true) {
				case !Scopes.toolResults:
					return Decision;
			}
			// The exemption list: a listed exec name passes by identity.
			const List = State.Exempt ?? Exempt;
			switch (true) {
				case typeof Exec?.name === "string" && List.includes(Exec.name):
					return Decision;
			}
			// Only an accepted, non-value-carrying decision can be replaced.
			switch (true) {
				case Decision.kind !== "accept":
				case Object.hasOwn(Decision, "value"):
					return Decision;
			}
			// The content basis: what downstream shaped, or the raw result.
			const Content = Decision.content ?? Result.content;
			if (!Array.isArray(Content)) {
				return Decision;
			}
			const Count = { value: 0 };
			const Rewritten = RewriteBlocks(Content, (Text) => Transform(Text, State), Count);
			switch (true) {
				// N = 0 -> the downstream decision unchanged (no ledger line).
				case Count.value === 0:
					return Decision;
			}
			const Name = typeof Exec?.name === "string" ? Exec.name : "";
			const CallID = typeof Exec?.callId === "string" ? Exec.callId : "";
			const LineText = Line(Count.value, Name, CallID);
			Ledger.Append(State, LineText);
			// The shared `normalized` event with the scope in the path slot.
			Ledger.Journal(State, "normalized", `tool result ${Name} ${CallID}`, LineText);
			// The replacement: `{ kind: "accept", content: <rewritten blocks> }`
			// (the value case was excluded above). The rewrite only replaces the
			// `text` field of text blocks and spreads the rest verbatim.
			return { kind: "accept", content: Rewritten } as unknown as D;
		} catch {
			// Fail-open: keep the downstream decision, never throw into the
			// waterfall.
			return Decision;
		}
	};
