import type { CoachClass } from "../Interface/Execution.js";
/**
 * @module Notes
 *
 * The three coaching templates (the plan's Part 3 §3.3), the per-class lead
 * sentence, and the traceability one-liner.
 *
 * @remarks
 *
 * Every template is filled by Function/Compose with a single-pass placeholder
 * scanner: known placeholders are replaced, user data is escaped (`${` ->
 * `$${`) BEFORE insertion, so composed output never gains a NEW unfilled
 * placeholder (the plan's D1 discipline).
 *
 * Placeholders (Part 3 §3.3): ${command} (offending command segment, first
 * 200 chars), ${class}, ${class.lead} (the class's one-sentence account of what
 * the command did), ${count}, ${traceability}, ${tool.name},
 * ${tool.description} (the harness's first sentence), ${tool.param} (the
 * schema's first required parameter key), ${tool.params} (the FULL parameter
 * surface with requiredness and declared defaults), ${tool.shape} (the call
 * the model should make), ${table} (the tier-2 tool-table rows, composed by
 * the builder - the plan's verbatim table row `| ${tool.name} |
 * ${tool.description} |` is the row template the composer repeats).
 *
 * The static tool table is NOT here: it is GENERATED into Variable/Catalog from
 * the harness's own docs/tool-catalog.md, because a hand-maintained copy of the
 * harness's tool descriptions drifts from the registry (this one had already
 * drifted: it listed `run_in_background` as a tool, which is a bash parameter,
 * and its `schedule_create` line no longer matched the live schema).
 */
/**
 * The fs/observed traceability one-liner (code-authoring/SKILL.md:39-46).
 */
export declare const TRACEABILITY = "terminal edits produce no fs/observed event, so the governor/pinner/normalize plugins never see them";
/**
 * The per-class lead: what the offending command actually did. The tier-1 and
 * tier-3 templates are shared across all five classes, and a single sentence
 * cannot be honest for all of them - "is forbidden for file content" is wrong
 * for a `cd`, a `curl`, or a `pnpm add -g`, and a note that misdescribes the
 * offense teaches the model to distrust the note.
 */
export declare const CLASS_LEADS: Record<CoachClass, string>;
/**
 * The tier-1 note (NOTE_FIRST).
 */
export declare const NOTE_FIRST = "Tool-coach note (strike ${count}, ${class}-class bash pattern):\n- \"${command}\" ${class.lead} through the terminal. Use the ${tool.name} tool instead.\n- ${tool.name}: ${tool.description} Parameters: ${tool.params}.\n- Call shape: ${tool.shape}.\n- ${traceability}.\nThe terminal runs COMMANDS (builds, tests, git, package managers); the tools handle CONTENT.";
/**
 * The tier-2 persistent section template (NOTE_PERSISTENT), verbatim.
 */
export declare const NOTE_PERSISTENT = "Tool discipline (persistent, from tool-coach):\n- NEVER read file content through the terminal: \"${command}-style\" commands - use the read and grep/glob tools.\n- NEVER mutate file content through the terminal: ${command}-style commands - use the write and edit tools.\n- The terminal is for COMMANDS (builds, tests, git, package managers).\nMapped tools:\n| tool | purpose |\n| --- | --- |\n${table}";
/**
 * The tier-3 deny reason (NOTE_DENIED).
 */
export declare const NOTE_DENIED = "Blocked by tool-coach: \"${command}\" is forbidden (${class}-class bash pattern). Use the ${tool.name} tool for this operation instead - ${tool.description} Parameters: ${tool.params}. Call it as ${tool.shape}. Then rerun only the legitimate command parts (build/test/git), if any.";
/**
 * The deny-list reason (NOTE_DENIED_TOOL): generic and placeholder-safe - the deny list carries no match, so the template holds no placeholder the composer would leave unfilled.
 */
export declare const NOTE_DENIED_TOOL = "Blocked by tool-coach: this tool is disabled in this profile. Use the documented alternative for that surface instead.";
