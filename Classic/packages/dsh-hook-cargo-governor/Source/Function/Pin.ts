// Pin — the surgical line-level rewrite of the raw Cargo.toml text (the
// internal calculation that makes comment/formatting preservation possible:
// smol-toml is used ONLY to identify entries — Function/Decode/Satisfy — and
// THIS function operates on the raw text lines, so comments, inline
// comments, blank lines, and spacing survive byte-for-byte; only the version
// requirement strings of the planned entries change). Never a TOML
// stringify.
//
// Handled entry shapes on the raw text:
//   * `name = "0.3.4"`                     → the quoted string is replaced;
//   * `name = { version = "0.3.4", ... }`  → the version inside the inline
//                                             table is replaced (same line);
//   * a pretty-printed inline table        → the `version = "..."` line inside
//     (the `{` opens, the `}` closes        the entry's lines is replaced;
//     on later lines)
//   * `name.version = "0.3.4"` (dotted)    → treated as the inline shape via
//                                             the parsed entry (rare);
//   * `[dependencies.name]` table style    → the `version = "..."` line inside
//     the entry table is replaced;
//   * strips (strict mode)                 → the entry's lines are REMOVED
//     (single-line entries: just the line; pretty/table entries: through the
//     closing brace or the next header).
//
// REFUSAL GUARD: if any planned entry cannot be located in the text (a
// parse/scan disagreement — the module never writes a partial rewrite), the
// rewrite is ABORTED with a REFUSED line and the original text is returned
// unchanged. Non-dependency sections cannot be touched by construction:
// replacements are only applied while the scanner is inside a planned
// dependency section, and Continue additionally refuses any plan entry whose
// section is not an identified dependency table.
//
// The granularized units (one definition per file, Pin/): SplitPath (the
// header-path normalization), KeyOf (the plan key), Name (the declaration
// matcher) and SpliceVersion (the in-line version splice).
import type Plan from "@Interface/Plan.js";
import SplitPath from "./Pin/SplitPath.js";
import KeyOf from "./Pin/KeyOf.js";
import Name from "./Pin/Name.js";
import SpliceVersion from "./Pin/SpliceVersion.js";

export interface Outcome {
	/** The rewritten text (unchanged when nothing matched or on refusal). */
	Text: string;
	/** Whether any line was modified. */
	Changed: boolean;
	/** Refusal message when the rewrite was aborted, else null. */
	Refusal: string | null;
}

