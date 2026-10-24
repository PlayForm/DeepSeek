// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended
// with the convention-suggester hook's own fields.
//
// The shared half comes from the factory's NAMED type export (`State`): the
// built Target/Library.d.ts ships RELATIVE specifiers, so a consumer's
// tsconfig paths never hijack the declaration imports. The machinery that
// stays inert here: the fs/observed domain (this hook is a NON-MANIFEST
// module that consumes the factory for the State builder and the ledger
// only).
//
// The convention-suggester's own fields:
//
//   On             - the master switch (config `enabled`, volatile);
//   Threshold      - the default confidence gate (config `threshold`, volatile);
//   MaxCandidates  - the note's candidate cap (config `maxCandidates`, volatile);
//   MaxNoteChars   - the note's character cap (config `maxNoteChars`, volatile);
//   Cooldown       - the per-intent cooldown in judged calls (config `cooldownCalls`, volatile);
//   MaxNotesPerTurn- the per-turn note cap (config `maxNotesPerTurn`, volatile);
//   Intents        - the enabled intent ids (config `intents`, volatile);
//   EmitOn         - the judged tool names (config `emitOn`, volatile);
//   Exclude        - candidate path prefixes never suggested (config `exclude`, volatile);
//   Learning       - the learning bootstrap switch (config `learning`, volatile, default false);
//   Rules          - the compiled pack, built ONCE at apply (hot path: no regex compilation);
//   Agents         - the per-agent ring/cooldown state (WeakMap keyed on the Agent object,
//                    the tool-coach precedent), built once in Function/Apply;
//   Factory        - the injected factory service itself, consumed for the
//                    ledger (Factory.Append) - assigned once in Function/Apply.
import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";

import type { CompiledIntent } from "./Pack.js";

export default interface State extends Shared {
	/** The master switch (config `enabled`, volatile). */
	On: boolean;
	/** The default confidence gate (config `threshold`, volatile). */
	Threshold: number;
	/** The note's candidate cap (config `maxCandidates`, volatile). */
	MaxCandidates: number;
	/** The note's character cap (config `maxNoteChars`, volatile). */
	MaxNoteChars: number;
	/** The per-intent cooldown in judged calls (config `cooldownCalls`, volatile). */
	Cooldown: number;
	/** The per-turn note cap (config `maxNotesPerTurn`, volatile). */
	MaxNotesPerTurn: number;
	/** The enabled intent ids (config `intents`, volatile). */
	Intents: string[];
	/** The judged tool names (config `emitOn`, volatile). */
	EmitOn: string[];
	/** The candidate path prefixes never suggested (config `exclude`, volatile). */
	Exclude: string[];
	/** The learning bootstrap switch (config `learning`, volatile; default false). */
	Learning: boolean;
	/** The compiled pack, built once at apply. */
	Rules: CompiledIntent[];
	/** The per-agent state, keyed on the Agent object. */
	Agents: WeakMap<object, AgentMemory>;
	/** The injected @playform/ets-plugin-dsh-factory service - the ledger
	 *  (Factory.Append) is consumed through it; assigned once in Function/Apply. */
	Factory: Factory;
}

// The per-agent memory: the call counter (the cooldown's clock), the last
// note call per intent (the cooldown), the notes emitted this turn (the
// per-turn cap), and the last probes (the ring; kept for parity with the
// plan's ring buffer).
export interface AgentMemory {
	/** Judged calls seen since the agent's memory was created. */
	Calls: number;
	/** Intent id -> the call index of the last note for that intent. */
	Noted: Map<string, number>;
	/** Notes emitted since the last user turn (the per-turn cap). */
	TurnNotes: number;
	/** The last probes (most recent first, capped at 8). */
	Ring: string[];
}
