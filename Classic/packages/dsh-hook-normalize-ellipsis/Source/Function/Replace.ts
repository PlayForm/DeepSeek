// Replace — the THIN DELEGATE: the ellipsis hook's own name for the CORE's
// generic class→string replacer, pinned to its table. The mechanism (the
// function replacer, the per-call regex construction, the `{ text, count }`
// contract) lives in @playform/hook-dsh-core's Normalize/Replace; this file
// supplies only the two arguments that make it THE ELLIPSIS FLAVOR: the
// Ellipsis class (the one-member U+2026 horizontal ellipsis class) and the
// configured replacement (default the ASCII "..." three-dot sequence).
//
// The core resolves through the profile's node_modules link (the package is
// installed as a directory link there); the flavor is a table plus a
// closure, not a fork of the dispatch.
import { Replace, Ellipsis } from "@playform/hook-dsh-core";

export default (Text: string, Replacement: string): { text: string; count: number } =>
	Replace(Text, Ellipsis, Replacement);
