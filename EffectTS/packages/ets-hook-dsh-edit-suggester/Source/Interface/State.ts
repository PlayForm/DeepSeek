// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md section 2.10)
// extended with the edit suggester's own fields.
//
// The shared half comes from the factory's NAMED type export (`State`): the
// built Target/Library.d.ts ships RELATIVE specifiers, so a consumer's
// tsconfig paths never hijack the declaration imports. The shared machinery
// that stays inert here: Tool/Policy/PolicyName/List (no fs/observed
// machinery - the suggester is a NON-MANIFEST module), Stash/Inflight/
// Subprocess/Seams/Queue/Journal (no governance traffic; the only
// journal-domain line is the activation record, best-effort).
//
// The edit suggester's own fields:
//
//   On             - the master switch (config `enabled`, volatile);
//   Threshold      - the default confidence gate (config `threshold`, volatile);
//   Tools          - the judged modification tools (config `tools`, volatile);
//   MaxCompanions / MaxNoteChars / CooldownCalls / MaxNotesPerTurn -
//                    the note's shape and the noise control (volatile);
//   Exclude        - the excluded directories (config `exclude`, volatile);
//   Learn / LearnWindow / StoreLimit - the learning layer's switches
//                    (volatile): the master switch, the follow-through window
//                    in judged calls, and the memory fallback's bound;
//   Heuristics / Weights - the PICKABLE decision model (volatile): the
//                    enabled heuristic names and the configured weight table;
//   Learning       - the learned layer (Function/Store): the accept rates and
//                    the decision records, through the pattern service when
//                    one is present and the bounded memory fallback otherwise;
//   Last           - the last decision record (Function/Decide) - the D8 audit
//                    probe the smokes read, never a return value;
//   Pack           - the edit-domain projection of the built-in pack; EMPTY at
//                    apply, because the candidates come from the session
//                    history and only an EXPLICIT repo/user pack is compiled
//                    (per call, in Function/Apply). The built-in pack is never
//                    a candidate source;
//   Rings          - the per-agent ring tracker (Function/Ring);
//   History        - the per-session touch history (WeakMap keyed on the
//                    session object, created lazily by the session/event fold
//                    in Function/Apply);
//   Factory        - the injected factory service itself (the ledger via
//                    Factory.Append) - assigned once in Function/Apply.
//
// Test probes (the end-phase) read the state through the
// `ctx.__hookDshEditSuggesterState` attachment (never a return value from
// `apply` - the loader treats apply returns specially).
import type { Touch } from "@playform/ets-lib-dsh-pack";
import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";

import type Ring from "../Function/Ring.js";
import type Decision from "./Decision.js";
import type { Family } from "./Execution.js";
import type Learning from "./Learning.js";

export default interface State extends Shared {
	/** The master switch (config `enabled`, volatile). */
	On: boolean;
	/** The default confidence gate (config `threshold`, volatile). */
	Threshold: number;
	/** The judged modification tools (config `tools`, volatile). */
	Tools: string[];
	/** The companion cap (config `maxCompanions`, volatile). */
	MaxCompanions: number;
	/** The note character cap (config `maxNoteChars`, volatile). */
	MaxNoteChars: number;
	/** The cooldown window in judged calls (config `cooldownCalls`, volatile). */
	CooldownCalls: number;
	/** The per-turn note cap (config `maxNotesPerTurn`, volatile). */
	MaxNotesPerTurn: number;
	/** The excluded directories (config `exclude`, volatile). */
	Exclude: string[];
	/** The learning layer's master switch (config `learn`, volatile). */
	Learn: boolean;
	/** The follow-through window in judged calls (config `learnWindow`, volatile). */
	LearnWindow: number;
	/** The enabled pickable heuristics (config `heuristics`, volatile). */
	Heuristics: string[];
	/** The configured pickable weight table (config `weights`, volatile). */
	Weights: Record<string, number>;
	/** The memory fallback's bound (config `storeLimit`, volatile). */
	StoreLimit: number;
	/** The learned layer (Function/Store). */
	Learning: Learning;
	/** The last decision record (Function/Decide) - the D8 audit probe. */
	Last: Decision | undefined;
	/** The edit-domain projection of the built-in pack; empty at apply. */
	Pack: Family[];
	/** The per-agent ring tracker (Function/Ring). */
	Rings: ReturnType<typeof Ring>;
	/** The per-session touch history, keyed on the session object. */
	History: WeakMap<object, SessionHistory>;
	/** The injected @playform/ets-plugin-dsh-factory service. */
	Factory: Factory;
}

// The per-session history: the fold's running sequence number and the touches
// (the previous tool calls that named a path), oldest first and capped at 512
// by the session/event fold. The candidates come from these touches, never
// from a literal pack.
export interface SessionHistory {
	/** The next touch's sequence number. */
	Seq: number;
	/** The folded touches, oldest first. */
	Touches: Touch[];
}
