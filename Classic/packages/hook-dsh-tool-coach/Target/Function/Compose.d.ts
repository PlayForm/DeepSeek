import type { AgentState, Decision, ToolCatalog, ToolParam } from "../Interface/Execution.js";
/**
 * @module Compose
 *
 * The template system: fills the three templates with the decision's data and
 * the fetched catalog entries.
 *
 * @remarks
 *
 * Plan Part 3 §3.3/§3.5 step 4.
 *
 * The fill is a SINGLE-PASS scanner over the template: each `${...}` token is
 * read from the ORIGINAL template and replaced with its value; user data
 * (the ${command} fill) is escaped (`${` -> `$${`) BEFORE insertion, so user
 * content can never add an unfilled placeholder, and inserted values are
 * never re-scanned. A placeholder the catalog cannot fill degrades to its
 * neutral form - composed output never fails on a fetch gap.
 *
 * The note carries the harness's OWN parameter surface, not a paraphrase of
 * it: `${tool.params}` renders every key with its requiredness and its declared
 * default, and `${tool.shape}` renders the call the model should make. That is
 * what makes a suggestion actionable - `read { file_path, offset?, limit? }`
 * answers "what are lines 45200-45240", while `read (key parameter: file_path)`
 * does not.
 */
/**
 * The knob values the composers read (the live State values).
 */
export interface ComposeConfig {
    maxSectionTools: number;
    maxNoteParams: number;
}
/**
 * Single-pass template fill (no re-scanning of inserted values).
 */
export declare const Fill: (Template: string, Values: Record<string, string | number>) => string;
/**
 * Render the parameter surface the note names, in the schema's own order:
 * `file_path (required), offset (default 1), limit (default 2000)`.
 *
 * The cap keeps a note from turning into a schema dump: a tool with a dozen
 * parameters names the first `maxNoteParams` and reports the remainder as a
 * count, so the model still knows the surface is wider than what it reads.
 */
export declare const Surface: (Params: ToolParam[], Limit: number) => string;
/**
 * Render the call shape: `read { file_path, offset?, limit? }` (an optional key
 * carries `?`, the convention the model already reads in the tool schema).
 */
export declare const Shape: (Name: string, Params: ToolParam[]) => string;
/**
 * The tier-1 note text (the fetched description line + the parameter surface).
 */
export declare const First: (Decision: Decision, Catalog: ToolCatalog, Template: string, Config: ComposeConfig) => string;
/**
 * The tier-3 deny reason (the same forbidden phrasing).
 */
export declare const Denied: (Decision: Decision, Catalog: ToolCatalog, Template: string, Config: ComposeConfig) => string;
/**
 * The tier-2 section text (3 fixed rules + the tool table).
 */
export declare const Persistent: (State: AgentState, Catalog: ToolCatalog, Template: string, Config: ComposeConfig, Mapped: string[], LiveNames: string[]) => string;
