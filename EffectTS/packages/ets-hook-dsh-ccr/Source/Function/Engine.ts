// Engine - the phase-4 CONTEXT ENGINE (config `contextEngine`, OFF by
// default): middle-turn archiving of accumulated tool-result bytes at the
// `agent/pre-step` waterfall boundary (the plan §7 phase 4; Aphrodite's
// context engine, R:173-179, protectFirst/protectLast included).
//
// THE DECISION MATH (pure, exported for the smoke - no I/O, no clock, no
// state):
//   * ThresholdBytes(Budget, Pct) - the fill limit in bytes: Pct% of the
//     NOMINAL budget. The nominal budget is the STORE's budget
//     (`storeBudgetBytes`, default 268435456) - the plan's only byte-scale
//     reference for "how full is full"; a dedicated constant would duplicate
//     it. 30% of 268435456 = 80530636 bytes.
//   * Eligible(Records, CurrentTurn, ProtectFirst, ProtectLast) - the MIDDLE
//     records only: a record is eligible when its turn is PAST the first
//     `protectFirstTurns` turns (the protected head) and AT OR BEFORE
//     `CurrentTurn - protectLastTurns` (the protected tail window is never
//     touched).
//   * Decide(...) - the per-pre-step verdict: the threshold crossed AND
//     middle records to retire, or undefined (nothing happens - including
//     the crossing-with-no-middles case, which is a deliberate no-op).
//
// THE RUNTIME (per-apply, built in Function/Apply ONLY when the flag is on):
// a turn cursor plus the observation log. The tools/post-execute listener
// tags every non-empty result with the current turn and either its CONTENT
// (a pass-through result - the only kind the engine may need to archive, it
// was never stored) or its HASH (already in the store). At the next
// pre-step the decision runs; every archived content record is pushed
// through the EXISTING compress path (Function/Compress with the gate
// opened - Threshold 0, autoExpand off - so the record always lands in the
// store, with the same exemptions, multipliers, TTL and LRU accounting) and
// leaves the accumulator; hash records leave it directly (their content is
// already stored and retrievable). The archived count is the ledger line
// `ccr: engine archived <n> results` (the module's own string, composed in
// Function/Apply via Factory.Append like every other line).
//
// THE EVENT (verified, not invented): `agent/pre-step` is a real waterfall.
// The harness's own shipped type declaration (`@deepseek-ai/dsh-agent`
// lib/types/runtime-types.d.ts:304, mirrored by
// docs/event-producer-consumer.md's agent/pre-step row: mode `waterfall`,
// produced by agent-loop) declares
//
//     'agent/pre-step'(payload: { agent, messages, turn, step, signal },
//                      next) => Promise<PreStepDecision>
//
// - listeners must call `next()` and the returned decision is
// authoritative. The engine is a PURE OBSERVER: it awaits `next()` first,
// never rewrites the decision, and fails open (a logger.warn plus the
// unchanged decision - never a throw into the waterfall). There is NO
// existing `agent/pre-step` listener precedent anywhere in the family (the
// grep of Boilerplate/Classic/EffectTS Source trees and the live profile's
// bundles returned none, 2026-10-19) - this is the first, registered with
// no options (default ordering: the engine does not need to precede
// anyone, it only observes).
//
// THE DOCUMENTED LIMITATION (the honest MVP): archiving here means "stored
// + tracked", NOT "removed from the model's context". The pre-step decision
// contract covers only the newly CLAIMED input messages (docs/architecture.md:
// "Listeners may rewrite or reject claimed messages"), not the history, so
// the engine cannot legally rewrite past turns; the marker replacement into
// history (Aphrodite's real context shrink) needs a history-rewrite channel
// phase 4 does not have. What the engine DOES deliver: the fill accounting,
// the protect windows, and the store integration - every archived result is
// retrievable via ccr_retrieve through the same compress path, and the
// decision output is ready to drive a replacement channel when one exists.
// Further documented approximations:
//   * turn numbers come from the pre-step payload (`turn`, trusted when a
//     finite number >= 1, else cursor+1); results observed before any
//     pre-step are tagged turn 1 and are head-protected under the default
//     `protectFirstTurns: 2` - they stay in the log and keep counting
//     toward the fill (they remain inline by definition);
//   * the accumulator is the sum of the observed record sizes; archiving
//     subtracts the archived bytes (the model of "what is no longer
//     accumulated" - the limitation above means it stays a model);
//   * the observation log holds content COPIES for pass-through results
//     only (stored results keep just their hash) - memory growth is
//     bounded by what was never stored.
import type { ContentBlock } from "@deepseek-ai/dsh-llm";

// One observed tool result in the engine's log. `content` is present only
// for a result that passed through WITHOUT being stored (the archivable
// kind); `hash` is present only for a result the post-execute gate already
// stored (compressed or auto-expanded - retrievable, nothing to re-store).
export type EngineRecord = {
	/** The engine turn cursor at observation time. */
	turn: number;
	/** The tool name (the compress path re-runs the exempt/targets gates). */
	name: string;
	/** Whether the result was a failure. */
	isError: boolean;
	/** The serialized byte size of the content (the accumulator's unit). */
	size: number;
	/** The original content blocks - pass-through results only. */
	content?: ContentBlock[];
	/** The store hash - results the post-execute gate already stored. */
	hash?: string;
};

// The per-apply engine runtime (Function/Apply builds it only when the
// context-engine flag is on; `State.EngineRuntime === undefined` = off).
export type EngineRuntime = {
	/** The current logical turn (the last pre-step payload's `turn`, or 1). */
	Turn: number;
	/** The observation log, in arrival order (archiving removes from it). */
	Records: EngineRecord[];
};

/** The fill limit in bytes: Pct% of the nominal budget (floored). */
export const ThresholdBytes = (Budget: number, Pct: number): number =>
	Math.max(0, Math.floor((Budget * Pct) / 100));

/** The MIDDLE records: past the first ProtectFirst turns, at or before
 *  CurrentTurn - ProtectLast (the protected tail window is never touched). */
export const Eligible = (
	Records: EngineRecord[],
	CurrentTurn: number,
	ProtectFirst: number,
	ProtectLast: number,
): EngineRecord[] => {
	const Head = Math.max(0, ProtectFirst);
	const Last = CurrentTurn - Math.max(0, ProtectLast);
	return Records.filter((Record) => Record.turn > Head && Record.turn <= Last);
};

/** The per-pre-step archive decision: the threshold crossed AND middle
 *  records to retire, or undefined (nothing happens - including the
 *  crossing-with-no-middles case, a deliberate no-op). */
export const Decide = (
	Records: EngineRecord[],
	CurrentTurn: number,
	Budget: number,
	Pct: number,
	ProtectFirst: number,
	ProtectLast: number,
): { archive: EngineRecord[]; bytes: number } | undefined => {
	const Total = Records.reduce((Sum, Record) => Sum + Record.size, 0);
	const Limit = ThresholdBytes(Budget, Pct);
	switch (true) {
		case Limit <= 0 || Total < Limit:
			return undefined;
	}
	const Archive = Eligible(Records, CurrentTurn, ProtectFirst, ProtectLast);
	switch (true) {
		case Archive.length === 0:
			return undefined;
	}
	return {
		archive: Archive,
		bytes: Archive.reduce((Sum, Record) => Sum + Record.size, 0),
	};
};
