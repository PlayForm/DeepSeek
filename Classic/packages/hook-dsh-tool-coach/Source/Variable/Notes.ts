// Notes - the three coaching templates (the plan's Part 3 §3.3, verbatim), the
// static tool-line fallback table, and the traceability one-liner. Every
// template is filled by Function/Compose with a single-pass placeholder
// scanner: known placeholders are replaced, user data is escaped (`${` ->
// `$${`) BEFORE insertion, so composed output never gains a NEW unfilled
// placeholder (the plan's D1 discipline).
//
// Placeholders (Part 3 §3.3): ${command} (offending command segment, first
// 200 chars), ${class}, ${count}, ${traceability}, ${tool.name},
// ${tool.description} (fetched first sentence), ${tool.param} (primary
// parameter key), ${table} (the tier-2 tool-table rows, composed by the
// builder - the plan's verbatim table row `| ${tool.name} |
// ${tool.description} |` is the row template the composer repeats).

/** The fs/observed traceability one-liner (code-authoring/SKILL.md:39-46). */
export const TRACEABILITY =
	"terminal edits produce no fs/observed event, so the governor/pinner/normalize plugins never see them";

/** The tier-1 note (NOTE_FIRST), verbatim. */
export const NOTE_FIRST = `Tool-coach note (strike \${count}, \${class}-class bash pattern):
- "\${command}" is forbidden for file content. Use the \${tool.name} tool instead.
- \${tool.name}: \${tool.description} (key parameter: \${tool.param}).
- \${traceability}.
The terminal runs COMMANDS (builds, tests, git, package managers); the tools handle CONTENT.`;

/** The tier-2 persistent section template (NOTE_PERSISTENT), verbatim. */
export const NOTE_PERSISTENT = `Tool discipline (persistent, from tool-coach):
- NEVER read file content through the terminal: "\${command}-style" commands — use the read and grep/glob tools.
- NEVER mutate file content through the terminal: \${command}-style commands — use the write and edit tools.
- The terminal is for COMMANDS (builds, tests, git, package managers).
Mapped tools:
| tool | purpose |
| --- | --- |
\${table}`;

/** The tier-3 deny reason (NOTE_DENIED), verbatim. */
export const NOTE_DENIED = `Blocked by tool-coach: "\${command}" is forbidden (\${class}-class bash pattern). Use the \${tool.name} tool for this operation instead — \${tool.description} (key parameter: \${tool.param}). Then rerun only the legitimate command parts (build/test/git), if any.`;

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
export const STATIC_TOOL_LINES: Record<string, StaticToolLine> = {
	read: {
		description: "Read a UTF-8 text file and return line-numbered content.",
		param: "file_path",
	},
	read_image: {
		description: "Read a PNG/JPEG/WebP/GIF file and return the image itself.",
		param: "file_path",
	},
	write: {
		description: "Create or fully replace a UTF-8 text file.",
		param: "file_path",
	},
	edit: {
		description: "Edit an existing UTF-8 text file by replacing literal text.",
		param: "old_string",
	},
	glob: {
		description:
			"Find files, not directories, whose paths match a glob pattern, including hidden and ignored files.",
		param: "pattern",
	},
	grep: {
		description: "Search file contents with a ripgrep regular expression.",
		param: "pattern",
	},
	bash: {
		description: "Execute a bash command (bash -c) and return its stdout/stderr.",
		param: "command",
	},
	pwsh: {
		description: "Execute a pwsh command and return its output.",
		param: "command",
	},
	web_fetch: {
		description: "Fetch the content of a specific HTTP(S) URL and return it decoded to text.",
		param: "url",
	},
	web_search: {
		description: "Search the web for current information.",
		param: "queries",
	},
	working_directory: {
		description: "Read the current working directory, or change it with cd.",
		param: "cd",
	},
	run_in_background: {
		description: "Run a command in the background and return a job id immediately.",
		param: "command",
	},
	job_output: {
		description: "Read a background job.",
		param: "job_id",
	},
	job_kill: {
		description: "Request cancellation of a running background job.",
		param: "job_id",
	},
	schedule_create: {
		description: "Create a reminder in the current session that delivers when it becomes due.",
		param: "prompt",
	},
	plugin_manager: {
		description: "List plugins or bundles in the current profile, or install and remove them.",
		param: "action",
	},
	ccr_retrieve: {
		description: "Retrieve the original bytes of a compressed tool output by its marker hash.",
		param: "hash",
	},
	present: {
		description: "Declare existing files as final deliverables for the user.",
		param: "files",
	},
};
