import type { AgentState, Decision, ToolCatalog } from "../Interface/Execution.js";
/**
 * @module Compose
 *
 * The template system (plan Part 3 §3.3/§3.5 step 4). Fills the three
 * templates with the decision's data and the fetched catalog entries.
 *
 * @remarks
 *
 * The fill is a SINGLE-PASS scanner over the template: each `${...}` token is
 * read from the ORIGINAL template and replaced with its value; user data
 * (the ${command} fill) is escaped (`${` -> `$${`) BEFORE insertion, so user
 * content can never add an unfilled placeholder, and inserted values are
 * never re-scanned. Any placeholder missing a fetched value degrades to the
 * static line (Variable/Notes.STATIC_TOOL_LINES) - composed output never
 * fails on a fetch gap.
 */
/**
 * The knob values the composers read (the live State values).
 */
export interface ComposeConfig {
    maxSectionTools: number;
}
/**
 * Single-pass template fill (no re-scanning of inserted values).
 */
export declare const Fill: (Template: string, Values: Record<string, string | number>) => string;
/**
 * The tier-1 note text (the fetched description line + traceability).
 */
export declare const First: (Decision: Decision, Catalog: ToolCatalog, Template: string) => string;
/**
 * The tier-3 deny reason (the same forbidden phrasing).
 */
export declare const Denied: (Decision: Decision, Catalog: ToolCatalog, Template: string) => string;
/**
 * The tier-2 section text (3 fixed rules + the tool table).
 */
export declare const Persistent: (State: AgentState, Catalog: ToolCatalog, Template: string, Config: ComposeConfig, Mapped: string[], LiveNames: string[]) => string;
