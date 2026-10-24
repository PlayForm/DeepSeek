import type Entry from "@Interface/Entry.js";
import type Handle from "@Interface/Handle.js";
import type { ReplayRecord } from "@Interface/History.js";
import type { CompiledIntent } from "@Interface/Pack.js";
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
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
    /** The history store path (config `historyPath`, structural). */
    HistoryPath: string;
    /** The follow/ignore observation window (config `learnWindow`, volatile). */
    LearnWindow: number;
    /** The JSON fallback store path (config `recordPath`, structural). */
    RecordPath: string;
    /** The history ring's bound (config `historyDepth`, volatile). */
    Depth: number;
    /** The loaded seeded history store (Function/History), read once at apply. */
    Records: ReplayRecord[];
    /** The durable tier's in-memory mirror, newest first (Function/Restore). */
    History: Entry[];
    /** The next entry sequence (the store's monotonic order). */
    Seq: number;
    /** The open storage domain (undefined in the JSON fallback). */
    Handle: Handle | undefined;
    /** The store chain: the open/recovery and every write, in order. */
    Pending: Promise<void>;
    /** Await the store chain (the smoke seam: every write is deterministic). */
    Flush: () => Promise<void>;
    /** The compiled pack, built once at apply. */
    Rules: CompiledIntent[];
    /** The per-agent state, keyed on the Agent object. */
    Agents: WeakMap<object, AgentMemory>;
    /** The injected @playform/plugin-dsh-factory service - the ledger
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
    /** The agent's own recorded calls, newest first, bounded by `historyDepth`. */
    History: Entry[];
}