export default (Text: string, Plan: Plan, Path: string): Outcome => {
	// Pending work keyed by section::name; each entry is consumed exactly once
	// — an unconsumed entry at the end aborts the rewrite (never a partial one).
	const Pending = new Map<string, { section: string; name: string; to: string }>();
	for (const Item of Plan.replacements) {
		Pending.set(KeyOf(Item.section, Item.name), {
			section: Item.section,
			name: Item.name,
			to: Item.to,
		});
	}
	const Strips = new Set<string>(Plan.strips.map((S) => KeyOf(S.section, S.name)));
	const SectionPaths = new Set(
		Plan.replacements.map((R) => R.section).concat(Plan.strips.map((S) => S.section)),
	);
	const Lines = Text.split("\n");
	let Changed = false;
	let Refusal: string | null = null;
	// Scanner state: the current section path (when inside a planned dependency
	// section) and, for table-style entries, the pending entry it opens.
	let CurrentSection: string | null = null;
	let TableEntry: string | null = null;

	for (let Index = 0; Index < Lines.length; Index += 1) {
		const Line = Lines[Index] as string;
		// Header lines: recompute the scanner state.
		const Header = /^\s*\[\s*([^\]]+?)\s*\]\s*(#.*)?$/.exec(Line);
		switch (true) {
			case !!Header: {
				const Parts = SplitPath((Header as RegExpExecArray)[1] as string);
				const Joined = Parts.join(".");
				const Parent = Parts.slice(0, -1).join(".");
				const Last = Parts[Parts.length - 1] as string;
				switch (true) {
					case SectionPaths.has(Joined):
						CurrentSection = Joined;
						TableEntry = null;
						break;
					case SectionPaths.has(Parent) && Strips.has(KeyOf(Parent, Last)):
						// Table-style strip entry: remove from this header through the
						// lines until the next header (the whole [section.name] block).
						CurrentSection = null;
						TableEntry = null;
						let End = Index + 1;
						while (End < Lines.length && !/^\s*\[/.test(Lines[End] as string)) {
							End += 1;
						}
						Lines.splice(Index, End - Index);
						Changed = true;
						Strips.delete(KeyOf(Parent, Last));
						Index -= 1;
						break;
					case SectionPaths.has(Parent) && Pending.has(KeyOf(Parent, Last)):
						// Table-style entry: the version line lives inside this block.
						CurrentSection = Parent;
						TableEntry = KeyOf(Parent, Last);
						break;
					default:
						CurrentSection = null;
						TableEntry = null;
				}
				continue;
			}
		}
		// Inside a table-style entry: replace its version line.
		switch (true) {
			case TableEntry !== null: {
				const Item = Pending.get(TableEntry as string);
				switch (true) {
					case !!Item && /^\s*version\s*=\s*/.test(Line):
						Lines[Index] = SpliceVersion(Line, Item.to);
						Pending.delete(TableEntry as string);
						Changed = true;
						break;
				}
				continue;
			}
		}
		// Inside a planned dependency section: match `name = value` declarations.
		switch (true) {
			case CurrentSection === null:
				continue;
		}
		const Parsed = Name(Line);
		switch (true) {
			case !Parsed:
				continue;
		}
		const Key = KeyOf(CurrentSection as string, (Parsed as { key: string }).key);
		const Item = Pending.get(Key);
		switch (true) {
			case Strips.has(Key): {
				// Strict strip: remove the entry's lines. A single-line value
				// (quoted string or balanced inline table) is one line; an unbalanced
				// `{` continues through the closing brace.
				let End = Index + 1;
				let Depth = 0;
				for (const Char of (Parsed as { rest: string }).rest) {
					switch (Char) {
						case "{":
							Depth += 1;
							break;
						case "}":
							Depth -= 1;
							break;
					}
				}
				while (Depth > 0 && End < Lines.length && !/^\s*\[/.test(Lines[End] as string)) {
					for (const Char of Lines[End] as string) {
						switch (Char) {
							case "{":
								Depth += 1;
								break;
							case "}":
								Depth -= 1;
								break;
						}
					}
					End += 1;
				}
				Lines.splice(Index, End - Index);
				Strips.delete(Key);
				Changed = true;
				Index -= 1;
				continue;
			}
			case !!Item: {
				// Replacement. The value must be a quoted string on this line, or the
				// pretty inline-table shape with the version on a later line.
				const Value = (Parsed as { rest: string }).rest;
				switch (true) {
					case /^\s*[{"]|^\s*'/.test(Value): {
						const Spliced = SpliceVersion(Line, Item.to);
						switch (true) {
							case Spliced !== Line:
								Lines[Index] = Spliced;
								Pending.delete(Key);
								Changed = true;
								break;
							default: {
								// Pretty table: scan forward through the entry's lines for
								// `version = "..."`, staying inside the braces.
								let Depth = 0;
								for (const Char of Value) {
									switch (Char) {
										case "{":
											Depth += 1;
											break;
										case "}":
											Depth -= 1;
											break;
									}
								}
								let Scan = Index + 1;
								while (Depth > 0 && Scan < Lines.length) {
									const Candidate = Lines[Scan] as string;
									if (/^\s*\[/.test(Candidate)) {
										break;
									}
									for (const Char of Candidate) {
										switch (Char) {
											case "{":
												Depth += 1;
												break;
											case "}":
												Depth -= 1;
												break;
										}
									}
									switch (true) {
										case /^\s*version\s*=\s*/.test(Candidate):
											Lines[Scan] = SpliceVersion(Candidate, Item.to);
											Pending.delete(Key);
											Changed = true;
											Depth = 0;
											break;
									}
									Scan += 1;
								}
							}
						}
						break;
					}
					default: {
						// Non-string, non-table value (dotted workspace inheritance etc.
						// already filtered by Satisfy) — cannot be spliced safely.
						Refusal = `REFUSED rewrite of ${Path}: dependency "${(Parsed as { key: string }).key}" in section "${CurrentSection}" has an unsupported value shape — rewrite aborted`;
						break;
					}
				}
				break;
			}
		}
		switch (true) {
			case !!Refusal:
				Index = Lines.length;
				break;
		}
	}
	// Every planned entry must have been consumed — never a partial rewrite.
	switch (true) {
		case Refusal === null && Pending.size > 0: {
			const Missed = Pending.values().next().value as {
				section: string;
				name: string;
			};
			Refusal = `REFUSED rewrite of ${Path}: dependency "${Missed.name}" in section "${Missed.section}" not found in text — rewrite aborted`;
			break;
		}
	}
	switch (true) {
		case !!Refusal:
			return { Text, Changed: false, Refusal };
		default:
			return { Text: Lines.join("\n"), Changed, Refusal: null };
	}
};
