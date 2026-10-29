// Strip - the flavor's TRANSFORM: the `(Text, State) => { text, count }`
// contract the shared tool-results arm factory calls once per text block.
// It understands exactly ONE shape, the `read` tool's model-facing envelope
// (the harness contract, byte-for-byte):
//
//   <path>{displayPath}</path>
//   <type>file</type>
//   <content>
//   {body}
//   </content>
//
// where {body} is the numbered lines `{n}: {line text}` joined with "\n",
// then a blank line and a footer line starting with "(":
//   (End of file - total N lines)
//   (Showing lines A-B of T. Use offset=B+1 to continue.)
//   (Output capped. Showing lines A-B. Use offset=B+1 to continue.)
//
// The rules, in order:
//   1. no envelope match -> the block BY IDENTITY, count 0, no ledger line
//      (the core's no-op contract: an unchanged block contributes nothing);
//   2. unknown extension -> identity (never strip what cannot be parsed);
//   3. the body is walked line by line: a line matching `^(\d+): ` carries a
//      line-number prefix that MUST be preserved BYTE-EXACTLY; the blank
//      line and the footer are left untouched;
//   4. the line TEXT is scanned by Function/Scan (string-aware), and every
//      line is preserved - a full-line comment becomes an empty line, a
//      trailing comment is removed from its start; no line is ever deleted,
//      so the numbering the model sees still matches the file;
//   5. when `notice` is on and something was stripped, the omission notice
//      line is appended AFTER the body (inside <content>), so the model can
//      tell "complete code with comments removed" from "a file with no
//      comments";
//   6. `count` is the number of comment spans removed; 0 keeps the block by
//      identity (the core then returns the downstream decision unchanged and
//      writes NO ledger line).
//
// The carry state (a `/* */` block, a Python docstring, a template literal, a
// Ruby =begin block) lives in ONE Mark object for the whole text block, so a
// construct that opens on one numbered line closes correctly on a later one.
// Pure per call: the Mark is local, and the input string is never mutated.
import type Mark from "@Interface/Mark.js";
import type State from "@Interface/State.js";

import Detect from "./Detect.js";
import Scan from "./Scan.js";

/** The read tool's model-facing envelope (the harness contract). */
const Envelope = /^<path>([^\n]*)<\/path>\n<type>file<\/type>\n<content>\n([\s\S]*)\n<\/content>$/u;

/** One body line's line-number prefix: `{n}: ` followed by the line text. */
const Numbered = /^(\d+): ([\s\S]*)$/u;

/** The omission notice line (module-owned, byte-exact, asserted by the smoke). */
const Omission =
	"(Comments omitted. Use grep to inspect them, or ask the user to include comments.)";

export default (Text: string, State: State): { text: string; count: number } => {
	const Match = Envelope.exec(Text);
	// 1. Not a read envelope: pass by identity (the core's no-op contract).
	if (Match === null) {
		return { text: Text, count: 0 };
	}
	const Path = Match[1] ?? "";
	const Body = Match[2] ?? "";
	const Syntax = Detect(Path);
	// 2. Unknown extension: never strip what cannot be parsed.
	if (Syntax === undefined) {
		return { text: Text, count: 0 };
	}
	// 3./4. Walk the body: numbered lines are scanned, everything else (the
	// blank separator, the footer) is preserved verbatim.
	const Carry: Mark = {};
	let Count = 0;
	const Lines = Body.split("\n").map((Line) => {
		const Prefix = Numbered.exec(Line);
		if (Prefix === null) {
			return Line;
		}
		const Result = Scan(Prefix[2] ?? "", Syntax, Carry);
		Count += Result.count;
		return `${Prefix[1]}: ${Result.text}`;
	});
	// 6. Nothing stripped: the original text by identity, no ledger line.
	if (Count === 0) {
		return { text: Text, count: 0 };
	}
	// 5. Rebuild the envelope; the notice goes after the body, inside <content>.
	const Notice = State.Notice ? `\n${Omission}` : "";
	return {
		text: `<path>${Path}</path>\n<type>file</type>\n<content>\n${Lines.join("\n")}${Notice}\n</content>`,
		count: Count,
	};
};
