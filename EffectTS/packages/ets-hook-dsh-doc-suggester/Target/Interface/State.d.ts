import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type Ring from "../Function/Ring.js";
import type { Family } from "./Execution.js";
export default interface State extends Shared {
    /** The master switch (config `enabled`, volatile). */
    On: boolean;
    /** The default confidence gate (config `threshold`, volatile). */
    Threshold: number;
    /** The judged doc-task tools (config `tools`, volatile). */
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
    /** The embedded convention pack (Function/Pack). */
    Pack: Family[];
    /** The per-agent ring tracker (Function/Ring). */
    Rings: ReturnType<typeof Ring>;
    /** The injected @playform/ets-plugin-dsh-factory service. */
    Factory: Factory;
}
