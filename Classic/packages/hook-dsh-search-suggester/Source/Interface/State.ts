import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";

import type Ring from "../Function/Ring.js";
import type { Intent, Knowledge } from "./Execution.js";

/**
 * @module State
 *
 * The per-apply plugin state: the factory's shared shape (built by
 * `Factory.State(ctx, config, { ... })` - factory SCHEME.md section 2.10) extended with the
 * search suggester's own fields.
 *
 * @remarks
 *
 * The shared half comes from the factory's NAMED type export (`State`): the built
 * Target/Library.d.ts ships RELATIVE specifiers, so a consumer's tsconfig paths never hijack
 * the declaration imports. The shared machinery that stays inert here: Tool/Policy/PolicyName/
 * List (no fs/observed machinery - the suggester is a NON-MANIFEST module), Stash/Inflight/
 * Subprocess/Seams/Queue/Journal (no governance traffic; the only journal-domain line is the
 * activation record, best-effort).
 *
 * The search suggester's own fields:
 *
 *   - On - the master switch (config `enabled`, volatile);
 *   - Threshold - the default confidence gate (config `threshold`, volatile);
 *   - MaxCandidates / MaxNoteChars / CooldownCalls / MaxNotesPerTurn - the note's shape and
 *     the noise control (volatile);
 *   - Intents - the enabled intent kinds of an EXPLICIT pack, in priority order (volatile;
 *     the synthetic History row is never filtered);
 *   - EmitOn - the judged tools (volatile);
 *   - ScopeRoots / Exclude - the scope and the exclusions (volatile);
 *   - Learn / LearnWindow - the learner's switch and window (volatile);
 *   - PersistPath / IndexPath / RefreshOnBoot - the memory paths (structural; IndexPath is
 *     retired by the P2 re-spec);
 *   - DismissTtl / Seed - the dismissal TTL and the offline seed switch (volatile; the
 *     seed's source is the EXPLICIT pack);
 *   - SectionMode / SectionTtl - the second surface (volatile);
 *   - Pack - EMPTY at apply: the candidates come from the session history, and only an
 *     EXPLICIT repo/user pack is compiled (per call, in Function/Apply). The literal built-in
 *     pack is NEVER a candidate source;
 *   - Knowledge - the learned knowledge (Function/Persist), loaded once at apply and saved
 *     after each emit/follow/dismiss (best-effort);
 *   - Rings - the per-agent ring tracker (Function/Ring);
 *   - Factory - the injected factory service itself (the ledger via Factory.Append) -
 *     assigned once in Function/Apply.
 *
 * THE HISTORY IS NOT A STATE FIELD: the per-session touch history is a session-projection
 * unit (Function/Unit, keyed on `ctx.sessionProjections`), so the registry owns one cell per
 * session and Function/History reads it at detection time through `stateOf(session, key)`.
 * Nothing here holds it, and no WeakMap in this module is keyed on the session object. The
 * unit's structural types live in Interface/Session.ts (Interface/Projection.ts is the
 * unrelated P2 graph projection).
 *
 * Test probes (the end-phase) read the state through the
 * `ctx.__hookDshSearchSuggesterState` attachment (never a return value from `apply` - the
 * loader treats apply returns specially, a live-verified lesson recorded in the
 * plugin-development skill).
 */
export default interface State extends Shared {
	/**
	 * The master switch (config `enabled`, volatile).
	 */
	On: boolean;

	/**
	 * The default confidence gate (config `threshold`, volatile).
	 */
	Threshold: number;

	/**
	 * The candidate cap (config `maxCandidates`, volatile).
	 */
	MaxCandidates: number;

	/**
	 * The note character cap (config `maxNoteChars`, volatile).
	 */
	MaxNoteChars: number;

	/**
	 * The cooldown window in judged calls (config `cooldownCalls`, volatile).
	 */
	CooldownCalls: number;

	/**
	 * The per-turn note cap (config `maxNotesPerTurn`, volatile).
	 */
	MaxNotesPerTurn: number;

	/**
	 * The enabled intent kinds of an explicit pack (config `intents`, volatile).
	 */
	Intents: string[];

	/**
	 * The judged tools (config `emitOn`, volatile).
	 */
	EmitOn: string[];

	/**
	 * The scope roots (config `scopeRoots`, volatile).
	 */
	ScopeRoots: string[];

	/**
	 * The excluded directories (config `exclude`, volatile).
	 */
	Exclude: string[];

	/**
	 * The learner switch (config `learn`, volatile).
	 */
	Learn: boolean;

	/**
	 * The learner's window (config `learnWindow`, volatile).
	 */
	LearnWindow: number;

	/**
	 * The knowledge file path (config `persistPath`, structural).
	 */
	PersistPath: string;

	/**
	 * RETIRED: the generated index path (config `indexPath`, structural; never read).
	 */
	IndexPath: string;

	/**
	 * The projection refresh switch (config `refreshOnBoot`, structural).
	 */
	RefreshOnBoot: boolean;

	/**
	 * The dismissal TTL in seconds (config `dismissTtl`, volatile).
	 */
	DismissTtl: number;

	/**
	 * The offline seed switch (config `seed`, volatile; the source is the explicit pack).
	 */
	Seed: boolean;

	/**
	 * The second surface mode (config `sectionMode`, volatile).
	 */
	SectionMode: string;

	/**
	 * The sticky section TTL (config `sectionTtl`, volatile).
	 */
	SectionTtl: number;

	/**
	 * The explicit pack's families; EMPTY at apply (the built-in pack is retired).
	 */
	Pack: Intent[];

	/**
	 * The learned knowledge, loaded once at apply, saved best-effort.
	 */
	Knowledge: Knowledge;

	/**
	 * The per-agent ring tracker (Function/Ring).
	 */
	Rings: ReturnType<typeof Ring>;

	/**
	 * The injected @playform/plugin-dsh-factory service.
	 */
	Factory: Factory;
}
