import type { AgentState, Decision, ToolCatalog } from "../Interface/Execution.js";
/** The knob values the composers read (the live State values). */
export interface ComposeConfig {
    maxSectionTools: number;
}
/** Single-pass template fill (no re-scanning of inserted values). */
export declare const Fill: (Template: string, Values: Record<string, string | number>) => string;
/** The tier-1 note text (the fetched description line + traceability). */
export declare const First: (Decision: Decision, Catalog: ToolCatalog, Template: string) => string;
/** The tier-3 deny reason (the same forbidden phrasing). */
export declare const Denied: (Decision: Decision, Catalog: ToolCatalog, Template: string) => string;
/** The tier-2 section text (3 fixed rules + the tool table). */
export declare const Persistent: (State: AgentState, Catalog: ToolCatalog, Template: string, Config: ComposeConfig, Mapped: string[], LiveNames: string[]) => string;
