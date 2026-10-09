// Replace — the THIN DELEGATE: the hook-dsh-normalize-dash's own name for the CORE's generic
// class→string replacer, pinned to its table. The pattern (and the whole
// Replace mechanism: the function replacer, the per-call regex
// construction, the `{ text, count }` contract) lives in
// @playform/hook-dsh-core's Normalize/Replace + Normalize/Dashes; this file
// supplies only the two arguments that make it THE NORMALIZE-DASH: the Dashes class
// (the dash pattern verbatim) and the configured ASCII hyphen-minus
// replacement.
//
// The core resolves through the profile's node_modules link (the package is
// installed as a directory link there); the behavior is byte-identical to
// the previous in-file implementation — the hook-dsh-normalize-dash smoke is the arbiter.
import { Replace, Dashes } from "@playform/hook-dsh-core";

export default (Text: string, Replacement: string): { text: string; count: number } =>
	Replace(Text, Dashes, Replacement);
