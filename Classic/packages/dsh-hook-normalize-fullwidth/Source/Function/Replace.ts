// Replace — the THIN DELEGATE: the fullwidth hook's own name for the CORE's
// generic char→char map replacer, pinned to its table. The mechanism (the
// per-call regex built from the mapping's keys as code-point escapes, the
// function replacer, the `{ text, count }` contract) lives in
// @playform/hook-dsh-core's Normalize/ReplaceMap; this file supplies only
// the one argument that makes it THE FULLWIDTH FLAVOR: the Fullwidth map
// (the entire FULLWIDTH FORMS range U+FF01–U+FF5E mapped to its ASCII
// counterparts U+0021–U+007E — the standard fullwidth-to-halfwidth mapping).
//
// The core resolves through the profile's node_modules link (the package is
// installed as a directory link there); the flavor is a table plus a
// closure, not a fork of the dispatch.
import { ReplaceMap, Fullwidth } from "@playform/hook-dsh-core";

export default (Text: string): { text: string; count: number } => ReplaceMap(Text, Fullwidth);
