# Per-Language Annotation and Machine-Readable Cost Comments

> Decision: per-file inference-cost attribution needs annotation formats that a parser can read
> without executing the file, and these sources fix the exact seams: Rust turns `///`, `/**`, `//!`,
> and `/*!` comments into `#[doc="..."]` and `#![doc="..."]` attributes, so a Rust doc comment is a
> first-class AST node keyed to the item that follows it; Python docstrings are the first string
> statement of a module, function, class, or method and live at runtime in `__doc__`, with attribute
> and additional docstrings extractable only by tools; TypeScript parses a closed list of JSDoc tags
> in .js files for type information, and only the documentation tags (`@deprecated`, `@see`,
> `@link`) survive in .ts files. These in-file syntaxes give the plugin stable anchor points
> (comment attach points, docstring position rules) but no cost fields; the interchange shapes do:
> RFC 4180 fixes the CSV table (CRLF records, comma-separated fields, quoted escaping, optional
> header line) for a cost ledger, and RFC 3339 fixes the timestamp grammar
> (`date-time = full-date "T" full-time`, fractional seconds, `Z` or `+HH:MM` offset, leap second
> 60, `-00:00` for unknown offset) for when a cost was recorded. The SPDX 2.3 package-information
> page, the one source that would have supplied a standardized tag/value header field vocabulary,
> blocked the fetcher twice and is unverified here.

## Sources

- Rust Reference: Comments - https://doc.rust-lang.org/reference/comments.html -
  Reference/Raw/rust-reference-comments.md
- TypeScript Handbook: JSDoc Reference -
  https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html -
  Reference/Raw/typescript-jsdoc-supported-types.md
- PEP 257 - Docstring Conventions - https://peps.python.org/pep-0257/ -
  Reference/Raw/python-pep-0257.md
- RFC 4180: Common Format and MIME Type for CSV Files - https://www.rfc-editor.org/rfc/rfc4180 -
  Reference/Raw/rfc-editor-rfc4180.md
- RFC 3339: Date and Time on the Internet: Timestamps - https://www.rfc-editor.org/rfc/rfc3339 -
  Reference/Raw/rfc-editor-rfc3339.md
- SPDX 2.3 Specification: Package Information -
  https://spdx.github.io/spdx-spec/v2.3/package-information/ - (no Raw file: fetch exited 5 twice,
  see Open questions)

## What the sources establish

