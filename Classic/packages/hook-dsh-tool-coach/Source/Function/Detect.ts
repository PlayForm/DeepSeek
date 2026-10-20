// Detect - the classifier for one judged terminal call (plan Part 3 §3.5
// step 1 + the adversarial layer Part 2 §2.7). Detection is NEVER exact-match
// only: command normalization (Function/Normalize) + the pattern rows + an
// intent-marker scan + a craft library + a catch-all - the pattern table is
// one input, not the authority.
//
// The evaluation order per pipeline (a maximal run of segments joined by `|`,
// pipelines split on `;`/`&&`/`||`/`&`):
//   1. CLASSIFY (rows first, then markers) - exemption is an OVERRIDE of a
//      would-be offense, so the pipeline is classified first;
//   2. EXEMPT override: if the pipeline's head matches an exemption and the
//      pipeline would have been flagged, the pipeline is exempt (rule 5: an
//      exempt head dominates the rest of the pipeline; a bare non-exempt head
//      like `echo x > tracked.md` still fires);
//   3. the highest-priority class across all pipelines wins (write > read >
//      search > discovery > control) - chained segments classify INDIVIDUALLY
//      (`cat a; sed -i ...` yields one read match and one write match, and the
//      write match is reported).
//
// Markers (plan §2.7b) - class determined by intent, not vocabulary:
//   - redirect to a real path (`>` / `>>` not to /dev/null) -> write (the
//     catch-all: novel zero-day forms still land; the redirect wins over an
//     earlier read-row match because write outranks every other class, e.g.
//     `cat f | sed s/a/b/ > f` is write);
//   - decode-then-execute (`base64 -d | sh`, `printf x | sh`, any pipeline
//     whose last segment is a shell) -> write (payload execution = unreviewed
//     content);
//   - `$var` indirection with `-i` (`«var» -i ...`) -> write (craft library);
//   - `--in-place` anywhere -> write;
//   - wrappers (sh -c / bash -c / eval / xargs / find -exec) never exempt:
//     the INNER payload is re-scanned through the same rows.
import Normalize, { Rank, Segments } from "../Function/Normalize.js";
import type { CoachRow, Detection, Match } from "../Interface/Execution.js";

/** The command-word position markers that begin a wrapper payload. */
const WRAPPERS = /^(sh|bash|zsh|dash|eval|source|nice|env|timeout|xargs)\b/;

