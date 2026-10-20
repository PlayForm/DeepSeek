// StepBatch - the STEP-BATCH arm of the post-hoc normalization, as a FACTORY
// over the shared machinery: one `agent/pre-step` waterfall listener per
// flavor, built from four injected pieces and registered in the flavor's
// Function/Apply. The arm sees only the INCOMING batch of user-role messages
// for the step (user-authored text plus user-role injected content) - never
// the assistant/tool history (append-only) - and it is the last chance
// boundary before the model reads them.
//
// The parameterization boundary (the plan's section 3.1):
//   * Transform(Text, State) - the flavor's replacement, read PER CALL from
//     the (volatile-refreshed) State, so a hot-edited replacement lands on
//     the next batch; the one-argument fullwidth delegate ignores State.
//   * Line - the module's ledger-line composer, REQUIRED: the module owns its
//     strings, the core owns only the mechanics. StepBatch's arity is
//     `(Count, Turn, Step)`; the module returns the exact line it asserts.
//   * Ledger { Append, Journal } - the factory's ledger sink, INJECTED, so
//     the core never names the factory's type (and the Append(State) shape
//     stays the module's own).
//   * State - the flavor's per-apply state, structurally narrowed here to
//     the two cells this arm reads (`Scopes.batch`, the one-shot `Overpass`).
//
// Semantics (given pre-step fires per step):
//   * next() is ALWAYS awaited first - the downstream decision is
//     authoritative and only an `enter` decision (the step accepted the
//     batch) can have its messages replaced;
//   * CONTINUOUS mode: while the scope gate (`State.Scopes.batch`) is on,
//     every incoming batch is normalized;
//   * ONE-SHOT mode: the `normalize-overpass batch` command arms
//     `State.Overpass` regardless of the scope value; the flag is consumed
//     by the next batch (cleared after one use, scope value irrelevant);
//   * both off -> the downstream decision passes through UNTOUCHED;
//   * TEXT blocks only, with the same CCR MARKER GUARD as the tool-results
//     arm (Overpass/Blocks) - normalization never touches a CCR replacement;
//     never assistant/tool history;
//   * N = 0 -> the downstream decision unchanged (no ledger line);
//   * N > 0 -> `{ ...Decision, messages: <rewritten> }` and the module's
//     ledger line via Ledger.Append, plus the shared `normalized` journal
//     event with the scope in the path slot;
//   * re-normalizing injected content across steps is harmless: the
//     transforms are idempotent on their own output (ASCII-replacement maps
//     are fixed points);
//   * FAIL-OPEN: one try/catch around everything - on any error the
//     downstream decision is returned UNCHANGED (never throw into the
//     waterfall).
//
// Pure per call: no module-level state - the one-shot flag lives on the
// per-apply State object, so an HMR reload resets it cleanly.
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

/** The structural scope cells the arms read (all optional: a hand-built
 *  config may omit the object entirely). */
type Scopes = {
	conversation?: boolean | undefined;
	reasoning?: boolean | undefined;
	toolInput?: boolean | undefined;
	toolResults?: boolean | undefined;
	files?: boolean | undefined;
	batch?: boolean | undefined;
};

/** The per-apply state cells the step-batch arm reads. */
type State = {
	Scopes?: Scopes | undefined;
	Overpass?: boolean | undefined;
};

/** The structural pre-step payload: only the fields the arm reads. */
type Payload = { turn?: unknown; step?: unknown };

/** The structural pre-step decision: the arm only reads `kind`/`messages`. */
type Decision = { kind?: unknown; messages?: readonly unknown[] };

/** The injected ledger sink: the factory's Append/Journal, module-typed. */
type Ledger<S> = {
	Append: (State: S, Line: string) => void;
	Journal: (State: S, Event: string, Path: string, Value: string) => void;
};

export default <S extends State, P extends Payload = Payload, D extends Decision = Decision>(
		Transform: (Text: string, State: S) => { text: string; count: number },
		Line: (Count: number, Turn: number, Step: number) => string,
		Ledger: Ledger<S>,
	) =>
	async (P: P, Next: () => Promise<D>, State: S): Promise<D> => {
		// next() FIRST: the downstream listeners settle before any decision.
		const Decision = await Next();
		try {
			// The gates: continuous while the batch scope is on; the one-shot
			// arm from the command fires regardless of the scope value and is
			// consumed here (cleared after one use).
			const Scopes = State.Scopes ?? DefaultScopes;
			const OneShot = State.Overpass === true;
			State.Overpass = false;
			switch (true) {
				case !Scopes.batch && !OneShot:
					return Decision;
				case Decision.kind !== "enter":
					return Decision; // the step was rejected - nothing to normalize
			}
			const Messages = Decision.messages;
			if (!Array.isArray(Messages)) {
				return Decision;
			}
			const Count = { value: 0 };
			// Rewrite the text blocks of each message's content; a message with
			// no rewritten block keeps its identity.
			let Changed = false;
			const Rewritten = Messages.map((Message) => {
				const Content = (Message as { content?: unknown })?.content;
				if (!Array.isArray(Content)) {
					return Message;
				}
				const NextContent = RewriteBlocks(Content, (Text) => Transform(Text, State), Count);
				switch (true) {
					case NextContent === Content:
						return Message;
				}
				Changed = true;
				return { ...(Message as object), content: NextContent };
			});
			// N = 0 -> the downstream decision unchanged (no ledger line).
			if (!Changed) {
				return Decision;
			}
			const Turn = typeof P?.turn === "number" && Number.isFinite(P.turn) ? P.turn : 0;
			const Step = typeof P?.step === "number" && Number.isFinite(P.step) ? P.step : 0;
			const LineText = Line(Count.value, Turn, Step);
			Ledger.Append(State, LineText);
			// The shared `normalized` event with the scope in the path slot,
			// best-effort (with no storage facility this is a no-op).
			Ledger.Journal(State, "normalized", `step batch (turn ${Turn} step ${Step})`, LineText);
			// The replacement preserves the rest of the decision (kind and any
			// startsRequestSeries ride along).
			return { ...Decision, messages: Rewritten } as D;
		} catch {
			// Fail-open: keep the downstream decision, never throw into the
			// waterfall.
			return Decision;
		}
	};
