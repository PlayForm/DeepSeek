/**
 * @module Language
 *
 * The extension to language and comment syntax
 * (Documentation/Plans/COST-TRACK-PLUGIN.md section 7): the annotation
 * block speaks the file's own comment language.
 *
 * @remarks
 * The line-comment families are the C family (a double slash), the script
 * and data languages (a hash), and the dash family (a double dash); the
 * markup family opens with a comment-open token and closes with a
 * comment-close token. Line opens one comment line; Begin and End wrap the
 * marker lines (they equal Line, and End is empty, for the three
 * line-comment families). An unknown extension returns undefined: the
 * annotation is skipped, never guessed.
 */

/**
 * One file's comment syntax.
 */
type Syntax = {
	Language: string;
	Line: string;
	Begin: string;
	End: string;
};

/**
 * One comment family: the per-line prefix, the language name each
 * extension maps to, and the close token (empty for the line-comment
 * families).
 */
type Family = { Language: string; Line: string; End: string };

/**
 * The extension-to-family table.
 */
const Families = new Map<string, Family>([
	["rs", { Language: "rust", Line: "//", End: "" }],
	["ts", { Language: "typescript", Line: "//", End: "" }],
	["tsx", { Language: "typescript", Line: "//", End: "" }],
	["js", { Language: "javascript", Line: "//", End: "" }],
	["jsx", { Language: "javascript", Line: "//", End: "" }],
	["go", { Language: "go", Line: "//", End: "" }],
	["c", { Language: "c", Line: "//", End: "" }],
	["h", { Language: "c", Line: "//", End: "" }],
	["cpp", { Language: "cpp", Line: "//", End: "" }],
	["hpp", { Language: "cpp", Line: "//", End: "" }],
	["java", { Language: "java", Line: "//", End: "" }],
	["kt", { Language: "kotlin", Line: "//", End: "" }],
	["kts", { Language: "kotlin", Line: "//", End: "" }],
	["swift", { Language: "swift", Line: "//", End: "" }],
	["cs", { Language: "csharp", Line: "//", End: "" }],
	["scala", { Language: "scala", Line: "//", End: "" }],
	["py", { Language: "python", Line: "#", End: "" }],
	["rb", { Language: "ruby", Line: "#", End: "" }],
	["sh", { Language: "shell", Line: "#", End: "" }],
	["bash", { Language: "shell", Line: "#", End: "" }],
	["zsh", { Language: "shell", Line: "#", End: "" }],
	["toml", { Language: "toml", Line: "#", End: "" }],
	["yaml", { Language: "yaml", Line: "#", End: "" }],
	["yml", { Language: "yaml", Line: "#", End: "" }],
	["pl", { Language: "perl", Line: "#", End: "" }],
	["r", { Language: "r", Line: "#", End: "" }],
	["sql", { Language: "sql", Line: "--", End: "" }],
	["lua", { Language: "lua", Line: "--", End: "" }],
	["hs", { Language: "haskell", Line: "--", End: "" }],
	["elm", { Language: "elm", Line: "--", End: "" }],
	["md", { Language: "markdown", Line: "<!--", End: "-->" }],
	["markdown", { Language: "markdown", Line: "<!--", End: "-->" }],
	["mdx", { Language: "markdown", Line: "<!--", End: "-->" }],
	["html", { Language: "html", Line: "<!--", End: "-->" }],
	["htm", { Language: "html", Line: "<!--", End: "-->" }],
	["xml", { Language: "xml", Line: "<!--", End: "-->" }],
	["svg", { Language: "xml", Line: "<!--", End: "-->" }],
	["astro", { Language: "astro", Line: "<!--", End: "-->" }],
	["vue", { Language: "vue", Line: "<!--", End: "-->" }],
	["svelte", { Language: "svelte", Line: "<!--", End: "-->" }],
]);

export default (Path: string): Syntax | undefined => {
	const Extension = Path.slice(Path.lastIndexOf(".") + 1).toLowerCase();
	const Family = Families.get(Extension);
	if (Family === undefined) {
		return undefined;
	}
	return {
		Language: Family.Language,
		Line: Family.Line,
		Begin: Family.Line,
		End: Family.End,
	};
};
