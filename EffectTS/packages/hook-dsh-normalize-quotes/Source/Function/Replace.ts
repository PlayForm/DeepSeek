// Replace — the THIN DELEGATE: the quotes hook's own name for the CORE's
// generic char→char map replacer, pinned to its table. The mechanism (the
// per-call regex built from the mapping's keys as code-point escapes, the
// function replacer, the `{ text, count }` contract) lives in
// @playform/hook-dsh-core's Normalize/ReplaceMap; this file supplies only
// the one argument that makes it THE QUOTES FLAVOR: the Quotes map (the
// eight typographic quote code points — single U+2018–U+201B, double
// U+201C–U+201F — mapped to their ASCII straight counterparts ' and ").
//
// The core resolves through the profile's node_modules link (the package is
// installed as a directory link there); the flavor is a table plus a
// closure, not a fork of the dispatch.
import { ReplaceMap, Quotes } from "@playform/hook-dsh-core";

export default (Text: string): { text: string; count: number } => ReplaceMap(Text, Quotes);
