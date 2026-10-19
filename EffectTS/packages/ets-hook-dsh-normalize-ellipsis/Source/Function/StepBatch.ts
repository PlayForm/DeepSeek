// StepBatch - the STEP-BATCH arm of the post-hoc normalization (the plan's
// §4.2): one agent/pre-step waterfall listener per flavor, registered in
// Function/Apply. The arm sees only the INCOMING batch of user-role messages
// for the step (user-authored text plus user-role injected content) - never
// the assistant/tool history (append-only, R2 §3b) - and it is the last
// chance boundary before the model reads them.
//
// Semantics (given pre-step fires per step, R2 §7.2):
//   * next() is ALWAYS awaited first - the downstream decision is
//     authoritative and only an `enter` decision (the step accepted the
//     batch) can have its messages replaced;
//   * CONTINUOUS mode: while the scope gate (`State.Scopes.batch`,
//     refreshed in place by the factory's P10 volatile-update listener) is
//     on, every incoming batch is normalized;
//   * ONE-SHOT mode: the `normalize-overpass batch` command arms
//     `State.Overpass` regardless of the scope value; the flag is consumed
//     by the next batch (cleared after one use, scope value irrelevant);
//   * both off -> the downstream decision passes through UNTOUCHED;
//   * TEXT blocks only, with the same CCR MARKER GUARD as the tool-results
//     arm (Function/Overpass) - normalization never touches a ccr
//     replacement; never assistant/tool history;
//   * N = 0 -> the downstream decision unchanged (no ledger line);
//   * N > 0 -> `{ ...Decision, messages: <rewritten> }` and the ledger line
//     `overpass: normalized N char(s) in step batch (turn T step S)` via
//     Factory.Append, plus the shared `normalized` journal event with the
//     scope in the path slot;
//   * re-normalizing injected content across steps is harmless: the
//     transforms are idempotent on their own output (ASCII-replacement maps
//     are fixed points);
//   * FAIL-OPEN: one try/catch around everything - on any error the
//     downstream decision is returned UNCHANGED (never throw into the
//     waterfall).
//
// The FLAVOR: the flavor transform - its own Replace delegate pinned to the
// configured replacement (read from State at call time, so a volatile
// hot-edit takes effect on the next batch exactly like the other arms).
//
// Pure per call: no module-level state - the one-shot flag lives on the
// per-apply State object, so an HMR reload resets it cleanly.
import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import { DefaultScopes, RewriteBlocks } from "./Overpass.js";
import Replace from "./Replace.js";
import type State from "@Interface/State.js";

/** A structural pre-step payload: only the fields the arm reads. */
type Payload = { turn?: unknown; step?: unknown; messages?: readonly unknown[] };

/** The agent/pre-step arm (the listener body; Function/Apply registers it
 *  with default ordering - nothing needs to precede it). */
export default async (
	P: Payload,
	Next: () => Promise<PreStepDecision>,
	State: State,
): Promise<PreStepDecision> => {
	// next() FIRST: the downstream listeners settle before any decision.
	const Decision = await Next();
	try {
		// The gates: continuous while the batch scope is on; the one-shot arm
		// from the command fires regardless of the scope value and is
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
			const NextContent = RewriteBlocks(Content, (Text) => Replace(Text, State.Replacement), Count);
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
		const Line = `overpass: normalized ${Count.value} char(s) in step batch (turn ${Turn} step ${Step})`;
		State.Factory.Append(State, Line);
		// P5 journal - the shared `normalized` event with the scope in the
		// path slot, best-effort (with no storage facility this is a no-op).
		State.Factory.Journal(State, "normalized", `step batch (turn ${Turn} step ${Step})`, Line);
		// The replacement preserves the rest of the decision (kind and any
		// startsRequestSeries ride along).
		return { ...Decision, messages: Rewritten as typeof Messages };
	} catch {
		// Fail-open: keep the downstream decision, never throw into the
		// waterfall.
		return Decision;
	}
};
