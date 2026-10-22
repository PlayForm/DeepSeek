// Segments - the command splitter (Function/Segments): one terminal command
// may be a compound ("cd x && git status"), so the guard classifies EVERY
// segment. The command is split on the shell separators (`&&`, `||`, `;`,
// `|`, newline); each segment is trimmed; empty segments are dropped.
//
// Pure internal calculation - no subprocess, no I/O.
export default (Command: string): string[] =>
	Command.split(/&&|\|\||;|\||\n/)
		.map((Segment) => Segment.trim())
		.filter((Segment) => Segment.length > 0);
