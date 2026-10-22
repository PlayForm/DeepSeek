// Language - the extension-based detection of the three parsed languages:
// TypeScript, JavaScript and Markdown. Anything else returns undefined and
// the index call skips the file with the byte-exact `unsupported language`
// line - no fake parsing of other formats in W1.
export default (Path: string): "typescript" | "javascript" | "markdown" | undefined => {
	const Lower = Path.toLowerCase();
	if (
		Lower.endsWith(".ts") ||
		Lower.endsWith(".tsx") ||
		Lower.endsWith(".mts") ||
		Lower.endsWith(".cts")
	) {
		return "typescript";
	}
	if (
		Lower.endsWith(".js") ||
		Lower.endsWith(".jsx") ||
		Lower.endsWith(".mjs") ||
		Lower.endsWith(".cjs")
	) {
		return "javascript";
	}
	if (Lower.endsWith(".md") || Lower.endsWith(".markdown")) {
		return "markdown";
	}
	return undefined;
};