/** Unwrap one wrapper segment to its inner payload text (or null). */
const Unwrap = (Segment: string): string | null => {
	const DashC = Segment.match(/(?:^|\s)-c\s+(.*)$/);
	if (DashC && WRAPPERS.test(Segment)) {
		return DashC[1] ?? null;
	}
	const Exec = Segment.match(/\s-exec\s+(.*?)\s*(?:\{\}\s*[;+]|\{|;|\+)/);
	if (Exec) {
		return Exec[1] ?? null;
	}
	const Xargs = Segment.match(/^xargs\s+(.*)$/);
	if (Xargs) {
		return Xargs[1] ?? null;
	}
	return null;
};

/** The redirect marker: `>` / `>>` followed by a real path token. */
const REDIRECT = />>(?!\s*\/dev\/null\b)(?!\s*\|)\s*\S+|>(?!\s*\/dev\/null\b)(?!\s*\|)\s*\S+/;
/** Ambiguous in-place flag: safe to catch-all on any segment. */
const IN_PLACE = /--in-place\b/;

/** The craft library (plan §2.7c): obfuscated variant -> class via markers. */
const CRAFT = (Segment: string): Match | null => {
	const Indirect = Segment.startsWith("«var»") && /\s-i(?:\.\w+)?\b/.test(Segment);
	if (Indirect || IN_PLACE.test(Segment) || REDIRECT.test(Segment)) {
		return { command: "", class: "write", tool: "edit", pattern: "<catch-all>" };
	}
	return null;
};

/** Pipe-to-shell payload execution (the decode-then-execute family). */
const PIPE_TO_SHELL = /(?:^|\|)\s*(sh|bash|zsh|dash|pwsh)\s*$/;

/**
 * Detect one judged terminal call. `Command` is the raw command string; `Rows`
 * and `Exempts` are the EFFECTIVE rows/exemptions (built-in defaults with the
 * user's rows appended).
 */
export default (Command: string, Rows: CoachRow[], Exempts: string[]): Detection => {
	const Compiled: { row: CoachRow; regex: RegExp }[] = [];
	for (const Row of Rows) {
		try {
			Compiled.push({ row: Row, regex: new RegExp(Row.pattern) });
		} catch {
			/* an invalid row regex is skipped (validated fail-loud at load) */
		}
	}
	const ExemptRes: { source: string; regex: RegExp }[] = [];
	for (const Source of Exempts) {
		try {
			ExemptRes.push({ source: Source, regex: new RegExp(Source) });
		} catch {
			/* skipped like the rows */
		}
	}

	// The best match found so far (holder object: the closure mutates it).
	const Best: { match: Match | null } = { match: null };
	const Consider = (Candidate: Match): void => {
		if (Best.match === null || Rank(Candidate.class) < Rank(Best.match.class)) {
			Best.match = Candidate;
		}
	};
	// Per-pipeline classification (each pipeline is classified independently;
	// the exemption override is per pipeline too).
	const Local: { match: Match | null } = { match: null };
	const ConsiderLocal = (Candidate: Match): void => {
		if (Local.match === null || Rank(Candidate.class) < Rank(Local.match.class)) {
			Local.match = Candidate;
		}
	};

	// Classify one segment: rows first, then the craft/markers.
	const Scan = (Text: string, Original: string): void => {
		for (const { row, regex } of Compiled) {
			if (!regex.test(Text)) {
				continue;
			}
			ConsiderLocal({
				command: Original.slice(0, 200),
				class: row.class,
				tool: row.tool,
				pattern: row.pattern,
				note: row.note,
			});
			return;
		}
		// The craft library: the redirect/in-place/indirection catch-all.
		const Craft = CRAFT(Text);
		if (Craft) {
			ConsiderLocal({ ...Craft, command: Original.slice(0, 200) });
		}
	};

	const Results: { match: Match | null; exempt: string | null }[] = [];

	for (const Pipeline of SplitPipelines(Command)) {
		const Normalized = Normalize(Pipeline);
		const NormSegs = Segments(Normalized);
		const OrigSegs = Segments(Pipeline);
		Local.match = null;
		for (let Index = 0; Index < NormSegs.length; Index += 1) {
			const Segment = NormSegs[Index];
			if (Segment === undefined) {
				continue;
			}
			const Original = OrigSegs[Index] ?? Segment;
			Scan(Segment, Original);
			// Wrappers never exempt: re-scan the inner payload.
			const Inner = Unwrap(Segment);
			if (Inner) {
				Scan(Normalize(Inner), Original);
			}
		}
		// The decode-then-execute family: any pipeline ending in a shell.
		if (PIPE_TO_SHELL.test(Normalized)) {
			ConsiderLocal({
				command: Pipeline.slice(0, 200),
				class: "write",
				tool: "edit",
				pattern: "<catch-all>",
			});
		}
		// The exempt override: an exempt head dominates a would-be offense.
		let ExemptHere: string | null = null;
		if (Local.match !== null) {
			for (const { source, regex } of ExemptRes) {
				if (regex.test(Normalized)) {
					ExemptHere = source;
					break;
				}
			}
		}
		Results.push({ match: Local.match, exempt: ExemptHere });
	}

	// Merge: a non-exempt offense wins; exempt-only pipelines report exempt.
	const Open = Results.filter((Result) => Result.match !== null && Result.exempt === null);
	for (const Result of Open) {
		if (Result.match !== null) {
			Consider(Result.match);
		}
	}
	if (Best.match !== null) {
		return { kind: "offense", match: Best.match };
	}
	const Exempted = Results.filter((Result) => Result.match !== null && Result.exempt !== null);
	const First = Exempted[0];
	if (First?.match && First.exempt !== null) {
		return { kind: "exempt", pattern: First.exempt };
	}
	return null;
};

/**
 * Split the command into pipelines on `;`, `&&`, `||`, `&` outside quotes, on
 * the RAW command so the ORIGINAL segment text is preserved for the note's
 * ${command} fill; each pipeline is normalized independently (heredoc bodies
 * are stripped inside normalization).
 */
const SplitPipelines = (Command: string): string[] => {
	const Pipelines: string[] = [];
	let Current = "";
	let Quote: string | undefined;
	for (let Index = 0; Index < Command.length; Index += 1) {
		const Char = Command[Index];
		const Next = Command[Index + 1];
		if (Quote !== undefined) {
			Current += Char;
			if (Char === Quote && Command[Index - 1] !== "\\") {
				Quote = undefined;
			}
			continue;
		}
		if (Char === '"' || Char === "'") {
			Quote = Char;
			Current += Char;
			continue;
		}
		if ((Char === "&" && Next === "&") || (Char === "|" && Next === "|")) {
			Pipelines.push(Current);
			Current = "";
			Index += 1;
			continue;
		}
		if (Char === ";" || Char === "&" || Char === "\n") {
			Pipelines.push(Current);
			Current = "";
			continue;
		}
		Current += Char;
	}
	Pipelines.push(Current);
	return Pipelines.map((Pipeline) => Pipeline.trim()).filter((Pipeline) => Pipeline.length > 0);
};
