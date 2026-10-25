/** The fs/observed traceability one-liner (code-authoring/SKILL.md:39-46). */
export declare const TRACEABILITY = "terminal edits produce no fs/observed event, so the governor/pinner/normalize plugins never see them";
/** The tier-1 note (NOTE_FIRST), verbatim. */
export declare const NOTE_FIRST = "Tool-coach note (strike ${count}, ${class}-class bash pattern):\n- \"${command}\" is forbidden for file content. Use the ${tool.name} tool instead.\n- ${tool.name}: ${tool.description} (key parameter: ${tool.param}).\n- ${traceability}.\nThe terminal runs COMMANDS (builds, tests, git, package managers); the tools handle CONTENT.";
/** The tier-2 persistent section template (NOTE_PERSISTENT), verbatim. */
export declare const NOTE_PERSISTENT = "Tool discipline (persistent, from tool-coach):\n- NEVER read file content through the terminal: \"${command}-style\" commands \u2014 use the read and grep/glob tools.\n- NEVER mutate file content through the terminal: ${command}-style commands \u2014 use the write and edit tools.\n- The terminal is for COMMANDS (builds, tests, git, package managers).\nMapped tools:\n| tool | purpose |\n| --- | --- |\n${table}";
/** The tier-3 deny reason (NOTE_DENIED), verbatim. */
export declare const NOTE_DENIED = "Blocked by tool-coach: \"${command}\" is forbidden (${class}-class bash pattern). Use the ${tool.name} tool for this operation instead \u2014 ${tool.description} (key parameter: ${tool.param}). Then rerun only the legitimate command parts (build/test/git), if any.";
/**
 * One static tool line: the fallback first-sentence description (plan Part 1
 * §1.2, from the live registry descriptions) and the tool's key parameter
 * (plan Part 3 §3.1). Used whenever the live fetch is disabled, fails, or a
 * mapped tool is absent from the registry - a note NEVER fails the waterfall.
 */
export interface StaticToolLine {
    /** The fallback first-sentence description. */
    description: string;
    /** The fallback key parameter name. */
    param: string;
}
/** The static fallback table (Variable/Notes.ts, derived from plan Part 1 §1.2). */
export declare const STATIC_TOOL_LINES: Record<string, StaticToolLine>;
