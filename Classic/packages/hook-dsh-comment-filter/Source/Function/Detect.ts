// Detect - the extension -> Syntax table (a Variable-style lookup behind a
// Function-shaped leaf: one default export, one table, one rule). The strip
// transform asks Detect for the file's comment/string vocabulary; an UNKNOWN
// extension returns `undefined`, and Function/Strip then keeps the text block
// BY IDENTITY - never strip what cannot be parsed. `md`, `mdx`, `json` and
// `txt` are deliberately ABSENT: prose and data files have no code comments
// to remove (a `//` in a markdown code fence or a JSON string is content).
//
// The families mirror the mission's table exactly:
//
//   // + /* */   - ts,tsx,mts,cts,js,jsx,mjs,cjs,c,h,cc,cpp,cxx,hpp,hh,cs,
//                  java,kt,kts,swift,go,rs,scala,php,dart,css,scss,sass,less,
//                  proto,groovy,gradle,vue,svelte,zig
//   #            - py,pyi,rb,sh,bash,zsh,fish,pl,pm,r,yml,yaml,toml,ini,cfg,
//                  conf,tf,hcl,nix,cmake
//   --           - sql; -- with --[[ ]] - lua; -- with {- -} - hs,elm
//   ;            - lisp,clj,cljs,scm,asm
//   %            - tex,erl,hrl,matlab
//   <!-- -->     - html,htm,xml,svg,xsl,plist
//   # + <# #>    - ps1
//
// Family-specific refinements (documented where they matter):
//   * `rb` also has the full-line =begin/=end block;
//   * `php` also treats `#` as a line comment (and Function/Scan refuses
//     `#[`, the PHP 8 attribute opener);
//   * `cs` also has verbatim strings (@"...");
//   * the hash family is BOUNDARY-sensitive (a `#` opens a comment only at
//     the start of the line or after whitespace): YAML/TOML require it, and
//     it keeps shell `${#var}` and PHP `#[...]` from being corrupted -
//     Python's no-space `x=1#c` is under-stripped, the acceptable direction;
//   * JS/TS/Go/Vue/Svelte have backtick template strings; py/pyi have
//     triple-quoted docstrings - both are STRINGS, never comments.
//
// The shared objects are reused across keys (a table, not 60 copies): the
// scanner treats them as read-only, and one family object is one auditable
// vocabulary.
import type Syntax from "@Interface/Syntax.js";

/** The C family's plain dialect: the slash line token plus the slash-star pair. */
const Slash: Syntax = { Line: ["//"], Open: "/*", Close: "*/" };

/** JS/TS/Go/Vue/Svelte: the slash dialect plus backtick template strings. */
const SlashBacktick: Syntax = { Line: ["//"], Open: "/*", Close: "*/", Backtick: true };

/** C#: the slash dialect plus verbatim strings (@"..."). */
const CSharp: Syntax = { Line: ["//"], Open: "/*", Close: "*/", Verbatim: true };

/** PHP: the slash dialect plus the hash line token. */
const Php: Syntax = { Line: ["//", "#"], Open: "/*", Close: "*/" };

/** `#` with the hash family's boundary rule (YAML/TOML/shell semantics). */
const Hash: Syntax = { Line: ["#"], Boundary: true };

/** `#` + Python triple-quoted docstrings (strings, never comments). */
const Python: Syntax = { Line: ["#"], Triple: true, Boundary: true };

/** `#` + Ruby's full-line =begin/=end block. */
const Ruby: Syntax = { Line: ["#"], Ruby: true, Boundary: true };

/** `--` (SQL). */
const Dash: Syntax = { Line: ["--"] };

/** `--` + Lua's `--[[ ]]` long-comment block. */
const Lua: Syntax = { Line: ["--"], Open: "--[[", Close: "]]" };

/** `--` + Haskell/Elm's `{- -}` block. */
const Haskell: Syntax = { Line: ["--"], Open: "{-", Close: "-}" };

/** `;` (the Lisp family and asm). */
const Semicolon: Syntax = { Line: [";"] };

/** `%` (TeX and the Erlang/MATLAB family). */
const Percent: Syntax = { Line: ["%"] };

/** `<!-- -->` (markup; no line token). */
const Markup: Syntax = { Line: [], Open: "<!--", Close: "-->" };

/** `#` + PowerShell's `<# #>` block. */
const PowerShell: Syntax = { Line: ["#"], Open: "<#", Close: "#>" };

/** extension -> comment/string vocabulary (lowercased keys). */
const Table: Record<string, Syntax> = {
	// The C family and its lookalikes.
	ts: SlashBacktick,
	tsx: SlashBacktick,
	mts: SlashBacktick,
	cts: SlashBacktick,
	js: SlashBacktick,
	jsx: SlashBacktick,
	mjs: SlashBacktick,
	cjs: SlashBacktick,
	c: Slash,
	h: Slash,
	cc: Slash,
	cpp: Slash,
	cxx: Slash,
	hpp: Slash,
	hh: Slash,
	cs: CSharp,
	java: Slash,
	kt: Slash,
	kts: Slash,
	swift: Slash,
	go: SlashBacktick,
	rs: Slash,
	scala: Slash,
	php: Php,
	dart: Slash,
	css: Slash,
	scss: Slash,
	sass: Slash,
	less: Slash,
	proto: Slash,
	groovy: Slash,
	gradle: Slash,
	vue: SlashBacktick,
	svelte: SlashBacktick,
	zig: Slash,
	// The hash family.
	py: Python,
	pyi: Python,
	rb: Ruby,
	sh: Hash,
	bash: Hash,
	zsh: Hash,
	fish: Hash,
	pl: Hash,
	pm: Hash,
	r: Hash,
	yml: Hash,
	yaml: Hash,
	toml: Hash,
	ini: Hash,
	cfg: Hash,
	conf: Hash,
	tf: Hash,
	hcl: Hash,
	nix: Hash,
	cmake: Hash,
	// The dash family.
	sql: Dash,
	lua: Lua,
	hs: Haskell,
	elm: Haskell,
	// The semicolon family.
	lisp: Semicolon,
	clj: Semicolon,
	cljs: Semicolon,
	scm: Semicolon,
	asm: Semicolon,
	// The percent family.
	tex: Percent,
	erl: Percent,
	hrl: Percent,
	matlab: Percent,
	// Markup.
	html: Markup,
	htm: Markup,
	xml: Markup,
	svg: Markup,
	xsl: Markup,
	plist: Markup,
	// PowerShell.
	ps1: PowerShell,
};

export default (Path: string): Syntax | undefined => {
	// The extension: everything after the LAST dot, when that dot follows the
	// last path separator (a dotfile such as `.gitignore` has no extension -
	// and therefore no vocabulary, so it passes by identity).
	const Dot = Path.lastIndexOf(".");
	const Separator = Math.max(Path.lastIndexOf("/"), Path.lastIndexOf("\\"));
	switch (true) {
		case Dot < 0:
		case Dot <= Separator:
			return undefined;
	}
	return Table[Path.slice(Dot + 1).toLowerCase()];
};
