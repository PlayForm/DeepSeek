// ScanMarkdown - the v0 Markdown section scanner: one DocSection per
// `^#{1,6} ` heading, with the span from the heading line to the line before
// the next heading of the same or higher level (or the end of the file). The
// title is the heading text without the hashes and the separating space.
import type { Span } from "@Interface/Node.js";

export interface SectionMatch {
	level: number;
	title: string;
	span: Span;
}

const Heading = /^(#{1,6})\s+(.*)$/;

export default (Lines: string[]): SectionMatch[] => {
	const Headings = Lines.map((Line, Index) => {
		const Match = Heading.exec(Line);
		return Match === null
			? undefined
			: { level: (Match[1] ?? "").length, title: Match[2] ?? "", line: Index + 1 };
	}).filter((Item): Item is { level: number; title: string; line: number } => Item !== undefined);
	const Sections: SectionMatch[] = [];
	for (let Position = 0; Position < Headings.length; Position++) {
		const Heading_ = Headings[Position];
		if (Heading_ === undefined) {
			continue;
		}
		let End = Lines.length;
		for (const Later of Headings.slice(Position + 1)) {
			if (Later.level <= Heading_.level) {
				End = Later.line - 1;
				break;
			}
		}
		Sections.push({
			level: Heading_.level,
			title: Heading_.title,
			span: { startLine: Heading_.line, endLine: End },
		});
	}
	return Sections;
};
