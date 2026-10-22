// Normalize - the text normalization that feeds every fingerprint: CRLF and
// CR become LF, and trailing whitespace is stripped per line (the brief's
// section 4.1 fingerprint formula's "normalized text").
export default (Text: string): string =>
	Text.replace(/\r\n?/g, "\n")
		.split("\n")
		.map((Line) => Line.replace(/[ \t]+$/g, ""))
		.join("\n");
