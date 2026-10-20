// Preview - the per-type ONE-LINE preview builders (plan §4.2, seeded from
// Aphrodite's preview formats: `[build:1E 1W 142L | ...]` becomes
// `[terminal:exit 0 | 142 lines | first error line]`). The composed line is
// what the replacement content shows above the marker:
//
//     [terminal:exit 0 | 142 lines | make: *** error]
//     <<<CCR:0a1b2c...|terminal|5231>>>
//
// Pure functions of (type, content, max): no I/O, no clock, no session
// state. Every builder goes through the SAME hard-cut truncation: a preview
// longer than `max` (the volatile `previewMaxChars`, default 240) is cut to
// exactly `max` characters - the cap is a hard ceiling, never a graceful
// ellipsis, so a smoke can assert the cut bytes. `error` previews are just
// the first significant line (the failure message is the preview).
import type { ContentBlock } from "@deepseek-ai/dsh-llm";

import { Text as Joined } from "./Classify.js";

export default (Type: string, Content: ContentBlock[], Max: number): string => {
	const Full = Body(Type, Joined(Content), Content);
	switch (true) {
		case Max >= 0 && Full.length > Max:
			return Full.slice(0, Max);
		default:
			return Full;
	}
};

// The un-truncated body, per type. `Joined` is the joined text of the
// content blocks; `Content` backs the byte-size line for the default type.
const Body = (Type: string, Text: string, Content: ContentBlock[]): string => {
	const Lines = Text.split("\n");
	const First = Lines.find((Line) => Line.trim().length > 0)?.trim() ?? "";
	const Count = Lines.filter((Line) => Line.trim().length > 0).length;
	switch (Type) {
		case "terminal":
			// The exit code when the harness echoed one, "?" otherwise.
			return `exit ${exitCode(Text)} | ${Lines.length} lines | ${First}`;
		case "grep":
			return `${Count} matches | ${First}`;
		case "paths":
			return `${Count} paths | ${First}`;
		case "file":
			return `${Lines.length} lines | ${First}`;
		case "json":
			return `${jsonShape(Text)} | ${First}`;
		case "web":
			return `${Lines.length} lines | ${First}`;
		case "error":
			return First;
		default:
			return `${Buffer.byteLength(JSON.stringify(Content))} bytes | ${First}`;
	}
};

// The exit-code extractor: the harness's terminal results echo the code in a
// line like `exit code: 0` (any position); "?" when absent.
const exitCode = (Text: string): string => {
	const Match = /(?:^|\n)\s*exit code:? ?(\S+)/.exec(Text);
	return Match?.[1] ?? "?";
};

// The JSON shape: `N items` for arrays, `N keys` for objects, `N bytes` when
// the content slipped past the classifier's probe.
const jsonShape = (Text: string): string => {
	try {
		const Parsed: unknown = JSON.parse(Text);
		switch (true) {
			case Array.isArray(Parsed):
				return `${Parsed.length} items`;
			case typeof Parsed === "object" && Parsed !== null:
				return `${Object.keys(Parsed as object).length} keys`;
			default:
				return `${Buffer.byteLength(Text)} bytes`;
		}
	} catch {
		return `${Buffer.byteLength(Text)} bytes`;
	}
};
