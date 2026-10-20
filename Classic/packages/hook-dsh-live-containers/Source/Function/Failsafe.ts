// Failsafe - the CAN-4 engine's remaining scenarios (IMPLEMENTATION-DESIGN.md
// section 6). The other scenarios live where their truth is: the hang + the
// live-timeout in Board.ScanDeadlines, the delegation stall in Board
// (the I5 lease: the declaration IS the trigger), the admission guard in
// Policy, the retry loop in Detach, and the section collapse for the phase-1
// frames in Render. This module owns the DRIFT guard (scenario 4) and the
// wave-2 section-collapse pass (scenario 8), plus the channel discipline.
//
// THE CHANNELS (04 section 2, in escalating loudness): 1 ledger only (the
// default), 2 log warn, 3 behavior change only, 4 model-visible note, 5
// user-visible through surfaces the user already reads. The engine is a PURE
// OBSERVER of task shape (live jobs, boards, detached calls, ages, output
// rates, counts) - no message CONTENT is read for trigger evaluation.
//
// SAFETY (04 section 5): every action is fail-open wrapped; the layer can
// NEVER deny a call, drop content, or cancel a job because of its own
// internal error; killing goes through the registry's kill, gated behind
// hangAction/config; `failsafes: "off"` is the default even when enabled.
import type State from "@Interface/State.js";
import Clock from "@Function/Clock.js";
import type { Log } from "@Function/Render.js";

/** The drift thresholds the failsafe layer owns (the validator template's
 * automatic twin; 04 scenario 4 - thresholds are constants of the layer, the
 * session-stats block's own vars are the user-facing twin). */
export const DRIFT_MESSAGES = 200;
export const DRIFT_SINCE_LAST_TOOL_MS = 300000;

/** The drift guard (scenario 4): while a live board is open, session shape
 * crossing a threshold gains a WARN line (channel 4). Returns the WARN line
 * or "" - the caller appends it to the wave-2 section body. */
export const Drift = (
	Agent: State,
	AgentId: string,
	Scope: { messages: number; lastToolAt: number | undefined },
	Append: Log,
): string => {
	try {
		if (Agent.Failsafes !== "on") {
			return "";
		}
		const Boards = Agent.Boards.get(AgentId);
		const Open = [...(Boards?.values() ?? [])].some((Board) => Board.lease.state === "open");
		if (!Open) {
			return "";
		}
		const At = Clock(Agent);
		if (Scope.messages > DRIFT_MESSAGES) {
			Append("failsafe drift (messages)");
			return `WARN: messages=${Scope.messages} exceeds ${DRIFT_MESSAGES} while a live board is open - consider closing or pruning.`;
		}
		if (Scope.lastToolAt !== undefined && At - Scope.lastToolAt > DRIFT_SINCE_LAST_TOOL_MS) {
			Append("failsafe drift (sinceLastTool)");
			return `WARN: no tool for ${Math.round((At - Scope.lastToolAt) / 1000)}s while a live board is open - check the members with live_plant prune or job_output.`;
		}
		return "";
	} catch {
		// Fail-open: a failsafe that cannot act logs and passes through.
		return "";
	}
};

/** The one-line summary a collapsed wave-2 frame leaves behind (never
 * silent - the ledger records the collapse). */
export const WaveSummary = (Separator: string, Head: string, Length: number): string =>
	`${Separator} LIVE (collapsed, ${Length} bytes; not harness state) ${Separator} ${Head}`;

/** The wave-2 section-collapse pass (scenario 8): when the combined section
 * body exceeds sectionBudgetBytes, the OLDEST wave-2 parts collapse to
 * one-line summaries. The phase-1 frames have their own collapse (Render);
 * this pass covers the wave-2 parts. Returns the collapsed body. */
export const Collapse = (Agent: State, Parts: string[], Append: Log): string => {
	const Bytes = (Text: string): number => Buffer.byteLength(Text, "utf8");
	const Total = Parts.map((Part) => Part).join("\n");
	if (Agent.Budget <= 0 || Parts.length <= 1 || Bytes(Total) <= Agent.Budget) {
		return Total;
	}
	const Texts = [...Parts];
	let Count = 0;
	while (Count < Texts.length - 1 && Bytes(Texts.join("\n")) > Agent.Budget) {
		const Oldest = Texts[Count];
		if (Oldest === undefined) {
			break;
		}
		Texts[Count] = WaveSummary(Agent.Separator, Oldest.split("\n")[0] ?? "", Bytes(Oldest));
		Count += 1;
	}
	if (Count > 0) {
		Append(`failsafe section-collapse ${Count}`);
	}
	return Texts.join("\n");
};
