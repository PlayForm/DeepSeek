// Patterns - the default regression-pattern table and the default exemption
// list (the plan's Part 2 tables, verbatim scope). The tool-coach only judges
// TERMINAL calls (config `judgeTools`); these rows classify the COMMAND text.
//
// The boundary rule (Documentation/Skill/task-routing/SKILL.md:165-170 +
// code-authoring/SKILL.md:25-32): the terminal runs COMMANDS; the tools handle
// CONTENT. Any bash segment that (a) reads file content into the conversation
// or (b) mutates file content on disk is a regression class match; everything
// else is legitimate bash and is never counted.
//
// ROW ORDER MATTERS: Detect scans the rows in order (write rows first) and the
// FIRST matching row wins for a segment; class priority across segments is
// write > read > search > discovery > control. Discovery and control are
// note-only classes - they are never denied, even at `enforce: "all"`.
//
// Every row: { pattern (RegExp source, matched against the normalized
// pipeline), class, tool (the dedicated tool the note names), note? (optional
// per-row override of the tier-1 note body) }. The user's `patternTable` rows
// are APPENDED after these defaults at runtime (the plan's Detect order) and
// may not duplicate a default pattern (fail-loud, plan §3).
export interface PatternRow {
	/** The RegExp source matched against the normalized command pipeline. */
	pattern: string;
	/** The regression class this row assigns. */
	class: "write" | "read" | "search" | "discovery" | "control";
	/** The dedicated tool the coaching note names. */
	tool: string;
	/** Optional per-row override of the tier-1 note body. */
	note?: string;
}

// The CLASS priority used to pick a match when several segments of one call
// match different classes (the tier-2 mapped-tool ordering uses the same
// sequence: write, read, search, discovery, control).
export const CLASS_PRIORITY = ["write", "read", "search", "discovery", "control"] as const;

// ---------------------------------------------------------------------------
// DEFAULT_PATTERNS - the regression table (plan Part 2, §2.1-§2.4).
// ---------------------------------------------------------------------------
export const DEFAULT_PATTERNS: PatternRow[] = [
	// --- WRITE class (tier 1 note + tier 3 deny when enforce: "write") -------
	// sed -i (including -i.bak): in-place file rewrite.
	{
		pattern: String.raw`\bsed\b[^|;&]*\s-i(?:\.\w+)?\b`,
		class: "write",
		tool: "edit",
	},
	// perl -pi / perl ... -i: in-place file rewrite.
	{
		pattern: String.raw`\bperl\b[^|;&]*(\s-pi\b|\s-i(?:\.\w+)?\b)`,
		class: "write",
		tool: "edit",
	},
	// awk redirecting anywhere but /dev/null.
	{
		pattern: String.raw`\bawk\b[^|;&]*>>?(?!\s*/dev/null)\s*\S`,
		class: "write",
		tool: "edit",
	},
	// echo/printf with a file redirect tail.
	{
		pattern: String.raw`^(echo|printf)\b[^|;&]*>>?(?!\s*/dev/null)\s*\S`,
		class: "write",
		tool: "edit",
	},
	// tee with a file operand (tee -a appends).
	{
		pattern: String.raw`\btee\b(?:\s+-[A-Za-z]+\s+|\s+)\S`,
		class: "write",
		tool: "edit",
	},
	// Heredoc-to-file: the 2026-10-03 incident class. The heredoc BODY is
	// stripped by normalization; the `<< MARKER > file` prefix remains.
	{
		pattern: String.raw`<<-?\w+\s*>>?(?!\s*/dev/null)\s*\S`,
		class: "write",
		tool: "edit",
	},
	// Python one-liners that write files (-c with open(...,'w'/'a', .write,
	// .writelines, .write_text, shutil, exec/eval, or a Path write).
	{
		pattern: String.raw`\bpython[0-9.]*\s+-c\b[^|;&]*(\.(write|writelines|write_text)\(|\bshutil\b|\bexec\(|\beval\(|\bopen\s*\([^)]*['"][wa]|Path\s*\([^)]*\.write)`,
		class: "write",
		tool: "edit",
	},
	// Truncate / dd with an output file (full replacement -> the write tool).
	{
		pattern: String.raw`(^truncate\s+-s\b|^dd\b[^|;&]*\bof=\S)`,
		class: "write",
		tool: "write",
	},
	// --- READ class ----------------------------------------------------------
	// Python one-liners that read files.
	{
		pattern: String.raw`\bpython[0-9.]*\s+-c\b[^|;&]*(\.(read|readlines|read_text)\(|\bopen\s*\([^)]*['"]r)`,
		class: "read",
		tool: "read",
	},
	// cat/less/more/nl/od/xxd reading file content. The `<<` lookahead keeps
	// stdin-feeding heredocs (`cat <<EOF ... EOF`, read-neutral) uncounted.
	{
		pattern: String.raw`^(cat|less|more|nl|od|xxd)\b(?![^|;&]*<<)`,
		class: "read",
		tool: "read",
	},
	// head/tail slices -> read with offset/limit.
	{
		pattern: String.raw`^(head|tail)\b`,
		class: "read",
		tool: "read",
	},
	// sed -n slices -> read with offset/limit.
	{
		pattern: String.raw`\bsed\b[^|;&]*\s-n\b`,
		class: "read",
		tool: "read",
	},
	// base64 with a file operand (encode from a file).
	{
		pattern: String.raw`\bbase64\b\s+[A-Za-z0-9_/.~]`,
		class: "read",
		tool: "read",
	},
	// --- SEARCH class --------------------------------------------------------
	// Terminal reads of the family's CCR ledger bypass the ledger contract.
	{
		pattern: String.raw`\bgrep\b[^|;&]*ccr\.db|\bsqlite3\b[^|;&]*(ccr|ledger)`,
		class: "search",
		tool: "ccr_retrieve",
	},
	// Terminal grep/ripgrep/ack family -> the grep tool.
	{
		pattern: String.raw`^(grep|egrep|rg|ack|ag|sift)\b`,
		class: "search",
		tool: "grep",
	},
	// find with a name/path/size/newer predicate -> glob for names.
	{
		pattern: String.raw`\bfind\b[^|;&]*\s(-name|-path|-newer|-size)\b`,
		class: "search",
		tool: "glob",
	},
	// --- DISCOVERY class (note-only, never denied) ---------------------------
	// ls -R / tree / pure find -type f listing -> glob for path discovery.
	{
		pattern: String.raw`^ls\b[^|;&]*\s-R\b`,
		class: "discovery",
		tool: "glob",
	},
	{
		pattern: String.raw`^tree\b`,
		class: "discovery",
		tool: "glob",
	},
	{
		pattern: String.raw`\bfind\b[^|;&]*\s-type\s+f\b`,
		class: "discovery",
		tool: "glob",
	},
	// pwd/cd in a bash call -> the working_directory tool keeps shells correct.
	{
		pattern: String.raw`^(pwd|cd)\b`,
		class: "discovery",
		tool: "working_directory",
	},
	// curl/wget content fetches -> web_fetch decodes/truncates consistently.
	{
		pattern: String.raw`^(curl|wget)\b`,
		class: "discovery",
		tool: "web_fetch",
	},
	// --- CONTROL class (note-only, never denied) -----------------------------
	// Background shell jobs -> run_in_background + job_output/job_kill.
	{
		pattern: String.raw`\b(nohup|screen|tmux|disown)\b`,
		class: "control",
		tool: "run_in_background",
	},
	// cron/at/launchctl -> the schedule_* tools.
	{
		pattern: String.raw`^(cron|at|launchctl)\b`,
		class: "control",
		tool: "schedule_create",
	},
	// Global package installs -> plugin_manager (version gating + approval).
	{
		pattern: String.raw`\b(npm\s+(i|install)\s+(-g|--global)\b|\bpnpm\s+add\s+(-g|--global)\b|\byarn\s+global\s+add\b)`,
		class: "control",
		tool: "plugin_manager",
	},
];

