// Normalize - command normalization and segment splitting (plan Part 2 §2.7a).
// Detection is NEVER exact-match only: before any matching, the raw command is
// normalized so obfuscated variants resolve to the same text the pattern rows
// and the intent-marker scan see.
//
// The normalizer, in order:
//   1. Heredoc bodies are STRIPPED (`<< [+-]MARKER` ... MARKER): the body is
//      stdin data, not command text, and must not match rows or markers; the
//      `<< MARKER` prefix and any redirect survive (the heredoc-to-file row).
//   2. Substitutions ($(...), `...`) become the marker `«sub»` (inner text
//      kept out of matching - it is command OUTPUT, not command text).
//   3. Variables ($IFS, $VAR, ${VAR}) become the marker `«var»` - treated as
//      an opaque token; `$IFS` specifically becomes a space (the classic
//      whitespace obfuscation).
//   4. Quote layers are stripped ('x', "x", \x -> x), whitespace collapsed,
//      and the leading command word of the whole command lowercased.
//
// Splitting (plan Part 2 §2.6 / the PLAN §5 Detect contract): the command is
// split into PIPELINES on `;`, `&&`, `||`, `&` (outside quotes/heredocs -
// heredocs are already gone at this point); a pipeline's segments (split on
// `|`) share one fate: if the pipeline's HEAD is exempt, the whole pipeline is
// exempt (rule 5); otherwise every segment is classified individually and the
// highest-priority class wins. Trailing redirect context belongs to the
// segment it follows, so `cat f > out.txt` is one segment with a redirect.
import { CLASS_PRIORITY } from "@Variable/Patterns.js";
import type { CoachClass } from "@Interface/Execution.js";

/** The class priority rank of a class (lower = more severe). */
export const Rank = (Class: CoachClass): number => CLASS_PRIORITY.indexOf(Class);

/** Escape user data before template insertion: `${` becomes `$${`. */
export const Escape = (Text: string): string => Text.replaceAll("${", "$${");

/**
 * Strip heredoc bodies. `<< [-]MARKER` starts a heredoc; everything after the
 * operator line until a line equal to MARKER is body data and is removed.
 * Redirects on the operator line survive.
 */
export const StripHeredocs = (Command: string): string => {
	const Lines = Command.split("\n");
	const Output: string[] = [];
	let Marker: string | undefined;
	for (const Line of Lines) {
		if (Marker !== undefined) {
			// Inside a heredoc: only the closing marker line ends the body.
			if (Line.trim() === Marker) {
				Marker = undefined;
			}
			continue;
		}
		const Start = Line.match(/<<(-?)(\S+)/);
		if (Start && Start[2]) {
			Marker = (Start[2] ?? "").replace(/^['"]|['"]$/g, "");
			// The operator line survives (the `<< MARKER > file` prefix).
			Output.push(Line);
			continue;
		}
		Output.push(Line);
	}
	return Output.join("\n");
};

/** Remove quote layers and backslashes: 'x', "x", \x -> x. */
export const StripQuotes = (Text: string): string =>
	Text
		.replace(/\\(.)/g, "$1")
		.replace(/'([^']*)'/g, "$1")
		.replace(/"([^"]*)"/g, "$1");

/** Collapse runs of whitespace to single spaces and trim. */
export const Collapse = (Text: string): string => Text.replace(/\s+/g, " ").trim();

/** Normalize ONE pipeline's text (no splitting): the plan's §2.7a steps. */
const Normalize = (Pipeline: string): string => {
	let Text = StripHeredocs(Pipeline);
	// Subshells -> the «sub» marker (one pass; nested content is dropped).
	Text = Text.replace(/\$\(([^()]*)\)/g, "«sub»").replace(/`([^`]*)`/g, "«sub»");
	// $IFS is the classic whitespace obfuscation -> a literal space.
	Text = Text.replace(/\$IFS/g, " ");
	// ${VAR} and $VAR -> the «var» marker (positional parameters too).
	Text = Text.replace(/\$\{[^}]*\}/g, "«var»").replace(/\$[A-Za-z_][A-Za-z0-9_]*|\$\d/g, "«var»");
	Text = StripQuotes(Text);
	Text = Collapse(Text);
	// Lowercase ONLY the leading command word (paths stay case-sensitive).
	const Space = Text.indexOf(" ");
	if (Space === -1) {
		return Text.toLowerCase();
	}
	return `${Text.slice(0, Space).toLowerCase()}${Text.slice(Space)}`;
};

export default Normalize;

/** Split a pipeline into its pipe segments (the unit of classification). */
export const Segments = (Pipeline: string): string[] =>
	Pipeline.split("|").map((Segment) => Segment.trim()).filter((Segment) => Segment.length > 0);

/** The pipeline's head command word (its first segment's first token). */
export const Head = (Pipeline: string): string => {
	const First = Segments(Pipeline)[0] ?? "";
	const Space = First.indexOf(" ");
	return (Space === -1 ? First : First.slice(0, Space)).toLowerCase();
};
