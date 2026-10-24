import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
/** The core arm factory's structural scope-gate view: the shared
 *  ToolResults machinery reads exactly this field, and the adapter pins it
 *  open (the module Gate is the only decision point in this flavor). */
export interface Scopes {
    toolResults: boolean;
}
export default interface State extends Shared {
    /** The whole filter on/off (config `enabled`, volatile). Distinct from
     *  the shared `Enabled` (the ledger gate): the ledger keeps recording
     *  while the filter is off. */
    Active: boolean;
    /** The tool names the filter may touch (config `targets`). */
    Targets: string[];
    /** The tool names that always pass by identity (config `exempt`;
     *  `read`/`ccr_retrieve` are absent by design). */
    Exempt: string[];
    /** Consult the per-task intent gate (config `intent`). */
    IntentOn: boolean;
    /** The intent keywords (config `intentKeywords`). */
    Keywords: string[];
    /** Append the omission notice line (config `notice`). */
    Notice: boolean;
    /** agent -> the last user text at agent/pre-step, lowercased (runtime). */
    IntentMap: Map<object, string>;
    /** The same text when `exec.agent` is absent (runtime fallback). */
    Global: string;
    /** The core arm factory's scope-gate adapter, pinned open (runtime). */
    Scopes: Scopes;
    /** The injected @playform/plugin-dsh-factory service - the ledger sink. */
    Factory: Factory;
}