// ---------------------------------------------------------------------------
// DEFAULT_EXEMPTS - the legitimate-bash boundary (plan §2.6), checked AFTER
// normalization and BEFORE the row scan / catch-all. Exemption is decided per
// PIPELINE (a maximal run of command segments joined by `|`), anchored at the
// pipeline's head command: an exempt head dominates the rest of the pipeline
// (rule 5) - `git diff > patch.txt` and `pnpm build | tail -20` are exempt,
// while a bare `echo x > tracked.md` (head not exempt) still fires.
// ---------------------------------------------------------------------------
export const DEFAULT_EXEMPTS: string[] = [
	// Builds, tests, package managers (global installs excluded - control row).
	String.raw`^pnpm\b(?!.*\s(-g|--global)\b)`,
	String.raw`^npm\b(?!.*\s(-g|--global)\b)`,
	String.raw`^yarn\b(?!.*\s+global\s+add\b)`,
	String.raw`^(npx|node|tsc|esbuild|vite|pytest|cargo|make|ctest|go|swift)\b`,
	// python script.py is exempt; python -c stays judged (the plan's boundary).
	String.raw`^python[0-9.]*\s+(?!-c\b)\S`,
	// VCS (deletions and lifecycle through rm are permitted, code-authoring §5).
	String.raw`^git\b`,
	// Process / network / remote CLIs (ssh remote commands are not local content).
	String.raw`^(docker|ps|kill|lsof|systemctl|ssh|scp)\b`,
	// File metadata & lifecycle ops with no dedicated tool.
	String.raw`^(stat|du|df|rm|rmdir|mkdir|cp|mv|chmod|touch|ln)\b`,
	// Bare ls / single-level ls (ls -R stays a discovery strike).
	String.raw`^ls\b(?!.*\s-R\b)`,
	// Data transformation needs stdin: cat | jq-style tails are exempt.
	String.raw`^cat\b[^|;&]*\|\s*(jq|cut|tr|sort|uniq|column)\b`,
];