1. Rust non-doc comments follow C++ style (`//` line, `/* */` block, block comments nest) and are
   interpreted as whitespace, so they carry no runtime or AST meaning.
   (https://doc.rust-lang.org/reference/comments.html)
2. Rust doc comments are attributes: `///` (exactly three slashes) and `/** ... */` are outer doc
   comments equivalent to `#[doc="..."]` (`/// Foo` becomes `#[doc=" Foo"]`), and must appear before
   something that accepts an outer attribute; `//!` and `/*! ... */` are inner doc comments
   equivalent to `#![doc="..."]` that apply to the parent item, usually the module occupying the
   source file. (https://doc.rust-lang.org/reference/comments.html)
3. Rust doc comments conventionally contain Markdown for rustdoc, but the comment syntax does not
   respect internal Markdown: a block doc comment ends at the first `*/`; `U+000D` (CR) is not
   allowed in doc comments; a fourth slash (`////`) or third asterisk (`/***`) demotes the comment
   back to a plain comment. (https://doc.rust-lang.org/reference/comments.html)
4. TypeScript reads JSDoc annotations to provide type information in JavaScript files; any tag not
   explicitly listed (such as `@async`) is not supported, and only documentation tags are supported
   in TypeScript files while the rest are JavaScript-only.
   (https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
5. The supported TypeScript JSDoc surface is: Types `@param` (`@arg`, `@argument`), `@returns`
   (`@return`), `@type`, `@import`, `@typedef`, `@callback`, `@template`, `@satisfies`; Classes
   `@public`, `@private`, `@protected`, `@readonly`, `@extends` (`@augments`), `@class`
   (`@constructor`), `@override`, `@implements`, `@this`; Documentation (works in both .ts and .js)
   `@deprecated`, `@see`, `@link`.
   (https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
6. `@param` takes `{type}` plus a name with three optionality spellings: `{string=}p2` (Google
   Closure), `[p3]` (JSDoc square brackets), and `[p4="test"]` (default value); `@returns{...}` and
   `@return{...}` are interchangeable.
   (https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
7. `/** @deprecated */` is surfaced by editors in completion lists and as a suggestion diagnostic
   (strike-through in VS Code), making it the one machine-acted-upon comment tag in the set.
   (https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
8. TypeScript ignores unsupported JSDoc tags; `@memberof`, `@yields`, and `@member` have open
   issues; legacy JSDoc types are remapped (`String` to `string`, `Number` to `number`, `Boolean` to
   `boolean`, `Void` to `void`, `Undefined` to `undefined`, `Null` to `null`, `function` to
   `Function`, `array` to `Array<any>`, `promise` to `Promise<any>`, `Object` and `object` to `any`;
   the last four turn off under `noImplicitAny: true`).
   (https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
9. A Python docstring is a string literal occurring as the first statement in a module, function,
   class, or method definition and becomes that object's `__doc__` special attribute; string
   literals right after a top-level simple assignment ("attribute docstrings") or right after
   another docstring ("additional docstrings") are not assigned to `__doc__` and are extractable
   only by software tools. (https://peps.python.org/pep-0257/)
10. PEP 257 mandates `"""triple double quotes"""` (with an `r` prefix when the docstring contains
    backslashes); one-liners keep closing quotes on the same line with no blank line before or
    after, end in a period, and prescribe the effect as a command rather than reiterating the
    signature; multi-line docstrings are a summary line, a blank line, then the description, with
    the summary line usable by automatic indexing tools. (https://peps.python.org/pep-0257/)
11. Multi-line docstrings put closing quotes on a line by themselves unless the whole docstring fits
    on one line; processing tools strip a uniform indentation from lines after the first equal to
    the minimum indentation of non-blank following lines, ignore first-line indentation, and trim
    leading and trailing blank lines. (https://peps.python.org/pep-0257/)
12. RFC 4180: each record sits on its own line delimited by CRLF, the last record's CRLF is
    optional, an optional header line uses the same format and field count as records, and header
    presence is signaled by the optional MIME `header` parameter with values `present` or `absent`.
    (https://www.rfc-editor.org/rfc/rfc4180)
13. RFC 4180: fields are comma-separated with the same field count on every line, spaces are part of
    a field and must not be ignored, fields containing CRLF, double quotes, or commas are enclosed
    in double quotes, and an embedded double quote is escaped by doubling it.
    (https://www.rfc-editor.org/rfc/rfc4180)
14. RFC 4180 registers MIME type `text/csv` with optional parameters `charset` and `header`; it
    defines column names (via the optional header) but no column types, units, or required fields.
    (https://www.rfc-editor.org/rfc/rfc4180)
15. RFC 3339 section 5.6 defines the Internet date/time profile of ISO 8601:
    `date-time = full-date "T" full-time` with the grammar quoted in the extracts below; "T" and "Z"
    may be lowercase but generated timestamps SHOULD use uppercase, and a space separator between
    date and time is allowed when applications agree. (https://www.rfc-editor.org/rfc/rfc3339)
16. RFC 3339 bounds: month 01-12, day per the month table (February 28, leap year 29), hour 00-23,
    minute 00-59, second 00-58/00-59/00-60 under leap second rules (60 only at the end of June or
    December), and optional fractional seconds as `.` followed by one or more digits.
    (https://www.rfc-editor.org/rfc/rfc3339)
17. RFC 3339 section 4.3: an offset of `-00:00` means the UTC time is known but the local offset is
    unknown, which differs semantically from `Z` or `+00:00`.
    (https://www.rfc-editor.org/rfc/rfc3339)

## Extracts that matter

### Rust doc comment to attribute mapping (https://doc.rust-lang.org/reference/comments.html)

```
Line doc comments beginning with exactly three slashes (///), and block doc
comments (/** ... */), both outer doc comments, are interpreted as a special
syntax for doc attributes. That is, they are equivalent to writing
#[doc="..."] around the body of the comment, i.e., /// Foo turns into
#[doc=" Foo"] and /** Bar */ turns into #[doc=" Bar "].
Line comments beginning with //! and block comments /*! ... */ are doc
comments that apply to the parent of the comment, rather than the item that
follows. That is, they are equivalent to writing #![doc="..."] around the
body of the comment.
```

### TypeScript supported JSDoc tags, condensed from page headings (https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

```
Types:        @param (@arg, @argument), @returns (@return), @type, @import,
              @typedef, @callback, @template, @satisfies
Classes:      @public, @private, @protected, @readonly, @extends (@augments),
              @class (@constructor), @override, @implements, @this
Documentation @deprecated, @see, @link   [work in both TypeScript and JS]
Param forms:  @param{string}p1 | {string=}p2 | [p3] | [p4="test"]
Unsupported:  any unlisted tag (such as @async); @memberof #7237,
              @yields #23857, @member #56674
```

### PEP 257 docstring definition and shape (https://peps.python.org/pep-0257/)

```
A docstring is a string literal that occurs as the first statement in a
module, function, class, or method definition. Such a docstring becomes the
__doc__ special attribute of that object.
For consistency, always use """triple double quotes""" around docstrings.
Use r"""raw triple double quotes""" if you use any backslashes in your
docstrings.
Multi-line docstrings consist of a summary line just like a one-line
docstring, followed by a blank line, followed by a more elaborate
description. The summary line may be used by automatic indexing tools.
```

### RFC 4180 ABNF (https://www.rfc-editor.org/rfc/rfc4180)

```
file    = [header CRLF] record *(CRLF record) [CRLF]
header  = name *(COMMA name)
record  = field *(COMMA field)
name    = field
field   = (escaped / non-escaped)
escaped = DQUOTE *(TEXTDATA / COMMA / CR / LF / 2DQUOTE) DQUOTE
non-escaped = *TEXTDATA
COMMA = %x2C      CR = %x0D      LF = %x0A
DQUOTE = %x22     CRLF = CR LF
TEXTDATA = %x20-21 / %x23-2B / %x2D-7E
```

### RFC 3339 date-time grammar (https://www.rfc-editor.org/rfc/rfc3339)

```
date-fullyear  = 4DIGIT
date-month     = 2DIGIT  ; 01-12
time-hour      = 2DIGIT  ; 00-23
time-minute    = 2DIGIT  ; 00-59
time-second    = 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second rules
time-secfrac   = "." 1*DIGIT
time-numoffset = ("+" / "-") time-hour ":" time-minute
time-offset    = "Z" / time-numoffset
partial-time   = time-hour ":" time-minute ":" time-second [time-secfrac]
full-date      = date-fullyear "-" date-month "-" date-mday
full-time      = partial-time time-offset
date-time      = full-date "T" full-time
```

## Open questions

- The SPDX 2.3 package-information page failed both fetch attempts (exit 5, anti-bot structural
  block: minimal_text, no_content_elements, script_heavy_shell, 1849 bytes, 0 visible chars), so its
  tag/value field vocabulary (the model for machine-readable file headers such as
  SPDX-License-Identifier) is unverified in this note; re-fetch through an alternate host or the
  spec's plain-text distribution before citing any SPDX field name.
- None of the five fetched sources defines a cost, token-count, or price field; they supply
  container syntaxes only, so the plugin must define its own annotation keys (which key names, which
  units) and the sources do not settle whether cost metadata belongs in doc comments, SPDX-style
  headers, or a sidecar CSV ledger.
- RFC 4180 gives columns no types or units, and the `header` parameter is the only in-band signal
  that a first line is a header; a cost ledger in CSV must fix its own column contract outside the
  RFC.
- Rust block doc comments terminate at the first `*/` and disallow `U+000D`, so any machine-readable
  payload embedded in a block doc comment must avoid those sequences; nothing in the source reserves
  a machine-readable key namespace inside doc comments.
- TypeScript's `@deprecated` carries free text only; the docs specify no structured value schema (no
  since-version, no replacement field).
- RFC 3339 permits lowercase `t`/`z` and, by prior agreement, a space separator; a cost ledger that
  compares timestamps lexically must normalize case and separator first, and the `-00:00`
  unknown-offset marker must be preserved rather than rewritten to `+00:00`.
