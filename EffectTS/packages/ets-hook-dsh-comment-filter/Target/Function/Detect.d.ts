/**
 * @module Detect
 *
 * The extension -> Syntax table (a Variable-style lookup behind a
 * Function-shaped leaf: one default export, one table, one rule).
 *
 * @remarks
 * The strip transform asks Detect for the file's comment/string vocabulary;
 * an UNKNOWN extension returns `undefined`, and Function/Strip then keeps
 * the text block BY IDENTITY - never strip what cannot be parsed. `md`,
 * `mdx`, `json` and `txt` are deliberately ABSENT: prose and data files have
 * no code comments to remove (a `//` in a markdown code fence or a JSON
 * string is content).
 *
 * The families mirror the mission's table exactly:
 * - The slash family (line token `//`, block opener slash-star, closer
 *   star-slash) - ts,tsx,mts,cts,js,jsx,mjs,cjs,c,h,cc,cpp,cxx,hpp,hh,cs,
 *   java,kt,kts,swift,go,rs,scala,php,dart,css,scss,sass,less,proto,groovy,
 *   gradle,vue,svelte,zig.
 * - `#` - py,pyi,rb,sh,bash,zsh,fish,pl,pm,r,yml,yaml,toml,ini,cfg,conf,tf,
 *   hcl,nix,cmake.
 * - `--` - sql; `--` with the `--[[` and `]]` block - lua; `--` with the
 *   `{-` and `-}` block - hs,elm.
 * - `;` - lisp,clj,cljs,scm,asm.
 * - `%` - tex,erl,hrl,matlab.
 * - `<!--` and `-->` - html,htm,xml,svg,xsl,plist.
 * - `#` plus the `<#` and `#>` block - ps1.
 *
 * Family-specific refinements (documented where they matter):
 * - `rb` also has the full-line =begin/=end block.
 * - `php` also treats `#` as a line comment (and Function/Scan refuses `#[`,
 *   the PHP 8 attribute opener).
 * - `cs` also has verbatim strings (`@"..."`).
 * - The hash family is BOUNDARY-sensitive (a `#` opens a comment only at the
 *   start of the line or after whitespace): YAML/TOML require it, and it
 *   keeps shell `${#var}` and PHP `#[...]` from being corrupted - Python's
 *   no-space `x=1#c` is under-stripped, the acceptable direction.
 * - JS/TS/Go/Vue/Svelte have backtick template strings; py/pyi have
 *   triple-quoted docstrings - both are STRINGS, never comments.
 *
 * The shared objects are reused across keys (a table, not 60 copies): the
 * scanner treats them as read-only, and one family object is one auditable
 * vocabulary.
 */
import type Syntax from "../Interface/Syntax.js";
export default _default;
declare function _default(Path: string): Syntax | undefined;
