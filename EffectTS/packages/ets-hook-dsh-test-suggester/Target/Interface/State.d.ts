import type Config from "./Config.js";
import type { CompiledIntent } from "./Pack.js";
import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
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
    /** The compiled pack, built once at apply. */
    Rules: CompiledIntent[];
    /** The per-agent state, keyed on the Agent object. */
    Agents: WeakMap<object, AgentMemory>;
    /** The package roots whose reconciliation logged its consistent-tree line. */
    Cleared: Set<string>;
    /** The injected @playform/ets-plugin-dsh-factory service - the ledger
     *  (Factory.Append) is consumed through it; assigned once in Function/Apply. */
    Factory: Factory;
}
export interface AgentMemory {
    /** Judged calls seen since the agent's memory was created. */
    Calls: number;
    /** Intent id -> the call index of the last note for that intent. */
    Noted: Map<string, number>;
    /** Notes emitted since the last user turn (the per-turn cap). */
    TurnNotes: number;
    /** The last probes (most recent first, capped at 8). */
    Ring: string[];
    /** Package root -> the drift signature of the last reconciliation note. */
    Reconciled: Map<string, string>;
}
export type { Config };
