import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
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
    /** The embedded convention pack (Function/Pack). */
    Pack: Family[];
    /** The per-agent ring tracker (Function/Ring). */
    Rings: ReturnType<typeof Ring>;
    /** The injected @playform/plugin-dsh-factory service. */
    Factory: Factory;
}
