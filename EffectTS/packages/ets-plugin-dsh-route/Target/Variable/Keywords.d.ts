/**
 * @module Keywords
 *
 * The shipped keyword table for the task-type inference.
 *
 * @remarks
 * ROUTING-ENFORCER-PLUGIN.md section 2.1: "a documented keyword table, the
 * user's policy the final authority". The plan's rules: "read-only",
 * "survey", "research" -> explorer; "fix", "implement", "restructure" ->
 * coder; "design", "plan", "architecture" -> planner.
 *
 * The words are matched case-insensitively as substrings of the spec text
 * (Function/Classify). The user's config extends or replaces this table
 * (config `keywords`); the schema merges the user's arrays over these
 * defaults, so a user keyword ADDS a trigger and never silently removes
 * one. Known precision risk (the plan's exploration item 2): "fix the docs"
 * is coding, NOT exploration - the table keeps "fix" in the coder list, and
 * the user's policy override is the final authority.
 *
 * The table is TYPED as the KeywordTable (not `satisfies`): the resolver's
 * keyword parameter defaults to this table, and a literal-inferred type
 * would reject the KeywordTable the state carries
 * (Record<string, string[]>).
 */
import type { KeywordTable } from "../Interface/Policy.js";
/**
 * The shipped keyword table (the task-type inference's defaults).
 */
export declare const DEFAULT_KEYWORDS: KeywordTable;
