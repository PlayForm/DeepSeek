import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { CompiledIntent } from "./Pack.js";
/**
 * @module State
 *
 * The per-apply plugin state: the FACTORY's shared shape (built by
 * `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended with the
 * convention-suggester hook's own fields.
 *
 * @remarks
 *
 * The shared half comes from the factory's NAMED type export (`State`): the built
 * Target/Library.d.ts ships RELATIVE specifiers, so a consumer's tsconfig paths never hijack the
 * declaration imports. The machinery that stays inert here: the fs/observed domain (this hook is
 * a NON-MANIFEST module that consumes the factory for the State builder and the ledger only).
 *
 * The convention-suggester's own fields:
 *
 * - `On` - the master switch (config `enabled`, volatile);
 * - `Threshold` - the default confidence gate (config `threshold`, volatile);
 * - `MaxCandidates` - the note's candidate cap (config `maxCandidates`, volatile);
 * - `MaxNoteChars` - the note's character cap (config `maxNoteChars`, volatile);
 * - `Cooldown` - the per-intent cooldown in judged calls (config `cooldownCalls`, volatile);
 * - `MaxNotesPerTurn` - the per-turn note cap (config `maxNotesPerTurn`, volatile);
 * - `Intents` - the enabled intent ids (config `intents`, volatile);
 * - `EmitOn` - the judged tool names (config `emitOn`, volatile);
 * - `Exclude` - candidate path prefixes never suggested (config `exclude`, volatile);
 * - `Learning` - the RETIRED learning switch (config `learning`, volatile, kept for
 *   compatibility until the history-driven proposal lands);
 * - `Rules` - the compiled pack; EMPTY at apply, because the candidates come from the session
 *   history and only an explicit repo/user pack compiles here (once per root, in
 *   Function/Apply);
 * - `Agents` - the per-agent ring/cooldown state (WeakMap keyed on the Agent object, the
 *   tool-coach precedent), built once in Function/Apply;
 * - `Factory` - the injected factory service itself, consumed for the ledger (Factory.Append) -
 *   assigned once in Function/Apply.
 *
 * THE HISTORY IS NOT A STATE FIELD: the per-session touch history is a session-projection unit
 * (Function/Unit, keyed on `sessionProjections`), so the registry owns one cell per session and
 * Function/History reads it at detection time through `stateOf(session, key)`. Nothing here
 * holds it, and no WeakMap in this module is keyed on the session object.
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
     * The note's candidate cap (config `maxCandidates`, volatile).
     */
    MaxCandidates: number;
    /**
     * The note's character cap (config `maxNoteChars`, volatile).
     */
    MaxNoteChars: number;
    /**
     * The per-intent cooldown in judged calls (config `cooldownCalls`, volatile).
     */
    Cooldown: number;
    /**
     * The per-turn note cap (config `maxNotesPerTurn`, volatile).
     */
    MaxNotesPerTurn: number;
    /**
     * The enabled intent ids (config `intents`, volatile).
     */
    Intents: string[];
    /**
     * The judged tool names (config `emitOn`, volatile).
     */
    EmitOn: string[];
    /**
     * The candidate path prefixes never suggested (config `exclude`, volatile).
     */
    Exclude: string[];
    /**
     * The RETIRED learning switch (config `learning`, volatile; kept for compatibility).
     */
    Learning: boolean;
    /**
     * The compiled pack; empty at apply, compiled per root for an explicit pack.
     */
    Rules: CompiledIntent[];
    /**
     * The per-agent state, keyed on the Agent object.
     */
    Agents: WeakMap<object, AgentMemory>;
    /**
     * The injected @playform/plugin-dsh-factory service - the ledger (Factory.Append) is
     * consumed through it; assigned once in Function/Apply.
     */
    Factory: Factory;
}
export interface AgentMemory {
    /**
     * Judged calls seen since the agent's memory was created.
     */
    Calls: number;
    /**
     * Intent id -> the call index of the last note for that intent.
     */
    Noted: Map<string, number>;
    /**
     * Notes emitted since the last user turn (the per-turn cap).
     */
    TurnNotes: number;
    /**
     * The last probes (most recent first, capped at 8).
     */
    Ring: string[];
}
