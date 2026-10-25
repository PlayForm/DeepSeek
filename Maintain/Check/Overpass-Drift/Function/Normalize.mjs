import Strip from "./Strip.mjs";

// The normalized text: BOM removed, comments stripped, every whitespace run
// collapsed to one space, ends trimmed. Formatting (line breaks, indentation,
// alignment) disappears; tokens, string contents and punctuation survive.
export default (Source) =>
	Strip(Source.replace(/^\uFEFF/, ""))
		.replace(/\s+/g, " ")
		.trim();
