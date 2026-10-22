import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type Ring from "../Function/Ring.js";
import type { Intent, Knowledge } from "./Execution.js";
export default interface State extends Shared {
    /** The master switch (config `enabled`, volatile). */
    On: boolean;
    /** The default confidence gate (config `threshold`, volatile). */
    Threshold: number;
    /** The candidate cap (config `maxCandidates`, volatile). */
    MaxCandidates: number;
    /** The note character cap (config `maxNoteChars`, volatile). */
    MaxNoteChars: number;
    /** The cooldown window in judged calls (config `cooldownCalls`, volatile). */
    CooldownCalls: number;
    /** The per-turn note cap (config `maxNotesPerTurn`, volatile). */
    MaxNotesPerTurn: number;
    /** The enabled intent kinds (config `intents`, volatile). */
    Intents: string[];
    /** The judged tools (config `emitOn`, volatile). */
    EmitOn: string[];
    /** The scope roots (config `scopeRoots`, volatile). */
    ScopeRoots: string[];
    /** The excluded directories (config `exclude`, volatile). */
    Exclude: string[];
    /** The learner switch (config `learn`, volatile). */
    Learn: boolean;
    /** The learner's window (config `learnWindow`, volatile). */
    LearnWindow: number;
    /** The knowledge file path (config `persistPath`, structural). */
    PersistPath: string;
    /** The index file path (config `indexPath`, structural). */
    IndexPath: string;
    /** The boot index refresh switch (config `refreshOnBoot`, structural). */
    RefreshOnBoot: boolean;
    /** The second surface mode (config `sectionMode`, volatile). */
    SectionMode: string;
    /** The sticky section TTL (config `sectionTtl`, volatile). */
    SectionTtl: number;
    /** The embedded pack (Function/Pack) - the reference search pack. */
    Pack: Intent[];
    /** The learned knowledge, loaded once at apply, saved best-effort. */
    Knowledge: Knowledge;
    /** The per-agent ring tracker (Function/Ring). */
    Rings: ReturnType<typeof Ring>;
    /** The injected @playform/ets-plugin-dsh-factory service. */
    Factory: Factory;
}
